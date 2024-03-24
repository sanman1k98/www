import type { HTMLAttributes } from "astro/types";
import { z } from "astro/zod";

export const href = z.union([
  z.string().url(),
  z.string().refine((str) => {
    switch (true) {
      case str.startsWith("/"): return true;
      case str.startsWith("#"): return true;
      case str.startsWith("mailto:"): return true;
      case str.startsWith("tel:"): return true;
      default: return false;
    }
  }),
]);

type Link = HTMLAttributes<"a"> & {
  text: string;
  href: string;
  icon?: string | undefined;
};

/** Use to create HTMLAnchorElements. */
export const link = z.object({
  /** String to set the inner text of the anchor element. */
  text: z.string(),
  href,
  target: z.enum(["_blank", "_self", "_parent", "_top"]).optional(),
  /** **Optional**: An Iconify icon name. */
  icon: z.string().optional(),
}) satisfies z.ZodType<Link>;
