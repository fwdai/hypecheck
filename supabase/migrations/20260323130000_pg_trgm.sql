-- Enable the extension (probably already on in Supabase)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Add an index for performance
CREATE INDEX terms_name_trgm_idx 
  ON public.terms USING gin (name gin_trgm_ops);