import { v } from "convex/values";

import {
  createConvexProductionProbePayload,
  type ConvexProductionProbeOperation,
} from "../packages/domain/src/convex";
import { mutation, query } from "./_generated/server";
import { SOURCERA_CONVEX_BUILD_COMMIT_SHA } from "./releaseIdentity";

const FULL_GIT_COMMIT_SHA = /^(?:[a-f0-9]{40}|[a-f0-9]{64})$/i;
const SHA256 = /^[a-f0-9]{64}$/;
const PREVIEW_ENVIRONMENTS = new Set(["ci", "preview", "staging", "test"]);
const PRODUCTION_PROBE_MAX_SKEW_MS = 5 * 60 * 1_000;

function validateProbe(args: {
  commitSha: string;
  environment: string;
  nonceHash: string;
  sample: number;
}) {
  if (!FULL_GIT_COMMIT_SHA.test(args.commitSha)) {
    throw new Error("commitSha must be a Git commit SHA");
  }
  if (!PREVIEW_ENVIRONMENTS.has(args.environment)) {
    throw new Error("environment must be non-production");
  }
  if (!SHA256.test(args.nonceHash)) {
    throw new Error("nonceHash must be a SHA-256 digest");
  }
  if (!Number.isInteger(args.sample) || args.sample < 1 || args.sample > 100) {
    throw new Error("sample must be an integer from 1 to 100");
  }
}

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
    commitSha: v.string(),
    environment: v.string(),
    issuedAt: v.number(),
    nonceHash: v.string(),
    sample: v.number(),
  },
  handler: async (ctx, args) => {
    validateProbe(args);
    if (!Number.isSafeInteger(args.issuedAt) || args.issuedAt <= 0) {
      throw new Error("issuedAt must be a positive epoch timestamp");
    }

    const existing = await ctx.db
      .query("foundationProbes")
      .withIndex("by_commit_nonce", (queryBuilder) =>
        queryBuilder.eq("commitSha", args.commitSha).eq("nonceHash", args.nonceHash),
      )
      .unique();
    if (existing) return existing._id;

    return await ctx.db.insert("foundationProbes", args);
  },
});

export const observeProbe = query({
  args: {
    commitSha: v.string(),
    nonceHash: v.string(),
  },
  handler: async (ctx, args) => {
    if (!FULL_GIT_COMMIT_SHA.test(args.commitSha) || !SHA256.test(args.nonceHash)) {
      return null;
    }
    const probe = await ctx.db
      .query("foundationProbes")
      .withIndex("by_commit_nonce", (queryBuilder) =>
        queryBuilder.eq("commitSha", args.commitSha).eq("nonceHash", args.nonceHash),
      )
      .unique();

    if (!probe) return null;
    if (!PREVIEW_ENVIRONMENTS.has(probe.environment)) return null;
    return {
      commitSha: probe.commitSha,
      environment: probe.environment,
      issuedAt: probe.issuedAt,
      nonceHash: probe.nonceHash,
      sample: probe.sample,
    };
  },
});

export const clearProbe = mutation({
  args: {
    commitSha: v.string(),
    nonceHash: v.string(),
  },
  handler: async (ctx, args) => {
    const probe = await ctx.db
      .query("foundationProbes")
      .withIndex("by_commit_nonce", (queryBuilder) =>
        queryBuilder.eq("commitSha", args.commitSha).eq("nonceHash", args.nonceHash),
      )
      .unique();
    if (!probe) return false;
    if (!PREVIEW_ENVIRONMENTS.has(probe.environment)) return false;

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
  handler: async (ctx, args) => {
    const deployment = await ctx.meta.getDeploymentMetadata();
    await validateProductionProbe("record", args, deployment.name);
    const existing = await ctx.db
      .query("foundationProbes")
      .withIndex("by_commit_nonce", (queryBuilder) =>
        queryBuilder.eq("commitSha", args.commitSha).eq("nonceHash", args.nonceHash),
      )
      .unique();
    if (existing) return existing._id;

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
  handler: async (ctx, args) => {
    const deployment = await ctx.meta.getDeploymentMetadata();
    await validateProductionProbe("observe", args, deployment.name);
    const probe = await ctx.db
      .query("foundationProbes")
      .withIndex("by_commit_nonce", (queryBuilder) =>
        queryBuilder.eq("commitSha", args.commitSha).eq("nonceHash", args.nonceHash),
      )
      .unique();
    if (!probe || probe.environment !== "production") return null;
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
  handler: async (ctx, args) => {
    const deployment = await ctx.meta.getDeploymentMetadata();
    await validateProductionProbe("clear", args, deployment.name);
    const probe = await ctx.db
      .query("foundationProbes")
      .withIndex("by_commit_nonce", (queryBuilder) =>
        queryBuilder.eq("commitSha", args.commitSha).eq("nonceHash", args.nonceHash),
      )
      .unique();
    if (!probe || probe.environment !== "production") return false;
    await ctx.db.delete(probe._id);
    return true;
  },
});
