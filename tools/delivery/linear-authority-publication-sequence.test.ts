import { strict as assert } from "node:assert";
import test from "node:test";

import {
  buildLinearAuthorityRequirementPublicationSequence,
  canonicalLinearAuthorityRequirementPublicationSequenceJson,
  validateLinearAuthorityRequirementPublicationSequence,
} from "./lib/linear-authority-publication-sequence.js";

const sequence = Array.from({ length: 926 }, (_, index) => `F-${String(index + 1).padStart(3, "0")}`);

test("builds and validates one exact canonical 926-row publication sequence", () => {
  const artifact = buildLinearAuthorityRequirementPublicationSequence(sequence);
  const raw = canonicalLinearAuthorityRequirementPublicationSequenceJson(artifact);
  assert.deepEqual(validateLinearAuthorityRequirementPublicationSequence(raw, sequence), artifact);
  assert.equal(artifact.entries[0]?.rank, 1);
  assert.equal(artifact.entries.at(-1)?.rank, 926);
});

test("rejects byte-valid reordered, missing, duplicate, and re-rooted publication artifacts", () => {
  const artifact = buildLinearAuthorityRequirementPublicationSequence(sequence);
  const reordered = structuredClone(artifact);
  [reordered.entries[0], reordered.entries[1]] = [reordered.entries[1]!, reordered.entries[0]!];
  assert.throws(() => validateLinearAuthorityRequirementPublicationSequence(JSON.stringify(reordered), sequence), /canonical topological sequence/);

  const missing = structuredClone(artifact);
  missing.entries.pop();
  assert.throws(() => validateLinearAuthorityRequirementPublicationSequence(JSON.stringify(missing), sequence), /exactly 926/);

  const duplicated = structuredClone(artifact);
  duplicated.entries[1] = { ...duplicated.entries[0]!, rank: 2 };
  assert.throws(() => validateLinearAuthorityRequirementPublicationSequence(JSON.stringify(duplicated), sequence), /canonical topological sequence|duplicates/);

  const reRooted = structuredClone(artifact);
  reRooted.publicationRoot = "f".repeat(64);
  assert.throws(() => validateLinearAuthorityRequirementPublicationSequence(JSON.stringify(reRooted), sequence), /root mismatch/);
});
