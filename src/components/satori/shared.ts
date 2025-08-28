import type { FontOptions } from '@/lib/render';
import type { JSXNode, JSXStyleProperties } from '@/lib/satori';
import { unoTheme } from '@/lib/theme';
import quicksandFontPath from '@fontsource/quicksand/files/quicksand-latin-700-normal.woff?url';

export type { SVGRenderOptions } from '@/lib/render';

export interface Props {
	children?: JSXNode;
	style?: JSXStyleProperties;
}

export const BRAND_TEXT_GRADIENT = `linear-gradient(to right, ${unoTheme.colors.sky[600]} 30%, ${unoTheme.colors.pink[500]} 70%)`;

/** Reuse fonts for better Satori performance. */
export const fonts = [{
	name: 'Quicksand',
	path: process.cwd() + quicksandFontPath,
	style: 'normal',
}] satisfies FontOptions[];
