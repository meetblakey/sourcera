import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import {
  auditLinearNormalizationPlan,
  type BaselineLossFingerprint,
  type IntentionalBaselineReplacementInput,
  type IntentionalBaselineReplacementRegisterInput,
} from "./lib/linear-normalization-semantic-audit.js";
import { HISTORICAL_NORMALIZATION_SOURCE_MAP_MARKER } from "./lib/linear-normalization-source-map.js";

function exactDescription(): string {
  return [
    "## Outcome",
    "Reject every retired analytics alias before dispatch while preserving canonical events, isolated historical evidence, recovery, rollback, and same-commit proof.",
    "",
    "## Complete behavior and rules",
    "Reject the closed retired-name set before dispatch. A rejected name writes one immutable quarantine result and emits one internal `usage_analytics_alias_retirement_overdue` signal, never a customer event. Canonical names continue through the registered envelope, and active consumers compile canonical names only.",
    "",
    "## States and transitions",
    "A submission reaches exactly one result: `accepted_canonical`, `quarantined_retired_alias`, or `rejected_unregistered_name`. A same-event retry is idempotent, and quarantine never re-enters dispatch.",
    "",
    "## Permissions, isolation, and privacy",
    "Only server emitters may submit analytics. Only the operational analytics role may inspect quarantine metadata. Customer roles cannot discover quarantine rows, and payloads exclude content, identity, free text, tokens, and secrets.",
    "",
    "## Exact paths",
    "- Planned: `packages/analytics/src/retired-event-aliases.ts`",
    "- Planned: `convex/analytics/usageAliasRetirement.ts`",
    "- Planned: `tests/integration/usage-alias-retirement.spec.ts`",
    "- Planned: `reports/evidence/appendix-g-alias-retirement.json`",
    "",
    "## Review and readiness",
    "Independent review must inspect the deny registry, every emitter, every active consumer, privacy allowlists, duplicate suppression, cache recovery, rollback, and the same-commit deployment receipt.",
    "",
    "## Acceptance tests",
    "### Success",
    "Every canonical control dispatches once, every retired name is denied once, active consumers contain canonical names only, and the deployment receipt proves zero customer payload.",
    "",
    "### Failure",
    "A retired or unknown name, wrong mapping, client-forged mode, alias-bearing active query, duplicate quarantine, or mixed cache fails closed and blocks promotion without dispatch.",
    "",
    "### Recovery",
    "Correct the producer or query, keep quarantine immutable, drain only canonical rows, invalidate affected caches, rerun positive and negative probes, and retain a new same-commit receipt.",
    "",
    "## Rollout",
    "Land the shared registry, emitter validator, consumer compiler, and tests together. Prove all cases with synthetic data, canary quarantine, and a commit-bound deployment receipt before expansion.",
    "",
    "## Rollback",
    "Redeploy the last verified canonical emitter and consumer bundle, preserve quarantine, invalidate only affected caches, rerun canonical controls, and keep promotion blocked if no safe bundle exists.",
    "",
    "## Telemetry and notifications",
    "Use only the registered internal `usage_analytics_alias_retirement_overdue` signal with its canonical allowlist and existing routing. Add no inferred customer event, webhook, or notification, and retain bounded recovery and rollback counters.",
    "",
    "## Named proof",
    "Retain `reports/evidence/appendix-g-alias-retirement.json` with source hashes, the exact deny matrix, positive and negative results, privacy assertions, commit, deployment, environment, rollback, reviewer, and timestamp.",
    "",
    "## Assumptions and validation triggers",
    "Historical backfill remains internal and server-authorized. Any change to audience, replay cardinality, payload equivalence, or the closed alias set invalidates the contract and receipt.",
    "",
    "## Exclusions",
    "No customer-facing control, customer notification, automatic alias rewrite, unrelated analytics redesign, source-only readiness, or promotion without deployed emitter and consumer proof.",
    "",
    "## Source provenance",
    "Canonical authority used to build this issue: `Sourcera_Master_Spec.md`, current Appendix G alias-rejection row. The contract above is complete; provenance is change-detection evidence only.",
  ].join("\n");
}

