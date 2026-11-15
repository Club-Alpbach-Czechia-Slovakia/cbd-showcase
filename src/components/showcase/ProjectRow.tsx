import { useEffect, useRef, useState, type CSSProperties } from "react";
import type { Project } from "./types";
import { BrowserFrame } from "./BrowserFrame";
import { ScrollingPreview } from "./ScrollingPreview";
import { CategoryTag, LiveBadge } from "./SectionLabel";
import { useCanHover } from "./hooks";
import { RevealWords, useInViewOnce, useScrollVar, useTilt } from "./motion";

type Props = {
  project: Project;
  index: number;
  previewBase: string;
  onOpen: (p: Project) => void;
  /** "grid": stacked card for a two-column grid (default). "list": wide alternating row. */
  layout?: "list" | "grid";
};

const EASE = "cubic-bezier(.2,.9,.2,1)";

/**
 * One project card: auto-scrolling preview with 3D entrance, cursor tilt + glare,
 * spinning gradient border, scan-line sweep and staggered copy reveal.
 */
export function ProjectRow({ project, index, previewBase, onOpen, layout = "grid" }: Props) {
  const ref = useRef<HTMLElement>(null);
  const tiltRef = useTilt<HTMLDivElement>(10);
  const canHover = useCanHover();
  const [hovered, setHovered] = useState(false);
  const [inView, setInView] = useState(false);
  const seen = useInViewOnce(ref);
  useScrollVar(ref);

  // Touch screens: scroll the preview while the card sits in the middle of the screen.
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
  // Stagger cards in the same row of the grid.
  const d = grid ? (index % 2) * 160 : 0;

  const enter = (ms: number, from: string): CSSProperties => ({
    opacity: seen ? 1 : 0,
    transform: seen ? "none" : from,
    transition: `opacity .8s ease ${d + ms}ms, transform 1s ${EASE} ${d + ms}ms`,
  });

  return (
    <article
      ref={ref}
      className={`sc-anim group relative grid min-w-0 ${grid ? "content-start gap-8" : "items-center gap-8 lg:gap-16 lg:grid-cols-12"}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
    >
      {/* Oversized outlined index number drifting with scroll */}
      <span
        aria-hidden
        className="pointer-events-none absolute -top-16 right-0 z-0 select-none font-['Bricolage_Grotesque',ui-sans-serif,system-ui,sans-serif] text-[9rem] font-extrabold leading-none text-transparent lg:-top-20 lg:text-[12rem]"
        style={{
          WebkitTextStroke: "1.5px rgba(20,17,15,0.08)",
          transform: `translate3d(0, calc(var(--p, 0) * 60px), 0)`,
          opacity: seen ? 1 : 0,
          transition: `opacity 1.2s ease ${d + 200}ms`,
        }}
      >
        {number}
      </span>

      <div
        className={`relative z-10 min-w-0 ${grid ? "" : "lg:col-span-7"} ${flip ? "lg:order-2" : ""}`}
        style={{
          perspective: "1400px",
          ...enter(0, "translate3d(0, 90px, 0) rotateX(22deg) scale(.9)"),
          filter: seen ? "none" : "blur(10px)",
          transition: `opacity .8s ease ${d}ms, transform 1.2s ${EASE} ${d}ms, filter 1s ease ${d}ms`,
          transformOrigin: "50% 100%",
        }}
      >
        <div
          ref={tiltRef}
          className="relative transition-transform duration-300 ease-out will-change-transform"
          style={{ transform: "rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg))", transformStyle: "preserve-3d" }}
        >
          {/* Spinning conic glow border */}
          <div className="pointer-events-none absolute -inset-[3px] overflow-hidden opacity-0 transition-opacity duration-500 group-hover:opacity-100" aria-hidden>
            <span
              className="absolute left-1/2 top-1/2 aspect-square w-[160%]"
              style={{
                background: "conic-gradient(from 0deg, #145c9e, #27ae60, #ffcd00, #145c9e)",
                animation: "sc-spin 4s linear infinite",
                transform: "translate(-50%, -50%)",
              }}
            />
          </div>
          {/* Soft coloured shadow that blooms on hover */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-6 -z-10 opacity-0 blur-3xl transition-opacity duration-700 group-hover:opacity-60"
            style={{ background: "linear-gradient(120deg, #145c9e, #27ae60 50%, #ffcd00)", transform: "translateZ(-40px) translateY(30px)" }}
          />

          <button
            type="button"
            onClick={() => onOpen(project)}
            aria-label={`Take a closer look at ${project.title}`}
            className="relative block w-full min-w-0 text-left cursor-zoom-in focus:outline-none focus-visible:ring-2 focus-visible:ring-[#145c9e] focus-visible:ring-offset-4"
          >
            <BrowserFrame url={project.url} className="relative transition-shadow duration-500 group-hover:shadow-[0_40px_80px_-30px_rgba(20,17,15,0.55)]">
              <div
                className="relative"
                style={{
                  clipPath: seen ? "inset(0 0 0 0)" : "inset(0 0 100% 0)",
                  transition: `clip-path 1.3s ${EASE} ${d + 250}ms`,
                }}
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
                {/* Scan line sweeping down once on entrance */}
                {seen && (
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-x-0 top-0 h-[9%]"
                    style={{
                      background: "linear-gradient(to bottom, transparent, rgba(255,205,0,.35) 60%, rgba(255,255,255,.9))",
                      mixBlendMode: "screen",
                      opacity: 0,
                      animation: `sc-scan 1.6s ${EASE} ${d + 450}ms 1 both`,
                    }}
                  />
                )}
                {/* Glare following the cursor */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 transition-opacity duration-300"
                  style={{
                    opacity: "var(--glare, 0)",
                    background: "radial-gradient(600px circle at var(--mx, 50%) var(--my, 50%), rgba(255,255,255,.35), transparent 40%)",
                    mixBlendMode: "soft-light",
                  }}
                />
              </div>
            </BrowserFrame>
            <span
              className="pointer-events-none absolute left-3 top-11"
              style={{ transform: "translateZ(50px)", ...enter(900, "translateY(-10px) scale(.8)") }}
            >
              <LiveBadge />
            </span>
          </button>
        </div>
      </div>

      <div className={`relative z-10 min-w-0 ${grid ? "" : "lg:col-span-5"} ${flip ? "lg:order-1" : ""}`}>
        <div className="flex items-center gap-4">
          <span className="font-['IBM_Plex_Mono',ui-monospace,SFMono-Regular,monospace] text-sm text-[#14110f]/40 tabular-nums" style={enter(350, "translateX(-12px)")}>
            {number}
          </span>
          <span
            className="h-px flex-1 max-w-16 origin-left bg-[#14110f]/15 transition-[max-width] duration-500 group-hover:max-w-28 group-hover:bg-[#145c9e]"
            aria-hidden
            style={{ transform: seen ? "scaleX(1)" : "scaleX(0)", transition: `transform .9s ${EASE} ${d + 450}ms, max-width .5s, background-color .5s` }}
          />
          <span className="inline-block" style={seen ? { animation: `sc-pop .7s ${EASE} ${d + 600}ms both` } : { opacity: 0 }}>
            <CategoryTag>{project.category}</CategoryTag>
          </span>
        </div>
        <h3
          className={`font-['Bricolage_Grotesque',ui-sans-serif,system-ui,sans-serif] font-extrabold leading-[1.02] tracking-tight text-[#14110f] ${
            grid ? "mt-5 text-3xl xl:text-4xl" : "mt-6 text-4xl xl:text-5xl"
          }`}
        >
          <RevealWords text={project.title} show={seen} delay={d + 400} />
        </h3>
        {project.tagline && (
          <p className="mt-3 text-lg font-medium text-[#145c9e]" style={enter(650, "translateY(14px)")}>
            {project.tagline}
          </p>
        )}
        <p className={`mt-4 leading-relaxed text-[#14110f]/75 ${grid ? "line-clamp-3" : "line-clamp-4"}`} style={enter(750, "translateY(14px)")}>
          {project.description}
        </p>
        {project.team && (
          <p className="mt-4 font-['IBM_Plex_Mono',ui-monospace,SFMono-Regular,monospace] text-xs uppercase tracking-[0.15em] text-[#14110f]/50" style={enter(820, "translateY(10px)")}>
            Team · {project.team}
          </p>
        )}
        <div className={`flex flex-wrap gap-3 ${grid ? "mt-6" : "mt-8"}`} style={enter(900, "translateY(16px)")}>
          <a
            href={project.url}
            target="_blank"
            rel="noopener noreferrer"
            className="sc-shine relative overflow-hidden inline-flex items-center justify-center gap-2 group/btn transition active:translate-y-px bg-[#ffcd00] text-[#14110f] hover:brightness-105 hover:-translate-y-0.5 hover:shadow-[0_12px_24px_-10px_rgba(255,205,0,0.9)] px-6 py-3.5 text-sm font-bold"
          >
            Open live <span className="inline-block transition-transform group-hover/btn:translate-x-1">→</span>
          </a>
          <button
            type="button"
            onClick={() => onOpen(project)}
            className="relative overflow-hidden inline-flex items-center justify-center gap-2 group/look transition active:translate-y-px border-2 border-[#145c9e] text-[#145c9e] hover:text-[#faf8f4] px-6 py-3.5 text-sm font-bold"
          >
            <span aria-hidden className="absolute inset-0 -z-0 origin-left scale-x-0 bg-[#145c9e] transition-transform duration-500 ease-out group-hover/look:scale-x-100" />
            <span className="relative">Take a closer look</span>
          </button>
        </div>
      </div>
    </article>
  );
}
