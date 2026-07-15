import type {
  Finding,
  ManifestRow,
  R0CheckpointId,
  SemanticRoadmapContract,
  SemanticRoadmapEdge,
} from "./model.js";

const EXPECTED_PHASES = [
  [1, "phase_1_stakeholder_alignment", "F-211", "§10.2"],
  [2, "phase_2_requirement_definition", "F-212", "§10.3"],
  [3, "phase_3_use_case_validation", "F-213", "§10.4"],
  [4, "phase_4_vendor_discovery", "F-214", "§10.5"],
  [5, "phase_5_vendor_outreach", "F-214", "§10.5"],
  [6, "phase_6_vendor_bidding", "F-215", "§10.6"],
  [7, "phase_7_response_refinement", "F-217", "§10.7"],
  [8, "phase_8_due_diligence", "F-218", "§10.8"],
  [9, "phase_9_final_clarifications", "F-219", "§10.9"],
  [10, "phase_10_team_scoring", "F-220", "§10.10"],
  [11, "phase_11_score_review", "F-223", "§10.11"],
  [12, "phase_12_selection", "F-225", "§10.12"],
  [13, "phase_13_contract_closure", "F-228", "§10.13"],
] as const;

const REQUIRED_SUPPORT = [
  ["F-210", "§10.1.2"],
  ["F-235", "§10.16"],
  ["F-236", "§10.16.2"],
  ["F-237", "§10.16.3"],
  ["F-238", "§10.16.1"],
] as const;

const REQUIRED_EDGES = [
  ["F-224", "F-225"],
  ["F-226", "F-228"],
] as const;

const OPTIONAL_LATER_PATHS = [
  ["F-216", "R1", "§10.6"],
  ["F-222", "R1", "§10.10"],
  ["F-227", "R1", "§10.12"],
] as const;

const CHECKPOINT_IDS = [
  "R0-C1",
  "R0-C2",
  "R0-C3",
  "R0-C4",
  "R0-C5",
  "R0-C6",
  "R0-C7",
  "R0-C8",
] as const;

const REQUIREMENT_FIELDS = [
  "success",
  "failureRecovery",
  "rollout",
  "rollback",
  "telemetry",
  "customerProof",
  "operationalProof",
] as const;

const nonempty = (value: string): boolean => value.trim().length > 0;

