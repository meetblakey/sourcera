import { strict as assert } from "node:assert";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";
import {
  buildLinearRiskPublicationPlan,
  type LinearRiskNativeCatalogSnapshot,
} from "./lib/linear-risk-plan.js";

const risksRaw = readFileSync(resolve(process.cwd(), "delivery/risks.json"), "utf8");
const TEAM_ID = "ee9dd198-4816-4836-9226-42765878d793";
const USER_ID = "e7e65e19-33ee-445e-9be4-7e9e734a5463";
const TYPE_GROUP_ID = "11111111-1111-4111-8111-111111111111";
const RISK_GROUP_ID = "22222222-2222-4222-8222-222222222222";

function native(): LinearRiskNativeCatalogSnapshot {
  return {
    liveCaptureRoot: "a".repeat(64),
    semanticPlanRoot: "b".repeat(64),
    semanticPlanValidated: true,
    catalogComplete: true,
    issuesComplete: true,
    capturedTeamIssueCount: 0,
    team: { id: TEAM_ID, key: "REQ", name: "Requirements", archivedAt: null },
    state: {
      id: "f7372f4e-b2ef-4740-896a-5a213d7517be",
      name: "Approved",
      type: "completed",
      teamId: TEAM_ID,
      archivedAt: null,
    },
    assignee: { id: USER_ID, name: "Blake Rowley", active: true, archivedAt: null },
    projects: [
      { id: "532e0956-047a-4f09-b811-2971892f62ee", name: "Platform & Delivery Foundations", teamIds: [TEAM_ID, "477029a4-9e0a-44ca-9816-5a169b6baafa"], archivedAt: null },
      { id: "45d4d9d7-f851-41f7-9f0c-640304a62c8d", name: "Identity, Organizations & Permissions", teamIds: [TEAM_ID, "477029a4-9e0a-44ca-9816-5a169b6baafa"], archivedAt: null },
      { id: "aa2e125b-1678-4369-b0d2-1f581a8f355f", name: "QA, Release, Deployment & Launch", teamIds: [TEAM_ID, "477029a4-9e0a-44ca-9816-5a169b6baafa"], archivedAt: null },
      { id: "609d8e2e-4543-4cdb-89b4-281986f93a85", name: "Security, Privacy, Compliance & Residency", teamIds: [TEAM_ID, "477029a4-9e0a-44ca-9816-5a169b6baafa"], archivedAt: null },
      { id: "4e2ce61c-405d-46f0-820c-f2e3eba1b0f0", name: "Billing, Pricing & Entitlements", teamIds: [TEAM_ID, "477029a4-9e0a-44ca-9816-5a169b6baafa"], archivedAt: null },
      { id: "b8085a88-9679-447b-9b3d-9b6ca201e182", name: "Product Analytics, Growth & Network Effects", teamIds: [TEAM_ID, "477029a4-9e0a-44ca-9816-5a169b6baafa"], archivedAt: null },
    ],
    labelGroups: [
      { id: TYPE_GROUP_ID, name: "Type", teamId: null, archivedAt: null },
      { id: RISK_GROUP_ID, name: "Risk", teamId: null, archivedAt: null },
    ],
    labels: [
      {
        id: "d90fa0c4-4743-47fd-b3a5-61a5d1627747",
        name: "security-risk",
        parentId: RISK_GROUP_ID,
        parentName: "Risk",
        teamId: null,
        color: "#B91C1C",
        description: "Security-sensitive implementation or proof work.",
        archivedAt: null,
      },
      {
        id: "dc0cd580-50d1-4b03-bcbb-3cf23d43e331",
        name: "compliance-risk",
        parentId: RISK_GROUP_ID,
        parentName: "Risk",
        teamId: null,
        color: "#991B1B",
        description: "Compliance-sensitive implementation or proof work.",
        archivedAt: null,
      },
    ],
    liveIssues: [],
    relationEndpoints: [
      { planKey: "issue:F-005", kind: "requirement", title: "Convex Backend & Real-Time Database", archivedAt: null },
      { planKey: "issue:F-007", kind: "requirement", title: "Stripe Billing Integration Completion", archivedAt: null },
      { planKey: "issue:F-132", kind: "requirement", title: "PricingTableVersion Entity", archivedAt: null },
      { planKey: "issue:F-529", kind: "requirement", title: "Billing Seat Count (Informational)", archivedAt: null },
      { planKey: "issue:F-593", kind: "requirement", title: "Data Retention & Deletion Registry", archivedAt: null },
      { planKey: "decision:DEC-PROD-001", kind: "decision", title: "Production staging and promotion remain fail-closed", archivedAt: null },
    ],
  };
}

