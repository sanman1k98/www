import { z } from "astro/zod";

export const daterange = z.strictObject({
  /**
   * A `dateString` in the form `YYYY-MM` representing the start date for
   * this entry.
   */
  start: z.coerce.date(),
  /**
   * A `dateString` in the form `YYYY-MM` representing the start date for
   * this entry. If not specified, it implies the entry is still ongoing.
   */
  end: z.coerce.date().optional(),
});

export const organization = z.strictObject({
  name: z.string(),
  /** A URL pointing to the organization's website. */
  link: z.string().url().optional(),
  /** A city and state for this organization. */
  location: z.string().optional(),
});

export const base = z.strictObject({
  type: z.literal("base").default("base"),
  /** Set to `true` to exclude from building. */
  draft: z.boolean().default(false),
  /**
   * When specified, this number will be used to manually sort entries and
   * will take priority over start and end dates when sorting.
   */
  order: z.number().optional(),
});

export const skills = base.extend({
  type: z.literal("skills").default("skills"),
  /** Kind of skills listed in this entry e.g., "Frontend" or "Backend". */
  skills: z.string(),
});

export const experience = base.extend({
  ...daterange.shape,
  type: z.literal("experience").default("experience"),
  experience: z
    .enum([
      "work",
      "internship",
      "volunteering",
    ])
    .default("work"),
  /** Position title or role. */
  title: z.string(),
  organization,
});

export const open_source = base
  .merge(daterange.partial())
  .extend({
    type: z.literal("open-source").default("open-source"),
    /** Override the automatically created title for the entry. */
    title: z.string().optional(),
    /** Override the automatically created description for the entry. */
    description: z.string().optional(),
    /**
     * **Required**: a GitHub link to a repository or a pull request.
     *
     * Will be used to create a title and description for the entry if not specified.
     */
    link: z.string().url(),
  })
  .transform((entry) => {
    // TODO: Get title and description from the provided link.
    return entry;
  });

export const education = base.extend({
  ...daterange.shape,
  type: z.literal("education").default("education"),
  school: organization,
  major: z.string(),
  /** For example, "Bachelor of Science", "BSc", or "BS". */
  degree: z.string(),
});

export const certification = base.extend({
  ...daterange.shape,
  type: z.literal("certification").default("certification"),
  certification: z.string(),
  link: z.string().url(),
  organization,
});