function replaceBody(description: string, heading: string, body: string): string {
  const marker = `${heading}\n`;
  const start = description.indexOf(marker);
  assert.notEqual(start, -1, `missing fixture heading ${heading}`);
  const bodyStart = start + marker.length;
  const nextHeading = description.slice(bodyStart).search(/\n#{2,6}\s+/);
  const bodyEnd = nextHeading < 0 ? description.length : bodyStart + nextHeading;
  return `${description.slice(0, bodyStart)}${body}${description.slice(bodyEnd)}`;
}

function runtimeLaneDescription(
  lane: "product_runtime" | "hybrid" | "static_ci",
  outcome: string,
  paths: string[],
  proofPath: string,
): string {
  let description = replaceBody(exactDescription(), "## Outcome", outcome);
  const behavior = description
    .split("## Complete behavior and rules\n")[1]
    .split("\n\n## States and transitions")[0];
  description = replaceBody(
    description,
    "## Complete behavior and rules",
    `${behavior}\n\nExecute the complete \`${lane}\` path set and fail closed when any exact input, result, or receipt is absent.`,
  );
  description = replaceBody(
    description,
    "## Exact paths",
    paths.map((path) => `- Planned: \`${path}\``).join("\n"),
  );
  description = replaceBody(
    description,
    "## Named proof",
    `Retain \`${proofPath}\` as immutable same-commit proof with exact inputs, results, commit, deployment or protected-CI environment, reviewer, and timestamp.`,
  );
  if (paths.some((path) => path.startsWith("tools/spec-lint/gates/"))) {
    description = replaceBody(
      description,
      "## Telemetry and notifications",
      "Emit only the registered shared PostHog event `spec_lint.appendix_m_gate_run` after the protected result commits, with bounded gate, commit, result, duration, and redacted correlation fields. Send no customer event, webhook, or notification.",
    );
  }
  return description;
}

function plan(description: string, overrides: Record<string, unknown> = {}) {
  return {
    schemaVersion: 1,
    updates: [
      {
        issueId: "PLA-853",
        classification: "runtime_gate",
        source: {
          requirementId: "RG:appendix_g_legacy_alias_retirement_enforced",
          document: "Sourcera_Master_Spec.md",
          section: "line:1",
        },
        after: {
          title: "Appendix G Alias Rejection Enforcement",
          description,
        },
        diagnostics: { requiresReview: false },
        ...overrides,
      },
    ],
  };
}

function codes(description: string, overrides: Record<string, unknown> = {}, root = process.cwd()): string[] {
  return auditLinearNormalizationPlan(plan(description, overrides), { root })
    .issues[0].flags.map((flag) => flag.code);
}

function sha256(value: string): string {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

function exactSlice(source: string, startHeading: string, endHeading: string): string {
  const start = source.indexOf(`${startHeading}\n`);
  const end = source.indexOf(`${endHeading}\n`);
  assert.ok(start >= 0 && end > start);
  return source.slice(start, end);
}

function replacementRow(loss: BaselineLossFingerprint): IntentionalBaselineReplacementInput {
  const replacementPath = "reports/evidence/appendix-g-alias-retirement.json";
  return {
    authorityEvidence: ["Sourcera_Master_Spec.md:1"],
    baselineDescriptionSha256: loss.baselineDescriptionSha256,
    candidateDescriptionSha256: loss.candidateDescriptionSha256,
    dispositions: [
      ...loss.lostPaths.map((path) => ({
        disposition: "planned_path_replaced" as const,
        evidence: ["Current candidate exact-path contract"],
        kind: "path" as const,
        replacement: replacementPath,
        value: path,
      })),
      ...loss.lostTokens.map((token) => ({
        disposition: "preserved_semantically" as const,
        evidence: ["Current candidate complete behavior contract"],
        kind: "token" as const,
        replacement: "canonical names",
        value: token,
      })),
    ],
    issueId: "PLA-853",
    lostPaths: loss.lostPaths,
    lostPathsSha256: loss.lostPathsSha256,
    lostTokens: loss.lostTokens,
    lostTokensSha256: loss.lostTokensSha256,
    rationale: "Current authority replaces the exact residual contract and path set.",
    replacementMap: loss.lostPaths.map((path) => ({
      evidence: ["Current candidate exact-path contract"],
      from: path,
      to: replacementPath,
    })),
  };
}

function replacementRegister(
  row: IntentionalBaselineReplacementInput,
  overrides: Partial<IntentionalBaselineReplacementRegisterInput> = {},
): IntentionalBaselineReplacementRegisterInput {
  return {
    schemaVersion: 1,
    kind: "linear_intentional_baseline_replacements",
    issues: [row],
    ...overrides,
  };
}

test("accepts an exact PLA-853-style contract without treating retired aliases as planning history", () => {
  assert.deepEqual(codes(exactDescription()), []);
});

test("rejects generic outcomes and title-substitution supporting contracts", () => {
  let description = replaceBody(
    exactDescription(),
    "## Outcome",
    "Deliver Appendix G Alias Rejection Enforcement as one complete production behavior with explicit authorization, failure, recovery, rollout, rollback, and same-commit proof.",
  );
  description = replaceBody(
    description,
    "## States and transitions",
    "Appendix G Alias Rejection Enforcement accepts one validated request, then reaches exactly one terminal result: succeeded or failed.",
  );
  const findings = codes(description);
  assert.ok(findings.includes("generic_outcome"));
  assert.ok(findings.includes("generic_supporting_contract"));
});

test("rejects a fragmentary outcome and one-line behavior contract", () => {
  let description = replaceBody(
    exactDescription(),
    "## Outcome",
    "Ensure the reason is included unless the decision is internal.",
  );
  description = replaceBody(
    description,
    "## Complete behavior and rules",
    "Send the required cancellation message and retain the reason when applicable.",
  );
  const findings = codes(description, {
    classification: "feature",
    source: { requirementId: "F-248", document: "Sourcera_Master_Spec.md", section: "line:1" },
    after: { title: "Cancellation Vendor Notifications", description },
  });
  assert.ok(findings.includes("outcome_scope_mismatch"));
  assert.ok(findings.includes("underspecified_behavior_contract"));
});

test("rejects generated lifecycle and delivery boilerplate", () => {
  let description = replaceBody(
    exactDescription(),
    "## States and transitions",
    "No separate lifecycle row is added for Policy-Powered Requirement Generation. An accepted request to `convex/policy-powered-requirement-generation.ts` commits its named result atomically; an invalid request fails closed.",
  );
  description = replaceBody(
    description,
    "## Rollout",
    "Ship `convex/policy-powered-requirement-generation.ts` with its current execution control disabled, pass `tests/integration/policy-powered-requirement-generation.spec.ts` in a production-equivalent environment, enable one authorized synthetic canary, then expand.",
  );
  assert.ok(codes(description).includes("generic_supporting_contract"));
});

test("rejects source-fact wrappers repeated across contract sections", () => {
  const rule = "The engine ingests buyer policy documents and produces structured, traceable, deduplicated requirements.";
  let description = replaceBody(
    exactDescription(),
    "## Outcome",
    `${rule} This is the required policy generation result.`,
  );
  description = replaceBody(
    description,
    "## Complete behavior and rules",
    `${rule} The implementation must preserve this exact rule: ${rule} Validate every named field, value, threshold, actor, and result before side effects.`,
  );
  description = replaceBody(
    description,
    "## States and transitions",
    `This exact rule governs the stored result: ${rule} An accepted request records the rule's named result atomically.`,
  );
  description = replaceBody(
    description,
    "## Permissions, isolation, and privacy",
    `Authorization must preserve this exact rule: ${rule} Only the authorized buyer may execute \`convex/policy.ts\`.`,
  );
  description = replaceBody(
    description,
    "## Review and readiness",
    `The reviewer must prove “${rule}” by inspecting \`convex/policy.ts\`, \`tests/integration/policy.spec.ts\`, and \`reports/evidence/policy.json\` on one commit.`,
  );
  const findings = codes(description);
  assert.ok(findings.includes("generic_outcome"));
  assert.ok(findings.includes("generic_supporting_contract"));
  assert.ok(findings.includes("repeated_source_fragment"));
});

test("rejects source deferrals, including unresolved Appendix lookups", () => {
  const description = replaceBody(
    exactDescription(),
    "## Complete behavior and rules",
    "Reject the closed retired-name set before dispatch and keep quarantine immutable. Retry timing follows Appendix F.1; implementers must read the Master Spec before choosing the retry schedule.",
  );
  assert.ok(codes(description).includes("source_delegation_outside_provenance"));
});

test("accepts code tokens from every slice in an exact verified source bundle", () => {
  const root = mkdtempSync(join(tmpdir(), "sourcera-semantic-bundle-"));
  try {
    const firstStart = "## 1.1 First trusted slice";
    const firstEnd = "## 1.2 Unrelated bridge";
    const secondStart = "## 2.1 Second trusted slice";
    const secondEnd = "## 2.2 End";
    const source = [
      firstStart,
      "`catalog.alpha`, `catalog.beta`, `catalog.gamma`, `catalog.delta`, and `catalog.epsilon` are canonical.",
      firstEnd,
      "This section is intentionally outside the bundle.",
      secondStart,
      "`workflow.alpha`, `workflow.beta`, `workflow.gamma`, `workflow.delta`, `workflow.epsilon`, `workflow.zeta`, `workflow.eta`, `workflow.theta`, `workflow.iota`, and `workflow.kappa` are canonical.",
      secondEnd,
      "Done.",
      "",
    ].join("\n");
    writeFileSync(join(root, "Spec.md"), source);
    const slices = [
      { sourceDoc: "Spec.md", startHeading: firstStart, endHeading: firstEnd },
      { sourceDoc: "Spec.md", startHeading: secondStart, endHeading: secondEnd },
    ];
    const bundleInputs = slices.map((slice) => [
      slice.sourceDoc,
      slice.startHeading,
      slice.endHeading,
      sha256(exactSlice(source, slice.startHeading, slice.endHeading)),
    ]);
    const bundleSha256 = sha256(JSON.stringify([
      "sourcera-ordered-source-bundle-v1",
      bundleInputs,
    ]));
    mkdirSync(join(root, "delivery"));
    writeFileSync(
      join(root, "delivery/ticket-source-checksums.json"),
      JSON.stringify({
        schemaVersion: 2,
        sources: [{ sourceId: "F-TRUSTED", sha256: bundleSha256, slices }],
      }),
    );
    const description = replaceBody(
      exactDescription(),
      "## Complete behavior and rules",
      "Persist `workflow.alpha`, `workflow.beta`, `workflow.gamma`, `workflow.delta`, `workflow.epsilon`, `workflow.zeta`, `workflow.eta`, `workflow.theta`, `workflow.iota`, and `workflow.kappa` as the exact trusted catalog.",
    );
    const findings = codes(description, {
      classification: "feature",
      source: {
        checksumSourceId: "F-TRUSTED",
        document: "Spec.md",
        requirementId: "F-TRUSTED.A",
        section: "§1.1",
        sha256: bundleSha256,
      },
    }, root);
    assert.ok(!findings.includes("cross_section_foreign_tokens"));

    const mismatchedHash = codes(description, {
      classification: "feature",
      source: {
        checksumSourceId: "F-TRUSTED",
        document: "Spec.md",
        requirementId: "F-TRUSTED.A",
        section: "§1.1",
        sha256: sha256("not the verified bundle"),
      },
    }, root);
    assert.ok(mismatchedHash.includes("cross_section_foreign_tokens"));
  } finally {
    rmSync(root, { force: true, recursive: true });
  }
});

test("accepts an exact source-map hash lock for a trusted current contract", () => {
  const root = mkdtempSync(join(tmpdir(), "sourcera-semantic-trusted-"));
  try {
    writeFileSync(
      join(root, "Spec.md"),
      "## 1.1 Owned contract\n`canonical.alpha` and `canonical.beta` are current.\n\n## 1.2 Next\nDone.\n",
    );
    mkdirSync(join(root, "delivery"));
    const priorSha256 = sha256("trusted current contract input");
    writeFileSync(
      join(root, "delivery/linear-normalization-source-map.json"),
      JSON.stringify({
        ...HISTORICAL_NORMALIZATION_SOURCE_MAP_MARKER,
        sources: {},
        trustedDrafts: {
          "PLA-853": {
            descriptionSha256: priorSha256,
            semanticBodySha256: sha256("trusted semantic body"),
            excludedHeadings: [],
          },
        },
      }),
    );
    const description = replaceBody(
      exactDescription(),
      "## Complete behavior and rules",
      "Persist the trusted extension catalog `extension.alpha`, `extension.beta`, `extension.gamma`, `extension.delta`, `extension.epsilon`, `extension.zeta`, `extension.eta`, `extension.theta`, `extension.iota`, and `extension.kappa`.",
    );
    const trusted = codes(description, {
      before: { descriptionSha256: priorSha256 },
      classification: "feature",
      source: { document: "Spec.md", section: "§1.1", requirementId: "F-1" },
    }, root);
    assert.ok(!trusted.includes("cross_section_foreign_tokens"));

    const stale = codes(description, {
      before: { descriptionSha256: sha256("different current contract input") },
      classification: "feature",
      source: { document: "Spec.md", section: "§1.1", requirementId: "F-1" },
    }, root);
    assert.ok(stale.includes("cross_section_foreign_tokens"));
  } finally {
    rmSync(root, { force: true, recursive: true });
  }
});

test("accepts the planner's exact hash-locked rich-current diagnostic shape", () => {
  const root = mkdtempSync(join(tmpdir(), "sourcera-semantic-rich-current-"));
  try {
    writeFileSync(
      join(root, "Spec.md"),
      "## 1.1 Owned contract\n`canonical.alpha` and `canonical.beta` are current.\n\n## 1.2 Next\nDone.\n",
    );
    const description = replaceBody(
      exactDescription(),
      "## Complete behavior and rules",
      "Persist the rich current catalog `current.alpha`, `current.beta`, `current.gamma`, `current.delta`, `current.epsilon`, `current.zeta`, `current.eta`, `current.theta`, `current.iota`, and `current.kappa`.",
    );
    const findings = codes(description, {
      before: { descriptionSha256: sha256("rich current contract input") },
      classification: "feature",
      diagnostics: {
        canonicalSourceExtracted: false,
        genericTemplate: false,
        requiresReview: false,
      },
      source: { document: "Spec.md", section: "§1.1", requirementId: "F-1" },
    }, root);
    assert.ok(!findings.includes("cross_section_foreign_tokens"));
  } finally {
    rmSync(root, { force: true, recursive: true });
  }
});

test("rejects confirmed foreign token clusters from another source section", () => {
  const root = mkdtempSync(join(tmpdir(), "sourcera-semantic-source-"));
  try {
    writeFileSync(
      join(root, "Spec.md"),
      "## 1.1 Owned contract\n`canonical_alpha` and `canonical_beta` are the only values.\n\n## 1.2 Next\nDone.\n",
    );
    const description = replaceBody(
      exactDescription(),
      "## Complete behavior and rules",
      "Persist `billing_admin_action`, `wallet_auto_topup`, `contest_record`, `pricing_table_version`, `trial_state`, `free_allowance_counter`, `billing_seat_snapshot`, `downgrade_bucket`, `pro_trial_grant`, and `organization_plan` as one unrelated catalog.",
    );
    const findings = codes(description, {
      issueId: "PLA-610",
      classification: "feature",
      source: { document: "Spec.md", section: "§1.1", requirementId: "F-1" },
    }, root);
    assert.ok(findings.includes("cross_section_foreign_tokens"));
  } finally {
    rmSync(root, { force: true, recursive: true });
  }
});

test("rejects 240-character importer clipping and empty contract sections", () => {
  let description = replaceBody(
    exactDescription(),
    "## Complete behavior and rules",
    `Reject aliases atomically.\n- ${"a".repeat(IMPORT_CAP)}`,
  );
  description = replaceBody(description, "### Failure", "");
  const findings = codes(description);
  assert.ok(findings.includes("likely_mid_sentence_clipping"));
  assert.ok(findings.includes("empty_required_section"));
});

test("rejects telemetry contradictions and unregistered emitted events", () => {
  let contradictory = replaceBody(
    exactDescription(),
    "## Complete behavior and rules",
    "Reject aliases atomically and emit `workspace.created` exactly once after the committed result.",
  );
  contradictory = replaceBody(
    contradictory,
    "## Telemetry and notifications",
    "This behavior emits no product event, webhook, or notification. Retain bounded logs only.",
  );
  const featureOverride = {
    classification: "feature",
    source: { requirementId: "F-853", document: "Sourcera_Master_Spec.md", section: "line:1" },
  };
  assert.ok(codes(contradictory, featureOverride).includes("telemetry_behavior_contradiction"));

  const unregistered = replaceBody(
    exactDescription(),
    "## Telemetry and notifications",
    "Emit `workspace.created` exactly once with bounded identifiers and retry delivery after failure.",
  );
  assert.ok(codes(unregistered, featureOverride).includes("telemetry_not_registered_or_explicit_none"));

  let runtimeAssertion = replaceBody(
    exactDescription(),
    "## Complete behavior and rules",
    "Fail the gate unless the tested producer emits registered `workspace.created` exactly once after its owning transaction commits.",
  );
  runtimeAssertion = replaceBody(
    runtimeAssertion,
    "## Telemetry and notifications",
    "Use only the registered internal `spec_lint.appendix_m_gate_run` signal for the gate result, with bounded commit, environment, assertion, duration, and redacted correlation fields.",
  );
  assert.ok(!codes(runtimeAssertion).includes("telemetry_behavior_event_missing"));
});

test("does not treat event receipt field names as emission verbs", () => {
  const description = replaceBody(
    exactDescription(),
    "## Complete behavior and rules",
    "Reject the closed retired-name set before dispatch. The event receipt stores `provider_pending` and `emitted_event_ids`; no dispatch occurs until commit. After commit, emit one registered internal `usage_analytics_alias_retirement_overdue` signal and never a customer event.",
  );
  assert.ok(!codes(description).includes("telemetry_behavior_contradiction"));

  const filenameSignal = replaceBody(
    exactDescription(),
    "## Telemetry and notifications",
    "Use registered telemetry signal `policy-powered-requirement-generation.ts` after commit.",
  );
  assert.ok(codes(filenameSignal).includes("telemetry_not_registered_or_explicit_none"));
});

test("rejects planning history, manual identifiers, and copied native relation prose", () => {
  const description = replaceBody(
    exactDescription(),
    "## Complete behavior and rules",
    "Apply the old Phase 14.0.1 brief from `_integration/RECONCILIATION.md`. PLA-123 and D-3.1-024 own the remaining work.\n\nBlocked by: the upstream issue.",
  );
  const findings = codes(description);
  assert.ok(findings.includes("planning_or_version_history"));
  assert.ok(findings.includes("manual_issue_or_source_id"));
  assert.ok(findings.includes("manual_cross_issue_relation_prose"));
});

test("rejects manual assumption tags while preserving their executable rule text", () => {
  const description = replaceBody(
    exactDescription(),
    "## Assumptions and validation triggers",
    "`ASSUMP-F088-011`: retries use the same immutable transition identity and never create a second result.",
  );
  assert.ok(codes(description).includes("manual_issue_or_source_id"));
});

test("rejects missing proof paths and incomplete runtime gate contracts", () => {
  let description = replaceBody(
    exactDescription(),
    "## Exact paths",
    "- Planned: `reports/evidence/appendix-g-alias-retirement.json`",
  );
  description = replaceBody(description, "### Failure", "Fails.");
  const findings = codes(description);
  assert.ok(findings.includes("runtime_gate_incomplete_exact_contract"));

  const mismatch = replaceBody(
    exactDescription(),
    "## Exact paths",
    "- Planned: `packages/analytics/src/retired-event-aliases.ts`\n- Planned: `tests/integration/usage-alias-retirement.spec.ts`",
  );
  assert.ok(codes(mismatch).includes("named_proof_path_missing_from_exact_paths"));
});

test("rejects loss of substantive exact contract tokens from the live baseline", () => {
  const baselineDescription = replaceBody(
    exactDescription(),
    "## Complete behavior and rules",
    [
      "The live contract registers these exact events and preserves them through dispatch:",
      "`buyer_firewall.created`, `buyer_firewall.patched`, `buyer_firewall.reactivated`,",
      "`buyer_firewall.discovered`, `buyer_firewall.delivered`, `buyer_firewall.replayed`,",
      "`buyer_firewall.quarantined`, `buyer_firewall.disabled`, `buyer_firewall.denied`, and `buyer_firewall.recovered`.",
    ].join("\n"),
  );
  const report = auditLinearNormalizationPlan(plan(exactDescription(), {
    classification: "feature",
    source: { requirementId: "F-853", document: "Sourcera_Master_Spec.md", section: "line:1" },
  }), {
    baselineIssues: [{ id: "PLA-853", title: "Appendix G Alias Rejection Enforcement", description: baselineDescription }],
    root: process.cwd(),
  });
  assert.ok(report.issues[0].flags.some((flag) => flag.code === "substantive_contract_token_loss"));
});

test("ignores clipped importer fragments and stale planning metadata during baseline preservation", () => {
  const clipped = `* ${Array.from({ length: 10 }, (_, index) => `\`clipped_rule_${index}\``).join(" ")} ${"x".repeat(78)}`.slice(0, 240);
  const baselineDescription = replaceBody(
    exactDescription(),
    "## Complete behavior and rules",
    [
      clipped,
      "* Runtime readiness requires deployed proof, not documentation or static lint alone.",
      "* Sourcera_Master_Spec.md is authoritative; status is codex-ready.",
      "* https://linear.app/sourcera-production/issue/PLA-999/f-999-stale-source-reference",
    ].join("\n"),
  );
  const report = auditLinearNormalizationPlan(plan(exactDescription()), {
    baselineIssues: [{ id: "PLA-853", title: "Appendix G Alias Rejection Enforcement", description: baselineDescription }],
    root: process.cwd(),
  });
  assert.ok(!report.issues[0].flags.some((flag) => flag.code === "substantive_contract_token_loss"));
});

test("excludes nested non-contract sections from an H1-wrapped baseline exactly once", () => {
  const metadataTokens = Array.from({ length: 20 }, (_, index) => `\`release_snapshot_${index}\``).join(" ");
  const baselineDescription = [
    "# Wrapped issue title",
    "",
    "## Pinned Source",
    metadataTokens,
    "",
    exactDescription(),
  ].join("\n");
  const report = auditLinearNormalizationPlan(plan(exactDescription()), {
    baselineIssues: [{ id: "PLA-853", title: "Appendix G Alias Rejection Enforcement", description: baselineDescription }],
    root: process.cwd(),
  });
  assert.ok(!report.issues[0].flags.some((flag) => flag.code === "substantive_contract_token_loss"));
});

