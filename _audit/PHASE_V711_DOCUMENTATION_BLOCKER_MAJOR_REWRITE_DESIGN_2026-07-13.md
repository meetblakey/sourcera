# v7.1.1 Documentation Blocker Major-Rewrite Design

**Date:** 2026-07-13  
**Scope:** Documentation only  
**Authority:** User-selected major rewrite of every blocking documentation finding  
**Runtime posture:** No application exists. No runtime row is promoted and no product evidence is inferred.

## 1. Decision

Replace the affected active contracts end-to-end. Do not retain a correct new rule beside stale stubs, deferred notes, contradictory state-machine language, or misleading implementation ownership.

The rewrite preserves stamped history and immutable prior-pass evidence. It replaces only active authority in the current Master Spec, execution strategy, integration ledgers, and live routing documents.

## 2. Required Outcome

After the rewrite:

1. A product team can implement Requirement reopening without inventing an event, permission, state transition, payload, error, retry rule, or lock-clearing rule.
2. A product team can implement disqualification reversal before and after scoring without changing immutable scores or guessing whether the vendor returns to the current evaluation.
3. A product team can implement `audit_events.export.ready` without copying an unrelated billing payload or inventing security and delivery behavior.
4. Active sections contain no false claim that an already-authored entity, webhook, endpoint, catalog, or workflow is still a stub or future work.
5. Customer-facing residency-change copy is final and localization-ready.
6. Every pending runtime row has a named future product artifact or a precise external-evidence contract.
7. §M.5 release-evidence lanes cannot be mistaken for feature implementation packs.
8. The live documentation gates pass while all unimplemented product/runtime rows remain pending.

## 3. Rewrite Architecture

The work is divided into four authority clusters. Each cluster is rewritten as one unit so body contracts, APIs, appendices, and execution routing cannot drift.

| Cluster | Canonical result | Documents |
|---|---|---|
| Requirement release and reopening | One lifecycle from Buyer Requirement lock through Seller Bid Response unlock | Master Spec §§4.3.4, 4.4.2, 4.7.1, 10.6, 25.5, 32.10.9; Appendices A, C, G, I, J, L, M |
| Disqualification and reversal | One phase-aware reversal contract with immutable post-scoring behavior | Master Spec §§4.7.2, 10.12, 13, 17, 25.3; Appendices C, E, G, I, J, L, M |
| Audit-event export | One asynchronous export and completion-event contract | Master Spec §§31, 32.8.24, 41, 42; Appendices C, G, I, J, M |
| Release documentation | One distinction between implementation packs, release-evidence lanes, and absent runtime proof | Master Spec §M.5, Build Execution Strategy, live routing and verification documents |

## 4. Requirement Release and Reopening Rewrite

### 4.1 Canonical Rule

`requirement_unlocked` becomes a registered Console Bridge event, not an out-of-scope note.

It is available only when all conditions are true:

- the Workspace is in Phase 9;
- the Requirement is `finalized` because submissions closed;
- no Score exists for that Requirement;
- Phase 10 scoring has not started;
- the Workspace, Bid Workspace, and Requirement are not cancelled, archived, withdrawn, disqualified, deleted, or under an Ops freeze;
- the caller is `workspace_owner` or `workspace_admin` and has completed step-up authentication;
- the request carries the current Requirement version and an idempotency key.

Phase 10 or later never reopens. The only correction path after scoring starts is Workspace cancellation and a new evaluation. This preserves the existing terminal Score rule.

### 4.2 API

Add the canonical endpoint:

`POST /v1/workspaces/{workspace_id}/requirements/{requirement_id}/unlock`

Request:

```json
{
  "expected_requirement_version": 7,
  "unlock_reason_public": "The buyer reopened submissions to allow an updated response.",
  "rationale_internal": "Submission closure was applied before the final clarification was delivered."
}
```

