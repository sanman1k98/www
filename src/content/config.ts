import { defineCollection, z, type SchemaContext } from "astro:content";
import { cv, info, photos } from "@/schemas";

export const cvSchema = z.union([
  cv.certification,
  cv.open_source,
  cv.experience,
  cv.education,
  cv.skills,
  cv.base,
]);

export const infoSchema = z.union([
  info.links,
  info.base,
]);

export const photosSchema = (ctx: SchemaContext) => photos(ctx);

export const collections = {
  cv: defineCollection({
    type: "content",
    schema: cvSchema,
  }),
  info: defineCollection({
    type: "data",
    schema: infoSchema,
  }),
  photos: defineCollection({
    type: "data",
    schema: photosSchema,
  })
};
