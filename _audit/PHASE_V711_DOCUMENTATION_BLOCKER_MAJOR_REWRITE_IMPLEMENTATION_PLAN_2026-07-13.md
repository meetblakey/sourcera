# v7.1.1 Documentation Blocker Major Rewrite Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace every active documentation blocker with one production-grade, internally consistent contract while preserving honest pending runtime status because no application exists.

**Architecture:** Rewrite four connected authority clusters: Requirement reopening, phase-aware disqualification reversal, audit-event export completion, and release-evidence ownership. Each cluster updates the Master Spec body and every dependent appendix before routing ledgers are synchronized. Stamped history is preserved in dated backups and no runtime status is promoted.

**Tech Stack:** Markdown canonical specifications, TypeScript spec-lint and release scanners under `tools/`, Appendix M runtime-status catalog, exact-status defect ledger, generated runtime blocker inventory.

## Global Constraints

- Documentation only. Do not create application code, tests, workflows, deployment receipts, or provider evidence.
- `Sourcera_Master_Spec.md` remains the product-behavior authority.
- Pricing numbers remain unchanged.
- Historical `_versions/` snapshots are read-only.
- Back up every authoritative file before its first destructive edit.
- New behavior must include state, auth, concurrency, retries, notifications, privacy, residency, mobile behavior, and testable acceptance criteria.
- Every new enum is registered in Appendix J; every new error in Appendix I; every notification in Appendix C; every analytics event in Appendix G.
- The user-approved design is `_audit/PHASE_V711_DOCUMENTATION_BLOCKER_MAJOR_REWRITE_DESIGN_2026-07-13.md`.
- Pending §M.5 rows stay pending. Documentation completeness never establishes runtime evidence.
- This folder is not Git-backed. Do not fabricate commits; use dated backups and verification artifacts as checkpoints.

---

## File Map

| File | Responsibility in this rewrite |
|---|---|
| `Sourcera_Master_Spec.md` | Canonical behavior, APIs, catalogs, state machines, copy, §M.5 evidence contracts |
| `Build_Execution_Strategy.md` | Separate implementation packs from release-evidence lanes |
| `_integration/AUTHORED_EXTENSIONS_LEDGER.md` | Record the three approved product-owner decisions without claiming runtime proof |
| `_integration/RECONCILIATION.md` | Append the conflict resolutions and source-authority decisions |
| `_audit/V711_BACKLOG_INDEX.md` | Current routing and documentation-complete/runtime-pending posture |
| `_audit/REMEDIATION_BACKLOG.md` | Remove stale blocker routing and retain runtime implementation work |
| `_audit/V711_RUNTIME_STAMP_GATE_BLOCKER_INVENTORY.md` | Regenerated evidence inventory; terminology interpreted through the new lane contract |
| `_audit/V711_RUNTIME_STAMP_GATE_BLOCKER_INVENTORY.csv` | Regenerated row-level evidence inventory |
| `AGENTS.md` | Final current-release correction and routing summary |
| `_audit/PHASE_V711_DOCUMENTATION_BLOCKER_MAJOR_REWRITE_VERIFY_2026-07-13.md` | Reproducible completion evidence |

---

### Task 1: Baseline and Protected Backups

**Files:**
- Read: `Sourcera_Master_Spec.md`
- Read: `Build_Execution_Strategy.md`
- Read: `_integration/AUTHORED_EXTENSIONS_LEDGER.md`
- Read: `_integration/RECONCILIATION.md`
- Read: `_audit/V711_BACKLOG_INDEX.md`
- Read: `_audit/REMEDIATION_BACKLOG.md`
- Read: `AGENTS.md`
- Create: `_versions/Sourcera_Master_Spec.v7.1.0a-pre-v711-documentation-blocker-major-rewrite-2026-07-13.md`
- Create: `_versions/Build_Execution_Strategy.pre-v711-documentation-blocker-major-rewrite-2026-07-13.md`
- Create: `_versions/AUTHORED_EXTENSIONS_LEDGER.pre-v711-documentation-blocker-major-rewrite-2026-07-13.md`
- Create: `_versions/RECONCILIATION.pre-v711-documentation-blocker-major-rewrite-2026-07-13.md`
- Create: `_versions/V711_BACKLOG_INDEX.pre-v711-documentation-blocker-major-rewrite-2026-07-13.md`
- Create: `_versions/REMEDIATION_BACKLOG.pre-v711-documentation-blocker-major-rewrite-2026-07-13.md`
- Create: `_versions/AGENTS.pre-v711-documentation-blocker-major-rewrite-2026-07-13.md`

