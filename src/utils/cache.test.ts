import { describe, expect, it } from "bun:test";
import { cache } from "./cache";

describe("cache", async () => {
  const REPO_URL = "https://api.github.com/repos/sanman1k98/www";
  const CACHE_FILE = "api.github.com/repos-sanman1k98-www.json";

  it("has a path to a directory containing cache files", () => {
    const dir = cache.dir;
    expect(dir).toContain("/.cache/default");
  });

  it("can return a path to a cache file", () => {
    const path = cache.path(new URL(REPO_URL));
    expect(path).toStartWith(cache.dir);
    expect(path).toEndWith(CACHE_FILE);
  });

  it.only("can fetch without failing", async () => {
    const res = cache.fetch(REPO_URL, {
      headers: {
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
    });

    expect(res).resolves.toHaveProperty("ok", true);
  });
});
