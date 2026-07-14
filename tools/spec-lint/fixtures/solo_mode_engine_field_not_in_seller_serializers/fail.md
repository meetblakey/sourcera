# Solo Mode No-Leak Fixture

### 2.8.6 Cross-Console Behavior {#2.8.6-cross-console-behavior}

The seller never learns the buyer's mode.

### 2.8.7 Acceptance Criteria {#2.8.7-acceptance-criteria}

10. Seller APIs should avoid buyer-only mode fields.

### 4.5.1 Marketplace Listing {#4.5.1-marketplace-listing}

| Field | Notes |
| :---- | :---- |
| `evaluation_owner_mode` | Returned to marketplace callers. |

### 4.7.1 Console Bridge Event {#4.7.1-console-bridge-event}

| Field | Notes |
| :---- | :---- |
| `evaluation_owner_mode` | Carried to seller. |

### 27. Vendor Discovery & RFP Marketplace {#27.-vendor-discovery-and-rfp-marketplace}

Marketplace cards include `evaluation_owner_mode`.

### 32.8.1 GET /v1/pricing — Public Pricing API {#32.8.1-get-pricing}

Response includes `evaluation_owner_mode`.

### 32.10.4 Seller Bid Workspace Endpoints {#32.10.4-seller-bid-workspace-endpoints}

Seller response includes `evaluation_owner_mode`.

### 32.10.4.B Seller Inbox, NDA Execution, and Seller Analytics Endpoints {#32.10.4.b-seller-inbox-nda-execution-and-seller-analytics-endpoints}

Seller response includes `evaluation_owner_mode`.

### 32.10.4.A Seller Teams, Triage Queue, and Vendor Response Endpoints {#32.10.4.a-seller-teams-triage-queue-and-vendor-response-endpoints}

Seller response includes `evaluation_owner_mode`.

### 32.10.5 Seller KB Management Endpoints {#32.10.5-seller-kb-management-endpoints}

Seller response includes `evaluation_owner_mode`.

#### M.5.4 Catalog index {#m-5-4-catalog-index}

| Gate ID | Source phase | Runtime status | Scope | Trigger | Failure mode | Authority anchor |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| `solo_mode_engine_field_not_in_seller_serializers` | 14.4 | `spec_binding_pending_pack_m02_3` | Spec-tree seller no-leak contract. | No seller payload may expose the field. | PR comment. | §2.8.6. |