function requiredJourneyEdges(
  contract: SemanticRoadmapContract,
): SemanticRoadmapEdge[] {
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
  const terminalPhase = contract.journey.mandatoryPhases.at(-1);
  if (terminalPhase) {
    edges.push({
      prerequisiteId: terminalPhase.requirementId,
      dependentId: contract.journey.terminalArtifact.requirementId,
    });
  }
  const seen = new Set<string>();
  return edges.filter((edge) => {
    const key = `${edge.prerequisiteId}->${edge.dependentId}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function journeyFindings(
  contract: SemanticRoadmapContract,
  rows: ManifestRow[],
): Finding[] {
  const findings: Finding[] = [];
  const byId = new Map(rows.map((row) => [row.requirementId, row]));
  const phaseCounts = new Map<number, number>();
  for (const phase of contract.journey.mandatoryPhases) {
    phaseCounts.set(phase.phase, (phaseCounts.get(phase.phase) ?? 0) + 1);
  }

  for (const [phase] of EXPECTED_PHASES) {
    const count = phaseCounts.get(phase) ?? 0;
    if (count === 0) {
      findings.push({
        code: "journey_phase_missing",
        message: `Mandatory phase ${phase} is missing`,
      });
    } else if (count > 1) {
      findings.push({
        code: "journey_phase_duplicate",
        message: `Mandatory phase ${phase} appears ${count} times`,
      });
    }
  }

  const expectedOrder = EXPECTED_PHASES.map(([phase]) => phase);
  const actualOrder = contract.journey.mandatoryPhases.map(
    ({ phase }) => phase,
  );
  if (
    actualOrder.length !== expectedOrder.length ||
    actualOrder.some((phase, index) => phase !== expectedOrder[index])
  ) {
    findings.push({
      code: "journey_phase_order_invalid",
      message: "Mandatory phases must be ordered 1 through 13",
    });
  }

  for (const phase of contract.journey.mandatoryPhases) {
    const expected = EXPECTED_PHASES.find(([number]) => number === phase.phase);
    const supported =
      expected !== undefined &&
      phase.stage === expected[1] &&
      phase.requirementId === expected[2] &&
      phase.sourceSection === expected[3];
    const row = byId.get(phase.requirementId);
    if (!supported || !row || row.disposition !== "executable") {
      findings.push({
        code: "journey_phase_unsupported",
        requirementId: phase.requirementId,
        message: `Phase ${phase.phase} has an unsupported roadmap mapping`,
      });
      continue;
    }
    if (row.release !== contract.release) {
      findings.push({
        code: "journey_phase_later_release",
        requirementId: phase.requirementId,
        message: `Phase ${phase.phase} ${phase.requirementId} must be ${contract.release}, not ${row.release ?? "unassigned"}`,
      });
    }
  }

  const supportById = new Map(
    contract.journey.requiredSupport.map((support) => [
      support.requirementId,
      support,
    ]),
  );
  for (const [requirementId, sourceSection] of REQUIRED_SUPPORT) {
    const support = supportById.get(requirementId);
    const row = byId.get(requirementId);
    if (
      !support ||
      support.sourceSection !== sourceSection ||
      !row ||
      row.disposition !== "executable"
    ) {
      findings.push({
        code: "journey_support_missing",
        requirementId,
        message: `Mandatory journey support ${requirementId} is missing`,
      });
      continue;
    }
    if (row.release !== contract.release) {
      findings.push({
        code: "journey_support_later_release",
        requirementId,
        message: `Mandatory journey support ${requirementId} must be ${contract.release}, not ${row.release ?? "unassigned"}`,
      });
    }
  }
  for (const support of contract.journey.requiredSupport) {
    if (!REQUIRED_SUPPORT.some(([requirementId]) => requirementId === support.requirementId)) {
      findings.push({
        code: "journey_support_unsupported",
        requirementId: support.requirementId,
        message: `${support.requirementId} is not a supported mandatory journey control`,
      });
    }
  }

  for (const [prerequisiteId, dependentId] of REQUIRED_EDGES) {
    if (
      !contract.journey.requiredEdges.some(
        (edge) =>
          edge.prerequisiteId === prerequisiteId &&
          edge.dependentId === dependentId,
      )
    ) {
      findings.push({
        code: "journey_edge_missing",
        requirementId: dependentId,
        message: `Roadmap contract is missing ${prerequisiteId} -> ${dependentId}`,
      });
    }
  }

  if (
    contract.journey.terminalArtifact.requirementId !== "F-229" ||
    contract.journey.terminalArtifact.sourceSection !== "§10.13"
  ) {
    findings.push({
      code: "journey_terminal_unsupported",
      requirementId: contract.journey.terminalArtifact.requirementId,
      message: "The mandatory terminal artifact must be F-229",
    });
  }

  const mandatoryArtifactIds = new Set([
    ...contract.journey.requiredEdges.flatMap((edge) => [
      edge.prerequisiteId,
      edge.dependentId,
    ]),
    contract.journey.terminalArtifact.requirementId,
  ]);
  for (const requirementId of mandatoryArtifactIds) {
    const row = byId.get(requirementId);
    if (!row || row.disposition !== "executable") {
      findings.push({
        code: "journey_artifact_missing",
        requirementId,
        message: `Mandatory journey artifact ${requirementId} is missing`,
      });
    } else if (row.release !== contract.release) {
      findings.push({
        code: "journey_artifact_later_release",
        requirementId,
        message: `Mandatory journey artifact ${requirementId} must be ${contract.release}, not ${row.release ?? "unassigned"}`,
      });
    }
  }

  const optionalById = new Map(
    contract.journey.optionalLaterPaths.map((path) => [path.requirementId, path]),
  );
  for (const [requirementId, release, sourceSection] of OPTIONAL_LATER_PATHS) {
    const path = optionalById.get(requirementId);
    const row = byId.get(requirementId);
    if (!path || path.sourceSection !== sourceSection || !row) {
      findings.push({
        code: "journey_optional_path_missing",
        requirementId,
        message: `Optional later path ${requirementId} is missing`,
      });
      continue;
    }
    if (path.release !== release || row.release !== release) {
      findings.push({
        code: "journey_optional_release_changed",
        requirementId,
        message: `Optional path ${requirementId} must remain ${release}`,
      });
    }
  }

  for (const edge of requiredJourneyEdges(contract)) {
    if (edge.prerequisiteId === edge.dependentId) {
      findings.push({
        code: "journey_edge_self_cycle",
        requirementId: edge.dependentId,
        message: `${edge.dependentId} cannot depend on itself`,
      });
      continue;
    }
    const dependent = byId.get(edge.dependentId);
    if (!dependent?.dependencies.includes(edge.prerequisiteId)) {
      findings.push({
        code: "journey_edge_missing",
        requirementId: edge.dependentId,
        message: `${edge.dependentId} must depend on ${edge.prerequisiteId}`,
      });
    }
  }
  return findings;
}

export function checkpointFindings(
  contract: SemanticRoadmapContract,
): Finding[] {
  const findings: Finding[] = [];
  const counts = new Map<R0CheckpointId, number>();
  for (const checkpoint of contract.checkpoints) {
    counts.set(checkpoint.id, (counts.get(checkpoint.id) ?? 0) + 1);
  }
  for (const id of CHECKPOINT_IDS) {
    const count = counts.get(id) ?? 0;
    if (count === 0) {
      findings.push({
        code: "checkpoint_missing",
        checkpointId: id,
        message: `${id} is missing`,
      });
    } else if (count > 1) {
      findings.push({
        code: "checkpoint_duplicate",
        checkpointId: id,
        message: `${id} appears ${count} times`,
      });
    }
  }

  if (
    contract.checkpoints.length !== CHECKPOINT_IDS.length ||
    contract.checkpoints.some(
      (checkpoint, index) =>
        checkpoint.id !== CHECKPOINT_IDS[index] ||
        checkpoint.sequence !== index + 1,
    )
  ) {
    findings.push({
      code: "checkpoint_order_invalid",
      message: "Checkpoints must be ordered R0-C1 through R0-C8",
    });
  }

  const byId = new Map(
    contract.checkpoints.map((checkpoint) => [checkpoint.id, checkpoint]),
  );
  for (const checkpoint of contract.checkpoints) {
    const index = CHECKPOINT_IDS.indexOf(checkpoint.id);
    const expectedDependency = index > 0 ? CHECKPOINT_IDS[index - 1] : null;
    const dependencyIsValid = expectedDependency
      ? checkpoint.dependsOn.length === 1 &&
        checkpoint.dependsOn[0] === expectedDependency
      : checkpoint.dependsOn.length === 0;
    if (!dependencyIsValid) {
      findings.push({
        code: "checkpoint_dependency_invalid",
        checkpointId: checkpoint.id,
        message: `${checkpoint.id} has an invalid predecessor`,
      });
    }

    if (!nonempty(checkpoint.name) || !checkpoint.scope.length) {
      findings.push({
        code: "checkpoint_scope_missing",
        checkpointId: checkpoint.id,
        message: `${checkpoint.id} lacks a name or scope`,
      });
    }
    for (const field of REQUIREMENT_FIELDS) {
      const values = checkpoint.requirements[field];
      if (!values.length || values.some((value) => !nonempty(value))) {
        findings.push({
          code: "checkpoint_requirement_missing",
          checkpointId: checkpoint.id,
          message: `${checkpoint.id} lacks ${field} requirements`,
        });
      }
    }

    if (
      !checkpoint.requiredReceipts.length ||
      checkpoint.requiredReceipts.some(
        (receipt) =>
          !receipt.startsWith("reports/evidence/") ||
          !receipt.endsWith(".json") ||
          /\b(?:TBD|TODO|placeholder)\b/i.test(receipt),
      )
    ) {
      findings.push({
        code: "checkpoint_receipt_name_invalid",
        checkpointId: checkpoint.id,
        message: `${checkpoint.id} lacks named evidence receipts`,
      });
    }
    if (checkpoint.status === "complete") {
      for (const receipt of checkpoint.requiredReceipts) {
        if (!checkpoint.receipts.includes(receipt)) {
          findings.push({
            code: "checkpoint_receipt_missing",
            checkpointId: checkpoint.id,
            message: `${checkpoint.id} cannot be complete without ${receipt}`,
          });
        }
      }
    }
  }

  const visiting = new Set<R0CheckpointId>();
  const visited = new Set<R0CheckpointId>();
  const visit = (id: R0CheckpointId) => {
    if (visiting.has(id)) {
      findings.push({
        code: "checkpoint_cycle",
        checkpointId: id,
        message: `Checkpoint dependency cycle reaches ${id}`,
      });
      return;
    }
    if (visited.has(id)) return;
    visiting.add(id);
    for (const dependency of byId.get(id)?.dependsOn ?? []) {
      if (!byId.has(dependency)) {
        findings.push({
          code: "checkpoint_dependency_invalid",
          checkpointId: id,
          message: `${id} depends on unknown ${dependency}`,
        });
      } else {
        visit(dependency);
      }
    }
    visiting.delete(id);
    visited.add(id);
  };
  for (const checkpoint of contract.checkpoints) visit(checkpoint.id);
  return findings;
}

export function semanticRoadmapFindings(
  contract: SemanticRoadmapContract,
  rows: ManifestRow[],
): Finding[] {
  return [...journeyFindings(contract, rows), ...checkpointFindings(contract)];
}
