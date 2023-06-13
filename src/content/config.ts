import { defineCollection, z } from "astro:content";
import * as info from "@/schemas/info";

export const infoSchema = z.union([
  info.base,
  info.links,
  info.contact,
]);

export const collections = {
  info: defineCollection({
    type: "data",
    schema: infoSchema,
  }),
};
