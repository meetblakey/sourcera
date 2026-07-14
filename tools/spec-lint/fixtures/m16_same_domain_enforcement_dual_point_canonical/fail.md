### 48.7.3 M16 {#48.7.3-m16-buyer-referral-credit}

The CREATE-TIME hard block runs IFF the call site provided `referee_email`. The SIGNUP-TIME safety net catches SSO-resolved email-domain divergence. Both emit `m16_referral_same_domain_blocked` with `enforcement_point ∈ {create_time, signup_time}`.

**`m16_same_domain_enforcement_point_kind`**: `create_time`, `signup_time`.

| `m16_same_domain_enforcement_dual_point_canonical` | content | spec_binding_pending_pack_m02_3 | pr_lint + convex unit + post-build | The event is `m16.referral.same_domain_blocked`. Local guard `tools/spec-lint/gates/m16_same_domain_enforcement_dual_point_canonical.ts` and pass/fail fixtures protect the spec contract; deployed create-time and signup-time validator evidence remains required. | M02.3 |
