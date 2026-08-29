import { z } from "zod";

// What the Experience Engine (classify) must return. Strict validation here
// is the main defense against malformed LLM output breaking the demo live.
export const SingleChoiceStepSchema = z.object({
  type: z.literal("single-choice"),
  id: z.string().min(1),
  prompt: z.string().min(1),
  options: z.array(z.string().min(1)).min(2).max(5),
});

export const InterludeStepSchema = SingleChoiceStepSchema; // widen with z.union later

export const InterludeSpecSchema = z.object({
  task: z.string().min(1),
  goal: z.string().min(1),
  estimatedDurationMs: z.number().int().positive().max(60000),
  steps: z.array(InterludeStepSchema).min(1).max(3),
});

export const ClassifyRequestSchema = z.object({
  prompt: z.string().min(1).max(4000),
});

export const InterludeResponseSchema = z.object({
  stepId: z.string().min(1),
  value: z.string().min(1),
});

export const GenerateRequestSchema = z.object({
  prompt: z.string().min(1).max(4000),
  // Absent/null = speculative (context-free) generation.
  // Present = final, context-shaped generation.
  interludeContext: z
    .object({
      goal: z.string(),
      responses: z.array(InterludeResponseSchema),
    })
    .nullable()
    .optional(),
});

export type InterludeSpecParsed = z.infer<typeof InterludeSpecSchema>;
export type GenerateRequestParsed = z.infer<typeof GenerateRequestSchema>;
