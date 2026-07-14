import assert from "node:assert/strict";
import test from "node:test";
import { detectCoverage } from "./appendix_m_coverage_on_diff.js";

const BASE = `# Spec

## 4.3 Buyer {#4-3-buyer}

### 4.3.1 Workspace {#4-3-1-workspace}

| Field | Type | Constraints | Notes |
| :---- | :---- | :---- | :---- |
| \`id\` | UUID | required | identity |

### M.1 Master Surface/Engine Mapping Table

| Engine concept | Spec home | Surface metaphor | Tier visibility | Notes |
| :---- | :---- | :---- | :---- | :---- |
| Workspace entity | §4.3.1 | Evaluation | All | mapped |

### M.5 Catalog {#m-5-catalog}

| Gate ID | Phase | Runtime status | Execution context | Assertion | Override path | Runbook |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| \`known_gate\` | M02.3 | runtime_active | spec | checks | none | local |
`;

test("detects an uncovered entity field", () => {
  const post = BASE.replace(
    "| `id` | UUID | required | identity |",
    "| `id` | UUID | required | identity |\n| `risk_token` | String | required | internal |",
  );
  const result = detectCoverage(BASE, post, []);
  assert.equal(result.triggered_concepts.length, 1);
  assert.equal(result.triggered_concepts[0]?.conceptClass, "entity_field");
  assert.equal(result.triggered_concepts[0]?.conceptName, "risk_token");
  assert.equal(result.triggered_concepts[0]?.coveredByAppendixM, false);
});

test("accepts a same-diff Appendix M.1 coverage row", () => {
  const post = BASE
    .replace(
      "| `id` | UUID | required | identity |",
      "| `id` | UUID | required | identity |\n| `risk_token` | String | required | internal |",
    )
    .replace(
      "| Workspace entity | §4.3.1 | Evaluation | All | mapped |",
      "| Workspace entity | §4.3.1 | Evaluation | All | mapped |\n| `risk_token` | §4.3.1 | No surface | Internal-only | mapped |",
    );
  const result = detectCoverage(BASE, post, []);
  assert.equal(result.triggered_concepts[0]?.coveredByAppendixM, true);
});

test("filters prose, comments, whitespace, and aliased-anchor-only edits", () => {
  const pre = `${BASE}\n### Stable heading {#old-anchor}\nText.\n`;
  const post = `${BASE}\n\n<!-- comment -->\n### Stable heading {#new-anchor}\nRewritten text only.\n`;
  const result = detectCoverage(pre, post, [
    { deprecatedAnchor: "old-anchor", canonicalAnchor: "new-anchor" },
  ]);
  assert.deepEqual(result.triggered_concepts, []);
  assert.deepEqual(result.orphan_inline_gate_references, []);
});

test("rejects an orphan Appendix M.5 inline gate reference", () => {
  const post = `${BASE}\nImplementation uses Appendix M.5 \`missing_gate\`.\n`;
  const result = detectCoverage(BASE, post, []);
  assert.equal(result.orphan_inline_gate_references.length, 1);
  assert.equal(result.orphan_inline_gate_references[0]?.gateId, "missing_gate");
});

test("detects representative concepts across all twelve trigger classes", () => {
  const pre = `${BASE}
## 5 RBAC {#5-rbac}
### 5.11 Matrix {#5-11-matrix}
| Capability | Free | Solo |
| :---- | :---- | :---- |
| view | yes | yes |
## 31 Webhooks {#31-webhooks}
| event_kind | Payload |
| :---- | :---- |
| existing.event | id |
## Appendix C {#appendix-c}
| event_kind | kind | channel |
| :---- | :---- | :---- |
| existing.notice | notification | in_app |
## Appendix G {#appendix-g}
| event_name | properties |
| :---- | :---- |
| existing_event | id |
## Appendix J {#appendix-j}
| value | meaning |
| :---- | :---- |
| old | old value |
## Appendix L {#appendix-l}
| From | To | Trigger | Conditions | Notes |
| :---- | :---- | :---- | :---- | :---- |
| draft | active | publish | allowed | existing |
## 32 API {#32-api}
`;
  const post = pre
    .replace("### 4.3.1 Workspace", "### 4.3.2 ReviewQueue {#4-3-2-review-queue}\n\n| Field | Type | Constraints | Notes |\n| :---- | :---- | :---- | :---- |\n| `queue_id` | UUID | required | identity |\n\n### 4.3.1 Workspace")
    .replace("| `id` | UUID | required | identity |", "| `id` | UUID | required | identity |\n| `risk_token` | String | required | internal |")
    .replace("## 5 RBAC", "## 4.8.2 AIOperation {#4-8-2-aioperation}\n| capability_id | cost_center | model_tier |\n| :---- | :---- | :---- |\n| new_ai_capability | seller | standard |\n## 5 RBAC")
    .replace("| view | yes | yes |", "| view | yes | yes |\n| export_review | no | yes |")
    .replace("| existing.event | id |", "| existing.event | id |\n| review.created | id |")
    .replace("| existing.notice | notification | in_app |", "| existing.notice | notification | in_app |\n| review.ready | notification | email |")
    .replace("| existing_event | id |", "| existing_event | id |\n| review_completed | id |")
    .replace("| old | old value |", "| old | old value |\n| review_pending | new value |")
    .replace("| draft | active | publish | allowed | existing |", "| draft | active | publish | allowed | existing |\n| active | archived | close | allowed | new |")
    .replace("## 32 API {#32-api}", "## 32 API {#32-api}\n### 32.9.1 POST /v1/reviews {#32-9-1-post-reviews}\n")
    .replace("Implementation uses Appendix M.5", "Implementation uses Appendix M.5");

  const withPlanAndCapability = `${post}\n### 13.99 Review export {#13-99-review-export}\n1. Acceptance Criteria: users can export reviews.\nPlan tier: Solo+.\nImplementation uses Appendix M.5 \`known_gate\`.\n`;
  const result = detectCoverage(pre, withPlanAndCapability, []);
  const classes = new Set(result.triggered_concepts.map((item) => item.conceptClass));
  for (const expected of [
    "entity", "entity_field", "aioperation", "capability_non_ai", "enum_value",
    "state_machine_state", "plan_tier_feature", "webhook_event", "notification_event",
    "posthog_event", "api_endpoint", "named_ci_gate",
  ]) assert.ok(classes.has(expected as never), `missing ${expected}`);
});
