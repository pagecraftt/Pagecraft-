import { createFileRoute, redirect } from "@tanstack/react-router";
export const Route = createFileRoute("/blog")({
  head: () => ({ meta: [
    { title: "Blog de tecnologia | PageCraft" },
    { name: "description", content: "Insights sobre programação, tecnologia, aplicativos e negócios." },
    { property: "og:title", content: "Blog de tecnologia | PageCraft" },
    { property: "og:description", content: "Insights sobre programação, tecnologia, aplicativos e negócios." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  beforeLoad: () => { throw redirect({ to: "/sobre", hash: "blog", statusCode: 301 }); },
});
