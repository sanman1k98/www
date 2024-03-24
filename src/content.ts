import { type CollectionEntry, getCollection, getEntry, type z } from "astro:content";
import type { cvSchema, infoSchema, photosSchema } from "@/content/config";
import type { daterange } from "@/schemas/cv";

type CvEntryData = z.infer<typeof cvSchema>;
type InfoEntryData = z.infer<typeof infoSchema>;
type PhotosEntryData = z.infer<ReturnType<typeof photosSchema>>;

export type CvEntryType = CvEntryData["type"];
export type InfoEntryType = InfoEntryData["type"];

export type CvEntry<T extends CvEntryType> = CollectionEntry<"cv"> & {
  data: Extract<CvEntryData, { type: T }>;
};

export type InfoEntry<T extends InfoEntryType> = CollectionEntry<"info"> & {
  data: Extract<InfoEntryData, { type: T }>;
};

export type Photo = PhotosEntryData[number];

export function createCvEntryTypeGuard<T extends CvEntryType>(type: T) {
  return (entry: CollectionEntry<"cv">): entry is CvEntry<T> => entry.data.type === type;
}

export function createInfoEntryTypeGuard<T extends InfoEntryType>(type: T) {
  return (entry: CollectionEntry<"info">): entry is InfoEntry<T> => entry.data.type === type;
}

type SortableCvEntry = CollectionEntry<"cv"> & { data: Partial<z.infer<typeof daterange>> };

const present = new Date();
let cvStart = present;
let foundCvStart = false;

/**
 * A callback to sort entries in the "cv" collection by comparing which one
 * happened most recently, or by their specified orders.
 *
 * Entries can be compared using values from the following fields if they exist
 * on both, and are listed here from highest to lowest priority:
 * 1. "order"
 * 2. "end"
 * 3. "start"
 */
export function compareCvEntries(a: SortableCvEntry, b: SortableCvEntry): number {
  // Check "order" values first
  const [orderA, orderB] = [a.data.order, b.data.order];
  if (orderA !== undefined && orderB !== undefined)
    return orderA - orderB;
  // If and entry doesn't have a "start" they def don't have an "end", so we'll
  // return 0 so they won't get sorted.
  else if (!(a.data.start && b.data.start))
    return 0;
  const [startA, startB, endA, endB] = [
    a.data.start.valueOf(),
    b.data.start.valueOf(),
    a.data.end?.valueOf() ?? present.valueOf(),
    b.data.end?.valueOf() ?? present.valueOf(),
  ];
  if (!foundCvStart) {
    if (startA < cvStart.valueOf())
      cvStart = a.data.start;
    else if (startB < cvStart.valueOf())
      cvStart = b.data.start;
  }
  // JS considers 0 to be falsy
  return endA - endB || startA - startB;
}

// An empty collection will return `undefined` i.e., when the "cv" git submodule is empty
const maybeCvEntries: SortableCvEntry[] = await getCollection("cv") ?? [];

/** Sorted in (mostly) reverse chronological order. */
export const cvEntries: CollectionEntry<"cv">[] = maybeCvEntries.sort(compareCvEntries).reverse();

// Set this to true because we just sorted `cvEntries` using `compareCvEntries`
foundCvStart = true;

/** The earliest date specified in an entry from the "cv" collection. */
export const CV_START = cvEntries
  .flatMap(entry => "start" in entry.data && entry.data.start ? entry.data.start : [])
  .reduce((a, b) => a.valueOf() - b.valueOf() > 0 ? b : a);

export const infoEntries = await getCollection("info");

const linksEntries = infoEntries.filter(createInfoEntryTypeGuard("links"));

/** Keys are filenames of "links" entries in the "info" collection. */
export const links = Object.fromEntries(
  linksEntries.map(entry => [entry.id, entry.data.links]),
) as { [key in InfoEntry<"links">["id"]]: InfoEntry<"links">["data"]["links"] };

/**
 * A dictionary created from items in the "socials" entry, where each key is
 * the "text" value of each item.
 */
export const socials = Object.fromEntries(
  links.socials.map(link => [link.text.toLowerCase(), link]),
);

/** A list of photos with alt text and transformed metadata. */
export const photos = await getEntry("photos", "index").then(({ data }) => data);
