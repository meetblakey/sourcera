const CHANGELOG = /^# Changelog(?:\s+\{#changelog\})?\s*$/m;

const NUMBER_WORD =
  "no|none|zero|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety|hundred|thousand|million";
const COUNT = String.raw`(?:\d[\d,]*|(?:${NUMBER_WORD})(?:[\s-]+(?:and\s+)?(?:${NUMBER_WORD}))*)`;
const COUNT_JOIN = String.raw`(?:\s+(?:is|are|remain|remains|at|currently|equals?|totals?)){0,4}\s*[:=]?\s*`;

const COPIED_COUNT_PATTERNS = [
  new RegExp(String.raw`\b${COUNT}\s+(?:open|blocked)\s+P[0-3]\b`, "i"),
  new RegExp(
    String.raw`\b(?:open|blocked)\s+P[0-3]${COUNT_JOIN}${COUNT}\b`,
    "i",
  ),
  new RegExp(String.raw`\b${COUNT}\s+runtime rows?\b`, "i"),
  new RegExp(
    String.raw`\b${COUNT}(?:\s+[\w/.-]+){0,3}\s+rows?\b`,
    "i",
  ),
  new RegExp(
    String.raw`\bruntime rows?${COUNT_JOIN}${COUNT}\b`,
    "i",
  ),
  new RegExp(String.raw`\brows?${COUNT_JOIN}${COUNT}\b`, "i"),
  new RegExp(String.raw`\b${COUNT}\s+runtime_active\b`, "i"),
  new RegExp(
    String.raw`\bruntime_active${COUNT_JOIN}${COUNT}\b`,
    "i",
  ),
  new RegExp(
    String.raw`\b${COUNT}(?:\s+[\w/-]+){0,3}\s+blockers?\b`,
    "i",
  ),
  new RegExp(
    String.raw`\bblockers?(?:\s+(?:count|total))?${COUNT_JOIN}${COUNT}\b`,
    "i",
  ),
  new RegExp(
    String.raw`\b${COUNT}\s+pending(?:\s+[A-Z0-9][\w.-]*){0,4}\s+rows?\b`,
    "i",
  ),
  new RegExp(
    String.raw`\bpending(?:\s+[A-Z0-9][\w.-]*){0,4}\s+rows?${COUNT_JOIN}${COUNT}\b`,
    "i",
  ),
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
      /\b(?:authority|routing|source[\s-]+of[\s-]+truth|canonical[\s-]+(?:source|record)|governs?|controls?)\b/i.test(
        line,
      ),
  );
  if (backlogIndexIsAuthority) {
    findings.push(
      "Master Spec active header treats _audit/V711_BACKLOG_INDEX.md as current authority",
    );
  }
  return findings;
}
