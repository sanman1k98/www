import { type SchemaContext, defineCollection, z } from "astro:content";
import { cv, info, photos } from "@/schemas";
import { githubPullsLoader, githubReposLoader } from "@/loaders/github";
import { exifLoader } from "@/loaders/exif";

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
  exif: defineCollection({
    loader: exifLoader({ directory: "src/content/photos" }),
  }),
  repos: defineCollection({
    loader: githubReposLoader({ username: "sanman1k98" }),
  }),
  pulls: defineCollection({
    loader: githubPullsLoader({ username: "sanman1k98" }),
  }),
};
