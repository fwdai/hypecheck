-- Reports belong to exactly one canonical term; no normalized_key / string cache key.

TRUNCATE TABLE public.reports;

ALTER TABLE public.reports DROP CONSTRAINT IF EXISTS reports_normalized_key_unique;
ALTER TABLE public.reports DROP COLUMN IF EXISTS normalized_key;

ALTER TABLE public.reports ALTER COLUMN term_id SET NOT NULL;

DROP INDEX IF EXISTS public.reports_term_id_idx;

CREATE UNIQUE INDEX reports_term_id_key ON public.reports (term_id);

ALTER TABLE public.reports DROP CONSTRAINT IF EXISTS reports_term_id_fkey;

ALTER TABLE public.reports
  ADD CONSTRAINT reports_term_id_fkey
  FOREIGN KEY (term_id) REFERENCES public.terms (id) ON DELETE CASCADE;

COMMENT ON TABLE public.reports IS
  'LLM hype analysis; at most one row per term. Refresh payload when expires_at passes.';
COMMENT ON COLUMN public.reports.term_id IS 'Canonical term this analysis belongs to.';
