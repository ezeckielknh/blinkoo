import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import { useTheme } from "../contexts/ThemeContext";
import { Eye, EyeOff, Mail, Lock, LucideLink, BarChart, Globe, Shield } from "lucide-react";
import { GoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { API } from "../utils/api";
import logoImage from "../assets/bliic.png";
import logo2Image from "../assets/Bliic 2.png";


const Login = () => {
  const navigate = useNavigate();
  const { login, setUser, loading } = useAuth();
  const { addToast } = useToast();
  const { theme } = useTheme();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState<{
    email?: string;
    password?: string;
  }>({});
  const [googleLoading, setGoogleLoading] = useState(false);

  const validate = () => {
    const errors: { email?: string; password?: string } = {};
    let isValid = true;

    if (!email) {
      errors.email = "Email is required";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = "Email is invalid";
      isValid = false;
    }

    if (!password) {
      errors.password = "Password is required";
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    try {
      await login(email, password);
      addToast("Successfully logged in!", "success");
      setTimeout(() => {
        navigate("/dashboard");
      }, 100);
    } catch (error) {
      if (error instanceof Error) {
        addToast(error.message, "error");
      } else {
        addToast("Failed to login. Please try again.", "error");
      }
    }
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
        className={`w-full max-w-md rounded-2xl shadow-xl animated-slide-up ${
          theme === "dark" ? "bg-dark-card/90" : "bg-light-card/90"
        } backdrop-blur-sm p-8 `}
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
            Bienvenue
          </h2>
          <p
            className={`text-base ${
              theme === "dark"
                ? "text-dark-text-secondary"
                : "text-light-text-secondary"
              }`}
          >
            Connectez-vous pour accéder à vos URL raccourcies et vos analytics
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
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

          <div className="form-control">
            <div className="flex justify-between items-center mb-2">
              <label
                htmlFor="password"
                className={`${
                  theme === "dark" ? "text-dark-text-secondary" : "text-light-text-secondary"
                }`}
              >
                Mot de passe
              </label>
              <Link
                to="/forgot-password"
                className={`text-sm ${
                  theme === "dark"
                    ? "text-dark-primary"
                    : "text-light-primary"
                } hover:underline`}
              >
                Mot de passe oublié ?
              </Link>
            </div>
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
          </div>

          <button
            type="submit"
            className={`w-full mt-8 py-3 rounded-lg font-semibold ${
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
                  className={`inline-block h-5 w-5 rounded-full border-2 border-dark-text-primary/20 border-t-dark-text-primary animate-spin mr-2`}
                />
                Connexion en cours...
              </>
            ) : (
              "Se connecter"
            )}
          </button>

          <div className="mt-6 text-center">
            <p
              className={`text-sm ${
                theme === "dark"
                  ? "text-dark-text-secondary"
                  : "text-light-text-secondary"
              } mb-4`}
            >
              Ou connectez-vous avec
            </p>
            <div className="flex justify-center">
              <GoogleLogin
                onSuccess={async (credentialResponse) => {
                  setGoogleLoading(true);
                  interface GoogleLoginResponse {
                    access_token: string;
                    user: any;
                  }
                  try {
                    const { credential } = credentialResponse;
                    const response = await axios.post<GoogleLoginResponse>(
                      API.USERS.GOOGLE_LOGIN,
                      { token: credential }
                    );

                    const { access_token, user } = response.data;
                    const userData = { ...user, token: access_token };

                    localStorage.setItem(
                      "bliic_user",
                      JSON.stringify(userData)
                    );
                    axios.defaults.headers.common[
                      "Authorization"
                    ] = `Bearer ${access_token}`;
                    setUser(userData);
                    addToast("Connexion réussie avec Google !", "success");
                    navigate("/dashboard");
                  } catch (err) {
                    console.log(err);
                    addToast("Erreur de connexion avec Google.", "error");
                  } finally {
                    setGoogleLoading(false);
                  }
                }}
                onError={() => {
                  addToast("La connexion Google a échoué.", "error");
                }}
              />
            </div>
            {googleLoading && (
              <div
                className={`text-sm ${
                  theme === "dark"
                    ? "text-dark-text-secondary"
                    : "text-light-text-secondary"
                } mt-3`}
              >
                Connexion en cours avec Google...
              </div>
            )}
          </div>
        </form>

        <div className="mt-6 text-center text-sm">
          <p
            className={`text-base ${
              theme === "dark"
                ? "text-dark-text-secondary"
                : "text-light-text-secondary"
              }`}
          >
            Vous n'avez pas de compte ?{" "}
            <Link
              to="/register"
              className={`${
                theme === "dark"
                  ? "text-dark-primary"
                  : "text-light-primary"
              } hover:underline`}
            >
              Inscrivez-vous gratuitement
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;