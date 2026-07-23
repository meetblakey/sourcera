import { strict as assert } from "node:assert";
import test from "node:test";
import {
  assertProjectionIntegrity,
  harvestSourceAnchors,
  hasUnresolvedContractPlaceholder,
  projectCurrentFragment,
  projectCurrentMarkdown,
} from "./current-source-projection.js";

test("harvests explicit and table-cell source anchors before projection", () => {
  const anchors = harvestSourceAnchors([
    "Candidate thresholds live in Master Spec §34.5.",
    "| Field | Contract |",
    "| --- | --- |",
    "| `status` | UX Design §9.2 |",
    "| `state` | Appendix L.4 |",
  ].join("\n"));
  assert.deepEqual(
    anchors.map((anchor) => [anchor.document, anchor.section]),
    [
      ["master", "§34.5"],
      ["ux", "§9.2"],
      ["master", "Appendix L.4"],
    ],
  );
});

test("removes a pure source pointer without inventing replacement prose", () => {
  const projected = projectCurrentFragment("Candidate threshold, default checked state, and page-reference caps live in §34.5.");
  assert.equal(projected.text, "");
  assert.equal(projected.anchors[0]?.section, "§34.5");
  assert.ok(projected.diagnostics.some((diagnostic) => diagnostic.code === "source_pointer_removed"));
});

test("preserves present-tense rules while removing a mixed execution-history prefix", () => {
  const projected = projectCurrentFragment(
    "V7.2.0-REM Phase 3.4 remediation: every accepted request writes `result_id` once and every rejected request leaves stored state unchanged.",
  );
  assert.equal(
    projected.text,
    "every accepted request writes `result_id` once and every rejected request leaves stored state unchanged.",
  );
});

test("removes prompt and missing-artifact history while preserving the current contract", () => {
  const projected = projectCurrentMarkdown([
    "Per this prompt, enforcement latency MUST be at most 60 seconds after the opt-out commit.",
    "Required missing artifacts: `convex/opt-out.ts` and `tests/integration/opt-out.spec.ts`.",
  ].join("\n"));
  assert.equal(projected.text, [
    "enforcement latency MUST be at most 60 seconds after the opt-out commit.",
    "Required artifacts: `convex/opt-out.ts` and `tests/integration/opt-out.spec.ts`.",
  ].join("\n"));
});

test("removes an orphan version parenthetical without changing the current title", () => {
  const projected = projectCurrentFragment("Marketplace Listing Moderation Ops Surface (V12 —)");
  assert.equal(projected.text, "Marketplace Listing Moderation Ops Surface");
});

test("removes version-gated delivery history as one unit", () => {
  const sourceProjected = projectCurrentFragment(
    "The MS §2.11 baseline and AE requirements fall across three delivery phases, gated at v7.0.0, v7.1.0, and v7.2.0 respectively.",
  );
  const preScrubbedProjected = projectCurrentFragment(
    "The MS baseline and AE requirements fall across three delivery phases, gated at,, and respectively.",
  );
  assert.equal(sourceProjected.kind, "history_only");
  assert.equal(sourceProjected.text, "");
  assert.equal(preScrubbedProjected.kind, "history_only");
  assert.equal(preScrubbedProjected.text, "");
});

test("preserves executable canceled and retired lifecycle values", () => {
  const input = "The runtime state moves from `active` to `canceled`; a retained row may later transition from `canceled` to `retired` and rejects every write.";
  assert.equal(projectCurrentFragment(input).text, input);
});

test("preserves executable pre-cutover settlement and legacy alias behavior", () => {
  const input = [
    "A pre-cutover row settles against the Stripe Customer stored on the operation and never the organization's new customer.",
    "The event alias maps the legacy event name to the canonical seller event during ingestion and rejects the buyer event.",
  ].join("\n");
  assert.equal(projectCurrentMarkdown(input).text, input);
});

test("decodes escaped source identifiers and operators losslessly", () => {
  const projected = projectCurrentMarkdown([
    "- Minimum requirements: If only 1 requirement with weight \\> 0, score \\= score\\_vr × weight\\_r / weight\\_r \\= score\\_vr.",
    "- TCO feeds Blended Score via tco\\_percentile, weighted by tco\\_value\\_weight.",
  ].join("\n"));
  assert.match(projected.text, /weight > 0/);
  assert.match(projected.text, /score_vr × weight_r \/ weight_r = score_vr/);
  assert.match(projected.text, /tco_percentile/);
  assert.match(projected.text, /tco_value_weight/);
});

