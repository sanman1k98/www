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
  // @ts-ignore: errors when collection is empty
  return (entry: CollectionEntry<"cv">): entry is CvEntry<T> => entry.data.type === type;
}

export function createInfoEntryTypeGuard<T extends InfoEntryType>(type: T) {
  return (entry: CollectionEntry<"info">): entry is InfoEntry<T> => entry.data.type === type;
}

type SortableCvEntry = CollectionEntry<"cv"> & { data: Partial<z.infer<typeof daterange>> };

/**
 * Compare two entries in the "cv" collection by their date ranges. Intended to
 * be used with `Array.prototype.sort()`.
 *
 * Return zero if both entries don't have start dates, otherwise compare both
 * entries by their end dates.
 *
 * If the end dates are equal (e.g., they are both undefined which means they
 * are both ongoing), compare the entries by their start dates.
 */
export function compareCvEntryDateranges(a: SortableCvEntry, b: SortableCvEntry) {
  if (!(a.data.start && b.data.start)) return 0;
  // Create a value for undefined end dates
  const present = Date.now().valueOf();
  const [startA, startB, endA, endB] = [
    a.data.start.valueOf(),
    b.data.start.valueOf(),
    a.data.end?.valueOf() ?? present,
    b.data.end?.valueOf() ?? present,
  ];
  // JS considers 0 to be falsy
  return endA - endB || startA - startB;
}

// An empty collection will return `undefined` i.e., when the "cv" git submodule is empty
const maybeCvEntries: SortableCvEntry[] = await getCollection("cv") ?? [];

export const cvEntries: CollectionEntry<"cv">[] = maybeCvEntries.sort(compareCvEntryDateranges).reverse();
export const infoEntries = await getCollection("info");

const linksEntries = infoEntries.filter(createInfoEntryTypeGuard("links"));

/**
 * Keys are filenames of "links" entries in the "info" collection.
 */
export const links = Object.fromEntries(
  linksEntries.map(entry => [entry.id, entry.data.links])
);

/**
 * A dictionary created from items in the "socials" entry, where each key is
 * the "text" value of each item.
 */
export const socials = Object.fromEntries(
  links.socials.map(link => [link.text.toLowerCase(), link])
);

export const photos = (await getCollection("photos"))[0].data;
