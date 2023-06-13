import { getCollection } from "astro:content";
import type { CollectionEntry, z } from "astro:content";
import type {
  infoSchema,
  collections,
} from "@/content/config";

export type CollectionKey = keyof typeof collections;

type InfoEntryData = z.infer<typeof infoSchema>;

export type InfoEntryType = InfoEntryData["type"];

export type InfoEntry<T extends InfoEntryType> = CollectionEntry<"info"> & {
  data: Extract<InfoEntryData, { type: T }>;
};

export function createInfoEntryTypeGuard<T extends InfoEntryType>(type: T) {
  return (entry: CollectionEntry<"info">): entry is InfoEntry<T> => entry.data.type === type;
}

export const infoEntries = await getCollection("info");

export const siteInfo = infoEntries.find(entry => entry.id === "site") as InfoEntry<"links">;

export const linksEntries = infoEntries.filter(createInfoEntryTypeGuard("links"))
