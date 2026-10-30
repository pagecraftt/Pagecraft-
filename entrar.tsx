import { createFileRoute, Link, useNavigate, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Eye, EyeOff, KeyRound, Loader2, LogIn, Mail, ShieldCheck, UserPlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";

import { Button } from "@/components/ui/button";
import { authErrorMessage, safeDestination, LOGIN_DESTINATION_KEY as DESTINO_KEY } from "@/lib/auth-utils";

export const Route = createFileRoute("/entrar")({
  validateSearch: (search: Record<string, unknown>): { redirect?: string } => ({
    redirect: typeof search.redirect === "string" ? search.redirect : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Área do Cliente | Entrar na PageCraft" },
      {
        name: "description",
        content:
          "Acesse a área do cliente PageCraft para acompanhar planos, pagamentos, contratos assinados, arquivos entregues e pedidos de manutenção.",
      },
      { property: "og:title", content: "Área do Cliente | PageCraft" },
      {
        property: "og:description",
        content: "Entre para acompanhar seu projeto, pagamentos e entregas com a PageCraft.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: EntrarPage,
});

function EntrarPage() {
  const navigate = useNavigate();
  const router = useRouter();
  const { redirect } = Route.useSearch();
  const [modo, setModo] = useState<"entrar" | "criar" | "recuperar">("entrar");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [nome, setNome] = useState("");
  const [erro, setErro] = useState("");
  const [aviso, setAviso] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [destino, setDestino] = useState(safeDestination(redirect));

  useEffect(() => {
    const next = safeDestination(redirect ?? sessionStorage.getItem(DESTINO_KEY));
    setDestino(next);
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        sessionStorage.removeItem(DESTINO_KEY);
        void navigate({ to: next, replace: true });
      }
    });
  }, [navigate, redirect]);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setAviso("");
    setCarregando(true);
    try {
      const normalizedEmail = email.trim().toLowerCase();
      if (modo === "recuperar") {
        const { error } = await supabase.auth.resetPasswordForEmail(normalizedEmail, {
          redirectTo: `${window.location.origin}/redefinir-senha`,
        });
        if (error) throw error;
        setAviso("Se este e-mail tiver uma conta, você receberá um link para redefinir a senha.");
        return;
      }
      if (modo === "criar") {
        sessionStorage.setItem(DESTINO_KEY, destino);
        const { data, error } = await supabase.auth.signUp({
          email: normalizedEmail,
          password: senha,
          options: {
            emailRedirectTo: `${window.location.origin}/entrar`,
            data: { full_name: nome.trim() },
          },
        });
        if (error) throw error;
        if (data.session) {
          sessionStorage.removeItem(DESTINO_KEY);
          await router.invalidate();
          await navigate({ to: destino, replace: true });
        } else {
          setAviso("Conta criada! Confirme o e-mail que enviamos para acessar o painel.");
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email: normalizedEmail, password: senha });
        if (error) throw error;
        sessionStorage.removeItem(DESTINO_KEY);
        await router.invalidate();
        await navigate({ to: destino, replace: true });
      }
    } catch (err) {
      setErro(authErrorMessage(err));
    } finally {
      setCarregando(false);
    }
  }

  async function google() {
    setErro("");
    setCarregando(true);
    try {
      sessionStorage.setItem(DESTINO_KEY, destino);
      await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    } catch (err) {
      setErro(authErrorMessage(err));
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="relative mx-auto max-w-5xl px-4 pt-10">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar ao site
        </Link>
      </header>

      <main className="relative mx-auto max-w-md px-4 py-14">
        <p className="mb-4 font-mono text-xs uppercase tracking-widest text-primary">PageCraft · Área do cliente</p>
        <h1 className="text-3xl font-bold">
          {modo === "recuperar" ? "Recuperar senha" : modo === "criar" ? "Crie sua conta" : "Bem-vindo de volta"}
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Acompanhe planos, pagamentos, contratos, arquivos entregues e pedidos de manutenção.
        </p>

        <div className="mt-8 border-t border-border pt-6">
          <div className="flex gap-2 rounded-lg bg-muted/50 p-1 text-sm" role="tablist" aria-label="Acesso à conta">
            {(["entrar", "criar"] as const).map((m) => (
              <Button
                key={m}
                type="button"
                variant="ghost"
                role="tab"
                aria-selected={modo === m}
                disabled={carregando}
                onClick={() => { setModo(m); setErro(""); setAviso(""); }}
                className={`flex-1 px-4 py-2 transition ${
                  modo === m ? "bg-primary text-primary-foreground font-semibold" : "text-muted-foreground"
                }`}
              >
                {m === "entrar" ? "Entrar" : "Criar conta"}
              </Button>
            ))}
          </div>

          <form onSubmit={enviar} className="mt-6 space-y-3">
            {modo === "criar" && (
              <input
                aria-label="Nome completo"
                autoComplete="name"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Seu nome completo"
                required
                className="account-input"
              />
            )}
            <input
              aria-label="E-mail"
              autoComplete="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="E-mail"
              required
              className="account-input"
            />
            {modo !== "recuperar" && <div className="relative">
            <input
              type={mostrarSenha ? "text" : "password"}
              aria-label="Senha"
              autoComplete={modo === "criar" ? "new-password" : "current-password"}
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="Senha"
              required
              minLength={modo === "criar" ? 8 : undefined}
              className="account-input pr-12"
            />
              <Button type="button" variant="ghost" size="icon" className="absolute right-2 top-1.5" onClick={() => setMostrarSenha(!mostrarSenha)} aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}>
                {mostrarSenha ? <EyeOff /> : <Eye />}
              </Button>
            </div>}

            {erro && <p role="alert" className="text-sm text-destructive">{erro}</p>}
            {aviso && <p role="status" className="text-sm text-primary">{aviso}</p>}

            <Button
              type="submit"
              disabled={carregando}
              className="w-full h-12 font-semibold"
            >
              {carregando ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : modo === "recuperar" ? (<KeyRound />) : modo === "entrar" ? (
                <LogIn className="w-4 h-4" />
              ) : (
                <UserPlus className="w-4 h-4" />
              )}
              {modo === "recuperar" ? "Enviar link de recuperação" : modo === "entrar" ? "Entrar" : "Criar minha conta"}
            </Button>
          </form>
          <Button variant="link" className="mt-2 px-0" disabled={carregando} onClick={() => { setModo(modo === "recuperar" ? "entrar" : "recuperar"); setErro(""); setAviso(""); }}>
            {modo === "recuperar" ? "Voltar para entrar" : "Esqueci minha senha"}
          </Button>

          <div className="my-5 flex items-center gap-3 text-[10px] uppercase tracking-widest text-muted-foreground">
            <span className="h-px flex-1 bg-border" /> ou <span className="h-px flex-1 bg-border" />
          </div>

          <Button
            type="button"
            onClick={google}
            variant="outline"
            disabled={carregando}
            className="w-full h-12 font-semibold"
          >
            <Mail className="w-4 h-4 text-primary" /> Continuar com o Google
          </Button>

          <p className="mt-5 flex items-start gap-2 text-[11px] text-muted-foreground">
            <ShieldCheck className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
            Seus dados são usados apenas para acompanhar o seu projeto, conforme a Política de
            <Link to="/privacidade" className="text-primary underline">Privacidade</Link>.
          </p>
        </div>
      </main>
    </div>
  );
}
