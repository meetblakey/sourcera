import { strict as assert } from "node:assert";
import { createHash } from "node:crypto";
import test from "node:test";
import {
  assertLinearAuthorityApplyWindow,
  assertLinearAuthorityNativeSelectors,
  buildLinearAuthorityNativeSelectors,
  buildLinearAuthorityPublicationOperationPlan,
  classifyLinearAuthorityRelationCatalogRow,
  computeLinearAuthorityOperationsRoot,
  executeLinearAuthorityPublication,
  linearAuthorityEntityStateMatchesPrecondition,
  minimumLinearAuthorityHttpAttempts,
  preflightLinearAuthorityPublication,
  sealLinearAuthorityOperation,
  validateLinearAuthorityPublicationOperationProjection,
  type LinearAuthorityPublicationOperation,
  type LinearAuthorityPublicationOperationPlan,
  type LinearAuthorityLabelGroupSelectorContract,
  type LinearAuthorityRemoteEntity,
  type LinearAuthorityRemoteRelation,
  type LinearAuthorityWriteTransport,
} from "./lib/linear-authority-publisher.js";
import type {
  AuthorityManagedTarget,
  LinearAuthorityAllocation,
  LinearAuthorityManifest,
} from "./lib/linear-authority-manifest.js";
import type { ValidatedLinearAuthoritySemanticPlanV4 } from "./lib/linear-authority-semantic-plan-v4.js";
import { parseLinearAuthoritySemanticPlanV4 } from "./lib/linear-authority-semantic-plan-v4.js";
import { buildValidatorValidLinearAuthorityPackageV2Fixture } from "./linear-authority-package-v2.fixture.js";

const PLAN_ROOT = "1".repeat(64);
const SOURCE_ROOT = "2".repeat(64);
const CAPTURE_ROOT = "3".repeat(64);
const SEMANTIC_ROOT = "4".repeat(64);
const EXISTING_ISSUE = "00000000-0000-4000-8000-000000000001";
const NEW_ISSUE = "00000000-0000-4000-8000-000000000002";
const NEW_DECISION = "00000000-0000-4000-8000-000000000003";
const NEW_RELATION = "00000000-0000-4000-8000-000000000004";

const sha256 = (value: string): string => createHash("sha256").update(value).digest("hex");

function canonical(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
  const row = value as Record<string, unknown>;
  return `{${Object.keys(row).sort().map((key) => `${JSON.stringify(key)}:${canonical(row[key])}`).join(",")}}`;
}

function target(kind: "requirement" | "decision", planKey: string, title: string, adopted: boolean): AuthorityManagedTarget {
  const description = `${title} body`;
  const row: AuthorityManagedTarget = {
    kind,
    origin: "source",
    planKey,
    title,
    expectedCurrentIssueUuid: adopted ? EXISTING_ISSUE : null,
    expectedCurrentDescriptionSha256: adopted ? sha256("old description") : null,
    expectedCurrentNativeSha256: adopted ? sha256("old native state") : null,
    expectedIdentifier: adopted ? "REQ-1" : null,
    blockKeys: [`slice:${planKey}`],
    description,
    descriptionSha256: sha256(description),
    payloadSha256: sha256(`manifest-payload:${planKey}`),
    teamPlanKey: "team:requirements",
    projectPlanKey: "project:alpha",
    statePlanKey: "state:approved",
    labelPlanKeys: [kind === "requirement" ? "label:requirement" : "label:decision"],
    priority: 2,
    estimate: null,
    dueDate: null,
    cyclePlanKey: null,
    milestonePlanKey: null,
    releasePlanKeys: [],
    parentPlanKey: null,
    assigneePlanKey: null,
  };
  return row;
}

interface ProjectionFixture {
  manifest: LinearAuthorityManifest & { schemaVersion: 2 };
  allocation: LinearAuthorityAllocation;
  semantic: ValidatedLinearAuthoritySemanticPlanV4;
  plan: LinearAuthorityPublicationOperationPlan;
}

