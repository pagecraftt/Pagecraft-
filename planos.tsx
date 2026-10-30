import { createFileRoute } from "@tanstack/react-router";
import { SiteFrame } from "@/components/site-frame";
import { PlanosMarketing } from "@/components/PlanosMarketing";

export const Route = createFileRoute("/planos")({
  head: () => ({ meta: [
    { title: "Planos de marketing e desenvolvimento | PageCraft" },
    { name: "description", content: "Compare os planos Dia Marcado e Site Mais+ da PageCraft." },
    { property: "og:title", content: "Planos de marketing e desenvolvimento | PageCraft" },
    { property: "og:description", content: "Compare os planos Dia Marcado e Site Mais+ da PageCraft." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: Page,
});

function Page() { return <SiteFrame><PlanosMarketing /></SiteFrame>; }
