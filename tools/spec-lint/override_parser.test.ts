import assert from "node:assert/strict";
import test from "node:test";
import { parseOverrideAnnotations } from "./override_parser.js";

const detected = [{
  conceptName: "risk_token",
  conceptClass: "entity_field" as const,
  specAnchor: "#4-3-1-workspace",
  specLineNumber: 10,
}];

test("parses the exact internal-only grammar", () => {
  const body = "@appendix-m-internal-only: entity_field::risk_token@#4-3-1-workspace — internal-only construct, not surfaced because the field is worker-only; not_in_buyer_serializer";
  const result = parseOverrideAnnotations(body, detected);
  assert.equal(result.failures.length, 0);
  assert.equal(result.annotations[0]?.targetKey, "entity_field::risk_token@#4-3-1-workspace");
  assert.deepEqual(result.annotations[0]?.qualifiers, ["not_in_buyer_serializer"]);
});

test("rejects short and unqualified rationales", () => {
  const body = "@appendix-m-internal-only: entity_field::risk_token@#4-3-1-workspace — internal-only construct, not surfaced";
  const result = parseOverrideAnnotations(body, detected);
  assert.equal(result.annotations.length, 0);
  assert.match(result.failures[0]?.message ?? "", /60 characters/);
  assert.match(result.failures[0]?.message ?? "", /qualifier/);
});

test("rejects duplicate target keys", () => {
  const line = "@appendix-m-internal-only: entity_field::risk_token@#4-3-1-workspace — internal-only construct, not surfaced because the field is worker-only; not_in_buyer_serializer";
  const result = parseOverrideAnnotations(`${line}\n${line}`, detected);
  assert.equal(result.annotations.length, 0);
  assert.ok(result.failures.some((failure) => failure.code === "multiple_override_same_target_key"));
});
