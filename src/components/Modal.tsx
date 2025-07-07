
import { ReactNode } from "react";
import { useTheme } from "../contexts/ThemeContext"; // Adjust path as needed

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

const Modal = ({ isOpen, onClose, title, children }: ModalProps) => {
  const { theme } = useTheme();

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity duration-200"
      role="dialog"
      aria-modal="true"
    >
      <div
        className={`${
          theme === "dark" ? "bg-dark-card" : "bg-light-card"
        } rounded-lg shadow-lg max-w-md w-full p-4 sm:p-6 relative transition-transform duration-200 transform scale-100`}
      >
        <button
          className={`absolute top-3 right-3 ${
            theme === "dark" ? "text-dark-text-secondary hover:text-dark-text-primary" : "text-light-text-secondary hover:text-light-text-primary"
          } text-lg font-medium transition-colors`}
          onClick={onClose}
          aria-label="Fermer"
        >
          ✕
        </button>
        {title && (
          <h2
            className={`text-xl font-semibold mb-4 ${
              theme === "dark" ? "text-dark-text-primary" : "text-light-text-primary"
            }`}
          >
            {title}
          </h2>
        )}
        {children}
      </div>
    </div>
  );
};

export default Modal;