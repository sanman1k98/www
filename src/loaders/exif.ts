/**
 * @file A content loader to get get EXIF metadata from local images.
 */
import { glob } from "node:fs/promises";
import { basename, relative } from "node:path/posix";
import { fileURLToPath } from "node:url";
import type { Loader } from "astro/loaders";
import { styles as c } from "@/utils/logging";

interface EXIFLoaderOptions {
  /** The glob pattern to match files, relative to the base directory */
  pattern: string;
  /**
   * The base directory to resolve the glob pattern from. Relative to the root directory, or an
   * absolute file URL. Defaults to `.`.
   */
  base?: string | URL;
};

export function exifLoader(opts: EXIFLoaderOptions): Loader {
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
    load: async ({ logger, settings }) => {
      const baseDir = opts.base
        ? new URL(opts.base, settings.config.root)
        : settings.config.root;

      const getId = (path: string): string => relative(fileURLToPath(baseDir), path);

      if (!baseDir.pathname.endsWith("/"))
        baseDir.pathname += "/";

      const files = glob(opts.pattern, { cwd: fileURLToPath(baseDir) });

      for await (const file of files) {
        const id = getId(file);
        const name = basename(id);
        logger.info(`Found file ${c.green(id)} with name ${c.blue(name)}`);
      }
    },
  };
}
