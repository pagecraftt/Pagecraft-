import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, Clock, LayoutDashboard, Loader2, MessageCircle } from "lucide-react";
import { whatsappLink } from "@/lib/pagecraft-knowledge";
import { getStripeEnvironment, brl } from "@/lib/stripe";
import { confirmCheckoutSession, type ConfirmResult } from "@/utils/payments.functions";

export const Route = createFileRoute("/pagamento/retorno")({
  validateSearch: (search: Record<string, unknown>): { session_id?: string } => ({
    session_id: typeof search.session_id === "string" ? search.session_id : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Pagamento confirmado | PageCraft" },
      {
        name: "description",
        content:
          "Confirmação do pagamento do seu plano PageCraft. Acompanhe o andamento do projeto na área do cliente.",
      },
      { property: "og:title", content: "Pagamento confirmado | PageCraft" },
      { property: "og:description", content: "Seu plano PageCraft foi contratado com sucesso." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: RetornoPage,
});

function RetornoPage() {
  const { session_id: sessionId } = Route.useSearch();
  const [resultado, setResultado] = useState<ConfirmResult | null>(null);
  const [carregando, setCarregando] = useState(Boolean(sessionId));

  useEffect(() => {
    if (!sessionId) return;
    let ativo = true;
    let tentativas = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const checar = async () => {
      try {
        const r = await confirmCheckoutSession({
          data: { sessionId, environment: getStripeEnvironment() },
        });
        if (!ativo) return;
        setResultado(r);
        // Pagamentos assíncronos (boleto/Pix) podem levar alguns segundos.
        if (!("error" in r) && r.status === "pendente" && tentativas < 4) {
          tentativas += 1;
          timer = setTimeout(checar, 3000);
          return;
        }
        setCarregando(false);
      } catch {
        if (!ativo) return;
        setResultado({ error: "Não consegui confirmar o pagamento agora." });
        setCarregando(false);
      }
    };

    checar();
    return () => {
      ativo = false;
      if (timer) clearTimeout(timer);
    };
  }, [sessionId]);

  const confirmed = resultado && !("error" in resultado) ? resultado : null;
  const pago = resultado !== null && !("error" in resultado) && resultado.status === "pago";
  const pendente = resultado !== null && !("error" in resultado) && resultado.status === "pendente";
  const falhou = resultado !== null && ("error" in resultado || resultado.status === "falhou");

  return (
    <div className="min-h-screen bg-background text-foreground grid place-items-center px-4 py-20">
      <div className="glass-strong rounded-3xl p-8 max-w-lg w-full text-center">
        <span
          className={`mx-auto grid place-items-center w-14 h-14 rounded-2xl ${
            falhou ? "bg-destructive/15 text-destructive" : "bg-primary/15 text-primary"
          }`}
        >
          {carregando ? (
            <Loader2 className="w-7 h-7 animate-spin" />
          ) : pago ? (
            <CheckCircle2 className="w-7 h-7" />
          ) : falhou ? (
            <AlertCircle className="w-7 h-7" />
          ) : (
            <Clock className="w-7 h-7" />
          )}
        </span>

        <h1 className="mt-5 text-2xl font-bold tracking-tight">
          {carregando
            ? "Confirmando seu pagamento…"
            : pago
              ? "Pagamento confirmado!"
              : pendente
                ? "Pagamento em processamento"
                : falhou
                  ? "Não consegui confirmar o pagamento"
                  : "Pagamento finalizado"}
        </h1>

        <p className="mt-3 text-sm text-muted-foreground">
          {carregando
            ? "Só um instante enquanto verifico com a operadora do cartão."
            : pago
              ? "Obrigado! Já estou com o seu pedido. Em até 24h entro em contato para agendar a produção e alinhar os detalhes do projeto."
              : pendente
                ? "A operadora ainda está processando. Assim que aprovar, o pedido aparece como pago na sua área do cliente — pode fechar esta página."
                : "Se o valor foi debitado, me chame no WhatsApp com o código abaixo que eu verifico na hora."}
        </p>

        {pago && confirmed && confirmed.amountCents > 0 && (
          <p className="mt-4 text-sm font-medium">
            {confirmed.planName} — {brl(confirmed.amountCents)} em {confirmed.installments}x
          </p>
        )}

        {sessionId && (
          <p className="mt-4 rounded-xl bg-white/5 px-3 py-2 text-[11px] font-mono break-all text-muted-foreground">
            {sessionId}
          </p>
        )}

        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link
            to="/painel"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:brightness-110 transition"
          >
            <LayoutDashboard className="w-4 h-4" /> Ir para a área do cliente
          </Link>
          <a
            href={whatsappLink(
              `Olá, PageCraft! Sobre meu pagamento${sessionId ? ` (${sessionId})` : ""}.`,
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full glass px-5 py-3 text-sm font-semibold hover:bg-white/10 transition"
          >
            <MessageCircle className="w-4 h-4" /> Falar no WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
