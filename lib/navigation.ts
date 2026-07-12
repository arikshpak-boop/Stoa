/**
 * Resolves a reliable "back" destination from the current pathname by
 * walking up one path segment, rather than relying on browser history
 * (which breaks when a page was opened directly, via a new tab, or after
 * a redirect). This guarantees every page has a predictable, working way
 * back regardless of how the user arrived there.
 */
export function getBackHref(pathname: string): string {
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length <= 1) {
    return "/";
  }

  segments.pop();
  return `/${segments.join("/")}`;
}
