# Sourcera Delivery Control Plane Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a fail-closed repository delivery control plane, quarantine false Linear readiness, create R0–R5 releases, and qualify only the first R0 foundation child.

**Architecture:** TypeScript parsers convert the current feature inventory, live runtime-gate JSON, canonical delivery inputs, and a Linear snapshot into stable manifest rows. Independent graph, readiness, drift, and scorecard validators generate reports and fail CI when delivery integrity breaks. Linear remains a read-back-verified mirror of repository truth.

**Tech Stack:** Node.js 22, TypeScript, `node:test`, existing `tsx` and TypeScript dependencies under `tools/spec-lint`, GitHub Actions, Linear connector.

## Global Constraints

- Live `stamp_gate.ts --json` and `exact_status_scan.ts --json` own volatile truth.
- Do not copy changing counts into authored guidance or configuration.
- `Sourcera_Master_Spec.md` outranks companion docs; §34 owns pricing.
- Runtime readiness requires the §M.5 evidence lane; documentation never promotes a row.
- No new runtime dependencies.
- Every production behavior change follows red-green-refactor.
- Generated files under `reports/delivery/` are never hand edited.
- `codex-ready` is derived and removed whenever any required field fails.
- Current capacity default: one lane, WIP 1.
- Run work in the current `codex/sourcera-delivery-control-plane` branch.

---

## File Map

| File | Responsibility |
|---|---|
| `tools/delivery/lib/model.ts` | Shared delivery types and finding codes. |
| `tools/delivery/lib/sources.ts` | Feature-inventory and runtime-gate parsing. |
| `tools/delivery/lib/releases.ts` | Release-config validation. |
| `tools/delivery/lib/graph.ts` | Dependency cycle and release-inversion checks. |
| `tools/delivery/lib/readiness.ts` | `codex-ready` qualification rules. |
| `tools/delivery/lib/drift.ts` | Repo-to-Linear traceability and duplicate checks. |
| `tools/delivery/lib/scorecard.ts` | Evidence-based 100-point score. |
| `tools/delivery/generate.ts` | Deterministic report generation. |
| `tools/delivery/verify.ts` | Fail-closed CLI. |
| `tools/delivery/linear-live.ts` | Authenticated Linear read-back and snapshot comparison. |
| `tools/delivery/tsconfig.json` | Strict delivery-tool typecheck. |
| `delivery/*.json*` | Canonical releases, release plan, decisions, risks, dispositions, validation, and Linear snapshot. |
| `reports/delivery/*.json` | Generated manifest, maps, findings, and score. |
| `.github/workflows/delivery-integrity.yml` | Pull-request and scheduled enforcement. |

---

### Task 1: Parse stable source identities

**Files:**
- Create: `tools/delivery/lib/model.ts`
- Create: `tools/delivery/lib/sources.ts`
- Create: `tools/delivery/sources.test.ts`
- Create: `tools/delivery/fixtures/feature-inventory-valid.md`
- Create: `tools/delivery/fixtures/stamp-valid.json`
- Create: `tools/delivery/tsconfig.json`

**Interfaces:**
- Consumes: feature-inventory Markdown and stamp-gate JSON strings.
- Produces: `parseFeatureInventory(markdown): SourceRequirement[]` and `parseRuntimeGate(json): SourceRequirement[]`.

- [ ] **Step 1: Add fixtures and a failing parser test**

```ts
// tools/delivery/sources.test.ts
import { strict as assert } from "node:assert";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";
import { parseFeatureInventory, parseRuntimeGate, sourceReferenceFindings } from "./lib/sources.js";

const fixture = (name: string) => readFileSync(resolve(process.cwd(), "tools/delivery/fixtures", name), "utf8");

test("parses stable feature and runtime identities", () => {
  const features = parseFeatureInventory(fixture("feature-inventory-valid.md"));
  assert.deepEqual(features.map((row) => row.requirementId), ["F-001", "F-002"]);
  assert.deepEqual(features[1].dependencies, ["F-001"]);

  const gates = parseRuntimeGate(fixture("stamp-valid.json"));
  assert.deepEqual(gates.map((row) => row.requirementId), ["RG:gate_a"]);
  assert.equal(gates[0].disposition, "proof_only");
});

test("rejects duplicate identities", () => {
  const duplicate = `${fixture("feature-inventory-valid.md")}\n| F-001 | Duplicate | surface | §1.1 | — | master_spec | v7.1.0a | duplicate | — |`;
  assert.throws(() => parseFeatureInventory(duplicate), /Duplicate requirement_id F-001/);
});

test("fails a broken source path", () => {
  const [row] = parseFeatureInventory(fixture("feature-inventory-valid.md"));
  assert.equal(sourceReferenceFindings([{ ...row, sourceDoc: "missing.md" }], process.cwd())[0].code, "source_file_missing");
});
```

```markdown
<!-- tools/delivery/fixtures/feature-inventory-valid.md -->
| feature_id | feature_name | feature_class | primary_section_anchor | secondary_section_anchors | originating_doc | introduced_in_version | one_line_summary | known_dependencies |
|---|---|---|---|---|---|---|---|---|
| F-001 | Three Domains | engine_concept | §1.1 | §1.3 | master_spec | v7.1.0a | Three domains. | — |
| F-002 | Isolation | platform_mechanic | §1.3 | — | master_spec | v7.1.0a | Isolated consoles. | F-001 |
```

```json
{
  "summary": { "runtime_rows": 1, "runtime_status_counts": { "spec_binding_pending_pack_m11_3": 1 }, "blocker_count": 1 },
  "findings": [{ "severity": "blocker", "file": "Sourcera_Master_Spec.md", "line": 10, "id": "gate_a", "message": "proof missing" }]
}
```

- [ ] **Step 2: Run the test and confirm RED**

Run:

```bash
node --import ./tools/spec-lint/node_modules/tsx/dist/loader.mjs --test tools/delivery/sources.test.ts
```

Expected: FAIL because `tools/delivery/lib/sources.ts` does not exist.

- [ ] **Step 3: Add shared types and minimal parsers**

```ts
// tools/delivery/lib/model.ts
export type ReleaseId = "R0" | "R1" | "R2" | "R3" | "R4" | "R5";
export type Disposition = "executable" | "proof_only" | "narrative_context" | "superseded" | "retired_source";

export interface SourceRequirement {
  requirementId: string;
  outcome: string;
  sourceDoc: string;
  sourceVersion: string;
  section: string;
  dependencies: string[];
  disposition: Disposition;
}

export interface ReleaseDefinition {
  id: ReleaseId;
  name: string;
  sequence: number;
  customerHypothesis: string;
  operationalHypothesis: string;
  pilot: string;
  metrics: string[];
  customerGate: string;
  operationalGate: string;
}

export interface LinearIssueSnapshot {
  id: string;
  sourceId: string | null;
  title: string;
  kind: "executable" | "parent" | "decision" | "proof_only";
  labels: string[];
  release: ReleaseId | null;
  milestone: string | null;
  dependencies: string[];
  owner: string | null;
  reviewer: string | null;
  estimate: number | null;
  paths: string[];
  tests: { success: string | null; failure: string | null; recovery: string | null };
  rollout: string | null;
  rollback: string | null;
  telemetry: string | null;
  proof: string | null;
  sourceVersion: string | null;
  sourceSection: string | null;
  outcome: string | null;
}

export interface ManifestRow extends SourceRequirement {
  release: ReleaseId | null;
  issueId: string | null;
}

export interface Finding {
  code: string;
  message: string;
  requirementId?: string;
  issueId?: string;
}
```

