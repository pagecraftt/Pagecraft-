import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/termos")({
  head: () => ({
    meta: [
      { title: "Termos de Uso | PageCraft" },
      { name: "description", content: "Regras de uso do site e dos serviços prestados pela PageCraft (PD Craft)." },
      { property: "og:title", content: "Termos de Uso | PageCraft" },
      { property: "og:description", content: "Regras de uso do site e dos serviços da PageCraft." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-clip">
      <div className="mx-auto max-w-3xl px-4 py-16 md:py-24">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition">
          <ArrowLeft className="w-4 h-4" /> Voltar ao site
        </Link>
        <h1 className="mt-6 text-3xl md:text-5xl font-bold tracking-tight">
          Termos de <span className="text-gradient-green">Uso</span>
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">Última atualização: 23 de julho de 2026</p>

        <div className="mt-10 space-y-8 text-muted-foreground leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-foreground">1. Aceitação</h2>
            <p className="mt-2">
              Ao acessar e utilizar este site, você concorda com estes Termos de Uso e com a nossa{" "}
              <Link to="/privacidade" className="text-primary hover:underline">Política de Privacidade</Link>.
              Se não concordar, por favor, não utilize o site.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">2. Sobre a PageCraft</h2>
            <p className="mt-2">
              A <strong className="text-foreground">PageCraft (PD Craft)</strong> é um estúdio de tecnologia sediado em
              Lorena, SP, Brasil, que desenvolve sites, sistemas e aplicativos sob demanda. Contato:{" "}
              <a href="mailto:page.craftt@gmail.com" className="text-primary hover:underline">page.craftt@gmail.com</a>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">3. Uso adequado</h2>
            <ul className="mt-2 list-disc pl-6 space-y-1">
              <li>É proibido usar o site para atividades ilegais, ofensivas ou que violem direitos de terceiros.</li>
              <li>É proibido tentar burlar mecanismos de segurança, extrair dados em massa ou introduzir código malicioso.</li>
              <li>Você é responsável pelas informações que envia por formulários e pela veracidade delas.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">4. Propriedade intelectual</h2>
            <p className="mt-2">
              Todo o conteúdo deste site (marca, textos, layout, código e imagens) pertence à PageCraft ou
              a seus licenciadores, protegido pelas leis de direitos autorais e propriedade intelectual.
              Reprodução total ou parcial sem autorização é proibida.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">5. Serviços contratados</h2>
            <p className="mt-2">
              Prazos, escopo, valores e condições de pagamento de cada projeto são definidos em proposta
              comercial específica assinada entre as partes, que prevalece sobre estes termos gerais.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">6. Direito de arrependimento</h2>
            <p className="mt-2">
              Em compras online realizadas por consumidores (CDC, art. 49), aplica-se o prazo de 7 dias
              corridos para arrependimento, contados do recebimento do produto ou da contratação do serviço.
              Solicitações devem ser enviadas para{" "}
              <a href="mailto:page.craftt@gmail.com" className="text-primary hover:underline">page.craftt@gmail.com</a>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">7. Assistente IA</h2>
            <p className="mt-2">
              A assistente virtual utiliza modelos de linguagem e pode gerar respostas imprecisas.
              As informações não substituem orientação profissional. Não envie dados sensíveis pelo chat.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">8. Limitação de responsabilidade</h2>
            <p className="mt-2">
              O site é fornecido "no estado em que se encontra". Nos esforçamos para manter o serviço
              disponível e seguro, mas não garantimos ausência total de erros ou interrupções.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">9. Alterações e foro</h2>
            <p className="mt-2">
              Podemos atualizar estes termos a qualquer momento. Fica eleito o foro da Comarca de Lorena/SP
              para dirimir eventuais controvérsias, com renúncia a qualquer outro, por mais privilegiado que seja.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}