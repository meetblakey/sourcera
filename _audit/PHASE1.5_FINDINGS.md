# Phase 1.5 — §4.6 Audit & Logging Entities Findings (Scratch Log)

**Phase prompt:** Audit_Prompts.md → Prompt 1.5 (Mode A sequenced sub-prompt).
**Scope:** §4.6.1 Audit Event, §4.6.1.1 Audit Event Indexes/Retention/DSAR/State Machine, AuditEventActionType registry (Appendix J), retention contract per §6.7.3 / §40.2, residency per §4.6.1.1, immutability per §4.6.1.1, DSAR cascade per §6.8.4 / §6.8.5, secret-exclusion in `changes` payload, and reverse-checks against §13.5 / §22.20 / §34 / §50 / §6.7 / §51 audit-action references.
**Defect-ID convention:** `D-1.5-NNN` per Audit_Prompts.md amendment.
**Severity rule application:** P0 reserved for (a) bearer-secret leakage in audit payloads or (b) audit-event `action` strings referenced in spec body without an Appendix-J registration. Both classes apply in this prompt's scope.
**Self-challenge revisions:** Three (logged inline below).

---

## 1. Sources Read End-to-End

- Master Spec §4.6 entire (lines 7084–7322).
- Master Spec §4.6.1.1 D-1V-008 remediation block (lines 7111–7156).
- Master Spec §6.7 Audit Logging (lines 9268–9326).
- Master Spec §6.8 Data Privacy & GDPR (lines 9328–9486), with focus on §6.8.4 cascade (9409–9428) and §6.8.5 audit-integrity exemption (9430–9466).
- Master Spec §40.2 Data Retention & Deletion (lines 30240–30278).
- Master Spec §50.5 Ops-Tagged Audit Actor (lines 37004–37056).
- Master Spec §13.5 Score Modification & Audit Trail (lines 11876–11910) — reverse-check.
- Master Spec §22.20.2 / §22.20.3 / §22.20.7 Authored Extensions block (lines 17927–17961, 17962–18000, 18098–18143) — reverse-check for capability-chip / KB auto-merge action emissions.
- Master Spec §10.16 phase advancement / §2.8 mode-change notes (line 1664–1691) — reverse-check for `phase_advanced_with_unmet_gates` / `workspace_evaluation_owner_mode_changed`.
- Master Spec §25.2 / line 18516 — reverse-check for `ops.bridge.notification_suppressed`.
- Appendix J Audit Event Action Types base enum (line 42719–42729).
- Appendix J `vendor_disqualification_audit_action` (lines 42659–42663).
- Appendix J `billing_admin_action` namespace registry (lines 42731–42787).
- Appendix J `audit_event_action_type` KB additions (lines 43715–43727).
- Appendix J §27.6 / §27.8 extensions (lines 44016–44052).
- Appendix J `audit_event_actor_type` (line 44751–44755) and Ops-Tagged Audit Action Types narrative (lines 44785–44791).
- Appendix M Audit Event row (line 46283).

## 2. Convention Walk Across §4.6.1 (Audit Event)

