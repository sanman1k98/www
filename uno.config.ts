import {
  defineConfig,
  presetUno,
  presetWebFonts,
} from "unocss"

export default defineConfig({
  presets: [
    presetUno(),
    presetWebFonts({
      provider: "none",
      fonts: {
        mono: ["Cascadia Code PL",],
      },
    }),
  ],
});
