import { z, type SchemaContext } from "astro:content";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import exifReader, { type Exif } from "exif-reader";

const PHOTOS_COLLECTION_DIR = new URL("../content/photos/", import.meta.url);

// I think these "groups" are actually called *Image File Directories*
// see: https://stackoverflow.com/questions/1821515/how-is-exif-info-encoded#14115795
type TagGroup = keyof Omit<Exif, "bigEndian">;
type ExifTags = { [key in TagGroup]?: Exif[key] };

/** Converts Buffers into number arrays. */
const fixExif = (data: ExifTags) => {
  for (const group of Object.entries(data)) {
    const [_, tags] = group as [TagGroup, NonNullable<ExifTags[TagGroup]>];
    for (const tag of Object.entries(tags)) {
      const [name, value] = tag;
      // @ts-ignore
      tags[name] = value instanceof Buffer
        ? Array.from(value)
        : value;
    }
  }
  return data;
}

export const photos = ({ image }: SchemaContext): z.ZodSchema => {
  return z
    .object({
      /** Relative path to image file. */
      file: z.string(),
      /** Alt text for screenreaders. */
      alt: z.string().default("")
    })
    .transform(
      async ({ file: path, ...rest }, ctx) => {
        // Use Astro's image helper first
        const transformed = await image().safeParseAsync(path);
        if (!transformed.success) {
          ctx.addIssue({
            code: "custom",
            message: `Image ${path} does not exist.`,
            fatal: true
          });
          return z.NEVER;
        }

        // Get the absolute path to the original image
        const fileURL = new URL(path, PHOTOS_COLLECTION_DIR);
        const imagePath = fileURLToPath(fileURL);

        // Give sharp path to image
        const { exif: buf } = await sharp(imagePath).metadata();
        // Return without metadata if no EXIF present
        if (!buf) return { file: transformed.data, ...rest };

        const { bigEndian: _, ...exifTags } = exifReader(buf);
        return {
          file: transformed.data,
          // Astro only allows POJOs in Data entries
          exif: fixExif(exifTags),
          ...rest
        };
      }
    )
    .array()
    .transform(
      arr => arr.map(
        (photo, i) => ({ slug: i + 1, ...photo })
      )
    );
}
