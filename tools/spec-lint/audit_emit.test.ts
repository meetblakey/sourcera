import assert from "node:assert/strict";
import test from "node:test";
import { normalizeAppendixMChain } from "./audit_emit.js";

test("normalizes mixed Appendix M workflow payloads into one GateResult", () => {
  const result = normalizeAppendixMChain([
    {
      gate_id: "appendix_m_coverage_on_diff",
      outcome: "needs_coverage",
      triggered_concepts: [{
        conceptName: "risk_token",
        conceptClass: "entity_field",
        specAnchor: "#4-3-1-workspace",
        specLineNumber: 10,
        coveredByAppendixM: false,
      }],
      orphan_inline_gate_references: [],
      stats: { triggered_count: 1, uncovered_count: 1, orphan_gate_reference_count: 0 },
    },
    { outcome: "pass", failures: [] },
    { outcome: "pass", results: [] },
  ]);
  assert.equal(result.gate_id, "appendix_m_coverage_on_diff");
  assert.equal(result.outcome, "fail");
  assert.equal(result.findings.length, 1);
  assert.match(result.findings[0]?.message ?? "", /risk_token/);
});

test("normalizes a clean chain as pass with an empty findings array", () => {
  const result = normalizeAppendixMChain([
    {
      gate_id: "appendix_m_coverage_on_diff",
      outcome: "pass",
      triggered_concepts: [],
      orphan_inline_gate_references: [],
      stats: { triggered_count: 0, uncovered_count: 0, orphan_gate_reference_count: 0 },
    },
    { outcome: "pass", failures: [] },
  ]);
  assert.equal(result.outcome, "pass");
  assert.deepEqual(result.findings, []);
});

test("records an accepted exact-key override without a false failure", () => {
  const result = normalizeAppendixMChain([
    {
      gate_id: "appendix_m_coverage_on_diff",
      outcome: "needs_coverage",
      triggered_concepts: [{
        conceptName: "risk_token",
        conceptClass: "entity_field",
        specAnchor: "#4-3-1-workspace",
        specLineNumber: 10,
        coveredByAppendixM: false,
      }],
    },
    {
      outcome: "pass",
      results: [{
        outcome: "pass",
        annotation: { targetKey: "entity_field::risk_token@#4-3-1-workspace" },
      }],
    },
  ]);
  assert.equal(result.outcome, "override_applied");
  assert.deepEqual(result.findings, []);
});
