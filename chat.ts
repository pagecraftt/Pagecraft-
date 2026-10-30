import { createFileRoute } from "@tanstack/react-router";
import { streamText, stepCountIs, tool, type ModelMessage } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { z } from "zod";
import { PROJECTS, PROJECT_CATEGORIES } from "@/lib/projects";
import { PRODUCTS } from "@/lib/products";
import { currentOffer } from "@/lib/offers";
import {
  CONTACT,
  SERVICES,
  knowledgeSummary,
  mailtoLink,
  whatsappLink,
} from "@/lib/pagecraft-knowledge";

const SYSTEM_PROMPT = `Você é a Assistente Virtual da PageCraft (PD Craft), estúdio de tecnologia em Lorena, SP.

Diretrizes:
- Fale sempre em português do Brasil, com tom profissional, direto e acolhedor. Seja concisa.
- Use as ferramentas disponíveis antes de responder sobre projetos, pacotes, ofertas, serviços ou contato — nunca invente dados, preços, clientes ou métricas.
- Os pacotes prontos têm preço inicial ("a partir de"). Projetos fora desses pacotes têm orçamento sob medida: colete o necessário (tipo de projeto, objetivo, prazo, referências) e use a ferramenta de briefing.
- Sempre que fizer sentido, cite o cupom do mês vigente (ferramenta de ofertas) e o pacote mais adequado.
- Não é necessário criar conta para conversar: nunca peça login.
- Quando o usuário quiser falar com a equipe, gere o link de contato com a ferramenta e explique o próximo passo.
- Use markdown (listas, negrito, links) para deixar a resposta fácil de ler.

Base de conhecimento verificada:
${knowledgeSummary()}`;

type ChatBody = {
  messages?: Array<{ role: "user" | "assistant" | "system"; content: string }>;
};

