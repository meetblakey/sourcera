import { strict as assert } from "node:assert";
import { execFileSync } from "node:child_process";
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

test("rejects pilot proof with only a partial metric result", () => {
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
        release: "R0",
        metrics: {
          activation: { target: true, observed: true, result: "passed" },
        },
        gate: "passed",
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

test("rejects pilot metrics without an observed value", () => {
  const root = mkdtempSync(join(tmpdir(), "sourcera-evidence-"));
  try {
    mkdirSync(join(root, "reports", "evidence"), { recursive: true });
    const names = [
      "activation",
      "completion",
      "timeToValue",
      "abandonment",
      "trust",
      "reliability",
      "support",
    ];
    const metrics: Record<
      string,
      { target: string; observed: string | null; result: string }
    > = Object.fromEntries(
      names.map((name) => [
        name,
        { target: "declared", observed: "measured", result: "passed" },
      ]),
    );
    metrics.trust.observed = null;
    writeFileSync(
      join(root, "reports", "evidence", "operational.json"),
      `${JSON.stringify({
        schemaVersion: 1,
        status: "passed",
        proofTypes: ["operational"],
        observedAt: "2026-07-15T10:47:35Z",
        sourceCommit: "0123456789abcdef0123456789abcdef01234567",
        release: "R0",
        metrics,
        gate: "passed",
      })}\n`,
    );
    const group: EvidenceGroup = {
      kind: "operational",
      paths: ["reports/evidence/operational.json"],
    };

    assert.deepEqual(
      evidenceGroupFindings(root, group).map((finding) => finding.code),
      ["evidence_receipt_invalid"],
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("accepts pilot proof with every measured release metric", () => {
  const root = mkdtempSync(join(tmpdir(), "sourcera-evidence-"));
  try {
    execFileSync("git", ["init", "-q"], { cwd: root });
    execFileSync("git", ["config", "user.email", "test@sourcera.local"], {
      cwd: root,
    });
    execFileSync("git", ["config", "user.name", "Sourcera Test"], {
      cwd: root,
    });
    execFileSync("git", ["commit", "--allow-empty", "-qm", "fixture"], {
      cwd: root,
    });
    const sourceCommit = execFileSync("git", ["rev-parse", "HEAD"], {
      cwd: root,
      encoding: "utf8",
    }).trim();
    mkdirSync(join(root, "reports", "evidence"), { recursive: true });
    const metrics = Object.fromEntries(
      [
        "activation",
        "completion",
        "timeToValue",
        "abandonment",
        "trust",
        "reliability",
        "support",
      ].map((name) => [
        name,
        { target: "declared", observed: "measured", result: "passed" },
      ]),
    );
    writeFileSync(
      join(root, "reports", "evidence", "customer.json"),
      `${JSON.stringify({
        schemaVersion: 1,
        status: "passed",
        proofTypes: ["customer"],
        observedAt: "2026-07-15T10:47:35Z",
        sourceCommit,
        release: "R0",
        metrics,
        gate: "passed",
      })}\n`,
    );

    assert.equal(
      evidenceGroupPasses(root, {
        kind: "customer",
        paths: ["reports/evidence/customer.json"],
      }),
      true,
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("rejects proof bound to a nonexistent commit", () => {
  const root = mkdtempSync(join(tmpdir(), "sourcera-evidence-"));
  try {
    mkdirSync(join(root, "reports", "evidence"), { recursive: true });
    const metrics = Object.fromEntries(
      [
        "activation",
        "completion",
        "timeToValue",
        "abandonment",
        "trust",
        "reliability",
        "support",
      ].map((name) => [
        name,
        { target: "declared", observed: "measured", result: "passed" },
      ]),
    );
    writeFileSync(
      join(root, "reports", "evidence", "customer.json"),
      `${JSON.stringify({
        schemaVersion: 1,
        status: "passed",
        proofTypes: ["customer"],
        observedAt: "2026-07-15T10:47:35Z",
        sourceCommit: "0123456789abcdef0123456789abcdef01234567",
        release: "R0",
        metrics,
        gate: "passed",
      })}\n`,
    );

    assert.deepEqual(
      evidenceGroupFindings(root, {
        kind: "customer",
        paths: ["reports/evidence/customer.json"],
      }).map((finding) => finding.code),
      ["evidence_commit_invalid"],
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("rejects forecast observations bound to nonexistent commits", () => {
  const root = mkdtempSync(join(tmpdir(), "sourcera-evidence-"));
  try {
    mkdirSync(join(root, "reports", "evidence"), { recursive: true });
    const receipt = JSON.parse(
      readFileSync("reports/evidence/r0-forecast-baseline.json", "utf8"),
    ) as { observations: Array<{ closeoutCommit: string }> };
    receipt.observations[0].closeoutCommit =
      "0123456789abcdef0123456789abcdef01234567";
    writeFileSync(
      join(root, "reports", "evidence", "forecast.json"),
      `${JSON.stringify(receipt)}\n`,
    );

    assert.deepEqual(
      evidenceGroupFindings(root, {
        kind: "forecast",
        paths: ["reports/evidence/forecast.json"],
      }).map((finding) => finding.code),
      ["evidence_commit_invalid"],
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("rejects forecast observations with missing linked evidence", () => {
  const root = mkdtempSync(join(tmpdir(), "sourcera-evidence-"));
  try {
    execFileSync("git", ["init", "-q"], { cwd: root });
    execFileSync("git", ["config", "user.email", "test@sourcera.local"], {
      cwd: root,
    });
    execFileSync("git", ["config", "user.name", "Sourcera Test"], {
      cwd: root,
    });
    execFileSync("git", ["commit", "--allow-empty", "-qm", "first"], {
      cwd: root,
    });
    const firstCommit = execFileSync("git", ["rev-parse", "HEAD"], {
      cwd: root,
      encoding: "utf8",
    }).trim();
    execFileSync("git", ["commit", "--allow-empty", "-qm", "second"], {
      cwd: root,
    });
    const secondCommit = execFileSync("git", ["rev-parse", "HEAD"], {
      cwd: root,
      encoding: "utf8",
    }).trim();
    mkdirSync(join(root, "reports", "evidence"), { recursive: true });
    const observations = [
      {
        issue: "PLA-1",
        estimate: 3,
        firstImplementationCommit: firstCommit,
        closeoutCommit: secondCommit,
        startedAt: "2026-07-15T10:00:00Z",
        completedAt: "2026-07-15T10:10:00Z",
        activeSeconds: 600,
        reviewEvidence: "reports/evidence/missing-review.json",
        runtimeEvidence: "reports/evidence/missing-runtime.json",
      },
      {
        issue: "PLA-2",
        estimate: 5,
        firstImplementationCommit: firstCommit,
        closeoutCommit: secondCommit,
        startedAt: "2026-07-15T10:20:00Z",
        completedAt: "2026-07-15T10:30:00Z",
        activeSeconds: 600,
        reviewEvidence: "reports/evidence/missing-review.json",
        runtimeEvidence: "reports/evidence/missing-runtime.json",
      },
    ];
    writeFileSync(
      join(root, "reports", "evidence", "forecast.json"),
      `${JSON.stringify({
        schemaVersion: 1,
        status: "passed",
        proofTypes: ["forecast"],
        observedAt: "2026-07-15T10:31:00Z",
        policy: {
          laneCount: 1,
          wipLimit: 1,
          calendarDates: "withheld pending evidence",
          measurement: "active batch time",
        },
        observations,
        baseline: {
          completedEstimate: 8,
          activeSeconds: 1200,
          pointsPerActiveHour: 24,
          confidence: "low",
        },
        next: {
          issue: "PLA-3",
          estimate: 5,
          activeWorkMinutesAfterExternalUnblock: { lower: 15, upper: 60 },
          calendarDate: null,
          externalWait: "provider access",
          rule: "wait for proof",
        },
        recalibrationTrigger: "after every completed batch",
      })}\n`,
    );

    assert.deepEqual(
      evidenceGroupFindings(root, {
        kind: "forecast",
        paths: ["reports/evidence/forecast.json"],
      }).map((finding) => finding.code),
      ["evidence_reference_missing"],
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("rejects forecast evidence links that escape through a symlink", () => {
  const outsideRoot = mkdtempSync(join(tmpdir(), "sourcera-evidence-link-"));
  const suffix = outsideRoot.split("-").at(-1);
  const linkedRelative = `reports/evidence/linked-${suffix}.json`;
  const forecastRelative = `reports/evidence/forecast-${suffix}.json`;
  const linkedPath = join(process.cwd(), linkedRelative);
  const forecastPath = join(process.cwd(), forecastRelative);
  const outsidePath = join(outsideRoot, "outside.json");
  try {
    writeFileSync(outsidePath, "{}\n");
    symlinkSync(outsidePath, linkedPath);
    const receipt = JSON.parse(
      readFileSync("reports/evidence/r0-forecast-baseline.json", "utf8"),
    ) as {
      observations: Array<{
        reviewEvidence: string;
        runtimeEvidence: string;
      }>;
    };
    for (const observation of receipt.observations) {
      observation.reviewEvidence = linkedRelative;
      observation.runtimeEvidence = linkedRelative;
    }
    writeFileSync(forecastPath, `${JSON.stringify(receipt)}\n`);

    assert.deepEqual(
      evidenceGroupFindings(process.cwd(), {
        kind: "forecast",
        paths: [forecastRelative],
      }).map((finding) => finding.code),
      ["evidence_reference_invalid"],
    );
  } finally {
    rmSync(forecastPath, { force: true });
    rmSync(linkedPath, { force: true });
    rmSync(outsideRoot, { recursive: true, force: true });
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
