import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PawPrint, Search, ShoppingCart, Trash2 } from "lucide-react";
import { DemoCard, DemoShell, DemoWhatsAppButton } from "@/components/demo/DemoShell";

export const Route = createFileRoute("/demos/petshop")({
  head: () => ({
    meta: [
      { title: "Pet Shop Lupi — demonstração PageCraft" },
      {
        name: "description",
        content:
          "Demonstração interativa de catálogo de pet shop com busca, filtros por categoria e carrinho lateral.",
      },
      { property: "og:title", content: "Pet Shop Lupi — demonstração PageCraft" },
      { property: "og:description", content: "Catálogo com busca instantânea e carrinho lateral." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PetshopDemo,
});

const CATALOG = [
  { id: "r1", cat: "Ração", name: "Ração premium cães adultos 10kg", price: 189 },
  { id: "r2", cat: "Ração", name: "Ração gatos castrados 3kg", price: 96 },
  { id: "b1", cat: "Banho e tosa", name: "Banho porte pequeno", price: 55 },
  { id: "b2", cat: "Banho e tosa", name: "Tosa higiênica", price: 45 },
  { id: "b3", cat: "Banho e tosa", name: "Hidratação de pelagem", price: 70 },
  { id: "a1", cat: "Acessórios", name: "Coleira ajustável refletiva", price: 39 },
  { id: "a2", cat: "Acessórios", name: "Comedouro inox duplo", price: 62 },
  { id: "br1", cat: "Brinquedos", name: "Mordedor resistente", price: 34 },
  { id: "br2", cat: "Brinquedos", name: "Kit varinha para gatos", price: 27 },
];

const CATS = ["Todos", "Ração", "Banho e tosa", "Acessórios", "Brinquedos"];
const brl = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

function PetshopDemo() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("Todos");
  const [cart, setCart] = useState<Record<string, number>>({});

  const items = CATALOG.filter(
    (i) => (cat === "Todos" || i.cat === cat) && (!q || i.name.toLowerCase().includes(q.toLowerCase())),
  );
  const lines = useMemo(
    () =>
      Object.entries(cart)
        .filter(([, n]) => n > 0)
        .map(([id, n]) => ({ item: CATALOG.find((c) => c.id === id)!, qty: n })),
    [cart],
  );
  const total = lines.reduce((s, l) => s + l.item.price * l.qty, 0);

  return (
    <DemoShell
      title="Pet Shop Lupi"
      tagline="Ração, banho e tosa, acessórios e brinquedos — tudo em um catálogo só."
      hue={300}
      eyebrow="Pet shop e banho e tosa"
      ctaLabel="Enviar pedido"
      nav={["Catálogo", "Banho e tosa", "Entrega", "Contato"]}
      highlights={[
        { label: "Entrega", value: "no mesmo dia" },
        { label: "Banho e tosa", value: "com hora marcada" },
        { label: "Produtos", value: "marcas premium" },
      ]}
      testimonial={{
        quote: "Monto o pedido da ração pelo site e recebo em casa no mesmo dia.",
        author: "Cliente ilustrativo",
      }}
      info={{
        address: "Rua das Patas, 15 — Lorena/SP",
        hours: "Seg a sáb, 8h às 19h",
        phone: "(12) 90000-0000",
      }}
    >
      <div className="grid lg:grid-cols-[1fr_320px] gap-6 items-start">
        <div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar produto ou serviço..."
              className="w-full rounded-full border border-border bg-background pl-10 pr-4 py-2.5 text-sm outline-none focus:border-foreground/30"
            />
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {CATS.map((c) => (
              <button
                key={c}
                onClick={() => setCat(c)}
                className="px-3.5 py-1.5 rounded-full text-xs border transition"
                style={cat === c ? { background: "var(--demo)", color: "oklch(0.15 0 0)", borderColor: "var(--demo)" } : undefined}
              >
                {c}
              </button>
            ))}
          </div>

          <div className="mt-6 grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {items.map((i) => (
              <DemoCard key={i.id} className="p-5 flex flex-col">
                <div className="h-20 rounded-xl grid place-items-center" style={{ background: "var(--demo-soft)" }}>
                  <PawPrint className="w-6 h-6" style={{ color: "var(--demo)" }} />
                </div>
                <span className="mt-4 text-[10px] uppercase tracking-widest text-muted-foreground">{i.cat}</span>
                <h3 className="mt-1 font-medium flex-1">{i.name}</h3>
                <div className="mt-4 flex items-center justify-between">
                  <span className="font-mono text-sm" style={{ color: "var(--demo)" }}>{brl(i.price)}</span>
                  <button
                    onClick={() => setCart((c) => ({ ...c, [i.id]: (c[i.id] ?? 0) + 1 }))}
                    className="rounded-full px-4 py-1.5 text-xs font-semibold"
                    style={{ background: "var(--demo)", color: "oklch(0.15 0 0)" }}
                  >
                    Adicionar
                  </button>
                </div>
              </DemoCard>
            ))}
          </div>

          {items.length === 0 && (
            <DemoCard className="mt-6 p-10 text-center text-muted-foreground">
              Nada encontrado para essa busca.
            </DemoCard>
          )}
        </div>

        <DemoCard className="p-5 lg:sticky lg:top-20">
          <div className="flex items-center gap-2 font-semibold">
            <ShoppingCart className="w-4 h-4" style={{ color: "var(--demo)" }} /> Carrinho
          </div>
          {lines.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">Seu carrinho está vazio.</p>
          ) : (
            <ul className="mt-4 space-y-3 text-sm">
              {lines.map((l) => (
                <li key={l.item.id} className="flex items-start justify-between gap-3">
                  <span className="text-muted-foreground">
                    {l.qty}× {l.item.name}
                  </span>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-mono">{brl(l.qty * l.item.price)}</span>
                    <button
                      onClick={() => setCart((c) => ({ ...c, [l.item.id]: 0 }))}
                      aria-label={`Remover ${l.item.name}`}
                      className="text-muted-foreground hover:text-destructive transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-5 pt-4 border-t border-border flex justify-between font-semibold">
            <span>Total</span>
            <span className="font-mono" style={{ color: "var(--demo)" }}>{brl(total)}</span>
          </div>
          <DemoWhatsAppButton className="mt-4 w-full" label="Finalizar pedido" />
        </DemoCard>
      </div>
    </DemoShell>
  );
}
