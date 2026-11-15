/** "—— OUTCOMES" style eyebrow used across crossborderdialogue.eu */
export function SectionLabel({ children, tone = "blue" }: { children: React.ReactNode; tone?: "blue" | "yellow" }) {
  const color = tone === "yellow" ? "text-[#ffcd00]" : "text-[#145c9e]";
  return (
    <p className={`flex items-center gap-3 font-['IBM_Plex_Mono',ui-monospace,SFMono-Regular,monospace] text-xs font-medium uppercase tracking-[0.2em] ${color}`}>
      <span className="h-px w-8 bg-current" aria-hidden />
      {children}
    </p>
  );
}

/** Yellow category tag (as on the outcomes cards). */
export function CategoryTag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-block bg-[#ffcd00] px-3 py-1.5 font-['IBM_Plex_Mono',ui-monospace,SFMono-Regular,monospace] text-[11px] font-medium uppercase tracking-[0.15em] text-[#14110f]">
      {children}
    </span>
  );
}

/** Dark "● OPEN LIVE" badge laid over previews. */
export function LiveBadge() {
  return (
    <span className="inline-flex items-center gap-2 bg-[#14110f]/85 px-3 py-1.5 font-['IBM_Plex_Mono',ui-monospace,SFMono-Regular,monospace] text-[11px] font-medium uppercase tracking-[0.15em] text-[#faf8f4] backdrop-blur-sm">
      <span className="h-1.5 w-1.5 rounded-full bg-[#27ae60]" style={{ animation: "sc-pulse 1.8s ease-out infinite" }} aria-hidden />
      Open live
    </span>
  );
}
