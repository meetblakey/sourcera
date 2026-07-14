import { anchorForLine, findSectionByTitle, parseTableAt } from "../lib/spec_loader.js";
import type { Finding, GateContext, RowClass, SpecDoc, SpecLintGate } from "../lib/types.js";

type CheckFn = (doc: SpecDoc) => Finding[];

function push(findings: Finding[], doc: SpecDoc, line: number, matched: string, message: string) {
  findings.push({
    file: doc.path,
    line,
    anchor: anchorForLine(doc, line),
    matched_text: matched,
    message,
  });
}

function section(doc: SpecDoc, title: string | RegExp, label: string, findings: Finding[]) {
  const s = findSectionByTitle(doc, title);
  if (!s) {
    push(findings, doc, 0, label, `${label} section is missing.`);
    return null;
  }
  return {
    ...s,
    text: doc.lines.slice(s.startLine, s.endLine + 1).join("\n"),
  };
}

function requireSectionTokens(
  findings: Finding[],
  doc: SpecDoc,
  title: string | RegExp,
  label: string,
  tokens: string[],
) {
  const s = section(doc, title, label, findings);
  if (!s) return;
  for (const token of tokens) {
    if (!s.text.includes(token)) {
      push(findings, doc, s.startLine, token, `${label} is missing required token: ${token}`);
    }
  }
}

function rowByField(doc: SpecDoc, title: string | RegExp, field: string, label: string, findings: Finding[]) {
  const s = section(doc, title, label, findings);
  if (!s) return null;
  const table = parseTableAt(doc, s.startLine, s.endLine);
  const row = table.rows.find((r) => r.cells[0] === `\`${field}\``);
  if (!row) {
    push(findings, doc, table.header?.line ?? s.startLine, field, `${label} is missing field \`${field}\`.`);
    return null;
  }
  return row;
}

function requireFieldTokens(
  findings: Finding[],
  doc: SpecDoc,
  title: string | RegExp,
  field: string,
  label: string,
  tokens: string[],
) {
  const row = rowByField(doc, title, field, label, findings);
  if (!row) return;
  const text = row.cells.join(" | ");
  for (const token of tokens) {
    if (!text.includes(token)) {
      push(findings, doc, row.line, token, `${label} field \`${field}\` is missing required token: ${token}`);
    }
  }
}

function forbidSectionPatterns(
  findings: Finding[],
  doc: SpecDoc,
  title: string | RegExp,
  label: string,
  patterns: Array<{ pattern: RegExp; reason: string }>,
) {
  const s = section(doc, title, label, findings);
  if (!s) return;
  for (let line = s.startLine; line <= s.endLine; line++) {
    const text = doc.lines[line] ?? "";
    for (const { pattern, reason } of patterns) {
      if (pattern.test(text)) push(findings, doc, line, text.trim(), reason);
    }
  }
}

function m5RuntimeActiveFindings(doc: SpecDoc, gateId: string): Finding[] {
  const findings: Finding[] = [];
  const row = doc.lines.findIndex((line) => line.trim().startsWith(`| \`${gateId}\` |`));
  if (row < 0) {
    push(findings, doc, 0, gateId, `§M.5 row ${gateId} is missing.`);
    return findings;
  }
  const text = doc.lines[row] ?? "";
  const tokens = [
    "**`runtime_active`**",
    `tools/spec-lint/gates/${gateId}.ts`,
    "verified PASS on live Master Spec and pass/fail fixtures",
  ];
  for (const token of tokens) {
    if (!text.includes(token)) {
      push(findings, doc, row, token, `§M.5 ${gateId} row is missing required runtime-active token: ${token}`);
    }
  }
  return findings;
}

export function buildSellerPublicPagesGate(id: string, rowClass: RowClass, check: CheckFn): SpecLintGate {
  return {
    id,
    sourcePhase: "v7.2.0-REM Phase 5.6 Seller Profiles / Public Pages",
    rowClass,
    executionContext: "pr_lint",
    overridePath: "not_permitted_catalog_completeness",
    inputs: { masterSpec: true },
    version: "1.0.0",
    run(ctx: GateContext): Finding[] {
      return [...check(ctx.masterSpec), ...m5RuntimeActiveFindings(ctx.masterSpec, id)];
    },
  };
}

