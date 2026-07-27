import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

const repositoryRoot = path.resolve(import.meta.dirname, "../..");

test("the Preview runner proves one exact five-field reactive payload and cleanup", async () => {
  const source = await readFile(
    path.join(repositoryRoot, "scripts/run-convex-foundation-probe.ts"),
    "utf8",
  );

  assert.match(source, /readRequiredConvexDeploymentClientIdentity/);
  assert.doesNotMatch(source, /readRequiredConvexDeploymentIdentity/);
  assert.match(source, /api\.foundation\.recordProbe/);
  assert.match(source, /api\.foundation\.clearProbe/);
  assert.equal(source.match(/previewProbeCapability\(identity\)/g)?.length, 2);
  assert.match(source, /SOURCERA_CONVEX_PREVIEW_PROBE_TOKEN/);
  assert.doesNotMatch(source, /SOURCERA_CONVEX_PREVIEW_PROBE_SECRET/);
  assert.doesNotMatch(source, /spawn\(/);
  assert.doesNotMatch(source, /foundation:recordProbe/);
  assert.match(
    source,
    /probe\.environment !== identity\.environment[\s\S]*probe\.issuedAt !== issuedAt[\s\S]*probe\.sample !== sample/,
  );
  assert.match(
    source,
    /api\.foundation\.observeProbe,[\s\S]*environment: identity\.environment,[\s\S]*issuedAt,[\s\S]*nonceHash,[\s\S]*sample/,
  );
  assert.match(
    source,
    /const startedAt = performance\.now\(\);\s*recordCompletion =/,
  );
  assert.match(source, /if \(!cleared\)/);
  assert.match(source, /cleanup: \{[\s\S]*result: "passed"/);
  assert.match(source, /probe\.buildCommitSha !== identity\.commitSha/);
  assert.match(source, /probe\.buildEnvironment !== identity\.environment/);
  assert.match(source, /probe\.buildPreviewName !== identity\.previewName/);
  assert.match(source, /assertConvexDeploymentUrlNamesDeployment/);
  assert.match(source, /attemptedSampleCount/);
  assert.match(source, /clearedSampleCount/);
  assert.equal(source.match(/client\.mutation\(/g)?.length, 4);
  assert.equal(
    source.match(/withConvexNetworkTimeout\(\s*client\.mutation\(/g)?.length,
    4,
  );
  assert.match(
    source,
    /withConvexNetworkTimeout\(\s*client\.close\(\),\s*SAMPLE_TIMEOUT_MS/,
  );
});