**Interfaces:**
- Consumes: Approved major-rewrite design and current live corpus.
- Produces: Immutable rollback points plus a verified pre-edit release baseline.

- [ ] **Step 1: Confirm the active baseline**

Run:

```sh
tools/spec-lint/node_modules/.bin/tsx --test $(rg --files tools -g '*.test.ts')
npm --prefix tools/spec-lint run typecheck
npm --prefix tools/spec-lint run all -- --no-emit --ae-ledger ../../_integration/AUTHORED_EXTENSIONS_LEDGER.md
tools/spec-lint/node_modules/.bin/tsx tools/release/exact_status_scan.ts --ledger _audit/DEFECT_LEDGER.md --json
tools/spec-lint/node_modules/.bin/tsx tools/release/ledger_taxonomy_audit.ts
tools/spec-lint/node_modules/.bin/tsx tools/release/stamp_gate.ts --spec Sourcera_Master_Spec.md --ae-ledger _integration/AUTHORED_EXTENSIONS_LEDGER.md --defect-ledger _audit/DEFECT_LEDGER.md --json
```

Expected: repository tests, TypeScript, full spec lint, exact-status scan, and taxonomy audit pass; stamp gate fails only on pending product/runtime evidence.

- [ ] **Step 2: Create dated backups**

Run one `cp -p` per source file to the exact `_versions/` paths listed above. Verify byte identity with:

```sh
cmp Sourcera_Master_Spec.md _versions/Sourcera_Master_Spec.v7.1.0a-pre-v711-documentation-blocker-major-rewrite-2026-07-13.md
cmp Build_Execution_Strategy.md _versions/Build_Execution_Strategy.pre-v711-documentation-blocker-major-rewrite-2026-07-13.md
cmp _integration/AUTHORED_EXTENSIONS_LEDGER.md _versions/AUTHORED_EXTENSIONS_LEDGER.pre-v711-documentation-blocker-major-rewrite-2026-07-13.md
cmp _integration/RECONCILIATION.md _versions/RECONCILIATION.pre-v711-documentation-blocker-major-rewrite-2026-07-13.md
cmp _audit/V711_BACKLOG_INDEX.md _versions/V711_BACKLOG_INDEX.pre-v711-documentation-blocker-major-rewrite-2026-07-13.md
cmp _audit/REMEDIATION_BACKLOG.md _versions/REMEDIATION_BACKLOG.pre-v711-documentation-blocker-major-rewrite-2026-07-13.md
cmp AGENTS.md _versions/AGENTS.pre-v711-documentation-blocker-major-rewrite-2026-07-13.md
```

Expected: every `cmp` exits 0 with no output.

- [ ] **Step 3: Capture current blocking terms**

Run:

```sh
rg -n "requirement_unlocked|Reversal after Scoring phase|audit_events\.export\.ready|Full behavioral authoring|Full feature specification is deferred|has not been formally authored|authored in a follow-up|catalog extension still pending|UX Lead authoring pending|placeholder copy|NOT IMPLEMENTED" Sourcera_Master_Spec.md
```

Expected: every active hit is accounted for by Tasks 2–5; changelog hits remain historical.

---

### Task 2: Rewrite Requirement Reopening End-to-End

**Files:**
- Modify: `Sourcera_Master_Spec.md` at §§4.3.4, 4.4.2, 4.7.1, 10.6, 25.5, 32.10.9; Appendices A, C, G, I, J, L.15, M.1, M.5
- Modify: `_integration/AUTHORED_EXTENSIONS_LEDGER.md`

**Interfaces:**
- Consumes: Existing Requirement `draft|active|finalized|archived` lifecycle, `response_lock_reason`, Console Bridge idempotency, terminal Score lock.
- Produces: `requirement_unlocked` event; `POST /v1/workspaces/{workspace_id}/requirements/{requirement_id}/unlock`; registered errors, notification, analytics, and state transitions.

