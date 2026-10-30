import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { BedDouble, Building2, Heart, MapPin, Ruler, Search } from "lucide-react";
import { DemoCard, DemoShell, DemoWhatsAppButton } from "@/components/demo/DemoShell";

export const Route = createFileRoute("/demos/imobiliaria")({
  head: () => ({
    meta: [
      { title: "Imobiliária Vista — demonstração PageCraft" },
      {
        name: "description",
        content:
          "Demonstração interativa de portal imobiliário com filtros de preço, quartos, tipo e favoritos.",
      },
      { property: "og:title", content: "Imobiliária Vista — demonstração PageCraft" },
      { property: "og:description", content: "Busca de imóveis com filtros combinados e favoritos." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ImobiliariaDemo,
});

const PROPS = [
  { id: 1, name: "Apartamento Jardim Alto", type: "Apartamento", city: "Lorena", price: 320000, beds: 2, area: 68 },
  { id: 2, name: "Casa Vila Nova", type: "Casa", city: "Guaratinguetá", price: 540000, beds: 3, area: 140 },
  { id: 3, name: "Studio Centro", type: "Apartamento", city: "Lorena", price: 189000, beds: 1, area: 34 },
  { id: 4, name: "Sobrado Parque das Águas", type: "Casa", city: "Cachoeira Paulista", price: 720000, beds: 4, area: 210 },
  { id: 5, name: "Sala comercial Eixo Norte", type: "Comercial", city: "Lorena", price: 260000, beds: 0, area: 55 },
  { id: 6, name: "Cobertura Mirante", type: "Apartamento", city: "Guaratinguetá", price: 890000, beds: 3, area: 175 },
];

const TYPES = ["Todos", "Apartamento", "Casa", "Comercial"];
const brl = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

function ImobiliariaDemo() {
  const [q, setQ] = useState("");
  const [type, setType] = useState("Todos");
  const [maxPrice, setMaxPrice] = useState(900000);
  const [minBeds, setMinBeds] = useState(0);
  const [favs, setFavs] = useState<number[]>([]);

  const items = PROPS.filter(
    (p) =>
      (type === "Todos" || p.type === type) &&
      p.price <= maxPrice &&
      p.beds >= minBeds &&
      (!q ||
        p.name.toLowerCase().includes(q.toLowerCase()) ||
        p.city.toLowerCase().includes(q.toLowerCase())),
  );

  return (
    <DemoShell
      title="Imobiliária Vista"
      tagline="Encontre o imóvel certo filtrando por preço, quartos, tipo e cidade."
      hue={210}
      eyebrow="Imobiliária · Vale do Paraíba"
      ctaLabel="Falar com um corretor"
      nav={["Comprar", "Alugar", "Anuncie", "Contato"]}
      highlights={[
        { label: "Imóveis ativos", value: "120+" },
        { label: "Visitas", value: "agendadas no dia" },
        { label: "Documentação", value: "acompanhada" },
      ]}
      testimonial={{
        quote: "Filtrei o que cabia no meu orçamento e agendei a visita no mesmo dia.",
        author: "Cliente ilustrativo",
      }}
      info={{
        address: "Rua Vista Alegre, 210 — Lorena/SP",
        hours: "Seg a sex, 9h às 18h · sáb, 9h às 13h",
        phone: "(12) 90000-0000",
      }}
    >
      <DemoCard className="p-5">
        <div className="grid md:grid-cols-2 gap-5">
          <div>
            <label className="text-xs uppercase tracking-widest text-muted-foreground">Buscar</label>
            <div className="relative mt-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Bairro, cidade ou nome do imóvel"
                className="w-full rounded-lg border border-border bg-background pl-10 pr-4 py-2.5 text-sm outline-none focus:border-foreground/30"
              />
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {TYPES.map((t) => (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className="px-3 py-1.5 rounded-full text-xs border transition"
                  style={type === t ? { background: "var(--demo)", color: "oklch(0.15 0 0)", borderColor: "var(--demo)" } : undefined}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs">
                <span className="uppercase tracking-widest text-muted-foreground">Preço máximo</span>
                <span className="font-mono" style={{ color: "var(--demo)" }}>{brl(maxPrice)}</span>
              </div>
              <input
                type="range"
                min={150000}
                max={900000}
                step={10000}
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="mt-2 w-full accent-[var(--demo)]"
                aria-label="Preço máximo"
              />
            </div>
            <div>
              <span className="text-xs uppercase tracking-widest text-muted-foreground">Quartos (mínimo)</span>
              <div className="mt-2 flex gap-2">
                {[0, 1, 2, 3, 4].map((n) => (
                  <button
                    key={n}
                    onClick={() => setMinBeds(n)}
                    className="w-10 h-9 rounded-lg border text-sm transition"
                    style={minBeds === n ? { background: "var(--demo)", color: "oklch(0.15 0 0)", borderColor: "var(--demo)" } : undefined}
                  >
                    {n === 0 ? "Todos" : `${n}+`}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </DemoCard>

      <p className="mt-6 text-sm text-muted-foreground">
        {items.length} imóvel(is) encontrado(s){favs.length > 0 && ` · ${favs.length} favorito(s)`}
      </p>

      <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {items.map((p) => (
          <DemoCard key={p.id} className="overflow-hidden">
            <div
              className="h-36 relative grid place-items-center"
              style={{ background: "var(--demo-soft)" }}
            >
              <Building2 className="w-8 h-8" style={{ color: "var(--demo)" }} />
              <button
                onClick={() => setFavs((f) => (f.includes(p.id) ? f.filter((x) => x !== p.id) : [...f, p.id]))}
                className="absolute top-3 right-3 w-9 h-9 rounded-full grid place-items-center border border-border bg-background/70 backdrop-blur"
                aria-label={`Favoritar ${p.name}`}
              >
                <Heart
                  className="w-4 h-4"
                  style={favs.includes(p.id) ? { color: "var(--demo)", fill: "currentColor" } : undefined}
                />
              </button>
            </div>
            <div className="p-5">
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground">{p.type}</span>
              <h3 className="mt-1 font-semibold">{p.name}</h3>
              <p className="mt-1 text-xs text-muted-foreground inline-flex items-center gap-1">
                <MapPin className="w-3 h-3" /> {p.city}/SP
              </p>
              <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <BedDouble className="w-3.5 h-3.5" /> {p.beds || "—"}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Ruler className="w-3.5 h-3.5" /> {p.area} m²
                </span>
              </div>
              <div className="mt-4 font-mono text-lg" style={{ color: "var(--demo)" }}>
                {brl(p.price)}
              </div>
              <DemoWhatsAppButton className="mt-4 w-full" label="Agendar visita" />
            </div>
          </DemoCard>
        ))}
      </div>

      {items.length === 0 && (
        <DemoCard className="mt-4 p-10 text-center text-muted-foreground">
          Nenhum imóvel com esses filtros. Tente aumentar o preço máximo.
        </DemoCard>
      )}
    </DemoShell>
  );
}