export function sellerProfilePublicFieldContractFindings(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  requireSectionTokens(findings, doc, /^26\.1 Seller Profile\b/, "§26.1 Seller Profile", [
    "The canonical entity schema is §4.4.3.",
    "field types, constraints, scope isolation, retention, DSAR, and residency are owned by §4.4.3 / §40.2",
    "Seller Profile.`vendor_name`",
    "Seller Profile.`logo_url`",
    "Seller Profile.`description`",
    "Seller Profile.`website_url`",
    "Seller Profile.`headquarters_country`",
    "Seller Profile.`founded_year`",
    "Seller Profile.`employee_count`",
    "Seller Profile.`industries` -> Controlled-Vocabulary Tag (§4.5.5)",
    "Seller Profile.`certifications` -> Controlled-Vocabulary Tag (§4.5.5)",
    "Seller Profile.`verification_tier`; Appendix J `seller_verification_tier`",
    "Seller Profile.`public_contact_email`",
  ]);
  requireFieldTokens(findings, doc, /^4\.4\.3 Seller Profile\b/, "industries", "§4.4.3 Seller Profile", [
    "Controlled-Vocabulary Tag (§4.5.5)",
    "taxonomy_dimension=industry",
    "consumer_requires_approved_tag",
  ]);
  requireFieldTokens(findings, doc, /^4\.4\.3 Seller Profile\b/, "certifications", "§4.4.3 Seller Profile", [
    "Controlled-Vocabulary Tag (§4.5.5)",
    "taxonomy_dimension=certification",
    "Certification badge references",
  ]);
  requireFieldTokens(findings, doc, /^4\.4\.3 Seller Profile\b/, "verification_tier", "§4.4.3 Seller Profile", [
    "Appendix J `seller_verification_tier`",
    "§4.4.21",
    "§26.2 is descriptive only",
  ]);
  requireFieldTokens(findings, doc, /^4\.4\.3 Seller Profile\b/, "public_contact_email", "§4.4.3 Seller Profile", [
    "valid email",
    "Seller Org explicitly opts in",
    "DSAR Pattern A",
  ]);
  return findings;
}

export function verificationTierCriteriaSingleSourceFindings(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  requireSectionTokens(findings, doc, /^26\.2 Verification Tiers\b/, "§26.2 Verification Tiers", [
    "earned trust badges, not paid placements",
    "§4.4.21 is the canonical source",
    "§34.16.2 owns Marketplace Discovery pricing and the earned-free policy",
    "§27.4.3 treats `verification_tier_ordinal` as one learned ranking feature",
    "no section may promise a deterministic visibility boost",
    "§4.4.21 `basic` definition",
    "§4.4.21 `verified` definition; thresholds in §34.16.2.A",
    "§4.4.21 `certified` definition; thresholds in §34.16.2.A",
  ]);
  requireSectionTokens(findings, doc, /^4\.4\.21 VerificationReviewRecord\b/, "§4.4.21 VerificationReviewRecord", [
    "Verification tiers are **earned, not purchased**",
    "**Tier definitions** (per Appendix J `seller_verification_tier`)",
    "`basic`",
    "`verified`",
    "`certified`",
    "§34.16.2.A",
    "Verification certified re-review cadence",
  ]);
  requireSectionTokens(findings, doc, /^27\.4 Marketplace Match Score\b/, "§27.4 Marketplace Match Score", [
    "verification_tier_ordinal",
  ]);
  return findings;
}

export function capabilityDeclarationSection26NoShadowSchemaFindings(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  requireSectionTokens(findings, doc, /^26\.3 Capability Declarations\b/, "§26.3 Capability Declarations", [
    "canonical Capability Declaration entity (§4.4.4)",
    "§26.3 does not own a separate schema or lifecycle enum",
    "Appendix J `capability_categories`",
    "`canonical_capability_id` -> CapabilityRegistryEntry (§4.8.2 / §21.4)",
    "KB-backed suggestions and evidence-overlap rules are canonical in §22.14.3",
    "§4.4.4 field table",
    "no `verification_status` column exists",
    "Appendix J `capability_declaration_state`; §4.4.4 state machine",
    "§21.4 / §4.8.2 `CapabilityRegistryEntry`",
    "§4.4.4 `capability_type`, `state`, and Match-Score eligibility",
  ]);
  requireFieldTokens(findings, doc, /^4\.4\.4 Capability Declaration\b/, "capability_type", "§4.4.4 Capability Declaration", [
    "Appendix J `capability_declaration_type`",
    "taxonomy_declaration",
    "narrative_only",
  ]);
  requireFieldTokens(findings, doc, /^4\.4\.4 Capability Declaration\b/, "canonical_capability_id", "§4.4.4 Capability Declaration", [
    "§4.8.2 CapabilityRegistryEntry",
    "required when `capability_type = taxonomy_declaration`",
    "forbidden when `capability_type = narrative_only`",
  ]);
  forbidSectionPatterns(findings, doc, /^26\.3 Capability Declarations\b/, "§26.3 Capability Declarations", [
    {
      pattern: /^\s*\|\s*`?verification_status`?\s*\|/,
      reason: "§26.3 must not reintroduce `verification_status` as a schema field.",
    },
  ]);
  return findings;
}

