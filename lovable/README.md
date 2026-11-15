# Using the gallery in Lovable

The components are **zero-config**: all colours, fonts, button styles and the dialog backdrop are inline Tailwind utilities (arbitrary values such as `bg-[#14110f]/15`). No tailwind.config changes, no global CSS, no extra npm packages, no router, no shadcn. Verified to compile on Tailwind v3.4 (Lovable's default) and v4.

Lovable cannot clone this repo, so the files must reach its GitHub repo first (Lovable syncs two-way with GitHub).

## 1. Copy files into the Lovable repo, then push

| From this repo | To the Lovable repo |
| --- | --- |
| `src/components/showcase/` | `src/components/showcase/` |
| `src/data/projects.json` | `src/data/showcase-projects.json` |
| `public/previews/` | `public/previews/` |

Optional: load the fonts in `index.html` (Bricolage Grotesque, IBM Plex Mono). Without them the components fall back to system fonts.

## 2. Tell Lovable

1. Paste `lovable/KNOWLEDGE.md` into **Project settings → Knowledge**.
2. Send this chat prompt:

> On the /outcomes page, replace the current card grid with `<ProjectGallery projects={projects} previewBase="/previews" />` imported from `@/components/showcase`, with data from `@/data/showcase-projects.json` (cast to `Project[]`, filter out `hidden`). Keep the existing header and footer. Do not restyle or rewrite the showcase components.

If you have Claude Code, the `skills/integrate-showcase` skill automates all of the above.

## Compatibility notes
- Needs Tailwind 3.4+ (uses `group/btn`, `backdrop:` and arbitrary values). Lovable's default is 3.4.
- Relative imports only, so the `@/` alias is needed only in your own page.
- Native `<dialog>` modal; layout choice is saved in `localStorage`.
- Not yet run inside a live Lovable project.
