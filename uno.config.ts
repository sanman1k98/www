import type { Rule } from "unocss";
import {
  defineConfig,
  presetIcons,
  presetUno,
  presetWebFonts,
  transformerDirectives,
} from "unocss";

const fontRecursiveSettings = [
  "\"MONO\" var(--un-font-axis-mono, 0)",
  "\"CASL\" var(--un-font-axis-casl, 0)",
  "\"CRSV\" var(--un-font-axis-crsv, 0.5)",
  "\"slnt\" var(--un-font-axis-slnt, 0)",
].join();

const fontRecursiveRules: Rule[] = [
  [
    /^font-rec(?:-(\w+))?$/,
    ([, variation]) => {
      const families = ["Recursive Variable", "sans-serif"];
      const vars: Record<string, number | undefined> = {
        "--un-font-axis-casl": undefined,
        "--un-font-axis-mono": undefined,
        "--un-font-axis-crsv": undefined,
        "--un-font-axis-slnt": undefined,
      };
      if (variation) {
        switch (variation) {
          case "linear":
            vars["--un-font-axis-casl"] = 0;
            break;
          case "casl":
          case "casual":
            vars["--un-font-axis-casl"] = 1;
            break;
          case "mono":
            vars["--un-font-axis-mono"] = 1;
            families.splice(1, 0, "monospace");
            break;
          case "brush":
            vars["--un-font-axis-casl"] = 1;
            vars["--un-font-axis-slnt"] = -15;
            break;
          case "semicasl":
          case "semicasual":
            vars["--un-font-axis-casl"] = 0.5;
            break;
          case "quasi": // Quasi-proportional
            vars["--un-font-axis-mono"] = 0.5;
            break;
          default: return;
        }
      }
      return {
        ...vars,
        "font-family": families.join(),
        "font-variation-settings": fontRecursiveSettings,
      };
    },
  ],
  [
    /^(?:font-)?axis-(\w{4})-(.+)$/,
    ([, axis, value]) => {
      if (axis && value !== undefined) {
        const prop = `--un-font-axis-${axis.toLowerCase()}`;
        return { [prop]: value };
      }
      return undefined;
    },
  ],
];

export default defineConfig({
  rules: [
    ...fontRecursiveRules,
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
        recursive: [
          "Recursive Variable",
          "sans-serif",
        ],
        handwritten: [
          "Shantell Sans Variable",
          "casual",
          "cursive",
        ],
      },
    }),
  ],
});
