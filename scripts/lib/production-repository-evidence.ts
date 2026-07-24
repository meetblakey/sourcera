import { spawnSync } from "node:child_process";
import { realpathSync } from "node:fs";

const FULL_GIT_SHA = /^[a-f0-9]{40}$/i;

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
      maxBuffer: 64 * 1024 * 1024,
    });
    if (result.error || result.status !== 0) {
      throw new Error(`${context} failed`);
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