function projectionFixture(): ProjectionFixture {
  const requirementOne = target("requirement", "issue:F-001", "Existing requirement", true);
  const requirementTwo = target("requirement", "issue:F-002", "New requirement", false);
  const decision = target("decision", "decision:F-003", "New decision", false);
  const manifest = {
    schemaVersion: 2,
    sourceCommit: "a".repeat(40),
    planRoot: PLAN_ROOT,
    sourceSetRoot: SOURCE_ROOT,
    liveCaptureRoot: CAPTURE_ROOT,
    requirements: [requirementOne, requirementTwo],
    decisions: [decision],
    risks: [],
    documents: [],
    references: [],
    issueDescriptionRepairs: [],
    nativeRelations: [{
      planKey: "relation:related:F-001:F-002",
      type: "related",
      sourcePlanKey: "issue:F-001",
      targetPlanKey: "issue:F-002",
    }],
  } as unknown as LinearAuthorityManifest & { schemaVersion: 2 };
  const allocation: LinearAuthorityAllocation = {
    schemaVersion: 1,
    planRoot: PLAN_ROOT,
    sourceSetRoot: SOURCE_ROOT,
    liveCaptureRoot: CAPTURE_ROOT,
    allocations: [
      { planKey: "issue:F-001", kind: "issue", title: requirementOne.title, identifier: "REQ-1", uuid: EXISTING_ISSUE, source: "adopted" },
      { planKey: "issue:F-002", kind: "issue", title: requirementTwo.title, identifier: null, uuid: NEW_ISSUE, source: "allocated" },
      { planKey: "decision:F-003", kind: "decision", title: decision.title, identifier: null, uuid: NEW_DECISION, source: "allocated" },
      { planKey: "relation:related:F-001:F-002", kind: "relation", title: null, identifier: null, uuid: NEW_RELATION, source: "allocated" },
    ],
  };
  const semantic = {
    semanticPlanInternalsValidated: true,
    captureEvidenceValidated: true,
    semanticCoverageValidated: false,
    mutationAuthorized: false,
    semanticRoot: SEMANTIC_ROOT,
    plan: {
      schemaVersion: 4,
      publicationSequence: ["F-001", "F-002"],
      adoptedRequirementReconciliation: [{
        canonicalLegacyId: "F-001",
        issueUuid: EXISTING_ISSUE,
        issueIdentifier: "REQ-1",
        descriptionUpdateRequired: true,
        priorityUpdateRequired: false,
        executionRelationsToAdd: [],
        requirementDependencyLegacyIdsToAdd: ["F-002"],
        proofExecutionDependenciesToAdd: [],
      }],
    },
  } as unknown as ValidatedLinearAuthoritySemanticPlanV4;
  const plan = buildLinearAuthorityPublicationOperationPlan({ manifest, allocation, semantic });
  return { manifest, allocation, semantic, plan };
}

const raw = (plan: LinearAuthorityPublicationOperationPlan): string => JSON.stringify(plan);

function resealPlan(plan: LinearAuthorityPublicationOperationPlan, operations: LinearAuthorityPublicationOperation[]): LinearAuthorityPublicationOperationPlan {
  return { ...plan, operations, operationsRoot: computeLinearAuthorityOperationsRoot(operations) };
}

test("operation projection is deterministic, dependency ordered, and additive-only", () => {
  const f = projectionFixture();
  const second = buildLinearAuthorityPublicationOperationPlan({ manifest: f.manifest, allocation: f.allocation, semantic: f.semantic });
  assert.deepEqual(second, f.plan);
  assert.deepEqual(f.plan.operations.map((row) => [row.kind, row.planKey]), [
    ["update_entity", "issue:F-001"],
    ["create_entity", "issue:F-002"],
    ["create_entity", "decision:F-003"],
    ["create_relation", "relation:related:F-001:F-002"],
  ]);
  assert.equal(f.plan.operations.some((row) => /delete|archive|remove/i.test(row.kind)), false);
  assert.deepEqual(validateLinearAuthorityPublicationOperationProjection({
    operationsRaw: raw(f.plan),
    manifest: f.manifest,
    allocation: f.allocation,
    semantic: f.semantic,
  }), f.plan);
});

