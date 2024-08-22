/**
 * @file A content loader to get data about a user's repositories. Intended to be referenced by
 * entries in the "cv" collection.
 */
import { z } from "astro/zod";
import type { Loader } from "astro/loaders";
import type { operations, paths } from "@octokit/openapi-types";
import { styles as c, format as fmt } from "@/utils/logging";

export type GitHubRepo = paths["/users/{username}/repos"]["get"]["responses"]["200"]["content"]["application/json"][number];

type QueryParams = NonNullable<operations["repos/list-for-org"]["parameters"]["query"]>;

export interface GitHubReposLoaderOptions extends Omit<QueryParams, "page" | "per_page"> {
  /** Number of seconds to store response data. */
  maxAge?: number;
  results?: number;
  user: string;
};

const DEFAULT_OPTS = {
  results: 30,
  maxAge: 3600,
  sort: "pushed",
  direction: "desc",
} satisfies Omit<GitHubReposLoaderOptions, "user">;

export function githubReposLoader(opts: GitHubReposLoaderOptions): Loader {
  const { user, results, maxAge, sort, direction } = { ...DEFAULT_OPTS, ...opts };

  /**
   * Make a request to get a list of repositories for the `user`. If the response has not changed,
   * you will receive a 304 Not Modified response. Making a conditional request does not count
   * against your primary rate limit if 304 is returned.
   * @param etag - An `Etag` header value from a previous response from this endpoint.
   *
   * @see https://docs.github.com/en/rest/repos/repos?apiVersion=2022-11-28#list-repositories-for-a-user
   * @see https://docs.github.com/en/rest/using-the-rest-api/best-practices-for-using-the-rest-api?apiVersion=2022-11-28#use-conditional-requests-if-appropriate
   * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Conditional_requests
   * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Caching#validation
   */
  const fetchRepos = async (etag?: string) => {
    const params = new URLSearchParams({
      per_page: results.toString(),
      direction,
      sort,
    });

    const headers: HeadersInit = [
      ["Accept", "application/vnd.github+json"],
      ["X-GitHub-Api-Version", "2022-11-28"],
    ];

    if (etag)
      headers.push(["If-None-Match", etag]);

    return fetch(
      `https://api.github.com/users/${user}/repos?${params}`,
      { headers },
    );
  };

  return {
    name: "github-repos-loader",
    schema: z.object({}).passthrough(),

    // In order to avoid making network requests and API rate-limiting, we assume the list of
    // GitHub repos for any given user does not change frequently and therefore entries within a
    // fresh store will almost always be up-to-date and accurate.
    // https://developer.mozilla.org/en-US/docs/Web/HTTP/Caching#fresh_and_stale_based_on_age
    load: async ({ logger, meta, store, collection }) => {
      const done = (reason: string) =>
        logger.info(fmt(
          `Loaded ${c.I`%d`} entries in ${c.green`%s`} ${c.muted`(%s)`}`,
          store.keys().length,
          collection,
          reason,
        ));

      logger.info(`Loading public repositories for ${c.blue(user)}`);
      let fresh: boolean | undefined;

      // 1. Validating.
      if (meta.has("last-modified")) {
        // 1a. Determine state.
        const lastModDate = new Date(meta.get("last-modified")!);
        const storeAgeMs = Date.now() - lastModDate.valueOf();
        fresh = storeAgeMs < maxAge * 1000;

        // 1b. Log last update.
        const format: Intl.DateTimeFormatOptions = { dateStyle: "short", timeStyle: "medium" };
        const datestring = lastModDate.toLocaleString(undefined, format);
        logger.info(fmt(`Last updated: ${c.U`%s`} ${c.muted`(%s)`}`, datestring, fresh ? "fresh" : "stale"));

        if (fresh)
          // 1c. Return early; skipping fetch.
          return done("used cache");
      }

      // 2. Fetching.
      logger.info(`Fetching list of repositories for ${c.blue(user)}`);
      const res = await fetchRepos(meta.get("etag"));
      const now = Date();

      // 3. Error handling.
      // TODO: Handle any fetch errors.

      // 4. Revalidating.
      if (fresh === false && res.status === 304) {
        // 4a. Update meta store with current date.
        meta.set("last-modified", now);
        // 4b. Return early.
        return done("revalidated cache");
      }

      // 5. Updating.
      if (res.status === 200 && res.body && res.headers.has("etag")) {
        // 5a. Empty the store.
        store.clear();
        // 5b. Iterate through response data.
        for (const repo of await res.json() as GitHubRepo[]) {
          // 5c. Parse data.
          // TODO: use the parseData() function from the LoaderContext.
          // 5c. Set data using the repository's full name as id e.g., "sanman1k98/www".
          store.set({ id: repo.full_name, data: repo });
        }
        // 5d. Update meta store with Etag value.
        meta.set("etag", res.headers.get("etag")!);
        // 5e. Update meta store with current date.
        meta.set("last-modified", now);
        // 5f. Return.
        return done("cached response");
      }

      // If we got here then we messed up something.
      logger.error("Did not load repositories!");
    },
  };
}
