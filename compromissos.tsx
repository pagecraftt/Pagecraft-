import { createFileRoute, redirect } from "@tanstack/react-router";
export const Route = createFileRoute("/compromissos")({
  head: () => ({ meta: [
    { title: "Compromissos | PageCraft" },
    { name: "description", content: "Conheça os compromissos da PageCraft com cada projeto." },
    { property: "og:title", content: "Compromissos | PageCraft" },
    { property: "og:description", content: "Conheça os compromissos da PageCraft com cada projeto." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  beforeLoad: () => { throw redirect({ to: "/sobre", hash: "compromissos", statusCode: 301 }); },
});
