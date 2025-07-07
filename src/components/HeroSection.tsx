import { useState } from "react";
import { Link } from "react-router-dom";
import { useToast } from "../contexts/ToastContext";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import axios from "axios";
import { API } from "../utils/api";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { motion } from "framer-motion";
import {
  Copy,
  ExternalLink,
  Loader2,
  Link as LinkIcon,
  BarChart,
  QrCode,
  FileUp,
} from "lucide-react";

const HeroSection = () => {
  const { addToast } = useToast();
  const { user, setUser } = useAuth();
  const { theme } = useTheme();
  const [url, setUrl] = useState("");
  const [shortUrl, setShortUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const textVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.05, duration: 0.3 },
    }),
  };

  const splitText = (text: string) =>
    text.split("").map((char, index) => (
      <motion.span
        key={`${char}-${index}`}
        variants={textVariants}
        initial="hidden"
        animate="visible"
        custom={index}
        className="inline-block"
      >
        {char === " " ? "\u00A0" : char}
      </motion.span>
    ));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!url) {
      addToast("Veuillez entrer une URL", "error");
      return;
    }

    if (!isValidUrl(url)) {
      addToast("Veuillez entrer une URL valide", "error");
      return;
    }

    setLoading(true);

    try {
      const endpoint = user
        ? API.SHORT_LINKS.CREATE_AUTH
        : API.SHORT_LINKS.CREATE;

      const payload = {
        original_url: url,
      };

      const headers = user
        ? { Authorization: `Bearer ${user.token}` }
        : undefined;

      interface ResponseData {
        short_link: string;
        user?: any;
        access_token?: string;
      }

      const response = await axios.post<ResponseData>(endpoint, payload, {
        headers,
      });
      setShortUrl(response.data.short_link);
      if (!user && response.data.user && response.data.access_token) {
        const newUser = response.data.user;
        newUser.token = response.data.access_token;
        localStorage.setItem("access_token", newUser.token);
        localStorage.setItem("user", JSON.stringify(newUser));
        setUser(newUser);
      }

      addToast("Lien raccourci créé avec succès !", "success");
    } catch (error: any) {
      console.error("Erreur lors de la création du lien :", error);

      if (error.response && error.response.data) {
        const apiError = error.response.data;

        if (apiError.error) {
          addToast(apiError.error, "error");
        } else if (apiError.message) {
          addToast(apiError.message, "error");
        } else {
          addToast("Une erreur s'est produite côté serveur.", "error");
        }
      } else {
        addToast("Erreur réseau. Veuillez vérifier votre connexion.", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch (err) {
      return false;
    }
  };

  const services = [
    {
      icon: LinkIcon,
      name: "Raccourcissement d'URL",
      description: "Créez des liens courts et faciles à partager pour une meilleure accessibilité.",
    },
    {
      icon: BarChart,
      name: "Analytique Avancée",
      description: "Suivez les performances de vos liens avec des analyses détaillées.",
    },
    {
      icon: QrCode,
      name: "QR Codes Personnalisés",
      description: "Générez des QR codes uniques pour un accès rapide à vos liens.",
    },
    {
      icon: FileUp,
      name: "Partage de Fichiers",
      description: "Partagez vos fichiers en toute simplicité avec des liens sécurisés.",
    },
  ];

  return (
    <section
      className={`py-12 md:py-16 px-4 flex-grow relative overflow-hidden ${
        theme === "dark" ? "bg-dark-background" : "bg-light-background"
      } bg-gradient-to-br ${
        theme === "dark"
          ? "from-dark-background to-dark-primary via-dark-secondary"
          : "from-light-background to-light-primary via-light-secondary"
      }`}
    >
      <div className="container mx-auto max-w-7xl relative z-10">
        {/* Top: Main Content */}
        <div className="text-center mb-12">
          <div className="animate-slide-up">
            <h1
              className={`text-5xl md:text-7xl font-bold mb-4 ${
                theme === "dark"
                  ? "text-dark-text-primary"
                  : "text-light-text-primary"
              } font-sans`}
            >
              Transformez vos liens. <br />Boostez votre visibilité.
            </h1>
            <p
              className={`text-lg md:text-xl mb-8 text-white font-sans`}
            >
              Des URL plus courtes, plus intelligentes, des QR codes
              personnalisés, le partage de fichiers simplifié. <br />
              Tout ce qu’il vous faut, réuni en un seul endroit.
            </p>
          </div>

          <div
            className={`rounded-2xl shadow-xl ${
              theme === "dark" ? "bg-dark-card/90" : "bg-light-card/90"
            } backdrop-blur-sm p-6 animate-slide-up max-w-2xl mx-auto`}
            style={{ animationDelay: "100ms" }}
          >
            {!shortUrl ? (
              <form
                onSubmit={handleSubmit}
                className="flex flex-col md:flex-row gap-4"
              >
                <input
                  type="text"
                  placeholder="Entrez votre lien a raccourcir"
                  className={`flex-1 pl-4 pr-4 py-3 rounded-lg border font-sans ${
                    theme === "dark"
                      ? "bg-dark-card text-dark-text-primary placeholder-dark-text-secondary border-dark-text-secondary/50"
                      : "bg-light-card text-light-text-primary placeholder-light-text-secondary border-light-text-secondary/50"
                  } focus:ring focus:ring-${
                    theme === "dark" ? "dark-secondary" : "light-secondary"
                  }/20 focus:outline-none`}
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  aria-label="Créer mon lien court"
                />
                <button
                  type="submit"
                  className={`px-6 py-3 rounded-lg font-semibold ${
                    theme === "dark"
                      ? "bg-dark-primary hover:bg-dark-secondary"
                      : "bg-light-primary hover:bg-dark-secondary"
                  } text-dark-text-primary text-base font-sans ${
                    loading ? "opacity-75 cursor-not-allowed" : ""
                  }`}
                  disabled={loading}
                  aria-label="Raccourcir l'URL"
                >
                  {loading ? (
                    <>
                      <Loader2
                        size={16}
                        className={`animate-spin mr-2 text-dark-text-primary`}
                      />
                      Raccourcissement en cours...
                    </>
                  ) : (
                    "Créer mon lien court"
                  )}
                </button>
              </form>
            ) : (
              <div className="space-y-4">
                <div
                  className={`flex items-center justify-between p-3 ${
                    theme === "dark" ? "bg-dark-card/50" : "bg-light-card/50"
                  } rounded-lg`}
                >
                  <a
                    href={shortUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`font-medium truncate mr-2 text-base ${
                      theme === "dark"
                        ? "text-dark-primary hover:underline"
                        : "text-light-primary hover:underline"
                    } font-sans`}
                    title={shortUrl}
                  >
                    {shortUrl}
                  </a>
                  <div className="flex items-center space-x-2">
                    <CopyToClipboard
                      text={shortUrl}
                      onCopy={() =>
                        addToast(
                          "Lien copié dans le presse-papiers !",
                          "success"
                        )
                      }
                    >
                      <button
                        className={`p-2 ${
                          theme === "dark"
                            ? "hover:bg-dark-primary/10"
                            : "hover:bg-light-primary/10"
                        } rounded-lg transition-colors`}
                        title="Copier le lien"
                        aria-label="Copier le lien raccourci"
                      >
                        <Copy
                          size={16}
                          className={
                            theme === "dark"
                              ? "text-dark-text-secondary"
                              : "text-light-text-secondary"
                          }
                        />
                      </button>
                    </CopyToClipboard>
                    <a
                      href={shortUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`p-2 ${
                        theme === "dark"
                          ? "hover:bg-dark-primary/10"
                          : "hover:bg-light-primary/10"
                        } rounded-lg transition-colors`}
                      title="Ouvrir le lien"
                      aria-label="Ouvrir le lien raccourci"
                    >
                      <ExternalLink
                        size={16}
                        className={
                          theme === "dark"
                            ? "text-dark-text-secondary"
                            : "text-light-text-secondary"
                        }
                      />
                    </a>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => {
                      setShortUrl(null);
                      setUrl("");
                    }}
                    className={`px-6 py-3 rounded-lg font-semibold text-base font-sans ${
                      theme === "dark"
                        ? "text-dark-text-primary border border-dark-text-secondary/50 hover:bg-dark-primary/10"
                        : "text-light-text-primary border border-light-text-secondary/50 hover:bg-light-primary/10"
                    }`}
                  >
                    Raccourcir un autre lien
                  </button>
                  <Link
                    to="/register"
                    className={`px-6 py-3 rounded-lg font-semibold text-base font-sans ${
                      theme === "dark"
                        ? "bg-dark-primary hover:bg-dark-secondary text-dark-text-primary"
                        : "bg-light-primary hover:bg-dark-secondary text-dark-text-primary"
                    }`}
                  >
                    S'inscrire pour plus de fonctionnalités
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom: Services Grid */}
        <section className="container py-5 my-lg-3">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 pb-3 md:pb-4 lg:pb-5">
            {services.map((service, index) => (
              <motion.div
                key={service.name}
                className="text-center"
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.3, delay: index * 0.1 } },
                }}
                whileHover={{ scale: 1.05 }}
              >
                <div className="relative mx-auto mb-3 sm:mb-4" style={{ width: '68px', aspectRatio: '1/1' }}>
                  <service.icon
                    size={32}
                    className={`absolute inset-0 m-auto ${
                      theme === "dark"
                        ? "text-dark-primary"
                        : "text-light-primary"
                    }`}
                  />
                  <svg
                    className={`absolute top-0 left-0 ${
                      theme === "dark"
                        ? "text-dark-primary"
                        : "text-light-primary"
                    }`}
                    width="68"
                    height="68"
                    viewBox="0 0 68 68"
                    fill="currentColor"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M56.0059 60.5579C44.1549 78.9787 18.0053 58.9081 6.41191 46.5701C-2.92817 35.5074 -2.81987 12.1818 11.7792 3.74605C30.0281 -6.79858 48.0623 7.40439 59.8703 15.7971C71.6784 24.1897 70.8197 37.5319 56.0059 60.5579Z"
                      fillOpacity="0.1"
                    />
                  </svg>
                </div>
                <h3
                  className={`text-xl font-semibold pb-2 mb-1 text-white font-sans`}
                >
                  {service.name}
                </h3>
                <p
                  className={`text-sm mb-0 text-white/80 font-sans`}
                >
                  {service.description}
                </p>
              </motion.div>
            ))}
          </div>
        </section>
      </div>
    </section>
  );
};

export default HeroSection;