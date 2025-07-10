import { useState } from "react";
import { Routes, Route, Link, useLocation } from "react-router-dom";
import {
  Menu,
  X,
  BarChart2,
  Users,
  Link as LinkIcon,
  QrCode,
  FileBox,
  CreditCard,
  Package,
  Mail,
  Shield,
  BookOpen,
  Sun,
  Moon,
  ChevronRight,
  LogOut,
  BookA,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import AdminHome from "../components/dashboard/AdminHome";
import UserManager from "../components/dashboard/UserManager";
import AdminLinksManager from "../components/dashboard/AdminLinksManager";
import AdminQrManager from "../components/dashboard/AdminQrManager";
import AdminFileManager from "../components/dashboard/AdminFileManager";
import AdminTransactionManager from "../components/dashboard/AdminTransactionManager";
import AdminPlanManager from "../components/dashboard/AdminPlanManager";
import SecurityManager from "../components/dashboard/SecurityManager";
import MailManager from "../components/dashboard/MailManager";
import ApiDocumentation from "../components/dashboard/ApiDocumentation";
import logoImage from "../assets/bliic.png";
import logo2Image from "../assets/Bliic 2.png";
import AdminPostsManager from "../components/dashboard/AdminPostsManager";

const adminNavigationOptions = [
  {
    name: "Tableau de bord Admin",
    href: "/admin/dashboard",
    icon: BarChart2,
    permission: null,
  },
  {
    name: "Utilisateurs",
    href: "/admin/users",
    icon: Users,
    permission: "users",
  },
  {
    name: "Liens",
    href: "/admin/admin-links",
    icon: LinkIcon,
    permission: "links",
  },
  {
    name: "QR Codes",
    href: "/admin/admin-qr",
    icon: QrCode,
    permission: "qr",
  },
  {
    name: "Fichiers",
    href: "/admin/admin-files",
    icon: FileBox,
    permission: "files",
  },
  {
    name: "Transactions",
    href: "/admin/transactions",
    icon: CreditCard,
    permission: "payments",
  },
  {
    name: "Plans",
    href: "/admin/plans",
    icon: Package,
    permission: "plans",
  },
  {
    name: "Mails",
    href: "/admin/mails",
    icon: Mail,
    permission: "mails",
  },
  {
    name: "Posts",
    href: "/admin/posts",
    icon: BookA,
    permission: "posts",
  },
  {
    name: "Sécurité",
    href: "/admin/security",
    icon: Shield,
    permission: "security",
  },
  
];

const adminRoutesOptions = [
  { path: "users", element: <UserManager />, permission: "users" },
  { path: "admin-links", element: <AdminLinksManager />, permission: "links" },
  { path: "admin-qr", element: <AdminQrManager />, permission: "qr" },
  { path: "admin-files", element: <AdminFileManager />, permission: "files" },
  {
    path: "transactions",
    element: <AdminTransactionManager />,
    permission: "payments",
  },
  { path: "plans", element: <AdminPlanManager />, permission: "plans" },
  { path: "mails", element: <MailManager />, permission: "mails" },
  { path: "posts", element: <AdminPostsManager />, permission: "posts" },
  { path: "security", element: <SecurityManager />, permission: "security" },
];

const AdminDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, loading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  if (loading) {
    return (
      <div
        className={`flex justify-center items-center h-screen font-sans ${
          theme === "dark"
            ? "text-dark-text-primary"
            : "text-light-text-primary"
        }`}
      >
        Chargement...
      </div>
    );
  }

  if (!user || (user.role !== "admin" && user.role !== "super_admin")) {
    return (
      <div
        className={`flex justify-center items-center h-screen font-sans ${
          theme === "dark"
            ? "text-dark-text-primary"
            : "text-light-text-primary"
        }`}
      >
        Accès non autorisé ou page introuvable.
      </div>
    );
  }

  const logout = () => {
    localStorage.removeItem("bliic_user");
    localStorage.removeItem("bliic_token");
    window.location.href = "/admin/login";
  };

  // Fonction pour vérifier si l'utilisateur a la permission
  const hasPermission = (permission: string | null): boolean => {
    if (!permission) return true;
    if (!user || !user.access) return false;
    if (user.role === "super_admin") return true;
    if (user.role === "admin") {
      let permissions: string[] = [];
      if (typeof user.access === "string") {
        try {
          const parsedAccess = JSON.parse(user.access);
          if (Array.isArray(parsedAccess)) {
            permissions = parsedAccess;
          } else if (parsedAccess && typeof parsedAccess === "object") {
            permissions = (parsedAccess as any).permissions || [];
          }
        } catch (e) {
          permissions = [];
        }
      } else if (typeof user.access === "object" && user.access !== null) {
        permissions = (user.access as any).permissions || [];
      } else if (Array.isArray(user.access)) {
        permissions = user.access;
      }
      return permissions.includes(permission);
    }
    return false;
  };

  // Filtrer la navigation admin en fonction des permissions
  const adminNavigation = adminNavigationOptions.filter((item) =>
    hasPermission(item.permission)
  );

  // Filtrer les routes admin en fonction des permissions
  const accessibleAdminRoutes = adminRoutesOptions.filter((route) =>
    hasPermission(route.permission)
  );

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen" data-theme={theme}>
      {/* Mobile menu button */}
      <button
        className={`fixed top-4 left-4 z-50 md:hidden ${
          theme === "dark"
            ? "bg-dark-card text-dark-text-primary"
            : "bg-light-card text-light-text-primary"
        } p-2 rounded-lg`}
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div
            className={`p-6 ${
              theme === "dark" ? "border-gray-800" : "border-gray-200"
            }`}
          >
            <Link to="/" className="flex items-center">
              <img
                src={theme === "dark" ? logo2Image : logoImage}
                alt="Bliic"
                style={{ width: "70px" }}
              />
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 pt-6 space-y-4">
            {adminNavigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                    isActive(item.href)
                      ? theme === "dark"
                        ? "bg-dark-primary text-white"
                        : "bg-light-primary text-white"
                      : theme === "dark"
                      ? "text-dark-text-primary hover:bg-dark-card/60"
                      : "text-light-text-primary hover:bg-light-card/60"
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon
                    size={20}
                    className={`mr-3 ${
                      isActive(item.href)
                        ? "text-white"
                        : theme === "dark"
                        ? "text-dark-secondary"
                        : "text-light-secondary"
                    }`}
                  />
                  <span>{item.name}</span>
                  {isActive(item.href) && (
                    <ChevronRight size={16} className="ml-auto text-white" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User section */}
          <div
            className={`p-4 ${
              theme === "dark"
                ? "border-t border-gray-800"
                : "border-t border-gray-200"
            }`}
          >
            <div className="flex items-center px-4 py-3">
              <div className="flex-1 min-w-0">
                <p
                  className={`text-sm font-medium truncate ${
                    theme === "dark"
                      ? "text-dark-text-primary"
                      : "text-light-text-primary"
                  }`}
                >
                  {user?.name || "Admin"}
                </p>
                <p
                  className={`text-xs ${
                    theme === "dark"
                      ? "text-dark-text-secondary"
                      : "text-light-text-secondary"
                  } truncate`}
                >
                  {user?.email || "N/A"}
                </p>
              </div>
              <button
                onClick={logout}
                className={`ml-2 p-2 ${
                  theme === "dark"
                    ? "text-dark-secondary hover:text-dark-tertiary"
                    : "text-light-secondary hover:text-light-tertiary"
                } rounded-lg transition-colors`}
                title="Déconnexion"
              >
                <LogOut size={20} />
              </button>
            </div>
            <div className="px-4 mt-4">
              <button
                onClick={toggleTheme}
                className={`flex items-center w-full px-4 py-3 rounded-lg transition-colors ${
                  theme === "dark"
                    ? "text-dark-text-primary hover:bg-dark-card/60"
                    : "text-light-text-primary hover:bg-light-card/60"
                }`}
                title={
                  theme === "dark"
                    ? "Passer au thème clair"
                    : "Passer au thème sombre"
                }
              >
                {theme === "dark" ? (
                  <Sun size={20} className="mr-3 text-dark-secondary" />
                ) : (
                  <Moon size={20} className="mr-3 text-light-secondary" />
                )}
                <span>{theme === "dark" ? "Thème clair" : "Thème sombre"}</span>
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="md:ml-64 min-h-screen">
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
          <Routes>
            <Route path="dashboard" element={<AdminHome />} />
            {accessibleAdminRoutes.map((route) => (
              <Route
                key={route.path}
                path={route.path}
                element={route.element}
              />
            ))}
            
            <Route
              path="*"
              element={
                <div
                  className={`flex justify-center items-center h-screen font-sans ${
                    theme === "dark"
                      ? "text-dark-text-primary"
                      : "text-light-text-primary"
                  }`}
                >
                  Accès non autorisé ou page introuvable.
                </div>
              }
            />
          </Routes>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
