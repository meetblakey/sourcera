import { strict as assert } from "node:assert";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

import {
  buildLinearAuthorityPackageV2,
  computeLinearAuthorityDesiredAuthorityRoot,
  type LinearAuthorityPackagePlanV2,
} from "./lib/linear-authority-package-v2.js";
import {
  computeLinearAuthorityPlanRoot,
  LINEAR_AUTHORITY_COMPILER_INPUT_NAMES_V2,
  type AuthorityManagedTarget,
  type LinearTargetAllocation,
  validateLinearAuthorityStructure,
} from "./lib/linear-authority-manifest.js";
import {
  buildLinearAuthoritySemanticCoreV4,
  buildLinearAuthoritySemanticPlanV4TestFixture,
  canonicalLinearAuthoritySemanticPlanV4Json,
  parseLinearAuthoritySemanticPlanV4,
  validateLinearAuthoritySemanticPlanV4,
} from "./lib/linear-authority-semantic-plan-v4.js";
import {
  computeLinearAuthoritySourceLineageRoot,
  computeLinearAuthoritySourceSetRoot,
  LINEAR_AUTHORITY_SOURCE_SPECS,
  type LinearAuthoritySourceLineage,
} from "./lib/linear-authority-source-lineage.js";
import {
  buildLinearAuthorityUnifiedCompilerInputFixture,
  type ValidatorValidLinearAuthorityPackageV2Fixture,
} from "./linear-authority-package-v2.fixture.js";
import { compileLinearAuthorityUnifiedPackage } from "./lib/linear-authority-unified-compiler.js";

const rootDir = process.cwd();
const sha256 = (value: string | Uint8Array): string =>
  createHash("sha256").update(value).digest("hex");
const json = (value: unknown): Buffer => Buffer.from(`${JSON.stringify(value)}\n`, "utf8");

function managedPayloadSha256(target: AuthorityManagedTarget): string {
  return sha256(JSON.stringify({
    title: target.title,
    description: target.description,
    teamPlanKey: target.teamPlanKey,
    projectPlanKey: target.projectPlanKey,
    statePlanKey: target.statePlanKey,
    priority: target.priority,
    estimate: target.estimate,
    dueDate: target.dueDate,
    cyclePlanKey: target.cyclePlanKey,
    milestonePlanKey: target.milestonePlanKey,
    releasePlanKeys: target.releasePlanKeys,
    labelPlanKeys: target.labelPlanKeys,
    parentPlanKey: target.parentPlanKey,
    assigneePlanKey: target.assigneePlanKey,
  }));
}

function uuid(index: number): string {
  return `00000000-0000-4000-8000-${index.toString(16).padStart(12, "0")}`;
}

