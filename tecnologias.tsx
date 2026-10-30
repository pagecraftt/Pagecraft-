import { createFileRoute, redirect } from "@tanstack/react-router";
export const Route = createFileRoute("/tecnologias")({
  head: () => ({ meta: [
    { title: "Tecnologias | PageCraft" },
    { name: "description", content: "Conheça as tecnologias utilizadas pela PageCraft." },
    { property: "og:title", content: "Tecnologias | PageCraft" },
    { property: "og:description", content: "Conheça as tecnologias utilizadas pela PageCraft." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  beforeLoad: () => { throw redirect({ to: "/sobre", hash: "tecnologias", statusCode: 301 }); },
});
