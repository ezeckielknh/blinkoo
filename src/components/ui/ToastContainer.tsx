import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { useTheme } from '../../contexts/ThemeContext';

const ToastContainer = () => {
  const { toasts, removeToast } = useToast();
  const { theme } = useTheme();

  // Define toast type styles
  const toastStyles = {
    success: {
      border: theme === 'dark' ? 'border-green-600' : 'border-green-500',
      bg: theme === 'dark' ? 'bg-green-900/80' : 'bg-green-100',
      text: theme === 'dark' ? 'text-green-300' : 'text-green-700',
    },
    error: {
      border: theme === 'dark' ? 'border-red-600' : 'border-red-500',
      bg: theme === 'dark' ? 'bg-red-900/80' : 'bg-red-100',
      text: theme === 'dark' ? 'text-red-300' : 'text-red-700',
    },
    info: {
      border: theme === 'dark' ? 'border-blue-600' : 'border-blue-500',
      bg: theme === 'dark' ? 'bg-blue-900/80' : 'bg-blue-100',
      text: theme === 'dark' ? 'text-blue-300' : 'text-blue-700',
    },
    warning: {
      border: theme === 'dark' ? 'border-yellow-600' : 'border-yellow-500',
      bg: theme === 'dark' ? 'bg-yellow-900/80' : 'bg-yellow-100',
      text: theme === 'dark' ? 'text-yellow-300' : 'text-yellow-700',
    },
  };

  return (
    <div
      className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 w-full max-w-xs"
      data-theme={theme}
    >
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            className={`
              flex items-center justify-between p-4 rounded-lg shadow-md
              border ${toastStyles[toast.type]?.border || 'border-gray-800'}
              ${toastStyles[toast.type]?.bg || (theme === 'dark' ? 'bg-dark-card' : 'bg-light-card')}
              ${toastStyles[toast.type]?.text || (theme === 'dark' ? 'text-dark-text-primary' : 'text-light-text-primary')}
            `}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            layout
          >
            <span className="text-sm">{toast.message}</span>
            <button
              className="ml-4 p-1 rounded-full hover:bg-black/20 transition-colors"
              onClick={() => removeToast(toast.id)}
              aria-label="Fermer la notification"
            >
              <X
                size={16}
                className={theme === 'dark' ? 'text-dark-text-secondary' : 'text-light-text-secondary'}
              />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default ToastContainer;