test("preserves valid table shape while projecting current cells", () => {
  const projected = projectCurrentMarkdown([
    "| State | Rule | Source |",
    "| --- | --- | --- |",
    "| `active` | Per this prompt, writes are allowed. | Master Spec §8.2 |",
    "| `retired` | Writes are rejected. | Appendix L.4 |",
  ].join("\n"));
  const lines = projected.text.split("\n");
  assert.equal(lines.length, 4);
  assert.ok(lines.every((line) => (line.match(/\|/g) ?? []).length === 4));
  assert.match(lines[2], /writes are allowed/);
  assert.match(lines[3], /`retired`/);
});

test("preserves valid routes and reports malformed routes", () => {
  const valid = projectCurrentFragment("GET `/sellers/:slug` returns the public profile.");
  assert.equal(valid.text, "GET `/sellers/:slug` returns the public profile.");
  const malformed = projectCurrentFragment("GET /sellers:slug returns the public profile.");
  assert.ok(malformed.diagnostics.some((diagnostic) => diagnostic.code === "dangling_fragment"));
});

test("fails closed on heterogeneous unresolved essentials", () => {
  const projected = projectCurrentMarkdown(
    "Only the public caller allowed by the named route may execute `convex/http.ts` and return the exact rejection named by the behavior rule.",
  );
  assert.throws(() => assertProjectionIntegrity(projected), /unresolved_essential/);
});

test("shared unresolved guard rejects vague named outcomes and scopes", () => {
  for (const placeholder of [
    "the named result",
    "the named response",
    "the named receipt",
    "the named rejection",
    "the named scope",
    "the named channel",
    "the named lifecycle",
    "the named viewport",
    "its named result",
    "the exact named response",
    "is the bounded behavior being delivered",
  ]) {
    assert.equal(hasUnresolvedContractPlaceholder(placeholder), true, placeholder);
  }
  assert.equal(
    hasUnresolvedContractPlaceholder(
      "HTTP 404 is returned and `reports/evidence/authorization-denial.json` stores the same-commit proof receipt.",
    ),
    false,
  );
});

test("nativeizes current observability triggers and proof receipts", () => {
  const projected = projectCurrentFragment(
    "A change to the Master, Appendix J, or the observability registry defines a new signal and invalidates the named receipt.",
  );
  assert.equal(
    projected.text,
    "A change to the canonical observability registry defines a new signal and invalidates the same-commit proof receipt.",
  );
  assert.doesNotMatch(projected.text, /the Master|Appendix J|the named receipt|,,/i);
  assertProjectionIntegrity(projected);

  const withoutArticle = projectCurrentFragment(
    "The Master, Appendix J, or observability registry defines canonical Score metrics and invalidates the named receipt.",
  );
  assert.equal(
    withoutArticle.text,
    "The canonical observability registry defines canonical Score metrics and invalidates the same-commit proof receipt.",
  );
  assertProjectionIntegrity(withoutArticle);
});

test("removes a source anchor from a current comma-separated rule without a dangling delimiter", () => {
  const projected = projectCurrentFragment(
    "Retention enforces Data Privacy, Buyer Plan Tiers, §39, and Solo-Tier Surface Treatment without copying limits inline.",
  );
  assert.equal(
    projected.text,
    "Retention enforces Data Privacy, Buyer Plan Tiers, and Solo-Tier Surface Treatment without copying limits inline.",
  );
  assertProjectionIntegrity(projected);
});

test("drops a source-only rule list while retaining the preceding executable sentence", () => {
  const projected = projectCurrentFragment(
    "Benchmark comparison MUST NOT change a phase gate. The analytics source, retention, residency, and privacy rules remain §17.3.3, §48.4.7, §51.7.3, and §6.8.4.3.",
  );
  assert.equal(projected.text, "Benchmark comparison MUST NOT change a phase gate.");
  assertProjectionIntegrity(projected);
});

test("removes a parenthetical source list without leaving punctuation", () => {
  const projected = projectCurrentFragment(
    "This rule adds no billing semantics; those land in their canonical sections (§4, §5, §34, §44). It governs only what the user sees.",
  );
  assert.equal(
    projected.text,
    "This rule adds no billing semantics; those land in their canonical sections. It governs only what the user sees.",
  );
  assertProjectionIntegrity(projected);
});

