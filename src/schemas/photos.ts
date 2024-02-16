import { z } from "astro/zod";
import type { SchemaContext } from "astro:content";
import sharp from "sharp";
import exif from "exif-reader";
import { fileURLToPath } from "node:url";

const PHOTOS_COLLECTION_DIR = new URL("../content/photos/", import.meta.url);

export const photos = ({ image }: SchemaContext): z.ZodSchema => {
  /** Custom image helper to include original path to image file. */
  const customHelper = z
    .string()
    .transform(str => ({ path: str, emittedAsset: str }))
    .pipe(z.object({ path: z.string(), emittedAsset: image() }))
    .transform(obj => ({ path: obj.path, ...obj.emittedAsset }));

  return z
    .object({
      /** Relative path to image file. */
      file: customHelper,
      alt: z.string().default("")
    })
    .transform(
      async (photo) => {
        const fileURL = new URL(photo.file.path, PHOTOS_COLLECTION_DIR);
        const resolvedPath = fileURLToPath(fileURL);
        const { exif: exifBuffer } = await sharp(resolvedPath).metadata();
        const metadata = exifBuffer ? exif(exifBuffer) : null;
        return {
          metadata: {
            camera: metadata?.Image?.Model,
            lens: metadata?.Photo?.LensModel,
            iso: metadata?.Photo?.ISOSpeedRatings,
            shutter: metadata?.Photo?.ExposureTime,
            aperture: metadata?.Photo?.ApertureValue,
            focalLength: metadata?.Photo?.FocalLength,
            focalLengthIn35mmFilm: metadata?.Photo?.FocalLengthIn35mmFilm,
            time: metadata?.Photo?.DateTimeOriginal,
          },
          ...photo
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
