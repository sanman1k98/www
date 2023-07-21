import { z } from "astro/zod";
import { link } from "./misc";

export const base = z
  .object({
    type: z
      .literal("base")
      .default("base"),
  })
  .strict();

export const links = base
  .extend({
    type: z
      .literal("links")
      .default("links"),
    links: link.array(),
  });