test("exact adopted Decisions, Risks, and completed SEL-122 repair project no operations", () => {
  const f = projectionFixture();
  const decision = f.manifest.decisions[0]!;
  decision.expectedCurrentIssueUuid = NEW_DECISION;
  decision.expectedCurrentDescriptionSha256 = decision.descriptionSha256;
  decision.expectedCurrentNativeSha256 = sha256("exact decision native state");
  decision.expectedIdentifier = "REQ-3";
  const decisionAllocation = f.allocation.allocations.find((row) => row.planKey === decision.planKey)!;
  Object.assign(decisionAllocation, { source: "adopted", identifier: "REQ-3" });
  const risk = structuredClone(decision);
  risk.kind = "risk";
  risk.origin = "registry";
  risk.planKey = "risk:RISK-001";
  risk.title = "Exact adopted risk";
  risk.expectedCurrentIssueUuid = "00000000-0000-4000-8000-000000000099";
  risk.expectedIdentifier = "REQ-99";
  f.manifest.risks.push(risk);
  f.allocation.allocations.push({ planKey: risk.planKey, kind: "risk", title: risk.title, identifier: "REQ-99", uuid: risk.expectedCurrentIssueUuid, source: "adopted" });
  const clean = "<requirement id=\"example-requirement-a\">A</requirement>\n<requirement id=\"example-requirement-b\">B</requirement>";
  f.manifest.issueDescriptionRepairs.push({
    issueUuid: "00000000-0000-4000-8000-000000000098",
    identifier: "SEL-122",
    expectedCurrentDescriptionSha256: sha256(clean),
    desiredDescription: clean,
    desiredDescriptionSha256: sha256(clean),
    requiresNoNativeRelations: true,
  });
  const plan = buildLinearAuthorityPublicationOperationPlan({ manifest: f.manifest, allocation: f.allocation, semantic: f.semantic });
  assert.equal(plan.operations.some((row) => row.planKey === decision.planKey), false);
  assert.equal(plan.operations.some((row) => row.planKey === risk.planKey), false);
  assert.equal(plan.operations.some((row) => row.planKey === "repair:SEL-122"), false);
});

test("a re-pinned wrong entity payload cannot pass exact manifest projection", () => {
  const f = projectionFixture();
  const operations = structuredClone(f.plan.operations);
  const original = operations[1];
  assert.equal(original.kind, "create_entity");
  if (original.kind !== "create_entity") return;
  const body = {
    operationKey: original.operationKey,
    planKey: original.planKey,
    kind: original.kind,
    entityKind: original.entityKind,
    allocationUuid: original.allocationUuid,
    desiredPayloadSha256: sha256(canonical({ ...original.payload, description: "attacker-replaced body" })),
    payload: { ...original.payload, description: "attacker-replaced body" },
  } as const;
  operations[1] = sealLinearAuthorityOperation(PLAN_ROOT, body);
  const modified = resealPlan(f.plan, operations);
  assert.throws(() => validateLinearAuthorityPublicationOperationProjection({
    operationsRaw: raw(modified),
    manifest: f.manifest,
    allocation: f.allocation,
    semantic: f.semantic,
  }), /not the exact projection/);
});

test("missing or extra native relation operations cannot pass exact projection", () => {
  const f = projectionFixture();
  const missing = resealPlan(f.plan, f.plan.operations.filter((row) => row.kind !== "create_relation"));
  assert.throws(() => validateLinearAuthorityPublicationOperationProjection({
    operationsRaw: raw(missing),
    manifest: f.manifest,
    allocation: f.allocation,
    semantic: f.semantic,
  }), /not the exact projection/);

  const extraRelation = sealLinearAuthorityOperation(PLAN_ROOT, {
    operationKey: "create:relation:related:F-001:F-003",
    planKey: "relation:related:F-001:F-003",
    kind: "create_relation",
    allocationUuid: "00000000-0000-4000-8000-000000000005",
    relationType: "related",
    sourcePlanKey: "issue:F-001",
    targetPlanKey: "decision:F-003",
    expectedCanonicalKey: null,
  });
  const extra = resealPlan(f.plan, [...f.plan.operations, extraRelation]);
  assert.throws(() => validateLinearAuthorityPublicationOperationProjection({
    operationsRaw: raw(extra),
    manifest: f.manifest,
    allocation: f.allocation,
    semantic: f.semantic,
  }), /not the exact projection/);
});

test("future Linear identifiers are never fabricated for relation keys", () => {
  const f = projectionFixture();
  const relation = f.plan.operations.find((row) => row.kind === "create_relation");
  assert.ok(relation && relation.kind === "create_relation");
  assert.equal(relation.expectedCanonicalKey, null);
  assert.equal(relation.allocationUuid, NEW_RELATION);
});

