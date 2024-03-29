import type { APIRoute, GetStaticPaths, InferGetStaticParamsType } from "astro";
import sharp from "sharp";
import { Icon, IconWithBG, renderToSVG } from "./_Icon";

export const getStaticPaths = (() => {
  // Icons to generate at build time.
  const FILES = [
    "favicon.png",
    "favicon.svg",
    "apple-touch-icon.png",
  ] as const;
  // Creates files at `/icons/apple-touch-icon.png`, `/icons/favicon.svg`, etc.
  return FILES.map(file => ({ params: { file } }));
}) satisfies GetStaticPaths;

type Params = InferGetStaticParamsType<typeof getStaticPaths>;

export const GET: APIRoute<never, Params> = async ({ params }) => {
  const { file } = params;
  const headers = new Headers(
    { "Content-Type": file.endsWith("svg") ? "image/svg+xml" : "image/png" },
  );
  let body: BodyInit;

  const svg = await renderToSVG(Icon);
  const { encode } = new TextEncoder();

  switch (file) {
    case "favicon.svg":
      body = svg;
      break;

    case "favicon.png":
      body = await sharp(encode(svg))
        .png()
        .resize(48)
        .toBuffer();
      break;

    case "apple-touch-icon.png":
      body = await renderToSVG(IconWithBG)
        .then(str => sharp(encode(str))
          .png()
          .resize(180)
          .toBuffer(),
        );
      break;
  }

  return new Response(body, { headers });
};