function fixture() {
  const linearFingerprintRaw = json({ issues: [] });
  const issueDescriptionsRaw = json({ schemaVersion: 1, issues: [] });
  const recoveryMappingRaw = json({ schemaVersion: 1, fixture: "recovery" });
  const publicationRaw = Buffer.from("publication fixture\n", "utf8");
  const semanticCore = buildLinearAuthoritySemanticCoreV4(rootDir);
  const reconciliation = semanticCore.requirements.slice(0, 186).map((row, index) => ({
    canonicalLegacyId: row.canonicalLegacyId,
    issueUuid: uuid(index + 10_000),
    issueIdentifier: `REQ-${index + 1}`,
    descriptionUpdateRequired: false,
    priorityUpdateRequired: false,
    executionRelationsToAdd: [],
    requirementDependencyLegacyIdsToAdd: [],
    proofExecutionDependenciesToAdd: [],
  }));
  const fixtureSemantic = buildLinearAuthoritySemanticPlanV4TestFixture(rootDir, reconciliation);
  const semantic = validateLinearAuthoritySemanticPlanV4({
    ...fixtureSemantic.plan,
    captureEvidence: {
      mode: "capture",
      captureEvidenceValidated: true,
      fingerprintSha256: sha256(linearFingerprintRaw),
      descriptionCaptureSha256: sha256(issueDescriptionsRaw),
      recoveryMappingSha256: sha256(recoveryMappingRaw),
      publicationSha256: sha256(publicationRaw),
    },
  });
  const semanticPlanRaw = Buffer.from(
    `${canonicalLinearAuthoritySemanticPlanV4Json(semantic.plan)}\n`,
    "utf8",
  );
  const featureInventoryRaw = Buffer.from("feature inventory fixture\n", "utf8");
  const dispositionRegisterRaw = Buffer.from('{"overrides":[]}\n', "utf8");
  const sourceChecksumsRaw = Buffer.from('{"schemaVersion":3,"sources":[]}\n', "utf8");
  const sources = LINEAR_AUTHORITY_SOURCE_SPECS.map((source, index) => ({
    ...source,
    byteLength: index + 1,
    rawSha256: sha256(`source-${index}`),
    normalizedSha256: sha256(`normalized-${index}`),
  }));
  const sourceSetRoot = computeLinearAuthoritySourceSetRoot(sources);
  const slice = {
    key: "source-slice:1:0-1",
    sourcePath: "Sourcera_Master_Spec.md" as const,
    byteStart: 0,
    byteEnd: 1,
    startAnchor: "# Fixture",
    endAnchor: "# Fixture",
    rawSha256: sha256("x"),
    normalizedSha256: sha256("x\n"),
    contextRole: "target_support" as const,
  };
  const targetBindings: LinearAuthoritySourceLineage["targetBindings"] = [
    ...semantic.plan.requirements.map((row) => ({
      targetLegacyId: row.canonicalLegacyId,
      targetPlanKey: `issue:${row.canonicalLegacyId}`,
      semanticRole: "requirement" as const,
      disposition: null,
      inventorySourceDocument: "Sourcera_Master_Spec.md",
      inventorySourceVersion: "fixture",
      inventorySourceAnchor: row.sourceAnchor,
      status: "resolved" as const,
      resolution: "registered" as const,
      sourceBindingSha256: sha256(row.canonicalLegacyId),
      supportSliceKeys: [slice.key],
      replacementLegacyId: null,
    })),
    ...semantic.plan.decisions.map((row) => ({
      targetLegacyId: row.legacyId,
      targetPlanKey: `decision:${row.legacyId}`,
      semanticRole: "decision" as const,
      disposition: row.disposition,
      inventorySourceDocument: row.disposition === "retired_source"
        ? "_baselines/retired-sources/kb_eng.json"
        : "Sourcera_Master_Spec.md",
      inventorySourceVersion: "fixture",
      inventorySourceAnchor: row.legacyId,
      status: "resolved" as const,
      resolution: row.disposition === "retired_source"
        ? "retired_source_disposition" as const
        : "registered" as const,
      sourceBindingSha256: row.disposition === "retired_source" ? null : sha256(row.legacyId),
      supportSliceKeys: row.disposition === "retired_source" ? [] : [slice.key],
      replacementLegacyId: row.disposition === "retired_source" ? "F-001" : null,
    })),
  ];
  const lineageWithoutRoot: Omit<LinearAuthoritySourceLineage, "sourceLineageRoot"> = {
    schemaVersion: 1,
    kind: "linear_authority_source_lineage",
    authority: {
      workspaceId: uuid(1),
      sourceCommit: "1111111111111111111111111111111111111111",
      planRoot: sha256("pending-plan-root"),
      sourceSetRoot,
      semanticPlanSha256: sha256(semanticPlanRaw),
      semanticRoot: semantic.semanticRoot,
      featureInventorySha256: sha256(featureInventoryRaw),
    },
    sourceChecksumsSha256: sha256(sourceChecksumsRaw),
    dispositionsSha256: sha256(dispositionRegisterRaw),
    sources,
    sourceSlices: [slice],
    targetBindings,
    unresolved: [],
    sourceCoverageRoot: sha256("source-coverage"),
    sourcePartitionValidated: true,
    sourceExtractionCoverageValidated: true,
    semanticPlanInternalsValidated: true,
    captureEvidenceValidated: true,
    semanticCoverageValidated: false,
    mutationAuthorized: false,
  };
  const lineage: LinearAuthoritySourceLineage = {
    ...lineageWithoutRoot,
    sourceLineageRoot: computeLinearAuthoritySourceLineageRoot(lineageWithoutRoot),
  };

  const makeTarget = (
    kind: "requirement" | "decision",
    planKey: string,
    title: string,
    description: string,
    priority: number,
    blockKeys: string[],
    retired: boolean,
  ): AuthorityManagedTarget => {
    const target: AuthorityManagedTarget = {
      kind,
      origin: retired ? "retired_source_disposition" : "source",
      planKey,
      title,
      expectedCurrentIssueUuid: null,
      expectedCurrentDescriptionSha256: null,
      expectedCurrentNativeSha256: null,
      expectedIdentifier: null,
      blockKeys,
      description,
      descriptionSha256: sha256(description),
      payloadSha256: "",
      teamPlanKey: "team:requirements",
      projectPlanKey: "project:fixture",
      statePlanKey: "state:approved",
      labelPlanKeys: [kind === "requirement" ? "label:requirement" : "label:decision"],
      priority,
      estimate: null,
      dueDate: null,
      cyclePlanKey: null,
      milestonePlanKey: null,
      releasePlanKeys: [],
      parentPlanKey: null,
      assigneePlanKey: null,
    };
    target.payloadSha256 = managedPayloadSha256(target);
    return target;
  };
  const bindingByKey = new Map(targetBindings.map((row) => [row.targetPlanKey, row]));
  const requirements = semantic.plan.requirements.map((row) => makeTarget(
    "requirement",
    `issue:${row.canonicalLegacyId}`,
    row.title,
    row.description,
    row.priority,
    bindingByKey.get(`issue:${row.canonicalLegacyId}`)!.supportSliceKeys,
    false,
  ));
  const reconciliationByLegacyId = new Map(
    semantic.plan.adoptedRequirementReconciliation.map((row) => [row.canonicalLegacyId, row]),
  );
  for (const target of requirements) {
    const legacyId = target.planKey.slice("issue:".length);
    const adopted = reconciliationByLegacyId.get(legacyId);
    if (!adopted) continue;
    target.expectedCurrentIssueUuid = adopted.issueUuid;
    target.expectedCurrentDescriptionSha256 = sha256(`description:${legacyId}`);
    target.expectedCurrentNativeSha256 = sha256(`native:${legacyId}`);
    target.expectedIdentifier = adopted.issueIdentifier;
  }
  const decisions = semantic.plan.decisions.map((row) => makeTarget(
    "decision",
    `decision:${row.legacyId}`,
    row.title,
    row.description,
    row.priority,
    bindingByKey.get(`decision:${row.legacyId}`)!.supportSliceKeys,
    row.disposition === "retired_source",
  ));
  const plan: LinearAuthorityPackagePlanV2 = {
    sourceCommit: lineage.authority.sourceCommit,
    preCutoverTag: "pre-linear-authority-2026-07-27",
    preCutoverCommit: "8c4e00e377ddc3cce404589aaf256f0f254ea6c1",
    workspace: { id: lineage.authority.workspaceId, name: "Sourcera", urlKey: "sourcera" },
    rawDocumentIds: [],
    requirements,
    decisions,
    risks: [],
    documents: [],
    references: [],
    nativeRelations: [],
    issueDescriptionRepairs: [],
    nativeCatalog: {
      teams: [], users: [], initiatives: [], projects: [], releasePipelines: [],
      cycles: [], milestones: [], releases: [], states: [], labels: [],
    },
  };
  const allocations: LinearTargetAllocation[] = [...requirements, ...decisions]
    .map((target, index) => ({
      planKey: target.planKey,
      kind: target.kind === "requirement" ? "issue" as const : "decision" as const,
      title: target.title,
      identifier: target.expectedIdentifier,
      uuid: target.expectedCurrentIssueUuid ?? uuid(index + 10),
      source: target.expectedCurrentIssueUuid === null ? "allocated" as const : "adopted" as const,
    }));
  const captureReceiptRaw = json({ schemaVersion: 2, fixture: "capture-receipt" });
  const githubExecutionRaw = json({ schemaVersion: 1, kind: "github-execution", repository: "meetblakey/sourcera", commit: lineage.authority.sourceCommit, ref: "refs/heads/main", runId: "1", runAttempt: "1" });

  return {
    plan,
    semanticPlanRaw,
    sourceLineageRaw: json(lineage),
    requirementBaselineRaw: json({ schemaVersion: 1, initialized: false, workspaceId: null, entries: [], root: sha256("[]") }),
    featureInventoryRaw,
    dispositionRegisterRaw,
    sourceChecksumsRaw,
    projectScopeRaw: json({ schemaVersion: 1, projects: [] }),
    programScopeRaw: json({ schemaVersion: 3, fixture: true }),
    linearFingerprintRaw,
    liveCaptureRaw: json({ schemaVersion: 1, fixture: "native-identity" }),
    rawDocumentsRaw: json({ schemaVersion: 1, documents: [] }),
    issueDescriptionsRaw,
    recoveryMappingRaw,
    publicationRaw,
    captureReceiptRaw,
    githubExecutionRaw,
    allocations,
    documentCanary: {
      canaryDocumentId: uuid(2),
      canaryContentSha256: sha256("canary"),
      canaryTopologySha256: sha256("topology"),
      measuredAt: "2026-07-28T00:00:00.000Z",
      readbackUtf8Bytes: 6,
      readbackUtf16CodeUnits: 6,
      maxUtf8Bytes: 6,
      maxUtf16CodeUnits: 6,
    },
  };
}

