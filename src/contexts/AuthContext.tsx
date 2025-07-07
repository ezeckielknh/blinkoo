import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import axios from "axios";
import { API } from "../utils/api";

interface User {
  id: string;
  email: string;
  name: string;
  plan:
    | "free"
    | "premium"
    | "premium_quarterly"
    | "premium_annual"
    | "enterprise";
  short_links: any[];
  qr_codes: any[];
  file_links: any[];
  role: "user" | "admin" | "super_admin";
  access:
    | string
    | string[]
    | {
        permissions?: string[];
        trial_started_at?: string;
        trial_ends_at?: string;
        trial_status?: "none" | "active" | "expired";
      }
    | null
    | undefined; // Supporte une chaîne JSON, un tableau, ou un objet avec permissions
      subscription_ends_at?: string;
  created_at?: string;
  updated_at?: string;
}

interface UserWithToken extends User {
  token: string;
}

interface AuthContextType {
  user: UserWithToken | null;
  setUser: (user: UserWithToken | null) => void;
  loading: boolean;
  register: (
    name: string,
    email: string,
    password: string,
    password_confirmation: string
  ) => Promise<void>;
  verify: (code: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  isAuthenticated: boolean;
  startTrial: () => Promise<void>;
  getTrialStatus: () => Promise<{
    trial_active: boolean;
    trial_ends_at?: string;
    days_remaining: number;
  }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<UserWithToken | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("bliic_user");
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      setUser({
        ...parsed,
        access: normalizeAccess(parsed.access),
      });
      axios.defaults.headers.common["Authorization"] = `Bearer ${parsed.token}`;
    }
    setLoading(false);
  }, []);

  const register = async (
    name: string,
    email: string,
    password: string,
    password_confirmation: string
  ) => {
    setLoading(true);
    try {
      await axios.post(API.AUTH.REGISTER, {
        name,
        email,
        password,
        password_confirmation,
      });
      localStorage.setItem("Bliic_pending_email", email);
    } catch (error: any) {
      throw new Error(
        error?.response?.data?.error || "Erreur lors de l'inscription."
      );
    } finally {
      setLoading(false);
    }
  };

  interface VerifyResponse {
    access_token: string;
    user: User;
  }

  const verify = async (code: string): Promise<void> => {
    setLoading(true);
    try {
      const email = localStorage.getItem("Bliic_pending_email");
      if (!email) throw new Error("Email non trouvé pour la vérification.");
      const response = await axios.post<VerifyResponse>(API.AUTH.VERIFY, {
        email,
        code: parseInt(code, 10),
      });

      const { access_token, user } = response.data;
      const userData: UserWithToken = {
        ...user,
        access: normalizeAccess(user.access),
        token: access_token,
      };

      setUser(userData);
      localStorage.setItem("bliic_user", JSON.stringify(userData));
      localStorage.setItem("bliic_token", access_token);
      axios.defaults.headers.common["Authorization"] = `Bearer ${access_token}`;
      localStorage.removeItem("Bliic_pending_email");
    } catch (error: any) {
      throw new Error(
        error?.response?.data?.error ||
          "Une erreur est survenue lors de la vérification."
      );
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    setLoading(true);
    interface LoginResponse {
      access_token: string;
      user: User;
    }
    try {
      const response = await axios.post<LoginResponse>(API.AUTH.LOGIN, {
        email,
        password,
      });

      const { access_token, user } = response.data;
      const userData: UserWithToken = {
        ...user,
        access: normalizeAccess(user.access),
        token: access_token,
      };

      setUser(userData);
      localStorage.setItem("bliic_user", JSON.stringify(userData));
      localStorage.setItem("bliic_token", access_token);
      axios.defaults.headers.common["Authorization"] = `Bearer ${access_token}`;
    } catch (error: any) {
      throw new Error(
        error?.response?.data?.error || "Identifiants incorrects."
      );
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("bliic_user");
    localStorage.removeItem("bliic_token");
    delete axios.defaults.headers.common["Authorization"];
  };

  const refreshUser = async () => {
    if (!user?.token) return;
    setLoading(true);
    try {
      const response = await axios.get(API.USERS.GET_USER, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      const data = response.data as { user: Partial<User>; trial_status?: any };
      const apiUser = data.user || {};

      // Ignore les champs dynamiques comme updated_at
      const filteredApiUser = Object.fromEntries(
        Object.entries(apiUser).filter(
          ([key]) => !["updated_at", "last_seen"].includes(key)
        )
      );

      const newUserData: UserWithToken = {
        ...user,
        ...filteredApiUser,
        access: normalizeAccess(filteredApiUser.access ?? user.access),
        short_links: Array.isArray(filteredApiUser.short_links)
          ? filteredApiUser.short_links
          : Array.isArray(user.short_links)
          ? user.short_links
          : [],
        qr_codes: Array.isArray(filteredApiUser.qr_codes)
          ? filteredApiUser.qr_codes
          : Array.isArray(user.qr_codes)
          ? user.qr_codes
          : [],
        file_links: Array.isArray(filteredApiUser.file_links)
          ? filteredApiUser.file_links
          : Array.isArray(user.file_links)
          ? user.file_links
          : [],
        token: user.token,
      };

      const currentUserString = JSON.stringify({
        ...user,
        access: user.access,
        short_links: user.short_links,
        qr_codes: user.qr_codes,
        file_links: user.file_links,
      });
      const newUserString = JSON.stringify({
        ...newUserData,
        access: newUserData.access,
        short_links: newUserData.short_links,
        qr_codes: newUserData.qr_codes,
        file_links: newUserData.file_links,
      });
      if (currentUserString !== newUserString) {
        setUser(newUserData);
        localStorage.setItem("bliic_user", JSON.stringify(newUserData));
        axios.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${newUserData.token}`;
      } else {
        console.log("No changes detected in user data, skipping update");
      }
      console.log("REFRESHED USER DATA", newUserData);
    } catch (error) {
      console.error("Error refreshing user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const startTrial = async () => {
    if (!user) throw new Error("Utilisateur non authentifié.");
    setLoading(true);
    try {
      const response = await axios.post(
        API.USERS.TRIAL_START,
        {},
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      );
      const { trial_ends_at } = response.data as { trial_ends_at: string };
      const updatedUser: UserWithToken = {
        ...user,
        plan: "premium",
        access: {
          ...(user.access as { [key: string]: any }),
          trial_ends_at,
          trial_status: "active",
        },
      };
      setUser(updatedUser);
      localStorage.setItem("bliic_user", JSON.stringify(updatedUser));
    } catch (error: any) {
      throw new Error(
        error?.response?.data?.message ||
          "Erreur lors de l'activation de l'essai."
      );
    } finally {
      setLoading(false);
    }
  };

  const getTrialStatus = async () => {
    if (!user) throw new Error("Utilisateur non authentifié.");
    try {
      const response = await axios.get(API.USERS.TRIAL_STATUS, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      return response.data as {
        trial_active: boolean;
        trial_ends_at?: string;
        days_remaining: number;
      };
    } catch (error: any) {
      throw new Error(
        error?.response?.data?.message ||
          "Erreur lors de la récupération de l'état de l'essai."
      );
    }
  };

  function normalizeAccess(access: unknown): User["access"] {
    if (!access) return { trial_status: "none" }; // Retourne un objet par défaut si access est null/undefined
    if (typeof access === "string" && access.length > 0 && access !== "null") {
      try {
        const parsed = JSON.parse(access);
        if (Array.isArray(parsed)) {
          return { permissions: parsed }; // Conserve les permissions comme tableau
        } else if (parsed && typeof parsed === "object") {
          return {
            permissions: (parsed as any).permissions || [],
            trial_started_at: (parsed as any).trial_started_at || undefined,
            trial_ends_at: (parsed as any).trial_ends_at || undefined,
            trial_status: (parsed as any).trial_status || "none",
          };
        }
      } catch {
        return { trial_status: "none" }; // Fallback si le parsing échoue
      }
    }
    if (Array.isArray(access)) {
      return { permissions: access }; // Conserve les permissions comme tableau
    }
    if (typeof access === "object" && access !== null) {
      return {
        permissions: (access as any).permissions || [],
        trial_started_at: (access as any).trial_started_at || undefined,
        trial_ends_at: (access as any).trial_ends_at || undefined,
        trial_status: (access as any).trial_status || "none",
      };
    }
    return { trial_status: "none" }; // Fallback final
  }

  const value = {
    user,
    setUser,
    loading,
    register,
    verify,
    login,
    logout,
    refreshUser,
    isAuthenticated: !!user,
    startTrial,
    getTrialStatus,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
