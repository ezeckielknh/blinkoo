import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '../contexts/ToastContext';
import { useTheme } from '../contexts/ThemeContext';
import axios from 'axios';
import { API } from '../utils/api';
import { Mail, Loader2, Link as LucideLink, BarChart, Globe, Shield } from 'lucide-react';
import logoImage from '../assets/bliccc.png';
import logo2Image from '../assets/Bliic 2.png';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { theme } = useTheme();
  const [email, setEmail] = useState('');
  const [formErrors, setFormErrors] = useState<{ email?: string }>({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const errors: { email?: string } = {};
    let isValid = true;

    if (!email) {
      errors.email = 'L’e-mail est requis';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'L’e-mail est invalide';
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
      const response = await axios.post(API.PASSWORD.SEND_RESET_EMAIL, { email });
      const data = response.data as { message: string };
      addToast(data.message, 'success');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        'Erreur lors de l’envoi de l’e-mail de réinitialisation.';
      addToast(message, 'error');
      setFormErrors({ email: message });
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
          Mot de passe oublié
        </h2>
        <p
          className={`text-base ${
            theme === 'dark' ? 'text-dark-text-secondary' : 'text-light-text-secondary'
          } font-sans`}
        >
          Entrez votre e-mail pour réinitialiser votre mot de passe
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <label
              htmlFor="email"
              className={`block text-base ${
                theme === 'dark' ? 'text-dark-text-secondary' : 'text-light-text-secondary'
              } mb-2 font-sans text-left`}
            >
              Adresse e-mail
            </label>
            <Mail
              className={`absolute left-3 top-[60%] transform -translate-y-1/2 ${
                theme === 'dark' ? 'text-dark-primary' : 'text-light-primary'
              }`}
              size={20}
            />
            <input
              id="email"
              type="email"
              className={`w-full pl-10 pr-4 py-3 rounded-lg border font-sans ${
                theme === 'dark'
                  ? `bg-dark-card text-dark-text-primary placeholder-dark-text-secondary border-dark-text-secondary/50 ${
                      formErrors.email ? 'border-dark-tertiary' : ''
                    }`
                  : `bg-light-card text-light-text-primary placeholder-light-text-secondary border-light-text-secondary/50 ${
                      formErrors.email ? 'border-light-tertiary' : ''
                    }`
              } focus:ring focus:ring-${
                theme === 'dark' ? 'dark-secondary' : 'light-secondary'
              }/20`}
              placeholder="vous@exemple.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
            {formErrors.email && (
              <p
                className={`mt-1 text-sm text-left ${
                  theme === 'dark' ? 'text-dark-tertiary' : 'text-light-tertiary'
                } font-sans`}
              >
                {formErrors.email}
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
                Envoi en cours...
              </>
            ) : (
              'Envoyer le lien de réinitialisation'
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

export default ForgotPassword;