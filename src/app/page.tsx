import { LandingLayout } from "@/components/layout/LandingLayout";
import { HeroSection } from "@/components/layout/HeroSection";
import { FeatureSection } from "@/components/layout/FeatureSection";
import { PricingSection } from "@/components/layout/PricingSection";
import { ContactSection } from "@/components/layout/ContactSection";

export const metadata = {
  title: "Villiant Vault | Két Sắt + Bộ Não AI Cho Poker",
  description: "Giảm leak, tăng edge, exploit đúng người đúng lúc. Villiant Vault — két sắt AI đầu tiên cho poker của bạn.",
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
