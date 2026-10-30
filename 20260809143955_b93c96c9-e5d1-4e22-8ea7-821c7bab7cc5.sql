REVOKE SELECT ON public.feedbacks FROM anon, authenticated;
GRANT SELECT (id, name, company, rating, message, approved, created_at, updated_at) ON public.feedbacks TO anon, authenticated;