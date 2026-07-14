# Phase 4.9 — §18 Q&A Threads — Findings Scratch Log

**Phase:** 4.9 (Q&A Threads)
**Source:** `Sourcera_Master_Spec.md` v7.1.0 §18 (lines 14634–14889)
**Adjacent sources walked:** §3.13 mention parser (3293–3340); §4.3.15 Unread Marker Q&A path (4099); §4.6.2 Attachment polymorphism (7347–7404); §4.7 Cross-Console Bridge (7779, 7786); §6.8.5 anonymization scope (10113); §7.2 console firewall (12212); §10.9 Phase 9 Final Vendor Clarifications; §13.6.2 divergence detection; §22.10.4 / §22.14.2 Q&A Suggestion agent and session flow; §24.2 NDA Module; §25.3 Vendor Disqualification Cascade (7942, 8002); §29.1 Notification Event Catalog (41359–41361, 41366); §29.3 user-preference framework; §31.9.8.7 CRM-Sync `qa_thread_posted`; §32 API conventions (Internal Comment Thread API at 20768–20777 as canonical pattern); §34.1.1 plan tiers; §39 Object Size Constraints; §40.2 Data Retention (31295–31332); Appendix C Notification Event Catalog (41340–41389); Appendix I error codes; Appendix J controlled-vocabulary registry (44054, 44409, 45645, 45647); Appendix K Glossary; Appendix L state machines (47360–47636 — no L.x for Q&A Thread); Appendix M.1 §18 rows (47848–47851).
**Audit posture:** Non-destructive defect filing. No spec edits.

---

## 1. Walk Summary

§18 authors a buyer-side asynchronous Q&A surface between vendors and the buyer team, phase-gated on Phases 6–7 (creatable + editable), Phase 8 (vendor read-only), and Phases 9–12 (all read-only). The section provides:

- §18.1 Overview (one paragraph, no tables, no acceptance criteria).
- §18.2 Lifecycle and a phase-availability matrix (not a state machine in From|To|Trigger|Conditions|Notes form).
- §18.3 Thread Object Schema rendered as a JSON example, two prose paragraphs on PUBLIC/PRIVATE visibility, and an Author Masking sub-section that does not declare a corresponding schema field.
- §18.4 Agent Q&A Suggestion (buyer-side, Sonnet, ≤300 chars), with input scope notes that do not disclose the cross-console retrieval path.
- §18.5 Post interactions: 15-min edit/delete window, attachment formats and ≤10 MB cap, VirusTotal scan, @-mentions with email + in-app + daily-digest delivery.
- §18.6 Full-text search (BM25), thread listing/filtering, CSV bulk export.
- §18.7 Plan-tier table inline-restating 50/10 thresholds, additional-slots workflow.
- §18.8 Acceptance criteria as bare checkboxes, not the §13.10 / §14.9 / §17.8 / §20.7 numbered-observable-measurable style.

Q&A Threads are referenced from §3.13 (mention parser, with explicit Authored-Extension flag at 4099), §4.3.15 (Unread Marker fanout), §4.6.2 (Attachment owner_entity_type), §4.7 (Cross-Console Bridge `qa_thread_post_appended`), §5.11 (RBAC row at 9503), §6.8.5 (anonymization scope at 10113), §10.9 (Phase 9 narrative), §22.10.4 / §22.14.2 (Q&A Suggestion agent and session flow), §25.3 (orphaning on vendor disqualification at 7942), §29.1 (`qa_question_received`, `qa_question_answered`, `qa_closed`, `comment_mention` at 41359–41366), §31.9.8.7 (CRM-sync activity for `qa_thread_posted`), and Appendix M.1 (3 of 7 sub-sections mapped). The corpus has internalized §18 as a load-bearing surface, but §18 itself does not satisfy the §4 / §13.10 / §32 / §40.2 / Appendix J / Appendix K / Appendix L / Appendix M authoring conventions.

---

