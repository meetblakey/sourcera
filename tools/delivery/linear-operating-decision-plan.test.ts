import { strict as assert } from "node:assert";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";
import {
  buildLinearOperatingDecisionPublicationPlan,
  OPERATING_DECISION_PROJECT_NAMES,
  OPERATING_DECISION_TITLES,
  type LinearOperatingDecisionNativeSnapshot,
} from "./lib/linear-operating-decision-plan.js";

const source = readFileSync(resolve(process.cwd(), "delivery/decisions.jsonl"), "utf8");

const TEAM_ID = "ee9dd198-4816-4836-9226-42765878d793";
const USER_ID = "e7e65e19-33ee-445e-9be4-7e9e734a5463";
const APPROVED_ID = "f7372f4e-b2ef-4740-896a-5a213d7517be";
const SUPERSEDED_ID = "11111111-1111-4111-8111-111111111111";
const DECISION_LABEL_ID = "df2bcb0f-2fca-41cb-a45c-37770a01aac2";
const TYPE_GROUP_ID = "b11e20d5-df7e-4e8b-a710-294827ff9b40";

function uuid(index: number): string {
  return `00000000-0000-4000-8000-${index.toString(16).padStart(12, "0")}`;
}

function explicitReferences(): string[] {
  const references = new Set<string>();
  const text = source.split("\n").filter(Boolean).map((line) => {
    const row = JSON.parse(line) as {
      decision: string;
      assumption: string;
      validationTrigger: string;
    };
    return `${row.decision}\n${row.assumption}\n${row.validationTrigger}`;
  }).join("\n");
  for (const match of text.matchAll(/\bF-(?:(?:AE|BC)-)?\d{3}(?:\.[A-Z0-9]+)?\b/g)) {
    references.add(match[0].replace(/^(F-(?:(?:AE|BC)-)?\d{3})(?:\.[A-Z0-9]+)?$/, "$1"));
  }
  for (const match of text.matchAll(/\b(?:PLA|SEL|BUY|INT|REQ)-[1-9]\d*\b/g)) {
    references.add(match[0]);
  }
  return [...references].sort((left, right) =>
    left.localeCompare(right, undefined, { numeric: true }));
}

const existing = {
  "PLA-162": {
    title: "Implement custom domain setup (CNAME, auto SSL, verification flow)",
    stateName: "Canceled",
    archivedAt: "2026-07-22T21:27:32.118Z",
  },
  "PLA-338": {
    title: "Domain Governance",
    stateName: "Backlog",
    archivedAt: null,
  },
  "PLA-370": {
    title: "Seller Team role authority mapping",
    stateName: "Backlog",
    archivedAt: null,
  },
  "PLA-371": {
    title: "[F-199] Seller Team Lead Role",
    stateName: "Duplicate",
    archivedAt: "2026-07-22T21:27:36.166Z",
  },
} as const;

const sourceDecisionReferences = new Set(["F-199", "F-608", "F-609", "F-610", "F-611"]);

