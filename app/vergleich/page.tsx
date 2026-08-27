"use client";

import { useState } from "react";

const PROBES = [
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
];

export default function Vergleich() {
  const [q, setQ] = useState(PROBES[0].q);
  const [loading, setLoading] = useState(false);
  const [left, setLeft] = useState<any>(null);
  const [right, setRight] = useState<any>(null);

  async function run(question: string) {
    setLoading(true);
    setLeft(null);
    setRight(null);
    setQ(question);

    // Fire both at once so the Loom does not have dead air.
    const [u, g] = await Promise.allSettled([
      fetch("/api/ungrounded", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      }).then((r) => r.json()),
      fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      }).then((r) => r.json()),
    ]);

    setLeft(u.status === "fulfilled" ? u.value : { error: "Fehler" });
    setRight(g.status === "fulfilled" ? g.value : { error: "Fehler" });
    setLoading(false);
  }

  return (
    <main className="container" style={{ paddingBottom: 80 }}>
      <section className="hero" style={{ paddingBottom: 0 }}>
        <span className="eyebrow">Direktvergleich</span>
        <h1>Warum allgemeine KI hier gefährlich ist</h1>
        <p className="lede">
          Dieselbe Frage, zweimal gestellt. Links ein allgemeiner Assistent ohne
          Regelwerk. Rechts derselbe Assistent, aber ausschließlich auf Basis
          der hinterlegten Originaldokumente, mit Quellenangabe und
          Gültigkeitsdatum.
        </p>
      </section>

      <p className="chip-label">Testfragen</p>
      <div className="chip-row">
        {PROBES.map((p) => (
          <button key={p.label} onClick={() => run(p.q)} title={p.note} className="chip">
            {p.label}
          </button>
        ))}
        <button
          onClick={() => run(q)}
          disabled={loading}
          className="btn-secondary"
          style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
        >
          {loading && <span className="spinner" style={{ borderColor: "rgba(20,20,15,0.2)", borderTopColor: "var(--ink)" }} />}
          {loading ? "läuft..." : "Erneut ausführen"}
        </button>
      </div>

      <div
        style={{
          fontSize: 14,
          marginBottom: 22,
          padding: "13px 16px",
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-sm)",
          boxShadow: "var(--shadow-sm)",
        }}
      >
        <strong>Frage:</strong> {q}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <section>
          <p className="section-label" style={{ color: "var(--danger)" }}>
            Ohne Regelwerk
          </p>
          <div
            className="answer-card"
            style={{ border: "1px solid var(--danger-border)", minHeight: 200, fontSize: 14 }}
          >
            {left ? (left.error ?? left.answer) : loading ? "..." : "Noch nicht ausgeführt."}
          </div>
          <p className="meta-line">Keine Quelle. Kein Gültigkeitsdatum. Nicht überprüfbar.</p>
        </section>

        <section>
          <p className="section-label" style={{ color: "var(--good)" }}>
            Mit Regelwerk
          </p>
          <div
            className="answer-card"
            style={{ border: "1px solid var(--good-border)", minHeight: 200, fontSize: 14 }}
          >
            {right ? (right.error ?? right.answer) : loading ? "..." : "Noch nicht ausgeführt."}
          </div>
          {right?.citations?.length > 0 && (
            <div style={{ marginTop: 12 }}>
              {right.citations.map((c: any, i: number) => (
                <div key={c.chunkId + i} style={{ fontSize: 12, color: "var(--ink-soft)", marginBottom: 6 }}>
                  <span className="citation-num" style={{ marginRight: 6 }}>
                    {i + 1}
                  </span>
                  {c.documentTitle}
                  {c.paragraphRef ? `, ${c.paragraphRef}` : ""} · gültig ab{" "}
                  {c.validFrom ?? "unbekannt"}
                  {c.supersededBy ? " · ERSETZT" : ""}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <p className="meta-line" style={{ maxWidth: 720 }}>
        Der linke Assistent wird nicht künstlich benachteiligt. Er erhält
        dieselbe Frage ohne Zusatzanweisung. Der Unterschied entsteht allein
        dadurch, dass er die aktuelle Rechtslage nicht kennt und das nicht
        wissen kann.
      </p>

      <footer className="site-footer">
        <p>
          SHK Förder-Assistent · Keine Rechtsberatung · Verbindlich sind stets
          die Originaldokumente. Der Meister entscheidet.
        </p>
      </footer>
    </main>
  );
}
