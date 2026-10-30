CREATE TABLE public.feedbacks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  company TEXT,
  rating SMALLINT NOT NULL DEFAULT 5,
  message TEXT NOT NULL,
  approved BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.feedbacks ADD CONSTRAINT feedbacks_rating_range CHECK (rating BETWEEN 1 AND 5);
ALTER TABLE public.feedbacks ADD CONSTRAINT feedbacks_name_len CHECK (char_length(name) BETWEEN 2 AND 60);
ALTER TABLE public.feedbacks ADD CONSTRAINT feedbacks_message_len CHECK (char_length(message) BETWEEN 5 AND 600);
ALTER TABLE public.feedbacks ADD CONSTRAINT feedbacks_company_len CHECK (company IS NULL OR char_length(company) <= 60);

GRANT SELECT, INSERT ON public.feedbacks TO anon;
GRANT SELECT, INSERT ON public.feedbacks TO authenticated;
GRANT ALL ON public.feedbacks TO service_role;

ALTER TABLE public.feedbacks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anyone can read approved feedbacks"
ON public.feedbacks FOR SELECT
TO anon, authenticated
USING (approved = true);

CREATE POLICY "anyone can submit feedback"
ON public.feedbacks FOR INSERT
TO anon, authenticated
WITH CHECK (approved = true);