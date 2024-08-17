import type { CSSValueInput, Rule } from "unocss";
import type { Theme } from "unocss/preset-uno";

export const fontRecursivePreflight = {
  "--un-font-axis-MONO": " ",
  "--un-font-axis-CASL": " ",
  "--un-font-axis-CRSV": " ",
  "--un-font-axis-slnt": " ",
};

export const fontRecursiveRules: Rule<Theme>[] = [
  [
    /^font-rec(?:-(\w+))?(?:-(.+))?$/,
    ([, axis, value]) => {
      const props: CSSValueInput = {
        "font-variation-settings": "'MONO' var(--un-font-axis-MONO), 'CASL' var(--un-font-axis-CASL), 'CRSV' var(--un-font-axis-CRSV), 'slnt' (--un-font-axis-slnt)",
        "font-family": "Recursive Variable",
      };
      if (!axis) {
        return props;
      } else if (axis === "casl") {
        props["--un-font-axis-CASL"] = value ?? "1";
      } else if (axis === "mono") {
        props["--un-font-axis-MONO"] = value ?? "1";
      }
      return props;
    },
  ],
];
