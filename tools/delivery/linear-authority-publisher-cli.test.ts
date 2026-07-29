import { strict as assert } from "node:assert";
import { existsSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";

test("publisher CLI defaults safely and never emits package or credential content on failure", () => {
  const root = mkdtempSync(join(tmpdir(), "linear-authority-cli-"));
  try {
    writeFileSync(join(root, "manifest.json"), "secret raw package body", { mode: 0o600 });
    const journal = join(root, "journal.jsonl");
    const result = spawnSync(process.execPath, [
      "--import",
      resolve("tools/spec-lint/node_modules/tsx/dist/loader.mjs"),
      resolve("tools/delivery/publish-linear-authority.ts"),
      "--package-dir",
      root,
      "--apply",
      "--run-id",
      "test:safe-failure",
      "--journal-out",
      journal,
    ], {
      cwd: process.cwd(),
      encoding: "utf8",
      env: { ...process.env, LINEAR_API_KEY: "secret-linear-key" },
    });
    assert.equal(result.status, 1);
    assert.equal(result.stdout, "");
    assert.equal(result.stderr, "Linear authority publication failed\n");
    assert.equal(result.stderr.includes("secret-linear-key"), false);
    assert.equal(result.stderr.includes("secret raw package body"), false);
    assert.equal(existsSync(journal), false);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("publisher CLI exposes the handoff only to a complete final dry-run", () => {
  const root = mkdtempSync(join(tmpdir(), "linear-authority-handoff-cli-"));
  try {
    const handoff = join(root, "handoff.json");
    const receipt = join(root, "publisher-receipt.json");
    const packageDir = join(root, "publisher-package");
    const base = [
      "--import",
      resolve("tools/spec-lint/node_modules/tsx/dist/loader.mjs"),
      resolve("tools/delivery/publish-linear-authority.ts"),
      "--package-dir",
      root,
    ];
    const incomplete = spawnSync(process.execPath, [
      ...base,
      "--production-decision-handoff-out",
      handoff,
    ], { cwd: process.cwd(), encoding: "utf8" });
    assert.equal(incomplete.status, 1);
    assert.equal(incomplete.stdout, "");
    assert.equal(incomplete.stderr, "Linear authority publication failed\n");

    const apply = spawnSync(process.execPath, [
      ...base,
      "--apply",
      "--run-id",
      "test:handoff-apply",
      "--journal-out",
      join(root, "journal.jsonl"),
      "--publisher-package-dir",
      packageDir,
      "--publisher-receipt",
      receipt,
      "--production-decision-handoff-out",
      handoff,
    ], { cwd: process.cwd(), encoding: "utf8" });
    assert.equal(apply.status, 1);
    assert.equal(apply.stdout, "");
    assert.equal(apply.stderr, "Linear authority publication failed\n");
    assert.equal(existsSync(handoff), false);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
