import { describe, it } from "node:test";
import { strict as assert } from "node:assert";
import { safeDestination } from "./auth-utils";

describe("destino após login", () => {
  it("mantém o contrato solicitado dentro do site", () => {
    assert.equal(safeDestination("/contrato"), "/contrato");
  });
  it("não encaminha a conta para outro site", () => {
    for (const value of ["https://outro.site", "//outro.site", "/\\outro.site", "/entrar"]) {
      assert.equal(safeDestination(value), "/painel");
    }
  });
});