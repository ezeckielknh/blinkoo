import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import {
  ChevronDown,
  Globe,
  BarChart2,
  QrCode,
  FileUp,
  Copy,
  ExternalLink,
} from "lucide-react";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { useToast } from "../contexts/ToastContext";
import logo from "../assets/logo.svg";
import { useAuth } from "../contexts/AuthContext";
import { API } from "../utils/api";
import { useTheme } from "../contexts/ThemeContext";

const LandingPage = () => {
  const { addToast } = useToast();
  const { user, setUser } = useAuth();
  const [url, setUrl] = useState("");
  const [email, setEmail] = useState("");
  const [shortUrl, setShortUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeAccordion, setActiveAccordion] = useState<number | null>(null);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const storedToken = localStorage.getItem("access_token");
    const storedUser = localStorage.getItem("user");
    if (!user && storedToken && storedUser) {
      setUser({ ...JSON.parse(storedUser), token: storedToken });
    }
    console.log(`Landing Page loaded with theme: ${theme}`);
  }, [user, setUser, theme]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!url) {
      addToast("Veuillez entrer une URL", "error");
      return;
    }

    if (!isValidUrl(url)) {
      addToast("Veuillez entrer une URL valide", "error");
      return;
    }

    if (!user && !email) {
      addToast("Veuillez entrer votre adresse e-mail", "error");
      return;
    }

    if (!user && !isValidEmail(email)) {
      addToast("Veuillez entrer une adresse e-mail valide", "error");
      return;
    }

    setLoading(true);

    try {
      const endpoint = user
        ? API.SHORT_LINKS.CREATE_AUTH
        : API.SHORT_LINKS.CREATE;

      const payload = {
        original_url: url,
        email: user ? undefined : email,
      };

      const headers = user
        ? { Authorization: `Bearer ${user.token}` }
        : undefined;

      console.log(user?.token);

      interface ResponseData {
        short_link: string;
        user?: any; // or specify the type of user if you know it
        access_token?: string;
      }

      const response = await axios.post<ResponseData>(endpoint, payload, {
        headers,
      });
      setShortUrl(response.data.short_link);
      if (!user && response.data.user && response.data.access_token) {
        const newUser = response.data.user;
        newUser.token = response.data.access_token;
        localStorage.setItem("access_token", newUser.token);
        localStorage.setItem("user", JSON.stringify(newUser));
        setUser(newUser);
      }

      addToast("Lien raccourci créé avec succès !", "success");
    } catch (error: any) {
      console.error("Erreur lors de la création du lien :", error);

      // Si l'API a renvoyé une réponse avec un message
      if (error.response && error.response.data) {
        const apiError = error.response.data;

        // Si le backend envoie une clé `error` (cas courant)
        if (apiError.error) {
          addToast(apiError.error, "error");
        }
        // Si le backend renvoie des erreurs de validation Laravel
        else if (apiError.message) {
          addToast(apiError.message, "error");
        }
        // Autres formats éventuels
        else {
          addToast("Une erreur s'est produite côté serveur.", "error");
        }
      } else {
        // Erreur réseau ou Axios
        addToast("Erreur réseau. Veuillez vérifier votre connexion.", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch (err) {
      return false;
    }
  };

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const toggleAccordion = (index: number) => {
    setActiveAccordion(activeAccordion === index ? null : index);
  };

  const features = [
    {
      icon: <Globe className="w-8 h-8 text-primary" />,
      title: "Raccourcissement d URL",
      description:
        "Cr ez des liens courts et m morables pour vos URL longues instantan ment.",
    },
    {
      icon: <QrCode className="w-8 h-8 text-primary" />,
      title: "Codes QR",
      description:
        "G n rez des codes QR pour vos liens et personnalisez-les avec votre marque.",
    },
    {
      icon: <BarChart2 className="w-8 h-8 text-primary" />,
      title: "Analytiques",
      description:
        "Suivez les clics, les donn es g ographiques et les informations de l appareil pour tous vos liens.",
    },
    {
      icon: <FileUp className="w-8 h-8 text-primary" />,
      title: "Partage de fichiers",
      description:
        "T l chargez des fichiers et cr ez des liens partageables avec des dates d expiration.",
    },
  ];

  const plans = [
    {
      name: "Gratuit",
      price: "0 €",
      period: "à vie",
      features: [
        "10 liens par mois",
        "Statistiques de base",
        "QR codes standards (noirs)",
        "Partage de fichiers jusqu’à 5 Mo",
      ],
      cta: "Commencer gratuitement",
      ctaLink: "/register",
      popular: false,
    },
    {
      name: "Premium",
      price: "9 €",
      period: "par mois",
      features: [
        "Liens illimités",
        "Statistiques avancées",
        "QR codes personnalisables (couleurs, logo)",
        "Partage de fichiers jusqu’à 100 Mo",
        "Domaines personnalisés pour vos liens",
      ],
      cta: "Essai gratuit 7 jours",
      ctaLink: "/register",
      popular: true,
    },
    {
      name: "Entreprise",
      price: "29 €",
      period: "par mois",
      features: [
        "Toutes les fonctionnalités du plan Premium",
        "Collaboration en équipe",
        "Accès API sécurisé",
        "Partage de fichiers jusqu’à 1 Go",
        "Support prioritaire",
        "Personnalisation complète de l’image de marque",
      ],
      cta: "Contacter notre équipe",
      ctaLink: "/register",
      popular: false,
    },
  ];

  const faqs = [
    {
      question: "Qu’est-ce qu’un raccourcisseur de lien ?",
      answer:
        "C’est un outil qui transforme une URL longue en un lien plus court, facile à partager, à retenir et à suivre.",
    },
    {
      question: "Mes liens raccourcis expirent-ils ?",
      answer:
        "Non, vos liens restent actifs indéfiniment, sauf si vous les supprimez manuellement ou définissez une date d’expiration.",
    },
    {
      question: "Puis-je personnaliser mes liens ?",
      answer:
        "Oui, avec les plans Premium et Entreprise, vous pouvez créer des liens personnalisés avec votre propre nom de domaine.",
    },
    {
      question: "Comment suivre les clics sur mes liens ?",
      answer:
        "Tous les plans incluent des statistiques. Depuis votre tableau de bord, vous pouvez consulter les clics, zones géographiques, sources de trafic, etc.",
    },
    {
      question: "Y a-t-il une limite de création de liens ?",
      answer:
        "Le plan Gratuit est limité à 10 liens par mois. Les plans Premium et Entreprise vous offrent une création illimitée.",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className={`sticky top-0 z-10 ${theme === 'darkTheme' ? 'bg-darkTheme-background' : 'bg-lightTheme-background'} backdrop-blur-sm border-b border-gray-800`}>
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
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
            <h1 className="text-2xl font-bold ml-2">Blinkoo</h1>
          </div>
          <nav className="space-x-1 sm:space-x-4">
            {user ? (
              <Link
                to="/dashboard"
                className="btn btn-outline text-sm sm:text-base"
              >
                Mon Compte
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="btn btn-outline text-sm sm:text-base"
                >
                  Connexion
                </Link>
                {/* <Link
                  to="/register"
                  className="btn btn-primary text-sm sm:text-base"
                >
                  S'inscrire
                </Link> */}
              </>
            )}
            <button
              onClick={() => {
                toggleTheme();
                console.log('Toggle Theme button clicked');  // Log button click
              }}
              className="btn btn-outline text-sm sm:text-base"
            >
             {theme === 'darkTheme' ? 'Light' : 'Dark'} 
            </button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-12 md:py-20 px-4 flex-grow">
        <div className="container mx-auto text-center max-w-4xl">
          <div className="animate-fadeIn">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
              Raccourcissez vos liens. Déployez votre portée.
            </h1>
            <p className="text-lg md:text-xl mb-8 ">
              Créez des liens courts et des QR codes personnalisés pour vos
              campagnes marketing, réseaux sociaux ou tout lien long à partager.
            </p>
          </div>

          <div className="card max-w-2xl mx-auto animate-slideUp">
            {!shortUrl ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="form-control">
                  <input
                    type="text"
                    placeholder="Entrez votre URL"
                    className="form-input"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                  />
                </div>

                {!user && (
                  <div className="form-control">
                    <input
                      type="email"
                      placeholder="Entrez votre adresse e-mail"
                      className="form-input"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                )}
                <button
                  type="submit"
                  className={`btn btn-primary w-full ${
                    loading ? "opacity-75 cursor-not-allowed" : ""
                  }`}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="inline-block h-4 w-4 rounded-full border-2 border-white/20 border-t-white animate-spin mr-2" />
                      Raccourcissement...
                    </>
                  ) : (
                    "Raccourcir l'URL"
                  )}
                </button>
              </form>
            ) : (
              <div className="space-y-4 py-2">
                <div className="flex items-center justify-between p-3 bg-background/50 rounded-lg">
                  <span className="text-primary font-medium truncate mr-2">
                    {shortUrl}
                  </span>
                  <div className="flex items-center space-x-2">
                    <CopyToClipboard
                      text={shortUrl}
                      onCopy={() =>
                        addToast(
                          "Lien copié dans le presse-papiers !",
                          "success"
                        )
                      }
                    >
                      <button
                        className="p-2 hover:bg-primary/10 rounded-lg transition-colors"
                        title="Copier le lien"
                      >
                        <Copy size={16} />
                      </button>
                    </CopyToClipboard>
                    <a
                      href={shortUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 hover:bg-primary/10 rounded-lg transition-colors"
                      title="Ouvrir le lien"
                    >
                      <ExternalLink size={16} />
                    </a>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => {
                      setShortUrl(null);
                      setUrl("");
                      setEmail("");
                    }}
                    className="btn btn-outline"
                  >
                    Raccourcir un autre lien
                  </button>
                  <Link to="/register" className="btn btn-primary">
                    Créer un compte pour plus de fonctionnalités
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-card/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Fonctionnalités Puissantes
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="card transition-all duration-300 hover:transform hover:scale-105 hover:shadow-xl"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="mb-4 p-3 bg-primary/10 rounded-full">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-300">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-3">
            Tarification Simple
          </h2>
          <p className="text-center text-gray-300 mb-12 max-w-2xl mx-auto">
            Choisissez le plan qui correspond à vos besoins. Tous les plans
            incluent les fonctionnalités de base avec des limites et capacités
            différentes.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {plans.map((plan, index) => (
              <div
                key={index}
                className={`card relative ${
                  plan.popular
                    ? "border-2 border-secondary transform -translate-y-4 md:scale-105"
                    : ""
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-secondary text-xs font-bold px-3 py-1 rounded-full text-white">
                    Populaire
                  </div>
                )}
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <div className="flex items-center justify-center">
                    <span className="text-3xl md:text-4xl font-bold">
                      {plan.price}
                    </span>
                    <span className="text-gray-400 ml-2">{plan.period}</span>
                  </div>
                </div>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start">
                      <svg
                        className="w-5 h-5 text-primary mt-0.5 mr-2"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link
                  to={plan.ctaLink}
                  className={`btn w-full ${
                    plan.popular ? "btn-secondary" : "btn-outline"
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 bg-card/30">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Questions Fréquemment Posées
          </h2>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="card overflow-hidden">
                <button
                  className="w-full flex justify-between items-center p-4 text-left font-medium"
                  onClick={() => toggleAccordion(index)}
                >
                  {faq.question}
                  <ChevronDown
                    className={`transition-transform duration-300 ${
                      activeAccordion === index ? "rotate-180" : ""
                    }`}
                    size={20}
                  />
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    activeAccordion === index
                      ? "max-h-40 opacity-100"
                      : "max-h-0 opacity-0"
                  }`}
                >
                  <div className="p-4 pt-0 text-gray-300 border-t border-gray-700">
                    {faq.answer}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 text-center bg-gradient-to-r from-primary/20 to-secondary/20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Prêt à commencer ?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Rejoignez des milliers de professionnels, créateurs et entreprises
            qui utilisent Blinkoo pour optimiser le partage de leurs liens et QR
            codes.
          </p>
          <Link to="/register" className="btn btn-primary px-8 py-3 text-lg">
            Inscription gratuite
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card py-10 border-t border-gray-800">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <svg
                  className="w-6 h-6 text-primary"
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
                <h3 className="text-xl font-bold ml-2">Blinkoo</h3>
              </div>
              <p className="text-gray-400">
                Raccourcisseur d'URL simple pour tous.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Produit</h4>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-gray-400 hover:text-primary">
                    Raccourcisseur d'URL
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-primary">
                    Codes QR
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-primary">
                    Analytiques
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-primary">
                    Partage de fichiers
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Entreprise</h4>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-gray-400 hover:text-primary">
                    À propos de nous
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-primary">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-primary">
                    Carrières
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-primary">
                    Contact
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Juridique</h4>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-gray-400 hover:text-primary">
                    Politique de confidentialité
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-primary">
                    Conditions d'utilisation
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-primary">
                    Politique relative aux cookies
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-primary">
                    RGPD
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm mb-4 md:mb-0">
              &copy; {new Date().getFullYear()} Blinkoo. Tous droits réservés.
            </p>
            <div className="flex space-x-4">
              <a
                href="#"
                className="text-gray-400 hover:text-primary transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                </svg>
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-primary transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                </svg>
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-primary transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-primary transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                  <rect x="2" y="9" width="4" height="12"></rect>
                  <circle cx="4" cy="4" r="2"></circle>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
