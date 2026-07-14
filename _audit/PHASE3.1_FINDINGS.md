# Phase 3.1 — §5.1–§5.10 Role Definitions & Console Firewall (Findings)

**Run:** 2026-05-04
**Master Spec baseline:** v7.1.0 (2026-04-28)
**Scope:** §5.1 RBAC Architecture · §5.2 Org-Level Roles (incl. §5.2.1 Billing Admin sub-tree) · §5.3 Console-Level Roles (Buyer Console) · §5.4 Guest Role & Permission Profiles · §5.5 Console-Level Roles (Seller Console) · §5.6 Marketplace Roles · §5.7 Scoring Availability · §5.8 Policy Ingestion Availability · §5.9 Executive Sponsor · §5.10 Active Workspace Definition.
**Out of scope (sister prompts):** §5.11 Feature Access Matrix coverage (Prompt 3.2). §5.12 Access Control Enforcement (deferred to Prompt 3.2 / 3.3 cross-check). §6.* (Prompt 3.3+).
**Convention preamble:** Sourcera Audit Program v1.0 — `Audit_Prompts.md` Prompt 3.1.

---

## 1. Method

1. End-to-end read of Master Spec lines 8868–9170 (§5.1 → §5.10) and §5.11 (read for cross-reference only).
2. Cross-reference reads:
   - §1.3 Dual-Console Data Isolation Model (lines 1290–1311)
   - §4.3.1 Workspace Membership `role` enum (line 3665)
   - Appendix J (lines 42848+): Global Organization Roles, Workspace Roles, Team Roles, Seller Console Role Extension (§5.11/§27.9/§31.9)
   - Appendix K Glossary (lines 45741–46000+)
   - §5.11 Feature Access Matrix column headers (line 9177) — to confirm role-naming canonicality
   - §44.6 Solo-Tier Surface Treatment (no §5 impact, but reviewed for tier ↔ role overlap)
3. Whole-spec greps for each Title-Case role name appearing in §5.3 / §5.5 / §5.6 / §5.9 / §5.10 to verify (a) consistency of usage and (b) Glossary registration.
4. Whole-spec greps for `seller_org_owner`, `seller_org_admin`, `seller_kb_admin`, `seller_kb_editor`, `seller_kb_viewer`, `seller_bid_captain`, `seller_bid_contributor`, `seller_marketing_editor`, `seller_billing_admin`, `seller_compliance_officer`, `seller_integrations_admin`, `seller_guest`, `bid_workspace_owner` to enumerate seller-side roles in active use that §5.5 omits.
5. Counterfactual pass per "COUNTERFACTUAL PASS" mandate — at least 3 realistic failure modes per role.
6. Self-challenge pass per "SELF-CHALLENGE PASS" mandate — re-read each draft defect as a hostile reviewer.

## 2. Headline Verdict

**§5.1–§5.10 do not meet v7.1.0 production-readiness bar.** The §5.2.1 Billing Admin subsection is a clean exemplar of the convention — operation-level permissions, scope explicit, audit semantics, failure modes, acceptance criteria, glossary note, Appendix J registration. Every other sub-section in the §5.1–§5.10 range fails the convention bar for at least one of the seven CHECKS in Prompt 3.1.

The single largest defect class is **role-name canonicality drift between §5.3 / §5.5 / §5.6 (presentation-layer Title-Case names) and Appendix J / §4.3.1 / §5.11 (canonical lowercase enum values).** Three of the §5.3 buyer-console roles (Evaluation Lead, Evaluator, Scorer) and all three §5.5 seller-console roles (Bid Owner, Bid Contributor, Bid Viewer) do not match the canonical enum names used everywhere else in the spec. §5.5 also omits 11 seller-side roles that the rest of the spec actively uses (`seller_kb_admin`, `seller_kb_editor`, `seller_kb_viewer`, `seller_org_owner`, `seller_org_admin`, `seller_billing_admin`, `seller_marketing_editor`, `seller_compliance_officer`, `seller_integrations_admin`, `seller_bid_captain`, `seller_guest`).

The second-largest defect class is **concept-level vs operation-level permission descriptions.** Every role outside §5.2.1 Billing Admin is described in concept-level language ("manages workspace", "complete assigned bid responses") rather than operation-level enumeration ("can `POST /v1/workspaces/:id/phases`", "can `POST /v1/bid-workspaces/:id/responses` for `assigned_response_ids` only"). The §5.2.1 Billing Admin pattern (Permission List → Operation × Surface × RBAC Check × Audit Action) is the convention contract — every other role row violates it.

