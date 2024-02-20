import { defineConfig } from 'astro/config';
import sitemap from "@astrojs/sitemap"
import UnoCSS from "unocss/astro";

export default defineConfig({
  site: "https://nicesandeep.com",
  prefetch: { prefetchAll: true },
  integrations: [
    sitemap(),
    UnoCSS({
      // When passing true, "@unocss/reset/tailwind.css" will be used
      injectReset: true,
    }),
  ],
  image: {
    service: { entrypoint: "./src/lib/sharp-service.ts" },
  },
});
