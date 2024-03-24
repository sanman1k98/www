import type { HTMLAttributes } from "astro/types";
import { z } from "astro/zod";

type Link = HTMLAttributes<"a"> & {
  text: string;
  href: string;
  icon?: string;
};

/** Use to create HTMLAnchorElements. */
export const link = z
  .object({

    /** **Required**: string to set the inner text of the anchor element. */
    text: z.string(),

    /** **Required**: URL to set the href attribute of the anchor element. */
    href: z.union([
      z.string().url(),
      z.string().refine((s) => {
        switch (true) {
          case s.startsWith("/"): return true;
          case s.startsWith("#"): return true;
          case s.startsWith("mailto:"): return true;
          case s.startsWith("tel:"): return true;
          default: return false;
        }
      }),
    ]),

    /** **Optional**: where to load the URL; defaults to "_self". */
    target: z
      .enum([
        "_blank",
        "_self",
        "_parent",
        "_top",
      ])
      .optional(),

    /** **Optional**: An Iconify icon name. */
    icon: z.string().optional(),
  }) satisfies z.ZodType<Link>;
