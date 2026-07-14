# Phase 4 — Prompt 4.10 — §19 Template Library Findings (Scratch Log)

**Audit prompt.** `Audit_Prompts.md → Phase 4 → Prompt 4.10` (lines 1383–1394). Walk §19. Confirm: template versioning, fork semantics, sharing permissions cite §5.11, plan-gating cites §34. Output: defect ledger entries.

**Scope.** §19 (lines 14893–15095) end-to-end. Cross-document reads of §1.3 console firewall, §4.3 Buyer Console Entities, §4.4.28 TemplateLibraryEntry (the *other* "template" concept), §4.5.9 EvalStarter (canonical Ops-managed registry pattern), §4.6 Audit Events, §5.11 Feature Access Matrix (lines 9388–9505 full read), §6.7 Audit Logging, §6.8 DSAR, §13.5 / §14.4 Amendment Protocol, §25 Cross-Console Bridge non-carry registry (line 19441), §31 Webhook Catalog, §32.5 API Endpoints (lines 26262–26416 full read), §34.1.1 Buyer Plan Tiers (lines 28366–28406 full read), §34.1.2 Seller Plan Tiers (lines 28412–28442 full read), §34.1.3 split-enum contract, §38.4 Mobile Parity (lines 30892–30895), §39 Object Size Constraints, §40.2 Data Retention, §40.4 Data Residency, §44.5 Downgrade Behavior, §44.6 Solo-Tier Surface Treatment, §48.2.10 Loop L9 Template Publish Incentive, §49 Outage Catalog, §50 Operations, Appendix C Notification Event Catalog (line 41340+), Appendix G PostHog Event Taxonomy, Appendix I Error Codes, Appendix J Controlled Vocabulary (line 43712+), Appendix K Glossary (line 46704+), Appendix L State Machines, Appendix M.1 Surface/Engine Mapping (lines 47852–47854).

---

## 1. Prompt-Mandated Confirmation Tasks

The audit prompt explicitly requires four confirmation tasks. Verdict on each:

| Confirmation task | Verdict | Evidence | Defect |
|---|---|---|---|
| Template versioning is authored to convention | ❌ FAIL | §19.2.2 lines 14913–14924 prose only; §19.4.3 lines 14997–15008 prose only; no `From / To / Trigger / Conditions / Notes` table; no `WorkspaceTemplateVersion` entity in §4; no semver bump rule; no enum registration in Appendix J. | D-4.10-010, D-4.10-022, D-4.10-001, D-4.10-011 |
| Fork semantics are authored | ❌ FAIL | §19 does not contain the word "fork"; §19.4.3 Apply Update describes a forking-shaped operation ("creates new template version in org") with no idempotency / concurrency / partial-failure semantics; §19.5.2 Amendment Protocol bypass not cited against §13.5 / §14.4. | D-4.10-016, D-4.10-027, D-4.10-022 |
| Sharing permissions cite §5.11 | ❌ FAIL | §19.3.3 lines 14961–14963 enumerate roles inline (Workspace Owner, Org Admin, Creator, all org members); §5.11 (lines 9388–9505) full read — no Template Library row group; the only Template-class row in §5.11 is `Submit Seller Template (Min Tier (Seller): seller_growth)` at line 9493, a §50.11 surface unrelated to §19. | D-4.10-002 |
| Plan-gating cites §34 | ⚠ PARTIAL FAIL | §19.6.1 column header reads "Plan tier (per §34.1.1 / §34.1.2)" but the table inlines entitlement values rather than citing §34.1.1 cells; the table omits Buyer Solo / Seller Solo and conflates buyer/seller plan-tier enums into one column. | D-4.10-003, D-4.10-004, D-4.10-005, D-4.10-015, D-4.10-028 |

---

## 2. Convention-by-Convention Score (§19)

For each entity, capability, or feature in scope of the prompt, the audit checklist requires verifying 14 conventions. Verdict on each:

