# Phase 3.4 — §6.7 Audit Logging Walk Findings (Scratch Log)

**Phase prompt:** Audit_Prompts.md → Prompt §6.7 walk (Authentication/Audit phase 3 sub-prompt).
**Scope:** Master Spec §6.7 (lines 9492–9551): §6.7.1 Audit Log Scope, §6.7.2 Audit Log Structure, §6.7.3 Retention Policy by Plan, §6.7.4 Audit Log Access. Cross-walks into §4.6.1 Audit Event entity, §40.2 Data Retention, §42.6.1 Audit Integrity Background Jobs, §50.5 Ops-Tagged Audit Actor, §50.5.4 Billing Admin Audit View Ops Chip, §50.5.5 Seller Billing Audit View, §36.2 Organization Settings Audit Logs row, §5.2.1.4 Billing Admin Audit View, §6.6.4 Account Lockout, §6.5 SSO, §25.2 Console Bridge DLQ, Appendix C Notification Event Catalog, Appendix G PostHog Taxonomy, Appendix J `audit_event_action_type` registries.
**Defect-ID convention:** `D-3.4-NNN` per Audit_Prompts.md amendment.
**Severity rule application:** P0 reserved for any audit-log integrity gap per the §6.7 prompt's explicit P0 trigger ("P0 for any audit-log integrity gap"). The phase-1.5 P0 trigger ("any audit event whose action_type is unregistered") still applies on net-new findings; pre-existing P0 audit-action registry defects (D-1.5-002 through D-1.5-005) are remediated and not re-filed. P1 cap on action-type registration findings within the §6.7 scope per this prompt's instruction ("promote any missing to P1 audit defects") for the narrow §6.7-resident sweep — superseded by the broader integrity P0 trigger where the two collide.
**Self-challenge revisions:** Two (logged inline below).

---

## 1. Sources Read End-to-End

- Master Spec §6.7 entire (lines 9492–9551).
- Master Spec §4.6.1 / §4.6.1.1 (lines 7084–7322) for entity-level retention and immutability contract.
- Master Spec §6.6 + §6.6.4 (lines 27562–27566) for account lockout and authentication policy.
- Master Spec §6.5 SSO (lines 9442–9450) for SSO authentication path silence.
- Master Spec §6.8.4 / §6.8.5 (lines 9633–9486) for DSAR cascade interaction with audit rows.
- Master Spec §40.2 Data Retention & Deletion table (lines 30240–30278).
- Master Spec §42.6.1 Audit Integrity Background Jobs (lines 30816–30848) — the canonical hash-chain integrity job.
- Master Spec §50.2.4 Break-Glass DB Access (lines 37000–37016) for the off-API write path that bypasses application-layer immutability.
- Master Spec §50.5 / §50.5.4 / §50.5.5 (lines 37301–37352) for Ops-Tagged Audit Actor + Billing Admin Audit View Ops chip + Seller-Console parity.
- Master Spec §5.2.1.4 (line 8918) for the Billing Admin Audit View capability gating.
- Master Spec §36.1–§36.4 (lines 29691–29739) for the user-facing settings surface.
- Master Spec §25.2 / §25.2.4 (lines 18495, 19314) for console-bridge DLQ and reconciliation-summary webhooks.
- Appendix C Notification Event Catalog (lines 40582–40700+) for security/anomaly event registration.
- Appendix G PostHog Event Taxonomy `auth_*` family verification.
- Appendix J `audit_event_action_type` registries (canonical bare-verb enum + qualified-string namespaces; v7.0.0 Audit-System / Workspace-Lifecycle / KB / Console-Bridge-Ops sub-sections landed via D-1.5-002/003/004/005 remediation 2026-05-01).
- Phase 1.5 findings log (PHASE1.5_FINDINGS.md) for prior coverage of Audit Event entity-walk defects.
- Phase 1.6 findings log (PHASE1.6_FINDINGS.md) for prior coverage of Console Bridge Event defects (D-1.6-003 per-event DLQ webhook).

## 2. Convention Walk Across §6.7

