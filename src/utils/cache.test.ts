import fs from "node:fs";
import { describe, expect, it } from "bun:test";
import { CACHES_DIR, cache } from "./cache";

describe("cache", async () => {
  const REQ_URL = "https://api.github.com/repos/sanman1k98/www";
  const CACHED_RES_SUBDIR = "./v0/api.github.com/repos-sanman1k98-www/";

  it("creates a directory containing cache files", () => {
    expect(fs.existsSync(CACHES_DIR)).toBeTrue();
  });

  it.skip("can save request/response pairs", async () => {
    const res = await fetch(REQ_URL);
    const promise = cache.put(REQ_URL, res);
    expect(promise).resolves.toBeUndefined();
    const dir = new URL(CACHED_RES_SUBDIR, CACHES_DIR);
    expect(fs.existsSync(dir));
  });

  it.todo("can return a response for the associated request", () => {
    const promise = cache.match(REQ_URL);
    expect(promise).resolves.toBeInstanceOf(Response);
  });
});
