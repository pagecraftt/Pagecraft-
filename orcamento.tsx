import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ArrowRight, ArrowLeft, Check, MessageCircle, Mail, Phone, Sparkles, Clock, ShieldCheck,
} from "lucide-react";
import { PRODUCTS } from "@/lib/products";
import { CONTACT, whatsappLink, mailtoLink } from "@/lib/pagecraft-knowledge";

export const Route = createFileRoute("/orcamento")({
  head: () => ({
    meta: [
      { title: "Orçamento de Site ou Sistema | PageCraft — Lorena/SP" },
      { name: "description", content: "Monte seu orçamento em 3 passos: escolha o tipo de projeto, conte o que precisa e receba a proposta pelo WhatsApp ou e-mail. Atendimento direto com quem desenvolve." },
      { property: "og:title", content: "Orçamento de Site ou Sistema | PageCraft" },
      { property: "og:description", content: "Conte seu projeto e receba uma proposta clara, com prazo e escopo, direto de quem desenvolve." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://pagecraft-digital-craft.lovable.app/orcamento" }],
  }),
  component: OrcamentoPage,
});

const TIPOS = [
  { id: "site", label: "Site institucional", desc: "Presença profissional da empresa" },
  { id: "landing", label: "Landing page", desc: "Página única para campanhas" },
  { id: "catalogo", label: "Catálogo / pedidos", desc: "Vitrine com carrinho no WhatsApp" },
  { id: "sistema", label: "Sistema ou painel", desc: "Gestão, agenda, cadastros" },
  { id: "app", label: "Aplicativo / PWA", desc: "App instalável no celular" },
  { id: "ia", label: "IA e automações", desc: "Assistente e integrações" },
];

const PRAZOS = ["O quanto antes", "Em 15 dias", "Em 1 mês", "Ainda planejando"];
const FAIXAS = ["Ainda não sei", "Enxuto", "Intermediário", "Sem limite definido"];

function OrcamentoPage() {
  const [step, setStep] = useState(0);
  const [tipo, setTipo] = useState("");
  const [pacote, setPacote] = useState("");
  const [prazo, setPrazo] = useState("");
  const [faixa, setFaixa] = useState("");
  const [nome, setNome] = useState("");
  const [empresa, setEmpresa] = useState("");
  const [contato, setContato] = useState("");
  const [detalhes, setDetalhes] = useState("");

  const mensagem = useMemo(() => {
    const linhas = [
      "Olá, PageCraft! Quero um orçamento.",
      "",
      `Tipo de projeto: ${TIPOS.find((t) => t.id === tipo)?.label || "-"}`,
      pacote ? `Pacote de interesse: ${pacote}` : "",
      `Prazo desejado: ${prazo || "-"}`,
      `Investimento: ${faixa || "-"}`,
      "",
      `Nome: ${nome || "-"}`,
      empresa ? `Empresa: ${empresa}` : "",
      `Contato: ${contato || "-"}`,
      "",
      "Sobre o projeto:",
      detalhes || "-",
    ];
    return linhas.filter((l) => l !== "").join("\n");
  }, [tipo, pacote, prazo, faixa, nome, empresa, contato, detalhes]);

  const podeAvancar = step === 0 ? !!tipo : step === 1 ? !!prazo : !!nome && !!contato;
  const total = 3;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="absolute inset-x-0 top-0 h-[420px] bg-primary/10 blur-[140px] pointer-events-none" aria-hidden />

      <header className="relative mx-auto max-w-5xl px-4 pt-10">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition">
          <ArrowLeft className="w-4 h-4" /> Voltar ao site
        </Link>
      </header>

      <main className="relative mx-auto max-w-5xl px-4 pb-24 pt-8">
        <span className="inline-flex items-center gap-2 rounded-full glass px-3 py-1.5 text-xs font-medium text-primary">
          <Sparkles className="w-3.5 h-3.5" /> Orçamento sem compromisso
        </span>
        <h1 className="mt-5 text-3xl md:text-5xl font-bold tracking-tight">
          Vamos conversar sobre o seu <span className="text-gradient-green">orçamento</span>
        </h1>
        <p className="mt-4 text-muted-foreground max-w-2xl">
          Responda três passos rápidos e eu monto uma proposta com escopo, prazo e valor.
          Você fala direto com quem desenvolve — sem intermediários.
        </p>

        <ul className="mt-6 flex flex-wrap gap-3 text-xs text-muted-foreground">
          <li className="inline-flex items-center gap-2 glass rounded-full px-3 py-1.5"><Clock className="w-3.5 h-3.5 text-primary" /> Resposta em até 24h</li>
          <li className="inline-flex items-center gap-2 glass rounded-full px-3 py-1.5"><ShieldCheck className="w-3.5 h-3.5 text-primary" /> Escopo e prazo por escrito</li>
          <li className="inline-flex items-center gap-2 glass rounded-full px-3 py-1.5"><Check className="w-3.5 h-3.5 text-primary" /> Sem custo para orçar</li>
        </ul>

        <div className="mt-10 grid lg:grid-cols-[1.4fr_1fr] gap-6 items-start">
          {/* Wizard */}
          <section className="glass-strong rounded-3xl p-5 md:p-8">
            <div className="flex items-center gap-2">
              {Array.from({ length: total }).map((_, i) => (
                <span key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${i <= step ? "bg-primary" : "bg-white/10"}`} />
              ))}
            </div>
            <p className="mt-3 text-xs text-muted-foreground">Passo {step + 1} de {total}</p>

            {step === 0 && (
              <div className="mt-6 animate-fade-up">
                <h2 className="text-lg font-semibold">O que você precisa criar?</h2>
                <div className="mt-4 grid sm:grid-cols-2 gap-3">
                  {TIPOS.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setTipo(t.id)}
                      className={`text-left rounded-2xl p-4 border transition ${tipo === t.id ? "border-primary bg-primary/10" : "border-white/10 hover:border-white/25"}`}
                    >
                      <span className="font-medium text-sm">{t.label}</span>
                      <span className="block text-xs text-muted-foreground mt-1">{t.desc}</span>
                    </button>
                  ))}
                </div>

                <h3 className="mt-8 text-sm font-semibold">Já tem um pacote em mente? (opcional)</h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {PRODUCTS.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setPacote(pacote === p.nome ? "" : p.nome)}
                      className={`rounded-full px-3 py-1.5 text-xs border transition ${pacote === p.nome ? "border-primary bg-primary/10 text-primary" : "border-white/10 text-muted-foreground hover:border-white/25"}`}
                    >
                      {p.nome}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="mt-6 animate-fade-up">
                <h2 className="text-lg font-semibold">Prazo e investimento</h2>
                <p className="mt-1 text-xs text-muted-foreground">Isso ajuda a desenhar o escopo certo para você.</p>
                <h3 className="mt-5 text-sm font-medium">Quando quer o projeto no ar?</h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {PRAZOS.map((p) => (
                    <button key={p} type="button" onClick={() => setPrazo(p)}
                      className={`rounded-full px-3 py-1.5 text-xs border transition ${prazo === p ? "border-primary bg-primary/10 text-primary" : "border-white/10 text-muted-foreground hover:border-white/25"}`}>
                      {p}
                    </button>
                  ))}
                </div>
                <h3 className="mt-6 text-sm font-medium">Faixa de investimento</h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {FAIXAS.map((f) => (
                    <button key={f} type="button" onClick={() => setFaixa(f)}
                      className={`rounded-full px-3 py-1.5 text-xs border transition ${faixa === f ? "border-primary bg-primary/10 text-primary" : "border-white/10 text-muted-foreground hover:border-white/25"}`}>
                      {f}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="mt-6 animate-fade-up space-y-4">
                <h2 className="text-lg font-semibold">Seus dados e detalhes</h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  <input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Seu nome"
                    className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm outline-none focus:border-primary transition" />
                  <input value={empresa} onChange={(e) => setEmpresa(e.target.value)} placeholder="Empresa (opcional)"
                    className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm outline-none focus:border-primary transition" />
                </div>
                <input value={contato} onChange={(e) => setContato(e.target.value)} placeholder="WhatsApp ou e-mail para retorno"
                  className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm outline-none focus:border-primary transition" />
                <textarea value={detalhes} onChange={(e) => setDetalhes(e.target.value)} rows={5}
                  placeholder="Conte um pouco: o que o site/sistema precisa fazer, referências que você gosta, se já tem logo ou domínio..."
                  className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm outline-none focus:border-primary transition resize-none" />

                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs font-medium text-muted-foreground">Resumo que será enviado</p>
                  <pre className="mt-2 text-xs whitespace-pre-wrap text-foreground/80 font-mono">{mensagem}</pre>
                </div>

                <div className="flex flex-wrap gap-3">
                  <a
                    href={whatsappLink(mensagem)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold bg-primary text-primary-foreground transition ${podeAvancar ? "hover:brightness-110 glow-green" : "pointer-events-none opacity-50"}`}
                  >
                    <MessageCircle className="w-4 h-4" /> Enviar pelo WhatsApp
                  </a>
                  <a
                    href={mailtoLink("Pedido de orçamento — PageCraft", mensagem)}
                    className={`inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold glass hover:bg-white/10 transition ${podeAvancar ? "" : "pointer-events-none opacity-50"}`}
                  >
                    <Mail className="w-4 h-4" /> Enviar por e-mail
                  </a>
                </div>
                {!podeAvancar && (
                  <p className="text-xs text-muted-foreground">Preencha nome e contato para liberar o envio.</p>
                )}
              </div>
            )}

            <div className="mt-8 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep((s) => Math.max(0, s - 1))}
                disabled={step === 0}
                className="inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm glass disabled:opacity-40"
              >
                <ArrowLeft className="w-4 h-4" /> Voltar
              </button>
              {step < total - 1 && (
                <button
                  type="button"
                  onClick={() => podeAvancar && setStep((s) => s + 1)}
                  disabled={!podeAvancar}
                  className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold bg-primary text-primary-foreground disabled:opacity-40"
                >
                  Continuar <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </section>

          {/* Aside */}
          <aside className="space-y-4">
            <div className="glass-strong rounded-3xl p-6">
              <h2 className="text-sm font-semibold">Prefere conversar agora?</h2>
              <p className="mt-2 text-xs text-muted-foreground">Fale direto comigo pelos canais abaixo.</p>
              <div className="mt-4 space-y-2 text-sm">
                <a href={whatsappLink("Olá! Quero conversar sobre um orçamento.")} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 bg-white/5 hover:bg-white/10 transition">
                  <MessageCircle className="w-4 h-4 text-primary" /> WhatsApp {CONTACT.whatsappDisplay}
                </a>
                <a href={`tel:+${CONTACT.whatsapp}`} className="flex items-center gap-3 rounded-xl px-3 py-2.5 bg-white/5 hover:bg-white/10 transition">
                  <Phone className="w-4 h-4 text-primary" /> Ligar agora
                </a>
                <a href={`mailto:${CONTACT.email}`} className="flex items-center gap-3 rounded-xl px-3 py-2.5 bg-white/5 hover:bg-white/10 transition break-all">
                  <Mail className="w-4 h-4 text-primary shrink-0" /> {CONTACT.email}
                </a>
              </div>
              <Link to="/assistente" className="mt-4 inline-flex items-center gap-2 text-xs text-primary hover:underline">
                Tirar dúvidas com o assistente de IA <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="glass rounded-3xl p-6">
              <h2 className="text-sm font-semibold">Como funciona</h2>
              <ol className="mt-3 space-y-3 text-xs text-muted-foreground">
                {["Você envia o resumo do projeto", "Conversamos para alinhar o escopo", "Recebe a proposta com prazo e valor", "Aprovando, começamos a produção"].map((s, i) => (
                  <li key={s} className="flex gap-3">
                    <span className="grid place-items-center w-5 h-5 rounded-full bg-primary/15 text-primary text-[10px] font-bold shrink-0">{i + 1}</span>
                    {s}
                  </li>
                ))}
              </ol>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
