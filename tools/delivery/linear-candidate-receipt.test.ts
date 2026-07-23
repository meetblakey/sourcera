import { strict as assert } from "node:assert";
import test from "node:test";

import {
  assertLinearCandidateReceipt,
  buildLinearCandidateReceipt,
  exactLinearRunSource,
  type LinearCandidateReceiptInputs,
} from "./lib/linear-candidate-receipt.js";

const source = {
  repository: "meetblakey/sourcera",
  commit: "a".repeat(40),
  ref: "refs/heads/main",
  runId: "1",
  runAttempt: "1",
};

const inputs: LinearCandidateReceiptInputs = {
  candidateJson: "candidate",
  baselineSnapshotJson: "baseline",
  fingerprintJson: "fingerprint",
  captureReceiptJson: "capture",
  projectScopeJson: "projects",
  programScopeJson: "program",
  sourcePolicyJson: "policy",
  inventoryJson: "inventory",
  sourceChecksumContractJson: "checksums",
  dispositionsJson: "dispositions",
  runtimeStampJson: "runtime-stamp",
  runtimeDependencyContractJson: "runtime-dependencies",
  releaseDefinitionsJson: "releases",
  createdAt: "2026-07-23T00:00:00.000Z",
  source,
};

test("requires the exact five-field canonical run source", () => {
  assert.equal(exactLinearRunSource(source, source), true);
  assert.equal(exactLinearRunSource({}, source), false);
  assert.equal(
    exactLinearRunSource({ ...source, unexpected: "value" }, source),
    false,
  );
  const receipt = buildLinearCandidateReceipt(inputs);
  assert.throws(
    () => assertLinearCandidateReceipt({ ...receipt, source: {} }, inputs),
    /does not match|shape/,
  );
});

test("receipt-binds the canonical disposition classifications", () => {
  const receipt = buildLinearCandidateReceipt(inputs);
  assert.equal(
    assertLinearCandidateReceipt(receipt, inputs).sourceDispositionsSha256,
    receipt.sourceDispositionsSha256,
  );
  assert.throws(
    () =>
      assertLinearCandidateReceipt(receipt, {
        ...inputs,
        dispositionsJson: "changed",
      }),
    /does not match/,
  );
});

test("receipt-binds the exact runtime stamp and dependency inventory", () => {
  const receipt = buildLinearCandidateReceipt(inputs);
  assert.match(receipt.runtimeStampSha256!, /^[a-f0-9]{64}$/);
  assert.match(receipt.runtimeDependencyContractSha256!, /^[a-f0-9]{64}$/);
  assert.throws(
    () =>
      assertLinearCandidateReceipt(receipt, {
        ...inputs,
        runtimeStampJson: "changed-runtime-stamp",
      }),
    /does not match/,
  );
  assert.throws(
    () =>
      assertLinearCandidateReceipt(receipt, {
        ...inputs,
        runtimeDependencyContractJson: "changed-runtime-dependencies",
      }),
    /does not match/,
  );
});

test("receipt-binds the canonical release definitions", () => {
  const receipt = buildLinearCandidateReceipt(inputs);
  assert.match(receipt.releaseDefinitionsSha256, /^[a-f0-9]{64}$/);
  assert.throws(
    () =>
      assertLinearCandidateReceipt(receipt, {
        ...inputs,
        releaseDefinitionsJson: "changed-releases",
      }),
    /does not match/,
  );
});
