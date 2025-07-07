import { Link } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";
import { Link as LucideLink, BarChart, Globe, Shield } from "lucide-react";
import logoImage from "../assets/bliic.png";
import logo2Image from "../assets/Bliic 2.png";

const IncompletePage = () => {
  const { theme } = useTheme();

  // Generate background icons
  const iconTypes = [LucideLink, BarChart, Globe, Shield];
  const iconCount = 32;
  const backgroundIcons = Array.from({ length: iconCount }).map((_, index) => {
    const Icon = iconTypes[index % iconTypes.length];
    const randomX = Math.random() * 100;
    const randomY = Math.random() * 100;
    const randomDelay = Math.random() * 5;
    const randomDuration = 8 + Math.random() * 4;
    return (
      <Icon
        key={index}
        className="absolute w-6 h-6 opacity-20 text-white"
        style={{
          left: `${randomX}%`,
          top: `${randomY}%`,
          animation: `float ${randomDuration}s ease-in-out ${randomDelay}s infinite`,
          willChange: "transform, opacity",
        }}
      />
    );
  });

  return (
    <div
      className={`min-h-screen flex flex-col items-center justify-center p-4 font-sans relative overflow-hidden ${
        theme === "dark" ? "bg-dark-background" : "bg-light-background"
      } bg-gradient-to-br ${
        theme === "dark"
          ? "from-dark-background to-dark-primary via-dark-secondary"
          : "from-light-background to-light-primary via-light-secondary"
      } `}
    >
      <style>
        {`
          @keyframes float {
            0% { transform: translate(0, 0); opacity: 0.2; }
            50% { transform: translate(20px, -30px); opacity: 0.4; }
            100% { transform: translate(0, 0); opacity: 0.2; }
          }
        `}
      </style>
      <div className="absolute inset-0 z-0">{backgroundIcons}</div>
      <div
        className={`w-full max-w-md rounded-2xl shadow-xl relative z-10 ${
          theme === "dark" ? "bg-dark-card/90" : "bg-light-card/90"
        } backdrop-blur-sm p-8 text-center space-y-6`}
      >
        <Link to="/" className="inline-flex items-center justify-center mb-6">
          <img
            src={theme === "dark" ? logo2Image : logoImage}
            alt="Bliic"
            style={{ width: "70px" }}
          />
        </Link>
        <h1
          className={`text-3xl font-bold ${
            theme === "dark" ? "text-dark-text-primary" : "text-light-text-primary"
          } font-sans`}
        >
          Génération du QR Code Incomplète
        </h1>
        <p
          className={`text-base ${
            theme === "dark" ? "text-dark-text-secondary" : "text-light-text-secondary"
          } font-sans`}
        >
          La génération du QR code n’est pas terminée. Veuillez remplir le formulaire et cliquer sur “Générer” pour créer un QR code valide.
        </p>
        <Link
          to="/"
          className={`inline-flex items-center justify-center px-6 py-3 ${
            theme === "dark"
              ? "bg-dark-primary hover:bg-dark-secondary"
              : "bg-light-primary hover:bg-light-secondary"
          } text-dark-text-primary text-base font-semibold rounded-lg font-sans`}
          aria-label="Retourner au générateur de QR code"
        >
          Retour au Générateur
        </Link>
      </div>
    </div>
  );
};

export default IncompletePage;