## 2. Confirmation of the Four Prompt-Specific Checks

| Check | Verdict | Evidence |
|---|---|---|
| **Thread schema** meets §4 conventions | **FAIL** | §18.3.1 renders the schema as a JSON example (lines 14669–14729), not a Field/Type/Constraints/Notes table. Missing fields: `org_id`, `console`, `updated_by`, `deleted_at`, post-level `created_by`/`updated_by`/`deleted_at`, `attachment_ids[]` polymorphic FK form (the schema embeds attachment objects inline rather than referencing the §4.6.2 Attachment entity by FK), no `subscribed_user_ids` plurality discipline, no Author-Masking field. Missing meta: scope-isolation declaration, required indexes, retention rule, residency rule, cascade-on-soft-delete behavior. Posts are embedded as a JSON array on Thread (line 14691) instead of normalized as a separate Q&A Post entity with FK — directly contradicts the canonical §4.3.11–13 Internal Comment Thread + Post + Mention three-entity pattern, and explicitly acknowledged as a deferral at §4.3.15 line 4099 ("§18.3.1 does not normalize Q&A mentions ... a future phase should normalize Q&A Thread posts to match Internal Comment Post + Mention separation"). |
| **NDA-aware visibility** | **FAIL — silent** | §18.3.2 declares PUBLIC = "All vendors and buyer team see the thread" with no NDA gating clause. No reference to NDA Record state (§4.5.3), to Phase 4 NDA execution (§24.2), to NDA expiry (`nda_expires_at`), or to mid-evaluation NDA refusal/revocation. The §25.3 disqualification cascade orphans threads for disqualified vendors (line 7942) but the inverse — a vendor who has not yet signed NDA viewing a PUBLIC thread containing buyer-confidential information — is unaddressed. Cross-reference to §6.7 (NDA-bound surface gating) is absent. The user-prompt's "NDA-aware visibility" requirement is unmet. |
| **Mention notifications cite Appendix C** | **FAIL** | §18.5.3 line 14790 says "@-mentioned users receive email + in-app notification with thread link" with no Appendix C citation. Appendix C currently registers `qa_question_received`, `qa_question_answered`, `qa_closed`, and `comment_mention` (line 41366). `comment_mention` per §29.1 / §25.7 fires on Internal Comment mentions only; no `qa_thread.mention_sent` (or analogous) event exists. §31 conformance (HMAC-SHA256, `event_id` idempotency, retry curve, DLQ, Appendix G PostHog row) absent. |
| **Retention cites §40.2** | **FAIL** | §18.5.2 line 14784 says "Retention: Attachments retained as long as thread exists" with no §40.2 citation. §40.2 (lines 31295–31332) has no row for Q&A Thread, Q&A Post, Q&A Attachment, or Q&A Mention. Internal Comment Thread / Post / Mention has a §40.2 row (line 31302: "Life of parent entity ... cascade soft-delete + 30-day purge"); Q&A Threads do not. Soft-delete cascade behavior, DSAR posture, residency partitioning, and GDPR anonymization path are unauthored. The inline retention claim ("as long as thread exists") cannot resolve because the thread itself has no purge rule. |

---

## 3. Walk Findings (pre-promotion to ledger)

### 3.1 Schema (§18.3.1) — root data-model defects

