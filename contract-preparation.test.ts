import { describe, it } from "node:test";
import { strict as assert } from "node:assert";
import { ClientContractSchema, preparedDocumentData, parsePreparation } from "./contract-preparation";
import { buildContractDocument } from "./contract-document";

const client = { clientName: "Cliente Exemplo", clientDocument: null, clientEmail: null, clientPhone: null, company: null, signatureName: "Cliente Exemplo", accepted: true, preparationRevision: "revision" };
describe("preenchimento separado", () => {
  it("aceita somente identificação e aceite do cliente", () => {
    assert.equal(ClientContractSchema.safeParse(client).success, true);
    assert.equal(ClientContractSchema.safeParse({ ...client, deadline: "Prazo alterado" }).success, false);
    assert.equal(ClientContractSchema.safeParse({ ...client, details: { "Data da contratação": "Alterada" } }).success, false);
    assert.equal(ClientContractSchema.safeParse({ ...client, value: "Valor alterado" }).success, false);
  });
  it("usa condições e datas administrativas no documento, não dados enviados pelo cliente", () => {
    const preparation = parsePreparation({ tipo: "Site institucional", escopo: "Projeto definido pelo administrador", valor: "R$ 526,80", prazo: "Prazo da proposta", details: { "Nome empresarial ou nome completo": "Prestador Exemplo", "Data da contratação": "30/10/2026" } });
    const data = preparedDocumentData({ ...client, clientName: "Cliente Correto" }, preparation);
    assert.equal(data.nome, "Cliente Correto");
    assert.equal(data.valor, "R$ 526,80");
    assert.equal(data.prazo, "Prazo da proposta");
    const document = buildContractDocument(data);
    assert.equal(document.match(/Data da contratação: (.+)/)?.[1], "30/10/2026");
    assert.equal(document.match(/Nome empresarial ou nome completo: (.+)/)?.[1], "Prestador Exemplo");
  });
});