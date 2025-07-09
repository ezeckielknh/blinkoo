
import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";
import { Eye, EyeOff, Save, Bell, BellOff } from "lucide-react";
import { API } from "../../utils/api";
import * as dateFns from "date-fns";
import { fr } from "date-fns/locale";
import { motion } from "framer-motion";
import { useTheme } from "../../contexts/ThemeContext";

const Profile = () => {
  const { user, setUser } = useAuth();
  const { addToast } = useToast();
  const { theme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [renewPlanLoading, setRenewPlanLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(API.USERS.UPDATE_USER, {
        method: "POST",
        headers: {
          ...(user ? { Authorization: `Bearer ${user.token}` } : {}),
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
        }),
      });

      const data = (await response.json()) as { message?: string; user?: any };
      addToast(
        data.message || "Informations mises à jour avec succès.",
        "success"
      );
      if (data.user) {
        const updatedUser = { ...user, ...data.user };
        setUser(updatedUser);
        localStorage.setItem("bliic_user", JSON.stringify(updatedUser));
      }
    } catch (error: any) {
      addToast(
        error.response?.data?.message || "Erreur lors de la mise à jour du profil.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(API.USERS.UPDATE_PASSWORD, {
        method: "POST",
        headers: {
          ...(user ? { Authorization: `Bearer ${user.token}` } : {}),
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          current_password: formData.currentPassword,
          new_password: formData.newPassword,
          new_password_confirmation: formData.confirmPassword,
        }),
      });

      const data = (await response.json()) as { message?: string };
      if (response.ok) {
        addToast(
          data.message || "Mot de passe mis à jour avec succès.",
          "success"
        );
      } else {
        addToast(
          data.message || "Erreur lors de la mise à jour du mot de passe.",
          "error"
        );
      }
    } catch (error: any) {
      addToast(
        error.response?.data?.message || "Erreur lors de la mise à jour du mot de passe.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleToggleRenewPlan = async () => {
    setRenewPlanLoading(true);
    try {
      const response = await fetch(API.USERS.TOGGLE_RENEW_PLAN, {
        method: "POST",
        headers: {
          ...(user ? { Authorization: `Bearer ${user.token}` } : {}),
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          renew_plan: user?.renew_plan ? 0 : 1,
        }),
      });

      const data = (await response.json()) as { message?: string; renew_plan?: number };
      if (response.ok) {
        addToast(
          data.message || "Préférences de renouvellement mises à jour.",
          "success"
        );
        if (data.renew_plan !== undefined && user) {
          const updatedUser = { ...user, renew_plan: !!data.renew_plan };
          setUser(updatedUser);
          localStorage.setItem("bliic_user", JSON.stringify(updatedUser));
        }
      } else {
        addToast(
          data.message || "Erreur lors de la mise à jour des préférences de renouvellement.",
          "error"
        );
      }
    } catch (error: any) {
      addToast(
        error.response?.data?.message || "Erreur lors de la mise à jour des préférences de renouvellement.",
        "error"
      );
    } finally {
      setRenewPlanLoading(false);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="flex items-center justify-between pt-9">
        <h1 className={`text-2xl font-bold ${theme === "dark" ? "text-dark-text-primary" : "text-light-text-primary"}`}>
          Paramètres du Profil
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Informations personnelles */}
        <div className="lg:col-span-2">
          <div className={`card p-6 rounded-2xl shadow-xl ${theme === "dark" ? "bg-dark-card/90 border-dark-text-secondary/50" : "bg-gray-100 border-gray-300"}`}>
            <h2 className={`text-lg font-semibold mb-4 ${theme === "dark" ? "text-dark-text-primary" : "text-light-text-primary"}`}>
              Informations Personnelles
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="form-control">
                <label htmlFor="name" className={`form-label ${theme === "dark" ? "text-dark-text-secondary" : "text-light-text-secondary"}`}>
                  Nom Complet
                </label>
                <input
                  id="name"
                  type="text"
                  className={`form-input w-full p-3 rounded-lg border ${theme === "dark" ? "bg-dark-card text-dark-text-primary border-dark-text-secondary/50 focus:ring-dark-secondary/20" : "bg-white text-light-text-primary border-gray-300 focus:ring-light-secondary/20"}`}
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>

              <div className="form-control">
                <label htmlFor="email" className={`form-label ${theme === "dark" ? "text-dark-text-secondary" : "text-light-text-secondary"}`}>
                  Adresse Email
                </label>
                <input
                  id="email"
                  type="email"
                  className={`form-input w-full p-3 rounded-lg border ${theme === "dark" ? "bg-dark-card text-dark-text-primary border-dark-text-secondary/50 focus:ring-dark-secondary/20" : "bg-white text-light-text-primary border-gray-300 focus:ring-light-secondary/20"}`}
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>

              <motion.button
                type="submit"
                className={`btn btn-primary w-full py-3 rounded-lg font-semibold text-base flex items-center justify-center ${theme === "dark" ? "bg-dark-primary hover:bg-dark-primary/80 text-dark-text-primary" : "bg-light-primary hover:bg-light-primary/80 text-dark-text-primary"} ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                disabled={loading}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {loading ? (
                  <>
                    <span className="inline-block h-4 w-4 rounded-full border-2 border-white/20 border-t-white animate-spin mr-2" />
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <Save size={16} className="mr-2" />
                    Enregistrer les Modifications
                  </>
                )}
              </motion.button>
            </form>
          </div>
        </div>

        {/* Résumé du compte */}
        <div className="lg:col-span-1">
          <div className={`card p-6 rounded-2xl shadow-xl ${theme === "dark" ? "bg-dark-card/90 border-dark-text-secondary/50" : "bg-gray-100 border-gray-300"}`}>
            <h2 className={`text-lg font-semibold mb-4 ${theme === "dark" ? "text-dark-text-primary" : "text-light-text-primary"}`}>
              Résumé du Compte
            </h2>
            <div className="space-y-4">
              <div>
                <label className={`text-sm ${theme === "dark" ? "text-dark-text-secondary" : "text-light-text-secondary"}`}>
                  Membre Depuis
                </label>
                <p className={`font-medium ${theme === "dark" ? "text-dark-text-primary" : "text-light-text-primary"}`}>
                  {dateFns.format(
                    new Date(user?.created_at ?? ""),
                    "d MMMM yyyy",
                    { locale: fr }
                  )}
                </p>
                <label className={`text-sm ${theme === "dark" ? "text-dark-text-secondary" : "text-light-text-secondary"}`}>
                  Plan Actuel
                </label>
                <p className={`font-medium ${theme === "dark" ? "text-dark-text-primary" : "text-light-text-primary"}`}>
                  {user?.plan === "free"
                    ? "Bliic Découverte"
                    : user?.plan === "premium"
                    ? "Bliic Premium Mensuel"
                    : user?.plan === "premium_quarterly"
                    ? "Bliic Premium Trimestriel"
                    : user?.plan === "premium_annual"
                    ? "Bliic Premium Annuel"
                    : "Bliic Enterprise"}
                </p>
              </div>
              <div>
                <label className={`text-sm ${theme === "dark" ? "text-dark-text-secondary" : "text-light-text-secondary"}`}>
                  Utilisation
                </label>
                <div className="mt-1">
                  <div className={`flex justify-between text-sm mb-1 ${theme === "dark" ? "text-dark-text-secondary" : "text-light-text-secondary"}`}>
                    <span>Liens</span>
                    {user?.plan === "premium" || user?.plan === "premium_quarterly" || user?.plan === "premium_annual" || user?.plan === "enterprise" ? (
                      <span>Illimité</span>
                    ) : (
                      <span>{user?.short_links?.length || 0}/15</span>
                    )}
                  </div>
                  <div className="h-4 bg-gray-700 rounded-full overflow-hidden">
                    {user?.plan === "premium" || user?.plan === "premium_quarterly" || user?.plan === "premium_annual" || user?.plan === "enterprise" ? (
                      <div
                        className={`h-full ${theme === "dark" ? "bg-dark-primary" : "bg-light-primary"} transition-all duration-300`}
                        style={{ width: "100%" }}
                      />
                    ) : (
                      <div
                        className={`h-full ${theme === "dark" ? "bg-dark-primary" : "bg-light-primary"} transition-all duration-300`}
                        style={{
                          width: `${((user?.short_links?.length || 0) / 15) * 100}%`,
                        }}
                      />
                    )}
                  </div>
                  {(user?.plan === "premium" || user?.plan === "premium_quarterly" || user?.plan === "premium_annual" || user?.plan === "enterprise") && (
                    <p className={`text-xs ${theme === "dark" ? "text-dark-text-secondary" : "text-light-text-secondary"} mt-1 text-center`}>
                      Illimité
                    </p>
                  )}
                </div>
              </div>
              <div>
                <label className={`text-sm ${theme === "dark" ? "text-dark-text-secondary" : "text-light-text-secondary"}`}>
                  Notifications de Renouvellement
                </label>
                <motion.button
                  onClick={handleToggleRenewPlan}
                  className={`w-full py-3 rounded-lg font-semibold text-base flex items-center justify-center ${
                    user?.renew_plan
                      ? theme === "dark"
                        ? "bg-dark-danger hover:bg-dark-danger/80 text-dark-text-primary"
                        : "bg-light-danger hover:bg-light-danger/80 text-dark-text-primary"
                      : theme === "dark"
                      ? "bg-dark-primary hover:bg-dark-primary/80 text-dark-text-primary"
                      : "bg-light-primary hover:bg-light-primary/80 text-dark-text-primary"
                  } ${renewPlanLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                  disabled={renewPlanLoading}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label={
                    user?.renew_plan
                      ? "Désactiver les notifications de renouvellement"
                      : "Activer les notifications de renouvellement"
                  }
                >
                  {renewPlanLoading ? (
                    <>
                      <span className="inline-block h-4 w-4 rounded-full border-2 border-white/20 border-t-white animate-spin mr-2" />
                      Traitement...
                    </>
                  ) : user?.renew_plan ? (
                    <>
                      <BellOff size={16} className="mr-2" />
                      Désactiver les Notifications
                    </>
                  ) : (
                    <>
                      <Bell size={16} className="mr-2" />
                      Activer les Notifications
                    </>
                  )}
                </motion.button>
              </div>
            </div>
          </div>
        </div>

        {/* Changer le mot de passe */}
        <div className="lg:col-span-2">
          <div className={`card p-6 rounded-2xl shadow-xl ${theme === "dark" ? "bg-dark-card/90 border-dark-text-secondary/50" : "bg-gray-100 border-gray-300"}`}>
            <h2 className={`text-lg font-semibold mb-4 ${theme === "dark" ? "text-dark-text-primary" : "text-light-text-primary"}`}>
              Changer le Mot de Passe
            </h2>
            <form className="space-y-4">
              <div className="form-control">
                <label htmlFor="currentPassword" className={`form-label ${theme === "dark" ? "text-dark-text-secondary" : "text-light-text-secondary"}`}>
                  Mot de Passe Actuel
                </label>
                <div className="relative">
                  <input
                    id="currentPassword"
                    type={showPassword ? "text" : "password"}
                    className={`form-input w-full p-3 rounded-lg border ${theme === "dark" ? "bg-dark-card text-dark-text-primary border-dark-text-secondary/50 focus:ring-dark-secondary/20" : "bg-white text-light-text-primary border-gray-300 focus:ring-light-secondary/20"} pr-10`}
                    value={formData.currentPassword}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        currentPassword: e.target.value,
                      })
                    }
                  />
                  <button
                    type="button"
                    className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${theme === "dark" ? "text-dark-text-secondary hover:text-dark-text-primary" : "text-light-text-secondary hover:text-light-text-primary"}`}
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="form-control">
                <label htmlFor="newPassword" className={`form-label ${theme === "dark" ? "text-dark-text-secondary" : "text-light-text-secondary"}`}>
                  Nouveau Mot de Passe
                </label>
                <div className="relative">
                  <input
                    id="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    className={`form-input w-full p-3 rounded-lg border ${theme === "dark" ? "bg-dark-card text-dark-text-primary border-dark-text-secondary/50 focus:ring-dark-secondary/20" : "bg-white text-light-text-primary border-gray-300 focus:ring-light-secondary/20"} pr-10`}
                    value={formData.newPassword}
                    onChange={(e) =>
                      setFormData({ ...formData, newPassword: e.target.value })
                    }
                  />
                  <button
                    type="button"
                    className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${theme === "dark" ? "text-dark-text-secondary hover:text-dark-text-primary" : "text-light-text-secondary hover:text-light-text-primary"}`}
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="form-control">
                <label htmlFor="confirmPassword" className={`form-label ${theme === "dark" ? "text-dark-text-secondary" : "text-light-text-secondary"}`}>
                  Confirmer le Nouveau Mot de Passe
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showNewPassword ? "text" : "password"}
                    className={`form-input w-full p-3 rounded-lg border ${theme === "dark" ? "bg-dark-card text-dark-text-primary border-dark-text-secondary/50 focus:ring-dark-secondary/20" : "bg-white text-light-text-primary border-gray-300 focus:ring-light-secondary/20"} pr-10`}
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        confirmPassword: e.target.value,
                      })
                    }
                  />
                  <button
                    type="button"
                    className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${theme === "dark" ? "text-dark-text-secondary hover:text-dark-text-primary" : "text-light-text-secondary hover:text-light-text-primary"}`}
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <motion.button
                type="submit"
                className={`btn btn-primary w-full py-3 rounded-lg font-semibold text-base flex items-center justify-center ${theme === "dark" ? "bg-dark-primary hover:bg-dark-primary/80 text-dark-text-primary" : "bg-light-primary hover:bg-light-primary/80 text-dark-text-primary"} ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                onClick={handlePasswordChange}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {loading ? (
                  <>
                    <span className="inline-block h-4 w-4 rounded-full border-2 border-white/20 border-t-white animate-spin mr-2" />
                    Mise à jour...
                  </>
                ) : (
                  <>
                    <Save size={16} className="mr-2" />
                    Mettre à Jour le Mot de Passe
                  </>
                )}
              </motion.button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;