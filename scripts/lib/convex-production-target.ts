import {
  type ConvexProductionTarget,
  readConvexProductionTarget,
} from "@sourcera/domain/convex";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function readPinnedConvexProductionTarget(
  value: unknown,
): ConvexProductionTarget {
  if (!isRecord(value) || !isRecord(value.convexProduction)) {
    throw new Error("Convex production target is not repo-pinned");
  }
  const deploymentName = value.convexProduction.deploymentName;
  const deploymentUrl = value.convexProduction.deploymentUrl;
  if (typeof deploymentName !== "string" || typeof deploymentUrl !== "string") {
    throw new Error("Convex production target is not repo-pinned");
  }
  return readConvexProductionTarget(deploymentName, deploymentUrl);
}
