import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";
import { useTheme } from "../../contexts/ThemeContext";
import { BarChart2, Link2, QrCode, FileBox, CreditCard, Loader2 } from "lucide-react";
import logoImage from "../../assets/bliccc.png";

interface Link {
  id: string;
  short_url?: string;
  click_count?: number;
  created_at?: string;
}

interface QRCode {
  id: string;
  short_code?: string;
  scan_count?: number;
  created_at?: string;
}

interface FileLink {
  id: string;
  name?: string;
  download_count?: number;
  created_at?: string;
  expiration?: string;
}

interface User {
  name?: string;
  plan?: string;
  access?: {
    trial_started_at?: string;
    trial_ends_at?: string;
    trial_status?: "none" | "active" | "expired";
  };
  short_links?: Link[];
  qr_codes?: QRCode[];
  file_links?: FileLink[];
  token?: string;
}

interface TrialStatus {
  trial_active: boolean;
  trial_ends_at?: string;
  days_remaining: number;
}

const DashboardHome = () => {
  const { user, startTrial, refreshUser, getTrialStatus } = useAuth();
  const { theme } = useTheme();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [trialStatus, setTrialStatus] = useState<TrialStatus | null>(null);
  const [trialLoading, setTrialLoading] = useState(false);

  const isPremium = user?.plan && user.plan !== "free";
  const planName = user?.plan
    ? user.plan === "premium"
      ? "Premium"
      : user.plan === "premium_quarterly"
      ? "Premium trimestriel"
      : user.plan === "premium_annual"
      ? "Premium annuel"
      : user.plan === "enterprise"
      ? "Enterprise"
      : "Decouverte"
    : "Decouverte";

  const formatDate = (dateString: string | number | Date) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const calculateDaysRemaining = (endDate: string | number | Date) => {
    if (!endDate) return 0;
    const today = new Date();
    const end = new Date(endDate);
    const diffTime = end.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };


  useEffect(() => {
    if (!user) {
      addToast("Veuillez vous connecter pour accéder au tableau de bord", "error");
      navigate("/login");
      return;
    }
    // refreshUser();

    const fetchTrialStatus = async () => {
      try {
        const status = await getTrialStatus();
        // refreshUser();
        setTrialStatus(status);
      } catch (error: any) {
        addToast(error.message, "error");
      } finally {
        setLoading(false);
      }
    };

    // Refresh user data and fetch trial status
    // refreshUser();
    fetchTrialStatus();
  }, [user, navigate, addToast, getTrialStatus]);

  const handleStartTrial = async () => {
    setTrialLoading(true);
    try {
      await startTrial();
      const status = await getTrialStatus();
      setTrialStatus(status);
      addToast("Essai Premium de 14 jours activé !", "success");
    } catch (error: any) {
      addToast(error.message, "error");
    } finally {
      setTrialLoading(false);
    }
  };

  // Fallbacks for user data
  const shortLinks = user?.short_links || [];
  const qrCodes = user?.qr_codes || [];
  const fileLinks = user?.file_links || [];

  // Calculate totals
const totalClicks = shortLinks?.reduce((sum, b) => sum + (b.click_count ?? 0), 0);
const totalScans = qrCodes?.reduce((sum, b) => sum + (b.click_count ?? 0), 0);
const totalDownloads = fileLinks?.reduce((sum, b) => sum + (b.download_count ?? 0), 0);
  // Dynamic recent activity
  const recentActivities = [
    ...shortLinks.map((link) => ({
      type: "Link",
      name: link.short_url || "Lien sans nom",
      date: link.created_at || new Date().toISOString(),
      id: link.id,
    })),
    ...qrCodes.map((qr) => ({
      type: "QR Code",
      name: qr.short_code || "QR sans nom",
      date: qr.created_at || new Date().toISOString(),
      id: qr.id,
    })),
    ...fileLinks.map((file) => ({
      type: "Fichier",
      name: file.name || "Fichier sans nom",
      date: file.created_at || new Date().toISOString(),
      id: file.id,
    })),
  ]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const stats = [
    { name: "Liens Créés", value: shortLinks.length, icon: Link2 },
    { name: "Codes QR", value: qrCodes.length, icon: QrCode },
    { name: "Fichiers Partagés", value: fileLinks.length, icon: FileBox },
    { name: "Total Clics", value: totalClicks, icon: BarChart2 },
  ];

  if (!user) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${
          theme === "dark" ? "bg-dark-background" : "bg-light-background"
        }`}
      >
        <p
          className={`text-center ${
            theme === "dark" ? "text-dark-text-secondary" : "text-light-text-secondary"
          }`}
        >
          Veuillez vous connecter pour accéder au tableau de bord.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${
          theme === "dark" ? "bg-dark-background" : "bg-light-background"
        }`}
      >
        <Loader2
          size={32}
          className={`animate-spin ${
            theme === "dark" ? "text-dark-text-secondary" : "text-light-text-secondary"
          }`}
        />
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen p-6 space-y-8 ${
        theme === "dark" ? "bg-dark-background" : "bg-light-background"
      }`}
    >
      <div className="flex items-center justify-between pt-4">
        <h1
          className={`text-3xl font-bold font-sans ${
            theme === "dark" ? "text-dark-text-primary" : "text-light-text-primary"
          }`}
        >
          Bon retour, {user.name || "Utilisateur"} !
        </h1>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.name}
              className={`rounded-lg border border-dark-primary/30 ${
                theme === "dark" ? "bg-dark-card" : "bg-light-card"
              } shadow-lg p-6 animate-slide-up`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p
                    className={`text-sm font-medium ${
                      theme === "dark" ? "text-dark-text-secondary" : "text-light-text-secondary"
                    }`}
                  >
                    {stat.name}
                  </p>
                  <p
                    className={`text-2xl font-semibold mt-1 ${
                      theme === "dark" ? "text-dark-text-primary" : "text-light-text-primary"
                    }`}
                  >
                    {stat.value}
                  </p>
                </div>
                <div
                  className={`p-2 ${
                    theme === "dark" ? "bg-dark-primary/10" : "bg-light-primary/10"
                  } rounded-lg`}
                >
                  <Icon
                    size={20}
                    className={theme === "dark" ? "text-dark-primary" : "text-light-primary"}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Activity */}
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
          Activité Récente
        </h2>
        {recentActivities.length > 0 ? (
          <div className="overflow-x-auto rounded-lg border border-dark-primary/30">
            <table className="w-full text-sm">
              <thead
                className={`${
                  theme === "dark" ? "bg-dark-background/50" : "bg-light-background/50"
                }`}
              >
                <tr className="border-b border-dark-primary/30">
                  <th
                    className={`text-left py-3 px-4 font-medium ${
                      theme === "dark" ? "text-dark-text-secondary" : "text-light-text-secondary"
                    }`}
                  >
                    Type
                  </th>
                  <th
                    className={`text-left py-3 px-4 font-medium ${
                      theme === "dark" ? "text-dark-text-secondary" : "text-light-text-secondary"
                    }`}
                  >
                    Nom
                  </th>
                  <th
                    className={`text-center py-3 px-4 font-medium ${
                      theme === "dark" ? "text-dark-text-secondary" : "text-light-text-secondary"
                    }`}
                  >
                    Date
                  </th>
                  <th
                    className={`text-right py-3 px-4 font-medium ${
                      theme === "dark" ? "text-dark-text-secondary" : "text-light-text-secondary"
                    }`}
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentActivities.map((activity) => (
                  <tr
                    key={`${activity.type}-${activity.id}`}
                    className={`border-b border-dark-primary/30 last:border-0 hover:${
                      theme === "dark" ? "bg-dark-background/30" : "bg-light-background/30"
                    } transition-colors`}
                  >
                    <td
                      className={`py-3 px-4 ${
                        theme === "dark" ? "text-dark-text-primary" : "text-light-text-primary"
                      }`}
                    >
                      {activity.type}
                    </td>
                    <td
                      className={`py-3 px-4 ${
                        theme === "dark" ? "text-dark-text-primary" : "text-light-text-primary"
                      }`}
                    >
                      {activity.name}
                    </td>
                    <td
                      className={`text-center py-3 px-4 ${
                        theme === "dark" ? "text-dark-text-secondary" : "text-light-text-secondary"
                      }`}
                    >
                      {new Date(activity.date).toLocaleDateString("fr-FR", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="text-right py-3 px-4">
                      <button
                        className={`font-sans text-sm ${
                          theme === "dark"
                            ? "text-dark-primary hover:text-dark-secondary"
                            : "text-light-primary hover:text-light-secondary-dark"
                        } hover:underline`}
                        onClick={() =>
                          navigate(
                            activity.type === "Fichier"
                              ? `/file/${activity.id}/stats`
                              : activity.type === "Link"
                              ? `/link/${activity.id}/stats`
                              : `/qr/${activity.id}/stats`
                          )
                        }
                      >
                        Voir
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p
            className={`text-center py-6 ${
              theme === "dark" ? "text-dark-text-secondary" : "text-light-text-secondary"
            }`}
          >
            Aucune activité récente à afficher.
          </p>
        )}
      </div>

      {/* Recent Files */}
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
          Fichiers Récents
        </h2>
        {fileLinks.length > 0 ? (
          <div className="overflow-x-auto rounded-lg border border-dark-primary/30">
            <table className="w-full text-sm">
              <thead
                className={`${
                  theme === "dark" ? "bg-dark-background/50" : "bg-light-background/50"
                }`}
              >
                <tr className="border-b border-dark-primary/30">
                  <th
                    className={`text-left py-3 px-4 font-medium ${
                      theme === "dark" ? "text-dark-text-secondary" : "text-light-text-secondary"
                    }`}
                  >
                    Nom
                  </th>
                  <th
                    className={`text-center py-3 px-4 font-medium ${
                      theme === "dark" ? "text-dark-text-secondary" : "text-light-text-secondary"
                    }`}
                  >
                    Téléchargements
                  </th>
                  <th
                    className={`text-center py-3 px-4 font-medium ${
                      theme === "dark" ? "text-dark-text-secondary" : "text-light-text-secondary"
                    }`}
                  >
                    Expiration
                  </th>
                  <th
                    className={`text-right py-3 px-4 font-medium ${
                      theme === "dark" ? "text-dark-text-secondary" : "text-light-text-secondary"
                    }`}
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {fileLinks.map((file) => (
                  <tr
                    key={file.id}
                    className={`border-b border-dark-primary/30 last:border-0 hover:${
                      theme === "dark" ? "bg-dark-background/30" : "bg-light-background/30"
                    } transition-colors`}
                  >
                    <td
                      className={`py-3 px-4 ${
                        theme === "dark" ? "text-dark-text-primary" : "text-light-text-primary"
                      }`}
                    >
                      {file.name || "Fichier sans nom"}
                    </td>
                    <td
                      className={`text-center py-3 px-4 ${
                        theme === "dark" ? "text-dark-text-secondary" : "text-light-text-secondary"
                      }`}
                    >
                      {file.download_count || 0}
                    </td>
                    <td
                      className={`text-center py-3 px-4 ${
                        theme === "dark" ? "text-dark-text-secondary" : "text-light-text-secondary"
                      }`}
                    >
                      {file.expiration
                        ? new Date(file.expiration).toLocaleDateString("fr-FR", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })
                        : "N/A"}
                    </td>
                    <td className="text-right py-3 px-4">
                      <button
                        className={`font-sans text-sm ${
                          theme === "dark"
                            ? "text-dark-primary hover:text-dark-secondary"
                            : "text-light-primary hover:text-light-secondary-dark"
                        } hover:underline`}
                        onClick={() => (window.location.href = `/file/${file.id}/download`)}
                      >
                        Télécharger
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p
            className={`text-center py-6 ${
              theme === "dark" ? "text-dark-text-secondary" : "text-light-text-secondary"
            }`}
          >
            Aucun fichier récent à afficher.
          </p>
        )}
      </div>

      {/* Subscription Card */}
      <div
        className={`rounded-lg border border-dark-primary/30 ${
          theme === "dark" ? "bg-dark-card" : "bg-light-card"
        } shadow-lg p-6 animate-slide-up`}
      >
        <div className="flex items-start justify-between">
          <div>
            <h3
              className={`text-xl font-semibold mb-2 font-sans ${
                theme === "dark" ? "text-dark-text-primary" : "text-light-text-primary"
              }`}
            >
              Plan Actuel : {user.plan && ["premium", "premium_quarterly", "premium_annual", "enterprise"].includes(user.plan) ? "Premium" : "Découverte"}
            </h3>
            <p
              className={`text-base mb-4 ${
                theme === "dark" ? "text-dark-text-secondary" : "text-light-text-secondary"
              }`}
            >
              {trialStatus?.trial_active ? (
                `Essai Premium actif ! ${trialStatus.days_remaining} jour(s) restant(s).`
              ) : user.plan === "free" ? (
                trialStatus?.trial_ends_at ? (
                  "Votre essai Premium a expiré. Passez à un plan payant pour continuer !"
                ) : (
                  "Essayez Premium gratuitement pendant 14 jours ou passez à un plan payant !"
                )
              ) : (
                "Vous profitez pleinement des fonctionnalités Premium !"
              )}
            </p>
            {user.plan === "free" && (
              <div className="flex space-x-2">
                {!trialStatus?.trial_ends_at && (
                  <button
                    className={`px-4 py-2 rounded-lg font-sans text-sm flex items-center justify-center transition-all ${
                      theme === "dark"
                        ? "bg-dark-primary text-dark-text-primary hover:bg-dark-secondary/80"
                        : "bg-light-primary text-light-text-primary hover:bg-light-secondary-dark"
                    } ${trialLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                    onClick={handleStartTrial}
                    disabled={trialLoading}
                  >
                    {trialLoading ? (
                      <Loader2 size={16} className="animate-spin mr-2" />
                    ) : (
                      "Essayer Premium Gratuitement"
                    )}
                  </button>
                )}
                <button
                  className={`px-4 py-2 rounded-lg font-sans text-sm flex items-center justify-center transition-all ${
                    theme === "dark"
                      ? "bg-dark-secondary text-dark-text-primary hover:bg-dark-primary/80"
                      : "bg-light-secondary text-light-text-primary hover:bg-light-primary/80"
                  }`}
                  onClick={() => navigate("/dashboard/subscription")}
                >
                  Voir les Plans
                </button>
              </div>
            )}
            {trialStatus?.trial_active && (
              <p
                className={`text-sm mt-2 ${
                  theme === "dark" ? "text-dark-text-secondary" : "text-light-text-secondary"
                }`}
              >
                Votre essai se termine le{" "}
                {trialStatus.trial_ends_at
                  ? new Date(trialStatus.trial_ends_at).toLocaleDateString("fr-FR", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })
                  : "N/A"}
              </p>
            )}
          </div>
          <div
            className={`p-3 ${
              theme === "dark" ? "bg-dark-primary/10" : "bg-light-primary/10"
            } rounded-lg`}
          >
            <CreditCard
              size={24}
              className={theme === "dark" ? "text-dark-primary" : "text-light-primary"}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;