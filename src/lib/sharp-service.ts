import type { FormatEnum, SharpOptions } from "sharp";
import { AstroError } from "astro/errors";
import type { ImageQualityPreset, LocalImageService, ImageTransform } from "astro";
import { baseService } from "astro/assets";

interface SharpImageServiceConfig {
  limitInputPixels?: SharpOptions["limitInputPixels"];
}

let sharp: typeof import("sharp");

const qualityTable: Record<ImageQualityPreset, number> = {
  low: 25,
  mid: 50,
  high: 80,
  max: 100,
};

async function loadSharp() {
  let sharpImport: typeof import("sharp");
  try {
    sharpImport = (await import("sharp")).default;
  } catch (e) {
    throw new AstroError("Missing Sharp");
  }
  return sharpImport;
}

const sharpService: LocalImageService<SharpImageServiceConfig> = {
  validateOptions: baseService.validateOptions,
  getURL: baseService.getURL,
  parseURL: baseService.parseURL,
  getHTMLAttributes: baseService.getHTMLAttributes,
  getSrcSet: baseService.getSrcSet,
  async transform(inputBuffer, transformOptions, config) {
    if (!sharp) sharp = await loadSharp();

    const transform: ImageTransform = transformOptions satisfies ImageTransform;

    if (transform.format === "svg") return { data: inputBuffer, format: "svg" };

    const result = sharp(inputBuffer, {
      failOnError: false,
      pages: -1,
      limitInputPixels: config.service.config.limitInputPixels,
    });

    // Always call to adjust for EXIF data orientation
    result.rotate();

    // Never resize using both width and height at the same time, prioritizing width
    if (transform.height && !transform.width) {
      result.resize({ height: Math.round(transform.height) });
    } else if (transform.width) {
      result.resize({ width: Math.round(transform.width) });
    }

    if (transform.format) {
      let quality: number | undefined;
      if (typeof transform.quality === "string"){
        if (transform.quality in qualityTable) quality = qualityTable[transform.quality];
        else quality = parseInt(transform.quality) || undefined;
      }

      result.toFormat(transform.format as keyof FormatEnum, { quality: quality });
    }

    const { data, info } = await result.toBuffer({ resolveWithObject: true });

    return {
      data: data,
      format: info.format
    };
  }
}

export default sharpService;
