CREATE TABLE public.contracts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  client_name TEXT NOT NULL,
  client_document TEXT,
  client_email TEXT NOT NULL,
  client_phone TEXT,
  company TEXT,
  project_type TEXT NOT NULL,
  scope TEXT NOT NULL,
  value TEXT,
  deadline TEXT,
  signature_name TEXT NOT NULL,
  accepted BOOLEAN NOT NULL DEFAULT true,
  signed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
GRANT ALL ON public.contracts TO service_role;
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;