test("unsupported destructive operation kinds fail before projection comparison", () => {
  const f = projectionFixture();
  const parsed = JSON.parse(raw(f.plan)) as { operations: Array<Record<string, unknown>> };
  parsed.operations[0].kind = "delete_issue";
  assert.throws(() => validateLinearAuthorityPublicationOperationProjection({
    operationsRaw: JSON.stringify(parsed),
    manifest: f.manifest,
    allocation: f.allocation,
    semantic: f.semantic,
  }), /prohibited or unsupported kind/);
});

test("entity preconditions detect title, body, and native drift explicitly", () => {
  const expected = {
    projection: "managed_issue" as const,
    titleSha256: sha256("Title"),
    bodySha256: sha256("Body"),
    nativeSha256: sha256("Native"),
  };
  const state = {
    ...expected,
    authorityPayloadSha256: sha256("Desired projection"),
  };
  assert.equal(linearAuthorityEntityStateMatchesPrecondition(state, expected), true);
  assert.equal(linearAuthorityEntityStateMatchesPrecondition({ ...state, titleSha256: sha256("Changed title") }, expected), false);
  assert.equal(linearAuthorityEntityStateMatchesPrecondition({ ...state, bodySha256: sha256("Changed body") }, expected), false);
  assert.equal(linearAuthorityEntityStateMatchesPrecondition({ ...state, nativeSha256: sha256("Changed native fields") }, expected), false);
  assert.equal(linearAuthorityEntityStateMatchesPrecondition(state, { projection: "description_only", bodySha256: expected.bodySha256 }), true);
});

test("live apply window expires on either capture age or total apply duration", () => {
  assert.doesNotThrow(() => assertLinearAuthorityApplyWindow({
    capturedAtMs: 1_000,
    applyStartedAtMs: 2_000,
    nowMs: 2_999,
    maxCaptureAgeMs: 5_000,
    maxApplyDurationMs: 1_000,
  }));
  assert.throws(() => assertLinearAuthorityApplyWindow({
    capturedAtMs: 1_000,
    applyStartedAtMs: 2_000,
    nowMs: 6_000,
    maxCaptureAgeMs: 5_000,
    maxApplyDurationMs: 10_000,
  }), /live capture expired/);
  assert.throws(() => assertLinearAuthorityApplyWindow({
    capturedAtMs: 1_000,
    applyStartedAtMs: 2_000,
    nowMs: 3_000,
    maxCaptureAgeMs: 10_000,
    maxApplyDurationMs: 1_000,
  }), /duration bound/);
});

test("live native selector proof rejects label rename, reparenting, and team-scope drift", () => {
  const fixture = buildValidatorValidLinearAuthorityPackageV2Fixture(process.cwd());
  const programScope = JSON.parse(
    fixture.authority.compilerInputs.get("program-scope")!.toString("utf8"),
  ) as { authorityIssueLabelContract: { groups: LinearAuthorityLabelGroupSelectorContract[] } };
  const expected = buildLinearAuthorityNativeSelectors(
    fixture.authority.manifest,
    programScope.authorityIssueLabelContract.groups,
  );
  const labelIndex = expected.findIndex((row) => row.kind === "label" && row.identity.parentId !== null);
  assert.ok(labelIndex >= 0);
  for (const mutation of [
    (identity: Record<string, unknown>) => { identity.name = "renamed"; },
    (identity: Record<string, unknown>) => { identity.parentId = "f0000000-0000-4000-8000-000000000001"; },
    (identity: Record<string, unknown>) => { identity.teamId = "f0000000-0000-4000-8000-000000000002"; },
  ]) {
    const drifted = structuredClone(expected);
    mutation(drifted[labelIndex]!.identity);
    assert.throws(() => assertLinearAuthorityNativeSelectors(expected, drifted), /native selector identity drifted/);
  }
  const parentIndex = expected.findIndex((row) => row.kind === "label_parent");
  assert.ok(parentIndex >= 0);
  for (const mutation of [
    (identity: Record<string, unknown>) => { identity.color = "#000000"; },
    (identity: Record<string, unknown>) => { identity.description = identity.description === null ? "drift" : null; },
  ]) {
    const drifted = structuredClone(expected);
    mutation(drifted[parentIndex]!.identity);
    assert.throws(() => assertLinearAuthorityNativeSelectors(expected, drifted), /native selector identity drifted/);
  }
});

