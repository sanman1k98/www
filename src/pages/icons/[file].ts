/* eslint-disable antfu/no-top-level-await */
import type { APIRoute, GetStaticPaths, InferGetStaticParamsType } from 'astro';
import { toPNG, toSVG } from '@/lib/render';
import { Favicon, renderOpts, TouchIcon } from './_components';

export const getStaticPaths = (() => {
	const FILES = [
		'favicon.png',
		'favicon.svg',
		'apple-touch-icon.png',
	] as const;
	return FILES.map((file) => ({ params: { file } }));
}) satisfies GetStaticPaths;

type Params = InferGetStaticParamsType<typeof getStaticPaths>;

const faviconSvg = await toSVG(Favicon, renderOpts);
const touchIconSvg = await toSVG(TouchIcon, renderOpts);

export const GET: APIRoute<never, Params> = async ({ params }) => {
	const { file } = params;
	let body: BodyInit;

	switch (file) {
		case 'favicon.svg':
			body = faviconSvg;
			break;

		case 'favicon.png':
			body = await toPNG(faviconSvg, {
				fitTo: { mode: 'width', value: 48 },
			});
			break;

		case 'apple-touch-icon.png':
			body = await toPNG(touchIconSvg, {
				fitTo: { mode: 'width', value: 180 },
			});
			break;
	}

	return new Response(
		body,
		{
			headers: {
				'Content-Type': file.endsWith('svg')
					? 'image/svg+xml'
					: 'image/png',
			},
		},
	);
};
