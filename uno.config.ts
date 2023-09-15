import {
  defineConfig,
  presetUno,
  presetWebFonts,
  presetIcons,
  transformerDirectives
} from "unocss";

export default defineConfig({
  shortcuts: {
    link: `
      transition duration-200
      underline underline-offset-[0.1em]
      decoration-0 decoration-transparent
      hover:text-sky-500 hover:decoration-current hover:decoration-[0.07em]
    `,
  },
  transformers: [transformerDirectives()],
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
