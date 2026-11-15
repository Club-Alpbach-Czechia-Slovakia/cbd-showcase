import { useEffect, useMemo, useState } from "react";
import type { Project } from "./types";
import { ProjectRow } from "./ProjectRow";
import { ProjectModal } from "./ProjectModal";
import { ShowcaseMotionStyles } from "./motion";

type Layout = "list" | "grid";
const LAYOUT_KEY = "cbd-showcase-layout-v2";

const LAYOUTS: { id: Layout; label: string; icon: React.ReactNode }[] = [
  {
    id: "list",
    label: "One per row",
    icon: (
      <svg viewBox="0 0 20 20" className="size-4" fill="currentColor" aria-hidden>
        <rect x="2" y="3" width="16" height="6" />
        <rect x="2" y="11" width="16" height="6" />
      </svg>
    ),
  },
  {
    id: "grid",
    label: "Two per row",
    icon: (
      <svg viewBox="0 0 20 20" className="size-4" fill="currentColor" aria-hidden>
        <rect x="2" y="3" width="7" height="6" />
        <rect x="11" y="3" width="7" height="6" />
        <rect x="2" y="11" width="7" height="6" />
        <rect x="11" y="11" width="7" height="6" />
      </svg>
    ),
  },
];

type Props = {
  projects: Project[];
  /** Public path that holds /<slug>/full.webp etc. */
  previewBase?: string;
};

export function ProjectGallery({ projects, previewBase = "/previews" }: Props) {
  const visible = useMemo(() => projects.filter((p) => !p.hidden), [projects]);
  const categories = useMemo(() => Array.from(new Set(visible.map((p) => p.category))).sort(), [visible]);
  const [active, setActive] = useState<string>("All");
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<Project | null>(null);
  const [layout, setLayout] = useState<Layout>(() => {
    try {
      return localStorage.getItem(LAYOUT_KEY) === "list" ? "list" : "grid";
    } catch {
      return "grid";
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(LAYOUT_KEY, layout);
    } catch {
      /* storage unavailable – fine */
    }
  }, [layout]);

  const filtered = visible.filter((p) => {
    if (active !== "All" && p.category !== active) return false;
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return [p.title, p.tagline, p.description, p.team, p.category].some((s) => s?.toLowerCase().includes(q));
  });

  return (
    <div>
      <ShowcaseMotionStyles />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:items-start lg:gap-6">
        <label className="relative block">
          <span className="sr-only">Search projects</span>
          <svg
            className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#14110f]/45"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search projects…"
            className="w-full border border-[#14110f]/15 bg-white py-3 pl-11 pr-4 text-[15px] placeholder:text-[#14110f]/40 focus:border-[#145c9e] focus:outline-none"
          />
        </label>
        {categories.length > 1 && (
          <div className="flex flex-wrap gap-2 lg:justify-end">
            {["All", ...categories].map((label) => {
              const on = active === label;
              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => setActive(label)}
                  aria-pressed={on}
                  className={`border px-3.5 py-2 font-['IBM_Plex_Mono',ui-monospace,SFMono-Regular,monospace] text-[11px] font-medium uppercase tracking-[0.18em] transition-colors ${
                    on
                      ? "border-[#14110f] bg-[#14110f] text-[#faf8f4]"
                      : "border-[#14110f]/15 text-[#14110f]/70 hover:border-[#14110f] hover:text-[#14110f]"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="mt-10 flex items-center justify-between gap-4">
        <p className="font-['IBM_Plex_Mono',ui-monospace,SFMono-Regular,monospace] text-xs uppercase tracking-[0.18em] text-[#14110f]/45">
          Showing {filtered.length} of {visible.length} {visible.length === 1 ? "project" : "projects"}
        </p>
        <div className="hidden lg:flex items-center gap-3" role="radiogroup" aria-label="Layout">
          <span className="font-['IBM_Plex_Mono',ui-monospace,SFMono-Regular,monospace] text-[11px] uppercase tracking-[0.18em] text-[#14110f]/45">View</span>
          <div className="flex border border-[#14110f]/15">
            {LAYOUTS.map((l) => (
              <button
                key={l.id}
                type="button"
                role="radio"
                aria-checked={layout === l.id}
                aria-label={l.label}
                title={l.label}
                onClick={() => setLayout(l.id)}
                className={`grid size-9 place-items-center transition-colors ${
                  layout === l.id ? "bg-[#14110f] text-[#faf8f4]" : "text-[#14110f]/55 hover:text-[#14110f]"
                }`}
              >
                {l.icon}
              </button>
            ))}
          </div>
        </div>
      </div>

      {filtered.length ? (
        <div
          className={
            layout === "grid"
              ? "mt-16 lg:mt-24 grid grid-cols-1 gap-y-24 lg:grid-cols-2 lg:gap-x-14 xl:gap-x-20 lg:gap-y-32"
              : "mt-12 lg:mt-16 space-y-24 lg:space-y-28"
          }
        >
          {filtered.map((p, i) => (
            <ProjectRow
              key={p.slug}
              project={p}
              index={i}
              layout={layout}
              previewBase={previewBase}
              onOpen={setOpen}
            />
          ))}
        </div>
      ) : (
        <p className="mt-16 text-lg text-[#14110f]/55">No projects match your search.</p>
      )}

      <ProjectModal project={open} previewBase={previewBase} onClose={() => setOpen(null)} />
    </div>
  );
}
