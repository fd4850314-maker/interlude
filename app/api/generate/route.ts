import { NextRequest, NextResponse } from "next/server";
import { getAnthropicClient, GENERATE_MODEL } from "@/lib/anthropic";
import { GENERATE_SYSTEM_PROMPT, buildGenerateUserMessage } from "@/lib/prompts";
import { GenerateRequestSchema } from "@/lib/schema";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = GenerateRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const { prompt, interludeContext } = parsed.data;

  try {
    const anthropic = getAnthropicClient();
    const userMessage = buildGenerateUserMessage(prompt, interludeContext ?? null);

    const message = await anthropic.messages.create({
      model: GENERATE_MODEL,
      max_tokens: 1024,
      system: GENERATE_SYSTEM_PROMPT,
      messages: [{ role: "user", content: userMessage }],
    });

    const textBlock = message.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      throw new Error("No text content in generate response.");
    }

    return NextResponse.json({
      response: textBlock.text,
      // Echoes back whether this was a context-shaped response, so the
      // client never has to infer it — the source of truth for "was this
      // shaped by the user's choices" lives on the server request, not
      // client-side bookkeeping.
      shaped: Boolean(interludeContext && interludeContext.responses.length > 0),
    });
  } catch (err) {
    console.error("generate error:", err);
    return NextResponse.json({ error: "Failed to generate a response." }, { status: 500 });
  }
}
