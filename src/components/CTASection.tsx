import { useState } from "react";
import { useTheme } from "../contexts/ThemeContext";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const CTASection = () => {
  const { theme } = useTheme();
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number; size: number }[]>([]);
  let rippleId = 0;

  // Fonction splitText pour animer le texte caractère par caractère
  const splitText = (text: string) =>
    text.split("").map((char, index) => (
      <motion.span
        key={`${char}-${index}`}
        variants={{
          hidden: { opacity: 0, y: 20 },
          visible: { opacity: 1, y: 0, transition: { delay: index * 0.05, duration: 0.3 } },
        }}
        className="inline-block"
      >
        {char === " " ? "\u00A0" : char}
      </motion.span>
    ));

  // Gestion de l'effet ripple au clic
  const handleButtonClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const button = e.currentTarget;
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;
    setRipples([...ripples, { id: rippleId++, x, y, size }]);
    setTimeout(() => {
      setRipples((prev) => prev.filter((ripple) => ripple.id !== rippleId - 1));
    }, 600);
  };

  // Particules animées
  const particles = [
    { size: 16, top: "10%", left: "15%", delay: 0 },
    { size: 12, bottom: "20%", right: "20%", delay: 1.5 },
    { size: 14, top: "30%", right: "10%", delay: 3 },
    { size: 10, bottom: "15%", left: "25%", delay: 4.5 },
  ];

  return (
    <section
      className={`py-20 relative overflow-hidden ${
        theme === "dark" ? "bg-dark-background" : "bg-light-background"
      }`}
    >
      <style>
        {`
          .cta-button {
            perspective: 1000px;
            transition: transform 0.3s ease, box-shadow 0.3s ease;
          }
          .cta-button:hover {
            transform: translateY(-2px) rotateX(4deg) rotateY(4deg);
            box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2),
                        0 0 16px ${
                          theme === "dark" ? "rgba(234, 179, 8, 0.4)" : "rgba(124, 58, 237, 0.4)"
                        };
          }
          .cta-button::before {
            content: '';
            position: absolute;
            inset: 0;
            border-radius: 0.5rem;
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
          .cta-button:hover::before {
            opacity: 1;
          }
          .ripple {
            position: absolute;
            border-radius: 50%;
            background: ${
              theme === "dark" ? "rgba(234, 179, 8, 0.3)" : "rgba(124, 58, 237, 0.3)"
            };
            pointer-events: none;
          }
        `}
      </style>
      {/* Animated Particles */}
      {particles.map((particle, index) => (
        <motion.div
          key={index}
          className={`absolute rounded-full ${
            theme === "dark" ? "bg-dark-primary/30" : "bg-light-primary/30"
          }`}
          style={{
            width: particle.size,
            height: particle.size,
            top: particle.top,
            left: particle.left,
            bottom: particle.bottom,
            right: particle.right,
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            delay: particle.delay,
            ease: "easeInOut",
          }}
        />
      ))}
      <div className="container mx-auto px-4 max-w-4xl relative z-10">
        <motion.div
          className={`rounded-2xl ${
            theme === "dark" ? "bg-dark-card/10" : "bg-light-card/10"
          } backdrop-blur-sm p-8 md:p-12 relative overflow-hidden`}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.h2
            className={`text-4xl md:text-5xl font-bold mb-6 text-center ${
              theme === "dark"
                ? "text-dark-text-primary"
                : "text-light-text-primary"
            } font-sans`}
            initial="hidden"
            animate="visible"
          >
            {splitText("Vos liens méritent mieux.")}
          </motion.h2>
          <motion.p
            className={`text-lg md:text-xl mb-8 max-w-2xl mx-auto text-center ${
              theme === "dark"
                ? "text-dark-text-secondary"
                : "text-light-text-secondary"
            } font-sans`}
            initial="hidden"
            animate="visible"
          >
            {splitText(
    "Rejoignez Bliic et transformez vos URL en outils puissants de partage, d’analyse et de visibilité. C’est simple, rapide et gratuit."
  )}
          </motion.p>
          <div className="relative inline-block mx-auto flex justify-center">
            <Link
              to="/register"
              className={`cta-button relative px-8 py-3 text-lg rounded-lg font-semibold ${
                theme === "dark"
                  ? "bg-dark-primary text-dark-text-primary"
                  : "bg-light-primary text-dark-text-primary"
              } font-sans overflow-hidden`}
              onClick={handleButtonClick}
              aria-label="Commencer maintenant"
              role="button"
            >
             Créer mon lien gratuit
              {ripples.map((ripple) => (
                <motion.span
                  key={ripple.id}
                  className="ripple"
                  style={{
                    width: ripple.size,
                    height: ripple.size,
                    left: ripple.x,
                    top: ripple.y,
                  }}
                  initial={{ scale: 0, opacity: 0.3 }}
                  animate={{ scale: 4, opacity: 0 }}
                  transition={{ duration: 0.6 }}
                />
              ))}
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;