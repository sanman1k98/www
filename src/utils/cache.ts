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

  const toPath = (key: CacheKey) => {
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

  const statCache = async (key: CacheKey): Promise<Stats | undefined> => {
    if (ctx.stats.has(key))
      return ctx.stats.get(key)!;
    return fs.stat(toPath(key))
      .then(val => ctx.stats.set(key, val) && val)
      .catch((err) => {
        if (err.code === "ENOENT")
          return undefined;
        throw new Error("Unknown error", { cause: err });
      });
  };

  const hasCache = (key: CacheKey): Promise<boolean> => {
    return statCache(key).then(Boolean);
  };

  const getCache = async (key: CacheKey) => {
    return hasCache(key)
      .then(cached => cached ? fs.readFile(toPath(key)) : undefined);
  };

  const writeCache = async (key: CacheKey, data: string | Uint8Array, opts: BufferEncoding = "utf-8") => {
    const path = toPath(key);
    return fs.mkdir(dirname(String(path)), { recursive: true })
      .then(() => fs.open(path, "w"))
      .then(fd => fd.writeFile(data, opts).then(fd.close))
      .then(() => fs.stat(path))
      .then(stat => ctx.stats.set(key, stat) && undefined);
  };

  const cachedFetch: typeof fetch = async (resource, opts) => {
    const url = resource instanceof Request
      ? new URL(resource.url)
      : new URL(resource);

    const req = !(resource instanceof Request)
      ? new Request(resource, opts)
      : resource;

    const cached = await hasCache(url);

    if (!cached) {
      return fetch(req, opts).then(async (res) => {
        if (res.ok && res.body) {
          const buffer = res.clone().arrayBuffer().then(Buffer.from);
          return writeCache(url, await buffer).then(() => res);
        }
        console.error(res);
        return res;
      });
    }
    else {
      console.log(`[utils/cache] fetching ${req.url} from cache`);
      return getCache(url).then(data => new Response(data));
    }
  };

  const cache = {
    context: ctx,
    dir: ctx.dir,
    path: toPath,
    stat: statCache,
    has: hasCache,
    get: getCache,
    write: writeCache,
    fetch: cachedFetch,
  };

  return cache;
}

export const cache = createCache();
