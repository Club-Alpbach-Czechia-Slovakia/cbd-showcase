# Paste into Lovable → Project settings → Knowledge

The project contains a showcase gallery in `src/components/showcase/` (data in `src/data/showcase-projects.json`, screenshots in `public/previews/<slug>/{hero,full,mobile,highlight}.webp`).

Rules:
- Do not edit, restyle or rewrite files in `src/components/showcase/`. Change only the props or the data.
- Use it with: `import { ProjectGallery, ShowcaseHero, type Project } from "@/components/showcase";`
  `<ProjectGallery projects={projects as Project[]} previewBase="/previews" />`
- Projects are only added or changed in `src/data/showcase-projects.json` (fields: slug, url, title, tagline ≤ 60 chars, description, category, team, highlight {y,height}, featured, hidden). `slug` must equal a folder name under `public/previews/`.
- Set `"hidden": true` to hide a project instead of deleting it.
- The components are self-contained: colours, fonts and button styles are inline Tailwind utilities. No tailwind.config or global CSS changes are needed, so do not add any for the gallery. Requires Tailwind 3.4+.
- Do not add npm packages for the gallery. It needs only React and Tailwind.
