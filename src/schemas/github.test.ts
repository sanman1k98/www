/* eslint-disable no-console */
import { describe, expect, it } from "bun:test";
import type { z } from "astro/zod";
import { getData, github } from "./github";

type Input = z.input<typeof getData>;

describe("GitHub REST API", () => {
  it("has different route structures for repository and PR endpoints", () => {
    const repoUrl = "https://api.github.com/repos/sanman1k98/www";
    const pullUrl = "https://api.github.com/repos/withastro/astro/pulls/10235";

    const repoSegments = new URL(repoUrl).pathname.slice(1).split("/");
    expect(repoSegments).toHaveLength(3);
    expect(repoSegments[0]).toBe("repos");

    const pullSegments = new URL(pullUrl).pathname.slice(1).split("/");
    expect(pullSegments).toHaveLength(5);
    expect(pullSegments[0]).toBe("repos");
    expect(pullSegments[3]).toBe("pulls");
  });
});

describe("getData", async () => {
  it("can get data about a repository", async () => {
    const input = {
      url: "https://api.github.com/repos/sanman1k98/www",
    } satisfies Input;

    const res = await getData.safeParseAsync(input);

    expect(res.success).toBeTrue();

    if (res.success) {
      const { data } = res;

      expect(data).toBeObject();
      expect(data).toHaveProperty("__kind", "repo");

      expect(data).toHaveProperty("html_url");
      expect(data).toHaveProperty("name");
      expect(data).toHaveProperty("full_name");
      expect(data).toHaveProperty("description");
      expect(data).toHaveProperty("created_at");
      expect(data).toHaveProperty("pushed_at");

      expect(data).toHaveProperty("url", input.url);
    }
  });

  it("can get data about a pull request", async () => {
    const input = {
      url: "https://api.github.com/repos/withastro/astro/pulls/10235",
    } satisfies Input;

    const res = await getData.safeParseAsync(input);

    expect(res.success).toBeTrue();

    if (res.success) {
      const { data } = res;

      expect(data).toBeObject();
      expect(data).toHaveProperty("__kind", "pull");

      expect(data).toHaveProperty("html_url");
      expect(data).toHaveProperty("title");
      expect(data).toHaveProperty("number", 10235);
      expect(data).toHaveProperty("body");
      expect(data).toHaveProperty("created_at");
      expect(data).toHaveProperty("updated_at");

      expect(data).toHaveProperty("url", input.url);
      expect(data).toHaveProperty("state");
      expect(data).toHaveProperty("merged", true);
      expect(data).toHaveProperty("merged_at");
    }
  });
});

describe("github", async () => {
  it("can parse data about a repository", async () => {
    const input = {
      url: "https://api.github.com/repos/sanman1k98/www",
    } satisfies Input;

    const res = await github.safeParseAsync(input);

    expect(res.success).toBeTrue();

    if (res.success) {
      const { data } = res;

      expect(data).toBeObject();
      expect(data).toHaveProperty("kind", "repo");
      expect(data).toHaveProperty("title", "www");
      expect(data).toHaveProperty("description");
      expect(data).toHaveProperty("link");
    }
  });

  it("can parse data about a pull request", async () => {
    const input = {
      url: "https://api.github.com/repos/withastro/astro/pulls/10235",
    } satisfies Input;

    const res = await github.safeParseAsync(input);

    expect(res.success).toBeTrue();

    if (res.success) {
      const { data } = res;

      expect(data).toBeObject();
      expect(data).toHaveProperty("kind", "pull");
      expect(data).toHaveProperty("title", "withastro/astro#10235");
      expect(data).toHaveProperty("description");
      expect(data).toHaveProperty("link");
    }
  });
});