test("relation catalog ignores unrelated workspace edges but rejects capture-scope drift", () => {
  const identifiers = new Set(["REQ-1"]);
  const unrelated = {
    uuid: "40000000-0000-4000-8000-000000000001",
    canonicalKey: "related:PLA-1:PLA-2",
    archivedAt: null,
  };
  assert.equal(classifyLinearAuthorityRelationCatalogRow({
    remote: unrelated,
    captured: null,
    resumedUuid: null,
    planned: null,
    capturedIssueIdentifiers: identifiers,
  }), "unrelated");
  assert.throws(() => classifyLinearAuthorityRelationCatalogRow({
    remote: { ...unrelated, canonicalKey: "related:PLA-1:REQ-1" },
    captured: null,
    resumedUuid: null,
    planned: null,
    capturedIssueIdentifiers: identifiers,
  }), /unexpected relation touching fresh capture scope/);
});

test("relation catalog admits an exact planned UUID across the write-before-journal crash window", () => {
  const remote = {
    uuid: NEW_RELATION,
    canonicalKey: "blocks:REQ-1:REQ-2",
    archivedAt: null,
  };
  assert.equal(classifyLinearAuthorityRelationCatalogRow({
    remote,
    captured: null,
    resumedUuid: null,
    planned: { uuid: NEW_RELATION, expectedCanonicalKey: null },
    capturedIssueIdentifiers: new Set(["REQ-1"]),
  }), "planned");
  assert.throws(() => classifyLinearAuthorityRelationCatalogRow({
    remote,
    captured: null,
    resumedUuid: null,
    planned: { uuid: NEW_RELATION, expectedCanonicalKey: "blocks:REQ-2:REQ-1" },
    capturedIssueIdentifiers: new Set(["REQ-1"]),
  }), /planned relation allocation collides/);
});

class BatchedMemoryTransport implements LinearAuthorityWriteTransport {
  readonly entities = new Map<string, LinearAuthorityRemoteEntity>();
  readonly relations = new Map<string, LinearAuthorityRemoteRelation>();
  readonly entityReadBatchSizes: number[] = [];
  readonly issueCreateBatchSizes: number[] = [];
  readonly aliasedEntityBatchSizes: number[] = [];
  readonly relationReadBatchSizes: number[] = [];
  readonly relationCreateBatchSizes: number[] = [];
  private nextIdentifier = 10_000;

  constructor(
    allocation: LinearAuthorityAllocation,
    operations: readonly LinearAuthorityPublicationOperation[],
  ) {
    for (const row of allocation.allocations) {
      if (row.source !== "adopted" || row.kind === "relation") continue;
      const entityKind = row.kind === "document" ? "document" : "issue";
      this.entities.set(row.uuid, {
        uuid: row.uuid,
        entityKind,
        identifier: entityKind === "issue" ? row.identifier : null,
        state: {
          titleSha256: sha256(`captured-title:${row.planKey}`),
          bodySha256: sha256(`captured-body:${row.planKey}`),
          nativeSha256: sha256(`captured-native:${row.planKey}`),
          authorityPayloadSha256: sha256(`captured-authority:${row.planKey}`),
        },
        archivedAt: null,
      });
    }
    for (const operation of operations) {
      if (operation.kind !== "update_entity") continue;
      const current = this.entities.get(operation.targetUuid)!;
      const expected = operation.expectedCurrentState;
      current.state = {
        titleSha256: expected.projection === "description_only" ? current.state.titleSha256 : expected.titleSha256,
        bodySha256: expected.bodySha256,
        nativeSha256: expected.projection === "description_only" ? current.state.nativeSha256 : expected.nativeSha256,
        authorityPayloadSha256: sha256(`pre-update:${operation.planKey}`),
      };
    }
  }

  async readNativeSelectors(input: Parameters<LinearAuthorityWriteTransport["readNativeSelectors"]>[0]) {
    return structuredClone(input.selectors);
  }

