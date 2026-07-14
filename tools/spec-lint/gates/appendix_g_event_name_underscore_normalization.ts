/**
 * Gate: `appendix_g_event_name_underscore_normalization`
 *
 * Assertion: Appendix G PostHog `Event` cells and §48.7 `Telemetry Events`
 * tables are underscore-form identifiers. Dotted names remain allowed in
 * notification/webhook tables and property cells such as `source_webhook_event_type`.
 */

import type { Finding, GateContext, SpecLintGate } from "../lib/types.js";
import { anchorForLine, findSectionByTitle, splitUnescapedPipes } from "../lib/spec_loader.js";
import { isEntrypoint, runGateCli } from "../lib/gate.js";

const EVENT_NAME = /^[a-z0-9]+(?:_[a-z0-9]+)*$/;

function stripMd(s: string): string {
  return s.replace(/\*\*/g, "").replace(/`/g, "").trim();
}

function tableCells(raw: string): string[] {
  return splitUnescapedPipes(raw.trim().replace(/^\|/, "").replace(/\|$/, "")).map((c) => c.trim());
}

function isDelimiter(cells: string[]): boolean {
  return cells.every((c) => /^:?-{2,}:?$/.test(c) || c === "");
}

export const gate: SpecLintGate = {
  id: "appendix_g_event_name_underscore_normalization",
  sourcePhase: "M.5.64",
  rowClass: "spec_tree_lint",
  executionContext: "pr_lint",
  overridePath: "not_permitted",
  inputs: { masterSpec: true },
  version: "1.1.0",
  run(ctx: GateContext): Finding[] {
    const doc = ctx.masterSpec;
    const appendixG = findSectionByTitle(doc, /^Appendix G\b/);
    if (!appendixG) {
      return [{
        file: doc.path,
        line: 0,
        message: "parse_error: Appendix G section not found.",
      }];
    }

    const findings: Finding[] = [];
    let scanned = 0;
    let inEventTable = false;
    let eventIndex = -1;

    for (let line = appendixG.startLine + 1; line <= appendixG.endLine; line++) {
      const raw = doc.lines[line] ?? "";
      if (!/^\s*\|.*\|\s*$/.test(raw)) {
        inEventTable = false;
        eventIndex = -1;
        continue;
      }

      const cells = tableCells(raw);
      if (isDelimiter(cells)) continue;

      if (!inEventTable) {
        const headers = cells.map((c) => stripMd(c).toLowerCase());
        eventIndex = headers.findIndex((h) => h === "event");
        inEventTable = eventIndex >= 0;
        continue;
      }

      const eventName = stripMd(cells[eventIndex] ?? "");
      if (!eventName) continue;
      scanned++;
      if (eventName.includes(".") || !EVENT_NAME.test(eventName)) {
        findings.push({
          file: doc.path,
          line,
          anchor: anchorForLine(doc, line),
          matched_text: eventName,
          message: `Appendix G Event cell \`${eventName}\` must be an underscore-form PostHog event name with no dots.`,
        });
      }
    }

    if (scanned === 0) {
      findings.push({
        file: doc.path,
        line: appendixG.startLine,
        anchor: appendixG.heading.anchor,
        message: "parse_error: Appendix G event table parser scanned zero Event rows.",
      });
    }

    const section48_7 = findSectionByTitle(doc, /^48\.7\b/);
    if (!section48_7) {
      findings.push({
        file: doc.path,
        line: 0,
        message: "parse_error: §48.7 section not found.",
      });
      return findings;
    }

    let inTelemetrySubsection = false;
    let inTelemetryTable = false;
    let telemetryEventIndex = -1;
    let telemetryScanned = 0;

    for (let line = section48_7.startLine + 1; line <= section48_7.endLine; line++) {
      const raw = doc.lines[line] ?? "";
      const heading = raw.match(/^#{3,6}\s+(.+?)\s*$/);
      if (heading) {
        inTelemetrySubsection = /^Telemetry Events\s*$/.test(heading[1].replace(/\s*\{#[^}]+\}\s*$/, ""));
        inTelemetryTable = false;
        telemetryEventIndex = -1;
        continue;
      }

      if (!inTelemetrySubsection) continue;
      if (!/^\s*\|.*\|\s*$/.test(raw)) {
        if (inTelemetryTable) {
          inTelemetrySubsection = false;
          inTelemetryTable = false;
          telemetryEventIndex = -1;
        }
        continue;
      }

      const cells = tableCells(raw);
      if (isDelimiter(cells)) continue;
      if (!inTelemetryTable) {
        const headers = cells.map((c) => stripMd(c).toLowerCase());
        telemetryEventIndex = headers.findIndex((h) => h === "event");
        inTelemetryTable = telemetryEventIndex >= 0;
        continue;
      }

      const eventName = stripMd(cells[telemetryEventIndex] ?? "");
      if (!eventName) continue;
      telemetryScanned++;
      if (eventName.includes(".") || !EVENT_NAME.test(eventName)) {
        findings.push({
          file: doc.path,
          line,
          anchor: anchorForLine(doc, line),
          matched_text: eventName,
          message: `§48.7 Telemetry Event \`${eventName}\` must match the canonical underscore-form Appendix G name.`,
        });
      }
    }

    if (telemetryScanned === 0) {
      findings.push({
        file: doc.path,
        line: section48_7.startLine,
        anchor: section48_7.heading.anchor,
        message: "parse_error: §48.7 telemetry-table parser scanned zero Event rows.",
      });
    }

    return findings;
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
