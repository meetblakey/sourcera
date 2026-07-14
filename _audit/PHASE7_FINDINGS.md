# Phase 7 V7 — Adversarial Verification Scratch Findings

**Audit baseline.** Master Spec v7.1.0 (2026-04-28). Scratch log for the Phase 7 / Prompt V7 adversarial verification per `Audit_Prompts.md` lines 1893–1912. Promotions to `DEFECT_LEDGER.md` and the canonical sign-off live at `_audit/PHASE7_VERIFY.md`.

**Defect-id mnemonic.** `D-V7-NNN`.

**Halt-rule verdict.** **FAIL.** D-CONS-001 (P0; open) + D-CONS-002 (P0; open) confirmed reproducible under V7 Adversarial Check 1.

---

## 1. Walk Summary

| Source | Coverage |
|---|---|
| `PHASE34.1_FINDINGS.md` (D-PT) | §34.1 buyer + seller plan tiers; §34.2.1 / §34.2.2 / §34.2.5 |
| `PHASE_CONS_FINDINGS.md` (D-CONS) | §34.3 / §34.10 / §34.11 — **2 P0s filed (D-CONS-001 publish-gating threshold; D-CONS-002 settlement-immutability)** |
| `PHASE34.8_FINDINGS.md` (D-EM) | §34.8 Entitlement Matrix |
| `PHASE34.16_FINDINGS.md` (D-MD) | §34.16 Marketplace Discovery Pricing |
| `PHASE34.19_FINDINGS.md` (D-34.19) | §34.5 / §34.6 / §34.19 |
| `PHASE34.PXC_FINDINGS.md` (D-PXC) | §34.14 / §34.15 / §34.16 / §34.17 / §34.18 cross-document reconciliation |

§34 sub-section coverage: §34.1, §34.2.5, §34.3, §34.5, §34.6, §34.8, §34.10, §34.11, §34.14, §34.15, §34.16, §34.17, §34.18, §34.19 walked end-to-end. §34.4, §34.7, §34.9, §34.12 (partial), §34.13 sampled-only. §44 sampled-only (bound to Phase 10).

---

## 2. Adversarial Scenario Outcomes

### Scenario 1 — Worst-case AIOperation (12% drift + auto-topup cap + 30 contests)

- 12% drift hits the D-CONS-001 (P0) threshold contradiction (10% per §4.8.6 AC #2 vs 25% per §34.3.3 row) — **HALT-rule-triggering**.
- Stranded margin-floor breach window: §34.20.2 AC #7 enforces 88% margin "at price-update time" but the 30-day breaking-change notice creates a window where new cost_base is live + old value_price applies; spec silent on operator decision. **D-V7-001 (P1).**
- Auto-topup monthly cap exhaustion: §4.8.3 wallet state enum lacks a state for auto-topup-monthly-cap-exhausted; PostHog event cannot bind. **D-V7-002 (P1).**
- 30-contest flood: §34.11.2 silent on rate-limit per (org_id, billing_admin), queue-depth back-pressure, auto-filed cap, DSAR-vs-contest deadlock. **D-V7-003 (P1).**

### Scenario 2 — Solo → Free Downgrade with KB > Free Ceiling

- §34.6.3 hard-archive at d+90 vs §34.19.6 #2 forbids Class-1 hard-archive — direct policy contradiction. **D-V7-009 (P1).**
- §34.19.3 transition table omits all Solo rows; per-eval / per-bid mid-flight handling silent at plan-transition boundary. **D-V7-004 (P1)** extending **D-34.19-010 (P1; existing)**.
- §34.19.4 microcopy 4 required elements don't acknowledge Solo-bordering surface-onset transitions (wallet widget appears post-downgrade). **D-V7-005 (P2).**

### Scenario 3 — Enterprise Pooled Wallet Across Both Consoles

- One-side Enterprise downgrade dissolves §34.12.5 collapse; three readings (bifurcate, collapse-to-single, continue-as-combined) all spec-consistent. **D-V7-006 (P1).**
- Per-console commit allocation silent under §34.12.5 single-contract; §4.8.8 has no per-console budget split field. **D-V7-007 (P2).**
- AIWallet aggregate-counter read-permission scope undefined; non-billing-admin user on Buyer Console with wallet-read access can infer Seller-console activity magnitude. **D-V7-008 (P2; revised P1→P2 on self-challenge).**
- Auto-renewal opt-out is single-Boolean per §4.8.8; per-console opt-out unaddressed. **D-V7-010 (P2).**

---

## 3. Self-Challenge Pass Result

- 10 V7 defects re-read under hostile staff-engineer posture.
- 1 severity revision: **D-V7-008 P1 → P2** (incremental magnitude inference, not unique re-identification; spec silence is the defect, not a built leak).
- 0 findings withdrawn.

---

## 4. Counterfactual Pass Result

- Scenario 1: 3 of 3 failure modes filed (D-CONS-001 confirmed reproducible; D-V7-001 / D-V7-002 / D-V7-003 NEW).
- Scenario 2: 3 of 3 failure modes filed (D-V7-009 / D-V7-004 / D-V7-005 NEW).
- Scenario 3: 4 of 4 failure modes filed (D-V7-006 / D-V7-007 / D-V7-008 / D-V7-010 NEW).

---

## 5. Out-of-Scope Findings (Bookmarked)

- **§44.1–§44.5 + §44.6.2 / §44.6.6 walk-completeness** — bound to Phase 10. V7 surfaces this as a known structural-coverage gap mirroring V6 §25.7 caveat.
- **§34.4 / §34.7 / §34.9 / §34.12-partial / §34.13 deferred sub-prompt** — recommended Phase 7.7 walk before v7.1.1 stamps.
- **D-V7-008 systemic pattern** — wallet-aggregate-counter layer sibling of V6 D-V6-001 + D-6.1-001 cross-console firewall leakage cluster. Recommend v7.1.1 cross-cutting wallet-and-bridge-aggregate-redaction sweep.

---

## 6. Sign-Off

- Defects promoted: 10 (0 P0, 5 P1, 5 P2, 0 P3) after self-challenge severity revision.
- Halt-rule: **HALTED on D-CONS-001 + D-CONS-002 P0s carried forward from PHASE_CONS** per the prompt's "zero P0 in pricing/billing" rule.
- v7.1.1 stamp gate: 10 D-V7-* defects + cross-cutting contest-rate-limit + DSAR-vs-contest deadlock-resolution sweep recommendation.
- Findings log complete; cross-references written to `DEFECT_LEDGER.md` "Phase 7 V7 Cross-References" section and `COVERAGE_MATRIX.md` "Phase 7 V7 Coverage Update Block."
- Canonical V7 verification artifact: `_audit/PHASE7_VERIFY.md`.
