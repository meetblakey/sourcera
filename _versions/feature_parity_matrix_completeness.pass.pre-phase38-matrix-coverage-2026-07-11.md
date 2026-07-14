### 38.8.2 Mobile Feature Parity Matrix {#38.8.2-mobile-feature-parity-matrix}

| Feature | Desktop | Tablet | Mobile | Notes |
| :---- | :---- | :---- | :---- | :---- |
| **Buyer Console — Navigation & Core Surfaces (§11)** | | | | |
| Workspace List | parity | parity | parity | |
| **Policy & Agent (§12, §21)** | | | | |
| Policy Ingestion — Upload | parity | parity | supported | Mobile upload supported. |
| **Scoring (§13)** | | | | |
| Defense View | parity | parity | supported | Mobile evidence bundle. |
| "What Are You Evaluating?" Intake | parity | parity | supported | Mobile stepper. |
| **Scenario Modeling (§14)** | | | | |
| Scenario Result Review | parity | parity | supported | Read-only summary. |
| **TCO (§15)** | | | | |
| TCO Results (read) | parity | parity | supported | Read-only table. |
| **Organizational Intelligence (§16)** | | | | |
| Intelligence Briefs (read) | parity | parity | parity | |
| **Analytics (§17)** | | | | |
| Workspace Analytics — Dashboard | parity | parity | supported | Chart reflow. |
| **Q&A Threads (§18, §24)** | | | | |
| Q&A Thread (read) | parity | parity | parity | |
| **Template Library (§19)** | | | | |
| Template Browse | parity | parity | parity | |
| **Inbox & Pulse (§20)** | | | | |
| Inbox — Read | parity | parity | parity | |
| **Seller Console — KB (§22)** | | | | |
| KB Browse | parity | parity | parity | |
| **Seller Console — Bid Workspace & Response (§23)** | | | | |
| Bid Workspace Dashboard | parity | parity | parity | |
| **Cross-Console Mechanics (§25)** | | | | |
| Console Switch (Buyer ↔ Seller) | parity | parity | parity | |
| **Marketplace & Discovery (§26, §27)** | | | | |
| Marketplace — Browse Listings | parity | parity | parity | |
| **Settings, Billing & Admin (§7, §34, §36)** | | | | |
| AI Wallet & Usage Billing | parity | parity | simplified | High-risk edits require desktop. |
| **Notifications (§31)** | | | | |
| In-App Notifications | parity | parity | parity | |
| **Integrations (§32)** | | | | |
| Integrations — View | parity | parity | parity | |
| **Accessibility & I18n (§37)** | | | | |
| Screen reader navigation | parity | parity | parity | |
| **Buyer Activation & Hero Moment (§35)** | | | | |
| Buyer Hero Moment — Activation Timeline | parity | parity | supported | Vertical timeline. |
| **PLG & Growth Mechanics (§48)** | | | | |
| M16 Buyer Referral (Send) | parity | parity | supported | |
| **Seller Onboarding & Hero Moment (§49)** | | | | |
| Seller Onboarding — Forced Signup / Bid Workspace Entry | parity | parity | supported | Mobile preserves invite context. |
| Seller Onboarding — KB Bootstrap Progress | parity | parity | supported | Truthful progress lines. |
| Seller Onboarding — Drafted Bid Review | parity | parity | simplified | Bulk accept deferred. |
| Seller Onboarding — Win/Loss Debrief | parity | parity | supported | Insight cards. |
| **Ops Console (§50)** | | | | |
| Ops Console — all surfaces | parity | simplified | not_supported | Mobile redirect. |
| **Product Usage Analytics (§51)** | | | | |
| Usage Analytics Read (Ops) | parity | simplified | not_supported | See Ops Console. |

| `feature_parity_matrix_completeness` | mobile_parity_consistency | **`runtime_active`** (promoted 2026-07-09; detector `tools/spec-lint/gates/feature_parity_matrix_completeness.ts`; verified PASS on live Master Spec and pass/fail fixtures; scope boundary: critical feature-section coverage manifest and §38.8.2 matrix duplicate detection only; product mobile E2E, visual regression, runtime tap-count probes, and release-branch enforcement remain product-pack evidence) | pr_lint | Every feature-introducing §11-§51 section MUST have exactly one §38.8.2 row with valid Appendix J `mobile_feature_parity_status`; missing, duplicate, or invalid rows block merge. | M02.3 |
