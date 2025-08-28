/** @jsxRuntime automatic */
/** @jsxImportSource #satori/jsx */
import type { SVGRenderOptions } from '@/lib/render';
import type { JSXStyleProperties } from '@/lib/satori';
import { BRAND_TEXT_GRADIENT, fonts } from './shared';

const SIZE = 512;

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
				backgroundImage: BRAND_TEXT_GRADIENT,
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
	fonts,
} satisfies SVGRenderOptions;

export default Favicon;
