"use client";

import { useState } from "react";
import { SingleChoiceStep } from "@/lib/types";

export interface InteractionStepProps {
  step: SingleChoiceStep;
  onAnswer: (value: string) => void;
  disabled?: boolean;
}

export default function SingleChoice({ step, onAnswer, disabled }: InteractionStepProps) {
  const [selected, setSelected] = useState<string | null>(null);

  function handleSelect(option: string) {
    if (disabled) return;
    setSelected(option);
    onAnswer(option);
  }

  return (
    <div className="w-full">
      <p className="text-lg text-paper/90 mb-5 font-body">{step.prompt}</p>
      <div className="flex flex-col gap-2">
        {step.options.map((option) => {
          const isSelected = selected === option;
          return (
            <button
              key={option}
              type="button"
              disabled={disabled}
              onClick={() => handleSelect(option)}
              className={[
                "text-left rounded-lg border px-4 py-3 transition-all duration-150",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                isSelected
                  ? "border-accent bg-accent/10 text-paper"
                  : "border-line text-paper/70 hover:border-paper/40 hover:text-paper",
                disabled && !isSelected ? "opacity-40" : "",
              ].join(" ")}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}
