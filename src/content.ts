import {
  getCollection,
  type CollectionEntry,
  type z,
} from "astro:content";

import type {
  cvSchema,
  infoSchema,
  collections,
} from "@/content/config";

export type CollectionKey = keyof typeof collections;

type CvEntryData = z.infer<typeof cvSchema>;
type InfoEntryData = z.infer<typeof infoSchema>;

export type CvEntryType = CvEntryData["type"];
export type InfoEntryType = InfoEntryData["type"];

export type CvEntry<T extends CvEntryType> = CollectionEntry<"cv"> & {
  data: Extract<CvEntryData, { type: T }>;
};

export type InfoEntry<T extends InfoEntryType> = CollectionEntry<"info"> & {
  data: Extract<InfoEntryData, { type: T }>;
};

export function createCvEntryTypeGuard<T extends CvEntryType>(type: T) {
  return (entry: CollectionEntry<"cv">): entry is CvEntry<T> => entry.data.type === type;
}

export function createInfoEntryTypeGuard<T extends InfoEntryType>(type: T) {
  return (entry: CollectionEntry<"info">): entry is InfoEntry<T> => entry.data.type === type;
}

export const cvEntries = await getCollection("cv");
export const infoEntries = await getCollection("info");

export const contact = infoEntries.find(entry => entry.id === "secret/contact") as InfoEntry<"contact">;

export const siteInfo = infoEntries.find(entry => entry.id === "site") as InfoEntry<"links">;
