import { appendFileSync, existsSync, readdirSync } from "node:fs";
import path from "node:path";
import ts from "typescript";

import productionTargets from "../config/production-targets.json";
import {
  readRequiredConvexDeploymentClientIdentity,
  readRequiredConvexDeploymentIdentity,
  readRequiredConvexDeploymentKeyIdentity,
} from "@sourcera/domain/convex";
import { readPinnedConvexProductionTarget } from "./lib/convex-production-target";

const ignoredDirectories = new Set([".next", "node_modules"]);
const queryFunctions = new Set(["fetchQuery", "preloadQuery", "runQuery"]);

function isNamedCall(node: ts.CallExpression, name: string): boolean {
  return (
    (ts.isIdentifier(node.expression) && node.expression.text === name) ||
    (ts.isPropertyAccessExpression(node.expression) &&
      node.expression.name.text === name)
  );
}

function importsConvex(sourceFile: ts.SourceFile): boolean {
  return sourceFile.statements.some(
    (statement) =>
      ts.isImportDeclaration(statement) &&
      ts.isStringLiteral(statement.moduleSpecifier) &&
      (statement.moduleSpecifier.text.toLowerCase() === "convex" ||
        statement.moduleSpecifier.text.toLowerCase().startsWith("convex/")),
  );
}

function collectSourceFilePaths(directory: string): string[] {
  if (!existsSync(directory)) return [];
  const sourceFilePaths: string[] = [];
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (entry.isDirectory() && ignoredDirectories.has(entry.name)) continue;
    const absolutePath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      sourceFilePaths.push(...collectSourceFilePaths(absolutePath));
      continue;
    }
    if (entry.isFile() && /\.(?:ts|tsx)$/.test(entry.name)) {
      sourceFilePaths.push(absolutePath);
    }
  }
  return sourceFilePaths;
}

function resolveAlias(
  symbol: ts.Symbol | undefined,
  checker: ts.TypeChecker,
): ts.Symbol | undefined {
  const visitedAliases = new Set<ts.Symbol>();
  while (symbol && (symbol.flags & ts.SymbolFlags.Alias) !== 0) {
    if (visitedAliases.has(symbol)) return undefined;
    visitedAliases.add(symbol);
    symbol = checker.getAliasedSymbol(symbol);
  }
  return symbol;
}

function referencedSymbol(
  expression: ts.Expression,
  checker: ts.TypeChecker,
): ts.Symbol | undefined {
  const location = ts.isPropertyAccessExpression(expression)
    ? expression.name
    : expression;
  return resolveAlias(checker.getSymbolAtLocation(location), checker);
}

function calledSymbol(
  call: ts.CallExpression,
  checker: ts.TypeChecker,
): ts.Symbol | undefined {
  return referencedSymbol(call.expression, checker);
}

function callableBody(symbol: ts.Symbol): ts.ConciseBody | undefined {
  for (const declaration of symbol.declarations ?? []) {
    if (
      (ts.isFunctionDeclaration(declaration) ||
        ts.isFunctionExpression(declaration) ||
        ts.isArrowFunction(declaration) ||
        ts.isMethodDeclaration(declaration)) &&
      declaration.body
    ) {
      return declaration.body;
    }
    if (
      ts.isVariableDeclaration(declaration) &&
      declaration.initializer &&
      (ts.isArrowFunction(declaration.initializer) ||
        ts.isFunctionExpression(declaration.initializer))
    ) {
      return declaration.initializer.body;
    }
    if (
      ts.isPropertyAssignment(declaration) &&
      (ts.isArrowFunction(declaration.initializer) ||
        ts.isFunctionExpression(declaration.initializer))
    ) {
      return declaration.initializer.body;
    }
  }
  return undefined;
}

function isCallableNode(node: ts.Node): boolean {
  return (
    ts.isFunctionDeclaration(node) ||
    ts.isFunctionExpression(node) ||
    ts.isArrowFunction(node) ||
    ts.isMethodDeclaration(node)
  );
}

type PollingAnalysis = {
  checker: ts.TypeChecker;
  convexSourcePaths: Set<string>;
  scannedSourcePaths: Set<string>;
};

function isConvexQueryTerminal(
  call: ts.CallExpression,
  analysis: PollingAnalysis,
): boolean {
  if (
    !analysis.convexSourcePaths.has(path.resolve(call.getSourceFile().fileName))
  ) {
    return false;
  }
  const expression = call.expression;
  return (
    (ts.isPropertyAccessExpression(expression) &&
      expression.name.text === "query") ||
    (ts.isIdentifier(expression) && queryFunctions.has(expression.text))
  );
}

