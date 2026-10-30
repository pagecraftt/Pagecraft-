export type StoredMsg = {
  id: string;
  role: "user" | "assistant";
  content: string;
  reasoning?: string;
};

export type StoredThread = {
  id: string;
  title: string;
  updatedAt: number;
  messages: StoredMsg[];
};

const KEY = "pc-assistente-threads";

function canUse() {
  return typeof window !== "undefined";
}

export function loadThreads(): StoredThread[] {
  if (!canUse()) return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as StoredThread[];
    return Array.isArray(parsed) ? parsed.sort((a, b) => b.updatedAt - a.updatedAt) : [];
  } catch {
    return [];
  }
}

export function saveThreads(threads: StoredThread[]) {
  if (!canUse()) return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(threads));
    window.dispatchEvent(new CustomEvent("pc-threads-changed"));
  } catch {
    /* storage cheio ou bloqueado */
  }
}

export function newThreadId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);
}

export function createThread(): StoredThread {
  const thread: StoredThread = {
    id: newThreadId(),
    title: "Nova conversa",
    updatedAt: Date.now(),
    messages: [],
  };
  saveThreads([thread, ...loadThreads()]);
  return thread;
}

export function getThread(id: string): StoredThread | undefined {
  return loadThreads().find((t) => t.id === id);
}

export function upsertThread(id: string, messages: StoredMsg[]) {
  const threads = loadThreads();
  const idx = threads.findIndex((t) => t.id === id);
  const firstUser = messages.find((m) => m.role === "user");
  const title = firstUser ? firstUser.content.slice(0, 60).trim() : "Nova conversa";
  const base: StoredThread = { id, title, updatedAt: Date.now(), messages };
  if (idx >= 0) threads[idx] = { ...threads[idx]!, ...base };
  else threads.unshift(base);
  saveThreads(threads);
}

export function removeThread(id: string) {
  saveThreads(loadThreads().filter((t) => t.id !== id));
}