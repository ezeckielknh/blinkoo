import { useTheme } from "../contexts/ThemeContext";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";
import HeaderSection from "../components/Header";
import FooterSection from "../components/FooterSection";

interface PageLayoutProps {
  children: React.ReactNode;
}

const PageLayout = ({ children }: PageLayoutProps) => {
  const { theme } = useTheme();
  const location = useLocation();
  const [showBackToTop, setShowBackToTop] = useState(false);

  // Track scroll position to show/hide the button
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Smooth scroll to top
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const buttonVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.3, ease: "easeOut" } },
  };

  return (
    <div
      className={`min-h-screen flex flex-col ${
        theme === "dark" ? "bg-dark-background" : "bg-light-background"
      }`}
    >
      <style>
        {`
          .back-to-top {
            transition: transform 0.3s ease, box-shadow 0.3s ease;
          }
          .back-to-top:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2),
                        0 0 10px ${
                          theme === "dark" ? "rgba(234, 179, 8, 0.3)" : "rgba(124, 58, 237, 0.3)"
                        };
          }
          .back-to-top::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            border-radius: 50%;
            padding: 1px;
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
          .back-to-top:hover::before {
            opacity: 1;
          }
        `}
      </style>
      <HeaderSection />
      <AnimatePresence mode="wait">
        <motion.main
          key={location.pathname}
          variants={{
            initial: { opacity: 0, y: 20 },
            animate: { opacity: 1, y: 0, transition: { duration: 0.5 } },
            exit: { opacity: 0, y: -20, transition: { duration: 0.3 } },
          }}
          initial="initial"
          animate="animate"
          exit="exit"
          className="flex-grow"
        >
          {children}
        </motion.main>
      </AnimatePresence>
      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            onClick={scrollToTop}
            className={`back-to-top fixed bottom-6 right-6 p-3 rounded-full ${
              theme === "dark" ? "bg-dark-primary text-dark-text-primary" : "bg-light-primary text-dark-text-primary"
            } z-50`}
            variants={buttonVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            aria-label="Retourner en haut de la page"
            title="Retourner en haut"
          >
            <ArrowUp size={24} />
          </motion.button>
        )}
      </AnimatePresence>
      <FooterSection />
    </div>
  );
};

export default PageLayout;