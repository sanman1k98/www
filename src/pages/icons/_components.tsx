// Use pragma directives to enable JSX transpilation within this file.
/** @jsxRuntime automatic */
/** @jsxImportSource react */
import { join } from 'node:path';
import { unoTheme } from '@/utils';

export const SIZE = 512;
export const WEIGHT: 200 | 300 | 400 | 500 | 600 | 700 = 700;
export const FONT_PATH = join(process.cwd(), `/node_modules/@fontsource/quicksand/files/quicksand-latin-${WEIGHT}-normal.woff`);

const PRIMARY_GRADIENT = `linear-gradient(to right, ${unoTheme.colors.sky[600]} 30%, ${unoTheme.colors.pink[500]} 70%)`;

const BG_GRADIENT = `radial-gradient(at top left, white 60%, ${unoTheme.colors.sky[100]} 90%)`;

interface Props {
	children?: React.ReactNode;
	style?: React.CSSProperties;
};

export type IconComponent = React.FC<Props>;

export const Base: IconComponent = ({ style }) => (
	<div
		style={{
			height: SIZE,
			width: SIZE,
			fontSize: SIZE,
			lineHeight: 0.75,
			letterSpacing: '-0.08em',
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

export const Background: IconComponent = ({ children }) => (
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

export const Icon: IconComponent = ({ style }) => (
	<Base
		style={{
			color: 'transparent',
			backgroundClip: 'text',
			backgroundImage: PRIMARY_GRADIENT,
			...style,
		}}
	/>
);

export const TouchIcon: IconComponent = () => (
	<Background>
		<Icon
			style={{
				paddingLeft: SIZE * 0.1,
				fontSize: SIZE * 0.8,
				lineHeight: 1,
			}}
		/>
	</Background>
);

export default Icon;
