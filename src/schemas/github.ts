import { type RefinementCtx, z } from "astro/zod";
import type { components } from "@octokit/openapi-types";
import { cache } from "@/utils/cache";

type OpenApiSchemas = components["schemas"];

type ResponseData<T = keyof OpenApiSchemas | null> = T extends keyof OpenApiSchemas
  ? OpenApiSchemas[T] & { __kind: T }
  : { url: string; __kind: null };

const API_BASE_URL = "https://api.github.com/";

const REQUEST_OPTS = {
  headers: {
    "Accept": "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  },
};

export const apiUrl = z.string().transform((arg, ctx) => {
  // The given `arg` can be a relative or absolute URL.
  const url = new URL(arg, API_BASE_URL);

  // If `arg` is an absolute URL `base` will be ignored, so we have to check
  // that the merged URL still points to an GitHub API endpoint.
  if (!url.toString().startsWith(API_BASE_URL)) {
    ctx.addIssue({
      code: "custom",
      message: `URL ${url.toString()} is not a GitHub REST API endpoint`,
      fatal: true,
    });
    return z.NEVER;
  }

  return url;
});

async function getDataFn(url: string | URL, ctx: RefinementCtx) {
  url = new URL(url);
  const req = new Request(url, REQUEST_OPTS);
  const cachedRes = await cache.match(req);

  let res: Response | undefined;

  if (cachedRes) {
    const dateHeader = cachedRes.headers.get("date");
    const date = !!dateHeader && new Date(dateHeader);

    const ONE_DAY = 24 * 60 * 60 * 1000; // milliseconds
    if (date && Date.now() - date.valueOf() < ONE_DAY)
      // Cached response is relatively "fresh", so we'll use it.
      res = cachedRes;
  }

  if (!res) {
    res = await fetch(req);

    if (!res.ok) {
      ctx.addIssue({
        code: "custom",
        message: `Bad response status: ${res.status}`,
        fatal: true,
      });
      throw new Error(
        "Unexpected status code when fetching data from GitHub",
        { cause: res },
      );
    }

    await cache.put(req, res.clone());
  }

  /** Describes the data in the response. */
  let kind: keyof OpenApiSchemas | null;

  // Determine the `kind` using the endpoint's path.
  const segments = url.pathname.slice(1).split("/");
  if (segments.length === 5 && segments[0] === "repos" && segments[3] === "pulls")
    // Example: "https://api.github.com/repos/withastro/astro/pulls/10235".
    kind = "pull-request";
  else if (segments.length === 3 && segments[0] === "repos")
    // Example: "https://api.github.com/repos/sanman1k98/www".
    kind = "full-repository";
  else
    kind = null;

  return {
    __kind: kind,
    ...await res.json(),
    // Use narrowed type of `kind` to cast return value.
  } as Promise<ResponseData<typeof kind>>;
}

export const getData = apiUrl.transform(getDataFn);

type ApiData = z.infer<typeof getData>;

type TransformedKind = Exclude<ApiData["__kind"], null>;

interface TransformedData<K extends TransformedKind = TransformedKind> {
  kind: K;
  title: string;
  description: string | null;
  /** A link to a GitHub webpage; an HTML URL. */
  link: string;
}

/**
 * Transforms data returned from GitHub API endpoints.
 *
 * Intended for use in the "cv" content collection.
 */
export const github = getData.transform((data: ApiData, ctx) => {
  let transformed;

  switch (data.__kind) {
    case "full-repository":
      transformed = {
        kind: data.__kind,
        title: data.name,
        description: data.description,
        link: data.html_url,
      };
      break;

    case "pull-request":
      transformed = {
        kind: data.__kind,
        // Formatted to look like an autolinked reference within GitHub.
        title: `${data.base.repo.full_name}#${data.number}`,
        description: data.title,
        link: data.html_url,
      };
      break;

    default: {
      ctx.addIssue({
        code: "custom",
        message: `Unable to transform data from endpoint ${data.url}; transformation logic not implemented.`,
        fatal: true,
      });
      return z.NEVER;
    }
  }

  return transformed satisfies TransformedData;
});
