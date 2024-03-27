import type { APIRoute, GetStaticPaths, InferGetStaticParamsType } from "astro";
import * as Icon from "./_Icon";

export const getStaticPaths = (() => {
  const FILES = [
    "favicon.svg",
  ] as const;

  return FILES.map(file => ({ params: { file } }));
}) satisfies GetStaticPaths;

type Params = InferGetStaticParamsType<typeof getStaticPaths>;

export const GET: APIRoute<any, Params> = async ({ params }) => {
  const { file } = params;

  let body: BodyInit;
  let contentType: string;

  switch (file) {
    case "favicon.svg":
      body = await Icon.renderToSVG(Icon.NSGradient);
      contentType = "image/svg+xml";
      break;
  }

  return new Response(body, {
    headers: [
      ["Content-Type", contentType],
    ],
  });
};
