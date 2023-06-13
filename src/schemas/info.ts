import { z } from "astro:content";
import { link } from "./misc";

export const base = z
  .object({
    type: z
      .literal("base")
      .optional()
      .default("base"),
  })
  .strict();

export const links = base
  .extend({
    type: z.literal("links"),
    links: z.record(link),
  });

export const contact = base
  .extend({
    type: z.literal("contact"),
    phone: z.string(),
    email: z.string().email(),
  });
