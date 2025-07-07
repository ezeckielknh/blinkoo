import { Link } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";
import { AlertTriangle, ArrowLeft, Link as LucideLink, BarChart, Globe, Shield } from "lucide-react";
import logoImage from "../assets/bliccc.png";

const NotSupported = () => {
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
        theme === "dark"
          ? "bg-dark-background"
          : "bg-light-background"
      } bg-gradient-to-br ${
        theme === "dark"
          ? "from-dark-background to-dark-primary via-dark-secondary"
          : "from-light-background to-light-primary via-light-secondary"
      } animate-pulse`}
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
      <div className="absolute inset-0 z-0">
        {backgroundIcons}
      </div>
      <div
        className={`w-full max-w-md rounded-2xl shadow-xl relative z-10 ${
          theme === "dark" ? "bg-dark-card/90" : "bg-light-card/90"
        } backdrop-blur-sm p-8 text-center`}
      >
        <Link to="/" className="inline-flex items-center justify-center mb-6">
          <img src={logoImage} alt="Bliic" style={{ width: "70px" }} />
        </Link>
        <AlertTriangle
          size={64}
          className={`${
            theme === "dark" ? "text-dark-primary" : "text-light-primary"
          } mx-auto mb-6`}
          aria-hidden="true"
        />
        <h1
          className={`text-3xl font-bold ${
            theme === "dark" ? "text-dark-text-primary" : "text-light-text-primary"
          } mb-4 font-sans`}
        >
          Type non pris en charge
        </h1>
        <p
          className={`text-base ${
            theme === "dark" ? "text-dark-text-secondary" : "text-light-text-secondary"
          } mb-6 font-sans`}
        >
          Ce type de QR Code n'est pas pris en charge.
        </p>
        <Link
          to="/"
          className={`inline-flex items-center justify-center px-6 py-3 ${
            theme === "dark"
              ? "bg-dark-primary hover:bg-dark-secondary"
              : "bg-light-primary hover:bg-light-secondary"
          } text-dark-text-primary text-lg font-semibold rounded-lg font-sans`}
          aria-label="Retourner à la page d’accueil"
        >
          <ArrowLeft className="mr-2" size={20} aria-hidden="true" />
          Retour à l'accueil
        </Link>
      </div>
    </div>
  );
};

export default NotSupported;