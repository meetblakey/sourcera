/**
 * Gate: `console_scope_both_header_required`
 *
 * Assertion: the spec-tree contract for dual-console API tokens is locked:
 * §32.2.1 defines `X-Sourcera-Console`, §4.2.6 / §6.6.3 / Appendix J bind
 * ApiToken.console_scope, §10.16.1 carries a buyer-only request example, and
 * endpoint-local examples never use invalid header values such as `both`.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import { anchorForLine, computeSectionRanges, findSectionByAnchor } from "../lib/spec_loader.js";
import type { Finding, GateContext, SpecDoc, SpecLintGate } from "../lib/types.js";

const HEADER_ANCHOR = "32.2.1-console-scope-disambiguation-header";
const API_TOKEN_ENTITY_ANCHOR = "4.2.6-apitoken";
const API_TOKEN_AUTH_ANCHOR = "6.6-api-token-authentication";
const PHASE_ADVANCEMENT_ANCHOR = "10.16-phase-advancement-api";

const HEADER_REQUIRED = [
  "`X-Sourcera-Console` is the canonical request header",
  "`buyer`, `seller`",
  "REQUIRED when the bearer token's §4.2.6 ApiToken.`console_scope` is `both`",
  "HTTP 403 `console_isolation_violation`",
  "absent for a `both` token",
  "not one of the two registered values",
  "mismatches the endpoint console",
  "server first resolves the bearer token and `console_scope` per §6.6.3",
  "applies endpoint scope/RBAC",
  "§6.6.6 / §32.4.5",
  "§10.16.1 `POST /v1/workspaces/{workspace_id}/advance`",
  "`X-Sourcera-Console: buyer`",
  "seller-only endpoints use `seller`",
  "contradictory header still returns `console_isolation_violation`",
];

const API_TOKEN_ENTITY_REQUIRED = [
  "| `console_scope` | Enum | Appendix J `api_token_console_scope`; required; immutable after create | `buyer`, `seller`, or `both` per §6.6.3 |",
  "`console_scope` is enforced before the endpoint-specific `api_token_scope` check",
  "HTTP 403 `console_isolation_violation`",
  "api_token_console_scope_precedes_endpoint_scope",
];

const API_TOKEN_AUTH_REQUIRED = [
  "console_scope ∈ {buyer, seller, both}",
  "Appendix J Phase-3V `api_token_console_scope` enum",
  "Set at creation; immutable",
  "Tokens with `console_scope = buyer` calling seller-side endpoints return HTTP 403 `console_isolation_violation`",
  "Tokens with `console_scope = both` are usable on either console subject to the §32 endpoint's `scope` requirement",
  "the `console_scope` axis",
];

const APPENDIX_J_REQUIRED = [
  "`api_token_console_scope` enum",
  "`buyer`, `seller`, `both`",
  "Set at API token creation time; immutable",
  "Tokens with `console_scope = both` consume from every applicable registered rate-limit bucket per §32.4.5",
];

const PHASE_ADVANCEMENT_REQUIRED = [
  "X-Sourcera-Console: buyer",
  "missing or contradictory console headers fail closed before mutation",
];

interface SectionText {
  text: string;
  line: number;
  anchor: string;
}

function sectionText(doc: SpecDoc, anchor: string, label: string, findings: Finding[]): SectionText | null {
  const section = findSectionByAnchor(doc, anchor);
  if (!section) {
    findings.push({
      file: doc.path,
      line: 0,
      anchor,
      matched_text: label,
      message: `${label} section is missing; cannot prove console-scope header contract.`,
    });
    return null;
  }
  return {
    text: doc.lines.slice(section.startLine, section.endLine + 1).join("\n"),
    line: section.startLine,
    anchor,
  };
}

function appendixJText(doc: SpecDoc, findings: Finding[]): SectionText | null {
  const appendix = computeSectionRanges(doc).find((range) => /^Appendix J:/.test(range.heading.title));
  if (!appendix) {
    findings.push({
      file: doc.path,
      line: 0,
      matched_text: "Appendix J",
      message: "Appendix J is missing; cannot prove api_token_console_scope enum binding.",
    });
    return null;
  }
  return {
    text: doc.lines.slice(appendix.startLine, appendix.endLine + 1).join("\n"),
    line: appendix.startLine,
    anchor: appendix.heading.anchor ?? "appendix-j",
  };
}

function requireText(
  findings: Finding[],
  doc: SpecDoc,
  section: SectionText | null,
  required: string[],
  label: string,
) {
  if (!section) return;
  for (const value of required) {
    if (section.text.includes(value)) continue;
    findings.push({
      file: doc.path,
      line: section.line,
      anchor: section.anchor,
      matched_text: value,
      message: `${label} is missing required console-scope binding: ${value}`,
    });
  }
}

function invalidHeaderExamples(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  const headerRe = /X-Sourcera-Console:\s*([^\s`|,}]+)/g;
  for (let line = 1; line < doc.lines.length; line++) {
    const raw = doc.lines[line] ?? "";
    let match: RegExpExecArray | null;
    while ((match = headerRe.exec(raw)) !== null) {
      const value = match[1].replace(/[.;)]+$/g, "");
      if (value === "buyer" || value === "seller") continue;
      findings.push({
        file: doc.path,
        line,
        anchor: anchorForLine(doc, line),
        matched_text: `X-Sourcera-Console: ${value}`,
        message: "`X-Sourcera-Console` request examples may use only `buyer` or `seller`; `both` is a token scope, not a request-header value.",
      });
    }
  }
  return findings;
}

export const gate: SpecLintGate = {
  id: "console_scope_both_header_required",
  sourcePhase: "V8.1",
  rowClass: "spec_tree_lint",
  executionContext: "pr_lint",
  overridePath: "not_permitted_console_firewall",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    const doc = ctx.masterSpec;
    const findings: Finding[] = [];

    requireText(
      findings,
      doc,
      sectionText(doc, HEADER_ANCHOR, "§32.2.1 Console-Scope Disambiguation Header", findings),
      HEADER_REQUIRED,
      "§32.2.1",
    );
    requireText(
      findings,
      doc,
      sectionText(doc, API_TOKEN_ENTITY_ANCHOR, "§4.2.6 ApiToken", findings),
      API_TOKEN_ENTITY_REQUIRED,
      "§4.2.6",
    );
    requireText(
      findings,
      doc,
      sectionText(doc, API_TOKEN_AUTH_ANCHOR, "§6.6 API Token Authentication", findings),
      API_TOKEN_AUTH_REQUIRED,
      "§6.6.3",
    );
    requireText(
      findings,
      doc,
      appendixJText(doc, findings),
      APPENDIX_J_REQUIRED,
      "Appendix J api_token_console_scope",
    );
    requireText(
      findings,
      doc,
      sectionText(doc, PHASE_ADVANCEMENT_ANCHOR, "§10.16 Phase Advancement API", findings),
      PHASE_ADVANCEMENT_REQUIRED,
      "§10.16.1",
    );

    findings.push(...invalidHeaderExamples(doc));
    return findings;
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
