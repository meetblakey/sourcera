import { createHash } from "node:crypto";
import { readFileSync, realpathSync } from "node:fs";
import path from "node:path";

import {
  buildLinearAuthoritySemanticCoreV4,
  canonicalLinearAuthoritySemanticPlanV4Json,
  parseLinearAuthoritySemanticPlanV4,
  type LinearAuthorityDispositionV4,
  type LinearAuthoritySemanticCoreCountsV4,
} from "./linear-authority-semantic-plan-v4.js";
import {
  applyLinearDispositions,
  parseLinearDispositions,
} from "./linear-dispositions.js";
import {
  createLinearSourceChecksumResolutionCache,
  resolveSourceRequirementChecksum,
  sourceSliceBindingSha256,
  verifySourceChecksumContract,
  type ResolvedSourceChecksum,
  type SourceChecksumContract,
} from "./source-checksums.js";
import { parseFeatureInventory } from "./sources.js";
import type { SourceRequirement } from "./model.js";

export const LINEAR_AUTHORITY_SOURCE_LINEAGE_SCHEMA_VERSION = 1 as const;

export const LINEAR_AUTHORITY_SOURCE_SPECS = [
  { path: "Sourcera_Master_Spec.md", precedence: 1, role: "product_authority" },
  { path: "UX_Design_of_Sourcera.md", precedence: 2, role: "ux_fallback" },
  { path: "Sourcera_Buyer_Pricing_Strategy.md", precedence: 3, role: "narrative_context" },
  { path: "Sourcera_Seller_Pricing_Strategy.md", precedence: 4, role: "narrative_context" },
  { path: "Audit_Prompts.md", precedence: 5, role: "audit_program" },
  { path: "Research_MPP.md", precedence: 6, role: "research_context" },
  { path: "Research_MPP_Implementation_Gaps.md", precedence: 7, role: "research_context" },
] as const;

export type LinearAuthoritySourcePath =
  typeof LINEAR_AUTHORITY_SOURCE_SPECS[number]["path"];

export interface LinearAuthoritySourceLineageAuthorityBinding {
  workspaceId: string;
  sourceCommit: string;
  planRoot: string;
  sourceSetRoot: string;
  semanticPlanSha256: string;
  semanticRoot: string;
  featureInventorySha256: string;
}

export interface LinearAuthoritySourceLineageSource {
  path: LinearAuthoritySourcePath;
  precedence: number;
  role: string;
  byteLength: number;
  rawSha256: string;
  normalizedSha256: string;
}

export interface LinearAuthoritySourceLineageSlice {
  key: string;
  sourcePath: LinearAuthoritySourcePath;
  byteStart: number;
  byteEnd: number;
  startAnchor: string | null;
  endAnchor: string | null;
  rawSha256: string;
  normalizedSha256: string;
  contextRole: "target_support" | "canonical_document_context";
}

export interface LinearAuthoritySourceLineageTargetBinding {
  targetLegacyId: string;
  targetPlanKey: string;
  semanticRole: "requirement" | "decision";
  disposition: LinearAuthorityDispositionV4 | null;
  inventorySourceDocument: string;
  inventorySourceVersion: string;
  inventorySourceAnchor: string;
  status: "resolved" | "unresolved";
  resolution:
    | "registered"
    | "feature_inventory_section"
    | "reviewed_exact_heading"
    | "retired_source_disposition"
    | null;
  sourceBindingSha256: string | null;
  supportSliceKeys: string[];
  replacementLegacyId: string | null;
}

export interface LinearAuthoritySourceLineageUnresolvedRow {
  targetLegacyId: string;
  targetPlanKey: string;
  sourceDocument: string;
  sourceAnchor: string;
  code: "exact_source_selector_unresolved" | "source_outside_canonical_set";
  message: string;
}

export interface LinearAuthoritySourceLineage {
  schemaVersion: 1;
  kind: "linear_authority_source_lineage";
  authority: LinearAuthoritySourceLineageAuthorityBinding;
  sourceChecksumsSha256: string;
  dispositionsSha256: string;
  sources: LinearAuthoritySourceLineageSource[];
  sourceSlices: LinearAuthoritySourceLineageSlice[];
  targetBindings: LinearAuthoritySourceLineageTargetBinding[];
  unresolved: LinearAuthoritySourceLineageUnresolvedRow[];
  sourceCoverageRoot: string;
  sourceLineageRoot: string;
  sourcePartitionValidated: true;
  sourceExtractionCoverageValidated: boolean;
  semanticPlanInternalsValidated: true;
  captureEvidenceValidated: boolean;
  semanticCoverageValidated: false;
  mutationAuthorized: false;
}

export interface LinearAuthoritySourceLineageCompilerInput {
  authority: LinearAuthoritySourceLineageAuthorityBinding;
  repositoryRoot: string;
  semanticPlanRaw: string | Uint8Array;
  featureInventoryRaw: string | Uint8Array;
  dispositionsRaw: string | Uint8Array;
  sourceChecksumsRaw: string | Uint8Array;
  sourceFiles: ReadonlyMap<string, Buffer>;
}

export interface LinearAuthoritySourceLineageValidationInput
  extends LinearAuthoritySourceLineageCompilerInput {
  lineageRaw: string | Uint8Array;
}

export interface LinearAuthoritySourceLineageValidationSummary {
  status: "source_lineage_coverage_validated" | "source_lineage_coverage_incomplete";
  sourceLineageSha256: string;
  workspaceId: string;
  sourceCommit: string;
  planRoot: string;
  sourceSetRoot: string;
  semanticPlanSha256: string;
  semanticRoot: string;
  featureInventorySha256: string;
  sourceCoverageRoot: string;
  sourceLineageRoot: string;
  sources: 7;
  sourceSlices: number;
  requirements: 926;
  decisions: 61;
  retiredSourceDecisions: 10;
  unresolved: number;
  sourcePartitionValidated: true;
  sourceExtractionCoverageValidated: boolean;
  semanticPlanInternalsValidated: true;
  captureEvidenceValidated: boolean;
  semanticCoverageValidated: false;
  mutationAuthorized: false;
}

