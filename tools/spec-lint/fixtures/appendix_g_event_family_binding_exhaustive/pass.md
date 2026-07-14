## 51.1.1 Canonical Event Families {#51.1.1-canonical-event-families}

| Family | Scope |
|---|---|
| `ai_capability` | AI events |
| `workspace` | Workspace events |
| `billing` | Billing events |
| `vendor` | Vendor events |
| `seller_kb` | KB events |
| `bid` | Bid events |
| `marketplace` | Marketplace events |
| `identity` | Identity events |
| `ops_surface` | Ops events |
| `analytics_meta` | Analytics meta-events |
| `system_job` | System jobs |

## 51.1.5 Event Catalog Cross-Reference (-> Appendix G) {#51.1.5-event-catalog-cross-reference-appendix-g}

| Appendix-G Subsection | Family | Events |
|---|---|---|
| Standard Events | `workspace`, `vendor` | `workspace_created` |
| KB Events | `seller_kb` | `kb_retrieve_invoked` |
| Ops Events | `ops_surface` | `ops_session_started` |

## Appendix G: PostHog Event Taxonomy {#appendix-g-posthog-event-taxonomy}

### Required Standard Property Set (Appendix G Preamble) {#appendix-g-standard-property-set}

**Event-Family Binding Matrix.** Every Appendix G event inherits exactly one Appendix J `event_family`.

| Appendix G subsection / event block | Default `event_family` | Notes |
|---|---|---|
| AI | `ai_capability` | ok |
| Workspace | `workspace` | ok |
| Billing | `billing` | ok |
| Vendor | `vendor` | ok |
| KB | `seller_kb` | ok |
| Bid | `bid` | ok |
| Marketplace | `marketplace` | ok |
| Identity | `identity` | ok |
| Ops | `ops_surface` | ok |
| Analytics | `analytics_meta` | ok |
| Jobs | `system_job` | ok |

## Appendix J: Controlled Vocabulary Registry {#appendix-j-controlled-vocabulary-registry}

#### `event_family`

`ai_capability`, `workspace`, `billing`, `vendor`, `seller_kb`, `bid`, `marketplace`, `identity`, `ops_surface`, `analytics_meta`, `system_job`

#### `sampling_rate_kind`
