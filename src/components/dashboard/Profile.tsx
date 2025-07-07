import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";
import { Eye, EyeOff, Save } from "lucide-react";
import { API } from "../../utils/api";
import * as dateFns from "date-fns";
import { fr } from "date-fns/locale";
import { div } from "framer-motion/client";

const Profile = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const setUser = useAuth().setUser;

  const [loading, setLoading] = useState(false);
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

      console.log(formData);
      console.log("Réponse :", response);

      const data = (await response.json()) as { message?: string; user?: any };
      addToast(
        data.message || "Informations mises à jour avec succès.",
        "success"
      );
      // Optionnel : mets à jour le user dans le contexte si tu as setUser
      if (data.user) {
        const updatedUser = { ...user, ...data.user };
        setUser(updatedUser);
        localStorage.setItem("bliic_user", JSON.stringify(updatedUser));
      }
    } catch (error: any) {
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        addToast(error.response.data.message, "error");
      } else {
        addToast("Erreur lors de la mise à jour du profil.", "error");
      }
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
          new_password_confirmation: formData.confirmPassword, // <-- bon nom pour Laravel
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
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        addToast(error.response.data.message, "error");
      } else {
        addToast("Erreur lors de la mise à jour du mot de passe.", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pt-9 ">
        <h1 className="text-2xl font-bold">Paramètres du Profil</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Informations personnelles */}
        <div className="lg:col-span-2">
          <div className="card">
            <h2 className="text-lg font-semibold mb-4">
              Informations Personnelles
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="form-control">
                <label htmlFor="name" className="form-label">
                  Nom Complet
                </label>
                <input
                  id="name"
                  type="text"
                  className="form-input"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>

              <div className="form-control">
                <label htmlFor="email" className="form-label">
                  Adresse Email
                </label>
                <input
                  id="email"
                  type="email"
                  className="form-input"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>

              <button
                type="submit"
                className={`btn btn-primary ${
                  loading ? "opacity-75 cursor-not-allowed" : ""
                }`}
                disabled={loading}
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
              </button>
            </form>
          </div>
        </div>

        {/* Résumé du compte */}
        <div className="lg:col-span-1">
  <div className="card">
    <h2 className="text-lg font-semibold mb-4">Résumé du Compte</h2>
    <div className="space-y-4">
      <div>
        <label className="text-sm text-gray-400">Membre Depuis</label>
        <p className="font-medium">
          {dateFns.format(
            new Date(user?.created_at ?? ""),
            "d MMMM yyyy",
            { locale: fr }
          )}
        </p>
        <label className="text-sm text-gray-400">Plan Actuel</label>
        <p className="font-medium">{user?.plan}</p>
      </div>
      <div>
        <label className="text-sm text-gray-400">Utilisation</label>
        <div className="mt-1">
          <div className="flex justify-between text-sm mb-1">
            <span>Liens</span>
            {user?.plan === "premium" || user?.plan === "premium_quarterly" || user?.plan === "premium_annual"  ? (
              <span>Illimité</span>
            ) : (
              <span>{user?.short_links?.length || 0}/15</span>
            )}
          </div>
          <div className="h-4 bg-gray-700 rounded-full overflow-hidden">
            {user?.plan === "premium" ? (
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: "100%" }}
              />
            ) : (
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{
                  width: `${((user?.short_links?.length || 0) / 15) * 100}%`,
                }}
              />
            )}
          </div>
          {user?.plan === "premium" && (
            <p className="text-xs text-gray-400 mt-1 text-center">
              Illimité
            </p>
          )}
        </div>
      </div>
    </div>
  </div>
</div>

        {/* Changer le mot de passe */}
        <div className="lg:col-span-2">
          <div className="card">
            <h2 className="text-lg font-semibold mb-4">
              Changer le Mot de Passe
            </h2>
            <form className="space-y-4">
              <div className="form-control">
                <label htmlFor="currentPassword" className="form-label">
                  Mot de Passe Actuel
                </label>
                <div className="relative">
                  <input
                    id="currentPassword"
                    type={showPassword ? "text" : "password"}
                    className="form-input pr-10"
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
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="form-control">
                <label htmlFor="newPassword" className="form-label">
                  Nouveau Mot de Passe
                </label>
                <div className="relative">
                  <input
                    id="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    className="form-input pr-10"
                    value={formData.newPassword}
                    onChange={(e) =>
                      setFormData({ ...formData, newPassword: e.target.value })
                    }
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="form-control">
                <label htmlFor="confirmPassword" className="form-label">
                  Confirmer le Nouveau Mot de Passe
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  className="form-input"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      confirmPassword: e.target.value,
                    })
                  }
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                onClick={handlePasswordChange}
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
              </button>
            </form>
          </div>
        </div>

        {/* Zone de danger */}
        {/* <div className="lg:col-span-3">
          <div className="card border border-danger/20">
            <h2 className="text-lg font-semibold mb-4 text-danger">
              Zone de Danger
            </h2>
            <p className="text-gray-400 mb-4">
                            Une fois votre compte supprimé, il n'y a pas de retour possible.
              Veuillez être certain.
            </p>
            <button className="btn bg-danger/10 text-danger hover:bg-danger/20">
              Supprimer le Compte
            </button>
          </div>
        </div> */}
      </div>
    </div>
  );
};

export default Profile;
