// Merge into tailwind.config.ts / .js under theme.extend (Tailwind v3, the Lovable default).
// Colors are plain hex on purpose: opacity modifiers like bg-cbd-ink/15 only work then.
// Skip any key your app already defines. If it uses the same names with HSL variables, keep yours.
//
// theme: { extend: { ...paste below... } }
{
  colors: {
    "cbd-ink": "#14110f",
    "cbd-paper": "#faf8f4",
    "cbd-neutral": "#f0ebe2",
    "cbd-blue": "#145c9e",
    "cbd-yellow": "#ffcd00",
    "cbd-green": "#27ae60",
    // shadcn-based Lovable apps already define these; add only if missing:
    // background: "#faf8f4", foreground: "#14110f", "muted-foreground": "#6f6a61", border: "#14110f1a",
  },
  fontFamily: {
    display: ['"Bricolage Grotesque"', "ui-sans-serif", "system-ui", "sans-serif"],
    sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
    mono: ['"IBM Plex Mono"', "ui-monospace", "SFMono-Regular", "monospace"],
  },
}