export function sellerPageEnrichmentCapabilityIdSingleSourceFindings(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  requireSectionTokens(findings, doc, /^4\.4\.10 SellerOrgPage\b/, "§4.4.10 SellerOrgPage", [
    "`seller_page_enrichment`",
    "legacy `page_enrichment` accepted only as an alias",
    "rewritten to canonical at write time",
    "CapabilityRegistryEntry.aliases",
    "enrichment_cost_center_resolved",
    "MUST NOT be hardcoded",
  ]);
  requireSectionTokens(findings, doc, /^4\.4\.11 SoftwarePage\b/, "§4.4.11 SoftwarePage", [
    "`seller_page_enrichment`",
    "legacy alias `page_enrichment` accepted at API boundary",
    "rewritten at write time",
    "enrichment_cost_center_resolved",
  ]);
  requireSectionTokens(findings, doc, /^26\.7\.2 Page Enrichment via `seller_page_enrichment` Capability\b/, "§26.7.2 Page Enrichment", [
    "The `seller_page_enrichment` capability is the canonical Appendix J `capability_id` per §21.4.2 row 1",
    "model tier, cost center, prices, and minimum plan gate are owned by the CapabilityRegistryEntry / §34.1.2 authority chain",
    "legacy alias `page_enrichment` is accepted at the API boundary and rewritten to canonical form at write time",
    "CapabilityRegistryEntry.cost_center_default",
    "§21.4.2 / §34.1.2 / §34.14.1 row-8 chain",
    "§34.8.5 / §34.1.2",
  ]);
  requireSectionTokens(findings, doc, /^26\.8\.5 Software Pages\b/, "§26.8.5 Software Pages", [
    "same canonical `seller_page_enrichment` capability and workflow as SellerOrgPages (§26.7.2)",
    "legacy `page_enrichment` is accepted only as a CapabilityRegistryEntry alias",
    "rewritten at the API boundary",
  ]);
  forbidSectionPatterns(findings, doc, /^26\.7\.2 Page Enrichment via `seller_page_enrichment` Capability\b/, "§26.7.2 Page Enrichment", [
    { pattern: /\$8\.00|\$1\.10/, reason: "§26.7.2 must not restate seller_page_enrichment value/cost prices; cite §21.4.2 / §34.1.2." },
    { pattern: /`seller_starter` minimum plan-gate/, reason: "§26.7.2 must not restate the minimum plan gate; cite §21.4.2 / §34.1.2." },
  ]);
  return findings;
}

export function sellerSoftwareUnclaimedStubRenderModeFindings(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  requireFieldTokens(findings, doc, /^4\.4\.9 SellerSoftware\b/, "public_render_mode", "§4.4.9 SellerSoftware", [
    "Appendix J `seller_software_public_render_mode`",
    "unclaimed_stub",
    "published_full",
    "suppressed_placeholder",
    "archived_gone",
  ]);
  requireSectionTokens(findings, doc, /^26\.8\.1 SellerSoftware Lifecycle\b/, "§26.8.1 SellerSoftware Lifecycle", [
    "public_render_mode=unclaimed_stub",
    "not a published SoftwarePage",
    "excluded from sitemaps",
    "X-Robots-Tag: noindex, nofollow",
  ]);
  requireSectionTokens(findings, doc, /^4\.4\.11 SoftwarePage\b/, "§4.4.11 SoftwarePage", [
    "`unclaimed_stub` route rendering is produced from SellerSoftware",
    "X-Robots-Tag: noindex, nofollow",
    "excluded from sitemaps",
    "MUST NOT serialize `pending_enrichment_draft_json`, KB fields, Capability Declaration evidence ids, seller contacts, or Schema.org `Product` payload",
  ]);
  return findings;
}

export function optOutHttpResponseSingleSourceFindings(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  requireSectionTokens(findings, doc, /^4\.5\.6 Vendor Opt-Out Record\b/, "§4.5.6 Vendor Opt-Out Render Contract", [
    "SellerOrgPage (§4.4.10), SoftwarePage (§4.4.11)",
    "HTTP 200 placeholder body",
    "`X-Robots-Tag: noindex`",
    "Schema.org omitted",
    "sitemap entry removed",
    "HTTP 410 is reserved for `archived` / hard-purged routes per §26.9.5",
  ]);
  requireSectionTokens(findings, doc, /^4\.4\.10 SellerOrgPage\b/, "§4.4.10 SellerOrgPage", [
    "`published` | `suppressed_by_opt_out`",
    "Public URL returns a \"Vendor opted out\" stub",
  ]);
  requireSectionTokens(findings, doc, /^4\.4\.9 SellerSoftware\b/, "§4.4.9 SellerSoftware", [
    "suppressed_placeholder",
    "archived_gone",
  ]);
  return findings;
}
