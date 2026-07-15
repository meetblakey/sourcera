import { strict as assert } from "node:assert";
import { readFileSync } from "node:fs";
import test from "node:test";

import type { ReleaseDefinition } from "./lib/model.js";
import {
  validationPlanFindings,
  type ValidationPlan,
} from "./lib/validation.js";

test("rejects placeholder release validation metrics", () => {
  const plan = JSON.parse(
    readFileSync("delivery/validation-plan.json", "utf8"),
  ) as ValidationPlan & {
    releaseValidation: Array<Record<string, unknown>>;
  };
  const releases = (
    JSON.parse(readFileSync("delivery/releases.json", "utf8")) as {
      releases: ReleaseDefinition[];
    }
  ).releases;
  plan.releaseValidation[0].trust = "TBD";

  assert.deepEqual(
    validationPlanFindings(plan, releases).map((finding) => finding.code),
    ["validation_plan_invalid"],
  );
});
