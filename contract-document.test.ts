import { describe, it } from "node:test";
import { strict as assert } from "node:assert";
import { buildContractDocument } from "./contract-document";

const base = { nome: "Cliente Exemplo", documento: "", email: "", telefone: "", empresa: "", tipo: "Site institucional", escopo: "Site contratado", valor: "", prazo: "" };

describe("dados individuais do contrato", () => {
  it("não presume pagamento, revisões ou manutenção sem proposta", () => {
    const document = buildContractDocument(base);
    assert.equal(document.match(/Forma de pagamento: (.+)/)?.[1], "[PREENCHER]");
    assert.equal(document.match(/Quantidade de revisões incluídas: (.+)/)?.[1], "[PREENCHER]");
    assert.equal(document.match(/Manutenção contratada: (.+)/)?.[1], "[SIM/NÃO]");
  });
  it("não inventa CPF/CNPJ ou endereço do prestador", () => {
    const provider = buildContractDocument(base).split("CONTRATANTE (CLIENTE)")[0];
    assert.equal(provider.match(/CPF\/CNPJ: (.+)/)?.[1], "[PREENCHER]");
    assert.equal(provider.match(/Endereço: (.+)/)?.[1], "[PREENCHER]");
  });
  it("preserva os valores e condições acordados sem impor 50/50", () => {
    const document = buildContractDocument({ ...base, valor: "R$ 526,80", details: { "Forma de pagamento": "Cartão", "Quantidade de parcelas": "3", "Manutenção contratada": "NÃO" } });
    assert.equal(document.match(/Valor total: (.+)/)?.[1], "R$ 526,80");
    assert.equal(document.match(/Quantidade de parcelas: (.+)/)?.[1], "3");
    assert.equal(document.match(/Manutenção contratada: (.+)/)?.[1], "NÃO");
  });
});