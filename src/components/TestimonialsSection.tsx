import { useTheme } from "../contexts/ThemeContext";
import { motion } from "framer-motion";

const TestimonialsSection = () => {
  const { theme } = useTheme();

  const testimonials = [
    {
      name: "Sarah, Community Manager",
      text: "J'utilise Bliic pour tous mes QR codes et liens de campagne. Simple, rapide et efficace !",
      avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    },
    {
      name: "Yann, Entrepreneur",
      text: "Le suivi des clics et la personnalisation des QR codes m'ont permis d'augmenter mon taux de conversion.",
      avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    },
    {
      name: "Fatou, Agence Digitale",
      text: "Un outil indispensable pour mes clients ! L'équipe support est aussi très réactive.",
      avatar: "https://randomuser.me/api/portraits/women/65.jpg",
    },
    {
      name: "Amadou, Développeur Freelance",
      text: "Bliic simplifie le partage de mes projets avec des liens courts et des QR codes personnalisés. Top !",
      avatar: "https://randomuser.me/api/portraits/men/45.jpg",
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
    <section className="py-16">
      <div className="container mx-auto px-4 max-w-7xl">
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
          Ils nous font confiance
        </motion.h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              className={`relative rounded-2xl p-6 ${
                theme === "dark" ? "bg-dark-card/90" : "bg-light-card/90"
              } backdrop-blur-sm border ${
                theme === "dark"
                  ? "border-dark-text-secondary/50"
                  : "border-light-text-secondary/50"
              } transition-all duration-300 hover:shadow-xl hover:-translate-y-1`}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              custom={index}
              whileHover={{ scale: 1.05 }}
            >
              <div className="flex flex-col items-center text-center">
                <div className="relative mb-4">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className={`w-20 h-20 rounded-full border-4 ${
                      theme === "dark"
                        ? "border-dark-primary"
                        : "border-light-primary"
                    } transition-all duration-300 hover:border-${
                      theme === "dark" ? "dark-secondary" : "light-secondary"
                    }`}
                  />
                  <div
                    className={`absolute inset-0 rounded-full border-2 border-transparent hover:border-${
                      theme === "dark" ? "dark-secondary/50" : "light-secondary/50"
                    } transition-all duration-300`}
                  />
                </div>
                <p
                  className={`mb-4 text-base italic ${
                    theme === "dark"
                      ? "text-dark-text-secondary"
                      : "text-light-text-secondary"
                  } font-sans`}
                >
                  "{testimonial.text}"
                </p>
                <span
                  className={`font-semibold text-lg ${
                    theme === "dark"
                      ? "text-dark-primary"
                      : "text-light-primary"
                  } font-sans`}
                >
                  {testimonial.name}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;