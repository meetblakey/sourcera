## 37.3 Right-to-Left (RTL) Support {#37.3-right-to-left-(rtl)-support}

**CSS architecture.** Layouts should avoid some directional styles.

```tsx
const badStyle = { right: 0, marginLeft: 8 };
const badClass = <div className="absolute left-0 text-right" />;
```

## 38.11 Right-to-Left & Locale Mirror Behavior {#38.11-right-to-left-and-locale-mirror-behavior}

Pointer subsection. RTL exists.

#### M.5.37 Phase 37 Addition {#m-5-37-phase-37-addition}

| gate_id | row_class | runtime_status | execution_context | assertion (summary) | pack |
|---|---|---|---|---|---|
| `no_hardcoded_directional_css` | spec_tree_lint | spec_binding_pending_pack_m02_3 | pr_lint | Physical left and right CSS should be reviewed. | M02.3 |
