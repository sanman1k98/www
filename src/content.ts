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

import type { daterange } from "@/schemas/misc";

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

export function compareCvEntryDateranges<
  E extends CollectionEntry<"cv"> & {
    data: Partial<z.infer<typeof daterange>>;
  }
>(a: E, b: E) {
  if (!(a.data.start && b.data.start)) return 0;
  const present = Date.now().valueOf();
  const [startA, startB, endA, endB] = [
    a.data.start.valueOf(),
    b.data.start.valueOf(),
    a.data.end?.valueOf() ?? present,
    b.data.end?.valueOf() ?? present,
  ];
  return endA - endB || startA - startB;
}

export const cvEntries = (await getCollection("cv")).sort(compareCvEntryDateranges).reverse();
export const infoEntries = await getCollection("info");

const socialsInfo = infoEntries.find(entry => entry.id === "socials") as InfoEntry<"socials">;
export const socials = socialsInfo.data;

export const siteInfo = infoEntries.find(entry => entry.id === "site") as InfoEntry<"links">;
