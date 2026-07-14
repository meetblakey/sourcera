# Spec excerpt

## 13.11 Defense View {#13-11-defense-view}

The surface can return `defense_view_cross_console_access` when a seller console
attempts to read a buyer DefenseView. This code is referenced here but is missing
from Appendix I below — MUST FAIL (unresolved reference).

# Appendix I — Error Codes {#appendix-i}

| Code | HTTP | Notes |
| :-- | :-- | :-- |
| `selection_record_not_finalized` | 409 | Present. |
| `regeneration_throttle` | 429 | Present. |
| `defense_view_capability_disabled` | 403 | Present. |
| `defense_view_archived_with_workspace` | 404 | Present (but cross_console_access is absent). |
