/** Single cache key for a user-entered term (trim, collapse spaces, lowercase). */
export function normalizeQuery(term: string): string {
  return term.trim().toLowerCase().replace(/\s+/g, " ");
}
