import type {
  CheckpointEvidenceContext,
  Finding,
  ManifestRow,
  R0CheckpointId,
  SemanticRoadmapContract,
  SemanticRoadmapEdge,
} from "./model.js";
import { checkpointReceiptFinding } from "./evidence.js";

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
  ["F-223", "§10.11", "F-224", "§10.11"],
  ["F-221", "§10.10", "F-225", "§10.12"],
  ["F-224", "§10.11", "F-225", "§10.12"],
  ["F-225", "§10.12", "F-226", "§10.12"],
  ["F-226", "§10.12", "F-228", "§10.13"],
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

const CHECKPOINT_NAMES: Record<R0CheckpointId, string> = {
  "R0-C1": "Evidence-capable foundations",
  "R0-C2": "Isolated identity and access",
  "R0-C3": "Workspace and evaluation contracts",
  "R0-C4": "Buyer setup and seller invitation",
  "R0-C5": "Secure seller response",
  "R0-C6": "Review, scoring, and selection",
  "R0-C7": "Durable evaluation record",
  "R0-C8": "Runtime release closure",
};

const CHECKPOINT_SCOPES: Record<R0CheckpointId, readonly string[]> = {
  "R0-C1": ["local", "CI", "test", "deploy", "rollback", "evidence"],
  "R0-C2": [
    "auth",
    "tenancy",
    "console isolation",
    "RBAC",
    "audit",
    "baseline security",
  ],
  "R0-C3": [
    "workspace",
    "requirements",
    "evaluation",
    "state-machine contracts",
    "phases 1–3",
  ],
  "R0-C4": ["buyer setup", "seller invitation", "bidding entry"],
  "R0-C5": [
    "secure seller entry",
    "onboarding",
    "required NDA",
    "authoring",
    "submission",
  ],
  "R0-C6": [
    "phases 7–13",
    "buyer review",
    "scoring",
    "reports",
    "selection",
    "closure",
  ],
  "R0-C7": [
    "immutable selection record",
    "export",
    "retention",
    "recovery",
    "access enforcement",
  ],
  "R0-C8": [
    "canary",
    "rollback",
    "deployed receipts",
    "runtime-gate closure",
  ],
};

const REQUIREMENT_FIELDS = [
  "success",
  "failureRecovery",
  "rollout",
  "rollback",
  "telemetry",
  "customerProof",
  "operationalProof",
] as const;

const EXPECTED_CONTRACT_SOURCE = {
  sourceDoc: "Sourcera_Master_Spec.md",
  sourceVersion: "v7.1.0a",
  featureIntroductionVersion: "v6.0.0",
  sections: ["§10.1–§10.13", "§10.16.1–§10.16.3"],
} as const;

const BASE_CHECKPOINT_PROOFS = ["customer", "operational"] as const;
const C8_CHECKPOINT_PROOFS = [
  "preview",
  "runtime",
  "rollback",
  "approval",
] as const;
const COMMIT_SHA = /^[a-f0-9]{40}$/;

const nonempty = (value: string): boolean => value.trim().length > 0;

const rowHasSourcePin = (
  row: ManifestRow,
  sourceDoc: string,
  section: string,
): boolean =>
  row.sourceDoc === sourceDoc &&
  row.section === section &&
  row.sourceVersion === EXPECTED_CONTRACT_SOURCE.featureIntroductionVersion;

