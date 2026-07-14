/**
 * Canonical spec-lint inline review comment templates.
 *
 * Authority anchors:
 * - Sourcera_Master_Spec.md §M.4.3
 * - Sourcera_Master_Spec.md §M.4.4.2.G
 *
 * The workflow's comment poster imports these templates instead of hand-writing
 * strings, and this module can run as a small canonicality verifier.
 */

import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

export const COMMENT_TEMPLATES = {
  missing_row: [
    "**Appendix M coverage missing.** This PR introduces the following engine concept(s) without a corresponding row in Appendix M (§M.1):",
    "",
    "- `{concept_class}::{concept_name}@{spec_anchor}` (line {line_number})",
    "",
    "Add a row to §M.1 in the same diff binding the engine concept to a surface metaphor, OR apply the uniquely keyed `@appendix-m-internal-only:` override per §M.4.4 if the concept is genuinely internal-only. See §M.2 gate #1 and §M.4 for the authoring contract. Gate run ID: `{gate_run_id}` (see audit trail at `tools/spec-lint/run-logs/{gate_run_id}.json`).",
  ].join("\n"),
  orphan_inline_gate_reference: [
    "**Appendix M.5 catalog gap.** This PR cites the following CI gate(s) by name with an `Appendix M.5` placement claim, but the gate is absent from the §M.5 catalog row set:",
    "",
    "- `{gate_id}` cited at `{spec_anchor}` (line {line_number})",
    "",
    "Add a §M.5 catalog row for each cited gate in the same diff, or remove the inline `Appendix M.5` placement claim. See §M.5 catalog header for the authoring contract. Gate run ID: `{gate_run_id}`.",
  ].join("\n"),
  override_target_not_flagged_by_detector: [
    "**Override rejected — annotation target not flagged by detector.** The `@appendix-m-internal-only:` annotation for `{concept_name}` cannot be honored: the §M.4.2 trigger detector did not flag any concept matching `{concept_name}` in this PR's diff. The override path is strictly downstream of the trigger detector — overrides can only admit concepts the detector itself flagged in the same PR.",
    "",
    "Detected concepts in this PR: `{detected_concept_list}` (count: {detected_count}).",
    "Annotation concept_name: `{annotation_concept_name}`.",
    "Closest detected matches by Levenshtein distance < 5: `{near_match_list}`.",
    "",
    "Resolution paths: (a) Fix the annotation's `{concept_name}` to exactly match one of the detected concepts above; (b) Author the §M.1 row directly without invoking the override path; (c) If the concept is genuinely internal-only AND the PR is a no-op for the trigger detector, the override path is not available — the §M.1 row must be authored directly with the `Internal-only, never surfaced` sentinel in the `Tier visibility` cell.",
    "",
    "Gate run ID: `{gate_run_id}` (audit trail at `tools/spec-lint/run-logs/{gate_run_id}.json`).",
  ].join("\n"),
  override_target_customer_visible: [
    "**Override rejected — target appears customer-visible.** The `@appendix-m-internal-only:` annotation for `{concept_name}` cannot auto-generate an `Internal-only, never surfaced` Appendix M.1 row because the concept is reachable from a customer surface per cross-validation predicate {predicate_id} ({predicate_human_name}).",
    "",
    "Predicate {predicate_id} sub-check that failed: {sub_check_id} — {sub_check_human_name}.",
    "Evidence cite: `{evidence_anchor}` at line `{evidence_line_number}`. Excerpt: `{evidence_excerpt_120_chars}`.",
    "Predicate evaluation snapshot (per-predicate result): `Predicate 1 (Console enum reachability): {p1_result}` / `Predicate 2 (RBAC reachability): {p2_result}` / `Predicate 3 (Plan-tier reachability): {p3_result}` / `Predicate 4 (Surface-class non-internal): {p4_result}`.",
    "",
    "Resolution paths: (a) Author an explicit §M.1 row with a surface metaphor + `Tier visibility` cell value listing the tiers that see the surface, instead of using the override; (b) If the customer-surface reach is incidental, file a follow-up Authored Extension to amend the §M.4.4.2 predicate-sub-check set OR rename the concept to break the heuristic match; (c) If the concept genuinely should NOT be reachable from the customer surface, fix the upstream spec-side cite at `{evidence_anchor}` instead of adding the override.",
    "",
    "Gate run ID: `{gate_run_id}` (audit trail at `tools/spec-lint/run-logs/{gate_run_id}.json`).",
  ].join("\n"),
} as const;

const REQUIRED_PLACEHOLDERS: Record<keyof typeof COMMENT_TEMPLATES, string[]> = {
  missing_row: ["concept_class", "concept_name", "spec_anchor", "line_number", "gate_run_id"],
  orphan_inline_gate_reference: ["gate_id", "spec_anchor", "line_number", "gate_run_id"],
  override_target_not_flagged_by_detector: [
    "concept_name",
    "detected_concept_list",
    "detected_count",
    "annotation_concept_name",
    "near_match_list",
    "gate_run_id",
  ],
  override_target_customer_visible: [
    "concept_name",
    "predicate_id",
    "predicate_human_name",
    "sub_check_id",
    "sub_check_human_name",
    "evidence_anchor",
    "evidence_line_number",
    "evidence_excerpt_120_chars",
    "p1_result",
    "p2_result",
    "p3_result",
    "p4_result",
    "gate_run_id",
  ],
};

export function renderTemplate(
  name: keyof typeof COMMENT_TEMPLATES,
  values: Record<string, string | number>
): string {
  return COMMENT_TEMPLATES[name].replace(/\{([a-z0-9_]+)\}/g, (_m, key: string) =>
    values[key] === undefined ? `{${key}}` : String(values[key])
  );
}

export function validateCommentTemplatesAgainstSpec(specText: string): string[] {
  const findings: string[] = [];
  if (!specText.includes("tools/spec-lint/comment_templates.ts")) {
    findings.push("Master Spec does not cite tools/spec-lint/comment_templates.ts");
  }
  for (const [name, placeholders] of Object.entries(REQUIRED_PLACEHOLDERS) as Array<
    [keyof typeof COMMENT_TEMPLATES, string[]]
  >) {
    const template = COMMENT_TEMPLATES[name];
    for (const placeholder of placeholders) {
      if (!template.includes(`{${placeholder}}`)) {
        findings.push(`${name} template missing placeholder {${placeholder}}`);
      }
    }
  }
  return findings;
}

function parseArgs(argv: string[]): { spec?: string; emitResult?: string } {
  const out: { spec?: string; emitResult?: string } = {};
  for (let i = 0; i < argv.length; i++) {
    const key = argv[i]!;
    const value = argv[++i];
    if (key === "--spec") out.spec = value;
    else if (key === "--emit-result") out.emitResult = value;
    else throw new Error(`unknown argument: ${key}`);
  }
  return out;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.spec) return;
  const specText = readFileSync(resolve(args.spec), "utf-8");
  const findings = validateCommentTemplatesAgainstSpec(specText);
  const payload = {
    outcome: findings.length > 0 ? "fail" : "pass",
    finding_count: findings.length,
    findings,
  };
  const json = JSON.stringify(payload, null, 2);
  process.stdout.write(json + "\n");
  if (args.emitResult) writeFileSync(resolve(args.emitResult), json + "\n", "utf-8");
  process.exitCode = findings.length > 0 ? 1 : 0;
}

if (process.argv[1]?.endsWith("comment_templates.ts")) {
  main();
}
