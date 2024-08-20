/**
 * @file A content loader to get data about a user's repositories. Intended to be referenced by
 * entries in the "cv" collection.
 */
import { styleText as style } from "node:util";
import { z } from "astro/zod";
import type { Loader } from "astro/loaders";
import type { paths } from "@octokit/openapi-types";

export type GitHubRepo = paths["/users/{username}/repos"]["get"]["responses"]["200"]["content"]["application/json"][number];

export interface GitHubReposLoaderOptions {
  sort?: "created" | "updated" | "pushed" | "full_name";
  direction?: "asc" | "desc";
  results?: number;
  /** Number of seconds to store response data. */
  maxAge?: number;
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
    load: async ({ logger, meta, store }) => {
      const username = style(["bold", "blue"], user);
      const { length: numEntries } = store.keys();

      logger.info(`Loading public repositories for ${username}`);

      // In order to avoid making network requests and API rate-limiting, we assume the list of
      // GitHub repos for a given user does not change frequently and therefore data within the
      // store if determined to be "fresh" will almost always be up-to-date and accurate.
      if (meta.has("date")) {
        const lastDate = new Date(meta.get("date")!);
        const storeAgeMs = Date.now() - lastDate.valueOf();
        const fresh = storeAgeMs < maxAge * 1000;

        const format: Intl.DateTimeFormatOptions = { dateStyle: "short", timeStyle: "medium" };
        const formattedLastDate = style(
          fresh ? ["green"] : ["dim", "gray"],
          lastDate.toLocaleString(undefined, format),
        );
        logger.info(`Last requested: ${formattedLastDate}`);

        if (fresh)
          return logger.info(`Loaded ${numEntries} entries ${style(["dim", "gray"], "(skipping fetch)")}`);
      }

      logger.info(`Fetching list of repositories for ${username}`);
      const res = await fetchRepos(meta.get("etag"));
      const date = Date();

      if (res.status === 304) {
        meta.set("date", date);
        return logger.info(`${numEntries} entries are up-to-date with GitHub`);
      }

      if (res.status === 200 && res.body && res.headers.has("etag")) {
        store.clear();
        const repos = await res.json() as GitHubRepo[];

        // TODO: use the parseData() function from the LoaderContext.
        for (const repo of repos) {
          store.set({ id: repo.full_name, data: repo });
        }

        meta.set("etag", res.headers.get("etag")!);
        meta.set("date", date);

        return logger.info(`Loaded ${repos.length} entries`);
      }

      // If we got here then we messed up something.
      logger.error("Missing conditional logic for data fetching from GitHub!");
    },
  };
}
