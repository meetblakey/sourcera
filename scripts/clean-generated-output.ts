import { existsSync, rmSync } from "node:fs";
import { relative, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const OUTPUTS = [".next", "apps/buyer/.next", "apps/seller/.next"];

export function removeGeneratedOutputs(root: string): string[] {
  const removed: string[] = [];
  for (const output of OUTPUTS) {
    const target = resolve(root, output);
    if (!existsSync(target)) continue;
    rmSync(target, { recursive: true, force: true });
    removed.push(relative(root, target));
  }
  return removed;
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href
) {
  process.stdout.write(
    `${JSON.stringify({
      removed: removeGeneratedOutputs(process.cwd()),
      status: "passed",
    })}\n`,
  );
}
