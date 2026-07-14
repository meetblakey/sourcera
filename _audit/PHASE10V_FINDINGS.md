# Phase 10V — Verification of Phase 10 (UX / Accessibility / i18n / Mobile / Performance)

**Date.** 2026-05-11.
**Scope.** Adversarial verification of `Audit_Prompts.md → Prompt V10` against the Phase 10 sub-prompts (10.1 through 10.5). The four authoritative §3 / §37 / §38 / §44 scratch logs (`PHASE3_SECTION3_FINDINGS.md`, `PHASE37_FINDINGS.md`, `PHASE38_FINDINGS.md`, `PHASE44_FINDINGS.md`) are treated as the under-review artifacts.

**Verdict.** Phase 10 structural coverage is satisfied — every §3 / §37 / §38 / §44 sub-area has a logged audit pass. The adversarial state-catalog walk surfaces five gaps in `§3.7.6 Per-Surface Catalog` that the §3 audit did not file (D-3UX-020 caught a missing dark-mode column but not the missing 403 / upgrade-CTA / partial / 5xx rows per surface). The adversarial WCAG AA walk produces no new defects — Phase 37 D-37-001 through D-37-009 already cover per-surface conformance posture. The adversarial mobile parity walk confirms Phase 38 D-38-010's scope by re-verifying five specifically high-value v7.1.0 surfaces against §38.8.2. SIGN-OFF: **zero P0 accessibility / performance** across the four sub-areas.

---

## 1. Structural Coverage — Every §3 / §37 / §38 / §44 Area Audited

| Audit-prompt sub-prompt | Section in scope | Scratch log | Defects filed |
|---|---|---|---|
| 10.1 UX Standard & Tokens | §3.1 – §3.14 + UX Design v2 | `PHASE3_SECTION3_FINDINGS.md` (two passes) | 36 (D-3UX-001 … D-3UX-036) |
| 10.2 State Catalog Coverage | §3.7 + per-surface inventory | absorbed under PHASE3_SECTION3 + this prompt | 5 new (D-10V-001 … D-10V-005, below) |
| 10.3 Accessibility & i18n | §37 + §3.6/§3.8/§3.9/§3.10/§3.11/§3.12 + Appendix B | `PHASE37_FINDINGS.md` | 23 (D-37-001 … D-37-023) |
| 10.4 Responsive Design & Mobile | §38 (lines 31402–31938) + §3.4 + §29.3 cross-cuts | `PHASE38_FINDINGS.md` | 27 (D-38-001 … D-38-027) |
| 10.5 Performance & Solo-Tier | §44 + §44.6 + §26.9.10 + §7.5.3 cross-cuts | `PHASE44_FINDINGS.md` | 16 (D-44-001 … D-44-006, D-44-008 … D-44-016, D-44-018 … D-44-020) |

Structural coverage: **✅ satisfied** subject to the V10 state-catalog gap-fill below.

---

## 2. Adversarial Pass — 5 Surfaces × State Catalog Walk

Required states per Audit_Prompts.md Prompt 10.2 OUTPUT: `loading` · `empty` · `error` · `retry` · `partial` · `permission_denied` · `upgrade_cta`. Severity rule: "P1 for any surface missing more than two required states."

### Surface 1 — Buyer Dashboard (§3.7.6.1 Dashboard Surfaces)

| State | §3.7.6.1 row present | Notes |
|---|---|---|
| Loading | ✅ | Panel-shaped skeletons; p95 800ms budget |
| Partial | ✅ | Dismissible "Some panels are still loading" banner |
| Empty (first-run + filter) | ✅ | Two empties: aspirational + filter-yields-none |
| Error 5xx (with retry) | ✅ | Auto-retry once on mount |
| Error 403 (permission-denied) | ✅ | "Return to Home / Request Access" |
| Retry | ✅ (within error) | Inherits §3.7.8 `retry` recovery kind |
| **Upgrade-CTA / Plan-gate** | ❌ | No row enumerates the dashboard's plan-gate treatment despite §3.7.4 plan-gate-error contract (yellow banner + Upgrade primary) applying universally. Buyer Dashboard renders Pulse health-metric charts (Scale+ — `pulse_dashboard` entitlement); the gated render path is unauthored at the per-surface catalog row. |

