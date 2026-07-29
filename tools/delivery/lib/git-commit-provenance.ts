import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { lstatSync, realpathSync, readFileSync } from "node:fs";
import { isAbsolute, join, posix, resolve, sep } from "node:path";

const MAX_GIT_OUTPUT_BYTES = 256 * 1024 * 1024;
const FULL_COMMIT_OID = /^[0-9a-f]{40,64}$/;
const TREE_ENTRY =
  /^([0-7]{6}) ([a-z]+) ([0-9a-f]{40,64})\t([\s\S]+)$/;
const INDEX_ENTRY =
  /^([0-7]{6}) ([0-9a-f]{40,64}) ([0-3])\t([\s\S]+)$/;

export interface ExactGitCommitProvenanceInput {
  repositoryRoot: string;
  sourceCommit: string;
  paths: readonly string[];
}

export interface ExactGitCommitProvenancePath {
  path: string;
  mode: "100644" | "100755";
  byteLength: number;
  sha256: string;
}

export interface ExactGitCommitProvenance {
  sourceCommit: string;
  headCommit: string;
  paths: ExactGitCommitProvenancePath[];
}

interface GitTreeEntry {
  mode: string;
  type: string;
  path: string;
}

interface GitIndexEntry {
  mode: string;
  stage: string;
  path: string;
}

interface PendingPath {
  path: string;
  absolutePath: string;
  mode: "100644" | "100755";
  indexTag: string;
  committedBytes: Buffer;
}

function runGit(
  repositoryRoot: string,
  arguments_: readonly string[],
  failureMessage: string,
): Buffer {
  const result = spawnSync(
    "git",
    ["--no-optional-locks", ...arguments_],
    {
      cwd: repositoryRoot,
      encoding: null,
      env: { ...process.env, GIT_OPTIONAL_LOCKS: "0" },
      maxBuffer: MAX_GIT_OUTPUT_BYTES,
    },
  );
  if (result.error || result.signal || result.status !== 0) {
    throw new Error(failureMessage);
  }
  if (!Buffer.isBuffer(result.stdout)) {
    throw new Error(`${failureMessage}: Git returned non-binary output`);
  }
  return result.stdout;
}

function gitText(
  repositoryRoot: string,
  arguments_: readonly string[],
  failureMessage: string,
): string {
  return runGit(repositoryRoot, arguments_, failureMessage)
    .toString("utf8")
    .trim();
}

export function resolveExactGitCommit(repositoryRoot: string, revision: string): string {
  if (!isAbsolute(repositoryRoot) || !/^[A-Za-z0-9._/-]+\^\{commit\}$/.test(revision)) {
    throw new Error("Git commit resolution input is invalid");
  }
  const commit = gitText(
    realpathSync(repositoryRoot),
    ["rev-parse", "--verify", revision],
    "Cannot resolve the pinned Git commit",
  );
  if (!FULL_COMMIT_OID.test(commit)) throw new Error("Resolved Git commit is not a full lowercase OID");
  return commit;
}

function nulRecords(value: Buffer): string[] {
  if (value.length === 0) return [];
  const text = value.toString("utf8");
  if (!text.endsWith("\0")) {
    throw new Error("Git returned a malformed NUL-delimited record");
  }
  return text.slice(0, -1).split("\0");
}

