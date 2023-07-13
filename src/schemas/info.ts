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

export const socials = base
  .extend({
    type: z.literal("socials"),
    linkedin: z.object({
      url: z.string().url(),
    }),
    github: z.object({
      url: z.string().url(),
    }).transform(gh => {
      return { ...gh, username: gh.url.split("/").pop() };
    }),
    instagram: z.object({
      url: z.string().url(),
    }).transform(ig => {
      return { ...ig, username: ig.url.split("/").pop() };
    }),
  });

export const contact = base
  .extend({
    type: z.literal("contact"),
    phone: z.string(),
    email: z.string().email(),
  });
