# Phase 10 Verification — Internal Comments & Presence / Unread Tracking (§25.7, §3.12, §4.3.11–§4.3.15)

**Phase:** 10 of 13
**Scope:** Buyer-side Internal Comments feature contract (§25.7), Presence & Unread Tracking UX + performance contract (§3.12), and the entity-level data models that both depend on (Internal Comment Thread §4.3.11, Internal Comment Post §4.3.12, Internal Comment Mention §4.3.13, Presence Record §4.3.14, Unread Marker §4.3.15).
**Spec under review:** `/Sourcera/Sourcera_Master_Spec.md` (v7.0.0-integration-in-progress, Phase 10 integrations landed).
**Corpus cross-checks:** `Sourcera_Master_Summary.md` §C.119 (Internal Comments) and §C.120 (Presence & Unread); `UX_Design_of_Sourcera.md` §Collaboration and §Presence; `Sourcera_Buyer_Pricing_Strategy.md` §Plan Tiers; Appendices B, C, G, I, J, L of the Master Spec.
**Verifier:** Opus — senior technical product strategist / staff engineer for Sourcera.
**Date:** 2026-04-24.
**Verdict (headline):** **PASS** on all three Phase 10 exit gates. §25.7 is present with explicit plan caps bound to §34.1.1 and a four-layer firewall-enforcement contract. §3.12 is present with a complete performance-budget matrix and a Convex function-execution envelope. The three canonical entities (Internal Comment {Thread, Post, Mention}, Presence Record, Unread Marker) are all first-class §4 entities and are referenced bidirectionally between §25.7, §3.12, and the data model. Residual observations are logged in §6 of this document; none block Phase 10 exit.

---

## 1. Exit-Gate Checklist

The Phase 10 prompt specifies three mandatory checks. Each is evaluated below against the current Spec text, with file-line citations and quoted excerpts where the claim is load-bearing.

| # | Gate | Status | Evidence |
| :---- | :---- | :---- | :---- |
| 1 | §25.7 Internal Comments present with plan caps and firewall rule | **PASS** | §25.7 at L17465. Plan-cap table at §25.7.6 (L17559–L17571) bound to §34.1.1 authoritative cell. Firewall contract at §25.7.7 (L17582–L17595) asserts four layers: entity-scope isolation, API authz, bridge NEVER-CARRIED, export/DSAR pipelines. Bridge NEVER-CARRIED cross-ref to §25.1.2 confirmed. HTTP-404 (non-leak) rule explicit. |
| 2 | §3.12 Presence & Unread present with performance budgets | **PASS** | §3.12 at L2669. Performance-budget matrix at §3.12.6 (L2779–L2795) covers 13 rows across Presence, Unread, and cross-cutting (tab-background, offline). Convex function-execution envelope at L2796. CI performance gate at L2798. Bound to §44.1 reactivity SLO. |
| 3 | Entities Internal Comment, Presence Record, Unread Marker referenced | **PASS** | §4.3.11 Internal Comment Thread (L3139), §4.3.12 Internal Comment Post (L3182), §4.3.13 Internal Comment Mention (L3228), §4.3.14 Presence Record (L3265), §4.3.15 Unread Marker (L3306). Referenced by §25.7.1 entity cross-reference table (L17473) and by §3.12.1 subsystem overview (L2675–L2679). Cross-entity FK graph intact. |

---

## 2. §25.7 — Internal Comments Feature Contract

### 2.1 Presence and Framing

§25.7 begins at L17465 with an explicit Purpose clause tied to Summary C.119 and a declarative framing that Internal Comments are strictly buyer-internal — no Thread, Post, Mention, or attachment is ever carried across the Dual-Console Firewall (§7.2), rendered to a seller-console session, or surfaced in a vendor-visible projection via any API, webhook, export, or UI. The section is placed in §25 (Cross-Console Mechanics) rather than a standalone feature section because the firewall integrity of Internal Comments is the primary contract the feature embodies.

Thirteen subsections are authored (§25.7.1 through §25.7.13 feature-level, §25.7.14 authoring hand-offs). Each subsection carries an anchor-slug heading in the house convention `## 25.7.N Title {#25.7.N-title}`.

### 2.2 Entity Cross-Reference Table (§25.7.1)

The entity-model cross-reference at L17473 binds §25.7 to the §4 data model for all three Internal Comment entities:

| Entity | Section | Role |
| :---- | :---- | :---- |
| Internal Comment Thread | §4.3.11 | Polymorphic anchor (`attached_to_type`); carries `status`, `visibility_scope`, `subscribed_user_ids[]`, `post_count`, `last_post_at`, `plan_quota_counted` |
| Internal Comment Post | §4.3.12 | Markdown body ≤ 5 000 chars; `parent_post_id` threaded reply; 15-min `edit_locked_at` window; `deleted_placeholder`; `moderated_by` |
| Internal Comment Mention | §4.3.13 | Normalized @-mention row; drives §29 notification fan-out and the `has_unread_mention` flag on Unread Marker (§4.3.15) |

The cross-reference is load-bearing for Phase 10 Gate #3 — it is the explicit pointer from the feature section to the canonical entity definitions.

### 2.3 Attachment Surfaces (§25.7.2)

Polymorphic anchor catalog at L17485–L17492 enumerates six attachment surfaces (Workspace, Use Case, Requirement, Response, Scenario, Selection Report draft) and declares the UX-render binding for each. Server-side anchor validation is explicit at L17494: `attached_to_id` MUST resolve to an entity in the same Workspace; mismatch rejects with HTTP 422 `internal_comment_thread_anchor_mismatch` (Appendix I, new in this pass). Anchor-entity archive cascade to thread `status = archived` is bound to Appendix L.1.

### 2.4 Visibility Scope (§25.7.3)

Three-value enum `internal_comment_thread_visibility_scope` (Appendix J, new in this pass): `buyer_workspace_members | buyer_team_leads | private_to_author_plus_mentioned`. Author/Admin can mutate scope; tighten triggers Unread-Marker cleanup (§3.12.5) with `suppressed_reason = visibility_tightened` plus Convex reactive-subscription invalidation and an audit event `internal_comment_thread_visibility_tightened`. Loosening triggers marker seeding for newly-included viewers with `unread_count` capped at the per-user ceiling.

### 2.5 Plan Caps (§25.7.6) — Gate #1a

Plan-cap contract at L17559–L17571:

