/**
 * Gate: `webhook_inline_retry_curve_lint`
 *
 * Assertion: Appendix F owns webhook retry timing; other sections cite F.1/F.2
 * and do not reintroduce inline webhook delay lists or retired retry classes.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import type { Finding, GateContext, SpecDoc, SpecLintGate } from "../lib/types.js";
import {
  findLine,
  m5RuntimeActiveFindings,
  push,
  requireTokens,
  sectionTextByAnchor,
} from "./enterprise_security_gate_helpers.js";

const GATE_ID = "webhook_inline_retry_curve_lint";

const APPENDIX_F_TOKENS = [
  "§F.1 and §F.2 are the only normative homes for webhook retry timing",
  "Body sections, Appendix C rows, and Appendix G rows cite the retry class (`standard` or `financial_impact`) instead of restating delays",
  "live webhook taxonomy is intentionally binary: `standard` and `financial_impact`",
  "Historical five-delay variants such as `1m / 5m / 30m / 2h / 12h` are retired for webhook transport",
  "Class membership is registered in Appendix J `webhook_retry_class` enum",
];

const RETIRED_LABELS = [
  "webhook_standard",
  "standard_webhook",
  "webhook_critical_business",
  "security_critical",
  "compliance_critical",
  "org_management",
  "infra_critical",
  "console_bridge_standard",
];

const WEBHOOK_DELAY_LISTS = [
  /\b1m\s*[,/]\s*5m\s*[,/]\s*30m\s*[,/]\s*2h\s*[,/]\s*12h\b/i,
  /\b1 minute\s*(?:->|→|\/|,)\s*5 minutes\s*(?:->|→|\/|,)\s*30 minutes\s*(?:->|→|\/|,)\s*2 hours\b/i,
  /\b5 seconds\s*(?:->|→|\/|,)\s*1 minute\s*(?:->|→|\/|,)\s*15 minutes\s*(?:->|→|\/|,)\s*1 hour\b/i,
];

const OPERATIONAL_DELAY_LISTS = [
  /\b1s,\s*2s,\s*4s,\s*8s,\s*16s\b/i,
  /\b1s,\s*5s,\s*30s,\s*2m,\s*10m\b/i,
  /\b1s,\s*5s,\s*30s,\s*2m,\s*10m,\s*30m,\s*2h,\s*8h\b/i,
  /\b1m,\s*5m,\s*30m,\s*2h,\s*12h\b/i,
];

function isSafeRetiredContext(line: string): boolean {
  return /\b(retired|former|historical|rejected|unregistered|not a webhook retry class|not a member|topic_tags)\b/i.test(line);
}

function isSafeOperationalSchedule(line: string): boolean {
  return /\b(non-webhook|not customer webhook delivery|not a customer webhook|not a member of Appendix J|local policy|Stripe charge|Loops\.so|DNS|cache|fanout|provider reconnect|Solo per-evaluation Stripe charge|bridge_apply_standard)\b/i.test(line);
}

function appendixJRetryClassFindings(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  const row = findLine(doc, (line) => line.includes("**`webhook_retry_class`**"));
  if (!row) {
    push(findings, doc, 0, "webhook_retry_class", "Appendix J webhook_retry_class enum is missing.");
    return findings;
  }

  const enumList = row.text.match(/:\s*([^.]*)\./)?.[1] ?? "";
  const values = [...enumList.matchAll(/`([^`]+)`/g)].map((match) => match[1]);
  const expected = ["standard", "financial_impact"];
  if (values.join("|") !== expected.join("|")) {
    push(
      findings,
      doc,
      row.line,
      enumList,
      "Appendix J webhook_retry_class must contain exactly `standard`, `financial_impact` in that order.",
    );
  }
  if (!row.text.includes("The Console-Bridge apply schedule is the non-webhook `bridge_apply_standard` curve")) {
    push(findings, doc, row.line, "bridge_apply_standard", "Appendix J must keep bridge_apply_standard outside webhook_retry_class.");
  }
  return findings;
}

function scanRetiredRetryLabels(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  for (let lineNo = 1; lineNo < doc.lines.length; lineNo += 1) {
    const line = doc.lines[lineNo] ?? "";
    if (!/\b(webhook|retry class|retry-class|retry_curve|Retry Curve)\b/i.test(line)) continue;
    for (const label of RETIRED_LABELS) {
      if (line.includes(label) && !isSafeRetiredContext(line)) {
        push(
          findings,
          doc,
          lineNo,
          label,
          `Retired retry label ${label} may appear only in explicit retired/non-member webhook retry contexts.`,
        );
      }
    }
  }
  return findings;
}

function scanInlineDelayLists(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  const appendixF = sectionTextByAnchor(doc, "appendix-f-webhook-retry-recovery");
  const inAppendixF = (lineNo: number) =>
    !!appendixF && lineNo >= appendixF.startLine && lineNo <= appendixF.endLine;

  for (let lineNo = 1; lineNo < doc.lines.length; lineNo += 1) {
    if (inAppendixF(lineNo)) continue;
    const line = doc.lines[lineNo] ?? "";
    const lower = line.toLowerCase();

    if (WEBHOOK_DELAY_LISTS.some((pattern) => pattern.test(line)) && lower.includes("webhook") && !isSafeOperationalSchedule(line)) {
      push(
        findings,
        doc,
        lineNo,
        line.trim().slice(0, 180),
        "Webhook retry timing outside Appendix F must cite Appendix F.1/F.2 and must not restate delay lists.",
      );
    }

    if (OPERATIONAL_DELAY_LISTS.some((pattern) => pattern.test(line)) && lower.includes("webhook") && !isSafeOperationalSchedule(line)) {
      push(
        findings,
        doc,
        lineNo,
        line.trim().slice(0, 180),
        "Inline operational retry schedules that mention webhooks must be labeled non-webhook/local policy.",
      );
    }
  }
  return findings;
}

export const gate: SpecLintGate = {
  id: GATE_ID,
  sourcePhase: "v7.2.0-REM Webhook Retry Singleton P1",
  rowClass: "numerical_singleton_invariant",
  executionContext: "pr_lint",
  overridePath: "not_permitted_retry_class_binding",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    const doc = ctx.masterSpec;
    const findings: Finding[] = [];

    requireTokens(
      findings,
      doc,
      sectionTextByAnchor(doc, "appendix-f-webhook-retry-recovery"),
      "Appendix F webhook retry singleton",
      APPENDIX_F_TOKENS,
    );
    findings.push(...appendixJRetryClassFindings(doc));
    findings.push(...scanRetiredRetryLabels(doc));
    findings.push(...scanInlineDelayLists(doc));
    findings.push(...m5RuntimeActiveFindings(doc, GATE_ID));
    return findings;
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
