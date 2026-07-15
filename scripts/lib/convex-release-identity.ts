const FULL_GIT_COMMIT_SHA = /^(?:[a-f0-9]{40}|[a-f0-9]{64})$/i;

export const CONVEX_RELEASE_IDENTITY_PATH = "convex/releaseIdentity.ts";

const PLACEHOLDER_SOURCE =
  'export const SOURCERA_CONVEX_BUILD_COMMIT_SHA =\n  "__UNSTAMPED_CONVEX_BUILD__";\n';

export function assertConvexReleaseIdentityPlaceholder(source: string) {
  if (source !== PLACEHOLDER_SOURCE) {
    throw new Error(
      "Convex release identity must be the committed unstamped placeholder",
    );
  }
}

export function renderConvexReleaseIdentity(commitSha: string): string {
  if (!FULL_GIT_COMMIT_SHA.test(commitSha)) {
    throw new Error("Convex release identity requires a full Git commit SHA");
  }
  return `export const SOURCERA_CONVEX_BUILD_COMMIT_SHA =\n  "${commitSha.toLowerCase()}";\n`;
}

export function assertControlledConvexReleaseIdentityChange(
  porcelainStatus: string,
) {
  const entries = porcelainStatus.split(/\r?\n/).filter(Boolean);
  if (
    entries.length !== 1 ||
    entries[0] !== ` M ${CONVEX_RELEASE_IDENTITY_PATH}`
  ) {
    throw new Error(
      "Detached Convex release worktree contains an uncontrolled change",
    );
  }
}
