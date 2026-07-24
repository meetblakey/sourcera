#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import {
  closeSync,
  fchmodSync,
  fsyncSync,
  lstatSync,
  openSync,
  readFileSync,
  realpathSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { descriptionFingerprint } from "./lib/fingerprint.js";
import {
  assertLinearPlanningContractFingerprints,
  canonicalLinearFingerprint,
  fetchLinearCapture,
  linearSourceProvenance,
  type LinearCapture,
} from "./lib/linear-live.js";
import {
  assertLinearPlanningSourceFingerprints,
  type LinearProgramScope,
} from "./lib/linear-program-scope.js";
import {
  assertLinearProjectScope,
  type LinearProjectScope,
} from "./lib/linear-project-scope.js";
import {
  assertLinearProvenanceCandidate,
  assertLinearProvenanceCandidateFresh,
  assertLinearProvenanceReceipt,
  buildLinearProvenanceCandidate,
  buildLinearProvenanceReceipt,
  canonicalJson,
  classifyLinearProvenanceUpdateError,
  replaceSourceProvenanceChecksum,
  sameProvenanceChanges,
  sha256Text,
  type CanonicalPlanningDocumentFingerprints,
  type LinearProvenanceChange,
} from "./lib/linear-provenance-reconcile.js";
import type { LinearSourcePolicy } from "./lib/linear-source-policy.js";
import type { SourceRequirement } from "./lib/model.js";
import {
  resolveLinearSourceChecksum,
  verifySourceChecksumContract,
  type ResolvedSourceChecksum,
  type SourceChecksumContract,
} from "./lib/source-checksums.js";
import { parseFeatureInventory } from "./lib/sources.js";

const ENDPOINT = "https://api.linear.app/graphql";
const CANONICAL_PATHS = {
  projectScope: join("delivery", "linear-project-scope.json"),
  programScope: join("delivery", "linear-program-scope.json"),
  sourcePolicy: join("delivery", "linear-source-policy.json"),
  sourceChecksums: join("delivery", "ticket-source-checksums.json"),
  inventory: join("_audit", "FEATURE_INVENTORY.md"),
  master: "Sourcera_Master_Spec.md",
  uxDesign: "UX_Design_of_Sourcera.md",
} as const;

const READ_ISSUE = `
  query DeliveryProvenanceIssue($id: String!) {
    issue(id: $id) {
      id identifier description updatedAt archivedAt
      state { type }
      project { id }
    }
  }
`;

const UPDATE_DESCRIPTION = `
  mutation UpdateDeliveryProvenance($id: String!, $description: String!) {
    issueUpdate(id: $id, input: { description: $description }) {
      success
      issue { id identifier }
    }
  }
`;

interface DirectIssueReadback {
  id: string;
  identifier: string;
  description: string | null;
  updatedAt: string;
  archivedAt: string | null;
  state: { type: string };
  project: { id: string } | null;
}

interface AppliedChange {
  change: LinearProvenanceChange;
  beforeDescription: string;
  expectedDescription: string;
}

const ALLOWED = new Set([
  "--candidate-out",
  "--receipt-out",
  "--candidate",
  "--receipt",
  "--linear-project-scope",
  "--linear-program-scope",
  "--source-policy",
  "--source-checksums",
  "--inventory",
  "--master",
  "--ux-design",
]);