test("does not preserve source hashes, source versions, or legacy artifact identifiers", () => {
  const baselineDescription = replaceBody(
    exactDescription(),
    "## Complete behavior and rules",
    [
      "`sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa` `v7.1.0a`",
      "`r0-f628-a1-service-registry.json` `r5-f999-b2-old-proof` `f-853`",
      "`bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb`",
    ].join(" "),
  );
  const report = auditLinearNormalizationPlan(plan(exactDescription()), {
    baselineIssues: [{ id: "PLA-853", title: "Appendix G Alias Rejection Enforcement", description: baselineDescription }],
    root: process.cwd(),
  });
  assert.ok(!report.issues[0].flags.some((flag) => flag.code === "substantive_contract_token_loss"));
});

test("does not preserve volatile baseline scanner diagnostics for runtime gates", () => {
  const baselineDescription = replaceBody(
    exactDescription(),
    "## Complete behavior and rules",
    "`runtime_active` `deploy_validators` `deploy-validator.yml:missing` `test-strategy.yml:missing` `integration:missing` `analytics:missing` `stamp-gate` `node_modules` are a volatile scanner snapshot.",
  );
  const report = auditLinearNormalizationPlan(plan(exactDescription(), { classification: "runtime_gate" }), {
    baselineIssues: [{ id: "PLA-853", title: "Appendix G Alias Rejection Enforcement", description: baselineDescription }],
    root: process.cwd(),
  });
  assert.ok(!report.issues[0].flags.some((flag) => flag.code === "substantive_contract_token_loss"));
});

test("rejects loss of an exact implementation path from the live baseline", () => {
  const baselineDescription = replaceBody(
    exactDescription(),
    "## Exact paths",
    "- Planned: `packages/analytics/src/retired-event-aliases.ts`\n- Planned: `convex/analytics/usageAliasRetirement.ts`\n- Planned: `tests/integration/usage-alias-retirement.spec.ts`\n- Planned: `reports/evidence/appendix-g-alias-retirement.json`\n- Planned: `tools/analytics/required-alias-probe.ts`",
  );
  const report = auditLinearNormalizationPlan(plan(exactDescription()), {
    baselineIssues: [{ id: "PLA-853", title: "Appendix G Alias Rejection Enforcement", description: baselineDescription }],
    root: process.cwd(),
  });
  assert.ok(report.issues[0].flags.some((flag) => flag.code === "substantive_exact_path_loss"));
});

test("applies an exact digest-locked intentional baseline replacement and exposes its full fingerprint", () => {
  const root = mkdtempSync(join(tmpdir(), "sourcera-semantic-replacement-"));
  try {
    const authority = "Current canonical authority for the intentional replacement.\n";
    writeFileSync(join(root, "Authority.md"), authority);
    let baselineDescription = replaceBody(
      exactDescription(),
      "## Complete behavior and rules",
      [
        "The prior contract required these exact terminal results:",
        "`prior_result_alpha`, `prior_result_bravo`, `prior_result_charlie`, `prior_result_delta`,",
        "`prior_result_echo`, `prior_result_foxtrot`, `prior_result_golf`, `prior_result_hotel`,",
        "`prior_result_india`, and `prior_result_juliet`.",
      ].join("\n"),
    );
    baselineDescription = replaceBody(
      baselineDescription,
      "## Exact paths",
      `${baselineDescription.split("## Exact paths\n")[1].split("\n\n## Review and readiness")[0]}\n- Planned: \`tools/analytics/required-alias-probe.ts\``,
    );
    const featurePlan = plan(exactDescription(), {
      classification: "feature",
      source: { requirementId: "F-853", document: "Missing.md", section: "line:1" },
    });
    const baselineIssues = [{
      id: "PLA-853",
      title: "Appendix G Alias Rejection Enforcement",
      description: baselineDescription,
    }];
    const initial = auditLinearNormalizationPlan(featurePlan, { baselineIssues, root });
    const loss = initial.issues[0].baselineLoss;
    assert.ok(loss);
    assert.deepEqual(loss.lostTokens, [...loss.lostTokens].sort());
    assert.deepEqual(loss.lostPaths, ["tools/analytics/required-alias-probe.ts"]);
    assert.equal(loss.lostTokensSha256, sha256(JSON.stringify(loss.lostTokens)));
    assert.equal(loss.lostPathsSha256, sha256(JSON.stringify(loss.lostPaths)));
    assert.equal(loss.baselineDescriptionSha256, sha256(baselineDescription));
    assert.equal(loss.candidateDescriptionSha256, sha256(exactDescription()));
    assert.equal(loss.substantiveTokenLoss, true);
    assert.equal(loss.substantivePathLoss, true);

    const baselineCaptureSha256 = "a".repeat(64);
    const register = replacementRegister(replacementRow(loss), {
      baselineCaptureSha256,
      sourceDocument: "Authority.md",
      sourceSha256: sha256(authority),
    });
    const accepted = auditLinearNormalizationPlan(featurePlan, {
      baselineCaptureSha256,
      baselineIssues,
      replacementRegister: register,
      root,
    });
    assert.equal(accepted.verdict, "go");
    assert.equal(accepted.replacementRegister.pass, true);
    assert.deepEqual(accepted.replacementRegister.appliedIssueIds, ["PLA-853"]);
    assert.ok(accepted.issues[0].intentionalBaselineReplacement);
    assert.deepEqual(
      accepted.issues[0].intentionalBaselineReplacement?.dispositions,
      register.issues[0].dispositions,
    );
    assert.deepEqual(
      accepted.issues[0].intentionalBaselineReplacement?.replacementMap,
      register.issues[0].replacementMap,
    );
    const dispositionRehashed = auditLinearNormalizationPlan(featurePlan, {
      baselineIssues,
      replacementRegister: replacementRegister({
        ...register.issues[0],
        dispositions: register.issues[0].dispositions.map((item, index) => index === 0
          ? { ...item, evidence: [...item.evidence, "Independent disposition evidence"] }
          : item),
      }),
      root,
    });
    assert.equal(dispositionRehashed.verdict, "go");
    assert.notEqual(
      dispositionRehashed.issues[0].intentionalBaselineReplacement?.rowSha256,
      accepted.issues[0].intentionalBaselineReplacement?.rowSha256,
    );
    const mapRehashed = auditLinearNormalizationPlan(featurePlan, {
      baselineIssues,
      replacementRegister: replacementRegister({
        ...register.issues[0],
        replacementMap: register.issues[0].replacementMap.map((mapping) => ({
          ...mapping,
          evidence: [...mapping.evidence, "Independent path-map evidence"],
        })),
      }),
      root,
    });
    assert.equal(mapRehashed.verdict, "go");
    assert.notEqual(
      mapRehashed.issues[0].intentionalBaselineReplacement?.rowSha256,
      accepted.issues[0].intentionalBaselineReplacement?.rowSha256,
    );
    assert.ok(!accepted.issues[0].flags.some((flag) => flag.code === "substantive_contract_token_loss"));
    assert.ok(!accepted.issues[0].flags.some((flag) => flag.code === "substantive_exact_path_loss"));
  } finally {
    rmSync(root, { force: true, recursive: true });
  }
});

