#!/usr/bin/env node
import { createHash, randomUUID } from "node:crypto";
import {
  chmodSync,
  existsSync,
  linkSync,
  lstatSync,
  readFileSync,
  realpathSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { basename, dirname, join, resolve } from "node:path";
import {
  assertLinearNativeIdentityMatchesFingerprint,
  assertLinearPlanningContractFingerprints,
  assertLinearRawDocumentsMatchNativeIdentity,
  canonicalLinearFingerprint,
  committedLinearDriftDiff,
  fetchConsistentLinearCapture,
  type LinearFingerprint,
  type LinearNativeIdentityCapture,
  type LinearRawDocumentCapture,
} from "./lib/linear-live.js";
import type { LinearIssueDescriptionCapture } from "./lib/ticket-integrity.js";
import {
  assertLinearProjectScope,
  type LinearProjectScope,
} from "./lib/linear-project-scope.js";
import {
  assertLinearProgramScope,
  type LinearProgramScope,
} from "./lib/linear-program-scope.js";

const KNOWN_ARGUMENTS = new Set([
  "--accepted-fingerprint",
  "--descriptions-out",
  "--documents-out",
  "--fixture",
  "--linear-program-scope",
  "--linear-project-scope",
  "--native-identity-out",
  "--out",
  "--receipt-out",
  "--snapshot",
]);

function parseArguments(args: string[]): Map<string, string> {
  const parsed = new Map<string, string>();
  for (let index = 0; index < args.length; index += 2) {
    const name = args[index];
    const value = args[index + 1];
    if (!name?.startsWith("--") || !value) {
      throw new Error(`Invalid argument near ${name ?? "end of command"}`);
    }
    if (!KNOWN_ARGUMENTS.has(name)) {
      throw new Error(`Unknown argument ${name}`);
    }
    if (parsed.has(name)) {
      throw new Error(`Duplicate argument ${name}`);
    }
    parsed.set(name, value);
  }
  return parsed;
}

function pathEntryExists(path: string): boolean {
  try {
    lstatSync(path);
    return true;
  } catch (error: unknown) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return false;
    throw error;
  }
}

function canonicalOutputPath(path: string): string {
  const absolute = resolve(path);
  return join(realpathSync(dirname(absolute)), basename(absolute));
}

type EnhancedCapturePaths = {
  acceptedFingerprintPath: string;
  descriptionsOutPath: string;
  documentsOutPath: string;
  fixturePath?: string;
  nativeIdentityOutPath: string;
  outPath: string;
  programScopePath?: string;
  projectScopePath: string;
  receiptOutPath: string;
  snapshotPath?: string;
};

function canonicalEnhancedCapturePaths(
  paths: EnhancedCapturePaths,
): EnhancedCapturePaths {
  const inputs = [
    ["project scope", paths.projectScopePath],
    ["program scope", paths.programScopePath],
    ["fixture", paths.fixturePath],
    ["accepted fingerprint", paths.acceptedFingerprintPath],
    ["snapshot", paths.snapshotPath],
  ] as const;
  const outputs = [
    ["fingerprint", paths.outPath],
    ["native identity", paths.nativeIdentityOutPath],
    ["documents", paths.documentsOutPath],
    ["issue descriptions", paths.descriptionsOutPath],
    ["receipt", paths.receiptOutPath],
  ] as const;
  const canonicalInputs = new Map<string, string>();
  for (const [name, path] of inputs) {
    if (path) canonicalInputs.set(name, realpathSync(resolve(path)));
  }
  const canonicalOutputs = new Map<string, string>();
  for (const [name, path] of outputs) {
    if (!path) continue;
    const canonical = canonicalOutputPath(path);
    if (pathEntryExists(canonical)) {
      throw new Error(`Enhanced capture output already exists: ${name}`);
    }
    canonicalOutputs.set(name, canonical);
  }
  const seen = new Map<string, string>();
  for (const [name, path] of [
    ...canonicalInputs.entries(),
    ...canonicalOutputs.entries(),
  ]) {
    const prior = seen.get(path);
    if (prior) {
      throw new Error(
        `Enhanced capture paths must be distinct: ${prior} and ${name}`,
      );
    }
    seen.set(path, name);
  }
  return {
    acceptedFingerprintPath: canonicalInputs.get("accepted fingerprint")!,
    descriptionsOutPath: canonicalOutputs.get("issue descriptions")!,
    documentsOutPath: canonicalOutputs.get("documents")!,
    fixturePath: canonicalInputs.get("fixture"),
    nativeIdentityOutPath: canonicalOutputs.get("native identity")!,
    outPath: canonicalOutputs.get("fingerprint")!,
    programScopePath: canonicalInputs.get("program scope"),
    projectScopePath: canonicalInputs.get("project scope")!,
    receiptOutPath: canonicalOutputs.get("receipt")!,
    snapshotPath: canonicalInputs.get("snapshot"),
  };
}

