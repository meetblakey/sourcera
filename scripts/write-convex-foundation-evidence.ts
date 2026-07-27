import {
  closeSync,
  fsyncSync,
  openSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { registeredSchemaFragmentFiles } from "../convex/schema/registry";
import {
  createConvexFoundationEvidence,
  createConvexFoundationFailureEvidence,
} from "./lib/convex-foundation-evidence";
import { verifyConvexPostBuildIntegrity } from "./lib/convex-build-integrity";
import { readConvexPreviewProbeExpiresAt } from "./lib/convex-preview-probe-capability";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

function parseArguments() {
  const values = new Map<string, string>();
  const args = process.argv.slice(2);
  for (let index = 0; index < args.length; index += 2) {
    const name = args[index];
    const value = args[index + 1];
    if (
      (name !== "--probe" && name !== "--out") ||
      !value ||
      value.startsWith("--") ||
      values.has(name)
    ) {
      throw new Error("Usage: --probe <receipt.json> --out <evidence.json>");
    }
    values.set(name, value);
  }
  if (values.size !== 2) {
    throw new Error("Usage: --probe <receipt.json> --out <evidence.json>");
  }
  return { out: values.get("--out")!, probe: values.get("--probe")! };
}

function readIntegrityDigests() {
  try {
    const required = (name: string) => {
      const value = process.env[name];
      if (!value) throw new Error(`${name} is required`);
      return value;
    };
    const environment = required("SOURCERA_ENV");
    return verifyConvexPostBuildIntegrity({
      commitSha: required("SOURCERA_COMMIT_SHA"),
      environment,
      expectedDigests: {
        generatedClientSha256: required(
          "SOURCERA_VERIFIED_GENERATED_CLIENT_SHA256",
        ),
        generatedModelSha256: required(
          "SOURCERA_VERIFIED_GENERATED_MODEL_SHA256",
        ),
        schemaRegistrySha256: required(
          "SOURCERA_VERIFIED_SCHEMA_REGISTRY_SHA256",
        ),
      },
      previewName:
        environment === "production"
          ? undefined
          : required("CONVEX_PREVIEW_NAME"),
      previewProbeExpiresAt:
        environment === "production"
          ? undefined
          : readConvexPreviewProbeExpiresAt(
              required("SOURCERA_CONVEX_PREVIEW_PROBE_EXPIRES_AT"),
            ),
      previewProbeTokenSha256:
        environment === "production"
          ? undefined
          : required("SOURCERA_CONVEX_PREVIEW_PROBE_TOKEN_SHA256"),
      registeredFragmentFiles: registeredSchemaFragmentFiles,
      repositoryRoot,
    }).digests;
  } catch {
    return {
      generatedClientSha256: undefined,
      generatedModelSha256: undefined,
      schemaRegistrySha256: undefined,
    };
  }
}

function readSourceChecksum() {
  try {
    const sourceContract = JSON.parse(
      readFileSync(
        path.join(repositoryRoot, "delivery/ticket-source-checksums.json"),
        "utf8",
      ),
    ) as { sources?: Array<{ sha256?: string; sourceId?: string }> };
    return sourceContract.sources?.find(
      (source) => source.sourceId === "F-005",
    )?.sha256;
  } catch {
    return undefined;
  }
}

if (process.env.GITHUB_ACTIONS !== "true") {
  throw new Error("Convex foundation evidence is written only by GitHub Actions");
}

const { out, probe } = parseArguments();
const outputPath = path.resolve(out);
const outputRelative = path.relative(repositoryRoot, outputPath);
if (!outputRelative.startsWith("..") && !path.isAbsolute(outputRelative)) {
  throw new Error("Convex foundation evidence output must be outside the checkout");
}

let probeReceipt: unknown;
try {
  probeReceipt = JSON.parse(readFileSync(path.resolve(probe), "utf8"));
} catch {
  probeReceipt = undefined;
}
const digests = readIntegrityDigests();

const evidenceInput = {
  buildResult: process.env.SOURCERA_BUILD_RESULT,
  ci: {
    runAttempt: process.env.GITHUB_RUN_ATTEMPT,
    runId: process.env.GITHUB_RUN_ID,
    workflowRef: process.env.GITHUB_WORKFLOW_REF,
  },
  commitSha: process.env.SOURCERA_COMMIT_SHA,
  digests,
  environment: process.env.SOURCERA_ENV,
  previewName: process.env.CONVEX_PREVIEW_NAME,
  probe: probeReceipt,
  probeResult: process.env.SOURCERA_PROBE_RESULT,
  project: process.env.CONVEX_EXPECTED_PROJECT,
  sourceChecksum: readSourceChecksum(),
  verificationResult: process.env.SOURCERA_VERIFY_RESULT,
};
let evidence;
try {
  evidence = createConvexFoundationEvidence(
    evidenceInput as Parameters<typeof createConvexFoundationEvidence>[0],
  );
} catch {
  evidence = createConvexFoundationFailureEvidence(evidenceInput);
}

let descriptor: number | undefined;
try {
  descriptor = openSync(outputPath, "wx", 0o600);
  writeFileSync(descriptor, `${JSON.stringify(evidence, null, 2)}\n`, "utf8");
  fsyncSync(descriptor);
} catch (error) {
  if ((error as NodeJS.ErrnoException).code === "EEXIST") {
    throw new Error("Convex foundation evidence already exists");
  }
  throw error;
} finally {
  if (descriptor !== undefined) closeSync(descriptor);
}

process.stdout.write(
  `${JSON.stringify({ event: evidence.event, outcome: evidence.outcome })}\n`,
);
