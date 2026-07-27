import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

type SchemaContractModule = typeof import(
  "../../scripts/lib/convex-schema-contract"
);

async function loadSchemaContract(): Promise<SchemaContractModule> {
  const contract = await import(
    "../../scripts/lib/convex-schema-contract"
  ).catch(() => undefined);
  assert.ok(contract, "the Convex schema contract validator must exist");
  return contract;
}

function createSchemaFixture(alphaSource = "export const alpha = true;\n") {
  const repositoryRoot = mkdtempSync(
    path.join(os.tmpdir(), "convex-schema-contract-"),
  );
  const schemaDirectory = path.join(repositoryRoot, "convex/schema");
  mkdirSync(schemaDirectory, { recursive: true });
  writeFileSync(
    path.join(repositoryRoot, "tsconfig.json"),
    `${JSON.stringify({
      compilerOptions: {
        baseUrl: ".",
        module: "esnext",
        moduleResolution: "bundler",
        paths: { "@schema/*": ["convex/schema/*"] },
        target: "ES2022",
      },
    })}\n`,
  );
  writeFileSync(path.join(repositoryRoot, "convex/schema.ts"), "export {};\n");
  writeFileSync(path.join(schemaDirectory, "registry.ts"), "export {};\n");
  writeFileSync(path.join(schemaDirectory, "alpha.ts"), alphaSource);
  writeFileSync(
    path.join(schemaDirectory, "beta.ts"),
    "export const beta = true;\n",
  );
  return repositoryRoot;
}

const registeredFragmentFiles = ["alpha.ts", "beta.ts"] as const;

test("schema fragments may import dependencies outside the schema registry", async () => {
  const repositoryRoot = createSchemaFixture(
    'import type { GenericSchema } from "convex/server";\nexport type Shape = GenericSchema;\n',
  );
  try {
    const { validateConvexSchemaContract } = await loadSchemaContract();
    assert.deepEqual(
      validateConvexSchemaContract({
        registeredFragmentFiles,
        repositoryRoot,
      }),
      [
        "convex/schema.ts",
        "convex/schema/alpha.ts",
        "convex/schema/beta.ts",
        "convex/schema/registry.ts",
      ],
    );
  } finally {
    rmSync(repositoryRoot, { force: true, recursive: true });
  }
});

test("schema fragments reject every resolved path back into the schema registry", async () => {
  const bypasses = [
    './beta.js',
    './nested/../../schema/registry.js',
    '../schema/beta',
    '@schema/registry',
  ];
  const { validateConvexSchemaContract } = await loadSchemaContract();

  for (const specifier of bypasses) {
    const repositoryRoot = createSchemaFixture(
      `import { value } from ${JSON.stringify(specifier)};\nexport { value };\n`,
    );
    try {
      assert.throws(
        () =>
          validateConvexSchemaContract({
            registeredFragmentFiles,
            repositoryRoot,
          }),
        new RegExp(
          `alpha\\.ts cannot import Convex schema source .*${
            specifier.includes("registry") ? "registry" : "beta"
          }\\.ts`,
        ),
        specifier,
      );
    } finally {
      rmSync(repositoryRoot, { force: true, recursive: true });
    }
  }
});

test("schema contract rejects an unregistered TypeScript source before hashing", async () => {
  const repositoryRoot = createSchemaFixture();
  try {
    writeFileSync(
      path.join(repositoryRoot, "convex/schema/unregistered.ts"),
      "export {};\n",
    );
    const { createConvexSchemaRegistryDigest } = await loadSchemaContract();
    assert.throws(
      () =>
        createConvexSchemaRegistryDigest({
          registeredFragmentFiles,
          repositoryRoot,
        }),
      /unregistered Convex schema source: unregistered\.ts/,
    );
  } finally {
    rmSync(repositoryRoot, { force: true, recursive: true });
  }
});

test("schema registry digest includes every registered fragment", async () => {
  const repositoryRoot = createSchemaFixture();
  try {
    const { createConvexSchemaRegistryDigest } = await loadSchemaContract();
    const before = createConvexSchemaRegistryDigest({
      registeredFragmentFiles,
      repositoryRoot,
    });
    writeFileSync(
      path.join(repositoryRoot, "convex/schema/beta.ts"),
      "export const beta = false;\n",
    );
    const after = createConvexSchemaRegistryDigest({
      registeredFragmentFiles,
      repositoryRoot,
    });

    assert.match(before, /^[a-f0-9]{64}$/);
    assert.match(after, /^[a-f0-9]{64}$/);
    assert.notEqual(after, before);
  } finally {
    rmSync(repositoryRoot, { force: true, recursive: true });
  }
});
