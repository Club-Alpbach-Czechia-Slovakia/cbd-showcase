import { useEffect, useRef, useState, type RefObject } from "react";
import { useReducedMotion } from "./hooks";

/**
 * Self-contained motion layer for the showcase (no libraries, no global CSS file).
 * Keyframes are injected once via <ShowcaseMotionStyles/>; everything honours prefers-reduced-motion.
 */
const CSS = `
@keyframes sc-spin { to { transform: translate(-50%, -50%) rotate(360deg); } }
@keyframes sc-scan { 0% { transform: translateY(-100%); opacity: 0; } 15% { opacity: 1; } 100% { transform: translateY(1200%); opacity: 0; } }
@keyframes sc-shine { from { transform: translateX(-120%) skewX(-20deg); } to { transform: translateX(260%) skewX(-20deg); } }
@keyframes sc-pulse { 0%, 100% { box-shadow: 0 0 0 0 rgba(39,174,96,.7); } 70% { box-shadow: 0 0 0 7px rgba(39,174,96,0); } }
@keyframes sc-pop { 0% { transform: scale(.4) rotate(-8deg); opacity: 0; } 60% { transform: scale(1.12) rotate(2deg); opacity: 1; } 100% { transform: none; opacity: 1; } }
.sc-shine::after { content: ""; position: absolute; inset: 0; width: 40%; background: linear-gradient(90deg, transparent, rgba(255,255,255,.65), transparent); transform: translateX(-120%) skewX(-20deg); pointer-events: none; }
.sc-shine:hover::after { animation: sc-shine .8s ease; }
@media (prefers-reduced-motion: reduce) {
  .sc-anim, .sc-anim * { animation: none !important; transition: none !important; }
}
`;

export function ShowcaseMotionStyles() {
  return <style data-showcase-motion>{CSS}</style>;
}

/** true once the element has scrolled into view (never flips back). */
export function useInViewOnce<T extends Element>(ref: RefObject<T>, rootMargin = "0px 0px -12% 0px") {
  const reduced = useReducedMotion();
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    if (reduced) return setSeen(true);
    const el = ref.current;
    if (!el || seen) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setSeen(true);
          io.disconnect();
        }
      },
      { rootMargin, threshold: 0.15 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref, rootMargin, reduced, seen]);
  return seen;
}

/**
 * Pointer-driven 3D tilt + glare. Writes CSS variables on the element (no re-renders):
 * --rx/--ry (deg), --mx/--my (% for the glare), --glare (0..1).
 */
export function useTilt<T extends HTMLElement>(max = 9) {
  const ref = useRef<T>(null);
  const reduced = useReducedMotion();
  useEffect(() => {
    const el = ref.current;
    if (!el || reduced || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    let raf = 0;
    const set = (rx: number, ry: number, mx: number, my: number, g: number) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        el.style.setProperty("--rx", `${rx}deg`);
        el.style.setProperty("--ry", `${ry}deg`);
        el.style.setProperty("--mx", `${mx}%`);
        el.style.setProperty("--my", `${my}%`);
        el.style.setProperty("--glare", String(g));
      });
    };
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width;
      const y = (e.clientY - r.top) / r.height;
      set((0.5 - y) * max, (x - 0.5) * max, x * 100, y * 100, 1);
    };
    const leave = () => set(0, 0, 50, 50, 0);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
    };
  }, [max, reduced]);
  return ref;
}

/** Scroll-linked progress of an element through the viewport, written to --p (-1 … 1). */
export function useScrollVar<T extends HTMLElement>(ref: RefObject<T>) {
  const reduced = useReducedMotion();
  useEffect(() => {
    const el = ref.current;
    if (!el || reduced) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const p = (r.top + r.height / 2 - vh / 2) / (vh / 2 + r.height / 2);
      el.style.setProperty("--p", Math.max(-1, Math.min(1, p)).toFixed(3));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [ref, reduced]);
}

/** Splits text into words that rise out of a mask, staggered. */
export function RevealWords({ text, show, delay = 0, step = 70 }: { text: string; show: boolean; delay?: number; step?: number }) {
  return (
    <span aria-label={text}>
      {text.split(" ").map((w, i) => (
        <span key={i} aria-hidden className="inline-block overflow-hidden pb-[0.08em] -mb-[0.08em] align-bottom">
          <span
            className="inline-block"
            style={{
              transform: show ? "none" : "translateY(125%) rotate(3deg)",
              transition: `transform .9s cubic-bezier(.2,.9,.2,1) ${delay + i * step}ms`,
            }}
          >
            {w}
            {i < text.split(" ").length - 1 ? " " : ""}
          </span>
        </span>
      ))}
    </span>
  );
}
