import { LandingLayout } from "@/components/layout/LandingLayout";
import { HeroSection } from "@/components/layout/HeroSection";
import { FeatureSection } from "@/components/layout/FeatureSection";
import { PricingSection } from "@/components/layout/PricingSection";
import { ContactSection } from "@/components/layout/ContactSection";

export const metadata = {
  title: "VillainVault | The AI Edge in Professional Poker",
  description: "Master the table with Gemini-powered AI analysis, OCR automated notes, and GTO tactical guides.",
};

export default function LandingPage() {
  return (
    <LandingLayout>
      <HeroSection />
      <FeatureSection />
      <PricingSection />
      <ContactSection />
    </LandingLayout>
  );
}
