import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

type ApplicationDomain = "buyer" | "marketplace" | "seller";

export interface SourceFile {
  path: string;
  source: string;
}

export interface DomainBoundaryViolation {
  importPath: string;
  sourceDomain: ApplicationDomain;
  sourcePath: string;
  targetDomain: ApplicationDomain;
}

const ignoredDirectories = new Set([
  ".git",
  ".next",
  ".vercel",
  "node_modules",
  "reports",
  "tests",
  "tools",
]);

function domainForPath(filePath: string): ApplicationDomain | undefined {
  const normalized = filePath.replaceAll("\\", "/").replace(/^\.\//, "");

  if (normalized.startsWith("apps/buyer/")) return "buyer";
  if (normalized.startsWith("apps/seller/")) return "seller";
  if (/^(app|components|lib)\//.test(normalized)) return "marketplace";

  return undefined;
}

function importsFrom(source: string): string[] {
  const imports: string[] = [];
  const pattern =
    /(?:import|export)\s+(?:type\s+)?(?:[^'";]*?\s+from\s+)?["']([^"']+)["']|(?:import|require)\(\s*["']([^"']+)["']\s*\)/g;

  for (const match of source.matchAll(pattern)) {
    imports.push(match[1] ?? match[2]);
  }

  return imports;
}

function targetDomainForImport(
  sourcePath: string,
  importPath: string,
): ApplicationDomain | undefined {
  if (importPath === "@sourcera/domain") return undefined;
  if (importPath.startsWith("@sourcera/buyer")) return "buyer";
  if (importPath.startsWith("@sourcera/seller")) return "seller";
  if (importPath.startsWith("@sourcera/marketplace")) return "marketplace";

  if (!importPath.startsWith(".")) return undefined;

  return domainForPath(
    path.posix.normalize(path.posix.join(path.posix.dirname(sourcePath), importPath)),
  );
}

export function findDomainBoundaryViolations(
  files: SourceFile[],
): DomainBoundaryViolation[] {
  const violations: DomainBoundaryViolation[] = [];

  for (const file of files) {
    const sourceDomain = domainForPath(file.path);
    if (!sourceDomain) continue;

    for (const importPath of importsFrom(file.source)) {
      const targetDomain = targetDomainForImport(file.path, importPath);
      if (!targetDomain || targetDomain === sourceDomain) continue;

      violations.push({
        importPath,
        sourceDomain,
        sourcePath: file.path,
        targetDomain,
      });
    }
  }

  return violations;
}

async function collectSourceFiles(
  repositoryRoot: string,
  directory = repositoryRoot,
): Promise<SourceFile[]> {
  const files: SourceFile[] = [];

  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (entry.isDirectory() && ignoredDirectories.has(entry.name)) continue;

    const absolutePath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collectSourceFiles(repositoryRoot, absolutePath)));
      continue;
    }

    if (!entry.isFile() || !/\.(?:ts|tsx)$/.test(entry.name)) continue;

    files.push({
      path: path.relative(repositoryRoot, absolutePath).replaceAll("\\", "/"),
      source: await readFile(absolutePath, "utf8"),
    });
  }

  return files;
}

export async function validateDomainBoundaries(
  repositoryRoot: string,
): Promise<DomainBoundaryViolation[]> {
  return findDomainBoundaryViolations(await collectSourceFiles(repositoryRoot));
}