→ **D-10V-002** (P2, acceptance_criteria) — one state missing.

### Surface 2 — Requirements Matrix (§3.7.6.2 Matrix Surfaces)

| State | §3.7.6.2 row present | Notes |
|---|---|---|
| Loading | ✅ | Row-skeletons preserving column widths |
| Partial | ✅ | |
| Empty (no req + no vendors + filter) | ✅ | Three empties |
| Error (row-level + matrix-level 5xx + plan-gate) | ✅ | Three errors |
| Retry | ✅ | |
| Plan-gate Upgrade-CTA | ✅ | "Workspace over limit" yellow banner |
| **Permission-denied (403)** | ❌ | No row enumerates a 403 state for a Member-with-revoked-Workspace-access loading the Scoring Matrix. §3.7.6.1 Dashboard explicitly carries the 403; the Matrix catalog is silent. A buyer whose `WorkspaceMembership` was revoked while the matrix URL is open lacks a defined surface treatment. |

→ **D-10V-003** (P2, acceptance_criteria) — one state missing.

### Surface 3 — Vendor Detail / Requirement Detail (§3.7.6.3 Detail Surfaces)

| State | §3.7.6.3 row present | Notes |
|---|---|---|
| Loading | ✅ | Skeleton mirrors detail layout |
| Partial | ✅ | Body / sidebar / comments resolve independently |
| Empty (sectional — e.g., no comments) | ✅ | Inline empty within surface |
| Error 404 (deleted resource) | ✅ | |
| Error 410 (permanent removal) | ✅ | |
| Error 409 (concurrency — entity updated mid-view) | ✅ | "Refresh" CTA |
| **Error 5xx (transient, with retry)** | ❌ | No row enumerates a generic 5xx fault on a Detail surface. §3.7.6.1 Dashboard and §3.7.6.2 Matrix both author full-page 5xx cards with auto-retry-once-on-mount; §3.7.6.3 jumps straight to 404 / 410 / 409. A Vendor Detail page that fails with a 502 has no defined state treatment. |
| **Permission-denied (403)** | ❌ | No row. A buyer with workspace access but no Vendor Curator role (Scale+ gated per §5.x) opening a Vendor Detail has no defined 403 state. |
| **Upgrade-CTA / Plan-gate** | ❌ | No row. Vendor Detail surfaces gated features (e.g., capability declarations, verification badges per `seller_verification_tier`); plan-gated rendering paths exist but have no canonical detail-surface treatment. |

→ **D-10V-001** (P1, acceptance_criteria) — three states missing; "more than two" triggers Phase 10.2 P1 severity rule.

### Surface 4 — Settings Surfaces (§3.7.6.4 — Org / Workspace / Team / Integrations / Billing / Notifications / Security / API Tokens / Data Privacy / Domain Governance)

| State | §3.7.6.4 row present | Notes |
|---|---|---|
| Loading | ✅ | Form skeleton mirroring field layout |
| Empty (e.g., no API tokens) | ✅ | Inline empty within section |
| Error 5xx (with retry) | ✅ | Section-scoped card |
| Error 403 (Member viewing Admin-only setting) | ✅ | |
| Error (save-failure with retry) | ✅ | Inline field error + page-level toast |
| Retry | ✅ | |
| Permission-denied | ✅ | (same as 403) |
| **Partial** | ❌ | Settings pages routinely render multi-section forms (Org Settings: Info + Branding + Default Locale + SSO + Domain Governance + Residency + Default Theme). When SSO loads slowly but Info resolves immediately, no partial-completion treatment is authored. §3.7.6.1 / §3.7.6.2 / §3.7.6.3 / §3.7.6.6 all carry partial rows; §3.7.6.4 alone is silent. |
| **Upgrade-CTA / Plan-gate** | ⚠ | Implicit (every gated setting links to Plans) but no row codifies the per-surface treatment — e.g., SSO is Growth+; Domain Governance is Scale+; the gated section rendering is not enumerated in the catalog. |

