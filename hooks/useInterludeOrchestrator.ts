"use client";

import { useCallback, useReducer, useRef } from "react";
import { sessionReducer } from "@/lib/session";
import { InterludeResponse, InterludeSpec, initialSession } from "@/lib/types";

/**
 * CAUSALITY INVARIANT
 * --------------------
 * The speculative (context-free) response from Track B must never be shown
 * to the user framed as the final, choice-shaped result. It is held
 * internally (`speculativeResponse`) until one of two things happens:
 *
 *   1. The user completes the interlude -> Track B is aborted (or its
 *      result discarded if it already finished) and a NEW, context-aware
 *      generate call is made. Only THAT response is ever labeled "shaped."
 *
 *   2. The user explicitly chooses to skip the interlude after being told
 *      the AI already finished -> the speculative response is shown, but
 *      clearly marked as not shaped by any choice.
 *
 * There is no path where a response generated before the user's choice is
 * silently presented as if it reflected that choice.
 */
export function useInterludeOrchestrator() {
  const [session, dispatch] = useReducer(sessionReducer, initialSession);
  const speculativeAbortRef = useRef<AbortController | null>(null);
  const specRef = useRef<InterludeSpec | null>(null);

  const submitPrompt = useCallback(async (prompt: string) => {
    dispatch({ type: "SUBMIT_PROMPT", prompt });
    specRef.current = null;

    const speculativeController = new AbortController();
    speculativeAbortRef.current = speculativeController;

    // Track A: Experience Engine
    const classifyPromise = fetch("/api/classify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    })
      .then((r) => r.json())
      .then((data: { interlude: InterludeSpec }) => {
        specRef.current = data.interlude;
        dispatch({ type: "CLASSIFY_SUCCESS", interlude: data.interlude });
      })
      .catch((err) => {
        if (speculativeController.signal.aborted) return;
        dispatch({ type: "ERROR", message: "Could not prepare an interlude for this prompt." });
        console.error(err);
      });

    // Track B: speculative, context-free generation — starts immediately so
    // the interlude genuinely occupies real processing time rather than
    // adding to it. Its result is NEVER auto-promoted to "final."
    const speculativePromise = fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, interludeContext: null }),
      signal: speculativeController.signal,
    })
      .then((r) => r.json())
      .then((data: { response: string }) => {
        dispatch({ type: "SPECULATIVE_SUCCESS", response: data.response });
      })
      .catch((err) => {
        // Expected when we abort because the user finished first — not an error.
        if (speculativeController.signal.aborted) return;
        console.error("speculative generation failed:", err);
      });

    await Promise.allSettled([classifyPromise, speculativePromise]);
  }, []);

  /** Called when the user completes the (single) interlude step. */
  const submitChoice = useCallback(
    async (originalPrompt: string, response: InterludeResponse, goal: string) => {
      dispatch({ type: "USER_RESPONSE", response });

      // Discard the speculative track — it was generated before this choice
      // existed, so it can never be the shaped result. Abort it if it's
      // still in flight; if it already resolved, its value is simply never
      // read again from here on.
      speculativeAbortRef.current?.abort();

      dispatch({ type: "AWAIT_FINAL_AI" });

      try {
        const res = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: originalPrompt,
            interludeContext: { goal, responses: [response] },
          }),
        });
        const data: { response?: string; error?: string } = await res.json();
        if (!res.ok || !data.response) {
          throw new Error(data.error ?? "Generation failed.");
        }
        dispatch({ type: "FINAL_SUCCESS", response: data.response });
      } catch (err) {
        dispatch({ type: "ERROR", message: "Could not generate your shaped result. Please try again." });
        console.error(err);
      }
    },
    []
  );

  const reset = useCallback(() => {
    speculativeAbortRef.current?.abort();
    dispatch({ type: "RESET" });
  }, []);

  return { session, submitPrompt, submitChoice, reset };
}
