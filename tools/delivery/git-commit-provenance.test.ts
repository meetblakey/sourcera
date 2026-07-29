import { strict as assert } from "node:assert";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  chmodSync,
  existsSync,
  mkdtempSync,
  mkdirSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import { verifyExactGitCommitProvenance } from "./lib/git-commit-provenance.js";
import { LINEAR_AUTHORITY_REQUIREMENT_BASELINE_COMMIT_PATHS } from "./lib/linear-authority-requirement-adoption.js";

interface RepositoryFixture {
  root: string;
  commit: string;
  cleanup(): void;
}

function git(root: string, arguments_: readonly string[]): string {
  return execFileSync("git", ["--no-optional-locks", "-C", root, ...arguments_], {
    encoding: "utf8",
    env: { ...process.env, GIT_OPTIONAL_LOCKS: "0" },
  }).trim();
}

function repository(
  files: Readonly<Record<string, string>> = {
    "alpha.txt": "alpha\n",
    "nested/beta.txt": "beta\n",
  },
): RepositoryFixture {
  const root = mkdtempSync(join(tmpdir(), "sourcera-git-provenance-"));
  git(root, ["init", "--quiet"]);
  git(root, ["config", "user.name", "Sourcera test"]);
  git(root, ["config", "user.email", "sourcera-test@example.invalid"]);
  for (const [path, content] of Object.entries(files)) {
    mkdirSync(join(root, path, ".."), { recursive: true });
    writeFileSync(join(root, path), content);
  }
  git(root, ["add", "--", ...Object.keys(files)]);
  git(root, ["commit", "--quiet", "-m", "fixture"]);
  return {
    root,
    commit: git(root, ["rev-parse", "HEAD"]),
    cleanup: () => rmSync(root, { recursive: true, force: true }),
  };
}

function errorMessage(run: () => unknown): string {
  let thrown: unknown;
  try {
    run();
  } catch (error) {
    thrown = error;
  }
  assert.ok(thrown instanceof Error, "Expected run to throw an Error");
  return thrown.message;
}

test("attests clean regular files at the exact pinned HEAD", () => {
  const fixture = repository();
  try {
    const result = verifyExactGitCommitProvenance({
      repositoryRoot: fixture.root,
      sourceCommit: fixture.commit,
      paths: ["alpha.txt", "nested/beta.txt"],
    });

    assert.deepEqual(result, {
      sourceCommit: fixture.commit,
      headCommit: fixture.commit,
      paths: [
        {
          path: "alpha.txt",
          mode: "100644",
          byteLength: 6,
          sha256: createHash("sha256").update("alpha\n").digest("hex"),
        },
        {
          path: "nested/beta.txt",
          mode: "100644",
          byteLength: 5,
          sha256: createHash("sha256").update("beta\n").digest("hex"),
        },
      ],
    });
  } finally {
    fixture.cleanup();
  }
});

test("ignores dirt outside the explicit allowlist", () => {
  const fixture = repository();
  try {
    writeFileSync(join(fixture.root, "nested/beta.txt"), "dirty outside scope\n");

    assert.doesNotThrow(() =>
      verifyExactGitCommitProvenance({
        repositoryRoot: fixture.root,
        sourceCommit: fixture.commit,
        paths: ["alpha.txt"],
      }),
    );
  } finally {
    fixture.cleanup();
  }
});

test("rejects a pinned commit that is not the repository HEAD", () => {
  const fixture = repository();
  try {
    writeFileSync(join(fixture.root, "next.txt"), "next\n");
    git(fixture.root, ["add", "next.txt"]);
    git(fixture.root, ["commit", "--quiet", "-m", "next"]);

    assert.match(
      errorMessage(() =>
        verifyExactGitCommitProvenance({
          repositoryRoot: fixture.root,
          sourceCommit: fixture.commit,
          paths: ["alpha.txt"],
        }),
      ),
      /pinned sourceCommit does not equal HEAD/i,
    );
  } finally {
    fixture.cleanup();
  }
});

test("rejects unstaged and staged changes within the allowlist", () => {
  for (const staged of [false, true]) {
    const fixture = repository();
    try {
      writeFileSync(join(fixture.root, "alpha.txt"), staged ? "stage\n" : "dirty\n");
      if (staged) git(fixture.root, ["add", "alpha.txt"]);

      assert.match(
        errorMessage(() =>
          verifyExactGitCommitProvenance({
            repositoryRoot: fixture.root,
            sourceCommit: fixture.commit,
            paths: ["alpha.txt"],
          }),
        ),
        /allowlisted path is dirty/i,
      );
    } finally {
      fixture.cleanup();
    }
  }
});

test("Requirement baseline provenance rejects a dirty governed input", () => {
  const files = Object.fromEntries(
    LINEAR_AUTHORITY_REQUIREMENT_BASELINE_COMMIT_PATHS.map((path) => [path, `${path}\n`]),
  );
  for (const path of [
    "delivery/linear-authority-requirement-bootstrap-map.json",
    "delivery/linear-source-policy.json",
  ]) {
    const fixture = repository(files);
    try {
      writeFileSync(join(fixture.root, path), `dirty ${path}\n`);
      assert.match(
        errorMessage(() => verifyExactGitCommitProvenance({
          repositoryRoot: fixture.root,
          sourceCommit: fixture.commit,
          paths: LINEAR_AUTHORITY_REQUIREMENT_BASELINE_COMMIT_PATHS,
        })),
        /allowlisted path is dirty|working bytes differ/i,
      );
    } finally {
      fixture.cleanup();
    }
  }
});

