"use client";

import { useLanguage } from "./i18n";
import { IconCheck } from "./icons";

const COPY = {
  de: {
    label: "Beispielhafte Antwort",
    question: "Muss eine neu eingebaute Heizung zu 65 Prozent mit erneuerbaren Energien betrieben werden?",
    answer: "Nein — seit dem 29. Juli 2026 entfällt diese Pflicht.",
    doc: "GModG",
    validity: "Gültig ab 2026-07-29 (laufend)",
    quote:
      "„...entfällt die Pflicht, dass neu eingebaute Heizungen zu mindestens 65 Prozent mit erneuerbaren Energien betrieben werden...“",
  },
  en: {
    label: "Example answer",
    question: "Does a newly installed heating system have to run on 65% renewable energy?",
    answer: "No — since 29 July 2026 this requirement no longer applies.",
    doc: "GModG",
    validity: "Valid from 2026-07-29 (ongoing)",
    quote:
      '"...the requirement that newly installed heating systems must run on at least 65% renewable energy is eliminated..."',
  },
};

export default function HeroPreview() {
  const { lang } = useLanguage();
  const c = COPY[lang];

  return (
    <div className="hero-preview no-print" aria-hidden="true">
      <span className="hero-preview-label">{c.label}</span>
      <div className="hero-preview-card">
        <p className="hero-preview-q">{c.question}</p>
        <p className="hero-preview-a">{c.answer}</p>
      </div>
      <div className="hero-preview-citation">
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <span className="citation-num">1</span>
          <strong style={{ fontWeight: 650, fontSize: 12.5 }}>{c.doc}</strong>
          <IconCheck size={13} />
        </div>
        <div className="hero-preview-validity">{c.validity}</div>
        <div className="hero-preview-quote">{c.quote}</div>
      </div>
    </div>
  );
}
