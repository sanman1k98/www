import { defineConfig } from 'astro/config';
import UnoCSS from "unocss/astro";
import prefetch from "@astrojs/prefetch";

// https://astro.build/config
export default defineConfig({
  integrations: [
    UnoCSS({
      injectReset: "@unocss/reset/sanitize/sanitize.css",
    }),
    prefetch(),
  ],
});
