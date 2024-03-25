import type { Photo } from "@/content";

type Exif = Photo["exif"];

type FocalLengthPair = [
  FocalLength: number,
  FocalLengthin35mmFilm: number,
];

interface iPhoneFocalLengths {
  UltraWide: FocalLengthPair;
  Main: FocalLengthPair;
  Telephoto: FocalLengthPair;
}

const IPHONE_FOCAL_LENGTHS = {
  "iPhone 11 Pro": {
    UltraWide: [1.54, 13],
    Main: [4.25, 26],
    Telephoto: [6, 52],
  },
  "iPhone 15 Pro": {
    UltraWide: [2.22, 13],
    Main: [6.765, 24],
    Telephoto: [9, 77],
  },
} as const satisfies { [k: string]: iPhoneFocalLengths };

type iPhoneModel = keyof typeof IPHONE_FOCAL_LENGTHS;

/** If the exposure time is < 1, it will return a fraction. */
export function getShutterSpeed(exposureTime: number | undefined): string {
  if (!exposureTime)
    return "1/--";
  if (exposureTime >= 1)
    return exposureTime.toString();
  const reciprocal = 1 / exposureTime;
  return `1/${reciprocal}`;
}

export function getExposureComp(value: number | undefined): string {
  if (value === undefined)
    return "-.-";
  if (!Number.isInteger(value))
    return value.toFixed(1);
  return value.toString();
}

function formatiPhoneCamera(camera: string, focalLength: number, fNumber: number) {
  return `${camera} Camera - ${focalLength} mm f/${fNumber}`;
}

function getiPhoneCamera(model: iPhoneModel, tags: Exif["Photo"]): string | undefined {
  const focalLengthIn35mmFilm = tags.FocalLengthIn35mmFilm;
  const fNumber = tags.FNumber;

  if (!(focalLengthIn35mmFilm && fNumber))
    return undefined;

  if (tags.LensModel?.includes("front"))
    return formatiPhoneCamera("Front", focalLengthIn35mmFilm, fNumber);

  const focalLengths = IPHONE_FOCAL_LENGTHS[model];
  let camera: string;

  switch (tags.FocalLength) {
    case focalLengths.UltraWide[0]:
      camera = "Ultra Wide";
      break;
    case focalLengths.Main[0]:
      camera = "Main";
      break;
    case focalLengths.Telephoto[0]:
      camera = "Telephoto";
      break;
    default:
      return undefined;
  }

  return formatiPhoneCamera(camera, focalLengthIn35mmFilm, fNumber);
}

export function getLensInfo(exif: Exif): string | undefined {
  if (exif.Photo.LensMake !== "Apple")
    return exif.Photo.LensModel;

  const iphoneModel = exif.Image.Model as iPhoneModel;

  if (!(iphoneModel in IPHONE_FOCAL_LENGTHS))
    return undefined;
  else
    return getiPhoneCamera(iphoneModel, exif.Photo);
}

export function getCamera(exif: Exif): string | undefined {
  return exif.Image?.Model;
}

export function getReadableCaptureSettings(tags: Exif["Photo"]): string[] {
  const iso = tags.ISOSpeedRatings?.toString() ?? "---";
  const focallen = (tags.FocalLengthIn35mmFilm ?? tags.FocalLength)?.toString() ?? "--";
  const ev = getExposureComp(tags.ExposureBiasValue);
  const f = tags.FNumber?.toString() ?? "-.-";
  const shutter = getShutterSpeed(tags.ExposureTime);

  /** Inspired by the metadata viewer in the iOS Photos app. */
  return [
    `ISO ${iso}`,
    `${focallen} mm`,
    `${ev} ev`,
    `f/${f}`,
    `${shutter}s`,
  ];
}
