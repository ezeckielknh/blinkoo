import { useTheme } from "../contexts/ThemeContext";
import { motion } from "framer-motion";
import { Twitter, MessageCircle, Facebook } from "lucide-react";
import { Link } from "react-router-dom";
import logoImage from "../assets/bliic.png";
import logo2Image from "../assets/Bliic 2.png";

const FooterSection = () => {
  const { theme } = useTheme();

  const footerLinks = {
    product: [
      { name: "Raccourcisseur d'URL", to: "/features#url-shortening" },
      { name: "Codes QR", to: "/features#qr-codes" },
      { name: "Analytiques", to: "/features#analytics" },
      { name: "Partage de fichiers", to: "/features#file-sharing" },
    ],
    company: [
      { name: "À propos de nous", to: "/about" },
      { name: "Contact", to: "/contact" },
      { name: "Blog", to: "/posts" },
    ],
    legal: [
      { name: "Politique de confidentialité", to: "/privacy" },
      { name: "Conditions d'utilisation", to: "/terms" },
    ],
  };

  const socialLinks = [
    {
      name: "Twitter",
      href: "https://x.com",
      icon: <Twitter size={20} />,
      ariaLabel: "Visiter notre page Twitter",
    },
    {
      name: "WhatsApp",
      href: "https://wa.me/+1234567890?text=Bonjour%20Bliic,%20j'ai%20une%20question%20!",
      icon: <MessageCircle size={20} />,
      ariaLabel: "Contacter Bliic sur WhatsApp",
    },
    {
      name: "Facebook",
      href: "https://facebook.com/bliic",
      icon: <Facebook size={20} />,
      ariaLabel: "Visiter notre page Facebook",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  return (
    <footer
      className={`py-12 relative ${
        theme === "dark"
          ? "bg-dark-card/10 border-t border-dark-text-secondary/50"
          : "bg-light-card/10 border-t border-light-text-secondary/50"
      } backdrop-blur-sm`}
    >
      <style>
        {`
          .footer-border {
            position: relative;
            overflow: hidden;
          }
          .footer-border::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 2px;
            background: linear-gradient(
              to right,
              ${theme === "dark" ? "#eab308" : "#7c3aed"},
              ${theme === "dark" ? "#7c3aed" : "#eab308"}
            );
            transform: translateX(-100%);
            transition: transform 0.5s ease;
          }
          .footer-border:hover::before {
            transform: translateX(0);
          }
          .footer-link {
            position: relative;
            transition: color 0.3s ease;
          }
          .footer-link::after {
            content: '';
            position: absolute;
            bottom: -2px;
            left: 0;
            width: 0;
            height: 1px;
            background: ${
              theme === "dark" ? "var(--dark-primary)" : "var(--light-primary)"
            };
            transition: width 0.3s ease;
          }
          .footer-link:hover::after {
            width: 100%;
          }
          .social-icon {
            transition: transform 0.3s ease, color 0.3s ease;
          }
          .social-icon:hover {
            transform: scale(1.2);
            color: ${theme === "dark" ? "#eab308" : "#7c3aed"};
          }
        `}
      </style>
      <div className="container mx-auto px-4 max-w-6xl">
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Brand Section */}
          <motion.div variants={itemVariants}>
            <div className="flex items-center mb-4">
              <motion.img
                src={theme === "dark" ? logo2Image : logoImage}
                alt="Bliic"
                className="w-20"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <p
              className={`text-sm ${
                theme === "dark"
                  ? "text-dark-text-secondary"
                  : "text-light-text-secondary"
              } font-sans`}
            >
              Raccourcisseur d'URL simple pour tous.
            </p>
          </motion.div>

          {/* Product Links */}
          <motion.div variants={itemVariants}>
            <h4
              className={`font-semibold mb-4 text-lg ${
                theme === "dark"
                  ? "text-dark-text-primary"
                  : "text-light-text-primary"
              } font-sans`}
            >
              Produit
            </h4>
            <ul className="space-y-2">
              {footerLinks.product.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.to}
                    className={`footer-link text-sm ${
                      theme === "dark"
                        ? "text-dark-text-secondary hover:text-dark-primary"
                        : "text-light-text-secondary hover:text-light-primary"
                    } font-sans`}
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Company & Legal Links */}
          <motion.div variants={itemVariants}>
            <h4
              className={`font-semibold mb-4 text-lg ${
                theme === "dark"
                  ? "text-dark-text-primary"
                  : "text-light-text-primary"
              } font-sans`}
            >
              À propos
            </h4>
            <ul className="space-y-2">
              {[...footerLinks.company, ...footerLinks.legal].map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.to}
                    className={`footer-link text-sm ${
                      theme === "dark"
                        ? "text-dark-text-secondary hover:text-dark-primary"
                        : "text-light-text-secondary hover:text-light-primary"
                    } font-sans`}
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>
        </motion.div>

        {/* Bottom Section */}
        <motion.div
          className={`border-t footer-border ${
            theme === "dark"
              ? "border-dark-text-secondary/50"
              : "border-light-text-secondary/50"
          } mt-8 pt-8 flex flex-col md:flex-row justify-between items-center`}
          variants={itemVariants}
          initial="hidden"
          animate="visible"
        >
          <p
            className={`text-sm ${
              theme === "dark"
                ? "text-dark-text-secondary"
                : "text-light-text-secondary"
              } font-sans mb-4 md:mb-0`}
          >
            © {new Date().getFullYear()} Bliic. Tous droits réservés.
          </p>
          <div className="flex space-x-4">
            {socialLinks.map((social) => (
              <a
                key={social.name}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`social-icon text-${
                  theme === "dark"
                    ? "dark-text-secondary"
                    : "light-text-secondary"
                }`}
                aria-label={social.ariaLabel}
              >
                {social.icon}
              </a>
            ))}
          </div>
        </motion.div>
      </div>
    </footer>
  );
};

export default FooterSection;