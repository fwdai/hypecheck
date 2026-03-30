-- One LLM report row per term per ISO week (UTC, Monday-based weeks). Historical rows kept for charts.

DROP INDEX IF EXISTS public.reports_term_id_key;

-- to_char() is STABLE (locale-dependent) and cannot be used in index expressions.
-- This matches IYYY-IW in UTC using ISO fields (same bucketing as app date-fns Monday weeks).
CREATE OR REPLACE FUNCTION public.reports_iso_week_bucket_utc(ts timestamptz)
RETURNS bigint
LANGUAGE plpgsql
IMMUTABLE
PARALLEL SAFE
STRICT
SET search_path TO public, pg_temp
AS $$
BEGIN
  RETURN (
    EXTRACT(isoyear FROM (ts AT TIME ZONE 'UTC'))::bigint * 100
    + EXTRACT(week FROM (ts AT TIME ZONE 'UTC'))::bigint
  );
END;
$$;

CREATE UNIQUE INDEX reports_term_id_iso_week_utc_key ON public.reports (
  term_id,
  (public.reports_iso_week_bucket_utc(created_at))
);

CREATE INDEX reports_term_id_created_at_idx ON public.reports (term_id, created_at DESC);

COMMENT ON TABLE public.reports IS
  'LLM hype analysis; at most one row per term per ISO week (UTC). Older rows are retained for history.';

COMMENT ON FUNCTION public.reports_iso_week_bucket_utc(timestamptz) IS
  'ISO year * 100 + ISO week number (UTC wall time), for unique (term_id, week) enforcement.';
