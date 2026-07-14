#!/usr/bin/env node
/** §M.4.5 audit aggregator for the mixed Appendix M workflow payloads. */

import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { emit } from "./lib/emit.js";
import type { Finding, GateOutcome, GateResult } from "./lib/types.js";

interface Parsed {
  prId?: string;
  commitSha?: string;
  mergeBaseSha?: string;
  gateRunId?: string;
  resultPaths: string[];
}

type Payload = Record<string, unknown>;

export function normalizeAppendixMChain(payloads: Payload[]): GateResult {
  const findings: Finding[] = [];
  let parseError = false;
  let explicitFailure = false;
  const acceptedKeys = new Set<string>();
  for (const payload of payloads) {
    for (const raw of asArray(payload.results)) {
      const row = raw as Record<string, unknown>;
      const annotation = (row.annotation ?? {}) as Record<string, unknown>;
      if (row.outcome === "pass" && annotation.targetKey) acceptedKeys.add(String(annotation.targetKey));
    }
  }
  const aggregateStats: Record<string, number | string> = { input_payload_count: payloads.length };

  const addFinding = (finding: Finding) => {
    const key = `${finding.file}:${finding.line}:${finding.message}`;
    if (!findings.some((item) => `${item.file}:${item.line}:${item.message}` === key)) findings.push(finding);
  };

  for (const payload of payloads) {
    const outcome = String(payload.outcome ?? "pass");
    if (outcome === "parse_error") parseError = true;
    if (["fail", "orphan_inline_gate_reference", "invalid_override_rationale", "comment_post_failed"].includes(outcome) || outcome.startsWith("rejected_")) explicitFailure = true;

    const stats = payload.stats;
    if (stats && typeof stats === "object") {
      for (const [key, value] of Object.entries(stats as Record<string, unknown>)) {
        if (typeof value === "number" || typeof value === "string") aggregateStats[key] = value;
      }
    }

    for (const raw of asArray(payload.triggered_concepts)) {
      const row = raw as Record<string, unknown>;
      if (row.coveredByAppendixM === true || row.conceptClass === "named_ci_gate") continue;
      const targetKey = `${String(row.conceptClass ?? "")}::${String(row.conceptName ?? "")}@${String(row.specAnchor ?? "")}`;
      if (acceptedKeys.has(targetKey)) continue;
      addFinding({
        file: "Sourcera_Master_Spec.md",
        line: Number(row.specLineNumber ?? 1),
        anchor: String(row.specAnchor ?? "#document"),
        matched_text: String(row.conceptName ?? ""),
        message: `Appendix M.1 row missing for ${String(row.conceptClass ?? "concept")} ${String(row.conceptName ?? "unknown")}`,
      });
    }
    for (const raw of asArray(payload.orphan_inline_gate_references)) {
      const row = raw as Record<string, unknown>;
      addFinding({
        file: "Sourcera_Master_Spec.md",
        line: Number(row.line ?? 1),
        anchor: String(row.anchor ?? "#document"),
        matched_text: String(row.gateId ?? ""),
        message: `Appendix M.5 catalog row missing for ${String(row.gateId ?? "unknown gate")}`,
      });
    }
    for (const raw of asArray(payload.failures)) {
      const row = raw as Record<string, unknown>;
      addFinding({
        file: "pull_request_description",
        line: Number(row.line ?? 1),
        matched_text: String(row.targetKey ?? row.code ?? ""),
        message: String(row.message ?? row.code ?? "override grammar failure"),
      });
    }
    for (const raw of asArray(payload.results)) {
      const row = raw as Record<string, unknown>;
      if (row.outcome === "pass") continue;
      const annotation = (row.annotation ?? {}) as Record<string, unknown>;
      addFinding({
        file: "pull_request_description",
        line: Number(annotation.prDescriptionLineNumber ?? 1),
        matched_text: String(annotation.targetKey ?? annotation.conceptName ?? ""),
        message: `Appendix M override rejected: ${String(row.outcome ?? "unknown")}`,
      });
    }
    for (const raw of asArray(payload.findings)) {
      if (typeof raw === "string") {
        addFinding({ file: "Sourcera_Master_Spec.md", line: 1, message: raw });
        continue;
      }
      const row = raw as Record<string, unknown>;
      addFinding({
        file: String(row.file ?? "Sourcera_Master_Spec.md"),
        line: Number(row.line ?? 1),
        anchor: row.anchor ? String(row.anchor) : undefined,
        matched_text: row.matched_text ? String(row.matched_text) : undefined,
        message: String(row.message ?? JSON.stringify(row)),
      });
    }
  }

  const outcome: GateOutcome = parseError
    ? "parse_error"
    : explicitFailure || findings.length
      ? "fail"
      : acceptedKeys.size
        ? "override_applied"
        : "pass";
  aggregateStats.finding_count = findings.length;
  return {
    gate_id: "appendix_m_coverage_on_diff",
    outcome,
    findings,
    scanned_files: ["Sourcera_Master_Spec.md", "pull_request_description"],
    stats: aggregateStats,
    detector_version: "2.0.0",
    ran_at_utc: new Date().toISOString(),
  };
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function parse(argv: string[]): Parsed {
  const parsed: Parsed = { resultPaths: [] };
  for (let index = 0; index < argv.length; index++) {
    const key = argv[index];
    const next = () => argv[++index];
    if (key === "--pr-id") parsed.prId = next();
    else if (key === "--commit-sha") parsed.commitSha = next();
    else if (key === "--merge-base-sha") parsed.mergeBaseSha = next();
    else if (key === "--gate-run-id") parsed.gateRunId = next();
    else if (key === "--result") parsed.resultPaths.push(next()!);
    else if (key?.startsWith("--") && key.endsWith("-result")) parsed.resultPaths.push(next()!);
  }
  return parsed;
}

async function main(): Promise<void> {
  const args = parse(process.argv.slice(2));
  const payloads: Payload[] = [];
  for (const path of args.resultPaths) {
    if (!existsSync(path)) continue;
    payloads.push(JSON.parse(readFileSync(path, "utf-8")) as Payload);
  }
  const result = normalizeAppendixMChain(payloads);
  const report = await emit(result, {
    prId: args.prId,
    commitSha: args.commitSha,
    mergeBaseSha: args.mergeBaseSha,
    gateRunId: args.gateRunId,
  });
  process.stdout.write(`${JSON.stringify({ gate_id: result.gate_id, outcome: result.outcome, finding_count: result.findings.length, delivery: report }, null, 2)}\n`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  void main().catch((error) => {
    process.stderr.write(`audit_emit error: ${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
  });
}
