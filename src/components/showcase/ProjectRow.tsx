import { useEffect, useRef, useState } from "react";
import type { Project } from "./types";
import { BrowserFrame } from "./BrowserFrame";
import { ScrollingPreview } from "./ScrollingPreview";
import { CategoryTag, LiveBadge } from "./SectionLabel";
import { useCanHover } from "./hooks";

type Props = {
  project: Project;
  index: number;
  previewBase: string;
  onOpen: (p: Project) => void;
  /** "list": wide alternating row. "grid": stacked card for a two-column grid. */
  layout?: "list" | "grid";
};

/**
 * One project = one wide row: large auto-scrolling preview + copy, alternating sides.
 * Sized so that two rows fill a typical desktop viewport.
 */
export function ProjectRow({ project, index, previewBase, onOpen, layout = "list" }: Props) {
  const ref = useRef<HTMLElement>(null);
  const canHover = useCanHover();
  const [hovered, setHovered] = useState(false);
  const [inView, setInView] = useState(false);

  // Touch screens: scroll the preview while the row sits in the middle of the screen.
  useEffect(() => {
    if (canHover || !ref.current) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { rootMargin: "-30% 0px -30% 0px" });
    io.observe(ref.current);
    return () => io.disconnect();
  }, [canHover]);

  const active = canHover ? hovered : inView;
  const grid = layout === "grid";
  const flip = !grid && index % 2 === 1;
  const number = String(index + 1).padStart(2, "0");

  return (
    <article
      ref={ref}
      className={`group grid min-w-0 ${grid ? "content-start gap-8" : "items-center gap-8 lg:gap-16 lg:grid-cols-12"}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
    >
      <button
        type="button"
        onClick={() => onOpen(project)}
        aria-label={`Take a closer look at ${project.title}`}
        className={`relative block min-w-0 text-left cursor-zoom-in ${grid ? "" : "lg:col-span-7"} focus:outline-none focus-visible:ring-2 focus-visible:ring-[#145c9e] focus-visible:ring-offset-4 ${
          flip ? "lg:order-2" : ""
        }`}
      >
        <div className="transition-transform duration-500 ease-out group-hover:-translate-y-1">
          <BrowserFrame
            url={project.url}
            className="transition-shadow duration-500 group-hover:shadow-[0_30px_60px_-30px_rgba(20,17,15,0.45)]"
          >
            <ScrollingPreview
              src={`${previewBase}/${project.slug}/full.webp`}
              alt={`Screenshot of ${project.title}`}
              active={active}
              restY={project.highlight?.y ?? 0}
              aspect={grid ? "16 / 10" : "16 / 9"}
              speed={420}
              minDuration={3}
              maxDuration={12}
            />
          </BrowserFrame>
        </div>
        <span className="pointer-events-none absolute left-3 top-11">
          <LiveBadge />
        </span>
      </button>

      <div className={`min-w-0 ${grid ? "" : "lg:col-span-5"} ${flip ? "lg:order-1" : ""}`}>
        <div className="flex items-center gap-4">
          <span className="font-['IBM_Plex_Mono',ui-monospace,SFMono-Regular,monospace] text-sm text-[#14110f]/40 tabular-nums">{number}</span>
          <span className="h-px flex-1 max-w-16 bg-[#14110f]/15" aria-hidden />
          <CategoryTag>{project.category}</CategoryTag>
        </div>
        <h3
          className={`font-['Bricolage_Grotesque',ui-sans-serif,system-ui,sans-serif] font-extrabold leading-[1.02] tracking-tight text-[#14110f] ${
            grid ? "mt-5 text-3xl xl:text-4xl" : "mt-6 text-4xl xl:text-5xl"
          }`}
        >
          {project.title}
        </h3>
        {project.tagline && <p className="mt-3 text-lg font-medium text-[#145c9e]">{project.tagline}</p>}
        <p className={`mt-4 leading-relaxed text-[#14110f]/75 ${grid ? "line-clamp-3" : "line-clamp-4"}`}>{project.description}</p>
        {project.team && (
          <p className="mt-4 font-['IBM_Plex_Mono',ui-monospace,SFMono-Regular,monospace] text-xs uppercase tracking-[0.15em] text-[#14110f]/50">Team · {project.team}</p>
        )}
        <div className={`flex flex-wrap gap-3 ${grid ? "mt-6" : "mt-8"}`}>
          <a
            href={project.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 group/btn font-semibold transition active:translate-y-px bg-[#ffcd00] text-[#14110f] hover:brightness-105 px-6 py-3.5 text-sm font-bold"
          >
            Open live <span className="inline-block transition-transform group-hover/btn:translate-x-1">→</span>
          </a>
          <button
            type="button"
            onClick={() => onOpen(project)}
            className="inline-flex items-center justify-center gap-2 group/btn font-semibold transition active:translate-y-px border-2 border-[#145c9e] text-[#145c9e] hover:bg-[#145c9e] hover:text-[#faf8f4] px-6 py-3.5 text-sm font-bold"
          >
            Take a closer look
          </button>
        </div>
      </div>
    </article>
  );
}
