/**
 * Validate src/data/projects.json against the files on disk.
 *   npm run validate
 * Exits 1 with a list of problems. Run after adding or editing projects.
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const projects = JSON.parse(fs.readFileSync(path.join(ROOT, "src/data/projects.json"), "utf8"));
const problems: string[] = [];
const seen = new Set<string>();
const IMAGES = ["hero", "full", "mobile", "highlight"];

if (!Array.isArray(projects)) problems.push("projects.json must be a JSON array");

for (const p of Array.isArray(projects) ? projects : []) {
  const id = p?.slug ?? "(no slug)";
  const bad = (m: string) => problems.push(`${id}: ${m}`);
  if (!p.slug || !/^[a-z0-9-]+$/.test(p.slug)) bad("slug must be lowercase letters, digits, hyphens");
  if (seen.has(p.slug)) bad("duplicate slug");
  seen.add(p.slug);
  if (!/^https?:\/\//.test(p.url ?? "")) bad("url must start with http(s)://");
  if (p.draft) bad("still marked draft: write the copy and remove `draft`");
  if (!p.title?.trim()) bad("title is empty");
  if (p.tagline && p.tagline.length > 60) bad(`tagline is ${p.tagline.length} chars (max 60)`);
  if (!p.description?.trim()) bad("description is empty");
  else if (p.description.length > 600) bad("description is too long (aim for 2-3 sentences)");
  if (!p.category?.trim()) bad("category is empty");
  const h = p.highlight;
  if (h) {
    if (!(Number.isFinite(h.y) && Number.isFinite(h.height) && h.y >= 0 && h.height > 0)) bad("highlight needs numeric y >= 0 and height > 0");
    else if (p.fullHeight && h.y + h.height > p.fullHeight + 1) bad(`highlight (${h.y}+${h.height}) extends past fullHeight ${p.fullHeight}`);
  } else bad("missing highlight {y, height}");
  for (const img of IMAGES) {
    if (!fs.existsSync(path.join(ROOT, "public/previews", p.slug ?? "", `${img}.webp`))) bad(`missing public/previews/${p.slug}/${img}.webp`);
  }
}

if (problems.length) {
  console.error(`✗ ${problems.length} problem(s):\n- ` + problems.join("\n- "));
  process.exit(1);
}
console.log(`✓ ${projects.length} project(s) valid`);