type FullValidatorFixture = Pick<
  ValidatorValidLinearAuthorityPackageV2Fixture,
  "authority" | "validationInput"
>;

let validatorFixtureCache: FullValidatorFixture | undefined;
function validatorFixture(): FullValidatorFixture {
  if (validatorFixtureCache) return validatorFixtureCache;
  const compiled = compileLinearAuthorityUnifiedPackage(
    buildLinearAuthorityUnifiedCompilerInputFixture(rootDir),
  );
  const authority = compiled.authority;
  const sourceFiles = new Map(LINEAR_AUTHORITY_SOURCE_SPECS.map((spec) => [
    spec.path,
    readFileSync(join(rootDir, spec.path)),
  ]));
  validatorFixtureCache = {
    authority,
    validationInput: {
      manifestRaw: authority.manifestRaw,
      expectedManifestSha256: authority.manifestSha256,
      sourceFiles,
      compilerInputs: authority.compilerInputs,
      liveCaptureRaw: authority.liveCaptureRaw,
      expectedLiveCaptureSha256: authority.liveCaptureSha256,
      allocationRaw: authority.allocationRaw,
      expectedAllocationSha256: authority.allocationSha256,
      repositoryRoot: rootDir,
    },
  };
  return validatorFixtureCache;
}

test("schema-v2 package assembly is deterministic and binds every supplied byte", () => {
  const input = fixture();
  const first = buildLinearAuthorityPackageV2(input);
  const second = buildLinearAuthorityPackageV2({
    ...input,
    plan: {
      ...input.plan,
      requirements: [...input.plan.requirements].reverse(),
      decisions: [...input.plan.decisions].reverse(),
    },
    allocations: [...input.allocations].reverse(),
  });

  assert.equal(first.manifestRaw, second.manifestRaw);
  assert.equal(first.allocationRaw, second.allocationRaw);
  assert.equal(first.manifestSha256, sha256(first.manifestRaw));
  assert.equal(first.liveCaptureSha256, sha256(first.liveCaptureRaw));
  assert.equal(first.allocationSha256, sha256(first.allocationRaw));
  assert.equal(first.manifest.schemaVersion, 2);
  assert.equal(computeLinearAuthorityPlanRoot(first.manifest), first.manifest.planRoot);
  assert.deepEqual(
    first.manifest.inputs.map((row) => row.name).sort(),
    [...LINEAR_AUTHORITY_COMPILER_INPUT_NAMES_V2].sort(),
  );
  for (const row of first.manifest.inputs) {
    const bytes = row.name === "native-identity"
      ? Buffer.from(first.liveCaptureRaw, "utf8")
      : first.compilerInputs.get(row.name);
    assert.ok(bytes, row.name);
    assert.equal(row.byteLength, bytes.length, row.name);
    assert.equal(row.sha256, sha256(bytes), row.name);
  }
  const lineage = JSON.parse(first.compilerInputs.get("source-lineage")!.toString("utf8"));
  assert.equal(lineage.authority.planRoot, first.manifest.planRoot);
  const allocation = JSON.parse(first.allocationRaw);
  assert.equal(allocation.planRoot, first.manifest.planRoot);
  assert.equal(allocation.sourceSetRoot, first.manifest.sourceSetRoot);
  assert.equal(allocation.liveCaptureRoot, first.manifest.liveCaptureRoot);
});

