import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, CreditCard, Loader2, MessageCircle, QrCode, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PaymentTestModeBanner } from "@/components/PaymentTestModeBanner";
import { StripeEmbeddedCheckout } from "@/components/StripeEmbeddedCheckout";
import { PLANOS_PAGAMENTO, brl, parcelaDe } from "@/lib/stripe";
import { whatsappLink } from "@/lib/pagecraft-knowledge";

export const Route = createFileRoute("/pagamento/")({
  validateSearch: (search: Record<string, unknown>): { plano?: string } => ({
    plano: typeof search.plano === "string" ? search.plano : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Pagamento dos Planos | PageCraft" },
      {
        name: "description",
        content:
          "Contrate os planos Dia Marcado e Site Mais+ Marketing da PageCraft com pagamento no cartão em até 3x ou via Pix combinado pelo WhatsApp.",
      },
      { property: "og:title", content: "Pagamento dos Planos | PageCraft" },
      {
        property: "og:description",
        content: "Cartão em até 3x ou Pix. Pagamento seguro e recibo automático.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PagamentoPage,
});

function PagamentoPage() {
  const { plano } = Route.useSearch();
  const inicial = PLANOS_PAGAMENTO.find((p) => p.priceId === plano) ?? PLANOS_PAGAMENTO[0];
  const [selecionado, setSelecionado] = useState(inicial);
  const [parcelas, setParcelas] = useState(1);
  const [pagando, setPagando] = useState(false);
  const [sessao, setSessao] = useState<{ userId?: string; email?: string }>({});
  const [checandoLogin, setChecandoLogin] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setSessao({ userId: data.user.id, email: data.user.email ?? undefined });
      setChecandoLogin(false);
    });
  }, []);

  useEffect(() => {
    setPagando(false);
  }, [selecionado, parcelas]);

  const retorno =
    typeof window !== "undefined"
      ? `${window.location.origin}/pagamento/retorno?session_id={CHECKOUT_SESSION_ID}`
      : undefined;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <PaymentTestModeBanner />
      <div
        className="absolute inset-x-0 top-0 h-[420px] bg-primary/10 blur-[140px] pointer-events-none"
        aria-hidden
      />

      <header className="relative mx-auto max-w-6xl px-4 pt-10">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar ao site
        </Link>
      </header>

      <main className="relative mx-auto max-w-6xl px-4 pb-24 pt-8">
        <h1 className="text-3xl md:text-5xl font-bold tracking-tight">
          Finalize a contratação do seu <span className="text-gradient-green">plano</span>
        </h1>
        <p className="mt-4 max-w-2xl text-muted-foreground">
          Pague com cartão em até 3x direto no site, ou combine o Pix pelo WhatsApp. Depois do
          pagamento, tudo fica registrado na sua área do cliente.
        </p>

        <div className="mt-10 grid lg:grid-cols-[1fr_1.1fr] gap-6 items-start">
          <section className="space-y-4">
            <div className="glass-strong rounded-3xl p-6">
              <h2 className="text-sm font-semibold">1. Escolha o plano</h2>
              <div className="mt-4 space-y-3">
                {PLANOS_PAGAMENTO.map((p) => (
                  <button
                    key={p.priceId}
                    type="button"
                    onClick={() => setSelecionado(p)}
                    className={`w-full text-left rounded-2xl border p-4 transition ${
                      selecionado.priceId === p.priceId
                        ? "border-primary bg-primary/10"
                        : "border-white/10 hover:border-white/25"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-medium text-sm">{p.nome}</span>
                      <span className="text-sm font-semibold">{brl(p.totalCentavos)}</span>
                    </div>
                    <span className="mt-1 block text-xs text-muted-foreground">{p.resumo}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="glass-strong rounded-3xl p-6">
              <h2 className="text-sm font-semibold">2. Como quer parcelar?</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {[1, 2, 3].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setParcelas(n)}
                    className={`rounded-2xl border p-4 text-left transition ${
                      parcelas === n ? "border-primary bg-primary/10" : "border-white/10 hover:border-white/25"
                    }`}
                  >
                    <span className="block text-sm font-semibold">
                      {n}x de {parcelaDe(selecionado.totalCentavos, n)}
                    </span>
                    <span className="mt-1 block text-[11px] text-muted-foreground">
                      {n === 1 ? "À vista, sem juros" : "No cartão de crédito"}
                    </span>
                  </button>
                ))}
              </div>
              <p className="mt-4 text-[11px] text-muted-foreground">
                O parcelamento aparece na tela do cartão quando a bandeira permite. Se não estiver
                disponível, o valor é cobrado à vista e o parcelamento pode ser combinado no Pix.
              </p>
            </div>

            <div className="glass rounded-3xl p-6">
              <h2 className="text-sm font-semibold">Prefere Pix?</h2>
              <p className="mt-2 text-xs text-muted-foreground">
                Envio a chave e o comprovante entra na sua área do cliente do mesmo jeito.
              </p>
              <a
                href={whatsappLink(
                  `Olá, PageCraft! Quero pagar o plano "${selecionado.nome}" (${brl(
                    selecionado.totalCentavos,
                  )}) em ${parcelas}x via Pix.`,
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-2 rounded-full glass px-5 py-3 text-sm font-semibold hover:bg-white/10 transition"
              >
                <QrCode className="w-4 h-4 text-primary" /> Combinar Pix pelo WhatsApp
              </a>
              <a
                href={whatsappLink("Olá! Tenho uma dúvida sobre os planos da PageCraft.")}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 flex items-center gap-2 text-xs text-primary hover:underline"
              >
                <MessageCircle className="w-3.5 h-3.5" /> Falar com o time antes de pagar
              </a>
            </div>
          </section>

          <section className="glass-strong rounded-3xl p-5 md:p-6">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-sm font-semibold">3. Pagamento com cartão</h2>
              <span className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <ShieldCheck className="w-3.5 h-3.5 text-primary" /> Ambiente seguro
              </span>
            </div>

            <div className="mt-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm">
              <p className="font-medium">{selecionado.nome}</p>
              <p className="text-xs text-muted-foreground">
                {parcelas}x de {parcelaDe(selecionado.totalCentavos, parcelas)} — total{" "}
                {brl(selecionado.totalCentavos)}
              </p>
            </div>

            <div className="mt-5">
              {checandoLogin ? (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin text-primary" /> Verificando sua conta…
                </div>
              ) : !sessao.userId ? (
                <div className="rounded-2xl border border-primary/30 bg-primary/5 p-5 text-center">
                  <p className="text-sm font-semibold">Entre na sua conta para pagar</p>
                  <p className="mt-1.5 text-xs text-muted-foreground">
                    O pagamento fica vinculado à sua conta, e o pedido, os arquivos entregues e os
                    pedidos de manutenção aparecem na área do cliente.
                  </p>
                  <Link
                    to="/entrar"
                    search={{ redirect: `/pagamento?plano=${selecionado.priceId}` }}
                    className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:brightness-110 transition"
                  >
                    Entrar ou criar conta
                  </Link>
                </div>
              ) : pagando ? (
                <StripeEmbeddedCheckout
                  key={`${selecionado.priceId}-${parcelas}`}
                  priceId={selecionado.priceId}
                  installments={parcelas}
                  returnUrl={retorno}
                />
              ) : (
                <button
                  type="button"
                  onClick={() => setPagando(true)}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:brightness-110 glow-green transition"
                >
                  <CreditCard className="w-4 h-4" /> Pagar com cartão
                </button>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
