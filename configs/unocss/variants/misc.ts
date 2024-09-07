import type { Variant } from "unocss";
import { variantParentMatcher } from "@unocss/preset-mini/utils";

export const variantMouse = variantParentMatcher("mouse", "@media (hover: hover), (any-hover: hover)") as unknown as Variant;
