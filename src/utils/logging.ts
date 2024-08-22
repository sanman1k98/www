/**
 * @file Custom wrappers around "node:util" functions for logging.
 */
import { format as _format, inspect, styleText } from "node:util";

inspect.defaultOptions = {
  colors: process.stdout.hasColors(),
};

/**
 * Wrapper around Node's `util.format()` with support for tagged templates.
 * @param arg - A "printf"-like format string or a list of strings when called as a tag function.
 * @param exprs - Values to pass to `util.format()`.
 *
 * @example
 * ```ts
 * import { format as fmt } from "@/utils/logging";
 * const name = "World";
 * console.log(fmt("Hello %s!", name));
 * console.log(fmt`Hello ${name}!`);
 * ```
 *
 * @see https://nodejs.org/docs/latest/api/util.html#utilformatformat-args
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals#tagged_templates
 */
export function format(arg: string | unknown | TemplateStringsArray, ...exprs: any[]): string {
  if (typeof arg === "string") {
    return _format(arg, ...exprs);
  } else if (
    Array.isArray(arg)
    && Object.hasOwn(arg, "raw")
    && exprs.length === arg.length - 1
  ) {
    const strings: string[] | null = arg.reduce(
      (arr, el, i) => {
        if (!arr || typeof el !== "string") {
          return null;
        } else if (i === exprs.length) {
          arr[i] = arg[i];
          return arr;
        }
        let str: string;
        const exprType = typeof exprs[i];
        switch (exprType) {
          case "string":
            str = el.concat("%s");
            break;
          case "number":
            str = el.concat("%d");
            break;
          default:
            str = el.concat("%O");
            break;
        }
        arr[i] = str;
        return arr;
      },
      Array(arg.length),
    );
    if (strings)
      return _format(strings.join(""), ...exprs);
  }
  return inspect(arg, ...exprs);
}

type StyleTextParam = Parameters<typeof styleText>[0];
type Format = Extract<StyleTextParam, string>;

/**
 * A callback which wraps Node's `util.styleText()` with a specified text format.
 * Can be called with a single string argument or as a tagged template.
 * @template T - The the text format passed to `util.styleText()`. Unused in type declaration but is
 * displayed in an IDE when showing hover information.
 *
 * @see https://nodejs.org/docs/latest/api/util.html#utilstyletextformat-text
 * @see https://nodejs.org/docs/latest/api/util.html#modifiers
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals#tagged_templates
 */
// @ts-expect-error unused type param is used for LSP hover information.
// eslint-disable-next-line unused-imports/no-unused-vars
type Style<T extends StyleTextParam = StyleTextParam>
  = (text: string | TemplateStringsArray, ...exprs: string[]) => string;

/**
 * Creates helper functions to style text for standard output.
 * @param format - The text format passed to `util.styleText()`.
 * @template const T - Preserves the literal type of `format` to use as type argument for `Style<T>`
 * @returns A callback to format text using Node's `util.styleText()` with the specified `format`.
 * Can be called with a single string argument, or as a tagged template.
 *
 * @example
 * ```ts
 * const bold = createStyle("bold");
 * const ital = createStyle("italic");
 * console.log(ital`Hello, ${bold("World")}!`);
 * ```
 *
 * @see {@link Style}
 * @see https://nodejs.org/docs/latest/api/util.html#utilstyletextformat-text
 * @see https://nodejs.org/docs/latest/api/util.html#modifiers
 * @see https://www.totaltypescript.com/const-type-parameters
 */
export function createStyle<const T extends StyleTextParam>(format: T): Style<T> {
  return (text, ...exprs) => {
    if (typeof text === "string")
      return styleText(format, text);
    else if (text.length === 1 && text[0])
      return styleText(format, text[0]);
    else
      return styleText(format, text.map((s, i) => s.concat(exprs[i] ?? "")).join(""));
  };
}

function createStyles<
  const T extends Format[],
>(styles: T) {
  return Object.fromEntries(
    styles.map(name => [name, createStyle(name)]),
  ) as { [k in T[number]]: Style<k & T[number]> };
}

function createStyleShortcuts<
  const TObj extends { [k: string]: StyleTextParam },
>(styles: TObj) {
  return Object.fromEntries(
    Object.entries(styles).map(([name, fmt]) => [name, createStyle(fmt)]),
  ) as { [k in keyof TObj]: Style<TObj[k]> };
}

const colors = createStyles([
  "green",
  "blue",
  "cyan",
]);

const modifiers = createStyleShortcuts({
  B: "bold",
  U: "underline",
  I: "italic",
  muted: ["dim", "gray"],
});

/**
 * Use to style log messages.
 *
 * @example
 * ```ts
 * import { styles as c } from "@/utils/logging";
 *
 * console.log(c.B`Bolded text`);
 * console.log(c.I`Italic text`);
 * console.log(c.U`Underlined text`);
 * console.log(c.blue`Blue text`);
 * console.log(c.green`Green text`);
 * ```
 */
export const styles = {
  ...modifiers,
  ...colors,
} satisfies Record<string, Style>;
