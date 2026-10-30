import { createFileRoute } from "@tanstack/react-router";
import { SiteFrame } from "@/components/site-frame";
import { About, Technologies, Process, Differentials, Commitments, Feedback, FAQ, Blog } from "@/components/site-sections";

export const Route = createFileRoute("/sobre")({
  head: () => ({ meta: [
    { title: "Sobre a PageCraft | PageCraft" },
    { name: "description", content: "Conheça a PageCraft: história, tecnologias, processo de trabalho, diferenciais, compromissos e experiências dos clientes." },
    { property: "og:title", content: "Sobre a PageCraft | PageCraft" },
    { property: "og:description", content: "Tudo sobre a PageCraft: estúdio, tecnologias, processo, compromissos, feedback e perguntas frequentes." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: Page,
});

function Page() {
  return <SiteFrame>
    <About />
    <Technologies />
    <Process />
    <Differentials />
    <Commitments />
    <Feedback />
    <FAQ />
    <Blog />
  </SiteFrame>;
}
