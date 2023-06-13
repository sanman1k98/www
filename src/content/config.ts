import { defineCollection, z } from "astro:content";
import { cv, info } from "@/schemas";

export const cvSchema = z.union([
  cv.base,
  cv.project,
  cv.education,
  cv.experience,
  cv.volunteering,
  cv.certification,
]);

export const infoSchema = z.union([
  info.base,
  info.links,
  info.contact,
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
