/**
 * Gate: `billing_post_idempotency_key_required`
 *
 * Assertion: every state-mutating §32.8 POST endpoint declares local
 * Idempotency-Key semantics, replay behavior, mismatch behavior, and duplicate
 * side-effect prevention.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import {
  anchorForLine,
  computeSectionRanges,
  findSectionByAnchor,
} from "../lib/spec_loader.js";
import type { Finding, GateContext, SpecDoc, SpecLintGate } from "../lib/types.js";

interface Section {
  title?: string;
  anchor?: string;
  startLine: number;
  endLine: number;
}

function sectionText(doc: SpecDoc, section: Section): string {
  return doc.lines.slice(section.startLine, section.endLine + 1).join("\n");
}

function postSections(doc: SpecDoc): Section[] {
  return computeSectionRanges(doc)
    .filter((range) => /^32\.8\.\d+\s+POST\b/.test(range.heading.title))
    .map((range) => ({
      title: range.heading.title,
      anchor: range.heading.anchor,
      startLine: range.startLine,
      endLine: range.endLine,
    }));
}

function localIdempotencyBlock(text: string): string {
  const match = /\*\*Idempotency\.\*\*([\s\S]*?)(?=\n\n\*\*|\n###|\n##|$)/.exec(text);
  return match?.[0] ?? "";
}

function pushFinding(
  findings: Finding[],
  doc: SpecDoc,
  section: Section,
  matched: string,
  message: string,
) {
  findings.push({
    file: doc.path,
    line: section.startLine,
    anchor: section.anchor ?? anchorForLine(doc, section.startLine),
    matched_text: matched,
    message,
  });
}

export const gate: SpecLintGate = {
  id: "billing_post_idempotency_key_required",
  sourcePhase: "V8.1",
  rowClass: "spec_tree_lint",
  executionContext: "pr_lint",
  overridePath: "not_permitted_catalog_completeness",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    const doc = ctx.masterSpec;
    const findings: Finding[] = [];
    const common = findSectionByAnchor(doc, "32.8.0-common-conventions-for-billing-endpoints");
    const ac = findSectionByAnchor(doc, "32.8.23-acceptance-criteria-billing");

    if (!common) {
      findings.push({
        file: doc.path,
        line: 0,
        matched_text: "32.8.0-common-conventions-for-billing-endpoints",
        message: "§32.8.0 common billing endpoint conventions section is missing.",
      });
    } else {
      const text = sectionText(doc, common);
      const requiredCommon = [
        { re: /Idempotency-Key/i, label: "`Idempotency-Key`" },
        { re: /state-mutating POST/i, label: "state-mutating POST scope" },
        { re: /24 hours|24h/i, label: "24h replay scope" },
        { re: /X-Idempotent-Replay:\s*true/i, label: "`X-Idempotent-Replay: true`" },
        { re: /idempotency_key_request_mismatch/i, label: "`idempotency_key_request_mismatch`" },
      ];
      for (const item of requiredCommon) {
        if (item.re.test(text)) continue;
        pushFinding(findings, doc, common, item.label, `§32.8.0 idempotency convention is missing ${item.label}.`);
      }
    }

    if (!ac) {
      findings.push({
        file: doc.path,
        line: 0,
        matched_text: "32.8.23-acceptance-criteria-billing",
        message: "§32.8.23 Billing Endpoint acceptance criteria section is missing.",
      });
    } else {
      const text = sectionText(doc, ac);
      if (!/billing_post_idempotency_key_required/.test(text)) {
        pushFinding(
          findings,
          doc,
          ac,
          "billing_post_idempotency_key_required",
          "§32.8.23 AC must cite CI gate `billing_post_idempotency_key_required`.",
        );
      }
      if (!/Every state-mutating §32\.8 POST endpoint MUST declare local idempotency semantics/i.test(text)) {
        pushFinding(
          findings,
          doc,
          ac,
          "Every state-mutating §32.8 POST endpoint",
          "§32.8.23 AC must require local idempotency semantics for every state-mutating §32.8 POST endpoint.",
        );
      }
    }

    for (const section of postSections(doc)) {
      const text = sectionText(doc, section);
      const block = localIdempotencyBlock(text);
      const title = section.title ?? `Section starting at line ${section.startLine}`;
      if (!block) {
        pushFinding(
          findings,
          doc,
          section,
          title,
          `${title} is missing a local **Idempotency.** block.`,
        );
        continue;
      }

      const checks = [
        { re: /\bREQUIRED\b/i, label: "REQUIRED" },
        { re: /Idempotency-Key/i, label: "`Idempotency-Key`" },
        { re: /§32\.8\.0|24 hours|24h/i, label: "§32.8.0 / 24h replay scope" },
        { re: /X-Idempotent-Replay:\s*true/i, label: "`X-Idempotent-Replay: true`" },
        { re: /idempotency_key_request_mismatch/i, label: "`idempotency_key_request_mismatch`" },
        { re: /MUST NOT[\s\S]{0,280}(?:duplicate|second|twice|double)|no duplicate/i, label: "no duplicate side effects" },
      ];

      for (const check of checks) {
        if (check.re.test(block)) continue;
        pushFinding(
          findings,
          doc,
          section,
          check.label,
          `${title} local Idempotency block is missing ${check.label}.`,
        );
      }
    }

    return findings;
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