test("drops a canonical consumer pointer and historical citation note", () => {
  const projected = projectCurrentFragment(
    "This subsection is the canonical residency contract consumed by Deployment Regions, §4, §32, §41, §42, and Registry. Historical citations resolve here.",
  );
  assert.equal(projected.text, "");
  assert.equal(projected.kind, "history_only");
  assertProjectionIntegrity(projected);
});

test("projection is idempotent and preserves inline-code ellipses", () => {
  const projected = projectCurrentMarkdown(
    "The assertion `UPDATE rows ... WHERE version = expected_version` rejects a stale write and preserves the prior row.",
  );
  assertProjectionIntegrity(projected);
  assert.equal(projectCurrentMarkdown(projected.text).text, projected.text);
  assert.match(projected.text, /`UPDATE rows \.\.\. WHERE version = expected_version`/);
});

test("nativeizes expanded issue-title citations while retaining the executable rule", () => {
  const projected = projectCurrentMarkdown([
    "Per Feature Access Matrix (Comprehensive), only an authenticated Workspace Owner may create the row.",
    "See Phase Advancement API.",
    "| Rule | Reference |",
    "| --- | --- |",
    "| Reject an unauthorized write without mutation. | Governed by Requirement Status State Machine. |",
  ].join("\n"));
  assert.equal(projected.text, [
    "only an authenticated Workspace Owner may create the row.",
    "| Rule | Reference |",
    "| --- | --- |",
    "| Reject an unauthorized write without mutation. |  |",
  ].join("\n"));
  assert.doesNotMatch(projected.text, /Feature Access Matrix|Phase Advancement API|Requirement Status State Machine/);
  assertProjectionIntegrity(projected);
});

test("drops orphan numbered and bulleted markers", () => {
  const projected = projectCurrentMarkdown([
    "1.",
    "-",
    "* ",
    "2. Keep the committed value.",
  ].join("\n"));
  assert.equal(projected.text, "2. Keep the committed value.");
  assertProjectionIntegrity(projected);
});

test("prunes source-history checksum prose without deleting a current value", () => {
  const projected = projectCurrentFragment(
    "Current value: `active`; the prior source checksum and retained wording from the previous pass were planning evidence.",
  );
  assert.equal(projected.text, "Current value: `active`.");
  assert.doesNotMatch(projected.text, /checksum|retained|previous|planning/i);
});

test("preserves an executable proof checksum contract", () => {
  const input = "The receipt binds the implementation checksum to the current value and rejects a mismatch.";
  assert.equal(projectCurrentFragment(input).text, input);
});

test("removes planning wrappers and preserves their executable clauses", () => {
  const projected = projectCurrentMarkdown([
    "AC 6: Requests from another organization return 404 without revealing object existence.",
    "Acceptance criterion #5 — The handler rejects stale writes and preserves the committed row.",
    "The row remains Backlog and unready; when enabled, every denied request leaves stored state unchanged.",
    "This is an outcome parent created during source repair; every accepted write records one audit result.",
  ].join("\n"));
  assert.equal(projected.text, [
    "Requests from another organization return 404 without revealing object existence.",
    "The handler rejects stale writes and preserves the committed row.",
    "when enabled, every denied request leaves stored state unchanged.",
    "every accepted write records one audit result.",
  ].join("\n"));
  assert.doesNotMatch(projected.text, /AC 6|acceptance criterion|Backlog|outcome parent|source repair/i);
});

test("preserves genuine product-phase lifecycle behavior", () => {
  const input = "During Phase 6 the workspace moves from `validated` to `phase_locked` and rejects a direct rollback.";
  assert.equal(projectCurrentFragment(input).text, input);
});

test("drops section-numbering authoring notes before stripping their source pointers", () => {
  const projected = projectCurrentFragment(
    "Section-numbering note (Phase 14.10 — 2026-04-28). Phase 14.10's brief named §44 as the edit target. In the v7 baseline §44 is Performance Requirements; the consumption model lives in §34.3.3 and §34.11. The references already landed in prior phases consistently cite §44, so the subsection was landed here.",
  );
  assert.equal(projected.text, "");
  assert.equal(projected.kind, "history_only");
  assertProjectionIntegrity(projected);
});

