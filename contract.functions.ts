import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { canSignContract } from "./contract-access";
import { buildContractDocument, CONTRACT_VERSION } from "./contract-document";
import { ClientContractSchema, parsePreparation, preparedDocumentData, type ContractPreparation } from "./contract-preparation";

const SignInput = ClientContractSchema;

export type SignResult =
  | { ok: true; code: string; signedAt: string; documentText: string; documentVersion: string }
  | { ok: false; reason: string };

function makeCode() {
  const rand = crypto.randomUUID().replace(/-/g, "").slice(0, 12).toUpperCase();
  const year = new Date().getFullYear();
  return `PC-${year}-${rand}`;
}

const clean = (v: string | null, max = 200) => {
  const t = v?.trim();
  return t ? t.slice(0, max) : null;
};

export const signContract = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => SignInput.parse(input))
  .handler(async ({ data, context }): Promise<SignResult> => {
    const { data: permission, error: permissionError } = await context.supabase
      .from("contract_permissions")
      .select("authorized, admin_data, updated_at")
      .eq("user_id", context.userId)
      .maybeSingle();
    if (!canSignContract(permission, Boolean(permissionError))) {
      return {
        ok: false,
        reason: "Este contrato ainda não foi liberado pela administração.",
      };
    }

    const preparation = parsePreparation(permission?.admin_data);
    if (permission?.updated_at !== data.preparationRevision) return { ok: false, reason: "O contrato foi atualizado pela administração. Atualize a página e leia novamente antes de assinar." };
    if (preparation.tipo.length < 2 || preparation.escopo.length < 10) return { ok: false, reason: "A administração ainda está preparando os dados do projeto." };

    const name = data.clientName.trim().slice(0, 120);
    const signature = data.signatureName.trim().slice(0, 120);

    const norm = (s: string) => s.toLowerCase().replace(/\s+/g, " ").trim();
    if (norm(signature) !== norm(name)) {
      return {
        ok: false,
        reason: "A assinatura precisa ser igual ao nome completo informado no contrato.",
      };
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const code = makeCode();
    const documentText = buildContractDocument(preparedDocumentData({ ...data, clientName: name }, preparation));
    const { data: row, error } = await supabaseAdmin
      .from("contracts")
      .insert({
        code,
        client_name: name,
        client_document: clean(data.clientDocument, 30),
        client_email: clean(data.clientEmail, 160),
        client_phone: clean(data.clientPhone, 40),
        company: clean(data.company, 120),
        project_type: preparation.tipo.slice(0, 80),
        scope: preparation.escopo,
        value: clean(preparation.valor, 80),
        deadline: clean(preparation.prazo, 80),
        signature_name: signature,
        accepted: true,
        user_id: context.userId,
        document_version: CONTRACT_VERSION,
        document_text: documentText,
      })
      .select("code, signed_at")
      .single();

    if (error || !row) {
      return { ok: false, reason: "Não consegui registrar o aceite agora. Tente novamente." };
    }
    return { ok: true, code: row.code as string, signedAt: row.signed_at as string, documentText, documentVersion: CONTRACT_VERSION };
  });

export const getContractPermission = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<{ authorized: boolean; preparation: ContractPreparation | null; revision: string }> => {
    const { data, error } = await context.supabase
      .from("contract_permissions")
      .select("authorized, admin_data, updated_at")
      .eq("user_id", context.userId)
      .maybeSingle();
    if (error) throw new Error("Não foi possível verificar a liberação do contrato.");
    const authorized = canSignContract(data);
    return { authorized, preparation: authorized ? parsePreparation(data?.admin_data) : null, revision: authorized ? data?.updated_at ?? "" : "" };
  });
