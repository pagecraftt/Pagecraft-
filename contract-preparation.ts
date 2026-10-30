import { z } from "zod";
import { CONTRACT_FIELDS, type ContractDocumentData } from "./contract-document";

const text = z.string().trim().max(4000);
export const ContractPreparationSchema = z.object({
  tipo: text.default(""), escopo: text.default(""), valor: text.default(""), prazo: text.default(""),
  details: z.record(z.string().max(120), text).default({}),
});
export type ContractPreparation = z.infer<typeof ContractPreparationSchema>;
export const emptyPreparation = (): ContractPreparation => ({ tipo: "", escopo: "", valor: "", prazo: "", details: {} });
export function parsePreparation(value: unknown): ContractPreparation {
  const parsed = ContractPreparationSchema.safeParse(value);
  return parsed.success ? parsed.data : emptyPreparation();
}
export const ClientContractSchema = z.object({
  clientName: z.string().trim().min(3).max(120),
  clientDocument: z.string().max(30).nullable(),
  clientEmail: z.string().email().max(160).nullable(),
  clientPhone: z.string().max(40).nullable(),
  company: z.string().max(120).nullable(),
  clientAddress: z.string().max(500).optional(),
  signatureName: z.string().trim().min(3).max(120), accepted: z.literal(true),
  preparationRevision: z.string(),
}).strict();
export function preparedDocumentData(client: { clientName: string; clientDocument: string | null; clientEmail: string | null; clientPhone: string | null; company: string | null; clientAddress?: string }, preparation: ContractPreparation): ContractDocumentData {
  const allowedLabels = new Set<string>(CONTRACT_FIELDS.flatMap((group) => [...group.labels]));
  return {
    nome: client.clientName, documento: client.clientDocument ?? "", email: client.clientEmail ?? "",
    telefone: client.clientPhone ?? "", empresa: client.company ?? "", endereco: client.clientAddress,
    tipo: preparation.tipo, escopo: preparation.escopo, valor: preparation.valor, prazo: preparation.prazo,
    details: Object.fromEntries(Object.entries(preparation.details).filter(([label]) => allowedLabels.has(label))),
  };
}