interface SourceIndex {
  bytes: Buffer;
  text: string;
  lines: Array<{ line: string; charOffset: number }>;
}

interface ByteRange {
  sourcePath: LinearAuthoritySourcePath;
  byteStart: number;
  byteEnd: number;
}

interface PendingBinding {
  requirement: SourceRequirement;
  targetPlanKey: string;
  semanticRole: "requirement" | "decision";
  disposition: LinearAuthorityDispositionV4 | null;
  replacementLegacyId: string | null;
  resolution: LinearAuthoritySourceLineageTargetBinding["resolution"];
  sourceBindingSha256: string | null;
  ranges: ByteRange[];
  unresolved: LinearAuthoritySourceLineageUnresolvedRow | null;
}

type JsonRecord = Record<string, unknown>;

const DIGEST = /^[a-f0-9]{64}$/;
const SOURCE_COMMIT = /^[a-f0-9]{40,64}$/;
const WORKSPACE_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const RETIRED_SOURCE_PATH =
  "_baselines/retired-sources/KB_Engineering_Spec_retired_2026-04-26.md";
const CONTEXT_ONLY_PATHS = new Set<LinearAuthoritySourcePath>([
  "Audit_Prompts.md",
  "Research_MPP.md",
  "Research_MPP_Implementation_Gaps.md",
]);
const SOURCE_PATH_SET = new Set<string>(
  LINEAR_AUTHORITY_SOURCE_SPECS.map((source) => source.path),
);
const PRICING_PATHS = new Set<LinearAuthoritySourcePath>([
  "Sourcera_Buyer_Pricing_Strategy.md",
  "Sourcera_Seller_Pricing_Strategy.md",
]);

interface ExactHeadingOverride {
  sourceDoc: LinearAuthoritySourcePath;
  startHeading: string;
  endHeading: string | null;
}

const exactHeading = (
  sourceDoc: LinearAuthoritySourcePath,
  startHeading: string,
  endHeading: string | null,
): ExactHeadingOverride => ({ sourceDoc, startHeading, endHeading });