| Convention | Status | Notes |
| :---- | :---- | :---- |
| 1. Entity definition | ⚠ — §6.7.2 schema drifts from §4.6.1 | Pre-existing D-1.5-008 P1 covers the schema field-name drift; not re-filed. |
| 2. Acceptance criteria | ⚠ — §6.7 lacks numbered ACs at the section level | The §6.7.4 access surface declares behavior in narrative form only; no observable/measurable AC block. Forwarded; not a §6.7-prompt-scope finding. |
| 3. Enum registration | ✅ post-remediation | `audit_logs_exported` registered in Appendix J Audit-System sub-section per D-1.5-002 remediation. The §6.7-resident action-type sweep returns no new unregistered strings. |
| 4. Glossary (Appendix K) | ⚠ | "Audit Log" / "Audit Event" cross-check in Appendix K canonical glossary not in scope this prompt; flagged for Phase V cleanup. |
| 5. State machine | ✅ | Append-only and immutable; no transitions (per §4.6.1.1 line 7129). |
| 6. APIs (§32) | ⚠ | §6.7.4 narrates "Settings → Audit Logs" but no §32 endpoint contract; pre-existing forward to Phase 8. |
| 7. Webhooks (§31) | n/a | Audit reads do not emit webhooks by design. |
| 8. Plan gating | ⚠ | §6.7.3 cites §34.1 + §40.2 correctly; §36.2 settings surface row inline-restates with stale tier names — see D-3.4-006 below. |
| 9. Retention & privacy | ⚠ | §40.2 lacks AuditEvent row (pre-existing D-1.5-009 P1 still open). |
| 10. Numerical singletons | ❌ | §36.2 inline retention restatement with stale `Business` tier name — see D-3.4-006. |
| 11. Heading syntax | ✅ | `## 6.7 Audit Logging {#6.7-audit-logging}` correct; sub-section anchors present. |
| 12. Surface/engine mapping (Appendix M) | ⚠ | Pre-existing D-1.5-014 P3 covers Appendix M Audit Event row inline restatement and Solo omission; not re-filed. |
| 13. Console firewall | ✅ post-D-1.6-001 remediation | Console Bridge row-level seller projection landed; AuditEvent firewall preserved by Pattern B FK preservation. |
| 14. Edge cases | ❌ | Failed login attempts excluded from audit (§6.7.1); cryptographic integrity protection limited to high-impact subset (§42.6.1 line 30825); break-glass DB write path bypasses application-layer validator (§50.2.4 ¶4). See D-3.4-001, D-3.4-002, D-3.4-003. |

## 3. Five Required Checks (per Audit_Prompts.md Prompt §6.7)

### Check 1 — Every action_type in the Spec is Registered in Appendix J

**Verdict:** ✅ Within the §6.7 sweep scope, post-D-1.5-002/003/004/005 remediation.

The only action_type emitted natively by §6.7 is `audit_logs_exported` at §6.7.4 line 9548 (export logging bullet). Per D-1.5-002 remediation 2026-05-01, this string is now registered in Appendix J Audit-System Audit Event Action Types sub-section bound to `entity_type=audit_event_view`. The v7.0.0 Audit-System / Workspace-Lifecycle / KB / Console-Bridge-Ops registration sub-sections collectively close the Phase 1.5 reverse-check enum gaps.

The §6.7-resident sweep returns no new unregistered action_types. The Phase 1.5 reverse-check defects (D-1.5-002, D-1.5-003, D-1.5-004, D-1.5-005) were filed at P0 under the Phase 1.5 prompt's explicit P0 trigger; they are not re-filed at P1 under this prompt's softer rule because they are already closed. The instruction in this prompt to "promote any missing to P1 audit defects" applies prospectively to net-new findings within §6.7's scope; none surface.

**Self-challenge revision #1.** First pass considered re-classifying the closed D-1.5-002 family from P0 → P1 on the theory that this prompt's explicit P1 instruction overrides Phase 1.5's P0 trigger. Re-read of the Defect Ledger Format severity rule confirms once a defect_id is published, it is immutable. Severity classifications are derived from the original prompt's rules at file time; later prompts cannot reclassify retroactively without a forwarding row. No reclassification.

No new defect filed in this check.

### Check 2 — Audit Log Retention Set in §40.2

**Verdict:** ❌ Pre-existing defect open.

Pre-existing D-1.5-009 (P1, status `open`) covers the §40.2 missing AuditEvent row. §40.2 does not honor the §6.7.3 line 9537 redirect ("Audit-log UI retention is authoritative in §34.1.1 / §34.1.2 cell **Audit Log Retention (UI)** and §40.2 Data Retention & Deletion") — the only §40.2 row that mentions audit is the generic "User data (responses, comments, audit) | Life of workspace" at line 30245, which is materially incorrect. No new defect filed; this prompt forwards to D-1.5-009 for landing.

