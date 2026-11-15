# Using the gallery in Lovable

Lovable cannot clone this repo, so the files must reach its GitHub repo first. Lovable syncs two-way with GitHub.

## 1. Copy files into the Lovable repo (clone it, push after)

| From this repo | To the Lovable repo |
| --- | --- |
| `src/components/showcase/` | `src/components/showcase/` |
| `src/data/projects.json` | `src/data/showcase-projects.json` |
| `public/previews/` | `public/previews/` |
| `lovable/showcase.css` | `src/showcase.css` |

## 2. Add the styles (about 2 minutes)

1. In `src/index.css`, after the `@tailwind` lines, add `@import "./showcase.css";` (imports must come first in some setups; if the build complains, paste the file's contents at the end instead).
2. Merge `lovable/tailwind.v3.snippet.js` into `tailwind.config.ts` under `theme.extend`. On Tailwind v4, use `src/styles/cbd-tokens.css` (`@theme`) instead.
3. Add the Google fonts to `index.html` if missing: Bricolage Grotesque, Inter, IBM Plex Mono.

## 3. Tell Lovable

1. Paste `lovable/KNOWLEDGE.md` into **Project settings → Knowledge**.
2. Send this chat prompt:

> On the /outcomes page, replace the current card grid with `<ProjectGallery projects={projects} previewBase="/previews" />` imported from `@/components/showcase`, with data from `@/data/showcase-projects.json` (cast to `Project[]`, filter out `hidden`). Keep the existing header and footer. Do not restyle or rewrite the showcase components.

If you have Claude Code, the `skills/integrate-showcase` skill automates all of the above.

## Compatibility

Checked: the components use no Tailwind v4-only utilities, only relative imports, plain `<dialog>`, and no extra packages, so they run on Lovable's default stack (Vite + React + Tailwind v3). Not yet run inside a live Lovable project.
