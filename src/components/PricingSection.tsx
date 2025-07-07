import { useTheme } from "../contexts/ThemeContext";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const PricingSection = () => {
  const { theme } = useTheme();

  const plans = [
    {
      name: "Free",
      price: "0 XOF",
      period: "/ forever",
      features: [
        "10 liens/mois",
        "Analytique de base",
        "QR codes standards",
        "Partage de fichiers jusqu'à 5MB",
      ],
      cta: "Commencer",
      ctaLink: "/register",
      popular: false,
    },
    {
      name: "Premium",
      price: "5 500 XOF",
      period: "/ mois",
      promotion: {
        promoPrice: "3 500 XOF",
        endDate: "9 octobre 2025",
      },
      features: [
        "Liens illimités",
        "Analytique avancée",
        "QR codes personnalisés",
        "Partage de fichiers jusqu'à 100MB",
        "Domaines personnalisés",
      ],
      cta: "Passer au Plan",
      ctaLink: "/subscription",
      popular: false,
    },
    {
      name: "Premium Trimestriel",
      price: "255 XOF",
      originalPrice: "300 XOF",
      discount: "15%",
      period: "/ 3 mois",
      features: [
        "Liens illimités",
        "Analytique avancée",
        "QR codes personnalisés",
        "Partage de fichiers jusqu'à 100MB",
        "Domaines personnalisés",
        "15% de réduction par mois",
      ],
      cta: "Passer au Plan",
      ctaLink: "/subscription",
      popular: true,
    },
    {
      name: "Premium Annuel",
      price: "480 XOF",
      originalPrice: "1200 XOF",
      discount: "60%",
      period: "/ an",
      features: [
        "Liens illimités",
        "Analytique avancée",
        "QR codes personnalisés",
        "Partage de fichiers jusqu'à 100MB",
        "Domaines personnalisés",
        "60% de réduction par mois",
      ],
      cta: "Passer au Plan",
      ctaLink: "/subscription",
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
          Choisissez le plan qui correspond à vos besoins. Tous les plans
          incluent les fonctionnalités de base avec des limites et capacités
          différentes. Profitez de notre offre spéciale sur le plan Premium à
          3 500 XOF/mois jusqu'au 9 octobre 2025 !
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
                  {plan.discount && (
                    <span
                      className={`text-sm font-semibold ${
                        theme === "dark"
                          ? "text-dark-primary"
                          : "text-light-primary"
                      } bg-${
                        theme === "dark" ? "dark-primary/10" : "light-primary/10"
                      } px-2 py-1 rounded-full`}
                    >
                      -{plan.discount}
                    </span>
                  )}
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
                    <svg
                      className={`w-5 h-5 mt-0.5 mr-2 ${
                        theme === "dark"
                          ? "text-dark-primary"
                          : "text-light-primary"
                      }`}
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
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