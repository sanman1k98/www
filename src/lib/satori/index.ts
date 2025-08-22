import type { FC, JSXNode } from './types.ts';
import { jsx } from './jsx-runtime.ts';

export { Fragment, type JSX } from './jsx-runtime.ts';
export type * from './types.ts';

export function createElement(
	type: string | FC,
	props: Record<string, any> = {},
	...children: JSXNode[]
): JSXNode {
	props.children = children;
	return jsx(type, props);
}
