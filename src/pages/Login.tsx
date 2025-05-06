import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import { Eye, EyeOff } from "lucide-react";
import { GoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { API } from "../utils/api";

const Login = () => {
  const navigate = useNavigate();
  const { login, setUser, loading } = useAuth();
  const { addToast } = useToast();

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
      navigate("/dashboard");
    } catch (error) {
      if (error instanceof Error) {
        addToast(error.message, "error");
      } else {
        addToast("Failed to login. Please try again.", "error");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="card w-full max-w-md animate-fadeIn">
        <div className="mb-8 text-center">
          <Link to="/" className="inline-flex items-center justify-center mb-6">
            <svg
              className="w-8 h-8 text-primary"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M13 5L21 12L13 19"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M21 12H3"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <h1 className="text-2xl font-bold ml-2 text-textLight">Blinkoo</h1>
          </Link>
          <h2 className="text-2xl font-bold">Bienvenue</h2>
          <p className="text-gray-400 mt-1">
            Connectez-vous pour acc der vos URL raccourcies et vos
            analytics
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="form-control">
            <label htmlFor="email" className="form-label">
              Adresse e-mail
            </label>
            <input
              id="email"
              type="email"
              className={`form-input ${
                formErrors.email ? "border-danger" : ""
              }`}
              placeholder="vous@exemple.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {formErrors.email && (
              <p className="mt-1 text-sm text-danger">{formErrors.email}</p>
            )}
          </div>

          <div className="form-control">
            <div className="flex justify-between items-center mb-1">
              <label htmlFor="password" className="form-label">
                Mot de passe
              </label>
              {/* <Link to="#" className="text-xs text-primary hover:underline">
                Mot de passe oubli ?
              </Link> */}
            </div>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                className={`form-input pr-10 ${
                  formErrors.password ? "border-danger" : ""
                }`}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {formErrors.password && (
              <p className="mt-1 text-sm text-danger">{formErrors.password}</p>
            )}
          </div>

          <button
            type="submit"
            className={`btn btn-primary w-full mt-6 ${
              loading ? "opacity-75 cursor-not-allowed" : ""
            }`}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="inline-block h-4 w-4 rounded-full border-2 border-white/20 border-t-white animate-spin mr-2" />
                Connexion en cours...
              </>
            ) : (
              "Se connecter"
            )}
          </button>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-400 mb-2">Ou connectez-vous avec</p>
            <GoogleLogin
              onSuccess={async (credentialResponse) => {
                setGoogleLoading(true);
                interface GoogleLoginResponse {
                  access_token: string;
                  user: any; // or specify the type of user if you know it
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
                    "blinkoo_user",
                    JSON.stringify(userData)
                  );
                  axios.defaults.headers.common[
                    "Authorization"
                  ] = `Bearer ${access_token}`;
                  setUser(userData); // <-- Important !
                  addToast("Connexion réussie avec Google !", "success");
                  navigate("/dashboard"); // <-- Maintenant ce sera exécuté après avoir mis à jour le contexte
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
            {googleLoading && (
              <div className="text-sm text-gray-400 mt-2">
                Connexion en cours avec Google...
              </div>
            )}
          </div>
        </form>

        {/* <div className="mt-6 text-center text-sm">
          <p className="text-gray-400">
            Don't have an account?{" "}
            <Link to="/register" className="text-primary hover:underline">
              Sign up for free
            </Link>
          </p>
        </div> */}
      </div>
    </div>
  );
};

export default Login;
