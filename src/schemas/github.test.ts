import { describe, expect, it } from "bun:test";
import type { z } from "astro/zod";
import { getData } from "./github";

type Input = z.input<typeof getData>;

describe("getData", async () => {
  it("transforms input with response from GitHub API", async () => {
    const input = {
      url: "https://api.github.com/repos/sanman1k98/www",
    } satisfies Input;

    const res = await getData.safeParseAsync(input);

    expect(res.success).toBeTrue();

    if (res.success) {
      const { data } = res;
      expect(data).toBeObject();
      expect(data).toHaveProperty("name");
      expect(data).toHaveProperty("html_url");
    }
  });

  it("transforms input with date the data was fetched", async () => {
    const input = {
      url: "https://api.github.com/repos/sanman1k98/www",
    } satisfies Input;

    const data = await getData.parseAsync(input);

    expect(data).toBeObject();
    // Not a property in the original API response.
    expect(data).toHaveProperty("__date");
  });
});
