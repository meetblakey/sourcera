import { defineTable } from "convex/server";
import { v } from "convex/values";

export const foundationProbesSchemaFragment = {
  name: "foundationProbes",
  tables: {
    foundationProbes: defineTable({
      commitSha: v.string(),
      environment: v.string(),
      issuedAt: v.number(),
      nonceHash: v.string(),
      sample: v.number(),
    }).index("by_commit_nonce", ["commitSha", "nonceHash"]),
  },
} as const;
