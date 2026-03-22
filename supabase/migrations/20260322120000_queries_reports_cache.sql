/*
  Hypometer: visitor queries, cached LLM reports, and junction links.
  Many queries can reference the same report (same normalized query → shared cache).

  RLS is enabled with no policies so only the service role (used by the Next.js API) can access.
  Direct browser access with the anon key is denied until you add explicit policies.
*/

-- Cached LLM output keyed by normalized search string
CREATE TABLE public.reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  normalized_key text NOT NULL,
  payload jsonb NOT NULL,
  model text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  refreshed_at timestamptz,
  CONSTRAINT reports_normalized_key_unique UNIQUE (normalized_key)
);

COMMENT ON TABLE public.reports IS 'LLM hype analysis; one row per normalized_key. Refresh payload when expires_at passes.';
COMMENT ON COLUMN public.reports.normalized_key IS 'Lowercased/trimmed key used for deduplication and cache lookup.';
COMMENT ON COLUMN public.reports.payload IS 'JSON matching app HypeAnalysis shape.';
COMMENT ON COLUMN public.reports.expires_at IS 'After this time, API may re-run the LLM and update this row.';

CREATE INDEX reports_expires_at_idx ON public.reports (expires_at);

-- One row per visitor attempt to measure something
CREATE TABLE public.queries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  raw_query text NOT NULL,
  normalized_query text NOT NULL,
  visitor_session_id text,
  user_agent text,
  ip inet,
  ip_hash text
);

COMMENT ON TABLE public.queries IS 'Each user submission to measure hype (visitor context + exact query text).';
COMMENT ON COLUMN public.queries.visitor_session_id IS 'Opaque ID from client (e.g. localStorage); not authenticated identity.';
COMMENT ON COLUMN public.queries.ip IS 'Client IP from reverse-proxy headers (e.g. x-forwarded-for) when available. Treat as personal data under GDPR/CCPA.';
COMMENT ON COLUMN public.queries.ip_hash IS 'Optional SHA-256 of IP + VISITOR_IP_SALT; redundant with ip if you only need fingerprinting without raw storage.';

CREATE INDEX queries_normalized_query_idx ON public.queries (normalized_query);
CREATE INDEX queries_created_at_idx ON public.queries (created_at DESC);

-- Links a query to the report row used to satisfy it (many queries → one report)
CREATE TABLE public.query_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  query_id uuid NOT NULL REFERENCES public.queries (id) ON DELETE CASCADE,
  report_id uuid NOT NULL REFERENCES public.reports (id) ON DELETE RESTRICT,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT query_reports_one_report_per_query UNIQUE (query_id)
);

COMMENT ON TABLE public.query_reports IS 'Associates each query with the report returned (cache hit or fresh LLM).';

CREATE INDEX query_reports_report_id_idx ON public.query_reports (report_id);

-- Row Level Security
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.queries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.query_reports ENABLE ROW LEVEL SECURITY;
