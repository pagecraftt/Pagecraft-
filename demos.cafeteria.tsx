import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Coffee, Minus, Plus, ShoppingBag } from "lucide-react";
import { DemoCard, DemoShell, DemoWhatsAppButton } from "@/components/demo/DemoShell";

export const Route = createFileRoute("/demos/cafeteria")({
  head: () => ({
    meta: [
      { title: "Cafeteria Aurora — demonstração PageCraft" },
      {
        name: "description",
        content:
          "Demonstração interativa de cardápio digital com carrinho e pedido automático, criada pela PageCraft.",
      },
      { property: "og:title", content: "Cafeteria Aurora — demonstração PageCraft" },
      {
        property: "og:description",
        content: "Cardápio digital navegável com carrinho e resumo de pedido.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CafeteriaDemo,
});

const MENU = [
  { id: "c1", cat: "Cafés", name: "Espresso duplo", desc: "Grãos torra média, 60ml", price: 9 },
  { id: "c2", cat: "Cafés", name: "Latte de baunilha", desc: "Leite vaporizado e xarope", price: 14 },
  { id: "c3", cat: "Cafés", name: "Cold brew", desc: "24h de extração a frio", price: 16 },
  { id: "d1", cat: "Doces", name: "Cookie de chocolate", desc: "Recheio meio amargo", price: 11 },
  { id: "d2", cat: "Doces", name: "Cheesecake de frutas", desc: "Fatia individual", price: 18 },
  { id: "s1", cat: "Salgados", name: "Croissant de queijo", desc: "Massa folhada na hora", price: 13 },
  { id: "s2", cat: "Salgados", name: "Tostex caprese", desc: "Mussarela, tomate e manjericão", price: 19 },
  { id: "b1", cat: "Bebidas", name: "Chá gelado de hibisco", desc: "Sem açúcar, 400ml", price: 12 },
];

const CATS = ["Todos", "Cafés", "Doces", "Salgados", "Bebidas"];

const brl = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

function CafeteriaDemo() {
  const [cat, setCat] = useState("Todos");
  const [cart, setCart] = useState<Record<string, number>>({});

  const items = MENU.filter((m) => cat === "Todos" || m.cat === cat);
  const lines = useMemo(
    () =>
      Object.entries(cart)
        .filter(([, q]) => q > 0)
        .map(([id, q]) => ({ item: MENU.find((m) => m.id === id)!, qty: q })),
    [cart],
  );
  const total = lines.reduce((s, l) => s + l.item.price * l.qty, 0);

  const add = (id: string, delta: number) =>
    setCart((c) => ({ ...c, [id]: Math.max(0, (c[id] ?? 0) + delta) }));

  return (
    <DemoShell
      title="Cafeteria Aurora"
      tagline="Café de origem, doces da casa e pedido montado em segundos."
      hue={60}
      eyebrow="Cafeteria artesanal · Lorena/SP"
      ctaLabel="Fazer pedido"
      nav={["Cardápio", "Nossa casa", "Encomendas", "Contato"]}
      highlights={[
        { label: "Grãos", value: "Torra própria" },
        { label: "Retirada", value: "em 15 minutos" },
        { label: "Entrega", value: "centro e bairros" },
      ]}
      testimonial={{
        quote: "Peço quase toda manhã. O cardápio online é simples e o café chega quentinho.",
        author: "Cliente ilustrativo",
      }}
      info={{
        address: "Rua do Café, 42 — Centro, Lorena/SP",
        hours: "Seg a sáb, 7h às 20h",
        phone: "(12) 90000-0000",
      }}
    >
      <div className="grid lg:grid-cols-[1fr_320px] gap-6 items-start">
        <div>
          <div className="flex flex-wrap gap-2">
            {CATS.map((c) => (
              <button
                key={c}
                onClick={() => setCat(c)}
                className="px-3.5 py-1.5 rounded-full text-xs font-medium border transition"
                style={
                  cat === c
                    ? { background: "var(--demo)", color: "oklch(0.15 0 0)", borderColor: "var(--demo)" }
                    : undefined
                }
              >
                {c}
              </button>
            ))}
          </div>

          <div className="mt-6 grid sm:grid-cols-2 gap-4">
            {items.map((m) => (
              <DemoCard key={m.id} className="p-5 flex flex-col">
                <div
                  className="h-24 rounded-xl mb-4 grid place-items-center"
                  style={{ background: "var(--demo-soft)" }}
                >
                  <Coffee className="w-7 h-7" style={{ color: "var(--demo)" }} />
                </div>
                <h3 className="font-semibold">{m.name}</h3>
                <p className="text-sm text-muted-foreground mt-1 flex-1">{m.desc}</p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="font-mono text-sm" style={{ color: "var(--demo)" }}>
                    {brl(m.price)}
                  </span>
                  {cart[m.id] ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => add(m.id, -1)}
                        className="w-8 h-8 grid place-items-center rounded-full border border-border hover:bg-muted transition"
                        aria-label={`Remover um ${m.name}`}
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-5 text-center text-sm">{cart[m.id]}</span>
                      <button
                        onClick={() => add(m.id, 1)}
                        className="w-8 h-8 grid place-items-center rounded-full border border-border hover:bg-muted transition"
                        aria-label={`Adicionar um ${m.name}`}
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => add(m.id, 1)}
                      className="rounded-full px-4 py-1.5 text-xs font-semibold"
                      style={{ background: "var(--demo)", color: "oklch(0.15 0 0)" }}
                    >
                      Adicionar
                    </button>
                  )}
                </div>
              </DemoCard>
            ))}
          </div>
        </div>

        <DemoCard className="p-5 lg:sticky lg:top-20">
          <div className="flex items-center gap-2 font-semibold">
            <ShoppingBag className="w-4 h-4" style={{ color: "var(--demo)" }} /> Seu pedido
          </div>
          {lines.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">
              Nenhum item ainda. Escolha algo do cardápio.
            </p>
          ) : (
            <ul className="mt-4 space-y-2 text-sm">
              {lines.map((l) => (
                <li key={l.item.id} className="flex justify-between gap-3">
                  <span className="text-muted-foreground">
                    {l.qty}× {l.item.name}
                  </span>
                  <span className="font-mono">{brl(l.qty * l.item.price)}</span>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-5 pt-4 border-t border-border flex justify-between font-semibold">
            <span>Total</span>
            <span className="font-mono" style={{ color: "var(--demo)" }}>
              {brl(total)}
            </span>
          </div>
          <DemoWhatsAppButton className="mt-4 w-full" label="Enviar pedido" />
        </DemoCard>
      </div>
    </DemoShell>
  );
}
