# Phase 3.2 RBAC / Marketplace Overlay P1 Verification (2026-06-21)

## Scope

This verification covers D-3.2-004 and D-3.2-005 only.

Out of scope: D-3.2-001 / D-3.2-002 / D-3.2-003 Min-Tier / Solo structural-body rewrite and the §5.11 inline tier-list audit; lower-severity Phase 3.2 rows; CI runtime wiring.

## Source Changes Verified

| Defect | Required closure evidence | Landing site |
| :---- | :---- | :---- |
| D-3.2-004 | Seller Console roles are tabulated, not left as prose-only overlay notes. | Sourcera_Master_Spec.md §5.11.2 |
| D-3.2-005 | Marketplace roles and operations are tabulated with role columns and plan-source citations. | Sourcera_Master_Spec.md §5.11.3 |

## D-3.2-004 Checks

PASS — §5.11.2 exists with the heading `Seller Console Role Overlay Matrix — Seller Signals and CRM Sync`.

PASS — §5.11.2 includes explicit columns for:

- `seller_org_owner`
- `seller_org_admin`
- `seller_marketing_editor`
- `seller_integrations_admin`

PASS — §5.11.2 tabulates Seller Signals operations:

- Read SellerSignal Dashboard
- Read / configure SellerSignalDeliveryPreference
- Send Direct Invite From Cohort
- Read SellerSignalDeAnonymizationLink
- Receive Seller Signal digest / toast

PASS — §5.11.2 tabulates CRM Sync operations:

- Connect CRM provider
- Pause / resume CRMSyncConnection
- Disconnect CRMSyncConnection
- CRUD CRMFieldMapping defaults and customer-custom mappings
- CRUD CRMRoutingRule defaults and custom predicates
- Read CRMSyncActivityEvent log
- Retry failed CRMSyncActivityEvent
- Resolve Match in Review Queue
- Receive CRM Sync notifications

PASS — destructive / sensitive exceptions are explicit: `seller_integrations_admin` cannot disconnect alone and cannot mutate customer-custom CRM mappings or custom routing predicates.

## D-3.2-005 Checks

PASS — §5.11.3 exists with the heading `Marketplace Role and Plan-Gate Overlay Matrix`.

PASS — §5.11.3 includes explicit columns for:

- `marketplace_publisher`
- `marketplace_viewer`
- `marketplace_public_reader`

PASS — §5.11.3 tabulates Marketplace operations named in the remediation row:

- Match Score read
- Verification Tier request
- EOI submission
- EOI acceptance / routing
- Promoted Placement purchase
- Featured Placement purchase

PASS — §5.11.3 also tabulates the surrounding Marketplace operations needed for a buildable row group:

- Public SellerOrgPage / SoftwarePage / CategoryPage reads
- Marketplace listing search / public filters
- SellerOrgPage / SoftwarePage publishing
- Capability Declaration create / edit / publish

PASS — the EOI boundary is explicit: anonymous `marketplace_public_reader` cannot submit, accept, or route EOIs; `marketplace_viewer` can write only with active Buyer Org context.

## Ledger / Backlog Checks

PASS — `_audit/DEFECT_LEDGER.md` row D-3.2-004 status is `remediated 2026-06-21` and cites §5.11.2 plus this verification file.

PASS — `_audit/DEFECT_LEDGER.md` row D-3.2-005 status is `remediated 2026-06-21` and cites §5.11.3 plus this verification file.

PASS — `_audit/REMEDIATION_BACKLOG.md` F-3 no longer describes D-3.2-012 / D-3.2-014 as the live Phase 3.2 residual and now points at D-3.2-001 / -002 / -003 plus the inline tier-list audit.

## Residuals

D-3.2-001 / D-3.2-002 / D-3.2-003 remain partially remediated. The remaining work is the Min-Tier / Solo structural-body rewrite and the §5.11 inline tier-list audit, not the Seller / Marketplace role-overlay row coverage closed here.

## Verdict

PASS. D-3.2-004 and D-3.2-005 are remediated by explicit §5.11.2 / §5.11.3 overlay matrices and synchronized audit records.
