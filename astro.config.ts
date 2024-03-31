import { defineConfig, sharpImageService } from "astro/config";
import sitemap from "@astrojs/sitemap";
import icon from "astro-icon";
import UnoCSS from "unocss/astro";

export default defineConfig({
  site: "https://nicesandeep.com",
  prefetch: { prefetchAll: true },
  integrations: [
    sitemap(),
    icon(),
    UnoCSS({
      // When passing true, "@unocss/reset/tailwind.css" will be used
      injectReset: true,
    }),
  ],
  image: { service: sharpImageService() },
  vite: {
    optimizeDeps: {
      exclude: ["@resvg/resvg-js"],
    },
  },
});
