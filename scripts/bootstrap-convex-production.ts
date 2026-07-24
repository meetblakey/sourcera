import { createHash } from "node:crypto";
import { readFileSync, realpathSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { ConvexHttpClient } from "convex/browser";

import productionTargets from "../config/production-targets.json";
import { api } from "../convex/_generated/api";
import {
  createConvexProductionGenesisReceipt,
  readCleanConvexProductionBootstrapCheckout,
  readConvexProductionBootstrapArguments,
  readConvexProductionBootstrapEnvironment,
  readGithubProductionApprovalReceipt,
  writeConvexProductionGenesisReceipt,
} from "./lib/convex-production-bootstrap";
import { readPinnedConvexProductionTarget } from "./lib/convex-production-target";

const repositoryRoot = realpathSync(
  path.resolve(path.dirname(fileURLToPath(import.meta.url)), ".."),
);

async function main() {
  const parsed = readConvexProductionBootstrapArguments(
    process.argv.slice(2),
    repositoryRoot,
  );
  const identity = readConvexProductionBootstrapEnvironment(process.env);
  const target = readPinnedConvexProductionTarget(productionTargets);
  const checkout = readCleanConvexProductionBootstrapCheckout(
    repositoryRoot,
    identity.knownGoodSha,
    identity.approvedCandidateSha,
  );
  const approvalBytes = readFileSync(parsed.approvalReceiptPath, "utf8");
  readGithubProductionApprovalReceipt(JSON.parse(approvalBytes), {
    approvedCandidateSha: identity.approvedCandidateSha,
    githubRepository: identity.githubRepository,
    githubRunAttempt: identity.githubRunAttempt,
    githubRunId: identity.githubRunId,
  });
  const approvalReceiptSha256 = createHash("sha256")
    .update(approvalBytes)
    .digest("hex");
  const client = new ConvexHttpClient(target.deploymentUrl, { logger: false });
  const receipt = await createConvexProductionGenesisReceipt(
    {
      approvedCandidateSha: identity.approvedCandidateSha,
      canarySecret: identity.canarySecret,
      checkout,
      github: {
        approvalReceiptSha256,
        environment: "sourcera-production-release",
        headSha: identity.approvedCandidateSha,
        runAttempt: identity.githubRunAttempt,
        runId: identity.githubRunId,
      },
      knownGoodSha: identity.knownGoodSha,
      target,
    },
    {
      query: async (arguments_) =>
        await client.query(api.foundation.observeProductionProbe, arguments_),
    },
  );
  const outputPath = writeConvexProductionGenesisReceipt(
    parsed.receiptOutputPath,
    receipt,
    repositoryRoot,
    {
      approvedCandidateSha: identity.approvedCandidateSha,
      approvalReceiptSha256,
      githubRunAttempt: identity.githubRunAttempt,
      githubRunId: identity.githubRunId,
      knownGoodSha: identity.knownGoodSha,
      target,
    },
  );
  process.stdout.write(`${JSON.stringify({ outputPath, result: "passed" })}\n`);
}

void main().catch(() => {
  process.stderr.write("Convex production genesis bootstrap failed.\n");
  process.exitCode = 1;
});
