import { NextRequest, NextResponse } from "next/server";
import { getAnthropicClient, CLASSIFY_MODEL } from "@/lib/anthropic";
import { CLASSIFY_SYSTEM_PROMPT } from "@/lib/prompts";
import { ClassifyRequestSchema, InterludeSpecSchema } from "@/lib/schema";

export const runtime = "nodejs";

const FALLBACK_INTERLUDE = {
  task: "general",
  goal: "Understand what matters most to the user for this request.",
  estimatedDurationMs: 6000,
  steps: [
    {
      type: "single-choice" as const,
      id: "priority",
      prompt: "What matters most to you here?",
      options: ["Speed", "Quality", "Simplicity"],
    },
  ],
};

function extractJson(text: string): unknown {
  const cleaned = text.trim().replace(/^```json\s*/i, "").replace(/```$/, "").trim();
  return JSON.parse(cleaned);
}

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsedRequest = ClassifyRequestSchema.safeParse(body);
  if (!parsedRequest.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  try {
    const anthropic = getAnthropicClient();
    const message = await anthropic.messages.create({
      model: CLASSIFY_MODEL,
      max_tokens: 500,
      system: CLASSIFY_SYSTEM_PROMPT,
      messages: [{ role: "user", content: parsedRequest.data.prompt }],
    });

    const textBlock = message.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      throw new Error("No text content in classify response.");
    }

    let raw: unknown;
    try {
      raw = extractJson(textBlock.text);
    } catch {
      return NextResponse.json({ interlude: FALLBACK_INTERLUDE, usedFallback: true });
    }

    const parsedSpec = InterludeSpecSchema.safeParse(raw);
    if (!parsedSpec.success) {
      return NextResponse.json({ interlude: FALLBACK_INTERLUDE, usedFallback: true });
    }

    return NextResponse.json({ interlude: parsedSpec.data, usedFallback: false });
  } catch (err) {
    console.error("classify error:", err);
    return NextResponse.json({ interlude: FALLBACK_INTERLUDE, usedFallback: true });
  }
}
