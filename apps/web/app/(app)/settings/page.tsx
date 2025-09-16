import { AppPageHeader } from "@/components/app/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const settingsAreas = [
  {
    title: "School profile",
    description: "Update branding, campus addresses, and term dates.",
  },
  {
    title: "Guides & staff",
    description: "Manage permissions, invite new teammates, and set roles.",
  },
  {
    title: "Family access",
    description: "Configure guardians, messaging preferences, and languages.",
  },
  {
    title: "Billing",
    description: "Review plan usage, invoices, and payment methods.",
  },
];

export default function SettingsPage() {
  return (
    <div className="flex flex-1 flex-col gap-8">
      <AppPageHeader
        breadcrumbs={[{ label: "Home", href: "/home" }, { label: "Settings" }]}
        description="Configure Monte to match the rhythms of your school."
        primaryAction={{ label: "Open billing", href: "/settings/billing" }}
        searchPlaceholder="Search settings"
        title="Settings"
      />

      <Card className="rounded-3xl border-border/60 bg-card/90 shadow-md">
        <CardHeader>
          <CardTitle className="font-semibold text-xl">Admin areas</CardTitle>
          <CardDescription>
            Jump into the sections you visit most frequently.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 text-muted-foreground text-sm md:grid-cols-2">
            {settingsAreas.map((area) => (
              <div
                className="rounded-2xl border border-border/40 bg-background/80 p-4"
                key={area.title}
              >
                <p className="font-medium text-foreground">{area.title}</p>
                <p className="mt-2 leading-relaxed">{area.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
