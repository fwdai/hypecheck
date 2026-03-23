-- Fix mistaken FK: reports.term_id must reference terms, not reports.
ALTER TABLE public.reports DROP CONSTRAINT IF EXISTS reports_term_id_fkey;

ALTER TABLE public.reports
  ADD CONSTRAINT reports_term_id_fkey
  FOREIGN KEY (term_id) REFERENCES public.terms (id) ON DELETE SET NULL;

COMMENT ON COLUMN public.reports.term_id IS
  'Canonical term when this report was produced for a fuzzy-matched concept; NULL for ad-hoc/unmatched queries.';

CREATE INDEX IF NOT EXISTS reports_term_id_idx ON public.reports (term_id)
  WHERE term_id IS NOT NULL;

-- Fuzzy match user input to a canonical term (requires pg_trgm).
CREATE OR REPLACE FUNCTION public.match_term_by_similarity(p_query text)
RETURNS TABLE (
  id uuid,
  name text,
  slug text,
  score double precision
)
LANGUAGE sql
STABLE
AS $$
  SELECT t.id, t.name, t.slug,
         similarity(lower(btrim(t.name)), lower(btrim(p_query)))::double precision AS score
  FROM public.terms t
  WHERE similarity(lower(btrim(t.name)), lower(btrim(p_query))) > 0.3
  ORDER BY score DESC
  LIMIT 1;
$$;

COMMENT ON FUNCTION public.match_term_by_similarity(text) IS
  'Returns the best-matching canonical term when trigram similarity > 0.3; empty if none.';

GRANT EXECUTE ON FUNCTION public.match_term_by_similarity(text) TO service_role;
