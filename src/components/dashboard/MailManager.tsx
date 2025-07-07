import React, { useState, useEffect } from 'react';
import { Mail, History, AlertCircle, Image as ImageIcon } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { API } from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

interface User {
  id: number;
  name: string;
  email: string;
}

interface Notification {
  id: number;
  subject: string;
  message: string;
  type: string;
  target: 'all' | 'user' | 'plan';
  plan: string | null;
  user_id: number | null;
  sent_by: number;
  button_url: string | null;
  button_label: string | null;
  image_paths: string[] | null; // Nouvelle propriété pour les chemins des images
  created_at: string;
}

const MailManager: React.FC = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [formData, setFormData] = useState({
    subject: '',
    message: '',
    target: 'all',
    user_id: '',
    plan: '',
    type: 'info',
    buttonUrl: '',
    buttonLabel: '',
  });
  const [images, setImages] = useState<File[]>([]); // État pour stocker les fichiers image
  const [users, setUsers] = useState<User[]>([]);
  const [history, setHistory] = useState<Notification[]>([]);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showTooltip, setShowTooltip] = useState<{ [key: string]: boolean }>({});
  const [showForm, setShowForm] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [showModal, setShowModal] = useState(false);

  // Restrict to super admin
  if (user?.role !== 'super_admin') {
    return (
      <div
        className={`flex justify-center items-center h-screen font-sans ${
          theme === 'dark' ? 'text-dark-text-primary' : 'text-light-text-primary'
        }`}
      >
        Accès réservé aux super-admins.
      </div>
    );
  }

  // Fetch users for dropdown
  useEffect(() => {
    setLoading(true);
    API.SUPER_ADMIN.GET_ALL_USERS({})
      .then((response) => {
        const data = response.data as { data?: User[] } | User[];
        setUsers(Array.isArray(data) ? data : data.data || []);
      })
      .catch((error) => {
        console.error('Error fetching users:', error);
        toast.error('Erreur lors du chargement des utilisateurs.', {
          position: 'top-right',
          autoClose: 3000,
          theme,
        });
      })
      .then(() => {
        setLoading(false);
      });
  }, [theme]);

  // Fetch notification history
  useEffect(() => {
    setLoading(true);
    API.SUPER_ADMIN.GET_NOTIFICATION_HISTORY({ page })
      .then((response) => {
        const data = response.data as { data?: Notification[]; last_page?: number } | Notification[];
        setHistory(Array.isArray(data) ? data : data.data || []);
        setTotalPages((data as any).last_page || 1);
      })
      .catch((error) => {
        console.error('Error fetching history:', error);
        toast.error("Erreur lors du chargement de l'historique.", {
          position: 'top-right',
          autoClose: 3000,
          theme,
        });
      })
      .then(() => setLoading(false));
  }, [page, theme]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: '' });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setImages(selectedFiles);
      setErrors({ ...errors, images: '' });
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.subject) newErrors.subject = 'Le sujet est requis';
    if (!formData.message) newErrors.message = 'Le message est requis';
    if (formData.target === 'user' && !formData.user_id) {
      newErrors.user_id = 'Veuillez sélectionner un utilisateur';
    }
    if (formData.target === 'plan' && !formData.plan) {
      newErrors.plan = 'Veuillez sélectionner un plan';
    }
    if (formData.buttonUrl && !/^(https?:\/\/)/.test(formData.buttonUrl)) {
      newErrors.buttonUrl = 'URL invalide';
    }
    return newErrors;
  };

  const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  const formErrors = validateForm();
  if (Object.keys(formErrors).length > 0) {
    setErrors(formErrors);
    Object.values(formErrors).forEach((error) =>
      toast.error(error, {
        position: 'top-right',
        autoClose: 3000,
        theme,
      }),
    );
    return;
  }

  setLoading(true);

  // Préparer les données pour l'API
  const dataToSend = {
    ...formData,
    target: formData.target as 'all' | 'user' | 'plan',
    user_id: formData.user_id ? Number(formData.user_id) : undefined,
    images, // Ajouter les images
  };

  API.SUPER_ADMIN.SEND_NOTIFICATION(dataToSend)
    .then((response) => {
      toast.success((response.data as { message: string }).message, {
        position: 'top-right',
        autoClose: 3000,
        theme,
      });
      setFormData({
        subject: '',
        message: '',
        target: 'all',
        user_id: '',
        plan: '',
        type: 'info',
        buttonUrl: '',
        buttonLabel: '',
      });
      setImages([]); // Réinitialiser les images
      setErrors({});
      setShowForm(false);
      API.SUPER_ADMIN.GET_NOTIFICATION_HISTORY({ page })
        .then((response) => {
          const data = response.data as { data?: Notification[]; last_page?: number } | Notification[];
          setHistory(Array.isArray(data) ? data : data.data || []);
          setTotalPages((data as any).last_page || 1);
        });
    })
    .catch((error) => {
      console.error('Error sending notification:', error);
      const errorData = error.response?.data?.errors || {
        general: "Erreur lors de l'envoi.",
      };
      setErrors(errorData);
      Object.values(errorData).forEach((err: any) =>
        toast.error(err, {
          position: 'top-right',
          autoClose: 3000,
          theme,
        }),
      );
    })
    .then(() => setLoading(false));
};

  const handleMessageClick = (notification: Notification) => {
    setSelectedNotification(notification);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedNotification(null);
  };

  return (
    <div className="space-y-8 animate-slide-up">
      <ToastContainer />
      {/* Header */}
      <h1
        className={`text-3xl font-bold tracking-tight font-sans ${
          theme === 'dark' ? 'text-dark-primary' : 'text-light-primary'
        }`}
      >
        Gestion des Notifications - Super Admin
      </h1>

      {/* Toggle Button */}
      <div className="flex justify-start">
        <button
          onClick={() => setShowForm((prev) => !prev)}
          className={`flex items-center px-4 py-2 rounded-lg font-sans text-white ${
            theme === 'dark'
              ? 'bg-dark-primary hover:bg-dark-tertiary'
              : 'bg-light-primary hover:bg-light-tertiary'
          } w-full sm:w-auto hover:animate-pulse focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-dark-primary`}
        >
          <Mail className="mr-2" size={20} />
          {showForm ? 'Masquer le Formulaire' : 'Créer une Notification'}
        </button>
      </div>

      {/* Send Notification Form */}
      {showForm && (
        <div
          className={`p-6 rounded-xl border border-dark-primary/30 ${
            theme === 'dark' ? 'bg-dark-card' : 'bg-light-card'
          } shadow-lg animate-slide-up`}
        >
          <div className="flex items-center justify-between">
            <h2
              className={`text-lg font-semibold font-sans flex items-center ${
                theme === 'dark' ? 'text-dark-text-primary' : 'text-light-text-primary'
              }`}
            >
              <Mail className="mr-3" size={20} />
              Envoyer une Notification
            </h2>
            <div className="relative">
              <AlertCircle
                size={16}
                className="cursor-pointer"
                onMouseEnter={() => setShowTooltip({ send: true })}
                onMouseLeave={() => setShowTooltip({ send: false })}
              />
              {showTooltip.send && (
                <div
                  className={`absolute right-0 top-6 z-10 p-2 rounded-lg text-sm font-sans ${
                    theme === 'dark'
                      ? 'bg-dark-background text-dark-text-primary'
                      : 'bg-light-background text-light-text-primary'
                  } shadow-md w-48`}
                >
                  Envoyer une notification à tous les utilisateurs, un utilisateur spécifique ou un plan.
                </div>
              )}
            </div>
          </div>
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div>
              <label
                className={`block text-sm font-medium font-sans ${
                  theme === 'dark' ? 'text-dark-text-secondary' : 'text-light-text-secondary'
                }`}
              >
                Sujet
              </label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleInputChange}
                className={`mt-1 w-full p-2 border rounded-lg font-sans ${
                  theme === 'dark'
                    ? 'bg-dark-card border-dark-secondary text-dark-text-primary focus:ring-dark-primary'
                    : 'bg-light-card border-light-secondary text-light-text-primary focus:ring-light-primary'
                } focus:outline-none focus:ring-2 disabled:bg-gray-200 disabled:cursor-not-allowed`}
                disabled={loading}
              />
              {errors.subject && (
                <p className="text-dark-danger dark:text-dark-danger text-sm mt-1 font-sans">
                  {errors.subject}
                </p>
              )}
            </div>
            <div>
              <label
                className={`block text-sm font-medium font-sans ${
                  theme === 'dark' ? 'text-dark-text-secondary' : 'text-light-text-secondary'
                }`}
              >
                Message
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                className={`mt-1 w-full p-2 border rounded-lg font-sans ${
                  theme === 'dark'
                    ? 'bg-dark-card border-dark-secondary text-dark-text-primary focus:ring-dark-primary'
                    : 'bg-light-card border-light-secondary text-light-text-primary focus:ring-light-primary'
                } focus:outline-none focus:ring-2 disabled:bg-gray-200 disabled:cursor-not-allowed`}
                rows={5}
                disabled={loading}
              />
              {errors.message && (
                <p className="text-dark-danger dark:text-dark-danger text-sm mt-1 font-sans">
                  {errors.message}
                </p>
              )}
            </div>
            <div>
              <label
                className={`block text-sm font-medium font-sans ${
                  theme === 'dark' ? 'text-dark-text-secondary' : 'text-light-text-secondary'
                }`}
              >
                Cible
              </label>
              <select
                name="target"
                value={formData.target}
                onChange={handleInputChange}
                className={`mt-1 w-full p-2 border rounded-lg font-sans ${
                  theme === 'dark'
                    ? 'bg-dark-card border-dark-secondary text-dark-text-primary focus:ring-dark-primary'
                    : 'bg-light-card border-light-secondary text-light-text-primary focus:ring-light-primary'
                } focus:outline-none focus:ring-2 disabled:bg-gray-200 disabled:cursor-not-allowed`}
                disabled={loading}
              >
                <option value="all">Tous les utilisateurs</option>
                <option value="user">Utilisateur spécifique</option>
                <option value="plan">Plan spécifique</option>
              </select>
            </div>
            {formData.target === 'user' && (
              <div>
                <label
                  className={`block text-sm font-medium font-sans ${
                    theme === 'dark' ? 'text-dark-text-secondary' : 'text-light-text-secondary'
                  }`}
                >
                  Utilisateur
                </label>
                <select
                  name="user_id"
                  value={formData.user_id}
                  onChange={handleInputChange}
                  className={`mt-1 w-full p-2 border rounded-lg font-sans ${
                    theme === 'dark'
                      ? 'bg-dark-card border-dark-secondary text-dark-text-primary focus:ring-dark-primary'
                      : 'bg-light-card border-light-secondary text-light-text-primary focus:ring-light-primary'
                  } focus:outline-none focus:ring-2 disabled:bg-gray-200 disabled:cursor-not-allowed`}
                  disabled={loading}
                >
                  <option value="">Sélectionner un utilisateur</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.email})
                    </option>
                  ))}
                </select>
                {errors.user_id && (
                  <p className="text-dark-danger dark:text-dark-danger text-sm mt-1 font-sans">
                    {errors.user_id}
                  </p>
                )}
              </div>
            )}
            {formData.target === 'plan' && (
              <div>
                <label
                  className={`block text-sm font-medium font-sans ${
                    theme === 'dark' ? 'text-dark-text-secondary' : 'text-light-text-secondary'
                  }`}
                >
                  Plan
                </label>
                <select
                  name="plan"
                  value={formData.plan}
                  onChange={handleInputChange}
                  className={`mt-1 w-full p-2 border rounded-lg font-sans ${
                    theme === 'dark'
                      ? 'bg-dark-card border-dark-secondary text-dark-text-primary focus:ring-dark-primary'
                      : 'bg-light-card border-light-secondary text-light-text-primary focus:ring-light-primary'
                  } focus:outline-none focus:ring-2 disabled:bg-gray-200 disabled:cursor-not-allowed`}
                  disabled={loading}
                >
                  <option value="">Sélectionner un plan</option>
                  <option value="free">Gratuit</option>
                  <option value="premium">Premium</option>
                  <option value="enterprise">Entreprise</option>
                </select>
                {errors.plan && (
                  <p className="text-dark-danger dark:text-dark-danger text-sm mt-1 font-sans">
                    {errors.plan}
                  </p>
                )}
              </div>
            )}
            <div>
              <label
                className={`block text-sm font-medium font-sans ${
                  theme === 'dark' ? 'text-dark-text-secondary' : 'text-light-text-secondary'
                }`}
              >
                Type
              </label>
              <input
                type="text"
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className={`mt-1 w-full p-2 border rounded-lg font-sans ${
                  theme === 'dark'
                    ? 'bg-dark-card border-dark-secondary text-dark-text-primary focus:ring-dark-primary'
                    : 'bg-light-card border-light-secondary text-light-text-primary focus:ring-light-primary'
                } focus:outline-none focus:ring-2 disabled:bg-gray-200 disabled:cursor-not-allowed`}
                placeholder="ex: info, mise à jour, maintenance"
                disabled={loading}
              />
            </div>
            <div>
              <label
                className={`block text-sm font-medium font-sans ${
                  theme === 'dark' ? 'text-dark-text-secondary' : 'text-light-text-secondary'
                }`}
              >
                Images (optionnel)
              </label>
              <input
                type="file"
                name="images"
                multiple
                accept="image/*"
                onChange={handleImageChange}
                className={`mt-1 w-full p-2 border rounded-lg font-sans ${
                  theme === 'dark'
                    ? 'bg-dark-card border-dark-secondary text-dark-text-primary focus:ring-dark-primary'
                    : 'bg-light-card border-light-secondary text-light-text-primary focus:ring-light-primary'
                } focus:outline-none focus:ring-2 disabled:bg-gray-200 disabled:cursor-not-allowed`}
                disabled={loading}
              />
              {images.length > 0 && (
                <div className="mt-2">
                  <p
                    className={`text-sm font-sans ${
                      theme === 'dark' ? 'text-dark-text-secondary' : 'text-light-text-secondary'
                    }`}
                  >
                    Fichiers sélectionnés : {images.map((image) => image.name).join(', ')}
                  </p>
                </div>
              )}
              {errors.images && (
                <p className="text-dark-danger dark:text-dark-danger text-sm mt-1 font-sans">
                  {errors.images}
                </p>
              )}
            </div>
            <div>
              <label
                className={`block text-sm font-medium font-sans ${
                  theme === 'dark' ? 'text-dark-text-secondary' : 'text-light-text-secondary'
                }`}
              >
                URL du bouton
              </label>
              <input
                type="text"
                name="buttonUrl"
                value={formData.buttonUrl}
                onChange={handleInputChange}
                className={`mt-1 w-full p-2 border rounded-lg font-sans ${
                  theme === 'dark'
                    ? 'bg-dark-card border-dark-secondary text-dark-text-primary focus:ring-dark-primary'
                    : 'bg-light-card border-light-secondary text-light-text-primary focus:ring-light-primary'
                } focus:outline-none focus:ring-2 disabled:bg-gray-200 disabled:cursor-not-allowed`}
                placeholder="https://bliic.com/..."
                disabled={loading}
              />
              {errors.buttonUrl && (
                <p className="text-dark-danger dark:text-dark-danger text-sm mt-1 font-sans">
                  {errors.buttonUrl}
                </p>
              )}
            </div>
            <div>
              <label
                className={`block text-sm font-medium font-sans ${
                  theme === 'dark' ? 'text-dark-text-secondary' : 'text-light-text-secondary'
                }`}
              >
                Label du bouton
              </label>
              <input
                type="text"
                name="buttonLabel"
                value={formData.buttonLabel}
                onChange={handleInputChange}
                className={`mt-1 w-full p-2 border rounded-lg font-sans ${
                  theme === 'dark'
                    ? 'bg-dark-card border-dark-secondary text-dark-text-primary focus:ring-dark-primary'
                    : 'bg-light-card border-light-secondary text-light-text-primary focus:ring-light-primary'
                } focus:outline-none focus:ring-2 disabled:bg-gray-200 disabled:cursor-not-allowed`}
                placeholder="ex: Tester maintenant"
                disabled={loading}
              />
            </div>
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className={`px-4 py-2 rounded-lg font-sans ${
                  theme === 'dark'
                    ? 'bg-dark-secondary text-dark-text-primary hover:bg-dark-secondary/80'
                    : 'bg-light-secondary text-light-text-primary hover:bg-light-secondary/80'
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-dark-primary`}
              >
                Annuler
              </button>
              <button
                type="submit"
                className={`px-4 py-2 rounded-lg font-sans text-white ${
                  theme === 'dark'
                    ? 'bg-dark-primary hover:bg-dark-tertiary'
                    : 'bg-light-primary hover:bg-light-tertiary'
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-dark-primary disabled:bg-gray-400 disabled:cursor-not-allowed`}
                disabled={loading}
              >
                {loading ? 'Envoi...' : 'Envoyer la Notification'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Notification History */}
      <div
        className={`p-6 rounded-xl border border-dark-primary/30 ${
          theme === 'dark' ? 'bg-dark-card' : 'bg-light-card'
        } shadow-lg`}
      >
        <div className="flex items-center justify-between">
          <h2
            className={`text-lg font-semibold font-sans flex items-center ${
              theme === 'dark' ? 'text-dark-text-primary' : 'text-light-text-primary'
            }`}
          >
            <History className="mr-3" size={20} />
            Historique des Notifications
          </h2>
          <div className="relative">
            <AlertCircle
              size={16}
              className="cursor-pointer"
              onMouseEnter={() => setShowTooltip({ history: true })}
              onMouseLeave={() => setShowTooltip({ history: false })}
            />
            {showTooltip.history && (
              <div
                className={`absolute right-0 top-6 z-10 p-2 rounded-lg text-sm font-sans ${
                  theme === 'dark'
                    ? 'bg-dark-background text-dark-text-primary'
                    : 'bg-light-background text-light-text-primary'
                } shadow-md w-48`}
              >
                Historique des notifications envoyées aux utilisateurs.
              </div>
            )}
          </div>
        </div>
        {loading ? (
          <div
            className={`flex justify-center items-center py-6 font-sans animate-pulse ${
              theme === 'dark' ? 'text-dark-text-secondary' : 'text-light-text-secondary'
            }`}
          >
            Chargement...
          </div>
        ) : history.length === 0 ? (
          <p
            className={`text-sm font-sans text-center py-6 ${
              theme === 'dark' ? 'text-dark-text-secondary' : 'text-light-text-secondary'
            }`}
          >
            Aucune notification envoyée
          </p>
        ) : (
          <div className="mt-4">
            <div className="overflow-x-auto">
              <table className="w-full text-left font-sans">
                <thead>
                  <tr
                    className={`${
                      theme === 'dark' ? 'bg-dark-primary' : 'bg-light-primary'
                    } text-white text-sm`}
                  >
                    <th className="p-3 rounded-tl-lg">Sujet</th>
                    <th className="p-3">Message</th>
                    <th className="p-3">Type</th>
                    <th className="p-3">Cible</th>
                    <th className="p-3">Plan</th>
                    <th className="p-3">Utilisateur</th>
                    <th className="p-3">Envoyé par</th>
                    <th className="p-3">Images</th> {/* Nouvelle colonne pour les images */}
                    <th className="p-3">Bouton</th>
                    <th className="p-3 rounded-tr-lg">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((notification) => (
                    <tr
                      key={notification.id}
                      className={`border-t ${
                        theme === 'dark'
                          ? 'border-dark-secondary/20 hover:bg-dark-card/60'
                          : 'border-light-secondary/20 hover:bg-light-card/60'
                      }`}
                    >
                      <td
                        className={`p-3 ${
                          theme === 'dark' ? 'text-dark-text-primary' : 'text-light-text-primary'
                        }`}
                      >
                        {notification.subject}
                      </td>
                      <td
                        className={`p-3 ${
                          theme === 'dark' ? 'text-dark-text-primary' : 'text-light-text-primary'
                        } cursor-pointer hover:underline`}
                        onClick={() => handleMessageClick(notification)}
                        aria-controls={`modal-${notification.id}`}
                        aria-expanded={selectedNotification?.id === notification.id && showModal}
                      >
                        {notification.message.length > 50
                          ? `${notification.message.substring(0, 50)}...`
                          : notification.message}
                      </td>
                      <td
                        className={`p-3 ${
                          theme === 'dark' ? 'text-dark-text-primary' : 'text-light-text-primary'
                        }`}
                      >
                        {notification.type}
                      </td>
                      <td
                        className={`p-3 ${
                          theme === 'dark' ? 'text-dark-text-primary' : 'text-light-text-primary'
                        }`}
                      >
                        {notification.target}
                      </td>
                      <td
                        className={`p-3 ${
                          theme === 'dark' ? 'text-dark-text-primary' : 'text-light-text-primary'
                        }`}
                      >
                        {notification.plan || '-'}
                      </td>
                      <td
                        className={`p-3 ${
                          theme === 'dark' ? 'text-dark-text-primary' : 'text-light-text-primary'
                        }`}
                      >
                        {notification.user_id || '-'}
                      </td>
                      <td
                        className={`p-3 ${
                          theme === 'dark' ? 'text-dark-text-primary' : 'text-light-text-primary'
                        }`}
                      >
                        {notification.sent_by}
                      </td>
                      <td
                        className={`p-3 ${
                          theme === 'dark' ? 'text-dark-text-primary' : 'text-light-text-primary'
                        }`}
                      >
                        {notification.image_paths && notification.image_paths.length > 0 ? (
                          <div className="flex items-center space-x-2">
                            <ImageIcon size={16} />
                            <span>{notification.image_paths.length} image(s)</span>
                          </div>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="p-3">
                        {notification.button_url && notification.button_label ? (
                          <a
                            href={notification.button_url}
                            className={`${
                              theme === 'dark' ? 'text-dark-primary' : 'text-light-primary'
                            } hover:${
                              theme === 'dark' ? 'text-dark-tertiary' : 'text-light-tertiary'
                            } font-sans`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {notification.button_label}
                          </a>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td
                        className={`p-3 ${
                          theme === 'dark' ? 'text-dark-text-primary' : 'text-light-text-primary'
                        }`}
                      >
                        {new Date(notification.created_at).toLocaleString('fr-FR', {
                          dateStyle: 'short',
                          timeStyle: 'short',
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex justify-between items-center mt-4">
              <button
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page === 1 || loading}
                className={`px-4 py-2 rounded-lg font-sans text-white ${
                  theme === 'dark'
                    ? 'bg-dark-primary hover:bg-dark-tertiary'
                    : 'bg-light-primary hover:bg-light-tertiary'
                } disabled:bg-gray-400 disabled:cursor-not-allowed`}
              >
                Précédent
              </button>
              <span
                className={`text-sm font-sans ${
                  theme === 'dark' ? 'text-dark-text-secondary' : 'text-light-text-secondary'
                }`}
              >
                Page {page} sur {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                disabled={page === totalPages || loading}
                className={`px-4 py-2 rounded-lg font-sans text-white ${
                  theme === 'dark'
                    ? 'bg-dark-primary hover:bg-dark-tertiary'
                    : 'bg-light-primary hover:bg-light-tertiary'
                } disabled:bg-gray-400 disabled:cursor-not-allowed`}
              >
                Suivant
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal for Full Message */}
      {showModal && selectedNotification && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 animate-slide-up"
          onClick={closeModal}
        >
          <div
            className={`p-6 rounded-xl w-full max-w-md ${
              theme === 'dark' ? 'bg-dark-card' : 'bg-light-card'
            } shadow-lg overflow-y-auto max-h-[80vh] relative`}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeModal}
              className={`absolute top-2 right-2 text-${
                theme === 'dark' ? 'dark-text-primary' : 'light-text-primary'
              } hover:text-${
                theme === 'dark' ? 'dark-primary' : 'light-primary'
              } focus:outline-none`}
              aria-label="Fermer"
              onKeyDown={(e) => e.key === 'Escape' && closeModal()}
            >
              ✕
            </button>
            <h2
              className={`text-lg font-semibold font-sans ${
                theme === 'dark' ? 'text-dark-text-primary' : 'text-light-text-primary'
              } mb-4`}
            >
              Message Complet
            </h2>
            <p
              className={`text-sm font-sans ${
                theme === 'dark' ? 'text-dark-text-primary' : 'text-light-text-primary'
              } whitespace-pre-wrap mb-4`}
            >
              {selectedNotification.message}
            </p>
            {selectedNotification.image_paths && selectedNotification.image_paths.length > 0 && (
              <div className="space-y-2">
                <h3
                  className={`text-sm font-semibold font-sans ${
                    theme === 'dark' ? 'text-dark-text-primary' : 'text-light-text-primary'
                  }`}
                >
                  Images Attachées
                </h3>
                {selectedNotification.image_paths.map((path, index) => (
                  <a
                    key={index}
                    href={`${API.BASE_URL}/storage/${path}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`block text-sm font-sans ${
                      theme === 'dark' ? 'text-dark-primary' : 'text-light-primary'
                    } hover:underline`}
                  >
                    Image {index + 1}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MailManager;