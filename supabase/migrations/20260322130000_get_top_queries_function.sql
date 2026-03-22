/*
  Returns the most-submitted normalized queries with a human-friendly label
  (latest raw_query per group) for landing-page suggestions.
*/

CREATE OR REPLACE FUNCTION public.get_top_queries(p_limit int DEFAULT 10)
RETURNS TABLE (display_query text, query_count bigint)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH ranked AS (
    SELECT
      q.normalized_query,
      COUNT(*)::bigint AS query_count,
      (ARRAY_AGG(q.raw_query ORDER BY q.created_at DESC))[1] AS latest_raw
    FROM public.queries q
    GROUP BY q.normalized_query
  )
  SELECT latest_raw AS display_query, query_count
  FROM ranked
  ORDER BY query_count DESC, display_query ASC
  LIMIT GREATEST(1, LEAST(p_limit, 50));
$$;

COMMENT ON FUNCTION public.get_top_queries(int) IS 'Top normalized_query groups by count; label is most recent raw_query in each group.';

REVOKE ALL ON FUNCTION public.get_top_queries(int) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_top_queries(int) TO service_role;
