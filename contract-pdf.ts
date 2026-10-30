import { buildContractDocument, CONTRACT_VERSION } from "./contract-document";

export type ContractPdfData = {
  nome: string;
  documento: string;
  email: string;
  telefone: string;
  empresa: string;
  tipo: string;
  escopo: string;
  valor: string;
  prazo: string;
  endereco?: string;
  details?: Record<string, string>;
  documentText?: string | null;
  documentVersion?: string | null;
  assinatura?: string;
  code?: string;
  signedAt?: string;
  clausulas: { titulo: string; texto: string }[];
  contratada: { founder: string; location: string; email: string; whatsapp: string };
};

const ascii = (s: string) =>
  s.replace(/[“”]/g, '"').replace(/[‘’]/g, "'").replace(/[–—]/g, "-").replace(/\u00a0/g, " ");

function deliver(blob: Blob, filename: string, mode: "download" | "print") {
  const url = URL.createObjectURL(blob);
  const cleanup = () => setTimeout(() => URL.revokeObjectURL(url), 60000);

  if (mode === "print") {
    const w = window.open(url, "_blank", "noopener,noreferrer");
    if (w) {
      cleanup();
      return;
    }
  }

  // Download direto
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();

  // Dentro de iframes de preview o download pode ser bloqueado: abre em nova aba também
  let inIframe = false;
  try {
    inIframe = window.top !== window.self;
  } catch {
    inIframe = true;
  }
  if (inIframe) window.open(url, "_blank", "noopener,noreferrer");

  cleanup();
}

export async function downloadContractPdf(d: ContractPdfData, mode: "download" | "print" = "download") {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const M = 48;
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const maxW = W - M * 2;
  let y = M;

  const br = (h: number) => {
    if (y + h > H - M) {
      doc.addPage();
      y = M;
    }
  };
  const text = (t: string, size = 10, style: "normal" | "bold" = "normal", gap = 6) => {
    doc.setFont("helvetica", style);
    doc.setFontSize(size);
    const lines = doc.splitTextToSize(ascii(t), maxW) as string[];
    for (const line of lines) {
      br(size + 4);
      doc.text(line, M, y);
      y += size + 4;
    }
    y += gap;
  };

  if (d.documentText || !d.code) {
    const content = d.documentText || buildContractDocument(d);
    for (const paragraph of content.split(/\n\n+/)) {
      const heading = /^(PAGECRAFT|CLÁUSULA |ANEXO |IDENTIFICAÇÃO|DISPOSIÇÃO FINAL)/.test(paragraph);
      text(paragraph, heading ? 12 : 10, heading ? "bold" : "normal", 8);
    }
    text("Aceite e assinatura", 13, "bold", 4);
    text(`Versão do documento: ${d.documentVersion || CONTRACT_VERSION}`);
    if (d.code && d.signedAt) {
      text(`Aceite registrado por ${d.assinatura || d.nome}.`);
      text(`Data e hora: ${new Date(d.signedAt).toLocaleString("pt-BR")}`);
      text(`Código de verificação: ${d.code}`, 11, "bold");
    } else {
      text("Documento não assinado. Campos [PREENCHER] devem ser definidos pelas partes.");
    }
    deliver(doc.output("blob"), `contrato-pagecraft${d.code ? `-${d.code}` : ""}.pdf`, mode);
    return;
  }

  text("Contrato de Prestacao de Servicos", 18, "bold", 2);
  text("PageCraft - Estudio de tecnologia", 10, "normal", 12);

  text("Partes", 13, "bold", 4);
  text(
    `CONTRATADA: PageCraft - Estudio de tecnologia. Responsavel: ${d.contratada.founder}. ${d.contratada.location}. ${d.contratada.email} - ${d.contratada.whatsapp}.`,
  );
  text(
    `CONTRATANTE: ${d.nome || "-"}${d.empresa ? ` (${d.empresa})` : ""}. Documento: ${d.documento || "nao informado"}. E-mail: ${d.email || "nao informado"}. Telefone: ${d.telefone || "nao informado"}.`,
    10,
    "normal",
    12,
  );

  text("Dados do contrato", 13, "bold", 4);
  text(`Tipo de projeto: ${d.tipo}`);
  text(`Investimento acordado: ${d.valor || "a combinar"}`);
  text(`Prazo acordado: ${d.prazo || "a combinar"}`);
  text(`Escopo contratado: ${d.escopo || "-"}`, 10, "normal", 12);

  text("Clausulas", 13, "bold", 4);
  for (const c of d.clausulas) {
    text(c.titulo, 11, "bold", 2);
    text(c.texto, 10, "normal", 8);
  }

  text("Aceite e assinatura", 13, "bold", 4);
  if (d.code && d.signedAt) {
    text(`Assinado digitalmente por ${d.assinatura || d.nome}.`);
    text(`Data e hora: ${new Date(d.signedAt).toLocaleString("pt-BR")}`);
    text(`Codigo de verificacao: ${d.code}`, 11, "bold", 8);
  } else {
    text("Documento nao assinado. Assinatura do contratante: ______________________________", 10, "normal", 8);
  }
  text(
    `Documento gerado em ${new Date().toLocaleDateString("pt-BR")}. O aceite eletronico equivale a assinatura, nos termos do art. 10, par. 2 da MP 2.200-2/2001.`,
    8,
  );

  const filename = `contrato-pagecraft${d.code ? `-${d.code}` : ""}.pdf`;
  deliver(doc.output("blob"), filename, mode);
}