```ts
// tools/delivery/lib/sources.ts
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import type { Finding, SourceRequirement } from "./model.js";

const SOURCE_DOCS: Record<string, string> = {
  master_spec: "Sourcera_Master_Spec.md",
  ux_design: "UX_Design_of_Sourcera.md",
  buyer_pricing: "Sourcera_Buyer_Pricing_Strategy.md",
  seller_pricing: "Sourcera_Seller_Pricing_Strategy.md",
  kb_eng: "_baselines/retired-sources/KB_Engineering_Spec_retired_2026-04-26.md",
};

function cells(line: string): string[] {
  return line.split(/(?<!\\)\|/).slice(1, -1).map((value) => value.trim().replace(/\\\|/g, "|"));
}

function list(value: string): string[] {
  if (!value || value === "—") return [];
  return [...value.matchAll(/F-(?:AE-|BC-)?\d+/g)].map((match) => match[0]);
}

function unique(rows: SourceRequirement[]): SourceRequirement[] {
  const seen = new Set<string>();
  for (const row of rows) {
    if (seen.has(row.requirementId)) throw new Error(`Duplicate requirement_id ${row.requirementId}`);
    seen.add(row.requirementId);
  }
  return rows;
}

export function parseFeatureInventory(markdown: string): SourceRequirement[] {
  const rows: SourceRequirement[] = [];
  for (const line of markdown.split(/\r?\n/)) {
    if (!/^\|\s*F-(?:AE-|BC-)?\d+\s*\|/.test(line)) continue;
    const [id, name, , section, , sourceDoc, version, , dependencies] = cells(line);
    rows.push({
      requirementId: id,
      outcome: name,
      sourceDoc: SOURCE_DOCS[sourceDoc] ?? sourceDoc,
      sourceVersion: version,
      section,
      dependencies: list(dependencies),
      disposition: "executable",
    });
  }
  if (!rows.length) throw new Error("Feature inventory contains no requirement rows");
  return unique(rows);
}

export function parseRuntimeGate(json: string): SourceRequirement[] {
  const parsed = JSON.parse(json) as { findings?: Array<{ id: string; file: string; line: number }> };
  const rows = (parsed.findings ?? []).map((finding) => ({
    requirementId: `RG:${finding.id}`,
    outcome: `Prove runtime gate ${finding.id}`,
    sourceDoc: finding.file,
    sourceVersion: "live",
    section: `line:${finding.line}`,
    dependencies: [],
    disposition: "proof_only" as const,
  }));
  return unique(rows);
}

export function sourceReferenceFindings(rows: SourceRequirement[], root: string): Finding[] {
  const findings: Finding[] = [];
  for (const row of rows) {
    if (!row.sourceVersion || !row.section) findings.push({ code: "source_not_pinned", requirementId: row.requirementId, message: `${row.requirementId} lacks version or section` });
    if (!existsSync(resolve(root, row.sourceDoc))) findings.push({ code: "source_file_missing", requirementId: row.requirementId, message: `${row.sourceDoc} does not exist` });
  }
  return findings;
}
```

```json
{
  "extends": "../spec-lint/tsconfig.json",
  "compilerOptions": { "noEmit": true, "typeRoots": ["../spec-lint/node_modules/@types"] },
  "include": ["**/*.ts"],
  "exclude": ["fixtures"]
}
```

- [ ] **Step 4: Run GREEN and typecheck**

Run:

```bash
node --import ./tools/spec-lint/node_modules/tsx/dist/loader.mjs --test tools/delivery/sources.test.ts
tools/spec-lint/node_modules/.bin/tsc --project tools/delivery/tsconfig.json
```

Expected: 3 tests pass; typecheck exits 0.

- [ ] **Step 5: Commit**

```bash
git add tools/delivery
git commit -m "feat: parse delivery source identities"
```

---

### Task 2: Validate releases and dependency order

**Files:**
- Create: `tools/delivery/lib/releases.ts`
- Create: `tools/delivery/lib/graph.ts`
- Create: `tools/delivery/graph.test.ts`

**Interfaces:**
- Consumes: `SourceRequirement[]`, `ReleaseDefinition[]`, and requirement-to-release assignments.
- Produces: `validateReleases(...)` and `validateGraph(...)` findings.

- [ ] **Step 1: Write failing cycle and inversion tests**

```ts
// tools/delivery/graph.test.ts
import { strict as assert } from "node:assert";
import test from "node:test";
import { validateGraph } from "./lib/graph.js";
import type { ManifestRow, ReleaseDefinition } from "./lib/model.js";

const releases = ["R0", "R1", "R2", "R3", "R4", "R5"].map((id, sequence) => ({
  id, name: id, sequence, customerHypothesis: "customer", operationalHypothesis: "ops",
  pilot: "pilot", metrics: ["metric"], customerGate: "customer proof", operationalGate: "ops proof",
})) as ReleaseDefinition[];

const row = (id: string, release: ManifestRow["release"], dependencies: string[]): ManifestRow => ({
  requirementId: id, outcome: id, sourceDoc: "Sourcera_Master_Spec.md", sourceVersion: "7.1.0a",
  section: "§1", dependencies, disposition: "executable", release, issueId: null,
});

test("accepts same-or-earlier release dependencies", () => {
  assert.deepEqual(validateGraph([row("A", "R0", []), row("B", "R1", ["A"])], releases), []);
});

test("rejects cycles and later-release dependencies", () => {
  const findings = validateGraph([row("A", "R0", ["B"]), row("B", "R1", ["A"])], releases);
  assert.deepEqual(new Set(findings.map((finding) => finding.code)), new Set(["dependency_cycle", "cross_release_inversion"]));
});
```

- [ ] **Step 2: Run RED**

Run the graph test; expect module-not-found failure.

- [ ] **Step 3: Implement release and graph validation**

```ts
// tools/delivery/lib/releases.ts
import type { Finding, ReleaseDefinition } from "./model.js";

export function validateReleases(releases: ReleaseDefinition[]): Finding[] {
  const findings: Finding[] = [];
  const expected = ["R0", "R1", "R2", "R3", "R4", "R5"];
  if (releases.map((release) => release.id).join(",") !== expected.join(",")) {
    findings.push({ code: "release_order_invalid", message: "Releases must be ordered R0 through R5" });
  }
  for (const release of releases) {
    if (!release.customerHypothesis || !release.operationalHypothesis || !release.pilot || !release.metrics.length || !release.customerGate || !release.operationalGate) {
      findings.push({ code: "release_validation_incomplete", message: `${release.id} lacks hypothesis, pilot, metrics, or proof gate` });
    }
  }
  return findings;
}
```

