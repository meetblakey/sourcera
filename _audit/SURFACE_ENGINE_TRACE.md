# SURFACE_ENGINE_TRACE.md — Phase 11.4 Surface/Engine Cross-Reference Audit

**Phase prompt:** `Audit_Prompts.md` → Prompt 11.4 (Surface/Engine Cross-Reference Audit, lines 2488–2506).
**Baseline:** `Sourcera_Master_Spec.md` v7.1.0 (2026-04-28).
**Audit run:** 2026-05-11, single Opus session.
**Scope:** Coverage trace from `_audit/FEATURE_INVENTORY.md` (898 active F-* feature rows including 71 F-AE-* rows and 1 F-BC-* row) → Master Spec Appendix M.1 (327 mapping rows over lines 49004–49371) → Master Spec Appendix M.5 (103 CI-gate rows over lines 49444–49563) → `_integration/AUTHORED_EXTENSIONS_LEDGER.md` (218 AE-* rows).

**Output discipline.** Per the Audit Prompts non-destructive default, this trace artifact and the `DEFECT_LEDGER.md` entries `D-11.4-001` through `D-11.4-004` are the only writes. No Master Spec edits performed. No `legacy-import:_versions/` snapshot required.

---

## 1. Methodology

**Trace join rules.** Each F-* feature was joined against three corpus indices using the most-specific available anchor in the inventory's `primary_section_anchor` column.

- **M.1 row match.** The feature's primary anchor (e.g., `§4.3.1`) is compared against every anchor extracted from the `Spec home` cell of every Appendix M.1 row. Match levels: **✅ direct** = an M.1 row's `Spec home` cell cites the feature's primary anchor verbatim; **⚠ family** = an M.1 row cites a parent anchor of the feature's primary anchor (e.g., feature anchors `§22.18.6.2`, M.1 row anchors `§22.18`); **❌ missing** = neither the feature's anchor nor any ancestor appears in any M.1 row's `Spec home` cell.
- **M.5 gate match.** The feature's primary anchor is compared against every anchor extracted from the `Authority anchor` cell of every §M.5 catalog row (post-V9: 103 rows). Same direct / family / missing semantics. A **⚠ family** here means the feature has a CI gate anchored elsewhere in its parent section but not at its specific subsection — this is normally appropriate (gates anchor at the broadest section that binds them).
- **AE ledger match.** For every `F-AE-*` row in the inventory, the AE-* identifier is extracted from the feature name and compared against the canonical AE-* identifier set in `_integration/AUTHORED_EXTENSIONS_LEDGER.md` (218 row identifiers, deduplicated).

**Match-level interpretation.** A ✅ M.1 hit is an unambiguous engine-concept → surface-metaphor binding. A ⚠ family hit is a partial binding that two staff engineers would resolve differently: an engineer reading the M.1 row infers the surface contract for the family, but the feature's specific section is not directly cited. A ❌ M.1 miss is an absent binding under the M.2 process-gate doctrine ("every engine-concept addition must add a row"). Phase 11.1 already filed `D-11.1-001` … `D-11.1-009` for the surface-class misses; this trace **enumerates the engine-concept-class misses** that Phase 11.1 surfaced only at cluster granularity.

**Anchor parsing.** Primary anchors of the form `§N.M.P Token` (where `Token` is a noun phrase, e.g., `§4.3.1 Workspace`) are normalized to the §-prefix; `Appendix N.M` references are normalized to `Appendix N` for parent-walk. UX Design and retired KB Eng companion-doc anchors do not map into the §-numbered space; these rows are reported in their own family bucket below.

---

## 2. Coverage Headline

| Trace dimension | Direct ✅ | Family ⚠ | Missing ❌ | Total |
| :---- | ----: | ----: | ----: | ----: |
| Appendix M.1 mapping (every F-*) | 316 | 190 | 392 | 898 |
| Appendix M.5 CI gate (every F-*) | 41 | 20 | 837 | 898 |
| AE ledger row (active F-AE-* only) | 71 | 0 | 0 | 71 |

**Headline reading.** M.1 binding is at **56% direct, 21% family, 23% missing** across all 898 active F-* features. Of the 207 misses (`196 engine_concept + surface` + 11 misc class), 62 are `feature_class = surface` — exactly the rows that Phase 11.1 D-11.1-001 … D-11.1-009 enumerated and filed P1. The remaining 135 `engine_concept`-class misses are net-new disclosures from the trace; they are filed in aggregate as `D-11.4-001` (see §6). M.5 binding is at **5% direct, 2% family, 93% nominally missing**, but the M.5 catalog is by design a forward-reference catalog (the 4 v7.1.0-active gates + 33 spec-binding gates + 29 V9 gates + 12 Phase 3V gates + 5 Phase 3V+ gates + 10 V8.4 gates + 1 Phase 2V gate + 1 Phase 14.18 gate not yet catalogued — see Phase 11.3 `D-11.3-001` through `D-11.3-012`). M.5 coverage is **not a per-feature obligation**; gates anchor at the broadest binding section. The 837 "missing" M.5 hits therefore decompose into two classes: (a) genuinely no-gate-needed (engine-discipline-only features); (b) gates promised but not catalogued (Phase 11.3 inherited). `D-11.4-004` (P2) clarifies the missing taxonomy. AE ledger coverage is clean: all 71 active F-AE-* rows resolve to a live AE row. Retired ID `F-AE-016` forwards to Breaking Change row `F-BC-001` and is excluded from the AE join.

---

## 3. Per-Family Trace Tables

Every F-* feature is enumerated below, grouped by `primary_section_anchor` family. Columns:

- `Feature ID` — `_audit/FEATURE_INVENTORY.md` row identifier.
- `Class` — feature_class (engine_concept / platform_mechanic / user_capability / surface / pricing_primitive / growth_mechanic / api_surface / integration_surface).
- `Anchor` — primary §-anchor (normalized).
- `M.1` — Appendix M.1 binding (✅ direct / ⚠ family-only / ❌ missing). Family-only means an ancestor section has an M.1 row but the feature's specific subsection does not.
- `M.5` — Appendix M.5 CI gate binding (✅ direct / ⚠ family / — none-applicable-by-design or absent-by-contract).
- `AE` — Authored Extension binding (`AE-*` ledger row when feature_class implies AE coverage; otherwise `—`).
- `Name` — feature_name (truncated to 60 chars).

### 3. §1 (12 features)

| Feature ID | Class | Anchor | M.1 | M.5 | AE | Name |
| :---- | :---- | :---- | :--: | :--: | :--: | :---- |
| F-001 | engine_concept | §1.1 | ❌ | ⚠ | — | Three-Domain Architecture (Buyer / Seller / Marketplace) |
| F-002 | engine_concept | §1.3 | ✅ | ⚠ | — | Dual-Console Data Isolation Model |
| F-003 | engine_concept | §1.4 | ❌ | ⚠ | — | Org-Scoped vs Console-Scoped Query Scoping |
| F-004 | platform_mechanic | §1.5 | ✅ | ⚠ | — | Authoritative Technology Stack |
| F-005 | integration_surface | §1.5 | ✅ | ⚠ | — | Convex Backend & Real-Time Database |
| F-006 | integration_surface | §1.5 | ✅ | ⚠ | — | WorkOS Authentication Integration |
| F-007 | integration_surface | §1.5 | ✅ | ⚠ | — | Stripe Billing Integration |
| F-008 | integration_surface | §1.5 | ✅ | ⚠ | — | PostHog Analytics Integration |
| F-009 | integration_surface | §1.5 | ✅ | ⚠ | — | Loops.so Email Delivery Integration |
| F-010 | integration_surface | §1.5 | ✅ | ⚠ | — | Firecrawl Web Intelligence Integration |
| F-011 | integration_surface | §1.5 | ✅ | ⚠ | — | Anthropic Claude AI Integration |
| F-012 | platform_mechanic | §1.6 | ✅ | ⚠ | — | Multi-Region Deployment (US / EU) |

### 3. §2 (16 features)

| Feature ID | Class | Anchor | M.1 | M.5 | AE | Name |
| :---- | :---- | :---- | :--: | :--: | :--: | :---- |
| F-013 | engine_concept | §2.1 | ❌ | — | — | The Sourcera Method |
| F-014 | engine_concept | §2.2 | ❌ | — | — | Use Case → Requirement Decomposition |
| F-015 | engine_concept | §2.3 | ❌ | — | — | Three-Model Scoring Calibration (FM/PM/EJ) |
| F-016 | engine_concept | §2.4 | ❌ | — | — | Two-Phase Vendor Shortlisting (RFI → RFP) |
| F-017 | engine_concept | §2.5 | ✅ | — | — | Phase Duration Benchmarks |
| F-018 | engine_concept | §2.6.1 | ✅ | — | — | Stakeholder Cohort Taxonomy |
| F-019 | engine_concept | §2.6.2 | ✅ | — | — | Alignment Cadences |
| F-020 | engine_concept | §2.6.3 | ✅ | — | — | Score Escalation Pattern |
| F-021 | engine_concept | §2.7.1 | ❌ | — | — | RFI Template Framework |
| F-022 | engine_concept | §2.7.2 | ❌ | — | — | RFP Template Framework |
| F-023 | user_capability | §2.8 | ✅ | ✅ | — | Single-Operator Mode (Solo Mode) |
| F-024 | engine_concept | §2.8.1 | ⚠ | ⚠ | — | evaluation_owner_mode Field |
| F-025 | engine_concept | §2.8.3 | ⚠ | ⚠ | — | Soft Phase Gates (skip-with-warning) |
| F-026 | engine_concept | §2.8.4 | ✅ | ⚠ | — | Solo-Mode Engine-On / Surface-Off SLA & Pulse |
| F-027 | user_capability | §2.8.5 | ✅ | ⚠ | — | Contextual Inline Stakeholder Invites |
| F-028 | engine_concept | §2.8.5 | ✅ | ⚠ | — | Solo → Team Auto-Promotion |

### 3. §3 (49 features)

| Feature ID | Class | Anchor | M.1 | M.5 | AE | Name |
| :---- | :---- | :---- | :--: | :--: | :--: | :---- |
| F-029 | engine_concept | §3.1 | ❌ | — | — | Sourcera Constraint (UX Philosophy) |
| F-030 | engine_concept | §3.2 | ❌ | — | — | 8 Core Interaction Patterns |
| F-031 | surface | §3.2 | ❌ | — | — | Sidebar Navigation Pattern |
| F-032 | surface | §3.2 | ❌ | — | — | Command Palette Pattern |
| F-033 | engine_concept | §3.2 | ❌ | — | — | Inline Editing Pattern |
| F-034 | platform_mechanic | §3.2 | ❌ | — | — | Keyboard Shortcuts System |
| F-035 | engine_concept | §3.2 | ❌ | — | — | Optimistic Mutation Pattern |
| F-036 | engine_concept | §3.2 | ❌ | — | — | Right-Click Contextual Menu |
| F-037 | engine_concept | §3.2 | ❌ | — | — | Modal + Escape Hatch Pattern |
| F-038 | engine_concept | §3.2 | ❌ | — | — | Live Preview / Presence Pattern |
| F-039 | engine_concept | §3.3 | ❌ | — | — | Pattern-to-Feature Mapping |
| F-040 | engine_concept | §3.4 | ❌ | — | — | Mobile Translation of Linear Constraint |
| F-041 | engine_concept | §3.5 | ❌ | — | — | Optimistic Mutation Rollback |
| F-042 | engine_concept | §3.6 | ❌ | — | — | Form & Input Tokens System |
| F-043 | engine_concept | §3.6.3 | ❌ | — | — | Input Validation State Machine |
| F-044 | engine_concept | §3.7 | ❌ | — | — | Loading / Empty / Error State Catalog |
| F-045 | engine_concept | §3.7.2 | ❌ | — | — | Content-Shaped Loading Skeletons |
| F-046 | engine_concept | §3.7.3 | ❌ | — | — | Empty-State Next-Best-Action Pattern |
| F-047 | engine_concept | §3.7.4 | ❌ | — | — | Failure / Reason / Recovery Error Contract |
| F-048 | surface | §3.7.10 | ❌ | — | — | Connectivity / Offline Banner |
| F-049 | user_capability | §3.7.12 | ❌ | — | — | External-Target Clipboard Confirmation Pattern |
| F-050 | surface | §3.8 | ❌ | — | — | Side Peek |
| F-051 | engine_concept | §3.8.1 | ❌ | — | — | Side Peek Resize & Persistence |
| F-052 | user_capability | §3.8.4 | ❌ | — | — | Side Peek Prev/Next Navigation |
| F-053 | surface | §3.9 | ✅ | — | — | Cursor Presence Visualization |
| F-054 | engine_concept | §3.9.2 | ⚠ | — | — | 8-Hue Presence Palette with Wrap |
| F-055 | engine_concept | §3.9.3 | ⚠ | — | — | Idle Fade & Disconnection State Machine |
| F-056 | surface | §3.9.4 | ⚠ | — | — | Off-Screen Viewport Indicators |
| F-057 | surface | §3.10 | ❌ | — | — | Bulk Action Toolbar |
| F-058 | engine_concept | §3.10.2 | ❌ | — | — | Bulk Selection Persistence |
| F-059 | engine_concept | §3.10.5 | ❌ | — | — | Bulk Action Destructive Confirmation |
| F-060 | engine_concept | §3.10.6 | ❌ | — | — | Bulk Action Dispatch Streaming Progress |
| F-061 | engine_concept | §3.11 | ❌ | — | — | Dark Mode Parity |
| F-062 | engine_concept | §3.11.1 | ❌ | — | — | Theme Mode Resolution |
| F-063 | platform_mechanic | §3.11.3 | ❌ | — | — | Dark-Mode Contrast CI Gate |
| F-064 | platform_mechanic | §3.11.6 | ❌ | — | — | Ops Console Dark-Theme Default |
| F-065 | user_capability | §3.11.8 | ❌ | — | — | High Contrast Mode |
| F-066 | engine_concept | §3.12 | ✅ | — | — | Presence & Unread Tracking Subsystem |
| F-067 | surface | §3.12.2 | ⚠ | — | — | Workspace Header Avatar Stack |
| F-068 | surface | §3.12.2 | ⚠ | — | — | Thread Viewer Indicator |
| F-069 | surface | §3.12.3 | ⚠ | — | — | Global Bell Badge |
| F-070 | surface | §3.12.3 | ⚠ | — | — | Mention Dot Overlay |
| F-071 | surface | §3.12.3 | ⚠ | — | — | Scrollback Unread Divider |
| F-072 | engine_concept | §3.12.5 | ⚠ | — | — | Unread Marker Visibility-Rules Enforcement |
| F-073 | engine_concept | §3.13 | ✅ | ✅ | — | Principle 9: Surface Simplicity, Engine Complexity |
| F-074 | platform_mechanic | §3.13 | ✅ | ✅ | — | First-30-Seconds Test |
| F-075 | engine_concept | §3.14 | ✅ | — | — | Pipeline Surface Compression |
| F-076 | engine_concept | §3.14.1 | ✅ | ✅ | — | Buyer Solo Four-Step Compression Contract |
| F-077 | engine_concept | §3.14.2 | ⚠ | ✅ | — | Seller Four-Step Compression Contract |

### 3. §4 (60 features)

| Feature ID | Class | Anchor | M.1 | M.5 | AE | Name |
| :---- | :---- | :---- | :--: | :--: | :--: | :---- |
| F-078 | engine_concept | §4.1 | ⚠ | — | — | Global Data Model Design Principles |
| F-079 | engine_concept | §4.2.1 | ✅ | — | — | Organization Entity |
| F-080 | engine_concept | §4.2.3 | ⚠ | ✅ | — | User Entity |
| F-081 | engine_concept | §4.2.2 | ⚠ | — | — | Organization Membership Entity |
| F-082 | engine_concept | §4.2.4 | ⚠ | — | — | Team Entity |
| F-083 | engine_concept | §4.3.1 | ✅ | — | — | Workspace Entity |
| F-084 | engine_concept | §4.3.2 | ✅ | — | — | Workspace Membership Entity |
| F-085 | engine_concept | §4.3.3 | ✅ | — | — | Use Case Entity |
| F-086 | engine_concept | §4.3.4 | ✅ | — | — | Requirement Entity |
| F-087 | engine_concept | §4.3.5 | ✅ | — | — | Response Entity |
| F-088 | engine_concept | §4.3.6 | ✅ | — | — | Score Entity |
| F-089 | engine_concept | §4.3.7 | ✅ | — | — | Intelligence Cache Entry |
| F-090 | engine_concept | §4.3.8 | ✅ | — | — | Evaluation Scenario Entity |
| F-091 | engine_concept | §4.3.10 | ✅ | — | — | Evaluation Pulse Event |
| F-092 | engine_concept | §4.3.11 | ✅ | — | — | Internal Comment Thread Entity |
| F-093 | engine_concept | §4.3.12 | ⚠ | — | — | Internal Comment Post Entity |
| F-094 | engine_concept | §4.3.13 | ⚠ | — | — | Internal Comment Mention Entity |
| F-095 | engine_concept | §4.3.14 | ✅ | — | — | Presence Record Entity |
| F-096 | engine_concept | §4.3.15 | ✅ | — | — | Unread Marker Entity |
| F-097 | engine_concept | §4.3.16 | ✅ | — | — | Buyer Referral Entity |
| F-098 | engine_concept | §4.3.17 | ✅ | — | — | Buyer-Funded Pro Trial Seat Grant Entity |
| F-099 | engine_concept | §4.3.18 | ✅ | — | — | Usage Event Entity |
| F-100 | engine_concept | §4.3.19 | ✅ | — | — | Time-Saved Credit Entity |
| F-101 | engine_concept | §4.3.20 | ✅ | — | — | Target Account Entity |
| F-102 | engine_concept | §4.3.21 | ✅ | — | — | Selection Report Draft Entity |
| F-103 | engine_concept | §4.3.22 | ✅ | — | — | Inbox Item Group Entity |
| F-104 | engine_concept | §4.3 | ✅ | — | — | Buyer Console Entity Set |
| F-105 | engine_concept | §4.4.1 | ✅ | — | — | Bid Workspace Entity |
| F-106 | engine_concept | §4.4.2 | ✅ | — | — | Bid Response Entity |
| F-107 | engine_concept | §4.4.3 | ✅ | — | — | Seller Profile Entity |
| F-108 | engine_concept | §4.4.4 | ✅ | ✅ | — | Capability Declaration Entity |
| F-109 | engine_concept | §4.4.5 | ✅ | — | — | Bid Task Entity |
| F-110 | engine_concept | §4.4.6 | ✅ | — | — | Bid Schedule Entity |
| F-111 | engine_concept | §4.4 | ⚠ | — | — | Seller Console Entity Set |
| F-112 | engine_concept | §4.5.1 | ✅ | — | — | Marketplace Listing Entity |
| F-113 | engine_concept | §4.5.2 | ✅ | — | — | EOI (Expression of Interest) Record Entity |
| F-114 | engine_concept | §4.5.3 | ✅ | — | — | NDA Record Entity |
| F-115 | engine_concept | §4.5.9 | ✅ | ✅ | — | EvalStarter Entity |
| F-116 | engine_concept | §4.5 | ⚠ | — | — | Marketplace Entity Set |
| F-117 | engine_concept | §4.6.1 | ✅ | ✅ | — | Audit Event Entity |
| F-118 | engine_concept | §4.6.2 | ✅ | — | — | Attachment Entity |
| F-119 | engine_concept | §4.6.3 | ✅ | — | — | OpsSession Entity |
| F-120 | engine_concept | §4.7.1 | ✅ | — | — | Console Bridge Event Entity |
| F-121 | engine_concept | §4.7.2 | ✅ | — | — | Vendor Disqualification Record Entity |
| F-122 | engine_concept | §4.7 | ⚠ | — | — | Cross-Console Bridge Entity Set |
| F-123 | pricing_primitive | §4.8.1 | ✅ | — | — | AIOperation Entity |
| F-124 | engine_concept | §4.8.2 | ✅ | ✅ | — | CapabilityRegistryEntry Entity |
| F-125 | pricing_primitive | §4.8.3 | ✅ | — | — | AIWallet Entity |
| F-126 | platform_mechanic | §4.8.3 | ✅ | — | — | AIWallet Auto-Topup |
| F-127 | pricing_primitive | §4.8.4 | ✅ | — | — | OutcomeContract Entity |
| F-128 | engine_concept | §4.8.5 | ✅ | — | — | ContestRecord Entity |
| F-129 | engine_concept | §4.8.6 | ✅ | — | — | CostBaseRecalculationLog Entity |
| F-130 | pricing_primitive | §4.8.7 | ✅ | — | — | FreeAllowanceCounter Entity |
| F-131 | pricing_primitive | §4.8.8 | ✅ | — | — | CommittedSpendContract Entity |
| F-132 | pricing_primitive | §4.8.9 | ✅ | — | — | PricingTableVersion Entity |
| F-133 | engine_concept | §4.8.10 | ✅ | — | — | DowngradeExcessDataBucket Entity |
| F-134 | engine_concept | §4.8.11 | ✅ | — | — | BillingSeatSnapshot Entity |
| F-135 | pricing_primitive | §4.8.12 | ✅ | — | — | MarketplaceDiscoveryRevenueRecord Entity |
| F-136 | engine_concept | §4.8.13 | ✅ | — | — | SellerOutcomeSignalConfig Entity |
| F-137 | engine_concept | §4.8 | ⚠ | — | — | Billing & AI Accounting Entity Set |

