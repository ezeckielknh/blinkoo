import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import { useTheme } from "../contexts/ThemeContext";
import { Eye, EyeOff, Mail, Lock, User, Link as LucideLink, BarChart, Globe, Shield } from "lucide-react";
import { API } from "../utils/api";
import logoImage from "../assets/bliic.png";
import logo2Image from "../assets/Bliic 2.png";


const Register = () => {
  const navigate = useNavigate();
  const { register, loading } = useAuth();
  const { addToast } = useToast();
  const { theme } = useTheme();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formErrors, setFormErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});
  const [passwordStrength, setPasswordStrength] = useState(0);

  useEffect(() => {
    calculatePasswordStrength(password);
  }, [password]);

  const calculatePasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    setPasswordStrength(strength);
  };

  const validate = () => {
    const errors: { name?: string; email?: string; password?: string; confirmPassword?: string } = {};
    let isValid = true;

    if (!name.trim()) {
      errors.name = "Le nom est requis";
      isValid = false;
    }

    if (!email) {
      errors.email = "L'email est requis";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = "L'email est invalide";
      isValid = false;
    }

    if (!password) {
      errors.password = "Le mot de passe est requis";
      isValid = false;
    } else if (password.length < 8) {
      errors.password = "Le mot de passe doit contenir au moins 8 caractères";
      isValid = false;
    }

    if (password !== confirmPassword) {
      errors.confirmPassword = "Les mots de passe ne correspondent pas";
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await register(name, email, password, confirmPassword);
      addToast("Compte créé avec succès !", "success");
      navigate("/Verify");
    } catch (error) {
      addToast(
        error instanceof Error ? error.message : "Échec de la création du compte.",
        "error"
      );
    }
  };

  const getStrengthLabel = () => {
    if (passwordStrength === 0) return "";
    if (passwordStrength <= 2) return "Faible";
    if (passwordStrength <= 4) return "Moyen";
    return "Fort";
  };

  const getStrengthColor = () => {
    if (passwordStrength === 0) return theme === 'dark' ? 'bg-dark-card' : 'bg-light-card';
    if (passwordStrength <= 2) return theme === 'dark' ? 'bg-dark-danger' : 'bg-light-danger';
    if (passwordStrength <= 4) return theme === 'dark' ? 'bg-dark-secondary' : 'bg-light-secondary';
    return theme === 'dark' ? 'bg-dark-primary' : 'bg-light-primary';
  };

  // Generate background icons
    const iconTypes = [LucideLink, BarChart, Globe, Shield];
  const iconCount = 32; // Mets ici le nombre d’icônes que tu veux
  
   
  
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
  
  // ...existing code...

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
              }`}
          >
            Créez votre compte
          </h2>
          <p
            className={`text-base ${
              theme === "dark"
                ? "text-dark-text-secondary"
                : "text-light-text-secondary"
              }`}
          >
            Rejoignez des milliers d'utilisateurs qui raccourcissent leurs URL avec {API.APP_NAME}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name Field */}
          <div className="form-control">
            <label
              htmlFor="name"
              className={`mb-2 ${
                theme === "dark" ? "text-dark-text-secondary" : "text-light-text-secondary"
              }`}
            >
              Nom complet
            </label>
            <div className="relative">
              <User
                className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                  theme === "dark" ? "text-dark-primary" : "text-light-primary"
                }`}
                size={20}
              />
              <input
                id="name"
                type="text"
                className={`w-full pl-10 pr-4 py-3 rounded-lg border ${
                  formErrors.name
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
                }/20`}
                placeholder="Votre nom"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            {formErrors.name && (
              <p
                className={`mt-2 text-sm ${
                  theme === "dark" ? "text-dark-danger" : "text-light-danger"
                }`}
              >
                {formErrors.name}
              </p>
            )}
          </div>

          {/* Email Field */}
          <div className="form-control">
            <label
              htmlFor="email"
              className={`mb-2 ${
                theme === "dark" ? "text-dark-text-secondary" : "text-light-text-secondary"
              }`}
            >
              Adresse e-mail
            </label>
            <div className="relative">
              <Mail
                className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                  theme === "dark" ? "text-dark-primary" : "text-light-primary"
                }`}
                size={20}
              />
              <input
                id="email"
                type="email"
                className={`w-full pl-10 pr-4 py-3 rounded-lg border ${
                  formErrors.email
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
                }/20`}
                placeholder="vous@exemple.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            {formErrors.email && (
              <p
                className={`mt-2 text-sm ${
                  theme === "dark" ? "text-dark-danger" : "text-light-danger"
                }`}
              >
                {formErrors.email}
              </p>
            )}
          </div>

          {/* Password Field */}
          <div className="form-control">
            <label
              htmlFor="password"
              className={`mb-2 ${
                theme === "dark" ? "text-dark-text-secondary" : "text-light-text-secondary"
              }`}
            >
              Mot de passe
            </label>
            <div className="relative">
              <Lock
                className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                  theme === "dark" ? "text-dark-primary" : "text-light-primary"
                }`}
                size={20}
              />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                className={`w-full pl-10 pr-12 py-3 rounded-lg border ${
                  formErrors.password
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
                }/20`}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${
                  theme === "dark" ? "text-dark-primary" : "text-light-primary"
                }`}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {formErrors.password && (
              <p
                className={`mt-2 text-sm ${
                  theme === "dark" ? "text-dark-danger" : "text-light-danger"
                }`}
              >
                {formErrors.password}
              </p>
            )}

            {/* Password Strength */}
            {password && (
              <div className="mt-2">
                <div className="flex justify-between items-center mb-1">
                  <span
                    className={`text-xs ${
                      theme === "dark" ? "text-dark-text-secondary" : "text-light-text-secondary"
                    }`}
                  >
                    Force du mot de passe : {getStrengthLabel()}
                  </span>
                  <span
                    className={`text-xs ${
                      theme === "dark" ? "text-dark-text-secondary" : "text-light-text-secondary"
                    }`}
                  >
                    {passwordStrength}/5
                  </span>
                </div>
                <div
                  className={`w-full h-1 ${
                    theme === "dark" ? "bg-dark-card" : "bg-light-card"
                  } rounded-full overflow-hidden`}
                >
                  <div
                    className={`h-full ${getStrengthColor()}`}
                    style={{ width: `${(passwordStrength / 5) * 100}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Confirm Password Field */}
          <div className="form-control">
            <label
              htmlFor="confirmPassword"
              className={`mb-2 ${
                theme === "dark" ? "text-dark-text-secondary" : "text-light-text-secondary"
              }`}
            >
              Confirmer le mot de passe
            </label>
            <div className="relative">
              <Lock
                className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                  theme === "dark" ? "text-dark-primary" : "text-light-primary"
                }`}
                size={20}
              />
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                className={`w-full pl-10 pr-12 py-3 rounded-lg border ${
                  formErrors.confirmPassword
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
                }/20`}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <button
                type="button"
                className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${
                  theme === "dark" ? "text-dark-primary" : "text-light-primary"
                }`}
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {formErrors.confirmPassword && (
              <p
                className={`mt-2 text-sm ${
                  theme === "dark" ? "text-dark-danger" : "text-light-danger"
                }`}
              >
                {formErrors.confirmPassword}
              </p>
            )}
          </div>

          {/* Terms and Conditions */}
          <div className="mt-2">
            <p
              className={`text-xs ${
                theme === "dark" ? "text-dark-text-secondary" : "text-light-text-secondary"
              }`}
            >
              En créant un compte, vous acceptez nos{" "}
              <Link
                to="#"
                className={`${
                  theme === "dark" ? "text-dark-primary" : "text-light-primary"
                } hover:underline`}
              >
                Conditions d'utilisation
              </Link>{" "}
              et notre{" "}
              <Link
                to="#"
                className={`${
                  theme === "dark" ? "text-dark-primary" : "text-light-primary"
                } hover:underline`}
              >
                Politique de confidentialité
              </Link>.
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className={`w-full mt-6 py-3 rounded-lg font-semibold ${
              theme === "dark"
                ? "bg-dark-primary hover:bg-dark-secondary"
                : "bg-light-primary hover:bg-light-secondary"
            } text-dark-text-primary ${
              loading ? "opacity-75 cursor-not-allowed" : ""
            }`}
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
                Création du compte...
              </>
            ) : (
              "Créer un compte"
            )}
          </button>
        </form>

        {/* Redirect to Login */}
        <div className="mt-6 text-center text-sm">
          <p
            className={`text-base ${
              theme === "dark" ? "text-dark-text-secondary" : "text-light-text-secondary"
            }`}
          >
            Vous avez déjà un compte ?{" "}
            <Link
              to="/login"
              className={`${
                theme === "dark" ? "text-dark-primary" : "text-light-primary"
              } hover:underline`}
            >
              Connectez-vous
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;