The third-largest defect class is **Appendix K Glossary silence.** None of the role names used in §5.3 / §5.5 / §5.6 / §5.9 / §5.10 have Glossary entries (Grep for `^**Workspace Owner**`, `^**Bid Owner**`, etc. → zero matches). Per Prompt 3.1's CHECKS rule "File P1 rbac for any role that lacks a Glossary entry," that's a P1 defect per role term.

## 3. Defect Candidates (promoted to Defect Ledger)

Twenty-four candidate defects drafted; all twenty-four promoted to `DEFECT_LEDGER.md` with IDs `D-3.1-001` through `D-3.1-024`.

### 3.1 §5.1 RBAC Architecture (2 defects)

- **D-3.1-001 [P1 rbac].** §5.1 declares "Each user can hold multiple roles across different orgs and workspaces" but does not state role-overlay semantics (additive / restrictive / explicit precedence). The union-of-permissions rule is established only in §5.2.1.5 Failure Mode #1 for the `billing_admin` × `member` pairing — never generalized to all role combinations. Without an architectural rule, any developer will guess; tests will be inconsistent across role pairs.
- **D-3.1-002 [P2 rbac].** §5.1 silent on cross-console role-overlay semantics. A user holding `workspace_owner` (Buyer Console) and a seller-side role in the same Org has no spec-level rule for whether buyer-side privileges leak across the §1.3 firewall when the seller-side role is granted later.

### 3.2 §5.2 Org-Level Roles (3 defects)

- **D-3.1-003 [P1 rbac].** §5.2 Member row description "Limited org-scoped visibility | View team membership, view shared team resources (no org management)" is concept-level, not operation-level. No enumerated permission list. §5.11 Feature Access Matrix has no Member column, so the matrix cannot disambiguate. A junior engineer cannot build Member-role enforcement.
- **D-3.1-004 [P1 rbac].** §5.2 Org Owner / Org Admin descriptions ("All org-scoped resources" / "All org-scoped resources except billing") are silent on console-firewall scope. §1.3.2 console-scoped entities (Workspace, Use Case, Requirement, Response, Score, Bid Workspace, Bid Response, Capability Declaration, KB entry) are not addressed in §5.2 — a reader could conclude Org Owner has full read access to every Workspace and Bid Workspace in the Org. The actual gating is in §5.11 (Buyer Console row group only) and downstream §5.12 enforcement; §5.2's wording implies broader authority than §5.11 / §5.12 actually grant.
- **D-3.1-005 [P1 consistency_drift].** §5.2 Org Admin row says "All org-scoped resources except billing"; §4.8.3 / §4.8.11 list `org_admin` in billing-entity read-allow lists. The conflict is acknowledged at §5.11 line 9275 ("a pre-existing conflict between §5.2 Org Admin wording... and §4.8.3 / §4.8.11 entity-level RBAC... requires explicit human resolution in a dedicated follow-up phase"), but unresolved. As written, Org Admin's billing read access is unbuildable — two contradictory specs on a single capability.

### 3.3 §5.3 Console-Level Roles (Buyer Console) (3 defects)

- **D-3.1-006 [P1 rbac].** §5.3 role-name table uses `Workspace Owner | Evaluation Lead | Evaluator | Scorer | Guest`. The canonical Buyer Console workspace roles per Appendix J Workspace Roles (line 42876) are `workspace_owner | workspace_admin | use_case_lead | reviewer | guest`. §4.3.1 Workspace Membership `role` enum (line 3665) and §5.11 Feature Access Matrix column headers (line 9177) both use the canonical lowercase form. Three of the five §5.3 names ("Evaluation Lead", "Evaluator", "Scorer") have no enum counterpart anywhere else in the spec. A junior engineer reading §5.3 alone would build five distinct roles instead of the canonical five; a junior engineer reading §5.11 + Appendix J would build five different roles. The two readings collide on every workspace operation.
- **D-3.1-007 [P1 rbac].** §5.3 role descriptions are concept-level ("Own & manage workspace, decide on vendors, final approval"; "Oversee evaluation timeline, coordinate scorers, escalate issues"; "Author requirements, review responses, score requirements, attend demos"; "Score vendor responses, provide rationale"). Per Prompt 3.1 CHECKS rule "File P1 rbac for any role with a vague permission" — every §5.3 row qualifies. The §5.2.1 Billing Admin Permission List (Operation × Surface × RBAC Check × Audit Action) is the convention contract; §5.3 violates it for all five rows.
- **D-3.1-008 [P1 glossary].** Five §5.3 role names (Workspace Owner, Workspace Admin, Use Case Lead, Reviewer, Evaluator, Evaluation Lead, Scorer) and the canonical lowercase forms (`workspace_owner`, `workspace_admin`, `use_case_lead`, `reviewer`, `guest`) are not registered in Appendix K Glossary. Confirmed by `grep '^\*\*Workspace Owner\*\*'` → zero matches. The terms are used across §5, §13.10, §17.8, §18.5.1, §25.3.9, §25.4, §29.4, §32, and dozens of other sections. Per Prompt 3.1 CHECKS rule "P1 rbac for any role that lacks a Glossary entry," each role term is a P1 — collapsed here as one entry covering the §5.3 row group; the §5.5 / §5.6 / §5.9 / §5.10 glossary gaps are filed as separate rows below.