| Convention | Verdict | Notes / Defect |
|---|---|---|
| 1. Entity definition (§4) | ❌ missing | §19's "Custom Template" data class has no §4 entity. §4.4.28 TemplateLibraryEntry is a different concept (marketplace-domain RFI/RFP starter). → D-4.10-001, D-4.10-017, D-4.10-023 |
| 2. Acceptance criteria (numbered, observable) | ❌ missing | §19.7 ACs are checkbox prose; no observable thresholds. → D-4.10-009 |
| 3. Enum registration (Appendix J) | ❌ missing | §19.3.1 Category enum (`Security / Compliance / Operations / Custom`), §19.4.1 Source badge enum (`Sourcera / Org name`), §19.4.3 update-state vocabulary, §19.2.2 version-status not in Appendix J. → D-4.10-011 |
| 4. Glossary (Appendix K) | ❌ missing | "Workspace Template", "Custom Template", "Sourcera-Provided Template", "Template Update Available", "Apply Update", "Template Catalog View" not in Appendix K; ambiguous against §4.4.28 TemplateLibraryEntry. → D-4.10-012 |
| 5. State machines (table form) | ❌ missing | §19.2.2 versioning + §19.4.3 update flow described in prose; no `From / To / Trigger / Conditions / Notes` table; no Appendix L entry. → D-4.10-010, D-4.10-022 |
| 6. APIs (§32 conventions) | ❌ missing | §32.5 has zero §19 endpoints. → D-4.10-006, D-4.10-016 |
| 7. Webhooks (§31 conventions) | ❌ missing | No §19 webhook events, no Appendix C entries, no Appendix G PostHog events, no audit-event registrations in Appendix J. → D-4.10-007, D-4.10-008 |
| 8. Plan gating (§5.11 / §34.1 / §39) | ❌ missing | §5.11 has zero Template rows; §34.1.1 / §34.1.2 have no Custom-Templates row; §19.6.1 inlines values; Solo tiers omitted. → D-4.10-002, D-4.10-003, D-4.10-004, D-4.10-005, D-4.10-015, D-4.10-024, D-4.10-028 |
| 9. Retention / DSAR / residency / GDPR | ❌ missing | §19 silent; §40.2 has no row; §6.8 silent; residency follow-mode unstated. → D-4.10-013 |
| 10. Numerical singletons (§39) | ❌ missing | §19.3.1 inlines `Template name (≤100 chars)` and `Description (≤300 chars)`; §39 has no row. Plan entitlements inlined in §19.6.1 instead of cited from §34.1.1. → D-4.10-005, D-4.10-014 |
| 11. Heading syntax `## N.N Title {#anchor}` | ✅ pass | Section headings are anchored. |
| 12. Appendix M surface/engine | ⚠ partial | Two rows present (47853, 47854); ≥6 missing rows for Apply Update, Save as Template, Suggest Improvement, Update-Available badge, Detail Modal, Preview & Drill-Down. → D-4.10-026 |
| 13. Console firewall (§1.3) | ⚠ partial | §25 line 19441 declares "Template Library Entry (buyer-authored) | NEVER CARRIED" — but §19 itself does not declare console-scoping. → D-4.10-029 |
| 14. Edge cases (concurrency, idempotency, mobile, downgrade, residency, third-party) | ❌ missing | Multiple silent dimensions. → D-4.10-015, -016, -017, -018, -024, -025, -028, -030 |

---

## 3. Drift / Consistency Findings (§19 ↔ rest of corpus)

- §19.3.3 line 14964 references "v6.0" — stale; v7.1.0 is current. Cross-org sharing is supported via §4.4.28 / §48.2.10. → D-4.10-020.
- §25 line 19441 references `§19.8` (Marketplace-published templates); §19 has no §19.8 sub-section. → D-4.10-019.
- §19 vs §4.4.28 TemplateLibraryEntry: two distinct concepts share the word "template" without disambiguation. The Glossary defect (D-4.10-012) carries the disambiguation requirement.
- §19.5.2 Amendment Integration silently bypasses §13.5 / §14.4 Amendment Protocol — needs explicit cross-reference. → D-4.10-027.
- §19.2.1 hardcoded Sourcera template seed list contradicts §19.2.3 dynamic-registry claim; no `SourceraTemplateRegistry` Ops-managed entity in §4.5 (compare §4.5.9 EvalStarter as the canonical pattern). → D-4.10-023.
- §19.6.1 cites `§34.4` in the prose — verified §34.4 exists; cell-citation is loose-but-defensible for the "output artifacts not metered" claim; not filed as a separate defect (consolidated into D-4.10-005).
- §19.3.1 Category enum (`Security / Compliance / Operations / Custom`) disagrees with §19.2.1 Sourcera-seed Category labels (`SaaS Security & Compliance`, `Cloud Infrastructure`, `Data Privacy`, `Finance & Billing`, `Customer Support`, `Integration & APIs`). → D-4.10-011.

---

## 4. Three Counterfactual Failure Modes (Opus discipline)

For every §19 feature, the spec must address realistic failure modes. Confirmed unhandled:

