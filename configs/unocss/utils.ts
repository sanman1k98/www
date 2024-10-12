import type { FontAxisCustomProp } from './types';

/** @param name - Name of the font axis. */
export function fontAxisToCustomProp<TName extends string>(name: TName): FontAxisCustomProp<TName> {
	return `--un-font-axis-${name.toLowerCase() as Lowercase<TName>}`;
}
