import type { APIRoute, GetStaticPaths, InferGetStaticParamsType } from 'astro';
import { Icon, TouchIcon } from './_components';
import * as render from './_render';

export const getStaticPaths = (() => {
	// Icons to generate at build time.
	const FILES = [
		'favicon.png',
		'favicon.svg',
		'apple-touch-icon.png',
	] as const;
	// Creates files at `/icons/apple-touch-icon.png`, `/icons/favicon.svg`, etc.
	return FILES.map((file) => ({ params: { file } }));
}) satisfies GetStaticPaths;

type Params = InferGetStaticParamsType<typeof getStaticPaths>;

export const GET: APIRoute<never, Params> = async ({ params }) => {
	const { file } = params;
	let body: BodyInit;

	switch (file) {
		case 'favicon.svg':
			body = await render.toSVG(Icon);
			break;

		case 'favicon.png':
			body = await render.toPNG(Icon, {
				fitTo: { mode: 'width', value: 48 },
			});
			break;

		case 'apple-touch-icon.png':
			body = await render.toPNG(TouchIcon, {
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
