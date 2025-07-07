import { useState } from "react";
import { Link } from "react-router-dom";
import { Sun, Moon, Menu, X, Zap, CreditCard, Info, Mail, User } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";
import { useAuth } from "../contexts/AuthContext";
import logoImage from "../assets/bliic.png";
import logo2Image from "../assets/Bliic 2.png";
import { motion, AnimatePresence } from "framer-motion";

const Header = () => {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Animation variants for header
  const headerVariants = {
    hidden: { y: -100, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5, ease: "easeOut" } },
  };

  // Animation variants for nav items
  const navItemVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1, duration: 0.3 },
    }),
    hover: { scale: 1.05, transition: { duration: 0.2 } },
  };

  // Animation variants for mobile menu
  const mobileMenuVariants = {
    hidden: { opacity: 0, x: "100%" },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3, ease: "easeInOut" } },
    exit: { opacity: 0, x: "100%", transition: { duration: 0.3, ease: "easeInOut" } },
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const navLinks = [
    { to: "/features", label: "Fonctionnalités", icon: <Zap size={18} /> },
    { to: "/pricing", label: "Tarifs", icon: <CreditCard size={18} /> },
    { to: "/about", label: "À propos", icon: <Info size={18} /> },
    { to: "/contact", label: "Contact", icon: <Mail size={18} /> },
    {
      to: user ? "/dashboard" : "/login",
      label: user ? "Mon Compte" : "Connexion",
      icon: <User size={18} />,
    },
  ];

  return (
    <motion.header
      className={`sticky top-0 z-20 ${
        theme === "dark"
          ? "bg-dark-card/50 border-dark-text-secondary/30"
          : "bg-light-card/50 border-light-text-secondary/30"
      } backdrop-blur-2xl border-b shadow-md animate-slide-up`}
      initial="hidden"
      animate="visible"
      variants={headerVariants}
    >
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        {/* Logo */}
        <motion.div
          className="flex items-center"
          whileHover={{ scale: 1.1 }}
          transition={{ duration: 0.3 }}
        >
          <Link to="/" aria-label="Retour à l'accueil">
            <img
              src={theme === "dark" ? logo2Image : logoImage}
              alt="Bliic"
              className="w-20 drop-shadow-md"
            />
          </Link>
        </motion.div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <AnimatePresence>
            {navLinks.map((link, index) => (
              <motion.div
                key={link.label}
                custom={index}
                initial="hidden"
                animate="visible"
                variants={navItemVariants}
                whileHover="hover"
              >
                <Link
                  to={link.to}
                  className={`relative px-3 py-2 text-base font-medium font-sans flex items-center gap-2 ${
                    theme === "dark"
                      ? "text-dark-text-primary hover:text-dark-primary"
                      : "text-light-text-primary hover:text-light-primary"
                  } transition-colors group`}
                >
                  <span
                    className={`transition-transform duration-300 group-hover:scale-110 ${
                      theme === "dark" ? "text-dark-text-primary" : "text-light-text-primary"
                    }`}
                  >
                    {link.icon}
                  </span>
                  {link.label}
                  <span
                    className={`absolute bottom-0 left-1/2 w-0 h-0.5 ${
                      theme === "dark" ? "bg-dark-primary" : "bg-light-primary"
                    } transition-all duration-300 group-hover:w-3/4 group-hover:left-1/4`}
                  ></span>
                </Link>
              </motion.div>
            ))}
            <motion.button
              className={`p-2 rounded-full ${
                theme === "dark"
                  ? "bg-dark-primary/10 hover:bg-dark-primary/20 text-dark-primary"
                  : "bg-light-primary/10 hover:bg-light-primary/20 text-light-primary"
              } transition-colors animate-pulse`}
              onClick={() => {
                toggleTheme();
                console.log("Toggle Theme button clicked");
              }}
              aria-label={`Passer en mode ${theme === "dark" ? "clair" : "sombre"}`}
              title={`Passer en mode ${theme === "dark" ? "clair" : "sombre"}`}
              variants={navItemVariants}
              whileHover="hover"
            >
              {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
            </motion.button>
          </AnimatePresence>
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 rounded-full text-dark-text-primary"
          onClick={toggleMenu}
          aria-label={isMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              className={`fixed top-0 right-0 h-screen w-3/4 max-w-xs ${
                theme === "dark" ? "bg-dark-card/90" : "bg-light-card/90"
              } backdrop-blur-md shadow-2xl p-6 z-30`}
              variants={mobileMenuVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <div className="flex justify-end">
                <button
                  onClick={toggleMenu}
                  className="p-2 rounded-full text-dark-text-primary"
                  aria-label="Fermer le menu"
                >
                  <X size={24} />
                </button>
              </div>
              <nav className="flex flex-col mt-8 space-y-4">
                {navLinks.map((link, index) => (
                  <Link
                    key={link.label}
                    to={link.to}
                    className={`px-4 py-2 text-lg font-medium font-sans rounded-lg flex items-center gap-2 ${
                      theme === "dark"
                        ? "text-dark-text-primary hover:bg-dark-primary/10 hover:text-dark-primary"
                        : "text-light-text-primary hover:bg-light-primary/10 hover:text-light-primary"
                    } transition-all duration-300`}
                    onClick={toggleMenu}
                  >
                    <span className="transition-transform duration-300 hover:scale-110">
                      {link.icon}
                    </span>
                    {link.label}
                  </Link>
                ))}
                <button
                  className={`flex items-center gap-2 px-4 py-2 text-lg font-medium font-sans rounded-lg ${
                    theme === "dark"
                      ? "text-dark-text-primary hover:bg-dark-primary/10 hover:text-dark-primary"
                      : "text-light-text-primary hover:bg-light-primary/10 hover:text-light-primary"
                    } transition-all duration-300`}
                  onClick={() => {
                    toggleTheme();
                    toggleMenu();
                    console.log("Toggle Theme button clicked");
                  }}
                  aria-label={`Passer en mode ${theme === "dark" ? "clair" : "sombre"}`}
                >
                  {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
                  Mode {theme === "dark" ? "Clair" : "Sombre"}
                </button>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
};

export default Header;