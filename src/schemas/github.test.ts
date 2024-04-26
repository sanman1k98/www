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
      expect(data.__kind).toBe("full-repository");
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
      expect(data.__kind).toBe("pull-request");
    }
  });
});

describe("github", async () => {
  it("can transform data about a repository", async () => {
    const input = {
      url: "https://api.github.com/repos/sanman1k98/www",
    } satisfies Input;

    const res = await github.safeParseAsync(input);

    expect(res.success).toBeTrue();

    if (res.success) {
      const { data } = res;

      expect(data).toBeObject();

      expect(data.kind).toBe("full-repository");
      if (data.kind === "full-repository") {
        expect(data.title).toBe("www");
        expect(data.link).toBeString();
        expect(data.description).toBeDefined();
      }
    }
  });

  it("can transform data about a pull request", async () => {
    const input = {
      url: "https://api.github.com/repos/withastro/astro/pulls/10235",
    } satisfies Input;

    const res = await github.safeParseAsync(input);

    expect(res.success).toBeTrue();

    if (res.success) {
      const { data } = res;

      expect(data).toBeObject();

      expect(data.kind).toBe("pull-request");
      if (data.kind === "pull-request") {
        expect(data.title).toBe("withastro/astro#10235");
        expect(data.link).toBeString();
        expect(data.description).toBeString();
      }
    }
  });
});
