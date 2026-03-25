import { subDays } from "date-fns";

/** ISO 8601 UTC string for the instant `days` before `from` (default: now). For DB range filters. */
export function isoUtcDaysAgo(days: number, from: Date = new Date()): string {
  return subDays(from, days).toISOString();
}

/**
 * UTC calendar date `YYYY-MM-DD` for the instant `days` before `from` (e.g. GitHub
 * `created:>` search filters).
 */
export function utcCalendarDateDaysAgo(
  days: number,
  from: Date = new Date(),
): string {
  return subDays(from, days).toISOString().slice(0, 10);
}
