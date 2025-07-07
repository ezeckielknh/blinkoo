import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useToast } from '../contexts/ToastContext';
import { useTheme } from '../contexts/ThemeContext';
import { Eye, EyeOff } from 'lucide-react';
import axios from 'axios';
import { API } from '../utils/api';

const AdminChangePassword = () => {
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
      addToast('Lien de changement de mot de passe invalide pour l\'administrateur.', 'error');
      navigate('/admin-dashboard');
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
      errors.code = 'Code de changement requis';
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
      const response = await axios.post(API.PASSWORD.ADMIN_RESET, {
        email,
        code,
        password,
        password_confirmation: passwordConfirmation,
      });
      const data = response.data as { message?: string };
      addToast(data.message || 'Mot de passe modifié avec succès pour l\'administrateur !', 'success');
      setTimeout(() => {
        navigate('/admin-dashboard');
      }, 2000);
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        'Erreur lors de la modification du mot de passe de l\'administrateur.';
      addToast(message, 'error');
      setFormErrors({ password: message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      data-theme={theme}
    >
      <div
        className={`card w-full max-w-md animate-fadeIn ${
          theme === 'dark' ? 'bg-dark-card' : 'bg-light-card'
        }`}
      >
        <div className="mb-8 text-center">
          <Link to="/admin-dashboard" className="inline-flex items-center justify-center mb-6">
            <svg
              className={`w-8 h-8 ${
                theme === 'dark' ? 'text-dark-primary' : 'text-light-primary'
              }`}
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
            <h1
              className={`text-2xl font-bold ml-2 ${
                theme === 'dark'
                  ? 'text-dark-text-primary'
                  : 'text-light-text-primary'
              }`}
            >
              {API.APP_NAME}
            </h1>
          </Link>
          <h2
            className={`text-2xl font-bold ${
              theme === 'dark'
                ? 'text-dark-text-primary'
                : 'text-light-text-primary'
            }`}
          >
            Changer le mot de passe (Admin)
          </h2>
          <p
            className={`text-base mt-1 ${
              theme === 'dark'
                ? 'text-dark-text-secondary'
                : 'text-light-text-secondary'
            }`}
          >
            Définissez un nouveau mot de passe pour votre compte administrateur
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="form-control">
            <label htmlFor="password" className="form-label">
              Nouveau mot de passe
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                className={`form-input pr-10 ${
                  formErrors.password
                    ? theme === 'dark'
                      ? 'border-dark-tertiary'
                      : 'border-light-tertiary'
                    : ''
                }`}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
              <button
                type="button"
                className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${
                  theme === 'dark'
                    ? 'text-dark-text-secondary hover:text-dark-secondary'
                    : 'text-light-text-secondary hover:text-light-secondary'
                }`}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {formErrors.password && (
              <p
                className={`mt-1 text-sm ${
                  theme === 'dark'
                    ? 'text-dark-tertiary'
                    : 'text-light-tertiary'
                }`}
              >
                {formErrors.password}
              </p>
            )}
          </div>

          <div className="form-control">
            <label htmlFor="passwordConfirmation" className="form-label">
              Confirmer le mot de passe
            </label>
            <div className="relative">
              <input
                id="passwordConfirmation"
                type={showPasswordConfirmation ? 'text' : 'password'}
                className={`form-input pr-10 ${
                  formErrors.passwordConfirmation
                    ? theme === 'dark'
                      ? 'border-dark-tertiary'
                      : 'border-light-tertiary'
                    : ''
                }`}
                placeholder="••••••••"
                value={passwordConfirmation}
                onChange={(e) => setPasswordConfirmation(e.target.value)}
                disabled={loading}
              />
              <button
                type="button"
                className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${
                  theme === 'dark'
                    ? 'text-dark-text-secondary hover:text-dark-secondary'
                    : 'text-light-text-secondary hover:text-light-secondary'
                }`}
                onClick={() => setShowPasswordConfirmation(!showPasswordConfirmation)}
              >
                {showPasswordConfirmation ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {formErrors.passwordConfirmation && (
              <p
                className={`mt-1 text-sm ${
                  theme === 'dark'
                    ? 'text-dark-tertiary'
                    : 'text-light-tertiary'
                }`}
              >
                {formErrors.passwordConfirmation}
              </p>
            )}
          </div>

          <button
            type="submit"
            className={`btn btn-primary w-full mt-6 ${
              loading ? 'opacity-75 cursor-not-allowed' : ''
            }`}
            disabled={loading}
          >
            {loading ? (
              <>
                <span
                  className={`inline-block h-4 w-4 rounded-full border-2 ${
                    theme === 'dark'
                      ? 'border-dark-text-primary/20 border-t-dark-text-primary'
                      : 'border-light-text-primary/20 border-t-light-text-primary'
                  } animate-spin mr-2`}
                />
                Modification en cours...
              </>
            ) : (
              'Changer le mot de passe'
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-sm">
          <p
            className={`text-base ${
              theme === 'dark'
                ? 'text-dark-text-secondary'
                : 'text-light-text-secondary'
            }`}
          >
            Retour à{' '}
            <Link
              to="/admin-dashboard"
              className={`${
                theme === 'dark'
                  ? 'text-dark-primary hover:text-dark-secondary'
                  : 'text-light-primary hover:text-light-secondary'
              } hover:underline`}
            >
              le tableau de bord admin
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminChangePassword;