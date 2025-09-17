import type { Metadata } from "next";
import "./globals.css";
import { FontProvider } from "@/components/providers/font-provider";
import { QueryProvider } from "@/components/providers/query-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";

export const metadata: Metadata = {
  title: {
    template: "%s | Monte",
    default: "Monte — Montessori classroom management",
  },
  description:
    "Monte helps Montessori schools orchestrate classrooms, families, and observations in one place.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased bg-background text-foreground">
        <ThemeProvider>
          <FontProvider />
          <QueryProvider>{children}</QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
