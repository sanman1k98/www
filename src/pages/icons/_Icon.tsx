// Use pragma directives to enable JSX transpilation within this file.
/** @jsxRuntime automatic */
/** @jsxImportSource react */
import { readFile } from "node:fs/promises";
import satori from "satori";
import { unoTheme } from "@/utils";

const SIZE = 512;
const WEIGHT: 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 = 700;
const FONT_PATH = `../../../node_modules/@fontsource/quicksand/files/quicksand-latin-${WEIGHT}-normal.woff`;

const PRIMARY_GRADIENT = `
  linear-gradient(
    to right,
    ${unoTheme.colors.sky[600]} 30%,
    ${unoTheme.colors.pink[500]} 70%
  )
`;

const BG_GRADIENT = `
  radial-gradient(
    at top left,
    white 60%,
    ${unoTheme.colors.sky[100]} 90%
  )
`;

interface Props {
  children?: React.ReactNode;
  style?: React.CSSProperties;
};

export const Chars: React.FC<Props> = ({ style }) => (
  <div
    style={{
      height: SIZE,
      width: SIZE,
      fontSize: SIZE,
      lineHeight: 0.75,
      letterSpacing: "-0.08em",
      // Satori defaults
      display: "flex",
      position: "relative",
      textOverflow: "clip",
      // Overrides
      ...style,
    }}
  >
    ns
  </div>
);

export const BgGradient: React.FC<Props> = ({ children }) => (
  <div
    style={{
      backgroundImage: BG_GRADIENT,
      // Satori defaults
      display: "flex",
    }}
  >
    {children}
  </div>
);

export const Icon: React.FC<Props> = ({ style }) => (
  <Chars
    style={{
      color: "transparent",
      backgroundClip: "text",
      backgroundImage: PRIMARY_GRADIENT,
      ...style,
    }}
  />
);

export default Icon;

export const IconWithBG: React.FC<Props> = () => (
  <BgGradient>
    <Icon />
  </BgGradient>
);

const fontBuffer = await readFile(new URL(FONT_PATH, import.meta.url));

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
    // Satori SVG output styles
    height: SIZE,
    width: SIZE,
    overflow: "clip",
    // Font imported in `BaseLayout.astro`
    fontFamily: "Quicksand Variable",
    fontWeight: WEIGHT,
  };

  return await import("react-dom/server")
    .then(mod => mod.renderToStaticMarkup(
      <div style={html}>
        <Component />
      </div>,
    ));
}
