import { z } from "astro:content";

export const link = z
  .object({
    text: z.string(),
    href: z
      .string()
      .refine(href => href.startsWith("/"), {
        message: "href must begin with '/'",
      }),
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