- **F-1** Schema rendered as JSON example, not Field/Type/Constraints/Notes table — violates §4.1 convention used uniformly across §4.3.1–§4.4.x.
- **F-2** Missing required §4 fields: `org_id`, `console` enum (should be `buyer`), `updated_by`, `deleted_at` (nullable for soft-delete). On the post sub-object: missing `created_by` (it has `user_id` — naming drift from §4.3.12), `updated_by`, `deleted_at`.
- **F-3** Posts embedded as a JSON array — directly contradicts §4.3.11–13 Internal Comment Thread + Post + Mention three-entity normalization. The §4.3.15 line 4099 acknowledgement explicitly calls this a deferral. The denormalized `qa_post_mentions` index is an Authored Extension (flagged in `_integration/RECONCILIATION.md`) but the AE has no ratification row in `_integration/AUTHORED_EXTENSIONS_LEDGER.md` for the §18 normalization.
- **F-4** Attachments embedded as inline objects (lines 14707–14721) rather than via `attachment_ids[]` FK to the §4.6.2 Attachment entity. §4.6.2 lists `qa_post` as a valid `owner_entity_type` (line 7355) — §18.3.1 should cite §4.6.2, not re-author the attachment object inline.
- **F-5** Author Masking (§18.3.3) declared as a feature without a corresponding schema field. No `vendor_identity_hidden` / `author_masked` boolean on Thread or Post.
- **F-6** No scope-isolation declaration. Q&A Thread is workspace-scoped; this is not stated.
- **F-7** No required-index declaration. Likely indexes: `(workspace_id, requirement_id, status)`, `(workspace_id, vendor_id)`, `(workspace_id, updated_at desc)`, `(workspace_id, requirement_id, visibility)`. None authored.
- **F-8** No retention rule on the Thread or Post entities. (See also §40.2 row absence below.)

### 3.2 Visibility (§18.3.2 / §18.3.3) — NDA, console, residency, firewall

- **F-9** No NDA-aware visibility clause. PUBLIC threads MUST be gated on NDA-active vendors only; the spec is silent. Failure modes: (a) vendor with `nda_status=expired` continues to see PUBLIC threads; (b) vendor with `nda_status=pending_seller` (NDA refused/un-signed) sees PUBLIC threads created during their bidding window; (c) NDA revocation post-signature does not retroactively suppress thread visibility.
- **F-10** PRIVATE thread visibility ("Workspace Owner, and Buyer team leads") does not enumerate which §5.3 / §5.4 roles count as "team leads." Use Case Lead? Workspace Admin? Reviewer? Guest variants? Buyer-side org-level Org Owner / Org Admin? Unbuildable as written.
- **F-11** Visibility-toggle path: "Buyer can change visibility at any time (even after Phase 7), but cannot make a Public thread Private (only Public or remain Public)" (line 14738) does not specify which roles can flip the toggle, what audit event fires, what the seller-side Cross-Console Bridge projection does on flip (does the vendor still see content posted while PUBLIC after the buyer flips to PRIVATE? — actually the rule says they cannot flip to PRIVATE, but the inverse — Private→Public post-flip — does not declare that the vendor receives a back-fill view of pre-existing private content, an information-leak risk).
- **F-12** Author Masking applies only to vendor-name masking on PUBLIC threads (line 14743). Asymmetric — buyer-side mask path is silent. Mention auto-complete behavior under masking is silent.
- **F-13** Data-residency silent. Thread, Post, Attachment, and Mention all inherit Workspace `data_residency_region` but the inheritance is not stated.
- **F-14** Cross-console firewall path silent. The §4.7.1 Cross-Console Bridge declares `qa_thread_post_appended` as a CARRIED projection (line 7779), but §18.3.1 itself does not state which fields cross the firewall. §18.5.1 admin-moderation flag ("Moderated by [admin]") — does the vendor see a buyer-internal admin name? Internal-comment leak risk.

### 3.3 Mention notifications (§18.5.3) — no Appendix C event

- **F-15** No Appendix C event for Q&A mentions. `comment_mention` (line 41366) is for Internal Comment mentions only.
- **F-16** No §31 conformance: HMAC-SHA256 signing, `event_id` idempotency, exponential backoff (Appendix F class), DLQ after 5 failures, payload ≤256 KB.
- **F-17** No Appendix G PostHog row for Q&A mentions.
- **F-18** Daily digest claim ("All notifications batched into daily digest email", line 14791) not reconciled with §29.3 user-preference framework (DND, quiet hours, channel routing). No per-user opt-out path declared.
- **F-19** Mention auto-complete cross-console path silent: "Mentions populate from: Buyer team members ... or Vendor list (if @-mentioning vendors in Public thread)" — vendor-list pull crosses the console firewall; no §4.7 Bridge contract.
- **F-20** Mention to a deprovisioned user, a guest who has been revoked (per §5.4), or a vendor whose NDA expired — all silent.