test("never emits malformed remnants left by legacy stripping", () => {
  const authority = projectCurrentFragment(
    "Higher-authority boundaries: Master Spec v7.1.0a §28.1 and §50.2.1.",
  );
  assert.equal(authority.text, "");
  assert.equal(authority.kind, "history_only");
  assertProjectionIntegrity(authority);

  for (const input of ["Higher-authority boundaries:.0a", "Source binding. *,"]) {
    const projected = projectCurrentFragment(input);
    assert.equal(projected.text, "");
    assert.ok(projected.diagnostics.some((diagnostic) => diagnostic.code === "dangling_fragment"));
    assert.throws(() => assertProjectionIntegrity(projected), /dangling_fragment/);
  }
});

test("drops a malformed sentence but retains a separate current rule", () => {
  const projected = projectCurrentFragment(
    "The operational rule lives in. Every unauthorized request returns 404 without revealing object existence.",
  );
  assert.equal(projected.text, "Every unauthorized request returns 404 without revealing object existence.");
  assert.ok(projected.diagnostics.some((diagnostic) => diagnostic.code === "dangling_fragment"));
});

test("removes a trailing defined-by source citation without dropping the current rule", () => {
  const projected = projectCurrentFragment(
    "The subject receives only the redacted summary and `ops_decision_public_note` defined by §4.11.",
  );
  assert.equal(
    projected.text,
    "The subject receives only the redacted summary and `ops_decision_public_note`.",
  );
  assertProjectionIntegrity(projected);
});

test("drops source-binding history and strips version wrappers from current rules", () => {
  const projected = projectCurrentMarkdown([
    "**Source binding.** The current authority is this Master Spec section; retired summaries are historical provenance only.",
    "The service kind is `public_api` (V12 add).",
    "Phase V11 remediation — unauthorized reads MUST return HTTP 404 without revealing object existence.",
  ].join("\n"));
  assert.equal(projected.text, [
    "The service kind is `public_api`.",
    "unauthorized reads MUST return HTTP 404 without revealing object existence.",
  ].join("\n"));
  assert.doesNotMatch(projected.text, /source binding|retired|historical|V11|V12|remediation/i);
  assertProjectionIntegrity(projected);
});

test("removes expanded acceptance and failure-mode citations without losing the current rule", () => {
  const projected = projectCurrentMarkdown([
    "Per OutcomeContract (Per-Capability, Versioned, Ops-Managed) acceptance criterion #5, every contract's default-on-timeout is `rejected` unless `requires_explicit_user_signal=true`.",
    "Late `rejected` signals MUST create a ContestRecord and notify Ops within five minutes (AIOperation (Org-Scoped) acceptance criterion #11).",
    "Failure Modes Addressed Failure Mode #4 — the operation evaluates entitlement at write time, not settlement time.",
    "No progress line may render more than 500 ms before its backend job starts. Per Onboarding Surface — Minutes 0–3 AC 8.",
  ].join("\n"));
  assert.equal(projected.text, [
    "every contract's default-on-timeout is `rejected` unless `requires_explicit_user_signal=true`.",
    "Late `rejected` signals MUST create a ContestRecord and notify Ops within five minutes.",
    "The operation evaluates entitlement at write time, not settlement time.",
    "No progress line may render more than 500 ms before its backend job starts.",
  ].join("\n"));
  assert.doesNotMatch(projected.text, /acceptance criterion|failure mode|\bAC\s*\d+/i);
  assertProjectionIntegrity(projected);
});

test("removes source-era registry wrappers while keeping exact current values", () => {
  const projected = projectCurrentMarkdown([
    "- **capability_id:** **Buyer - OrgIntelligence tri-split (Initial Registry Seed (v6 → v7) row 16 + Entitlement Matrix (Authoritative) extension)**",
    "| Capability | Initial Registry Seed (v6 → v7) #18 `kb_to_capability_suggestion`. |",
    "The service kind is `public_api` (V12 add).",
    "Emit `environment_definition_updated` (Controlled Vocabulary Registry extension — registered in this prompt) with `actor_user_id` and `new_env_id`.",
    "`console_bridge_event_kind` is **Authored-Extension permitted** — new event kinds register via `appendix_m_coverage_on_diff` plus an Authored-Extension ledger row.",
  ].join("\n"));
  assert.equal(projected.text, [
    "- **capability_id:** **Buyer - OrgIntelligence tri-split**",
    "| Capability | `kb_to_capability_suggestion`. |",
    "The service kind is `public_api`.",
    "Emit `environment_definition_updated` with `actor_user_id` and `new_env_id`.",
    "`console_bridge_event_kind` accepts new event kinds only when they register via `appendix_m_coverage_on_diff`.",
  ].join("\n"));
  assert.doesNotMatch(projected.text, /Initial Registry Seed|registered in this prompt|V12 add|Authored-Extension|ledger row/i);
  assertProjectionIntegrity(projected);
});

