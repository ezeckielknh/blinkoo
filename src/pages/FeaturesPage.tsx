import { useTheme } from "../contexts/ThemeContext";
import { motion } from "framer-motion";
import { Globe, QrCode, BarChart2, FileUp, Shield, Clock } from "lucide-react";
import { Link } from "react-router-dom";

const FeaturesPage = () => {
  const { theme } = useTheme();

  const features = [
    {
      icon: (
        <Globe
          size={32}
          className={`text-${
            theme === "dark" ? "dark-primary" : "light-primary"
          }`}
        />
      ),
      title: "Liens courts intelligents",
      description:
        "Créez des URL raccourcies en un clic, prêtes à être partagées sur tous vos canaux : réseaux sociaux, emails, SMS, bios ou campagnes marketing.",
    },
    {
      icon: (
        <QrCode
          size={32}
          className={`text-${
            theme === "dark" ? "dark-primary" : "light-primary"
          }`}
        />
      ),
      title: "QR Codes personnalisables",
      description:
        "Générez des QR codes dynamiques avec logo, couleurs et formes. Parfaits pour vos affiches, packagings, événements ou cartes de visite.",
    },
    {
      icon: (
        <BarChart2
          size={32}
          className={`text-${
            theme === "dark" ? "dark-primary" : "light-primary"
          }`}
        />
      ),
      title: "Statistiques détaillées",
      description:
        "Accédez à des insights avancés sur vos liens : nombre de clics, provenance géographique, appareils utilisés et heures de consultation.",
    },
    {
      icon: (
        <FileUp
          size={32}
          className={`text-${
            theme === "dark" ? "dark-primary" : "light-primary"
          }`}
        />
      ),
      title: "Partage de fichiers sécurisé",
      description:
        "Hébergez vos documents, images ou vidéos jusqu'à 100 Mo et partagez-les via des liens avec expiration ou nombre limite de téléchargements.",
    },
    {
      icon: (
        <Shield
          size={32}
          className={`text-${
            theme === "dark" ? "dark-primary" : "light-primary"
          }`}
        />
      ),
      title: "Protection et confidentialité",
      description:
        "Chaque lien et fichier est chiffré. Ajoutez des expirations, masquez vos destinations et contrôlez l’accès à vos ressources en toute sérénité.",
    },
    {
      icon: (
        <Clock
          size={32}
          className={`text-${
            theme === "dark" ? "dark-primary" : "light-primary"
          }`}
        />
      ),
      title: "Automatisation et gain de temps",
      description:
        "Créez, gérez et analysez vos liens en masse. Utilisez notre API pour intégrer Bliic à vos outils ou automatiser vos processus.",
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
            .feature-card {
              transition: transform 0.3s ease, box-shadow 0.3s ease;
              perspective: 1000px;
            }
            .feature-card:hover {
              transform: translateY(-4px) rotateX(2deg) rotateY(2deg);
              box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2),
                          0 0 20px ${
                            theme === "dark"
                              ? "rgba(234, 179, 8, 0.3)"
                              : "rgba(124, 58, 237, 0.3)"
                          };
            }
            .feature-card::before {
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
            .feature-card:hover::before {
              opacity: 1;
            }
            .icon-container {
              transition: transform 0.3s ease;
            }
            .feature-card:hover .icon-container {
              transform: scale(1.1);
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
            Découvrez les Fonctionnalités de Bliic
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
            Bliic offre une suite d'outils puissants pour simplifier le partage,
            suivre les performances et renforcer votre marque.
          </motion.p>
        </div>
      </section>

      {/* Features Grid */}
      <section className="">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                className={`feature-card relative rounded-2xl ${
                  theme === "dark" ? "bg-dark-card/10" : "bg-light-card/10"
                } backdrop-blur-sm border ${
                  theme === "dark"
                    ? "border-dark-text-secondary/50"
                    : "border-light-text-secondary/50"
                } p-6 flex flex-col items-center text-center`}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                custom={index}
                whileHover={{ scale: 1.05 }}
              >
                <div
                  className={`icon-container mb-4 p-3 rounded-full ${
                    theme === "dark"
                      ? "bg-dark-primary/10"
                      : "bg-light-primary/10"
                  }`}
                >
                  {feature.icon}
                </div>
                <h2
                  className={`text-lg font-semibold mb-2 ${
                    theme === "dark"
                      ? "text-dark-text-primary"
                      : "text-light-text-primary"
                  } font-sans`}
                >
                  {feature.title}
                </h2>
                <p
                  className={`text-base ${
                    theme === "dark"
                      ? "text-dark-text-secondary"
                      : "text-light-text-secondary"
                  } font-sans`}
                >
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section
        className={`py-16 ${
          theme === "dark" ? "bg-dark-background/50" : "bg-light-background/50"
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
            Prêt à Explorer Bliic ?
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
            Commencez gratuitement et découvrez comment nos fonctionnalités
            peuvent transformer votre façon de partager.
          </motion.p>
          <Link
            to="/register"
            className={`inline-block px-8 py-3 text-lg rounded-lg font-semibold ${
              theme === "dark"
                ? "bg-dark-primary text-dark-text-primary hover:bg-dark-primary/80"
                : "bg-light-primary text-dark-text-primary hover:bg-light-primary/80"
            } font-sans transition-all`}
          >
            Commencer Maintenant
          </Link>
        </div>
      </section>
    </div>
  );
};

export default FeaturesPage;
