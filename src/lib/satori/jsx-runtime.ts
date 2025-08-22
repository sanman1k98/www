/* eslint-disable ts/no-empty-object-type */
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
import type { FC, JSXElement, JSXKey } from './types';

// eslint-disable-next-line ts/no-namespace
export namespace JSX {
	/**
	 * **WARNING**: Satori does not support class components, only pure and stateless functional components.
	 *
	 * @see {@link https://github.com/vercel/satori?tab=readme-ov-file#jsx Satori JSX documentation}
	 */
	export type ElementClass = never;
	export type ElementType = string | FC<any>;
	export interface Element extends JSXElement<any, any> { };

	export interface ElementAttributesProperty {
		props: {};
	};
	export interface ElementChildrenAttribute {
		children: {};
	};

	// TODO: define custom subset of IntrinsicElements supported by Satori.
	export interface IntrinsicElements extends ReactJSX.IntrinsicElements { };
	export interface IntrinsicAttributes {
		/**
		 * NOTE: The explicitly declared key will take precedence over key spread in via props.
		 *
		 * @example
		 *
		 * ```tsx
		 * const props = { key: 'Hello', class: 'bg-red' }
		 * const el = <div {...props} key='Hi' /> // `key` will be 'Hi'
		 * ```
		 */
		key?: JSXKey | undefined | null;
	};
}

export function jsx(
	type: string | FC<any>,
	props: Record<string, unknown>,
	key?: JSXKey | undefined | null,
): JSXElement {
	if ('key' in props) {
		// Destructure spread key from props.
		const { key: keyProp, ...restProps } = props;
		// Key param takes precedence over spread key prop.
		key = arguments.length === 3 ? key : keyProp as JSXKey;
		// Shallow copy of props without key.
		props = restProps;
	}
	// Coerce key to string if not nullish.
	key = (key ?? null) !== null ? String(key) : null;
	return { type, props, key };
}

export const jsxs = jsx;
export const jsxDEV = jsx;

// HACK: Symbol used internally by React.
export const Fragment = Symbol.for('react.fragment');