const REVIEWED_EXACT_HEADING_OVERRIDES: Readonly<Record<string, ExactHeadingOverride>> = {
  "F-838": exactHeading("Sourcera_Buyer_Pricing_Strategy.md", "## 3. Plan Architecture at a Glance", "## 4. Free Plan — `$0`"),
  "F-839": exactHeading("Sourcera_Buyer_Pricing_Strategy.md", "### 2.4 Outcome-based pricing", "### 2.5 API plan"),
  "F-840": exactHeading("Sourcera_Buyer_Pricing_Strategy.md", "## 13. Financial Scenarios", "## 14. Migration from v2"),
  "F-841": exactHeading("Sourcera_Buyer_Pricing_Strategy.md", "### Scenario BPS-D — Solo tier mixed cohort *(new in v3)*", "### Blended target mix (Year 1 exit state, v3)"),
  "F-842": exactHeading("Sourcera_Buyer_Pricing_Strategy.md", "## 13. Financial Scenarios", "## 14. Migration from v2"),
  "F-843": exactHeading("Sourcera_Buyer_Pricing_Strategy.md", "## 7. Enterprise Plan — Custom, `$3,000/mo` floor", "## 8. Overage Pricing (Wallet)"),
  "F-844": exactHeading("Sourcera_Buyer_Pricing_Strategy.md", "## 12. Cost Adaptability", "## 13. Financial Scenarios"),
  "F-845": exactHeading("Sourcera_Buyer_Pricing_Strategy.md", "## Appendix A — Full 22-Capability Rate Card", "## Appendix B — Outcome Signals per Capability"),
  "F-846": exactHeading("Sourcera_Buyer_Pricing_Strategy.md", "## 14. Migration from v2", "## 15. Positioning and Messaging"),
  "F-847": exactHeading("Sourcera_Buyer_Pricing_Strategy.md", "## 8. Overage Pricing (Wallet)", "## 9. API Access Add-On — `$99/mo`"),
  "F-848": exactHeading("Sourcera_Seller_Pricing_Strategy.md", "## 3. Seller Plan Architecture at a Glance", "## 4. Seller Free — `$0`"),
  "F-849": exactHeading("Sourcera_Seller_Pricing_Strategy.md", "## 16. The Forced-Vendor-Signup Playbook", "## 17. Seller Onboarding Experience — Detailed Flow"),
  "F-850": exactHeading("Sourcera_Seller_Pricing_Strategy.md", "## 18. KB Value Capture & Stake-Building", "## 19. Seller-Side Network Effects"),
  "F-851": exactHeading("Sourcera_Seller_Pricing_Strategy.md", "## 19. Seller-Side Network Effects", "## 20. Anti-Spam and Marketplace Integrity Controls"),
  "F-852": exactHeading("Sourcera_Seller_Pricing_Strategy.md", "## 16. The Forced-Vendor-Signup Playbook", "## 17. Seller Onboarding Experience — Detailed Flow"),
  "F-853": exactHeading("Sourcera_Seller_Pricing_Strategy.md", "### Scenario SPS-D — Seller Solo tier mixed cohort *(new in v3)*", "### Target mix (Year-1 exit, seller side, v3)"),
  "F-854": exactHeading("Sourcera_Seller_Pricing_Strategy.md", "### 15.3 The conversion moments", "### 15.4 Paid-path progression"),
  "F-855": exactHeading("Sourcera_Seller_Pricing_Strategy.md", "## 10. Seller-Side Capability Rate Card (for wallet overage)", "## 11. Seller-Side Outcome Signals"),
  "F-856": exactHeading("Sourcera_Seller_Pricing_Strategy.md", "## 9. Seller Enterprise — Custom, `$3,000/mo` floor", "## 10. Seller-Side Capability Rate Card (for wallet overage)"),
  "F-857": exactHeading("Sourcera_Seller_Pricing_Strategy.md", "## 21. Migration from v2", "## 22. Positioning and Messaging (Seller-Side)"),
  "F-858": exactHeading("Sourcera_Seller_Pricing_Strategy.md", "## 15. PLG Motion (Seller-Side) — The Forced-Signup Opportunity", "## 16. The Forced-Vendor-Signup Playbook"),
  "F-859": exactHeading("UX_Design_of_Sourcera.md", "## 2.2 Color System", "## 2.3 Spacing Scale"),
  "F-860": exactHeading("UX_Design_of_Sourcera.md", "## 2.1 Typography", "## 2.2 Color System"),
  "F-861": exactHeading("UX_Design_of_Sourcera.md", "## 2.3 Spacing Scale", "## 2.4 Elevation & Shadows"),
  "F-862": exactHeading("UX_Design_of_Sourcera.md", "## 2.5 Border Radius", "## 2.6 Motion & Transitions"),
  "F-863": exactHeading("UX_Design_of_Sourcera.md", "## 2.4 Elevation & Shadows", "## 2.5 Border Radius"),
  "F-864": exactHeading("UX_Design_of_Sourcera.md", "## 2.6 Motion & Transitions", "## 2.7 Iconography"),
  "F-865": exactHeading("UX_Design_of_Sourcera.md", "### Button Component", "### Input Components"),
  "F-866": exactHeading("UX_Design_of_Sourcera.md", "### Input Components", "### DataTable Component"),
  "F-867": exactHeading("UX_Design_of_Sourcera.md", "### Input Components", "### DataTable Component"),
  "F-868": exactHeading("UX_Design_of_Sourcera.md", "### 5.2.11 Modal", "### 5.2.12 Dropdown"),
  "F-869": exactHeading("UX_Design_of_Sourcera.md", "## 3.1 Application Shell", "## 3.2 Sidebar Anatomy"),
  "F-870": exactHeading("UX_Design_of_Sourcera.md", "### Toast Notification Component", "### Form Field Component"),
  "F-871": exactHeading("UX_Design_of_Sourcera.md", "## 2.8 Z-Index Scale", "## 2.9 Form & Input Tokens"),
  "F-872": exactHeading("UX_Design_of_Sourcera.md", "## 8.10 Workspace Settings Navigation", "# 9. States & Edge Cases"),
  "F-873": exactHeading("UX_Design_of_Sourcera.md", "### DataTable Component", "### Modal Component"),
  "F-874": exactHeading("UX_Design_of_Sourcera.md", "### DataTable Component", "### Modal Component"),
  "F-875": exactHeading("UX_Design_of_Sourcera.md", "## 9.2 Empty States", "## 9.3 Error States"),
  "F-876": exactHeading("UX_Design_of_Sourcera.md", "## 9.1 Loading States", "## 9.2 Empty States"),
  "F-877": exactHeading("UX_Design_of_Sourcera.md", "## 9.3 Error States", "## 9.4 Phase Transition Edge Cases"),
  "F-878": exactHeading("UX_Design_of_Sourcera.md", "## 2.9 Form & Input Tokens", "# 3. Global Application Structure"),
  "F-879": exactHeading("UX_Design_of_Sourcera.md", "## 3.1 Application Shell", "## 3.2 Sidebar Anatomy"),
  "F-880": exactHeading("UX_Design_of_Sourcera.md", "## 3.3 Console Switcher", "## 3.4 Responsive Layouts"),
  "F-881": exactHeading("UX_Design_of_Sourcera.md", "## 2.6 Motion & Transitions", "## 2.7 Iconography"),
  "F-882": exactHeading("UX_Design_of_Sourcera.md", "## 2.7 Iconography", "## 2.8 Z-Index Scale"),
  "F-885": exactHeading("UX_Design_of_Sourcera.md", "## 2.2 Color System", "## 2.3 Spacing Scale"),
  "F-AE-071": exactHeading("Sourcera_Master_Spec.md", "### Scope amendment (Phase 14.0.1 — descopes from v7.1.0 to v7.1.x)", "### Major new sections"),
  "F-931": exactHeading("Sourcera_Master_Spec.md", "### Authenticated planning mirror publication {#authenticated-planning-mirror-publication}", "## Citation Convention {#citation-convention}"),
};

const REVIEWED_EXPECTED_INVENTORY_ANCHORS: Readonly<Record<string, string>> = {
  "F-838": "Buyer Pricing §Plan Tiers",
  "F-839": "Buyer Pricing §Consumption Model",
  "F-840": "Buyer Pricing §Scenarios",
  "F-841": "Buyer Pricing §Scenarios",
  "F-842": "Buyer Pricing §Scenarios",
  "F-843": "Buyer Pricing §Custom Tier",
  "F-844": "Buyer Pricing §Consumption Forecasting",
  "F-845": "Buyer Pricing §Rate Cards",
  "F-846": "Buyer Pricing §Downgrade Paths",
  "F-847": "Buyer Pricing §Overage",
  "F-848": "Seller Pricing §Plan Tiers",
  "F-849": "Seller Pricing §Forced Signup",
  "F-850": "Seller Pricing §KB Value Capture",
  "F-851": "Seller Pricing §Network Effects",
  "F-852": "Seller Pricing §Scenarios",
  "F-853": "Seller Pricing §Scenarios",
  "F-854": "Seller Pricing §Scenarios",
  "F-855": "Seller Pricing §Consumption",
  "F-856": "Seller Pricing §Custom Tier",
  "F-857": "Seller Pricing §Downgrade Paths",
  "F-858": "Seller Pricing §Invites",
  "F-859": "UX Design §Tokens.Color",
  "F-860": "UX Design §Tokens.Typography",
  "F-861": "UX Design §Tokens.Spacing",
  "F-862": "UX Design §Tokens.Radius",
  "F-863": "UX Design §Tokens.Elevation",
  "F-864": "UX Design §Tokens.Motion",
  "F-865": "UX Design §Components.Button",
  "F-866": "UX Design §Components.Input",
  "F-867": "UX Design §Components.Select",
  "F-868": "UX Design §Components.Modal",
  "F-869": "UX Design §Components.Drawer",
  "F-870": "UX Design §Components.Toast",
  "F-871": "UX Design §Components.Tooltip",
  "F-872": "UX Design §Components.Tabs",
  "F-873": "UX Design §Components.Table",
  "F-874": "UX Design §Components.Pagination",
  "F-875": "UX Design §Components.EmptyState",
  "F-876": "UX Design §Components.Skeleton",
  "F-877": "UX Design §Components.ErrorState",
  "F-878": "UX Design §Patterns.Form",
  "F-879": "UX Design §Patterns.Navigation",
  "F-880": "UX Design §Patterns.ConsoleFirewall",
  "F-881": "UX Design §Motion",
  "F-882": "UX Design §Iconography",
  "F-885": "UX Design §Theming",
  "F-AE-071": "_integration/RECONCILIATION.md → Phase 14.0.1",
  "F-931": "Authenticated planning mirror publication",
};

