/** @jsxRuntime automatic */
/** @jsxImportSource #satori/jsx */
import type { JSXNode } from '@/lib/satori';
import { unoTheme } from '@/lib/theme';
import Favicon from './Favicon';

const BG_GRADIENT = `radial-gradient(at top left, white 60%, ${unoTheme.colors.sky[100]} 90%)`;

function Background(props: { children: JSXNode }) {
	return (
		<div
			style={{
				backgroundImage: BG_GRADIENT,
				// Satori defaults
				display: 'flex',
			}}
		>
			{props.children}
		</div>
	);
};

/** `Favicon` with a subtle background gradient. */
export function AppleTouchIcon() {
	return (
		<Background>
			<Favicon
				style={{
					paddingLeft: 512 * 0.1,
					fontSize: 512 * 0.8,
					lineHeight: 1,
				}}
			/>
		</Background>
	);
};

AppleTouchIcon.svgRenderOptions = Favicon.svgRenderOptions;

export default AppleTouchIcon;
