/** @jsxRuntime automatic */
/** @jsxImportSource react */
import { readFile } from "node:fs/promises";
import satori from "satori";
import { unoTheme } from "@/utils";

const SIZE = 512;

const Background: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div
    style={{
      display: "flex",
      height: "100%",
      width: "100%",
      backgroundColor: "white",
    }}
  >
    {children}
  </div>
);

export const OnlyChars: React.FC<{ styles?: React.CSSProperties }> = ({ styles }) => (
  <div
    style={{
      textAlign: "center",
      fontFamily: "Quicksand",
      fontSize: SIZE,
      lineHeight: 0.7,
      letterSpacing: -25,
      marginLeft: -12,
      ...styles,
    }}
  >
    ns
  </div>
);

const Chars: React.FC = () => (
  <div
    style={{
      display: "flex",
      height: "100%",
      width: "100%",
      marginLeft: "-9",
      textAlign: "center",
      justifyContent: "center",
      alignItems: "baseline",
      fontFamily: "Quicksand",
      fontSize: 496,
      lineHeight: 0.7,
      letterSpacing: "-16",
      color: "transparent",
      backgroundClip: "text",
      backgroundImage: `linear-gradient(to right, ${unoTheme.colors.sky[600]} 30%, ${unoTheme.colors.pink[500]} 70%)`,
    }}
  >
    ns
  </div>
);

const Favicon: React.FC = () => (
  <Background>
    <Chars />
  </Background>
);

export default Favicon;

async function getFontBuffer() {
  const relativePath = "../../../node_modules/@fontsource/quicksand/files/quicksand-latin-600-normal.woff";
  const url = new URL(relativePath, import.meta.url);
  return await readFile(url);
}

export async function renderToSVG() {
  return await satori(
    (
      <Favicon />
    ),
    {
      fonts: [
        {
          name: "Quicksand",
          style: "normal",
          data: await getFontBuffer(),
        },
      ],
      height: SIZE,
      width: SIZE,
      // debug: true,
    },
  );
}
