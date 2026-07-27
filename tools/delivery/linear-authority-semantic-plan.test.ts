import { strict as assert } from "node:assert";
import test from "node:test";
import {
  parseLinearAuthoritySemanticPlan,
  validateLinearAuthoritySemanticPlan,
} from "./lib/linear-authority-semantic-plan.js";

type JsonRecord = Record<string, unknown>;

const clone = <T>(value: T): T => structuredClone(value);
const id = (prefix: string, value: number): string => `${prefix}-${String(value).padStart(4, "0")}`;

function decisionDisposition(index: number): string {
  if (index <= 21) return "proof_only";
  if (index <= 44) return "narrative_context";
  if (index <= 51) return "superseded";
  return "retired_source";
}

function decisionState(disposition: string): string {
  if (disposition === "proof_only") return "Approved";
  if (disposition === "superseded") return "Superseded";
  return "Retired";
}

function makePlan(existingRequirementCount = 61): JsonRecord {
  const requirements = Array.from({ length: 926 }, (_, offset) => {
    const index = offset + 1;
    const canonicalLegacyId = id("R", index);
    const requirementDependencyLegacyIds: string[] = [];
    if (index > 1) requirementDependencyLegacyIds.push(id("R", index - 1));
    if (index >= 3 && index <= 373) requirementDependencyLegacyIds.push(id("R", index - 2));

    const execution = [id("EXE", index)];
    if (index === 1) {
      for (let extra = 1; extra <= 66; extra += 1) execution.push(id("SPLIT-A", extra));
    } else if (index <= 37) {
      execution.push(id("SPLIT-B", index));
    }

    const normalizedDependencyLegacyIds = [...requirementDependencyLegacyIds];
    const proofExecutionDependencies: string[] = [];
    const dispositionResolutions: JsonRecord[] = [];
    if (index === 924) {
      normalizedDependencyLegacyIds.push(id("D", 1));
      proofExecutionDependencies.push("PROOF-0001");
      dispositionResolutions.push({
        viaDisposition: id("D", 1),
        requirement: null,
        proofExecution: "PROOF-0001",
      });
    }
    if (index === 925) {
      normalizedDependencyLegacyIds.push(id("D", 2));
      proofExecutionDependencies.push("PROOF-0002");
      dispositionResolutions.push({
        viaDisposition: id("D", 2),
        requirement: null,
        proofExecution: "PROOF-0002",
      });
    }
    if (index === 926) {
      normalizedDependencyLegacyIds.push(id("D", 45));
      dispositionResolutions.push({
        viaDisposition: id("D", 45),
        requirement: id("R", 925),
        proofExecution: null,
      });
    }

    return {
      canonicalLegacyId,
      legacyIds: [canonicalLegacyId],
      title: `Requirement ${String(index).padStart(4, "0")}`,
      description: `Binding requirement ${index}`,
      project: `Project ${((index - 1) % 26) + 1}`,
      state: "Approved",
      labels: ["Requirement"],
      priority: index % 5,
      execution,
      primaryExecution: execution[0],
      sourceAnchor: `section-${index}`,
      sourceDependencyLegacyIds: [] as string[],
      normalizedDependencyLegacyIds,
      requirementDependencyLegacyIds,
      proofExecutionDependencies,
      dispositionResolutions,
      publicationRank: index,
    };
  });

  let normalizedRequirementEdgeIndex = 0;
  for (const row of requirements) {
    row.sourceDependencyLegacyIds = (row.normalizedDependencyLegacyIds as string[])
      .filter(() => normalizedRequirementEdgeIndex++ >= 114);
  }

  const decisions = Array.from({ length: 61 }, (_, offset) => {
    const index = offset + 1;
    const disposition = decisionDisposition(index);
    const dependency = id("R", ((index * 11) % 925) + 1);
    const requirementRelations = [dependency];
    if (index === 45) requirementRelations.push(id("R", 925));
    return {
      legacyId: id("D", index),
      disposition,
      title: `Disposition decision ${String(index).padStart(4, "0")}`,
      description: `Disposition rationale ${index}`,
      project: `Project ${((index - 1) % 26) + 1}`,
      state: decisionState(disposition),
      labels: ["Decision"],
      priority: 3,
      existingRelations: disposition === "proof_only" ? [`PROOF-${String(index).padStart(4, "0")}`] : [],
      requirementRelations,
      sourceDependencyLegacyIds: [dependency],
      normalizedDependencyLegacyIds: [dependency],
    };
  });

  let dependencyAdditionsRemaining = 64;
  const existingRequirementReconciliation = Array.from(
    { length: existingRequirementCount },
    (_, offset) => {
      const row = requirements[offset]!;
      const dependencyAdditions = (row.requirementDependencyLegacyIds as string[])
        .slice(0, dependencyAdditionsRemaining);
      dependencyAdditionsRemaining -= dependencyAdditions.length;
      return {
        issueIdentifier: `REQ-${offset + 1}`,
        canonicalLegacyId: id("R", offset + 1),
        frozenDuringCapture: true,
        descriptionUpdateRequired: offset < 61,
        executionRelationsToAdd: offset < 14 ? [(row.execution as string[])[1]!] : [],
        requirementDependencyLegacyIdsToAdd: dependencyAdditions,
        proofExecutionDependenciesToAdd: [],
      };
    },
  );

  return {
    schemaVersion: 3,
    counts: {
      requirements: 926,
      dispositionDecisions: 61,
      rawSourceDependencyEdges: 1246,
      normalizedDependencyEdges: 1360,
      dependencyRepairAdditions: 114,
      executableNativeRequirementEdges: 1296,
      executableProofDependencyEdges: 2,
      splitExecutionRelations: 102,
      existingRequirementsVerified: existingRequirementCount,
      existingDescriptionsToUpdate: Math.min(existingRequirementCount, 61),
      existingExecutionRelationsToAdd: Math.min(existingRequirementCount, 14),
    },
    requirements,
    decisions,
    existingRequirementReconciliation,
    publicationSequence: requirements.map((row) => row.canonicalLegacyId),
  };
}

