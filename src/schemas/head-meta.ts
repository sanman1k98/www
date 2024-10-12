import { z } from 'astro/zod';

const basic = z.object({
	locale: z.string().default('en-US'),
	title: z.string(),
	description: z.string(),
	author: z.string().optional(),
});

const article = z.object({
	published_time: z.coerce.date(),
	modified_time: z.coerce.date(),
});

const og = z.object({
	site_name: z.string(),
	title: z.string().optional(),
	description: z.string().optional(),
	article: article.optional(),
	url: z.string().url(),
	image: z.object({
		/** Path to an image file. */
		file: z.string(),
		alt: z.string().optional(),
	}),
});

// Twitter Cards will use OpenGraph images.
const twitter = z.object({
	card: z.enum(['summary', 'summary_large_image']).default('summary_large_image'),
	/** Username for the website used in the card footer. */
	site: z.string().refine((str) => str.startsWith('@')).optional(),
	/** Username for the content creator or author. */
	creator: z.string().refine((str) => str.startsWith('@')).optional(),
});

export const headMeta = basic.extend({ og, twitter }).transform((data) => {
	const { og, twitter, ...basic } = data;

	return {
		...basic,
		title: `${basic.title} | ${og.site_name}`,
		twitter,
		og: {
			...og,
			type: og.article ? 'article' : 'website',
			title: og.title ?? basic.title,
			description: og.description ?? basic.description,
		},
	};
});

export type HeadMetaProps = z.input<typeof headMeta>;
export type HeadMeta = z.infer<typeof headMeta>;
