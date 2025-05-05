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
  plan: "free" | "premium" | "enterprise";
}

interface UserWithToken extends User {
  token: string;
}

interface AuthContextType {
  user: UserWithToken | null;
  setUser: (user: UserWithToken | null) => void;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
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
    const storedUser = localStorage.getItem('blinkoo_user');
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      setUser(parsed);
      axios.defaults.headers.common['Authorization'] = `Bearer ${parsed.token}`;
    }
    setLoading(false);
  }, []);
  

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
      const userData: UserWithToken = { ...user, token: access_token };
      

      setUser(userData);
      localStorage.setItem("blinkoo_user", JSON.stringify(userData));
      localStorage.setItem("blinkoo_token", access_token);
      console.log("token", user);
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
    localStorage.removeItem("blinkoo_user");
  };

  const value = {
    user,
    setUser,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
