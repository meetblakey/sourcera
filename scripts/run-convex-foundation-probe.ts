import { createHash, createHmac, randomUUID } from "node:crypto";
import { performance } from "node:perf_hooks";

import { ConvexClient } from "convex/browser";

import productionTargets from "../config/production-targets.json";
import { api } from "../convex/_generated/api";
import {
  assertConvexDeploymentUrlNamesDeployment,
  createConvexProductionProbePayload,
  type ConvexProductionProbeOperation,
  createConvexFoundationHealthResult,
  readRequiredConvexDeploymentClientIdentity,
} from "../packages/domain/src/convex";
import { withConvexNetworkTimeout } from "./lib/convex-network-timeout";
import { readPinnedConvexProductionTarget } from "./lib/convex-production-target";

const SAMPLE_COUNT = 20;
const SAMPLE_TIMEOUT_MS = 5_000;
const SHA256 = /^[a-f0-9]{64}$/;

function percentile(values: number[], percentileValue: number) {
  const sorted = [...values].sort((left, right) => left - right);
  const index = Math.max(0, Math.ceil(percentileValue * sorted.length) - 1);
  return sorted[index];
}

function productionProbeAuthorization(
  operation: ConvexProductionProbeOperation,
  identity: {
    commitSha: string;
    deploymentName: string;
    environment: string;
  },
  issuedAt: number,
  nonceHash: string,
  sample: number,
) {
  const secret = process.env.SOURCERA_CONVEX_CANARY_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error(
      "SOURCERA_CONVEX_CANARY_SECRET must be at least 32 characters",
    );
  }
  return createHmac("sha256", secret)
    .update(
      createConvexProductionProbePayload(operation, {
        commitSha: identity.commitSha,
        deploymentName: identity.deploymentName,
        environment: identity.environment,
        issuedAt,
        nonceHash,
        releaseApprovedSha: identity.commitSha,
        sample,
      }),
    )
    .digest("hex");
}

function previewProbeCapability(
  identity: {
    commitSha: string;
    environment: string;
    previewName?: string;
  },
): string {
  const token = process.env.SOURCERA_CONVEX_PREVIEW_PROBE_TOKEN;
  if (!token || !SHA256.test(token)) {
    throw new Error(
      "SOURCERA_CONVEX_PREVIEW_PROBE_TOKEN must be a short-lived commit-bound token",
    );
  }
  if (!identity.previewName) {
    throw new Error("Preview probe requires the commit-bound Preview name");
  }
  return token;
}

