import { useTheme } from "../contexts/ThemeContext";
import { motion } from "framer-motion";
import {
  Users,
  Target,
  Heart,
  Clock,
  Award,
  Globe,
  Shield,
} from "lucide-react";
import { Link } from "react-router-dom";

const AboutPage = () => {
  const { theme } = useTheme();

  const team = [
    {
      name: "Jean Dupont",
      role: "Fondateur & CEO",
      image: "https://via.placeholder.com/150",
    },
    {
      name: "Marie Leclerc",
      role: "Directrice Technique",
      image: "https://via.placeholder.com/150",
    },
    {
      name: "Pierre Martin",
      role: "Responsable Marketing",
      image: "https://via.placeholder.com/150",
    },
    {
      name: "Sophie Laurent",
      role: "Designer UX/UI",
      image: "https://via.placeholder.com/150",
    },
  ];

  const values = [
    {
      icon: (
        <Target
          size={32}
          className={`text-${
            theme === "dark" ? "dark-primary" : "light-primary"
          }`}
        />
      ),
      title: "Innovation",
      description:
        "Nous repoussons les limites en développant des outils intuitifs et modernes pour simplifier le partage numérique, tout en intégrant les dernières technologies pour une expérience fluide.",
    },
    {
      icon: (
        <Users
          size={32}
          className={`text-${
            theme === "dark" ? "dark-primary" : "light-primary"
          }`}
        />
      ),
      title: "Communauté",
      description:
        "Nous croyons en la force de la connexion. Nos solutions permettent aux individus et aux entreprises du monde entier de partager et collaborer efficacement.",
    },
    {
      icon: (
        <Heart
          size={32}
          className={`text-${
            theme === "dark" ? "dark-primary" : "light-primary"
          }`}
        />
      ),
      title: "Confiance",
      description:
        "La sécurité et la transparence sont nos priorités. Nous utilisons un chiffrement de pointe et des pratiques éthiques pour protéger vos données et gagner votre confiance.",
    },
    {
      title: "Accessibilité",
      description:
        "Nos produits sont conçus pour être simples d’usage, quelle que soit votre expertise technique. Bliic est pensé pour tous.",
      icon: (
        <Clock
          size={32}
          className={`text-${
            theme === "dark" ? "dark-primary" : "light-primary"
          }`}
        />
      ),
    },
    {
      title: "Transparence",
      description:
        "Nous construisons une plateforme éthique, sans publicité invasive ni collecte abusive. Votre confiance est notre priorité.",
      icon: (
        <Shield
          size={32}
          className={`text-${
            theme === "dark" ? "dark-primary" : "light-primary"
          }`}
        />
      ),
    },
  ];

  const achievements = [
    {
      title: "1M+ de liens créés",
      description:
        "Des millions de liens ont été générés grâce à Bliic pour booster la communication de nos utilisateurs dans plus de 50 pays.",
    },
    {
      title: "100K+ utilisateurs satisfaits",
      description:
        "Une communauté fidèle de particuliers, freelances et entreprises fait confiance à Bliic au quotidien.",
    },
    {
      title: "99,9 % de disponibilité",
      description:
        "Notre infrastructure garantit rapidité et fiabilité. Vos liens restent actifs, même lorsque vous dormez.",
    },
  ];

  const partners = [
    { name: "Partenaire 1", logo: "https://via.placeholder.com/100" },
    { name: "Partenaire 2", logo: "https://via.placeholder.com/100" },
    { name: "Partenaire 3", logo: "https://via.placeholder.com/100" },
    { name: "Partenaire 4", logo: "https://via.placeholder.com/100" },
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
        className={`pt-16 ${
          theme === "dark"
            ? "bg-gradient-to-b from-dark-background to-dark-bg-dark"
            : "bg-gradient-to-b from-light-background to-light-bg-light"
        }`}
      >
        <style>
          {`
            .team-card, .value-card, .achievement-card, .partner-card {
              transition: transform 0.3s ease, box-shadow 0.3s ease;
              perspective: 1000px;
            }
            .team-card:hover, .value-card:hover, .achievement-card:hover, .partner-card:hover {
              transform: translateY(-4px) rotateX(2deg) rotateY(4px);
              box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2),
                          0 0 20px ${
                            theme === "dark"
                              ? "rgba(234, 179, 8, 0.3)"
                              : "rgba(124, 58, 237, 0.3)"
                          };
            }
            .team-card::before, .value-card::before, .achievement-card::before, .partner-card::before {
              content: '';
              position: absolute;
              inset: 0;
              border-radius: 8px;
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
            .team-card:hover::before, .value-card:hover::before, .achievement-card:hover::before, .partner-card:hover::before {
              opacity: 1;
            }
            .icon-container {
              transition: transform 0.3s ease;
            }
            .value-card:hover .icon-container, .achievement-card:hover .icon-container {
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
            À Propos de Bliic
          </motion.h1>
          <motion.p
            className={`text-lg md:text-xl mb-12 max-w-4xl mx-auto ${
              theme === "dark"
                ? "text-dark-text-secondary"
                : "text-light-text-secondary"
            } font-sans`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Bliic est bien plus qu’un raccourcisseur de lien : c’est une
            plateforme complète pour partager, connecter et analyser.
          </motion.p>
        </div>
      </section>

      {/* History Section */}
      {/* <section className="pb-12">
        <div className="container mx-auto px-4 max-w-7xl">
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
            Notre Histoire
          </motion.h2>
          <motion.div
            className={`text-lg max-w-4xl mx-auto ${
              theme === "dark"
                ? "text-dark-text-secondary"
                : "text-light-text-secondary"
            } font-sans space-y-4`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <p>
              Fondée en 2020, Bliic est née d'une vision simple : rendre le
              partage numérique intuitif et sécurisé. Tout a commencé avec une
              petite équipe passionnée par la technologie et déterminée à
              résoudre les frustrations liées aux longues URL et aux transferts
              de fichiers complexes.
            </p>
            <p>
              Depuis, nous avons grandi pour devenir une plateforme mondiale,
              utilisée par des milliers d'utilisateurs dans plus de 50 pays.
              Notre engagement envers l'innovation et la satisfaction des
              utilisateurs nous pousse à améliorer constamment nos outils, du
              raccourcissement d'URL aux QR codes personnalisés et aux analyses
              avancées.
            </p>
            <p>
              Aujourd'hui, Bliic est fier de connecter des individus, des
              créateurs et des entreprises, en leur offrant une solution fiable
              pour partager leurs contenus avec le monde entier.
            </p>
          </motion.div>
        </div>
      </section> */}

      {/* Mission Section */}
      <section
        className={`pb-12 ${
          theme === "dark" ? "bg-dark-background/50" : "bg-light-background/50"
        }`}
      >
        <div className="container mx-auto px-4 max-w-7xl">
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
            Notre Mission
          </motion.h2>
          <motion.div
            className={`text-lg max-w-4xl mx-auto text-center ${
              theme === "dark"
                ? "text-dark-text-secondary"
                : "text-light-text-secondary"
            } font-sans space-y-4`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <p>
              Chez Bliic, notre mission est claire : simplifier le partage
              numérique dans toutes ses dimensions. Nous voulons que chaque
              lien, QR code ou fichier partagé soit rapide, élégant,
              personnalisé et mesurable.
            </p>
            <p>
              Notre vision est de devenir un standard mondial pour la création
              de liens intelligents. Un outil à la fois puissant pour les
              professionnels, et intuitif pour tous.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Values Section */}
      <section className="pb-12">
        <div className="container mx-auto px-4 max-w-7xl">
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
            Nos Valeurs
          </motion.h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                className={`value-card relative rounded-lg ${
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
                  {value.icon}
                </div>
                <h3
                  className={`text-lg font-semibold mb-2 ${
                    theme === "dark"
                      ? "text-dark-text-primary"
                      : "text-light-text-primary"
                  } font-sans`}
                >
                  {value.title}
                </h3>
                <p
                  className={`text-base ${
                    theme === "dark"
                      ? "text-dark-text-secondary"
                      : "text-light-text-secondary"
                  } font-sans`}
                >
                  {value.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Achievements Section */}
      <section
        className={`pb-12 ${
          theme === "dark" ? "bg-dark-background/50" : "bg-light-background/50"
        }`}
      >
        <div className="container mx-auto px-4 max-w-7xl">
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
            Nos Réalisations
          </motion.h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {achievements.map((achievement, index) => (
              <motion.div
                key={achievement.title}
                className={`achievement-card relative rounded-lg ${
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
                  {achievement.icon}
                </div>
                <h3
                  className={`text-lg font-semibold mb-2 ${
                    theme === "dark"
                      ? "text-dark-text-primary"
                      : "text-light-text-primary"
                  } font-sans`}
                >
                  {achievement.title}
                </h3>
                <p
                  className={`text-base ${
                    theme === "dark"
                      ? "text-dark-text-secondary"
                      : "text-light-text-secondary"
                  } font-sans`}
                >
                  {achievement.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Partners Section */}
      {/* <section
        className={`pb-12 ${
          theme === "dark" ? "bg-dark-background/50" : "bg-light-background/50"
        }`}
      >
        <div className="container mx-auto px-4 max-w-7xl">
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
            Nos Partenaires
          </motion.h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {partners.map((partner, index) => (
              <motion.div
                key={partner.name}
                className={`partner-card relative rounded-lg ${
                  theme === "dark" ? "bg-dark-card/10" : "bg-light-card/10"
                } backdrop-blur-sm border ${
                  theme === "dark"
                    ? "border-dark-text-secondary/50"
                    : "border-light-text-secondary/50"
                } p-4 flex flex-col items-center text-center`}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                custom={index}
                whileHover={{ scale: 1.05 }}
              >
                <img
                  src={partner.logo}
                  alt={partner.name}
                  className="w-16 h-16 mb-2 object-contain"
                />
                <p
                  className={`text-base ${
                    theme === "dark"
                      ? "text-dark-text-primary"
                      : "text-light-text-primary"
                  } font-sans`}
                >
                  {partner.name}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section> */}

      {/* CTA Section */}
      <section
        className={`py-10 ${
          theme === "dark" ? "bg-dark-background" : "bg-light-background"
        }`}
      >
        <div className="container mx-auto px-4 max-w-7xl text-center">
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
            Rejoignez l'aventure avec Bliic
          </motion.h2>
          <motion.p
            className={`text-lg mb-8 max-w-4xl mx-auto ${
              theme === "dark"
                ? "text-dark-text-secondary"
                : "text-light-text-secondary"
            } font-sans`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Que vous soyez entrepreneur, créateur de contenu, développeur ou
            simplement passionné de productivité, Bliic vous aide à créer des
            liens puissants — au sens propre comme au figuré. Inscrivez-vous
            gratuitement et prenez le contrôle de votre communication numérique.
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

export default AboutPage;
