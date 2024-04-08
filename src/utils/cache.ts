import { Buffer } from "node:buffer";
import type { PathLike, Stats } from "node:fs";
import fs from "node:fs/promises";
import { dirname, extname, join } from "node:path";

export const CACHE_DIR = join(process.cwd(), "./.cache/");

type CacheKey = URL;

export function createCache(dir: PathLike = "default") {
  const ctx = {
    dir: join(CACHE_DIR, String(dir)),
    paths: new WeakMap<CacheKey, PathLike>(),
    stats: new WeakMap<CacheKey, Stats>(),
  };

  const getCachedFilePath = (key: CacheKey) => {
    let path = ctx.paths.get(key);
    if (path)
      return path;
    const subdir = key.hostname;
    const { pathname } = key;
    const ext = extname(pathname) || ".json";
    const filename = pathname.slice(1).replace(/\//g, "-").concat(ext);
    path = join(ctx.dir, subdir, filename);
    ctx.paths.set(key, path);
    return path;
  };

  const getCachedStats = async (key: CacheKey): Promise<Stats | undefined> => {
    if (ctx.stats.has(key))
      return ctx.stats.get(key)!;
    return fs.stat(getCachedFilePath(key))
      .then(val => ctx.stats.set(key, val) && val)
      .catch((err) => {
        if (err.code === "ENOENT")
          return undefined;
        throw new Error("Unknown error", { cause: err });
      });
  };

  const isCached = (key: CacheKey): Promise<boolean> => {
    return getCachedStats(key).then(Boolean);
  };

  const getCached = async (key: CacheKey) => {
    return isCached(key)
      .then(cached => cached ? fs.readFile(getCachedFilePath(key)) : undefined);
  };

  const writeCachedFile = async (key: CacheKey, data: string | Uint8Array, opts: BufferEncoding = "utf-8") => {
    const path = getCachedFilePath(key);
    let handle: fs.FileHandle | undefined;
    return fs
      // Ensure parent directory
      .mkdir(dirname(String(path)), { recursive: true })
      // Create a file handle at `path` and truncate it if it already exists.
      .then(() => fs.open(path, "w"))
      .then((file) => {
        // Save reference to handle
        handle = file;
        return file.writeFile(data, opts).then(() => {
          // Update info after writing
          file.stat().then(st => ctx.stats.set(key, st));
        });
      })
      .catch((reason) => {
        throw new Error("Unexpected error when writing cached file", { cause: reason });
      })
      .finally(handle?.close);
  };

  const cachedFetch: typeof fetch = async (resource, opts) => {
    const url = resource instanceof Request
      ? new URL(resource.url)
      : new URL(resource);

    const req = !(resource instanceof Request)
      ? new Request(resource, opts)
      : resource;

    const cached = await isCached(url);

    if (!cached) {
      return fetch(req, opts).then(async (res) => {
        if (res.ok && res.body) {
          const buffer = res.clone().arrayBuffer().then(Buffer.from);
          return writeCachedFile(url, await buffer).then(() => res);
        }
        console.error(res);
        return res;
      });
    }
    else {
      console.log(`[utils/cache] fetching ${req.url} from cache`);
      return getCached(url).then(data => new Response(data));
    }
  };

  const cache = {
    dir: ctx.dir,
    path: getCachedFilePath,
    stat: getCachedStats,
    has: isCached,
    get: getCached,
    write: writeCachedFile,
    fetch: cachedFetch,
  };

  return cache;
}

export const cache = createCache();