async function observeSample(
  client: ConvexClient,
  identity: {
    commitSha: string;
    deploymentName?: string;
    deploymentUrl: string;
    environment: string;
    previewName?: string;
  },
  sample: number,
  onCleanupConfirmed: () => void,
) {
  const nonceHash = createHash("sha256")
    .update(`${identity.commitSha}:${randomUUID()}`)
    .digest("hex");
  const issuedAt = Date.now();
  const productionDeploymentName =
    identity.environment === "production" ? identity.deploymentName : undefined;
  if (identity.environment === "production" && !productionDeploymentName) {
    throw new Error("Production probe requires the pinned deployment name");
  }

  let observation:
    | {
        latencyMs: number;
        runtimeIdentity?:
          | { buildCommitSha: string; deploymentName: string }
          | {
              buildCommitSha: string;
              buildEnvironment: string;
              buildPreviewName: string;
              deploymentName: string;
            };
      }
    | undefined;
  let recordCompletion: Promise<unknown> | undefined;
  try {
    observation = await new Promise<{
      latencyMs: number;
      runtimeIdentity?:
        | { buildCommitSha: string; deploymentName: string }
        | {
            buildCommitSha: string;
            buildEnvironment: string;
            buildPreviewName: string;
            deploymentName: string;
          };
    }>((resolve, reject) => {
      let settled = false;
      let unsubscribe = () => {};
      const timeout = setTimeout(() => {
        settled = true;
        unsubscribe();
        reject(new Error("Reactive observation timed out"));
      }, SAMPLE_TIMEOUT_MS);
      const onProbe = (
        probe: {
          buildCommitSha?: string;
          buildEnvironment?: string;
          buildPreviewName?: string;
          commitSha: string;
          deploymentName?: string;
          environment: string;
          issuedAt: number;
          nonceHash: string;
          sample: number;
        } | null,
      ) => {
        if (
          settled ||
          !probe ||
          probe.commitSha !== identity.commitSha ||
          probe.environment !== identity.environment ||
          probe.issuedAt !== issuedAt ||
          probe.nonceHash !== nonceHash ||
          probe.sample !== sample
        ) {
          return;
        }
        if (
          identity.environment === "production" &&
          (probe.buildCommitSha !== identity.commitSha ||
            probe.deploymentName !== productionDeploymentName)
        ) {
          settled = true;
          clearTimeout(timeout);
          unsubscribe();
          reject(
            new Error("Convex runtime identity does not match the release"),
          );
          return;
        }
        if (identity.environment !== "production") {
          try {
            if (
              !identity.previewName ||
              probe.buildCommitSha !== identity.commitSha ||
              probe.buildEnvironment !== identity.environment ||
              probe.buildPreviewName !== identity.previewName ||
              !probe.deploymentName
            ) {
              throw new Error("Convex Preview runtime identity does not match");
            }
            assertConvexDeploymentUrlNamesDeployment(
              probe.deploymentName,
              identity.deploymentUrl,
            );
          } catch {
            settled = true;
            clearTimeout(timeout);
            unsubscribe();
            reject(
              new Error("Convex runtime identity does not match the release"),
            );
            return;
          }
        }
        settled = true;
        clearTimeout(timeout);
        unsubscribe();
        resolve({
          latencyMs: Math.round(performance.now() - startedAt),
          ...(identity.environment === "production"
            ? {
                runtimeIdentity: {
                  buildCommitSha: probe.buildCommitSha!,
                  deploymentName: probe.deploymentName!,
                },
              }
            : {
                runtimeIdentity: {
                  buildCommitSha: probe.buildCommitSha!,
                  buildEnvironment: probe.buildEnvironment!,
                  buildPreviewName: probe.buildPreviewName!,
                  deploymentName: probe.deploymentName!,
                },
              }),
        });
      };
      const onError = (error: Error) => {
        if (settled) return;
        settled = true;
        clearTimeout(timeout);
        unsubscribe();
        reject(error);
      };
      unsubscribe =
        identity.environment === "production"
          ? client.onUpdate(
              api.foundation.observeProductionProbe,
              {
                authorization: productionProbeAuthorization(
                  "observe",
                  {
                    ...identity,
                    deploymentName: productionDeploymentName!,
                  },
                  issuedAt,
                  nonceHash,
                  sample,
                ),
                commitSha: identity.commitSha,
                deploymentName: productionDeploymentName!,
                environment: identity.environment,
                issuedAt,
                nonceHash,
                releaseApprovedSha: identity.commitSha,
                sample,
              },
              onProbe,
              onError,
            )
          : client.onUpdate(
              api.foundation.observeProbe,
              {
                commitSha: identity.commitSha,
                environment: identity.environment,
                issuedAt,
                nonceHash,
                sample,
              },
              onProbe,
              onError,
            );

      const startedAt = performance.now();
      recordCompletion =
        identity.environment === "production"
          ? withConvexNetworkTimeout(
              client.mutation(api.foundation.recordProductionProbe, {
                authorization: productionProbeAuthorization(
                  "record",
                  {
                    ...identity,
                    deploymentName: productionDeploymentName!,
                  },
                  issuedAt,
                  nonceHash,
                  sample,
                ),
                commitSha: identity.commitSha,
                deploymentName: productionDeploymentName!,
                environment: identity.environment,
                issuedAt,
                nonceHash,
                releaseApprovedSha: identity.commitSha,
                sample,
              }),
              SAMPLE_TIMEOUT_MS,
              "Convex production probe record",
            )
          : withConvexNetworkTimeout(
              client.mutation(api.foundation.recordProbe, {
                authorization: previewProbeCapability(identity),
                commitSha: identity.commitSha,
                environment: identity.environment,
                issuedAt,
                nonceHash,
                previewName: identity.previewName!,
                sample,
              }),
              SAMPLE_TIMEOUT_MS,
              "Convex Preview probe record",
            );
      void recordCompletion.catch((error: unknown) => {
        if (settled) return;
        settled = true;
        clearTimeout(timeout);
        unsubscribe();
        reject(error);
      });
    });
  } finally {
    await recordCompletion?.catch(() => undefined);
    const cleared =
      identity.environment === "production"
        ? await withConvexNetworkTimeout(
            client.mutation(api.foundation.clearProductionProbe, {
              authorization: productionProbeAuthorization(
                "clear",
                {
                  ...identity,
                  deploymentName: productionDeploymentName!,
                },
                issuedAt,
                nonceHash,
                sample,
              ),
              commitSha: identity.commitSha,
              deploymentName: productionDeploymentName!,
              environment: identity.environment,
              issuedAt,
              nonceHash,
              releaseApprovedSha: identity.commitSha,
              sample,
            }),
            SAMPLE_TIMEOUT_MS,
            "Convex production probe cleanup",
          )
        : await withConvexNetworkTimeout(
            client.mutation(api.foundation.clearProbe, {
              authorization: previewProbeCapability(identity),
              commitSha: identity.commitSha,
              environment: identity.environment,
              issuedAt,
              nonceHash,
              previewName: identity.previewName!,
              sample,
            }),
            SAMPLE_TIMEOUT_MS,
            "Convex Preview probe cleanup",
          );
    if (!cleared) {
      throw new Error("Convex foundation probe cleanup was not confirmed");
    }
    onCleanupConfirmed();
  }
  if (!observation) throw new Error("Convex foundation probe returned no result");
  return { ...observation, cleanupConfirmed: true as const };
}

