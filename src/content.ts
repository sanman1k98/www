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

export function compareOrderedEntries(a: CollectionEntry<"cv">, b: CollectionEntry<"cv">): number {
  const [orderA, orderB] = [a.data.order, b.data.order];
  if (orderA !== undefined && orderB !== undefined)
    return orderA - orderB;
  else return 0;
}

type ChronologicalEntry = CollectionEntry<"cv"> & {
  data: Extract<CvEntryData, z.infer<typeof daterange>>;
};

export const PRESENT = new Date();
/**
 * A callback to sort entries in the "cv" collection by comparing which one
 * happened most recently.
 */
export function compareChronologicalEntries(a: ChronologicalEntry, b: ChronologicalEntry): number {
  // If and entry doesn't have a "start" they def don't have an "end", so we'll
  // return 0 so they won't get sorted.
  if (!(a.data.start && b.data.start))
    return 0;
  const [startA, startB, endA, endB] = [
    a.data.start.valueOf(),
    b.data.start.valueOf(),
    a.data.end?.valueOf() ?? PRESENT.valueOf(),
    b.data.end?.valueOf() ?? PRESENT.valueOf(),
  ];
  // JS considers 0 to be falsy
  return endA - endB || startA - startB;
}

export const cvEntries = await getCollection("cv")
  .then(entries => entries.filter(({ data }) => !data.draft));

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
