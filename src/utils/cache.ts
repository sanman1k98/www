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
  private hashes: Map<RequestInfo | URL, string>;

  static {
    logger("Running static initialization block");
    this.classInitPromise = fsp.mkdir(CACHES_DIR, { recursive: true })
      .then((str) => {
        if (str)
          logger("Created `CACHES_DIR` at %s", str);
      });
  }

  private constructor(name: string) {
    if (!FileSystemCache.internal) {
      const funcName = FileSystemCache.create.name;
      throw new TypeError(`Use static method ${funcName}() instead to create an instance.`);
    }
    this.dirname = new URL(`${name}/`, CACHES_DIR);
    this.hashes = new Map();
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

  private async hashRequestInfo(info: RequestInfo | URL): Promise<string> {
    let hash = this.hashes.get(info);

    if (hash)
      return hash;

    const encoder = new TextEncoder();
    const isRequest = info instanceof Request;

    let url: URL;
    let method: string;
    let headers: Headers;

    if (isRequest) {
      url = new URL(info.url);
      method = info.method;
      headers = info.headers;
    }
    else {
      url = new URL(info);
      method = "GET";
      headers = new Headers();
    }

    // Create an alphabetically sorted array header entries
    const sortedHeaders = Array.from(headers.entries())
      .sort((a, b) => a[0].at(0)!.localeCompare(b[0].at(0)!));

    const dataString = method
      + url.toString()
      + JSON.stringify(sortedHeaders);

    hash = await crypto.subtle.digest("SHA-1", encoder.encode(dataString))
      .then(buf => Array.from(new Uint8Array(buf)))
      .then(arr => arr.map(b => b.toString(16).padStart(2, "0")).join("")) satisfies string;

    this.hashes.set(info, hash);
    return hash;
  }

  private path(hash: string) {
    return new URL(hash, this.dirname);
  }

  private async serializeResponse(response: Response): Promise<Uint8Array> {
    const init = {
      headers: response.headers.toJSON(),
      status: response.status,
      statusText: response.statusText,
    } satisfies ResponseInit;

    const initBuffer = new TextEncoder().encode(JSON.stringify(init));
    const bodyBuffer = await response.arrayBuffer().then(ab => new Uint8Array(ab));

    return Uint8Array.of(
      ...initBuffer,
      0, // Null-char
      ...bodyBuffer,
    );
  }

  private async deserializeResponse(buffer: Uint8Array): Promise<Response> {
    const i = buffer.indexOf(0); // Null-char
    const init = JSON.parse(new TextDecoder().decode(buffer.slice(0, i))) as ResponseInit;
    const body = buffer.slice(i + 1);

    return new Response(body, init);
  }

  private async write(info: RequestInfo | URL, response: Response) {
    const hash = this.hashes.get(info) ?? await this.hashRequestInfo(info);
    return this.serializeResponse(response)
      .then(buffer => fsp.writeFile(this.path(hash), buffer));
  }

  private async read(info: RequestInfo | URL) {
    const hash = this.hashes.get(info) ?? await this.hashRequestInfo(info);
    return fsp.readFile(this.path(hash))
      .then(buffer => this.deserializeResponse(buffer));
  }

  async put(info: RequestInfo | URL, response: Response): Promise<void> {
    const isRequest = info instanceof Request;
    const urlString = isRequest ? info.url : info.toString();

    if (!urlString.startsWith("http"))
      throw new TypeError("URL scheme is not `http` or `https`");

    return this.write(info, response);
  }

  async add(info: RequestInfo | URL): Promise<void> {
    return fetch(info).then((res) => {
      if (!res.ok)
        throw new TypeError("Bad response status", { cause: res });
      return this.put(info, res);
    });
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

  async match(info: RequestInfo | URL, options?: CacheQueryOptions | undefined): Promise<Response | undefined> {
    if (options)
      throw new Error("CacheQueryOptions not implemented.");

    return this.read(info)
      .catch((err) => {
        if (err.code === "ENOENT")
          return undefined;
        throw new Error(
          "Unexpected error when calling `cache.match()`",
          { cause: err },
        );
      });
  }

  matchAll(request?: RequestInfo | URL | undefined, options?: CacheQueryOptions | undefined): Promise<readonly Response[]> {
    throw new Error("Method not implemented.");
  }
}

export const cache = await FileSystemCache.create(CACHE_NAME);
