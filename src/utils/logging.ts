import { format as _format, inspect, styleText } from "node:util";

inspect.defaultOptions = {
  colors: process.stdout.hasColors(),
};

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

type Formats = Parameters<typeof styleText>[0];
type Format = Extract<Formats, string>;
// type Format = Exclude<Parameters<typeof styleText>[0], string[]>;
// @ts-expect-error unused type param is shown for hover info
// eslint-disable-next-line unused-imports/no-unused-vars
type Style<T extends Formats = Formats>
  = (text: string | TemplateStringsArray, ...exprs: string[]) => string;

export function createStyle<const TFormat extends Formats>(format: TFormat): Style<TFormat> {
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
  const TObj extends { [k: string]: Formats },
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

export const styles = {
  ...modifiers,
  ...colors,
} satisfies Record<string, Style>;