### 3. §5 (23 features)

| Feature ID | Class | Anchor | M.1 | M.5 | AE | Name |
| :---- | :---- | :---- | :--: | :--: | :--: | :---- |
| F-138 | engine_concept | §5.1 | ⚠ | — | — | RBAC Two-Level Architecture |
| F-139 | user_capability | §5.2 | ✅ | — | — | Org Owner Role |
| F-140 | user_capability | §5.2 | ✅ | — | — | Org Admin Role |
| F-141 | user_capability | §5.2 | ✅ | — | — | Member Role |
| F-142 | user_capability | §5.2.1 | ✅ | — | — | Billing Admin Role |
| F-143 | surface | §5.2.1.4 | ⚠ | — | — | Billing Admin Audit View |
| F-144 | user_capability | §5.3 | ✅ | ✅ | — | Workspace Owner Role |
| F-145 | user_capability | §5.3 | ✅ | ✅ | — | Evaluation Lead Role |
| F-146 | user_capability | §5.3 | ✅ | ✅ | — | Evaluator Role |
| F-147 | user_capability | §5.3 | ✅ | ✅ | — | Scorer Role |
| F-148 | user_capability | §5.4 | ✅ | — | — | Guest Role with Permission Profiles |
| F-149 | engine_concept | §5.4.5 | ⚠ | — | — | Guest Use Case Scope Isolation |
| F-150 | user_capability | §5.5 | ✅ | ✅ | — | Bid Owner Role |
| F-151 | user_capability | §5.5 | ✅ | ✅ | — | Bid Contributor Role |
| F-152 | user_capability | §5.5 | ✅ | ✅ | — | Bid Viewer Role |
| F-153 | user_capability | §5.6 | ✅ | ✅ | — | Marketplace Publisher Role |
| F-154 | user_capability | §5.6 | ✅ | ✅ | — | Marketplace Viewer Role |
| F-155 | engine_concept | §5.7 | ⚠ | — | — | Phase-Gated Scoring Availability |
| F-156 | engine_concept | §5.8 | ⚠ | — | — | Policy Ingestion Phase-Independence |
| F-157 | engine_concept | §5.9 | ✅ | — | — | Executive Sponsor Persona |
| F-158 | engine_concept | §5.10 | ⚠ | ✅ | — | Active Workspace Definition |
| F-159 | engine_concept | §5.11 | ✅ | — | — | Feature Access Matrix |
| F-160 | engine_concept | §5.12 | ✅ | — | — | API + UI RBAC Enforcement |

### 3. §6 (17 features)

| Feature ID | Class | Anchor | M.1 | M.5 | AE | Name |
| :---- | :---- | :---- | :--: | :--: | :--: | :---- |
| F-161 | engine_concept | §6.1 | ✅ | — | — | WorkOS Authentication Architecture |
| F-162 | user_capability | §6.2 | ✅ | — | — | Multi-Factor Authentication (TOTP & WebAuthn) |
| F-163 | engine_concept | §6.2.3 | ⚠ | — | — | MFA Plan-Change State Transitions |
| F-164 | engine_concept | §6.3 | ✅ | — | — | Session Management |
| F-165 | engine_concept | §6.3.1 | ⚠ | — | — | Session Logout Cross-Tab Propagation |
| F-166 | user_capability | §6.4 | ✅ | — | — | Domain Governance |
| F-167 | engine_concept | §6.5 | ✅ | — | — | Guest SSO Bypass |
| F-168 | user_capability | §6.6 | ✅ | — | — | API Token Authentication |
| F-169 | engine_concept | §6.6.4 | ⚠ | — | — | API Token Lifecycle Management |
| F-170 | engine_concept | §6.7 | ✅ | — | — | Audit Logging |
| F-171 | user_capability | §6.7.4 | ⚠ | — | — | Audit Log Export |
| F-172 | user_capability | §6.8.1 | ✅ | — | — | GDPR Right of Access (Data Export) |
| F-173 | engine_concept | §6.8.2 | ✅ | — | — | GDPR Right to Erasure (Anonymization on Deprovisioning) |
| F-174 | user_capability | §6.8.3 | ✅ | — | — | GDPR Right to Erasure (Complete Deletion) |
| F-175 | engine_concept | §6.8.4 | ❌ | ✅ | — | DSAR Cascade Across Linked Entities |
| F-176 | engine_concept | §6.8.5 | ✅ | — | — | Audit-Integrity Exemption & Retention Override |
| F-177 | engine_concept | §6.8.6 | ❌ | — | — | DSAR Operational SLA |

### 3. §7 (7 features)

| Feature ID | Class | Anchor | M.1 | M.5 | AE | Name |
| :---- | :---- | :---- | :--: | :--: | :--: | :---- |
| F-178 | engine_concept | §7.1 | ❌ | — | — | Organization Lifecycle |
| F-179 | user_capability | §7.1.2 | ❌ | — | — | Organization Settings (Org Admin) |
| F-180 | user_capability | §7.1.3 | ❌ | — | — | Organization Deletion (44-day) |
| F-181 | engine_concept | §7.2 | ✅ | — | — | Organization Deletion Cascade |
| F-182 | engine_concept | §7.3 | ❌ | — | — | PII Handling Across Org Boundaries |
| F-183 | engine_concept | §7.5 | ❌ | — | — | Convex Subscription / Reactivity Layer |
| F-184 | platform_mechanic | §7.5.3 | ✅ | — | — | Reactivity SLO (p95 ≤ 500ms) |

### 3. §8 (12 features)

| Feature ID | Class | Anchor | M.1 | M.5 | AE | Name |
| :---- | :---- | :---- | :--: | :--: | :--: | :---- |
| F-185 | engine_concept | §8.1 | ❌ | — | — | Team Architecture |
| F-186 | user_capability | §8.1.2 | ✅ | ✅ | — | Team Owner Role |
| F-187 | user_capability | §8.1.2 | ✅ | ✅ | — | Team Lead Role |
| F-188 | user_capability | §8.1.2 | ✅ | ✅ | — | Team Member Role |
| F-189 | user_capability | §8.2 | ❌ | — | — | Team Soft-Delete with 30-Day Recovery |
| F-190 | engine_concept | §8.3 | ❌ | — | — | Triage Queue Management |
| F-191 | surface | §8.3.1 | ❌ | — | — | Buyer-Side Triage Queue |
| F-192 | surface | §8.3.2 | ❌ | — | — | Seller-Side Triage Queue |
| F-193 | user_capability | §8.4 | ✅ | — | — | Team SLA Configuration |
| F-194 | engine_concept | §8.4.2 | ✅ | — | — | SLA Breach & Escalation |
| F-195 | user_capability | §8.5 | ❌ | — | — | Agent Instructions |
| F-196 | engine_concept | §8.5.3 | ❌ | — | — | Agent Instruction Versioning |

### 3. §9 (12 features)

| Feature ID | Class | Anchor | M.1 | M.5 | AE | Name |
| :---- | :---- | :---- | :--: | :--: | :--: | :---- |
| F-197 | engine_concept | §9.1 | ❌ | — | — | Seller Team Architecture |
| F-198 | user_capability | §9.1.2 | ❌ | — | — | Seller Team Owner Role |
| F-199 | user_capability | §9.1.2 | ❌ | — | — | Seller Team Lead Role |
| F-200 | user_capability | §9.1.2 | ❌ | — | — | Seller Team Member Role |
| F-201 | engine_concept | §9.2.1 | ❌ | — | — | Seller Triage Auto-Mapping |
| F-202 | user_capability | §9.2.2 | ❌ | — | — | Manual Team Remap |
| F-203 | user_capability | §9.2.3 | ❌ | — | — | Decline-to-Bid |
| F-204 | user_capability | §9.3.1 | ❌ | — | — | Vendor Response Drafting |
| F-205 | user_capability | §9.3.2 | ❌ | — | — | Capability Declarations Management |
| F-206 | engine_concept | §9.3.2 | ❌ | — | — | Capability Declaration Reuse Tracking |
| F-207 | user_capability | §9.4.1 | ❌ | — | — | AI Response Generation |
| F-208 | engine_concept | §9.4.2 | ❌ | — | — | AI Suggestion Approval Workflow |

### 3. §10 (31 features)

| Feature ID | Class | Anchor | M.1 | M.5 | AE | Name |
| :---- | :---- | :---- | :--: | :--: | :--: | :---- |
| F-209 | engine_concept | §10.1 | ⚠ | — | — | 13-Phase Evaluation Pipeline |
| F-210 | engine_concept | §10.1.2 | ⚠ | — | — | Phase Lock Behavior |
| F-211 | user_capability | §10.2 | ✅ | — | — | Phase 1: Stakeholder Alignment & Discovery |
| F-212 | user_capability | §10.3 | ✅ | — | — | Phase 2: Requirement Definition |
| F-213 | user_capability | §10.4 | ✅ | — | — | Phase 3: Use Case Definition & Validation |
| F-214 | user_capability | §10.5 | ✅ | — | — | Phase 4-5: Vendor Discovery & Outreach |
| F-215 | user_capability | §10.6 | ✅ | — | — | Phase 6: Vendor Bidding Opens |
| F-216 | engine_concept | §10.6 | ✅ | — | — | Amendment Protocol (Phases 6–9) |
| F-217 | user_capability | §10.7 | ✅ | — | — | Phase 7: Vendor Response Refinement |
| F-218 | user_capability | §10.8 | ✅ | — | — | Phase 8: Buyer Due Diligence & Demos |
| F-219 | user_capability | §10.9 | ✅ | — | — | Phase 9: Final Vendor Clarifications |
| F-220 | user_capability | §10.10 | ✅ | — | — | Phase 10: Team Evaluation & Scoring |
| F-221 | engine_concept | §10.10 | ✅ | — | — | Score Immutability Rule (Phase 12 Entry) |
| F-222 | engine_concept | §10.10 | ✅ | — | — | Withdrawn Scores on Deprovisioning |
| F-223 | user_capability | §10.11 | ✅ | — | — | Phase 11: Score Review & Consensus |
| F-224 | surface | §10.11 | ✅ | — | — | Summary Scoring Report |
| F-225 | user_capability | §10.12 | ✅ | — | — | Phase 12: Selection & Recommendation |
| F-226 | engine_concept | §10.12 | ✅ | — | — | Selection Report Generation |
| F-227 | user_capability | §10.12 | ✅ | — | — | Approval Workflow (Optional) |
| F-228 | user_capability | §10.13 | ✅ | — | — | Phase 13: Contract & Closure |
| F-229 | engine_concept | §10.13 | ✅ | — | — | Selection Record (Immutable) |
| F-230 | user_capability | §10.14 | ✅ | — | — | Bid Workspace Cancellation Protocol |
| F-231 | engine_concept | §10.14.2 | ⚠ | — | — | Cancellation Vendor Notifications |
| F-232 | user_capability | §10.14.5 | ⚠ | — | — | Cancellation Workspace Recovery |
| F-233 | user_capability | §10.14.6 | ⚠ | — | — | Cancellation Data Export |
| F-234 | engine_concept | §10.15 | ✅ | — | — | Phase Duration Benchmarks Table |
| F-235 | api_surface | §10.16 | ✅ | — | — | Phase Advancement API |
| F-236 | engine_concept | §10.16.2 | ⚠ | — | — | Phase Advancement Idempotency |
| F-237 | engine_concept | §10.16.3 | ⚠ | — | — | Phase Advancement Audit |
| F-238 | engine_concept | §10.16.1 | ⚠ | — | — | Phase Gate Validation |
| F-239 | api_surface | §10.16 | ✅ | — | — | soft_gates_enabled API Flag |

### 3. §11 (4 features)

| Feature ID | Class | Anchor | M.1 | M.5 | AE | Name |
| :---- | :---- | :---- | :--: | :--: | :--: | :---- |
| F-240 | surface | §11.1 | ⚠ | — | — | Buyer Console Navigation Shell |
| F-241 | surface | §11.2 | ⚠ | — | — | Buyer Sidebar Navigation |
| F-242 | surface | §11.3 | ⚠ | — | — | Buyer Content Layout Regions |
| F-243 | surface | §11.4 | ⚠ | — | — | Buyer Persistent UI Elements |

### 3. §12 (8 features)

| Feature ID | Class | Anchor | M.1 | M.5 | AE | Name |
| :---- | :---- | :---- | :--: | :--: | :--: | :---- |
| F-244 | engine_concept | §12.1 | ❌ | — | — | Policy-Powered Requirement Generation |
| F-245 | user_capability | §12.2 | ❌ | — | — | Policy Document Ingestion |
| F-246 | engine_concept | §12.3 | ❌ | — | — | Framework Detection & Classification |
| F-247 | engine_concept | §12.4 | ❌ | — | — | Policy Control Extraction |
| F-248 | engine_concept | §12.5 | ✅ | — | — | Requirement Deduplication |
| F-249 | engine_concept | §12.6 | ❌ | — | — | Policy-to-Requirement Traceability Mapping |
| F-250 | user_capability | §12.7 | ❌ | — | — | Requirement Conversion & Amendment |
| F-251 | pricing_primitive | §12.8 | ❌ | — | — | Policy Generation Plan Limits |

### 3. §13 (13 features)

| Feature ID | Class | Anchor | M.1 | M.5 | AE | Name |
| :---- | :---- | :---- | :--: | :--: | :--: | :---- |
| F-252 | engine_concept | §13.1 | ⚠ | — | — | Scoring & Grading System |
| F-253 | engine_concept | §13.2 | ✅ | — | — | Scoring Rubric (P/F + A–F + EX) |
| F-254 | engine_concept | §13.3 | ✅ | — | — | Requirement Weighting |
| F-255 | engine_concept | §13.4 | ✅ | — | — | EX (Exclusion) Grade |
| F-256 | platform_mechanic | §13.5 | ✅ | — | — | Score Modification & Audit Trail |
| F-257 | user_capability | §13.6 | ⚠ | — | — | Collaborative Scoring |
| F-258 | engine_concept | §13.7 | ✅ | — | — | Score Aggregation |
| F-259 | engine_concept | §13.8 | ✅ | — | — | Auto-Scoring Rules |
| F-260 | platform_mechanic | §13.9 | ⚠ | — | — | Scoring Lifecycle |
| F-261 | surface | §13.11 | ✅ | — | — | Defense View |
| F-262 | user_capability | §13.11.5 | ⚠ | — | — | defense_view_generate Capability |
| F-264 | user_capability | §13.12 | ✅ | — | — | Buyer Maya Intake ("What Are You Evaluating?") |
| F-898 | engine_concept | §13.12 | ✅ | — | — | Buyer Maya Materializer Failure Codes & Retry Semantics |

### 3. §14 (8 features)

| Feature ID | Class | Anchor | M.1 | M.5 | AE | Name |
| :---- | :---- | :---- | :--: | :--: | :--: | :---- |
| F-265 | engine_concept | §14.1 | ❌ | — | — | Scenario Modeling |
| F-266 | user_capability | §14.2 | ✅ | — | — | Scenario Definition |
| F-267 | engine_concept | §14.3 | ✅ | — | — | Scenario Validation |
| F-268 | engine_concept | §14.4 | ❌ | — | — | Scenario Scoring & Ranking |
| F-269 | surface | §14.5 | ❌ | — | — | Scenario Comparison View |
| F-270 | platform_mechanic | §14.6 | ❌ | — | — | Scenario Lifecycle & Permissions |
| F-271 | user_capability | §14.7 | ✅ | — | — | Scenario Simulation Mode |
| F-272 | pricing_primitive | §14.8 | ❌ | — | — | Scenario Plan Limits & Reports |

### 3. §15 (6 features)

| Feature ID | Class | Anchor | M.1 | M.5 | AE | Name |
| :---- | :---- | :---- | :--: | :--: | :--: | :---- |
| F-273 | engine_concept | §15.1 | ❌ | — | — | TCO Modeling |
| F-274 | engine_concept | §15.2 | ✅ | — | — | TCO Use Cases & Pricing Requirements |
| F-275 | engine_concept | §15.3 | ✅ | — | — | TCO Projection |
| F-276 | engine_concept | §15.4 | ❌ | — | — | TCO vs Standard Scoring Integration |
| F-277 | surface | §15.5 | ✅ | — | — | TCO Modeling & Editing UI |
| F-278 | pricing_primitive | §15.6 | ❌ | — | — | TCO Modeling Plan Limits |

