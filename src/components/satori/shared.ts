import type { FontOptions } from '@/lib/render';
import type { JSXNode, JSXStyleProperties } from '@/lib/satori';
import { unoTheme } from '@/lib/theme';

export type { SVGRenderOptions } from '@/lib/render';

export interface Props {
	children?: JSXNode;
	style?: JSXStyleProperties;
}

export const BRAND_TEXT_GRADIENT = `linear-gradient(to right, ${unoTheme.colors.sky[600]} 30%, ${unoTheme.colors.pink[500]} 70%)`;

/** Reuse fonts for better Satori performance. */
export const fonts = [{
	name: 'Quicksand',
	path: process.cwd().concat('/node_modules/@fontsource/quicksand/files/quicksand-latin-700-normal.woff'),
	style: 'normal',
}] satisfies FontOptions[];
