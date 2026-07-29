import { createHash } from "node:crypto";

export const LINEAR_AUTHORITY_REQUIREMENT_PUBLICATION_SCHEMA_VERSION = 1 as const;

export interface LinearAuthorityRequirementPublicationEntry {
  rank: number;
  legacyId: string;
  planKey: string;
}

export interface LinearAuthorityRequirementPublicationSequence {
  schemaVersion: 1;
  kind: "linear_authority_requirement_publication_sequence";
  entries: LinearAuthorityRequirementPublicationEntry[];
  publicationRoot: string;
  complete: true;
}

const DIGEST = /^[a-f0-9]{64}$/;
const LEGACY_ID = /^F-(?:(?:AE|BC)-)?\d{3}$/;

const sha256 = (value: string): string =>
  createHash("sha256").update(value, "utf8").digest("hex");

function fail(message: string): never {
  throw new Error(`Linear authority publication sequence: ${message}`);
}

function canonicalJson(value: unknown): string {
  if (value === null || typeof value !== "object") {
    const encoded = JSON.stringify(value);
    if (encoded === undefined) fail("payload contains an undefined value");
    return encoded;
  }
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  const row = value as Record<string, unknown>;
  return `{${Object.keys(row).sort().map((key) =>
    `${JSON.stringify(key)}:${canonicalJson(row[key])}`).join(",")}}`;
}

function exactKeys(value: unknown, expected: readonly string[], label: string): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) fail(`${label} must be an object`);
  const row = value as Record<string, unknown>;
  if (JSON.stringify(Object.keys(row).sort()) !== JSON.stringify([...expected].sort())) {
    fail(`${label} keys differ`);
  }
  return row;
}

function rowsRoot(entries: readonly LinearAuthorityRequirementPublicationEntry[]): string {
  return sha256(canonicalJson(entries));
}

export function buildLinearAuthorityRequirementPublicationSequence(
  publicationSequence: readonly string[],
): LinearAuthorityRequirementPublicationSequence {
  if (publicationSequence.length !== 926 || new Set(publicationSequence).size !== 926) {
    fail("publication sequence must contain exactly 926 unique requirements");
  }
  const entries = publicationSequence.map((legacyId, index) => {
    if (!LEGACY_ID.test(legacyId)) fail(`publication identity ${legacyId} is invalid`);
    return { rank: index + 1, legacyId, planKey: `issue:${legacyId}` };
  });
  return {
    schemaVersion: LINEAR_AUTHORITY_REQUIREMENT_PUBLICATION_SCHEMA_VERSION,
    kind: "linear_authority_requirement_publication_sequence",
    entries,
    publicationRoot: rowsRoot(entries),
    complete: true,
  };
}

export function validateLinearAuthorityRequirementPublicationSequence(
  raw: string | Uint8Array,
  expectedSequence: readonly string[],
): LinearAuthorityRequirementPublicationSequence {
  let parsed: unknown;
  try {
    parsed = JSON.parse(typeof raw === "string" ? raw : new TextDecoder("utf-8", { fatal: true }).decode(raw));
  } catch {
    fail("artifact is not valid UTF-8 JSON");
  }
  const root = exactKeys(parsed, ["schemaVersion", "kind", "entries", "publicationRoot", "complete"], "artifact");
  if (
    root.schemaVersion !== 1 ||
    root.kind !== "linear_authority_requirement_publication_sequence" ||
    root.complete !== true ||
    !Array.isArray(root.entries) ||
    !DIGEST.test(String(root.publicationRoot))
  ) fail("artifact contract is invalid");
  if (root.entries.length !== 926 || expectedSequence.length !== 926) {
    fail("artifact and expected sequence must contain exactly 926 rows");
  }
  const entries = root.entries.map((value, index): LinearAuthorityRequirementPublicationEntry => {
    const row = exactKeys(value, ["rank", "legacyId", "planKey"], `entry ${index + 1}`);
    const legacyId = expectedSequence[index];
    if (
      row.rank !== index + 1 ||
      row.legacyId !== legacyId ||
      row.planKey !== `issue:${legacyId}` ||
      !LEGACY_ID.test(String(row.legacyId))
    ) fail(`entry ${index + 1} differs from the canonical topological sequence`);
    return row as unknown as LinearAuthorityRequirementPublicationEntry;
  });
  if (new Set(entries.map((row) => row.legacyId)).size !== 926) fail("artifact duplicates a requirement identity");
  if (root.publicationRoot !== rowsRoot(entries)) fail("publication root mismatch");
  return root as unknown as LinearAuthorityRequirementPublicationSequence;
}

export function canonicalLinearAuthorityRequirementPublicationSequenceJson(
  value: LinearAuthorityRequirementPublicationSequence,
): string {
  return `${canonicalJson(value)}\n`;
}