  private state(payload: { [key: string]: unknown }) {
    const title = typeof payload.title === "string" ? payload.title : "";
    const body = typeof payload.description === "string"
      ? payload.description
      : typeof payload.content === "string"
        ? payload.content
        : "";
    const { title: _title, description: _description, content: _content, ...native } = payload;
    return {
      titleSha256: sha256(title),
      bodySha256: sha256(body),
      nativeSha256: sha256(canonical(native)),
      authorityPayloadSha256: sha256(canonical(payload)),
    };
  }

  async listRelationsPage(): Promise<{ rows: LinearAuthorityRemoteRelation[]; pageInfo: { hasNextPage: false; endCursor: null } }> {
    return { rows: [...this.relations.values()], pageInfo: { hasNextPage: false, endCursor: null } };
  }

  async readEntities(input: Parameters<LinearAuthorityWriteTransport["readEntities"]>[0]): Promise<LinearAuthorityRemoteEntity[]> {
    this.entityReadBatchSizes.push(input.requests.length);
    return input.requests.flatMap((request) => {
      const row = this.entities.get(request.id);
      return row ? [structuredClone(row)] : [];
    });
  }

  async issueBatchCreate(input: Parameters<LinearAuthorityWriteTransport["issueBatchCreate"]>[0]): Promise<LinearAuthorityRemoteEntity[]> {
    this.issueCreateBatchSizes.push(input.issues.length);
    return input.issues.map((request) => {
      const row: LinearAuthorityRemoteEntity = {
        uuid: request.id,
        entityKind: "issue",
        identifier: `REQ-${this.nextIdentifier++}`,
        state: this.state(request.payload),
        archivedAt: null,
      };
      this.entities.set(request.id, row);
      return structuredClone(row);
    });
  }

  async mutateEntitiesAliased(input: Parameters<LinearAuthorityWriteTransport["mutateEntitiesAliased"]>[0]): Promise<LinearAuthorityRemoteEntity[]> {
    this.aliasedEntityBatchSizes.push(input.mutations.length);
    return input.mutations.map((request) => {
      const current = this.entities.get(request.id);
      const row: LinearAuthorityRemoteEntity = {
        uuid: request.id,
        entityKind: request.entityKind,
        identifier: request.entityKind === "issue" ? current?.identifier ?? `REQ-${this.nextIdentifier++}` : null,
        state: this.state(request.payload),
        archivedAt: null,
      };
      this.entities.set(request.id, row);
      return structuredClone(row);
    });
  }

  async readRelations(input: Parameters<LinearAuthorityWriteTransport["readRelations"]>[0]): Promise<LinearAuthorityRemoteRelation[]> {
    this.relationReadBatchSizes.push(input.requests.length);
    return input.requests.flatMap(({ id }) => {
      const row = [...this.relations.values()].find((candidate) => candidate.uuid === id);
      return row ? [structuredClone(row)] : [];
    });
  }

  async createRelationsAliased(input: Parameters<LinearAuthorityWriteTransport["createRelationsAliased"]>[0]): Promise<LinearAuthorityRemoteRelation[]> {
    this.relationCreateBatchSizes.push(input.relations.length);
    return input.relations.map((request) => {
      const row = { uuid: request.id, canonicalKey: request.canonicalKey, archivedAt: null };
      this.relations.set(request.canonicalKey, row);
      return structuredClone(row);
    });
  }
}

