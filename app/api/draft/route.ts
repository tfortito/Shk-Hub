import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { checkTrial } from "../../lib/access";

export const runtime = "nodejs";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// This is the "Workflow" stretch: turn an already-grounded answer into a first
// useful output a Fachbetrieb can actually send, rather than stopping at Q&A.
const SYSTEM: Record<"de" | "en", string> = {
  de:
    "Du bist die Bürokraft eines SHK-Fachbetriebs und schreibst eine kurze, freundliche " +
    "E-Mail an einen Kunden, die die folgende, bereits recherchierte Antwort in einfache, " +
    "kundenfreundliche Sprache überträgt. Keine Fachbegriffe ohne kurze Erklärung. Erwähne " +
    "am Ende in einem Satz, dass dies keine Rechtsberatung ersetzt und Rückfragen gerne an " +
    "den Betrieb gerichtet werden können. Antworte AUSSCHLIESSLICH mit dem E-Mail-Text " +
    "(Anrede, Fließtext, Grußformel), ohne Betreffzeile, ohne Einleitung, ohne Erklärung.",
  en:
    "You are the office staff of a heating/plumbing trade business, writing a short, " +
    "friendly customer email that translates the following already-researched answer into " +
    "plain, customer-friendly language. No jargon without a brief explanation. End with one " +
    "sentence noting this isn't legal advice and questions are welcome. Reply ONLY with the " +
    "email body (greeting, text, sign-off) — no subject line, no preamble, no explanation.",
};

export async function POST(req: Request) {
  try {
    const { question, answer, lang: rawLang } = await req.json();
    if (!question || !answer || typeof answer !== "string") {
      return NextResponse.json({ error: "question and answer required" }, { status: 400 });
    }
    const lang: "de" | "en" = rawLang === "en" ? "en" : "de";

    // Reuses the same trial pool as /api/ask but doesn't burn an extra credit —
    // this is a follow-on action on an answer the visitor already paid a credit for.
    const trial = await checkTrial();
    if (!trial.allowed) {
      return NextResponse.json({ error: "trial exhausted", trialExhausted: true }, { status: 402 });
    }

    const msg = await client.messages.create({
      model: process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-5",
      max_tokens: 500,
      system: SYSTEM[lang],
      messages: [
        {
          role: "user",
          content: `Kundenfrage: ${question}\n\nRecherchierte Antwort:\n${answer}`,
        },
      ],
    });

    const draft = msg.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("");

    return NextResponse.json({ draft });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err?.message ?? "unknown error" }, { status: 500 });
  }
}
