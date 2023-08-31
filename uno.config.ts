import {
  defineConfig,
  presetUno,
  presetWebFonts,
  presetIcons,
} from "unocss"

export default defineConfig({
  presets: [
    presetUno(),
    presetIcons({
      collections: {
        carbon: () => import("@iconify-json/carbon/icons.json").then(i => i.default),
      }
    }),
    presetWebFonts({
      provider: "none",
      fonts: {
        mono: ["Cascadia Code PL"],
        quicksand: ["Quicksand Variable", "sans-serif"],
        redhat: ["Red Hat Display Variable", "sans-serif"],
      },
    }),
  ],
});
