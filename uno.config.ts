import {
  defineConfig,
  presetIcons,
  presetUno,
  presetWebFonts,
  transformerDirectives,
} from "unocss";

export default defineConfig({
  rules: [
    ["list-dash", { "list-style-type": "'- '" }],
  ],
  shortcuts: {
    link: `
      transition duration-200
      underline underline-offset-[0.1em]
      decoration-0 decoration-transparent
      hover:text-sky-500 hover:decoration-current hover:decoration-[0.07em]
      print:text-sky-700 print:decoration-current print:decoration-[0.07em]
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
        quicksand: [
          "Quicksand Variable",
          "ui-rounded",
          "Quicksand",
          "Manjari",
          "sans-serif",
        ],
        recursive: ["Recursive Variable", "sans-serif"],
        handwritten: [
          "Shantell Sans Variable",
          "casual",
          "cursive",
        ],
      },
    }),
  ],
});
