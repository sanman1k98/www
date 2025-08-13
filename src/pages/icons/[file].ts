import type { APIRoute, InferGetStaticParamsType, InferGetStaticPropsType } from 'astro';
import * as Render from '@/lib/render';
import { Favicon, renderOpts, TouchIcon } from './_components';

type PathItem =
	| { params: { file: `${string}.svg` }; props: { svg: string } }
	| { params: { file: `${string}.png` }; props: { svg: string; pngOpts: Render.PNGRenderOptions } };

export async function getStaticPaths() {
	// Render and pass SVGs as props since `getStaticPaths` gets called only once.
	const faviconSvg = await Render.toSVG(Favicon, renderOpts);
	const touchIconSvg = await Render.toSVG(TouchIcon, renderOpts);

	return [
		{
			params: { file: 'favicon.svg' },
			props: { svg: faviconSvg },
		},
		{
			params: { file: 'favicon.png' },
			props: {
				svg: faviconSvg,
				pngOpts: { fitTo: { mode: 'width', value: 48 } },
			},
		},
		{
			params: { file: 'apple-touch-icon.png' },
			props: {
				svg: touchIconSvg,
				pngOpts: { fitTo: { mode: 'width', value: 180 } },
			},
		},
	] satisfies PathItem[];
}

type Params = InferGetStaticParamsType<typeof getStaticPaths>;
type Props = InferGetStaticPropsType<typeof getStaticPaths>;

export const GET: APIRoute<Props, Params> = async ({ props: { svg, pngOpts } }) => {
	const body: BodyInit = pngOpts ? await Render.toPNG(svg, pngOpts) : svg;
	const headers: HeadersInit = { 'Content-Type': pngOpts ? 'image/png' : 'image/svg+xml' };
	return new Response(body, { headers });
};
