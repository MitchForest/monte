import Link from "next/link";

import { MarketingLogo } from "@/components/marketing/logo";

const footerLinks = [
  {
    title: "Product",
    links: [
      { label: "Overview", href: "#features" },
      { label: "Pricing", href: "#pricing" },
      { label: "Security", href: "/security" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Careers", href: "/careers" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Guides", href: "/guides" },
      { label: "Community", href: "/community" },
      { label: "Support", href: "/support" },
    ],
  },
];

export function MarketingFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-24 bg-muted/40">
      <div className="mx-auto max-w-6xl px-4 py-16 md:px-6">
        <div className="grid gap-10 md:grid-cols-[1.25fr_1fr_1fr_1fr]">
          <div className="space-y-4">
            <MarketingLogo className="px-0" />
            <p className="max-w-xs text-muted-foreground text-sm leading-relaxed">
              Monte is the calm operating system for Montessori schools who
              believe every child deserves a prepared environment.
            </p>
          </div>
          {footerLinks.map((section) => (
            <div className="space-y-3" key={section.title}>
              <h3 className="font-semibold text-foreground text-sm">
                {section.title}
              </h3>
              <ul className="space-y-2 text-muted-foreground text-sm">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      className="transition-colors hover:text-foreground"
                      href={link.href}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-col gap-4 border-border/60 border-t pt-6 text-muted-foreground text-sm md:flex-row md:items-center md:justify-between">
          <p>© {currentYear} Monte Labs. All rights reserved.</p>
          <div className="flex flex-wrap gap-4">
            <Link
              className="transition-colors hover:text-foreground"
              href="/privacy"
            >
              Privacy
            </Link>
            <Link
              className="transition-colors hover:text-foreground"
              href="/terms"
            >
              Terms
            </Link>
            <Link
              className="transition-colors hover:text-foreground"
              href="/status"
            >
              Status
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
