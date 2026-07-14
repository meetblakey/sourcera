/**
 * CLI wrapper for §M.4.4.2 customer-surface-reachability cross-validation.
 *
 * Reads trigger-detector output and parsed `@appendix-m-internal-only:`
 * annotations, runs `cross_validation.ts`, writes a structured result, and
 * exits fail-closed on any rejection.
 */

import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  resultsToExitCode,
  runCrossValidator,
  type ConceptClass,
  type CrossValidationResult,
  type DetectedConcept,
  type ParsedOverrideAnnotation,
} from "./cross_validation.js";

interface Args {
  prId: number;
  commitSha: string;
  mergeBaseSha: string;
  postEditSpec: string;
  preEditSpecRef: string;
  detectedConcepts: string;
  overrideAnnotations: string;
  internalOnlyAllowlist: string;
  serializerLocks: string;
  anchorAliases: string;
  emitResult?: string;
}

function parseArgs(argv: string[]): Args {
  const out: Partial<Args> = {};
  for (let i = 0; i < argv.length; i++) {
    const key = argv[i]!;
    const value = argv[++i];
    switch (key) {
      case "--pr-id":
        out.prId = Number(value);
        break;
      case "--commit-sha":
        out.commitSha = value;
        break;
      case "--merge-base-sha":
        out.mergeBaseSha = value;
        break;
      case "--post-edit-spec":
        out.postEditSpec = value;
        break;
      case "--pre-edit-spec-ref":
        out.preEditSpecRef = value;
        break;
      case "--detected-concepts":
        out.detectedConcepts = value;
        break;
      case "--override-annotations":
        out.overrideAnnotations = value;
        break;
      case "--internal-only-allowlist":
        out.internalOnlyAllowlist = value;
        break;
      case "--serializer-locks":
        out.serializerLocks = value;
        break;
      case "--anchor-aliases":
        out.anchorAliases = value;
        break;
      case "--emit-result":
        out.emitResult = value;
        break;
      default:
        throw new Error(`unknown argument: ${key}`);
    }
  }

  const required: Array<keyof Args> = [
    "prId",
    "commitSha",
    "mergeBaseSha",
    "postEditSpec",
    "preEditSpecRef",
    "detectedConcepts",
    "overrideAnnotations",
    "internalOnlyAllowlist",
    "serializerLocks",
    "anchorAliases",
  ];
  for (const key of required) {
    if (out[key] === undefined || out[key] === "") {
      throw new Error(`missing required argument --${camelToKebab(key)}`);
    }
  }
  return out as Args;
}

function camelToKebab(s: string): string {
  return s.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);
}

function readJson(path: string): unknown {
  const text = readFileSync(resolve(path), "utf-8").trim();
  return text ? JSON.parse(text) : [];
}

function asArray(input: unknown, keys: string[]): unknown[] {
  if (Array.isArray(input)) return input;
  if (input && typeof input === "object") {
    for (const key of keys) {
      const value = (input as Record<string, unknown>)[key];
      if (Array.isArray(value)) return value;
    }
  }
  return [];
}

function normalizeDetected(input: unknown): DetectedConcept[] {
  return asArray(input, ["triggered_concepts", "detectedConcepts", "detected_concepts"]).map(
    (raw) => {
      const r = raw as Record<string, unknown>;
      return {
        conceptName: String(r.conceptName ?? r.concept_name ?? ""),
        conceptClass: String(r.conceptClass ?? r.concept_class ?? "") as ConceptClass,
        specAnchor: String(r.specAnchor ?? r.spec_anchor ?? r.anchor ?? ""),
        specLineNumber: Number(r.specLineNumber ?? r.spec_line_number ?? r.line ?? 0),
      };
    }
  ).filter((d) => d.conceptName && d.conceptClass && d.specAnchor);
}

function normalizeAnnotations(input: unknown): ParsedOverrideAnnotation[] {
  return asArray(input, ["override_annotations", "overrideAnnotations", "annotations"]).map(
    (raw) => {
      const r = raw as Record<string, unknown>;
      return {
        conceptClass: String(r.conceptClass ?? r.concept_class ?? "") as ConceptClass,
        conceptName: String(r.conceptName ?? r.concept_name ?? r.gate_id ?? ""),
        specAnchor: String(r.specAnchor ?? r.spec_anchor ?? r.anchor ?? ""),
        targetKey: String(r.targetKey ?? r.target_key ?? ""),
        rationale: String(r.rationale ?? ""),
        qualifiers: Array.isArray(r.qualifiers) ? r.qualifiers.map(String) : [],
        prDescriptionLineNumber: Number(
          r.prDescriptionLineNumber ?? r.pr_description_line_number ?? r.line ?? 0
        ),
      };
    }
  ).filter((a) => a.conceptClass && a.conceptName && a.specAnchor && a.targetKey);
}

function aggregateOutcome(results: CrossValidationResult[]): string {
  const firstRejected = results.find((r) => r.outcome !== "pass");
  return firstRejected?.outcome ?? "pass";
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const detected = normalizeDetected(readJson(args.detectedConcepts));
  const annotations = normalizeAnnotations(readJson(args.overrideAnnotations));
  const results = runCrossValidator(
    {
      prId: args.prId,
      commitSha: args.commitSha,
      postEditMasterSpecPath: args.postEditSpec,
      preEditMasterSpecPath: args.preEditSpecRef || args.mergeBaseSha,
      detectedConcepts: detected,
      overrideAnnotations: annotations,
    },
    {
      internalOnlyAllowlistPath: args.internalOnlyAllowlist,
      serializerLocksPath: args.serializerLocks,
      anchorAliasesPath: args.anchorAliases,
    }
  );
  const payload = {
    outcome: aggregateOutcome(results),
    result_count: results.length,
    rejected_count: results.filter((r) => r.outcome !== "pass").length,
    results,
  };
  const json = JSON.stringify(payload, null, 2);
  process.stdout.write(json + "\n");
  if (args.emitResult) writeFileSync(resolve(args.emitResult), json + "\n", "utf-8");
  process.exitCode = resultsToExitCode(results);
}

main();
