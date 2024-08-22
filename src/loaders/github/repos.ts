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
   * Make a request to get a list of repositories for the {@link user}.
   * @param etag - An `Etag` header value from a previous response from this endpoint.
   * @see https://docs.github.com/en/rest/repos/repos?apiVersion=2022-11-28#list-repositories-for-a-user
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

      // Determine the state of the store and return early if it is fresh.
      if (meta.has("last-modified")) {
        const lastModDate = new Date(meta.get("last-modified")!);
        const storeAgeMs = Date.now() - lastModDate.valueOf();
        fresh = storeAgeMs < maxAge * 1000;

        const format: Intl.DateTimeFormatOptions = { dateStyle: "short", timeStyle: "medium" };
        const datestring = lastModDate.toLocaleString(undefined, format);
        logger.info(fmt(`Last updated: ${c.U`%s`} ${c.muted`(%s)`}`, datestring, fresh ? "fresh" : "stale"));

        if (fresh)
          return done("used cache");
      }

      logger.info(`Fetching list of repositories for ${c.blue(user)}`);
      const res = await fetchRepos(meta.get("etag"));
      const date = Date();

      // If the response has not changed, you will receive a 304 Not Modified response. Making a
      // conditional request does not count against your primary rate limit if 304 is returned.
      // https://docs.github.com/en/rest/using-the-rest-api/best-practices-for-using-the-rest-api?apiVersion=2022-11-28#use-conditional-requests-if-appropriate
      if (fresh === false && res.status === 304) {
        meta.set("last-modified", date);
        return done("revalidated cache");
      }

      if (res.status === 200 && res.body && res.headers.has("etag")) {
        store.clear();
        const repos = await res.json() as GitHubRepo[];

        // Use the repository's full name as keys e.g., "sanman1k98/www".
        for (const repo of repos) {
          // TODO: use the parseData() function from the LoaderContext.
          store.set({ id: repo.full_name, data: repo });
        }

        meta.set("etag", res.headers.get("etag")!);
        meta.set("last-modified", date);
        return done("cached response");
      }

      // If we got here then we messed up something.
      logger.error("Did not load repositories!");
    },
  };
}
