import { useEffect, useMemo, useState } from "react";
import type { Project } from "./types";
import { ProjectRow } from "./ProjectRow";
import { ProjectModal } from "./ProjectModal";

type Layout = "list" | "grid";
const LAYOUT_KEY = "cbd-showcase-layout";

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
      return localStorage.getItem(LAYOUT_KEY) === "grid" ? "grid" : "list";
    } catch {
      return "list";
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
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:items-start lg:gap-6">
        <label className="relative block">
          <span className="sr-only">Search projects</span>
          <svg
            className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-cbd-ink/45"
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
            className="w-full border border-cbd-ink/15 bg-white py-3 pl-11 pr-4 text-[15px] placeholder:text-cbd-ink/40 focus:border-cbd-blue focus:outline-none"
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
                  className={`border px-3.5 py-2 font-mono text-[11px] font-medium uppercase tracking-[0.18em] transition-colors ${
                    on
                      ? "border-cbd-ink bg-cbd-ink text-cbd-paper"
                      : "border-cbd-ink/15 text-cbd-ink/70 hover:border-cbd-ink hover:text-cbd-ink"
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
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-cbd-ink/45">
          Showing {filtered.length} of {visible.length} {visible.length === 1 ? "project" : "projects"}
        </p>
        <div className="hidden sm:flex items-center gap-3" role="radiogroup" aria-label="Layout">
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-cbd-ink/45">View</span>
          <div className="flex border border-cbd-ink/15">
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
                  layout === l.id ? "bg-cbd-ink text-cbd-paper" : "text-cbd-ink/55 hover:text-cbd-ink"
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
              ? "mt-12 lg:mt-16 grid grid-cols-1 gap-y-20 sm:grid-cols-2 sm:gap-x-10 lg:gap-x-16 lg:gap-y-24"
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
        <p className="mt-16 text-lg text-cbd-ink/55">No projects match your search.</p>
      )}

      <ProjectModal project={open} previewBase={previewBase} onClose={() => setOpen(null)} />
    </div>
  );
}
