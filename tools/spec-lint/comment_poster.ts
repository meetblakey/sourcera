#!/usr/bin/env node
/** §M.4.3 fail-closed GitHub review poster. */

import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { renderTemplate } from "./comment_templates.js";

interface TriggeredConcept {
  conceptName: string;
  conceptClass: string;
  specAnchor: string;
  specLineNumber: number;
  coveredByAppendixM: boolean;
}

interface TriggerDetectorPayload {
  triggered_concepts?: TriggeredConcept[];
  orphan_inline_gate_references?: Array<{ gateId: string; line: number; anchor: string }>;
}

interface GrammarFailure { code?: string; line?: number; message?: string }
interface CrossResult { outcome?: string; annotation?: { targetKey?: string; conceptName?: string }; predicates?: unknown[] }

export interface ReviewPlanInput {
  gateRunId: string;
  triggerDetector: TriggerDetectorPayload;
  grammarFailures: GrammarFailure[];
  crossValidationResults: CrossResult[];
  siblingOutcome?: string;
  appendixKOutcome?: string;
}

export interface ReviewComment { path: string; line: number; side: "RIGHT"; body: string }
export interface ReviewPlan { blocking: boolean; body: string; comments: ReviewComment[] }

export function buildReviewPlan(input: ReviewPlanInput): ReviewPlan {
  const comments: ReviewComment[] = [];
  const summary: string[] = [];
  const acceptedKeys = new Set(
    input.crossValidationResults
      .filter((item) => item.outcome === "pass")
      .map((item) => item.annotation?.targetKey)
      .filter((item): item is string => Boolean(item)),
  );

  for (const concept of input.triggerDetector.triggered_concepts ?? []) {
    const targetKey = `${concept.conceptClass}::${concept.conceptName}@${concept.specAnchor}`;
    if (concept.coveredByAppendixM || acceptedKeys.has(targetKey) || concept.conceptClass === "named_ci_gate") continue;
    comments.push({
      path: "Sourcera_Master_Spec.md",
      line: concept.specLineNumber,
      side: "RIGHT",
      body: renderTemplate("missing_row", {
        concept_class: concept.conceptClass,
        concept_name: concept.conceptName,
        spec_anchor: concept.specAnchor,
        line_number: concept.specLineNumber,
        gate_run_id: input.gateRunId,
      }),
    });
  }
  for (const orphan of input.triggerDetector.orphan_inline_gate_references ?? []) {
    comments.push({
      path: "Sourcera_Master_Spec.md",
      line: orphan.line,
      side: "RIGHT",
      body: renderTemplate("orphan_inline_gate_reference", {
        gate_id: orphan.gateId,
        spec_anchor: orphan.anchor,
        line_number: orphan.line,
        gate_run_id: input.gateRunId,
      }),
    });
  }
  for (const failure of input.grammarFailures) summary.push(`Override grammar failure at PR description line ${failure.line ?? "?"}: ${failure.message ?? failure.code ?? "invalid annotation"}.`);
  for (const result of input.crossValidationResults.filter((item) => item.outcome && item.outcome !== "pass")) {
    summary.push(`Override rejected for ${result.annotation?.targetKey ?? result.annotation?.conceptName ?? "unknown target"}: ${result.outcome}.`);
  }
  if (input.siblingOutcome && input.siblingOutcome !== "pass") summary.push(`Sibling override validation: ${input.siblingOutcome}.`);
  if (input.appendixKOutcome && input.appendixKOutcome !== "pass") summary.push(`Appendix K canonicality: ${input.appendixKOutcome}.`);
  const blocking = comments.length > 0 || summary.length > 0;
  return {
    blocking,
    body: summary.length ? [`**Sourcera spec-lint blocked.**`, "", ...summary, "", `Gate run ID: \`${input.gateRunId}\`.`].join("\n") : "",
    comments,
  };
}

