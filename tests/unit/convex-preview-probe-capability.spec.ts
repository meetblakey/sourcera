import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";

import {
  createConvexPreviewProbeExpiresAt,
  deriveConvexPreviewProbeToken,
  deriveConvexPreviewProbeTokenSha256,
  readConvexPreviewProbeExpiresAt,
} from "../../scripts/lib/convex-preview-probe-capability";

const commitSha = "0123456789abcdef0123456789abcdef01234567";
const previewName = `sourcera-main-${commitSha}`;
const deployKey = "preview:sourcera-production:sourcera|opaque-preview-secret";
const probeSeed = "9".repeat(64);

test("Preview probe capability is stable only for one seed, commit, and Preview", () => {
  const token = deriveConvexPreviewProbeToken(
    probeSeed,
    commitSha,
    previewName,
  );
  const digest = deriveConvexPreviewProbeTokenSha256(
    probeSeed,
    commitSha,
    previewName,
  );

  assert.match(token, /^[a-f0-9]{64}$/);
  assert.match(digest, /^[a-f0-9]{64}$/);
  assert.equal(
    token,
    deriveConvexPreviewProbeToken(probeSeed, commitSha, previewName),
  );
  assert.notEqual(
    token,
    deriveConvexPreviewProbeToken(
      "8".repeat(64),
      commitSha,
      previewName,
    ),
  );
  assert.notEqual(
    token,
    deriveConvexPreviewProbeToken(
      probeSeed,
      "f".repeat(40),
      `sourcera-main-${"f".repeat(40)}`,
    ),
  );
  assert.notEqual(
    token,
    deriveConvexPreviewProbeToken(
      probeSeed,
      commitSha,
      `sourcera-other-${commitSha}`,
    ),
  );
  assert.notEqual(token, digest);
});

test("Preview probe capability rejects malformed identity inputs", () => {
  assert.throws(() =>
    deriveConvexPreviewProbeToken("", commitSha, previewName),
  );
  assert.throws(() =>
    deriveConvexPreviewProbeToken(
      probeSeed,
      commitSha.toUpperCase(),
      previewName,
    ),
  );
  assert.throws(() =>
    deriveConvexPreviewProbeToken(probeSeed, commitSha, "wrong-preview"),
  );
});

test("Preview probe capability expiry is short-lived and fail-closed", () => {
  const clock = 1_800_000_000_000;
  const expiresAt = createConvexPreviewProbeExpiresAt(clock);
  assert.equal(expiresAt, clock + 15 * 60 * 1_000);
  assert.equal(
    readConvexPreviewProbeExpiresAt(String(expiresAt), clock),
    expiresAt,
  );
  assert.throws(() => readConvexPreviewProbeExpiresAt(String(clock), clock));
  assert.throws(() =>
    readConvexPreviewProbeExpiresAt(String(expiresAt + 1), clock),
  );
  assert.throws(() => readConvexPreviewProbeExpiresAt("unbounded", clock));
});

test("Preview probe capability writer keeps the token external, private, and out of logs", () => {
  const outputDirectory = mkdtempSync(
    path.join(tmpdir(), "sourcera-preview-probe-"),
  );
  const tokenPath = path.join(outputDirectory, "token");
  const githubEnvironmentPath = path.join(outputDirectory, "github-env");
  try {
    const execution = spawnSync(
      "npx",
      [
        "tsx",
        "scripts/prepare-convex-preview-probe.ts",
        "--out",
        tokenPath,
        "--write-github-env",
      ],
      {
        cwd: path.resolve(import.meta.dirname, "../.."),
        encoding: "utf8",
        env: {
          NODE_ENV: "test",
          PATH: process.env.PATH,
          CONVEX_DEPLOY_KEY: deployKey,
          CONVEX_EXPECTED_PROJECT: "sourcera-production/sourcera",
          CONVEX_PREVIEW_NAME: previewName,
          GITHUB_ACTIONS: "true",
          GITHUB_ENV: githubEnvironmentPath,
          SOURCERA_COMMIT_SHA: commitSha,
          SOURCERA_CONVEX_PREVIEW_PROBE_SEED: probeSeed,
          SOURCERA_ENV: "preview",
        },
      },
    );
    assert.equal(execution.status, 0, execution.stderr);
    const token = readFileSync(tokenPath, "utf8");
    const receipt = JSON.parse(execution.stdout) as {
      expiresAt: string;
      tokenSha256: string;
    };
    assert.equal(
      token,
      deriveConvexPreviewProbeToken(probeSeed, commitSha, previewName),
    );
    assert.equal(
      receipt.tokenSha256,
      deriveConvexPreviewProbeTokenSha256(probeSeed, commitSha, previewName),
    );
    assert.doesNotMatch(execution.stdout + execution.stderr, new RegExp(token));
    assert.equal(
      readFileSync(githubEnvironmentPath, "utf8"),
      `SOURCERA_CONVEX_PREVIEW_PROBE_TOKEN_FILE=${tokenPath}\n` +
        `SOURCERA_CONVEX_PREVIEW_PROBE_TOKEN_SHA256=${receipt.tokenSha256}\n` +
        `SOURCERA_CONVEX_PREVIEW_PROBE_EXPIRES_AT=${Date.parse(receipt.expiresAt)}\n`,
    );
    assert.equal(readFileSync(tokenPath).length, 64);
    assert.equal(statSync(tokenPath).mode & 0o777, 0o600);

    const second = spawnSync(
      "npx",
      ["tsx", "scripts/prepare-convex-preview-probe.ts", "--out", tokenPath],
      {
        cwd: path.resolve(import.meta.dirname, "../.."),
        encoding: "utf8",
        env: {
          NODE_ENV: "test",
          PATH: process.env.PATH,
          CONVEX_DEPLOY_KEY: deployKey,
          CONVEX_EXPECTED_PROJECT: "sourcera-production/sourcera",
          CONVEX_PREVIEW_NAME: previewName,
          SOURCERA_COMMIT_SHA: commitSha,
          SOURCERA_CONVEX_PREVIEW_PROBE_SEED: probeSeed,
          SOURCERA_ENV: "preview",
        },
      },
    );
    assert.notEqual(second.status, 0);
    assert.match(second.stderr, /already exists/);
  } finally {
    rmSync(outputDirectory, { force: true, recursive: true });
  }
});
