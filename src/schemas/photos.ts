import { z } from "astro/zod";
import type { SchemaContext } from "astro:content";
import sharp from "sharp";

const PHOTOS_COLLECTION_DIR = new URL("../content/photos/", import.meta.url);

export const photos = ({ image }: SchemaContext) => z
  .object({
    /** Relative path to an image file. */
    file: image(),
    /** An empty string tells screen readers to ignore the image. */
    alt: z.string().default(""),
  })
  .transform(
    async (photo) => {
      const fileURL = new URL(photo.file.src, "file://");
      const imagePath = fileURL.pathname.slice(4);
      // console.log(fileURL);
      // const { exif } = await sharp(imagePath).metadata();
      return { ...photo };
    }
  )
  .array()
  .transform(
    arr => arr.map(
      (photo, i) => ({ slug: i + 1, ...photo })
    )
  );
