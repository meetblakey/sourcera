/**
 * Gate: `appendix_j_deprecation_marker_coverage`
 * Source defect: D-AJ-018
 *
 * Assertion: every Appendix J enum group or value explicitly marked legacy,
 * deprecated, or retired records the final version in which it shipped.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import type { Finding, GateContext, SpecLintGate } from "../lib/types.js";
import { lineForToken, sectionText } from "./catalog_gate_helpers.js";

type Candidate = {
  kind: "heading" | "retired_value" | "retired_group";
  index: number;
  text: string;
};

function matches(text: string, regex: RegExp, kind: Candidate["kind"]): Candidate[] {
  return [...text.matchAll(regex)].map((match) => ({
    kind,
    index: match.index ?? 0,
    text: match[0],
  }));
}

function markerWindow(text: string, index: number): string {
  const tail = text.slice(index);
  const firstLineEnd = tail.indexOf("\n") + 1;
  const nextHeading = tail.slice(firstLineEnd).search(/^### /m);
  return nextHeading >= 0 ? tail.slice(0, firstLineEnd + nextHeading) : tail;
}

export const gate: SpecLintGate = {
  id: "appendix_j_deprecation_marker_coverage",
  sourcePhase: "v7.1.1 D-AJ-018 retirement-marker closure",
  rowClass: "meta_catalog_invariant",
  executionContext: "pr_lint",
  overridePath: "not_permitted_catalog_completeness",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    const doc = ctx.masterSpec;
    const appendixJ = sectionText(doc, "appendix-j-controlled-vocabulary-registry");
    const candidates = [
      ...matches(appendixJ, /^### .*\b(?:LEGACY|DEPRECATED|RETIRED)\b.*$/gim, "heading"),
      ...matches(appendixJ, /^\*\*Retired value:[^\n]+$/gim, "retired_value"),
      ...matches(appendixJ, /^- [^\n]*\*\*retired\*\*[^\n]*$/gim, "retired_group"),
    ];
    const findings: Finding[] = [];

    for (const candidate of candidates) {
      const window = markerWindow(appendixJ, candidate.index);
      if (candidate.kind === "retired_group") {
        const ids = [...candidate.text.matchAll(/`([^`]+)`/g)].map((match) => match[1]);
        for (const id of ids) {
          const marker = `**Final version shipped (\`${id}\`).**`;
          if (!window.includes(marker)) {
            findings.push({
              file: doc.path,
              line: lineForToken(doc, candidate.text),
              matched_text: id,
              message: `Retired Appendix J value ${id} is missing an explicit final-version-shipped marker.`,
            });
          }
        }
        continue;
      }

      if (!window.includes("**Final version shipped.**")) {
        const token = candidate.text.replace(/^###\s+/, "").slice(0, 120);
        findings.push({
          file: doc.path,
          line: lineForToken(doc, token),
          matched_text: candidate.text,
          message: "Legacy, deprecated, or retired Appendix J entry is missing an explicit final-version-shipped marker.",
        });
      }
    }

    return findings;
  },
};

if (isEntrypoint(import.meta.url)) {
  void runGateCli(gate);
}
