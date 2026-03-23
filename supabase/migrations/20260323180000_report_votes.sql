-- Anonymous agree/disagree per hype report (one vote per visitor session per report).

CREATE TABLE public.report_votes (
  report_id uuid NOT NULL REFERENCES public.reports (id) ON DELETE CASCADE,
  visitor_session_id text NOT NULL,
  -- true = agree (thumbs up), false = disagree (thumbs down)
  vote_type boolean NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (report_id, visitor_session_id)
);

CREATE INDEX report_votes_report_id_idx ON public.report_votes (report_id);

COMMENT ON TABLE public.report_votes IS
  'Per-session votes on cached LLM reports; keyed by client visitor_session_id.';

ALTER TABLE public.report_votes ENABLE ROW LEVEL SECURITY;
