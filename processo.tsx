import { createFileRoute, redirect } from "@tanstack/react-router";
export const Route = createFileRoute("/processo")({
  head: () => ({ meta: [
    { title: "Processo de desenvolvimento | PageCraft" },
    { name: "description", content: "Conheça as etapas de desenvolvimento dos projetos PageCraft." },
    { property: "og:title", content: "Processo de desenvolvimento | PageCraft" },
    { property: "og:description", content: "Conheça as etapas de desenvolvimento dos projetos PageCraft." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  beforeLoad: () => { throw redirect({ to: "/sobre", hash: "processo", statusCode: 301 }); },
});
