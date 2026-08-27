"use client";

import { createContext, useContext, useEffect, useState } from "react";

export type Lang = "de" | "en";

interface Example {
  label: string;
  q: string;
  why: string;
}

interface Probe {
  label: string;
  q: string;
  note: string;
}

interface HomeDict {
  eyebrow: string;
  title: string;
  lede: string;
  trustPoints: string[];
  countdownLabel: string;
  countdownText: string;
  chipLabel: string;
  examples: Example[];
  placeholder: string;
  ask: string;
  asking: string;
  emptyState: string;
  periodWarningTitle: string;
  periodWarningBody: string;
  noCitations: string;
  metaLine: (retrieved: number, cited: number) => string;
  sources: string;
  validFrom: string;
  validUntilOngoing: string;
  validUntil: string;
  superseded: string;
  unknown: string;
  collapse: string;
  expand: string;
  exportPdf: string;
  printQuestion: string;
  printGeneratedAt: string;
  footer: string;
}

interface VergleichDict {
  eyebrow: string;
  title: string;
  lede: string;
  chipLabel: string;
  probes: Probe[];
  rerun: string;
  running: string;
  question: string;
  withoutCorpus: string;
  withCorpus: string;
  notRun: string;
  withoutCorpusMeta: string;
  validFrom: string;
  superseded: string;
  unknown: string;
  error: string;
  closing: string;
  footer: string;
}

interface Dict {
  nav: { assistant: string; vergleich: string; demo: string };
  home: HomeDict;
  vergleich: VergleichDict;
}