function bytes(value: string | Uint8Array): Buffer {
  return typeof value === "string" ? Buffer.from(value, "utf8") : Buffer.from(value);
}

function sha256(value: string | Buffer): string {
  return createHash("sha256").update(value).digest("hex");
}

function canonicalJson(value: unknown): string {
  if (value === null || typeof value !== "object") {
    const encoded = JSON.stringify(value);
    if (encoded === undefined) throw new Error("Source lineage contains an undefined value");
    return encoded;
  }
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  const row = value as JsonRecord;
  return `{${Object.keys(row).sort().map((key) =>
    `${JSON.stringify(key)}:${canonicalJson(row[key])}`
  ).join(",")}}`;
}

function decodeUtf8(value: Buffer, label: string): string {
  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(value);
  } catch {
    throw new Error(`${label} must be valid UTF-8`);
  }
}

export function normalizeLinearAuthoritySourceMarkdown(value: string): string {
  const normalized = value
    .normalize("NFC")
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .map((line) => line.replace(/[ \t]+$/g, ""))
    .join("\n")
    .replace(/\n+$/g, "");
  return `${normalized}\n`;
}

function parseJson(raw: Buffer, label: string): unknown {
  try {
    return JSON.parse(decodeUtf8(raw, label)) as unknown;
  } catch (error) {
    if (error instanceof Error && error.message.endsWith("must be valid UTF-8")) throw error;
    throw new Error(`${label} must be valid JSON`);
  }
}

function assertAuthority(
  authority: LinearAuthoritySourceLineageAuthorityBinding,
): void {
  const expectedKeys = [
    "workspaceId",
    "sourceCommit",
    "planRoot",
    "sourceSetRoot",
    "semanticPlanSha256",
    "semanticRoot",
    "featureInventorySha256",
  ].sort();
  if (JSON.stringify(Object.keys(authority).sort()) !== JSON.stringify(expectedKeys)) {
    throw new Error("Source lineage authority binding has a noncanonical shape");
  }
  if (!WORKSPACE_ID.test(authority.workspaceId)) {
    throw new Error("Source lineage workspaceId is invalid");
  }
  if (!SOURCE_COMMIT.test(authority.sourceCommit)) {
    throw new Error("Source lineage sourceCommit is invalid");
  }
  for (const [name, value] of Object.entries(authority).filter(([name]) =>
    name !== "workspaceId" && name !== "sourceCommit"
  )) {
    if (!DIGEST.test(value)) throw new Error(`Source lineage ${name} is invalid`);
  }
}

function isInside(root: string, target: string): boolean {
  const relative = path.relative(root, target);
  return relative === "" || (!relative.startsWith(`..${path.sep}`) && relative !== "..");
}

function sourceMetadata(
  repositoryRoot: string,
  sourceFiles: ReadonlyMap<string, Buffer>,
): { sources: LinearAuthoritySourceLineageSource[]; indexes: Map<string, SourceIndex> } {
  const actualKeys = [...sourceFiles.keys()].sort();
  const expectedKeys = LINEAR_AUTHORITY_SOURCE_SPECS.map((source) => source.path).sort();
  if (JSON.stringify(actualKeys) !== JSON.stringify(expectedKeys)) {
    throw new Error("Source lineage inputs must be exactly the seven canonical sources");
  }
  const canonicalRoot = realpathSync(repositoryRoot);
  const indexes = new Map<string, SourceIndex>();
  const sources = LINEAR_AUTHORITY_SOURCE_SPECS.map((spec) => {
    const provided = sourceFiles.get(spec.path)!;
    const resolved = path.resolve(canonicalRoot, spec.path);
    const canonicalPath = realpathSync(resolved);
    if (!isInside(canonicalRoot, canonicalPath)) {
      throw new Error(`Source lineage path escapes repository root: ${spec.path}`);
    }
    const disk = readFileSync(canonicalPath);
    if (!disk.equals(provided)) {
      throw new Error(`Source lineage repository root drift for ${spec.path}`);
    }
    const text = decodeUtf8(provided, spec.path);
    const lines: SourceIndex["lines"] = [];
    let charOffset = 0;
    for (const lineWithEnding of text.match(/.*(?:\r?\n|$)/g) ?? []) {
      if (!lineWithEnding) continue;
      lines.push({ line: lineWithEnding.replace(/\r?\n$/, ""), charOffset });
      charOffset += lineWithEnding.length;
    }
    indexes.set(spec.path, { bytes: provided, text, lines });
    return {
      path: spec.path,
      precedence: spec.precedence,
      role: spec.role,
      byteLength: provided.length,
      rawSha256: sha256(provided),
      normalizedSha256: sha256(normalizeLinearAuthoritySourceMarkdown(text)),
    };
  });
  return { sources, indexes };
}

