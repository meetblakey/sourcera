# Phase 1 Adversarial Verification — §4.3 Buyer Console Entities Extension

**Scope:** Phase 1 authoring only (§4.3.11 – §4.3.19, plus Appendix J / Appendix K / §39 / §40.2 ancillary edits). Later phases (2–4) are out of scope for this verification and their downstream effects on Phase 1 artifacts are noted only where they would retroactively invalidate a Phase 1 decision.
**Reviewer role:** Hostile — actively looking for reasons v7.0.0 should not ship.
**Baseline:** `_versions/Sourcera_Master_Spec_v6.0.0.md`
**Target:** `Sourcera_Master_Spec.md` (current working copy, Phase 4 in progress).
**Verification date:** 2026-04-15.

---

## 1. STRUCTURAL CHECKS

### 1.1 Entity-count delta in §4

Count of `### 4.*` entity subsections.

| Metric | v6.0.0 baseline | Current spec | Δ | Phase 1 contribution |
| :--- | :--- | :--- | :--- | :--- |
| §4.2 Organization & Auth | 4 | 4 | 0 | 0 |
| §4.3 Buyer Console | 10 | 19 | +9 | **+9** |
| §4.4 Seller Console | 6 | 18 | +12 | 0 |
| §4.5 Marketplace | 3 | 8 | +5 | 0 |
| §4.6 Audit & Logging | 1 | 1 | 0 | 0 |
| §4.7 Cross-Console Bridge | 0 | 2 | +2 | 0 |
| §4.8 Billing & AI Accounting | 0 | 11 | +11 | 0 |
| **Total §4 entity subsections** | **24** | **63** | **+39** | **+9** |

Phase 1 net effect: §4.3 grew from 10 → 19 subsections. The nine added subsections (§4.3.11 – §4.3.19) match the Phase 1 log. **PASS.**

### 1.2 Per-entity structural coverage

For each Phase 1 entity, presence of the six required structural elements.

| Entity | Field Table | Indexes | Retention | Scope Isolation | Glossary (Appx K) | Appx J Enums | §4 Relationship |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| §4.3.11 Internal Comment Thread | ✅ 22 rows | ✅ 4 indexes | ⚠ inherited from §40.2 row ("Life of parent entity"); no explicit retention paragraph in §4.3.11 body | ✅ HTTP 404 rule | ✅ "Internal Comment Thread" | ✅ 3 enums | ✅ Workspace, Use Case, Requirement |
| §4.3.12 Internal Comment Post | ✅ 21 rows | ✅ 5 indexes | ⚠ inherited only; no paragraph | ✅ inherits thread | ✅ | ✅ 2 enums | ✅ Thread, Attachment† |
| §4.3.13 Internal Comment Mention | ✅ 14 rows | ✅ 4 indexes | ⚠ inherited only | ✅ frozen-expansion rule | ✅ | ✅ 1 enum | ✅ Post, User, Team |
| §4.3.14 Presence Record | ✅ 16 rows | ✅ 5 (Convex) | ✅ explicit "Ephemeral; evicted 60s; excluded from DSAR/export" | ✅ firewall rule + cross-Org guest rule | ✅ | ✅ 3 enums | ✅ User, Org, Workspace, Bid Workspace |
| §4.3.15 Unread Marker | ✅ 13 rows | ✅ 5 indexes | ✅ explicit retention paragraph | ✅ console-per-marker rule | ✅ | ✅ 2 enums | ⚠ polymorphic to Thread / Q&A Thread / Inbox Item Group — last target has no §4 entity |
| §4.3.16 Buyer Referral | ✅ 28 rows | ✅ 6 indexes | ✅ explicit; Org-life + 7yr | ✅ Org-scoped; referee-anonymity rule | ✅ 3 entries | ✅ 4 enums | ✅ Organization, User |
| §4.3.17 Pro Trial Seat Grant | ✅ 27 rows | ✅ 6 indexes | ✅ explicit; Org-life + 7yr | ✅ dual-projection rule | ✅ 3 entries | ✅ 4 enums | ⚠ references Target Account — **no §4 entity** |
| §4.3.18 Usage Event | ✅ 21 rows | ✅ 7 indexes | ✅ explicit 24-month rolling | ✅ console-filter rule; role gating | ✅ 2 entries | ✅ 5 enums | ✅ Org, User, Workspace/Bid Workspace, Capability Declaration |
| §4.3.19 Time-Saved Credit | ✅ 20 rows | ✅ 5 indexes | ✅ explicit 36-month rolling | ✅ role-gated | ✅ 3 entries | ✅ 2 enums | ✅ Usage Event, Capability Declaration |

† = see §1.4 below.

**Findings:**

- **S-1 (LOW).** Four of the nine entities (§4.3.11 Thread, §4.3.12 Post, §4.3.13 Mention) carry no explicit "Retention" paragraph in their §4 body; retention is recorded only in the §40.2 table ("Life of parent entity"). Spec convention elsewhere in §4 (e.g., §4.3.16–§4.3.19) carries an inline retention paragraph plus the §40.2 row. Consistency defect; not a ship-blocker.
- **S-2 (MEDIUM).** §4.3.15 Unread Marker polymorphic `thread_type` includes `inbox_item_group`, but no Inbox Item Group entity is authored in §4. §29.1 is referenced but §29 in the spec is **not** the Inbox section — the Inbox sections are §20 (buyer) and §24 (seller). The reference "§29.1 Inbox Feed Schema" does not resolve to the actual Inbox Feed at §20.7.1. Engineering cannot build a polymorphic FK validator against a non-existent entity. See §3.K-1 below.
- **S-3 (MEDIUM).** §4.3.11 `attached_to_type = selection_report_draft` has no §4 entity to FK to. Selection Report appears only as a §32 API surface and a §39 size row (100,000-char narrative); no first-class `Selection Report Draft` entity exists. Polymorphic write validation cannot resolve. See §3.K-2.
- **S-4 (MEDIUM).** §4.3.17 Pro Trial Seat Grant carries `issuing_target_account_id` — a FK to Target Account. No Target Account entity exists in §4. Term appears in §10 (Vendor Curation) as a workflow concept, in §32 API paths, and in Appendix J (status enum) but is never materialized in the data model. Phase 1 introduces an FK to a phantom entity.
- **S-5 (MEDIUM).** §4.3.12 Internal Comment Post `attachment_ids` → Attachment; comment "Attachment entity defined in §4.6, unchanged." §4.6 contains only `4.6.1 Audit Event`. No Attachment entity exists in §4.6. The file uploads are described procedurally in §18.5.2 but never materialized as a data-model entity. Phase 1 relies on an entity that does not exist.

