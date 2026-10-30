import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

type Ctx = { supabase: any; userId: string };

async function garantirAdmin(context: Ctx) {
  const { data, error } = await context.supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "admin",
  });
  if (error || !data) throw new Error("Acesso restrito a administradores.");
}

export const souAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<{ admin: boolean }> => {
    const { data } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    return { admin: Boolean(data) };
  });

export type AdminCliente = {
  id: string;
  email: string | null;
  full_name: string | null;
  phone: string | null;
  company: string | null;
  created_at: string;
  contract_authorized: boolean;
  total_pedidos: number;
  pedidos_pagos: number;
  ultimo_pedido: string | null;
};

export const adminOverview = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await garantirAdmin(context as Ctx);
    const sb = context.supabase;

    const [perfis, orders, contracts, chamados, feedbacks, entregas, permissoesContrato] = await Promise.all([
      sb.from("profiles").select("*").order("created_at", { ascending: false }),
      sb.from("orders").select("*").order("created_at", { ascending: false }),
      sb.from("contracts").select("*").order("signed_at", { ascending: false }),
      sb.from("maintenance_requests").select("*").order("created_at", { ascending: false }),
      sb.from("feedbacks").select("*").order("created_at", { ascending: false }),
      sb.from("deliverables").select("*").order("created_at", { ascending: false }),
      sb.from("contract_permissions").select("user_id, authorized"),
    ]);
    for (const result of [perfis, orders, contracts, chamados, feedbacks, entregas, permissoesContrato]) {
      if (result.error) throw new Error("Não foi possível carregar os dados da administração. Tente novamente.");
    }

    // E-mails vêm da área de autenticação (somente admin).
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: usersData } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 });
    const emailPorId = new Map<string, string | null>(
      (usersData?.users ?? []).map((u) => [u.id, u.email ?? null]),
    );
    const contratoPorId = new Map<string, boolean>(
      (permissoesContrato.data ?? []).map((p: any) => [p.user_id, Boolean(p.authorized)]),
    );

    const clientes: AdminCliente[] = (perfis.data ?? []).map((p: any) => ({
      id: p.id,
      email: emailPorId.get(p.id) ?? null,
      full_name: p.full_name,
      phone: p.phone,
      company: p.company,
      created_at: p.created_at,
      contract_authorized: contratoPorId.get(p.id) ?? false,
      ...(() => {
        const doCliente = (orders.data ?? []).filter((o: any) => o.user_id === p.id);
        return {
          total_pedidos: doCliente.length,
          pedidos_pagos: doCliente.filter((o: any) => o.status === "pago").length,
          ultimo_pedido: doCliente[0]?.created_at ?? null,
        };
      })(),
    }));

    return {
      clientes,
      orders: orders.data ?? [],
      contracts: contracts.data ?? [],
      chamados: chamados.data ?? [],
      feedbacks: feedbacks.data ?? [],
      entregas: entregas.data ?? [],
    };
  });

export const adminDefinirAcessoContrato = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ userId: z.string().uuid(), authorized: z.boolean() }).parse(d))
  .handler(async ({ data, context }) => {
    await garantirAdmin(context as Ctx);
    const { error } = await context.supabase.from("contract_permissions").upsert(
      {
        user_id: data.userId,
        authorized: data.authorized,
        authorized_by: context.userId,
      },
      { onConflict: "user_id" },
    );
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminCriarEntrega = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { user_id: string; title: string; kind: string; url?: string; note?: string }) => d)
  .handler(async ({ data, context }) => {
    await garantirAdmin(context as Ctx);
    const { error } = await context.supabase.from("deliverables").insert({
      user_id: data.user_id,
      title: data.title,
      kind: data.kind || "arquivo",
      url: data.url || null,
      note: data.note || null,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminRemoverEntrega = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => d)
  .handler(async ({ data, context }) => {
    await garantirAdmin(context as Ctx);
    const { error } = await context.supabase.from("deliverables").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminAtualizarChamado = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string; status: string }) => d)
  .handler(async ({ data, context }) => {
    await garantirAdmin(context as Ctx);
    const { error } = await context.supabase
      .from("maintenance_requests")
      .update({ status: data.status, updated_at: new Date().toISOString() })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminModerarFeedback = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string; acao: "aprovar" | "ocultar" | "remover" }) => d)
  .handler(async ({ data, context }) => {
    await garantirAdmin(context as Ctx);
    const sb = context.supabase;
    const { error } =
      data.acao === "remover"
        ? await sb.from("feedbacks").delete().eq("id", data.id)
        : await sb
            .from("feedbacks")
            .update({ approved: data.acao === "aprovar", updated_at: new Date().toISOString() })
            .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
