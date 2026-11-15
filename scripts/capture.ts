/**
 * Capture pipeline for the showcase.
 *
 *   npm run capture                 # capture every URL in scripts/urls.txt that has not been captured yet
 *   npm run capture -- --force      # re-capture everything
 *   npm run capture -- --only slug  # (re)capture one project
 *   npm run capture -- --crops      # re-cut highlight.webp from projects.json `highlight` regions
 *
 * Output per project:
 *   public/previews/<slug>/{hero,full,mobile,highlight}.webp
 *   capture-output/<slug>.json      (scraped text + section boxes, read by Claude Code to write copy)
 *   src/data/projects.json          (a draft entry is appended for new slugs)
 */
import { chromium, type Browser, type Page } from "playwright";
import sharp from "sharp";
import fs from "node:fs/promises";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const URLS_FILE = path.join(ROOT, "scripts/urls.txt");
const PREVIEW_DIR = path.join(ROOT, "public/previews");
const CAPTURE_DIR = path.join(ROOT, "capture-output");
const PROJECTS_FILE = path.join(ROOT, "src/data/projects.json");

const DESKTOP = { width: 1440, height: 900 };
const MOBILE = { width: 390, height: 844 };
const MAX_FULL_HEIGHT = 9000;
const MAX_MOBILE_HEIGHT = 7000;

// tsx (esbuild keepNames) wraps functions in __name(); define it in the page so page.evaluate works.
const NAME_SHIM = "window.__name = (f) => f;";

const args = process.argv.slice(2);
const FORCE = args.includes("--force");
const CROPS_ONLY = args.includes("--crops");
const ONLY = args.includes("--only") ? args[args.indexOf("--only") + 1] : undefined;

type UrlEntry = { url: string; team?: string; category?: string; slug: string };

type Section = { y: number; height: number; tag: string; id?: string; heading?: string; text: string };

export type CaptureResult = {
  slug: string;
  url: string;
  finalUrl: string;
  team?: string;
  category?: string;
  capturedAt: string;
  httpStatus: number;
  title: string;
  metaDescription?: string;
  ogTitle?: string;
  ogDescription?: string;
  headings: { level: number; text: string }[];
  bodyText: string;
  sections: Section[];
  fullHeight: number;
  fullHeightUncapped: number;
};

function slugify(url: string): string {
  const u = new URL(url);
  const host = u.hostname.replace(/^www\./, "");
  // Hosted vibe-coding apps share a domain (e.g. foo.lovable.app) – the subdomain is the useful bit.
  const parts = host.split(".");
  const base = parts.length > 2 ? parts.slice(0, -2).join("-") : parts[0];
  const p = u.pathname.replace(/\/+$/, "").replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "");
  return (base + (p ? `-${p}` : "")).toLowerCase().replace(/[^a-z0-9-]/g, "-").slice(0, 60);
}

