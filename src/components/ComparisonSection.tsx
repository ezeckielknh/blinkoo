import { useTheme } from "../contexts/ThemeContext";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const ComparisonSection = () => {
  const { theme } = useTheme();

  const competitors = [
    { name: "Bitly", logoDark: "assets/img/landing/tools/bitly-dark.svg", logoLight: "assets/img/landing/tools/bitly-light.svg" },
    { name: "Kloo", logoDark: "assets/img/landing/tools/kloo-dark.svg", logoLight: "assets/img/landing/tools/kloo-light.svg" },
    { name: "Short.io", logoDark: "assets/img/landing/tools/shortio-dark.svg", logoLight: "assets/img/landing/tools/shortio-light.svg" },
    { name: "TinyURL", logoDark: "assets/img/landing/tools/tinyurl-dark.svg", logoLight: "assets/img/landing/tools/tinyurl-light.svg" },
    { name: "Rebrandly", logoDark: "assets/img/landing/tools/rebrandly-dark.svg", logoLight: "assets/img/landing/tools/rebrandly-light.svg" },
    { name: "Linkly", logoDark: "assets/img/landing/tools/linkly-dark.svg", logoLight: "assets/img/landing/tools/linkly-light.svg" },
  ];

  const advantages = [
    {
      title: "Liens illimités",
      description: "Bliic offre des liens illimités avec le plan Premium, contrairement à Bitly (100/mois max sur Core) ou TinyURL (limité sur gratuit).",
    },
    {
      title: "Partage de fichiers généreux",
      description: "Partagez jusqu'à 1 GB par fichier, bien au-dessus des 50-500 MB des concurrents comme Short.io ou Linkly, qui n'offrent pas de partage de fichiers.",
    },
    {
      title: "Stockage abondant",
      description: "Obtenez 10 GB (Premium) ou illimité (Enterprise), contre 100 MB (TinyURL) ou 1 GB (Rebrandly) chez les autres.",
    },
    {
      title: "Analytique avancée",
      description: "Bliic fournit des analyses détaillées (clics, localisation, appareils), surpassant les analyses basiques de TinyURL ou limitées de Short.io.",
    },
    {
      title: "QR codes personnalisés",
      description: "Créez des QR codes avec votre logo et couleurs, contrairement aux QR standards de Bitly (payants) ou TinyURL.",
    },
    {
      title: "Domaines personnalisés",
      description: "Supporte 1-2 domaines personnalisés, une fonctionnalité absente chez TinyURL et limitée chez Short.io sans frais supplémentaires.",
    },
    {
      title: "Aucun branding imposé",
      description: "Supprimez le branding Bliic avec Premium, contrairement à Bitly ou Rebrandly, qui imposent leur marque sur les plans gratuits.",
    },
    {
      title: "Paiements par mobile money",
      description: "Payez avec M-Pesa, Airtel Money, etc., une option unique que Bitly, Kloo, Short.io, TinyURL, Rebrandly et Linkly ne proposent pas.",
    },
  ];

  const logoVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: (i: number) => ({
      opacity: 1,
      scale: 1,
      transition: { delay: i * 0.1, duration: 0.3, ease: "easeOut" },
    }),
  };

  return (
    <section className="py-16">
      <style>
        {`
          .logo-card {
            transition: transform 0.3s ease, box-shadow 0.3s ease;
            perspective: 1000px;
          }
          .logo-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2),
                        0 0 20px ${
                          theme === "dark" ? "rgba(234, 179, 8, 0.3)" : "rgba(124, 58, 237, 0.3)"
                        };
          }
          .cta-button {
            transition: transform 0.3s ease, box-shadow 0.3s ease;
          }
          .cta-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
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
                Pourquoi Bliic surpasse les autres
              </h2>
              <ul className="space-y-3 mb-4 max-w-lg mx-auto lg:mx-0">
                {advantages.map((advantage, index) => (
                  <motion.li
                    key={advantage.title}
                    className={`text-base ${theme === "dark" ? "text-dark-text-secondary" : "text-light-text-secondary"} font-sans`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <strong className={`${theme === "dark" ? "text-dark-text-primary" : "text-light-text-primary"}`}>
                      {advantage.title} :
                    </strong>{" "}
                    {advantage.description}
                  </motion.li>
                ))}
              </ul>
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
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 lg:gap-3 xl:gap-4">
                {competitors.map((competitor, index) => (
                  <motion.div
                    key={competitor.name}
                    className={`logo-card p-4 rounded-xl ${theme === "dark" ? "bg-dark-card/90" : "bg-light-card/90"}`}
                    variants={logoVariants}
                    initial="hidden"
                    animate="visible"
                    custom={index}
                    whileHover={{ scale: 1.05 }}
                  >
                    <img
                      src={theme === "dark" ? competitor.logoDark : competitor.logoLight}
                      alt={`${competitor.name} logo`}
                      className="mx-auto h-12 w-auto"
                    />
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