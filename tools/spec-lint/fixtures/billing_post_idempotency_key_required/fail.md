# Fixture

### 32.8.0 Common Conventions for Billing Endpoints {#32.8.0-common-conventions-for-billing-endpoints}

- **Idempotency for POST mutations.** POST endpoints may accept idempotency headers.

### 32.8.3 POST /v1/orgs/{org_id}/wallet/cap — Set Wallet Overage Cap {#32.8.3-post-wallet-cap}

**Idempotency.** Recommended. `Idempotency-Key` header may be used. Replay returns the old response.

### 32.8.4 POST /v1/orgs/{org_id}/wallet/auto-topup — Configure Auto Top-Up {#32.8.4-post-wallet-auto-topup}

**Request body.**

```json
{"enabled": true}
```

### 32.8.23 Acceptance Criteria (Billing Endpoints) {#32.8.23-acceptance-criteria-billing}

22. **POST endpoints should be idempotent.** Tests should cover replay.