function symbolReachesConvexQuery(
  symbol: ts.Symbol,
  analysis: PollingAnalysis,
  visitedSymbols: Set<ts.Symbol>,
): boolean {
  if (visitedSymbols.has(symbol)) return false;
  visitedSymbols.add(symbol);
  const body = callableBody(symbol);
  if (
    !body ||
    !analysis.scannedSourcePaths.has(path.resolve(body.getSourceFile().fileName))
  ) {
    return false;
  }
  return nodeReachesConvexQuery(body, analysis, visitedSymbols);
}

function nodeReachesConvexQuery(
  root: ts.Node,
  analysis: PollingAnalysis,
  visitedSymbols: Set<ts.Symbol>,
): boolean {
  let found = false;
  const visit = (node: ts.Node) => {
    if (found || (node !== root && isCallableNode(node))) return;
    if (ts.isCallExpression(node)) {
      if (isConvexQueryTerminal(node, analysis)) {
        found = true;
        return;
      }
      const symbol = calledSymbol(node, analysis.checker);
      if (
        symbol &&
        symbolReachesConvexQuery(symbol, analysis, visitedSymbols)
      ) {
        found = true;
        return;
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(root);
  return found;
}

function callbackReachesConvexQuery(
  callback: ts.Expression,
  analysis: PollingAnalysis,
): boolean {
  const visitedSymbols = new Set<ts.Symbol>();
  const symbol = referencedSymbol(callback, analysis.checker);
  return (
    (symbol && symbolReachesConvexQuery(symbol, analysis, visitedSymbols)) ||
    nodeReachesConvexQuery(callback, analysis, visitedSymbols)
  );
}

function symbolReachesTarget(
  symbol: ts.Symbol,
  target: ts.Symbol,
  analysis: PollingAnalysis,
  visitedSymbols: Set<ts.Symbol>,
): boolean {
  if (symbol === target) return true;
  if (visitedSymbols.has(symbol)) return false;
  visitedSymbols.add(symbol);
  const body = callableBody(symbol);
  if (
    !body ||
    !analysis.scannedSourcePaths.has(path.resolve(body.getSourceFile().fileName))
  ) {
    return false;
  }
  return nodeReachesTarget(body, target, analysis, visitedSymbols);
}

function nodeReachesTarget(
  root: ts.Node,
  target: ts.Symbol,
  analysis: PollingAnalysis,
  visitedSymbols: Set<ts.Symbol>,
): boolean {
  let found = false;
  const visit = (node: ts.Node) => {
    if (found || (node !== root && isCallableNode(node))) return;
    if (ts.isCallExpression(node)) {
      const symbol = calledSymbol(node, analysis.checker);
      if (
        symbol &&
        symbolReachesTarget(symbol, target, analysis, visitedSymbols)
      ) {
        found = true;
        return;
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(root);
  return found;
}

function callbackReachesTarget(
  callback: ts.Expression,
  target: ts.Symbol,
  analysis: PollingAnalysis,
): boolean {
  const visitedSymbols = new Set<ts.Symbol>();
  const symbol = referencedSymbol(callback, analysis.checker);
  return (
    (symbol &&
      symbolReachesTarget(symbol, target, analysis, visitedSymbols)) ||
    nodeReachesTarget(callback, target, analysis, visitedSymbols)
  );
}

function callableSymbol(
  node: ts.Node,
  checker: ts.TypeChecker,
): ts.Symbol | undefined {
  if (ts.isFunctionDeclaration(node) && node.name) {
    return resolveAlias(checker.getSymbolAtLocation(node.name), checker);
  }
  if (
    (ts.isFunctionExpression(node) || ts.isArrowFunction(node)) &&
    ts.isVariableDeclaration(node.parent) &&
    ts.isIdentifier(node.parent.name)
  ) {
    return resolveAlias(checker.getSymbolAtLocation(node.parent.name), checker);
  }
  if (ts.isMethodDeclaration(node)) {
    return resolveAlias(checker.getSymbolAtLocation(node.name), checker);
  }
  return undefined;
}

function containingCallableSymbol(
  node: ts.Node,
  checker: ts.TypeChecker,
): ts.Symbol | undefined {
  let current: ts.Node | undefined = node.parent;
  while (current) {
    const symbol = callableSymbol(current, checker);
    if (symbol) return symbol;
    current = current.parent;
  }
  return undefined;
}

function collectPollingViolations(
  program: ts.Program,
  sourceFilePaths: string[],
  repositoryRoot: string,
): string[] {
  const checker = program.getTypeChecker();
  const scannedSourcePaths = new Set(
    sourceFilePaths.map((file) => path.resolve(file)),
  );
  const convexSourcePaths = new Set(
    program
      .getSourceFiles()
      .filter(importsConvex)
      .map((sourceFile) => path.resolve(sourceFile.fileName)),
  );
  const analysis = { checker, convexSourcePaths, scannedSourcePaths };
  const violations: string[] = [];
  for (const sourceFile of program.getSourceFiles()) {
    if (!scannedSourcePaths.has(path.resolve(sourceFile.fileName))) continue;
    const visit = (node: ts.Node) => {
      if (ts.isCallExpression(node) && node.arguments[0]) {
        const callback = node.arguments[0];
        const isPollingInterval =
          isNamedCall(node, "setInterval") &&
          callbackReachesConvexQuery(callback, analysis);
        const timeoutOwner = isNamedCall(node, "setTimeout")
          ? containingCallableSymbol(node, checker)
          : undefined;
        const isRecursivePollingTimeout =
          timeoutOwner !== undefined &&
          callbackReachesConvexQuery(callback, analysis) &&
          callbackReachesTarget(callback, timeoutOwner, analysis);
        if (isPollingInterval || isRecursivePollingTimeout) {
          violations.push(
            path
              .relative(repositoryRoot, sourceFile.fileName)
              .replaceAll("\\", "/"),
          );
        }
      }
      ts.forEachChild(node, visit);
    };
    visit(sourceFile);
  }
  return violations;
}

function rejectConvexPollingWatchers(repositoryRoot: string) {
  const sourceFilePaths = ["app", "apps", "components", "lib", "packages"]
    .flatMap((directory) =>
      collectSourceFilePaths(path.join(repositoryRoot, directory)),
    )
    .sort();
  const configPath = path.join(repositoryRoot, "tsconfig.json");
  const config = ts.readConfigFile(configPath, ts.sys.readFile);
  if (config.error) {
    throw new Error(
      ts.flattenDiagnosticMessageText(config.error.messageText, "\n"),
    );
  }
  const parsedConfig = ts.parseJsonConfigFileContent(
    config.config,
    ts.sys,
    repositoryRoot,
    undefined,
    configPath,
  );
  const program = ts.createProgram({
    rootNames: sourceFilePaths,
    options: parsedConfig.options,
    projectReferences: parsedConfig.projectReferences,
  });
  const violations = collectPollingViolations(
    program,
    sourceFilePaths,
    repositoryRoot,
  ).sort();
  if (violations.length > 0) {
    throw new Error(
      `convex_polling_watcher_violation: ${[...new Set(violations)].join(", ")}`,
    );
  }
}

const phaseIndex = process.argv.indexOf("--phase");
const phase = phaseIndex >= 0 ? process.argv[phaseIndex + 1] : "full";
if (!phase || !["client", "full", "predeploy"].includes(phase)) {
  throw new Error("--phase must be client, full, or predeploy");
}
rejectConvexPollingWatchers(path.resolve(__dirname, ".."));
const runtimeEnvironment =
  process.env.SOURCERA_ENV ??
  process.env.VERCEL_TARGET_ENV ??
  process.env.VERCEL_ENV;
const productionTarget =
  runtimeEnvironment === "production"
    ? readPinnedConvexProductionTarget(productionTargets)
    : undefined;

const identity =
  phase === "predeploy"
    ? readRequiredConvexDeploymentKeyIdentity(process.env, productionTarget)
    : phase === "client"
      ? readRequiredConvexDeploymentClientIdentity(process.env, productionTarget)
      : readRequiredConvexDeploymentIdentity(process.env, productionTarget);

if (process.argv.includes("--write-github-env")) {
  if (phase === "predeploy" || !("deploymentUrl" in identity)) {
    throw new Error("--write-github-env requires client or full validation");
  }
  if (!process.env.GITHUB_ENV) {
    throw new Error("GITHUB_ENV is required when writing the deployment URL");
  }
  appendFileSync(
    process.env.GITHUB_ENV,
    `NEXT_PUBLIC_CONVEX_URL=${identity.deploymentUrl}\n`,
    { encoding: "utf8" },
  );
}

process.stdout.write(
  `${JSON.stringify({
    commitSha: identity.commitSha,
    environment: identity.environment,
    phase,
    result: "passed",
    ...("previewName" in identity
      ? { previewName: identity.previewName }
      : { deploymentName: identity.deploymentName }),
    ...("project" in identity ? { project: identity.project } : {}),
  })}\n`,
);
