/** @jsxRuntime automatic */
/** @jsxImportSource #satori/jsx */
import type { SatoriRenderOptions } from '@/lib/render';
import type { FC, JSXNode, JSXStyleProperties } from '@/lib/satori-jsx';
import { join } from 'node:path';
import { unoTheme } from '@/lib/theme';

const SIZE = 512;
const FONT_FAMILY = 'Quicksand';
const FONT_WEIGHT: 200 | 300 | 400 | 500 | 600 | 700 = 700;
const FONT_PATH = join(process.cwd(), `/node_modules/@fontsource/quicksand/files/quicksand-latin-${FONT_WEIGHT}-normal.woff`);

const PRIMARY_GRADIENT = `linear-gradient(to right, ${unoTheme.colors.sky[600]} 30%, ${unoTheme.colors.pink[500]} 70%)`;

const BG_GRADIENT = `radial-gradient(at top left, white 60%, ${unoTheme.colors.sky[100]} 90%)`;

export const renderOpts = {
	debug: false,
	height: SIZE,
	width: SIZE,
	fonts: [{
		name: FONT_FAMILY,
		path: FONT_PATH,
		style: 'normal',
	}],
} satisfies SatoriRenderOptions;

interface Props {
	children?: JSXNode;
	style?: JSXStyleProperties;
};

/** The text "ns" with a color gradient across. */
export const Favicon: FC<Props> = ({ style }) => (
	<div
		style={{
			height: SIZE,
			width: SIZE,
			fontSize: SIZE,
			fontFamily: FONT_FAMILY,
			fontWeight: FONT_WEIGHT,
			lineHeight: 0.75,
			letterSpacing: '-0.08em',
			color: 'transparent',
			backgroundClip: 'text',
			backgroundImage: PRIMARY_GRADIENT,
			// Satori defaults
			display: 'flex',
			position: 'relative',
			textOverflow: 'clip',
			// Overrides
			...style,
		}}
	>
		ns
	</div>
);

const Background: FC<Props> = ({ children }) => (
	<div
		style={{
			backgroundImage: BG_GRADIENT,
			// Satori defaults
			display: 'flex',
		}}
	>
		{children}
	</div>
);

/** `Favicon` with a subtle background gradient. */
export const TouchIcon: FC<Props> = () => (
	<Background>
		<Favicon
			style={{
				paddingLeft: SIZE * 0.1,
				fontSize: SIZE * 0.8,
				lineHeight: 1,
			}}
		/>
	</Background>
);