function argumentsByName(start: number): Map<string, string> {
  const values = new Map<string, string>();
  for (let index = start; index < process.argv.length; index += 2) {
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

function repositoryRoot(): string {
  return realpathSync(
    execFileSync("git", ["rev-parse", "--show-toplevel"], {
      cwd: process.cwd(),
      encoding: "utf8",
    }).trim(),
  );
}

function assertRegular(path: string, label: string): void {
  const node = lstatSync(path);
  if (!node.isFile() || node.isSymbolicLink()) {
    throw new Error(`${label} must be a regular file`);
  }
}

function canonicalInput(
  root: string,
  values: Map<string, string>,
  argument: string,
  canonicalPath: string,
): string {
  const path = resolve(values.get(argument) ?? join(root, canonicalPath));
  assertRegular(path, argument);
  if (realpathSync(path) !== realpathSync(join(root, canonicalPath))) {
    throw new Error(`${argument} must use ${canonicalPath}`);
  }
  return path;
}

function assertOutsideRepository(root: string, path: string, label: string): void {
  const relativeParent = relative(root, realpathSync(dirname(path)));
  if (relativeParent === "" || !relativeParent.startsWith("..")) {
    throw new Error(`${label} must remain outside the repository`);
  }
}

function writePrivateExclusive(root: string, path: string, contents: string): void {
  assertOutsideRepository(root, path, "Provenance artifact");
  const descriptor = openSync(path, "wx", 0o600);
  try {
    fchmodSync(descriptor, 0o600);
    writeFileSync(descriptor, contents, "utf8");
    fsyncSync(descriptor);
  } finally {
    closeSync(descriptor);
  }
}

function readPrivateArtifact(root: string, path: string, label: string): string {
  assertRegular(path, label);
  assertOutsideRepository(root, realpathSync(path), label);
  if ((lstatSync(path).mode & 0o077) !== 0) {
    throw new Error(`${label} permissions must be 0600`);
  }
  return readFileSync(path, "utf8");
}

async function graphQL<T>(
  token: string,
  query: string,
  variables: Record<string, string>,
): Promise<T> {
  const response = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "content-type": "application/json", authorization: token },
    body: JSON.stringify({ query, variables }),
  });
  const payload = (await response.json()) as {
    data?: T;
    errors?: Array<{ message: string }>;
  };
  if (!response.ok) throw new Error(`Linear HTTP ${response.status}`);
  if (payload.errors?.length) {
    throw new Error(
      `Linear GraphQL: ${payload.errors.map((error) => error.message).join("; ")}`,
    );
  }
  if (!payload.data) throw new Error("Linear GraphQL returned no data");
  return payload.data;
}

async function readIssue(token: string, linearId: string): Promise<DirectIssueReadback> {
  const data = await graphQL<{ issue: DirectIssueReadback | null }>(
    token,
    READ_ISSUE,
    { id: linearId },
  );
  if (!data.issue) throw new Error(`Linear issue ${linearId} is missing`);
  return data.issue;
}

async function updateDescription(
  token: string,
  linearId: string,
  issueId: string,
  description: string,
): Promise<void> {
  const data = await graphQL<{
    issueUpdate: {
      success: boolean;
      issue: { id: string; identifier: string } | null;
    };
  }>(token, UPDATE_DESCRIPTION, { id: linearId, description });
  if (
    !data.issueUpdate.success ||
    data.issueUpdate.issue?.id !== linearId ||
    data.issueUpdate.issue.identifier !== issueId
  ) {
    throw new Error(`Linear issue ${issueId} update was not acknowledged`);
  }
}

function canonicalDocumentFingerprints(
  masterPath: string,
  uxDesignPath: string,
): CanonicalPlanningDocumentFingerprints {
  return {
    masterSpecSha256: sha256Text(readFileSync(masterPath)),
    uxDesignSha256: sha256Text(readFileSync(uxDesignPath)),
  };
}

function resolvedChecksums(
  root: string,
  capture: LinearCapture,
  projectScope: LinearProjectScope,
  sourcePolicy: LinearSourcePolicy,
  requirements: SourceRequirement[],
  contract: SourceChecksumContract,
): Map<string, ResolvedSourceChecksum> {
  const findings = verifySourceChecksumContract(contract, root);
  if (findings.length) {
    throw new Error(
      findings.map((finding) => `${finding.sourceId}: ${finding.message}`).join("\n"),
    );
  }
  const scopedProjects = new Set(
    assertLinearProjectScope(projectScope, capture.fingerprint.projects),
  );
  const coordination = new Set(sourcePolicy.coordinationIssueIds);
  const requirementById = new Map(
    requirements.map((requirement) => [requirement.requirementId, requirement]),
  );
  if (requirementById.size !== requirements.length) {
    throw new Error("Feature Inventory source IDs are duplicated");
  }
  const resolved = new Map<string, ResolvedSourceChecksum>();
  for (const issue of capture.fingerprint.issues) {
    if (
      issue.archivedAt !== null ||
      issue.stateType === "canceled" ||
      !issue.projectId ||
      !scopedProjects.has(issue.projectId) ||
      coordination.has(issue.identifier)
    ) {
      continue;
    }
    const provenance = issue.sourceProvenance;
    if (
      !provenance?.sourceId ||
      !provenance.sourceDocuments.length ||
      (!provenance.section && provenance.sectionBundleCount === null)
    ) {
      throw new Error(`Active Linear issue ${issue.identifier} lacks exact source provenance`);
    }
    const requirement = requirementById.get(provenance.sourceId) ?? {
      requirementId: provenance.sourceId,
      outcome: issue.title,
      sourceDoc: provenance.sourceDocument ?? provenance.sourceDocuments[0],
      sourceVersion: "live",
      section: provenance.section ?? `bundle:${provenance.sectionBundleCount}`,
      dependencies: [],
      disposition: "proof_only" as const,
    };
    const checksum = resolveLinearSourceChecksum(
      requirement,
      provenance,
      contract,
      root,
      { allowChecksumDrift: true },
    );
    const prior = resolved.get(checksum.sourceId);
    if (prior && JSON.stringify(prior) !== JSON.stringify(checksum)) {
      throw new Error(`${checksum.sourceId} resolves inconsistent source slices`);
    }
    resolved.set(checksum.sourceId, checksum);
  }
  return resolved;
}

