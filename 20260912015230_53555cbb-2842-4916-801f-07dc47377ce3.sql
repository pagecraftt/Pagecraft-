CREATE TABLE public.contract_permissions (
  user_id uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  authorized boolean NOT NULL DEFAULT false,
  authorized_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  authorized_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT ON public.contract_permissions TO authenticated;
GRANT ALL ON public.contract_permissions TO service_role;

ALTER TABLE public.contract_permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "clients read own contract permission"
ON public.contract_permissions
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "admins manage contract permissions"
ON public.contract_permissions
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE OR REPLACE FUNCTION public.touch_contract_permission()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  IF NEW.authorized AND (TG_OP = 'INSERT' OR OLD.authorized IS DISTINCT FROM NEW.authorized) THEN
    NEW.authorized_at = now();
  ELSIF NOT NEW.authorized THEN
    NEW.authorized_at = NULL;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER touch_contract_permission
BEFORE INSERT OR UPDATE ON public.contract_permissions
FOR EACH ROW EXECUTE FUNCTION public.touch_contract_permission();