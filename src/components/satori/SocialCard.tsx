/** @jsxRuntime automatic */
/** @jsxImportSource #satori/jsx */
import { unoTheme } from '@/lib/theme';
import {
	BRAND_TEXT_GRADIENT,
	fonts,
	type Props,
	type SVGRenderOptions,
} from './shared';

const width = 1920;
const height = width / 2;

const bgGradient = `radial-gradient(at top left, white 60%, ${unoTheme.colors.sky[100]} 90%)`;

function Title(props: Props) {
	return (
		<div
			style={{
				display: 'flex',
				fontSize: '20em',
				fontFamily: 'Quicksand',
				letterSpacing: '-0.08em',
				color: 'transparent',
				backgroundClip: 'text',
				backgroundImage: BRAND_TEXT_GRADIENT,
				paddingRight: '0.08em', // fixes text clipping
				paddingBottom: '0.1em',
			}}
		>
			{props.children}
		</div>
	);
}

function Background(props: Props) {
	return (
		<div
			style={{
				display: 'flex',
				width,
				height,
				alignItems: 'center',
				justifyContent: 'center',
				backgroundImage: bgGradient,
			}}
		>
			{props.children}
		</div>
	);
}

export function SocialCard() {
	return (
		<Background>
			<Title>
				nicesandeep
			</Title>
		</Background>
	);
}

SocialCard.svgRenderOptions = { height, width, fonts } satisfies SVGRenderOptions;

export default SocialCard;