**Conclusion:** Phase 1 introduces three dangling polymorphic FKs (Inbox Item Group, Selection Report Draft, Target Account) and one implicit entity reference (Attachment). These are not "deferred — author later"; they are write-time validation dependencies whose absence prevents the polymorphic validator described in the Phase 1 text from being implementable.

### 1.3 Required system fields (Authoring Convention #1) — column-by-column

Every new entity should carry: `id`, `org_id` (where applicable), `console` (where applicable), `created_at`, `updated_at`, `created_by`, `updated_by`, `deleted_at`.

| Entity | id | org_id | console | created_at | updated_at | created_by | updated_by | deleted_at |
| :--- | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: |
| Thread | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Post | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Mention | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ✅ |
| Presence | ❌ (uses `session_id` as PK) | ✅ | ✅ | ✅ (`connected_at`) | ✅ (`last_heartbeat_at`) | n/a (session-owned) | n/a | n/a (ephemeral) |
| Unread Marker | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ |
| Buyer Referral | ✅ | ✅ (`referrer_org_id`) | ❌ (buyer-only; implicit) | ✅ | ✅ | ✅ | ✅ | ✅ |
| Pro Trial Seat Grant | ✅ | ✅ (dual) | ❌ (implicit) | ✅ | ✅ | ✅ | ✅ | ✅ |
| Usage Event | ✅ | ✅ | ✅ | ✅ | ❌ (append-only) | ❌ | ❌ | ❌ |
| Time-Saved Credit | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ |

**Findings:**

- **S-6 (LOW).** Internal Comment Mention omits `console`, `updated_at`, `created_by`, `updated_by`. `console` is inherited from parent Post via join; `created_by` is implicit-equal to `Post.author_id`. `updated_at` / `updated_by` are arguably unnecessary because Mentions should be append-only, but the spec does not assert "append-only" as a constraint. Either (a) add the append-only invariant and an `updated_by` audit shim, or (b) add the fields. Currently silent — engineering will have to guess.
- **S-7 (LOW).** Unread Marker and Time-Saved Credit omit `created_by` / `updated_by`. These are system-written, not user-authored, so it's defensible — but spec convention for Buyer Referral and Pro Trial Seat Grant (both system-touched) carries the fields. Consistency defect.
- **S-8 (LOW).** Usage Event omits `updated_at`, `deleted_at`, `created_by`, `updated_by`. Append-only is the correct design, but the spec should **assert** append-only as a constraint and list the DSAR-redaction path as the only mutation. Currently the assertion is implicit.
- **S-9 (MEDIUM).** Author Role Snapshot enum on Internal Comment Post §4.3.12: values `workspace_owner | workspace_admin | use_case_lead | reviewer | guest_full_participant | guest_contributor | guest_scorer`. This is **not** a canonical Workspace Role enum — baseline Appendix J → Workspace Roles has `workspace_owner | workspace_admin | use_case_lead | reviewer | guest`. The three compound `guest_*` values are an on-the-fly merge of Workspace Role + `guest_permission_profile`. This composite enum is not registered in Appendix J as either an extension to Workspace Roles or a new enum. Violates Authoring Convention #3 ("never invent enum values inline").

### 1.4 No §4 field deleted (git diff, §4.1–§4.3.10)

Direct `diff` of baseline §4.1–§4.3.10 vs. current same range returns **zero content deltas** (only a separator `---` shift). Baseline §4.4–§4.6 content reappears verbatim starting at the current §4.4 anchor. **PASS.**

### 1.5 No enum value removed from Appendix J

Spot-checked every v6.0.0 Appendix J enum against the current file: Response Types, Rubric Grades, Global Organization Roles, Workspace Roles, Team Roles, Pipeline Phases, Notification Frequencies, Notification Channels, Capability Categories, Seller Verification Tiers, Pricing Structures, Requirement Statuses, Response Statuses, Target Account Statuses, Workspace Statuses, Bid Workspace Statuses, Plan Tiers, Scoring Modes, MFA Enforcement Levels, API Token Scopes, Audit Event Action Types, Marketplace Listing Statuses, Marketplace EOI Statuses, NDA Statuses, Intelligence Brief Models. All preserved verbatim. **PASS.**

### 1.6 §39 and §40.2 ancillary edits

§39 Object Size Constraints: 28 Phase 1 rows inserted between baseline `Traceability Matrix | notes` row and the §39→§40 separator. Covers Thread, Post, Mention, Presence, Unread Marker, Buyer Referral, Pro Trial Seat Grant, Usage Event, Time-Saved Credit. **PASS** on presence; see §2 for adequacy.

§40.2 Data Retention & Deletion: 11 Phase 1 rows inserted between baseline `Deprovisioned user (SCIM)` row and the (now-Phase-2) Marketplace Category row. **PASS** on presence; see §2 for adequacy.

### 1.7 Appendix K (Glossary)

Created net-new in Phase 1 with 16 entries under "Terms Introduced in §4.3." Project authoring convention references "Appendix B" (Keyboard Shortcut Reference) as the glossary target; Phase 1 created Appendix K instead and flagged this as a Known Gap. Accepted as a deliberate divergence.

