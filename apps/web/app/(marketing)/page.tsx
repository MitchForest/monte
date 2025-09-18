import { MarketingFaq } from "@/components/marketing/faq";
import { MarketingFeatures } from "@/components/marketing/features";
import { MarketingFooter } from "@/components/marketing/footer";
import { MarketingHeader } from "@/components/marketing/header";
import { MarketingHero } from "@/components/marketing/hero";
import { MarketingPricing } from "@/components/marketing/pricing";
import { MarketingSocialProof } from "@/components/marketing/social-proof";
export default function MarketingPage() {
  return (
    <div className="min-h-screen bg-background">
      <MarketingHeader />
      <main className="pb-24">
        <MarketingHero />
        <MarketingSocialProof />
        <MarketingFeatures />
        <MarketingPricing />
        <MarketingFaq />
      </main>
      <MarketingFooter />
    </div>
  );
}
