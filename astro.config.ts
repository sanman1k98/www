import sitemap from '@astrojs/sitemap';
import { type AstroUserConfig, defineConfig, envField, sharpImageService } from 'astro/config';
import icon from 'astro-icon';
import UnoCSS from 'unocss/astro';

const envSchema = {
	BUILD: envField.enum({
		values: ['resume'],
		context: 'server',
		access: 'public',
		optional: true,
	}),
	PERSONAL_EMAIL: envField.string({
		context: 'server',
		access: 'secret',
		default: 'placeholder@example.com',
	}),
	PERSONAL_PHONE: envField.string({
		context: 'server',
		access: 'secret',
		default: '+1-800-NOT-REAL',
	}),
};

function getResumeBuildOptions(): AstroUserConfig {
	if (process.env.BUILD === 'resume') {
		return {
			outDir: './dist-resume',
		};
	}
	return {
		// Use defaults
	};
}

export default defineConfig({
	...getResumeBuildOptions(),
	site: 'https://nicesandeep.com',
	prefetch: { prefetchAll: true },
	image: { service: sharpImageService() },
	integrations: [
		sitemap(),
		icon(),
		UnoCSS({
			// When passing true, "@unocss/reset/tailwind.css" will be used
			injectReset: true,
		}),
	],
	experimental: {
		// This will be the default in Astro 5.0
		directRenderScript: true,
		env: { schema: envSchema },
		contentIntellisense: true,
		contentLayer: true,
	},
	vite: {
		optimizeDeps: { exclude: ['@resvg/resvg-js'] },
	},
});