function validatedProgram(
  capture: LinearCapture,
  programScope: LinearProgramScope,
  canonicalDocuments: CanonicalPlanningDocumentFingerprints,
): void {
  if (!capture.fingerprint.program) {
    throw new Error("Linear capture lacks program topology");
  }
  assertLinearPlanningContractFingerprints(programScope, capture.fingerprint);
  assertLinearPlanningSourceFingerprints(
    programScope,
    capture.fingerprint.program,
    canonicalDocuments,
  );
}

function assertPreWriteReadback(
  change: LinearProvenanceChange,
  issue: DirectIssueReadback,
): string {
  if (
    issue.id !== change.linearId ||
    issue.identifier !== change.issueId ||
    issue.archivedAt !== null ||
    issue.state.type === "canceled" ||
    issue.project?.id !== change.projectId ||
    issue.updatedAt !== change.updatedAt ||
    descriptionFingerprint(issue.description) !== change.beforeDescriptionFingerprint ||
    typeof issue.description !== "string"
  ) {
    throw new Error(`Linear issue ${change.issueId} changed after dry-run`);
  }
  return issue.description;
}

function assertPostWriteReadback(
  change: LinearProvenanceChange,
  issue: DirectIssueReadback,
  expectedDescription: string,
): void {
  if (
    issue.id !== change.linearId ||
    issue.identifier !== change.issueId ||
    issue.archivedAt !== null ||
    issue.state.type === "canceled" ||
    issue.project?.id !== change.projectId ||
    issue.description !== expectedDescription ||
    descriptionFingerprint(issue.description) !== change.afterDescriptionFingerprint ||
    linearSourceProvenance(issue.description).sourceChecksum !== change.afterChecksum
  ) {
    throw new Error(`Linear issue ${change.issueId} post-write readback failed`);
  }
}

