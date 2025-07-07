import { useState, useEffect } from "react";
import { useTheme } from "../../contexts/ThemeContext";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";
import {
  Shield,
  UserPlus,
  Lock,
  Trash,
  ChevronDown,
  ChevronUp,
  Edit,
} from "lucide-react";
import axios from "axios";
import { API } from "../../utils/api";

interface Admin {
  id: string;
  name: string;
  email: string;
  role: "admin" | "super_admin";
  access: string[] | null;
}

const SecurityManager = () => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const { addToast } = useToast();
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"add" | "edit" | null>(null);
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);
  const [expandedAdminId, setExpandedAdminId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "admin" as "admin" | "super_admin",
    access: [] as string[],
  });
  const [formErrors, setFormErrors] = useState<{
    name?: string;
    email?: string;
    role?: string;
    access?: string;
  }>({});
  const [loading, setLoading] = useState(false);

  const accessOptions = ["files", "payments", "users", "plans", "qr", "links"];

  // Fetch admins
  useEffect(() => {
    if (user?.role !== "super_admin") return;

    const fetchAdmins = async () => {
      setLoading(true);
      try {
        const response = await axios.get(API.SUPER_ADMIN.GET_ADMINS, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("bliic_token")}`,
          },
        });
                setAdmins(
          (response.data as Admin[]).map((admin) => ({
            ...admin,
            access: normalizeAccess(admin.access),
          }))
        );
      } catch (error: any) {
        addToast("Erreur lors du chargement des admins.", "error");
        console.error("Fetch admins error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAdmins();
  }, [user, addToast]);

  const validateForm = () => {
    const errors: {
      name?: string;
      email?: string;
      role?: string;
      access?: string;
    } = {};
    let isValid = true;

    if (!formData.name) {
      errors.name = "Le nom est requis";
      isValid = false;
    }
    if (!formData.email) {
      errors.email = "L’e-mail est requis";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "L’e-mail est invalide";
      isValid = false;
    }
    if (!formData.role) {
      errors.role = "Le rôle est requis";
      isValid = false;
    }
    if (formData.role === "admin" && formData.access.length === 0) {
      errors.access = "Sélectionnez au moins un accès";
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleAddAdmin = async () => {
  if (!validateForm()) {
    Object.values(formErrors).forEach((error) => addToast(error, "error"));
    return;
  }

  setLoading(true);
  try {
    const response = await axios.post(
      API.SUPER_ADMIN.STORE_ADMIN,
      {
        name: formData.name,
        email: formData.email,
        role: formData.role,
        access: formData.role === "admin" ? formData.access : undefined,
      },
      {
        headers: { Authorization: `Bearer ${localStorage.getItem("bliic_token")}` },
      }
    );
    const data = response.data as { user: Admin; message: string };
    setAdmins([...admins, { ...data.user, access: data.user.access || [] }]);
    addToast(data.message, "success");
    setFormData({ name: "", email: "", role: "admin", access: [] });
    setModalOpen(false);
    setModalType(null);
    setFormErrors({});
  } catch (error: any) {
    const message =
      error?.response?.data?.message || "Erreur lors de l’ajout de l’admin.";
    addToast(message, "error");
    setFormErrors({ email: message });
  } finally {
    setLoading(false);
  }
};

  const handleUpdateAdmin = async () => {
  if (!validateForm() || !selectedAdmin) {
    Object.values(formErrors).forEach((error) => addToast(error, "error"));
    return;
  }

  setLoading(true);
  try {
    const response = await axios.put(
      `${API.SUPER_ADMIN.UPDATE_ADMIN}/${selectedAdmin.id}`,
      {
        name: formData.name,
        email: formData.email,
        role: formData.role,
        access: formData.role === "admin" ? formData.access : undefined,
      },
      {
        headers: { Authorization: `Bearer ${localStorage.getItem("bliic_token")}` },
      }
    );
    const data = response.data as { user: Admin; message: string };
    setAdmins(
      admins.map((admin) =>
        admin.id === selectedAdmin.id ? { ...data.user, access: data.user.access || [] } : admin
      )
    );
    addToast(data.message, "success");
    setFormData({ name: "", email: "", role: "admin", access: [] });
    setModalOpen(false);
    setModalType(null);
    setSelectedAdmin(null);
    setFormErrors({});
  } catch (error: any) {
    const message =
      error?.response?.data?.message || "Erreur lors de la mise à jour de l’admin.";
    addToast(message, "error");
    setFormErrors({ email: message });
  } finally {
    setLoading(false);
  }
};

  const handleDeleteAdmin = async (id: string) => {
    setLoading(true);
    try {
      await axios.delete(`${API.SUPER_ADMIN.DELETE_ADMIN}/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("bliic_token")}`,
        },
      });
      setAdmins((prev) => prev.filter((admin) => admin.id !== id));
      addToast("Admin supprimé avec succès.", "success");
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        "Erreur lors de la suppression de l’admin.";
      addToast(message, "error");
    } finally {
      setLoading(false);
    }
  };

    const normalizeAccess = (access: unknown): string[] => {
    if (Array.isArray(access)) {
      return access.map((a) => (typeof a === "string" ? a : String(a)));
    }
    if (typeof access === "string" && access.length > 0) {
      try {
        // Si c'est du JSON valide (ex: '["users","files"]')
        const parsed = JSON.parse(access);
        if (Array.isArray(parsed)) {
          return parsed.map((a) => (typeof a === "string" ? a : String(a)));
        }
      } catch {
        // Sinon, on considère que c'est une CSV (ex: "users,files")
        return access.split(",").map((a) => a.trim());
      }
    }
    return [];
  };
  const openEditModal = (admin: Admin) => {
    setSelectedAdmin(admin);
    setFormData({
      name: admin.name,
      email: admin.email,
      role: admin.role,
      access: normalizeAccess(admin.access),
    });
    setModalType("edit");
    setModalOpen(true);
  };

  if (user?.role !== "super_admin") {
    return (
      <div
        className={`flex justify-center items-center h-screen font-sans ${
          theme === "dark"
            ? "text-dark-text-primary"
            : "text-light-text-primary"
        }`}
      >
        Accès réservé aux super-admins.
      </div>
    );
  }

  return (
    <div className="space-y-6 px-4 sm:px-6 lg:px-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1
          className={`text-2xl sm:text-3xl font-bold tracking-tight font-sans ${
            theme === "dark" ? "text-dark-primary" : "text-light-primary"
          }`}
        >
          Sécurité et Gestion des Rôles
        </h1>
        <button
          onClick={() => {
            setFormData({ name: "", email: "", role: "admin", access: [] });
            setModalType("add");
            setModalOpen(true);
          }}
          disabled={loading}
          className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-sans text-sm sm:text-base bg-dark-primary text-dark-text-primary hover:bg-dark-secondary transition-all duration-300 animate-pulse hover:animate-none disabled:opacity-50 disabled:cursor-not-allowed ${
            theme === "light"
              ? "bg-light-primary text-light-text-primary hover:bg-light-secondary"
              : ""
          }`}
        >
          <UserPlus size={16} className="inline mr-2" />
          Ajouter un Admin
        </button>
      </div>

      {/* Admins Table */}
      <div
        className={`rounded-xl overflow-hidden border border-dark-primary/30 ${
          theme === "dark" ? "bg-dark-card" : "bg-light-card"
        } shadow-lg animate-slide-up`}
      >
        {loading ? (
          <div
            className={`flex justify-center items-center py-6 font-sans animate-pulse text-sm sm:text-base ${
              theme === "dark"
                ? "text-dark-text-secondary"
                : "text-light-text-secondary"
            }`}
          >
            Chargement...
          </div>
        ) : admins.length === 0 ? (
          <div
            className={`text-center py-6 text-sm sm:text-base font-sans ${
              theme === "dark"
                ? "text-dark-text-secondary"
                : "text-light-text-secondary"
            }`}
          >
            Aucun admin trouvé
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full divide-y divide-dark-primary/20">
                <thead>
                  <tr
                    className={`${
                      theme === "dark"
                        ? "bg-dark-background/50"
                        : "bg-light-background/50"
                    }`}
                  >
                    <th
                      className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider font-sans ${
                        theme === "dark"
                          ? "text-dark-tertiary"
                          : "text-light-tertiary"
                      }`}
                    >
                      Nom
                    </th>
                    <th
                      className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider font-sans ${
                        theme === "dark"
                          ? "text-dark-tertiary"
                          : "text-light-tertiary"
                      }`}
                    >
                      Email
                    </th>
                    <th
                      className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider font-sans ${
                        theme === "dark"
                          ? "text-dark-tertiary"
                          : "text-light-tertiary"
                      }`}
                    >
                      Rôle
                    </th>
                    <th
                      className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider font-sans ${
                        theme === "dark"
                          ? "text-dark-tertiary"
                          : "text-light-tertiary"
                      }`}
                    >
                      Accès
                    </th>
                    <th
                      className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider font-sans ${
                        theme === "dark"
                          ? "text-dark-tertiary"
                          : "text-light-tertiary"
                      }`}
                    >
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-primary/20">
                  {admins.map((admin) => (
                    <tr
                      key={admin.id}
                      className={`${
                        theme === "dark"
                          ? "bg-dark-background/30"
                          : "bg-light-background/30"
                      } hover:bg-dark-primary/10 transition-all animate-slide-up ${
                        theme === "light" ? "hover:bg-light-primary/10" : ""
                      }`}
                    >
                      <td
                        className={`px-6 py-4 max-w-[150px] truncate font-sans text-sm ${
                          theme === "dark"
                            ? "text-dark-text-primary"
                            : "text-light-text-primary"
                        }`}
                        title={admin.name}
                      >
                        {admin.name}
                      </td>
                      <td
                        className={`px-6 py-4 max-w-[200px] truncate font-sans text-sm ${
                          theme === "dark"
                            ? "text-dark-text-primary"
                            : "text-light-text-primary"
                        }`}
                        title={admin.email}
                      >
                        {admin.email}
                      </td>
                      <td
                        className={`px-6 py-4 whitespace-nowrap font-sans text-sm ${
                          admin.role === "super_admin"
                            ? "text-dark-secondary"
                            : "text-dark-primary"
                        } ${
                          theme === "light"
                            ? admin.role === "super_admin"
                              ? "text-light-secondary"
                              : "text-light-primary"
                            : ""
                        }`}
                      >
                        {admin.role === "super_admin" ? "Super-Admin" : "Admin"}
                      </td>
                      <td
                        className={`px-6 py-4 font-sans text-sm ${
                          theme === "dark"
                            ? "text-dark-text-primary"
                            : "text-light-text-primary"
                        }`}
                      >
                        {admin.role === "super_admin" ||
                        !Array.isArray(admin.access) ? (
                          <span className="inline-block px-2 py-1 rounded bg-green-600 text-white text-xs font-semibold">
                            Tous les accès
                          </span>
                        ) : admin.access.length > 0 ? (
                          admin.access.map((a) => (
                            <span
                              key={a}
                              className={`inline-block px-2 py-1 mr-1 mb-1 rounded text-xs font-semibold ${
                                theme === "dark"
                                  ? "bg-dark-primary/20 text-dark-primary"
                                  : "bg-light-primary/20 text-light-primary"
                              }`}
                            >
                              {a.charAt(0).toUpperCase() + a.slice(1)}
                            </span>
                          ))
                        ) : (
                          <span className="inline-block px-2 py-1 rounded bg-red-500 text-white text-xs font-semibold">
                            Aucun
                          </span>
                        )}
                      </td>
                      <td
                        className={`px-6 py-4 font-sans text-sm flex gap-2 ${
                          theme === "dark"
                            ? "text-dark-text-primary"
                            : "text-light-text-primary"
                        }`}
                      >
                        <button
                          onClick={() => openEditModal(admin)}
                          disabled={loading}
                          className={`p-2 rounded hover:bg-dark-primary/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                            theme === "light" ? "hover:bg-light-primary/20" : ""
                          }`}
                          title="Modifier l'admin"
                        >
                          <Edit size={16} className="text-dark-primary" />
                        </button>
                        <button
                          onClick={() => handleDeleteAdmin(admin.id)}
                          disabled={loading}
                          className={`p-2 rounded hover:bg-dark-danger/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                            theme === "light" ? "hover:bg-light-danger/20" : ""
                          }`}
                          title="Supprimer l'admin"
                        >
                          <Trash size={16} className="text-dark-danger" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card Layout */}
            <div className="md:hidden space-y-4 p-4">
              {admins.map((admin) => (
                <div
                  key={admin.id}
                  className={`rounded-lg border border-dark-primary/30 p-4 ${
                    theme === "dark"
                      ? "bg-dark-background/30"
                      : "bg-light-background/30"
                  } shadow animate-slide-up`}
                >
                  <div
                    className="flex justify-between items-center cursor-pointer"
                    onClick={() =>
                      setExpandedAdminId(
                        expandedAdminId === admin.id ? null : admin.id
                      )
                    }
                  >
                    <div>
                      <p
                        className={`font-medium font-sans text-sm truncate max-w-[200px] ${
                          theme === "dark"
                            ? "text-dark-text-primary"
                            : "text-light-text-primary"
                        }`}
                        title={admin.name}
                      >
                        {admin.name}
                      </p>
                      <p
                        className={`text-xs font-sans truncate max-w-[200px] ${
                          theme === "dark"
                            ? "text-dark-text-secondary"
                            : "text-light-text-secondary"
                        }`}
                        title={admin.email}
                      >
                        {admin.email}
                      </p>
                    </div>
                    {expandedAdminId === admin.id ? (
                      <ChevronUp size={20} />
                    ) : (
                      <ChevronDown size={20} />
                    )}
                  </div>
                  {expandedAdminId === admin.id && (
                    <div className="mt-4 space-y-2 text-sm">
                      <div className="grid grid-cols-2 gap-2">
                        <span
                          className={`font-medium font-sans ${
                            theme === "dark"
                              ? "text-dark-text-secondary"
                              : "text-light-text-secondary"
                          }`}
                        >
                          Rôle:
                        </span>
                        <span
                          className={`font-sans ${
                            admin.role === "super_admin"
                              ? "text-dark-secondary"
                              : "text-dark-primary"
                          } ${
                            theme === "light"
                              ? admin.role === "super_admin"
                                ? "text-light-secondary"
                                : "text-light-primary"
                              : ""
                          }`}
                        >
                          {admin.role === "super_admin"
                            ? "Super-Admin"
                            : "Admin"}
                        </span>
                        <span
                          className={`font-medium font-sans ${
                            theme === "dark"
                              ? "text-dark-text-secondary"
                              : "text-light-text-secondary"
                          }`}
                        >
                          Accès:
                        </span>
                        <span className="font-sans">
                          {admin.role === "super_admin" ||
                          !Array.isArray(admin.access) ? (
                            <span className="inline-block px-2 py-1 rounded bg-green-600 text-white text-xs font-semibold">
                              Tous les accès
                            </span>
                          ) : admin.access.length > 0 ? (
                            admin.access.map((a) => (
                              <span
                                key={a}
                                className={`inline-block px-2 py-1 mr-1 mb-1 rounded text-xs font-semibold ${
                                  theme === "dark"
                                    ? "bg-dark-primary/20 text-dark-primary"
                                    : "bg-light-primary/20 text-light-primary"
                                }`}
                              >
                                {a.charAt(0).toUpperCase() + a.slice(1)}
                              </span>
                            ))
                          ) : (
                            <span className="inline-block px-2 py-1 rounded bg-red-500 text-white text-xs font-semibold">
                              Aucun
                            </span>
                          )}
                        </span>
                      </div>
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openEditModal(admin)}
                          disabled={loading}
                          className={`p-2 rounded hover:bg-dark-primary/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                            theme === "light" ? "hover:bg-light-primary/20" : ""
                          }`}
                          title="Modifier un Admin"
                        >
                          <Edit size={16} className="text-dark-primary" />
                        </button>
                        <button
                          onClick={() => handleDeleteAdmin(admin.id)}
                          disabled={loading}
                          className={`p-2 rounded hover:bg-dark-danger/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                            theme === "light" ? "hover:bg-dark-danger/20" : ""
                          }`}
                          title="Supprimer l’admin"
                        >
                          <Trash size={16} className="text-dark-danger" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Admin Modal */}
      {modalOpen && modalType && (
  <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 animate-fade-in">
    <div
      className={`p-4 sm:p-6 rounded-xl w-11/12 max-w-sm border border-dark-primary/50 ${
        theme === "dark" ? "bg-dark-card" : "bg-light-card"
      } shadow-lg animate-slide-up`}
    >
      <h2
        className={`text-lg sm:text-xl font-semibold mb-3 sm:mb-4 font-sans ${
          theme === "dark" ? "text-dark-primary" : "text-light-primary"
        }`}
      >
        {modalType === "add" ? "Ajouter un Admin" : "Modifier un Admin"}
      </h2>
      <div className="space-y-4">
        <div>
          <label
            className={`block text-sm font-medium font-sans ${
              theme === "dark" ? "text-dark-text-secondary" : "text-light-text-secondary"
            }`}
          >
            Nom
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className={`w-full px-4 py-2 rounded-lg border font-sans text-sm ${
              formErrors.name ? "border-dark-danger" : "border-dark-primary/50"
            } ${
              theme === "dark"
                ? "bg-dark-background/50 text-dark-text-primary placeholder-dark-text-secondary"
                : "bg-light-background/50 text-light-text-primary placeholder-light-text-secondary"
            } focus:outline-none focus:ring-2 focus:ring-dark-primary transition-all disabled:bg-gray-200 disabled:cursor-not-allowed ${
              theme === "light" ? "focus:ring-light-primary" : ""
            }`}
            placeholder="Entrez le nom"
            disabled={loading}
          />
          {formErrors.name && (
            <p
              className={`text-xs mt-1 font-sans ${
                theme === "dark" ? "text-dark-danger" : "text-light-danger"
              }`}
            >
              {formErrors.name}
            </p>
          )}
        </div>
        <div>
          <label
            className={`block text-sm font-medium font-sans ${
              theme === "dark" ? "text-dark-text-secondary" : "text-light-text-secondary"
            }`}
          >
            Email
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className={`w-full px-4 py-2 rounded-lg border font-sans text-sm ${
              formErrors.email ? "border-dark-danger" : "border-dark-primary/50"
            } ${
              theme === "dark"
                ? "bg-dark-background/50 text-dark-text-primary placeholder-dark-text-secondary"
                : "bg-light-background/50 text-light-text-primary placeholder-light-text-secondary"
            } focus:outline-none focus:ring-2 focus:ring-dark-primary transition-all disabled:bg-gray-200 disabled:cursor-not-allowed ${
              theme === "light" ? "focus:ring-light-primary" : ""
            }`}
            placeholder="Entrez l’email"
            disabled={loading}
          />
          {formErrors.email && (
            <p
              className={`text-xs mt-1 font-sans ${
                theme === "dark" ? "text-dark-danger" : "text-light-danger"
              }`}
            >
              {formErrors.email}
            </p>
          )}
        </div>
        <div>
          <label
            className={`block text-sm font-medium font-sans ${
              theme === "dark" ? "text-dark-text-secondary" : "text-light-text-secondary"
            }`}
          >
            Rôle
          </label>
          <select
            value={formData.role}
            onChange={(e) =>
              setFormData({
                ...formData,
                role: e.target.value as "admin" | "super_admin",
                access: e.target.value === "super_admin" ? accessOptions : formData.access,
              })
            }
            className={`w-full px-4 py-2 rounded-lg border font-sans text-sm ${
              formErrors.role ? "border-dark-danger" : "border-dark-primary/50"
            } ${
              theme === "dark"
                ? "bg-dark-background/50 text-dark-text-primary"
                : "bg-light-background/50 text-light-text-primary"
            } focus:outline-none focus:ring-2 focus:ring-dark-primary transition-all disabled:bg-gray-200 disabled:cursor-not-allowed ${
              theme === "light" ? "focus:ring-light-primary" : ""
            }`}
            disabled={loading}
          >
            <option value="admin">Admin</option>
            <option value="super_admin">Super-Admin</option>
          </select>
          {formErrors.role && (
            <p
              className={`text-xs mt-1 font-sans ${
                theme === "dark" ? "text-dark-danger" : "text-light-danger"
              }`}
            >
              {formErrors.role}
            </p>
          )}
        </div>
        {formData.role === "admin" && (
          <div>
            <label
              className={`block text-sm font-medium font-sans ${
                theme === "dark" ? "text-dark-text-secondary" : "text-light-text-secondary"
              }`}
            >
              Accès
            </label>
            <div className="grid grid-cols-2 gap-2 sm:gap-4 mt-2">
              {accessOptions.map((option) => (
                <label key={option} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.access.includes(option)}
                    onChange={(e) => {
                      const newAccess = e.target.checked
                        ? [...formData.access, option]
                        : formData.access.filter((a) => a !== option);
                      setFormData({ ...formData, access: newAccess });
                    }}
                    className={`h-4 w-4 font-sans text-dark-primary focus:ring-dark-primary border-gray-300 rounded disabled:cursor-not-allowed ${
                      theme === "light" ? "text-light-primary focus:ring-light-primary" : ""
                    }`}
                    disabled={loading}
                  />
                  <span
                    className={`text-xs sm:text-sm capitalize font-sans ${
                      theme === "dark" ? "text-dark-text-secondary" : "text-light-text-secondary"
                    }`}
                  >
                    {option}
                  </span>
                </label>
              ))}
            </div>
            {formErrors.access && (
              <p
                className={`text-xs mt-1 font-sans ${
                  theme === "dark" ? "text-dark-danger" : "text-light-danger"
                }`}
              >
                {formErrors.access}
              </p>
            )}
          </div>
        )}
        <div className="flex gap-2 sm:gap-3 justify-end">
          <button
            onClick={() => {
              setModalOpen(false);
              setModalType(null);
              setFormData({ name: "", email: "", role: "admin", access: [] });
              setFormErrors({});
              setSelectedAdmin(null);
            }}
            disabled={loading}
            className={`px-3 sm:px-4 py-2 rounded-lg font-sans text-sm sm:text-base ${
              theme === "dark"
                ? "bg-dark-background/50 text-dark-text-secondary hover:bg-dark-background/70"
                : "bg-light-background/50 text-light-text-secondary hover:bg-light-background/70"
            } transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            Annuler
          </button>
          <button
            onClick={modalType === "add" ? handleAddAdmin : handleUpdateAdmin}
            disabled={loading}
            className={`px-3 sm:px-4 py-2 rounded-lg font-sans text-sm sm:text-base bg-dark-primary text-dark-text-primary hover:bg-dark-secondary transition-all animate-pulse hover:animate-none disabled:opacity-50 disabled:cursor-not-allowed ${
              theme === "light"
                ? "bg-light-primary text-light-text-primary hover:bg-light-secondary"
                : ""
            }`}
          >
            {loading
              ? modalType === "add"
                ? "Ajout en cours..."
                : "Mise à jour..."
              : modalType === "add"
              ? "Ajouter"
              : "Enregistrer"}
          </button>
        </div>
      </div>
    </div>
  </div>
)}
    </div>
  );
};

export default SecurityManager;
