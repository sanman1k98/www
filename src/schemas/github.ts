import { z } from "astro/zod";
import { cache } from "@/utils/cache";

const REQUEST_OPTS = {
  headers: {
    "Accept": "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  },
};

// In milliseconds
const ONE_DAY = 24 * 60 * 60 * 1000;

const apiUrl = z.string().transform((arg, ctx) => {
  const base = "https://api.github.com/";
  const url = new URL(arg, base);

  if (url.hostname !== "api.github.com") {
    ctx.addIssue({
      code: "custom",
      message: "URL must be a GitHub REST API endpoint",
      fatal: true,
    });

    return z.NEVER;
  }

  return url;
});

const input = z.strictObject({
  url: apiUrl,
});

interface CommonData {
  url: string;
  html_url: string;
  created_at: string;
};

interface RepositoryData extends CommonData {
  __kind: "repo";
  name: string;
  full_name: string;
  description: string;
  created_at: string;
  pushed_at: string;
};

interface PullRequestData extends CommonData {
  __kind: "pull";
  number: number;
  title: string;
  body: string;
  base: {
    repo: RepositoryData;
  };
};

type GitHubData = RepositoryData | PullRequestData | {
  __kind: "unknown";
  url: string;
};

export const getData = input.transform(async (input, ctx) => {
  const req = new Request(input.url, REQUEST_OPTS);
  const matched = await cache.match(req);

  let res: Response | undefined;

  if (matched) {
    const dateHeader = matched.headers.get("date");
    const date = !!dateHeader && new Date(dateHeader);

    if (date && Date.now() - date.valueOf() < ONE_DAY)
      res = matched;
  }

  if (!res) {
    res = await fetch(req);

    if (!res.ok) {
      ctx.addIssue({
        code: "custom",
        message: `Bad response status: ${res.status}`,
        fatal: true,
      });
      return z.NEVER;
    }

    await cache.put(req, res.clone());
  }

  let kind: GitHubData["__kind"];

  const segments = input.url.pathname.slice(1).split("/");

  if (segments.length === 5 && segments[0] === "repos" && segments[3] === "pulls")
    kind = "pull";
  else if (segments.length === 3 && segments[0] === "repos")
    kind = "repo";
  else
    kind = "unknown";

  return {
    __kind: kind,
    ...await res.json(),
  } as Promise<GitHubData>;
});

interface ParsedGitHubData {
  kind: "repo" | "pull";
  link: string;
  title: string;
  description: string;
}

/** Parses data returned from GitHub API endpoints. */
export const github = getData.transform((data, ctx) => {
  switch (data.__kind) {
    case "repo": return {
      kind: "repo",
      title: data.name,
      description: data.description,
      link: data.html_url,
    } satisfies ParsedGitHubData;

    case "pull": return {
      kind: "pull",
      title: `${data.base.repo.full_name}#${data.number}`,
      description: data.title,
      link: data.html_url,
    } satisfies ParsedGitHubData;

    default: {
      ctx.addIssue({
        code: "custom",
        message: `${data.__kind} data from endpoint ${data.url}`,
        fatal: true,
      });
      return z.NEVER;
    }
  }
});
