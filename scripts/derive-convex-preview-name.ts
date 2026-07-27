import { createCommitBoundConvexPreviewName } from "@sourcera/domain/convex";

const source = process.env.SOURCERA_PREVIEW_SOURCE;
const commitSha = process.env.SOURCERA_COMMIT_SHA;
if (!source) {
  throw new Error("SOURCERA_PREVIEW_SOURCE is required");
}
if (!commitSha) {
  throw new Error("SOURCERA_COMMIT_SHA is required");
}

process.stdout.write(`${createCommitBoundConvexPreviewName(source, commitSha)}\n`);
