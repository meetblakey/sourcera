# Phase 33 Findings — §33 Enterprise Security & Compliance

**Scope.** Single-prompt audit of Master Spec v7.1.0 §33 (lines 28708–28786) against the eight §33-prompt checks (SOC 2 Type II controls mapped, ISO 27001 controls mapped, penetration-testing cadence, Vulnerability Disclosure Program, subprocessor list cited from §6.8, encryption at rest + in transit, key management + rotation cadence, incident-response runbook).

**Date.** 2026-05-09.

**Verdict.** §33 fails the production-readiness bar for its title. The section is ~78 lines of largely declarative prose for a chapter that should anchor the entire enterprise security & compliance contract for the platform. Of the eight prompt checks: zero pass cleanly. Two are declarative-only (SOC 2 / ISO 27001 with no control mapping); one is partial (encryption mentioned without modes, ciphers, or rotation cadence); two are entirely absent (VDP, security-specific incident-response runbook); one is broken-by-citation (multiple sections cite "§33.9 presigned-URL convention" but §33.9 is "Acceptance Criteria" and contains no such clause); two are routed to other sections without cross-references (subprocessor list lives at §45.1; the canonical Customer Communication Workflow citation at line 38777 dereferences "§6.6 Security Communication" but §6.6 is "API Token Authentication"); and one (penetration testing) names cadence without scope, retest cadence, or remediation SLA.

§33 also under-meets every Master Spec authoring convention: prose-only ACs (§33.9), no plan-gating row pointers despite gating five Enterprise-only controls inline, no Appendix M.1 surface/engine rows for IP allowlisting, SBOM, SIEM integration, customer-managed keys, or anonymized DSAR export, and no §4 entity schema for IP Allowlisting despite it being introduced as a configurable feature.

---

## Walking the eight checks

### Check 1 — SOC 2 Type II controls mapped

**Fail.** §33.5 declares SOC 2 Type II "Targeted within 12 months of launch" with no Trust Services Criteria control mapping. Other sections cite specific controls in passing (e.g., §4.6.1.1 cites "SOC 2 CC6.1"; §6.7.1 cites "SOC 2 CC6.1 / NIST SP 800-53 AU-2"; §6.8.5 retention cites "SOC 2 / NIST AU-2 require 1-year minimum") but no central CC1.x → CC9.x → engineering-surface registry exists. An auditor or engineer cannot answer "which Master Spec section implements SOC 2 CC7.1 (vulnerability management)?" without grep-and-pray.

→ **D-33-001** (P2 — SOC 2 Type II control map missing).

### Check 2 — ISO 27001 controls mapped (where claimed)

**Fail.** §33.5 declares ISO 27001 "Planned" with no Annex A control enumeration. Other sections refer to ISO 27001 only as a verification-tier requirement on Sellers (§4.4.21 — "SOC 2 or ISO 27001 document uploaded"), as a Capability Declaration claim ("ISO 27001 certified"), or as buyer-policy-parsing input. No internal Sourcera-side ISO 27001 control implementation map exists.

→ **D-33-002** (P2 — ISO 27001 Annex A control map missing).

### Check 3 — Penetration testing cadence spec'd

**Partial.** §33.9 AC reads "Annual penetration testing by independent security firm." Cadence is stated. Scope is unstated (network / web app / API / cloud / red-team / phishing). Remediation SLA per finding severity is unstated. Retest cadence after remediation is unstated. Third-party report distribution policy is unstated (Trust Center? Enterprise NDA only? Public summary?). The marker at line 39107 ("External penetration test asserts monthly" against Ops-only `/ops/taxonomy/*` endpoint reachability) implies a continuous ASV-style cadence which contradicts the §33.9 "annual" line. The §22 KB-content example at line 16710 references FIPS 140-2 Level 3 HSMs as a *seller* claim, not a Sourcera contract.

→ **D-33-003** (P2 — pen-test scope, remediation SLA, retest cadence, distribution policy unspecified; cadence-drift between §33.9 "annual" and §39107 "monthly").

