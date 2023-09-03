import {
  defineConfig,
  presetUno,
  presetWebFonts,
  presetIcons,
} from "unocss";

export default defineConfig({
  presets: [
    presetUno(),
    presetIcons({
      extraProperties: {
        "display": "inline-block",
        "height": "1.2em",
        "width": "1.2em",
        "vertical-align": "text-bottom",
      },
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
