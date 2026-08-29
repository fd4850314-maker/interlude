import { InterludeResponse, InterludeSession, InterludeSpec, initialSession } from "./types";

export type SessionAction =
  | { type: "SUBMIT_PROMPT"; prompt: string }
  | { type: "CLASSIFY_SUCCESS"; interlude: InterludeSpec }
  | { type: "SPECULATIVE_SUCCESS"; response: string }
  | { type: "USER_RESPONSE"; response: InterludeResponse }
  | { type: "AWAIT_FINAL_AI" }
  | { type: "FINAL_SUCCESS"; response: string }
  | { type: "AI_FINISHED_EARLY" }
  | { type: "ERROR"; message: string }
  | { type: "RESET" };

export function sessionReducer(state: InterludeSession, action: SessionAction): InterludeSession {
  switch (action.type) {
    case "SUBMIT_PROMPT":
      return {
        ...initialSession,
        originalPrompt: action.prompt,
        status: "processing",
      };

    case "CLASSIFY_SUCCESS":
      // If the speculative track already finished while classify was running,
      // stay in ai_finished_early — don't downgrade the status.
      return {
        ...state,
        interlude: action.interlude,
        status: state.status === "ai_finished_early" ? "ai_finished_early" : "interlude_active",
      };

    case "SPECULATIVE_SUCCESS":
      return {
        ...state,
        speculativeResponse: action.response,
        // Only move to ai_finished_early if the user hasn't already completed
        // the interlude (in which case the orchestrator is already firing the
        // real, context-aware call and this speculative result is discarded).
        status: state.status === "interlude_active" || state.status === "processing"
          ? "ai_finished_early"
          : state.status,
      };

    case "USER_RESPONSE":
      return {
        ...state,
        userResponses: [...state.userResponses, action.response],
      };

    case "AWAIT_FINAL_AI":
      return {
        ...state,
        status: "interlude_complete_awaiting_ai",
      };

    case "FINAL_SUCCESS":
      // The only path that produces a "shaped" result: the user's responses
      // are guaranteed non-empty by the orchestrator before this fires.
      return {
        ...state,
        finalResponse: action.response,
        status: "resolved",
      };

    case "AI_FINISHED_EARLY":
      return {
        ...state,
        status: "ai_finished_early",
      };

    case "ERROR":
      return {
        ...state,
        status: "error",
        error: action.message,
      };

    case "RESET":
      return initialSession;

    default:
      return state;
  }
}
