import { strict as assert } from "node:assert";
import {
  mkdtempSync,
  mkdirSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import {
  evidenceGroupFindings,
  evidenceGroupPasses,
  type EvidenceGroup,
} from "./lib/evidence.js";

test("rejects an existing but empty proof receipt", () => {
  const root = mkdtempSync(join(tmpdir(), "sourcera-evidence-"));
  try {
    mkdirSync(join(root, "reports", "evidence"), { recursive: true });
    writeFileSync(join(root, "reports", "evidence", "forecast.json"), "{}\n");
    const group: EvidenceGroup = {
      kind: "forecast",
      paths: ["reports/evidence/forecast.json"],
    };

    assert.deepEqual(
      evidenceGroupFindings(root, group).map((finding) => finding.code),
      ["evidence_receipt_invalid"],
    );
    assert.equal(evidenceGroupPasses(root, group), false);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("rejects forecast proof without observed batches and recalibration", () => {
  const root = mkdtempSync(join(tmpdir(), "sourcera-evidence-"));
  try {
    mkdirSync(join(root, "reports", "evidence"), { recursive: true });
    writeFileSync(
      join(root, "reports", "evidence", "forecast.json"),
      `${JSON.stringify({
        schemaVersion: 1,
        status: "passed",
        proofTypes: ["forecast"],
        observedAt: "2026-07-15T10:47:35Z",
      })}\n`,
    );
    const group: EvidenceGroup = {
      kind: "forecast",
      paths: ["reports/evidence/forecast.json"],
    };

    assert.deepEqual(
      evidenceGroupFindings(root, group).map((finding) => finding.code),
      ["evidence_receipt_invalid"],
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("reports a missing configured proof receipt", () => {
  const root = mkdtempSync(join(tmpdir(), "sourcera-evidence-"));
  try {
    const group: EvidenceGroup = {
      kind: "runtime",
      paths: ["reports/evidence/missing.json"],
    };

    assert.deepEqual(
      evidenceGroupFindings(root, group).map((finding) => finding.code),
      ["evidence_missing"],
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("reports malformed proof JSON without aborting generation", () => {
  const root = mkdtempSync(join(tmpdir(), "sourcera-evidence-"));
  try {
    mkdirSync(join(root, "reports", "evidence"), { recursive: true });
    writeFileSync(
      join(root, "reports", "evidence", "runtime.json"),
      "{not-json}\n",
    );
    const group: EvidenceGroup = {
      kind: "runtime",
      paths: ["reports/evidence/runtime.json"],
    };

    assert.deepEqual(
      evidenceGroupFindings(root, group).map((finding) => finding.code),
      ["evidence_json_invalid"],
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("rejects proof paths outside the repository evidence directory", () => {
  const root = mkdtempSync(join(tmpdir(), "sourcera-evidence-root-"));
  const outside = join(
    mkdtempSync(join(tmpdir(), "sourcera-evidence-outside-")),
    "runtime.json",
  );
  try {
    writeFileSync(
      outside,
      `${JSON.stringify({
        schemaVersion: 1,
        status: "passed",
        proofTypes: ["runtime"],
        observedAt: "2026-07-15T10:47:35Z",
      })}\n`,
    );
    const group: EvidenceGroup = { kind: "runtime", paths: [outside] };

    assert.deepEqual(
      evidenceGroupFindings(root, group).map((finding) => finding.code),
      ["evidence_path_invalid"],
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
    rmSync(join(outside, ".."), { recursive: true, force: true });
  }
});

test("rejects execution proof that is not commit-bound", () => {
  const root = mkdtempSync(join(tmpdir(), "sourcera-evidence-"));
  try {
    mkdirSync(join(root, "reports", "evidence"), { recursive: true });
    writeFileSync(
      join(root, "reports", "evidence", "runtime.json"),
      `${JSON.stringify({
        schemaVersion: 1,
        status: "passed",
        proofTypes: ["runtime"],
        observedAt: "2026-07-15T10:47:35Z",
      })}\n`,
    );
    const group: EvidenceGroup = {
      kind: "runtime",
      paths: ["reports/evidence/runtime.json"],
    };

    assert.deepEqual(
      evidenceGroupFindings(root, group).map((finding) => finding.code),
      ["evidence_receipt_invalid"],
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("accepts the current commit-bound execution and forecast receipts", () => {
  const executionPaths = [
    "reports/evidence/r0-foundation.json",
    "reports/evidence/r0-three-domain-foundation.json",
  ];
  for (const kind of ["tests", "deploy", "rollback", "runtime"] as const) {
    assert.equal(
      evidenceGroupPasses(process.cwd(), { kind, paths: executionPaths }),
      true,
    );
  }
  assert.equal(
    evidenceGroupPasses(process.cwd(), {
      kind: "forecast",
      paths: ["reports/evidence/r0-forecast-baseline.json"],
    }),
    true,
  );
});

test("rejects customer proof without release metrics and a passed gate", () => {
  const root = mkdtempSync(join(tmpdir(), "sourcera-evidence-"));
  try {
    mkdirSync(join(root, "reports", "evidence"), { recursive: true });
    writeFileSync(
      join(root, "reports", "evidence", "customer.json"),
      `${JSON.stringify({
        schemaVersion: 1,
        status: "passed",
        proofTypes: ["customer"],
        observedAt: "2026-07-15T10:47:35Z",
        sourceCommit: "0123456789abcdef0123456789abcdef01234567",
      })}\n`,
    );
    const group: EvidenceGroup = {
      kind: "customer",
      paths: ["reports/evidence/customer.json"],
    };

    assert.deepEqual(
      evidenceGroupFindings(root, group).map((finding) => finding.code),
      ["evidence_receipt_invalid"],
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("rejects execution receipts that omit their named proof section", () => {
  const root = mkdtempSync(join(tmpdir(), "sourcera-evidence-"));
  try {
    mkdirSync(join(root, "reports", "evidence"), { recursive: true });
    const groups = (["tests", "deploy", "rollback", "runtime"] as const).map(
      (kind) => {
        const path = `reports/evidence/${kind}.json`;
        writeFileSync(
          join(root, path),
          `${JSON.stringify({
            schemaVersion: 1,
            status: "passed",
            proofTypes: [kind],
            observedAt: "2026-07-15T10:47:35Z",
            sourceCommit: "0123456789abcdef0123456789abcdef01234567",
          })}\n`,
        );
        return { kind, paths: [path] } satisfies EvidenceGroup;
      },
    );

    assert.deepEqual(
      groups.flatMap((group) =>
        evidenceGroupFindings(root, group).map((finding) => finding.code),
      ),
      [
        "evidence_receipt_invalid",
        "evidence_receipt_invalid",
        "evidence_receipt_invalid",
        "evidence_receipt_invalid",
      ],
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("rejects forecast proof with unmeasured batch observations", () => {
  const root = mkdtempSync(join(tmpdir(), "sourcera-evidence-"));
  try {
    mkdirSync(join(root, "reports", "evidence"), { recursive: true });
    writeFileSync(
      join(root, "reports", "evidence", "forecast.json"),
      `${JSON.stringify({
        schemaVersion: 1,
        status: "passed",
        proofTypes: ["forecast"],
        observedAt: "2026-07-15T10:47:35Z",
        observations: [{}, {}],
        recalibrationTrigger: "after every batch",
      })}\n`,
    );
    const group: EvidenceGroup = {
      kind: "forecast",
      paths: ["reports/evidence/forecast.json"],
    };

    assert.deepEqual(
      evidenceGroupFindings(root, group).map((finding) => finding.code),
      ["evidence_receipt_invalid"],
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("rejects forecast proof without a reconciled baseline and next batch", () => {
  const root = mkdtempSync(join(tmpdir(), "sourcera-evidence-"));
  try {
    mkdirSync(join(root, "reports", "evidence"), { recursive: true });
    const receipt = JSON.parse(
      readFileSync(
        join(process.cwd(), "reports/evidence/r0-forecast-baseline.json"),
        "utf8",
      ),
    ) as Record<string, unknown>;
    delete receipt.baseline;
    writeFileSync(
      join(root, "reports", "evidence", "forecast.json"),
      `${JSON.stringify(receipt)}\n`,
    );
    const group: EvidenceGroup = {
      kind: "forecast",
      paths: ["reports/evidence/forecast.json"],
    };

    assert.deepEqual(
      evidenceGroupFindings(root, group).map((finding) => finding.code),
      ["evidence_receipt_invalid"],
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("rejects evidence symlinks that escape the repository", () => {
  const root = mkdtempSync(join(tmpdir(), "sourcera-evidence-root-"));
  const outsideRoot = mkdtempSync(join(tmpdir(), "sourcera-evidence-outside-"));
  try {
    mkdirSync(join(root, "reports", "evidence"), { recursive: true });
    const outside = join(outsideRoot, "runtime.json");
    writeFileSync(
      outside,
      `${JSON.stringify({
        schemaVersion: 1,
        status: "passed",
        proofTypes: ["runtime"],
        observedAt: "2026-07-15T10:47:35Z",
        sourceCommit: "0123456789abcdef0123456789abcdef01234567",
        staging: { healthResult: "passed-200" },
      })}\n`,
    );
    symlinkSync(outside, join(root, "reports", "evidence", "runtime.json"));
    const group: EvidenceGroup = {
      kind: "runtime",
      paths: ["reports/evidence/runtime.json"],
    };

    assert.deepEqual(
      evidenceGroupFindings(root, group).map((finding) => finding.code),
      ["evidence_path_invalid"],
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
    rmSync(outsideRoot, { recursive: true, force: true });
  }
});
