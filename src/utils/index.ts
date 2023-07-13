import type { z } from "astro:content";
import envSchema from "@/schemas/env";

declare global {
  interface ImportMetaEnv
    extends Readonly<z.input<typeof envSchema>> {}

  interface ImportMeta {
    readonly env: ImportMetaEnv
  }
};

export const env = envSchema.parse(import.meta.env);