test("package assembly refuses to invent a missing allocation", () => {
  const input = fixture();
  input.allocations.pop();
  assert.throws(
    () => buildLinearAuthorityPackageV2(input),
    /allocation coverage differs/i,
  );
});

test("package assembly rejects semantic capture evidence detached from supplied bytes", () => {
  const input = fixture();
  input.linearFingerprintRaw = json({ issues: [{ id: "drift" }] });
  assert.throws(
    () => buildLinearAuthorityPackageV2(input),
    /capture evidence.*supplied bytes/i,
  );
});

test("package assembly binds every adopted Requirement to v4 reconciliation identity", () => {
  const input = fixture();
  input.plan.requirements[0]!.expectedCurrentIssueUuid = uuid(99_999);
  assert.throws(
    () => buildLinearAuthorityPackageV2(input),
    /adopted reconciliation identity/i,
  );
});

test("schema-v2 fixture passes the full structural validator with exact semantic relations", {
  timeout: 120_000,
}, () => {
  const value = validatorFixture();
  const summary = validateLinearAuthorityStructure(value.validationInput);
  const semantic = parseLinearAuthoritySemanticPlanV4(
    value.authority.compilerInputs.get("semantic-plan")!,
  );
  const expectedRelations = new Set<string>();
  const add = (type: "blocks" | "related", source: string, target: string) => {
    const endpoints = type === "related" ? [source, target].sort() : [source, target];
    expectedRelations.add(`relation:${type}:${endpoints[0]}:${endpoints[1]}`);
  };
  for (const requirement of semantic.plan.requirements) {
    const requirementKey = `issue:${requirement.canonicalLegacyId}`;
    for (const endpoint of [...requirement.execution, ...requirement.proofExecutionDependencies]) {
      add("related", requirementKey, `relation-target:${endpoint}`);
    }
    for (const dependency of requirement.requirementDependencyLegacyIds) {
      add("blocks", `issue:${dependency}`, requirementKey);
    }
  }
  for (const decision of semantic.plan.decisions) {
    for (const endpoint of decision.existingRelations) {
      add("related", `decision:${decision.legacyId}`, `relation-target:${endpoint}`);
    }
    for (const requirement of decision.requirementRelations) {
      add("related", `decision:${decision.legacyId}`, `issue:${requirement}`);
    }
  }

  assert.equal(summary.status, "structural_integrity_validated");
  assert.equal(summary.captureEvidenceValidated, true);
  assert.equal(value.authority.manifest.requirements.length, 926);
  assert.equal(value.authority.manifest.decisions.length, 148);
  assert.equal(
    value.authority.manifest.decisions.filter((row) =>
      row.origin === "source" || row.origin === "retired_source_disposition").length,
    61,
  );
  assert.equal(value.authority.manifest.risks.length, 24);
  assert.equal(value.authority.manifest.documents.length, 30);
  const actualRelations = new Set(
    value.authority.manifest.nativeRelations.map((row) => row.planKey),
  );
  for (const relation of expectedRelations) assert.ok(actualRelations.has(relation), relation);
});

