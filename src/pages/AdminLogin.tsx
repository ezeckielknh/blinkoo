import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import { useTheme } from "../contexts/ThemeContext";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import logoImage from "../assets/bliic.png";
import logo2Image from "../assets/Bliic 2.png";

const AdminLogin = () => {
  const navigate = useNavigate();
  const { login, loading } = useAuth();
  const { addToast } = useToast();
  const { theme } = useTheme();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState({
    email: "",
    password: "",
  });

  const validate = () => {
    const errors = { email: "", password: "" };
    let isValid = true;

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
    }

    setFormErrors(errors);
    return isValid;
  };

  interface FormErrors {
    email: string;
    password: string;
  }

  interface HandleSubmitEvent extends React.FormEvent<HTMLFormElement> {}

  const handleSubmit = async (e: HandleSubmitEvent): Promise<void> => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    try {
      await login(email, password);
      addToast("Connexion réussie !", "success");
      setTimeout(() => {
        navigate("/admin/dashboard");
      }, 100);
    } catch (error: unknown) {
      if (error instanceof Error) {
        addToast(error.message, "error");
      } else {
        addToast("Échec de la connexion. Veuillez réessayer.", "error");
      }
    }
  };

  return (
    <div
      className={`min-h-screen flex items-center justify-center p-4 ${
        theme === "dark" ? "bg-gray-900" : "bg-gray-100"
      }`}
    >
      <div
        className={`w-full max-w-[600px] rounded-lg shadow-lg ${
          theme === "dark" ? "bg-gray-800/90" : "bg-white/90"
        }`}
      >
        <div
          className="p-6 text-center"
          style={{
            background: "linear-gradient(90deg, #7c3aed, #eab308)",
            color: "#ffffff",
          }}
        >
          <Link to="/" className="inline-flex items-center justify-center mb-4">
            <img
              src={theme === "dark" ? logo2Image : logoImage}
              alt="Bliic"
              className="w-[70px]"
            />
          </Link>
          <h1 className="text-2xl font-bold">Connexion Administrateur</h1>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className={`block text-sm font-medium ${
                  theme === "dark" ? "text-gray-300" : "text-gray-600"
                } mb-2`}
              >
                Adresse e-mail
              </label>
              <div className="relative">
                <Mail
                  className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                    theme === "dark" ? "text-purple-400" : "text-purple-600"
                  }`}
                  size={20}
                />
                <input
                  id="email"
                  type="email"
                  className={`w-full pl-10 pr-4 py-3 rounded-md border ${
                    formErrors.email
                      ? "border-red-500"
                      : theme === "dark"
                      ? "border-gray-600"
                      : "border-gray-300"
                  } ${
                    theme === "dark"
                      ? "bg-gray-700 text-gray-100"
                      : "bg-white text-gray-900"
                  } focus:ring-2 focus:ring-purple-500/50`}
                  placeholder="vous@exemple.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              {formErrors.email && (
                <p className="mt-2 text-sm text-red-500">{formErrors.email}</p>
              )}
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label
                  htmlFor="password"
                  className={`text-sm font-medium ${
                    theme === "dark" ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  Mot de passe
                </label>
                <Link
                  to="/forgot-password"
                  className={`text-sm ${
                    theme === "dark" ? "text-purple-400" : "text-purple-600"
                  } hover:underline`}
                >
                  Mot de passe oublié ?
                </Link>
              </div>
              <div className="relative">
                <Lock
                  className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                    theme === "dark" ? "text-purple-400" : "text-purple-600"
                  }`}
                  size={20}
                />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  className={`w-full pl-10 pr-12 py-3 rounded-md border ${
                    formErrors.password
                      ? "border-red-500"
                      : theme === "dark"
                      ? "border-gray-600"
                      : "border-gray-300"
                  } ${
                    theme === "dark"
                      ? "bg-gray-700 text-gray-100"
                      : "bg-white text-gray-900"
                  } focus:ring-2 focus:ring-purple-500/50`}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${
                    theme === "dark" ? "text-purple-400" : "text-purple-600"
                  }`}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {formErrors.password && (
                <p className="mt-2 text-sm text-red-500">{formErrors.password}</p>
              )}
            </div>

            <button
              type="submit"
              className={`w-full py-3 rounded-md font-semibold text-white bg-purple-600 hover:bg-purple-700 ${
                loading ? "opacity-75 cursor-not-allowed" : ""
              }`}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="inline-block h-5 w-5 rounded-full border-2 border-white/20 border-t-white animate-spin mr-2" />
                  Connexion en cours...
                </>
              ) : (
                "Se connecter"
              )}
            </button>
          </form>
        </div>

        <div
          className={`p-4 text-center text-sm ${
            theme === "dark" ? "bg-gray-700 text-gray-300" : "bg-gray-50 text-gray-600"
          }`}
        >
          <p>
            Si vous avez des questions, contactez-nous à{" "}
            <a
              href="mailto:support@bliic.com"
              className={theme === "dark" ? "text-purple-400" : "text-purple-600"}
            >
              support@bliic.com
            </a>{" "}
            ou via WhatsApp au{" "}
            <a
              href="https://wa.me/+1234567890"
              className={theme === "dark" ? "text-purple-400" : "text-purple-600"}
            >
              +1 (234) 567-890
            </a>
            .
          </p>
          <p className="mt-2">
            © {new Date().getFullYear()} Bliic. Tous droits réservés.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;