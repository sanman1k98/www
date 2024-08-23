import type { operations, paths } from "@octokit/openapi-types";

export type IncludeStringValues<T extends Record<string, any>> = {
  [k in keyof T]: T[k] | string;
};

export const GITHUB_BASE_URL = "https://api.github.com";