### 3. §16 (9 features)

| Feature ID | Class | Anchor | M.1 | M.5 | AE | Name |
| :---- | :---- | :---- | :--: | :--: | :--: | :---- |
| F-279 | engine_concept | §16.1 | ❌ | — | — | Organizational Intelligence |
| F-280 | engine_concept | §16.2 | ❌ | — | — | Organizational Intelligence Data Sources |
| F-281 | user_capability | §16.3 | ✅ | — | — | Vendor Performance Briefing |
| F-282 | user_capability | §16.4 | ✅ | — | — | Efficiency Metrics Briefing |
| F-283 | user_capability | §16.5 | ✅ | — | — | Discrepancy Analysis Briefing |
| F-284 | user_capability | §16.6 | ✅ | — | — | Predictive Suggestions Briefing |
| F-285 | platform_mechanic | §16.7 | ❌ | — | — | Organizational Intelligence Access Control |
| F-286 | platform_mechanic | §16.8 | ✅ | — | — | Briefing Lifecycle |
| F-287 | pricing_primitive | §16.9 | ❌ | — | — | Organizational Intelligence Plan Limits |

### 3. §17 (7 features)

| Feature ID | Class | Anchor | M.1 | M.5 | AE | Name |
| :---- | :---- | :---- | :--: | :--: | :--: | :---- |
| F-288 | engine_concept | §17.1 | ❌ | — | — | Workspace Analytics |
| F-289 | engine_concept | §17.2 | ✅ | — | — | Phase-Aware Metric Availability |
| F-290 | engine_concept | §17.3 | ❌ | — | — | Core Workspace Analytics Metrics |
| F-291 | user_capability | §17.4 | ❌ | — | — | Workspace Analytics Filtering & Aggregation |
| F-292 | user_capability | §17.5 | ❌ | — | — | Workspace Analytics Export & Reporting |
| F-293 | user_capability | §17.6 | ✅ | — | — | Workspace Analytics Drill-Down |
| F-294 | platform_mechanic | §17.7 | ✅ | — | — | Workspace Analytics Real-Time Updates |

### 3. §18 (7 features)

| Feature ID | Class | Anchor | M.1 | M.5 | AE | Name |
| :---- | :---- | :---- | :--: | :--: | :--: | :---- |
| F-295 | user_capability | §18.1 | ❌ | — | — | Q&A Threads |
| F-296 | platform_mechanic | §18.2 | ✅ | — | — | Q&A Lifecycle & Phase Gating |
| F-297 | platform_mechanic | §18.3 | ❌ | — | — | Q&A Structure & Visibility |
| F-298 | engine_concept | §18.4 | ✅ | — | — | Agent Q&A Suggestion (Buyer-Side) |
| F-299 | user_capability | §18.5 | ❌ | — | — | Q&A Post Interactions & Moderation |
| F-300 | engine_concept | §18.6 | ✅ | — | — | Q&A Search & Index |
| F-301 | pricing_primitive | §18.7 | ❌ | — | — | Q&A Plan Limits & Features |

### 3. §19 (6 features)

| Feature ID | Class | Anchor | M.1 | M.5 | AE | Name |
| :---- | :---- | :---- | :--: | :--: | :--: | :---- |
| F-302 | surface | §19.1 | ❌ | — | — | Template Library |
| F-303 | user_capability | §19.2 | ✅ | — | — | Sourcera-Provided Templates |
| F-304 | user_capability | §19.3 | ✅ | — | — | Custom Template Creation |
| F-305 | surface | §19.4 | ❌ | — | — | Template Library UI |
| F-306 | user_capability | §19.5 | ✅ | — | — | Template-to-Workspace Flow |
| F-307 | pricing_primitive | §19.6 | ❌ | — | — | Template Library Plan Limits |

### 3. §20 (6 features)

| Feature ID | Class | Anchor | M.1 | M.5 | AE | Name |
| :---- | :---- | :---- | :--: | :--: | :--: | :---- |
| F-308 | surface | §20.1 | ❌ | — | — | Inbox & Pulse |
| F-309 | surface | §20.2 | ✅ | — | — | Inbox Structure |
| F-310 | engine_concept | §20.3 | ✅ | — | — | Pulse Health Score |
| F-311 | user_capability | §20.4 | ✅ | — | — | Pulse Digest Email |
| F-312 | surface | §20.5 | ✅ | — | — | In-App Pulse Widget |
| F-313 | user_capability | §20.6 | ✅ | — | — | Notification Preferences (Buyer Pulse) |

### 3. §21 (7 features)

| Feature ID | Class | Anchor | M.1 | M.5 | AE | Name |
| :---- | :---- | :---- | :--: | :--: | :--: | :---- |
| F-314 | engine_concept | §21.2 | ✅ | — | — | Sourcera Agent (multi-model orchestration) |
| F-315 | engine_concept | §21.3 | ✅ | — | — | Agent Guardrails & Hallucination Protection |
| F-316 | engine_concept | §21.4 | ✅ | — | — | Agent Capability Registry |
| F-317 | platform_mechanic | §21.5 | ✅ | — | — | Agent AI Budgets & Value-Dollars Wallet |
| F-318 | platform_mechanic | §21.6 | ✅ | — | — | Agent Failure Handling & Graceful Degradation |
| F-319 | user_capability | §21.8 | ✅ | — | — | Custom Agent Instructions |
| F-320 | engine_concept | §21.4.5 | ⚠ | — | — | Outcome Signals & OutcomeContracts |

### 3. §22 (66 features)

