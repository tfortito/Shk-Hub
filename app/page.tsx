"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SignInButton } from "@clerk/nextjs";
import { useLanguage } from "./i18n";
import { DEMO_EMAIL } from "./pricing-config";
import { IconCheck, IconClock } from "./icons";
import HeroPreview from "./hero-preview";

const STEP_DOWN_DATE = "2027-02-01T00:00:00";
const CLERK_CONFIGURED = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

function useDaysUntil(iso: string): number | null {
  const [days, setDays] = useState<number | null>(null);
  useEffect(() => {
    const target = new Date(iso).getTime();
    const diff = target - Date.now();
    setDays(Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24))));
  }, [iso]);
  return days;
}

export default function Home() {
  const { lang, t } = useLanguage();
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [err, setErr] = useState<string | null>(null);
  const [active, setActive] = useState<number | null>(null);
  const [askedAt, setAskedAt] = useState<Date | null>(null);
  const [trialRemaining, setTrialRemaining] = useState<number | null>(null);
  const [trialExhausted, setTrialExhausted] = useState(false);
  const [draft, setDraft] = useState<string | null>(null);
  const [draftLoading, setDraftLoading] = useState(false);
  const [draftError, setDraftError] = useState<string | null>(null);

  const daysToStepDown = useDaysUntil(STEP_DOWN_DATE);

  async function ask(question: string) {
    setLoading(true);
    setErr(null);
    setData(null);
    setActive(null);
    setQ(question);
    setTrialExhausted(false);
    setDraft(null);
    setDraftError(null);
    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, lang }),
      });
      const json = await res.json();
      if (res.status === 402 || json.trialExhausted) {
        setTrialExhausted(true);
        return;
      }
      if (!res.ok) throw new Error(json.error ?? "Error");
      setData(json);
      setAskedAt(new Date());
      if (typeof json.trialRemaining === "number") setTrialRemaining(json.trialRemaining);
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function draftEmail() {
    if (!data) return;
    setDraftLoading(true);
    setDraftError(null);
    try {
      const res = await fetch("/api/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q, answer: data.answer, lang }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Error");
      setDraft(json.draft);
    } catch (e: any) {
      setDraftError(e.message);
    } finally {
      setDraftLoading(false);
    }
  }

  return (
    <main className="container" style={{ paddingBottom: 80 }}>
      <div className="hero-grid">
        <section className="hero">
          <span className="eyebrow">{t.home.eyebrow}</span>
          <h1>{t.home.title}</h1>
          <p className="lede">{t.home.lede}</p>
          <div className="trust-row no-print">
            {t.home.trustPoints.map((p) => (
              <span className="trust-pill" key={p}>
                <IconCheck size={13} />
                {p}
              </span>
            ))}
          </div>
          {daysToStepDown !== null && (
            <div className="countdown-banner no-print">
              <IconClock size={15} />
              <strong>
                {daysToStepDown} {t.home.countdownLabel}
              </strong>{" "}
              {t.home.countdownText}
            </div>
          )}
        </section>
        <HeroPreview />
      </div>

      <div className="how-it-works no-print">
        <p className="chip-label" style={{ marginBottom: 18 }}>
          {t.home.howItWorksLabel}
        </p>
        <div className="steps-row">
          {t.home.steps.map((s, i) => (
            <div className="step" key={s.title}>
              <span className="step-num">{i + 1}</span>
              <div>
                <p className="step-title">{s.title}</p>
                <p className="step-desc">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <p className="chip-label no-print" id="ask">{t.home.chipLabel}</p>
      <div className="chip-row no-print">
        {t.home.examples.map((ex) => (
          <button key={ex.label} onClick={() => ask(ex.q)} title={ex.why} className="chip">
            {ex.label}
          </button>
        ))}
      </div>

      <div className="ask-bar no-print">
        <input
          className="ask-input"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && q.trim() && ask(q)}
          placeholder={t.home.placeholder}
        />
        <button className="btn-primary" onClick={() => q.trim() && ask(q)} disabled={loading || !q.trim()}>
          {loading && <span className="spinner" />}
          {loading ? t.home.asking : t.home.ask}
        </button>
        {trialRemaining !== null && !trialExhausted && (
          <span className="trial-badge no-print">{t.home.trialBadge(trialRemaining)}</span>
        )}
      </div>

      {err && <div className="alert alert-danger no-print">{err}</div>}

      {trialExhausted && (
        <div className="trial-gate no-print">
          <h3>{t.home.trialExhaustedTitle}</h3>
          <p>{t.home.trialExhaustedBody}</p>
          {CLERK_CONFIGURED ? (
            <SignInButton mode="modal">
              <button className="btn-primary">{t.home.signInToContinue}</button>
            </SignInButton>
          ) : (
            <a
              className="btn-primary"
              href={`mailto:${DEMO_EMAIL}?subject=${encodeURIComponent("Stichtag – Zugang")}`}
            >
              {t.home.signInToContinue}
            </a>
          )}
        </div>
      )}

      {!data && !err && !loading && !trialExhausted && <div className="empty-state no-print">{t.home.emptyState}</div>}

      {data && !trialExhausted && (
        <>
          <div className="print-header">
            <p>
              Stichtag · {t.home.printGeneratedAt} {askedAt?.toLocaleString(lang === "en" ? "en-GB" : "de-DE")}
            </p>
            <p>
              <strong>{t.home.printQuestion}:</strong> {q}
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 400px", gap: 26, alignItems: "start" }}>
            <section>
              {data.spansPeriodBoundary && (
                <div className="alert alert-amber">
                  <strong>{t.home.periodWarningTitle}</strong> {t.home.periodWarningBody}
                </div>
              )}

              <div className="answer-card">{data.answer}</div>

              {data.citations.length === 0 && <div className="warn-line">{t.home.noCitations}</div>}

              <div className="answer-actions no-print" style={{ display: "flex", gap: 10 }}>
                <button className="btn-secondary" onClick={() => window.print()}>
                  {t.home.exportPdf}
                </button>
                <button className="btn-secondary" onClick={draftEmail} disabled={draftLoading}>
                  {draftLoading && <span className="spinner" style={{ borderColor: "rgba(20,20,15,0.2)", borderTopColor: "var(--ink)" }} />}
                  {draftLoading ? t.home.draftingEmail : t.home.draftEmail}
                </button>
              </div>

              {draftError && <div className="alert alert-danger no-print">{draftError}</div>}

              {draft && (
                <div className="draft-card no-print">
                  <p className="section-label">{t.home.draftEmailTitle}</p>
                  <div className="draft-text">{draft}</div>
                </div>
              )}

              <p className="meta-line">{t.home.metaLine(data.retrieved, data.citations.length)}</p>
            </section>

            <aside>
              <p className="section-label">{t.home.sources}</p>
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
                      <div style={{ color: "var(--ink-faint)", marginTop: 6, marginLeft: 28 }}>{c.paragraphRef}</div>
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
                      {t.home.validFrom} {c.validFrom ?? t.home.unknown}
                      {c.validUntil ? ` ${t.home.validUntil} ${c.validUntil}` : ` ${t.home.validUntilOngoing}`}
                      {superseded && ` · ${t.home.superseded}`}
                    </div>
                    <div style={{ marginTop: 10, marginLeft: 28, color: "var(--ink)", fontStyle: "italic", lineHeight: 1.5 }}>
                      {open ? c.fullText : `"${c.citedText.slice(0, 150)}${c.citedText.length > 150 ? "..." : ""}"`}
                    </div>
                    <div style={{ marginTop: 8, marginLeft: 28, fontSize: 11, color: "var(--ink-faint)" }}>
                      {open ? t.home.collapse : t.home.expand}
                    </div>
                  </div>
                );
              })}
            </aside>
          </div>
        </>
      )}

      <div className="faq-section no-print">
        <p className="chip-label" style={{ marginBottom: 18 }}>
          {t.home.faqLabel}
        </p>
        {t.home.faq.map((item) => (
          <details className="faq-item" key={item.q}>
            <summary>{item.q}</summary>
            <p>{item.a}</p>
          </details>
        ))}
      </div>

      <div className="closing-cta no-print">
        <h2>{t.home.closingTitle}</h2>
        <p>{t.home.closingSubtitle}</p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <a
            href="#ask"
            className="btn-primary"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById("ask")?.scrollIntoView({ behavior: "smooth" });
              document.querySelector<HTMLInputElement>(".ask-input")?.focus();
            }}
          >
            {t.home.closingCta}
          </a>
          <Link href="/pricing" className="btn-secondary">
            {t.home.closingSecondary}
          </Link>
        </div>
      </div>

      <footer className="site-footer no-print">
        <p>{t.home.footer}</p>
      </footer>
    </main>
  );
}