test("an exact replacement suppresses only baseline-loss findings", () => {
  const baselineDescription = replaceBody(
    exactDescription(),
    "## Complete behavior and rules",
    "`one_exact_rule`, `two_exact_rule`, `three_exact_rule`, `four_exact_rule`, `five_exact_rule`, `six_exact_rule`, `seven_exact_rule`, `eight_exact_rule`, `nine_exact_rule`, and `ten_exact_rule` must all commit.",
  );
  const candidate = replaceBody(
    exactDescription(),
    "## Complete behavior and rules",
    `${exactDescription().split("## Complete behavior and rules\n")[1].split("\n\n## States and transitions")[0]} The manual owner is PLA-999.`,
  );
  const featurePlan = plan(candidate, {
    classification: "feature",
    source: { requirementId: "F-853", document: "Missing.md", section: "line:1" },
  });
  const baselineIssues = [{ id: "PLA-853", title: "Appendix G Alias Rejection Enforcement", description: baselineDescription }];
  const initial = auditLinearNormalizationPlan(featurePlan, { baselineIssues, root: process.cwd() });
  const loss = initial.issues[0].baselineLoss;
  assert.ok(loss?.substantiveTokenLoss);
  const audited = auditLinearNormalizationPlan(featurePlan, {
    baselineIssues,
    replacementRegister: replacementRegister(replacementRow(loss)),
    root: process.cwd(),
  });
  assert.equal(audited.replacementRegister.pass, true);
  assert.ok(audited.issues[0].flags.some((flag) => flag.code === "manual_issue_or_source_id"));
  assert.ok(!audited.issues[0].flags.some((flag) => flag.code === "substantive_contract_token_loss"));
  assert.equal(audited.verdict, "no-go");
});

test("records an exact intentional replacement below the blocker-loss threshold", () => {
  const currentBehavior = exactDescription()
    .split("## Complete behavior and rules\n")[1]
    .split("\n\n## States and transitions")[0];
  const baselineDescription = replaceBody(
    exactDescription(),
    "## Complete behavior and rules",
    `${currentBehavior} Historical wording also used \`single_retired_term\`.`,
  );
  const featurePlan = plan(exactDescription(), {
    classification: "feature",
    source: { requirementId: "F-853", document: "Missing.md", section: "line:1" },
  });
  const baselineIssues = [{ id: "PLA-853", title: "Appendix G Alias Rejection Enforcement", description: baselineDescription }];
  const initial = auditLinearNormalizationPlan(featurePlan, { baselineIssues, root: process.cwd() });
  const loss = initial.issues[0].baselineLoss;
  assert.ok(loss);
  assert.deepEqual(loss.lostTokens, ["single_retired_term"]);
  assert.equal(loss.substantiveTokenLoss, false);
  const audited = auditLinearNormalizationPlan(featurePlan, {
    baselineIssues,
    replacementRegister: replacementRegister(replacementRow(loss)),
    root: process.cwd(),
  });
  assert.equal(audited.verdict, "go");
  assert.deepEqual(audited.replacementRegister.appliedIssueIds, ["PLA-853"]);
  assert.ok(audited.issues[0].intentionalBaselineReplacement);
});

test("replacement register mismatches, stale rows, duplicates, and extra rows fail closed", () => {
  let baselineDescription = replaceBody(
    exactDescription(),
    "## Complete behavior and rules",
    "`one_exact_rule`, `two_exact_rule`, `three_exact_rule`, `four_exact_rule`, `five_exact_rule`, `six_exact_rule`, `seven_exact_rule`, `eight_exact_rule`, `nine_exact_rule`, and `ten_exact_rule` must all commit.",
  );
  baselineDescription = replaceBody(
    baselineDescription,
    "## Exact paths",
    `${baselineDescription.split("## Exact paths\n")[1].split("\n\n## Review and readiness")[0]}\n- Planned: \`tools/analytics/required-alias-probe.ts\``,
  );
  const featurePlan = plan(exactDescription(), {
    classification: "feature",
    source: { requirementId: "F-853", document: "Missing.md", section: "line:1" },
  });
  const baselineIssues = [{ id: "PLA-853", title: "Appendix G Alias Rejection Enforcement", description: baselineDescription }];
  const initial = auditLinearNormalizationPlan(featurePlan, { baselineIssues, root: process.cwd() });
  const loss = initial.issues[0].baselineLoss;
  assert.ok(loss?.substantiveTokenLoss);
  const row = replacementRow(loss);
  const invalidRegisters: unknown[] = [
    replacementRegister({ ...row, candidateDescriptionSha256: "0".repeat(64) }),
    replacementRegister({ ...row, lostTokensSha256: "0".repeat(64) }),
    replacementRegister({ ...row, rationale: "" }),
    replacementRegister({ ...row, authorityEvidence: [] }),
    replacementRegister({ ...row, dispositions: row.dispositions.slice(1) }),
    replacementRegister({
      ...row,
      dispositions: [...row.dispositions, {
        disposition: "preserved_semantically",
        evidence: ["Unrelated blanket row"],
        kind: "token",
        replacement: "canonical names",
        value: "extra_loss_item",
      }],
    }),
    replacementRegister({
      ...row,
      dispositions: row.dispositions.map((item, index) => index === 0
        ? { ...item, disposition: "approve_all" as never }
        : item),
    }),
    replacementRegister({
      ...row,
      dispositions: row.dispositions.map((item, index) => index === 0
        ? { ...item, value: "*" }
        : item),
    }),
    replacementRegister({
      ...row,
      dispositions: row.dispositions.map((item) => item.kind === "token" && item.value === row.lostTokens[0]
        ? { ...item, replacement: "definitely_absent_replacement_term" }
        : item),
    }),
    replacementRegister({ ...row, replacementMap: [] }),
    replacementRegister({
      ...row,
      replacementMap: [
        ...row.replacementMap,
        {
          evidence: ["Unregistered extra path mapping"],
          from: "packages/analytics/src/retired-event-aliases.ts",
          to: "reports/evidence/appendix-g-alias-retirement.json",
        },
      ].sort((left, right) => left.from.localeCompare(right.from)),
    }),
    replacementRegister(row, { issues: [row, row] }),
    replacementRegister({ ...row, issueId: "BUY-999" }),
    replacementRegister(row, { sourceDocument: "Missing.md", sourceSha256: "0".repeat(64) }),
    replacementRegister({ ...row, approveAllLostTokens: true } as IntentionalBaselineReplacementInput),
  ];
  for (const register of invalidRegisters) {
    const report = auditLinearNormalizationPlan(featurePlan, {
      baselineIssues,
      replacementRegister: register,
      root: process.cwd(),
    });
    assert.equal(report.verdict, "no-go");
    assert.equal(report.replacementRegister.pass, false);
    assert.deepEqual(report.replacementRegister.appliedIssueIds, []);
    assert.ok(report.replacementRegister.flags.some((flag) => flag.code === "intentional_baseline_replacement_invalid"));
    assert.ok(report.issues[0].flags.some((flag) => flag.code === "substantive_contract_token_loss"));
  }

  const noLoss = auditLinearNormalizationPlan(featurePlan, {
    baselineIssues: [{ id: "PLA-853", title: "Appendix G Alias Rejection Enforcement", description: exactDescription() }],
    root: process.cwd(),
  }).issues[0].baselineLoss;
  assert.ok(noLoss);
  const stale = auditLinearNormalizationPlan(featurePlan, {
    baselineIssues: [{ id: "PLA-853", title: "Appendix G Alias Rejection Enforcement", description: exactDescription() }],
    replacementRegister: replacementRegister(replacementRow(noLoss)),
    root: process.cwd(),
  });
  assert.equal(stale.verdict, "no-go");
  assert.ok(stale.replacementRegister.flags.some((flag) =>
    flag.evidence.some((evidence) => evidence.includes("row is stale"))
  ));

  const scopedNoLoss = auditLinearNormalizationPlan(featurePlan, {
    baselineIssues: [{ id: "PLA-853", title: "Appendix G Alias Rejection Enforcement", description: exactDescription() }],
    replacementRegister: replacementRegister(replacementRow(noLoss)),
    replacementRegisterScope: "matching-losses",
    root: process.cwd(),
  });
  assert.equal(scopedNoLoss.verdict, "go");
  assert.equal(scopedNoLoss.replacementRegister.pass, true);
  assert.deepEqual(scopedNoLoss.replacementRegister.appliedIssueIds, []);
});

test("CLI help documents canonical scoped and explicit strict replacement-register modes", () => {
  const result = spawnSync(
    process.execPath,
    [
      "--import",
      join(
        process.cwd(),
        "tools/spec-lint/node_modules/tsx/dist/loader.mjs",
      ),
      "tools/delivery/audit-linear-normalization-plan.ts",
      "--help",
    ],
    { cwd: process.cwd(), encoding: "utf8" },
  );
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /delivery\/linear-intentional-replacements\.json/);
  assert.match(result.stdout, /scoped to exact token or path losses/);
  assert.match(result.stdout, /deliberately strict/);
});

