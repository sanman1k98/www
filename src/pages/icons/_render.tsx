/** @jsxRuntime automatic */
/** @jsxImportSource react */
import { readFile } from "node:fs/promises";
import satori from "satori";
import { renderToStaticMarkup } from "react-dom/server";
import { unoTheme } from "@/utils";

const SIZE = 512;

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

async function getFontBuffer() {
  const relativePath = "../../../node_modules/@fontsource/quicksand/files/quicksand-latin-700-normal.woff";
  const url = new URL(relativePath, import.meta.url);
  return await readFile(url);
}

export async function renderToSVG(Component: React.FC<Props>) {
  const quicksand = {
    name: "Quicksand",
    style: "normal",
    data: await getFontBuffer(),
  } as const;

  const opts = {
    fonts: [quicksand],
    height: SIZE,
    width: SIZE,
    debug: false,
  };

  return await satori(<Component />, opts);
}

export function renderToHTML(Component: React.FC<Props>) {
  const htmlStyles = {
    fontFamily: "Quicksand Variable",
    fontWeight: 700,
    height: SIZE,
    width: SIZE,
  };
  return renderToStaticMarkup(<Component style={htmlStyles} />);
}
