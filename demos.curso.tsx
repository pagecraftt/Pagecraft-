import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Check, ChevronDown, PlayCircle, Star } from "lucide-react";
import { DemoCard, DemoShell } from "@/components/demo/DemoShell";
import { toast } from "sonner";

export const Route = createFileRoute("/demos/curso")({
  head: () => ({
    meta: [
      { title: "Curso Fluxo — demonstração PageCraft" },
      {
        name: "description",
        content:
          "Demonstração interativa de landing page de lançamento com contagem regressiva, módulos, depoimentos e formulário validado.",
      },
      { property: "og:title", content: "Curso Fluxo — demonstração PageCraft" },
      { property: "og:description", content: "Landing page de captação com contador e formulário validado." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CursoDemo,
});

const MODULES = [
  { n: "01", name: "Fundamentos do fluxo", desc: "Como mapear o trabalho antes de automatizar qualquer coisa." },
  { n: "02", name: "Rotinas que se repetem", desc: "Identificar, medir e eliminar tarefas manuais do dia a dia." },
  { n: "03", name: "Ferramentas certas", desc: "Escolher o que usar sem inflar custo nem complexidade." },
  { n: "04", name: "Medindo resultado", desc: "Indicadores simples para provar o ganho de tempo." },
];

const FAQ = [
  { q: "Preciso saber programar?", a: "Não. O curso é focado em organização de processos e ferramentas sem código." },
  { q: "Por quanto tempo tenho acesso?", a: "O acesso é vitalício às aulas gravadas e a todas as atualizações." },
  { q: "Tem certificado?", a: "Sim, emitido ao concluir os quatro módulos." },
];

const TESTIMONIALS = [
  { name: "Marina", role: "Loja de decoração", text: "Cortei duas horas de trabalho manual por dia na primeira semana." },
  { name: "Cauê", role: "Estúdio de design", text: "As aulas são curtas e diretas, deu para aplicar na hora." },
  { name: "Renata", role: "Consultoria", text: "Finalmente entendi o que valia a pena automatizar e o que não." },
];

function useCountdown(target: number) {
  const [left, setLeft] = useState(target - Date.now());
  useEffect(() => {
    const t = setInterval(() => setLeft(target - Date.now()), 1000);
    return () => clearInterval(t);
  }, [target]);
  const s = Math.max(0, Math.floor(left / 1000));
  return {
    d: Math.floor(s / 86400),
    h: Math.floor((s % 86400) / 3600),
    m: Math.floor((s % 3600) / 60),
    s: s % 60,
  };
}

function CursoDemo() {
  const [target] = useState(() => Date.now() + 1000 * 60 * 60 * 74);
  const { d, h, m, s } = useCountdown(target);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [open, setOpen] = useState<number | null>(0);

  const valid = name.trim().length >= 2 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const box = (v: number, label: string) => (
    <div className="rounded-xl border border-border px-4 py-3 text-center min-w-[70px]">
      <div className="text-2xl font-bold font-mono" style={{ color: "var(--demo)" }}>
        {String(v).padStart(2, "0")}
      </div>
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
    </div>
  );

  return (
    <DemoShell
      title="Curso Fluxo"
      tagline="Quatro módulos para tirar o trabalho repetitivo do seu dia. Turma limitada."
      hue={265}
      eyebrow="Curso online · turma com vagas limitadas"
      ctaLabel="Garantir minha vaga"
      nav={["O curso", "Módulos", "Dúvidas", "Inscrição"]}
      highlights={[
        { label: "Formato", value: "100% online" },
        { label: "Carga horária", value: "12 horas" },
        { label: "Acesso", value: "vitalício" },
      ]}
      testimonial={{
        quote: "Em duas semanas automatizei o relatório que me tomava toda sexta-feira.",
        author: "Aluno ilustrativo",
      }}
      info={{
        address: "Curso online — acesso de qualquer lugar",
        hours: "Suporte seg a sex, 9h às 18h",
        phone: "(12) 90000-0000",
      }}
    >
      <div className="flex flex-wrap gap-3">
        {box(d, "dias")}
        {box(h, "horas")}
        {box(m, "min")}
        {box(s, "seg")}
      </div>

      <div className="mt-10 grid lg:grid-cols-[1fr_340px] gap-6 items-start">
        <div className="space-y-10">
          <section>
            <h2 className="text-2xl font-bold">O que você vai aprender</h2>
            <div className="mt-5 grid sm:grid-cols-2 gap-4">
              {MODULES.map((mod) => (
                <DemoCard key={mod.n} className="p-5">
                  <div className="inline-flex items-center gap-2 font-mono text-xs" style={{ color: "var(--demo)" }}>
                    <PlayCircle className="w-4 h-4" /> Módulo {mod.n}
                  </div>
                  <h3 className="mt-2 font-semibold">{mod.name}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{mod.desc}</p>
                </DemoCard>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold">Quem já fez</h2>
            <div className="mt-5 grid sm:grid-cols-3 gap-4">
              {TESTIMONIALS.map((t) => (
                <DemoCard key={t.name} className="p-5">
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5" style={{ color: "var(--demo)", fill: "currentColor" }} />
                    ))}
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">“{t.text}”</p>
                  <div className="mt-3 text-xs">
                    <span className="font-medium">{t.name}</span>
                    <span className="text-muted-foreground"> · {t.role}</span>
                  </div>
                </DemoCard>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold">Dúvidas frequentes</h2>
            <div className="mt-5 space-y-3">
              {FAQ.map((f, i) => (
                <DemoCard key={f.q} className="overflow-hidden">
                  <button
                    onClick={() => setOpen(open === i ? null : i)}
                    className="w-full flex items-center justify-between gap-4 p-5 text-left"
                    aria-expanded={open === i}
                  >
                    <span className="font-medium">{f.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 shrink-0 transition-transform ${open === i ? "rotate-180" : ""}`}
                      style={{ color: "var(--demo)" }}
                    />
                  </button>
                  {open === i && <p className="px-5 pb-5 text-sm text-muted-foreground">{f.a}</p>}
                </DemoCard>
              ))}
            </div>
          </section>
        </div>

        <DemoCard className="p-6 lg:sticky lg:top-20">
          <h2 className="font-semibold text-lg">Garanta sua vaga</h2>
          <p className="mt-1 text-sm text-muted-foreground">Inscrição gratuita na lista de espera.</p>
          {sent ? (
            <div className="mt-6 flex items-start gap-2 text-sm" style={{ color: "var(--demo)" }}>
              <Check className="w-4 h-4 mt-0.5" />
              <span>Inscrição registrada nesta demonstração, {name.split(" ")[0]}!</span>
            </div>
          ) : (
            <form
              className="mt-5 space-y-3"
              onSubmit={(e) => {
                e.preventDefault();
                if (!valid) return;
                setSent(true);
                toast("Formulário de exemplo", {
                  description: "Em um projeto real, o contato vai para sua lista de e-mails.",
                });
              }}
            >
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Seu nome"
                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-foreground/30"
              />
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-foreground/30"
              />
              {email.length > 3 && !valid && (
                <p className="text-xs text-destructive">Preencha um nome e um e-mail válidos.</p>
              )}
              <button
                type="submit"
                disabled={!valid}
                className="w-full rounded-full px-5 py-2.5 text-sm font-semibold transition disabled:opacity-40"
                style={{ background: "var(--demo)", color: "oklch(0.15 0 0)" }}
              >
                Quero participar
              </button>
            </form>
          )}
        </DemoCard>
      </div>
    </DemoShell>
  );
}
