import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import NavLinks from "./nav-links";
import AuthNav from "./auth-nav";
import { LanguageProvider, LanguageSwitcher } from "./i18n";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Stichtag",
  description:
    "Stichtag: grounded, quellenbelegte Antworten zu Heizungsgesetz und Förderung für SHK-Fachbetriebe. Jede Antwort mit Beleg und Gültigkeitszeitraum.",
};

const clerkConfigured = Boolean(
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY
);

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" className={inter.variable}>
      <body>
        <LanguageProvider>
          <nav className="topnav no-print">
            <div className="topnav-inner">
              <Link href="/" className="brand">
                <span className="brand-mark">St</span>
                Stichtag
              </Link>
              <div className="topnav-right">
                <NavLinks />
                <AuthNav />
                <LanguageSwitcher />
              </div>
            </div>
          </nav>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  if (!clerkConfigured) {
    return <Shell>{children}</Shell>;
  }
  return (
    <ClerkProvider>
      <Shell>{children}</Shell>
    </ClerkProvider>
  );
}
