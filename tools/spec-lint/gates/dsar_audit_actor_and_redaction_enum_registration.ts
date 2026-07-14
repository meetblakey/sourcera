/**
 * Gate: `dsar_audit_actor_and_redaction_enum_registration`
 *
 * Assertion: DSAR row-redaction AuditEvents use the canonical system actor
 * and every DSAR redaction-path token used in active prose is registered in
 * Appendix J `audit_event_payload_redaction_path`.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import { anchorForLine, findSectionByAnchor } from "../lib/spec_loader.js";
import type { Finding, GateContext, SpecDoc, SpecLintGate } from "../lib/types.js";

function push(findings: Finding[], doc: SpecDoc, line: number, matched: string, message: string) {
  findings.push({
    file: doc.path,
    line,
    anchor: anchorForLine(doc, line),
    matched_text: matched,
    message,
  });
}

function codeTokens(line: string): string[] {
  return [...line.matchAll(/`([^`]+)`/g)].map((m) => m[1]);
}

function findLine(doc: SpecDoc, re: RegExp, start = 1, end = doc.lines.length - 1): number {
  for (let line = start; line <= end; line++) {
    if (re.test(doc.lines[line] ?? "")) return line;
  }
  return -1;
}

function usedRedactionPaths(doc: SpecDoc): Map<string, number> {
  const paths = new Map<string, number>();
  const patterns = [
    /redaction_path\s*=\s*([a-z0-9_]+)/g,
    /redaction path `([a-z0-9_]+)`/g,
  ];
  for (let line = 1; line < doc.lines.length; line++) {
    const text = doc.lines[line] ?? "";
    for (const pattern of patterns) {
      pattern.lastIndex = 0;
      let match: RegExpExecArray | null;
      while ((match = pattern.exec(text)) !== null) {
        if (!paths.has(match[1])) paths.set(match[1], line);
      }
    }
  }
  return paths;
}

export const gate: SpecLintGate = {
  id: "dsar_audit_actor_and_redaction_enum_registration",
  sourcePhase: "3V",
  rowClass: "spec_tree_lint",
  executionContext: "pr_lint",
  overridePath: "not_permitted_gdpr_art_17",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    const doc = ctx.masterSpec;
    const findings: Finding[] = [];

    const dsarCascade = findSectionByAnchor(doc, "6.8.4-dsar-cascade-across-linked-entities");
    if (!dsarCascade) {
      push(findings, doc, 0, "§6.8.4", "§6.8.4 DSAR cascade section is missing.");
    } else {
      const acLine = findLine(doc, /Every mutation made by the cascade worker MUST write a `dsar\.cascade\.row_redacted` AuditEvent/, dsarCascade.startLine, dsarCascade.endLine);
      if (acLine < 0) {
        push(findings, doc, dsarCascade.startLine, "dsar.cascade.row_redacted", "§6.8.4 AC #2 must require a dsar.cascade.row_redacted AuditEvent for every cascade mutation.");
      } else {
        const text = doc.lines[acLine] ?? "";
        for (const required of ["entity_type", "entity_id", "redaction_path", "actor_type=system_dsar_cascade_worker", "actor_id=dsar_cascade_worker_v1"]) {
          if (!text.includes(required)) {
            push(findings, doc, acLine, required, `§6.8.4 AC #2 must include \`${required}\`.`);
          }
        }
      }
    }

    const appendixJ = findSectionByAnchor(doc, "appendix-j-phase-v9-enums");
    if (!appendixJ) {
      push(findings, doc, 0, "Appendix J Phase V9 enums", "Appendix J Phase V9 enum section is missing.");
      return findings;
    }

    const actorLine = findLine(doc, /DSAR AuditEvent Actor Types/);
    if (actorLine < 0) {
      push(findings, doc, appendixJ.startLine, "DSAR AuditEvent Actor Types", "Appendix J must register the DSAR AuditEvent actor profile.");
    } else {
      const text = doc.lines[actorLine] ?? "";
      for (const required of ["system_dsar_cascade_worker", "actor_id=dsar_cascade_worker_v1", "console=platform_system", "user_id=NULL"]) {
        if (!text.includes(required)) {
          push(findings, doc, actorLine, required, `Appendix J DSAR actor profile must include \`${required}\`.`);
        }
      }
    }

    const redactionLine = findLine(doc, /audit_event_payload_redaction_path/);
    if (redactionLine < 0) {
      push(findings, doc, appendixJ.startLine, "audit_event_payload_redaction_path", "Appendix J must register `audit_event_payload_redaction_path`.");
      return findings;
    }

    const registered = new Set(codeTokens(doc.lines[redactionLine] ?? "").filter((token) => token !== "audit_event_payload_redaction_path"));
    const used = usedRedactionPaths(doc);
    for (const required of ["pattern_a_fk_column_rewrite", "pattern_b_fk_preservation_with_user_row_pseudonymization", "pattern_a_in_json_value"]) {
      if (!registered.has(required)) {
        push(findings, doc, redactionLine, required, `Appendix J must register required redaction path \`${required}\`.`);
      }
    }
    for (const [path, line] of used.entries()) {
      if (!registered.has(path)) {
        push(findings, doc, line, path, `Redaction path \`${path}\` is used but not registered in Appendix J audit_event_payload_redaction_path.`);
      }
    }

    return findings;
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
