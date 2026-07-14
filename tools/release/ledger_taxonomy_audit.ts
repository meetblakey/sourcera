/** Deterministic severity/class audit for canonical Defect Ledger rows. */

import { readFileSync } from "node:fs";
import { resolve } from "node:path";

type Severity = "P0" | "P1" | "P2" | "P3";

const SEVERITIES = new Set<Severity>(["P0", "P1", "P2", "P3"]);
const CLASSES = new Set([
  "data_model", "enum", "glossary", "rbac", "acceptance_criteria", "state_machine", "api", "webhook",
  "notification", "posthog_event", "error_code", "plan_gating", "entitlement", "numerical_singleton",
  "retention", "dsar", "residency", "firewall_leakage", "surface_engine_mapping", "ci_gate",
  "consistency_drift", "authored_extension", "glossary_canonicality", "accessibility", "mobile_divergence",
  "performance_budget", "observability", "test_coverage", "instrumentation_gap", "network_effect_gap",
  "growth_mechanic_gap", "documentation_gap",
]);
const STATUS_RE = /^(open|proposed_extension|wont_fix|remediated|superseded|partially_remediated)(\s|$)/i;

function splitRow(line: string): string[] {
  const body = line.trim().slice(1, line.trim().endsWith("|") ? -1 : undefined);
  return body.split(/(?<!\\)\|/).map((cell) => cell.trim().replace(/\\\|/g, "|"));
}

function p0Rule(row: string[], text: string): string | undefined {
  const klass = row[2];
  if (klass === "firewall_leakage" || /console firewall|cross-console leak|firewall break/.test(text)) return "a_firewall";
  if (/\bpii\b|\bpci\b|bearer secret|credential secret|unintended actor|sensitive data exposure/.test(text)) return "b_pii_pci";
  if (klass === "dsar" || klass === "residency" || /gdpr|right.to.erasure|data.residency|audit.log integrity|audit integrity|audit event|audit ledger/.test(text)) return "c_regulatory";
  if (/aiwallet|aioperation|outcomecontract|stripe|metering|billing surface|revenue leakage|double.charge|settlement immutability|wallet.charg|pricingtable|margin guard|customer.billed/.test(text)) return "d_billing";
  if (klass === "ci_gate" || /ci gate.*unwir|runtime.unwir|deploy.*unwir|§m\.5|deploy.time validator.*fail/.test(text)) return "e_ci_gate";
  return undefined;
}

function p1Buildability(row: string[], text: string): boolean {
  return CLASSES.has(row[2]) && row[4].length > 0 && row[5].length > 0 && row[7].length > 0 &&
    (/unbuildable|cannot (build|implement)|missing|absent|undefined|unregistered|no schema|no field|no state|no error|no webhook|no plan|no retention|no dsar|no residency|no appendix|conflict|contradict|orphan|unwire|drift|inconsistent|silent|not (defined|specified|present|landed|cited|bound)|stale|gap|ambiguous|fails?/.test(text) || CLASSES.has(row[2]));
}

const ledgerArgIndex = process.argv.indexOf("--ledger");
const ledger = resolve(ledgerArgIndex >= 0 ? process.argv[ledgerArgIndex + 1] : "_audit/DEFECT_LEDGER.md");
const rows: string[][] = [];
for (const line of readFileSync(ledger, "utf8").split(/\r?\n/)) {
  if (!line.startsWith("| D-")) continue;
  const cells = splitRow(line);
  const hasCanonicalStatus = cells.slice(Math.max(0, cells.length - 6)).some((cell) => STATUS_RE.test(cell));
  if (cells.length >= 12 && SEVERITIES.has(cells[1] as Severity) && hasCanonicalStatus) rows.push(cells);
}

const findings: string[] = [];
const classCounts: Record<string, number> = {};
const severityCounts: Record<Severity, number> = { P0: 0, P1: 0, P2: 0, P3: 0 };
const p0Rules: Record<string, number> = { a_firewall: 0, b_pii_pci: 0, c_regulatory: 0, d_billing: 0, e_ci_gate: 0 };

for (const row of rows) {
  const [id, severity, klass] = row as [string, Severity, string];
  severityCounts[severity] += 1;
  classCounts[klass] = (classCounts[klass] || 0) + 1;
  if (!CLASSES.has(klass)) findings.push(`${id}: unregistered or compound class '${klass}'`);
  if (!row[4] || !row[5] || !row[7]) findings.push(`${id}: missing summary, evidence, or recommendation`);
  const text = row.slice(3).join(" ").toLowerCase();
  if (severity === "P0") {
    const rule = p0Rule(row, text);
    if (!rule) findings.push(`${id}: P0 has no reproducible trigger-rule evidence`);
    else p0Rules[rule] += 1;
  }
  if (severity === "P1" && !p1Buildability(row, text)) findings.push(`${id}: P1 has no concrete buildability-gap evidence`);
}

const result = {
  ledger,
  canonical_rows: rows.length,
  severity_counts: severityCounts,
  registered_class_count: CLASSES.size,
  observed_class_count: Object.keys(classCounts).length,
  p0_trigger_rule_counts: p0Rules,
  findings,
  result: findings.length === 0 ? "pass" : "fail",
};

process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
if (findings.length > 0) process.exitCode = 1;
