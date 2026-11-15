---
name: integrate-showcase
description: Add the Cross-Border Dialogue hackathon project gallery (auto-scrolling browser-frame previews, modal, rotating hero) to a Lovable / React + Tailwind app by copying components, data and screenshots from the public cbd-showcase repo. Use when asked to add, install, port or integrate the showcase/gallery/outcomes grid into another Lovable project, or to add new projects to it.
---

# Integrate the CBD showcase gallery into a Lovable app

Source of truth: https://github.com/PeterWolfframm/cbd-showcase (public, MIT).
The components need only React + Tailwind (v3 or v4). No router, no extra npm packages, no shadcn; the modal is a native `<dialog>`.

Work in the target Lovable repo (cloned from its connected GitHub repo). Do not restyle or rewrite the showcase components.

## 1. Get the source

```bash
SRC=$(mktemp -d) && git clone --depth 1 https://github.com/PeterWolfframm/cbd-showcase "$SRC"
```

Read `$SRC/INTEGRATION.md` and `$SRC/src/styles/cbd-tokens.css` for anything newer than this skill.

## 2. Inspect the target before copying

- Confirm it is React + Tailwind and find the alias for `src` (usually `@/`). Check `tsconfig`/`vite.config`.
- Find the page that should host the gallery (often `/outcomes`, `/projects`) and any existing card grid it replaces.
- Check whether `src/components/showcase/`, `public/previews/` or `showcase-projects.json` already exist. If so, update, never blindly overwrite hand-edited data.

## 3. Copy files

| From `$SRC` | To the target |
| --- | --- |
| `src/components/showcase/` (whole folder) | `src/components/showcase/` |
| `src/data/projects.json` | `src/data/showcase-projects.json` |
| `public/previews/` (whole folder) | `public/previews/` |

If the target already has its own project data, keep it. Copy only the screenshots it needs and use its own JSON in the `Project` shape (`slug, url, title, tagline?, description, category, team?, highlight?, fullHeight?, featured?, hidden?`). `slug` must match a folder under `previews/` containing `hero.webp`, `full.webp`, `mobile.webp`, `highlight.webp`.

## 4. Styling (usually nothing to do)

The components are zero-config: colours, fonts, buttons and the dialog backdrop are inline Tailwind utilities (arbitrary values like `bg-[#14110f]/15`). No tokens, global CSS or `tailwind.config` edits are needed. Requirements: Tailwind 3.4+ (Lovable's default) or v4.

- Optional: load Bricolage Grotesque and IBM Plex Mono in `index.html`; otherwise system fonts are used.
- To rebrand, change the hex values in the components (search `#14110f`, `#faf8f4`, `#f0ebe2`, `#145c9e`, `#ffcd00`, `#27ae60`).
- For Lovable, tell the user to paste `$SRC/lovable/KNOWLEDGE.md` into Project settings → Knowledge (it can't be set from code).

## 5. Wire it into the page

```tsx
import { ProjectGallery, ShowcaseHero, type Project } from "@/components/showcase";
import projects from "@/data/showcase-projects.json";

const visible = (projects as Project[]).filter((p) => !p.hidden);

<ProjectGallery projects={visible} previewBase="/previews" />
// optional rotating hero:
<ShowcaseHero projects={visible} previewBase="/previews" />
```

- `previewBase` is where the screenshots are served (`/previews`, or a CDN / Supabase storage URL). If the app uses a non-root Vite `base`, build it from `import.meta.env.BASE_URL`.
- `ShowcaseHero` also takes `label`, `headline`, `intro`, `galleryHref`.
- Keep the existing page header and footer.
- If the app uses `JSON` imports without `resolveJsonModule`, enable it in `tsconfig`.

## 6. Verify

1. `npm run build` (type-check + build) passes.
2. Run the app and open the page: previews load (no 404s in the network tab), hovering a row scrolls the preview, clicking opens the modal, Esc closes it.
3. Check a phone-width viewport; check the tokens render the right colors and fonts.

## Adding more projects later

Use the capture pipeline in the source repo (it needs Playwright, so run it there, not in Lovable):

1. Add `url | team | category` lines to `scripts/urls.txt`.
2. `npm run capture` produces `public/previews/<slug>/*.webp` and a draft entry in `src/data/projects.json`.
3. Write the copy for drafts (title, tagline ≤ 60 chars, description 2-3 sentences, category, `highlight`, `featured`), then `npm run capture -- --crops`.
4. Copy the new `previews/<slug>/` folders and JSON entries into the Lovable repo.

## Lovable prompt (when pushing to the connected repo is enough)

> On the {page} page, replace the current card grid with `<ProjectGallery projects={projects} previewBase="/previews" />` imported from `@/components/showcase`, with the data from `@/data/showcase-projects.json`. Keep the existing page header and footer. Do not restyle or rewrite the showcase components.

## Pitfalls

- Screenshots of sites that returned an HTTP error show the error page. Check `capture-output/<slug>.json` before publishing.
- Never commit the other team's content you don't have the right to show; hide it with `"hidden": true`.
