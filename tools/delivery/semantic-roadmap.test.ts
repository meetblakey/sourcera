import { strict as assert } from "node:assert";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

import {
  checkpointFindings,
  journeyFindings,
  semanticRoadmapFindings,
} from "./lib/semantic-roadmap.js";
import type {
  ManifestRow,
  SemanticRoadmapContract,
  SemanticRoadmapEdge,
} from "./lib/model.js";

const root = process.cwd();
const canonical = JSON.parse(
  readFileSync(resolve(root, "delivery/roadmap-contract.json"), "utf8"),
) as SemanticRoadmapContract;

const clone = (): SemanticRoadmapContract => structuredClone(canonical);

function semanticEdges(contract: SemanticRoadmapContract): SemanticRoadmapEdge[] {
  const edges: SemanticRoadmapEdge[] = [];
  const first = contract.journey.mandatoryPhases[0];
  if (first) {
    for (const support of contract.journey.requiredSupport) {
      edges.push({
        prerequisiteId: support.requirementId,
        dependentId: first.requirementId,
      });
    }
  }
  for (
    let index = 1;
    index < contract.journey.mandatoryPhases.length;
    index += 1
  ) {
    const prerequisiteId =
      contract.journey.mandatoryPhases[index - 1].requirementId;
    const dependentId = contract.journey.mandatoryPhases[index].requirementId;
    if (prerequisiteId !== dependentId) {
      edges.push({ prerequisiteId, dependentId });
    }
  }
  edges.push(...contract.journey.requiredEdges);
  const last = contract.journey.mandatoryPhases.at(-1);
  if (last) {
    edges.push({
      prerequisiteId: last.requirementId,
      dependentId: contract.journey.terminalArtifact.requirementId,
    });
  }
  return edges;
}

function validRows(contract: SemanticRoadmapContract): ManifestRow[] {
  const rows = new Map<string, ManifestRow>();
  const optionalRelease = new Map(
    contract.journey.optionalLaterPaths.map((path) => [
      path.requirementId,
      path.release,
    ]),
  );
  const phasesByRequirement = new Map<string, number[]>();
  for (const phase of contract.journey.mandatoryPhases) {
    const phases = phasesByRequirement.get(phase.requirementId) ?? [];
    phases.push(phase.phase);
    phasesByRequirement.set(phase.requirementId, phases);
  }
  const add = (requirementId: string, section = "§10") => {
    if (rows.has(requirementId)) return;
    const phases = phasesByRequirement.get(requirementId);
    rows.set(requirementId, {
      requirementId,
      outcome: phases ? `Phase ${phases.join("-")}: ${requirementId}` : requirementId,
      sourceDoc: "Sourcera_Master_Spec.md",
      sourceVersion: "v6.0.0",
      section,
      dependencies: [],
      disposition: "executable",
      release: optionalRelease.get(requirementId) ?? contract.release,
      issueId: null,
    });
  };

  for (const phase of contract.journey.mandatoryPhases) {
    add(phase.requirementId, phase.sourceSection);
  }
  for (const support of contract.journey.requiredSupport) {
    add(support.requirementId, support.sourceSection);
  }
  for (const path of contract.journey.optionalLaterPaths) {
    add(path.requirementId, path.sourceSection);
  }
  for (const edge of contract.journey.requiredEdges) {
    add(edge.prerequisiteId);
    add(edge.dependentId);
  }
  add(
    contract.journey.terminalArtifact.requirementId,
    contract.journey.terminalArtifact.sourceSection,
  );

  for (const edge of semanticEdges(contract)) {
    add(edge.prerequisiteId);
    add(edge.dependentId);
    rows.get(edge.dependentId)?.dependencies.push(edge.prerequisiteId);
  }
  return [...rows.values()];
}

const codes = (findings: ReturnType<typeof semanticRoadmapFindings>) =>
  findings.map((finding) => finding.code);

test("pins phases 1-13, support, artifacts, and optional later paths", () => {
  assert.deepEqual(
    canonical.journey.mandatoryPhases.map((phase) => [
      phase.phase,
      phase.stage,
      phase.requirementId,
    ]),
    [
      [1, "phase_1_stakeholder_alignment", "F-211"],
      [2, "phase_2_requirement_definition", "F-212"],
      [3, "phase_3_use_case_validation", "F-213"],
      [4, "phase_4_vendor_discovery", "F-214"],
      [5, "phase_5_vendor_outreach", "F-214"],
      [6, "phase_6_vendor_bidding", "F-215"],
      [7, "phase_7_response_refinement", "F-217"],
      [8, "phase_8_due_diligence", "F-218"],
      [9, "phase_9_final_clarifications", "F-219"],
      [10, "phase_10_team_scoring", "F-220"],
      [11, "phase_11_score_review", "F-223"],
      [12, "phase_12_selection", "F-225"],
      [13, "phase_13_contract_closure", "F-228"],
    ],
  );
  assert.deepEqual(
    canonical.journey.requiredSupport.map((item) => item.requirementId),
    ["F-210", "F-235", "F-236", "F-237", "F-238"],
  );
  assert.deepEqual(canonical.journey.requiredEdges, [
    { prerequisiteId: "F-224", dependentId: "F-225" },
    { prerequisiteId: "F-226", dependentId: "F-228" },
  ]);
  assert.equal(canonical.journey.terminalArtifact.requirementId, "F-229");
  assert.deepEqual(
    canonical.journey.optionalLaterPaths.map((path) => [
      path.requirementId,
      path.release,
    ]),
    [
      ["F-216", "R1"],
      ["F-222", "R1"],
      ["F-227", "R1"],
    ],
  );
  assert.deepEqual(semanticRoadmapFindings(canonical, validRows(canonical)), []);
});

