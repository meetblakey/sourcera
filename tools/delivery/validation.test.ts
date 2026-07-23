import { strict as assert } from "node:assert";
import { readFileSync } from "node:fs";
import test from "node:test";

import type { ReleaseDefinition } from "./lib/model.js";
import {
  validationPlanFindings,
  type ValidationPlan,
} from "./lib/validation.js";
import {
  completeValidationPlanFixture,
  F007_JOURNEY_TARGET,
  validationPlanWithF007Target,
} from "./validation-test-fixtures.js";

const releases = (
  JSON.parse(readFileSync("delivery/releases.json", "utf8")) as {
    releases: ReleaseDefinition[];
  }
).releases;

test("rejects placeholder release validation metrics", () => {
  const plan = JSON.parse(
    readFileSync("delivery/validation-plan.json", "utf8"),
  ) as ValidationPlan & {
    releaseValidation: Array<Record<string, unknown>>;
  };
  plan.releaseValidation[0].trust = "TBD";

  assert.ok(
    validationPlanFindings(plan, releases).some((finding) =>
      finding.message.includes("R0 is missing trust"),
    ),
  );
});

test("accepts the exact canonical F-007 R2 journey target", () => {
  const plan = JSON.parse(
    readFileSync("delivery/validation-plan.json", "utf8"),
  ) as ValidationPlan & {
    releaseValidation: Array<Record<string, unknown>>;
  };
  const r2 = plan.releaseValidation.find((row) => row.release === "R2");

  assert.ok(r2);
  assert.equal(plan.schemaVersion, 2);
  assert.deepEqual(r2.journeyTargets, [F007_JOURNEY_TARGET]);
  assert.ok(
    validationPlanFindings(plan, releases).some((finding) =>
      finding.message.includes("F-007 approval is pending"),
    ),
  );
});

test("rejects duplicate journey targets", () => {
  const plan = validationPlanWithF007Target(
    releases.map((release) => release.name),
  ) as ValidationPlan & {
    releaseValidation: Array<Record<string, any>>;
  };
  const r2 = plan.releaseValidation.find((row) => row.release === "R2");
  const r3 = plan.releaseValidation.find((row) => row.release === "R3");
  assert.ok(r2);
  assert.ok(r3);
  r3.journeyTargets.push(JSON.parse(JSON.stringify(F007_JOURNEY_TARGET)));

  assert.ok(
    validationPlanFindings(plan, releases).some((finding) =>
      finding.message.includes(
        "journey target F-007 is duplicated across R2 and R3",
      ),
    ),
  );
});

test("rejects incomplete journey targets", () => {
  const plan = validationPlanWithF007Target(
    releases.map((release) => release.name),
  ) as ValidationPlan & {
    releaseValidation: Array<Record<string, any>>;
  };
  const r2 = plan.releaseValidation.find((row) => row.release === "R2");
  assert.ok(r2);
  delete r2.journeyTargets[0].approval.independentReviewerKeyRef;

  assert.ok(
    validationPlanFindings(plan, releases).some((finding) =>
      finding.message.includes("F-007 approval is incomplete"),
    ),
  );
});

test("rejects malformed journey target thresholds and references", () => {
  const plan = validationPlanWithF007Target(
    releases.map((release) => release.name),
  ) as ValidationPlan & {
    releaseValidation: Array<Record<string, any>>;
  };
  const r2 = plan.releaseValidation.find((row) => row.release === "R2");
  assert.ok(r2);
  r2.journeyTargets[0].metrics[0].thresholds[0].operator = "approximately";
  r2.journeyTargets[0].metrics[0].windows = ["missing_window"];

  const messages = validationPlanFindings(plan, releases).map(
    (finding) => finding.message,
  );
  assert.ok(
    messages.some((message) =>
      message.includes(
        "F-007 metric r2_f007_activation threshold 1 is invalid",
      ),
    ),
  );
  assert.ok(
    messages.some((message) =>
      message.includes(
        "F-007 metric r2_f007_activation references unknown window",
      ),
    ),
  );
});
