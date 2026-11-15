import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// GitHub Pages serves this project at /cbd-showcase/. Override with VITE_BASE=/ for other hosts.
export default defineConfig({
  base: process.env.VITE_BASE ?? "/cbd-showcase/",
  plugins: [react(), tailwindcss()],
});
