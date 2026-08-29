"use client";

import { InterludeResponse } from "@/lib/types";

interface Props {
  response: string;
  shaped: boolean;
  userResponses: InterludeResponse[];
  onReset: () => void;
}

export default function ResultView({ response, shaped, userResponses, onReset }: Props) {
  return (
    <div className="w-full max-w-2xl mx-auto">
      {shaped ? (
        <div className="mb-6 rounded-lg border border-accent/30 bg-accent/5 px-4 py-3">
          <p className="text-xs uppercase tracking-widest text-accent font-medium mb-2">
            You shaped this result
          </p>
          <ul className="text-sm text-paper/70 space-y-1">
            {userResponses.map((r) => (
              <li key={r.stepId}>
                <span className="text-paper/40">{r.stepId}:</span> {r.value}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="mb-6 rounded-lg border border-line px-4 py-3">
          <p className="text-xs uppercase tracking-widest text-paper/40 font-medium">
            Generated without your input — the AI finished before you answered
          </p>
        </div>
      )}

      <div className="prose prose-invert max-w-none whitespace-pre-wrap text-paper/90 font-body leading-relaxed">
        {response}
      </div>

      <button
        type="button"
        onClick={onReset}
        className="mt-8 text-sm text-paper/50 hover:text-paper transition-colors"
      >
        ← Try another prompt
      </button>
    </div>
  );
}