function native(): LinearOperatingDecisionNativeSnapshot {
  const projects = OPERATING_DECISION_PROJECT_NAMES.map((name, index) => ({
    id: uuid(100 + index),
    name,
    teamIds: [TEAM_ID, "477029a4-9e0a-44ca-9816-5a169b6baafa"],
    archivedAt: null,
  }));
  const defaultProjectId = projects[0]!.id;
  return {
    liveCaptureRoot: "a".repeat(64),
    semanticPlanRoot: "b".repeat(64),
    semanticPlanValidated: true,
    catalogComplete: true,
    issuesComplete: true,
    relationsComplete: true,
    capturedTeamIssueCount: 0,
    issueTeamKeys: ["REQ", "PLA", "BUY", "SEL", "INT"],
    team: {
      id: TEAM_ID,
      key: "REQ",
      name: "Requirements",
      archivedAt: null,
    },
    states: [
      {
        id: APPROVED_ID,
        name: "Approved",
        type: "completed",
        teamId: TEAM_ID,
        archivedAt: null,
      },
      {
        id: SUPERSEDED_ID,
        name: "Superseded",
        type: "canceled",
        teamId: TEAM_ID,
        archivedAt: null,
      },
    ],
    assignee: {
      id: USER_ID,
      name: "Blake Rowley",
      active: true,
      archivedAt: null,
    },
    projects,
    decisionLabel: {
      id: DECISION_LABEL_ID,
      name: "decision",
      semanticRole: "decision",
      parentId: TYPE_GROUP_ID,
      parentName: "Type",
      teamId: null,
      archivedAt: null,
    },
    relationEndpoints: explicitReferences()
      .filter((reference) => reference !== "F-914" && reference !== "F-918")
      .map((reference, index) => {
        const expected = existing[reference as keyof typeof existing];
        if (expected) {
          return {
            sourceReference: reference,
            planKey: `relation-target:${reference}`,
            kind: "existing_issue" as const,
            issueUuid: uuid(500 + index),
            issueIdentifier: reference,
            title: expected.title,
            projectId: defaultProjectId,
            stateName: expected.stateName,
            archivedAt: expected.archivedAt,
          };
        }
        return {
          sourceReference: reference,
          planKey: `${sourceDecisionReferences.has(reference) ? "decision" : "issue"}:${reference}`,
          kind: sourceDecisionReferences.has(reference) ? "source_decision" as const : "requirement" as const,
          issueUuid: null,
          issueIdentifier: null,
          title: `Canonical capability ${reference}`,
          projectId: defaultProjectId,
          stateName: null,
          archivedAt: null,
        };
      }),
    liveIssues: [],
  };
}

function rows(): Array<Record<string, unknown>> {
  return source.trimEnd().split("\n").map((line) => JSON.parse(line) as Record<string, unknown>);
}

function serialize(values: Array<Record<string, unknown>>): string {
  return `${values.map((row) => JSON.stringify(row)).join("\n")}\n`;
}

