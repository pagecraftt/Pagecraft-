-- 1. Unique key required by the webhook upsert (was missing -> silent failures)
DELETE FROM public.orders a USING public.orders b
  WHERE a.stripe_session_id IS NOT NULL
    AND a.stripe_session_id = b.stripe_session_id
    AND a.ctid > b.ctid;

CREATE UNIQUE INDEX IF NOT EXISTS orders_stripe_session_id_key
  ON public.orders (stripe_session_id)
  WHERE stripe_session_id IS NOT NULL;

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS plan_name text,
  ADD COLUMN IF NOT EXISTS payment_method text,
  ADD COLUMN IF NOT EXISTS paid_at timestamptz;

-- 2. Entitlement helper: does this user have a paid order?
CREATE OR REPLACE FUNCTION public.tem_plano_pago(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.orders
    WHERE user_id = _user_id AND status = 'pago'
  )
$$;

REVOKE ALL ON FUNCTION public.tem_plano_pago(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.tem_plano_pago(uuid) TO authenticated, service_role;

-- 3. Only paying clients can open maintenance tickets
DROP POLICY IF EXISTS "own maintenance" ON public.maintenance_requests;

CREATE POLICY "own maintenance read" ON public.maintenance_requests
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "paid clients open maintenance" ON public.maintenance_requests
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id AND public.tem_plano_pago(auth.uid()));

CREATE POLICY "own maintenance update" ON public.maintenance_requests
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);