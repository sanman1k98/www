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

export const skills = base
  .extend({
    type: z.literal("skills"),
    languages: z.string().array(),
    libraries: z.string().array(),
    miscellaneous: z.string().array(),
  });