const tools = {
  buscar_projetos: tool({
    description:
      "Busca projetos reais publicados no site da PageCraft por texto e/ou categoria. Use sempre que o usuário perguntar sobre portfólio, cases ou exemplos de trabalho.",
    inputSchema: z.object({
      consulta: z.string().nullable().describe("Termo de busca livre, ou null para listar todos"),
      categoria: z
        .enum(PROJECT_CATEGORIES)
        .nullable()
        .describe("Categoria do projeto, ou null para qualquer uma"),
    }),
    execute: async ({ consulta, categoria }) => {
      const q = (consulta ?? "").toLowerCase().trim();
      const found = PROJECTS.filter((p) => {
        const catOk = !categoria || categoria === "Todos" || p.cat === categoria;
        const textOk =
          !q ||
          [p.name, p.desc, p.cat, p.client, p.solution, ...p.tech]
            .join(" ")
            .toLowerCase()
            .includes(q);
        return catOk && textOk;
      }).slice(0, 6);
      return {
        total: found.length,
        projetos: found.map((p) => ({
          nome: p.name,
          categoria: p.cat,
          ano: p.year,
          resumo: p.desc,
          entregas: p.results,
          tecnologias: p.tech,
          url: `/projetos/${p.slug}`,
        })),
      };
    },
  }),
  listar_servicos: tool({
    description:
      "Lista os serviços oferecidos pela PageCraft com entregáveis e prazos típicos. Use ao falar de escopo, prazos ou o que a empresa faz.",
    inputSchema: z.object({
      id: z
        .string()
        .nullable()
        .describe("ID do serviço (sites, landing, sistemas, apps, ia, design) ou null para todos"),
    }),
    execute: async ({ id }) => ({
      servicos: id ? SERVICES.filter((s) => s.id === id) : SERVICES,
    }),
  }),
  montar_briefing: tool({
    description:
      "Organiza o briefing do projeto do usuário em um resumo estruturado para a equipe. Use quando o usuário pedir orçamento ou proposta. Não inclui preço.",
    inputSchema: z.object({
      tipo_de_projeto: z.string().describe("Ex: site institucional, landing page, sistema"),
      objetivo: z.string().describe("O que o cliente quer alcançar"),
      prazo_desejado: z.string().nullable(),
      observacoes: z.string().nullable(),
    }),
    execute: async ({ tipo_de_projeto, objetivo, prazo_desejado, observacoes }) => {
      const resumo = [
        `Tipo: ${tipo_de_projeto}`,
        `Objetivo: ${objetivo}`,
        `Prazo desejado: ${prazo_desejado ?? "a combinar"}`,
        observacoes ? `Observações: ${observacoes}` : null,
      ]
        .filter(Boolean)
        .join("\n");
      return {
        briefing: resumo,
        proximo_passo:
          "A PageCraft responde com escopo, prazo e valor por escrito antes de iniciar.",
        whatsapp: whatsappLink(`Olá! Gostaria de um orçamento.\n\n${resumo}`),
        email: mailtoLink("Orçamento — PageCraft", resumo),
      };
    },
  }),
  gerar_link_contato: tool({
    description:
      "Gera o link de contato direto (WhatsApp ou e-mail) já com a mensagem preenchida.",
    inputSchema: z.object({
      canal: z.enum(["whatsapp", "email"]),
      assunto: z.string(),
      mensagem: z.string(),
    }),
    execute: async ({ canal, assunto, mensagem }) => ({
      canal,
      link:
        canal === "whatsapp" ? whatsappLink(`${assunto}\n\n${mensagem}`) : mailtoLink(assunto, mensagem),
      contato: canal === "whatsapp" ? CONTACT.whatsappDisplay : CONTACT.email,
    }),
  }),
  listar_pacotes: tool({
    description:
      "Lista os pacotes prontos à venda da PageCraft, com preço inicial, prazo e o que está incluso. Use quando o usuário perguntar preços, pacotes ou o que dá para contratar.",
    inputSchema: z.object({
      id: z
        .string()
        .nullable()
        .describe("ID do pacote (site-express, landing-conversao, catalogo-whatsapp, painel-gestao, assistente-ia, identidade-ui) ou null para todos"),
    }),
    execute: async ({ id }) => ({
      pacotes: (id ? PRODUCTS.filter((p) => p.id === id) : PRODUCTS).map((p) => ({
        id: p.id,
        nome: p.nome,
        resumo: p.descricao,
        prazo: p.prazo,
        inclui: p.inclui,
      })),
    }),
  }),
  oferta_do_mes: tool({
    description:
      "Retorna o cupom e o desconto vigentes neste mês. Use quando o usuário perguntar sobre promoções, descontos ou cupons.",
    inputSchema: z.object({}),
    execute: async () => currentOffer(),
  }),
};

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json()) as ChatBody;
        const messages = body.messages;
        if (!Array.isArray(messages) || messages.length === 0) {
          return new Response("Bad Request", { status: 400 });
        }
        const trimmed = messages.slice(-24);
        if (trimmed[trimmed.length - 1]!.role !== "user") {
          return new Response("Last message must be user", { status: 400 });
        }

        const apiKey = process.env["LOVABLE_API_KEY"];
        if (!apiKey) {
          return new Response("Missing LOVABLE_API_KEY", { status: 500 });
        }

        const lovable = createOpenAI({
          baseURL: "https://ai.gateway.lovable.dev/v1",
          apiKey,
          headers: {
            "Lovable-API-Key": apiKey,
            "X-Lovable-AIG-SDK": "vercel-ai-sdk",
          },
        });

        const modelMessages: ModelMessage[] = trimmed
          .filter((m) => m.role !== "system")
          .map((m) => ({ role: m.role, content: m.content }) as ModelMessage);

        const result = streamText({
          model: lovable.responses("openai/gpt-5.6-sol"),
          system: SYSTEM_PROMPT,
          messages: modelMessages,
          tools,
          stopWhen: stepCountIs(50),
          providerOptions: {
            openai: {
              forceReasoning: true,
              reasoningEffort: "low",
              reasoningSummary: "auto",
              store: false,
              include: ["reasoning.encrypted_content"],
            },
          },
        });

        const encoder = new TextEncoder();

        const stream = new ReadableStream<Uint8Array>({
          async start(controller) {
            const send = (obj: unknown) =>
              controller.enqueue(encoder.encode(JSON.stringify(obj) + "\n"));
            try {
              for await (const part of result.fullStream) {
                if (part.type === "text-delta") {
                  send({ t: "text", v: part.text });
                } else if (part.type === "reasoning-delta") {
                  send({ t: "reasoning", v: part.text });
                } else if (part.type === "tool-call") {
                  send({ t: "tool", name: part.toolName, status: "running" });
                } else if (part.type === "tool-result") {
                  send({ t: "tool", name: part.toolName, status: "done", output: part.output });
                } else if (part.type === "error") {
                  send({ t: "error", v: String(part.error) });
                }
              }
              controller.close();
            } catch (err) {
              send({ t: "error", v: err instanceof Error ? err.message : "Erro no stream" });
              controller.close();
            }
          },
        });

        return new Response(stream, {
          headers: {
            "Content-Type": "application/x-ndjson; charset=utf-8",
            "Cache-Control": "no-cache",
          },
        });
      },
    },
  },
});
