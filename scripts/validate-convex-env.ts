import {
  appendFileSync,
  existsSync,
  readdirSync,
  readFileSync,
} from "node:fs";
import path from "node:path";
import ts from "typescript";

import {
  readRequiredConvexPreviewClientIdentity,
  readRequiredConvexPreviewIdentity,
  readRequiredConvexPreviewKeyIdentity,
} from "@sourcera/domain/convex";

const ignoredDirectories = new Set([".next", "node_modules"]);
const queryFunctions = new Set(["fetchQuery", "preloadQuery", "runQuery"]);

function isNamedCall(node: ts.CallExpression, name: string): boolean {
  return (
    (ts.isIdentifier(node.expression) && node.expression.text === name) ||
    (ts.isPropertyAccessExpression(node.expression) &&
      node.expression.name.text === name)
  );
}

function containsConvexQuery(node: ts.Node): boolean {
  let found = false;
  const visit = (candidate: ts.Node) => {
    if (found) return;
    if (ts.isCallExpression(candidate)) {
      const expression = candidate.expression;
      if (
        (ts.isPropertyAccessExpression(expression) &&
          expression.name.text === "query") ||
        (ts.isIdentifier(expression) && queryFunctions.has(expression.text))
      ) {
        found = true;
        return;
      }
    }
    ts.forEachChild(candidate, visit);
  };
  visit(node);
  return found;
}

function importsConvex(sourceFile: ts.SourceFile): boolean {
  return sourceFile.statements.some(
    (statement) =>
      ts.isImportDeclaration(statement) &&
      ts.isStringLiteral(statement.moduleSpecifier) &&
      statement.moduleSpecifier.text.toLowerCase().includes("convex"),
  );
}

function containsRecursiveTimeout(node: ts.Node, functionName: string): boolean {
  let found = false;
  const visit = (candidate: ts.Node) => {
    if (found) return;
    if (
      ts.isCallExpression(candidate) &&
      isNamedCall(candidate, "setTimeout") &&
      ts.isIdentifier(candidate.arguments[0]) &&
      candidate.arguments[0].text === functionName
    ) {
      found = true;
      return;
    }
    ts.forEachChild(candidate, visit);
  };
  visit(node);
  return found;
}

function collectPollingViolations(
  directory: string,
  repositoryRoot: string,
): string[] {
  if (!existsSync(directory)) return [];
  const violations: string[] = [];
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (entry.isDirectory() && ignoredDirectories.has(entry.name)) continue;
    const absolutePath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      violations.push(...collectPollingViolations(absolutePath, repositoryRoot));
      continue;
    }
    if (!entry.isFile() || !/\.(?:ts|tsx)$/.test(entry.name)) continue;
    const sourceFile = ts.createSourceFile(
      absolutePath,
      readFileSync(absolutePath, "utf8"),
      ts.ScriptTarget.Latest,
      true,
    );
    if (!importsConvex(sourceFile)) continue;
    const visit = (node: ts.Node) => {
      if (
        ts.isFunctionDeclaration(node) &&
        node.name &&
        node.body &&
        containsConvexQuery(node.body) &&
        containsRecursiveTimeout(node.body, node.name.text)
      ) {
        violations.push(
          path.relative(repositoryRoot, absolutePath).replaceAll("\\", "/"),
        );
      }
      if (
        ts.isVariableDeclaration(node) &&
        ts.isIdentifier(node.name) &&
        node.initializer &&
        (ts.isArrowFunction(node.initializer) ||
          ts.isFunctionExpression(node.initializer)) &&
        containsConvexQuery(node.initializer.body) &&
        containsRecursiveTimeout(node.initializer.body, node.name.text)
      ) {
        violations.push(
          path.relative(repositoryRoot, absolutePath).replaceAll("\\", "/"),
        );
      }
      if (
        ts.isCallExpression(node) &&
        isNamedCall(node, "setInterval") &&
        node.arguments[0] &&
        containsConvexQuery(node.arguments[0])
      ) {
        violations.push(
          path.relative(repositoryRoot, absolutePath).replaceAll("\\", "/"),
        );
      }
      ts.forEachChild(node, visit);
    };
    visit(sourceFile);
  }
  return violations;
}

function rejectConvexPollingWatchers(repositoryRoot: string) {
  const violations = ["app", "apps", "components", "lib", "packages"]
    .flatMap((directory) =>
      collectPollingViolations(path.join(repositoryRoot, directory), repositoryRoot),
    )
    .sort();
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

const identity =
  phase === "predeploy"
    ? readRequiredConvexPreviewKeyIdentity(process.env)
    : phase === "client"
      ? readRequiredConvexPreviewClientIdentity(process.env)
      : readRequiredConvexPreviewIdentity(process.env);

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
    previewName: identity.previewName,
    result: "passed",
  })}\n`,
);