| Convention | Status | Notes |
| :---- | :---- | :---- |
| 1. Entity definition | ✅ — full field table at lines 7092–7107 with id/org_id/console/timestamp/user_id/action/entity_type/entity_id/changes/ip_address/user_agent/status/failure_reason/notes | Standard `created_at` aliased to `timestamp` per Principle #2; `updated_at` / `updated_by` / `deleted_at` legitimately absent because immutable. |
| 2. Acceptance criteria | ✅ — 7 numbered ACs at lines 7141–7148 | Observable, scope-bound. |
| 3. Enum registration | ❌ — multiple action-type strings emitted in spec body without Appendix-J registration. **Defects D-1.5-002 through D-1.5-008 below.** | |
| 4. Glossary (Appendix K) | ⚠ — "Audit Event" not yet cross-checked in Appendix K canonical glossary (Phase 12.3 amendment). | Outside this prompt's scope; flagged for Phase 1.7 / Phase V cleanup. |
| 5. State machine | ✅ — declared "no state machine; append-only and immutable" (line 7129); Convention #5 satisfied because there are no transitions. | |
| 6. APIs (§32) | ⚠ — §32 endpoint contract for audit-event reads / exports not within §4.6 scope; §6.7.4 narrates "Settings → Audit Logs" but no §32 path. Forwarded to Phase 8 audit. | |
| 7. Webhooks (§31) | ⚠ — no §31 webhook for audit-event dispatch; intentional (audit is read-side). Forwarded to Phase 8 for confirmation. | |
| 8. Plan gating | ✅ — §34.1.1 / §34.1.2 cell `Audit Log Retention (UI)` cited authoritatively. | |
| 9. Retention & privacy | ⚠ — §4.6.1.1 carries a robust retention block, but §40.2 Data Retention table lacks a row for AuditEvent. **Defect D-1.5-009 below.** | |
| 10. Numerical singletons | ⚠ — §4.6.1.1 inline-restates the plan-tier UI-retention curve `30d / 30d / 1y / 1y / 3y / 7y` rather than citing §34.1 cell `Audit Log Retention (UI)`; the curve also appears restated in Appendix M's row. **Defect D-1.5-010 + D-1.5-011 below.** | |
| 11. Heading syntax | ✅ — `## 4.6 Audit & Logging Entities {#4.6-audit-and-logging-entities}` correct. | |
| 12. Surface/engine mapping (Appendix M) | ✅ — Appendix M row at line 46283 binds the entity to the "Audit log" tab. | |
| 13. Console firewall | ✅ — `console` field with cross-console firewall enforcement on read; HTTP 404 on cross-Org reads; HTTP 403 on direct writes. AC #3 explicitly tests cross-console projection. | |
| 14. Edge cases | Mostly ✅ — failure modes #1–#3 cover transactional outbox, DSAR field-partition error, and cardinality explosion. **D-1.5-012 below** flags the residency-replication edge case the spec is silent on. | |

## 3. Six Required Checks (per Audit_Prompts.md Prompt 1.5)

### Check 1 — Append-Only Confirmation (DSAR redacts; does not delete)

**Verdict:** ✅ Satisfied.

**Evidence.**
- §4.6.1.1 line 7129: "Audit Event is **append-only and immutable**; there is no state machine. Once written, the row is frozen: only DSAR field-level pseudonymization (per §6.8.5) is permitted; all other writes return HTTP 422 `audit_event_immutable`. Soft-delete is forbidden — the entity has no `deleted_at` field by design."
- AC #2 (line 7143) reinforces: "post-write writes (other than DSAR field-level pseudonymization) MUST return HTTP 422 `audit_event_immutable`."
- §6.7 line 9270: "Audit logs cannot be modified or deleted by any user; only append operations are allowed."
- §6.8.5 row #1 confirms DSAR pseudonymizes user-attribution FKs; payload body retained verbatim.
- AC #5 + DSAR Cascade block (line 7136–7140) detail exact field-set partition (pseudonymized vs. preserved).

No defect filed.

### Check 2 — Reverse-Check on Audit Action Type Registration

**Verdict:** ❌ Multiple unregistered action strings.

The bare-verb canonical enum at Appendix J line 42721–42723 is exhaustive: `created`, `updated`, `deleted`, `archived`, `submitted`, `approved`, `rejected`, `advanced_phase`, `reverted`, `amended`, `signed`, `exported`. The §4.6.1.1 contract (line 7099) extends this with the qualified-string namespace registries:
- `vendor_disqualification_audit_action` (Appendix J line 42659–42663) — 12 values for `entity_type=vendor_disqualification_record`.
- `billing_admin_action` namespace (Appendix J lines 42735–42778) — `org.*` qualified strings for the 11 billing entity types.
- KB additions (Appendix J lines 43715–43727) — 13 values for KB / Managed-Agent entity types.
- §27.6 taxonomy CMS extensions (Appendix J line 44018) — 15 values for taxonomy-management actions.
- §27.8 marketplace-abuse extensions (Appendix J line 44052) — 14 values for abuse-report entity types.

