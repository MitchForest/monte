import { redirect } from "next/navigation";

import { MarketingFaq } from "@/components/marketing/faq";
import { MarketingFeatures } from "@/components/marketing/features";
import { MarketingFooter } from "@/components/marketing/footer";
import { MarketingHeader } from "@/components/marketing/header";
import { MarketingHero } from "@/components/marketing/hero";
import { MarketingPricing } from "@/components/marketing/pricing";
import { MarketingSocialProof } from "@/components/marketing/social-proof";
import { getServerSession } from "@/lib/auth/session";

export default async function MarketingPage() {
  const session = await getServerSession();

  if (session) {
    redirect("/home");
  }

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
