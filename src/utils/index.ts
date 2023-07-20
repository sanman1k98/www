import type { z } from "astro/zod";
import envSchema from "@/schemas/env";

declare global {
  interface ImportMetaEnv
    extends Readonly<z.input<typeof envSchema>> {}

  interface ImportMeta {
    readonly env: ImportMetaEnv
  }
};

export const env = envSchema.parse(process.env);
