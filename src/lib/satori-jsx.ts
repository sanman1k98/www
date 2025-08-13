/**
 * @file
 * Minimal JSX runtime for Satori.
 *
 * Use the `@jsxImportSource` pragma directive in files containing JSX to be consumded by Satori.
 * The import mapping for this module is defined in the `package.json` "imports" field.
 *
 * @see {@link https://www.typescriptlang.org/tsconfig/#jsxImportSource TSConfig: using "jsxImportSource" or `@jsxImportSource` pragma directive}
 * @see {@link https://docs.astro.build/en/guides/typescript/#errors-typing-multiple-jsx-frameworks-at-the-same-time Astro: Using multiple JSX frameworks at the same time}
 * @see {@link https://nodejs.org/docs/latest/api/packages.html#subpath-imports Node.js: `package.json` subpath imports}
 * @see {@link ../../package.json `package.json`}
 */

import type { JSX as ReactJSX } from 'react';

// TODO: define custom subset of style properties supported by Satori.
export type { CSSProperties as JSXStyleProperties } from 'react';

export interface JSXElement<
	P = unknown,
	T extends string | FC<P> = string | FC<P>,
> {
	type: T;
	props: P;
	key: string | null;
};

export type JSXNode =
	| JSXElement
	| string
	| number
	| bigint
	| Iterable<JSXNode>
	| boolean
	| null
	| undefined;

// TODO: define supported Satori props.
export interface SatoriJSXProps {
	/**
	 * Tailwind classes powered by `twrnc`.
	 *
	 * @see {@link https://github.com/jaredh159/tailwind-react-native-classnames `twrnc` documentation}
	 * @experimental
	 */
	tw?: string;
	[propName: string]: any;
}

export type FC<P = Record<string, any>> = (props: P) => JSXElement<P>;

// eslint-disable-next-line ts/no-namespace
export namespace JSX {
	/**
	 * **WARNING**: Satori does not support class components, only pure and stateless functional components.
	 *
	 * @see {@link https://github.com/vercel/satori?tab=readme-ov-file#jsx Satori JSX documentation}
	 */
	export type ElementClass = never;
	export type ElementType = string | FC;

	export interface Element extends JSXElement<any, any> { };

	export interface ElementAttributesProperty {
		props: Record<string, any>;
	};

	export interface ElementChildrenAttribute {
		children: JSXNode;
	};

	// TODO: define custom subset of IntrinsicElements supported by Satori.
	export interface IntrinsicElements extends ReactJSX.IntrinsicElements { };

	export interface IntrinsicAttributes {
		/**
		 * **INFO**: Allowed as prop, but will be ignored by Satori.
		 */
		key?: string | number | bigint | undefined | null;
		/**
		 * **WARNING**: React's `dangerouslySetInnerHTML` property is not supported by Satori.
		 *
		 * @see {@link https://github.com/vercel/satori?tab=readme-ov-file#jsx Satori JSX documentation}
		 */
		dangerouslySetInnerHTML?: never;
	};
}

export function jsx(
	type: string | FC,
	props: Record<string, any>,
	key: string | null = null,
): ReactJSX.Element {
	if (typeof type === 'string') {
		return { type, props, key };
	} else {
		return type(props);
	}
}

export function createElement(
	type: string | FC,
	props: Record<string, any> = {},
	...children: JSXNode[]
): JSXElement {
	props.children = children;
	return jsx(type, props);
}

export const jsxs = jsx;
export const jsxDEV = jsx;
export function Fragment(props: { children?: JSXNode }) {
	return props.children;
}
