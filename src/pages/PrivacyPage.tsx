import { useTheme } from "../contexts/ThemeContext";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const PrivacyPage = () => {
  const { theme } = useTheme();

  return (
    <div className="flex flex-col">
      {/* Introduction Section */}
      <section
        className={`py-20 ${
          theme === "dark"
            ? "bg-gradient-to-b from-dark-background to-dark-bg-dark"
            : "bg-gradient-to-b from-light-background to-light-bg-light"
        }`}
      >
        <div className="container mx-auto px-4 max-w-5xl text-center">
          <motion.h1
            className={`text-4xl md:text-5xl font-bold mb-6 ${
              theme === "dark" ? "text-dark-text-primary" : "text-light-text-primary"
            } font-sans`}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Politique de Confidentialité
          </motion.h1>
          <motion.p
            className={`text-lg md:text-xl mb-12 max-w-3xl mx-auto ${
              theme === "dark" ? "text-dark-text-secondary" : "text-light-text-secondary"
            } font-sans`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Nous respectons votre vie privée et nous engageons à protéger vos données personnelles.
          </motion.p>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2
              className={`text-2xl font-bold mb-4 ${
                theme === "dark" ? "text-dark-text-primary" : "text-light-text-primary"
              } font-sans`}
            >
              1. Informations Collectées
            </h2>
            <p
              className={`text-base mb-6 ${
                theme === "dark" ? "text-dark-text-secondary" : "text-light-text-secondary"
              } font-sans`}
            >
              Nous collectons des informations que vous nous fournissez, telles que votre nom, email, et données de compte, ainsi que des données d'utilisation (par exemple, clics sur les liens).
            </p>

            <h2
              className={`text-2xl font-bold mb-4 ${
                theme === "dark" ? "text-dark-text-primary" : "text-light-text-primary"
              } font-sans`}
            >
              2. Utilisation des Informations
            </h2>
            <p
              className={`text-base mb-6 ${
                theme === "dark" ? "text-dark-text-secondary" : "text-light-text-secondary"
              } font-sans`}
            >
              Vos données sont utilisées pour fournir et améliorer nos services, personnaliser votre expérience, et communiquer avec vous.
            </p>

            <h2
              className={`text-2xl font-bold mb-4 ${
                theme === "dark" ? "text-dark-text-primary" : "text-light-text-primary"
              } font-sans`}
            >
              3. Partage des Informations
            </h2>
            <p
              className={`text-base mb-6 ${
                theme === "dark" ? "text-dark-text-secondary" : "text-light-text-secondary"
              } font-sans`}
            >
              Nous ne partageons vos données qu'avec des partenaires de confiance pour fournir nos services ou lorsque la loi l'exige.
            </p>

            <h2
              className={`text-2xl font-bold mb-4 ${
                theme === "dark" ? "text-dark-text-primary" : "text-light-text-primary"
              } font-sans`}
            >
              4. Vos Droits
            </h2>
            <p
              className={`text-base mb-6 ${
                theme === "dark" ? "text-dark-text-secondary" : "text-light-text-secondary"
              } font-sans`}
            >
              Vous pouvez accéder, corriger, ou supprimer vos données personnelles en nous contactant à support@bliic.com.
            </p>

            <h2
              className={`text-2xl font-bold mb-4 ${
                theme === "dark" ? "text-dark-text-primary" : "text-light-text-primary"
              } font-sans`}
            >
              5. Sécurité
            </h2>
            <p
              className={`text-base mb-6 ${
                theme === "dark" ? "text-dark-text-secondary" : "text-light-text-secondary"
              } font-sans`}
            >
              Nous utilisons des mesures de sécurité avancées, comme le chiffrement, pour protéger vos données.
            </p>
          </motion.div>
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
              theme === "dark" ? "text-dark-text-primary" : "text-light-text-primary"
            } font-sans`}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Des Questions ?
          </motion.h2>
          <motion.p
            className={`text-lg mb-8 max-w-2xl mx-auto ${
              theme === "dark" ? "text-dark-text-secondary" : "text-light-text-secondary"
            } font-sans`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Contactez-nous pour toute question concernant notre politique de confidentialité.
          </motion.p>
          <Link
            to="/contact"
            className={`inline-block px-8 py-3 text-lg rounded-lg font-semibold ${
              theme === "dark"
                ? "bg-dark-primary text-dark-text-primary hover:bg-dark-primary/80"
                : "bg-light-primary text-dark-text-primary hover:bg-light-primary/80"
            } font-sans transition-all`}
          >
            Nous Contacter
          </Link>
        </div>
      </section>
    </div>
  );
};

export default PrivacyPage;