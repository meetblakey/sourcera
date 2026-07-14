import { anchorForLine, findSectionByAnchor, findSectionByTitle, parseTableAt } from "../lib/spec_loader.js";
import type { Finding, SpecDoc } from "../lib/types.js";

export interface SectionText {
  text: string;
  startLine: number;
  endLine: number;
}

export interface EntitlementMatrixRow {
  capabilityId: string;
  enforcementMode: string;
  freeAllowanceOps: string;
  buyerPlanMinimum: string;
  sellerPlanMinimum: string;
  upgradeSurface: string;
  line: number;
}

export function push(findings: Finding[], doc: SpecDoc, line: number, matched: string, message: string) {
  findings.push({
    file: doc.path,
    line,
    anchor: anchorForLine(doc, line),
    matched_text: matched,
    message,
  });
}

export function cleanCell(cell: string | undefined): string {
  return (cell ?? "")
    .replace(/\\_/g, "_")
    .replace(/`/g, "")
    .replace(/\*\*/g, "")
    .trim();
}

export function sectionTextByTitle(doc: SpecDoc, title: string | RegExp): SectionText | null {
  const section = findSectionByTitle(doc, title);
  if (!section) return null;
  return {
    text: doc.lines.slice(section.startLine, section.endLine + 1).join("\n"),
    startLine: section.startLine,
    endLine: section.endLine,
  };
}

export function sectionTextByAnchor(doc: SpecDoc, anchor: string): SectionText | null {
  const section = findSectionByAnchor(doc, anchor);
  if (!section) return null;
  return {
    text: doc.lines.slice(section.startLine, section.endLine + 1).join("\n"),
    startLine: section.startLine,
    endLine: section.endLine,
  };
}

export function findLine(doc: SpecDoc, predicate: (line: string) => boolean): { text: string; line: number } | null {
  for (let line = 1; line < doc.lines.length; line++) {
    const text = doc.lines[line] ?? "";
    if (predicate(text)) return { text, line };
  }
  return null;
}

export function entitlementMatrixRows(doc: SpecDoc, findings: Finding[]): EntitlementMatrixRow[] {
  const section = findSectionByTitle(doc, /^34\.8\.5 Entitlement Matrix/);
  if (!section) {
    push(findings, doc, 0, "34.8.5 Entitlement Matrix", "§34.8.5 Entitlement Matrix section is missing.");
    return [];
  }

  const table = parseTableAt(doc, section.startLine, section.endLine);
  if (!table.header) {
    push(findings, doc, section.startLine, "Entitlement Matrix", "§34.8.5 Entitlement Matrix table is missing.");
    return [];
  }

  const header = table.header.cells.map(cleanCell);
  const required = ["capability_id", "enforcement_mode", "free_allowance_ops", "Buyer plan minimum", "Seller plan minimum", "upgrade_surface"];
  for (const token of required) {
    if (!header.includes(token)) {
      push(findings, doc, table.header.line, token, `§34.8.5 Entitlement Matrix header is missing required column: ${token}`);
    }
  }

  return table.rows
    .map((row) => ({
      capabilityId: cleanCell(row.cells[0]),
      enforcementMode: cleanCell(row.cells[1]),
      freeAllowanceOps: cleanCell(row.cells[2]),
      buyerPlanMinimum: cleanCell(row.cells[3]),
      sellerPlanMinimum: cleanCell(row.cells[4]),
      upgradeSurface: cleanCell(row.cells[5]),
      line: row.line,
    }))
    .filter((row) => row.capabilityId.length > 0 && row.enforcementMode.length > 0);
}

export function appendixJEnumValues(doc: SpecDoc, title: string | RegExp, findings: Finding[], label: string): Set<string> {
  const section = sectionTextByTitle(doc, title);
  const values = new Set<string>();
  if (!section) {
    push(findings, doc, 0, label, `${label} Appendix J enum section is missing.`);
    return values;
  }
  for (let line = section.startLine + 1; line <= section.endLine; line++) {
    const text = doc.lines[line] ?? "";
    const matches = [...text.matchAll(/`([^`]+)`/g)].map((match) => match[1]);
    if (matches.length > 0) {
      for (const value of matches) values.add(value);
      return values;
    }
  }
  push(findings, doc, section.startLine, label, `${label} Appendix J enum section has no backtick-coded values.`);
  return values;
}

export function ctaRegistrySurfaces(doc: SpecDoc, findings: Finding[]): Set<string> {
  const section = findSectionByTitle(doc, /^34\.8\.5 Entitlement Matrix/);
  const surfaces = new Set<string>();
  if (!section) {
    push(findings, doc, 0, "CTA Copy Registry", "§34.8.5 CTA Copy Registry cannot be checked because §34.8.5 is missing.");
    return surfaces;
  }
  let markerLine = 0;
  for (let line = section.startLine; line <= section.endLine; line++) {
    if ((doc.lines[line] ?? "").includes("**CTA Copy Registry.")) {
      markerLine = line;
      break;
    }
  }
  if (!markerLine) {
    push(findings, doc, section.startLine, "CTA Copy Registry", "§34.8.5 CTA Copy Registry is missing.");
    return surfaces;
  }
  const table = parseTableAt(doc, markerLine + 1, section.endLine);
  if (!table.header) {
    push(findings, doc, markerLine, "CTA Copy Registry", "§34.8.5 CTA Copy Registry table is missing.");
    return surfaces;
  }
  for (const row of table.rows) {
    const surface = cleanCell(row.cells[0]);
    const copyId = cleanCell(row.cells[1]);
    if (surface) surfaces.add(surface);
    if (surface && !copyId.startsWith("entitlement.")) {
      push(findings, doc, row.line, copyId, `CTA Copy Registry row for ${surface} must resolve to a stable entitlement_cta_copy_id.`);
    }
  }
  return surfaces;
}

export function rateCardCapabilityIds(doc: SpecDoc, findings: Finding[]): Set<string> {
  const section = findSectionByTitle(doc, /^34\.3\.4 Summary Per-Capability Rate Card/);
  const ids = new Set<string>();
  if (!section) {
    push(findings, doc, 0, "34.3.4 Summary Per-Capability Rate Card", "§34.3.4 rate-card section is missing.");
    return ids;
  }
  const table = parseTableAt(doc, section.startLine, section.endLine);
  if (!table.header) {
    push(findings, doc, section.startLine, "Summary Per-Capability Rate Card", "§34.3.4 rate-card table is missing.");
    return ids;
  }
  for (const row of table.rows) {
    const capabilityId = cleanCell(row.cells[0]);
    if (capabilityId) ids.add(capabilityId);
  }
  return ids;
}

export function m5RuntimeActiveFindings(doc: SpecDoc, gateId: string): Finding[] {
  const findings: Finding[] = [];
  const row = findLine(doc, (line) => line.trim().startsWith(`| \`${gateId}\` |`));
  if (!row) {
    push(findings, doc, 0, gateId, `§M.5 row ${gateId} is missing.`);
    return findings;
  }
  const tokens = [
    "**`runtime_active`**",
    `tools/spec-lint/gates/${gateId}.ts`,
    "verified PASS on live Master Spec and pass/fail fixtures",
  ];
  for (const token of tokens) {
    if (!row.text.includes(token)) {
      push(findings, doc, row.line, token, `§M.5 ${gateId} row is missing required runtime-active token: ${token}`);
    }
  }
  return findings;
}
