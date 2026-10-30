import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { ContractPreparationSchema, parsePreparation } from "./contract-preparation";

export const adminGetContractPreparation = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ userId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const role = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (role.error || !role.data) throw new Error("Acesso restrito à administração.");
    const row = await context.supabase.from("contract_permissions").select("admin_data").eq("user_id", data.userId).maybeSingle();
    if (row.error) throw new Error("Não foi possível carregar o contrato.");
    return parsePreparation(row.data?.admin_data);
  });

export const adminSaveContractPreparation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ userId: z.string().uuid(), preparation: ContractPreparationSchema }).parse(input))
  .handler(async ({ data, context }) => {
    const role = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (role.error || !role.data) throw new Error("Acesso restrito à administração.");
    const existing = await context.supabase.from("contract_permissions").select("user_id").eq("user_id", data.userId).maybeSingle();
    if (existing.error) throw new Error("Não foi possível verificar o contrato.");
    const result = existing.data
      ? await context.supabase.from("contract_permissions").update({ admin_data: data.preparation }).eq("user_id", data.userId)
      : await context.supabase.from("contract_permissions").insert({ user_id: data.userId, admin_data: data.preparation, authorized: false });
    if (result.error) throw new Error("Não foi possível salvar os dados do contrato.");
    return { ok: true };
  });