```ts
// tools/delivery/lib/graph.ts
import type { Finding, ManifestRow, ReleaseDefinition } from "./model.js";

export function validateGraph(rows: ManifestRow[], releases: ReleaseDefinition[]): Finding[] {
  const findings: Finding[] = [];
  const byId = new Map(rows.map((row) => [row.requirementId, row]));
  const sequence = new Map(releases.map((release) => [release.id, release.sequence]));
  const visiting = new Set<string>();
  const visited = new Set<string>();

  const visit = (id: string, trail: string[]) => {
    if (visiting.has(id)) {
      findings.push({ code: "dependency_cycle", requirementId: id, message: `Cycle: ${[...trail, id].join(" -> ")}` });
      return;
    }
    if (visited.has(id)) return;
    visiting.add(id);
    const row = byId.get(id);
    for (const dependencyId of row?.dependencies ?? []) {
      const dependency = byId.get(dependencyId);
      if (!dependency) {
        findings.push({ code: "missing_dependency", requirementId: id, message: `${id} depends on unknown ${dependencyId}` });
        continue;
      }
      if (row?.release && dependency.release && (sequence.get(dependency.release) ?? 99) > (sequence.get(row.release) ?? -1)) {
        findings.push({ code: "cross_release_inversion", requirementId: id, message: `${id} ${row.release} depends on ${dependencyId} ${dependency.release}` });
      }
      visit(dependencyId, [...trail, id]);
    }
    visiting.delete(id);
    visited.add(id);
  };

  for (const row of rows) visit(row.requirementId, []);
  return findings;
}
```

- [ ] **Step 4: Run GREEN, all delivery tests, and typecheck**

Expected: graph tests pass; source tests remain green; typecheck exits 0.

- [ ] **Step 5: Commit**

```bash
git add tools/delivery
git commit -m "feat: enforce delivery dependency order"
```

---

### Task 3: Derive readiness

**Files:**
- Create: `tools/delivery/lib/readiness.ts`
- Create: `tools/delivery/readiness.test.ts`

**Interfaces:**
- Consumes: `LinearIssueSnapshot`.
- Produces: `readinessFindings(issue): Finding[]` and `isCodexReady(issue): boolean`.

- [ ] **Step 1: Write failing tests for qualified and false-ready work**

```ts
// tools/delivery/readiness.test.ts
import { strict as assert } from "node:assert";
import test from "node:test";
import { isCodexReady, readinessFindings } from "./lib/readiness.js";
import type { LinearIssueSnapshot } from "./lib/model.js";

const ready: LinearIssueSnapshot = {
  id: "PLA-1", sourceId: "F-001", title: "One outcome", kind: "executable", labels: ["codex-ready"],
  release: "R0", milestone: "R0.1", dependencies: [], owner: "Blake Rowley", reviewer: "Blake Rowley", estimate: 3,
  paths: ["package.json", "tests/integration/health.spec.ts"],
  tests: { success: "health returns 200", failure: "missing dependency fails CI", recovery: "rollback restores prior build" },
  rollout: "canary", rollback: "redeploy prior commit", telemetry: "health_check_result", proof: "staging receipt",
  sourceVersion: "7.1.0a", sourceSection: "§1.5", outcome: "Create reproducible app foundation",
};

test("earns readiness only when all fields pass", () => assert.equal(isCodexReady(ready), true));

test("rejects wildcard paths, missing recovery, and parents", () => {
  const invalid = { ...ready, kind: "parent" as const, paths: ["app/**"], tests: { ...ready.tests, recovery: null } };
  assert.deepEqual(new Set(readinessFindings(invalid).map((finding) => finding.code)), new Set(["parent_not_executable", "path_not_concrete", "recovery_test_missing"]));
  assert.equal(isCodexReady(invalid), false);
});
```

- [ ] **Step 2: Run RED**

Run the readiness test; expect module-not-found failure.

- [ ] **Step 3: Implement the readiness rules**

```ts
// tools/delivery/lib/readiness.ts
import type { Finding, LinearIssueSnapshot } from "./model.js";

export function readinessFindings(issue: LinearIssueSnapshot): Finding[] {
  const findings: Finding[] = [];
  const add = (condition: boolean, code: string, message: string) => {
    if (condition) findings.push({ code, issueId: issue.id, message });
  };
  add(issue.kind !== "executable", "parent_not_executable", `${issue.id} is not executable work`);
  add(!issue.outcome?.trim(), "outcome_missing", `${issue.id} lacks one outcome`);
  add(!issue.sourceVersion || !issue.sourceSection, "source_not_pinned", `${issue.id} source is not pinned`);
  add(!issue.release || !issue.milestone, "release_or_milestone_missing", `${issue.id} lacks release or milestone`);
  add(!issue.owner || !issue.reviewer, "owner_or_reviewer_missing", `${issue.id} lacks owner or reviewer`);
  add(!issue.estimate || issue.estimate > 5, "estimate_invalid", `${issue.id} estimate must be 1–5`);
  add(!issue.paths.length || issue.paths.some((path) => path.includes("**") || path.endsWith("/")), "path_not_concrete", `${issue.id} paths are not concrete`);
  add(!issue.tests.success, "success_test_missing", `${issue.id} lacks success test`);
  add(!issue.tests.failure, "failure_test_missing", `${issue.id} lacks failure test`);
  add(!issue.tests.recovery, "recovery_test_missing", `${issue.id} lacks recovery test`);
  add(!issue.rollout, "rollout_missing", `${issue.id} lacks rollout`);
  add(!issue.rollback, "rollback_missing", `${issue.id} lacks rollback`);
  add(!issue.telemetry, "telemetry_missing", `${issue.id} lacks telemetry or rationale`);
  add(!issue.proof, "proof_missing", `${issue.id} lacks named proof`);
  const serialized = JSON.stringify(issue);
  add(serialized.includes("…") || /\b(?:TBD|TODO|placeholder)\b/i.test(serialized), "ambiguous_or_truncated", `${issue.id} contains truncated or placeholder text`);
  return findings;
}

export function isCodexReady(issue: LinearIssueSnapshot): boolean {
  return readinessFindings(issue).length === 0;
}
```

- [ ] **Step 4: Run GREEN and full delivery typecheck**

- [ ] **Step 5: Commit**

```bash
git add tools/delivery
git commit -m "feat: derive Codex readiness"
```

---

### Task 4: Detect drift and calculate evidence score

**Files:**
- Create: `tools/delivery/lib/drift.ts`
- Create: `tools/delivery/lib/scorecard.ts`
- Create: `tools/delivery/drift-scorecard.test.ts`

**Interfaces:**
- Consumes: manifest, Linear snapshot, findings, and proof flags.
- Produces: `driftFindings(...)` and `calculateScorecard(...)`.