### 3.4 §5.4 Guest Role & Permission Profiles (4 defects)

- **D-3.1-009 [P2 rbac].** §5.4.5 Guest Scope Isolation enumerates "Use Case Scoping", "Empty Assignment", "Workspace Isolation", "Cross-Org" but is silent on every workspace surface authored after the §5.4 v6.0.0 baseline: Defense View (§13.11 — `defense_view_generate` capability, §13.11.4 plan-tier visibility), Buyer Maya intake (§13.12), EvalStarter (§4.5.9), Pricing Workbench (§14), Internal Comment Threads (§4.3.11–§4.3.13), Selection Report scenarios, Cross-Console Bridge sync surfaces, Inbox unread markers (§3.12.5). §5.11 Feature Access Matrix carries the row-by-row decisions, but §5.4 itself does not surface them — a junior engineer building Guest enforcement against §5.4 alone misses Defense View / Buyer Maya / Selection Report / Inbox semantics.
- **D-3.1-010 [P2 rbac].** §5.4 silent on guest behavior across workspace lifecycle states. Workspace status transitions (`active → archived`, `active → closed`, `archived → restored`, `suspended → active`) and the corresponding guest-access invariants are not specified. Counterfactual: a guest invited to an `active` workspace that subsequently transitions to `archived` — does the guest retain read access? Are pending guest invitations auto-revoked? The spec is silent.
- **D-3.1-011 [P2 rbac].** §5.4 silent on permission-profile mid-evaluation change semantics. Counterfactual: a guest invited as `read_only` is upgraded to `full_participant` mid-Phase 10; do prior comments authored as `read_only` retain their `read_only` author-role-snapshot per §4.3.11 / §4.3.12, or do they retroactively reflect `full_participant`? Is there a re-invite confirmation? Is the change audit-logged?
- **D-3.1-012 [P2 rbac].** §5.4 silent on guest revocation flow. The spec authors invitation (Workspace Owner per §5.11 row "Invite workspace guests") but not revocation: who can revoke (Workspace Owner only, or any role with manage-team authority?), what happens to comments / scores authored by the revoked guest (preserved with `author_role_snapshot=guest_*` per §4.3.11; soft-deleted; tombstoned), what cleanup runs against unread markers and notification subscriptions, whether revocation is audit-logged, and whether revocation emits a `workspace.guest_revoked` notification.

### 3.5 §5.5 Console-Level Roles (Seller Console) (4 defects)

- **D-3.1-013 [P1 rbac].** §5.5 role table uses `Bid Owner | Bid Contributor | Bid Viewer`. The rest of the spec uses two competing canonical forms: (a) `bid_workspace_owner` / `bid_contributor` (lines 18780, 40609 — Loops.so notification recipient lists, vendor disqualification dispatch); and (b) `seller_org_owner` / `seller_org_admin` / `seller_billing_admin` / `seller_marketing_editor` / `seller_kb_admin` / `seller_kb_editor` / `seller_kb_viewer` / `seller_bid_captain` / `seller_bid_contributor` / `seller_compliance_officer` / `seller_integrations_admin` / `seller_guest` (the seller-console role extension at §44.6 + scattered §22 / §27 / §31 references). Neither canonical form is `bid_owner` / `bid_contributor` / `bid_viewer`. Appendix J has no `seller_workspace_role` enum nor `bid_workspace_role` enum that would register §5.5's three names. Three readings (§5.5 / `bid_workspace_owner` / `seller_*`) collide on every Seller Console operation. A junior engineer reading §5.5 builds three roles; the actual Convex enforcement uses 12+ roles.
- **D-3.1-014 [P1 rbac].** §5.5 role descriptions are concept-level ("Own & manage bid workspace, assign team, track responses, interface with buyer"; "Complete assigned bid responses, collaborate with team"; "Track bid status, provide feedback"). Per Prompt 3.1 CHECKS rule "P1 rbac for any role with vague permission." No operation-level permission list. The Bid Owner cross-reference to "Section 2.7 for term definition" is also dangling — §2.7 does not define seller-side bid-workspace ownership semantics.
- **D-3.1-015 [P1 rbac].** §5.5 omits 11 seller-side roles that the rest of the spec uses on at least one operation: `seller_kb_admin`, `seller_kb_editor`, `seller_kb_viewer`, `seller_org_owner`, `seller_org_admin`, `seller_billing_admin`, `seller_marketing_editor`, `seller_compliance_officer`, `seller_integrations_admin`, `seller_bid_captain`, `seller_guest`. Examples: §27.10.2 requires `seller_org_owner` for `seller_owner_attestation`; §27.4 / §22.* gate KB operations on `seller_kb_admin`/`editor`/`viewer`; §27.9.6 / §27.10.4 reference `seller_compliance_officer`; §31.9.11 introduces `seller_integrations_admin`; §22.1 / §44.6 introduce `seller_marketing_editor`. §5.5 is the canonical Seller Console role table per its heading; its omission of all 11 leaves Seller Console RBAC unbuildable from §5 alone — a developer must walk §27 / §31 / §22 / §44.6 for the actual role surface.
- **D-3.1-016 [P1 glossary].** None of the §5.5 role names (Bid Owner, Bid Contributor, Bid Viewer) and none of the 11 seller-side roles enumerated in D-3.1-015 are registered in Appendix K Glossary. Confirmed by `grep '^\*\*Bid Owner\*\*'` and `grep -i 'seller_org_owner'` in Appendix K → zero terminology entries. Per Prompt 3.1 CHECKS rule, P1 rbac per missing glossary entry.

