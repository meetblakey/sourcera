import { createHash } from "node:crypto";
import { readFileSync, realpathSync } from "node:fs";
import path from "node:path";

export interface SourceChecksumContractRow {
  endHeading: string;
  sha256: string;
  sourceDoc: string;
  sourceId: string;
  startHeading: string;
}

export interface SourceChecksumContract {
  schemaVersion: 1;
  sources: SourceChecksumContractRow[];
}

export interface SourceChecksumFinding {
  code: string;
  message: string;
  sourceId: string;
}

function finding(
  code: string,
  row: Pick<SourceChecksumContractRow, "sourceId">,
  message: string,
): SourceChecksumFinding {
  return { code, message, sourceId: row.sourceId };
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

function validateRow(
  row: SourceChecksumContractRow,
  canonicalRoot: string,
): SourceChecksumFinding[] {
  const findings: SourceChecksumFinding[] = [];
  if (
    !row.sourceId?.trim() ||
    !row.sourceDoc?.trim() ||
    !row.startHeading?.trim() ||
    !row.endHeading?.trim() ||
    !/^[a-f0-9]{64}$/.test(row.sha256 ?? "")
  ) {
    return [
      finding(
        "source_checksum_contract_invalid",
        row,
        `${row.sourceId || "unknown"} has an invalid checksum contract row`,
      ),
    ];
  }

  const requestedPath = path.resolve(canonicalRoot, row.sourceDoc);
  if (!isInside(canonicalRoot, requestedPath)) {
    return [
      finding(
        "source_checksum_path_escape",
        row,
        `${row.sourceId} source path escapes the repository`,
      ),
    ];
  }

  let sourcePath: string;
  let source: string;
  try {
    sourcePath = realpathSync(requestedPath);
    if (!isInside(canonicalRoot, sourcePath)) {
      return [
        finding(
          "source_checksum_path_escape",
          row,
          `${row.sourceId} source symlink escapes the repository`,
        ),
      ];
    }
    source = readFileSync(sourcePath, "utf8");
  } catch {
    return [
      finding(
        "source_checksum_file_missing",
        row,
        `${row.sourceId} source file is missing`,
      ),
    ];
  }

  const starts = lineOffsets(source, row.startHeading);
  const ends = lineOffsets(source, row.endHeading);
  if (starts.length === 0) {
    findings.push(
      finding(
        "source_checksum_start_missing",
        row,
        `${row.sourceId} start heading is missing`,
      ),
    );
  } else if (starts.length > 1) {
    findings.push(
      finding(
        "source_checksum_start_ambiguous",
        row,
        `${row.sourceId} start heading is duplicated`,
      ),
    );
  }
  if (ends.length === 0) {
    findings.push(
      finding(
        "source_checksum_end_missing",
        row,
        `${row.sourceId} end heading is missing`,
      ),
    );
  } else if (ends.length > 1) {
    findings.push(
      finding(
        "source_checksum_end_ambiguous",
        row,
        `${row.sourceId} end heading is duplicated`,
      ),
    );
  }
  if (findings.length > 0) return findings;

  const start = starts[0];
  const end = ends[0];
  if (end <= start) {
    return [
      finding(
        "source_checksum_anchor_order",
        row,
        `${row.sourceId} end heading does not follow its start heading`,
      ),
    ];
  }
  const actual = createHash("sha256")
    .update(source.slice(start, end), "utf8")
    .digest("hex");
  if (actual !== row.sha256) {
    return [
      finding(
        "source_checksum_mismatch",
        row,
        `${row.sourceId} source bytes changed (${actual})`,
      ),
    ];
  }
  return [];
}

export function verifySourceChecksumContract(
  contract: SourceChecksumContract,
  repositoryRoot: string,
): SourceChecksumFinding[] {
  if (contract?.schemaVersion !== 1 || !Array.isArray(contract.sources)) {
    throw new Error("Source checksum contract schema is invalid");
  }
  const canonicalRoot = realpathSync(repositoryRoot);
  const findings: SourceChecksumFinding[] = [];
  const seen = new Set<string>();
  for (const row of contract.sources) {
    if (seen.has(row.sourceId)) {
      findings.push(
        finding(
          "source_checksum_duplicate",
          row,
          `${row.sourceId} has duplicate checksum rows`,
        ),
      );
    }
    seen.add(row.sourceId);
    findings.push(...validateRow(row, canonicalRoot));
  }
  return findings.sort(
    (left, right) =>
      left.sourceId.localeCompare(right.sourceId) ||
      left.code.localeCompare(right.code),
  );
}