const runtimeEnvironment =
  process.env.SOURCERA_ENV ??
  process.env.VERCEL_TARGET_ENV ??
  process.env.VERCEL_ENV;
const productionTarget =
  runtimeEnvironment === "production"
    ? readPinnedConvexProductionTarget(productionTargets)
    : undefined;
const identity = readRequiredConvexDeploymentClientIdentity(
  process.env,
  productionTarget,
);
const client = new ConvexClient(identity.deploymentUrl, {
  unsavedChangesWarning: false,
});

void (async () => {
  const observations: number[] = [];
  let attemptedSampleCount = 0;
  let clearedSampleCount = 0;
  let runtimeIdentity:
    | { buildCommitSha: string; deploymentName: string }
    | {
        buildCommitSha: string;
        buildEnvironment: string;
        buildPreviewName: string;
        deploymentName: string;
      }
    | undefined;
  try {
    for (let sample = 1; sample <= SAMPLE_COUNT; sample += 1) {
      attemptedSampleCount += 1;
      const observation = await observeSample(client, identity, sample, () => {
        clearedSampleCount += 1;
      });
      if (!observation.cleanupConfirmed) {
        throw new Error("Convex foundation probe cleanup was not confirmed");
      }
      observations.push(observation.latencyMs);
      if (observation.runtimeIdentity) {
        if (
          runtimeIdentity &&
          JSON.stringify(runtimeIdentity) !==
            JSON.stringify(observation.runtimeIdentity)
        ) {
          throw new Error("Convex runtime identity changed during the canary");
        }
        runtimeIdentity = observation.runtimeIdentity;
      }
    }
    if (!runtimeIdentity) {
      throw new Error("Convex canary returned no runtime identity");
    }

    const p95 = percentile(observations, 0.95);
    const p99 = percentile(observations, 0.99);
    const passed = p95 <= 500 && p99 <= 1_000;
    const checkedAt = new Date();
    const receipt = {
      assertions: [
        createConvexFoundationHealthResult(
          process.env,
          {
            assertion: "reactive-observation-p95",
            observationLatencyMs: p95,
            result: passed ? "passed" : "failed",
          },
          checkedAt,
          productionTarget,
        ),
        createConvexFoundationHealthResult(
          process.env,
          {
            assertion: "reactive-observation-p99",
            observationLatencyMs: p99,
            result: passed ? "passed" : "failed",
          },
          checkedAt,
          productionTarget,
        ),
      ],
      cleanup: {
        clearedSampleCount,
        result: "passed" as const,
      },
      attemptedSampleCount,
      outcome: passed ? "passed" : "failed",
      ...(runtimeIdentity ? { runtimeIdentity } : {}),
      sampleCount: observations.length,
      zeroCustomerData: true,
    };
    process.stdout.write(`${JSON.stringify(receipt, null, 2)}\n`);
    if (!passed) process.exitCode = 1;
  } catch {
    const checkedAt = new Date();
    process.stdout.write(
      `${JSON.stringify(
        {
          assertions: [
            createConvexFoundationHealthResult(
              process.env,
              {
                assertion: "reactive-observation-p95",
                observationLatencyMs: SAMPLE_TIMEOUT_MS,
                result: "failed",
              },
              checkedAt,
              productionTarget,
            ),
            createConvexFoundationHealthResult(
              process.env,
              {
                assertion: "reactive-observation-p99",
                observationLatencyMs: SAMPLE_TIMEOUT_MS,
                result: "failed",
              },
              checkedAt,
              productionTarget,
            ),
          ],
          attemptedSampleCount,
          cleanup: {
            clearedSampleCount,
            result:
              clearedSampleCount === attemptedSampleCount
                ? ("passed" as const)
                : ("failed" as const),
          },
          ...(runtimeIdentity ? { runtimeIdentity } : {}),
          outcome: "failed",
          sampleCount: observations.length,
          zeroCustomerData: true,
        },
        null,
        2,
      )}\n`,
    );
    process.stderr.write(
      "Convex foundation probe failed without exposing payload data.\n",
    );
    process.exitCode = 1;
  } finally {
    try {
      await withConvexNetworkTimeout(
        client.close(),
        SAMPLE_TIMEOUT_MS,
        "Convex client close",
      );
    } catch {
      process.stderr.write(
        "Convex foundation probe client shutdown timed out or failed.\n",
      );
      process.exitCode = 1;
    }
  }
})();