### Check 3 — Audit Log Integrity Protection (Append-Only, Hash-Chained, or Equivalent)

**Verdict:** ❌ Critical gap. P0 audit-log integrity defect.

§6.7.1 line 9494 states: "All mutations in Sourcera are logged immutably. Audit logs cannot be modified or deleted by any user; only append operations are allowed." §4.6.1.1 line 7129 reinforces: "Audit Event is **append-only and immutable**; there is no state machine. Once written, the row is frozen: only DSAR field-level pseudonymization (per §6.8.5) is permitted; all other writes return HTTP 422 `audit_event_immutable`."

These are application-layer promises enforced by a single Convex write-validator. The §6.7 section does NOT specify cryptographic tamper-evidence (hash-chain, signing, WORM-equivalent) as the integrity backstop. The hash-chain integrity job at §42.6.1 line 30825 (`audit_event_hash_chain_scan`) explicitly scopes to "Every AuditEvent row for high-impact mutation action kinds (registered in §4.6.1 `audit_event_high_impact_actions`) in the last 30 days." Three problems:

1. **Scope is partial.** "High-impact" is a fraction of the audit corpus (~100k/month per the §42.6.1 cost target). The remaining audit rows have zero cryptographic integrity protection.
2. **The registry doesn't exist.** `audit_event_high_impact_actions` is referenced exactly once in the entire spec (line 30825). It is NOT defined in §4.6.1, §6.7, or any Appendix J subsection. The integrity job's scope is undefined as written.
3. **Break-glass DB writes bypass the validator.** §50.2.4 ¶4 authorizes break-glass DB access ("vaulted key; 72-hour postmortem") which writes directly to Convex tables. The application-layer `audit_event_immutable` validator does not run. A break-glass operator can mutate or delete audit rows undetected — and because the integrity scan only covers "high-impact" rows, even rows that ARE chain-protected can be tampered with for actions that aren't on the (undefined) high-impact list.

By contrast, §4.7.2 VendorDisqualificationRecord carries `audit_chain_hash`, `related_audit_chain_hash`, and `chain_position`, and §25.3.5 documents a fully-spec'd hash-chain mechanism. AuditEvent has no parallel construct.

The Audit_Prompts.md Prompt §6.7 explicitly states: "Defect ledger entries; **P0 for any audit-log integrity gap.**" The gap is unambiguous: the spec promises immutability, names hash-chaining only for a subset, leaves the subset registry undefined, and authorizes a write path that bypasses the validator.

**Defects D-3.4-001 (P0) and D-3.4-002 (P0) below.**

**Self-challenge revision #2.** First pass classified D-3.4-002 (the missing `audit_event_high_impact_actions` registry) as P1 — a registry-not-defined defect would normally be P1 enum. Re-read of the Audit_Prompts.md severity rule recognized that P0 trigger (c) — "violates a hard regulatory requirement (... audit-log integrity)" — applies because the missing registry IS the integrity gap, not a separate enum hygiene issue. The hash-chain integrity scan literally cannot run as written. Reclassified to P0 in alignment with D-3.4-001 (the encompassing integrity defect) and the prompt's explicit P0 trigger.

### Check 4 — Audit Log Surfacing in Ops Console (§50) and Buyer/Seller Settings (§36) is Consistent

**Verdict:** ❌ Inconsistent across four sections; settings row uses stale plan-tier names.

Four spec sections describe overlapping audit-log surfacing rules:

- §6.7.4 lines 9543–9550 — Org Admin export via Settings → Audit Logs; Workspace Owner workspace-scoped view; Team Owner team-scoped view.
- §36.2 line 29714 — "Org Owner, Org Admin" only; inline retention "Enterprise: 7 years, Business: 1 year, Free: 30 days" using stale `Business` tier name (replaced by Starter / Growth / Scale in v7.0.0; Solo added Phase 14.9).
- §5.2.1.4 line 8918 — Billing Admin Audit View filtered to `action_namespace=org.billing`; not cross-referenced from §6.7.4 or §36.2.
- §50.5.4 lines 37337–37347 — Billing Admin Audit View MUST surface Ops-actor rows with a "Sourcera Ops" chip and MUST permit `actor_type='ops'` as a filter; not cross-referenced from §6.7.4 or §36.2.
- §50.5.5 line 37349 — Seller-Console parity for the Billing Admin Audit View; no §6.7.4 / §36.2 cross-reference.

