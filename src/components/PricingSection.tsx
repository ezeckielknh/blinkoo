import { useTheme } from "../contexts/ThemeContext";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Gift,
  Calendar,
  Clock,
  Award,
  Check,
} from "lucide-react";

const PricingSection = () => {
  const { theme } = useTheme();

  const plans = [
    {
      name: "Bliic Découverte",
      price: "0 FCFA",
      period: "/ pour toujours",
      icon: Gift,
      features: [
        "10 liens/mois",
        "Analytique de base",
        "QR codes standards",
        "Partage de fichiers jusqu'à 100 MB",
        "Bliic visible",
      ],
      cta: "Commencer",
      ctaLink: "/register",
      popular: false,
    },
    {
      name: "Bliic Premium Mensuel",
      price: "5 500 FCFA",
      period: "/ mois",
      icon: Calendar,
      features: [
        "Liens illimités",
        "Analytique avancée",
        "QR codes personnalisés",
        "Partage de fichiers jusqu'à 1 GB",
        "Domaine personnalisé",
        "Suppression branding",
      ],
      cta: "Choisir ce plan",
      ctaLink: "/register",
      popular: false,
      promotion: {
        promoPrice: "3 500 FCFA",
        endDate: "9 octobre 2025",
      },
    },
    {
      name: "Bliic Premium Trimestriel",
      price: "14 900 FCFA",
      period: "/ 3 mois",
      icon: Clock,
      features: [
        "Liens illimités",
        "Analytique avancée",
        "QR codes personnalisés",
        "Partage de fichiers jusqu'à 1 GB",
        "Domaine personnalisé",
        "Support + MàJ anticipée",
      ],
      cta: "Choisir ce plan",
      ctaLink: "/register",
      popular: true,
    },
    {
      name: "Bliic Premium Annuel",
      price: "39 000 FCFA",
      period: "/ an",
      icon: Award,
      features: [
        "Liens illimités",
        "Analytique avancée",
        "QR codes personnalisés",
        "Partage de fichiers jusqu'à 1 GB",
        "2 domaines personnalisés",
        "Accès bêta + badge",
      ],
      cta: "Choisir ce plan",
      ctaLink: "/register",
      popular: false,
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
    <section className="py-16">
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
        `}
      </style>
      <div className="container mx-auto px-4 max-w-7xl">
        <motion.h2
          className={`text-3xl md:text-4xl font-bold text-center mb-3 ${
            theme === "dark"
              ? "text-dark-text-primary"
              : "text-light-text-primary"
          } font-sans`}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Tarification Simple
        </motion.h2>
        <motion.p
          className={`text-center mb-12 max-w-2xl mx-auto text-base ${
            theme === "dark"
              ? "text-dark-text-secondary"
              : "text-light-text-secondary"
          } font-sans`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Que vous débutiez ou que vous gériez un volume important, Bliic vous
          propose des plans clairs, adaptés à chaque profil. Profitez de notre
          offre spéciale sur le plan Premium Mensuel à 3 500 FCFA/mois jusqu'au
          9 octobre 2025 !
        </motion.p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              className={`pricing-card relative rounded-2xl p-6 ${
                theme === "dark" ? "bg-dark-card/90" : "bg-light-card/90"
              } backdrop-blur-sm border ${
                theme === "dark"
                  ? "border-dark-text-secondary/50"
                  : "border-light-text-secondary/50"
              } ${plan.popular ? "border-2 border-dark-secondary" : ""}`}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              custom={index}
              whileHover={{ scale: 1.05 }}
            >
              {plan.popular && (
                <motion.div
                  className={`absolute -top-3 left-1/2 transform -translate-x-1/2 ${
                    theme === "dark"
                      ? "bg-dark-secondary"
                      : "bg-light-secondary"
                  } text-xs font-bold px-3 py-1 rounded-full text-dark-text-primary font-sans`}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.1 + 0.4 }}
                >
                  Populaire
                </motion.div>
              )}
              <div className="text-center mb-6">
                <div
                  className="relative mx-auto mb-4"
                  style={{ width: "68px", aspectRatio: "1/1" }}
                >
                  <plan.icon
                    size={32}
                    className={`absolute inset-0 m-auto ${
                      theme === "dark"
                        ? "text-dark-primary"
                        : "text-light-primary"
                    }`}
                  />
                  <svg
                    className={`absolute top-0 left-0 ${
                      theme === "dark"
                        ? "text-dark-primary"
                        : "text-light-primary"
                    }`}
                    width="68"
                    height="68"
                    viewBox="0 0 68 68"
                    fill="currentColor"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M56.0059 60.5579C44.1549 78.9787 18.0053 58.9081 6.41191 46.5701C-2.92817 35.5074 -2.81987 12.1818 11.7792 3.74605C30.0281 -6.79858 48.0623 7.40439 59.8703 15.7971C71.6784 24.1897 70.8197 37.5319 56.0059 60.5579Z"
                      fillOpacity="0.1"
                    />
                  </svg>
                </div>
                <h3
                  className={`text-2xl font-bold mb-2 ${
                    theme === "dark"
                      ? "text-dark-text-primary"
                      : "text-light-text-primary"
                  } font-sans`}
                >
                  {plan.name}
                </h3>
                <div className="flex items-center justify-center flex-wrap gap-2">
                  <span
                    className={`text-3xl md:text-4xl font-bold ${
                      theme === "dark"
                        ? "text-dark-text-primary"
                        : "text-light-text-primary"
                    } font-sans`}
                  >
                    {plan.price}
                  </span>
                  <span
                    className={`ml-2 text-base ${
                      theme === "dark"
                        ? "text-dark-text-secondary"
                        : "text-light-text-secondary"
                    } font-sans`}
                  >
                    {plan.period}
                  </span>
                </div>
                {plan.promotion && (
                  <span
                    className={`text-sm font-semibold mt-2 block ${
                      theme === "dark"
                        ? "text-dark-primary"
                        : "text-light-primary"
                    } font-sans`}
                  >
                    PROMO {plan.promotion.promoPrice} jusqu'au {plan.promotion.endDate}
                  </span>
                )}
              </div>
              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start">
                    <Check
                      size={20}
                      className={`mt-0.5 mr-2 ${
                        theme === "dark"
                          ? "text-dark-primary"
                          : "text-light-primary"
                      }`}
                    />
                    <span
                      className={`text-base ${
                        theme === "dark"
                          ? "text-dark-text-secondary"
                          : "text-light-text-secondary"
                      } font-sans`}
                    >
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
              <Link
                to={plan.ctaLink}
                className={`cta-button w-full px-6 py-3 rounded-lg font-semibold text-base font-sans ${
                  plan.popular
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
              >
                {plan.cta}
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;