1. **Concurrent Apply-Update by two Org Admins.** Spec is silent on idempotency / first-writer-wins / 409 conflict. → D-4.10-016.
2. **Org downgrades from Starter to Free with 200 custom templates already authored.** Spec is silent on whether existing templates are retained read-only, hidden, or soft-deleted. §19.6.1 only says "Read-only access" for Free without describing the migration. → D-4.10-028.
3. **Sourcera template registry update fires while a buyer org has 50 active workspaces mid-Phase from v1.0 of that template.** Spec says workspaces are independent of subsequent template updates, but does not specify whether the in-flight evaluations show a "your template was updated; review changes" indicator, an audit event, or nothing. → D-4.10-007, D-4.10-008, D-4.10-022.

Additional unhandled failure modes worth recording for downstream phase prompts:

- Two Org Admins click "Save as Template" simultaneously on the same workspace — duplicate templates created, or 409? Silent. → D-4.10-016.
- Workspace Owner saves template, leaves the org, then a new Org Admin tries to delete the template they didn't create. §19.3.3 says "Edit/Delete: Creator, Org Admin only" — Org Admin can override. But the `created_by` user is now anonymized via DSAR (per §6.8.5 pattern); does the Org Admin see the deleted user's anonymized handle in the audit trail, or the org-level reference? Silent. → D-4.10-013.
- Sourcera template update modifies a Use Case that is currently in a derived workspace's Phase 9 (Selection Report Draft). Does the workspace see a stale-template indicator? Silent. → D-4.10-007.
- Buyer Solo org user attempts to "Save as Template" — gated server-side per the missing §5.11 row group; what error code surfaces? Silent. → D-4.10-002, D-4.10-003.

---

## 5. Self-Challenge Pass (Opus-mandatory)

Re-read every defect as a hostile reviewer. Adjustments made before promotion:

- **D-4.10-021 (cited §34.4)** — initially queued; on verification, §34.4 covers customer-billed AI capability metering and the §19.6.1 phrasing is loose-but-defensible. **Withdrawn**, not promoted.
- **D-4.10-003 / D-4.10-004 / D-4.10-005** — initially considered as one combined defect; split into three because each defect names a distinct convention violation (Solo omission vs buyer/seller conflation vs inline entitlement) and each demands a different remediation. Distinct defect IDs let the remediation backlog phase the work independently.
- **D-4.10-018 (mobile parity gap surfacing)** — softened from P1 to P2: §38.4 *does* declare the mobile divergence; §19's silence is a documentation surfacing miss, not a build-blocker.
- **D-4.10-026 (Appendix M coverage)** — softened from P1 to P2: two §19 rows exist; the missing rows are subsidiary surfaces, not net-new top-level concepts. Per §M.4 CI gate, this would be flagged on next §19 PR.
- **D-4.10-029 (console-firewall surfacing)** — confirmed P2, not P1: §25 *does* enforce the firewall in code; §19's silence is a clarity defect, not a leakage defect. (Not P0 — rule (a) requires actual leakage, not under-documented enforcement.)
- **All P1 defects re-checked.** Each prevents an engineer from building §19 unambiguously without extending the spec. Severity classifications hold under the rule "default to P1 if a junior engineer would build the wrong thing".
- **No P0 defects.** §19 does not break the buyer/seller firewall (§25 line 19441 actively enforces buyer-only authorship), does not leak PII (the entity is missing entirely; PII risk is theoretical until the entity is authored), does not violate a hard regulatory requirement (DSAR / residency are silent but not violated), does not expose a billing surface to revenue ambiguity (templates are not metered; entitlement is plan-tier-gated and silent on Solo, but the silence is a buildability defect not a billing-leak defect), and does not leave a CI gate runtime-unwireable (§M.4 / §M.5 gates referencing §19 are mostly missing rather than mis-authored).

---

## 6. Coverage Matrix Updates

Per-row tightenings authored in `_audit/COVERAGE_MATRIX.md → Phase 4.10 Update (2026-05-05)`. The §19 row IDs are F-302 (Template Library, §19.1), F-303 (Sourcera-Provided Templates, §19.2), F-304 (Custom Template Creation, §19.3), F-305 (Template Library UI, §19.4), F-306 (Template-to-Workspace Flow, §19.5), F-307 (Template Library Plan Limits, §19.6). Plus F-{TBD-Buyer-Template-Instance} at matrix line 82 (the data-model entity-instance row).

