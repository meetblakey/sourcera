import { createHash } from "node:crypto";
import {
  existsSync,
  readFileSync,
  readdirSync,
} from "node:fs";
import path from "node:path";

import ts from "typescript";

interface ConvexSchemaContractOptions {
  registeredFragmentFiles: readonly string[];
  repositoryRoot: string;
}

function stableCompare(left: string, right: string) {
  return left < right ? -1 : left > right ? 1 : 0;
}

function toPortablePath(value: string) {
  return value.split(path.sep).join("/");
}

function listTypeScriptSources(directory: string, relative = ""): string[] {
  return readdirSync(path.join(directory, relative), { withFileTypes: true })
    .flatMap((entry) => {
      const entryRelative = path.join(relative, entry.name);
      if (entry.isDirectory()) {
        return listTypeScriptSources(directory, entryRelative);
      }
      return entry.isFile() && entry.name.endsWith(".ts")
        ? [toPortablePath(entryRelative)]
        : [];
    })
    .sort(stableCompare);
}

function resolveSchemaContractFiles({
  registeredFragmentFiles,
  repositoryRoot,
}: ConvexSchemaContractOptions) {
  const schemaAssembler = path.join(repositoryRoot, "convex/schema.ts");
  const schemaDirectory = path.join(repositoryRoot, "convex/schema");
  if (!existsSync(schemaAssembler)) {
    throw new Error("missing Convex schema source: convex/schema.ts");
  }

  const registered = [...registeredFragmentFiles].sort(stableCompare);
  const registeredNames = new Set<string>();
  for (const fileName of registered) {
    if (
      fileName !== path.basename(fileName) ||
      !fileName.endsWith(".ts") ||
      fileName === "registry.ts"
    ) {
      throw new Error(`invalid registered Convex schema source: ${fileName}`);
    }
    if (registeredNames.has(fileName)) {
      throw new Error(`duplicate registered Convex schema source: ${fileName}`);
    }
    registeredNames.add(fileName);
  }

  const expected = ["registry.ts", ...registered].sort(stableCompare);
  const expectedNames = new Set(expected);
  const actual = listTypeScriptSources(schemaDirectory);
  const actualNames = new Set(actual);
  for (const fileName of expected) {
    if (!actualNames.has(fileName)) {
      throw new Error(`missing registered Convex schema source: ${fileName}`);
    }
  }
  for (const fileName of actual) {
    if (!expectedNames.has(fileName)) {
      throw new Error(`unregistered Convex schema source: ${fileName}`);
    }
  }

  return [
    "convex/schema.ts",
    ...expected.map((fileName) => `convex/schema/${fileName}`),
  ].sort(stableCompare);
}

function readCompilerOptions(repositoryRoot: string) {
  const configPath = ts.findConfigFile(
    repositoryRoot,
    ts.sys.fileExists,
    "tsconfig.json",
  );
  if (!configPath) throw new Error("tsconfig.json is required");
  const config = ts.readConfigFile(configPath, ts.sys.readFile);
  if (config.error) {
    throw new Error(
      ts.flattenDiagnosticMessageText(config.error.messageText, "\n"),
    );
  }
  const parsed = ts.parseJsonConfigFileContent(
    config.config,
    ts.sys,
    path.dirname(configPath),
    undefined,
    configPath,
  );
  if (parsed.errors.length > 0) {
    throw new Error(
      parsed.errors
        .map((error) =>
          ts.flattenDiagnosticMessageText(error.messageText, "\n"),
        )
        .join("\n"),
    );
  }
  return parsed.options;
}

function collectModuleSpecifiers(sourceFile: ts.SourceFile) {
  const specifiers: string[] = [];
  function visit(node: ts.Node) {
    if (
      (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) &&
      node.moduleSpecifier &&
      ts.isStringLiteralLike(node.moduleSpecifier)
    ) {
      specifiers.push(node.moduleSpecifier.text);
    } else if (
      ts.isImportEqualsDeclaration(node) &&
      ts.isExternalModuleReference(node.moduleReference) &&
      node.moduleReference.expression &&
      ts.isStringLiteralLike(node.moduleReference.expression)
    ) {
      specifiers.push(node.moduleReference.expression.text);
    } else if (
      ts.isCallExpression(node) &&
      node.arguments.length === 1 &&
      ts.isStringLiteralLike(node.arguments[0]) &&
      (node.expression.kind === ts.SyntaxKind.ImportKeyword ||
        (ts.isIdentifier(node.expression) && node.expression.text === "require"))
    ) {
      specifiers.push(node.arguments[0].text);
    }
    ts.forEachChild(node, visit);
  }
  visit(sourceFile);
  return specifiers;
}

export function validateConvexSchemaContract(
  options: ConvexSchemaContractOptions,
) {
  const contractFiles = resolveSchemaContractFiles(options);
  const schemaDirectory = path.resolve(options.repositoryRoot, "convex/schema");
  const compilerOptions = readCompilerOptions(options.repositoryRoot);

  for (const fileName of options.registeredFragmentFiles) {
    const sourcePath = path.join(schemaDirectory, fileName);
    const sourceFile = ts.createSourceFile(
      sourcePath,
      readFileSync(sourcePath, "utf8"),
      ts.ScriptTarget.Latest,
      true,
      ts.ScriptKind.TS,
    );
    for (const specifier of collectModuleSpecifiers(sourceFile)) {
      const resolved = ts.resolveModuleName(
        specifier,
        sourcePath,
        compilerOptions,
        ts.sys,
      ).resolvedModule;
      if (!resolved) continue;
      const resolvedPath = path.resolve(resolved.resolvedFileName);
      const schemaRelative = path.relative(schemaDirectory, resolvedPath);
      if (
        schemaRelative !== "" &&
        !schemaRelative.startsWith(`..${path.sep}`) &&
        schemaRelative !== ".." &&
        !path.isAbsolute(schemaRelative)
      ) {
        throw new Error(
          `${fileName} cannot import Convex schema source ${toPortablePath(
            schemaRelative,
          )} (resolved from ${specifier})`,
        );
      }
    }
  }

  return contractFiles;
}

export function createConvexSchemaRegistryDigest(
  options: ConvexSchemaContractOptions,
) {
  const hash = createHash("sha256");
  for (const relativePath of resolveSchemaContractFiles(options)) {
    hash.update(relativePath);
    hash.update("\0");
    hash.update(readFileSync(path.join(options.repositoryRoot, relativePath)));
    hash.update("\0");
  }
  return hash.digest("hex");
}
