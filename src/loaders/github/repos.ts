import { inspect, styleText as style } from "node:util";
import { z } from "astro/zod";
import type { Loader } from "astro/loaders";
import type { paths } from "@octokit/openapi-types";

export type GitHubRepos = paths["/users/{username}/repos"]["get"]["responses"]["200"]["content"]["application/json"];

export interface GitHubReposLoaderConfig {
  sort?: "created" | "updated" | "pushed" | "full_name";
  direction?: "asc" | "desc";
  results?: number;
  /** How long to cache the responses. */
  maxAge?: number;
  user: string;
};

export function githubReposLoader({
  user,
  results = 30,
  maxAge = 3600,
  sort = "pushed",
  direction = "desc",
}: GitHubReposLoaderConfig): Loader {
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
      logger.info(`Fetching from GitHub`);
      const res = await fetchRepos(meta.get("etag"));

      if (res.status === 304)
        return logger.info("Using cached response");

      if (!res.ok || !res.body) {
        throw new Error(`Failed to load GitHub repos for user: ${user}`);
      }

      const etag = res.headers.get("Etag");
      const date = res.headers.get("Date");

      if (etag === null || date === null) {
        logger.error(inspect(res));
        throw new Error(`Missing headers in response`);
      } else {
        meta.set("etag", etag);
        meta.set("date", date);
      }

      const repos = await res.json() as GitHubRepos;

      for (const repo of repos) {
        logger.info(`Loading ${style("bold", repo.full_name)} repo info.`);
        store.set({ id: repo.full_name, data: repo });
      }
    },
  };
}
