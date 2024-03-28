// Use pragma directives to enable JSX transpilation within this file.
/** @jsxRuntime automatic */
/** @jsxImportSource react */
import { readFile } from "node:fs/promises";
import satori from "satori";
import { unoTheme } from "@/utils";

// Height and width of SVG viewbox.
const SIZE = 512;
// Satori doesn't support WOFF2 at the moment.
const PATH_TO_FONT = "../../../node_modules/@fontsource/quicksand/files/quicksand-latin-700-normal.woff";
const PRIMARY_GRADIENT = `linear-gradient(to right, ${unoTheme.colors.sky[600]} 30%, ${unoTheme.colors.pink[500]} 70%)`;

interface Props {
  children?: React.ReactNode;
  style?: React.CSSProperties;
};

export const NS: React.FC<Props> = ({ style }) => (
  <div
    style={{
      height: "100%",
      width: "100%",
      fontFamily: "Quicksand",
      fontSize: SIZE,
      lineHeight: "75%",
      letterSpacing: "-0.08em",
      ...style,
    }}
  >
    ns
  </div>
);

export const NSGradient: React.FC<Props> = ({ style }) => (
  <NS
    style={{
      color: "transparent",
      backgroundClip: "text",
      backgroundImage: PRIMARY_GRADIENT,
      ...style,
    }}
  />
);

const fontBuffer = await readFile(new URL(PATH_TO_FONT, import.meta.url));

export async function renderToSVG(Component: React.FC<Props>) {
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

  return await satori(<Component />, opts);
}

// Used for debugging purposes.
export async function renderToHTML(Component: React.FC<Props>) {
  const html = {
    // Imported in `BaseLayout.astro`
    fontFamily: "Quicksand Variable",
    fontWeight: 700,
    height: SIZE,
    width: SIZE,
  };

  return await import("react-dom/server")
    .then(mod => mod.renderToStaticMarkup(
      <Component style={html} />,
    ));
}
