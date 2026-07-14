# Spec excerpt

## 13.11 Defense View {#13-11-defense-view}

The surface can return `selection_record_not_finalized`, `regeneration_throttle`,
`defense_view_capability_disabled`, `defense_view_archived_with_workspace`, and
`defense_view_cross_console_access`. Each must resolve to an Appendix I row.

# Appendix I — Error Codes {#appendix-i}

| Code | HTTP | Notes |
| :-- | :-- | :-- |
| `selection_record_not_finalized` | 409 | Selection Record not yet finalized. |
| `regeneration_throttle` | 429 | ≤1 regeneration / 60s / workspace / user. |
| `defense_view_capability_disabled` | 403 | Capability disabled for the org. |
| `defense_view_archived_with_workspace` | 404 | DefenseView archived with workspace. |
| `defense_view_cross_console_access` | 404 | Seller-console read of a buyer DefenseView. |