### 3.4 Retention (§18.5.2) — no §40.2 row

- **F-21** §40.2 has no row for Q&A Thread, Q&A Post, Q&A Attachment, or Q&A Mention. The closest rows are line 31298 ("User data ... Life of workspace") and line 31302 (Internal Comment Thread / Post / Mention "Life of parent entity ... cascade soft-delete + 30-day purge"). §18.5.2 inline statement "Attachments retained as long as thread exists" cannot resolve because the thread purge rule itself is absent.
- **F-22** DSAR cascade silent. §6.8.5 line 10113 lists "Q&A posts" in the user-content anonymization rule (`anonymized_buyer_user_<hash>` / `anonymized_seller_user_<hash>`); §18 does not surface the cascade. Attachment-body DSAR sweep timing absent.
- **F-23** Right-to-erasure silent. Cascade compatibility with parent Workspace soft-delete (cascade or independent purge?) unaddressed.
- **F-24** Residency partitioning silent.
- **F-25** GDPR anonymization path silent.

### 3.5 APIs (§32) — no contract authored

- **F-26** §32 has no Q&A Thread CRUD endpoints. Internal Comment Thread defines `GET/POST/PATCH/DELETE /v1/.../internal-comment-threads`, `GET/POST .../{id}/posts`, `POST .../{id}/read-receipt` (lines 20768–20777) as the canonical pattern. Q&A Threads have no equivalent.
- **F-27** No request/response schemas, no error codes, no rate-limit class, no cursor pagination, no idempotency semantics, no concrete examples — none.

### 3.6 Webhooks (§31) — partial Appendix C registration, missing §31 conformance

- **F-28** `qa_question_received`, `qa_question_answered`, `qa_closed` (lines 41359–41361) are registered in Appendix C as transactional events but lack §31 conformance metadata in the catalog rows: no `event_id`, no Appendix F retry-curve class, no Appendix G PostHog row pairing, no payload schema.
- **F-29** No `qa_thread.created`, `qa_thread.archived`, `qa_thread.visibility_changed`, `qa_thread.mention_sent`, `qa_thread.post_edited`, `qa_thread.post_deleted`, `qa_thread.attachment_quarantined` events — all of which the prose authors as observable behaviors.

### 3.7 Plan gating (§18.7) — inline-restated thresholds

- **F-30** §18.7.1 inline-restates Free=10, Starter=50, Growth=50/+5, Scale=50/+10, Enterprise=50/+10 — does not cite §34.1.1 or §39. Authoring Convention #10 violation.
- **F-31** Conflict with Appendix M.1 row 47850 "Agent Q&A Suggestion (buyer-side AI) ... Gr+" vs §18.7.1 "Wallet-charged" on Free/Starter/Growth/Scale and "Committed" on Enterprise. Direct tier-gating disagreement.
- **F-32** Conflict with Appendix M.1 row 47849 "Q&A Thread (phase-gated; Phase 9 specifically)" vs §18.2.1 "creatable Phases 6–7." Phase mismatch.

### 3.8 Enums (Appendix J) — three unregistered inline enums

- **F-33** `status: OPEN | CLOSED` not in Appendix J.
- **F-34** `visibility: PUBLIC | PRIVATE` not in Appendix J.
- **F-35** `user_role: Vendor | Buyer` inline — duplicates §5.3 / §5.5 / Appendix J role enums but does not match the canonical lowercase (`workspace_owner`, `workspace_admin`, `use_case_lead`, `reviewer`, `guest`, plus seller-side equivalents). Naming drift.

