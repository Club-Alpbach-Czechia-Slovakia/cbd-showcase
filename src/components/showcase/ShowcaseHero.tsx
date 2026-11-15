import { useEffect, useState, type ReactNode } from "react";
import type { Project } from "./types";
import { BrowserFrame } from "./BrowserFrame";
import { ScrollingPreview } from "./ScrollingPreview";
import { useReducedMotion } from "./hooks";
import { SectionLabel } from "./SectionLabel";

type Props = {
  projects: Project[];
  previewBase?: string;
  label?: string;
  headline?: ReactNode;
  intro?: ReactNode;
  galleryHref?: string;
};

/** Dark landing hero with a rotating, auto-scrolling preview of the featured projects. */
export function ShowcaseHero({
  projects,
  previewBase = "/previews",
  label = "Hackathon outcomes",
  headline = (
    <>
      Built across borders. <span className="text-[#ffcd00]">Live</span> on the web.
    </>
  ),
  intro = "Every team left the hackathon with a working website. Here they all are: tap one to look around, or open it live.",
  galleryHref = "#gallery",
}: Props) {
  const visible = projects.filter((p) => !p.hidden);
  const featured = visible.filter((p) => p.featured).length ? visible.filter((p) => p.featured) : visible.slice(0, 6);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [cycleDone, setCycleDone] = useState(false);
  const [rewinding, setRewinding] = useState(false);
  const reduced = useReducedMotion();
  const current = featured[index];

  // When a preview has scrolled to the bottom, move on to the next project
  // (or, with a single project, glide back to the top and go again).
  useEffect(() => {
    if (!cycleDone || paused || reduced) return;
    const t = setTimeout(() => {
      setCycleDone(false);
      if (featured.length > 1) {
        setIndex((i) => (i + 1) % featured.length);
      } else {
        setRewinding(true);
        setTimeout(() => setRewinding(false), 1600);
      }
    }, 1400);
    return () => clearTimeout(t);
  }, [cycleDone, paused, reduced, featured.length]);

  const select = (i: number) => {
    setCycleDone(false);
    setIndex(i);
  };

  return (
    <section className="relative overflow-hidden bg-[#14110f] text-[#faf8f4] lg:min-h-[calc(100svh-5rem)] lg:flex lg:items-center">
      {/* subtle grid texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "linear-gradient(to right, #faf8f4 1px, transparent 1px), linear-gradient(to bottom, #faf8f4 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          maskImage: "radial-gradient(ellipse at 70% 40%, black 30%, transparent 75%)",
        }}
        aria-hidden
      />
      <div className="relative w-full mx-auto max-w-7xl px-6 lg:px-10 py-20 md:py-28 grid gap-14 lg:gap-16 lg:grid-cols-12 lg:items-center">
        <div className="lg:col-span-5">
          <SectionLabel tone="yellow">{label}</SectionLabel>
          <h1 className="mt-6 font-['Bricolage_Grotesque',ui-sans-serif,system-ui,sans-serif] font-extrabold leading-[0.95] tracking-tight text-4xl sm:text-5xl md:text-6xl lg:text-7xl">
            {headline}
          </h1>
          <p className="mt-8 max-w-xl text-lg text-[#faf8f4]/80 leading-relaxed">{intro}</p>
          <div className="mt-10 flex flex-wrap gap-3">
            <a href={galleryHref} className="inline-flex items-center justify-center gap-2 group/btn font-semibold transition active:translate-y-px bg-[#ffcd00] text-[#14110f] hover:brightness-105 px-6 py-3.5 text-sm font-bold">
              Explore {visible.length === 1 ? "the project" : `all ${visible.length} projects`} <span className="inline-block transition-transform group-hover/btn:translate-x-1">→</span>
            </a>
          </div>

          {current && (
            <div key={current.slug} className="hidden lg:block mt-14 border-t border-white/15 pt-8">
              <p className="font-['IBM_Plex_Mono',ui-monospace,SFMono-Regular,monospace] text-[11px] font-medium uppercase tracking-[0.18em] text-[#faf8f4]/50">
                Now showing · {current.category}
              </p>
              <p className="mt-2 font-['Bricolage_Grotesque',ui-sans-serif,system-ui,sans-serif] font-extrabold text-3xl tracking-tight">{current.title}</p>
              {current.tagline && <p className="mt-1 text-[#faf8f4]/75">{current.tagline}</p>}
              <a
                href={current.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 group/btn font-semibold transition mt-4 text-sm text-[#ffcd00] hover:text-[#faf8f4]"
              >
                Open live <span className="inline-block transition-transform group-hover/btn:translate-x-1">→</span>
              </a>
            </div>
          )}
        </div>

        {current && (
          <div className="min-w-0 lg:col-span-7" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
            <BrowserFrame url={current.url} tone="dark">
              <div className="relative" style={{ aspectRatio: "16 / 10" }}>
                {featured.map((p, i) => (
                  <div
                    key={p.slug}
                    className="absolute inset-0 transition-opacity duration-700"
                    style={{ opacity: i === index ? 1 : 0 }}
                    aria-hidden={i !== index}
                  >
                    <ScrollingPreview
                      src={`${previewBase}/${p.slug}/full.webp`}
                      alt={`Screenshot of ${p.title}`}
                      active={i === index && !rewinding}
                      eager={i < 2}
                      speed={300}
                      minDuration={5}
                      maxDuration={14}
                      onCycleEnd={i === index ? () => setCycleDone(true) : undefined}
                    />
                  </div>
                ))}
              </div>
            </BrowserFrame>

            {featured.length > 1 && (
              <div className="mt-5 flex gap-2" role="tablist" aria-label="Featured projects">
                {featured.map((p, i) => (
                  <button
                    key={p.slug}
                    role="tab"
                    aria-selected={i === index}
                    aria-label={p.title}
                    title={p.title}
                    onClick={() => select(i)}
                    className="group flex-1 py-2"
                  >
                    <span
                      className={`block h-1 transition-colors ${
                        i === index ? "bg-[#ffcd00]" : "bg-white/20 group-hover:bg-white/50"
                      }`}
                    />
                  </button>
                ))}
              </div>
            )}

            <a
              href={current.url}
              target="_blank"
              rel="noopener noreferrer"
              className="lg:hidden mt-4 flex items-baseline justify-between gap-4"
            >
              <span className="min-w-0">
                <span className="block font-['IBM_Plex_Mono',ui-monospace,SFMono-Regular,monospace] text-[11px] uppercase tracking-wider text-[#faf8f4]/50">{current.category}</span>
                <span className="block font-['Bricolage_Grotesque',ui-sans-serif,system-ui,sans-serif] font-extrabold text-2xl tracking-tight">{current.title}</span>
                {current.tagline && <span className="block text-sm text-[#faf8f4]/70">{current.tagline}</span>}
              </span>
              <span className="shrink-0 text-sm font-semibold text-[#ffcd00]">Open live →</span>
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
