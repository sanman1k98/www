import { readFile } from 'node:fs/promises';
import { Resvg, type ResvgRenderOptions } from '@resvg/resvg-js';
import satori, { type Font as SatoriFont, type SatoriOptions } from 'satori';
import { createElement, type FC, type JSXStyleProperties } from './satori';

export type FontOptions = Omit<SatoriFont, 'data'> & {
	path: string | URL;
};

/** Requires either `height` or `width`. */
export type SVGRenderOptions = Omit<SatoriOptions, 'fonts'> & {
	height?: number;
	width?: number;
	fonts: FontOptions[];
};

export type PNGRenderOptions = ResvgRenderOptions;

const fontCache = new WeakMap<FontOptions[], SatoriFont[]>();

export async function getFonts(opts: FontOptions[]): Promise<SatoriFont[]> {
	let fonts: SatoriFont[] | undefined = fontCache.get(opts);

	if (fonts)
		return fonts;

	fonts = await Promise.all(
		opts.map(async (font) => {
			const { path, ...rest } = font;
			const data = await readFile(path);
			return { ...rest, data } as SatoriFont;
		}),
	);

	fontCache.set(opts, fonts);
	return fonts;
}

/**
 * Render a JSX function component to an SVG string.
 *
 * @param Component - A function component with an `svgRenderOptions` property.
 * @param opts - Render options to use if not specified by `Component.svgRenderOptions`.
 */
// eslint-disable-next-line ts/no-empty-object-type
export async function toSVG<P extends {}>(
	Component: FC<P> & { svgRenderOptions?: SVGRenderOptions },
	opts?: SVGRenderOptions,
): Promise<string> {
	if ('svgRenderOptions' in Component)
		opts = Component.svgRenderOptions;

	if (!opts)
		throw new Error('Missing render options');

	const { fonts: fontOptions, ...rest } = opts;
	const fonts: SatoriFont[] = await getFonts(fontOptions);
	const satoriOpts = { fonts, ...rest } as SatoriOptions;
	return await satori(createElement(Component), satoriOpts);
}

export async function toPNG(svg: string, opts: ResvgRenderOptions): Promise<Uint8Array> {
	const resvg = new Resvg(svg, {
		font: { loadSystemFonts: false },
		...opts,
	});

	return resvg.render().asPng();
}

export async function toHTML(Component: FC, opts: SVGRenderOptions): Promise<string> {
	const css: JSXStyleProperties = {
		height: opts.height,
		width: opts.width,
		overflow: 'clip',
	};

	return await import('react-dom/server')
		.then((r) => r.renderToStaticMarkup(
			createElement<{ style: JSXStyleProperties }>(
				'div',
				{ style: css },
				createElement(Component),
			),
		));
}
