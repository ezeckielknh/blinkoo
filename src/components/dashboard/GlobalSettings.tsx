import { useState } from "react";
import { useTheme } from "../../contexts/ThemeContext";
import { useAuth } from "../../contexts/AuthContext";
import { Save, Upload, Key, Clock, BarChart2, AlertCircle } from "lucide-react";

interface Settings {
  limits: {
    free: number;
    premium: number;
    enterprise: number;
  };
  duration: {
    links: number;
    qrCodes: number;
  };
  apiKeys: {
    sms: string;
    feexPay: string;
    googleAuth: string;
  };
  qrLogo: string;
}

const GlobalSettings = () => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [settings, setSettings] = useState<Settings>({
    limits: {
      free: 5,
      premium: 50,
      enterprise: 500,
    },
    duration: {
      links: 30,
      qrCodes: 30,
    },
    apiKeys: {
      sms: "",
      feexPay: "",
      googleAuth: "",
    },
    qrLogo: "",
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>(settings.qrLogo);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSaving, setIsSaving] = useState(false);
  const [showTooltip, setShowTooltip] = useState<{ [key: string]: boolean }>({});

  // Validate form inputs
  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (settings.limits.free < 0) newErrors.free = "La limite doit être positive";
    if (settings.limits.premium < 0) newErrors.premium = "La limite doit être positive";
    if (settings.limits.enterprise < 0) newErrors.enterprise = "La limite doit être positive";
    if (settings.duration.links < 0) newErrors.links = "La durée doit être positive";
    if (settings.duration.qrCodes < 0) newErrors.qrCodes = "La durée doit être positive";
    if (logoFile && logoFile.size > 2 * 1024 * 1024) {
      newErrors.logo = "L'image doit être inférieure à 2 Mo";
    } else if (logoFile && !["image/png", "image/jpeg"].includes(logoFile.type)) {
      newErrors.logo = "Seuls les formats PNG et JPG sont acceptés";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle logo file upload
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setLogoPreview(reader.result as string);
        setSettings({ ...settings, qrLogo: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle form submission
  const handleSave = () => {
    if (!validateForm()) return;
    setIsSaving(true);
    // Simulate API call
    setTimeout(() => {
      alert("Paramètres enregistrés avec succès !");
      setIsSaving(false);
    }, 1000);
  };

  // Reset logo to default (empty)
  const handleResetLogo = () => {
    setLogoFile(null);
    setLogoPreview("");
    setSettings({ ...settings, qrLogo: "" });
  };

  if (user?.role !== "super_admin") {
    return (
      <div
        className={`flex justify-center items-center h-screen ${
          theme === "dark" ? "text-dark-text-primary" : "text-light-text-primary"
        }`}
      >
        Accès réservé aux super-admins.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1
        className={`text-2xl font-bold tracking-tight font-sans ${
          theme === "dark" ? "text-dark-primary" : "text-light-primary"
        } animate-fade-in`}
      >
        Paramètres globaux
      </h1>

      {/* Settings Card */}
      <div
        className={`p-6 rounded-xl border border-dark-primary/30 ${
          theme === "dark" ? "bg-dark-card" : "bg-light-card"
        } shadow-lg animate-slide-up`}
      >
        {/* Limits Section */}
        <div className="mb-8">
          <h2
            className={`text-lg font-semibold mb-4 font-sans ${
              theme === "dark" ? "text-dark-tertiary" : "text-light-tertiary"
            } flex items-center gap-2`}
          >
            <BarChart2 size={20} /> Limites par défaut
            <div className="relative">
              <AlertCircle
                size={16}
                className="cursor-pointer"
                onMouseEnter={() => setShowTooltip({ ...showTooltip, limits: true })}
                onMouseLeave={() => setShowTooltip({ ...showTooltip, limits: false })}
              />
              {showTooltip.limits && (
                <div
                  className={`absolute left-6 top-0 z-10 p-2 rounded-lg text-sm font-sans ${
                    theme === "dark" ? "bg-dark-background text-dark-text-primary" : "bg-light-background text-light-text-primary"
                  } shadow-md w-48`}
                >
                  Nombre maximum de liens créés par jour pour chaque plan.
                </div>
              )}
            </div>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium font-sans">Plan Gratuit</label>
              <input
                type="number"
                value={settings.limits.free}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    limits: { ...settings.limits, free: Number(e.target.value) },
                  })
                }
                className={`w-full px-4 py-2 rounded-lg border-none font-sans ${
                  theme === "dark"
                    ? "bg-dark-background/50 text-dark-text-primary placeholder-dark-text-secondary"
                    : "bg-light-background/50 text-light-text-primary placeholder-light-text-secondary"
                } focus:outline-none focus:ring-2 focus:ring-dark-primary transition-all ${
                  theme === "light" ? "focus:ring-light-primary" : ""
                } ${errors.free ? "border-dark-danger" : ""}`}
                placeholder="Liens/jour"
              />
              {errors.free && (
                <p className={`text-sm font-sans ${theme === "dark" ? "text-dark-danger" : "text-light-danger"}`}>
                  {errors.free}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium font-sans">Plan Premium</label>
              <input
                type="number"
                value={settings.limits.premium}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    limits: { ...settings.limits, premium: Number(e.target.value) },
                  })
                }
                className={`w-full px-4 py-2 rounded-lg border-none font-sans ${
                  theme === "dark"
                    ? "bg-dark-background/50 text-dark-text-primary placeholder-dark-text-secondary"
                    : "bg-light-background/50 text-light-text-primary placeholder-light-text-secondary"
                } focus:outline-none focus:ring-2 focus:ring-dark-primary transition-all ${
                  theme === "light" ? "focus:ring-light-primary" : ""
                } ${errors.premium ? "border-dark-danger" : ""}`}
                placeholder="Liens/jour"
              />
              {errors.premium && (
                <p className={`text-sm font-sans ${theme === "dark" ? "text-dark-danger" : "text-light-danger"}`}>
                  {errors.premium}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium font-sans">Plan Entreprise</label>
              <input
                type="number"
                value={settings.limits.enterprise}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    limits: { ...settings.limits, enterprise: Number(e.target.value) },
                  })
                }
                className={`w-full px-4 py-2 rounded-lg border-none font-sans ${
                  theme === "dark"
                    ? "bg-dark-background/50 text-dark-text-primary placeholder-dark-text-secondary"
                    : "bg-light-background/50 text-light-text-primary placeholder-light-text-secondary"
                } focus:outline-none focus:ring-2 focus:ring-dark-primary transition-all ${
                  theme === "light" ? "focus:ring-light-primary" : ""
                } ${errors.enterprise ? "border-dark-danger" : ""}`}
                placeholder="Liens/jour"
              />
              {errors.enterprise && (
                <p className={`text-sm font-sans ${theme === "dark" ? "text-dark-danger" : "text-light-danger"}`}>
                  {errors.enterprise}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Duration Section */}
        <div className="mb-8">
          <h2
            className={`text-lg font-semibold mb-4 font-sans ${
              theme === "dark" ? "text-dark-tertiary" : "text-light-tertiary"
            } flex items-center gap-2`}
          >
            <Clock size={20} /> Durée par défaut
            <div className="relative">
              <AlertCircle
                size={16}
                className="cursor-pointer"
                onMouseEnter={() => setShowTooltip({ ...showTooltip, duration: true })}
                onMouseLeave={() => setShowTooltip({ ...showTooltip, duration: false })}
              />
              {showTooltip.duration && (
                <div
                  className={`absolute left-6 top-0 z-10 p-2 rounded-lg text-sm font-sans ${
                    theme === "dark" ? "bg-dark-background text-dark-text-primary" : "bg-light-background text-light-text-primary"
                  } shadow-md w-48`}
                >
                  Durée d'expiration par défaut si non spécifiée (en jours, 0 pour jamais).
                </div>
              )}
            </div>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium font-sans">Liens</label>
              <input
                type="number"
                value={settings.duration.links}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    duration: { ...settings.duration, links: Number(e.target.value) },
                  })
                }
                className={`w-full px-4 py-2 rounded-lg border-none font-sans ${
                  theme === "dark"
                    ? "bg-dark-background/50 text-dark-text-primary placeholder-dark-text-secondary"
                    : "bg-light-background/50 text-light-text-primary placeholder-light-text-secondary"
                } focus:outline-none focus:ring-2 focus:ring-dark-primary transition-all ${
                  theme === "light" ? "focus:ring-light-primary" : ""
                } ${errors.links ? "border-dark-danger" : ""}`}
                placeholder="Jours (0 = jamais)"
              />
              {errors.links && (
                <p className={`text-sm font-sans ${theme === "dark" ? "text-dark-danger" : "text-light-danger"}`}>
                  {errors.links}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium font-sans">QR Codes</label>
              <input
                type="number"
                value={settings.duration.qrCodes}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    duration: { ...settings.duration, qrCodes: Number(e.target.value) },
                  })
                }
                className={`w-full px-4 py-2 rounded-lg border-none font-sans ${
                  theme === "dark"
                    ? "bg-dark-background/50 text-dark-text-primary placeholder-dark-text-secondary"
                    : "bg-light-background/50 text-light-text-primary placeholder-light-text-secondary"
                } focus:outline-none focus:ring-2 focus:ring-dark-primary transition-all ${
                  theme === "light" ? "focus:ring-light-primary" : ""
                } ${errors.qrCodes ? "border-dark-danger" : ""}`}
                placeholder="Jours (0 = jamais)"
              />
              {errors.qrCodes && (
                <p className={`text-sm font-sans ${theme === "dark" ? "text-dark-danger" : "text-light-danger"}`}>
                  {errors.qrCodes}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* API Keys Section */}
        <div className="mb-8">
          <h2
            className={`text-lg font-semibold mb-4 font-sans ${
              theme === "dark" ? "text-dark-tertiary" : "text-light-tertiary"
            } flex items-center gap-2`}
          >
            <Key size={20} /> Clés API externes
            <div className="relative">
              <AlertCircle
                size={16}
                className="cursor-pointer"
                onMouseEnter={() => setShowTooltip({ ...showTooltip, apiKeys: true })}
                onMouseLeave={() => setShowTooltip({ ...showTooltip, apiKeys: false })}
              />
              {showTooltip.apiKeys && (
                <div
                  className={`absolute left-6 top-0 z-10 p-2 rounded-lg text-sm font-sans ${
                    theme === "dark" ? "bg-dark-background text-dark-text-primary" : "bg-light-background text-light-text-primary"
                  } shadow-md w-48`}
                >
                  Clés pour intégrer des services externes (SMS, paiement, authentification).
                </div>
              )}
            </div>
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium font-sans">Clé SMS</label>
              <input
                type="text"
                value={settings.apiKeys.sms}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    apiKeys: { ...settings.apiKeys, sms: e.target.value },
                  })
                }
                className={`w-full px-4 py-2 rounded-lg border-none font-sans ${
                  theme === "dark"
                    ? "bg-dark-background/50 text-dark-text-primary placeholder-dark-text-secondary"
                    : "bg-light-background/50 text-light-text-primary placeholder-light-text-secondary"
                } focus:outline-none focus:ring-2 focus:ring-dark-primary transition-all ${
                  theme === "light" ? "focus:ring-light-primary" : ""
                }`}
                placeholder="Entrez la clé SMS"
              />
            </div>
            <div>
              <label className="block text-sm font-medium font-sans">Clé FeexPay</label>
              <input
                type="text"
                value={settings.apiKeys.feexPay}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    apiKeys: { ...settings.apiKeys, feexPay: e.target.value },
                  })
                }
                className={`w-full px-4 py-2 rounded-lg border-none font-sans ${
                  theme === "dark"
                    ? "bg-dark-background/50 text-dark-text-primary placeholder-dark-text-secondary"
                    : "bg-light-background/50 text-light-text-primary placeholder-light-text-secondary"
                } focus:outline-none focus:ring-2 focus:ring-dark-primary transition-all ${
                  theme === "light" ? "focus:ring-light-primary" : ""
                }`}
                placeholder="Entrez la clé FeexPay"
              />
            </div>
            <div>
              <label className="block text-sm font-medium font-sans">Clé Google Auth</label>
              <input
                type="text"
                value={settings.apiKeys.googleAuth}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    apiKeys: { ...settings.apiKeys, googleAuth: e.target.value },
                  })
                }
                className={`w-full px-4 py-2 rounded-lg border-none font-sans ${
                  theme === "dark"
                    ? "bg-dark-background/50 text-dark-text-primary placeholder-dark-text-secondary"
                    : "bg-light-background/50 text-light-text-primary placeholder-light-text-secondary"
                } focus:outline-none focus:ring-2 focus:ring-dark-primary transition-all ${
                  theme === "light" ? "focus:ring-light-primary" : ""
                }`}
                placeholder="Entrez la clé Google Auth"
              />
            </div>
          </div>
        </div>

        {/* QR Logo Section */}
        <div className="mb-8">
          <h2
            className={`text-lg font-semibold mb-4 font-sans ${
              theme === "dark" ? "text-dark-tertiary" : "text-light-tertiary"
            } flex items-center gap-2`}
          >
            <Upload size={20} /> Logo par défaut pour QR
            <div className="relative">
              <AlertCircle
                size={16}
                className="cursor-pointer"
                onMouseEnter={() => setShowTooltip({ ...showTooltip, qrLogo: true })}
                onMouseLeave={() => setShowTooltip({ ...showTooltip, qrLogo: false })}
              />
              {showTooltip.qrLogo && (
                <div
                  className={`absolute left-6 top-0 z-10 p-2 rounded-lg text-sm font-sans ${
                    theme === "dark" ? "bg-dark-background text-dark-text-primary" : "bg-light-background text-light-text-primary"
                  } shadow-md w-48`}
                >
                  Logo utilisé pour les QR codes si aucun n'est fourni (PNG/JPG, &lt;2 Mo).
                </div>
              )}
            </div>
          </h2>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="file"
                accept="image/png,image/jpeg"
                onChange={handleLogoUpload}
                className={`w-full px-4 py-2 rounded-lg border-none font-sans ${
                  theme === "dark"
                    ? "bg-dark-background/50 text-dark-text-primary"
                    : "bg-light-background/50 text-light-text-primary"
                } focus:outline-none focus:ring-2 focus:ring-dark-primary transition-all ${
                  theme === "light" ? "focus:ring-light-primary" : ""
                } ${errors.logo ? "border-dark-danger" : ""}`}
              />
              {errors.logo && (
                <p className={`text-sm font-sans ${theme === "dark" ? "text-dark-danger" : "text-light-danger"}`}>
                  {errors.logo}
                </p>
              )}
              {logoPreview && (
                <button
                  onClick={handleResetLogo}
                  className={`mt-2 px-4 py-2 rounded-lg font-sans ${
                    theme === "dark"
                      ? "bg-dark-danger text-dark-text-primary hover:bg-dark-danger/80"
                      : "bg-light-danger text-light-text-primary hover:bg-light-danger/80"
                  } transition-all animate-pulse hover:animate-none`}
                >
                  Réinitialiser le logo
                </button>
              )}
            </div>
            {logoPreview && (
              <div className="flex-shrink-0">
                <img
                  src={logoPreview}
                  alt="Aperçu du logo QR"
                  className="w-24 h-24 object-contain rounded-lg"
                />
              </div>
            )}
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className={`px-6 py-2 rounded-lg font-sans flex items-center gap-2 ${
              theme === "dark"
                ? "bg-dark-primary text-dark-text-primary hover:bg-dark-secondary"
                : "bg-light-primary text-light-text-primary hover:bg-light-secondary"
            } transition-all animate-pulse hover:animate-none ${isSaving ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <Save size={20} /> {isSaving ? "Enregistrement..." : "Enregistrer les modifications"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GlobalSettings;