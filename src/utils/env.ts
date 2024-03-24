import { z } from "astro/zod";

const envSchema = z.object({
  /** Retrieved with `gh auth token`. */
  GITHUB_TOKEN: z.string().optional(),
  /** To be displayed on the resume page when printing. */
  PERSONAL_PHONE: z.string().default("+1-800-NOT-REAL"),
  /** To be displayed on the resume page when printing. */
  PERSONAL_EMAIL: z.string().email().default("placeholder@example.com"),

  /**
   * Use to display personal contact information on the resume page.
   *
   * When set to "true" and running `astro dev` or `astro build`, Astro will
   * generate static HTML files containing personal information.
   *
   * @see `src/pages/resume/index.astro` for usage.
   *
   * @example Create a Resume PDF with contact information
   * ```sh
   * BUILD_INCLUDE_PERSONAL=true bun run astro build
   * ```
   * You can then go to http://localhost:4321/resume and print the page and save
   * as a PDF which will contain personal contact information.
   *
   * @remarks
   * **WARNING**: Setting `display: none` in CSS will **not** remove data from
   * the HTML. **DO NOT** upload the generated files to a public repository if
   * set to "true" because they will contain sensitive information.
   */
  BUILD_INCLUDE_PERSONAL: z
    .enum(["true", "false"])
    .default("false")
    .transform(str => str === "true"),
});

declare global {
  interface ImportMetaEnv
    extends Readonly<z.input<typeof envSchema>> {}

  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
};

export const env = envSchema.parse(process.env);

export default env;
