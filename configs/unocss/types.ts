import type { Theme } from 'unocss/preset-mini';

/** @template TName - Name of the font axis. */
export type FontAxisCustomProp<TName extends string> = `--un-font-axis-${Lowercase<TName>}`;

export interface FontAxes { [name: string]: number };

export interface CustomTheme extends Theme {
	fontAxes?: { [fontFamily: string]: FontAxes };
}
