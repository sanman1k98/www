import type { Primitive } from 'astro/zod';
/**
 * @file Custom wrappers around "node:util" functions for logging.
 */
import { format as _format, inspect, styleText } from 'node:util';

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
export function format(arg: string | TemplateStringsArray, ...exprs: any[]): string {
	if (typeof arg === 'string') {
		return _format(arg, ...exprs);
	} else if (
		Array.isArray(arg)
		&& Object.hasOwn(arg, 'raw')
		&& exprs.length === arg.length - 1
	) {
		const strings: string[] | null = arg.reduce(
			(arr, el, i) => {
				if (!arr || typeof el !== 'string') {
					return null;
				} else if (i === exprs.length) {
					arr[i] = arg[i];
					return arr;
				}
				let str: string;
				const exprType = typeof exprs[i];
				switch (exprType) {
					case 'string':
						str = el.concat('%s');
						break;
					case 'number':
						str = el.concat('%d');
						break;
					default:
						str = el.concat('%O');
						break;
				}
				arr[i] = str;
				return arr;
			},
			Array.from({ length: arg.length }),
		);
		if (strings)
			return _format(strings.join(''), ...exprs);
	}
	return inspect(arg, ...exprs);
}

/**
 * An SGR attribute or list of attributes.
 * The `format` parameter for `util.styleText()`.
 * @see {@link styleText}
 * @see {@link SGRAttribute}
 * @see https://nodejs.org/docs/latest/api/util.html#modifiers
 */
type TextFormat = Parameters<typeof styleText>[0];

/**
 * A key in `inspect.colors`, where each key is an SGR attribute name which corresponds to a pair of
 * predefined control codes. The pairs are tuples where the first and second elements are control
 * codes to enable and disable the attribute respectively.
 * @summary An ANSI SGR attribute name.
 *
 * @see https://en.wikipedia.org/wiki/ANSI_escape_code#SGR_(Select_Graphic_Rendition)_parameters
 * @see https://github.com/RafaelGSS/node/blob/cc26951180e629d131a4dd2211b96781c1af18cf/lib/internal/util/inspect.js#L385
 */
type SGRAttribute = Extract<TextFormat, string>;

/**
 * A callback which wraps Node's `util.styleText()` with a specified text format.
 * Can be called with a single string argument or as a tagged template.
 * @template T - The the text format passed to `util.styleText()`. Unused in type declaration but is
 * displayed in an IDE when showing hover information.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals#tagged_templates
 */
// @ts-expect-error unused type param is used for LSP hover information.
// eslint-disable-next-line unused-imports/no-unused-vars
type Style<T extends TextFormat = TextFormat>
  = (text: Primitive | TemplateStringsArray, ...exprs: Primitive[]) => string;

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
 * @see https://www.totaltypescript.com/const-type-parameters
 */
export function createStyle<const T extends TextFormat>(format: T): Style<T> {
	return (text, ...exprs) => {
		if (Array.isArray(text) && 'raw' in text) {
			if (text.length === 1 && text[0])
				return styleText(format, text[0] as string);
			else
				return styleText(format, (text as TemplateStringsArray).map((s, i) => s.concat(inspect(exprs[i]) ?? '')).join(''));
		} else if (typeof text === 'string') {
			return styleText(format, text);
		} else {
			return styleText(format, inspect(text));
		}
	};
}

export function createStyles<
	const TObj extends { [k: string]: TextFormat },
>(styles: TObj) {
	return Object.fromEntries(
		Object.entries(styles).map(([name, fmt]) => [name, createStyle(fmt)]),
	) as { [k in keyof TObj]: Style<TObj[k]> };
}

const attrs = Object.fromEntries(
	Object.keys(inspect.colors).map((attr) => [attr, createStyle(attr as SGRAttribute)]),
) as { [k in SGRAttribute]: Style<k & SGRAttribute> };

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
	...attrs,
	B: attrs.bold,
	I: attrs.italic,
	U: attrs.underline,
	muted: createStyle(['dim', 'gray']),
} satisfies Record<string, Style>;