### 3.6 §5.6 Marketplace Roles (4 defects)

- **D-3.1-017 [P1 rbac].** §5.6 role descriptions are concept-level ("Create/edit Marketplace Listings, manage Seller Profile"; "Browse public listings, submit EOI"). No operation-level permission list. No Appendix-J enum registration (`marketplace_role` enum absent). Compared against §5.2.1 Billing Admin's 22-row Permission List, §5.6 carries zero rows.
- **D-3.1-018 [P1 rbac].** §5.6 Marketplace Publisher row says "Org-scoped" without disambiguating buyer-Org-scoped vs seller-Org-scoped. Marketplace Listings (§4.4.10 / §4.4.11) are seller-side products by definition; the role is implicitly seller-Org-only but never says so. A buyer-Org `marketplace_publisher` grant would be malformed; §5.6 does not block it at the role-definition layer (the actual block is downstream entity validation).
- **D-3.1-019 [P1 rbac].** §5.6 Marketplace Viewer row says "Global" — the only role in the spec with "global" scope. The semantics of "Global" are not defined: (a) is this the implicit role of every authenticated user? (b) is it the implicit role of every unauthenticated reader? (c) does "Global" cross the org boundary intentionally (yes, since marketplace listings are public per §1.3.2 "neutral domain") or unintentionally? Additionally, the row claims "submit EOI" capability — but EOI submission writes an EOI Record (§4.5.2) that requires buyer-Org context; a "global" role cannot supply that context.
- **D-3.1-020 [P1 glossary].** "Marketplace Publisher" and "Marketplace Viewer" are not registered in Appendix K Glossary. Confirmed by Grep. Per CHECKS rule, P1 rbac per missing glossary entry.

### 3.7 §5.7 Scoring Availability (1 defect)

- **D-3.1-021 [P1 rbac].** §5.7 narrative says "Evaluators and Scorers can score any requirement during Phases 10–11." "Evaluators" and "Scorers" do not exist as canonical RBAC roles (per D-3.1-006); the actual scoring-eligible roles per §5.11 (line 9204) are `workspace_owner`, `workspace_admin`, `use_case_lead`, `reviewer` (with the guest `scorer` permission profile additionally allowed). A junior engineer reading §5.7 cannot map "Evaluators" / "Scorers" to the canonical enum. (Same root as D-3.1-006; filed separately because §5.7 is a phase-gate engine concept, not a role definition; remediation must touch both.)

### 3.8 §5.8 Policy Ingestion Availability (1 defect)

- **D-3.1-022 [P1 rbac].** §5.8 says Policy Ingestion "can begin immediately upon workspace creation. No gating on phases or prior evaluations." The narrative is silent on which role can fire the ingestion operation: Workspace Owner only, Workspace Admin+, Use Case Lead+, Reviewer+, Guest with `contributor` profile? §5.11 has no explicit row for "Ingest policy doc" — the closest rows ("Create requirement", "Add comment") do not map cleanly to KB/policy ingestion. A junior engineer cannot determine the role gate. Counterfactual: a Reviewer attempts to ingest a policy doc — does the API return 200, 403, or 422? §5.8 is silent.

### 3.9 §5.9 Executive Sponsor (2 defects)

