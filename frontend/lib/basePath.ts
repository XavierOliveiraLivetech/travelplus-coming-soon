const rawBasePath = (process.env.NEXT_PUBLIC_BASE_PATH ?? "").trim();

/** Repo base path for GitHub Pages project sites (e.g. "/TravelPlus"). Empty on root sites. */
export const basePath = rawBasePath.replace(/\/$/, "");

/** Prefix a root-absolute public asset path with the configured basePath. */
export function withBasePath(path: string): string {
  if (!path.startsWith("/")) {
    return path;
  }

  return `${basePath}${path}`;
}
