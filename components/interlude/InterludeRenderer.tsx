"use client";

import { InterludeSpec, InterludeStep } from "@/lib/types";
import { interactionRegistry } from "@/lib/interactionRegistry";

interface Props {
  interlude: InterludeSpec;
  onAnswer: (value: string) => void;
  disabled?: boolean;
}

export default function InterludeRenderer({ interlude, onAnswer, disabled }: Props) {
  const step: InterludeStep | undefined = interlude.steps[0];
  if (!step) return null;

  const Component = interactionRegistry[step.type];
  if (!Component) {
    return (
      <p className="text-paper/50 text-sm">
        Unsupported interaction type: {step.type}
      </p>
    );
  }

  return <Component step={step} onAnswer={onAnswer} disabled={disabled} />;
}
