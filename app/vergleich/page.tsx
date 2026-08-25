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

  const panel = {
    background: "#fff",
    borderRadius: 8,
    padding: "18px 20px",
    fontSize: 14,
    lineHeight: 1.6,
    whiteSpace: "pre-wrap" as const,
    minHeight: 200,
  };

  return (
    <main style={{ maxWidth: 1180, margin: "0 auto", padding: "32px 24px 80px" }}>
      <h1 style={{ fontSize: 22, margin: 0, fontWeight: 650 }}>
        Warum allgemeine KI hier gefährlich ist
      </h1>
      <p style={{ margin: "6px 0 22px", color: "#6b6b64", fontSize: 14, maxWidth: 720 }}>
        Dieselbe Frage, zweimal gestellt. Links ein allgemeiner Assistent ohne
        Regelwerk. Rechts derselbe Assistent, aber ausschließlich auf Basis der
        hinterlegten Originaldokumente, mit Quellenangabe und Gültigkeitsdatum.
      </p>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
        {PROBES.map((p) => (
          <button
            key={p.label}
            onClick={() => run(p.q)}
            title={p.note}
            style={{
              padding: "7px 13px", fontSize: 13, borderRadius: 6, cursor: "pointer",
              border: "1px solid #d8d8d2", background: "#fff",
            }}
          >
            {p.label}
          </button>
        ))}
        <button
          onClick={() => run(q)}
          disabled={loading}
          style={{
            padding: "7px 16px", fontSize: 13, borderRadius: 6, border: "none",
            background: loading ? "#9a9a92" : "#1a1a18", color: "#fff",
            cursor: loading ? "default" : "pointer",
          }}
        >
          {loading ? "läuft..." : "Erneut ausführen"}
        </button>
      </div>

      <div style={{ fontSize: 14, marginBottom: 18, padding: "10px 14px", background: "#efefe9", borderRadius: 6 }}>
        <strong>Frage:</strong> {q}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <section>
          <h2 style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: ".07em", color: "#a4432a", margin: "0 0 9px" }}>
            Ohne Regelwerk
          </h2>
          <div style={{ ...panel, border: "1px solid #e0a89a" }}>
            {left ? (left.error ?? left.answer) : loading ? "..." : "Noch nicht ausgeführt."}
          </div>
          <p style={{ fontSize: 12, color: "#8b8b83", marginTop: 9 }}>
            Keine Quelle. Kein Gültigkeitsdatum. Nicht überprüfbar.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: ".07em", color: "#5c7a52", margin: "0 0 9px" }}>
            Mit Regelwerk
          </h2>
          <div style={{ ...panel, border: "1px solid #b8ccb0" }}>
            {right ? (right.error ?? right.answer) : loading ? "..." : "Noch nicht ausgeführt."}
          </div>
          {right?.citations?.length > 0 && (
            <div style={{ marginTop: 10 }}>
              {right.citations.map((c: any, i: number) => (
                <div key={c.chunkId + i} style={{ fontSize: 12, color: "#5b5b54", marginBottom: 5 }}>
                  [{i + 1}] {c.documentTitle}
                  {c.paragraphRef ? `, ${c.paragraphRef}` : ""} · gültig ab{" "}
                  {c.validFrom ?? "unbekannt"}
                  {c.supersededBy ? " · ERSETZT" : ""}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <p style={{ fontSize: 12, color: "#8b8b83", marginTop: 26, maxWidth: 720 }}>
        Der linke Assistent wird nicht künstlich benachteiligt. Er erhält dieselbe
        Frage ohne Zusatzanweisung. Der Unterschied entsteht allein dadurch, dass
        er die aktuelle Rechtslage nicht kennt und das nicht wissen kann.
      </p>
    </main>
  );
}
