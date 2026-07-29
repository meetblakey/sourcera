import { strict as assert } from "node:assert";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import test from "node:test";

import {
  compileLinearAuthoritySourceLineage,
  computeLinearAuthoritySourceLineageRoot,
  computeLinearAuthoritySourceSetRoot,
  LINEAR_AUTHORITY_SOURCE_SPECS,
  normalizeLinearAuthoritySourceMarkdown,
  validateLinearAuthoritySourceLineage,
  type LinearAuthoritySourceLineageAuthorityBinding,
  type LinearAuthoritySourceLineageSource,
} from "./lib/linear-authority-source-lineage.js";
import {
  buildLinearAuthoritySemanticCoreV4,
  buildLinearAuthoritySemanticPlanV4TestFixture,
} from "./lib/linear-authority-semantic-plan-v4.js";

const sha256 = (value: string): string =>
  createHash("sha256").update(value).digest("hex");

test("rejects a fake minimal semantic plan instead of trusting row counts", () => {
  const semanticPlanRaw = JSON.stringify({
    schemaVersion: 3,
    requirements: Array.from({ length: 926 }, (_, index) => ({
      canonicalLegacyId: `F-${index + 1}`,
    })),
    decisions: Array.from({ length: 61 }, (_, index) => ({
      legacyId: `F-AE-${index + 1}`,
      disposition: "narrative_context",
    })),
  });
  const featureInventoryRaw = "| F-1 | Test | — | §1.1 | — | master_spec | test | — | — |\n";
  const authority: LinearAuthoritySourceLineageAuthorityBinding = {
    workspaceId: "00000000-0000-4000-8000-000000000001",
    sourceCommit: "a".repeat(40),
    planRoot: "b".repeat(64),
    sourceSetRoot: "c".repeat(64),
    semanticPlanSha256: sha256(semanticPlanRaw),
    semanticRoot: "d".repeat(64),
    featureInventorySha256: sha256(featureInventoryRaw),
  };

  assert.throws(
    () => compileLinearAuthoritySourceLineage({
      authority,
      repositoryRoot: process.cwd(),
      semanticPlanRaw,
      featureInventoryRaw,
      dispositionsRaw: '{"overrides":[]}',
      sourceChecksumsRaw: '{"schemaVersion":3,"sources":[]}',
      sourceFiles: new Map(),
    }),
    /semantic plan.*keys|required missing|counts/i,
  );
});

test("real repository source lineage has zero unresolved targets and keeps context offline", () => {
  const featureInventoryRaw = readFileSync("_audit/FEATURE_INVENTORY.md");
  const dispositionsRaw = readFileSync("delivery/dispositions.json");
  const sourceChecksumsRaw = readFileSync("delivery/ticket-source-checksums.json");
  const core = buildLinearAuthoritySemanticCoreV4(process.cwd());
  const semantic = buildLinearAuthoritySemanticPlanV4TestFixture(
    process.cwd(),
    core.requirements.slice(0, 186).map((row, index) => ({
      canonicalLegacyId: row.canonicalLegacyId,
      issueUuid: `00000000-0000-4000-8000-${(index + 1).toString(16).padStart(12, "0")}`,
      issueIdentifier: `REQ-${index + 1}`,
      descriptionUpdateRequired: false,
      priorityUpdateRequired: false,
      executionRelationsToAdd: [],
      requirementDependencyLegacyIdsToAdd: [],
      proofExecutionDependenciesToAdd: [],
    })),
  );
  const semanticPlanRaw = Buffer.from(JSON.stringify(semantic.plan));
  const sourceFiles = new Map<string, Buffer>();
  const sources: LinearAuthoritySourceLineageSource[] =
    LINEAR_AUTHORITY_SOURCE_SPECS.map((spec) => {
      const sourceBytes = readFileSync(spec.path);
      sourceFiles.set(spec.path, sourceBytes);
      return {
        path: spec.path,
        precedence: spec.precedence,
        role: spec.role,
        byteLength: sourceBytes.length,
        rawSha256: sha256(sourceBytes.toString("binary")),
        normalizedSha256: sha256(
          normalizeLinearAuthoritySourceMarkdown(sourceBytes.toString("utf8")),
        ),
      };
    });
  // Hash raw bytes, not their binary-string representation.
  for (const source of sources) {
    source.rawSha256 = createHash("sha256")
      .update(sourceFiles.get(source.path)!)
      .digest("hex");
  }
  const authority: LinearAuthoritySourceLineageAuthorityBinding = {
    workspaceId: "00000000-0000-4000-8000-000000000001",
    sourceCommit: "a".repeat(40),
    planRoot: "b".repeat(64),
    sourceSetRoot: computeLinearAuthoritySourceSetRoot(sources),
    semanticPlanSha256: createHash("sha256").update(semanticPlanRaw).digest("hex"),
    semanticRoot: semantic.semanticRoot,
    featureInventorySha256: createHash("sha256").update(featureInventoryRaw).digest("hex"),
  };
  const compilerInput = {
    authority,
    repositoryRoot: process.cwd(),
    semanticPlanRaw,
    featureInventoryRaw,
    dispositionsRaw,
    sourceChecksumsRaw,
    sourceFiles,
  };
  const lineage = compileLinearAuthoritySourceLineage(compilerInput);

  assert.equal(lineage.targetBindings.length, 987);
  assert.equal(lineage.unresolved.length, 0, JSON.stringify(lineage.unresolved));
  assert.equal(lineage.sourceExtractionCoverageValidated, true);
  assert.equal(
    lineage.targetBindings.filter((row) =>
      row.resolution === "retired_source_disposition" &&
      row.supportSliceKeys.length === 0 &&
      row.replacementLegacyId !== null
    ).length,
    10,
  );
  const contextOnly = new Set([
    "Audit_Prompts.md",
    "Research_MPP.md",
    "Research_MPP_Implementation_Gaps.md",
  ]);
  assert.ok(lineage.sourceSlices
    .filter((slice) => contextOnly.has(slice.sourcePath))
    .every((slice) => slice.contextRole === "canonical_document_context"));
  const pricingBindings = lineage.targetBindings.filter((row) =>
    row.inventorySourceDocument.includes("Pricing_Strategy")
  );
  assert.equal(pricingBindings.length, 21);
  assert.ok(pricingBindings.every((row) =>
    row.semanticRole === "decision" && row.disposition === "narrative_context"
  ));
  const firstSharedKey = lineage.targetBindings
    .flatMap((row) => row.supportSliceKeys)
    .find((key, _index, keys) => keys.indexOf(key) !== keys.lastIndexOf(key));
  assert.ok(firstSharedKey, "at least one reusable source slice must support multiple targets");
  assert.ok(lineage.targetBindings.some((row) => row.supportSliceKeys.length > 1));

  const withoutRoot = { ...lineage };
  delete (withoutRoot as Partial<typeof lineage>).sourceLineageRoot;
  const changedPlanRoot = structuredClone(withoutRoot);
  changedPlanRoot.authority.planRoot = "c".repeat(64);
  assert.equal(
    computeLinearAuthoritySourceLineageRoot(withoutRoot),
    computeLinearAuthoritySourceLineageRoot(changedPlanRoot),
  );

  const summary = validateLinearAuthoritySourceLineage({
    ...compilerInput,
    lineageRaw: JSON.stringify(lineage),
  });
  assert.equal(summary.status, "source_lineage_coverage_validated");
  assert.equal(summary.unresolved, 0);
  assert.equal(summary.captureEvidenceValidated, false);
  assert.equal(summary.semanticCoverageValidated, false);
  assert.equal(summary.mutationAuthorized, false);
});