Aggregate counters NOT updated in this pass (matrix-row tightening on §19 is 6 of 970 rows). Aggregate ✅ / ⚠ / ❌ / n/a totals will be re-derived in the Phase V4 cross-check after Phase 4.11 / 4.12 close.

---

## 7. Promotion Summary

29 defects authored, 28 promoted to `DEFECT_LEDGER.md`, 1 withdrawn on self-challenge (D-4.10-021).

| Severity | Count | Notes |
|---|---|---|
| P0 | 0 | §19 does not break firewall, leak PII, violate DSAR/residency/billing, or leave a CI gate runtime-unwireable. |
| P1 | 11 | Unbuildable as written: missing entity (D-4.10-001), missing §5.11 rows (D-4.10-002), missing Solo tier (D-4.10-003), buyer/seller column conflation (D-4.10-004), entitlement not in §34.1.1 (D-4.10-005), missing API (D-4.10-006), missing webhooks (D-4.10-007), missing audit events (D-4.10-008), missing Appendix J enums (D-4.10-011), missing retention/DSAR/residency (D-4.10-013), Solo `evaluation_owner_mode` inheritance silent (D-4.10-015), missing idempotency / partial-failure rollback (D-4.10-016). |
| P2 | 13 | Acceptance criteria style (D-4.10-009); state-machine prose (D-4.10-010); glossary (D-4.10-012); §39 character limits (D-4.10-014); cascade behavior on template delete (D-4.10-017); mobile divergence surfacing (D-4.10-018); semver bump rules (D-4.10-022); SourceraTemplateRegistry entity (D-4.10-023); guest scoping (D-4.10-024); third-party outage handling (D-4.10-025); Appendix M.1 coverage gap (D-4.10-026); downgrade-path data preservation (D-4.10-028); console-firewall surfacing (D-4.10-029). |
| P3 | 4 | Dangling §19.8 reference (D-4.10-019); stale "v6.0" reference (D-4.10-020); Amendment Protocol citation gap (D-4.10-027); search performance budget (D-4.10-030). |
| **Total** | **28** | |

---

## 8. Cross-Phase Linkage

- **Phase 1 (Data Model §4)** MUST verify the missing §4 WorkspaceTemplate / WorkspaceTemplateVersion / SourceraTemplateRegistry entities (D-4.10-001 / D-4.10-023) and the missing `Workspace.source_template_id` field (D-4.10-017).
- **Phase 3 (RBAC §5)** MUST verify the missing §5.11 row group (D-4.10-002) and the guest-scoping silence (D-4.10-024).
- **Phase 7 (Pricing §34)** MUST verify the missing §34.1.1 / §34.1.2 cell (D-4.10-005), the Solo column omission (D-4.10-003), the buyer/seller column conflation (D-4.10-004), and the downgrade path (D-4.10-028).
- **Phase 8 (APIs / Webhooks / Notifications)** MUST verify the missing API surface (D-4.10-006), webhook + notification + audit events (D-4.10-007 / D-4.10-008), Appendix C / G coverage, error-code coverage (D-4.10-016), and idempotency/partial-failure handling.
- **Phase 9 (Privacy / Retention / Residency)** MUST verify retention / DSAR / residency silence (D-4.10-013) and the downgrade-path data preservation (D-4.10-028).
- **Phase 10 (UX / a11y / mobile / perf)** MUST verify mobile-parity surfacing (D-4.10-018), search performance budget (D-4.10-030), and acceptance-criteria rewrite (D-4.10-009).
- **Phase 11 (Surface/Engine Appendix M)** MUST verify Appendix M coverage gap (D-4.10-026).
- **Phase 12 (Operations)** MUST verify the SourceraTemplateRegistry quarterly-cadence authoring (D-4.10-023) and the Loops.so outage row (D-4.10-025).
- **Phase 14.9.1 (Inline Tier-List Audit)** inherits D-4.10-003 as a 29th audit location (§19.6.1 inline tier list).
- **Phase 14.13a (audit-event / enum / error code rollup, v7.1.1 backlog per CLAUDE.md §16)** inherits D-4.10-008 / D-4.10-011 / D-4.10-016 (§19 audit-action enum extensions; four new §19 enums; new error codes for partial-failure / concurrent-apply / mobile-blocked).

---

## 9. Pre-edit Backup

No spec edits performed in this prompt (audit non-destructive by default per `Audit_Prompts.md` doctrine). Master Spec at v7.1.0 unchanged. No `legacy-import:_versions/` snapshot taken because no edit was applied.
