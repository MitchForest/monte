import { MarketingAbout } from "@/components/marketing/about";
import { MarketingFaq } from "@/components/marketing/faq";
import { MarketingFeatures } from "@/components/marketing/features";
import { MarketingFooter } from "@/components/marketing/footer";
import { MarketingHeader } from "@/components/marketing/header";
import { MarketingHero } from "@/components/marketing/hero";
import { MarketingPricing } from "@/components/marketing/pricing";
export default function MarketingPage() {
  return (
    <div className="min-h-screen bg-background">
      <MarketingHeader />
      <main className="pb-24">
        <MarketingHero />
        <MarketingAbout />
        <MarketingFeatures />
        <MarketingPricing />
        <MarketingFaq />
      </main>
      <MarketingFooter />
    </div>
  );
}
