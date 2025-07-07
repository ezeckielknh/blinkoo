import { useTheme } from "../contexts/ThemeContext";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const TermsPage = () => {
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
            Conditions d'Utilisation
          </motion.h1>
          <motion.p
            className={`text-lg md:text-xl mb-12 max-w-3xl mx-auto ${
              theme === "dark" ? "text-dark-text-secondary" : "text-light-text-secondary"
            } font-sans`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            En utilisant Bliic, vous acceptez les conditions décrites ci-dessous.
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
              1. Acceptation des Conditions
            </h2>
            <p
              className={`text-base mb-6 ${
                theme === "dark" ? "text-dark-text-secondary" : "text-light-text-secondary"
              } font-sans`}
            >
              En accédant à nos services, vous acceptez ces conditions d'utilisation et notre politique de confidentialité.
            </p>

            <h2
              className={`text-2xl font-bold mb-4 ${
                theme === "dark" ? "text-dark-text-primary" : "text-light-text-primary"
              } font-sans`}
            >
              2. Utilisation des Services
            </h2>
            <p
              className={`text-base mb-6 ${
                theme === "dark" ? "text-dark-text-secondary" : "text-light-text-secondary"
              } font-sans`}
            >
              Vous vous engagez à utiliser Bliic de manière légale et à ne pas partager de contenu nuisible ou illégal.
            </p>

            <h2
              className={`text-2xl font-bold mb-4 ${
                theme === "dark" ? "text-dark-text-primary" : "text-light-text-primary"
              } font-sans`}
            >
              3. Responsabilités
            </h2>
            <p
              className={`text-base mb-6 ${
                theme === "dark" ? "text-dark-text-secondary" : "text-light-text-secondary"
              } font-sans`}
            >
              Vous êtes responsable de la sécurité de votre compte et des contenus que vous partagez via nos services.
            </p>

            <h2
              className={`text-2xl font-bold mb-4 ${
                theme === "dark" ? "text-dark-text-primary" : "text-light-text-primary"
              } font-sans`}
            >
              4. Limitation de Responsabilité
            </h2>
            <p
              className={`text-base mb-6 ${
                theme === "dark" ? "text-dark-text-secondary" : "text-light-text-secondary"
              } font-sans`}
            >
              Bliic ne peut être tenu responsable des dommages indirects résultant de l'utilisation de nos services.
            </p>

            <h2
              className={`text-2xl font-bold mb-4 ${
                theme === "dark" ? "text-dark-text-primary" : "text-light-text-primary"
              } font-sans`}
            >
              5. Modifications des Conditions
            </h2>
            <p
              className={`text-base mb-6 ${
                theme === "dark" ? "text-dark-text-secondary" : "text-light-text-secondary"
              } font-sans`}
            >
              Nous pouvons mettre à jour ces conditions à tout moment. Les modifications seront notifiées via notre site.
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
            Contactez-nous pour toute question concernant nos conditions d'utilisation.
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

export default TermsPage;