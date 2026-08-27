"use client";

import { useState } from "react";

const EXAMPLES = [
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
];

const TRUST_POINTS = [
  "Nur belegte Quellen",
  "Gültigkeitszeitraum je Passage",
  "Kein Raten außerhalb des Korpus",
];

export default function Home() {
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [err, setErr] = useState<string | null>(null);
  const [active, setActive] = useState<number | null>(null);

  async function ask(question: string) {
    setLoading(true);
    setErr(null);
    setData(null);
    setActive(null);
    setQ(question);
    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Fehler");
      setData(json);
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="container" style={{ paddingBottom: 80 }}>
      <section className="hero">
        <span className="eyebrow">GModG &amp; BEG · Stand Juli 2026</span>
        <h1>Antworten zu Heizungsgesetz &amp; Förderung, jede Zeile mit Beleg.</h1>
        <p className="lede">
          Ausschließlich aus hinterlegtem Regelwerk, mit Quellenangabe und
          Gültigkeitszeitraum. Was nicht im Korpus steht, wird nicht
          beantwortet &ndash; statt geraten.
        </p>
        <div className="trust-row">
          {TRUST_POINTS.map((t) => (
            <span className="trust-pill" key={t}>
              <span className="dot" />
              {t}
            </span>
          ))}
        </div>
      </section>

      <p className="chip-label">Beispiel-Fragen</p>
      <div className="chip-row">
        {EXAMPLES.map((ex) => (
          <button key={ex.label} onClick={() => ask(ex.q)} title={ex.why} className="chip">
            {ex.label}
          </button>
        ))}
      </div>

      <div className="ask-bar">
        <input
          className="ask-input"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && q.trim() && ask(q)}
          placeholder="Frage zu GModG, BEG oder Antragstellung..."
        />
        <button className="btn-primary" onClick={() => q.trim() && ask(q)} disabled={loading || !q.trim()}>
          {loading && <span className="spinner" />}
          {loading ? "Prüft Korpus..." : "Fragen"}
        </button>
      </div>

      {err && <div className="alert alert-danger">{err}</div>}

      {!data && !err && !loading && (
        <div className="empty-state">
          Stellen Sie eine Frage oder wählen Sie ein Beispiel oben. Die Antwort
          erscheint hier zusammen mit den zitierten Quellenpassagen.
        </div>
      )}

      {data && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 400px", gap: 26, alignItems: "start" }}>
          <section>
            {data.spansPeriodBoundary && (
              <div className="alert alert-amber">
                <strong>Rechtsstand beachten.</strong> Die Antwort stützt sich auf
                Passagen aus unterschiedlichen Gültigkeitszeiträumen. Prüfen Sie,
                welcher Stand für Ihren Auftrag gilt.
              </div>
            )}

            <div className="answer-card">{data.answer}</div>

            {data.citations.length === 0 && (
              <div className="warn-line">
                Keine Quellenangabe: Der Assistent konnte die Frage nicht aus dem
                Korpus beantworten.
              </div>
            )}

            <p className="meta-line">
              {data.retrieved} Passagen geprüft, {data.citations.length} zitiert.
              Keine Rechtsberatung. Verbindlich sind die Originaldokumente.
            </p>
          </section>

          <aside>
            <p className="section-label">Quellen</p>
            {data.citations.map((c: any, i: number) => {
              const superseded = Boolean(c.supersededBy);
              const open = active === i;
              return (
                <div
                  key={c.chunkId + i}
                  onClick={() => setActive(open ? null : i)}
                  className={`citation-card${superseded ? " superseded" : ""}`}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span className="citation-num">{i + 1}</span>
                    <strong style={{ fontWeight: 650 }}>{c.documentTitle}</strong>
                  </div>
                  {c.paragraphRef && (
                    <div style={{ color: "var(--ink-faint)", marginTop: 6, marginLeft: 28 }}>
                      {c.paragraphRef}
                    </div>
                  )}
                  <div
                    style={{
                      marginTop: 8,
                      marginLeft: 28,
                      fontSize: 12,
                      fontWeight: 600,
                      color: superseded ? "var(--danger)" : "var(--good)",
                    }}
                  >
                    Gültig ab {c.validFrom ?? "unbekannt"}
                    {c.validUntil ? ` bis ${c.validUntil}` : " (laufend)"}
                    {superseded && " · ERSETZT"}
                  </div>
                  <div style={{ marginTop: 10, marginLeft: 28, color: "var(--ink)", fontStyle: "italic", lineHeight: 1.5 }}>
                    {open ? c.fullText : `"${c.citedText.slice(0, 150)}${c.citedText.length > 150 ? "..." : ""}"`}
                  </div>
                  <div style={{ marginTop: 8, marginLeft: 28, fontSize: 11, color: "var(--ink-faint)" }}>
                    {open ? "Klicken zum Einklappen" : "Klicken für vollständige Passage"}
                  </div>
                </div>
              );
            })}
          </aside>
        </div>
      )}

      <footer className="site-footer">
        <p>
          SHK Förder-Assistent · Keine Rechtsberatung · Verbindlich sind stets die
          Originaldokumente. Der Meister entscheidet.
        </p>
      </footer>
    </main>
  );
}
