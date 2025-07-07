import { useTheme } from "../contexts/ThemeContext";
import { motion } from "framer-motion";
import {
  Mail,
  Phone,
  MapPin,
  Send,
  MessageCircle,
  Facebook,
  Twitter,
  Linkedin,
} from "lucide-react";
import { useState } from "react";
import { useToast } from "../contexts/ToastContext";
import axios from "axios";
import { API } from "../utils/api";
import { Link } from "react-router-dom";

const ContactPage = () => {
  const { theme } = useTheme();
  const { addToast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      addToast("Veuillez remplir tous les champs", "error");
      return;
    }
    setLoading(true);
    try {
      // await axios.post(API.CONTACT, formData);
      // addToast("Message envoyé avec succès !", "success");
      // setFormData({ name: "", email: "", message: "" });
    } catch (error) {
      addToast("Erreur lors de l'envoi du message", "error");
    } finally {
      setLoading(false);
    }
  };

  const faqs = [
    {
      question: "Comment puis-je contacter l’équipe Bliic ?",
      answer:
        "Vous pouvez nous écrire via le formulaire de contact, par email à support@bliic.com ou sur WhatsApp. Notre équipe vous répond sous 24h (jours ouvrés).",
    },
    {
      question: "Mon message est-il sécurisé ?",
      answer:
        "Oui, tous les échanges avec notre plateforme sont chiffrés (HTTPS). Vos informations personnelles restent confidentielles.",
    },
    {
      question: "Quand puis-je espérer une réponse ?",
      answer:
        "Nos horaires de support sont du lundi au vendredi, de 9h à 18h (UTC+1). Vous recevez généralement une réponse dans la journée.",
    },
    {
      question: "Où se situe l’équipe Bliic ?",
      answer:
        "Notre siège est à Paris, mais notre équipe est répartie entre l’Europe et l’Afrique pour rester au plus proche de nos utilisateurs.",
    },
  ];

  const socialLinks = [
    {
      name: "WhatsApp",
      icon: (
        <MessageCircle
          size={24}
          className={`text-${
            theme === "dark" ? "dark-primary" : "light-primary"
          }`}
        />
      ),
      href: "https://wa.me/+1234567890?text=Bonjour%20Bliic,%20j'ai%20une%20question%20!",
      ariaLabel: "Contacter Bliic sur WhatsApp",
    },
    {
      name: "Facebook",
      icon: (
        <Facebook
          size={24}
          className={`text-${
            theme === "dark" ? "dark-primary" : "light-primary"
          }`}
        />
      ),
      href: "https://facebook.com/bliic",
      ariaLabel: "Visiter la page Facebook de Bliic",
    },
    {
      name: "Twitter",
      icon: (
        <Twitter
          size={24}
          className={`text-${
            theme === "dark" ? "dark-primary" : "light-primary"
          }`}
        />
      ),
      href: "https://twitter.com/bliic",
      ariaLabel: "Suivre Bliic sur Twitter",
    },
    {
      name: "LinkedIn",
      icon: (
        <Linkedin
          size={24}
          className={`text-${
            theme === "dark" ? "dark-primary" : "light-primary"
          }`}
        />
      ),
      href: "https://linkedin.com/company/bliic",
      ariaLabel: "Voir le profil LinkedIn de Bliic",
    },
  ];

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1, duration: 0.3 },
    }),
  };

  return (
    <div className="flex flex-col">
      {/* Introduction Section */}
      <section
        className={`pt-10 ${
          theme === "dark"
            ? "bg-gradient-to-b from-dark-background to-dark-bg-dark"
            : "bg-gradient-to-b from-light-background to-light-bg-light"
        }`}
      >
        <style>
          {`
            .contact-card, .faq-card, .social-card {
              transition: transform 0.3s ease, box-shadow 0.3s ease;
            }
            .contact-card:hover, .faq-card:hover, .social-card:hover {
              transform: translateY(-4px);
              box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
            }
            .form-input {
              transition: border-color 0.3s ease, box-shadow 0.3s ease;
            }
            .form-input:focus {
              border-color: ${theme === "dark" ? "#eab308" : "#7c3aed"};
              box-shadow: 0 0 0 3px ${
                theme === "dark"
                  ? "rgba(234, 179, 8, 0.2)"
                  : "rgba(124, 58, 237, 0.2)"
              };
            }
          `}
        </style>
        <div className="container mx-auto px-4 max-w-7xl text-center">
          <motion.h1
            className={`text-4xl md:text-5xl font-bold mb-6 ${
              theme === "dark"
                ? "text-dark-text-primary"
                : "text-light-text-primary"
            } font-sans`}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Contactez-Nous
          </motion.h1>
          <motion.p
            className={`text-lg md:text-xl mb-12 max-w-4xl mx-auto ${
              theme === "dark"
                ? "text-dark-text-secondary"
                : "text-light-text-secondary"
            } font-sans`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Une question ? Un souci technique ? Une idée à partager ? Chez
            Bliic, chaque message compte. Notre équipe vous répond rapidement,
            avec attention et efficacité.
          </motion.p>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="py-12">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Form */}
            <motion.div
              className={`rounded-lg ${
                theme === "dark" ? "bg-dark-card/10" : "bg-light-card/10"
              } backdrop-blur-sm border ${
                theme === "dark"
                  ? "border-dark-text-secondary/50"
                  : "border-light-text-secondary/50"
              } p-8`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h2
                className={`text-2xl font-bold mb-6 ${
                  theme === "dark"
                    ? "text-dark-text-primary"
                    : "text-light-text-primary"
                } font-sans`}
              >
                Laissez-nous un mot, on vous répond vite !
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="name"
                    className={`block text-sm font-medium mb-1 ${
                      theme === "dark"
                        ? "text-dark-text-secondary"
                        : "text-light-text-secondary"
                    } font-sans`}
                  >
                    Nom
                  </label>
                  <input
                    type="text"
                    id="name"
                    placeholder="Votre prénom ou nom complet"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`form-input w-full p-3 rounded-lg border ${
                      theme === "dark"
                        ? "border-dark-text-secondary/50 bg-dark-background text-dark-text-primary"
                        : "border-light-text-secondary/50 bg-light-background text-light-text-primary"
                    } font-sans`}
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="email"
                    className={`block text-sm font-medium mb-1 ${
                      theme === "dark"
                        ? "text-dark-text-secondary"
                        : "text-light-text-secondary"
                    } font-sans`}
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    placeholder="Votre adresse e-mail "
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`form-input w-full p-3 rounded-lg border ${
                      theme === "dark"
                        ? "border-dark-text-secondary/50 bg-dark-background text-dark-text-primary"
                        : "border-light-text-secondary/50 bg-light-background text-light-text-primary"
                    } font-sans`}
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="message"
                    className={`block text-sm font-medium mb-1 ${
                      theme === "dark"
                        ? "text-dark-text-secondary"
                        : "text-light-text-secondary"
                    } font-sans`}
                  >
                    Message
                  </label>
                  <textarea
                    id="message"
                    placeholder="Expliquez-nous comment on peut vous aider… "
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={5}
                    className={`form-input w-full p-3 rounded-lg border ${
                      theme === "dark"
                        ? "border-dark-text-secondary/50 bg-dark-background text-dark-text-primary"
                        : "border-light-text-secondary/50 bg-light-background text-light-text-primary"
                    } font-sans`}
                    required
                  ></textarea>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full px-6 py-3 text-lg rounded-lg font-semibold flex items-center justify-center ${
                    theme === "dark"
                      ? "bg-dark-primary text-dark-text-primary hover:bg-dark-primary/80"
                      : "bg-light-primary text-dark-text-primary hover:bg-dark-primary/80"
                  } font-sans transition-all`}
                >
                  {loading ? (
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                    >
                      <Send size={20} className="mr-2" />
                    </motion.span>
                  ) : (
                    <Send size={20} className="mr-2" />
                  )}
                  Envoyer
                </button>
              </form>
            </motion.div>

            {/* Contact Info */}
            <motion.div
              className="space-y-6"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h2
                className={`text-2xl font-bold mb-6 ${
                  theme === "dark"
                    ? "text-dark-text-primary"
                    : "text-light-text-primary"
                } font-sans`}
              >
                Informations de Contact
              </h2>
              <div
                className={`contact-card flex items-center p-4 rounded-lg ${
                  theme === "dark" ? "bg-dark-card/10" : "bg-light-card/10"
                } backdrop-blur-sm border ${
                  theme === "dark"
                    ? "border-dark-text-secondary/50"
                    : "border-light-text-secondary/50"
                }`}
              >
                <Mail
                  size={24}
                  className={`mr-4 ${
                    theme === "dark"
                      ? "text-dark-primary"
                      : "text-light-primary"
                  }`}
                />
                <div>
                  <p
                    className={`text-base font-semibold ${
                      theme === "dark"
                        ? "text-dark-text-primary"
                        : "text-light-text-primary"
                    } font-sans`}
                  >
                    Écrivez-nous
                  </p>
                  <a
                    href="mailto:support@bliic.com"
                    className={`text-sm ${
                      theme === "dark"
                        ? "text-dark-text-secondary"
                        : "text-light-text-secondary"
                    } font-sans hover:underline`}
                    aria-label="Envoyer un email à support@bliic.com"
                  >
                    support@bliic.com
                  </a>
                </div>
              </div>
              <div
                className={`contact-card flex items-center p-4 rounded-lg ${
                  theme === "dark" ? "bg-dark-card/10" : "bg-light-card/10"
                } backdrop-blur-sm border ${
                  theme === "dark"
                    ? "border-dark-text-secondary/50"
                    : "border-light-text-secondary/50"
                }`}
              >
                <Phone
                  size={24}
                  className={`mr-4 ${
                    theme === "dark"
                      ? "text-dark-primary"
                      : "text-light-primary"
                  }`}
                />
                <div>
                  <p
                    className={`text-base font-semibold ${
                      theme === "dark"
                        ? "text-dark-text-primary"
                        : "text-light-text-primary"
                    } font-sans`}
                  >
                    Appelez-nous
                  </p>
                  <a
                    href="tel:+1234567890"
                    className={`text-sm ${
                      theme === "dark"
                        ? "text-dark-text-secondary"
                        : "text-light-text-secondary"
                    } font-sans hover:underline`}
                    aria-label="Appeler Bliic au +1 (234) 567-890"
                  >
                    +1 (234) 567-890
                  </a>
                </div>
              </div>
              <div
                className={`contact-card flex items-center p-4 rounded-lg ${
                  theme === "dark" ? "bg-dark-card/10" : "bg-light-card/10"
                } backdrop-blur-sm border ${
                  theme === "dark"
                    ? "border-dark-text-secondary/50"
                    : "border-light-text-secondary/50"
                }`}
              >
                <MessageCircle
                  size={24}
                  className={`mr-4 ${
                    theme === "dark"
                      ? "text-dark-primary"
                      : "text-light-primary"
                  }`}
                />
                <div>
                  <p
                    className={`text-base font-semibold ${
                      theme === "dark"
                        ? "text-dark-text-primary"
                        : "text-light-text-primary"
                    } font-sans`}
                  >
                    Discutez sur WhatsApp
                  </p>
                  <a
                    href="https://wa.me/+1234567890?text=Bonjour%20Bliic,%20j'ai%20une%20question%20!"
                    className={`text-sm ${
                      theme === "dark"
                        ? "text-dark-text-secondary"
                        : "text-light-text-secondary"
                    } font-sans hover:underline`}
                    aria-label="Contacter Bliic sur WhatsApp"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    +1 (234) 567-890
                  </a>
                </div>
              </div>
              <div
                className={`contact-card flex items-center p-4 rounded-lg ${
                  theme === "dark" ? "bg-dark-card/10" : "bg-light-card/10"
                } backdrop-blur-sm border ${
                  theme === "dark"
                    ? "border-dark-text-secondary/50"
                    : "border-light-text-secondary/50"
                }`}
              >
                <Facebook
                  size={24}
                  className={`mr-4 ${
                    theme === "dark"
                      ? "text-dark-primary"
                      : "text-light-primary"
                  }`}
                />
                <div>
                  <p
                    className={`text-base font-semibold ${
                      theme === "dark"
                        ? "text-dark-text-primary"
                        : "text-light-text-primary"
                    } font-sans`}
                  >
                    Suivez-nous
                  </p>
                  <a
                    href="https://facebook.com/bliic"
                    className={`text-sm ${
                      theme === "dark"
                        ? "text-dark-text-secondary"
                        : "text-light-text-secondary"
                    } font-sans hover:underline`}
                    aria-label="Visiter la page Facebook de Bliic"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    facebook.com/bliic
                  </a>
                </div>
              </div>
              <div
                className={`contact-card flex items-center p-4 rounded-lg ${
                  theme === "dark" ? "bg-dark-card/10" : "bg-light-card/10"
                } backdrop-blur-sm border ${
                  theme === "dark"
                    ? "border-dark-text-secondary/50"
                    : "border-light-text-secondary/50"
                }`}
              >
                <MapPin
                  size={24}
                  className={`mr-4 ${
                    theme === "dark"
                      ? "text-dark-primary"
                      : "text-light-primary"
                  }`}
                />
                <div>
                  <p
                    className={`text-base font-semibold ${
                      theme === "dark"
                        ? "text-dark-text-primary"
                        : "text-light-text-primary"
                    } font-sans`}
                  >
                    Notre siège
                  </p>
                  <p
                    className={`text-sm ${
                      theme === "dark"
                        ? "text-dark-text-secondary"
                        : "text-light-text-secondary"
                    } font-sans`}
                  >
                    123 Rue de l'Innovation, 75001 Paris, France
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section
        className={`py-12 ${
          theme === "dark" ? "bg-dark-background/50" : "bg-light-background/50"
        }`}
      >
        <div className="container mx-auto px-4 max-w-7xl">
          <motion.h2
            className={`text-3xl md:text-4xl font-bold mb-8 text-center ${
              theme === "dark"
                ? "text-dark-text-primary"
                : "text-light-text-primary"
            } font-sans`}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Questions Fréquentes
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {faqs.map((faq, index) => (
              <motion.div
                key={faq.question}
                className={`faq-card rounded-lg ${
                  theme === "dark" ? "bg-dark-card/10" : "bg-light-card/10"
                } backdrop-blur-sm border ${
                  theme === "dark"
                    ? "border-dark-text-secondary/50"
                    : "border-light-text-secondary/50"
                } p-6`}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                custom={index}
                whileHover={{ scale: 1.05 }}
              >
                <h3
                  className={`text-lg font-semibold mb-2 ${
                    theme === "dark"
                      ? "text-dark-text-primary"
                      : "text-light-text-primary"
                  } font-sans`}
                >
                  {faq.question}
                </h3>
                <p
                  className={`text-base ${
                    theme === "dark"
                      ? "text-dark-text-secondary"
                      : "text-light-text-secondary"
                  } font-sans`}
                >
                  {faq.answer}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Media Section */}
      <section className="py-12">
        <div className="container mx-auto px-4 max-w-7xl">
          <motion.h2
            className={`text-3xl md:text-4xl font-bold mb-8 text-center ${
              theme === "dark"
                ? "text-dark-text-primary"
                : "text-light-text-primary"
            } font-sans`}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Rejoignez notre communauté sur les réseaux sociaux pour découvrir
            nos astuces, nouveautés et échanges avec la team.
          </motion.h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {socialLinks.map((link, index) => (
              <motion.a
                key={link.name}
                href={link.href}
                className={`social-card flex flex-col items-center p-4 rounded-lg ${
                  theme === "dark" ? "bg-dark-card/10" : "bg-light-card/10"
                } backdrop-blur-sm border ${
                  theme === "dark"
                    ? "border-dark-text-secondary/50"
                    : "border-light-text-secondary/50"
                }`}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                custom={index}
                whileHover={{ scale: 1.05 }}
                aria-label={link.ariaLabel}
                target="_blank"
                rel="noopener noreferrer"
              >
                <div className="mb-2">{link.icon}</div>
                <p
                  className={`text-base font-semibold ${
                    theme === "dark"
                      ? "text-dark-text-primary"
                      : "text-light-text-primary"
                  } font-sans`}
                >
                  {link.name}
                </p>
              </motion.a>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section
        className={`py-10 ${
          theme === "dark" ? "bg-dark-background" : "bg-light-background"
        }`}
      >
        <div className="container mx-auto px-4 max-w-7xl text-center">
          <motion.h2
            className={`text-3xl md:text-4xl font-bold mb-6 ${
              theme === "dark"
                ? "text-dark-text-primary"
                : "text-light-text-primary"
            } font-sans`}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Rejoignez la Communauté Bliic
          </motion.h2>
          <motion.p
            className={`text-lg mb-8 max-w-4xl mx-auto ${
              theme === "dark"
                ? "text-dark-text-secondary"
                : "text-light-text-secondary"
            } font-sans`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Inscrivez-vous gratuitement et découvrez une nouvelle façon de gérer
            vos liens, QR codes et fichiers. Rejoignez des milliers
            d’utilisateurs qui font déjà confiance à Bliic.
          </motion.p>
          <Link
            to="/register"
            className={`inline-block px-8 py-3 text-lg rounded-lg font-semibold ${
              theme === "dark"
                ? "bg-dark-primary text-dark-text-primary hover:bg-dark-primary/80"
                : "bg-light-primary text-dark-text-primary hover:bg-light-primary/80"
            } font-sans transition-all`}
          >
            S'inscrire
          </Link>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;
