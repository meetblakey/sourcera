import assert from "node:assert/strict";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  findDomainBoundaryViolations,
  validateDomainBoundaries,
} from "../../scripts/domain-boundaries";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
);

test("a console cannot import another console", () => {
  const violations = findDomainBoundaryViolations([
    {
      path: "apps/buyer/app/page.tsx",
      source: 'import "../../seller/app/page";',
    },
    {
      path: "apps/buyer/lib/contract.ts",
      source: 'import type { SourceraDomain } from "@sourcera/domain";',
    },
  ]);

  assert.deepEqual(violations, [
    {
      importPath: "../../seller/app/page",
      sourceDomain: "buyer",
      sourcePath: "apps/buyer/app/page.tsx",
      targetDomain: "seller",
    },
  ]);
});

test("the repository has no cross-console imports", async () => {
  assert.deepEqual(await validateDomainBoundaries(repositoryRoot), []);
});

test("shared packages cannot import consoles", () => {
  assert.deepEqual(
    findDomainBoundaryViolations([
      {
        path: "packages/domain/src/index.ts",
        source: 'export * from "../../../apps/seller/lib/private";',
      },
    ]),
    [
      {
        importPath: "../../../apps/seller/lib/private",
        sourceDomain: "shared",
        sourcePath: "packages/domain/src/index.ts",
        targetDomain: "seller",
      },
    ],
  );
});

test("only approved shared packages can cross a console boundary", () => {
  assert.deepEqual(
    findDomainBoundaryViolations([
      {
        path: "apps/buyer/lib/example.ts",
        source: 'import "@sourcera/unapproved";',
      },
    ]),
    [
      {
        importPath: "@sourcera/unapproved",
        sourceDomain: "buyer",
        sourcePath: "apps/buyer/lib/example.ts",
        targetDomain: "unapproved",
      },
    ],
  );
});
