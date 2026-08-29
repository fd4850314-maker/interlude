"use client";

import { FormEvent, useState } from "react";

const EXAMPLE_PROMPT = "Create a business idea for young people in Africa.";

interface Props {
  onSubmit: (prompt: string) => void;
  disabled?: boolean;
}

export default function PromptInput({ onSubmit, disabled }: Props) {
  const [value, setValue] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSubmit(trimmed);
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="What do you want to create?"
        rows={3}
        disabled={disabled}
        className="w-full resize-none rounded-xl border border-line bg-transparent px-4 py-3 text-paper placeholder:text-paper/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent font-body"
      />
      <div className="mt-3 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setValue(EXAMPLE_PROMPT)}
          disabled={disabled}
          className="text-xs text-paper/40 hover:text-paper/70 transition-colors"
        >
          Try: “{EXAMPLE_PROMPT}”
        </button>
        <button
          type="submit"
          disabled={disabled || !value.trim()}
          className="rounded-full bg-accent px-5 py-2 text-sm font-medium text-ink disabled:opacity-30 transition-opacity"
        >
          Generate
        </button>
      </div>
    </form>
  );
}
