import { strict as assert } from "node:assert";
import { createHash } from "node:crypto";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import {
  verifySourceChecksumContract,
  type SourceChecksumContract,
} from "./lib/source-checksums.js";

const sha256 = (value: string) =>
  createHash("sha256").update(value, "utf8").digest("hex");

test("verifies an exact heading-bounded source slice", () => {
  const root = mkdtempSync(join(tmpdir(), "sourcera-source-checksum-"));
  try {
    const source = [
      "# Header",
      "## Start",
      "required behavior",
      "",
      "## End",
      "unrelated behavior",
      "",
    ].join("\n");
    writeFileSync(join(root, "source.md"), source);
    const exactSlice = "## Start\nrequired behavior\n\n";
    const contract: SourceChecksumContract = {
      schemaVersion: 1,
      sources: [
        {
          endHeading: "## End",
          sha256: sha256(exactSlice),
          sourceDoc: "source.md",
          sourceId: "F-001",
          startHeading: "## Start",
        },
      ],
    };

    assert.deepEqual(verifySourceChecksumContract(contract, root), []);
  } finally {
    rmSync(root, { force: true, recursive: true });
  }
});

test("fails closed on changed bytes, missing anchors, duplicate IDs, and escapes", () => {
  const root = mkdtempSync(join(tmpdir(), "sourcera-source-checksum-"));
  try {
    writeFileSync(join(root, "source.md"), "## Start\nchanged\n## End\n");
    const row = {
      endHeading: "## End",
      sha256: "a".repeat(64),
      sourceDoc: "source.md",
      sourceId: "F-001",
      startHeading: "## Start",
    };
    const findings = verifySourceChecksumContract(
      {
        schemaVersion: 1,
        sources: [
          row,
          { ...row },
          { ...row, sourceDoc: "../outside.md", sourceId: "F-002" },
          { ...row, startHeading: "## Missing", sourceId: "F-003" },
        ],
      },
      root,
    );

    assert.deepEqual(
      new Set(findings.map((finding) => finding.code)),
      new Set([
        "source_checksum_duplicate",
        "source_checksum_mismatch",
        "source_checksum_path_escape",
        "source_checksum_start_missing",
      ]),
    );
  } finally {
    rmSync(root, { force: true, recursive: true });
  }
});

test("canonical repaired Linear sources match their committed byte hashes", () => {
  const contract = JSON.parse(
    readFileSync("delivery/ticket-source-checksums.json", "utf8"),
  ) as SourceChecksumContract;
  assert.deepEqual(verifySourceChecksumContract(contract, process.cwd()), []);
});
