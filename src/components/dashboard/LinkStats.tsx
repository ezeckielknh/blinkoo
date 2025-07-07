import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";
import { useTheme } from "../../contexts/ThemeContext";
import axios from "axios";
import { API } from "../../utils/api";
import { Pie, Doughnut, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
import { pt } from "date-fns/locale";
import { FiLock } from "react-icons/fi";

ChartJS.register(
  ArcElement,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
);

interface ClickData {
  id: string;
  short_link_id: number;
  ip_address: string | null;
  user_agent: string;
  referrer: string | null;
  country: string | null;
  region: string | null;
  city: string | null;
  timezone: string | null;
  isp: string | null;
  clicked_at: string;
  created_at: string;
  updated_at: string;
}

interface ShortLink {
  id: number;
  short_code: string;
  original_url: string;
  title: string | null;
  is_active: boolean;
  created_at: string;
  clicks: ClickData[];
}

interface StatsResponse {
  link: ShortLink;
  clicks: ClickData[];
}

interface ProcessedStats {
  totalClicks: number;
  uniqueIps: number;
  clicksPerDay: number;
  countryDistribution: { country: string; count: number }[];
  deviceDistribution: { device: string; count: number }[];
  referrerDistribution: { referrer: string; count: number }[];
  regionDistribution: { region: string; count: number }[];
  clicksOverTime: { date: string; count: number }[];
  clicks: ClickData[];
}

const LinkStats = () => {
  const { linkId } = useParams<{ linkId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToast } = useToast();
  const { theme } = useTheme();
  const [stats, setStats] = useState<ProcessedStats | null>(null);
  const [loading, setLoading] = useState(true);
  const isPaidPlan =
    user?.plan === "premium" ||
    user?.plan === "premium_quarterly" ||
    user?.plan === "premium_annual" ||
    user?.plan === "enterprise";

  const processStats = (response: StatsResponse): ProcessedStats => {
    const clicks = response.clicks;
    const totalClicks = clicks.length;
    const uniqueIps = new Set(clicks.map((click) => click.ip_address)).size;

    // Calculate clicks per day
    const dates = clicks.map((click) =>
      new Date(click.clicked_at).toDateString()
    );
    const uniqueDays = new Set(dates).size;
    const clicksPerDay = uniqueDays > 0 ? totalClicks / uniqueDays : 0;

    // Country distribution
    const countryCounts = clicks.reduce((acc, click) => {
      const country = click.country || "Inconnu";
      acc[country] = (acc[country] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const countryDistribution = Object.entries(countryCounts).map(
      ([country, count]) => ({
        country,
        count,
      })
    );

    // Device distribution
    const deviceCounts = clicks.reduce((acc, click) => {
      const ua = click.user_agent.toLowerCase();
      let dtype = "Autre";
      if (ua.includes("mobile")) dtype = "Mobile";
      else if (ua.includes("tablet")) dtype = "Tablette";
      else if (
        ua.includes("windows") ||
        ua.includes("mac") ||
        ua.includes("linux")
      )
        dtype = "Usual";
      acc[dtype] = (acc[dtype] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const deviceDistribution = Object.entries(deviceCounts).map(
      ([dtype, count]) => ({
        device: dtype,
        count,
      })
    );

    // Referrer distribution
    const referrerCounts = clicks.reduce((acc, click) => {
      const referrer = click.referrer || "Direct";
      acc[referrer] = (acc[referrer] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const referrerDistribution = Object.entries(referrerCounts).map(
      ([referrer, count]) => ({
        referrer,
        count,
      })
    );

    // Region distribution
    const regionCounts = clicks.reduce((acc, click) => {
      const region = click.region || "Inconnu";
      acc[region] = (acc[region] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const regionDistribution = Object.entries(regionCounts).map(
      ([region, count]) => ({
        region,
        count,
      })
    );

    // Clicks over time (daily)
    const clickDates = clicks.reduce((acc, click) => {
      const date = new Date(click.clicked_at).toLocaleDateString("fr-FR");
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const clicksOverTime = Object.entries(clickDates)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => {
        const dateA = new Date(a.date.split("/").reverse().join("-"));
        const dateB = new Date(b.date.split("/").reverse().join("-"));
        return dateA.getTime() - dateB.getTime();
      });

    return {
      totalClicks,
      uniqueIps,
      clicksPerDay,
      countryDistribution,
      deviceDistribution,
      referrerDistribution,
      regionDistribution,
      clicksOverTime,
      clicks,
    };
  };

  useEffect(() => {
    const fetchStats = async () => {
      // if (!user || !linkId || (user.plan !== "premium" && user.plan !== "enterprise")) {
      //   addToast("Accès réservé aux utilisateurs Premium et Enterprise", "error");
      //   setLoading(false);
      //   return;
      // }

      try {
        if (!user) {
          addToast("Utilisateur non authentifié.", "error");
          setLoading(false);
          return;
        }
        const response = await axios.get<StatsResponse>(
          `${API.SHORT_LINKS.GET_ONE}/${linkId}`,
          { headers: { Authorization: `Bearer ${user.token}` } }
        );
        const processed = processStats(response.data);
        setStats(processed);
      } catch (err: any) {
        addToast(
          err.response?.data?.error ||
            "Erreur lors du chargement des statistiques",
          "error"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [linkId, user, addToast]);

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 animate-fade-in"
        data-theme={theme}
      >
        <div
          className={`text-2xl font-sans animate-pulse ${
            theme === "dark"
              ? "text-dark-text-primary"
              : "text-light-text-primary"
          }`}
        >
          Chargement...
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 animate-fade-in"
        data-theme={theme}
      >
        <div
          className={`text-2xl font-sans ${
            theme === "dark"
              ? "text-dark-text-primary"
              : "text-light-text-primary"
          }`}
        >
          Aucune statistique disponible.
        </div>
      </div>
    );
  }

  // Chart data
  const countryChartData = {
    labels:
      stats.countryDistribution.length > 0
        ? stats.countryDistribution.map((item) => item.country)
        : ["Aucun"],
    datasets: [
      {
        data:
          stats.countryDistribution.length > 0
            ? stats.countryDistribution.map((item) => item.count)
            : [1],
        backgroundColor: [
          "#2563eb",
          "#7c3aed",
          "#a855f7",
          "#eab308",
          "#9ca3af",
        ],
        borderColor: theme === "dark" ? "#0d1117" : "#ffffff",
        borderWidth: 1,
      },
    ],
  };

  const deviceChartData = {
    labels:
      stats.deviceDistribution.length > 0
        ? stats.deviceDistribution.map((item) => item.device)
        : ["Aucun"],
    datasets: [
      {
        data:
          stats.deviceDistribution.length > 0
            ? stats.deviceDistribution.map((item) => item.count)
            : [1],
        backgroundColor: ["#2563eb", "#7c3aed", "#a855f7", "#eab308"],
        borderColor: theme === "dark" ? "#0d1117" : "#ffffff",
        borderWidth: 1,
      },
    ],
  };

  const referrerChartData = {
    labels:
      stats.referrerDistribution.length > 0
        ? stats.referrerDistribution.map((item) => item.referrer)
        : ["Aucun"],
    datasets: [
      {
        data:
          stats.referrerDistribution.length > 0
            ? stats.referrerDistribution.map((item) => item.count)
            : [1],
        backgroundColor: [
          "#2563eb",
          "#7c3aed",
          "#a855f7",
          "#eab308",
          "#9ca3af",
        ],
        borderColor: theme === "dark" ? "#0d1117" : "#ffffff",
        borderWidth: 1,
      },
    ],
  };

  const regionChartData = {
    labels:
      stats.regionDistribution.length > 0
        ? stats.regionDistribution.map((item) => item.region)
        : ["Aucun"],
    datasets: [
      {
        data:
          stats.regionDistribution.length > 0
            ? stats.regionDistribution.map((item) => item.count)
            : [1],
        backgroundColor: [
          "#2563eb",
          "#7c3aed",
          "#a855f7",
          "#eab308",
          "#9ca3af",
        ],
        borderColor: theme === "dark" ? "#0d1117" : "#ffffff",
        borderWidth: 1,
      },
    ],
  };

  const clicksOverTimeChartData = {
    labels:
      stats.clicksOverTime.length > 0
        ? stats.clicksOverTime.map((item) => item.date)
        : ["Aucun"],
    datasets: [
      {
        label: "Clics",
        data:
          stats.clicksOverTime.length > 0
            ? stats.clicksOverTime.map((item) => item.count)
            : [0],
        borderColor: "#2563eb",
        backgroundColor: "#2563eb80",
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: {
          color: theme === "dark" ? "#e5e7eb" : "#1f2937",
          font: {
            family: "Inter",
            size: 12,
          },
        },
      },
    },
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: {
          color: theme === "dark" ? "#e5e7eb" : "#1f2937",
          font: {
            family: "Inter",
            size: 12,
          },
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: theme === "dark" ? "#e5e7eb" : "#1f2937",
          font: {
            family: "Inter",
            size: 12,
          },
        },
        grid: {
          color: theme === "dark" ? "#374151" : "#e5e7eb",
        },
      },
      y: {
        ticks: {
          color: theme === "dark" ? "#e5e7eb" : "#1f2937",
          font: {
            family: "Inter",
            size: 12,
          },
        },
        grid: {
          color: theme === "dark" ? "#374151" : "#e5e7eb",
        },
        beginAtZero: true,
      },
    },
  };

  return (
    <div
      className="space-y-6 px-4 sm:px-6 lg:px-8 animate-fade-in"
      data-theme={theme}
    >
      <div className="flex items-center justify-between pt-6">
        <h1
          className={`text-3xl font-bold font-sans ${
            theme === "dark"
              ? "text-dark-text-primary"
              : "text-light-text-primary"
          }`}
        >
          Statistiques du lien
        </h1>
        <button
          className={`px-4 py-2 rounded-lg font-sans text-sm font-medium transition-all ${
            theme === "dark"
              ? "bg-dark-primary text-dark-text-primary hover:bg-dark-secondary/80"
              : "bg-light-primary text-light-text-primary hover:bg-light-secondary-dark"
          }`}
          onClick={() => navigate("/dashboard/links")}
        >
          Retour
        </button>
      </div>
      {/* ...rest of your JSX content... */}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 animate-slide-up">
        <div
          className={`rounded-xl border border-dark-primary/30 ${
            theme === "dark" ? "bg-dark-card" : "bg-light-card"
          } p-4 sm:p-6 shadow-lg`}
        >
          <h2
            className={`text-lg sm:text-xl font-semibold font-sans ${
              theme === "dark"
                ? "text-dark-text-primary"
                : "text-light-text-primary"
            }`}
          >
            Total des clics
          </h2>
          <p
            className={`text-3xl font-bold mt-2 font-sans ${
              theme === "dark" ? "text-dark-primary" : "text-light-primary"
            }`}
          >
            {stats.totalClicks}
          </p>
        </div>
        <div
          className={`rounded-xl border border-dark-primary/30 ${
            theme === "dark" ? "bg-dark-card" : "bg-light-card"
          } p-4 sm:p-6 shadow-lg`}
        >
          <h2
            className={`text-lg sm:text-xl font-semibold font-sans ${
              theme === "dark"
                ? "text-dark-text-primary"
                : "text-light-text-primary"
            }`}
          >
            Visiteurs uniques
          </h2>
          <p
            className={`text-3xl font-bold mt-2 font-sans ${
              theme === "dark" ? "text-dark-primary" : "text-light-primary"
            }`}
          >
            {stats.uniqueIps}
          </p>
        </div>
        <div
          className={`rounded-xl border border-dark-primary/30 ${
            theme === "dark" ? "bg-dark-card" : "bg-light-card"
          } p-4 sm:p-6 shadow-lg`}
        >
          <h2
            className={`text-lg sm:text-xl font-semibold font-sans ${
              theme === "dark"
                ? "text-dark-text-primary"
                : "text-light-text-primary"
            }`}
          >
            Clics par jour
          </h2>
          <p
            className={`text-3xl font-bold mt-2 font-sans ${
              theme === "dark" ? "text-dark-primary" : "text-light-primary"
            }`}
          >
            {stats.clicksPerDay.toFixed(1)}
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 animate-slide-up">
        {/* Country Distribution */}
        <div
          className={`rounded-xl border border-dark-primary/30 ${
            theme === "dark" ? "bg-dark-card" : "bg-light-card"
          } p-4 sm:p-6 shadow-lg`}
        >
          <h2
            className={`text-lg sm:text-xl font-semibold mb-4 font-sans ${
              theme === "dark"
                ? "text-dark-text-primary"
                : "text-light-text-primary"
            }`}
          >
            Répartition par pays
          </h2>
          {stats.countryDistribution.length === 0 ? (
            <p
              className={`text-center text-sm font-sans ${
                theme === "dark"
                  ? "text-dark-text-secondary"
                  : "text-light-text-secondary"
              }`}
            >
              Aucune donnée disponible
            </p>
          ) : (
            <div className="h-64">
              <Pie data={countryChartData} options={chartOptions} />
            </div>
          )}
        </div>

        {/* Device Distribution */}
        <div
          className={`rounded-xl border border-dark-primary/30 ${
            theme === "dark" ? "bg-dark-card" : "bg-light-card"
          } p-4 sm:p-6 shadow-lg`}
        >
          <h2
            className={`text-lg sm:text-xl font-semibold mb-4 font-sans ${
              theme === "dark"
                ? "text-dark-text-primary"
                : "text-light-text-primary"
            }`}
          >
            Répartition par appareil
          </h2>
          {stats.deviceDistribution.length === 0 ? (
            <p
              className={`text-center text-sm font-sans ${
                theme === "dark"
                  ? "text-dark-text-secondary"
                  : "text-light-text-secondary"
              }`}
            >
              Aucune donnée disponible
            </p>
          ) : (
            <div className="h-64">
              <Doughnut data={deviceChartData} options={chartOptions} />
            </div>
          )}
        </div>

        {/* Referrer Distribution */}
        <div
          className={`rounded-xl border border-dark-primary/30 ${
            theme === "dark" ? "bg-dark-card" : "bg-light-card"
          } p-4 sm:p-6 shadow-lg`}
        >
          <h2
            className={`text-lg sm:text-xl font-semibold mb-4 font-sans ${
              theme === "dark"
                ? "text-dark-text-primary"
                : "text-light-text-primary"
            }`}
          >
            Sources de référence
          </h2>
          {isPaidPlan ? (
            stats.referrerDistribution.length === 0 ? (
              <p
                className={`text-center text-sm font-sans ${
                  theme === "dark"
                    ? "text-dark-text-secondary"
                    : "text-light-text-secondary"
                }`}
              >
                Aucune donnée disponible
              </p>
            ) : (
              <div className="h-64">
                <Pie data={referrerChartData} options={chartOptions} />
              </div>
            )
          ) : (
            <div
              className={`text-center h-64 flex flex-col items-center justify-center text-sm font-sans ${
                theme === "dark"
                  ? "text-dark-text-secondary"
                  : "text-light-text-secondary"
              }`}
            >
              <>
                <FiLock size={24} className="mb-2" />
                <p>Disponible pour les plans Premium et Enterprise</p>
                <button
                  className={`mt-2 px-4 py-2 rounded-lg font-sans text-sm font-medium ${
                    theme === "dark"
                      ? "bg-dark-primary text-dark-text-primary hover:bg-dark-secondary"
                      : "bg-light-primary text-light-text-primary hover:bg-light-secondary"
                  }`}
                  onClick={() => {
                    addToast(
                      "Passez à un plan Premium pour accéder à cette fonctionnalité",
                      "info"
                    );
                    navigate("/dashboard/pricing");
                  }}
                >
                  Passer à Premium
                </button>
              </>
            </div>
          )}
        </div>
      </div>

      {/* Additional Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 animate-slide-up">
        {/* Region Distribution */}
        <div
          className={`rounded-xl border border-dark-primary/30 ${
            theme === "dark" ? "bg-dark-card" : "bg-light-card"
          } p-4 sm:p-6 shadow-lg`}
        >
          <h2
            className={`text-lg sm:text-xl font-semibold mb-4 font-sans ${
              theme === "dark"
                ? "text-dark-text-primary"
                : "text-light-text-primary"
            }`}
          >
            Répartition par région
          </h2>
          {isPaidPlan ? (
            stats.regionDistribution.length === 0 ? (
              <p
                className={`text-center text-sm font-sans ${
                  theme === "dark"
                    ? "text-dark-text-secondary"
                    : "text-light-text-secondary"
                }`}
              >
                Aucune donnée disponible
              </p>
            ) : (
              <div className="h-64">
                <Pie data={regionChartData} options={chartOptions} />
              </div>
            )
          ) : (
            <div
              className={`text-center h-64 flex flex-col items-center justify-center text-sm font-sans ${
                theme === "dark"
                  ? "text-dark-text-secondary"
                  : "text-light-text-secondary"
              }`}
            >
              <FiLock size={24} className="mb-2" />
              <p>Disponible pour les plans Premium et Enterprise</p>
              <button
                className={`mt-2 px-4 py-2 rounded-lg font-sans text-sm font-medium ${
                  theme === "dark"
                    ? "bg-dark-primary text-dark-text-primary hover:bg-dark-secondary"
                    : "bg-light-primary text-light-text-primary hover:bg-light-secondary"
                }`}
                onClick={() => {
                  addToast(
                    "Passez à un plan Premium pour accéder à cette fonctionnalité",
                    "info"
                  );
                  navigate("/dashboard/pricing");
                }}
              >
                Passer à Premium
              </button>
            </div>
          )}
        </div>

        {/* Clicks Over Time */}
        <div
          className={`rounded-xl border border-dark-primary/30 ${
            theme === "dark" ? "bg-dark-card" : "bg-light-card"
          } p-4 sm:p-6 shadow-lg`}
        >
          <h2
            className={`text-lg sm:text-xl font-semibold mb-4 font-sans ${
              theme === "dark"
                ? "text-dark-text-primary"
                : "text-light-text-primary"
            }`}
          >
            Clics au fil du temps
          </h2>
          {isPaidPlan ? (
            stats.clicksOverTime.length === 0 ? (
              <p
                className={`text-center text-sm font-sans ${
                  theme === "dark"
                    ? "text-dark-text-secondary"
                    : "text-light-text-secondary"
                }`}
              >
                Aucune donnée disponible
              </p>
            ) : (
              <div className="h-64">
                <Line
                  data={clicksOverTimeChartData}
                  options={lineChartOptions}
                />
              </div>
            )
          ) : (
            <div
              className={`text-center h-64 flex flex-col items-center justify-center text-sm font-sans ${
                theme === "dark"
                  ? "text-dark-text-secondary"
                  : "text-light-text-secondary"
              }`}
            >
              <FiLock size={24} className="mb-2" />
              <p>Disponible pour les plans Premium et Enterprise</p>
              <button
                className={`mt-2 px-4 py-2 rounded-lg font-sans text-sm font-medium ${
                  theme === "dark"
                    ? "bg-dark-primary text-dark-text-primary hover:bg-dark-secondary"
                    : "bg-light-primary text-light-text-primary hover:bg-light-secondary"
                }`}
                onClick={() => {
                  addToast(
                    "Passez à un plan Premium pour accéder à cette fonctionnalité",
                    "info"
                  );
                  navigate("/dashboard/pricing");
                }}
              >
                Passer à Premium
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Click Details Table */}
      <div
        className={`rounded-xl border border-dark-primary/30 ${
          theme === "dark" ? "bg-dark-card" : "bg-light-card"
        } p-4 sm:p-6 shadow-lg animate-slide-up`}
      >
        <h2
          className={`text-lg sm:text-xl font-semibold mb-4 font-sans ${
            theme === "dark"
              ? "text-dark-text-primary"
              : "text-light-text-primary"
          }`}
        >
          Détails des clics
        </h2>
        {stats.totalClicks > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-dark-primary/20">
              <thead>
                <tr
                  className={
                    theme === "dark"
                      ? "bg-dark-background/50"
                      : "bg-light-background/50"
                  }
                >
                  <th
                    className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider font-sans ${
                      theme === "dark"
                        ? "text-dark-tertiary"
                        : "text-light-tertiary"
                    }`}
                  >
                    Date
                  </th>
                  <th
                    className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider font-sans ${
                      theme === "dark"
                        ? "text-dark-tertiary"
                        : "text-light-tertiary"
                    }`}
                  >
                    Pays
                  </th>
                  <th
                    className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider font-sans ${
                      theme === "dark"
                        ? "text-dark-tertiary"
                        : "text-light-tertiary"
                    }`}
                  >
                    Ville
                  </th>
                  <th
                    className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider font-sans ${
                      theme === "dark"
                        ? "text-dark-tertiary"
                        : "text-light-tertiary"
                    }`}
                  >
                    Appareil
                  </th>
                  <th
                    className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider font-sans ${
                      theme === "dark"
                        ? "text-dark-tertiary"
                        : "text-light-tertiary"
                    }`}
                  >
                    Référent
                  </th>
                  <th
                    className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider font-sans ${
                      theme === "dark"
                        ? "text-dark-tertiary"
                        : "text-light-tertiary"
                    }`}
                  >
                    IP
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-primary/20">
                {stats.clicks.map((click) => (
                  <tr
                    key={click.id}
                    className={`${
                      theme === "dark"
                        ? "bg-dark-background/30"
                        : "bg-light-background/30"
                    } hover:bg-dark-primary/10 transition-all ${
                      theme === "light" ? "hover:bg-light-primary/10" : ""
                    }`}
                  >
                    <td
                      className={`px-6 py-4 text-sm font-sans ${
                        theme === "dark"
                          ? "text-dark-text-primary"
                          : "text-light-text-primary"
                      }`}
                    >
                      {new Date(click.clicked_at).toLocaleDateString("fr-FR")}
                    </td>
                    <td
                      className={`px-6 py-4 text-sm font-sans ${
                        theme === "dark"
                          ? "text-dark-text-primary"
                          : "text-light-text-primary"
                      }`}
                    >
                      {click.country || "Inconnu"}
                    </td>
                    <td
                      className={`px-6 py-4 text-sm font-sans ${
                        theme === "dark"
                          ? "text-dark-text-primary"
                          : "text-light-text-primary"
                      }`}
                    >
                      {click.city || "Inconnu"}
                    </td>
                    <td
                      className={`px-6 py-4 text-sm font-sans ${
                        theme === "dark"
                          ? "text-dark-text-primary"
                          : "text-light-text-primary"
                      }`}
                    >
                      {click.user_agent.toLowerCase().includes("mobile")
                        ? "Mobile"
                        : click.user_agent.toLowerCase().includes("tablet")
                        ? "Tablette"
                        : "Usual"}
                    </td>
                    <td
                      className={`px-6 py-4 text-sm font-sans ${
                        theme === "dark"
                          ? "text-dark-text-primary"
                          : "text-light-text-primary"
                      }`}
                    >
                      {click.referrer || "Direct"}
                    </td>
                    <td
                      className={`px-6 py-4 text-sm font-sans ${
                        theme === "dark"
                          ? "text-dark-text-primary"
                          : "text-light-text-primary"
                      }`}
                    >
                      {click.ip_address || "N/A"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p
            className={`text-center py-6 text-sm font-sans ${
              theme === "dark"
                ? "text-dark-text-secondary"
                : "text-light-text-secondary"
            }`}
          >
            Aucun clic enregistré pour ce lien.
          </p>
        )}
      </div>
    </div>
  );
};

export default LinkStats;
