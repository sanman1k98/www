/* eslint-disable ts/no-restricted-types */
/* eslint-disable no-restricted-imports */
/**
 * @file A content loader to get get EXIF metadata from local images.
 */
import type { ImageInputFormat } from "astro";
import type { Loader } from "astro/loaders";
import type { Exif, GenericTag } from "exif-reader";
import type { Buffer } from "node:buffer";
import { glob } from "node:fs/promises";
import { relative, resolve } from "node:path/posix";
import { fileURLToPath } from "node:url";
import { styles as c } from "@/utils/logging";
import { z } from "astro/zod";
import exifReader from "exif-reader";
import sharp from "sharp";

const SUPPORTED_EXTENSIONS = ["jpg", "png", "gif", "jpeg", "tiff", "webp", "avif"] as const satisfies ImageInputFormat[];
const DEFAULT_PATTERN = `**/*.{${SUPPORTED_EXTENSIONS.join()}}`;

// see: https://stackoverflow.com/questions/1821515/how-is-exif-info-encoded#14115795
type IFD = keyof Omit<Exif, "bigEndian">;
type ExifTags = { [key in IFD]?: Exif[key] };

/** Mutates the given object by converting any Buffers into number arrays. */
function fixExif(data: ExifTags) {
  for (const group of Object.entries(data)) {
    const [_, tags] = group as [IFD, NonNullable<ExifTags[IFD]>];
    for (const tag of Object.entries(tags)) {
      const [name, value] = tag;
      tags[name] = value instanceof Uint8Array
        ? Array.from(value)
        : value as Exclude<GenericTag, Buffer>;
    }
  }
  return data;
};

interface ExifLoaderOptions {
  /**
   * A custom glob pattern to match files, relative to the `base` directory.
   */
  pattern?: string;
  /**
   * The base directory to resolve the glob pattern from. Relative to the root directory, or an
   * absolute file URL. Defaults to `.`.
   */
  directory: string | URL;
};

export function exifLoader(opts: ExifLoaderOptions): Loader {
  if (opts.pattern?.startsWith("../")) {
    throw new Error(
      "Glob patterns cannot start with `../`. Set the `directory` option to a parent directory instead.",
    );
  }
  if (opts.pattern?.startsWith("/")) {
    throw new Error(
      "Glob patterns cannot start with `/`. Set the `directory` option to a parent directory or use a relative path instead.",
    );
  }
  return {
    name: "exif-loader",
    schema: () => {
      // type ExcludeBufferValues<T extends Record<string, any>> = {
      //   [k in keyof T]: Exclude<T[k], Buffer>
      // };
      // type PojoExifTags = {
      //   [k in keyof ExifTags]: ExcludeBufferValues<NonNullable<ExifTags[k]>> | undefined
      // };

      const GenericTagSchema = z.union([
        z.string(),
        z.number(),
        z.number().array(),
        z.date(),
      ]).optional() satisfies z.ZodType<Exclude<GenericTag, Buffer> | Date | undefined>;

      const ExifTagsSchema = z.strictObject({
        Image: z.record(GenericTagSchema),
        Photo: z.record(GenericTagSchema),
        GPSInfo: z.record(GenericTagSchema),
        Iop: z.record(GenericTagSchema),
        ThumbnailTags: z.record(GenericTagSchema),
      }).partial({ GPSInfo: true, Iop: true, ThumbnailTags: true });

      return ExifTagsSchema;
    },
    load: async ({ logger, config, parseData, store, generateDigest, collection }) => {
      const baseUrl = new URL(opts.directory, config.root);
      const { pattern = DEFAULT_PATTERN } = opts;

      if (!baseUrl.pathname.endsWith("/"))
        baseUrl.pathname += "/";

      const base = fileURLToPath(baseUrl);
      const siteRoot = fileURLToPath(config.root);
      const relFromBase = (path: string): string => relative(base, path);
      const relFromSiteRoot = (path: string) => relative(siteRoot, path);

      logger.info(`Searching for images in ${c.green(relFromSiteRoot(base))}`);
      const files = await Array.fromAsync(glob(pattern, { cwd: base }));

      const results = await Promise.all(
        files.map(
          async (file) => {
            const absPath = resolve(base, file);
            const id = relFromBase(absPath);
            // logger.debug(`Found image path: ${absPath}`);
            logger.debug(`Parsing image metadata for ${id}`);
            const { exif: buffer } = await sharp(absPath).metadata();
            if (!buffer) {
              const error = new Error(`Image ${id} does not contain any EXIF metadata.`);
              return { id, error };
            }
            const { bigEndian: _, ...exifTags } = exifReader(buffer);
            return await parseData({ id, data: fixExif(exifTags) })
              .then((data) => {
                store.set({ id, data, filePath: relFromSiteRoot(absPath), digest: generateDigest(data) });
                return { id, error: null };
              })
              .catch(error => ({ id, error }));
          },
        ),
      );

      logger.info(`Found ${c.B(results.length)} images matching ${c.blue(pattern)}`);
      let loaded = results.length;

      for (const { id, error } of results) {
        if (error) {
          logger.error(`Did not load data for ${c.green(id)}`);
          logger.error(error);
          loaded--;
        }
      }

      logger.info(`Loaded ${c.B(loaded)} entries into ${c.green(collection)} collection`);
    },
  };
}
