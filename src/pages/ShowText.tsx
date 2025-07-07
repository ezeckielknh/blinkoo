import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";
import { API } from "../utils/api";
import { useToast } from "../contexts/ToastContext";
import { Phone, Mail, MessageSquare, Globe, MapPin, Wifi, User, Link as LucideLink, BarChart, Shield } from "lucide-react";
import logoImage from "../assets/bliic.png";
import logo2Image from "../assets/Bliic 2.png";

interface QRCodeData {
  type: "url" | "text" | "tel" | "email" | "sms" | "whatsapp" | "wifi" | "geo" | "vcard";
  content: string;
}

const ShowText = () => {
  const { identifier } = useParams<{ identifier: string }>();
  const { addToast } = useToast();
  const { theme } = useTheme();
  const [data, setData] = useState<QRCodeData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      if (!identifier) {
        addToast("Identifiant manquant", "error");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${API.QR_CODES.GET_TEXT}/${identifier}`);
        const json = await res.json();

        if (!res.ok) {
          addToast(json?.error || "Contenu introuvable", "error");
          return;
        }

        setData(json);
      } catch (err) {
        addToast("Erreur réseau", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [identifier, addToast]);

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
          willChange: "transform, opacity",
        }}
      />
    );
  });

  if (loading) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center p-4 font-sans relative overflow-hidden ${
          theme === "dark"
            ? "bg-dark-background"
            : "bg-light-background"
        } bg-gradient-to-br ${
          theme === "dark"
            ? "from-dark-background to-dark-primary via-dark-secondary"
            : "from-light-background to-light-primary via-light-secondary"
        } animate-pulse`}
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
            theme === "dark" ? "bg-dark-card/90" : "bg-light-card/90"
          } backdrop-blur-sm p-8 text-center`}
        >
          <p
            className={`text-lg ${
              theme === "dark" ? "text-dark-text-secondary" : "text-light-text-secondary"
            } animate-pulse font-sans`}
          >
            Chargement...
          </p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center p-4 font-sans relative overflow-hidden ${
          theme === "dark"
            ? "bg-dark-background"
            : "bg-light-background"
        } bg-gradient-to-br ${
          theme === "dark"
            ? "from-dark-background to-dark-primary via-dark-secondary"
            : "from-light-background to-light-primary via-light-secondary"
        } animate-pulse`}
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
            theme === "dark" ? "bg-dark-card/90" : "bg-light-card/90"
          } backdrop-blur-sm p-8 text-center`}
        >
          <p
            className={`text-lg font-bold ${
              theme === "dark" ? "text-dark-danger" : "text-light-danger"
            } font-sans`}
          >
            QR Code introuvable ou vide
          </p>
        </div>
      </div>
    );
  }

  const { type, content } = data;

  const renderContent = () => {
    switch (type) {
      case "url":
        return (
          <div
            className={`w-full max-w-2xl rounded-2xl shadow-xl ${
              theme === "dark" ? "bg-dark-card/90" : "bg-light-card/90"
            } backdrop-blur-sm p-8 border ${
              theme === "dark" ? "border-dark-text-secondary/50" : "border-light-text-secondary/50"
            } text-center`}
          >
            <h2
              className={`text-xl font-semibold mb-4 flex items-center justify-center ${
                theme === "dark" ? "text-dark-text-primary" : "text-light-text-primary"
              } font-sans`}
            >
              <LucideLink
                size={24}
                className={`mr-2 ${theme === "dark" ? "text-dark-primary" : "text-light-primary"}`}
              />
              Lien URL
            </h2>
            <a
              href={content}
              target="_blank"
              rel="noopener noreferrer"
              className={`${
                theme === "dark" ? "text-dark-secondary" : "text-light-secondary"
              } hover:${
                theme === "dark" ? "text-dark-primary" : "text-light-primary"
              } underline break-all text-lg font-sans`}
            >
              {content}
            </a>
          </div>
        );

      case "text":
        return (
          <div
            className={`w-full max-w-2xl rounded-2xl shadow-xl ${
              theme === "dark" ? "bg-dark-card/90" : "bg-light-card/90"
            } backdrop-blur-sm p-8 border ${
              theme === "dark" ? "border-dark-text-secondary/50" : "border-light-text-secondary/50"
            } text-center`}
          >
            <h2
              className={`text-xl font-semibold mb-4 flex items-center justify-center ${
                theme === "dark" ? "text-dark-text-primary" : "text-light-text-primary"
              } font-sans`}
            >
              <MessageSquare
                size={24}
                className={`mr-2 ${theme === "dark" ? "text-dark-primary" : "text-light-primary"}`}
              />
              Message Texte
            </h2>
            <p
              className={`text-lg ${
                theme === "dark" ? "text-dark-text-secondary" : "text-light-text-secondary"
              } whitespace-pre-wrap font-sans`}
            >
              {content}
            </p>
          </div>
        );

      case "tel":
        return (
          <div
            className={`w-full max-w-2xl rounded-2xl shadow-xl ${
              theme === "dark" ? "bg-dark-card/90" : "bg-light-card/90"
            } backdrop-blur-sm p-8 border ${
              theme === "dark" ? "border-dark-text-secondary/50" : "border-light-text-secondary/50"
            } text-center`}
          >
            <h2
              className={`text-xl font-semibold mb-4 flex items-center justify-center ${
                theme === "dark" ? "text-dark-text-primary" : "text-light-text-primary"
              } font-sans`}
            >
              <Phone
                size={24}
                className={`mr-2 ${theme === "dark" ? "text-dark-primary" : "text-light-primary"}`}
              />
              Numéro de Téléphone
            </h2>
            <a
              href={content}
              className={`${
                theme === "dark" ? "text-dark-secondary" : "text-light-secondary"
              } hover:${
                theme === "dark" ? "text-dark-primary" : "text-light-primary"
              } underline text-lg font-sans`}
            >
              {content.replace("tel:", "")}
            </a>
          </div>
        );

      case "email":
        return (
          <div
            className={`w-full max-w-2xl rounded-2xl shadow-xl ${
              theme === "dark" ? "bg-dark-card/90" : "bg-light-card/90"
            } backdrop-blur-sm p-8 border ${
              theme === "dark" ? "border-dark-text-secondary/50" : "border-light-text-secondary/50"
            } text-center`}
          >
            <h2
              className={`text-xl font-semibold mb-4 flex items-center justify-center ${
                theme === "dark" ? "text-dark-text-primary" : "text-light-text-primary"
              } font-sans`}
            >
              <Mail
                size={24}
                className={`mr-2 ${theme === "dark" ? "text-dark-primary" : "text-light-primary"}`}
              />
              Adresse Email
            </h2>
            <a
              href={content}
              className={`${
                theme === "dark" ? "text-dark-secondary" : "text-light-secondary"
              } hover:${
                theme === "dark" ? "text-dark-primary" : "text-light-primary"
              } underline text-lg font-sans`}
            >
              {content.replace("mailto:", "")}
            </a>
          </div>
        );

      case "sms":
        return (
          <div
            className={`w-full max-w-2xl rounded-2xl shadow-xl ${
              theme === "dark" ? "bg-dark-card/90" : "bg-light-card/90"
            } backdrop-blur-sm p-8 border ${
              theme === "dark" ? "border-dark-text-secondary/50" : "border-light-text-secondary/50"
            } text-center`}
          >
            <h2
              className={`text-xl font-semibold mb-4 flex items-center justify-center ${
                theme === "dark" ? "text-dark-text-primary" : "text-light-text-primary"
              } font-sans`}
            >
              <MessageSquare
                size={24}
                className={`mr-2 ${theme === "dark" ? "text-dark-primary" : "text-light-primary"}`}
              />
              SMS
            </h2>
            <a
              href={content}
              className={`${
                theme === "dark" ? "text-dark-secondary" : "text-light-secondary"
              } hover:${
                theme === "dark" ? "text-dark-primary" : "text-light-primary"
              } underline text-lg font-sans`}
            >
              {content.replace("sms:", "")}
            </a>
          </div>
        );

      case "whatsapp":
        return (
          <div
            className={`w-full max-w-2xl rounded-2xl shadow-xl ${
              theme === "dark" ? "bg-dark-card/90" : "bg-light-card/90"
            } backdrop-blur-sm p-8 border ${
              theme === "dark" ? "border-dark-text-secondary/50" : "border-light-text-secondary/50"
            } text-center`}
          >
            <h2
              className={`text-xl font-semibold mb-4 flex items-center justify-center ${
                theme === "dark" ? "text-dark-text-primary" : "text-light-text-primary"
              } font-sans`}
            >
              <MessageSquare
                size={24}
                className={`mr-2 ${theme === "dark" ? "text-dark-primary" : "text-light-primary"}`}
              />
              WhatsApp
            </h2>
            <a
              href={content}
              target="_blank"
              rel="noopener noreferrer"
              className={`${
                theme === "dark" ? "text-dark-secondary" : "text-light-secondary"
              } hover:${
                theme === "dark" ? "text-dark-primary" : "text-light-primary"
              } underline text-lg font-sans`}
            >
              {content.replace("https://wa.me/", "")}
            </a>
          </div>
        );

      case "wifi": {
        const ssidMatch = content.match(/S:([^;]*)/);
        const passwordMatch = content.match(/P:([^;]*)/);
        const encryptionMatch = content.match(/T:([^;]*)/);
        const ssid = ssidMatch ? ssidMatch[1] : "";
        const password = passwordMatch ? passwordMatch[1] : "";
        const encryption = encryptionMatch ? encryptionMatch[1] : "WPA";
        return (
          <div
            className={`w-full max-w-2xl rounded-2xl shadow-xl ${
              theme === "dark" ? "bg-dark-card/90" : "bg-light-card/90"
            } backdrop-blur-sm p-8 border ${
              theme === "dark" ? "border-dark-text-secondary/50" : "border-light-text-secondary/50"
            } text-center`}
          >
            <h2
              className={`text-xl font-semibold mb-4 flex items-center justify-center ${
                theme === "dark" ? "text-dark-text-primary" : "text-light-text-primary"
              } font-sans`}
            >
              <Wifi
                size={24}
                className={`mr-2 ${theme === "dark" ? "text-dark-primary" : "text-light-primary"}`}
              />
              Connexion Wi-Fi
            </h2>
            <div className="space-y-3 text-lg font-sans">
              <p>
                <span
                  className={`font-bold ${
                    theme === "dark" ? "text-dark-text-primary" : "text-light-text-primary"
                  }`}
                >
                  Nom du réseau (SSID):
                </span>{" "}
                {ssid || "Non défini"}
              </p>
              <p>
                <span
                  className={`font-bold ${
                    theme === "dark" ? "text-dark-text-primary" : "text-light-text-primary"
                  }`}
                >
                  Mot de passe:
                </span>{" "}
                {password || "Aucun"}
              </p>
              <p>
                <span
                  className={`font-bold ${
                    theme === "dark" ? "text-dark-text-primary" : "text-light-text-primary"
                  }`}
                >
                  Sécurité:
                </span>{" "}
                {encryption || "Non défini"}
              </p>
            </div>
          </div>
        );
      }

      case "geo": {
        const coords = content.replace("geo:", "").split(",");
        const lat = coords[0] ? parseFloat(coords[0]) : null;
        const lng = coords[1] ? parseFloat(coords[1]) : null;
        return (
          <div
            className={`w-full max-w-2xl rounded-2xl shadow-xl ${
              theme === "dark" ? "bg-dark-card/90" : "bg-light-card/90"
            } backdrop-blur-sm p-8 border ${
              theme === "dark" ? "border-dark-text-secondary/50" : "border-light-text-secondary/50"
            } text-center`}
          >
            <h2
              className={`text-xl font-semibold mb-4 flex items-center justify-center ${
                theme === "dark" ? "text-dark-text-primary" : "text-light-text-primary"
              } font-sans`}
            >
              <MapPin
                size={24}
                className={`mr-2 ${theme === "dark" ? "text-dark-primary" : "text-light-primary"}`}
              />
              Géolocalisation
            </h2>
            <div className="space-y-3 text-lg font-sans">
              <p>
                <span
                  className={`font-bold ${
                    theme === "dark" ? "text-dark-text-primary" : "text-light-text-primary"
                  }`}
                >
                  Latitude:
                </span>{" "}
                {lat !== null ? lat : "Non défini"}
              </p>
              <p>
                <span
                  className={`font-bold ${
                    theme === "dark" ? "text-dark-text-primary" : "text-light-text-primary"
                  }`}
                >
                  Longitude:
                </span>{" "}
                {lng !== null ? lng : "Non défini"}
              </p>
              {lat !== null && lng !== null && (
                <a
                  href={`https://www.google.com/maps?q=${lat},${lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${
                    theme === "dark" ? "text-dark-secondary" : "text-light-secondary"
                  } hover:${
                    theme === "dark" ? "text-dark-primary" : "text-light-primary"
                  } underline font-sans`}
                >
                  Voir sur Google Maps
                </a>
              )}
            </div>
          </div>
        );
      }

      case "vcard": {
        const parseVCard = (vcard: string) => {
          const lines = vcard.split("\n");
          const vcardData: Record<string, string> = {};
          lines.forEach((line) => {
            const trimmed = line.trim();
            if (trimmed.startsWith("N:")) {
              const parts = trimmed.replace("N:", "").split(";");
              vcardData.lastName = parts[0] || "";
              vcardData.firstName = parts[1] || "";
              vcardData.middleName = parts[2] || "";
              vcardData.title = parts[3] || "";
            } else if (trimmed.startsWith("FN:")) {
              vcardData.fullName = trimmed.replace("FN:", "") || "";
            } else if (trimmed.startsWith("ORG:")) {
              vcardData.organization = trimmed.replace("ORG:", "") || "";
            } else if (trimmed.startsWith("TEL;TYPE=CELL:")) {
              vcardData.phone = trimmed.replace("TEL;TYPE=CELL:", "") || "";
            } else if (trimmed.startsWith("EMAIL:")) {
              vcardData.email = trimmed.replace("EMAIL:", "") || "";
            } else if (trimmed.startsWith("ADR;TYPE=WORK:")) {
              const parts = trimmed.replace("ADR;TYPE=WORK:", "").split(";");
              vcardData.poBox = parts[0] || "";
              vcardData.extendedAddress = parts[1] || "";
              vcardData.street = parts[2] || "";
              vcardData.city = parts[3] || "";
              vcardData.state = parts[4] || "";
              vcardData.zip = parts[5] || "";
              vcardData.country = parts[6] || "";
            }
          });
          return vcardData;
        };

        const vcardData = parseVCard(content);
        return (
          <div
            className={`w-full max-w-2xl rounded-2xl shadow-xl ${
              theme === "dark" ? "bg-dark-card/90" : "bg-light-card/90"
            } backdrop-blur-sm p-8 border ${
              theme === "dark" ? "border-dark-text-secondary/50" : "border-light-text-secondary/50"
            } text-center`}
          >
            <h2
              className={`text-xl font-semibold mb-4 flex items-center justify-center ${
                theme === "dark" ? "text-dark-text-primary" : "text-light-text-primary"
              } font-sans`}
            >
              <User
                size={24}
                className={`mr-2 ${theme === "dark" ? "text-dark-primary" : "text-light-primary"}`}
              />
              Carte de visite
            </h2>
            <div className="space-y-3 text-lg font-sans">
              {vcardData.fullName && (
                <p>
                  <span
                    className={`font-bold ${
                      theme === "dark" ? "text-dark-text-primary" : "text-light-text-primary"
                    }`}
                  >
                    Nom:
                  </span>{" "}
                  {vcardData.fullName}
                </p>
              )}
              {vcardData.phone && (
                <p>
                  <span
                    className={`font-bold ${
                      theme === "dark" ? "text-dark-text-primary" : "text-light-text-primary"
                    }`}
                  >
                    Téléphone:
                  </span>{" "}
                  <a
                    href={`tel:${vcardData.phone}`}
                    className={`${
                      theme === "dark" ? "text-dark-secondary" : "text-light-secondary"
                    } hover:${
                      theme === "dark" ? "text-dark-primary" : "text-light-primary"
                    } underline`}
                  >
                    {vcardData.phone}
                  </a>
                </p>
              )}
              {vcardData.email && (
                <p>
                  <span
                    className={`font-bold ${
                      theme === "dark" ? "text-dark-text-primary" : "text-light-text-primary"
                    }`}
                  >
                    Email:
                  </span>{" "}
                  <a
                    href={`mailto:${vcardData.email}`}
                    className={`${
                      theme === "dark" ? "text-dark-secondary" : "text-light-secondary"
                    } hover:${
                      theme === "dark" ? "text-dark-primary" : "text-light-primary"
                    } underline`}
                  >
                    {vcardData.email}
                  </a>
                </p>
              )}
              {vcardData.organization && (
                <p>
                  <span
                    className={`font-bold ${
                      theme === "dark" ? "text-dark-text-primary" : "text-light-text-primary"
                    }`}
                  >
                    Organisation:
                  </span>{" "}
                  {vcardData.organization}
                </p>
              )}
              {(vcardData.street || vcardData.city || vcardData.state || vcardData.zip || vcardData.country) && (
                <p>
                  <span
                    className={`font-bold ${
                      theme === "dark" ? "text-dark-text-primary" : "text-light-text-primary"
                    }`}
                  >
                    Adresse:
                  </span>{" "}
                  {[vcardData.street, vcardData.city, vcardData.state, vcardData.zip, vcardData.country]
                    .filter(Boolean)
                    .join(", ")}
                </p>
              )}
            </div>
          </div>
        );
      }

      default:
        return (
          <div
            className={`w-full max-w-2xl rounded-2xl shadow-xl ${
              theme === "dark" ? "bg-dark-card/90" : "bg-light-card/90"
            } backdrop-blur-sm p-8 border ${
              theme === "dark" ? "border-dark-text-secondary/50" : "border-light-text-secondary/50"
            } text-center`}
          >
            <h2
              className={`text-xl font-semibold mb-4 ${
                theme === "dark" ? "text-dark-text-primary" : "text-light-text-primary"
              } font-sans`}
            >
              Type non pris en charge
            </h2>
            <p
              className={`text-lg ${
                theme === "dark" ? "text-dark-text-secondary" : "text-light-text-secondary"
              } font-sans`}
            >
              Type de QR code non reconnu.
            </p>
          </div>
        );
    }
  };

  return (
    <div
      className={`min-h-screen flex flex-col items-center justify-center p-6 font-sans relative overflow-hidden ${
        theme === "dark"
          ? "bg-dark-background"
          : "bg-light-background"
      } bg-gradient-to-br ${
        theme === "dark"
          ? "from-dark-background to-dark-primary via-dark-secondary"
          : "from-light-background to-light-primary via-light-secondary"
      }`}
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
          theme === "dark" ? "bg-dark-card/90" : "bg-light-card/90"
        } backdrop-blur-sm p-8 text-center mb-6`}
      >
        <Link to="/" className="inline-flex items-center justify-center">
          <img
            src={theme === "dark" ? logo2Image : logoImage}
            alt="Bliic"
            style={{ width: "70px" }}
          />
        </Link>
        <h1
          className={`text-3xl font-bold ${
            theme === "dark" ? "text-dark-text-primary" : "text-light-text-primary"
          } mt-4 font-sans`}
        >
          Contenu du QR Code
        </h1>
      </div>
      <div className="w-full max-w-2xl relative z-10">{renderContent()}</div>
    </div>
  );
};

export default ShowText;