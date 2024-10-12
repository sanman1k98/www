import type { MiddlewareHandler } from 'astro';
import { BUILD } from 'astro:env/server';

/**
 * Render resume page at "/" and don't generate any other routes.
 *
 * @see https://astro.build/blog/astro-480/#experimental-request-rewriting
 * @see https://docs.astro.build/en/reference/configuration-reference/#experimentalrewriting
 */
const resume: MiddlewareHandler = ({ url }, next) => {
	if (url.pathname === '/')
	// Reroute to resume page.
		return next('/resume');

	// NOTE: Astro doesn't create files for null responses when building static routes.
	return new Response(null, { status: 404 });
};

const passthrough: MiddlewareHandler = (_, next) => next();

export const onRequest = BUILD === 'resume' ? resume : passthrough;
