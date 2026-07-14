# Fixture

## 37.2 Internationalization (i18n) {#37.2-internationalization-(i18n)}

**Production locale launch set.** v7.1.1 is not English-only. The production UI locale set is `en-US`, `en-GB`, `es-ES`, `fr-FR`, `de-DE`, `ja-JP`, `ar-SA`, and `he-IL`.

### 37.2.1 Solo / Free Microcopy Localization Manifest {#37.2.1-solo-free-microcopy-localization-manifest}

The `solo_microcopy_template_parity` gate treats Solo / Free seller and Solo billing copy as critical localization scope. Translated strings live in active `LocalizationBundle` rows (§47.3.1.G); this manifest defines the stable key groups that every active bundle MUST carry for each Appendix J `supported_ui_locale` value: `en-US`, `en-GB`, `es-ES`, `fr-FR`, `de-DE`, `ja-JP`, `ar-SA`, and `he-IL`.

| Key group | Surfaces | Required binding |
| :---- | :---- | :---- |
| `billing.plan_transition.solo.surface_entering` | §34.19.4.A | Entering-Solo copy. |
| `billing.plan_transition.solo.surface_exiting` | §34.19.4.A | Exiting-Solo copy. |
| `billing.plan_transition.solo.envelope_entering` | §34.19.4.A | Envelope entering copy. |
| `billing.plan_transition.solo.wallet_exiting` | §34.19.4.A | Wallet exiting copy. |
| `billing.plan_transition.solo.per_eval_mode_change` | §34.19.4.A | Per-eval / per-bid mode change. |
| `billing.solo_card.subscription` | §44.6.2 | Subscription card. |
| `billing.solo_card.per_eval` | §44.6.2 | Per-evaluation card. |
| `billing.solo_card.per_bid` | §44.6.2 | Per-bid card. |
| `billing.solo_envelope.throttling_paused` | §44.6.4 | Throttling toast. |
| `pipeline.surface.step.solo_buyer` | UX §5.2.19 | Buyer Solo steps. |
| `pipeline.surface.step.solo_seller` | UX §5.2.19 | Seller steps. |
| `seller_hero_moment.counter_card` | §22.20.6 | Counter card. |
| `seller_hero_moment.stake_reveal` | §22.20.6 | Stake reveal. |

**Parity rule.** English fallback is forbidden for these key groups in production. ICU variables MUST remain stable across locales.

## 37.3 Right-to-Left (RTL) Support {#37.3-right-to-left-(rtl)-support}

## 37.6 Acceptance Criteria {#37.6-acceptance-criteria}

9. RTL test fixtures MUST prove `useDirectionality()` applies `dir`; production translation availability is required through active LocalizationBundle rows for every Appendix J `supported_ui_locale` value before the v7.1.1 stamp.

### 34.19.4.A Solo-Bordering Transition Microcopy

5. **Surface-onset acknowledgement.**
6. **Envelope-vs-wallet semantic difference.**
7. **Per-eval / per-bid charge-mode change acknowledgement**

Loops.so email templates and in-app confirmation modals BOTH render the 7-element microcopy verbatim; an automated content-diff CI gate `solo_microcopy_template_parity` asserts no drift between the email and in-app copy.

#### 47.3.1.G LocalizationBundle {#47.3.1.g-localizationbundle}

| Field | Type | Constraints | Notes |
| :---- | :---- | :---- | :---- |
| `locale` | BCP-47 enum (Appendix J `supported_ui_locale`) | Required | Production launch set in §37.2 |

**Release rule.** `active` requires `critical_string_coverage_percent=100`, `coverage_percent >= 99.5`, ICU plural fixture pass, RTL mirror fixture pass where `rtl=true`, and Appendix I localization keys present for all active error codes.

### 5.2.19 PipelineSurface

**Localization binding.** Buyer Solo step labels resolve through Master Spec §37.2.1 key group `pipeline.surface.step.solo_buyer`; Seller compressed step labels resolve through `pipeline.surface.step.solo_seller`. Component code MUST consume localization keys, not inline English strings.

### 8.1.2 Solo-Tier Billing Surface

**Localization binding.** All Solo Card copy and the throttling toast resolve through Master Spec §37.2.1 key groups `billing.solo_card.subscription`, `billing.solo_card.per_eval`, `billing.solo_card.per_bid`, and `billing.solo_envelope.throttling_paused`. Component code MUST consume localization keys, not inline English strings.

| `solo_microcopy_template_parity` | V11 | **`runtime_active`** (promoted 2026-07-07; detector `tools/spec-lint/gates/solo_microcopy_template_parity.ts`; verified PASS on live Master Spec, UX spec, and pass/fail fixtures) | §37.2.1 localization-key manifest | Every key has coverage for `en-US`, `en-GB`, `es-ES`, `fr-FR`, `de-DE`, `ja-JP`, `ar-SA`, `he-IL`. Stale shorthand locale lists and English-only v7.1.x carve-outs fail. | PR comment. | §37.2.1 |