test("full schema-v2 validation rejects root and compiler-input tampering", {
  timeout: 120_000,
}, () => {
  const value = validatorFixture();
  const tamperedManifest = JSON.parse(value.authority.manifestRaw);
  tamperedManifest.sourceLineageRoot = "0".repeat(64);
  const tamperedManifestRaw = JSON.stringify(tamperedManifest);
  assert.throws(
    () => validateLinearAuthorityStructure({
      ...value.validationInput,
      manifestRaw: tamperedManifestRaw,
      expectedManifestSha256: sha256(tamperedManifestRaw),
    }),
    /plan root mismatch|source-lineage/i,
  );

  const compilerInputs = new Map(value.authority.compilerInputs);
  compilerInputs.set(
    "semantic-plan",
    Buffer.concat([compilerInputs.get("semantic-plan")!, Buffer.from(" ")]),
  );
  assert.throws(
    () => validateLinearAuthorityStructure({ ...value.validationInput, compilerInputs }),
    /semantic-plan byte length or digest mismatch/i,
  );
});

test("desired authority root stays stable from 186 to 926 adopted Requirements", () => {
  const value = validatorFixture();
  const before = structuredClone(value.authority.manifest);
  const after = structuredClone(before);
  assert.equal(before.requirements.filter((row) => row.expectedCurrentIssueUuid !== null).length, 186);
  after.requirements.forEach((requirement, index) => {
    requirement.expectedCurrentIssueUuid = uuid(777_001 + index);
    requirement.expectedCurrentDescriptionSha256 = requirement.descriptionSha256;
    requirement.expectedCurrentNativeSha256 = sha256(`post-adoption-native-state:${index}`);
    requirement.expectedIdentifier = `REQ-${index + 1}`;
  });
  after.semanticRoot = sha256("post-adoption-semantic-evidence");
  after.sourceLineageRoot = sha256("post-adoption-lineage-evidence");
  after.planRoot = computeLinearAuthorityPlanRoot(after);
  assert.equal(after.requirements.filter((row) => row.expectedCurrentIssueUuid !== null).length, 926);
  assert.notEqual(after.planRoot, before.planRoot);
  assert.equal(
    computeLinearAuthorityDesiredAuthorityRoot(after),
    computeLinearAuthorityDesiredAuthorityRoot(before),
  );
});