function requirement(plan: JsonRecord, index: number): JsonRecord {
  return (plan.requirements as JsonRecord[])[index - 1]!;
}

function decision(plan: JsonRecord, index: number): JsonRecord {
  return (plan.decisions as JsonRecord[])[index - 1]!;
}

test("validates semantic-plan internals without claiming audited coverage or mutation authority", () => {
  const result = validateLinearAuthoritySemanticPlan(makePlan());

  assert.equal(result.semanticPlanInternalsValidated, true);
  assert.equal(result.semanticCoverageValidated, false);
  assert.equal(result.mutationAuthorized, false);
  assert.match(result.semanticRoot, /^[a-f0-9]{64}$/);
  assert.deepEqual(result.derivedCounts, {
    requirements: 926,
    dispositionDecisions: 61,
    dispositionClasses: {
      proof_only: 21,
      narrative_context: 23,
      superseded: 7,
      retired_source: 10,
    },
    sourceSplitRows: 37,
    splitExecutionRelations: 102,
    rawSourceDependencyEdges: 1246,
    dependencyRepairAdditions: 114,
    normalizedDependencyEdges: 1360,
    executableNativeRequirementEdges: 1296,
    executableProofDependencyEdges: 2,
    publicationSequenceEntries: 926,
    dependencyOrderViolations: 0,
    existingRequirementsVerified: 61,
    existingDescriptionsToUpdate: 61,
    existingExecutionRelationsToAdd: 14,
    existingRequirementDependencyRelationsToAdd: 64,
    existingProofExecutionRelationsToAdd: 0,
  });
  assert.equal(result.projection.requirements[0]!.semanticRole, "requirement");
  assert.equal(result.projection.decisions[0]!.semanticRole, "decision");
  assert.equal("labelId" in result.projection.requirements[0]!, false);
  assert.equal("labelName" in result.projection.requirements[0]!, false);
});

