import type { Loader } from "astro/loaders";
import type { paths } from "@octokit/openapi-types";
import type { IncludeStringValues } from "./shared";
import { styles as c, format as fmt } from "@/utils/logging";

const API_PATH = "/search/issues";
type Endpoint = paths[typeof API_PATH]["get"];
type QueryParams = NonNullable<Endpoint["parameters"]["query"]>;
type GitHubPullRequests = Endpoint["responses"]["200"]["content"]["application/json"];

export interface GitHubPullsLoaderOptions extends Omit<QueryParams, "page" | "per_page"> {
  results?: number;
  /** How long to cache the responses. */
  maxAge?: number;
  user: string;
};

const DEFAULT_OPTS = {
  results: 30,
  maxAge: 3600,
  order: "desc",
  sort: "updated",
} satisfies Omit<GitHubPullsLoaderOptions, "user" | "q">;

export function githubPullsLoader(opts: GitHubPullsLoaderOptions): Loader {
  const { user, results, maxAge, sort, order } = { ...DEFAULT_OPTS, ...opts };

  const fetchPullRequests = async (etag?: string) => {
    const query = [
      "is:pull-request",
      `user:${user}`,
    ].join("+");

    const params = new URLSearchParams({
      per_page: results.toString(),
      q: query,
      sort,
    } satisfies IncludeStringValues<QueryParams>);

    const headers: HeadersInit = [
      ["Accept", "application/vnd.github+json"],
      ["X-GitHub-Api-Version", "2022-11-28"],
    ];

    if (etag)
      headers.push(["If-None-Match", etag]);

    return fetch(
      `https://api.github.com${API_PATH}?${params}`,
      { headers },
    );
  };

  return {
    name: "github-pulls-loader",
    load: async ({ logger, meta, store, collection }) => {
      const done = (reason: string) =>
        logger.info(fmt(
          `Loaded ${c.I`%d`} entries in ${c.green`%s`} ${c.muted`(%s)`}`,
          store.keys().length,
          collection,
          reason,
        ));

      logger.info(`Loading pull requests for ${c.blue(user)}`);
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
        logger.info(fmt(`Last updated: ${c.U`%s`} ${c.muted`(%s)`}`, datestring, fresh ? "fresh" : "stale"));

        // - Check validity.
        if (fresh)
          // - Skip fetch and return early.
          return done("used cache");
      }

      // 2. Fetch.
      logger.info(`Fetching pull requests for ${c.blue(user)}`);
      const res = await fetchPullRequests(meta.get("etag"));
      const now = Date();

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
      if (res.status === 200 && res.body) {
        // - Empty the store.
        store.clear();

        const { items, total_count } = await res.json() as GitHubPullRequests;
        logger.info(`${total_count} pull requests`);
        //
        // - Iterate through response data.
        for (const pr of items) {
          // - Parse data.
          // TODO: use the parseData() function from the LoaderContext.
          const repo = pr.repository_url.slice(29);
          const id = `${repo}#${pr.number}`;
          // - Set data.
          store.set({ id, data: pr });
        }
        // - Update meta store with Etag value.
        meta.set("etag", res.headers.get("etag")!);
        // - Update meta store with current date.
        meta.set("last-modified", now);
        // - Return.
        return done("cached response");
      }

      // If we got here then we messed up something.
      logger.error("Did not load pull requests!");
    },
  };
}
