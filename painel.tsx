import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import {
  ArrowLeft,
  CreditCard,
  FileSignature,
  FolderOpen,
  Loader2,
  LogOut,
  Send,
  ShieldCheck,
  User,
  Wrench,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { hasLivePayment } from "@/lib/payment-rules";
import { claimContracts } from "@/lib/painel.functions";
import { souAdmin } from "@/lib/admin.functions";
import { brl } from "@/lib/stripe";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/painel")({
  head: () => ({
    meta: [
      { title: "Meu Painel | Área do Cliente PageCraft" },
      {
        name: "description",
        content:
          "Acompanhe plano contratado, pagamentos, contratos assinados, arquivos entregues e pedidos de manutenção da PageCraft.",
      },
      { property: "og:title", content: "Meu Painel | Área do Cliente PageCraft" },
      {
        property: "og:description",
        content: "Tudo sobre o seu projeto PageCraft em um só lugar.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PainelPage,
});

type Order = {
  id: string;
  product_name: string | null;
  price_id: string;
  amount_cents: number;
  installments: number;
  environment: string;
  status: string;
  created_at: string;
};
type Contract = {
  id: string;
  code: string;
  project_type: string;
  value: string | null;
  signed_at: string;
};
type Deliverable = {
  id: string;
  title: string;
  kind: string;
  url: string | null;
  note: string | null;
  created_at: string;
};
type Maintenance = {
  id: string;
  subject: string;
  message: string;
  status: string;
  created_at: string;
};

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

function PainelPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [carregando, setCarregando] = useState(true);
  const [email, setEmail] = useState("");
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [empresa, setEmpresa] = useState("");
  const [salvo, setSalvo] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [deliverables, setDeliverables] = useState<Deliverable[]>([]);
  const [chamados, setChamados] = useState<Maintenance[]>([]);
  const [assunto, setAssunto] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [admin, setAdmin] = useState(false);
  const [erroChamado, setErroChamado] = useState("");
  const [contratoLiberado, setContratoLiberado] = useState(false);

  const carregar = useCallback(async () => {
    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;
    if (!user) { setCarregando(false); return; }
    setEmail(user.email ?? "");

    await claimContracts().catch(() => undefined);
    setAdmin((await souAdmin().catch(() => ({ admin: false }))).admin);

    const [perfil, pedidos, contratos, entregas, manutencao, permissaoContrato] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
      supabase.from("orders").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
      supabase.from("contracts").select("id,code,project_type,value,signed_at").eq("user_id", user.id).order("signed_at", { ascending: false }),
      supabase.from("deliverables").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
      supabase.from("maintenance_requests").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
      supabase.from("contract_permissions").select("authorized").eq("user_id", user.id).maybeSingle(),
    ]);
    if ([perfil, pedidos, contratos, entregas, manutencao, permissaoContrato].some(result => result.error)) {
      toast.error("Alguns dados não puderam ser carregados. Atualize a página para tentar novamente.");
    }

    setNome(perfil.data?.full_name ?? "");
    setTelefone(perfil.data?.phone ?? "");
    setEmpresa(perfil.data?.company ?? "");
    setOrders((pedidos.data as Order[]) ?? []);
    setContracts((contratos.data as Contract[]) ?? []);
    setDeliverables((entregas.data as Deliverable[]) ?? []);
    setChamados((manutencao.data as Maintenance[]) ?? []);
    setContratoLiberado(Boolean(permissaoContrato.data?.authorized));
    setCarregando(false);

  }, []);

  useEffect(() => {
    void carregar().catch(() => { setCarregando(false); toast.error("Não foi possível carregar seu painel."); });
    const refresh = () => { void carregar().catch(() => undefined); };
    window.addEventListener("focus", refresh);
    const timer = window.setInterval(refresh, 15000);
    return () => { window.removeEventListener("focus", refresh); window.clearInterval(timer); };
  }, [carregar]);

  const planoAtivo = hasLivePayment(orders);


  async function salvarPerfil(e: React.FormEvent) {
    e.preventDefault();
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;
    const { error } = await supabase
      .from("profiles")
      .upsert({ id: userData.user.id, full_name: nome, phone: telefone, company: empresa, updated_at: new Date().toISOString() });
    if (error) { toast.error("Não foi possível salvar seus dados."); return; }
    setSalvo("Dados atualizados.");
    setTimeout(() => setSalvo(""), 3000);
  }

  async function abrirChamado(e: React.FormEvent) {
    e.preventDefault();
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;
    setEnviando(true);
    setErroChamado("");
    const { error } = await supabase
      .from("maintenance_requests")
      .insert({ user_id: userData.user.id, subject: assunto, message: mensagem });
    setEnviando(false);
    if (error) {
      setErroChamado(
        "Os pedidos de manutenção ficam liberados assim que um pagamento for confirmado.",
      );
      return;
    }
    setAssunto("");
    setMensagem("");
    carregar();
  }

  async function sair() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    await navigate({ to: "/entrar", replace: true });
  }

  if (carregando) {
    return (
      <div className="min-h-screen grid place-items-center bg-background text-muted-foreground">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div
        className="absolute inset-x-0 top-0 h-[420px] bg-primary/10 blur-[140px] pointer-events-none"
        aria-hidden
      />
      <header className="relative mx-auto max-w-6xl px-4 pt-10 flex items-center justify-between gap-4">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar ao site
        </Link>
        <div className="flex items-center gap-2">
          {admin && (
            <Link
              to="/admin"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:brightness-110 transition"
            >
              <ShieldCheck className="w-3.5 h-3.5" /> Administração
            </Link>
          )}
          <Button
            variant="outline"
            type="button"
            onClick={sair}
            className="inline-flex items-center gap-2 rounded-full glass px-4 py-2 text-xs hover:bg-muted transition"
          >
            <LogOut className="w-3.5 h-3.5" /> Sair
          </Button>
        </div>

      </header>

      <main className="relative mx-auto max-w-6xl px-4 pb-24 pt-8">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
          Olá{nome ? `, ${nome.split(" ")[0]}` : ""}! Seu <span className="text-gradient-green">painel</span>
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">{email}</p>

        <div className="mt-10 grid lg:grid-cols-2 gap-6 items-start">
          <Card icon={CreditCard} title="Planos e pagamentos">
            {orders.length === 0 ? (
              <div>
                <Vazio texto="Nenhum pagamento registrado ainda." />
                <Link
                  to="/pagamento"
                  className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground hover:brightness-110 transition"
                >
                  Contratar um plano
                </Link>
              </div>
            ) : (
              <ul className="space-y-3">
                {orders.map((o) => (
                  <li key={o.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm font-medium">{o.product_name ?? o.price_id}</span>
                      <span className="rounded-full bg-primary/15 px-2.5 py-1 text-[10px] uppercase tracking-wider text-primary">
                        {o.status}{o.environment === "sandbox" ? " · teste" : ""}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {brl(o.amount_cents)} em {o.installments}x · {data(o.created_at)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card icon={FileSignature} title="Contratos assinados">
            {contracts.length === 0 ? (
              <div>
                <Vazio texto="Nenhum contrato vinculado a este e-mail ainda." />
              </div>
            ) : (
              <ul className="space-y-3">
                {contracts.map((c) => (
                  <li key={c.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-sm font-medium">{c.project_type}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Código {c.code} · assinado em {data(c.signed_at)}
                      {c.value ? ` · ${c.value}` : ""}
                    </p>
                  </li>
                ))}
              </ul>
            )}
            {contratoLiberado && <Button asChild className="mt-4"><Link to="/contrato"><FileSignature />Assinar um contrato</Link></Button>}
          </Card>

          <Card icon={FolderOpen} title="Arquivos e entregas">
            {deliverables.length === 0 ? (
              <Vazio texto="As fotos, vídeos e arquivos do seu projeto aparecem aqui assim que forem publicados." />
            ) : (
              <ul className="space-y-3">
                {deliverables.map((d) => (
                  <li key={d.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm font-medium">{d.title}</span>
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                        {d.kind}
                      </span>
                    </div>
                    {d.note && <p className="mt-1 text-xs text-muted-foreground">{d.note}</p>}
                    {d.url && (
                      <a
                        href={d.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-block text-xs text-primary hover:underline"
                      >
                        Abrir arquivo
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card icon={Wrench} title="Pedidos de manutenção">
            {!planoAtivo ? (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm font-medium">Disponível para clientes com plano pago</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Assim que o pagamento for confirmado, você abre pedidos de ajuste e manutenção
                  por aqui.
                </p>
                <Link
                  to="/pagamento"
                  className="mt-3 inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:brightness-110 transition"
                >
                  Contratar um plano
                </Link>
              </div>
            ) : (
              <form onSubmit={abrirChamado} className="space-y-3">
                <input
                  value={assunto}
                  onChange={(e) => setAssunto(e.target.value)}
                  placeholder="Assunto (ex: trocar foto da home)"
                  required
                  className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm outline-none focus:border-primary transition"
                />
                <textarea
                  value={mensagem}
                  onChange={(e) => setMensagem(e.target.value)}
                  rows={3}
                  required
                  placeholder="Descreva o que precisa ser ajustado"
                  className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm outline-none focus:border-primary transition resize-none"
                />
                <button
                  type="submit"
                  disabled={enviando}
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-xs font-semibold text-primary-foreground hover:brightness-110 transition disabled:opacity-50"
                >
                  {enviando ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  Abrir pedido
                </button>
                {erroChamado && <p className="text-xs text-destructive">{erroChamado}</p>}
              </form>
            )}


            {chamados.length > 0 && (
              <ul className="mt-5 space-y-3">
                {chamados.map((m) => (
                  <li key={m.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm font-medium">{m.subject}</span>
                      <span className="rounded-full bg-primary/15 px-2.5 py-1 text-[10px] uppercase tracking-wider text-primary">
                        {m.status}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{m.message}</p>
                    <p className="mt-1 text-[10px] text-muted-foreground">{data(m.created_at)}</p>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card icon={User} title="Meus dados">
            <form onSubmit={salvarPerfil} className="grid sm:grid-cols-2 gap-3">
              <input
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Nome completo"
                className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm outline-none focus:border-primary transition"
              />
              <input
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                placeholder="WhatsApp"
                className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm outline-none focus:border-primary transition"
              />
              <input
                value={empresa}
                onChange={(e) => setEmpresa(e.target.value)}
                placeholder="Empresa (opcional)"
                className="sm:col-span-2 w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm outline-none focus:border-primary transition"
              />
              <button
                type="submit"
                className="sm:col-span-2 justify-self-start inline-flex items-center gap-2 rounded-full glass px-5 py-2.5 text-xs font-semibold hover:bg-white/10 transition"
              >
                Salvar dados
              </button>
              {salvo && <p className="sm:col-span-2 text-xs text-primary">{salvo}</p>}
            </form>
          </Card>
        </div>
      </main>
    </div>
  );
}
