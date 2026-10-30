import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { createThread, loadThreads } from "@/lib/chat-store";

export const Route = createFileRoute("/assistente/")({
  ssr: false,
  head: () => ({ meta: [
    { title: "Assistente virtual | PageCraft" },
    { name: "description", content: "Converse com a assistente PageCraft sobre serviços, projetos e orçamentos." },
    { property: "og:title", content: "Assistente virtual | PageCraft" },
    { property: "og:description", content: "Atendimento virtual para o seu projeto digital." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: AssistantIndex,
});

function AssistantIndex() {
  const navigate = useNavigate();

  useEffect(() => {
    const existing = loadThreads();
    const thread = existing[0] ?? createThread();
    void navigate({
      to: "/assistente/$threadId",
      params: { threadId: thread.id },
      replace: true,
    });
  }, [navigate]);

  return (
    <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
      Abrindo sua conversa…
    </div>
  );
}