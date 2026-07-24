import { createHash } from "node:crypto";
import { readFileSync, realpathSync } from "node:fs";
import path from "node:path";
import type { SourceRequirement } from "./model.js";

export interface SourceChecksumSlice {
  endHeading: string;
  endBeforeHorizontalRule?: boolean;
  sourceDoc: string;
  startHeading: string;
}

export interface LegacySourceChecksumContractRow extends SourceChecksumSlice {
  sha256: string;
  sourceId: string;
}

export interface BundledSourceChecksumContractRow {
  sha256: string;
  slices: SourceChecksumSlice[];
  sourceId: string;
}

export interface SectionSourceChecksumContractRow {
  sectionHeading: string;
  sha256: string;
  sourceDoc: string;
  sourceId: string;
}

export type SourceChecksumContractRow =
  | LegacySourceChecksumContractRow
  | BundledSourceChecksumContractRow
  | SectionSourceChecksumContractRow;

export type SourceChecksumContract =
  | {
      schemaVersion: 1;
      sources: LegacySourceChecksumContractRow[];
    }
  | {
      schemaVersion: 2;
      sources: SourceChecksumContractRow[];
    }
  | {
      schemaVersion: 3;
      sources: SourceChecksumContractRow[];
    };

export interface SourceChecksumFinding {
  code: string;
  message: string;
  sourceId: string;
}

export interface SourceChecksumCandidateResult {
  contract: SourceChecksumContract;
  findings: SourceChecksumFinding[];
}

export interface ResolvedSourceChecksum {
  sourceId: string;
  sourceDoc: string;
  sourceDocuments: string[];
  section: string;
  sectionBundleCount: number;
  sourceBindingSha256: string;
  sha256: string;
  selector: "registered" | "feature_inventory_section";
  slices: Array<{
    sourceDoc: string;
    startHeading: string;
    endHeading: string | null;
    endBeforeHorizontalRule?: boolean;
  }>;
}

interface SliceResult {
  findings: SourceChecksumFinding[];
  sha256: string | null;
}

const BUNDLE_HASH_DOMAIN = "sourcera-ordered-source-bundle-v1";
const LINEAR_SOURCE_BINDING_DOMAIN = "sourcera-linear-source-binding-v1";