An engineer building the §36.2 Audit Logs settings page from §36 alone would build only the Org-Owner / Org-Admin view, omit Billing Admin / Workspace Owner / Team Owner, omit the Ops-actor chip, omit the Seller-Console mirror, and use stale `Business` tier name. Five different surfaces describe parts of the same access matrix and none enumerate the union.

**Defects D-3.4-005 (P1, surfacing inconsistency) and D-3.4-006 (P1, stale plan-tier inline restatement) below.**

### Check 5 — Anomaly Detection Wired to Appendix C Notifications (Suspicious Login, MFA Bypass Attempt, Console-Bridge Failure Storm)

**Verdict:** ❌ Three large gaps — failed logins are not even audit-logged; Appendix C carries no security-anomaly events; console-bridge has no aggregate failure-storm detector.

**Gap 1 — Failed login attempts excluded from audit log.** §6.7.1 lines 9514–9518 explicitly exclude "failed login attempts" from audit logs ("Non-functional events (UI navigation, failed login attempts)"). This is the canonical anomaly signal for credential stuffing, brute-force, and account-takeover. §6.6.4 line 27563 documents account lockout (5 failed attempts / 10 min → 15 min lockout) but emits NO audit event for the lockout event or for the underlying failed attempts. §6.5 SSO and §6.6 password-auth flows emit zero audit events for any login outcome.

This violates SOC 2 CC6.1 (logical access controls) and NIST SP 800-53 AU-2 control enhancement ("audit events shall include all successful and unsuccessful logon attempts"). The §51 PostHog taxonomy emits product-analytics login events but those are not §4.6.1 AuditEvents — distinct retention, consent, and forensic-discovery semantics.

**Gap 2 — Appendix C lacks security-anomaly events.** Greps on Appendix C and Appendix G for `suspicious`, `account_locked`, `impossible_travel`, `mfa_bypass`, `new_device`, `unusual_location`, `dlq_storm`, `failure_storm`, `security.` return only SIM marketplace-fraud signal classes (`anomalous_query_pattern`, `velocity_anomaly`) which target marketplace abuse, not authentication anomalies. There is no `security.suspicious_login_attempt`, `security.account_locked`, `security.mfa_factor_changed`, `security.new_device_login`, `security.session_revoked_by_admin`, or any equivalent event in Appendix C.

An Org Owner has no in-app or email surface to be informed of (a) repeated failed login attempts on her account, (b) MFA recovery-code reuse from an unfamiliar IP, (c) impossible-travel pattern across her sessions, (d) admin force-termination of her sessions.

**Gap 3 — Console-bridge has no failure-storm detector.** §25.2.4 / §4.7.1 register per-event `console_bridge.dlq_entered` and `console_bridge.reconciliation_summary` (the registration itself is open as D-1.6-003 P1 forwarded). Neither is an aggregate detector. A Convex outage that DLQs 1,000 bridge events in 5 minutes generates 1,000 individual webhooks (notification storm), not one consolidated alert. The §42.6.1 audit-integrity job catalog has no parallel "console-bridge-storm" detector job.

**Defects D-3.4-003 (P0, audit-log gap on failed logins; integrity-class), D-3.4-004 (P1, Appendix C anomaly catalog), D-3.4-007 (P2, console-bridge failure-storm detector) below.**

The P0 classification on D-3.4-003 is anchored to rule (c) — "violates a hard regulatory requirement" — because excluding failed-login attempts from the audit log is a SOC 2 / NIST 800-53 AU-2 hard violation. Inclusion is the bare minimum compliance bar; exclusion creates a regulatory finding at audit time. Pure registry gaps (D-3.4-004) are P1 because Appendix C registration is unbuildable as written; pure observability gaps (D-3.4-007) are P2 because a thoughtful staff engineer could implement the storm detector under deadline given clear acceptance criteria.

## 4. Defects Promoted to DEFECT_LEDGER.md

