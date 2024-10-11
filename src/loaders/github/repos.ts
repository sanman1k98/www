/**
 * @file A content loader to get data about a user's repositories. Intended to be referenced by
 * entries in the "cv" collection.
 */
import type { Endpoints } from "@octokit/types";
import type { Loader } from "astro/loaders";
import { styles as c, format as fmt } from "@/utils/logging";
import { endpoint } from "@octokit/endpoint";
import { z } from "astro/zod";

const endpointPath = "GET /users/{username}/repos" satisfies keyof Endpoints;
type Endpoint = Endpoints[typeof endpointPath];
type QueryParams = Endpoint["parameters"];
type GitHubRepo = Endpoint["response"]["data"][number];

export interface GitHubReposLoaderOptions extends Omit<QueryParams, "page" | "per_page"> {
  /** Number of seconds to store response data. */
  maxAge?: number;
};

const DEFAULT_OPTS = {
  maxAge: 3600,
} satisfies Omit<GitHubReposLoaderOptions, "username">;

export function githubReposLoader(opts: GitHubReposLoaderOptions): Loader {
  const config = { ...DEFAULT_OPTS, ...opts };
  const { username, maxAge, ...query } = config;
  return {
    name: "github-repos-loader",
    schema: z.object({}).passthrough(),
    load: async ({ logger, meta, store, collection }) => {
      const done = (reason: string) =>
        logger.info(fmt(
          `Loaded %s entries into %s collection ${c.muted`(%s)`}`,
          c.B(store.keys().length),
          c.green(collection),
          reason,
        ));

      // In order to avoid making network requests and API rate-limiting, we assume the list of
      // GitHub repos for any given user does not change frequently and therefore entries within a
      // fresh store will almost always be up-to-date and accurate.
      // https://developer.mozilla.org/en-US/docs/Web/HTTP/Caching
      logger.info(`Loading public repositories for ${c.blue(username)}`);
      let fresh: boolean | undefined;

      // 1. Get age.
      if (meta.has("last-modified")) {
        // - Determine state.
        const lastModDate = new Date(meta.get("last-modified")!);
        const storeAgeMs = Date.now() - lastModDate.valueOf();
        fresh = storeAgeMs < maxAge * 1000;

        // - Log last update.
        const format: Intl.DateTimeFormatOptions = { dateStyle: "short", timeStyle: "medium" };
        const datestring = lastModDate.toLocaleString(undefined, format);
        logger.info(fmt(`Last updated: ${c.dim`%s`} ${c.muted`(%s)`}`, datestring, fresh ? "fresh" : "stale"));

        // - Check validity.
        if (fresh)
          // - Skip fetch and return early.
          return done("used cache");
      }

      // 2. Fetch.
      logger.info(`Fetching list of repositories for ${c.blue(username)}`);
      const now = Date();
      const { url, ...init } = endpoint(endpointPath, {
        headers: { "if-none-match": meta.get("etag") },
        username,
        ...query,
      });

      /**
       * Make a request to get a list of repositories for the `user`. If the response has not
       * changed, you will receive a 304 Not Modified response. Making a conditional request does
       * not count against your primary rate limit if 304 is returned.
       *
       * @see https://docs.github.com/en/rest/using-the-rest-api/best-practices-for-using-the-rest-api?apiVersion=2022-11-28#use-conditional-requests-if-appropriate
       * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Conditional_requests
       * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Caching#validation
       */
      const res = await fetch(url, init as FetchRequestInit);

      // 3. Handle errors.
      // TODO: Handle any fetch errors.

      // 4. Revalidate store.
      if (res.status === 304) {
        // - Update meta store with current date.
        meta.set("last-modified", now);
        // - Return early.
        return done("revalidated cache");
      }

      // 5. Update store.
      if (res.status === 200 && res.body && res.headers.has("etag")) {
        // - Empty the store.
        store.clear();
        // - Iterate through response data.
        for (const repo of await res.json() as GitHubRepo[]) {
          // - Parse data.
          // TODO: use the parseData() function from the LoaderContext.
          // - Set data using the repository's full name as id e.g., "sanman1k98/www".
          store.set({ id: repo.full_name, data: repo });
        }
        // - Update meta store with Etag value.
        meta.set("etag", res.headers.get("etag")!);
        // - Update meta store with current date.
        meta.set("last-modified", now);
        // - Return.
        return done("cached response");
      }

      // If we got here then we messed up something.
      logger.error("Did not load repositories!");
    },
  };
}