test("compares working bytes even when assume-unchanged hides the change", () => {
  const fixture = repository({ "alpha.txt": "alpha\n" });
  try {
    git(fixture.root, ["update-index", "--assume-unchanged", "alpha.txt"]);
    writeFileSync(join(fixture.root, "alpha.txt"), "omega\n");
    assert.equal(git(fixture.root, [
      "status",
      "--porcelain=v1",
      "--untracked-files=all",
      "--",
      "alpha.txt",
    ]), "");

    assert.match(
      errorMessage(() =>
        verifyExactGitCommitProvenance({
          repositoryRoot: fixture.root,
          sourceCommit: fixture.commit,
          paths: ["alpha.txt"],
        }),
      ),
      /working bytes differ from the pinned commit/i,
    );
  } finally {
    fixture.cleanup();
  }
});

test("rejects index flags that can hide future allowlist drift", () => {
  const fixture = repository({ "alpha.txt": "alpha\n" });
  try {
    git(fixture.root, ["update-index", "--assume-unchanged", "alpha.txt"]);

    assert.match(
      errorMessage(() =>
        verifyExactGitCommitProvenance({
          repositoryRoot: fixture.root,
          sourceCommit: fixture.commit,
          paths: ["alpha.txt"],
        }),
      ),
      /index flags can hide drift/i,
    );
  } finally {
    fixture.cleanup();
  }
});

test("rejects unsafe, empty, and duplicate allowlist paths", () => {
  const fixture = repository();
  try {
    const unsafePathSets = [
      [] as string[],
      ["/alpha.txt"],
      ["../alpha.txt"],
      ["nested/../alpha.txt"],
      ["./alpha.txt"],
      ["nested\\beta.txt"],
      ["alpha.txt", "alpha.txt"],
    ];
    for (const paths of unsafePathSets) {
      assert.match(
        errorMessage(() =>
          verifyExactGitCommitProvenance({
            repositoryRoot: fixture.root,
            sourceCommit: fixture.commit,
            paths,
          }),
        ),
        /allowlist|unsafe|duplicate/i,
      );
    }
  } finally {
    fixture.cleanup();
  }
});

test("rejects missing commits and paths", () => {
  const fixture = repository();
  try {
    assert.match(
      errorMessage(() =>
        verifyExactGitCommitProvenance({
          repositoryRoot: fixture.root,
          sourceCommit: "0".repeat(40),
          paths: ["alpha.txt"],
        }),
      ),
      /pinned sourceCommit is not a commit/i,
    );
    assert.match(
      errorMessage(() =>
        verifyExactGitCommitProvenance({
          repositoryRoot: fixture.root,
          sourceCommit: fixture.commit,
          paths: ["missing.txt"],
        }),
      ),
      /missing from the pinned commit/i,
    );
  } finally {
    fixture.cleanup();
  }
});

test("rejects executable-mode drift in the index or working tree", () => {
  const fixture = repository({ "script.sh": "#!/bin/sh\nexit 0\n" });
  try {
    chmodSync(join(fixture.root, "script.sh"), 0o755);

    assert.match(
      errorMessage(() =>
        verifyExactGitCommitProvenance({
          repositoryRoot: fixture.root,
          sourceCommit: fixture.commit,
          paths: ["script.sh"],
        }),
      ),
      /allowlisted path is dirty|mode differs/i,
    );
  } finally {
    fixture.cleanup();
  }
});

test("rejects symlink and gitlink entries instead of dereferencing them", () => {
  const symlinkFixture = repository({ "target.txt": "target\n" });
  try {
    symlinkSync("target.txt", join(symlinkFixture.root, "link.txt"));
    git(symlinkFixture.root, ["add", "link.txt"]);
    git(symlinkFixture.root, ["commit", "--quiet", "-m", "symlink"]);
    const commit = git(symlinkFixture.root, ["rev-parse", "HEAD"]);

    assert.match(
      errorMessage(() =>
        verifyExactGitCommitProvenance({
          repositoryRoot: symlinkFixture.root,
          sourceCommit: commit,
          paths: ["link.txt"],
        }),
      ),
      /symlink|regular blob/i,
    );
  } finally {
    symlinkFixture.cleanup();
  }

  const gitlinkFixture = repository();
  try {
    git(gitlinkFixture.root, [
      "update-index",
      "--add",
      "--cacheinfo",
      `160000,${gitlinkFixture.commit},vendor/component`,
    ]);
    git(gitlinkFixture.root, ["commit", "--quiet", "-m", "gitlink"]);
    const commit = git(gitlinkFixture.root, ["rev-parse", "HEAD"]);

    assert.match(
      errorMessage(() =>
        verifyExactGitCommitProvenance({
          repositoryRoot: gitlinkFixture.root,
          sourceCommit: commit,
          paths: ["vendor/component"],
        }),
      ),
      /gitlink|submodule|regular blob/i,
    );
  } finally {
    gitlinkFixture.cleanup();
  }
});

test("does not create an index lock or change the index bytes", () => {
  const fixture = repository();
  try {
    const indexPath = git(fixture.root, ["rev-parse", "--git-path", "index"]);
    const absoluteIndexPath = indexPath.startsWith("/")
      ? indexPath
      : join(fixture.root, indexPath);
    const before = readFileSync(absoluteIndexPath);

    verifyExactGitCommitProvenance({
      repositoryRoot: fixture.root,
      sourceCommit: fixture.commit,
      paths: ["alpha.txt"],
    });

    assert.deepEqual(readFileSync(absoluteIndexPath), before);
    assert.equal(existsSync(`${absoluteIndexPath}.lock`), false);
  } finally {
    fixture.cleanup();
  }
});