| Defect ID | Severity | Class | One-line summary |
| :---- | :---- | :---- | :---- |
| D-3.4-001 | P0 | observability / firewall_leakage | §6.7 promises append-only immutability; cryptographic hash-chain protection is partial (high-impact subset only); break-glass DB writes (§50.2.4 ¶4) bypass application-layer validator |
| D-3.4-002 | P0 | enum / observability | `audit_event_high_impact_actions` registry referenced from §42.6.1 line 30825 but undefined anywhere in §4.6.1 / §6.7 / Appendix J — integrity scan has undefined scope |
| D-3.4-003 | P0 | observability / firewall_leakage | §6.7.1 line 9517 explicitly excludes failed login attempts from audit log; SOC 2 / NIST 800-53 AU-2 hard violation; §6.6.4 lockout policy emits no audit event |
| D-3.4-004 | P1 | notification | Appendix C lacks security-domain anomaly events (suspicious login, account_locked, mfa_factor_changed, new_device_login, session_revoked_by_admin, console_bridge.dlq_storm) |
| D-3.4-005 | P1 | consistency_drift / documentation_gap | §6.7.4 / §36.2 / §5.2.1.4 / §50.5.4 / §50.5.5 disagree on audit-log access matrix; no cross-referenced single source |
| D-3.4-006 | P1 | numerical_singleton / plan_gating | §36.2 Audit Logs row uses stale plan-tier name `Business` and inline-restates retention curve; v7.1.1 Phase 14.9.2 inline plan-tier audit covers location |
| D-3.4-007 | P2 | observability | No aggregate console-bridge failure-storm detector; per-event `console_bridge.dlq_entered` only; §42.6.1 job catalog has no `console_bridge_storm_detector` row |

## 5. Counterfactual Pass — Three Failure Modes Per Audited Surface

Per Audit_Prompts.md Counterfactual Pass requirement.

**§6.7 audit-log integrity contract:**
1. **Break-glass operator deletes 50 incriminating audit rows for actions outside the high-impact list.** Spec response today: §50.2.4 ¶4 authorizes the write path; the application-layer `audit_event_immutable` validator does not run on direct DB writes; the `audit_event_hash_chain_scan` does not cover the affected rows because they aren't on the high-impact list (which itself is undefined per D-3.4-002). The deletion is undetected. ❌ — D-3.4-001 + D-3.4-002.
2. **A SQL injection vulnerability in a §32 endpoint allows an attacker to insert forged audit rows.** Spec response today: no read-time integrity verification at the §6.7.4 export path; no chain-position monotonicity check; the forged rows blend with real rows. ❌ — D-3.4-001 (acceptance criterion (f) covers read-time chain verification and HTTP 503 `audit_chain_break_export_blocked`).
3. **A regulator subpoenas the customer's complete authentication audit trail for the past 2 years to investigate an account-compromise claim.** Spec response today: §6.7.1 line 9517 excluded failed login attempts; the customer cannot produce them because they were never logged. The customer faces a SOC 2 / NIST AU-2 finding regardless of what the actual security posture was. ❌ — D-3.4-003.

**§6.7.4 access surface:**
1. **A Billing Admin attempts to read the full audit log to investigate a contested AIOperation chargeback.** Spec response today: §36.2 says "Org Owner, Org Admin" only — Billing Admin is omitted; §5.2.1.4 says Billing Admin gets a filtered view but §6.7.4 doesn't cross-reference. Engineering builds the §36.2 surface and omits Billing Admin entirely; the contested-chargeback investigation is blocked until §5.2.1.4 is wired. ❌ — D-3.4-005.
2. **A Workspace Owner asks "what audit logs can I see for my workspace?" and the §36.2 settings page has no Workspace Owner row.** Spec response today: §6.7.4 declares Workspace Owner workspace-scoped view but the §36.2 settings page only enumerates Org Owner / Org Admin. The Workspace Owner cannot find the surface. ⚠ — D-3.4-005.
3. **An Enterprise customer requests Solo plan-tier retention parity for a transitional bid workspace.** Spec response today: §36.2 inline curve doesn't include Solo (silently); §34.1.1 / §34.1.2 cell `Audit Log Retention (UI)` is the canonical home. Engineering reading §36.2 alone would build the wrong retention curve. ❌ — D-3.4-006.

**§6.7-anomaly-detection contract:**
1. **An attacker runs a credential-stuffing campaign against 50 Sourcera users with leaked credentials.** Spec response today: §6.6.4 lockout fires on each user but no `security.account_locked` notification reaches the affected user OR Org Admin; no audit row is written; no SIM detector exists for cross-user credential-stuffing patterns. The attack is invisible until a successful login. ❌ — D-3.4-003 + D-3.4-004.
2. **A Convex region failover takes 8 minutes; 2,000 console-bridge events DLQ.** Spec response today: 2,000 individual `console_bridge.dlq_entered` webhooks fire to per-Org subscribers; no aggregate alert; Ops on-call sees a wall of webhooks; affected Buyer Org Owner cannot tell a sustained outage from transient failure. ❌ — D-3.4-004 + D-3.4-007.
3. **A user's MFA recovery codes are reused from an IP geolocation 5,000km away.** Spec response today: no `security.mfa_factor_changed` or `security.new_device_login` notification fires; the recovery-code use is recorded in the user-self-update audit (per §6.7.1 user-account-changes scope) but not flagged as anomalous; the user's first signal is when the account is taken over. ❌ — D-3.4-004.

