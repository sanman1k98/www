import type { FC, JSXElement, JSXKey, JSXNode } from './types.ts';
import { jsx } from './jsx-runtime.ts';

export { Fragment, type JSX } from './jsx-runtime.ts';
export type * from './types.ts';

/**
 * Create a `ReactElement`-like object.
 *
 * @param type - Tag name string or a function component.
 * @param props - Optional props to create the element with.
 * @param children - Zero or more child nodes.
 * @returns A `ReactElement`-like object with properties like `type`, `key`, `props`, and `props.children`.
 */
// eslint-disable-next-line ts/no-empty-object-type
export function createElement<P extends {}>(
	type: string | FC<P>,
	props?: { key?: JSXKey | undefined | null } & Omit<P, 'children'>,
	...children: JSXNode[]
): JSXElement {
	if (!props) {
		const newProps = children.length ? { children } : {};
		return jsx(type, newProps, null);
	}

	// Destructure key from props.
	const { key: keyProp = null, ...restProps } = props as Record<string, unknown>;
	// Coerce key to string primitive.
	const key = keyProp !== null ? String(keyProp) : null;

	if (children.length)
		restProps.children = children;

	return jsx(type, restProps, key);
}