The transaction compare-and-sets Requirement status `finalized -> active`, increments the Requirement version once, writes one AuditEvent, and enqueues one `requirement_unlocked` event per active target Bid Workspace. Same-key replay returns the original response. Same-key/different-body returns `idempotency_key_request_mismatch`.

### 4.3 Seller Materialization

The materializer applies `requirement_unlocked` only to Bid Responses whose `response_lock_reason=phase_9_submissions_closed`.

- It clears `response_lock`, `response_lock_reason`, and `lock_reason_public`.
- It preserves answers, attachments, snapshots, submission history, and editor-lock history.
- It moves `acknowledged` or `submitted` to `draft` only after the seller chooses to revise; the unlock event itself does not rewrite status.
- It never clears `disqualification_cascade`, `vendor_voluntary_withdrawal_cascade`, `workspace_cancelled`, or `ops_emergency_freeze` locks.
- A row with an independent lock remains locked and records `lock_preserved_reason`; that is a successful guarded application, not a partial write.

### 4.4 Catalog Additions

- Appendix J `console_bridge_event_kind`: add `requirement_unlocked`.
- Appendix C: add seller notification `seller.bid_response.requirement_unlocked`.
- Appendix G: add `seller_bid_response_unlocked` and `requirement_unlocked` with bounded, non-PII properties.
- Appendix I: add `requirement_unlock_phase_forbidden`, `requirement_unlock_scoring_started`, `requirement_unlock_independent_lock_preserved`, and `requirement_unlock_version_conflict`.
- Appendix A: replace the loose post-Phase-9 `finalized -> active` row with the exact Phase-9-only rule.
- Appendix L.15: state that unlock changes the hard-write guard but does not itself mutate `BidResponse.status`.

### 4.5 Failure Handling

Concurrent Phase-10 advancement and unlock serialize on the Workspace phase/version. Exactly one commits. A stale unlock commits nothing. Bridge retries are version-idempotent. A seller notification failure does not roll back the Buyer source transition; it follows the notification retry and DLQ contract.

## 5. Disqualification and Reversal Rewrite

### 5.1 New Persisted Decision

Add `reversal_effect_scope` to VendorDisqualificationRecord and register Appendix J enum `vendor_disqualification_reversal_effect_scope`:

- `current_evaluation_restored`
- `future_eligibility_only`
- `platform_surfaces_restored`

The value is computed and frozen when reversal begins. It is never caller-selected.

### 5.2 Phase Matrix

| State at reversal | Effect |
|---|---|
| Before Phase 10 and no Score exists | Restore recorded Target Account and Bid Workspace states; clear only disqualification-originated locks; restore current-evaluation participation. |
| Phase 10 or 11 while scoring remains open | Restore current participation only through an explicit scoring-owner reconciliation that creates missing unlocked Score shells; never alter submitted grades. The reversal remains `in_progress` until reconciliation completes. |
| Phase 12 or later, or a Selection Report exists | Set `future_eligibility_only`. Current Target Account, Bid Workspace, response locks, scores, shortlist, recommendation, and Selection Report remain immutable evaluation-history snapshots. Add a post-selection annotation and restore eligibility only for future evaluations. |
| Global-ban reversal without a specific current evaluation | Set `platform_surfaces_restored`; restore only independently eligible platform surfaces from recorded pre-ban state. Each affected evaluation applies its own phase rule above. |

This removes the contradictory instruction to return a vendor to the current shortlist after scoring while refusing scoring re-entry.

### 5.3 Customer and Audit Behavior

For `future_eligibility_only`, Buyer and Seller surfaces state: “The disqualification was reversed after scoring closed. This evaluation remains unchanged; the seller is eligible for future evaluations.” A retained evaluation-local `TargetAccount.status=disqualified` or `BidWorkspace.status=disqualified` is presented as historical evaluation outcome, not as an active organization or platform ban. Current-eligibility checks use the reversed VendorDisqualificationRecord and never infer an active ban from that historical evaluation snapshot.

