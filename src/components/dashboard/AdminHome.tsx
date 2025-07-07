import { useEffect, useState } from "react";
import { useTheme } from "../../contexts/ThemeContext";
import { useAuth } from "../../contexts/AuthContext";
import { API } from "../../utils/api";
import { Users, Link as LinkIcon, QrCode, File, DollarSign, Activity, AlertCircle } from "lucide-react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

ChartJS.register(ArcElement, Tooltip, Legend);

interface AdminStats {
  totalUsers: { free: number; premium: number; enterprise: number; premium_quarterly: number; premium_annual: number };
  totalLinks: number;
  totalLinkRedirects: number;
  totalQRCodes: number;
  totalFiles: number;
  totalDownloads: number;
  totalRevenue: number;
  recentActivity: { user: string; action: string; timestamp: string }[];
  newUsers: { today: number; week: number; month: number };
}

const AdminHome = () => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showTooltip, setShowTooltip] = useState<{ [key: string]: boolean }>({});
  const totalRevenue = Number(stats?.totalRevenue);

  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch((user?.role === "admin" ? API.ADMIN.GET_STATS : API.SUPER_ADMIN.GET_STATS), {
          headers: {
            Authorization: `Bearer ${user?.token}`,
            Accept: "application/json",
          },
        });
        if (!res.ok) throw new Error("Erreur lors du chargement des statistiques");
        const data = await res.json();
        setStats(data);
      } catch (error) {
        console.error("Error fetching admin stats:", error);
        setError("Impossible de charger les statistiques. Veuillez réessayer.");
        toast.error("Erreur lors du chargement des statistiques.", {
          position: "top-right",
          autoClose: 3000,
          theme: theme === "dark" ? "dark" : "light",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAdminStats();
  }, [user?.token, theme]);

  // Pie chart data
  const chartData = {
    labels: ["Gratuit", "Premium", "Premium Trimestriel", "Premium Annuel", "Entreprise"],
    datasets: [
      {
        data: [
          stats?.totalUsers.free ?? 0,
          stats?.totalUsers.premium ?? 0,
          stats?.totalUsers.premium_quarterly ?? 0,
          stats?.totalUsers.premium_annual ?? 0,
          stats?.totalUsers.enterprise ?? 0,
        ],
        backgroundColor: [
          theme === "dark" ? "#eab308" : "#eab308", // Gratuit - Jaune
          theme === "dark" ? "#7c3aed" : "#7c3aed", // Premium - Violet foncé
          theme === "dark" ? "#8b5cf6" : "#8b5cf6", // Premium Trimestriel - Violet clair
          theme === "dark" ? "#a855f7" : "#a855f7", // Premium Annuel - Violet moyen
          theme === "dark" ? "#c084fc" : "#c084fc", // Entreprise - Violet pâle
        ],
        borderColor: theme === "dark" ? "#1f2937" : "#f3f4f6",
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          font: {
            family: "Inter, sans-serif",
          },
          color: theme === "dark" ? "#e5e7eb" : "#1f2937",
        },
      },
      tooltip: {
        backgroundColor: theme === "dark" ? "#0d1117" : "#ffffff",
        titleFont: { family: "Inter, sans-serif" },
        bodyFont: { family: "Inter, sans-serif" },
        bodyColor: theme === "dark" ? "#e5e7eb" : "#1f2937",
        titleColor: theme === "dark" ? "#e5e7eb" : "#1f2937",
      },
    },
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
        className={`flex justify-center items-center h-screen font-sans ${
          theme === "dark" ? "text-dark-text-primary" : "text-light-text-primary"
        }`}
      >
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <ToastContainer />
      <h1
        className={`text-2xl font-bold tracking-tight font-sans ${
          theme === "dark" ? "text-dark-primary" : "text-light-primary"
        }`}
      >
        Tableau de bord Admin
      </h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Total Users */}
        <div
          className={`p-6 rounded-xl border border-dark-primary/30 ${
            theme === "dark" ? "bg-dark-card" : "bg-light-card"
          } shadow-lg animate-slide-up`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Users size={24} className={theme === "dark" ? "text-dark-primary" : "text-light-primary"} />
              <h2
                className={`ml-3 text-lg font-semibold font-sans ${
                  theme === "dark" ? "text-dark-text-primary" : "text-light-text-primary"
                }`}
              >
                Utilisateurs
              </h2>
            </div>
            <div className="relative">
              <AlertCircle
                size={16}
                className="cursor-pointer"
                onMouseEnter={() => setShowTooltip({ ...showTooltip, users: true })}
                onMouseLeave={() => setShowTooltip({ ...showTooltip, users: false })}
              />
              {showTooltip.users && (
                <div
                  className={`absolute right-0 top-6 z-10 p-2 rounded-lg text-sm font-sans ${
                    theme === "dark" ? "bg-dark-background text-dark-text-primary" : "bg-light-background text-light-text-primary"
                  } shadow-md w-48`}
                >
                  Nombre total d'utilisateurs par plan.
                </div>
              )}
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <p className={`font-sans ${theme === "dark" ? "text-dark-text-secondary" : "text-light-text-secondary"}`}>
              Gratuit: {stats?.totalUsers.free ?? 0}
            </p>
            <p className={`font-sans ${theme === "dark" ? "text-dark-text-secondary" : "text-light-text-secondary"}`}>
              Premium: {stats?.totalUsers.premium ?? 0}
            </p>
            <p className={`font-sans ${theme === "dark" ? "text-dark-text-secondary" : "text-light-text-secondary"}`}>
              Premium Trimestriel: {stats?.totalUsers.premium_quarterly ?? 0}
            </p>
            <p className={`font-sans ${theme === "dark" ? "text-dark-text-secondary" : "text-light-text-secondary"}`}>
              Premium Annuel: {stats?.totalUsers.premium_annual ?? 0}
            </p>
            <p className={`font-sans ${theme === "dark" ? "text-dark-text-secondary" : "text-light-text-secondary"}`}>
              Entreprise: {stats?.totalUsers.enterprise ?? 0}
            </p>
          </div>
        </div>

        {/* Links */}
        <div
          className={`p-6 rounded-xl border border-dark-primary/30 ${
            theme === "dark" ? "bg-dark-card" : "bg-light-card"
          } shadow-lg animate-slide-up`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <LinkIcon size={24} className={theme === "dark" ? "text-dark-primary" : "text-light-primary"} />
              <h2
                className={`ml-3 text-lg font-semibold font-sans ${
                  theme === "dark" ? "text-dark-text-primary" : "text-light-text-primary"
                }`}
              >
                Liens
              </h2>
            </div>
            <div className="relative">
              <AlertCircle
                size={16}
                className="cursor-pointer"
                onMouseEnter={() => setShowTooltip({ ...showTooltip, links: true })}
                onMouseLeave={() => setShowTooltip({ ...showTooltip, links: false })}
              />
              {showTooltip.links && (
                <div
                  className={`absolute right-0 top-6 z-10 p-2 rounded-lg text-sm font-sans ${
                    theme === "dark" ? "bg-dark-background text-dark-text-primary" : "bg-light-background text-light-text-primary"
                  } shadow-md w-48`}
                >
                  Nombre total de liens créés et redirections effectuées.
                </div>
              )}
            </div>
          </div>
          <div className="mt-4">
            <p className={`font-sans ${theme === "dark" ? "text-dark-text-secondary" : "text-light-text-secondary"}`}>
              Total créés: {stats?.totalLinks ?? 0}
            </p>
            <p className={`font-sans ${theme === "dark" ? "text-dark-text-secondary" : "text-light-text-secondary"}`}>
              Redirections: {stats?.totalLinkRedirects ?? 0}
            </p>
          </div>
        </div>

        {/* QR Codes */}
        <div
          className={`p-6 rounded-xl border border-dark-primary/30 ${
            theme === "dark" ? "bg-dark-card" : "bg-light-card"
          } shadow-lg animate-slide-up`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <QrCode size={24} className={theme === "dark" ? "text-dark-primary" : "text-light-primary"} />
              <h2
                className={`ml-3 text-lg font-semibold font-sans ${
                  theme === "dark" ? "text-dark-text-primary" : "text-light-text-primary"
                }`}
              >
                QR Codes
              </h2>
            </div>
            <div className="relative">
              <AlertCircle
                size={16}
                className="cursor-pointer"
                onMouseEnter={() => setShowTooltip({ ...showTooltip, qrCodes: true })}
                onMouseLeave={() => setShowTooltip({ ...showTooltip, qrCodes: false })}
              />
              {showTooltip.qrCodes && (
                <div
                  className={`absolute right-0 top-6 z-10 p-2 rounded-lg text-sm font-sans ${
                    theme === "dark" ? "bg-dark-background text-dark-text-primary" : "bg-light-background text-light-text-primary"
                  } shadow-md w-48`}
                >
                  Nombre total de QR codes générés.
                </div>
              )}
            </div>
          </div>
          <div className="mt-4">
            <p className={`font-sans ${theme === "dark" ? "text-dark-text-secondary" : "text-light-text-secondary"}`}>
              Total générés: {stats?.totalQRCodes ?? 0}
            </p>
          </div>
        </div>

        {/* Files */}
        <div
          className={`p-6 rounded-xl border border-dark-primary/30 ${
            theme === "dark" ? "bg-dark-card" : "bg-light-card"
          } shadow-lg animate-slide-up`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <File size={24} className={theme === "dark" ? "text-dark-primary" : "text-light-primary"} />
              <h2
                className={`ml-3 text-lg font-semibold font-sans ${
                  theme === "dark" ? "text-dark-text-primary" : "text-light-text-primary"
                }`}
              >
                Fichiers
              </h2>
            </div>
            <div className="relative">
              <AlertCircle
                size={16}
                className="cursor-pointer"
                onMouseEnter={() => setShowTooltip({ ...showTooltip, files: true })}
                onMouseLeave={() => setShowTooltip({ ...showTooltip, files: false })}
              />
              {showTooltip.files && (
                <div
                  className={`absolute right-0 top-6 z-10 p-2 rounded-lg text-sm font-sans ${
                    theme === "dark" ? "bg-dark-background text-dark-text-primary" : "bg-light-background text-light-text-primary"
                  } shadow-md w-48`}
                >
                  Nombre total de fichiers partagés et téléchargements.
                </div>
              )}
            </div>
          </div>
          <div className="mt-4">
            <p className={`font-sans ${theme === "dark" ? "text-dark-text-secondary" : "text-light-text-secondary"}`}>
              Total partagés: {stats?.totalFiles ?? 0}
            </p>
            <p className={`font-sans ${theme === "dark" ? "text-dark-text-secondary" : "text-light-text-secondary"}`}>
              Téléchargements: {stats?.totalDownloads ?? 0}
            </p>
          </div>
        </div>

        {/* Revenue */}
        <div
          className={`p-6 rounded-xl border border-dark-primary/30 ${
            theme === "dark" ? "bg-dark-card" : "bg-light-card"
          } shadow-lg animate-slide-up`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <DollarSign size={24} className={theme === "dark" ? "text-dark-primary" : "text-light-primary"} />
              <h2
                className={`ml-3 text-lg font-semibold font-sans ${
                  theme === "dark" ? "text-dark-text-primary" : "text-light-text-primary"
                }`}
              >
                Revenus
              </h2>
            </div>
            <div className="relative">
              <AlertCircle
                size={16}
                className="cursor-pointer"
                onMouseEnter={() => setShowTooltip({ ...showTooltip, revenue: true })}
                onMouseLeave={() => setShowTooltip({ ...showTooltip, revenue: false })}
              />
              {showTooltip.revenue && (
                <div
                  className={`absolute right-0 top-6 z-10 p-2 rounded-lg text-sm font-sans ${
                    theme === "dark" ? "bg-dark-background text-dark-text-primary" : "bg-light-background text-light-text-primary"
                  } shadow-md w-48`}
                >
                  Revenus totaux générés par les abonnements (super_admin uniquement).
                </div>
              )}
            </div>
          </div>
          <div className="mt-4">
            
<p className={`font-sans ...`}>
  Total généré: €{!isNaN(totalRevenue) ? totalRevenue.toFixed(2) : "0.00"}
</p>
          </div>
        </div>

        {/* New Users */}
        <div
          className={`p-6 rounded-xl border border-dark-primary/30 ${
            theme === "dark" ? "bg-dark-card" : "bg-light-card"
          } shadow-lg animate-slide-up`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Users size={24} className={theme === "dark" ? "text-dark-primary" : "text-light-primary"} />
              <h2
                className={`ml-3 text-lg font-semibold font-sans ${
                  theme === "dark" ? "text-dark-text-primary" : "text-light-text-primary"
                }`}
              >
                Nouveaux utilisateurs
              </h2>
            </div>
            <div className="relative">
              <AlertCircle
                size={16}
                className="cursor-pointer"
                onMouseEnter={() => setShowTooltip({ ...showTooltip, newUsers: true })}
                onMouseLeave={() => setShowTooltip({ ...showTooltip, newUsers: false })}
              />
              {showTooltip.newUsers && (
                <div
                  className={`absolute right-0 top-6 z-10 p-2 rounded-lg text-sm font-sans ${
                    theme === "dark" ? "bg-dark-background text-dark-text-primary" : "bg-light-background text-light-text-primary"
                  } shadow-md w-48`}
                >
                  Nouveaux utilisateurs inscrits par période.
                </div>
              )}
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <p className={`font-sans ${theme === "dark" ? "text-dark-text-secondary" : "text-light-text-secondary"}`}>
              Aujourd'hui: {stats?.newUsers.today ?? 0}
            </p>
            <p className={`font-sans ${theme === "dark" ? "text-dark-text-secondary" : "text-light-text-secondary"}`}>
              Cette semaine: {stats?.newUsers.week ?? 0}
            </p>
            <p className={`font-sans ${theme === "dark" ? "text-dark-text-secondary" : "text-light-text-secondary"}`}>
              Ce mois: {stats?.newUsers.month ?? 0}
            </p>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div
        className={`p-6 rounded-xl border border-dark-primary/30 ${
          theme === "dark" ? "bg-dark-card" : "bg-light-card"
        } shadow-lg animate-slide-up`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Activity size={24} className={theme === "dark" ? "text-dark-primary" : "text-light-primary"} />
            <h2
              className={`ml-3 text-lg font-semibold font-sans ${
                theme === "dark" ? "text-dark-text-primary" : "text-light-text-primary"
              }`}
            >
              Activité récente
            </h2>
          </div>
          <div className="relative">
            <AlertCircle
              size={16}
              className="cursor-pointer"
              onMouseEnter={() => setShowTooltip({ ...showTooltip, activity: true })}
              onMouseLeave={() => setShowTooltip({ ...showTooltip, activity: false })}
            />
            {showTooltip.activity && (
              <div
                className={`absolute right-0 top-6 z-10 p-2 rounded-lg text-sm font-sans ${
                  theme === "dark" ? "bg-dark-background text-dark-text-primary" : "bg-light-background text-light-text-primary"
                } shadow-md w-48`}
              >
                Dernières actions des utilisateurs sur la plateforme.
              </div>
            )}
          </div>
        </div>
        <div className="mt-4">
          {stats?.recentActivity.length ? (
            <ul className="space-y-3">
              {stats.recentActivity.map((activity, index) => (
                <li
                  key={index}
                  className={`text-sm font-sans ${
                    theme === "dark" ? "text-dark-text-secondary" : "text-light-text-secondary"
                  }`}
                >
                  <span className="font-medium">{activity.user}</span> {activity.action} à{" "}
                  {new Date(activity.timestamp).toLocaleString("fr-FR", {
                    dateStyle: "short",
                    timeStyle: "short",
                  })}
                </li>
              ))}
            </ul>
          ) : (
            <p
              className={`text-sm font-sans ${
                theme === "dark" ? "text-dark-text-secondary" : "text-light-text-secondary"
              }`}
            >
              Aucune activité récente
            </p>
          )}
        </div>
      </div>

      {/* Users by Plan Chart */}
      <div
        className={`p-6 rounded-xl border border-dark-primary/30 ${
          theme === "dark" ? "bg-dark-card" : "bg-light-card"
        } shadow-lg animate-slide-up`}
      >
        <div className="flex items-center justify-between">
          <h2
            className={`text-lg font-semibold font-sans ${
              theme === "dark" ? "text-dark-tertiary" : "text-light-tertiary"
            }`}
          >
            Répartition des utilisateurs par plan
          </h2>
          <div className="relative">
            <AlertCircle
              size={16}
              className="cursor-pointer"
              onMouseEnter={() => setShowTooltip({ ...showTooltip, chart: true })}
              onMouseLeave={() => setShowTooltip({ ...showTooltip, chart: false })}
            />
            {showTooltip.chart && (
              <div
                className={`absolute right-0 top-6 z-10 p-2 rounded-lg text-sm font-sans ${
                  theme === "dark" ? "bg-dark-background text-dark-text-primary" : "bg-light-background text-light-text-primary"
                } shadow-md w-48`}
              >
                Répartition visuelle des utilisateurs par type de plan.
              </div>
            )}
          </div>
        </div>
        <div className="mt-4 max-w-md mx-auto">
          <Pie data={chartData} options={chartOptions} />
        </div>
      </div>
    </div>
  );
};

export default AdminHome;