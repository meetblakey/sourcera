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
