import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  Download,
  Lock,
  Loader2,
  Link as LucideLink,
  BarChart,
  Globe,
  Shield,
} from "lucide-react";
import { API } from "../utils/api";
import { useToast } from "../contexts/ToastContext";
import { useTheme } from "../contexts/ThemeContext";
import logoImage from "../assets/bliic.png";
import logo2Image from "../assets/Bliic 2.png";

interface FileData {
  original_name: string;
  short_code?: string;
  custom_alias?: string;
  file_password?: boolean;
}

const FileDownloadPage = () => {
  const { code } = useParams<{ code: string }>();
  const { addToast } = useToast();
  const { theme } = useTheme();
  const [file, setFile] = useState<FileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [password, setPassword] = useState("");
  const [passwordRequired, setPasswordRequired] = useState(false);
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    if (!code) {
      addToast("Code de fichier manquant", "error");
      return;
    }
    fetchFileInfo();
  }, [code, addToast]);

  const fetchFileInfo = async () => {
    try {
      const res = await fetch(`${API.FILES.GET_FILE}/${code}`);
      const data = await res.json();

      if (!res.ok) {
        if (res.status === 410) setExpired(true);
        addToast(data?.error || "Fichier introuvable", "error");
        return;
      }

      setFile(data);
      setPasswordRequired(!!data.file_password);
    } catch (err) {
      addToast("Erreur réseau", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      const res = await fetch(`${API.FILES.DOWNLOAD}/${code}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (!res.ok) {
        const err = await res.json();
        addToast(err?.error || "Téléchargement impossible", "error");
        return;
      }

      const blob = await res.blob();
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = file?.original_name || "download";
      link.click();
      URL.revokeObjectURL(link.href);

      addToast("Téléchargement lancé", "success");
    } catch (err) {
      addToast("Erreur réseau", "error");
    }
  };

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

  if (loading) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center p-4 font-sans relative overflow-hidden ${
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
          } backdrop-blur-sm p-8 text-center`}
        >
          <Loader2
            size={32}
            className={`animate-spin ${
              theme === "dark" ? "text-dark-primary" : "text-light-primary"
            }`}
          />
        </div>
      </div>
    );
  }

  if (expired) {
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
          } backdrop-blur-sm p-8 text-center`}
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
              theme === "dark"
                ? "text-dark-text-primary"
                : "text-light-text-primary"
            } mb-4 font-sans`}
          >
            Lien expiré
          </h1>
          <p
            className={`text-base ${
              theme === "dark"
                ? "text-dark-text-secondary"
                : "text-light-text-secondary"
            } font-sans`}
          >
            Ce fichier n'est plus disponible au téléchargement.
          </p>
        </div>
      </div>
    );
  }

  if (!file) {
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
          } backdrop-blur-sm p-8 text-center`}
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
              theme === "dark"
                ? "text-dark-text-primary"
                : "text-light-text-primary"
            } mb-4 font-sans`}
          >
            Fichier introuvable
          </h1>
          <p
            className={`text-base ${
              theme === "dark"
                ? "text-dark-text-secondary"
                : "text-light-text-secondary"
            } font-sans`}
          >
            Le fichier demandé n'existe pas ou est inaccessible.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen flex items-center justify-center p-4 font-sans relative overflow-hidden ${
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
        } backdrop-blur-sm p-8 text-center`}
      >
        <Link to="/" className="inline-flex items-center justify-center mb-6">
          <img
            src={theme === "dark" ? logo2Image : logoImage}
            alt="Bliic"
            style={{ width: "70px" }}
          />
        </Link>
        <h1
          className={`text-3xl font-semibold ${
            theme === "dark"
              ? "text-dark-text-primary"
              : "text-light-text-primary"
          } mb-2 font-sans`}
        >
          Téléchargement de fichier
        </h1>
        <p
          className={`text-base truncate ${
            theme === "dark"
              ? "text-dark-text-secondary"
              : "text-light-text-secondary"
          } mb-6 font-sans`}
        >
          {file.original_name}
        </p>

        {passwordRequired && (
          <div className="mb-6">
            <label
              className={`block text-base ${
                theme === "dark"
                  ? "text-dark-text-secondary"
                  : "text-light-text-secondary"
              } mb-2 font-sans`}
            >
              Mot de passe requis
            </label>
            <div className="relative">
              <Lock
                className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                  theme === "dark" ? "text-dark-primary" : "text-light-primary"
                }`}
                size={20}
              />
              <input
                type="password"
                placeholder="Entrez le mot de passe"
                className={`w-full pl-10 pr-4 py-3 rounded-lg border font-sans ${
                  theme === "dark"
                    ? "bg-dark-card text-dark-text-primary placeholder-dark-text-secondary border-dark-text-secondary/50"
                    : "bg-light-card text-light-text-primary placeholder-light-text-secondary border-light-text-secondary/50"
                } focus:ring focus:ring-${
                  theme === "dark" ? "dark-secondary" : "light-secondary"
                }/20`}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>
        )}

        <button
          onClick={handleDownload}
          className={`w-full py-3 rounded-lg font-semibold flex items-center justify-center ${
            theme === "dark"
              ? "bg-dark-primary hover:bg-dark-secondary"
              : "bg-light-primary hover:bg-light-secondary"
          } text-dark-text-primary ${
            passwordRequired && !password ? "opacity-75 cursor-not-allowed" : ""
          } text-base font-sans`}
          disabled={passwordRequired && !password}
        >
          <Download size={16} className="mr-2" />
          Télécharger
        </button>
      </div>
    </div>
  );
};

export default FileDownloadPage;
