import type { APIRoute, InferGetStaticPropsType } from 'astro';
import { SocialCard } from '@/components/satori/SocialCard';
import * as Render from '@/lib/render';

interface PathItem {
	params: { file: `${string}.png` };
	props: { svg: string; pngOpts: Render.PNGRenderOptions };
}

export async function getStaticPaths() {
	const socialCardSvg = await Render.toSVG(SocialCard);
	return [
		{
			params: { file: 'social-card.png' },
			props: {
				svg: socialCardSvg,
				pngOpts: { fitTo: { mode: 'original' } },
			},
		},
	] satisfies PathItem[];
}

type Props = InferGetStaticPropsType<typeof getStaticPaths>;

export const GET: APIRoute<Props> = async ({ props: { svg, pngOpts } }) => {
	const body: BodyInit = await Render.toPNG(svg, pngOpts);
	const headers: HeadersInit = { 'Content-Type': 'image/png' };
	return new Response(body, { headers });
};