- [ ] **Step 1: Write failing tests**

```ts
// tools/delivery/drift-scorecard.test.ts
import { strict as assert } from "node:assert";
import test from "node:test";
import { driftFindings } from "./lib/drift.js";
import { calculateScorecard } from "./lib/scorecard.js";

test("finds orphan requirements, orphan issues, and duplicate outcomes", () => {
  const findings = driftFindings(
    [{ requirementId: "F-1", outcome: "A", sourceDoc: "x", sourceVersion: "1", section: "§1", dependencies: [], disposition: "executable", release: "R0", issueId: null }],
    [
      { id: "I-1", sourceId: "F-2", title: "Same", outcome: "Same" },
      { id: "I-2", sourceId: "F-3", title: "Same", outcome: "same" },
    ],
  );
  assert.deepEqual(new Set(findings.map((finding) => finding.code)), new Set(["orphan_requirement", "orphan_issue", "duplicate_outcome"]));
});

test("missing evidence scores zero for its criterion", () => {
  const score = calculateScorecard({ planning: [true, true, false, false], releases: [true, false, false, false], ownership: [false, false, false, false], validation: [false, false, false, false], execution: [false, false, false, false] });
  assert.equal(score.total, 15);
  assert.equal(score.categories.planning, 10);
});
```

- [ ] **Step 2: Run RED**

- [ ] **Step 3: Implement drift and scorecard**

```ts
// tools/delivery/lib/drift.ts
import type { Finding, ManifestRow } from "./model.js";

interface IssueRef { id: string; sourceId: string | null; title: string; outcome: string | null; dependencies?: string[]; release?: ManifestRow["release"] }

export function driftFindings(manifest: ManifestRow[], issues: IssueRef[]): Finding[] {
  const findings: Finding[] = [];
  const issueSources = new Set(issues.map((issue) => issue.sourceId).filter(Boolean));
  const manifestIds = new Set(manifest.map((row) => row.requirementId));
  for (const row of manifest) if ((row.disposition === "executable" || row.requirementId.startsWith("RG:")) && !issueSources.has(row.requirementId)) findings.push({ code: "orphan_requirement", requirementId: row.requirementId, message: `${row.requirementId} has no issue` });
  for (const issue of issues) if (issue.sourceId && !manifestIds.has(issue.sourceId)) findings.push({ code: "orphan_issue", issueId: issue.id, message: `${issue.id} points to unknown ${issue.sourceId}` });
  for (const issue of issues) {
    if (!issue.sourceId) continue;
    const row = manifest.find((candidate) => candidate.requirementId === issue.sourceId);
    if (row && JSON.stringify([...row.dependencies].sort()) !== JSON.stringify([...(issue.dependencies ?? [])].sort())) findings.push({ code: "dependency_drift", issueId: issue.id, message: `${issue.id} dependency links differ from ${issue.sourceId}` });
    if (row && row.release !== (issue.release ?? null)) findings.push({ code: "release_drift", issueId: issue.id, message: `${issue.id} release differs from ${issue.sourceId}` });
  }
  const outcomes = new Map<string, string>();
  for (const issue of issues) {
    const key = (issue.outcome ?? issue.title).toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
    if (outcomes.has(key)) findings.push({ code: "duplicate_outcome", issueId: issue.id, message: `${issue.id} duplicates ${outcomes.get(key)}` });
    else outcomes.set(key, issue.id);
  }
  return findings;
}
```

```ts
// tools/delivery/lib/scorecard.ts
type Category = "planning" | "releases" | "ownership" | "validation" | "execution";
export interface ScoreInput { planning: boolean[]; releases: boolean[]; ownership: boolean[]; validation: boolean[]; execution: boolean[] }
export interface Scorecard { categories: Record<Category, number>; total: number; tenOfTen: boolean }

export function calculateScorecard(input: ScoreInput): Scorecard {
  const categories = Object.fromEntries(Object.entries(input).map(([name, evidence]) => [name, evidence.reduce((sum, present) => sum + (present ? 5 : 0), 0)])) as Record<Category, number>;
  const total = Object.values(categories).reduce((sum, value) => sum + value, 0);
  return { categories, total, tenOfTen: total === 100 };
}
```

- [ ] **Step 4: Run GREEN and full delivery suite**

- [ ] **Step 5: Commit**

```bash
git add tools/delivery
git commit -m "feat: detect delivery drift and score evidence"
```

---

### Task 5: Generate and verify the control-plane reports

**Files:**
- Create: `tools/delivery/generate.ts`
- Create: `tools/delivery/verify.ts`
- Create: `tools/delivery/generate.test.ts`
- Create: `delivery/releases.json`
- Create: `delivery/release-plan.json`
- Create: `delivery/dispositions.json`
- Create: `delivery/decisions.jsonl`
- Create: `delivery/risks.json`
- Create: `delivery/validation-plan.json`
- Create after Linear sync: `delivery/linear-snapshot.json`
- Generate: `reports/delivery/*.json`

**Interfaces:**
- Consumes: exact file paths supplied through CLI flags.
- Produces: six deterministic JSON reports and nonzero verification on blocking findings.

- [ ] **Step 1: Write a failing integration test using temporary inputs**

```ts
// tools/delivery/generate.test.ts
import { strict as assert } from "node:assert";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";

test("generates deterministic reports and verify fails on false readiness", () => {
  const dir = mkdtempSync(join(tmpdir(), "sourcera-delivery-"));
  try {
    writeFileSync(join(dir, "inventory.md"), "| feature_id | feature_name | feature_class | primary_section_anchor | secondary_section_anchors | originating_doc | introduced_in_version | one_line_summary | known_dependencies |\n|---|---|---|---|---|---|---|---|---|\n| F-001 | A | surface | §1 | — | master_spec | v7.1.0a | A | — |\n");
    writeFileSync(join(dir, "stamp.json"), JSON.stringify({ summary: {}, findings: [] }));
    writeFileSync(join(dir, "exact.json"), JSON.stringify({ open_rows: 0 }));
    writeFileSync(join(dir, "releases.json"), JSON.stringify({ releases: [] }));
    writeFileSync(join(dir, "release-plan.json"), JSON.stringify({ assignments: [{ requirementId: "F-001", release: "R0", rationale: "R0 foundation dependency" }] }));
    writeFileSync(join(dir, "dispositions.json"), JSON.stringify({ overrides: [] }));
    writeFileSync(join(dir, "decisions.jsonl"), "");
    writeFileSync(join(dir, "risks.json"), JSON.stringify({ risks: [] }));
    writeFileSync(join(dir, "validation.json"), JSON.stringify({ customerProof: [], operationalProof: [], forecastProof: [], executionEvidence: { tests: [], deploy: [], rollback: [], runtime: [] } }));
    writeFileSync(join(dir, "linear.json"), JSON.stringify({ issues: [] }));
    const result = spawnSync(process.execPath, ["--import", "./tools/spec-lint/node_modules/tsx/dist/loader.mjs", "tools/delivery/generate.ts", "--root", process.cwd(), "--inventory", join(dir, "inventory.md"), "--stamp", join(dir, "stamp.json"), "--exact", join(dir, "exact.json"), "--releases", join(dir, "releases.json"), "--release-plan", join(dir, "release-plan.json"), "--dispositions", join(dir, "dispositions.json"), "--decisions", join(dir, "decisions.jsonl"), "--risks", join(dir, "risks.json"), "--validation", join(dir, "validation.json"), "--linear", join(dir, "linear.json"), "--out", join(dir, "reports")], { cwd: process.cwd(), encoding: "utf8" });
    assert.equal(result.status, 1);
    assert.match(readFileSync(join(dir, "reports", "drift-report.json"), "utf8"), /orphan_requirement/);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});
```

