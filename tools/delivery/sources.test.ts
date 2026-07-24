import { strict as assert } from "node:assert";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";
import {
  parseFeatureInventory,
  parseRuntimeGate,
  sourceReferenceFindings,
} from "./lib/sources.js";

const fixture = (name: string) =>
  readFileSync(resolve(process.cwd(), "tools/delivery/fixtures", name), "utf8");

test("parses stable feature and runtime identities", () => {
  const features = parseFeatureInventory(
    fixture("feature-inventory-valid.md"),
  );
  assert.deepEqual(
    features.map((row) => row.requirementId),
    ["F-001", "F-002"],
  );
  assert.deepEqual(features[1].dependencies, ["F-001"]);

  const gates = parseRuntimeGate(fixture("stamp-valid.json"));
  assert.deepEqual(
    gates.map((row) => row.requirementId),
    ["RG:gate_a"],
  );
  assert.equal(gates[0].disposition, "proof_only");
});

test("rejects duplicate identities", () => {
  const duplicate = `${fixture("feature-inventory-valid.md")}\n| F-001 | Duplicate | surface | §1.1 | — | master_spec | v7.1.0a | duplicate | — |`;
  assert.throws(
    () => parseFeatureInventory(duplicate),
    /Duplicate requirement_id F-001/,
  );
});

test("resolves normalized Linear planning provenance to the canonical register", () => {
  const [row] = parseFeatureInventory(
    "| F-910 | Header policy | platform_mechanic | LINEAR:PLA-137 | §28.1 | linear_planning | 2026-07-16 | Header policy. | F-004 |",
  );
  assert.equal(row.sourceDoc, "delivery/planning-source-register.md");
  assert.deepEqual(row.dependencies, ["F-004"]);
  assert.deepEqual(sourceReferenceFindings([row], process.cwd()), []);
});

test("fails a broken source path", () => {
  const [row] = parseFeatureInventory(fixture("feature-inventory-valid.md"));
  assert.equal(
    sourceReferenceFindings(
      [{ ...row, sourceDoc: "missing.md" }],
      process.cwd(),
    )[0].code,
    "source_file_missing",
  );
});