**Structural section sign-off:** 5 findings (S-2, S-3, S-4, S-5, S-9) are MEDIUM severity; remaining findings are LOW. The four MEDIUM-severity dangling-FK findings (S-2, S-3, S-4, S-5) require either a Phase-1 rework (author placeholder entities for Selection Report Draft / Inbox Item Group / Target Account / Attachment in §4) or an explicit deferral to a later phase with a named owner. They are **not** resolvable by reading the current spec — they require net-new authoring.

---

## 2. ADVERSARIAL CHECKS

### 2.1 Slow / impossible query patterns given specified indexes

For each entity, a realistic query pattern that the indexes do not cover.

| Entity | Hostile query | Index coverage | Verdict |
| :--- | :--- | :--- | :--- |
| Internal Comment Thread | "All open threads across all workspaces for a single user where the user is subscribed, sorted by last activity" — a person's cross-workspace thread dashboard | ❌ No `subscribed_user_ids @> [user_id]` index; array containment scan on `(org_id, created_at DESC)` is O(rows) | **FLAG.** Requires a GIN index on `subscribed_user_ids` or a normalized `thread_subscriber` bridge table. Unread Marker partially covers "per-user" but only once a post has been appended. |
| Internal Comment Post | "All posts authored by a deprovisioned user, across all workspaces, for moderation review" | ✅ `(author_id, created_at DESC)` covers it | PASS |
| Internal Comment Post | "Full-text search within a single thread for a term" | ❌ No FTS/trigram index on `body` | **FLAG.** The "Authoring Intent" promises §18.6 full-text search integration but no FTS index is registered; §18.6 itself is a separate system. Defer. |
| Internal Comment Mention | "Aggregate per-user unread mention count by workspace for badge counts" | ⚠ `(mentioned_user_id, read_at, created_at DESC)` plus workspace filter requires scan within matching rows. Acceptable if mentions < 10K/user; degrades otherwise | **MINOR.** The spec also maintains `has_unread_mention` on Unread Marker which serves the UI; acceptable if UI always reads from Unread Marker. |
| Presence Record | "How many concurrent users across the entire Org right now?" — SuperAdmin dashboard | ⚠ `(org_id, workspace_id, status)` indexed, but `workspace_id IS NULL` is not selective; Convex TTL eviction runs against `last_heartbeat_at` which is not composite with `org_id`. | **MINOR.** Eviction sweep overhead scales with total presence rows, not per-Org. Acceptable. |
| Unread Marker | "Give me all threads with ≥ 1 unread mention across buyer + seller console for the Inbox global view" | ✅ `(user_id, console, has_unread_mention, updated_at DESC)` covers per-console; global requires two index scans + union. Convex can union efficiently. | PASS |
| Buyer Referral | "For a referee email (domain + address), find any prior referrals — same-domain + exclusivity check at signup time" | ⚠ `(referee_email_domain, status)` covers domain lookup but not exact-email match. The Referee Exclusivity Rule scans `referee_email` (not indexed) on every activation. With 10M rows, a full scan. | **FLAG.** Exclusivity enforcement requires `(LOWER(referee_email), status)` index. Not registered. |
| Pro Trial Seat Grant | "For (buyer_org, vendor_org), has there been a grant in the prior 365 days?" — the same-buyer-365d-block check | ⚠ `(vendor_org_id, created_at DESC)` covers vendor-side but not composite `(buyer_org_id, vendor_org_id)`. The enforcement query is a scan. | **FLAG.** Composite index `(buyer_org_id, vendor_org_id, created_at DESC)` not registered. |
| Pro Trial Seat Grant | "Redeem grant by grant_code at vendor signup" | ✅ `(grant_code) UNIQUE` covers | PASS |
| Usage Event | "For a specific requirement_id, all events touching it across all users in the last 7 days" | ✅ `(entity_ref_type, entity_ref_id, created_at DESC)` covers | PASS |
| Usage Event | "Sum `ai_value_dollars` per capability per month for billing reconciliation" | ⚠ `(org_id, capability_id, created_at DESC)` covers but SUM requires scan of the date range for that Org×capability. With 100M rows, this is multi-second. Billing reconciliation is a nightly batch, so acceptable — but the entity claims "billing-grade reconciliation" as a design driver. | **FLAG.** Either a materialized per-day aggregate table or an explicit "nightly-only" SLA caveat is required. |
| Time-Saved Credit | "Total value_saved_usd for an Org in a rolling 30-day window" | ⚠ `(org_id, recognized_at DESC)` covers range; SUM with NULL-filter on `reversed_by_credit_id` requires partial-index support | **MINOR.** A partial index `(org_id, recognized_at) WHERE reversed_by_credit_id IS NULL` keeps aggregates fast; not registered but trivial to add. |

**Findings:** 4 FLAGs. All four are missing composite / partial / GIN indexes that the text implies but does not register. Engineering will either (a) ship without them and take a production incident on the first 5-year-old customer, or (b) reverse-engineer them from the failure. Both are avoidable with index-registration discipline in Phase 1.

**A-Q1 remediation:** Before v7.0.0 ship, add to §4.3.11 indexes:
- `subscribed_user_ids` GIN (or normalized `thread_subscriber` table).

Add to §4.3.16 indexes:
- `(LOWER(referee_email), status)` — exclusivity-rule enforcement.

Add to §4.3.17 indexes:
- `(buyer_org_id, vendor_org_id, created_at DESC)` — 365-day block enforcement.

Add to §4.3.18 either:
- a materialized `usage_event_capability_daily_agg` rollup table, **or**
- an explicit "billing-reconciliation queries run nightly against cold storage" caveat in the Authoring Intent.

Add to §4.3.19 indexes:
- `(org_id, recognized_at) WHERE reversed_by_credit_id IS NULL` partial index.

These are genuine ship-blockers for the scale implied by the authoring language ("billing-grade", "sub-100ms PLG surface").

### 2.2 DSAR right-of-erasure vs. referential integrity

For each entity with a retention rule, can DSAR be satisfied without orphaning children?

