import { defineCollection, z } from "astro:content";
import { cv, info } from "@/schemas";

export const cvSchema = z.union([
  cv.base,
  cv.skills,
  cv.education,
  cv.experience,
  cv.open_source,
  cv.volunteering,
  cv.certification,
]);

export const infoSchema = z.union([
  info.base,
  info.links,
]);

export const collections = {
  cv: defineCollection({
    type: "content",
    schema: cvSchema,
  }),
  info: defineCollection({
    type: "data",
    schema: infoSchema,
  }),
};
