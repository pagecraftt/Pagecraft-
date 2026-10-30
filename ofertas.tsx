import { createFileRoute } from "@tanstack/react-router";
import { SiteFrame } from "@/components/site-frame";
import { Offers } from "@/components/site-sections";

export const Route = createFileRoute("/ofertas")({
  head: () => ({ meta: [
    { title: "Ofertas | PageCraft" },
    { name: "description", content: "Confira as ofertas e cupons mensais da PageCraft." },
    { property: "og:title", content: "Ofertas | PageCraft" },
    { property: "og:description", content: "Confira as ofertas e cupons mensais da PageCraft." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: Page,
});

function Page() { return <SiteFrame><Offers /></SiteFrame>; }
