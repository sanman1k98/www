import type { Exif } from "exif-reader";

/** If the exposure time is < 1, it will return a fraction. */
export function getShutterSpeed(exposureTime: number | undefined): string {
  if (!exposureTime) return "1/--"
  if (exposureTime >= 1) return exposureTime.toString();
  const reciprocal = 1 / exposureTime;
  return `1/${reciprocal}`;
}

export function getExposureComp(value: number | undefined): string {
  if (value === undefined) return "-.-";
  if (!Number.isInteger(value)) return value.toFixed(1);
  return value.toString();
}

export function getLensInfo(exif: Exif): string | undefined {
  if (exif.Photo?.LensMake === "Apple") {
    return `${exif.Photo.FocalLengthIn35mmFilm} mm f/${exif.Photo.FNumber}`;
  }
  return exif.Photo?.LensModel;
}
