import { strict as assert } from "node:assert";
import { execFileSync } from "node:child_process";
import {
  mkdtempSync,
  mkdirSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import {
  checkpointReceiptFinding,
  evidenceGroupFindings,
  evidenceGroupPasses,
  type EvidenceGroup,
} from "./lib/evidence.js";
import type { CheckpointProofType } from "./lib/model.js";

interface ForecastObservationFixture {
  issue: string;
  estimate: number;
  firstImplementationCommit: string;
  closeoutCommit: string;
  startedAt: string;
  completedAt: string;
  activeSeconds: number;
  reviewEvidence: string;
  runtimeEvidence: string;
}

interface ForecastReceiptFixture {
  schemaVersion: number;
  proofTypes: string[];
  status: string;
  observedAt: string;
  policy: {
    laneCount: number;
    wipLimit: number;
    calendarDates: string;
    measurement: string;
  };
  observations: ForecastObservationFixture[];
  baseline: {
    completedEstimate: number;
    activeSeconds: number;
    pointsPerActiveHour: number;
    confidence: string;
  };
  next: {
    issue: string;
    estimate: number;
    activeWorkMinutesAfterExternalUnblock: {
      lower: number;
      upper: number;
    };
    calendarDate: null;
    externalWait: string;
    rule: string;
  };
  recalibrationTrigger: string;
}

interface ForecastFixture {
  root: string;
  receipt: ForecastReceiptFixture;
  forecastPath: string;
  runtimePaths: string[];
  reviewReceipts: Array<Record<string, unknown>>;
}

function fixtureCommit(root: string, message: string): string {
  execFileSync("git", ["commit", "--allow-empty", "-qm", message], {
    cwd: root,
  });
  return execFileSync("git", ["rev-parse", "HEAD"], {
    cwd: root,
    encoding: "utf8",
  }).trim();
}

function cloneForecastReceipt(
  receipt: ForecastReceiptFixture,
): ForecastReceiptFixture {
  return JSON.parse(JSON.stringify(receipt)) as ForecastReceiptFixture;
}

function createForecastFixture(): ForecastFixture {
  const root = mkdtempSync(join(tmpdir(), "sourcera-forecast-evidence-"));
  execFileSync("git", ["init", "-q"], { cwd: root });
  execFileSync("git", ["config", "user.email", "test@sourcera.local"], {
    cwd: root,
  });
  execFileSync("git", ["config", "user.name", "Sourcera Test"], {
    cwd: root,
  });
  mkdirSync(join(root, "reports", "evidence"), { recursive: true });

  const commitPairs = [
    [
      fixtureCommit(root, "first implementation one"),
      fixtureCommit(root, "closeout one"),
    ],
    [
      fixtureCommit(root, "first implementation two"),
      fixtureCommit(root, "closeout two"),
    ],
  ];
  const runtimePaths = [
    "reports/evidence/runtime-one.json",
    "reports/evidence/runtime-two.json",
  ];
  const reviewPaths = [
    "reports/evidence/review-one.json",
    "reports/evidence/review-two.json",
  ];
  const observations: ForecastObservationFixture[] = commitPairs.map(
    ([firstImplementationCommit, closeoutCommit], index) => ({
      issue: `PLA-${index + 1}`,
      estimate: index === 0 ? 3 : 5,
      firstImplementationCommit,
      closeoutCommit,
      startedAt:
        index === 0 ? "2020-01-01T10:00:00Z" : "2020-01-01T10:20:00Z",
      completedAt:
        index === 0 ? "2020-01-01T10:10:00Z" : "2020-01-01T10:30:00Z",
      activeSeconds: 600,
      reviewEvidence: reviewPaths[index],
      runtimeEvidence: runtimePaths[index],
    }),
  );
  const reviewReceipts = observations.map((observation) => ({
    schemaVersion: 1,
    issue: observation.issue,
    status: "passed",
    reviewedAt: "2020-01-01T10:31:00Z",
    reviewer: "Independent test reviewer",
    reviewType: "commit-bound fixture review",
    scope: {
      firstImplementationCommit: observation.firstImplementationCommit,
      closeoutCommit: observation.closeoutCommit,
      evidence: observation.runtimeEvidence,
    },
    findings: [],
    verdict: "accepted",
  }));
  observations.forEach((observation, index) => {
    const runtimeReceipt = {
      schemaVersion: 1,
      proofTypes: ["tests", "deploy", "rollback", "runtime"],
      issue: observation.issue,
      status: "passed",
      observedAt: "2020-01-01T10:31:00Z",
      sourceCommit: observation.closeoutCommit,
      local: { commands: { tests: "passed" } },
      staging: { healthResult: "passed" },
      rollback: { healthResult: "passed" },
    };
    writeFileSync(
      join(root, runtimePaths[index]),
      `${JSON.stringify(runtimeReceipt)}\n`,
    );
    writeFileSync(
      join(root, reviewPaths[index]),
      `${JSON.stringify(reviewReceipts[index])}\n`,
    );
  });

  const receipt: ForecastReceiptFixture = {
    schemaVersion: 1,
    proofTypes: ["forecast"],
    status: "passed",
    observedAt: "2020-01-01T10:31:00Z",
    policy: {
      laneCount: 1,
      wipLimit: 1,
      calendarDates: "withheld pending more observations",
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
  };
  const forecastPath = "reports/evidence/forecast.json";
  writeFileSync(join(root, forecastPath), `${JSON.stringify(receipt)}\n`);
  return { root, receipt, forecastPath, runtimePaths, reviewReceipts };
}

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
  const fixture = createForecastFixture();
  try {
    for (const kind of ["tests", "deploy", "rollback", "runtime"] as const) {
      assert.equal(
        evidenceGroupPasses(fixture.root, {
          kind,
          paths: fixture.runtimePaths,
        }),
        true,
      );
    }
    assert.equal(
      evidenceGroupPasses(fixture.root, {
        kind: "forecast",
        paths: [fixture.forecastPath],
      }),
      true,
    );
  } finally {
    rmSync(fixture.root, { recursive: true, force: true });
  }
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
  const fixture = createForecastFixture();
  try {
    const receipt = cloneForecastReceipt(fixture.receipt);
    receipt.observations[0].closeoutCommit =
      "0123456789abcdef0123456789abcdef01234567";
    writeFileSync(
      join(fixture.root, fixture.forecastPath),
      `${JSON.stringify(receipt)}\n`,
    );

    assert.deepEqual(
      evidenceGroupFindings(fixture.root, {
        kind: "forecast",
        paths: [fixture.forecastPath],
      }).map((finding) => finding.code),
      ["evidence_commit_invalid"],
    );
  } finally {
    rmSync(fixture.root, { recursive: true, force: true });
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
  const fixture = createForecastFixture();
  const outsideRoot = mkdtempSync(join(tmpdir(), "sourcera-evidence-link-"));
  const linkedRelative = "reports/evidence/linked.json";
  const linkedPath = join(fixture.root, linkedRelative);
  const outsidePath = join(outsideRoot, "outside.json");
  try {
    writeFileSync(outsidePath, "{}\n");
    symlinkSync(outsidePath, linkedPath);
    const receipt = cloneForecastReceipt(fixture.receipt);
    for (const observation of receipt.observations) {
      observation.reviewEvidence = linkedRelative;
      observation.runtimeEvidence = linkedRelative;
    }
    writeFileSync(
      join(fixture.root, fixture.forecastPath),
      `${JSON.stringify(receipt)}\n`,
    );

    assert.deepEqual(
      evidenceGroupFindings(fixture.root, {
        kind: "forecast",
        paths: [fixture.forecastPath],
      }).map((finding) => finding.code),
      ["evidence_reference_invalid"],
    );
  } finally {
    rmSync(fixture.root, { recursive: true, force: true });
    rmSync(outsideRoot, { recursive: true, force: true });
  }
});

test("rejects an empty linked runtime receipt", () => {
  const fixture = createForecastFixture();
  const linkedRelative = "reports/evidence/empty-runtime.json";
  try {
    writeFileSync(join(fixture.root, linkedRelative), "{}\n");
    const receipt = cloneForecastReceipt(fixture.receipt);
    receipt.observations[0].runtimeEvidence = linkedRelative;
    writeFileSync(
      join(fixture.root, fixture.forecastPath),
      `${JSON.stringify(receipt)}\n`,
    );

    assert.deepEqual(
      evidenceGroupFindings(fixture.root, {
        kind: "forecast",
        paths: [fixture.forecastPath],
      }).map((finding) => finding.code),
      ["evidence_reference_invalid"],
    );
  } finally {
    rmSync(fixture.root, { recursive: true, force: true });
  }
});

test("rejects an empty linked review receipt", () => {
  const fixture = createForecastFixture();
  const linkedRelative = "reports/evidence/empty-review.json";
  try {
    writeFileSync(join(fixture.root, linkedRelative), "{}\n");
    const receipt = cloneForecastReceipt(fixture.receipt);
    receipt.observations[0].reviewEvidence = linkedRelative;
    writeFileSync(
      join(fixture.root, fixture.forecastPath),
      `${JSON.stringify(receipt)}\n`,
    );

    assert.deepEqual(
      evidenceGroupFindings(fixture.root, {
        kind: "forecast",
        paths: [fixture.forecastPath],
      }).map((finding) => finding.code),
      ["evidence_reference_invalid"],
    );
  } finally {
    rmSync(fixture.root, { recursive: true, force: true });
  }
});

test("rejects a direct review bound to a different batch", () => {
  const fixture = createForecastFixture();
  const linkedRelative = "reports/evidence/mismatched-review.json";
  try {
    const review = JSON.parse(
      JSON.stringify(fixture.reviewReceipts[0]),
    ) as { scope: { closeoutCommit: string } };
    review.scope.closeoutCommit =
      "0123456789abcdef0123456789abcdef01234567";
    writeFileSync(
      join(fixture.root, linkedRelative),
      `${JSON.stringify(review)}\n`,
    );
    const receipt = cloneForecastReceipt(fixture.receipt);
    receipt.observations[0].reviewEvidence = linkedRelative;
    writeFileSync(
      join(fixture.root, fixture.forecastPath),
      `${JSON.stringify(receipt)}\n`,
    );

    assert.deepEqual(
      evidenceGroupFindings(fixture.root, {
        kind: "forecast",
        paths: [fixture.forecastPath],
      }).map((finding) => finding.code),
      ["evidence_reference_invalid"],
    );
  } finally {
    rmSync(fixture.root, { recursive: true, force: true });
  }
});

test("rejects a forecast batch completed before it started", () => {
  const fixture = createForecastFixture();
  try {
    const receipt = cloneForecastReceipt(fixture.receipt);
    receipt.observations[0].completedAt = "2020-01-01T09:00:00Z";
    writeFileSync(
      join(fixture.root, fixture.forecastPath),
      `${JSON.stringify(receipt)}\n`,
    );

    assert.deepEqual(
      evidenceGroupFindings(fixture.root, {
        kind: "forecast",
        paths: [fixture.forecastPath],
      }).map((finding) => finding.code),
      ["evidence_receipt_invalid"],
    );
  } finally {
    rmSync(fixture.root, { recursive: true, force: true });
  }
});

test("rejects active batch time longer than elapsed time", () => {
  const fixture = createForecastFixture();
  try {
    const receipt = cloneForecastReceipt(fixture.receipt);
    receipt.observations[0].activeSeconds = 601;
    const activeSeconds = receipt.observations.reduce(
      (sum, observation) => sum + observation.activeSeconds,
      0,
    );
    const completedEstimate = receipt.observations.reduce(
      (sum, observation) => sum + observation.estimate,
      0,
    );
    receipt.baseline.activeSeconds = activeSeconds;
    receipt.baseline.pointsPerActiveHour = Number(
      (completedEstimate / (activeSeconds / 3600)).toFixed(2),
    );
    writeFileSync(
      join(fixture.root, fixture.forecastPath),
      `${JSON.stringify(receipt)}\n`,
    );

    assert.deepEqual(
      evidenceGroupFindings(fixture.root, {
        kind: "forecast",
        paths: [fixture.forecastPath],
      }).map((finding) => finding.code),
      ["evidence_receipt_invalid"],
    );
  } finally {
    rmSync(fixture.root, { recursive: true, force: true });
  }
});

test("rejects a closeout commit that predates implementation", () => {
  const fixture = createForecastFixture();
  try {
    const receipt = cloneForecastReceipt(fixture.receipt);
    const observation = receipt.observations[1];
    [observation.firstImplementationCommit, observation.closeoutCommit] = [
      observation.closeoutCommit,
      observation.firstImplementationCommit,
    ];
    writeFileSync(
      join(fixture.root, fixture.forecastPath),
      `${JSON.stringify(receipt)}\n`,
    );

    assert.deepEqual(
      evidenceGroupFindings(fixture.root, {
        kind: "forecast",
        paths: [fixture.forecastPath],
      }).map((finding) => finding.code),
      ["evidence_commit_invalid"],
    );
  } finally {
    rmSync(fixture.root, { recursive: true, force: true });
  }
});

test("rejects forecast proof observed before batch completion", () => {
  const fixture = createForecastFixture();
  try {
    const receipt = cloneForecastReceipt(fixture.receipt);
    receipt.observedAt = "2020-01-01T09:00:00Z";
    writeFileSync(
      join(fixture.root, fixture.forecastPath),
      `${JSON.stringify(receipt)}\n`,
    );

    assert.deepEqual(
      evidenceGroupFindings(fixture.root, {
        kind: "forecast",
        paths: [fixture.forecastPath],
      }).map((finding) => finding.code),
      ["evidence_receipt_invalid"],
    );
  } finally {
    rmSync(fixture.root, { recursive: true, force: true });
  }
});

test("rejects proof receipts dated in the future", () => {
  const fixture = createForecastFixture();
  try {
    const receipt = cloneForecastReceipt(fixture.receipt);
    receipt.observedAt = "2999-01-01T00:00:00Z";
    writeFileSync(
      join(fixture.root, fixture.forecastPath),
      `${JSON.stringify(receipt)}\n`,
    );

    assert.deepEqual(
      evidenceGroupFindings(fixture.root, {
        kind: "forecast",
        paths: [fixture.forecastPath],
      }).map((finding) => finding.code),
      ["evidence_receipt_invalid"],
    );
  } finally {
    rmSync(fixture.root, { recursive: true, force: true });
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
  const fixture = createForecastFixture();
  try {
    const receipt: Partial<ForecastReceiptFixture> = cloneForecastReceipt(
      fixture.receipt,
    );
    delete receipt.baseline;
    writeFileSync(
      join(fixture.root, fixture.forecastPath),
      `${JSON.stringify(receipt)}\n`,
    );
    const group: EvidenceGroup = {
      kind: "forecast",
      paths: [fixture.forecastPath],
    };

    assert.deepEqual(
      evidenceGroupFindings(fixture.root, group).map(
        (finding) => finding.code,
      ),
      ["evidence_receipt_invalid"],
    );
  } finally {
    rmSync(fixture.root, { recursive: true, force: true });
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

const CHECKPOINT_METRICS = [
  "activation",
  "completion",
  "timeToValue",
  "abandonment",
  "trust",
  "reliability",
  "support",
] as const;

function createCheckpointRoot(): { root: string; expectedCommit: string } {
  const root = mkdtempSync(join(tmpdir(), "sourcera-checkpoint-evidence-"));
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
  const expectedCommit = execFileSync("git", ["rev-parse", "HEAD"], {
    cwd: root,
    encoding: "utf8",
  }).trim();
  mkdirSync(join(root, "reports", "evidence"), { recursive: true });
  return { root, expectedCommit };
}

function validCheckpointReceipt(
  proofType: CheckpointProofType,
  sourceCommit: string,
): Record<string, unknown> {
  const receipt: Record<string, unknown> = {
    schemaVersion: 1,
    checkpoint: "R0-C8",
    status: "passed",
    proofTypes: [proofType],
    observedAt: "2026-07-15T10:00:00Z",
    sourceCommit,
  };
  if (proofType === "customer" || proofType === "operational") {
    receipt.release = "R0";
    receipt.metrics = Object.fromEntries(
      CHECKPOINT_METRICS.map((metric) => [
        metric,
        { target: "declared", observed: "measured", result: "passed" },
      ]),
    );
    receipt.gate = "passed";
  } else if (proofType === "preview") {
    receipt.preview = {
      targetCommit: sourceCommit,
      targets: [
        {
          provider: "vercel",
          surface: "marketplace",
          providerReceiptId: "dpl_marketplace_preview",
          healthResult: "passed",
        },
        {
          provider: "vercel",
          surface: "buyer",
          providerReceiptId: "dpl_buyer_preview",
          healthResult: "passed",
        },
        {
          provider: "vercel",
          surface: "seller",
          providerReceiptId: "dpl_seller_preview",
          healthResult: "passed",
        },
        {
          provider: "convex",
          surface: "preview",
          providerReceiptId: "convex_preview_receipt",
          healthResult: "passed",
        },
      ],
    };
  } else if (proofType === "runtime") {
    receipt.runtime = {
      environment: "production",
      deploymentReceipts: [
        {
          provider: "vercel",
          providerReceiptId: "dpl_production_receipt",
          sourceCommit,
          healthResult: "passed",
        },
      ],
      runtimeGateReceipts: [
        {
          gateId: "RG:production-closure",
          provider: "github",
          providerReceiptId: "check_run_production_gate",
          sourceCommit,
          result: "passed",
        },
      ],
    };
  } else if (proofType === "rollback") {
    receipt.rollback = {
      fromDeploymentReceiptId: "dpl_candidate_deployment",
      toDeploymentReceiptId: "dpl_known_good_deployment",
      startedAt: "2026-07-15T10:00:00Z",
      completedAt: "2026-07-15T10:01:00Z",
      durationMs: 60_000,
      recoveryHealth: {
        providerReceiptId: "health_check_rollback",
        result: "passed",
      },
    };
  } else {
    receipt.approval = {
      provider: "github",
      providerReceiptId: "github_review_receipt",
      authorId: "release-author-id",
      reviewerId: "release-reviewer-id",
      reviewerKind: "human",
      reviewedAt: "2026-07-15T10:00:00Z",
      findings: [],
      verdict: "approved",
    };
  }
  return receipt;
}

function validateCheckpointReceipt(
  root: string,
  expectedCommit: string,
  proofType: CheckpointProofType,
  receipt: Record<string, unknown>,
): { code: string } | null {
  const path = "reports/evidence/checkpoint.json";
  writeFileSync(join(root, path), `${JSON.stringify(receipt)}\n`);
  return checkpointReceiptFinding({
    root,
    path,
    checkpointId: "R0-C8",
    proofType,
    expectedCommit,
  });
}

test("checkpoint completion rejects generic string evidence", () => {
  const { root, expectedCommit } = createCheckpointRoot();
  try {
    const receipt = {
      schemaVersion: 1,
      checkpoint: "R0-C8",
      status: "passed",
      proofTypes: ["customer"],
      observedAt: "2026-07-15T10:00:00Z",
      sourceCommit: expectedCommit,
      evidence: ["generic string"],
    };
    assert.equal(
      validateCheckpointReceipt(root, expectedCommit, "customer", receipt)
        ?.code,
      "checkpoint_evidence_invalid",
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("checkpoint preview requires all three Vercel surfaces and Convex", () => {
  const { root, expectedCommit } = createCheckpointRoot();
  try {
    const receipt = validCheckpointReceipt("preview", expectedCommit);
    const preview = receipt.preview as { targets: unknown[] };
    preview.targets.pop();
    assert.equal(
      validateCheckpointReceipt(root, expectedCommit, "preview", receipt)
        ?.code,
      "checkpoint_evidence_invalid",
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("checkpoint runtime rejects preview-only deployment proof", () => {
  const { root, expectedCommit } = createCheckpointRoot();
  try {
    const receipt = validCheckpointReceipt("runtime", expectedCommit);
    (receipt.runtime as { environment: string }).environment = "preview";
    assert.equal(
      validateCheckpointReceipt(root, expectedCommit, "runtime", receipt)
        ?.code,
      "checkpoint_evidence_invalid",
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("checkpoint rollback rejects health-only proof without named deployments and timing", () => {
  const { root, expectedCommit } = createCheckpointRoot();
  try {
    const receipt = validCheckpointReceipt("rollback", expectedCommit);
    receipt.rollback = { healthResult: "passed" };
    assert.equal(
      validateCheckpointReceipt(root, expectedCommit, "rollback", receipt)
        ?.code,
      "checkpoint_evidence_invalid",
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("checkpoint approval rejects self-review and agent review", () => {
  for (const [name, approval] of [
    [
      "self",
      {
        provider: "linear",
        providerReceiptId: "linear_approval_receipt",
        authorId: "same-id",
        reviewerId: "same-id",
        reviewerKind: "human",
        reviewedAt: "2026-07-15T10:00:00Z",
        findings: [],
        verdict: "approved",
      },
    ],
    [
      "agent",
      {
        provider: "github",
        providerReceiptId: "github_approval_receipt",
        authorId: "author-id",
        reviewerId: "reviewer-id",
        reviewerKind: "agent",
        reviewedAt: "2026-07-15T10:00:00Z",
        findings: [],
        verdict: "approved",
      },
    ],
  ] as const) {
    const { root, expectedCommit } = createCheckpointRoot();
    try {
      const receipt = validCheckpointReceipt("approval", expectedCommit);
      receipt.approval = approval;
      assert.equal(
        validateCheckpointReceipt(root, expectedCommit, "approval", receipt)
          ?.code,
        "checkpoint_approval_not_independent",
        name,
      );
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  }
});

test("checkpoint proof rejects wrong and unreachable commits", () => {
  const unreachable = "0123456789abcdef0123456789abcdef01234567";
  const { root, expectedCommit } = createCheckpointRoot();
  try {
    const wrong = validCheckpointReceipt("customer", expectedCommit);
    assert.equal(
      validateCheckpointReceipt(root, unreachable, "customer", wrong)?.code,
      "checkpoint_commit_mismatch",
    );

    const unreachableReceipt = validCheckpointReceipt("customer", unreachable);
    assert.equal(
      validateCheckpointReceipt(
        root,
        unreachable,
        "customer",
        unreachableReceipt,
      )?.code,
      "checkpoint_commit_unreachable",
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("accepts the full proof-specific checkpoint receipt set", () => {
  const { root, expectedCommit } = createCheckpointRoot();
  try {
    for (const proofType of [
      "customer",
      "operational",
      "preview",
      "runtime",
      "rollback",
      "approval",
    ] as const) {
      assert.equal(
        validateCheckpointReceipt(
          root,
          expectedCommit,
          proofType,
          validCheckpointReceipt(proofType, expectedCommit),
        ),
        null,
        proofType,
      );
    }
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
