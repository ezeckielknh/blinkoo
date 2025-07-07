import { useTheme } from "../contexts/ThemeContext";
import { motion } from "framer-motion";
import { Zap, Shield, BarChart2, Headphones, Globe, Clock } from "lucide-react";

const WhyChooseUsSection = () => {
  const { theme } = useTheme();

  const advantages = [
    {
      icon: (
        <Zap
          size={28}
          className={theme === "dark" ? "text-yellow-400" : "text-purple-600"}
        />
      ),
      title: "Multi-fonction en un clic",
      description:
        "Liens courts, QR codes, fichiers partagés... tout est là, prêt à l’emploi, sans prise de tête.",
    },
    {
      icon: (
        <Globe
          size={28}
          className={theme === "dark" ? "text-yellow-400" : "text-purple-600"}
        />
      ),
      title: "Personnalisation poussée",
      description:
        "Adaptez vos liens, vos QR codes et même votre domaine à votre identité visuelle.",
    },
    {
      icon: (
        <Shield
          size={28}
          className={theme === "dark" ? "text-yellow-400" : "text-purple-600"}
        />
      ),
      title: "Sécurité et confidentialité",
      description:
        "Chiffrement, expiration automatique, contrôle des accès : vos données sont entre de bonnes mains.",
    },
    {
      icon: (
        <BarChart2
          size={28}
          className={theme === "dark" ? "text-yellow-400" : "text-purple-600"}
        />
      ),
      title: "Statistiques complètes",
      description:
        "Analysez les clics, les appareils, les pays et bien plus pour mieux comprendre votre audience.",
    },
    {
      icon: (
        <Clock
          size={28}
          className={theme === "dark" ? "text-yellow-400" : "text-purple-600"}
        />
      ),
      title: "Gain de temps automatisé",
      description:
        "Partage rapide, génération instantanée de QR et API pour les pros : boostez votre productivité.",
    },
    {
      icon: (
        <Headphones
          size={28}
          className={theme === "dark" ? "text-yellow-400" : "text-purple-600"}
        />
      ),
      title: "Support humain et réactif",
      description:
        "Notre équipe est là 7j/7 pour vous aider à tirer le meilleur de chaque lien ou fichier partagé.",
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
    <section
      className={`py-16 ${
        theme === "dark"
          ? "bg-gradient-to-r from-dark-primary/10 to-dark-secondary/10"
          : "bg-gradient-to-r from-light-primary/10 to-light-secondary/10"
      }`}
    >
      <style>
        {`
          .why-card {
            transition: transform 0.3s ease, box-shadow 0.3s ease;
            perspective: 1000px;
          }
          .why-card:hover {
            transform: translateY(-4px) rotateX(2deg) rotateY(2deg);
            box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2),
                        0 0 20px ${
                          theme === "dark"
                            ? "rgba(234, 179, 8, 0.3)"
                            : "rgba(124, 58, 237, 0.3)"
                        };
          }
          .why-card::before {
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
          .why-card:hover::before {
            opacity: 1;
          }
          .icon-container {
            transition: transform 0.3s ease;
          }
          .why-card:hover .icon-container {
            transform: scale(1.1);
          }
        `}
      </style>
      <div className="container mx-auto px-4 max-w-7xl">
        <motion.h2
          className={`text-3xl md:text-4xl font-bold text-center mb-12 ${
            theme === "dark"
              ? "text-dark-text-primary"
              : "text-light-text-primary"
          } font-sans`}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Pourquoi choisir Bliic ?
        </motion.h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {advantages.map((advantage, index) => (
            <motion.div
              key={advantage.title}
              className={`why-card relative rounded-2xl ${
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
                {advantage.icon}
              </div>
              <h3
                className={`text-lg font-semibold mb-2 ${
                  theme === "dark"
                    ? "text-dark-text-primary"
                    : "text-light-text-primary"
                } font-sans`}
              >
                {advantage.title}
              </h3>
              <p
                className={`text-base ${
                  theme === "dark"
                    ? "text-dark-text-secondary"
                    : "text-light-text-secondary"
                } font-sans`}
              >
                {advantage.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUsSection;
