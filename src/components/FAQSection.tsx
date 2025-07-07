import { useState } from "react";
import { useTheme } from "../contexts/ThemeContext";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus } from "lucide-react";

const FAQSection = () => {
  const { theme } = useTheme();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: "Qu'est-ce que Bliic ?",
      answer:
        "Bliic est une plateforme de raccourcissement d'URL qui vous permet de créer des liens courts, de générer des QR codes personnalisés, de suivre les analytiques, et de partager des fichiers de manière sécurisée.",
    },
    {
      question: "Le plan gratuit est-il suffisant ?",
      answer:
        "Le plan gratuit est idéal pour les utilisateurs occasionnels, avec 10 liens par mois, des QR codes standards, et un partage de fichiers jusqu'à 5MB. Pour des fonctionnalités avancées, passez à un plan Premium.",
    },
    {
      question: "Puis-je utiliser mon propre domaine ?",
      answer:
        "Oui, avec les plans Premium, vous pouvez connecter vos propres domaines pour personnaliser vos liens et renforcer votre marque.",
    },
    {
      question: "Comment fonctionne l'analytique ?",
      answer:
        "L'analytique de Bliic suit les clics, les données géographiques, et les informations sur les appareils pour chaque lien, vous offrant des insights détaillés sur les performances de vos campagnes.",
    },

    // {
    //   question: "Mes liens sont-ils sécurisés ?",
    //   answer:
    //     "Oui, chaque lien créé avec Bliic est généré via un protocole sécurisé HTTPS. Vous pouvez également définir une date d'expiration ou limiter l'accès à certains liens.",
    // },
    // {
    //   question: "Puis-je personnaliser l’apparence de mes QR codes ?",
    //   answer:
    //     "Absolument ! Avec les options avancées, vous pouvez choisir la couleur, la forme des pixels, et même ajouter votre logo au centre du QR code.",
    // },
    // {
    //   question: "Quelles sont les limitations du partage de fichiers ?",
    //   answer:
    //     "En version gratuite, vous pouvez partager jusqu’à 5 Mo par fichier. Les utilisateurs Premium bénéficient d’une capacité étendue et de la gestion de l’expiration ou du nombre de téléchargements.",
    // },
    // {
    //   question: "Comment suivre la performance de mes liens ?",
    //   answer:
    //     "Rendez-vous dans votre tableau de bord pour visualiser les clics en temps réel, les localisations géographiques, les appareils utilisés, et plus encore.",
    // },
    // {
    //   question: "Puis-je modifier l’URL d’un lien après sa création ?",
    //   answer:
    //     "Non, une fois le lien généré, il n’est pas modifiable. En revanche, vous pouvez en créer un nouveau à partir de l’original.",
    // },
    // {
    //   question: "Bliic propose-t-il une API ?",
    //   answer:
    //     "Oui, une API REST est disponible pour automatiser la création de liens, QR codes et le suivi des statistiques. Elle est accessible à partir du plan Pro.",
    // },
    // {
    //   question: "Comment supprimer un lien ou un fichier partagé ?",
    //   answer:
    //     "Vous pouvez supprimer un lien ou un fichier depuis votre tableau de bord à tout moment. La suppression est immédiate et irréversible.",
    // },
    // {
    //   question: "Puis-je créer des liens avec alias personnalisés ?",
    //   answer:
    //     "Cette fonctionnalité est réservée aux utilisateurs Premium et Pro. Vous pourrez définir un mot-clé ou une structure personnalisée au lieu d’un code aléatoire.",
    // },
    // {
    //   question: "Comment puis-je contacter le support ?",
    //   answer:
    //     "Une assistance est disponible via le chat intégré ou par e-mail. Les abonnés Premium bénéficient d’un support prioritaire.",
    // },
    // {
    //   question:
    //     "Y a-t-il une limite au nombre de QR codes que je peux générer ?",
    //   answer:
    //     "En plan gratuit, la génération est limitée à 10 QR codes par mois. Les plans payants suppriment cette limite et permettent la personnalisation complète.",
    // },
  ];

  const handleToggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1, duration: 0.3 },
    }),
  };

  return (
    <section
      className={`py-16 ${
        theme === "dark" ? "bg-dark-background" : "bg-light-background"
      } bg-gradient-to-br ${
        theme === "dark"
          ? "from-dark-background to-dark-primary/20 via-dark-secondary/20"
          : "from-light-background to-light-primary/20 via-light-secondary/20"
      }`}
    >
      <style>
        {`
          .faq-card {
            transition: transform 0.3s ease, box-shadow 0.3s ease;
            perspective: 1000px;
          }
          .faq-card:hover {
            transform: translateY(-4px) rotateX(2deg) rotateY(2deg);
            box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2),
                        0 0 20px ${
                          theme === "dark"
                            ? "rgba(234, 179, 8, 0.3)"
                            : "rgba(124, 58, 237, 0.3)"
                        };
          }
          .faq-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            border-radius: 1rem;
            padding: 2px;
            background: linear-gradient(
              45deg,
              ${theme === "dark" ? "#eab308" : "#7c3aed"},
              ${theme === "dark" ? "#7c3aed" : "#eab308"}
            );
            -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
            -webkit-mask-composite: xor;
            mask-composite: exclude;
            opacity: 0;
            transition: opacity 0.3s ease;
            z-index: -1;
          }
          .faq-card:hover::before {
            opacity: 1;
          }
          .faq-icon {
            transition: transform 0.3s ease;
          }
          .faq-card.active .faq-icon {
            transform: rotate(180deg);
          }
          .pulse {
            animation: pulse 1.5s ease-in-out infinite;
          }
          @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.1); }
          }
        `}
      </style>
      <div className="container mx-auto px-4 max-w-4xl">
        <motion.h2
          className={`text-3xl md:text-4xl font-bold text-center mb-12 ${
            theme === "dark"
              ? "text-dark-text-primary"
              : "text-light-text-primary"
          } font-sans`}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Questions Fréquemment Posées
        </motion.h2>
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              className={`faq-card relative rounded-2xl ${
                theme === "dark" ? "bg-dark-card/10" : "bg-light-card/10"
              } backdrop-blur-sm p-6 cursor-pointer overflow-hidden ${
                openIndex === index ? "active" : ""
              }`}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              custom={index}
              whileHover={{ scale: 1.02 }}
              onClick={() => handleToggle(index)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === "Space") {
                  e.preventDefault();
                  handleToggle(index);
                }
              }}
              tabIndex={0}
              role="button"
              aria-expanded={openIndex === index}
              aria-controls={`faq-answer-${index}`}
            >
              <div className="flex justify-between items-center">
                <h3
                  className={`text-xl font-semibold ${
                    theme === "dark"
                      ? "text-dark-text-primary"
                      : "text-light-text-primary"
                  } font-sans`}
                >
                  {faq.question}
                </h3>
                <div
                  className={`faq-icon p-2 rounded-full ${
                    theme === "dark"
                      ? "bg-dark-primary/10 text-dark-primary"
                      : "bg-light-primary/10 text-light-primary"
                  } ${openIndex === index ? "pulse" : ""}`}
                >
                  <motion.div
                    animate={{ rotate: openIndex === index ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {openIndex === index ? (
                      <Minus size={20} />
                    ) : (
                      <Plus size={20} />
                    )}
                  </motion.div>
                </div>
              </div>
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    id={`faq-answer-${index}`}
                    role="region"
                    aria-labelledby={`faq-question-${index}`}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <p
                      className={`mt-4 text-base ${
                        theme === "dark"
                          ? "text-dark-text-secondary"
                          : "text-light-text-secondary"
                      } font-sans`}
                    >
                      {faq.answer}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
