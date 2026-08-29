// ---------------------------------------------------------------------------
// Interaction types. For the vertical slice, only "single-choice" exists,
// but the type union and registry are shaped to add more without touching
// the engine, schema, or orchestrator.
// ---------------------------------------------------------------------------

export type InteractionType = "single-choice";
// Future: | "multiple-choice" | "prediction" | "preference-slider" | "short-text"

export interface SingleChoiceStep {
  type: "single-choice";
  id: string;
  prompt: string;
  options: string[];
}

export type InterludeStep = SingleChoiceStep; // widen with `|` as types are added

export interface InterludeSpec {
  task: string; // e.g. "business-creation"
  goal: string; // short description of what the interlude is trying to learn
  estimatedDurationMs: number; // Experience Engine's estimate of the AI's processing window
  steps: InterludeStep[]; // 1-3 steps; vertical slice only ever returns 1
}

export interface InterludeResponse {
  stepId: string;
  value: string;
}

// ---------------------------------------------------------------------------
// Session state model
// ---------------------------------------------------------------------------

export type SessionStatus =
  | "idle"
  | "processing" // both tracks fired
  | "interlude_active" // classify done, rendering; speculative generation running in background
  | "interlude_complete_awaiting_ai" // user finished; real context-aware generate call in flight
  | "ai_finished_early" // speculative track resolved before the user finished the interlude
  | "resolved" // final, context-shaped response is ready to show
  | "error";

export interface InterludeSession {
  originalPrompt: string;
  task: InterludeSpec | null;
  interlude: InterludeSpec | null;
  userResponses: InterludeResponse[];
  finalResponse: string | null;
  status: SessionStatus;
  /**
   * The speculative (context-free) response, if the background generation
   * finished. This is NEVER rendered as the final result on its own — see
   * the causality invariant in useInterludeOrchestrator.ts. It exists only
   * so we can decide what to do once we know it's ready.
   */
  speculativeResponse: string | null;
  error: string | null;
}

export const initialSession: InterludeSession = {
  originalPrompt: "",
  task: null,
  interlude: null,
  userResponses: [],
  finalResponse: null,
  status: "idle",
  speculativeResponse: null,
  error: null,
};
