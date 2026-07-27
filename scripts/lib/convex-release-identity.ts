import { createCommitBoundConvexPreviewName } from "@sourcera/domain/convex";

const FULL_GIT_COMMIT_SHA = /^[a-f0-9]{40}$/;
const SHA256 = /^[a-f0-9]{64}$/;
const PREVIEW_NAME = /^[a-z0-9](?:[a-z0-9-]{0,62})$/;
const CONVEX_BUILD_ENVIRONMENTS = new Set([
  "ci",
  "preview",
  "production",
  "staging",
  "test",
]);

export const CONVEX_RELEASE_IDENTITY_PATH = "convex/releaseIdentity.ts";

const PLACEHOLDER_SOURCE =
  'export const SOURCERA_CONVEX_BUILD_COMMIT_SHA: string =\n  "__UNSTAMPED_CONVEX_BUILD__";\nexport const SOURCERA_CONVEX_BUILD_ENVIRONMENT: string =\n  "__UNSTAMPED_CONVEX_ENVIRONMENT__";\nexport const SOURCERA_CONVEX_BUILD_PREVIEW_NAME: string =\n  "__UNSTAMPED_CONVEX_PREVIEW_NAME__";\nexport const SOURCERA_CONVEX_PREVIEW_PROBE_TOKEN_SHA256: string =\n  "__UNSTAMPED_CONVEX_PREVIEW_PROBE_TOKEN_SHA256__";\nexport const SOURCERA_CONVEX_PREVIEW_PROBE_EXPIRES_AT: number = 0;\n';

const LEGACY_PLACEHOLDER_SOURCES = new Set([
  'export const SOURCERA_CONVEX_BUILD_COMMIT_SHA =\n  "__UNSTAMPED_CONVEX_BUILD__";\n',
  'export const SOURCERA_CONVEX_BUILD_COMMIT_SHA: string =\n  "__UNSTAMPED_CONVEX_BUILD__";\nexport const SOURCERA_CONVEX_BUILD_ENVIRONMENT: string =\n  "__UNSTAMPED_CONVEX_ENVIRONMENT__";\nexport const SOURCERA_CONVEX_BUILD_PREVIEW_NAME: string =\n  "__UNSTAMPED_CONVEX_PREVIEW_NAME__";\n',
  'export const SOURCERA_CONVEX_BUILD_COMMIT_SHA: string =\n  "__UNSTAMPED_CONVEX_BUILD__";\nexport const SOURCERA_CONVEX_BUILD_ENVIRONMENT: string =\n  "__UNSTAMPED_CONVEX_ENVIRONMENT__";\nexport const SOURCERA_CONVEX_BUILD_PREVIEW_NAME: string =\n  "__UNSTAMPED_CONVEX_PREVIEW_NAME__";\nexport const SOURCERA_CONVEX_PREVIEW_PROBE_TOKEN_SHA256: string =\n  "__UNSTAMPED_CONVEX_PREVIEW_PROBE_TOKEN_SHA256__";\n',
]);

export function assertConvexReleaseIdentityPlaceholder(source: string) {
  if (source !== PLACEHOLDER_SOURCE) {
    throw new Error(
      "Convex release identity must be the committed unstamped placeholder",
    );
  }
}

export function assertConvexRollbackReleaseIdentityPlaceholder(source: string) {
  if (source !== PLACEHOLDER_SOURCE && !LEGACY_PLACEHOLDER_SOURCES.has(source)) {
    throw new Error(
      "Convex rollback identity must be a committed unstamped placeholder",
    );
  }
}

export function assertVercelConvexPreviewStampSource(
  environment: Record<string, string | undefined>,
  commitSha: string,
  previewName: string,
) {
  if (
    environment.VERCEL !== "1" ||
    environment.VERCEL_GIT_COMMIT_SHA !== commitSha ||
    !environment.VERCEL_GIT_COMMIT_REF ||
    createCommitBoundConvexPreviewName(
      environment.VERCEL_GIT_COMMIT_REF,
      commitSha,
    ) !== previewName
  ) {
    throw new Error("Vercel source metadata does not match the Preview stamp");
  }
}

export function renderConvexReleaseIdentity(
  commitSha: string,
  environment: string,
  previewName?: string,
  previewProbeTokenSha256?: string,
  previewProbeExpiresAt?: number,
): string {
  if (!FULL_GIT_COMMIT_SHA.test(commitSha)) {
    throw new Error("Convex release identity requires a full Git commit SHA");
  }
  if (!CONVEX_BUILD_ENVIRONMENTS.has(environment)) {
    throw new Error("Convex release identity requires a valid environment");
  }
  if (environment === "production") {
    if (
      previewName !== undefined ||
      previewProbeTokenSha256 !== undefined ||
      previewProbeExpiresAt !== undefined
    ) {
      throw new Error(
        "Production Convex identity cannot name or authorize a Preview",
      );
    }
  } else if (
    !previewName ||
    !PREVIEW_NAME.test(previewName) ||
    !previewName.endsWith(`-${commitSha}`) ||
    !previewProbeTokenSha256 ||
    !SHA256.test(previewProbeTokenSha256) ||
    previewProbeExpiresAt === undefined ||
    !Number.isSafeInteger(previewProbeExpiresAt) ||
    previewProbeExpiresAt! <= 0
  ) {
    throw new Error(
      "Preview Convex identity requires its commit-bound name and probe token digest",
    );
  }
  const stampedPreviewName =
    environment === "production" ? "__NO_CONVEX_PREVIEW__" : previewName!;
  const stampedProbeTokenSha256 =
    environment === "production"
      ? "__NO_CONVEX_PREVIEW_PROBE_TOKEN__"
      : previewProbeTokenSha256!;
  const stampedProbeExpiresAt =
    environment === "production" ? 0 : previewProbeExpiresAt!;
  return `export const SOURCERA_CONVEX_BUILD_COMMIT_SHA: string =\n  "${commitSha}";\nexport const SOURCERA_CONVEX_BUILD_ENVIRONMENT: string =\n  "${environment}";\nexport const SOURCERA_CONVEX_BUILD_PREVIEW_NAME: string =\n  "${stampedPreviewName}";\nexport const SOURCERA_CONVEX_PREVIEW_PROBE_TOKEN_SHA256: string =\n  "${stampedProbeTokenSha256}";\nexport const SOURCERA_CONVEX_PREVIEW_PROBE_EXPIRES_AT: number = ${stampedProbeExpiresAt};\n`;
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