test("parses JSON bytes and canonicalizes set ordering without changing the semantic root", () => {
  const baseline = makePlan();
  const reordered = clone(baseline);
  (requirement(reordered, 373).normalizedDependencyLegacyIds as string[]).reverse();
  (requirement(reordered, 373).sourceDependencyLegacyIds as string[]).reverse();
  (requirement(reordered, 373).requirementDependencyLegacyIds as string[]).reverse();
  (decision(reordered, 45).requirementRelations as string[]).reverse();

  const left = parseLinearAuthoritySemanticPlan(Buffer.from(JSON.stringify(baseline)));
  const right = parseLinearAuthoritySemanticPlan(JSON.stringify(reordered));

  assert.equal(right.semanticRoot, left.semanticRoot);
  assert.deepEqual(right.projection, left.projection);
  assert.throws(() => parseLinearAuthoritySemanticPlan("{"), /valid JSON/i);
});

test("fails closed on unknown or missing keys at every schema level", () => {
  for (const mutate of [
    (plan: JsonRecord) => { plan.unexpected = true; },
    (plan: JsonRecord) => { delete plan.publicationSequence; },
    (plan: JsonRecord) => { (plan.counts as JsonRecord).unexpected = 1; },
    (plan: JsonRecord) => { delete requirement(plan, 1).sourceAnchor; },
    (plan: JsonRecord) => { requirement(plan, 1).unexpected = true; },
    (plan: JsonRecord) => { delete decision(plan, 1).state; },
    (plan: JsonRecord) => { decision(plan, 1).unexpected = true; },
    (plan: JsonRecord) => {
      (requirement(plan, 924).dispositionResolutions as JsonRecord[])[0]!.unexpected = true;
    },
    (plan: JsonRecord) => {
      ((plan.existingRequirementReconciliation as JsonRecord[])[0]!).unexpected = true;
    },
  ]) {
    const candidate = makePlan();
    mutate(candidate);
    assert.throws(() => validateLinearAuthoritySemanticPlan(candidate), /keys|required|unknown/i);
  }
});

test("rejects malformed scalar and collection types", () => {
  for (const mutate of [
    (plan: JsonRecord) => { plan.schemaVersion = "3"; },
    (plan: JsonRecord) => { plan.requirements = {}; },
    (plan: JsonRecord) => { requirement(plan, 1).priority = 1.5; },
    (plan: JsonRecord) => { requirement(plan, 1).title = ""; },
    (plan: JsonRecord) => { requirement(plan, 1).legacyIds = [1]; },
    (plan: JsonRecord) => { decision(plan, 1).existingRelations = "PROOF-0001"; },
  ]) {
    const candidate = makePlan();
    mutate(candidate);
    assert.throws(() => validateLinearAuthoritySemanticPlan(candidate), /type|integer|string|array|non-empty|schema/i);
  }
});

test("derives counts and rejects a trusted or stale counts block", () => {
  const candidate = makePlan();
  (candidate.counts as JsonRecord).normalizedDependencyEdges = 9999;
  assert.throws(() => validateLinearAuthoritySemanticPlan(candidate), /normalizedDependencyEdges.*derived/i);

  const repaired = makePlan();
  (requirement(repaired, 2).sourceDependencyLegacyIds as string[]).push(id("R", 1));
  assert.throws(() => validateLinearAuthoritySemanticPlan(repaired), /rawSourceDependencyEdges|repair/i);
});

test("rejects identity, title, execution, and semantic label collisions", () => {
  for (const [mutate, pattern] of [
    [(plan: JsonRecord) => { requirement(plan, 2).canonicalLegacyId = id("R", 1); }, /requirement.*identity|duplicate/i],
    [(plan: JsonRecord) => { requirement(plan, 2).legacyIds = [id("R", 1)]; }, /legacy.*duplicate|identity/i],
    [(plan: JsonRecord) => { decision(plan, 1).legacyId = id("R", 1); }, /legacy.*duplicate|identity/i],
    [(plan: JsonRecord) => { decision(plan, 1).title = "Requirement 0001"; }, /title.*duplicate/i],
    [(plan: JsonRecord) => { requirement(plan, 2).execution = [id("EXE", 1)]; requirement(plan, 2).primaryExecution = id("EXE", 1); }, /execution.*duplicate|owner/i],
    [(plan: JsonRecord) => { requirement(plan, 1).labels = ["requirement"]; }, /semantic.*label|Requirement/i],
    [(plan: JsonRecord) => { decision(plan, 1).labels = ["Decision", "New Decision"]; }, /semantic.*label|Decision/i],
  ] as Array<[(plan: JsonRecord) => void, RegExp]>) {
    const candidate = makePlan();
    mutate(candidate);
    assert.throws(() => validateLinearAuthoritySemanticPlan(candidate), pattern);
  }
});

