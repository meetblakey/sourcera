import { anchorForLine, fenceMask, findSectionByAnchor } from "../lib/spec_loader.js";
import type { Finding, SpecDoc } from "../lib/types.js";

interface ScanScope {
  label: string;
  anchor: string;
}

const SCOPES: ScanScope[] = [
  { label: "§5.11 Feature Access Matrix", anchor: "5.11-feature-access-matrix-(comprehensive)" },
  { label: "§34 Plan Tiers, Billing & Entitlements", anchor: "34.-plan-tiers-billing-and-entitlements" },
  { label: "§39 Object Size Constraints", anchor: "39.-object-size-constraints" },
  { label: "Appendix M.1 Surface/Engine Mapping", anchor: "appendix-m-surface-engine-mapping" },
];

const STALE_DISPLAY_LIST_PATTERNS: Array<{ label: string; re: RegExp }> = [
  {
    label: "Free / Starter / Growth / Scale / Enterprise",
    re: /\bFree\s*\/\s*Starter\s*\/\s*Growth\s*\/\s*Scale\s*\/\s*Enterprise\b/i,
  },
  {
    label: "Starter / Growth / Scale / Enterprise",
    re: /\bStarter\s*\/\s*Growth\s*\/\s*Scale\s*\/\s*Enterprise\b/i,
  },
  {
    label: "Free, Starter, Growth, Scale, Enterprise",
    re: /\bFree\s*,\s*Starter\s*,\s*Growth\s*,\s*Scale\s*,\s*Enterprise\b/i,
  },
  {
    label: "Starter, Growth, Scale, Enterprise",
    re: /\bStarter\s*,\s*Growth\s*,\s*Scale\s*,\s*Enterprise\b/i,
  },
  {
    label: "Business Starter, Growth, Scale, Enterprise",
    re: /\bBusiness Starter\s*,\s*Growth\s*,\s*Scale\s*,\s*Enterprise\b/i,
  },
  {
    label: "Seller Starter, Growth, Scale, Enterprise",
    re: /\bSeller Starter\s*,\s*Growth\s*,\s*Scale\s*,\s*Enterprise\b/i,
  },
];

const REQUIRED_RESOLVER_SIGNALS = [
  "Plan-Tier Overlay Resolver",
  "buyer_solo",
  "seller_solo",
  "§34.1.1",
  "§34.1.2",
  "Inline-string retirement",
];

function trimMatch(line: string, label: string): string {
  const idx = line.toLowerCase().indexOf(label.toLowerCase().split(/[,/]/)[0].trim());
  const start = Math.max(0, idx < 0 ? 0 : idx - 60);
  return line.slice(start, start + 220).trim();
}

function hasSoloSignal(line: string): boolean {
  return /\bSolo\b|buyer_solo|seller_solo/i.test(line);
}

function isAppendixM1Line(doc: SpecDoc, line: number): boolean {
  const section = findSectionByAnchor(doc, "appendix-m-surface-engine-mapping");
  const m1 = doc.lines.findIndex((candidate) =>
    /^### M\.1 Master Surface\/Engine Mapping Table/.test(candidate),
  );
  const m4 = doc.lines.findIndex((candidate) => /^### M\.4 CI Gate/.test(candidate));
  if (!section || m1 < 0) return false;
  const end = m4 > m1 ? m4 - 1 : section.endLine;
  return line >= m1 && line <= end;
}

export function planTierInlineFindings(doc: SpecDoc, gateLabel: string): Finding[] {
  const findings: Finding[] = [];
  const mask = fenceMask(doc);
  const resolver = findSectionByAnchor(doc, "5.11.4-plan-tier-overlay-resolver-min-tier-and-solo-closeout");
  if (!resolver) {
    findings.push({
      file: doc.path,
      line: 0,
      message: "parse_error: §5.11.4 Plan-Tier Overlay Resolver not found.",
    });
  } else {
    const resolverText = doc.lines.slice(resolver.startLine, resolver.endLine + 1).join("\n");
    for (const signal of REQUIRED_RESOLVER_SIGNALS) {
      if (!resolverText.includes(signal)) {
        findings.push({
          file: doc.path,
          line: resolver.startLine,
          anchor: resolver.heading.anchor,
          matched_text: signal,
          message: `${gateLabel}: §5.11.4 is missing required plan-tier overlay signal "${signal}".`,
        });
      }
    }
  }

  for (const scope of SCOPES) {
    const section = findSectionByAnchor(doc, scope.anchor);
    if (!section) {
      findings.push({
        file: doc.path,
        line: 0,
        matched_text: scope.label,
        message: `parse_error: ${scope.label} section not found.`,
      });
      continue;
    }

    for (let lineNo = section.startLine; lineNo <= section.endLine; lineNo++) {
      if (mask[lineNo]) continue;
      if (scope.anchor === "appendix-m-surface-engine-mapping" && !isAppendixM1Line(doc, lineNo)) continue;
      const line = doc.lines[lineNo];
      for (const pattern of STALE_DISPLAY_LIST_PATTERNS) {
        if (!pattern.re.test(line)) continue;
        if (hasSoloSignal(line)) continue;
        findings.push({
          file: doc.path,
          line: lineNo,
          anchor: anchorForLine(doc, lineNo),
          matched_text: trimMatch(line, pattern.label),
          message: `${gateLabel}: inline plan-tier list omits Solo; use Appendix J enum values or an explicit Free / Solo / Starter / Growth / Scale / Enterprise list with §34.1.1 / §34.1.2 authority.`,
        });
      }
    }
  }

  return findings;
}
