import { v } from "convex/values";

import {
  createConvexProductionProbePayload,
  type ConvexProductionProbeOperation,
} from "../packages/domain/src/convex";
import { mutation, query } from "./_generated/server";
import {
  assertConvexPreviewProbeCapabilityActive,
  assertConvexPreviewProbeCleanupRuntime,
  assertConvexPreviewProbeRuntime,
  foundationProbePayloadMatches,
  isFoundationProbeExpired,
  MAX_ACTIVE_PREVIEW_PROBES,
} from "./lib/foundationProbe";
import {
  SOURCERA_CONVEX_BUILD_COMMIT_SHA,
  SOURCERA_CONVEX_BUILD_ENVIRONMENT,
  SOURCERA_CONVEX_BUILD_PREVIEW_NAME,
  SOURCERA_CONVEX_PREVIEW_PROBE_EXPIRES_AT,
  SOURCERA_CONVEX_PREVIEW_PROBE_TOKEN_SHA256,
} from "./releaseIdentity";

const FULL_GIT_COMMIT_SHA = /^(?:[a-f0-9]{40}|[a-f0-9]{64})$/i;
const SHA256 = /^[a-f0-9]{64}$/;
const PRODUCTION_PROBE_MAX_SKEW_MS = 5 * 60 * 1_000;

const probeResult = v.object({
  buildCommitSha: v.string(),
  buildEnvironment: v.string(),
  buildPreviewName: v.string(),
  commitSha: v.string(),
  deploymentName: v.string(),
  environment: v.string(),
  issuedAt: v.number(),
  nonceHash: v.string(),
  sample: v.number(),
});

const productionProbeResult = v.object({
  buildCommitSha: v.string(),
  commitSha: v.string(),
  deploymentName: v.string(),
  environment: v.string(),
  issuedAt: v.number(),
  nonceHash: v.string(),
  sample: v.number(),
});

async function productionProbeAuthorization(
  operation: ConvexProductionProbeOperation,
  args: {
    commitSha: string;
    deploymentName: string;
    environment: string;
    issuedAt: number;
    nonceHash: string;
    releaseApprovedSha: string;
    sample: number;
  },
) {
  const secret = process.env.SOURCERA_CONVEX_CANARY_SECRET;
  if (!secret || secret.length < 32) return null;
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { hash: "SHA-256", name: "HMAC" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(
      createConvexProductionProbePayload(operation, args),
    ),
  );
  return Array.from(new Uint8Array(signature), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
}

function constantTimeEqual(left: string, right: string) {
  if (left.length !== right.length) return false;
  let difference = 0;
  for (let index = 0; index < left.length; index += 1) {
    difference |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }
  return difference === 0;
}

async function validatePreviewProbe(
  operation: "clear" | "record",
  args: {
    authorization: string;
    commitSha: string;
    environment: string;
    issuedAt: number;
    nonceHash: string;
    previewName: string;
    sample: number;
  },
) {
  assertConvexPreviewProbeCapabilityActive(
    SOURCERA_CONVEX_PREVIEW_PROBE_EXPIRES_AT,
  );
  const runtimeIdentity = {
    commitSha: SOURCERA_CONVEX_BUILD_COMMIT_SHA,
    environment: SOURCERA_CONVEX_BUILD_ENVIRONMENT,
    previewName: SOURCERA_CONVEX_BUILD_PREVIEW_NAME,
  };
  if (operation === "record") {
    assertConvexPreviewProbeRuntime(args, runtimeIdentity);
  } else {
    assertConvexPreviewProbeCleanupRuntime(args, runtimeIdentity);
  }
  if (args.previewName !== SOURCERA_CONVEX_BUILD_PREVIEW_NAME) {
    throw new Error("Preview probe does not match the deployed Preview build");
  }
  if (
    !SHA256.test(args.authorization) ||
    !SHA256.test(SOURCERA_CONVEX_PREVIEW_PROBE_TOKEN_SHA256)
  ) {
    throw new Error("Preview probe authorization failed");
  }
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(args.authorization),
  );
  const actual = Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
  if (
    !constantTimeEqual(
      SOURCERA_CONVEX_PREVIEW_PROBE_TOKEN_SHA256,
      actual,
    )
  ) {
    throw new Error("Preview probe authorization failed");
  }
}

