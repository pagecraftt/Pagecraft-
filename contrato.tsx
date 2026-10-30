import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  ArrowLeft, Check, FileSignature, MessageCircle, Mail, ShieldCheck, Printer, Loader2, Download,
} from "lucide-react";
import { getContractPermission, signContract, type SignResult } from "@/lib/contract.functions";
import { downloadContractPdf } from "@/lib/contract-pdf";
import { CONTACT, whatsappLink, mailtoLink } from "@/lib/pagecraft-knowledge";

export const Route = createFileRoute("/_authenticated/contrato")({
  head: () => ({
    meta: [
      { title: "Contrato de Prestação de Serviços | PageCraft" },
      { name: "description", content: "Leia e assine digitalmente o contrato de prestação de serviços da PageCraft: escopo, prazos, valores, direitos e obrigações. Aceite online com registro de data e hora." },
      { property: "og:title", content: "Contrato de Prestação de Serviços | PageCraft" },
      { property: "og:description", content: "Aceite digital do contrato PageCraft, com escopo, prazos e registro de assinatura." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ContratoPage,
});

import { CLAUSULAS } from "@/lib/contract-clauses";
import { buildContractDocument, CONTRACT_VERSION } from "@/lib/contract-document";
import { Button } from "@/components/ui/button";
import { emptyPreparation } from "@/lib/contract-preparation";

const inputClass = "account-input";

function ContratoPage() {
  const sign = useServerFn(signContract);
  const checkPermission = useServerFn(getContractPermission);

  const [nome, setNome] = useState("");
  const [documento, setDocumento] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [empresa, setEmpresa] = useState("");
  const [endereco, setEndereco] = useState("");
  const [preparation, setPreparation] = useState(emptyPreparation);
  const [revision, setRevision] = useState("");
  const { tipo, escopo, valor, prazo, details } = preparation;
  const [aceito, setAceito] = useState(false);
  const [assinatura, setAssinatura] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");
  const [resultado, setResultado] = useState<{ code: string; signedAt: string; documentText: string; documentVersion: string } | null>(null);
  const [baixando, setBaixando] = useState(false);
  const [verificandoAcesso, setVerificandoAcesso] = useState(true);
  const [acessoLiberado, setAcessoLiberado] = useState(false);

  useEffect(() => {
    let active = true;
    const verify = () => checkPermission()
      .then((result) => {
        if (active) {
          setAcessoLiberado(result.authorized);
          if (result.preparation) setPreparation(result.preparation);
          setRevision(result.revision);
        }
      })
      .catch(() => {
        if (active) { setAcessoLiberado(false); setErro("Não foi possível verificar a liberação. Tente atualizar a página."); }
      })
      .finally(() => {
        if (active) setVerificandoAcesso(false);
      });
    void verify();
    window.addEventListener("focus", verify);
    return () => {
      active = false;
      window.removeEventListener("focus", verify);
    };
  }, [checkPermission]);

  async function baixarPdf(mode: "download" | "print" = "download") {
    if (baixando) return;
    setBaixando(true);
    try {
      await downloadContractPdf({
        nome, documento, email, telefone, empresa, tipo, escopo, valor, prazo, endereco, details,
        documentText: resultado?.documentText,
        documentVersion: resultado?.documentVersion,
        assinatura,
        code: resultado?.code,
        signedAt: resultado?.signedAt,
        clausulas: CLAUSULAS,
        contratada: {
          founder: CONTACT.founder,
          location: CONTACT.location,
          email: CONTACT.email,
          whatsapp: CONTACT.whatsappDisplay,
        },
      }, mode);
    } finally {
      setBaixando(false);
    }
  }

  const assinaturaConfere =
    assinatura.trim().length > 2 &&
    assinatura.trim().toLowerCase().replace(/\s+/g, " ") ===
      nome.trim().toLowerCase().replace(/\s+/g, " ");

  const pronto =
    nome.trim().length > 2 &&
    (email.trim() === "" || /\S+@\S+\.\S+/.test(email)) &&
    tipo.trim().length >= 2 && escopo.trim().length >= 10 &&
    aceito &&
    assinaturaConfere;

  async function enviar() {
    if (!pronto || enviando) return;
    setEnviando(true);
    setErro("");
    try {
      const res = (await sign({
        data: {
          clientName: nome,
          clientDocument: documento || null,
          clientEmail: email.trim() ? email.trim() : null,
          clientPhone: telefone || null,
          company: empresa || null,
          signatureName: assinatura,
          accepted: true as const,
          clientAddress: endereco,
          preparationRevision: revision,
        },
      })) as SignResult;
      if (res.ok) {
        setResultado({ code: res.code, signedAt: res.signedAt, documentText: res.documentText, documentVersion: res.documentVersion });
        // A assinatura já está registrada; o envio externo é uma ação explícita do cliente.
      } else setErro(res.reason);
    } catch {
      setErro("Não consegui registrar o aceite agora. Tente novamente em instantes.");
    } finally {
      setEnviando(false);
    }
  }

  const resumo = resultado
    ? [
        "Contrato PageCraft assinado digitalmente.",
        "",
        `Código de verificação: ${resultado.code}`,
        `Cliente: ${nome}`,
        empresa ? `Empresa: ${empresa}` : "",
        documento ? `Documento: ${documento}` : "",
        email.trim() ? `E-mail: ${email}` : "",
        telefone ? `Telefone: ${telefone}` : "",
        `Projeto: ${tipo}`,
        valor ? `Investimento: ${valor}` : "",
        prazo ? `Prazo: ${prazo}` : "",
        "",
        "Escopo:",
        escopo,
      ]
        .filter((l) => l !== "")
        .join("\n")
    : "";

  if (verificandoAcesso) {
    return (
      <div className="min-h-screen grid place-items-center bg-background text-foreground">
        <Loader2 className="w-6 h-6 animate-spin text-primary" aria-label="Verificando acesso" />
      </div>
    );
  }

  if (!acessoLiberado) {
    return (
      <div className="min-h-screen grid place-items-center bg-background text-foreground px-4">
        <div className="glass-strong rounded-3xl p-8 text-center max-w-md">
          <ShieldCheck className="w-7 h-7 text-primary mx-auto" />
          <h1 className="mt-4 text-xl font-semibold">Contrato aguardando liberação</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {erro || "A administração da PageCraft ainda não liberou o contrato para sua conta."}
          </p>
          <Link to="/painel" className="mt-5 inline-flex items-center gap-2 text-sm text-primary hover:underline">
            <ArrowLeft className="w-4 h-4" /> Voltar ao meu painel
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">

      <header className="relative mx-auto max-w-4xl px-4 pt-10 print:hidden flex flex-wrap items-center justify-between gap-3">
        <Link to="/painel" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition">
          <ArrowLeft className="w-4 h-4" /> Meu painel
        </Link>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            onClick={() => baixarPdf("download")}
            disabled={baixando}
            className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-4 py-2 text-xs font-semibold hover:brightness-110 transition disabled:opacity-60"
          >
            {baixando ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
            Baixar PDF
          </Button>
          <Button
            type="button"
            onClick={() => baixarPdf("print")}
            disabled={baixando}
            className="inline-flex items-center gap-2 rounded-full glass px-4 py-2 text-xs font-semibold hover:bg-white/10 transition"
          >
            <Printer className="w-3.5 h-3.5" /> Imprimir
          </Button>
        </div>
      </header>

      <main className="contract-document relative mx-auto max-w-4xl px-4 pb-24 pt-8">
        <span className="inline-flex items-center gap-2 rounded-full glass px-3 py-1.5 text-xs font-medium text-primary print:hidden">
          <FileSignature className="w-3.5 h-3.5" /> Assinatura digital
        </span>
        <h1 className="mt-5 text-3xl md:text-5xl font-bold tracking-tight">
          Contrato de <span className="text-gradient-green">prestação de serviços</span>
        </h1>
        <p className="mt-4 text-muted-foreground max-w-2xl">
          Desenvolvimento digital — Versão {CONTRACT_VERSION}.
        </p>

        {/* Partes */}
        <section className="mt-10 glass-strong rounded-3xl p-5 md:p-8">
          <h2 className="text-lg font-semibold">1. Seu projeto e a PageCraft</h2>
          <dl className="mt-4 grid sm:grid-cols-2 gap-4 text-sm">
            {[["Serviço", tipo], ["Investimento", valor], ["Prazo", prazo], ["Escopo", escopo]].map(([label, value]) => <div key={label} className="min-w-0"><dt className="text-muted-foreground">{label}</dt><dd className="mt-1 whitespace-pre-wrap break-words">{value || "A definir pela administração"}</dd></div>)}
          </dl>
          <div className="mt-4 grid sm:grid-cols-2 gap-4 text-sm">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Contratada</p>
              <p className="mt-2 font-medium">PageCraft — Estúdio de tecnologia</p>
              <p className="text-muted-foreground mt-1">Nome: {details["Nome empresarial ou nome completo"] || "A definir pela administração"}</p>
              <p className="text-muted-foreground">CPF/CNPJ: {details["CPF/CNPJ do prestador"] || "A definir pela administração"}</p>
              <p className="text-muted-foreground">Endereço: {details["Endereço do prestador"] || "A definir pela administração"}</p>
              <p className="text-muted-foreground">{CONTACT.email} · {CONTACT.whatsappDisplay}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Contratante</p>
              <p className="mt-2 font-medium">{nome.trim() || "— preencha abaixo —"}</p>
              <p className="text-muted-foreground mt-1">{empresa || "Pessoa física / empresa"}</p>
              <p className="text-muted-foreground">{documento || "CPF/CNPJ não informado"}</p>
              <p className="text-muted-foreground">{email || "e-mail não informado (opcional)"}</p>
            </div>
          </div>
        </section>

        {/* Dados do contrato */}
        <section className="mt-6 glass-strong rounded-3xl p-5 md:p-8 print:hidden">
          <h2 className="text-lg font-semibold">2. Seus dados</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Identificação do contratante. O e-mail e a empresa são opcionais.
          </p>

          <fieldset disabled={Boolean(resultado) || enviando} className="mt-5 grid sm:grid-cols-2 gap-3">
            <input className={inputClass} value={nome} onChange={(e) => setNome(e.target.value)} aria-label="Nome completo do contratante" placeholder="Nome completo do contratante *" />
            <input aria-label="CPF ou CNPJ" className={inputClass} value={documento} onChange={(e) => setDocumento(e.target.value)} placeholder="CPF ou CNPJ" />
            <input aria-label="E-mail (opcional)" className={inputClass} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="E-mail (opcional)" type="email" />
            <input aria-label="WhatsApp / telefone" className={inputClass} value={telefone} onChange={(e) => setTelefone(e.target.value)} placeholder="WhatsApp / telefone" />
            <input aria-label="Empresa (opcional)" className={inputClass} value={empresa} onChange={(e) => setEmpresa(e.target.value)} placeholder="Empresa (opcional)" />
            <input aria-label="Endereço do contratante" className={inputClass} value={endereco} onChange={(e) => setEndereco(e.target.value)} placeholder="Endereço do contratante" />
          </fieldset>
        </section>

        {/* Cláusulas */}
        <section className="mt-6 glass-strong rounded-3xl p-5 md:p-8">
          <h2 className="text-lg font-semibold">3. Contrato completo — cláusulas e anexos</h2>
          <div className="mt-4 max-h-[420px] overflow-y-auto pr-2 space-y-4 print:max-h-none print:overflow-visible">
            <p className="whitespace-pre-wrap break-words text-sm text-muted-foreground leading-relaxed">{resultado?.documentText || buildContractDocument({ nome, documento, email, telefone, empresa, tipo: tipo ?? "", escopo, valor, prazo, endereco, details })}</p>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Leia também a{" "}
            <Link to="/privacidade" className="text-primary hover:underline">Política de Privacidade</Link> e os{" "}
            <Link to="/termos" className="text-primary hover:underline">Termos de Uso</Link>.
          </p>
        </section>

        {/* Aceite */}
        {!resultado ? (
          <section className="mt-6 glass-strong rounded-3xl p-5 md:p-8 print:hidden">
            {(tipo.trim().length < 2 || escopo.trim().length < 10) && <p role="status" className="mb-4 text-sm text-muted-foreground">A PageCraft está preparando os dados do projeto. O aceite ficará disponível quando estiverem prontos.</p>}
            <h2 className="text-lg font-semibold">4. Seu aceite e assinatura</h2>

            <label className="mt-4 flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={aceito}
                onChange={(e) => setAceito(e.target.checked)}
                className="mt-1 h-4 w-4 accent-[color:var(--primary)]"
              />
              <span className="text-sm text-muted-foreground">
                Li e concordo com as 25 cláusulas e os anexos deste contrato, versão {CONTRACT_VERSION}, e confirmo que os dados informados
                estão corretos, formalizando o acordo com a PageCraft.
              </span>
            </label>

            <div className="mt-5">
              <label className="text-xs font-medium text-muted-foreground">
                Assinatura — digite seu nome completo exatamente como informado acima
              </label>
              <input
                aria-label="Assinatura — nome completo"
                className={`${inputClass} signature-input mt-2 text-lg`}
                value={assinatura}
                onChange={(e) => setAssinatura(e.target.value)}
                placeholder="Seu nome completo"
              />
              {assinatura.trim().length > 2 && !assinaturaConfere && (
                <p className="mt-2 text-xs text-destructive">
                  A assinatura precisa ser igual ao nome completo do contratante.
                </p>
              )}
            </div>

            {erro && <p className="mt-4 text-sm text-destructive">{erro}</p>}

            <Button
              type="button"
              onClick={enviar}
              disabled={!pronto || enviando}
              className="mt-6 inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold bg-primary text-primary-foreground transition enabled:hover:brightness-110 enabled:glow-green disabled:opacity-50"
            >
              {enviando ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileSignature className="w-4 h-4" />}
              {enviando ? "Registrando aceite..." : "Assinar e fechar acordo"}
            </Button>
            <p className="mt-3 text-xs text-muted-foreground inline-flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-primary" /> Registro com data, hora e código de verificação.
            </p>
          </section>
        ) : (
          <section className="mt-6 glass-strong rounded-3xl p-5 md:p-8 border border-primary/30">
            <div className="inline-flex items-center gap-2 text-primary text-sm font-semibold">
              <Check className="w-4 h-4" /> Contrato assinado com sucesso
            </div>
            <h2 className="mt-3 text-2xl font-bold">Acordo fechado, {nome.split(" ")[0]}!</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Guarde o código de verificação abaixo. Ele comprova o seu aceite junto à PageCraft.
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              Seu contrato está registrado. Você pode baixar o PDF ou compartilhar o resumo pelo WhatsApp e e-mail.
            </p>
            <div className="mt-4 rounded-2xl border border-primary/30 bg-primary/10 p-4">
              <p className="text-xs text-muted-foreground">Código de verificação</p>
              <p className="mt-1 text-2xl font-mono font-bold text-primary">{resultado.code}</p>
              <p className="mt-2 text-xs text-muted-foreground">
                Assinado em {new Date(resultado.signedAt).toLocaleString("pt-BR")} por {assinatura}.
              </p>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href={whatsappLink(resumo)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold bg-primary text-primary-foreground hover:brightness-110 glow-green transition"
              >
                <MessageCircle className="w-4 h-4" /> Enviar cópia pelo WhatsApp
              </a>
              <a
                href={mailtoLink(`Contrato assinado — ${resultado.code}`, resumo)}
                className="inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold glass hover:bg-white/10 transition"
              >
                <Mail className="w-4 h-4" /> Enviar por e-mail
              </a>
              <Button
                type="button"
                onClick={() => baixarPdf("download")}
                disabled={baixando}
                className="inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold glass hover:bg-white/10 transition disabled:opacity-60"
              >
                {baixando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />} Baixar contrato em PDF
              </Button>
              <Button
                type="button"
                onClick={() => baixarPdf("print")}
                disabled={baixando}
                className="inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold glass hover:bg-white/10 transition"
              >
                <Printer className="w-4 h-4" /> Imprimir
              </Button>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