The immutable Selection Report receives a linked post-selection annotation, not a body rewrite. Exports and verification endpoints expose the annotation and the reversal timestamp. Webhook payloads include `reversal_effect_scope` but never internal rationale, other-vendor data, scores, or shortlist position.

### 5.4 Concurrency

Reversal serializes against new bans, evaluation phase advancement, score submission, Selection Report finalization, opt-out, moderation, deletion, and legal hold. When Phase 12 wins the race, the reversal deterministically becomes `future_eligibility_only`. Re-drive re-evaluates independent gates but never changes the frozen current-evaluation scope after the first committed decision.

## 6. Audit-Event Export Rewrite

### 6.1 Canonical Completion Event

`audit_events.export.ready` becomes a complete Appendix C webhook and Appendix G analytics event.

Webhook payload:

```json
{
  "event_id": "evt_...",
  "event_type": "audit_events.export.ready",
  "occurred_at": "2026-07-13T18:00:00Z",
  "org_id": "org_...",
  "export_id": "audit_export_...",
  "format": "ndjson",
  "row_count": 487123,
  "content_sha256": "<64-char hex>",
  "ready_at": "2026-07-13T18:00:00Z",
  "expires_at": "2026-07-16T18:00:00Z",
  "poll_path": "/v1/orgs/org_.../audit-events/export/audit_export_..."
}
```

The webhook never contains a presigned URL, AuditEvent body, actor identity, namespace list, DSAR detail, or storage location. The authenticated poll endpoint creates the short-lived, single-IP-bound download URL.

### 6.2 Delivery Contract

- HMAC-SHA256 signing per §31.
- Idempotency by `event_id`; exactly one ready event per export state transition.
- Appendix F.1 `standard` retry curve.
- DLQ after five hard failures.
- Payload maximum 256 KB.
- Org-scoped subscription and non-leak enforcement.
- Future replay recomputes only delivery metadata; it never regenerates export contents.
- Expired exports do not re-emit `ready`; a new export request creates a new `export_id`.

### 6.3 Analytics

Appendix G mirrors only `org_id`, `export_id`, `format`, `row_count_bucket`, `generation_duration_bucket`, `residency_region`, and `delivery_outcome`. Raw row counts remain in the webhook/audit record but dashboards use the bounded bucket.

## 7. Release-Evidence Model Rewrite

### 7.1 Separate Concepts

The documentation will define three distinct concepts:

1. **Implementation pack:** feature delivery sequence in Build Execution Strategy.
2. **Release-evidence lane:** frozen §M.5 status token used to group missing proof.
3. **Artifact evidence:** exact future application file, test, workflow, deployment receipt, or external-provider receipt needed for promotion.

The four existing suffixes remain stable for tooling compatibility but cease to claim feature ownership:

| Status suffix | Release-evidence lane |
|---|---|
| `m02_3` | Source, schema, static-analysis, and deploy-contract evidence |
| `m11_3` | Core application mutation, API, integration, security, and workflow evidence |
| `m21_3` | UI, mobile, accessibility, Marketplace, analytics, and synthetic evidence |
| `m24_3` | Billing, settlement, financial integrity, and revenue-protection evidence |

Build Execution Strategy retains the original M02.3, M11.3, M21.3, and M24.3 implementation-pack definitions. It explicitly states that the identically shaped §M.5 suffixes are legacy release tokens, not implementation ownership.

### 7.2 Previously Unnamed Evidence

Name the future application artifacts without creating them:

- `convex/deploy_validators/dsar_cascade_residency_partition_isolation.ts`
- `tests/security/dsar_cascade_residency_partition_isolation.spec.ts`
- `convex/deploy_validators/workos_raw_attributes_not_consumed.ts`
- `tests/security/workos_raw_attributes_not_consumed.spec.ts`
- `.github/workflows/deploy-validator.yml`