- [ ] **Step 1: Replace Requirement entity lock prose**

In §4.3.4, add a canonical Phase-9 reopening block. It must state all seven predicates from design §4.1, require expected version plus step-up authentication, and prohibit reopening at Phase 10 or later. Replace “unlocked Requirement” shorthand in §4.3.4.1 with a direct predicate reference to this block.

- [ ] **Step 2: Replace Bid Response Known Gap**

In §4.4.2, delete the out-of-scope `requirement_unlocked` sentence. Define that the event clears only `response_lock_reason=phase_9_submissions_closed`; all independent lock reasons remain. Preserve answer, attachment, snapshot, submission, and editor-lock history.

- [ ] **Step 3: Rewrite Console Bridge authority**

Add `requirement_unlocked` to §4.7.1 event-kind field, carried/never-carried matrix, retention class, seller projection, and completeness acceptance criteria. Carried fields are exactly `requirement_id`, `source_entity_version`, `unlocked_at`, and `unlock_reason_public`. Never carry `rationale_internal`, Buyer identity, Score existence, other-vendor counts, or buyer-private workflow state.

- [ ] **Step 4: Rewrite §25.5 target-state table**

Add a `requirement_unlocked` row. First application clears only the Phase-9 lock and records `last_applied_source_version`; retries at the same or lower version are no-ops. An independent lock records `lock_preserved_reason` and does not fail or clear the row.

- [ ] **Step 5: Add the full API contract**

Author §32.10.9.A.2 with:

- endpoint, auth scope, RBAC, step-up, rate-limit class;
- request fields `expected_requirement_version`, `unlock_reason_public`, `rationale_internal`;
- HTTP 200 response with Requirement version and per-target materialization counts;
- idempotency semantics;
- non-leak 404 behavior;
- HTTP 403/409/422 errors;
- phase-advance race and retry behavior;
- mobile retry behavior and localized errors.

- [ ] **Step 6: Register catalogs**

Register:

- Appendix J `console_bridge_event_kind.requirement_unlocked`;
- Appendix C `seller.bid_response.requirement_unlocked`;
- Appendix G `requirement_unlocked` and `seller_bid_response_unlocked`;
- Appendix I `requirement_unlock_phase_forbidden`, `requirement_unlock_scoring_started`, `requirement_unlock_independent_lock_preserved`, `requirement_unlock_version_conflict`;
- Appendix A exact Phase-9-only `finalized -> active` transition;
- Appendix L.15 lock change without automatic status mutation;
- Appendix M surface/engine mappings and one pending runtime-evidence row naming future API, materializer, integration, mobile, and non-leak tests.

- [ ] **Step 7: Add approved AE ledger row**

Add `AE-V711-DOCBLOCK-REQ-UNLOCK-01` with status `approved 2026-07-13`, product-owner approval source, affected sections, and explicit “documentation authority only; runtime evidence pending” note.

- [ ] **Step 8: Run focused consistency scans**

Run:

```sh
rg -n "requirement_unlocked" Sourcera_Master_Spec.md
rg -n "out of scope for v7\.0\.0|documented as a Known Gap" Sourcera_Master_Spec.md
npm --prefix tools/spec-lint run all -- --no-emit --ae-ledger ../../_integration/AUTHORED_EXTENSIONS_LEDGER.md
```

Expected: event resolves across every listed authority; the old Known Gap text is absent; spec lint passes or reports only a precisely identified cross-cluster issue scheduled in a later task.

---

### Task 3: Rewrite Disqualification Reversal End-to-End

**Files:**
- Modify: `Sourcera_Master_Spec.md` at §§4.7.2, 10.12, 13, 17, 25.3, 32 disqualification endpoints; Appendices C, E, G, I, J, L, M
- Modify: `_integration/AUTHORED_EXTENSIONS_LEDGER.md`

**Interfaces:**
- Consumes: immutable Score and Selection Report rules; recorded pre-ban state; existing inverse-cascade idempotency.
- Produces: persisted `reversal_effect_scope`; deterministic phase matrix; future-eligibility behavior; customer-safe annotations.

