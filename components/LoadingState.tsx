export default function LoadingState({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 text-paper/50 text-sm">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-60" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-accent" />
      </span>
      {label}
    </div>
  );
}
