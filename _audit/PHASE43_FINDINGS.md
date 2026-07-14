# Phase 43 — §43 Internal Operations & Admin Tooling Audit Scratch Log

**Scope.** Master Spec §43.1–§43.5 (`Sourcera_Master_Spec.md` lines 32617–32711).
**Convention checks.** Audit-prompt checks 1–14 plus the four task-specific checks (RBAC to Ops roles, audit-event emission, justification + 2-person rule for customer-impacting actions, internal-tooling-has-its-own-UI).
**Adjacent sources read end-to-end.** §50 (Sourcera Ops Console; lines 38655–41370), Appendix M.1 §43-block (lines 49373–49375), Appendix J §50 additions (line 47107–47180), Appendix I §50 additions (line 44610), §4.6.1 Audit Event (referenced), §40.2 retention (referenced), §6.8 DSAR (referenced), §44.1 performance budgets (lines 32719–32741), §27.10 marketplace-domain firewall (referenced), §29.11 §43.4.2 cross-reference (line 49644).

## Defect summary (promoted to `DEFECT_LEDGER.md`)

| Defect ID | Severity | Class | Anchor | One-liner |
|---|---|---|---|---|
| D-43-001 | P0 | rbac | §43.2 | `is_staff: true` boolean gate is structurally incompatible with the §50.3 six-role canonical Ops Role Matrix; junior engineer building from §43 alone bypasses the §50.3.2 capability envelope. |
| D-43-002 | P0 | rbac | §43.1 | ~14 customer-data-affecting Ops capabilities listed in §43.1 (Reset workspace, Archive/delete workspace, Reset password, Suspend/deactivate user, Trigger SCIM deprovisioning, Pause/unpause subscriptions, Apply discount, Adjust plan, Trial management, Refund management, Bulk workspace JSON export, Hide listing, Ban seller, Approve/reject listing) are absent from Appendix J `ops_capability_kind` (§50.3.2 envelope matrix), trips the `ops_capability_matrix_coverage_complete` CI gate. |
| D-43-003 | P0 | firewall_leakage | §43.3 | "Customer Impersonation: 'Assume user session' button (Enterprise support only)" lacks every §50.4 OpsSession safety: justification, time-box, step-up re-auth, quorum, customer-Org-Owner notification, customer revocation surface, OpsSession row. |
| D-43-004 | P0 | data_model | §43.4 | §43.4 defines a parallel `admin_audit_log` table that bifurcates the §4.6.1 Audit Event + §50.5 Ops-Tagged Audit Actor pattern; lacks `actor_type`, `ops_session_id`, `ops_role_at_write`, `ops_justification_ref`, `ops_impersonated_user_id`. |
| D-43-005 | P0 | dsar | §43.1 | "GDPR data export initiation (DSAR response generation)" omits §6.8.1 Right of Access, §6.8.6 Operational SLA, §6.8.6.1 Subject Verification Protocol — unverified DSAR fulfillment violates GDPR Article 12. |
| D-43-006 | P0 | firewall_leakage | §43.3 | "Workspace Export: One-click export for troubleshooting. Downloads complete JSON snapshot." bypasses §50.2.3 mutation path (no `actor_type='ops'` attribution, no OpsSession binding, no residency routing, no DSAR cascade check, no PII redaction). |
| D-43-007 | P1 | data_model | §43.2 | `is_staff` field referenced on the User record is not registered in §4.2 User entity field table — ghost field, cannot be implemented as written. |
| D-43-008 | P1 | acceptance_criteria | §43.5 | All six ACs (lines 32706–32711) are non-testable, internally contradictory, and miss every §50 cross-cutting contract; AC #4 directly contradicts §50.2.3 (Ops mutations DO affect customer data). |
| D-43-009 | P1 | retention | §43.4 | "Admin audit logs retained forever and not subject to plan tier retention limits" is inline retention statement that contradicts §40.2 / §6.8.5 audit-integrity-exemption canonical retention contracts. |
| D-43-010 | P1 | error_code | §43 | Zero Appendix I error codes registered for §43-enumerated capabilities; failed-justification, failed-quorum, expired-time-box, capability-outside-envelope, residency-mismatch, refund-already-issued have no Appendix I rows tied to §43. |
| D-43-011 | P1 | api | §43 | Zero §32-conformant API contracts; §43.1's ~25 admin actions surfaced as feature-list prose with no method/path/auth-scope/rate-limit-class/cursor-pagination/request-schema/response-schema. |
| D-43-012 | P1 | webhook | §43 | Zero §31-conformant webhooks fired for customer-data-affecting Ops actions (Refund, Pause subscription, Suspend user, Adjust plan, Ban seller). Customers receive no §31 / Appendix C webhook on Ops-initiated state changes. |
| D-43-013 | P1 | state_machine | §43.1 | Eight state-transitions introduced (Workspace Reset, Workspace Archive/Delete, User Suspend/Deactivate, Seller Ban Permanent, Listing Hide-pending-review, Listing Approve/Reject, Subscription Pause/Unpause, Trial Create/Extend/Convert) without any `From | To | Trigger | Conditions | Notes` state-machine tables. |
| D-43-014 | P1 | surface_engine_mapping | §43 | Appendix M.1 carries only two consolidated rows for §43 (line 49374 Admin Dashboard, line 49375 Support Tools); the seven distinct sub-surfaces in §43.1 + six in §43.3 + Workspace Export + Customer Impersonation lack per-surface M.1 rows. |
| D-43-015 | P1 | firewall_leakage | §43.1 | "Marketplace Moderation" sub-surface does not declare marketplace-domain firewall enforcement (§27.10, §1.3); an Ops moderator could approve a `us-defense-contractor` listing into `us-civilian-enterprise` if the surface is not domain-partitioned. |
| D-43-016 | P1 | residency | §43 | §43 silent on data-residency partitioning; §43.1 "Bulk export" and §43.3 "Workspace Export" could cross US/EU partitions without §40.3 residency-routing enforcement. |
| D-43-017 | P1 | posthog_event | §43 | §43-specific admin actions (Reset workspace, Apply discount, Adjust plan, Refund, Ban seller, Hide listing, Bulk export) have no Appendix G PostHog event registration; §50 registers session lifecycle events but not these capability-level ones. |
| D-43-018 | P1 | documentation_gap | §43 head | §43 lacks an in-place retirement / deprecation banner despite the §50 preamble (line 38665) declaring "§50 prevails" — a linear reader hitting §43 before §50 cannot tell the section is superseded. |
| D-43-019 | P2 | mobile_divergence | §43 | §43 silent on mobile vs desktop divergence; §50.2.2 #6 mandates device-trust posture but §43 implies a generic web "Admin Dashboard" with no platform constraint. |
| D-43-020 | P3 | consistency_drift | §29.11 line 49644 | "Slack integration per §43.4.2" — §43.4 has no `§43.4.2` sub-section (broken anchor). |
| D-43-021 | P3 | consistency_drift | §43 (line 32617) | Anchor slug `{#43.-internal-operations-and-admin-tooling}` contains both an escaped dot and a literal `&` — non-portable; conflicts with the `{#43-internal-operations-and-admin-tooling}` convention used elsewhere. |

