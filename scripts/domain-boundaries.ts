import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

type ApplicationDomain = "buyer" | "marketplace" | "seller";
type BoundaryDomain = ApplicationDomain | "shared" | "unapproved";

export interface SourceFile {
  path: string;
  source: string;
}

export interface DomainBoundaryViolation {
  importPath: string;
  sourceDomain: Exclude<BoundaryDomain, "unapproved">;
  sourcePath: string;
  targetDomain: BoundaryDomain;
}

const approvedSharedPackages = new Set(["@sourcera/domain"]);

const ignoredDirectories = new Set([
  ".git",
  ".next",
  ".vercel",
  "node_modules",
  "reports",
  "tests",
  "tools",
]);

function domainForPath(
  filePath: string,
): Exclude<BoundaryDomain, "unapproved"> | undefined {
  const normalized = filePath.replaceAll("\\", "/").replace(/^\.\//, "");

  if (normalized.startsWith("apps/buyer/")) return "buyer";
  if (normalized.startsWith("apps/seller/")) return "seller";
  if (normalized.startsWith("packages/")) return "shared";
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
  internalPackageNames: ReadonlySet<string>,
): BoundaryDomain | undefined {
  const matchesPackage = (packageName: string) =>
    importPath === packageName || importPath.startsWith(`${packageName}/`);
  if ([...approvedSharedPackages].some(matchesPackage)) return undefined;
  if ([...internalPackageNames].some(matchesPackage)) return "unapproved";
  if (importPath.startsWith("@sourcera/")) return "unapproved";
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
  internalPackageNames: ReadonlySet<string> = approvedSharedPackages,
): DomainBoundaryViolation[] {
  const violations: DomainBoundaryViolation[] = [];

  for (const file of files) {
    const sourceDomain = domainForPath(file.path);
    if (!sourceDomain) continue;

    for (const importPath of importsFrom(file.source)) {
      const targetDomain = targetDomainForImport(
        file.path,
        importPath,
        internalPackageNames,
      );
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

async function readWorkspacePackageNames(
  repositoryRoot: string,
): Promise<Set<string>> {
  const names = new Set<string>();

  for (const workspaceDirectory of ["apps", "packages"]) {
    const workspaceRoot = path.join(repositoryRoot, workspaceDirectory);
    for (const entry of await readdir(workspaceRoot, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;

      const packageJson = JSON.parse(
        await readFile(path.join(workspaceRoot, entry.name, "package.json"), "utf8"),
      ) as { name?: unknown };
      if (typeof packageJson.name !== "string" || packageJson.name.length === 0) {
        throw new Error(
          `${workspaceDirectory}/${entry.name}/package.json must declare a name`,
        );
      }
      names.add(packageJson.name);
    }
  }

  return names;
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
  return findDomainBoundaryViolations(
    await collectSourceFiles(repositoryRoot),
    await readWorkspacePackageNames(repositoryRoot),
  );
}
