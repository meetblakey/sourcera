import { createHash, randomUUID } from "node:crypto";
import { performance } from "node:perf_hooks";

import { ConvexClient } from "convex/browser";

import { api } from "../convex/_generated/api";
import {
  createConvexFoundationHealthResult,
  readRequiredConvexPreviewIdentity,
} from "../packages/domain/src/convex";

const SAMPLE_COUNT = 20;
const SAMPLE_TIMEOUT_MS = 5_000;

function percentile(values: number[], percentileValue: number) {
  const sorted = [...values].sort((left, right) => left - right);
  const index = Math.max(0, Math.ceil(percentileValue * sorted.length) - 1);
  return sorted[index];
}

async function observeSample(
  client: ConvexClient,
  identity: ReturnType<typeof readRequiredConvexPreviewIdentity>,
  sample: number,
) {
  const nonceHash = createHash("sha256")
    .update(`${identity.commitSha}:${randomUUID()}`)
    .digest("hex");
  const issuedAt = Date.now();
  const startedAt = performance.now();

  try {
    return await new Promise<number>((resolve, reject) => {
      let settled = false;
      let unsubscribe = () => {};
      const timeout = setTimeout(() => {
        settled = true;
        unsubscribe();
        reject(new Error("Reactive observation timed out"));
      }, SAMPLE_TIMEOUT_MS);
      unsubscribe = client.onUpdate(
        api.foundation.observeProbe,
        { commitSha: identity.commitSha, nonceHash },
        (probe) => {
          if (
            settled ||
            !probe ||
            probe.commitSha !== identity.commitSha ||
            probe.nonceHash !== nonceHash
          ) {
            return;
          }
          settled = true;
          clearTimeout(timeout);
          unsubscribe();
          resolve(Math.round(performance.now() - startedAt));
        },
        (error) => {
          if (settled) return;
          settled = true;
          clearTimeout(timeout);
          unsubscribe();
          reject(error);
        },
      );

      void client
        .mutation(api.foundation.recordProbe, {
          commitSha: identity.commitSha,
          environment: identity.environment,
          issuedAt,
          nonceHash,
          sample,
        })
        .catch((error: unknown) => {
          if (settled) return;
          settled = true;
          clearTimeout(timeout);
          unsubscribe();
          reject(error);
        });
    });
  } finally {
    await client.mutation(api.foundation.clearProbe, {
      commitSha: identity.commitSha,
      nonceHash,
    });
  }
}

const identity = readRequiredConvexPreviewIdentity(process.env);
const client = new ConvexClient(identity.deploymentUrl, {
  unsavedChangesWarning: false,
});

try {
  const observations: number[] = [];
  for (let sample = 1; sample <= SAMPLE_COUNT; sample += 1) {
    observations.push(await observeSample(client, identity, sample));
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
      ),
      createConvexFoundationHealthResult(
        process.env,
        {
          assertion: "reactive-observation-p99",
          observationLatencyMs: p99,
          result: passed ? "passed" : "failed",
        },
        checkedAt,
      ),
    ],
    outcome: passed ? "passed" : "failed",
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
          ),
          createConvexFoundationHealthResult(
            process.env,
            {
              assertion: "reactive-observation-p99",
              observationLatencyMs: SAMPLE_TIMEOUT_MS,
              result: "failed",
            },
            checkedAt,
          ),
        ],
        outcome: "failed",
        sampleCount: 0,
        zeroCustomerData: true,
      },
      null,
      2,
    )}\n`,
  );
  process.stderr.write("Convex foundation probe failed without exposing payload data.\n");
  process.exitCode = 1;
} finally {
  await client.close();
}
