import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { defineTable } from "convex/server";
import { v } from "convex/values";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
);

test("the central Convex schema delegates to one explicit registry", () => {
  const registryPath = path.join(repositoryRoot, "convex/schema/registry.ts");
  assert.ok(existsSync(registryPath), "convex/schema/registry.ts must exist");

  const schemaSource = readFileSync(
    path.join(repositoryRoot, "convex/schema.ts"),
    "utf8",
  );
  assert.match(schemaSource, /from ["']\.\/schema\/registry["']/);
  assert.match(schemaSource, /defineSchema\(schemaTables\)/);
  assert.doesNotMatch(schemaSource, /defineTable/);
  assert.doesNotMatch(schemaSource, /foundationProbes/);
});

test("schema fragments assemble in stable fragment and table order", async () => {
  const registry = await import("../../convex/schema/registry");
  assert.equal(typeof registry.assembleSchemaFragments, "function");

  const alpha = {
    name: "alpha",
    tables: {
      zebraRecords: defineTable({ value: v.string() }).index("by_value", [
        "value",
      ]),
      alphaRecords: defineTable({ value: v.string() }),
    },
  } as const;
  const omega = {
    name: "omega",
    tables: {
      omegaRecords: defineTable({ value: v.string() }),
    },
  } as const;

  const forward = registry.assembleSchemaFragments(
    [omega, alpha],
    ["omega", "alpha"],
  );
  const reverse = registry.assembleSchemaFragments(
    [alpha, omega],
    ["alpha", "omega"],
  );

  assert.deepEqual(Object.keys(forward), [
    "alphaRecords",
    "zebraRecords",
    "omegaRecords",
  ]);
  assert.deepEqual(forward, reverse);
});

test("schema assembly rejects duplicate fragment names", async () => {
  const { assembleSchemaFragments } = await import(
    "../../convex/schema/registry"
  );
  const first = {
    name: "alpha",
    tables: { firstRecords: defineTable({ value: v.string() }) },
  } as const;
  const second = {
    name: "alpha",
    tables: { secondRecords: defineTable({ value: v.string() }) },
  } as const;

  assert.throws(
    () => assembleSchemaFragments([first, second], ["alpha", "alpha"]),
    /duplicate Convex schema fragment: alpha/,
  );
});

test("schema assembly rejects duplicate table ownership", async () => {
  const { assembleSchemaFragments } = await import(
    "../../convex/schema/registry"
  );
  const first = {
    name: "alpha",
    tables: { sharedRecords: defineTable({ alpha: v.string() }) },
  } as const;
  const second = {
    name: "omega",
    tables: { sharedRecords: defineTable({ omega: v.string() }) },
  } as const;

  assert.throws(
    () => assembleSchemaFragments([first, second], ["alpha", "omega"]),
    /duplicate Convex table: sharedRecords/,
  );
});

test("schema assembly rejects duplicate index names", async () => {
  const { assembleSchemaFragments } = await import(
    "../../convex/schema/registry"
  );
  const first = {
    name: "alpha",
    tables: {
      alphaRecords: defineTable({ value: v.string() }).index("by_value", [
        "value",
      ]),
    },
  } as const;
  const second = {
    name: "omega",
    tables: {
      omegaRecords: defineTable({ value: v.string() }).index("by_value", [
        "value",
      ]),
    },
  } as const;

  assert.throws(
    () => assembleSchemaFragments([first, second], ["alpha", "omega"]),
    /duplicate Convex index: by_value/,
  );
});

test("schema assembly names every missing registered fragment", async () => {
  const { assembleSchemaFragments } = await import(
    "../../convex/schema/registry"
  );
  const fragment = {
    name: "alpha",
    tables: { alphaRecords: defineTable({ value: v.string() }) },
  } as const;

  assert.throws(
    () => assembleSchemaFragments([fragment], ["alpha", "omega"]),
    /missing Convex schema fragment: omega/,
  );
});

test("schema assembly rejects unregistered or aliased fragments", async () => {
  const { assembleSchemaFragments } = await import(
    "../../convex/schema/registry"
  );
  const fragment = {
    name: "omega",
    tables: { omegaRecords: defineTable({ value: v.string() }) },
  } as const;

  assert.throws(
    () => assembleSchemaFragments([fragment], []),
    /unregistered Convex schema fragment: omega/,
  );
});

test("the production registry is immutable and owns only foundation probes", async () => {
  const schema = (await import("../../convex/schema")).default;
  const registry = await import("../../convex/schema/registry");

  assert.deepEqual(
    registry.registeredSchemaFragments.map((fragment) => fragment.name),
    ["foundationProbes"],
  );
  assert.deepEqual(Object.keys(registry.schemaTables), ["foundationProbes"]);
  assert.equal(schema.tables, registry.schemaTables);
  assert.deepEqual(
    registry.schemaTables.foundationProbes[" indexes"](),
    [
      {
        fields: ["commitSha", "nonceHash"],
        indexDescriptor: "by_commit_nonce",
      },
    ],
  );
  assert.equal(Object.isFrozen(registry.registeredSchemaFragments), true);
  assert.equal(Object.isFrozen(registry.schemaTables), true);
});

test("the generated data model is derived from the assembled central schema", () => {
  const generatedModel = readFileSync(
    path.join(repositoryRoot, "convex/_generated/dataModel.d.ts"),
    "utf8",
  );
  assert.match(generatedModel, /import schema from "\.\.\/schema\.js"/);
  assert.match(
    generatedModel,
    /DataModelFromSchemaDefinition<typeof schema>/,
  );
});

test("every feature fragment is explicitly registered without discovery or cycles", async () => {
  const registry = await import("../../convex/schema/registry");
  const schemaDirectory = path.join(repositoryRoot, "convex/schema");
  const featureFiles = readdirSync(schemaDirectory)
    .filter((entry) => entry.endsWith(".ts") && entry !== "registry.ts")
    .sort();

  assert.deepEqual(registry.registeredSchemaFragmentFiles, featureFiles);
  assert.equal(Object.isFrozen(registry.registeredSchemaFragmentFiles), true);

  const registrySource = readFileSync(
    path.join(schemaDirectory, "registry.ts"),
    "utf8",
  );
  for (const featureFile of featureFiles) {
    const fragmentImport = `./${featureFile.slice(0, -3)}`;
    assert.ok(
      registrySource.includes(`from "${fragmentImport}"`) ||
        registrySource.includes(`from '${fragmentImport}'`),
      `${featureFile} must have one explicit registry import`,
    );
    const featureSource = readFileSync(
      path.join(schemaDirectory, featureFile),
      "utf8",
    );
    assert.doesNotMatch(featureSource, /\bdefineSchema\b/);
    assert.doesNotMatch(featureSource, /from ["']\.\/[a-zA-Z0-9_-]+["']/);
    assert.doesNotMatch(featureSource, /\bprocess\.env\b|\bimport\s*\(|\brequire\s*\(/);
  }
  assert.doesNotMatch(
    registrySource,
    /\breaddir|\bglob|import\.meta|\bprocess\.env\b|\bimport\s*\(|\brequire\s*\(/,
  );
});
