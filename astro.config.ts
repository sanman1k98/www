import { defineConfig } from 'astro/config';
import UnoCSS from "unocss/astro";
import prefetch from "@astrojs/prefetch";

// https://astro.build/config
export default defineConfig({
  site: "https://nicesandeep.com",
  integrations: [
    UnoCSS({
      // When passing true, "@unocss/reset/tailwind.css" will be used
      injectReset: true,
    }),
    prefetch(),
  ],
  experimental: {
    assets: true,
  },
});