test("enforces the disposition vocabulary and canonical class totals", () => {
  const unsupported = makePlan();
  decision(unsupported, 1).disposition = "archived";
  assert.throws(() => validateLinearAuthoritySemanticPlan(unsupported), /disposition/i);

  const drifted = makePlan();
  decision(drifted, 21).disposition = "narrative_context";
  decision(drifted, 21).state = "Retired";
  decision(drifted, 21).existingRelations = [];
  assert.throws(() => validateLinearAuthoritySemanticPlan(drifted), /disposition.*count|proof_only/i);
});

test("enforces exact split-row and split-relation totals", () => {
  const candidate = makePlan();
  (requirement(candidate, 38).execution as string[]).push("SPLIT-DRIFT");
  assert.throws(() => validateLinearAuthoritySemanticPlan(candidate), /split.*row|37/i);
});

test("rejects removed raw dependencies, duplicate edges, and unapproved normalized repairs", () => {
  const removed = makePlan();
  const row = requirement(removed, 373);
  (row.normalizedDependencyLegacyIds as string[]).splice(0, 1);
  assert.throws(() => validateLinearAuthoritySemanticPlan(removed), /source.*normalized|removed/i);

  const duplicate = makePlan();
  const dependencies = requirement(duplicate, 373).normalizedDependencyLegacyIds as string[];
  dependencies.push(dependencies[0]!);
  assert.throws(() => validateLinearAuthoritySemanticPlan(duplicate), /duplicate/i);

  const unknown = makePlan();
  (requirement(unknown, 2).normalizedDependencyLegacyIds as string[])[0] = "UNKNOWN";
  assert.throws(() => validateLinearAuthoritySemanticPlan(unknown), /dependency.*endpoint|unknown/i);
});

test("validates direct, superseded, and proof dependency resolutions", () => {
  for (const [mutate, pattern] of [
    [(plan: JsonRecord) => { (requirement(plan, 373).requirementDependencyLegacyIds as string[])[0] = id("R", 900); }, /resolved.*dependencies|dependency.*projection/i],
    [(plan: JsonRecord) => { (requirement(plan, 924).dispositionResolutions as JsonRecord[])[0]!.viaDisposition = id("D", 3); }, /resolution|viaDisposition/i],
    [(plan: JsonRecord) => { (requirement(plan, 924).dispositionResolutions as JsonRecord[])[0]!.proofExecution = "UNKNOWN-PROOF"; }, /proof.*endpoint|resolution/i],
    [(plan: JsonRecord) => { (requirement(plan, 926).dispositionResolutions as JsonRecord[])[0]!.requirement = id("R", 900); }, /resolution|resolved.*dependencies/i],
    [(plan: JsonRecord) => { (requirement(plan, 926).dispositionResolutions as JsonRecord[])[0]!.proofExecution = "PROOF-0001"; }, /exactly one|resolution/i],
    [(plan: JsonRecord) => { (decision(plan, 45).requirementRelations as string[]).pop(); }, /resolution.*relation|superseded/i],
  ] as Array<[(plan: JsonRecord) => void, RegExp]>) {
    const candidate = makePlan();
    mutate(candidate);
    assert.throws(() => validateLinearAuthoritySemanticPlan(candidate), pattern);
  }
});

test("rejects incomplete publication coverage, rank drift, and dependency-order violations", () => {
  const missing = makePlan();
  (missing.publicationSequence as string[]).pop();
  assert.throws(() => validateLinearAuthoritySemanticPlan(missing), /publication.*coverage|926/i);

  const duplicate = makePlan();
  (duplicate.publicationSequence as string[])[1] = id("R", 1);
  assert.throws(() => validateLinearAuthoritySemanticPlan(duplicate), /publication.*duplicate|coverage/i);

  const wrongRank = makePlan();
  requirement(wrongRank, 2).publicationRank = 8;
  assert.throws(() => validateLinearAuthoritySemanticPlan(wrongRank), /publication.*rank/i);

  const wrongOrder = makePlan();
  const sequence = wrongOrder.publicationSequence as string[];
  [sequence[0], sequence[1]] = [sequence[1]!, sequence[0]!];
  requirement(wrongOrder, 1).publicationRank = 2;
  requirement(wrongOrder, 2).publicationRank = 1;
  assert.throws(() => validateLinearAuthoritySemanticPlan(wrongOrder), /dependency.*order|topological/i);
});

