import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// Deliberately no documents, no retrieval, no guardrails. This is the honest
// baseline: what a competent general assistant says when a Meister asks it
// directly. We are not sandbagging it, and we do not need to.
export async function POST(req: Request) {
  try {
    const { question } = await req.json();
    if (!question || typeof question !== "string") {
      return NextResponse.json({ error: "question required" }, { status: 400 });
    }

    const msg = await client.messages.create({
      model: process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-5",
      max_tokens: 700,
      system:
        "Du bist ein hilfreicher Assistent für Handwerksbetriebe. Beantworte die Frage " +
        "direkt und praxisnah, so wie du es einem SHK-Meister am Telefon erklären würdest.",
      messages: [{ role: "user", content: question }],
    });

    const answer = msg.content
      .filter((b: any) => b.type === "text")
      .map((b: any) => b.text)
      .join("");

    return NextResponse.json({ answer });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err?.message ?? "unknown error" }, { status: 500 });
  }
}
