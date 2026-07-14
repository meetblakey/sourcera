/**
 * Gate: `presigned_url_egress_convention_single_source`
 *
 * Assertion: presigned-download URL TTL and requester-IP binding resolve to
 * §33.1.2, not §33.9 or endpoint-local acceptance criteria.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import type { Finding, GateContext, SpecDoc, SpecLintGate } from "../lib/types.js";
import { m5RuntimeActiveFindings, push, requireTokens, sectionTextByAnchor } from "./enterprise_security_gate_helpers.js";

const SECTION_TOKENS = [
  "§33.1.2 is the single authoritative home for the presigned-download URL TTL and requester-IP binding convention",
  "| URL TTL | 15 minutes from mint time |",
  "| Requester binding | URL is bound to a one-way hash of the requester IP address at mint time; fetch from any other IP fails at the storage edge |",
  "| Residency binding | URL can resolve only against the artifact's residency partition; cross-region redirect is forbidden |",
  "| Re-mint authority | The issuing endpoint owns re-mint count, recovery behavior, and polling payload flags; §33.1.2 owns only TTL, IP binding, residency binding, and edge observability |",
  "Any Master Spec citation for presigned-download TTL or single-IP binding MUST cite §33.1.2, not §33.9.",
] as const;

const PRESIGNED_RE = /(?:presigned|download_url|signed URL)/i;
const CONTRACT_RE = /(?:15[- ]minute TTL|15[- ]min TTL|single-IP-bound|IP-bound|requester IP|requester-IP binding)/i;
const STALE_AUTHORITY_RE = /§33\.9/;

function lineFindings(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  const section = sectionTextByAnchor(doc, "33.1.2-presigned-url-egress-binding");
  const start = section?.startLine ?? -1;
  const end = section?.endLine ?? -1;
  for (let line = 1; line < doc.lines.length; line += 1) {
    if (line >= start && line <= end) continue;
    const text = doc.lines[line] ?? "";
    if (text.includes("presigned_url_egress_convention_single_source")) continue;
    if (PRESIGNED_RE.test(text) && CONTRACT_RE.test(text) && !text.includes("§33.1.2")) {
      push(
        findings,
        doc,
        line,
        text.trim(),
        "Presigned download URL TTL / IP-binding references must cite §33.1.2.",
      );
    }
    if (PRESIGNED_RE.test(text) && CONTRACT_RE.test(text) && STALE_AUTHORITY_RE.test(text)) {
      push(
        findings,
        doc,
        line,
        "§33.9",
        "Presigned download URL contract must not route through §33.9.",
      );
    }
  }
  return findings;
}

export const gate: SpecLintGate = {
  id: "presigned_url_egress_convention_single_source",
  sourcePhase: "v7.2.0-REM Phase 33",
  rowClass: "numerical_singleton_invariant",
  executionContext: "pr_lint",
  overridePath: "not_permitted_catalog_completeness",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    const doc = ctx.masterSpec;
    const section = sectionTextByAnchor(doc, "33.1.2-presigned-url-egress-binding");
    const findings: Finding[] = [];
    requireTokens(findings, doc, section, "§33.1.2 Presigned URL Egress Binding", SECTION_TOKENS);
    findings.push(...lineFindings(doc));
    findings.push(...m5RuntimeActiveFindings(doc, "presigned_url_egress_convention_single_source"));
    return findings;
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