- [ ] **Step 1: Replace the VendorDisqualificationRecord reversal model**

Add required-on-reversal fields `reversal_effect_scope` and `phase_at_reversal`. Register the computed/frozen rule and the three enum values from design §5.1. Explain that caller input cannot select or override the scope.

- [ ] **Step 2: Replace the reversal prose and state machine**

Rewrite the current Reversal block and state-machine rows with the design §5.2 matrix. Explicitly define pre-Phase-10 restoration, Phase-10/11 scoring reconciliation, Phase-12+ future-only eligibility, and global platform-surface restoration.

- [ ] **Step 3: Close historical-state ambiguity**

State that a Phase-12+ evaluation-local Target Account or Bid Workspace may retain its `disqualified` terminal snapshot while the reversed record removes future prohibition. Every current-eligibility predicate must read the active/reversed VendorDisqualificationRecord, not infer an organization ban from that historical snapshot.

- [ ] **Step 4: Rewrite current-evaluation effects**

For Phase 10/11, define scoring-owner reconciliation as creation of missing unlocked Score shells only; never alter an existing grade. For Phase 12+, prohibit response unlock, shortlist re-entry, score changes, recommendation changes, or Selection Report body changes. Add the linked post-selection annotation contract.

- [ ] **Step 5: Update API and webhook payloads**

Add `reversal_effect_scope` and `phase_at_reversal` to reversal responses and `vendor.disqualification.reversed`. Define race behavior when phase advancement or report finalization wins. Preserve redaction and non-leak rules.

- [ ] **Step 6: Register catalogs and surfaces**

Update Appendix J enum, Appendix E status notes, Appendix C webhook schema, Appendix G bounded properties, Appendix I conflict/error behavior, Appendix L reversal table, and Appendix M Buyer/Seller/report-annotation surfaces.

- [ ] **Step 7: Replace the active Known Gap**

Delete “Reversal after Scoring phase has concluded” Known Gap language. Replace it with the phase-aware contract and acceptance criteria proving one result for every pipeline phase.

- [ ] **Step 8: Add approved AE ledger row**

Add `AE-V711-DOCBLOCK-DISQUALIFICATION-REVERSAL-01` with status `approved 2026-07-13` and documentation-only sign-off note.

- [ ] **Step 9: Run focused scans**

Run:

```sh
rg -n "reversal_effect_scope|future_eligibility_only|current_evaluation_restored|platform_surfaces_restored" Sourcera_Master_Spec.md
rg -n "Reversal after Scoring phase has concluded|reinstated to the shortlist but not to scoring" Sourcera_Master_Spec.md
npm --prefix tools/spec-lint run all -- --no-emit --ae-ledger ../../_integration/AUTHORED_EXTENSIONS_LEDGER.md
```

Expected: full cross-section coverage, zero stale-gap matches, and no Score-unlock path.

---

### Task 4: Rewrite Audit-Event Export Completion End-to-End

**Files:**
- Modify: `Sourcera_Master_Spec.md` at §§31, 32.8.24, 41, 42; Appendices C, G, I, J, M
- Modify: `_integration/AUTHORED_EXTENSIONS_LEDGER.md`

**Interfaces:**
- Consumes: async audit-export endpoint, authenticated poll path, §31 HMAC delivery, Appendix F.1 retry curve.
- Produces: complete `audit_events.export.ready` webhook and bounded analytics mirror.

- [ ] **Step 1: Replace the one-line future webhook**

Replace “payload mirrors `billing.ledger.export_completed`” with the exact design §6.1 payload. Prohibit presigned URLs, AuditEvent bodies, actor identity, namespace lists, DSAR detail, and storage location.

- [ ] **Step 2: Complete §32.8.24 lifecycle behavior**

Define exactly-one emission at `running -> ready`, export expiry without re-emission, new export id on regeneration, authenticated poll behavior, content hash semantics, and idempotent retries.

- [ ] **Step 3: Register Appendix C**

Add `audit_events.export.ready` with Org webhook recipients, HMAC-SHA256, `standard` retry, five-failure DLQ, 256-KB cap, permission filtering, and failure disposition.

- [ ] **Step 4: Register Appendix G**

