# Solo Mode No-Leak Fixture

### 2.8.6 Cross-Console Behavior {#2.8.6-cross-console-behavior}

The seller never learns the buyer's `evaluation_owner_mode`. The Console Bridge Event payload (§4.7.1) excludes the field; the Public Pricing API (§32, §4.8.9) excludes the field; the Marketplace Listing exposes only the buyer Workspace's `pipeline_stage_id`, never its mode.

### 2.8.7 Acceptance Criteria {#2.8.7-acceptance-criteria}

10. The `evaluation_owner_mode` field MUST NOT appear in any Console Bridge Event payload (§4.7.1), any seller-visible API response (§32), any Marketplace Listing serialization (§27), or the Public Pricing API (§4.8.9). The seller MUST NOT learn the buyer's mode under any code path.

### 4.5.1 Marketplace Listing {#4.5.1-marketplace-listing}

| Field | Notes |
| :---- | :---- |
| `pipeline_stage_id` | Public projection only. |

### 4.7.1 Console Bridge Event {#4.7.1-console-bridge-event}

| Field | Notes |
| :---- | :---- |
| `payload_json` | Allowlisted projection. |

### 27. Vendor Discovery & RFP Marketplace {#27.-vendor-discovery-and-rfp-marketplace}

Marketplace payloads expose public listing fields.

### 32.8.1 GET /v1/pricing — Public Pricing API {#32.8.1-get-pricing}

Response includes public rate-card data.

### 32.10.4 Seller Bid Workspace Endpoints {#32.10.4-seller-bid-workspace-endpoints}

Seller response excludes buyer-only fields.

### 32.10.4.B Seller Inbox, NDA Execution, and Seller Analytics Endpoints {#32.10.4.b-seller-inbox-nda-execution-and-seller-analytics-endpoints}

Seller response excludes buyer-only fields.

### 32.10.4.A Seller Teams, Triage Queue, and Vendor Response Endpoints {#32.10.4.a-seller-teams-triage-queue-and-vendor-response-endpoints}

Seller response excludes buyer-only fields.

### 32.10.5 Seller KB Management Endpoints {#32.10.5-seller-kb-management-endpoints}

Seller response excludes buyer-only fields.

#### M.5.4 Catalog index {#m-5-4-catalog-index}

| Gate ID | Source phase | Runtime status | Scope | Trigger | Failure mode | Authority anchor |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| `solo_mode_engine_field_not_in_seller_serializers` | 14.4 | **`runtime_active`** (promoted 2026-07-09; detector `tools/spec-lint/gates/solo_mode_engine_field_not_in_seller_serializers.ts`; verified PASS on live Master Spec and pass/fail fixtures) | Spec-tree seller no-leak contract. | No seller payload may expose the field. | PR comment. | §2.8.6. |
