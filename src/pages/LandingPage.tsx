import HeroSection from "../components/HeroSection";
import FeaturesSection from "../components/FeaturesSection";
import TestimonialsSection from "../components/TestimonialsSection";
import PricingSection from "../components/PricingSection";
import FAQSection from "../components/FAQSection";
import CTASection from "../components/CTASection";
import WhyChooseUsSection from "../components/WhyChooseUsSection";
import ComparisonSection from "../components/ComparisonSection";

const LandingPage = () => {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <HeroSection />

      {/* Features */}
      <FeaturesSection />

      {/* Why Choose Us */}
      <WhyChooseUsSection />

      {/* Testimonials */}
      {/* <TestimonialsSection /> */}

      {/* Pricing */}
      <PricingSection />

      {/* comparison */}
      <ComparisonSection />

      {/* FAQ */}
      <FAQSection />

      {/* CTA */}
      <CTASection />
    </div>
  );
};

export default LandingPage;
