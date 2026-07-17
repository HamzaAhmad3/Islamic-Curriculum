// @ts-check
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

// Deploys to https://hamzaahmad3.github.io/Islamic-Curriculum/ via GitHub Pages.
// `base` must match the repo name exactly, including casing — GitHub Pages
// project-site paths are case-sensitive even though the github.io domain isn't.
export default defineConfig({
  site: "https://hamzaahmad3.github.io",
  base: "/Islamic-Curriculum/",
  output: "static",
  integrations: [sitemap()],
  build: {
    format: "directory",
  },
});