test("drops validation and parent-close control-plane history", () => {
  const projected = projectCurrentMarkdown([
    "Validation trigger: separate reference-only paths from owned write paths, then rerun source checksum, path-ownership, dependency, ticket-integrity, and exact Linear readback gates. Until they pass, this issue remains Backlog and unready.",
    "Authority basis — `reports/evidence/r4-phase3-scenario-score-contract.json` is required before this parent closes. It must contain source hashes and protected-CI readback.",
    "Only the authenticated Buyer Workspace actor may read the matching organization's request data.",
  ].join("\n"));
  assert.equal(
    projected.text,
    "Only the authenticated Buyer Workspace actor may read the matching organization's request data.",
  );
  assert.doesNotMatch(projected.text, /Validation trigger|source checksum|Linear readback|parent closes|source hashes/i);
  assertProjectionIntegrity(projected);
});

test("nativeizes required-artifact and release-window wording", () => {
  const projected = projectCurrentMarkdown([
    "Required missing artifacts: `convex/handler.ts` and `tests/integration/handler.spec.ts`.",
    "Later-release rows remain registered/inactive without entering R0 proof.",
    "R1-only Amendment Protocol is not a prerequisite and must not enter this R0 proof.",
  ].join("\n"));
  assert.equal(projected.text, [
    "Required artifacts: `convex/handler.ts` and `tests/integration/handler.spec.ts`.",
    "Rows not enabled for the current release remain registered, inactive, and excluded from proof.",
    "The later-release Amendment Protocol is not a prerequisite and must not enter current-release proof.",
  ].join("\n"));
  assert.doesNotMatch(projected.text, /Required missing|Later-release rows|\bR[01](?:-only)?\b/i);
  assertProjectionIntegrity(projected);
});

test("repairs only deterministic remnants created by source-reference removal", () => {
  const projected = projectCurrentMarkdown([
    "Global Inbox toggle, per-channel toggles, and preference inheritance are governed by User Preferences (Gap 29.2).",
    "The UX's finite-seat display and 's stale `paid_seat_count` example must not appear in runtime.",
    "Silent downgrade to desktop-only is prohibited.",
    "Parse failure MUST trigger billing reversal via Outcome Resolver Outcome Resolver.",
    "Completion means /Phase 4-5 can request one secure link receipt.",
    "Deployed render-path evidence remains required —.",
  ].join("\n"));
  assert.equal(projected.text, [
    "Saved preference settings control the Global Inbox toggle, per-channel toggles, and preference inheritance.",
    "The finite-seat display and stale `paid_seat_count` example must not appear in runtime.",
    "Silent desktop-only downgrade is prohibited.",
    "Parse failure MUST trigger billing reversal via Outcome Resolver.",
    "Phase 4-5 can request one secure link receipt.",
    "Deployed render-path evidence remains required.",
  ].join("\n"));
  assertProjectionIntegrity(projected);
});

test("removes remaining numbered source-rule citations around self-contained behavior", () => {
  const projected = projectCurrentMarkdown([
    "Free Allowance MUST be exhausted before any wallet draw; verified by FreeAllowanceCounter (Org-Scoped, Per-Capability) acceptance criterion #2.",
    "AIWallet (Org-Scoped, Pooled Across Consoles) Failure Mode #6 — a residency change requires the Ops Finance migration runbook.",
    "The table MUST carry `surface_throttling_class` as defined in Capability Registry Field and CapabilityRegistryEntry (Platform-Scoped, Ops-Managed) acceptance criterion #8 (Phase 14.10.1).",
    "The AIWallet (Org-Scoped, Pooled Across Consoles) acceptance criterion #1 enforces this at the schema layer (one wallet row per Org; pooling is enforced by the absence of a `console` column).",
    "Release basis — AIWallet (Org-Scoped, Pooled Across Consoles) Failure Mode #6 — residency change requires the Ops Finance migration runbook.",
  ].join("\n"));
  assert.equal(projected.text, [
    "Free Allowance MUST be exhausted before any wallet draw.",
    "A residency change requires the Ops Finance migration runbook.",
    "The table MUST carry `surface_throttling_class`.",
    "At the schema layer, one wallet row is stored per Org; pooling is enforced by the absence of a `console` column.",
    "Residency change requires the Ops Finance migration runbook.",
  ].join("\n"));
  assert.doesNotMatch(projected.text, /acceptance criterion|failure mode|Phase 14/i);
  assertProjectionIntegrity(projected);
});