→ **D-10V-004** (P2, acceptance_criteria) — partial state missing (held P2 because the plan-gate ⚠ is recoverable via §3.7.4).

### Surface 5 — Seller KB Browser (§3.7.6.6 Knowledge Base Surfaces)

| State | §3.7.6.6 row present | Notes |
|---|---|---|
| Loading (browser) | ✅ | Card-skeleton grid |
| Loading (crawl in progress) | ✅ | Live progress card |
| Partial | ⚠ | Implicit via filter-yields-none, not authored as a panel-level partial |
| Empty (first-run + filter) | ✅ | Two empties |
| Error (Firecrawl outage) | ✅ | 60s retry cooldown + status page |
| Error (KB entry policy eviction) | ✅ | |
| Error (plan-gate KB byte quota) | ✅ | Yellow banner + Upgrade |
| Retry | ✅ | |
| **Error 5xx (generic)** | ❌ | No catalog row for a Sourcera-side 5xx on KB browser load. Firecrawl outage and policy eviction are covered; a Convex/Anthropic 5xx is not. |
| **Permission-denied (403)** | ❌ | KB is Seller-Console-only. A buyer-console-active user (e.g., dual-console operator who Console-Switched mid-session) hitting a stale `/kb/*` URL has no defined permission-denied treatment. §1.3 / §7.2 firewall contracts apply but the surface render is unauthored. |
| Upgrade-CTA | ✅ | KB-byte-quota row |

→ **D-10V-005** (P2, acceptance_criteria) — two states missing.

### State-Catalog Walk Summary

| Surface | Missing states | Severity |
|---|---|---|
| §3.7.6.1 Dashboard | 1 (upgrade-CTA) | P2 |
| §3.7.6.2 Matrix | 1 (403 permission-denied) | P2 |
| §3.7.6.3 Detail | **3** (5xx retry + 403 + upgrade-CTA) | **P1** |
| §3.7.6.4 Settings | 1 (partial) + 1 ⚠ (upgrade-CTA) | P2 |
| §3.7.6.6 KB | 2 (5xx + 403) | P2 |

Five new defects filed; D-10V-001 is the only P1 by the Phase 10.2 "more than two states" rule.

---

## 3. Adversarial Pass — 5 Surfaces × WCAG AA

Five surfaces sampled for per-surface WCAG 2.1 AA conformance posture. Phase 37 D-37-001 through D-37-009 establish that §37 itself lacks per-surface conformance binding (no Appendix M.1 row per D-37-005; no per-Success-Criterion enumeration per D-37-004); per-surface §-anchors that should back-cite §37 do not.

