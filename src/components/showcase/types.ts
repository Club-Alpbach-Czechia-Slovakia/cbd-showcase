export type Project = {
  /** Folder name under /previews */
  slug: string;
  url: string;
  title: string;
  /** Short hook, ≤ 60 characters */
  tagline?: string;
  /** 2–3 sentences */
  description: string;
  category: string;
  team?: string;
  /** The most important section of the site, in px of the 1440-wide full screenshot */
  highlight?: { y: number; height: number };
  fullHeight?: number;
  /** Shown in the rotating hero */
  featured?: boolean;
  /** Set by the capture script until the copy is written/reviewed */
  draft?: boolean;
  /** Keep in data but don't render */
  hidden?: boolean;
};
