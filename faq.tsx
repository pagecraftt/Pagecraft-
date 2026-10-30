import { createFileRoute, redirect } from "@tanstack/react-router";
export const Route = createFileRoute("/faq")({
  head: () => ({ meta: [
    { title: "Perguntas frequentes | PageCraft" },
    { name: "description", content: "Tire suas dúvidas sobre os serviços da PageCraft." },
    { property: "og:title", content: "Perguntas frequentes | PageCraft" },
    { property: "og:description", content: "Tire suas dúvidas sobre os serviços da PageCraft." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  beforeLoad: () => { throw redirect({ to: "/sobre", hash: "faq", statusCode: 301 }); },
});
