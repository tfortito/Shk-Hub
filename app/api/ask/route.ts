import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";
import { checkTrial, commitTrialUse } from "../../lib/access";

export const runtime = "nodejs";

type Chunk = {
  id: string;
  documentTitle: string;
  documentShortName: string;
  paragraphRef: string | null;
  text: string;
  validFrom: string | null;
  validUntil: string | null;
  sourceUrl: string | null;
  supersededBy: string | null;
};

const chunks: Chunk[] = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), "corpus", "chunks.json"), "utf8")
);

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// German compounds mean plain token matching misses badly: "Foerderfaehigkeit"
// must hit "foerderfaehig". Crude stemming beats a vector DB at this corpus size.
const STOP = new Set([
  "der","die","das","und","oder","ist","sind","ein","eine","einen","fuer","mit",
  "von","dem","den","des","im","in","auf","bei","zu","wie","was","wann","welche",
  "muss","kann","darf","noch","nicht","es","ich","wir","sie","the","a","an","is",
  "are","for","of","to","what","when","which","does","do",
]);

function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss");
}

function stems(s: string): string[] {
  return normalize(s)
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length > 3 && !STOP.has(t))
    .map((t) => t.slice(0, 7)); // prefix stem, catches most compound variants
}

function retrieve(question: string, k = 20): Chunk[] {
  const q = stems(question);
  if (q.length === 0) return chunks.slice(0, k);

  const scored = chunks.map((c) => {
    const hay = normalize(`${c.documentTitle} ${c.paragraphRef ?? ""} ${c.text}`);
    let score = 0;
    for (const t of q) {
      // count occurrences, with diminishing returns
      const hits = hay.split(t).length - 1;
      if (hits > 0) score += 1 + Math.log(hits);
    }
    return { c, score };
  });

  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, k)
    .map((s) => s.c);
}

function validityLabel(c: Chunk): string {
  const from = c.validFrom ?? "unbekannt";
  const until = c.validUntil ?? "laufend";
  const superseded = c.supersededBy ? ` ERSETZT DURCH: ${c.supersededBy}.` : "";
  return `Gueltig von ${from} bis ${until}.${superseded}`;
}

const SYSTEM_BASE = `Du beantwortest Fragen zu deutschem Gebaeuderecht und zur Heizungsfoerderung fuer SHK-Fachbetriebe.

Regeln, ausnahmslos:

1. Antworte AUSSCHLIESSLICH aus den mitgelieferten Dokumenten. Nutze niemals Hintergrundwissen zum deutschen Gebaeuderecht, auch nicht wenn du dir sicher bist. Dein Trainingswissen zu diesem Thema ist mit hoher Wahrscheinlichkeit veraltet.

2. Wenn die Dokumente die Frage nicht beantworten, sage das klar und benenne, welche Information fehlt. Gib KEINE Teilantwort mit Absicherungsformel. Eine ehrliche Absage ist hier mehr wert als eine wahrscheinliche Antwort.

3. Jede inhaltliche Aussage braucht eine Quellenangabe.

4. Der Kontext jedes Dokuments nennt seinen Gueltigkeitszeitraum. Wenn die relevanten Dokumente unterschiedliche Zeitraeume betreffen, sage AUSDRUECKLICH welcher Zeitraum gilt und dass sich die Rechtslage geaendert hat. Antworte niemals stillschweigend nur fuer den aktuellen Stand.

5. Wenn ein relevantes Dokument als ERSETZT markiert ist, weise darauf hin.

6. Wenn eine kuenftige Absenkung oder Fristaenderung in den Dokumenten steht und fuer die Frage relevant sein koennte, nenne sie.`;

const LANGUAGE_RULE: Record<"de" | "en", string> = {
  de: "7. Antworte auf Deutsch.",
  en:
    "7. Antworte auf Englisch, unabhaengig von der Sprache der Frage oder der Quelldokumente. Die Quelldokumente " +
    "sind auf Deutsch; uebersetze praezise und nenne zentrale Rechts- und Foerderbegriffe beim ersten Vorkommen " +
    "zusaetzlich auf Deutsch in Klammern, z.B. \"renewables requirement (Erneuerbare-Energien-Pflicht)\".",
};

