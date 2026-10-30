import { CONTRACT_REFERENCE, CONTRACT_VERSION } from "./contract-clauses";

export { CONTRACT_VERSION };
export const CONTRACT_FIELDS = [
  { title: "Identificação do prestador", labels: ["Nome empresarial ou nome completo", "CPF/CNPJ do prestador", "Endereço do prestador", "E-mail do prestador"] },
  { title: "Anexo I — Ordem de serviço e escopo do projeto", labels: ["Nome do projeto", "Data da contratação", "Quantidade de páginas", "Funcionalidades incluídas", "Integrações", "Entregáveis", "Serviços não incluídos", "Forma de pagamento", "Quantidade de parcelas", "Datas de vencimento", "Custos recorrentes", "Previsão de início", "Condições para início", "Quantidade de revisões incluídas", "Período de suporte", "Manutenção contratada", "Descrição da manutenção", "Condição de cessão ou licença dos entregáveis personalizados", "Recursos de terceiros e respectivas licenças"] },
  { title: "Anexo II — Termo de entrega", labels: ["Data de entrega", "Itens entregues", "Acessos disponibilizados", "Documentação entregue", "Pendências identificadas", "Registro da entrega"] },
] as const;

export type ContractDocumentData = {
  nome: string; documento: string; email: string; telefone: string; empresa: string;
  tipo: string; escopo: string; valor: string; prazo: string;
  endereco?: string; details?: Record<string, string>;
};

const filled = (value?: string) => value?.trim() || "[PREENCHER]";

export function buildContractDocument(data: ContractDocumentData) {
  const details = data.details ?? {};
  let text = CONTRACT_REFERENCE;
  const provider = `Nome empresarial ou nome completo: ${filled(details["Nome empresarial ou nome completo"])}\n\nCPF/CNPJ: ${filled(details["CPF/CNPJ do prestador"])}\n\nEndereço: ${filled(details["Endereço do prestador"])}\n\nE-mail: ${filled(details["E-mail do prestador"])}`;
  text = text.replace(/Nome empresarial ou nome completo: \[PREENCHER\][\s\S]*?E-mail: \[PREENCHER\]/, () => provider);
  const client = `Nome completo ou razão social: ${filled(data.empresa || data.nome)}\n\nCPF/CNPJ: ${filled(data.documento)}\n\nEndereço: ${filled(data.endereco)}\n\nE-mail: ${filled(data.email)}\n\nTelefone: ${filled(data.telefone)}`;
  text = text.replace(/Nome completo ou razão social: \[PREENCHER\][\s\S]*?Telefone: \[PREENCHER\]/, () => client);
  const values: Record<string, string> = {
    ...details, "Tipo de serviço": data.tipo, "Descrição dos serviços": data.escopo,
    "Valor total": data.valor, "Prazo estimado de entrega": data.prazo,
    "Projeto": details["Nome do projeto"] ?? "", "Contratante": data.empresa || data.nome,
  };
  for (const [label, value] of Object.entries(values)) {
    const placeholder = `${label}: ${label === "Valor total" ? "R$ " : ""}[PREENCHER]`;
    text = text.replaceAll(placeholder, `${label}: ${filled(value)}`);
  }
  text = text.replace("3. Serviços não incluídos\n\n[PREENCHER]", `3. Serviços não incluídos\n\n${filled(details["Serviços não incluídos"])}`);
  text = text.replace("Manutenção contratada: [SIM/NÃO]", `Manutenção contratada: ${details["Manutenção contratada"]?.trim() || "[SIM/NÃO]"}`);
  const due = details["Datas de vencimento"]?.trim();
  if (due) text = text.replace("5. Prazos\n", `Datas de vencimento: ${due}\n\n5. Prazos\n`);
  return text.replace("Última revisão: [PREENCHER DATA]", "Última revisão: 30/10/2026");
}