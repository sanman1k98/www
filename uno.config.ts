import {
  defineConfig,
  presetIcons,
  presetUno,
  transformerDirectives,
} from "unocss";
import type { CustomTheme } from "configs/unocss/types";
import { fontAxisRules } from "configs/unocss/rules/font-axis";
import { preflightWithFontAxesProps } from "configs/unocss/theme/extenders";

const fontFamily = {
  quicksand: [
    "Quicksand Variable",
    "ui-rounded",
    "Quicksand",
    "Manjari",
    "sans-serif",
  ].join(),
  rec: [
    "Recursive Variable",
    "sans-serif",
  ].join(),
  handwritten: [
    "Shantell Sans Variable",
    "casual",
    "cursive",
  ].join(),
} satisfies CustomTheme["fontFamily"];

const fontAxes = {
  // https://www.recursive.design
  "Recursive Variable": {
    MONO: 0,
    CASL: 0,
    CRSV: 0.5,
    slnt: 0,
  },
  // https://shantellsans.com
  "Shantell Sans Variable": {
    INFM: 0,
    BNCE: 0,
    SPAC: 0,
    ital: 0,
  },
} satisfies CustomTheme["fontAxes"];

export default defineConfig({
  rules: [
    ...fontAxisRules,
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
  theme: {
    fontFamily,
    fontAxes,
  },
  extendTheme: [
    preflightWithFontAxesProps,
  ],
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
  ],
});