| Entity | DSAR target | RI risk | Verdict |
| :--- | :--- | :--- | :--- |
| Internal Comment Thread | Thread author deprovisioned | Threads outlive authors; `created_by`/`updated_by` User FK pseudonymization is safe. Posts retain `author_role_snapshot` which does not leak identity post-pseudonymization. | PASS |
| Internal Comment Post | Post author deprovisioned | `author_id` pseudonymized; `body` remains (business artifact); `mention_count` unaffected. ⚠ If `body` contains the departing user's own PII self-reference, DSAR requires content-level redaction which the Post spec does not describe. | **FLAG.** The spec does not address DSAR scans of `body` content. |
| Internal Comment Mention | Mentioned user deprovisioned | `mentioned_user_id` pseudonymized; row preserved for audit. `expanded_from_team_id` stable. | PASS |
| Presence Record | Ephemeral | Evicts within 60s; DSAR never needs to touch it (as stated). | PASS |
| Unread Marker | User deprovisioned | Marker hard-deletes on Workspace Membership loss + 30 days. Delete cascade does **not** leave orphans. | PASS |
| Buyer Referral | Referee email is DSAR subject | `referee_email` pseudonymized; `credit_value_usd`, `stripe_credit_note_ids` retained. **Risk:** if the referee is a natural person using a personal email, the pseudonymization requirement collides with Sarbanes-Oxley retention. The §40.2 row cites "§45.1 financial-record exemption" — but §45.1 is Data Privacy and does not actually enumerate a financial exemption. | **FLAG.** The exemption cited does not appear at the cited location. |
| Pro Trial Seat Grant | Vendor email | Same pattern as Buyer Referral — cites §45.1 financial-record exemption not located there. | **FLAG.** Same defect. |
| Usage Event | User id in event | `user_id` pseudonymized; `properties_json` compacted. ⚠ `properties_json` may embed entity IDs that cross-reference to DSAR subject via a join — the spec says "properties_json values referencing the subject redacted within 30 days" but does not say how the redactor identifies the referencing rows (full scan of JSON? key registry?). | **FLAG.** Mechanism unspecified. |
| Time-Saved Credit | User id | `user_id` pseudonymized; rest retained. | PASS |

**Findings:** Two FLAGs cite a non-existent §45.1 exemption; one FLAG (Usage Event) gives no mechanism for finding DSAR-affected JSON rows. Each is a compliance risk, not a build-stopper, but a GDPR audit would not pass.

**A-DSAR-1 remediation:** Either (a) add the financial-record exemption language to §45.1 explicitly, or (b) cite the actual applicable §40.2 / §6.8 / §45 subsection. Phase 1 writer made a speculative citation that does not resolve.

**A-DSAR-2 remediation:** §4.3.18 Usage Event — specify a `user_ref_keys_json` column (array of JSON paths referencing the subject) or a scheduled-job approach to scan `properties_json` against the DSAR target.

### 2.3 Soft-delete cascade compatibility across FKs

For each new FK, whether the target's soft-delete semantics cause orphans.

| FK | Target | Target soft-delete | Orphan risk |
| :--- | :--- | :--- | :--- |
| Thread.workspace_id → Workspace | §4.3.1 | Yes (`deleted_at`) | Thread retention: "Life of parent entity; on parent soft-delete, cascade soft-delete + 30-day purge." Covered. |
| Thread.attached_to_id → Use Case / Requirement / Response / Scenario / Selection Report Draft | Various | Most soft-delete; Selection Report Draft has no entity | **ORPHAN.** `attached_to_type = selection_report_draft` FKs to a non-entity; soft-delete of a "Selection Report Draft" (whatever that is) has no defined cascade. |
| Post.thread_id → Thread | §4.3.11 | Cascades | PASS |
| Mention.post_id → Post | §4.3.12 | Cascades (Mention.deleted_at note: "cascades from Post soft-delete") | PASS |
| Mention.mentioned_user_id → User | §4.2.3 | User is "deprovisioned" not soft-deleted; preserved | PASS |
| Mention.expanded_from_team_id → Team | §4.2.4 | Team has `deleted_at` | **ORPHAN RISK.** Team hard-delete or soft-delete behavior on Mention is unspecified. If a Team is soft-deleted, frozen Mention rows continue to reference it; if a future reader dereferences the Team to re-render the Mention card ("Expanded from team 'Eng Leadership'"), the render path may return stale or 404. |
| Unread Marker.thread_id → polymorphic | Thread / Q&A / Inbox Item Group | Mixed; Inbox Item Group has no entity | **ORPHAN.** As noted in S-2, the Inbox Item Group "entity" does not exist to soft-delete in the first place. |
| Buyer Referral.referee_org_id → Organization | §4.2.1 | Yes | **ORPHAN RISK.** If the referee Org is deleted 7 years into Buyer Referral retention, the FK becomes stale. The retention policy retains the referral indefinitely but does not describe what the rendered "referee organization" looks like when the Org row is hard-purged. Pseudonymization of `referrer_user_id` is covered; referee Org purge is not. |
| Pro Trial Seat Grant.issuing_workspace_id → Workspace | §4.3.1 | Yes | **ORPHAN RISK.** Grant outlives Workspace (7-year retention). Render path on grant history dashboard may not resolve. |
| Pro Trial Seat Grant.issuing_target_account_id → Target Account | Phantom | n/a | **ORPHAN.** Same as S-4. |
| Pro Trial Seat Grant.buyer_org_id / vendor_org_id → Organization | §4.2.1 | Yes | **ORPHAN RISK.** Same 7-year lag risk as Buyer Referral. |
| Usage Event.workspace_id → polymorphic | Workspace / Bid Workspace | Both soft-delete | **ORPHAN RISK.** `workspace_id` is explicitly not FK-enforced; app-layer validation at write only. Read-time references after soft-delete / hard-purge dangle. 24-month-old events frequently reference purged workspaces. |
| Usage Event.capability_id → Capability Declaration | §4.4.4 | Has `deleted_at` | **ORPHAN RISK.** Capability Declaration deletion leaves orphan usage events. |
| Usage Event.entity_ref_id → polymorphic | 18 types | Mixed | **ORPHAN RISK.** Polymorphic reference without FK enforcement; many types hard-purge before 24 months. |
| Time-Saved Credit.source_event_id → Usage Event | §4.3.18 | No soft-delete on Usage Event | PASS (by convention — Usage Event is append-only until rollup). |
| Time-Saved Credit.workspace_id → polymorphic | Workspace / Bid Workspace | Soft-delete | **ORPHAN RISK.** Same as Usage Event. |

