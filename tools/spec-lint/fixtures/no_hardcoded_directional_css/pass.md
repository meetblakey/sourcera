## 37.3 Right-to-Left (RTL) Support {#37.3-right-to-left-(rtl)-support}

**CSS architecture.** Layouts use CSS Logical Properties (`inline-start`, `inline-end`, `block-start`, `block-end`) instead of directional properties (`left`, `right`) except in audited allow-list cases where the physical direction is semantically required.

#### 37.3.1 Directional CSS Allow-List {#37.3.1-directional-css-allow-list}

| allow_list_id | Permitted physical coordinate | Required rationale |
|---|---|---|
| `canvas_coordinate_grid` | canvas `left` / `right` coordinate projection | Physical x-axis math, not layout mirroring. |
| `geospatial_map_viewport` | map tile `left` / `right` pan coordinate | Physical map plane coordinate. |
| `pdf_page_coordinate_overlay` | PDF page overlay `left` / `right` coordinate | Physical page coordinate. |

All other layout, spacing, alignment, positioning, borders, and animation styles MUST use logical CSS properties. Any CSS / TSX declaration that uses physical `left` / `right` MUST carry an allow-list token.

```tsx
const logicalStyle = { insetInlineStart: 0, marginInlineEnd: 8 };
const chartMarker = { left: x, top: y }; // @directional-css-allow:canvas_coordinate_grid
```

## 38.11 Right-to-Left & Locale Mirror Behavior {#38.11-right-to-left-and-locale-mirror-behavior}

Pointer subsection. CSS logical-property enforcement is validated by `no_hardcoded_directional_css`; runtime mirroring remains owned by `rtl_directionality_runtime_contract`.

#### M.5.37 Phase 37 Addition {#m-5-37-phase-37-addition}

| gate_id | row_class | runtime_status | execution_context | assertion (summary) | pack |
|---|---|---|---|---|---|
| `no_hardcoded_directional_css` | spec_tree_lint | **`runtime_active`** (promoted 2026-07-09; detector `tools/spec-lint/gates/no_hardcoded_directional_css.ts`; verified PASS on live Master Spec, UX spec, source-tree scan, and pass/fail fixtures; scope boundary: spec / UX style snippets and CSS/TSX files present in this repository; product runtime RTL behavior remains owned by `rtl_directionality_runtime_contract`) | pr_lint | Physical `left` / `right` CSS is forbidden unless the occurrence is on the audited allow-list for semantically physical coordinates. | M02.3 |