function buildSystem(lang: "de" | "en"): string {
  return `${SYSTEM_BASE}\n\n${LANGUAGE_RULE[lang]}`;
}

const NO_MATCH: Record<"de" | "en", string> = {
  de: "Dazu finde ich nichts im hinterlegten Regelwerk. Bitte praezisiere die Frage oder ergaenze das Korpus.",
  en: "Nothing in the stored corpus answers this. Please refine the question or extend the corpus.",
};

// The corpus and the retrieval stemmer are German-only. An English question shares almost
// no keyword stems with the source text, so retrieval silently returns nothing unless we
// translate the query for search purposes first. The answer is still generated from the
// original question, so this only affects which chunks get selected, not what is said.
async function germanSearchQuery(question: string): Promise<string> {
  try {
    const msg = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 200,
      system:
        "Uebersetze die folgende Frage knapp und sinngemaess ins Deutsche, mit Fokus auf " +
        "Fachbegriffe zu Heizungsgesetz und Foerderung. Gib ausschliesslich die deutsche " +
        "Uebersetzung zurueck, ohne Anfuehrungszeichen oder Zusatztext.",
      messages: [{ role: "user", content: question }],
    });
    const translated = msg.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("")
      .trim();
    return translated || question;
  } catch {
    return question;
  }
}

export async function POST(req: Request) {
  try {
    const { question, lang: rawLang } = await req.json();
    if (!question || typeof question !== "string") {
      return NextResponse.json({ error: "question required" }, { status: 400 });
    }
    const lang: "de" | "en" = rawLang === "en" ? "en" : "de";

    const trial = await checkTrial();
    if (!trial.allowed) {
      return NextResponse.json(
        { error: "trial exhausted", trialExhausted: true, trialRemaining: 0 },
        { status: 402 }
      );
    }

    async function respond(body: Record<string, unknown>) {
      const res = NextResponse.json({
        ...body,
        trialRemaining: trial.signedIn ? null : Math.max(0, trial.remaining - 1),
      });
      if (!trial.signedIn) await commitTrialUse(res);
      return res;
    }

    const searchQuery = lang === "en" ? await germanSearchQuery(question) : question;
    const selected = retrieve(searchQuery);
    if (selected.length === 0) {
      return respond({ answer: NO_MATCH[lang], citations: [], retrieved: 0 });
    }

    // One document block per chunk, so document_index maps straight back to a chunk.
    const documents = selected.map((c) => ({
      type: "document" as const,
      source: {
        type: "content" as const,
        content: [{ type: "text" as const, text: c.text }],
      },
      title: `${c.documentShortName}${c.paragraphRef ? " " + c.paragraphRef : ""}`,
      context: validityLabel(c),
      citations: { enabled: true },
    }));

    const msg = await client.messages.create({
      model: process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-5",
      max_tokens: 1500,
      system: buildSystem(lang),
      messages: [
        {
          role: "user",
          content: [...documents, { type: "text", text: question }],
        },
      ],
    });

    let answer = "";
    const citations: any[] = [];

    for (const block of msg.content) {
      if (block.type !== "text") continue;
      answer += block.text;
      for (const cit of (block as any).citations ?? []) {
        const chunk = selected[cit.document_index];
        if (!chunk) continue;
        citations.push({
          citedText: cit.cited_text,
          chunkId: chunk.id,
          documentTitle: chunk.documentTitle,
          paragraphRef: chunk.paragraphRef,
          validFrom: chunk.validFrom,
          validUntil: chunk.validUntil,
          supersededBy: chunk.supersededBy,
          sourceUrl: chunk.sourceUrl,
          fullText: chunk.text,
        });
      }
    }

    // Dedupe by chunk, keeping first appearance order.
    const seen = new Set<string>();
    const unique = citations.filter((c) =>
      seen.has(c.chunkId) ? false : (seen.add(c.chunkId), true)
    );

    const periods = new Set(unique.map((c) => c.validFrom ?? "unknown"));

    return respond({
      answer,
      citations: unique,
      retrieved: selected.length,
      spansPeriodBoundary: periods.size > 1,
    });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err?.message ?? "unknown error" }, { status: 500 });
  }
}
