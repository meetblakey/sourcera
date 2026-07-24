import assert from "node:assert/strict";
import {
  existsSync,
  mkdtempSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import { removeGeneratedOutputs } from "../../scripts/clean-generated-output.js";

test("removes only generated Next.js outputs", () => {
  const root = mkdtempSync(join(tmpdir(), "sourcera-generated-"));
  try {
    const outputs = [
      join(root, ".next"),
      join(root, "apps", "buyer", ".next"),
      join(root, "apps", "seller", ".next"),
    ];
    for (const output of outputs) {
      mkdirSync(join(output, "server 2"), { recursive: true });
      writeFileSync(join(output, "routes 2.json"), "{}\n");
    }
    const source = join(root, "apps", "buyer", "app", "page.tsx");
    mkdirSync(join(source, ".."), { recursive: true });
    writeFileSync(source, "export default function Page() {}\n");

    assert.deepEqual(removeGeneratedOutputs(root), [
      ".next",
      "apps/buyer/.next",
      "apps/seller/.next",
    ]);
    assert.equal(outputs.some(existsSync), false);
    assert.equal(existsSync(source), true);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("root typecheck cleans generated outputs first", () => {
  const packageJson = JSON.parse(
    readFileSync(join(process.cwd(), "package.json"), "utf8"),
  ) as { scripts: Record<string, string> };

  assert.equal(
    packageJson.scripts["clean:generated"],
    "tsx scripts/clean-generated-output.ts",
  );
  assert.equal(packageJson.scripts.pretypecheck, "npm run clean:generated");
});