test("finds a missing mandatory phase", () => {
  const contract = clone();
  contract.journey.mandatoryPhases.splice(5, 1);
  assert.ok(codes(journeyFindings(contract, validRows(canonical))).includes(
    "journey_phase_missing",
  ));
});

test("finds a duplicate mandatory phase", () => {
  const contract = clone();
  contract.journey.mandatoryPhases.splice(
    5,
    0,
    structuredClone(contract.journey.mandatoryPhases[5]),
  );
  assert.ok(codes(journeyFindings(contract, validRows(canonical))).includes(
    "journey_phase_duplicate",
  ));
});

test("finds reordered mandatory phases", () => {
  const contract = clone();
  [contract.journey.mandatoryPhases[5], contract.journey.mandatoryPhases[6]] = [
    contract.journey.mandatoryPhases[6],
    contract.journey.mandatoryPhases[5],
  ];
  assert.ok(codes(journeyFindings(contract, validRows(canonical))).includes(
    "journey_phase_order_invalid",
  ));
});

test("finds a mandatory phase assigned to a later release", () => {
  const rows = validRows(canonical);
  const phaseThree = rows.find((row) => row.requirementId === "F-213");
  assert.ok(phaseThree);
  phaseThree.release = "R4";
  assert.ok(codes(journeyFindings(canonical, rows)).includes(
    "journey_phase_later_release",
  ));
});

test("finds an unsupported mandatory phase mapping", () => {
  const contract = clone();
  contract.journey.mandatoryPhases[0].requirementId = "F-999";
  assert.ok(codes(journeyFindings(contract, validRows(canonical))).includes(
    "journey_phase_unsupported",
  ));
});

test("shared Phase 4 and Phase 5 mapping does not create a self-cycle", () => {
  assert.equal(
    semanticEdges(canonical).some(
      (edge) => edge.prerequisiteId === edge.dependentId,
    ),
    false,
  );
  assert.equal(
    codes(journeyFindings(canonical, validRows(canonical))).includes(
      "journey_edge_self_cycle",
    ),
    false,
  );
});

test("requires every named semantic edge", () => {
  const rows = validRows(canonical);
  const phaseTwelve = rows.find((row) => row.requirementId === "F-225");
  assert.ok(phaseTwelve);
  phaseTwelve.dependencies = phaseTwelve.dependencies.filter(
    (requirementId) => requirementId !== "F-224",
  );
  assert.ok(codes(journeyFindings(canonical, rows)).includes(
    "journey_edge_missing",
  ));
});

test("defines ordered R0-C1 through R0-C8 with complete requirements", () => {
  assert.deepEqual(
    canonical.checkpoints.map((checkpoint) => checkpoint.id),
    ["R0-C1", "R0-C2", "R0-C3", "R0-C4", "R0-C5", "R0-C6", "R0-C7", "R0-C8"],
  );
  for (const checkpoint of canonical.checkpoints) {
    assert.ok(checkpoint.requirements.success.length);
    assert.ok(checkpoint.requirements.failureRecovery.length);
    assert.ok(checkpoint.requirements.rollout.length);
    assert.ok(checkpoint.requirements.rollback.length);
    assert.ok(checkpoint.requirements.telemetry.length);
    assert.ok(checkpoint.requirements.customerProof.length);
    assert.ok(checkpoint.requirements.operationalProof.length);
    assert.ok(checkpoint.requiredReceipts.length);
  }
  assert.deepEqual(checkpointFindings(canonical), []);
});

test("requires every named receipt before a checkpoint is complete", () => {
  const contract = clone();
  contract.checkpoints[0].status = "complete";
  contract.checkpoints[0].receipts = [];
  assert.ok(codes(checkpointFindings(contract)).includes(
    "checkpoint_receipt_missing",
  ));

  contract.checkpoints[0].receipts = [
    ...contract.checkpoints[0].requiredReceipts,
  ];
  assert.equal(
    codes(checkpointFindings(contract)).includes("checkpoint_receipt_missing"),
    false,
  );
});

test("aggregate findings include journey and checkpoint failures", () => {
  const contract = clone();
  contract.journey.mandatoryPhases.splice(0, 1);
  contract.checkpoints[0].status = "complete";
  const findingCodes = codes(
    semanticRoadmapFindings(contract, validRows(canonical)),
  );
  assert.ok(findingCodes.includes("journey_phase_missing"));
  assert.ok(findingCodes.includes("checkpoint_receipt_missing"));
});
