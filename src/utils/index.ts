import type { z } from "astro:content";
import envSchema from "@/schemas/env";

declare global {
  interface ImportMetaEnv
    extends Readonly<z.input<typeof envSchema>> {}

  interface ImportMeta {
    readonly env: ImportMetaEnv
  }
};

// TODO: use a library like `@t3-oss/env-core` for env vars validation

// FIXME: This is a workaround for Vite statically replacing `import.meta.env`
// with the actual values.
export const env = envSchema.parse(process.env);
