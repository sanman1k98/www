import { exifLoader, githubPullsLoader, githubReposLoader } from "@/loaders";
import { cv, info, photos } from "@/schemas";
import { glob } from "astro/loaders";
import { defineCollection, type SchemaContext, z } from "astro:content";

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
    loader: glob({
      base: "src/cv",
      pattern: "[^_]**\/*.md",
    }),
    schema: cvSchema,
  }),
  info: defineCollection({
    loader: glob({
      base: "src/data",
      pattern: "[^_]*.yaml",
    }),
    schema: infoSchema,
  }),
  photos: defineCollection({
    loader: glob({
      base: "src/photos",
      pattern: "[^_]*.yaml",
    }),
    schema: photosSchema,
  }),
  exif: defineCollection({
    loader: exifLoader({ directory: "src/photos" }),
  }),
  repos: defineCollection({
    loader: githubReposLoader({ username: "sanman1k98" }),
  }),
  pulls: defineCollection({
    loader: githubPullsLoader({ username: "sanman1k98" }),
  }),
};
