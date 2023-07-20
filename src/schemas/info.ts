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
    links: z.record(link),
  });

const socialPlatform = z.enum([
  "instagram",
  "linkedin",
  "twitter",
  "github",
]);

export const socials = base.extend({
  type: z
    .literal("socials")
    .default("socials"),
  socials: z.record(socialPlatform, link),
});
