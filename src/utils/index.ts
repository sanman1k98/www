import type { Theme, colors } from "@unocss/preset-mini";
import { resolveConfig } from "@unocss/core";
import unoConfig from "uno.config";


export { env } from "./env";

export const resolvedUnoConfig = resolveConfig<Theme>(unoConfig);

export const unoBreakpoints = resolvedUnoConfig.theme.breakpoints ?? {};

export const unoColors = resolvedUnoConfig.theme.colors as typeof colors;
