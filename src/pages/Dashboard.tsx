import { useState, useEffect } from "react";
import { Routes, Route, Link, useLocation } from "react-router-dom";
import {
  Menu,
  X,
  Home,
  Link as LinkIcon,
  QrCode,
  FileBox,
  CreditCard,
  User,
  ChevronRight,
  LogOut,
  Sun,
  Moon,
  BarChart2,
  Users,
  Package,
  Shield,
  Mail,
  BookOpen,
  Globe,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import DashboardHome from "../components/dashboard/DashboardHome";
import AdminHome from "../components/dashboard/AdminHome";
import LinksManager from "../components/dashboard/LinksManager";
import QRGenerator from "../components/dashboard/QRGenerator";
import FileManager from "../components/dashboard/FileManager";
import Subscription from "../components/dashboard/Subscription";
import Profile from "../components/dashboard/Profile";
import { API } from "../utils/api";
import FileStatsPage from "../components/dashboard/FileStatsPage";
import QRStatsPage from "../components/dashboard/QRStatsPage";
import LinkStats from "../components/dashboard/LinkStats";
import UserManager from "../components/dashboard/UserManager";
import AdminLinksManager from "../components/dashboard/AdminLinksManager";
import AdminQrManager from "../components/dashboard/AdminQrManager";
import AdminFileManager from "../components/dashboard/AdminFileManager";
import AdminTransactionManager from "../components/dashboard/AdminTransactionManager";
import AdminPlanManager from "../components/dashboard/AdminPlanManager";
import SecurityManager from "../components/dashboard/SecurityManager";
import MailManager from "../components/dashboard/MailManager";
import logoImage from "../assets/bliic.png";
import logo2Image from "../assets/Bliic 2.png";
import ApiDocumentation from "../components/dashboard/ApiDocumentation";
import CustomDomainsManager from "../components/dashboard/CustomDomainsManager";

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
    | undefined;
  token: string;
}

