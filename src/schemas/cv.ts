import { z } from "astro/zod";
import { daterange, tags, org } from "./misc";

export const base = z
  .object({
    type: z.literal("base").default("base"),
    draft: z.boolean().default(false),
  })
  .strict();

export const skills = base
  .extend({
    type: z.literal("skills").default("skills"),
    /** Type of skills listed in this entry e.g., "Languages" or "Technologies". */
    skills: z.string()
  });

export const experience = base
  .merge(daterange)
  .merge(tags.partial())
  .extend({
    type: z.literal("experience"),
    title: z
      .string()
      .describe("position title or role"),
    employer: org,
    internship: z
      .boolean()
      .default(false)
      .describe("true if this entry is an internship"),
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
  .transform(entry => {
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

export const volunteering = base
  .merge(daterange)
  .extend({
    type: z.literal("volunteering"),
    title: z
      .string()
      .describe("Position title or role"),
    organization: org,
  });
