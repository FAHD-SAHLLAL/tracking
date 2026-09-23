import type { Metadata } from "next";
import { DM_Sans, Fraunces } from "next/font/google";
import { Providers } from "@/hooks/use-habits";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-heading",
});

export const metadata: Metadata = {
  title: {
    default: "Rythme — Suivi d'habitudes",
    template: "%s · Rythme",
  },
  description:
    "Suivez vos habitudes avec des séries timezone-aware, un calendrier honnête et des stats utiles.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3421"),
  openGraph: {
    title: "Rythme",
    description: "Des habitudes tenables, sans vanity metrics.",
    locale: "fr_FR",
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" className={`${dmSans.variable} ${fraunces.variable} h-full`}>
      <body className="min-h-full font-sans antialiased">
        <Providers>
          {children}
          <Toaster richColors closeButton position="top-center" />
        </Providers>
      </body>
    </html>
  );
}
