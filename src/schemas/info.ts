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

// TODO: Extract schema which computes username from url
export const socials = base
  .extend({
    type: z.literal("socials"),
    linkedin: z.object({
      url: z.string().url(),
    }),
    github: z.object({
      url: z.string().url(),
    }).transform(gh => {
      const url = new URL(gh.url);
      const path = url.pathname;
      const username = path.slice(1);
      return { ...gh, username };
    }),
    instagram: z.object({
      url: z.string().url(),
    }).transform(ig => {
      const url = new URL(ig.url);
      const path = url.pathname;
      const username = path.slice(1);
      return { ...ig, username };
    }),
  });
