import unoConfig from "uno.config";
import { resolveConfig } from "unocss";
import type { theme as miniTheme } from "unocss/preset-mini";

export const { theme: unoTheme } = resolveConfig<typeof miniTheme>(unoConfig);
