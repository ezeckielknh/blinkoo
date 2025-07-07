import {
  CreditCard,
  Check,
  Star,
  Loader2,
  Link as LucideLink,
  BarChart,
  Globe,
  Shield,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";
import { useTheme } from "../../contexts/ThemeContext";
import { useState, useEffect } from "react";
import Modal from "../Modal";
import { API } from "../../utils/api";
import logoImage from "../../assets/bliic.png";
import logo2Image from "../../assets/Bliic 2.png";
import { Link } from "react-router-dom";

interface User {
  id: string;
  email: string;
  name: string;
  plan: "free" | "premium" | "premium_quarterly" | "premium_annual";
  role: "user" | "admin" | "super_admin";
  access: {
    trial_started_at?: string;
    trial_ends_at?: string;
    trial_status?: "none" | "active" | "expired";
  };
  token: string;
}

const Subscription = () => {
  const { user, refreshUser } = useAuth();
  const { addToast } = useToast();
  const { theme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<
    "premium" | "premium_quarterly" | "premium_annual" | null
  >(null);
  const [phone, setPhone] = useState("");
  const [network, setNetwork] = useState<"MTN" | "MOOV">("MTN");
  const [phoneError, setPhoneError] = useState("");
  const [verificationStatus, setVerificationStatus] = useState<
    "idle" | "verifying" | "success" | "failed"
  >("idle");
  const [secondsRemaining, setSecondsRemaining] = useState(6);
  const [showFailureModal, setShowFailureModal] = useState(false);
  const [transactionId, setTransactionId] = useState<string | null>(null);

  const validatePhone = (value: string) => {
    const regex = /^\d{8}$/; // Vérifie que le numéro contient exactement 8 chiffres
    if (!regex.test(value)) {
      setPhoneError("Numéro invalide (ex: 12345678)");
      return false;
    }
    setPhoneError("");
    return true;
  };

  const handleUpgrade = (
    plan: "premium" | "premium_quarterly" | "premium_annual"
  ) => {
    setSelectedPlan(plan);
    setPhone("");
    setNetwork("MTN");
    setPhoneError("");
    setVerificationStatus("idle");
    setSecondsRemaining(6);
    setShowFailureModal(false);
  };

  const confirmPayment = async () => {
    if (!selectedPlan || !validatePhone(phone)) {
      addToast("Veuillez corriger les erreurs du formulaire.", "error");
      return;
    }

    const fullPhone = `22901${phone}`; // Format 22901******** (12 chiffres)
    setLoading(true);
    setVerificationStatus("verifying");
    try {
      const res = await fetch(`${API.TRANSACTIONS.CREATE}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify({
          plan: selectedPlan,
          amount:
            selectedPlan === "premium"
              ? 100
              : selectedPlan === "premium_quarterly"
              ? 255
              : 480, // Prix initiaux
          currency: "XOF",
          network,
          phone: fullPhone,
          name: user?.name || "",
          email: user?.email,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        let errorMessage =
          data?.error || "Erreur lors de l'initialisation du paiement";
        if (res.status === 401) {
          errorMessage = "Session expirée. Veuillez vous reconnecter.";
        } else if (res.status === 429) {
          errorMessage = "Trop de tentatives. Veuillez réessayer plus tard.";
        }
        addToast(errorMessage, "error");
        setLoading(false);
        setVerificationStatus("failed");
        setShowFailureModal(true);
        setSelectedPlan(null);
        return;
      }

      addToast(
        "Paiement initié. Veuillez confirmer via USSD sur votre téléphone.",
        "info"
      );
      setTransactionId(data.transaction.id);
    } catch (err) {
      addToast("Erreur réseau. Veuillez vérifier votre connexion.", "error");
      setLoading(false);
      setVerificationStatus("failed");
      setShowFailureModal(true);
      setSelectedPlan(null);
    }
  };

  useEffect(() => {
    console.log(selectedPlan);
    if (verificationStatus !== "verifying" || !transactionId) return;

    let attempt = 0;
    const maxAttempts = 6;
    const intervalDuration = 6000;

    const interval = setInterval(() => {
      attempt++;
      setSecondsRemaining(6);

      let countdown = 6;
      const countdownTick = setInterval(() => {
        countdown--;
        setSecondsRemaining(countdown);
        if (countdown <= 0) clearInterval(countdownTick);
      }, 1000);

      fetch(`${API.TRANSACTIONS.VERIFY}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify({ transaction_id: transactionId , plan: selectedPlan,}),
      })
        .then((verifyRes) => verifyRes.json())
        .then((verifyData) => {
          if (verifyData.plan) {
            console.log(selectedPlan);
            clearInterval(interval);
            clearInterval(countdownTick);
            refreshUser();
            addToast("Votre plan a été mis à jour !", "success");
            setLoading(false);
            setVerificationStatus("success");
            setSelectedPlan(null);
            setTransactionId(null);
          } else if (attempt >= maxAttempts) {
            clearInterval(interval);
            clearInterval(countdownTick);
            addToast(
              "Le paiement n’a pas été confirmé à temps. Veuillez réessayer.",
              "error"
            );
            setLoading(false);
            setVerificationStatus("failed");
            setSelectedPlan(null);
            setShowFailureModal(true);
            setTransactionId(null);
          }
        })
        .catch((err) => {
          if (attempt >= maxAttempts) {
            clearInterval(interval);
            clearInterval(countdownTick);
            addToast("Erreur lors de la vérification", "error");
            setLoading(false);
            setVerificationStatus("failed");
            setSelectedPlan(null);
            setShowFailureModal(true);
            setTransactionId(null);
          }
        });
    }, intervalDuration);

    return () => clearInterval(interval);
  }, [verificationStatus, transactionId, user?.token, refreshUser, addToast]);

  const getTrialDaysRemaining = () => {
    if (
      user?.access &&
      typeof user.access === "object" &&
      !Array.isArray(user.access) &&
      "trial_ends_at" in user.access &&
      user.access.trial_ends_at
    ) {
      const endDate = new Date(user.access.trial_ends_at);
      const now = new Date();
      const diffTime = endDate.getTime() - now.getTime();
      return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    }
    return 0;
  };

  const plans = [
    {
      name: "Free",
      key: "free",
      price: "0",
      period: "forever",
      features: [
        "10 liens/mois",
        "Analytique de base",
        "QR codes standards",
        "Partage de fichiers jusqu'à 5MB",
      ],
      disabled:
        user?.plan === "free" &&
        typeof user?.access === "object" &&
        !Array.isArray(user?.access) &&
        user?.access?.trial_status !== "active",
    },
    {
      name: "Premium",
      key: "premium",
      price: "10", // Retour au prix initial
      period: "mois",
      features: [
        "Liens illimités",
        "Analytique avancée",
        "QR codes personnalisés",
        "Partage de fichiers jusqu'à 100MB",
        "Domaines personnalisés",
      ],
      disabled:
        user?.plan === "premium" ||
        user?.plan === "premium_quarterly" ||
        user?.plan === "premium_annual" ||
        (typeof user?.access === "object" &&
          !Array.isArray(user?.access) &&
          user?.access?.trial_status === "active"),
    },
    {
      name: "Premium Trimestriel",
      key: "premium_quarterly",
      price: "25", // Inchangé (15% de réduction par mois)
      period: "3 mois",
      features: [
        "Liens illimités",
        "Analytique avancée",
        "QR codes personnalisés",
        "Partage de fichiers jusqu'à 100MB",
        "Domaines personnalisés",
        "15% de réduction par mois",
      ],
      disabled:
        user?.plan === "premium_quarterly" ||
        user?.plan === "premium_annual" ||
        (typeof user?.access === "object" &&
          !Array.isArray(user?.access) &&
          user?.access?.trial_status === "active"),
    },
    {
      name: "Premium Annuel",
      key: "premium_annual",
      price: "48", // Inchangé (60% de réduction par mois)
      period: "an",
      features: [
        "Liens illimités",
        "Analytique avancée",
        "QR codes personnalisés",
        "Partage de fichiers jusqu'à 100MB",
        "Domaines personnalisés",
        "60% de réduction par mois",
      ],
      disabled:
        user?.plan === "premium_annual" ||
        (typeof user?.access === "object" &&
          !Array.isArray(user?.access) &&
          user?.access?.trial_status === "active"),
    },
  ];

  // Generate background icons
  const iconTypes = [LucideLink, BarChart, Globe, Shield];
  const iconCount = 32;
  const backgroundIcons = Array.from({ length: iconCount }).map((_, index) => {
    const Icon = iconTypes[index % iconTypes.length];
    const randomX = Math.random() * 100;
    const randomY = Math.random() * 100;
    const randomDelay = Math.random() * 5;
    const randomDuration = 8 + Math.random() * 4;
    return (
      <Icon
        key={index}
        className={`absolute w-6 h-6 opacity-20 ${
          theme === "dark" ? "text-dark-icon" : "text-light-icon"
        }`}
        style={{
          left: `${randomX}%`,
          top: `${randomY}%`,
          animation: `float ${randomDuration}s ease-in-out ${randomDelay}s infinite`,
          willChange: "transform, opacity",
        }}
      />
    );
  });

  return (
    <div
      className={`min-h-screen p-6 font-sans relative overflow-hidden ${
        theme === "dark" ? "bg-dark-background" : "bg-light-background"
      }  `}
    >
      <style>
        {`
          @keyframes float {
            0% { transform: translate(0, 0); opacity: 0.2; }
            50% { transform: translate(20px, -30px); opacity: 0.4; }
            100% { transform: translate(0, 0); opacity: 0.2; }
          }
        `}
      </style>
      <div className="absolute inset-0 z-0">{backgroundIcons}</div>
      <div className="relative z-10 space-y-8 max-w-7xl mx-auto">
        <div className="flex justify-center mb-6">
          <Link to="/" className="flex items-center">
            <img
              src={theme === "dark" ? logo2Image : logoImage}
              alt="Bliic"
              style={{ width: "70px" }}
            />
          </Link>
        </div>
        <h1
          className={`text-3xl font-bold text-center ${
            theme === "dark"
              ? "text-dark-text-primary"
              : "text-light-text-primary"
          } font-sans`}
        >
          Abonnement
        </h1>

        {/* Summary Card */}
        <div
          className={`p-6 rounded-2xl shadow-xl ${
            theme === "dark"
              ? "bg-dark-card/90 border-dark-text-secondary/50"
              : "bg-light-card/90 border-light-text-secondary/50"
          } backdrop-blur-sm`}
        >
          <div className="flex items-start justify-between">
            <div>
              <h2
                className={`text-xl font-semibold mb-2 ${
                  theme === "dark"
                    ? "text-dark-text-primary"
                    : "text-light-text-primary"
                } font-sans`}
              >
                Plan Actuel :{" "}
                {user?.plan &&
                  (user.plan === "premium_quarterly"
                    ? "Premium Trimestriel"
                    : user.plan === "premium_annual"
                    ? "Premium Annuel"
                    : user.plan.charAt(0).toUpperCase() + user.plan.slice(1))}
              </h2>
              <p
                className={`text-base ${
                  theme === "dark"
                    ? "text-dark-text-secondary"
                    : "text-light-text-secondary"
                } mb-4 font-sans`}
              >
                {typeof user?.access === "object" &&
                !Array.isArray(user?.access) &&
                user?.access?.trial_status === "active"
                  ? `${getTrialDaysRemaining()} jour(s) restant(s) dans votre essai Premium.`
                  : typeof user?.access === "object" &&
                    !Array.isArray(user?.access) &&
                    user?.access?.trial_status === "expired"
                  ? "Votre essai Premium a expiré. Passez à Premium pour continuer !"
                  : user?.plan === "free"
                  ? typeof user?.access === "object" &&
                    !Array.isArray(user?.access) &&
                    user?.access?.trial_status === "none"
                    ? "Passez à Premium pour débloquer toutes les fonctionnalités !"
                    : "Votre plan gratuit est actif."
                  : "Vous avez un accès complet aux fonctionnalités Premium."}
              </p>
            </div>
            <div
              className={`p-3 rounded-lg ${
                theme === "dark" ? "bg-dark-card" : "bg-light-card"
              }`}
            >
              <Star
                size={24}
                className={
                  theme === "dark" ? "text-dark-primary" : "text-light-primary"
                }
              />
            </div>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.key}
              className={`relative p-6 rounded-2xl shadow-xl ${
                theme === "dark"
                  ? "bg-dark-card/90 border-dark-text-secondary/50"
                  : "bg-light-card/90 border-light-text-secondary/50"
              } backdrop-blur-sm transition-transform hover:scale-105`}
            >
              {plan.disabled && (
                <span
                  className={`absolute top-3 right-3 px-2 py-1 text-xs font-semibold rounded-full ${
                    theme === "dark"
                      ? "bg-dark-primary/20 text-dark-primary"
                      : "bg-light-primary/20 text-light-primary"
                  } font-sans`}
                >
                  Plan Actuel
                </span>
              )}
              <div className="text-center mb-6">
                <h3
                  className={`text-2xl font-bold mb-2 ${
                    theme === "dark"
                      ? "text-dark-text-primary"
                      : "text-light-text-primary"
                  } font-sans`}
                >
                  {plan.name}
                </h3>
                <div className="flex items-center justify-center">
                  <span
                    className={`text-3xl font-bold ${
                      theme === "dark"
                        ? "text-dark-text-primary"
                        : "text-light-text-primary"
                    } font-sans`}
                  >
                    {plan.price} XOF
                  </span>
                  <span
                    className={`text-base ${
                      theme === "dark"
                        ? "text-dark-text-secondary"
                        : "text-light-text-secondary"
                    } ml-2 font-sans`}
                  >
                    / {plan.period}
                  </span>
                </div>
              </div>
              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, i) => (
                  <li
                    key={i}
                    className={`flex items-center text-base ${
                      theme === "dark"
                        ? "text-dark-text-secondary"
                        : "text-light-text-secondary"
                    } font-sans`}
                  >
                    <Check
                      size={16}
                      className={
                        theme === "dark"
                          ? "text-dark-primary"
                          : "text-light-primary"
                      }
                    />
                    <span className="ml-2">{feature}</span>
                  </li>
                ))}
              </ul>
              {plan.key !== "free" && (
                <button
                  onClick={() =>
                    handleUpgrade(
                      plan.key as
                        | "premium"
                        | "premium_quarterly"
                        | "premium_annual"
                    )
                  }
                  className={`w-full py-3 rounded-lg font-semibold ${
                    plan.disabled
                      ? "border border-dark-text-secondary/50 text-dark-text-secondary opacity-50 cursor-not-allowed"
                      : theme === "dark"
                      ? "bg-dark-primary hover:bg-dark-secondary text-dark-text-primary"
                      : "bg-light-primary hover:bg-light-secondary text-dark-text-primary"
                  } text-base font-sans`}
                  disabled={plan.disabled}
                  aria-label={
                    plan.disabled
                      ? "Plan actuel"
                      : `Passer au plan ${plan.name}`
                  }
                >
                  {plan.disabled ? "Plan Actuel" : "Passer au Plan"}
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Payment Modal */}
        <Modal
          isOpen={!!selectedPlan}
          onClose={() => {
            if (!loading) setSelectedPlan(null);
          }}
          title={`Paiement pour le plan ${
            selectedPlan
              ? selectedPlan === "premium_quarterly"
                ? "Premium Trimestriel"
                : selectedPlan === "premium_annual"
                ? "Premium Annuel"
                : "Premium"
              : ""
          }`}
        >
          <div className="space-y-4 w-full max-w-md">
            {verificationStatus === "verifying" ? (
              <div className="flex flex-col items-center space-y-4">
                <Loader2
                  size={32}
                  className={`animate-spin ${
                    theme === "dark"
                      ? "text-dark-primary"
                      : "text-light-primary"
                  }`}
                />
                <p
                  className={`text-center text-base ${
                    theme === "dark"
                      ? "text-dark-text-primary"
                      : "text-light-text-primary"
                  } font-sans`}
                >
                  Vérification en cours... {secondsRemaining}s restantes
                  <br />
                  <span className="text-sm italic">
                    Veuillez ne pas quitter la page pendant la vérification.
                  </span>
                </p>
              </div>
            ) : verificationStatus === "success" ? (
              <div className="flex flex-col items-center space-y-4">
                <Check
                  size={32}
                  className={`${
                    theme === "dark"
                      ? "text-dark-primary"
                      : "text-light-primary"
                  }`}
                />
                <p
                  className={`text-center text-base ${
                    theme === "dark"
                      ? "text-dark-text-primary"
                      : "text-light-text-primary"
                  } font-sans`}
                >
                  Paiement réussi ! Votre plan a été mis à jour.
                </p>
                <button
                  onClick={() => setSelectedPlan(null)}
                  className={`w-full py-3 rounded-lg font-semibold ${
                    theme === "dark"
                      ? "bg-dark-primary hover:bg-dark-secondary text-dark-text-primary"
                      : "bg-light-primary hover:bg-light-secondary text-dark-text-primary"
                  } text-base font-sans`}
                >
                  Fermer
                </button>
              </div>
            ) : (
              <>
                <div>
                  <label
                    className={`block text-base ${
                      theme === "dark"
                        ? "text-dark-text-secondary"
                        : "text-light-text-secondary"
                    } mb-2 font-sans`}
                  >
                    Numéro de téléphone
                  </label>
                  <div className="flex items-center">
                    <span
                      className={`border-r pr-2 text-base ${
                        theme === "dark"
                          ? "border-dark-text-secondary/50 text-dark-text-secondary"
                          : "border-light-text-secondary/50 text-light-text-secondary"
                      } font-sans`}
                    >
                      22901
                    </span>
                    <input
                      type="text"
                      placeholder="ex: 12345678"
                      value={phone}
                      onChange={(e) => {
                        setPhone(e.target.value);
                        validatePhone(e.target.value);
                      }}
                      className={`w-full pl-3 pr-4 py-3 rounded-lg border font-sans ${
                        theme === "dark"
                          ? `bg-dark-card text-dark-text-primary placeholder-dark-text-secondary border-dark-text-secondary/50 ${
                              phoneError ? "border-dark-tertiary" : ""
                            }`
                          : `bg-light-card text-light-text-primary placeholder-light-text-secondary border-light-text-secondary/50 ${
                              phoneError ? "border-light-tertiary" : ""
                            }`
                      } focus:ring focus:ring-${
                        theme === "dark" ? "dark-secondary" : "light-secondary"
                      }/20`}
                      aria-invalid={phoneError ? "true" : "false"}
                      aria-describedby={phoneError ? "phone-error" : undefined}
                      disabled={loading}
                    />
                  </div>
                  {phoneError && (
                    <p
                      id="phone-error"
                      className={`text-sm mt-1 text-left ${
                        theme === "dark"
                          ? "text-dark-tertiary"
                          : "text-light-tertiary"
                      } font-sans`}
                    >
                      {phoneError}
                    </p>
                  )}
                </div>
                <div>
                  <label
                    className={`block text-base ${
                      theme === "dark"
                        ? "text-dark-text-secondary"
                        : "text-light-text-secondary"
                    } mb-2 font-sans`}
                  >
                    Réseau
                  </label>
                  <select
                    value={network}
                    onChange={(e) =>
                      setNetwork(e.target.value as "MTN" | "MOOV")
                    }
                    className={`w-full pl-3 pr-4 py-3 rounded-lg border font-sans ${
                      theme === "dark"
                        ? "bg-dark-card text-dark-text-primary border-dark-text-secondary/50"
                        : "bg-light-card text-light-text-primary border-light-text-secondary/50"
                    } focus:ring focus:ring-${
                      theme === "dark" ? "dark-secondary" : "light-secondary"
                    }/20 bg-transparent`}
                    disabled={loading}
                  >
                    <option value="MTN">MTN</option>
                    <option value="MOOV">MOOV</option>
                  </select>
                </div>
                <div className="flex space-x-4">
                  <button
                    onClick={() => setSelectedPlan(null)}
                    className={`w-full py-3 rounded-lg font-semibold ${
                      theme === "dark"
                        ? "border border-dark-text-secondary/50 text-dark-text-primary hover:bg-dark-card/80"
                        : "border border-light-text-secondary/50 text-light-text-primary hover:bg-light-card/80"
                    } text-base font-sans ${
                      loading ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                    disabled={loading}
                    aria-label="Annuler le paiement"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={confirmPayment}
                    disabled={loading || phoneError !== ""}
                    className={`w-full py-3 rounded-lg font-semibold flex items-center justify-center ${
                      theme === "dark"
                        ? "bg-dark-primary hover:bg-dark-secondary text-dark-text-primary"
                        : "bg-light-primary hover:bg-light-secondary text-dark-text-primary"
                    } text-base font-sans ${
                      loading || phoneError !== ""
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }`}
                    aria-label="Confirmer le paiement"
                  >
                    {loading ? (
                      <>
                        <Loader2
                          size={16}
                          className={`animate-spin mr-2 text-dark-text-primary`}
                        />
                        Traitement...
                      </>
                    ) : (
                      "Confirmer"
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </Modal>

        {/* Failure Modal */}
        <Modal
          isOpen={showFailureModal}
          onClose={() => setShowFailureModal(false)}
          title="Échec du Paiement"
        >
          <div className="space-y-4 w-full max-w-md">
            <p
              className={`text-center text-base ${
                theme === "dark"
                  ? "text-dark-text-primary"
                  : "text-light-text-primary"
              } font-sans`}
            >
              Le paiement n’a pas été confirmé. Veuillez réessayer ou contactez
              le support.
            </p>
            <button
              onClick={() => setShowFailureModal(false)}
              className={`w-full py-3 rounded-lg font-semibold ${
                theme === "dark"
                  ? "bg-dark-primary hover:bg-dark-secondary text-dark-text-primary"
                  : "bg-light-primary hover:bg-light-secondary text-dark-text-primary"
              } text-base font-sans`}
            >
              Fermer
            </button>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default Subscription;