**Findings:** Multiple orphan risks, most clustered around:
1. Polymorphic FKs without enforced target or cascade rules (Thread.attached_to_id, Unread Marker.thread_id, Usage Event.workspace_id and entity_ref_id, Time-Saved Credit.workspace_id).
2. Long-retention rows referencing short-retention parents (Buyer Referral, Pro Trial Seat Grant referencing Org / Workspace / User after 7 years).

**A-FK-1 remediation:** Every polymorphic reference in Phase 1 needs an explicit "stale-reference read semantic." Options:
- **Render placeholder** ("[Workspace deleted]" / "[Capability retired]").
- **Hard purge cascade** (Usage Events referencing a hard-purged capability are rolled up and purged at capability-purge time).
- **Snapshot-at-write** (copy the target's display name onto the event row at write so the render path never dereferences).

Phase 1 picks none of these. Production renderers will throw or 404.

**A-FK-2 remediation:** Buyer Referral and Pro Trial Seat Grant need snapshot fields for `referee_org_name`, `issuing_workspace_name`, etc., or an explicit "rendered with placeholder when parent purged" rule.

### 2.4 Console-scope leakage across the Dual-Console Firewall (§7.2)

For each entity with a `console` field, whether any field can leak across the firewall.

| Entity | Console enforcement | Leak risk |
| :--- | :--- | :--- |
| Thread / Post / Mention | `console = 'buyer'` fixed; seller returns HTTP 404 | PASS — enforcement is textual, but §32 API layer must actually implement this. Placeholder until §32 updates land in a later phase. |
| Presence Record | session-locked to one console; visibility rule enforces | ⚠ **Cross-Org Guest Presence** rule: Org B guest in Org A workspace has `org_id = B`. "Users rendering presence for Workspace Owner/Admin of the hosting Org A see all Presence Records matching that `workspace_id`, regardless of `org_id`." This means Org A's Workspace Owner sees Presence Records with `org_id = B` (the guest's home Org). This is intended — but the leak question is the reverse: does the guest see the Org A members' `org_id`? The spec says guests "see only Presence Records with matching `workspace_id` AND matching `org_id` (their own Org)" — so Org B guest sees only Org B teammates. ✅ PASS. |
| Unread Marker | per-console enum partition | PASS |
| Buyer Referral | buyer-only, implicit | PASS |
| Pro Trial Seat Grant | cross-console by design; dual-projection rule | ⚠ The dual-projection rule says "a single `GET /v1/pro-trial-seats/{id}` endpoint returns different projections depending on the requesting console's org_id relative to `buyer_org_id` and `vendor_org_id`." **Risk:** a buyer who is also a vendor in a different Org could match both sides. The spec does not say which projection wins when `requesting_org = buyer_org = vendor_org` (e.g., Org is both buyer and vendor of Sourcera in different use cases, rare but possible for a reseller). |
| Usage Event | console-filter rule per-session | ⚠ Role gating says "Org Owner, Org Admin, and Billing Admin read all events for that console." Billing Admin is **a Phase 4 role** — at Phase 1 time, the role does not exist. Phase 1 referenced it in §4.3.18 before it was specified. **Chronological defect** but forward-compatible. |
| Time-Saved Credit | inherits Usage Event role gating | Same Billing Admin issue. |

**Findings:**
- **A-FW-1 (LOW).** Billing Admin role name appears in Phase 1 text but the role is authored in Phase 4. Forward-reference is semantically acceptable but Phase 1 should have marked this as a known gap. It was not.
- **A-FW-2 (MEDIUM).** Pro Trial Seat Grant dual-projection rule is ambiguous when the requesting Org is both `buyer_org` and `vendor_org`. This is realistic (vendors that buy software; agencies that both source and sell). Either disallow or define a deterministic tie-breaker.

### 2.5 Enum consumers — orphan values

For each Phase 1 enum, confirm every value has at least one consumer.

| Enum | Orphan values |
| :--- | :--- |
| `internal_comment_thread_status` | All 3 values consumed (state machine references). |
| `internal_comment_attached_to_type` | **`selection_report_draft` orphaned** — no §4 entity to attach to; consumers must 404 at write. |
| `internal_comment_visibility_scope` | All 3 consumed by read-gating. |
| `internal_comment_post_submit_source` | All 5 consumed. |
| `internal_comment_mention_kind` | All 3 consumed. |
| `presence_status` | All 3 consumed. |
| `presence_cursor_color_token` | 8 values; cursor palette wrap-at-9 rule documented. |
| `presence_client_device_class` | All 4 consumed. |
| `unread_marker_thread_type` | **`inbox_item_group` orphaned** — no entity; unused until §29 Inbox is actually built. |
| `unread_marker_suppressed_reason` | All 3 consumed. |
| `referral_status` | All 9 consumed by state machine. |
| `referral_fraud_signal` | All 5 consumed. |
| `referral_forfeit_reason` | All 5 consumed. |
| `referral_invite_channel` | All 4 consumed. |
| `trial_seat_status` | All 10 consumed. |
| `trial_seat_rejection_reason` | All 5 consumed. |
| `trial_seat_outcome` | All 5 consumed. |
| `trial_seat_converted_to_plan` | 4 values; Phase 1 references all. |
| `usage_event_category` | All 14 consumed by rollups. |
| `usage_event_entity_ref_type` | 18 values; 17 map to §4 entities or Phase-1-added entities; `trial_seat_grant` maps to §4.3.17 ✅. **`internal_comment_thread`, `internal_comment_post`** map to §4.3.11/§4.3.12 ✅. `capability_declaration` ✅. `marketplace_listing` ✅. `eoi` ✅. `scenario` ✅. `kb_entry` → KB entity defined in KB_Engineering_Spec, not §4. **`user`, `team`** ✅ §4.2.3/§4.2.4. All have consumers. |
| `usage_event_outcome` | All 7 consumed. |
| `usage_event_user_agent_class` | All 7 consumed. |
| `usage_event_posthog_delivery_status` | All 4 consumed. |
| `time_saved_loaded_hourly_rate_source` | All 3 consumed. |
| `time_saved_reversal_reason` | All 4 consumed. |