test("locks v3 to the audited REQ-1 through REQ-61 reconciliation and rejects invalid deltas", () => {
  assert.throws(() => validateLinearAuthoritySemanticPlan(makePlan(186)), /schema.*v4|61.*reconciliation/i);

  const wrongIdentifierSet = makePlan();
  ((wrongIdentifierSet.existingRequirementReconciliation as JsonRecord[])[60]!).issueIdentifier = "REQ-62";
  assert.throws(() => validateLinearAuthoritySemanticPlan(wrongIdentifierSet), /REQ-1.*REQ-61|identifier.*set/i);

  const incompleteDescriptions = makePlan();
  ((incompleteDescriptions.existingRequirementReconciliation as JsonRecord[])[0]!).descriptionUpdateRequired = false;
  assert.throws(() => validateLinearAuthoritySemanticPlan(incompleteDescriptions), /61.*description/i);

  const incompleteExecutionDelta = makePlan();
  ((incompleteExecutionDelta.existingRequirementReconciliation as JsonRecord[])[0]!).executionRelationsToAdd = [];
  (incompleteExecutionDelta.counts as JsonRecord).existingExecutionRelationsToAdd = 13;
  assert.throws(() => validateLinearAuthoritySemanticPlan(incompleteExecutionDelta), /14.*execution/i);

  const incompleteDependencyDelta = makePlan();
  (((incompleteDependencyDelta.existingRequirementReconciliation as JsonRecord[])[1]!).requirementDependencyLegacyIdsToAdd as string[]).pop();
  assert.throws(() => validateLinearAuthoritySemanticPlan(incompleteDependencyDelta), /64.*dependency/i);

  const unexpectedProofDelta = makePlan();
  const proofRow = (unexpectedProofDelta.existingRequirementReconciliation as JsonRecord[])[0]!;
  proofRow.canonicalLegacyId = id("R", 924);
  proofRow.executionRelationsToAdd = [];
  proofRow.proofExecutionDependenciesToAdd = ["PROOF-0001"];
  ((unexpectedProofDelta.existingRequirementReconciliation as JsonRecord[])[14]!).executionRelationsToAdd = [id("SPLIT-B", 15)];
  assert.throws(() => validateLinearAuthoritySemanticPlan(unexpectedProofDelta), /proof.*zero|0.*proof/i);

  for (const [mutate, pattern] of [
    [(plan: JsonRecord) => { ((plan.existingRequirementReconciliation as JsonRecord[])[0]!).canonicalLegacyId = "UNKNOWN"; }, /reconciliation.*requirement/i],
    [(plan: JsonRecord) => { ((plan.existingRequirementReconciliation as JsonRecord[])[1]!).issueIdentifier = "REQ-1"; }, /reconciliation.*identifier.*duplicate/i],
    [(plan: JsonRecord) => { ((plan.existingRequirementReconciliation as JsonRecord[])[1]!).canonicalLegacyId = id("R", 1); }, /reconciliation.*requirement.*duplicate/i],
    [(plan: JsonRecord) => { (((plan.existingRequirementReconciliation as JsonRecord[])[0]!).executionRelationsToAdd as string[]).push("UNKNOWN"); }, /execution.*reconciliation|delta/i],
    [(plan: JsonRecord) => { (((plan.existingRequirementReconciliation as JsonRecord[])[1]!).requirementDependencyLegacyIdsToAdd as string[]).push(id("R", 900)); }, /dependency.*reconciliation|delta/i],
    [(plan: JsonRecord) => { ((plan.existingRequirementReconciliation as JsonRecord[])[0]!).frozenDuringCapture = false; }, /frozenDuringCapture/i],
  ] as Array<[(plan: JsonRecord) => void, RegExp]>) {
    const candidate = makePlan();
    mutate(candidate);
    assert.throws(() => validateLinearAuthoritySemanticPlan(candidate), pattern);
  }
});