const dict: Record<Lang, Dict> = {
  de: {
    nav: { assistant: "Assistent", vergleich: "Vergleich", demo: "Demo anfragen" },
    home: {
      eyebrow: "GModG & BEG · Stand Juli 2026",
      title: "Antworten zu Heizungsgesetz & Förderung, jede Zeile mit Beleg.",
      lede:
        "Ausschließlich aus hinterlegtem Regelwerk, mit Quellenangabe und Gültigkeitszeitraum. Was nicht im Korpus steht, wird nicht beantwortet – statt geraten.",
      trustPoints: ["Nur belegte Quellen", "Gültigkeitszeitraum je Passage", "Kein Raten außerhalb des Korpus"],
      countdownLabel: "Tage",
      countdownText: "bis zur nächsten Förderabsenkung am 1. Februar 2027 – hat Ihr Kunde bis dahin unterschrieben?",
      chipLabel: "Beispiel-Fragen",
      examples: [
        {
          label: "Gilt die 65-Prozent-Regel noch?",
          q: "Muss eine neu eingebaute Heizung zu 65 Prozent mit erneuerbaren Energien betrieben werden?",
          why: "Rechtslage seit Juli 2026 geändert. Allgemeine Modelle antworten hier falsch.",
        },
        {
          label: "Wie hoch ist der Zuschuss aktuell?",
          q: "Wie hoch ist der Zuschuss für den Heizungstausch und welche förderfähigen Kosten werden für die erste Wohneinheit berücksichtigt?",
          why: "Konditionen wurden am 21. Juli 2026 neu gesetzt.",
        },
        {
          label: "Was ändert sich 2027?",
          q: "Ändert sich die Heizungsförderung im Februar 2027?",
          why: "Relevant für jedes Angebot mit Fertigstellung nach dem Stichtag.",
        },
        {
          label: "Frage außerhalb des Korpus",
          q: "Welche Abstände zur Grundstücksgrenze muss ich beim Aufstellen einer Außeneinheit einhalten?",
          why: "Nicht im Korpus. Der Assistent muss ablehnen statt zu raten.",
        },
      ],
      placeholder: "Frage zu GModG, BEG oder Antragstellung...",
      ask: "Fragen",
      asking: "Prüft Korpus...",
      emptyState:
        "Stellen Sie eine Frage oder wählen Sie ein Beispiel oben. Die Antwort erscheint hier zusammen mit den zitierten Quellenpassagen.",
      periodWarningTitle: "Rechtsstand beachten.",
      periodWarningBody:
        "Die Antwort stützt sich auf Passagen aus unterschiedlichen Gültigkeitszeiträumen. Prüfen Sie, welcher Stand für Ihren Auftrag gilt.",
      noCitations: "Keine Quellenangabe: Der Assistent konnte die Frage nicht aus dem Korpus beantworten.",
      metaLine: (retrieved: number, cited: number) =>
        `${retrieved} Passagen geprüft, ${cited} zitiert. Keine Rechtsberatung. Verbindlich sind die Originaldokumente.`,
      sources: "Quellen",
      validFrom: "Gültig ab",
      validUntilOngoing: "(laufend)",
      validUntil: "bis",
      superseded: "ERSETZT",
      unknown: "unbekannt",
      collapse: "Klicken zum Einklappen",
      expand: "Klicken für vollständige Passage",
      exportPdf: "Als PDF exportieren",
      printQuestion: "Frage",
      printGeneratedAt: "Erstellt am",
      footer: "SHK Förder-Assistent · Keine Rechtsberatung · Verbindlich sind stets die Originaldokumente. Der Meister entscheidet.",
    },
    vergleich: {
      eyebrow: "Direktvergleich",
      title: "Warum allgemeine KI hier gefährlich ist",
      lede:
        "Dieselbe Frage, zweimal gestellt. Links ein allgemeiner Assistent ohne Regelwerk. Rechts derselbe Assistent, aber ausschließlich auf Basis der hinterlegten Originaldokumente, mit Quellenangabe und Gültigkeitsdatum.",
      chipLabel: "Testfragen",
      probes: [
        {
          label: "65-Prozent-Regel",
          q: "Muss eine neu eingebaute Heizung zu 65 Prozent mit erneuerbaren Energien betrieben werden?",
          note: "Anforderung entfallen mit Inkrafttreten des GModG am 29.07.2026.",
        },
        {
          label: "Förderhöhe",
          q: "Wie hoch ist der Zuschuss für den Heizungstausch und bis zu welchen förderfähigen Kosten für die erste Wohneinheit?",
          note: "Konditionen am 21.07.2026 neu gesetzt.",
        },
        {
          label: "Beratungspflicht",
          q: "Muss ich meinen Kunden vor dem Einbau einer neuen Gasheizung verpflichtend beraten lassen?",
          note: "Verpflichtende Beratung mit dem GModG entfallen.",
        },
      ],
      rerun: "Erneut ausführen",
      running: "läuft...",
      question: "Frage",
      withoutCorpus: "Ohne Regelwerk",
      withCorpus: "Mit Regelwerk",
      notRun: "Noch nicht ausgeführt.",
      withoutCorpusMeta: "Keine Quelle. Kein Gültigkeitsdatum. Nicht überprüfbar.",
      validFrom: "gültig ab",
      superseded: "ERSETZT",
      unknown: "unbekannt",
      error: "Fehler",
      closing:
        "Der linke Assistent wird nicht künstlich benachteiligt. Er erhält dieselbe Frage ohne Zusatzanweisung. Der Unterschied entsteht allein dadurch, dass er die aktuelle Rechtslage nicht kennt und das nicht wissen kann.",
      footer: "SHK Förder-Assistent · Keine Rechtsberatung · Verbindlich sind stets die Originaldokumente. Der Meister entscheidet.",
    },
  },
  en: {
    nav: { assistant: "Assistant", vergleich: "Comparison", demo: "Request a demo" },
    home: {
      eyebrow: "GModG & BEG · As of July 2026",
      title: "Answers on German heating law & subsidies, every line with a citation.",
      lede:
        "Sourced exclusively from the stored regulatory corpus, with a citation and validity period on every claim. What isn't in the corpus doesn't get answered — instead of guessed.",
      trustPoints: ["Cited sources only", "Validity period per passage", "No guessing outside the corpus"],
      countdownLabel: "days",
      countdownText: "until the next funding step-down on 1 February 2027 — will your customer have signed by then?",
      chipLabel: "Example questions",
      examples: [
        {
          label: "Is the 65% rule still in force?",
          q: "Does a newly installed heating system have to run on 65 percent renewable energy?",
          why: "The law changed in July 2026. General-purpose models get this wrong.",
        },
        {
          label: "What's the current subsidy amount?",
          q: "What is the subsidy for a heating system replacement, and what eligible costs apply to the first residential unit?",
          why: "Conditions were reset on 21 July 2026.",
        },
        {
          label: "What changes in 2027?",
          q: "Does heating subsidy change in February 2027?",
          why: "Relevant for any quote completing after that cutoff.",
        },
        {
          label: "A question outside the corpus",
          q: "What clearance from the property boundary is required when installing an outdoor unit?",
          why: "Not in the corpus. The assistant must decline rather than guess.",
        },
      ],
      placeholder: "Ask about GModG, BEG, or applying for funding...",
      ask: "Ask",
      asking: "Checking corpus...",
      emptyState:
        "Ask a question or pick an example above. The answer will appear here together with the cited source passages.",
      periodWarningTitle: "Check which legal status applies.",
      periodWarningBody:
        "This answer draws on passages from different validity periods. Check which status applies to your job.",
      noCitations: "No citation: the assistant could not answer this from the corpus.",
      metaLine: (retrieved: number, cited: number) =>
        `${retrieved} passages checked, ${cited} cited. Not legal advice. The original documents are binding.`,
      sources: "Sources",
      validFrom: "Valid from",
      validUntilOngoing: "(ongoing)",
      validUntil: "until",
      superseded: "SUPERSEDED",
      unknown: "unknown",
      collapse: "Click to collapse",
      expand: "Click for the full passage",
      exportPdf: "Export as PDF",
      printQuestion: "Question",
      printGeneratedAt: "Generated on",
      footer: "SHK Förder-Assistent · Not legal advice · The original documents are always binding. The Meister decides.",
    },
    vergleich: {
      eyebrow: "Head-to-head",
      title: "Why a general-purpose AI is dangerous here",
      lede:
        "The same question, asked twice. On the left, a general assistant with no regulatory corpus. On the right, the same assistant, but grounded exclusively in the stored source documents, with a citation and validity date.",
      chipLabel: "Test questions",
      probes: [
        {
          label: "65% rule",
          q: "Does a newly installed heating system have to run on 65 percent renewable energy?",
          note: "Requirement dropped when the GModG took effect on 29 July 2026.",
        },
        {
          label: "Subsidy amount",
          q: "What is the subsidy for a heating system replacement, and up to what eligible costs for the first residential unit?",
          note: "Conditions were reset on 21 July 2026.",
        },
        {
          label: "Mandatory advice",
          q: "Am I required to formally advise my customer before installing a new gas heater?",
          note: "Mandatory advice requirement dropped with the GModG.",
        },
      ],
      rerun: "Run again",
      running: "running...",
      question: "Question",
      withoutCorpus: "Without regulatory corpus",
      withCorpus: "With regulatory corpus",
      notRun: "Not yet run.",
      withoutCorpusMeta: "No source. No validity date. Not verifiable.",
      validFrom: "valid from",
      superseded: "SUPERSEDED",
      unknown: "unknown",
      error: "Error",
      closing:
        "The left assistant is not artificially handicapped. It gets the same question with no extra instructions. The difference comes purely from the fact that it doesn't know the current legal status, and can't.",
      footer: "SHK Förder-Assistent · Not legal advice · The original documents are always binding. The Meister decides.",
    },
  },
};

const LangContext = createContext<{
  lang: Lang;
  setLang: (l: Lang) => void;
  t: Dict;
}>({ lang: "de", setLang: () => {}, t: dict.de });

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("de");

  useEffect(() => {
    const stored = window.localStorage.getItem("shk-lang");
    if (stored === "en" || stored === "de") setLangState(stored);
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  function setLang(l: Lang) {
    setLangState(l);
    window.localStorage.setItem("shk-lang", l);
  }

  return <LangContext.Provider value={{ lang, setLang, t: dict[lang] }}>{children}</LangContext.Provider>;
}

export function useLanguage() {
  return useContext(LangContext);
}

export function LanguageSwitcher() {
  const { lang, setLang } = useLanguage();
  return (
    <div className="lang-switch" role="group" aria-label="Language">
      <button
        className={`lang-btn${lang === "de" ? " active" : ""}`}
        onClick={() => setLang("de")}
        aria-pressed={lang === "de"}
      >
        DE
      </button>
      <button
        className={`lang-btn${lang === "en" ? " active" : ""}`}
        onClick={() => setLang("en")}
        aria-pressed={lang === "en"}
      >
        EN
      </button>
    </div>
  );
}
