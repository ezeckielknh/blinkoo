import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";
import { useTheme } from "../../contexts/ThemeContext";
import { API } from "../../utils/api";
import { format } from "date-fns";
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
import { Pie, Doughnut, Line } from "react-chartjs-2";
import { Book, NotepadText, PersonStanding, ScanEye, Settings } from "lucide-react";
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

type Scan = {
  id: string;
  scanned_at: string;
  ip_address?: string;
  city?: string;
  country?: string;
  region?: string;
  timezone?: string;
  user_agent?: string;
};

type QrData = {
  type: string;
  content: string;
  qr_code: { short_code: string };
  scans: Scan[];
};

const QRStatsPage = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const { theme } = useTheme();
  const { shortCode } = useParams<{ shortCode: string }>();
  const navigate = useNavigate();
  const [qrData, setQrData] = useState<QrData | null>(null);
  const [loading, setLoading] = useState(true);
  const isPaidPlan =
    user?.plan === "premium" ||
    user?.plan === "premium_quarterly" ||
    user?.plan === "premium_annual" ||
    user?.plan === "enterprise";

  useEffect(() => {
    // if (!user || user.plan === "free") {
    //   addToast("Accès réservé aux utilisateurs Premium ou Enterprise", "error");
    //   navigate("/qr-generator");
    //   return;
    // }

    const fetchQrStats = async () => {
      try {
        const res = await fetch(`${API.QR_CODES.GET_ONE}/${shortCode}`, {
          method: "GET",
          headers: user ? { Authorization: `Bearer ${user.token}` } : {},
        });
        const data = await res.json();
        if (!res.ok) {
          addToast(
            data?.error || "Erreur lors de la récupération des statistiques",
            "error"
          );
          navigate("/qr-generator");
          return;
        }
        setQrData(data);
      } catch (error) {
        console.error(
          "Erreur lors de la récupération des statistiques:",
          error
        );
        addToast("Erreur réseau", "error");
        navigate("/qr-generator");
      } finally {
        setLoading(false);
      }
    };

    fetchQrStats();
  }, [user, shortCode, addToast, navigate]);

  if (loading) {
    return (
      <div
        className="flex items-center justify-center h-screen"
        data-theme={theme}
      >
        <Settings
          size={48}
          className={`animate-spin ${
            theme === "dark"
              ? "text-dark-text-secondary"
              : "text-light-text-secondary"
          }`}
        />
      </div>
    );
  }

  if (!qrData) {
    return null;
  }

  const { type, content, qr_code, scans } = qrData;
  const totalScans = scans.length;
  const uniqueIps = new Set(scans.map((scan) => scan.ip_address)).size;

  // Prepare data for charts
  const scanByDate = scans.reduce<Record<string, number>>((acc, scan) => {
    const date = format(new Date(scan.scanned_at), "dd/MM/yyyy");
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {});
  const scansOverTimeData = Object.entries(scanByDate)
    .map(([date, count]) => ({ date, count }))
    .sort(
      (a, b) =>
        new Date(a.date.split("/").reverse().join("-")).getTime() -
        new Date(b.date.split("/").reverse().join("-")).getTime()
    );

  // Geolocation breakdown
  const geoBreakdown = scans.reduce<Record<string, number>>((acc, scan) => {
    const location = `${scan.city || "Inconnu"}, ${scan.country || "Inconnu"}`;
    acc[location] = (acc[location] || 0) + 1;
    return acc;
  }, {});
  const geoChartData = Object.entries(geoBreakdown).map(
    ([location, count]) => ({
      location,
      count,
    })
  );

  // Device breakdown
  const deviceBreakdown = scans.reduce<Record<string, number>>(
    (acc, scan) => {
      const device = scan.user_agent?.toLowerCase().includes("mobile")
        ? "Mobile"
        : "Ordinateur";
      acc[device] = (acc[device] || 0) + 1;
      return acc;
    },
    { Mobile: 0, Ordinateur: 0 }
  );
  const deviceChartData = Object.entries(deviceBreakdown).map(
    ([device, count]) => ({
      device,
      count,
    })
  );

  // Region breakdown
  const regionBreakdown = scans.reduce<Record<string, number>>((acc, scan) => {
    const region = scan.region || "Inconnu";
    acc[region] = (acc[region] || 0) + 1;
    return acc;
  }, {});
  const regionChartData = Object.entries(regionBreakdown).map(
    ([region, count]) => ({
      region,
      count,
    })
  );

  // Chart configurations
  const chartColors = {
    dark: ["#3b82f6", "#8b5cf6", "#d946ef", "#f59e0b", "#6b7280"],
    light: ["#2563eb", "#7c3aed", "#c026d3", "#eab308", "#9ca3af"],
  };

  const scansOverTimeChartData = {
    labels:
      scansOverTimeData.length > 0
        ? scansOverTimeData.map((item) => item.date)
        : ["Aucun"],
    datasets: [
      {
        label: "Scans",
        data:
          scansOverTimeData.length > 0
            ? scansOverTimeData.map((item) => item.count)
            : [0],
        borderColor:
          theme === "dark" ? chartColors.dark[0] : chartColors.light[0],
        backgroundColor:
          theme === "dark"
            ? `${chartColors.dark[0]}80`
            : `${chartColors.light[0]}80`,
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const geoChartDataConfig = {
    labels:
      geoChartData.length > 0
        ? geoChartData.map((item) => item.location)
        : ["Aucun"],
    datasets: [
      {
        data:
          geoChartData.length > 0
            ? geoChartData.map((item) => item.count)
            : [1],
        backgroundColor:
          theme === "dark" ? chartColors.dark : chartColors.light,
        borderColor: theme === "dark" ? "#1f2937" : "#f3f4f6",
        borderWidth: 2,
      },
    ],
  };

  const deviceChartDataConfig = {
    labels:
      deviceChartData.length > 0
        ? deviceChartData.map((item) => item.device)
        : ["Aucun"],
    datasets: [
      {
        data:
          deviceChartData.length > 0
            ? deviceChartData.map((item) => item.count)
            : [1],
        backgroundColor:
          theme === "dark"
            ? chartColors.dark.slice(0, 2)
            : chartColors.light.slice(0, 2),
        borderColor: theme === "dark" ? "#1f2937" : "#f3f4f6",
        borderWidth: 2,
      },
    ],
  };

  const regionChartDataConfig = {
    labels:
      regionChartData.length > 0
        ? regionChartData.map((item) => item.region)
        : ["Aucun"],
    datasets: [
      {
        data:
          regionChartData.length > 0
            ? regionChartData.map((item) => item.count)
            : [1],
        backgroundColor:
          theme === "dark" ? chartColors.dark : chartColors.light,
        borderColor: theme === "dark" ? "#1f2937" : "#f3f4f6",
        borderWidth: 2,
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
          font: { size: 12, family: "'Inter', sans-serif" },
          padding: 20,
        },
      },
      tooltip: {
        backgroundColor: theme === "dark" ? "#1f2937" : "#ffffff",
        titleColor: theme === "dark" ? "#e5e7eb" : "#1f2937",
        bodyColor: theme === "dark" ? "#e5e7eb" : "#1f2937",
        borderColor: theme === "dark" ? "#374151" : "#e5e7eb",
        borderWidth: 1,
        padding: 10,
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
          font: { size: 12, family: "'Inter', sans-serif" },
          padding: 20,
        },
      },
      tooltip: {
        backgroundColor: theme === "dark" ? "#1f2937" : "#ffffff",
        titleColor: theme === "dark" ? "#e5e7eb" : "#1f2937",
        bodyColor: theme === "dark" ? "#e5e7eb" : "#1f2937",
        borderColor: theme === "dark" ? "#374151" : "#e5e7eb",
        borderWidth: 1,
        padding: 10,
      },
    },
    scales: {
      x: {
        ticks: {
          color: theme === "dark" ? "#e5e7eb" : "#1f2937",
          font: { size: 12, family: "'Inter', sans-serif" },
        },
        grid: {
          color: theme === "dark" ? "#374151" : "#e5e7eb",
          lineWidth: 0.5,
        },
      },
      y: {
        ticks: {
          color: theme === "dark" ? "#e5e7eb" : "#1f2937",
          font: { size: 12, family: "'Inter', sans-serif" },
          stepSize: 1,
        },
        grid: {
          color: theme === "dark" ? "#374151" : "#e5e7eb",
          lineWidth: 0.5,
        },
        beginAtZero: true,
      },
    },
  };

  const isPremiumOrEnterprise =
    user && (user.plan === "premium" || user.plan === "enterprise");

  return (
    <div
      className={`min-h-screen p-6 space-y-8 ${
        theme === "dark" ? "bg-dark-background" : "bg-light-background"
      }`}
      data-theme={theme}
    >
      <div className="flex items-center justify-between pt-9">
        <h1
          className={`text-3xl font-bold font-sans ${
            theme === "dark"
              ? "text-dark-text-primary"
              : "text-light-text-primary"
          }`}
        >
          Statistiques: {qr_code.short_code}
        </h1>
        <button
          className={`px-4 py-2 rounded-lg font-sans text-sm font-medium transition-all ${
            theme === "dark"
              ? "bg-dark-primary text-dark-text-primary hover:bg-dark-secondary/80"
              : "bg-light-primary text-light-text-primary hover:bg-light-secondary-dark"
          }`}
          onClick={() => navigate("/dashboard/qr")}
        >
          Retour
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-6">
        <div
          className={`flex items-center gap-4 rounded-lg border border-dark-primary/30 ${
            theme === "dark" ? "bg-dark-card" : "bg-light-card"
          } shadow-lg p-5 animate-slide-up`}
        >
          <div
            className={`flex items-center justify-center rounded-full w-12 h-12 ${
              theme === "dark" ? "bg-dark-primary/20" : "bg-light-primary/20"
            }`}
          >
            {/* Type icon */}
            <span className="text-2xl">
              <Settings
                size={28}
                className={
                  theme === "dark" ? "text-dark-primary" : "text-light-primary"
                }
              />
            </span>
          </div>
          <div>
            <span
              className={`text-xs font-medium ${
                theme === "dark"
                  ? "text-dark-text-secondary"
                  : "text-light-text-secondary"
              }`}
            >
              Type
            </span>
            <p
              className={`text-lg font-semibold ${
                theme === "dark"
                  ? "text-dark-text-primary"
                  : "text-light-text-primary"
              }`}
            >
              {type}
            </p>
          </div>
        </div>
        <div
          className={`flex items-center gap-4 rounded-lg border border-dark-primary/30 ${
            theme === "dark" ? "bg-dark-card" : "bg-light-card"
          } shadow-lg p-5 animate-slide-up`}
        >
          <div
            className={`flex items-center justify-center rounded-full w-12 h-12 ${
              theme === "dark" ? "bg-dark-primary/20" : "bg-light-primary/20"
            }`}
          >
            {/* Content icon */}
            <NotepadText 
              size={28}
                className={
                  theme === "dark" ? "text-dark-primary" : "text-light-primary"
                }
            />
          </div>
          <div>
            <span
              className={`text-xs font-medium ${
                theme === "dark"
                  ? "text-dark-text-secondary"
                  : "text-light-text-secondary"
              }`}
            >
              Contenu
            </span>
            <p
              className={`text-lg font-semibold break-all ${
                theme === "dark"
                  ? "text-dark-text-primary"
                  : "text-light-text-primary"
              }`}
            >
                {content.length > 14 ? content.slice(0, 14) + "..." : content}
            </p>
          </div>
        </div>
        <div
          className={`flex items-center gap-4 rounded-lg border border-dark-primary/30 ${
            theme === "dark" ? "bg-dark-card" : "bg-light-card"
          } shadow-lg p-5 animate-slide-up`}
        >
          <div
            className={`flex items-center justify-center rounded-full w-12 h-12 ${
              theme === "dark" ? "bg-dark-primary/20" : "bg-light-primary/20"
            }`}
          >
            {/* Total scans icon */}
            <span className="text-2xl">
              < ScanEye
                size={28}
                className={
                  theme === "dark" ? "text-dark-primary" : "text-light-primary" 
                }
              />
            </span>
          </div>
          <div>
            <span
              className={`text-xs font-medium ${
                theme === "dark"
                  ? "text-dark-text-secondary"
                  : "text-light-text-secondary"
              }`}
            >
              Total scans
            </span>
            <p
              className={`text-lg font-semibold ${
                theme === "dark"
                  ? "text-dark-text-primary"
                  : "text-light-text-primary"
              }`}
            >
              {totalScans}
            </p>
          </div>
        </div>
        <div
          className={`flex items-center gap-4 rounded-lg border border-dark-primary/30 ${
            theme === "dark" ? "bg-dark-card" : "bg-light-card"
          } shadow-lg p-5 animate-slide-up`}
        >
          <div
            className={`flex items-center justify-center rounded-full w-12 h-12 ${
              theme === "dark" ? "bg-dark-primary/20" : "bg-light-primary/20"
            }`}
          >
            {/* Unique scans icon */}
            <span className="text-2xl">
              < PersonStanding
                size={28}
                className={
                  theme === "dark" ? "text-dark-primary" : "text-light-primary"
                }
              />
            </span>
          </div>
          <div>
            <span
              className={`text-xs font-medium ${
                theme === "dark"
                  ? "text-dark-text-secondary"
                  : "text-light-text-secondary"
              }`}
            >
              Scans uniques (IP)
            </span>
            <p
              className={`text-lg font-semibold ${
                theme === "dark"
                  ? "text-dark-text-primary"
                  : "text-light-text-primary"
              }`}
            >
              {uniqueIps}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
  <div
    className={`rounded-lg border border-dark-primary/30 ${
      theme === "dark" ? "bg-dark-card" : "bg-light-card"
    } shadow-lg p-6 animate-slide-up`}
  >
    <h2
      className={`text-xl font-semibold mb-4 font-sans ${
        theme === "dark" ? "text-dark-text-primary" : "text-light-text-primary"
      }`}
    >
      Scans au fil du temps
    </h2>
    <div className="h-64">
      {isPaidPlan ? (
        scansOverTimeData.length === 0 ? (
          <p
            className={`text-center ${
              theme === "dark" ? "text-dark-text-secondary" : "text-light-text-secondary"
            }`}
          >
            Aucune donnée disponible
          </p>
        ) : (
          <Line data={scansOverTimeChartData} options={lineChartOptions} />
        )
      ) : (
        <div
          className={`text-center h-64 flex flex-col items-center justify-center text-sm font-sans ${
            theme === "dark" ? "text-dark-text-secondary" : "text-light-text-secondary"
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
              addToast("Passez à un plan Premium pour accéder à cette fonctionnalité", "info");
              navigate("/dashboard/pricing");
            }}
          >
            Passer à Premium
          </button>
        </div>
      )}
    </div>
  </div>

  <div
    className={`rounded-lg border border-dark-primary/30 ${
      theme === "dark" ? "bg-dark-card" : "bg-light-card"
    } shadow-lg p-6 animate-slide-up`}
  >
    <h2
      className={`text-xl font-semibold mb-4 font-sans ${
        theme === "dark" ? "text-dark-text-primary" : "text-light-text-primary"
      }`}
    >
      Répartition géographique
    </h2>
    <div className="h-64">
      {geoChartData.length === 0 ? (
        <p
          className={`text-center ${
            theme === "dark" ? "text-dark-text-secondary" : "text-light-text-secondary"
          }`}
        >
          Aucune donnée disponible
        </p>
      ) : (
        <Pie data={geoChartDataConfig} options={chartOptions} />
      )}
    </div>
  </div>
</div>

<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
  <div
    className={`rounded-lg border border-dark-primary/30 ${
      theme === "dark" ? "bg-dark-card" : "bg-light-card"
    } shadow-lg p-6 animate-slide-up`}
  >
    <h2
      className={`text-xl font-semibold mb-4 font-sans ${
        theme === "dark" ? "text-dark-text-primary" : "text-light-text-primary"
      }`}
    >
      Répartition par appareil
    </h2>
    <div className="h-64">
      {deviceChartData.length === 0 ? (
        <p
          className={`text-center ${
            theme === "dark" ? "text-dark-text-secondary" : "text-light-text-secondary"
          }`}
        >
          Aucune donnée disponible
        </p>
      ) : (
        <Doughnut data={deviceChartDataConfig} options={chartOptions} />
      )}
    </div>
  </div>

  <div
    className={`rounded-lg border border-dark-primary/30 ${
      theme === "dark" ? "bg-dark-card" : "bg-light-card"
    } shadow-lg p-6 animate-slide-up`}
  >
    <h2
      className={`text-xl font-semibold mb-4 font-sans ${
        theme === "dark" ? "text-dark-text-primary" : "text-light-text-primary"
      }`}
    >
      Répartition par région
    </h2>
    <div className="h-64">
      {isPaidPlan ? (
        regionChartData.length === 0 ? (
          <p
            className={`text-center ${
              theme === "dark" ? "text-dark-text-secondary" : "text-light-text-secondary"
            }`}
          >
            Aucune donnée disponible
          </p>
        ) : (
          <Pie data={regionChartDataConfig} options={chartOptions} />
        )
      ) : (
        <div
          className={`text-center h-64 flex flex-col items-center justify-center text-sm font-sans ${
            theme === "dark" ? "text-dark-text-secondary" : "text-light-text-secondary"
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
              addToast("Passez à un plan Premium pour accéder à cette fonctionnalité", "info");
              navigate("/dashboard/pricing");
            }}
          >
            Passer à Premium
          </button>
        </div>
      )}
    </div>
  </div>
</div>
      
      <div
        className={`rounded-lg border border-dark-primary/30 ${
          theme === "dark" ? "bg-dark-card" : "bg-light-card"
        } shadow-lg p-6 animate-slide-up`}
      >
        <h2
          className={`text-xl font-semibold mb-4 font-sans ${
            theme === "dark"
              ? "text-dark-text-primary"
              : "text-light-text-primary"
          }`}
        >
          Détails des scans
        </h2>
        <div className="overflow-x-auto rounded-lg border border-dark-primary/30">
          <table className="w-full text-sm">
            <thead
              className={`${
                theme === "dark"
                  ? "bg-dark-background/50"
                  : "bg-light-background/50"
              }`}
            >
              <tr className="border-b border-dark-primary/30">
                <th
                  className={`text-left py-3 px-4 font-medium ${
                    theme === "dark"
                      ? "text-dark-text-secondary"
                      : "text-light-text-secondary"
                  }`}
                >
                  Date
                </th>
                <th
                  className={`text-left py-3 px-4 font-medium ${
                    theme === "dark"
                      ? "text-dark-text-secondary"
                      : "text-light-text-secondary"
                  }`}
                >
                  IP
                </th>
                <th
                  className={`text-left py-3 px-4 font-medium ${
                    theme === "dark"
                      ? "text-dark-text-secondary"
                      : "text-light-text-secondary"
                  }`}
                >
                  Ville
                </th>
                <th
                  className={`text-left py-3 px-4 font-medium ${
                    theme === "dark"
                      ? "text-dark-text-secondary"
                      : "text-light-text-secondary"
                  }`}
                >
                  Pays
                </th>
                {isPremiumOrEnterprise && (
                  <>
                    <th
                      className={`text-left py-3 px-4 font-medium ${
                        theme === "dark"
                          ? "text-dark-text-secondary"
                          : "text-light-text-secondary"
                      }`}
                    >
                      Région
                    </th>
                    <th
                      className={`text-left py-3 px-4 font-medium ${
                        theme === "dark"
                          ? "text-dark-text-secondary"
                          : "text-light-text-secondary"
                      }`}
                    >
                      Fuseau horaire
                    </th>
                    <th
                      className={`text-left py-3 px-4 font-medium ${
                        theme === "dark"
                          ? "text-dark-text-secondary"
                          : "text-light-text-secondary"
                      }`}
                    >
                      Agent utilisateur
                    </th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {scans.length === 0 ? (
                <tr>
                  <td
                    colSpan={isPremiumOrEnterprise ? 7 : 4}
                    className={`text-center py-6 ${
                      theme === "dark"
                        ? "text-dark-text-secondary"
                        : "text-light-text-secondary"
                    }`}
                  >
                    Aucun scan enregistré
                  </td>
                </tr>
              ) : (
                scans.map((scan) => (
                  <tr
                    key={scan.id}
                    className={`border-b border-dark-primary/30 last:border-0 hover:${
                      theme === "dark"
                        ? "bg-dark-background/30"
                        : "bg-light-background/30"
                    } transition-colors`}
                  >
                    <td
                      className={`py-3 px-4 ${
                        theme === "dark"
                          ? "text-dark-text-primary"
                          : "text-light-text-primary"
                      }`}
                    >
                      {format(new Date(scan.scanned_at), "dd/MM/yyyy HH:mm")}
                    </td>
                    <td
                      className={`py-3 px-4 ${
                        theme === "dark"
                          ? "text-dark-text-primary"
                          : "text-light-text-primary"
                      }`}
                    >
                      {scan.ip_address || "N/A"}
                    </td>
                    <td
                      className={`py-3 px-4 ${
                        theme === "dark"
                          ? "text-dark-text-primary"
                          : "text-light-text-primary"
                      }`}
                    >
                      {scan.city || "Inconnu"}
                    </td>
                    <td
                      className={`py-3 px-4 ${
                        theme === "dark"
                          ? "text-dark-text-primary"
                          : "text-light-text-primary"
                      }`}
                    >
                      {scan.country || "Inconnu"}
                    </td>
                    {isPremiumOrEnterprise && (
                      <>
                        <td
                          className={`py-3 px-4 ${
                            theme === "dark"
                              ? "text-dark-text-primary"
                              : "text-light-text-primary"
                          }`}
                        >
                          {scan.region || "Inconnu"}
                        </td>
                        <td
                          className={`py-3 px-4 ${
                            theme === "dark"
                              ? "text-dark-text-primary"
                              : "text-light-text-primary"
                          }`}
                        >
                          {scan.timezone || "N/A"}
                        </td>
                        <td
                          className={`py-3 px-4 ${
                            theme === "dark"
                              ? "text-dark-text-primary"
                              : "text-light-text-primary"
                          }`}
                        >
                          {scan.user_agent || "N/A"}
                        </td>
                      </>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default QRStatsPage;
