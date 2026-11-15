import { useEffect, useRef, useState } from "react";
import type { Project } from "./types";
import { BrowserFrame } from "./BrowserFrame";
import { CategoryTag } from "./SectionLabel";

type Props = {
  project: Project | null;
  previewBase: string;
  onClose: () => void;
};

/** Native <dialog>: large, freely scrollable screenshot (desktop / mobile) plus full copy. */
export function ProjectModal({ project, previewBase, onClose }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [view, setView] = useState<"desktop" | "mobile">("desktop");
  const [mobileMissing, setMobileMissing] = useState(false);

  useEffect(() => {
    const d = dialogRef.current;
    if (!d) return;
    if (project && !d.open) {
      setView("desktop");
      setMobileMissing(false);
      d.showModal();
    } else if (!project && d.open) {
      d.close();
    }
  }, [project]);

  // Jump to the highlighted section once the desktop screenshot has a size.
  const onDesktopLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    const box = scrollRef.current;
    if (!box || !project?.highlight) return;
    const scale = img.clientWidth / img.naturalWidth;
    box.scrollTo({ top: Math.max(0, project.highlight.y * scale - 12) });
  };

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      onClick={(e) => e.target === dialogRef.current && onClose()}
      className="m-auto w-[min(1200px,calc(100vw-2rem))] max-h-[calc(100dvh-2rem)] p-0 bg-[#faf8f4] text-[#14110f] overflow-hidden backdrop:bg-[#14110f]/80 backdrop:backdrop-blur-sm"
    >
      {project && (
        <div className="grid lg:grid-cols-[1.55fr_1fr] max-h-[calc(100dvh-2rem)]">
          <div className="bg-[#f0ebe2] p-4 sm:p-6 flex flex-col min-h-0">
            <div className="mb-3 flex items-center gap-1 font-['IBM_Plex_Mono',ui-monospace,SFMono-Regular,monospace] text-[11px] font-medium uppercase tracking-[0.18em]" role="tablist">
              {(["desktop", "mobile"] as const).map((v) => (
                <button
                  key={v}
                  role="tab"
                  aria-selected={view === v}
                  disabled={v === "mobile" && mobileMissing}
                  onClick={() => setView(v)}
                  className={`px-3 py-1.5 border transition-colors disabled:opacity-40 ${
                    view === v ? "bg-[#14110f] text-[#faf8f4] border-[#14110f]" : "border-[#14110f]/20 hover:border-[#14110f]"
                  }`}
                >
                  {v}
                </button>
              ))}
              <span className="ml-auto normal-case tracking-normal text-[#14110f]/50 hidden sm:inline">Scroll to explore</span>
            </div>

            {view === "desktop" ? (
              <BrowserFrame url={project.url} className="flex flex-col min-h-0">
                <div ref={scrollRef} className="overflow-y-auto h-[52vh] lg:h-[70vh] overscroll-contain">
                  <img
                    src={`${previewBase}/${project.slug}/full.webp`}
                    alt={`Full-page screenshot of ${project.title}`}
                    className="block w-full h-auto"
                    onLoad={onDesktopLoad}
                  />
                </div>
              </BrowserFrame>
            ) : (
              <div className="mx-auto w-[260px] sm:w-[290px] rounded-[2.2rem] border-[10px] border-[#14110f] bg-[#14110f] shadow-xl">
                <div className="overflow-y-auto h-[52vh] lg:h-[66vh] rounded-[1.5rem] bg-white overscroll-contain">
                  <img
                    src={`${previewBase}/${project.slug}/mobile.webp`}
                    alt={`Mobile screenshot of ${project.title}`}
                    className="block w-full h-auto"
                    onError={() => {
                      setMobileMissing(true);
                      setView("desktop");
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="relative p-6 sm:p-8 flex flex-col overflow-y-auto">
            <button
              type="button"
              onClick={onClose}
              className="absolute right-4 top-4 size-9 grid place-items-center text-xl hover:bg-[#14110f] hover:text-[#faf8f4] transition-colors"
              aria-label="Close"
            >
              ×
            </button>
            <div>
              <CategoryTag>{project.category}</CategoryTag>
            </div>
            <h2 className="mt-4 pr-8 font-['Bricolage_Grotesque',ui-sans-serif,system-ui,sans-serif] font-extrabold text-4xl leading-[0.95] tracking-tight">{project.title}</h2>
            {project.tagline && <p className="mt-3 text-lg font-medium text-[#145c9e]">{project.tagline}</p>}
            <p className="mt-5 leading-relaxed text-[#14110f]/80">{project.description}</p>
            {project.team && (
              <dl className="mt-6 border-t border-[#14110f]/10 pt-4 font-['IBM_Plex_Mono',ui-monospace,SFMono-Regular,monospace] text-xs">
                <dt className="uppercase tracking-wider text-[#14110f]/50">Team</dt>
                <dd className="mt-1 text-sm">{project.team}</dd>
              </dl>
            )}
            <div className="mt-auto pt-8">
              <a
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 group/btn font-semibold transition active:translate-y-px bg-[#ffcd00] text-[#14110f] hover:brightness-105 px-6 py-3.5 text-sm font-bold w-full sm:w-auto"
              >
                Open the live site <span className="inline-block transition-transform group-hover/btn:translate-x-1">→</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </dialog>
  );
}
