-- Tighten fuzzy term matching: trigram similarity alone over-matches short strings
-- that share a prefix (e.g. "OpenAI" vs "OpenClaw"). Require normalized Levenshtein
-- distance as a second gate (fuzzystrmatch).

CREATE EXTENSION IF NOT EXISTS fuzzystrmatch;

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
  WITH q AS (
    SELECT
      lower(btrim(p_query)) AS qtext,
      GREATEST(char_length(lower(btrim(p_query))), 1) AS qlen
  )
  SELECT
    t.id,
    t.name,
    t.slug,
    similarity(lower(btrim(t.name)), (SELECT qtext FROM q))::double precision AS score
  FROM public.terms t, q
  WHERE similarity(lower(btrim(t.name)), q.qtext) > 0.3
    AND (
      levenshtein(lower(btrim(t.name)), q.qtext)::double precision
      / GREATEST(
          char_length(lower(btrim(t.name)))::double precision,
          q.qlen::double precision
        )
    ) <= 0.36
  ORDER BY score DESC
  LIMIT 1;
$$;

COMMENT ON FUNCTION public.match_term_by_similarity(text) IS
  'Best-matching canonical term: trigram similarity > 0.3 and normalized Levenshtein <= 0.36; empty if none.';
