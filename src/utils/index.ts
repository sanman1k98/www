import type { theme as miniTheme } from "@unocss/preset-mini";
import { resolveConfig } from "@unocss/core";
import unoConfig from "uno.config";

export { env } from "./env";

export const { theme: unoTheme } = resolveConfig<typeof miniTheme>(unoConfig);
