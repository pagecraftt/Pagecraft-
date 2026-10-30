import { describe, it } from "node:test";
import { strict as assert } from "node:assert";
import { canSignContract } from "./contract-access";
describe("liberação individual do contrato", () => {
  it("bloqueia clientes sem liberação administrativa", () => { assert.equal(canSignContract(null), false); });
  it("permite assinatura somente após liberação", () => { assert.equal(canSignContract({ authorized: true }), true); });
  it("bloqueia novamente quando o administrador revoga", () => { assert.equal(canSignContract({ authorized: false }), false); });
  it("não libera quando a verificação falha", () => { assert.equal(canSignContract({ authorized: true }, true), false); });
});