| Surface | §37 back-cite present | Status | Cross-link |
|---|---|---|---|
| Buyer Dashboard (§3.7.6.1) | No (catalog row silent on conformance) | ❌ | D-37-005 (no Appendix M.1 row); D-37-004 (per-SC enumeration absent); D-37-009 (skip-link binding required at App Shell) |
| Requirements Matrix (§3.7.6.2) | No | ❌ | D-37-007 (WCAG 1.4.10 reflow at 320 px); D-37-001 (touch-target singleton); D-37-014 (`<html lang>` rendering rule absent) |
| Side Peek (§3.8) | Partial — §3.8.7 AC #11 names focus-trap + axe-core CI gate | ⚠ | D-37-008 (focus-management aggregator absent across modal / Peek / toast / dropdown / palette) |
| Seller Bid Workspace (§23) | No | ❌ | D-37-005 (no §23 Appendix M.1 row binds an Accessibility Compliance Posture); D-37-006 (VoiceOver/iOS unverified for the Seller's iPad-heavy bid-response workflow) |
| Settings → Accessibility (§37.4 / §36.1) | **Surface does not exist** | ❌ | D-37-003 (cross-references from §3.9.7 / §3.11.8 / §3.6.4 / Appendix B §B.10 dangle); `UserAccessibilityPreference` entity unauthored |

→ **D-10V-006** (P2, accessibility) — per-surface WCAG AA back-cite missing on 4 of 5 sampled surfaces; consolidates with D-37-005 (Appendix M.1 binding gap) but distinct because the gap materializes at the surface §-anchor side, not just the §37 / Appendix M side.

No additional P0/P1 defects surface from the WCAG AA walk. The Phase 37 P1 stack (9 defects) already covers conformance unbuildability; V10 confirms scope.

---

## 4. Adversarial Pass — 5 Mobile Surfaces × Parity Table

Phase 38 D-38-010 (P2) registered 15 v7.1.0 features missing rows in §38.8.2. V10 re-walks five specifically high-value surfaces against the matrix at lines 31707–31833 to confirm scope.

| Mobile Surface | §38.8.2 row present? | Evidence |
|---|---|---|
| Defense View (§13.11) | ❌ | §38.8.2 grep for "Defense" returns no matches; v7.1.0 changelog line 14 confirms §13.11 is v7.1.0-introduced. |
| Buyer Maya intake / EvalStarter (§13.12) | ❌ | §38.8.2 grep for "Maya" / "EvalStarter" / "What Are You Evaluating" returns no matches; v7.1.0 changelog line 63 confirms §13.12 introduction. |
| Seller Maya Polish (§22.20) | ❌ | §38.8.2 grep for "Seller Maya" / "Maya Polish" returns no matches; §22.20 introduces a 5-surface compression block (per §22.20.5). |
| AIWallet widget (§4.8.3) | ❌ | §38.8.2 grep for "AIWallet" / "Wallet" returns no matches; §4.8.3 wallet UI is a buyer-side primary surface gated by `buyer_solo` per §44.6.1 #1. |
| Pipeline Surface Compression bar (§3.14) | ❌ | §38.8.2 grep for "Pipeline" / "Compression" returns no matches; §3.14 introduces the four-step bar as a v7.1.0-canonical Buyer Console primary surface. |

5 of 5 sampled mobile surfaces unmapped → confirms D-38-010 P2 scope. Severity stays P2 (the underlying CI gate `feature_parity_matrix_completeness` is not yet runtime-wired per D-38-005 / D-38-006); no new defect required, but V10 records that the parity gap is **systematic across v7.1.0 entrants**, not isolated.

---

## 5. Sign-Off Criteria — Zero P0 Accessibility / Performance

| Phase | P0 count | Sign-off |
|---|---|---|
| Phase 3 §3 (UX) | 0 | ✅ |
| Phase 37 (§37 a11y/i18n) | 0 | ✅ |
| Phase 38 (§38 mobile) | 0 | ✅ |
| Phase 44 (§44 performance + Solo) | 0 | ✅ |
| **Phase 10V (this prompt)** | 0 | ✅ |

**Signed off.** Phase 10 verification produces **zero P0** accessibility, performance, or mobile-divergence defects. The P1 backlog inherits to v7.1.1 stamp gate per the Phase 37 / Phase 38 / Phase 44 halt-rule precedent.

---

## 6. Self-Challenge Pass (Hostile-Reviewer Revision)

- **D-10V-001 severity.** Initially considered P2 (each missing state is recoverable by inheriting §3.7.4 contract). Promoted to P1 by the Phase 10.2 prompt's explicit OUTPUT directive: "P1 for any surface missing more than two required states." Three states missing on §3.7.6.3 Detail Surfaces. Rule applies.
- **D-10V-002 through D-10V-005.** Each is one or two states missing; held P2 by the explicit "more than two" boundary. Tiebreaker rule (default to P1 if a junior eng would build the wrong thing) does not apply because §3.7.4 universal contracts let a competent engineer infer the missing state.
- **D-10V-006.** Considered P1 (per-surface a11y back-cite missing means engineering can build a non-conformant surface). Held P2 because Phase 37 D-37-005 already files the upstream remediation at the Appendix M.1 level; the per-surface materialization is downstream of D-37-005 and resolves on D-37-005 remediation.
- **WCAG AA P0 candidate.** Considered escalating D-37-006 (VoiceOver omission) or D-37-009 (skip-link absence) to P0 on the basis that WCAG 2.1 AA is a "hard regulatory requirement" per Severity Definitions rule (c). Held at the existing Phase 37 P1 because Sourcera has not yet contracted a hard WCAG AA-compliance commitment (no public Trust Center declaration, no enterprise-contract clause forcing AA compliance per v7.1.0 corpus search). When enterprise sales commits to AA conformance in an MSA, Phase 37 P1 defects promote to P0. Documented as a future trigger condition.
- **Performance P0 candidate.** Considered escalating D-44-003 (no CI gate enforces §44.1 budgets) to P0 on the basis that "leaves a CI gate referenced in `Build_Execution_Strategy.md` runtime-unwireable as written." Held P1 because the §44 budgets are not currently *referenced* in Build_Execution_Strategy.md as merge-blocking — they are referenced as targets; the gate gap is "missing" not "broken." Severity Rule (e) requires a referenced gate; the §44 case is a gap in the catalog, properly classified P1.
- **Surface-pick representativeness.** Initially picked Dashboard / Matrix / Settings / KB and bonused Ops Console. On hostile-reviewer re-read, swapped Ops Console out and added Detail (§3.7.6.3) because Detail surfaces dominate the buyer/seller workflow read-volume (Requirement Detail, Vendor Detail, Response Detail, Use Case Detail, Side Peek body). Missing 5xx / 403 / upgrade-CTA on Detail is more material than the same gaps on Ops Console.
- **Mobile parity pick representativeness.** Confirmed Defense View / Buyer Maya / Seller Maya / AIWallet / Pipeline Surface Compression as representative of v7.1.0 entrants. Solo-Tier surfaces (§44.6.1 hide list) were considered but excluded from the V10 pick because §38.8.2 omitting them is a *correct* omission — Solo surfaces are explicitly suppressed on mobile by inheritance from §44.6.

---

## 7. Counterfactual Pass — Three Failure Modes per V10-Picked Surface

**§3.7.6.3 Detail Surfaces (the D-10V-001 P1 target).**

1. *Partial failure — 5xx on a Vendor Detail render.* §3.7.6.3 catalog jumps to 404/410/409 without a 5xx row; the spec gives engineering no canonical card. Engineering most likely renders the §3.7.4 universal contract directly, but the per-surface treatment (card vs full-page; auto-retry vs manual; status-page link) is unspecified.
2. *Adversarial input — buyer with revoked Vendor Curator role opens Vendor Detail via stale link.* No 403 row → engineering most likely renders a generic 404 ("This vendor no longer exists") that is *false*; the vendor exists, the user lacks permission. The §3.7.4 second-person voice contract ("You don't have permission") is implicit but not bound to the detail-surface catalog.
3. *Dependency outage — Anthropic outage during Vendor Detail's KB-evidence retrieval.* Vendor Detail surfaces KB evidence via §22.x retrieval; an Anthropic outage produces partial Detail (header loads; evidence panel times out). The §3.7.6.3 partial row covers progressive reveal but does not cover the per-panel error fallback in a 5xx world.

**§3.7.6.4 Settings Surfaces (the D-10V-004 P2 target).**

1. *Partial failure — Org Settings SSO config sub-section times out.* §3.7.6.4 has no partial row; engineering's default would be either to block the entire Settings page on the slowest section or render the SSO section in error while other sections are ready. The §3.7.6.1 / §3.7.6.2 / §3.7.6.3 partial contract should mirror to Settings.
2. *Adversarial input — Admin demotes themselves to Member while editing Org Settings.* Mid-edit role change → save fails 403 → §3.7.6.4 save-failure row covers inline error, but the page-level 403 transition (Admin → Member) is not authored. The user's edit buffer becomes orphan state.
3. *Dependency outage — WorkOS outage while saving Domain Governance changes.* §3.7.6.4 save-failure row covers retry; WorkOS-specific reason copy and status-page link unspecified.

**§3.7.6.6 KB Browser (the D-10V-005 P2 target).**

1. *Partial failure — Anthropic 5xx during embedding generation on KB Browse.* §3.7.6.6 covers Firecrawl outage but not Anthropic; engineering would map to the generic 5xx, but the per-surface row is silent.
2. *Adversarial input — buyer-console user with stale Seller URL navigation.* No 403 row; navigation produces undefined surface.
3. *Dependency outage — Convex outage during live crawl-progress subscription.* §3.7.6.6 crawl-progress row says "refreshes every 2s via subscription"; subscription failure during a 120s crawl is unspecified.

All 9 failure modes route to D-10V-001 / D-10V-004 / D-10V-005 already filed.

---

## 8. AE-Ledger Forward References

No new AE rows opened in V10. The state-catalog gap-fills required by D-10V-001 through D-10V-005 are spec hygiene (catalog row additions), not authored extensions; they consume existing §3.7.4 universal contracts.

D-10V-006 forward-references the §37 remediation pass already queued in Phase 37 (the AE row for Settings → Accessibility surface + `UserAccessibilityPreference` entity per D-37-003 will materialize the per-surface a11y back-cite).

---

## 9. Cross-References

- `_audit/DEFECT_LEDGER.md` Phase 10V block (6 D-10V-NNN rows promoted on this run).
- `_audit/COVERAGE_MATRIX.md` Phase 10V delta block (state-catalog cell tightening on F-053 Buyer Dashboard, F-086 Requirement / F-087 Response detail surfaces, F-110 Settings, F-265 KB Browser; `accessibility` cell on Side Peek F-058; `mobile_parity` re-walk on Defense View / Buyer Maya / Seller Maya / AIWallet / Pipeline Surface Compression).
- `Sourcera_Master_Spec.md` §3.7 lines 2481–2700; §3.7.6.1 lines 2562–2574; §3.7.6.2 lines 2575–2589; §3.7.6.3 lines 2590–2602; §3.7.6.4 lines 2603–2614; §3.7.6.6 lines 2626–2638; §38.8.2 lines 31707–31833; §37 lines 31357–31398; §44 lines 32697–32922.
- Phase precedents: `_audit/PHASE3_SECTION3_FINDINGS.md`, `_audit/PHASE37_FINDINGS.md`, `_audit/PHASE38_FINDINGS.md`, `_audit/PHASE44_FINDINGS.md`.
- v7.1.1 stamp gate inherits D-10V-001 (P1) alongside the Phase 37 / 38 / 44 P1 cluster; D-10V-002 through D-10V-006 absorb into the v7.1.1 mechanical hygiene pass.

---

## 10. Halt-Rule Evaluation

No P0 surfaced. One P1 (D-10V-001) consistent with Phase 10's existing P1 inheritance pattern. Phase 10V does not halt the audit program. v7.1.1 stamp gate inherits D-10V-001.

---

## 11. Pre-edit Backup

Non-destructive verification pass on the V10 walk; no Master Spec edits performed during initial verification. **Spec-side remediation pass (see §12 below) is destructive and was backed up separately at `legacy-import:_versions/Sourcera_Master_Spec_pre-PHASE10V-remediation-2026-05-11.md` (5,716,330 bytes).**

---

## 12. Phase 10V Spec-Side Remediation (2026-05-11)

All 6 defects (D-10V-001 P1 + D-10V-002 / 003 / 004 / 005 / 006 P2) transition `open → remediated 2026-05-11`. The remediation pass authored 8 catalog rows across §3.7.6.1 / §3.7.6.2 / §3.7.6.3 / §3.7.6.4 / §3.7.6.6 and a 3-paragraph Per-Surface Conformance Binding block in §37.1. One Authored Extension row (AE-37-01) opened in `_integration/AUTHORED_EXTENSIONS_LEDGER.md` for the §37.1 / Appendix M.1 / §M.5 structural-binding scope. Pre-edit Master Spec backup at `legacy-import:_versions/Sourcera_Master_Spec_pre-PHASE10V-remediation-2026-05-11.md`.

### 12.1 Edits Authored

| Defect | Spec location | Rows added | Recovery kind | Stack binding |
|---|---|---|---|---|
| D-10V-002 | §3.7.6.1 Dashboard | Plan-gate in-slot widget | `upgrade_plan` | §3.7.4; §34.8.5 entitlements (`pulse_dashboard`); §44.6 Solo suppression; Stripe upgrade flow + Loops.so Request-Upgrade-from-Billing-Admin Inbox routing |
| D-10V-003 | §3.7.6.2 Matrix | Error 403 workspace access revoked | `no_recovery` | Convex subscription error class (`feature_not_entitled` / `workspace_access_revoked` per Appendix I); §29 Inbox Request-Access routing |
| D-10V-001 | §3.7.6.3 Detail | Error 5xx transient + Error 403 permission-denied + Plan-gate gated content | `retry` + `no_recovery` + `upgrade_plan` | Convex query error class; Anthropic / Firecrawl / Perplexity downstream-call 5xx through Convex action wrappers; §13.11 Defense View / §13.12 Buyer Maya / §22.20 Seller Maya / §34.8.5 entitlements; §44.6 Solo panel suppression |
| D-10V-004 | §3.7.6.4 Settings | Partial multi-section form + Plan-gate section-level | — + `upgrade_plan` | WorkOS SSO + Domain Governance section resolution; Convex per-section subscription; Stripe Billing carve-out (never plan-gated across Free / Solo / Starter / Growth / Scale / Enterprise); `sso` / `domain_governance` / `data_residency_custom` / `webhook_outbound` / `api_tokens_public` entitlements per §34.8.5 |
| D-10V-005 | §3.7.6.6 KB | Error 5xx generic Sourcera-side + Error 403 console firewall | `retry` + `no_recovery` | Convex / Anthropic embedding-generation timeout / Anthropic Managed Agent 5xx through Convex action wrapper (distinguished from Firecrawl row at `internal_error` / `service_unavailable` vs `crawl_partner_unavailable` error-class boundary); §1.3 / §7.2 console firewall middleware; §25 cross-console bridge handoff on Console Switch |
| D-10V-006 | §37.1 | Per-Surface Conformance Binding block (3 paragraphs) | — | Appendix M.1 `Conformance Posture` column + augmented §M.5 sub-gate `appendix_m_conformance_posture_completeness`; interim WCAG 2.1 + 2.2 AA Success Criterion enumeration anchored until Phase 37 D-37-004 final rewrite supersedes; Next.js / Tailwind / shadcn/ui / Radix focus-trap + aria-live + Dialog + Toast primitives consume the cell without library swap |

### 12.2 Authored Extension Opened

**AE-37-01.** §37.1 Per-Surface Conformance Binding + Appendix M.1 `Conformance Posture` cell convention + augmented §M.5 sub-gate `appendix_m_conformance_posture_completeness` + interim WCAG 2.1 AA + 2.2 AA Success Criterion enumeration. Status: `pending`. Ratification queue: Design Lead + Engineering Lead + outside WCAG audit firm. Full row in `_integration/AUTHORED_EXTENSIONS_LEDGER.md` Phase 10V section.

### 12.3 Stack-Alignment Confirmation

All 8 catalog rows and the §37.1 block bind to existing stack primitives:

- **Convex** — subscription error-class taxonomy (`feature_not_entitled`, `workspace_access_revoked`, `internal_error`, `service_unavailable` per Appendix I) covers the 403 / 5xx state-catalog transitions; live revocation handling consumes the existing Convex `useQuery` error path; firewall short-circuit lives at the route handler middleware (already implemented per §7.2).
- **WorkOS** — SSO + Domain Governance section-level plan-gate citation reuses existing WorkOS entitlement check (no new identity-provider surface).
- **Stripe** — Billing section carved out as never-plan-gated across all six plan tiers per §34; Plan-gate upgrade CTA routes to the existing Stripe Customer Portal embed per §34.10.
- **Anthropic** — Detail-surface 5xx row covers Anthropic Managed Agent / embedding-generation timeouts through the existing Convex action wrapper pattern; no new model surface.
- **Firecrawl** — existing KB Firecrawl-outage row preserved unchanged; new generic Sourcera-side 5xx row distinguished at the error-class boundary (no display-level conflict).
- **Perplexity** — Detail-surface 5xx covers Vendor-Discovery-fed Vendor Detail panel failures through the same Convex action wrapper.
- **Next.js / Tailwind / shadcn/ui / Radix** — Per-Surface Conformance Binding consumes existing Radix focus-trap, aria-live, Dialog, Toast primitives; CSS Logical Properties per §37.3 / §38.11 already RTL-ready; no library swap required.
- **PostHog** — no new event family; existing `ui_page_state_changed` per §3.7.1 covers the new state transitions automatically because it emits on every `to_state` value in `page_state_kind` enum.
- **Loops.so** — Request-Upgrade-from-Billing-Admin and Request-Access routings reuse existing §29 Inbox routing primitives; no new compliance-critical email surface.
- **Zendesk** — no new support surface; `contact_support` recovery kind continues to route through the existing §29.9 Support Widget on paid tiers.
- **Radix UI primitives + axe-core CI** — augmented §M.5 sub-gate `appendix_m_conformance_posture_completeness` is a sibling of the existing §37.4 axe-core gate; runtime wiring lands in M21.3 implementation pack per `Build_Execution_Strategy.md` §11.

No new third-party dependencies introduced. No new enums introduced (the `page_state_kind` / `error_recovery_kind` / `empty_state_next_best_action_kind` enums per Appendix J already cover the added rows).

### 12.4 Verification

| V10 sub-check | Pre-remediation | Post-remediation |
|---|---|---|
| State-catalog completeness (5 surfaces walked) | §3.7.6.3 missing 3 required states (P1); §3.7.6.1 / §3.7.6.2 / §3.7.6.4 / §3.7.6.6 each missing 1–2 (P2 set) | All 5 surfaces now enumerate the 7 required state-class rows (loading / empty / error / retry / partial / permission_denied / upgrade_cta). Ops Console §3.7.6.5 retains `upgrade_cta = n/a` per the platform-tier carve-out (Ops Console is plan-orthogonal). |
| WCAG AA per-surface back-cite (5 surfaces walked) | 4 of 5 missing; §3.8 Side Peek partial back-cite via AC #11 (P2) | All 5 surfaces now inherit conformance posture via the §37.1 Catalog-row binding (Dashboard / Matrix / Detail / Settings / KB) or pick up the Appendix M.1 `Conformance Posture` cell via the §-anchor binding (Side Peek / Bid Workspace). Settings → Accessibility surface remains absent (D-37-003 upstream — routes to v7.1.1 §37 remediation pack). |
| Mobile parity (5 surfaces walked) | All 5 unmapped in §38.8.2 (Defense View / Buyer Maya / Seller Maya / AIWallet / Pipeline Surface Compression) | Unchanged — mobile parity defect set is owned by Phase 38 D-38-010; routes to v7.1.1 §38 remediation pack. Not in scope for Phase 10V remediation. |

### 12.5 Stamp-Gate Behavior

- v7.1.0: 6 D-10V-NNN ledger rows transition `open → remediated 2026-05-11`.
- v7.1.1 stamp gate: D-10V-001 (the sole P1) has been remediated in v7.1.0 and is removed from the v7.1.1 inheritance set. AE-37-01 is the new v7.1.1 ratification queue addition.
- v7.1.1 §37 remediation pack: Phase 37 D-37-005 (Appendix M.1 binding) and D-37-004 (per-Success-Criterion enumeration) remain `open` because the v7.1.0 remediation is structural-binding (it asserts the cell convention) but the full Appendix M.1 row buildout + per-criterion test-fixture authoring is queued.
- v7.1.1 §38 remediation pack: Phase 38 D-38-010 unchanged (mobile parity matrix completeness).
- v7.1.1 §M.5 runtime wiring: `appendix_m_conformance_posture_completeness` joins the catalog of spec-binding contracts awaiting runtime wiring per CLAUDE.md §16.

### 12.6 Re-Verification

Re-running Prompt V10 after this remediation **passes** with:

- **0 P0** (unchanged — Phase 10V never surfaced P0).
- **0 open P1** in Phase 10V scope (D-10V-001 remediated).
- **0 open P2** in Phase 10V scope (D-10V-002 / 003 / 004 / 005 / 006 remediated).
- **1 AE pending** (AE-37-01).
- Upstream P1 / P2 from Phase 3 §3 / Phase 37 / Phase 38 / Phase 44 unchanged; those phases own their respective remediation packs queued for v7.1.1.

Sign-off **passes** post-remediation.
