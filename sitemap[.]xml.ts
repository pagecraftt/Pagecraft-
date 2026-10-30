import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { PROJECTS } from "@/lib/projects";

const BASE_URL = "https://pagecraft-digital-craft.lovable.app";

interface SitemapEntry {
  path: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const entries: SitemapEntry[] = [
          { path: "/", changefreq: "weekly", priority: "1.0" },
          { path: "/criacao-de-sites-lorena", changefreq: "monthly", priority: "0.9" },
          { path: "/projetos", changefreq: "weekly", priority: "0.8" },
          { path: "/cupons", changefreq: "monthly", priority: "0.6" },
          { path: "/orcamento", changefreq: "monthly", priority: "0.9" },
          { path: "/assistente", changefreq: "monthly", priority: "0.6" },
          { path: "/privacidade", changefreq: "yearly", priority: "0.3" },
          { path: "/termos", changefreq: "yearly", priority: "0.3" },
          ...PROJECTS.map((p) => ({
            path: `/projetos/${p.slug}`,
            changefreq: "monthly" as const,
            priority: "0.7",
          })),
          ...PROJECTS.filter((p) => p.demoPath).map((p) => ({
            path: p.demoPath!,
            changefreq: "monthly" as const,
            priority: "0.6",
          })),
        ];

        const urls = entries.map((e) =>
          [
            `  <url>`,
            `    <loc>${BASE_URL}${e.path}</loc>`,
            e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
            e.priority ? `    <priority>${e.priority}</priority>` : null,
            `  </url>`,
          ]
            .filter(Boolean)
            .join("\n"),
        );

        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...urls,
          `</urlset>`,
        ].join("\n");

        return new Response(xml, {
          headers: { "Content-Type": "application/xml", "Cache-Control": "public, max-age=3600" },
        });
      },
    },
  },
});
