import "server-only";
import Anthropic from "@anthropic-ai/sdk";

// This module must only ever be imported from server-side code (API routes).
// The `server-only` import above will throw a build error if it's ever
// pulled into a client bundle, which is the guardrail against leaking the
// API key.

let client: Anthropic | null = null;

export function getAnthropicClient(): Anthropic {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error(
      "ANTHROPIC_API_KEY is not set. Add it to .env.local (see .env.local.example)."
    );
  }
  if (!client) {
    client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return client;
}

export const CLASSIFY_MODEL = "claude-3-5-haiku-20241022"; // fast/cheap — classify latency matters
export const GENERATE_MODEL = "claude-sonnet-4-6"; // quality matters more for the final answer