## 6. COVERAGE_MATRIX.md Cell Updates

| feature_id | feature_name | Cells changed |
| :---- | :---- | :---- |
| F-117 | Audit Event Entity | `observability` ⚠ → ❌ (D-3.4-001 hash-chain partial coverage; D-3.4-002 undefined registry); `instrumentation_gap` ⚠ → ❌ (D-3.4-003 failed-login exclusion + D-3.4-004 anomaly catalog) |
| F-170 | Audit Logging | `observability` ⚠ → ❌ (D-3.4-001/002/003); `notifications` ⚠ → ❌ (D-3.4-004 Appendix C security-domain gap); `data_model` ⚠ → ❌ (D-3.4-001 missing hash-chain columns on AuditEvent entity table); `acceptance_criteria` ⚠ → ⚠ (no change) |
| F-171 | Audit Log Export | `observability` ⚠ → ❌ (D-3.4-001 acceptance criterion (f) — chain integrity verification at export time blocks export on chain break); `api` ⚠ → ⚠ (no change) |
| F-179 | Organization Settings (Org Admin) | `plan_gating` ⚠ → ❌ (D-3.4-006 inline retention restatement with stale `Business` tier); `console_firewall` ✅ → ⚠ (D-3.4-005 audit-log surfacing inconsistency); `documentation_gap` ⚠ → ❌ (D-3.4-005) |
| F-567 | User Settings | `notifications` ⚠ → ⚠ (D-3.4-004 user is recipient for security-domain events; cell ⚠ holds because the §36.1 Notifications row already exists but does not enumerate security-domain) |
| F-711 | Ops-Tagged Audit Actor | `documentation_gap` ⚠ → ❌ (D-3.4-005 §50.5.4 / §50.5.5 not cross-referenced from §6.7.4 / §36.2) |

F-176 (Audit-Integrity Exemption & Retention Override) cells unchanged — this prompt does not re-walk §6.8.5; D-1.5-009 forwards.

## 7. Forward Pointers

- **D-3.4-001 / D-3.4-002 are paired.** Land D-3.4-001 first (full-corpus integrity); D-3.4-002 either retires the `audit_event_high_impact_actions` registry OR re-authors it depending on whether tiered scan cadence is preserved. Recommend retirement.
- **D-3.4-003 / D-3.4-004 are paired.** D-3.4-003 lands the Appendix J authentication audit-event registration; D-3.4-004 lands the Appendix C / Appendix G surfacing layer. Together they close SOC 2 / NIST AU-2 compliance posture.
- **D-3.4-005 / D-3.4-006 are paired.** D-3.4-005 lands cross-references; D-3.4-006 unifies the inline restatement with the canonical §34.1 / §40.2 / §6.8.5 home.
- **D-3.4-007 is independent** but binds to D-3.4-004 (which authors the `console_bridge.dlq_storm` Appendix C entry) and to D-1.6-003 (per-event DLQ webhook registration, still open).
- Phase 6 (Privacy & Residency) audit MAY surface additional integrity-class defects when it walks the §50.2.4 break-glass path against §47.4 Enterprise data-residency.
- Phase 8 (API + Webhook) audit will land §32 endpoint contracts for `GET /v1/orgs/{org_id}/audit-events` (still missing) and the §32 endpoints behind §6.7.4 access surfaces.
- Phase 9 (Observability / CI gates) will verify runtime wiring of D-3.4-001 acceptance criterion (f) (`audit_chain_break_export_blocked` HTTP 503) and the new CI gates `audit_event_hash_chain_columns_present`, `audit_event_hash_chain_full_corpus_coverage`, `audit_event_break_glass_integrity_scan_triggered`, `auth_audit_event_emission_completeness`, `appendix_c_security_domain_completeness`, `console_bridge_dlq_storm_detection_emission`, `audit_log_surfacing_cross_reference_consistency`, `settings_audit_log_retention_no_inline_restatement`.