test("ignores wildcard and directory placeholders when checking exact path preservation", () => {
  const baselineDescription = replaceBody(
    exactDescription(),
    "## Exact paths",
    "- `convex/**`\n- `tests/unit/**`\n- `tests/integration/`\n- `packages/analytics/src/`",
  );
  const report = auditLinearNormalizationPlan(plan(exactDescription()), {
    baselineIssues: [{ id: "PLA-853", title: "Appendix G Alias Rejection Enforcement", description: baselineDescription }],
    root: process.cwd(),
  });
  assert.ok(!report.issues[0].flags.some((flag) => flag.code === "substantive_exact_path_loss"));
});

test("treats a backticked shell command as tokens rather than one exact path", () => {
  const baselineDescription = replaceBody(
    exactDescription(),
    "## Complete behavior and rules",
    "Run `tools/spec-lint/node_modules/.bin/tsx tools/release/stamp_gate.ts --json` and fail closed on a nonzero result.",
  );
  const updated = replaceBody(
    exactDescription(),
    "## Exact paths",
    `${exactDescription().split("## Exact paths\n")[1].split("\n\n## Review and readiness")[0]}\n- \`tools/release/stamp_gate.ts\``,
  );
  const report = auditLinearNormalizationPlan(plan(updated), {
    baselineIssues: [{ id: "PLA-853", title: "Appendix G Alias Rejection Enforcement", description: baselineDescription }],
    root: process.cwd(),
  });
  assert.ok(!report.issues[0].flags.some((flag) => flag.code === "substantive_exact_path_loss"));
});

test("rejects legacy-ID proof paths and does not preserve them from the baseline", () => {
  const legacyPath = "reports/evidence/r4-f628-d4-webhook-firewall.json";
  const baselineDescription = replaceBody(
    exactDescription(),
    "## Exact paths",
    `- Planned: \`${legacyPath}\`\n- Planned: \`convex/schema/<feature>.ts\``,
  );
  const cleanReport = auditLinearNormalizationPlan(plan(exactDescription()), {
    baselineIssues: [{ id: "PLA-853", title: "Appendix G Alias Rejection Enforcement", description: baselineDescription }],
    root: process.cwd(),
  });
  assert.ok(!cleanReport.issues[0].flags.some((flag) => flag.code === "substantive_exact_path_loss"));

  const legacyDescription = replaceBody(
    exactDescription(),
    "## Exact paths",
    `${exactDescription().split("## Exact paths\n")[1].split("\n\n## Review and readiness")[0]}\n- Planned: \`${legacyPath}\``,
  );
  assert.ok(codes(legacyDescription).includes("manual_issue_or_source_id"));
});

test("rejects repeated contract paragraphs across required sections", () => {
  const outcome = exactDescription().split("## Outcome\n")[1].split("\n\n## Complete behavior")[0];
  const description = replaceBody(exactDescription(), "## States and transitions", outcome);
  assert.ok(codes(description).includes("repeated_contract_text"));
});

test("rejects prose delegation to another issue title when native relations exist", () => {
  const description = replaceBody(
    exactDescription(),
    "## Complete behavior and rules",
    "Reject the closed retired-name set before dispatch. The duration benchmark is owned by Phase Duration Benchmarks and is not repeated here. Canonical names continue through the registered envelope.",
  );
  const report = auditLinearNormalizationPlan(plan(description), {
    baselineIssues: [
      { id: "PLA-853", title: "Appendix G Alias Rejection Enforcement", description: exactDescription() },
      { id: "BUY-196", title: "Phase Duration Benchmarks", description: "Current contract" },
    ],
    root: process.cwd(),
  });
  assert.ok(report.issues[0].flags.some((flag) => flag.code === "manual_issue_title_reference"));
});

test("rejects malformed reference remnants and invented provider recovery", () => {
  let description = replaceBody(
    exactDescription(),
    "## Complete behavior and rules",
    "Reject the closed retired-name set before dispatch. Is authoritative. Applies only where is silent. Canonical names continue through the registered envelope.",
  );
  description = replaceBody(
    description,
    "### Recovery",
    "Keep provider dispatch disabled, correct provider credentials and signatures, reconcile the provider receipt, and retry the external adapter.",
  );
  const findings = codes(description);
  assert.ok(findings.includes("malformed_reference_remnant"));
  assert.ok(findings.includes("provider_boundary_invented"));
});

test("rejects generic lifecycle, permission, recovery, rollout, rollback, and proof filler", () => {
  let description = replaceBody(
    exactDescription(),
    "## States and transitions",
    "Alias enforcement introduces no new persisted lifecycle value. The owning operation either commits the named result atomically or returns the bounded denial defined in Complete behavior and rules while leaving state unchanged.",
  );
  description = replaceBody(
    description,
    "## Permissions, isolation, and privacy",
    "Alias enforcement adds no authority grant. Only the already-authorized caller on the owning resource may invoke `convex/alias.ts` after scope resolves.",
  );
  description = replaceBody(
    description,
    "### Recovery",
    "Keep the failed identity closed, correct the rejected input, authority, transition, concurrency, or dependency condition, and replay it.",
  );
  description = replaceBody(
    description,
    "## Rollout",
    "Deploy `convex/alias.ts` behind its existing execution control, enable one synthetic canary, and retain proof before wider execution.",
  );
  description = replaceBody(
    description,
    "## Rollback",
    "Disable new execution through `convex/alias.ts`, restore the last verified compatible handler, and preserve committed data.",
  );
  description = replaceBody(
    description,
    "## Named proof",
    "Retain `reports/evidence/appendix-g-alias-retirement.json` with immutable inputs, result, timestamp, environment, commit, and trace correlation.",
  );
  assert.ok(codes(description).includes("generic_supporting_contract"));
});

test("rejects vague failure and permissions contracts plus an unresolved bounded denial", () => {
  let description = replaceBody(
    exactDescription(),
    "## Complete behavior and rules",
    "Produce useful structured requirements for the buyer.",
  );
  description = replaceBody(
    description,
    "## States and transitions",
    "The operation returns the bounded denial defined in Complete behavior and rules while leaving state unchanged.",
  );
  description = replaceBody(
    description,
    "## Permissions, isolation, and privacy",
    "The append-only Score history stores prior grades for audit.",
  );
  description = replaceBody(description, "### Failure", "Mistakes can produce a poor customer decision.");
  const findings = codes(description);
  assert.ok(findings.includes("failure_contract_not_executable"));
  assert.ok(findings.includes("permissions_contract_not_executable"));
  assert.ok(findings.includes("unresolved_bounded_denial"));

  const dataRuleOnly = replaceBody(
    exactDescription(),
    "## Permissions, isolation, and privacy",
    "`Score.individual_grades_jsonb` is Buyer data. Prior entries are never mutated or deleted.",
  );
  assert.ok(codes(dataRuleOnly).includes("permissions_contract_not_executable"));

  for (const permission of [
    "A seller-console token outside the owning organization must return HTTP 404 without object-existence disclosure.",
    "A third-party Org must get HTTP 404 and no row data.",
    "The Buyer-console projection must not expose seller-private fields to public or anonymous actors.",
    "Every call requires the separate Ops tenant, hardware-key step-up, an active same-Organization OpsSession, and the exact action capability. Customer tokens may never grant Ops authority.",
    "All calls use the separate Ops tenant, hardware-key step-up, trusted device, active matching OpsSession, domain capability, and residency clearance. Direct cross-domain mutation is forbidden.",
    "Customer GET requires current Workspace membership. Customer DELETE requires workspace_owner, current step-up authentication, and same-Organization buyer-console context; wrong scope returns HTTP 404.",
  ]) {
    const actorBound = replaceBody(exactDescription(), "## Permissions, isolation, and privacy", permission);
    assert.ok(!codes(actorBound).includes("permissions_contract_not_executable"), permission);
  }

  const riskOnly = replaceBody(
    exactDescription(),
    "### Failure",
    "Invitation mistakes can expose data or admit the wrong vendor.",
  );
  assert.ok(codes(riskOnly).includes("failure_contract_not_executable"));
});

test("accepts reversal as an executable recovery condition", () => {
  const description = replaceBody(
    exactDescription(),
    "### Recovery",
    "No re-drive is possible until disqualification is reversed; after reversal, retry the same immutable identity and verify the retained receipt.",
  );
  assert.ok(!codes(description).includes("recovery_contract_not_executable"));
});

test("rejects a checklist label in place of an executable review contract", () => {
  const description = replaceBody(
    exactDescription(),
    "## Review and readiness",
    "Provider contract and sandbox tests. Security and observability checks.",
  );
  const findings = codes(description);
  assert.ok(findings.includes("generic_supporting_contract"));
  assert.ok(findings.includes("review_contract_not_executable"));
});

test("rejects UI scope without UI paths and customer delivery hidden by no-notification telemetry", () => {
  let description = replaceBody(
    exactDescription(),
    "## Complete behavior and rules",
    "Render a responsive buyer layout with breadcrumbs, keyboard focus, and a primary button. Send `workspace_canceled` to vendors by email after commit.",
  );
  description = replaceBody(
    description,
    "## Telemetry and notifications",
    "This behavior emits no product analytics event, webhook, or customer notification.",
  );
  const findings = codes(description, {
    classification: "feature",
    source: { requirementId: "F-853", document: "Sourcera_Master_Spec.md", section: "line:1" },
  });
  assert.ok(findings.includes("ui_scope_missing_exact_paths"));
  assert.ok(findings.includes("telemetry_behavior_contradiction"));
});

test("rejects a customer-delivery claim contradicted by the telemetry section", () => {
  let description = replaceBody(
    exactDescription(),
    "## Complete behavior and rules",
    "Deliver a customer email after the owning transaction commits.",
  );
  description = replaceBody(
    description,
    "## Telemetry and notifications",
    "This behavior sends no customer email.",
  );
  assert.ok(codes(description).includes("telemetry_delivery_contradiction"));
});

test("rejects local assumption tags and copied native blocker prose", () => {
  let description = replaceBody(
    exactDescription(),
    "## Assumptions and validation triggers",
    "`A-SETTINGS-01`: one schema remains active until its replacement is approved.",
  );
  description = replaceBody(
    description,
    "## Review and readiness",
    "Named independent reviewer capacity must be assigned natively before readiness; this is a blocker.",
  );
  const findings = codes(description);
  assert.ok(findings.includes("manual_issue_or_source_id"));
  assert.ok(findings.includes("manual_cross_issue_relation_prose"));
});

