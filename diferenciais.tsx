import { createFileRoute, redirect } from "@tanstack/react-router";
export const Route = createFileRoute("/diferenciais")({
  head: () => ({ meta: [
    { title: "Diferenciais | PageCraft" },
    { name: "description", content: "Conheça os diferenciais de desenvolvimento da PageCraft." },
    { property: "og:title", content: "Diferenciais | PageCraft" },
    { property: "og:description", content: "Conheça os diferenciais de desenvolvimento da PageCraft." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  beforeLoad: () => { throw redirect({ to: "/sobre", hash: "sobre", statusCode: 301 }); },
});
