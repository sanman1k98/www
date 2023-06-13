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
