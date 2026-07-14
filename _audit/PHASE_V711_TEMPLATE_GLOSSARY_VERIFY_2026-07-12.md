# v7.1.1 Buyer Template Glossary Verification — 2026-07-12

## Scope

Closes D-4.10-012.

## Conflict

Buyer WorkspaceTemplate terms and Marketplace TemplateLibraryEntry shared a root word but represented different domains.

## Resolution

Appendix K defines the Buyer template terms and explicitly separates TemplateLibraryEntry as a Marketplace object.

## Boundary

No behavioral, API, billing, entitlement, or runtime change.

## Verification

- Full spec-lint — pass.
- Exact-status scan — 0 open P0, 0 open P1, 198 open P2, 72 open P3.
- Stamp gate — 507 runtime rows, 332 `runtime_active`, 194 blockers: 120 M11.3, 30 M21.3, 14 M02.3, 9 M24.3, and 21 pending human-ratification rows.
- Generated blocker inventory — 194 rows.
