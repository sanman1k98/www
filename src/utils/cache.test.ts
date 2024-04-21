/* eslint-disable no-console */
/* eslint-disable dot-notation */
import fs, { type PathLike } from "node:fs";
import { serialize } from "node:v8";
import { afterAll, afterEach, beforeAll, describe, expect, it, jest, spyOn } from "bun:test";
import { CACHES_DIR, cache } from "./cache";

describe("Bun runtime", async () => {
  it("cannot serialize a Response", async () => {
    const res = new Response("Hello World!");
    let err;

    try {
      serialize(res);
    }
    catch (e) {
      err = e;
    }

    expect(err).toHaveProperty("message", "The object can not be cloned.");
  });
});

describe("cache", async () => {
  it("created a directory containing cache files", () => {
    expect(fs.existsSync(CACHES_DIR)).toBeTrue();
  });

  it("can serialize and deserialize a Response object", async () => {
    const body = { message: "Hello world!", foo: "bar" };
    const date = new Date().toUTCString();
    const res = Response.json(
      body,
      {
        status: 200,
        statusText: "OK",
        headers: { date },
      },
    );

    const serialized = await cache["serializeResponse"](res.clone());
    const alsoRes = await cache["deserializeResponse"](serialized);

    expect(alsoRes.json()).resolves.toEqual(body);
    expect(alsoRes.status).toBe(res.status);
    expect(alsoRes.statusText).toBe(res.statusText);
    expect(alsoRes.headers.toJSON()).toEqual(res.headers.toJSON());
  });

  it("can hash RequestInfo and get a path", async () => {
    const req = new Request("https://www.example.com");
    const url = new URL("https://www.example.com");
    const str = "https://www.example.com";

    const reqHash = await cache["hashRequestInfo"](req);
    const urlHash = await cache["hashRequestInfo"](url);
    const strHash = await cache["hashRequestInfo"](str);

    expect(reqHash).toBeString();
    expect(urlHash).toBeString();
    expect(strHash).toBeString();

    expect(reqHash).toBe(urlHash);
    expect(urlHash).toBe(strHash);

    const pathlike = cache["path"](reqHash);

    if (pathlike instanceof URL) {
      expect(pathlike.protocol).toBe("file:");
      expect(pathlike.pathname).toInclude(cache["dirname"].pathname);
    }
  });

  describe("put()", async () => {
    const req = new Request("https://www.example.com");
    const res = Response.json({ foo: "bar" });
    const path = cache["path"](await cache["hashRequestInfo"](req));

    it("can save a Response as a file", async () => {
      const putPromise = cache.put(req, res);
      expect(putPromise).resolves.toBe(undefined);

      await putPromise;

      const fd = await fs.promises.open(path);
      const stats = await fd.stat();
      expect(stats.isFile()).toBeTrue();
      expect(stats.size).toBeGreaterThan(0);

      await fd.close();
    });

    afterAll(async () => {
      await fs.promises.unlink(path).catch((err) => {
        if (err.code !== "ENOENT")
          throw new Error("Unexpected error", { cause: err });
      });
    });
  });

  describe("match()", async () => {
    const req = new Request("https://www.example.com/match");
    const body = { foo: "bar" };
    const res = Response.json(body);
    let path: PathLike;

    beforeAll(async () => {
      await cache.put(req, res);
      path = cache["path"](await cache["hashRequestInfo"](req.url));
    });

    it("can return a Response for the given RequestInfo", async () => {
      const promise = cache.match(req);
      expect(promise).resolves.toBeInstanceOf(Response);

      const alsoRes = await promise;

      if (alsoRes) {
        expect(alsoRes.json()).resolves.toEqual(body);
        expect(alsoRes.status).toBe(res.status);
        expect(alsoRes.statusText).toBe(res.statusText);
        expect(alsoRes.headers.toJSON()).toEqual(res.headers.toJSON());
      }
    });

    it("will return undefined for a URL not in the cache", async () => {
      const promise = cache.match("https://someuncachedwebsite.com");
      expect(promise).resolves.toBeUndefined();
    });

    afterAll(async () => {
      await fs.promises.unlink(path).catch((err) => {
        if (err.code !== "ENOENT")
          throw new Error("Unexpected error", { cause: err });
      });
    });
  });

  describe("add()", async () => {
    const req = new Request("https://www.example.com/add");
    const path = cache["path"](await cache["hashRequestInfo"](req));

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it("can fetch the Response for the a given URL and save it", async () => {
      const fetchSpy = spyOn(globalThis, "fetch").mockResolvedValueOnce(Response.json({ foo: "bar" }));
      const promise = cache.add(req);
      expect(promise).resolves.toBeUndefined();
      expect(fetchSpy).toHaveBeenCalled();

      await promise;

      const fd = await fs.promises.open(path);
      const stats = await fd.stat();
      expect(stats.isFile()).toBeTrue();
      expect(stats.size).toBeGreaterThan(0);

      await fd.close();
    });

    it("will error if Response is not okay", async () => {
      const fetchSpy = spyOn(globalThis, "fetch").mockResolvedValueOnce(Response.error());
      const promise = cache.add(req);
      expect(promise).rejects.toBeInstanceOf(TypeError);
      expect(fetchSpy).toHaveBeenCalled();
    });

    afterAll(async () => {
      await fs.promises.unlink(path).catch((err) => {
        if (err.code !== "ENOENT")
          throw new Error("Unexpected error", { cause: err });
      });
    });
  });
});
