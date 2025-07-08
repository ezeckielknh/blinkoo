
import { useTheme } from "../contexts/ThemeContext";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Check, X } from "lucide-react";

type FeatureKey = "links" | "fileSharing" | "storage" | "analytics" | "qrCodes" | "customDomains" | "branding";

interface Comparison {
  name: string;
  features: Record<FeatureKey, string>;
  isBliic: boolean;
}

const ComparisonSection = () => {
  const { theme } = useTheme();

  const comparisons: Comparison[] = [
    {
      name: "Bliic",
      features: {
        links: "Illimités (Premium)",
        fileSharing: "1 GB (Premium)",
        storage: "10 GB (Premium), Illimité (Enterprise)",
        analytics: "Avancée",
        qrCodes: "Personnalisés",
        customDomains: "Oui (1-2)",
        branding: "Aucun (Premium)",
      },
      isBliic: true,
    },
    {
      name: "Solution A",
      features: {
        links: "5/mois",
        fileSharing: "50 MB",
        storage: "100 MB",
        analytics: "Basique",
        qrCodes: "Standards",
        customDomains: "Non",
        branding: "Obligatoire",
      },
      isBliic: false,
    },
    {
      name: "Solution B",
      features: {
        links: "20/mois",
        fileSharing: "500 MB",
        storage: "1 GB",
        analytics: "Limitée",
        qrCodes: "Standards",
        customDomains: "Non",
        branding: "Partiel",
      },
      isBliic: false,
    },
  ];

  const features: { key: FeatureKey; label: string }[] = [
    { key: "links", label: "Liens par mois" },
    { key: "fileSharing", label: "Partage de fichiers" },
    { key: "storage", label: "Stockage total" },
    { key: "analytics", label: "Analytique" },
    { key: "qrCodes", label: "QR codes" },
    { key: "customDomains", label: "Domaines personnalisés" },
    { key: "branding", label: "Branding" },
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
          .comparison-card {
            transition: transform 0.3s ease, box-shadow 0.3s ease;
            perspective: 1000px;
          }
          .comparison-card:hover {
            transform: translateY(-4px) rotateX(2deg) rotateY(2deg);
            box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2),
                        0 0 20px ${
                          theme === "dark" ? "rgba(234, 179, 8, 0.3)" : "rgba(124, 58, 237, 0.3)"
                        };
          }
          .comparison-card::before {
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
          .comparison-card:hover::before {
            opacity: 1;
          }
          .cta-button {
            transition: transform 0.3s ease, box-shadow 0.3s ease;
          }
          .cta-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
          }
          .highlight-card {
            border-width: 2px;
            border-color: ${theme === "dark" ? "#7c3aed" : "#eab308"};
          }
        `}
      </style>
      <div className="container mx-auto px-4 max-w-7xl">
        <div className={`rounded-2xl py-5 px-4 sm:px-5 ${theme === "dark" ? "bg-dark-primary/10" : "bg-light-primary/10"}`}>
          <div className="flex flex-col lg:flex-row items-center gap-0 py-2 sm:py-3 md:py-4 xl:px-5">
            <motion.div
              className="order-2 text-center lg:text-left lg:ps-5 mx-auto lg:me-0"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h2
                className={`text-3xl md:text-4xl font-bold mb-4 ${
                  theme === "dark" ? "text-dark-text-primary" : "text-light-text-primary"
                } font-sans`}
              >
                Pourquoi choisir Bliic ?
              </h2>
              <p
                className={`pb-3 mb-3 lg:mb-4 max-w-lg mx-auto lg:mx-0 text-base ${
                  theme === "dark" ? "text-dark-text-secondary" : "text-light-text-secondary"
                } font-sans`}
              >
                Contrairement aux autres solutions, Bliic offre des liens illimités, un partage de fichiers jusqu'à 1 GB, un stockage généreux, des analyses avancées et des options de personnalisation sans branding imposé. Profitez de notre flexibilité et de nos plans abordables pour une expérience sans compromis.
              </p>
              <Link
                to="/subscription"
                className={`cta-button hidden lg:inline-flex px-6 py-3 rounded-lg font-semibold text-base font-sans ${
                  theme === "dark"
                    ? "bg-dark-primary hover:bg-dark-primary/80 text-dark-text-primary"
                    : "bg-light-primary hover:bg-light-primary/80 text-dark-text-primary"
                }`}
              >
                Découvrir les plans
              </Link>
            </motion.div>
            <motion.div
              className="order-1 w-full max-w-[558px] mx-auto lg:mx-0 mb-6 lg:mb-0"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-3 xl:gap-4">
                {comparisons.map((solution, index) => (
                  <motion.div
                    key={solution.name}
                    className={`comparison-card p-4 rounded-xl ${
                      theme === "dark" ? "bg-dark-card/90" : "bg-light-card/90"
                    } ${solution.isBliic ? "highlight-card" : "border border-dark-text-secondary/50"}`}
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    custom={index}
                    whileHover={{ scale: 1.05 }}
                  >
                    <h3
                      className={`text-xl font-bold mb-4 text-center ${
                        theme === "dark" ? "text-dark-text-primary" : "text-light-text-primary"
                      } font-sans`}
                    >
                      {solution.name}
                    </h3>
                    <ul className="space-y-2">
                      {features.map((feature) => (
                        <li
                          key={feature.key}
                          className={`flex items-center text-sm ${
                            theme === "dark" ? "text-dark-text-secondary" : "text-light-text-secondary"
                          } font-sans`}
                        >
                          {solution.features[feature.key].includes("Illimités") ||
                          solution.features[feature.key].includes("Oui") ||
                          solution.features[feature.key].includes("Aucun") ||
                          solution.features[feature.key].includes("Avancée") ||
                          solution.features[feature.key].includes("Personnalisés") ||
                          solution.features[feature.key].includes("Illimité") ? (
                            <Check
                              size={16}
                              className={`mr-2 ${theme === "dark" ? "text-dark-primary" : "text-light-primary"}`}
                            />
                          ) : (
                            <X
                              size={16}
                              className={`mr-2 ${theme === "dark" ? "text-dark-danger" : "text-light-danger"}`}
                            />
                          )}
                          <span>{solution.features[feature.key]}</span>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                ))}
              </div>
              <div className="text-center pt-4 mt-2 md:mt-3 lg:hidden">
                <Link
                  to="/subscription"
                  className={`cta-button px-6 py-3 rounded-lg font-semibold text-base font-sans ${
                    theme === "dark"
                      ? "bg-dark-primary hover:bg-dark-primary/80 text-dark-text-primary"
                      : "bg-light-primary hover:bg-light-primary/80 text-dark-text-primary"
                  }`}
                >
                  Découvrir les plans
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ComparisonSection;