**Findings:**
- **A-E-1 (MEDIUM).** `internal_comment_attached_to_type = selection_report_draft` is an orphan — it points at no entity.
- **A-E-2 (MEDIUM).** `unread_marker_thread_type = inbox_item_group` is an orphan — Inbox Item Group is not an entity.

Both orphan enum values should be either removed (with the future phase re-adding them when the target entity exists) or accompanied by a TODO-stub entity in §4.

### 2.6 Additional adversarial findings

**A-X-1 (MEDIUM) — Internal Comment Post `attachment_total_bytes` enforcement.** Field caps at 500 MB. But `attachment_ids` caps at 10 files, each at 50 MB per §39 (and per inline note "10 files, 50MB each"). 10 × 50 MB = 500 MB. If a single attachment is 400 MB (leaving 100 MB for 9 more), the 500 MB cap is binding but the per-file 50 MB cap is not referenced in the Post `Constraints` column. Engineering will have to discover the binding constraint.

**A-X-2 (LOW) — Internal Comment Post `edit_locked_at` race.** Field is "Immutable, = `created_at + 15 min`." But `edited_at` can be set before `edit_locked_at`. If clock skew between client and server is > 15 min, a client might locally believe an edit is allowed while the server rejects. The spec doesn't describe the race response.

**A-X-3 (MEDIUM) — Buyer Referral `credit_value_usd` rounding.** `Decimal(10,2)` with ≤ $2000 cap. Stripe Credit Notes are in cents. The spec does not state whether `credit_value_usd` is stored in dollars or cents. Elsewhere (§4.8 Phase 4) dollar amounts are in "USD cents." This is a Phase 1 / Phase 4 convention collision waiting to happen at the first currency migration.

**A-X-4 (HIGH) — Buyer Referral status state machine ambiguity.** Appendix L is missing (acknowledged Known Gap). The 9 referral_status values have a "suggested" order in the semantics note, but the **legal transitions** are undefined. Specifically: can `credit_issued → credit_expired` fire while `credit_redeemed_usd > 0`? (i.e., partial redemption + time expiry — does the remainder forfeit?) The inline note says "`credit_expired — credit_expires_at passed with residual credit; residual forfeit`" — but that's description, not a state-machine rule. Engineering will have to guess whether `credit_redeemed → credit_expired` is legal.

**A-X-5 (HIGH) — Pro Trial Seat Grant state machine ambiguity.** Same Appendix L gap. 10 status values. Specific ambiguities:
- Can `provisioned → buyer_revoked` fire? (Spec text says "buyer_revoked only before provisioning"; field-level note in `revoked_by_user_id` confirms; enum-level semantics should mirror.)
- Can `in_trial → fraud_blocked` fire? (Spec implies Yes, anytime.)
- `vendor_declined` vs. `auto_downgraded` — can both fire for the same grant? Unclear.

**A-X-6 (MEDIUM) — Usage Event `event_name` registry.** Constraint: "must match Appendix G registry. Enforced at write via enum registry lookup." Appendix G is the PostHog Event Taxonomy. Phase 1 adds no events to Appendix G (known gap), so the registry is essentially the v6.0.0 set. **Any new event_name introduced by Phase 1 (`internal_comment.*`, `buyer_referral.*`, `pro_trial_seat.*`, `usage_event.dlq_threshold_crossed`) will fail the write validator.** Phase 1 delivers entities whose primary write surface will be rejected by the validator because Phase 1 did not update Appendix G. **This is the single most serious Phase 1 defect.**

**A-X-7 (MEDIUM) — Time-Saved Credit `value_saved_usd` rounding.** Constraint: `= minutes_saved / 60 × loaded_hourly_rate_usd, rounded banker's`. Banker's rounding on a financial figure is defensible, but a spec obligation to round at read time vs. write time matters — if stored pre-rounded, sum-of-rounded-values ≠ rounded-sum-of-raw-values. The spec does not say.

**A-X-8 (MEDIUM) — Presence Record `cursor_position` JSON ≤ 500 chars.** Very tight. A single `element_ref` UUID is 36 chars; `x` and `y` ints are up to 10 chars each; JSON braces + quotes add overhead. 500 chars is plenty for 2D cursor, but if Phase 2+ adds multi-element selection bounding boxes, this cap is binding. Not a Phase 1 defect but a ceiling that should be revisited.

**A-X-9 (HIGH) — Unread Marker `unread_count` correctness under soft-delete.** Rule: "Cached count of posts with `created_at > last_read_at`; recomputed on post-insert via Convex subscription." Post soft-delete (`deleted_placeholder = true`) replaces body on read but does the unread_count decrement? The spec is silent. If the user has an unread count of 3 because of 3 posts and the author deletes 1, does `unread_count` go to 2 or stay at 3? Either answer is defensible; not picking one is a defect.

**A-X-10 (MEDIUM) — Internal Comment Thread `plan_quota_counted` enforcement path.** Field exists to exempt system-generated threads from §5.11 caps. But Phase 1 does not define any system-generated thread surface. The field is dead code until a Phase-N consumer exists. If it ships unused, future developers will uncover it and not know whether to respect it. Either remove or forward-reference a consumer.

