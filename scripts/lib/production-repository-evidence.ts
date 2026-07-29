import { spawnSync } from "node:child_process";
import { realpathSync } from "node:fs";

const FULL_GIT_SHA = /^[a-f0-9]{40}$/i;
const MAX_FAILURE_TEXT = 4096;

function bounded(value: unknown) {
  const text = typeof value === "string" ? value : String(value ?? "");
  return text.length <= MAX_FAILURE_TEXT
    ? text
    : `${text.slice(0, MAX_FAILURE_TEXT)}…`;
}

class ProductionRepositoryCommandError extends Error {
  readonly context: string;
  readonly exitCode: number;
  readonly stderr: string;

  constructor(input: {
    context: string;
    error: unknown;
    exitCode: number;
    stderr: unknown;
  }) {
    super(`${input.context} failed`);
    this.name = "ProductionRepositoryCommandError";
    this.context = input.context;
    this.exitCode = input.exitCode;
    this.stderr = bounded(input.stderr || input.error);
  }
}

export interface ProductionRepositoryState {
  clean: boolean;
  fetchedMainSha: string;
  headSha: string;
  mainSha: string;
  ref: string;
}

export function collectProductionRepositoryState(options: {
  approvedSha: string;
  dispatchRef: string;
  environment: NodeJS.ProcessEnv;
  includeUntracked: boolean;
  repositoryRoot: string;
}): ProductionRepositoryState {
  if (!FULL_GIT_SHA.test(options.approvedSha)) {
    throw new Error("approved production SHA is invalid");
  }
  const repositoryRoot = realpathSync(options.repositoryRoot);
  const git = (arguments_: string[], context: string) => {
    const result = spawnSync("git", arguments_, {
      cwd: repositoryRoot,
      encoding: "utf8",
      env: options.environment,
      maxBuffer: 1024 * 1024,
      timeout: 30_000,
    });
    if (result.error || result.status !== 0) {
      throw new ProductionRepositoryCommandError({
        context,
        error: result.error?.message,
        exitCode: result.status ?? 1,
        stderr: result.stderr,
      });
    }
    return result.stdout.trim();
  };
  const headSha = git(["rev-parse", "HEAD"], "read Git HEAD");
  const fetchedMainSha = git(
    ["rev-parse", "--verify", "refs/remotes/origin/main^{commit}"],
    "read fetched origin/main",
  );
  const remoteFields = git(
    ["ls-remote", "--exit-code", "origin", "refs/heads/main"],
    "read live remote main",
  ).split(/\s+/);
  const mainSha = remoteFields[0] ?? "";
  const status = git(
    [
      "status",
      "--porcelain=v1",
      options.includeUntracked ? "--untracked-files=all" : "--untracked-files=no",
    ],
    "read Git status",
  );
  const topLevel = realpathSync(
    git(["rev-parse", "--show-toplevel"], "read Git top level"),
  );
  return {
    clean:
      options.dispatchRef === "refs/heads/main" &&
      headSha === options.approvedSha &&
      fetchedMainSha === options.approvedSha &&
      mainSha === options.approvedSha &&
      status.length === 0 &&
      topLevel === repositoryRoot &&
      remoteFields.length === 2 &&
      remoteFields[1] === "refs/heads/main",
    fetchedMainSha,
    headSha,
    mainSha,
    ref: options.dispatchRef,
  };
}

export type ProductionRepositoryEvidence =
  | (ProductionRepositoryState & {
      failure: null;
      outcome: "pass";
    })
  | {
      clean: false;
      failure: {
        context: string;
        error: string;
        exitCode: number;
        stderr: string;
      };
      fetchedMainSha: "";
      headSha: "";
      mainSha: "";
      outcome: "fail";
      ref: string;
    };

export function collectProductionRepositoryEvidence(options: Parameters<
  typeof collectProductionRepositoryState
>[0]): ProductionRepositoryEvidence {
  try {
    return {
      ...collectProductionRepositoryState(options),
      failure: null,
      outcome: "pass",
    };
  } catch (error) {
    const failure = error instanceof ProductionRepositoryCommandError
      ? {
          context: error.context,
          error: error.message,
          exitCode: error.exitCode,
          stderr: error.stderr,
        }
      : {
          context: "repository validation",
          error: bounded(error instanceof Error ? error.message : error),
          exitCode: 1,
          stderr: "",
        };
    return {
      clean: false,
      failure,
      fetchedMainSha: "",
      headSha: "",
      mainSha: "",
      outcome: "fail",
      ref: options.dispatchRef,
    };
  }
}