test("full native v2 capture and semantic v4 package are validated in-process before authorization", async () => {
  const fixture = buildValidatorValidLinearAuthorityPackageV2Fixture(process.cwd());
  const semanticRaw = fixture.authority.compilerInputs.get("semantic-plan")!.toString("utf8");
  const semantic = parseLinearAuthoritySemanticPlanV4(semanticRaw);
  const operationPlan = buildLinearAuthorityPublicationOperationPlan({
    manifest: fixture.authority.manifest,
    allocation: fixture.authority.allocation,
    semantic,
  });
  const operationsRaw = JSON.stringify(operationPlan);
  const captureReceiptRaw = fixture.authority.compilerInputs.get("capture-receipt")!.toString("utf8");
  const input = {
    artifacts: {
      manifestRaw: fixture.authority.manifestRaw,
      semanticPlanRaw: semanticRaw,
      liveCaptureRaw: fixture.authority.liveCaptureRaw,
      captureReceiptRaw,
      allocationRaw: fixture.authority.allocationRaw,
      operationsRaw,
    },
    pins: {
      manifestSha256: fixture.authority.manifestSha256,
      semanticPlanSha256: sha256(semanticRaw),
      liveCaptureSha256: fixture.authority.liveCaptureSha256,
      captureReceiptSha256: sha256(captureReceiptRaw),
      allocationSha256: fixture.authority.allocationSha256,
      operationsSha256: sha256(operationsRaw),
    },
    authorityValidationInput: fixture.validationInput,
    now: new Date("2026-07-28T00:01:00.000Z"),
  } as const;
  const prepared = preflightLinearAuthorityPublication(input);
  assert.deepEqual(prepared.validation, {
    structuralIntegrityValidated: true,
    semanticPlanInternalsValidated: true,
    captureEvidenceValidated: true,
    semanticCoverageValidated: true,
    mutationAuthorized: true,
  });
  assert.equal(prepared.operations.length, operationPlan.operations.length);
  assert.ok(prepared.operations.length > 1_000);
  const minimumHttpAttempts = minimumLinearAuthorityHttpAttempts(prepared);
  assert.ok(minimumHttpAttempts > 1 && minimumHttpAttempts <= 1_000);
  let budgetCredentials = 0;
  await assert.rejects(executeLinearAuthorityPublication({
    ...input,
    mode: "apply",
    runId: "test:undersized-budget",
    limits: { maxHttpAttempts: minimumHttpAttempts - 1 },
    credentialProvider: () => {
      budgetCredentials += 1;
      return "unused-credential";
    },
    transport: new BatchedMemoryTransport(fixture.authority.allocation, operationPlan.operations),
  }), /below the .*planned minimum/);
  assert.equal(budgetCredentials, 0);

  const entityOperation = prepared.operations.find((operation) => operation.kind !== "create_relation")!;
  const resumeBody = {
    schemaVersion: 1,
    sequence: 1,
    runId: "test:wrong-resume-uuid",
    planRoot: prepared.planRoot,
    operationsSha256: input.pins.operationsSha256,
    operationKey: entityOperation.operationKey,
    idempotencyKey: entityOperation.idempotencyKey,
    operationKind: entityOperation.kind,
    status: "started",
    entityUuid: "f0000000-0000-4000-8000-000000000001",
    canonicalRelationKey: null,
    httpAttempts: 0,
    occurredAt: "2026-07-28T00:01:00.000Z",
    previousRecordSha256: null,
  };
  const resumeRaw = `${JSON.stringify({ ...resumeBody, recordSha256: sha256(canonical(resumeBody)) })}\n`;
  assert.throws(() => preflightLinearAuthorityPublication({
    ...input,
    resumeJournalRaw: resumeRaw,
    expectedResumeJournalSha256: sha256(resumeRaw),
  }), /entity UUID differs from its exact operation/);

  const modifiedPlan = structuredClone(operationPlan);
  const firstCreateIndex = modifiedPlan.operations.findIndex((row) => row.kind === "create_entity");
  const firstCreate = modifiedPlan.operations[firstCreateIndex];
  assert.ok(firstCreate && firstCreate.kind === "create_entity");
  if (!firstCreate || firstCreate.kind !== "create_entity") return;
  const wrongPayload = { ...firstCreate.payload, description: "re-pinned arbitrary replacement" };
  modifiedPlan.operations[firstCreateIndex] = sealLinearAuthorityOperation(fixture.authority.manifest.planRoot, {
    operationKey: firstCreate.operationKey,
    planKey: firstCreate.planKey,
    kind: "create_entity",
    entityKind: firstCreate.entityKind,
    allocationUuid: firstCreate.allocationUuid,
    desiredPayloadSha256: sha256(canonical(wrongPayload)),
    payload: wrongPayload,
  });
  modifiedPlan.operationsRoot = computeLinearAuthorityOperationsRoot(modifiedPlan.operations);
  const modifiedRaw = JSON.stringify(modifiedPlan);
  let credentials = 0;
  await assert.rejects(executeLinearAuthorityPublication({
    ...input,
    mode: "apply",
    runId: "test:re-pinned-payload",
    artifacts: { ...input.artifacts, operationsRaw: modifiedRaw },
    pins: { ...input.pins, operationsSha256: sha256(modifiedRaw) },
    credentialProvider: () => {
      credentials += 1;
      return "unused-credential";
    },
  }), /not the exact projection/);
  assert.equal(credentials, 0);
});
