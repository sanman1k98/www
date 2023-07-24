import { z } from "astro/zod";

// TODO: constrain the ZodObject schema using HTMLAttributes type.

/** Use to create HTMLAnchorElements. */
export const link = z
  .object({

    /**
     * **Required**: string to set the inner text of the anchor element.
     */
    text: z.string(),

    /**
     * **Required**: URL to set the href attribute of the anchor element.
     */
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

    /**
     * **Optional**: string to set the title attribute of the anchor element.
     */
    title: z.string().optional(),

    /**
     * **Optional**: where to load the URL; defaults to "_self".
     */
    target: z
      .enum([
        "_blank",
        "_self",
        "_parent",
        "_top"
      ])
      .default("_self"),
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
