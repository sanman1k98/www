import { z } from "astro/zod";
import type { SchemaContext } from "astro:content";
import sharp from "sharp";

const PHOTOS_COLLECTION_DIR = new URL("../content/photos/", import.meta.url);

export const photos = ({ image }: SchemaContext) => z
  .object({
    src: image(),
    alt: z.string().default(""),
  })
  .transform(
    async (val) => {
      const fileURL = new URL(val.src.src, "file://");
      const imagePath = fileURL.pathname.slice(4);
      // console.log(fileURL);
      // const { exif } = await sharp(imagePath).metadata();
      return { ...val };
    }
  )
  .array()
  .transform(
    arr => arr.map(
      (val, i) => ({ slug: i + 1, ...val })
    )
  );
