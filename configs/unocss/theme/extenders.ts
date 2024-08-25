import type { ThemeExtender } from "unocss";
import type { CustomTheme } from "../types";
import { fontAxisToCustomProp } from "../utils";

// https://developer.mozilla.org/en-US/docs/Web/CSS/font-variation-settings#registered_and_custom_axes
const registeredAxes = ["wght", "wdth", "slnt", "ital", "opsz"];
const customAxisRE = /[A-Z]{4}/;

export const preflightWithFontAxesProps: ThemeExtender<CustomTheme> = (theme) => {
  if (theme.fontAxes) {
    theme.preflightBase ??= {};
    Object.assign(
      theme.preflightBase,
      Object.fromEntries(
        Object
          .entries(theme.fontAxes)
          .flatMap(([font, axes]) => Object.entries(axes).map(
            ([name, value]) => {
              if (registeredAxes.includes(name) || customAxisRE.test(name))
                return [fontAxisToCustomProp(name), value];
              throw new TypeError(`"${name}" is not a valid font axis name for ${font}`);
            },
          )),
      ),
    );
  }
};