All remain missing until the application repository exists. Their §M.5 rows remain pending.

## 8. Active-Authority Rewrite

Remove or replace active prose that incorrectly says current behavior is a stub, deferred, missing, or pending. Historical statements remain only in the changelog, reconciliation log, or dated verification artifacts.

The rewrite covers at minimum:

- Target Account Phase-5 stub language.
- Selection Report Draft Phase-7 stub language.
- SelectionReport “not formally authored” claims.
- `vendor.disqualified.org_level` follow-up claims.
- Ops impersonation “Known Gap” claims now superseded by §50.4.
- billing endpoint follow-up claims superseded by §32.8.
- §34 error-catalog pending claims superseded by Appendix I.
- stale internationalization “not implemented” language superseded by §47.3.

Every replacement cites the current canonical section and states whether the current section is data-model, workflow, API, surface, or operational authority.

## 9. Production Copy

The following text becomes final English source copy:

- Blocked email subject: **“Action required: complete your Sourcera data residency change”**
- Completed email subject: **“Your Sourcera data residency change is complete”**
- Temporary Stripe failure: **“We couldn’t update your data residency because the billing service is temporarily unavailable. Try again in a few minutes. Your current residency and billing setup have not changed.”**

The current localization keys remain authoritative. “Placeholder,” “pending UX authoring,” and future-sign-off wording are removed from active source.

## 10. Authored-Extension Governance

The three new behavioral decisions are recorded as one approved documentation program with three child Authored Extensions:

- Requirement reopening lifecycle.
- Phase-aware disqualification reversal effect.
- Audit-event export-ready webhook.

Explicit user approval of this design file is the product-owner sign-off. The AE ledger records the decision, date, affected sections, and the rule that approval establishes documentation authority only. It does not establish runtime evidence.

## 11. Files to Change

- `Sourcera_Master_Spec.md`
- `Build_Execution_Strategy.md`
- `_integration/AUTHORED_EXTENSIONS_LEDGER.md`
- `_integration/RECONCILIATION.md`
- `_audit/V711_BACKLOG_INDEX.md`
- `_audit/REMEDIATION_BACKLOG.md`
- `_audit/V711_RUNTIME_STAMP_GATE_BLOCKER_INVENTORY.md` only through regeneration or a clearly marked generated-document terminology note
- `AGENTS.md` current-release correction after verification
- a dated `_audit/PHASE_V711_DOCUMENTATION_BLOCKER_MAJOR_REWRITE_VERIFY_2026-07-13.md`

Before destructive edits, every authoritative file receives a dated `_versions/` backup.

## 12. Verification

Completion requires all of the following:

1. No active occurrence of the removed gap/stub/placeholder claims remains outside dated history.
2. `requirement_unlocked` resolves through entity, bridge, materialization, API, error, enum, notification, analytics, state-machine, retention, DSAR, residency, mobile, and acceptance-criteria authority.
3. Disqualification reversal has exactly one phase-aware result for every pipeline phase and never permits Score mutation after Phase 12.
4. `audit_events.export.ready` resolves through §32, Appendix C, Appendix G, §31 delivery, and §41 failure handling.
5. The two unnamed evidence rows list exact future paths.
6. Implementation packs and release-evidence lanes are explicitly different in every live routing source.
7. Full TypeScript, repository tests, spec lint, exact-status scan, taxonomy audit, Appendix M checks, and stamp gate run.
8. The stamp gate may still fail only because application/runtime evidence is absent. No documentation blocker, malformed row, pending human decision, or unnamed evidence contract remains.

## 13. Non-Goals

- No application scaffolding or product code.
- No fabricated deployment, provider, workflow, or runtime receipt.
- No promotion of a pending §M.5 row solely because its documentation is complete.
- No rewrite of immutable historical snapshots.
- No change to pricing numbers or product scope unrelated to the blocking findings.