### Check 4 — Vulnerability Disclosure Program (VDP) referenced

**Fail.** Corpus grep for `VDP`, `vulnerability disclosure`, `bug bounty`, `coordinated disclosure`, `responsible disclosure`, `security.txt` returns zero hits. SOC 2 CC7.1 (system operations / vulnerability detection and remediation) and ISO 27001 A.12.6.1 (technical-vulnerability management) both expect a documented coordinated-disclosure path. Without a VDP, Sourcera has no defined intake for external researcher reports, no triage SLA, no scope (in-scope / out-of-scope domains), no safe-harbor language, no reward / kudos policy, and no `/security.txt` (RFC 9116) at the marketing surface.

→ **D-33-004** (P1 — VDP entirely absent).

### Check 5 — Subprocessor list maintained (cite §6.8)

**Fail (cross-reference defect).** A subprocessor list IS authored — but at §45.1 line 32593: `Subprocessor List: Published at sourcera.io/compliance/subprocessors. Updated quarterly.` §33.5 does not cite it. The audit-prompt check explicitly requires `Subprocessor list maintained (cite §6.8)`; §6.8 itself references a "DPA Appendix" (per §27.9 and §27.10 sub-processor disclosure rows) but no such appendix is structurally authored as a §6.8 sub-section or as an Appendix entry. §33.5 lacks any cross-reference to §45.1, §6.8, or the DPA. A reader of §33 alone is unable to answer "where is the subprocessor list authored, who maintains it, what is the customer-notification SLA on a new sub-processor?".

→ **D-33-005** (P2 — §33.5 does not cite the subprocessor-list authority; "DPA Appendix" referenced from §27 but not authored as a §6.8 sub-section).

### Check 6 — Encryption at rest + in transit standards

**Partial.** §33.1 declares `AES-256` (no mode — GCM vs CBC vs CTR) and `TLS 1.3` (no cipher-suite enumeration). FIPS 140-2 / FIPS 140-3 posture is unstated. HSTS header policy is unstated. Perfect-forward-secrecy claim is unstated. Certificate-management policy (issuer, lifetime, automated rotation) is unstated. Field-level PII encryption is `Enterprise Phase 2 roadmap` with no acceptance criteria, no plan-gating row pointer, and no Appendix M.1 surface/engine row. The §22 KB-content excerpt at line 16732 references `AES-256-GCM` + `FIPS 140-2 Level 3 HSMs` as *seller* policy fixture, not a Sourcera contract — a hostile reviewer reading §33.1 alone cannot determine Sourcera's actual posture. §4.5.x OAuth token ciphertext fields specify `AES-256-GCM` (lines 26079–26080) — that is the only Master Spec authoring of AES mode, and it is at the entity level, not at §33.1.

→ **D-33-006** (P2 — encryption standards under-specified; AES-256 mode, FIPS posture, HSTS, PFS, certificate management all silent).

### Check 7 — Key management (KMS) and rotation cadence

**Fail.** §33.1 reads `Key Management: Convex-managed. Customer-managed encryption keys on Phase 2 roadmap.` Rotation cadence is entirely absent. Webhook signing-key rotation is documented at §31 (`signing_key_id` field at line 34466, "current key + N prior keys remain verifiable"). DSAR per-bundle KMS key is documented at §6.8 (line 10554). Convex deploy-key rotation has a CI gate `convex_deploy_key_rotation_age_lt_1h` at line 38402. None of these are aggregated to §33.1, and there is no platform-wide Convex master-key rotation cadence stated. SOC 2 CC6.1 / ISO 27001 A.10.1.2 / NIST SP 800-57 each expect documented rotation cadence per key type. "Customer-managed encryption keys on Phase 2 roadmap" lacks dating, plan-gating row, and Appendix M.1 anchor.

→ **D-33-007** (P1 — KMS rotation cadence absent; CMEK roadmap undated and non-gated).

### Check 8 — Incident response runbook referenced