## Counterfactual pass (per audit-prompt mandate)

### Failure mode 1 — Ops user account compromised
§43 silent on: hardware-key MFA (§50.2.2 #2), step-up re-auth (§50.2.2 #3), session time-box (§50.4.2), capability envelope (§50.3.2), customer notification (§50.4.5), customer revocation (§50.4.7). All six are §50-covered but §43 prose makes none of these visible to a linear reader. **Captured by D-43-001 / D-43-003 / D-43-018.**

### Failure mode 2 — Mass-impact Ops error (e.g., Bulk export pulls cross-residency data, Manually adjust plan applied to wrong Org, Reset workspace executed against the wrong workspace ID)
§43 silent on: 2-person rule, justification, quorum at duration / scope thresholds, residency partition lock, dry-run guarantee for batch operations (§43.5 AC #4 mentions "dry-run option" but only "available", not required). **Captured by D-43-002 / D-43-008 / D-43-013 / D-43-016.**

### Failure mode 3 — DSAR adversarial submission (third party submits DSAR on behalf of customer to extract data)
§43.1 "GDPR data export initiation" silent on subject verification (§6.8.6.1), operational SLA (§6.8.6), manifestly-unfounded request handling (§6.8.6.2). GDPR Article 12(6) requires the controller to verify the data-subject's identity before fulfilling. **Captured by D-43-005.**

### Failure mode 4 — Customer-API parity contradiction (Ops Console builds Ops-only `/api/v1/ops/orgs/{id}/workspaces/{id}/reset` endpoint instead of using customer-side endpoint)
§50.2.3 #4 forbids Ops-only duplicates of customer endpoints. §43.1 silent on the contract. Junior engineer reading §43.1 alone would author Ops-only mutation endpoints. **Captured by D-43-011.**

### Failure mode 5 — Audit-log integrity breach (admin actions land in `admin_audit_log` but customer-side Billing Admin Audit View — §5.2.1.4 — reads only §4.6.1 Audit Event)
§43.4 creates a separate audit table; customer-side Org Owners would NOT see Ops actions in their own Billing Admin Audit View if implementation followed §43.4. **Captured by D-43-004.**

### Failure mode 6 — Concurrent Ops force-close + customer revoke + time-box expiry
§43 makes no acknowledgement of OpsSession state-machine conflicts. **Captured by §50.7 (§50 already addresses) but D-43-018 notes the §43 reader has no pointer.**

### Failure mode 7 — Workspace Export downloads cross-marketplace-domain or cross-residency data into a single JSON
§43.3 "Workspace Export: complete JSON snapshot" with no residency filter, no marketplace-domain filter, no PII-redaction layer. **Captured by D-43-006 / D-43-015 / D-43-016.**

## Self-challenge pass (Opus-mandatory)

### Evidence reproducibility
- D-43-001: confirmed at §43.2 lines 32676–32680 vs Appendix J `ops_role_kind` enum (line 47111 — six canonical roles + variants).
- D-43-002: confirmed by `ops_capability_kind` enum (line 47159–47162) walk; the §43.1 capabilities Reset workspace / Archive workspace / Suspend user / Trigger SCIM / Apply discount / Adjust plan / Trial management / Manage payment methods / Manage refund are not in the 40-value envelope. Only `ai_operation_reversal`, `rate_card_mutation`, `committed_spend_contract_mutation`, `marketplace_listing_mutation`, `plan_downgrade_for_abuse` are partial matches; the rest are absent.
- D-43-003: confirmed by §43.3 (line 32685) vs §50.4 (lines 38901–39048).
- D-43-004: confirmed by §43.4 (lines 32691–32702) vs §4.6.1 schema extension at §50.5.1 (line 39055–39073).
- D-43-005: confirmed by §43.1 line 32627 vs §6.8.1 / §6.8.6 / §6.8.6.1.
- D-43-006: confirmed by §43.3 line 32686 vs §50.2.3 mutation-path contract.
- D-43-007: confirmed by `is_staff` grep; only three hits in spec — §43.2 lines 32676, 32680, and §50 preamble line 38665 (which references §43.2). No §4.2 User-table row.
- D-43-008: confirmed by line-by-line walk of §43.5 ACs vs §44.1 (TTI / search latency singletons), §50.4 (impersonation), §50.2.3 (Ops mutations are customer-API calls).
- D-43-009: confirmed at §43.4 line 32702.
- D-43-010 – D-43-013: confirmed by absence; grep against §43.x for "Appendix I", "§32", "§31", "From | To | Trigger" returns nothing inside §43.
- D-43-014: confirmed by Appendix M.1 lines 49373–49375 walk.
- D-43-015: confirmed at §43.1 line 32658–32664 vs §27.10 marketplace-domain firewall provisions.
- D-43-016: confirmed by §43 walk; no `residency` term inside §43.
- D-43-017: confirmed by Appendix G walk for §43-named events; only Ops-session events present.
- D-43-018: confirmed at §50 preamble line 38665 vs §43 head (no banner).
- D-43-019: confirmed by §43 walk; no `mobile` or `desktop` term inside §43.
- D-43-020: confirmed at line 49644.
- D-43-021: confirmed at line 32617.

### Severity rule application
P0 defects each map to an explicit Severity rule:
- D-43-001, -002: rule (b) PII / scope exposure + rule (e) CI-gate enforcement failure.
- D-43-003, -006: rule (a) console-firewall break + rule (b) PII exposure.
- D-43-004: rule (c) audit-log integrity.
- D-43-005: rule (c) GDPR Article 12 verification.

P1 defects each map to "unbuildable as written" rule (missing AC / state machine / API / webhook / error code / surface row / residency / posthog / retention) or "conflicting numerical singleton."

P2 / P3 defects are ambiguity / cosmetic only.

### Recommendation sharpness
Each defect carries a concrete recommendation that names the §50 / §40.2 / §6.8 / Appendix J / Appendix M target. D-43-018 (retirement banner) is the lightest single-edit remediation and is a recommended near-term fix.

### Coupling
- D-43-001, D-43-002, D-43-007, D-43-018 are coupled: a single "Retire §43 to summary, route all admin behavior to §50" edit closes all four.
- D-43-003 + D-43-006 are coupled: customer impersonation + workspace export are both §50.4 / §50.2.3 contract enforcement.
- D-43-004 + D-43-009 are coupled: `admin_audit_log` table retirement to §4.6.1 closes both.
- D-43-010 / -011 / -012 / -013 are individually-addressed-by-§50-already but require either retirement banner at §43 or explicit pointer at §43.1 / §43.4 / §43.5 head.

## Coverage Matrix updates

`COVERAGE_MATRIX.md` rows updated:

- **F-608 Admin Dashboard (§43.1)**: `rbac` ⚠ → ❌; `acceptance_criteria` ⚠ → ❌; `api` ⚠ → ❌; `webhook` ⚠ → ❌; `notifications` n/a → ❌; `posthog_events` ⚠ → ❌; `error_codes` ⚠ → ❌; `state_machine` ⚠ → ❌; `dsar` ⚠ → ❌; `residency` ⚠ → ❌; `surface_engine_mapping` ⚠ → ⚠ partial.
- **F-609 Admin Dashboard Access Control (§43.2)**: `data_model` ⚠ → ❌ (ghost `is_staff` field); `rbac` ⚠ → ❌; `enums` ⚠ → ❌ (six-role matrix not registered to §43); `acceptance_criteria` ⚠ → ❌; `api` n/a → ❌; `state_machine` ⚠ → ❌.
- **F-610 Support Tools (§43.3)**: `rbac` ⚠ → ❌; `state_machine` n/a → ❌; `api` n/a → ❌; `webhook` n/a → ❌; `error_codes` ⚠ → ❌; `dsar` n/a → ❌; `residency` ⚠ → ❌; `console_firewall` ⚠ → ❌ (marketplace-domain firewall not declared).
- **F-611 Admin Audit Log (§43.4)**: `data_model` ⚠ → ❌ (parallel table); `enums` ⚠ → ❌; `retention` ⚠ → ❌ ("forever" contradicts §40.2); `dsar` ⚠ → ❌; `residency` ⚠ → ❌; `surface_engine_mapping` ⚠ → ❌; `acceptance_criteria` ⚠ → ❌.

## Promotion status

All 21 defects promoted to `DEFECT_LEDGER.md` in a single append below the prior tail (last existing ID `D-11.1-009 → remediated`). New IDs `D-43-001` through `D-43-021`. `status = open` on all.