async function rollback(token: string, applied: AppliedChange[]): Promise<string[]> {
  const failures: string[] = [];
  for (const row of [...applied].reverse()) {
    try {
      const current = await readIssue(token, row.change.linearId);
      const state = classifyLinearProvenanceUpdateError(
        row.change,
        current,
        row.beforeDescription,
        row.expectedDescription,
      );
      if (state === "not_committed") continue;
      if (state !== "committed") {
        throw new Error("rollback refused an ambiguous description state");
      }
      await updateDescription(
        token,
        row.change.linearId,
        row.change.issueId,
        row.beforeDescription,
      );
      const readback = await readIssue(token, row.change.linearId);
      if (
        readback.description !== row.beforeDescription ||
        descriptionFingerprint(readback.description) !==
          row.change.beforeDescriptionFingerprint
      ) {
        throw new Error("rollback readback mismatch");
      }
    } catch (error) {
      failures.push(
        `${row.change.issueId}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
  return failures;
}

function inputs(root: string, values: Map<string, string>) {
  const paths = {
    projectScope: canonicalInput(root, values, "--linear-project-scope", CANONICAL_PATHS.projectScope),
    programScope: canonicalInput(root, values, "--linear-program-scope", CANONICAL_PATHS.programScope),
    sourcePolicy: canonicalInput(root, values, "--source-policy", CANONICAL_PATHS.sourcePolicy),
    sourceChecksums: canonicalInput(root, values, "--source-checksums", CANONICAL_PATHS.sourceChecksums),
    inventory: canonicalInput(root, values, "--inventory", CANONICAL_PATHS.inventory),
    master: canonicalInput(root, values, "--master", CANONICAL_PATHS.master),
    uxDesign: canonicalInput(root, values, "--ux-design", CANONICAL_PATHS.uxDesign),
  };
  const json = {
    projectScope: readFileSync(paths.projectScope, "utf8"),
    programScope: readFileSync(paths.programScope, "utf8"),
    sourcePolicy: readFileSync(paths.sourcePolicy, "utf8"),
    sourceChecksums: readFileSync(paths.sourceChecksums, "utf8"),
    inventory: readFileSync(paths.inventory, "utf8"),
  };
  return {
    paths,
    json,
    projectScope: JSON.parse(json.projectScope) as LinearProjectScope,
    programScope: JSON.parse(json.programScope) as LinearProgramScope,
    sourcePolicy: JSON.parse(json.sourcePolicy) as LinearSourcePolicy,
    sourceChecksums: JSON.parse(json.sourceChecksums) as SourceChecksumContract,
    requirements: parseFeatureInventory(json.inventory),
    canonicalDocuments: canonicalDocumentFingerprints(paths.master, paths.uxDesign),
  };
}

async function dryRun(
  root: string,
  values: Map<string, string>,
  token: string,
): Promise<void> {
  const candidateOut = required(values, "--candidate-out");
  const receiptOut = required(values, "--receipt-out");
  if (candidateOut === receiptOut) {
    throw new Error("Candidate and receipt outputs must be distinct");
  }
  assertOutsideRepository(root, candidateOut, "--candidate-out");
  assertOutsideRepository(root, receiptOut, "--receipt-out");
  const source = inputs(root, values);
  const capture = await fetchLinearCapture(
    fetch,
    token,
    source.projectScope,
    source.programScope,
  );
  validatedProgram(capture, source.programScope, source.canonicalDocuments);
  const checksums = resolvedChecksums(
    root,
    capture,
    source.projectScope,
    source.sourcePolicy,
    source.requirements,
    source.sourceChecksums,
  );
  const candidate = buildLinearProvenanceCandidate(
    capture,
    source.projectScope,
    source.sourcePolicy,
    checksums,
    sha256Text(source.json.sourceChecksums),
    source.canonicalDocuments,
    new Date().toISOString(),
  );
  const candidateJson = canonicalJson(candidate);
  const receipt = buildLinearProvenanceReceipt({
    candidateJson,
    projectScopeJson: source.json.projectScope,
    programScopeJson: source.json.programScope,
    sourcePolicyJson: source.json.sourcePolicy,
    sourceChecksumContractJson: source.json.sourceChecksums,
    candidate,
  });
  writePrivateExclusive(root, candidateOut, candidateJson);
  writePrivateExclusive(root, receiptOut, canonicalJson(receipt));
  process.stdout.write(
    `${JSON.stringify({
      status: "dry-run",
      changes: candidate.changes.length,
      manifest: candidate.changes.map((change) => ({
        issueId: change.issueId,
        sourceId: change.sourceId,
        sourceDocument: change.sourceDocument,
        sourceSection: change.sourceSection,
        sourceSlices: change.sourceSlices,
        oldChecksum: change.beforeChecksum,
        newChecksum: change.afterChecksum,
      })),
      candidateFingerprintSha256: candidate.changeSetFingerprintSha256,
      expiresAt: candidate.expiresAt,
    })}\n`,
  );
}

async function applyCandidate(
  root: string,
  values: Map<string, string>,
  token: string,
): Promise<void> {
  const candidatePath = required(values, "--candidate");
  const receiptPath = required(values, "--receipt");
  if (realpathSync(candidatePath) === realpathSync(receiptPath)) {
    throw new Error("Candidate and receipt inputs must be distinct");
  }
  const source = inputs(root, values);
  const candidateJson = readPrivateArtifact(root, candidatePath, "--candidate");
  const receiptJson = readPrivateArtifact(root, receiptPath, "--receipt");
  const candidate = assertLinearProvenanceCandidate(JSON.parse(candidateJson));
  assertLinearProvenanceReceipt(JSON.parse(receiptJson), {
    candidateJson,
    projectScopeJson: source.json.projectScope,
    programScopeJson: source.json.programScope,
    sourcePolicyJson: source.json.sourcePolicy,
    sourceChecksumContractJson: source.json.sourceChecksums,
    candidate,
  });
  assertLinearProvenanceCandidateFresh(candidate);
  if (
    JSON.stringify(candidate.canonicalDocuments) !==
      JSON.stringify(source.canonicalDocuments)
  ) {
    throw new Error("Canonical source documents changed after dry-run");
  }
  const capture = await fetchLinearCapture(
    fetch,
    token,
    source.projectScope,
    source.programScope,
  );
  validatedProgram(capture, source.programScope, source.canonicalDocuments);
  const checksums = resolvedChecksums(
    root,
    capture,
    source.projectScope,
    source.sourcePolicy,
    source.requirements,
    source.sourceChecksums,
  );
  const current = buildLinearProvenanceCandidate(
    capture,
    source.projectScope,
    source.sourcePolicy,
    checksums,
    sha256Text(source.json.sourceChecksums),
    source.canonicalDocuments,
    candidate.createdAt,
  );
  if (!sameProvenanceChanges(candidate, current)) {
    throw new Error("Live provenance changed after dry-run; create a new candidate");
  }

  const applied: AppliedChange[] = [];
  try {
    for (const change of candidate.changes) {
      const beforeDescription = assertPreWriteReadback(
        change,
        await readIssue(token, change.linearId),
      );
      const expected = checksums.get(change.sourceId);
      if (!expected) throw new Error(`${change.sourceId} checksum disappeared`);
      const replacement = replaceSourceProvenanceChecksum(
        change.issueId,
        beforeDescription,
        expected,
      );
      if (
        replacement.beforeChecksum !== change.beforeChecksum ||
        descriptionFingerprint(replacement.description) !==
          change.afterDescriptionFingerprint
      ) {
        throw new Error(`Linear issue ${change.issueId} candidate no longer matches`);
      }
      try {
        await updateDescription(
          token,
          change.linearId,
          change.issueId,
          replacement.description,
        );
      } catch (updateError) {
        try {
          const readback = await readIssue(token, change.linearId);
          const state = classifyLinearProvenanceUpdateError(
            change,
            readback,
            beforeDescription,
            replacement.description,
          );
          if (state === "committed") {
            applied.push({
              change,
              beforeDescription,
              expectedDescription: replacement.description,
            });
          } else if (state === "ambiguous") {
            throw new Error(
              `Linear issue ${change.issueId} update error left an ambiguous readback`,
            );
          }
        } catch (readbackError) {
          if (
            readbackError instanceof Error &&
            readbackError.message.includes("ambiguous readback")
          ) {
            throw readbackError;
          }
          applied.push({
            change,
            beforeDescription,
            expectedDescription: replacement.description,
          });
          throw new Error(
            `Linear issue ${change.issueId} update error could not be classified: ${
              readbackError instanceof Error
                ? readbackError.message
                : String(readbackError)
            }`,
          );
        }
        throw updateError;
      }
      applied.push({
        change,
        beforeDescription,
        expectedDescription: replacement.description,
      });
      assertPostWriteReadback(
        change,
        await readIssue(token, change.linearId),
        replacement.description,
      );
    }
    const postWrite = await fetchLinearCapture(
      fetch,
      token,
      source.projectScope,
      source.programScope,
    );
    validatedProgram(postWrite, source.programScope, source.canonicalDocuments);
    const postChecksums = resolvedChecksums(
      root,
      postWrite,
      source.projectScope,
      source.sourcePolicy,
      source.requirements,
      source.sourceChecksums,
    );
    const remaining = buildLinearProvenanceCandidate(
      postWrite,
      source.projectScope,
      source.sourcePolicy,
      postChecksums,
      sha256Text(source.json.sourceChecksums),
      source.canonicalDocuments,
      new Date().toISOString(),
    );
    if (remaining.changes.length) {
      throw new Error(
        `Post-write capture still has stale provenance: ${remaining.changes
          .map((change) => change.issueId)
          .join(", ")}`,
      );
    }
    process.stdout.write(
      `${JSON.stringify({
        status: "applied",
        changes: applied.length,
        issueIds: applied.map((row) => row.change.issueId),
        postWriteFingerprintSha256: sha256Text(
          canonicalJson(canonicalLinearFingerprint(postWrite.fingerprint)),
        ),
      })}\n`,
    );
  } catch (error) {
    const failures = await rollback(token, applied);
    const reason = error instanceof Error ? error.message : String(error);
    if (failures.length) {
      throw new Error(`${reason}; rollback failed for ${failures.join("; ")}`);
    }
    throw new Error(`${reason}; ${applied.length} update(s) rolled back`);
  }
}

async function main(): Promise<void> {
  const mode = process.argv[2];
  if (mode !== "dry-run" && mode !== "apply") {
    throw new Error("Mode must be dry-run or apply");
  }
  const token = process.env.LINEAR_API_KEY?.trim();
  if (!token) throw new Error("LINEAR_API_KEY is required");
  const root = repositoryRoot();
  const values = argumentsByName(3);
  if (mode === "dry-run") await dryRun(root, values, token);
  else await applyCandidate(root, values, token);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
