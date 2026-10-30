import { createFileRoute } from "@tanstack/react-router";
import { SiteFrame } from "@/components/site-frame";
import { Contact } from "@/components/site-sections";

export const Route = createFileRoute("/contato")({
  head: () => ({ meta: [
    { title: "Contato | PageCraft" },
    { name: "description", content: "Fale com a PageCraft em Lorena/SP por WhatsApp ou e-mail." },
    { property: "og:title", content: "Contato | PageCraft" },
    { property: "og:description", content: "Fale com a PageCraft em Lorena/SP por WhatsApp ou e-mail." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: Page,
});

function Page() { return <SiteFrame><Contact /></SiteFrame>; }
