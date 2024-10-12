import type { Buffer } from 'node:buffer';
import { fileURLToPath } from 'node:url';
import { type SchemaContext, z } from 'astro:content';
import exifReader, { type Exif, type GenericTag } from 'exif-reader';
import sharp from 'sharp';

const PHOTOS_COLLECTION_DIR = new URL('../photos/', import.meta.url);

// I think these "groups" are actually called *Image File Directories*
// see: https://stackoverflow.com/questions/1821515/how-is-exif-info-encoded#14115795
type TagGroup = keyof Omit<Exif, 'bigEndian'>;
type ExifTags = { [key in TagGroup]?: Exif[key] };

/** Mutates the given object by converting any Buffers into number arrays. */
function fixExif(data: ExifTags) {
	for (const group of Object.entries(data)) {
		const [_, tags] = group as [TagGroup, NonNullable<ExifTags[TagGroup]>];
		for (const tag of Object.entries(tags)) {
			const [name, value] = tag;
			tags[name] = value instanceof Uint8Array
				? Array.from(value)
				: value as Exclude<GenericTag, Buffer>;
		}
	}
	return data;
};

export function photos({ image }: SchemaContext) {
	const input = z.array(
		z.strictObject({
			/** Relative path to image file. */
			file: z.string(),
			/** Alt text for screenreaders. */
			alt: z.string(),
			/** A caption with a story or a description of the photo. */
			caption: z.string().optional(),
		}),
	);

	return input.transform(async (arr, ctx) => Promise.all(
		arr.map(async ({ file: path, ...rest }, idx) => {
			// Use Astro's image helper first
			const transformed = await image().safeParseAsync(path);
			if (!transformed.success) {
				ctx.addIssue({
					code: 'custom',
					message: `Image ${path} does not exist.`,
					fatal: true,
				});
				return z.NEVER;
			}

			// Get the absolute path to the original image
			const fileURL = new URL(path, PHOTOS_COLLECTION_DIR);
			const imagePath = fileURLToPath(fileURL);

			// Give sharp path to image
			const { exif: buf } = await sharp(imagePath).metadata();

			// Error if an image has no EXIF metadata
			if (!buf) {
				ctx.addIssue({
					code: 'custom',
					message: `Image ${path} does not contain any EXIF metadata.`,
					fatal: true,
				});
				return z.NEVER;
			};

			// Use `exif-reader` to parse information
			const { bigEndian: _, ...exifTags } = exifReader(buf);
			// Astro only allows POJOs in collection entries.
			const { Image, Photo, ...restExif } = fixExif(exifTags);

			// Error if EXIF does not have "Photo" or "Image" IFDs
			if (!Image || !Photo) {
				ctx.addIssue({
					code: 'custom',
					message: `EXIF metadata in image ${path} does not contain either "Photo" or "Image" IFDs.`,
					fatal: true,
				});
				return z.NEVER;
			};

			if (Photo.DateTimeOriginal === undefined) {
				ctx.addIssue({
					code: 'custom',
					message: `Image ${path} does not contain "DateTimeOriginal" in EXIF metadata.`,
					fatal: true,
				});
				return z.NEVER;
			}

			return {
				/** Transformed metadata which can be passed to `<Image />`, `getImage()`, or `<img>`. */
				file: transformed.data,
				/** Parsed EXIF metadata information. */
				exif: { Image, Photo, ...restExif },
				/** Used for creating routes and links. */
				slug: ++idx,
				...rest,
			};
		}),
	));
}
