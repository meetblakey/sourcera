## 3.6 Form & Input Tokens {#3.6-form-and-input-tokens}

Master Spec §3.6.1 is canonical. `UX_Design_of_Sourcera.md` §2.9 is a designer-facing mirror. Use `duplicate_requirement` (Appendix I).

## 3.9 Cursor Presence Visualization {#3.9-cursor-presence-visualization}

**Multi-device sessions.** Each device receives a distinct hue per active PresenceRecord. The roster represents one person with `+N devices`. Test `presence_multi_device_hue_distinct` passes.

## 3.11 Dark Mode Parity Rules {#3.11-dark-mode-parity-rules}

The setting is managed by `ops_admin` per §50.3.

## 3.12 Presence & Unread Tracking {#3.12-presence-and-unread-tracking}

PresenceAvatarStack cardinality is canonical in §38.12. View all opens the roster.

## 3.14 Pipeline Surface Compression {#3.14-pipeline-surface-compression}

Buyer `St / Df / Sc / Dc`; Seller `Rc / Df / Rv / Sb`. Each localized set is pairwise distinct and uses an aria-label.

## 38.12 Presence Avatar Stack Component {#38.12-presence-avatar-stack-component}

The stack renders at most 5 avatar identities on `desktop` / `tablet`, at most 2 on `mobile_xs` / `mobile_sm`, and at most 20 roster identities before View all.

## 2.9 Form & Input Tokens

**Authority.** Master Spec §3.6.1 is canonical. This is a designer-facing mirror and MUST NOT introduce values.

## 5.2.19 PipelineSurface

Buyer: St / Df / Sc / Dc; Seller: Rc / Df / Rv / Sb. Localized labels are pairwise distinct and have an aria-label.

| `section3_presence_pipeline_authority_consistency` | content_consistency | **`runtime_active`** (detector `tools/spec-lint/gates/section3_presence_pipeline_authority_consistency.ts`; verified PASS on live Master Spec and pass/fail fixtures) |
