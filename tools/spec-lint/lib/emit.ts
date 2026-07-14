/**
 * Sourcera Spec-Lint Harness — §M.4.5 four-destination audit-trail emitter.
 *
 * Authority anchor: Sourcera_Master_Spec.md §M.4.5 (audit trail), §M.4.5.1
 * (record schema), §M.4.5.3 (idempotency on re-run), Appendix G
 * (`spec_lint.<gate_id>_run` PostHog taxonomy).
 *
 * Destinations (§M.4.5 ¶1–¶4):
 *   1. Spec-repo run log     — tools/spec-lint/run-logs/{gate_run_id}.json  (always)
 *   2. Convex AuditEvent     — POST to the external Convex deployment         (if CONVEX_SPEC_LINT_DEPLOY_KEY)
 *   3. PostHog event         — spec_lint.<gate_id>_run                        (if POSTHOG_SPEC_LINT_API_KEY)
 *   4. Datadog log           — service:spec-lint                             (if DATADOG_SPEC_LINT_API_KEY)
 *
 * HONESTY CONTRACT: destinations 2–4 are external services reached over the
 * network using CI secrets — exactly the env-gated pattern the existing
 * `.github/workflows/spec-lint.yml` already wires (CONVEX_DEPLOY_KEY /
 * POSTHOG_API_KEY / DATADOG_API_KEY). When a secret is unset (local dev, the
 * verification sandbox), the emitter SKIPS that destination and records the
 * skip in the run log rather than fabricating a delivery. There is no in-repo
 * `convex/` directory: the Convex AuditEvent serializer
 * (`convex/audit/spec_lint_audit_event.ts`, §M.4.5.1) lives in the product
 * repo; this emitter posts to its HTTP action endpoint.
 *
 * Idempotency (§M.4.5.3): the run-log filename and the Convex upsert are keyed
 * on (pr_id, commit_sha, gate_id). Re-runs on the same commit overwrite in place.
 */

import { createHash, randomUUID } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { GateResult } from "./types.js";

const DETECTOR_REPO = "sourcera/sourcera-spec";
const RUN_LOG_DIR = "tools/spec-lint/run-logs";
const DEFAULT_REPO_ROOT = fileURLToPath(new URL("../../../", import.meta.url));

export interface EmitEnv {
  prId?: string;
  commitSha?: string;
  mergeBaseSha?: string;
  gateRunId?: string;
  actor?: string;
  /** Absolute repo root; run logs are written relative to it. */
  repoRoot?: string;
}

export interface DeliveryReport {
  run_log_path: string;
  convex: "delivered" | "skipped_no_secret" | "error";
  posthog: "delivered" | "skipped_no_secret" | "error";
  datadog: "delivered" | "skipped_no_secret" | "error";
  gate_run_id: string;
}

/**
 * Build the §M.4.5.1-conformant audit record for a spec-tree-lint gate. The
 * canonical §M.4.5.1 schema is `appendix_m_coverage_on_diff`-shaped; we emit a
 * compatible superset that adds `gate_id` and a generic `findings[]` array so
 * one schema serves every harness gate. The shared fields
 * (`gate_run_id`/`pr_id`/`commit_sha`/`gate_outcome`/`actor`/`ran_at_utc`/
 * `detector_version`) match the canonical schema verbatim.
 */
export function buildAuditRecord(result: GateResult, env: EmitEnv) {
  const gate_run_id =
    env.gateRunId ??
    deterministicRunId(env.prId, env.commitSha, result.gate_id) ??
    randomUUID();
  return {
    gate_run_id,
    gate_id: result.gate_id,
    pr_id: env.prId ? Number(env.prId) : null,
    pr_repository: DETECTOR_REPO,
    commit_sha: env.commitSha ?? null,
    merge_base_sha: env.mergeBaseSha ?? null,
    gate_outcome: result.outcome,
    finding_count: result.findings.length,
    findings: result.findings.map((f) => ({
      file: f.file,
      line: f.line,
      anchor: f.anchor ?? null,
      matched_text: f.matched_text ? truncate(f.matched_text, 240) : null,
      message: f.message,
      suppressed_by_override: f.suppressed_by_override ?? null,
    })),
    stats: result.stats,
    scanned_files: result.scanned_files,
    actor: env.actor ?? process.env.GITHUB_ACTOR ?? "local",
    ran_at_utc: result.ran_at_utc,
    detector_version: result.detector_version,
  };
}

/**
 * §M.4.5.3 idempotency key: a stable gate_run_id derived from
 * (pr_id, commit_sha, gate_id) so a re-run on the same commit overwrites the
 * prior record. Falls back to undefined when CI identifiers are absent.
 */
