import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Loader2, Sparkles, Brain, Wrench } from "lucide-react";
import {
  getThread,
  newThreadId,
  upsertThread,
  type StoredMsg,
} from "@/lib/chat-store";

export const Route = createFileRoute("/assistente/$threadId")({
  ssr: false,
  head: () => ({ meta: [
    { title: "Sua conversa | Assistente PageCraft" },
    { name: "description", content: "Sua conversa com a assistente PageCraft sobre tecnologia e projetos digitais." },
    { property: "og:title", content: "Sua conversa | Assistente PageCraft" },
    { property: "og:description", content: "Converse sobre o seu próximo projeto com a PageCraft." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
    { name: "robots", content: "noindex" },
  ] }),
  component: ChatWindow,
});

const SUGGESTIONS = [
  "Quais pacotes vocês vendem e quanto custam?",
  "Tem algum cupom de desconto este mês?",
  "Quero um site para a minha loja. Como funciona?",
  "Me mostra projetos que vocês já entregaram.",
];

const TOOL_LABELS: Record<string, string> = {
  buscar_projetos: "Buscando projetos",
  listar_servicos: "Consultando serviços",
  montar_briefing: "Montando briefing",
  gerar_link_contato: "Gerando link de contato",
  listar_pacotes: "Consultando pacotes",
  oferta_do_mes: "Verificando ofertas",
};

function ChatWindow() {
  const { threadId } = Route.useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<StoredMsg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [streamText, setStreamText] = useState("");
  const [streamReasoning, setStreamReasoning] = useState("");
  const [tools, setTools] = useState<{ name: string; status: string }[]>([]);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const t = getThread(threadId);
    setMessages(t?.messages ?? []);
    setStreamText("");
    setStreamReasoning("");
    setTools([]);
    inputRef.current?.focus();
  }, [threadId]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamText, streamReasoning]);

  const send = async (text: string) => {
    const content = text.trim();
    if (!content || loading) return;

    const userMsg: StoredMsg = { id: newThreadId(), role: "user", content };
    const next = [...messages, userMsg];
    setMessages(next);
    upsertThread(threadId, next);
    setInput("");
    setLoading(true);
    setStreamText("");
    setStreamReasoning("");
    setTools([]);

    let acc = "";
    let reasoning = "";

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: next.map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      if (!res.ok || !res.body) throw new Error(await res.text());

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.trim()) continue;
          const evt = JSON.parse(line) as {
            t: string;
            v?: string;
            name?: string;
            status?: string;
          };
          if (evt.t === "text") {
            acc += evt.v ?? "";
            setStreamText(acc);
          } else if (evt.t === "reasoning") {
            reasoning += evt.v ?? "";
            setStreamReasoning(reasoning);
          } else if (evt.t === "tool") {
            setTools((prev) => {
              const others = prev.filter((p) => p.name !== evt.name);
              return [...others, { name: evt.name!, status: evt.status! }];
            });
          } else if (evt.t === "error") {
            throw new Error(evt.v);
          }
        }
      }

      const assistantMsg: StoredMsg = {
        id: newThreadId(),
        role: "assistant",
        content: acc || "Não consegui gerar uma resposta agora. Pode tentar de novo?",
        ...(reasoning ? { reasoning } : {}),
      };
      const finalMsgs = [...next, assistantMsg];
      setMessages(finalMsgs);
      upsertThread(threadId, finalMsgs);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro desconhecido";
      const errorMsgs: StoredMsg[] = [
        ...next,
        {
          id: newThreadId(),
          role: "assistant",
          content: `Tive um problema para responder: ${msg}\n\nSe continuar, fale direto pelo WhatsApp **+55 (12) 99188-1061**.`,
        },
      ];
      setMessages(errorMsgs);
      upsertThread(threadId, errorMsgs);
    } finally {
      setLoading(false);
      setStreamText("");
      setStreamReasoning("");
      setTools([]);
      inputRef.current?.focus();
    }
  };

  useEffect(() => {
    if (!getThread(threadId)) {
      upsertThread(threadId, []);
      void navigate({ to: "/assistente/$threadId", params: { threadId }, replace: true });
    }
  }, [threadId, navigate]);

  const empty = messages.length === 0 && !loading;

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="mx-auto max-w-3xl space-y-6">
          {empty && (
            <div className="py-10 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <h1 className="text-xl font-semibold">Como posso ajudar?</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Pergunte sobre pacotes, prazos, cupons ou peça um orçamento. Sem cadastro.
              </p>
              <div className="mx-auto mt-6 grid max-w-xl gap-2 sm:grid-cols-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => void send(s)}
                    className="rounded-xl border border-border bg-card p-3 text-left text-sm transition-colors hover:border-primary/50 hover:bg-accent"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((m) => (
            <div key={m.id} className={m.role === "user" ? "flex justify-end" : ""}>
              {m.role === "user" ? (
                <div className="max-w-[85%] rounded-2xl rounded-br-sm bg-primary px-4 py-2.5 text-sm text-primary-foreground">
                  {m.content}
                </div>
              ) : (
                <div className="max-w-[95%] space-y-2">
                  {m.reasoning && (
                    <details className="rounded-lg border border-border bg-card/60 px-3 py-2 text-xs text-muted-foreground">
                      <summary className="cursor-pointer select-none">
                        <Brain className="mr-1 inline h-3 w-3" /> Raciocínio
                      </summary>
                      <p className="mt-2 whitespace-pre-wrap">{m.reasoning}</p>
                    </details>
                  )}
                  <div className="max-w-none text-sm leading-relaxed space-y-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:mt-1 [&_a]:text-primary [&_a]:underline [&_strong]:text-foreground [&_code]:rounded [&_code]:bg-white/10 [&_code]:px-1">
                    <ReactMarkdown>{m.content}</ReactMarkdown>
                  </div>
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="space-y-2">
              {tools.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tools.map((t) => (
                    <span
                      key={t.name}
                      className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-1 text-xs text-muted-foreground"
                    >
                      {t.status === "running" ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Wrench className="h-3 w-3 text-primary" />
                      )}
                      {TOOL_LABELS[t.name] ?? t.name}
                    </span>
                  ))}
                </div>
              )}
              {streamReasoning && !streamText && (
                <p className="whitespace-pre-wrap text-xs text-muted-foreground">
                  <Brain className="mr-1 inline h-3 w-3" />
                  {streamReasoning.slice(-400)}
                </p>
              )}
              {streamText ? (
                <div className="max-w-none text-sm leading-relaxed space-y-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:mt-1 [&_a]:text-primary [&_a]:underline [&_strong]:text-foreground [&_code]:rounded [&_code]:bg-white/10 [&_code]:px-1">
                  <ReactMarkdown>{streamText}</ReactMarkdown>
                </div>
              ) : (
                !streamReasoning && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" /> Pensando…
                  </div>
                )
              )}
            </div>
          )}
          <div ref={endRef} />
        </div>
      </div>

      <div className="border-t border-border bg-card/50 p-4">
        <form
          className="mx-auto flex max-w-3xl items-end gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            void send(input);
          }}
        >
          <Textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void send(input);
              }
            }}
            placeholder="Escreva sua mensagem…"
            rows={1}
            className="max-h-40 min-h-[44px] resize-none"
          />
          <Button type="submit" size="icon" disabled={loading || !input.trim()}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </form>
        <p className="mx-auto mt-2 max-w-3xl text-center text-[11px] text-muted-foreground">
          A assistente pode errar. Confirme prazos e valores pelo WhatsApp.
        </p>
      </div>
    </div>
  );
}