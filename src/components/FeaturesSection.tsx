import { useState } from "react";
import { useTheme } from "../contexts/ThemeContext";
import { motion, AnimatePresence } from "framer-motion";
import { Globe, BarChart2, QrCode, FileUp } from "lucide-react";
import Analytics from "../assets/analytics.png"; // Placeholder for analytics image
import QrCodeImage from "../assets/qr.png"; // Placeholder for QR code image
import FileUploadImage from "../assets/file.png"; // Placeholder for file upload image
import GlobeImage from "../assets/link.png"; // Placeholder for globe image

const FeaturesSection = () => {
  const { theme } = useTheme();
  const [selectedFeature, setSelectedFeature] = useState<number | null>(null);

  const features = [
    {
      icon: (
        <Globe
          className={`w-8 h-8 ${
            theme === "dark" ? "text-dark-primary" : "text-light-primary"
          }`}
        />
      ),
      title: "Liens raccourcis et intelligents",
      description:
        "Transformez vos liens longs en URL courtes, claires et faciles à partager, en un clic.",
      image: GlobeImage, // Placeholder
    },
    {
      icon: (
        <QrCode
          className={`w-8 h-8 ${
            theme === "dark" ? "text-dark-primary" : "text-light-primary"
          }`}
        />
      ),
      title: "QR Codes personnalisables",
      description:
        "Créez des QR codes uniques à l’image de votre marque : logo, couleurs, formes et plus encore.",
      image: QrCodeImage, // Placeholder
    },
    {
      icon: (
        <BarChart2
          className={`w-8 h-8 ${
            theme === "dark" ? "text-dark-primary" : "text-light-primary"
          }`}
        />
      ),
      title: "Statistiques de vos liens",
      description:
        "Suivez chaque clic : localisation, appareil, navigateur, et performances en temps réel.",
      image: Analytics, // Placeholder
    },
    {
      icon: (
        <FileUp
          className={`w-8 h-8 ${
            theme === "dark" ? "text-dark-primary" : "text-light-primary"
          }`}
        />
      ),
      title: "Liens de fichiers à durée limitée",
      description:
        "Partagez vos fichiers en toute simplicité grâce à des liens sécurisés et personnalisables avec expiration.",
      image: FileUploadImage, // Placeholder
    },
  ];

  const handleFeatureClick = (index: number) => {
    setSelectedFeature(index === selectedFeature ? null : index);
  };

  return (
    <section
      className={`py-16 ${
        theme === "dark" ? "bg-dark-card/30" : "bg-light-card/30"
      }`}
    >
      <div className="container mx-auto px-4 max-w-7xl">
        <h2
          className={`text-3xl md:text-4xl font-bold text-center mb-12 ${
            theme === "dark"
              ? "text-dark-text-primary"
              : "text-light-text-primary"
          } font-sans animate-slide-up`}
        >
          Fonctionnalités Puissantes
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Features List */}
          <div className="space-y-4">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className={`p-4 rounded-lg cursor-pointer transition-all duration-300 ${
                  theme === "dark" ? "bg-dark-card/80" : "bg-light-card/80"
                } hover:bg-${
                  theme === "dark" ? "dark-primary/10" : "light-primary/10"
                } animate-slide-up`}
                style={{ animationDelay: `${index * 100}ms` }}
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
                }}
                whileHover={{ scale: 1.02 }}
                onClick={() => handleFeatureClick(index)}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-full ${
                      theme === "dark"
                        ? "bg-dark-primary/10"
                        : "bg-light-primary/10"
                    }`}
                  >
                    {feature.icon}
                  </div>
                  <h3
                    className={`text-lg font-semibold ${
                      theme === "dark"
                        ? "text-dark-text-primary"
                        : "text-light-text-primary"
                    } font-sans`}
                  >
                    {feature.title}
                  </h3>
                </div>
                <AnimatePresence>
                  {selectedFeature === index && (
                    <motion.p
                      className={`mt-2 text-sm ${
                        theme === "dark"
                          ? "text-dark-text-secondary"
                          : "text-light-text-secondary"
                      } font-sans`}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      {feature.description}
                    </motion.p>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>

          {/* Right: Feature Image */}
          <div className="flex justify-center items-center">
            <AnimatePresence mode="wait">
              <motion.img
                key={selectedFeature !== null ? features[selectedFeature].image : "default"}
                src={
                  selectedFeature !== null
                    ? features[selectedFeature].image
                    : features[0].image
                }
                alt={
                  selectedFeature !== null
                    ? features[selectedFeature].title
                    : "Fonctionnalité par défaut"
                }
                className={`rounded-lg shadow-xl max-w-full h-auto ${
                  theme === "dark"
                    ? "border-dark-text-secondary/50"
                    : "border-light-text-secondary/50"
                } border`}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
              />
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;