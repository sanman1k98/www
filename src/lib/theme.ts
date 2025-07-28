import type { theme as miniTheme } from '@unocss/preset-mini';
import unoConfig from 'uno.config';
import { resolveConfig } from 'unocss';

export const { theme: unoTheme } = resolveConfig<typeof miniTheme>(unoConfig);