- [ ] **Step 2: Run RED**

- [ ] **Step 3: Implement `generate.ts` as the only report writer**

```ts
// tools/delivery/generate.ts
#!/usr/bin/env node
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { driftFindings } from "./lib/drift.js";
import { validateGraph } from "./lib/graph.js";
import type { Disposition, Finding, LinearIssueSnapshot, ManifestRow, ReleaseDefinition, SourceRequirement } from "./lib/model.js";
import { readinessFindings } from "./lib/readiness.js";
import { validateReleases } from "./lib/releases.js";
import { calculateScorecard } from "./lib/scorecard.js";
import { parseFeatureInventory, parseRuntimeGate, sourceReferenceFindings } from "./lib/sources.js";

const argv = new Map<string, string>();
for (let index = 2; index < process.argv.length; index += 2) argv.set(process.argv[index], process.argv[index + 1]);
const required = (name: string, fallback?: string) => {
  const value = argv.get(name) ?? fallback;
  if (!value) throw new Error(`Required argument ${name}`);
  return value;
};
const root = resolve(required("--root", "."));
const path = (flag: string, fallback: string) => resolve(root, required(flag, fallback));
const inventoryPath = path("--inventory", "_audit/FEATURE_INVENTORY.md");
const stampPath = path("--stamp", "/tmp/sourcera-stamp.json");
const exactPath = path("--exact", "/tmp/sourcera-exact.json");
const releasesPath = path("--releases", "delivery/releases.json");
const releasePlanPath = path("--release-plan", "delivery/release-plan.json");
const dispositionsPath = path("--dispositions", "delivery/dispositions.json");
const decisionsPath = path("--decisions", "delivery/decisions.jsonl");
const risksPath = path("--risks", "delivery/risks.json");
const validationPath = path("--validation", "delivery/validation-plan.json");
const linearPath = path("--linear", "delivery/linear-snapshot.json");
const outDir = path("--out", "reports/delivery");

const json = <T>(file: string): T => JSON.parse(readFileSync(file, "utf8")) as T;
const stamp = json<{ summary: unknown; findings: unknown[] }>(stampPath);
const exact = json<Record<string, unknown>>(exactPath);
const releases = json<{ releases: ReleaseDefinition[] }>(releasesPath).releases;
const releasePlan = json<{ assignments: Array<{ requirementId: string; release: ReleaseDefinition["id"]; rationale: string }> }>(releasePlanPath).assignments;
const issues = json<{ issues: LinearIssueSnapshot[] }>(linearPath).issues;
const overrides = json<{ overrides: Array<{ requirementId: string; disposition: Disposition; replacementId?: string; rationale: string }> }>(dispositionsPath).overrides;
const decisions = readFileSync(decisionsPath, "utf8").split(/\r?\n/).filter(Boolean).map((line) => JSON.parse(line) as { id: string; status: string });
json<{ risks: unknown[] }>(risksPath);
const validation = json<{
  customerProof: string[];
  operationalProof: string[];
  forecastProof: string[];
  executionEvidence: { tests: string[]; deploy: string[]; rollback: string[]; runtime: string[] };
}>(validationPath);

const overrideById = new Map(overrides.map((override) => [override.requirementId, override]));
const releaseById = new Map(releasePlan.map((assignment) => [assignment.requirementId, assignment]));
const requirements: SourceRequirement[] = [
  ...parseFeatureInventory(readFileSync(inventoryPath, "utf8")),
  ...parseRuntimeGate(readFileSync(stampPath, "utf8")),
].map((row) => ({ ...row, disposition: overrideById.get(row.requirementId)?.disposition ?? row.disposition }));
const issueBySource = new Map(issues.filter((issue) => issue.sourceId).map((issue) => [issue.sourceId as string, issue]));
const manifest: ManifestRow[] = requirements.map((row) => {
  const issue = issueBySource.get(row.requirementId);
  return { ...row, release: releaseById.get(row.requirementId)?.release ?? null, issueId: issue?.id ?? null };
});

const sourceFindings = sourceReferenceFindings(requirements, root);
const dispositionFindings: Finding[] = overrides.flatMap((override) => {
  const findings: Finding[] = [];
  if (!requirements.some((row) => row.requirementId === override.requirementId)) findings.push({ code: "disposition_unknown", requirementId: override.requirementId, message: `${override.requirementId} is not in the source inventory` });
  if (!override.rationale.trim()) findings.push({ code: "disposition_rationale_missing", requirementId: override.requirementId, message: `${override.requirementId} lacks rationale` });
  if ((override.disposition === "superseded" || override.disposition === "retired_source") && !override.replacementId) findings.push({ code: "disposition_replacement_missing", requirementId: override.requirementId, message: `${override.requirementId} lacks replacementId` });
  return findings;
});
const exactFindings: Finding[] = Number(exact.open_rows ?? 0) === 0 ? [] : [{ code: "exact_status_open", message: "Exact-status scan still has open rows" }];
const releasePlanFindings: Finding[] = [
  ...releasePlan.filter((assignment, index) => releasePlan.findIndex((candidate) => candidate.requirementId === assignment.requirementId) !== index).map((assignment) => ({ code: "release_assignment_duplicate", requirementId: assignment.requirementId, message: `${assignment.requirementId} has duplicate release assignments` })),
  ...releasePlan.filter((assignment) => !requirements.some((row) => row.requirementId === assignment.requirementId)).map((assignment) => ({ code: "release_assignment_unknown", requirementId: assignment.requirementId, message: `${assignment.requirementId} is not in current source truth` })),
  ...releasePlan.filter((assignment) => !assignment.rationale.trim()).map((assignment) => ({ code: "release_assignment_rationale_missing", requirementId: assignment.requirementId, message: `${assignment.requirementId} lacks release rationale` })),
];
const releaseFindings = validateReleases(releases);
const graphFindings = validateGraph(manifest, releases);
const readiness = issues.filter((issue) => issue.labels.includes("codex-ready")).flatMap(readinessFindings);
const tracedIssues = issues.filter((issue) => issue.kind === "executable" || issue.kind === "proof_only");
const drift = driftFindings(manifest, tracedIssues);
const releaseAssignment: Finding[] = manifest
  .filter((row) => (row.disposition === "executable" || row.requirementId.startsWith("RG:")) && !row.release)
  .map((row) => ({ code: "release_missing", requirementId: row.requirementId, message: `${row.requirementId} has no release` }));
const allFindings = [...sourceFindings, ...dispositionFindings, ...exactFindings, ...releasePlanFindings, ...releaseFindings, ...graphFindings, ...readiness, ...drift, ...releaseAssignment];
const evidenceExists = (paths: string[]) => paths.length > 0 && paths.every((item) => existsSync(resolve(root, item)));
const readyIssues = issues.filter((issue) => issue.labels.includes("codex-ready"));
const scorecard = calculateScorecard({
  planning: [sourceFindings.length + dispositionFindings.length + exactFindings.length === 0, graphFindings.length === 0, drift.length + releasePlanFindings.length === 0, readiness.length === 0],
  releases: [releaseFindings.length === 0, releaseAssignment.length === 0, !graphFindings.some((finding) => finding.code === "cross_release_inversion"), releases.length === 6],
  ownership: [readyIssues.length > 0 && readyIssues.every((issue) => Boolean(issue.owner && issue.reviewer)), readyIssues.length > 0 && readyIssues.every((issue) => Boolean(issue.estimate)), decisions.some((decision) => decision.id === "DEC-WIP-001" && decision.status === "active"), evidenceExists(validation.forecastProof)],
  validation: [releases.length === 6 && releases.every((release) => Boolean(release.customerHypothesis)), releases.length === 6 && releases.every((release) => Boolean(release.operationalHypothesis)), evidenceExists(validation.customerProof), evidenceExists(validation.operationalProof)],
  execution: [evidenceExists(validation.executionEvidence.tests), evidenceExists(validation.executionEvidence.deploy), evidenceExists(validation.executionEvidence.rollback), evidenceExists(validation.executionEvidence.runtime)],
});
const traceability = manifest.map((row) => {
  const issue = row.issueId ? issues.find((candidate) => candidate.id === row.issueId) : undefined;
  return {
    requirementId: row.requirementId,
    source: { document: row.sourceDoc, version: row.sourceVersion, section: row.section },
    disposition: row.disposition,
    issueId: row.issueId,
    release: row.release,
    milestone: issue?.milestone ?? null,
    dependencies: row.dependencies,
    paths: issue?.paths ?? [],
    tests: issue?.tests ?? null,
    rollout: issue?.rollout ?? null,
    rollback: issue?.rollback ?? null,
    telemetry: issue?.telemetry ?? null,
    proof: issue?.proof ?? null,
  };
});
const reports = {
  "delivery-manifest.json": { liveEvidence: { stamp: stamp.summary, exact }, rows: manifest },
  "traceability-map.json": traceability,
  "dependency-graph.json": { edges: manifest.flatMap((row) => row.dependencies.map((dependency) => ({ from: row.requirementId, to: dependency }))), findings: graphFindings },
  "readiness-report.json": { findings: [...readiness, ...graphFindings.filter((finding) => finding.requirementId && issues.some((issue) => issue.sourceId === finding.requirementId && issue.labels.includes("codex-ready")))] },
  "drift-report.json": { findings: [...sourceFindings, ...dispositionFindings, ...exactFindings, ...releasePlanFindings, ...drift, ...releaseAssignment] },
  "release-scorecard.json": scorecard,
};
mkdirSync(outDir, { recursive: true });
for (const [name, value] of Object.entries(reports)) {
  writeFileSync(resolve(outDir, name), `${JSON.stringify(value, null, 2)}\n`);
}
process.exitCode = allFindings.length ? 1 : 0;
```

