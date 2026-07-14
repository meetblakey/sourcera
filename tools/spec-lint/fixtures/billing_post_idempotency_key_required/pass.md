# Fixture

### 32.8.0 Common Conventions for Billing Endpoints {#32.8.0-common-conventions-for-billing-endpoints}

- **Idempotency for POST mutations.** Every state-mutating POST endpoint in §32.8 requires an `Idempotency-Key` request header unless locally declared N/A. Replay scope is 24 hours. Same-key/same-body replay returns `X-Idempotent-Replay: true`; same-key/different-body replay returns HTTP 409 `idempotency_key_request_mismatch`.

### 32.8.3 POST /v1/orgs/{org_id}/wallet/cap — Set Wallet Overage Cap {#32.8.3-post-wallet-cap}

**Idempotency.** REQUIRED. `Idempotency-Key` header per §32.8.0. Same-key/same-body replay returns `X-Idempotent-Replay: true` with the original response. Same-key/different-body replay returns HTTP 409 `idempotency_key_request_mismatch`. Replay MUST NOT duplicate wallet state transitions, audit rows, webhooks, Stripe mutations, async jobs, or scheduled follow-up work.

### 32.8.23 Acceptance Criteria (Billing Endpoints) {#32.8.23-acceptance-criteria-billing}

22. **Every state-mutating §32.8 POST endpoint MUST declare local idempotency semantics.** Each POST sub-section MUST include an **Idempotency** block declaring REQUIRED or N/A. State-mutating POST endpoints MUST require `Idempotency-Key`, MUST return `X-Idempotent-Replay: true` on same-key/same-body replay, MUST reject same-key/different-body replay with HTTP 409 `idempotency_key_request_mismatch`, and MUST NOT duplicate audit rows, webhooks, Stripe mutations, async jobs, or scheduled follow-up work. CI gate `billing_post_idempotency_key_required` asserts.
