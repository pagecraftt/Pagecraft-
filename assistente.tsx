import { createFileRoute, Link, Outlet, useNavigate, useParams } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, MessageSquare, Home } from "lucide-react";
import logoMark from "@/assets/pagecraft-mark.png";
import {
  createThread,
  loadThreads,
  removeThread,
  type StoredThread,
} from "@/lib/chat-store";

export const Route = createFileRoute("/assistente")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Assistente IA — PageCraft" },
      {
        name: "description",
        content:
          "Converse gratuitamente com a assistente virtual da PageCraft sobre pacotes, prazos, cupons e orçamentos. Sem cadastro.",
      },
      { property: "og:title", content: "Assistente IA — PageCraft" },
      {
        property: "og:description",
        content: "Tire dúvidas sobre sites, sistemas e aplicativos com a assistente da PageCraft.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AssistantLayout,
});

function AssistantLayout() {
  const [threads, setThreads] = useState<StoredThread[]>([]);
  const navigate = useNavigate();
  const params = useParams({ strict: false }) as { threadId?: string };
  const activeId = params.threadId;

  const refresh = useCallback(() => setThreads(loadThreads()), []);

  useEffect(() => {
    refresh();
    window.addEventListener("pc-threads-changed", refresh);
    return () => window.removeEventListener("pc-threads-changed", refresh);
  }, [refresh]);

  const handleNew = () => {
    const t = createThread();
    refresh();
    navigate({ to: "/assistente/$threadId", params: { threadId: t.id } });
  };

  const handleDelete = (id: string) => {
    removeThread(id);
    refresh();
    if (activeId === id) navigate({ to: "/assistente" });
  };

  return (
    <div className="flex h-screen bg-background text-foreground">
      <aside className="hidden w-72 flex-col border-r border-border bg-card md:flex">
        <div className="border-b border-border p-4">
          <Link
            to="/"
            className="mb-4 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <Home className="h-4 w-4" /> Voltar ao site
          </Link>
          <div className="mb-4 flex items-center gap-2">
            <img src={logoMark} alt="PageCraft" className="h-8 w-8 rounded-lg object-cover" />
            <div>
              <div className="text-sm font-semibold">Assistente PageCraft</div>
              <div className="text-xs text-muted-foreground">Sem cadastro · grátis</div>
            </div>
          </div>
          <Button onClick={handleNew} className="w-full" size="sm">
            <Plus className="mr-2 h-4 w-4" /> Nova conversa
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {threads.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-muted-foreground">
              Nenhuma conversa ainda. Clique em “Nova conversa” para começar.
            </p>
          ) : (
            <ul className="space-y-1">
              {threads.map((t) => (
                <li
                  key={t.id}
                  className={`group flex items-center gap-2 rounded-md px-2 transition-colors ${
                    activeId === t.id ? "bg-primary/10 text-primary" : "hover:bg-accent"
                  }`}
                >
                  <Link
                    to="/assistente/$threadId"
                    params={{ threadId: t.id }}
                    className="flex min-w-0 flex-1 items-center gap-2 py-2 text-sm"
                  >
                    <MessageSquare className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">{t.title}</span>
                  </Link>
                  <button
                    onClick={() => handleDelete(t.id)}
                    className="opacity-0 transition-opacity group-hover:opacity-100 hover:text-destructive"
                    aria-label="Excluir conversa"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <p className="border-t border-border p-3 text-[11px] text-muted-foreground">
          As conversas ficam salvas apenas neste navegador.
        </p>
      </aside>

      <main className="flex flex-1 flex-col overflow-hidden">
        <div className="flex items-center justify-between border-b border-border p-3 md:hidden">
          <Link to="/" className="flex items-center gap-2 text-sm text-muted-foreground">
            <Home className="h-4 w-4" /> Site
          </Link>
          <Button onClick={handleNew} size="sm" variant="outline">
            <Plus className="mr-1.5 h-4 w-4" /> Nova
          </Button>
        </div>
        <Outlet />
      </main>
    </div>
  );
}