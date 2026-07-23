import { strict as assert } from "node:assert";
import { execFileSync } from "node:child_process";
import {
  mkdtempSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
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
const RELEASE_METRICS = [
  "activation",
  "completion",
  "timeToValue",
  "abandonment",
  "trust",
  "reliability",
  "support",
] as const;

interface ReceiptRequirement {
  path: string;
  proofType: string;
}

function receiptRequirements(
  checkpoint: SemanticRoadmapContract["checkpoints"][number],
): ReceiptRequirement[] {
  return (checkpoint.requiredReceipts as unknown[]).map((receipt) => {
    if (typeof receipt !== "string") return receipt as ReceiptRequirement;
    return {
      path: receipt,
      proofType: receipt.includes("customer") ? "customer" : "operational",
    };
  });
}

function writeReceipt(
  root: string,
  checkpointId: string,
  requirement: ReceiptRequirement,
  sourceCommit: string,
  overrides: Record<string, unknown> = {},
): void {
  const path = join(root, requirement.path);
  mkdirSync(dirname(path), { recursive: true });
  const receipt: Record<string, unknown> = {
    schemaVersion: 1,
    checkpoint: checkpointId,
    proofTypes: [requirement.proofType],
    status: "passed",
    observedAt: "2026-07-15T12:00:00Z",
    sourceCommit,
  };
  if (["customer", "operational"].includes(requirement.proofType)) {
    receipt.release = "R0";
    receipt.metrics = Object.fromEntries(
      RELEASE_METRICS.map((metric) => [
        metric,
        { target: "declared", observed: "measured", result: "passed" },
      ]),
    );
    receipt.gate = "passed";
  }
  if (requirement.proofType === "preview") {
    receipt.preview = {
      targetCommit: sourceCommit,
      targets: [
        {
          provider: "vercel",
          surface: "marketplace",
          providerReceiptId: "dpl_marketplace_preview",
          healthResult: "passed",
        },
        {
          provider: "vercel",
          surface: "buyer",
          providerReceiptId: "dpl_buyer_preview",
          healthResult: "passed",
        },
        {
          provider: "vercel",
          surface: "seller",
          providerReceiptId: "dpl_seller_preview",
          healthResult: "passed",
        },
        {
          provider: "convex",
          surface: "preview",
          providerReceiptId: "convex_preview_receipt",
          healthResult: "passed",
        },
      ],
    };
  }
  if (requirement.proofType === "runtime") {
    receipt.runtime = {
      environment: "production",
      deploymentReceipts: [
        {
          provider: "vercel",
          providerReceiptId: "dpl_production_receipt",
          sourceCommit,
          healthResult: "passed",
        },
      ],
      runtimeGateReceipts: [
        {
          gateId: "RG:production-closure",
          provider: "github",
          providerReceiptId: "check_run_production_gate",
          sourceCommit,
          result: "passed",
        },
      ],
    };
  }
  if (requirement.proofType === "rollback") {
    receipt.rollback = {
      fromDeploymentReceiptId: "dpl_candidate_deployment",
      toDeploymentReceiptId: "dpl_known_good_deployment",
      startedAt: "2026-07-15T12:00:00Z",
      completedAt: "2026-07-15T12:01:00Z",
      durationMs: 60_000,
      recoveryHealth: {
        providerReceiptId: "health_check_rollback",
        result: "passed",
      },
    };
  }
  if (requirement.proofType === "approval") {
    receipt.approval = {
      provider: "github",
      providerReceiptId: "github_review_receipt",
      authorId: "release-author-id",
      reviewerId: "release-reviewer-id",
      reviewerKind: "human",
      reviewedAt: "2026-07-15T12:00:00Z",
      findings: [],
      verdict: "approved",
    };
  }
  Object.assign(receipt, overrides);
  writeFileSync(path, `${JSON.stringify(receipt)}\n`);
}

function createGitRoot(): { root: string; expectedCommit: string } {
  const root = mkdtempSync(join(tmpdir(), "sourcera-checkpoint-"));
  execFileSync("git", ["init", "-q"], { cwd: root });
  execFileSync("git", ["config", "user.email", "test@sourcera.local"], {
    cwd: root,
  });
  execFileSync("git", ["config", "user.name", "Sourcera Test"], {
    cwd: root,
  });
  execFileSync("git", ["commit", "--allow-empty", "-qm", "fixture"], {
    cwd: root,
  });
  const expectedCommit = execFileSync("git", ["rev-parse", "HEAD"], {
    cwd: root,
    encoding: "utf8",
  }).trim();
  return { root, expectedCommit };
}

function completeCheckpoint(
  contract: SemanticRoadmapContract,
  root: string,
  index: number,
  sourceCommit: string,
): void {
  const checkpoint = contract.checkpoints[index];
  checkpoint.status = "complete";
  (checkpoint as unknown as { evidenceCommit: string | null }).evidenceCommit =
    sourceCommit;
  for (const requirement of receiptRequirements(checkpoint)) {
    writeReceipt(root, checkpoint.id, requirement, sourceCommit);
  }
}

function semanticEdges(contract: SemanticRoadmapContract): SemanticRoadmapEdge[] {
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
  const last = contract.journey.mandatoryPhases.at(-1);
  if (last) {
    edges.push({
      prerequisiteId: last.requirementId,
      prerequisiteSection: last.sourceSection,
      dependentId: contract.journey.terminalArtifact.requirementId,
      dependentSection: contract.journey.terminalArtifact.sourceSection,
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
    const pinned = edge as SemanticRoadmapEdge & {
      prerequisiteSection?: string;
      dependentSection?: string;
    };
    add(edge.prerequisiteId, pinned.prerequisiteSection);
    add(edge.dependentId, pinned.dependentSection);
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
  assert.deepEqual(
    canonical.journey.requiredEdges.map((edge) => [
      edge.prerequisiteId,
      edge.dependentId,
    ]),
    [
      ["F-223", "F-224"],
      ["F-221", "F-225"],
      ["F-224", "F-225"],
      ["F-225", "F-226"],
      ["F-226", "F-228"],
    ],
  );
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

test("rejects a changed contract authority pin", () => {
  const contract = clone();
  contract.source.sourceDoc = "UX_Design_of_Sourcera.md";
  contract.source.sourceVersion = "v6.0.0";
  contract.source.sections = ["§10.1"];
  assert.ok(codes(journeyFindings(contract, validRows(canonical))).includes(
    "journey_contract_source_invalid",
  ));
});

test("rejects a semantic row with the wrong source document or section", () => {
  const wrongDocument = validRows(canonical);
  const phaseOne = wrongDocument.find((row) => row.requirementId === "F-211");
  assert.ok(phaseOne);
  phaseOne.sourceDoc = "UX_Design_of_Sourcera.md";
  assert.ok(codes(journeyFindings(canonical, wrongDocument)).includes(
    "journey_source_pin_invalid",
  ));

  const wrongSection = validRows(canonical);
  const phaseTwo = wrongSection.find((row) => row.requirementId === "F-212");
  assert.ok(phaseTwo);
  phaseTwo.section = "§10.9";
  assert.ok(codes(journeyFindings(canonical, wrongSection)).includes(
    "journey_source_pin_invalid",
  ));
});

test("pins feature introduction version separately from current authority", () => {
  assert.equal(canonical.source.sourceVersion, "v7.1.0a");
  assert.equal(
    (canonical.source as typeof canonical.source & {
      featureIntroductionVersion?: string;
    }).featureIntroductionVersion,
    "v6.0.0",
  );
  const rows = validRows(canonical);
  assert.ok(rows.every((row) => row.sourceVersion === "v6.0.0"));
  assert.equal(
    codes(journeyFindings(canonical, rows)).includes(
      "journey_source_pin_invalid",
    ),
    false,
  );
});

test("rejects a semantic row with the wrong feature introduction version", () => {
  for (const [requirementId, expectedCode] of [
    ["F-211", "journey_source_pin_invalid"],
    ["F-235", "journey_source_pin_invalid"],
    ["F-224", "journey_source_pin_invalid"],
    ["F-216", "journey_optional_path_invalid"],
  ] as const) {
    const rows = validRows(canonical);
    const row = rows.find((candidate) => candidate.requirementId === requirementId);
    assert.ok(row);
    row.sourceVersion = "v7.1.0a";
    assert.ok(codes(journeyFindings(canonical, rows)).includes(expectedCode));
  }
});

test("rejects an optional later path that is not executable or source-pinned", () => {
  const nonExecutable = validRows(canonical);
  const amendment = nonExecutable.find((row) => row.requirementId === "F-216");
  assert.ok(amendment);
  amendment.disposition = "narrative_context";
  assert.ok(codes(journeyFindings(canonical, nonExecutable)).includes(
    "journey_optional_path_invalid",
  ));

  const unpinned = validRows(canonical);
  const approval = unpinned.find((row) => row.requirementId === "F-227");
  assert.ok(approval);
  approval.section = "§10.13";
  assert.ok(codes(journeyFindings(canonical, unpinned)).includes(
    "journey_optional_path_invalid",
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
    assert.equal(
      (checkpoint as unknown as { evidenceCommit?: string | null })
        .evidenceCommit,
      null,
    );
    assert.ok(checkpoint.requirements.success.length);
    assert.ok(checkpoint.requirements.failureRecovery.length);
    assert.ok(checkpoint.requirements.rollout.length);
    assert.ok(checkpoint.requirements.rollback.length);
    assert.ok(checkpoint.requirements.telemetry.length);
    assert.ok(checkpoint.requirements.customerProof.length);
    assert.ok(checkpoint.requirements.operationalProof.length);
    assert.ok(receiptRequirements(checkpoint).length);
  }
  assert.deepEqual(
    receiptRequirements(canonical.checkpoints[7]).map(
      (receipt) => receipt.proofType,
    ),
    ["customer", "operational", "preview", "runtime", "rollback", "approval"],
  );
  assert.deepEqual(checkpointFindings(canonical), []);
});

test("closes checkpoint proof at commit A from later closeout commit B", () => {
  const { root, expectedCommit: evidenceCommit } = createGitRoot();
  try {
    const contract = clone();
    completeCheckpoint(contract, root, 0, evidenceCommit);
    execFileSync("git", ["commit", "--allow-empty", "-qm", "closeout"], {
      cwd: root,
    });
    const closeoutCommit = execFileSync("git", ["rev-parse", "HEAD"], {
      cwd: root,
      encoding: "utf8",
    }).trim();
    assert.notEqual(closeoutCommit, evidenceCommit);
    assert.deepEqual(checkpointFindings(contract, { root }), []);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("rejects complete checkpoint without its own declared commit", () => {
  const contract = clone();
  contract.checkpoints[0].status = "complete";
  assert.ok(
    codes(checkpointFindings(contract, { root: process.cwd() })).includes(
      "checkpoint_evidence_commit_missing",
    ),
  );
});

test("rejects a checkpoint whose canonical scope is replaced", () => {
  const contract = clone();
  contract.checkpoints[3].scope = ["anything"];
  assert.ok(codes(checkpointFindings(contract)).includes(
    "checkpoint_scope_invalid",
  ));
});

test("keeps planned checkpoints valid without receipt files", () => {
  const root = mkdtempSync(join(tmpdir(), "sourcera-checkpoint-"));
  try {
    assert.deepEqual(
      checkpointFindings(canonical, { root }),
      [],
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("requires every predecessor to be complete", () => {
  const { root, expectedCommit } = createGitRoot();
  try {
    const contract = clone();
    completeCheckpoint(contract, root, 1, expectedCommit);
    assert.ok(codes(checkpointFindings(contract, { root })).includes(
      "checkpoint_predecessor_incomplete",
    ));
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("rejects missing or malformed checkpoint evidence", () => {
  const { root, expectedCommit } = createGitRoot();
  try {
    const missing = clone();
    missing.checkpoints[0].status = "complete";
    missing.checkpoints[0].evidenceCommit = expectedCommit;
    assert.ok(codes(checkpointFindings(missing, { root })).includes(
      "checkpoint_evidence_missing",
    ));

    const malformed = clone();
    malformed.checkpoints[0].status = "complete";
    malformed.checkpoints[0].evidenceCommit = expectedCommit;
    const first = receiptRequirements(malformed.checkpoints[0])[0];
    const path = join(root, first.path);
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, "{not-json}\n");
    assert.ok(codes(checkpointFindings(malformed, { root })).includes(
      "checkpoint_evidence_invalid",
    ));
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("rejects evidence with wrong identity, proof type, result, commit, or body", () => {
  const cases: Array<[string, Record<string, unknown>, string]> = [
    ["checkpoint", { checkpoint: "R0-C8" }, "checkpoint_evidence_mismatch"],
    ["proof", { proofTypes: ["runtime"] }, "checkpoint_evidence_mismatch"],
    ["status", { status: "failed" }, "checkpoint_evidence_invalid"],
    ["short-sha", { sourceCommit: "abc123" }, "checkpoint_evidence_invalid"],
    [
      "wrong-sha",
      { sourceCommit: "fedcba9876543210fedcba9876543210fedcba98" },
      "checkpoint_commit_mismatch",
    ],
    [
      "generic-only",
      { metrics: undefined, gate: undefined, evidence: ["generic string"] },
      "checkpoint_evidence_invalid",
    ],
  ];
  for (const [name, overrides, expectedCode] of cases) {
    const { root, expectedCommit } = createGitRoot();
    try {
      const contract = clone();
      contract.checkpoints[0].status = "complete";
      contract.checkpoints[0].evidenceCommit = expectedCommit;
      for (const requirement of receiptRequirements(contract.checkpoints[0])) {
        writeReceipt(root, "R0-C1", requirement, expectedCommit, overrides);
      }
      assert.ok(
        codes(checkpointFindings(contract, { root })).includes(expectedCode),
        name,
      );
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  }
});

test("requires preview, runtime, rollback, and approval proof for C8 closure", () => {
  const { root, expectedCommit } = createGitRoot();
  try {
    const contract = clone();
    const checkpoint = contract.checkpoints[7];
    const configured = receiptRequirements(checkpoint).filter(
      (receipt) =>
        !["preview", "runtime", "rollback", "approval"].includes(
          receipt.proofType,
        ),
    );
    checkpoint.requiredReceipts =
      configured as typeof checkpoint.requiredReceipts;
    for (let index = 0; index < 7; index += 1) {
      completeCheckpoint(contract, root, index, expectedCommit);
    }
    checkpoint.status = "complete";
    checkpoint.evidenceCommit = expectedCommit;
    assert.ok(codes(checkpointFindings(contract, { root })).includes(
      "checkpoint_required_proof_missing",
    ));
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("rejects C8 closure when only the preview receipt is omitted", () => {
  const contract = clone();
  contract.checkpoints[7].requiredReceipts =
    contract.checkpoints[7].requiredReceipts.filter(
      (receipt) => receipt.proofType !== "preview",
    );
  const finding = checkpointFindings(contract).find(
    (candidate) =>
      candidate.code === "checkpoint_required_proof_missing" &&
      candidate.checkpointId === "R0-C8",
  );
  assert.ok(finding);
  assert.match(finding.message, /preview/);
});

test("rejects C8 approval when reviewer and author are the same", () => {
  const { root, expectedCommit } = createGitRoot();
  try {
    const contract = clone();
    for (let index = 0; index < contract.checkpoints.length; index += 1) {
      completeCheckpoint(contract, root, index, expectedCommit);
    }
    const approval = receiptRequirements(contract.checkpoints[7]).find(
      (receipt) => receipt.proofType === "approval",
    );
    assert.ok(approval);
    writeReceipt(root, "R0-C8", approval, expectedCommit, {
      approval: {
        provider: "linear",
        providerReceiptId: "linear_approval_receipt",
        authorId: "same-id",
        reviewerId: "same-id",
        reviewerKind: "human",
        reviewedAt: "2026-07-15T12:00:00Z",
        findings: [],
        verdict: "approved",
      },
    });
    assert.ok(codes(checkpointFindings(contract, { root })).includes(
      "checkpoint_approval_not_independent",
    ));
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("accepts complete checkpoints with valid commit-bound parsed evidence", () => {
  const { root, expectedCommit } = createGitRoot();
  try {
    const contract = clone();
    for (let index = 0; index < contract.checkpoints.length; index += 1) {
      completeCheckpoint(contract, root, index, expectedCommit);
    }
    assert.deepEqual(checkpointFindings(contract, { root }), []);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("aggregate findings include journey and checkpoint failures", () => {
  const contract = clone();
  contract.journey.mandatoryPhases.splice(0, 1);
  contract.checkpoints[0].status = "complete";
  contract.checkpoints[0].evidenceCommit = execFileSync(
    "git",
    ["rev-parse", "HEAD"],
    { encoding: "utf8" },
  ).trim();
  const findingCodes = codes(
    semanticRoadmapFindings(contract, validRows(canonical), {
      root: process.cwd(),
    }),
  );
  assert.ok(findingCodes.includes("journey_phase_missing"));
  assert.ok(findingCodes.includes("checkpoint_evidence_missing"));
});
