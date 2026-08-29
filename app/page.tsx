"use client";

import { useState } from "react";
import PromptInput from "@/components/PromptInput";
import InterludeRenderer from "@/components/interlude/InterludeRenderer";
import ResultView from "@/components/ResultView";
import LoadingState from "@/components/LoadingState";
import ErrorState from "@/components/ErrorState";
import { useInterludeOrchestrator } from "@/hooks/useInterludeOrchestrator";

export default function Home() {
  const { session, submitPrompt, submitChoice, reset } = useInterludeOrchestrator();
  const [skipped, setSkipped] = useState(false);

  async function handlePromptSubmit(prompt: string) {
    setSkipped(false);
    await submitPrompt(prompt);
  }

  function handleAnswer(value: string) {
    if (!session.interlude) return;
    const step = session.interlude.steps[0];
    if (!step) return;
    submitChoice(session.originalPrompt, { stepId: step.id, value }, session.interlude.goal);
  }

  function handleReset() {
    setSkipped(false);
    reset();
  }

  const showInterlude =
    session.interlude &&
    (session.status === "interlude_active" || session.status === "ai_finished_early") &&
    !skipped;

  return (
    <main className="min-h-screen bg-ink flex flex-col items-center px-6 py-20">
      <div className="w-full max-w-2xl mx-auto text-center mb-10">
        <h1 className="text-2xl font-display tracking-tight text-paper mb-2">INTERLUDE</h1>
        <p className="text-paper/50 text-sm">Don&apos;t wait for AI. Use the moment.</p>
      </div>

      {session.status === "idle" && <PromptInput onSubmit={handlePromptSubmit} />}

      {session.status === "processing" && (
        <div className="mt-4">
          <LoadingState label="Preparing your interlude…" />
        </div>
      )}

      {showInterlude && session.interlude && (
        <div className="w-full max-w-md mx-auto mt-4">
          <InterludeRenderer
            interlude={session.interlude}
            onAnswer={handleAnswer}
            disabled={session.status === "interlude_complete_awaiting_ai"}
          />

          {session.status === "ai_finished_early" && (
            <div className="mt-6 rounded-lg border border-line px-4 py-3 flex items-center justify-between gap-4">
              <p className="text-xs text-paper/50">
                Your answer finished generating. Choose an option above to shape it, or view it as-is.
              </p>
              <button
                type="button"
                onClick={() => setSkipped(true)}
                className="text-xs whitespace-nowrap text-accent hover:text-accent/70 transition-colors"
              >
                Skip →
              </button>
            </div>
          )}
        </div>
      )}

      {session.status === "interlude_complete_awaiting_ai" && (
        <div className="mt-6">
          <LoadingState label="Shaping your result…" />
        </div>
      )}

      {skipped && session.speculativeResponse && (
        <ResultView
          response={session.speculativeResponse}
          shaped={false}
          userResponses={[]}
          onReset={handleReset}
        />
      )}

      {session.status === "resolved" && session.finalResponse && !skipped && (
        <ResultView
          response={session.finalResponse}
          shaped
          userResponses={session.userResponses}
          onReset={handleReset}
        />
      )}

      {session.status === "error" && (
        <div className="w-full max-w-md mx-auto mt-6">
          <ErrorState message={session.error ?? "Something went wrong."} onRetry={handleReset} />
        </div>
      )}
    </main>
  );
      }
