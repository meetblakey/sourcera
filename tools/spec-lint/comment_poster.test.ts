import assert from "node:assert/strict";
import test from "node:test";
import { buildReviewPlan } from "./comment_poster.js";

test("renders a missing-row review comment", () => {
  const plan = buildReviewPlan({
    gateRunId: "run-1",
    triggerDetector: {
      triggered_concepts: [{
        conceptName: "risk_token",
        conceptClass: "entity_field",
        specAnchor: "#4-3-1-workspace",
        specLineNumber: 10,
        coveredByAppendixM: false,
      }],
      orphan_inline_gate_references: [],
    },
    grammarFailures: [],
    crossValidationResults: [],
  });
  assert.equal(plan.blocking, true);
  assert.equal(plan.comments[0]?.line, 10);
  assert.match(plan.comments[0]?.body ?? "", /Appendix M coverage missing/);
});

test("a passing exact-key override clears the missing-row block", () => {
  const concept = {
    conceptName: "risk_token",
    conceptClass: "entity_field",
    specAnchor: "#4-3-1-workspace",
    specLineNumber: 10,
    coveredByAppendixM: false,
  };
  const plan = buildReviewPlan({
    gateRunId: "run-2",
    triggerDetector: { triggered_concepts: [concept], orphan_inline_gate_references: [] },
    grammarFailures: [],
    crossValidationResults: [{
      outcome: "pass",
      annotation: { targetKey: "entity_field::risk_token@#4-3-1-workspace" },
    }],
  });
  assert.equal(plan.blocking, false);
  assert.deepEqual(plan.comments, []);
});