Add the bounded property schema: `org_id`, `export_id`, `format`, `row_count_bucket`, `generation_duration_bucket`, `residency_region`, `delivery_outcome`. Do not mirror raw row count or content hash into PostHog.

- [ ] **Step 5: Complete operational handling**

Bind delivery failure to §41 NotificationFailureAudit and §42 alerting. State that webhook failure never invalidates a ready export and poll remains authoritative.

- [ ] **Step 6: Register enums, mappings, and evidence**

Update Appendix J event/catalog values, Appendix M surface/engine mapping, and a pending runtime-evidence row naming future export worker, outbox, webhook serializer, non-leak test, and delivery retry test.

- [ ] **Step 7: Add approved AE ledger row**

Add `AE-V711-DOCBLOCK-AUDIT-EXPORT-READY-01` with status `approved 2026-07-13` and documentation-only sign-off note.

- [ ] **Step 8: Run focused scans**

Run:

```sh
rg -n "audit_events\.export\.ready" Sourcera_Master_Spec.md
rg -n "to be authored Phase V8\.4 follow-up|Payload mirrors `billing\.ledger\.export_completed`" Sourcera_Master_Spec.md
npm --prefix tools/spec-lint run all -- --no-emit --ae-ledger ../../_integration/AUTHORED_EXTENSIONS_LEDGER.md
```

Expected: complete event coverage and zero future-work/mirrored-payload matches.

---

### Task 5: Rewrite Active Authority and Production Copy

**Files:**
- Modify: `Sourcera_Master_Spec.md` at Target Account, Selection Report Draft, SelectionReport public-link, disqualification webhook, Ops impersonation, billing APIs, §34 acceptance criteria, §26/§47 internationalization, Appendix C residency templates, Appendix I residency error copy

**Interfaces:**
- Consumes: current canonical entities, endpoint sections, webhook definitions, §50.4, Appendix I, §47.3.
- Produces: active prose with no false future/stub/placeholder authority.

- [ ] **Step 1: Rewrite Target Account and Selection Report Draft**

Replace Phase-5/Phase-7 stub and deferral paragraphs with current-authority summaries. Point Target Account behavior to current evaluation, discovery, notification, scoring, and selection sections. Point Selection Report Draft to §4.3.23 and §10.12. Remove integration-deferral notes from active body.

- [ ] **Step 2: Rewrite SelectionReport public-link claims**

Replace “not formally authored” and placeholder-FK language with direct §4.3.23 authority. Preserve immutable snapshot semantics and payload hash.

- [ ] **Step 3: Rewrite already-landed webhook and Ops claims**

Replace the `vendor.disqualified.org_level` follow-up claim with §25.3.10b authority. Replace the impersonation Known Gap with §50.4 and OpsSession authority.

- [ ] **Step 4: Rewrite billing and error-catalog claims**

Replace explicit-Org endpoint “to be authored” language with current §32.8 paths. Replace §34 error-catalog pending text with Appendix I authority and passing catalog-enforcement rule.

- [ ] **Step 5: Rewrite internationalization authority**

Replace active “NOT IMPLEMENTED” language that conflicts with §47.3. Preserve historical v7.0 limitation only in changelog/history and state §47.3 as current production scope.

- [ ] **Step 6: Finalize residency copy**

Use exactly:

- `Action required: complete your Sourcera data residency change`
- `Your Sourcera data residency change is complete`
- `We couldn’t update your data residency because the billing service is temporarily unavailable. Try again in a few minutes. Your current residency and billing setup have not changed.`

Remove active “placeholder” and “UX Lead authoring pending” labels while retaining existing localization keys.

- [ ] **Step 7: Run active-authority scan**

Run:

```sh
rg -n "Full behavioral authoring|Full feature specification is deferred|has not been formally authored|authored in a follow-up|catalog extension still pending|UX Lead authoring pending|placeholder copy|NOT IMPLEMENTED" Sourcera_Master_Spec.md
```

Expected: no active-source contradiction remains. Any changelog-only match is listed as historical in the verification report with its heading.

---

### Task 6: Rewrite Release-Evidence Ownership and Name Missing Paths