### 3.9 State machine (Appendix L) — missing entirely

- **F-36** Q&A Thread state transitions (Phase 6 OPEN → Phase 8 vendor read-only → Phase 9–12 all read-only → orphaned on vendor disqualification per line 7942 → archived on workspace cancel) live as prose and a phase-availability matrix. No Appendix L.x table with From|To|Trigger|Conditions|Notes columns.

### 3.10 Glossary (Appendix K)

- **F-37** Q&A Thread, Q&A Post, Q&A Mention not registered in Appendix K. Used across §3.13, §4.3.15, §4.6.2, §4.7, §5.11, §6.8.5, §18, §22.10.4, §22.14.2, §25.3, §29.1, §31, §32 — multi-section by every measure.

### 3.11 Surface/Engine mapping (Appendix M.1) — partial coverage

- **F-38** Appendix M.1 lines 47848–47851 list only 3 §18 rows (§18.2 thread, §18.4 Agent Suggestion, §18.6 search). Missing Appendix M rows for §18.3.2 visibility control, §18.3.3 author masking, §18.5.1 post moderation (15-min edit window + admin override), §18.5.2 attachments + virus scan, §18.5.3 mention notifications + daily digest, §18.7.2 additional-slots request workflow.

### 3.12 Acceptance criteria (§18.8) — checkbox style, not numbered/observable/measurable

- **F-39** §18.8 ACs are bare `- [ ]` checkboxes with concept-level statements ("PUBLIC threads visible to all vendors and buyer team"). Cf. §13.10, §14.9, §17.8, §20.7 — numbered, observable inputs, observable outputs, measurable thresholds. §18.8 violates the canonical AC pattern.

### 3.13 Error codes (Appendix I)

- **F-40** §18.8.1 says "Attempted violations show error toast" without citing an Appendix I error code. Failure paths needing error codes: phase-gating violation, 50-question limit reached, additional-slots-exhausted, attachment scan failure (malware detected), attachment-too-large, mention to non-existent / deprovisioned user, cross-workspace read denied, NDA-not-active visibility denial, console-firewall violation. Zero §18 error codes registered.

### 3.14 Cross-console firewall (§7.2) — Agent input scope

- **F-41** §18.4.1 says the Agent input includes "Existing Q&A threads in same workspace (public + buyer's private threads only)" and "KB entries (if available) tagged with matching categories." The buyer-side agent retrieving seller-side KB entries crosses the console firewall; the §4.7 Cross-Console Bridge contract for this read path is unauthored. Excluded-data list ("Cross-workspace data, Intelligence data, other org data") is necessary but not sufficient.

### 3.15 Edge cases (§18 silent)

- **F-42** Visibility downgrade flow: PUBLIC → PRIVATE prevented (line 14738) — but PRIVATE → PUBLIC has no audit event, no notification to vendor, no back-fill semantics.
- **F-43** Concurrent edit-window race: two authors of the same post within 15 min — not addressed.
- **F-44** Mention to a guest mid-revocation cascade — not addressed.
- **F-45** Attachment lifecycle when post is deleted in the 15-min window — orphan-cleanup path not addressed (cf. §4.6.2 `presigned_orphan` owner type).
- **F-46** Workspace soft-delete cascade to threads — not addressed.
- **F-47** Mid-evaluation NDA revocation — not addressed.

### 3.16 Third-party dependency (§18.5.2)

- **F-48** "VirusTotal API" named inline. VirusTotal is not in CLAUDE.md §12 third-party-outage list (WorkOS, Stripe, Convex, Anthropic, Firecrawl, PostHog, Loops.so, Perplexity, Zendesk). §4.6.2 Attachment scan implementation likely uses ClamAV or another scanner; drift between §18.5.2 and §4.6.2.

### 3.17 Observability (Appendix G PostHog taxonomy)

- **F-49** Appendix G has no `qa_thread.*` event family. Cf. Internal Comment Thread which has `internal_comment_thread.created`, `internal_comment_thread.post_appended`, `internal_comment_thread.mention_sent` registered.

