import { styleText as style } from "node:util";
import type { Loader } from "astro/loaders";
import type { paths } from "@octokit/openapi-types";

export type GitHubRepos = paths["/users/{username}/repos"]["get"]["responses"]["200"]["content"]["application/json"];

export interface GitHubReposLoaderConfig {
  sort?: "created" | "updated" | "pushed" | "full_name";
  direction?: "asc" | "desc";
  results?: number;
  maxAge?: number;
  user: string;
};

export function githubReposLoader({
  user,
  results = 30,
  sort = "pushed",
  direction = "desc",
}: GitHubReposLoaderConfig): Loader {
  const headers = { "Accept": "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28" };
  const endpoint = `https://api.github.com/users/${user}/repos`;
  const params = new URLSearchParams({ sort, direction, per_page: results.toString() });
  const url = new URL(`${endpoint}?${params}`);
  const req = new Request(url, { headers });

  return {
    name: "github-repos-loader",
    load: async ({ logger, meta, store }) => {
      logger.info(`Loading GitHub repos for ${style("bold", user)}`);

      const _lastModified = meta.get("last-modified");
      const _etag = meta.get("etag");

      const res = await fetch(req);

      if (!res.ok || !res.body) {
        throw new Error(`Failed to load GitHub repos for user: ${user}`);
      }

      const repos = await res.json() as GitHubRepos;

      for (const { full_name, ...repo } of repos) {
        logger.info(`Loading ${style("bold", full_name)} repo info.`);
        store.set({ id: full_name, data: repo });
      }

      logger.info(`Finished loading repos for ${style("bold", user)}.`);
    },
  };
}
