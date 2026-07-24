import type { Disposition, SourceRequirement } from "./model.js";

export interface LinearDispositionOverride {
  requirementId: string;
  disposition: Exclude<Disposition, "executable">;
  replacementId?: string;
  rationale: string;
}

export interface LinearDispositionDocument {
  overrides: LinearDispositionOverride[];
}

const REQUIREMENT_ID = /^(?:F-(?:AE-|BC-)?\d+(?:\.[A-Z])?|RG:[a-z0-9_]+)$/;
const DISPOSITIONS = new Set<Disposition>([
  "proof_only",
  "narrative_context",
  "superseded",
  "retired_source",
]);

function exactKeys(
  value: unknown,
  expected: readonly string[],
  label: string,
): asserts value is Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${label} must be an object`);
  }
  const actual = Object.keys(value).sort();
  if (JSON.stringify(actual) !== JSON.stringify([...expected].sort())) {
    throw new Error(`${label} has a noncanonical shape`);
  }
}

export function parseLinearDispositions(
  value: unknown,
  requirements: readonly SourceRequirement[],
): LinearDispositionDocument {
  exactKeys(value, ["overrides"], "Linear disposition document");
  if (!Array.isArray(value.overrides)) {
    throw new Error("Linear disposition overrides must be an array");
  }
  const requirementIds = new Set(
    requirements.map((requirement) => requirement.requirementId),
  );
  const seen = new Set<string>();
  const overrides = value.overrides.map((raw, index) => {
    const hasReplacement = Boolean(
      raw && typeof raw === "object" && Object.hasOwn(raw, "replacementId"),
    );
    exactKeys(
      raw,
      [
        "requirementId",
        "disposition",
        ...(hasReplacement ? ["replacementId"] : []),
        "rationale",
      ],
      `Linear disposition override ${index + 1}`,
    );
    const requirementId = raw.requirementId;
    const disposition = raw.disposition;
    const rationale = raw.rationale;
    const replacementId = raw.replacementId;
    if (
      typeof requirementId !== "string" ||
      !REQUIREMENT_ID.test(requirementId) ||
      !requirementIds.has(requirementId) ||
      seen.has(requirementId) ||
      typeof disposition !== "string" ||
      !DISPOSITIONS.has(disposition as Disposition) ||
      typeof rationale !== "string" ||
      rationale.trim().length < 20
    ) {
      throw new Error(`Linear disposition override ${requirementId || index + 1} is invalid`);
    }
    if (
      disposition === "narrative_context"
        ? replacementId !== undefined
        : typeof replacementId !== "string" || !REQUIREMENT_ID.test(replacementId)
    ) {
      throw new Error(`Linear disposition override ${requirementId} replacement is invalid`);
    }
    seen.add(requirementId);
    return {
      requirementId,
      disposition: disposition as LinearDispositionOverride["disposition"],
      ...(typeof replacementId === "string" ? { replacementId } : {}),
      rationale,
    };
  });
  return { overrides };
}

export function applyLinearDispositions(
  requirements: readonly SourceRequirement[],
  document: LinearDispositionDocument,
): SourceRequirement[] {
  const byId = new Map(
    document.overrides.map((override) => [override.requirementId, override]),
  );
  return requirements.map((requirement) => {
    const override = byId.get(requirement.requirementId);
    return {
      ...requirement,
      disposition: override?.disposition ?? requirement.disposition,
      ...(override?.replacementId
        ? { replacementId: override.replacementId }
        : {}),
    };
  });
}
