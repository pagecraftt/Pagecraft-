import { createFileRoute, redirect } from "@tanstack/react-router";
export const Route = createFileRoute("/feedback")({
  head: () => ({ meta: [
    { title: "Feedback | PageCraft" },
    { name: "description", content: "Leia e compartilhe experiências com a PageCraft." },
    { property: "og:title", content: "Feedback | PageCraft" },
    { property: "og:description", content: "Leia e compartilhe experiências com a PageCraft." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  beforeLoad: () => { throw redirect({ to: "/sobre", hash: "feedback", statusCode: 301 }); },
});