export function computeLinearAuthoritySourceSetRoot(
  sources: readonly LinearAuthoritySourceLineageSource[],
): string {
  return sha256([...sources]
    .sort((left, right) => left.path.localeCompare(right.path))
    .map((source) => [
      source.precedence,
      source.path,
      source.role,
      source.byteLength,
      source.rawSha256,
      source.normalizedSha256,
    ].join("\0"))
    .join("\n"));
}

function exactLineOffset(index: SourceIndex, heading: string, label: string): number {
  const matches = index.lines.filter((row) => row.line === heading);
  if (matches.length !== 1) {
    throw new Error(`${label} exact heading resolves ${matches.length} times`);
  }
  return matches[0].charOffset;
}

function rangeForSelector(
  selector: ResolvedSourceChecksum["slices"][number],
  indexes: ReadonlyMap<string, SourceIndex>,
): ByteRange {
  if (!SOURCE_PATH_SET.has(selector.sourceDoc)) {
    throw new Error(`source selector uses noncanonical document ${selector.sourceDoc}`);
  }
  const sourcePath = selector.sourceDoc as LinearAuthoritySourcePath;
  const index = indexes.get(sourcePath)!;
  const startChar = exactLineOffset(index, selector.startHeading, selector.startHeading);
  let endChar = selector.endHeading === null
    ? index.text.length
    : exactLineOffset(index, selector.endHeading, selector.endHeading);
  if (endChar <= startChar) throw new Error("source selector range is reversed");
  if (selector.endBeforeHorizontalRule === true) {
    const rule = index.lines.find((row) =>
      row.charOffset > startChar && row.charOffset < endChar && row.line === "---"
    );
    if (!rule) throw new Error("source selector horizontal-rule boundary is missing");
    endChar = rule.charOffset;
  }
  return {
    sourcePath,
    byteStart: Buffer.byteLength(index.text.slice(0, startChar), "utf8"),
    byteEnd: Buffer.byteLength(index.text.slice(0, endChar), "utf8"),
  };
}