function validatePath(path: unknown): string {
  if (typeof path !== "string" || path.length === 0) {
    throw new Error("Git provenance allowlist contains an empty path");
  }
  if (
    path.length > 4096 ||
    isAbsolute(path) ||
    path.startsWith("-") ||
    path.endsWith("/") ||
    path.includes("\\") ||
    /[\u0000-\u001f\u007f:*?\[]/.test(path) ||
    posix.normalize(path) !== path
  ) {
    throw new Error(`Git provenance allowlist path is unsafe: ${path}`);
  }
  const segments = path.split("/");
  if (
    segments.some(
      (segment) =>
        segment.length === 0 ||
        segment === "." ||
        segment === ".." ||
        segment === ".git",
    )
  ) {
    throw new Error(`Git provenance allowlist path is unsafe: ${path}`);
  }
  return path;
}

function parseTreeEntry(
  repositoryRoot: string,
  sourceCommit: string,
  path: string,
): GitTreeEntry {
  const records = nulRecords(
    runGit(
      repositoryRoot,
      ["ls-tree", "-z", "--full-tree", sourceCommit, "--", path],
      `Cannot inspect ${path} at the pinned commit`,
    ),
  );
  if (records.length === 0) {
    throw new Error(`${path} is missing from the pinned commit`);
  }
  if (records.length !== 1) {
    throw new Error(`${path} does not resolve to one exact tree entry`);
  }
  const match = TREE_ENTRY.exec(records[0]!);
  if (!match || match[4] !== path) {
    throw new Error(`${path} does not resolve to one exact tree entry`);
  }
  return { mode: match[1]!, type: match[2]!, path: match[4]! };
}

function assertRegularTreeBlob(entry: GitTreeEntry): "100644" | "100755" {
  if (entry.mode === "120000") {
    throw new Error(`${entry.path} is a symlink, not a regular blob`);
  }
  if (entry.mode === "160000" || entry.type === "commit") {
    throw new Error(
      `${entry.path} is a gitlink or submodule, not a regular blob`,
    );
  }
  if (
    entry.type !== "blob" ||
    (entry.mode !== "100644" && entry.mode !== "100755")
  ) {
    throw new Error(`${entry.path} is not an unambiguous regular blob`);
  }
  return entry.mode;
}

function parseIndexEntry(repositoryRoot: string, path: string): GitIndexEntry {
  const records = nulRecords(
    runGit(
      repositoryRoot,
      ["ls-files", "--stage", "-z", "--", `:(literal)${path}`],
      `Cannot inspect ${path} in the index`,
    ),
  );
  if (records.length !== 1) {
    throw new Error(`${path} does not have one unambiguous index entry`);
  }
  const match = INDEX_ENTRY.exec(records[0]!);
  if (!match || match[4] !== path) {
    throw new Error(`${path} does not have one unambiguous index entry`);
  }
  return {
    mode: match[1]!,
    stage: match[3]!,
    path: match[4]!,
  };
}

function indexStatusTag(repositoryRoot: string, path: string): string {
  const records = nulRecords(
    runGit(
      repositoryRoot,
      ["ls-files", "-v", "-z", "--", `:(literal)${path}`],
      `Cannot inspect ${path} index flags`,
    ),
  );
  if (
    records.length !== 1 ||
    records[0]!.length < 3 ||
    records[0]![1] !== " " ||
    records[0]!.slice(2) !== path
  ) {
    throw new Error(`${path} does not have one unambiguous index flag record`);
  }
  return records[0]![0]!;
}

function assertRegularWorkingFile(
  repositoryRoot: string,
  path: string,
  expectedMode: "100644" | "100755",
): string {
  let cursor = repositoryRoot;
  const segments = path.split("/");
  for (const [index, segment] of segments.entries()) {
    cursor = join(cursor, segment);
    let metadata;
    try {
      metadata = lstatSync(cursor);
    } catch {
      throw new Error(`${path} is missing from the working tree`);
    }
    if (metadata.isSymbolicLink()) {
      throw new Error(`${path} traverses or resolves to a working-tree symlink`);
    }
    if (index < segments.length - 1 && !metadata.isDirectory()) {
      throw new Error(`${path} does not resolve through regular directories`);
    }
    if (index === segments.length - 1 && !metadata.isFile()) {
      throw new Error(`${path} is not a regular working-tree file`);
    }
  }
  const resolvedPath = realpathSync(cursor);
  const rootPrefix = repositoryRoot.endsWith(sep)
    ? repositoryRoot
    : `${repositoryRoot}${sep}`;
  if (
    resolvedPath !== resolve(repositoryRoot, path) ||
    !resolvedPath.startsWith(rootPrefix)
  ) {
    throw new Error(`${path} escapes the repository through a symlink`);
  }
  const workingMode = (lstatSync(cursor).mode & 0o111) === 0
    ? "100644"
    : "100755";
  if (workingMode !== expectedMode) {
    throw new Error(`${path} working mode differs from the pinned commit`);
  }
  return cursor;
}

export function verifyExactGitCommitProvenance(
  input: ExactGitCommitProvenanceInput,
): ExactGitCommitProvenance {
  if (
    !input ||
    typeof input.repositoryRoot !== "string" ||
    !isAbsolute(input.repositoryRoot)
  ) {
    throw new Error("Git provenance repositoryRoot must be an absolute path");
  }
  let repositoryRoot: string;
  try {
    repositoryRoot = realpathSync(input.repositoryRoot);
  } catch {
    throw new Error("Git provenance repositoryRoot does not exist");
  }
  const topLevel = gitText(
    repositoryRoot,
    ["rev-parse", "--show-toplevel"],
    "Git provenance repositoryRoot is not a Git worktree",
  );
  let canonicalTopLevel: string;
  try {
    canonicalTopLevel = realpathSync(topLevel);
  } catch {
    throw new Error("Git provenance repository root cannot be resolved");
  }
  if (canonicalTopLevel !== repositoryRoot) {
    throw new Error("Git provenance repositoryRoot must be the Git worktree root");
  }
  if (
    typeof input.sourceCommit !== "string" ||
    !FULL_COMMIT_OID.test(input.sourceCommit)
  ) {
    throw new Error("Pinned sourceCommit must be one full lowercase commit OID");
  }
  runGit(
    repositoryRoot,
    ["cat-file", "-e", `${input.sourceCommit}^{commit}`],
    "Pinned sourceCommit is not a commit in this repository",
  );
  const headCommit = gitText(
    repositoryRoot,
    ["rev-parse", "--verify", "HEAD^{commit}"],
    "Cannot resolve the repository HEAD commit",
  );
  if (headCommit !== input.sourceCommit) {
    throw new Error("Pinned sourceCommit does not equal HEAD");
  }
  if (!Array.isArray(input.paths) || input.paths.length === 0) {
    throw new Error("Git provenance allowlist must contain at least one path");
  }
  const paths = input.paths.map(validatePath);
  if (new Set(paths).size !== paths.length) {
    throw new Error("Git provenance allowlist contains a duplicate path");
  }

  const pending: PendingPath[] = paths.map((path) => {
    const tree = parseTreeEntry(repositoryRoot, input.sourceCommit, path);
    const mode = assertRegularTreeBlob(tree);
    const index = parseIndexEntry(repositoryRoot, path);
    if (index.stage !== "0") {
      throw new Error(`${path} has an unmerged index entry`);
    }
    if (index.mode === "120000") {
      throw new Error(`${path} is a symlink in the index`);
    }
    if (index.mode === "160000") {
      throw new Error(`${path} is a gitlink or submodule in the index`);
    }
    if (index.mode !== mode) {
      throw new Error(`${path} index mode differs from the pinned commit`);
    }
    const absolutePath = assertRegularWorkingFile(repositoryRoot, path, mode);
    const committedBytes = runGit(
      repositoryRoot,
      ["cat-file", "blob", `${input.sourceCommit}:${path}`],
      `Cannot read ${path} from the pinned commit`,
    );
    return {
      path,
      absolutePath,
      mode,
      indexTag: indexStatusTag(repositoryRoot, path),
      committedBytes,
    };
  });

  const status = runGit(
    repositoryRoot,
    [
      "status",
      "--porcelain=v1",
      "-z",
      "--untracked-files=all",
      "--",
      ...paths.map((path) => `:(literal)${path}`),
    ],
    "Cannot verify the allowlisted worktree and index status",
  );
  if (status.length !== 0) {
    throw new Error("An allowlisted path is dirty in the worktree or index");
  }

  const resultPaths = pending.map(
    ({ path, absolutePath, mode, indexTag, committedBytes }) => {
      const indexBytes = runGit(
        repositoryRoot,
        ["cat-file", "blob", `:${path}`],
        `Cannot read ${path} from the index`,
      );
      if (!indexBytes.equals(committedBytes)) {
        throw new Error(`${path} index bytes differ from the pinned commit`);
      }
      const workingBytes = readFileSync(absolutePath);
      if (!workingBytes.equals(committedBytes)) {
        throw new Error(`${path} working bytes differ from the pinned commit`);
      }
      if (indexTag !== "H") {
        throw new Error(`${path} index flags can hide drift`);
      }
      return {
        path,
        mode,
        byteLength: committedBytes.length,
        sha256: createHash("sha256").update(committedBytes).digest("hex"),
      };
    },
  );

  return {
    sourceCommit: input.sourceCommit,
    headCommit,
    paths: resultPaths,
  };
}