**A-X-11 (HIGH) — Buyer Referral Referee Exclusivity Rule race window.** Rule: "At the `activated → credit_issued` transition, the system MUST query for any other row with the same `referee_email` already in one of those states." Two referrals for the same `referee_email` racing to `credit_issued` at the same nightly job run will both pass the pre-check and both issue credit. The spec says "enforced at application layer because DB unique constraints on `referee_email` would prevent multiple `pending` rows from coexisting." Correct reasoning, but the atomicity of the check+issue operation is not described. Engineering needs: (a) a row-level advisory lock on `referee_email` during the credit-issue path, or (b) a partial unique index `(LOWER(referee_email)) WHERE status IN ('credit_issued', 'credit_redeemed', 'credit_expired')` that makes the race-losing row fail. Neither is registered.

**A-X-12 (MEDIUM) — Pro Trial Seat Grant `ai_value_consumed_usd` source of truth.** "Running total of AI value-dollars during trial (metered to vendor's AI budget per §34.13.1)." The field is duplicated across this entity and §34 Wallet. Source of truth is not declared; reconciliation drift inevitable. After Phase 4's §4.8 AIOperation / AIWallet authoring, the correct source of truth is AIOperation-sum (§4.8.1); Phase 1 should forward-reference this.

**A-X-13 (MEDIUM) — Usage Event `ip_address_hash` salt versioning.** `SHA-256 hex, 64 chars` — plain-SHA256-of-raw-IP is not irreversible on a small IPv4 keyspace (~4B values, trivially brute-forceable). A peppered hash with a versioned salt is the correct primitive. Spec is silent.

**A-X-14 (LOW) — Time-Saved Credit reversal row convention.** "A reversal row has `minutes_saved = 0` and exists solely to flip `reversed_by_credit_id` on the original row." **Risk:** a reversal row also has its own primary key, created_at, etc. If an Ops user scans rows by `recognized_at DESC` they'll see reversal rows as zero-value "phantom" credits. The UI contract for how reversals render in a user-visible ledger is undefined.

**A-X-15 (MEDIUM) — Presence Record `typing_in_entity_ref` cleanup.** "clears 3s after last keystroke." The mechanism for the clear is unspecified — is it client-sent null, server-side sweep, or Convex presence's own expiry? Different answers have different semantics at disconnect.

---

## 3. KNOWN GAPS

Explicit list of items the Phase 1 log acknowledges, plus items this verification surfaces.

### 3.1 Gaps carried forward from Phase 1 log (unchanged)

- **K-1 Appendix L state machines** — Thread status, Referral status, Trial Seat status all reference Appendix L; Appendix L does not exist. **Adversarial impact: A-X-4, A-X-5, A-X-9 depend on this.**
- **K-2 Appendix I error codes** — `internal_comment_cross_console_access`, `usage_event_console_mismatch`, `referral_duplicate_referee`, `trial_seat_pool_exhausted`, `trial_seat_same_buyer_365d_block`, `trial_seat_vendor_already_paid`, `trial_seat_buyer_below_scale` referenced in Phase 1 text but not added to Appendix I.
- **K-3 Webhook events** — 8+ Phase 1 event names referenced (`internal_comment.thread.created`, `buyer_referral.credit_issued`, etc.) but no Appendix C or G additions.
- **K-4 API endpoints** — Phase 1 entities have no §32 endpoints authored; §32.5 pre-existing Internal Comments API is stale relative to the normalized Post/Mention model.
- **K-5 §5.11 Feature Access Matrix** — Internal Comments 500-thread/workspace cap on Business not reflected.
- **K-6 Organization.default_loaded_hourly_rate_usd** — Time-Saved Credit references an Organization setting that does not exist in §4.2.1.
- **K-7 Loops.so email templates** — 7 new email types referenced, zero templates authored.
- **K-8 `qa_post_mentions` denormalized index** — referenced for Unread Marker Q&A derivation but schema not specified.
- **K-9 Ops Console SIM surfaces for M16 / M17** — entity fields exist; Ops UX does not.
- **K-10 Buyer Referral UI surface** — `/settings/referrals` not authored.
- **K-11 Pro Trial Seat issuer UI** — "Invite with Pro Trial" button not wired into §14 Vendor Curation UX.

### 3.2 New gaps surfaced by this adversarial pass

- **K-V1 (MEDIUM) Dangling polymorphic FKs:** Phase 1 introduces four referential targets that do not exist as §4 entities: **Selection Report Draft**, **Inbox Item Group**, **Target Account**, **Attachment**. Either author placeholder §4 entries now or remove the offending FKs / enum values.
- **K-V2 (HIGH) Missing Appendix G event-taxonomy entries block write path:** Any Usage Event emitted with a Phase-1-introduced `event_name` will fail validation because the registry was not updated. Ship-blocker for any Phase-1-entity UX.
- **K-V3 (HIGH) Missing indexes:** four composite / partial / GIN indexes referenced in adversarial check §2.1 are not registered. Production incidents inevitable at scale.
- **K-V4 (MEDIUM) Missing DSAR mechanisms:** §45.1 "financial-record exemption" cited at two §40.2 rows does not exist at §45.1; Usage Event `properties_json` DSAR mechanism unspecified.
- **K-V5 (MEDIUM) Author Role Snapshot composite enum:** Not registered in Appendix J; violates Authoring Convention #3.
- **K-V6 (MEDIUM) Parent-purge renderer contracts:** Long-retention Phase 1 entities (Buyer Referral, Pro Trial Seat Grant, Usage Event, Time-Saved Credit) outlive Organization / Workspace / Capability parents; no snapshot or placeholder contract for renderer dereference post-purge.
- **K-V7 (MEDIUM) Referee-exclusivity race:** Atomic check-and-issue mechanism not specified; unique partial index not registered.
- **K-V8 (LOW) Currency unit convention collision:** Phase 1 Decimal(10,2) USD vs. Phase 4 integer USD-cents. Phase 1 precedes Phase 4 chronologically; Phase 4's convention should retroactively apply.
- **K-V9 (LOW) IP hash salt versioning:** `ip_address_hash` is unsalted SHA-256; brute-force reversible. Add pepper + version field.
- **K-V10 (LOW) Unread count semantics under soft-delete:** Undefined decrement behavior.

