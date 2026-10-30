import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Check, ExternalLink, Mail, MessageCircle } from "lucide-react";
import { getProjectBySlug, PROJECTS, type Project } from "@/lib/projects";

export const Route = createFileRoute("/projetos/$slug")({
  loader: ({ params }) => {
    const project = getProjectBySlug(params.slug);
    if (!project) throw notFound();
    return { project };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [
          { title: "Projeto não encontrado — PageCraft" },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    const { project } = loaderData;
    const title = `${project.name} — Projeto PageCraft`;
    return {
      meta: [
        { title },
        { name: "description", content: project.desc },
        { property: "og:title", content: title },
        { property: "og:description", content: project.desc },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: ProjectDetail,
  notFoundComponent: ProjectNotFound,
});

function ProjectNotFound() {
  return (
    <div className="min-h-screen grid place-items-center bg-background text-foreground p-6">
      <div className="text-center max-w-md">
        <h1 className="text-3xl font-bold">Projeto não encontrado</h1>
        <p className="mt-2 text-muted-foreground">O projeto que você procura não existe ou foi movido.</p>
        <Link to="/projetos" className="mt-6 inline-flex items-center gap-2 text-primary hover:underline">
          <ArrowLeft className="w-4 h-4" /> Ver todos os projetos
        </Link>
      </div>
    </div>
  );
}

function ProjectDetail() {
  const { project } = Route.useLoaderData() as { project: Project };
  const related = PROJECTS.filter((p) => p.cat === project.cat && p.slug !== project.slug).slice(0, 3);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-clip">
      <section className="relative pt-28 pb-14">
        <div className="mx-auto max-w-5xl px-4">
          <Link
            to="/projetos"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition"
          >
            <ArrowLeft className="w-4 h-4" /> Todos os projetos
          </Link>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <span className="text-[10px] uppercase tracking-widest bg-primary/10 text-primary rounded-full px-3 py-1 border border-primary/30">
              {project.cat}
            </span>
            <span className="text-xs text-muted-foreground">{project.year}</span>
            <span className="text-xs text-muted-foreground">· {project.client}</span>
          </div>

          <h1 className="mt-4 text-4xl md:text-6xl font-bold tracking-tight">
            {project.name}
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-3xl">{project.desc}</p>

          <div className="mt-6 flex flex-wrap gap-3">
            {project.demoPath && (
              <a
                href={project.demoPath}
                className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground font-semibold px-6 py-3 hover:opacity-90 transition"
              >
                Abrir demonstração <ArrowRight className="w-4 h-4" />
              </a>
            )}
            {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full glass border border-border font-semibold px-6 py-3 hover:border-primary/40 transition"
            >
              Acessar o site do projeto <ExternalLink className="w-4 h-4" />
            </a>
            )}
          </div>

          <div
            className="mt-10 aspect-[16/9] rounded-3xl overflow-hidden relative border border-border"
            style={{
              background: `radial-gradient(120% 80% at 20% 20%, oklch(0.35 0.18 ${project.hue}) 0%, transparent 60%), radial-gradient(120% 80% at 80% 90%, oklch(0.25 0.16 ${project.hue + 20}) 0%, transparent 60%), #050507`,
            }}
          >
            <div className="absolute inset-0 grid-bg opacity-30" aria-hidden />
            <div className="absolute inset-8 md:inset-16 rounded-2xl glass-strong grid place-items-center">
              <div className="text-center">
                <div className="font-mono text-primary/80 text-sm md:text-base">
                  {project.tech.join(" · ")}
                </div>
                <div className="mt-3 text-3xl md:text-5xl font-bold text-gradient-green">
                  {project.name}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative pb-16">
        <div className="mx-auto max-w-5xl px-4 grid md:grid-cols-2 gap-6">
          <div className="glass rounded-2xl p-6">
            <h2 className="text-sm uppercase tracking-widest text-primary">Desafio</h2>
            <p className="mt-3 text-muted-foreground leading-relaxed">{project.challenge}</p>
          </div>
          <div className="glass rounded-2xl p-6">
            <h2 className="text-sm uppercase tracking-widest text-primary">Solução</h2>
            <p className="mt-3 text-muted-foreground leading-relaxed">{project.solution}</p>
          </div>
        </div>
      </section>

      <section className="relative pb-16">
        <div className="mx-auto max-w-5xl px-4">
          <div className="glass-strong rounded-3xl p-8 md:p-10 border border-primary/20">
            <h2 className="text-2xl md:text-3xl font-bold">
              Resultados <span className="text-gradient-green">alcançados</span>
            </h2>
            <div className="mt-6 grid sm:grid-cols-3 gap-4">
              {project.results.map((r) => (
                <div key={r} className="glass rounded-2xl p-5 flex items-start gap-3">
                  <span className="mt-0.5 grid place-items-center w-6 h-6 rounded-full bg-primary/20 text-primary">
                    <Check className="w-4 h-4" />
                  </span>
                  <span className="text-sm">{r}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="relative pb-16">
        <div className="mx-auto max-w-5xl px-4">
          <div className="glass rounded-2xl p-6">
            <h2 className="text-sm uppercase tracking-widest text-primary">Stack</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {project.tech.map((t) => (
                <span
                  key={t}
                  className="text-xs rounded-full border border-border px-3 py-1 text-muted-foreground"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="relative pb-16">
        <div className="mx-auto max-w-5xl px-4">
          <div className="glass-strong rounded-3xl p-8 md:p-10 flex flex-col md:flex-row md:items-center gap-6 justify-between border border-primary/20">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold">
                Quer um projeto assim <span className="text-gradient-green">para o seu negócio?</span>
              </h2>
              <p className="mt-2 text-muted-foreground">Fale com a gente e receba uma proposta personalizada.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <a
                href="https://wa.me/5512991881061"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-5 py-2.5 text-sm font-medium hover:opacity-90 transition"
              >
                <MessageCircle className="w-4 h-4" /> WhatsApp
              </a>
              <a
                href="mailto:page.craftt@gmail.com"
                className="inline-flex items-center gap-2 rounded-full glass border border-border px-5 py-2.5 text-sm font-medium hover:border-primary/40 transition"
              >
                <Mail className="w-4 h-4" /> E-mail
              </a>
            </div>
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="relative pb-24">
          <div className="mx-auto max-w-5xl px-4">
            <div className="flex items-end justify-between mb-6">
              <h2 className="text-2xl font-bold">Projetos relacionados</h2>
              <Link to="/projetos" className="text-sm text-primary inline-flex items-center gap-1 hover:gap-2 transition-all">
                Ver todos <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {related.map((p) => (
                <Link
                  key={p.slug}
                  to="/projetos/$slug"
                  params={{ slug: p.slug }}
                  className="group glass rounded-2xl overflow-hidden transition hover:-translate-y-1 block"
                >
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
                  </div>
                  <div className="p-5">
                    <h3 className="text-lg font-semibold">{p.name}</h3>
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{p.desc}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}