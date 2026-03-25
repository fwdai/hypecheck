import { startOfWeek, subDays } from "date-fns";
import { UTCDate } from "@date-fns/utc";

/** ISO 8601 UTC string for the instant `days` before `from` (default: now). For DB range filters. */
export function isoUtcDaysAgo(days: number, from: Date = new Date()): string {
  return subDays(from, days).toISOString();
}

/**
 * ISO 8601 UTC string for the start of the current calendar week (Monday 00:00 UTC).
 * Use this as the global freshness boundary: any report with `refreshed_at` before
 * this instant is considered stale and must be regenerated.
 */
export function currentWeekStartISO(from: Date = new Date()): string {
  return startOfWeek(new UTCDate(from.getTime()), {
    weekStartsOn: 1,
  }).toISOString();
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
