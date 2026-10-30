import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, ArrowRight, Check, Copy, Ticket } from "lucide-react";
import { toast } from "sonner";
import { currentOffer, allOffers } from "@/lib/offers";
import { whatsappLink } from "@/lib/pagecraft-knowledge";

export const Route = createFileRoute("/cupons")({
  head: () => ({
    meta: [
      { title: "Cupons do mês | PageCraft" },
      {
        name: "description",
        content:
          "Cupom novo todo mês na PageCraft: descontos em sites, landing pages, catálogos e assistentes de IA. Veja o cupom vigente e o calendário do ano.",
      },
      { property: "og:title", content: "Cupons do mês | PageCraft" },
      {
        property: "og:description",
        content: "Descontos que mudam todo mês em sites, landing pages e sistemas sob medida.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CouponsPage,
});

function CouponsPage() {
  const offer = currentOffer();
  const list = allOffers();
  const monthNow = new Date().getUTCMonth();
  const [copied, setCopied] = useState<string | null>(null);

  const copy = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(code);
      toast.success("Cupom copiado!");
      setTimeout(() => setCopied(null), 2000);
    } catch {
      toast.error("Não consegui copiar. Anote o cupom: " + code);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-clip">
      <div className="mx-auto max-w-6xl px-4 py-16 md:py-24">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar ao site
        </Link>

        <span className="mt-6 inline-flex items-center gap-2 rounded-full glass px-3 py-1 text-xs uppercase tracking-widest text-primary">
          <Ticket className="w-3.5 h-3.5" /> Cupons
        </span>
        <h1 className="mt-4 text-3xl md:text-5xl font-bold tracking-tight">
          Um cupom novo <span className="text-gradient-green">todo mês</span>.
        </h1>
        <p className="mt-4 max-w-2xl text-muted-foreground">
          Os descontos mudam automaticamente na virada de cada mês. Informe o código ao pedir seu
          orçamento — sem valores fixos, o preço é sempre calculado conforme o escopo do projeto.
        </p>

        {/* Cupom vigente */}
        <div className="mt-10 glass-strong card-sheen rounded-3xl p-8 md:p-10 border-primary/30">
          <div className="flex flex-col md:flex-row md:items-center gap-8">
            <div className="flex-1">
              <span className="text-xs uppercase tracking-widest text-primary">
                Cupom de {offer.mes}
              </span>
              <h2 className="mt-2 text-2xl md:text-3xl font-bold">{offer.titulo}</h2>
              <p className="mt-2 text-muted-foreground">{offer.descricao}</p>
              <p className="mt-4 text-sm text-muted-foreground">
                Válido em: <span className="text-foreground">{offer.aplicaEm}</span> · até{" "}
                {offer.validoAte}
              </p>
              <a
                href={whatsappLink(
                  `Olá! Quero usar o cupom ${offer.cupom} (${offer.desconto}) no meu projeto.`,
                )}
                target="_blank"
                rel="noreferrer"
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:brightness-110 transition"
              >
                Usar este cupom <ArrowRight className="w-4 h-4" />
              </a>
            </div>
            <div className="md:w-72 text-center">
              <div className="text-5xl font-bold text-gradient-green">{offer.desconto}</div>
              <button
                onClick={() => copy(offer.cupom)}
                className="mt-4 w-full inline-flex items-center justify-center gap-2 rounded-2xl border border-dashed border-primary/50 bg-primary/5 px-4 py-3 font-mono text-lg tracking-widest hover:bg-primary/10 transition"
              >
                {copied === offer.cupom ? (
                  <>
                    Copiado <Check className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    {offer.cupom} <Copy className="w-4 h-4 opacity-60" />
                  </>
                )}
              </button>
              <p className="mt-2 text-[11px] text-muted-foreground">
                Informe o cupom ao pedir seu orçamento.
              </p>
            </div>
          </div>
        </div>

        {/* Calendário do ano */}
        <h2 className="mt-16 text-xl md:text-2xl font-bold tracking-tight">Calendário de cupons</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Cada mês tem seu próprio desconto. Válido apenas dentro do mês indicado.
        </p>

        <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {list.map((o) => {
            const isNow = o.mesIndex === monthNow;
            const isPast = o.mesIndex < monthNow;
            return (
              <div
                key={o.cupom}
                className={`glass rounded-2xl p-5 transition ${
                  isNow ? "border-primary/50 glow-green" : isPast ? "opacity-50" : ""
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-widest text-muted-foreground">
                    {o.mes}
                  </span>
                  <span className="text-sm font-bold text-primary">{o.desconto}</span>
                </div>
                <h3 className="mt-2 font-semibold">{o.titulo}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{o.descricao}</p>
                <p className="mt-3 text-xs text-muted-foreground">Aplica em: {o.aplicaEm}</p>
                <button
                  onClick={() => copy(o.cupom)}
                  disabled={!isNow}
                  className="mt-4 w-full rounded-xl border border-dashed border-primary/40 px-3 py-2 font-mono text-sm tracking-widest disabled:cursor-not-allowed disabled:opacity-60 hover:bg-primary/10 transition"
                >
                  {copied === o.cupom ? "Copiado ✓" : o.cupom}
                </button>
                {!isNow && (
                  <p className="mt-2 text-[11px] text-muted-foreground text-center">
                    {isPast ? "Encerrado" : "Disponível em " + o.mes}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-14 glass rounded-3xl p-8 text-center">
          <h2 className="text-xl font-bold">Quer aplicar o cupom no seu projeto?</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Fale com a PageCraft e receba um orçamento sob medida, já com o desconto do mês.
          </p>
          <Link
            to="/"
            hash="contato"
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:brightness-110 transition"
          >
            Solicitar orçamento <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}