- **D-3.1-023 [P2 rbac].** §5.9 declares Executive Sponsor "an informal persona, not an RBAC role." The persona is operationally consequential: it has audience-membership semantics on Pulse events (§20), receives escalation alerts, and is referenced as "the Org Owner or Org Admin" — i.e., it is an aliased identity over two real roles. The defect: (a) §5.9 does not specify who designates the Executive Sponsor (per-Workspace? per-Org? auto-derived?); (b) §5.9 does not specify what happens when an Org has multiple Org Owners and multiple Org Admins (which one is the "Executive Sponsor"?); (c) §5.9 does not specify how forensic queries against Pulse audit logs reference the Executive Sponsor (no stable identifier); (d) the cross-reference "Section 6, Evaluation Pulse" is stale — Pulse is in §20 in v7.1.0 (§6 is Auth & Identity).

### 3.10 §5.10 Active Workspace Definition (1 defect)

- **D-3.1-024 [P2 rbac].** §5.10 defines Active Workspace as `status = active (not draft, closed, or archived)` AND `pipeline_stage_id < 13`. (a) The Workspace `status` enum (`draft | active | closed | archived` per the §5.10 narrative) is not cross-referenced to §4.3.1 or to Appendix J — Appendix J has no `workspace_status` enum entry. The §5.11 row group "Workspace Management" includes "Edit workspace settings" / "Transition phase" / "Delete workspace" but no `status` mutation row. (b) The integer comparison `pipeline_stage_id < 13` couples the engine to the canonical Pipeline Phases enum (Appendix J line 42882) by ordinal position; a future enum reorder would silently break the Active Workspace definition. The proper form is membership in `{phase_1_drafting_requirements, …, phase_12_final_selection}` — explicit and reorder-safe.

---

## 4. Counterfactual Pass

Per program mandate, three realistic failure modes per role must be enumerated; the spec's handling is asserted; gaps are filed as defects.

### 4.1 Org Owner

- **FM-1.** User holds `org_owner` in Org A and `member` in Org B; switches active org via `X-Sourcera-Active-Org` header. Spec handling: §5.2.1.5 Failure Mode #2 establishes the per-Org-membership rule but only for `billing_admin`. §5.2 Org Owner row does not generalize. → No defect filed (acceptable extension via D-3.1-001 generalization).
- **FM-2.** Org Owner attempts to read a Bid Workspace in their Org (console-firewall-scoped). Spec handling: §5.2 wording implies allowed; §5.11 Buyer Console row group does not address Bid Workspace; §5.12 RBAC Enforcement defers to "Convex function level." → Filed as D-3.1-004.
- **FM-3.** Org Owner deprovisioned mid-session via SCIM. Spec handling: §6.1 / §6.5 should cover; §5.2 silent. Out of Prompt 3.1 scope; tracked for Prompt 3.3.

### 4.2 Org Admin

- **FM-1.** Org Admin reads AIWallet via §4.8.3-listed read-allow path. Spec handling: §5.2 says "no billing access"; §4.8.3 says reads allowed. → Filed as D-3.1-005.
- **FM-2.** Org Admin attempts to grant `billing_admin`. Spec handling: §5.2.1.6 AC #2 explicitly permits — Org Admin OR Org Owner. → No defect.
- **FM-3.** Org Admin attempts to view full Audit Event log. Spec handling: §5.11 row "View audit log" assigns ✓ to Org Admin (cross-namespace). → No defect.

### 4.3 Member

- **FM-1.** Member views team membership. Spec handling: §5.2 says allowed at concept level; no operation-level enumeration. → Filed as D-3.1-003.
- **FM-2.** Member attempts to read a workspace they are not a member of. Spec handling: §5.11 has no Member column; §5.12 says "No row-level data returned if user lacks access." Implicit. → Tracked as part of D-3.1-003.
- **FM-3.** Member who also holds `workspace_owner` on a specific workspace. Spec handling: §5.1 union-of-permissions implicit but never stated. → Filed as D-3.1-001.

### 4.4 Billing Admin

- §5.2.1.5 enumerates 12 failure modes explicitly; counterfactual pass confirms exemplary coverage. No defects in scope of Prompt 3.1.

### 4.5 Workspace Owner

- **FM-1.** Workspace Owner deprovisioned; no Workspace Admin exists. Spec handling: §5.4 / §5.3 silent. → Filed as part of D-3.1-007 (operation-level missing) and D-3.1-006 (role-name canonicality).
- **FM-2.** Two users hold `workspace_owner` simultaneously (post-add via §5.11 "Manage workspace team"). Spec handling: silent on whether multiple Workspace Owners are permitted. The §5.11 row "Manage workspace team" + §5.11 row "Invite workspace guests" suggest delegation, but multi-owner semantics undefined. → Filed as part of D-3.1-007.
- **FM-3.** Workspace Owner role granted to a guest user. Spec handling: §5.4 / §5.3 silent on whether grant is permitted; §4.3.1 `role` enum includes `guest` distinctly from other roles, suggesting mutual exclusion. → Filed as part of D-3.1-007.