- [ ] **Step 4: Implement `verify.ts` as regenerate-and-diff**

```ts
// tools/delivery/verify.ts
#!/usr/bin/env node
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";

const argv = new Map<string, string>();
for (let index = 2; index < process.argv.length; index += 2) argv.set(process.argv[index], process.argv[index + 1]);
const root = resolve(argv.get("--root") ?? ".");
const stamp = resolve(root, argv.get("--stamp") ?? "/tmp/sourcera-stamp.json");
const exact = resolve(root, argv.get("--exact") ?? "/tmp/sourcera-exact.json");
const expected = resolve(root, argv.get("--reports") ?? "reports/delivery");
const temporary = mkdtempSync(join(tmpdir(), "sourcera-delivery-verify-"));
const names = ["delivery-manifest.json", "traceability-map.json", "dependency-graph.json", "readiness-report.json", "drift-report.json", "release-scorecard.json"];
try {
  const result = spawnSync(process.execPath, ["--import", resolve(root, "tools/spec-lint/node_modules/tsx/dist/loader.mjs"), resolve(root, "tools/delivery/generate.ts"), "--root", root, "--stamp", stamp, "--exact", exact, "--out", temporary], { cwd: root, encoding: "utf8" });
  let different = false;
  for (const name of names) {
    const actual = readFileSync(join(temporary, name), "utf8");
    const committed = readFileSync(join(expected, name), "utf8");
    if (actual !== committed) { console.error(`Generated report differs: ${name}`); different = true; break; }
  }
  if (result.status !== 0) console.error(result.stderr || "Delivery findings remain");
  process.exitCode = result.status === 0 && !different ? 0 : 1;
} finally {
  rmSync(temporary, { recursive: true, force: true });
}
```

- [ ] **Step 5: Add canonical delivery inputs**

Use these exact schemas:

