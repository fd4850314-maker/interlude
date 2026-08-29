export default function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="rounded-lg border border-red-500/30 bg-red-500/5 px-4 py-3 text-sm text-red-200">
      <p className="mb-2">{message}</p>
      <button type="button" onClick={onRetry} className="underline hover:text-red-100">
        Start over
      </button>
    </div>
  );
}
