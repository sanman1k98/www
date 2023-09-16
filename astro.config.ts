import { defineConfig } from 'astro/config';
import UnoCSS from "unocss/astro";
// import pandacss from "@pandacss/astro";

// https://astro.build/config
export default defineConfig({
  site: "https://nicesandeep.com",
  integrations: [
    // pandacss(),
    UnoCSS({
      // When passing true, "@unocss/reset/tailwind.css" will be used
      injectReset: true,
    }),
  ],
  image: {
    service: { entrypoint: "astro/assets/services/sharp" },
  },
});