**Action strings emitted by spec body but absent from every registry above:**

| # | Action | Emitted by | Authored Extension flag? | Severity |
| :---- | :---- | :---- | :---- | :---- |
| 1 | `audit_logs_exported` | §6.7.4 line 9324 — bullet "Each export is logged as an audit event `audit_logs_exported`" | No | P0 |
| 2 | `audit_event_cross_console_read` | §4.6.1.1 line 7124 (Org-Admin/Org-Owner/Billing-Admin unified read flag) and AC #3 line 7144 | No (cited inline as "audit-of-audit log") | P0 |
| 3 | `audit_event_export` | §4.6.1.1 retention block line 7133 (compliance-action retention class) | No | P0 |
| 4 | `phase_advanced_with_unmet_gates` | §10.16 line 1664; §4.6.1 cross-reference at line 1679 claims registration "for `entity_type=workspace`" but no Appendix-J row exists | Implied (Phase 14.4 registration); not landed | P0 |
| 5 | `workspace_evaluation_owner_mode_changed` | §2.8 line 1669; §4.6.1 cross-reference at line 1679 claims registration; no Appendix-J row exists; surfaces also in Appendix M Solo-mode row line 46225 | Implied; not landed | P0 |
| 6 | `capability_declaration_deprecated` | §22.20.2 line 17944 (chip-remove handler) | No | P0 |
| 7 | `capability_declaration_chip_added` / `capability_declaration_chip_removed` / `capability_declaration_chip_renamed` | §22.20.7 #5 line 18136 (Authored Extensions) — explicitly mis-targeted: "Appendix J `BillingAdminAuditAction` extended" | Yes (AE-14.8-05 per F-AE-042) | P0 |
| 8 | `kb_entry.auto_merged` / `kb_entry.auto_archived` | §22.20.7 #5 line 18136 — same Authored Extension bundle, same mis-targeted namespace | Yes (AE-14.8-05) | P0 |
| 9 | `ops.bridge.notification_suppressed` | §25.2.x line 18516 — kill-switch suppression event written to "Appendix J `audit_event_action`" (the singular, deprecated key) | No | P0 |

**Severity rule application.** Audit_Prompts.md Prompt 1.5 explicitly states: "P0 for any leakage of secrets in audit payloads **or any audit event whose action_type is unregistered**." The instruction is unconditional on AE flag — even AE-pending rows are P0 until ratified, because a write of `action='capability_declaration_chip_added'` against `entity_type='capability_declaration'` would today fail the §4.6.1.1 `audit_event_action_enum_union_validator` (Appendix J line 42725 wording: "implementations that whitelist only the bare-verb enum MUST be treated as a blocking deploy bug"). Each unregistered string is therefore a build-blocking emit-path defect.

**Self-challenge revision #1.** First pass classified items 7–8 as P1 (AE-pending). Re-read of the Audit_Prompts.md severity rule ("any audit event whose action_type is unregistered") forced uniform P0 classification. Inconsistent severity-by-AE-flag would let an AE row block prod deploy without filing the right severity. Reverted to P0.

