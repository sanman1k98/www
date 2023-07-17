import { z } from "astro/zod";
import { daterange, tags, org } from "./misc";

export const base = z
  .object({
    type: z
      .literal("base")
      .optional()
      .default("base"),
    draft: z
      .boolean()
      .optional()
      .default(false),
  })
  .strict();

export const skills = base
  .extend({
    type: z.literal("skills"),
    category: z
      .string()
      .describe("e.g., languages or frameworks"),
  });

export const experience = base
  .extend({
    type: z.literal("experience"),
    title: z
      .string()
      .describe("position title or role"),
    employer: org,
    internship: z
      .boolean()
      .optional()
      .default(false)
      .describe("true if this entry is an internship"),
  })
  .merge(daterange)
  .merge(tags.partial());

export const project = base
  .extend({
    type: z.literal("project"),
    name: z.string(),
    description: z
      .string()
      .max(65)
      .describe("short description of the project"),
    githubUrl: z
      .string()
      .url()
      .describe("Link to GitHub repository"),
  })
  .merge(daterange)
  .merge(tags);

export const education = base
  .extend({
    type: z.literal("education"),
    school: org,
    major: z.string(),
    degree: z.string(),
  })
  .merge(daterange);

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
  });

export const volunteering = base
  .extend({
    type: z.literal("volunteering"),
    title: z
      .string()
      .describe("Position title or role"),
    organization: org,
  })
  .merge(daterange);