---

## 4. Self-Challenge Pass (Hostile Reviewer Re-Read)

I re-read the findings as a hostile staff engineer. Adjustments:

- **F-9 (NDA-aware visibility) demoted from P0 to P1.** Initial classification was P0 (firewall_leakage / privacy). On re-read: §25.3 disqualification cascade does orphan threads for vendors whose NDA is refused or whose status moves out of `executed` via the disqualification path (line 7942). The runtime path is therefore not a vacuum — disqualification is the implicit NDA-enforcement mechanism. The defect is that §18 does not surface this dependency, which leaves the runtime relying on §25.3 alone with no §18-side gate. A junior engineer building §18 in isolation would build a non-NDA-aware visibility check. P1 (unbuildable as written) is the correct rule per the Severity Definitions. **Updated.**

- **F-3 (Posts embedded JSON array) — confirm P1, not P0.** The defect is unbuildable-as-written for production scale (Convex doc-size limits, optimistic concurrency, pagination). It does not break the buyer/seller console firewall, expose PII to an unintended actor, or violate a hard regulatory requirement. P0 doesn't apply. P1 holds.

- **F-15 (Q&A mention has no Appendix C event) — confirm P1.** Loss of mention notification (or wrong-event delivery) is a customer-visible defect but does not rise to P0 unless it leaks across the console firewall. The `comment_mention` event is for Internal Comments and is buyer-internal; if the runtime mistakenly fires it for a Q&A mention to a vendor, that's a firewall leak — but the spec does not direct that, so the defect stays at the unbuildable-as-written tier. P1.

- **F-21 (no §40.2 Q&A row) — promote? Hold at P1.** Retention silence is a §6.8 / GDPR compliance risk. Without an authoritative purge rule, an Org's Q&A threads accumulate indefinitely or are governed by the §40.2 line 31298 fallback ("User data ... Life of workspace") — which is over-retentive for vendor-PII-bearing rows. Hostile-reviewer view: this is a P1 because it is unbuildable as written, not P0 because the fallback is over-retentive (not under-retentive); GDPR compliance is preserved by the cascade on workspace soft-delete (line 31297) even if implicitly. P1 stands.

- **F-30 (plan-tier inline restatement) — keep P1.** Authoring Convention #10 violation. Tracks with D-3.2-022 (Phase 3.2 forwarded defect on Q&A Threads `plan_gating ⚠ → ❌`). Cross-link in ledger.

- **F-31 / F-32 (Appendix M ↔ §18.7 conflicts).** Two distinct surface/engine drift defects. P2 each (consistency_drift, ambiguous to two readers, but not unbuildable — the hostile reviewer can resolve by treating §34.1.1 as canonical). Keep separate.

- **F-39 (AC checkbox style) — keep P2.** Unbuildable but resolvable via the canonical AC pattern. Not P1 because two readers would resolve the same way.

- **F-48 (VirusTotal naming) — confirm P2.** Cosmetic to most readers; an integration engineer would catch it. Not P1.

**Counterfactual pass — three failure modes per major defect (representative):**

- **NDA-aware visibility (F-9):** (a) Vendor's NDA expires mid-Phase-7 — does the buyer's PUBLIC thread containing competitive responses remain visible? Spec silent. (b) Buyer uploads an updated NDA per §24.2 multiple-version path; vendor refuses to re-sign — does the now-paused vendor see ongoing PUBLIC threads? Spec silent. (c) Vendor signs NDA, posts to PUBLIC thread, is then disqualified — orphaning is per §25.3, but a NEW vendor invited to the workspace post-disqualification sees the disqualified vendor's posts. Author Masking does not kick in automatically. Spec silent.

