import {
  createCommitBoundConvexPreviewName,
  type ConvexEnvironment,
  type ConvexProductionTarget,
  readConvexProductionTarget,
  readRequiredConvexProductionClientIdentity,
  readRequiredConvexPreviewKeyIdentity,
} from "@sourcera/domain/convex";

export type ConvexVercelWorkspace =
  "@sourcera/buyer" | "@sourcera/seller" | null;

export interface ConvexExecutionStep {
  arguments: string[];
  command: "npm" | "npx";
  name: "build" | "deploy" | "stamp" | "validate";
}

export interface ConvexVercelDeploymentPlan {
  environmentOverrides: Record<string, string>;
  mode: "preview" | "production-client";
  steps: ConvexExecutionStep[];
  target: string;
}

export function isRetryableConvexPreviewDeploymentFailure(output: string) {
  return (
    /(?:api\.convex\.dev|InternalServerError|Convex)/i.test(output) &&
    /(?:\b(?:429|500|502|503|504)\b[^\n]*(?:Too Many Requests|Internal Server Error|Bad Gateway|Service Unavailable|Gateway Timeout)|ECONNRESET|ETIMEDOUT|Try again later)/i.test(
      output,
    )
  );
}

function readWorkspace(workspace: string | null): ConvexVercelWorkspace {
  if (
    workspace !== null &&
    workspace !== "@sourcera/buyer" &&
    workspace !== "@sourcera/seller"
  ) {
    throw new Error("--workspace must be @sourcera/buyer or @sourcera/seller");
  }
  return workspace;
}

function applicationBuildArguments(workspace: ConvexVercelWorkspace): string[] {
  return workspace
    ? ["run", "build", "--workspace", workspace]
    : ["run", "build"];
}

export function createConvexVercelDeploymentPlan(
  sourceEnvironment: ConvexEnvironment,
  requestedWorkspace: string | null,
  repositoryCommitSha: string,
  pinnedProductionTarget?: ConvexProductionTarget,
): ConvexVercelDeploymentPlan {
  const workspace = readWorkspace(requestedWorkspace);
  if (sourceEnvironment.VERCEL !== "1" || !sourceEnvironment.VERCEL_ENV) {
    throw new Error("Vercel-owned VERCEL and VERCEL_ENV are required");
  }
  const commitSha = sourceEnvironment.VERCEL_GIT_COMMIT_SHA;
  if (!commitSha) {
    throw new Error("VERCEL_GIT_COMMIT_SHA is required");
  }
  if (commitSha !== repositoryCommitSha) {
    throw new Error(
      "VERCEL_GIT_COMMIT_SHA must match the checked-out Git commit",
    );
  }
  if (
    sourceEnvironment.SOURCERA_COMMIT_SHA &&
    sourceEnvironment.SOURCERA_COMMIT_SHA !== repositoryCommitSha
  ) {
    throw new Error(
      "SOURCERA_COMMIT_SHA must match the checked-out Git commit",
    );
  }

  const runtimeEnvironment =
    sourceEnvironment.SOURCERA_ENV ??
    sourceEnvironment.VERCEL_TARGET_ENV ??
    sourceEnvironment.VERCEL_ENV;
  const vercelIsProduction = sourceEnvironment.VERCEL_ENV === "production";
  const sourceraIsProduction = runtimeEnvironment === "production";
  if (vercelIsProduction !== sourceraIsProduction) {
    throw new Error("SOURCERA_ENV must agree with VERCEL_ENV production scope");
  }

  const environmentOverrides = {
    SOURCERA_COMMIT_SHA: repositoryCommitSha,
    SOURCERA_ENV: runtimeEnvironment,
  };

  if (vercelIsProduction) {
    if (!pinnedProductionTarget) {
      throw new Error("Convex production target is not repo-pinned");
    }
    if (sourceEnvironment.CONVEX_DEPLOY_KEY) {
      throw new Error("CONVEX_DEPLOY_KEY is forbidden in Vercel Production");
    }
    if (sourceEnvironment.SOURCERA_CONVEX_CANARY_SECRET) {
      throw new Error(
        "SOURCERA_CONVEX_CANARY_SECRET is forbidden in Vercel Production",
      );
    }
    if (sourceEnvironment.SOURCERA_CONVEX_PREVIEW_PROBE_SEED) {
      throw new Error(
        "SOURCERA_CONVEX_PREVIEW_PROBE_SEED is forbidden in Vercel Production",
      );
    }
    const target = readConvexProductionTarget(
      pinnedProductionTarget.deploymentName,
      pinnedProductionTarget.deploymentUrl,
    );
    const productionOverrides = {
      ...environmentOverrides,
      NEXT_PUBLIC_CONVEX_URL: target.deploymentUrl,
    };
    readRequiredConvexProductionClientIdentity(
      { ...sourceEnvironment, ...productionOverrides },
      target,
    );

    return {
      environmentOverrides: productionOverrides,
      mode: "production-client",
      steps: [
        {
          arguments: [
            "tsx",
            "scripts/validate-convex-env.ts",
            "--phase",
            "client",
          ],
          command: "npx",
          name: "validate",
        },
        {
          arguments: applicationBuildArguments(workspace),
          command: "npm",
          name: "build",
        },
      ],
      target: target.deploymentName,
    };
  }

  const previewSource = sourceEnvironment.VERCEL_GIT_COMMIT_REF;
  if (!previewSource) {
    throw new Error("VERCEL_GIT_COMMIT_REF is required for Preview delivery");
  }
  const previewName = createCommitBoundConvexPreviewName(
    previewSource,
    repositoryCommitSha,
  );
  const previewOverrides = {
    ...environmentOverrides,
    CONVEX_PREVIEW_NAME: previewName,
  };
  readRequiredConvexPreviewKeyIdentity({
    ...sourceEnvironment,
    ...previewOverrides,
  });
  const buildCommand = workspace
    ? `npm run validate:convex-schema && tsx scripts/validate-convex-env.ts --phase full && npm run build --workspace ${workspace}`
    : "npm run validate:convex-schema && tsx scripts/validate-convex-env.ts --phase full && npm run build";

  return {
    environmentOverrides: previewOverrides,
    mode: "preview",
    steps: [
      {
        arguments: ["run", "validate:convex-schema"],
        command: "npm",
        name: "validate",
      },
      {
        arguments: ["run", "--silent", "convex:stamp:preview"],
        command: "npm",
        name: "stamp",
      },
      {
        arguments: [
          "convex",
          "deploy",
          "--preview-name",
          previewName,
          "--cmd",
          buildCommand,
          "--cmd-url-env-var-name",
          "NEXT_PUBLIC_CONVEX_URL",
          "--message",
          repositoryCommitSha,
        ],
        command: "npx",
        name: "deploy",
      },
    ],
    target: previewName,
  };
}
