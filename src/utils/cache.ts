import fs from "node:fs";

const fsp = fs.promises;

const logger: typeof console.log = (...data) => {
  const [fmt, ...args] = data;
  // eslint-disable-next-line no-console
  console.log(`[utils/cache] ${fmt}`, ...args);
};

export const CACHES_DIR = new URL("./../../node_modules/.cache/cache-storage/", import.meta.url);
const CACHE_NAME = "v0";

class FileSystemCache implements Cache {
  private static internal = false;
  private static classInitPromise: Promise<any>;
  private initPromise: Promise<any>;
  private dirname: URL;
  private memoryCache: Map<RequestInfo | URL, Response>;

  static {
    logger("Running static initialization block");
    this.classInitPromise = fsp.mkdir(CACHES_DIR, { recursive: true })
      .then(str => logger("Resolved with value %s", str));
  }

  private constructor(name: string) {
    if (!FileSystemCache.internal) {
      const funcName = FileSystemCache.create.name;
      throw new TypeError(`Use static method ${funcName}() instead to create an instance.`);
    }
    this.dirname = new URL(`${name}/`, CACHES_DIR);
    this.memoryCache = new Map();
    this.initPromise = fsp.mkdir(this.dirname, { recursive: true });
    FileSystemCache.internal = false;
  }

  public static async create(name: string) {
    this.internal = true;
    const instance = new this(name);

    const promises = Promise.all([
      this.classInitPromise,
      instance.initPromise,
    ]);

    return promises.then(() => instance);
  }

  private static hashResponse(response: Response) {
    const str = response.headers.get("Date");
    const date = str ? new Date(str) : new Date();
    return date.toISOString().slice(0, 10);
  }

  async put(info: RequestInfo | URL, response: Response): Promise<void> {
    this.memoryCache.set(info, response);
    const isRequest = info instanceof Request;

    const url = isRequest
      ? new URL(info.url)
      : new URL(info);

    const request = !isRequest
      ? new Request(url)
      : info.clone();

    const subdirname = new URL(`${url.hostname}/${url.pathname.slice(1)}/`, this.dirname);
    const metadataPath = new URL("./metadata.json", subdirname);
    const responsePath = new URL(`./body-${FileSystemCache.hashResponse(response)}.blob`, subdirname);

    const metadata = {
      meta: {
        url,
        method: request.method,
      },
      request: {
        headers: request.headers.toJSON(),
        body: request.body && await request.text(),
      },
      response: {
        headers: response.headers.toJSON(),
        body: response.body && responsePath,
      },
    };

    const promise = fsp.mkdir(subdirname, { recursive: true }).then(() =>
      Promise.all([
        fsp.writeFile(metadataPath, JSON.stringify(metadata, null, 2)),
        response.body && response.arrayBuffer()
          .then(buf => new Uint8Array(buf))
          .then(view => fsp.writeFile(responsePath, view)),
      ]),
    );

    return promise
      .then(() => logger("Saved response to cache!"))
      .catch((err) => {
        throw new Error("Unexpected error occurred when saving files", { cause: err });
      });
  }

  add(request: RequestInfo | URL): Promise<void> {
    throw new Error("Method not implemented.");
  }

  addAll(requests: RequestInfo[]): Promise<void>;
  addAll(requests: Iterable<RequestInfo>): Promise<void>;
  addAll(requests: unknown): Promise<void> {
    throw new Error("Method not implemented.");
  }

  delete(request: RequestInfo | URL, options?: CacheQueryOptions | undefined): Promise<boolean> {
    throw new Error("Method not implemented.");
  }

  keys(request?: RequestInfo | URL | undefined, options?: CacheQueryOptions | undefined): Promise<readonly Request[]> {
    throw new Error("Method not implemented.");
  }

  match(request: RequestInfo | URL, options?: CacheQueryOptions | undefined): Promise<Response | undefined> {
    throw new Error("Method not implemented.");
  }

  matchAll(request?: RequestInfo | URL | undefined, options?: CacheQueryOptions | undefined): Promise<readonly Response[]> {
    throw new Error("Method not implemented.");
  }
}

export const cache = await FileSystemCache.create(CACHE_NAME);