**Fail.** §33.7 is three prose lines: "Security incidents reported to affected customers within 24 hours. Breach notification per GDPR Article 33, CCPA, state laws. Postmortem: RCA within 48 hours." No reference to a security-specific runbook. The general operational runbook surface lives at §42.6 (`On-Call Runbooks: Stored in Notion`) and the Cross-Console-Bridge runbook lives at `https://runbooks.sourcera.com/cross-console-bridge` (§25.6.4); a security-specific runbook is neither authored nor referenced. The Customer Communication Workflow citation at line 38777 dereferences `§6.6 Security Communication` — but §6.6 is `API Token Authentication`. Broken cross-reference. §33.7's two numerical singletons (24h customer notification; 48h RCA) are duplicated at §42.3 lines 32138–32139 (`Postmortem scheduled within 24 hours; RCA completed within 48 hours`) without an authoritative-home pointer either way. SEV taxonomy at §42.3 is operational-outage taxonomy; no security-incident severity matrix exists (e.g., data-breach, account-takeover, supply-chain compromise, insider threat).

→ **D-33-008** (P1 — security-specific incident-response runbook absent; broken §6.6 "Security Communication" citation; §33.7 numerical duplication of §42.3).

---

## Secondary findings (out-of-band on the eight checks but surfaced in the §33 walk)

### Broken §33.9 cross-reference for presigned-URL TTL + IP-binding

Multiple sections cite `§33.9` as the authoritative home for the 15-minute TTL + single-IP-bound presigned-URL convention:

- Line 18673: `Presigned URL (S3 path-style, 15-minute TTL, single-IP-bound per §33.9)`.
- Line 18823: `the presigned URL TTL is 15 minutes per §33.9`.
- Line 27877: `presigned URL (15-minute TTL, single-IP-bound per §33.9)`.
- Line 28459: `presigned URL (15-minute TTL, single-IP-bound per §33.9)`.
- Line 28655: `15-minute TTL per §22.18.2.5 and §33.9 egress-binding convention`.
- Line 42673: `the §33.9 presigned-URL-fetch observability pipeline`.

§33.9 is the section's Acceptance Criteria block (six prose bullets). Nowhere in §33 is the 15-minute TTL or the single-IP-bound rule authored. A junior engineer following the citation chain ends at six unrelated ACs. CI-gate-level numerical singleton with five citation sites and zero authoritative home.

→ **D-33-009** (P1 — five-site ghost citation to §33.9 for a numerical singleton that does not exist; presigned-URL TTL has no authoritative home).

### §33.4 DSAR 30-day window inline-restated without §6.8.6 citation

§33.4 line 28733: `GDPR Compliance: 30-day response window.` §6.8.6 is the canonical home for the DSAR fulfillment SLA per Phase 12.5 R-01 closure (line 10380): `Promoted from prose-distributed mentions in §6.8.1 / §6.8.2 / §6.8.3 / §33.4 in Phase 12.5 (R-01 closure).` Line 10394 hard-binds: `Every §6.8 / §33.4 mention of the 30-day window MUST cite this table by §6.8.6 reference; new inline duplications fail CI gate `dsar_sla_single_source_of_truth`.` §33.4 violates this gate as authored — the 30-day value is restated inline without `(per §6.8.6)` annotation.

→ **D-33-010** (P2 — `dsar_sla_single_source_of_truth` CI-gate violation at §33.4 line 28733).

### Plan gating in §33 inline-prose without §5.11 / §34.1 / §39 row pointers

§33 inline-gates seven controls to Enterprise without §5.11 / §34.1 / §39 row citations: (a) `IP allowlisting: Enterprise only` (§33.6); (b) `SBOM: Available to Enterprise on request` (§33.6); (c) `API token rotation enforced for Enterprise` (§33.6); (d) `Anonymization Option: Enterprise customers may request anonymized export` (§33.4); (e) `SIEM Integration: Enterprise customers can configure log forwarding` (§33.8); (f) `BAA available: Enterprise (healthcare customers)` (§33.5); (g) `Audit report available to Enterprise under NDA` (§33.5). Per CLAUDE.md §11, plan gating must reflect in §5.11 / §34.1 / §39 — never duplicated inline. None of the seven controls carry a row-pointer citation.

