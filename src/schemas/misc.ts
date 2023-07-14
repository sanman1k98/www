import { z } from "astro/zod";

/** Use to create HTMLAnchorElements. */
export const link = z
  .object({
    /** String to set to `HTMLAnchorElement.innerText`. */
    text: z.string(),
    href: z.union([
      z.string().url(),
      z.string().refine(s => {
        switch (true) {
          case s.startsWith("/"): return true;
          case s.startsWith("#"): return true;
          case s.startsWith("mailto:"): return true;
          case s.startsWith("tel:"): return true;
          default: return false;
        }
      }),
    ]),
    title: z.string().optional(),
    target: z.enum(["_blank", "_self", "_parent", "_top"]).optional(),
    rel: z.string().optional(),
  });

export const daterange = z
  .object({
    start: z.coerce.date(),
    end: z.coerce.date().optional(),
  });

export const tags = z
  .object({
    tags: z.string().array(),
  });

export const org = z
  .object({
    name: z.string(),
    url: z
      .string()
      .url()
      .optional(),
    location: z.string(),
  });
