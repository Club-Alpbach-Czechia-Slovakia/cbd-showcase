---
name: add-website
description: Add one or more websites (hackathon projects) to the cbd-showcase gallery. Captures screenshots, scrapes text, writes the title/tagline/description/highlight copy, and validates the result. Use when asked to add, submit, include or update a website/project in the showcase gallery. Works with any LLM agent that can run shell commands and edit files.
---

# Add websites to the showcase gallery

This file is plain Markdown on purpose. Any agent that can **run shell commands** and **read/write files** can follow it (Claude Code, Codex, Cursor, Gemini CLI, Aider, OpenHands, a local model with tools, or a human). Run everything from the repo root of https://github.com/PeterWolfframm/cbd-showcase.

You do the judgement work (copy and highlight). Scripts do the rest. **Do not hand-edit screenshots or invent facts: use only what the capture output says.**

## 0. One-time setup

```bash
npm install
npx playwright install chromium
```

## 1. Register the sites

Append one line per site to `scripts/urls.txt`:

```
url | team | category
```

`team` and `category` are optional. Example: `https://example.lovable.app/ | Team Aurora | Enery.Lab`.
Skip URLs already in the file. Use the real, public, working URL.

## 2. Capture

```bash
npm run capture                      # only new URLs
npm run capture -- --only <slug>     # redo one (add --force to redo all)
```

Output per site:
- `public/previews/<slug>/{hero,full,mobile,highlight}.webp`
- `capture-output/<slug>.json` (scraped text and section positions)
- a **draft** entry appended to `src/data/projects.json`

The script prints the slug and flags HTTP errors. If `httpStatus` is not 200 (login wall, 404, password-protected), **stop for that site, tell the user, and set `"hidden": true`** rather than publishing an error page.

## 3. Write the copy (the part that needs you)

For each entry in `src/data/projects.json` with `"draft": true`:

1. Read `capture-output/<slug>.json`: `title`, `metaDescription`, `ogTitle`, `headings`, `bodyText`, `sections`.
2. If you can view images, look at `public/previews/<slug>/hero.webp` and `full.webp`. If not, rely on the text.
3. Fill the fields below, then **delete the `"draft"` key**.

| Field | Rule |
| --- | --- |
| `title` | The product/project name, not the page `<title>` boilerplate. |
| `tagline` | One hook, **≤ 60 characters**, no trailing period needed. |
| `description` | **2-3 sentences, plain language**: what it is, who it's for, what it does. Facts only from the capture. No hype, no invented metrics, no claims the site doesn't make. If the site says it is a prototype or uses illustrative data, say so. |
| `category` | Keep the one from `urls.txt`. If empty, pick from categories already used in `projects.json`. |
| `team` | From `urls.txt`. Leave out if unknown. Never guess names. |
| `highlight` | `{ "y": <px>, "height": <px> }`: the most visually impressive or most explanatory section, in px of the **1440-wide `full.webp`**. Take it from an entry in `sections` (`y`, `height`). Prefer a section with a clear heading; keep `height` between 600 and 1100 and `y + height ≤ fullHeight`. |
| `featured` | `true` for at most ~3-5 strongest projects (shown in the rotating hero). Default: leave unset. |
| `hidden` | `true` to keep the data but not show it. |

Do not change `slug`, `url` or `fullHeight`. Keep the JSON valid, 2-space indent, array order = display order.

Example entry:

```json
{
  "slug": "grid-connect-nexus",
  "url": "https://grid-connect-nexus.lovable.app/",
  "title": "Synapse",
  "tagline": "One continent. One living grid.",
  "description": "A platform that connects local energy communities to distribution and transmission grids across Austria, Czechia and Slovakia. Municipalities, power producers and citizens each get their own entry point.",
  "category": "Enery.Lab",
  "team": "Synapse",
  "highlight": { "y": 60, "height": 900 },
  "fullHeight": 3720,
  "featured": true
}
```

## 4. Re-cut the highlight images

```bash
npm run capture -- --crops
```

## 5. Validate (required)

```bash
npm run validate
npm run build
```

`validate` checks required fields, tagline length, no leftover drafts, highlight bounds, and that all four images exist. **Fix every reported problem and re-run until it prints `✓`.** Do not report success before both commands pass.

## 6. Deploy (automatic)

The site is hosted on GitHub Pages and **redeploys on every push to `main`** (`.github/workflows/deploy.yml`, which re-runs validate and build). Once step 5 passes, publish:

```bash
git add scripts/urls.txt src/data/projects.json public/previews capture-output
git commit -m "Add <slug(s)> to showcase"
git push origin main
gh run watch --exit-status   # optional: wait for the deploy to finish
```

Live URL: https://peterwolfframm.github.io/cbd-showcase/

Only deploy sites that passed validation. Skip hidden/error-page sites (they stay out of the commit message but may be committed as `hidden`). If the push or workflow fails, show the user the error.

## 7. Report

Tell the user, per site: slug, final title/tagline, whether it is featured or hidden, the live URL, and anything you were unsure about (e.g. error page, thin text, guessed category).

## Rules for any model

- Never fabricate: no made-up team members, stats, awards or features.
- Never publish a project whose page failed to load or shows a login/error screen.
- Don't edit `src/components/showcase/` or the scripts to make a project fit; fix the data instead.
- Don't add other people's content you weren't asked to add.
- If a command fails twice, stop and show the user the error instead of improvising.

## Using the gallery in another Lovable project

After steps 1-5, copy the changed `public/previews/<slug>/` folders and the new entries of `src/data/projects.json` into the target repo (`public/previews/` and `src/data/showcase-projects.json`). See `lovable/README.md`.

## Custom domain

To serve the gallery on a subdomain: put the hostname (one line, e.g. `showcase.example.com`) in `public/CNAME`, add a DNS `CNAME` record from that subdomain to `peterwolfframm.github.io`, then run `gh api -X PUT repos/PeterWolfframm/cbd-showcase/pages -f cname=<hostname> -F https_enforced=true` after DNS resolves. The deploy workflow then builds with root paths, and GitHub redirects the old github.io URL to the new domain.
