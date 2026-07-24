#!/usr/bin/env node
import {
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { resolve } from "node:path";
import {
  applyFeatureDependencies,
  type FeatureDependencyRepair,
} from "./lib/dependencies.js";
import { driftFindings } from "./lib/drift.js";
import {
  evidenceGroupFindings,
  evidenceGroupPasses,
  type EvidenceGroup,
  type EvidenceKind,
} from "./lib/evidence.js";
import { validateGraph } from "./lib/graph.js";
import {
  issueFamilyFindings,
  issueFamilyForSource,
} from "./lib/issue-family.js";
import {
  linearMilestoneFindings,
  type LinearMilestoneSnapshot,
} from "./lib/linear-milestones.js";
import type { LinearFingerprint } from "./lib/linear-live.js";
import type { LinearProjectScope } from "./lib/linear-project-scope.js";
import {
  operatingModelFindings,
  type OperatingModel,
} from "./lib/operating-model.js";
import {
  publicationIntegrityFindings,
  publicationIntegritySummary,
} from "./lib/publication-integrity.js";
import {
  releasePolicyFindings,
} from "./lib/release-policy.js";
import type {
  Disposition,
  Finding,
  LinearIssueSnapshot,
  ManifestRow,
  ReleaseAssignment,
  ReleaseDefinition,
  ReleasePolicy,
  SemanticRoadmapContract,
  SourceRequirement,
} from "./lib/model.js";
import { readinessFindings } from "./lib/readiness.js";
import {
  assertBoundTicketIntegrityReport,
  type BoundTicketIntegrityReport,
} from "./lib/ticket-integrity.js";
import { validateReleases } from "./lib/releases.js";
import { calculateScorecard } from "./lib/scorecard.js";
import { semanticRoadmapFindings } from "./lib/semantic-roadmap.js";
import {
  parseFeatureInventory,
  parseRuntimeGate,
  sourceReferenceFindings,
} from "./lib/sources.js";
import {
  resolvedJourneyTargets,
  validationEvidenceGroups,
  validationPlanFindings,
  type ValidationPlan,
} from "./lib/validation.js";

interface DispositionOverride {
  requirementId: string;
  disposition: Disposition;
  replacementId?: string;
  rationale: string;
}

interface RuntimeGateDependency {
  requirementId: string;
  dependencies: string[];
  rationale: string;
}

interface LinearDeliverySnapshot extends LinearMilestoneSnapshot {
  issues: LinearIssueSnapshot[];
  linearFingerprint: LinearFingerprint;
  linearTicketIntegrity?: BoundTicketIntegrityReport;
}

function argumentsByName(): Map<string, string> {
  const values = new Map<string, string>();
  for (let index = 2; index < process.argv.length; index += 2) {
    const name = process.argv[index];
    const value = process.argv[index + 1];
    if (!name?.startsWith("--") || !value) {
      throw new Error(`Invalid argument near ${name ?? "end of command"}`);
    }
    values.set(name, value);
  }
  return values;
}

const argv = argumentsByName();
if (argv.has("--inventory") && !argv.has("--feature-dependencies")) {
  throw new Error(
    "--feature-dependencies is required when --inventory is supplied",
  );
}
if (argv.has("--inventory") && !argv.has("--policy")) {
  throw new Error("--policy is required when --inventory is supplied");
}
const required = (name: string, fallback?: string) => {
  const value = argv.get(name) ?? fallback;
  if (!value) throw new Error(`Required argument ${name}`);
  return value;
};
const root = resolve(required("--root", "."));
const path = (flag: string, fallback: string) =>
  resolve(root, required(flag, fallback));
const inventoryPath = path("--inventory", "_audit/FEATURE_INVENTORY.md");
const stampPath = path("--stamp", "/tmp/sourcera-stamp.json");
const exactPath = path("--exact", "/tmp/sourcera-exact.json");
const releasesPath = path("--releases", "delivery/releases.json");
const releasePlanPath = path("--release-plan", "delivery/release-plan.json");
const policyPath = path("--policy", "delivery/release-policy.json");
const dispositionsPath = path(
  "--dispositions",
  "delivery/dispositions.json",
);
const runtimeDependenciesPath = path(
  "--runtime-dependencies",
  "delivery/runtime-gate-dependencies.json",
);
const featureDependenciesPath = path(
  "--feature-dependencies",
  "delivery/feature-dependencies.json",
);
const decisionsPath = path("--decisions", "delivery/decisions.jsonl");
const risksPath = path("--risks", "delivery/risks.json");
const validationPath = path(
  "--validation",
  "delivery/validation-plan.json",
);
const linearPath = path("--linear", "delivery/linear-snapshot.json");
const operatingModelPath = path(
  "--operating-model",
  "delivery/operating-model.json",
);
const linearProjectScopePath = path(
  "--linear-project-scope",
  "delivery/linear-project-scope.json",
);
const roadmapPath = path("--roadmap", "delivery/roadmap-contract.json");
const outDir = path("--out", "reports/delivery");

const json = <T>(file: string): T =>
  JSON.parse(readFileSync(file, "utf8")) as T;
const stamp = json<{ summary: unknown; findings: unknown[] }>(stampPath);
const exact = json<{
  open_rows?: number;
  summary?: { open_rows?: number };
  [key: string]: unknown;
}>(exactPath);
const exactEvidence = {
  ...exact,
  ...(typeof exact.ledger === "string"
    ? {
        ledger: (() => {
          const normalized = exact.ledger.replaceAll("\\", "/");
          const marker = "/_audit/";
          const markerIndex = normalized.lastIndexOf(marker);
          return markerIndex >= 0
            ? normalized.slice(markerIndex + 1)
            : normalized;
        })(),
      }
    : {}),
};
const releases = json<{ releases: ReleaseDefinition[] }>(releasesPath)
  .releases;
const releasePlan = json<{ assignments: ReleaseAssignment[] }>(releasePlanPath)
  .assignments;
const policy = json<ReleasePolicy>(policyPath);
const linearSnapshot = json<LinearDeliverySnapshot>(linearPath);
const descriptionContractVerified = linearSnapshot.linearTicketIntegrity
  ? Boolean(
      assertBoundTicketIntegrityReport(
        linearSnapshot.linearTicketIntegrity,
        `${JSON.stringify(linearSnapshot.linearFingerprint, null, 2)}\n`,
        linearSnapshot.issues.length,
      ),
    )
  : false;
const operatingModel = json<OperatingModel>(operatingModelPath);
const linearProjectScope = json<LinearProjectScope>(linearProjectScopePath);
const issues = linearSnapshot.issues;
const roadmap = json<SemanticRoadmapContract>(roadmapPath);
const overrides = json<{ overrides: DispositionOverride[] }>(dispositionsPath)
  .overrides;
const runtimeDependencies = existsSync(runtimeDependenciesPath)
  ? json<{ dependencies: RuntimeGateDependency[] }>(runtimeDependenciesPath)
      .dependencies
  : [];
const runtimeDependenciesById = new Map(
  runtimeDependencies.map((row) => [row.requirementId, row]),
);
const featureDependencies = json<{ repairs: FeatureDependencyRepair[] }>(
  featureDependenciesPath,
).repairs;
const decisions = readFileSync(decisionsPath, "utf8")
  .split(/\r?\n/)
  .filter(Boolean)
  .map(
    (line) =>
      JSON.parse(line) as {
        id: string;
        status: string;
        decision?: string;
        assumption?: string;
        validationTrigger?: string;
      },
  );
const risks = json<{
  risks: Array<{
    id: string;
    statement?: string;
    owner?: string;
    trigger?: string;
    response?: string;
  }>;
}>(risksPath).risks;
const validation = json<ValidationPlan>(validationPath);
const evidenceGroups: EvidenceGroup[] = validationEvidenceGroups(validation);
const validationFindings = validationPlanFindings(validation, releases);

const overrideById = new Map(
  overrides.map((override) => [override.requirementId, override]),
);
const sourceFeatures = applyFeatureDependencies(
  parseFeatureInventory(readFileSync(inventoryPath, "utf8")),
  featureDependencies,
).map((row) => ({
  ...row,
  disposition: overrideById.get(row.requirementId)?.disposition ??
    row.disposition,
}));
const runtimeGates = parseRuntimeGate(readFileSync(stampPath, "utf8"));
const requirements: SourceRequirement[] = [
  ...sourceFeatures,
  ...runtimeGates,
]
  .map((row) => ({
    ...row,
    dependencies: row.requirementId.startsWith("RG:")
      ? runtimeDependenciesById.get(row.requirementId)?.dependencies ?? []
      : row.dependencies,
    disposition: overrideById.get(row.requirementId)?.disposition ??
      row.disposition,
  }))
  .sort((left, right) => left.requirementId.localeCompare(right.requirementId));
const issueBySource = new Map(
  issues
    .filter((issue) => issue.sourceId)
    .map((issue) => [issue.sourceId as string, issue]),
);
const manifest: ManifestRow[] = requirements.map((row) => {
  const issue = issueBySource.get(row.requirementId);
  return {
    ...row,
    release: issue?.release ?? null,
    issueId: issue?.id ?? null,
  };
});

const semanticFindings = semanticRoadmapFindings(
  roadmap,
  manifest,
  { root },
);
const productionEvidenceMilestoneFindings =
  linearMilestoneFindings(linearSnapshot, linearProjectScope);
const journeyReadinessFindings = [
  ...semanticFindings,
  ...productionEvidenceMilestoneFindings,
];

const sourceFindings = sourceReferenceFindings(requirements, root);
const dispositionFindings: Finding[] = overrides.flatMap((override) => {
  const findings: Finding[] = [];
  if (!requirements.some((row) => row.requirementId === override.requirementId)) {
    findings.push({
      code: "disposition_unknown",
      requirementId: override.requirementId,
      message: `${override.requirementId} is not in the source inventory`,
    });
  }
  if (!override.rationale.trim()) {
    findings.push({
      code: "disposition_rationale_missing",
      requirementId: override.requirementId,
      message: `${override.requirementId} lacks rationale`,
    });
  }
  if (
    (override.disposition === "superseded" ||
      override.disposition === "retired_source") &&
    !override.replacementId
  ) {
    findings.push({
      code: "disposition_replacement_missing",
      requirementId: override.requirementId,
      message: `${override.requirementId} lacks replacementId`,
    });
  }
  return findings;
});
const duplicateOverrides: Finding[] = overrides
  .filter(
    (override, index) =>
      overrides.findIndex(
        (candidate) => candidate.requirementId === override.requirementId,
      ) !== index,
  )
  .map((override) => ({
    code: "disposition_duplicate",
    requirementId: override.requirementId,
    message: `${override.requirementId} has duplicate dispositions`,
  }));
const runtimeDependencyFindings: Finding[] = [
  ...requirements
    .filter(
      (row) =>
        row.requirementId.startsWith("RG:") &&
        !runtimeDependenciesById.has(row.requirementId),
    )
    .map((row) => ({
      code: "runtime_dependency_missing",
      requirementId: row.requirementId,
      message: `${row.requirementId} lacks a behavior dependency`,
    })),
  ...runtimeDependencies
    .filter(
      (row) =>
        !requirements.some(
          (requirement) => requirement.requirementId === row.requirementId,
        ),
    )
    .map((row) => ({
      code: "runtime_dependency_unknown",
      requirementId: row.requirementId,
      message: `${row.requirementId} is not in current runtime truth`,
    })),
  ...runtimeDependencies
    .filter((row) => !row.dependencies.length || !row.rationale.trim())
    .map((row) => ({
      code: "runtime_dependency_incomplete",
      requirementId: row.requirementId,
      message: `${row.requirementId} lacks dependencies or rationale`,
    })),
];
const executableIds = new Set(
  sourceFeatures
    .filter((row) => row.disposition === "executable")
    .map((row) => row.requirementId),
);
const executablePolicyGraph = sourceFeatures
  .filter((row) => row.disposition === "executable")
  .map((row) => ({
    ...row,
    dependencies: row.dependencies.filter((dependencyId) =>
      executableIds.has(dependencyId),
    ),
  }));
const policyFindings = releasePolicyFindings(
  executablePolicyGraph,
  policy,
  releases,
);
const releasePlanById = new Map(
  releasePlan.map((assignment) => [assignment.requirementId, assignment]),
);
const releasePlanReadbackFindings: Finding[] = manifest.flatMap((row) => {
  if (!row.issueId || !row.release) return [];
  const readback = releasePlanById.get(row.requirementId);
  if (!readback) {
    return [{
      code: "release_readback_missing",
      requirementId: row.requirementId,
      issueId: row.issueId,
      message: `${row.requirementId} live Linear release ${row.release} is absent from the readback mirror`,
    }];
  }
  return readback.release === row.release
    ? []
    : [{
        code: "release_readback_drift",
        requirementId: row.requirementId,
        issueId: row.issueId,
        message: `${row.requirementId} readback ${readback.release} differs from live Linear ${row.release}`,
      }];
});
const exactOpenRows = Number(
  exact.open_rows ?? exact.summary?.open_rows ?? 0,
);
const exactFindings: Finding[] = exactOpenRows === 0
  ? []
  : [
      {
        code: "exact_status_open",
        message: "Exact-status scan still has open rows",
      },
    ];
const duplicateReleaseAssignments: Finding[] = releasePlan
  .filter(
    (assignment, index) =>
      releasePlan.findIndex(
        (candidate) => candidate.requirementId === assignment.requirementId,
      ) !== index,
  )
  .map((assignment) => ({
    code: "release_assignment_duplicate",
    requirementId: assignment.requirementId,
    message: `${assignment.requirementId} has duplicate release assignments`,
  }));
const releasePlanFindings: Finding[] = [
  ...policyFindings,
  ...releasePlanReadbackFindings,
  ...duplicateReleaseAssignments,
  ...releasePlan
    .filter(
      (assignment) =>
        !requirements.some(
          (row) => row.requirementId === assignment.requirementId,
        ),
    )
    .map((assignment) => ({
      code: "release_assignment_unknown",
      requirementId: assignment.requirementId,
      message: `${assignment.requirementId} is not in current source truth`,
    })),
  ...releasePlan
    .filter((assignment) => !assignment.rationale.trim())
    .map((assignment) => ({
      code: "release_assignment_rationale_missing",
      requirementId: assignment.requirementId,
      message: `${assignment.requirementId} lacks release rationale`,
    })),
  ...releasePlan
    .filter(
      (assignment) =>
        !releases.some((release) => release.id === assignment.release),
    )
    .map((assignment) => ({
      code: "release_assignment_invalid_release",
      requirementId: assignment.requirementId,
      message: `${assignment.requirementId} uses unknown ${assignment.release}`,
    })),
];
const duplicateIssueSources: Finding[] = issues
  .filter(
    (issue, index) =>
      issue.sourceId &&
      issues.findIndex((candidate) => candidate.sourceId === issue.sourceId) !==
        index,
  )
  .map((issue) => ({
    code: "duplicate_issue_source",
    issueId: issue.id,
    message: `${issue.id} duplicates source ${issue.sourceId}`,
  }));
const requiredDecisions = [
  "DEC-REPO-001",
  "DEC-WIP-001",
  "DEC-OWNER-001",
  "DEC-HEADER-001",
];
const decisionFindings: Finding[] = requiredDecisions
  .filter((id) => !decisions.some((decision) => decision.id === id))
  .map((id) => ({
    code: "decision_missing",
    message: `${id} is missing`,
  }));
const riskFindings: Finding[] = risks
  .filter(
    (risk) =>
      !risk.id ||
      !risk.statement ||
      !risk.owner ||
      !risk.trigger ||
      !risk.response,
  )
  .map((risk) => ({
    code: "risk_incomplete",
    message: `${risk.id || "unknown risk"} is incomplete`,
  }));
const operatingFindings = operatingModelFindings(
  operatingModel,
  issues,
  linearSnapshot.linearFingerprint,
  decisions,
);
const evidenceFindings = evidenceGroups.flatMap((group) =>
  evidenceGroupFindings(root, group),
);
const familyFindings = issueFamilyFindings(issues);
const releaseFindings = validateReleases(releases);
const graphFindings = validateGraph(manifest, releases);
const readiness = issues
  .filter((issue) => issue.labels.includes("codex-ready"))
  .flatMap((issue) =>
    readinessFindings(issue, { descriptionContractVerified }),
  );
const readyGraphFindings = graphFindings.filter(
  (finding) =>
    finding.requirementId &&
    issues.some(
      (issue) =>
        issue.sourceId === finding.requirementId &&
        issue.labels.includes("codex-ready"),
    ),
);
const replacementById = new Map(
  overrides.flatMap((override) =>
    override.replacementId
      ? [[override.requirementId, override.replacementId] as const]
      : [],
  ),
);
const canonicalDependency = (sourceId: string): string => {
  const seen = new Set<string>();
  let current = sourceId;
  while (replacementById.has(current)) {
    if (seen.has(current)) throw new Error(`Disposition replacement cycle at ${current}`);
    seen.add(current);
    current = replacementById.get(current)!;
  }
  return current;
};
const canonicalDependencyManifest = manifest.map((row) => ({
  ...row,
  dependencies: [
    ...new Set(row.dependencies.map(canonicalDependency)),
  ].filter((dependency) => dependency !== row.requirementId).sort(),
}));
const drift = driftFindings(
  canonicalDependencyManifest,
  issues,
  linearSnapshot.linearFingerprint,
);
const releaseAssignment: Finding[] = manifest
  .filter(
    (row) =>
      (row.disposition === "executable" ||
        row.requirementId.startsWith("RG:")) &&
      !row.release,
  )
  .map((row) => ({
    code: "release_missing",
    requirementId: row.requirementId,
    message: `${row.requirementId} has no release`,
  }));
const publicationBlockingFindings = publicationIntegrityFindings({
  planningFindings: [
    ...sourceFindings,
    ...dispositionFindings,
    ...duplicateOverrides,
    ...runtimeDependencyFindings,
    ...releasePlanFindings,
    ...duplicateIssueSources,
    ...decisionFindings,
    ...riskFindings,
    ...familyFindings,
    ...releaseFindings,
    ...drift,
    ...releaseAssignment,
  ],
  graphFindings,
  codexReadyFindings: readiness,
  validationFindings,
  operatingFindings,
  journeyFindings: journeyReadinessFindings,
});
const publicationIntegrity = publicationIntegritySummary(
  publicationBlockingFindings,
);
const evidencePasses = (kind: EvidenceKind) => {
  const group = evidenceGroups.find((candidate) => candidate.kind === kind);
  return Boolean(group && evidenceGroupPasses(root, group));
};
const readyIssues = issues.filter((issue) =>
  issue.labels.includes("codex-ready"),
);
const categoryScorecard = calculateScorecard({
  planning: [
    sourceFindings.length +
        dispositionFindings.length +
        duplicateOverrides.length +
        exactFindings.length +
        journeyReadinessFindings.length ===
      0,
    graphFindings.length === 0,
    drift.length +
        releasePlanFindings.length +
        duplicateIssueSources.length +
        familyFindings.length ===
      0,
    readiness.length + readyGraphFindings.length === 0,
  ],
  releases: [
    releaseFindings.length === 0,
    releaseAssignment.length + journeyReadinessFindings.length === 0,
    !graphFindings.some(
      (finding) => finding.code === "cross_release_inversion",
    ),
    releases.length === 6,
  ],
  ownership: [
    readyIssues.length > 0 &&
      readyIssues.every((issue) => Boolean(issue.owner && issue.reviewer)) &&
      operatingFindings.length === 0,
    readyIssues.length > 0 &&
      readyIssues.every((issue) => Boolean(issue.estimate)) &&
      operatingFindings.length === 0,
    decisions.some(
      (decision) =>
        decision.id === "DEC-WIP-001" && decision.status === "active",
    ) && operatingFindings.length === 0,
    evidencePasses("forecast"),
  ],
  validation: [
    releases.length === 6 &&
      releases.every((release) => Boolean(release.customerHypothesis)) &&
      validationFindings.length === 0,
    releases.length === 6 &&
      releases.every((release) => Boolean(release.operationalHypothesis)) &&
      validationFindings.length === 0,
    evidencePasses("customer"),
    evidencePasses("operational"),
  ],
  execution: [
    evidencePasses("tests"),
    evidencePasses("deploy"),
    evidencePasses("rollback"),
    evidencePasses("runtime"),
  ],
});
const scorecard = {
  ...categoryScorecard,
  journeyTargets: resolvedJourneyTargets(validation),
};

const traceability = manifest.map((row) => {
  const issue = row.issueId
    ? issues.find((candidate) => candidate.id === row.issueId)
    : undefined;
  const family = issueFamilyForSource(issues, row.requirementId);
  const executableIssues = family?.executableIssues ?? [];
  return {
    requirementId: row.requirementId,
    source: {
      document: row.sourceDoc,
      version: row.sourceVersion,
      section: row.section,
    },
    disposition: row.disposition,
    issueId: row.issueId,
    release: row.release,
    milestone: issue?.milestone ?? null,
    dependencies: row.dependencies,
    paths: issue?.paths ?? [],
    tests: issue?.tests ?? null,
    rollout: issue?.rollout ?? null,
    rollback: issue?.rollback ?? null,
    telemetry: issue?.telemetry ?? null,
    proof: issue?.proof ?? null,
    executableIssueIds: executableIssues.map((candidate) => candidate.id),
    executableIssues: executableIssues.map((candidate) => ({
      issueId: candidate.id,
      milestone: candidate.milestone,
      dependencies: candidate.dependencies,
      paths: candidate.paths,
      tests: candidate.tests,
      rollout: candidate.rollout,
      rollback: candidate.rollback,
      telemetry: candidate.telemetry,
      proof: candidate.proof,
    })),
  };
});
const edges = manifest
  .flatMap((row) =>
    row.dependencies.map((dependency) => ({
      from: row.requirementId,
      to: dependency,
    })),
  )
  .sort((left, right) =>
    `${left.from}:${left.to}`.localeCompare(`${right.from}:${right.to}`),
  );
const sortFindings = (findings: Finding[]) =>
  [...findings].sort((left, right) =>
    `${left.code}:${left.requirementId ?? ""}:${left.issueId ?? ""}:${left.message}`.localeCompare(
      `${right.code}:${right.requirementId ?? ""}:${right.issueId ?? ""}:${right.message}`,
    ),
  );
const reports = {
  "delivery-manifest.json": {
    liveEvidence: { stamp: stamp.summary, exact: exactEvidence },
    rows: manifest,
  },
  "traceability-map.json": traceability,
  "dependency-graph.json": {
    edges,
    findings: sortFindings(graphFindings),
  },
  "readiness-report.json": {
    findings: sortFindings([
      ...readiness,
      ...readyGraphFindings,
      ...operatingFindings,
    ]),
  },
  "drift-report.json": {
    publicationIntegrity,
    findings: sortFindings([
      ...sourceFindings,
      ...dispositionFindings,
      ...duplicateOverrides,
      ...runtimeDependencyFindings,
      ...exactFindings,
      ...releasePlanFindings,
      ...duplicateIssueSources,
      ...decisionFindings,
      ...riskFindings,
      ...operatingFindings,
      ...validationFindings,
      ...evidenceFindings,
      ...familyFindings,
      ...releaseFindings,
      ...drift,
      ...releaseAssignment,
    ]),
  },
  "release-scorecard.json": scorecard,
  "journey-readiness.json": {
    release: roadmap.release,
    source: roadmap.source,
    mandatoryPhases: roadmap.journey.mandatoryPhases,
    requiredSupport: roadmap.journey.requiredSupport,
    requiredEdges: roadmap.journey.requiredEdges,
    terminalArtifact: roadmap.journey.terminalArtifact,
    optionalLaterPaths: roadmap.journey.optionalLaterPaths,
    checkpoints: roadmap.checkpoints,
    findings: sortFindings(journeyReadinessFindings),
  },
};
mkdirSync(outDir, { recursive: true });
for (const [name, value] of Object.entries(reports)) {
  writeFileSync(resolve(outDir, name), `${JSON.stringify(value, null, 2)}\n`);
}
process.exitCode = publicationIntegrity.passed ? 0 : 1;