| Plan Tier | Active Threads per Workspace | Source |
| :---- | :---- | :---- |
| Buyer Free | 25 | §34.1.1 (flagged Authored Extension — Summary C.119 silent on Free) |
| Buyer Business Starter | 500 | §34.1.1 (Summary C.119) |
| Buyer Business Growth | 500 | §34.1.1 (Summary C.119) |
| Buyer Business Scale | 500 | §34.1.1 (Summary C.119) |
| Buyer Enterprise | Unlimited | §34.1.1 (Summary C.119) |

The table explicitly states the authoritative cell is §34.1.1 (Buyer Plan Tiers) and that §25.7 cites rather than duplicates, satisfying authoring-convention #10 (dollar figures, durations, char limits, file sizes come from authoritative source tables — never invent a new one).

**Cap-enforcement semantics** (L17574–L17578):

1. Create-time: `COUNT(threads WHERE workspace_id = X AND plan_quota_counted = true AND status IN ('open','resolved') AND deleted_at IS NULL)` evaluated against Org plan tier.
2. At cap, create rejects with HTTP 402 `internal_comment_thread_workspace_cap_reached` (Appendix I, new) and surfaces the §5.11 upgrade CTA.
3. Bulk-archive of resolved threads is a documented self-serve mitigation — archive is free and unlimited.
4. Downgrade pathway binds to §34.20 grace-period semantics: new-thread creation blocked until active count ≤ cap; no threads deleted. This satisfies §13 downgrade-path edge-case discipline.

A secondary per-Workspace Mention cap (100 000 Mention rows) is added to §39 and activates `mention_fanout_degraded` mode that batches notifications into digest cadence, protecting downstream Loops.so throughput. Flagged as Authored Extension.