### 4.6 Bid Owner / Bid Contributor / Bid Viewer

- **FM-1.** A `bid_owner` user is deprovisioned; bid workspace has no `bid_contributor`. Spec handling: §5.5 silent. → Filed as part of D-3.1-013 / D-3.1-014.
- **FM-2.** A user holds `bid_owner` in Bid Workspace A and `bid_viewer` in Bid Workspace B; the Bid Workspaces share a SellerSoftware. Spec handling: silent. → Filed as part of D-3.1-013.
- **FM-3.** A `bid_contributor` attempts to read a KB entry referenced by their assigned response. Spec handling: depends on `seller_kb_*` role grants — but §5.5 omits those roles entirely. → Filed as D-3.1-015.

### 4.7 Marketplace Publisher

- **FM-1.** Granted to a buyer-Org user. Spec handling: §5.6 does not block at the role-definition layer. → Filed as D-3.1-018.
- **FM-2.** Granted to a Seller Org member but the SellerSoftware is `unclaimed`. Spec handling: §4.4.11 SoftwarePage publication requires `claim_status=claim_verified`; §5.6 does not surface this dependency. → Filed as part of D-3.1-017.
- **FM-3.** Granted to a Seller Org member during an active VendorOptOut for the Org's listings. Spec handling: §4.4.8 VendorOptOut suppresses public surfaces; the role grant is technically valid but operationally moot. § 5.6 silent. → Tracked as part of D-3.1-017.

### 4.8 Marketplace Viewer

- **FM-1.** Unauthenticated user browses the Marketplace. Spec handling: "Global" role implies allowed for read; "submit EOI" implies allowed but EOI requires buyer-Org context. → Filed as D-3.1-019.
- **FM-2.** Authenticated buyer-Org user submits EOI on a SellerSoftware that has been opted-out by the seller via §4.4.8. Spec handling: §4.4.8 suppresses the SellerSoftware from search results; if the user reaches the EOI form via deep link, write should reject. §5.6 silent. → Filed as part of D-3.1-019.
- **FM-3.** Authenticated user submits 100 EOIs in 1 minute (rate-limit abuse). Spec handling: §32 rate limits apply; §5.6 silent on role-level limits. Out of Prompt 3.1 scope.

### 4.9 Guest (any profile)

- **FM-1.** Guest invited as `read_only`; profile changed to `full_participant` mid-Phase 10. → Filed as D-3.1-011.
- **FM-2.** Guest attempts to view the Defense View. Spec handling: §5.11 row 9222 says ✗ for all Guest variants; §5.4 does not surface this. → Filed as D-3.1-009.
- **FM-3.** Guest's Org is suspended. Spec handling: §5.4 / §5.4.5 silent on cross-Org-suspension cascade. Out of Prompt 3.1 strict scope; tracked as part of D-3.1-010.

### 4.10 Executive Sponsor

- **FM-1.** Org has 0 Org Owners (deprovisioning race). Spec handling: §5.9 silent on fallback. → Filed as D-3.1-023.
- **FM-2.** Workspace Owner attempts to designate a non-Org-Owner / non-Org-Admin user as Executive Sponsor. Spec handling: silent on whether designation is restricted. → Filed as D-3.1-023.
- **FM-3.** Audit query asks "which Pulse events were escalated to the Executive Sponsor on YYYY-MM-DD?" Spec handling: no stable identifier for the Sponsor in audit logs. → Filed as D-3.1-023.

### 4.11 Active Workspace Definition

- **FM-1.** Pipeline Phases enum gets a new phase 7.5 inserted. Spec handling: §5.10's `< 13` ordinal comparison silently re-defines Active Workspace. → Filed as D-3.1-024.
- **FM-2.** Workspace `status` is `suspended` (not in the §5.10 enumeration). Spec handling: §5.10 lists `draft | closed | archived` as inactive plus `active` as active. `suspended` is undefined. → Filed as part of D-3.1-024.
- **FM-3.** Workspace at Phase 13 (closed) but `status = active`. Spec handling: §5.10's AND condition correctly excludes; no defect.

---

## 5. Self-Challenge Pass (hostile review of own findings)

For each candidate defect, the hostile review asked: (a) is the evidence reproducible? (b) is the severity rule-based? (c) could the recommendation be sharper?

