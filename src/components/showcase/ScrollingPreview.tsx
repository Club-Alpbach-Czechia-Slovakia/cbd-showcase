import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useReducedMotion } from "./hooks";

type Props = {
  src: string;
  alt: string;
  /** While true the screenshot glides to the bottom of the page; when false it returns to `restY`. */
  active: boolean;
  /** Resting scroll offset in px of the source screenshot (e.g. the highlight section). */
  restY?: number;
  /** Width the screenshot was captured at (restY is in this coordinate space). */
  sourceWidth?: number;
  /** Scroll speed in source px per second. */
  speed?: number;
  /** Clamp for the total scroll time (seconds). */
  minDuration?: number;
  maxDuration?: number;
  /** CSS aspect-ratio of the viewport. */
  aspect?: string;
  /** Called once the scroll has reached the bottom (or after minDuration for short pages). */
  onCycleEnd?: () => void;
  eager?: boolean;
  className?: string;
};

/**
 * Shows a full-page screenshot through a fixed "viewport" and scrolls it with a CSS transform.
 * No libraries; honours prefers-reduced-motion.
 */
export function ScrollingPreview({
  src,
  alt,
  active,
  restY = 0,
  sourceWidth = 1440,
  speed = 260,
  minDuration = 4,
  maxDuration = 16,
  aspect = "16 / 10",
  onCycleEnd,
  eager,
  className = "",
}: Props) {
  const boxRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [m, setM] = useState({ boxW: 0, boxH: 0, imgH: 0 });
  const [failed, setFailed] = useState(false);
  const reduced = useReducedMotion();

  const measure = () => {
    const box = boxRef.current;
    const img = imgRef.current;
    if (!box || !img || !img.naturalWidth) return;
    const boxW = box.clientWidth;
    setM({ boxW, boxH: box.clientHeight, imgH: (boxW * img.naturalHeight) / img.naturalWidth });
  };

  useLayoutEffect(() => {
    const box = boxRef.current;
    if (!box) return;
    const ro = new ResizeObserver(measure);
    ro.observe(box);
    return () => ro.disconnect();
  }, []);

  const maxShift = Math.max(0, m.imgH - m.boxH);
  const renderScale = m.boxW / sourceWidth; // source px → rendered px
  const restShift = Math.min(maxShift, Math.max(0, restY * renderScale));
  const scrolling = active && !reduced && maxShift > 0;
  const distanceSrc = (maxShift - restShift) / (renderScale || 1);
  const duration = Math.min(maxDuration, Math.max(minDuration, distanceSrc / speed));

  const shift = scrolling ? maxShift : restShift;
  const transition = scrolling
    ? `transform ${duration}s cubic-bezier(.45,.05,.55,.95) 0.35s`
    : "transform 0.9s cubic-bezier(.2,.7,.2,1)";

  const cb = useRef(onCycleEnd);
  cb.current = onCycleEnd;
  useEffect(() => {
    if (!active || !m.boxW) return;
    const ms = scrolling ? (duration + 0.35) * 1000 : minDuration * 1000;
    const t = setTimeout(() => cb.current?.(), ms);
    return () => clearTimeout(t);
  }, [active, scrolling, duration, minDuration, m.boxW]);

  return (
    <div
      ref={boxRef}
      className={`relative overflow-hidden bg-[#f0ebe2] ${className}`}
      style={{ aspectRatio: aspect }}
    >
      {failed ? (
        <div className="absolute inset-0 grid place-items-center p-6 text-center font-['IBM_Plex_Mono',ui-monospace,SFMono-Regular,monospace] text-xs text-[#14110f]/50">
          Preview not available yet
        </div>
      ) : (
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          loading={eager ? "eager" : "lazy"}
          decoding="async"
          draggable={false}
          onLoad={measure}
          onError={() => setFailed(true)}
          className="absolute inset-x-0 top-0 w-full h-auto select-none will-change-transform"
          style={{ transform: `translate3d(0, ${-shift}px, 0)`, transition }}
        />
      )}
    </div>
  );
}
