-- One LLM report row per term per ISO week (UTC, Monday-based weeks). Historical rows kept for charts.

DROP INDEX IF EXISTS public.reports_term_id_key;

CREATE UNIQUE INDEX reports_term_id_iso_week_utc_key ON public.reports (
  term_id,
  (to_char(created_at AT TIME ZONE 'UTC', 'IYYY-IW'))
);

CREATE INDEX reports_term_id_created_at_idx ON public.reports (term_id, created_at DESC);

COMMENT ON TABLE public.reports IS
  'LLM hype analysis; at most one row per term per ISO week (UTC). Older rows are retained for history.';
