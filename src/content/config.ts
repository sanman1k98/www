import { type SchemaContext, defineCollection, z } from "astro:content";
import { cv, info, photos } from "@/schemas";
import { githubReposLoader } from "@/loaders/github/repos";

export const cvSchema = z.union([
  cv.certification,
  cv.opensource,
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
  }),
  repos: defineCollection({
    loader: githubReposLoader({ user: "sanman1k98" }),
  }),
};
