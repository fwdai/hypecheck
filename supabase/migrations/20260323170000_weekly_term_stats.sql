/*
  External API stats (Google Trends, GitHub, …) captured for a canonical term.
  One row per term; upsert when we fetch for a fresh LLM run. No model / no LLM payload here.
*/

CREATE TABLE public.weekly_term_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  term_id uuid NOT NULL,
  google_trends jsonb,
  github jsonb,
  fetched_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT weekly_term_stats_term_id_key UNIQUE (term_id),
  CONSTRAINT weekly_term_stats_term_id_fkey
    FOREIGN KEY (term_id) REFERENCES public.terms (id) ON DELETE CASCADE
);

COMMENT ON TABLE public.weekly_term_stats IS
  'Point-in-time external signals for a term (API-only). Refreshed when the app fetches stats for a new analysis; not LLM output.';

COMMENT ON COLUMN public.weekly_term_stats.google_trends IS
  'Google Trends slice (e.g. scores, delta, direction); shape matches app HypeStatsSnapshot.googleTrends.';
COMMENT ON COLUMN public.weekly_term_stats.github IS
  'GitHub search slice (e.g. repo counts); shape matches app HypeStatsSnapshot.github.';
COMMENT ON COLUMN public.weekly_term_stats.fetched_at IS
  'When these API values were retrieved.';

CREATE INDEX weekly_term_stats_fetched_at_idx ON public.weekly_term_stats (fetched_at DESC);

ALTER TABLE public.weekly_term_stats ENABLE ROW LEVEL SECURITY;
