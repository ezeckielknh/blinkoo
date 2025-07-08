import { useState } from "react";
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
  BookOpen,
  Globe,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import DashboardHome from "../components/dashboard/DashboardHome";
import LinksManager from "../components/dashboard/LinksManager";
import QRGenerator from "../components/dashboard/QRGenerator";
import FileManager from "../components/dashboard/FileManager";
import Subscription from "../components/dashboard/Subscription";
import Profile from "../components/dashboard/Profile";
import FileStatsPage from "../components/dashboard/FileStatsPage";
import QRStatsPage from "../components/dashboard/QRStatsPage";
import LinkStats from "../components/dashboard/LinkStats";
import ApiDocumentation from "../components/dashboard/ApiDocumentation";
import CustomDomainsManager from "../components/dashboard/CustomDomainsManager";
import logoImage from "../assets/bliic.png";
import logo2Image from "../assets/Bliic 2.png";

interface User {
  id: string;
  email: string;
  name: string;
  plan: "free" | "premium" | "premium_quarterly" | "premium_annual" | "enterprise";
  access: {
    trial_started_at?: string;
    trial_ends_at?: string;
    trial_status?: "none" | "active" | "expired";
  } | null | undefined;
  token: string;
  renew_plan: number;
}

const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  // Navigation pour les utilisateurs normaux
  const userNavigation = [
    { name: "Dashboard", href: "/dashboard", icon: Home },
    { name: "Liens", href: "/dashboard/links", icon: LinkIcon },
    { name: "QR Codes", href: "/dashboard/qr", icon: QrCode },
    { name: "Fichiers", href: "/dashboard/files", icon: FileBox },
    { name: "Abonnements", href: "/dashboard/subscription", icon: CreditCard },
    { name: "Profil", href: "/dashboard/profile", icon: User },
    { name: "Documentation API", href: "/dashboard/api-docs", icon: BookOpen },
    ...(user?.plan === "premium" ||
    user?.plan === "premium_quarterly" ||
    user?.plan === "premium_annual" ||
    user?.plan === "enterprise" ||
    (user?.access && typeof user.access === "object" && "trial_status" in user.access && user.access.trial_status === "active")
      ? [
          {
            name: "Domaines Personnalisés",
            href: "/dashboard/custom-domains",
            icon: Globe,
          },
        ]
      : []),
  ];

  // Déterminer l'affichage du plan
  const displayPlan = (): string => {
    if (!user) return "N/A";
    if (
      user.plan === "free" &&
      user.access && typeof user.access === "object" && "trial_status" in user.access && user.access.trial_status === "active"
    ) {
      return "Premium (Essai)";
    }
    return user.plan &&
      ["premium", "premium_quarterly", "premium_annual", "enterprise"].includes(
        user.plan
      )
      ? user.plan === "premium"
        ? "Mensuel"
        : user.plan === "premium_quarterly"
        ? "Trimestriel"
        : user.plan === "premium_annual"
        ? "Annuel"
        : "Enterprise"
      : "Découverte";
  };

  // Logs de débogage
  console.log("User:", {
    plan: user?.plan,
    trial_status:
      user?.access && typeof user.access === "object" && "trial_status" in user.access
        ? user.access.trial_status
        : undefined,
  });
  console.log(
    "Navigation:",
    userNavigation.map((item) => ({
      name: item.name,
      href: item.href,
    }))
  );

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen font-sans" data-theme={theme}>
      <style>
        {`
          .sidebar {
            position: fixed;
            top: 0;
            left: -100%;
            width: 256px;
            height: 100%;
            z-index: 40;
            transition: left 0.3s ease-in-out;
            ${theme === "dark" ? "background-color: #1f2937;" : "background-color: #ffffff;"}
          }
          .sidebar.open {
            left: 0;
          }
          @media (min-width: 768px) {
            .sidebar {
              left: 0;
            }
          }
        `}
      </style>

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
            {userNavigation.map((item) => {
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
            <Route index element={<DashboardHome />} />
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
            <Route
              path="custom-domains"
              element={
                user?.plan === "premium" ||
                user?.plan === "premium_quarterly" ||
                user?.plan === "premium_annual" ||
                user?.plan === "enterprise" ||
                (user?.access && typeof user.access === "object" && "trial_status" in user.access && user.access.trial_status === "active") ? (
                  <CustomDomainsManager />
                ) : (
                  <div
                    className={`flex justify-center items-center h-screen font-sans ${
                      theme === "dark"
                        ? "text-dark-text-primary"
                        : "text-light-text-primary"
                    }`}
                  >
                    Cette fonctionnalité est réservée aux plans Premium et Enterprise.
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
                  Page introuvable.
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