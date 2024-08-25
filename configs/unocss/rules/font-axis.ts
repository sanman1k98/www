import type { Rule } from "unocss";
import type { CustomTheme, FontAxes } from "../types";
import { fontAxisToCustomProp } from "../utils";

export function createFontVariationSettingsValue<const TObj extends FontAxes>(obj: TObj) {
  return Object.keys(obj).map(
    name => `"${name}" var(${fontAxisToCustomProp(name)})`,
  ).join();
}

export const fontAxisRules: Rule<CustomTheme>[] = [
  [
    /^(?:font-)?axis-(\w{4})-(.+)$/,
    ([, axis, value], { theme }) => {
      if (!theme.fontAxes || axis === undefined || value === undefined)
        return;
      const axes = Object
        .values(theme.fontAxes)
        .find(axes => Object.keys(axes).some(k => k.toLowerCase() === axis));
      if (!axes)
        return;
      return {
        [fontAxisToCustomProp(axis)]: value,
        "font-variation-settings": createFontVariationSettingsValue(axes),
      };
    },
  ],
];
