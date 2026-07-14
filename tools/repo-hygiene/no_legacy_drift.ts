import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const root = execFileSync("git", ["rev-parse", "--show-toplevel"], {
  encoding: "utf8",
}).trim();

const failures: string[] = [];

function repoPath(path: string): string {
  return join(root, path);
}

function walk(path: string): string[] {
  if (!existsSync(path)) return [];
  return readdirSync(path, { withFileTypes: true }).flatMap((entry) => {
    const child = join(path, entry.name);
    return entry.isDirectory() ? walk(child) : [relative(root, child)];
  });
}

const listed = execFileSync(
  "git",
  ["ls-files", "-z", "--cached", "--others", "--exclude-standard"],
  { cwd: root, encoding: "utf8" },
)
  .split("\0")
  .filter(Boolean)
  .filter((path) => existsSync(repoPath(path)) && statSync(repoPath(path)).isFile());

for (const path of listed) {
  if (path.startsWith("_versions/")) failures.push(`legacy snapshot tracked: ${path}`);
  if (path.startsWith("_audit/_tmp/")) failures.push(`temporary audit output tracked: ${path}`);
  if (path.endsWith(".bak") || path.endsWith(".orig")) failures.push(`backup copy tracked: ${path}`);
}

const expectedBaselines = [
  "_baselines/README.md",
  "_baselines/Sourcera_Master_Spec_v6.0.0.md",
  "_baselines/Sourcera_Master_Spec.v7.0.0-pre-v7.1-2026-04-26.md",
  "_baselines/Sourcera_Master_Spec.v7.1.0a-pre-stamp-2026-05-20.md",
  "_baselines/retired-sources/KB_Engineering_Spec_retired_2026-04-26.md",
  "_baselines/retired-sources/Sourcera_Master_Summary_v1.1_retired_2026-04-26.md",
].sort();

const actualBaselines = walk(repoPath("_baselines")).sort();
if (JSON.stringify(actualBaselines) !== JSON.stringify(expectedBaselines)) {
  failures.push("_baselines contents changed; update the explicit immutable set only by review");
}

const requiredCurrentFiles = [
  "AGENTS.md",
  "Audit_Prompts.md",
  "Sourcera_Master_Spec.md",
  "_audit/DEFECT_LEDGER.md",
  "_audit/V711_RUNTIME_STAMP_GATE_BLOCKER_INVENTORY.md",
  "_audit/V711_RUNTIME_STAMP_GATE_BLOCKER_INVENTORY.csv",
  "_audit/V711_PRODUCTION_GRADE_RUNTIME_CLOSURE_PLAN_2026-07-13.md",
  "_audit/V711_PRODUCTION_GRADE_RUNTIME_EXECUTION_MATRIX_2026-07-13.csv",
  "_integration/AUTHORED_EXTENSIONS_LEDGER.md",
];

for (const path of requiredCurrentFiles) {
  if (!existsSync(repoPath(path))) failures.push(`required current file missing: ${path}`);
}

for (const path of ["KB_Engineering_Spec.md", "Sourcera_Master_Summary.md", "What_is_Sourcera.md"]) {
  if (existsSync(repoPath(path))) failures.push(`retired source returned to active root: ${path}`);
}

const claude = readFileSync(repoPath("CLAUDE.md"), "utf8");
if (!claude.includes("AGENTS.md` is the sole current repository instruction source")) {
  failures.push("CLAUDE.md became an independent instruction source");
}

const integrationAudit = readFileSync(repoPath("_integration/Audit_Prompts.md"), "utf8");
if (!integrationAudit.includes("sole current audit program")) {
  failures.push("_integration/Audit_Prompts.md became a second live audit program");
}

const stateFreeFiles = [
  "AGENTS.md",
  "CLAUDE.md",
  "_audit/AUDIT_README.md",
  "_audit/V711_BACKLOG_INDEX.md",
  "_audit/REMEDIATION_BACKLOG.md",
];

const copiedState = /\b\d+[\s,]+(?:open P[0-3]|runtime rows?|runtime_active|blockers?)\b/i;
for (const path of stateFreeFiles) {
  const text = readFileSync(repoPath(path), "utf8");
  if (copiedState.test(text)) failures.push(`copied live count found in routing file: ${path}`);
}

if (failures.length > 0) {
  console.error("Repository hygiene failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Repository hygiene passed: no legacy snapshots, backup copies, temp evidence, or copied live counts.");
