"use client";

import { useMemo, useState } from "react";

import { AppPageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";

type SettingsSectionId =
  | "profile"
  | "classroom"
  | "notifications"
  | "integrations"
  | "permissions";

const sections: {
  id: SettingsSectionId;
  title: string;
  description: string;
}[] = [
  {
    id: "profile",
    title: "Profile",
    description:
      "Update your name, avatar, and time zone for accurate records.",
  },
  {
    id: "classroom",
    title: "Classroom setup",
    description: "Configure cohorts, planes, and work cycle timing.",
  },
  {
    id: "notifications",
    title: "Notifications",
    description: "Choose how Monte nudges you about summaries and tasks.",
  },
  {
    id: "integrations",
    title: "Integrations",
    description: "Connect SIS, attendance, and messaging tools.",
  },
  {
    id: "permissions",
    title: "Permissions",
    description: "Manage guide access and family viewing rights.",
  },
];

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState<SettingsSectionId | null>(
    null,
  );

  const activeCopy = useMemo(() => {
    return sections.find((section) => section.id === activeSection) ?? null;
  }, [activeSection]);

  const closeSheet = () => setActiveSection(null);

  return (
    <div className="flex flex-1 flex-col gap-8">
      <AppPageHeader
        breadcrumbs={[{ label: "Guide" }, { label: "Settings" }]}
        description="Tune Monte to match the rituals of your classroom and school."
        title="Settings"
      />

      <Card className="rounded-3xl border-border/60 bg-card/80 shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-foreground">
            Control center
          </CardTitle>
          <CardDescription>
            Each section opens in a minimal side drawer so you can adjust one
            thing at a time.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {sections.map((section) => (
              <button
                key={section.id}
                className="flex flex-col gap-2 rounded-2xl border border-border/60 bg-background/70 p-5 text-left transition hover:border-primary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                onClick={() => setActiveSection(section.id)}
                type="button"
              >
                <span className="text-sm font-semibold text-foreground">
                  {section.title}
                </span>
                <span className="text-sm text-muted-foreground">
                  {section.description}
                </span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Sheet
        onOpenChange={(open) => (!open ? closeSheet() : null)}
        open={Boolean(activeSection)}
      >
        <SheetContent className="sm:max-w-lg" side="right">
          {activeCopy ? (
            <>
              <SheetHeader>
                <SheetTitle>{activeCopy.title}</SheetTitle>
                <SheetDescription>{activeCopy.description}</SheetDescription>
              </SheetHeader>
              <div className="flex-1 space-y-6 overflow-y-auto px-4 pb-4">
                {activeCopy.id === "profile" ? <ProfileForm /> : null}
                {activeCopy.id === "classroom" ? <ClassroomForm /> : null}
                {activeCopy.id === "notifications" ? (
                  <NotificationForm />
                ) : null}
                {activeCopy.id === "integrations" ? <IntegrationsForm /> : null}
                {activeCopy.id === "permissions" ? <PermissionsForm /> : null}
              </div>
              <SheetFooter>
                <Button onClick={closeSheet} type="button" variant="ghost">
                  Cancel
                </Button>
                <Button type="button">Save changes</Button>
              </SheetFooter>
            </>
          ) : null}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function ProfileForm() {
  return (
    <div className="space-y-4">
      <label className="flex flex-col gap-2 text-sm" htmlFor="profile-name">
        <span className="font-medium text-foreground">Full name</span>
        <Input id="profile-name" placeholder="Your name" />
      </label>
      <label className="flex flex-col gap-2 text-sm" htmlFor="profile-timezone">
        <span className="font-medium text-foreground">Time zone</span>
        <select
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          id="profile-timezone"
          defaultValue="America/New_York"
        >
          <option value="America/New_York">Eastern</option>
          <option value="America/Chicago">Central</option>
          <option value="America/Denver">Mountain</option>
          <option value="America/Los_Angeles">Pacific</option>
        </select>
      </label>
      <label className="flex flex-col gap-2 text-sm" htmlFor="profile-bio">
        <span className="font-medium text-foreground">Montessori focus</span>
        <Textarea id="profile-bio" placeholder="Share your speciality" />
      </label>
    </div>
  );
}

function ClassroomForm() {
  return (
    <div className="space-y-4">
      <label className="flex flex-col gap-2 text-sm" htmlFor="classroom-name">
        <span className="font-medium text-foreground">Primary classroom</span>
        <Input id="classroom-name" placeholder="e.g. Primary West" />
      </label>
      <label className="flex flex-col gap-2 text-sm" htmlFor="classroom-cycle">
        <span className="font-medium text-foreground">Work cycle start</span>
        <Input id="classroom-cycle" type="time" />
      </label>
      <label className="flex flex-col gap-2 text-sm" htmlFor="classroom-notes">
        <span className="font-medium text-foreground">Notes</span>
        <Textarea id="classroom-notes" placeholder="Add reminders for guides" />
      </label>
    </div>
  );
}

function NotificationForm() {
  return (
    <div className="space-y-4">
      <fieldset className="space-y-2 text-sm">
        <legend className="font-medium text-foreground">Daily digest</legend>
        <label className="flex items-center justify-between gap-4">
          <span className="text-muted-foreground">Morning summary</span>
          <select className="rounded-lg border border-border bg-background px-3 py-1 text-sm outline-none focus:ring-2 focus:ring-ring">
            <option value="email">Email</option>
            <option value="push">Push</option>
            <option value="off">Off</option>
          </select>
        </label>
        <label className="flex items-center justify-between gap-4">
          <span className="text-muted-foreground">
            Parent summary reminders
          </span>
          <select className="rounded-lg border border-border bg-background px-3 py-1 text-sm outline-none focus:ring-2 focus:ring-ring">
            <option value="same-day">Same day</option>
            <option value="end-of-day">End of day</option>
            <option value="off">Off</option>
          </select>
        </label>
      </fieldset>
    </div>
  );
}

function IntegrationsForm() {
  return (
    <div className="space-y-4 text-sm text-muted-foreground">
      <p className="text-foreground font-medium">Connected systems</p>
      <div className="rounded-2xl border border-border/60 bg-background/70 p-4">
        <p className="font-medium text-foreground">
          Student information system
        </p>
        <p className="text-sm text-muted-foreground">Not connected</p>
        <Button className="mt-3" size="sm" type="button">
          Connect SIS
        </Button>
      </div>
      <div className="rounded-2xl border border-border/60 bg-background/70 p-4">
        <p className="font-medium text-foreground">Messaging</p>
        <p className="text-sm text-muted-foreground">Not connected</p>
        <Button className="mt-3" size="sm" type="button" variant="outline">
          Connect Twilio
        </Button>
      </div>
    </div>
  );
}

function PermissionsForm() {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-border/60 bg-background/70 p-4">
        <p className="text-sm font-medium text-foreground">Guide access</p>
        <p className="text-xs text-muted-foreground">
          Guides can create observations, tasks, and parent summaries.
        </p>
      </div>
      <div className="rounded-2xl border border-border/60 bg-background/70 p-4">
        <p className="text-sm font-medium text-foreground">Family viewing</p>
        <p className="text-xs text-muted-foreground">
          Families see XP progress, approved observations, and scheduled
          lessons.
        </p>
      </div>
      <label
        className="flex items-center justify-between gap-4 text-sm"
        htmlFor="permissions-inbox"
      >
        <span className="text-muted-foreground">Enable parent replies</span>
        <select
          className="rounded-lg border border-border bg-background px-3 py-1 text-sm outline-none focus:ring-2 focus:ring-ring"
          id="permissions-inbox"
          defaultValue="moderated"
        >
          <option value="moderated">Moderated</option>
          <option value="open">Open</option>
          <option value="off">Off</option>
        </select>
      </label>
    </div>
  );
}