→ **D-33-011** (P1 — seven Enterprise-gated controls in §33 are inline-gated; §5.11 / §34.1 / §39 row pointers absent).

### Appendix M.1 surface/engine rows missing for §33 engine concepts

§33 introduces five engine concepts that lack Appendix M.1 mapping rows: IP Allowlisting (engine + UI surface at "Settings → Security"), SBOM provisioning, SIEM Integration (engine + UI surface at "Settings → Integrations → Security"), Customer-Managed Encryption Keys (engine, Phase 2), Anonymized DSAR Export (engine + Enterprise-gated capability). Per §M.4, every UI surface or engine concept needs an Appendix M.1 row; the `appendix_m_coverage_on_diff` CI gate fires on diff for any new concept without a row.

→ **D-33-012** (P2 — five §33 engine concepts lack Appendix M.1 rows).

### §33.9 ACs are prose, not rule-based

§33.9 reads:

```
- All API endpoints enforce authentication.
- Workspace data never shared across organizations.
- Audit logs retained per plan tier (Section 5.6).
- Annual penetration testing by independent security firm.
- DSAR responses generated within 30 days.
- MFA enforcement checked on every login for Enterprise orgs with flag enabled.
```

None are MUST/SHALL rule-based with observable inputs / outputs / measurable thresholds per §13.10/§14.9/§17.8/§20.7 fidelity. AC #1 ("All API endpoints enforce authentication") is unfalsifiable as written. AC #4 ("Annual penetration testing") has no test target. AC #5 inline-restates the §6.8.6 30-day window without citation.

→ **D-33-013** (P2 — §33.9 ACs are prose, not rule-based; one AC inline-restates a numerical singleton).

### IP Allowlisting introduced without §4 entity schema, §32 API, or audit event

§33.6 introduces `IP allowlisting: Enterprise only. Configured per Organization in Settings → Security.` No §4.x entity exists (e.g., `OrgIPAllowlistEntry`); no §32 API endpoint declares the create / list / delete / activate flow; no Appendix C webhook or Appendix C notification; no audit-event class on allowlist-mutation; no Appendix I error code on disallowed-IP request; no relationship to WorkOS magic-link / SSO callback paths. A junior engineer building this against §33.6 alone produces an unbuildable feature.

→ **D-33-014** (P2 — IP Allowlisting feature lacks entity schema, API, audit class, error codes; entry-point in §33.6 is single-line prose).

### §33.7 RCA-48h numerical singleton drift

`Postmortem: RCA within 48 hours` (§33.7 line 28770) and `RCA completed within 48 hours` (§42.3 line 32139) and `Postmortem scheduled within 24 hours` (§42.3 line 32138) and `Customer notification within 24 hours` (§33.7 line 28768) are duplicated across §33.7 and §42.3 without an authoritative-home pointer. Per Convention #10, every duration has exactly one authoritative home.

→ **D-33-015** (P3 — §33.7 / §42.3 numerical-singleton drift on the 24h customer-notification + 48h RCA timings).

---

## Self-challenge pass

**Re-reading the 15 defects as a hostile reviewer:**

