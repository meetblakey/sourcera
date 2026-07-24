import { randomUUID } from "node:crypto";
import { existsSync, realpathSync } from "node:fs";
import { link, mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

function canonicalizePotentialPath(value: string) {
  let ancestor = path.resolve(value);
  const missing: string[] = [];
  while (!existsSync(ancestor)) {
    const parent = path.dirname(ancestor);
    if (parent === ancestor) break;
    missing.unshift(path.basename(ancestor));
    ancestor = parent;
  }
  return path.join(realpathSync(ancestor), ...missing);
}

export interface PrivateJsonReceiptPublisherDependencies {
  beforePublish?(temporaryPath: string, destination: string): Promise<void> | void;
}

export async function publishPrivateJsonReceipt(
  outputPath: string,
  value: unknown,
  repositoryRoot: string,
  dependencies: PrivateJsonReceiptPublisherDependencies = {},
) {
  const destination = canonicalizePotentialPath(outputPath);
  const root = realpathSync(repositoryRoot);
  const relative = path.relative(root, destination);
  if (
    relative === "" ||
    (!relative.startsWith("..") && !path.isAbsolute(relative))
  ) {
    throw new Error("receipt output must remain outside the repository");
  }
  const directory = path.dirname(destination);
  await mkdir(directory, { mode: 0o700, recursive: true });
  const temporaryPath = path.join(
    directory,
    `.${path.basename(destination)}.${process.pid}.${randomUUID()}.tmp`,
  );
  await writeFile(temporaryPath, `${JSON.stringify(value, null, 2)}\n`, {
    encoding: "utf8",
    flag: "wx",
    mode: 0o600,
  });
  try {
    await dependencies.beforePublish?.(temporaryPath, destination);
    await link(temporaryPath, destination);
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "EEXIST") {
      throw new Error(`receipt output already exists: ${destination}`);
    }
    throw error;
  } finally {
    await unlink(temporaryPath).catch(() => undefined);
  }
  return destination;
}
