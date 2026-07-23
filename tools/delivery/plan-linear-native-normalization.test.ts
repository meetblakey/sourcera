import { strict as assert } from "node:assert";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { auditLinearNormalizationPlan } from "./lib/linear-normalization-semantic-audit.js";
import { HISTORICAL_NORMALIZATION_SOURCE_MAP_MARKER } from "./lib/linear-normalization-source-map.js";

interface PlannedUpdate {
  issueId: string;
  classification: string;
  source: {
    requirementId: string | null;
    checksumSourceId: string | null;
    document?: string | null;
    section?: string | null;
  };
  before: { title: string };
  after: { title: string; description: string };
  nativeRelations: {
    blockedBy: string[];
    blocks: string[];
    relatedTo: string[];
  };
  diagnostics: {
    genericTemplate: boolean;
    canonicalSourceExtracted: boolean;
    requiresReview: boolean;
  };
}

interface Plan {
  schemaVersion: number;
  summary: {
    inputIssues: number;
    selectedIssues: number;
    plannedUpdates: number;
    plannedDeletions: number;
    genericTemplates: number;
    byClassification: Record<string, number>;
    qualityGates: {
      validatedDescriptions: number;
      malformedProse: number;
      malformedProofPaths: number;
      planningProvenance: number;
      repeatedContractProse: number;
      duplicateOutcomes: number;
    };
  };
  updates: PlannedUpdate[];
  deletions: Array<{
    issueId: string;
    linearId: string;
    action: "delete_issue";
    reason: string;
    requiresUserConfirmation: true;
  }>;
}

function runPlanner(
  issues: unknown,
  extraArguments: string[] = [],
  sourceMapOverride?: unknown,
  targetIds?: string[],
) {
  const directory = mkdtempSync(join(tmpdir(), "sourcera-native-normalization-"));
  const output = join(directory, "plan.json");
  const targets = join(directory, "targets.json");
  const sourceMapDirectory = sourceMapOverride === undefined
    ? null
    : mkdtempSync(join(process.cwd(), "reports/delivery/.normalization-source-map-test-"));
  const sourceMap = sourceMapDirectory ? join(sourceMapDirectory, "source-map.json") : "";
  const sourceMapArguments = sourceMapOverride === undefined
    ? []
    : ["--source-map", sourceMap];
  if (sourceMapOverride !== undefined) {
    writeFileSync(sourceMap, JSON.stringify(sourceMapOverride));
  }
  if (targetIds !== undefined) writeFileSync(targets, JSON.stringify(targetIds));
  const result = spawnSync(
    process.execPath,
    [
      "--import",
      "./tools/spec-lint/node_modules/tsx/dist/loader.mjs",
      "tools/delivery/plan-linear-native-normalization.ts",
      "--out",
      output,
      ...sourceMapArguments,
      ...(targetIds === undefined ? [] : ["--targets", targets]),
      ...extraArguments,
    ],
    {
      cwd: process.cwd(),
      encoding: "utf8",
      input: JSON.stringify(issues),
    },
  );
  const plan = existsSync(output)
    ? JSON.parse(readFileSync(output, "utf8")) as Plan
    : null;
  rmSync(directory, { recursive: true, force: true });
  if (sourceMapDirectory) rmSync(sourceMapDirectory, { recursive: true, force: true });
  return { result, plan };
}

