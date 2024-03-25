import { z } from "astro/zod";
import { link } from "./misc";

export const base = z.strictObject({
  type: z.literal("base").default("base"),
});

export const links = base
  .extend({
    type: z.literal("links").default("links"),

    /** Describes the links in this entry. */
    title: z.string().default("Links"),

    /** The list of links. */
    links: link.array(),
  });
