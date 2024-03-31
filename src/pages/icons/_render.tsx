/** @jsxRuntime automatic */
/** @jsxImportSource react */
import { readFile } from "node:fs/promises";
import satori from "satori";
import { Resvg, type ResvgRenderOptions } from "@resvg/resvg-js";
import { FONT_PATH, type IconComponent, SIZE, WEIGHT } from "./_components";

const cache = new WeakMap<IconComponent, string>();

const fontBuffer = await readFile(new URL(FONT_PATH, import.meta.url));

export async function toSVG(Component: IconComponent): Promise<string> {
  if (cache.has(Component))
    return cache.get(Component)!;

  const quicksand = {
    name: "Quicksand",
    style: "normal",
    data: fontBuffer,
  } as const;

  const opts = {
    fonts: [quicksand],
    height: SIZE,
    width: SIZE,
    debug: false,
  };

  const str = await satori(<Component />, opts);
  cache.set(Component, str);
  return str;
}

export async function toPNG(Component: IconComponent, opts: ResvgRenderOptions) {
  let svg: string;
  if (cache.has(Component))
    svg = cache.get(Component)!;
  else
    svg = await toSVG(Component);

  const resvg = new Resvg(svg, {
    font: { loadSystemFonts: false },
    fitTo: { mode: "original" },
    ...opts,
  });

  return resvg.render().asPng();
}

// Used for debugging purposes.
export async function toHTML(Component: IconComponent) {
  const html = {
    // Satori SVG output styles
    height: SIZE,
    width: SIZE,
    overflow: "clip",
    // Font imported in `BaseLayout.astro`
    fontFamily: "Quicksand Variable",
    fontWeight: WEIGHT,
  };

  return await import("react-dom/server")
    .then(r => r.renderToStaticMarkup(
      <div style={html}>
        <Component />
      </div>,
    ));
}
