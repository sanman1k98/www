/* eslint-disable ts/no-restricted-types */
/* eslint-disable no-restricted-globals */
/**
 * @file A content loader to get get EXIF metadata from local images.
 */
import { glob } from "node:fs/promises";
import { relative } from "node:path/posix";
import { fileURLToPath } from "node:url";
import type { Loader } from "astro/loaders";
import type { Exif, GenericTag } from "exif-reader";
import exifReader from "exif-reader";
import sharp from "sharp";
import { z } from "astro/zod";
import { styles as c } from "@/utils/logging";

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
  /** The glob pattern to match files, relative to the base directory */
  pattern: string;
  /**
   * The base directory to resolve the glob pattern from. Relative to the root directory, or an
   * absolute file URL. Defaults to `.`.
   */
  base?: string | URL;
};

export function exifLoader(opts: ExifLoaderOptions): Loader {
  if (opts.pattern.startsWith("../")) {
    throw new Error(
      "Glob patterns cannot start with `../`. Set the `base` option to a parent directory instead.",
    );
  }
  if (opts.pattern.startsWith("/")) {
    throw new Error(
      "Glob patterns cannot start with `/`. Set the `base` option to a parent directory or use a relative path instead.",
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
    load: async ({ logger, settings, parseData, store, generateDigest }) => {
      const baseDir = opts.base
        ? new URL(opts.base, settings.config.root)
        : settings.config.root;

      const getId = (path: string): string => relative(fileURLToPath(baseDir), path);

      if (!baseDir.pathname.endsWith("/"))
        baseDir.pathname += "/";

      const files = await Array.fromAsync(glob(opts.pattern, { cwd: fileURLToPath(baseDir) }));

      const results = await Promise.all(
        files.map(
          async (filePath) => {
            const id = getId(filePath);
            // logger.info(`Parsing EXIF for ${id}`);
            const { exif: buffer } = await sharp(filePath).metadata();
            if (!buffer) {
              const error = new Error(`Image ${id} does not contain any EXIF metadata.`);
              return { id, error };
            }
            const { bigEndian: _, ...exifTags } = exifReader(buffer);
            return await parseData({ id, data: fixExif(exifTags) })
              .then((data) => {
                store.set({ id, data, filePath, digest: generateDigest(data) });
                return { id, error: null };
              })
              .catch(error => ({ id, error }));
          },
        ),
      );

      logger.info(`Found ${c.B(results.length)} images matching ${c.blue(opts.pattern)}`);
      let loaded = results.length;

      for (const { id, error } of results) {
        if (error) {
          logger.error(`Did not load data for ${c.green(id)}\n${c.red}`);
          loaded--;
        }
      }

      logger.info(`Loaded ${c.B(loaded)} entries`);
    },
  };
}