type AtomicArtifact = { path: string; value: string };

function writeAtomicArtifact(path: string, value: string): string {
  const temporaryPath = join(
    dirname(path),
    `.${basename(path)}.linear-capture-${process.pid}-${randomUUID()}.tmp`,
  );
  let published = false;
  try {
    writeFileSync(temporaryPath, value, {
      encoding: "utf8",
      flag: "wx",
      mode: 0o600,
    });
    chmodSync(temporaryPath, 0o600);
    linkSync(temporaryPath, path);
    published = true;
    unlinkSync(temporaryPath);
    return path;
  } catch (error: unknown) {
    for (const cleanupPath of published ? [path, temporaryPath] : [temporaryPath]) {
      try {
        unlinkSync(cleanupPath);
      } catch {
        // Preserve the original write failure.
      }
    }
    throw error;
  }
}

function writeEnhancedCaptureArtifacts(
  artifacts: AtomicArtifact[],
  receipt: AtomicArtifact,
): void {
  const published: string[] = [];
  try {
    for (const artifact of [...artifacts, receipt]) {
      published.push(writeAtomicArtifact(artifact.path, artifact.value));
    }
  } catch (error: unknown) {
    for (const path of published.reverse()) {
      try {
        unlinkSync(path);
      } catch {
        // Preserve the original write failure.
      }
    }
    throw error;
  }
}

