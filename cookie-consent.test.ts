import { it } from "node:test";
import { strict as assert } from "node:assert";
import { analyticsAllowed, readCookieChoice } from "./cookie-consent";
it("recusar cookies não autoriza análise", () => assert.equal(analyticsAllowed(readCookieChoice("rejected")), false));
it("sem consentimento não autoriza análise", () => assert.equal(analyticsAllowed(readCookieChoice(null)), false));
it("aceitar cookies autoriza análise", () => assert.equal(analyticsAllowed(readCookieChoice("accepted")), true));
it("não reutiliza escolha antiga ou inválida", () => assert.equal(readCookieChoice("invalid"), null));