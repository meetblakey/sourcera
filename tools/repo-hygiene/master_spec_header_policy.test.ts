import { strict as assert } from "node:assert";
import { readFileSync } from "node:fs";
import test from "node:test";

import { masterSpecHeaderPolicyFindings } from "./master_spec_header_policy.js";

test("rejects copied live-count families in the active header", () => {
  const copiedCounts = [
    "The live scanner reports 0 open P0.",
    "The stamp gate parses 547 runtime rows.",
    "The stamp gate parses 333 `runtime_active` rows.",
    "There are 212 product/runtime blockers.",
    "The blocker count is 212.",
  ];

  for (const copiedCount of copiedCounts) {
    assert.deepEqual(
      masterSpecHeaderPolicyFindings(
        `# Sourcera\n\n${copiedCount}\n\n# Changelog {#changelog}\n`,
      ),
      ["Master Spec active header copies volatile release counts"],
      copiedCount,
    );
  }
});

test("rejects the backlog index as active-header authority", () => {
  assert.deepEqual(
    masterSpecHeaderPolicyFindings(
      [
        "# Sourcera",
        "",
        "`_audit/V711_BACKLOG_INDEX.md` is the current count-routing authority.",
        "",
        "# Changelog {#changelog}",
      ].join("\n"),
    ),
    [
      "Master Spec active header treats _audit/V711_BACKLOG_INDEX.md as current authority",
    ],
  );
});

test("allows dated counts and backlog-index history after the changelog", () => {
  assert.deepEqual(
    masterSpecHeaderPolicyFindings(
      [
        "# Sourcera",
        "",
        "Read live status from the scanners at use time.",
        "",
        "# Changelog {#changelog}",
        "",
        "## v7.1.0a — 2026-07-09",
        "The scanner reported 0 open P0 and 547 runtime rows.",
        "`_audit/V711_BACKLOG_INDEX.md` was the current authority at this dated boundary.",
      ].join("\n"),
    ),
    [],
  );
});

test("runs focused repo-hygiene tests in required CI", () => {
  const workflow = readFileSync(".github/workflows/repo-hygiene.yml", "utf8");

  assert.match(
    workflow,
    /node --import \.\/tools\/spec-lint\/node_modules\/tsx\/dist\/loader\.mjs --test tools\/repo-hygiene\/\*\.test\.ts/,
  );
});