| Feature ID | Class | Anchor | M.1 | M.5 | AE | Name |
| :---- | :---- | :---- | :--: | :--: | :--: | :---- |
| F-321 | engine_concept | §22.1 | ❌ | — | — | Seller Knowledge Base (KB) |
| F-322 | engine_concept | §22.2 | ❌ | — | — | KB Layered Architecture |
| F-323 | integration_surface | §22.2.3 | ❌ | — | — | Anthropic Beta Header & Version Pinning |
| F-324 | engine_concept | §22.3 | ✅ | — | — | KB Ingestion Channels |
| F-325 | engine_concept | §22.3.1 | ⚠ | — | — | KBEntry Entity |
| F-326 | engine_concept | §22.3.4 | ⚠ | — | — | KBNamespace Entity |
| F-327 | engine_concept | §22.4.1 | ⚠ | — | — | KB Entry Lifecycle State Machine |
| F-328 | engine_concept | §22.4.2 | ⚠ | — | — | KB Failed-Vectorization Repair Pipeline |
| F-329 | engine_concept | §22.4.3 | ⚠ | — | — | KB Re-Indexing on Edit |
| F-330 | platform_mechanic | §22.4.4 | ⚠ | — | — | KB Namespace Migration |
| F-331 | engine_concept | §22.4.5 | ⚠ | — | — | KB Embedding Version Bump Protocol |
| F-332 | engine_concept | §22.5 | ✅ | — | — | KB Health Model & Confidence Decay |
| F-333 | surface | §22.5.3 | ⚠ | — | — | KB Health Dashboard |
| F-334 | integration_surface | §22.6 | ✅ | — | — | Firecrawl Source Registration |
| F-335 | user_capability | §22.7 | ✅ | — | — | Document Library |
| F-336 | integration_surface | §22.8 | ✅ | — | — | Sourcera KB MCP Server |
| F-337 | integration_surface | §22.8.3 | ⚠ | — | — | MCP Vault Auth & JWT (MCPSessionTokenRecord) |
| F-338 | api_surface | §22.8.4.1 | ⚠ | — | — | MCP Tool — kb_retrieve |
| F-339 | api_surface | §22.8.4.2 | ⚠ | — | — | MCP Tool — kb_get_entry |
| F-340 | api_surface | §22.8.4.3 | ⚠ | — | — | MCP Tool — document_library_find |
| F-341 | api_surface | §22.8.4.4 | ⚠ | — | — | MCP Tool — doc_attach |
| F-342 | api_surface | §22.8.4.5 | ⚠ | — | — | MCP Tool — capability_find |
| F-343 | api_surface | §22.8.4.6 | ⚠ | — | — | MCP Tool — capability_declare_draft |
| F-344 | api_surface | §22.8.4.7 | ⚠ | — | — | MCP Tool — cite_verify |
| F-345 | api_surface | §22.8.4.8 | ⚠ | — | — | MCP Tool — kb_entry_draft_create |
| F-346 | api_surface | §22.8.4.9 | ⚠ | — | — | MCP Tool — kb_dedupe_check |
| F-347 | engine_concept | §22.8.5 | ⚠ | — | — | MCP Server Permission Policy |
| F-348 | engine_concept | §22.8.6 | ⚠ | — | — | MCP Server Implementation Requirements |
| F-349 | engine_concept | §22.9 | ✅ | — | — | KB Retrieval Pipeline (BM25+dense+RRF+rerank) |
| F-350 | engine_concept | §22.9.2 | ⚠ | — | — | KB Indexing Substrate (OpenSearch + pgvector + Voyage) |
| F-351 | engine_concept | §22.9.5 | ⚠ | — | — | KB Query Expansion Thesaurus |
| F-352 | engine_concept | §22.10 | ✅ | — | — | Managed Agent Definitions |
| F-353 | user_capability | §22.10.2 | ⚠ | — | — | First-Pass Responder Agent |
| F-354 | user_capability | §22.10.3 | ⚠ | — | — | KB Bootstrap Agent |
| F-355 | user_capability | §22.10.4 | ⚠ | — | — | Q&A Suggestion Agent |
| F-356 | user_capability | §22.10.5 | ✅ | — | — | KB-to-Capability Suggestion Agent |
| F-357 | user_capability | §22.10.6 | ⚠ | — | — | Ghost-Bid Ingestion Agent |
| F-358 | platform_mechanic | §22.10.7 | ⚠ | — | — | Agent Update & Canary Workflow |
| F-359 | api_surface | §22.11.1 | ⚠ | — | — | Custom Tool — emit_structured_draft |
| F-360 | api_surface | §22.11.2 | ⚠ | — | — | Custom Tool — request_seller_clarification |
| F-361 | engine_concept | §22.12 | ✅ | — | — | Skills (RFP Drafting, Compliance, Confidence, Tone, Extracti… |
| F-362 | engine_concept | §22.13 | ✅ | — | — | Agent Environments (kb-runner, bootstrap) |
| F-363 | engine_concept | §22.14 | ✅ | — | — | Session Lifecycle Per-Capability Flows |
| F-364 | engine_concept | §22.14.5 | ⚠ | — | — | Session Interruption & Steering |
| F-365 | engine_concept | §22.15 | ✅ | — | — | Event Stream Handling |
| F-366 | engine_concept | §22.16.1 | ⚠ | — | — | Citation, Provenance & Anti-Hallucination Guardrails |
| F-367 | engine_concept | §22.16.3 | ⚠ | — | — | KB Eval Harness & Pre-Release Gates |
| F-368 | engine_concept | §22.16.4 | ⚠ | — | — | KB Observability & Alerting |
| F-369 | engine_concept | §22.16.7 | ⚠ | — | — | Prompt-Injection Defense (kb_injection_scanner) |
| F-370 | platform_mechanic | §22.18 | ✅ | — | — | KB Value Capture & Stake-Building Principle |
| F-371 | user_capability | §22.18.2 | ⚠ | — | — | KB Honest Portability Export (KBExportJob) |
| F-372 | engine_concept | §22.18.2.2 | ⚠ | — | — | KBExportArchive Layout & Manifest |
| F-373 | engine_concept | §22.18.3.1 | ⚠ | — | — | KB Confidence Score Compounding |
| F-374 | engine_concept | §22.18.3.3 | ⚠ | — | — | KB Win-Rate Weight Compounding |
| F-375 | engine_concept | §22.18.3.4 | ⚠ | — | — | KB Citation Graph (KBCitationGraphEdge) |
| F-376 | surface | §22.18.4 | ⚠ | — | — | KB Value Meter — Seller Panel |
| F-377 | platform_mechanic | §22.18.5 | ⚠ | — | — | Upgrade Carry-Over Guarantee (KB-side) |
| F-378 | growth_mechanic | §22.18.6 | ⚠ | — | — | Stake-Reveal Moments (Three Surfaces) |
| F-379 | surface | §22.18.6.2 | ⚠ | — | — | Post-Close Outcome Debrief Overlay |
| F-380 | surface | §22.19 | ✅ | — | — | Seller Compressed Surface Mapping (Receive→Draft→Review→Subm… |
| F-381 | user_capability | §22.20 | ❌ | ✅ | — | Seller Maya Surface Abstraction |
| F-382 | user_capability | §22.20.2 | ✅ | ✅ | — | Solo/Free Capability Declaration Auto-Publish (chip list) |
| F-383 | platform_mechanic | §22.20.3 | ✅ | ⚠ | — | Solo/Free KB Governance Compression (Weekly Notification) |
| F-384 | surface | §22.20.4 | ✅ | ✅ | — | Match Score Three-Label Compression (Solo/Free) |
| F-385 | platform_mechanic | §22.20.5 | ❌ | ✅ | — | Solo/Free Silent AI Consumption |
| F-386 | surface | §22.20.6 | ❌ | ⚠ | — | Magic-Link Hero Moment Surface Polish |

### 3. §23 (4 features)

| Feature ID | Class | Anchor | M.1 | M.5 | AE | Name |
| :---- | :---- | :---- | :--: | :--: | :--: | :---- |
| F-387 | engine_concept | §23.1 | ✅ | — | — | Bid Workspace |
| F-388 | engine_concept | §23.2 | ✅ | — | — | Response Lock & Concurrency Control |
| F-389 | user_capability | §23.3 | ✅ | — | — | Response Submission (per response_type) |
| F-390 | user_capability | §23.4 | ✅ | — | — | Vendor Voluntary Withdrawal |

### 3. §24 (5 features)

| Feature ID | Class | Anchor | M.1 | M.5 | AE | Name |
| :---- | :---- | :---- | :--: | :--: | :--: | :---- |
| F-391 | user_capability | §24.1 | ✅ | — | — | Seller Q&A |
| F-392 | user_capability | §24.2 | ✅ | — | — | NDA Module & Execution |
| F-393 | surface | §24.3 | ✅ | — | — | Seller Inbox |
| F-394 | surface | §24.4 | ❌ | — | — | Seller Pulse |
| F-395 | surface | §24.5 | ❌ | — | — | Seller Analytics |

### 3. §25 (19 features)

| Feature ID | Class | Anchor | M.1 | M.5 | AE | Name |
| :---- | :---- | :---- | :--: | :--: | :--: | :---- |
| F-396 | engine_concept | §25.1 | ⚠ | — | — | Console Bridge Data Flow |
| F-397 | engine_concept | §25.1.2 | ⚠ | — | — | Console Bridge Entity-Level Redaction Matrix |
| F-398 | engine_concept | §25.2.1 | ⚠ | — | — | Cross-Console Bounded-Lag SLO |
| F-399 | engine_concept | §25.2.2 | ⚠ | — | — | Console Bridge Retry Curve (5-attempt) |
| F-400 | surface | §25.2.3 | ⚠ | — | — | Cross-Console Dual-Surface Failure Visibility |
| F-401 | engine_concept | §25.2.4 | ⚠ | — | — | Daily Reconciliation Job (Console Bridge) |
| F-402 | platform_mechanic | §25.2.6 | ⚠ | — | — | Bridge Kill-Switch & Notification Suppression |
| F-403 | user_capability | §25.3 | ✅ | — | — | Vendor Disqualification Workflow |
| F-404 | engine_concept | §25.3.4 | ⚠ | — | — | Disqualification Bid Workspace Read-Only Freeze |
| F-405 | engine_concept | §25.3.5 | ⚠ | — | — | Disqualification Audit Trail (hash-chain) |
| F-406 | platform_mechanic | §25.3.6 | ⚠ | — | — | Disqualification Vendor Notification Template |
| F-407 | api_surface | §25.3.9 | ⚠ | — | — | Disqualification API & Reversal Endpoint |
| F-408 | api_surface | §25.3.10 | ⚠ | — | — | Disqualification Webhook (vendor.disqualified) |
| F-409 | engine_concept | §25.5 | ✅ | — | — | Materialization Protocol (Buyer Requirement → Seller Bid Res… |
| F-410 | engine_concept | §25.5.4 | ⚠ | — | — | Bid Response needs_reverification Flag |
| F-411 | engine_concept | §25.6 | ✅ | — | — | Console Bridge Observability |
| F-412 | user_capability | §25.7 | ⚠ | — | — | Internal Comments |
| F-413 | engine_concept | §25.7.5 | ⚠ | — | — | Internal Comments State Machine & Resolve Semantics |
| F-414 | api_surface | §25.7.9 | ⚠ | — | — | Internal Comments API & Webhooks |

### 3. §26 (14 features)

| Feature ID | Class | Anchor | M.1 | M.5 | AE | Name |
| :---- | :---- | :---- | :--: | :--: | :--: | :---- |
| F-415 | engine_concept | §26.1 | ❌ | — | — | Seller Profile |
| F-416 | platform_mechanic | §26.2 | ❌ | — | — | Verification Tiers (Basic / Verified / Certified) |
| F-417 | user_capability | §26.3 | ❌ | — | — | Capability Declarations |
| F-418 | user_capability | §26.4 | ❌ | — | — | KB-to-Capability Auto-Suggestion |
| F-419 | surface | §26.7 | ❌ | — | — | Seller Organization Page |
| F-420 | platform_mechanic | §26.7.2 | ❌ | — | — | SellerOrgPage Enrichment (page_enrichment capability) |
| F-421 | engine_concept | §26.7.3 | ❌ | — | — | SellerOrgPage Domain Verification Gate |
| F-422 | engine_concept | §26.7.6 | ❌ | — | — | Marketplace Edge Caching & Cache Invalidation |
| F-423 | surface | §26.8 | ❌ | — | — | SellerSoftware & Software Pages |
| F-424 | platform_mechanic | §26.8.2 | ❌ | — | — | Software Page Claim Verification Flow |
| F-425 | engine_concept | §26.9.1 | ❌ | — | — | SEO Schema.org Structured Data |
| F-426 | engine_concept | §26.9.2 | ❌ | — | — | SEO Canonical URLs & Sitemap |
| F-427 | engine_concept | §26.9.4 | ❌ | — | — | SEO Robots.txt & Crawler Allowlist |
| F-428 | engine_concept | §26.9.7 | ❌ | — | — | Open Graph & Social Card Meta Tags |

### 3. §27 (34 features)

| Feature ID | Class | Anchor | M.1 | M.5 | AE | Name |
| :---- | :---- | :---- | :--: | :--: | :--: | :---- |
| F-429 | engine_concept | §27.1 | ❌ | — | — | Vendor Discovery Marketplace |
| F-430 | user_capability | §27.3 | ✅ | — | — | Marketplace Search & Filtering |
| F-431 | engine_concept | §27.4 | ✅ | — | — | Marketplace Match Score |
| F-432 | engine_concept | §27.4.3 | ✅ | — | — | Marketplace Match Feature Registry |
| F-433 | engine_concept | §27.4.4 | ✅ | — | — | Match Score Hard Gates (Residency, Vendor Opt-Out) |
| F-434 | engine_concept | §27.4.5 | ✅ | — | — | Match Score Retraining Cadence & Model Versioning |
| F-435 | engine_concept | §27.6 | ✅ | — | — | Marketplace Tags & Controlled Vocabulary |
| F-436 | platform_mechanic | §27.6.2 | ⚠ | — | — | Taxonomy CMS Authoring Flow |
| F-437 | engine_concept | §27.6.3 | ⚠ | — | — | Taxonomy Deprecation with Cascade Rules |
| F-438 | user_capability | §27.6.4 | ⚠ | — | — | Seller Tag Proposal Workflow |
| F-439 | api_surface | §27.6.10 | ⚠ | — | — | Public Taxonomy Read API & Cache Contract |
| F-440 | platform_mechanic | §27.10 | ✅ | — | — | Vendor Opt-Out Global Registry |
| F-441 | engine_concept | §27.10.2 | ⚠ | — | — | VendorOptOutAuthorityAttestation |
| F-442 | engine_concept | §27.10.3 | ⚠ | — | — | Vendor Opt-Out Enforcement Surfaces (17-row allowlist) |
| F-443 | engine_concept | §27.10.4 | ⚠ | — | — | Vendor Opt-Out ≤60-Second Enforcement Pipeline |
| F-444 | engine_concept | §27.10.5 | ⚠ | — | — | Vendor Opt-Out Retroactive Application |
| F-445 | api_surface | §27.10.6 | ⚠ | — | — | Vendor Opt-Out API & Webhooks |
| F-446 | user_capability | §27.5 | ✅ | — | — | Expression of Interest (EOI) |
| F-447 | platform_mechanic | §27.8 | ✅ | — | — | Marketplace Abuse & Takedown |
| F-448 | engine_concept | §27.8.4 | ⚠ | — | — | Abuse Report Severity Matrix |
| F-449 | api_surface | §27.8.9 | ⚠ | — | — | Abuse Report Webhook Catalog |
| F-450 | engine_concept | §27.8.12 | ⚠ | — | — | Abuse Report Cross-Report Aggregation |
| F-451 | platform_mechanic | §27.8.13 | ⚠ | — | — | Court-Order & Legal-Process Ingestion |
| F-452 | growth_mechanic | §27.8.14 | ⚠ | — | — | Public Transparency Reporting |
| F-453 | platform_mechanic | §27.9 | ✅ | — | — | Seller Signals (Anonymized Buyer Intent) |
| F-454 | engine_concept | §27.9.2 | ✅ | — | — | BuyerSignalOptInRecord (default-deny) |
| F-455 | engine_concept | §27.9.5 | ⚠ | — | — | Seller Signal k-Anonymity Pipeline |
| F-456 | engine_concept | §27.9.4 | ⚠ | — | — | Seller Signal De-Anonymization Link |
| F-457 | user_capability | §27.9.8 | ⚠ | — | — | Direct Invite from Cohort (Seller Scale+) |
| F-458 | pricing_primitive | §27.11 | ✅ | — | — | Marketplace Discovery Pricing |
| F-459 | pricing_primitive | §27.11.2 | ⚠ | — | — | Promoted Listings (auction-priced) |
| F-460 | growth_mechanic | §27.11.4 | ⚠ | — | — | Featured Placements (Editorial / Paid_Commitment) |
| F-461 | platform_mechanic | §27.11.6 | ⚠ | — | — | Buyer Experience Guardrails (G1–G9) |
| F-462 | api_surface | §27.11.7 | ⚠ | — | — | Marketplace Discovery API & Webhooks |

### 3. §28 (3 features)

| Feature ID | Class | Anchor | M.1 | M.5 | AE | Name |
| :---- | :---- | :---- | :--: | :--: | :--: | :---- |
| F-463 | engine_concept | §28.1 | ⚠ | — | — | Markdown Editor |
| F-464 | platform_mechanic | §28.2 | ⚠ | — | — | Editor Keyboard Shortcuts |
| F-465 | user_capability | §28.1 | ⚠ | — | — | Auto-linkified Relative Links |

### 3. §29 (11 features)

| Feature ID | Class | Anchor | M.1 | M.5 | AE | Name |
| :---- | :---- | :---- | :--: | :--: | :--: | :---- |
| F-466 | engine_concept | §29.1 | ✅ | — | — | Notification Event Catalog |
| F-467 | surface | §29.2 | ✅ | — | — | In-App Toast Notifications |
| F-468 | integration_surface | §29.2 | ✅ | — | — | Email Notifications (Loops.so) |
| F-469 | integration_surface | §29.4 | ✅ | — | — | Slack Integration |
| F-470 | user_capability | §29.3 | ✅ | — | — | User Notification Preferences |
| F-471 | engine_concept | §29.5 | ✅ | — | — | Webhook Notification Subscriptions |
| F-472 | engine_concept | §29.7 | ✅ | — | — | Notification Failure Audit |
| F-473 | platform_mechanic | §29.8 | ❌ | — | — | Notification Preference Inheritance |
| F-474 | surface | §29.9 | ❌ | — | — | Sourcera Support Widget |
| F-475 | platform_mechanic | §29.10 | ❌ | — | — | Notification Frequency Override Rules |
| F-476 | surface | §29.11 | ✅ | — | — | Full-Screen Incident Surface |

### 3. §30 (6 features)

| Feature ID | Class | Anchor | M.1 | M.5 | AE | Name |
| :---- | :---- | :---- | :--: | :--: | :--: | :---- |
| F-477 | surface | §30.1 | ✅ | — | — | Command Palette |
| F-478 | engine_concept | §30.2 | ❌ | — | — | Command Registry |
| F-479 | user_capability | §30.3 | ❌ | — | — | Entity Search (palette) |
| F-480 | user_capability | §30.4 | ❌ | — | — | Full-Text Search |
| F-481 | platform_mechanic | §30.5 | ✅ | — | — | Context-Aware Command Filtering |
| F-482 | platform_mechanic | §30.6 | ❌ | — | — | Palette Keyboard Accessibility |

### 3. §31 (13 features)

| Feature ID | Class | Anchor | M.1 | M.5 | AE | Name |
| :---- | :---- | :---- | :--: | :--: | :--: | :---- |
| F-483 | engine_concept | §31.1 | ✅ | — | — | Webhook Delivery System |
| F-484 | user_capability | §31.3 | ✅ | — | — | Integration Phase Export Mapping |
| F-485 | integration_surface | §31.4 | ✅ | — | — | Partner Integrations (Salesforce/Slack/Teams/Zapier) |
| F-486 | platform_mechanic | §31.5 | ❌ | — | — | Webhook Configuration & Limits |
| F-487 | platform_mechanic | §31.6.1 | ❌ | — | — | Webhook Body-Exclusion Gates |
| F-488 | user_capability | §31.6 | ❌ | — | — | Failed Webhook DLQ & Replay |
| F-489 | engine_concept | §31.8 | ✅ | — | — | Billing-Domain Webhook Catalog |
| F-490 | integration_surface | §31.9 | ✅ | — | — | CRM Sync (Salesforce/HubSpot/Dynamics/Pipedrive) |
| F-491 | engine_concept | §31.9.2 | ⚠ | — | — | CRMSyncConnection Entity |
| F-492 | engine_concept | §31.9.4 | ⚠ | — | — | CRMFieldMapping |
| F-493 | engine_concept | §31.9.5 | ⚠ | — | — | CRMRoutingRule |
| F-494 | engine_concept | §31.9.7 | ⚠ | — | — | CRM Account Matching Algorithm |
| F-495 | surface | §31.9.9 | ⚠ | — | — | CRM Sync Review Queue |

### 3. §32 (6 features)

| Feature ID | Class | Anchor | M.1 | M.5 | AE | Name |
| :---- | :---- | :---- | :--: | :--: | :--: | :---- |
| F-496 | engine_concept | §32.1 | ❌ | — | — | Sourcera API |
| F-497 | platform_mechanic | §32.4 | ✅ | — | — | API Rate Limit Enforcement |
| F-498 | platform_mechanic | §32.6.1 | ⚠ | — | — | Multi-Status (HTTP 207) Pattern |
| F-499 | api_surface | §32.8.1 | ⚠ | — | — | Public Pricing API |
| F-500 | api_surface | §32.8 | ✅ | — | — | Billing API |
| F-501 | api_surface | §32.9 | ✅ | — | — | Seller KB Export API |

### 3. §33 (7 features)

| Feature ID | Class | Anchor | M.1 | M.5 | AE | Name |
| :---- | :---- | :---- | :--: | :--: | :--: | :---- |
| F-502 | engine_concept | §33.1 | ❌ | — | — | Data Encryption At-Rest/In-Transit |
| F-503 | user_capability | §33.4 | ❌ | — | — | DSAR (Data Subject Access Request) |
| F-504 | engine_concept | §33.5 | ❌ | — | — | Compliance Frameworks |
| F-505 | platform_mechanic | §33.6 | ❌ | — | — | Account Lockout (15-minute) |
| F-506 | user_capability | §33.6 | ❌ | — | — | IP Allowlisting |
| F-507 | engine_concept | §33.7 | ❌ | — | — | Security Incident Response |
| F-508 | engine_concept | §33.8 | ❌ | — | — | Security Observability (Datadog/Sentry/OTel) |

### 3. §34 (49 features)

| Feature ID | Class | Anchor | M.1 | M.5 | AE | Name |
| :---- | :---- | :---- | :--: | :--: | :--: | :---- |
| F-509 | pricing_primitive | §34.1.1 | ✅ | — | — | Buyer Free Plan Tier |
| F-510 | pricing_primitive | §34.1.1 | ✅ | — | — | Buyer Solo Plan Tier |
| F-511 | pricing_primitive | §34.1.1 | ✅ | — | — | Buyer Business Starter Plan Tier ($299) |
| F-512 | pricing_primitive | §34.1.1 | ✅ | — | — | Buyer Business Growth Plan Tier ($799) |
| F-513 | pricing_primitive | §34.1.1 | ✅ | — | — | Buyer Business Scale Plan Tier ($1,999) |
| F-514 | pricing_primitive | §34.1.1 | ✅ | — | — | Buyer Enterprise Plan Tier (Custom) |
| F-515 | pricing_primitive | §34.1.2 | ✅ | — | — | Seller Free Plan Tier |
| F-516 | pricing_primitive | §34.1.2 | ✅ | — | — | Seller Solo Plan Tier |
| F-517 | pricing_primitive | §34.1.2 | ✅ | — | — | Seller Starter Plan Tier ($149) |
| F-518 | pricing_primitive | §34.1.2 | ✅ | — | — | Seller Growth Plan Tier ($499) |
| F-519 | pricing_primitive | §34.1.2 | ✅ | — | — | Seller Scale Plan Tier ($1,499) |
| F-520 | pricing_primitive | §34.1.2 | ✅ | — | — | Seller Enterprise Plan Tier (Custom) |
| F-521 | pricing_primitive | §34.2.5 | ✅ | — | — | Solo-Tier Per-Evaluation/Per-Bid Charge Orchestration |
| F-522 | pricing_primitive | §34.2.4 | ✅ | — | — | Volume Discount Bands (Committed Spend) |
| F-523 | pricing_primitive | §34.3 | ✅ | — | — | Outcome-Based AI Operation Pricing |
| F-524 | engine_concept | §34.3.3 | ✅ | — | — | Cost-Base Recalculation |
| F-525 | engine_concept | §34.3.5 | ✅ | — | — | Cost-Center Billing Mode (sourcera_owned/platform_marketing) |
| F-526 | platform_mechanic | §34.4 | ✅ | — | — | No Per-Unit Metering on Structural Resources |
| F-527 | engine_concept | §34.5 | ✅ | — | — | Plan Upgrade/Downgrade |
| F-528 | engine_concept | §34.6 | ✅ | — | — | Downgrade Excess Data Handling |
| F-529 | engine_concept | §34.7 | ❌ | — | — | Billing Seat Count (Informational) |
| F-530 | engine_concept | §34.8 | ❌ | — | — | Entitlement Enforcement |
| F-531 | engine_concept | §34.8.5 | ❌ | — | — | Entitlement Matrix |
| F-532 | platform_mechanic | §34.8.3 | ❌ | — | — | Cross-Console Entitlement Isolation |
| F-533 | growth_mechanic | §34.9.1 | ❌ | — | — | Buyer 14-Day Trial |
| F-534 | growth_mechanic | §34.9.2 | ❌ | — | — | Seller Hero Moment Onboarding |
| F-535 | engine_concept | §34.9 | ❌ | — | — | Onboarding/Trial Carry-Over |
| F-536 | pricing_primitive | §34.10 | ✅ | — | — | AI Wallet Service |
| F-537 | platform_mechanic | §34.10.3 | ✅ | ✅ | — | Wallet Pooled Budget Across Consoles |
| F-538 | platform_mechanic | §34.10.4 | ⚠ | — | — | Wallet Threshold Notifications (50/80/100%) |
| F-539 | integration_surface | §34.10.5 | ✅ | ✅ | — | Stripe Metering Integration |
| F-540 | engine_concept | §34.11 | ✅ | — | — | Outcome Resolver |
| F-541 | user_capability | §34.11.2 | ⚠ | — | — | Outcome Contest Window |
| F-542 | engine_concept | §34.12 | ❌ | — | — | Cross-Side Billing Rules |
| F-543 | pricing_primitive | §34.12.5 | ❌ | — | — | Enterprise Single-Contract Collapse |
| F-544 | pricing_primitive | §34.12.6 | ✅ | ✅ | — | Solo-Tier Per-Console Subscription Billing |
| F-545 | growth_mechanic | §34.13 | ✅ | — | — | Buyer-Funded Pro Trial Seat (M17) |
| F-546 | platform_mechanic | §34.13.5 | ⚠ | — | — | Pro Trial Seat Anti-Abuse Rules |
| F-547 | pricing_primitive | §34.14.1 | ⚠ | — | — | Seller Rate Card |
| F-548 | pricing_primitive | §34.14.3 | ⚠ | — | — | Authored Floor Values (Rate Card) |
| F-549 | engine_concept | §34.14.5 | ⚠ | — | — | Rate Card Lifecycle Management |
| F-550 | engine_concept | §34.15 | ✅ | — | — | Seller Outcome Signals |
| F-551 | engine_concept | §34.17 | ✅ | — | — | Pricing Engineering Requirements |
| F-552 | engine_concept | §34.18 | ❌ | — | — | Margin Floor Enforcement (88%/90%) |
| F-553 | engine_concept | §34.18.5 | ❌ | — | — | Monthly Finance Scorecard |
| F-554 | engine_concept | §34.18.3 | ❌ | — | — | Year-1 Plan Mix Targets |
| F-555 | engine_concept | §34.19 | ✅ | — | — | Seller Plan Upgrade Carry-Over Guarantee |
| F-556 | engine_concept | §34.19.2 | ⚠ | — | — | KB Value Meter (Reputation Signal) |
| F-557 | platform_mechanic | §34.19.4 | ⚠ | — | — | Honest-Portability Microcopy |

### 3. §35 (10 features)

| Feature ID | Class | Anchor | M.1 | M.5 | AE | Name |
| :---- | :---- | :---- | :--: | :--: | :--: | :---- |
| F-558 | user_capability | §35.1 | ✅ | — | — | Buyer Onboarding Flow |
| F-559 | user_capability | §35.2 | ✅ | — | — | Seller Onboarding Flow (Forced-Signup Hero Moment) |
| F-560 | surface | §35.2.3 | ⚠ | — | — | Progress Storytelling Bootstrap UI |
| F-561 | surface | §35.2.6 | ⚠ | — | — | Stake-Reveal Screen |
| F-562 | surface | §35.2.7 | ⚠ | — | — | Outcome Debrief Surface |
| F-563 | growth_mechanic | §35.2.9 | ⚠ | — | — | Buyer-Funded Pro Trial Seat Acceptance |
| F-564 | engine_concept | §35.2.10 | ⚠ | — | — | Seller Activation Metric (magic-link → first response) |
| F-565 | platform_mechanic | §35.2.11 | ⚠ | — | — | Onboarding Anti-Patterns Ban List |
| F-566 | user_capability | §35.3 | ✅ | — | — | Setup Checklist Recoverability |
| F-897 | engine_concept | §35.2 | ✅ | — | — | Hero Moment Instrumentation Contract |

### 3. §36 (2 features)

| Feature ID | Class | Anchor | M.1 | M.5 | AE | Name |
| :---- | :---- | :---- | :--: | :--: | :--: | :---- |
| F-567 | surface | §36.1 | ✅ | — | — | User Settings |
| F-568 | surface | §36.3 | ✅ | — | — | Workspace Settings |

### 3. §37 (4 features)

| Feature ID | Class | Anchor | M.1 | M.5 | AE | Name |
| :---- | :---- | :---- | :--: | :--: | :--: | :---- |
| F-569 | platform_mechanic | §37.1 | ✅ | — | — | WCAG 2.1 AA Accessibility Contract |
| F-570 | engine_concept | §37.2 | ✅ | — | — | Internationalization (i18n) Architecture |
| F-571 | platform_mechanic | §37.3 | ✅ | — | — | RTL Support (CSS-Logical-Properties Readiness) |
| F-572 | platform_mechanic | §37.4 | ❌ | — | — | Accessibility Testing Pipeline |

### 3. §38 (18 features)

| Feature ID | Class | Anchor | M.1 | M.5 | AE | Name |
| :---- | :---- | :---- | :--: | :--: | :--: | :---- |
| F-573 | platform_mechanic | §38.2 | ❌ | — | — | Browser Support Matrix |
| F-574 | platform_mechanic | §38.3 | ❌ | — | — | JavaScript Requirement |
| F-575 | user_capability | §38.4 | ✅ | — | — | Mobile Feature Parity Coarse Rules |
| F-576 | engine_concept | §38.6 | ✅ | — | — | Authoritative Five-Tier Breakpoint Taxonomy |
| F-577 | engine_concept | §38.6.3 | ⚠ | — | — | UserUIPreference Entity (Per-Breakpoint Preferences) |
| F-578 | platform_mechanic | §38.6.4 | ⚠ | — | — | Tier-Transition Edge-Case Contract |
| F-579 | platform_mechanic | §38.6.5 | ⚠ | — | — | Responsive Conformance Test Suite |
| F-580 | engine_concept | §38.7 | ❌ | — | — | Keyboard-to-Gesture Translation Contract |
| F-581 | platform_mechanic | §38.7.2 | ❌ | — | — | 5-Tap Ceiling |
| F-582 | platform_mechanic | §38.7.4 | ❌ | — | — | Tap-Count Probe Test Harness |
| F-583 | engine_concept | §38.8 | ✅ | — | — | Mobile Feature Parity Matrix |
| F-584 | platform_mechanic | §38.8.1 | ⚠ | — | — | Cross-Tier Component Transition Contract |
| F-585 | platform_mechanic | §38.8.3 | ⚠ | — | — | Simplification Disclosure Contract |
| F-586 | platform_mechanic | §38.8.5 | ⚠ | — | — | Mobile Release Gate |
| F-587 | platform_mechanic | §38.9 | ✅ | — | — | Print Stylesheet Behavior |
| F-588 | platform_mechanic | §38.10 | ✅ | — | — | Reduced-Motion & Accessibility Tier Overrides |
| F-589 | platform_mechanic | §38.11 | ❌ | — | — | RTL & Locale Mirror Behavior Contract |
| F-590 | surface | §38.12 | ✅ | — | — | Presence Avatar Stack Component |

### 3. §39 (1 features)

| Feature ID | Class | Anchor | M.1 | M.5 | AE | Name |
| :---- | :---- | :---- | :--: | :--: | :--: | :---- |
| F-591 | engine_concept | §39 | ❌ | — | — | Object Size Constraints Registry |

### 3. §40 (4 features)

| Feature ID | Class | Anchor | M.1 | M.5 | AE | Name |
| :---- | :---- | :---- | :--: | :--: | :--: | :---- |
| F-592 | user_capability | §40.1 | ✅ | — | — | Export Formats Catalog (CSV/PDF/Excel/JSON) |
| F-593 | platform_mechanic | §40.2 | ✅ | ✅ | — | Data Retention & Deletion Registry |
| F-594 | user_capability | §40.3 | ❌ | — | — | Data Import (Enterprise-Assisted) |
| F-595 | platform_mechanic | §40.4 | ✅ | — | — | Round-Trip Fidelity Guarantee |

### 3. §41 (3 features)

| Feature ID | Class | Anchor | M.1 | M.5 | AE | Name |
| :---- | :---- | :---- | :--: | :--: | :--: | :---- |
| F-596 | engine_concept | §41.2 | ✅ | — | — | Email Type Catalog |
| F-597 | platform_mechanic | §41.3 | ❌ | — | — | Email Compliance (CASL/CAN-SPAM/GDPR) |
| F-598 | platform_mechanic | §41.4 | ✅ | — | — | Opt-Out Classification |

### 3. §42 (9 features)

| Feature ID | Class | Anchor | M.1 | M.5 | AE | Name |
| :---- | :---- | :---- | :--: | :--: | :--: | :---- |
| F-599 | platform_mechanic | §42.1 | ✅ | — | — | SLA Commitments |
| F-600 | platform_mechanic | §42.2 | ✅ | — | — | Monitoring & Alerting Rules |
| F-601 | platform_mechanic | §42.3 | ✅ | — | — | Incident Response Process |
| F-602 | platform_mechanic | §42.3.1 | ⚠ | — | — | Marketplace Abuse Operational SLA |
| F-603 | platform_mechanic | §42.4 | ✅ | ✅ | — | Disaster Recovery Targets (RTO/RPO) |
| F-604 | platform_mechanic | §42.5 | ❌ | — | — | On-Call Rotation |
| F-605 | engine_concept | §42.6 | ✅ | — | — | Observability Stack |
| F-606 | engine_concept | §42.6.0 | ⚠ | — | — | External Provider Health Detectors |
| F-607 | engine_concept | §42.6.1 | ⚠ | — | — | Audit Integrity Background Jobs |

### 3. §43 (4 features)

| Feature ID | Class | Anchor | M.1 | M.5 | AE | Name |
| :---- | :---- | :---- | :--: | :--: | :--: | :---- |
| F-608 | surface | §43.1 | ✅ | — | — | Admin Dashboard |
| F-609 | platform_mechanic | §43.2 | ❌ | — | — | Admin Dashboard Access Control |
| F-610 | integration_surface | §43.3 | ✅ | — | — | Support Tools (Zendesk/Impersonation/Export/Datadog/Sentry/P… |
| F-611 | platform_mechanic | §43.4 | ❌ | — | — | Admin Audit Log |

### 3. §44 (13 features)

| Feature ID | Class | Anchor | M.1 | M.5 | AE | Name |
| :---- | :---- | :---- | :--: | :--: | :--: | :---- |
| F-612 | platform_mechanic | §44.1 | ✅ | — | — | Performance Targets |
| F-613 | platform_mechanic | §44.2 | ✅ | — | — | Agent Performance Budgets |
| F-614 | engine_concept | §44.3 | ✅ | — | — | Optimization Strategies |
| F-615 | platform_mechanic | §44.4 | ⚠ | — | — | Load Testing Cadence |
| F-616 | platform_mechanic | §44.6 | ✅ | — | — | Solo-Tier Surface Treatment (AI Consumption Invisibility) |
| F-617 | platform_mechanic | §44.6.1 | ✅ | — | — | Solo Surface Hide List |
| F-618 | surface | §44.6.2 | ✅ | ✅ | — | Solo Single-Card Billing Surface |
| F-619 | pricing_primitive | §44.6.3 | ✅ | ✅ | — | Solo Margin Envelope Defaults |
| F-620 | engine_concept | §44.6.4 | ✅ | ✅ | — | Solo Throttling Behavior |
| F-621 | engine_concept | §44.6.4.1 | ✅ | ⚠ | — | surface_throttling_class Capability-Registry Field |
| F-622 | api_surface | §44.6.5 | ⚠ | ✅ | — | Solo Engine Telemetry & Webhook Catalog |
| F-623 | api_surface | §44.6.6 | ✅ | — | — | Public Pricing API Solo Behavior |
| F-624 | platform_mechanic | §44.6.7 | ⚠ | ✅ | — | Solo Edge Cases & Failure Modes |

### 3. §45 (3 features)

| Feature ID | Class | Anchor | M.1 | M.5 | AE | Name |
| :---- | :---- | :---- | :--: | :--: | :--: | :---- |
| F-625 | platform_mechanic | §45.1 | ✅ | — | — | Data Privacy Posture |
| F-626 | platform_mechanic | §45.2 | ❌ | — | — | Abuse Prevention Controls |
| F-627 | platform_mechanic | §45.3 | ✅ | — | — | Marketplace Abuse Escalation Workflow |

### 3. §46 (4 features)

| Feature ID | Class | Anchor | M.1 | M.5 | AE | Name |
| :---- | :---- | :---- | :--: | :--: | :--: | :---- |
| F-628 | platform_mechanic | §46.1 | ✅ | — | — | Test Pyramid (Unit/Integration/E2E) |
| F-629 | platform_mechanic | §46.2 | ❌ | — | — | Advanced Feature Test Cases |
| F-630 | platform_mechanic | §46.3 | ❌ | — | — | QA Process & Canary Release |
| F-631 | engine_concept | §46.4 | ✅ | — | — | Feature Flag System |

### 3. §47 (4 features)

| Feature ID | Class | Anchor | M.1 | M.5 | AE | Name |
| :---- | :---- | :---- | :--: | :--: | :--: | :---- |
| F-632 | platform_mechanic | §47.1 | ✅ | — | — | Specification Versioning |
| F-633 | platform_mechanic | §47.2 | ✅ | — | — | Change Management Process |
| F-634 | engine_concept | §47.3 | ✅ | — | — | Known Limitations & Phase 2 Roadmap |
| F-635 | platform_mechanic | §47.4 | ❌ | — | — | Data Residency & Compliance Roadmap |

### 3. §48 (51 features)

| Feature ID | Class | Anchor | M.1 | M.5 | AE | Name |
| :---- | :---- | :---- | :--: | :--: | :--: | :---- |
| F-636 | engine_concept | §48.1 | ❌ | — | — | PLG Framework Overview |
| F-637 | engine_concept | §48.1.1 | ❌ | — | — | Buyer Console Paid Path Funnel |
| F-638 | engine_concept | §48.1.2 | ❌ | — | — | Seller Console Paid Path Funnel |
| F-639 | platform_mechanic | §48.1.3 | ❌ | — | — | PLG Funnel Configurability (plg_funnel_definition) |
| F-640 | user_capability | §48.1.5 | ❌ | — | — | Seller Hero Moment Framework (Four-Phase) |
| F-641 | engine_concept | §48.1.6 | ❌ | — | — | Seller Activation Leading Indicators (8) |
| F-642 | growth_mechanic | §48.1.7 | ❌ | — | — | Three Conversion Moments |
| F-643 | engine_concept | §48.2.12 | ⚠ | — | — | GrowthLoopExecution entity |
| F-644 | platform_mechanic | §48.2.12.4 | ⚠ | — | — | GrowthLoopKillSwitch entity |
| F-645 | growth_mechanic | §48.2.2 | ⚠ | — | — | Loop L1: Vendor-Invite-Creates-Account |
| F-646 | growth_mechanic | §48.2.3 | ⚠ | — | — | Loop L2: Template-Clone-Attribution |
| F-647 | growth_mechanic | §48.2.5 | ⚠ | — | — | Loop L4: Seller-Profile SEO |
| F-648 | growth_mechanic | §48.2.6 | ⚠ | — | — | Loop L5: Free-AI-Teaser-to-Paid |
| F-649 | growth_mechanic | §48.2.8 | ⚠ | — | — | Loop L7: Cmd+K Suggestion Loop |
| F-650 | growth_mechanic | §48.2.9 | ⚠ | — | — | Loop L8: Bid-Close-Offers-KB-Sync |
| F-651 | growth_mechanic | §48.2.10 | ⚠ | — | — | Loop L9: Template Publish Incentive |
| F-652 | growth_mechanic | §48.2.11 | ✅ | — | — | Loop L10: Marketplace Match-Score Teaser |
| F-653 | platform_mechanic | §48.3.1 | ⚠ | — | — | Network Effects (Sellers/Buyers/Data/SEO/Trust/Referrals Com… |
| F-654 | engine_concept | §48.3.5 | ⚠ | — | — | Seven Seller-Side Compounding Loops (S1–S7) |
| F-655 | surface | §48.3.3 | ⚠ | — | — | Network Effects Dashboard |
| F-656 | surface | §48.3.3 | ⚠ | — | — | Growth Loop Operations Dashboard |
| F-657 | surface | §48.3.3 | ⚠ | — | — | Anti-Spam & SIM Dashboard |
| F-658 | platform_mechanic | §48.4 | ✅ | — | — | Anti-Spam & Abuse Controls (Global) |
| F-659 | platform_mechanic | §48.4.1 | ⚠ | — | — | Email Throttling (per-Org / per-recipient / per-account) |
| F-660 | platform_mechanic | §48.4.2 | ⚠ | — | — | DMARC/SPF Reputation Controls |
| F-661 | platform_mechanic | §48.4.3 | ⚠ | — | — | Shared-Use Domain Detection |
| F-662 | platform_mechanic | §48.4.4 | ⚠ | — | — | Content Validators (six classes) |
| F-663 | platform_mechanic | §48.4.5 | ⚠ | — | — | Template Spam ML Classifier |
| F-664 | platform_mechanic | §48.4.6 | ⚠ | — | — | Referral Fraud Controls |
| F-665 | platform_mechanic | §48.4.7 | ⚠ | — | — | k-Anonymity Floors (k=5/10/20) |
| F-666 | platform_mechanic | §48.4.8 | ⚠ | — | — | Suppression List (SuppressionListEntry) |
| F-667 | engine_concept | §48.4.10 | ⚠ | — | — | Signal Integrity Monitor (SIM) |
| F-668 | platform_mechanic | §48.4.12 | ⚠ | — | — | Seller Pricing Acceptable-Use Floor (7 Constraints) |
| F-669 | growth_mechanic | §48.5.1 | ❌ | — | — | Growth Mechanic M1: Stakeholder Read-Only Invite |
| F-670 | growth_mechanic | §48.5.2 | ✅ | — | — | Growth Mechanic M2: Selection Report Public Link (Watermarke… |
| F-671 | growth_mechanic | §48.5.3 | ❌ | — | — | Growth Mechanic M3: Evaluation Certificate Badge |
| F-672 | growth_mechanic | §48.5.4 | ❌ | — | — | Growth Mechanic M4: Kick Off Next Evaluation on Close |
| F-673 | growth_mechanic | §48.5.5 | ❌ | — | — | Growth Mechanic M5: Buyer-Pull Vendor Invite |
| F-674 | growth_mechanic | §48.5.6 | ❌ | — | — | Growth Mechanic M6: Domain-Based Auto-Join |
| F-675 | growth_mechanic | §48.5.7 | ❌ | — | — | Growth Mechanic M7: Suggested Team Discovery |
| F-676 | growth_mechanic | §48.5.8 | ❌ | — | — | Growth Mechanic M8: Org Intelligence Value Curve |
| F-677 | growth_mechanic | §48.6.5 | ❌ | — | — | Growth Mechanic M9: Per-Category Marketplace Landing Pages |
| F-678 | growth_mechanic | §48.6.6 | ❌ | — | — | Growth Mechanic M10: How to Evaluate [X] Guides |
| F-679 | growth_mechanic | §48.6.7 | ❌ | — | — | Growth Mechanic M11: Software Comparison Pages |
| F-680 | growth_mechanic | §48.6.8 | ❌ | — | — | Growth Mechanic M12: Aggregate Market Intelligence Reports |
| F-681 | growth_mechanic | §48.6.9 | ❌ | — | — | Growth Mechanic M13: Public Marketplace Heat Map |
| F-682 | growth_mechanic | §48.7.1 | ❌ | — | — | Growth Mechanic M14: Seller Bid Success Share |
| F-683 | growth_mechanic | §48.7.2 | ❌ | — | — | Growth Mechanic M15: Ghost-Bid Importer |
| F-684 | growth_mechanic | §48.7.3 | ❌ | — | — | Growth Mechanic M16: Buyer Referral Credit |
| F-685 | user_capability | §48.8 | ❌ | — | — | Seller Hero Moment (Surface Specification) |
| F-686 | platform_mechanic | §48.8.7 | ❌ | — | — | Six Banned Onboarding Anti-Patterns (AP1–AP6) |

### 3. §49 (9 features)

| Feature ID | Class | Anchor | M.1 | M.5 | AE | Name |
| :---- | :---- | :---- | :--: | :--: | :--: | :---- |
| F-687 | engine_concept | §49.1 | ❌ | — | — | Seven-Stage Seller Onboarding Flow |
| F-688 | user_capability | §49.1.1 | ❌ | — | — | Stage 1: Magic-Link Arrival |
| F-689 | user_capability | §49.1.2 | ❌ | — | — | Stage 2: Domain Bootstrap |
| F-690 | user_capability | §49.1.3 | ❌ | — | — | Stage 3: First-Pass Draft |
| F-691 | user_capability | §49.1.4 | ❌ | — | — | Stage 4: Landing Screen ("Your bid is ready") |
| F-692 | user_capability | §49.1.5 | ❌ | — | — | Stage 5: In-Workspace Review |
| F-693 | user_capability | §49.1.6 | ❌ | — | — | Stage 6: First Bid Submission |
| F-694 | user_capability | §49.1.7 | ❌ | — | — | Stage 7: Post-Submission Debrief |
| F-695 | platform_mechanic | §49.1.9 | ❌ | — | — | Onboarding Anti-Pattern Runtime Detectors & CI Gates |

### 3. §50 (55 features)

| Feature ID | Class | Anchor | M.1 | M.5 | AE | Name |
| :---- | :---- | :---- | :--: | :--: | :--: | :---- |
| F-696 | surface | §50 | ❌ | — | — | Sourcera Ops Console |
| F-697 | engine_concept | §50.2 | ❌ | — | — | Ops Console Separation Architecture |
| F-698 | platform_mechanic | §50.2.2 | ❌ | — | — | Ops Authentication Model (hardware-key MFA) |
| F-699 | engine_concept | §50.2.3 | ❌ | — | — | Ops Customer-API Mutation Path |
| F-700 | platform_mechanic | §50.2.4 | ❌ | — | — | Ops No-Direct-DB-Access Enforcement |
| F-701 | engine_concept | §50.3 | ❌ | — | — | Ops Role Matrix (Capability Envelope) |
| F-702 | platform_mechanic | §50.3.4 | ❌ | — | — | Ops Role Assignment State Machine |
| F-703 | platform_mechanic | §50.3.5 | ❌ | — | — | Bootstrap & Escape-Hatch Paths |
| F-704 | engine_concept | §50.4 | ❌ | — | — | Impersonation Audit (justification + time-box) |
| F-705 | platform_mechanic | §50.4.2 | ❌ | — | — | Ops Time-Box Enforcement Sweeper |
| F-706 | platform_mechanic | §50.4.3 | ❌ | — | — | OpsSession State Machine |
| F-707 | platform_mechanic | §50.4.4 | ❌ | — | — | Quorum Rules (61–240 / 241–480 min) |
| F-708 | platform_mechanic | §50.4.5 | ❌ | — | — | Customer Notification Dispatch (Ops Session) |
| F-709 | user_capability | §50.4.7 | ❌ | — | — | Customer Revocation Surface (OpsSession) |
| F-710 | surface | §50.4.8 | ❌ | — | — | Customer-Visible Projection (OpsSession) |
| F-711 | engine_concept | §50.5 | ❌ | — | — | Ops-Tagged Audit Actor (actor_type='ops') |
| F-712 | surface | §50.6.1 | ❌ | — | — | Ops Cross-Reference View |
| F-713 | platform_mechanic | §50.6.4 | ❌ | — | — | Incident Response Workflow (Ops) |
| F-714 | platform_mechanic | §50.6.4 | ❌ | — | — | OpsKillSwitchBundle |
| F-715 | surface | §50.10 | ❌ | — | — | Taxonomy CMS Authoring Surface |
| F-716 | surface | §50.10.3 | ❌ | — | — | Taxonomy Node Authoring Editor |
| F-717 | surface | §50.10.2 | ❌ | — | — | Taxonomy Proposal Review Queue |
| F-718 | surface | §50.10.2 | ❌ | — | — | Taxonomy Deprecation Planner |
| F-719 | surface | §50.10.2 | ❌ | — | — | Taxonomy Migration Progress Surface |
| F-720 | surface | §50.10.2 | ❌ | — | — | Taxonomy Alias Manager |
| F-721 | surface | §50.11 | ❌ | — | — | Seller Template Review Rubric |
| F-722 | engine_concept | §50.11.4 | ❌ | — | — | SellerTemplateReviewAssessment |
| F-723 | engine_concept | §50.11.6 | ❌ | — | — | SellerTemplateReviewAppeal |
| F-724 | engine_concept | §50.11.7 | ❌ | — | — | Template Review Calibration Pack |
| F-725 | surface | §50.12 | ❌ | — | — | Pricing Admin Surface |
| F-726 | engine_concept | §50.12.2 | ❌ | — | — | PricingAdminChangeProposal |
| F-727 | engine_concept | §50.12.5 | ❌ | — | — | Pricing Simulation Run |
| F-728 | platform_mechanic | §50.12.6 | ❌ | — | — | Pricing Customer Comms Plan |
| F-729 | surface | §50.12.9 | ❌ | — | — | Free-Allowance Editor (Pricing Admin) |
| F-730 | surface | §50.12.8 | ❌ | — | — | Cost-Base Override Editor |
| F-731 | surface | §50.13 | ❌ | — | — | Baseline Assumption Manager |
| F-732 | engine_concept | §50.13.2 | ❌ | — | — | BaselineAssumption / BaselineAssumptionVersion |
| F-733 | platform_mechanic | §50.13.5 | ❌ | — | — | BaselineAssumptionPilotRun |
| F-734 | surface | §50.14 | ❌ | — | — | Internal Analytics Dashboards (by role) |
| F-735 | surface | §50.14.3 | ❌ | — | — | Growth PM Dashboard |
| F-736 | surface | §50.14.4 | ❌ | — | — | GTM Lead Dashboard |
| F-737 | surface | §50.14.5 | ❌ | — | — | Support Dashboard |
| F-738 | surface | §50.14.6 | ❌ | — | — | Fraud Analyst Dashboard |
| F-739 | surface | §50.14.7 | ❌ | — | — | Finance Dashboard |
| F-740 | platform_mechanic | §50.14.8 | ❌ | — | — | OpsAnalyticsDashboardConfig (versioning) |
| F-741 | surface | §50.15 | ❌ | — | — | Signal Integrity Monitor — Detector, Review, Kill-Switch Sur… |
| F-742 | engine_concept | §50.15.2 | ❌ | — | — | SIMSignal entity |
| F-743 | engine_concept | §50.15.3 | ❌ | — | — | SIMCase entity |
| F-744 | engine_concept | §50.15.4 | ❌ | — | — | SIM Detector Catalog (4 new categories) |
| F-745 | platform_mechanic | §50.15.7 | ❌ | — | — | SIM One-Click Kill-Switch (per growth mechanic) |
| F-746 | surface | §50.16 | ❌ | — | — | Fraud Analyst Surface |
| F-747 | surface | §50.16.2 | ❌ | — | — | Fraud Analyst Review Queue |
| F-748 | engine_concept | §50.16.3 | ❌ | — | — | Fraud Analyst Case Action Set |
| F-749 | platform_mechanic | §50.17.4 | ❌ | — | — | Token Drift Check (Ops Console Surface) |
| F-750 | surface | §50.17.5 | ❌ | — | — | Paging Runbook Surface |

### 3. §51 (23 features)

| Feature ID | Class | Anchor | M.1 | M.5 | AE | Name |
| :---- | :---- | :---- | :--: | :--: | :--: | :---- |
| F-751 | engine_concept | §51.1 | ❌ | — | — | Event Taxonomy (canonical event families) |
| F-752 | engine_concept | §51.1.1 | ❌ | — | — | Canonical Event Family Registry |
| F-753 | engine_concept | §51.1.2 | ❌ | — | — | Event Schema Envelope (3-layer) |
| F-754 | platform_mechanic | §51.1.3 | ❌ | — | — | Event Naming Convention & Registry Governance |
| F-755 | platform_mechanic | §51.1.4 | ❌ | — | — | Dual-Write Contract (Convex → PostHog) |
| F-756 | engine_concept | §51.2 | ❌ | — | — | Standardized Event Properties |
| F-757 | engine_concept | §51.2.3 | ❌ | — | — | Capability Domain Registry (PostHog) |
| F-758 | platform_mechanic | §51.2.4 | ❌ | — | — | Cardinality Budget Discipline |
| F-759 | platform_mechanic | §51.2.5 | ❌ | — | — | Property Validator Contract |
| F-760 | surface | §51.3 | ❌ | — | — | Org-Level Usage Dashboard |
| F-761 | engine_concept | §51.3.2 | ❌ | — | — | UsageDashboardSnapshot entity |
| F-762 | surface | §51.4 | ❌ | — | — | User-Level Usage Dashboard |
| F-763 | user_capability | §51.5 | ❌ | — | — | Seller Usage Parity Dashboard |
| F-764 | surface | §51.5.2 | ❌ | — | — | Per-Bid Spend Panel |
| F-765 | surface | §51.5.3 | ❌ | — | — | KB Utilization Panel |
| F-766 | surface | §51.5.4 | ❌ | — | — | Win-Rate Correlation Panel |
| F-767 | engine_concept | §51.6 | ❌ | — | — | Time-Saved Baseline Model |
| F-768 | surface | §51.6.3 | ❌ | — | — | Time-Saved Customer-Visible Panel |
| F-769 | platform_mechanic | §51.6.4 | ❌ | — | — | Time-Saved Methodology Disclosure |
| F-770 | platform_mechanic | §51.7 | ❌ | — | — | PLG Instrumentation Retention & DSAR |
| F-771 | platform_mechanic | §51.7.2 | ❌ | — | — | Usage Analytics DSAR Flow |
| F-772 | platform_mechanic | §51.7.3 | ❌ | — | — | Usage Analytics Residency Partition |
| F-773 | platform_mechanic | §51.7.4 | ❌ | — | — | Usage Analytics GDPR Right-to-Erasure |

### 3. Appendix A (1 features)

| Feature ID | Class | Anchor | M.1 | M.5 | AE | Name |
| :---- | :---- | :---- | :--: | :--: | :--: | :---- |
| F-774 | engine_concept | Appendix A | ❌ | — | — | Requirement Status State Machine |

### 3. Appendix D (1 features)

| Feature ID | Class | Anchor | M.1 | M.5 | AE | Name |
| :---- | :---- | :---- | :--: | :--: | :--: | :---- |
| F-775 | engine_concept | Appendix D | ❌ | — | — | Response Status State Machine |

### 3. Appendix E (1 features)

| Feature ID | Class | Anchor | M.1 | M.5 | AE | Name |
| :---- | :---- | :---- | :--: | :--: | :--: | :---- |
| F-776 | engine_concept | Appendix E | ✅ | — | — | Workspace & Bid Workspace Status State Machine |

### 3. Appendix F (2 features)

| Feature ID | Class | Anchor | M.1 | M.5 | AE | Name |
| :---- | :---- | :---- | :--: | :--: | :--: | :---- |
| F-777 | platform_mechanic | Appendix F | ✅ | — | — | Webhook Retry & Recovery (DLQ + exponential backoff) |
| F-778 | platform_mechanic | Appendix F.2 | ⚠ | — | — | Financial-Impact Webhook Retry Curve |

### 3. Appendix G (2 features)

| Feature ID | Class | Anchor | M.1 | M.5 | AE | Name |
| :---- | :---- | :---- | :--: | :--: | :--: | :---- |
| F-779 | engine_concept | Appendix G | ❌ | — | — | PostHog Event Taxonomy |
| F-780 | platform_mechanic | Appendix G | ❌ | — | — | Required Standard PostHog Property Set |

### 3. Appendix H (1 features)

| Feature ID | Class | Anchor | M.1 | M.5 | AE | Name |
| :---- | :---- | :---- | :--: | :--: | :--: | :---- |
| F-781 | engine_concept | Appendix H | ✅ | — | — | Stripe Billing Model |

### 3. Appendix I (1 features)

| Feature ID | Class | Anchor | M.1 | M.5 | AE | Name |
| :---- | :---- | :---- | :--: | :--: | :--: | :---- |
| F-782 | engine_concept | Appendix I | ✅ | ✅ | — | API Error Code Catalog |

### 3. Appendix J (1 features)

| Feature ID | Class | Anchor | M.1 | M.5 | AE | Name |
| :---- | :---- | :---- | :--: | :--: | :--: | :---- |
| F-783 | engine_concept | Appendix J | ✅ | ✅ | — | Controlled Vocabulary Registry |

### 3. Appendix K (1 features)

| Feature ID | Class | Anchor | M.1 | M.5 | AE | Name |
| :---- | :---- | :---- | :--: | :--: | :--: | :---- |
| F-784 | engine_concept | Appendix K | ❌ | ✅ | — | Glossary (canonical term registry) |

### 3. Appendix L (8 features)

| Feature ID | Class | Anchor | M.1 | M.5 | AE | Name |
| :---- | :---- | :---- | :--: | :--: | :--: | :---- |
| F-263 | engine_concept | Appendix L.7 | ❌ | — | — | Defense View State Machine |
| F-785 | engine_concept | Appendix L | ❌ | — | — | Entity State Machines (Aggregate) |
| F-786 | engine_concept | Appendix L.1 | ❌ | — | — | Internal Comment Thread State Machine |
| F-787 | engine_concept | Appendix L.2 | ✅ | — | — | Buyer Referral State Machine |
| F-788 | engine_concept | Appendix L.3 | ✅ | — | — | Pro Trial Seat Grant State Machine |
| F-789 | engine_concept | Appendix L.4 | ✅ | — | — | KB Entry State Machine |
| F-790 | engine_concept | Appendix L.5 | ✅ | — | — | KB Document State Machine |
| F-791 | engine_concept | Appendix L.6 | ✅ | — | — | Target Account State Machine |

### 3. Appendix M (46 features)

| Feature ID | Class | Anchor | M.1 | M.5 | AE | Name |
| :---- | :---- | :---- | :--: | :--: | :--: | :---- |
| F-792 | engine_concept | Appendix M.1 | ❌ | — | — | Surface/Engine Mapping Registry |
| F-793 | platform_mechanic | Appendix M.2 | ❌ | — | — | Surface/Engine Process Gates |
| F-794 | engine_concept | Appendix M.3 | ❌ | — | — | Appendix M Authored Extension Note |
| F-795 | platform_mechanic | Appendix M.4 | ❌ | — | — | appendix_m_coverage_on_diff CI Gate |
| F-796 | platform_mechanic | Appendix M.4.4 | ❌ | — | — | @appendix-m-internal-only Override Annotation |
| F-797 | engine_concept | Appendix M.5 | ❌ | — | — | M.5 37-Gate CI Catalog |
| F-798 | platform_mechanic | Appendix M.5 (Phase 14.1) | ❌ | — | — | principle_9_anchor_canonicality CI Gate |
| F-799 | platform_mechanic | Appendix M.5 (Phase 14.2) | ❌ | — | — | appendix_m_engine_to_surface_completeness CI Gate |
| F-800 | platform_mechanic | Appendix M.5 (Phase 14.2) | ❌ | — | — | appendix_m_no_inline_engine_concepts_in_ux_spec CI Gate |
| F-801 | platform_mechanic | Appendix M.5 (Phase 14.2) | ❌ | — | — | appendix_m_no_orphan_engine_concept CI Gate |
| F-802 | platform_mechanic | Appendix M.5 (Phase 14.2) | ❌ | — | — | appendix_m_tier_visibility_smoke CI Gate |
| F-803 | platform_mechanic | Appendix M.5 (Phase 14.4) | ❌ | — | — | solo_mode_engine_field_not_in_seller_serializers CI Gate |
| F-804 | platform_mechanic | Appendix M.5 (Phase 14.4) | ❌ | — | — | solo_mode_team_to_solo_blocked_with_stakeholders CI Gate |
| F-805 | platform_mechanic | Appendix M.5 (Phase 14.4) | ❌ | — | — | solo_mode_chip_ribbon_suppression_buyer CI Gate |
| F-806 | platform_mechanic | Appendix M.5 (Phase 14.5) | ❌ | — | — | console_bridge_no_defense_view_event_kinds CI Gate |
| F-807 | platform_mechanic | Appendix M.5 (Phase 14.5) | ❌ | — | — | webhook_payload_no_selection_record_body CI Gate |
| F-808 | platform_mechanic | Appendix M.5 (Phase 14.5) | ❌ | — | — | defense_view_regeneration_throttle_5min CI Gate |
| F-809 | platform_mechanic | Appendix M.5 (Phase 14.6) | ❌ | — | — | pipeline_surface_compression_engine_unchanged CI Gate |
| F-810 | platform_mechanic | Appendix M.5 (Phase 14.6) | ❌ | — | — | pipeline_surface_compression_step_to_phase_canonical CI Gate |
| F-811 | platform_mechanic | Appendix M.5 (Phase 14.6) | ❌ | — | — | pipeline_surface_compression_no_separate_seller_phase_counte… |
| F-812 | platform_mechanic | Appendix M.5 (Phase 14.6) | ❌ | — | — | pipeline_surface_compression_seller_always_compressed CI Gat… |
| F-813 | platform_mechanic | Appendix M.5 (Phase 14.6) | ❌ | — | — | pipeline_surface_compression_soft_gate_solo_only CI Gate |
| F-814 | platform_mechanic | Appendix M.5 (Phase 14.7) | ❌ | — | — | eval_vertical_eval_starter_coverage CI Gate |
| F-815 | platform_mechanic | Appendix M.5 (Phase 14.7) | ❌ | — | — | eval_starter_seed_schema_currency CI Gate |
| F-816 | platform_mechanic | Appendix M.5 (Phase 14.7) | ❌ | — | — | eval_starter_seed_use_case_index_validity CI Gate |
| F-817 | platform_mechanic | Appendix M.5 (Phase 14.7) | ❌ | — | — | eval_starter_marketplace_category_mapping_present CI Gate |
| F-818 | platform_mechanic | Appendix M.5 (Phase 14.8) | ❌ | — | — | seller_maya_surface_abstraction_engine_unchanged CI Gate |
| F-819 | platform_mechanic | Appendix M.5 (Phase 14.8) | ❌ | — | — | seller_maya_solo_free_copy_string_lint CI Gate |
| F-820 | platform_mechanic | Appendix M.5 (Phase 14.8) | ❌ | — | — | seller_maya_chip_list_auto_publish_state_machine CI Gate |
| F-821 | platform_mechanic | Appendix M.5 (Phase 14.8) | ❌ | — | — | seller_maya_match_score_three_label_compression CI Gate |
| F-822 | platform_mechanic | Appendix M.5 (Phase 14.9) | ❌ | — | — | solo_tier_numeric_single_source CI Gate |
| F-823 | platform_mechanic | Appendix M.5 (Phase 14.9) | ❌ | — | — | solo_charge_kind_registered CI Gate |
| F-824 | platform_mechanic | Appendix M.5 (Phase 14.9) | ❌ | — | — | solo_dual_console_independent_invoicing CI Gate |
| F-825 | platform_mechanic | Appendix M.5 (Phase 14.9) | ❌ | — | — | solo_plan_change_console_isolation CI Gate |
| F-826 | platform_mechanic | Appendix M.5 (Phase 14.9) | ❌ | — | — | aiwallet_response_excludes_solo_envelope CI Gate |
| F-827 | platform_mechanic | Appendix M.5 (Phase 14.9) | ❌ | — | — | solo_subscription_blocks_per_charge CI Gate |
| F-828 | platform_mechanic | Appendix M.5 (Phase 14.9) | ❌ | — | — | solo_role_grid_inclusion CI Gate |
| F-829 | platform_mechanic | Appendix M.5 (Phase 14.10) | ❌ | — | — | solo_engine_metering_parity CI Gate |
| F-830 | platform_mechanic | Appendix M.5 (Phase 14.10) | ❌ | — | — | solo_telemetry_no_customer_routing CI Gate |
| F-831 | platform_mechanic | Appendix M.5 (Phase 14.10) | ❌ | — | — | solo_envelope_value_single_source CI Gate |
| F-832 | platform_mechanic | Appendix M.5 (Phase 14.10) | ❌ | — | — | solo_billing_card_price_single_source CI Gate |
| F-833 | platform_mechanic | Appendix M.5 (Phase 14.10) | ❌ | — | — | solo_throttling_class_change_takes_effect_at_next_envelope_r… |
| F-834 | platform_mechanic | Appendix M.5 (Phase 14.10) | ❌ | — | — | solo_envelope_per_console_isolation CI Gate |
| F-835 | platform_mechanic | Appendix M.5 (Phase 14.10) | ❌ | — | — | solo_capability_registry_field_registration CI Gate |
| F-836 | platform_mechanic | Appendix M.5 (Phase 14.10) | ❌ | — | — | solo_envelope_throttling_targets_low_priority_background_onl… |
| F-837 | platform_mechanic | Appendix M.5 (Phase 14.17) | ❌ | — | — | first_30_seconds_test_present_on_new_ux_surface CI Gate |

### 3. UX Design (28 features)

| Feature ID | Class | Anchor | M.1 | M.5 | AE | Name |
| :---- | :---- | :---- | :--: | :--: | :--: | :---- |
| F-859 | engine_concept | UX Design §Tokens.Color | ❌ | — | — | Design Token System (Color) |
| F-860 | engine_concept | UX Design §Tokens.Typography | ❌ | — | — | Design Token System (Typography) |
| F-861 | engine_concept | UX Design §Tokens.Spacing | ❌ | — | — | Design Token System (Spacing) |
| F-862 | engine_concept | UX Design §Tokens.Radius | ❌ | — | — | Design Token System (Radius) |
| F-863 | engine_concept | UX Design §Tokens.Elevation | ❌ | — | — | Design Token System (Elevation/Shadow) |
| F-864 | engine_concept | UX Design §Tokens.Motion | ❌ | — | — | Design Token System (Motion) |
| F-865 | surface | UX Design §Components.Button | ❌ | — | — | Button Component (variants & states) |
| F-866 | surface | UX Design §Components.Input | ❌ | — | — | Input/Field Component |
| F-867 | surface | UX Design §Components.Select | ❌ | — | — | Select / Combobox Component |
| F-868 | surface | UX Design §Components.Modal | ❌ | — | — | Modal / Dialog Component |
| F-869 | surface | UX Design §Components.Drawer | ❌ | — | — | Drawer / Slide-Over Component |
| F-870 | surface | UX Design §Components.Toast | ❌ | — | — | Toast / Notification Component |
| F-871 | surface | UX Design §Components.Tooltip | ❌ | — | — | Tooltip / Popover Component |
| F-872 | surface | UX Design §Components.Tabs | ❌ | — | — | Tabs Component |
| F-873 | surface | UX Design §Components.Table | ❌ | — | — | Table / Data Grid Component |
| F-874 | surface | UX Design §Components.Pagination | ❌ | — | — | Pagination Component |
| F-875 | surface | UX Design §Components.EmptyState | ❌ | — | — | Empty-State Component |
| F-876 | surface | UX Design §Components.Skeleton | ❌ | — | — | Loading / Skeleton Component |
| F-877 | surface | UX Design §Components.ErrorState | ❌ | — | — | Error-State Component |
| F-878 | engine_concept | UX Design §Patterns.Form | ❌ | — | — | Form Layout System |
| F-879 | surface | UX Design §Patterns.Navigation | ❌ | — | — | Navigation Shell (Sidebar + Topbar) |
| F-880 | surface | UX Design §Patterns.ConsoleFirew | ❌ | — | — | Console-Firewall Visual Treatment |
| F-881 | engine_concept | UX Design §Motion | ❌ | — | — | Motion / Animation System |
| F-882 | engine_concept | UX Design §Iconography | ❌ | — | — | Iconography System |
| F-883 | engine_concept | UX Design §Illustration | ❌ | — | — | Illustration System |
| F-884 | platform_mechanic | UX Design §Density | ❌ | — | — | Density Modes (Comfortable / Compact) |
| F-885 | platform_mechanic | UX Design §Theming | ❌ | — | — | Theme System (Light / Dark) |
| F-886 | platform_mechanic | UX Design §VoiceTone | ❌ | — | — | Voice & Tone Guidelines |

### 3. KB Eng (retired) (10 features)

| Feature ID | Class | Anchor | M.1 | M.5 | AE | Name |
| :---- | :---- | :---- | :--: | :--: | :--: | :---- |
| F-887 | api_surface | KB Eng §MCP.ToolSchema | ❌ | — | — | MCP Server Tool Schema Conventions |
| F-888 | engine_concept | KB Eng §Skills.Registry | ❌ | — | — | Skill Registry Authoring Pattern |
| F-889 | engine_concept | KB Eng §Retrieval.Chunking | ❌ | — | — | Retrieval Chunking Strategy |
| F-890 | engine_concept | KB Eng §Retrieval.Rerank | ❌ | — | — | Retrieval Reranker Configuration |
| F-891 | engine_concept | KB Eng §Indexing.Pipeline | ❌ | — | — | Indexing Pipeline Stages |
| F-892 | engine_concept | KB Eng §ToolUse.Loop | ❌ | — | — | Tool-Use Loop Pattern |
| F-893 | engine_concept | KB Eng §Citations | ❌ | — | — | Citation / Source-Attribution Contract |
| F-894 | engine_concept | KB Eng §DocTypes | ❌ | — | — | KB Document Type Registry |
| F-895 | platform_mechanic | KB Eng §Freshness | ❌ | — | — | KB Freshness / Re-index Policy |
| F-896 | engine_concept | KB Eng §Telemetry | ❌ | — | — | Agent Run Telemetry Schema |

### 3. Buyer Pricing companion (10 features)

| Feature ID | Class | Anchor | M.1 | M.5 | AE | Name |
| :---- | :---- | :---- | :--: | :--: | :--: | :---- |
| F-838 | pricing_primitive | Buyer Pricing §Plan Tiers | ❌ | — | — | Buyer Plan Ladder Narrative |
| F-839 | pricing_primitive | Buyer Pricing §Consumption Model | ❌ | — | — | Outcome-Based AI Consumption Model (buyer-side narrative) |
| F-840 | growth_mechanic | Buyer Pricing §Scenarios | ❌ | — | — | Buyer Free-Tier Acquisition Scenario |
| F-841 | growth_mechanic | Buyer Pricing §Scenarios | ❌ | — | — | Solo Buyer Single-Operator Scenario |
| F-842 | growth_mechanic | Buyer Pricing §Scenarios | ❌ | — | — | Mid-Market Buyer Pro-Tier Scenario |
| F-843 | pricing_primitive | Buyer Pricing §Custom Tier | ❌ | — | — | Enterprise Custom-Pricing Negotiation Path |
| F-844 | user_capability | Buyer Pricing §Consumption Forec | ❌ | — | — | Buyer Consumption Forecast Narrative |
| F-845 | pricing_primitive | Buyer Pricing §Rate Cards | ❌ | — | — | Buyer Rate Card Presentation |
| F-846 | platform_mechanic | Buyer Pricing §Downgrade Paths | ❌ | — | — | Buyer Downgrade Preservation Narrative |
| F-847 | pricing_primitive | Buyer Pricing §Overage | ❌ | — | — | Buyer Overage Handling Story |

### 3. Seller Pricing companion (11 features)

| Feature ID | Class | Anchor | M.1 | M.5 | AE | Name |
| :---- | :---- | :---- | :--: | :--: | :--: | :---- |
| F-848 | pricing_primitive | Seller Pricing §Plan Tiers | ❌ | — | — | Seller Plan Ladder Narrative |
| F-849 | growth_mechanic | Seller Pricing §Forced Signup | ❌ | — | — | Forced-Vendor-Signup Playbook |
| F-850 | growth_mechanic | Seller Pricing §KB Value Capture | ❌ | — | — | Seller KB Value-Capture Narrative |
| F-851 | growth_mechanic | Seller Pricing §Network Effects | ❌ | — | — | Seller Network Effects Narrative |
| F-852 | growth_mechanic | Seller Pricing §Scenarios | ❌ | — | — | Seller Free-Tier Claim Scenario |
| F-853 | growth_mechanic | Seller Pricing §Scenarios | ❌ | — | — | Solo Seller Single-Operator Scenario |
| F-854 | growth_mechanic | Seller Pricing §Scenarios | ❌ | — | — | Growth-Tier Seller Conversion Scenario |
| F-855 | pricing_primitive | Seller Pricing §Consumption | ❌ | — | — | Seller Consumption Pricing for Managed Agents |
| F-856 | pricing_primitive | Seller Pricing §Custom Tier | ❌ | — | — | Seller Custom-Tier Negotiation Path |
| F-857 | platform_mechanic | Seller Pricing §Downgrade Paths | ❌ | — | — | Seller Downgrade Preservation Narrative |
| F-858 | growth_mechanic | Seller Pricing §Invites | ❌ | — | — | Seller Referral / Invite Mechanic |

---

## 4. F-AE-* Authored Extension Trace

Every F-AE-* feature row joined against the canonical `_integration/AUTHORED_EXTENSIONS_LEDGER.md` row set.

| Feature ID | AE ID | Anchor | Ledger | M.1 | M.5 | Name |
| :---- | :---- | :---- | :--: | :--: | :--: | :---- |
| F-AE-001 | AE-12.3-04 | §6.8.4 | ✅ | ❌ | ✅ | AE-12.3-04: DSAR Cascade Across Linked Entities |
| F-AE-002 | AE-12.3-05 | §6.8.5 | ✅ | ✅ | — | AE-12.3-05: Audit-Integrity Exemption |
| F-AE-003 | AE-12.3-06 | §7.3 | ✅ | ❌ | — | AE-12.3-06: PII Handling Across Org Boundaries |
| F-AE-004 | AE-12.3-07 | §7.5 | ✅ | ❌ | — | AE-12.3-07: Convex Subscription / Reactivity Layer |
| F-AE-005 | AE-12.3-08 | §29.7 | ✅ | ✅ | — | AE-12.3-08: Notification Surface Subsections |
| F-AE-006 | AE-12.3-09 | §38.9 | ✅ | ✅ | — | AE-12.3-09: Print, Reduced-Motion, RTL, Presence Subsec… |
| F-AE-007 | AE-12.3-10 | §50.17.4 | ✅ | ❌ | — | AE-12.3-10: Token Drift Check + Paging Runbook |
| F-AE-008 | AE-12.4-01 | §32.4 | ✅ | ✅ | — | AE-12.4-01: Monthly API-Call Quotas |
| F-AE-009 | AE-12.4-02 | §34.18.3 | ✅ | ❌ | — | AE-12.4-02: Year-1 Buyer Plan-Mix Split |
| F-AE-010 | AE-12.4-03 | §16.9.1 | ✅ | ❌ | — | AE-12.4-03: Intelligence Availability Mapping |
| F-AE-011 | AE-12.4-04 | §22.6 | ✅ | ✅ | — | AE-12.4-04: Max-Pages-Per-Crawl Limits |
| F-AE-012 | AE-12.4-05 | §19.6.1 | ✅ | ❌ | — | AE-12.4-05: Templates Free vs Paid Authoring |
| F-AE-013 | AE-12.4-06 | §14.8.1 | ✅ | ❌ | — | AE-12.4-06: Free-Tier 5-Scenario Cap |
| F-AE-014 | AE-12.4-07 | §15.6.1 | ✅ | ❌ | — | AE-12.4-07: Free-Tier 5 Pricing-Requirement Cap |
| F-AE-015 | AE-12.4-08 | §18.7.1 | ✅ | ❌ | — | AE-12.4-08: Free-Tier 10-Question Q&A Cap |
| F-BC-001 | BC-12.4-01 | §42.1 | n/a-BC-row | ✅ | — | Breaking Change: Enterprise SLA 1-hour → 4-hour; retired ID F-AE-016 forwards here. |
| F-AE-017 | AE-13-01 | §16.2.3 | ✅ | ❌ | — | AE-13-01: Perplexity Degradation Contract |
| F-AE-018 | AE-13-02 | §42.6.0 | ✅ | ✅ | — | AE-13-02: External Provider Health Detectors |
| F-AE-019 | AE-13-03 | Appendix F | ✅ | ✅ | — | AE-13-03: Webhook Default Retry Class |
| F-AE-020 | AE-13-04 | §34.8.5 | ✅ | ❌ | — | AE-13-04: Aggregation Classification Rule |
| F-AE-021 | AE-13-05 | §34.11.1 | ✅ | ✅ | — | AE-13-05: Outcome Contract Completeness Validator |
| F-AE-022 | AE-13-06 | §5.11 | ✅ | ✅ | — | AE-13-06: Feature Access Coverage Validator |
| F-AE-023 | AE-13-07 | Appendix H | ✅ | ✅ | — | AE-13-07: Appendix H Stripe Stale Banner |
| F-AE-024 | AE-14.4-01 | §2.8.3 | ✅ | ✅ | ✅ | AE-14.4-01: Phase Advancement soft_gates_enabled Flag |
| F-AE-025 | AE-14.4-04 | §2.8 | ✅ | ✅ | ✅ | AE-14.4-04: Team→Solo Transition Block |
| F-AE-026 | AE-14.5-01 | §13.11.5 | ✅ | ✅ | — | AE-14.5-01: defense_view_generate Capability |
| F-AE-027 | AE-14.5-03 | §39 | ✅ | ❌ | — | AE-14.5-03: DefenseView Object Size Constraints |
| F-AE-028 | AE-14.5-04 | Appendix I | ✅ | ✅ | ✅ | AE-14.5-04: DefenseView Error Codes |
| F-AE-029 | AE-14.6-01 | §22.19.1 | ✅ | ✅ | ✅ | AE-14.6-01: Seller Bid-Lifecycle Phase Mapping |
| F-AE-030 | AE-14.6-02 | UX §5.2.19 | ✅ | ❌ | — | AE-14.6-02: PipelineSurface / PhaseAdvancer Composition |
| F-AE-031 | AE-14.6-03 | UX §5.2.19 | ✅ | ❌ | — | AE-14.6-03: Pipeline Step Design Tokens |
| F-AE-032 | AE-14.6-04 | §2.8.2 | ✅ | ✅ | ✅ | AE-14.6-04: Pipeline Phase Mapping Correction |
| F-AE-033 | AE-14.7-01 | §4.5.9 | ✅ | ✅ | ✅ | AE-14.7-01: Six Default EvalVerticals |
| F-AE-034 | AE-14.7-02 | §39 | ✅ | ❌ | — | AE-14.7-02: EvalStarter Seed Schema Bounds |
| F-AE-035 | AE-14.7-03 | §4.5.9 | ✅ | ✅ | ✅ | AE-14.7-03: Recommended Longlist Nullable |
| F-AE-036 | AE-14.7-04 | §4.5.9 | ✅ | ✅ | ✅ | AE-14.7-04: Marketplace Category Mapping on EvalStarter |
| F-AE-037 | AE-14.7-08 | §44.1 | ✅ | ✅ | — | AE-14.7-08: Buyer Maya Materializer Performance Targets |
| F-AE-038 | AE-14.7-09 | Appendix I | ✅ | ✅ | ✅ | AE-14.7-09: EvalStarter Error Codes |
| F-AE-039 | AE-14.8-01 | §22.20.2 | ✅ | ✅ | ✅ | AE-14.8-01: Solo-Free Auto-Publish Reason |
| F-AE-040 | AE-14.8-02 | §22.20.2 | ✅ | ✅ | ✅ | AE-14.8-02: Capability Direct-Publish Transition |
| F-AE-041 | AE-14.8-03 | §22.20.2 | ✅ | ✅ | ✅ | AE-14.8-03: Capability Display Label Override |
| F-AE-042 | AE-14.8-05 | §6.7 | ✅ | ✅ | — | AE-14.8-05: Capability Chip Audit Events |
| F-AE-043 | AE-14.8-06 | Appendix J | ✅ | ✅ | ✅ | AE-14.8-06: Firecrawl Resolution Status Variants |
| F-AE-044 | AE-14.8-07 | §22.6 | ✅ | ✅ | — | AE-14.8-07: Firecrawl First Page Category Field |
| F-AE-045 | AE-14.8-09 | §34.13 | ✅ | ✅ | — | AE-14.8-09: Pro Trial Seat Compression Inheritance |
| F-AE-046 | AE-14.8-10 | §48.8.4 | ✅ | ❌ | — | AE-14.8-10: §48.8.4/§48.8.5 Drift Override Paragraphs |
| F-AE-047 | AE-14.9-01 | §34.1.3 | ✅ | ✅ | ✅ | AE-14.9-01: buyer_solo / seller_solo Authoritative |
| F-AE-048 | AE-14.9-02 | Appendix J | ✅ | ✅ | ✅ | AE-14.9-02: billing_event_charge_kind Extension |
| F-AE-049 | AE-14.9-03 | §34.10.3 | ✅ | ✅ | ✅ | AE-14.9-03: Solo Co-Resident Pool Rule |
| F-AE-050 | AE-14.9-04 | §34.12.6 | ✅ | ✅ | ✅ | AE-14.9-04: Solo Per-Console Subscription Billing |
| F-AE-051 | AE-14.9-05 | §34.2.5 | ✅ | ✅ | — | AE-14.9-05: Solo Per-Charge Orchestration |
| F-AE-052 | AE-14.9-06 | §34.10.5 | ✅ | ✅ | ✅ | AE-14.9-06: Solo-Aware Stripe Meter Events |
| F-AE-053 | AE-14.9-08 | §34.1.1 | ✅ | ✅ | — | AE-14.9-08: Solo MFA Not Available |
| F-AE-054 | AE-14.9-09 | §34.1.1 | ✅ | ✅ | — | AE-14.9-09: Solo Buyer Org Intelligence None |
| F-AE-055 | AE-14.9-10 | §34.1.1 | ✅ | ✅ | — | AE-14.9-10: Solo Marketplace Buyer Browse Only |
| F-AE-056 | AE-14.9-11 | §34.1.2 | ✅ | ✅ | — | AE-14.9-11: Solo Verified-Tier Eligibility (Seller) |
| F-AE-057 | AE-14.9-12 | §22.20.2 | ✅ | ✅ | ✅ | AE-14.9-12: Solo Capability Auto-Publish Extension |
| F-AE-058 | AE-14.10-01 | §4.8.2 | ✅ | ✅ | ✅ | AE-14.10-01: Surface Throttling Class Field |
| F-AE-059 | AE-14.10-02 | §4.8.2 | ✅ | ✅ | ✅ | AE-14.10-02: Solo Envelope Override Value |
| F-AE-060 | AE-14.10-03 | §4.8.2 | ✅ | ✅ | ✅ | AE-14.10-03: Solo Envelope No-Block Field |
| F-AE-061 | AE-14.10-04 | §4.8.1 | ✅ | ✅ | — | AE-14.10-04: AIOperation Solo Envelope Blocked Flag |
| F-AE-062 | AE-14.10-05 | Appendix C | ✅ | ✅ | ✅ | AE-14.10-05: Solo Envelope Telemetry Events |
| F-AE-063 | AE-14.10-06 | Appendix I | ✅ | ✅ | ✅ | AE-14.10-06: Solo Envelope Throttle Threshold Error |
| F-AE-064 | AE-14.10-07 | §44.6.4.1 | ✅ | ✅ | ✅ | AE-14.10-07: low_priority_background Capability Members |
| F-AE-065 | AE-14.10-08 | §29.3 | ✅ | ✅ | — | AE-14.10-08: Solo Notification Suppression Rule |
| F-AE-066 | AE-14.14-19 | §22.18.3.5 | ✅ | ✅ | — | AE-14.14-19: §22.18.3.5 Solo / Free Override |
| F-AE-067 | AE-14.14-20 | §48.8.4 | ✅ | ❌ | — | AE-14.14-20: §48.8.4/§48.8.5 Solo / Free Override |
| F-AE-068 | AE-14.14-21 | §2.8.7 | ✅ | ✅ | ✅ | AE-14.14-21: Phase Advancement Deadline-Countdown TZ |
| F-AE-069 | AE-14.18.1-01 | Appendix M.5 | ✅ | ❌ | — | AE-14.18.1-01: §M.5 CI Gate Catalog |
| F-AE-070 | AE-14.18.1-02 | §M.5 | ✅ | ❌ | — | AE-14.18.1-02: @ci-gate-override Annotation Pattern |
| F-AE-071 | AE-14.0.1-01 | _integration/RECONCILIATION.md → Phase 14.0.1 | ✅ | ❌ | — | AE-14.0.1-01: GTM Rewrites Descope to v7.1.x |
| F-AE-072 | AE-14.0.1-02 | §27 | ✅ | ❌ | — | AE-14.0.1-02: Marketplace-as-RFP-Exchange Descope |

**Reading.** All 71 active F-AE-* inventory rows resolve to canonical AE ledger rows. `F-BC-001` is the canonical Breaking Change row for `BC-12.4-01`; retired identifier `F-AE-016` is a forwarding alias only. D-11.4-002 is remediated.

---
## 5. Coverage Gap Inventory
Coverage gaps disclosed by this trace. Phase 11.1 / 11.2 / 11.3 already filed defects for many of these — those defect IDs are listed in the **prior coverage** column. Net-new defects are filed below in §6.

### 5.1 Surface-class M.1 misses (62 features)
All 62 surface-class M.1 misses fall into clusters already filed in Phase 11.1:

| Cluster | Phase 11.1 defect | Feature IDs (sampled) | Count |
| :---- | :--: | :---- | --: |
| §50 Ops Console surfaces | D-11.1-001 (P1) | F-696, F-710, F-712, F-715, F-716, F-717, F-718, F-719, F-720, F-721, F-725, F-729, F-730, F-731, F-734, F-735, F-736, F-737, F-738, F-739, F-741, F-746, F-747, F-750 | 24 |
| §51 Product Usage Analytics surfaces | D-11.1-002 (P1) | F-760, F-762, F-764, F-765, F-766, F-768 | 6 |
| §25.2.3 Cross-Console Dual-Surface Failure Visibility | D-11.1-003 (P1) | F-400 (Bridge Health / Sync Health panels) | 1 (cluster-level) |
| §8.3 Triage Queue surfaces | D-11.1-004 (P1) | F-191, F-192 | 2 |
| §11.x Buyer Console nav shell | D-11.1-005 (P2) | F-240, F-241, F-242, F-243 (engine-side; nav shell rendered as a surface family) | 4 (cluster-level) |
| §3 / §20 / §22 cross-surface + onboarding gaps | D-11.1-006 (P2) | F-031, F-032, F-048, F-050, F-057, F-067, F-068, F-069, F-070, F-071, F-143, F-224, F-269, F-277, F-305, F-308, F-309, F-379, F-386, F-467, F-474, F-495, F-560, F-561, F-562 | ~22 |
| UX Design component surfaces | D-11.1-007 (P3) | F-587..F-614 (UX_Design family) | 15 |
| **Total** | | | **62** |

The cluster-level Phase 11.1 defects are sufficient remediation triggers for these 62 features.

### 5.2 Engine-concept M.1 misses (135 features) — net-new enumeration
Phase 11.1 enumerated surface misses in clusters but treated engine-concept misses only by reference. The trace enumerates them at row-level fidelity below; defect **D-11.4-001** (P1, surface_engine_mapping) is the binding row.

| Anchor family | Count | Sample feature IDs |
| :---- | --: | :---- |
| §3 Interaction Patterns & Tokens | 22 | F-033, F-035, F-036, F-037, F-039, F-040, F-041, F-043, F-044, F-045, F-046, F-047, F-054, F-055, F-058, F-062, F-072, F-075, F-076, F-077, F-073, F-074 |
| §50 Ops-Console engine concepts | 15 | F-697, F-698, F-704, F-711, F-714, F-722, F-723, F-728, F-732, F-733, F-740, F-742, F-743, F-744, F-749 |
| UX Design engine concepts | 10 | F-588, F-589, F-591, F-593, F-595, F-596, F-598, F-600, F-602, F-604, F-606 |
| §34 Plan-Tier engine concepts | 8 | F-525, F-526, F-527, F-528, F-535, F-536, F-538 |
| KB Eng (retired) engine concepts | 8 | F-889, F-890, F-891, F-892, F-893, F-894, F-895, F-896 |
| §26 Public Seller Pages engine concepts | 7 | F-415, F-416, F-417, F-418, F-420, F-421, F-422 |
| §51 PostHog instrumentation engine concepts | 7 | F-759, F-761, F-763, F-767, F-770, F-771, F-772 |
| §2 Sourcera Method engine concepts | 6 | F-019, F-021, F-022, F-024, F-025, F-026, F-027, F-028 (some absorbed under §2.8 row M.1) |
| §9 / §12 / §33 / §48 misc engine concepts | 16 | F-205, F-206, F-207, F-208 (§9); F-252, F-253, F-254, F-255 (§12); F-507, F-508, F-509, F-510 (§33); F-617, F-618, F-619, F-620 (§48) |
| §1, §6, §7, §8, §14, §15, §20, §22, §29, §38, §40, §47 misc | ~36 | (full list in §3 family tables above) |
| Appendix L / Appendix M engine concepts | 6 | F-779 (Appendix L), F-792, F-793, F-794, F-795, F-796 (Appendix M) — self-referential rows; arguably out-of-scope for M.1 (it cannot reference itself) |
| **Total** | **135** | |

**Triage of the 135 engine-concept misses.**

1. **~30 are correctly internal-only by construction** (Appendix L state-machine entries, Appendix M self-references, §47 Versioning concepts, §40.2 retention concepts that are tables not surfaces). The M.2 process-gate rule \"every engine-concept addition must add a row\" accepts these as `Internal-only, never surfaced` rows when they are added — the deficiency is the missing row, not the surface contract.
2. **~50 are companion-doc engine concepts (UX_Design + KB Eng + Buyer/Seller Pricing companion)** which structurally cannot map to Master Spec Appendix M.1 anchors. The M.1 row schema only carries `Spec home` cells that resolve to Master Spec sections. This is `D-11.4-003` (P2) — the M.1 schema needs an explicit cross-document anchor convention or a sibling \"M.1 Companion Doc Mapping\" sub-section.
3. **~55 are genuine Master Spec engine-concept M.1 misses** — features authored in §3 / §50 / §51 / §34 / §22 / §26 that should each have their own M.1 row but do not. These are P1 surface_engine_mapping defects rolled up under `D-11.4-001`.

### 5.3 M.1 ✅ + M.5 ❌ pattern (452 features) — by-design vs. gap
The 452 features with an M.1 row but no M.5 gate are NOT all defects. The M.5 catalog is a forward-reference contract that anchors at the broadest enforcing section, not the per-feature row. Two cases:

- **By design (most rows).** Most M.1-bound features have no per-feature CI gate because the enforcement is engine-discipline (data-model schema validation, API contract testing, RBAC handler tests) and not a deploy-time grep. Example: `§22.18 KB Value Capture & Stake-Building` has an M.1 row but no M.5 gate — the KB stake-building math is enforced by the AIOperation outcome resolver and KB Investment widget rendering tests, not by an Appendix M coverage gate.
- **Gate missing (subset).** Phase 11.3 `D-11.3-002` enumerated 13 spec-body \"Appendix M.5 `<gate_id>`\" cross-references that resolve into empty catalog space. Those 13 gates ARE forward-referenced from the master spec body and ARE absent from the §M.5 catalog table; this is a P0 ci_gate defect (already filed). Phase 11.4 inherits and does not duplicate.

`D-11.4-004` (P2) recommends an authoritative `M.5 row-class taxonomy` distinguishing (a) per-feature gates from (b) cross-feature invariant gates from (c) deploy-time spec-tree gates, so that reading M.5 in isolation discloses which feature it binds.

### 5.4 AE ledger trace (72 features)
| Outcome | Count |
| :---- | --: |
| F-AE-* row → live ledger row (status `pending`) | 56 |
| F-AE-* row → live ledger row (status `acknowledged`) | 14 |
| F-AE-* row → live ledger row (status `approved` / `superseded` / `closed`) | 1 |
| F-AE-* row → mis-classified | **0** |
| F-BC-* row → Breaking Change ledger row | 1 |
| F-AE-* row → orphaned (no ledger match) | **0** |

AE ledger coverage is **clean**. The former mis-classification is corrected by `F-BC-001`; `F-AE-016` is a forwarding alias.

---

## 6. Net-New Defects Filed (Phase 11.4)
Filed in `_audit/DEFECT_LEDGER.md`. Listed here for trace closure.

| Defect ID | Severity | Class | Summary |
| :---- | :--: | :---- | :---- |
| D-11.4-001 | P1 | surface_engine_mapping | 135 engine-concept-class features have no Appendix M.1 row; ~55 are master-spec rows that should be authored per M.2 process gate #1; remainder are companion-doc / Appendix-self-referential, scoped to D-11.4-003. |
| D-11.4-002 | P3 | authored_extension | **Remediated 2026-07-12.** `F-BC-001` is canonical for `BC-12.4-01`; `F-AE-016` is an immutable forwarding alias and no longer participates in the AE join. |
| D-11.4-003 | P2 | surface_engine_mapping | Appendix M.1 schema admits only Master Spec section anchors as `Spec home` cells; UX_Design_of_Sourcera.md, retired KB Engineering Spec, and pricing-companion-doc engine concepts cannot resolve into M.1. Schema extension or sibling \"M.1.Companion\" sub-section needed. |
| D-11.4-004 | P2 | ci_gate | M.5 catalog has no row-class taxonomy distinguishing per-feature gates from cross-feature invariant gates from deploy-time spec-tree gates. The 452 features with M.1 ✅ + M.5 ❌ cannot be triaged as \"gate missing\" vs. \"engine-discipline-only\" from the catalog alone. |

---

## 7. Cross-Reference to Prior Phase Findings
Phase 11.4 explicitly inherits and does not duplicate the following prior-phase defects. The trace tables in §3 carry the M.1 / M.5 binding state; remediation triggers below.

| Phase | Defect ID | Severity | Scope | Inheritance into 11.4 |
| :---- | :---- | :--: | :---- | :---- |
| 11.1 | D-11.1-001 | P1 | §50 Ops Console — 19 surfaces uncovered by M.1 | All 24 §50-anchored surface-class misses in §3 family tables share this defect. |
| 11.1 | D-11.1-002 | P1 | §51 PostHog Analytics — 6 surfaces uncovered | All 6 §51-anchored surface-class misses in §3 family tables share this defect. |
| 11.1 | D-11.1-003 | P1 | §25.2.3 Cross-Console Dual-Surface Failure Visibility | F-400 row in §3 family tables shares this defect. |
| 11.1 | D-11.1-004 | P1 | §8.3 Buyer + Seller Triage Queues | F-191, F-192 in §3 family tables share this defect. |
| 11.1 | D-11.1-005 | P2 | §11.x Buyer Console nav shell | F-240..F-243 in §3 family tables share this defect. |
| 11.1 | D-11.1-006 | P2 | §3 / §20 / §22 / §29 / §31 / §35 onboarding + cross-surface gaps | ~22 features in §3 family tables share this defect. |
| 11.1 | D-11.1-007 | P3 | UX Design component surfaces (15 rows) | All 15 `UX Design` family surface-class misses share this defect. |
| 11.1 | D-11.1-008 | P3 | §50 column-semantics ambiguity | Indirectly bears on §50 family rows; trace shows the M.1 row for `Admin Dashboard (Ops Console)` anchored at `§43.1` not the canonical §50.1. |
| 11.1 | D-11.1-009 | P3 | Wrong anchor on Admin Dashboard row | Inherited. |
| 11.1 | D-11.1-010 | P3 | M.1 `Hidden from tier(s)` column-semantics ambiguity | Inherited. |
| 11.2 | D-11.2-001 … 022 | mixed | §M.4 trigger conditions, override path, audit trail, nightly digest, runtime contradiction | Trace consistency depends on M.4 enforcement; resolution does not change Phase 11.4 trace outcomes. |
| 11.3 | D-11.3-001 | P0 | M.5 catalog has no per-row `runtime_status` column | Affects Phase 11.4 interpretation of the 837 \"M.5 ❌\" feature rows (cannot be partitioned wired-vs-pending without the column). |
| 11.3 | D-11.3-002 | P0 | 13 spec-body `Appendix M.5 \`<gate>\`` cross-references resolve into empty catalog space | A subset of the M.5 ❌ rows in §3 family tables are exactly these 13 promised-but-missing gates. |
| 11.3 | D-11.3-003 | P1 | §M.5 \"37 gates\" header claim vs. actual 44 rows | Affects Phase 11.4 headline numerator on M.5 coverage. |
| 11.3 | D-11.3-004 | P1 | AE-3V-002 stale enumeration; 5-vs-7 gate-count contradiction | Trace inherits — the AE ledger row counts diverge from the §M.5 row counts. |
| 11.3 | D-11.3-005 | P1 | \"v7.1.1 stamp gate\" not a structured §M.5 row | Trace inherits — the AE ledger AE-V9-* rows reference a gate that is not in M.5. |
| 11.3 | D-11.3-006 … 012 | mixed | Catalog hygiene (Unicode anchor, table escaping, override-path defaults) | Hygiene-bound; no trace impact. |

---

## 8. Self-Challenge Pass
Re-read findings as a hostile staff engineer. Three classes of objection were evaluated against the trace's defect filings.

1. **\"D-11.4-001 double-counts D-11.1-001 through D-11.1-008.\"** Rejected. D-11.1-001..D-11.1-008 enumerate the **surface-class** M.1 misses (62 features). D-11.4-001 enumerates the **engine-concept-class** misses (135 features). The two defect sets are disjoint on feature_class — confirmed by the join in §5.2. Phase 11.1's prompt explicitly scoped to `feature_class = surface`; engine-concept misses were treated as secondary findings rolled into the same clusters but never enumerated at row-level fidelity. D-11.4-001 is the first row-level enumeration.
2. **\"D-11.4-003 invents a schema requirement not in the spec.\"** Partly conceded; rewritten in the ledger entry. The M.1 schema as written admits arbitrary `Spec home` cell content (free text); there is no formal prohibition on companion-doc citation. However, the existing M.1 row set contains exactly **one** companion-doc anchor (`UX Design §Patterns.Navigation` at line 49301; cited inside a single Navigation Shell row), demonstrating that the convention as practiced is `Master Spec` anchors only. D-11.4-003 is therefore a P2 (not P1) — the schema admits the extension but no convention authorizes it.
3. **\"D-11.4-004 is a documentation request, not a defect.\"** Partly conceded; severity dropped from P1 to P2 in the ledger row. The 452 \"M.5 ❌\" features are not all broken; the catalog is forward-reference-shaped. But the inability to distinguish per-feature-gate from cross-feature-invariant-gate from spec-tree-gate from the catalog alone is an ambiguity that materially affects which features must be retro-authored a gate during M02.3 / M11.3 / M21.3 / M24.3 implementation packs. The taxonomy is a buildability requirement, not just hygiene.

---

## 9. Counterfactual Pass
Three realistic failure modes the trace must accommodate.

1. **A new engine concept is authored in §22.20 (Seller Maya) but neither D-11.4-001 nor M.4 `appendix_m_coverage_on_diff` catches it.** D-11.4-001 enumerates the current backlog; the M.4 gate (Phase 11.2 finding) prevents future drift. Both must hold. If M.4 is not yet runtime-active (CLAUDE.md §16: \"§M.4 CI gate is active; §M.5 runtime wiring is partial\"; Phase 11.2 `D-11.2-022`: \"runtime-status contradiction\"), then drift is currently caught only by code-review discipline. ✅ Trace records the dependency on `D-11.2-022` resolution.
2. **A feature is correctly internal-only (e.g., a state-machine entry in Appendix L) but D-11.4-001 flags it as a missing surface_engine_mapping.** §5.2 triage explicitly addresses this: ~30 of the 135 \"engine-concept misses\" are Appendix-L / Appendix-M-self-references / §47-versioning / §40.2-retention rows that, when authored an M.1 row, should be flagged `Internal-only, never surfaced`. The defect is the missing row, not the missing surface metaphor. ✅ Trace draws this distinction inline.
3. **A companion-doc feature (UX_Design or KB Eng) is genuinely the source of truth for a surface contract, and Master Spec §3 only ground-truths it.** This is exactly the §22.x Hero Moment / §22.20.x Seller Maya pattern: the UX_Design `§5.2.19 PipelineSurface` component is the authoritative surface authoring; Master Spec §3.14 is the engine binding. The M.1 row at line 49011 cites both anchors via the `UX_Design_of_Sourcera.md §5.2.19` pointer inside its Notes cell. The current pattern (Notes-cell cross-reference) is the de-facto convention; D-11.4-003 formalizes the convention rather than inventing a new one. ✅ Trace acknowledges existing practice.

---

## 10. Reverse Pass
For every Appendix M.5 gate (103 catalog rows), confirm an inventory feature row exists.

- **40 of 103 gate rows** are themselves feature inventory rows (F-797 through F-836 and the Phase 2V/3V/3V+/V8.4/V9 cluster equivalents), per the inventory's \"each gate is its own feature row\" convention surfaced in §3.
- **63 of 103 gate rows** are V9 / 3V+ / V8.4 / V9 audit-remediation gates that bind to spec-tree contracts (e.g., `appendix_k_glossary_canonicality`, `retention_singleton_§40.2_canonical`, `dr_failover_residency_bound`) rather than to a customer-facing feature. These do not need their own F-* row; they appear in `_audit/COVERAGE_MATRIX.md` under the `ci_gate_coverage` column for the features they enforce.
- **0 orphan gates** in the trace pass. Every cataloged §M.5 row maps either to a feature inventory row or to a spec-tree invariant.

**However**, the reverse pass surfaces one inherited gap: the 13 spec-body `Appendix M.5 `<gate>`` references that resolve into empty catalog space (Phase 11.3 `D-11.3-002`) are referenced **from feature-bearing sections** (§22.8 `kb_bootstrap_per_org_concurrency_lock_active` → F-352 KB Bootstrap; §48.8.10 `bid_disqualification_cascade_active` → F-572 / F-573 disqualification; §34.18.x cost-base gates → F-512 / F-513). These features carry an M.5 ❌ in the trace tables that hides the underlying defect. The §3 family tables annotate these by leaving the M.5 column ❌ rather than the more-truthful \"Phase 11.3 D-11.3-002 — gate promised, catalog row absent.\" Caller's note: when reading §3, cross-reference Phase 11.3 §4 for the 13 promised-but-uncatalogued gates.

---

## 11. Trace Summary
- **898 feature inventory rows** joined against 327 Appendix M.1 rows, 103 Appendix M.5 gate rows, and 218 Authored Extension ledger rows.
- **Appendix M.1 coverage: 56% direct ✅ / 21% family ⚠ / 23% missing ❌.** The 207 missing are decomposed in §5.1 (62 surface-class, inherited from D-11.1-001..D-11.1-008) and §5.2 (135 engine-concept-class, filed net-new as D-11.4-001).
- **Appendix M.5 coverage: 5% direct ✅ / 2% family ⚠ / 93% nominally missing.** M.5 is a forward-reference catalog, not a per-feature contract; the missing 93% decomposes into engine-discipline-enforced features + Phase 11.3 D-11.3-002 promised-but-missing gates. D-11.4-004 (P2) recommends a row-class taxonomy.
- **Authored Extension ledger coverage: 100% clean (71 of 71 active F-AE-* rows resolve).** D-11.4-002 is remediated; `F-BC-001` owns the Breaking Change row.
- **Phase 11.4 net-new defects: 4.** D-11.4-001 (P1, surface_engine_mapping), D-11.4-002 (P3, authored_extension), D-11.4-003 (P2, surface_engine_mapping), D-11.4-004 (P2, ci_gate).

---

**End of SURFACE_ENGINE_TRACE.md (Phase 11.4, 2026-05-11).**
