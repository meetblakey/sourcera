import { createHash } from "node:crypto";

export function descriptionFingerprint(
  value: string | null | undefined,
): string {
  return createHash("sha256").update(value ?? "", "utf8").digest("hex");
}
