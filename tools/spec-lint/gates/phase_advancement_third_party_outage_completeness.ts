/**
 * Gate: `phase_advancement_third_party_outage_completeness`
 *
 * Assertion: §10.16 defines pre-commit fail-closed dependencies, post-commit
 * retry-only dependencies, and deterministic Solo fallback behavior.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import { findSectionByAnchor, findSectionByTitle, parseTableAt } from "../lib/spec_loader.js";
import type { Finding, GateContext, SpecLintGate } from "../lib/types.js";

const ANCHOR = "10.16-phase-advancement-api";
const REQUIRED_TEXTS = [
  "Dependencies needed to authorize, validate, or commit that transaction fail closed before mutation.",
  "Dependencies used only for summaries, delivery, analytics, or downstream projection degrade after commit through durable retry paths.",
  "phase_advancement_dependency_unavailable",
  "error.details.dependency",
  "no Workspace mutation, AuditEvent, webhook, Console Bridge Event, PostHog event, or Loops notification is written",
  "Phase advancement MUST NOT make a live Stripe call in the hot path.",
  "Anthropic unavailability MUST NOT block Solo soft-gate advancement.",
  "warnings[].summary_source = \"deterministic_fallback\"",
  "Bridge apply / downstream backlog after commit MUST NOT roll back the buyer Workspace phase",
  "Failed delivery retries from the durable outbox using §31 / Appendix F / Appendix G semantics",
];

const REQUIRED_DEPENDENCIES = [
  "Convex",
  "WorkOS / auth scope verification",
  "Stripe / billing snapshot",
  "Anthropic / Maya summary",
  "Console Bridge",
  "Webhooks, PostHog, Loops",
];

export const gate: SpecLintGate = {
  id: "phase_advancement_third_party_outage_completeness",
  sourcePhase: "4.2",
  rowClass: "spec_tree_lint",
  executionContext: "pr_lint",
  overridePath: "not_permitted",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    const doc = ctx.masterSpec;
    const section = findSectionByAnchor(doc, ANCHOR);
    if (!section) {
      return [{
        file: doc.path,
        line: 0,
        anchor: ANCHOR,
        message: "§10.16 Phase Advancement API section is missing.",
      }];
    }

    const text = doc.lines.slice(section.startLine, section.endLine + 1).join("\n");
    const findings: Finding[] = [];
    for (const required of REQUIRED_TEXTS) {
      if (!text.includes(required)) {
        findings.push({
          file: doc.path,
          line: section.startLine,
          anchor: ANCHOR,
          matched_text: required,
          message: `§10.16 outage contract is missing required binding: ${required}`,
        });
      }
    }

    const outageSection = findSectionByTitle(doc, /^10\.16\.7\b/);
    if (!outageSection) {
      findings.push({
        file: doc.path,
        line: section.startLine,
        anchor: ANCHOR,
        message: "§10.16.7 outage-handling subsection is missing.",
      });
      return findings;
    }

    const dependencyTable = parseTableAt(doc, outageSection.startLine, outageSection.endLine);
    const present = new Set(dependencyTable.rows.map((row) => row.cells[0]));
    for (const dependency of REQUIRED_DEPENDENCIES) {
      if (!present.has(dependency)) {
        findings.push({
          file: doc.path,
          line: section.startLine,
          anchor: ANCHOR,
          matched_text: dependency,
          message: `§10.16.7 dependency matrix is missing row: ${dependency}`,
        });
      }
    }

    return findings;
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
