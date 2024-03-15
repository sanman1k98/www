import { z } from "astro/zod";
import { org, tags } from "./misc";

export const daterange = z
  .object({
    start: z.coerce.date(),
    end: z.coerce.date().optional(),
  });

export const base = z
  .strictObject({
    type: z.literal("base").default("base"),
    /** Set to `true` to exclude from building. */
    draft: z.boolean().default(false),
    /**
     * Can be used to manually sort entries and will take
     * priority over start and end dates when sorting.
     */
    order: z.number().optional(),
  });

export const skills = base
  .extend({
    type: z.literal("skills").default("skills"),
    /** Type of skills listed in this entry e.g., "Languages" or "Technologies". */
    skills: z.string(),
  });

export const experience = base
  .merge(daterange)
  .merge(tags.partial())
  .extend({
    type: z.literal("experience").default("experience"),
    /** Type of experience. */
    experience: z
      .enum([
        "work",
        "internship",
        "volunteering",
      ])
      .default("work"),
    /** Position title or role. */
    title: z.string(),
    /** Employer or organization. */
    organization: org,
  });

export const open_source = base
  .merge(daterange.partial())
  .merge(tags.partial())
  .extend({
    type: z.literal("open-source").default("open-source"),

    /**
     * **Required**: a GitHub link to a repository or a pull request.
     *
     * Will be used to create a title and description for the entry if not specified.
     */
    githubUrl: z.string().url(),

    /**
     * Override the automatically created title for the entry.
     */
    title: z.string().optional(),

    /**
     * Override the automatically created description for the entry.
     */
    description: z.string().optional(),
  })
  .transform((entry) => {
    // TODO: get title and description from `githubUrl`
    return entry;
  });

export const education = base
  .merge(daterange)
  .extend({
    type: z.literal("education"),
    school: org,
    major: z.string(),
    degree: z.string(),
  });

export const certification = base
  .extend({
    type: z.literal("certification"),
    name: z
      .string()
      .describe("Name of the certification"),
    organization: org
      .omit({ location: true })
      .describe("Organization which gave out the certification."),
    issueDate: z
      .date()
      .describe("Date the certification was issued"),
    expiryDate: z
      .date()
      .optional()
      .describe("Date the certification expires"),
    url: z
      .string()
      .url()
      .optional(),
  });