function sha256(value: string): string {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

function orderedUnique(values: readonly string[]): string[] {
  return values.filter((value, index) => values.indexOf(value) === index);
}

export function sourceSliceBindingSha256(
  slices: readonly {
    sourceDoc: string;
    startHeading: string;
    endHeading: string | null;
    endBeforeHorizontalRule?: boolean;
  }[],
): string {
  if (!slices.length) throw new Error("Source slice binding is empty");
  return sha256(
    JSON.stringify([
      LINEAR_SOURCE_BINDING_DOMAIN,
      slices.map((slice) => [
        slice.sourceDoc,
        slice.startHeading,
        slice.endHeading,
        slice.endBeforeHorizontalRule ?? false,
      ]),
    ]),
  );
}

function resolvedSourceMetadata(
  slices: ResolvedSourceChecksum["slices"],
): Pick<
  ResolvedSourceChecksum,
  "sourceDoc" | "sourceDocuments" | "sectionBundleCount" | "sourceBindingSha256"
> {
  if (!slices.length) throw new Error("Resolved source checksum has no slices");
  return {
    sourceDoc: slices[0].sourceDoc,
    sourceDocuments: orderedUnique(slices.map((slice) => slice.sourceDoc)),
    sectionBundleCount: slices.length,
    sourceBindingSha256: sourceSliceBindingSha256(slices),
  };
}

function sourceIdOf(row: unknown): string {
  if (
    typeof row === "object" &&
    row !== null &&
    "sourceId" in row &&
    typeof row.sourceId === "string"
  ) {
    return row.sourceId;
  }
  return "unknown";
}

function finding(
  code: string,
  row: unknown,
  message: string,
): SourceChecksumFinding {
  return { code, message, sourceId: sourceIdOf(row) };
}

function lineOffsets(source: string, heading: string): number[] {
  const offsets: number[] = [];
  let offset = 0;
  for (const line of source.match(/.*(?:\r?\n|$)/g) ?? []) {
    if (!line) continue;
    if (line.replace(/\r?\n$/, "") === heading) offsets.push(offset);
    offset += line.length;
  }
  return offsets;
}

function isInside(root: string, candidate: string): boolean {
  const relative = path.relative(root, candidate);
  return (
    relative === "" ||
    (!relative.startsWith("..") && !path.isAbsolute(relative))
  );
}

function isSlice(value: unknown): value is SourceChecksumSlice {
  return (
    typeof value === "object" &&
    value !== null &&
    "sourceDoc" in value &&
    typeof value.sourceDoc === "string" &&
    value.sourceDoc.trim().length > 0 &&
    "startHeading" in value &&
    typeof value.startHeading === "string" &&
    value.startHeading.trim().length > 0 &&
    "endHeading" in value &&
    typeof value.endHeading === "string" &&
    value.endHeading.trim().length > 0 &&
    (!("endBeforeHorizontalRule" in value) ||
      typeof value.endBeforeHorizontalRule === "boolean")
  );
}

function validateAndHashSlice(
  row: unknown,
  slice: unknown,
  canonicalRoot: string,
  sliceNumber?: number,
): SliceResult {
  const sourceId = sourceIdOf(row);
  const label = sliceNumber ? `${sourceId} slice ${sliceNumber}` : sourceId;
  if (!isSlice(slice)) {
    return {
      findings: [
        finding(
          "source_checksum_contract_invalid",
          row,
          `${label} has an invalid checksum slice`,
        ),
      ],
      sha256: null,
    };
  }

  const requestedPath = path.resolve(canonicalRoot, slice.sourceDoc);
  if (!isInside(canonicalRoot, requestedPath)) {
    return {
      findings: [
        finding(
          "source_checksum_path_escape",
          row,
          `${label} source path escapes the repository`,
        ),
      ],
      sha256: null,
    };
  }

  let sourcePath: string;
  let source: string;
  try {
    sourcePath = realpathSync(requestedPath);
    if (!isInside(canonicalRoot, sourcePath)) {
      return {
        findings: [
          finding(
            "source_checksum_path_escape",
            row,
            `${label} source symlink escapes the repository`,
          ),
        ],
        sha256: null,
      };
    }
    source = readFileSync(sourcePath, "utf8");
  } catch {
    return {
      findings: [
        finding(
          "source_checksum_file_missing",
          row,
          `${label} source file is missing`,
        ),
      ],
      sha256: null,
    };
  }

  const starts = lineOffsets(source, slice.startHeading);
  const ends = lineOffsets(source, slice.endHeading);
  const findings: SourceChecksumFinding[] = [];
  if (starts.length === 0) {
    findings.push(
      finding(
        "source_checksum_start_missing",
        row,
        `${label} start heading is missing`,
      ),
    );
  } else if (starts.length > 1) {
    findings.push(
      finding(
        "source_checksum_start_ambiguous",
        row,
        `${label} start heading is duplicated`,
      ),
    );
  }
  if (ends.length === 0) {
    findings.push(
      finding(
        "source_checksum_end_missing",
        row,
        `${label} end heading is missing`,
      ),
    );
  } else if (ends.length > 1) {
    findings.push(
      finding(
        "source_checksum_end_ambiguous",
        row,
        `${label} end heading is duplicated`,
      ),
    );
  }
  if (findings.length > 0) return { findings, sha256: null };

  const start = starts[0];
  let end = ends[0];
  if (end <= start) {
    return {
      findings: [
        finding(
          "source_checksum_anchor_order",
          row,
          `${label} end heading does not follow its start heading`,
        ),
      ],
      sha256: null,
    };
  }
  if (slice.endBeforeHorizontalRule === true) {
    const marker = /(?:^|\r?\n)---(?:\r?\n|$)/.exec(
      source.slice(start, end),
    );
    if (!marker) {
      return {
        findings: [
          finding(
            "source_checksum_end_missing",
            row,
            `${label} horizontal-rule boundary is missing`,
          ),
        ],
        sha256: null,
      };
    }
    end = start + (marker.index ?? 0) +
      (marker[0].startsWith("\n") || marker[0].startsWith("\r") ? 1 : 0);
  }
  return { findings: [], sha256: sha256(source.slice(start, end)) };
}

function validateAndHashSection(
  row: Record<string, unknown>,
  canonicalRoot: string,
): SliceResult {
  const sourceId = sourceIdOf(row);
  if (
    typeof row.sourceDoc !== "string" ||
    !row.sourceDoc.trim() ||
    typeof row.sectionHeading !== "string" ||
    !/^#{1,6}\s+\S/.test(row.sectionHeading)
  ) {
    return {
      findings: [
        finding(
          "source_checksum_contract_invalid",
          row,
          `${sourceId} has an invalid section checksum selector`,
        ),
      ],
      sha256: null,
    };
  }
  const requestedPath = path.resolve(canonicalRoot, row.sourceDoc);
  if (!isInside(canonicalRoot, requestedPath)) {
    return {
      findings: [
        finding(
          "source_checksum_path_escape",
          row,
          `${sourceId} source path escapes the repository`,
        ),
      ],
      sha256: null,
    };
  }
  let source: string;
  try {
    const sourcePath = realpathSync(requestedPath);
    if (!isInside(canonicalRoot, sourcePath)) {
      return {
        findings: [
          finding(
            "source_checksum_path_escape",
            row,
            `${sourceId} source symlink escapes the repository`,
          ),
        ],
        sha256: null,
      };
    }
    source = readFileSync(sourcePath, "utf8");
  } catch {
    return {
      findings: [
        finding(
          "source_checksum_file_missing",
          row,
          `${sourceId} source file is missing`,
        ),
      ],
      sha256: null,
    };
  }
  const starts = lineOffsets(source, row.sectionHeading);
  if (starts.length !== 1) {
    return {
      findings: [
        finding(
          starts.length ? "source_checksum_start_ambiguous" : "source_checksum_start_missing",
          row,
          `${sourceId} section heading is ${starts.length ? "duplicated" : "missing"}`,
        ),
      ],
      sha256: null,
    };
  }
  const level = /^(#{1,6})\s/.exec(row.sectionHeading)?.[1].length;
  if (!level) {
    return {
      findings: [
        finding(
          "source_checksum_contract_invalid",
          row,
          `${sourceId} section heading is invalid`,
        ),
      ],
      sha256: null,
    };
  }
  const start = starts[0];
  let end = source.length;
  let offset = 0;
  for (const line of source.match(/.*(?:\r?\n|$)/g) ?? []) {
    if (!line) continue;
    const plain = line.replace(/\r?\n$/, "");
    if (offset > start) {
      const headingLevel = /^(#{1,6})\s/.exec(plain)?.[1].length;
      if (plain === "---" || (headingLevel !== undefined && headingLevel <= level)) {
        end = offset;
        break;
      }
    }
    offset += line.length;
  }
  return { findings: [], sha256: sha256(source.slice(start, end)) };
}

function hasLegacyFields(row: Record<string, unknown>): boolean {
  return ["sourceDoc", "startHeading", "endHeading"].some(
    (field) => field in row,
  );
}

function hasSectionFields(row: Record<string, unknown>): boolean {
  return "sectionHeading" in row;
}

function validIdentityAndHash(row: Record<string, unknown>): boolean {
  return (
    typeof row.sourceId === "string" &&
    row.sourceId.trim().length > 0 &&
    typeof row.sha256 === "string" &&
    /^[a-f0-9]{64}$/.test(row.sha256)
  );
}

function validateLegacyRow(
  row: Record<string, unknown>,
  canonicalRoot: string,
): SourceChecksumFinding[] {
  if (!validIdentityAndHash(row) || "slices" in row || !isSlice(row)) {
    return [
      finding(
        "source_checksum_contract_invalid",
        row,
        `${sourceIdOf(row)} has an invalid checksum contract row`,
      ),
    ];
  }
  const result = validateAndHashSlice(row, row, canonicalRoot);
  if (result.findings.length > 0 || !result.sha256) return result.findings;
  if (result.sha256 !== row.sha256) {
    return [
      finding(
        "source_checksum_mismatch",
        row,
        `${sourceIdOf(row)} source bytes changed (${result.sha256})`,
      ),
    ];
  }
  return [];
}

function validateBundleRow(
  row: Record<string, unknown>,
  canonicalRoot: string,
): SourceChecksumFinding[] {
  if (
    !validIdentityAndHash(row) ||
    hasLegacyFields(row) ||
    !Array.isArray(row.slices) ||
    row.slices.length === 0
  ) {
    return [
      finding(
        "source_checksum_contract_invalid",
        row,
        `${sourceIdOf(row)} has an invalid ordered source bundle`,
      ),
    ];
  }

  const inputs: Array<[string, string, string, string]> = [];
  const findings: SourceChecksumFinding[] = [];
  row.slices.forEach((slice, index) => {
    const result = validateAndHashSlice(
      row,
      slice,
      canonicalRoot,
      index + 1,
    );
    findings.push(...result.findings);
    if (result.sha256 && isSlice(slice)) {
      inputs.push([
        slice.sourceDoc,
        slice.startHeading,
        slice.endHeading,
        result.sha256,
      ]);
    }
  });
  if (findings.length > 0) return findings;

  const actual = sha256(JSON.stringify([BUNDLE_HASH_DOMAIN, inputs]));
  if (actual !== row.sha256) {
    return [
      finding(
        "source_checksum_mismatch",
        row,
        `${sourceIdOf(row)} ordered source bundle changed (${actual})`,
      ),
    ];
  }
  return [];
}

function validateSectionRow(
  row: Record<string, unknown>,
  canonicalRoot: string,
): SourceChecksumFinding[] {
  if (
    !validIdentityAndHash(row) ||
    "slices" in row ||
    "startHeading" in row ||
    "endHeading" in row ||
    typeof row.sourceDoc !== "string" ||
    typeof row.sectionHeading !== "string"
  ) {
    return [
      finding(
        "source_checksum_contract_invalid",
        row,
        `${sourceIdOf(row)} has an invalid section checksum row`,
      ),
    ];
  }
  const result = validateAndHashSection(row, canonicalRoot);
  if (result.findings.length || !result.sha256) return result.findings;
  if (result.sha256 !== row.sha256) {
    return [
      finding(
        "source_checksum_mismatch",
        row,
        `${sourceIdOf(row)} source bytes changed (${result.sha256})`,
      ),
    ];
  }
  return [];
}

export function verifySourceChecksumContract(
  contract: SourceChecksumContract,
  repositoryRoot: string,
): SourceChecksumFinding[] {
  if (
    !contract ||
    ![1, 2, 3].includes(contract.schemaVersion) ||
    !Array.isArray(contract.sources)
  ) {
    throw new Error("Source checksum contract schema is invalid");
  }
  const canonicalRoot = realpathSync(repositoryRoot);
  const findings: SourceChecksumFinding[] = [];
  const seen = new Set<string>();
  for (const rawRow of contract.sources as unknown[]) {
    const row =
      typeof rawRow === "object" && rawRow !== null
        ? (rawRow as Record<string, unknown>)
        : {};
    const sourceId = sourceIdOf(row);
    if (seen.has(sourceId)) {
      findings.push(
        finding(
          "source_checksum_duplicate",
          row,
          `${sourceId} has duplicate checksum rows`,
        ),
      );
    }
    seen.add(sourceId);

    const bundled = "slices" in row;
    const section = hasSectionFields(row);
    if (contract.schemaVersion === 1 && bundled) {
      findings.push(
        finding(
          "source_checksum_contract_invalid",
          row,
          `${sourceId} uses a source bundle under schema version 1`,
        ),
      );
      continue;
    }
    if (section && contract.schemaVersion !== 3) {
      findings.push(
        finding(
          "source_checksum_contract_invalid",
          row,
          `${sourceId} uses a section selector before schema version 3`,
        ),
      );
      continue;
    }
    findings.push(
      ...(section
        ? validateSectionRow(row, canonicalRoot)
        : bundled
          ? validateBundleRow(row, canonicalRoot)
          : validateLegacyRow(row, canonicalRoot)),
    );
  }
  return findings.sort(
    (left, right) =>
      left.sourceId.localeCompare(right.sourceId) ||
      left.code.localeCompare(right.code) ||
      left.message.localeCompare(right.message),
  );
}

export function buildSourceChecksumCandidate(
  contract: SourceChecksumContract,
  repositoryRoot: string,
): SourceChecksumCandidateResult {
  if (
    !contract ||
    ![1, 2, 3].includes(contract.schemaVersion) ||
    !Array.isArray(contract.sources)
  ) {
    throw new Error("Source checksum contract schema is invalid");
  }
  const canonicalRoot = realpathSync(repositoryRoot);
  const candidate = structuredClone(contract) as SourceChecksumContract;
  const findings: SourceChecksumFinding[] = [];
  const seen = new Set<string>();
  for (const rawRow of candidate.sources as unknown[]) {
    const row =
      typeof rawRow === "object" && rawRow !== null
        ? rawRow as Record<string, unknown>
        : {};
    const sourceId = sourceIdOf(row);
    if (
      typeof row.sourceId !== "string" ||
      !row.sourceId.trim() ||
      seen.has(sourceId)
    ) {
      findings.push(
        finding(
          seen.has(sourceId)
            ? "source_checksum_duplicate"
            : "source_checksum_contract_invalid",
          row,
          `${sourceId} cannot be written as a checksum candidate`,
        ),
      );
      continue;
    }
    seen.add(sourceId);
    if (hasSectionFields(row)) {
      if (
        contract.schemaVersion !== 3 ||
        "slices" in row ||
        "startHeading" in row ||
        "endHeading" in row
      ) {
        findings.push(
          finding(
            "source_checksum_contract_invalid",
            row,
            `${sourceId} has an invalid section checksum row`,
          ),
        );
        continue;
      }
      const result = validateAndHashSection(row, canonicalRoot);
      findings.push(...result.findings);
      if (result.sha256) row.sha256 = result.sha256;
      continue;
    }
    if ("slices" in row) {
      if (
        contract.schemaVersion === 1 ||
        hasLegacyFields(row) ||
        !Array.isArray(row.slices) ||
        row.slices.length === 0
      ) {
        findings.push(
          finding(
            "source_checksum_contract_invalid",
            row,
            `${sourceId} has an invalid ordered source bundle`,
          ),
        );
        continue;
      }
      const inputs: Array<[string, string, string, string]> = [];
      row.slices.forEach((slice, index) => {
        const result = validateAndHashSlice(
          row,
          slice,
          canonicalRoot,
          index + 1,
        );
        findings.push(...result.findings);
        if (result.sha256 && isSlice(slice)) {
          inputs.push([
            slice.sourceDoc,
            slice.startHeading,
            slice.endHeading,
            result.sha256,
          ]);
        }
      });
      if (inputs.length === row.slices.length) {
        row.sha256 = sha256(JSON.stringify([BUNDLE_HASH_DOMAIN, inputs]));
      }
      continue;
    }
    if (!isSlice(row)) {
      findings.push(
        finding(
          "source_checksum_contract_invalid",
          row,
          `${sourceId} has an invalid checksum slice`,
        ),
      );
      continue;
    }
    const result = validateAndHashSlice(row, row, canonicalRoot);
    findings.push(...result.findings);
    if (result.sha256) row.sha256 = result.sha256;
  }
  return {
    contract: candidate,
    findings: findings.sort(
      (left, right) =>
        left.sourceId.localeCompare(right.sourceId) ||
        left.code.localeCompare(right.code) ||
        left.message.localeCompare(right.message),
    ),
  };
}

interface SourceHeadingRow {
  line: string;
  text: string;
  level: number;
  offset: number;
}

interface IndexedSourceDocument {
  source: string;
  headings: SourceHeadingRow[];
}

type IndexedSourceDocumentReader = (sourcePath: string) => IndexedSourceDocument;

function sourceHeadingRows(source: string): SourceHeadingRow[] {
  const rows: SourceHeadingRow[] = [];
  let offset = 0;
  for (const lineWithEnding of source.match(/.*(?:\r?\n|$)/g) ?? []) {
    if (!lineWithEnding) continue;
    const line = lineWithEnding.replace(/\r?\n$/, "");
    const heading = /^(#{1,6})\s+(.+)$/.exec(line);
    if (heading) {
      rows.push({
        line,
        text: heading[2].replace(/\s+\{#[^}]+\}\s*$/, ""),
        level: heading[1].length,
        offset,
      });
    }
    offset += lineWithEnding.length;
  }
  return rows;
}

function referenceKeys(section: string): [string, string] | null {
  const normalized = section.trim();
  const numeric = /^(?:UX(?: Design)?\s+)?§((?:M\.)?\d+(?:\.[0-9A-Z]+)*)(?:\s*[–—-]\s*§?((?:M\.)?\d+(?:\.[0-9A-Z]+)*))?$/i
    .exec(normalized);
  if (numeric) {
    const start = numeric[1].toUpperCase();
    return [start, (numeric[2] ?? numeric[1]).toUpperCase()];
  }
  const appendix = /^Appendix\s+([A-M](?:\.\d+)*)(?:\s*[–—-]\s*(?:Appendix\s+)?([A-M](?:\.\d+)*))?$/i
    .exec(normalized);
  if (!appendix) return null;
  const start = appendix[1].toUpperCase();
  return [start, (appendix[2] ?? appendix[1]).toUpperCase()];
}

function expandSectionRangeEnd(start: string, end: string): string {
  if (!end.startsWith(".")) return end.toUpperCase();
  const parts = start.toUpperCase().split(".");
  if (parts.length < 2) return end.slice(1).toUpperCase();
  return [...parts.slice(0, 2), end.slice(1).toUpperCase()].join(".");
}

export function sourceSectionReferences(binding: string): string[] {
  const references: string[] = [];
  const matcher = /§\s*((?:M\.)?\d+(?:\.[0-9A-Z]+)*)(?:\s*[–—-]\s*(?:§\s*)?((?:M\.)?\d+(?:\.[0-9A-Z]+)*|\.[0-9A-Z]+))?|Appendix\s+([A-M](?:\.\d+)*)(?:\s*[–—-]\s*(?:Appendix\s+)?([A-M](?:\.\d+)*))?/gi;
  for (const match of binding.matchAll(matcher)) {
    if (match[1]) {
      const start = match[1].toUpperCase();
      const end = match[2]
        ? expandSectionRangeEnd(start, match[2])
        : start;
      references.push(
        start === end ? `§${start}` : `§${start}–§${end}`,
      );
      continue;
    }
    const start = match[3].toUpperCase();
    const end = (match[4] ?? match[3]).toUpperCase();
    references.push(
      start === end ? `Appendix ${start}` : `Appendix ${start}–Appendix ${end}`,
    );
  }
  if (new Set(references).size !== references.length) {
    throw new Error("Source section binding contains duplicate references");
  }
  return references;
}

export function canonicalSourceSectionBinding(binding: string): string {
  const references = sourceSectionReferences(binding);
  return references.length ? references.join(", ") : binding.trim();
}

function normalizedSourceSection(binding: string): string {
  return canonicalSourceSectionBinding(binding)
    .replace(/[–—]/g, "-")
    .replace(/\s+/g, "")
    .toLowerCase();
}

function headingKey(text: string): string | null {
  const appendix = /^Appendix\s+([A-M])(?:\s*[:—-]|$)/i.exec(text);
  if (appendix) return appendix[1].toUpperCase();
  const section = /^Section\s+(\d+(?:\.[0-9A-Z]+)*)\s*[:—-]/i.exec(text);
  if (section) return section[1].toUpperCase();
  const numeric = /^((?:M\.)?\d+(?:\.[0-9A-Z]+)*|[A-M](?:\.\d+[A-Z]?)+)\b/i
    .exec(text);
  return numeric?.[1].toUpperCase() ?? null;
}

function resolveFeatureInventorySection(
  requirement: SourceRequirement,
  repositoryRoot: string,
  section: string,
  readIndexedSource: IndexedSourceDocumentReader,
): ResolvedSourceChecksum {
  const canonicalRoot = realpathSync(repositoryRoot);
  const sourcePath = path.resolve(canonicalRoot, requirement.sourceDoc);
  if (!isInside(canonicalRoot, sourcePath)) {
    throw new Error(`${requirement.requirementId} source path escapes the repository`);
  }
  const canonicalSource = realpathSync(sourcePath);
  if (!isInside(canonicalRoot, canonicalSource)) {
    throw new Error(`${requirement.requirementId} source symlink escapes the repository`);
  }
  const keys = referenceKeys(section);
  if (!keys) {
    throw new Error(
      `${requirement.requirementId} lacks a registered exact source slice for ${section}`,
    );
  }
  const { source, headings } = readIndexedSource(canonicalSource);
  const resolveHeading = (key: string) => {
    const candidates = headings.filter((heading) => headingKey(heading.text) === key);
    const minimumLevel = Math.min(...candidates.map((heading) => heading.level));
    return candidates.filter((heading) => heading.level === minimumLevel);
  };
  const starts = resolveHeading(keys[0]);
  const ends = resolveHeading(keys[1]);
  if (starts.length !== 1 || ends.length !== 1) {
    throw new Error(
      `${requirement.requirementId} source section ${section} resolves ${starts.length}/${ends.length} exact headings`,
    );
  }
  const start = starts[0];
  const final = ends[0];
  if (final.offset < start.offset) {
    throw new Error(`${requirement.requirementId} source section range is reversed`);
  }
  const next = headings.find(
    (heading) => heading.offset > final.offset && heading.level <= final.level,
  );
  let end = next?.offset ?? source.length;
  let endBeforeHorizontalRule = false;
  const horizontalRule = /(?:^|\r?\n)---(?:\r?\n|$)/g;
  for (const match of source.matchAll(horizontalRule)) {
    const offset = (match.index ?? 0) + (match[0].startsWith("\n") ? 1 : 0);
    if (offset > start.offset && offset < end) {
      end = offset;
      endBeforeHorizontalRule = true;
      break;
    }
  }
  const slices = [{
    sourceDoc: requirement.sourceDoc,
    startHeading: start.line,
    endHeading: next?.line ?? null,
    ...(endBeforeHorizontalRule ? { endBeforeHorizontalRule: true } : {}),
  }];
  return {
    sourceId: requirement.requirementId,
    ...resolvedSourceMetadata(slices),
    section,
    sha256: sha256(source.slice(start.offset, end)),
    selector: "feature_inventory_section",
    slices,
  };
}

function resolveFeatureInventorySections(
  requirement: SourceRequirement,
  repositoryRoot: string,
  binding: string,
  readIndexedSource: IndexedSourceDocumentReader = cachedIndexedSourceReader(),
): ResolvedSourceChecksum {
  const sections = sourceSectionReferences(binding);
  if (!sections.length) {
    throw new Error(
      `${requirement.requirementId} lacks a registered exact source slice for ${binding}`,
    );
  }
  const resolved = sections.map((section) =>
    resolveFeatureInventorySection(
      requirement,
      repositoryRoot,
      section,
      readIndexedSource,
    )
  );
  if (resolved.length === 1) return resolved[0];
  const slices = resolved.flatMap((row) => row.slices);
  const inputs = resolved.map((row) => {
    const slice = row.slices[0]!;
    return [
      slice.sourceDoc,
      slice.startHeading,
      slice.endHeading,
      row.sha256,
    ];
  });
  return {
    sourceId: requirement.requirementId,
    ...resolvedSourceMetadata(slices),
    section: sections.join(", "),
    sha256: sha256(JSON.stringify([BUNDLE_HASH_DOMAIN, inputs])),
    selector: "feature_inventory_section",
    slices,
  };
}

function cachedIndexedSourceReader(
  readSource: (sourcePath: string) => string = (sourcePath) =>
    readFileSync(sourcePath, "utf8"),
): IndexedSourceDocumentReader {
  const documents = new Map<string, IndexedSourceDocument>();
  return (sourcePath) => {
    const cached = documents.get(sourcePath);
    if (cached) return cached;
    const source = readSource(sourcePath);
    const indexed = { source, headings: sourceHeadingRows(source) };
    documents.set(sourcePath, indexed);
    return indexed;
  };
}

export interface LinearSourceChecksumResolutionCache {
  resolve(
    requirement: SourceRequirement,
    repositoryRoot: string,
    binding: string,
  ): ResolvedSourceChecksum;
}

export function createLinearSourceChecksumResolutionCache(
  readSource?: (sourcePath: string) => string,
): LinearSourceChecksumResolutionCache {
  const readIndexedSource = cachedIndexedSourceReader(readSource);
  const resolutions = new Map<string, ResolvedSourceChecksum>();
  return {
    resolve(requirement, repositoryRoot, binding) {
      const sections = sourceSectionReferences(binding);
      const key = JSON.stringify([
        realpathSync(repositoryRoot),
        requirement.sourceDoc,
        sections,
      ]);
      const cached = resolutions.get(key);
      if (cached) {
        return {
          ...cached,
          sourceId: requirement.requirementId,
          sourceDocuments: [...cached.sourceDocuments],
          slices: cached.slices.map((slice) => ({ ...slice })),
        };
      }
      const resolved = resolveFeatureInventorySections(
        requirement,
        repositoryRoot,
        binding,
        readIndexedSource,
      );
      resolutions.set(key, resolved);
      return resolved;
    },
  };
}

function registeredSection(
  slices: ResolvedSourceChecksum["slices"],
): string {
  if (slices.length !== 1) return `${slices.length} registered slices`;
  const heading = slices[0].startHeading.replace(/^#{1,6}\s+/, "");
  const appendix = /^Appendix\s+([A-M](?:\.\d+)*)\b/i.exec(heading);
  if (appendix) return `Appendix ${appendix[1].toUpperCase()}`;
  const key = headingKey(heading);
  return key ? `§${key}` : slices[0].startHeading;
}

function registeredChecksum(
  sourceId: string,
  contract: SourceChecksumContract,
): ResolvedSourceChecksum | null {
  const row = contract.sources.find((candidate) => candidate.sourceId === sourceId);
  if (!row) return null;
  if ("slices" in row) {
    const slices = row.slices.map((slice) => ({ ...slice }));
    return {
      sourceId,
      ...resolvedSourceMetadata(slices),
      section: registeredSection(slices),
      sha256: row.sha256,
      selector: "registered",
      slices,
    };
  }
  if ("sectionHeading" in row) {
    const slices = [{
      sourceDoc: row.sourceDoc,
      startHeading: row.sectionHeading,
      endHeading: null,
    }];
    return {
      sourceId,
      ...resolvedSourceMetadata(slices),
      section: registeredSection(slices),
      sha256: row.sha256,
      selector: "registered",
      slices,
    };
  }
  const slices = [{
    sourceDoc: row.sourceDoc,
    startHeading: row.startHeading,
    endHeading: row.endHeading,
    ...(row.endBeforeHorizontalRule === true
      ? { endBeforeHorizontalRule: true }
      : {}),
  }];
  return {
    sourceId,
    ...resolvedSourceMetadata(slices),
    section: registeredSection(slices),
    sha256: row.sha256,
    selector: "registered",
    slices,
  };
}

export function resolveSourceRequirementChecksum(
  requirement: SourceRequirement,
  contract: SourceChecksumContract,
  repositoryRoot: string,
  section = requirement.section,
): ResolvedSourceChecksum {
  const canonicalSection = canonicalSourceSectionBinding(section);
  const references = sourceSectionReferences(canonicalSection);
  const registered = references.length <= 1
    ? registeredChecksum(requirement.requirementId, contract)
    : null;
  if (
    registered &&
    registered.sectionBundleCount === 1 &&
    normalizedSourceSection(registered.section) ===
      normalizedSourceSection(canonicalSection)
  ) {
    return registered;
  }
  return resolveFeatureInventorySections(
    requirement,
    repositoryRoot,
    canonicalSection,
  );
}

export function resolveRegisteredSourceChecksum(
  sourceId: string,
  contract: SourceChecksumContract,
): ResolvedSourceChecksum {
  const registered = registeredChecksum(sourceId, contract);
  if (!registered) {
    throw new Error(`${sourceId} lacks a registered exact source slice`);
  }
  return registered;
}

export interface LinearSourceChecksumProvenance {
  sourceDocument: string | null;
  sourceDocuments: string[];
  section: string | null;
  sectionBundleCount: number | null;
  sourceBinding: string | null;
  sourceChecksum: string | null;
}

function exactStringArray(left: readonly string[], right: readonly string[]): boolean {
  return JSON.stringify(left) === JSON.stringify(right);
}

export function resolveLinearSourceChecksum(
  requirement: SourceRequirement,
  provenance: LinearSourceChecksumProvenance,
  contract: SourceChecksumContract,
  repositoryRoot: string,
  options: {
    allowChecksumDrift?: boolean;
    resolutionCache?: LinearSourceChecksumResolutionCache;
  } = {},
): ResolvedSourceChecksum {
  const registered = registeredChecksum(requirement.requirementId, contract);
  if (registered) {
    if (registered.sectionBundleCount === 1) {
      const expectedDocument = registered.sourceDocuments[0];
      if (
        provenance.sourceDocument !== expectedDocument ||
        !exactStringArray(provenance.sourceDocuments, [expectedDocument]) ||
        !provenance.section ||
        normalizedSourceSection(provenance.section) !==
          normalizedSourceSection(registered.section) ||
        provenance.sectionBundleCount !== null ||
        (provenance.sourceBinding !== null &&
          provenance.sourceBinding !== registered.sourceBindingSha256)
      ) {
        throw new Error(
          `${requirement.requirementId} Linear provenance differs from its registered exact source slice`,
        );
      }
    } else if (
      provenance.sourceDocument !== null ||
      provenance.section !== null ||
      !exactStringArray(
        provenance.sourceDocuments,
        registered.sourceDocuments,
      ) ||
      provenance.sectionBundleCount !== registered.sectionBundleCount ||
      provenance.sourceBinding !== registered.sourceBindingSha256
    ) {
      throw new Error(
        `${requirement.requirementId} Linear provenance differs from its registered source bundle`,
      );
    }
    if (
      !options.allowChecksumDrift &&
      provenance.sourceChecksum !== registered.sha256
    ) {
      throw new Error(
        `${requirement.requirementId} Linear provenance checksum differs from its registered source bundle`,
      );
    }
    return registered;
  }

  if (
    provenance.sourceDocument !== requirement.sourceDoc ||
    !exactStringArray(provenance.sourceDocuments, [requirement.sourceDoc]) ||
    !provenance.section ||
    provenance.sectionBundleCount !== null
  ) {
    throw new Error(
      `${requirement.requirementId} Linear provenance differs from its canonical source document and section`,
    );
  }
  const resolved = options.resolutionCache
    ? options.resolutionCache.resolve(
        requirement,
        repositoryRoot,
        provenance.section,
      )
    : resolveFeatureInventorySections(
        requirement,
        repositoryRoot,
        provenance.section,
      );
  if (
    (!options.allowChecksumDrift &&
      provenance.sourceChecksum !== resolved.sha256) ||
    (provenance.sourceBinding !== null &&
      provenance.sourceBinding !== resolved.sourceBindingSha256)
  ) {
    throw new Error(
      `${requirement.requirementId} Linear provenance checksum or binding has drifted`,
    );
  }
  return resolved;
}

export interface RegisteredLinearSourceProvenance {
  sourceId: string;
  sourceDocuments: string[];
  sourceSection: string | null;
  sourceSectionBundleCount: number | null;
  sourceBindingSha256: string;
  sourceChecksumSha256: string;
  markdown: string;
}

export function registeredLinearSourceProvenance(
  resolved: ResolvedSourceChecksum,
): RegisteredLinearSourceProvenance {
  if (resolved.selector !== "registered") {
    throw new Error(`${resolved.sourceId} is not a registered source checksum`);
  }
  const bundled = resolved.sectionBundleCount > 1;
  const lines = [
    "## Source provenance",
    `- Canonical requirement: \`${resolved.sourceId}\``,
    bundled
      ? `- Source documents: ${resolved.sourceDocuments.map((document) => `\`${document}\``).join(", ")}`
      : `- Source document: \`${resolved.sourceDocuments[0]}\``,
    bundled
      ? `- Source section bundle: ${resolved.sectionBundleCount} registered slices`
      : `- Source section: ${resolved.section}`,
    `- Canonical source binding: sha256:${resolved.sourceBindingSha256}`,
    `- Canonical source checksum: sha256:${resolved.sha256}`,
  ];
  return {
    sourceId: resolved.sourceId,
    sourceDocuments: [...resolved.sourceDocuments],
    sourceSection: bundled ? null : resolved.section,
    sourceSectionBundleCount: bundled
      ? resolved.sectionBundleCount
      : null,
    sourceBindingSha256: resolved.sourceBindingSha256,
    sourceChecksumSha256: resolved.sha256,
    markdown: lines.join("\n"),
  };
}
