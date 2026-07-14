/**
 * Gate: `workspace_status_state_machine_canonicality`
 *
 * Assertion: Workspace status uses only Appendix J `workspace_status` values,
 * Appendix E enumerates those values and transitions, and cancellation does not
 * create unregistered Workspace status values.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import { findSectionByAnchor, findSectionByTitle, parseTableAt } from "../lib/spec_loader.js";
import type { Finding, GateContext, SpecLintGate } from "../lib/types.js";

const STATUSES = ["draft", "active", "suspended", "closed", "archived"];

function strip(s: string | undefined): string {
  return (s ?? "").replace(/`/g, "").trim();
}

export const gate: SpecLintGate = {
  id: "workspace_status_state_machine_canonicality",
  sourcePhase: "4.2",
  rowClass: "spec_tree_lint",
  executionContext: "pr_lint",
  overridePath: "not_permitted",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    const doc = ctx.masterSpec;
    const findings: Finding[] = [];
    const appendixJ = findSectionByAnchor(doc, "appendix-j-controlled-vocabulary-registry");
    const appendixJText = appendixJ ? doc.lines.slice(appendixJ.startLine, appendixJ.endLine + 1).join("\n") : "";
    const enumLineIndex = doc.lines.findIndex((line) => line.includes("`workspace_status` enum"));
    const enumLine = enumLineIndex > 0 ? doc.lines[enumLineIndex] : "";
    for (const status of STATUSES) {
      if (!enumLine.includes(`\`${status}\``)) {
        findings.push({
          file: doc.path,
          line: enumLineIndex > 0 ? enumLineIndex : appendixJ?.startLine ?? 0,
          anchor: appendixJ?.heading.anchor,
          matched_text: status,
          message: `Appendix J workspace_status enum is missing ${status}.`,
        });
      }
    }
    for (const forbidden of ["contract_executed", "deletion_in_progress"]) {
      if (enumLine.includes(forbidden)) {
        findings.push({
          file: doc.path,
          line: enumLineIndex,
          anchor: appendixJ?.heading.anchor,
          matched_text: forbidden,
          message: `${forbidden} must not be registered as a workspace_status value.`,
        });
      }
    }
    if (!appendixJText.includes("`canceled` / `cancelled` are not valid `workspace_status` values for new writes")) {
      findings.push({
        file: doc.path,
        line: enumLineIndex,
        anchor: appendixJ?.heading.anchor,
        message: "Appendix J workspace_status notes must explicitly prohibit canceled / cancelled as Workspace.status values.",
      });
    }

    const appendixE = findSectionByTitle(doc, /^Workspace Status \(Buyer Console\)/);
    if (!appendixE) {
      findings.push({
        file: doc.path,
        line: 0,
        anchor: "appendix-e-workspace-bid-workspace-status-state-machine",
        message: "Appendix E Workspace Status section is missing.",
      });
    } else {
      const text = doc.lines.slice(appendixE.startLine, appendixE.endLine + 1).join("\n");
      for (const status of STATUSES) {
        if (!text.includes(`\`${status}\``)) {
          findings.push({
            file: doc.path,
            line: appendixE.startLine,
            anchor: appendixE.heading.anchor,
            matched_text: status,
            message: `Appendix E Workspace Status section is missing ${status}.`,
          });
        }
      }
      const table = parseTableAt(doc, appendixE.startLine, appendixE.endLine);
      const requiredTransitions = [
        "(none) -> draft",
        "draft -> active",
        "active -> suspended",
        "suspended -> active",
        "active -> closed",
        "active -> archived",
        "closed -> archived",
        "archived -> active",
        "archived -> (terminal purge)",
      ];
      const actual = table.rows.map((row) => strip(row.cells[0]).replace(/\s*→\s*/g, " -> "));
      for (const transition of requiredTransitions) {
        if (!actual.includes(transition)) {
          findings.push({
            file: doc.path,
            line: table.header?.line ?? appendixE.startLine,
            anchor: appendixE.heading.anchor,
            matched_text: transition,
            message: `Appendix E Workspace Status transition table is missing ${transition}.`,
          });
        }
      }
      const phase13Row = table.rows.find((row) =>
        strip(row.cells[0]).replace(/\s*→\s*/g, " -> ") === "active -> closed"
        && row.cells.join(" | ").includes("Phase 13")
      );
      if (!phase13Row || !phase13Row.cells.join(" | ").includes("Selection Record")) {
        findings.push({
          file: doc.path,
          line: table.header?.line ?? appendixE.startLine,
          anchor: appendixE.heading.anchor,
          message: "Appendix E must bind Phase 13 closure to active -> closed with immutable Selection Record creation.",
        });
      }
    }

    const phase13 = findSectionByAnchor(doc, "10.13-phase-13-contract-and-closure");
    if (phase13) {
      const text = doc.lines.slice(phase13.startLine, phase13.endLine + 1).join("\n");
      for (const required of ["Workspace status set to `closed`", "Status is `closed`", "Phase 13 is terminal"]) {
        if (!text.includes(required)) {
          findings.push({
            file: doc.path,
            line: phase13.startLine,
            anchor: phase13.heading.anchor,
            matched_text: required,
            message: `§10.13 must state canonical closure binding: ${required}`,
          });
        }
      }
      if (/Workspace status set to `archived`|Workspace status set to `contract_executed`/.test(text)) {
        findings.push({
          file: doc.path,
          line: phase13.startLine,
          anchor: phase13.heading.anchor,
          message: "§10.13 must close with Workspace.status=closed, not archived or contract_executed.",
        });
      }
    }

    const cancellation = findSectionByAnchor(doc, "10.14-bid-workspace-cancellation-protocol");
    if (cancellation) {
      const text = doc.lines.slice(cancellation.startLine, cancellation.endLine + 1).join("\n");
      for (const required of [
        "Cancellation Request entity (§4.3.26)",
        "MUST NOT introduce `cancelled`, `canceled`, or `deletion_in_progress` as `Workspace.status` values",
        "Cancellation Request row created with `status=undo_grace`",
        "Cancellation Request status changes to `processing`",
      ]) {
        if (!text.includes(required)) {
          findings.push({
            file: doc.path,
            line: cancellation.startLine,
            anchor: cancellation.heading.anchor,
            matched_text: required,
            message: `§10.14 cancellation workflow is missing status-axis binding: ${required}`,
          });
        }
      }
      for (let i = cancellation.startLine; i <= cancellation.endLine; i++) {
        const line = doc.lines[i] ?? "";
        if (/Workspace(?:\.| `)?status.*`(?:cancelled|canceled|deletion_in_progress|contract_executed)`/i.test(line)
          && !/MUST NOT|without introducing|not valid/i.test(line)) {
          findings.push({
            file: doc.path,
            line: i,
            anchor: cancellation.heading.anchor,
            matched_text: line.trim(),
            message: "§10.14 must not write canceled/cancelled/deletion_in_progress/contract_executed into Workspace.status.",
          });
        }
      }
    }

    return findings;
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