test("rejects manual acceptance-row and release-history prose", () => {
  let description = replaceBody(
    exactDescription(),
    "## Complete behavior and rules",
    "Reject the alias under AC 7 and lifecycle row 7. The retained wording from the R2 pilot remains authoritative for dispatch.",
  );
  let findings = codes(description);
  assert.ok(findings.includes("planning_or_version_history"));

  description = replaceBody(
    exactDescription(),
    "## Complete behavior and rules",
    "This is an outcome parent created during source repair; the Linear publication keeps the prior contract intact.",
  );
  findings = codes(description);
  assert.ok(findings.includes("planning_or_version_history"));

  description = replaceBody(
    exactDescription(),
    "## Rollout",
    "Land the source repair and positive and negative fixtures first, then enable the guarded runtime after approval.",
  );
  findings = codes(description);
  assert.ok(!findings.includes("planning_or_version_history"));

  description = replaceBody(
    exactDescription(),
    "## Review and readiness",
    "Runtime implementation remains unready until handlers, integration tests, and deployed probes independently prove the contract.",
  );
  findings = codes(description);
  assert.ok(!findings.includes("planning_or_version_history"));

  description = replaceBody(
    exactDescription(),
    "## Review and readiness",
    "This issue remains Backlog until a reviewer is assigned.",
  );
  findings = codes(description);
  assert.ok(findings.includes("planning_or_version_history"));
});

test("rejects known sanitization fragments and unresolved contract placeholders", () => {
  let description = replaceBody(
    exactDescription(),
    "## Complete behavior and rules",
    "Deliver Deliver the registry using an Controlled Vocabulary against a entity. The output is registered in and owned by –.",
  );
  let findings = codes(description);
  assert.ok(findings.includes("malformed_reference_remnant"));

  description = replaceBody(
    exactDescription(),
    "## Complete behavior and rules",
    "The named implementation path renders the relevant anatomy and the applicable existing control validates it.",
  );
  findings = codes(description);
  assert.ok(findings.includes("unresolved_contract_placeholder"));

  description = replaceBody(
    exactDescription(),
    "## Complete behavior and rules",
    "Source approval, exact registry updates, runtime tests, and the named runtime proof are required before emission.",
  );
  findings = codes(description);
  assert.ok(!findings.includes("unresolved_contract_placeholder"));
});

test("rejects vague named results, responses, scopes, and bounded-behavior filler", () => {
  const placeholders = [
    "The operation records the named result atomically.",
    "The handler returns its named response to the named channel.",
    "The policy enforces the exact named scope for the named lifecycle.",
    "This is the bounded behavior being delivered.",
  ];
  for (const placeholder of placeholders) {
    const description = replaceBody(exactDescription(), "## Complete behavior and rules", placeholder);
    assert.ok(codes(description).includes("unresolved_contract_placeholder"), placeholder);
  }
});

test("requires an exact proof file before allowing a named runtime proof reference", () => {
  let description = replaceBody(
    exactDescription(),
    "## Complete behavior and rules",
    "Source approval, exact registry updates, runtime tests, and the named runtime proof are required before emission.",
  );
  description = replaceBody(
    description,
    "## Named proof",
    "Retain `reports/evidence/` with exact inputs, result, environment, commit, reviewer, and timestamp.",
  );
  assert.ok(codes(description).includes("unresolved_contract_placeholder"));
});

test("rejects generic atomic-product fallback prose and retired titles", () => {
  const generic = replaceBody(
    exactDescription(),
    "## Complete behavior and rules",
    "Deliver Workspace Owner Role as one atomic product contract. Validate inputs before mutation, persist only a complete valid result, keep retries idempotent, and expose a bounded failure without partial state.",
  );
  assert.ok(codes(generic).includes("generic_supporting_contract"));

  const staleTitles = [
    "Evaluation Lead Role",
    "Evaluator Role",
    "Scorer Role",
    "Seller Team Owner Role",
    "Pipeline Phase Mapping Correction",
    "Data Residency & Compliance Roadmap",
    "Known Limitations & Phase 2 Roadmap",
  ];
  for (const title of staleTitles) {
    const report = auditLinearNormalizationPlan({
      updates: [{
        issueId: "PLA-853",
        classification: "feature",
        after: { title, description: exactDescription() },
      }],
    }, { root: process.cwd() });
    assert.ok(report.issues[0].flags.some((flag) => flag.code === "stale_or_retired_title"), title);
  }

  const manualSectionTitle = auditLinearNormalizationPlan({
    updates: [{
      issueId: "PLA-853",
      classification: "feature",
      after: { title: "Enforce every §44.1 budget", description: exactDescription() },
    }],
  }, { root: process.cwd() });
  assert.ok(manualSectionTitle.issues[0].flags.some((flag) => flag.code === "manual_source_reference_in_title"));
});

test("rejects a live product outcome proved only by spec tooling", () => {
  let description = replaceBody(
    exactDescription(),
    "## Outcome",
    "Enforce a live HTTP 429 response on every throttled Buyer Inbox mutation without committing duplicate side effects.",
  );
  description = replaceBody(
    description,
    "## Complete behavior and rules",
    "The deployed mutation handler returns HTTP 429 before a database write when the caller exceeds its exact limit; accepted requests commit once.",
  );
  description = replaceBody(
    description,
    "## Exact paths",
    "- `tools/spec-lint/runtime_test.ts`\n- `tests/fixtures/runtime/fail.json`\n- `reports/evidence/runtime-test.json`",
  );
  description = replaceBody(
    description,
    "## Named proof",
    "Retain `reports/evidence/runtime-test.json` with the observed result, commit, environment, trace, reviewer, and timestamp.",
  );
  const findings = codes(description, {
    classification: "feature",
    source: { requirementId: "F-999", document: "Sourcera_Master_Spec.md", section: "line:1" },
  });
  assert.ok(findings.includes("runtime_outcome_has_spec_only_proof"));

  const withProductPath = replaceBody(
    description,
    "## Exact paths",
    "- `convex/inbox/mutate.ts`\n- `tests/integration/inbox-mutation.spec.ts`\n- `reports/evidence/runtime-test.json`",
  );
  assert.ok(!codes(withProductPath, {
    classification: "feature",
    source: { requirementId: "F-999", document: "Sourcera_Master_Spec.md", section: "line:1" },
  }).includes("runtime_outcome_has_spec_only_proof"));

  const sourceOnly = replaceBody(
    description,
    "## Complete behavior and rules",
    "This is a complete source-authoring proposal and is not current runtime authority until canonical approval. The proposed deployed mutation returns HTTP 429 before a write; no runtime implementation path is in scope.",
  );
  assert.ok(!codes(sourceOnly, {
    classification: "feature",
    source: { requirementId: "F-999", document: "Sourcera_Master_Spec.md", section: "line:1" },
  }).includes("runtime_outcome_has_spec_only_proof"));
});

test("rejects legacy source-history and Linear control-plane execution prose", () => {
  let description = replaceBody(
    exactDescription(),
    "## Complete behavior and rules",
    "Per this prompt, the V4 closure carries a stale v6 draft into the current handler. Canonical events remain unchanged.",
  );
  assert.ok(codes(description).includes("source_history_or_control_plane_prose"));

  description = replaceBody(
    exactDescription(),
    "## Review and readiness",
    "Runtime completion is routed through tools/delivery/graph.test.ts and the Linear readback instead of product proof.",
  );
  assert.ok(codes(description).includes("source_history_or_control_plane_prose"));
  assert.ok(!codes(exactDescription()).includes("source_history_or_control_plane_prose"));
});

test("rejects malformed fragments left by stripped source references", () => {
  let description = replaceBody(
    exactDescription(),
    "## Complete behavior and rules",
    "The operational rule lives in. Completion means / can proceed, and tco\\percentile remains the submitted field.",
  );
  assert.ok(codes(description).includes("malformed_stripped_fragment"));

  description = replaceBody(
    exactDescription(),
    "## Complete behavior and rules",
    "The validator accepts the exact inline pattern `/\\{\\{\\s*solo\\.(per_eval\\|per_bid)_price_cents\\s*\\|\\s*currency\\s*\\}\\}/` and rejects every out-of-scope match before mutation.",
  );
  assert.ok(!codes(description).includes("malformed_stripped_fragment"));

  description = replaceBody(
    exactDescription(),
    "## Complete behavior and rules",
    "The terminal write emits exactly one `growth_loop_l1_kb_seed_failed`, keyed by `growth_loop_execution_id`, and never writes `growth_loop_l1_kb_seeded` for a rejected settlement.",
  );
  assert.ok(!codes(description).includes("malformed_stripped_fragment"));
});

test("rejects authority that contradicts the actors promised by the outcome", () => {
  let description = replaceBody(
    exactDescription(),
    "## Outcome",
    "Let Buyers and Sellers use one public Vendor Marketplace without cross-organization disclosure.",
  );
  description = replaceBody(
    description,
    "## Permissions, isolation, and privacy",
    "Only the authenticated Buyer Workspace actor may execute the marketplace route. Wrong-organization and public writes are denied without revealing object existence.",
  );
  assert.ok(codes(description).includes("authority_scope_contradiction"));

  description = replaceBody(
    description,
    "## Permissions, isolation, and privacy",
    "Only authenticated Buyer and Seller actors may mutate their scoped records; public callers may read the redacted projection. Wrong-organization writes are denied without revealing object existence.",
  );
  assert.ok(!codes(description).includes("authority_scope_contradiction"));
});

test("does not treat Buyer-only scenario subjects as Seller authority", () => {
  let description = replaceBody(
    exactDescription(),
    "## Outcome",
    "Let an authenticated Buyer Workspace owner create and recalculate one Buyer-only Evaluation Scenario without exposing it across consoles.",
  );
  description = replaceBody(
    description,
    "## Complete behavior and rules",
    "The scenario stores `excluded_vendor_ids` and `ranked_vendors`. Vendors may appear as ranked or excluded comparison subjects, but this grants no Seller actor a read, write, or execution capability. The Buyer owner validates weights, persists one scenario version, and recalculates its result atomically.",
  );
  description = replaceBody(
    description,
    "## Permissions, isolation, and privacy",
    "Only the authenticated Buyer Workspace owner may create, edit, or recalculate the Evaluation Scenario. Seller-console, cross-workspace, and wrong-organization requests are denied without revealing object existence.",
  );
  assert.ok(!codes(description).includes("authority_scope_contradiction"));
});

test("rejects a founder and Ops metric restricted to Seller execution", () => {
  let description = replaceBody(
    exactDescription(),
    "## Outcome",
    "Publish the magic-link-to-first-response p50 and p90 metric on the founder dashboard.",
  );
  description = replaceBody(
    description,
    "## Complete behavior and rules",
    "Measure the elapsed minutes from a Seller magic-link click to the first submitted requirement response. The completed metric must be surfaced in the founder dashboard and Ops Console with the same bounded cohort and percentile calculation.",
  );
  description = replaceBody(
    description,
    "## Permissions, isolation, and privacy",
    "Only an authenticated Seller Org actor may perform the underlying response mutation; this grants no dashboard access. Only the system transaction may set the elapsed metric. Only the Ops growth role and founder leadership may read the internal dashboard. Wrong-organization, wrong-console, and unauthorized callers are denied without revealing object existence.",
  );
  assert.ok(codes(description).includes("authority_scope_contradiction"));
});

