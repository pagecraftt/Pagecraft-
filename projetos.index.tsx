import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteFrame } from "@/components/site-frame";
import { useState } from "react";
import { ArrowLeft, ArrowRight, ExternalLink, Search } from "lucide-react";
import { PROJECTS, PROJECT_CATEGORIES, type ProjectCategory } from "@/lib/projects";

export const Route = createFileRoute("/projetos/")({
  head: () => ({
    meta: [
      { title: "Projetos — PageCraft" },
      {
        name: "description",
        content:
          "Conheça os projetos entregues pela PageCraft: sites, sistemas, aplicativos, landing pages e design system que impulsionam negócios.",
      },
      { property: "og:title", content: "Projetos — PageCraft" },
      {
        property: "og:description",
        content:
          "Portfólio completo da PageCraft com cases reais em tecnologia, IA e produtos digitais.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProjetosPage,
});

function ProjetosPage() {
  const [cat, setCat] = useState<ProjectCategory>("Todos");
  const [q, setQ] = useState("");
  const items = PROJECTS.filter((p) => {
    const inCat = cat === "Todos" || p.cat === cat;
    const inQ =
      !q ||
      p.name.toLowerCase().includes(q.toLowerCase()) ||
      p.desc.toLowerCase().includes(q.toLowerCase()) ||
      p.tech.some((t) => t.toLowerCase().includes(q.toLowerCase()));
    return inCat && inQ;
  });

  return (
    <SiteFrame>
      <div className="pointer-events-none fixed inset-0 -z-10 opacity-30">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-[500px] w-[900px] rounded-full blur-3xl bg-primary/20" />
      </div>

      <section className="relative pt-28 pb-14">
        <div className="mx-auto max-w-7xl px-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition"
          >
            <ArrowLeft className="w-4 h-4" /> Voltar ao início
          </Link>
          <div className="mt-6 max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full glass px-3 py-1 text-xs uppercase tracking-widest text-primary">
              Portfólio completo
            </span>
            <h1 className="mt-4 text-4xl md:text-6xl font-bold tracking-tight">
              Projetos que impulsionam{" "}
              <span className="text-gradient-green">negócios</span>.
            </h1>
            <p className="mt-4 text-muted-foreground text-lg">
              Cases reais de sites, sistemas, aplicativos e produtos digitais entregues pela
              PageCraft — com resultados mensuráveis para cada cliente.
            </p>
          </div>

          <div className="mt-10 flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
            <div className="relative w-full lg:max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Buscar por nome, descrição ou tecnologia..."
                className="w-full glass rounded-full pl-10 pr-4 py-2.5 text-sm outline-none focus:border-primary/50"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {PROJECT_CATEGORIES.map((c) => (
                <button
                  key={c}
                  onClick={() => setCat(c)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition border ${
                    cat === c
                      ? "bg-primary text-primary-foreground border-primary"
                      : "glass border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="relative pb-24">
        <div className="mx-auto max-w-7xl px-4">
          {items.length === 0 ? (
            <div className="glass rounded-2xl p-12 text-center text-muted-foreground">
              Nenhum projeto encontrado com esses filtros.
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {items.map((p) => (
                <div
                  key={p.slug}
                  className="group glass rounded-2xl overflow-hidden transition hover:-translate-y-1 relative"
                >
                  <Link
                    to="/projetos/$slug"
                    params={{ slug: p.slug }}
                    className="absolute inset-0 z-0"
                    aria-label={`Ver detalhes de ${p.name}`}
                  />
                  <div
                    className="aspect-[4/3] relative overflow-hidden"
                    style={{
                      background: `radial-gradient(120% 80% at 20% 20%, oklch(0.35 0.18 ${p.hue}) 0%, transparent 60%), radial-gradient(120% 80% at 80% 90%, oklch(0.25 0.16 ${p.hue + 20}) 0%, transparent 60%), #050507`,
                    }}
                  >
                    <div className="absolute inset-0 grid-bg opacity-30" aria-hidden />
                    <div className="absolute inset-4 rounded-xl glass-strong grid place-items-center">
                      <div className="font-mono text-primary/80 text-xs">{p.tech.join(" · ")}</div>
                    </div>
                    <span className="absolute top-3 left-3 text-[10px] uppercase tracking-widest bg-background/60 text-primary rounded-full px-2 py-1">
                      {p.cat}
                    </span>
                    <span className="absolute top-3 right-3 text-[10px] uppercase tracking-widest bg-background/60 text-muted-foreground rounded-full px-2 py-1">
                      {p.year}
                    </span>
                  </div>
                  <div className="p-5 relative z-10 pointer-events-none">
                    <h3 className="text-lg font-semibold">{p.name}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{p.desc}</p>
                    {p.demoPath && (
                      <a
                        href={p.demoPath}
                        className="pointer-events-auto mt-3 inline-flex items-center gap-1.5 text-xs font-medium rounded-full bg-primary text-primary-foreground px-3 py-1.5 hover:opacity-90 transition"
                      >
                        Abrir demonstração <ArrowRight className="w-3.5 h-3.5" />
                      </a>
                    )}
                    {p.liveUrl && (
                      <a
                        href={p.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="pointer-events-auto mt-3 inline-flex items-center gap-1.5 text-xs font-medium rounded-full border border-primary/40 bg-primary/10 text-primary px-3 py-1.5 hover:bg-primary/20 transition"
                      >
                        Ver site ao vivo <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex flex-wrap gap-1">
                        {p.tech.map((t) => (
                          <span
                            key={t}
                            className="text-[10px] rounded-full border border-border px-2 py-0.5 text-muted-foreground"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                      <span className="text-primary text-sm inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                        Ver <ArrowRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </SiteFrame>
  );
}