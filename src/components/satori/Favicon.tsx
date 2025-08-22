/** @jsxRuntime automatic */
/** @jsxImportSource #satori/jsx */
import type { SVGRenderOptions } from '@/lib/render';
import type { JSXStyleProperties } from '@/lib/satori';
import { unoTheme } from '@/lib/theme';
import quicksandFontUrl from '@fontsource/quicksand/files/quicksand-latin-700-normal.woff?url';

const SIZE = 512;
const PRIMARY_GRADIENT = `linear-gradient(to right, ${unoTheme.colors.sky[600]} 30%, ${unoTheme.colors.pink[500]} 70%)`;

const Initials = () => 'ns';

/** The initials "ns" with a color gradient across. */
export function Favicon(props: { style?: JSXStyleProperties }) {
	return (
		<div
			style={{
				height: SIZE,
				width: SIZE,
				fontSize: SIZE,
				fontFamily: 'Quicksand',
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
				...props.style,
			}}
		>
			<Initials />
		</div>
	);
};

Favicon.svgRenderOptions = {
	height: SIZE,
	width: SIZE,
	fonts: [{
		name: 'Quicksand',
		path: process.cwd() + quicksandFontUrl,
		style: 'normal',
	}],
} satisfies SVGRenderOptions;

export default Favicon;