**Files:**
- Modify: `Sourcera_Master_Spec.md` §M.5 preamble, schema legend, pending-row assertions, and two unnamed rows
- Modify: `Build_Execution_Strategy.md` §§6.2 and 11
- Modify: `_audit/V711_BACKLOG_INDEX.md`
- Modify: `_audit/REMEDIATION_BACKLOG.md`

**Interfaces:**
- Consumes: existing generic `spec_binding_pending_pack_<id>` status grammar and four stable tokens.
- Produces: binding distinction between feature implementation packs and release-evidence lanes; exact future artifact names for all 212 blockers.

- [ ] **Step 1: Replace §M.5 ownership wording**

Change the preamble from “owned by the implementation pack referenced in Runtime status” to the three-concept model: implementation pack, release-evidence lane, artifact evidence. State that status suffixes are stable release tokens, not feature ownership.

- [ ] **Step 2: Add the four-lane mapping**

Add the exact lane table from design §7.1 to §M.5 and Build Execution Strategy. Preserve the original feature pack definitions unchanged and add an explicit collision warning beside them.

- [ ] **Step 3: Rewrite generated-inventory terminology guidance**

In live routing documents, state that generated “Owning pack” means legacy release-evidence lane until the application repository exists. Do not claim that M24.3’s feature pack owns billing runtime or that M02.3’s feature pack owns DSAR/WorkOS implementation.

- [ ] **Step 4: Name DSAR evidence paths**

Amend `dsar_cascade_residency_partition_isolation` to require:

- `.github/workflows/deploy-validator.yml`
- `convex/deploy_validators/dsar_cascade_residency_partition_isolation.ts`
- `tests/security/dsar_cascade_residency_partition_isolation.spec.ts`

- [ ] **Step 5: Name WorkOS evidence paths**

Amend `workos_raw_attributes_not_consumed` to require:

- `.github/workflows/deploy-validator.yml`
- `convex/deploy_validators/workos_raw_attributes_not_consumed.ts`
- `tests/security/workos_raw_attributes_not_consumed.spec.ts`

- [ ] **Step 6: Confirm all pending rows retain status**

Run:

```sh
tools/spec-lint/node_modules/.bin/tsx tools/release/stamp_gate.ts --spec Sourcera_Master_Spec.md --ae-ledger _integration/AUTHORED_EXTENSIONS_LEDGER.md --defect-ledger _audit/DEFECT_LEDGER.md --json
```

Expected: no documentation-only edit promotes a pending row; the two formerly unnamed rows now report checked future paths.

---

### Task 7: Synchronize Ledgers and Current Routing

**Files:**
- Modify: `_integration/AUTHORED_EXTENSIONS_LEDGER.md`
- Modify: `_integration/RECONCILIATION.md`
- Modify: `_audit/V711_BACKLOG_INDEX.md`
- Modify: `_audit/REMEDIATION_BACKLOG.md`

**Interfaces:**
- Consumes: Completed Master Spec and Build Strategy rewrites.
- Produces: One current release narrative with approved documentation decisions and runtime-only remaining blockers.

- [ ] **Step 1: Verify AE row completeness**

Confirm the three exact IDs exist once, carry `approved 2026-07-13`, cite the approved design, and say runtime evidence remains pending.

- [ ] **Step 2: Append reconciliation block**

Append `v7.1.1 Documentation Blocker Major Rewrite (2026-07-13)` with:

- conflict statement;
- authoritative decision for each of the three contract clusters;
- stale-authority cleanup list;
- release-evidence lane distinction;
- exact non-goal against runtime promotion;
- verification artifact path.

- [ ] **Step 3: Rewrite current routing summaries**

Update V711_BACKLOG_INDEX and REMEDIATION_BACKLOG to state documentation blockers are closed, human blockers are zero, application/runtime blockers remain, and the generated inventory is interpreted through release-evidence lanes.

- [ ] **Step 4: Check routing consistency**

Run:

```sh
rg -n "Documentation Blocker Major Rewrite|AE-V711-DOCBLOCK|release-evidence lane|runtime evidence" _integration/AUTHORED_EXTENSIONS_LEDGER.md _integration/RECONCILIATION.md _audit/V711_BACKLOG_INDEX.md _audit/REMEDIATION_BACKLOG.md
```

