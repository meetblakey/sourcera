/**
 * Sourcera Spec-Lint Harness — override-annotation grammar parser.
 *
 * Authority anchor: Sourcera_Master_Spec.md §M.4.4.1 (`@appendix-m-internal-only:`
 * grammar), §M.4.4.5 (`@ci-gate-override:` sibling grammar), §M.5.2 (override
 * classes). Implements the rationale-floor + unknown-gate + not-permitted
 * checks so a detector can honor (or reject) an override declared in the PR
 * body. Pure; no network.
 *
 * Grammar (§M.4.4.5 ¶1–¶3):
 *   @ci-gate-override: <gate_id> — <rationale (>= 60 chars)>
 *     [coupled_with:<gate_id>] [requires_audit_event:<event_kind>]
 *
 * The em-dash (—) OR a double-hyphen (--) OR a single hyphen surrounded by
 * spaces ( - ) is accepted as the gate-id / rationale separator, matching the
 * authored examples across the §M.5 catalog.
 */

import type { ParsedOverride, OverridePath } from "./types.js";
import { OVERRIDE_RATIONALE_MIN_CHARS } from "./types.js";

const OVERRIDE_LINE_RE =
  /@ci-gate-override:\s*([a-z0-9_]+)\s*(?:—|--|\s-\s)\s*(.+)$/;
const INTERNAL_ONLY_RE =
  /@appendix-m-internal-only:\s*([a-z_]+)::([A-Za-z0-9_.-]+)@(#?[A-Za-z0-9_.-]+)\s*(?:—|--|\s-\s)\s*(.+)$/;

const QUALIFIER_RE = /\b(not_in_[a-z0-9_]+|coupled_with:[a-z0-9_]+|requires_audit_event:[a-z0-9_.]+)\b/g;

/**
 * Parse every `@ci-gate-override:` annotation in the PR body into a map keyed
 * by gate id. `knownGateIds` is the set of valid §M.5 catalog gate ids; an
 * override naming an unknown gate is flagged `override_unknown_gate`.
 * `notPermittedGates` lists gate ids whose Override path forbids overrides.
 */
export function parseOverrides(
  prBody: string,
  opts: {
    knownGateIds?: Set<string>;
    notPermittedGates?: Set<string>;
  } = {},
): Map<string, ParsedOverride> {
  const result = new Map<string, ParsedOverride>();
  if (!prBody) return result;
  const lines = prBody.split(/\r?\n/);
  for (const line of lines) {
    const m = OVERRIDE_LINE_RE.exec(line.trim());
    if (!m) continue;
    const gate_id = m[1];
    const rationale = m[2].trim();
    const qualifiers = (rationale.match(QUALIFIER_RE) ?? []).slice();

    let grammar_error: ParsedOverride["grammar_error"];
    if (opts.notPermittedGates?.has(gate_id)) {
      grammar_error = "ci_gate_override_not_permitted";
    } else if (opts.knownGateIds && !opts.knownGateIds.has(gate_id)) {
      grammar_error = "override_unknown_gate";
    } else if (stripQualifiers(rationale).length < OVERRIDE_RATIONALE_MIN_CHARS) {
      grammar_error = "override_rationale_too_short";
    }

    result.set(gate_id, { gate_id, rationale, qualifiers, grammar_error });
  }
  return result;
}

/** Parse `@appendix-m-internal-only:` annotations (§M.4.4.1). */
export function parseInternalOnly(prBody: string): Map<string, ParsedOverride> {
  const result = new Map<string, ParsedOverride>();
  if (!prBody) return result;
  for (const line of prBody.split(/\r?\n/)) {
    const m = INTERNAL_ONLY_RE.exec(line.trim());
    if (!m) continue;
    const target = `${m[1]}::${m[2]}@${m[3]}`;
    const rationale = m[4].trim();
    result.set(target, {
      gate_id: target,
      rationale,
      qualifiers: [],
      grammar_error:
        stripQualifiers(rationale).length < OVERRIDE_RATIONALE_MIN_CHARS
          ? "override_rationale_too_short"
          : undefined,
    });
  }
  return result;
}

/** Rationale length is measured AFTER stripping trailing machine qualifiers. */
function stripQualifiers(rationale: string): string {
  return rationale.replace(QUALIFIER_RE, "").trim();
}

/**
 * True if `overridePath` admits a `@ci-gate-override:` annotation at all.
 * Every `not_permitted*` class is a hard gate.
 */
export function admitsOverride(overridePath: OverridePath): boolean {
  return (
    overridePath === "default_ci_gate_override" ||
    overridePath === "appendix_m_internal_only"
  );
}
