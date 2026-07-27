import path from "node:path";
import { fileURLToPath } from "node:url";

import { registeredSchemaFragmentFiles } from "../convex/schema/registry";
import { validateConvexSchemaContract } from "./lib/convex-schema-contract";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

const files = validateConvexSchemaContract({
  registeredFragmentFiles: registeredSchemaFragmentFiles,
  repositoryRoot,
});

process.stdout.write(
  `${JSON.stringify({ files, result: "passed", validator: "convex-schema" })}\n`,
);