test("removes non-executable parent and reconciliation references", () => {
  const projected = projectCurrentMarkdown([
    "This is an outcome parent.",
    "Reversal basis — `Deterministic Platform Reference-Data Orchestration-3-ac9-ac14-grandfather-attestation`.",
    "`Deterministic Platform Reference-Data Orchestration-3-ac9-ac14-grandfather-attestation`",
    "Floors MUST be sign-off gated by Ops Finance before any change; tracked as `RECONCILIATION.md → s → Rate Card Table (MS Baseline — 12 Rows) Rate Card Floors`.",
    "Every replaced reference resolves to a live current heading and active Linear owner.",
  ].join("\n"));
  assert.equal(projected.text, [
    "Floors MUST be sign-off gated by Ops Finance before any change.",
    "Every replaced reference resolves to a live current heading.",
  ].join("\n"));
  assert.doesNotMatch(projected.text, /outcome parent|Reversal basis|RECONCILIATION|MS Baseline|Linear owner/i);
  assertProjectionIntegrity(projected);
});

test("turns source-agreement prose into the exact current same-invite rule", () => {
  const projected = projectCurrentMarkdown([
    "Deliver Seller Onboarding Reactivation Single Source by enforcing this exact runtime condition: SellerOnboardingSession Computation Rules, Stage 1 Workflow step 2, Stage 1 failure mode 6, and Stage 1 acceptance rule MUST agree that a same-invite seller return re-enters the existing row and preserves `stage_1_arrival_at`.",
    "**Exact assertion.** SellerOnboardingSession Computation Rules, Stage 1 Workflow step 2, Stage 1 failure mode 6, and Stage 1 acceptance rule MUST agree that a same-invite seller return transitions to `reactivated` on first response.",
    "The positive fixture returns pass only when this exact assertion holds: SellerOnboardingSession Computation Rules, Stage 1 failure mode 6, and Stage 1 acceptance rule MUST agree that a same-invite seller return preserves `stage_1_arrival_at`.",
  ].join("\n"));
  assert.equal(
    projected.text,
    [
      "A same-invite seller return re-enters the existing row and preserves `stage_1_arrival_at`.",
      "A same-invite seller return transitions to `reactivated` on first response.",
      "The positive fixture returns pass only when a same-invite seller return preserves `stage_1_arrival_at`.",
    ].join("\n"),
  );
  assert.doesNotMatch(projected.text, /Deliver Seller|MUST agree|failure mode|acceptance rule/i);
  assertProjectionIntegrity(projected);
});

test("removes phase wrappers and broken lifecycle-summary residue", () => {
  const projected = projectCurrentMarkdown([
    "The states include `hard_capped_auto_topup_monthly_cap` *(Phase 7 V7)* and `payment_failed_grace`.",
    "The AI Wallet Service policy summary:.",
    "Lifecycle values are `active`, `suspended`, and `closed`; all other transitions reject before mutation.",
  ].join("\n"));
  assert.equal(projected.text, [
    "The states include `hard_capped_auto_topup_monthly_cap` and `payment_failed_grace`.",
    "Lifecycle values are `active`, `suspended`, and `closed`; all other transitions reject before mutation.",
  ].join("\n"));
  assert.doesNotMatch(projected.text, /Phase 7|summary:\./i);
  assertProjectionIntegrity(projected);
});

test("removes an expanded preference-settings pointer from a complete control list", () => {
  const projected = projectCurrentFragment(
    "Global Inbox toggle, per-channel toggles, per-notification-type toggles, entity mute, quiet hours, Do Not Disturb, and preference inheritance are governed by User Preferences (Gap 29.2).",
  );
  assert.equal(
    projected.text,
    "Saved preference settings control the Global Inbox toggle, per-channel toggles, per-notification-type toggles, entity mute, quiet hours, Do Not Disturb, and preference inheritance.",
  );
  assertProjectionIntegrity(projected);
});

test("preserves product closure labels while repairing a trailing provenance dash", () => {
  const projected = projectCurrentFragment(
    "13. `phase_13_contract_closure` — Phase 13: Contract & Closure —.",
  );
  assert.equal(
    projected.text,
    "13. `phase_13_contract_closure` — Phase 13: Contract & Closure.",
  );
  assertProjectionIntegrity(projected);
});
