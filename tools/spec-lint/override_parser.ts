#!/usr/bin/env node
/** §M.4.4.1 parser for uniquely keyed Appendix M internal-only overrides. */

import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type { ConceptClass, DetectedConcept, ParsedOverrideAnnotation } from "./cross_validation.js";

const CONCEPT_CLASSES = new Set<ConceptClass>([
  "entity", "entity_field", "aioperation", "capability_non_ai", "enum_value", "state_machine_state",
  "plan_tier_feature", "webhook_event", "notification_event", "posthog_event", "api_endpoint", "named_ci_gate",
]);
const QUALIFIER_REQUIRED = new Set<ConceptClass>([
  "entity_field", "enum_value", "webhook_event", "notification_event", "posthog_event", "api_endpoint", "named_ci_gate",
]);
const QUALIFIERS = [
  "not_in_pricing_api", "not_in_seller_serializer", "not_in_buyer_serializer",
  "not_in_marketplace_serializer", "not_in_webhook_payload", "not_in_email_template", "not_in_posthog_payload",
] as const;

export interface OverrideGrammarFailure {
  code: "invalid_override_rationale" | "multiple_override_same_target_key";
  line: number;
  targetKey?: string;
  message: string;
}

export interface OverrideParseResult {
  outcome: "pass" | "invalid_override_rationale";
  annotations: ParsedOverrideAnnotation[];
  failures: OverrideGrammarFailure[];
}

export function parseOverrideAnnotations(body: string, _detected: DetectedConcept[] = []): OverrideParseResult {
  const annotations: ParsedOverrideAnnotation[] = [];
  const failures: OverrideGrammarFailure[] = [];
  const grammar = /^@appendix-m-internal-only:\s+([a-z_]+)::([A-Za-z0-9._-]+)@(#[A-Za-z0-9._-]+|[A-Za-z0-9._-]+)\s+—\s+(.+)$/;
  const seen = new Map<string, number>();

  body.split(/\r?\n/).forEach((line, index) => {
    if (!line.includes("@appendix-m-internal-only")) return;
    const match = grammar.exec(line.trim());
    if (!match) {
      failures.push({ code: "invalid_override_rationale", line: index + 1, message: "annotation does not match the canonical prefix, target key, em-dash, and rationale grammar" });
      return;
    }
    const conceptClass = match[1] as ConceptClass;
    const conceptName = match[2]!;
    const specAnchor = match[3]!.startsWith("#") ? match[3]! : `#${match[3]!}`;
    const rationale = match[4]!.trim();
    const targetKey = `${conceptClass}::${conceptName}@${specAnchor}`;
    const errors: string[] = [];
    const qualifiers = QUALIFIERS.filter((qualifier) => rationale.includes(qualifier));
    if (!CONCEPT_CLASSES.has(conceptClass)) errors.push(`unknown concept class ${conceptClass}`);
    if (!rationale.includes("internal-only construct, not surfaced")) errors.push("missing exact internal-only construct, not surfaced substring");
    if (rationale.length < 60) errors.push("rationale must be at least 60 characters");
    if (QUALIFIER_REQUIRED.has(conceptClass) && qualifiers.length === 0) errors.push("at least one cross-class qualifier is required");
    if (seen.has(targetKey)) {
      errors.push("duplicate target key");
      failures.push({
        code: "multiple_override_same_target_key",
        line: index + 1,
        targetKey,
        message: `target key duplicates line ${seen.get(targetKey)}`,
      });
    } else {
      seen.set(targetKey, index + 1);
    }
    if (errors.length) {
      failures.push({ code: "invalid_override_rationale", line: index + 1, targetKey, message: errors.join("; ") });
      return;
    }
    annotations.push({
      conceptClass,
      conceptName,
      specAnchor,
      targetKey,
      rationale,
      qualifiers: [...qualifiers],
      prDescriptionLineNumber: index + 1,
    });
  });

  const duplicateKeys = new Set(failures.filter((item) => item.code === "multiple_override_same_target_key").map((item) => item.targetKey));
  const uniqueAnnotations = annotations.filter((item) => !duplicateKeys.has(item.targetKey));
  return {
    outcome: failures.length ? "invalid_override_rationale" : "pass",
    annotations: uniqueAnnotations,
    failures,
  };
}

function arg(name: string): string | undefined {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

function readJson(path: string | undefined): unknown {
  if (!path) return [];
  return JSON.parse(readFileSync(resolve(path), "utf-8"));
}

function detectedFrom(input: unknown): DetectedConcept[] {
  const rows = Array.isArray(input) ? input : (input as { triggered_concepts?: unknown[] })?.triggered_concepts ?? [];
  return rows as DetectedConcept[];
}

function main(): void {
  const descriptionPath = arg("--pr-description");
  if (!descriptionPath) throw new Error("missing --pr-description");
  const body = readFileSync(resolve(descriptionPath), "utf-8");
  const result = parseOverrideAnnotations(body, detectedFrom(readJson(arg("--triggered-concepts"))));
  const parsed = `${JSON.stringify({ outcome: result.outcome, override_annotations: result.annotations }, null, 2)}\n`;
  const failures = `${JSON.stringify({ outcome: result.outcome, failures: result.failures }, null, 2)}\n`;
  const emitParsed = arg("--emit-parsed-annotations");
  const emitFailures = arg("--emit-grammar-failures");
  if (emitParsed) writeFileSync(resolve(emitParsed), parsed, "utf-8");
  if (emitFailures) writeFileSync(resolve(emitFailures), failures, "utf-8");
  process.stdout.write(parsed);
  process.exitCode = result.failures.length ? 1 : 0;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) main();