test("rejects an Ops taxonomy workflow restricted to Buyer execution", () => {
  let description = replaceBody(
    exactDescription(),
    "## Outcome",
    "Implement a fail-closed taxonomy draft, review, publish, deprecate, successor, and rollback workflow for authorized Ops operators.",
  );
  description = replaceBody(
    description,
    "## Complete behavior and rules",
    "Ops clones the active taxonomy row into a draft, validates structural fields, publishes the successor, and preserves immutable rollback proof. Customer workspaces never author platform taxonomy rows.",
  );
  description = replaceBody(
    description,
    "## Permissions, isolation, and privacy",
    "Only the authenticated Buyer Workspace actor may execute the taxonomy authoring route. Wrong-organization, wrong-console, and unauthorized callers are denied without revealing object existence.",
  );
  assert.ok(codes(description).includes("authority_scope_contradiction"));
});

test("rejects a no-event claim followed by a product-event catalog", () => {
  let description = replaceBody(
    exactDescription(),
    "## Telemetry and notifications",
    "This delivery emits no product event, sends no webhook, and delivers no customer notification.\n\nAll rows use event family `marketplace` and sampling `1.0`.\n\n- `marketplace_search_submitted`; sampling `1.0`; idempotency `(search_attempt_id,event_name)`.",
  );
  assert.ok(codes(description).includes("telemetry_no_event_contradiction"));

  description = replaceBody(
    exactDescription(),
    "## Telemetry and notifications",
    "This source-only change emits no product event. Proposed future event family `marketplace` and sampling remain disabled until source approval.",
  );
  assert.ok(!codes(description).includes("telemetry_no_event_contradiction"));
});

test("rejects one generic implementation and test path for a cross-surface outcome", () => {
  let description = replaceBody(
    exactDescription(),
    "## Outcome",
    "Enforce vendor suppression across all 17 public surfaces, routes, feeds, and webhooks.",
  );
  description = replaceBody(
    description,
    "## Exact paths",
    "- `convex/vendorSuppression.ts`\n- `tests/integration/vendor-suppression.spec.ts`\n- `reports/evidence/vendor-suppression.json`",
  );
  description = replaceBody(
    description,
    "## Named proof",
    "Retain `reports/evidence/vendor-suppression.json` with every surface result, commit, environment, reviewer, and timestamp.",
  );
  assert.ok(codes(description, { classification: "feature" }).includes("cross_surface_single_path_proof"));

  description = replaceBody(
    description,
    "## Exact paths",
    "- `convex/vendorSuppression.ts`\n- `apps/marketplace/lib/vendor-suppression.ts`\n- `tests/integration/vendor-suppression.spec.ts`\n- `tests/e2e/vendor-suppression.spec.ts`\n- `reports/evidence/vendor-suppression.json`",
  );
  assert.ok(!codes(description, { classification: "feature" }).includes("cross_surface_single_path_proof"));
});

test("rejects a promised catalog or workflow with missing enumerated rows", () => {
  let description = replaceBody(
    exactDescription(),
    "## Outcome",
    "Deliver a recommended six-section RFP contract with one closed structure.",
  );
  description = replaceBody(
    description,
    "## Complete behavior and rules",
    "- Requirements\n- Scoring\n- Appendices",
  );
  assert.ok(codes(description).includes("enumerated_contract_missing_catalog"));

  description = replaceBody(
    description,
    "## Complete behavior and rules",
    "1. Requirements\n2. Scoring\n3. Demonstrations\n4. References\n5. Security\n6. Appendices",
  );
  assert.ok(!codes(description).includes("enumerated_contract_missing_catalog"));
});

test("counts exact inline enumerations carried by the contract", () => {
  let description = replaceBody(
    exactDescription(),
    "## Outcome",
    "Deliver the Buyer Solo four-step compression contract with one canonical surface mapping.",
  );
  description = replaceBody(
    description,
    "## Complete behavior and rules",
    "The Buyer console four-step progress bar renders as Setup → Define → Score → Decide. Each named step owns one contiguous phase range and no fifth step may render.",
  );
  assert.ok(!codes(description).includes("enumerated_contract_missing_catalog"));

  description = replaceBody(
    description,
    "## Outcome",
    "Deliver a complete six-section RFP contract with one closed structure.",
  );
  description = replaceBody(
    description,
    "## Complete behavior and rules",
    "The six sections are Requirements, Scoring, Demonstrations, References, Security, and Appendices. Each section is required exactly once.",
  );
  assert.ok(!codes(description).includes("enumerated_contract_missing_catalog"));
});

test("does not treat numeric ranges, thresholds, cardinality, anchors, or referenced titles as catalog promises", () => {
  const outcomes = [
    "Enforce the onboarding Minutes 0–3 step 5 outage substitution without changing any other sequencer line.",
    "Emit the upgrade signal only after at least 3 events in a rolling 30-day window per organization and console.",
    "Persist exactly one event per mutation and reject an orphan event before deployment.",
    "Require Principle 9 to resolve to `#3.13-principle-9-surface-simplicity-engine-complexity` and reject every alias anchor.",
    "Keep Seller Onboarding — Seven-Stage Flow as a cited title while this gate owns only the staleness classifier window.",
  ];
  for (const outcome of outcomes) {
    const description = replaceBody(exactDescription(), "## Outcome", outcome);
    assert.ok(
      !codes(description).includes("enumerated_contract_missing_catalog"),
      outcome,
    );
  }
});

test("keeps genuine incomplete operation catalogs and named workflows blocking", () => {
  let description = replaceBody(
    exactDescription(),
    "## Outcome",
    "Deliver a seven-stage seller onboarding workflow with exact transition ownership.",
  );
  description = replaceBody(
    description,
    "## Complete behavior and rules",
    "The workflow defines invitation, bootstrap, and activation but carries no remaining stage rows.",
  );
  assert.ok(codes(description).includes("enumerated_contract_missing_catalog"));

  description = replaceBody(
    description,
    "## Outcome",
    "Require the Buyer Console permission matrix operation-by-operation for every mutation.",
  );
  description = replaceBody(
    description,
    "## Complete behavior and rules",
    "The matrix covers workspace lifecycle generally but carries no exact operation rows.",
  );
  assert.ok(codes(description).includes("enumerated_contract_missing_catalog"));
});

test("rejects empty headings, orphan numbers, and incomplete numbered sequences", () => {
  let description = replaceBody(
    exactDescription(),
    "## Complete behavior and rules",
    "4. Crawl the target.\n1. Validate authority.\n3. Publish the result.\n\n3.",
  );
  assert.ok(codes(description).includes("invalid_section_structure"));

  description = description.replace(
    "## States and transitions",
    "## Dashboard\n\n## Tracing\n\n## States and transitions",
  );
  assert.ok(codes(description).includes("invalid_section_structure"));
});

test("rejects runtime behavior proved only by spec-lint Markdown fixtures", () => {
  let description = replaceBody(
    exactDescription(),
    "## Outcome",
    "Require every deployed Inbox mutation endpoint to return HTTP 409 on same-key different-body replay without committing a write.",
  );
  description = replaceBody(
    description,
    "## Complete behavior and rules",
    "The deployed mutation endpoint must reject a conflicting Idempotency-Key before any persistence, audit, event, or job side effect.",
  );
  description = replaceBody(
    description,
    "## Exact paths",
    "- `tools/spec-lint/gates/inbox_idempotency.ts`\n- `tools/spec-lint/fixtures/inbox_idempotency/pass.md`\n- `tools/spec-lint/fixtures/inbox_idempotency/fail.md`\n- `reports/evidence/inbox-idempotency.json`",
  );
  description = replaceBody(
    description,
    "## Named proof",
    "Retain `reports/evidence/inbox-idempotency.json` with fixture results, commit, environment, reviewer, and timestamp.",
  );
  assert.ok(codes(description).includes("runtime_behavior_spec_fixture_only"));

  description = replaceBody(
    description,
    "## Exact paths",
    "- `convex/inbox/mutate.ts`\n- `tests/integration/inbox-idempotency.spec.ts`\n- `tools/spec-lint/gates/inbox_idempotency.ts`\n- `tools/spec-lint/fixtures/inbox_idempotency/pass.md`\n- `tools/spec-lint/fixtures/inbox_idempotency/fail.md`\n- `reports/evidence/inbox-idempotency.json`",
  );
  assert.ok(!codes(description).includes("runtime_behavior_spec_fixture_only"));
});

test("recognizes exact product-runtime, hybrid, and static-CI path shapes", () => {
  const productProof = "reports/evidence/team_solo_transition-runtime-proof.json";
  const productRuntime = runtimeLaneDescription(
    "product_runtime",
    "Require the deployed team-transition handler to reject a Solo transition while another active member remains.",
    [
      "convex/team-solo-transition-block.ts",
      "tests/integration/team-solo-transition-block.spec.ts",
      ".github/workflows/app-ci.yml",
      ".github/workflows/test-strategy.yml",
      productProof,
    ],
    productProof,
  );
  assert.ok(!codes(productRuntime).includes("runtime_gate_incomplete_exact_contract"));
  assert.ok(!codes(productRuntime).includes("runtime_behavior_spec_fixture_only"));

  const hybridProof = "reports/evidence/legal_entity_residency_change-runtime-proof.json";
  const hybrid = runtimeLaneDescription(
    "hybrid",
    "Require the deployed legal-entity residency handler and its protected production probe to reject revenue leakage before commit.",
    [
      "convex/deploy_validators/legal_entity_residency_change_revenue_leak_test.ts",
      "tools/spec-lint/gates/legal_entity_residency_change_revenue_leak_test.ts",
      "tests/integration/legal_entity_residency_change_revenue_leak_test.spec.ts",
      "synthetics/legal-entity-residency-change-revenue-leak.ts",
      "tools/spec-lint/fixtures/legal_entity_residency_change_revenue_leak_test/pass.md",
      "tools/spec-lint/fixtures/legal_entity_residency_change_revenue_leak_test/fail.md",
      ".github/workflows/app-ci.yml",
      ".github/workflows/deploy-validator.yml",
      ".github/workflows/production-release.yml",
      ".github/workflows/test-strategy.yml",
      hybridProof,
    ],
    hybridProof,
  );
  assert.ok(!codes(hybrid).includes("runtime_gate_incomplete_exact_contract"));
  assert.ok(!codes(hybrid).includes("runtime_behavior_spec_fixture_only"));

  const staticProof = "reports/evidence/residency_replication-runtime-proof.json";
  const staticCi = runtimeLaneDescription(
    "static_ci",
    "Reject a Terraform residency-replication policy that permits an unapproved region before protected deployment CI passes.",
    [
      "infra/terraform/modules/residency-replication/main.tf",
      "tests/integration/s3-replication-policy-residency-bound.spec.ts",
      ".github/workflows/app-ci.yml",
      ".github/workflows/deploy-validator.yml",
      staticProof,
    ],
    staticProof,
  );
  assert.ok(!codes(staticCi).includes("runtime_gate_incomplete_exact_contract"));
});

