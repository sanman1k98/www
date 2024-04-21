import { z } from "astro/zod";
import type { components } from "@octokit/openapi-types";
import { cache } from "@/utils/cache";

const apiUrl = z.string().transform((arg, ctx) => {
  const base = "https://api.github.com/";
  const url = new URL(arg, base);

  if (url.hostname !== "api.github.com") {
    ctx.addIssue({
      code: "custom",
      message: `URL ${url.toString()} is not a GitHub REST API endpoint`,
      fatal: true,
    });
    return z.NEVER;
  }

  return url;
});

const input = z.strictObject({
  url: apiUrl,
});

type OpenApiSchemas = components["schemas"];

type ResponseData<T = keyof OpenApiSchemas | null> = T extends keyof OpenApiSchemas
  ? OpenApiSchemas[T] & { __kind: T }
  : { url: string; __kind: null };

const REQUEST_OPTS = {
  headers: {
    "Accept": "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  },
};

const ONE_DAY = 24 * 60 * 60 * 1000; // milliseconds

export const getData = input.transform(async (input, ctx) => {
  const req = new Request(input.url, REQUEST_OPTS);
  const cachedRes = await cache.match(req);

  let res: Response | undefined;

  if (cachedRes) {
    const dateHeader = cachedRes.headers.get("date");
    const date = !!dateHeader && new Date(dateHeader);

    // Use cached response if it less than a day old
    if (date && Date.now() - date.valueOf() < ONE_DAY)
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
        "Unexpected error when getting data from GitHub",
        { cause: res },
      );
    }

    await cache.put(req, res.clone());
  }

  /** Describes the data in the response. */
  let kind: keyof OpenApiSchemas | null;

  // Determine the `kind` using the endpoint's path.
  const segments = input.url.pathname.slice(1).split("/");
  if (segments.length === 5 && segments[0] === "repos" && segments[3] === "pulls")
    // Example: "https://api.github.com/repos/withastro/astro/pulls/10235".
    kind = "pull-request";
  else if (segments.length === 3 && segments[0] === "repos")
    // Example: "https://api.github.com/repos/sanman1k98/www".
    kind = "full-repository";
  else // Unsupported or unimplemented endpoints.
    kind = null;

  return {
    __kind: kind,
    ...await res.json(),
    // Type of `kind` is significantly narrowed at this point.
  } as Promise<ResponseData<typeof kind>>;
});

type InferredData = z.infer<typeof getData>;

interface TransformedData {
  kind: Exclude<InferredData["__kind"], null>;
  title: string;
  description: string | null;
  /** A link to a GitHub webpage. */
  link: string;
}

/**
 * Transforms data returned from GitHub API endpoints.
 *
 * Intended for use in the "cv" content collection.
 */
export const github = getData.transform((data: InferredData, ctx) => {
  switch (data.__kind) {
    case "full-repository": return {
      kind: data.__kind,
      title: data.name,
      description: data.description,
      link: data.html_url,
    } satisfies TransformedData;

    case "pull-request": return {
      kind: data.__kind,
      // Formatted to look like an autolinked reference within GitHub.
      title: `${data.base.repo.full_name}#${data.number}`,
      description: data.title,
      link: data.html_url,
    } satisfies TransformedData;

    default: {
      ctx.addIssue({
        code: "custom",
        message: `Unable to transform data from endpoint ${data.url}`,
        fatal: true,
      });
      return z.NEVER;
    }
  }
});