**Filing strategy.** Items 1–9 collapse into three structural defects (D-1.5-002, D-1.5-003, D-1.5-004) plus one "namespace mis-classification" defect (D-1.5-005 for the §22.20.7 `BillingAdminAuditAction` mis-target, which is a separate Convention #3 violation independent of the registration gap).

### Check 3 — Audit Retention Per Data Class

**Verdict:** ⚠ Partially specified. §40.2 row missing.

§4.6.1.1 retention block (lines 7131–7134) is comprehensive: plan-tier UI default per §40.2 (`30d / 30d / 1y / 1y / 3y / 7y`); 7-year financial/compliance exemption with action-class catalog; residency partition stated.

However:
- §40.2 Data Retention & Deletion table at line 30242–30278 is the canonical retention authority per CLAUDE.md §11. It does **not** carry a discrete AuditEvent row. The closest entry is a generic catchall "User data (responses, comments, audit) | Life of workspace" at line 30245, which is materially incorrect (audit is per-row plan-tier UI retention with a 7-year financial-record exemption, not "life of workspace"). 
- §6.7.3 line 9313 correctly redirects to "§34.1.1 / §34.1.2 cell `Audit Log Retention (UI)` and §40.2", but §40.2 doesn't honor the redirect with a corresponding row.
- The `extended_financial` retention class is mentioned in §40.2 prose-style at multiple billing rows but never declared as a §40.2 row class with the §6.8.5 retained-row class catalog.

**Defect D-1.5-009 (P1).**

### Check 4 — Audit Residency

**Verdict:** ✅ Satisfied for read-projection; ⚠ silent on cross-region replication / DR.

§4.6.1.1 line 7134: "Each row stored in the `org_id`'s `data_residency_region` partition; cross-region reads from customer surfaces blocked." This satisfies the "US/EU split with no cross-region copy" check on the hot path.

The spec does **not** address:
- Cross-region replication for disaster recovery (the customer-side phrase "no cross-region copy" is ambiguous about replicas).
- Failover behavior when the primary region is unavailable.
- Cross-region access by Sourcera Ops under §50.4.1 residency-tier checks (§4.6.3 enforces the residency check on OpsSession open, but §4.6.1 does not state whether an Ops user with a non-matching tier can read the audit row).

These are P2 ambiguities, not P0/P1 — Phase 6 (Privacy & Residency) audit will handle the DR/failover replication story across all entity classes. **Defect D-1.5-012 (P2)** filed for narrow §4.6.1 silence.

### Check 5 — Audit Payload Bearer-Secret Exclusion

**Verdict:** ❌ Not satisfied. **P0.**

The §4.6.1 entity table `changes` field (line 7102) reads: "JSON | Max 10000 chars | {field: {old_value, new_value}, ...} for updates. Field values are pseudonymized at write for PII-bearing fields per §6.8.4 (e.g., `email`, `name`, `phone`); pseudonyms are stable per Org, reversible only by Ops Finance under §35 audit."

This addresses **PII**. It does not address **bearer secrets** — passwords, password hashes, raw API tokens (vs `api_token_id` which is hashed per §6.7.2 line 9309), MFA seeds, recovery codes, WebAuthn credential secrets, SSO session tokens, step-up reauth tokens, signing keys. None of these fields is enumerated as forbidden in `changes`, and the §4.6.1 schema is silent on whether a write of `changes = {"password_hash": {"old_value": "...", "new_value": "..."}}` against `entity_type = 'user'` would be accepted.

**Comparison with PII contract.** §6.8.4 PII registry is referenced in §4.6.1.1 DSAR Cascade (line 7137: "`changes.<field>` PII bearers (filtered per §6.8.4 PII registry)"), so a registry pattern exists for PII. No analogous "bearer-secret registry" exists, and no `audit_event_secret_field_excluded` validator is referenced.

**Why this is P0, not P1.** A buyer Org Admin reading the Audit Surface receives the `changes` JSON for any Org mutation. If a user-self-update mutation (password rotation, MFA enrollment, API token regeneration) writes the bearer secret into `changes`, the secret leaks to Org Admins (and to any Ops user with read scope, and to anyone with the §6.8.5 7-year retained pseudonymized rows). This is regulatory P0 (NIST 800-63 §5.1.1.2 "verifier shall not store passwords or hashes that allow recovery"; SOC 2 CC6.1 secret handling) and it is the explicit P0 trigger named in Audit_Prompts.md Prompt 1.5: "P0 for any leakage of secrets in audit payloads."

**Self-challenge revision #2.** First pass considered whether the §6.8.4 PII registry might be implicitly extensible to cover secrets. Re-read of §6.8.4 ("PII registry" — concrete examples are `email`, `name`, `phone`, `address`) shows the registry is explicitly PII-typed, not secret-typed. The §32 / §6.6 sections do reference Argon2id hashing for `password_hash` in M2 share links (line 32475: "never logged"), but that is local guidance for M2, not a global audit-payload contract. Re-confirmed P0.

**Defect D-1.5-001 (P0).**

### Check 6 — DSAR Right-to-Erasure Compatibility (Anonymization, Not Deletion)

**Verdict:** ✅ Satisfied.

§4.6.1.1 DSAR Cascade block (lines 7136–7140) is unambiguous: pseudonymization in-place; `id`, `org_id`, `console`, `timestamp`, `action`, `entity_type`, `entity_id`, `status`, `failure_reason` all preserved. §6.8.5 row #1 affirms 7-year retention with pseudonymized FKs and verbatim payload. §6.8.6 SLA matrix at line 9477 reinforces: "Audit-integrity-exempt rows (per §6.8.5) | Retained per §6.8.5 retention windows; pseudonymization MUST land within the 30-calendar-day SLA even though the underlying rows are not deleted."

No defect filed.

## 4. Additional Defects Surfaced During Convention Walk

### D-1.5-013 — actor_type enum drift between §50.5.1 and Appendix J `audit_event_actor_type`

§50.5.1 line 37014 declares `actor_type` enum: `user`, `managed_agent`, `system`, `ops`. Appendix J `audit_event_actor_type` at line 44753 declares the same enum's canonical values: `customer_user`, `system_agent`, `ops_actor`, `external_integration`. **Zero values overlap.** The §50.5.1 write-time validator (line 37020) tests `actor_type = 'user'`, `'ops'`, `'managed_agent'`, `'system'` — all four would fail today against the Appendix-J registered values.

This is independent of the audit-action-type registration gap. P1 (unbuildable as written; the validator and the registry disagree on enum values).

### D-1.5-014 — §6.7.2 Audit Log Structure schema field-name drift from §4.6.1

§6.7.2 line 9296–9309 lists field names `organization_id`, `resource_type`, `resource_id`, `api_token_id`. §4.6.1 entity table at lines 7092–7107 uses `org_id`, `entity_type`, `entity_id` (no `api_token_id` — `user_id` carries the actor identity). §6.7.2 also omits `console`, `failure_reason`, `notes`, `status`. P1 — §6.7.2 reads as if it predates the v7.0.0 §4.6.1 D-1V-008 / D-1V-010 rewrite and was never reconciled.

### D-1.5-015 — §6.7.1 Audit Log Scope is a stale enumeration that omits major v7.0.0 mutation classes

§6.7.1 lines 9272–9294 is a 12-bullet enumeration of "logged mutations" (user account, org settings, team, requirement, response, bid workspace, use case, scenario, marketplace listing, payment/billing, API token, SCIM, webhook). It silently omits major v7.0.0 classes: KB Entry / Managed Agent mutations (§22), AIOperation / OutcomeContract / Wallet (§4.8), Marketplace Abuse Report (§4.5.7 / §27.8), OpsSession lifecycle (§4.6.3), Console Bridge Events (§4.7.1), Vendor Disqualification (§4.7.2), EOI Acceptance (§4.5.8), Capability Declaration (§4.4.4), Buyer-Funded Pro Trial Seat (§4.3.17), Ghost Bid Import (§22.10.6), Vendor Opt-Out Authority Attestation (§27.10), Selection Report Public Link (§32.M2). §6.7.1 reads as a v6.0.0 list; the v7.0.0 §4.6.1 D-1V-009 remediation widened `entity_type` to "70+ §4 entities" but §6.7.1's narrative was not updated to match. P1 — engineering reading §6.7 alone would build an under-scoped audit emit path.

### D-1.5-016 — Appendix J `audit_event_actor_type.external_integration` has no consumer

Appendix J line 44753 registers `external_integration` as one of four `audit_event_actor_type` values, with the note: "an API call originating from a customer-configured integration (CRM Sync, custom webhook consumer, etc.) where the action is attributed to the integration principal rather than to the user who configured it — rare but required for certain §31.9 CRM-sync-initiated background mutations." However:
- §50.5.1 actor_type enum (independent of Appendix J — see D-1.5-013) lists only `user`, `managed_agent`, `system`, `ops` — no `external_integration`.
- §31.9 CRM Sync section does not reference `actor_type='external_integration'` anywhere; CRM-sync-initiated mutations write `actor_type='system_agent'` per the §31.9.4 system-agent-id pattern.
- The `audit_event_actor_type_consistency_validator` write-time rules (§50.5.1 lines 37021–37024) cover only 4 values; `external_integration` would fall through to the catch-all rejection.

P3 — dead enum value.

### D-1.5-017 — §4.6.1.1 inline-restates plan-tier UI retention curve instead of citing §34.1

§4.6.1.1 retention block line 7132: "Default UI retention: Per plan tier per §40.2 (`30d / 30d / 1y / 1y / 3y / 7y` for Free / Solo / Starter / Growth / Scale / Enterprise)." Convention #10 (numerical singletons) requires citation, not inline restatement. The canonical home is §34.1.1 / §34.1.2 cell `Audit Log Retention (UI)` per §6.7.3 line 9313. P2.

### D-1.5-018 — Appendix M Audit Event row inline-restates retention curve and omits Solo

Appendix M line 46283: "Audit Event (§4.6.1) | §4.6.1, §6.7 | "Audit log" tab in Org Settings (admin/billing-admin only) | F (30d retention), St/Gr (1y), Sc (3y), Ent (7y) per §34.1.1". Two defects: (a) inline numerical restatement of §34.1 cell (Convention #10); (b) Solo plan tier silently omitted. Solo retention per §4.6.1.1 inline restatement is `30d` (parity with Free) — this would suggest the Appendix M row is pre-Phase-14.9 and was not updated. P3.

## 5. Counterfactual Pass — Three Failure Modes Per Audited Surface

Per Audit_Prompts.md Counterfactual Pass requirement.

**§4.6.1 Audit Event entity:**
1. **An emit path writes `action='wallet_topped_up'` against `entity_type='ai_wallet'`.** Spec response: rejected with HTTP 422 `audit_event_action_namespace_mismatch` (Appendix J line 42725) because the bare-verb namespace and the qualified-string namespace are mutually exclusive per `entity_type`. Validator-enforced. ✅ Handled.
2. **An emit path writes `action='capability_declaration_chip_added'` against `entity_type='capability_declaration'`.** Spec response: today this MUST be rejected because `capability_declaration_chip_added` is unregistered (D-1.5-004). The §22.20.2 surface emit path therefore breaks at deploy. ❌ Surface contract is unbuildable until D-1.5-004 lands.
3. **An emit path writes `changes = {"password_hash": {"old_value": "...", "new_value": "..."}}`.** Spec response: today, no validator rejects the write; the secret enters the audit row, persists 7 years under §6.8.5, and is readable by every Org Admin via the Audit Surface. ❌ Critical gap — D-1.5-001.

**§4.6.1.1 retention contract:**
1. **A `billing_*` action lands on a Free-tier Org whose plan-tier UI retention is 30 days.** Spec response: §4.6.1.1 line 7133 7-year exemption applies; row surfaces in "Compliance & Financial Retention" sub-tab past day 30. ✅ Handled.
2. **A DSAR cascade fires on a User who authored 1M `phase_advanced` audit rows in a Workspace.** Spec response: §6.8.4 long-tail mitigation (line 7153 cardinality storage partition by `(org_id, year(timestamp))`) + cursor pagination + DSAR worker progress reporting. ✅ Handled.
3. **A residency evacuation transitions an EU Org to a custom EU-residency partition, requiring all historical audit rows to migrate.** Spec response: silent. §4.6.1.1 says "cross-region reads from customer surfaces blocked" but offers no rule for the migration-in-progress state. ❌ — D-1.5-012 captures the silence.

**Audit-action registry contract:**
1. **A new feature emits a new action verb without registering in Appendix J.** Spec response: `audit_event_action_enum_union_validator` (Appendix J line 42725) rejects at write. ✅ Handled — when the validator is wired. (Phase 9 audit will check runtime wiring.)
2. **The Appendix J KB additions registry is missing one of the §22.20.7 chip-action verbs.** Spec response: emit fails with HTTP 422; the §22.20.2 chip-edit surface is broken. ❌ — D-1.5-004.
3. **An Authored-Extension verb is approved by sign-off but never landed in Appendix J.** Spec response: same as #2 — surface breaks. The AE-14.8-05 entry in `_integration/AUTHORED_EXTENSIONS_LEDGER.md` is the canonical ratification gate; no current backstop CI gate prevents the surface from shipping ahead of the registry update. P1 process gap (out of scope for this prompt; flag for Phase 9).

**Self-challenge revision #3.** Initial draft of the counterfactual pass treated registry failures as P1. Re-read of Audit_Prompts.md severity rule + the explicit P0 trigger in Prompt 1.5 ("any audit event whose action_type is unregistered") forced re-classification to P0 for the unregistered-action defects (D-1.5-002 through D-1.5-005) but NOT for the process gap (which is P1, observed via different evidence).

## 6. Defects Promoted to DEFECT_LEDGER.md

| Defect ID | Severity | Class | One-line summary |
| :---- | :---- | :---- | :---- |
| D-1.5-001 | P0 | dsar / observability / firewall_leakage | §4.6.1 `changes` JSON has no bearer-secret exclusion clause |
| D-1.5-002 | P0 | enum | `audit_logs_exported`, `audit_event_cross_console_read`, `audit_event_export` referenced but unregistered |
| D-1.5-003 | P0 | enum | `phase_advanced_with_unmet_gates`, `workspace_evaluation_owner_mode_changed` referenced but unregistered |
| D-1.5-004 | P0 | enum / authored_extension | §22.20 chip-action and KB auto-merge verbs (`capability_declaration_chip_added/removed/renamed`, `kb_entry.auto_merged`, `kb_entry.auto_archived`, `capability_declaration_deprecated`) referenced but unregistered |
| D-1.5-005 | P0 | enum | `ops.bridge.notification_suppressed` referenced but unregistered AND mis-targets singular "audit_event_action" key |
| D-1.5-006 | P1 | enum / consistency_drift | §22.20.7 #5 mis-targets `BillingAdminAuditAction` for non-billing actions (capability/KB) |
| D-1.5-007 | P1 | enum | §50.5.1 `actor_type` values (`user/managed_agent/system/ops`) drift from Appendix J `audit_event_actor_type` (`customer_user/system_agent/ops_actor/external_integration`) — zero value overlap |
| D-1.5-008 | P1 | data_model / consistency_drift | §6.7.2 schema field names (`organization_id`, `resource_type`, `resource_id`) drift from §4.6.1 (`org_id`, `entity_type`, `entity_id`) |
| D-1.5-009 | P1 | retention | §40.2 lacks an explicit AuditEvent row with the §34.1 plan-tier UI curve and the §6.8.5 audit-integrity 7-year exemption |
| D-1.5-010 | P1 | documentation_gap | §6.7.1 Audit Log Scope is a stale v6.0.0-style enumeration that silently omits KB / AIOperation / Marketplace-abuse / OpsSession / Console-Bridge / Disqualification / EOI / Capability / Pro-Trial-Seat / Ghost-RFP / Opt-Out / M2-link mutation classes |
| D-1.5-011 | P3 | enum | Appendix J `audit_event_actor_type.external_integration` is dead — no consumer in §50.5.1, §31.9, or any other §4.x emit path |
| D-1.5-012 | P2 | residency | §4.6.1.1 residency clause silent on cross-region replication / DR / migration-in-progress states |
| D-1.5-013 | P2 | numerical_singleton | §4.6.1.1 inline-restates plan-tier UI retention curve `30d / 30d / 1y / 1y / 3y / 7y` instead of citing §34.1.1 / §34.1.2 cell `Audit Log Retention (UI)` |
| D-1.5-014 | P3 | numerical_singleton / consistency_drift | Appendix M Audit Event row line 46283 inline-restates the retention curve AND silently omits Solo plan tier |

(D-1.5-015 to D-1.5-018 collapsed into the rows above to avoid double-counting; the scratch-log enumeration above tags each underlying issue.)

## 7. COVERAGE_MATRIX.md Cell Updates

| feature_id | feature_name | Cells changed |
| :---- | :---- | :---- |
| F-117 | Audit Event Entity | `enums` ⚠ → ❌ (D-1.5-002/003/004/005); `retention` ⚠ → ❌ (D-1.5-009/013); `dsar` ⚠ → ❌ (D-1.5-001 secret-exclusion gap); `residency` ⚠ → ⚠ (D-1.5-012 narrow silence; not a hard fail); `surface_engine_mapping` ✅ → ⚠ (D-1.5-014 Appendix M row inline-restates + omits Solo) |
| F-170 | Audit Logging | `data_model` ⚠ → ❌ (D-1.5-008 schema-field drift); `enums` ⚠ → ❌ (D-1.5-002/003/004/005 — registry under-coverage cascades from F-117); `retention` ⚠ → ❌ (D-1.5-009); `dsar` ⚠ → ❌ (D-1.5-001) |
| F-171 | Audit Log Export | `enums` ⚠ → ❌ (D-1.5-002 — `audit_logs_exported` unregistered); `acceptance_criteria` ⚠ → ⚠ (no change); `api` ⚠ → ⚠ (no §32 endpoint cited; out of scope this prompt) |
| F-711 | Ops-Tagged Audit Actor | `enums` ⚠ → ❌ (D-1.5-007 actor_type value-set drift; D-1.5-011 dead `external_integration` value); `acceptance_criteria` ⚠ → ⚠ (the §50.5 ACs themselves are well-formed; the registry violation is the defect, not the ACs) |
| F-AE-042 | AE-14.8-05 Capability Chip Audit Events | `authored_extension_status` ⚠ → ❌ (D-1.5-004 + D-1.5-006 — registry not landed AND mis-targeted to billing namespace) |

F-118 (Attachment) and F-119 (OpsSession) cells are out of scope for Prompt 1.5 (those are §4.6.2 and §4.6.3 entity-walks; the prompt scope is the Audit Event sub-section). No matrix changes for F-118 / F-119.

## 8. Forward Pointers

- Phase 6 (Privacy & Residency) inherits D-1.5-001 (bearer-secret exclusion) and D-1.5-012 (residency replication) for cross-entity application.
- Phase 8 (API + Webhook) inherits the §32 audit-event endpoint contract gap (no §32 path for `GET /v1/orgs/{org_id}/audit-events`).
- Phase 9 (Observability / CI gates) inherits D-1.5-002/003/004/005 to verify runtime wiring of `audit_event_action_enum_union_validator` and to file the missing process-gate that prevents surface ship-ahead of registry update.
- Phase 1.6 (§4.7) and Phase 1.7 (§4.8) consume D-1.5-007 and D-1.5-011 (Console-Bridge / AIOperation actor_type alignment).