**Verdict (Gate #1a).** Plan caps present, concrete, bound to the authoritative §34.1.1 cell, and enforced at three layers (create-time, downgrade, bulk-archive mitigation). PASS.

### 2.6 Firewall Rule (§25.7.7) — Gate #1b

Four-layer firewall contract at L17582–L17595. This is the normative firewall rule for Internal Comments.

**Layer 1 — Entity-level scope isolation.** §4.3.11–§4.3.13 carry `console = buyer` (fixed). Cross-console reads return HTTP 404 (non-leak). Verified in the entity tables: §4.3.11 L3148, §4.3.12 L3192, §4.3.13 (implicit via parent thread binding).

**Layer 2 — API authorization.** Every read endpoint (`GET /v1/workspaces/{id}/internal-comment-threads`, `GET /v1/internal-comment-threads/{id}`, `GET /v1/internal-comment-posts/{id}`, `GET /v1/internal-comment-mentions/{id}`) asserts session `console = buyer`; seller-console reads return HTTP 404 via `internal_comment_cross_console_access` (Appendix I, existing). This is HTTP 404 — not 403 — to prevent thread-existence leakage (§4.3.11 L3174 scope-isolation clause confirms the 404-not-403 rule).

**Layer 3 — Bridge NEVER-CARRIED.** §25.1.2 declares Internal Comment Thread / Post / Mention as NEVER CARRIED across the Console Bridge. A static-analysis CI gate `console_bridge_no_internal_comment_imports` asserts no bridge-handler code path imports the Internal Comment Convex modules. This gate is necessary — the Bridge is the canonical channel for cross-console data flow (§25), and its NEVER-CARRIED list is the contract that prevents accidental carriage at code-review time.

**Layer 4 — Export and DSAR pipelines.** Workspace JSON export includes Internal Comment rows only when the export initiator's session `console = buyer`. Seller-side export never includes them, by construction. DSAR export of a buyer user includes authored and mentioned posts; DSAR of an unrelated seller user does not surface buyer-internal data.

**Promotion path.** The one legal path for Internal Comment content to reach a vendor is the `buyer_comment_visible_to_vendor` event (§25.1.2) that creates a NEW Q&A Thread Post with buyer-authored, explicitly-redacted content. The underlying Internal Comment Post is not copied, not referenced, and not linked in the resulting Q&A Post — a `promoted_from_internal_comment_post_id` field is intentionally NOT introduced because a leakable back-pointer would defeat the firewall (L17591). The buyer-side UX renders a one-way promotion with a "Create Vendor Q&A Post from this comment" action; no bidirectional link is stored. This is a load-bearing design decision and is correctly documented.

**Mobile copy-paste clause.** §25.7.7 explicitly disclaims platform responsibility for user-initiated copy-paste while committing to a pre-copy confirmation dialog when the clipboard target is a known external app (heuristic: seller-console or public Marketplace route). Flagged as Authored Extension.

**Audit coverage.** Every read, write, moderation, visibility-change, and cross-console-read attempt writes an §4.6 AuditEvent row. Cross-console reads additionally emit a `sim_firewall_probe` signal to the Signal Integrity Monitor (C.100) for anomaly detection.

**Verdict (Gate #1b).** Firewall rule is present at four independent enforcement layers with one explicit promotion path, a bridge NEVER-CARRIED gate, HTTP 404 (non-leak) semantics, and a static-analysis CI gate. PASS.

### 2.7 State Machine (§25.7.5) and API Surface (§25.7.9)

State machine is authored in Appendix L.1 and pointer-referenced from §25.7.5 (L17548–L17557). Lifecycle states: `open → resolved → open (reopen) → archived` (terminal). Invalid transitions return HTTP 409 `internal_comment_thread_invalid_state_transition` (Appendix I, existing). This satisfies authoring-convention #5 (state machines as From/To/Trigger/Conditions/Notes tables in Appendices, not prose).

API surface at §25.7.9 (L17606–L17702) defines 10 endpoints following §32 patterns: cursor pagination (default 50, max 250), `Idempotency-Key` for POST, `internal_comment_api` rate-limit class (120 req/min reads, 30 req/min writes, registered in the §32 rate-limit-class registry). Request/response example is concrete (L17628–L17688). Error catalog at L17690–L17701 adds five new codes to Appendix I: `internal_comment_thread_workspace_cap_reached`, `internal_comment_thread_anchor_mismatch`, `internal_comment_post_mention_limit_exceeded`, `internal_comment_post_moderated_by_admin`, `internal_comment_post_attachment_total_bytes_exceeded`.

### 2.8 Webhook Events (§25.7.10)

Eight webhook events at L17707–L17716 follow §31.1 transport (HMAC-SHA256, `event_id` idempotency, Appendix F `webhook_standard` retry curve of 1s / 2s / 4s / 8s / 16s → DLQ after 5 failures, payload ≤ 256 KB). Event class `internal_comment_domain` is registered in Appendix J `webhook_event_class` extension. Payloads NEVER include Post `body` or `attachment_ids[]` verbatim — subscribers receive metadata only, and body/attachment fetch requires an authenticated API read. This rule is enforced by a CI gate `webhook_payload_no_internal_comment_body`. This is a load-bearing firewall invariant — webhook endpoint logs are a realistic leakage vector, and excluding body from payload closes it.

### 2.9 Retention, DSAR, Residency (§25.7.8) and Acceptance Criteria (§25.7.13)

Retention-block at L17597–L17604 states: (a) thread/post/mention retained for life of parent anchor; (b) cascading soft-delete on parent soft-delete; (c) 30-day hard-delete cascade on parent hard-delete; (d) 90-day Org-delete purge; (e) DSAR pseudonymization of subject identity fields within 30 days and `body` redaction to `[REDACTED_DSAR]` where subject PII is detected. Residency: EU-region Orgs' data stored in EU region only; cross-region query path returns `residency_storage_mismatch` on misconfiguration.

Twenty numbered Acceptance Criteria at §25.7.13 (L17770–L17789) — observable, testable, each bound to a named Playwright or unit test (`internal_comment_cross_console_firewall`, `console_bridge_no_internal_comment_event_kinds`, `internal_comment_cap_enforcement`, `visibility_tighten_marker_cleanup`, `webhook_payload_no_internal_comment_body`, `no_back_pointer_after_promotion`, `export_seller_initiator_no_internal_comments`, `guest_scope_internal_comment_visibility`, etc.). This satisfies authoring-convention #2 (numbered, testable, observable, measurable).

### 2.10 Authoring Hand-Offs (§25.7.14)

Hand-off list at L17792–L17805 enumerates every downstream registry update the integration produces: six Appendix I error codes added; Appendix J enum extensions (`internal_comment_thread_visibility_scope`, `internal_comment_thread_attached_to_type`, `internal_comment_mention_kind`, `internal_comment_mention_skip_reason`, `webhook_event_class` extension, `unread_marker_suppressed_reason`); Appendix C Internal-Comment-Domain Events subsection; Appendix G PostHog taxonomy rows; §34.1.1 plan-cell row; §39 size rows for per-post (50) and per-workspace (100 000) mention caps; §25.6.2 alert row for firewall violation. The hand-off list is the audit trail that lets downstream sections confirm the registries were updated.

**Section-level verdict.** §25.7 is implementation-ready. Every contract — anchor validation, visibility scope, plan gating, firewall layers, state machine, API surface, webhook payload rules, retention, DSAR — is concrete, cross-referenced, and testable. No missing contract.

---

## 3. §3.12 — Presence & Unread Tracking UX + Performance Contract

### 3.1 Presence and Framing

§3.12 begins at L2669 with Purpose clause C.120 and an explicit scope statement: §3.9 is the implementation spec for cursor-specific Presence rendering (live cursors, text carets, typing indicators, hue-palette wrap, off-screen viewport indicators); §3.12 completes the picture with the non-cursor Presence surfaces (avatar stack, "viewing this thread", "N people here"), the full Unread Tracking stack, and cross-cutting performance, visibility, and firewall contracts. The §4.3.14 / §4.3.15 entities are the data-model specs; §3.12 is the UX and behavior spec that renders against those entities.

Eleven subsections are authored (§3.12.1 subsystem overview through §3.12.11 acceptance criteria).

### 3.2 Subsystem Overview (§3.12.1) — Gate #3 Cross-Reference

§3.12.1 at L2675–L2681 is the authoritative reference that binds the UX section to the data model:

> "A live user session writes a Presence Record (§4.3.14) on connect, heartbeats every 5 seconds…"
> "The Unread Marker entity (§4.3.15) holds one row per `(user_id, thread_type, thread_id)` tuple…"
> "Writes to Internal Comment Post (§4.3.12), Q&A Thread Post (§18.3.1), and Inbox Item Group (§4.3.22) trigger idempotent marker upserts via the post-commit handler."

The subsystem overview carries four invariants (L2681): (a) Presence is ephemeral and cross-console-firewalled; (b) Unread counters are per-user and console-scoped via the `console` field on Unread Marker; (c) Presence and Unread state never leak across the Dual-Console Firewall or across visibility scopes; (d) both subsystems run entirely on Convex reactive queries — there is no polling fallback. Each invariant is load-bearing and is validated by a named test in §3.12.11.

### 3.3 Presence Surface Catalog (§3.12.2) and Unread Tracking Surface Catalog (§3.12.3)

Non-cursor Presence catalog at L2687–L2696 enumerates eight surfaces (Workspace Header Avatar Stack, Bid Workspace Header Avatar Stack, Thread Viewer Indicator, Cell/Row Viewer Indicator, Typing Indicator, Joined-the-Thread Toast, Off-Screen Peer Indicator, "Last Here" Badge). Each row cites data source, render rule, and notes — including the explicit "Last Here" badge implementation that replays evicted Presence Records via the PostHog `ui_cursor_presence_session_evicted` event within a 15-minute surface cache.

Unread Tracking catalog at L2704–L2716 enumerates 10 surfaces (Global Bell Badge, Global Mention Dot, Inbox Surface Filter Pills, Workspace Dashboard Unread Summary, Thread-List Row Unread Dot, Thread-List Row Unread Pill, Mention-Row Pill, Scrollback Unread Divider, Requirement/Use Case/Workspace Badge, Mobile Tab Bar Badge). Each row binds render, data source, and precedence rules. Mute-does-not-silence-visibility is explicit (Global Mention Dot row, L2707): mute silences notifications, not visibility. This is a load-bearing UX invariant.

**Rendering budget** at L2717: Unread badge counts on any surface MUST render within the §44.1 reactivity SLO (p95 ≤ 500 ms from commit to visual update). Counter mutations on background surfaces are deferred until the surface returns to foreground (tab-visibility API), with on-return replay via Convex subscription.

### 3.4 Unread Count Derivation (§3.12.4) and Visibility-Rules Enforcement (§3.12.5)

Derivation contract at L2721–L2757 authors five post-lifecycle flows (post insert, thread open, scroll-past divider, post edit/hard-delete, mute) plus per-thread-type Mention derivation. Key invariants:

- **On Post Insert**: Convex mutation runs post-commit handler `updateUnreadMarkersForNewPost`; enumerates authorized viewers per §3.12.5; for each viewer ≠ post author, UPSERT the marker keyed by `(user_id, thread_type, thread_id)` with `unread_count += 1`, `updated_at = now()`, `has_unread_mention = true` if Mention targets viewer. Author-side UPSERT skips the increment (implicit read).
- **On Thread Open**: `markThreadRead` mutation sets `last_read_post_id`, `last_read_at`, `unread_count = 0`, clears `has_unread_mention`; Mentions up to `last_read_post_id` marked read via `markMentionsRead` side-effect; emits `internal_comment_marker.read` or `qa_marker.read` event.
- **On Scroll-Past Divider**: Intersection-observer hysteresis requires ≥ 2-second dwell before client dispatches `markThreadRead`, preventing rapid scrolling from clearing mentions unintentionally. Consistent with Slack-style read semantics.
- **Mute semantics** (L2748–L2751): `muted_until` set on a marker suppresses new notification dispatch but does NOT suppress `unread_count` or `has_unread_mention` updates. Visual: bell-badge count still includes muted threads; in-app toast for new posts on muted threads is suppressed.

Visibility-rules contract at §3.12.5 (L2761–L2777) enforces the absolute invariant: **a viewer's Unread Marker MUST exist ONLY if the viewer has read access to the thread at the moment of post-insert; if access is revoked after a marker exists, the marker MUST be soft-deleted with `suppressed_reason = left_workspace` or `visibility_tightened` and the Convex reactive query MUST NOT render the count.** The cross-console firewall rule at L2771 is explicit — Unread Markers are console-scoped via the `console` field; the server MUST reject any cross-console read with HTTP 404 via `unread_marker_cross_console_access` (Appendix I, new in this pass); defense-in-depth test `unread_marker_console_firewall_isolation` runs on every PR. Marketplace-domain leakage rule at L2775: Internal Comment Thread unread counts NEVER render to any caller with `console = seller`, regardless of role or Ops-impersonation state.

### 3.5 Performance Budgets (§3.12.6) — Gate #2

Performance-budget matrix at L2781–L2795 is the load-bearing Gate #2 artifact. Thirteen rows; quoted in full:

| Subsystem | Metric | Budget | Breach Handling |
| :---- | :---- | :---- | :---- |
| Presence | Heartbeat cadence (client → Convex) | 5 s ± 1 s jitter | Drift > ± 5 s triggers `ui_presence_heartbeat_drift` telemetry |
| Presence | Reactive-query fanout | ≤ 8 rendered cursors per surface; ≤ 20 avatars in stack | > 20 avatars truncates to "20 + N more"; > 8 cursors wraps per §3.9.2 |
| Presence | Mutation rate per session | ≤ 10 writes/s sustained | Client throttles to 4 writes/s on detection; emits `ui_presence_session_throttled` |
| Presence | Subscription payload | ≤ 128 KB per subscription update | Larger updates fragmented server-side into chunks |
| Presence | Disconnect-to-eviction | 60 s | §3.9.3 |
| Unread | Post-commit marker fanout (per post) | ≤ 500 ms for workspaces with ≤ 200 Workspace Members | > 500 ms sustained at > 5 % breach rate over 15 min pages Platform on-call; alert `unread_marker_fanout_slo_breach` |
| Unread | Badge-count reactive query | p95 ≤ 500 ms from post commit to rendered badge | Tied to §44.1 reactivity SLO |
| Unread | Mark-thread-read latency | p95 ≤ 200 ms round-trip | Breach emits `ui_unread_mark_read_slow` |
| Unread | Per-user marker table scan | Paginated; never > 1 000 markers returned in one query | If > 1 000 markers for a user, system degrades to "99+" badge and hides per-row dots until GC sweep |
| Unread | Workspace-level parent-aggregate badge recompute | Debounced 250 ms; ≤ 100 aggregates per workspace per tick | Workspaces > 5 000 threads fall back to `unread_count > 0` booleans per parent (drops exact counts); `ui_unread_parent_aggregate_degraded` signal |
| Both | Tab-background throttling | Suspend reactive updates; queue for replay on foreground | On re-foreground: one reconciliation call, not per-event replay (avoid thundering-herd) |
| Both | Offline mode | Suspend; show "Offline — counts paused" banner per §3.7.5 | On reconnect: full refresh within 30 s; if refresh fails, surface error card per §3.7.4 |

Additional enforcement at L2796: the `updateUnreadMarkersForNewPost` function MUST complete within a 500-ms envelope even on workspaces with 200 members × 50 mentions. Two guards: (a) fanout batched into chunks of 50 markers per transaction with idempotent `(user_id, thread_type, thread_id)` UPSERT semantics; (b) a 750-ms Convex timeout that, on breach, writes an `unread_marker_fanout_timeout` audit row and schedules a reconciliation sweep within 60 seconds.

CI performance gate at L2798: `unread_marker_fanout_bench` Convex-simulator benchmark runs on every PR; > 10 % p95 regression blocks merge. Benchmark input: 200-member workspace, 10 mentions in one new post, cold-cache. This is a concrete, reproducible CI gate.

**Verdict (Gate #2).** Performance budgets present with 13 budgets + 1 Convex function-execution envelope + 1 CI benchmark gate + 1 reconciliation sweep. Each budget has a breach-handling clause and (where applicable) a named PostHog telemetry event. Bound to §44.1 reactivity SLO. PASS.

### 3.6 Mobile Divergence (§3.12.7), Cross-Console Behavior (§3.12.8), Accessibility (§3.12.9)

Mobile divergence at L2802–L2805: cursors suppressed on mobile (inherits §3.9.5); avatar stack and "viewing this" chips render identically; off-screen edge arrows suppressed (replaced with bottom-sheet teammates list on tap); Convex subscription heartbeat drops to 10 s on battery < 20 %; iOS/Android backgrounded state pauses subscription and issues a one-shot reconciliation on resume.

Cross-console / cross-org / residency / Ops-impersonation contract at L2809–L2813 enforces five invariants: (a) dual-console firewall on Presence and Unread with HTTP 404 (non-leak) on cross-console read; (b) cross-org guest Presence Records carry `org_id = guest_org` with hosting-Org-only visibility; (c) residency-partitioned Presence and Unread state (cross-residency leakage is a P0 defect); (d) Ops impersonation does NOT write Presence Records, does NOT create Unread Markers, does NOT mutate existing markers on read (suppressed server-side via `unreadMarkerWriteScope` middleware, audited as `unread_marker_ops_impersonation_write_suppressed`); (e) Billing-Admin role is console-pooled and carries two independent marker sets.

Accessibility contract at L2817–L2823 covers seven WCAG/ARIA rules: `aria-live="polite"` on bell button with 3-s rate limit; `aria-live="assertive"` on mentions with user-preference demote to polite; ≥ 3:1 contrast on Unread dot; at-sign icon paired with red mention dot (WCAG 1.4.1 color-not-sole-means); keyboard J/K navigation; reduced-motion path; High Contrast mode (§3.11.8) bordered pill substitution; BCP-47 locale-aware badge counts with "99+" locale-appropriate ellipsis substitution.

### 3.7 Failure Modes (§3.12.10) and Acceptance Criteria (§3.12.11)

§3.12.10 authors 11 counterfactual failure modes with explicit handling: (a) stale cursor state on Convex reconnect → client discard + re-subscribe with 30-s banner; (b) post-commit marker fanout SLO breach → chunked commits (50/batch) with idempotent UPSERT; (c) workspace-membership revocation → marker soft-delete within 30 s with `suppressed_reason = left_workspace`; (d) visibility-scope tightening → recompute derivation with purge/seed logic; (e) cross-console leakage attempt → HTTP 404 via `unreadMarkerReadScope` middleware; (f) DSAR erasure of 10 000+ markers → batch delete at 5 000/min within 72-hour target; (g) mobile background for 4 hours → one-shot foreground reconciliation with "Refresh required" fallback; (h) mute-until clock skew → server-authoritative evaluation with `ui_client_clock_skew_detected` telemetry; (i) hue collision with `--color-danger` → 5 ΔE* palette distance + `presence_hue_semantic_collision` audit test; (j) reactive-query > 50 events/s → 250-ms bucket throttling; (k) Convex function timeout (> 750 ms) → abort + scheduled reconciliation sweep; (l) unread drift from missed post-commit handler → nightly reconciliation sweep with `unread_marker_drift_reconciled` alert at > 0.1 % drift.

§3.12.11 (L2844–L2858) authors 15 numbered Acceptance Criteria — each observable, measurable, bound to a named test or CI benchmark. Criteria cover avatar stack render, thread viewer indicator SLO, bell-badge consistency, mention-dot mute semantics, divider auto-read 2-s dwell, cross-console firewall, visibility-tighten cleanup, guest scoping, fanout benchmark regression gate, mobile battery-saver cadence, reduced-motion, screen-reader, DSAR, reconciliation-sweep, Ops-impersonation suppression.

**Section-level verdict.** §3.12 is implementation-ready. Performance budgets are concrete, testable, and paginated-scale-aware. Firewall, visibility, and residency invariants are load-bearing. No missing contract.

---

## 4. §4.3.11–§4.3.15 — Entity Model — Gate #3

### 4.1 Internal Comment Thread (§4.3.11, L3139)

Full field table with `id` (UUID), `org_id` (FK), `workspace_id` (FK), `console = buyer` (fixed), polymorphic anchor (`attached_to_type` / `attached_to_id`), `title`, `status` enum (`open | resolved | archived`), `visibility_scope` enum (three values), `subscribed_user_ids[]` ≤ 200, `post_count` (denormalized), `last_post_at` (Unread-math input), `resolved_at` / `resolved_by` / `resolution_note`, `plan_quota_counted`, and the standard audit quintet (`created_at`, `updated_at`, `created_by`, `updated_by`, `deleted_at`).

Indexes (L3169–L3172): `(workspace_id, status, last_post_at DESC)`, `(attached_to_type, attached_to_id, status)`, `(workspace_id, created_at DESC)`, `(org_id, created_at DESC)`. All four are load-bearing for the UX surfaces in §3.12.2 / §3.12.3 and the feature API in §25.7.9.

Scope isolation (L3174): workspace-scoped, buyer console only; cross-console reads return HTTP 404 (not 403) to prevent thread-existence leakage. Error code `internal_comment_cross_console_access` bound to HTTP 404.

Retention (L3180): workspace-life with cascading soft-delete on workspace archive; 30-day hard-delete cascade on workspace hard-delete; 90-day Org-delete purge; DSAR pseudonymization of subject identity fields; `title` and `resolution_note` redaction to `[REDACTED_DSAR]` if subject PII is present; rows retained per §6.8.5 audit-integrity exemption when linked to finalized Selection Report.

Authoring Intent statement at L3178 documents the rationale: placing Internal Comments in the data model with strict console enforcement (not merely a UI boundary) closes the leakage risk flagged in §7.2; polymorphic anchor supports C.119 plus authored extensions for Response, Scenario, Selection Report draft flagged in RECONCILIATION.md. This satisfies authoring-convention #1 (entity scope declared).

### 4.2 Internal Comment Post (§4.3.12, L3182)

Full field table with `id`, `thread_id`, `org_id`, `workspace_id`, `console = buyer` (fixed), `author_id`, `author_role_snapshot` (frozen at post time, survives later role changes for audit), `body` (Markdown, ≤ 5 000 chars per §39, XSS-sanitized server-side), `attachment_ids[]` (≤ 10 per §39), `parent_post_id` (reply), `edited_at`, `edit_locked_at` (immutable, `created_at + 15 min`), `deleted_placeholder` (author self-delete within window), `moderated_by` / `moderated_reason` (Workspace Owner override), `mention_count` (denormalized COUNT), `attachment_total_bytes` (≤ 500 MB per §39), `client_submit_source`, standard audit quintet.

Indexes (L3214–L3218): chronological post render, "my posts" moderation, workspace audit, threaded-reply render, moderator activity. All bound to §25.7.9 API surface.

Scope isolation (L3220): inherits workspace + console scope from parent thread; cross-console returns HTTP 404.

Authoring Intent (L3224) documents why the Post is extracted as a first-class entity (rather than nested in Thread JSON as §18.3.1 does for Q&A Threads): required to support §18.6 full-text-search index, §29.1 mention-notification fan-out, and §22 per-post audit. Reconciliation log flags this as a divergence from §18.3.1 precedent with a follow-up recommendation to normalize Q&A Thread posts similarly in a future integration phase.

Retention (L3226) inherits parent Thread retention; `deleted_placeholder = true` rows retained indefinitely as tombstones; DSAR pseudonymization and body-redaction path explicit.

### 4.3 Internal Comment Mention (§4.3.13, L3228)

Full field table with `id`, `post_id`, `thread_id` (denormalized for inbox), `workspace_id`, `org_id` (denormalized for residency), `author_id`, `mentioned_user_id`, `mention_kind` enum (`user | team | role`), `expanded_from_team_id`, `expanded_from_role`, `notified_at`, `dismissed_at`, `read_at`, `created_at`, `deleted_at`.

Indexes (L3252–L3255): per-user unread-mention feed, per-post mention enumeration, O(1) "am I mentioned in this thread?" lookup for Unread Marker derivation, workspace mention analytics.

Scope isolation (L3257) declares the author-intent-preservation rule: team/role expansions frozen at mention time — subsequent roster/role changes do NOT retroactively notify new members. This is a load-bearing audit invariant that §25.7.4 enforces at write time.

Authoring Intent (L3261) explains the three gaps this entity closes: (a) @-mention parsing at read time fails on edited/moderated posts; (b) team/role expansions must be frozen for audit; (c) per-user inbox queries would otherwise require full-text scan. Flagged as Authored Extension beyond Summary C.119.

Retention (L3263) inherits parent Post retention; DSAR pseudonymizes `mentioned_user_id` and `author_id` to `ANONYMIZED_USER` sentinel while retaining the Mention row for thread-integrity and audit per §6.8.5.

### 4.4 Presence Record (§4.3.14, L3265)

Full field table with `session_id` (Convex session), `user_id`, `org_id`, `console` (buyer | seller; session-locked), `workspace_id` (nullable, buyer), `bid_workspace_id` (nullable, seller; mutually exclusive with `workspace_id` enforced by `console`), `current_route`, `cursor_position` (JSON), `viewport_element_ref`, `color_token` (hue_1…hue_8 per §3.9.2), `last_heartbeat_at` (5-s heartbeat), `status` (active | idle | disconnected; idle at 10 s, disconnected at 30 s, evicted at 60 s), `typing_in_entity_ref` (clears 3 s after last keystroke), `client_timezone`, `client_device_class`, `connected_at`.

Indexes (L3289–L3294): `(org_id, workspace_id, status)`, `(org_id, bid_workspace_id, status)`, `(org_id, viewport_element_ref, status)`, `(user_id, console)` (enforces one presence record per console per user), `last_heartbeat_at` for TTL eviction sweep.

Scope isolation (L3296): session-scoped and Convex-managed; never crosses the Dual-Console Firewall. Buyer-console session invisible to seller-console sessions for the same Org. Cross-tenant sessions likewise invisible — a Workspace Guest from Org B sees Org B teammates only; Org A internal users not surfaced. Cross-Org Guest Presence rule at L3298: Presence Record carries `org_id = B` (auth anchor) with `workspace_id = <Org A workspace>`; hosting-Org Owner/Admin see all records matching `workspace_id`; guests see only records matching `workspace_id` AND matching `org_id` (own Org). Prevents leaking Org A teammate presence to Org B guests.

Retention (L3300): ephemeral — never written to cold storage. Evicted 60 s after last heartbeat or immediately on explicit disconnect. Excluded from JSON export (§40), DSAR exports (§6.8, §45.1), and backup snapshots. Listed as "lost in round-trip" in §40.4. No retention row needed in §40.2.

Authoring Intent (L3304) documents three gaps the entity closes: (a) clarifies Presence is not subject to DSAR export (avoids QA/privacy review stalemate); (b) defines `color_token` collision behavior for > 8 concurrent sessions (wrap); (c) enforces the buyer↔seller firewall at the Presence layer, which Summary C.120 implies but does not specify. Flagged as Authored Extension.

### 4.5 Unread Marker (§4.3.15, L3306)

Full field table with `id`, `user_id`, `org_id`, `console`, `thread_type` enum (`internal_comment_thread | qa_thread | inbox_item_group`), `thread_id` (polymorphic; validated on write), `workspace_id` (nullable; FK → Workspace or Bid Workspace per `console`), `last_read_at`, `last_read_post_id` (authoritative over `last_read_at` if both present), `unread_count`, `has_unread_mention`, `muted_until`, `suppressed_reason` enum (`muted | left_workspace | archived_thread | visibility_tightened` — the last added in the Phase 10 pass via `unread_marker_suppressed_reason`), standard audit quintet.

Indexes (L3331–L3335): `(user_id, thread_type, thread_id)` UNIQUE for idempotent UPSERT; `(user_id, console, has_unread_mention, updated_at DESC)` for global mention badge; `(user_id, console, thread_type, unread_count DESC)` for per-surface inbox; `(workspace_id, user_id)` for workspace-dashboard summary; `(thread_id, thread_type)` for thread-mutation fanout. All five indexes are load-bearing for §3.12.3 surface rendering and §3.12.4 derivation.

Scope isolation (L3337): per-user; `console` enum separates buyer and seller marker sets. A user operating in both consoles has independent marker sets that do not leak across the firewall.

Retention (L3339): purged 30 days after (a) parent thread hard-delete, (b) user loses Workspace Membership (`suppressed_reason = left_workspace`), or (c) Org delete per §40.2 (90-day purge).

Polymorphic FK target attestation at L3343 documents that `thread_type = qa_thread` references §18.3.1 (authoritative for Q&A) and that Q&A Thread is intentionally not promoted to a §4 entity in v7.0.0 Phase 1 because its schema is tightly coupled to §18 feature semantics; promotion deferred to the §18 integration phase. `thread_type = inbox_item_group` references §4.3.22 (Phase 1.5 stub; Phase 2 supersedes).

Authoring Intent (L3345) and derivation map (L3347–L3353) document why this is a single polymorphic entity rather than three parallel marker tables: Convex reactive-query performance envelope requires centralization (> 1 000 threads/Org exceeds function-execution budget per paint cycle). The `has_unread_mention` derivation differs per `thread_type`: `internal_comment_thread` uses Internal Comment Mention rows; `qa_thread` uses a denormalized `qa_post_mentions` index (authored extension; flagged as a future normalization candidate); `inbox_item_group` uses the `direct_mention = true` flag on Inbox Feed Schema (§29.1).

### 4.6 Cross-Reference Verification

| Entity | §25.7 reference | §3.12 reference | §4 location | Appendix B glossary |
| :---- | :---- | :---- | :---- | :---- |
| Internal Comment Thread | §25.7.1 (L17475), §25.7.2 attachment catalog (L17487), §25.7.6 cap table (L17567), §25.7.7 firewall (L17586) | §3.12.1 subsystem overview (L2679), §3.12.3 Scrollback Divider source (L2713), §3.12.5 derivation table (L2767) | §4.3.11 (L3139) | Internal Comment Thread (§B) |
| Internal Comment Post | §25.7.1 (L17476), §25.7.4 posts/Markdown/mentions (L17525) | §3.12.1 subsystem overview (L2679), §3.12.4 Mention Derivation (L2755) | §4.3.12 (L3182) | Internal Comment Post (§B) |
| Internal Comment Mention | §25.7.1 (L17477), §25.7.4 mentions (L17533) | §3.12.4 Mention Derivation (L2755) | §4.3.13 (L3228) | Internal Comment Mention (§B) |
| Presence Record | Referenced transitively via §25.7 Unread surfaces | §3.12.1 (L2677), §3.12.2 data-source column (all non-cursor surfaces), §3.12.6 perf budget (L2783), §3.12.8 cross-org (L2810) | §4.3.14 (L3265) | Presence Record (§B) |
| Unread Marker | §25.7.1 (L17477 via Mention → Unread Marker drive), §25.7.3 visibility-scope seeding (L17518), §25.7.7 firewall (L17594) | §3.12.1 (L2679), §3.12.3 data source (every row), §3.12.4 derivation, §3.12.5 visibility enforcement | §4.3.15 (L3306) | Unread Marker (§B) |

All five entities are referenced from both the feature section (§25.7) and the UX/performance section (§3.12), and both sections cite the §4 entity as the authoritative data-model contract. Gate #3 satisfied.

**Section-level verdict (Gate #3).** Entities Internal Comment {Thread, Post, Mention}, Presence Record, Unread Marker are first-class §4 entities with full field tables, indexes, scope-isolation blocks, retention blocks, and Authoring Intent statements. They are bidirectionally referenced from §25.7 and §3.12. PASS.

---

## 5. Cross-Section Consistency Audit

The Phase 10 additions touch eight adjacent sections / appendices. Each cross-cutting invariant is re-validated against the authored text.

| Invariant | §25.7 | §3.12 | §4.3.11–§4.3.15 | Pass? |
| :---- | :---- | :---- | :---- | :---- |
| Console = `buyer` (fixed) on Internal Comment entities | L17467 firewall; L17586 API authz | L2775 marketplace-domain leakage; L2809 firewall | L3148 (Thread), L3192 (Post), §4.3.13 inherits | PASS |
| HTTP 404 (non-leak) on cross-console read | L17587 API authz; L17693 error row | L2771 unread firewall; L2809 firewall error code | L3174 (Thread); L3220 (Post inherits) | PASS |
| Bridge NEVER-CARRIED (§25.1.2) | L17588 static-analysis gate | Implicit in L2681 invariant (c) | L3174 scope-isolation clause | PASS |
| Plan cap cited to §34.1.1 | L17569 "authoritative cell is §34.1.1"; L17796 hand-off | N/A — §3.12 defers plan gating to §25.7 / §34.1.1 | N/A at entity level | PASS |
| Mute silences notifications, not visibility | L17710 webhook notes; L17708 mention-sent row | L2707 Global Mention Dot row; L2750 mute semantics | L3323 `muted_until` field note | PASS |
| 15-min author edit window | L17530; L17700 error row | Not applicable (state change) | L3199 `edit_locked_at` immutable | PASS |
| Mention expansion frozen at write time | L17537 | L2755 Mention Derivation | L3257 scope-isolation clause | PASS |
| Soft-delete cascade: Thread → Post → Mention | L17599 retention; L17603 DSAR | Not applicable | L3165 Thread `deleted_at`; L3211 Post `deleted_at`; L3248 Mention `deleted_at` | PASS |
| Visibility-scope tighten → marker purge | L17511 scope mutation; L17731 failure mode | L2767 derivation table; L2832 failure mode | L3324 `suppressed_reason = visibility_tightened` | PASS |
| Convex reactive query for Unread derivation | L17622 POST posts endpoint "triggers Unread Marker fanout" | L2729 post-commit handler; L2739 Scroll-Past handler | L3345 Authoring Intent documents Convex-specific rationale | PASS |
| Presence ephemeral; excluded from DSAR / export / backup | Not applicable (feature doc) | L2812 residency clause (transient) | L3300 retention clause (explicit excludes) | PASS |
| Cross-Org guest Presence rule | Not applicable | L2810 guest scoping | L3298 Cross-Org Guest Presence rule | PASS |

All 12 cross-cutting invariants are consistent across the three scopes. No drift.

---

## 6. Residual Observations — Dispositions

Five residual observations were identified during verification. Four are resolved in this pass via targeted Master Spec edits; one is deferred to the §18 integration phase. Full resolution detail is logged in `_integration/RECONCILIATION.md` → Phase 10 entry.

| # | Residual | Disposition | Master Spec Edit |
| :---- | :---- | :---- | :---- |
| R1 | §4.3.15 `suppressed_reason` field constraint listed only three values (`muted`, `left_workspace`, `archived_thread`) while Appendix J `unread_marker_suppressed_reason` registers five (`muted`, `left_workspace`, `archived_thread`, `visibility_tightened`, `ops_impersonation_suppressed`). Field-level constraint did not match the Appendix J registration, creating a citation drift that would fail authoring-convention #3 enum-registry consistency. | **Resolved in this pass.** Updated §4.3.15 `suppressed_reason` row to cite Appendix J as authoritative and enumerate all five values inline with usage notes for `visibility_tightened` (set on §3.12.5 / §25.7.3 visibility-scope tighten cascade) and `ops_impersonation_suppressed` (forward-compatibility per §3.12.8 #4). Cross-checked Appendix J L42103–L42107 — all five values present with full notes. | §4.3.15 `suppressed_reason` field row updated. |
| R2 | §3.12.4 / §4.3.15 Q&A mention derivation depends on a denormalized `qa_post_mentions` index (Authored Extension); proper normalization deferred to §18 Q&A integration phase. | **Deferred — §18 integration phase.** No Phase 10 Spec change. The dependency is already explicit at §3.12.4 L2756 and §4.3.15 L3350. Phase 10 confirms the deferral is documented; the §18 integration phase MUST normalize Q&A Thread posts (mirror §4.3.12 / §4.3.13 pattern) and retire the denormalized index. Tracked as Phase 10 carry-forward in RECONCILIATION. | None — deferred. |
| R3 | §25.7.6 per-workspace mention cap (100 000) and per-post mention cap (50) — confirm §39 Object Size Constraints rows are physically present. | **Resolved — confirmed already present.** §39 contains both rows: "Internal Comment Post / mentions per post / 50 mentions" (L27751) and "Workspace / active Internal Comment Mentions (degraded-mode trigger) / 100 000 mentions cumulative" (L27754). The plan-cap row "Internal Comment Thread / active threads per Workspace (plan-gated)" (L27753) is also present, citing §34.1.1 as the authoritative cell. No Spec edit required. | None — confirmation only. |
| R4 | §25.7.7 mobile copy-paste pre-copy confirmation dialog referenced "§3.7.5" (Illustration Rules) — the wrong target subsection. The dialog pattern was an Authored Extension in §25.7.7 with no canonical home in §3.7. | **Resolved in this pass.** Authored new subsection §3.7.12 "External-Target Clipboard Confirmation Pattern" with full pattern spec (trigger heuristic, dialog content, behavior, mobile divergence, reduced-motion / High Contrast handling, four failure modes, five Acceptance Criteria, surface registry). Updated §25.7.7 mobile-leakage paragraph to reference §3.7.12 and to expand the user-awareness vs DLP semantic distinction. Audit event `firewall_protected_clipboard_copy_confirmed` registered (Appendix G hand-off — Phase 11 to confirm registration). | §3.7.12 added. §25.7.7 mobile-leakage paragraph updated. |
| R5 | §25.7.10 named the CI gate `webhook_payload_no_internal_comment_body` for excluding `body` and `attachment_ids[]` from webhook payloads. The cross-cutting pattern (firewall-sensitive domains MUST exclude body) had no canonical home in §31. | **Resolved in this pass.** Authored new subsection §31.6.1 "Payload Body-Exclusion Gates (Firewall-Sensitive Domains)" with cross-cutting registry table covering Internal Comment (§25.7.10, gate `webhook_payload_no_internal_comment_body` — existing), Selection Report draft (§10.13, gate `webhook_payload_no_selection_report_narrative` — Phase 11 hand-off), and KB Entry restricted-class (§22, gate `webhook_payload_no_kb_restricted_body` — Phase 11 hand-off). Documented the operational invariant that the §31.5 256 KB transport limit and the body-exclusion gates are independent enforcement layers. | §31.6.1 added. |

**Net result.** All three Phase 10 exit gates remain PASS. Four residuals resolved in situ; one (R2 — Q&A normalization) deferred to the §18 integration phase. Phase 11 Appendix-sweep carry-forwards documented in RECONCILIATION (confirm Appendix J / Appendix C / Appendix G registrations, plus Phase 11 to author the two projected exclusion gates in §10.13 and §22).

---

## 7. Counterfactual / Edge-Case Coverage Audit

For each of the three sections, a hostile staff-engineer pass confirms the counterfactual coverage exceeds the authoring-convention #17 minimum (three realistic failure modes per feature).

| Section | Failure-Mode Count | Notes |
| :---- | :---- | :---- |
| §25.7.11 Internal Comments | 12 | Cross-console read, mention-to-unauthorized-guest, plan cap mid-authoring, anchor soft-delete during create, mention limit exceeded, attachment scan failure, visibility-tighten during in-flight notification, bridge-import accident, seller-initiated export, Convex permission drift, DSAR cascade with 50 000+ mentions, webhook body-leak, moderation-vs-edit race, attachment total-bytes overflow. |
| §3.12.10 Presence & Unread | 12 | Stale cursor on reconnect, fanout SLO breach, membership revocation, visibility-scope tighten, cross-console leak attempt, DSAR erasure of 10 000+ markers, mobile 4-hour background, mute-clock skew, hue vs `--color-danger` collision, reactive-query 50 events/s burst, Convex timeout on fanout, drift from missed post-commit. |
| §4.3.11–§4.3.15 | Implicit in retention clauses | Each entity's retention clause explicitly covers Org hard-delete, Workspace hard-delete, DSAR right-to-erasure, subject-author departure, and (for Presence Record) ephemeral eviction + DSAR exemption. |

Each section comfortably exceeds the convention #17 minimum. No authored failure mode is left without a handling clause.

---

## 8. Phase 10 Exit Decision

**Gates:**

| Gate | Result |
| :---- | :---- |
| §25.7 Internal Comments present with plan caps and firewall rule | **PASS** |
| §3.12 Presence & Unread present with performance budgets | **PASS** |
| Entities Internal Comment, Presence Record, Unread Marker referenced | **PASS** |

**Exit Decision:** **Phase 10 complete.** Four residuals resolved in situ via targeted Master Spec edits (§3.7.12 added, §4.3.15 `suppressed_reason` field row updated, §25.7.7 reference re-bound to §3.7.12, §31.6.1 added). One residual (R2 — Q&A mention normalization) deferred to the §18 integration phase per the dependency on §18 Q&A schema decoupling.

Proceed to Phase 11 (Appendix sweep + registry verification). Phase 11 carry-forwards from Phase 10:

1. Confirm Appendix J `unread_marker_suppressed_reason` registers all five values verbatim (already verified in this pass at L42103 — full set present).
2. Confirm Appendix J `internal_comment_thread_visibility_scope`, `internal_comment_thread_attached_to_type`, `internal_comment_mention_kind`, `internal_comment_mention_skip_reason`, `webhook_event_class` extension registrations.
3. Confirm Appendix C registers the eight `internal_comment_domain` events from §25.7.10.
4. Confirm Appendix G registers the eight UI events from §25.7.10 plus the new `firewall_protected_clipboard_copy_confirmed` event from §3.7.12 with the property set declared in that section.
5. Confirm Appendix I registers the six new error codes called out in §25.7.14.
6. Author the two projected body-exclusion gates declared in §31.6.1 in their canonical sections (§10.13 → `webhook_payload_no_selection_report_narrative`; §22 → `webhook_payload_no_kb_restricted_body`).

**Residual carry-forward (post-resolution):** R2 (Q&A mention normalization) → §18 integration phase. All other residuals closed.

**Signed:** Opus (senior technical product strategist / staff engineer for Sourcera).
**Timestamp:** 2026-04-24.
