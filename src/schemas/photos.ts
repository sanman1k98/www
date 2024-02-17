import { z, type SchemaContext } from "astro:content";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import exifReader from "exif-reader";
import type { Exif, GenericTag } from "exif-reader";

const PHOTOS_COLLECTION_DIR = new URL("../content/photos/", import.meta.url);

type TagGroup = keyof Omit<Exif, "bigEndian">;
type ExifTags = {
  [key in TagGroup]?: Exif[key];
};

const stringifyExifBuffers = (data: ExifTags) => {
  for (const group of Object.entries(data)) {
    const [_, tags] = group as [TagGroup, NonNullable<ExifTags[TagGroup]>];
    for (const tag of Object.entries(tags)) {
      const [name, value] = tag;
      // @ts-ignore
      tags[name] = value instanceof Buffer
        ? JSON.stringify(value)
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
      alt: z.string().default("")
    })
    .transform(
      async ({ file: path, ...rest }, ctx) => {
        const transformed = await image().safeParseAsync(path);
        if (!transformed.success) {
          ctx.addIssue({
            code: "custom",
            message: `Image ${path} does not exist.`,
            fatal: true
          });
          return z.NEVER;
        }
        const fileURL = new URL(path, PHOTOS_COLLECTION_DIR);
        const resolvedPath = fileURLToPath(fileURL);
        const { exif: buf } = await sharp(resolvedPath).metadata();
        const parsedExif = buf ? exifReader(buf) : null;
        if (!parsedExif) return { file: transformed.data, ...rest }
        const { bigEndian: _, ...exifTags } = parsedExif;
        return {
          file: transformed.data,
          exif: stringifyExifBuffers(exifTags),
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
