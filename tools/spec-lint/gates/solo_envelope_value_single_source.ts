/**
 * Gate: `solo_envelope_value_single_source`
 *
 * Assertion: the Solo engine-absorbed envelope dollar amount is single-sourced.
 * The literal amount may appear only in Master Spec §34.1.1 / §34.1.2 /
 * §34.2.5 / §44.6.3. Companion docs and UX specs must cite those homes.
 */

import { existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { isEntrypoint, runGateCli } from "../lib/gate.js";
import {
  computeSectionRanges,
  findSectionByAnchor,
  loadDoc,
} from "../lib/spec_loader.js";
import type { Finding, GateContext, SpecDoc, SpecLintGate } from "../lib/types.js";

const SOLO_ENVELOPE_AMOUNT_RE = /\$\s*5(?:\.00)?(?![0-9,])/g;
const SOLO_ENVELOPE_CONTEXT_RE =
  /\b(absorbed|engine-absorbed|envelope)\b/;
const ALLOWED_MASTER_SECTIONS = ["34.1.1", "34.1.2", "34.2.5", "44.6.3"];

function companionDoc(masterSpec: SpecDoc, fileName: string): SpecDoc | null {
  const root = dirname(resolve(masterSpec.path));
  const path = join(root, fileName);
  return existsSync(path) ? loadDoc(path) : null;
}

function leadingSectionNumber(title: string): string {
  return /^([0-9]+(?:\.[0-9]+)*)/.exec(title.trim())?.[1] ?? "";
}

function sectionNumberForLine(doc: SpecDoc, line: number): string {
  let best = "";
  for (const range of computeSectionRanges(doc)) {
    if (range.startLine <= line && line <= range.endLine) {
      const num = leadingSectionNumber(range.heading.title);
      if (num) best = num;
    }
  }
  return best;
}

function isAllowedMasterHome(doc: SpecDoc, line: number): boolean {
  const section = sectionNumberForLine(doc, line);
  return ALLOWED_MASTER_SECTIONS.some(
    (allowed) => section === allowed || section.startsWith(`${allowed}.`),
  );
}

function scanDoc(doc: SpecDoc, allowMasterHomes: boolean): Finding[] {
  const findings: Finding[] = [];
  for (let line = 1; line < doc.lines.length; line++) {
    const text = doc.lines[line] ?? "";
    if (!SOLO_ENVELOPE_CONTEXT_RE.test(text)) continue;
    SOLO_ENVELOPE_AMOUNT_RE.lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = SOLO_ENVELOPE_AMOUNT_RE.exec(text)) !== null) {
      if (allowMasterHomes && isAllowedMasterHome(doc, line)) continue;
      findings.push({
        file: doc.path,
        line,
        matched_text: match[0],
        message:
          "Solo absorbed-envelope dollar amount is restated outside §34.1.1 / §34.1.2 / §34.2.5 / §44.6.3; cite the canonical section instead.",
      });
    }
  }
  return findings;
}

function sectionText(doc: SpecDoc, anchor: string): string {
  const section = findSectionByAnchor(doc, anchor);
  if (!section) return "";
  return doc.lines.slice(section.startLine, section.endLine + 1).join("\n");
}

function requireText(doc: SpecDoc, anchor: string, token: string, label: string): Finding[] {
  const text = sectionText(doc, anchor);
  if (!text) {
    return [{
      file: doc.path,
      line: 0,
      anchor,
      matched_text: token,
      message: `${label} section is missing.`,
    }];
  }
  return text.includes(token)
    ? []
    : [{
        file: doc.path,
        line: 0,
        anchor,
        matched_text: token,
        message: `${label} is missing required singleton binding: ${token}`,
      }];
}

export const gate: SpecLintGate = {
  id: "solo_envelope_value_single_source",
  sourcePhase: "14.10 [V11]",
  rowClass: "spec_tree_lint",
  executionContext: "pr_lint",
  overridePath: "not_permitted_billing_singleton",
  inputs: { masterSpec: true, uxSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    const findings: Finding[] = [];
    const docs: Array<{ doc: SpecDoc; allowMasterHomes: boolean }> = [
      { doc: ctx.masterSpec, allowMasterHomes: true },
    ];

    if (ctx.uxSpec) docs.push({ doc: ctx.uxSpec, allowMasterHomes: false });

    for (const fileName of [
      "Sourcera_Buyer_Pricing_Strategy.md",
      "Sourcera_Seller_Pricing_Strategy.md",
    ]) {
      const doc = companionDoc(ctx.masterSpec, fileName);
      if (!doc) {
        findings.push({
          file: ctx.masterSpec.path,
          line: 0,
          matched_text: fileName,
          message: `Required companion pricing doc is missing: ${fileName}.`,
        });
      } else {
        docs.push({ doc, allowMasterHomes: false });
      }
    }

    for (const item of docs) {
      findings.push(...scanDoc(item.doc, item.allowMasterHomes));
    }

    findings.push(...requireText(
      ctx.masterSpec,
      "44.6.3-margin-envelope-defaults",
      "Per Authoring Convention #10, §44.6.3 cites §34.1.1 / §34.1.2 / §34.2.5 for the value-dollar ceilings and never restates them.",
      "§44.6.3 Value-Dollar Envelope",
    ));
    findings.push(...requireText(
      ctx.masterSpec,
      "44.6.8-acceptance-criteria",
      "The Solo envelope default is cited from §34.1.1 / §34.1.2 / §34.2.5, never restated inline at §44.6 except as a non-authoritative illustration in §44.6.3.",
      "§44.6.8 Acceptance Criteria",
    ));
    findings.push(...requireText(
      ctx.masterSpec,
      "appendix-m-surface-engine-mapping",
      "Solo-tier engine-absorbed AI envelope (canonical §34 value-dollar envelope per console; never pooled with paid wallet)",
      "Appendix M Surface/Engine Mapping",
    ));

    return findings;
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
