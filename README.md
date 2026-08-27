# Stichtag

Grounded, source-cited Q&A over German heating regulation and subsidy rules, for
SHK Fachbetriebe. Every answer is tied to a specific passage in a specific
document and states which regulatory period that passage belongs to.

The name is German for "cutoff/deadline date" — it's not just a name, it's the
mechanic: the law has cutoff dates, and this product tracks them.

## Why validity dating is the product

German heating law moved twice in July 2026. The GModG replaced the GEG on
29 July 2026 and dropped the 65 percent renewables requirement. BEG funding
conditions were reset on 21 July 2026, with a further step-down on
1 February 2027.

A general assistant answers these questions from training data and cannot tell
you which version of the law its answer belongs to. This one refuses to answer
outside its corpus, and flags when retrieved passages span a regulatory change.

## English

The UI and the assistant's answers are available in German or English via the
switcher in the top nav (persisted per browser). The corpus itself stays
German-only — the source law is German — so an English question is translated
to a German search query for retrieval only; the answer is generated fresh in
English, grounded in the same cited German passages, with key legal terms kept
in German in parentheses on first use.

## Run it

```bash
npm install
cp .env.local.example .env.local   # add your Anthropic key
npm run dev
```

Ships with placeholder chunks so it runs immediately. Every placeholder is
marked `PLACEHOLDER` and has `sourceUrl: null`. **Do not demo on placeholder
data.**

## Load the real corpus

1. Download source PDFs from their official sources. Verify each is the current
   version. Put them in `corpus/raw/`.
2. `npm run ingest`
3. Open `corpus/needs-review.txt` and fill in `validFrom`, `validUntil` and
   `sourceUrl` for each chunk in `corpus/chunks.json`.

Step 3 is manual by design. The ingestion script never guesses a date, because
a confidently wrong validity period is worse than an absent one.

Intended corpus: GModG statute text, BEG-EM Förderrichtlinie, KfW 458 Merkblatt,
BAFA guidance on the July 2026 adjustment, kommunale Wärmeplanung deadlines,
hydraulischer Abgleich Verfahren B and Inbetriebnahmeprotokoll forms.

## What makes this sellable, not just a demo

- **A live countdown to the next regulatory cutoff** (1 February 2027 BEG
  step-down) on the homepage. It's the same validity-dating data already in
  the corpus, surfaced as urgency instead of buried in a citation.
- **Audit-ready export.** Every answer can be exported to PDF (print dialog,
  no extra dependency) with the question, timestamp, and full citations — a
  paper trail a Fachbetrieb can put in a customer file.
- **A demo-request CTA** in the nav, so a prospect looking at the live
  deployment has an immediate path to contact.
- **A free trial with a hard cap.** Anyone gets 5 free questions (tracked by
  an httpOnly cookie, `app/lib/access.ts`), then hits a sign-in wall. Change
  `FREE_TRIAL_QUESTIONS` in that file to adjust the number.
- **A pricing page** (`/pricing`) with three tiers you edit in one file —
  `app/pricing-config.ts` for the numbers, `app/i18n.tsx` (`pricing` key) for
  the copy. No payment processor wired up; the paid tiers' CTA is a mailto to
  you — this is meant for closing deals by hand, not self-serve checkout.
  Swap in real Stripe Checkout once you have a couple of customers.

### Turning on sign-in (Clerk)

Auth is optional and the app runs fine without it — the trial cap still
applies, there's just no way to sign back in past it yet. To enable it:

1. Create a free application at [clerk.com](https://clerk.com).
2. Copy its **Publishable key** and **Secret key** into `.env.local` (see
   `.env.local.example`) locally, and into the Vercel project's Environment
   Variables for production.
3. Redeploy. `middleware.ts` and `app/layout.tsx` both detect the keys at
   runtime and turn on Clerk's sign-in modal / user menu automatically —
   no other code changes needed.

## Deliberately out of scope

Copyrighted standards (VOB/B, DIN, DVGW) are excluded. A commercial product
would license them. This is a boundary, not a gap.

This is not legal or tax advice, and it does not transfer liability. It makes
the source visible and the check fast. The Meister still decides.

## Architecture

No vector database. The corpus is a few hundred passages, so keyword prefiltering
with German compound stemming selects ~20 candidates, which go to the Anthropic
Citations API as one document block each. Document index maps directly back to a
chunk, so every citation resolves to real source text rather than a paraphrase.

- `scripts/ingest.mjs` — PDF to dated chunks
- `app/api/ask/route.ts` — retrieval plus citations call, trial gating
- `app/page.tsx` — two-pane UI, answer left, resolvable sources right
- `app/lib/access.ts` — free-trial cookie counter and Clerk sign-in check
- `middleware.ts` — Clerk middleware, no-ops until Clerk keys are set
- `app/pricing/page.tsx` + `app/pricing-config.ts` — pricing page and its config