test("builds the exact write-free plan for all 24 current risks", () => {
  const plan = buildLinearRiskPublicationPlan(risksRaw, native());

  assert.equal(plan.risks.length, 24);
  assert.equal(plan.relations.length, 8);
  assert.deepEqual(plan.audit, {
    sourceRows: 24,
    active: 24,
    stale: 0,
    sourceDuplicates: 0,
    liveDuplicates: 0,
    relationEndpointsVerified: true,
    nativeRoutingValidated: true,
  });
  assert.equal(plan.mutationAuthorized, false);
  assert.match(plan.planRoot, /^[a-f0-9]{64}$/);
  assert.deepEqual(
    plan.labels.filter((label) => label.create).map((label) => label.name).sort(),
    ["delivery-risk", "financial-risk", "risk"],
  );
  assert.deepEqual(
    plan.labels.filter((label) => !label.create).map((label) => label.name).sort(),
    ["compliance-risk", "security-risk"],
  );
  for (const risk of plan.risks) {
    assert.equal(risk.teamId, TEAM_ID);
    assert.equal(risk.assigneeId, USER_ID);
    assert.equal(risk.sourceDisposition, "active");
    assert.equal(risk.duplicateOf, null);
    assert.deepEqual(risk.description.match(/^## .+$/gm), ["## Trigger", "## Response"]);
    assert.doesNotMatch(risk.description, /linear\.app|\b(?:REQ|PLA|BUY|SEL|INT)-\d+\b/i);
    assert.equal(risk.labelPlanKeys[0], "label:risk");
  }
});

test("pins purposeful projects, priorities, grouped labels, and only explicit requirement relations", () => {
  const plan = buildLinearRiskPublicationPlan(risksRaw, native());
  const risks = new Map(plan.risks.map((risk) => [risk.sourceRiskId, risk]));

  assert.equal(risks.get("RISK-001")?.projectId, "532e0956-047a-4f09-b811-2971892f62ee");
  assert.equal(risks.get("RISK-016")?.projectId, "609d8e2e-4543-4cdb-89b4-281986f93a85");
  assert.equal(risks.get("RISK-020")?.projectId, "4e2ce61c-405d-46f0-820c-f2e3eba1b0f0");
  assert.equal(risks.get("RISK-023")?.projectId, "b8085a88-9679-447b-9b3d-9b6ca201e182");
  assert.equal(risks.get("RISK-020")?.priority, 1);
  assert.deepEqual(risks.get("RISK-020")?.labelPlanKeys, ["label:risk", "label:financial-risk"]);
  assert.deepEqual(risks.get("RISK-021")?.labelPlanKeys, ["label:risk", "label:financial-risk", "label:security-risk", "label:compliance-risk"]);
  assert.deepEqual(
    plan.relations.map(({ sourcePlanKey, targetPlanKey, type }) => ({ sourcePlanKey, targetPlanKey, type })),
    [
      { sourcePlanKey: "risk:RISK-010", targetPlanKey: "decision:DEC-PROD-001", type: "related" },
      { sourcePlanKey: "risk:RISK-020", targetPlanKey: "issue:F-007", type: "related" },
      { sourcePlanKey: "risk:RISK-021", targetPlanKey: "issue:F-007", type: "related" },
      { sourcePlanKey: "risk:RISK-021", targetPlanKey: "issue:F-132", type: "related" },
      { sourcePlanKey: "risk:RISK-021", targetPlanKey: "issue:F-529", type: "related" },
      { sourcePlanKey: "risk:RISK-021", targetPlanKey: "issue:F-593", type: "related" },
      { sourcePlanKey: "risk:RISK-023", targetPlanKey: "issue:F-007", type: "related" },
      { sourcePlanKey: "risk:RISK-024", targetPlanKey: "issue:F-005", type: "related" },
    ],
  );
});

test("is deterministic for the same source and native capture", () => {
  const first = buildLinearRiskPublicationPlan(risksRaw, native());
  const second = buildLinearRiskPublicationPlan(risksRaw, native());
  assert.deepEqual(first, second);
});

test("fails on source identity drift or duplicate source content", () => {
  const reordered = JSON.parse(risksRaw) as { risks: Array<Record<string, string>> };
  [reordered.risks[0], reordered.risks[1]] = [reordered.risks[1]!, reordered.risks[0]!];
  assert.throws(() => buildLinearRiskPublicationPlan(JSON.stringify(reordered), native()), /identities/);

  const duplicate = JSON.parse(risksRaw) as { risks: Array<Record<string, string>> };
  duplicate.risks[1]!.statement = duplicate.risks[0]!.statement!;
  assert.throws(() => buildLinearRiskPublicationPlan(JSON.stringify(duplicate), native()), /duplicate statement/);
});

test("fails when a live issue already matches a planned risk", () => {
  const snapshot = native();
  snapshot.liveIssues.push({
    issueUuid: "33333333-3333-4333-8333-333333333333",
    title: "Risk: false work readiness",
    description: "Existing risk",
    archivedAt: null,
  });
  snapshot.capturedTeamIssueCount = 1;
  assert.throws(() => buildLinearRiskPublicationPlan(risksRaw, snapshot), /duplicates a planned risk/);
});

test("fails on incomplete capture, label drift, project drift, or an unverified relation endpoint", () => {
  const incomplete = native();
  incomplete.capturedTeamIssueCount = 1;
  assert.throws(() => buildLinearRiskPublicationPlan(risksRaw, incomplete), /capture count is incomplete/);

  const labelDrift = native();
  labelDrift.labels[0]!.parentId = TYPE_GROUP_ID;
  labelDrift.labels[0]!.parentName = "Type";
  assert.throws(() => buildLinearRiskPublicationPlan(risksRaw, labelDrift), /security-risk label has drifted/);

  const projectDrift = native();
  projectDrift.projects[0]!.teamIds = ["477029a4-9e0a-44ca-9816-5a169b6baafa"];
  assert.throws(() => buildLinearRiskPublicationPlan(risksRaw, projectDrift), /outside Requirements/);

  const endpointDrift = native();
  endpointDrift.relationEndpoints = endpointDrift.relationEndpoints.filter((row) => row.planKey !== "issue:F-593");
  assert.throws(() => buildLinearRiskPublicationPlan(risksRaw, endpointDrift), /F-593.*unverified/);
});
