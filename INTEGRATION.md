# Using the gallery in the crossborderdialogue.eu Lovable app

The components in `src/components/showcase/` only need React and Tailwind. They are self-contained: colours, fonts and buttons are inline Tailwind utilities, so no config or global CSS is needed. They need no router, no extra npm packages and no shadcn components; the modal is a native `<dialog>`.

## Files to copy

| From this repo | To the Lovable repo |
| --- | --- |
| `src/components/showcase/` (whole folder) | `src/components/showcase/` |
| `src/data/projects.json` | `src/data/showcase-projects.json` |
| `public/previews/` (whole folder) | `public/previews/` |

No design tokens or CSS need to be added. Requires Tailwind 3.4+ or v4. See [lovable/README.md](lovable/README.md) for the Lovable-specific steps.

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
