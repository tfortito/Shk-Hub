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
    <main style={{ maxWidth: 1180, margin: "0 auto", padding: "32px 24px 80px" }}>
      <header style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, margin: 0, fontWeight: 650 }}>SHK Förder-Assistent</h1>
        <p style={{ margin: "6px 0 0", color: "#6b6b64", fontSize: 14, maxWidth: 660 }}>
          Antworten ausschließlich aus hinterlegtem Regelwerk, mit Quellenangabe und
          Gültigkeitszeitraum. Was nicht im Korpus steht, wird nicht beantwortet.
        </p>
      </header>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 18 }}>
        {EXAMPLES.map((ex) => (
          <button
            key={ex.label}
            onClick={() => ask(ex.q)}
            title={ex.why}
            style={{
              padding: "7px 13px", fontSize: 13, borderRadius: 6, cursor: "pointer",
              border: "1px solid #d8d8d2", background: "#fff", color: "#1a1a18",
            }}
          >
            {ex.label}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 26 }}>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && q.trim() && ask(q)}
          placeholder="Frage zu GModG, BEG oder Antragstellung..."
          style={{
            flex: 1, padding: "11px 13px", fontSize: 15, borderRadius: 6,
            border: "1px solid #d8d8d2", background: "#fff",
          }}
        />
        <button
          onClick={() => q.trim() && ask(q)}
          disabled={loading || !q.trim()}
          style={{
            padding: "11px 22px", fontSize: 15, borderRadius: 6, border: "none",
            background: loading ? "#9a9a92" : "#1a1a18", color: "#fff",
            cursor: loading ? "default" : "pointer",
          }}
        >
          {loading ? "..." : "Fragen"}
        </button>
      </div>

      {err && (
        <div style={{ padding: 14, background: "#fde8e4", borderRadius: 6, fontSize: 14 }}>{err}</div>
      )}

      {data && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 400px", gap: 26, alignItems: "start" }}>
          <section>
            {data.spansPeriodBoundary && (
              <div
                style={{
                  padding: "11px 14px", marginBottom: 16, borderRadius: 6, fontSize: 14,
                  background: "#fff4d6", border: "1px solid #e8cf8a",
                }}
              >
                <strong>Rechtsstand beachten.</strong> Die Antwort stützt sich auf Passagen
                aus unterschiedlichen Gültigkeitszeiträumen. Prüfen Sie, welcher Stand für
                Ihren Auftrag gilt.
              </div>
            )}

            <div style={{ background: "#fff", border: "1px solid #e4e4de", borderRadius: 8, padding: "20px 22px", fontSize: 15, lineHeight: 1.65, whiteSpace: "pre-wrap" }}>
              {data.answer}
            </div>

            {data.citations.length === 0 && (
              <p style={{ fontSize: 13, color: "#8a6d3b", marginTop: 12 }}>
                Keine Quellenangabe: Der Assistent konnte die Frage nicht aus dem Korpus
                beantworten.
              </p>
            )}

            <p style={{ fontSize: 12, color: "#8b8b83", marginTop: 14 }}>
              {data.retrieved} Passagen geprüft, {data.citations.length} zitiert. Keine
              Rechtsberatung. Verbindlich sind die Originaldokumente.
            </p>
          </section>

          <aside>
            <h2 style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: ".07em", color: "#8b8b83", margin: "0 0 10px" }}>
              Quellen
            </h2>
            {data.citations.map((c: any, i: number) => {
              const superseded = Boolean(c.supersededBy);
              const open = active === i;
              return (
                <div
                  key={c.chunkId + i}
                  onClick={() => setActive(open ? null : i)}
                  style={{
                    background: "#fff", borderRadius: 7, padding: "13px 15px", marginBottom: 9,
                    cursor: "pointer", fontSize: 13,
                    border: superseded ? "1px solid #e0a89a" : "1px solid #e4e4de",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                    <strong style={{ fontWeight: 600 }}>
                      [{i + 1}] {c.documentTitle}
                    </strong>
                  </div>
                  {c.paragraphRef && (
                    <div style={{ color: "#6b6b64", marginTop: 3 }}>{c.paragraphRef}</div>
                  )}
                  <div style={{ marginTop: 6, fontSize: 12, color: superseded ? "#a4432a" : "#5c7a52" }}>
                    Gültig ab {c.validFrom ?? "unbekannt"}
                    {c.validUntil ? ` bis ${c.validUntil}` : " (laufend)"}
                    {superseded && " · ERSETZT"}
                  </div>
                  <div style={{ marginTop: 9, color: "#3a3a35", fontStyle: "italic", lineHeight: 1.5 }}>
                    {open ? c.fullText : `"${c.citedText.slice(0, 150)}${c.citedText.length > 150 ? "..." : ""}"`}
                  </div>
                  <div style={{ marginTop: 7, fontSize: 11, color: "#9a9a92" }}>
                    {open ? "Klicken zum Einklappen" : "Klicken für vollständige Passage"}
                  </div>
                </div>
              );
            })}
          </aside>
        </div>
      )}
    </main>
  );
}