function requiredJourneyEdges(
  contract: SemanticRoadmapContract,
): SemanticRoadmapEdge[] {
  const edges: SemanticRoadmapEdge[] = [];
  const first = contract.journey.mandatoryPhases[0];
  if (first) {
    for (const support of contract.journey.requiredSupport) {
      edges.push({
        prerequisiteId: support.requirementId,
        prerequisiteSection: support.sourceSection,
        dependentId: first.requirementId,
        dependentSection: first.sourceSection,
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
    const prerequisiteSection =
      contract.journey.mandatoryPhases[index - 1].sourceSection;
    const dependentId = contract.journey.mandatoryPhases[index].requirementId;
    const dependentSection =
      contract.journey.mandatoryPhases[index].sourceSection;
    if (prerequisiteId !== dependentId) {
      edges.push({
        prerequisiteId,
        prerequisiteSection,
        dependentId,
        dependentSection,
      });
    }
  }
  edges.push(...contract.journey.requiredEdges);
  const terminalPhase = contract.journey.mandatoryPhases.at(-1);
  if (terminalPhase) {
    edges.push({
      prerequisiteId: terminalPhase.requirementId,
      prerequisiteSection: terminalPhase.sourceSection,
      dependentId: contract.journey.terminalArtifact.requirementId,
      dependentSection: contract.journey.terminalArtifact.sourceSection,
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
  const reportedSourcePins = new Set<string>();
  const sourcePinFinding = (requirementId: string, section: string) => {
    const row = byId.get(requirementId);
    if (
      !row ||
      reportedSourcePins.has(requirementId) ||
      rowHasSourcePin(row, EXPECTED_CONTRACT_SOURCE.sourceDoc, section)
    ) {
      return;
    }
    reportedSourcePins.add(requirementId);
    findings.push({
      code: "journey_source_pin_invalid",
      requirementId,
      message: `${requirementId} must be pinned to ${EXPECTED_CONTRACT_SOURCE.sourceDoc} ${EXPECTED_CONTRACT_SOURCE.featureIntroductionVersion} ${section}`,
    });
  };
  if (
    contract.schemaVersion !== 1 ||
    contract.release !== "R0" ||
    contract.source.sourceDoc !== EXPECTED_CONTRACT_SOURCE.sourceDoc ||
    contract.source.sourceVersion !== EXPECTED_CONTRACT_SOURCE.sourceVersion ||
    contract.source.featureIntroductionVersion !==
      EXPECTED_CONTRACT_SOURCE.featureIntroductionVersion ||
    contract.source.sections.length !== EXPECTED_CONTRACT_SOURCE.sections.length ||
    contract.source.sections.some(
      (section, index) => section !== EXPECTED_CONTRACT_SOURCE.sections[index],
    )
  ) {
    findings.push({
      code: "journey_contract_source_invalid",
      message: "Roadmap authority must remain Sourcera_Master_Spec.md v7.1.0a with v6.0.0 feature introductions",
    });
  }
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
    sourcePinFinding(phase.requirementId, phase.sourceSection);
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
    sourcePinFinding(requirementId, sourceSection);
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

  for (
    const [
      prerequisiteId,
      prerequisiteSection,
      dependentId,
      dependentSection,
    ] of REQUIRED_EDGES
  ) {
    if (
      !contract.journey.requiredEdges.some(
        (edge) =>
          edge.prerequisiteId === prerequisiteId &&
          edge.prerequisiteSection === prerequisiteSection &&
          edge.dependentId === dependentId &&
          edge.dependentSection === dependentSection,
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

  const mandatoryArtifactPins = new Map<string, string>();
  for (const edge of contract.journey.requiredEdges) {
    mandatoryArtifactPins.set(edge.prerequisiteId, edge.prerequisiteSection);
    mandatoryArtifactPins.set(edge.dependentId, edge.dependentSection);
  }
  mandatoryArtifactPins.set(
    contract.journey.terminalArtifact.requirementId,
    contract.journey.terminalArtifact.sourceSection,
  );
  for (const [requirementId, sourceSection] of mandatoryArtifactPins) {
    const row = byId.get(requirementId);
    if (!row || row.disposition !== "executable") {
      findings.push({
        code: "journey_artifact_missing",
        requirementId,
        message: `Mandatory journey artifact ${requirementId} is missing`,
      });
    } else {
      sourcePinFinding(requirementId, sourceSection);
      if (row.release !== contract.release) {
        findings.push({
          code: "journey_artifact_later_release",
          requirementId,
          message: `Mandatory journey artifact ${requirementId} must be ${contract.release}, not ${row.release ?? "unassigned"}`,
        });
      }
    }
  }

  const optionalById = new Map(
    contract.journey.optionalLaterPaths.map((path) => [path.requirementId, path]),
  );
  for (const [requirementId, release, sourceSection] of OPTIONAL_LATER_PATHS) {
    const path = optionalById.get(requirementId);
    const row = byId.get(requirementId);
    if (
      !path ||
      path.sourceSection !== sourceSection ||
      !row ||
      row.disposition !== "executable" ||
      !rowHasSourcePin(row, EXPECTED_CONTRACT_SOURCE.sourceDoc, sourceSection)
    ) {
      findings.push({
        code: "journey_optional_path_invalid",
        requirementId,
        message: `Optional later path ${requirementId} must remain executable and source-pinned`,
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
  evidenceContext?: CheckpointEvidenceContext,
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

    const expectedScope = CHECKPOINT_SCOPES[checkpoint.id];
    if (
      checkpoint.name !== CHECKPOINT_NAMES[checkpoint.id] ||
      checkpoint.scope.length !== expectedScope.length ||
      checkpoint.scope.some((value, scopeIndex) => value !== expectedScope[scopeIndex])
    ) {
      findings.push({
        code: "checkpoint_scope_invalid",
        checkpointId: checkpoint.id,
        message: `${checkpoint.id} name and scope must match the canonical checkpoint meaning`,
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
          !receipt.path.startsWith("reports/evidence/") ||
          !receipt.path.endsWith(".json") ||
          /\b(?:TBD|TODO|placeholder)\b/i.test(receipt.path) ||
          ![...BASE_CHECKPOINT_PROOFS, ...C8_CHECKPOINT_PROOFS].includes(
            receipt.proofType,
          ),
      )
    ) {
      findings.push({
        code: "checkpoint_receipt_name_invalid",
        checkpointId: checkpoint.id,
        message: `${checkpoint.id} lacks named evidence receipts`,
      });
    }
    const requiredProofs = checkpoint.id === "R0-C8"
      ? [...BASE_CHECKPOINT_PROOFS, ...C8_CHECKPOINT_PROOFS]
      : [...BASE_CHECKPOINT_PROOFS];
    for (const proofType of requiredProofs) {
      if (
        !checkpoint.requiredReceipts.some(
          (receipt) => receipt.proofType === proofType,
        )
      ) {
        findings.push({
          code: "checkpoint_required_proof_missing",
          checkpointId: checkpoint.id,
          message: `${checkpoint.id} requires named ${proofType} proof`,
        });
      }
    }
    if (checkpoint.status === "complete") {
      for (const dependency of checkpoint.dependsOn) {
        if (byId.get(dependency)?.status !== "complete") {
          findings.push({
            code: "checkpoint_predecessor_incomplete",
            checkpointId: checkpoint.id,
            message: `${checkpoint.id} cannot be complete before ${dependency}`,
          });
        }
      }
      if (
        !evidenceContext ||
        !nonempty(evidenceContext.root) ||
        !COMMIT_SHA.test(evidenceContext.expectedCommit)
      ) {
        findings.push({
          code: "checkpoint_evidence_context_invalid",
          checkpointId: checkpoint.id,
          message: `${checkpoint.id} completion requires a root and full expected commit SHA`,
        });
      } else {
        for (const receipt of checkpoint.requiredReceipts) {
          const finding = checkpointReceiptFinding({
            root: evidenceContext.root,
            path: receipt.path,
            checkpointId: checkpoint.id,
            proofType: receipt.proofType,
            expectedCommit: evidenceContext.expectedCommit,
          });
          if (finding) findings.push(finding);
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
  evidenceContext?: CheckpointEvidenceContext,
): Finding[] {
  return [
    ...journeyFindings(contract, rows),
    ...checkpointFindings(contract, evidenceContext),
  ];
}
