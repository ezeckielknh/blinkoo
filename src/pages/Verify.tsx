import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import { useTheme } from "../contexts/ThemeContext";
import { RefreshCw, ShieldCheck, Link as LucideLink, BarChart, Globe, Shield } from "lucide-react";
import { API } from "../utils/api";
import axios from "axios";
import logoImage from "../assets/bliic.png";
import logo2Image from "../assets/Bliic 2.png";

interface User {
  id: string;
  email: string;
  name: string;
  plan: "free" | "premium";
  role: "user" | "admin" | "super_admin";
  access: {
    trial_started_at?: string;
    trial_ends_at?: string;
    trial_status?: "none" | "active" | "expired";
  };
  token: string;
}

const Verify = () => {
  const navigate = useNavigate();
  const { verify, loading } = useAuth();
  const { addToast } = useToast();
  const { theme } = useTheme();

  const [verificationCode, setVerificationCode] = useState("");
  const [resending, setResending] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();

    const pendingEmail = localStorage.getItem("Bliic_pending_email");
    if (!pendingEmail) {
      addToast("Email introuvable. Veuillez recommencer l’inscription.", "error");
      navigate("/register");
    }
  }, [addToast, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!verificationCode) {
      addToast("Veuillez entrer le code de vérification.", "error");
      return;
    }

    if (!/^\d{4,6}$/.test(verificationCode)) {
      addToast("Le code doit être un nombre à 4 ou 6 chiffres.", "error");
      return;
    }

    try {
      await verify(verificationCode);
      addToast("Vérification réussie !", "success");
      localStorage.removeItem("Bliic_pending_email");
      navigate("/dashboard");
    } catch (error: any) {
      addToast(
        error?.message || "Une erreur est survenue lors de la vérification.",
        "error"
      );
    }
  };

  const handleResendCode = async () => {
    setResending(true);

    const pendingEmail = localStorage.getItem("Bliic_pending_email");
    if (!pendingEmail) {
      addToast("Email introuvable. Veuillez recommencer l’inscription.", "error");
      navigate("/register");
      setResending(false);
      return;
    }

    try {
      await axios.post(API.AUTH.RESEND_CODE, { email: pendingEmail });
      addToast("Code de vérification renvoyé avec succès !", "success");
    } catch (error: any) {
      addToast(
        error?.response?.data?.error || "Une erreur est survenue lors de l'envoi.",
        "error"
      );
    } finally {
      setResending(false);
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

  return (
    <div
      className={`min-h-screen flex items-center justify-center p-4 font-sans relative overflow-hidden ${
        theme === "dark"
          ? "bg-dark-background"
          : "bg-light-background"
      } bg-gradient-to-br ${
        theme === "dark"
          ? "from-dark-background to-dark-primary via-dark-secondary"
          : "from-light-background to-light-primary via-light-secondary"
      }`}
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
        } backdrop-blur-sm p-8`}
      >
        <div className="mb-8 text-center">
          <Link to="/" className="inline-flex items-center justify-center mb-6">
            <img
            src={theme === "dark" ? logo2Image : logoImage}
            alt="Bliic"
            style={{ width: "70px" }}
          />
          </Link>
          <h2
            className={`text-3xl font-bold mb-2 ${
              theme === "dark"
                ? "text-dark-text-primary"
                : "text-light-text-primary"
            } font-sans`}
          >
            Vérification
          </h2>
          <p
            className={`text-base ${
              theme === "dark"
                ? "text-dark-text-secondary"
                : "text-light-text-secondary"
            } font-sans`}
          >
            Entrez le code de vérification envoyé à votre adresse email.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="form-control">
            <label
              htmlFor="verificationCode"
              className={`mb-2 ${
                theme === "dark" ? "text-dark-text-secondary" : "text-light-text-secondary"
              } font-sans`}
            >
              Code de vérification
            </label>
            <div className="relative">
              <ShieldCheck
                className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                  theme === "dark" ? "text-dark-primary" : "text-light-primary"
                }`}
                size={20}
              />
              <input
                id="verificationCode"
                ref={inputRef}
                type="text"
                className={`w-full pl-10 pr-4 py-3 rounded-lg border ${
                  verificationCode && !/^\d{4,6}$/.test(verificationCode)
                    ? theme === "dark"
                      ? "border-dark-danger/50"
                      : "border-light-danger/50"
                    : theme === "dark"
                      ? "border-dark-text-secondary/50"
                      : "border-light-text-secondary/50"
                } ${
                  theme === "dark" ? "bg-dark-card text-dark-text-primary" : "bg-light-card text-light-text-primary"
                } focus:ring focus:ring-${
                  theme === "dark" ? "dark-secondary" : "light-secondary"
                }/20 placeholder-gray-500 font-sans`}
                placeholder="Entrez le code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
              />
            </div>
            {verificationCode && !/^\d{4,6}$/.test(verificationCode) && (
              <p
                className={`mt-2 text-sm ${
                  theme === "dark" ? "text-dark-danger" : "text-light-danger"
                } font-sans`}
              >
                Le code doit être un nombre à 4 ou 6 chiffres.
              </p>
            )}
          </div>

          <button
            type="submit"
            className={`w-full py-3 rounded-lg font-semibold ${
              theme === "dark"
                ? "bg-dark-primary hover:bg-dark-secondary"
                : "bg-light-primary hover:bg-light-secondary"
            } text-dark-text-primary ${
              loading ? "opacity-75 cursor-not-allowed" : ""
            } font-sans`}
            disabled={loading}
          >
            {loading ? (
              <>
                <span
                  className={`inline-block h-5 w-5 rounded-full border-2 ${
                    theme === "dark"
                      ? "border-dark-text-primary/20 border-t-dark-text-primary"
                      : "border-light-text-primary/20 border-t-light-text-primary"
                  } animate-spin mr-2`}
                />
                Vérification en cours...
              </>
            ) : (
              "Vérifier"
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p
            className={`text-sm ${
              theme === "dark"
                ? "text-dark-text-secondary"
                : "text-light-text-secondary"
            } mb-4 font-sans`}
          >
            Vous n’avez pas reçu le code ?
          </p>
          <button
            onClick={handleResendCode}
            className={`w-full py-3 rounded-lg font-semibold border ${
              theme === "dark"
                ? "border-dark-primary text-dark-primary hover:bg-dark-primary/10"
                : "border-light-primary text-light-primary hover:bg-light-primary/10"
            } ${
              resending ? "opacity-75 cursor-not-allowed" : ""
            } font-sans`}
            disabled={resending}
          >
            {resending ? (
              <>
                <RefreshCw
                  className={`inline-block animate-spin mr-2 ${
                    theme === "dark" ? "text-dark-primary" : "text-light-primary"
                  }`}
                  size={20}
                />
                Renvoi en cours...
              </>
            ) : (
              "Renvoyer le code"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Verify;