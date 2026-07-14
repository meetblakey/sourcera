import { findSectionByAnchor, parseTableAt } from "../lib/spec_loader.js";
import type { Finding, SpecDoc } from "../lib/types.js";

export function backtickTokens(s: string): string[] {
  return [...s.matchAll(/`([^`]+)`/g)].map((m) => m[1]);
}

export function consoleBridgeEventKindTokens(doc: SpecDoc): Array<{ token: string; line: number; source: string }> {
  const out: Array<{ token: string; line: number; source: string }> = [];
  const section = findSectionByAnchor(doc, "4.7.1-console-bridge-event");
  if (section) {
    const table = parseTableAt(doc, section.startLine, section.endLine);
    const row = table.rows.find((r) => (r.cells[0] ?? "").trim() === "`event_kind`");
    if (row) {
      for (const token of backtickTokens(row.cells[2] ?? "")) {
        if (token !== "event_kind" && token !== "console_bridge_event_kind") {
          out.push({ token, line: row.line, source: "§4.7.1" });
        }
      }
    }
  }

  const appendixLine = doc.lines.findIndex((line) => line.includes("**`console_bridge_event_kind`**"));
  if (appendixLine > 0) {
    const valueList = (doc.lines[appendixLine] ?? "").split("(19 values)")[0] ?? "";
    for (const token of backtickTokens(valueList)) {
      if (token !== "console_bridge_event_kind") {
        out.push({ token, line: appendixLine, source: "Appendix J" });
      }
    }
  }
  return out;
}

export function missingBridgeKindSourceFindings(doc: SpecDoc, gateLabel: string): Finding[] {
  const section = findSectionByAnchor(doc, "4.7.1-console-bridge-event");
  const appendixLine = doc.lines.findIndex((line) => line.includes("**`console_bridge_event_kind`**"));
  const findings: Finding[] = [];
  if (!section) {
    findings.push({
      file: doc.path,
      line: 0,
      anchor: "4.7.1-console-bridge-event",
      message: `${gateLabel}: §4.7.1 Console Bridge Event section is missing.`,
    });
  }
  if (appendixLine <= 0) {
    findings.push({
      file: doc.path,
      line: 0,
      anchor: "appendix-j-controlled-vocabulary-registry",
      message: `${gateLabel}: Appendix J console_bridge_event_kind registration is missing.`,
    });
  }
  return findings;
}
