#!/usr/bin/env node
import { createHash, randomUUID } from "node:crypto";
import { execFileSync } from "node:child_process";
import {
  closeSync,
  fchmodSync,
  fsyncSync,
  lstatSync,
  openSync,
  readFileSync,
  realpathSync,
  renameSync,
  statSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { basename, dirname, join, relative, resolve } from "node:path";
import {
  assertLinearCandidateReceipt,
  exactLinearRunSource,
  type LinearRunSource,
  sha256,
} from "./lib/linear-candidate-receipt.js";
import {
  assertFreshLinearCapture,
  assertLinearPromotionHead,
  canonicalLinearRunSource,
} from "./lib/linear-promotion.js";
import {
  applyLinearDispositions,
  parseLinearDispositions,
} from "./lib/linear-dispositions.js";
import {
  deriveLinearPlanningIssues,
  parseLinearRuntimeInventory,
  type LinearSourcePolicy,
  type SourceDerivedSnapshotIssue,
} from "./lib/linear-source-policy.js";
import {
  linearCandidateFindings,
  type LinearSnapshotCandidate,
} from "./lib/linear-candidate.js";
import {
  assertLinearPlanningContractFingerprints,
  assertLinearPlanningDescriptionFingerprints,
  type LinearFingerprint,
} from "./lib/linear-live.js";
import {
  assertLinearPlanningSourceFingerprints,
  assertLinearProgramScope,
  type LinearProgramScope,
} from "./lib/linear-program-scope.js";
import {
  assertLinearProjectScope,
  type LinearProjectScope,
} from "./lib/linear-project-scope.js";
import type { ReleaseDefinition } from "./lib/model.js";
import { parseFeatureInventory } from "./lib/sources.js";
import type { SourceChecksumContract } from "./lib/source-checksums.js";
import {
  assertBoundTicketIntegrityReport,
  type BoundTicketIntegrityReport,
} from "./lib/ticket-integrity.js";

interface CaptureReceipt {
  schemaVersion: 1;
  capturedAt: string;
  fingerprintSha256: string;
  source: LinearRunSource;
}

interface PromotableCandidate extends LinearSnapshotCandidate {
  generatedAt: string;
  linearCapture: CaptureReceipt;
  linearFingerprint: LinearFingerprint;
  linearTicketIntegrity: BoundTicketIntegrityReport;
  issues: Array<LinearSnapshotCandidate["issues"][number] & {
    sourceFamilyId?: string | null;
    kind?: string;
    parentId?: string | null;
    title?: string;
    labels?: string[];
    owner?: string | null;
    estimate?: number | null;
  }>;
}

const ALLOWED = new Set([
  "--snapshot",
  "--candidate",
  "--fingerprint",
  "--capture-receipt",
  "--ticket-integrity",
  "--candidate-receipt",
  "--linear-project-scope",
  "--linear-program-scope",
  "--source-policy",
  "--inventory",
  "--source-checksums",
  "--dispositions",
  "--stamp",
  "--runtime-dependencies",
  "--releases",
]);

function argumentsByName(): Map<string, string> {
  const values = new Map<string, string>();
  for (let index = 2; index < process.argv.length; index += 2) {
    const name = process.argv[index];
    const value = process.argv[index + 1];
    if (!name || !ALLOWED.has(name) || !value || value.startsWith("--")) {
      throw new Error(`Invalid argument near ${name ?? "end"}`);
    }
    if (values.has(name)) throw new Error(`Duplicate argument ${name}`);
    values.set(name, value);
  }
  return values;
}

function required(values: Map<string, string>, name: string): string {
  const value = values.get(name)?.trim();
  if (!value) throw new Error(`${name} is required`);
  return resolve(value);
}

function assertRegular(path: string, label: string): void {
  const node = lstatSync(path);
  if (!node.isFile() || node.isSymbolicLink()) {
    throw new Error(`${label} must be a regular file`);
  }
}

function assertGeneratedPlanning(
  candidate: PromotableCandidate,
  baselineIssues: SourceDerivedSnapshotIssue[],
  sourcePolicy: LinearSourcePolicy,
  projectScope: LinearProjectScope,
  programScope: LinearProgramScope,
  inventoryJson: string,
  repositoryRoot: string,
  sourceChecksumContract: SourceChecksumContract,
  dispositionsJson: string,
  runtimeStampJson: string,
  runtimeDependencyContractJson: string,
): void {
  const scopedProjects = new Set(
    assertLinearProjectScope(projectScope, candidate.linearFingerprint.projects),
  );
  const sourceRequirements = [
    ...parseFeatureInventory(inventoryJson),
    ...parseLinearRuntimeInventory(
      runtimeStampJson,
      runtimeDependencyContractJson,
    ),
  ];
  const sourceDerived = deriveLinearPlanningIssues(
    baselineIssues,
    candidate.linearFingerprint.issues,
    scopedProjects,
    sourcePolicy,
    applyLinearDispositions(
      sourceRequirements,
      parseLinearDispositions(JSON.parse(dispositionsJson), sourceRequirements),
    ),
    repositoryRoot,
    sourceChecksumContract,
    programScope,
  );
  const derivedById = new Map(sourceDerived.map((issue) => [issue.id, issue]));
  const liveById = new Map(
    candidate.linearFingerprint.issues.map((issue) => [issue.identifier, issue]),
  );
  const plannedById = new Map(candidate.issues.map((issue) => [issue.id, issue]));
  if (plannedById.size !== candidate.issues.length) {
    throw new Error("Linear candidate issue inventory is duplicated");
  }
  for (const live of candidate.linearFingerprint.issues) {
    if (
      live.archivedAt === null &&
      live.stateType !== "canceled" &&
      live.projectId !== null &&
      scopedProjects.has(live.projectId) &&
      !plannedById.has(live.identifier)
    ) {
      throw new Error(`Scoped live issue ${live.identifier} is absent from candidate`);
    }
  }
  const sourceByIssue = new Map(
    candidate.issues.flatMap((issue) =>
      issue.sourceFamilyId ?? issue.sourceId
        ? [[issue.id, (issue.sourceFamilyId ?? issue.sourceId)!] as const]
        : [],
    ),
  );
  for (const planned of candidate.issues) {
    const live = liveById.get(planned.id);
    if (!live) throw new Error(`Candidate issue ${planned.id} lacks live readback`);
    const executable = planned.kind === "executable" || planned.kind === "proof_only";
    if (
      executable &&
      (live.releases.length !== 1 || !/^R[0-5]$/.test(live.releases[0] ?? ""))
    ) {
      throw new Error(
        `Executable candidate issue ${planned.id} must have exactly one canonical release`,
      );
    }
    if (
      planned.release !== (live.releases[0] ?? null) ||
      planned.milestone !== live.milestone ||
      planned.parentId !== live.parent ||
      planned.title !== live.title ||
      JSON.stringify(planned.labels) !== JSON.stringify(live.labels) ||
      planned.owner !== live.assignee ||
      planned.estimate !== live.estimate
    ) {
      throw new Error(`Candidate issue ${planned.id} planning fields are not live-derived`);
    }
    const expectedDependencies = live.relations
      .flatMap((relation) => {
        const [type, prerequisite, dependent] = relation.split(":");
        if (type !== "blocks" || dependent !== planned.id) return [];
        const source = sourceByIssue.get(prerequisite);
        const dependentSource = sourceByIssue.get(planned.id);
        return source && source !== dependentSource ? [source] : [];
      })
      .sort();
    if (
      JSON.stringify([...new Set(planned.dependencies)].sort()) !==
      JSON.stringify([...new Set(expectedDependencies)])
    ) {
      throw new Error(
        `Candidate issue ${planned.id} dependencies are not native-relation-derived`,
      );
    }
    const derived = derivedById.get(planned.id);
    if (
      !derived ||
      planned.sourceId !== derived.sourceId ||
      (planned.sourceFamilyId ?? planned.sourceId) !== derived.sourceFamilyId ||
      planned.kind !== derived.kind
    ) {
      throw new Error(`Candidate issue ${planned.id} source ownership is not live-derived`);
    }
  }
  for (const issueId of sourcePolicy.coordinationIssueIds) {
    const issue = plannedById.get(issueId);
    if (!issue || issue.kind !== "parent" || issue.sourceId !== null) {
      throw new Error(`Coordination issue ${issueId} became executable`);
    }
  }
}

export function atomicReplace(path: string, contents: string): void {
  const temporary = join(dirname(path), `.${randomUUID()}.tmp`);
  let descriptor: number | null = null;
  try {
    descriptor = openSync(temporary, "wx", 0o600);
    fchmodSync(descriptor, statSync(path).mode & 0o777);
    writeFileSync(descriptor, contents, "utf8");
    fsyncSync(descriptor);
    closeSync(descriptor);
    descriptor = null;
    renameSync(temporary, path);
  } finally {
    if (descriptor !== null) closeSync(descriptor);
    try {
      unlinkSync(temporary);
    } catch {
      // Rename or an earlier failure may have removed the temporary file.
    }
  }
}

export function main(): void {
  const values = argumentsByName();
  const paths = {
    snapshot: required(values, "--snapshot"),
    candidate: required(values, "--candidate"),
    fingerprint: required(values, "--fingerprint"),
    captureReceipt: required(values, "--capture-receipt"),
    ticketIntegrity: required(values, "--ticket-integrity"),
    candidateReceipt: required(values, "--candidate-receipt"),
    projectScope: required(values, "--linear-project-scope"),
    programScope: required(values, "--linear-program-scope"),
    sourcePolicy: required(values, "--source-policy"),
    inventory: required(values, "--inventory"),
    sourceChecksums: required(values, "--source-checksums"),
    dispositions: required(values, "--dispositions"),
    runtimeStamp: required(values, "--stamp"),
    runtimeDependencies: required(values, "--runtime-dependencies"),
    releases: required(values, "--releases"),
  };
  for (const [label, path] of Object.entries(paths)) assertRegular(path, label);
  const repositoryRoot = realpathSync(
    execFileSync("git", ["rev-parse", "--show-toplevel"], {
      cwd: process.cwd(),
      encoding: "utf8",
    }).trim(),
  );
  const canonicalSnapshot = realpathSync(paths.snapshot);
  if (
    relative(repositoryRoot, canonicalSnapshot) !==
    join("delivery", "linear-snapshot.json")
  ) {
    throw new Error("Promotion target must be delivery/linear-snapshot.json");
  }
  for (const path of [paths.candidate, paths.candidateReceipt]) {
    const relativePath = relative(repositoryRoot, realpathSync(path));
    if (relativePath === "" || !relativePath.startsWith("..")) {
      throw new Error("Candidate artifacts must remain outside the repository");
    }
  }

  const source = canonicalLinearRunSource();
  assertLinearPromotionHead(
    source,
    execFileSync("git", ["rev-parse", "HEAD"], {
      cwd: repositoryRoot,
      encoding: "utf8",
    }),
  );
  const snapshotJson = readFileSync(paths.snapshot, "utf8");
  const candidateJson = readFileSync(paths.candidate, "utf8");
  const fingerprintJson = readFileSync(paths.fingerprint, "utf8");
  const captureReceiptJson = readFileSync(paths.captureReceipt, "utf8");
  const ticketIntegrityJson = readFileSync(paths.ticketIntegrity, "utf8");
  const projectScopeJson = readFileSync(paths.projectScope, "utf8");
  const programScopeJson = readFileSync(paths.programScope, "utf8");
  const sourcePolicyJson = readFileSync(paths.sourcePolicy, "utf8");
  const inventoryJson = readFileSync(paths.inventory, "utf8");
  const sourceChecksumContractJson = readFileSync(
    paths.sourceChecksums,
    "utf8",
  );
  const dispositionsJson = readFileSync(paths.dispositions, "utf8");
  const runtimeStampJson = readFileSync(paths.runtimeStamp, "utf8");
  const runtimeDependencyContractJson = readFileSync(
    paths.runtimeDependencies,
    "utf8",
  );
  const releaseDefinitionsJson = readFileSync(paths.releases, "utf8");
  const captureReceipt = JSON.parse(captureReceiptJson) as CaptureReceipt;
  if (
    captureReceipt.schemaVersion !== 1 ||
    captureReceipt.fingerprintSha256 !== sha256(fingerprintJson) ||
    !exactLinearRunSource(captureReceipt.source, source)
  ) {
    throw new Error("Linear capture receipt is invalid for this promotion run");
  }
  assertFreshLinearCapture(captureReceipt.capturedAt);
  assertLinearCandidateReceipt(
    JSON.parse(readFileSync(paths.candidateReceipt, "utf8")),
    {
      candidateJson,
      baselineSnapshotJson: snapshotJson,
      fingerprintJson,
      captureReceiptJson,
      ticketIntegrityJson,
      projectScopeJson,
      programScopeJson,
      sourcePolicyJson,
      inventoryJson,
      sourceChecksumContractJson,
      dispositionsJson,
      runtimeStampJson,
      runtimeDependencyContractJson,
      releaseDefinitionsJson,
      createdAt: captureReceipt.capturedAt,
      source,
    },
  );
  const candidate = JSON.parse(candidateJson) as PromotableCandidate;
  const fingerprint = JSON.parse(fingerprintJson) as LinearFingerprint;
  const ticketIntegrity = assertBoundTicketIntegrityReport(
    JSON.parse(ticketIntegrityJson),
    fingerprintJson,
    candidate.issues.length,
  );
  if (
    candidate.generatedAt !== captureReceipt.capturedAt ||
    JSON.stringify(candidate.linearCapture) !== JSON.stringify(captureReceipt) ||
    JSON.stringify(candidate.linearFingerprint) !== JSON.stringify(fingerprint) ||
    JSON.stringify(candidate.linearTicketIntegrity) !==
      JSON.stringify(ticketIntegrity)
  ) {
    throw new Error("Linear candidate is not bound to its captured readback");
  }
  const programScope = JSON.parse(programScopeJson) as LinearProgramScope;
  if (!candidate.linearFingerprint.program) {
    throw new Error("Linear candidate lacks program topology");
  }
  assertLinearProgramScope(programScope, candidate.linearFingerprint.program);
  assertLinearPlanningDescriptionFingerprints(candidate.linearFingerprint);
  assertLinearPlanningContractFingerprints(
    programScope,
    candidate.linearFingerprint,
  );
  assertLinearPlanningSourceFingerprints(
    programScope,
    candidate.linearFingerprint.program,
    {
      masterSpecSha256: createHash("sha256")
        .update(readFileSync(join(repositoryRoot, "Sourcera_Master_Spec.md")))
        .digest("hex"),
      uxDesignSha256: createHash("sha256")
        .update(readFileSync(join(repositoryRoot, "UX_Design_of_Sourcera.md")))
        .digest("hex"),
    },
  );
  const baseline = JSON.parse(snapshotJson) as {
    issues: SourceDerivedSnapshotIssue[];
  };
  const sourcePolicy = JSON.parse(sourcePolicyJson) as LinearSourcePolicy;
  assertGeneratedPlanning(
    candidate,
    baseline.issues,
    sourcePolicy,
    JSON.parse(projectScopeJson) as LinearProjectScope,
    JSON.parse(programScopeJson) as LinearProgramScope,
    inventoryJson,
    repositoryRoot,
    JSON.parse(sourceChecksumContractJson) as SourceChecksumContract,
    dispositionsJson,
    runtimeStampJson,
    runtimeDependencyContractJson,
  );
  const releaseDocument = JSON.parse(releaseDefinitionsJson) as {
    releases?: ReleaseDefinition[];
  };
  const findings = linearCandidateFindings(
    candidate,
    releaseDocument.releases ?? [],
  );
  if (findings.length) {
    throw new Error(
      findings.map((finding) => `${finding.code}: ${finding.message}`).join("\n"),
    );
  }
  atomicReplace(paths.snapshot, candidateJson);
  process.stdout.write(
    `${JSON.stringify({ status: "promoted", snapshot: paths.snapshot, sha256: sha256(candidateJson) })}\n`,
  );
}

if (require.main === module) {
  try {
    main();
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
