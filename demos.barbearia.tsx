import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Check, Clock, Scissors, User } from "lucide-react";
import { DemoCard, DemoShell, DemoWhatsAppButton } from "@/components/demo/DemoShell";

export const Route = createFileRoute("/demos/barbearia")({
  head: () => ({
    meta: [
      { title: "Barbearia Norte 42 — demonstração PageCraft" },
      {
        name: "description",
        content:
          "Demonstração interativa de agendamento online para barbearias: serviço, profissional e horário em três passos.",
      },
      { property: "og:title", content: "Barbearia Norte 42 — demonstração PageCraft" },
      { property: "og:description", content: "Agendamento online em três passos, feito pela PageCraft." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: BarbeariaDemo,
});

const SERVICES = [
  { id: "corte", name: "Corte navalhado", time: "45 min", price: 55 },
  { id: "barba", name: "Barba completa", time: "30 min", price: 40 },
  { id: "combo", name: "Corte + barba", time: "1h10", price: 85 },
  { id: "pigment", name: "Pigmentação", time: "40 min", price: 60 },
];

const BARBERS = [
  { id: "tiago", name: "Tiago", role: "Degradê e navalha" },
  { id: "rafa", name: "Rafa", role: "Barba e visagismo" },
  { id: "leo", name: "Léo", role: "Clássicos e tesoura" },
];

const SLOTS = ["09:00", "10:00", "11:00", "13:30", "14:30", "15:30", "16:30", "18:00", "19:00"];
const TAKEN = ["10:00", "14:30", "18:00"];

const brl = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

function BarbeariaDemo() {
  const [service, setService] = useState<string | null>(null);
  const [barber, setBarber] = useState<string | null>(null);
  const [slot, setSlot] = useState<string | null>(null);

  const chosenService = SERVICES.find((s) => s.id === service);
  const chosenBarber = BARBERS.find((b) => b.id === barber);
  const done = chosenService && chosenBarber && slot;

  const stepClass = (active: boolean) =>
    `text-[10px] uppercase tracking-widest ${active ? "" : "text-muted-foreground"}`;

  return (
    <DemoShell
      title="Barbearia Norte 42"
      tagline="Escolha o serviço, o profissional e o horário. Sem troca de mensagens."
      hue={150}
      eyebrow="Barbearia · agendamento online"
      ctaLabel="Agendar horário"
      nav={["Serviços", "Profissionais", "Galeria", "Contato"]}
      highlights={[
        { label: "Agenda", value: "aberta 7 dias" },
        { label: "Profissionais", value: "3 barbeiros" },
        { label: "Confirmação", value: "imediata" },
      ]}
      testimonial={{
        quote: "Marquei o horário em menos de um minuto e fui atendido na hora certa.",
        author: "Cliente ilustrativo",
      }}
      info={{
        address: "Av. Norte, 42 — Lorena/SP",
        hours: "Ter a dom, 9h às 20h",
        phone: "(12) 90000-0000",
      }}
    >
      <div className="grid lg:grid-cols-[1fr_320px] gap-6 items-start">
        <div className="space-y-6">
          <DemoCard className="p-6">
            <div className="flex items-center gap-2">
              <Scissors className="w-4 h-4" style={{ color: "var(--demo)" }} />
              <span className={stepClass(true)} style={{ color: "var(--demo)" }}>
                Passo 1 — serviço
              </span>
            </div>
            <div className="mt-4 grid sm:grid-cols-2 gap-3">
              {SERVICES.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setService(s.id)}
                  className="text-left rounded-xl border p-4 transition hover:border-foreground/30"
                  style={service === s.id ? { borderColor: "var(--demo)", background: "var(--demo-soft)" } : undefined}
                >
                  <div className="font-medium">{s.name}</div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {s.time} · {brl(s.price)}
                  </div>
                </button>
              ))}
            </div>
          </DemoCard>

          <DemoCard className="p-6">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" style={{ color: "var(--demo)" }} />
              <span className={stepClass(true)} style={{ color: "var(--demo)" }}>
                Passo 2 — profissional
              </span>
            </div>
            <div className="mt-4 grid sm:grid-cols-3 gap-3">
              {BARBERS.map((b) => (
                <button
                  key={b.id}
                  onClick={() => setBarber(b.id)}
                  className="rounded-xl border p-4 text-left transition hover:border-foreground/30"
                  style={barber === b.id ? { borderColor: "var(--demo)", background: "var(--demo-soft)" } : undefined}
                >
                  <div
                    className="w-10 h-10 rounded-full grid place-items-center font-semibold"
                    style={{ background: "var(--demo)", color: "oklch(0.15 0 0)" }}
                  >
                    {b.name[0]}
                  </div>
                  <div className="mt-3 font-medium">{b.name}</div>
                  <div className="text-xs text-muted-foreground">{b.role}</div>
                </button>
              ))}
            </div>
          </DemoCard>

          <DemoCard className="p-6">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" style={{ color: "var(--demo)" }} />
              <span className={stepClass(true)} style={{ color: "var(--demo)" }}>
                Passo 3 — horário (hoje)
              </span>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {SLOTS.map((t) => {
                const taken = TAKEN.includes(t);
                return (
                  <button
                    key={t}
                    disabled={taken}
                    onClick={() => setSlot(t)}
                    className={`px-4 py-2 rounded-lg text-sm border transition ${
                      taken ? "opacity-40 line-through cursor-not-allowed" : "hover:border-foreground/30"
                    }`}
                    style={slot === t ? { borderColor: "var(--demo)", background: "var(--demo-soft)" } : undefined}
                  >
                    {t}
                  </button>
                );
              })}
            </div>
            <p className="mt-3 text-xs text-muted-foreground">Horários riscados já estão ocupados.</p>
          </DemoCard>
        </div>

        <DemoCard className="p-6 lg:sticky lg:top-20">
          <h2 className="font-semibold">Resumo do agendamento</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">Serviço</dt>
              <dd className="text-right">{chosenService?.name ?? "—"}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">Profissional</dt>
              <dd className="text-right">{chosenBarber?.name ?? "—"}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">Horário</dt>
              <dd className="text-right">{slot ?? "—"}</dd>
            </div>
            <div className="flex justify-between gap-3 pt-3 border-t border-border font-semibold">
              <dt>Total</dt>
              <dd style={{ color: "var(--demo)" }}>{chosenService ? brl(chosenService.price) : "—"}</dd>
            </div>
          </dl>
          {done ? (
            <div className="mt-5">
              <div className="flex items-center gap-2 text-sm" style={{ color: "var(--demo)" }}>
                <Check className="w-4 h-4" /> Tudo pronto para confirmar
              </div>
              <DemoWhatsAppButton className="mt-3 w-full" label="Confirmar horário" />
            </div>
          ) : (
            <p className="mt-5 text-xs text-muted-foreground">
              Complete os três passos para liberar a confirmação.
            </p>
          )}
        </DemoCard>
      </div>
    </DemoShell>
  );
}
