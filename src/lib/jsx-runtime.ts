import type { ReactElement, JSX as ReactJSX, ReactNode } from 'react';

export type { CSSProperties as JSXStyleProperties } from 'react';

export type JSXNode = ReactNode;
export type JSXElement = ReactElement;
export type FC<P = Record<string, any>> = (props: P) => ReactElement<P>;

// eslint-disable-next-line ts/no-namespace
export namespace JSX {
	export type Element = JSXElement;

	// Don't support Class components.
	export type ElementClass = never;

	export interface ElementChildrenAttribute {
		children: JSXNode;
	};

	export type IntrinsicElements = ReactJSX.IntrinsicElements;

	export interface IntrinsicAttributes {
		key?: never;
		dangerouslySetInnerHTML?: never;
	};
}

export function jsx(type: string | FC, props: unknown): JSXElement {
	if (typeof type === 'string') {
		return { type, props, key: null };
	} else {
		return type(props as object);
	}
}

export function createElement(type: string | FC, props: Record<string, any> = {}, ...children: JSXNode[]): JSXElement {
	if (arguments.length > 3)
		props.children = children;
	return jsx(type, props);
}

export const jsxs = jsx;
export const jsxDEV = jsx;
export function Fragment(props: JSX.ElementChildrenAttribute) {
	return props.children;
}