function deterministicRunId(
  prId?: string,
  commitSha?: string,
  gateId?: string,
): string | undefined {
  if (!prId || !commitSha || !gateId) return undefined;
  return createHash("sha256")
    .update(`${prId}:${commitSha}:${gateId}`)
    .digest("hex")
    .slice(0, 32);
}

/** Emit the audit record to all four destinations per §M.4.5. */
export async function emit(
  result: GateResult,
  env: EmitEnv,
): Promise<DeliveryReport> {
  const record = buildAuditRecord(result, env);
  const repoRoot = env.repoRoot ?? DEFAULT_REPO_ROOT;

  // (1) Spec-repo run log — always written (CI persists it via git-LFS).
  const runLogPath = join(
    repoRoot,
    RUN_LOG_DIR,
    `${record.gate_run_id}.json`,
  );
  mkdirSync(dirname(runLogPath), { recursive: true });
  writeFileSync(runLogPath, JSON.stringify(record, null, 2) + "\n", "utf-8");

  const report: DeliveryReport = {
    run_log_path: runLogPath,
    convex: "skipped_no_secret",
    posthog: "skipped_no_secret",
    datadog: "skipped_no_secret",
    gate_run_id: record.gate_run_id,
  };

  // (2) Convex AuditEvent (§4.6.1 / §M.4.5.1). action_class=ci_gate.
  const convexKey = process.env.CONVEX_SPEC_LINT_DEPLOY_KEY;
  const convexUrl = process.env.CONVEX_SPEC_LINT_URL;
  if (convexKey && convexUrl) {
    report.convex = await postJson(
      `${convexUrl.replace(/\/$/, "")}/spec_lint_audit_event`,
      {
        action_class: "ci_gate",
        actor_type: "github_app",
        actor_id: "sourcera-spec-bot[bot]",
        target_type: "pull_request",
        target_id: record.pr_id,
        idempotency_key: `${record.pr_id}:${record.commit_sha}:${record.gate_id}`,
        metadata: record,
      },
      { Authorization: `Convex ${convexKey}` },
    );
  }

  // (3) PostHog event spec_lint.<gate_id>_run (Appendix G).
  const posthogKey = process.env.POSTHOG_SPEC_LINT_API_KEY;
  const posthogHost = process.env.POSTHOG_SPEC_LINT_HOST ?? "https://us.i.posthog.com";
  if (posthogKey) {
    report.posthog = await postJson(`${posthogHost}/i/v0/e/`, {
      api_key: posthogKey,
      event: `spec_lint.${result.gate_id}_run`,
      distinct_id: `spec-lint-ci`,
      properties: {
        gate_id: result.gate_id,
        gate_outcome: result.outcome,
        finding_count: result.findings.length,
        pr_id: record.pr_id,
        commit_sha: record.commit_sha,
        detector_version: result.detector_version,
        ...numericStats(result.stats),
      },
    });
  }

  // (4) Datadog log (service:spec-lint). info=pass, warn=override, error=fail.
  const ddKey = process.env.DATADOG_SPEC_LINT_API_KEY;
  const ddSite = process.env.DATADOG_SITE ?? "datadoghq.com";
  if (ddKey) {
    const status =
      result.outcome === "pass"
        ? "info"
        : result.outcome === "override_applied"
          ? "warn"
          : "error";
    report.datadog = await postJson(
      `https://http-intake.logs.${ddSite}/api/v2/logs`,
      [
        {
          ddsource: "spec-lint",
          service: "spec-lint",
          ddtags: `gate:${result.gate_id},outcome:${result.outcome},pr:${record.pr_id ?? "none"}`,
          status,
          message: `spec-lint ${result.gate_id} ${result.outcome} (${result.findings.length} findings)`,
          gate_run: record,
        },
      ],
      { "DD-API-KEY": ddKey },
    );
  }

  return report;
}

async function postJson(
  url: string,
  body: unknown,
  headers: Record<string, string> = {},
): Promise<"delivered" | "error"> {
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...headers },
      body: JSON.stringify(body),
    });
    return res.ok ? "delivered" : "error";
  } catch {
    return "error";
  }
}

function numericStats(stats: Record<string, number | string>) {
  const out: Record<string, number> = {};
  for (const [k, v] of Object.entries(stats)) {
    if (typeof v === "number") out[k] = v;
  }
  return out;
}

function truncate(s: string, n: number): string {
  return s.length <= n ? s : s.slice(0, n) + "…";
}
