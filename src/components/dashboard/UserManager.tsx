
import { useState, useEffect, useMemo, useCallback } from "react";
import { useTheme } from "../../contexts/ThemeContext";
import { useAuth } from "../../contexts/AuthContext";
import { API } from "../../utils/api";
import { Users, Search, Filter, Edit, Key, DollarSign, UserX, UserCheck, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { format } from "date-fns";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import debounce from "lodash.debounce";

interface User {
  id: number;
  name: string;
  email: string;
  plan: "free" | "premium" | "enterprise";
  status: "active" | "inactive" | "pending";
  verified: boolean;
  createdAt: string;
}

interface Filters {
  plan: string;
  status: string;
  verified: string;
}

const UserManager = () => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<Filters>({
    plan: "all",
    status: "all",
    verified: "all",
  });
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [modalType, setModalType] = useState<"edit" | "reset" | "changePlan" | "suspend" | "delete" | null>(null);
  const [expandedUserId, setExpandedUserId] = useState<number | null>(null);

  // Debounced fetch users
  const debouncedFetchUsers = useCallback(
    debounce(async () => {
      if (user?.role !== "admin" && user?.role !== "super_admin") return;
      try {
        setLoading(true);
        setError(null);
        const api = user?.role === "super_admin" ? API.SUPER_ADMIN : API.ADMIN;
        const response = await api.GET_ALL_USERS({});
        const usersData = response.data as any[];
        const transformedUsers = usersData.map((u: any) => ({
          id: u.id,
          name: u.name,
          email: u.email,
          plan: u.plan,
          status: u.status,
          verified: !!u.email_verified_at,
          createdAt: u.created_at,
        }));
        setUsers(transformedUsers);
      } catch (err) {
        console.error("Error fetching users:", err);
        setError("Impossible de charger les utilisateurs. Veuillez réessayer.");
        toast.error("Erreur lors du chargement des utilisateurs.", {
          position: "top-right",
          autoClose: 3000,
          theme: theme === "dark" ? "dark" : "light",
        });
      } finally {
        setLoading(false);
      }
    }, 500),
    [user?.role, theme]
  );

  useEffect(() => {
    debouncedFetchUsers();
    return () => debouncedFetchUsers.cancel();
  }, [debouncedFetchUsers]);

  // Filter and search logic
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPlan = filters.plan === "all" || user.plan === filters.plan;
      const matchesStatus = filters.status === "all" || user.status === filters.status;
      const matchesVerified =
        filters.verified === "all" || (filters.verified === "verified" ? user.verified : !user.verified);
      return matchesSearch && matchesPlan && matchesStatus && matchesVerified;
    });
  }, [users, searchTerm, filters]);

  // Handle admin actions
  const handleEditUser = async (userId: number, updatedData: Partial<User>) => {
    if (user?.role !== "admin" && user?.role !== "super_admin") return;
    try {
      const api = user?.role === "super_admin" ? API.SUPER_ADMIN : API.ADMIN;
      await api.UPDATE_USER(userId, { name: updatedData.name ?? "", email: updatedData.email ?? "" });
      setUsers(users.map((u) => (u.id === userId ? { ...u, ...updatedData } : u)));
      toast.success("Utilisateur mis à jour avec succès.", {
        position: "top-right",
        autoClose: 3000,
        theme: theme === "dark" ? "dark" : "light",
      });
      setModalType(null);
    } catch (err) {
      console.error("Error updating user:", err);
      toast.error("Erreur lors de la mise à jour de l'utilisateur.", {
        position: "top-right",
        autoClose: 3000,
        theme: theme === "dark" ? "dark" : "light",
      });
    }
  };

  const handleResetPassword = (userId: number) => {
    console.log(`Password reset initiated for user ${userId}`);
    alert(`Simulated password reset for user ${userId}`);
    setModalType(null);
  };

  const handleChangePlan = async (userId: number, newPlan: User["plan"]) => {
    if (user?.role !== "admin" && user?.role !== "super_admin") return;
    try {
      const api = user?.role === "super_admin" ? API.SUPER_ADMIN : API.ADMIN;
      await api.CHANGE_PLAN(userId, { plan: newPlan });
      setUsers(users.map((u) => (u.id === userId ? { ...u, plan: newPlan } : u)));
      toast.success("Plan utilisateur mis à jour avec succès.", {
        position: "top-right",
        autoClose: 3000,
        theme: theme === "dark" ? "dark" : "light",
      });
      setModalType(null);
    } catch (err) {
      console.error("Error changing plan:", err);
      toast.error("Erreur lors du changement de plan.", {
        position: "top-right",
        autoClose: 3000,
        theme: theme === "dark" ? "dark" : "light",
      });
    }
  };

  const handleToggleStatus = async (userId: number, currentStatus: User["status"]) => {
    if (user?.role !== "admin" && user?.role !== "super_admin") return;
    const newStatus = currentStatus === "active" ? "inactive" : "active";
    try {
      const api = user?.role === "super_admin" ? API.SUPER_ADMIN : API.ADMIN;
      await api.TOGGLE_STATUS(userId);
      setUsers(users.map((u) => (u.id === userId ? { ...u, status: newStatus } : u)));
      toast.success(`Utilisateur ${newStatus === "active" ? "réactivé" : "suspendu"} avec succès.`, {
        position: "top-right",
        autoClose: 3000,
        theme: theme === "dark" ? "dark" : "light",
      });
      setModalType(null);
    } catch (err) {
      console.error("Error toggling status:", err);
      toast.error("Erreur lors de la mise à jour du statut.", {
        position: "top-right",
        autoClose: 3000,
        theme: theme === "dark" ? "dark" : "light",
      });
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (user?.role !== "admin" && user?.role !== "super_admin") return;
    try {
      const api = user?.role === "super_admin" ? API.SUPER_ADMIN : API.ADMIN;
      await api.DELETE_USER(userId);
      setUsers(users.filter((u) => u.id !== userId));
      toast.success("Utilisateur supprimé avec succès.", {
        position: "top-right",
        autoClose: 3000,
        theme: theme === "dark" ? "dark" : "light",
      });
      setModalType(null);
    } catch (err) {
      console.error("Error deleting user:", err);
      toast.error("Erreur lors de la suppression de l'utilisateur.", {
        position: "top-right",
        autoClose: 3000,
        theme: theme === "dark" ? "dark" : "light",
      });
    }
  };

  if (user?.role !== "admin" && user?.role !== "super_admin") {
    return (
      <div
        className={`flex justify-center items-center h-screen font-sans ${
          theme === "dark" ? "text-dark-text-primary" : "text-light-text-primary"
        }`}
      >
        Accès réservé aux admins et super-admins.
      </div>
    );
  }

  if (loading) {
    return (
      <div
        className={`flex justify-center items-center h-screen font-sans animate-pulse ${
          theme === "dark" ? "text-dark-text-primary" : "text-light-text-primary"
        }`}
      >
        Chargement...
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`flex flex-col justify-center items-center h-screen font-sans ${
          theme === "dark" ? "text-dark-text-primary" : "text-light-text-primary"
        }`}
      >
        <p>{error}</p>
        <button
          onClick={() => debouncedFetchUsers()}
          className={`mt-4 px-4 py-2 rounded-lg font-sans ${
            theme === "dark"
              ? "bg-dark-primary text-dark-text-primary hover:bg-dark-secondary"
              : "bg-light-primary text-light-text-primary hover:bg-light-secondary"
          } transition-all animate-pulse hover:animate-none`}
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 px-4 sm:px-6 lg:px-8 animate-fade-in">
      <ToastContainer />
      <h1
        className={`text-2xl font-bold tracking-tight font-sans ${
          theme === "dark" ? "text-dark-primary" : "text-light-primary"
        }`}
      >
        Gestion des utilisateurs
      </h1>

      {/* Search and Filters */}
      <div
        className={`p-4 sm:p-6 rounded-xl border border-dark-primary/30 ${
          theme === "dark" ? "bg-dark-card" : "bg-light-card"
        } shadow-lg animate-slide-up`}
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          {/* Search */}
          <div className="flex-1 w-full">
            <div className="relative">
              <Search
                size={20}
                className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                  theme === "dark" ? "text-dark-text-secondary" : "text-light-text-secondary"
                }`}
              />
              <input
                type="text"
                placeholder="Rechercher par nom ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 rounded-lg border-none font-sans text-sm sm:text-base ${
                  theme === "dark"
                    ? "bg-dark-background/50 text-dark-text-primary placeholder-dark-text-secondary"
                    : "bg-light-background/50 text-light-text-primary placeholder-light-text-secondary"
                } focus:outline-none focus:ring-2 focus:ring-dark-primary transition-all ${
                  theme === "light" ? "focus:ring-light-primary" : ""
                }`}
              />
            </div>
          </div>
          {/* Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 w-full sm:w-auto">
            <select
              value={filters.plan}
              onChange={(e) => setFilters({ ...filters, plan: e.target.value })}
              className={`w-full px-4 py-2 rounded-lg border-none font-sans text-sm sm:text-base ${
                theme === "dark"
                  ? "bg-dark-background/50 text-dark-text-primary"
                  : "bg-light-background/50 text-light-text-primary"
                } focus:outline-none focus:ring-2 focus:ring-dark-primary transition-all ${
                  theme === "light" ? "focus:ring-light-primary" : ""
                }`}
            >
              <option value="all">Tous les plans</option>
              <option value="free">Gratuit</option>
              <option value="premium">Premium</option>
              <option value="premium_quarterly">Premium trimestriel</option>
              <option value="premium_annual">Premium annuel</option>
              <option value="enterprise">Entreprise</option>
            </select>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className={`w-full px-4 py-2 rounded-lg border-none font-sans text-sm sm:text-base ${
                theme === "dark"
                  ? "bg-dark-background/50 text-dark-text-primary"
                  : "bg-light-background/50 text-light-text-primary"
                } focus:outline-none focus:ring-2 focus:ring-dark-primary transition-all ${
                  theme === "light" ? "focus:ring-light-primary" : ""
                }`}
            >
              <option value="all">Tous les statuts</option>
              <option value="active">Actif</option>
              <option value="inactive">Inactif</option>
              
            </select>
            <select
              value={filters.verified}
              onChange={(e) => setFilters({ ...filters, verified: e.target.value })}
              className={`w-full px-4 py-2 rounded-lg border-none font-sans text-sm sm:text-base ${
                theme === "dark"
                  ? "bg-dark-background/50 text-dark-text-primary"
                  : "bg-light-background/50 text-light-text-primary"
                } focus:outline-none focus:ring-2 focus:ring-dark-primary transition-all ${
                  theme === "light" ? "focus:ring-light-primary" : ""
                }`}
            >
              <option value="all">Tous</option>
              <option value="verified">Vérifié</option>
              <option value="unverified">Non vérifié</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div
        className={`rounded-xl overflow-hidden border border-dark-primary/30 ${
          theme === "dark" ? "bg-dark-card" : "bg-light-card"
        } shadow-lg animate-slide-up`}
      >
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="min-w-full divide-y divide-dark-primary/20">
            <thead>
              <tr
                className={`${
                  theme === "dark" ? "bg-dark-background/50" : "bg-light-background/50"
                }`}
              >
                <th
                  className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider font-sans ${
                    theme === "dark" ? "text-dark-tertiary" : "text-light-tertiary"
                  }`}
                >
                  Nom
                </th>
                <th
                  className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider font-sans ${
                    theme === "dark" ? "text-dark-tertiary" : "text-light-tertiary"
                  }`}
                >
                  Email
                </th>
                <th
                  className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider font-sans ${
                    theme === "dark" ? "text-dark-tertiary" : "text-light-tertiary"
                  }`}
                >
                  Plan
                </th>
                <th
                  className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider font-sans ${
                    theme === "dark" ? "text-dark-tertiary" : "text-light-tertiary"
                  }`}
                >
                  Statut
                </th>
                <th
                  className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider font-sans ${
                    theme === "dark" ? "text-dark-tertiary" : "text-light-tertiary"
                  }`}
                >
                  Vérifié
                </th>
                <th
                  className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider font-sans ${
                    theme === "dark" ? "text-dark-tertiary" : "text-light-tertiary"
                  }`}
                >
                  Inscription
                </th>
                <th
                  className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider font-sans ${
                    theme === "dark" ? "text-dark-tertiary" : "text-light-tertiary"
                  }`}
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-primary/20">
              {filteredUsers.map((user) => (
                <tr
                  key={user.id}
                  className={`${
                    theme === "dark" ? "bg-dark-background/30" : "bg-light-background/30"
                  } hover:bg-dark-primary/10 transition-all animate-slide-up ${
                    theme === "light" ? "hover:bg-light-primary/10" : ""
                  }`}
                >
                  <td
                    className={`px-6 py-4 whitespace-nowrap font-sans text-sm ${
                      theme === "dark" ? "text-dark-text-primary" : "text-light-text-primary"
                    }`}
                  >
                    {user.name}
                  </td>
                  <td
                    className={`px-6 py-4 whitespace-nowrap font-sans text-sm ${
                      theme === "dark" ? "text-dark-text-primary" : "text-light-text-primary"
                    }`}
                  >
                    {user.email}
                  </td>
                  <td
                    className={`px-6 py-4 whitespace-nowrap font-sans text-sm ${
                      theme === "dark" ? "text-dark-text-primary" : "text-light-text-primary"
                    }`}
                  >
                    {user.plan.charAt(0).toUpperCase() + user.plan.slice(1)}
                  </td>
                  <td
                    className={`px-6 py-4 whitespace-nowrap font-sans text-sm ${
                      theme === "dark" ? "text-dark-text-primary" : "text-light-text-primary"
                    }`}
                  >
                    {user.status === "active" ? "Actif" : user.status === "inactive" ? "Inactif" : "En attente"}
                  </td>
                  <td
                    className={`px-6 py-4 whitespace-nowrap font-sans text-sm ${
                      theme === "dark" ? "text-dark-text-primary" : "text-light-text-primary"
                    }`}
                  >
                    {user.verified ? "Oui" : "Non"}
                  </td>
                  <td
                    className={`px-6 py-4 whitespace-nowrap font-sans text-sm ${
                      theme === "dark" ? "text-dark-text-primary" : "text-light-text-primary"
                    }`}
                  >
                    {format(new Date(user.createdAt), "dd/MM/yyyy")}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setModalType("edit");
                        }}
                        className={`p-2 rounded-lg ${
                          theme === "dark"
                            ? "text-dark-text-secondary hover:bg-dark-background/70"
                            : "text-light-text-secondary hover:bg-light-background/70"
                        } transition-all animate-pulse hover:animate-none`}
                        title="Modifier"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setModalType("changePlan");
                        }}
                        className={`p-2 rounded-lg ${
                          theme === "dark"
                            ? "text-dark-text-secondary hover:bg-dark-background/70"
                            : "text-light-text-secondary hover:bg-light-background/70"
                        } transition-all animate-pulse hover:animate-none`}
                        title="Changer plan"
                      >
                        <DollarSign size={16} />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setModalType("suspend");
                        }}
                        className={`p-2 rounded-lg ${
                          theme === "dark"
                            ? "text-dark-text-secondary hover:bg-dark-background/70"
                            : "text-light-text-secondary hover:bg-light-background/70"
                        } transition-all animate-pulse hover:animate-none`}
                        title={user.status === "active" ? "Suspendre" : "Réactiver"}
                      >
                        {user.status === "active" ? <UserX size={16} /> : <UserCheck size={16} />}
                      </button>
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setModalType("delete");
                        }}
                        className={`p-2 rounded-lg ${
                          theme === "dark"
                            ? "text-dark-danger hover:bg-dark-danger/20"
                            : "text-light-danger hover:bg-light-danger/20"
                        } transition-all animate-pulse hover:animate-none`}
                        title="Supprimer"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card Layout */}
        <div className="md:hidden space-y-4 p-4">
          {filteredUsers.map((user) => (
            <div
              key={user.id}
              className={`rounded-lg border border-dark-primary/30 p-4 ${
                theme === "dark" ? "bg-dark-background/30" : "bg-light-background/30"
              } shadow animate-slide-up`}
            >
              <div
                className="flex justify-between items-center cursor-pointer"
                onClick={() => setExpandedUserId(expandedUserId === user.id ? null : user.id)}
              >
                <div>
                  <p
                    className={`font-medium font-sans text-sm ${
                      theme === "dark" ? "text-dark-text-primary" : "text-light-text-primary"
                    }`}
                  >
                    {user.name}
                  </p>
                  <p
                    className={`text-xs font-sans ${
                      theme === "dark" ? "text-dark-text-secondary" : "text-light-text-secondary"
                    }`}
                  >
                    {user.email}
                  </p>
                </div>
                {expandedUserId === user.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </div>
              {expandedUserId === user.id && (
                <div className="mt-4 space-y-2 text-sm">
                  <div className="grid grid-cols-2 gap-2">
                    <span
                      className={`font-medium font-sans ${
                        theme === "dark" ? "text-dark-text-secondary" : "text-light-text-secondary"
                      }`}
                    >
                      Plan:
                    </span>
                    <span
                      className={`font-sans ${
                        theme === "dark" ? "text-dark-text-primary" : "text-light-text-primary"
                      }`}
                    >
                      {user.plan !== "free" ? "Premium" : user.plan.charAt(0).toUpperCase() + user.plan.slice(1)}
                    </span>
                    <span
                      className={`font-medium font-sans ${
                        theme === "dark" ? "text-dark-text-secondary" : "text-light-text-secondary"
                      }`}
                    >
                      Statut:
                    </span>
                    <span
                      className={`font-sans ${
                        theme === "dark" ? "text-dark-text-primary" : "text-light-text-primary"
                      }`}
                    >
                      {user.status === "active" ? "Actif" : user.status === "inactive" ? "Inactif" : "En attente"}
                    </span>
                    <span
                      className={`font-medium font-sans ${
                        theme === "dark" ? "text-dark-text-secondary" : "text-light-text-secondary"
                      }`}
                    >
                      Vérifié:
                    </span>
                    <span
                      className={`font-sans ${
                        theme === "dark" ? "text-dark-text-primary" : "text-light-text-primary"
                      }`}
                    >
                      {user.verified ? "Oui" : "Non"}
                    </span>
                    <span
                      className={`font-medium font-sans ${
                        theme === "dark" ? "text-dark-text-secondary" : "text-light-text-secondary"
                      }`}
                    >
                      Inscription:
                    </span>
                    <span
                      className={`font-sans ${
                        theme === "dark" ? "text-dark-text-primary" : "text-light-text-primary"
                      }`}
                    >
                      {format(new Date(user.createdAt), "dd/MM/yyyy")}
                    </span>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => {
                        setSelectedUser(user);
                        setModalType("edit");
                      }}
                      className={`p-2 rounded-lg ${
                        theme === "dark"
                          ? "text-dark-text-secondary hover:bg-dark-background/70"
                          : "text-light-text-secondary hover:bg-light-background/70"
                      } transition-all animate-pulse hover:animate-none`}
                      title="Modifier"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedUser(user);
                        setModalType("changePlan");
                      }}
                      className={`p-2 rounded-lg ${
                        theme === "dark"
                          ? "text-dark-text-secondary hover:bg-dark-background/70"
                          : "text-light-text-secondary hover:bg-light-background/70"
                      } transition-all animate-pulse hover:animate-none`}
                      title="Changer plan"
                    >
                      <DollarSign size={16} />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedUser(user);
                        setModalType("suspend");
                      }}
                      className={`p-2 rounded-lg ${
                        theme === "dark"
                          ? "text-dark-text-secondary hover:bg-dark-background/70"
                          : "text-light-text-secondary hover:bg-light-background/70"
                      } transition-all animate-pulse hover:animate-none`}
                      title={user.status === "active" ? "Suspendre" : "Réactiver"}
                    >
                      {user.status === "active" ? <UserX size={16} /> : <UserCheck size={16} />}
                    </button>
                    <button
                      onClick={() => {
                        setSelectedUser(user);
                        setModalType("delete");
                      }}
                      className={`p-2 rounded-lg ${
                        theme === "dark"
                          ? "text-dark-danger hover:bg-dark-danger/20"
                          : "text-light-danger hover:bg-light-danger/20"
                      } transition-all animate-pulse hover:animate-none`}
                      title="Supprimer"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Modals */}
      {modalType && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 animate-fade-in">
          <div
            className={`p-4 sm:p-6 rounded-xl w-11/12 max-w-md border border-dark-primary/50 ${
              theme === "dark" ? "bg-dark-card text-dark-text-primary" : "bg-light-card text-light-text-primary"
            } shadow-lg transform transition-all duration-300 animate-slide-up`}
          >
            {modalType === "edit" && (
              <div>
                <h2
                  className={`text-lg font-semibold mb-4 font-sans ${
                    theme === "dark" ? "text-dark-primary" : "text-light-primary"
                  }`}
                >
                  Modifier utilisateur
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium font-sans">Nom</label>
                    <input
                      type="text"
                      defaultValue={selectedUser.name}
                      onChange={(e) =>
                        setSelectedUser({ ...selectedUser, name: e.target.value })
                      }
                      className={`w-full px-4 py-2 rounded-lg border-none font-sans text-sm sm:text-base ${
                        theme === "dark"
                          ? "bg-dark-background/50 text-dark-text-primary placeholder-dark-text-secondary"
                          : "bg-light-background/50 text-light-text-primary placeholder-light-text-secondary"
                      } focus:outline-none focus:ring-2 focus:ring-dark-primary transition-all ${
                        theme === "light" ? "focus:ring-light-primary" : ""
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium font-sans">Email</label>
                    <input
                      type="email"
                      defaultValue={selectedUser.email}
                      onChange={(e) =>
                        setSelectedUser({ ...selectedUser, email: e.target.value })
                      }
                      className={`w-full px-4 py-2 rounded-lg border-none font-sans text-sm sm:text-base ${
                        theme === "dark"
                          ? "bg-dark-background/50 text-dark-text-primary placeholder-dark-text-secondary"
                          : "bg-light-background/50 text-light-text-primary placeholder-light-text-secondary"
                      } focus:outline-none focus:ring-2 focus:ring-dark-primary transition-all ${
                        theme === "light" ? "focus:ring-light-primary" : ""
                      }`}
                    />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => setModalType(null)}
                      className={`px-4 py-2 rounded-lg font-sans text-sm sm:text-base ${
                        theme === "dark"
                          ? "bg-dark-background/50 text-dark-text-secondary hover:bg-dark-background/70"
                          : "bg-light-background/50 text-light-text-secondary hover:bg-light-background/70"
                      } transition-all`}
                    >
                      Annuler
                    </button>
                    <button
                      onClick={() =>
                        handleEditUser(selectedUser.id, {
                          name: selectedUser.name,
                          email: selectedUser.email,
                        })
                      }
                      className={`px-4 py-2 rounded-lg font-sans text-sm sm:text-base ${
                        theme === "dark"
                          ? "bg-dark-primary text-dark-text-primary hover:bg-dark-secondary"
                          : "bg-light-primary text-light-text-primary hover:bg-light-secondary"
                      } transition-all animate-pulse hover:animate-none`}
                    >
                      Sauvegarder
                    </button>
                  </div>
                </div>
              </div>
            )}

            {modalType === "changePlan" && (
              <div>
                <h2
                  className={`text-lg font-semibold mb-4 font-sans ${
                    theme === "dark" ? "text-dark-primary" : "text-light-primary"
                  }`}
                >
                  Changer le plan
                </h2>
                <p className="mb-4 font-sans text-sm sm:text-base">Sélectionnez un nouveau plan pour {selectedUser.email} :</p>
                <select
                  defaultValue={selectedUser.plan}
                  onChange={(e) => handleChangePlan(selectedUser.id, e.target.value as User["plan"])}
                  className={`w-full px-4 py-2 rounded-lg border-none font-sans text-sm sm:text-base ${
                    theme === "dark"
                      ? "bg-dark-background/50 text-dark-text-primary"
                      : "bg-light-background/50 text-light-text-primary"
                  } focus:outline-none focus:ring-2 focus:ring-dark-primary transition-all ${
                    theme === "light" ? "focus:ring-light-primary" : ""
                  }`}
                >
                  <option value="free">Gratuit</option>
                  <option value="premium">Premium</option>
                  <option value="premium_quarterly">Premium Trimestriel</option>
                  <option value="premium_annual">Premium Annuel</option>
                  <option value="enterprise">Entreprise</option>
                </select>
                <div className="flex gap-2 justify-end mt-4">
                  <button
                    onClick={() => setModalType(null)}
                    className={`px-4 py-2 rounded-lg font-sans text-sm sm:text-base ${
                      theme === "dark"
                        ? "bg-dark-background/50 text-dark-text-secondary hover:bg-dark-background/70"
                        : "bg-light-background/50 text-light-text-secondary hover:bg-light-background/70"
                      } transition-all`}
                  >
                    Annuler
                  </button>
                </div>
              </div>
            )}

            {modalType === "suspend" && (
              <div>
                <h2
                  className={`text-lg font-semibold mb-4 font-sans ${
                    theme === "dark" ? "text-dark-primary" : "text-light-primary"
                  }`}
                >
                  {selectedUser.status === "active" ? "Suspendre" : "Réactiver"} utilisateur
                </h2>
                <p className="mb-4 font-sans text-sm sm:text-base">
                  Voulez-vous {selectedUser.status === "active" ? "suspendre" : "réactiver"} le compte de{" "}
                  {selectedUser.email} ?
                </p>
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => setModalType(null)}
                    className={`px-4 py-2 rounded-lg font-sans text-sm sm:text-base ${
                      theme === "dark"
                        ? "bg-dark-background/50 text-dark-text-secondary hover:bg-dark-background/70"
                        : "bg-light-background/50 text-light-text-secondary hover:bg-light-background/70"
                      } transition-all`}
                  >
                    Annuler
                  </button>
                  <button
                    onClick={() => handleToggleStatus(selectedUser.id, selectedUser.status)}
                    className={`px-4 py-2 rounded-lg font-sans text-sm sm:text-base ${
                      theme === "dark"
                        ? "bg-dark-primary text-dark-text-primary hover:bg-dark-secondary"
                        : "bg-light-primary text-light-text-primary hover:bg-light-secondary"
                      } transition-all animate-pulse hover:animate-none`}
                  >
                    Confirmer
                  </button>
                </div>
              </div>
            )}

            {modalType === "delete" && (
              <div>
                <h2
                  className={`text-lg font-semibold mb-4 font-sans ${
                    theme === "dark" ? "text-dark-primary" : "text-light-primary"
                  }`}
                >
                  Supprimer utilisateur
                </h2>
                <p className="mb-4 font-sans text-sm sm:text-base">
                  Voulez-vous supprimer le compte de {user.email} ? Cette action est irréversible.
                </p>
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => setModalType(null)}
                    className={`px-4 py-2 rounded-lg font-sans text-sm sm:text-base ${
                      theme === "dark"
                        ? "text-dark-text-secondary hover:bg-dark-background/70"
                        : "text-light-text-secondary hover:bg-light-background/70"
                      } transition-all `}
                    >
                      Annuler
                    </button>
                    <button
                      onClick={() => handleDeleteUser(selectedUser.id)}
                      className={`px-4 py-2 rounded-lg font-sans text-sm sm:text-base ${
                        theme === "dark"
                          ? "bg-dark-danger text-dark-text-primary hover:bg-dark-danger/80"
                          : "bg-light-danger text-light-text-primary hover:bg-light-danger/80"
                      } transition-all animate-pulse hover:animate-none`}
                    >
                      Supprimer
                    </button>
                  </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManager;