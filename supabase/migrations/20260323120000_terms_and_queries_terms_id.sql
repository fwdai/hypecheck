/*
  Canonical search terms: stable name + slug for matching user queries (typos,
  alternate phrasing) to a single concept. queries.terms_id links each submission
  to its resolved canonical term when known.
*/

CREATE TABLE public.terms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  name text NOT NULL,
  slug text NOT NULL,
  CONSTRAINT terms_slug_unique UNIQUE (slug)
);

COMMENT ON TABLE public.terms IS 'Canonical search terms for grouping varied user phrasing and typos.';
COMMENT ON COLUMN public.terms.name IS 'Human-readable label for the canonical term.';
COMMENT ON COLUMN public.terms.slug IS 'Stable URL-safe identifier; unique across terms.';

CREATE INDEX terms_name_idx ON public.terms (name);

ALTER TABLE public.queries
  ADD COLUMN term_id uuid REFERENCES public.terms (id) ON DELETE SET NULL;

COMMENT ON COLUMN public.queries.term_id IS 'Resolved canonical term when the raw query maps to a known term; NULL if unmatched or not yet resolved.';

CREATE INDEX queries_term_id_idx ON public.queries (term_id);

ALTER TABLE public.terms ENABLE ROW LEVEL SECURITY;
