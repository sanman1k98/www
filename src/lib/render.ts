import { readFile } from 'node:fs/promises';
import { createElement, type FC, type JSXStyleProperties } from '@/lib/satori';
import { Resvg, type ResvgRenderOptions } from '@resvg/resvg-js';
import satori, { type Font as SatoriFont, type SatoriOptions } from 'satori';

type FontOptions = Omit<SatoriFont, 'data'> & {
	path: string | URL;
};

/** Requires either `height` or `width`. */
export type SVGRenderOptions = Omit<SatoriOptions, 'fonts'> & {
	height?: number;
	width?: number;
	fonts: FontOptions[];
};

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

export async function toSVG(Component: FC, opts: SVGRenderOptions): Promise<string> {
	const { fonts: fontOptions, ...rest } = opts;
	const fonts: SatoriFont[] = await getFonts(fontOptions);
	const satoriOpts = { fonts, ...rest } as SatoriOptions;
	return await satori(createElement(Component), satoriOpts);
}

export type PNGRenderOptions = ResvgRenderOptions;

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
