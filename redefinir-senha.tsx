import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { KeyRound, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { authErrorMessage } from "@/lib/auth-utils";

export const Route = createFileRoute("/redefinir-senha")({
  head: () => ({ meta: [
    { title: "Redefinir senha | PageCraft" },
    { name: "description", content: "Redefina sua senha para acessar a área do cliente PageCraft." },
    { property: "og:title", content: "Redefinir senha | PageCraft" },
    { property: "og:description", content: "Recuperação segura da sua conta PageCraft." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
    { name: "robots", content: "noindex" },
  ] }),
  component: ResetPassword,
});

function ResetPassword() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [valid, setValid] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  useEffect(() => {
    let active = true;
    const hash = new URLSearchParams(window.location.hash.slice(1));
    if (hash.get("type") === "recovery") sessionStorage.setItem("pagecraft:recovery", "true");
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setValid(Boolean(data.session) && sessionStorage.getItem("pagecraft:recovery") === "true");
      setReady(true);
    });
    return () => { active = false; };
  }, []);
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (password !== confirmation) { setError("As senhas precisam ser iguais."); return; }
    setBusy(true); setError("");
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      sessionStorage.removeItem("pagecraft:recovery");
      setSuccess(true);
    } catch (error) { setError(authErrorMessage(error)); }
    finally { setBusy(false); }
  }
  return <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-5 py-12">
    <KeyRound className="mb-5 size-8 text-primary" />
    <p className="mb-3 font-mono text-xs uppercase tracking-widest text-primary">PageCraft</p>
    <h1 className="text-3xl font-bold">Nova senha</h1>
    {!ready ? <Loader2 className="mt-6 animate-spin" aria-label="Verificando link" /> : success ? <div className="mt-6 space-y-5">
      <p role="status" className="text-primary">Senha atualizada com sucesso.</p>
      <Button onClick={() => void navigate({ to: "/painel", replace: true })}>Abrir meu painel</Button>
    </div> : !valid ? <div className="mt-6 space-y-5">
      <p className="text-muted-foreground">Este link expirou ou não é um link de recuperação. Solicite outro para continuar.</p>
      <Button asChild><Link to="/entrar">Voltar para entrar</Link></Button>
    </div> : <form onSubmit={submit} className="mt-6 space-y-4">
      <label className="block text-sm">Nova senha<input aria-label="Nova senha" className="account-input mt-2" type="password" minLength={8} autoComplete="new-password" value={password} onChange={e => setPassword(e.target.value)} required /></label>
      <label className="block text-sm">Confirmar nova senha<input aria-label="Confirmar nova senha" className="account-input mt-2" type="password" minLength={8} autoComplete="new-password" value={confirmation} onChange={e => setConfirmation(e.target.value)} required /></label>
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      <Button disabled={busy} className="h-12 w-full" type="submit">{busy && <Loader2 className="animate-spin" />}Salvar nova senha</Button>
    </form>}
  </main>;
}