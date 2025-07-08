
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
import { motion } from "framer-motion";

interface User {
  id: string;
  email: string;
  name: string;
  plan: "free" | "premium" | "premium_quarterly" | "premium_annual" | "enterprise";
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
    "premium" | "premium_quarterly" | "premium_annual" | "enterprise" | null
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
    const regex = /^\d{8}$/;
    if (!regex.test(value)) {
      setPhoneError("Numéro invalide (ex: 12345678)");
      return false;
    }
    setPhoneError("");
    return true;
  };

  const handleUpgrade = (
    plan: "premium" | "premium_quarterly" | "premium_annual" | "enterprise"
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

    const fullPhone = `22901${phone}`;
    const isPromoActive = new Date() < new Date("2025-10-09");
    const amount =
      selectedPlan === "premium"
        ? isPromoActive
          ? 3500
          : 5500
        : selectedPlan === "premium_quarterly"
        ? 14900
        : selectedPlan === "premium_annual"
        ? 39000
        : 100000; // Placeholder for enterprise

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
          amount,
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
        body: JSON.stringify({ transaction_id: transactionId, plan: selectedPlan }),
      })
        .then((verifyRes) => verifyRes.json())
        .then((verifyData) => {
          if (verifyData.plan) {
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
      name: "Bliic Découverte",
      key: "free",
      price: "0 FCFA",
      period: "pour toujours",
      features: [
        "15 liens/mois",
        "Analytique de base",
        "QR codes standards",
        "Partage de fichiers jusqu'à 100 MB",
        "Stockage total de 200 MB",
        "Bliic visible",
      ],
      disabled: user?.plan === "free",
    },
    {
      name: "Bliic Premium Mensuel",
      key: "premium",
      price: "5 500 FCFA",
      period: "mois",
      promotion: {
        promoPrice: "3 500 FCFA",
        endDate: "9 octobre 2025",
      },
      features: [
        "Liens illimités",
        "Analytique avancée",
        "QR codes personnalisés",
        "Partage de fichiers jusqu'à 1 GB",
        "Stockage total de 10 GB",
        "Domaine personnalisé",
        "Suppression branding",
      ],
      disabled: user?.plan === "premium",
    },
    {
      name: "Bliic Premium Trimestriel",
      key: "premium_quarterly",
      price: "14 900 FCFA",
      period: "3 mois",
      popular: true,
      features: [
        "Liens illimités",
        "Analytique avancée",
        "QR codes personnalisés",
        "Partage de fichiers jusqu'à 1 GB",
        "Stockage total de 10 GB",
        "Domaine personnalisé",
        "Support + MàJ anticipée",
      ],
      disabled: user?.plan === "premium_quarterly",
    },
    {
      name: "Bliic Premium Annuel",
      key: "premium_annual",
      price: "39 000 FCFA",
      period: "an",
      features: [
        "Liens illimités",
        "Analytique avancée",
        "QR codes personnalisés",
        "Partage de fichiers jusqu'à 1 GB",
        "Stockage total de 10 GB",
        "2 domaines personnalisés",
        "Accès bêta + badge",
      ],
      disabled: user?.plan === "premium_annual",
    },
    {
      name: "Bliic Enterprise",
      key: "enterprise",
      price: "Contactez-nous",
      period: "mois",
      features: [
        "Liens illimités",
        "Analytique avancée",
        "QR codes personnalisés",
        "Partage de fichiers jusqu'à 1 GB",
        "Stockage illimité",
        "2 domaines personnalisés",
        "Support prioritaire",
      ],
      disabled: user?.plan === "enterprise",
    },
  ];

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1, duration: 0.3 },
    }),
  };

  return (
    <div
      className={`min-h-screen p-6 font-sans relative overflow-hidden ${
        theme === "dark" ? "bg-dark-background" : "bg-light-background"
      }`}
    >
      <style>
        {`
          .pricing-card {
            transition: transform 0.3s ease, box-shadow 0.3s ease;
            perspective: 1000px;
          }
          .pricing-card:hover {
            transform: translateY(-4px) rotateX(2deg) rotateY(2deg);
            box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2),
                        0 0 20px ${
                          theme === "dark" ? "rgba(234, 179, 8, 0.3)" : "rgba(124, 58, 237, 0.3)"
                        };
          }
          .pricing-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            border-radius: 1rem;
            padding: 2px;
            background: linear-gradient(
              45deg,
              ${theme === "dark" ? "#eab308" : "#7c3aed"},
              ${theme === "dark" ? "#7c3aed" : "#eab308"}
            );
            -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
            -webkit-mask-composite: xor;
            mask-composite: exclude;
            opacity: 0;
            transition: opacity 0.3s ease;
            z-index: -1;
          }
          .pricing-card:hover::before {
            opacity: 1;
          }
          .cta-button {
            transition: transform 0.3s ease, box-shadow 0.3s ease;
          }
          .cta-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
          }
          .popular-button {
            animation: pulse 2s infinite;
          }
          @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
          }
          @keyframes float {
            0% { transform: translate(0, 0); opacity: 0.2; }
            50% { transform: translate(20px, -30px); opacity: 0.4; }
            100% { transform: translate(0, 0); opacity: 0.2; }
          }
        `}
      </style>
      <div className="absolute inset-0 z-0">
        {Array.from({ length: 32 }).map((_, index) => {
          const Icon = [LucideLink, BarChart, Globe, Shield][index % 4];
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
        })}
      </div>
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
        <motion.h1
          className={`text-3xl md:text-4xl font-bold text-center ${
            theme === "dark" ? "text-dark-text-primary" : "text-light-text-primary"
          } font-sans`}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Abonnement
        </motion.h1>
        <motion.p
          className={`text-center mb-12 max-w-2xl mx-auto text-base ${
            theme === "dark" ? "text-dark-text-secondary" : "text-light-text-secondary"
          } font-sans`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Profitez de notre offre spéciale sur le plan Bliic Premium Mensuel à 3 500 FCFA/mois jusqu'au 9 octobre 2025 !
        </motion.p>

        {/* Summary Card */}
        <motion.div
          className={`p-6 rounded-2xl shadow-xl ${
            theme === "dark"
              ? "bg-dark-card/90 border-dark-text-secondary/50"
              : "bg-light-card/90 border-light-text-secondary/50"
          } backdrop-blur-sm`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="flex items-start justify-between">
            <div>
              <h2
                className={`text-xl font-semibold mb-2 ${
                  theme === "dark" ? "text-dark-text-primary" : "text-light-text-primary"
                } font-sans`}
              >
                Plan Actuel :{" "}
                {user?.plan &&
                  (user.plan === "free"
                    ? "Bliic Découverte"
                    : user.plan === "premium"
                    ? "Bliic Premium Mensuel"
                    : user.plan === "premium_quarterly"
                    ? "Bliic Premium Trimestriel"
                    : user.plan === "premium_annual"
                    ? "Bliic Premium Annuel"
                    : "Bliic Enterprise")}
              </h2>
              <p
                className={`text-base ${
                  theme === "dark" ? "text-dark-text-secondary" : "text-light-text-secondary"
                } mb-4 font-sans`}
              >
                {typeof user?.access === "object" &&
                !Array.isArray(user.access) &&
                user?.access?.trial_status === "active"
                  ? `${getTrialDaysRemaining()} jour(s) restant(s) dans votre essai Premium.`
                  : typeof user?.access === "object" &&
                    !Array.isArray(user?.access) &&
                    user?.access?.trial_status === "expired"
                  ? "Votre essai Premium a expiré. Passez à un plan Premium ou Enterprise pour continuer !"
                  : user?.plan === "free"
                  ? "Passez à un plan Premium ou Enterprise pour débloquer toutes les fonctionnalités !"
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
                className={theme === "dark" ? "text-dark-primary" : "text-light-primary"}
              />
            </div>
          </div>
        </motion.div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.key}
              className={`pricing-card relative p-6 rounded-2xl shadow-xl ${
                theme === "dark" ? "bg-dark-card/90" : "bg-light-card/90"
              } backdrop-blur-sm border ${
                plan.popular ? "border-2 border-dark-secondary" : "border-dark-text-secondary/50"
              }`}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              custom={index}
              whileHover={{ scale: 1.05 }}
            >
              {plan.popular && (
                <motion.div
                  className={`absolute -top-3 left-1/2 transform -translate-x-1/2 ${
                    theme === "dark" ? "bg-dark-secondary" : "bg-light-secondary"
                  } text-xs font-bold px-3 py-1 rounded-full text-dark-text-primary font-sans`}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.1 + 0.4 }}
                >
                  Populaire
                </motion.div>
              )}
              {plan.disabled && (
                <span
                  className={`absolute top-3 right-3 px-2 py-1 text-xs font-semibold rounded-full ${
                    theme === "dark" ? "bg-dark-primary/20 text-dark-primary" : "bg-light-primary/20 text-light-primary"
                  } font-sans`}
                >
                  Plan Actuel
                </span>
              )}
              <div className="text-center mb-6">
                <h3
                  className={`text-2xl font-bold mb-2 ${
                    theme === "dark" ? "text-dark-text-primary" : "text-light-text-primary"
                  } font-sans`}
                >
                  {plan.name}
                </h3>
                <div className="flex items-center justify-center flex-wrap gap-2">
                  <span
                    className={`text-3xl font-bold ${
                      theme === "dark" ? "text-dark-text-primary" : "text-light-text-primary"
                    } font-sans`}
                  >
                    {plan.price}
                  </span>
                  <span
                    className={`text-base ${
                      theme === "dark" ? "text-dark-text-secondary" : "text-light-text-secondary"
                    } ml-2 font-sans`}
                  >
                    / {plan.period}
                  </span>
                </div>
                {plan.promotion && (
                  <span
                    className={`text-sm font-semibold mt-2 block ${
                      theme === "dark" ? "text-dark-primary" : "text-light-primary"
                    } font-sans`}
                  >
                    PROMO {plan.promotion.promoPrice} jusqu'au {plan.promotion.endDate}
                  </span>
                )}
              </div>
              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, i) => (
                  <li
                    key={i}
                    className={`flex items-start text-base ${
                      theme === "dark" ? "text-dark-text-secondary" : "text-light-text-secondary"
                    } font-sans`}
                  >
                    <Check
                      size={16}
                      className={theme === "dark" ? "text-dark-primary mt-0.5 mr-2" : "text-light-primary mt-0.5 mr-2"}
                    />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              {plan.key !== "free" && (
                <button
                  onClick={() => handleUpgrade(plan.key as "premium" | "premium_quarterly" | "premium_annual" | "enterprise")}
                  className={`cta-button w-full py-3 rounded-lg font-semibold text-base font-sans ${
                    plan.disabled
                      ? "border border-dark-text-secondary/50 text-dark-text-secondary opacity-50 cursor-not-allowed"
                      : plan.popular
                      ? `${
                          theme === "dark"
                            ? "bg-dark-secondary hover:bg-dark-secondary/80"
                            : "bg-light-secondary hover:bg-light-secondary/80"
                        } text-dark-text-primary popular-button`
                      : `${
                          theme === "dark"
                            ? "bg-dark-primary hover:bg-dark-primary/80"
                            : "bg-light-primary hover:bg-light-primary/80"
                        } text-dark-text-primary`
                  }`}
                  disabled={plan.disabled}
                  aria-label={plan.disabled ? "Plan actuel" : `Passer au plan ${plan.name}`}
                >
                  {plan.disabled ? "Plan Actuel" : plan.key === "enterprise" ? "Contacter le Support" : "Passer au Plan"}
                </button>
              )}
            </motion.div>
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
              ? selectedPlan === "premium"
                ? "Bliic Premium Mensuel"
                : selectedPlan === "premium_quarterly"
                ? "Bliic Premium Trimestriel"
                : selectedPlan === "premium_annual"
                ? "Bliic Premium Annuel"
                : "Bliic Enterprise"
              : ""
          }`}
        >
          <div className="space-y-4 w-full max-w-md">
            {verificationStatus === "verifying" ? (
              <div className="flex flex-col items-center space-y-4">
                <Loader2
                  size={32}
                  className={`animate-spin ${
                    theme === "dark" ? "text-dark-primary" : "text-light-primary"
                  }`}
                />
                <p
                  className={`text-center text-base ${
                    theme === "dark" ? "text-dark-text-primary" : "text-light-text-primary"
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
                  className={theme === "dark" ? "text-dark-primary" : "text-light-primary"}
                />
                <p
                  className={`text-center text-base ${
                    theme === "dark" ? "text-dark-text-primary" : "text-light-text-primary"
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
                      theme === "dark" ? "text-dark-text-secondary" : "text-light-text-secondary"
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
                        theme === "dark" ? "text-dark-tertiary" : "text-light-tertiary"
                      } font-sans`}
                    >
                      {phoneError}
                    </p>
                  )}
                </div>
                <div>
                  <label
                    className={`block text-base ${
                      theme === "dark" ? "text-dark-text-secondary" : "text-light-text-secondary"
                    } mb-2 font-sans`}
                  >
                    Réseau
                  </label>
                  <select
                    value={network}
                    onChange={(e) => setNetwork(e.target.value as "MTN" | "MOOV")}
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
                    } text-base font-sans ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
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
                      loading || phoneError !== "" ? "opacity-50 cursor-not-allowed" : ""
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
                theme === "dark" ? "text-dark-text-primary" : "text-light-text-primary"
              } font-sans`}
            >
              Le paiement n’a pas été confirmé. Veuillez réessayer ou contactez le support.
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