test("tracks Terraform and synthetic probe paths without accepting either as product-runtime proof", () => {
  const terraformPath = "infra/terraform/modules/residency-replication/main.tf";
  const syntheticPath = "synthetics/legal-entity-residency-change-revenue-leak.ts";
  const baselineDescription = replaceBody(
    exactDescription(),
    "## Exact paths",
    [
      exactDescription().split("## Exact paths\n")[1].split("\n\n## Review and readiness")[0],
      `- Planned: \`${terraformPath}\``,
      `- Planned: \`${syntheticPath}\``,
    ].join("\n"),
  );
  const lossReport = auditLinearNormalizationPlan(plan(exactDescription()), {
    baselineIssues: [{ id: "PLA-853", title: "Appendix G Alias Rejection Enforcement", description: baselineDescription }],
    root: process.cwd(),
  });
  assert.deepEqual(lossReport.issues[0].baselineLoss?.lostPaths, [terraformPath, syntheticPath]);
  assert.ok(lossReport.issues[0].flags.some((flag) => flag.code === "substantive_exact_path_loss"));

  const proofPath = "reports/evidence/probe_only-runtime-proof.json";
  const probeOnly = runtimeLaneDescription(
    "product_runtime",
    "Require every deployed Inbox mutation endpoint to return HTTP 409 on same-key different-body replay without committing a write.",
    [
      terraformPath,
      syntheticPath,
      "tools/spec-lint/fixtures/inbox_idempotency/pass.md",
      "tools/spec-lint/fixtures/inbox_idempotency/fail.md",
      proofPath,
    ],
    proofPath,
  );
  const findings = codes(probeOnly);
  assert.ok(findings.includes("runtime_behavior_spec_fixture_only"));
  assert.ok(findings.includes("runtime_gate_incomplete_exact_contract"));

  const probeAsProof = replaceBody(
    probeOnly,
    "## Named proof",
    `Retain \`${syntheticPath}\` with commit, deployment environment, reviewer, and timestamp.`,
  );
  assert.ok(codes(probeAsProof).includes("runtime_gate_incomplete_exact_contract"));
});

test("does not infer Seller authority from a denied Seller-console subject", () => {
  let description = replaceBody(
    exactDescription(),
    "## Outcome",
    "Ensure a Use Case create request resolves its Buyer Workspace, copies the parent organization, and rejects cross-organization or Seller-console writes with HTTP 404.",
  );
  description = replaceBody(
    description,
    "## Permissions, isolation, and privacy",
    "Only the authenticated Buyer Workspace actor may create a Use Case. Cross-organization, Seller-console, and unauthorized writes are denied with HTTP 404 before row lookup.",
  );
  const feature = {
    classification: "feature",
    source: { requirementId: "F-411", document: "Sourcera_Master_Spec.md", section: "line:1" },
    after: { title: "Use Case Entity", description },
  };
  assert.ok(!codes(description, feature).includes("authority_scope_contradiction"));
});

test("accepts reference-data orchestration tools only with executable integration proof and a production receipt", () => {
  let description = replaceBody(
    exactDescription(),
    "## Outcome",
    "Ensure the deployed reference-data orchestration handler returns one verified result after canonical template publication.",
  );
  description = replaceBody(
    description,
    "## Complete behavior and rules",
    "The runtime handler invokes only the canonical authoring API, persists no direct registry write, and returns the committed canonical version after verification.",
  );
  description = replaceBody(
    description,
    "## Exact paths",
    [
      "- `tools/reference-data-orchestration/canonical-client.ts`",
      "- `tools/reference-data-orchestration/template-lane.ts`",
      "- `tests/integration/reference-data-template-lane.spec.ts`",
      "- `reports/evidence/reference-data-template-lane-proof.json`",
    ].join("\n"),
  );
  description = replaceBody(
    description,
    "## Named proof",
    "Retain `reports/evidence/reference-data-template-lane-proof.json` as the immutable production receipt with commit, deployment, environment, canonical result, canary, reviewer, and timestamp.",
  );
  const feature = {
    classification: "feature",
    source: { requirementId: "F-952", document: "delivery/planning-source-register.md", section: "line:1" },
    after: { title: "Execute the Buyer-template registry lane through canonical controls", description },
  };
  assert.ok(!codes(description, feature).includes("runtime_outcome_has_spec_only_proof"));

  let passiveOnly = replaceBody(
    description,
    "## Exact paths",
    [
      "- `tools/reference-data-orchestration/canonical-client.ts`",
      "- `tests/fixtures/reference-data-template-lane.json`",
      "- `reports/evidence/reference-data-template-lane-proof.json`",
    ].join("\n"),
  );
  assert.ok(codes(passiveOnly, {
    ...feature,
    after: { title: feature.after.title, description: passiveOnly },
  }).includes("runtime_outcome_has_spec_only_proof"));

  const weakReceipt = replaceBody(
    description,
    "## Named proof",
    "Retain `reports/evidence/reference-data-template-lane-proof.json` with a local fixture checksum only.",
  );
  assert.ok(codes(weakReceipt, {
    ...feature,
    after: { title: feature.after.title, description: weakReceipt },
  }).includes("runtime_outcome_has_spec_only_proof"));
});

test("recognizes approved executable test homes while keeping fixtures passive", () => {
  const homes = [
    "property", "security", "mobile", "workers", "middleware", "openapi", "observability", "billing", "ui",
  ];
  for (const home of homes) {
    let description = replaceBody(
      exactDescription(),
      "## Outcome",
      "Require the deployed mutation endpoint to return HTTP 409 on a conflicting replay without committing a write.",
    );
    description = replaceBody(
      description,
      "## Exact paths",
      [
        "- `tools/spec-lint/gates/runtime_replay.ts`",
        "- `tools/spec-lint/fixtures/runtime_replay/pass.md`",
        "- `tools/spec-lint/fixtures/runtime_replay/fail.md`",
        `- \`tests/${home}/runtime-replay.spec.ts\``,
        "- `reports/evidence/runtime-replay.json`",
      ].join("\n"),
    );
    assert.ok(
      !codes(description).includes("runtime_behavior_spec_fixture_only"),
      home,
    );
  }

  for (const passivePath of [
    "tests/fixtures/runtime-replay.spec.ts",
    "tests/security/runtime-replay.md",
  ]) {
    let description = replaceBody(
      exactDescription(),
      "## Outcome",
      "Require the deployed mutation endpoint to return HTTP 409 on a conflicting replay without committing a write.",
    );
    description = replaceBody(
      description,
      "## Exact paths",
      [
        "- `tools/spec-lint/gates/runtime_replay.ts`",
        "- `tools/spec-lint/fixtures/runtime_replay/pass.md`",
        "- `tools/spec-lint/fixtures/runtime_replay/fail.md`",
        `- \`${passivePath}\``,
        "- `reports/evidence/runtime-replay.json`",
      ].join("\n"),
    );
    assert.ok(codes(description).includes("runtime_behavior_spec_fixture_only"), passivePath);
  }
});

test("does not classify internal performance targets or pattern mappings as standalone UI", () => {
  let performance = replaceBody(
    exactDescription(),
    "## States and transitions",
    "PostHog funnel query p95 is at most 30 seconds. Event ingest, dashboard freshness, and customer-surface render budgets retain their dedicated performance-target rows.",
  );
  const featureSource = {
    classification: "feature",
    source: { requirementId: "F-537", document: "Sourcera_Master_Spec.md", section: "line:1" },
  };
  assert.ok(!codes(performance, {
    ...featureSource,
    after: { title: "Performance Targets", description: performance },
  }).includes("ui_scope_missing_exact_paths"));

  let mapping = replaceBody(
    exactDescription(),
    "## Complete behavior and rules",
    "Map every feature to its primary interaction pattern, keyboard-shortcut policy, optimistic-mutation policy, and mobile translation. Primary patterns include Dashboard and KPI Cards.",
  );
  assert.ok(!codes(mapping, {
    ...featureSource,
    after: { title: "Pattern-to-Feature Mapping", description: mapping },
  }).includes("ui_scope_missing_exact_paths"));

  let realUi = replaceBody(
    exactDescription(),
    "## Outcome",
    "Render a Buyer-facing Performance Targets dashboard page with one responsive visual state.",
  );
  realUi = replaceBody(
    realUi,
    "## Complete behavior and rules",
    "The dashboard page renders the current p95 cards, preserves keyboard focus, and exposes an accessible error state.",
  );
  assert.ok(codes(realUi, {
    ...featureSource,
    after: { title: "Performance Targets Dashboard", description: realUi },
  }).includes("ui_scope_missing_exact_paths"));
});

test("requires explicit event context for capability, tool, error, and retry identifiers", () => {
  let tool = replaceBody(
    exactDescription(),
    "## Complete behavior and rules",
    "Deliver MCP Tool `kb_dedupe_check` as an idempotent Seller operation with one stored result.",
  );
  tool = replaceBody(
    tool,
    "## Telemetry and notifications",
    "Signal basis — the exact tool value is `always_allow`. This delivery emits no product event, sends no webhook, and delivers no customer notification.",
  );
  const featureSource = {
    classification: "feature",
    source: { requirementId: "F-105", document: "Sourcera_Master_Spec.md", section: "line:1" },
  };
  const toolCodes = codes(tool, featureSource);
  assert.ok(!toolCodes.includes("telemetry_behavior_contradiction"));
  assert.ok(!toolCodes.includes("telemetry_not_registered_or_explicit_none"));

  let capability = replaceBody(
    exactDescription(),
    "## Complete behavior and rules",
    "Deliver the `page_enrichment` capability with the `seller_page_enrichment_provider` retry policy and the `page_enrichment_failed` error.",
  );
  capability = replaceBody(
    capability,
    "## Telemetry and notifications",
    "The registered product signal is `capability_requires_plan_upgrade`; it fires once after the owning transaction commits.",
  );
  const capabilityCodes = codes(capability, featureSource);
  assert.ok(!capabilityCodes.includes("telemetry_behavior_event_missing"));
  assert.ok(!capabilityCodes.includes("telemetry_not_registered_or_explicit_none"));

  let explicitEvent = replaceBody(
    exactDescription(),
    "## Complete behavior and rules",
    "Emit the registered product event `page_enrichment_completed` once after the owning transaction commits.",
  );
  explicitEvent = replaceBody(
    explicitEvent,
    "## Telemetry and notifications",
    "The registered product event is `page_enrichment_completed`; it fires once after the owning transaction commits.",
  );
  const eventCodes = codes(explicitEvent, featureSource);
  assert.ok(!eventCodes.includes("telemetry_behavior_event_missing"));
  assert.ok(!eventCodes.includes("telemetry_not_registered_or_explicit_none"));
});

const IMPORT_CAP = 240;