test("builds a deterministic, write-free native plan for all operating Decisions", () => {
  const first = buildLinearOperatingDecisionPublicationPlan(source, native());
  const second = buildLinearOperatingDecisionPublicationPlan(source, native());

  assert.equal(first.schemaVersion, 1);
  assert.equal(first.mutationAuthorized, false);
  assert.equal(first.planRoot, second.planRoot);
  assert.deepEqual(first.audit, {
    sourceRows: 85,
    active: 70,
    superseded: 15,
    decisionsWithLiteralReferences: 47,
    distinctLiteralReferences: 74,
    reviewedNonEndpointReferences: 4,
    decisionsWithNativeRelations: 46,
    distinctReferenceEndpoints: 70,
    relatedRelations: 89,
    blockRelations: 10,
    sourceDuplicates: 0,
    liveDuplicates: 0,
    relationEndpointsVerified: true,
    nativeRoutingValidated: true,
    descriptionsSanitized: true,
  });
  assert.equal(first.decisions.length, 85);
  assert.equal(first.decisions.filter((row) => row.sourceStatus === "active").length, 70);
  assert.equal(first.decisions.filter((row) => row.sourceStatus === "superseded").length, 15);
  assert.equal(first.relations.length, 99);
  assert.deepEqual(
    first.reviewedNonRelations.map((row) => row.sourceReference),
    ["F-914", "F-918", "PLA-162", "PLA-371"],
  );
  assert.ok(first.reviewedNonRelations.every((row) => row.rationale.length > 50));
  assert.ok(!first.relations.some((row) =>
    ["F-914", "F-918", "PLA-162", "PLA-371"].some((reference) =>
      row.sourcePlanKey.endsWith(`:${reference}`) || row.targetPlanKey.endsWith(`:${reference}`))));
  for (const reference of sourceDecisionReferences) {
    assert.ok(first.relations.some((row) =>
      row.type === "related" && row.targetPlanKey === `decision:${reference}`));
  }
  assert.equal(new Set(first.decisions.map((row) => row.title.toLocaleLowerCase("en-US"))).size, 85);
  assert.ok(new Set(first.decisions.map((row) => row.projectId)).size >= 15);
  assert.deepEqual([...new Set(first.decisions.map((row) => row.priority))].sort(), [1, 2, 3, 4]);

  const production = first.decisions.find((row) => row.sourceDecisionId === "DEC-PROD-001");
  assert.equal(production?.title, "Production staging and promotion remain fail-closed");
  assert.equal(OPERATING_DECISION_TITLES["DEC-PROD-001"], production?.title);
  assert.equal(production?.priority, 1);
  assert.equal(production?.planKey, "decision:DEC-PROD-001");

  for (const decision of first.decisions) {
    assert.equal(decision.teamId, TEAM_ID);
    assert.equal(decision.assigneeId, USER_ID);
    assert.deepEqual(decision.labelIds, [DECISION_LABEL_ID]);
    assert.equal(
      decision.stateId,
      decision.sourceStatus === "active" ? APPROVED_ID : SUPERSEDED_ID,
    );
    assert.match(decision.description, /^## Decision\n\n.+\n\n## Assumption\n\n.+\n\n## Re-evaluate\n\n.+$/s);
    assert.doesNotMatch(
      decision.description,
      /\b(?:DEC-[A-Z0-9-]+|PROD-\d+|WIP-\d+|AE-\d+|D\d+|F-(?:(?:AE|BC)-)?\d{3}(?:\.[A-Z0-9]+)?|RG(?::|-)[a-z0-9_.-]+|(?:PLA|SEL|BUY|INT|REQ)-[1-9]\d*)\b/i,
    );
    assert.doesNotMatch(decision.description, /https?:\/\//i);
    assert.doesNotMatch(
      decision.description,
      /^(?:Project|State|Status|Priority|Owner|Assignee|Labels?|Team|Relations?|Blocked by):/im,
    );
  }
});

test("emits only the ten directly evidenced block edges", () => {
  const plan = buildLinearOperatingDecisionPublicationPlan(source, native());
  const blocks = plan.relations
    .filter((row) => row.type === "blocks")
    .map((row) => `${row.sourcePlanKey}->${row.targetPlanKey}`)
    .sort();
  assert.deepEqual(blocks, [
    "issue:F-001->issue:F-006",
    "issue:F-005->issue:F-002",
    "issue:F-005->issue:F-006",
    "issue:F-006->issue:F-002",
    "issue:F-128->issue:F-738",
    "issue:F-160->issue:F-139",
    "issue:F-212->issue:F-213",
    "issue:F-213->issue:F-214",
    "issue:F-527->issue:F-636",
    "issue:F-527->issue:F-637",
  ]);
  assert.ok(plan.relations.some((row) =>
    row.type === "related" &&
    row.sourcePlanKey === "decision:DEC-REL-F630-001" &&
    row.targetPlanKey === "issue:F-630"));
  assert.ok(!blocks.includes("issue:F-630->issue:F-687"));
});

test("resolves an explicit runtime-gate alias through its captured native issue", () => {
  const changed = rows();
  changed[11]!.decision = (changed[11]!.decision as string).replace("F-023", "RG:solo_mode");
  const snapshot = native();
  snapshot.relationEndpoints = snapshot.relationEndpoints.filter((row) =>
    row.sourceReference !== "F-023");
  snapshot.relationEndpoints.push({
    sourceReference: "RG:solo_mode",
    planKey: "relation-target:PLA-999",
    kind: "existing_issue",
    issueUuid: uuid(999),
    issueIdentifier: "PLA-999",
    title: "Prove the Solo Mode runtime gate",
    projectId: snapshot.projects[0]!.id,
    stateName: "Backlog",
    archivedAt: null,
  });
  const plan = buildLinearOperatingDecisionPublicationPlan(serialize(changed), snapshot);
  assert.ok(plan.relations.some((row) =>
    row.type === "related" &&
    row.sourcePlanKey === "decision:DEC-REL-SOLO-001" &&
    row.targetPlanKey === "relation-target:PLA-999"));
  assert.doesNotMatch(
    plan.decisions.find((row) => row.sourceDecisionId === "DEC-REL-SOLO-001")!.description,
    /RG:solo_mode/,
  );
});

test("ignores unrelated complete-catalog endpoints while validating referenced ones", () => {
  const snapshot = native();
  snapshot.relationEndpoints.push({
    sourceReference: "PLA-999",
    planKey: "relation-target:PLA-999",
    kind: "existing_issue",
    issueUuid: uuid(998),
    issueIdentifier: "PLA-999",
    title: "Unrelated captured issue",
    projectId: snapshot.projects[0]!.id,
    stateName: "Done",
    archivedAt: null,
  });
  assert.equal(
    buildLinearOperatingDecisionPublicationPlan(source, snapshot).audit.sourceRows,
    85,
  );
});

test("fails on missing, unknown, duplicate, reordered, or status-drifted source identities", () => {
  const missing = rows();
  missing.pop();
  assert.throws(
    () => buildLinearOperatingDecisionPublicationPlan(serialize(missing), native()),
    /exactly 85|source identities/i,
  );

  const unknown = rows();
  unknown[0]!.id = "DEC-UNKNOWN-001";
  assert.throws(
    () => buildLinearOperatingDecisionPublicationPlan(serialize(unknown), native()),
    /source identities/i,
  );

  const reordered = rows();
  [reordered[0], reordered[1]] = [reordered[1]!, reordered[0]!];
  assert.throws(
    () => buildLinearOperatingDecisionPublicationPlan(serialize(reordered), native()),
    /canonical order/i,
  );

  const status = rows();
  status[0]!.status = "superseded";
  assert.throws(
    () => buildLinearOperatingDecisionPublicationPlan(serialize(status), native()),
    /status counts|status has drifted/i,
  );
});

test("fails on source schema or semantic duplication drift", () => {
  const extra = rows();
  extra[0]!.project = "copied metadata";
  assert.throws(
    () => buildLinearOperatingDecisionPublicationPlan(serialize(extra), native()),
    /keys differ/i,
  );

  const duplicate = rows();
  duplicate[1]!.decision = duplicate[0]!.decision;
  assert.throws(
    () => buildLinearOperatingDecisionPublicationPlan(serialize(duplicate), native()),
    /duplicate decision semantics/i,
  );

  const url = rows();
  url[0]!.decision = `${url[0]!.decision} https://linear.app/example`;
  assert.throws(
    () => buildLinearOperatingDecisionPublicationPlan(serialize(url), native()),
    /contains a URL/i,
  );

  const unknownReference = rows();
  unknownReference[0]!.decision = `${unknownReference[0]!.decision} See OPSX-1.`;
  assert.throws(
    () => buildLinearOperatingDecisionPublicationPlan(serialize(unknownReference), native()),
    /unclassified source or issue reference/i,
  );
});

test("fails if explicit dependency evidence drifts", () => {
  const changed = rows();
  changed[7]!.decision = "F-005 Convex persistence foundation is related to F-002 dual-console data isolation.";
  assert.throws(
    () => buildLinearOperatingDecisionPublicationPlan(serialize(changed), native()),
    /explicit block evidence has drifted/i,
  );
});

test("fails rather than fabricating an unreviewed non-endpoint token", () => {
  const changed = rows();
  changed[46]!.validationTrigger = (changed[46]!.validationTrigger as string)
    .replace("F-914", "F-919");
  assert.throws(
    () => buildLinearOperatingDecisionPublicationPlan(serialize(changed), native()),
    /endpoint F-919 is missing/i,
  );
});

test("fails closed on incomplete or invalid native capture", () => {
  const incomplete = native();
  incomplete.relationsComplete = false as true;
  assert.throws(
    () => buildLinearOperatingDecisionPublicationPlan(source, incomplete),
    /capture is incomplete/i,
  );

  const count = native();
  count.capturedTeamIssueCount = 1;
  assert.throws(
    () => buildLinearOperatingDecisionPublicationPlan(source, count),
    /capture count is incomplete/i,
  );

  const team = native();
  team.team.key = "PLA";
  assert.throws(
    () => buildLinearOperatingDecisionPublicationPlan(source, team),
    /Requirements team/i,
  );
});

test("fails on native state, owner, label, or project drift", () => {
  const state = native();
  state.states[1]!.name = "Canceled";
  assert.throws(
    () => buildLinearOperatingDecisionPublicationPlan(source, state),
    /Superseded state/i,
  );

  const owner = native();
  owner.assignee.name = "Another owner";
  assert.throws(
    () => buildLinearOperatingDecisionPublicationPlan(source, owner),
    /accountable owner/i,
  );

  const label = native();
  label.decisionLabel.parentName = "Domain";
  assert.throws(
    () => buildLinearOperatingDecisionPublicationPlan(source, label),
    /Type\/decision/i,
  );

  const project = native();
  project.projects[0]!.archivedAt = "2026-07-27T00:00:00.000Z";
  assert.throws(
    () => buildLinearOperatingDecisionPublicationPlan(source, project),
    /missing, archived, or outside Requirements/i,
  );
});

test("fails on missing, ambiguous, or lifecycle-drifted reference endpoints", () => {
  const missing = native();
  missing.relationEndpoints = missing.relationEndpoints.filter((row) => row.sourceReference !== "F-005");
  assert.throws(
    () => buildLinearOperatingDecisionPublicationPlan(source, missing),
    /endpoint F-005 is missing/i,
  );

  const ambiguous = native();
  ambiguous.relationEndpoints.push({ ...ambiguous.relationEndpoints[0]! });
  assert.throws(
    () => buildLinearOperatingDecisionPublicationPlan(source, ambiguous),
    /ambiguous or duplicated/i,
  );

  const lifecycle = native();
  lifecycle.relationEndpoints.find((row) => row.sourceReference === "PLA-162")!.archivedAt = null;
  assert.throws(
    () => buildLinearOperatingDecisionPublicationPlan(source, lifecycle),
    /identity or lifecycle has drifted/i,
  );

  const title = native();
  title.relationEndpoints.find((row) => row.sourceReference === "PLA-370")!.title = "Wrong issue";
  assert.throws(
    () => buildLinearOperatingDecisionPublicationPlan(source, title),
    /identity or lifecycle has drifted/i,
  );
});

test("fails on duplicate or stale live Decision semantics", () => {
  const baseline = buildLinearOperatingDecisionPublicationPlan(source, native());
  const duplicateTitle = native();
  duplicateTitle.liveIssues.push({
    issueUuid: uuid(900),
    title: baseline.decisions[0]!.title,
    description: "Different text",
    teamId: TEAM_ID,
    projectId: baseline.decisions[0]!.projectId,
    stateId: APPROVED_ID,
    assigneeId: USER_ID,
    priority: 2,
    labelIds: [DECISION_LABEL_ID],
    sourceDecisionId: null,
    archivedAt: null,
  });
  duplicateTitle.capturedTeamIssueCount = 1;
  assert.throws(
    () => buildLinearOperatingDecisionPublicationPlan(source, duplicateTitle),
    /duplicates a planned operating Decision/i,
  );

  const unknownSource = native();
  unknownSource.liveIssues.push({
    issueUuid: uuid(901),
    title: "Existing unrelated Decision",
    description: "Unrelated",
    teamId: TEAM_ID,
    projectId: null,
    stateId: APPROVED_ID,
    assigneeId: USER_ID,
    priority: 3,
    labelIds: [DECISION_LABEL_ID],
    sourceDecisionId: "DEC-UNKNOWN-999",
    archivedAt: null,
  });
  unknownSource.capturedTeamIssueCount = 1;
  assert.throws(
    () => buildLinearOperatingDecisionPublicationPlan(source, unknownSource),
    /unknown operating Decision source identity/i,
  );

  const duplicateLiveTitle = native();
  duplicateLiveTitle.liveIssues = [0, 1].map((index) => ({
    issueUuid: uuid(910 + index),
    title: "Duplicated live title",
    description: `Unrelated ${index}`,
    teamId: TEAM_ID,
    projectId: null,
    stateId: APPROVED_ID,
    assigneeId: USER_ID,
    priority: 3,
    labelIds: [DECISION_LABEL_ID],
    sourceDecisionId: null,
    archivedAt: null,
  }));
  duplicateLiveTitle.capturedTeamIssueCount = 2;
  assert.throws(
    () => buildLinearOperatingDecisionPublicationPlan(source, duplicateLiveTitle),
    /duplicate title/i,
  );
});
