/**
 * Gate: `workspace_cancellation_event_delivery_conformance`
 *
 * Assertion: cancellation/recovery dispatch uses the registered Appendix C
 * event pipeline with idempotency, HMAC signing, retry/DLQ, size cap, and
 * replay-safe dedupe.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import { findSectionByAnchor, parseTableAt } from "../lib/spec_loader.js";
import type { Finding, GateContext, SpecLintGate } from "../lib/types.js";

const REQUIRED_SECTION_TEXTS = [
  "They are not direct-email shortcuts.",
  "§31.1 event idempotency via `event_id`; §31.2 HMAC-SHA256 payload signing; Appendix F §F.1 standard retry curve; DLQ after 5 failed attempts; payload ≤ 256 KB",
  "Both events MUST use §31.1 `event_id` idempotency and §31.2 HMAC-SHA256 signing for webhook delivery.",
  "Both events MUST resolve to Appendix F §F.1 standard retry and DLQ behavior unless explicitly promoted to another Appendix F class in a future version.",
  "Direct email broadcast from §10.14 is forbidden; user-facing email is a renderer of the registered Appendix C event only.",
  "replay MUST NOT duplicate user notifications, Console Bridge rows, or PostHog events.",
];

export const gate: SpecLintGate = {
  id: "workspace_cancellation_event_delivery_conformance",
  sourcePhase: "4.2",
  rowClass: "spec_tree_lint",
  executionContext: "pr_lint",
  overridePath: "not_permitted",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    const doc = ctx.masterSpec;
    const section = findSectionByAnchor(doc, "10.14-bid-workspace-cancellation-protocol");
    const text = section ? doc.lines.slice(section.startLine, section.endLine + 1).join("\n") : "";
    if (!section) {
      return [{ file: doc.path, line: 0, anchor: "10.14-bid-workspace-cancellation-protocol", message: "§10.14 cancellation section is missing." }];
    }

    const findings: Finding[] = [];
    for (const required of REQUIRED_SECTION_TEXTS) {
      if (!text.includes(required)) {
        findings.push({
          file: doc.path,
          line: section.startLine,
          anchor: section.heading.anchor,
          matched_text: required,
          message: `§10.14.7 is missing event-delivery conformance text: ${required}`,
        });
      }
    }

    const deliveryTable = parseTableAt(doc, section.startLine, section.endLine);
    for (const event of ["workspace_canceled", "workspace_recovered"]) {
      const row = deliveryTable.rows.find((candidate) => candidate.cells.join(" | ").includes(`\`${event}\``));
      if (!row) {
        findings.push({
          file: doc.path,
          line: section.startLine,
          anchor: section.heading.anchor,
          matched_text: event,
          message: `§10.14.7 delivery table is missing ${event}.`,
        });
        continue;
      }
      const joined = row.cells.join(" | ");
      for (const required of ["§31", "Appendix F", "event_id"]) {
        if (!joined.includes(required) && event !== "workspace_recovered") {
          findings.push({
            file: doc.path,
            line: row.line,
            anchor: section.heading.anchor,
            matched_text: joined,
            message: `${event} delivery row must cite ${required}.`,
          });
        }
      }
      if (event === "workspace_recovered" && !joined.includes("Same §31 / Appendix F standard retry contract")) {
        findings.push({
          file: doc.path,
          line: row.line,
          anchor: section.heading.anchor,
          matched_text: joined,
          message: "workspace_recovered delivery row must inherit the §31 / Appendix F standard retry contract.",
        });
      }
    }

    if (/direct (?:one-off )?email broadcast/i.test(text) && !text.includes("no direct one-off email broadcast path is permitted") && !text.includes("Direct email broadcast from §10.14 is forbidden")) {
      findings.push({
        file: doc.path,
        line: section.startLine,
        anchor: section.heading.anchor,
        message: "§10.14 must forbid direct email broadcast outside the registered event pipeline.",
      });
    }

    return findings;
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
