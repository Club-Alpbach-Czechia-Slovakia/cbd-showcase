/** "—— OUTCOMES" style eyebrow used across crossborderdialogue.eu */
export function SectionLabel({ children, tone = "blue" }: { children: React.ReactNode; tone?: "blue" | "yellow" }) {
  const color = tone === "yellow" ? "text-cbd-yellow" : "text-cbd-blue";
  return (
    <p className={`flex items-center gap-3 font-mono text-xs font-medium uppercase tracking-[0.2em] ${color}`}>
      <span className="h-px w-8 bg-current" aria-hidden />
      {children}
    </p>
  );
}

/** Yellow category tag (as on the outcomes cards). */
export function CategoryTag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-block bg-cbd-yellow px-3 py-1.5 font-mono text-[11px] font-medium uppercase tracking-[0.15em] text-cbd-ink">
      {children}
    </span>
  );
}

/** Dark "● OPEN LIVE" badge laid over previews. */
export function LiveBadge() {
  return (
    <span className="inline-flex items-center gap-2 bg-cbd-ink/85 px-3 py-1.5 font-mono text-[11px] font-medium uppercase tracking-[0.15em] text-cbd-paper backdrop-blur-sm">
      <span className="size-1.5 rounded-full bg-cbd-green" aria-hidden />
      Open live
    </span>
  );
}
