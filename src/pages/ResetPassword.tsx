import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useToast } from '../contexts/ToastContext';
import { useTheme } from '../contexts/ThemeContext';
import { Eye, EyeOff, Lock, Loader2, Link as LucideLink, BarChart, Globe, Shield } from 'lucide-react';
import axios from 'axios';
import { API } from '../utils/api';
import logoImage from '../assets/bliccc.png';
import logo2Image from '../assets/Bliic 2.png';

const ResetPassword = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { theme } = useTheme();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);
  const [formErrors, setFormErrors] = useState<{
    email?: string;
    code?: string;
    password?: string;
    passwordConfirmation?: string;
  }>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const emailParam = searchParams.get('email');
    const codeParam = searchParams.get('code');
    if (emailParam && codeParam) {
      setEmail(decodeURIComponent(emailParam));
      setCode(decodeURIComponent(codeParam));
    } else {
      addToast('Lien de réinitialisation invalide.', 'error');
      navigate('/forgot-password');
    }
  }, [searchParams, addToast, navigate]);

  const validate = () => {
    const errors: {
      email?: string;
      code?: string;
      password?: string;
      passwordConfirmation?: string;
    } = {};
    let isValid = true;

    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'E-mail invalide';
      isValid = false;
    }
    if (!code) {
      errors.code = 'Code de réinitialisation requis';
      isValid = false;
    }
    if (!password) {
      errors.password = 'Le mot de passe est requis';
      isValid = false;
    } else if (password.length < 8) {
      errors.password = 'Le mot de passe doit contenir au moins 8 caractères';
      isValid = false;
    }
    if (password !== passwordConfirmation) {
      errors.passwordConfirmation = 'Les mots de passe ne correspondent pas';
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

    setLoading(true);
    try {
      const response = await axios.post(API.PASSWORD.RESET_WITH_CODE, {
        email,
        code,
        password,
        password_confirmation: passwordConfirmation,
      });
      const data = response.data as { message?: string };
      addToast(data.message || 'Mot de passe réinitialisé avec succès !', 'success');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        'Erreur lors de la réinitialisation du mot de passe.';
      addToast(message, 'error');
      setFormErrors({ password: message });
    } finally {
      setLoading(false);
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
          willChange: 'transform, opacity',
        }}
      />
    );
  });

  return (
    <div
      className={`min-h-screen flex items-center justify-center p-4 font-sans relative overflow-hidden ${
        theme === 'dark' ? 'bg-dark-background' : 'bg-light-background'
      } bg-gradient-to-br ${
        theme === 'dark'
          ? 'from-dark-background to-dark-primary via-dark-secondary'
          : 'from-light-background to-light-primary via-light-secondary'
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
          theme === 'dark' ? 'bg-dark-card/90' : 'bg-light-card/90'
        } backdrop-blur-sm p-8 text-center space-y-6`}
      >
        <Link to="/" className="inline-flex items-center justify-center mb-6">
          <img
            src={theme === 'dark' ? logo2Image : logoImage}
            alt="Bliic"
            style={{ width: '70px' }}
          />
        </Link>
        <h2
          className={`text-3xl font-bold ${
            theme === 'dark' ? 'text-dark-text-primary' : 'text-light-text-primary'
          } font-sans`}
        >
          Réinitialiser le mot de passe
        </h2>
        <p
          className={`text-base ${
            theme === 'dark' ? 'text-dark-text-secondary' : 'text-light-text-secondary'
          } font-sans`}
        >
          Entrez votre nouveau mot de passe
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <label
              htmlFor="password"
              className={`block text-base ${
                theme === 'dark' ? 'text-dark-text-secondary' : 'text-light-text-secondary'
              } mb-2 font-sans text-left`}
            >
              Nouveau mot de passe
            </label>
            <Lock
              className={`absolute left-3 top-[60%] transform -translate-y-1/2 ${
                theme === 'dark' ? 'text-dark-primary' : 'text-light-primary'
              }`}
              size={20}
            />
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              className={`w-full pl-10 pr-10 py-3 rounded-lg border font-sans ${
                theme === 'dark'
                  ? `bg-dark-card text-dark-text-primary placeholder-dark-text-secondary border-dark-text-secondary/50 ${
                      formErrors.password ? 'border-dark-tertiary' : ''
                    }`
                  : `bg-light-card text-light-text-primary placeholder-light-text-secondary border-light-text-secondary/50 ${
                      formErrors.password ? 'border-light-tertiary' : ''
                    }`
              } focus:ring focus:ring-${
                theme === 'dark' ? 'dark-secondary' : 'light-secondary'
              }/20`}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
            <button
              type="button"
              className={`absolute right-3 top-[60%] transform -translate-y-1/2 ${
                theme === 'dark'
                  ? 'text-dark-text-secondary hover:text-dark-secondary'
                  : 'text-light-text-secondary hover:text-light-secondary'
              }`}
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
            {formErrors.password && (
              <p
                className={`mt-1 text-sm text-left ${
                  theme === 'dark' ? 'text-dark-tertiary' : 'text-light-tertiary'
                } font-sans`}
              >
                {formErrors.password}
              </p>
            )}
          </div>

          <div className="relative">
            <label
              htmlFor="passwordConfirmation"
              className={`block text-base ${
                theme === 'dark' ? 'text-dark-text-secondary' : 'text-light-text-secondary'
              } mb-2 font-sans text-left`}
            >
              Confirmer le mot de passe
            </label>
            <Lock
              className={`absolute left-3 top-[60%] transform -translate-y-1/2 ${
                theme === 'dark' ? 'text-dark-primary' : 'text-light-primary'
              }`}
              size={20}
            />
            <input
              id="passwordConfirmation"
              type={showPasswordConfirmation ? 'text' : 'password'}
              className={`w-full pl-10 pr-10 py-3 rounded-lg border font-sans ${
                theme === 'dark'
                  ? `bg-dark-card text-dark-text-primary placeholder-dark-text-secondary border-dark-text-secondary/50 ${
                      formErrors.passwordConfirmation ? 'border-dark-tertiary' : ''
                    }`
                  : `bg-light-card text-light-text-primary placeholder-light-text-secondary border-light-text-secondary/50 ${
                      formErrors.passwordConfirmation ? 'border-light-tertiary' : ''
                    }`
              } focus:ring focus:ring-${
                theme === 'dark' ? 'dark-secondary' : 'light-secondary'
              }/20`}
              placeholder="••••••••"
              value={passwordConfirmation}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
              disabled={loading}
            />
            <button
              type="button"
              className={`absolute right-3 top-[60%] transform -translate-y-1/2 ${
                theme === 'dark'
                  ? 'text-dark-text-secondary hover:text-dark-secondary'
                  : 'text-light-text-secondary hover:text-light-secondary'
              }`}
              onClick={() => setShowPasswordConfirmation(!showPasswordConfirmation)}
            >
              {showPasswordConfirmation ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
            {formErrors.passwordConfirmation && (
              <p
                className={`mt-1 text-sm text-left ${
                  theme === 'dark' ? 'text-dark-tertiary' : 'text-light-tertiary'
                } font-sans`}
              >
                {formErrors.passwordConfirmation}
              </p>
            )}
          </div>

          <button
            type="submit"
            className={`w-full py-3 rounded-lg font-semibold flex items-center justify-center ${
              theme === 'dark'
                ? 'bg-dark-primary hover:bg-dark-secondary'
                : 'bg-light-primary hover:bg-light-secondary'
            } text-dark-text-primary text-base font-sans ${
              loading ? 'opacity-75 cursor-not-allowed' : ''
            }`}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2
                  size={16}
                  className={`animate-spin mr-2 text-dark-text-primary`}
                />
                Réinitialisation en cours...
              </>
            ) : (
              'Réinitialiser le mot de passe'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p
            className={`text-base ${
              theme === 'dark' ? 'text-dark-text-secondary' : 'text-light-text-secondary'
            } font-sans`}
          >
            Retour à{' '}
            <Link
              to="/login"
              className={`${
                theme === 'dark'
                  ? 'text-dark-secondary hover:text-dark-primary'
                  : 'text-light-secondary hover:text-light-primary'
              } underline font-sans`}
            >
              la connexion
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;