Expected: all four documents describe the same decision and no document claims runtime completion.

---

### Task 8: Full Verification, Inventory Regeneration, and Closeout

**Files:**
- Regenerate: `_audit/V711_RUNTIME_STAMP_GATE_BLOCKER_INVENTORY.md`
- Regenerate: `_audit/V711_RUNTIME_STAMP_GATE_BLOCKER_INVENTORY.csv`
- Create: `_audit/_tmp/v711_stamp_gate_2026-07-13_documentation-major-rewrite.json`
- Create: `_audit/PHASE_V711_DOCUMENTATION_BLOCKER_MAJOR_REWRITE_VERIFY_2026-07-13.md`
- Modify: `AGENTS.md`

**Interfaces:**
- Consumes: Every completed rewrite task.
- Produces: Reproducible proof that documentation blockers are closed and only absent application/runtime evidence remains.

- [ ] **Step 1: Run complete repository verification**

Run:

```sh
tools/spec-lint/node_modules/.bin/tsx --test $(rg --files tools -g '*.test.ts')
npm --prefix tools/spec-lint run typecheck
npm --prefix tools/spec-lint run all -- --no-emit --ae-ledger ../../_integration/AUTHORED_EXTENSIONS_LEDGER.md
tools/spec-lint/node_modules/.bin/tsx tools/release/exact_status_scan.ts --ledger _audit/DEFECT_LEDGER.md --json
tools/spec-lint/node_modules/.bin/tsx tools/release/ledger_taxonomy_audit.ts
```

Expected: all pass; exact status remains zero open P0/P1/P2/P3 and zero blocked P1 unless the rewrite correctly files and closes a new documentation row in the same pass.

- [ ] **Step 2: Capture stamp truth and regenerate inventory**

Run stamp gate with JSON saved at the exact `_audit/_tmp/` path, then run:

```sh
tools/spec-lint/node_modules/.bin/tsx tools/release/generate_runtime_blocker_inventory.ts --root . --stamp-json _audit/_tmp/v711_stamp_gate_2026-07-13_documentation-major-rewrite.json --md _audit/V711_RUNTIME_STAMP_GATE_BLOCKER_INVENTORY.md --csv _audit/V711_RUNTIME_STAMP_GATE_BLOCKER_INVENTORY.csv --date 2026-07-13
```

Expected: stamp gate remains fail-closed only on product/runtime evidence; human-ratification blockers are zero; unnamed-path count is zero.

- [ ] **Step 3: Run completion scans**

Run:

```sh
rg -n "out of scope for v7\.0\.0; documented as a Known Gap|Reversal after Scoring phase has concluded|to be authored Phase V8\.4 follow-up|Payload mirrors `billing\.ledger\.export_completed`|Full behavioral authoring|Full feature specification is deferred|has not been formally authored|UX Lead authoring pending|placeholder copy" Sourcera_Master_Spec.md
rg -n "requirement_unlocked" Sourcera_Master_Spec.md
rg -n "reversal_effect_scope" Sourcera_Master_Spec.md
rg -n "audit_events\.export\.ready" Sourcera_Master_Spec.md
rg -n "dsar_cascade_residency_partition_isolation\.ts|workos_raw_attributes_not_consumed\.ts" Sourcera_Master_Spec.md
```

Expected: first scan returns zero active matches; remaining scans show complete cross-section coverage.

- [ ] **Step 4: Author verification report**

Record:

- files changed and backups;
- each blocking finding and its exact new authority;
- test/scanner commands and outputs;
- exact status and taxonomy results;
- runtime blocker counts and evidence posture;
- explicit statement that no runtime row was promoted by documentation.

- [ ] **Step 5: Update AGENTS.md current release correction**

Add a topmost 2026-07-13 correction naming the three closed contract clusters, stale-authority/copy closure, evidence-lane separation, zero unnamed evidence rows, exact current stamp counts, and verification report.

- [ ] **Step 6: Final hostile completion audit**

Re-read the approved design §§2–13 and map each numbered requirement to Master Spec, strategy, ledger, routing, and verification evidence. If any requirement lacks direct evidence, keep the goal active and return to its owning task.

