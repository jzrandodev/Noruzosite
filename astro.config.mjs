// @ts-check
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

// site/base are set for GitHub Pages project hosting.
// When pushing to github.com/<user>/<repo>, set base to "/<repo>" — or remove
// both once a custom domain is attached.
export default defineConfig({
  site: "https://jzrandodev.github.io",
  base: "/Noruzosite",
  integrations: [sitemap()],
  vite: {
    assetsInclude: ["**/*.frag", "**/*.vert"],
  },
});