```json
{"releases":[
  {"id":"R0","name":"First Defensible Evaluation","sequence":0,"customerHypothesis":"One buyer can complete one defensible evaluation with one seller and trust the retained result.","operationalHypothesis":"The complete journey is isolated, auditable, recoverable, and supportable.","pilot":"One invited buyer and one invited seller in staging.","metrics":["activation","completion","time_to_value","abandonment","trust","reliability","support"],"customerGate":"The pilot completes the full journey and retains an immutable auditable result.","operationalGate":"Isolation, rollback, recovery, and support receipts pass for one commit."},
  {"id":"R1","name":"Team Evaluation & Collaboration","sequence":1,"customerHypothesis":"A buyer team can collaborate on one evaluation without losing ownership, context, or scoring integrity.","operationalHypothesis":"Concurrent work, permissions, notifications, and recovery remain reliable under team use.","pilot":"One buyer team with at least three roles and two invited sellers.","metrics":["team_activation","collaborative_completion","time_to_value","abandonment","trust","reliability","support"],"customerGate":"The team completes an evaluation with attributable collaboration and no manual repair.","operationalGate":"Concurrency, role enforcement, notification delivery, and recovery receipts pass."},
  {"id":"R2","name":"Repeatability, Reporting & Operations","sequence":2,"customerHypothesis":"A returning buyer can repeat an evaluation and produce decision-ready reporting faster than the first run.","operationalHypothesis":"Templates, reporting, administration, retention, and support workflows are observable and recoverable.","pilot":"One returning buyer repeats a completed evaluation with an operations reviewer.","metrics":["repeat_activation","repeat_completion","time_to_value","report_use","trust","reliability","support"],"customerGate":"The repeat evaluation and report complete with measurable time saved.","operationalGate":"Admin, export, retention, support, and restore receipts pass."},
  {"id":"R3","name":"Marketplace Supply, Discovery, Matching & Trust","sequence":3,"customerHypothesis":"Buyers can discover credible sellers and sellers can gain qualified opportunities through trusted marketplace signals.","operationalHypothesis":"Supply ingestion, matching, moderation, and trust controls resist abuse and recover safely.","pilot":"A bounded category with approved sellers and invited buyers.","metrics":["supply_activation","qualified_matches","buyer_engagement","seller_engagement","trust","reliability","support"],"customerGate":"Pilot users produce qualified matches and report acceptable trust.","operationalGate":"Moderation, abuse handling, matching replay, and rollback receipts pass."},
  {"id":"R4","name":"Intelligence, Scenarios, TCO & Agents","sequence":4,"customerHypothesis":"Decision intelligence and agents improve evaluation quality or speed without reducing user trust.","operationalHypothesis":"Model, tool, cost, safety, and fallback controls are measurable and bounded.","pilot":"Opt-in evaluations with baseline comparison and human review.","metrics":["agent_activation","assisted_completion","time_saved","decision_quality","trust","cost","reliability"],"customerGate":"The pilot improves a named decision metric without lowering trust.","operationalGate":"Evaluation, cost, safety, fallback, and replay receipts pass."},
  {"id":"R5","name":"Enterprise Integrations, Compliance, Globalization & Scale","sequence":5,"customerHypothesis":"Enterprise customers can adopt Sourcera within their identity, data, compliance, and regional constraints.","operationalHypothesis":"Integrations, compliance controls, regional operation, and scale targets are proven under failure and recovery.","pilot":"One enterprise design partner with agreed identity, integration, compliance, and residency scope.","metrics":["enterprise_activation","integration_completion","time_to_value","compliance_acceptance","trust","reliability","support"],"customerGate":"The design partner completes the agreed enterprise journey and accepts the control evidence.","operationalGate":"Integration, compliance, residency, scale, rollback, and recovery receipts pass."}
]}
```

`delivery/release-plan.json` uses this schema:

```json
{"assignments":[{"requirementId":"F-004","release":"R0","rationale":"R0 build order 1: reproducible application foundation."},{"requirementId":"RG:health_check_contract","release":"R0","rationale":"Proof follows the R0 behavior it verifies."}]}
```

The real file has one explicit row for every `executable` requirement and every live `RG:*` requirement. It omits narrative and retired-source aliases. Derive the rows in the user's R0–R5 functionality order, then run graph validation; no range or project-default shortcut may hide an individual assignment.

`delivery/dispositions.json` contains these exact groups:

- `F-795`, `F-804`–`F-808`, `F-812`–`F-813`, `F-819`–`F-821`, `F-823`–`F-827`, `F-829`–`F-830`, `F-833`–`F-834`, and `F-836`: `proof_only`, with `replacementId` set to the matching live `RG:<gate_id>`.
- `F-838`–`F-858`: `narrative_context`; §34 or the named Master Spec dependency remains authoritative.
- `F-887` → `F-336`, `F-888` → `F-361`, `F-889` → `F-349`, `F-890` → `F-350`, `F-891` → `F-329`, `F-892` → `F-363`, `F-893` → `F-366`, `F-894` → `F-329`, `F-895` → `F-332`, and `F-896` → `F-368`: `retired_source` with the right-hand ID as `replacementId`.
- `F-608`–`F-611` remain `executable`; create their missing Linear children and assign them to R2. Never hide them with a disposition override.

Every override has a nonempty rationale. `generate.ts` rejects an override for an unknown ID, a silent rationale, or a missing replacement on `superseded`/`retired_source`.

```json
{"risks":[{"id":"RISK-001","statement":"False readiness can start oversized work.","owner":"Blake Rowley","trigger":"Any codex-ready issue fails readinessFindings.","response":"Remove the label and repair the issue before execution."}]}
```

```json
{"customerProof":[],"operationalProof":[],"forecastProof":[],"executionEvidence":{"tests":[],"deploy":[],"rollback":[],"runtime":[]}}
```

Write `delivery/decisions.jsonl` as one JSON object per line. Required IDs are `DEC-REPO-001`, `DEC-WIP-001`, `DEC-OWNER-001`, and `DEC-HEADER-001`; each object has `id`, `status`, `decision`, `assumption`, and `validationTrigger`.

- [ ] **Step 6: Run GREEN and commit**

```bash
git add tools/delivery delivery reports/delivery
git commit -m "feat: generate delivery control-plane reports"
```

---

### Task 6: Enforce delivery integrity in CI

**Files:**
- Create: `.github/workflows/delivery-integrity.yml`
- Create: `tools/delivery/linear-live.ts`
- Create: `tools/delivery/linear-live.test.ts`
- Modify: `AGENTS.md`

**Interfaces:**
- Consumes: committed delivery inputs, Linear snapshot, and `LINEAR_API_KEY` on scheduled runs.
- Produces: required delivery-integrity check and authenticated scheduled drift check.

- [ ] **Step 1: Add failing workflow and Linear-read-back tests**

Add `tools/delivery/ci-contract.test.ts` that reads the workflow and asserts it runs delivery tests, delivery typecheck, live scanners, `verify.ts`, `linear-live.ts`, and the existing required checks.

Add `tools/delivery/linear-live.test.ts` with a mocked two-page GraphQL response. Assert stable sorting, GraphQL-error rejection even on HTTP 200, pagination through `pageInfo.endCursor`, and a nonzero result when any tracked Linear field differs from `delivery/linear-snapshot.json`.

- [ ] **Step 2: Run RED**

- [ ] **Step 3: Implement authenticated Linear comparison**

`tools/delivery/linear-live.ts` uses Node `fetch` against `https://api.linear.app/graphql`, sends `Authorization: $LINEAR_API_KEY`, requests at most 50 issues per page, and checks both HTTP status and the GraphQL `errors` array. It reads issues, labels, state, assignee, project, milestone, parent, releases, and `updatedAt`; reads release pipelines and releases separately; normalizes the same fields as the committed snapshot; sorts by stable ID; and exits nonzero on any difference. It never logs the key or issue descriptions. `--fixture` replaces network access in tests.

Run RED, implement the smallest client, then run GREEN.

- [ ] **Step 4: Add the workflow**

