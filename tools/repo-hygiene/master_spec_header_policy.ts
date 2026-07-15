const CHANGELOG = /^# Changelog(?:\s+\{#changelog\})?\s*$/m;

const COPIED_COUNT_PATTERNS = [
  /\b\d[\d,]*\s+(?:open|blocked)\s+P[0-3]\b/i,
  /\b(?:open|blocked)\s+P[0-3]\s*(?::|=|is)?\s*\d[\d,]*\b/i,
  /\b\d[\d,]*\s+runtime rows?\b/i,
  /\bruntime rows?\s*(?::|=|is)?\s*\d[\d,]*\b/i,
  /\b\d[\d,]*\s+runtime_active\b/i,
  /\bruntime_active\s*(?::|=|is)?\s*\d[\d,]*\b/i,
  /\b\d[\d,]*(?:\s+[\w/-]+){0,3}\s+blockers?\b/i,
  /\bblockers?(?:\s+(?:count|total))?\s*(?::|=|is|are)?\s*\d[\d,]*\b/i,
];

function activeHeader(masterSpec: string): string {
  const changelog = masterSpec.search(CHANGELOG);
  return changelog === -1 ? masterSpec : masterSpec.slice(0, changelog);
}

export function masterSpecHeaderPolicyFindings(masterSpec: string): string[] {
  const header = activeHeader(masterSpec).replaceAll("`", "");
  const findings: string[] = [];
  if (COPIED_COUNT_PATTERNS.some((pattern) => pattern.test(header))) {
    findings.push("Master Spec active header copies volatile release counts");
  }
  const backlogIndexIsAuthority = header.split(/\r?\n/).some(
    (line) =>
      line.includes("_audit/V711_BACKLOG_INDEX.md") &&
      /\b(?:current|live)\b/i.test(line) &&
      /\b(?:authority|routing)\b/i.test(line),
  );
  if (backlogIndexIsAuthority) {
    findings.push(
      "Master Spec active header treats _audit/V711_BACKLOG_INDEX.md as current authority",
    );
  }
  return findings;
}
