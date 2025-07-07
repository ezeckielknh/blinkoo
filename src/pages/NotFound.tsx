import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import logoImage from "../assets/bliic.png";
import logo2Image from "../assets/Bliic 2.png";
import { useTheme } from "../contexts/ThemeContext";

const NotFound = () => {
  const { theme } = useTheme();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-dark-background dark:bg-dark-background p-4">
      <div className="text-center max-w-md animate-fade-in" role="alert">
        <h1 className="text-6xl font-bold text-dark-text-primary dark:text-dark-text-primary mb-4 font-sans">
          404
        </h1>
        <p className="text-xl text-dark-text-secondary dark:text-dark-text-secondary mb-6 font-sans">
          Oups ! La page que vous cherchez n’existe pas.
        </p>
        <div className="relative w-64 h-64 mx-auto mb-6">
          <div
            className="absolute inset-0 rounded-full bg-gradient-to-r from-dark-primary to-dark-secondary blur-lg opacity-50 animate-pulse"
            aria-hidden="true"
          ></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-4xl font-semibold text-dark-text-primary dark:text-dark-text-primary font-sans">
               <img
            src={theme === "dark" ? logo2Image : logoImage}
            alt="Bliic"
            style={{ width: "150px" }}
          />
            </span>
          </div>
        </div>
        <Link
          to="/"
          className="inline-flex items-center justify-center px-6 py-3 bg-dark-primary dark:bg-dark-primary text-white text-lg font-semibold rounded-lg hover:bg-dark-primary/80 dark:hover:bg-dark-primary/80 transition-colors focus:outline-none focus:ring-2 focus:ring-dark-primary dark:focus:ring-dark-primary focus:ring-offset-2 focus:ring-offset-dark-background dark:focus:ring-offset-dark-background font-sans"
          aria-label="Retourner à la page d’accueil"
        >
          <ArrowLeft className="mr-2" size={20} aria-hidden="true" />
          Retour à l’accueil
        </Link>
      </div>
    </div>
  );
};

export default NotFound;