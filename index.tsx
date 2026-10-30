import { createFileRoute } from "@tanstack/react-router";
import { SiteFrame } from "@/components/site-frame";
import { Hero, Services } from "@/components/site-sections";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Criação de Sites e Sistemas | PageCraft — Lorena/SP" },
      { name: "description", content: "Empresa que cria sites profissionais, landing pages, sistemas e aplicativos sob medida. Programador em Lorena/SP com atendimento direto e orçamento sem compromisso." },
      { property: "og:title", content: "Criação de Sites e Sistemas | PageCraft — Lorena/SP" },
      { property: "og:description", content: "Empresa de criação de sites, sistemas e aplicativos sob medida em Lorena/SP. Fale direto com quem desenvolve." },
      { property: "og:url", content: "https://pagecraft-digital-craft.lovable.app/" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://pagecraft-digital-craft.lovable.app/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "ProfessionalService",
          name: "PageCraft",
          description:
            "Empresa de criação de sites, landing pages, sistemas web e aplicativos sob medida em Lorena/SP.",
          url: "https://pagecraft-digital-craft.lovable.app/",
          telephone: "+55-12-99188-1061",
          email: "page.craftt@gmail.com",
          image: "https://pagecraft-digital-craft.lovable.app/favicon.png",
          priceRange: "$$",
          address: {
            "@type": "PostalAddress",
            addressLocality: "Lorena",
            addressRegion: "SP",
            addressCountry: "BR",
          },
          areaServed: [
            { "@type": "City", name: "Lorena" },
            { "@type": "City", name: "Guaratinguetá" },
            { "@type": "City", name: "Cachoeira Paulista" },
            { "@type": "AdministrativeArea", name: "Vale do Paraíba" },
          ],
          hasOfferCatalog: {
            "@type": "OfferCatalog",
            name: "Serviços PageCraft",
            itemListElement: [
              "Criação de sites institucionais",
              "Landing pages de conversão",
              "Sistemas e painéis web",
              "Aplicativos e PWAs",
              "Integrações com IA e automações",
              "Identidade visual e UI",
            ].map((s) => ({
              "@type": "Offer",
              itemOffered: { "@type": "Service", name: s },
            })),
          },
        }),
      },
    ],
  }),
  component: Index,
});

function Index() {
  return <SiteFrame home><Hero /><Services /></SiteFrame>;
}
