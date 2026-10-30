import { createFileRoute } from "@tanstack/react-router";
import { SiteFrame } from "@/components/site-frame";
import { Products } from "@/components/site-sections";

export const Route = createFileRoute("/pacotes")({
  head: () => ({ meta: [
    { title: "Pacotes | PageCraft" },
    { name: "description", content: "Conheça as soluções com escopo definido da PageCraft." },
    { property: "og:title", content: "Pacotes | PageCraft" },
    { property: "og:description", content: "Conheça as soluções com escopo definido da PageCraft." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: Page,
});

function Page() { return <SiteFrame><Products /></SiteFrame>; }
