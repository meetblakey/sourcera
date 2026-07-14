/**
 * Gate: `section3_presence_pipeline_authority_consistency`
 *
 * Assertion: Presence identity limits, mobile PipelineSurface labels, and
 * form-token source authority remain aligned between the Master and UX specs.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import { findSectionByTitle } from "../lib/spec_loader.js";
import type { Finding, GateContext, SpecDoc, SpecLintGate } from "../lib/types.js";
import { m5RuntimeActiveFindings, push, requireTokens, sectionTextByAnchor } from "./enterprise_security_gate_helpers.js";

const GATE_ID = "section3_presence_pipeline_authority_consistency";

function requireUxTokens(findings: Finding[], doc: SpecDoc | undefined, title: RegExp, label: string, tokens: readonly string[]) {
  if (!doc) {
    findings.push({ file: "UX_Design_of_Sourcera.md", line: 0, message: `${label} requires the UX companion.` });
    return;
  }
  const section = findSectionByTitle(doc, title);
  const scope = section ? { text: doc.lines.slice(section.startLine, section.endLine + 1).join("\n"), startLine: section.startLine } : null;
  requireTokens(findings, doc, scope, label, tokens);
}

function forbidTokens(findings: Finding[], doc: SpecDoc, anchor: string, label: string, tokens: readonly string[]) {
  const scope = sectionTextByAnchor(doc, anchor);
  if (!scope) {
    push(findings, doc, 0, label, `${label} section is missing.`);
    return;
  }
  for (const token of tokens) {
    if (scope.text.includes(token)) push(findings, doc, scope.startLine, token, `${label} retains forbidden stale authority text: ${token}`);
  }
}

function findingsFor(master: SpecDoc, ux: SpecDoc | undefined): Finding[] {
  const findings: Finding[] = [];
  requireTokens(findings, master, sectionTextByAnchor(master, "3.6-form-and-input-tokens"), "§3.6 form-token authority", [
    "Master Spec §3.6.1 is canonical.",
    "`UX_Design_of_Sourcera.md` §2.9 is a designer-facing mirror.",
    "`duplicate_requirement` (Appendix I)",
  ]);
  forbidTokens(findings, master, "3.6-form-and-input-tokens", "§3.6 form-token authority", [
    "retired Master Summary §2.9",
    "retired Master Summary §9.3.8",
  ]);
  requireTokens(findings, master, sectionTextByAnchor(master, "3.9-cursor-presence-visualization"), "§3.9 multi-device presence", [
    "**Multi-device sessions.**",
    "distinct hue per active PresenceRecord",
    "one person with `+N devices`",
    "presence_multi_device_hue_distinct",
  ]);
  requireTokens(findings, master, sectionTextByAnchor(master, "3.11-dark-mode-parity-rules"), "§3.11 Ops theme authority", [
    "managed by `ops_admin` per §50.3",
  ]);
  forbidTokens(findings, master, "3.11-dark-mode-parity-rules", "§3.11 Ops theme authority", ["Ops Director"]);
  requireTokens(findings, master, sectionTextByAnchor(master, "3.12-presence-and-unread-tracking"), "§3.12 avatar limits", [
    "PresenceAvatarStack cardinality is canonical in §38.12",
    "View all",
  ]);
  requireTokens(findings, master, sectionTextByAnchor(master, "3.14-pipeline-surface-compression"), "§3.14 mobile short labels", [
    "Buyer `St / Df / Sc / Dc`; Seller `Rc / Df / Rv / Sb`.",
    "pairwise distinct",
    "aria-label",
  ]);
  requireTokens(findings, master, sectionTextByAnchor(master, "38.12-presence-avatar-stack-component"), "§38.12 avatar-stack limits", [
    "at most 5 avatar identities on `desktop` / `tablet`, at most 2 on `mobile_xs` / `mobile_sm`",
    "at most 20 roster identities",
    "View all",
  ]);
  requireUxTokens(findings, ux, /^2\.9 Form & Input Tokens$/, "UX §2.9 form-token authority", [
    "**Authority.** Master Spec §3.6.1 is canonical.",
    "designer-facing mirror",
    "MUST NOT introduce values",
  ]);
  requireUxTokens(findings, ux, /^5\.2\.19 PipelineSurface$/, "UX §5.2.19 mobile short labels", [
    "Buyer: St / Df / Sc / Dc; Seller: Rc / Df / Rv / Sb",
    "pairwise distinct",
    "aria-label",
  ]);
  findings.push(...m5RuntimeActiveFindings(master, GATE_ID));
  return findings;
}

export const gate: SpecLintGate = {
  id: GATE_ID,
  sourcePhase: "v7.1.1 Section 3 presence, mobile pipeline, and source-authority closure",
  rowClass: "content_consistency",
  executionContext: "post-build",
  overridePath: "not_permitted",
  inputs: { masterSpec: true, uxSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    return findingsFor(ctx.masterSpec, ctx.uxSpec);
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
