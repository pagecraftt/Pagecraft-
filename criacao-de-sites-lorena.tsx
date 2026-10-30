import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Check, MessageCircle } from "lucide-react";
import { SERVICES, PROCESS_STEPS, COMMITMENTS, CONTACT, whatsappLink } from "@/lib/pagecraft-knowledge";
import { PROJECTS } from "@/lib/projects";

const URL = "https://pagecraft-digital-craft.lovable.app/criacao-de-sites-lorena";
const TITLE = "Criação de Sites em Lorena/SP | PageCraft";
const DESC =
  "Empresa que cria sites, landing pages, sistemas e aplicativos em Lorena/SP e região do Vale do Paraíba. Fale direto com o programador e receba um orçamento sob medida.";

const FAQ = [
  {
    q: "Quanto custa criar um site com a PageCraft?",
    a: "O orçamento é sempre sob medida: o valor depende do número de páginas, das integrações e do prazo. Escopo, prazo e valor são combinados por escrito antes de começar.",
  },
  {
    q: "Em quanto tempo o site fica pronto?",
    a: "Uma landing page leva de 3 a 10 dias. Um site institucional leva de 1 a 3 semanas, conforme o número de páginas. Sistemas e painéis levam de 3 a 8 semanas.",
  },
  {
    q: "A PageCraft atende empresas fora de Lorena?",
    a: "Sim. O atendimento é remoto e presencial na região do Vale do Paraíba, e remoto para todo o Brasil.",
  },
  {
    q: "O site é meu depois de pronto?",
    a: "Sim. O código e o domínio pertencem ao cliente.",
  },
];

export const Route = createFileRoute("/criacao-de-sites-lorena")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:url", content: URL },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: URL }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: FAQ.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }),
      },
    ],
  }),
  component: LocalPage,
});

function LocalPage() {
  const cases = PROJECTS.slice(0, 4);
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto w-full max-w-4xl px-4 py-14">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
          <ArrowLeft className="h-4 w-4" /> Voltar para a home
        </Link>

        <span className="mt-8 inline-flex items-center gap-2 rounded-full glass px-3 py-1 text-xs uppercase tracking-widest text-primary">
          Lorena · SP · Vale do Paraíba
        </span>
        <h1 className="mt-4 text-3xl font-bold tracking-tight md:text-5xl">
          Criação de sites em Lorena/SP
        </h1>
        <p className="mt-4 max-w-2xl text-muted-foreground">
          A PageCraft é um estúdio de tecnologia em {CONTACT.location}, criado por {CONTACT.founder}.
          Desenvolvemos sites institucionais, landing pages, sistemas web e aplicativos sob medida —
          com atendimento direto com quem programa, sem intermediários.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <a
            href={whatsappLink("Olá! Quero um orçamento para criação de site.")}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 font-medium text-primary-foreground"
          >
            <MessageCircle className="h-4 w-4" /> Pedir orçamento no WhatsApp
          </a>
          <Link
            to="/projetos"
            className="inline-flex items-center gap-2 rounded-xl glass px-5 py-3 font-medium"
          >
            Ver projetos entregues
          </Link>
        </div>

        <h2 className="mt-14 text-2xl font-semibold">O que desenvolvemos</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {SERVICES.map((s) => (
            <article key={s.id} className="glass rounded-2xl p-5">
              <h3 className="font-semibold">{s.nome}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.descricao}</p>
              <p className="mt-3 text-xs text-primary">Prazo típico: {s.prazoTipico}</p>
            </article>
          ))}
        </div>

        <h2 className="mt-14 text-2xl font-semibold">Como funciona o projeto</h2>
        <ol className="mt-6 space-y-3">
          {PROCESS_STEPS.map((step, i) => (
            <li key={step} className="glass flex gap-3 rounded-2xl p-4 text-sm">
              <span className="font-mono text-primary">{String(i + 1).padStart(2, "0")}</span>
              <span className="text-muted-foreground">{step}</span>
            </li>
          ))}
        </ol>

        <h2 className="mt-14 text-2xl font-semibold">Nossos compromissos</h2>
        <ul className="mt-6 grid gap-3 md:grid-cols-2">
          {COMMITMENTS.map((c) => (
            <li key={c} className="flex gap-2 text-sm text-muted-foreground">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" /> {c}
            </li>
          ))}
        </ul>

        <h2 className="mt-14 text-2xl font-semibold">Projetos recentes</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {cases.map((p) => (
            <Link
              key={p.slug}
              to="/projetos/$slug"
              params={{ slug: p.slug }}
              className="glass rounded-2xl p-5 transition-colors hover:border-primary/40"
            >
              <h3 className="font-semibold">{p.name}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{p.desc}</p>
            </Link>
          ))}
        </div>

        <h2 className="mt-14 text-2xl font-semibold">Perguntas frequentes</h2>
        <div className="mt-6 space-y-3">
          {FAQ.map((f) => (
            <details key={f.q} className="glass rounded-2xl p-5">
              <summary className="cursor-pointer font-medium">{f.q}</summary>
              <p className="mt-3 text-sm text-muted-foreground">{f.a}</p>
            </details>
          ))}
        </div>

        <div className="mt-14 glass-strong rounded-3xl p-8 text-center">
          <h2 className="text-2xl font-semibold">Vamos tirar seu site do papel?</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            WhatsApp {CONTACT.whatsappDisplay} · {CONTACT.email}
          </p>
          <a
            href={whatsappLink("Olá! Quero conversar sobre um projeto com a PageCraft.")}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 font-medium text-primary-foreground"
          >
            <MessageCircle className="h-4 w-4" /> Falar no WhatsApp
          </a>
        </div>
      </div>
    </main>
  );
}