const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout, refreshUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  // Rafraîchir les données utilisateur à chaque changement de page
  // useEffect(() => {
  //   if (user?.token) {
  //     refreshUser();
  //   }
  // }, [location.pathname, refreshUser, user?.token]); // Dépendance à location.pathname pour détecter les changements de page

  // Navigation pour les utilisateurs normaux
  const userNavigation = [
    { name: "Dashboard", href: "/dashboard", icon: Home },
    { name: "Liens", href: "/dashboard/links", icon: LinkIcon },
    { name: "QR Codes", href: "/dashboard/qr", icon: QrCode },
    { name: "Fichiers", href: "/dashboard/files", icon: FileBox },
    { name: "Abonnements", href: "/dashboard/subscription", icon: CreditCard },
    { name: "Profil", href: "/dashboard/profile", icon: User },
    { name: "API Documentation", href: "/dashboard/api-docs", icon: BookOpen },
    ...(user?.plan === "premium" ||
    user?.plan === "premium_quarterly" ||
    user?.plan === "premium_annual" ||
    user?.plan === "enterprise" ||
    (user?.access as { trial_status?: string })?.trial_status === "active"
      ? [
          {
            name: "Domaines Personnalisés",
            href: "/dashboard/custom-domains",
            icon: Globe,
          },
        ]
      : []),
  ];

  // Options de navigation admin avec correspondance aux permissions
  const adminNavigationOptions = [
    {
      name: "Tableau de bord Admin",
      href: "/dashboard",
      icon: BarChart2,
      permission: null,
    },
    {
      name: "Utilisateurs",
      href: "/dashboard/users",
      icon: Users,
      permission: "users",
    },
    {
      name: "Liens",
      href: "/dashboard/admin-links",
      icon: LinkIcon,
      permission: "links",
    },
    {
      name: "QR Codes",
      href: "/dashboard/admin-qr",
      icon: QrCode,
      permission: "qr",
    },
    {
      name: "Fichiers",
      href: "/dashboard/admin-files",
      icon: FileBox,
      permission: "files",
    },
    {
      name: "Transactions",
      href: "/dashboard/transactions",
      icon: CreditCard,
      permission: "payments",
    },
    {
      name: "Plans",
      href: "/dashboard/plans",
      icon: Package,
      permission: "plans",
    },
    {
      name: "Mails",
      href: "/dashboard/mails",
      icon: Mail,
      permission: "mails",
    },
    {
      name: "Sécurité",
      href: "/dashboard/security",
      icon: Shield,
      permission: "security",
    },
    {
      name: "API Documentation",
      href: "/dashboard/api-docs",
      icon: BookOpen,
      permission: null,
    },
  ];

  // Options de routes admin avec correspondance aux permissions
  const adminRoutesOptions = [
    { path: "users", element: <UserManager />, permission: "users" },
    {
      path: "admin-links",
      element: <AdminLinksManager />,
      permission: "links",
    },
    { path: "admin-qr", element: <AdminQrManager />, permission: "qr" },
    { path: "admin-files", element: <AdminFileManager />, permission: "files" },
    {
      path: "transactions",
      element: <AdminTransactionManager />,
      permission: "payments",
    },
    { path: "plans", element: <AdminPlanManager />, permission: "plans" },
    { path: "mails", element: <MailManager />, permission: "mails" },
    { path: "security", element: <SecurityManager />, permission: "security" },
  ];

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
          console.error("Erreur lors du parsing de access:", e);
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

  // Déterminer la navigation en fonction du rôle
  const navigation =
    user?.role === "super_admin" || user?.role === "admin"
      ? adminNavigation
      : userNavigation;

  // Déterminer l'affichage du plan
  const displayPlan = (): string => {
    if (!user) return "N/A";
    if (user.role === "super_admin") return "Super Admin";
    if (user.role === "admin") return "Admin";
    if (
      user.plan === "free" &&
      (user.access as { trial_status?: string })?.trial_status === "active"
    ) {
      return "Premium (Essai)";
    }
    return user.plan &&
      ["premium", "premium_quarterly", "premium_annual", "enterprise"].includes(
        user.plan
      )
      ? "Premium"
      : user.plan
      ? user.plan.charAt(0).toUpperCase() + user.plan.slice(1)
      : "N/A";
  };

  // Logs de débogage
  console.log("User:", {
    role: user?.role,
    access: user?.access,
    plan: user?.plan,
    trial_status: (user?.access as { trial_status?: string })?.trial_status,
  });
  console.log(
    "Navigation:",
    navigation.map((item) => ({
      name: item.name,
      href: item.href,
    }))
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
            {navigation.map((item) => {
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
                  {user?.name || "Utilisateur"}
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
            <div className="px-4 mt-2">
              <div className="flex items-center">
                <div
                  className={`text-xs font-medium uppercase tracking-wider ${
                    theme === "dark"
                      ? "text-dark-text-secondary"
                      : "text-light-text-secondary"
                  }`}
                >
                  Plan actuel
                </div>
                <span
                  className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${
                    theme === "dark"
                      ? "bg-dark-primary/20 text-dark-primary"
                      : "bg-light-primary/20 text-light-primary"
                  }`}
                >
                  {displayPlan()}
                </span>
              </div>
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
            <Route
              index
              element={
                ["admin", "super_admin"].includes(user?.role ?? "") ? (
                  <AdminHome />
                ) : (
                  <DashboardHome />
                )
              }
            />
            <Route path="links" element={<LinksManager />} />
            <Route path="qr" element={<QRGenerator />} />
            <Route path="files" element={<FileManager />} />
            <Route path="subscription" element={<Subscription />} />
            <Route path="profile" element={<Profile />} />
            <Route path="files/:id/stats" element={<FileStatsPage />} />
            <Route
              path="qr/:shortCode/qr-statistics"
              element={<QRStatsPage />}
            />
            <Route path="links/:linkId/stats" element={<LinkStats />} />
            <Route path="api-docs" element={<ApiDocumentation />} />
            {["admin", "super_admin"].includes(user?.role ?? "") &&
              accessibleAdminRoutes.map((route) => (
                <Route
                  key={route.path}
                  path={route.path}
                  element={route.element}
                />
              ))}
            <Route
              path="custom-domains"
              element={
                user?.plan === "premium" ||
                user?.plan === "premium_quarterly" ||
                user?.plan === "premium_annual" ||
                user?.plan === "enterprise" ||
                (user?.access as { trial_status?: string })?.trial_status ===
                  "active" ? (
                  <CustomDomainsManager />
                ) : (
                  <div
                    className={`flex justify-center items-center h-screen font-sans ${
                      theme === "dark"
                        ? "text-dark-text-primary"
                        : "text-light-text-primary"
                    }`}
                  >
                    Cette fonctionnalité est réservée aux plans Premium et
                    Enterprise.
                  </div>
                )
              }
            />
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

export default Dashboard;
