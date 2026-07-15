import { strict as assert } from "node:assert";
import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

test("requires explicit feature dependencies for a custom inventory", () => {
  const dir = mkdtempSync(join(tmpdir(), "sourcera-release-plan-input-pair-"));
  try {
    const inventory = join(dir, "inventory.md");
    writeFileSync(inventory, "custom inventory\n");
    const result = spawnSync(
      process.execPath,
      [
        "--import",
        "./tools/spec-lint/node_modules/tsx/dist/loader.mjs",
        "tools/delivery/build-release-plan.ts",
        "--root",
        process.cwd(),
        "--inventory",
        inventory,
      ],
      { cwd: process.cwd(), encoding: "utf8" },
    );

    assert.equal(result.status, 1);
    assert.match(
      result.stderr,
      /--feature-dependencies is required when --inventory is supplied/,
    );
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("requires an explicit release policy for a custom inventory", () => {
  const dir = mkdtempSync(join(tmpdir(), "sourcera-release-plan-policy-pair-"));
  try {
    const inventory = join(dir, "inventory.md");
    const featureDependencies = join(dir, "feature-dependencies.json");
    writeFileSync(inventory, "custom inventory\n");
    writeFileSync(
      featureDependencies,
      JSON.stringify({ schemaVersion: 1, repairs: [] }),
    );
    const result = spawnSync(
      process.execPath,
      [
        "--import",
        "./tools/spec-lint/node_modules/tsx/dist/loader.mjs",
        "tools/delivery/build-release-plan.ts",
        "--root",
        process.cwd(),
        "--inventory",
        inventory,
        "--feature-dependencies",
        featureDependencies,
      ],
      { cwd: process.cwd(), encoding: "utf8" },
    );

    assert.equal(result.status, 1);
    assert.match(
      result.stderr,
      /--policy is required when --inventory is supplied/,
    );
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
