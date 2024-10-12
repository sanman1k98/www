import type { Endpoints } from '@octokit/types';
import type { Loader } from 'astro/loaders';
import { styles as c, format as fmt } from '@/utils/logging';
import { endpoint } from '@octokit/endpoint';
import { z } from 'astro/zod';

const endpointPath = 'GET /search/issues' satisfies keyof Endpoints;
type Endpoint = Endpoints[typeof endpointPath];
type QueryParams = Endpoint['parameters'];
type ResponseData = Endpoint['response']['data'];

export interface GitHubPullsLoaderOptions extends Omit<QueryParams, 'q' | 'page' | 'per_page'> {
	/** Number of seconds to store response data. */
	maxAge?: number;
	username: string;
};

const DEFAULT_OPTS = {
	maxAge: 3600,
} satisfies Omit<GitHubPullsLoaderOptions, 'username' | 'q'>;

export function githubPullsLoader(opts: GitHubPullsLoaderOptions): Loader {
	const config = { ...DEFAULT_OPTS, ...opts };
	const { username, maxAge, ...query } = config;
	return {
		name: 'github-pulls-loader',
		schema: z.object({}).passthrough(),
		load: async ({ logger, meta, store, collection }) => {
			const done = (reason: string) =>
				logger.info(fmt(
					`Loaded %s entries into %s collection ${c.muted`(%s)`}`,
					c.B(store.keys().length),
					c.green(collection),
					reason,
				));

			logger.info(`Loading pull requests for ${c.blue(username)}`);
			let fresh: boolean | undefined;

			// 1. Get age.
			if (meta.has('last-modified')) {
				// - Determine state.
				const lastModDate = new Date(meta.get('last-modified')!);
				const storeAgeMs = Date.now() - lastModDate.valueOf();
				fresh = storeAgeMs < maxAge * 1000;

				// - Log last update.
				const format: Intl.DateTimeFormatOptions = { dateStyle: 'short', timeStyle: 'medium' };
				const datestring = lastModDate.toLocaleString(undefined, format);
				logger.info(fmt(`Last updated: ${c.dim`%s`} ${c.muted`(%s)`}`, datestring, fresh ? 'fresh' : 'stale'));

				// - Check validity.
				if (fresh)
				// - Skip fetch and return early.
					return done('used cache');
			}

			// 2. Fetch.
			logger.info(`Fetching pull requests for ${c.blue(username)}`);
			// eslint-disable-next-line unicorn/new-for-builtins
			const now = Date();
			const { url, ...init } = endpoint(endpointPath, {
				q: `is:pull-request+author:${username}`,
				...query,
			});

			const res = await fetch(url, init as FetchRequestInit);

			// 3. Handle errors.
			// TODO: Handle any fetch errors.

			// 4. Update store.
			if (res.status === 200 && res.body) {
				// - Empty the store.
				store.clear();
				const { items } = await res.json() as ResponseData;

				// - Iterate through response data.
				for (const pr of items) {
					// - Parse data.
					// TODO: use the parseData() function from the LoaderContext.
					const repo = pr.repository_url.slice(29);
					const id = `${repo}#${pr.number}`;
					// - Set data.
					store.set({ id, data: pr });
				}
				// - Update meta store with current date.
				meta.set('last-modified', now);
				return done('cached response');
			}

			// If we got here then we messed up something.
			logger.error('Did not load pull requests!');
		},
	};
}
