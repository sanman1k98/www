import { z } from "astro/zod";

const REQUEST_OPTS = {
  headers: {
    "Accept": "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  },
};

const apiUrl = z.string().transform((arg, ctx) => {
  const base = "https://api.github.com/";
  const url = new URL(arg, base);

  if (url.hostname === "github.com") {
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

export const getData = input.transform(async (input, ctx) => {
  const { url } = input;
  const res = await fetch(url, REQUEST_OPTS);

  if (!res.ok) {
    ctx.addIssue({
      code: "custom",
      message: `Request to ${url.toString()} is not OK: ${res.status} ${res.statusText}`,
      fatal: true,
    });
    return z.NEVER;
  }

  const data = await res.json();

  return {
    __date: res.headers.get("Date"),
    ...data,
  };
});
