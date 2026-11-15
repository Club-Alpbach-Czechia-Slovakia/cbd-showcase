# Using the gallery in the crossborderdialogue.eu Lovable app

The components in `src/components/showcase/` only need React and Tailwind. They use the same class names the Lovable site already has (`text-cbd-blue`, `bg-cbd-yellow`, `btn-cbd btn-cbd-primary`, `font-display`, `font-mono`, …). They need no router, no extra npm packages and no shadcn components; the modal is a native `<dialog>`.

## Files to copy

| From this repo | To the Lovable repo |
| --- | --- |
| `src/components/showcase/` (whole folder) | `src/components/showcase/` |
| `src/data/projects.json` | `src/data/showcase-projects.json` |
| `public/previews/` (whole folder) | `public/previews/` |

Check that the Lovable app's CSS defines `--cbd-neutral` (`#f0ebe2`). It is the only token the components use that you might not have; the others are already there. If something looks off, compare it with `src/styles/cbd-tokens.css`.

Keep `.btn-cbd*` inside `@layer components`, which is where it lives in this repo. If it is unlayered, it overrides Tailwind utilities such as `hidden` / `md:flex` on buttons.

## Use on the Outcomes page

```tsx
import { ProjectGallery, ShowcaseHero, type Project } from "@/components/showcase";
import projects from "@/data/showcase-projects.json";

// Replace the existing outcomes grid:
<ProjectGallery projects={projects as Project[]} previewBase="/previews" />

// Optional: the rotating hero at the top of the page
<ShowcaseHero projects={projects as Project[]} previewBase="/previews" />
```

Both components accept `previewBase` if the screenshots live somewhere else, such as a CDN or Supabase storage. `ShowcaseHero` also accepts `label`, `headline`, `intro` and `galleryHref` to change the copy.

## Lovable prompt (if you prefer to let Lovable do it)

After pushing the files above to the connected GitHub repo, give Lovable this prompt:

> On the /outcomes page, replace the current card grid with `<ProjectGallery projects={projects} previewBase="/previews" />` imported from `@/components/showcase`, with the data from `@/data/showcase-projects.json`. Keep the existing page header and footer. Do not restyle or rewrite the showcase components.