These gaps are additionally appended to `RECONCILIATION.md → Known Gaps → Phase 1 (adversarial verification)` on save.

---

## 4. SIGN-OFF CRITERIA

### 4.1 Blocking findings (must resolve in Phase-1 re-work before v7.0.0 ship)

| ID | Severity | Description | Remediation |
| :--- | :--- | :--- | :--- |
| A-X-6 / K-V2 | HIGH | Phase 1 Usage Events cannot be emitted because Appendix G taxonomy was not updated. | Either (a) extend Appendix G with all Phase 1 event_names inside the Phase 1 scope, or (b) author a temporary "unregistered event passthrough" allowance in §4.3.18 until Phase 4+ authoring lands. |
| A-X-4 / A-X-5 / K-1 | HIGH | Referral and Trial Seat state machines are incomplete. Engineering cannot implement transitions. | Author Appendix L state machine tables for Thread, Referral, Trial Seat. Phase 1 log already flagged this; the verification escalates it from Known Gap to ship-blocker because without transitions, the entity is not implementable. |
| S-2 / S-3 / S-4 / S-5 / K-V1 | MEDIUM → HIGH (aggregated) | Four dangling polymorphic FKs. | Author placeholder entities for Selection Report Draft (§4.3.N), Inbox Item Group (§4.3.N+1), Target Account (§4.3.N+2), Attachment (§4.6.2). Placeholder = minimal field table with `id`, `org_id`, `created_at`, `deleted_at`, + a "forward-referenced" note pointing to the later phase that fleshes it out. |
| A-Q1 / K-V3 | HIGH | Four missing indexes; two critical (exclusivity-rule enforcement and 365-day block enforcement) are O(n) full-scans at scale. | Register in §4.3.11 / §4.3.16 / §4.3.17 / §4.3.18 / §4.3.19 index lists. |
| A-X-11 / K-V7 | HIGH | Referee-exclusivity race has no atomic mechanism. | Add the partial unique index `(LOWER(referee_email)) WHERE status IN (…)` OR a database-level advisory lock path. |

### 4.2 Non-blocking findings (may defer with named phase + owner)

All other findings (S-1, S-6 – S-9, A-FW-1 – 2, A-X-1 – 3, A-X-7 – 10, A-X-12 – 15, A-DSAR-1 – 2, A-FK-1 – 2, A-E-1 – 2, K-V4 – 10 and K-2 – K-11 from the Phase 1 log) may defer **provided** each is added to RECONCILIATION.md Known Gaps with a named later phase and owner.

Phase 1 log already names these owners (all "Integration program"). For Phase 2 / Phase 3 / Phase 4 retroactive work (already completed), their resolutions should be back-audited to close any Phase 1 gap the later phases incidentally resolved.

### 4.3 Sign-off recommendation

**PHASE 1 DOES NOT MEET SIGN-OFF CRITERIA AS AUTHORED.** Zero structural defects is not achieved — four dangling-FK findings (S-2, S-3, S-4, S-5) are structural; five HIGH-severity adversarial findings (A-X-4, A-X-5, A-X-6, A-X-11, A-Q1 aggregate) are either ship-blockers or require authoring that was not done in Phase 1.

**However**, because the integration program is currently at Phase 4 mid-execution, and because the verification protocol permits deferral to a named later phase with rationale, I recommend:

**Option A (RECOMMENDED): Targeted Phase-1 rework as a Phase 1.5 patch, scope-limited to:**
1. Author placeholder §4 entries for Selection Report Draft, Inbox Item Group, Target Account, Attachment (minimal rows with forward-references to future fleshing).
2. Extend Appendix G with Phase-1 event_names.
3. Author Appendix L state machines for Internal Comment Thread, Buyer Referral, Pro Trial Seat Grant.
4. Register the five missing indexes in §4.3.11 / §4.3.16 / §4.3.17 / §4.3.18 / §4.3.19.
5. Register the partial unique index for referee exclusivity.
6. Fix the non-existent §45.1 financial-record exemption citation in §40.2.

Estimated scope: ~400–700 lines of spec additions; ~2–4 hours of Opus-grade authoring.

**Option B: Defer everything to an explicit Phase 13 ("hardening") with a named owner and acceptance-test gate at ship time.** Acceptable only if leadership signs off on shipping with the ship-blockers flagged in user-facing feature-gating (Internal Comments, Referrals, Pro Trial Seats not available at GA).

**STOP condition triggered? No.** The findings here are resolvable within Phase 1.5; they do not require re-running Phase 0 scaffolding or baseline re-snapshot. Phase 2 / 3 / 4 authoring remains valid and does not need to unwind.

**Remediation plan for Option A (if approved):**

```
Phase 1.5 — Targeted remediation
├─ Prompt 1.5.1: Author §4.3.N placeholder entries for Selection Report Draft, Inbox Item Group (new §4.7.3), Target Account (new §4.3.N), Attachment (§4.6.2).
├─ Prompt 1.5.2: Extend Appendix G with 11 Phase-1 events (internal_comment.*, buyer_referral.*, pro_trial_seat.*, usage_event.dlq_threshold_crossed).
├─ Prompt 1.5.3: Author Appendix L state machines for Thread status (3 states), Referral status (9 states), Trial Seat status (10 states).
├─ Prompt 1.5.4: Register 5 missing indexes + 1 partial unique index. Update §4.3.11 / §4.3.16 / §4.3.17 / §4.3.18 / §4.3.19.
├─ Prompt 1.5.5: Fix §45.1 citation; author the financial-record retention exemption at §45.1 or re-cite the correct section.
└─ Verification re-run: PHASE1_VERIFY pass 2.
```

Do not advance to Phase 5 until Phase 1.5 is applied or explicitly deferred by leadership.

---

**End of PHASE1_VERIFY.md.**
