import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import NavLinks from "./nav-links";
import { LanguageProvider, LanguageSwitcher } from "./i18n";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "SHK Förder-Assistent",
  description:
    "Grounded, quellenbelegte Antworten zu Heizungsgesetz und Förderung für SHK-Fachbetriebe. Jede Antwort mit Beleg und Gültigkeitszeitraum.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" className={inter.variable}>
      <body>
        <LanguageProvider>
          <nav className="topnav no-print">
            <div className="topnav-inner">
              <Link href="/" className="brand">
                <span className="brand-mark">SHK</span>
                Förder-Assistent
              </Link>
              <div className="topnav-right">
                <NavLinks />
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