interface CliArgs {
  prId: string;
  trigger?: string;
  grammar?: string;
  cross?: string;
  sibling?: string;
  appendixK?: string;
  maxRetries: number;
  emit?: string;
  dryRun: boolean;
}

function parseArgs(argv: string[]): CliArgs {
  const out: CliArgs = { prId: "", maxRetries: 5, dryRun: false };
  for (let index = 0; index < argv.length; index++) {
    const key = argv[index]!;
    if (key === "--dry-run") { out.dryRun = true; continue; }
    const value = argv[++index]!;
    if (key === "--pr-id") out.prId = value;
    else if (key === "--trigger-detector-result") out.trigger = value;
    else if (key === "--override-parser-grammar-failures") out.grammar = value;
    else if (key === "--cross-validator-result") out.cross = value;
    else if (key === "--sibling-override-result") out.sibling = value;
    else if (key === "--appendix-k-canonicality-result") out.appendixK = value;
    else if (key === "--max-retries") out.maxRetries = Number(value);
    else if (key === "--emit-post-status") out.emit = value;
    else if (key === "--cosmetic-filter-result") { /* accepted; no comments for cosmetic changes */ }
    else throw new Error(`unknown argument: ${key}`);
  }
  return out;
}

function optionalJson(path?: string): Record<string, unknown> {
  if (!path) return {};
  try { return JSON.parse(readFileSync(resolve(path), "utf-8")) as Record<string, unknown>; }
  catch { return {}; }
}

async function postReview(prId: string, plan: ReviewPlan, maxRetries: number): Promise<"posted" | "comment_post_failed"> {
  const token = process.env.GH_TOKEN;
  const repo = process.env.GITHUB_REPOSITORY;
  if (!token || !repo || !prId) return "comment_post_failed";
  const payload = { event: "COMMENT", body: plan.body || undefined, comments: plan.comments };
  const delays = [1000, 4000, 16000, 64000, 256000];
  for (let attempt = 0; attempt < Math.max(1, maxRetries); attempt++) {
    try {
      const response = await fetch(`https://api.github.com/repos/${repo}/pulls/${prId}/reviews`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json", "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (response.ok) return "posted";
    } catch { /* retry below */ }
    if (attempt + 1 < maxRetries) await new Promise((done) => setTimeout(done, delays[Math.min(attempt, delays.length - 1)]));
  }
  return "comment_post_failed";
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  const trigger = optionalJson(args.trigger) as TriggerDetectorPayload;
  const grammarPayload = optionalJson(args.grammar);
  const crossPayload = optionalJson(args.cross);
  const siblingPayload = optionalJson(args.sibling);
  const appendixKPayload = optionalJson(args.appendixK);
  const gateRunId = process.env.GITHUB_RUN_ID ? `${process.env.GITHUB_RUN_ID}-${process.env.GITHUB_RUN_ATTEMPT ?? "1"}` : "local";
  const plan = buildReviewPlan({
    gateRunId,
    triggerDetector: trigger,
    grammarFailures: (grammarPayload.failures as GrammarFailure[] | undefined) ?? [],
    crossValidationResults: (crossPayload.results as CrossResult[] | undefined) ?? [],
    siblingOutcome: siblingPayload.outcome as string | undefined,
    appendixKOutcome: appendixKPayload.outcome as string | undefined,
  });
  let status: "not_required" | "dry_run" | "posted" | "comment_post_failed" = "not_required";
  if (plan.blocking) status = args.dryRun ? "dry_run" : await postReview(args.prId, plan, args.maxRetries);
  const payload = { outcome: plan.blocking ? (status === "comment_post_failed" ? "comment_post_failed" : "fail") : "pass", status, plan };
  const json = `${JSON.stringify(payload, null, 2)}\n`;
  process.stdout.write(json);
  if (args.emit) writeFileSync(resolve(args.emit), json, "utf-8");
  process.exitCode = plan.blocking ? 1 : 0;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) void main();
