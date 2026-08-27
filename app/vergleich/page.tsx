"use client";

import { useState } from "react";
import { useLanguage } from "../i18n";

export default function Vergleich() {
  const { lang, t } = useLanguage();
  const [q, setQ] = useState(t.vergleich.probes[0].q);
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
        body: JSON.stringify({ question, lang }),
      }).then((r) => r.json()),
      fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, lang }),
      }).then((r) => r.json()),
    ]);

    setLeft(u.status === "fulfilled" ? u.value : { error: t.vergleich.error });
    setRight(g.status === "fulfilled" ? g.value : { error: t.vergleich.error });
    setLoading(false);
  }

  return (
    <main className="container" style={{ paddingBottom: 80 }}>
      <section className="hero" style={{ paddingBottom: 0 }}>
        <span className="eyebrow">{t.vergleich.eyebrow}</span>
        <h1>{t.vergleich.title}</h1>
        <p className="lede">{t.vergleich.lede}</p>
      </section>

      <p className="chip-label">{t.vergleich.chipLabel}</p>
      <div className="chip-row">
        {t.vergleich.probes.map((p) => (
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
          {loading ? t.vergleich.running : t.vergleich.rerun}
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
        <strong>{t.vergleich.question}:</strong> {q}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <section>
          <p className="section-label" style={{ color: "var(--danger)" }}>
            {t.vergleich.withoutCorpus}
          </p>
          <div
            className="answer-card"
            style={{ border: "1px solid var(--danger-border)", minHeight: 200, fontSize: 14 }}
          >
            {left ? (left.error ?? left.answer) : loading ? "..." : t.vergleich.notRun}
          </div>
          <p className="meta-line">{t.vergleich.withoutCorpusMeta}</p>
        </section>

        <section>
          <p className="section-label" style={{ color: "var(--good)" }}>
            {t.vergleich.withCorpus}
          </p>
          <div
            className="answer-card"
            style={{ border: "1px solid var(--good-border)", minHeight: 200, fontSize: 14 }}
          >
            {right
              ? right.trialExhausted
                ? `${t.home.trialExhaustedTitle} ${t.home.trialExhaustedBody}`
                : right.error ?? right.answer
              : loading
              ? "..."
              : t.vergleich.notRun}
          </div>
          {right?.citations?.length > 0 && (
            <div style={{ marginTop: 12 }}>
              {right.citations.map((c: any, i: number) => (
                <div key={c.chunkId + i} style={{ fontSize: 12, color: "var(--ink-soft)", marginBottom: 6 }}>
                  <span className="citation-num" style={{ marginRight: 6 }}>
                    {i + 1}
                  </span>
                  {c.documentTitle}
                  {c.paragraphRef ? `, ${c.paragraphRef}` : ""} · {t.vergleich.validFrom}{" "}
                  {c.validFrom ?? t.vergleich.unknown}
                  {c.supersededBy ? ` · ${t.vergleich.superseded}` : ""}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <p className="meta-line" style={{ maxWidth: 720 }}>
        {t.vergleich.closing}
      </p>

      <footer className="site-footer">
        <p>{t.vergleich.footer}</p>
      </footer>
    </main>
  );
}