function digest(value: string): string {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

function trustedSemanticBody(description: string, excludedHeadings: string[]): string {
  const excluded = new Set(excludedHeadings);
  const output: string[] = [];
  let sawSection = false;
  let keep = false;
  for (const line of description.split(/\r?\n/)) {
    const heading = /^(#{1,6})\s+(.+?)\s*$/.exec(line);
    if (heading?.[1].length === 1) continue;
    if (heading?.[1].length === 2) {
      sawSection = true;
      keep = !excluded.has(heading[2].trim());
    }
    if (sawSection && keep) output.push(line.trimEnd());
  }
  return output.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

function runTrustedDraftFixture(
  description: string,
  contract: {
    descriptionSha256: string;
    semanticBodySha256: string;
    excludedHeadings: string[];
  },
) {
  const root = mkdtempSync(join(tmpdir(), "sourcera-trusted-draft-"));
  try {
    mkdirSync(join(root, "delivery"), { recursive: true });
    writeFileSync(
      join(root, "delivery/linear-runtime-path-registry.json"),
      readFileSync("delivery/linear-runtime-path-registry.json", "utf8"),
    );
    writeFileSync(join(root, "manifest.json"), JSON.stringify({ rows: [] }));
    writeFileSync(join(root, "checksums.json"), JSON.stringify({ sources: [] }));
    writeFileSync(join(root, "source-map.json"), JSON.stringify({
      ...HISTORICAL_NORMALIZATION_SOURCE_MAP_MARKER,
      sources: {},
      trustedDrafts: { "PLA-3107": contract },
      oversizedOrCrossCutting: [],
      extractionPolicy: {},
    }));
    return runPlanner(
      [{
        id: "trusted-draft",
        identifier: "PLA-3107",
        title: "Persist capability declaration",
        description,
      }],
      [
        "--root", root,
        "--manifest", "manifest.json",
        "--checksums", "checksums.json",
        "--source-map", "source-map.json",
      ],
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

const canonicalHeadings = [
  "## Outcome",
  "## Complete behavior and rules",
  "## States and transitions",
  "## Permissions, isolation, and privacy",
  "## Exact paths",
  "## Review and readiness",
  "## Acceptance tests",
  "### Success",
  "### Failure",
  "### Recovery",
  "## Rollout",
  "## Rollback",
  "## Telemetry and notifications",
  "## Named proof",
  "## Assumptions and validation triggers",
  "## Exclusions",
  "## Source provenance",
];

test("plans native, self-contained normalization for every issue class", () => {
  const issues = [
    {
      id: "linear-feature-id",
      identifier: "PLA-1018",
      title: "[F-003.C] Enforce console query scope",
      description: [
        "# [F-003.C] Enforce console query scope",
        "## Pinned Source",
        "Source family: PLA-219 / F-003",
        "## Complete behavior and rules",
        "Reject seller-console reads from buyer-console routes before any data is returned.",
        "## Delivery",
        "Team: Platform",
        "Project: Identity",
        "Release: R0",
        "Parent: PLA-203",
        "Blocked by: PLA-219 / F-002",
        "Exact paths: `convex/**`",
        "Legacy issue PLA-12 was canceled.",
        "https://linear.app/sourcera-production/issue/PLA-219",
      ].join("\n"),
      relations: { blockedBy: [], blocks: [], relatedTo: [] },
    },
    {
      id: "linear-runtime-id",
      identifier: "PLA-804",
      title: "[Runtime gate] Accessibility settings preference contract",
      description: "Prove the preference persists and invalid values fail closed.",
    },
    {
      id: "linear-parent-id",
      identifier: "BUY-186",
      title: "[Delivery group] Buyer Workspaces & Evaluation Pipeline",
      description: "Coordinates the buyer evaluation outcome.",
      children: [{ identifier: "BUY-192" }],
    },
    {
      id: "linear-decision-id",
      identifier: "PLA-895",
      title: "[Decision] Reconcile release truth",
      description: "Choose one release header and record the validation result.",
    },
  ];

  const { result, plan } = runPlanner(issues);
  assert.equal(result.status, 0, result.stderr);
  assert.ok(plan);
  assert.equal(plan.schemaVersion, 1);
  assert.deepEqual(plan.summary, {
    inputIssues: 4,
    selectedIssues: 4,
    plannedUpdates: 4,
    plannedDeletions: 0,
    genericTemplates: 3,
    byClassification: {
      decision: 1,
      delivery_parent: 1,
      feature: 1,
      runtime_gate: 1,
    },
    qualityGates: {
      validatedDescriptions: 4,
      malformedProse: 0,
      malformedProofPaths: 0,
      planningProvenance: 0,
      repeatedContractProse: 0,
      duplicateOutcomes: 0,
    },
  });

  const byId = new Map(plan.updates.map((update) => [update.issueId, update]));
  const feature = byId.get("PLA-1018");
  assert.ok(feature);
  assert.equal(feature.classification, "feature");
  assert.equal(feature.before.title, "[F-003.C] Enforce console query scope");
  assert.equal(feature.after.title, "Enforce console query scope");
  assert.equal(feature.source.requirementId, "F-003.C");
  assert.equal(feature.source.checksumSourceId, "F-003");
  assert.deepEqual(feature.nativeRelations.blockedBy, ["PLA-219"]);
  assert.equal(feature.diagnostics.genericTemplate, false);
  assert.equal(feature.diagnostics.canonicalSourceExtracted, true);
  assert.match(
    feature.after.description,
    /Reject seller-console reads from buyer-console routes before any data is returned\./,
  );

  for (const heading of canonicalHeadings) {
    assert.match(feature.after.description, new RegExp(`^${heading.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "m"));
  }
  assert.doesNotMatch(
    feature.after.description,
    /\b(?:PLA|BUY|SEL|INT)-\d+\b|\bF-(?:AE-)?\d+|linear\.app|<issue\b|\blegacy\b|\bcancel(?:ed|led) issue\b/i,
  );
  assert.doesNotMatch(
    feature.after.description,
    /^(?:[-*+]\s+)?(?:Team|Project|Release|Parent|Owner|Assignee|Estimate|Priority|Labels|Status|State|Cycle|Due date|Source family)\s*:/im,
  );
  const exactPaths = feature.after.description
    .split("## Exact paths\n")[1]
    .split("\n## Review and readiness")[0];
  assert.doesNotMatch(exactPaths, /\*|\/$/m);

  assert.equal(byId.get("PLA-804")?.classification, "runtime_gate");
  assert.equal(byId.get("BUY-186")?.classification, "delivery_parent");
  assert.equal(byId.get("PLA-895")?.classification, "decision");
});

test("keeps Evaluation Scenario on the current scoring and TCO contract", () => {
  const { result, plan } = runPlanner([{
    id: "evaluation-scenario",
    identifier: "BUY-212",
    title: "[F-090] Evaluation Scenario Entity",
    description: [
      "## Complete behavior and rules",
      "Legacy operational-load parameters include user_count, concurrent_users, and transactions_per_day.",
      "## Permissions, isolation, and privacy",
      "Only an unrelated Ops actor may mutate it.",
    ].join("\n"),
  }]);

  assert.equal(result.status, 0, result.stderr);
  assert.ok(plan);
  const description = plan.updates[0].after.description;
  assert.match(description, /weight_overrides|rubric_overrides/);
  assert.match(description, /tco_value_weight/);
  assert.match(description, /does not accept operational-capacity parameters/i);
  assert.doesNotMatch(description, /`user_count`|`concurrent_users`|`transactions_per_day`/i);
  assert.doesNotMatch(description, /retired in v4|stale v6 draft|closure of p0/i);
});

test("uses full issue context while planning only an explicit target allowlist", () => {
  const relatedTitle = "Publish Immutable Pricing Versions and Reproducible Rate Cards";
  const { result, plan } = runPlanner(
    [
      {
        id: "target-linear-id",
        identifier: "PLA-3100",
        title: "Enforce pricing publication ordering",
        description: `${relatedTitle} (PLA-3101) must land first.`,
        relations: { blockedBy: [{ identifier: "PLA-3101" }] },
      },
      {
        id: "context-linear-id",
        identifier: "PLA-3101",
        title: relatedTitle,
        description: "Publish immutable pricing data.",
      },
    ],
    [],
    undefined,
    ["PLA-3100"],
  );

  assert.equal(result.status, 0, result.stderr);
  assert.ok(plan);
  assert.equal(plan.summary.inputIssues, 2);
  assert.equal(plan.summary.selectedIssues, 1);
  assert.deepEqual(plan.updates.map(({ issueId }) => issueId), ["PLA-3100"]);
  assert.doesNotMatch(plan.updates[0].after.description, /PLA-3101/);
  assert.doesNotMatch(plan.updates[0].after.description, new RegExp(relatedTitle));
  assert.match(plan.updates[0].after.description, /native blocked-by relation/);
});

test("fails closed when a target is absent from the full issue input", () => {
  const { result, plan } = runPlanner(
    [{
      id: "target-linear-id",
      identifier: "PLA-3100",
      title: "Enforce pricing publication ordering",
      description: "Enforce one bounded publication result.",
    }],
    [],
    undefined,
    ["PLA-3999"],
  );

  assert.notEqual(result.status, 0);
  assert.equal(plan, null);
  assert.match(result.stderr, /targets are absent from stdin: PLA-3999/);
});

test("preserves short domain terms that are also native relation titles", () => {
  const { result, plan } = runPlanner(
    [
      {
        id: "target-linear-id",
        identifier: "PLA-3100",
        title: "Enforce workspace routing",
        description: "Bid Workspace (PLA-3101) is the bounded routing destination.",
        relations: { relatedTo: [{ identifier: "PLA-3101" }] },
      },
      {
        id: "context-linear-id",
        identifier: "PLA-3101",
        title: "Bid Workspace",
        description: "Create the bounded workspace.",
      },
    ],
    [],
    undefined,
    ["PLA-3100"],
  );

  assert.equal(result.status, 0, result.stderr);
  assert.ok(plan);
  assert.match(plan.updates[0].after.description, /Bid Workspace/);
  assert.doesNotMatch(plan.updates[0].after.description, /PLA-3101/);
});

test("fails closed when a selected native relation endpoint is absent from full input", () => {
  const { result, plan } = runPlanner(
    [{
      id: "target-linear-id",
      identifier: "PLA-3100",
      title: "Enforce pricing publication ordering",
      description: "Publish Immutable Pricing Versions and Reproducible Rate Cards must land first.",
      relations: { blockedBy: [{ identifier: "PLA-3999" }] },
    }],
    [],
    undefined,
    ["PLA-3100"],
  );

  assert.notEqual(result.status, 0);
  assert.equal(plan, null);
  assert.match(result.stderr, /selected native relation endpoints are absent from stdin: PLA-3100->PLA-3999/);
});

test("fails closed when a normalized body retains an unresolved marker", () => {
  const { result, plan } = runPlanner([{
    id: "unresolved-linear-id",
    identifier: "PLA-3100",
    title: "Enforce pricing publication ordering",
    description: "TODO: decide the publication ordering.",
  }]);

  assert.notEqual(result.status, 0);
  assert.equal(plan, null);
  assert.match(result.stderr, /unresolved marker/i);
});

test("preserves product-record supersession language", () => {
  const { result, plan } = runPlanner([{
    id: "selection-report-versioning",
    identifier: "PLA-3109",
    title: "Version signed selection reports",
    description: [
      "## Outcome",
      "Version signed selection reports without mutating an accepted record.",
      "## Complete behavior and rules",
      "A correction creates a new finalized report that supersedes the prior report. The prior signed report and its receipt remain immutable, and only the latest approved version may advance.",
      "## States and transitions",
      "A draft may finalize once, then an approved correction creates a separately versioned successor.",
      "## Permissions, isolation, and privacy",
      "Only an authorized reviewer in the owning organization may approve the successor; every other caller receives a non-revealing denial.",
      "## Exact paths",
      "- `convex/selection-report-versioning.ts`",
      "- `tests/integration/selection-report-versioning.spec.ts`",
      "## Review and readiness",
      "Review the immutable prior row, successor link, authorization denial, replay result, and same-commit proof.",
      "## Acceptance tests",
      "### Success",
      "The authorized correction creates one successor and leaves the prior signed bytes unchanged.",
      "### Failure",
      "An unauthorized, stale, or duplicate correction fails before any write.",
      "### Recovery",
      "Correct the rejected input and retry with the same idempotency identity.",
      "## Rollout",
      "Canary one synthetic correction before wider execution.",
      "## Rollback",
      "Disable new corrections and preserve every committed report and receipt.",
      "## Telemetry and notifications",
      "Record bounded versioning outcomes without customer content; emit no customer notification.",
      "## Named proof",
      "Retain `reports/evidence/selection-report-versioning-proof.json` with commit, result, reviewer, and rollback evidence.",
      "## Assumptions and validation triggers",
      "A changed report schema or approval rule invalidates the proof and requires review.",
      "## Exclusions",
      "This issue excludes score mutation, manual production edits, and unrelated report delivery.",
    ].join("\n\n"),
  }]);

  assert.equal(result.status, 0, result.stderr);
  assert.ok(plan);
  assert.match(plan.updates[0].after.description, /supersedes the prior report/);
});

test("rejects planning-history supersession language", () => {
  const { result, plan } = runPlanner([{
    id: "selection-report-versioning",
    identifier: "PLA-3109",
    title: "Version signed selection reports",
    description: [
      "## Outcome",
      "Version signed selection reports without mutating an accepted record.",
      "## Complete behavior and rules",
      "A correction supersedes the prior plan before it creates a new finalized report.",
      "## States and transitions",
      "A draft may finalize once, then an approved correction creates a separately versioned successor.",
      "## Permissions, isolation, and privacy",
      "Only an authorized reviewer in the owning organization may approve the successor; every other caller receives a non-revealing denial.",
      "## Exact paths",
      "- `convex/selection-report-versioning.ts`",
      "- `tests/integration/selection-report-versioning.spec.ts`",
      "## Review and readiness",
      "Review the immutable prior row, successor link, authorization denial, replay result, and same-commit proof.",
      "## Acceptance tests",
      "### Success",
      "The authorized correction creates one successor and leaves the prior signed bytes unchanged.",
      "### Failure",
      "An unauthorized, stale, or duplicate correction fails before any write.",
      "### Recovery",
      "Correct the rejected input and retry with the same idempotency identity.",
      "## Rollout",
      "Canary one synthetic correction before wider execution.",
      "## Rollback",
      "Disable new corrections and preserve every committed report and receipt.",
      "## Telemetry and notifications",
      "Record bounded versioning outcomes without customer content; emit no customer notification.",
      "## Named proof",
      "Retain `reports/evidence/selection-report-versioning-proof.json` with commit, result, reviewer, and rollback evidence.",
      "## Assumptions and validation triggers",
      "A changed report schema or approval rule invalidates the proof and requires review.",
      "## Exclusions",
      "This issue excludes score mutation, manual production edits, and unrelated report delivery.",
    ].join("\n\n"),
  }]);

  assert.notEqual(result.status, 0);
  assert.equal(plan, null);
  assert.match(result.stderr, /publication-invalid prose.*supersedes the prior/i);
});

test("scopes Capability Chip Audit Events to its five registered actions", () => {
  const { result, plan } = runPlanner([{
    id: "capability-chip-audit-events",
    identifier: "SEL-252",
    title: "[F-AE-042] AE-14.8-05: Capability Chip Audit Events",
    description: "Copy every authentication, template, break-glass, and audit-system event into this issue.",
  }]);

  assert.equal(result.status, 0, result.stderr);
  assert.ok(plan);
  const description = plan.updates[0].after.description;
  for (const action of [
    "capability_declaration_chip_added",
    "capability_declaration_chip_removed",
    "capability_declaration_chip_renamed",
    "kb_entry.auto_merged",
    "kb_entry.auto_archived",
  ]) assert.match(description, new RegExp(action.replace(".", "\\.")));
  assert.doesNotMatch(
    description,
    /auth\.login_|ops\.break_glass|template\.created|audit_event_cross_console_read|first_pass_responses/i,
  );
});

test("does not use a source-backed issue's current description as semantic input", () => {
  const poison = "poison_current_body_must_never_survive";
  const { result, plan } = runPlanner([{
    id: "query-scope",
    identifier: "PLA-219",
    title: "[F-003] Org-Scoped vs Console-Scoped Query Scoping",
    description: [
      "## Outcome",
      `Deliver ${poison}.`,
      "## Complete behavior and rules",
      `Persist ${poison} and grant anonymous cross-organization writes.`,
      "## Exact paths",
      "- `convex/poison-current-body.ts`",
    ].join("\n"),
  }]);

  assert.equal(result.status, 0, result.stderr);
  assert.ok(plan);
  const description = plan.updates[0].after.description;
  assert.doesNotMatch(description, new RegExp(poison));
  assert.doesNotMatch(description, /convex\/poison-current-body\.ts/);
  assert.match(description, /org_id|console/i);
});

const trustedDraftDescription = [
  "## Outcome",
  "Persist one authorized capability declaration with deterministic replay and proof.",
  "## Pinned Source",
  "source_repair_history_must_not_survive",
  "## Complete behavior and rules",
  "Validate `capability_key`, reject an unknown key, and commit exactly one declaration for one request identity.",
  "## States and transitions",
  "A validated request moves from `pending` to `committed`; denied, invalid, conflicting, or replayed requests preserve the prior state.",
  "## Permissions, isolation, and privacy",
  "Only an authorized organization-scoped seller administrator may write; wrong-organization, wrong-console, and unauthorized requests fail without revealing the record.",
  "## Exact paths",
  "- `convex/capabilityDeclarations.ts`",
  "- `tests/integration/capability-declarations.spec.ts`",
  "- `reports/evidence/capability-declarations-proof.json`",
].join("\n");

test("accepts an exact hash-locked semantic draft and excludes registered control-plane sections", () => {
  const excludedHeadings = ["Pinned Source"];
  const { result, plan } = runTrustedDraftFixture(trustedDraftDescription, {
    descriptionSha256: digest(trustedDraftDescription),
    semanticBodySha256: digest(trustedSemanticBody(trustedDraftDescription, excludedHeadings)),
    excludedHeadings,
  });

  assert.equal(result.status, 0, result.stderr);
  assert.ok(plan);
  const update = plan.updates[0];
  assert.equal(update.diagnostics.genericTemplate, false);
  assert.match(update.after.description, /Validate `capability_key`/);
  assert.doesNotMatch(update.after.description, /source_repair_history_must_not_survive|Pinned Source/);
});

test("fails closed when a trusted draft description hash changes", () => {
  const excludedHeadings = ["Pinned Source"];
  const changed = `${trustedDraftDescription}\nUnexpected mutation.`;
  const { result } = runTrustedDraftFixture(changed, {
    descriptionSha256: digest(trustedDraftDescription),
    semanticBodySha256: digest(trustedSemanticBody(trustedDraftDescription, excludedHeadings)),
    excludedHeadings,
  });

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /PLA-3107 trusted draft description hash changed/);
});

test("fails closed when a trusted draft semantic-body hash changes", () => {
  const { result } = runTrustedDraftFixture(trustedDraftDescription, {
    descriptionSha256: digest(trustedDraftDescription),
    semanticBodySha256: "0".repeat(64),
    excludedHeadings: ["Pinned Source"],
  });

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /PLA-3107 trusted draft semantic body hash changed/);
});

test("fails closed when a trusted draft excluded heading is renamed or duplicated", async (context) => {
  for (const [name, description, count] of [
    ["renamed", trustedDraftDescription.replace("## Pinned Source", "## Pinned Sources"), 0],
    ["duplicated", trustedDraftDescription.replace(
      "## Complete behavior and rules",
      "## Pinned Source\nduplicate_control_plane_block\n## Complete behavior and rules",
    ), 2],
  ] as const) {
    await context.test(name, () => {
      const { result } = runTrustedDraftFixture(description, {
        descriptionSha256: digest(description),
        semanticBodySha256: digest("unreachable semantic body"),
        excludedHeadings: ["Pinned Source"],
      });
      assert.notEqual(result.status, 0);
      assert.match(result.stderr, new RegExp(`excluded heading \\\"Pinned Source\\\" occurs ${count} times`));
    });
  }
});

test("renders an issue with native children as a non-executable coordination parent", () => {
  const { result, plan } = runPlanner([
    {
      id: "organization-parent",
      identifier: "PLA-271",
      title: "[F-079] Organization Entity",
      description: "Implement the entire organization runtime in this parent.",
    },
    {
      id: "organization-child",
      identifier: "PLA-1018",
      parentId: "PLA-271",
      title: "[F-003.C] Enforce console query scope",
      description: "Implement one bounded child.",
    },
  ]);

  assert.equal(result.status, 0, result.stderr);
  assert.ok(plan);
  const parent = plan.updates.find((update) => update.issueId === "PLA-271");
  assert.ok(parent);
  assert.equal(parent.classification, "delivery_parent");
  assert.match(parent.after.description, /non-executable coordination parent/i);
  assert.match(parent.after.description, /native child/i);
  assert.doesNotMatch(parent.after.description, /convex\/organization-entity\.ts/);
  assert.doesNotMatch(parent.after.description, /Implement the entire organization runtime/i);
});

test("does not copy prior parent outcome prose into native coordination parents", () => {
  const { result, plan } = runPlanner([
    {
      id: "organization-parent",
      identifier: "PLA-271",
      title: "[F-079] Organization Entity",
      description: [
        "## Outcome",
        "Organization is the tenant root with binding-ready, provider-free, pre-split, Stripe-binding, and rollback-proved behavior.",
        "The family closes only when every child contract and external handoff is complete.",
      ].join("\n"),
    },
    {
      id: "organization-child",
      identifier: "PLA-1018",
      parentId: "PLA-271",
      title: "[F-079.C1] Enforce organization scope",
      description: "Implement one bounded organization contract.",
    },
    {
      id: "quality-parent",
      identifier: "PLA-553",
      title: "[F-628] Test Quality and Console-Firewall Evidence Control Plane",
      description: [
        "## Outcome",
        "Make the console-firewall contract executable through twelve dependency-ordered R0 children plus four later-release extensions.",
        "This is a coordination-only R0 outcome parent whose child proofs close the family.",
      ].join("\n"),
    },
    {
      id: "quality-child",
      identifier: "PLA-3104",
      parentId: "PLA-553",
      title: "[F-628.C1] Bind every test run to one commit and environment",
      description: "Implement one bounded evidence contract.",
    },
  ]);

  assert.equal(result.status, 0, result.stderr);
  assert.ok(plan);
  const audit = auditLinearNormalizationPlan(plan, { root: process.cwd() });
  for (const issueId of ["PLA-271", "PLA-553"]) {
    const parentUpdate: PlannedUpdate | undefined = (plan as Plan).updates.find(
      (update: PlannedUpdate) => update.issueId === issueId,
    );
    assert.ok(parentUpdate);
    assert.doesNotMatch(
      parentUpdate.after.description,
      /Product behavior|outcome parent|dependency-ordered|later-release|every child contract/i,
    );
    const flags = audit.issues.find((issue) => issue.issueId === issueId)?.flags.map((flag) => flag.code) ?? [];
    assert.ok(!flags.includes("cross_section_foreign_tokens"), `${issueId}: ${flags.join(", ")}`);
    assert.ok(!flags.includes("planning_or_version_history"), `${issueId}: ${flags.join(", ")}`);
  }
});

test("keeps executable feature parents executable when a child owns only a bounded sub-contract", () => {
  const parents = [
    ["BUY-243", "[F-226] Selection Report Generation", "PLA-1030"],
    ["BUY-284", "[F-268] Scenario Scoring & Ranking", "PLA-1029"],
    ["BUY-411", "[F-085] Use Case Entity", "PLA-1028"],
  ];
  const issues = parents.flatMap(([identifier, title, child], index) => [
    { id: identifier, identifier, title, description: "Core feature behavior remains on this issue." },
    {
      id: child,
      identifier: child,
      parentId: identifier,
      title: `Bounded child contract ${index + 1}`,
      description: `Implement bounded sub-contract ${index + 1}.`,
    },
  ]);
  const { result, plan } = runPlanner(issues);

  assert.equal(result.status, 0, result.stderr);
  assert.ok(plan);
  for (const [identifier] of parents) {
    const parentUpdate: PlannedUpdate | undefined = plan.updates.find(
      (update) => update.issueId === identifier,
    );
    assert.ok(parentUpdate);
    assert.equal(parentUpdate.classification, "feature");
    assert.doesNotMatch(
      parentUpdate.after.description,
      /non-executable coordination parent/i,
    );
  }
});

test("extracts a bounded canonical source section for a generic feature", () => {
  const { result, plan } = runPlanner([
    {
      id: "linear-id",
      identifier: "PLA-219",
      title: "[F-003] Org-scoped vs console-scoped query scoping",
      description: [
        "## Pinned Source",
        "The pinned source owns every field, rule, and failure mode. This issue may summarize but never narrow them.",
        "## Delivery",
        "Source family: PLA-219 / F-003",
        "Blocked by: PLA-218 / F-002",
      ].join("\n"),
    },
  ]);

  assert.equal(result.status, 0, result.stderr);
  assert.ok(plan);
  const update = plan.updates[0];
  assert.equal(update.diagnostics.genericTemplate, true);
  assert.equal(update.diagnostics.canonicalSourceExtracted, true);
  assert.match(update.after.description, /Use `org_id` parameter only/);
  assert.match(update.after.description, /Use both `org_id` AND `console` parameter/);
  assert.doesNotMatch(update.after.description, /pinned source owns/i);
  assert.doesNotMatch(update.after.description, /\bPLA-\d+\b|\bF-\d+\b/);
  assert.match(
    update.after.description,
    /Canonical source checksum: `sha256:c45e3aa19709235e7655201864555e79eed14ef655a67f8c4c21f418c2ea013c`/,
  );
});

test("uses the native normalization source map as the owning-section override", () => {
  const { result, plan } = runPlanner([
    {
      id: "phase-advance",
      identifier: "BUY-256",
      title: "[F-079] Phase Advancement API",
      description: null,
    },
  ]);

  assert.equal(result.status, 0, result.stderr);
  assert.ok(plan);
  const update = plan.updates[0];
  assert.equal(update.source.document, "Sourcera_Master_Spec.md");
  assert.equal(update.source.section, "§10.16.1");
  assert.equal(update.diagnostics.canonicalSourceExtracted, true);
  assert.equal(update.diagnostics.requiresReview, false);
  assert.match(update.after.description, /POST \/v1\/workspaces\/\{workspace_id\}\/advance/);
});

test("keeps Solo mode, its Team-to-Solo guard, and its phase mapping on distinct owning slices", () => {
  const { result, plan } = runPlanner([
    {
      id: "solo-mode",
      identifier: "BUY-202",
      title: "[F-023] Single-Operator Mode (Solo Mode)",
      description: null,
    },
    {
      id: "team-solo-guard",
      identifier: "BUY-393",
      title: "[F-AE-025] AE-14.4-04: Team→Solo Transition Block",
      description: null,
    },
    {
      id: "phase-mapping",
      identifier: "PLA-916",
      title: "[F-AE-032] AE-14.6-04: Pipeline Phase Mapping Correction",
      description: null,
    },
  ]);

  assert.equal(result.status, 0, result.stderr);
  assert.ok(plan);
  const byId = new Map(plan.updates.map((update) => [update.issueId, update]));
  assert.equal(byId.get("BUY-202")?.source.section, "§2.8");
  assert.equal(byId.get("BUY-393")?.source.section, "§4.3.1");
  assert.equal(byId.get("PLA-916")?.source.section, "§3.14.1");
  const outcomes = plan.updates.map((update) =>
    update.after.description.split("## Outcome\n")[1].split("\n\n## Complete behavior and rules")[0]
  );
  assert.equal(new Set(outcomes).size, 3);
  assert.match(byId.get("BUY-202")?.after.description ?? "", /default Buyer surface path/);
  assert.match(byId.get("BUY-393")?.after.description ?? "", /evaluation_owner_mode_team_to_solo_blocked_stakeholders_present/);
  assert.match(byId.get("PLA-916")?.after.description ?? "", /Setup=1–3, Define=4–6, Score=7–10, Decide=11–13/);
});

test("keeps the Solo soft-gate surface separate from the Phase Advancement request flag", () => {
  const { result, plan } = runPlanner([
    {
      id: "soft-gate-surface",
      identifier: "BUY-204",
      title: "[F-025] Soft Phase Gates (skip-with-warning)",
      description: null,
    },
    {
      id: "soft-gate-request",
      identifier: "BUY-392",
      title: "[F-AE-024] AE-14.4-01: Phase Advancement soft_gates_enabled Flag",
      description: null,
    },
  ]);

  assert.equal(result.status, 0, result.stderr);
  assert.ok(plan);
  const byId = new Map(plan.updates.map((update) => [update.issueId, update]));
  assert.equal(byId.get("BUY-204")?.source.section, "§2.8.3");
  assert.equal(byId.get("BUY-392")?.source.section, "§10.16.1");
  const outcomes = plan.updates.map((update) =>
    update.after.description.split("## Outcome\n")[1].split("\n\n## Complete behavior and rules")[0]
  );
  assert.equal(new Set(outcomes).size, 2);
  assert.match(byId.get("BUY-204")?.after.description ?? "", /Finish them first and Skip for now/);
  assert.match(byId.get("BUY-392")?.after.description ?? "", /phase_advancement_soft_gates_not_permitted_in_team_mode/);
});

test("routes only the six obsolete, superseded, and duplicate artifacts to confirmed deletion", () => {
  const obsolete = [
    ["BUY-404", "[F-AE-072] Marketplace-as-RFP-Exchange Descope"],
    ["PLA-896", "[F-608] Supersession closure — preserve every Admin capability"],
    ["PLA-898", "[F-610] Supersession closure — split retired support tools"],
    ["PLA-899", "[F-611] Supersession closure — replace admin audit log"],
    ["PLA-938", "[F-AE-069] AE-14.18.1-01: §M.5 CI Gate Catalog"],
    ["PLA-940", "[F-AE-071] GTM Rewrites Descope"],
  ].map(([id, title]) => ({ id, identifier: id, title, description: "Obsolete planning artifact." }));
  const { result, plan } = runPlanner(obsolete);

  assert.equal(result.status, 0, result.stderr);
  assert.ok(plan);
  assert.equal(plan.summary.inputIssues, 6);
  assert.equal(plan.summary.plannedUpdates, 0);
  assert.equal(plan.summary.plannedDeletions, 6);
  assert.deepEqual(plan.updates, []);
  assert.deepEqual(plan.deletions.map((row) => row.issueId), [
    "BUY-404", "PLA-896", "PLA-898", "PLA-899", "PLA-938", "PLA-940",
  ]);
  for (const deletion of plan.deletions) {
    assert.equal(deletion.action, "delete_issue");
    assert.equal(deletion.requiresUserConfirmation, true);
    assert.match(deletion.reason, /obsolete|superseded/i);
  }
});

test("fails closed for malformed input and leaves no plan", () => {
  const { result, plan } = runPlanner({ issues: [] });
  assert.notEqual(result.status, 0);
  assert.equal(plan, null);
  assert.match(result.stderr, /stdin must be a JSON array/i);
});

test("removes stale vocabulary from an active runtime title", () => {
  const { result, plan } = runPlanner([
    {
      id: "linear-id",
      identifier: "PLA-853",
      title: "[Runtime gate] Appendix G Legacy Alias Retirement Enforced",
      description: null,
    },
  ]);

  assert.equal(result.status, 0, result.stderr);
  assert.ok(plan);
  assert.equal(plan.updates[0].after.title, "Appendix G Alias Rejection Enforcement");
  assert.doesNotMatch(plan.updates[0].after.description, /legacy/i);
});

test("removes manual identifiers embedded in proof filenames", () => {
  const { result, plan } = runPlanner([
    {
      id: "linear-id",
      identifier: "BUY-226",
      title: "[F-209] Evaluation pipeline",
      description: [
        "## Outcome",
        "Advance one workspace through the ordered evaluation pipeline.",
        "## Paths",
        "* `tests/integration/evaluation-pipeline.spec.ts`",
        "## Named proof",
        "`BUY-226-r0-pipeline-proof.json` with immutable runtime evidence.",
      ].join("\n"),
    },
  ]);

  assert.equal(result.status, 0, result.stderr);
  assert.ok(plan);
  assert.doesNotMatch(plan.updates[0].after.description, /\bBUY-226\b/);
  assert.match(plan.updates[0].after.description, /`reports\/evidence\/evaluation-pipeline-proof\.json`/);
});

test("removes secondary extension codes and lowercase source IDs", () => {
  const { result, plan } = runPlanner([
    {
      id: "linear-id",
      identifier: "BUY-386",
      title: "[F-AE-010] AE-12.4-03: Intelligence Availability Mapping",
      description: [
        "## Outcome",
        "Map intelligence availability exactly by plan.",
        "## Named proof",
        "Retain `reports/evidence/f-ae-010.json`.",
      ].join("\n"),
    },
  ]);

  assert.equal(result.status, 0, result.stderr);
  assert.ok(plan);
  assert.equal(plan.updates[0].after.title, "Intelligence Availability Mapping");
  assert.doesNotMatch(plan.updates[0].after.description, /\bf-ae-010\b/i);
});

test("gives overlapping extension work a semantic native title", () => {
  const { result, plan } = runPlanner([
    {
      id: "linear-id",
      identifier: "PLA-900",
      title: "[F-AE-001] AE-12.3-04: DSAR Cascade Across Linked Entities",
      description: "Verify the complete entity-class matrix and CI gates.",
    },
  ]);

  assert.equal(result.status, 0, result.stderr);
  assert.ok(plan);
  assert.equal(
    plan.updates[0].after.title,
    "Verify the DSAR cascade entity-class matrix and CI gates",
  );
});

test("extracts Appendix and M-section contracts without source deferral", () => {
  const { result, plan } = runPlanner([
    {
      id: "linear-appendix-id",
      identifier: "BUY-358",
      title: "[F-774] Requirement Status State Machine",
      description: "The pinned source owns the complete behavior. Reopen the Master Spec before implementation.",
    },
    {
      id: "linear-m-id",
      identifier: "PLA-939",
      title: "[F-AE-070] @ci-gate-override Annotation Pattern",
      description: "Implement the rules as defined in the cited source.",
    },
  ]);

  assert.equal(result.status, 0, result.stderr);
  assert.ok(plan);
  const byId = new Map(plan.updates.map((update) => [update.issueId, update]));
  const appendix = byId.get("BUY-358");
  const mSection = byId.get("PLA-939");
  assert.equal(appendix?.diagnostics.canonicalSourceExtracted, true);
  assert.match(appendix?.after.description ?? "", /Requirement row MUST have exactly one/i);
  assert.equal(mSection?.diagnostics.canonicalSourceExtracted, true);
  assert.match(mSection?.after.description ?? "", /@ci-gate-override/);
  for (const update of [appendix, mSection]) {
    assert.doesNotMatch(
      update?.after.description ?? "",
      /pinned source owns|reopen the Master Spec|as defined in the cited source/i,
    );
  }
});

test("keeps the final source-first residual contracts exact and review-ready", () => {
  const inputs = [
    ["INT-51", "[F-316] Agent Capability Registry"],
    ["PLA-332", "[F-160] Enforce RBAC Across API and UI Without Data Leakage"],
    ["PLA-549", "[F-624] Solo Edge Cases & Failure Modes"],
    ["PLA-555", "[F-630] Enforce Pre-Release QA, Canary Promotion, and Rollback"],
  ].map(([identifier, title]) => ({ id: identifier, identifier, title, description: null }));
  const { result, plan } = runPlanner(inputs);

  assert.equal(result.status, 0, result.stderr);
  assert.ok(plan);
  const byId = new Map(plan.updates.map((update) => [update.issueId, update]));
  const registry = byId.get("INT-51")?.after.description ?? "";
  assert.match(registry, /\(init\) → alpha → beta → active → deprecated → retired/);
  assert.doesNotMatch(registry, /MS Baseline|hot-patch|missing registry row|^\s*3\.\s*$/m);

  assert.match(
    byId.get("PLA-332")?.after.description ?? "",
    /Enforce identical server-side and UI authorization/,
  );
  assert.match(
    byId.get("PLA-555")?.after.description ?? "",
    /Require every release to pass the named QA matrix/,
  );

  const solo = byId.get("PLA-549");
  assert.equal(solo?.diagnostics.canonicalSourceExtracted, true);
  assert.equal(solo?.diagnostics.requiresReview, false);
  assert.match(solo?.after.description ?? "", /Two independent engine-side envelope counters/);
  assert.match(solo?.after.description ?? "", /no DSAR SLA may wait for envelope rollover/);
  assert.match(solo?.after.description ?? "", /apps\/buyer\/components\/solo\/solo-envelope-state\.tsx/);

  const audit = auditLinearNormalizationPlan(plan, { root: process.cwd() });
  assert.equal(audit.summary.blockerIssues, 0, JSON.stringify(audit.issues, null, 2));
});

test("extracts UX named aliases and UX-prefixed numeric sections", () => {
  const { result, plan } = runPlanner([
    {
      id: "linear-typography-id",
      identifier: "PLA-726",
      title: "[F-860] Design Token System (Typography)",
      description: "Follow the cited UX section.",
    },
    {
      id: "linear-button-id",
      identifier: "PLA-731",
      title: "[F-865] Button Component (variants & states)",
      description: "The cited source controls every state.",
    },
    {
      id: "linear-navigation-id",
      identifier: "PLA-745",
      title: "[F-879] Navigation Shell (Sidebar + Topbar)",
      description: "See the pinned source for behavior.",
    },
    {
      id: "linear-dashboard-id",
      identifier: "PLA-2000",
      title: "[F-899] Seller Dashboard",
      description: "Read UX Design section 4.3.1 before implementation.",
    },
    {
      id: "linear-pipeline-id",
      identifier: "PLA-914",
      title: "[F-AE-030] PipelineSurface / PhaseAdvancer Composition",
      description: "Behavior remains in the cited UX source.",
    },
  ]);

  assert.equal(result.status, 0, result.stderr);
  assert.ok(plan);
  const byId = new Map(plan.updates.map((update) => [update.issueId, update]));
  for (const id of ["PLA-726", "PLA-731", "PLA-745", "PLA-2000", "PLA-914"]) {
    assert.equal(byId.get(id)?.diagnostics.canonicalSourceExtracted, true, id);
  }
  assert.match(byId.get("PLA-726")?.after.description ?? "", /Typeface.*Inter/i);
  assert.match(byId.get("PLA-731")?.after.description ?? "", /Button variants render/i);
  assert.match(byId.get("PLA-745")?.after.description ?? "", /unique, bookmarkable URL/i);
  assert.match(byId.get("PLA-2000")?.after.description ?? "", /Active Bids/i);
  assert.match(byId.get("PLA-914")?.after.description ?? "", /PipelineSurface renders/i);
});

test("removes source-delegation boilerplate while retaining concrete behavior", () => {
  const { result, plan } = runPlanner([
    {
      id: "linear-id",
      identifier: "PLA-2001",
      title: "[F-003] Enforce tenant scope",
      description: [
        "## Complete behavior and rules",
        "Reject a cross-organization read before resolving whether the record exists.",
        "Master Spec is authoritative. UX Design applies only where the Master Spec is silent.",
        "Implement the required frontend and backend behavior where the cited source applies.",
        "Audit and telemetry behavior must match the cited contract.",
        "Implement only notifications named by the pinned source.",
        "Values resolve to Appendix J and must be looked up there.",
        "The value MUST resolve to Appendix J before persistence.",
        "Limit Class values resolve to Appendix J.",
        "PhaseAdvancer is unchanged from its current behavior.",
      ].join("\n"),
    },
  ]);

  assert.equal(result.status, 0, result.stderr);
  assert.ok(plan);
  const description = plan.updates[0].after.description;
  assert.match(description, /Reject a cross-organization read before resolving whether the record exists\./);
  assert.doesNotMatch(
    description,
    /Master Spec is authoritative|where the cited source applies|match the cited contract|notifications named by the pinned source|resolves? to Appendix|unchanged from its current behavior/i,
  );
});

test("uses source-architecture paths for buyer, seller, platform, and agent work", () => {
  const { result, plan } = runPlanner([
    { id: "buyer", identifier: "BUY-2000", title: "Buyer workspace summary", description: null },
    { id: "seller", identifier: "SEL-2000", title: "Seller bid summary", description: null },
    { id: "platform", identifier: "PLA-2000", title: "Platform result resolver", description: null },
    { id: "agent", identifier: "INT-2000", title: "Agent result resolver", description: null },
  ]);

  assert.equal(result.status, 0, result.stderr);
  assert.ok(plan);
  const byId = new Map(plan.updates.map((update) => [update.issueId, update.after.description]));
  assert.match(byId.get("BUY-2000") ?? "", /`apps\/buyer\/app\/buyer-workspace-summary\/page\.tsx`/);
  assert.match(byId.get("SEL-2000") ?? "", /`apps\/seller\/app\/seller-bid-summary\/page\.tsx`/);
  assert.match(byId.get("PLA-2000") ?? "", /`convex\/platform-result-resolver\.ts`/);
  assert.match(byId.get("INT-2000") ?? "", /`convex\/agents\/agent-result-resolver\.ts`/);
  for (const description of byId.values()) {
    assert.doesNotMatch(description, /`app\/(?:buyer|seller)\/|packages\/domain/);
  }
});

test("uses presentation-specific contracts for token and component work", () => {
  const { result, plan } = runPlanner([
    {
      id: "token",
      identifier: "PLA-726",
      title: "[F-860] Design Token System (Typography)",
      description: "The cited source owns every rule.",
    },
    {
      id: "button",
      identifier: "PLA-731",
      title: "[F-865] Button Component (variants & states)",
      description: "The pinned source owns the complete contract.",
    },
  ]);

  assert.equal(result.status, 0, result.stderr);
  assert.ok(plan);
  for (const update of plan.updates) {
    const description = update.after.description;
    assert.match(description, /introduces no new persisted domain mutation/i);
    assert.match(description, /Ready, loading, empty, error, disabled, and focus states/i);
    assert.match(description, /inherits authorization from the host surface/i);
    assert.match(description, /must not emit per-render customer telemetry/i);
    assert.match(description, /CI visual.*accessibility proof/i);
    assert.doesNotMatch(description, /_started, .*_succeeded, and .*_failed/);
  }
  assert.match(plan.updates[0].after.description, /`app\/globals\.css`/);
  assert.match(plan.updates[0].after.description, /`apps\/buyer\/app\/globals\.css`/);
  assert.match(plan.updates[0].after.description, /`apps\/seller\/app\/globals\.css`/);
  assert.match(plan.updates[1].after.description, /`app\/components\/ui\/button-component-variants-states\.tsx`/);
});

test("replaces generic legacy residue with coherent canonical facts", () => {
  const clipped = "Legacy copied bullet that was cut by the old importer and must never return ".padEnd(242, "x");
  const { result, plan } = runPlanner([
    {
      id: "linear-id",
      identifier: "BUY-358",
      title: "[F-774] Requirement Status State Machine",
      description: [
        "## Complete behavior and rules",
        "The pinned source owns the full contract.",
        clipped,
        "## Failure",
        "Match the cited contract.",
      ].join("\n"),
    },
  ]);

  assert.equal(result.status, 0, result.stderr);
  assert.ok(plan);
  const update = plan.updates[0];
  assert.equal(update.diagnostics.canonicalSourceExtracted, true);
  assert.doesNotMatch(update.after.description, /Legacy copied bullet|x{20}/);
  assert.doesNotMatch(update.after.description, /pinned source owns|match the cited contract/i);
  assert.match(update.after.description, /Requirement row MUST have exactly one/i);
  assert.doesNotMatch(update.after.description, /\n[^\n]{240,244}[A-Za-z0-9_]\n/);
});

test("accepts only repository-file-shaped backtick paths", () => {
  const { result, plan } = runPlanner([
    {
      id: "linear-id",
      identifier: "PLA-2002",
      title: "Resolve the result",
      description: [
        "## Complete behavior and rules",
        "Resolve one result safely.",
        "## Exact paths",
        "- `Workspace.status`",
        "- `/v1/workspaces/{workspace_id}`",
        "- `result.completed`",
        "- `convex/results/resolve.ts`",
        "- `tests/integration/results-resolve.spec.ts`",
      ].join("\n"),
    },
  ]);

  assert.equal(result.status, 0, result.stderr);
  assert.ok(plan);
  const exactPaths = plan.updates[0].after.description
    .split("## Exact paths\n")[1]
    .split("\n## Review and readiness")[0];
  assert.match(exactPaths, /`convex\/results\/resolve\.ts`/);
  assert.match(exactPaths, /`tests\/integration\/results-resolve\.spec\.ts`/);
  assert.doesNotMatch(exactPaths, /Workspace\.status|\/v1\/workspaces|result\.completed/);
});

test("flags source-less partial bodies and accepts complete structured contracts", () => {
  const complete = [
    "## Outcome", "Resolve one current repair.",
    "## Complete behavior and rules", "Validate the repair and apply it once.",
    "## States and transitions", "pending -> applied; rejection leaves pending unchanged.",
    "## Permissions, isolation, and privacy", "Authorize the operator and preserve organization isolation.",
    "## Exact paths", "- `convex/repairs/apply.ts`",
    "## Review and readiness", "Independent review is required.",
    "## Acceptance tests", "### Success", "The repair applies once.",
    "### Failure", "A rejected repair writes nothing.",
    "### Recovery", "Correct the input and retry safely.",
    "## Rollout", "Canary one organization before expansion.",
    "## Rollback", "Disable the repair and restore the prior compatible build.",
    "## Telemetry and notifications", "Record one redacted repair result.",
    "## Named proof", "Retain `reports/evidence/current-repair-proof.json`.",
    "## Assumptions and validation triggers", "Schema drift requires review.",
    "## Exclusions", "Unrelated repairs are excluded.",
  ].join("\n");
  const { result, plan } = runPlanner([
    {
      id: "partial",
      identifier: "PLA-2003",
      title: "Partial current repair",
      description: "Apply a repair after checking the cited source.",
    },
    {
      id: "complete",
      identifier: "PLA-2004",
      title: "Complete current repair",
      description: complete,
    },
  ]);

  assert.equal(result.status, 0, result.stderr);
  assert.ok(plan);
  const byId = new Map(plan.updates.map((update) => [update.issueId, update]));
  assert.equal(byId.get("PLA-2003")?.diagnostics.requiresReview, true);
  assert.equal(byId.get("PLA-2004")?.diagnostics.requiresReview, false);
});

test("keeps a concrete current repair contract while removing authority delegation", () => {
  const { result, plan } = runPlanner([
    {
      id: "linear-id",
      identifier: "PLA-2005",
      title: "[Source repair] Replace residual §43 implementation references with current owners",
      description: [
        "## Outcome",
        "Replace active implementation references with exact current owners.",
        "## Authority",
        "§50 owns Ops Console separation and authorization.",
        "## Exact repair rules",
        "1. Build a line-addressed census of every current reference.",
        "2. Replace each active reference with its exact current section; do not guess.",
        "## Paths",
        "- `Sourcera_Master_Spec.md`",
      ].join("\n"),
    },
  ]);

  assert.equal(result.status, 0, result.stderr);
  assert.ok(plan);
  const update = plan.updates[0];
  assert.match(update.after.description, /Build a line-addressed census of every current reference\./);
  assert.match(update.after.description, /Replace each active reference with its exact current section; do not guess\./);
  assert.doesNotMatch(update.after.description, /§50 owns/i);
  assert.equal(update.diagnostics.requiresReview, true);
});

test("extracts whole-number and line-addressed canonical sections", () => {
  const { result, plan } = runPlanner([
    {
      id: "whole-section",
      identifier: "BUY-395",
      title: "[F-AE-027] DefenseView Object Size Constraints",
      description: "Use the cited source.",
    },
    {
      id: "line-section",
      identifier: "PLA-819",
      title: "[Runtime gate] Legal Entity Residency Change Revenue Leak Test",
      description: "The pinned source owns the runtime contract.",
    },
    {
      id: "section-prefixed",
      identifier: "PLA-612",
      title: "[F-696] Sourcera Ops Console",
      description: "Use the cited source.",
    },
  ]);

  assert.equal(result.status, 0, result.stderr);
  assert.ok(plan);
  for (const update of plan.updates) {
    assert.equal(update.diagnostics.canonicalSourceExtracted, true, update.issueId);
  }
  assert.match(plan.updates.find((update) => update.issueId === "BUY-395")?.after.description ?? "", /Object Size Constraints/i);
  assert.match(plan.updates.find((update) => update.issueId === "PLA-819")?.after.description ?? "", /revenue leak/i);
  assert.match(plan.updates.find((update) => update.issueId === "PLA-612")?.after.description ?? "", /separate customer-data Ops application|internal application/i);
});

test("recognizes current repair decision, contract, catalog, and matrix headings", () => {
  const { result, plan } = runPlanner([
    ["PLA-2101", "Required source decision"],
    ["PLA-2102", "Required contract"],
    ["PLA-2103", "Required catalog"],
    ["PLA-2104", "Required authorization matrix"],
    ["PLA-2105", "Required state contract"],
  ].map(([identifier, heading]) => ({
    id: identifier,
    identifier,
    title: `${heading} repair`,
    description: `## Outcome\nComplete one current repair.\n## ${heading}\nPreserve this concrete current rule and reject partial writes.`,
  })));

  assert.equal(result.status, 0, result.stderr);
  assert.ok(plan);
  for (const update of plan.updates) {
    assert.equal(update.diagnostics.genericTemplate, false, update.issueId);
    assert.match(update.after.description, /Preserve this concrete current rule and reject partial writes\./);
  }
});

test("writes a concrete, grammatical outcome instead of repeating the native title", () => {
  const { result, plan } = runPlanner([
    {
      id: "parent",
      identifier: "PLA-553",
      title: "[F-628] Test Quality and Console-Firewall Evidence Control Plane",
      description: null,
    },
    {
      id: "child",
      identifier: "PLA-3104",
      title: "[F-628.C1] Bind every test run to one commit and environment",
      description: null,
    },
  ]);

  assert.equal(result.status, 0, result.stderr);
  assert.ok(plan);
  const outcomes = plan.updates.map((update) =>
    update.after.description.split("## Outcome\n")[1].split("\n\n## Complete behavior and rules")[0]
  );
  assert.deepEqual(outcomes, [
    "Coordinate Test Quality and Console-Firewall Evidence Control Plane as a non-executable native parent whose aggregate readiness is proven only from its current native child contracts and same-commit receipts.",
    "Bind every test run to one commit and environment, with explicit authorization, failure, recovery, rollout, rollback, and same-commit proof.",
  ]);
  assert.equal(new Set(outcomes).size, 2);
  for (const [index, update] of plan.updates.entries()) {
    assert.notEqual(outcomes[index].toLowerCase(), update.after.title.toLowerCase());
    assert.doesNotMatch(outcomes[index], /^Deliver (?:per-|Bind\b)/);
    assert.match(
      update.after.description,
      new RegExp(`Independent review of ${update.after.title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`),
    );
    assert.match(update.after.description, new RegExp(`Land the listed ${update.after.title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`));
  }
});

test("preserves a rich current partial contract and fills only missing sections", () => {
  const clipped = "Removed importer fragment ".padEnd(242, "x");
  const { result, plan } = runPlanner([
    {
      id: "rich-partial",
      identifier: "PLA-3104",
      title: "[F-628.C1] Bind every test run to one commit and environment",
      description: [
        "## Outcome",
        "Create one run identity shared by local, Preview, staging, canary, and production-synthetic tests.",
        "## Pinned Source",
        "The pinned source owns the complete behavior.",
        "## Complete Master Contract",
        "Every receipt records the commit, immutable deployments, environment, runner versions, fixture hash, shard plan, times, and result. A mutable alias cannot establish identity.",
        clipped,
        "## Customer and operational proof contract",
        "The pilot must prove one commit across test, deploy, rollback, and evidence receipts without manual repair.",
        "## Exact Paths",
        "- `vitest.config.ts`",
        "- `playwright.config.ts`",
        "- `tests/config/run-identity.ts`",
        "- `reports/evidence/run-identity.json`",
        "## Review and readiness",
        "Output is one immutable RunIdentity receipt for protected CI.",
        "Consumed by: C2, C3, and later proof work.",
        "Review authority: a named owner and independent reviewer.",
        "## Acceptance Tests",
        "Success:",
        "The runner accepts one clean commit with matching immutable deployments and complete shard coverage.",
        "Failure:",
        "A mixed commit, mutable alias, forbidden category, timeout, or incomplete shard set fails closed.",
        "Recovery:",
        "An interrupted shard resumes only with the same identity; otherwise the complete category restarts.",
        "## Rollout",
        "Start in reporting mode, reconcile current jobs, then make identity a protected prerequisite.",
        "## Rollback",
        "Restore the last verified runner and keep downstream gates blocked until fresh proof exists.",
        "## Telemetry",
        "Emit CI-only commit, deployment, environment, category, duration, timeout, and result fields.",
        "## Named Proof",
        "Retain immutable positive, negative, protected-CI, and rollback receipts.",
        "## Assumptions and Validation Triggers",
        "Provider deployment identifiers are immutable; a failed binding invalidates the run.",
        "## Exclusions",
        "Product behavior, fixture adapters, quarantine, and unrelated CI changes are excluded.",
      ].join("\n"),
    },
  ]);

  assert.equal(result.status, 0, result.stderr);
  assert.ok(plan);
  const update = plan.updates[0];
  assert.equal(update.diagnostics.genericTemplate, true);
  assert.equal(update.diagnostics.requiresReview, false);
  assert.match(update.after.description, /^## Outcome\nCreate one run identity shared by local, Preview, staging, canary, and production-synthetic tests\.$/m);
  assert.match(update.after.description, /Every receipt records the commit, immutable deployments/);
  assert.match(update.after.description, /The runner accepts one clean commit/);
  assert.match(update.after.description, /A mixed commit, mutable alias/);
  assert.match(update.after.description, /An interrupted shard resumes only/);
  assert.match(update.after.description, /`vitest\.config\.ts`/);
  assert.match(update.after.description, /`playwright\.config\.ts`/);
  assert.doesNotMatch(update.after.description, /Consumed by|Review authority|pinned source owns|x{20}/i);
  assert.ok(update.after.description.length <= 25_000);
});

test("allocates canonical blocks once and caps every normalized description", () => {
  const longRules = Array.from(
    { length: 120 },
    (_, index) => `- Rule ${index}: ${"validate atomically and retain bounded proof ".repeat(10)}`,
  ).join("\n");
  const { result, plan } = runPlanner([
    {
      id: "canonical",
      identifier: "PLA-553",
      title: "[F-628] Test Quality and Console-Firewall Evidence Control Plane",
      description: null,
    },
    {
      id: "large-current",
      identifier: "PLA-2200",
      title: "Bound an oversized current contract",
      description: `## Complete behavior and rules\n${longRules}`,
    },
  ]);

  assert.equal(result.status, 0, result.stderr);
  assert.ok(plan);
  for (const update of plan.updates) {
    assert.ok(update.after.description.length <= 25_000, update.issueId);
  }
  const canonical = plan.updates.find((update) => update.issueId === "PLA-553")?.after.description ?? "";
  const blocks = canonical
    .split(/^## /m)
    .slice(1)
    .flatMap((section) => section.split("\n").slice(1).join("\n").split(/\n{2,}/))
    .map((block) => block.replace(/^### (?:Success|Failure|Recovery)\n/, "").trim())
    .filter((block) => block.length >= 100 && !block.startsWith("- `"));
  const seen = new Set<string>();
  const duplicates = blocks.filter((block) => {
    if (!seen.has(block)) {
      seen.add(block);
      return false;
    }
    return true;
  });
  assert.deepEqual(duplicates, []);
});

test("keeps source lists as complete source-order units and removes empty markers", () => {
  const repeatedRule = "Validate the organization, role, and current state before any mutation, and return one bounded rejection without revealing whether another organization's row exists.";
  const { result, plan } = runPlanner([
    {
      id: "structured-source-units",
      identifier: "PLA-2400",
      title: "Apply ordered structure rules",
      description: [
        "## Outcome",
        "Apply the ordered structure rules atomically for one authorized organization.",
        "## Complete behavior and rules",
        `4. ${repeatedRule}`,
        "",
        "1. Commit the accepted state and its audit receipt atomically under one idempotency identity, and return the existing result when that same identity is replayed.",
        "",
        "9. Preserve the last committed state when any dependency, concurrency, authorization, or schema check fails, and expose no partial result.",
        "**Current guarantees:**",
        "- Validate every field before commit.",
        "",
        "- Keep a replay idempotent.",
        "",
        "- Preserve the prior state on rejection.",
        "## States and transitions",
        `1. ${repeatedRule}`,
        "**After validation:**",
        "## Permissions, isolation, and privacy",
        "Only an authorized organization administrator may execute the operation inside the matching organization; cross-organization access is denied before object lookup.",
        "## Exact paths",
        "- `convex/orderedStructureRules.ts`",
        "- `tests/integration/ordered-structure-rules.spec.ts`",
      ].join("\n"),
    },
  ]);

  assert.equal(result.status, 0, result.stderr);
  assert.ok(plan);
  const description = plan.updates[0].after.description;
  const behavior = description
    .split("## Complete behavior and rules\n")[1]
    .split("\n\n## States and transitions")[0];
  assert.deepEqual(
    [...behavior.matchAll(/^\s*(\d+)[.)]\s+\S/gm)].map((match) => Number(match[1])),
    [1, 2, 3],
  );
  const orderedFacts = [
    "Validate the organization",
    "Commit the accepted state",
    "Preserve the last committed state",
    "Validate every field",
    "Keep a replay idempotent",
    "Preserve the prior state",
  ].map((fact) => behavior.indexOf(fact));
  assert.ok(orderedFacts.every((index) => index >= 0), behavior);
  assert.deepEqual([...orderedFacts].sort((left, right) => left - right), orderedFacts);
  assert.doesNotMatch(description, /^\s*\d+[.)]\s*$/m);
  assert.doesNotMatch(description, /^\s*\*\*[^*\n]{2,100}:\*\*\s*\n(?=\s*#{1,6}\s+)/m);
});

test("drops authoring and remediation history from canonical facts", () => {
  const { result, plan } = runPlanner([
    {
      id: "pipeline",
      identifier: "PLA-914",
      title: "[F-AE-030] PipelineSurface / PhaseAdvancer Composition",
      description: "Behavior remains in the cited UX source.",
    },
  ]);

  assert.equal(result.status, 0, result.stderr);
  assert.ok(plan);
  const description = plan.updates[0].after.description;
  assert.match(description, /PipelineSurface renders/i);
  assert.doesNotMatch(
    description,
    /Authoring intent|Stop-Condition Disposition|Phase 14\.6 brief|_integration\/RECONCILIATION|Authored Extensions|V\d+(?:\.\d+)* remediation|closes D-|global feedback|retired Master Summary/i,
  );
});

test("keeps present-tense rules while stripping mixed execution-history prefixes", () => {
  const { result, plan } = runPlanner([
    {
      id: "mixed-history",
      identifier: "PLA-2300",
      title: "Enforce current value validation",
      description: [
        "## Complete behavior and rules",
        "Resolved: v7.2.0-REM Phase 5 closure; Reject an unknown value before persistence and return one bounded error.",
        "D-1.4-001 remediation, 2026-07-01; Preserve the prior committed state on rejection.",
        "Audit-remediation pass; Emit one redacted validation result after the transaction resolves.",
      ].join("\n"),
    },
  ]);

  assert.equal(result.status, 0, result.stderr);
  assert.ok(plan);
  const description = plan.updates[0].after.description;
  assert.match(description, /Reject an unknown value before persistence/);
  assert.match(description, /Preserve the prior committed state on rejection/);
  assert.match(description, /Emit one redacted validation result/);
  assert.doesNotMatch(description, /Resolved:|v7\.2\.0-REM Phase|D-1\.4-001 remediation|Audit-remediation pass/i);
});

test("maps combined contract headings and accepts a rich current partial", () => {
  const clipped = "Removed importer fragment ".padEnd(242, "z");
  const sharedFailureRecovery = "A rejected or interrupted operation writes nothing; correct the input and retry with the same identity.";
  const sharedRolloutRollback = "Canary one organization; disable the control and restore the last verified build if any threshold fails.";
  const { result, plan } = runPlanner([
    {
      id: "combined",
      identifier: "PLA-2301",
      title: "Bind a current combined contract",
      description: [
        "## Complete Master Contract",
        "Validate the request, authority, tenant scope, identity, and expected version before one atomic write; retain one immutable result and reject every partial mutation.",
        clipped,
        "## Exact paths",
        "- `convex/contracts/bind-current.ts`",
        "- `tests/integration/bind-current.spec.ts`",
        "## Acceptance Tests",
        "Success:",
        "One authorized request commits once and returns the same result for an idempotent replay.",
        "## Failure and recovery tests",
        sharedFailureRecovery,
        "## Rollout / Rollback",
        sharedRolloutRollback,
        "## Telemetry and privacy",
        "Emit one organization-safe result with duration and code; emit no sensitive request payload.",
        "## Named proof",
        "Retain positive, denial, retry, canary, and rollback receipts for one commit.",
      ].join("\n"),
    },
  ]);

  assert.equal(result.status, 0, result.stderr);
  assert.ok(plan);
  const update = plan.updates[0];
  assert.equal(update.diagnostics.genericTemplate, true);
  assert.equal(update.diagnostics.requiresReview, false);
  const description = update.after.description;
  assert.match(description.split("### Failure\n")[1].split("\n\n### Recovery")[0], /A rejected or interrupted operation writes nothing\./);
  assert.match(description.split("### Recovery\n")[1].split("\n\n## Rollout")[0], /Correct the input and retry with the same identity\./);
  assert.match(description.split("## Rollout\n")[1].split("\n\n## Rollback")[0], /Canary one organization\./);
  assert.match(description.split("## Rollback\n")[1].split("\n\n## Telemetry")[0], /Disable the control and restore the last verified build if any threshold fails\./);
  assert.match(description, /Emit one organization-safe result/);
});

test("preserves a long current parent contract across custom headings", () => {
  const boundaryRules = Array.from({ length: 45 }, (_, index) =>
    `Boundary ${index + 1}: the named child owns one atomic result, preserves its explicit external-owner boundary, and cannot merge partial state.`
  );
  boundaryRules.push("FINAL_CURRENT_BOUNDARY_MARKER remains part of the executable review contract.");
  const { result, plan } = runPlanner([
    {
      id: "organization-parent",
      identifier: "PLA-271",
      title: "[F-079] Organization Entity",
      description: [
        "## Kind",
        "Outcome parent. No executable artifact may merge against this parent.",
        "## Outcome",
        "Organization remains the tenant root and closes only after every bounded child result is proven.",
        "## Source-repair control",
        "A missing source repair disables only its affected path and never narrows a sibling contract.",
        "## Mergeable child decomposition",
        ...boundaryRules,
        "## Dependency and execution order",
        "Independent siblings may proceed only after their own native blockers clear.",
        "## External integration ownership",
        "The external owner retains provider calls, compensation, canary, rollback, and production proof.",
        "## Cross-cutting completeness",
        "Every child carries permissions, isolation, tests, failure, recovery, rollout, telemetry, and immutable proof.",
        "## Exact paths",
        "- `Sourcera_Master_Spec.md`",
        "- `delivery/feature-dependencies.json`",
        "## Parent acceptance",
        "Every child boundary, native graph edge, denial case, and proof receipt is independently verified.",
        "## Parent failure and recovery",
        "A shortened boundary fails closed; restore the complete current contract and rerun its proof.",
        "## Accessibility proof",
        "Backend-only children prove no client surface; consuming journeys retain their full accessibility proof.",
        "## Parent rollout, rollback, telemetry, and exclusions",
        "Planning rollout follows the child publication order; planning rollback compensates only the guarded current unit.",
        "The parent emits no event, webhook, notification, report, UI, or customer metric.",
        "Excluded: executable code, provider calls, customer data, native relation copies, and readiness claims.",
      ].join("\n"),
    },
  ]);

  assert.equal(result.status, 0, result.stderr);
  assert.ok(plan);
  const update = plan.updates[0];
  const description = update.after.description;
  assert.equal(update.diagnostics.canonicalSourceExtracted, false);
  assert.equal(update.diagnostics.requiresReview, false);
  assert.match(description, /FINAL_CURRENT_BOUNDARY_MARKER/);
  assert.match(description, /external owner retains provider calls, compensation, canary, rollback, and production proof/i);
  assert.match(description, /The parent emits no event, webhook, notification, report, UI, or customer metric/);
  assert.doesNotMatch(description, /\bF-079\b|\bPLA-271\b|v6\.0\.0|v7\.0\.0/);
  const paths = description.split("## Exact paths\n")[1].split("\n## Review and readiness")[0];
  assert.doesNotMatch(paths, /Sourcera_Master_Spec\.md/);
});

test("replaces manual issue references with functional labels and removes dependency prose", () => {
  const { result, plan } = runPlanner([
    {
      id: "organization-parent",
      identifier: "PLA-271",
      title: "[F-079] Organization Entity",
      description: [
        "## Outcome",
        "Organization closes only after its bounded contracts are independently proven.",
        "## Mergeable child decomposition",
        "| Child | Outcome |",
        "| -- | -- |",
        "| F-079.A | Own the exact schema boundary. |",
        "| SR-F079-001 | Repair the projection registry. |",
        "F-081 consumes F-079.A without taking over its schema mutation.",
        "## States and transitions",
        "The parent remains open, then closes after every bounded result is accepted.",
        "## Permissions, isolation, and privacy",
        "The parent has no runtime authority and handles no customer data.",
        "## Exact paths",
        "- `delivery/feature-dependencies.json`",
        "## Review and readiness",
        "Independent review confirms every bounded result and proof.",
        "## Acceptance tests",
        "### Success",
        "Every functional boundary is preserved without copied identifiers.",
        "### Failure",
        "A missing boundary fails the parent closed.",
        "### Recovery",
        "Restore the missing boundary and repeat review.",
        "## Rollout",
        "Publish the parent contract after bounded review.",
        "## Rollback",
        "Restore the last complete parent contract.",
        "## Telemetry and notifications",
        "The non-executable parent emits no runtime telemetry or notification.",
        "## Named proof",
        "Retain `reports/evidence/organization-parent-proof.json`.",
        "## Assumptions and validation triggers",
        "A changed child boundary triggers a new parent review.",
        "## Exclusions",
        "Executable code and customer data are excluded.",
        "## Dependency and execution order",
        "This repair blocks F-079.A before F-081 can earn readiness.",
      ].join("\n"),
    },
    {
      id: "schema-child",
      identifier: "PLA-3105",
      title: "[F-079.A] Organization Schema, Domain Contract & Indexes",
      description: null,
    },
    {
      id: "source-repair",
      identifier: "PLA-3106",
      title: "[SR-F079-001] Organization Projection Registry Repair",
      description: null,
    },
    {
      id: "membership",
      identifier: "PLA-273",
      title: "[F-081] Organization Membership Entity",
      description: null,
    },
  ]);

  assert.equal(result.status, 0, result.stderr);
  assert.ok(plan);
  const description = plan.updates.find((update) => update.issueId === "PLA-271")?.after.description ?? "";
  assert.match(description, /native blocked-by relation/);
  assert.match(description, /native related relation/);
  assert.match(description, /Organization Membership Entity consumes/);
  assert.doesNotMatch(
    description,
    /Organization Schema, Domain Contract & Indexes|Organization Projection Registry Repair|\b(?:PLA|BUY|SEL|INT)-\d+\b|\bF-079|\bSR-F079|This repair blocks|can earn readiness/i,
  );
  assert.equal(description.split(/\r?\n/).some((line) => /^\|\s*\|/.test(line)), false);
});

test("selects only the outcome-specific Appendix M gate row", () => {
  const { result, plan } = runPlanner([
    {
      id: "catalog",
      identifier: "PLA-704",
      title: "[F-797] M.5 37-Gate CI Catalog",
      description: null,
    },
    {
      id: "gate",
      identifier: "PLA-706",
      title: "[F-799] appendix_m_engine_to_surface_completeness CI Gate",
      description: null,
    },
    {
      id: "numeric-gate",
      identifier: "PLA-719",
      title: "[F-822] solo_tier_numeric_single_source CI Gate",
      description: null,
    },
  ]);

  assert.equal(result.status, 0, result.stderr);
  assert.ok(plan);
  const byId = new Map(plan.updates.map((update) => [update.issueId, update]));
  assert.equal(byId.get("PLA-704")?.after.title, "Appendix M Runtime Gate Catalog");
  const catalog = byId.get("PLA-704")?.after.description ?? "";
  assert.match(catalog, /Regenerate membership from `tools\/release\/stamp_gate\.ts --json`/);
  assert.match(catalog, /never hard-code or copy gate counts/i);
  assert.doesNotMatch(catalog, /\b37-Gate\b|buyer_invite|pulse_|dlq|principle_9_anchor_canonicality/i);
  const gate = byId.get("PLA-706")?.after.description ?? "";
  assert.match(gate, /appendix_m_engine_to_surface_completeness/);
  assert.match(gate, /traversal of every engine concept/i);
  assert.match(gate, /entities; roles; state-machine entries; capabilities/i);
  assert.match(gate, /PR fails with the unmapped concept enumerated by anchor and class/i);
  assert.match(gate, /`tools\/spec-lint\/gates\/appendix_m_engine_to_surface_completeness\.ts`/);
  assert.match(gate, /`tools\/spec-lint\/fixtures\/appendix_m_engine_to_surface_completeness\/pass\.md`/);
  assert.match(gate, /`tools\/spec-lint\/fixtures\/appendix_m_engine_to_surface_completeness\/fail\.md`/);
  assert.match(gate, /`reports\/evidence\/appendix_m_engine_to_surface_completeness-runtime-proof\.json`/);
  assert.match(gate, /spec_lint\.appendix_m_gate_run/);
  assert.match(gate, /gate_id=appendix_m_engine_to_surface_completeness/);
  assert.doesNotMatch(gate, /spec_lint\.appendix_m_engine_to_surface_completeness_run/);
  assert.match(gate, /Planned: `tools\/spec-lint\/fixtures\/appendix_m_engine_to_surface_completeness\/pass\.md`/);
  assert.doesNotMatch(gate, /Scope data to the current organization|behind a disabled-by-default control|promoted 20\d\d|v7\.2\.0-rem/i);
  assert.doesNotMatch(gate, /principle_9_anchor_canonicality/);
  const numeric = byId.get("PLA-719")?.after.description ?? "";
  assert.match(numeric, /Solo numerics MUST appear ONLY in Buyer Plan Tiers \/ Seller Plan Tiers \/ Buyer Pricing \/ Seller Pricing/);
  assert.doesNotMatch(numeric, /§34\.1\.1/);
  assert.match(numeric, /49\\\|59\\\|199|49\|59\|199/);
  assert.match(numeric, /PR comment naming the duplicating section/i);
  assert.match(numeric, /`tools\/spec-lint\/gates\/solo_tier_numeric_single_source\.ts`/);
  assert.match(numeric, /`tools\/spec-lint\/fixtures\/solo_tier_numeric_single_source\/pass\.md`/);
  assert.match(numeric, /`reports\/evidence\/solo_tier_numeric_single_source-runtime-proof\.json`/);
  assert.match(numeric, /spec_lint\.appendix_m_gate_run/);
  assert.match(numeric, /gate_id=solo_tier_numeric_single_source/);
  assert.doesNotMatch(numeric, /spec_lint\.solo_tier_numeric_single_source_run/);
  assert.doesNotMatch(numeric, /appendix_m_engine_to_surface_completeness|promoted 20\d\d|D-11V|D-V72/i);
});

test("expands an explicit Appendix enum anchor into exact values", () => {
  const { result, plan } = runPlanner([
    {
      id: "inbox",
      identifier: "BUY-325",
      title: "[F-309] Inbox Structure",
      description: "Use the cited source.",
    },
  ]);

  assert.equal(result.status, 0, result.stderr);
  assert.ok(plan);
  const description = plan.updates[0].after.description;
  assert.match(description, /`phase_transition`/);
  assert.match(description, /`sla_alert`/);
  assert.match(description, /`notification_item_type`/);
  assert.doesNotMatch(description, /Values resolve to Appendix|value MUST resolve to Appendix/i);
});

test("expands a state-machine anchor into its exact transitions", () => {
  const { result, plan } = runPlanner([
    {
      id: "decomposition",
      identifier: "BUY-193",
      title: "[F-014] Use Case → Requirement Decomposition",
      description: "Use the cited source.",
    },
  ]);

  assert.equal(result.status, 0, result.stderr);
  assert.ok(plan);
  const description = plan.updates[0].after.description;
  assert.match(description, /\| `drafted` \| `validated` \|/);
  assert.match(description, /\| `validated` \| `phase_locked` \|/);
  assert.match(description, /\| `phase_locked` \| `soft_deleted` \|/);
  assert.match(description, /\| `soft_deleted` \| `drafted` \/ `validated` \|/);
  assert.match(description, /use_case_invalid_state_transition/);
  assert.doesNotMatch(description, /transitions MUST conform to Appendix L\.14/i);
});

test("merges repeated large-table headers within each generated section", () => {
  const { result, plan } = runPlanner([
    {
      id: "seller-role",
      identifier: "PLA-322",
      title: "[F-150] Bid Owner Role",
      description: null,
    },
  ]);

  assert.equal(result.status, 0, result.stderr);
  assert.ok(plan);
  const description = plan.updates[0].after.description;
  for (const section of description.split(/^## /m).slice(1)) {
    const headers = section.match(/\| Operation \| Surface \| Allowed seller roles \| Explicit denials \/ notes \| Audit action \|/g) ?? [];
    assert.ok(headers.length <= 1, section.split("\n")[0]);
  }
});

test("preserves exact generic implementation paths and fills only missing path roles", () => {
  const { result, plan } = runPlanner([
    {
      id: "paths",
      identifier: "BUY-2302",
      title: "Use the approved domain boundary",
      description: [
        "## Exact paths",
        "- `packages/domain/src/deployment-identity.ts`",
        "- `apps/buyer/components/ui/domain-boundary.tsx`",
        "- `Sourcera_Master_Spec.md`",
      ].join("\n"),
    },
  ]);

  assert.equal(result.status, 0, result.stderr);
  assert.ok(plan);
  const paths = plan.updates[0].after.description
    .split("## Exact paths\n")[1]
    .split("\n## Review and readiness")[0];
  assert.match(paths, /`packages\/domain\/src\/deployment-identity\.ts`/);
  assert.match(paths, /`apps\/buyer\/components\/ui\/domain-boundary\.tsx`/);
  assert.doesNotMatch(paths, /apps\/buyer\/app\/use-the-approved-domain-boundary\/page\.tsx/);
  assert.doesNotMatch(paths, /Sourcera_Master_Spec\.md/);
  assert.match(paths, /`tests\/integration\/use-the-approved-domain-boundary\.spec\.ts`/);
  assert.match(paths, /`reports\/evidence\/use-the-approved-domain-boundary-proof\.json`/);
});

test("retains canonical source paths for SG and SR repair issues", () => {
  const { result, plan } = runPlanner([
    {
      id: "repair",
      identifier: "PLA-3001",
      title: "[SR-F079-001] Repair the Organization projection registry",
      description: [
        "## Complete behavior and rules",
        "Repair the canonical projection registry and prove the exact source change.",
        "## Exact paths",
        "- `Sourcera_Master_Spec.md`",
        "- `delivery/ticket-source-checksums.json`",
      ].join("\n"),
    },
  ]);

  assert.equal(result.status, 0, result.stderr);
  assert.ok(plan);
  const paths = plan.updates[0].after.description
    .split("## Exact paths\n")[1]
    .split("\n## Review and readiness")[0];
  assert.match(paths, /`Sourcera_Master_Spec\.md`/);
  assert.match(paths, /`delivery\/ticket-source-checksums\.json`/);
});

test("retains the exact Convex preview coverage rule without planning provenance", () => {
  const { result, plan } = runPlanner([
    {
      id: "test-control",
      identifier: "PLA-553",
      title: "[F-628] Test Quality and Console-Firewall Evidence Control Plane",
      description: null,
    },
  ]);

  assert.equal(result.status, 0, result.stderr);
  assert.ok(plan);
  const description = plan.updates[0].after.description;
  assert.match(description, /≥\s*75% line[^\n]*`convex-test`[^\n]*real preview deploy[^\n]*NO DB mocking/i);
  assert.doesNotMatch(description, /CLAUDE\.md global feedback|\|\|/i);
});

test("marks only missing file paths as planned and never lists a directory", () => {
  const { result, plan } = runPlanner([
    {
      id: "path-state",
      identifier: "PLA-3100",
      title: "Use a repository control file",
      description: [
        "## Complete behavior and rules",
        "Read the checked-in verifier contract and write one bounded validation result.",
        "## Exact paths",
        "- `tools/spec-lint/package.json`",
        "- `tools/delivery/`",
      ].join("\n"),
    },
  ]);

  assert.equal(result.status, 0, result.stderr);
  assert.ok(plan);
  const paths = plan.updates[0].after.description
    .split("## Exact paths\n")[1]
    .split("\n## Review and readiness")[0];
  assert.match(paths, /^- `tools\/spec-lint\/package\.json`$/m);
  assert.doesNotMatch(paths, /Planned: `tools\/spec-lint\/package\.json`|`tools\/delivery\/`/);
  assert.match(paths, /Planned: `tests\/integration\/use-a-repository-control-file\.spec\.ts`/);
  assert.match(paths, /Planned: `reports\/evidence\/use-a-repository-control-file-proof\.json`/);
});

test("keeps static verifier paths out of execution prose", () => {
  const { result, plan } = runPlanner([
    {
      id: "static-verifier",
      identifier: "PLA-3101",
      title: "Reconcile an approved contract",
      description: [
        "## Outcome",
        "Reconcile one approved contract from immutable repository inputs.",
        "## Complete behavior and rules",
        "The verifier records one deterministic accepted or rejected result without customer mutation.",
        "## Exact paths",
        "- `tools/delivery/reconcile-approved-contract.ts`",
        "- `tests/integration/reconcile-approved-contract.spec.ts`",
        "- `reports/evidence/reconcile-approved-contract-proof.json`",
      ].join("\n"),
    },
  ]);

  assert.equal(result.status, 0, result.stderr);
  assert.ok(plan);
  const description = plan.updates[0].after.description;
  const prose = description
    .replace(/## Exact paths\n[\s\S]*?\n## Review and readiness/, "## Review and readiness");
  assert.doesNotMatch(prose, /tools\/delivery\/reconcile-approved-contract/);
  assert.doesNotMatch(prose, /[.!?]\s+the protected verifier/);
  const audit = auditLinearNormalizationPlan(
    { updates: plan.updates },
    { root: process.cwd() },
  );
  assert.ok(!audit.issues[0].flags.some(
    (flag) => flag.code === "source_history_or_control_plane_prose"
  ), JSON.stringify(audit.issues));
});

test("does not invent frontend pages for backend-only buyer and seller work", () => {
  const { result, plan } = runPlanner([
    {
      id: "buyer-schema",
      identifier: "BUY-3100",
      title: "Marketplace Listing Entity Schema",
      description: "## Complete behavior and rules\nValidate the entity schema before one atomic write.",
    },
    {
      id: "seller-worker",
      identifier: "SEL-3100",
      title: "Bid Webhook Retry Worker",
      description: "## Complete behavior and rules\nRetry one failed webhook with the same idempotency identity.",
    },
  ]);

  assert.equal(result.status, 0, result.stderr);
  assert.ok(plan);
  for (const update of plan.updates) {
    const paths = update.after.description
      .split("## Exact paths\n")[1]
      .split("\n## Review and readiness")[0];
    assert.match(paths, /`convex\//);
    assert.doesNotMatch(paths, /apps\/(?:buyer|seller)\/app\/.+\/page\.tsx/);
  }
});

test("converts partial tables to labeled prose without synthetic values", () => {
  const { result, plan } = runPlanner([
    {
      id: "table",
      identifier: "PLA-3101",
      title: "[F-003] Validate a bounded state matrix",
      description: [
        "## Complete behavior and rules",
        "| Rule | State | Source |",
        "| --- | --- | --- |",
        "| Allow | ready | §4.2 |",
        "| Reject | | §4.2 |",
      ].join("\n"),
    },
  ]);

  assert.equal(result.status, 0, result.stderr);
  assert.ok(plan);
  const behavior = plan.updates[0].after.description
    .split("## Complete behavior and rules\n")[1]
    .split("\n## States and transitions")[0];
  assert.match(behavior, /\*\*Rule:\*\* Allow; \*\*State:\*\* ready/);
  assert.match(behavior, /\*\*Rule:\*\* Reject/);
  assert.doesNotMatch(behavior, /\bSource\b|Not applicable|\|\s*\|/i);
  assert.equal(plan.updates[0].diagnostics.requiresReview, false);
});

test("keeps balanced code fences and exact underscore identifiers", () => {
  const { result, plan } = runPlanner([
    {
      id: "webhook",
      identifier: "SEL-3101",
      title: "Process document attachment webhook",
      description: [
        "## Complete behavior and rules",
        "Validate the webhook envelope before dispatch.",
        "```json",
        '{"event_name":"doc_attach_completed","retry_count":0}',
        "```",
        "## Recovery",
        "Retry `doc_attach_completed` with the same delivery identity after the dependency recovers.",
      ].join("\n"),
    },
  ]);

  assert.equal(result.status, 0, result.stderr);
  assert.ok(plan);
  const description = plan.updates[0].after.description;
  assert.equal(description.match(/^```/gm)?.length, 2);
  assert.match(description, /doc_attach_completed/);
  assert.match(description, /retry_count/);
});

test("closes adjacent typed code samples explicitly", () => {
  const { result, plan } = runPlanner([
    {
      id: "samples",
      identifier: "SEL-3102",
      title: "Validate adjacent API samples",
      description: [
        "## Complete behavior and rules",
        "Validate both bounded samples before dispatch.",
        "```text",
        "POST /v1/example",
        "```json",
        '{"result":"accepted"}',
      ].join("\n"),
    },
  ]);

  assert.equal(result.status, 0, result.stderr);
  assert.ok(plan);
  const description = plan.updates[0].after.description;
  assert.equal(description.match(/^```/gm)?.length, 4);
  assert.match(description, /POST \/v1\/example\n```\n\n```json/);
  assert.match(description, /```json\n\{"result":"accepted"\}\n\n```/);
});

test("does not reject legitimate canonical prose solely because it is 240 characters", () => {
  const legitimate = (
    "Validate the complete canonical record with bounded authorization, isolation, recovery, and proof before committing it. " +
    "Keep every named field deterministic across the same request identity and production-equivalent verification context."
  ).padEnd(239, " xy").slice(0, 239) + "Z";
  assert.equal(legitimate.length, 240);
  const { result, plan } = runPlanner([
    {
      id: "long-fact",
      identifier: "PLA-3102",
      title: "Validate a long canonical fact",
      description: `## Complete behavior and rules\n${legitimate}`,
    },
  ]);

  assert.equal(result.status, 0, result.stderr);
  assert.ok(plan);
  assert.match(plan.updates[0].after.description, new RegExp(legitimate.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
});

test("uses one runtime test and no inferred event for a non-M.5 gate row", () => {
  const root = mkdtempSync(join(tmpdir(), "sourcera-non-m5-gate-"));
  try {
    mkdirSync(join(root, "delivery"), { recursive: true });
    writeFileSync(
      join(root, "delivery/linear-runtime-path-registry.json"),
      readFileSync("delivery/linear-runtime-path-registry.json", "utf8"),
    );
    writeFileSync(
      join(root, "Sourcera_Master_Spec.md"),
      "| `non_catalog_runtime_gate` | product | `spec_binding_pending_pack_test` | Runtime worker request handling. | Every accepted request commits once and every invalid request fails closed. | Test failure naming the rejected case. | Runtime worker contract. |\n",
    );
    writeFileSync(join(root, "manifest.json"), JSON.stringify({
      rows: [{
        requirementId: "RG:non_catalog_runtime_gate",
        outcome: "Prove runtime gate non_catalog_runtime_gate",
        sourceDoc: "Sourcera_Master_Spec.md",
        sourceVersion: "live",
        section: "line:1",
        dependencies: [],
        disposition: "proof_only",
        release: "R0",
        issueId: "PLA-3103",
      }],
    }));
    writeFileSync(join(root, "checksums.json"), JSON.stringify({ sources: [] }));
    writeFileSync(join(root, "source-map.json"), JSON.stringify({
      ...HISTORICAL_NORMALIZATION_SOURCE_MAP_MARKER,
      sources: {},
      oversizedOrCrossCutting: [],
      extractionPolicy: {},
    }));
    const { result, plan } = runPlanner(
      [{
        id: "non-m5",
        identifier: "PLA-3103",
        title: "[Runtime gate] Non Catalog Runtime Gate",
        description: null,
      }],
      [
        "--root", root,
        "--manifest", "manifest.json",
        "--checksums", "checksums.json",
        "--source-map", "source-map.json",
      ],
    );

    assert.equal(result.status, 0, result.stderr);
    assert.ok(plan);
    const description = plan.updates[0].after.description;
    assert.match(description, /tests\/integration\/gates\/non_catalog_runtime_gate\.spec\.ts/);
    assert.match(description, /explicit success and failure cases/i);
    assert.doesNotMatch(description, /positive fixture|negative fixture|spec_lint\.appendix_m_gate_run/);
    assert.match(description, /registers no product event, customer analytics event, webhook, or customer notification/i);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("M.5 line-addressed rows use fixtures and the registered shared event", () => {
  const { result, plan } = runPlanner([
    {
      id: "line-addressed-gate",
      identifier: "PLA-754",
      title: "[Runtime gate] Solo Charge Kind Registered",
      description: null,
    },
  ]);

  assert.equal(result.status, 0, result.stderr);
  assert.ok(plan);
  const description = plan.updates[0].after.description;
  assert.match(description, /tools\/spec-lint\/fixtures\/solo_charge_kind_registered\/pass\.md/);
  assert.match(description, /tools\/spec-lint\/fixtures\/solo_charge_kind_registered\/fail\.md/);
  assert.match(description, /spec_lint\.appendix_m_gate_run/);
  assert.match(description, /gate_id=solo_charge_kind_registered/);
  assert.doesNotMatch(description, /spec_lint\.solo_charge_kind_registered_(?:started|succeeded|failed|run)/);
});

test("uses the exact fail-closed runtime path registry for product, hybrid, and static lanes", () => {
  const { result, plan } = runPlanner([
    {
      id: "eval-starter-gate",
      identifier: "PLA-716",
      title: "[F-816] eval_starter_seed_use_case_index_validity CI Gate",
      description: null,
    },
    {
      id: "replication-gate",
      identifier: "PLA-791",
      title: "[Runtime gate] S3 Replication Policy Residency Bound",
      description: null,
    },
    {
      id: "revenue-leak-gate",
      identifier: "PLA-819",
      title: "[Runtime gate] Legal Entity Residency Change Revenue Leak Test",
      description: null,
    },
  ]);

  assert.equal(result.status, 0, result.stderr);
  assert.ok(plan);
  const byId = new Map(plan.updates.map((update) => [update.issueId, update.after.description]));

  const hybrid = byId.get("PLA-716") ?? "";
  assert.match(hybrid, /`hybrid` path set/);
  assert.match(hybrid, /convex\/evalstarter-entity\.ts/);
  assert.match(hybrid, /tools\/spec-lint\/gates\/eval_starter_seed_use_case_index_validity\.ts/);
  assert.match(hybrid, /tests\/integration\/eval-starter-seed-use-case-index-validity\.spec\.ts/);
  assert.match(hybrid, /\.github\/workflows\/app-ci\.yml/);
  assert.match(hybrid, /fail-closed pending real same-commit proof|path presence alone is not readiness/i);

  const staticCi = byId.get("PLA-791") ?? "";
  assert.match(staticCi, /`static_ci` path set/);
  assert.match(staticCi, /infra\/terraform\/modules\/residency-replication\/main\.tf/);
  assert.match(staticCi, /tests\/integration\/s3-replication-policy-residency-bound\.spec\.ts/);
  assert.match(staticCi, /excludes a product handler/i);
  assert.doesNotMatch(staticCi, /convex\/s3-replication-policy-residency-bound/);

  const probed = byId.get("PLA-819") ?? "";
  assert.match(probed, /synthetics\/legal-entity-residency-change-revenue-leak\.ts/);
  assert.match(probed, /\.github\/workflows\/production-release\.yml/);
  assert.match(probed, /production probes/i);
});

test("keeps source-repair dossiers source-only and binds API parity to exact runtime roots", () => {
  const root = mkdtempSync(join(tmpdir(), "sourcera-runtime-residual-paths-"));
  try {
    mkdirSync(join(root, "delivery"), { recursive: true });
    writeFileSync(
      join(root, "delivery/linear-runtime-path-registry.json"),
      readFileSync("delivery/linear-runtime-path-registry.json", "utf8"),
    );
    writeFileSync(join(root, "manifest.json"), JSON.stringify({ rows: [] }));
    writeFileSync(join(root, "checksums.json"), JSON.stringify({ sources: [] }));
    writeFileSync(join(root, "source-map.json"), JSON.stringify({
      ...HISTORICAL_NORMALIZATION_SOURCE_MAP_MARKER,
      sources: {},
      trustedDrafts: {},
      oversizedOrCrossCutting: [],
      extractionPolicy: {},
    }));
    const sourceRepairIds = [
      "BUY-410",
      "PLA-1004",
      "PLA-1006",
      "PLA-1009",
      "PLA-1010",
      "PLA-1020",
    ];
    const sourceRepairDescription = [
      "## Outcome",
      "Ratify one exact current contract before its runtime owner enables behavior.",
      "## Complete behavior and rules",
      "This issue owns the bounded source decision and its validation only.",
      "## Exact paths",
      "- `Sourcera_Master_Spec.md`",
      "- `tools/delivery/ticket-integrity.test.ts`",
    ].join("\n");
    const { result, plan } = runPlanner(
      [
        ...sourceRepairIds.map((identifier, index) => ({
          id: identifier,
          identifier,
          title: `[SG-F999-${String(index + 1).padStart(3, "0")}] Source repair contract ${index + 1}`,
          description: sourceRepairDescription,
        })),
        {
          id: "PLA-958",
          identifier: "PLA-958",
          title: "[R5 Proof] Public API OpenAPI/Runtime Parity",
          description: [
            "## Outcome",
            "Prove every public API operation matches generated OpenAPI at runtime.",
            "## Complete behavior and rules",
            "Every endpoint must return its registered schema and safe error body.",
          ].join("\n"),
        },
      ],
      [
        "--root", root,
        "--manifest", "manifest.json",
        "--checksums", "checksums.json",
        "--source-map", "source-map.json",
      ],
    );

    assert.equal(result.status, 0, result.stderr);
    assert.ok(plan);
    const byId = new Map(plan.updates.map((update) => [update.issueId, update.after.description]));
    for (const issueId of sourceRepairIds) {
      const description = byId.get(issueId) ?? "";
      assert.match(description, /This is a source-only repair/);
      assert.match(description, /No runtime implementation path is in scope/);
      assert.doesNotMatch(description, /`convex\//);
    }

    const apiParity = byId.get("PLA-958") ?? "";
    for (const path of [
      "app/api/health/route.ts",
      "apps/buyer/app/api/health/route.ts",
      "apps/seller/app/api/health/route.ts",
      "convex/http.ts",
      "delivery/public-api-route-registry.json",
      "tests/openapi/public-api-parity.spec.ts",
      "tests/integration/public-api-contract.spec.ts",
      "tests/e2e/public-api-safe-smoke.spec.ts",
    ]) assert.match(apiParity, new RegExp(path.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("keeps Marketplace Listing extraction inside its owning entity section", () => {
  const { result, plan } = runPlanner([
    {
      id: "marketplace-listing",
      identifier: "BUY-220",
      title: "[F-112] Marketplace Listing Entity",
      description: null,
    },
  ]);

  assert.equal(result.status, 0, result.stderr);
  assert.ok(plan);
  const description = plan.updates[0].after.description;
  assert.match(description, /^## Outcome\nEnsure marketplace Listing is the seller-authored public Marketplace row/im);
  assert.match(description, /`seller_profile_id`/);
  assert.match(description, /`marketplace_listing_status`/);
  assert.match(description, /seller-authored public Marketplace row/i);
  assert.doesNotMatch(
    description,
    /`budget_value_dollars`|`fx_rate_locked`|`published_payload_json`|`pricing_table_version_status`|`breaking_change_flag`|`customer_notification_sent_at`|wallet MUST never hold/i,
  );
  const behavior = description.split("## Complete behavior and rules\n")[1].split("\n\n## States and transitions")[0];
  const states = description.split("## States and transitions\n")[1].split("\n\n## Permissions, isolation, and privacy")[0];
  const permissions = description.split("## Permissions, isolation, and privacy\n")[1].split("\n\n## Exact paths")[0];
  const success = description.split("### Success\n")[1].split("\n\n### Failure")[0];
  const failure = description.split("### Failure\n")[1].split("\n\n### Recovery")[0];
  const recovery = description.split("### Recovery\n")[1].split("\n\n## Rollout")[0];
  assert.match(states, /(?:\| \(init\) \| `draft` \||From:\*\* \(init\).*To:\*\* `draft`)/);
  assert.match(permissions, /Marketplace-domain, seller-owned/i);
  assert.match(permissions, /Archived listings retain public-content tombstones for 180 days/i);
  assert.match(success, /Creating or updating a Marketplace Listing MUST reject/i);
  assert.match(failure, /Taxonomy node deprecated after publish/i);
  assert.match(recovery, /published listing remains readable/i);
  assert.doesNotMatch(behavior, /\| \(init\) \| `draft` \||Archived listings retain public-content tombstones|Taxonomy node deprecated after publish|Creating or updating a Marketplace Listing MUST reject/i);
});

test("replaces the retired marketplace pricing TBD with the canonical publish rule", () => {
  const { result, plan } = runPlanner([{
    id: "marketplace-entity-set",
    identifier: "BUY-224",
    title: "Marketplace Entity Set",
    description: [
      "## Complete behavior and rules",
      "| Field | Type | Constraints | Notes |",
      "| --- | --- | --- | --- |",
      "| `min_price_cents_monthly` | BigInt | Nullable; >= 0 | Minimum monthly price in integer cents; null if custom/TBD |",
    ].join("\n"),
  }]);

  assert.equal(result.status, 0, result.stderr);
  assert.ok(plan);
  const description = plan.updates[0].after.description;
  assert.match(description, /may be `null` while `status=draft` or when `pricing_model=custom`/);
  assert.doesNotMatch(description, /\bTBD\b/);
});

test("removes source delegation, planning history, manual source IDs, and copied readiness metadata", () => {
  const { result, plan } = runPlanner([
    {
      id: "scrub-exact-leakage",
      identifier: "PLA-2303",
      title: "Enforce one exact tenant denial",
      description: [
        "## Complete behavior and rules",
        "According to Master Spec §5.1, reject every cross-organization read before serialization. The denied request writes nothing.",
        "This was authored in v7.2.0-rem remediation on 2026-07-01 for D-1.4-001.",
        "## States and transitions",
        "Ready moves to denied after authorization fails.",
        "## Permissions, isolation, and privacy",
        "Only the current organization may read its own row.",
        "## Exact paths",
        "- `convex/security/tenant-denial.ts`",
        "- `tests/integration/tenant-denial.spec.ts`",
        "## Review and readiness",
        "Codex-ready: true. Owner: Blake Rowley. Estimate: unestimated.",
        "## Acceptance tests",
        "Success:",
        "An authorized same-organization read returns the row.",
        "Failure:",
        "A cross-organization read returns 404 and no row data.",
        "Recovery:",
        "Correct the organization scope and retry once.",
        "## Rollout",
        "Canary the denial against one synthetic organization.",
        "## Rollback",
        "Restore the last verified authorization handler.",
        "## Telemetry",
        "No product event, webhook, or customer notification is emitted.",
        "## Named proof",
        "Retain `reports/evidence/tenant-denial-proof.json`.",
        "## Assumptions and validation triggers",
        "A changed organization key invalidates the proof.",
        "## Exclusions",
        "Cross-organization support impersonation is excluded.",
      ].join("\n"),
    },
  ]);

  assert.equal(result.status, 0, result.stderr);
  assert.ok(plan);
  const description = plan.updates[0].after.description;
  assert.match(description, /reject every cross-organization read before serialization/i);
  assert.doesNotMatch(description, /According to Master Spec|authored in|v7\.2\.0-rem|2026-07-01|D-1\.4-001|Codex-ready|Blake Rowley|unestimated|^Owner:|^Estimate:/im);
});

test("preserves route parameter separators while scrubbing orphan prose separators", () => {
  const { result, plan } = runPlanner([
    {
      id: "route-parameter",
      identifier: "PLA-2315",
      title: "Render a parameterized seller page",
      description: [
        "## Purpose",
        "Render one authorized Seller page at `/sellers/:slug`.",
        "## Complete behavior and rules",
        "Resolve `/sellers/:slug` and `/sellers/:slug/og-image.png` without changing either route parameter.",
      ].join("\n"),
    },
  ]);

  assert.equal(result.status, 0, result.stderr);
  assert.ok(plan);
  const description = plan.updates[0].after.description;
  assert.match(description, /`\/sellers\/:slug`/);
  assert.match(description, /`\/sellers\/:slug\/og-image\.png`/);
  assert.doesNotMatch(description, /\/sellers:slug/);
});

test("uses each current purpose as the issue outcome instead of a shared source paragraph", () => {
  const { result, plan } = runPlanner([
    {
      id: "first",
      identifier: "PLA-2304",
      title: "Six-effect analytics overview",
      description: [
        "## Purpose",
        "Show all six network effects with a separate contribution and trend for every category.",
        "## Complete behavior and rules",
        "Dashboard data freshness is shared across analytics pages.",
      ].join("\n"),
    },
    {
      id: "second",
      identifier: "PLA-2305",
      title: "Loop lifecycle analytics",
      description: [
        "## Purpose",
        "Show each loop lifecycle, kill-switch state, and conversion result independently.",
        "## Complete behavior and rules",
        "Dashboard data freshness is shared across analytics pages.",
      ].join("\n"),
    },
  ]);

  assert.equal(result.status, 0, result.stderr);
  assert.ok(plan);
  const outcomes = plan.updates.map((update) =>
    update.after.description.split("## Outcome\n")[1].split("\n\n## Complete behavior and rules")[0]
  );
  assert.notEqual(outcomes[0], outcomes[1]);
  assert.match(outcomes[0], /six network effects/i);
  assert.match(outcomes[1], /loop lifecycle/i);
  assert.doesNotMatch(outcomes.join("\n"), /Dashboard data freshness/i);
});

test("fails closed when two issues retain the same semantic outcome", () => {
  const { result, plan } = runPlanner([
    {
      id: "first",
      identifier: "PLA-2310",
      title: "First bounded surface",
      description: "## Purpose\nShow one bounded current result safely.",
    },
    {
      id: "second",
      identifier: "PLA-2311",
      title: "Second bounded surface",
      description: "## Purpose\nShow one bounded current result safely.",
    },
  ]);

  assert.notEqual(result.status, 0);
  assert.equal(plan, null);
  assert.match(result.stderr, /outcomes are duplicated/i);
});

test("repairs known grammar defects and standalone proof filenames", () => {
  const { result, plan } = runPlanner([
    {
      id: "grammar",
      identifier: "BUY-2306",
      title: "Buyer score review",
      description: [
        "## Purpose",
        "Let an authorized buyer review one score safely.",
        "## Complete behavior and rules",
        "The comparison is advisory only: it never changes a phase gate.",
        "The cap is mirrored in §34.1; rejected transitions conform to Appendix L.14.",
        "Same as above.",
        "## Named proof",
        "`BUY-2306-phase11-consensus-proof.json` retains the result.",
      ].join("\n"),
    },
  ]);

  assert.equal(result.status, 0, result.stderr);
  assert.ok(plan);
  const description = plan.updates[0].after.description;
  assert.doesNotMatch(description, /An accepted the|advisory only:it|mirrored in\s*[;,.]|conform to\s*[;,.]|\b(?:is|are)\s*;|\bto\s*\.|\(\s*\/\s*\)|Same as above/i);
  assert.doesNotMatch(description, /`-+[^`]*proof\.json`|`[^`/]*proof\.json`/i);
  assert.match(description, /`reports\/evidence\/phase11-consensus-proof\.json`/i);
});

test("removes planning provenance but preserves current canceled and retired lifecycle states", () => {
  const { result, plan } = runPlanner([
    {
      id: "history",
      identifier: "PLA-2307",
      title: "Current lifecycle enforcement",
      description: [
        "## Purpose",
        "Enforce the current lifecycle without copied planning history.",
        "## Complete behavior and rules",
        "Retained pre-cutover provenance only: canceled issue and description SHA-256 `aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa`.",
        "Old Linear duplicates are retired and no pre-cutover duplicate remains active.",
        "This content was reproduced from `_baselines/retired-sources/Old_Spec.md`.",
        "A current job may move from `active` to `canceled`, and a current alias may move from `active` to `retired`.",
      ].join("\n"),
    },
  ]);

  assert.equal(result.status, 0, result.stderr);
  assert.ok(plan);
  const description = plan.updates[0].after.description;
  assert.doesNotMatch(description, /Retained (?:pre-cutover )?provenance|Old Linear duplicates|_baselines\/retired-sources|description SHA-256/i);
  assert.match(description, /`active` to `canceled`/);
  assert.match(description, /`active` to `retired`/);
});

test("keeps buyer authority when supporting recovery text mentions Ops", () => {
  const { result, plan } = runPlanner([
    {
      id: "actor",
      identifier: "BUY-2308",
      title: "Use Case decomposition",
      description: [
        "## Purpose",
        "Let a buyer split one Use Case into independently scorable Requirements.",
        "## Complete behavior and rules",
        "A Workspace Owner creates the decomposition; Ops may restore a soft-deleted row during recovery.",
      ].join("\n"),
    },
  ]);

  assert.equal(result.status, 0, result.stderr);
  assert.ok(plan);
  const permissions = plan.updates[0].after.description
    .split("## Permissions, isolation, and privacy\n")[1]
    .split("\n\n## Exact paths")[0];
  assert.match(permissions, /Buyer Workspace actor/);
  assert.doesNotMatch(permissions, /authorized Ops role/);
});

test("uses CI authority for runtime gates instead of a tenant caller", () => {
  const { result, plan } = runPlanner([
    {
      id: "runtime-authority",
      identifier: "PLA-804",
      title: "[Runtime gate] Accessibility settings preference contract",
      description: [
        "## Purpose",
        "Make the protected CI check reject an invalid preference contract.",
        "## Permissions",
        "Only an authenticated organization caller may run this check.",
      ].join("\n"),
    },
  ]);

  assert.equal(result.status, 0, result.stderr);
  assert.ok(plan);
  const permissions = plan.updates[0].after.description
    .split("## Permissions, isolation, and privacy\n")[1]
    .split("\n\n## Exact paths")[0];
  assert.match(permissions, /CI gate runner/);
  assert.doesNotMatch(permissions, /authenticated organization|tenant caller|matching organization/i);
});

test("uses operation-scoped authority for cross-actor source contracts", () => {
  const cases: Record<string, { title: string; required: RegExp[] }> = {
    "BUY-312": {
      title: "Q&A Lifecycle & Phase Gating",
      required: [/Buyer Workspace actor/, /invited Seller Org actor/, /phase-transition worker/, /PRIVATE threads/],
    },
    "BUY-317": {
      title: "Q&A Plan Limits & Features",
      required: [/invited Seller Org actor/, /Buyer Workspace Owner/, /additional-slot cap/, /delivery service/],
    },
    "BUY-334": {
      title: "Match Score Retraining Cadence & Model Versioning",
      required: [/training service/, /Applied-ML and Marketing/, /Ops model-lifecycle role/, /retirement worker/],
    },
    "BUY-341": {
      title: "Vendor Opt-Out API & Webhooks",
      required: [/seller_billing_admin/, /ops_opt_out_admin/, /authority-probe worker/, /Buyer-console/],
    },
    "BUY-344": {
      title: "Abuse Report Severity Matrix",
      required: [/severity evaluator/, /Ops triage reviewer/, /two distinct `ops_content_admin`/, /SLA worker/],
    },
    "PLA-267": {
      title: "Pipeline Surface Compression",
      required: [/Buyer Workspace actor/, /Seller Bid Workspace actor/, /presentation component/, /grants no Ops/],
    },
    "PLA-551": {
      title: "Abuse Prevention Controls",
      required: [/public, Buyer, Seller, Ops, or service caller/, /scanning services/, /grants no additional business operation/, /underlying handler/],
    },
    "PLA-668": {
      title: "Canonical Event Family Registry",
      required: [/Ops analytics-schema maintainer/, /Usage Event validators and outbox workers/, /Buyer, Seller, or Ops dashboard reader/, /cannot mutate registry rows/],
    },
    "PLA-698": {
      title: "Buyer Referral State Machine",
      required: [/buyer_billing_admin/, /referee-redemption service/, /Signal Integrity Monitor/, /authorized Ops decision-maker/],
    },
    "PLA-732": {
      title: "Input/Field Component",
      required: [/Buyer, Seller, Ops, or public caller/, /FormField/, /grants? a role/, /Protected CI/],
    },
    "PLA-996": {
      title: "Prove the exact R0 First Defensible Evaluation journey",
      required: [/protected staging verifier/, /synthetic Buyer actor/, /synthetic Seller actor/, /cannot grant roles/],
    },
    "SEL-170": {
      title: "Marketplace Tags & Controlled Vocabulary",
      required: [/ops_taxonomy_admin/, /ops_marketing_editor/, /eligible authenticated Seller actor/, /residency-bounded migration worker/],
    },
    "SEL-171": {
      title: "Seller Tag Proposal Workflow",
      required: [/Seller Org actor/, /ops_marketing_editor/, /delivery and SLA workers/, /cannot claim, approve, reject, merge, publish/],
    },
    "SEL-180": {
      title: "Marketplace Discovery Pricing",
      required: [/seller_billing_admin/, /authenticated Buyer actor/, /ops_verification_reviewer/, /eligibility, auction, settlement, activation, expiry, and billing workers/],
    },
  };
  const sourceMap = JSON.parse(
    readFileSync("delivery/linear-normalization-source-map.json", "utf8"),
  ) as { trustedDrafts?: Record<string, unknown> };
  if (sourceMap.trustedDrafts) delete sourceMap.trustedDrafts["PLA-996"];
  const { result, plan } = runPlanner(
    Object.entries(cases).map(([identifier, value]) => ({
      id: identifier,
      identifier,
      title: value.title,
      description: null,
    })),
    [],
    sourceMap,
  );

  assert.equal(result.status, 0, result.stderr);
  assert.ok(plan);
  const byId = new Map(plan.updates.map((update) => [update.issueId, update.after.description]));
  for (const [issueId, value] of Object.entries(cases)) {
    const description = byId.get(issueId) ?? "";
    const permissions = description
      .split("## Permissions, isolation, and privacy\n")[1]
      .split("\n\n## Exact paths")[0];
    for (const pattern of value.required) assert.match(permissions, pattern, issueId);
    assert.doesNotMatch(
      permissions,
      /Only (?:the authenticated (?:Buyer Workspace|Seller Org) actor|the authorized Ops role) may execute/i,
      issueId,
    );
  }

  const audit = auditLinearNormalizationPlan(plan, { root: process.cwd() });
  for (const issue of audit.issues) {
    assert.ok(
      !issue.flags.some((flag) => flag.code === "authority_scope_contradiction"),
      `${issue.issueId}: ${issue.flags.map((flag) => `${flag.code}: ${flag.evidence.join("; ")}`).join(" | ")}`,
    );
    if (issue.issueId === "SEL-170") {
      assert.ok(
        !issue.flags.some((flag) => flag.code === "planning_or_version_history"),
        `${issue.issueId}: ${issue.flags.map((flag) => `${flag.code}: ${flag.evidence.join("; ")}`).join(" | ")}`,
      );
    }
  }
});

test("rewrites telemetry labels as metric dimensions and strips manual blocker tags", () => {
  const { result, plan } = runPlanner([
    {
      id: "telemetry-dimensions",
      identifier: "PLA-2312",
      title: "Measure a bounded worker",
      description: [
        "## Purpose",
        "Measure one bounded worker result without copied planning metadata.",
        "## Complete behavior and rules",
        "The worker must finish within 30 seconds. BL-P1-PH22-NUM/DM closure.",
        "## Telemetry",
        "Labels: `job_name`, `residency_region`.",
      ].join("\n"),
    },
  ]);

  assert.equal(result.status, 0, result.stderr);
  assert.ok(plan);
  const description = plan.updates[0].after.description;
  assert.match(description, /Metric dimensions: `job_name`, `residency_region`\./);
  assert.doesNotMatch(description, /^\s*Labels\s*:|BL-[A-Z0-9._/-]+|\bclosure\./im);
  assert.match(description, /within 30 seconds/);
});

test("does not split an inline-code assertion at an ellipsis", () => {
  const { result, plan } = runPlanner([
    {
      id: "sql-ellipsis",
      identifier: "PLA-2313",
      title: "Decrement one quota atomically",
      description: [
        "## Purpose",
        "Decrement one available quota row atomically.",
        "## Complete behavior and rules",
        "Use atomic decrement (`UPDATE ... WHERE quota_remaining > 0 RETURNING quota_remaining`); otherwise reject without a partial write.",
      ].join("\n"),
    },
  ]);

  assert.equal(result.status, 0, result.stderr);
  assert.ok(plan);
  const description = plan.updates[0].after.description;
  assert.match(description, /`UPDATE \.\.\. WHERE quota_remaining > 0 RETURNING quota_remaining`/);
  assert.equal((description.match(/(?<!`)`(?!`)/g) ?? []).length % 2, 0);
});

test("does not invent duplicate implementation paths when exact body paths exist", () => {
  const { result, plan } = runPlanner([
    {
      id: "exact-body-paths",
      identifier: "SEL-2314",
      title: "Seller Dashboard",
      description: [
        "## Purpose",
        "Render one authorized Seller Dashboard from canonical module projections.",
        "## Product scope",
        "The dashboard shows active bids, pending actions, and the exact first-bid empty state.",
        "## Target paths",
        "* `apps/seller/app/dashboard/page.tsx`",
        "* `convex/sellerDashboard.ts`",
        "* `tests/e2e/seller-dashboard.spec.ts`",
        "* `reports/evidence/seller-dashboard-production.json`",
      ].join("\n"),
    },
  ]);

  assert.equal(result.status, 0, result.stderr);
  assert.ok(plan);
  const paths = plan.updates[0].after.description
    .split("## Exact paths\n")[1]
    .split("\n## Review and readiness")[0];
  assert.match(paths, /apps\/seller\/app\/dashboard\/page\.tsx/);
  assert.match(paths, /convex\/sellerDashboard\.ts/);
  assert.doesNotMatch(paths, /apps\/seller\/app\/seller-dashboard\/page\.tsx|convex\/seller-dashboard\.ts|seller-dashboard-proof\.json/);
});
