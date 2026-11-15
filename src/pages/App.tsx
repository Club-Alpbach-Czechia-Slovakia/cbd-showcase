import { useEffect, useState } from "react";
import projectsData from "../data/projects.json";
import type { Project } from "../data/types";
import { ProjectGallery, SectionLabel } from "../components/showcase";

const projects = (projectsData as Project[]).filter((p) => !p.hidden);
const PREVIEW_BASE = `${import.meta.env.BASE_URL}previews`.replace(/\/+/g, "/");
const CBD_URL = "https://crossborderdialogue.eu";

const NAV = [
  { label: "About", href: `${CBD_URL}/#about` },
  { label: "Conferences", href: `${CBD_URL}/#conferences` },
  { label: "Outcomes", href: `${CBD_URL}/outcomes` },
  { label: "Photos", href: `${CBD_URL}/photos` },
  { label: "Partners", href: `${CBD_URL}/#partners` },
];

const FOOTER_LINKS = [
  { label: "About", href: `${CBD_URL}/#about` },
  { label: "Conferences", href: `${CBD_URL}/#conferences` },
  { label: "Outcomes", href: `${CBD_URL}/outcomes` },
  { label: "Team", href: `${CBD_URL}/team` },
  { label: "Photos", href: `${CBD_URL}/photos` },
  { label: "Partners", href: `${CBD_URL}/#partners` },
  { label: "Extra Materials", href: `${CBD_URL}/extra-materials` },
  { label: "Contact", href: `${CBD_URL}/#contact` },
  { label: "Impressum & Datenschutz", href: `${CBD_URL}/impressum` },
];

const SOCIALS = [
  { label: "Instagram", href: "https://www.instagram.com/crossborderdialogue/" },
  { label: "LinkedIn", href: "https://www.linkedin.com/company/cross-border-dialogue/" },
];

function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll(".reveal");
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-visible");
            io.unobserve(e.target);
          }
        }),
      { threshold: 0.12 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

function Logo() {
  return (
    <svg viewBox="-15 -15 125 98" className="h-9 w-auto" role="img" aria-label="Cross-Border Dialogue">
      <g transform="scale(0.095)" fill="none" strokeWidth="40" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16.5,75 L232,155 L288.5,93.5 L500,224 L614,62 L783,96 L923,0" stroke="#145C9E" />
        <path d="M620.5,652.5 L485.5,424.5 L532,267 L637,117 L793.5,148.5 L950.5,39.5" stroke="#27AE60" />
        <path d="M580,678.5 L431.5,433.5 L479,268.5 L297.5,158.5 L246,213.5 L0,120" stroke="#FFCD00" />
      </g>
    </svg>
  );
}

function Header() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 bg-background transition-shadow duration-300 ${
        scrolled ? "shadow-[0_1px_0_0_rgba(20,17,15,0.1)]" : ""
      }`}
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-10 h-16 md:h-20 flex items-center justify-between gap-6">
        <a href={`${CBD_URL}/`} className="inline-flex items-center gap-3 shrink-0">
          <Logo />
          <span className="font-display font-extrabold tracking-tight text-foreground leading-none">Cross-Border Dialogue</span>
        </a>
        <nav className="hidden lg:flex items-center gap-8 text-sm font-medium">
          {NAV.map((l) => (
            <a key={l.label} href={l.href} className="text-muted-foreground hover:text-cbd-blue transition-colors">
              {l.label}
            </a>
          ))}
        </nav>
        <div className="hidden md:flex items-center gap-3">
          <a href={`${CBD_URL}/become-a-partner`} className="btn-cbd btn-cbd-secondary px-4 py-2 text-sm">Become a Partner</a>
          <a href={`${CBD_URL}/#join`} className="btn-cbd btn-cbd-primary px-4 py-2 text-sm">Become a Cross Border Leader</a>
        </div>
        <a href={`${CBD_URL}/#join`} className="md:hidden btn-cbd btn-cbd-primary px-3 py-2 text-sm">Join</a>
      </div>
    </header>
  );
}

function SectionHeading({ label, title, children }: { label: string; title: React.ReactNode; children?: React.ReactNode }) {
  return (
    <div className="reveal max-w-4xl">
      <SectionLabel>{label}</SectionLabel>
      <h2 className="mt-5 font-display font-extrabold text-4xl md:text-5xl lg:text-6xl leading-[1.02] tracking-tight">{title}</h2>
      {children && <p className="mt-8 max-w-2xl text-lg text-muted-foreground leading-relaxed">{children}</p>}
    </div>
  );
}

export default function App() {
  useReveal();
  return (
    <div id="top" className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="pt-16 md:pt-20">
        <section id="gallery" className="mx-auto max-w-7xl px-6 lg:px-10 py-16 md:py-24">
          <SectionHeading label="Outcomes" title={<>All <span className="text-cbd-blue">projects</span></>}>
            Everything built by young people at our hackathon. Hover over a project to scroll through it.
          </SectionHeading>
          <div className="mt-12 lg:mt-16">
            <ProjectGallery projects={projects} previewBase={PREVIEW_BASE} />
          </div>
        </section>
      </main>

      <footer className="border-t border-border bg-background text-muted-foreground">
        <div className="mx-auto max-w-7xl px-6 lg:px-10 py-12 grid gap-10 md:grid-cols-[1.4fr_1fr_1fr] text-sm">
          <div>
            <a href={`${CBD_URL}/`} className="inline-flex items-center gap-3 font-display font-extrabold text-foreground tracking-tight">
              <Logo /> Cross-Border Dialogue
            </a>
            <p className="mt-4 max-w-sm leading-relaxed">
              A pan-European youth movement turning cross-border challenges into shared impact, born between Austria, Czechia and Slovakia.
            </p>
          </div>
          <ul className="space-y-2">
            {FOOTER_LINKS.map((l) => (
              <li key={l.label}>
                <a href={l.href} className="hover:text-cbd-blue transition-colors">{l.label}</a>
              </li>
            ))}
          </ul>
          <ul className="space-y-2">
            {SOCIALS.map((l) => (
              <li key={l.label}>
                <a href={l.href} target="_blank" rel="noopener noreferrer" className="hover:text-cbd-blue transition-colors">{l.label}</a>
              </li>
            ))}
          </ul>
        </div>
        <div className="mx-auto max-w-7xl px-6 lg:px-10 pb-10 font-mono text-xs flex flex-col sm:flex-row gap-2 sm:justify-between">
          <p>© {new Date().getFullYear()} Verein Cross-Border Dialogue</p>
          <p>Badhausgasse 18–20/15, 1070 Vienna, Austria</p>
        </div>
      </footer>
    </div>
  );
}
