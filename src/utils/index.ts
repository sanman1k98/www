import type { z } from "astro/zod";
import envSchema from "@/schemas/env";
import type { Theme } from "@unocss/preset-uno";
import { resolveConfig } from "@unocss/core";
import unoConfig from "uno.config";

declare global {
  interface ImportMetaEnv
    extends Readonly<z.input<typeof envSchema>> {}

  interface ImportMeta {
    readonly env: ImportMetaEnv
  }
};

export const env = envSchema.parse(process.env);

export const resolvedUnoConfig = resolveConfig<Theme>(unoConfig);

export const unoBreakpoints = resolvedUnoConfig.theme.breakpoints ?? {};
