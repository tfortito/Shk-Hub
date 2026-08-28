"use client";

import Link from "next/link";
import { useLanguage } from "../i18n";
import {
  CURRENCY,
  DEMO_EMAIL,
  PRICING,
  FOUNDER_PROGRAM_ACTIVE,
  FOUNDER_SLOTS_LEFT,
  FOUNDER_PRICE,
} from "../pricing-config";
import { IconCheck, IconClock } from "../icons";

function formatPrice(price: number | null, lang: "de" | "en", customLabel: string, freeLabel: string) {
  if (price === null) return customLabel;
  if (price === 0) return freeLabel;
  return `${CURRENCY}${price}`;
}

export default function Pricing() {
  const { lang, t } = useLanguage();

  const tiers = [
    {
      key: "trial",
      copy: t.pricing.trial,
      price: PRICING.trial.price,
      href: "/",
      highlighted: false,
    },
    {
      key: "pro",
      copy: t.pricing.pro,
      price: PRICING.pro.price,
      href: `mailto:${DEMO_EMAIL}?subject=${encodeURIComponent("Stichtag – Business plan")}`,
      highlighted: true,
    },
    {
      key: "team",
      copy: t.pricing.team,
      price: PRICING.team.price,
      href: `mailto:${DEMO_EMAIL}?subject=${encodeURIComponent("Stichtag – Guild / multi-location")}`,
      highlighted: false,
    },
  ] as const;

  return (
    <main className="container" style={{ paddingBottom: 80 }}>
      <section className="hero" style={{ paddingBottom: 8 }}>
        <span className="eyebrow">{t.pricing.eyebrow}</span>
        <h1>{t.pricing.title}</h1>
        <p className="lede">{t.pricing.lede}</p>
      </section>

      {FOUNDER_PROGRAM_ACTIVE && FOUNDER_SLOTS_LEFT > 0 && (
        <div className="countdown-banner" style={{ marginBottom: 26 }}>
          <IconClock size={15} />
          {t.pricing.founderNote(FOUNDER_SLOTS_LEFT, FOUNDER_PRICE, CURRENCY)}
        </div>
      )}

      <div className="pricing-grid">
        {tiers.map((tier) => {
          const isMonthly = tier.price !== null && tier.price > 0;
          const priceLabel = formatPrice(tier.price, lang, t.pricing.custom, t.pricing.free);
          const isExternal = tier.href.startsWith("mailto:");
          return (
            <div key={tier.key} className={`pricing-card${tier.highlighted ? " highlighted" : ""}`}>
              {tier.highlighted && <span className="pricing-badge">{t.pricing.mostPopular}</span>}
              <p className="pricing-tier-name">{tier.copy.name}</p>
              <p className="pricing-tier-tagline">{tier.copy.tagline}</p>
              <div className="pricing-amount">
                <span className="pricing-number">{priceLabel}</span>
                {isMonthly && <span className="pricing-period">{t.pricing.perMonth}</span>}
              </div>
              <ul className="pricing-features">
                {tier.copy.features.map((f) => (
                  <li key={f}>
                    <IconCheck size={15} />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              {isExternal ? (
                <a href={tier.href} className={tier.highlighted ? "btn-primary" : "btn-secondary"} style={{ justifyContent: "center" }}>
                  {tier.copy.cta}
                </a>
              ) : (
                <Link href={tier.href} className={tier.highlighted ? "btn-primary" : "btn-secondary"} style={{ justifyContent: "center" }}>
                  {tier.copy.cta}
                </Link>
              )}
            </div>
          );
        })}
      </div>

      <p className="meta-line" style={{ maxWidth: 720 }}>
        {t.pricing.footerNote}
      </p>

      <footer className="site-footer">
        <p>{t.vergleich.footer}</p>
      </footer>
    </main>
  );
}