- **D-3.1-001.** Evidence: §5.1 lines 8870–8875. Reproducible. Severity: P1 per "missing acceptance criteria / missing state machine equivalent for role overlay." Recommendation tightened to cite §5.2.1.5 FM-1 as the union-of-permissions exemplar.
- **D-3.1-004.** Initially drafted as P0 firewall_leakage. Hostile-review verdict: §5.11 + §5.12 + downstream entity-level RBAC together prevent actual leakage at runtime; the §5.2 wording is unbuildable but does not breach the firewall. Re-classified P1 rbac. (P0 reserved for genuinely-blocking defects per ledger Severity Definitions tiebreaker.)
- **D-3.1-005.** Evidence: §5.11 line 9275 explicitly logs the conflict as unresolved. Hostile-review verdict: P1 stands — the conflict is acknowledged but not closed, and Org Admin's billing read access remains undefined. Recommendation tightened to "resolve in favor of §5.2 (deny) OR §4.8.3 (allow); update the losing site."
- **D-3.1-006.** Evidence: §5.3 table cells vs Appendix J Workspace Roles vs §4.3.1 line 3665 vs §5.11 column headers. Reproducible against four sources. P1 stands. Recommendation: "Replace §5.3 'Evaluation Lead / Evaluator / Scorer' with 'Workspace Admin / Use Case Lead / Reviewer' to match §4.3.1 / §5.11 / Appendix J. Add a deploy-time validator `rbac_role_name_canonicality` that asserts §5.3 / §5.5 row labels match Appendix J role enums."
- **D-3.1-013.** Severity initially drafted as P0. Hostile-review verdict: same reasoning as D-3.1-004 — runtime enforcement does not collapse, but spec is unbuildable. P1 stands.
- **D-3.1-015.** 11-role omission verified by Grep against §22 / §27 / §31 / §44.6 active uses. Tightened recommendation to "extend §5.5 to cover all 12 seller-console roles (the 3 §5.5 names need normalization first); register `seller_workspace_role` enum in Appendix J; add Glossary entries (D-3.1-016)."
- **D-3.1-017 / -018 / -019.** All Marketplace defects survived hostile review. -019 sharpened: noted that "Global" scope is the only such scope in the spec; removed weaker phrasing.
- **D-3.1-022.** Hostile review: "Maybe role gating is implicit via 'workspace member'?" Counter: the §5.11 KB-related rows assign permissions per role; §5.8 makes no such assignment; the KB ingestion endpoint (§22 / §27.4) requires `seller_kb_*` for sellers but no buyer-side equivalent is enumerated in §5.8. Defect stands.
- **D-3.1-023.** Hostile review: "Executive Sponsor is explicitly informal — maybe lack of stable identity is intentional." Counter: even informal personas backed by audience-membership semantics on Pulse events need a stable forensic-query path; the §5.9 narrative is silent on that path. P2 stands.

No defect rule-classification revisions exceeded the P1↔P0 boundary except for the two explicit P0→P1 demotions noted above (D-3.1-004, D-3.1-013). No defect was added in the self-challenge pass.

---

## 6. Coverage Matrix Cell Updates Prescribed

For F-138 through F-158 (the §5.1–§5.10 row group), the `rbac` column is currently ✅ across the board (Phase 0 seeded ✅ on the doctrine "anchor in §5.* satisfies rbac"). This Phase 3.1 deep-read overrides the doctrine for roles with concept-level descriptions, missing glossary entries, or canonicality drift.

Prescribed cell transitions (rbac column):

- F-138 RBAC Two-Level Architecture: ✅ → ⚠ (D-3.1-001, D-3.1-002).
- F-141 Member Role: ✅ → ❌ (D-3.1-003 — concept-level + missing from §5.11).
- F-139 Org Owner Role / F-140 Org Admin Role: ✅ → ⚠ (D-3.1-004 console-firewall silence; F-140 additionally ⚠ from D-3.1-005 unresolved billing conflict).
- F-144 Workspace Owner Role / F-145 Evaluation Lead Role / F-146 Evaluator Role / F-147 Scorer Role: ✅ → ❌ (D-3.1-006 canonicality + D-3.1-007 concept-level + D-3.1-008 glossary).
- F-148 Guest Role with Permission Profiles: ✅ → ⚠ (D-3.1-009 modern-surface coverage + D-3.1-010 / -011 / -012 lifecycle / profile-change / revocation gaps; the four profile cap tables are present so not ❌).
- F-149 Guest Use Case Scope Isolation: ✅ → ⚠ (D-3.1-009).
- F-150 Bid Owner Role / F-151 Bid Contributor Role / F-152 Bid Viewer Role: ✅ → ❌ (D-3.1-013 / -014 / -015 / -016).
- F-153 Marketplace Publisher Role / F-154 Marketplace Viewer Role: ✅ → ❌ (D-3.1-017 / -018 / -019 / -020).
- F-155 Phase-Gated Scoring Availability: ✅ → ⚠ (D-3.1-021 — phase-gate logic itself is sound; only the role-name reference is broken).
- F-156 Policy Ingestion Phase-Independence: ✅ → ❌ (D-3.1-022 — role gate undefined).
- F-157 Executive Sponsor Persona: ✅ → ⚠ (D-3.1-023 — designation flow / forensic identifier gap).
- F-158 Active Workspace Definition: ✅ → ⚠ (D-3.1-024 — `status` enum and ordinal coupling).

