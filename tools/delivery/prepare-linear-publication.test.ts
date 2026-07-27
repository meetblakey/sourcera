import { strict as assert } from "node:assert";
import { createHash } from "node:crypto";
import { execFileSync, spawnSync } from "node:child_process";
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import {
  exactPublicationFiles,
  runTool,
} from "./prepare-linear-publication.js";

const repositoryRoot = execFileSync("git", ["rev-parse", "--show-toplevel"], {
  encoding: "utf8",
}).trim();
const head = execFileSync("git", ["rev-parse", "HEAD"], {
  encoding: "utf8",
}).trim();
const loader = join(
  repositoryRoot,
  "tools/spec-lint/node_modules/tsx/dist/loader.mjs",
);
const script = join(
  repositoryRoot,
  "tools/delivery/prepare-linear-publication.ts",
);
const snapshot = join(repositoryRoot, "delivery/linear-snapshot.json");

function requiredArguments(root: string, captureReceipt: string): string[] {
  return [
    "--snapshot",
    snapshot,
    "--handoff",
    snapshot,
    "--fingerprint",
    join(root, "fingerprint.json"),
    "--capture-receipt",
    captureReceipt,
    "--candidate-receipt",
    snapshot,
    "--ticket-integrity",
    snapshot,
    "--linear-project-scope",
    snapshot,
    "--linear-program-scope",
    snapshot,
    "--source-policy",
    snapshot,
    "--inventory",
    snapshot,
    "--source-checksums",
    snapshot,
    "--dispositions",
    snapshot,
    "--stamp",
    snapshot,
    "--exact",
    snapshot,
    "--runtime-dependencies",
    snapshot,
    "--releases",
    snapshot,
    "--release-policy",
    snapshot,
    "--feature-dependencies",
    snapshot,
    "--roadmap",
    snapshot,
    "--out",
    join(root, "publication"),
  ];
}

function run(
  arguments_: string[],
  environment: Partial<NodeJS.ProcessEnv> = {},
) {
  return spawnSync(
    process.execPath,
    ["--import", loader, script, ...arguments_],
    {
      cwd: repositoryRoot,
      encoding: "utf8",
      env: {
        ...process.env,
        GITHUB_REPOSITORY: "meetblakey/sourcera",
        GITHUB_SHA: head,
        GITHUB_REF: "refs/heads/main",
        GITHUB_RUN_ID: "123",
        GITHUB_RUN_ATTEMPT: "1",
        LINEAR_HANDOFF_ARTIFACT_DIGEST: "a".repeat(64),
        ...environment,
      },
    },
  );
}

test("publication enumerates only regular files and rejects symlinks", () => {
  const root = mkdtempSync(join(tmpdir(), "linear-publication-files-"));
  try {
    mkdirSync(join(root, "delivery"));
    mkdirSync(join(root, "reports"));
    writeFileSync(join(root, "delivery", "linear-snapshot.json"), "{}\n");
    writeFileSync(join(root, "reports", "report.json"), "{}\n");
    assert.deepEqual(exactPublicationFiles(root), [
      "delivery/linear-snapshot.json",
      "reports/report.json",
    ]);
    symlinkSync(
      join(root, "delivery", "linear-snapshot.json"),
      join(root, "linked.json"),
    );
    assert.throws(() => exactPublicationFiles(root), /symlinks/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("publication reports a silent child-process exit status", () => {
  const root = mkdtempSync(join(tmpdir(), "linear-publication-silent-tool-"));
  try {
    const silentFailure = join(root, "silent-failure.mjs");
    writeFileSync(silentFailure, "process.exitCode = 7;\n");
    assert.throws(
      () => runTool(repositoryRoot, "Silent tool", [silentFailure]),
      /Silent tool failed:\nexited with status 7/,
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("publication re-verifies the exact repository-shaped 16-file bundle", () => {
  const source = readFileSync(script, "utf8");
  assert.match(source, /tools\/delivery\/verify\.ts/);
  assert.match(source, /Publication bundle verification/);
  assert.match(source, /assertPublicationIntegrityReport/);
  assert.match(source, /candidate\.linearTicketIntegrity/);
  for (const required of [
    "attestation/linear-publication-receipt.json",
    "attestation/linear-ticket-integrity.json",
    "delivery/linear-snapshot.json",
    "delivery/release-plan.json",
    "delivery-manifest.json",
  ]) {
    assert.match(source, new RegExp(required.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
  assert.doesNotMatch(source, /linear-ticket-descriptions/);
});

test("publication CLI rejects a non-main source before consuming artifacts", () => {
  const root = mkdtempSync(join(tmpdir(), "linear-publication-source-"));
  try {
    writeFileSync(join(root, "fingerprint.json"), "{}\n");
    const capture = join(root, "capture.json");
    writeFileSync(capture, "{}\n");
    const result = run(requiredArguments(root, capture), {
      GITHUB_REF: "refs/heads/feature",
    });
    assert.equal(result.status, 1, result.stderr);
    assert.match(result.stderr, /canonical main CI/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("publication CLI rejects a stale capture from the current run", () => {
  const root = mkdtempSync(join(tmpdir(), "linear-publication-stale-"));
  try {
    const fingerprintJson = "{}\n";
    const fingerprint = join(root, "fingerprint.json");
    writeFileSync(fingerprint, fingerprintJson);
    const capture = join(root, "capture.json");
    writeFileSync(
      capture,
      `${JSON.stringify(
        {
          schemaVersion: 1,
          capturedAt: "2000-01-01T00:00:00.000Z",
          fingerprintSha256: createHash("sha256")
            .update(fingerprintJson)
            .digest("hex"),
          source: {
            repository: "meetblakey/sourcera",
            commit: head,
            ref: "refs/heads/main",
            runId: "123",
            runAttempt: "1",
          },
        },
        null,
        2,
      )}\n`,
    );
    const result = run(requiredArguments(root, capture));
    assert.equal(result.status, 1, result.stderr);
    assert.match(result.stderr, /stale or future-dated/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
