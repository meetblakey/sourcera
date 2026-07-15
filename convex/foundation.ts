import { v } from "convex/values";

import { mutation, query } from "./_generated/server";

const FULL_GIT_COMMIT_SHA = /^(?:[a-f0-9]{40}|[a-f0-9]{64})$/i;
const SHA256 = /^[a-f0-9]{64}$/;
const PREVIEW_ENVIRONMENTS = new Set(["ci", "preview", "staging", "test"]);

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

    await ctx.db.delete(probe._id);
    return true;
  },
});