async function validateProductionProbe(
  operation: ConvexProductionProbeOperation,
  args: {
    authorization: string;
    commitSha: string;
    deploymentName: string;
    environment: string;
    issuedAt: number;
    nonceHash: string;
    releaseApprovedSha: string;
    sample: number;
  },
  deployedDeploymentName: string,
) {
  if (!FULL_GIT_COMMIT_SHA.test(args.commitSha)) {
    throw new Error("commitSha must be a Git commit SHA");
  }
  if (
    args.environment !== "production" ||
    args.releaseApprovedSha !== args.commitSha
  ) {
    throw new Error("production probe must match the approved release");
  }
  if (
    args.commitSha !== SOURCERA_CONVEX_BUILD_COMMIT_SHA ||
    SOURCERA_CONVEX_BUILD_ENVIRONMENT !== "production" ||
    args.deploymentName !== deployedDeploymentName
  ) {
    throw new Error("production probe does not match the deployed build");
  }
  if (!SHA256.test(args.nonceHash)) {
    throw new Error("nonceHash must be a SHA-256 digest");
  }
  if (!Number.isInteger(args.sample) || args.sample < 1 || args.sample > 100) {
    throw new Error("sample must be an integer from 1 to 100");
  }
  if (
    !Number.isSafeInteger(args.issuedAt) ||
    Math.abs(Date.now() - args.issuedAt) > PRODUCTION_PROBE_MAX_SKEW_MS
  ) {
    throw new Error("production probe timestamp is invalid");
  }
  const expected = await productionProbeAuthorization(operation, args);
  if (
    !expected ||
    !SHA256.test(args.authorization) ||
    !constantTimeEqual(expected, args.authorization)
  ) {
    throw new Error("production probe authorization failed");
  }
}

export const recordProbe = mutation({
  args: {
    authorization: v.string(),
    commitSha: v.string(),
    environment: v.string(),
    issuedAt: v.number(),
    nonceHash: v.string(),
    previewName: v.string(),
    sample: v.number(),
  },
  returns: v.id("foundationProbes"),
  handler: async (ctx, args) => {
    const now = Date.now();
    await validatePreviewProbe("record", args);

    const existing = await ctx.db
      .query("foundationProbes")
      .withIndex("by_commit_nonce", (queryBuilder) =>
        queryBuilder.eq("commitSha", args.commitSha).eq("nonceHash", args.nonceHash),
      )
      .unique();
    if (existing) {
      if (!foundationProbePayloadMatches(existing, args)) {
        throw new Error("Probe nonce replay does not match the original payload");
      }
      return existing._id;
    }

    const active = await ctx.db
      .query("foundationProbes")
      .withIndex("by_commit_nonce", (queryBuilder) =>
        queryBuilder.eq("commitSha", args.commitSha),
      )
      .take(MAX_ACTIVE_PREVIEW_PROBES + 1);
    const staleProbes = active.filter((probe) =>
      isFoundationProbeExpired(probe, now),
    );
    for (const staleProbe of staleProbes) {
      await ctx.db.delete(staleProbe._id);
    }
    const currentProbes = active.filter(
      (probe) => !isFoundationProbeExpired(probe, now),
    );
    if (currentProbes.some((probe) => probe.sample === args.sample)) {
      throw new Error("Probe sample already has an active payload");
    }
    if (currentProbes.length >= MAX_ACTIVE_PREVIEW_PROBES) {
      throw new Error("Preview probe capacity reached; clear active probes first");
    }

    return await ctx.db.insert("foundationProbes", {
      commitSha: args.commitSha,
      environment: args.environment,
      issuedAt: args.issuedAt,
      nonceHash: args.nonceHash,
      sample: args.sample,
    });
  },
});

export const observeProbe = query({
  args: {
    commitSha: v.string(),
    environment: v.string(),
    issuedAt: v.number(),
    nonceHash: v.string(),
    sample: v.number(),
  },
  returns: v.union(v.null(), probeResult),
  handler: async (ctx, args) => {
    try {
      assertConvexPreviewProbeCapabilityActive(
        SOURCERA_CONVEX_PREVIEW_PROBE_EXPIRES_AT,
      );
      assertConvexPreviewProbeRuntime(args, {
        commitSha: SOURCERA_CONVEX_BUILD_COMMIT_SHA,
        environment: SOURCERA_CONVEX_BUILD_ENVIRONMENT,
        previewName: SOURCERA_CONVEX_BUILD_PREVIEW_NAME,
      });
    } catch {
      return null;
    }
    const probe = await ctx.db
      .query("foundationProbes")
      .withIndex("by_commit_nonce", (queryBuilder) =>
        queryBuilder.eq("commitSha", args.commitSha).eq("nonceHash", args.nonceHash),
      )
      .unique();

    if (!probe) return null;
    if (!foundationProbePayloadMatches(probe, args)) return null;
    const deployment = await ctx.meta.getDeploymentMetadata();
    return {
      buildCommitSha: SOURCERA_CONVEX_BUILD_COMMIT_SHA,
      buildEnvironment: SOURCERA_CONVEX_BUILD_ENVIRONMENT,
      buildPreviewName: SOURCERA_CONVEX_BUILD_PREVIEW_NAME,
      commitSha: probe.commitSha,
      deploymentName: deployment.name,
      environment: probe.environment,
      issuedAt: probe.issuedAt,
      nonceHash: probe.nonceHash,
      sample: probe.sample,
    };
  },
});

