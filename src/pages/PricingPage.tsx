import { useTheme } from "../contexts/ThemeContext";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Check,
  ChevronDown,
  ChevronUp,
  Gift,
  Calendar,
  Clock,
  Award,
} from "lucide-react";
import { useState } from "react";

const PricingPage = () => {
  const { theme } = useTheme();
  const [activeFAQ, setActiveFAQ] = useState<number | null>(null);

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
      price: "3 500 FCFA",
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
      ctaLink: "/subscription",
      popular: false,
      promotion: {
        originalPrice: "5 500 FCFA",
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
      ctaLink: "/subscription",
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
      ctaLink: "/subscription",
      popular: false,
    },
  ];

  const faqs = [
    {
      question:
        "Quels sont les avantages des plans Premium par rapport au plan Découverte ?",
      answer:
        "Les plans Premium offrent des liens illimités, des QR codes personnalisés, une analytique avancée, la personnalisation de domaine, et un espace de stockage étendu (jusqu'à 100 Mo). Le plan Découverte est limité à 10 liens/mois, des QR codes standards, 5 Mo de stockage et affiche la marque Bliic. Actuellement, le plan Premium Mensuel est en promotion à 3 500 FCFA/mois (au lieu de 5 500 FCFA) jusqu'au 9 octobre 2025.",
    },
    {
      question: "Puis-je changer ou annuler mon plan à tout moment ?",
      answer:
        "Oui, vous pouvez modifier ou annuler votre abonnement à tout moment depuis votre tableau de bord. Le changement est instantané et sans frais cachés.",
    },
    {
      question: "Que se passe-t-il à la fin de mon abonnement ?",
      answer:
        "Si vous ne renouvelez pas, vous revenez automatiquement au plan Découverte. Vos liens et fichiers restent valides, mais certaines fonctionnalités avancées seront désactivées.",
    },
    {
      question: "Proposez-vous une garantie ou un remboursement ?",
      answer:
        "Oui. Vous pouvez demander un remboursement intégral dans les 7 jours suivant votre souscription si vous n’êtes pas satisfait de l’expérience.",
    },
    {
      question: "Comment se passe la facturation ?",
      answer:
        "La facturation se fait via mobile money ou carte bancaire selon la durée choisie (mensuelle, trimestrielle ou annuelle). Une facture est générée automatiquement. Profitez de la promotion actuelle sur le plan Premium Mensuel à 3 500 FCFA/mois jusqu'au 9 octobre 2025.",
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

  const toggleFAQ = (index: number) => {
    setActiveFAQ(activeFAQ === index ? null : index);
  };

  return (
    <div className="flex flex-col">
      {/* Introduction Section */}
      <section
        className={`py-16 ${
          theme === "dark"
            ? "bg-gradient-to-b from-dark-background to-dark-card/10"
            : "bg-gradient-to-b from-light-background to-light-card/10"
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
                            theme === "dark"
                              ? "rgba(234, 179, 8, 0.3)"
                              : "rgba(124, 58, 237, 0.3)"
                          };
            }
            .pricing-card::before {
              content: '';
              position: absolute;
              inset: 0;
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
            .popular-badge::before, .promo-badge::before {
              content: '';
              position: absolute;
              top: -1px;
              left: -1px;
              right: -1px;
              bottom: -1px;
              border-radius: 9999px;
              background: linear-gradient(
                45deg,
                ${theme === "dark" ? "#eab308" : "#7c3aed"},
                ${theme === "dark" ? "#7c3aed" : "#eab308"}
              );
              z-index: -1;
            }
            .faq-item {
              transition: background-color 0.3s ease;
            }
            .faq-item:hover {
              background-color: ${
                theme === "dark"
                  ? "rgba(255, 255, 255, 0.05)"
                  : "rgba(0, 0, 0, 0.05)"
              };
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
        <div className="container mx-auto px-4 max-w-7xl text-center">
          <motion.h1
            className={`text-4xl md:text-5xl font-bold mb-6 ${
              theme === "dark"
                ? "text-dark-text-primary"
                : "text-light-text-primary"
            } font-sans`}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Des tarifs simples, pour tous les besoins
          </motion.h1>
          <motion.p
            className={`text-lg md:text-xl mb-12 max-w-3xl mx-auto ${
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
            offre spéciale sur le plan Premium Mensuel jusqu'au 9 octobre 2025 !
          </motion.p>
        </div>
      </section>

      {/* Pricing Grid */}
      <section className="pb-16">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                    className={`popular-badge absolute -top-3 left-1/2 transform -translate-x-1/2 px-4 py-1 text-sm font-semibold rounded-full ${
                      theme === "dark"
                        ? "bg-dark-secondary text-dark-text-primary"
                        : "bg-light-secondary text-dark-text-primary"
                    }`}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.1 + 0.4 }}
                  >
                    Populaire
                  </motion.div>
                )}
                {plan.promotion && (
                  <motion.div
                    className={`promo-badge absolute ${
                      plan.popular ? "-top-10" : "-top-3"
                    } left-1/2 transform -translate-x-1/2 px-4 py-1 text-sm font-semibold rounded-full ${
                      theme === "dark"
                        ? "bg-dark-primary text-dark-text-primary"
                        : "bg-light-primary text-dark-text-primary"
                    }`}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.1 + 0.4 }}
                  >
                    Promo jusqu'au {plan.promotion.endDate}
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
                  <h2
                    className={`text-2xl font-bold mb-2 ${
                      theme === "dark"
                        ? "text-dark-text-primary"
                        : "text-light-text-primary"
                    } font-sans`}
                  >
                    {plan.name}
                  </h2>
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
                      className={`text-base ${
                        theme === "dark"
                          ? "text-dark-text-secondary"
                          : "text-light-text-secondary"
                      } font-sans`}
                    >
                      {plan.period}
                    </span>
                    {plan.promotion && (
                      <span
                        className={`text-sm line-through ${
                          theme === "dark"
                            ? "text-dark-text-secondary"
                            : "text-light-text-secondary"
                        } font-sans`}
                      >
                        {plan.promotion.originalPrice}
                      </span>
                    )}
                  </div>
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
                  className={`cta-button w-full px-6 py-3 rounded-lg font-semibold text-base font-sans text-center ${
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

      {/* FAQ Section */}
      <section
        className={`py-16 ${
          theme === "dark" ? "bg-dark-background/50" : "bg-light-background/50"
        }`}
      >
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.h2
            className={`text-3xl md:text-4xl font-bold mb-8 text-center ${
              theme === "dark"
                ? "text-dark-text-primary"
                : "text-light-text-primary"
            } font-sans`}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Questions Fréquentes sur les Tarifs
          </motion.h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={faq.question}
                className={`faq-item rounded-lg border ${
                  theme === "dark"
                    ? "border-dark-text-secondary/50"
                    : "border-light-text-secondary/50"
                } overflow-hidden`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <button
                  className={`w-full flex justify-between items-center p-4 text-left ${
                    theme === "dark"
                      ? "text-dark-text-primary"
                      : "text-light-text-primary"
                  } font-sans font-semibold`}
                  onClick={() => toggleFAQ(index)}
                  aria-expanded={activeFAQ === index}
                  aria-controls={`faq-answer-${index}`}
                >
                  <span>{faq.question}</span>
                  {activeFAQ === index ? (
                    <ChevronUp size={20} />
                  ) : (
                    <ChevronDown size={20} />
                  )}
                </button>
                {activeFAQ === index && (
                  <motion.div
                    id={`faq-answer-${index}`}
                    className={`p-4 ${
                      theme === "dark" ? "bg-dark-card/10" : "bg-light-card/10"
                    }`}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <p
                      className={`text-base ${
                        theme === "dark"
                          ? "text-dark-text-secondary"
                          : "text-light-text-secondary"
                      } font-sans`}
                    >
                      {faq.answer}
                    </p>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section
        className={`py-16 ${
          theme === "dark" ? "bg-dark-background" : "bg-light-background"
        }`}
      >
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <motion.h2
            className={`text-3xl md:text-4xl font-bold mb-6 ${
              theme === "dark"
                ? "text-dark-text-primary"
                : "text-light-text-primary"
            } font-sans`}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Lancez-vous avec Bliic dès maintenant
          </motion.h2>
          <motion.p
            className={`text-lg mb-8 max-w-2xl mx-auto ${
              theme === "dark"
                ? "text-dark-text-secondary"
                : "text-light-text-secondary"
            } font-sans`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Testez gratuitement, puis débloquez le plein potentiel de vos liens,
            QR codes et partages avec un plan adapté à votre usage. Ne manquez
            pas notre offre spéciale sur le plan Premium Mensuel jusqu'au 9
            octobre 2025 !
          </motion.p>
          <Link
            to="/register"
            className={`inline-block px-8 py-3 text-lg rounded-lg font-semibold ${
              theme === "dark"
                ? "bg-dark-primary text-dark-text-primary hover:bg-dark-primary/80"
                : "bg-light-primary text-dark-text-primary hover:bg-light-primary/80"
            } font-sans transition-all`}
          >
            S'inscrire Maintenant
          </Link>
        </div>
      </section>
    </div>
  );
};

export default PricingPage;