- **Mention webhook gap (F-15 / F-29):** (a) `comment_mention` runtime fires on a Q&A mention by a buyer-side runtime mistake — vendor receives an email leaking buyer-internal-thread-style copy. Firewall risk. (b) DLQ behavior on mention-delivery failure — un-authored, so the runtime defaults to no retry, and the vendor never learns of the mention. (c) PostHog-side mention-rate analytics never fire because no `qa_thread.mention_sent` event exists, so the buyer-side activation funnel cannot measure mention engagement.

- **Retention gap (F-21 / F-23):** (a) Workspace soft-delete: §40.2 line 31297 says 30-day purge. Q&A threads cascade or not? Spec silent. (b) DSAR for a buyer user who authored Q&A posts: §6.8.5 says pseudonymize author FK, retain content. Q&A Posts are subject — but §18 does not surface the cascade, so the runtime cannot validate. (c) GDPR right-to-erasure for a vendor user: vendor's thread-author-side posts are vendor-side content; the §6.8.5 anonymization rule applies; but Workspace cascade rules do not state whether the vendor's posts are retained or purged on Workspace soft-delete.

---

## 5. Promotion to Defect Ledger

The findings below promote to `DEFECT_LEDGER.md` rows D-4.9-001 through D-4.9-015 (15 rows). Findings F-1 / F-2 / F-3 / F-4 / F-5 fold into D-4.9-001 (the schema row) and D-4.9-002 (post-normalization row); F-9 / F-10 / F-11 / F-12 / F-13 / F-14 fold into D-4.9-003 (NDA-aware visibility) plus D-4.9-013 (residency) plus D-4.9-014 (firewall path); F-15 through F-20 fold into D-4.9-004 (mention webhook) and D-4.9-005 (digest routing); F-21 through F-25 fold into D-4.9-006 (retention) and D-4.9-007 (DSAR); F-26 / F-27 fold into D-4.9-008 (API contract); F-28 / F-29 fold into D-4.9-009 (webhook conformance); F-30 / F-31 / F-32 fold into D-4.9-010 (plan-tier numerical singletons) and D-4.9-011 (Appendix M ↔ §18 drift); F-33 / F-34 / F-35 fold into D-4.9-012 (enum registration); F-36 folds into D-4.9-015 (state machine); F-37 promotes to its own glossary row; F-38 folds into D-4.9-014 (Appendix M coverage); F-39 promotes to AC row; F-40 promotes to error-code row; F-41 folds into D-4.9-014; F-42–F-47 fold into the edge-case row; F-48 / F-49 fold into observability and third-party rows.

To keep the defect set defensible and high-signal, 15 ledger rows are promoted. Lower-signal items (F-39 acceptance-criteria style, F-43 concurrent-edit race, F-48 VirusTotal naming) remain in this scratch log as a "v7.1.1 backlog" reference for the Phase 4.9 V-pass to either promote or close.

---

## 6. Coverage Matrix Cells (to be promoted to `COVERAGE_MATRIX.md` in the V-pass)

| feature_id | feature_name | section | data_model | enums | glossary | rbac | plan_gating | acceptance_criteria | state_machine | api | webhook | notifications | posthog_events | error_codes | retention | dsar | residency | console_firewall | empty/loading/error | mobile | a11y | surface_engine_mapping | observability | test_coverage |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| F-295 | Q&A Threads | §18.1 | ❌ | ❌ | ❌ | ⚠ | ❌ | ⚠ | ❌ | ❌ | ⚠ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ⚠ | ❌ | ❌ | ❌ | ⚠ | ❌ | ❌ |
| F-296 | Q&A Lifecycle & Phase Gating | §18.2 | n/a | ❌ | ⚠ | ⚠ | ❌ | ⚠ | ❌ | ❌ | ⚠ | n/a | n/a | ❌ | n/a | n/a | n/a | ⚠ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |
| F-297 | Q&A Structure & Visibility | §18.3 | ❌ | ❌ | ❌ | ❌ | ❌ | ⚠ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ⚠ | ❌ | ❌ |
| F-298 | Agent Q&A Suggestion (Buyer-Side) | §18.4 | n/a | ⚠ | ⚠ | ⚠ | ⚠ | ⚠ | ❌ | ⚠ | ❌ | ❌ | ❌ | ❌ | n/a | ❌ | n/a | ❌ | ⚠ | ❌ | ❌ | ✅ | ⚠ | ❌ |
| F-299 | Q&A Post Interactions & Moderation | §18.5 | ❌ | ❌ | ❌ | ❌ | ❌ | ⚠ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| F-300 | Q&A Search & Index | §18.6 | n/a | n/a | ⚠ | ⚠ | ⚠ | ⚠ | n/a | ❌ | ⚠ | n/a | n/a | n/a | n/a | n/a | n/a | n/a | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |
| F-301 | Q&A Plan Limits & Features | §18.7 | n/a | n/a | n/a | ⚠ | ❌ | ⚠ | n/a | ❌ | ❌ | n/a | n/a | n/a | n/a | n/a | n/a | n/a | ❌ | n/a | n/a | ❌ | n/a | n/a |