- **D-33-001 / D-33-002 (control map missing).** Defensible at P2. The spec explicitly says SOC 2 is "Targeted within 12 months" — i.e., not a v7.1.0 contract. Demoting to P3 would understate the buildability gap; an engineer cannot select security controls without a target framework map. P2 holds.
- **D-33-003 (pen-test scope).** Cadence IS stated ("annual"); ambiguity is in scope/remediation/retest. P2 holds. Note that line 39107 ("External penetration test asserts monthly") was authored against Ops-only taxonomy endpoints — this is a control-specific test, not a contradiction of §33.9's annual cadence. The defect is the un-aggregated test cadence taxonomy, not a literal contradiction. Wording in D-33-003 amended to "scope/remediation/retest gap with parallel-cadence drift at §39107 noted as a separate observation" rather than asserting a literal contradiction.
- **D-33-004 (VDP).** P1 holds. Without a documented disclosure path, Sourcera cannot lawfully receive a coordinated-disclosure report and would be exposed to CVE-disclosure timing pressure with no triage policy.
- **D-33-005 (subprocessor list).** P2 holds. The list IS authored; the defect is cross-reference. P1 would overstate (the contract exists). P3 would understate (the audit prompt explicitly demanded `cite §6.8`; the cross-reference is missing).
- **D-33-006 (encryption standards).** P2 holds. The contracts are partially authored (AES-256, TLS 1.3 named); the defect is depth (mode, FIPS, ciphers, HSTS, PFS, cert mgmt). Demoting to P3 would let a hostile auditor reject the SOC 2 evidence pack.
- **D-33-007 (KMS rotation cadence).** P1 holds. Rotation cadence is one of the SOC 2 CC6.1 / ISO 27001 A.10.1.2 atomic controls. Without it, the spec is unbuildable as a compliance contract.
- **D-33-008 (security incident-response runbook + broken §6.6 cross-ref).** P1 holds. A broken citation in a Master Spec security section is by definition unbuildable: a reader following the citation lands on the wrong section.
- **D-33-009 (§33.9 ghost citation).** P1 holds. Five citation sites point to a section that does not contain the cited contract; the 15-minute TTL has no authoritative home.
- **D-33-010 (§33.4 DSAR 30-day inline restatement).** P2 holds. The CI gate `dsar_sla_single_source_of_truth` is named in §6.8.6 line 10394; the §33.4 line is a literal violation. P3 would be too soft because the gate is named.
- **D-33-011 (plan gating inline).** P1 holds. CLAUDE.md §11 makes this a structural rule violation across seven inline-gated controls — a feature that gates inline is by definition out of plan-tier-matrix coverage.
- **D-33-012 (Appendix M rows).** P2 holds. §M.4 fires `appendix_m_coverage_on_diff`; missing rows are buildable but contract-incomplete.
- **D-33-013 (prose ACs).** P2 holds. Prose ACs are unbuildable as test contracts but can be tightened in remediation.
- **D-33-014 (IP Allowlisting).** P2 holds. The feature is buildable as a stub but unbuildable to spec without entity / API / audit / error code.
- **D-33-015 (24h/48h drift).** P3 holds. The numbers are not literally inconsistent; the defect is single-source hygiene only.

**Counterfactual pass.** For §33's eight checks, three failure modes the spec must handle but does not:

1. *External researcher reports a P0 vulnerability without a published VDP.* Spec is silent on intake channel, triage SLA, safe-harbor, and acknowledgement timing. → covered by D-33-004.
2. *Customer-managed encryption key compromise (post-Phase-2).* Spec is silent on revocation cadence, customer-side key-rotation API, fail-closed vs fail-open, and on-call escalation. → adjacent to D-33-007 but not separately filed since CMEK is "Phase 2 roadmap"; future audit at CMEK landing.
3. *Sub-processor goes hostile or incurs a SEV-1 incident upstream (e.g., Anthropic data breach).* Spec is silent on the cross-customer notification cadence, the §6.8 DPA-binding-customer-comms-template, and the contract-termination right path. → adjacent to D-33-005 + D-33-008; flagged for v7.1.1 backlog.

---

## Coverage matrix — §33 row pointers

§33 was not seeded in the original Phase 0 Feature Inventory as a cohesive feature row; the closest rows are F-{Compliance & Security}, F-{MFA}, F-{Audit Logs}, F-{DSAR}, F-{Encryption}. Promoting the §33 cells in the COVERAGE_MATRIX.md as a separate audit-pass — to be co-edited with the §33 feature-row consolidation — is recommended but defers to the canonical Phase-0 inventory schema. For now, the 15 defects above are promoted to the DEFECT_LEDGER.md as `D-33-NNN` rows; matrix-cell tightening is queued under the v7.1.1 backlog.