async function readUrls(): Promise<UrlEntry[]> {
  const raw = await fs.readFile(URLS_FILE, "utf8").catch(() => "");
  const entries: UrlEntry[] = [];
  const seen = new Set<string>();
  for (const line of raw.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const [url, team, category] = trimmed.split("|").map((s) => s.trim());
    let normalized = url;
    if (!/^https?:\/\//.test(normalized)) normalized = `https://${normalized}`;
    let slug = slugify(normalized);
    while (seen.has(slug)) slug += "-2";
    seen.add(slug);
    entries.push({ url: normalized, team: team || undefined, category: category || undefined, slug });
  }
  return entries;
}

async function exists(p: string) {
  return fs.access(p).then(() => true, () => false);
}

/** Dismiss cookie banners, then scroll the page once so lazy images and reveal animations fire. */
async function prepare(page: Page) {
  await page
    .evaluate(() => {
      const re = /^(accept( all)?|agree|i agree|ok(ay)?|got it|allow all|alle akzeptieren|akzeptieren|zustimmen|souhlasím|prijať)$/i;
      for (const b of Array.from(document.querySelectorAll("button, a[role=button]"))) {
        if (re.test((b.textContent || "").trim())) (b as HTMLElement).click();
      }
    })
    .catch(() => {});

  await page.evaluate(async () => {
    const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
    const scroller = findScroller();
    const step = window.innerHeight * 0.7;
    for (let y = 0; y < scroller.scrollHeight && y < 20000; y += step) {
      scroller.scrollTo(0, y);
      await sleep(120);
    }
    scroller.scrollTo(0, 0);
    await sleep(300);

    function findScroller(): Element {
      const doc = document.scrollingElement || document.documentElement;
      if (doc.scrollHeight > window.innerHeight + 50) return doc;
      // SPA layouts sometimes scroll an inner container instead of the document.
      let best: Element = doc;
      for (const el of Array.from(document.querySelectorAll("body *"))) {
        const s = getComputedStyle(el);
        if (/(auto|scroll)/.test(s.overflowY) && el.scrollHeight > best.scrollHeight && el.clientHeight > window.innerHeight * 0.6) best = el;
      }
      return best;
    }
  });

  // Force reveal-on-scroll elements visible, hide leftover consent overlays.
  await page.addStyleTag({
    content: `
      *, *::before, *::after { animation-play-state: paused !important; transition: none !important; caret-color: transparent !important; }
      [class*="reveal"], [data-aos], [class*="fade"], [class*="animate-"] { opacity: 1 !important; transform: none !important; }
      [id*="cookie" i], [class*="cookie" i], [id*="consent" i], [class*="consent" i], [aria-label*="cookie" i],
      #lovable-badge, [aria-label="Edit with Lovable"], a[href*="utm_source=lovable-badge"], #bolt-badge, [class*="made-with" i] { display: none !important; }
    `,
  });

  // Unroll inner scroll containers so a fullPage screenshot captures everything.
  await page.evaluate(() => {
    const doc = document.scrollingElement || document.documentElement;
    if (doc.scrollHeight > window.innerHeight + 50) return;
    let best: HTMLElement | null = null;
    for (const el of Array.from(document.querySelectorAll<HTMLElement>("body *"))) {
      const s = getComputedStyle(el);
      if (/(auto|scroll)/.test(s.overflowY) && el.scrollHeight > (best?.scrollHeight ?? window.innerHeight + 50)) best = el;
    }
    let el: HTMLElement | null = best;
    while (el && el !== document.documentElement) {
      el.style.setProperty("overflow", "visible", "important");
      el.style.setProperty("height", "auto", "important");
      el.style.setProperty("max-height", "none", "important");
      el = el.parentElement;
    }
  });
  await page.waitForTimeout(400);
}

async function extract(page: Page) {
  return page.evaluate(() => {
    const meta = (sel: string) => document.querySelector<HTMLMetaElement>(sel)?.content?.trim() || undefined;
    const clean = (s: string | null | undefined) => (s || "").replace(/\s+/g, " ").trim();

    const headings = Array.from(document.querySelectorAll("h1, h2, h3"))
      .map((h) => ({ level: Number(h.tagName[1]), text: clean(h.textContent) }))
      .filter((h) => h.text)
      .slice(0, 40);

    const vw = window.innerWidth;
    const candidates = Array.from(document.querySelectorAll<HTMLElement>("section, header, footer, main > *, body > div > div > *, [id]"));
    const sections: Section[] = [];
    for (const el of candidates) {
      const r = el.getBoundingClientRect();
      if (r.height < 200 || r.width < vw * 0.6) continue;
      const y = Math.round(r.top + window.scrollY);
      const height = Math.round(r.height);
      if (sections.some((s) => Math.abs(s.y - y) < 40 && Math.abs(s.height - height) < 80)) continue;
      const heading = clean(el.querySelector("h1, h2, h3")?.textContent);
      sections.push({
        y,
        height,
        tag: el.tagName.toLowerCase(),
        id: el.id || undefined,
        heading: heading || undefined,
        text: clean(el.innerText).slice(0, 280),
      });
    }
    sections.sort((a, b) => a.y - b.y || b.height - a.height);

    return {
      title: clean(document.title),
      metaDescription: meta('meta[name="description"]'),
      ogTitle: meta('meta[property="og:title"]'),
      ogDescription: meta('meta[property="og:description"]'),
      headings,
      bodyText: clean(document.body.innerText).slice(0, 5000),
      sections: sections.slice(0, 30),
    };
  });
}

async function toWebp(png: Buffer, out: string, opts: { maxHeight?: number; width?: number } = {}) {
  const img = sharp(png);
  const { width = 0, height = 0 } = await img.metadata();
  let pipeline = img;
  if (opts.maxHeight && height > opts.maxHeight) {
    pipeline = pipeline.extract({ left: 0, top: 0, width, height: opts.maxHeight });
  }
  if (opts.width && width > opts.width) pipeline = pipeline.resize({ width: opts.width });
  await pipeline.webp({ quality: 74, effort: 5 }).toFile(out);
  return { width, height: Math.min(height, opts.maxHeight ?? height), uncapped: height };
}

async function captureOne(browser: Browser, entry: UrlEntry): Promise<CaptureResult> {
  const dir = path.join(PREVIEW_DIR, entry.slug);
  await fs.mkdir(dir, { recursive: true });

  const ctx = await browser.newContext({ viewport: DESKTOP, deviceScaleFactor: 1, colorScheme: "light", locale: "en-US" });
  await ctx.addInitScript(NAME_SHIM);
  const page = await ctx.newPage();
  try {
    let response = await page.goto(entry.url, { waitUntil: "networkidle", timeout: 45_000 }).catch(() => null);
    if (!response) response = await page.goto(entry.url, { waitUntil: "load", timeout: 45_000 });
    const httpStatus = response?.status() ?? 0;
    if (httpStatus >= 400) console.warn(`\n  ! ${entry.url} answered HTTP ${httpStatus} – preview will show an error page`);
    await page.waitForTimeout(1500);
    await prepare(page);

    await toWebp(await page.screenshot({ type: "png" }), path.join(dir, "hero.webp"));
    const full = await toWebp(await page.screenshot({ type: "png", fullPage: true }), path.join(dir, "full.webp"), {
      maxHeight: MAX_FULL_HEIGHT,
    });
    const data = await extract(page);
    const finalUrl = page.url();
    await ctx.close();

    // Mobile
    const mctx = await browser.newContext({ viewport: MOBILE, deviceScaleFactor: 2, isMobile: true, hasTouch: true, locale: "en-US" });
    await mctx.addInitScript(NAME_SHIM);
    const mpage = await mctx.newPage();
    try {
      await mpage.goto(entry.url, { waitUntil: "networkidle", timeout: 45_000 }).catch(() => {});
      await mpage.waitForTimeout(1200);
      await prepare(mpage);
      await toWebp(await mpage.screenshot({ type: "png", fullPage: true }), path.join(dir, "mobile.webp"), {
        maxHeight: MAX_MOBILE_HEIGHT * 2,
        width: 390 * 2,
      });
    } catch (e) {
      console.warn(`  ! mobile capture failed for ${entry.slug}: ${(e as Error).message}`);
    } finally {
      await mctx.close();
    }

    // Default highlight: the hero viewport. Claude Code refines this in projects.json.
    await cropHighlight(entry.slug, { y: 0, height: DESKTOP.height });

    return {
      slug: entry.slug,
      url: entry.url,
      finalUrl,
      team: entry.team,
      category: entry.category,
      capturedAt: new Date().toISOString(),
      ...data,
      httpStatus,
      fullHeight: full.height,
      fullHeightUncapped: full.uncapped,
    };
  } catch (e) {
    await ctx.close().catch(() => {});
    throw e;
  }
}

async function cropHighlight(slug: string, h: { y: number; height: number }) {
  const dir = path.join(PREVIEW_DIR, slug);
  const fullPath = path.join(dir, "full.webp");
  if (!(await exists(fullPath))) return;
  const img = sharp(fullPath);
  const { width = DESKTOP.width, height = 0 } = await img.metadata();
  const top = Math.max(0, Math.min(Math.round(h.y), height - 1));
  const hh = Math.max(1, Math.min(Math.round(h.height), height - top));
  await sharp(fullPath)
    .extract({ left: 0, top, width, height: hh })
    .resize({ width: 1200, withoutEnlargement: true })
    .webp({ quality: 80 })
    .toFile(path.join(dir, "highlight.webp"));
}

type ProjectEntry = Record<string, unknown> & { slug: string; highlight?: { y: number; height: number } };

async function readProjects(): Promise<ProjectEntry[]> {
  const raw = await fs.readFile(PROJECTS_FILE, "utf8").catch(() => "[]");
  return JSON.parse(raw);
}

async function writeProjects(list: ProjectEntry[]) {
  await fs.writeFile(PROJECTS_FILE, JSON.stringify(list, null, 2) + "\n");
}

async function main() {
  await fs.mkdir(PREVIEW_DIR, { recursive: true });
  await fs.mkdir(CAPTURE_DIR, { recursive: true });

  if (CROPS_ONLY) {
    const projects = await readProjects();
    for (const p of projects) {
      if (ONLY && p.slug !== ONLY) continue;
      if (!p.highlight) continue;
      await cropHighlight(p.slug, p.highlight);
      console.log(`✂  ${p.slug}  y=${p.highlight.y} h=${p.highlight.height}`);
    }
    return;
  }

  const entries = (await readUrls()).filter((e) => !ONLY || e.slug === ONLY);
  if (!entries.length) {
    console.log("No URLs. Add one per line to scripts/urls.txt  (url | team | category)");
    return;
  }

  const browser = await chromium.launch();
  const projects = await readProjects();
  const failures: string[] = [];

  for (const entry of entries) {
    const jsonPath = path.join(CAPTURE_DIR, `${entry.slug}.json`);
    if (!FORCE && !ONLY && (await exists(jsonPath))) {
      console.log(`·  ${entry.slug} (already captured)`);
      continue;
    }
    process.stdout.write(`→  ${entry.slug}  ${entry.url} … `);
    try {
      const result = await captureOne(browser, entry);
      await fs.writeFile(jsonPath, JSON.stringify(result, null, 2));
      console.log(`ok (${result.fullHeight}px)`);

      const existing = projects.find((p) => p.slug === entry.slug);
      if (existing) {
        existing.fullHeight = result.fullHeight;
        if (existing.highlight) await cropHighlight(entry.slug, existing.highlight);
      } else {
        projects.push({
          slug: entry.slug,
          url: entry.url,
          title: result.ogTitle || result.title || entry.slug,
          tagline: "",
          description: result.ogDescription || result.metaDescription || "",
          category: entry.category || "Uncategorized",
          team: entry.team,
          highlight: { y: 0, height: DESKTOP.height },
          fullHeight: result.fullHeight,
          featured: false,
          draft: true,
        });
      }
      await writeProjects(projects);
    } catch (e) {
      console.log("FAILED");
      console.warn(`   ${(e as Error).message.split("\n")[0]}`);
      failures.push(entry.url);
    }
  }

  await browser.close();
  if (failures.length) {
    console.log(`\n${failures.length} failed:\n  ${failures.join("\n  ")}`);
    process.exitCode = 1;
  }
}

main();