**Aggregate counters NOT updated** in this Phase 4.9 pass. Aggregate ✅ / ⚠ / ❌ / n/a totals will be re-derived in a Phase V4 cross-check after Phase 4.10 (Template Library), 4.11 (Inbox & Pulse), and 4.12 (Sourcera Agent) close.

---

## 7. Forwarded to Downstream Phases

- **Phase 5 (Seller Pipeline)** inherits the §18.4 cross-console agent retrieval path (F-41) — KB entries pulled by buyer-side Agent Q&A Suggestion crosses to seller-side KB; resolution lives in §22 / §4.7 Bridge.
- **Phase 6 (Privacy & Residency)** inherits the §18 DSAR / residency / GDPR silence (F-22 / F-23 / F-24 / F-25) and the NDA-aware visibility gate (F-9 / F-47).
- **Phase 8 (API + Webhook)** inherits the §32 Q&A Thread API absence (F-26 / F-27) and the Appendix C / §31 conformance gap (F-15 through F-20, F-28 / F-29).
- **Phase 9 (Observability)** inherits the Appendix G PostHog taxonomy gap (F-49) and the §18 PostHog event family authoring.
- **Phase 14.18.1 (CI gate runtime wiring)** inherits the surface/engine-mapping gap (F-38) — the `appendix_m_coverage_on_diff` CI gate would have caught the missing rows had it been wired.

---

## 8. Authored Extension Notes

The §4.3.15 line 4099 acknowledgement that "§18.3.1 does not normalize Q&A mentions ... a future phase should normalize Q&A Thread posts to match Internal Comment Post + Mention separation" is an Authored Extension by definition. The denormalized `qa_post_mentions` index is the AE artifact. **No row exists in `_integration/AUTHORED_EXTENSIONS_LEDGER.md` for the §18 normalization deferral.** Filed as part of D-4.9-002.

---

## 9. Audit Run Metadata

- **Run date:** 2026-05-05
- **Run mode:** non-destructive
- **Source documents read in full:** §18 (lines 14634–14889); §3.13 (3293–3340); §4.3.15 (4090–4106); §4.6.2 (7347–7404); §4.7 (7779, 7786); §5.11 (9486, 9503); §6.8.5 (10113); §7.2 (12212); §10.9; §22.10.4 (17391–17396); §22.14.2 (17844–17848); §24.2 (19305–19345); §25.3 (7942, 8002, 19608, 19620); §29.1 (24836, 41340–41389); §31.9.8.7 (25931); §40.2 (31293–31332); Appendix C (41340–41389); Appendix L (47360–47636); Appendix M.1 (47682–47851 — §18 rows specifically).
- **Companion documents not read (out of scope for §18):** Buyer Pricing Strategy v3, Seller Pricing Strategy v3, UX_Design_of_Sourcera.md (forwarded to Phase 4.x mobile/a11y reviews).
