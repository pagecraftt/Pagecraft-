import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Activity, Check, Dumbbell } from "lucide-react";
import { DemoCard, DemoShell, DemoWhatsAppButton } from "@/components/demo/DemoShell";

export const Route = createFileRoute("/demos/academia")({
  head: () => ({
    meta: [
      { title: "Studio Fit — demonstração PageCraft" },
      {
        name: "description",
        content:
          "Demonstração interativa de site de academia com planos, grade de aulas por dia e calculadora de IMC.",
      },
      { property: "og:title", content: "Studio Fit — demonstração PageCraft" },
      { property: "og:description", content: "Planos, grade de aulas e calculadora de IMC interativa." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AcademiaDemo,
});

const PLANS = [
  { name: "Livre", period: "mensal", price: 119, perks: ["Musculação", "Acesso a 1 unidade", "Avaliação inicial"] },
  { name: "Plus", period: "trimestral", price: 99, perks: ["Musculação + aulas", "Todas as unidades", "Plano de treino mensal"], best: true },
  { name: "Pro", period: "anual", price: 79, perks: ["Tudo do Plus", "Acompanhamento quinzenal", "Convidado 1x/mês"] },
];

const DAYS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const CLASSES: Record<string, { time: string; name: string; coach: string }[]> = {
  Seg: [
    { time: "06:30", name: "Funcional", coach: "Bea" },
    { time: "18:00", name: "HIIT", coach: "Igor" },
    { time: "19:30", name: "Musculação guiada", coach: "Nay" },
  ],
  Ter: [
    { time: "07:00", name: "Pilates solo", coach: "Cris" },
    { time: "19:00", name: "Boxe", coach: "Deco" },
  ],
  Qua: [
    { time: "06:30", name: "Funcional", coach: "Bea" },
    { time: "18:00", name: "HIIT", coach: "Igor" },
  ],
  Qui: [
    { time: "07:00", name: "Mobilidade", coach: "Cris" },
    { time: "19:00", name: "Boxe", coach: "Deco" },
  ],
  Sex: [
    { time: "06:30", name: "Circuito", coach: "Nay" },
    { time: "18:30", name: "Dança fitness", coach: "Lu" },
  ],
  "Sáb": [{ time: "09:00", name: "Treino aberto", coach: "Equipe" }],
};

function AcademiaDemo() {
  const [day, setDay] = useState("Seg");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");

  const w = parseFloat(weight.replace(",", "."));
  const h = parseFloat(height.replace(",", ".")) / 100;
  const imc = w > 0 && h > 0 ? w / (h * h) : null;
  const faixa =
    imc == null ? null : imc < 18.5 ? "abaixo do peso" : imc < 25 ? "peso adequado" : imc < 30 ? "sobrepeso" : "obesidade";

  return (
    <DemoShell
      title="Studio Fit"
      tagline="Treino sério, ambiente leve. Veja planos, aulas e comece hoje."
      hue={20}
      eyebrow="Academia e studio de treino"
      ctaLabel="Agendar aula teste"
      nav={["Planos", "Aulas", "Estrutura", "Contato"]}
      highlights={[
        { label: "Aula experimental", value: "gratuita" },
        { label: "Turmas", value: "manhã e noite" },
        { label: "Acompanhamento", value: "professor na sala" },
      ]}
      testimonial={{
        quote: "Consegui ver os horários e os planos sem precisar ligar. Comecei na semana seguinte.",
        author: "Aluno ilustrativo",
      }}
      info={{
        address: "Rua do Esporte, 77 — Lorena/SP",
        hours: "Seg a sex, 6h às 22h · sáb, 8h às 14h",
        phone: "(12) 90000-0000",
      }}
    >
      <section>
        <h2 className="text-2xl font-bold">Planos</h2>
        <div className="mt-5 grid md:grid-cols-3 gap-5">
          {PLANS.map((p) => (
            <DemoCard key={p.name} className="p-6 relative">
              {p.best && (
                <span
                  className="absolute -top-3 left-6 text-[10px] uppercase tracking-widest rounded-full px-2.5 py-1 font-semibold"
                  style={{ background: "var(--demo)", color: "oklch(0.15 0 0)" }}
                >
                  Mais escolhido
                </span>
              )}
              <div className="inline-flex items-center gap-2">
                <Dumbbell className="w-4 h-4" style={{ color: "var(--demo)" }} />
                <h3 className="font-semibold text-lg">{p.name}</h3>
              </div>
              <div className="mt-4 flex items-end gap-1">
                <span className="text-3xl font-bold" style={{ color: "var(--demo)" }}>
                  R$ {p.price}
                </span>
                <span className="text-xs text-muted-foreground mb-1">/mês no {p.period}</span>
              </div>
              <ul className="mt-5 space-y-2 text-sm text-muted-foreground">
                {p.perks.map((k) => (
                  <li key={k} className="flex items-start gap-2">
                    <Check className="w-4 h-4 mt-0.5" style={{ color: "var(--demo)" }} /> {k}
                  </li>
                ))}
              </ul>
              <DemoWhatsAppButton className="mt-6 w-full" label="Quero este plano" />
            </DemoCard>
          ))}
        </div>
      </section>

      <section className="mt-14">
        <h2 className="text-2xl font-bold">Grade de aulas</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {DAYS.map((d) => (
            <button
              key={d}
              onClick={() => setDay(d)}
              className="px-4 py-2 rounded-full text-sm border transition"
              style={day === d ? { background: "var(--demo)", color: "oklch(0.15 0 0)", borderColor: "var(--demo)" } : undefined}
            >
              {d}
            </button>
          ))}
        </div>
        <div className="mt-5 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {CLASSES[day].map((c) => (
            <DemoCard key={c.time + c.name} className="p-5">
              <div className="font-mono text-sm" style={{ color: "var(--demo)" }}>{c.time}</div>
              <div className="mt-1 font-semibold">{c.name}</div>
              <div className="text-xs text-muted-foreground mt-1">com {c.coach}</div>
            </DemoCard>
          ))}
        </div>
      </section>

      <section className="mt-14">
        <DemoCard className="p-6 md:p-8">
          <div className="inline-flex items-center gap-2">
            <Activity className="w-4 h-4" style={{ color: "var(--demo)" }} />
            <h2 className="text-2xl font-bold">Calculadora de IMC</h2>
          </div>
          <div className="mt-5 grid sm:grid-cols-3 gap-4 items-end">
            <label className="text-sm">
              <span className="text-muted-foreground text-xs uppercase tracking-widest">Peso (kg)</span>
              <input
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                inputMode="decimal"
                placeholder="72"
                className="mt-2 w-full rounded-lg border border-border bg-background px-4 py-2.5 outline-none focus:border-foreground/30"
              />
            </label>
            <label className="text-sm">
              <span className="text-muted-foreground text-xs uppercase tracking-widest">Altura (cm)</span>
              <input
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                inputMode="decimal"
                placeholder="178"
                className="mt-2 w-full rounded-lg border border-border bg-background px-4 py-2.5 outline-none focus:border-foreground/30"
              />
            </label>
            <div className="rounded-lg border border-border px-4 py-3">
              <span className="text-xs uppercase tracking-widest text-muted-foreground">Resultado</span>
              <div className="mt-1 font-semibold" style={{ color: "var(--demo)" }}>
                {imc ? `${imc.toFixed(1)} — ${faixa}` : "Preencha os campos"}
              </div>
            </div>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Valor apenas informativo; a avaliação física completa é feita na unidade.
          </p>
        </DemoCard>
      </section>
    </DemoShell>
  );
}
