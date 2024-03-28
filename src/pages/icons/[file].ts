import { Buffer } from "node:buffer";
import sharp from "sharp";
import type { APIRoute, GetStaticPaths, InferGetStaticParamsType } from "astro";
import * as Icon from "./_Icon";

export const getStaticPaths = (() => {
  const FILES = [
    "favicon.svg",
    "favicon.png",
  ] as const;

  return FILES.map(file => ({ params: { file } }));
}) satisfies GetStaticPaths;

type Params = InferGetStaticParamsType<typeof getStaticPaths>;

export const GET: APIRoute<any, Params> = async ({ params }) => {
  const { file } = params;

  const promise = Icon.renderToSVG(Icon.NSGradient);
  let body: BodyInit;
  let contentType: string;

  switch (file) {
    case "favicon.svg":
      body = await promise.then(str => str);
      contentType = "image/svg+xml";
      break;
    case "favicon.png":
      body = await promise.then((str) => {
        const buf = Buffer.from(str);
        return sharp(buf).toBuffer();
      });
      contentType = "image/png";
      break;
  }

  return new Response(body, {
    headers: [
      ["Content-Type", contentType],
    ],
  });
};