function rangeForSectionHeading(
  sourceDoc: string,
  sectionHeading: string,
  indexes: ReadonlyMap<string, SourceIndex>,
): ByteRange {
  if (!SOURCE_PATH_SET.has(sourceDoc)) {
    throw new Error(`section selector uses noncanonical document ${sourceDoc}`);
  }
  const sourcePath = sourceDoc as LinearAuthoritySourcePath;
  const index = indexes.get(sourcePath)!;
  const startChar = exactLineOffset(index, sectionHeading, sectionHeading);
  const level = /^(#{1,6})\s/.exec(sectionHeading)?.[1].length;
  if (!level) throw new Error("section selector heading level is invalid");
  const boundary = index.lines.find((row) => {
    if (row.charOffset <= startChar) return false;
    const nextLevel = /^(#{1,6})\s/.exec(row.line)?.[1].length;
    return row.line === "---" || (nextLevel !== undefined && nextLevel <= level);
  });
  const endChar = boundary?.charOffset ?? index.text.length;
  return {
    sourcePath,
    byteStart: Buffer.byteLength(index.text.slice(0, startChar), "utf8"),
    byteEnd: Buffer.byteLength(index.text.slice(0, endChar), "utf8"),
  };
}

function rangesForResolution(
  resolved: ResolvedSourceChecksum,
  indexes: ReadonlyMap<string, SourceIndex>,
  checksumRow: JsonRecord | undefined,
): ByteRange[] {
  if (sourceSliceBindingSha256(resolved.slices) !== resolved.sourceBindingSha256) {
    throw new Error("resolved source binding digest differs");
  }
  if (
    resolved.selector === "registered" &&
    checksumRow &&
    typeof checksumRow.sourceDoc === "string" &&
    typeof checksumRow.sectionHeading === "string"
  ) {
    const range = rangeForSectionHeading(
      checksumRow.sourceDoc,
      checksumRow.sectionHeading,
      indexes,
    );
    const source = indexes.get(range.sourcePath)!.bytes;
    if (sha256(source.subarray(range.byteStart, range.byteEnd)) !== resolved.sha256) {
      throw new Error("resolved section checksum differs from exact bytes");
    }
    return [range];
  }
  const ranges = resolved.slices.map((slice) => rangeForSelector(slice, indexes));
  const checksums = ranges.map((range, index) => {
    const selector = resolved.slices[index]!;
    const source = indexes.get(range.sourcePath)!.bytes;
    return [
      selector.sourceDoc,
      selector.startHeading,
      selector.endHeading,
      sha256(source.subarray(range.byteStart, range.byteEnd)),
    ];
  });
  const expected = checksums.length === 1
    ? checksums[0]![3]
    : sha256(JSON.stringify(["sourcera-ordered-source-bundle-v1", checksums]));
  if (expected !== resolved.sha256) throw new Error("resolved source checksum differs from exact bytes");
  return ranges;
}

function sliceAnchors(value: Buffer): { startAnchor: string | null; endAnchor: string | null } {
  const lines = normalizeLinearAuthoritySourceMarkdown(decodeUtf8(value, "Source slice"))
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  return {
    startAnchor: lines[0] ?? null,
    endAnchor: lines.at(-1) ?? null,
  };
}

function targetPlanKey(role: "requirement" | "decision", legacyId: string): string {
  return `${role === "requirement" ? "issue" : "decision"}:${legacyId}`;
}

function sourceCoverageRoot(
  sources: readonly LinearAuthoritySourceLineageSource[],
  sourceSlices: readonly LinearAuthoritySourceLineageSlice[],
): string {
  const physicalSlices = sourceSlices.map(({ contextRole: _contextRole, ...slice }) => slice);
  return sha256(canonicalJson({ sources, sourceSlices: physicalSlices }));
}

export function computeLinearAuthoritySourceLineageRoot(
  lineage: Omit<LinearAuthoritySourceLineage, "sourceLineageRoot">,
): string {
  const { planRoot: _externalPlanRoot, ...cycleFreeAuthority } = lineage.authority;
  return sha256(canonicalJson({
    ...lineage,
    authority: cycleFreeAuthority,
  }));
}

export function compileLinearAuthoritySourceLineage(
  input: LinearAuthoritySourceLineageCompilerInput,
): LinearAuthoritySourceLineage {
  assertAuthority(input.authority);
  const semanticPlanBytes = bytes(input.semanticPlanRaw);
  const featureInventoryBytes = bytes(input.featureInventoryRaw);
  const dispositionsBytes = bytes(input.dispositionsRaw);
  const sourceChecksumsBytes = bytes(input.sourceChecksumsRaw);
  const semantic = parseLinearAuthoritySemanticPlanV4(semanticPlanBytes);
  if (sha256(semanticPlanBytes) !== input.authority.semanticPlanSha256) {
    throw new Error("Source lineage semantic plan SHA-256 binding drift");
  }
  if (semantic.semanticRoot !== input.authority.semanticRoot) {
    throw new Error("Source lineage semanticRoot binding drift");
  }
  if (sha256(featureInventoryBytes) !== input.authority.featureInventorySha256) {
    throw new Error("Source lineage Feature Inventory SHA-256 binding drift");
  }

  const featureInventoryRaw = decodeUtf8(featureInventoryBytes, "Feature Inventory");
  const inventory = parseFeatureInventory(featureInventoryRaw);
  const dispositionsValue = parseJson(dispositionsBytes, "Disposition contract");
  const dispositionContract = parseLinearDispositions(dispositionsValue, inventory);
  const classifiedInventory = applyLinearDispositions(inventory, dispositionContract);
  const inventoryById = new Map(classifiedInventory.map((row) => [row.requirementId, row]));
  if (inventoryById.size !== 987) {
    throw new Error("Source lineage Feature Inventory must contain exactly 987 identities");
  }

  const expectedCore = buildLinearAuthoritySemanticCoreV4(input.repositoryRoot);
  const actualCore = {
    counts: Object.fromEntries(
      Object.keys(expectedCore.counts).map((key) => [
        key,
        semantic.plan.counts[key as keyof LinearAuthoritySemanticCoreCountsV4],
      ]),
    ),
    requirements: semantic.plan.requirements,
    decisions: semantic.plan.decisions,
    publicationSequence: semantic.plan.publicationSequence,
  };
  if (
    canonicalLinearAuthoritySemanticPlanV4Json(actualCore) !==
    canonicalLinearAuthoritySemanticPlanV4Json(expectedCore)
  ) {
    throw new Error("Source lineage semantic plan differs from the repo-derived v4 core");
  }
  const requirementById = new Map(
    semantic.plan.requirements.map((row) => [row.canonicalLegacyId, row]),
  );
  const decisionById = new Map(
    semantic.plan.decisions.map((row) => [row.legacyId, row]),
  );
  for (const row of classifiedInventory) {
    const requirement = requirementById.get(row.requirementId);
    const decision = decisionById.get(row.requirementId);
    if (requirement && row.disposition !== "executable") {
      throw new Error(`Requirement ${row.requirementId} has a disposition override`);
    }
    if (decision && decision.disposition !== row.disposition) {
      throw new Error(`Decision ${row.requirementId} disposition differs from semantic plan`);
    }
    if (!requirement && !decision) {
      throw new Error(`Feature Inventory identity ${row.requirementId} is absent from semantic plan`);
    }
  }
  if ([...requirementById.keys(), ...decisionById.keys()].some((id) => !inventoryById.has(id))) {
    throw new Error("Semantic plan identity is absent from Feature Inventory");
  }

  const checksumsValue = parseJson(sourceChecksumsBytes, "Source checksum contract") as JsonRecord;
  if (checksumsValue.schemaVersion !== 3 || !Array.isArray(checksumsValue.sources)) {
    throw new Error("Source checksum contract must be schemaVersion 3");
  }
  const checksumContract = checksumsValue as unknown as SourceChecksumContract;
  const checksumFindings = verifySourceChecksumContract(checksumContract, input.repositoryRoot);
  if (checksumFindings.length !== 0) {
    throw new Error(`Source checksum contract has ${checksumFindings.length} finding(s)`);
  }
  const checksumRows = new Map<string, JsonRecord>();
  for (const rawRow of checksumsValue.sources) {
    if (rawRow && typeof rawRow === "object" && !Array.isArray(rawRow)) {
      const row = rawRow as JsonRecord;
      if (typeof row.sourceId === "string") checksumRows.set(row.sourceId, row);
    }
  }

  const { sources, indexes } = sourceMetadata(input.repositoryRoot, input.sourceFiles);
  const resolutionCache = createLinearSourceChecksumResolutionCache();
  const computedSourceSetRoot = computeLinearAuthoritySourceSetRoot(sources);
  if (computedSourceSetRoot !== input.authority.sourceSetRoot) {
    throw new Error("Source lineage sourceSetRoot binding drift");
  }

  const orderedIdentities = [
    ...semantic.plan.requirements.map((row) => ({
      id: row.canonicalLegacyId,
      role: "requirement" as const,
      disposition: null,
    })),
    ...semantic.plan.decisions.map((row) => ({
      id: row.legacyId,
      role: "decision" as const,
      disposition: row.disposition,
    })),
  ];
  const pending: PendingBinding[] = [];
  let retiredSourceDecisions = 0;
  for (const identity of orderedIdentities) {
    const requirement = inventoryById.get(identity.id)!;
    const semanticDecision = decisionById.get(identity.id);
    const planKey = targetPlanKey(identity.role, identity.id);
    const replacementLegacyId = requirement.replacementId ?? null;
    if (requirement.sourceDoc === RETIRED_SOURCE_PATH) {
      if (
        identity.role !== "decision" ||
        identity.disposition !== "retired_source" ||
        requirement.disposition !== "retired_source" ||
        replacementLegacyId === null ||
        !requirementById.has(replacementLegacyId) ||
        requirement.dependencies.length !== 1 ||
        requirement.dependencies[0] !== replacementLegacyId ||
        semanticDecision === undefined ||
        semanticDecision.requirementRelations.length !== 1 ||
        semanticDecision.requirementRelations[0] !== replacementLegacyId
      ) {
        throw new Error(`Retired source identity ${identity.id} lacks exact disposition evidence`);
      }
      retiredSourceDecisions += 1;
      pending.push({
        requirement,
        targetPlanKey: planKey,
        semanticRole: identity.role,
        disposition: identity.disposition,
        replacementLegacyId,
        resolution: "retired_source_disposition",
        sourceBindingSha256: null,
        ranges: [],
        unresolved: null,
      });
      continue;
    }
    if (
      SOURCE_PATH_SET.has(requirement.sourceDoc) &&
      PRICING_PATHS.has(requirement.sourceDoc as LinearAuthoritySourcePath) &&
      (identity.role !== "decision" || identity.disposition !== "narrative_context")
    ) {
      throw new Error(`Pricing source ${identity.id} must originate a narrative-context Decision`);
    }
    if (!SOURCE_PATH_SET.has(requirement.sourceDoc)) {
      const unresolved: LinearAuthoritySourceLineageUnresolvedRow = {
        targetLegacyId: identity.id,
        targetPlanKey: planKey,
        sourceDocument: requirement.sourceDoc,
        sourceAnchor: requirement.section,
        code: "source_outside_canonical_set",
        message: `${identity.id} source is outside the seven canonical compiler inputs`,
      };
      pending.push({
        requirement,
        targetPlanKey: planKey,
        semanticRole: identity.role,
        disposition: identity.disposition,
        replacementLegacyId,
        resolution: null,
        sourceBindingSha256: null,
        ranges: [],
        unresolved,
      });
      continue;
    }
    const reviewedOverride = REVIEWED_EXACT_HEADING_OVERRIDES[identity.id];
    if (reviewedOverride) {
      if (
        requirement.sourceDoc !== reviewedOverride.sourceDoc ||
        requirement.section !== REVIEWED_EXPECTED_INVENTORY_ANCHORS[identity.id]
      ) {
        throw new Error(`Reviewed exact source selector for ${identity.id} has source or anchor drift`);
      }
      const slices = [{
        sourceDoc: reviewedOverride.sourceDoc,
        startHeading: reviewedOverride.startHeading,
        endHeading: reviewedOverride.endHeading,
      }];
      const ranges = slices.map((slice) => rangeForSelector(slice, indexes));
      pending.push({
        requirement,
        targetPlanKey: planKey,
        semanticRole: identity.role,
        disposition: identity.disposition,
        replacementLegacyId,
        resolution: "reviewed_exact_heading",
        sourceBindingSha256: sourceSliceBindingSha256(slices),
        ranges,
        unresolved: null,
      });
      continue;
    }
    try {
      const resolved = checksumRows.has(identity.id)
        ? resolveSourceRequirementChecksum(
          requirement,
          checksumContract,
          input.repositoryRoot,
        )
        : resolutionCache.resolve(
          requirement,
          input.repositoryRoot,
          requirement.section,
        );
      const ranges = rangesForResolution(
        resolved,
        indexes,
        checksumRows.get(identity.id),
      );
      if (
        ranges.some((range) => PRICING_PATHS.has(range.sourcePath)) &&
        (identity.role !== "decision" || identity.disposition !== "narrative_context")
      ) {
        throw new Error(`Pricing source ${identity.id} must originate a narrative-context Decision`);
      }
      if (ranges.some((range) => CONTEXT_ONLY_PATHS.has(range.sourcePath))) {
        throw new Error("Audit and Research sources are offline context only");
      }
      pending.push({
        requirement,
        targetPlanKey: planKey,
        semanticRole: identity.role,
        disposition: identity.disposition,
        replacementLegacyId,
        resolution: resolved.selector,
        sourceBindingSha256: resolved.sourceBindingSha256,
        ranges,
        unresolved: null,
      });
    } catch (error) {
      const detail = error instanceof Error ? error.message : String(error);
      const unresolved: LinearAuthoritySourceLineageUnresolvedRow = {
        targetLegacyId: identity.id,
        targetPlanKey: planKey,
        sourceDocument: requirement.sourceDoc,
        sourceAnchor: requirement.section,
        code: "exact_source_selector_unresolved",
        message: `${identity.id} exact source selector is unresolved: ${detail}`,
      };
      pending.push({
        requirement,
        targetPlanKey: planKey,
        semanticRole: identity.role,
        disposition: identity.disposition,
        replacementLegacyId,
        resolution: null,
        sourceBindingSha256: null,
        ranges: [],
        unresolved,
      });
    }
  }
  if (retiredSourceDecisions !== 10) {
    throw new Error(`Source lineage must contain exactly 10 kb_eng retired Decisions`);
  }

  const sourceSlices: LinearAuthoritySourceLineageSlice[] = [];
  for (const source of sources) {
    const boundaries = new Set<number>([0, source.byteLength]);
    for (const row of pending) {
      for (const range of row.ranges) {
        if (range.sourcePath === source.path) {
          boundaries.add(range.byteStart);
          boundaries.add(range.byteEnd);
        }
      }
    }
    const ordered = [...boundaries].sort((left, right) => left - right);
    for (let index = 0; index < ordered.length - 1; index += 1) {
      const byteStart = ordered[index]!;
      const byteEnd = ordered[index + 1]!;
      if (byteEnd <= byteStart) throw new Error(`Source partition is invalid for ${source.path}`);
      const supported = pending.some((row) => row.ranges.some((range) =>
        range.sourcePath === source.path &&
        range.byteStart <= byteStart &&
        range.byteEnd >= byteEnd
      ));
      const sliceBytes = indexes.get(source.path)!.bytes.subarray(byteStart, byteEnd);
      sourceSlices.push({
        key: `source-slice:${source.precedence}:${byteStart}-${byteEnd}`,
        sourcePath: source.path,
        byteStart,
        byteEnd,
        ...sliceAnchors(sliceBytes),
        rawSha256: sha256(sliceBytes),
        normalizedSha256: sha256(
          normalizeLinearAuthoritySourceMarkdown(decodeUtf8(sliceBytes, "Source slice")),
        ),
        contextRole: supported ? "target_support" : "canonical_document_context",
      });
    }
  }
  for (const slice of sourceSlices) {
    if (CONTEXT_ONLY_PATHS.has(slice.sourcePath) && slice.contextRole !== "canonical_document_context") {
      throw new Error(`${slice.sourcePath} must remain offline canonical_document_context`);
    }
  }

  const targetBindings = pending.map((row): LinearAuthoritySourceLineageTargetBinding => {
    const supportSliceKeys: string[] = [];
    for (const range of row.ranges) {
      for (const slice of sourceSlices) {
        if (
          slice.sourcePath === range.sourcePath &&
          slice.byteStart >= range.byteStart &&
          slice.byteEnd <= range.byteEnd &&
          !supportSliceKeys.includes(slice.key)
        ) supportSliceKeys.push(slice.key);
      }
    }
    if (row.resolution === "retired_source_disposition" && supportSliceKeys.length !== 0) {
      throw new Error(`Retired source Decision ${row.requirement.requirementId} has canonical slices`);
    }
    return {
      targetLegacyId: row.requirement.requirementId,
      targetPlanKey: row.targetPlanKey,
      semanticRole: row.semanticRole,
      disposition: row.disposition,
      inventorySourceDocument: row.requirement.sourceDoc,
      inventorySourceVersion: row.requirement.sourceVersion,
      inventorySourceAnchor: row.requirement.section,
      status: row.unresolved === null ? "resolved" : "unresolved",
      resolution: row.resolution,
      sourceBindingSha256: row.sourceBindingSha256,
      supportSliceKeys,
      replacementLegacyId: row.replacementLegacyId,
    };
  });
  const unresolved = pending.flatMap((row) => row.unresolved ? [row.unresolved] : []);
  const coverageRoot = sourceCoverageRoot(sources, sourceSlices);
  const withoutLineageRoot: Omit<LinearAuthoritySourceLineage, "sourceLineageRoot"> = {
    schemaVersion: 1,
    kind: "linear_authority_source_lineage",
    authority: { ...input.authority },
    sourceChecksumsSha256: sha256(sourceChecksumsBytes),
    dispositionsSha256: sha256(dispositionsBytes),
    sources,
    sourceSlices,
    targetBindings,
    unresolved,
    sourceCoverageRoot: coverageRoot,
    sourcePartitionValidated: true,
    sourceExtractionCoverageValidated: unresolved.length === 0,
    semanticPlanInternalsValidated: true,
    captureEvidenceValidated: semantic.captureEvidenceValidated,
    semanticCoverageValidated: false,
    mutationAuthorized: false,
  };
  return {
    ...withoutLineageRoot,
    sourceLineageRoot: computeLinearAuthoritySourceLineageRoot(withoutLineageRoot),
  };
}

export function parseLinearAuthoritySourceLineage(
  raw: string | Uint8Array,
): LinearAuthoritySourceLineage {
  const parsed = parseJson(bytes(raw), "Source lineage");
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("Source lineage must be an object");
  }
  const row = parsed as JsonRecord;
  const expected = [
    "schemaVersion", "kind", "authority", "sourceChecksumsSha256",
    "dispositionsSha256", "sources", "sourceSlices", "targetBindings",
    "unresolved", "sourceCoverageRoot", "sourceLineageRoot",
    "sourcePartitionValidated", "sourceExtractionCoverageValidated",
    "semanticPlanInternalsValidated", "captureEvidenceValidated", "semanticCoverageValidated",
    "mutationAuthorized",
  ].sort();
  if (JSON.stringify(Object.keys(row).sort()) !== JSON.stringify(expected)) {
    throw new Error("Source lineage top-level contract is invalid");
  }
  if (row.schemaVersion !== 1 || row.kind !== "linear_authority_source_lineage") {
    throw new Error("Source lineage identity is invalid");
  }
  return parsed as LinearAuthoritySourceLineage;
}

export function validateLinearAuthoritySourceLineage(
  input: LinearAuthoritySourceLineageValidationInput,
): LinearAuthoritySourceLineageValidationSummary {
  const lineageBytes = bytes(input.lineageRaw);
  const actual = parseLinearAuthoritySourceLineage(lineageBytes);
  const expected = compileLinearAuthoritySourceLineage(input);
  if (canonicalJson(actual) !== canonicalJson(expected)) {
    throw new Error("Source lineage differs from deterministic source compilation");
  }
  const retiredSourceDecisions = actual.targetBindings.filter((row) =>
    row.resolution === "retired_source_disposition"
  ).length;
  return {
    status: actual.sourceExtractionCoverageValidated
      ? "source_lineage_coverage_validated"
      : "source_lineage_coverage_incomplete",
    sourceLineageSha256: sha256(lineageBytes),
    workspaceId: actual.authority.workspaceId,
    sourceCommit: actual.authority.sourceCommit,
    planRoot: actual.authority.planRoot,
    sourceSetRoot: actual.authority.sourceSetRoot,
    semanticPlanSha256: actual.authority.semanticPlanSha256,
    semanticRoot: actual.authority.semanticRoot,
    featureInventorySha256: actual.authority.featureInventorySha256,
    sourceCoverageRoot: actual.sourceCoverageRoot,
    sourceLineageRoot: actual.sourceLineageRoot,
    sources: 7,
    sourceSlices: actual.sourceSlices.length,
    requirements: 926,
    decisions: 61,
    retiredSourceDecisions: 10,
    unresolved: actual.unresolved.length,
    sourcePartitionValidated: true,
    sourceExtractionCoverageValidated: actual.sourceExtractionCoverageValidated,
    semanticPlanInternalsValidated: true,
    captureEvidenceValidated: actual.captureEvidenceValidated,
    semanticCoverageValidated: false,
    mutationAuthorized: false,
  };
}