export const clearProbe = mutation({
  args: {
    authorization: v.string(),
    commitSha: v.string(),
    environment: v.string(),
    issuedAt: v.number(),
    nonceHash: v.string(),
    previewName: v.string(),
    sample: v.number(),
  },
  returns: v.boolean(),
  handler: async (ctx, args) => {
    await validatePreviewProbe("clear", args);
    const probe = await ctx.db
      .query("foundationProbes")
      .withIndex("by_commit_nonce", (queryBuilder) =>
        queryBuilder.eq("commitSha", args.commitSha).eq("nonceHash", args.nonceHash),
      )
      .unique();
    if (!probe) return false;
    if (!foundationProbePayloadMatches(probe, args)) return false;

    await ctx.db.delete(probe._id);
    return true;
  },
});

export const recordProductionProbe = mutation({
  args: {
    authorization: v.string(),
    commitSha: v.string(),
    deploymentName: v.string(),
    environment: v.string(),
    issuedAt: v.number(),
    nonceHash: v.string(),
    releaseApprovedSha: v.string(),
    sample: v.number(),
  },
  returns: v.id("foundationProbes"),
  handler: async (ctx, args) => {
    const deployment = await ctx.meta.getDeploymentMetadata();
    await validateProductionProbe("record", args, deployment.name);
    const existing = await ctx.db
      .query("foundationProbes")
      .withIndex("by_commit_nonce", (queryBuilder) =>
        queryBuilder.eq("commitSha", args.commitSha).eq("nonceHash", args.nonceHash),
      )
      .unique();
    if (existing) {
      if (!foundationProbePayloadMatches(existing, args)) {
        throw new Error("Probe nonce replay does not match the original payload");
      }
      return existing._id;
    }

    return await ctx.db.insert("foundationProbes", {
      commitSha: args.commitSha,
      environment: args.environment,
      issuedAt: args.issuedAt,
      nonceHash: args.nonceHash,
      sample: args.sample,
    });
  },
});

export const observeProductionProbe = query({
  args: {
    authorization: v.string(),
    commitSha: v.string(),
    deploymentName: v.string(),
    environment: v.string(),
    issuedAt: v.number(),
    nonceHash: v.string(),
    releaseApprovedSha: v.string(),
    sample: v.number(),
  },
  returns: v.union(v.null(), productionProbeResult),
  handler: async (ctx, args) => {
    const deployment = await ctx.meta.getDeploymentMetadata();
    await validateProductionProbe("observe", args, deployment.name);
    const probe = await ctx.db
      .query("foundationProbes")
      .withIndex("by_commit_nonce", (queryBuilder) =>
        queryBuilder.eq("commitSha", args.commitSha).eq("nonceHash", args.nonceHash),
      )
      .unique();
    if (!probe || !foundationProbePayloadMatches(probe, args)) return null;
    return {
      buildCommitSha: SOURCERA_CONVEX_BUILD_COMMIT_SHA,
      commitSha: probe.commitSha,
      deploymentName: deployment.name,
      environment: probe.environment,
      issuedAt: probe.issuedAt,
      nonceHash: probe.nonceHash,
      sample: probe.sample,
    };
  },
});

export const clearProductionProbe = mutation({
  args: {
    authorization: v.string(),
    commitSha: v.string(),
    deploymentName: v.string(),
    environment: v.string(),
    issuedAt: v.number(),
    nonceHash: v.string(),
    releaseApprovedSha: v.string(),
    sample: v.number(),
  },
  returns: v.boolean(),
  handler: async (ctx, args) => {
    const deployment = await ctx.meta.getDeploymentMetadata();
    await validateProductionProbe("clear", args, deployment.name);
    const probe = await ctx.db
      .query("foundationProbes")
      .withIndex("by_commit_nonce", (queryBuilder) =>
        queryBuilder.eq("commitSha", args.commitSha).eq("nonceHash", args.nonceHash),
      )
      .unique();
    if (!probe || !foundationProbePayloadMatches(probe, args)) return false;
    await ctx.db.delete(probe._id);
    return true;
  },
});