async function main(): Promise<void> {
  const argv = parseArguments(process.argv.slice(2));
  let outPath = argv.get("--out");
  let receiptOutPath = argv.get("--receipt-out");
  let nativeIdentityOutPath = argv.get("--native-identity-out");
  let documentsOutPath = argv.get("--documents-out");
  let acceptedFingerprintPath = argv.get("--accepted-fingerprint");
  let descriptionsOutPath = argv.get("--descriptions-out");
  const enhanced = Boolean(
    nativeIdentityOutPath || documentsOutPath || acceptedFingerprintPath,
  );
  if (
    enhanced &&
    [
      outPath,
      nativeIdentityOutPath,
      documentsOutPath,
      descriptionsOutPath,
      receiptOutPath,
      acceptedFingerprintPath,
    ].some((value) => !value)
  ) {
    throw new Error(
      "A complete enhanced capture set requires --out, --descriptions-out, --native-identity-out, --documents-out, --receipt-out, and --accepted-fingerprint",
    );
  }
  if (receiptOutPath && !outPath) {
    throw new Error("--receipt-out requires --out");
  }
  let projectScopePath = resolve(
    argv.get("--linear-project-scope") ??
      "delivery/linear-project-scope.json",
  );
  let programScopePath = resolve(
    argv.get("--linear-program-scope") ??
      join(dirname(projectScopePath), "linear-program-scope.json"),
  );
  let fixturePath = argv.get("--fixture")
    ? resolve(argv.get("--fixture")!)
    : undefined;
  let snapshotInputPath = argv.get("--snapshot")
    ? resolve(argv.get("--snapshot")!)
    : undefined;
  const programScopeExists = existsSync(programScopePath);
  if (enhanced && !fixturePath && !programScopeExists) {
    throw new Error(
      "Live enhanced capture requires an independent Linear program scope",
    );
  }
  if (enhanced) {
    const paths = canonicalEnhancedCapturePaths({
      acceptedFingerprintPath: acceptedFingerprintPath!,
      descriptionsOutPath: descriptionsOutPath!,
      documentsOutPath: documentsOutPath!,
      fixturePath,
      nativeIdentityOutPath: nativeIdentityOutPath!,
      outPath: outPath!,
      programScopePath: programScopeExists || argv.has("--linear-program-scope")
        ? programScopePath
        : undefined,
      projectScopePath,
      receiptOutPath: receiptOutPath!,
      snapshotPath: snapshotInputPath,
    });
    acceptedFingerprintPath = paths.acceptedFingerprintPath;
    descriptionsOutPath = paths.descriptionsOutPath;
    documentsOutPath = paths.documentsOutPath;
    fixturePath = paths.fixturePath;
    nativeIdentityOutPath = paths.nativeIdentityOutPath;
    outPath = paths.outPath;
    programScopePath = paths.programScopePath ?? programScopePath;
    projectScopePath = paths.projectScopePath;
    receiptOutPath = paths.receiptOutPath;
    snapshotInputPath = paths.snapshotPath;
  }
  const projectScope = JSON.parse(
    readFileSync(projectScopePath, "utf8"),
  ) as LinearProjectScope;
  const programScope = programScopeExists
    ? JSON.parse(readFileSync(programScopePath, "utf8")) as LinearProgramScope
    : undefined;
  const fixture = fixturePath
    ? JSON.parse(readFileSync(fixturePath, "utf8")) as
      | LinearFingerprint
      | {
          fingerprint: LinearFingerprint;
          issueDescriptions: LinearIssueDescriptionCapture[];
          nativeIdentity?: LinearNativeIdentityCapture;
          documents?: LinearRawDocumentCapture;
        }
    : null;
  const liveCapture = fixture
    ? null
    : await fetchConsistentLinearCapture(
        fetch,
        process.env.LINEAR_API_KEY ?? "",
        projectScope,
        programScope,
        { nativeIdentity: enhanced },
      );
  const captured = fixture
    ? ("fingerprint" in fixture ? fixture.fingerprint : fixture)
    : liveCapture!.fingerprint;
  const issueDescriptions = fixture && "fingerprint" in fixture
    ? fixture.issueDescriptions
    : liveCapture?.issueDescriptions ?? null;
  const nativeIdentity = fixture && "fingerprint" in fixture
    ? fixture.nativeIdentity ?? null
    : liveCapture?.nativeIdentity ?? null;
  const documents = fixture && "fingerprint" in fixture
    ? fixture.documents ?? null
    : liveCapture?.documents ?? null;
  const captureMode = fixturePath ? "fixture" : "live";
  const actual = canonicalLinearFingerprint(captured);
  assertLinearProjectScope(projectScope, actual.projects);
  if (programScope) {
    if (!actual.program) throw new Error("Linear fingerprint lacks program topology");
    assertLinearPlanningContractFingerprints(programScope, actual);
  }

  const fingerprintJson = `${JSON.stringify(actual, null, 2)}\n`;
  let nativeIdentityJson: string | null = null;
  let documentsJson: string | null = null;
  let acceptedFingerprintSha256: string | null = null;
  if (acceptedFingerprintPath) {
    const acceptedFingerprintJson = readFileSync(
      resolve(acceptedFingerprintPath),
      "utf8",
    );
    if (acceptedFingerprintJson !== fingerprintJson) {
      throw new Error(
        "The accepted Linear fingerprint differs from the enhanced capture",
      );
    }
    acceptedFingerprintSha256 = createHash("sha256")
      .update(acceptedFingerprintJson)
      .digest("hex");
  }
  const environmentValue = (name: string): string | null =>
    process.env[name]?.trim() || null;
  const source = {
    repository: environmentValue("GITHUB_REPOSITORY"),
    commit: environmentValue("GITHUB_SHA"),
    ref: environmentValue("GITHUB_REF"),
    runId: environmentValue("GITHUB_RUN_ID"),
    runAttempt: environmentValue("GITHUB_RUN_ATTEMPT"),
  };
  if (enhanced && Object.values(source).some((value) => value === null)) {
    throw new Error("Enhanced capture GitHub provenance is incomplete");
  }
  if (enhanced) {
    if (!nativeIdentity || !documents) {
      throw new Error("Enhanced Linear identity capture is unavailable");
    }
    if (!Array.isArray(issueDescriptions)) {
      throw new Error("Enhanced Linear issue description capture is unavailable");
    }
    assertLinearNativeIdentityMatchesFingerprint(actual, nativeIdentity);
    assertLinearRawDocumentsMatchNativeIdentity(nativeIdentity, documents);
    nativeIdentityJson = `${JSON.stringify(nativeIdentity, null, 2)}\n`;
    documentsJson = `${JSON.stringify(documents, null, 2)}\n`;
  }
  let descriptionsJson: string | null = null;
  if (descriptionsOutPath) {
    if (!issueDescriptions) {
      throw new Error("Full Linear description capture is unavailable");
    }
    descriptionsJson = `${
      JSON.stringify({ schemaVersion: 1, issues: issueDescriptions }, null, 2)
    }\n`;
  }

  let receiptJson: string | null = null;
  if (receiptOutPath) {
    const fingerprintSha256 = createHash("sha256")
      .update(fingerprintJson)
      .digest("hex");
    const receipt = enhanced
      ? {
          schemaVersion: 2,
          captureMode,
          capturedAt: new Date().toISOString(),
          fingerprintSha256,
          acceptedFingerprintSha256,
          artifactSha256s: {
            fingerprint: fingerprintSha256,
            nativeIdentity: createHash("sha256")
              .update(nativeIdentityJson!)
              .digest("hex"),
            documents: createHash("sha256")
              .update(documentsJson!)
              .digest("hex"),
            issueDescriptions: createHash("sha256")
              .update(descriptionsJson!)
              .digest("hex"),
          },
          source,
        }
      : {
          schemaVersion: 1,
          capturedAt: new Date().toISOString(),
          fingerprintSha256,
          source,
        };
    receiptJson = `${JSON.stringify(receipt, null, 2)}\n`;
  }

  if (enhanced) {
    const artifacts: AtomicArtifact[] = [
      { path: outPath!, value: fingerprintJson },
      { path: nativeIdentityOutPath!, value: nativeIdentityJson! },
      { path: documentsOutPath!, value: documentsJson! },
    ];
    artifacts.push({ path: descriptionsOutPath!, value: descriptionsJson! });
    writeEnhancedCaptureArtifacts(artifacts, {
      path: receiptOutPath!,
      value: receiptJson!,
    });
  } else {
    if (outPath) {
      writeFileSync(resolve(outPath), fingerprintJson);
    }
    if (descriptionsOutPath && descriptionsJson) {
      writeFileSync(resolve(descriptionsOutPath), descriptionsJson);
    }
    if (receiptOutPath && receiptJson) {
      writeFileSync(resolve(receiptOutPath), receiptJson);
    }
  }

  const shouldCompare = !outPath || argv.has("--snapshot");
  if (!shouldCompare) return;
  const snapshotPath = snapshotInputPath ?? resolve("delivery/linear-snapshot.json");
  const snapshot = JSON.parse(readFileSync(snapshotPath, "utf8")) as {
    projects?: Array<{ id: string }>;
    linearFingerprint: LinearFingerprint;
  };
  if (!snapshot.linearFingerprint) {
    throw new Error("Linear snapshot lacks linearFingerprint");
  }
  if (!Array.isArray(snapshot.projects) || !snapshot.projects.length) {
    throw new Error("Linear snapshot lacks tracked projects");
  }
  assertLinearProjectScope(projectScope, snapshot.projects);
  const differences = committedLinearDriftDiff(
    snapshot.linearFingerprint,
    actual,
  );
  if (differences.length) {
    for (const difference of differences) console.error(difference);
    process.exitCode = 1;
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