Additional same-pass tightenings (non-rbac columns) that surfaced during the read but are filed against existing defects rather than new rows:

- F-138 / F-141 / F-144..F-147 / F-150..F-152: `glossary` ⚠ → ❌ (each cited in D-3.1-008 / -016 / -020).
- F-141 / F-144..F-147 / F-150..F-152: `acceptance_criteria` ⚠ → ❌ (no AC block exists in §5.2 Member, §5.3, §5.5; only §5.2.1 Billing Admin satisfies).
- F-153 / F-154: `console_firewall` ⚠ → ❌ (D-3.1-018 / -019).
- F-148: `state_machine` ⚠ → ❌ (D-3.1-010 / -011 — no permission-profile transition state machine; no workspace-lifecycle ↔ guest-access matrix).

Updates applied in the same pass to `COVERAGE_MATRIX.md` under a new "Phase 3.1 Update (2026-05-04)" section per program convention.

---

## 7. Promotion to Defect Ledger

All 24 candidates promoted as `D-3.1-001` through `D-3.1-024` (sequential per the §3.1 ordering above; one defect per row of the ledger).

D-3.1-001 P1 rbac
D-3.1-002 P2 rbac
D-3.1-003 P1 rbac
D-3.1-004 P1 rbac
D-3.1-005 P1 consistency_drift
D-3.1-006 P1 rbac
D-3.1-007 P1 rbac
D-3.1-008 P1 glossary
D-3.1-009 P2 rbac
D-3.1-010 P2 rbac
D-3.1-011 P2 rbac
D-3.1-012 P2 rbac
D-3.1-013 P1 rbac
D-3.1-014 P1 rbac
D-3.1-015 P1 rbac
D-3.1-016 P1 glossary
D-3.1-017 P1 rbac
D-3.1-018 P1 rbac
D-3.1-019 P1 rbac
D-3.1-020 P1 glossary
D-3.1-021 P1 rbac
D-3.1-022 P1 rbac
D-3.1-023 P2 rbac
D-3.1-024 P2 rbac

**Counts.** 0 P0 / 17 P1 / 7 P2 / 0 P3.

**Sub-prompt sign-off status.** Sign-off **HALT not triggered** — the CHECKS rule in Prompt 3.1 only escalates to P0 for actual cross-console firewall reads, of which none were confirmed. Per Audit Program §How to Use This Program §4, V-prompt advance is gated on P0 / P1 closure; the 17 P1 defects in this scratch-log block Phase 3 V-sign-off. Forwarded to the Phase 3 V-prompt remediation queue when run.

**Forwarded to downstream phases.**

- Phase 3.2 (§5.11 Feature Access Matrix coverage): inherits D-3.1-006 / -013 (role-name canonicality) so the §5.11 column-header naming gets re-confirmed against canonical Appendix J after §5.3 / §5.5 are normalized.
- Phase 3.3 (Auth, Session, Domain Governance): inherits D-3.1-001 (role-overlay semantics) for cross-IdP grant resolution.
- Phase 4 (Method, Pipeline, Buyer Feature): inherits D-3.1-021 (§5.7 narrative) and D-3.1-022 (§5.8 role gate) for §13 / §22 enforcement re-check.
- Phase 5 (Seller Feature): inherits D-3.1-013 / -014 / -015 / -016 for §22 / §23 / §24 / §27 / §31 RBAC re-check.
- Phase 8 (API + Webhook): inherits D-3.1-017 / -018 (Marketplace role surface) for §32 endpoint role-gate re-check.
- Phase 9 (Observability): inherits D-3.1-023 (Executive Sponsor forensic identifier) for audit-event identity column re-check.

---

## 8. Promotion completed

24 rows appended to `/Sourcera/_audit/DEFECT_LEDGER.md` 2026-05-04. Run-log row appended to `/Sourcera/_audit/AUDIT_README.md` (separate edit). Coverage matrix updated under "Phase 3.1 Update (2026-05-04)" section.
