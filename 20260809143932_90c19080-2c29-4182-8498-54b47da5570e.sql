ALTER TABLE public.feedbacks
  ADD COLUMN IF NOT EXISTS edit_token uuid NOT NULL DEFAULT gen_random_uuid(),
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

REVOKE INSERT ON public.feedbacks FROM anon, authenticated;
DROP POLICY IF EXISTS "anyone can submit feedback" ON public.feedbacks;

GRANT ALL ON public.feedbacks TO service_role;