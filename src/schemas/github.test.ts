import { describe, expect, it } from "bun:test";
import type { z } from "astro/zod";
import { getData } from "./github";

type Input = z.input<typeof getData>;

describe("getData", async () => {
  it("transforms input with data from GitHub API", async () => {
    const input = {
      url: "https://api.github.com/repos/sanman1k98/www",
    } satisfies Input;

    const parsed = await getData.safeParseAsync(input);

    expect(parsed.success).toBeTrue();

    if (parsed.success) {
      const { data } = parsed;
      expect(data).toBeObject();
      expect(data).toHaveProperty("name");
      expect(data).toHaveProperty("html_url");
    }
  });
});
