import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/privacidade")({
  head: () => ({
    meta: [
      { title: "Política de Privacidade | PageCraft" },
      { name: "description", content: "Como a PageCraft coleta, usa e protege seus dados pessoais em conformidade com a LGPD (Lei nº 13.709/2018)." },
      { property: "og:title", content: "Política de Privacidade | PageCraft" },
      { property: "og:description", content: "Como a PageCraft trata seus dados pessoais em conformidade com a LGPD." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-clip">
      <div className="mx-auto max-w-3xl px-4 py-16 md:py-24">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition">
          <ArrowLeft className="w-4 h-4" /> Voltar ao site
        </Link>
        <h1 className="mt-6 text-3xl md:text-5xl font-bold tracking-tight">
          Política de <span className="text-gradient-green">Privacidade</span>
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">Última atualização: 20 de outubro de 2026</p>

        <div className="prose prose-invert mt-10 space-y-8 text-muted-foreground leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-foreground">1. Identificação da Empresa</h2>
            <p className="mt-2">
              Este site é operado pela <strong className="text-foreground">PageCraft (PD Craft)</strong>, estúdio de tecnologia
              sediado em Lorena, SP, Brasil. Contato: <a href="mailto:page.craftt@gmail.com" className="text-primary hover:underline">page.craftt@gmail.com</a> ·
              WhatsApp <a href="https://wa.me/5512991881061" className="text-primary hover:underline">+55 (12) 99188-1061</a>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">2. Dados que coletamos</h2>
            <p className="mt-2">Coletamos apenas os dados necessários para responder solicitações e melhorar a experiência:</p>
            <ul className="mt-2 list-disc pl-6 space-y-1">
              <li>Dados fornecidos por você em formulários (nome, e-mail, telefone, mensagem, arquivos anexados).</li>
              <li>Dados de autenticação, quando você cria uma conta na área do cliente (e-mail e provedor de login).</li>
              <li>Dados de pedidos e pagamentos; os dados completos do cartão são tratados pela Stripe, não pela PageCraft.</li>
              <li>Dados técnicos necessários para segurança e funcionamento do serviço.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">3. Finalidade do tratamento</h2>
            <ul className="mt-2 list-disc pl-6 space-y-1">
              <li>Responder orçamentos, dúvidas e prestar os serviços contratados.</li>
              <li>Operar a Assistente IA e manter o histórico das suas conversas.</li>
              <li>Cumprir obrigações legais, contratuais e de segurança.</li>
              <li>Analisar métricas agregadas para melhorar o site.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">4. Base legal (LGPD)</h2>
            <p className="mt-2">
              Tratamos dados com base no consentimento (art. 7º, I), execução de contrato (art. 7º, V),
              cumprimento de obrigação legal (art. 7º, II) e legítimo interesse (art. 7º, IX) da Lei nº 13.709/2018.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">5. Compartilhamento</h2>
            <p className="mt-2">
              Não vendemos seus dados. Podemos compartilhá-los com provedores essenciais para operar o serviço
              (hospedagem, autenticação e infraestrutura de IA), sob acordos de confidencialidade e apenas
              na medida necessária.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">6. Cookies</h2>
            <p className="mt-2">
              Utilizamos armazenamento essencial para sessão, segurança e sua escolha de privacidade.
              Cookies opcionais de análise não são autorizados antes do aceite e permanecem desativados
              em caso de recusa. Atualmente, não instalamos ferramentas próprias de análise opcionais.
              Você pode mudar sua escolha em “Preferências de cookies” no rodapé do site, sem perder sua conta.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">7. Armazenamento e segurança</h2>
            <p className="mt-2">
              Os dados são armazenados em provedores em nuvem com criptografia em trânsito e em repouso.
              Mantemos os dados apenas pelo tempo necessário às finalidades declaradas ou exigido por lei.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">8. Seus direitos</h2>
            <p className="mt-2">Você pode solicitar a qualquer momento:</p>
            <ul className="mt-2 list-disc pl-6 space-y-1">
              <li>Confirmação e acesso aos seus dados.</li>
              <li>Correção de dados incompletos ou desatualizados.</li>
              <li>Anonimização, bloqueio ou eliminação.</li>
              <li>Portabilidade e revogação do consentimento.</li>
            </ul>
            <p className="mt-2">
              Basta enviar sua solicitação para <a href="mailto:page.craftt@gmail.com" className="text-primary hover:underline">page.craftt@gmail.com</a>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">9. Alterações</h2>
            <p className="mt-2">
              Esta política pode ser atualizada. Publicaremos qualquer alteração nesta página com a nova data de vigência.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}