```yaml
name: Delivery integrity
on:
  pull_request:
  push:
    branches: [main]
  schedule:
    - cron: "17 9 * * *"
jobs:
  delivery-integrity:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with: { fetch-depth: 0 }
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
          cache-dependency-path: tools/spec-lint/package-lock.json
      - run: npm ci --prefix tools/spec-lint
      - run: node --import ./tools/spec-lint/node_modules/tsx/dist/loader.mjs --test tools/delivery/*.test.ts
      - run: tools/spec-lint/node_modules/.bin/tsc --project tools/delivery/tsconfig.json
      - name: Capture live release truth
        shell: bash
        run: |
          set +e
          tools/spec-lint/node_modules/.bin/tsx tools/release/stamp_gate.ts --json > /tmp/stamp.json
          stamp_status=$?
          tools/spec-lint/node_modules/.bin/tsx tools/release/exact_status_scan.ts --json > /tmp/exact.json
          exact_status=$?
          test "$stamp_status" -eq 0 -o "$stamp_status" -eq 1
          test "$exact_status" -eq 0
      - run: tools/spec-lint/node_modules/.bin/tsx tools/delivery/verify.ts --stamp /tmp/stamp.json --exact /tmp/exact.json
      - run: npm --prefix tools/spec-lint run typecheck
      - run: npm --prefix tools/spec-lint run all
      - run: tools/spec-lint/node_modules/.bin/tsx tools/repo-hygiene/no_legacy_drift.ts
      - run: tools/spec-lint/node_modules/.bin/tsx tools/release/appendix_j_lineage.ts
  linear-drift:
    if: github.event_name == 'schedule'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22 }
      - run: npm ci --prefix tools/spec-lint
      - run: tools/spec-lint/node_modules/.bin/tsx tools/delivery/linear-live.ts --snapshot delivery/linear-snapshot.json
        env:
          LINEAR_API_KEY: ${{ secrets.LINEAR_API_KEY }}
```

- [ ] **Step 5: Add a short AGENTS.md pointer**

Add only stable commands and paths. Do not copy counts.

- [ ] **Step 6: Run GREEN, all required checks, and commit**

```bash
git add .github/workflows/delivery-integrity.yml AGENTS.md tools/delivery
git commit -m "ci: enforce delivery integrity"
```

---

### Task 7: Quarantine Linear readiness and create releases

**Files:**
- Create from verified read-back: `delivery/linear-snapshot.json`
- Regenerate: `reports/delivery/*.json`

**Interfaces:**
- Consumes: current Linear workspace, `delivery/releases.json`, readiness policy.
- Produces: R0–R5 releases, zero falsely ready issues, one qualified R0 foundation child, and exact snapshot read-back.

- [ ] **Step 1: Read release pipelines, releases, users, labels, projects, milestones, and all backlog issues**

Use paginated reads no larger than 250 entities. Record IDs before mutation. Confirm the production release pipeline and planned stage.

- [ ] **Step 2: Create the missing production release pipeline, then R0–R5 idempotently**

The live read shows no release pipeline. Through Linear's Releases settings, create one scheduled production pipeline named `Sourcera Product Delivery`, attach all four Sourcera teams, retain its planned/started/completed stages, and leave path filters empty. Read it back with `list_release_pipelines` before creating releases.

For each release, search by exact version first. Create only when absent. Use `Sourcera Product Delivery`, its planned stage, version `R0` through `R5`, and the stable description from `delivery/releases.json`. Leave dates unset. Read each release back.

- [ ] **Step 3: Remove false readiness in batches**

For every issue carrying `codex-ready`, evaluate `readinessFindings`. Replace its full label list without `codex-ready` when any finding exists. Write at most 50 issues per batch. After each batch, list the changed issues and verify the label is absent.

- [ ] **Step 4: Assign releases without creating inversions**

Build `delivery/release-plan.json` before changing issue releases. Classify each executable requirement by the user's R0–R5 definitions and record its rationale. Runtime-gate rows use the release of the behavior they prove. Run full graph validation and repair every cycle, missing dependency, and earlier-to-later inversion in the repository plan before the first Linear release write.

Synchronize Linear dependency relations from the source graph: remove stale `blockedBy` links, add the exact mapped requirement blockers, and read each changed issue back. Then assign each executable and runtime-gate child to the release in `delivery/release-plan.json`. Parents and the stale-header decision remain unassigned. Stop before the first read-back mismatch.

Create the four missing executable admin children `F-608`–`F-611` in the existing admin project, pin their exact Master Spec sections, assign R2, and leave them without `codex-ready` until fully decomposed.

- [ ] **Step 5: Repair the existing first R0 child**

Update `PLA-220` instead of creating a duplicate. Move it under `PLA-202` in `Sourcera Production — Platform & Delivery Foundations`, use milestone `Deployable foundation ready`, title it `[F-004] Reproducible application foundation`, and replace its description with:

```markdown
## Outcome
Create one reproducible application foundation that can be installed, tested, deployed to staging, health-checked, and rolled back to the prior commit.

## Source
- `Sourcera_Master_Spec.md` v7.1.0a §1.5
- `Sourcera_Master_Spec.md` Appendix M release-evidence rules

## Paths
- `package.json`
- `app/api/health/route.ts`
- `tests/integration/health.spec.ts`
- `.github/workflows/app-ci.yml`
- `docs/runbooks/r0-foundation.md`
- `reports/evidence/r0-foundation.json`

## Owner / Reviewer / Estimate
- Owner: Blake Rowley
- Reviewer: Blake Rowley (interim; split when a second human joins)
- Estimate: 3

## Acceptance Tests
- Success: clean install, typecheck, test, build, staging deploy, and health request pass for the same commit.
- Failure: missing required environment input fails before deploy and emits no secret values.
- Recovery: rollback redeploys the prior commit and the health request passes against that commit.

## Rollout / Rollback
- Rollout: staging canary only; no customer traffic.
- Rollback: redeploy the immediately prior verified commit.

## Telemetry
- Emit `deployment_health_check_result` with commit, environment, assertion, result, and timestamp; no secrets.

## Proof
- `reports/evidence/r0-foundation.json` plus the linked staging deployment receipt.
```

Assign release R0, estimate 3, Blake Rowley, and `codex-ready` only after read-back confirms every field. Preserve the stable F-004 identity and remove the old identity-project placement.

- [ ] **Step 6: Read back and write the Linear snapshot**

Snapshot every active initiative, project, milestone, release, issue, relation, label, owner, estimate, and readiness field used by the verifier. Sort arrays by stable ID before writing. The file is generated from read-back, not edited manually.

- [ ] **Step 7: Regenerate, verify, and commit the synchronized snapshot**

Run delivery tests, delivery typecheck, generator, verifier, existing required checks, live scans, Git diff check, and a final Linear read-back. Commit only if all repository checks pass and Linear matches the snapshot.

```bash
git add delivery/linear-snapshot.json reports/delivery
git commit -m "chore: synchronize Sourcera delivery control plane"
```

---

## Completion Evidence for This Plan

- Delivery tests pass with positive and negative fixtures.
- Delivery and existing TypeScript checks pass.
- Existing full spec-lint, hygiene, and lineage checks pass.
- Live scanners are freshly captured; pending runtime rows remain pending unless their required evidence exists.
- Generated reports match canonical inputs and Linear read-back.
- R0–R5 exist without dates.
- No false `codex-ready` label remains.
- Exactly one first R0 foundation child is qualified for execution.
- Git status is clean after commits.

The next plan begins R0 product implementation from that single qualified child.
