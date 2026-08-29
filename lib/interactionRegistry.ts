import { ComponentType } from "react";
import { InteractionType } from "./types";
import SingleChoice, { InteractionStepProps } from "@/components/interlude/SingleChoice";

// To add a new interaction type later:
//   1. Build the component (same props shape as InteractionStepProps).
//   2. Add the type to InteractionType in lib/types.ts and the step schema in lib/schema.ts.
//   3. Add one line here.
// InterludeRenderer, the orchestrator, and the API routes never need to change.
export const interactionRegistry: Record<InteractionType, ComponentType<InteractionStepProps>> = {
  "single-choice": SingleChoice,
};
