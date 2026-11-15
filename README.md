# Cross-Border Dialogue · Hackathon Showcase

A gallery of every hackathon project with auto-scrolling previews, styled like crossborderdialogue.eu.

## Adding projects

1. Put the URLs in `scripts/urls.txt`, one per line, in the form `url | team | category` (team and category are optional).
2. Capture the sites:
   ```bash
   npm run capture            # only new URLs; add -- --force to redo all, or -- --only <slug> for one
   ```
   This writes screenshots to `public/previews/<slug>/` (`hero`, `full`, `mobile`, `highlight` .webp) and the scraped text plus section positions to `capture-output/<slug>.json`. It also adds a **draft** entry to `src/data/projects.json`.
3. Ask Claude Code: *"write the copy for the draft projects"*. It reads `capture-output/*.json` and the screenshots, then fills in the following fields and removes `draft`:
   - `title`
   - `tagline` (≤ 60 chars)
   - `description` (2–3 sentences)
   - `category`
   - `highlight` (the `{ y, height }` of the most important section, in px of the 1440-wide screenshot)
   - `featured` (whether the project appears in the rotating hero)
4. Re-cut the highlight images:
   ```bash
   npm run capture -- --crops
   ```

`projects.json` fields can be edited by hand at any time. Set `"hidden": true` to keep a project's data without showing it.

## Develop / build

```bash
npm install
npx playwright install chromium   # once, for the capture script
npm run dev
npm run build                     # static site in dist/, deploy anywhere
```

## Notes
- Sites that answer with an HTTP error (for example password-protected ones) are flagged during capture. Their screenshots will show the error page.
- The capture script dismisses cookie banners, hides the "Edit with Lovable" badge, forces scroll-reveal content to be visible and caps full-page screenshots at 9000px.
- To put the gallery into the Lovable site, see [INTEGRATION.md](INTEGRATION.md).

## Reuse in another Lovable / React project

Copy `skills/integrate-showcase/` into the target repo's `.claude/skills/` (or `~/.claude/skills/`), then ask Claude Code: *"add the CBD showcase gallery to this app"*. See [INTEGRATION.md](INTEGRATION.md) for the manual steps.
