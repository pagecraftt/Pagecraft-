import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import {
  ArrowLeft,
  CreditCard,
  FileSignature,
  Loader2,
  MessageSquareQuote,
  ShieldCheck,
  Upload,
  Users,
  Wrench,
} from "lucide-react";
import {
  adminAtualizarChamado,
  adminCriarEntrega,
  adminDefinirAcessoContrato,
  adminModerarFeedback,
  adminOverview,
  adminRemoverEntrega,
  type AdminCliente,
} from "@/lib/admin.functions";
import { downloadContractPdf } from "@/lib/contract-pdf";
import { LEGACY_CLAUSULAS } from "@/lib/contract-clauses";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { CONTACT } from "@/lib/pagecraft-knowledge";
import { brl } from "@/lib/stripe";
import { AdminContractEditor } from "@/components/admin-contract-editor";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Administração | PageCraft" },
      {
        name: "description",
        content:
          "Painel interno da PageCraft: clientes, pedidos, contratos assinados, entregas, manutenção e moderação de feedbacks.",
      },
      { property: "og:title", content: "Administração | PageCraft" },
      { property: "og:description", content: "Painel interno de gestão da PageCraft." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

const data = (iso: string) => new Date(iso).toLocaleDateString("pt-BR");

function Card({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="glass-strong rounded-3xl p-6">
      <h2 className="flex items-center gap-2 text-sm font-semibold">
        <span className="grid place-items-center w-7 h-7 rounded-lg bg-primary/15 text-primary">
          <Icon className="w-4 h-4" />
        </span>
        {title}
      </h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Vazio({ texto }: { texto: string }) {
  return <p className="text-xs text-muted-foreground">{texto}</p>;
}

const inputCls =
  "w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm outline-none focus:border-primary transition";

function AdminPage() {
  const [carregando, setCarregando] = useState(true);
  const [negado, setNegado] = useState(false);
  const [dados, setDados] = useState<Awaited<ReturnType<typeof adminOverview>> | null>(null);
  const [entrega, setEntrega] = useState({ user_id: "", title: "", kind: "arquivo", url: "", note: "" });
  const [salvando, setSalvando] = useState(false);
  const [alterandoContrato, setAlterandoContrato] = useState<string | null>(null);
  const [editingContract, setEditingContract] = useState<AdminCliente | null>(null);

  const carregar = useCallback(async () => {
    setCarregando(true);
    try {
      setDados(await adminOverview());
      setNegado(false);
    } catch {
      setNegado(true);
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  async function enviarEntrega(e: React.FormEvent) {
    e.preventDefault();
    if (!entrega.user_id || !entrega.title.trim()) return;
    setSalvando(true);
    try {
      await adminCriarEntrega({ data: entrega });
      setEntrega({ user_id: entrega.user_id, title: "", kind: "arquivo", url: "", note: "" });
      await carregar();
    } finally {
      setSalvando(false);
    }
  }

  async function baixarContrato(c: any) {
    await downloadContractPdf({
      nome: c.client_name,
      documento: c.client_document ?? "",
      email: c.client_email ?? "",
      telefone: c.client_phone ?? "",
      empresa: c.company ?? "",
      tipo: c.project_type,
      escopo: c.scope,
      valor: c.value ?? "",
      prazo: c.deadline ?? "",
      assinatura: c.signature_name,
      code: c.code,
      signedAt: c.signed_at,
      clausulas: LEGACY_CLAUSULAS,
      documentText: c.document_text,
      documentVersion: c.document_version,
      contratada: {
        founder: CONTACT.founder,
        location: CONTACT.location,
        email: CONTACT.email,
        whatsapp: CONTACT.whatsappDisplay,
      },
    });
  }

  async function definirAcessoContrato(cliente: AdminCliente) {
    setAlterandoContrato(cliente.id);
    try {
      await adminDefinirAcessoContrato({
        data: { userId: cliente.id, authorized: !cliente.contract_authorized },
      });
      toast.success(cliente.contract_authorized ? "Contrato bloqueado para este cliente." : "Contrato liberado para este cliente.");
      await carregar();
    } catch {
      toast.error("Não foi possível alterar a liberação. Tente novamente.");
    } finally {
      setAlterandoContrato(null);
    }
  }

  const nomeCliente = (id: string | null) => {
    const c = dados?.clientes.find((x: AdminCliente) => x.id === id);
    return c ? c.full_name || c.email || id : id || "—";
  };

  if (carregando) {
    return (
      <div className="min-h-screen grid place-items-center bg-background text-foreground">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (negado || !dados) {
    return (
      <div className="min-h-screen grid place-items-center bg-background text-foreground px-4">
        <div className="glass-strong rounded-3xl p-8 text-center max-w-sm">
          <ShieldCheck className="w-6 h-6 text-primary mx-auto" />
          <h1 className="mt-3 text-lg font-semibold">Acesso restrito</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Esta área é exclusiva da administração da PageCraft.
          </p>
          <Link to="/painel" className="mt-5 inline-block text-sm text-primary">
            Voltar ao meu painel
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="mx-auto max-w-6xl px-4 pt-10 flex items-center justify-between gap-4">
        <Link
          to="/painel"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition"
        >
          <ArrowLeft className="w-4 h-4" /> Meu painel
        </Link>
        <span className="inline-flex items-center gap-2 text-xs text-primary">
          <ShieldCheck className="w-4 h-4" /> Administração
        </span>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-10 space-y-5">
        <h1 className="text-3xl font-bold tracking-tight">
          Painel <span className="text-gradient-green">administrativo</span>
        </h1>

        {editingContract && <AdminContractEditor key={editingContract.id} userId={editingContract.id} name={editingContract.full_name || editingContract.email || "Cliente"} onClose={() => setEditingContract(null)} />}

        <div className="grid gap-5 lg:grid-cols-2">
          <Card icon={Users} title={`Clientes (${dados.clientes.length})`}>
            {dados.clientes.length === 0 ? (
              <Vazio texto="Nenhum cliente cadastrado ainda." />
            ) : (
              <ul className="space-y-2 text-sm max-h-72 overflow-auto pr-1">
                {dados.clientes.map((c: AdminCliente) => (
                  <li key={c.id} className="rounded-lg bg-muted/50 px-3 py-3 flex flex-wrap items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-medium">{c.full_name || "Sem nome"}</p>
                      <p className="text-xs text-muted-foreground break-words">
                        {c.email} {c.phone ? `· ${c.phone}` : ""} {c.company ? `· ${c.company}` : ""}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        Desde {data(c.created_at)} · {c.total_pedidos} pedido{c.total_pedidos === 1 ? "" : "s"}
                        {c.pedidos_pagos > 0 ? ` (${c.pedidos_pagos} pago${c.pedidos_pagos === 1 ? "" : "s"})` : ""}
                        {c.ultimo_pedido ? ` · último em ${data(c.ultimo_pedido)}` : ""}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                    <Button type="button" size="sm" variant="outline" onClick={() => setEditingContract(c)}><FileSignature className="w-3.5 h-3.5" />Preparar contrato</Button>
                    <Button
                      size="sm"
                      variant={c.contract_authorized ? "outline" : "default"}
                      type="button"
                      onClick={() => void definirAcessoContrato(c)}
                      disabled={alterandoContrato === c.id}
                      className={`shrink-0 rounded-full px-3 py-1.5 text-[11px] font-semibold transition disabled:opacity-50 ${
                        c.contract_authorized
                          ? "border border-destructive/40 text-destructive hover:bg-destructive/10"
                          : "bg-primary text-primary-foreground hover:brightness-110"
                      }`}
                    >
                      {alterandoContrato === c.id
                        ? "Salvando..."
                        : c.contract_authorized
                          ? "Bloquear contrato"
                          : "Liberar contrato"}
                    </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card icon={CreditCard} title={`Pedidos (${dados.orders.length})`}>
            {dados.orders.length === 0 ? (
              <Vazio texto="Nenhum pedido registrado." />
            ) : (
              <ul className="space-y-2 text-sm max-h-72 overflow-auto pr-1">
                {dados.orders.map((o: any) => (
                  <li key={o.id} className="rounded-xl bg-white/5 px-3 py-2 flex justify-between gap-3">
                    <div>
                      <p className="font-medium">{o.product_name || o.price_id}</p>
                      <p className="text-xs text-muted-foreground">
                        {o.customer_email || nomeCliente(o.user_id)} · {o.installments}x · {data(o.created_at)}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-semibold">{brl(o.amount_cents)}</p>
                      <p className="text-[11px] text-primary">{o.status}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card icon={FileSignature} title={`Contratos assinados (${dados.contracts.length})`}>
            {dados.contracts.length === 0 ? (
              <Vazio texto="Nenhum contrato assinado." />
            ) : (
              <ul className="space-y-2 text-sm max-h-72 overflow-auto pr-1">
                {dados.contracts.map((c: any) => (
                  <li key={c.id} className="rounded-xl bg-white/5 px-3 py-2 flex justify-between gap-3">
                    <div>
                      <p className="font-medium">
                        {c.client_name} · {c.project_type}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {c.code} · {data(c.signed_at)} {c.value ? `· ${c.value}` : ""}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => void baixarContrato(c)}
                      className="shrink-0 self-center rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground"
                    >
                      PDF
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card icon={Wrench} title={`Manutenção (${dados.chamados.length})`}>
            {dados.chamados.length === 0 ? (
              <Vazio texto="Nenhum chamado aberto." />
            ) : (
              <ul className="space-y-2 text-sm max-h-72 overflow-auto pr-1">
                {dados.chamados.map((m: any) => (
                  <li key={m.id} className="rounded-xl bg-white/5 px-3 py-2">
                    <p className="font-medium">{m.subject}</p>
                    <p className="text-xs text-muted-foreground">{m.message}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {nomeCliente(m.user_id)} · {data(m.created_at)}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {["aberto", "em andamento", "concluído"].map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={async () => {
                            await adminAtualizarChamado({ data: { id: m.id, status: s } });
                            await carregar();
                          }}
                          className={`rounded-full px-3 py-1 text-[11px] transition ${
                            m.status === s
                              ? "bg-primary text-primary-foreground font-semibold"
                              : "glass text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card icon={Upload} title="Enviar entrega para um cliente">
            <form onSubmit={enviarEntrega} className="space-y-2">
              <select
                value={entrega.user_id}
                onChange={(e) => setEntrega({ ...entrega, user_id: e.target.value })}
                required
                className={inputCls}
              >
                <option value="">Selecione o cliente</option>
                {dados.clientes.map((c: AdminCliente) => (
                  <option key={c.id} value={c.id}>
                    {c.full_name || c.email}
                  </option>
                ))}
              </select>
              <input
                value={entrega.title}
                onChange={(e) => setEntrega({ ...entrega, title: e.target.value })}
                placeholder="Título da entrega"
                required
                className={inputCls}
              />
              <input
                value={entrega.url}
                onChange={(e) => setEntrega({ ...entrega, url: e.target.value })}
                placeholder="Link do arquivo (opcional)"
                className={inputCls}
              />
              <textarea
                value={entrega.note}
                onChange={(e) => setEntrega({ ...entrega, note: e.target.value })}
                placeholder="Observação (opcional)"
                rows={2}
                className={inputCls}
              />
              <button
                type="submit"
                disabled={salvando}
                className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-50"
              >
                {salvando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                Enviar entrega
              </button>
            </form>

            {dados.entregas.length > 0 && (
              <ul className="mt-4 space-y-2 text-sm max-h-52 overflow-auto pr-1">
                {dados.entregas.map((d: any) => (
                  <li key={d.id} className="rounded-xl bg-white/5 px-3 py-2 flex justify-between gap-3">
                    <div>
                      <p className="font-medium">{d.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {nomeCliente(d.user_id)} · {data(d.created_at)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={async () => {
                        await adminRemoverEntrega({ data: { id: d.id } });
                        await carregar();
                      }}
                      className="shrink-0 self-center text-xs text-destructive"
                    >
                      remover
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card icon={MessageSquareQuote} title={`Feedbacks (${dados.feedbacks.length})`}>
            {dados.feedbacks.length === 0 ? (
              <Vazio texto="Nenhum feedback recebido." />
            ) : (
              <ul className="space-y-2 text-sm max-h-72 overflow-auto pr-1">
                {dados.feedbacks.map((f: any) => (
                  <li key={f.id} className="rounded-xl bg-white/5 px-3 py-2">
                    <p className="font-medium">
                      {f.name} {f.company ? `· ${f.company}` : ""} · {"★".repeat(f.rating)}
                    </p>
                    <p className="text-xs text-muted-foreground">{f.message}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {(["aprovar", "ocultar", "remover"] as const).map((a) => (
                        <button
                          key={a}
                          type="button"
                          onClick={async () => {
                            await adminModerarFeedback({ data: { id: f.id, acao: a } });
                            await carregar();
                          }}
                          className={`rounded-full px-3 py-1 text-[11px] transition ${
                            (a === "aprovar" && f.approved) || (a === "ocultar" && !f.approved)
                              ? "bg-primary text-primary-foreground font-semibold"
                              : "glass text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          {a}
                        </button>
                      ))}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </main>
    </div>
  );
}
