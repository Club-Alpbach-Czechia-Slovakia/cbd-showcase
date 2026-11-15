import type { ReactNode } from "react";
import { hostname } from "./hooks";

type Props = {
  url: string;
  children: ReactNode;
  tone?: "light" | "dark";
  className?: string;
};

/** Minimal faux browser chrome around a preview. */
export function BrowserFrame({ url, children, tone = "light", className = "" }: Props) {
  const dark = tone === "dark";
  return (
    <div
      className={`overflow-hidden border ${
        dark ? "border-white/15 bg-[#1f1b18] shadow-2xl shadow-black/40" : "border-cbd-ink/10 bg-white shadow-sm"
      } ${className}`}
    >
      <div className={`flex items-center gap-3 px-3 h-8 border-b ${dark ? "border-white/10" : "border-cbd-ink/10 bg-cbd-neutral/60"}`}>
        <div className="flex gap-1.5 shrink-0" aria-hidden>
          <span className="size-2.5 rounded-full bg-[#ff5f57]" />
          <span className="size-2.5 rounded-full bg-[#febc2e]" />
          <span className="size-2.5 rounded-full bg-[#28c840]" />
        </div>
        <div
          className={`min-w-0 flex-1 truncate text-center font-mono text-[11px] px-2 py-0.5 ${
            dark ? "bg-white/10 text-white/70" : "bg-white text-cbd-ink/60 border border-cbd-ink/10"
          }`}
        >
          {hostname(url)}
        </div>
        <span className="w-10 shrink-0" aria-hidden />
      </div>
      {children}
    </div>
  );
}
