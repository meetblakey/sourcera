# Sourcera {#sourcera}

## Choose Correct. Move Faster.

# Table of Contents {#table-of-contents}

[Sourcera](#sourcera)

[Table of Contents](#table-of-contents)

[Introduction](#introduction)

[1\. Product Overview](#1.-product-overview)

[1.1 Sourcera Architecture](#1.1-sourcera-architecture)

[1.2 Core Value Proposition](#1.2-core-value-proposition)

[1.3 Dual-Console Data Isolation Model](#1.3-dual-console-data-isolation-model)

[1.4 Query Scoping Requirements](#1.4-query-scoping-requirements)

[1.5 Deployment & Technology Stack](#1.5-deployment-&-technology-stack)

[1.6 Deployment Regions](#1.6-deployment-regions)

[2\. The Sourcera Method](#2.-the-sourcera-method)

[2.1 Overview](#2.1-overview)

[2.2 Decomposition: Use Cases → Requirements](#2.2-decomposition:-use-cases-→-requirements)

[2.3 Scoring Calibration](#2.3-scoring-calibration)

[2.4 Vendor Shortlisting Strategy](#2.4-vendor-shortlisting-strategy)

[2.5 Evaluation Timeline Benchmarks](#2.5-evaluation-timeline-benchmarks)

[2.6 Cross-Departmental Alignment Patterns](#2.6-cross-departmental-alignment-patterns)

[2.7 Template Design Framework](#2.7-template-design-framework)

[3\. UX Standard — The Sourcera Constraint](#3.-ux-standard-—-the-sourcera-constraint)

[3.1 Philosophy](#3.1-philosophy)

[3.2 The 8 Core Interaction Patterns](#3.2-the-8-core-interaction-patterns)

[3.3 Pattern-to-Feature Mapping (Authoritative)](#3.3-pattern-to-feature-mapping-\(authoritative\))

[3.4 Mobile Translation of Linear Constraint](#3.4-mobile-translation-of-linear-constraint)

[3.5 Optimistic Mutation Rollback Behavior](#3.5-optimistic-mutation-rollback-behavior)

[4\. Global Data Model](#4.-global-data-model)

[4.1 Model Design Principles](#4.1-model-design-principles)

[4.2 Organization & Auth Entities](#4.2-organization-&-auth-entities)

[4.3 Buyer Console Entities](#4.3-buyer-console-entities)

[4.4 Seller Console Entities](#4.4-seller-console-entities)

[4.5 Marketplace Entities](#4.5-marketplace-entities)

[4.6 Audit & Logging Entities](#4.6-audit-&-logging-entities)

[5\. RBAC (Role-Based Access Control)](#5.-rbac-\(role-based-access-control\))

[5.1 RBAC Architecture](#5.1-rbac-architecture)

[5.2 Org-Level Roles](#5.2-org-level-roles)

[5.3 Console-Level Roles (Buyer Console)](#5.3-console-level-roles-\(buyer-console\))

[5.4 Guest Role & Permission Profiles (Gap S-2)](#5.4-guest-role-&-permission-profiles-\(gap-s-2\))

[5.5 Console-Level Roles (Seller Console)](#5.5-console-level-roles-\(seller-console\))

[5.6 Marketplace Roles](#5.6-marketplace-roles)

[5.7 Scoring Availability (Gap 4.2, Gap 4.3)](#5.7-scoring-availability-\(gap-4.2,-gap-4.3\))

[5.8 Policy Ingestion Availability (Gap 4.3)](#5.8-policy-ingestion-availability-\(gap-4.3\))

[5.9 Executive Sponsor (Gap S-7)](#5.9-executive-sponsor-\(gap-s-7\))

[5.10 Active Workspace Definition (Gap S-7)](#5.10-active-workspace-definition-\(gap-s-7\))

[5.11 Feature Access Matrix (Comprehensive)](#5.11-feature-access-matrix-\(comprehensive\))

[5.12 Access Control Enforcement](#5.12-access-control-enforcement)

[6\. User Identity & Security](#6.-user-identity-&-security)

[6.1 Authentication Architecture](#6.1-authentication-architecture)

[6.2 Multi-Factor Authentication (MFA)](#6.2-multi-factor-authentication-\(mfa\))

[6.3 Session Management](#6.3-session-management)

[6.4 Domain Governance](#6.4-domain-governance)

[6.5 Guest Users & SSO Bypass](#6.5-guest-users-&-sso-bypass)

[6.6 API Token Authentication](#6.6-api-token-authentication)

[6.7 Audit Logging](#6.7-audit-logging)

[6.8 Data Privacy & GDPR Compliance](#6.8-data-privacy-&-gdpr-compliance)

[7\. Organization & Administration](#7.-organization-&-administration)

[7.1 Organization Lifecycle](#7.1-organization-lifecycle)

[8\. Teams & Governance](#8.-teams-&-governance)

[8.1 Team Architecture](#8.1-team-architecture)

[8.2 Team Deletion & Recovery](#8.2-team-deletion-&-recovery)

[8.3 Triage Queue Management](#8.3-triage-queue-management)

[8.4 Team SLA Configuration](#8.4-team-sla-configuration)

[8.5 Agent Instructions](#8.5-agent-instructions)

[9\. Seller Teams](#9.-seller-teams)

[9.1 Seller Team Architecture](#9.1-seller-team-architecture)

[9.2 Seller Triage Queue & Auto-Mapping](#9.2-seller-triage-queue-&-auto-mapping)

[9.3 Vendor Response Drafting & Capability Declarations](#9.3-vendor-response-drafting-&-capability-declarations)

[9.4 Response Quality & AI Assistance (Optional Feature)](#9.4-response-quality-&-ai-assistance-\(optional-feature\))

[10\. The 13-Phase Evaluation Pipeline](#10.-the-13-phase-evaluation-pipeline)

[10.1 Pipeline Overview](#10.1-pipeline-overview)

[10.2 Phase 1: Stakeholder Alignment & Discovery (1-3 weeks)](#10.2-phase-1:-stakeholder-alignment-&-discovery-\(1-3-weeks\))

[10.3 Phase 2: Requirement Definition (2-5 business days)](#10.3-phase-2:-requirement-definition-\(2-5-business-days\))

[10.4 Phase 3: Use Case Definition & Validation (1-2 weeks)](#10.4-phase-3:-use-case-definition-&-validation-\(1-2-weeks\))

[10.5 Phase 4-5: Vendor Discovery & Outreach (1-2 weeks combined)](#10.5-phase-4-5:-vendor-discovery-&-outreach-\(1-2-weeks-combined\))

[10.6 Phase 6: Vendor Bidding Opens (2-4 weeks, minimum 7 calendar days)](#10.6-phase-6:-vendor-bidding-opens-\(2-4-weeks,-minimum-7-calendar-days\))

[10.7 Phase 7: Vendor Response Refinement (1-2 weeks combined with Phase 8\)](#10.7-phase-7:-vendor-response-refinement-\(1-2-weeks-combined-with-phase-8\))

[10.8 Phase 8: Buyer Due Diligence & Demos (1-2 weeks combined with Phase 7\)](#10.8-phase-8:-buyer-due-diligence-&-demos-\(1-2-weeks-combined-with-phase-7\))

[10.9 Phase 9: Final Vendor Clarifications (1-3 business days)](#10.9-phase-9:-final-vendor-clarifications-\(1-3-business-days\))

[10.10 Phase 10: Team Evaluation & Scoring (1-3 weeks)](#10.10-phase-10:-team-evaluation-&-scoring-\(1-3-weeks\))

[10.11 Phase 11: Score Review & Consensus (1-2 weeks)](#10.11-phase-11:-score-review-&-consensus-\(1-2-weeks\))

[10.12 Phase 12: Selection & Recommendation (2-5 business days)](#10.12-phase-12:-selection-&-recommendation-\(2-5-business-days\))

[10.13 Phase 13: Contract & Closure (Terminal)](#10.13-phase-13:-contract-&-closure-\(terminal\))

[10.14 Bid Workspace Cancellation Protocol](#10.14-bid-workspace-cancellation-protocol)

[10.15 Phase Duration Benchmarks (Sourcera Method)](#10.15-phase-duration-benchmarks-\(sourcera-method\))

[10.16 Phase Advancement API](#10.16-phase-advancement-api)

[11\. Buyer Console — Navigation & Layout](#11.-buyer-console-—-navigation-&-layout)

[11.1 Overview](#11.1-overview)

[11.2 Sidebar Navigation Structure](#11.2-sidebar-navigation-structure)

[11.3 Content Layout & Regions](#11.3-content-layout-&-regions)

[11.4 Persistent UI Elements](#11.4-persistent-ui-elements)

[11.5 Acceptance Criteria](#11.5-acceptance-criteria)

[12\. Policy-Powered Requirement Generation](#12.-policy-powered-requirement-generation)

[12.1 Overview](#12.1-overview)

[12.2 Supported Document Types](#12.2-supported-document-types)

[12.3 Framework Detection & Classification](#12.3-framework-detection-&-classification)

[12.4 Control Extraction](#12.4-control-extraction)

[12.5 Deduplication](#12.5-deduplication)

[12.6 Traceability Mapping](#12.6-traceability-mapping)

[12.7 Requirement Conversion & Amendment Protocol](#12.7-requirement-conversion-&-amendment-protocol)

[12.8 Plan Limits & Costs](#12.8-plan-limits-&-costs)

[12.9 Acceptance Criteria](#12.9-acceptance-criteria)

[13\. Scoring & Grading](#13.-scoring-&-grading)

[13.1 Overview](#13.1-overview)

[13.2 Rubric Definition](#13.2-rubric-definition)

[13.3 Requirement Weighting](#13.3-requirement-weighting)

[13.4 Exclusion Handling (EX Grade)](#13.4-exclusion-handling-\(ex-grade\))

[13.5 Score Modification & Audit Trail](#13.5-score-modification-&-audit-trail)

[13.6 Collaborative Scoring & Disagreement Resolution](#13.6-collaborative-scoring-&-disagreement-resolution)

[13.7 Score Calculation & Aggregation](#13.7-score-calculation-&-aggregation)

[13.8 Auto-Scoring Rules](#13.8-auto-scoring-rules)

[13.9 Scoring Phase Lifecycle](#13.9-scoring-phase-lifecycle)

[13.10 Acceptance Criteria](#13.10-acceptance-criteria)

[14\. Scenario Modeling](#14.-scenario-modeling)

[14.1 Overview](#14.1-overview)

[14.2 Scenario Definition](#14.2-scenario-definition)

[14.3 Scenario Validation](#14.3-scenario-validation)

[14.4 Scenario Scoring & Ranking](#14.4-scenario-scoring-&-ranking)

[14.5 Scenario Comparison View](#14.5-scenario-comparison-view)

[14.6 Scenario Lifecycle & Permissions](#14.6-scenario-lifecycle-&-permissions)

[14.7 Simulation Mode](#14.7-simulation-mode)

[14.8 Plan Limits & Report Integration](#14.8-plan-limits-&-report-integration)

[14.9 Acceptance Criteria](#14.9-acceptance-criteria)

[15\. TCO Modeling](#15.-tco-modeling)

[15.1 Overview](#15.1-overview)

[15.2 TCO Use Cases & Pricing Requirements](#15.2-tco-use-cases-&-pricing-requirements)

[15.3 TCO Projection](#15.3-tco-projection)

[15.4 TCO vs Standard Scoring](#15.4-tco-vs-standard-scoring)

[15.5 TCO Modeling & Editing](#15.5-tco-modeling-&-editing)

[15.6 Plan Limits](#15.6-plan-limits)

[15.7 Acceptance Criteria](#15.7-acceptance-criteria)

[16\. Organizational Intelligence](#16.-organizational-intelligence)

[16.1 Overview](#16.1-overview)

[16.2 Intelligence Data Sources](#16.2-intelligence-data-sources)

[16.3 Vendor Performance Briefing](#16.3-vendor-performance-briefing)

[16.4 Efficiency Metrics Briefing](#16.4-efficiency-metrics-briefing)

[16.5 Discrepancy Analysis Briefing](#16.5-discrepancy-analysis-briefing)

[16.6 Predictive Suggestions](#16.6-predictive-suggestions)

[16.7 Access Control & Permissions](#16.7-access-control-&-permissions)

[16.8 Briefing Lifecycle](#16.8-briefing-lifecycle)

[16.9 Plan Limits](#16.9-plan-limits)

[16.10 Acceptance Criteria](#16.10-acceptance-criteria)

[17\. Workspace Analytics](#17.-workspace-analytics)

[17.1 Overview](#17.1-overview)

[17.2 Phase-Aware Metric Availability](#17.2-phase-aware-metric-availability)

[17.3 Core Analytics Metrics](#17.3-core-analytics-metrics)

[17.4 Filtering & Aggregation](#17.4-filtering-&-aggregation)

[17.5 Export & Reporting](#17.5-export-&-reporting)

[17.6 Drill-Down & Detail Views](#17.6-drill-down-&-detail-views)

[17.7 Real-Time Updates](#17.7-real-time-updates)

[17.8 Acceptance Criteria](#17.8-acceptance-criteria)

[18\. Q\&A Threads](#18.-q&a-threads)

[18.1 Overview](#18.1-overview)

[18.2 Thread Lifecycle & Phase Gating](#18.2-thread-lifecycle-&-phase-gating)

[18.3 Thread Structure & Visibility](#18.3-thread-structure-&-visibility)

[18.4 Agent Q\&A Suggestion (Buyer-Side)](#18.4-agent-q&a-suggestion-\(buyer-side\))

[18.5 Post Interactions & Moderation](#18.5-post-interactions-&-moderation)

[18.6 Thread Search & Index](#18.6-thread-search-&-index)

[18.7 Plan Limits & Features](#18.7-plan-limits-&-features)

[18.8 Acceptance Criteria](#18.8-acceptance-criteria)

[19\. Template Library](#19.-template-library)

[19.1 Overview](#19.1-overview)

[19.2 Sourcera-Provided Templates](#19.2-sourcera-provided-templates)

[19.3 Custom Template Creation](#19.3-custom-template-creation)

[19.4 Template Library UI](#19.4-template-library-ui)

[19.5 Template-to-Workspace Flow](#19.5-template-to-workspace-flow)

[19.6 Plan Limits](#19.6-plan-limits)

[19.7 Acceptance Criteria](#19.7-acceptance-criteria)

[20\. Inbox & Pulse](#20.-inbox-&-pulse)

[20.1 Overview](#20.1-overview)

[20.2 Inbox Structure](#20.2-inbox-structure)

[20.3 Pulse Health Score](#20.3-pulse-health-score)

[20.4 Pulse Digest Email](#20.4-pulse-digest-email)

[20.5 In-App Pulse Widget](#20.5-in-app-pulse-widget)

[20.6 Notification Preferences & Settings](#20.6-notification-preferences-&-settings)

[20.7 Acceptance Criteria](#20.7-acceptance-criteria)

[21\. The Sourcera Agent](#21.-the-sourcera-agent)

[21.1 Purpose](#21.1-purpose)

[21.2 Architecture](#21.2-architecture)

[21.3 Guardrails & Hallucination Protection](#21.3-guardrails-&-hallucination-protection)

[21.4 Agent Capability Catalog & Plan Tiers](#21.4-agent-capability-catalog-&-plan-tiers)

[21.5 Agent Cost Budgets](#21.5-agent-cost-budgets)

[21.6 Agent Failure Handling](#21.6-agent-failure-handling)

[21.7 Agent Bias & Limitations](#21.7-agent-bias-&-limitations)

[21.8 Custom Agent Instructions](#21.8-custom-agent-instructions)

[21.9 Acceptance Criteria](#21.9-acceptance-criteria)

[22\. Seller Console — Knowledge Base](#22.-seller-console-—-knowledge-base)

[22.1 Purpose](#22.1-purpose)

[22.2 Ingestion Channels](#22.2-ingestion-channels)

[22.3 KB Entry Lifecycle](#22.3-kb-entry-lifecycle)

[22.4 KB Health Model](#22.4-kb-health-model)

[22.5 Firecrawl Integration](#22.5-firecrawl-integration)

[22.6 Document Library](#22.6-document-library)

[22.7 Acceptance Criteria](#22.7-acceptance-criteria)

[23\. Seller Console — Bid Workspace & Response Management](#23.-seller-console-—-bid-workspace-&-response-management)

[23.1 Bid Workspace Overview](#23.1-bid-workspace-overview)

[23.2 Response Lock & Concurrency Control](#23.2-response-lock-&-concurrency-control)

[23.3 Response Submission](#23.3-response-submission)

[23.4 Vendor Voluntary Withdrawal](#23.4-vendor-voluntary-withdrawal)

[23.5 Acceptance Criteria](#23.5-acceptance-criteria)

[24\. Seller Console — Q\&A, NDA, Inbox & Pulse](#24.-seller-console-—-q&a,-nda,-inbox-&-pulse)

[24.1 Seller Q\&A](#24.1-seller-q&a)

[24.2 NDA Module & Execution](#24.2-nda-module-&-execution)

[24.3 Seller Inbox](#24.3-seller-inbox)

[24.4 Seller Pulse](#24.4-seller-pulse)

[24.5 Seller Analytics](#24.5-seller-analytics)

[24.6 Acceptance Criteria](#24.6-acceptance-criteria)

[25\. Cross-Console Mechanics](#25.-cross-console-mechanics)

[25.1 Data Flow via Console Bridge](#25.1-data-flow-via-console-bridge)

[25.2 Sync Behavior & Retry](#25.2-sync-behavior-&-retry)

[25.3 Disqualification (Gap 25.2)](#25.3-disqualification-\(gap-25.2\))

[25.4 Acceptance Criteria](#25.4-acceptance-criteria)

[26\. Seller Profiles, Verification & Capability Declarations](#26.-seller-profiles,-verification-&-capability-declarations)

[26.1 Seller Profile](#26.1-seller-profile)

[26.2 Verification Tiers](#26.2-verification-tiers)

[26.3 Capability Declarations](#26.3-capability-declarations)

[26.4 KB-to-Capability Auto-Suggestion](#26.4-kb-to-capability-auto-suggestion)

[26.5 UX Implementation](#26.5-ux-implementation)

[26.6 Acceptance Criteria](#26.6-acceptance-criteria)

[27\. Vendor Discovery & RFP Marketplace](#27.-vendor-discovery-&-rfp-marketplace)

[27.1 Purpose](#27.1-purpose)

[27.2 Availability](#27.2-availability)

[27.3 Marketplace Search & Filtering](#27.3-marketplace-search-&-filtering)

[27.4 Marketplace Match Score](#27.4-marketplace-match-score)

[27.5 Expression of Interest (EOI)](#27.5-expression-of-interest-\(eoi\))

[27.6 Marketplace Tags & Controlled Vocabulary (Gap 27.2)](#27.6-marketplace-tags-&-controlled-vocabulary-\(gap-27.2\))

[27.7 Acceptance Criteria](#27.7-acceptance-criteria)

[28\. The Markdown Editor](#28.-the-markdown-editor)

[28.1 Core Functionality](#28.1-core-functionality)

[28.2 Keyboard Shortcuts (Editor Context)](#28.2-keyboard-shortcuts-\(editor-context\))

[28.3 Acceptance Criteria](#28.3-acceptance-criteria)

[29\. Notifications & Delivery Channels](#29.-notifications-&-delivery-channels)

[29.1 Notification Event Catalog](#29.1-notification-event-catalog)

[29.2 Delivery Channels](#29.2-delivery-channels)

[29.3 User Preferences (Gap 29.2)](#29.3-user-preferences-\(gap-29.2\))

[29.4 Slack Integration (Gap 29.1)](#29.4-slack-integration-\(gap-29.1\))

[29.5 Webhook Notifications](#29.5-webhook-notifications)

[29.6 Acceptance Criteria](#29.6-acceptance-criteria)

[30\. Search & Command Palette](#30.-search-&-command-palette)

[30.1 Architecture](#30.1-architecture)

[30.2 Command Registry](#30.2-command-registry)

[30.3 Entity Search](#30.3-entity-search)

[30.4 Full-Text Search](#30.4-full-text-search)

[30.5 Context-Aware Filtering](#30.5-context-aware-filtering)

[30.6 Keyboard Accessibility](#30.6-keyboard-accessibility)

[30.7 Acceptance Criteria](#30.7-acceptance-criteria)

[31\. Integrations & Webhooks](#31.-integrations-&-webhooks)

[31.1 Webhook Event Types & Idempotency](#31.1-webhook-event-types-&-idempotency)

[31.2 Webhook Payload Structure](#31.2-webhook-payload-structure)

[31.3 Integration Phase Export Mapping](#31.3-integration-phase-export-mapping)

[31.4 Partner Integrations](#31.4-partner-integrations)

[31.5 Webhook Configuration & Limits](#31.5-webhook-configuration-&-limits)

[31.6 Webhook Consumer Requirements](#31.6-webhook-consumer-requirements)

[31.7 Acceptance Criteria](#31.7-acceptance-criteria)

[32\. The Sourcera API](#32.-the-sourcera-api)

[32.1 Overview](#32.1-overview)

[32.2 Authentication & Rate Limit Headers](#32.2-authentication-&-rate-limit-headers)

[32.3 Pagination Model](#32.3-pagination-model)

[32.4 Rate Limit Enforcement](#32.4-rate-limit-enforcement)

[32.5 Endpoints](#32.5-endpoints)

[32.6 Error Handling](#32.6-error-handling)

[32.7 Acceptance Criteria](#32.7-acceptance-criteria)

[33\. Enterprise Security & Compliance](#33.-enterprise-security-&-compliance)

[33.1 Data Security](#33.1-data-security)

[33.2 Multi-Factor Authentication (MFA)](#33.2-multi-factor-authentication-\(mfa\))

[33.3 Access Control](#33.3-access-control)

[33.4 Data Subject Access Request (DSAR)](#33.4-data-subject-access-request-\(dsar\))

[33.5 Compliance Frameworks](#33.5-compliance-frameworks)

[33.6 Security Controls](#33.6-security-controls)

[33.7 Incident Response](#33.7-incident-response)

[33.8 Security Observability](#33.8-security-observability)

[33.9 Acceptance Criteria](#33.9-acceptance-criteria)

[34\. Plan Tiers, Billing & Entitlements](#34.-plan-tiers,-billing-&-entitlements)

[34.1 Plan Tier Definitions (Authoritative)](#34.1-plan-tier-definitions-\(authoritative\))

[34.2 Pricing](#34.2-pricing)

[34.3 Overage Pricing (Business Tier)](#34.3-overage-pricing-\(business-tier\))

[34.4 Agent Token Budget & Overage](#34.4-agent-token-budget-&-overage)

[34.5 Plan Upgrade / Downgrade](#34.5-plan-upgrade-/-downgrade)

[34.6 Downgrade Excess Data Handling](#34.6-downgrade-excess-data-handling)

[34.7 Billing Seat Count](#34.7-billing-seat-count)

[34.8 Entitlement Enforcement](#34.8-entitlement-enforcement)

[34.9 Acceptance Criteria](#34.9-acceptance-criteria)

[35\. User Onboarding Experience](#35.-user-onboarding-experience)

[35.1 Buyer Onboarding Flow](#35.1-buyer-onboarding-flow)

[35.2 Seller Onboarding Flow](#35.2-seller-onboarding-flow)

[35.3 Skipped Steps Recoverability](#35.3-skipped-steps-recoverability)

[35.4 Acceptance Criteria](#35.4-acceptance-criteria)

[36\. Settings](#36.-settings)

[36.1 User Settings](#36.1-user-settings)

[36.2 Organization Settings](#36.2-organization-settings)

[36.3 Workspace Settings](#36.3-workspace-settings)

[36.4 Acceptance Criteria](#36.4-acceptance-criteria)

[37\. Accessibility & Internationalization](#37.-accessibility-&-internationalization)

[37.1 Accessibility (WCAG 2.1 AA)](#37.1-accessibility-\(wcag-2.1-aa\))

[37.2 Internationalization (i18n)](#37.2-internationalization-\(i18n\))

[37.3 Right-to-Left (RTL) Support](#37.3-right-to-left-\(rtl\)-support)

[37.4 Testing](#37.4-testing)

[37.5 Acceptance Criteria](#37.5-acceptance-criteria)

[38\. Responsive Design & Platform Support](#38.-responsive-design-&-platform-support)

[38.1 Breakpoints](#38.1-breakpoints)

[38.2 Browser Support](#38.2-browser-support)

[38.3 JavaScript Requirement](#38.3-javascript-requirement)

[38.4 Mobile Feature Parity](#38.4-mobile-feature-parity)

[38.5 Acceptance Criteria](#38.5-acceptance-criteria)

[39\. Object Size Constraints](#39.-object-size-constraints)

[40\. Data Export & Import](#40.-data-export-&-import)

[40.1 Export Formats](#40.1-export-formats)

[40.2 Data Retention & Deletion](#40.2-data-retention-&-deletion)

[40.3 Data Import](#40.3-data-import)

[40.4 Import Round-Trip Fidelity](#40.4-import-round-trip-fidelity)

[40.5 Acceptance Criteria](#40.5-acceptance-criteria)

[41\. Email Deliverability & Compliance](#41.-email-deliverability-&-compliance)

[41.1 Email Provider](#41.1-email-provider)

[41.2 Complete Email Type Catalog](#41.2-complete-email-type-catalog)

[41.3 Email Compliance](#41.3-email-compliance)

[41.4 Opt-Out Classification](#41.4-opt-out-classification)

[41.5 Acceptance Criteria](#41.5-acceptance-criteria)

[42\. Observability, Reliability & Disaster Recovery](#42.-observability,-reliability-&-disaster-recovery)

[42.1 SLA Commitments](#42.1-sla-commitments)

[42.2 Monitoring & Alerting](#42.2-monitoring-&-alerting)

[42.3 Incident Response](#42.3-incident-response)

[42.4 Disaster Recovery Targets](#42.4-disaster-recovery-targets)

[42.5 On-Call Rotation](#42.5-on-call-rotation)

[42.6 Observability Stack](#42.6-observability-stack)

[42.7 Acceptance Criteria](#42.7-acceptance-criteria)

[43\. Internal Operations & Admin Tooling](#43.-internal-operations-&-admin-tooling)

[43.1 Admin Dashboard](#43.1-admin-dashboard)

[43.2 Admin Dashboard Access Control](#43.2-admin-dashboard-access-control)

[43.3 Support Tools](#43.3-support-tools)

[43.4 Audit Logging for Admin Actions](#43.4-audit-logging-for-admin-actions)

[43.5 Acceptance Criteria](#43.5-acceptance-criteria)

[44\. Performance Requirements](#44.-performance-requirements)

[44.1 Performance Targets](#44.1-performance-targets)

[44.2 Agent Performance Budgets](#44.2-agent-performance-budgets)

[44.3 Optimization Strategies](#44.3-optimization-strategies)

[44.4 Load Testing](#44.4-load-testing)

[44.5 Acceptance Criteria](#44.5-acceptance-criteria)

[45\. Privacy & Abuse Prevention](#45.-privacy-&-abuse-prevention)

[45.1 Data Privacy](#45.1-data-privacy)

[45.2 Abuse Prevention](#45.2-abuse-prevention)

[45.3 Marketplace Abuse Escalation](#45.3-marketplace-abuse-escalation)

[45.4 Acceptance Criteria](#45.4-acceptance-criteria)

[46\. Test Strategy & QA Framework](#46.-test-strategy-&-qa-framework)

[46.1 Test Pyramid](#46.1-test-pyramid)

[46.2 Advanced Feature Test Cases](#46.2-advanced-feature-test-cases)

[46.3 QA Process](#46.3-qa-process)

[46.4 Feature Flag System](#46.4-feature-flag-system)

[46.5 Acceptance Criteria](#46.5-acceptance-criteria)

[47\. Governance & Future Roadmap](#47.-governance-&-future-roadmap)

[47.1 Specification Versioning](#47.1-specification-versioning)

[47.2 Change Management Process](#47.2-change-management-process)

[47.3 Known Limitations & Future Work (Phase 2+)](#47.3-known-limitations-&-future-work-\(phase-2+\))

[47.4 Data Residency & Compliance Expansion](#47.4-data-residency-&-compliance-expansion)

[47.5 Acceptance Criteria](#47.5-acceptance-criteria)

[APPENDICES](#appendices)

[Appendix A: Requirement Status State Machine](#appendix-a:-requirement-status-state-machine)

[Appendix B: Keyboard Shortcut Reference](#appendix-b:-keyboard-shortcut-reference)

[Appendix C: Notification Event Catalog](#appendix-c:-notification-event-catalog)

[Appendix D: Response Status State Machine](#appendix-d:-response-status-state-machine)

[Appendix E: Workspace & Bid Workspace Status State Machine](#appendix-e:-workspace-&-bid-workspace-status-state-machine)

[Appendix F: Webhook Retry & Recovery](#appendix-f:-webhook-retry-&-recovery)

[Appendix G: PostHog Event Taxonomy](#appendix-g:-posthog-event-taxonomy)

[Appendix H: Stripe Billing Model](#appendix-h:-stripe-billing-model)

[Appendix I: API Error Code Catalog](#appendix-i:-api-error-code-catalog)

[Appendix J: Controlled Vocabulary Registry](#appendix-j:-controlled-vocabulary-registry)

---

## Introduction {#introduction}

Sourcera is an enterprise software procurement operating system designed to eliminate evaluation friction, accelerate vendor selection, and provide defensible decision documentation. It serves three distinct user cohorts through a dual-console architecture: Buyers (procurement teams, evaluators, decision-makers) and Sellers (vendor representatives, account teams), with a unifying Marketplace domain. This specification defines behavior, data models, UI patterns, access controls, and integration boundaries for the complete platform. It is authoritative and supersedes all prior documentation.

---

# 1\. Product Overview {#1.-product-overview}

## 1.1 Sourcera Architecture {#1.1-sourcera-architecture}

Sourcera operates as a three-domain system:

| Domain | Purpose | Primary Users | Console |
| :---- | :---- | :---- | :---- |
| **Buyer** | Procurement, evaluation, selection workflows | Procurement teams, evaluators, decision-makers, stakeholders | Buyer Console |
| **Seller** | Bid response, proposal management, relationship tracking | Vendors, account teams, solution architects | Seller Console |
| **Marketplace** | Public vendor discovery, publisher-managed catalog, Seller onboarding | All users (context-dependent access) | Marketplace (public \+ managed) |

Each console is independently deployable and maintains distinct data isolation at the workspace/bid-workspace level. Consoles share a common authentication layer (WorkOS) and a unified database (Convex). Organization-scoped entities are visible across consoles within the same org; console-scoped entities are isolated to their respective console and workspace.

## 1.2 Core Value Proposition {#1.2-core-value-proposition}

Sourcera solves three endemic procurement problems:

1. **Evaluation Fragmentation:** Buyers use email, spreadsheets, and ad-hoc scoring. Requirements are lost, vendor responses are scattered. Sourcera consolidates requirements, responses, and decisions into a single system of record.  
     
2. **Slow Vendor Alignment:** Sellers wait for clarity, Buyers chase vendors for information. Sourcera provides vendors structured questions, real-time response tracking, and collaborative refinement without email loops.  
     
3. **Defensibility Gaps:** Procurement cannot audit why a vendor was selected or rejected. Sourcera logs every requirement, score, comment, and decision with timestamps, user attribution, and change history.

## 1.3 Dual-Console Data Isolation Model {#1.3-dual-console-data-isolation-model}

The platform enforces strict logical isolation between Buyer and Seller operations while permitting selective collaboration through opt-in sharing mechanisms (RFI responses, Bid Workspaces, Marketplace Listings).

### 1.3.1 Org-Scoped Entities

These entities exist at the Organization level and are accessible across consoles (subject to RBAC):

- Organization  
- Organization User (Org Membership)  
- Team  
- Audit Event  
- Billing & Plan Data  
- Integrations (at org level)

### 1.3.2 Console-Scoped Entities

These entities exist within a console context (Buyer or Seller) and are NOT shared across consoles:

- **Buyer Console:** Workspace, Use Case, Requirement, Evaluation Phase, Response (vendor responses to RFI/RFP), Score, Scoring Profile, Evaluation Scenario, Intelligence Cache Entry, Evaluation Pulse Event  
- **Seller Console:** Bid Workspace, Bid Response, Capability Declaration, Seller Profile, Bid Task, Bid Schedule  
- **Marketplace (neutral domain):** Marketplace Listing, EOI (Expression of Interest), NDA Record, Marketplace Review, Marketplace Integration Hook

## 1.4 Query Scoping Requirements {#1.4-query-scoping-requirements}

**For org-scoped queries:**

- Use `org_id` parameter only  
- No `console` parameter required  
- Examples: List Organization Members, Get Team Details, Audit Event Query

**For console-scoped queries:**

- Use both `org_id` AND `console` parameter (Buyer|Seller)  
- If querying Marketplace, use `console: marketplace` or omit for public queries  
- Examples: List Workspaces (requires `org_id` \+ `console: buyer`), List Bid Workspaces (requires `org_id` \+ `console: seller`)

Data model definitions in Section 4 will explicitly label each entity as org-scoped or console-scoped.

## 1.5 Deployment & Technology Stack {#1.5-deployment-&-technology-stack}

Sourcera is deployed as a cloud-native SaaS platform with the following authoritative technology stack:

| Layer | Technology | Purpose |
| :---- | :---- | :---- |
| **Frontend** | Next.js 16 (App Router), TypeScript, ShadCN/UI \+ BaseUI, Tailwind CSS | Multi-console UI, responsive design, real-time collaboration |
| **Backend & Database** | Convex | Serverless functions, real-time subscriptions, ACID transactions |
| **Collaboration** | Convex OT, Convex Presence, Convex Subscriptions | Real-time document editing, live cursors, live notifications |
| **Comments & Notifications** | Convex Comments, Unread Tracking | Threaded annotations, unread state management |
| **Authentication** | WorkOS | Enterprise SSO, SAML/OIDC, org-level identity |
| **AI & LLM** | Claude (Anthropic) — Opus, Sonnet, Haiku | Scoring assistance, intelligent summaries, policy analysis |
| **AI Search & RAG** | Convex RAG, Perplexity Search API (Enterprise) | Knowledge base retrieval, vendor intelligence gathering |
| **Payments & Billing** | Stripe | Subscription management, invoice handling, usage tracking |
| **Email Delivery** | Loops.so | Transactional & marketing email, template management |
| **Analytics & Insights** | PostHog | Feature adoption, user behavior, performance metrics |
| **Web Intelligence** | Firecrawl | Automated vendor website content extraction |
| **Hosting & CDN** | Vercel | Global edge deployment, serverless functions |
| **Observability** | Pino (logging), Datadog (metrics \+ APM), Sentry (error tracking), OpenTelemetry (tracing) | Platform health, incident response, debugging |
| **Status & Transparency** | Statuspage.io | Public incident communication |
| **Customer Support** | Zendesk | Ticketing, knowledge base, customer success |

## 1.6 Deployment Regions {#1.6-deployment-regions}

Sourcera supports data residency constraints for enterprise customers. The `data_residency_region` field on Organization is authoritative for all entity placement.

| Region | Value | Coverage | Notes |
| :---- | :---- | :---- | :---- |
| **US** | `us` | North America, default region | AWS us-east-1 |
| **EU** | `eu` | European Union, GDPR-certified | EU West (Ireland) |

Default: `us`. Org Owners can change region during initial setup or via Enterprise support request. Region change after workspace creation requires data migration and is not available during production evaluations.

---

# 2\. The Sourcera Method {#2.-the-sourcera-method}

## 2.1 Overview {#2.1-overview}

The Sourcera Method is an opinionated, repeatable procurement evaluation methodology embedded into the platform's workflows, terminology, and user guidance. It is designed to compress 6–12 week evaluations into 4–6 weeks by providing structure, parallelization, and decision accountability.

The Method bridges the gap between unstructured business needs and defensible vendor selection. It is not mandatory—users can adopt Buyer Console without the Method—but the platform's phases, roles, and guidance assume the Method as baseline.

## 2.2 Decomposition: Use Cases → Requirements {#2.2-decomposition:-use-cases-→-requirements}

### 2.2.1 Use Case Definition

A **Use Case** is a discrete business capability or workflow that the software must support. Each Use Case focuses on a specific job-to-be-done and involves a defined set of stakeholders.

**Examples:**

- Manage monthly close procedures (Accounting)  
- Automate invoice matching (AP)  
- Track open RFP status and deadline compliance (Procurement)

**Guideline:** Define 3–8 Use Cases per evaluation. Fewer than 3 and you risk missing critical dimensions; more than 8 and the evaluation becomes unwieldy.

### 2.2.2 Requirement Definition

A **Requirement** is a measurable, scorable outcome that demonstrates whether a software feature meets a Use Case need.

**Format (required):**

\[Use Case\]: \[Requirement Statement\]

Acceptance Criteria: \[Observable, testable outcome\]

Type: \[Functional | Non-Functional | Integration | Compliance | UX\]

Granularity: \[Core | Important | Nice-to-Have\]

**Example:**

Use Case: Automate invoice matching

Requirement: System must match vendor invoice to PO and receipt within 2 seconds for 95% of invoices.

Acceptance Criteria: Latency \< 2s; accuracy ≥ 95%; no manual rekeying required.

Type: Functional \+ Performance

Granularity: Core

### 2.2.3 Requirement Granularity Guidelines

Each Requirement must result in exactly **one scorable outcome**. Avoid bundling multiple concerns into a single requirement.

**Anti-pattern (too broad):**

Requirement: The system must have strong reporting and dashboarding.

This encompasses data model, UI, export formats, scheduling—impossible to score holistically.

**Pattern (correct):**

Requirement 1: System provides real-time dashboard with current invoice aging by bucket.

Requirement 2: System exports reports to Excel with custom date range filtering.

Requirement 3: System schedules and emails automated aging reports on configurable cadence.

**Guideline:** If a requirement contains "and" or "or", decompose it. Target 50–200 total requirements per evaluation.

## 2.3 Scoring Calibration {#2.3-scoring-calibration}

### 2.3.1 Scoring Models

Sourcera supports three scoring models per requirement:

| Model | When to Use | Answer Type | Calibration |
| :---- | :---- | :---- | :---- |
| **FM (Feature Match)** | Binary capability presence | Yes/No/Partial | Objective; scorer consensus is quick |
| **PM (Performance Measure)** | Quantifiable outcome | Numeric scale (1–10, 0–100) | Objective; compare vendor claims to benchmark data |
| **Expert Judgment (EJ)** | Subjective quality, fit, risk | Numeric scale (1–10) | Subjective; requires SME alignment and written rationale |

**Guideline:**

- Use FM for at least 30% of requirements (ensures defensibility).  
- Use PM for quantifiable requirements (speed, cost, capacity).  
- Use EJ sparingly; cluster EJ requirements by domain (e.g., "Implementation Risk," "Vendor Stability") to ensure consistency.  
- For EJ scoring, provide a **written scoring rubric** (e.g., "5 \= Moderate risk, 2-year relationship, regional support" vs. "3 \= High risk, startup, no local presence").

### 2.3.2 Handling Subjective Requirements

Subjective requirements (e.g., "vendor partnership quality," "ease of use") are common and necessary but must be disciplined:

**Do:**

- Define a scoring rubric with 3–5 clear levels (1–3, 1–5, 1–10).  
- Assign these to SME scorers with relevant expertise.  
- Require written comments for every score.  
- Conduct calibration session: have 2–3 evaluators score 1–2 vendors first, review scores together, agree on interpretation.

**Don't:**

- Score without a rubric.  
- Mix multiple subjective dimensions (e.g., "ease of use AND vendor stability") in one requirement.  
- Allow anonymous or comment-free scoring.

## 2.4 Vendor Shortlisting Strategy {#2.4-vendor-shortlisting-strategy}

### 2.4.1 Shortlisting Phases

The Sourcera Method recommends a two-phase vendor filtering approach:

**Phase 1: Initial Screening (Weeks 0–1)**

- Issue RFI (Request for Information) with 20–40 lightweight requirements (mostly FM).  
- Focus: Vendor capability baseline, compliance, basic fit.  
- Acceptance: \>= 80% "Yes" on Core \+ Important FM requirements, OR clear path to capability.  
- Typical outcome: 10 vendors → 5–7 vendors.

**Phase 2: Deep Evaluation (Weeks 2–6)**

- Issue RFP with full requirement set (FM \+ PM \+ EJ).  
- Conduct vendor demos, technical validation, reference calls.  
- Scoring during Phases 10–11 (see Section 10 for phase definitions).  
- Typical outcome: 5–7 vendors → 1–2 finalists → 1 selected.

### 2.4.2 Shortlisting Criteria

**Keep vendor if:**

- Covers ≥ 80% of Core requirements with FM \= Yes or Partial.  
- No critical compliance gaps (data residency, SOC 2, GDPR).  
- Total cost of ownership (TCO) within budget band (±20%).  
- Vendor stability signals OK (not pre-acquisition, not declining revenue).

**Drop vendor if:**

- \< 70% Core requirement coverage.  
- Critical compliance blocker (e.g., no US data residency when required).  
- TCO \> budget \+ 30%, AND no flexibility signaled in pricing discussion.  
- Vendor signals lack of interest (slow RFI response, no availability for demo).

## 2.5 Evaluation Timeline Benchmarks {#2.5-evaluation-timeline-benchmarks}

### 2.5.1 Recommended Phase Durations

| Phase | Typical Duration | Activity |
| :---- | :---- | :---- |
| 1–3 (Planning) | 1–2 weeks | Stakeholder alignment, Use Case definition, Requirement writing, vendor list sourcing |
| 4–5 (RFI) | 1–2 weeks | RFI distribution, vendor response collection, initial screening |
| 6–7 (Shortlist \+ RFP) | 1–2 weeks | Shortlist decision, RFP customization, RFP distribution |
| 8–9 (Response \+ Demos) | 2–4 weeks | Vendor response collection, demo scheduling, technical validation |
| 10–11 (Scoring \+ Selection) | 1–2 weeks | Scoring, consensus, reference calls, final negotiation |
| 12 (Close) | 0.5–1 week | Contract signature, vendor kickoff |

**Total: 4–6 weeks** (vs. 8–12 weeks for unstructured evaluations).

### 2.5.2 Parallelization Opportunities

- RFI \+ RFP preparation can run in parallel during Phase 1–3 (assign separate teams).  
- Demos and scoring can overlap (Phase 10 scoring on early demos, Phase 11 score adjustments on later demos).  
- Reference calls can run during Phase 10–11 in parallel with internal scoring.

## 2.6 Cross-Departmental Alignment Patterns {#2.6-cross-departmental-alignment-patterns}

### 2.6.1 Stakeholder Cohorts

Define roles and responsibilities upfront:

| Cohort | Typical Title | Responsibilities |
| :---- | :---- | :---- |
| **Exec Sponsor** | VP Procurement, CFO, COO | Sign-off on Use Cases, phase gates, final vendor decision |
| **Evaluation Lead** | Senior Procurement Manager | Own end-to-end timeline, coordinate evaluators, interface with vendors |
| **Functional Leads** | Dept Manager (Finance, Ops, etc.) | Define Use Cases, write requirements, score FM/PM, represent department in demos |
| **Technical Evaluator** | IT/Systems Engineer | Assess integration, security, performance requirements, score technical PM/EJ |
| **SME / Evaluator** | Domain specialist, power user | Score requirements in area of expertise, provide written rationale |

### 2.6.2 Alignment Cadences

- **Kick-off (Week 0):** 1–2 hours. Present timeline, roles, Use Cases, phase gates. Collect feedback. Lock scope.  
- **Shortlist Review (Week 1–2):** 1 hour. Present RFI results, shortlist recommendation, rationale. Approve or adjust.  
- **RFP Response Review (Week 4):** 1–2 hours. Demo previews, early scoring patterns, any emerging gaps.  
- **Scoring Calibration (Week 5):** 1 hour. Review 2–3 early scores for subjective requirements; align on interpretation.  
- **Final Selection (Week 5–6):** 1–2 hours. Present recommendation with score summary, TCO, risks, next steps. Sign-off.

### 2.6.3 Escalation Pattern

If consensus cannot be reached on a requirement score:

1. Evaluation Lead facilitates 15-min discussion with scorers.  
2. If unresolved, escalate to Functional Lead (Use Case owner) for tiebreaker.  
3. If still unresolved, mark score as "Pending Vendor Clarification" and schedule follow-up demo question.  
4. Document all escalations in Evaluation Pulse (see Section 6).

## 2.7 Template Design Framework {#2.7-template-design-framework}

### 2.7.1 RFI Template Structure

**Recommended sections:**

| Section | Purpose | Typical Questions |
| :---- | :---- | :---- |
| **Vendor Background** | Qualification | Company size, years in market, customer count, funding status |
| **Compliance & Security** | Gate criteria | SOC 2, GDPR, data residency, penetration testing |
| **Product Capability (FM)** | Binary coverage | Feature existence (Yes/No/Partial/Roadmap) |
| **Pricing & Model** | Cost baseline | Pricing model, customer count, SLA, support tier options |
| **Integration & Data** | Technical fit | API availability, webhook support, data export, connector ecosystem |
| **Implementation** | Feasibility | Typical go-live timeline, onboarding model, training availability |

**RFI Guidance:**

- Keep to 40–60 questions max.  
- Expect 1–2 week vendor response window.  
- Require structured answers (yes/no, multiple choice) rather than open-ended prose.

### 2.7.2 RFP Template Structure

**Recommended sections:**

| Section | Purpose | Typical Questions |
| :---- | :---- | :---- |
| **Detailed Requirements** | FM \+ PM \+ EJ | Full 150–200 requirement set with scoring model per requirement |
| **Scenario-Based Demos** | Validation | "Walk us through Month-End Close workflow: " |
| **Pricing & Licensing** | Commercial terms | Final pricing, annual growth, bundled modules, cloud/on-premises options |
| **Implementation Plan** | Feasibility | Specific timeline, resource allocation, training, cutover strategy |
| **References** | Social proof | 3–5 reference customers in same industry/size, key contact names |
| **Appendices** | Admin | Security questionnaire, SLA template, data processing agreement |

**RFP Guidance:**

- Allow 2–4 weeks for vendor response.  
- Provide scoring rubric and weight distribution upfront.  
- Use Sourcera's Template Builder to auto-generate RFP from requirements.

---

# 3\. UX Standard — The Sourcera Constraint {#3.-ux-standard-—-the-sourcera-constraint}

## 3.1 Philosophy {#3.1-philosophy}

The **Sourcera** **Constraint** is an opinionated UI/UX principle that ensures Sourcera remains fast, predictable, and focused despite feature complexity. It codifies keyboard-first interaction on desktop and gesture-first interaction on mobile, preventing the platform from devolving into modal stacks, buried settings, and slow navigation trees.

**Core principle:** Every major workflow must be navigable and actionable via a single linear sequence (left-to-right, top-to-bottom, keyboard-driven on desktop). Discoverability and power-user features are orthogonal and accessed via secondary patterns (search, context menus, keyboard shortcuts).

## 3.2 The 8 Core Interaction Patterns {#3.2-the-8-core-interaction-patterns}

| Pattern | Desktop Primary | Mobile Equivalent | Use Case |
| :---- | :---- | :---- | :---- |
| **Sidebar Navigation** | Left-side nav panel; Cmd/Ctrl+Shift+J toggles; Keyboard arrow keys to navigate | Bottom sheet or hamburger menu | Workspace/view switching, rapid context shifts |
| **Command Palette** | Cmd/Ctrl+K opens fuzzy searchable command list | Swipe-up gesture or search icon (limited command set) | Jump to any entity, trigger action, set property |
| **Inline Editing** | Click field, edit, Tab/Enter to confirm, Esc to cancel | Tap field, edit, tap checkmark to confirm | Edit requirement title, team name, score notes |
| **Keyboard Shortcuts** | Defined per-feature (see 3.3) | N/A (accessible via Command Palette instead) | Power-user acceleration, repetitive actions |
| **Optimistic Mutation** | Change applied immediately on screen, spinner indicates background sync | Same behavior | Instant feedback, perceived speed |
| **Contextual Menu (Right-Click)** | Right-click opens context menu with actions | Long-press opens context menu | Duplicate requirement, change state, delete |
| **Modal \+ Escape Hatch** | Modal dialog with Esc to close, Cmd+Enter to submit | Full-screen overlay; back gesture to close | Confirm destructive action, complex multi-step form (rare) |
| **Live Preview / Presence** | Collaborators visible in sidebar (avatars, live cursors in shared doc) | Presence indicator in collaborators list | Multi-user editing, collision avoidance |

## 3.3 Pattern-to-Feature Mapping (Authoritative) {#3.3-pattern-to-feature-mapping-(authoritative)}

This section maps all 46+ features to their primary interaction pattern and defines feature-specific keyboard shortcuts, optimistic mutation behavior, and mobile translation.

### 3.3.1 Workspace & Navigation Features

**Feature: Create Workspace**

- Primary Pattern: Modal \+ Keyboard  
- Keyboard Shortcut: (none; Modal auto-focuses input)  
- Shortcut: Cmd+Shift+N (Windows: Ctrl+Shift+N)  
- Optimistic Mutation: Workspace appears in sidebar with loading state; refresh on background sync.  
- Mobile: Full-screen form; back gesture dismisses.  
- Acceptance Criteria:  
  - Workspace name input accepts 1–100 chars.  
  - Default console (Buyer|Seller) pre-selected based on user org role.  
  - Tab navigates through form fields; Enter submits; Esc cancels.  
  - Error message displays inline under failed field within 1 second.

**Feature: Switch Workspace**

- Primary Pattern: Sidebar Navigation  
- Keyboard Shortcut: Cmd+Shift+J (jump to workspace); arrow keys to cycle; Enter to select.  
- Optimistic Mutation: UI switches to workspace immediately; data loads in background.  
- Mobile: Tap hamburger menu \> tap workspace name.  
- Acceptance Criteria:  
  - Sidebar shows max 10 recent workspaces; "View All" link shows full list in modal.  
  - Current workspace highlighted with underline.  
  - Keyboard navigation with arrow up/down; Enter confirms.  
  - Workspace switch within 500ms; loading spinner during data fetch.

**Feature: Workspace Settings**

- Primary Pattern: Sidebar Navigation \+ Inline Editing  
- Keyboard Shortcut: (accessible via Command Palette: Cmd+K, type "Settings")  
- Optimistic Mutation: Field change reflected immediately; background sync indicated by brief spinner.  
- Mobile: Gesture-first; tap settings icon \> scroll list of editable fields.  
- Acceptance Criteria:  
  - Settings accessible via gear icon in sidebar footer.  
  - Click any setting field to edit (name, description, data residency, default phase).  
  - Tab between fields; Enter confirms; Esc cancels current edit.  
  - Unsaved changes indicated by italic field label.  
  - Save all changes with Cmd+S (desktop) or tap "Save" button (mobile).

**Feature: Org Switcher**

- Primary Pattern: Sidebar Navigation  
- Keyboard Shortcut: Cmd+Shift+O (cycle org); Cmd+Shift+L (list orgs in Command Palette).  
- Optimistic Mutation: Org switches immediately; workspace list updates in background.  
- Mobile: Tap org avatar in top-left \> tap target org.  
- Acceptance Criteria:  
  - Org avatar in top-left corner with org name tooltip.  
  - Click to open org switcher dropdown (max 8 recent orgs; "View All" for full list).  
  - Keyboard navigation with arrows; Enter selects.  
  - Org switch completes within 1 second; page remains at current route context.

---

### 3.3.2 Use Case & Requirement Features

**Feature: Create Use Case**

- Primary Pattern: Inline Editing / Modal  
- Keyboard Shortcut: (Create from Use Case list via Cmd+N)  
- Optimistic Mutation: New Use Case appears in list with "Untitled Use Case" placeholder; immediately editable.  
- Mobile: Tap "+" button; full-screen form.  
- Acceptance Criteria:  
  - Form includes Use Case name (required, 1–200 chars), description (optional, 0–1000 chars), owner (Team or User, optional).  
  - Save via Enter (desktop) or tap checkmark (mobile); Esc cancels.  
  - Form validates non-empty name before save; error shows below field.  
  - New Use Case appears in list within 300ms; loading spinner indicates background sync.

**Feature: Edit Use Case**

- Primary Pattern: Inline Editing  
- Keyboard Shortcut: (Open Use Case, then Cmd+E to toggle edit mode for name/description)  
- Optimistic Mutation: Field change visible immediately; background sync within 2 seconds.  
- Mobile: Tap Use Case row \> tap field to edit.  
- Acceptance Criteria:  
  - Click Use Case name or description to edit inline.  
  - Tab navigates between name and description fields.  
  - Enter confirms; Esc reverts to last saved value.  
  - Concurrent edit collision detection: if another user edits same field simultaneously, resolver modal appears (Keep Mine | Keep Theirs | Manual Merge).

**Feature: Delete Use Case**

- Primary Pattern: Contextual Menu \+ Modal  
- Keyboard Shortcut: (Delete from detail view via Cmd+Delete)  
- Optimistic Mutation: Use Case disappears from list; undo button available for 10 seconds.  
- Mobile: Long-press Use Case row \> "Delete" option.  
- Acceptance Criteria:  
  - Right-click Use Case in list \> "Delete" option.  
  - Confirmation modal: "Delete \[Name\]? This cannot be undone. \[Cancel\] \[Delete\]"  
  - If Use Case has requirements (\>0), secondary confirmation: "This Use Case has N requirements. They will be deleted. \[Cancel\] \[Delete Anyway\]"  
  - Upon delete, show undo button in toast for 10 seconds.  
  - Undo restores Use Case and all associated requirements.

**Feature: Create Requirement**

- Primary Pattern: Modal / Inline Form  
- Keyboard Shortcut: (Within Use Case, press Cmd+N to create new requirement below current one)  
- Optimistic Mutation: Requirement appears in Use Case list with placeholder "Untitled Requirement"; focus auto-moves to title field for immediate editing.  
- Mobile: Tap Use Case \> "Add Requirement" button \> inline edit form.  
- Acceptance Criteria:  
  - Form fields: Requirement statement (1–500 chars, required), Acceptance Criteria (0–5000 chars), Type (dropdown: Functional|Non-Functional|Integration|Compliance|UX), Granularity (dropdown: Core|Important|Nice-to-Have), Scoring Model (dropdown: FM|PM|EJ).  
  - Tab navigates through fields; Enter confirms; Esc cancels.  
  - Validation: statement required; no save allowed if blank.  
  - New requirement appears in list within 300ms.

**Feature: Edit Requirement**

- Primary Pattern: Inline Editing / Detail Panel  
- Keyboard Shortcut: (Open requirement detail, Cmd+E toggles edit mode)  
- Optimistic Mutation: Field changes visible immediately; save on Tab or Enter.  
- Mobile: Tap requirement \> swipe left to reveal edit icon \> tap to enter edit mode.  
- Acceptance Criteria:  
  - All requirement fields editable via inline click or detail panel right-side form.  
  - Edits auto-save on field blur (Tab/click away); Esc reverts to last saved.  
  - Concurrent edit collision detection applies (same as Use Case).  
  - Requirement links (related, dependent) manageable via "Link Requirement" modal.

**Feature: Reorder Requirements**

- Primary Pattern: Keyboard Shortcuts \+ Drag  
- Keyboard Shortcut: Cmd+Up/Down to move requirement up/down within Use Case.  
- Optimistic Mutation: Requirement order changes immediately; background sync within 1 second.  
- Mobile: Long-press requirement, drag to new position, release.  
- Acceptance Criteria:  
  - Drag handle (≡ icon) visible on left side of requirement row; grab to drag.  
  - Keyboard: select requirement, Cmd+Up/Down, requirement moves and list re-indexes.  
  - Visual feedback: target position highlighted while dragging.  
  - Drop completes reorder within 500ms.

**Feature: Score Requirement (FM)**

- Primary Pattern: Inline Selector / Popover  
- Keyboard Shortcut: (Within requirement row, press Tab until focused on score cell, then arrow keys to cycle Yes|Partial|No)  
- Optimistic Mutation: Score change visible immediately; background sync within 2 seconds.  
- Mobile: Tap requirement row \> tap score button (Yes|Partial|No) to cycle.  
- Acceptance Criteria:  
  - Score options for FM: Yes (green checkmark) | Partial (yellow dash) | No (red X).  
  - Click or tap to cycle through options; keyboard arrow keys to navigate.  
  - Score cell shows current selection with background color.  
  - Notes field auto-appears if score \= Partial or No (optional, but recommended).  
  - Multiple scorers can rate same requirement independently; final score determined by averaging or voting (see Section 5).

**Feature: Score Requirement (PM)**

- Primary Pattern: Inline Number Input / Slider  
- Keyboard Shortcut: (Click score cell, type numeric value, press Enter)  
- Optimistic Mutation: Score visible immediately; validation on blur (Tab or click away).  
- Mobile: Tap score cell \> number picker or slider (0–100).  
- Acceptance Criteria:  
  - Display scale (1–10 or 0–100) pre-defined at workspace level.  
  - Click score cell to reveal inline numeric input or slider.  
  - Keyboard: type value, Enter confirms, Esc cancels.  
  - Validation: value must be within defined range; error shows below field if out of range.  
  - Notes field auto-appears (optional but recommended for PM scores \> 7 or \< 4).

**Feature: Score Requirement (EJ)**

- Primary Pattern: Inline Scale / Popover  
- Keyboard Shortcut: (Click score cell, arrow keys to select 1–10, Enter confirms)  
- Optimistic Mutation: Score visible immediately; background sync within 2 seconds.  
- Mobile: Tap score cell \> 1–10 scale picker.  
- Acceptance Criteria:  
  - Display 1–10 numeric scale with labels at bottom (e.g., "1=Poor, 5=Adequate, 10=Excellent").  
  - Scoring rubric tooltip available (? icon) showing full rubric for this requirement.  
  - Notes field REQUIRED for EJ scores (cannot save without written rationale).  
  - Keyboard: arrow keys (1–10), Enter confirms, Esc cancels.  
  - Notes field auto-expands and focuses.

**Feature: Bulk Edit Requirements**

- Primary Pattern: Checkbox Selection \+ Contextual Menu  
- Keyboard Shortcut: (Cmd+A to select all visible requirements; Cmd+Click to toggle individual selection)  
- Optimistic Mutation: Bulk changes applied immediately to all selected; individual background sync within 2 seconds per item.  
- Mobile: Swipe left on requirement to reveal checkbox; tap to select; "Bulk Actions" toolbar appears at bottom.  
- Acceptance Criteria:  
  - Checkbox appears on left side of each requirement row (hidden by default, reveals on hover or tap).  
  - Cmd+A selects all visible requirements; Cmd+Click toggles individual.  
  - "Bulk Actions" toolbar appears when selection \> 0 (desktop at top of list, mobile at bottom).  
  - Available bulk actions: Change Granularity, Change Type, Change Scoring Model, Copy to Use Case, Delete All.  
  - Confirmation required for destructive actions (Delete All).

---

### 3.3.3 Scoring & Response Features

**Feature: View Vendor Response**

- Primary Pattern: Detail Panel \+ Split View  
- Keyboard Shortcut: (Navigate to requirement, Cmd+R to open response detail)  
- Optimistic Mutation: Panel slides in; content lazy-loads in background.  
- Mobile: Tap requirement row \> response detail slides up from bottom.  
- Acceptance Criteria:  
  - Left side: requirement statement and acceptance criteria (read-only).  
  - Right side: vendor response text, timestamps, edit history.  
  - Vendor can edit response any time (Phase 8–9 open; Phase 10+ read-only).  
  - Timestamp shows "Last edited by \[Vendor Name\] at \[time\]".  
  - Scoring section below response: score buttons, notes (see Feature: Score Requirement).

**Feature: Edit Vendor Response (Seller)**

- Primary Pattern: Inline Editing  
- Keyboard Shortcut: (Within response detail, Cmd+E to edit; Cmd+S to save)  
- Optimistic Mutation: Changes visible immediately in draft state; save finalizes.  
- Mobile: Tap response text \> edit mode activated.  
- Acceptance Criteria:  
  - Seller can edit response any time until Phase 10 entry (Phase 8–9 open).  
  - Edit mode: response text in editable text area, save/cancel buttons visible.  
  - Unsaved changes indicated by red dot on requirement in list.  
  - Cmd+S or tap Save finalizes response; Esc discards changes.  
  - On save, timestamp updates and change logged to Response audit trail.

**Feature: Compare Vendor Responses**

- Primary Pattern: Side-by-Side View  
- Keyboard Shortcut: (Within requirement, Cmd+Shift+C to open comparison; arrow keys to cycle vendors)  
- Optimistic Mutation: Comparison view loads in modal; scrolling synced between left/right panels.  
- Mobile: Tap requirement \> "Compare" button \> modal with vendor tabs.  
- Acceptance Criteria:  
  - Modal opens with requirement statement at top (both sides).  
  - Left/right panels show responses from two selected vendors (dropdown to change).  
  - Differences highlighted in yellow.  
  - Scroll left panel, right panel auto-scrolls to same position.  
  - Keyboard arrow left/right to switch vendors on either side.

**Feature: Add Score Note**

- Primary Pattern: Inline Text Area \+ Auto-Save  
- Keyboard Shortcut: (Click Notes field below score; Cmd+Enter to save)  
- Optimistic Mutation: Note text visible immediately in draft; auto-save after 3 seconds of inactivity.  
- Mobile: Tap notes field \> keyboard appears.  
- Acceptance Criteria:  
  - Notes field appears below score (always visible for EJ; optional show/hide for FM/PM).  
  - Placeholder: "Add note for this score (optional)" or "(required for EJ scores)".  
  - Max 2000 chars; character count displayed below field.  
  - Auto-save after 3 seconds; manual save via Cmd+Enter or blur (Tab/click away).  
  - Notes persist with score; visible in score history.

**Feature: View Score History**

- Primary Pattern: Modal / Popover  
- Keyboard Shortcut: (Click score cell, then Shift+H to show history)  
- Optimistic Mutation: History modal loads in background; no blocking.  
- Mobile: Tap score cell \> small "History" button appears \> tap to expand.  
- Acceptance Criteria:  
  - Modal shows list of all scores for this requirement across all scorers.  
  - Columns: Scorer Name, Score Value, Notes, Timestamp, Scoring Phase.  
  - Sortable by timestamp (newest first by default).  
  - Only visible to Workspace Owner, Evaluation Lead, and original scorer (see Section 5).

**Feature: Lock Score (End of Phase 11\)**

- Primary Pattern: Automatic (no user action) \+ Notification  
- Keyboard Shortcut: N/A (automatic on phase transition).  
- Optimistic Mutation: Score displays as read-only with lock icon; notification sent to scorers.  
- Mobile: Same visual lock indicator.  
- Acceptance Criteria:  
  - At Phase 12 entry (Close), all scores become immutable.  
  - Score cells display lock icon (🔒) and are no longer clickable.  
  - Scorers receive notification: "Scores are now locked as evaluation has moved to Close phase."  
  - Locked scores cannot be edited or deleted (enforced at API level).

---

### 3.3.4 Intelligence & Insights Features

**Feature: AI Scoring Suggestion**

- Primary Pattern: Inline Popover \+ Accept/Reject  
- Keyboard Shortcut: (Within scoring cell, Cmd+Shift+A to request AI suggestion)  
- Optimistic Mutation: Suggestion appears in popover within 3–5 seconds; no change to score until Accept clicked.  
- Mobile: Tap scoring cell \> "Get AI Suggestion" button \> popover.  
- Acceptance Criteria:  
  - Popover shows suggestion (e.g., "Suggested: 8/10 based on vendor claims vs. industry benchmark").  
  - Reasoning provided in smaller text (max 200 chars).  
  - Two buttons: "Accept" (applies suggestion to score field and focuses notes), "Dismiss" (closes popover, no change).  
  - Accept triggers auto-note suggestion: "AI suggested based on \[reason\]"; user can edit or keep.  
  - Available only during Phase 10–11; disabled if score already locked.

**Feature: Intelligent Summary**

- Primary Pattern: Detail Panel / Modal  
- Keyboard Shortcut: (Cmd+Shift+S to open summary for current requirement or vendor)  
- Optimistic Mutation: Summary loads in background; displayed in modal after 2–5 seconds.  
- Mobile: Tap requirement \> "Summary" button.  
- Acceptance Criteria:  
  - Summary generated from vendor response text, AI analysis, and scoring patterns.  
  - Content: "This vendor \[capability statement\]. Strengths: \[top 3 strengths from response\]. Gaps: \[top 3 gaps\]. Recommendation: \[based on scoring\]."  
  - Max 500 words; generated via Claude Opus on-demand.  
  - User can regenerate (refresh button) or edit summary manually.  
  - Summary persists in Evaluation Cache (see Section 4, Intelligence Cache).

**Feature: Discrepancy Detection**

- Primary Pattern: Alert / List  
- Keyboard Shortcut: (Cmd+Shift+D to view discrepancies for current vendor)  
- Optimistic Mutation: List loads in background; displayed in sidebar or modal after 2–3 seconds.  
- Mobile: Tap vendor \> "Discrepancies" tab.  
- Acceptance Criteria:  
  - System detects contradictions: (e.g., "Vendor claims feature Y supports \[use case X\] in response to Req 1, but states 'not supported' in Req 5 response").  
  - Each discrepancy shows: Source requirements, quoted text from responses, suggested resolution.  
  - Evaluators can mark discrepancy as "Resolved" or "Needs Clarification".  
  - Marked discrepancies persist in Evaluation Cache; used in Selection Report.

**Feature: Efficiency Metrics**

- Primary Pattern: Dashboard / KPI Cards  
- Keyboard Shortcut: (Cmd+Shift+M to open metrics dashboard)  
- Optimistic Mutation: Metrics load in background; displayed in modal or side panel.  
- Mobile: Tap "Metrics" tab in workspace.  
- Acceptance Criteria:  
  - KPIs displayed: Evaluation progress (% requirements scored), Scorer productivity (avg score/day per scorer), Timeline adherence (actual vs. planned phase duration), Data quality (% requirements with notes, % FM/PM/EJ distribution).  
  - Metrics refresh every 5 minutes.  
  - Charts: timeline progress (Gantt-style), scorer activity (bar chart), phase duration vs. plan (column chart).  
  - Exportable as PDF or CSV.

---

### 3.3.5 Collaboration & Comments Features

**Feature: Add Comment to Requirement**

- Primary Pattern: Inline Text Area \+ Threaded Comments  
- Keyboard Shortcut: (Click "Comments" button or press Cmd+Shift+/ to focus comment input)  
- Optimistic Mutation: Comment appears immediately in thread; background sync within 1 second.  
- Mobile: Tap requirement \> "Comments" tab \> swipe to comment input field.  
- Acceptance Criteria:  
  - Comment box appears at bottom of requirement detail panel.  
  - @mention syntax supported: type @ to trigger user picker.  
  - Markdown supported: bold (\*\*), italic (\*), links ([text](http://url)), code blocks.  
  - Cmd+Enter to submit; Esc to cancel.  
  - Comment appears immediately with "Sending..." state; final state after background sync.  
  - Unread state tracked per user; badge shows unread count.

**Feature: Reply to Comment**

- Primary Pattern: Inline Reply (Threaded)  
- Keyboard Shortcut: (Shift+R to reply to focused comment)  
- Optimistic Mutation: Reply appears below parent comment immediately.  
- Mobile: Tap "Reply" button on parent comment.  
- Acceptance Criteria:  
  - Reply input field appears with "@original\_author" pre-filled.  
  - Markdown and @mentions supported.  
  - Cmd+Enter to submit; Esc to cancel.  
  - Reply nests under parent; thread shows "N replies" counter.  
  - Thread can be collapsed/expanded via arrow icon.

**Feature: Resolve Comment Thread**

- Primary Pattern: Button / Toggle  
- Keyboard Shortcut: (Shift+X to resolve focused thread)  
- Optimistic Mutation: Thread grayed out and marked "Resolved"; unresolved count decreases.  
- Mobile: Tap "Resolve" button on thread header.  
- Acceptance Criteria:  
  - "Resolve" button visible on thread header (next to timestamp).  
  - Clicking marks thread as resolved (visual: gray text, strikethrough, "Resolved" badge).  
  - Resolved threads remain visible but de-emphasized.  
  - "Unresolve" option available via right-click or popover menu.  
  - Resolved count displayed in sidebar ("3 resolved", "5 unresolved").

**Feature: Live Presence (Collaborators)**

- Primary Pattern: Avatar Stack \+ Presence Indicator  
- Keyboard Shortcut: N/A (automatic)  
- Optimistic Mutation: Collaborator avatars update in real-time as users join/leave.  
- Mobile: Tap "Collaborators" button to see full list.  
- Acceptance Criteria:  
  - Avatar stack displayed in top-right of workspace (up to 4 avatars; "+N more" if \> 4).  
  - Avatar color-coded per user; hover shows name and last activity.  
  - Live cursor visible in shared document (text areas) with user color.  
  - Presence list shows who is currently in workspace, typing, or idle.  
  - Offline status indicated by strikethrough avatar.

**Feature: Mention Notification**

- Primary Pattern: Toast \+ Unread Badge  
- Keyboard Shortcut: N/A (automatic)  
- Optimistic Mutation: Toast appears within 1 second of @mention; unread badge updates.  
- Mobile: Same as desktop; notification also sent via email.  
- Acceptance Criteria:  
  - Toast shows: "\[User\] mentioned you in \[Requirement/Use Case\]".  
  - Click toast to navigate to mentioned location.  
  - Unread badge displays on workspace and requirement.  
  - Email notification sent if user offline for \> 5 minutes (configurable).

---

### 3.3.6 Vendor Response & Seller Console Features

**Feature: Submit Bid Response (Seller)**

- Primary Pattern: Form Submission \+ Progress Indicator  
- Keyboard Shortcut: (Cmd+S to save response; Cmd+Shift+S to submit and move to next requirement)  
- Optimistic Mutation: Response saved immediately (draft); submission finalizes on background sync.  
- Mobile: Tap "Submit" button at bottom of form.  
- Acceptance Criteria:  
  - Seller enters response text for each requirement (max 5000 chars).  
  - Response auto-saves every 10 seconds (indicated by "Saving..." state).  
  - Progress bar shows % of requirements answered.  
  - "Save as Draft" option available (allows exit without completing all requirements).  
  - "Submit All" button (red, prominent) submits all responses at once.  
  - On submit, timestamp recorded; Buyer side shows "Response Submitted".  
  - Seller can still edit responses (Phase 8–9 open; Phase 10+ read-only).

**Feature: Track Response Status (Seller)**

- Primary Pattern: List / Dashboard  
- Keyboard Shortcut: (Cmd+Shift+T to open response tracker)  
- Optimistic Mutation: Status updates in real-time as requirements are answered/submitted.  
- Mobile: Tap "Responses" tab in Bid Workspace.  
- Acceptance Criteria:  
  - Status list shows: Requirement name, Response status (Unanswered|Draft|Submitted), Last edit timestamp, Buyer notes (if any).  
  - Color-coded: Red=Unanswered, Yellow=Draft, Green=Submitted.  
  - Sortable by status, requirement name, timestamp.  
  - Shows all requirements due today (highlighted).  
  - Filter: All|Unanswered|Draft|Submitted.

**Feature: Manage Seller Capabilities (Seller)**

- Primary Pattern: Form / Table  
- Keyboard Shortcut: (Cmd+Shift+C to open Capabilities editor)  
- Optimistic Mutation: Capability added/removed immediately; background sync within 1 second.  
- Mobile: Tap "Capabilities" tab \> edit table rows.  
- Acceptance Criteria:  
  - Table shows: Capability name, Category, Description, Maturity level (Beta|Production|Mature).  
  - Add row: Click "+" button; inline edit form appears; save with Enter or blur.  
  - Edit row: Click row; inline edit fields appear; save with Enter or blur; Esc cancels.  
  - Delete row: Right-click or hover to reveal delete button; confirmation required.  
  - Max 500 capabilities per Seller Profile.  
  - Capabilities synced to marketplace and visible to Buyers exploring vendor profile.

---

### 3.3.7 Admin & Settings Features

**Feature: Manage Team Members**

- Primary Pattern: Table \+ Inline Role Selector  
- Keyboard Shortcut: (Cmd+Shift+U to open team management)  
- Optimistic Mutation: Member row updates immediately; background sync within 1 second.  
- Mobile: Tap "Team" tab \> list of members; tap to edit role.  
- Acceptance Criteria:  
  - Table shows: Name, Email, Role, Invitation status, Last activity.  
  - Invite new member: "Invite" button opens modal; enter email; select role; click Invite.  
  - Edit member role: Click role cell; dropdown appears; arrow keys or click to select new role; blur saves.  
  - Remove member: Right-click row or hover to reveal remove button; confirmation required.  
  - Roles: Org Owner, Org Admin, Workspace Owner, Workspace Admin, Use Case Lead, Reviewer, Guest (see Section 5).  
  - Pending invitations shown with "Pending" status; can resend or revoke.

**Feature: Manage Workspace Guests**

- Primary Pattern: Table \+ Role Profile Selector  
- Keyboard Shortcut: (Cmd+Shift+G to open guest management)  
- Optimistic Mutation: Guest row updates immediately; Guest Permission Profile change applied in real-time.  
- Mobile: Tap "Guests" tab \> list of guests; tap to edit profile.  
- Acceptance Criteria:  
  - Table shows: Guest name, Email, Guest Permission Profile, Assigned Use Cases, Invitation status.  
  - Invite guest: "Invite" button opens modal; enter email; select Guest Permission Profile (read\_only|contributor|scorer|full\_participant); select Use Cases if contributor/scorer; click Invite.  
  - Edit guest profile: Click profile cell; dropdown shows options; arrow keys or click to select; blur saves.  
  - Guest Permission Profile applies to scope of workspace (not org-level).  
  - Guests see only assigned Use Cases or requirements (based on profile); cannot see other workspace confidential data.  
  - Revoke guest: Right-click row or hover to reveal revoke button; confirmation required; guest loses access within 1 minute.

**Feature: Configure Workspace Scoring Model**

- Primary Pattern: Radio Selector \+ Inline Config  
- Keyboard Shortcut: (Cmd+Shift+S to open scoring configuration)  
- Optimistic Mutation: Configuration change applied to all new requirements immediately.  
- Mobile: Tap "Scoring" tab \> expand section for each model.  
- Acceptance Criteria:  
  - Three sections: FM Settings, PM Settings, EJ Settings.  
  - FM: no configuration needed (Yes|Partial|No fixed).  
  - PM: Define scale (1–10 or 0–100) and labels (e.g., "1=Poor", "5=Adequate", "10=Excellent").  
  - EJ: Define scale (1–10 only) and labels; define rubric (4–5 levels with descriptions).  
  - Save button at bottom; confirmation if changing scores mid-evaluation.  
  - Changes apply to all future scoring; retroactive change requires confirmation (may recalibrate existing scores).

**Feature: Export Evaluation (PDF/CSV)**

- Primary Pattern: Modal / Download Dialog  
- Keyboard Shortcut: (Cmd+Shift+E to open export dialog)  
- Optimistic Mutation: Export starts immediately; progress indicator shown.  
- Mobile: Tap "Export" button \> choose format \> download.  
- Acceptance Criteria:  
  - Export formats: PDF (full report), CSV (requirements \+ scores), Excel (detailed workbook with multiple sheets).  
  - PDF includes: Use Cases, Requirements, Scores, Vendor Responses, Summary Analysis, Selection Recommendation.  
  - CSV includes: Requirement ID, Requirement Statement, Acceptance Criteria, Scoring Model, \[Vendor 1 Score\], \[Vendor 2 Score\], ... \[Notes\].  
  - Excel includes: Requirements sheet, Scores sheet, Responses sheet, Analysis sheet, Vendor Summaries sheet.  
  - Export completes within 10 seconds (files \< 50MB).  
  - Download initiated automatically or manual download link provided.

**Feature: Audit Log / Activity Trail**

- Primary Pattern: Table / Timeline View  
- Keyboard Shortcut: (Cmd+Shift+A to open audit log)  
- Optimistic Mutation: New entries appear in real-time as they occur.  
- Mobile: Tap "Activity" tab \> timeline list.  
- Acceptance Criteria:  
  - Columns: Timestamp, User, Action, Entity, Details, Change (old → new).  
  - Entries logged: Create/Edit/Delete Workspace, Use Case, Requirement, Response, Score, Comment, Team Member, Guest.  
  - Filterable by: User, Action type, Entity type, Date range.  
  - Sortable by timestamp (newest first).  
  - Details column shows diff for field changes (old value → new value).  
  - Searchable by user name, entity name, action.  
  - Audit log immutable (read-only).

---

## 3.4 Mobile Translation of Linear Constraint {#3.4-mobile-translation-of-linear-constraint}

On mobile devices (iOS/Android, viewport \< 768px), the Linear Constraint translates keyboard-first patterns to gesture-first equivalents while preserving the "linear flow" principle:

| Desktop Pattern | Keyboard | Mobile Gesture Equivalent |
| :---- | :---- | :---- |
| Sidebar Navigation | Cmd/Ctrl+Shift+J | Tap hamburger icon \> swipe list |
| Command Palette | Cmd/Ctrl+K | Swipe up from bottom or tap search icon \> type |
| Keyboard Shortcuts (Cmd+X) | Direct shortcut | Trigger via Command Palette or long-press on element |
| Inline Editing | Tab, Enter, Esc | Tap field \> keyboard appears \> tap checkmark or swipe down to dismiss |
| Right-Click Context Menu | Right-click | Long-press element \> swipe-up to reveal menu |
| Modal | Esc to dismiss | Swipe down to dismiss; back gesture (Android) to close |
| Keyboard Arrow Keys | Up/Down/Left/Right | Swipe up/down in list to scroll; tap to select |

**Mobile Constraint Requirements:**

- All major workflows completable within 5 taps (excluding text entry).  
- Modals default to full-screen or 80% viewport height (not center-anchored).  
- Bottom-sheet modals (over existing content) used for secondary actions.  
- Touch targets minimum 44x44 px; avoid edge-of-screen targets (swipe-back conflicts).  
- Keyboard always auto-shows when text field focused; auto-hides on blur or swipe-dismiss.  
- Horizontal scrolling avoided except for comparison views (explicitly indicated).

## 3.5 Optimistic Mutation Rollback Behavior {#3.5-optimistic-mutation-rollback-behavior}

When optimistic mutations fail in the background (network error, validation failure, concurrency conflict), the UI must provide clear recovery options:

**Pattern: Optimistic Mutation with Rollback**

1. **User Action:** User clicks "Save", field value changes, or item is deleted.  
2. **Optimistic State:** UI immediately reflects change (spinner or loading indicator brief).  
3. **Background Sync:** API request sent in background.  
4. **Success Path:** Change persists; spinner disappears within 2 seconds.  
5. **Failure Path (Validation Error):**  
   - UI reverts to last saved value.  
   - Error toast appears: "\[Field name\] could not be saved: \[reason\]. \[Retry\] \[Discard\]"  
   - If Retry: attempt save again; if Discard: revert and close toast.  
6. **Failure Path (Concurrency Conflict):**  
   - Conflict modal appears: "This field was edited by \[Other User\] at \[time\]. Resolve conflict: \[Keep Mine\] \[Keep Theirs\] \[Manual Merge\]"  
   - If Keep Mine: user's version persists.  
   - If Keep Theirs: revert to other user's version.  
   - If Manual Merge: open side-by-side editor; user manually reconciles and saves.  
7. **Failure Path (Network Error):**  
   - UI keeps optimistic change visible.  
   - Persistent banner appears at top: "Offline. Changes will sync when online. \[Retry\] \[Discard\]"  
   - If Retry: attempt save when connection restored (automatic).  
   - If Discard: revert change and remove banner.

**Feature-Specific Rollback Behavior:**

| Feature | Rollback Trigger | Recovery Option |
| :---- | :---- | :---- |
| Create Requirement | Validation error (empty title) | Toast \+ input re-focuses; title field highlighted |
| Edit Requirement | Concurrency conflict | Conflict modal (Keep Mine / Keep Theirs / Merge) |
| Delete Requirement | (No rollback) | Undo toast for 10 seconds; click to restore |
| Score Requirement (FM) | Validation error (invalid value) | Revert to last saved score; error below cell |
| Score Requirement (PM) | Score out of range | Revert to last saved; error tooltip shows valid range |
| Add Comment | Network error | Persistent "Unsent" badge on comment; retry button; discard option |
| Submit Bid Response | Validation error (required field empty) | Modal shows missing fields; user can edit and retry |

---

# 4\. Global Data Model {#4.-global-data-model}

## 4.1 Model Design Principles {#4.1-model-design-principles}

All data models in Sourcera follow these principles:

1. **Schema Clarity:** Every field has explicit type, constraints, and purpose.  
2. **Audit Trail:** All mutable entities include `created_at`, `updated_at`, `created_by`, `updated_by` (or references).  
3. **Soft Deletes:** Mutable entities use `deleted_at` (nullable timestamp) instead of hard deletes.  
4. **Immutability:** Locked entities (e.g., scores in Phase 12\) enforce read-only at API and database level.  
5. **Scope Isolation:** Org-scoped entities prefixed with `org_id` FK; console-scoped entities include `console` enum where applicable.  
6. **Referential Integrity:** Foreign keys enforced; cascade deletes used only where semantically safe.  
7. **Normalization:** Related data stored in separate tables with FKs, not nested JSON blobs (see Gap 3.6 resolution).  
8. **Constraints:** Size limits enforced at schema and API validation levels.

## 4.2 Organization & Auth Entities {#4.2-organization-&-auth-entities}

### 4.2.1 Organization (Org-Scoped)

| Field | Type | Constraints | Notes |
| :---- | :---- | :---- | :---- |
| `id` | UUID | Primary key | Auto-generated |
| `name` | String | 1–255 chars | Display name |
| `slug` | String | 3–50 chars, lowercase, unique | URL-safe identifier |
| `data_residency_region` | Enum | `us` | `eu` | Data location; default: `us` |
| `plan_tier` | Enum | `free` | `business` | `enterprise` | Subscription level |
| `max_workspaces` | Integer | \>= 1 | Based on plan; Free=3, Business=25, Enterprise=Unlimited |
| `max_members` | Integer | \>= 1 | Based on plan; Free=10, Business=100, Enterprise=Unlimited |
| `max_req_per_workspace` | Integer | \>= 1 | Based on plan; Free=500, Business=5000, Enterprise=20000 |
| `max_kb_entries` | Integer | \>= 1 | Based on plan; Free=500, Business=10000, Enterprise=100000 |
| `billing_email` | String | Valid email | Contact for invoices |
| `sso_enabled` | Boolean | Default: false | WorkOS SSO enabled |
| `sso_domain` | String | Valid domain | e.g., "company.com" |
| `created_at` | Timestamp | Immutable | UTC |
| `updated_at` | Timestamp | Auto-updated | UTC |
| `created_by` | UUID (FK) | User ID | Creator user |
| `updated_by` | UUID (FK) | User ID | Last updater |
| `deleted_at` | Timestamp | Nullable | Soft delete marker |

### 4.2.2 Organization User / Membership (Org-Scoped)

| Field | Type | Constraints | Notes |
| :---- | :---- | :---- | :---- |
| `id` | UUID | Primary key | Auto-generated |
| `org_id` | UUID | FK → Organization | Organization reference |
| `user_id` | UUID | FK → User | User reference |
| `role` | Enum | `org_owner` | `org_admin` | `member` | Org-level role |
| `joined_at` | Timestamp | Immutable | UTC; defaults to now |
| `invited_by` | UUID (FK) | User ID | Who invited this user |
| `invitation_accepted_at` | Timestamp | Nullable | When user accepted invite |
| `mfa_enforced` | Boolean | Default: org setting | Multi-factor auth required |
| `deleted_at` | Timestamp | Nullable | Soft delete / membership revoked |

### 4.2.3 User (Global)

| Field | Type | Constraints | Notes |
| :---- | :---- | :---- | :---- |
| `id` | UUID | Primary key | From WorkOS |
| `email` | String | Valid email, unique | Primary identifier |
| `first_name` | String | 1–100 chars |  |
| `last_name` | String | 1–100 chars |  |
| `avatar_url` | String | Valid HTTPS URL | Profile picture |
| `timezone` | String | IANA timezone | e.g., "America/New\_York" |
| `locale` | String | BCP-47 lang tag | e.g., "en-US" |
| `role_context` | JSON | Max 2000 chars | User's primary roles across orgs (denormalized for performance) |
| `created_at` | Timestamp | Immutable | UTC |
| `updated_at` | Timestamp | Auto-updated | UTC |
| `last_login_at` | Timestamp | Nullable | Latest login timestamp |
| `deleted_at` | Timestamp | Nullable | Soft delete; account disabled |

### 4.2.4 Team (Org-Scoped)

| Field | Type | Constraints | Notes |
| :---- | :---- | :---- | :---- |
| `id` | UUID | Primary key | Auto-generated |
| `org_id` | UUID | FK → Organization | Organization reference; Teams are not workspace-scoped |
| `console` | Enum | `buyer` | `seller` | Which console this team belongs to |
| `name` | String | 1–200 chars | Display name |
| `description` | String | 0–500 chars | Optional description |
| `members` | Array\[UUID\] | User IDs | Denormalized for performance; normalized via Membership junction table |
| `created_at` | Timestamp | Immutable | UTC |
| `updated_at` | Timestamp | Auto-updated | UTC |
| `created_by` | UUID (FK) | User ID | Creator |
| `deleted_at` | Timestamp | Nullable | Soft delete |

---

## 4.3 Buyer Console Entities {#4.3-buyer-console-entities}

### 4.3.1 Workspace (Console-Scoped, Buyer)

| Field | Type | Constraints | Notes |
| :---- | :---- | :---- | :---- |
| `id` | UUID | Primary key | Auto-generated |
| `org_id` | UUID | FK → Organization | Organization reference |
| `console` | Enum | `buyer` (fixed) | Identifies console scope |
| `name` | String | 1–200 chars | Display name |
| `description` | String | 0–2000 chars | RFP context, goals, timeline |
| `status` | Enum | `draft` | `active` | `closed` | `archived` | Workspace state |
| `pipeline_stage_id` | Integer | 0–15 | Current phase (0=Draft, 1–11=Phases, 12=Close, 13+=Archived); see Section 6 |
| `data_residency_region` | Enum | `us` | `eu` | Inherits from Org; overridable |
| `owner_id` | UUID (FK) | User ID | Workspace owner |
| `evaluation_lead_id` | UUID (FK) | User ID | Designated evaluation lead |
| `default_scoring_model` | Enum | `fm` | `pm` | `ej` | `mixed` | Default model for new requirements; can override per-requirement |
| `scoring_scale_pm` | Enum | `1_10` | `0_100` | PM scoring range; default: `1_10` |
| `expected_phase_durations` | JSON | Max 5000 chars | {phase\_id: days, ...}; for timeline tracking |
| `created_at` | Timestamp | Immutable | UTC |
| `updated_at` | Timestamp | Auto-updated | UTC |
| `created_by` | UUID (FK) | User ID | Creator |
| `deleted_at` | Timestamp | Nullable | Soft delete |

### 4.3.2 Workspace Membership (Console-Scoped, Buyer)

| Field | Type | Constraints | Notes |
| :---- | :---- | :---- | :---- |
| `id` | UUID | Primary key | Auto-generated |
| `workspace_id` | UUID | FK → Workspace | Workspace reference |
| `user_id` | UUID | FK → User | User reference |
| `role` | Enum | `workspace_owner` | `workspace_admin` | `use_case_lead` | `reviewer` | `guest` | Workspace-level role |
| `guest_permission_profile` | Enum | `read_only` | `contributor` | `scorer` | `full_participant` | Only applies if role=`guest`; see Section 5 for details |
| `assigned_use_case_ids` | Array\[UUID\] | Use Case IDs | Restricts guest visibility to assigned Use Cases; empty \= no restriction (reviewers see all) |
| `joined_at` | Timestamp | Immutable | UTC |
| `invited_by` | UUID (FK) | User ID | Who invited this user |
| `invitation_accepted_at` | Timestamp | Nullable | When user accepted invite |
| `deleted_at` | Timestamp | Nullable | Soft delete / membership revoked |

### 4.3.3 Use Case (Console-Scoped, Buyer)

| Field | Type | Constraints | Notes |
| :---- | :---- | :---- | :---- |
| `id` | UUID | Primary key | Auto-generated |
| `workspace_id` | UUID | FK → Workspace | Workspace reference |
| `name` | String | 1–200 chars | Display name |
| `description` | String | 0–5000 chars | Business need, stakeholders, success metrics |
| `owner_id` | UUID (FK) | Team or User ID | Functional owner |
| `display_order` | Integer | \>= 0 | Sort order in workspace |
| `created_at` | Timestamp | Immutable | UTC |
| `updated_at` | Timestamp | Auto-updated | UTC |
| `created_by` | UUID (FK) | User ID | Creator |
| `deleted_at` | Timestamp | Nullable | Soft delete |

### 4.3.4 Requirement (Console-Scoped, Buyer)

| Field | Type | Constraints | Notes |
| :---- | :---- | :---- | :---- |
| `id` | UUID | Primary key | Auto-generated |
| `workspace_id` | UUID | FK → Workspace | Workspace reference |
| `use_case_id` | UUID | FK → Use Case | Parent Use Case |
| `statement` | String | 1–500 chars | Requirement statement |
| `acceptance_criteria` | String | 0–5000 chars | Observable, testable outcome |
| `type` | Enum | `functional` | `non_functional` | `integration` | `compliance` | `ux` | Requirement category |
| `granularity` | Enum | `core` | `important` | `nice_to_have` | Priority level |
| `scoring_model` | Enum | `fm` | `pm` | `ej` | Scoring method (defaults to workspace default\_scoring\_model) |
| `related_requirement_ids` | Array\[UUID\] | Requirement IDs | Links to related requirements |
| `depends_on_requirement_ids` | Array\[UUID\] | Requirement IDs | Blocking requirements |
| `display_order` | Integer | \>= 0 | Sort order within Use Case |
| `created_at` | Timestamp | Immutable | UTC |
| `updated_at` | Timestamp | Auto-updated | UTC |
| `created_by` | UUID (FK) | User ID | Creator |
| `deleted_at` | Timestamp | Nullable | Soft delete |

### 4.3.5 Response (Console-Scoped, Buyer)

| Field | Type | Constraints | Notes |
| :---- | :---- | :---- | :---- |
| `id` | UUID | Primary key | Auto-generated |
| `workspace_id` | UUID | FK → Workspace | Workspace reference |
| `requirement_id` | UUID | FK → Requirement | Requirement reference |
| `bid_workspace_id` | UUID (FK) | Bid Workspace ID | Seller's bid context (optional; allows linking buyer requirement to seller response) |
| `vendor_id` | UUID (FK) | Marketplace Seller ID | Vendor providing response |
| `answer_text` | String | 0–50000 chars | Vendor's response (see Gap 3.3) |
| `answer_type` | Enum | `text` | `document` | `video_url` | `demo_link` | Response format |
| `attachment_ids` | Array\[UUID\] | Attachment IDs | Supporting docs/media |
| `status` | Enum | `draft` | `submitted` | `received` | `acknowledged` | Response lifecycle |
| `submitted_at` | Timestamp | Nullable | When response was finalized by vendor |
| `created_at` | Timestamp | Immutable | UTC |
| `updated_at` | Timestamp | Auto-updated | UTC |
| `created_by` | UUID (FK) | Seller User ID | Who submitted response |
| `deleted_at` | Timestamp | Nullable | Soft delete |

### 4.3.6 Score (Console-Scoped, Buyer)

| Field | Type | Constraints | Notes |
| :---- | :---- | :---- | :---- |
| `id` | UUID | Primary key | Auto-generated |
| `workspace_id` | UUID | FK → Workspace | Workspace reference |
| `requirement_id` | UUID | FK → Requirement | Requirement reference |
| `vendor_id` | UUID (FK) | Marketplace Seller ID | Vendor being scored |
| `phase_id` | Integer | 10–11 | Scoring phase (Phase 10=primary, Phase 11=adjustments) |
| `scorer_id` | UUID (FK) | User ID | Person who scored |
| `score_model` | Enum | `fm` | `pm` | `ej` | Scoring method used |
| `score_value` | String or Number | FM: "yes"|"partial"|"no"; PM: 1–100; EJ: 1–10 | Actual score |
| `notes` | String | 0–2000 chars | Rationale (required for EJ, optional for FM/PM) |
| `locked` | Boolean | Default: false | Becomes true at Phase 12 entry; prevents edit |
| `created_at` | Timestamp | Immutable | UTC |
| `updated_at` | Timestamp | Auto-updated | UTC (frozen if locked=true) |
| `deleted_at` | Timestamp | Nullable | Soft delete (not allowed if locked=true) |

### 4.3.7 Intelligence Cache Entry (Console-Scoped, Buyer)

| Field | Type | Constraints | Notes |
| :---- | :---- | :---- | :---- |
| `id` | UUID | Primary key | Auto-generated |
| `workspace_id` | UUID | FK → Workspace | Workspace reference |
| `cache_type` | Enum | `vendor_performance` | `efficiency_metrics` | `discrepancy_analysis` | `predictive_suggestions` | Cache classification (see Gap 3.4) |
| `entity_type` | Enum | `vendor` | `requirement` | `workspace` | `evaluation` | What this cache entry relates to |
| `entity_id` | UUID | Related entity ID (vendor\_id, requirement\_id, workspace\_id) | Primary key of entity |
| `key` | String | Max 255 chars | Unique cache key within entity (e.g., "summary", "discrepancies", "efficiency\_score") |
| `value` | JSON | Max 100000 chars | Cached data (varies by cache\_type) |
| `expires_at` | Timestamp | Nullable | Cache expiry; if null, permanent |
| `created_at` | Timestamp | Immutable | UTC |
| `updated_at` | Timestamp | Auto-updated | UTC |

### 4.3.8 Evaluation Scenario (Console-Scoped, Buyer)

| Field | Type | Constraints | Notes |
| :---- | :---- | :---- | :---- |
| `id` | UUID | Primary key | Auto-generated |
| `workspace_id` | UUID | FK → Workspace | Workspace reference |
| `name` | String | 1–200 chars | Scenario name (e.g., "Peak Load", "Concurrent Users", "Multi-Tenant Isolation") |
| `description` | String | 0–2000 chars | Scenario context and parameters |
| `parameters` | JSON | Max 10000 chars | Scenario parameters; fully defined in 4.3.9 |
| `created_at` | Timestamp | Immutable | UTC |
| `updated_at` | Timestamp | Auto-updated | UTC |
| `created_by` | UUID (FK) | User ID | Creator |
| `deleted_at` | Timestamp | Nullable | Soft delete |

### 4.3.9 Evaluation Scenario Parameters (JSON Structure)

{

  "user\_count": 100,

  "concurrent\_users": 50,

  "transactions\_per\_day": 10000,

  "peak\_hour\_load": "3x average",

  "data\_volume\_gb": 500,

  "monthly\_growth\_rate": 10,

  "uptime\_requirement\_percent": 99.9,

  "response\_time\_ms": 1000,

  "custom\_fields": {

    "key": "value",

    "key2": 123

  }

}

Each field is optional. Custom fields allow flexibility for domain-specific scenarios.

### 4.3.10 Evaluation Pulse Event (Console-Scoped, Buyer)

| Field | Type | Constraints | Notes |
| :---- | :---- | :---- | :---- |
| `id` | UUID | Primary key | Auto-generated |
| `workspace_id` | UUID | FK → Workspace | Workspace reference |
| `event_type` | Enum | `status_update` | `escalation` | `milestone` | `risk_alert` | `vendor_update` | Event category |
| `severity` | Enum | `info` | `warning` | `critical` | Importance level |
| `title` | String | 1–200 chars | Brief summary |
| `message` | String | 0–5000 chars | Full details |
| `related_entity_type` | Enum | `workspace` | `requirement` | `vendor` | `team` | Entity type affected |
| `related_entity_id` | UUID | Related entity ID | Which entity this pulse event concerns |
| `audience` | Array\[UUID\] | User IDs | Who should see this (often Org Owner, Org Admin, Executive Sponsor) |
| `created_at` | Timestamp | Immutable | UTC |
| `created_by` | UUID (FK) | User ID or System | Creator (system if auto-generated) |

---

## 4.4 Seller Console Entities {#4.4-seller-console-entities}

### 4.4.1 Bid Workspace (Console-Scoped, Seller)

| Field | Type | Constraints | Notes |
| :---- | :---- | :---- | :---- |
| `id` | UUID | Primary key | Auto-generated |
| `org_id` | UUID | FK → Organization | Seller's organization |
| `console` | Enum | `seller` (fixed) | Identifies console scope |
| `buyer_org_id` | UUID (FK) | Organization ID | Buyer's organization (foreign org) |
| `name` | String | 1–200 chars | Opportunity name (e.g., "Acme Corp RFP") |
| `description` | String | 0–2000 chars | Opportunity context |
| `status` | Enum | `draft` | `active` | `submitted` | `won` | `lost` | Bid lifecycle |
| `pipeline_stage_id` | Integer | 0–15 | Aligned with buyer phases for visibility |
| `owner_id` | UUID (FK) | Seller User ID | Account owner / bid lead |
| `team_ids` | Array\[UUID\] | Team IDs | Assigned teams contributing to bid |
| `created_at` | Timestamp | Immutable | UTC |
| `updated_at` | Timestamp | Auto-updated | UTC |
| `created_by` | UUID (FK) | Seller User ID | Creator |
| `deleted_at` | Timestamp | Nullable | Soft delete |

### 4.4.2 Bid Response (Console-Scoped, Seller)

| Field | Type | Constraints | Notes |
| :---- | :---- | :---- | :---- |
| `id` | UUID | Primary key | Auto-generated |
| `bid_workspace_id` | UUID | FK → Bid Workspace | Bid context |
| `requirement_id` | UUID | (Optional FK) | Linked buyer requirement (allows map to buyer side) |
| `question_text` | String | 1–1000 chars | Requirement or question text (copied from buyer RFI/RFP) |
| `answer_text` | String | 0–50000 chars | Seller's response |
| `answer_type` | Enum | `text` | `document` | `video_url` | `demo_link` | Response format |
| `attachment_ids` | Array\[UUID\] | Attachment IDs | Supporting docs |
| `status` | Enum | `draft` | `submitted` | `acknowledged` | Response state |
| `submitted_at` | Timestamp | Nullable | When answer was finalized |
| `display_order` | Integer | \>= 0 | Sort order |
| `created_at` | Timestamp | Immutable | UTC |
| `updated_at` | Timestamp | Auto-updated | UTC |
| `created_by` | UUID (FK) | Seller User ID | Last editor |
| `deleted_at` | Timestamp | Nullable | Soft delete |

### 4.4.3 Seller Profile (Console-Scoped, Seller)

| Field | Type | Constraints | Notes |
| :---- | :---- | :---- | :---- |
| `id` | UUID | Primary key | Auto-generated |
| `org_id` | UUID | FK → Organization | Seller's organization |
| `vendor_name` | String | 1–200 chars | Company name |
| `website_url` | String | Valid HTTPS URL | Company website |
| `logo_url` | String | Valid HTTPS URL | Company logo |
| `tagline` | String | 0–200 chars | One-line pitch |
| `description` | String | 0–2000 chars | Company overview |
| `founded_year` | Integer | 1900–2099 | Year founded |
| `headquarters_country` | String | 2-letter ISO country code | Headquarters location |
| `employee_count` | Enum | `1-10` | `11-50` | `51-200` | `201-500` | `501-1000` | `1000+` | Company size |
| `annual_revenue_usd` | Enum | `0-1M` | `1M-10M` | `10M-50M` | `50M-100M` | `100M+` | Revenue band (optional) |
| `funding_stage` | Enum | `bootstrapped` | `seed` | `series_a` | `series_b` | `series_c` | `series_c+` | `public` | Funding stage |
| `certifications` | Array\[String\] | Cert names | e.g., \["SOC2", "ISO27001", "GDPR", "HIPAA"\] |
| `capability_ids` | Array\[UUID\] | Capability Declaration IDs | FKs to Capability Declarations (normalized per Gap 3.6) |
| `contact_ids` | Array\[UUID\] | User IDs | Key contacts (removed JSON blob) |
| `created_at` | Timestamp | Immutable | UTC |
| `updated_at` | Timestamp | Auto-updated | UTC |
| `created_by` | UUID (FK) | Seller User ID | Creator |
| `deleted_at` | Timestamp | Nullable | Soft delete |

### 4.4.4 Capability Declaration (Console-Scoped, Seller)

| Field | Type | Constraints | Notes |
| :---- | :---- | :---- | :---- |
| `id` | UUID | Primary key | Auto-generated |
| `org_id` | UUID | FK → Organization | Seller's organization |
| `seller_profile_id` | UUID | FK → Seller Profile | Parent profile |
| `name` | String | 1–200 chars | Capability name |
| `category` | String | 1–100 chars | Category (e.g., "Reporting", "Integration", "Security") |
| `description` | String | 0–1000 chars | Capability details |
| `maturity_level` | Enum | `beta` | `production` | `mature` | Feature maturity |
| `supported_use_cases` | Array\[String\] | Use case names | Which buyer use cases this supports |
| `related_capabilities` | Array\[UUID\] | Capability IDs | Related capabilities (FKs) |
| `created_at` | Timestamp | Immutable | UTC |
| `updated_at` | Timestamp | Auto-updated | UTC |
| `created_by` | UUID (FK) | Seller User ID | Creator |
| `deleted_at` | Timestamp | Nullable | Soft delete |

### 4.4.5 Bid Task (Console-Scoped, Seller)

| Field | Type | Constraints | Notes |
| :---- | :---- | :---- | :---- |
| `id` | UUID | Primary key | Auto-generated |
| `bid_workspace_id` | UUID | FK → Bid Workspace | Parent bid |
| `title` | String | 1–200 chars | Task name |
| `description` | String | 0–2000 chars | Task details |
| `assigned_to_id` | UUID (FK) | User ID | Assignee |
| `due_date` | Date | ISO format | Due date |
| `status` | Enum | `open` | `in_progress` | `completed` | `blocked` | Task state |
| `blocking_reason` | String | 0–500 chars | If blocked, why |
| `display_order` | Integer | \>= 0 | Sort order |
| `created_at` | Timestamp | Immutable | UTC |
| `updated_at` | Timestamp | Auto-updated | UTC |
| `created_by` | UUID (FK) | Seller User ID | Creator |
| `deleted_at` | Timestamp | Nullable | Soft delete |

### 4.4.6 Bid Schedule (Console-Scoped, Seller)

| Field | Type | Constraints | Notes |
| :---- | :---- | :---- | :---- |
| `id` | UUID | Primary key | Auto-generated |
| `bid_workspace_id` | UUID | FK → Bid Workspace | Parent bid |
| `phase_id` | Integer | 1–12 | Buyer phase (informational) |
| `phase_name` | String | Max 100 chars | Buyer phase name (denormalized) |
| `actual_start_date` | Date | ISO format | When this phase actually started (nullable until phase starts) |
| `planned_end_date` | Date | ISO format | When this phase should end (per buyer timeline) |
| `actual_end_date` | Date | ISO format | When this phase actually ended (nullable until phase ends) |
| `milestone_title` | String | Max 200 chars | Key deliverable for this phase (e.g., "RFP Submission", "Demo Scheduling") |
| `notes` | String | 0–1000 chars | Internal notes on phase progress |
| `created_at` | Timestamp | Immutable | UTC |
| `updated_at` | Timestamp | Auto-updated | UTC |

---

## 4.5 Marketplace Entities {#4.5-marketplace-entities}

### 4.5.1 Marketplace Listing (Marketplace Domain, Public)

| Field | Type | Constraints | Notes |
| :---- | :---- | :---- | :---- |
| `id` | UUID | Primary key | Auto-generated |
| `org_id` | UUID | FK → Organization | Seller's organization |
| `seller_profile_id` | UUID | FK → Seller Profile | Link to Seller Profile |
| `title` | String | 1–200 chars | Product/service name |
| `slug` | String | 3–100 chars, lowercase, unique | URL-safe identifier |
| `tagline` | String | 0–200 chars | Short pitch |
| `description` | String | 0–5000 chars | Full product description |
| `category` | Enum | `erp` | `crm` | `hrms` | `analytics` | `supply_chain` | `integration` | `other` | Product category |
| `sub_category` | String | Max 100 chars | Sub-category (e.g., "Accounts Payable" under ERP) |
| `logo_url` | String | Valid HTTPS URL | Product logo |
| `hero_image_url` | String | Valid HTTPS URL | Hero/banner image |
| `pricing_model` | Enum | `subscription` | `consumption` | `perpetual` | `custom` | Pricing type |
| `pricing_description` | String | 0–1000 chars | Pricing details |
| `min_price_usd_monthly` | Decimal | \>= 0 | Minimum monthly cost (null if custom/TBD) |
| `max_price_usd_monthly` | Decimal | \>= min\_price | Maximum monthly cost |
| `status` | Enum | `draft` | `published` | `archived` | `removed` | Listing state (see Gap 3.7) |
| `published_at` | Timestamp | Nullable | When listing went public |
| `feature_highlights` | Array\[String\] | Max 10 items | Top 3–5 features |
| `integrations` | Array\[String\] | Integration names | e.g., \["Salesforce", "SAP", "Oracle"\] |
| `certifications` | Array\[String\] | Cert names | e.g., \["SOC2", "ISO27001"\] |
| `languages_supported` | Array\[String\] | ISO 639-1 codes | e.g., \["en", "es", "fr"\] |
| `video_url` | String | Valid HTTPS URL | Demo/overview video (optional) |
| `documentation_url` | String | Valid HTTPS URL | Help/documentation link |
| `created_at` | Timestamp | Immutable | UTC |
| `updated_at` | Timestamp | Auto-updated | UTC |
| `created_by` | UUID (FK) | Seller User ID | Creator |
| `deleted_at` | Timestamp | Nullable | Soft delete |

### 4.5.2 EOI Record (Expression of Interest) (Marketplace Domain)

| Field | Type | Constraints | Notes |
| :---- | :---- | :---- | :---- |
| `id` | UUID | Primary key | Auto-generated |
| `marketplace_listing_id` | UUID | FK → Marketplace Listing | Product reference |
| `buyer_org_id` | UUID (FK) | Organization ID | Buyer expressing interest |
| `buyer_user_id` | UUID (FK) | User ID | Who submitted EOI |
| `eoi_status` | Enum | `draft` | `submitted` | `acknowledged` | `approved` | `rejected` | EOI lifecycle (see Gap 3.7) |
| `eoi_submitted_at` | Timestamp | Nullable | When EOI was sent to seller |
| `eoi_acknowledged_at` | Timestamp | Nullable | When seller acknowledged |
| `eoi_approved_at` | Timestamp | Nullable | When seller approved (move to RFI/RFP) |
| `eoi_rejected_at` | Timestamp | Nullable | When seller declined |
| `rejection_reason` | String | 0–500 chars | If rejected, why |
| `estimated_contract_value_usd` | Decimal | \>= 0 | Buyer's estimated spend |
| `estimated_implementation_timeline_days` | Integer | \>= 0 | Expected go-live in days |
| `created_at` | Timestamp | Immutable | UTC |
| `updated_at` | Timestamp | Auto-updated | UTC |
| `created_by` | UUID (FK) | Buyer User ID | Creator |

### 4.5.3 NDA Record (Marketplace Domain)

| Field | Type | Constraints | Notes |
| :---- | :---- | :---- | :---- |
| `id` | UUID | Primary key | Auto-generated |
| `buyer_org_id` | UUID | FK → Organization | Buyer's organization |
| `seller_org_id` | UUID | FK → Organization | Seller's organization |
| `nda_status` | Enum | `draft` | `pending_buyer` | `pending_seller` | `executed` | `expired` | NDA lifecycle (see Gap 3.7) |
| `nda_type` | Enum | `mutual` | `unilateral_buyer` | `unilateral_seller` | NDA type |
| `nda_document_url` | String | Valid HTTPS URL | NDA document (PDF or link) |
| `nda_issued_by` | Enum | `buyer` | `seller` | `marketplace` | Who provided template |
| `nda_issued_at` | Timestamp | UTC | When NDA created |
| `nda_signed_by_buyer` | Boolean | Default: false | Buyer signature status |
| `nda_buyer_signed_at` | Timestamp | Nullable | Buyer signature timestamp |
| `nda_buyer_signatory_email` | String | Valid email | Who signed for buyer |
| `nda_signed_by_seller` | Boolean | Default: false | Seller signature status |
| `nda_seller_signed_at` | Timestamp | Nullable | Seller signature timestamp |
| `nda_seller_signatory_email` | String | Valid email | Who signed for seller |
| `nda_expires_at` | Timestamp | Nullable | When NDA expires |
| `custom_terms` | JSON | Max 5000 chars | Custom NDA modifications |
| `created_at` | Timestamp | Immutable | UTC |
| `updated_at` | Timestamp | Auto-updated | UTC |
| `created_by` | UUID (FK) | User ID | Creator (buyer or seller) |

---

## 4.6 Audit & Logging Entities {#4.6-audit-&-logging-entities}

### 4.6.1 Audit Event (Org-Scoped)

| Field | Type | Constraints | Notes |
| :---- | :---- | :---- | :---- |
| `id` | UUID | Primary key | Auto-generated |
| `org_id` | UUID | FK → Organization | Organization reference |
| `timestamp` | Timestamp | Immutable | UTC; event time |
| `user_id` | UUID (FK) | User ID | Who performed action |
| `action` | Enum | `create` | `read` | `update` | `delete` | `export` | `share` | `escalate` | Action type |
| `entity_type` | Enum | `workspace` | `use_case` | `requirement` | `response` | `score` | `team` | `user` | `marketplace_listing` | What was acted upon |
| `entity_id` | UUID | Resource ID | Which entity |
| `changes` | JSON | Max 10000 chars | {field: {old\_value, new\_value}, ...} for updates |
| `ip_address` | String | IP or masked | Client IP |
| `user_agent` | String | Max 1000 chars | Browser/client info |
| `status` | Enum | `success` | `failure` | Action outcome |
| `failure_reason` | String | Max 500 chars | If failed, why |
| `notes` | String | Max 2000 chars | Additional context |

---

# 5\. RBAC (Role-Based Access Control) {#5.-rbac-(role-based-access-control)}

## 5.1 RBAC Architecture {#5.1-rbac-architecture}

Sourcera implements role-based access control at two levels:

1. **Org-Level Roles:** Govern access to organization-scoped resources (members, teams, billing, org settings).  
2. **Console-Level Roles:** Govern access to console-scoped resources (workspaces, requirements, bids, marketplace).

Each user can hold multiple roles across different orgs and workspaces. Guest roles are workspace-scoped and configurable with permission profiles.

## 5.2 Org-Level Roles {#5.2-org-level-roles}

| Role | Permissions | Capabilities |
| :---- | :---- | :---- |
| **Org Owner** | All org-scoped resources | Create/edit/delete orgs, create/delete workspaces, manage team members, manage billing, manage SSO, view audit logs, manage integrations |
| **Org Admin** | All org-scoped resources except billing | Create/delete workspaces, manage team members, manage SSO, view audit logs, manage integrations (cannot change plan, cannot manage billing) |
| **Member** | Limited org-scoped visibility | View team membership, view shared team resources (no org management) |

## 5.3 Console-Level Roles (Buyer Console) {#5.3-console-level-roles-(buyer-console)}

| Role | Workspace-Scoped | Responsibilities | Accessible Features |
| :---- | :---- | :---- | :---- |
| **Workspace Owner** | Yes | Own & manage workspace, decide on vendors, final approval | Full access to all workspace resources, configuration, team management, phase transitions |
| **Evaluation Lead** | Yes | Oversee evaluation timeline, coordinate scorers, escalate issues | Full access to requirements, responses, scores, phase management (cannot delete workspace) |
| **Evaluator** | Yes | Author requirements, review responses, score requirements, attend demos | Create/edit/delete requirements in assigned Use Cases, score (Phases 10–11), view responses, comment |
| **Scorer** | Yes | Score vendor responses, provide rationale | View requirements and responses, score (Phases 10–11), add score notes, cannot edit requirements |
| **Guest** | Yes | Limited, configurable via Guest Permission Profile | See 5.4 |

## 5.4 Guest Role & Permission Profiles (Gap S-2) {#5.4-guest-role-&-permission-profiles-(gap-s-2)}

Guest is a **workspace-specific role** with **configurable permission profiles** assigned at invitation time. When inviting a Guest to a workspace, the Workspace Owner selects one of four permission profiles:

### 5.4.1 Guest Permission Profile: `read_only`

**Default profile. Maximum restrictions.**

| Capability | Allowed | Notes |
| :---- | :---- | :---- |
| View workspace name, description, phase | Yes | Read-only |
| View Use Cases (assigned only) | Yes | If in `assigned_use_case_ids` |
| View requirements (assigned only) | Yes | If Use Case assigned |
| View vendor responses | Yes | Read-only; assigned requirements only |
| View scores | Yes | Read-only summary; no individual scorer details |
| View Selection Report | No | Report access restricted to Workspace Owner only |
| Create/edit requirements | No |  |
| Delete requirements | No |  |
| Score requirements | No |  |
| Edit workspace settings | No |  |
| Manage team members | No |  |
| Export evaluation | No |  |
| View audit log | No |  |
| View/resolve comments | Yes | Can view and reply to comments; cannot delete others' comments |
| Add comments | Yes | Can comment on assigned requirements |

### 5.4.2 Guest Permission Profile: `contributor`

**Allows requirement authorship within assigned Use Cases.**

| Capability | Allowed | Notes |
| :---- | :---- | :---- |
| (Includes all from `read_only`) | Yes |  |
| Create requirement in assigned Use Case | Yes | Must belong to assigned Use Cases |
| Edit requirement (own or any) | Yes | Within assigned Use Cases |
| Delete requirement (own only) | Yes | Within assigned Use Cases |
| View workspace configuration | Yes | Read-only |
| Score requirements | No | Use `scorer` profile for this |
| View Selection Report | No |  |
| Manage settings | No |  |

### 5.4.3 Guest Permission Profile: `scorer`

**Allows requirement scoring only; no authorship.**

| Capability | Allowed | Notes |
| :---- | :---- | :---- |
| (Includes all from `read_only`) | Yes |  |
| Score requirements (Phases 10–11) | Yes | Cannot score before Phase 10 |
| Score requirements after Phase 11 (Phase 12\) | No | Scores locked at Phase 12 entry |
| Add score notes | Yes | Notes help explain scoring rationale |
| View score history | Yes | Limited to own scores and aggregated results |
| Create/edit requirements | No |  |
| Delete requirements | No |  |
| View Selection Report | No |  |

### 5.4.4 Guest Permission Profile: `full_participant`

**Combines contributor \+ scorer; maximum guest capability.**

| Capability | Allowed | Notes |
| :---- | :---- | :---- |
| (Includes all from `contributor` \+ `scorer`) | Yes |  |
| View Selection Report | Yes | Can view final recommendation and rationale |
| Manage comments (own only) | Yes | Can edit/delete own comments |
| Export evaluation (limited) | Yes | Can export as PDF/CSV (not sensitive metadata) |
| (Workspace management, audit logs, etc.) | No | Still cannot manage workspace or see admin features |

### 5.4.5 Guest Scope Isolation

- **Use Case Scoping:** Guests assigned to specific Use Cases see only those Use Cases and their requirements (if assigned).  
- **Empty Assignment:** If `assigned_use_case_ids` is empty, guest can see all Use Cases and requirements (full visibility within permission profile).  
- **Workspace Isolation:** Guests cannot see other workspaces in the org; invitation is workspace-specific.  
- **Cross-Org:** Guest is always a single-org guest; cannot access other org workspaces.

---

## 5.5 Console-Level Roles (Seller Console) {#5.5-console-level-roles-(seller-console)}

| Role | Bid-Workspace-Scoped | Responsibilities | Accessible Features |
| :---- | :---- | :---- | :---- |
| **Bid Owner** | Yes | Own & manage bid workspace, assign team, track responses, interface with buyer | Full access to Bid Workspace, Bid Tasks, Bid Responses, Team management (see Section 2.7 for term definition) |
| **Bid Contributor** | Yes | Complete assigned bid responses, collaborate with team | Create/edit Bid Responses assigned to them, view team collaboration, cannot manage workspace or team |
| **Bid Viewer** | Yes | Track bid status, provide feedback | View Bid Responses (read-only), view Bid Tasks, cannot edit or score (Seller-side; scoring is Buyer-side) |

---

## 5.6 Marketplace Roles {#5.6-marketplace-roles}

| Role | Scope | Responsibilities | Access |
| :---- | :---- | :---- | :---- |
| **Marketplace Publisher** | Org-scoped | Create/edit Marketplace Listings, manage Seller Profile | Full access to Seller Profile, Capability Declarations, Marketplace Listings, EOI/NDA records |
| **Marketplace Viewer** | Global | Browse public listings, submit EOI | View published Marketplace Listings, search, filter, submit EOI, no edit access |

---

## 5.7 Scoring Availability (Gap 4.2, Gap 4.3) {#5.7-scoring-availability-(gap-4.2,-gap-4.3)}

**Critical Requirement:** Scoring is available in Phases 10 and 11\. Scores lock at Phase 12 entry.

| Phase | Activity | Scoring Allowed? | Score State |
| :---- | :---- | :---- | :---- |
| 1–9 (Planning, RFI, RFP, Responses, Demos) | Gathering information | No | N/A |
| **10 (Primary Scoring)** | Structured evaluation | **Yes** | Mutable; can be edited anytime in Phase 10 |
| **11 (Demo & Adjustments)** | Demo findings, score refinement | **Yes** | Mutable; can be edited anytime in Phase 11 |
| **12 (Close) onwards** | Selection, close | **No** | Immutable; locked at Phase 12 entry |

**Behavior:**

- Evaluators and Scorers can score any requirement during Phases 10–11.  
- At Phase 12 entry, all scores become immutable (locked=true, read-only in UI, API enforces).  
- Attempting to edit a locked score results in: "Scores are locked in the Close phase. Unlock requires Workspace Owner approval."  
- Workspace Owner can unlock a single score (rare) but unlock triggers audit event and requires written justification.

---

## 5.8 Policy Ingestion Availability (Gap 4.3) {#5.8-policy-ingestion-availability-(gap-4.3)}

**Critical Requirement:** Policy Ingestion is available from Phase 1 day 1 with no prerequisites.

- Policy Ingestion (uploading knowledge base entries, compliance policies, vendor docs) can begin immediately upon workspace creation.  
- No gating on phases or prior evaluations.  
- Enables parallel preparation while other teams work on Use Cases / Requirements.

---

## 5.9 Executive Sponsor (Gap S-7) {#5.9-executive-sponsor-(gap-s-7)}

**Definition:** Executive Sponsor is an **informal persona**, not an RBAC role. It is typically the Org Owner or Org Admin who receives escalation alerts via Evaluation Pulse.

**Behavior:**

- Any Evaluation Lead can escalate an issue to the Executive Sponsor (see Section 6, Evaluation Pulse).  
- Escalation sends notification and adds Executive Sponsor to audience for that Pulse event.  
- Executive Sponsor is not a formal role in the system; governance is via audience designation on Pulse events.

---

## 5.10 Active Workspace Definition (Gap S-7) {#5.10-active-workspace-definition-(gap-s-7)}

**Definition:** An "Active Workspace" is one that meets BOTH criteria:

1. `status = active` (not draft, closed, or archived)  
2. `pipeline_stage_id < 13` (not in Archived phase; Phases 1–12 are active)

**Usage:** Used in reporting (active vs. total workspaces), timeline forecasting, and Active Workspace KPI dashboards.

---

## 5.11 Feature Access Matrix (Comprehensive) {#5.11-feature-access-matrix-(comprehensive)}

This matrix shows which roles can perform which actions across all major features. "✓" \= allowed; "✗" \= denied; "∈ scope" \= depends on assigned Use Cases or Grant.

| Feature | Org Owner | Org Admin | Workspace Owner | Workspace Admin | Use Case Lead | Reviewer | Guest (read\_only) | Guest (contributor) | Guest (scorer) | Guest (full\_participant) |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| **Workspace Management** |  |  |  |  |  |  |  |  |  |  |
| Create workspace | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| Edit workspace settings | ✓ | ✗ | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| Transition phase | ✓ | ✗ | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| Delete workspace | ✓ | ✗ | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| **Use Case Management** |  |  |  |  |  |  |  |  |  |  |
| Create use case | ✓ | ✗ | ✓ | ✓ | ✓ | ✗ | ✗ | ∈ scope | ✗ | ∈ scope |
| Edit use case | ✓ | ✗ | ✓ | ✓ | ✓ | ✗ | ✗ | ∈ scope | ✗ | ∈ scope |
| Delete use case | ✓ | ✗ | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| View use case | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ∈ scope | ∈ scope | ∈ scope | ∈ scope |
| **Requirement Management** |  |  |  |  |  |  |  |  |  |  |
| Create requirement | ✓ | ✗ | ✓ | ✓ | ✓ | ✗ | ✗ | ∈ scope | ✗ | ∈ scope |
| Edit requirement | ✓ | ✗ | ✓ | ✓ | ✓ | ✗ | ✗ | ∈ scope | ✗ | ∈ scope |
| Delete requirement | ✓ | ✗ | ✓ | ✓ | ✗ | ✗ | ✗ | ∈ scope (own only) | ✗ | ∈ scope (own only) |
| View requirement | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ∈ scope | ∈ scope | ∈ scope | ∈ scope |
| **Scoring** |  |  |  |  |  |  |  |  |  |  |
| Score requirement (Phase 10–11) | ✗ | ✗ | ✓ | ✓ | ✓ | ✓ | ✗ | ✗ | ✓ | ✓ |
| Lock score (Workspace Owner, Phase 12\) | ✓ | ✗ | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| View score history | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ (own) | ✗ | ✗ | ✓ (own) | ✓ |
| **Response Management** |  |  |  |  |  |  |  |  |  |  |
| View vendor response | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| **Comments & Collaboration** |  |  |  |  |  |  |  |  |  |  |
| Add comment | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Edit comment (own) | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Delete comment (own) | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Delete comment (others) | ✓ | ✗ | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| **Team & Member Management** |  |  |  |  |  |  |  |  |  |  |
| Manage workspace team | ✓ | ✗ | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| Invite workspace guests | ✓ | ✗ | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| Manage guest permission profile | ✓ | ✗ | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| **Reporting & Analytics** |  |  |  |  |  |  |  |  |  |  |
| View Selection Report | ✓ | ✗ | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ | ✓ |
| View Efficiency Metrics | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ |
| Export evaluation | ✓ | ✗ | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ (limited) |
| View audit log | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |

---

## 5.12 Access Control Enforcement {#5.12-access-control-enforcement}

- **API-Level Enforcement:** All mutations and queries enforce RBAC at the Convex function level. No row-level data returned if user lacks access.  
- **UI-Level UX:** Features unavailable to role are hidden or disabled (not shown; no error message for security).  
- **Audit Logging:** All access (successful and failed) logged to Audit Event entity with user\_id, action, resource, timestamp, status.  
- **Permission Denied:** If user attempts unauthorized API call, 403 Forbidden returned (no details on reason).

---

---

# 6\. User Identity & Security {#6.-user-identity-&-security}

## 6.1 Authentication Architecture {#6.1-authentication-architecture}

Sourcera delegates authentication to WorkOS, supporting multiple authentication methods:

- **SSO (SAML 2.0)**: Enterprise Organizations only. WorkOS acts as SAML Service Provider.  
- **SCIM 2.0 Provisioning**: Enterprise Organizations only. WorkOS acts as SCIM Service Provider for user lifecycle automation.  
- **Email \+ Password (Guest Exemption)**: All users including guests who bypass SSO. WorkOS manages credential storage and verification.

### 6.1.1 WorkOS Configuration

- All authentication flows route through WorkOS API and WorkOS-managed UI  
- Sourcera stores WorkOS Organization ID and connection metadata per Sourcera Organization  
- Guest users (exempted from SSO requirements) authenticate via email+password through WorkOS  
- WorkOS provides identity claims to Sourcera via OpenID Connect token upon successful authentication

## 6.2 Multi-Factor Authentication (MFA) {#6.2-multi-factor-authentication-(mfa)}

MFA availability is plan-tier dependent. Supported methods: **TOTP (Time-based One-Time Password) and WebAuthn only**. SMS is not supported.

### 6.2.1 MFA Availability by Plan

| Plan | Availability | Enforcement |
| :---- | :---- | :---- |
| Free | Not available | N/A |
| Business | Optional, user-controlled enrollment | Organization Admin cannot require MFA |
| Enterprise | Optional enrollment; Org Admin can require for all users | Org Admin may enforce MFA requirement; applies on next login |

### 6.2.2 MFA Enrollment & Enforcement

**Free Tier Restriction:**

- Schema field `users.mfa_enabled` exists on all user records  
- Enrollment endpoint returns HTTP 403 Forbidden with error code `plan_upgrade_required` if user's Organization is on Free plan  
- Free-tier users cannot access MFA settings in UX  
- No automatic MFA is applied during Free-to-Business upgrade

**Business Tier:**

- Users may enroll in TOTP or WebAuthn at any time via Settings → Security  
- Org Admin cannot enforce MFA organization-wide  
- If user has MFA enabled, they are prompted for second factor on login

**Enterprise Tier:**

- Users may enroll in TOTP or WebAuthn  
- Organization Admin may enable `mfa_enforcement_required` flag on the Organization record  
- If enforcement is enabled, all users without MFA receive in-app notification: "Your organization requires multi-factor authentication. Enroll now."  
- Users with MFA already enabled are unaffected  
- Users without MFA are prompted to enroll on next login; cannot access Sourcera until enrolled  
- No grace period; enforcement takes effect immediately

### 6.2.3 MFA State Transitions on Plan Changes

**Downgrade (Business → Free or Enterprise → Business):**

- Existing MFA enrollments are preserved in the database  
- `users.mfa_enabled` remains true  
- If user has MFA enrolled, they remain prompted for second factor on login  
- If Organization downgrade removes MFA enforcement, `mfa_enforcement_required` flag is set to false  
- MFA enrollment is never forcibly disabled or revoked

**Upgrade (Free → Business, Business → Enterprise, or Free → Enterprise):**

- Existing MFA enrollments (if any) remain active  
- If Enterprise MFA enforcement is enabled, users without MFA are prompted to enroll on next login  
- No automatic enrollment is performed

### 6.2.4 MFA Method Details

**TOTP:**

- Sourcera integrates with WorkOS MFA TOTP support  
- User scans QR code or enters shared secret into authenticator app (Google Authenticator, Authy, Microsoft Authenticator, etc.)  
- 30-second window, standard 6-digit code  
- Recovery codes: 10 single-use codes generated at enrollment, user must securely store  
- No server-side code retry limits; WorkOS handles rate limiting

**WebAuthn:**

- FIDO2 hardware security keys (YubiKey, etc.) and platform authenticators (Windows Hello, Touch ID, Face ID)  
- User registers device during enrollment  
- Multi-device support: user may register multiple keys  
- Sourcera relies on WorkOS WebAuthn implementation

## 6.3 Session Management {#6.3-session-management}

All sessions created through WorkOS authentication.

### 6.3.1 Session Duration & Timeout

| Configuration | Free | Business | Enterprise |
| :---- | :---- | :---- | :---- |
| Session Duration | 24 hours | 24 hours | 24 hours (configurable by Org Admin, 12-72h) |
| Idle Timeout | 2 hours | 2 hours | 2 hours (configurable by Org Admin, 30min-4h) |
| Concurrent Sessions | Unlimited | Unlimited | Unlimited |

**Definition of Idle:** No API request, WebSocket activity, or UI interaction.

**Session Expiration Behavior:**

- Expired session redirects user to login  
- In-flight requests (XHR/Fetch) receive HTTP 401 Unauthorized with error code `session_expired`  
- User loses unsaved work in-memory; local drafts in browser storage are preserved  
- User may immediately re-authenticate to resume work

**Session Logout:**

- User clicks Sign Out  
- Sourcera invalidates session token with WorkOS  
- User redirected to login page  
- All tabs/windows are signed out immediately (via SharedWorker or localStorage events)

## 6.4 Domain Governance {#6.4-domain-governance}

Enterprise Organizations only.

### 6.4.1 Domain Claiming & Verification

- Organization Admin may declare a custom domain (e.g., `acme.com`) in Organization Settings  
- System performs DNS TXT record verification: Sourcera generates a random verification token and requires admin to place `sourcera-verification=[token]` in DNS  
- Admin provides DNS record; system queries and validates  
- Verification succeeds: domain is marked `verified` and linked to Organization  
- Once verified, all new WorkOS Invitations issued to email addresses with this domain are automatically assigned to this Organization (instead of user being prompted to select Organization during signup)

**Edge Cases:**

- If domain is claimed by multiple Organizations, first to verify is owner; others receive `domain_already_claimed` error  
- Domain verification persists across plan changes  
- Admin may remove domain claim at any time  
- Upon domain removal, users already in Organization remain; future invitations to that domain are not auto-assigned

## 6.5 Guest Users & SSO Bypass {#6.5-guest-users-&-sso-bypass}

- Organizations may invite guest users who are not part of the Organization's SSO/SCIM directory  
- Guest invitation flow: Organization Admin invites email → Sourcera creates user record with `guest=true` flag  
- Guest user receives WorkOS email+password authentication link (bypasses SSO)  
- Guest user signs in via email+password, MFA optional if plan supports it  
- Guest user can collaborate in Bid Workspaces, Teams, and other shared features  
- Guest users are not synced via SCIM and not subject to SCIM deprovisioning  
- Guest access may be revoked by Organization Admin, triggering account deactivation

## 6.6 API Token Authentication {#6.6-api-token-authentication}

API tokens allow programmatic access to Sourcera API. Tokens are plan-tier limited.

### 6.6.1 Token Format & Generation

- Token format: `srck_[org_id_prefix]_[32_character_random_alphanumeric]`  
  - Example: `srck_acm_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`  
- Tokens generated via API or Settings → API Tokens  
- Sourcera never displays token value after initial creation; user must copy immediately  
- Token storage: hashed in database, never stored in plain text

### 6.6.2 Token Limits by Plan

| Plan | Max Active Tokens |
| :---- | :---- |
| Free | 1 |
| Business | 5 |
| Enterprise | 25 |

Attempting to create a token exceeding plan limit returns HTTP 402 with error code `plan_limit_exceeded`.

### 6.6.3 Token Permissions & Scoping

- Tokens inherit the full RBAC permissions of the user who created them (see Section 5\)  
- Tokens are scoped to the Organization that created them; cannot access other Organizations  
- Tokens support optional scope restriction:  
  - `bidding:write` — Create/update/cancel Bid Workspaces and related entities  
  - `evaluation:read` — Read evaluation phases, scores, requirements  
  - `scoring:write` — Submit and update vendor response scores  
  - `responses:read` — Read vendor responses  
  - `analytics:read` — Read Organization and Team analytics endpoints  
- If scopes are defined, token has minimum permissions of the specified scopes AND the creating user's role  
- Tokens do not support row-level filtering; they access all data the user can access

### 6.6.4 Token Lifecycle

- Token creation logs audit event with user identity  
- Organization Admin may revoke any token issued by any user  
- Token revocation is immediate; in-flight requests complete, new requests rejected HTTP 401 with error code `token_revoked`  
- Token may include optional expiration date (default: no expiration)  
- Expired tokens return HTTP 401 with error code `token_expired`  
- Each API call increments a token `last_used_at` timestamp (updated asynchronously, eventual consistency)

## 6.7 Audit Logging {#6.7-audit-logging}

All mutations in Sourcera are logged immutably. Audit logs cannot be modified or deleted by any user; only append operations are allowed.

### 6.7.1 Audit Log Scope

Logged mutations include:

- User account changes (profile, role, MFA, deprovisioning)  
- Organization settings changes (name, logo, SSO, SCIM, domain, MFA enforcement, IP allowlist)  
- Team creation, configuration, deletion  
- Requirement creation, amendment, phase advance, cancellation  
- Vendor response creation, score submission, amendment  
- Bid Workspace creation, invitation, status change  
- Use Case changes  
- Scenario creation, update  
- Marketplace Listing publication, unpublication  
- Payment/billing events (plan change, invoice issued)  
- API token creation, revocation  
- SCIM provisioning/deprovisioning events  
- Webhook subscription creation, deletion, failure events

Excluded from audit logs:

- Read-only operations (view, search, export)  
- Non-functional events (UI navigation, failed login attempts)  
- Internal system operations (background jobs, cache invalidation)

### 6.7.2 Audit Log Structure

Each audit log entry contains:

- `id`: UUID  
- `timestamp`: ISO 8601, UTC  
- `organization_id`: Org where event occurred  
- `user_id`: Null if system-initiated (e.g., SCIM sync, scheduled job)  
- `action`: Machine-readable code (e.g., `user_created`, `requirement_amended`, `phase_advanced`)  
- `resource_type`: Entity type (e.g., `User`, `Requirement`, `Score`)  
- `resource_id`: Entity being modified  
- `changes`: Before/after object showing specific field changes (null values omitted)  
- `ip_address`: Client IP (if user-initiated)  
- `api_token_id`: If action via API token, hashed token ID

### 6.7.3 Retention Policy by Plan

| Plan | Retention Duration | Retention Mechanism |
| :---- | :---- | :---- |
| Free | 30 days | Automatic deletion after 30 days |
| Business | 1 year | Automatic deletion after 1 year |
| Enterprise | 7 years | Automatic deletion after 7 years; longer available via data residency agreement |

Retention period begins from audit log creation timestamp. Deletion is automatic and irreversible.

### 6.7.4 Audit Log Access

- Organization Admin may export audit logs via Settings → Audit Logs  
- Export includes CSV and JSON formats, all logs within retention window  
- Export is paginated (max 10,000 rows per request)  
- Each export is logged as an audit event `audit_logs_exported`  
- Workspace Owner may view audit logs for their Bid Workspace via Workspace Settings → Audit  
- Team Owner may view team-specific audit logs via Team Settings → Audit

## 6.8 Data Privacy & GDPR Compliance {#6.8-data-privacy-&-gdpr-compliance}

Sourcera implements GDPR Article 15 (Right of Access), Article 17 (Right to Erasure), and related provisions.

### 6.8.1 Right of Access (Data Export)

Any user may request a complete export of their personal data via Settings → Privacy → Request Data Export.

**Data Included in Export:**

- User profile (name, email, avatar, preferences)  
- All Bid Workspaces where user is Workspace Owner or invited participant  
- All Requirements, Use Cases, Scenarios, and Responses the user created or edited  
- All Comments and Discussion threads the user participated in  
- All Scores submitted by the user  
- All Team memberships and roles  
- Organization membership record  
- Audit log entries listing the user as actor  
- NDA records the user signed  
- Marketplace Listings the user created (seller side)  
- Vendor Profile the user manages (seller side)

**Export Delivery:**

- Export is generated asynchronously  
- User receives email with secure download link valid for 7 days  
- Export format: JSON with nested structure, includes anonymized references to other users  
- User may request export multiple times; each generates a fresh export

**Exclusions:**

- Data owned by Organization but authored by other users (not included in personal export; available via Organization Admin data export)  
- Audit logs showing other users' actions (visible to Organization Admin only)  
- Comments/responses from other users (included as they relate to the requesting user's work, but personal data of commenters is not exposed)

### 6.8.2 Right to Erasure (Anonymization on Deprovisioning)

When a user is deprovisioned (see Section 6.9), the following erasure rules apply:

**User Comments & Discussion Responses (Anonymization):**

- All comments, discussion replies, and feedback authored by the deprovisioned user are retained but anonymized  
- `user_id` is set to null; `author_name` replaced with `[Anonymized User]`  
- Timestamp and content text preserved for context and audit trail  
- Acceptance criteria: Comments remain visible in threads but author is unidentifiable

**Score Submissions (Withdrawal):**

- All scores authored by the deprovisioned user that are still pending (Phase 10-11) are marked with status `withdrawn`  
- Withdrawn scores no longer count toward aggregate scoring; replacement score must be submitted by replacement user  
- Score history remains in audit log but is marked as `withdrawn`

**Audit Log Redaction:**

- Audit log entries where the deprovisioned user is the actor have `user_id` set to null  
- Action and resource details preserved; user identity removed  
- Retention of redacted audit logs follows plan-tier policy (Section 6.7.3)

**Account Status:**

- User record `status` field set to `deprovisioned`  
- Account cannot be reactivated; new account must be created if user rejoins Organization  
- User cannot sign in; login attempt returns `account_deprovisioned` error  
- User cannot be queried by name in user search; deprovisioned users are hidden from UI

**Organization-Owned Data Retention:**

- All Requirements, Use Cases, Scenarios, Bid Workspaces, and Marketplace Listings created by deprovisioned user are retained by Organization  
- Ownership is reassigned to Workspace Owner, Use Case Lead, or default admin user (see Section 6.9 for details)  
- This data is not deleted or anonymized; it is Organization-owned intellectual property

### 6.8.3 Right to Erasure (Complete Deletion on Account Closure)

If a user requests complete account closure (separate from deprovisioning), the following applies:

- Deprovisioning rules (Section 6.8.2) are applied first  
- User record may then be marked for complete deletion (after 30-day GDPR reflection period)  
- Complete deletion removes user record entirely; account cannot be recovered  
- All personal data tied solely to the user (preferences, avatar, etc.) is deleted  
- Organization-owned data remains

---

# 7\. Organization & Administration {#7.-organization-&-administration}

## 7.1 Organization Lifecycle {#7.1-organization-lifecycle}

An Organization represents a legal entity or business unit using Sourcera as a Buyer or Seller.

### 7.1.1 Organization Creation

- Organization is created when first user from a company signs up via Sourcera  
- System detects domain from user email (e.g., `@acme.com` → Organization name `Acme`)  
- Founder is assigned role Organization Admin  
- New Organization starts on Free plan  
- Founder receives welcome email with onboarding guide

**Acceptance Criteria:**

- Organization record created with status `active`  
- Organization Admin is assigned initial settings defaults (MFA enforcement disabled, no IP allowlist, no custom domain)  
- Organization appears in user's Organization switcher

### 7.1.2 Organization Settings

Organization Admin may modify the following Organization settings:

| Setting | Type | Default | Notes |
| :---- | :---- | :---- | :---- |
| Name | Text (255 char) | Auto-detected from domain | May be updated anytime |
| Logo | Image (PNG/SVG, max 5MB) | Sourcera default | Used in Marketplace, emails, billing portal |
| Billing Email | Email | Founder email | Receives invoices and payment notifications |
| Primary Domain | Custom domain | None | Used for SSO/SCIM configuration (see Section 6.4) |
| SSO Connection | WorkOS Connection ID | None | SAML configuration details, enterprise only |
| SCIM Endpoint | URL | Auto-generated | Enterprise only; URL for SCIM provisioning (see Section 6.9) |
| MFA Enforcement | Boolean | False | If enabled, all users required to enroll in MFA (enterprise only, see Section 6.2) |
| IP Allowlist | CIDR list | Empty | If populated, only users from these IP ranges can access Sourcera; blocks all other access |
| Default User Role | RBAC role | Reviewer | Role assigned to new users invited without explicit role |
| Audit Log Retention | Read-only | Plan-dependent | Displays current retention window (30d/1yr/7yr) |

**Audit Logging:**

- All setting changes are logged with `action=org_setting_updated` and `changes` showing before/after values  
- MFA enforcement changes are logged separately as `mfa_enforcement_changed`

### 7.1.3 Organization Deletion

Organization Admin may initiate Organization deletion. Deletion follows a 44-day process: 14-day grace period \+ 30-day processing.

**Phase 1: Deletion Initiation (Day 0\)**

- Admin clicks Settings → Organization → Delete Organization  
- System presents confirmation: "This action is irreversible. All data will be permanently deleted in 44 days. Your team has 14 days to cancel."  
- Admin confirms with password verification  
- Organization status changed to `deletion_scheduled`  
- `deletion_scheduled_at` timestamp recorded  
- Organization still fully functional during 14-day grace period  
- Organization remains hidden from new user invitations (existing members can still access)  
- Deletion initiation is logged as `org_deletion_initiated`

**Phase 2: Grace Period (Days 0-14)**

- All Organization functionality remains active  
- Admin may cancel deletion by visiting Settings → Organization → Cancel Deletion  
- Cancellation resets `deletion_scheduled` flag; Organization status returns to `active`  
- Cancellation is logged as `org_deletion_cancelled`  
- After Day 14 grace period expires, deletion cannot be cancelled

**Phase 3: Processing (Days 14-44)**

- Organization status changes to `deletion_in_progress` on Day 14  
- Cascade deletions execute immediately (see Section 7.2)  
- All Workspace and user data is purged  
- After 30-day processing window (Day 44), final purge of audit logs and backups occurs

### 7.2 Organization Deletion Cascade

When an Organization enters `deletion_in_progress` status, the following cascade occurs automatically:

**Marketplace Listings (Seller Side):**

- All Marketplace Listings published by any Team in the Organization are unpublished  
- Listing `status` set to `closed`  
- Sellers receiving the Listing may no longer respond to it  
- Listing remains visible in seller's historical view for 30 days, then purged

**Active Bid Workspaces in Other Organizations (Buyer Side):**

- For each Bid Workspace where the deleting Organization is the Vendor, the workspace `status` is set to `buyer_org_deleted`  
- Vendor's ability to submit new responses is blocked  
- Vendor's existing responses become read-only; vendor may view but not edit or delete  
- Buyer workspace continues normally; scoring and evaluation proceed  
- Buyer receives notification: "Vendor \[Organization Name\] has been deleted and can no longer respond. Existing responses are preserved."  
- This status persists indefinitely (even after 44-day processing); workspace remains in buyer's history

**NDA Records:**

- All NDA documents signed by users of the deleting Organization are preserved  
- NDA status remains `executed` and documents remain accessible to the other party (read-only)  
- No cascading NDA termination occurs

**Webhook Subscriptions:**

- All webhooks subscribed by the Organization are disabled immediately  
- Webhook `status` set to `disabled_org_deleted`  
- Failed event queue is purged  
- Cannot be re-enabled; must be manually recreated if Organization is recreated

**Active Users & Sessions:**

- All user sessions are invalidated immediately  
- Users receive "Organization has been deleted" message upon next access attempt  
- Users cannot sign back in; account is unusable

**Data Purge Timeline:**

- Day 14-44: Marketplace Listings, Bid Workspaces (buyer-side), active sessions purged  
- Day 44: All Requirements, Use Cases, Scenarios, Responses, Scores, Comments, audit logs, user accounts purged  
- Final backup purge occurs Day 45; no data recovery possible after this point

---

# 8\. Teams & Governance {#8.-teams-&-governance}

## 8.1 Team Architecture {#8.1-team-architecture}

Teams are Organization-scoped units that manage requirements (buyer side) or responses (seller side). Each Team has an explicit `console` property: `buyer` or `seller`.

### 8.1.1 Team Properties

| Property | Type | Notes |
| :---- | :---- | :---- |
| `id` | UUID | Immutable |
| `organization_id` | UUID | Team's parent Organization |
| `console` | Enum | `buyer` or `seller`; immutable once set |
| `name` | Text (255 char) | May be updated; must be unique within Organization |
| `description` | Text (1000 char) | Team purpose, displayed in UX |
| `status` | Enum | `active`, `soft_deleted` |
| `deleted_at` | ISO 8601 or null | Timestamp when soft-delete occurred |
| `recovery_available_until` | ISO 8601 or null | Soft-delete recovery expires 30 days after deletion |

A Team cannot be both buyer and seller; an Organization may have separate buyer and seller Teams.

### 8.1.2 Team Roles & Permissions

Each user assigned to a Team receives a Team-scoped role. Roles are:

**Team Owner**

- Full team management authority  
- Permissions:  
  - Add/remove team members  
  - Manage member roles (assign/revoke)  
  - Configure Team SLA settings (see Section 8.4)  
  - Write and edit Agent Instructions (see Section 8.5)  
  - Reassign Requirements across teams (buyer side)  
  - Reassign vendor responses across teams (seller side)  
  - Escalate SLA breaches manually  
  - View all team analytics and reporting  
  - View team audit logs  
  - Delete team (soft-delete; see Section 8.2)

**Team Lead**

- Day-to-day team operational authority  
- Permissions:  
  - Manage triage queue (assign, prioritize, move items between statuses)  
  - Approve Requirement assignments to team members  
  - Resolve triage queue items  
  - Escalate SLA breaches to Organization Admin if Team Owner unavailable  
  - View team analytics and reporting  
  - View team audit logs  
  - View Agent Instructions (read-only)  
  - Cannot modify Team SLA config  
  - Cannot add/remove team members  
  - Cannot write Agent Instructions

**Team Member**

- Task execution authority  
- Permissions:  
  - Score vendor responses in team domain (buyer side)  
  - Draft and refine vendor responses (seller side)  
  - Resolve triage queue items assigned to self  
  - View team triage queue (read-only)  
  - View Agent Instructions (read-only)  
  - Cannot manage membership  
  - Cannot access team settings  
  - Cannot view team analytics

**Acceptance Criteria:**

- Role checks enforced at API level; UI disables unauthorized actions  
- Permission inheritance from Organization-level roles (Section 5\) is superseded by Team-level role  
- If user is Organization Admin, they automatically have Team Owner permissions in all teams  
- If user is Team Owner but not Organization Admin, they can only manage their own team

## 8.2 Team Deletion & Recovery {#8.2-team-deletion-&-recovery}

Teams may be soft-deleted. Soft deletion prevents team from appearing in UI and assignment dropdowns while preserving audit trail and allowing recovery within 30 days.

### 8.2.1 Soft Deletion Constraint

Before a Team may be deleted, all Requirements owned by the Team must be reassigned to another Team or explicitly closed. This is a blocking constraint.

**Process:**

1. Team Owner clicks Settings → Team → Delete Team  
2. System checks: if Team owns any Requirements with status `active` or `pending`, return error: `cannot_delete_team_with_active_requirements`  
3. Error message lists all owned Requirements  
4. Team Owner must reassign each Requirement using Requirement → Transfer Team  
5. Only when all Requirements are reassigned may deletion proceed  
6. Team Owner confirms deletion with password  
7. Team `status` set to `soft_deleted`; `deleted_at` timestamp recorded

### 8.2.2 Triage Queue Behavior on Team Deletion

- All Triage Queue items owned by the Team move to Organization-level "Unassigned" queue  
- Items are no longer scoped to any team; any Team Lead across the Organization may claim them  
- Item assignment history shows: `[Team Name] > Unassigned (team deleted)`  
- Items retain their priority and due dates

### 8.2.3 Team SLA Configuration on Deletion

- Team's SLA config is archived (not deleted)  
- If Team is recovered (within 30 days), SLA config is restored  
- After 30-day recovery window expires, SLA config is purged along with soft-deleted team

### 8.2.4 UI Behavior for Soft-Deleted Teams

- Soft-deleted teams do not appear in Team switcher or Team list  
- Soft-deleted teams do not appear in Requirement assignment dropdowns  
- Soft-deleted teams do not receive triage queue items or SLA alerts  
- In audit logs and historical views, soft-deleted teams are still visible (with `[DELETED]` marker)

### 8.2.5 Recovery

Within 30 days of soft deletion, Team Owner or Organization Admin may recover the Team:

- Click Settings → Teams → Recover \[Team Name\]  
- System restores Team `status` to `active`; clears `deleted_at`  
- Triage Queue items in "Unassigned" queue remain unassigned (not auto-moved back)  
- SLA config is restored  
- Team reappears in UI and assignment dropdowns immediately  
- Recovery is logged as `team_recovered`

After 30 days, soft-deleted team is permanently purged.

## 8.3 Triage Queue Management {#8.3-triage-queue-management}

Both buyer and seller sides use Triage Queues to manage incoming work.

### 8.3.1 Buyer-Side Triage Queue

The buyer-side Triage Queue is the entry point for new Requirements before assignment to a Team Member.

**Queue Item Properties:**

- `id`: UUID  
- `requirement_id`: Reference to Requirement (or null for standalone triage items)  
- `team_id`: Null if Unassigned, or a Team ID  
- `assigned_to_user_id`: Null if unassigned within team  
- `status`: Enum  
  - `new`: Newly created, awaiting review  
  - `in_review`: Being evaluated by Team Lead  
  - `ready_for_scoring`: Approved for assignment; awaiting Team Member assignment  
  - `assigned`: Assigned to a Team Member  
  - `resolved`: Completed  
  - `archived`: Removed from active queue  
- `priority`: Enum (`critical`, `high`, `normal`, `low`)  
- `due_date`: ISO 8601 or null

**Queue Transitions:**

- New items appear as `new`  
- Team Lead reviews and approves → status `in_review`  
- Approved items transition to `ready_for_scoring`  
- Team Lead or Team Member assigns to specific member → status `assigned`  
- Work completed → status `resolved` (automatic or manual)  
- After 7 days in `resolved`, item auto-archives → status `archived`

**SLA Tracking:**

- Items in `assigned` status have SLA timers (see Section 8.4)  
- If SLA threshold breached, item escalates to Team Owner with `escalated=true` flag  
- Team Owner is notified via in-app alert and email

### 8.3.2 Seller-Side Triage Queue

The seller-side Triage Queue is the entry point for incoming Requirements mapped from buyer evaluations.

**Queue Item Properties (Seller):**

- `id`: UUID  
- `requirement_id`: Reference to the buyer's Requirement (read-only reference)  
- `team_id`: Seller Team responsible for responding  
- `assigned_to_user_id`: Seller Team Member assigned to draft response  
- `status`: Enum  
  - `new`: Incoming requirement not yet triaged  
  - `in_review`: Team Lead evaluating fit  
  - `assigned`: Assigned to Team Member to draft response  
  - `response_submitted`: Vendor response submitted to buyer  
  - `resolved`: Buyer closed evaluation  
- `priority`: `critical`, `high`, `normal`, `low` (inherited from buyer Requirement or manually set by seller)  
- `due_date`: Inherited from buyer Requirement Phase 6 deadline

**Buyer Visibility:**

- Seller triage queue is internal to Seller Organization; Buyer does not see it  
- Buyer sees only the final Vendor Response once submitted (Phase 7\)

## 8.4 Team SLA Configuration {#8.4-team-sla-configuration}

Team Owner may configure Service Level Agreements (SLAs) for triage queue items.

### 8.4.1 SLA Timers

SLAs apply to items in `assigned` status. Timers reset upon state transition.

| SLA Metric | Default | Configurable | Definition |
| :---- | :---- | :---- | :---- |
| First Response Time | 24 hours | 1-72 hours | Time from item assignment to first action (comment, status change, or score submission) |
| Resolution Time | 5 business days | 1-30 calendar days | Time from assignment to `resolved` status |
| Escalation Alert | At 80% | 50-100% | Alert triggers when threshold reached |

### 8.4.2 SLA Breach & Escalation

- When an assigned item approaches escalation threshold (80% by default), Team Lead receives in-app notification  
- If SLA is breached (timer expires before resolution), item is marked `escalated=true` and Team Owner is notified  
- Team Owner may manually extend SLA (add time) via button in notification  
- Extension is logged with reason and added duration  
- Extending SLA does not reset the timer; new deadline is calculated from current time

**Escalation Notification:**

- In-app badge: "X items over SLA"  
- Email summary (once daily if items remain over SLA)  
- Escalation details include: item title, assigned member, time overdue, reason (optional)

### 8.4.3 SLA Configuration UI

Team Owner navigates to Team Settings → SLA Configuration and adjusts:

- First Response Time threshold  
- Resolution Time threshold  
- Escalation alert percentage

Changes take effect immediately for new items. Existing items retain SLA calculated at assignment time.

## 8.5 Agent Instructions {#8.5-agent-instructions}

Agent Instructions are scoped, versioned guidelines for AI scoring agents and response drafting agents. Team Owner writes instructions (max 2000 characters).

### 8.5.1 Agent Instruction Properties

| Property | Type | Details |
| :---- | :---- | :---- |
| `id` | UUID | Immutable |
| `team_id` | UUID | Team that owns instruction |
| `version` | Integer | Increments on each save; starts at 1 |
| `content` | Text | Max 2000 characters; may include formatting (markdown) |
| `created_at` | ISO 8601 | When first instruction created |
| `updated_at` | ISO 8601 | When last updated |
| `updated_by_user_id` | UUID | User who made the most recent edit |
| `status` | Enum | `active` or `archived` |

### 8.5.2 Instruction Scope & Applicability

- Instructions apply to all scores submitted by the Team during Phases 10-11  
- Instructions are sandboxed: they influence only the Team's own scoring logic and AI-generated response drafts, not evaluation logic in other teams  
- Instructions are not visible to buyers; they are internal to the Team  
- Instructions may be updated at any time; changes apply to all new scores going forward  
- Historical scores retain the Instruction version used at scoring time (for audit trail)

### 8.5.3 Instruction Versioning

- Each save creates a new version  
- Version history is retained and queryable via API  
- Team Lead/Member may view instruction history but cannot edit  
- Team Owner may revert to previous version (creates new version with `reverted_from` metadata)  
- All versions are retained indefinitely for audit trail

### 8.5.4 Instruction Usage in Scoring

When a Team Member scores a vendor response:

1. System loads current `active` Agent Instruction (latest version)  
2. Instruction is injected into AI scoring prompt (if applicable)  
3. Instruction influences AI-suggested score and rationale  
4. Team Member may accept or override AI suggestion  
5. Final submitted score is logged with `instruction_version` for that Team

**Acceptance Criteria:**

- If no Agent Instruction exists, scoring proceeds without instruction context  
- Instruction text is never exposed to vendor; vendor cannot see Team Member's instructions  
- Instructions are not factored into score validation or immutability rules

---

# 9\. Seller Teams {#9.-seller-teams}

## 9.1 Seller Team Architecture {#9.1-seller-team-architecture}

Seller Teams mirror the buyer-side Team governance structure but focus on response management and capability declarations.

### 9.1.1 Seller Team Properties

| Property | Type | Notes |
| :---- | :---- | :---- |
| `id` | UUID | Immutable |
| `organization_id` | UUID | Seller Organization |
| `console` | Enum | Always `seller` |
| `name` | Text | e.g., "Cloud Solutions Team", "Enterprise Support" |
| `description` | Text | Team's expertise domain |
| `kb_category` | Text or null | Knowledge Base category managed by this team (e.g., "Cloud Infrastructure", "Support Services") |
| `status` | Enum | `active`, `soft_deleted` |

### 9.1.2 Seller Team Roles & Permissions

**Seller Team Owner**

- Permissions:  
  - Add/remove team members  
  - Assign members to specific vendor responses  
  - Configure Team KB category (e.g., which topics this team manages in the Knowledge Base)  
  - Configure Team SLA for response drafting (deadline for drafting vendor responses)  
  - View all responses managed by team  
  - View team analytics (response volume, average response quality, time-to-draft metrics)  
  - Approve AI-suggested responses before submission (when AI response generation enabled)  
  - Manage Knowledge Base entries within team KB category

**Seller Team Lead**

- Permissions:  
  - Manage triage queue for incoming Requirements (assign to team members)  
  - Approve AI-suggested responses before submission  
  - Escalate SLA breaches on response drafting  
  - View team analytics  
  - Cannot configure KB category  
  - Cannot manage team membership  
  - Cannot modify SLA settings

**Seller Team Member**

- Permissions:  
  - View Requirements mapped to team's triage queue  
  - Draft and refine Vendor Responses  
  - Maintain and refine Capability Declarations (see Section 9.2)  
  - Submit responses to buyer  
  - Resolve triage queue items assigned to self  
  - Cannot manage team membership or settings  
  - Cannot approve or override AI-suggested responses (unless also Team Lead)

## 9.2 Seller Triage Queue & Auto-Mapping {#9.2-seller-triage-queue-&-auto-mapping}

Requirements from buyer evaluations are automatically mapped to seller Teams via Triage Queue. Mapping is deterministic based on requirement characteristics.

### 9.2.1 Auto-Mapping Logic

When a buyer creates a Requirement and enters Phase 6 (Vendor Bidding Opens), the following occurs:

1. Requirement is published to Marketplace with metadata: labels, category, industry, region, compliance requirements  
2. Seller receives notification of new Requirement  
3. System auto-maps Requirement to Seller Team using:  
   - **Label Matching**: If Requirement labels match Seller Team's KB category, assign to that Team (high priority)  
   - **Historical Pattern Matching**: If Seller has previously responded to similar Requirements with high acceptance rate, assign to that Team (medium priority)  
   - **Fallback**: Assign to Seller's largest or "default" Team (low priority)

Mapping is logged with `action=requirement_auto_mapped` and includes mapping rationale.

### 9.2.2 Manual Remapping

Seller Team Owner may manually reassign the Requirement to a different Seller Team:

- Navigate to Requirement in Seller Console  
- Click "Change Team"  
- Select target Team  
- Reassignment moves triage queue item to target team  
- Old assignment is logged as `action=requirement_remapped`

### 9.2.3 Triage Queue Behavior (Seller)

- Incoming Requirements appear in Seller Team's triage queue with status `new`  
- Team Lead reviews fit and moves to `in_review`  
- If Team accepts Requirement, Lead assigns to a Team Member → status `assigned`  
- Team Member drafts response (Phase 7\)  
- Response submitted → status `response_submitted`  
- Buyer evaluation completes → status `resolved`

**If Seller Declines:**

- Team Lead may click "Decline to Bid" before response submitted  
- Requirement moves to status `declined` and disappears from Team's queue  
- Buyer sees "Vendor declined to bid" in Marketplace Listing  
- No record of declination sent to buyer unless buyer explicitly checks

## 9.3 Vendor Response Drafting & Capability Declarations {#9.3-vendor-response-drafting-&-capability-declarations}

Seller Team Members draft Vendor Responses in response to Requirements. Responses may include Capability Declarations, which are reusable assertion documents.

### 9.3.1 Vendor Response Structure

| Property | Type | Details |
| :---- | :---- | :---- |
| `id` | UUID | Immutable |
| `requirement_id` | UUID | Buyer's Requirement (read-only) |
| `vendor_organization_id` | UUID | Seller Organization |
| `team_id` | UUID | Seller Team managing response |
| `assigned_to_user_id` | UUID | Team Member drafting |
| `status` | Enum | `draft`, `in_review`, `submitted`, `withdrawn` |
| `submitted_at` | ISO 8601 or null | When submitted to buyer (cannot retract after submission) |
| `content` | RichText | Response body (formatting, links) |
| `capability_declarations` | Array of UUIDs | References to Capability Declarations included in response |

### 9.3.2 Capability Declarations

Capability Declarations are reusable structured claims about vendor capabilities (e.g., "We support AWS, Azure, and GCP", "ISO 27001 certified").

**Declaration Properties:** | Property | Type | Details | |----------|------|---------| | `id` | UUID | Immutable | | `vendor_organization_id` | UUID | Owner (Seller Organization) | | `team_id` | UUID | Seller Team managing declaration | | `title` | Text | e.g., "Cloud Provider Support" | | `description` | Text | Detailed explanation | | `evidence` | RichText | Supporting documentation, links, certificates | | `created_at` | ISO 8601 | | | `updated_at` | ISO 8601 | | | `reuse_count` | Integer | Number of responses using this declaration |

**Lifecycle:**

- Team Member creates Declarations in Team Settings → Knowledge Base  
- Declarations are stored in Team's KB category  
- When drafting Responses, Team Member may drag/drop or search for existing Declarations to include  
- Declarations may be updated; all Responses using the Declaration see updated content  
- Declarations may be marked private (team-only) or shared across vendor Organization

## 9.4 Response Quality & AI Assistance (Optional Feature) {#9.4-response-quality-&-ai-assistance-(optional-feature)}

If Seller Organization has AI response generation enabled, AI may suggest response drafts.

### 9.4.1 AI Response Generation

- Team Member receives Requirement in triage queue  
- Optional: Team Member clicks "Generate Response with AI"  
- AI examines Requirement and Seller's historical responses, capabilities, and Knowledge Base  
- AI generates response draft with suggested text and Capability Declarations to include  
- Draft appears in response composer with `[AI-SUGGESTED]` badge

### 9.4.2 AI Suggestion Approval

- Team Lead or Team Owner must approve AI suggestions before submission  
- Approver may review, edit, accept, or reject suggestion  
- If rejected, Team Member drafts response manually  
- Accepted suggestions are marked `ai_suggested=true` in audit log (transparency to buyer if they ask)

---

# 10\. The 13-Phase Evaluation Pipeline {#10.-the-13-phase-evaluation-pipeline}

## 10.1 Pipeline Overview {#10.1-pipeline-overview}

The Evaluation Pipeline is a fixed 13-phase, sequential process for procuring software. Phases are locked in order; no skip, reorder, or rename.

### 10.1.1 Phase Advancement Rules

- Phases progress sequentially from Phase 1 → Phase 13  
- Phase gate rules (see each phase definition) must be satisfied before advancement  
- Workspace Owner may advance phase manually via UI or API  
- Phase advancement is idempotent: advancing to a phase already current is a no-op (returns 200 OK, no state change)  
- Phase advancement is logged as `action=phase_advanced` with phase number and gate validation results  
- On advancement, system checks gate rules; if unsatisfied, advancement is rejected with error code `phase_gate_failed` and detailed reasons

### 10.1.2 Phase Lock Behavior

Once a Bid Workspace advances past a phase, the following rules apply:

**Phase Lock on Advancement:**

- Requirements may be amended per Amendment Protocol (Phases 6-9 only; see Section 10.7)  
- Scores submitted in previous phases are immutable (except Phases 10-11; see Section 10.3)  
- Workspace Owner cannot revert to previous phase; advancement is one-directional

**Read-Only Access After Phase Completion:**

- Vendor may view Requirements and historical responses from completed phases  
- Vendor may not submit new responses to completed phases (except amendments, Phases 6-9)  
- Buyer Workspace Owner may not modify closed Requirements

## 10.2 Phase 1: Stakeholder Alignment & Discovery (1-3 weeks) {#10.2-phase-1:-stakeholder-alignment-&-discovery-(1-3-weeks)}

**Purpose:** Align internal team on procurement goals, define procurement type, and initiate vendor discovery.

**Phase Entry Criteria:**

- Workspace created  
- Workspace Owner and minimum 1 Team Lead assigned  
- Workspace name and business description provided

**Phase Behavior:**

1. Workspace Owner drafts business case:  
     
   - Problem statement (what business problem is being solved)  
   - Procurement type: `build_vs_buy`, `multi_vendor_selection`, `renegotiation`, `replacement`  
   - Expected procurement size: `<$50k`, `$50k-$500k`, `$500k-$5M`, `>$5M`  
   - Timeline estimate (target decision date)  
   - Key stakeholders list (names, titles, email)

   

2. Workspace Owner invites internal stakeholders to Bid Workspace  
     
   - Stakeholders receive email invitation  
   - Acceptance of invitation is optional; workspace proceeds without acceptance  
   - Stakeholders who accept may view workspace and contribute comments

   

3. Discovery activities (optional):  
     
   - Workspace Owner may create a Discovery Document (RichText, searchable)  
   - Team Lead may attach market research, RFI responses, vendor research  
   - Discussions/comments enable async alignment  
   - No Requirements created yet

   

4. Phase Lock: Once Phase 1 complete, stakeholder list is frozen; new stakeholders may be added as guests but do not appear as official stakeholders in selection record.

**Phase Gate Rules:**

- Business case completed (problem statement, procurement type, timeline)  
- At least 1 stakeholder invited and confirmed  
- Procurement type selected

**Acceptance Criteria:**

- Workspace transitions to Phase 2  
- Stakeholders have read access to Discovery Document  
- Comments are visible to all stakeholders (conversation thread per comment)

**Phase Advancement:** Workspace Owner clicks "Ready for Requirements" → Phase 2

---

## 10.3 Phase 2: Requirement Definition (2-5 business days) {#10.3-phase-2:-requirement-definition-(2-5-business-days)}

**Purpose:** Define and finalize all Requirements that vendors will respond to.

**Phase Entry Criteria:**

- Phase 1 gates satisfied  
- At least 1 Requirement created

**Phase Behavior:**

1. Workspace Owner and Team Leads create Requirements:  
     
   - Each Requirement has title, description, category, priority (critical/high/normal/low)  
   - Requirement may be marked `must_have`, `should_have`, or `nice_to_have`  
   - Requirements are assigned to Team(s) for scoring in Phase 10  
   - Each Requirement belongs to a Use Case (see Section 4.3)

   

2. Requirement Review & Revert Rule (Phases 2-5):  
     
   - Any change to Requirement may be reverted if not yet entered Phase 6 (Vendor Bidding Opens)  
   - Revert creates a new version of Requirement and resets Requirement status to `pending_review`  
   - Reverted Requirement returns to Phase 2 for Team Lead approval  
   - Once Requirement approved (Team Lead clicks "Approve Requirement"), it is locked to Revert Rule and cannot be reverted

   

3. Requirement Triage:  
     
   - Requirements appear in Team's triage queue as `new`  
   - Team Lead reviews and approves → status transitions to `approved` and is removed from triage queue  
   - Requirement now ready for Phase 3

   

4. Phase Lock: Once Phase 2 complete, Requirements cannot be deleted (only archived). Revert Rule no longer applies.

**Phase Gate Rules:**

- At least 3 Requirements created (or waived by Workspace Owner)  
- All Requirements marked as `approved`  
- No Requirements in `pending_review` status

**Acceptance Criteria:**

- Workspace transitions to Phase 3  
- All Teams have reviewed and approved Requirements  
- Requirements are locked (cannot be reverted)

**Phase Advancement:** Team Lead clicks "All Requirements Approved" → Phase 3

---

## 10.4 Phase 3: Use Case Definition & Validation (1-2 weeks) {#10.4-phase-3:-use-case-definition-&-validation-(1-2-weeks)}

**Purpose:** Organize Requirements into logical Use Cases and validate each Use Case's scope.

**Phase Entry Criteria:**

- Phase 2 gates satisfied  
- All Requirements approved

**Phase Behavior:**

1. Workspace Owner groups Requirements into Use Cases:  
     
   - Each Use Case groups related Requirements (e.g., "User Authentication", "Reporting & Analytics")  
   - Use Case has name, description, priority level  
   - Each Requirement is assigned to exactly one Use Case (many-to-one relationship)

   

2. Use Case Validation:  
     
   - Team Lead assigned to each Use Case as Use Case Lead  
   - Use Case Lead reviews Requirements and may suggest changes  
   - Use Case Lead marks Use Case as `validated` once satisfied with scope  
   - Use Case Lead may request Requirement changes (returns Requirement to Phase 2 for Team Lead approval)

   

3. Scoring Scenario Setup (Preparation):  
     
   - Workspace Owner defines scoring scenarios (e.g., "Cloud vs. On-Premise", "Dedicated vs. Managed")  
   - Scenarios are optional; if defined, scores are collected per scenario  
   - Scenarios are read-only once Phase 4 entered

   

4. Phase Lock: Once Phase 3 complete, Use Case structure is locked. Requirements cannot be moved between Use Cases without returning to Phase 2\.

**Phase Gate Rules:**

- All Requirements assigned to a Use Case  
- All Use Cases have an assigned Use Case Lead  
- All Use Cases marked as `validated`

**Acceptance Criteria:**

- Workspace transitions to Phase 4  
- Use Case structure visible to vendors in Marketplace

**Phase Advancement:** Workspace Owner clicks "Use Cases Validated" → Phase 4

---

## 10.5 Phase 4-5: Vendor Discovery & Outreach (1-2 weeks combined) {#10.5-phase-4-5:-vendor-discovery-&-outreach-(1-2-weeks-combined)}

**Purpose:** Identify potential vendors and issue Invitations to Bid (ITBs).

**Phase Entry Criteria:**

- Phase 3 gates satisfied  
- Use Case structure defined

**Phase 4: Vendor Discovery**

1. Workspace Owner may:  
     
   - Search Marketplace for vendors matching Use Case categories  
   - Manually add vendor contacts (email list import)  
   - Create a "Shortlist" of target vendors  
   - Add vendors to Bid Workspace

   

2. Vendor Invitations:  
     
   - Workspace Owner issues formal Invitation to Bid (ITB) via email  
   - ITB includes: Requirements summary, timeline, link to Marketplace Listing  
   - ITB is logged in Workspace audit trail  
   - Vendors receive ITB notification; Marketplace Listing is marked `open_for_bidding`

**Phase 5: Outreach & Confirmation**

1. Vendor responses to ITB:  
     
   - Vendor clicks ITB link and confirms intent to bid  
   - Vendor is added to Bid Workspace as viewer  
   - Workspace Owner receives notification of vendor confirmation

   

2. Workspace Owner may:  
     
   - Send follow-up emails to non-responsive vendors  
   - Extend Phase 5 deadline if needed (logged as `phase_deadline_extended`)  
   - Manually mark vendor as "declined to bid"

   

3. Vendor List Finalization:  
     
   - Workspace Owner confirms final vendor shortlist  
   - Remaining vendors are locked in for Phase 6

**Phase Gate Rules (combined Phase 4-5):**

- At least 3 vendors invited (or fewer if required by procurement scope)  
- At least 1 vendor confirmed intent to bid  
- Vendor shortlist finalized

**Acceptance Criteria:**

- Workspace transitions to Phase 6  
- All invited vendors have accepted or declined  
- Vendor list is frozen

**Phase Advancement:** Workspace Owner clicks "Vendor List Finalized" → Phase 6

---

## 10.6 Phase 6: Vendor Bidding Opens (2-4 weeks, minimum 7 calendar days) {#10.6-phase-6:-vendor-bidding-opens-(2-4-weeks,-minimum-7-calendar-days)}

**Purpose:** Open formal bidding period. Vendors submit responses to Requirements. Requirement amendments are permitted (see Section 10.7).

**Phase Entry Criteria:**

- Phase 5 gates satisfied  
- Vendor shortlist finalized  
- Marketplace Listing published

**Phase Behavior:**

1. Bidding Period Opens:  
     
   - Workspace Owner sets Phase 6 deadline (minimum 7 calendar days from phase entry)  
   - All invited vendors may now submit Vendor Responses  
   - Marketplace Listing displays "Open for Bidding", shows deadline  
   - Requirements become visible to vendors in Marketplace

   

2. Vendor Response Submission:  
     
   - Vendor Team Member drafts Vendor Response per Requirement  
   - Response may include Capability Declarations, documentation links  
   - Team Lead approves response (if approval required by Seller SLA)  
   - Response submitted to Buyer Workspace  
   - Response status: `submitted`  
   - Submission is logged with timestamp and submitting user

   

3. Requirement Amendments (Amendment Protocol, Phases 6-9):  
     
   - Workspace Owner may amend Requirements during Phase 6-9  
   - Amendments may clarify, add, or remove details  
   - Amendment creates new Requirement version (version incrementing)  
   - All vendors notified of amendment via email: "\[Requirement\] has been clarified"  
   - Vendors may re-submit responses incorporating amendment details  
   - Re-submission is allowed once per amendment; new response replaces old (old version is retained in audit)  
   - Amendment is logged with `action=requirement_amended` and change summary

   

4. Question & Answer (Q\&A):  
     
   - Vendors may post questions about Requirements in Marketplace  
   - Workspace Owner may answer publicly (visible to all vendors) or privately (visible to asking vendor only)  
   - Q\&A creates audit trail for selection record transparency

   

5. Phase Lock: Once Phase 6 complete, Requirement amendments are no longer permitted except within Phase 7-9 per Amendment Protocol. New Requirements cannot be added.

**Phase Gate Rules:**

- Phase 6 deadline set and reached  
- At least 1 vendor submitted a response  
- All vendors given equal access to Requirements and amendments

**Amendment Protocol (Phases 6-9 Inline Definition):**

An Amendment is a modification to a Requirement after Phase 6 begins. Amendments are permitted only in Phases 6-9.

**Amendment Creation:**

- Workspace Owner navigates to Requirement and clicks "Amend"  
- Amendment form shows: requirement text, proposed change, reason for change (optional)  
- Amendment is timestamped and assigned a version number  
- Amendment is logged and a new Requirement version is created (e.g., v1.0 → v1.1)

**Amendment Notification:**

- Email sent to all vendors in Bid Workspace: "Requirement \[Title\] has been amended"  
- Email includes: old text, new text, effective date  
- Effective date: immediate or future (Workspace Owner chooses)

**Vendor Response Options:**

- Vendor may submit new response incorporating amendment  
- Vendor may keep existing response (no re-submit required; existing response remains valid)  
- If vendor re-submits, system retains both old and new response versions in audit log  
- Only most recent response is used for Phase 10 evaluation

**Amendment Restrictions:**

- Amendments that materially change Requirement scope must include minimum 3 calendar days notice  
- Amendments that add new Requirements are not permitted (must use Requirement creation instead)  
- Amendments that remove all Requirements from a Use Case trigger Use Case reevaluation  
- After Phase 9 ends, no further amendments permitted; Requirement is locked

**Acceptance Criteria:**

- All vendors given equal opportunity to view amendments  
- Amendment history is audited  
- Vendor responses to amendments are tracked separately

**Phase Advancement:** Workspace Owner clicks "Bidding Closed" → Phase 7

---

## 10.7 Phase 7: Vendor Response Refinement (1-2 weeks combined with Phase 8\) {#10.7-phase-7:-vendor-response-refinement-(1-2-weeks-combined-with-phase-8)}

**Purpose:** Vendors clarify responses and provide additional information. Responses remain mutable.

**Phase Entry Criteria:**

- Phase 6 gates satisfied  
- At least 1 vendor response submitted

**Phase Behavior:**

1. Response Refinement Period:  
     
   - Vendors may edit and resubmit Responses until Phase 8 ends  
   - Each resubmission creates a new response version (timestamp, version number)  
   - Previous versions retained in audit log  
   - Workspace Owner may see version history by clicking "View Response History"

   

2. Seller-Side Refinement:  
     
   - Seller Team Lead may request revisions from Team Member  
   - Team Member refines response and resubmits  
   - Refinement discussion visible in Team triage queue (internal to Seller)

   

3. Buyer Q\&A Continuation:  
     
   - Buyers may post follow-up questions  
   - Vendors may post clarifications in response  
   - Q\&A threads are preserved in workspace

   

4. Phase Lock: Once Phase 8 ends, Vendor Responses become locked (mutable only to submit scores in Phases 10-11, but content cannot change).

**Phase Gate Rules:**

- Vendors have been given minimum 5 business days for refinement  
- All vendors given equal opportunity to refine

**Acceptance Criteria:**

- All vendors have submitted final responses or opted out  
- Response versions are immutable after Phase 8

**Phase Advancement:** Workspace Owner clicks "Refinement Complete" → Phase 8

---

## 10.8 Phase 8: Buyer Due Diligence & Demos (1-2 weeks combined with Phase 7\) {#10.8-phase-8:-buyer-due-diligence-&-demos-(1-2-weeks-combined-with-phase-7)}

**Purpose:** Buyers conduct additional due diligence: vendor meetings, demos, reference checks.

**Phase Entry Criteria:**

- Phase 7 gates satisfied  
- All vendor responses submitted

**Phase Behavior:**

1. Buyer Activities:  
     
   - Workspace Owner may schedule vendor demos/calls  
   - Demo invitation and notes are logged in Workspace  
   - Due diligence findings may be added as Comments on Vendor Responses  
   - Comments may include: demo notes, reference feedback, security review findings

   

2. Scoring Preparation:  
     
   - Team Members review Responses and due diligence findings  
   - Team Members prepare for Phase 10 scoring  
   - Agent Instructions reviewed (if applicable)

   

3. Buyer Requests for Additional Information:  
     
   - Workspace Owner may request additional info from vendors (e.g., security questionnaire, SLA details)  
   - Request is logged as amendment or separate information request  
   - Vendors may submit additional documentation  
   - Additional documentation is attached to Vendor Response

   

4. Phase Lock: Once Phase 8 ends, additional information from vendors is no longer accepted (except via formal amendment if still in Phase 9).

**Phase Gate Rules:**

- Minimum 3 business days provided for due diligence  
- All vendors treated equitably (same questions, timeline)

**Acceptance Criteria:**

- Buyer due diligence complete  
- Vendor Responses ready for scoring

**Phase Advancement:** Workspace Owner clicks "Due Diligence Complete" → Phase 9

---

## 10.9 Phase 9: Final Vendor Clarifications (1-3 business days) {#10.9-phase-9:-final-vendor-clarifications-(1-3-business-days)}

**Purpose:** Final round of clarifications before scoring begins. Final amendments permitted (last Amendment Protocol window).

**Phase Entry Criteria:**

- Phase 8 gates satisfied

**Phase Behavior:**

1. Final Clarifications:  
     
   - Workspace Owner may request final clarifications only (no new Requirements)  
   - Vendors submit clarification responses within 1 business day  
   - Workspace Owner provides final feedback if needed

   

2. Final Amendment Round:  
     
   - Last opportunity for Requirement amendments (Phases 6-9)  
   - Same Amendment Protocol applies  
   - After Phase 9, Requirements are locked permanently

   

3. Scoring Readiness:  
     
   - Workspace Owner confirms all Requirements are final  
   - Workspace Owner confirms all Vendor Responses are final  
   - System creates immutable snapshots of Requirements and Responses (for scoring reference)

   

4. Phase Lock: Once Phase 9 ends, Requirements and Responses are permanently locked. No further changes permitted.

**Phase Gate Rules:**

- All final clarifications submitted and reviewed  
- All Requirements final (no further amendments)  
- All Vendor Responses final (no further submissions)

**Acceptance Criteria:**

- Workspace ready for Phase 10 scoring  
- Snapshots of all Requirements and Responses created for audit trail

**Phase Advancement:** Workspace Owner clicks "Final Clarifications Complete" → Phase 10

---

## 10.10 Phase 10: Team Evaluation & Scoring (1-3 weeks) {#10.10-phase-10:-team-evaluation-&-scoring-(1-3-weeks)}

**Purpose:** Team Members score Vendor Responses against Requirements. Scores are mutable during Phases 10-11 only.

**Phase Entry Criteria:**

- Phase 9 gates satisfied  
- All Requirements and Responses final

**Scoring Mechanics:**

1. Scoring Framework:  
     
   - Each Requirement is scored on a scale: 1-5 (1=does not meet, 5=exceeds expectations)  
   - Scale may be customized per Workspace (numeric scale, A-F grade, pass/fail)  
   - Each score may include optional rationale (up to 500 characters)  
   - Scores are submitted per Team Member per Requirement per Vendor

   

2. Scoring Assignment:  
     
   - Team Lead assigns Requirements to Team Members for scoring  
   - Each Requirement assigned to minimum 1, maximum 5 Team Members for consensus scoring  
   - Team Members may see other scorers' rationale but not scores until Phase 10 closed (to reduce bias)

   

3. Scoring Workflow:  
     
   - Team Member opens Requirement and views Vendor Response  
   - Team Member reviews Agent Instructions (if applicable)  
   - Team Member submits preliminary score with rationale  
   - Team Member may reopen and revise score during Phase 10-11  
   - Score is timestamped with `status=submitted`

   

4. Score Aggregation (Phase 10 Conclusion):  
     
   - Once Phase 10 deadline reached, all scores are visible to Team Lead  
   - System calculates average score per Requirement per Vendor  
   - Consensus/outlier detection: if scores for same Requirement differ by \>2 points, Team Lead is notified  
   - Consensus scores show distribution (e.g., "1x5, 3x4, 1x3" → avg 4.0)

   

5. Score Revision Window:  
     
   - During Phase 10-11, any Team Member may revise their score  
   - Revision is logged with timestamp and rationale change  
   - System shows both original and revised score in audit log  
   - No limit on number of revisions during Phases 10-11

**Score Immutability (Gap 9.1):**

- **Phases 1-9:** No scores exist.  
- **Phases 10-11:** Scores are mutable. Team Members may revise scores at any time.  
- **Phase 12 Entry:** Scores submitted in Phase 10-11 become permanently immutable. **This is the single canonical rule for score immutability.**  
- **Phase 12 & 13:** Scores cannot be changed under any circumstances.

**Rationale:** Immutability at Phase 12 entry allows teams to finalize consensus during scoring phases (10-11) and then "lock in" results for executive review and selection in Phase 12-13.

**Withdrawn Scores (on User Deprovisioning):**

- If Team Member is deprovisioned, all their scores submitted in Phase 10-11 are marked `withdrawn`  
- Withdrawn scores do not count toward consensus  
- Replacement Team Member must resubmit score  
- Withdrawn status is logged in audit

**Phase Gate Rules:**

- Phase 10 deadline set and reached  
- All Vendors have been scored on all Requirements (or scoring marked as N/A for valid business reason)  
- Minimum 1 score per Requirement per Vendor (or justification if skipped)

**Acceptance Criteria:**

- All scores submitted and visible to Team Lead  
- Score consensus documented  
- Scores ready for Phase 11 review

**Phase Advancement:** Workspace Owner clicks "Scoring Complete" → Phase 11

---

## 10.11 Phase 11: Score Review & Consensus (1-2 weeks) {#10.11-phase-11:-score-review-&-consensus-(1-2-weeks)}

**Purpose:** Team Leads review scores, ensure consensus, resolve outliers, finalize scoring.

**Phase Entry Criteria:**

- Phase 10 gates satisfied  
- All scores submitted

**Phase Behavior:**

1. Consensus Review:  
     
   - Team Lead reviews average scores and consensus distribution  
   - Team Lead identifies outliers (scores deviating \>2 points from mean)  
   - For each outlier, system prompts: "Review outlier scores and request justification if needed"

   

2. Outlier Resolution:  
     
   - Team Lead may:  
     - Request justification from outlier scorer (async request, Team Member responds with email)  
     - Dismiss outlier as valid different perspective  
     - Ask Team Member to reconsider score (no override; Team Member may revise or hold)  
   - Outlier resolution is logged with rationale

   

3. Final Score Revision:  
     
   - Team Members may revise scores one final time based on Team Lead feedback  
   - System shows "Final revision window open until \[Phase 11 deadline\]"  
   - All revisions locked once Phase 11 deadline reached

   

4. Score Finalization:  
     
   - Team Lead marks scores as `finalized` (status change)  
   - Finalization creates immutable snapshot of all scores  
   - All Team Members notified: "Phase 11 complete; scores locked"

   

5. Scoring Report Generation:  
     
   - System generates Summary Scoring Report:  
     - Vendor summary scores (average per vendor)  
     - Requirement-by-requirement breakdown  
     - Consensus metrics (e.g., "82% agreement on average")  
     - Top 3 / Bottom 3 performing vendors  
   - Report is available for download (PDF, CSV)

**Score Immutability Enforcement:**

- All scores are immutable once Phase 12 is entered (see Section 10.10)  
- UI disables any score revision attempts once Phase 12 begins  
- API rejects score update requests with error `scores_immutable_phase_12_plus`

**Phase Gate Rules:**

- All Team Members have submitted final scores  
- Outliers reviewed and justifications documented  
- Scores finalized by Team Lead

**Acceptance Criteria:**

- All scores locked and immutable  
- Summary Scoring Report generated  
- Scores ready for Phase 12 selection

**Phase Advancement:** Workspace Owner clicks "Scores Finalized" → Phase 12

---

## 10.12 Phase 12: Selection & Recommendation (2-5 business days) {#10.12-phase-12:-selection-&-recommendation-(2-5-business-days)}

**Purpose:** Executive review of scoring, select finalist(s), and prepare final recommendation.

**Phase Entry Criteria:**

- Phase 11 gates satisfied  
- All scores immutable and finalized

**Phase Behavior:**

1. Executive Review:  
     
   - Workspace Owner and designated executives review Summary Scoring Report  
   - Executives may add comments and questions (separate from Team scores)  
   - Executive notes do not override Team scores; purely informational

   

2. Vendor Ranking:  
     
   - System ranks vendors by average score  
   - Workspace Owner may accept system ranking or manually reorder vendors (with documented reason)  
   - Manual reordering is logged as `action=vendor_ranking_override` with reason

   

3. Finalist Selection:  
     
   - Workspace Owner selects finalist(s):  
     - Primary vendor (1 required)  
     - Secondary vendor (optional)  
     - Alternate vendors (optional)  
   - Selection status is updated: `selected=primary`, `selected=secondary`, `selected=alternate`, `selected=not_selected`  
   - All vendors notified of selection status

   

4. Selection Report Generation:  
     
   - System generates Selection Report:  
     - Executive summary (procurement goals achieved?)  
     - Vendor rankings and scoring summary  
     - Recommendation: primary vendor with key rationale  
     - Risk assessment if secondary/alternate needed  
     - Contract negotiation next steps  
   - Report is signed digitally by Workspace Owner (electronic signature, workflow approval)

   

5. Approval Workflow (Optional):  
     
   - If Organization requires approval, report is routed to CFO/legal/CRO for sign-off  
   - Approver may accept, request changes, or reject  
   - Rejection returns workspace to Phase 12 for reconsideration  
   - Acceptance progresses to Phase 13

   

6. Score Immutability Enforcement:  
     
   - **All scores are now permanently immutable.** (See Section 10.10, Gap 9.1)  
   - Scores cannot be changed under any circumstances  
   - Any attempt to modify scores returns error `scores_immutable_phase_12_plus`

**Phase Gate Rules:**

- All Team Leads have finalized their scores  
- Vendor ranking determined (system or manual with justification)  
- At least 1 finalist selected  
- Selection Report reviewed and approved (if approval required)

**Acceptance Criteria:**

- Final vendor selection documented in Selection Report  
- Report approved and signed  
- All vendors notified of selection outcome  
- Workspace ready for Phase 13 completion

**Phase Advancement:** Workspace Owner clicks "Selection Complete" → Phase 13

---

## 10.13 Phase 13: Contract & Closure (Terminal) {#10.13-phase-13:-contract-&-closure-(terminal)}

**Purpose:** Execute contract with selected vendor, archive evaluation, close workspace.

**Phase Entry Criteria:**

- Phase 12 gates satisfied  
- Vendor selection finalized

**Phase Behavior:**

1. Contract Negotiation:  
     
   - Workspace Owner initiates contract negotiation with primary selected vendor  
   - Contract template may be populated from marketplace or uploaded by Workspace Owner  
   - Contract negotiation happens outside Sourcera (manual process); Sourcera tracks status only

   

2. Contract Execution:  
     
   - Workspace Owner uploads signed contract to workspace  
   - Contract is attached to workspace record  
   - Workspace status updated: `contract_executed`  
   - All team members notified: "Contract signed with \[Vendor\]; procurement complete"

   

3. Post-Evaluation Engagement (Optional):  
     
   - Workspace Owner may collect feedback from stakeholders:  
     - Did evaluation process go as planned?  
     - Was vendor selection sound?  
     - Recommendations for next procurement  
   - Feedback is logged separately from evaluation data (for future reference)

   

4. Workspace Closure:  
     
   - Workspace status set to `closed`  
   - Workspace is moved to "Archived" section in Buyer console  
   - Team members retain read access to closed workspace  
   - Vendors retain read-only access to their responses and feedback (if enabled)

   

5. Selection Record Creation:  
     
   - System creates immutable Selection Record:  
     - All Requirements and Responses (snapshots from Phase 9\)  
     - All Scores (immutable, Phase 12\)  
     - All Comments and Discussion threads  
     - Selection Report  
     - Contract document  
   - Selection Record is retained per GDPR retention schedule (see Section 6.8.4)

   

6. Workspace Soft-Delete (Optional; see Section 10.14):  
     
   - Workspace Owner may initiate soft-delete within 30 days of closure  
   - Soft-delete initiates 14-day grace period; workspace can be recovered  
   - After 30-day recovery window, workspace is permanently purged

**Phase Gate Rules:**

- Contract signed and uploaded (or waived if no contract required)  
- Workspace closure confirmed by Workspace Owner

**Acceptance Criteria:**

- Workspace status: `closed`  
- Selection Record created and immutable  
- All team members notified  
- Workspace archived and read-only

**Phase Advancement (Terminal):** Phase 13 is terminal; workspace does not advance further. Status is `closed`.

---

## 10.14 Bid Workspace Cancellation Protocol {#10.14-bid-workspace-cancellation-protocol}

A Workspace Owner may cancel a Bid Workspace at any point (Phases 1-13). Cancellation triggers a soft-delete with 30-day recovery window.

### 10.14.1 Cancellation Initiation

- Workspace Owner navigates to Workspace Settings → Cancel Workspace  
    
- System displays warning: "This will cancel the evaluation and notify all vendors. You have 14 days to undo this action."  
    
- Workspace Owner confirms with reason (required):  
    
  - `no_longer_needed`  
  - `vendor_selected_externally`  
  - `procurement_postponed`  
  - `internal_decision` (no details required)  
  - `other` (with description)


- Workspace `status` set to `cancelled`  
    
- `cancelled_at` timestamp recorded  
    
- `cancellation_reason` logged  
    
- Cancellation is logged as audit event

### 10.14.2 Vendor Notifications

- All vendors with submitted responses receive email:  
  - Subject: "\[Procurement Name\] \- Evaluation Cancelled"  
  - Body: Professional cancellation notice with Workspace Owner contact for questions  
  - Reason is included if not `internal_decision`  
- Marketplace Listing status set to `closed`

### 10.14.3 Cancellation Grace Period (Days 0-14)

- Workspace remains fully functional  
- Workspace Owner may cancel the cancellation:  
  - Navigate to Workspace Settings → Undo Cancellation  
  - Workspace status reverts to `active`  
  - All notifications sent to vendors are logged; no "undo" notification sent  
- After 14 days, cancellation cannot be undone

### 10.14.4 Cancellation Processing (Days 14-44)

- Day 14: Workspace status changes to `deletion_in_progress`  
- Cascade deletions execute:  
  - **Buyer-Owned Data Retention:** All Requirements, Use Cases, Scenarios, Comments, Discussion threads, Scores, Selection Report are retained in Buyer's Organization data  
  - **Vendor Response Handling:** Vendor responses are handled per vendor preference:  
    - Responses saved to Vendor's KB (if vendor has KB feature): Retained indefinitely in Vendor's Organization  
    - Responses not saved to KB: Purged after 30-day processing window  
  - **NDA Records:** Preserved on both Buyer and Vendor sides (see Section 7.2)  
  - **Audit Logs:** Retained per plan-tier retention policy (30d/1yr/7yr) independent of workspace lifecycle  
  - **Webhooks:** Disabled (status `disabled_workspace_deleted`)

### 10.14.5 Workspace Recovery

Within 30 days of cancellation, Workspace Owner may recover workspace:

- Navigate to Workspace Settings → Recover Workspace  
- Workspace status reverts to `active`  
- Marketplace Listing restored to `open_for_bidding` status  
- Vendors notified: "Procurement \[Name\] has resumed; bidding reopened"  
- Recovery is logged as `workspace_recovered`

After 30 days (Day 44 from cancellation initiation), workspace is permanently deleted. No recovery possible.

### 10.14.6 Cancellation Data Retention & Export

**During Grace Period (Days 0-14):**

- Workspace Owner may export complete evaluation data via Settings → Export Workspace  
- Export includes:  
  - All Requirements, Use Cases, Scenarios  
  - All Vendor Responses  
  - All Scores and Comments  
  - Selection Report (if Phase 12+ reached)  
  - Full audit trail  
- Export format: ZIP containing JSON and PDF files  
- Export download available for 7 days

**After Cancellation Processing (Day 44+):**

- Buyer-owned data (Requirements, Scores, etc.) retained in Organization indefinitely  
- Vendor responses NOT saved to KB are purged  
- Vendor responses saved to KB are retained in Vendor's Organization (vendor's property)  
- Audit logs retained per plan-tier retention (independent of workspace)

---

## 10.15 Phase Duration Benchmarks (Sourcera Method) {#10.15-phase-duration-benchmarks-(sourcera-method)}

The following are recommended phase durations based on Sourcera Method best practices:

| Phase | Recommended Duration | Notes |
| :---- | :---- | :---- |
| Phase 1: Stakeholder Alignment | 1-3 weeks | Includes discovery and internal alignment |
| Phase 2: Requirement Definition | 2-5 business days | Focused requirement drafting and Team review |
| Phase 3: Use Case Definition | 1-2 weeks | Grouping, validation, scenario setup |
| Phases 4-5: Vendor Discovery & Outreach | 1-2 weeks combined | Shortlist, ITB, vendor confirmation |
| Phase 6: Vendor Bidding Opens | 2-4 weeks, minimum 7 calendar days | Adequate time for vendor response, amendments |
| Phases 7-8: Refinement & Due Diligence | 1-2 weeks combined | Response refinement, demos, reference checks |
| Phase 9: Final Clarifications | 1-3 business days | Last amendment window before scoring lock |
| Phase 10: Team Evaluation & Scoring | 1-3 weeks | Time for consensus scoring and discussions |
| Phase 11: Score Review & Consensus | 1-2 weeks | Outlier resolution, final report preparation |
| Phase 12: Selection & Recommendation | 2-5 business days | Executive review and final selection |
| Phase 13: Contract & Closure | Variable | Depends on contract negotiation timeline |

**Total Estimated Timeline:** 10-20 weeks (2.5-5 months) from Phase 1 to Phase 12 completion.

These durations are guidelines, not requirements. Workspace Owner may compress or extend phases based on business need. Shorter timelines may reduce consensus quality; longer timelines may increase vendor fatigue and reduce response quality.

---

## 10.16 Phase Advancement API {#10.16-phase-advancement-api}

Phase advancement is available via REST API and UI.

### 10.16.1 API Endpoint

POST /workspaces/:workspaceId/advance-phase

Content-Type: application/json

{

  "targetPhase": 3

}

**Response (Success):**

{

  "workspace\_id": "...",

  "current\_phase": 3,

  "previous\_phase": 2,

  "advanced\_at": "2026-04-11T14:30:00Z",

  "gate\_validation": {

    "status": "passed",

    "checks": \[

      { "check": "requirements\_defined", "status": "passed" },

      { "check": "teams\_assigned", "status": "passed" }

    \]

  }

}

**Response (Gate Failure):**

{

  "error": "phase\_gate\_failed",

  "current\_phase": 2,

  "target\_phase": 3,

  "failed\_checks": \[

    {

      "check": "requirements\_approved",

      "status": "failed",

      "message": "3 requirements still pending review"

    }

  \]

}

### 10.16.2 Idempotency

Phase advancement is idempotent. If workspace is already at target phase, request returns 200 OK with no state change:

{

  "workspace\_id": "...",

  "current\_phase": 3,

  "message": "Already at phase 3; no advancement needed"

}

### 10.16.3 Phase Advancement Audit

Each advancement is logged:

- `action`: `phase_advanced`  
- `resource_type`: `Workspace`  
- `resource_id`: Workspace ID  
- `changes`: `{ "phase": { "from": 2, "to": 3 } }`  
- `timestamp`: ISO 8601

---

---

# 11\. Buyer Console — Navigation & Layout {#11.-buyer-console-—-navigation-&-layout}

## 11.1 Overview {#11.1-overview}

The Buyer Console is the primary interface for procurement teams to manage sourcing evaluations. It combines a persistent sidebar navigation with content areas that adapt based on the active Phase and user role. The layout is designed to support both rapid list-view interaction (matrix view) and deep-dive analysis (detail view).

## 11.2 Sidebar Navigation Structure {#11.2-sidebar-navigation-structure}

### 11.2.1 Layout & Dimensions

- **Expanded width:** 240px  
- **Collapsed width:** 48px  
- **Collapse/expand toggle:** Top-left corner, visible in both states  
- **Collapse state behavior:** Icons only, tooltips on hover, no section labels  
- **Position:** Fixed, left edge, full viewport height, z-index 100  
- **Background:** Workspace theme primary color (dark by default)  
- **Text color:** Workspace theme text-on-primary (white by default)

### 11.2.2 Navigation Sections

All sections appear in the following order. Phase-gated sections render as phase-unavailable items when conditions are not met.

**Logo & Workspace Selector**

- Sourcera logo (16x16px) at top when collapsed, logo \+ workspace name when expanded  
- Workspace name truncated at 20 characters with ellipsis  
- Click to open workspace switcher modal (non-blocking, dismissible)

**Primary Navigation (Always Available)**

1. **Dashboard** (icon: home)  
     
   - Route: `/workspace/:workspace_id/dashboard`  
   - Always available from Phase 1  
   - Shows Pulse Health Score, Inbox count, recent activity

   

2. **Sourcing** (icon: briefcase)  
     
   - Route: `/workspace/:workspace_id/sourcing`  
   - Always available from Phase 1  
   - Expands to sub-items: Active, Paused, Archived  
   - Active shows count of non-archived workspaces

   

3. **Intelligence** (icon: brain)  
     
   - Phase-gated: Available Phase 10+  
   - Route: `/workspace/:workspace_id/intelligence`  
   - If Phase \< 10: renders as disabled item with tooltip "Available in Phase 10 (Scoring)"  
   - Tooltip background: light gray, dark text, 8px padding, max-width 200px

   

4. **Marketplace** (icon: store)  
     
   - Phase-gated: Available Phase 6+  
   - Route: `/workspace/:workspace_id/marketplace`  
   - If Phase \< 6: renders as disabled item with tooltip "Available in Phase 6 (Vendor Participation)"  
   - Shows count of available vendors matching workspace scope

   

5. **Templates** (icon: template)  
     
   - Always available from Phase 1  
   - Route: `/workspace/:workspace_id/templates`  
   - Organization-scoped, not workspace-scoped

   

6. **Settings** (icon: gear)  
     
   - Always available  
   - Route: `/workspace/:workspace_id/settings`  
   - Expands to sub-items based on user role (see Section 8 — Organization Admin)

**Contextual Navigation (Workspace-Level)**

- Appears below Primary Navigation when a workspace is active  
- Current workspace name as a section header  
- Nested items (depth 2):  
  - **Use Cases** (icon: folder): Count of active use cases  
  - **Vendors** (icon: users): Count of invited vendors  
  - **Team** (icon: people): Count of team members in workspace  
  - **Activity** (icon: feed): Recent changes, SLA alerts, scoring activity

### 11.2.3 Phase Gating Rules

- **Phase unavailable items:** Render with 50% opacity, strikethrough text, disabled cursor  
- **Tooltip trigger:** Hover or focus on disabled item  
- **Tooltip content:** "Available in Phase N (Phase Name)"  
- **Tooltip appearance:** Appears to the right of the sidebar (or left if sidebar is collapsed), 100ms delay  
- **Click behavior on disabled item:** No-op, tooltip remains visible for 2 seconds

### 11.2.4 Responsive Behavior

- **Desktop (≥1024px):** Sidebar fully visible, expanded by default  
- **Tablet (768px–1023px):** Sidebar fully visible, collapsed by default (can be toggled expanded)  
- **Mobile (\<768px):** Sidebar hidden, replaced by bottom tab bar (Dashboard, Sourcing, Intelligence, Marketplace, Settings) with icons \+ labels (12px font)

## 11.3 Content Layout & Regions {#11.3-content-layout-&-regions}

### 11.3.1 Main Content Area

- **Left margin:** Adjusts based on sidebar state (240px expanded, 48px collapsed)  
- **Transition:** 200ms ease-in-out when toggling sidebar  
- **Header region:** Contains breadcrumbs, title, action buttons (height: 60px)  
- **Breadcrumb structure:** Workspace \> Section \> \[Subsection\] \> \[Item\]. Clickable, last item bold/non-clickable.  
- **Content region:** Scrollable, padding 24px, background: workspace theme background

### 11.3.2 Content View Types

**Matrix View (Default for Lists)**

- **Use:** Use Cases, Requirements, Scoring, Scenario comparison  
- **Structure:** Spreadsheet-like grid, rows \= items, columns \= attributes  
- **Row height:** 48px (text), 32px (compact mode toggle available)  
- **Columns:** Configurable visibility via settings icon in column header  
- **Sorting:** Click column header to sort A-Z or reverse; chevron indicates direction  
- **Filtering:** Filter bar above matrix (chip-based, removable filters)  
- **Selection:** Checkbox column (shift+click for range, cmd/ctrl+click for multi), "Select All" in header  
- **Inline edit:** Double-click cell to edit (single-cell edit, not row-level). Changes auto-save (optimistic mutation with rollback). Edited cell shows checkmark, returns to display mode on blur.  
- **Floating action bar:** Appears when ≥1 row selected. Contains: Bulk Actions (dropdown), Clear Selection button. Positioned 24px above matrix, horizontally centered, z-index 50\.  
- **Keyboard navigation:**  
  - **J/K:** Navigate down/up one row  
  - **H/L:** Scroll left/right in wide matrices  
  - **Space:** Toggle selection of current row  
  - **Enter:** Open detail view of current row  
  - **Escape:** Deselect all, close any open popovers  
- **Right-click context menu:** Copy, Edit, Duplicate, Delete (if permissions allow), Copy Link  
- **Pagination:** "Load more" button (lazy-load) or page controls (5/10/25/50 rows per page)

**Detail View**

- **Trigger:** Click row in matrix view, or navigate to detail route  
- **Layout:** Sidebar (30% width, sticky, scrollable) \+ main content (70% width, scrollable)  
- **Sidebar contents:** Quick info (name, status, phase), metadata fields, related items  
- **Main content:** Full form/rich text editor, comments thread, related items panel  
- **Navigation:** "Previous" and "Next" buttons at bottom (context-aware, disabled if at boundary)  
- **Close:** X button (top-right) or Escape key, returns to matrix view, maintains scroll position

**Report View (Phase 11+)**

- **Trigger:** "Export" or "View Report" action in sourcing context  
- **Format:** Printable single-column layout, high contrast, no sidebars  
- **Export options:** PDF (via browser print), CSV (via download), Email (via dialog)

### 11.3.3 Empty States

- **Messaging:** Headline (16px, bold) \+ description (14px) \+ primary action button  
- **Illustration:** Generic icon (48x48px) centered above text  
- **Examples:**  
  - No Use Cases: "Start your sourcing evaluation. Create your first Use Case to define what you're looking for."  
  - No Vendors: "Invite vendors to participate. Search the Marketplace or add custom vendors."  
  - No Scoring data (Phase \<10): "Scoring analytics will appear when scoring begins in Phase 10."

## 11.4 Persistent UI Elements {#11.4-persistent-ui-elements}

### 11.4.1 Top Bar (Global)

- **Height:** 48px  
- **Position:** Fixed, top, spanning full viewport width  
- **Contents (left to right):**  
  - Workspace name (bold, 14px)  
  - Phase indicator: "Phase 7 (Vendor Participation)" with progress bar (width \= phase\_number/12 \* 100%)  
  - Spacer  
  - User avatar (32x32px, clickable for user menu)  
  - Notifications bell icon (with unread count badge, red)  
- **Background:** Workspace theme secondary color  
- **Sticky beneath:** Top padding on content area \= 48px

### 11.4.2 Notifications Popover

- **Trigger:** Click bell icon  
- **Position:** Top-right, anchored to bell  
- **Contents:** List of unread notifications, "Mark All as Read" button, link to "Settings" for notification preferences  
- **Dismissible:** Click outside or press Escape  
- **Persistence:** Unread count persists across page reloads

### 11.4.3 User Menu

- **Trigger:** Click avatar  
- **Contents:**  
  - User name (bold, 12px)  
  - User email (gray, 12px)  
  - Divider  
  - "Workspace Settings" (links to `/workspace/:workspace_id/settings`)  
  - "Organization Settings" (links to `/organization/:org_id/settings`)  
  - "Help & Feedback" (links to help center)  
  - "Sign Out"  
- **Keyboard:** Escape to close  
- **Position:** Anchored to avatar, top-right

## 11.5 Acceptance Criteria {#11.5-acceptance-criteria}

### 11.5.1 Navigation

- [ ] Sidebar toggles between 240px (expanded) and 48px (collapsed) with 200ms transition  
- [ ] Phase-gated items appear disabled (50% opacity, strikethrough) when Phase \< gating threshold  
- [ ] Tooltip appears on hover of disabled item, disappears after 2s or on mouseout  
- [ ] Breadcrumb renders all ancestors and current item; last item is bold and non-clickable  
- [ ] Collapsing sidebar on desktop does not hide or lose focus from current page content  
- [ ] Mobile view (\<768px) replaces sidebar with bottom tab bar with 5 primary items  
- [ ] Sidebar collapse state persists in localStorage per workspace

### 11.5.2 Matrix View

- [ ] J/K keyboard navigation moves cursor up/down one row, visual highlight follows  
- [ ] Space toggles checkbox for current row; shift+Space toggles range  
- [ ] Cmd/Ctrl+A selects all visible rows (not paginated rows)  
- [ ] Double-click cell enters edit mode; blur or Enter saves; Escape reverts  
- [ ] Column sorting by header click; chevron indicates direction (ascending/descending)  
- [ ] Filter chips appear above matrix; click X to remove filter  
- [ ] Floating action bar appears when ≥1 row selected, positioned 24px above matrix  
- [ ] Right-click context menu appears with Copy, Edit, Duplicate, Delete, Copy Link  
- [ ] "Load More" or pagination controls display remaining row count

### 11.5.3 Detail View

- [ ] Clicking matrix row opens detail view; maintains scroll position in matrix on close  
- [ ] Detail view sidebar is sticky (does not scroll with main content)  
- [ ] "Previous" and "Next" buttons navigate to adjacent items; disabled at boundaries  
- [ ] Escape or X button closes detail view, returns to matrix  
- [ ] URL changes to `/workspace/:id/section/:item_id/detail`; back button returns to matrix view

### 11.5.4 Empty States

- [ ] Empty state appears when section has no items (0 use cases, 0 vendors, etc.)  
- [ ] Headline and description are clearly visible  
- [ ] Primary action button is styled and clickable  
- [ ] Empty state icon is centered and 48x48px

### 11.5.5 Responsive Layout

- [ ] On tablet (768px–1023px), sidebar is collapsed by default  
- [ ] On mobile (\<768px), sidebar is replaced with bottom tab bar  
- [ ] Content area adjusts margin based on sidebar state without overflow  
- [ ] Matrix view columns stack or scroll horizontally on narrow viewports

---

# 12\. Policy-Powered Requirement Generation {#12.-policy-powered-requirement-generation}

## 12.1 Overview {#12.1-overview}

Policy Ingestion is a multi-stage pipeline that converts compliance documents (PDFs, Word) into structured requirements via LLM-powered extraction, semantic deduplication, and traceability mapping. Ingested requirements enter the Amendment Protocol before publishing to the workspace.

## 12.2 Supported Document Types {#12.2-supported-document-types}

- **Formats:** PDF, DOCX  
- **Max file size:** 500 pages (per plan limits)  
- **Languages:** English (v6.0); other languages rejected with error message "Currently English language documents are supported. Please translate your document and resubmit."  
- **Accessibility:** Must be readable (scanned images rejected with error "Document could not be parsed. Please ensure it is not image-only and is readable.")

## 12.3 Framework Detection & Classification {#12.3-framework-detection-&-classification}

### 12.3.1 Detection Pipeline

1. **Parse & Tokenize:** Upload endpoint streams document to Claude Opus (streaming via API)  
2. **Framework Inference:** Opus analyzes first 30 pages to identify framework(s) and compliance standard  
3. **Confidence Scoring:** Opus outputs `framework_list` with confidence 0.0–1.0 per framework  
4. **Threshold Logic:**  
   - **≥0.80:** Framework accepted, proceeds to extraction  
   - **0.60–0.79:** "Low Confidence" badge appears, user prompted to confirm or correct via dropdown  
   - **\<0.60:** "Unknown Framework — Manual Review Recommended" message, dropdown lists common frameworks, user must select

### 12.3.2 Supported Frameworks

- **Compliance:** SOC 2 Type II, ISO 27001, HIPAA, GDPR, NIST Cybersecurity Framework, PCI-DSS  
- **Industry-Specific:** FedRAMP, HITRUST, SSAE 18, CIS Critical Security Controls  
- **Custom:** "Custom Policy / Other" — user must manually assign use case category (Security, Compliance, Operations, Data Privacy)

### 12.3.3 User Interaction

- **Confirmation Modal:** Appears immediately after upload, displays detected frameworks with confidence bars  
- **Actions:** Confirm & Continue, Edit Selection (opens dropdown), Cancel (discards upload)  
- **Dropdown:** Searchable, filtered by document context, displays framework \+ description (20 words max)

## 12.4 Control Extraction {#12.4-control-extraction}

### 12.4.1 Extraction Process

1. **Input:** Parsed document \+ confirmed framework(s)  
2. **Model:** Claude Opus (streaming)  
3. **Extraction:** Full document tokenized, Opus extracts discrete controls/requirements per framework structure  
4. **Output Schema:** Per control:  
   - `control_id` (string, framework-specific, e.g., "2.1.1" for ISO)  
   - `title` (string, ≤100 chars)  
   - `description` (string, ≤500 chars, Markdown supported)  
   - `framework_section` (string, e.g., "Access Control")  
   - `raw_text` (string, verbatim from document, used for traceability)  
   - `page_references` (array of ints, page numbers)

### 12.4.2 Failure Handling

- **Network error during extraction:** Retry up to 3x with exponential backoff (2s, 4s, 8s); if all fail, error toast: "Extraction failed. Please try again or contact support."  
- **Malformed PDF:** Error toast: "Document could not be processed. Please ensure it is a valid PDF or Word document."  
- **Token limit exceeded (\>100k tokens):** Partial results returned; toast warns "Document exceeded processing limit. Extracted 187 of 234 controls. Review extracted controls and re-upload remaining sections."  
- **Timeout (\>15 minutes):** Extraction cancelled, error toast: "Processing took too long. Please try again with a shorter document (under 300 pages)."

## 12.5 Deduplication {#12.5-deduplication}

### 12.5.1 Semantic Deduplication

1. **Trigger:** After extraction, if ≥2 controls exist  
2. **Model:** Claude Haiku (cost-optimized)  
3. **Process:**  
   - Compare all extracted controls pairwise  
   - Compute semantic similarity via embedding-based comparison  
   - Flag pairs with similarity ≥0.90 (90% threshold)  
4. **Output:** Dedup report with candidate groups, recommended merge action, retention score (which control to keep)  
5. **User Review:** Modal displays groups with toggle to accept/reject merge per pair  
6. **Failure:** If dedup fails (API error), issue toast "Deduplication failed. Review controls manually for duplicates." User can proceed without dedup or retry.

### 12.5.2 Dedup Modal Interaction

- **Layout:** List of detected duplicate pairs, each shows:  
  - Control A (title \+ framework \+ snippet)  
  - Control B (title \+ framework \+ snippet)  
  - Similarity score (0-100%)  
  - "Merge" checkbox (default checked if confidence \>95%)  
  - "Keep A" / "Keep B" radio buttons if merge is checked  
- **Actions:** "Accept All Recommendations", "Reject All", "Review Individually" (toggle each pair)  
- **Proceeding:** Deselected pairs are both retained; merged pairs discard non-selected control

## 12.6 Traceability Mapping {#12.6-traceability-mapping}

### 12.6.1 Mapping Process

1. **Trigger:** After dedup resolution  
2. **Model:** Claude Sonnet (balance of speed & accuracy)  
3. **Input:** Control set \+ original document text  
4. **Mapping:** For each control, identify:  
   - `source_section` (document section heading)  
   - `implementation_guidance` (extracted how-to or example from doc, ≤300 chars)  
   - `evidence_indicators` (what evidence would satisfy this control, ≤200 chars)  
5. **Output:** Enriched control objects with above fields added

### 12.6.2 Storage & Retrieval

- **Traceability data** stored in `control.traceability` object  
- Used in reports to show document source and evidence hints to vendors

## 12.7 Requirement Conversion & Amendment Protocol {#12.7-requirement-conversion-&-amendment-protocol}

### 12.7.1 Control-to-Requirement Mapping

After traceability, each control is converted to a requirement:

- **Source:** `control.control_id`, `control.title`, `control.description`, `control.framework_section`  
- **Requirement fields:**  
  - `title` (inherited from control title)  
  - `description` (inherited from control description)  
  - `category` (mapped from framework section, e.g., "Access Control" → Security)  
  - `type` (set to "Capability")  
  - `framework_reference` (control\_id \+ framework name, e.g., "ISO 27001 2.1.1")  
  - `use_case_id` (pre-selected based on framework context; user can override)  
  - `source` (set to "Policy Ingestion")  
  - `source_document_id` (traces back to uploaded PDF)

### 12.7.2 Amendment Protocol Entry

**Each generated requirement individually enters the Amendment Protocol (see Section 10.3):**

- **Initial state:** PENDING\_REVIEW (held in draft)  
- **Proposed by:** System (automation)  
- **Assigned to:** Workspace Owner (or Use Case Lead if framework matches known use case)  
- **Review deadline:** 7 days  
- **Notification:** Email sent to Workspace Owner with summary of all ingested requirements

### 12.7.3 Batch Amendment UI

**For workspaces with ≥5 proposed amendments:**

- **Batch Review Modal:** Workspace Owner can review all amendments in a single modal  
- **Layout:**  
  - Left panel: List of amendments (grouped by use case)  
  - Right panel: Detail view (title, description, framework ref, source doc)  
  - Action buttons: "Accept", "Request Changes", "Reject"  
- **Batch actions (top-level):** "Accept All", "Reject All", "Request Changes for All"  
- **Individual actions:** Per-amendment actions apply to that amendment only  
- **Partial approval:** User can accept 3, reject 2, request changes on 1 within the same batch  
- **Batch atomic contract:** Batch does NOT auto-close when all amendments are actioned. User must explicitly click "Close & Publish" to apply all changes. If user navigates away, batch state is persisted (not lost).  
- **Outcome:** Each amendment state transitions to APPROVED/REJECTED/PENDING\_REFINEMENT independently  
- **Publishing:** Approved amendments auto-transition to ACTIVE; rejected amendments are discarded; pending-refinement amendments remain in PENDING\_REVIEW until refined and re-submitted

## 12.8 Plan Limits & Costs {#12.8-plan-limits-&-costs}

### 12.8.1 Ingestion Limits

| Plan | Ingestions/Month | Max Pages/Upload | Total Pages/Month |
| :---- | :---- | :---- | :---- |
| Free | Not available | — | — |
| Business | 3 | 100 | 300 |
| Enterprise | Unlimited | 500 | Unlimited |

### 12.8.2 Cost Model

- **Framework Detection (Opus):** $15–30 per ingestion (varies by document length, batched for efficiency)  
- **Deduplication (Haiku):** \~$0.50 per ingestion (minimal token usage)  
- **Traceability Mapping (Sonnet):** $2–5 per ingestion  
- **Total per ingestion:** \~$17.50–35.50  
- **Passed to customer:** Bundled into per-ingestion cost (not per-page), displayed in pricing UI

## 12.9 Acceptance Criteria {#12.9-acceptance-criteria}

### 12.9.1 Framework Detection

- [ ] Confidence ≥0.80 → proceed without prompt  
- [ ] Confidence 0.60–0.79 → "Low Confidence" badge, confirmation modal shown  
- [ ] Confidence \<0.60 → "Unknown Framework" message, user selects framework from dropdown  
- [ ] User can edit framework selection before proceeding  
- [ ] Unsupported language detected → error message in toast, upload rejected  
- [ ] Scanned-image PDF → error message in toast, upload rejected

### 12.9.2 Control Extraction

- [ ] All controls extracted with control\_id, title, description, framework\_section, page\_references  
- [ ] Network error → retry 3x with exponential backoff; after 3 failures, error toast shown  
- [ ] Malformed PDF → error toast within 5 seconds  
- [ ] Token limit exceeded → partial results shown, warning toast indicates number of controls skipped  
- [ ] Timeout \>15min → user notified, extraction halted, user can retry

### 12.9.3 Deduplication

- [ ] Pairs with similarity ≥0.90 flagged for dedup  
- [ ] Modal displays both controls with similarity percentage  
- [ ] User can toggle "Merge" per pair; "Keep A"/"Keep B" radio buttons control retention  
- [ ] "Accept All Recommendations" button applies all default recommendations  
- [ ] API failure during dedup → error toast, user can proceed without dedup or retry

### 12.9.4 Traceability Mapping

- [ ] Each control enriched with source\_section, implementation\_guidance, evidence\_indicators  
- [ ] Data persists in control.traceability object  
- [ ] Traceability data displayed in reports

### 12.9.5 Amendment Protocol

- [ ] Each generated requirement enters PENDING\_REVIEW state in Amendment Protocol  
- [ ] Workspace Owner notified via email with summary of amendments  
- [ ] Batch Amendment modal displays when ≥5 amendments are PENDING\_REVIEW  
- [ ] User can accept/reject/request changes per amendment or in batch  
- [ ] Approved amendments transition to ACTIVE upon "Close & Publish"  
- [ ] Rejected amendments discarded; pending amendments remain in review  
- [ ] Batch state persists if user navigates away

### 12.9.6 Plan Limits

- [ ] Business plan: max 3 ingestions/month, max 100 pages/upload  
- [ ] Enterprise plan: unlimited ingestions, max 500 pages/upload  
- [ ] Over-limit attempts show error toast with upgrade prompt

---

# 13\. Scoring & Grading {#13.-scoring-&-grading}

## 13.1 Overview {#13.1-overview}

Scoring is the process by which evaluators grade vendor responses against requirements using a standardized rubric. Scores are aggregated into use case and vendor totals, which feed into scenario modeling and TCO blending. Scoring is available in Phases 10–11 and immutable at Phase 12 entry.

## 13.2 Rubric Definition {#13.2-rubric-definition}

### 13.2.1 Grade Scale

| Grade | Code | Value | Definition |
| :---- | :---- | :---- | :---- |
| Fully Meets | FM | 1.0 | Vendor response fully satisfies the requirement |
| Partially Meets | PM | 0.1–0.9 (configurable) | Vendor response satisfies part of the requirement |
| Does Not Meet | DNM | 0.0 | Vendor does not address the requirement |
| Excluded | EX | — | Vendor-requirement pair is excluded from scoring |

### 13.2.2 Rubric Configuration

- **PM Default Value:** 0.6 (configurable per workspace, range 0.1–0.9)  
- **FM Value:** Locked at 1.0  
- **DNM Value:** Locked at 0.0  
- **EX Handling:** Per-vendor per-requirement. See Section 13.4.  
- **Grade assignment:** Via dropdown during scoring, always in view

## 13.3 Requirement Weighting {#13.3-requirement-weighting}

### 13.3.1 Weight Definition

- **Range:** 0–20 (integer)  
- **Semantics:**  
  - 0 \= Informational (excluded from scoring denominator)  
  - 1–5 \= Low importance  
  - 6–10 \= Medium importance  
  - 11–15 \= High importance  
  - 16–20 \= Critical  
- **Enforced rule:** Informational requirements (weight 0\) cannot be manually changed to non-zero; they are locked at 0 and appear with "Informational" label  
- **Configuration:** Set at use case creation or edited via Workspace Settings \> Use Cases

### 13.3.2 Weight Validation

- **Scenario Modeling:** All weights in a scenario cannot simultaneously be 0 (would cause divide-by-zero). Validation rule enforced on save.  
- **Error message:** "At least one requirement must have a non-zero weight."

## 13.4 Exclusion Handling (EX Grade) {#13.4-exclusion-handling-(ex-grade)}

### 13.4.1 Per-Vendor Exclusion Logic

- **EX is per-vendor:** Vendor A can be excluded (EX) on Requirement 1, while Vendor B is graded (FM/PM/DNM) on the same requirement  
- **Denominator impact:**  
  - For Vendor A: Requirement 1 is NOT in the denominator (not counted toward total requirements)  
  - For Vendor B: Requirement 1 IS in the denominator (all non-zero-weight requirements included)  
- **Example:**  
  - Requirement 1 (weight 5), Requirement 2 (weight 3\)  
  - Vendor A: Req1=EX, Req2=FM → Total \= (0 × 5 \+ 1.0 × 3\) / 3 \= 1.0 (100%)  
  - Vendor B: Req1=FM, Req2=DNM → Total \= (1.0 × 5 \+ 0.0 × 3\) / 8 \= 0.625 (62.5%)

### 13.4.2 Exclusion Proposal & Approval

- **Who proposes:** Reviewer (scoring team member)  
- **How:** Dropdown shows "Exclude (EX)" option alongside FM/PM/DNM  
- **Additional field:** `exception_reason` (required, ≤200 chars) explains why vendor is excluded  
  - Examples: "Vendor does not operate in target geography", "Vendor already contracted; this is reference only"  
- **Approval required:** Workspace Owner OR Use Case Lead (if assigned)  
- **Until approved:** EX grade is in PENDING state (visually distinct, maybe gray background)  
- **Approval action:** Reviewer sees pending EX grades in a queue; approver reviews reason and clicks "Approve" or "Reject"  
- **If rejected:** Grade reverts to blank, reviewer must re-submit with FM/PM/DNM or a different EX reason  
- **Audit trail:** All EX proposals (approved and rejected) logged with timestamp, proposer, approver, reason

## 13.5 Score Modification & Audit Trail {#13.5-score-modification-&-audit-trail}

### 13.5.1 Append-Only Grades

- **Data structure:** `individual_grades[]` is an array, never mutated. New grades always appended.  
- **Grade object schema:**  
    
  {  
    
    id: uuid,  
    
    user\_id: string,  
    
    grade: "FM" | "PM" | "DNM" | "EX",  
    
    value: number (0.0–1.0, or null if EX),  
    
    supersedes: uuid (reference to prior grade.id, if this is an override),  
    
    timestamp: ISO 8601,  
    
    note: string (optional, reviewer's justification for override)  
    
  }  
    
- **Latest grade:** Computed as the last entry in `individual_grades[]` where `supersedes` is null or does not reference the current entry  
- **Prior entry retention:** All prior entries remain in the array for audit; marked as "superseded" in UI

### 13.5.2 Override Tracking

- **Override definition:** A new grade submitted when a prior non-null grade already exists for the same user-req-vendor triplet  
- **Override rate calculation:** `(total overrides / total grades) × 100%`, displayed per-use-case and workspace-wide  
- **Override cap:** No limit on overrides during Phases 10–11. At Phase 12 entry, all grades locked immutable.  
- **UI indication:** Superseded grades shown with strikethrough; new grade highlighted in yellow for 5 seconds  
- **Justification:** Override note is optional but recommended. If not provided, system suggests "No justification provided."

## 13.6 Collaborative Scoring & Disagreement Resolution {#13.6-collaborative-scoring-&-disagreement-resolution}

### 13.6.1 Concurrent Editing (Collaborative Scoring, Business+)

- **Per-user grades:** Each reviewer writes to their own entry in `individual_grades[]`. No write conflicts.  
- **Aggregated score:** Computed reactively from all entries in the array  
- **Real-time updates:** Via Convex subscriptions, live presence indicators show who is currently scoring which requirement  
- **Score independently toggle:** Each reviewer can toggle "Score Independently" to hide all other reviewers' grades until they submit. After submit, other grades become visible.  
- **Optimistic mutations:** UI shows user's grade immediately; if phase locks or validation fails, grade reverts with error toast

### 13.6.2 Divergence Detection & Resolution

- **Divergence definition:** When 2+ reviewers have independently scored the same requirement-vendor pair, compare the grades  
- **Divergence threshold:**  
  - If divergence (max\_grade − min\_grade) ≥ 0.3 → Disagreement Insight Card appears  
  - If divergence ≥ 0.6 (≥2 rubric levels, e.g., FM vs DNM) → Automatic escalation to Use Case Lead  
- **Disagreement Card UI:**  
  - Shows both grades with reviewer names  
  - Displays divergence % (calculated as percentage distance between grades on 0.0–1.0 scale)  
  - "Review Disagreement" button opens modal  
  - Card appears in matrix view, expandable  
- **Use Case Lead Escalation Modal:**  
  - Shows both grades with reviewer justifications (if available)  
  - Display calculation of average grade  
  - Options for Lead:  
    1. **Accept Average:** Grade set to mean of the two grades (e.g., FM & DNM → 0.5), logged as Lead decision  
    2. **Override to specific grade:** Dropdown allows Lead to select FM/PM/DNM, enters override justification (required), appends new entry to grades array with `supersedes` referencing both prior grades  
    3. **Request Re-Evaluation:** Sends notification to both reviewers, returns to independent scoring, locks in re-evaluation deadline (48 hours)  
  - **Final decision:** Lead's override is appended to grades array and is final (cannot be overridden again)  
  - **Audit:** All disagreement resolutions logged with Lead name, decision, timestamp, justification

## 13.7 Score Calculation & Aggregation {#13.7-score-calculation-&-aggregation}

### 13.7.1 Vendor-Requirement Score

- **Formula:**  
    
  score\_vr \= latest\_grade\_value (FM/PM/DNM/EX)  
    
- **If EX:** Excluded from denominator for this vendor

### 13.7.2 Vendor Total Score (Per Use Case)

- **Formula:**  
    
  vendor\_use\_case\_score \=   
    
    SUM(score\_vr × weight\_r for all requirements where weight\_r \> 0 and grade ≠ EX)  
    
    /  
    
    SUM(weight\_r for all requirements where weight\_r \> 0 and grade ≠ EX)  
    
- **Output:** 0.0–1.0, displayed as percentage (0–100%)  
- **Minimum requirements:** If only 1 requirement with weight \> 0, score \= score\_vr × weight\_r / weight\_r \= score\_vr

### 13.7.3 Vendor Blended Score (All Use Cases \+ TCO)

- **Precondition:** Requires scenario definition (Section 14\)  
- **Formula:**  
    
  blended\_score \=   
    
    (SUM(vendor\_use\_case\_score × use\_case\_weight) \+ (tco\_percentile × tco\_value\_weight))   
    
    /  
    
    (SUM(use\_case\_weight) \+ tco\_value\_weight)  
    
  - `vendor_use_case_score` \= vendor's score on this use case (0.0–1.0)  
  - `use_case_weight` \= multiplier for this use case (0.0–5.0, from scenario)  
  - `tco_percentile` \= vendor's percentile rank in TCO (0.0–1.0), see Section 15  
  - `tco_value_weight` \= weight given to TCO (0.0–1.0, from scenario)  
  - See Section 14 for scenario parameter details

## 13.8 Auto-Scoring Rules {#13.8-auto-scoring-rules}

### 13.8.1 Boolean Requirements

- **Definition:** Requirements with only 2 valid answers (Yes/No or Present/Not Present)  
- **Auto-grading:**  
  - Vendor response \= "Yes" → FM (1.0)  
  - Vendor response \= "No" → DNM (0.0)  
- **Manual override:** Reviewer can manually override auto-grade; new grade appended to array with supersedes reference  
- **UI:** Auto-graded requirements marked with "Auto" label; grade locked until override submitted

### 13.8.2 Pricing Requirements

- **Exclusion:** Pricing requirements are NOT scored via FM/PM/DNM rubric  
- **Instead:** Pricing data extracted into TCO model (Section 15); does not contribute to capability scoring  
- **Weight:** Pricing requirements have weight 0 (informational) and cannot be manually scored  
- **Label:** Marked "Pricing (TCO Only)" in matrix

### 13.8.3 Informational Requirements

- **Definition:** Requirements with weight \= 0  
- **Scoring:** Not scored; no grade assigned  
- **Calculation:** Excluded from numerator and denominator in vendor\_use\_case\_score  
- **UI:** Marked "Informational" label, no grade dropdown shown, grayed out in matrix

## 13.9 Scoring Phase Lifecycle {#13.9-scoring-phase-lifecycle}

### 13.9.1 Phase 10 (Scoring)

- Scoring unlocked; reviewers can grade vendor responses  
- Collaborative scoring enabled (Business+)  
- Grades are mutable; changes tracked in append-only array  
- Override rate visible to reviewers

### 13.9.2 Phase 11 (Decision)

- Scoring continues; further overrides allowed  
- Scenario modeling and TCO adjustments finalized  
- Disagreement resolution must be completed before Phase 12 entry

### 13.9.3 Phase 12 Entry (Post-Decision)

- **Immutability enforcement:** All grades locked. `individual_grades[]` marked read-only.  
- **Timestamp:** Phase 12 entry timestamp recorded as `scoring_locked_at`  
- **Violation prevention:** Any attempt to grade or modify grades in Phase 12+ results in error: "Scoring is locked. Phase 12 (Post-Decision) has begun."  
- **Report finalization:** Grades used to generate final reports; reports cached (see Section 17\)

## 13.10 Acceptance Criteria {#13.10-acceptance-criteria}

### 13.10.1 Rubric & Grading

- [ ] FM, PM, DNM grades available; PM value configurable 0.1–0.9  
- [ ] EX grade available; requires exclusion reason  
- [ ] Weight range 0–20 enforced; informational (weight 0\) not manually changeable  
- [ ] Grade dropdown always visible in matrix view

### 13.10.2 Exclusion (EX)

- [ ] EX is per-vendor-per-requirement; does not affect other vendors  
- [ ] EX excludes requirement from denominator for that vendor only  
- [ ] Exception reason required (≤200 chars)  
- [ ] EX in PENDING state until approved by Workspace Owner/Use Case Lead  
- [ ] Approval queue visible in Workspace Owner dashboard  
- [ ] All EX proposals (approved/rejected) logged with metadata

### 13.10.3 Append-Only & Audit

- [ ] New grades appended to individual\_grades\[\] array; prior grades retained  
- [ ] Supersedes reference links override to prior grade  
- [ ] Override rate calculated and displayed per-use-case and workspace-wide  
- [ ] Superseded grades shown with strikethrough in audit view  
- [ ] No limit on overrides during Phases 10–11

### 13.10.4 Concurrent Editing

- [ ] Two reviewers can independently score same requirement-vendor pair without write conflict  
- [ ] Real-time presence indicators show active reviewers  
- [ ] "Score Independently" toggle hides other grades until submit  
- [ ] Optimistic mutations revert on validation failure or phase lock

### 13.10.5 Disagreement Resolution

- [ ] Divergence ≥0.3 → Disagreement Card appears  
- [ ] Divergence ≥0.6 → Automatic escalation to Use Case Lead  
- [ ] Use Case Lead can accept average, override to specific grade, or request re-eval  
- [ ] Re-eval deadline set to 48 hours; reviewers notified  
- [ ] All disagreement resolutions logged with metadata  
- [ ] Lead override is final; cannot be overridden again

### 13.10.6 Score Calculation

- [ ] Vendor-use-case score \= SUM(grade × weight) / SUM(weight) for non-EX, non-zero-weight  
- [ ] Blended score includes TCO percentile weighting per scenario  
- [ ] Auto-scoring for boolean requirements: Yes→FM, No→DNM  
- [ ] Pricing requirements excluded from capability scoring  
- [ ] Informational requirements not scored; excluded from denominator

### 13.10.7 Phase Immutability

- [ ] Grades mutable in Phases 10–11  
- [ ] At Phase 12 entry, individual\_grades\[\] marked immutable  
- [ ] Attempt to score in Phase 12+ → error toast  
- [ ] scoring\_locked\_at timestamp recorded

---

# 14\. Scenario Modeling {#14.-scenario-modeling}

## 14.1 Overview {#14.1-overview}

Scenario Modeling allows evaluators to define alternative weighting schemes, exclusions, and threshold configurations to rank vendors under different business assumptions. Scenarios are independent; multiple scenarios can coexist. Each scenario produces a ranked vendor list and optional comparison view.

## 14.2 Scenario Definition {#14.2-scenario-definition}

### 14.2.1 Scenario Object Schema

{

  "id": "uuid",

  "workspace\_id": "uuid",

  "name": "string (≤100 chars)",

  "description": "string (≤300 chars, optional)",

  "created\_by": "user\_id",

  "created\_at": "ISO 8601",

  "updated\_at": "ISO 8601",

  "parameters": {

    "weight\_overrides": {

      "use\_case\_id": "float (0.0–5.0)",

      "...": "float"

    },

    "excluded\_vendors": \[

      "target\_account\_id",

      "..."

    \],

    "excluded\_use\_cases": \[

      "use\_case\_id",

      "..."

    \],

    "rubric\_overrides": {

      "pm\_value": "float (0.1–0.9)"

    },

    "min\_threshold": "float (0.0–1.0)",

    "tco\_value\_weight": "float (0.0–1.0)"

  },

  "results": {

    "ranked\_vendors": \[

      {

        "vendor\_id": "uuid",

        "blended\_score": "float (0.0–1.0)",

        "use\_case\_scores": { "use\_case\_id": "float", ... },

        "tco\_percentile": "float (0.0–1.0)",

        "passed\_threshold": "boolean"

      },

      "..."

    \],

    "computed\_at": "ISO 8601"

  }

}

### 14.2.2 Parameter Defaults

- **weight\_overrides:** Empty object (no overrides); all use cases use original weight  
- **excluded\_vendors:** Empty array  
- **excluded\_use\_cases:** Empty array  
- **rubric\_overrides.pm\_value:** Inherited from workspace default (0.1–0.9)  
- **min\_threshold:** 0.0 (no minimum)  
- **tco\_value\_weight:** 0.5 (equal weight to TCO and capability scoring)

## 14.3 Scenario Validation {#14.3-scenario-validation}

### 14.3.1 Validation Rules

All rules enforced on save. Errors listed inline above scenario form.

| Rule | Condition | Error Message |
| :---- | :---- | :---- |
| No all-zero weights | `SUM(weight_override[*]) + SUM(original_weight[non-excluded]) > 0` | "At least one use case must have a non-zero weight." |
| Vendor not excluded entirely | `COUNT(vendors) - COUNT(excluded_vendors) ≥ 1` | "At least one vendor must remain. Cannot exclude all vendors." |
| PM override range | `0.1 ≤ pm_value ≤ 0.9` | "PM override must be between 0.1 and 0.9." |
| Weight multiplier range | `0.0 ≤ multiplier ≤ 5.0` | "Weight multiplier must be between 0.0 and 5.0." |
| Min threshold range | `0.0 ≤ min_threshold ≤ 1.0` | "Minimum threshold must be between 0.0 and 1.0." |
| TCO weight range | `0.0 ≤ tco_value_weight ≤ 1.0` | "TCO value weight must be between 0.0 and 1.0." |

### 14.3.2 Error Presentation

- Errors displayed in a collapsible alert above the form (red background, icon)  
- Error messages listed as bullet points  
- Each error linked to the offending field (on click, scroll to field and highlight)  
- Save button disabled until all errors resolved

## 14.4 Scenario Scoring & Ranking {#14.4-scenario-scoring-&-ranking}

### 14.4.1 Blended Score with Scenario Overrides

- **Formula (revised with scenario parameters):**  
    
  blended\_score \=   
    
    (SUM(vendor\_use\_case\_score × effective\_weight) \+ (tco\_percentile × tco\_value\_weight))   
    
    /  
    
    (SUM(effective\_weight) \+ tco\_value\_weight)  
    
  where:  
    
    effective\_weight \= weight\_override\[use\_case\_id\] OR original\_weight\[use\_case\_id\]  
    
    vendor\_use\_case\_score uses rubric\_overrides.pm\_value if provided  
    
    tco\_percentile \= vendor's percentile in TCO ranking (0.0–1.0)

### 14.4.2 Ranking & Threshold

- **Ranked by:** Blended score, descending (highest score \= rank 1\)  
- **Threshold filtering:** Vendors with blended\_score \< min\_threshold marked as "Below Threshold" (still ranked, but highlighted in gray)  
- **Output:** Ranked vendor list with scores per use case, blended score, TCO percentile, threshold pass/fail

### 14.4.3 Recalculation

- **Trigger:** User saves scenario parameters  
- **Latency:** \<2 seconds (cached scoring data)  
- **Persistence:** Results persisted in `scenario.results`; timestamp in `computed_at`  
- **Refresh:** User can manually refresh results via "Recalculate" button; updates `computed_at`

## 14.5 Scenario Comparison View {#14.5-scenario-comparison-view}

### 14.5.1 Comparison Limit

- **Max scenarios in comparison:** 5 simultaneous  
- **Exceeding limit:** If user has \>5 scenarios, comparison UI shows dropdown to select which 5 to compare  
- **UI:** Toggle "Compare Scenarios" in scenario list; checkboxes appear, user selects ≤5, "Compare" button enabled

### 14.5.2 Comparison Matrix

- **Layout:** Matrix view (Section 11.3.2) with:  
  - **Rows:** Vendors (sorted by top scenario rank)  
  - **Columns:** Scenario 1 rank, Scenario 1 score, Scenario 2 rank, Scenario 2 score, ... (repeating)  
  - **Cell contents:** Rank (1–N) and score (% format), color-coded per scenario  
  - **Difference column (optional):** Shows ±rank change and ±score change vs. Scenario 1 (primary scenario)  
- **Interactions:**  
  - Click vendor row → detail view showing full score breakdown across all scenarios  
  - Hover cell → tooltip with breakdown (e.g., "Security: 0.95, Compliance: 0.88, TCO: 72nd percentile")  
  - Export → CSV with all scores and ranks

### 14.5.3 Scenario Sensitivity Analysis

- **Trigger:** "View Sensitivity" button in comparison view  
- **Purpose:** Show which parameter changes had the largest impact on vendor ranking  
- **Output:** Interactive chart showing:  
  - X-axis: Parameter (weight override, TCO weight, PM override, threshold)  
  - Y-axis: Rank change (for \#1 ranked vendor)  
  - Visualization: Line chart showing sensitivity curve  
- **Interaction:** Hover point → tooltip shows parameter value and resulting rank change  
- **Export:** Sensitivity data available in CSV export

## 14.6 Scenario Lifecycle & Permissions {#14.6-scenario-lifecycle-&-permissions}

### 14.6.1 Creation & Ownership

- **Creator:** Workspace Owner or Use Case Lead  
- **Ownership:** Workspace-level; visible to all team members with Viewer+ role  
- **Default scenario:** Workspace has implicit "Original Scoring" scenario (immutable, uses all original weights and rubric)

### 14.6.2 Editing & Deletion

- **Edit:** Only creator or Workspace Owner can edit scenario parameters  
- **Delete:** Only Workspace Owner can delete scenario; cannot delete "Original Scoring"  
- **Audit trail:** All scenario edits (parameter changes) logged with user, timestamp, before/after values

### 14.6.3 Immutability After Phase 12

- **At Phase 12 entry:** All scenarios locked; parameters and results immutable  
- **Reporting:** Final scenario results used in phase post-decision reports

## 14.7 Simulation Mode {#14.7-simulation-mode}

### 14.7.1 Interactive Scenario Adjustment

- **Trigger:** Press `S` while in Scenario view  
- **Entry:** Orange banner appears at top: "Simulation Mode — unsaved changes"  
- **State:** All parameter fields become editable inline (no need to click "Edit")  
- **Real-time recalculation:** Ranking updates live as user adjusts sliders/inputs  
- **Controls:** Inline sliders for weight multiplier (0.0–5.0), PM override (0.1–0.9), TCO weight (0.0–1.0)  
- **Checkboxes:** Vendor/use case exclusions as inline checkboxes  
- **Save:** Press `Cmd+S` (or `Ctrl+S` on Windows) to save simulation as a new scenario  
- **Reset:** Press `R` to revert to last saved state; exit simulation mode  
- **Exit:** Press `S` again or click X button to exit without saving

### 14.7.2 Simulation Limitations

- **No persistence:** If user navigates away without saving, simulation state is lost  
- **Separate from existing scenarios:** Simulation is a volatile session state; not saved to database  
- **Single simulation:** Only one active simulation per user session

## 14.8 Plan Limits & Report Integration {#14.8-plan-limits-&-report-integration}

### 14.8.1 Scenario Limits

| Plan | Max Scenarios | Report Integration |
| :---- | :---- | :---- |
| Free | Not available | — |
| Business | 10 scenarios | No report integration; results viewable in app only |
| Enterprise | 50 scenarios | Full integration; scenarios can be included/excluded in reports |

### 14.8.2 Report Integration (Enterprise)

- **Feature:** When generating a report, user can select which scenarios to include  
- **Report output:** For each included scenario, report shows ranked vendor list with scores and threshold status  
- **Comparison section:** Report can include scenario comparison matrix (shows top 5 scenarios only)

## 14.9 Acceptance Criteria {#14.9-acceptance-criteria}

### 14.9.1 Scenario Definition & Validation

- [ ] Scenario object persists with all parameters: weight\_overrides, excluded\_vendors/use\_cases, rubric\_overrides, thresholds, TCO weight  
- [ ] Save validation enforces: ≥1 vendor remaining, ≥1 use case with weight \> 0, parameter ranges  
- [ ] Errors displayed inline, linked to offending fields, Save button disabled until resolved  
- [ ] All validation rules from Table 14.3.1 enforced

### 14.9.2 Ranking & Scoring

- [ ] Blended score calculated per vendor using effective\_weight (overrides or original)  
- [ ] Vendors ranked by blended score descending  
- [ ] Threshold filtering marks vendors below min\_threshold; still ranked but visually distinct  
- [ ] Recalculation triggered on save; latency \<2s  
- [ ] Results persisted with computed\_at timestamp

### 14.9.3 Comparison View

- [ ] Max 5 scenarios compared; user selects which 5 if \>5 exist  
- [ ] Matrix displays rank \+ score per scenario per vendor  
- [ ] Difference column shows ±rank and ±score vs. primary scenario  
- [ ] Vendor row click opens detail view with full score breakdown  
- [ ] Sensitivity analysis chart shows parameter impact on top vendor rank  
- [ ] Export available (CSV)

### 14.9.4 Simulation Mode

- [ ] `S` key enters Simulation Mode; orange banner shown  
- [ ] Parameters editable inline (no "Edit" button required)  
- [ ] Real-time ranking updates as user adjusts sliders  
- [ ] `Cmd+S` / `Ctrl+S` saves simulation as new scenario  
- [ ] `R` resets to last saved state  
- [ ] `S` again exits simulation without saving  
- [ ] Navigation away without save loses simulation state

### 14.9.5 Plan Limits

- [ ] Free: scenarios not available  
- [ ] Business: max 10 scenarios, no report integration  
- [ ] Enterprise: max 50 scenarios, report integration enabled

---

# 15\. TCO Modeling {#15.-tco-modeling}

## 15.1 Overview {#15.1-overview}

Total Cost of Ownership (TCO) modeling aggregates vendor pricing data across multiple pricing structures (flat, tiered, one-time, percentage, estimate range, discount) and projects costs over a configurable time horizon (1–10 years). TCO feeds into Blended Score via tco\_value\_weight (Section 13.7.3).

## 15.2 TCO Use Cases & Pricing Requirements {#15.2-tco-use-cases-&-pricing-requirements}

### 15.2.1 TCO Use Case Definition

- **Distinct from Capability Use Cases:** TCO Use Cases capture only pricing, not functional requirements  
- **Examples:**  
  - "License Cost (Year 1–3)" → collects per-seat and volume pricing  
  - "Implementation Services" → one-time costs  
  - "Ongoing Support" → annual recurring  
- **Requirements within TCO Use Case:** All are "Pricing" type, no FM/PM/DNM scoring  
- **Weight:** All pricing requirements have weight 0 (informational); cannot be scored  
- **Output:** Dollar value per vendor, aggregated into TCO total

### 15.2.2 Pricing Requirement Schema

{

  "id": "uuid",

  "use\_case\_id": "uuid (TCO use case)",

  "title": "string (≤100 chars)",

  "description": "string (≤300 chars)",

  "type": "Pricing",

  "pricing\_structure": "flat | tiered | one\_time | percentage\_of\_license | estimate\_range | discount",

  "weight": 0,

  "response\_required": "boolean",

  "unit": "string (e.g., 'USD', 'per seat', 'per year')"

}

### 15.2.3 Pricing Structures

Each structure captures different vendor pricing models:

**Flat Rate**

- Example: "$50k per year"  
- Vendor inputs: amount, currency  
- Annual cost \= amount

**Tiered Pricing**

- Example: "$100/seat for 1–50 users, $80/seat for 51–100, $60/seat for 100+"  
- Vendor inputs: tier definitions (min\_qty, max\_qty, price\_per\_unit)  
- Calculation: Based on projected seat count, determine applicable tier(s), calculate weighted cost

**One-Time Cost**

- Example: "Implementation: $15,000"  
- Vendor inputs: amount, currency  
- Year 1 cost \= amount; Years 2+ \= $0

**Percentage of License**

- Example: "Maintenance is 15% of license cost per year"  
- Vendor inputs: base\_requirement\_id (reference to another pricing req), percentage  
- Calculation: percentage × (cost from base\_requirement\_id)

**Estimate Range**

- Example: "$20k–$30k annually"  
- Vendor inputs: min\_amount, max\_amount, currency  
- Calculation: Use midpoint for projections; flag as estimate in reports

**Discount**

- Example: "5% discount for multi-year commitment"  
- Vendor inputs: discount\_percentage, applied\_to (e.g., "Years 2–3")  
- Calculation: Reduce applicable years' costs

## 15.3 TCO Projection {#15.3-tco-projection}

### 15.3.1 Projection Parameters

- **Projection years:** 1–10 (default 3\)  
- **Seat count:** Input by Workspace Owner (applies to all vendors)  
- **Seat growth rate:** Year-over-year multiplier (0.0–0.5, default 0.0 \= no growth)  
- **Currency:** Workspace default (e.g., USD)  
- **No year-over-year cost escalation in v6.0:** Vendor's quoted costs are static. If vendor quotes "$50k/year", that $50k applies to all 3 years. Seat growth affects volume-based pricing (tiered, per-seat); flat rates do not scale.

### 15.3.2 Seat Growth Compounding

- **Formula:**  
    
  year\_N\_seats \= initial\_seats × (1 \+ growth\_rate) ^ (N \- 1\)  
    
- **Example:** Initial 100 seats, growth\_rate 0.1 (10%):  
  - Year 1: 100  
  - Year 2: 100 × 1.1 \= 110  
  - Year 3: 100 × 1.1^2 \= 121  
- **Application:** Tiered and per-seat pricing recalculated for each year's projected seat count; flat rates unaffected

### 15.3.3 TCO Calculation (Per Vendor)

- **Aggregate cost per year:**  
    
  year\_N\_cost \= SUM(annual\_cost\[requirement\_i\] for all pricing requirements)  
    
- **Multi-year TCO:**  
    
  total\_tco \= SUM(year\_N\_cost for years 1 to projection\_years)  
    
- **Cost per seat (annual):**  
    
  cost\_per\_seat\_year\_N \= year\_N\_cost / year\_N\_seats  
    
- **Cumulative cost per seat:**  
    
  cumulative\_cost\_per\_seat \= total\_tco / (average seats across all years)

### 15.3.4 TCO Breakdown Report

For each vendor, show:

- **Year-by-year table:** Year | Projected Seats | Cost | Cost/Seat  
- **Cost by component:** (per pricing requirement) Year 1 cost, Year 2 cost, ..., Total  
- **Total TCO:** Multi-year sum  
- **Cost per seat:** Cumulative average  
- **Comparison:** Rank vendors by cost/seat; highlight lowest cost vendor

## 15.4 TCO vs Standard Scoring {#15.4-tco-vs-standard-scoring}

### 15.4.1 Scoring Separation

- **TCO requirements:** Not scored via FM/PM/DNM. They generate dollar values only.  
- **Capability requirements:** Scored via FM/PM/DNM; produce 0.0–1.0 grade.  
- **TCO feeds Blended Score:** Via tco\_percentile (see Section 13.7.3), weighted by tco\_value\_weight in scenario  
- **tco\_value\_weight \= 0.0:** TCO is informational only; appears in reports but does not affect ranking  
- **tco\_value\_weight \= 1.0:** TCO and capability scores equally weighted in blended score

### 15.4.2 TCO Percentile Calculation

- **Ranking:** Vendors ranked by total\_tco, ascending (lowest cost \= rank 1\)  
- **Percentile:**  
    
  tco\_percentile \= (N \- vendor\_rank) / (N \- 1\)  
    
  where N \= total number of vendors  
    
- **Example:** 5 vendors, Vendor B is rank 3 in cost (3rd lowest) → percentile \= (5 − 3\) / (5 − 1\) \= 0.5  
- **Usage:** Blended score formula includes `tco_percentile × tco_value_weight`

## 15.5 TCO Modeling & Editing {#15.5-tco-modeling-&-editing}

### 15.5.1 TCO Configuration UI

- **Location:** Sourcing \> Use Cases \> \[TCO Use Case\] \> Configure Pricing  
- **Inputs:**  
  - Projection years (slider 1–10, default 3\)  
  - Initial seat count (number input, default 1\)  
  - Seat growth rate (slider 0.0–0.5 in 1% increments, default 0.0)  
  - Currency (dropdown, workspace default)  
- **Preview:** Live table shows projected seats and inflation-adjusted costs year-by-year  
- **Validation:**  
  - Seats ≥1, years ≥1, growth\_rate 0.0–0.5  
  - Error message if invalid: "Initial seats must be ≥1. Projection years must be 1–10. Growth rate must be 0–50%."

### 15.5.2 Editing & Recalculation

- **Who can edit:** Workspace Owner, Use Case Lead  
- **Changes apply to:** All vendors' TCO calculations immediately upon save  
- **Recalculation:** Automatic, \<2s latency  
- **Notification:** Toast confirms "TCO projections updated."  
- **Re-ranking:** Vendor blended scores recalculated if scenario includes TCO blending

## 15.6 Plan Limits {#15.6-plan-limits}

### 15.6.1 Pricing Requirement Limits

| Plan | Max Pricing Requirements |
| :---- | :---- |
| Free | Not available |
| Business | 20 per workspace |
| Enterprise | Unlimited |

### 15.6.2 Over-Limit Handling

- **Business plan:** At 20 pricing requirements, create button for new requirement shows error tooltip: "You have reached the limit of 20 pricing requirements. Upgrade to Enterprise for unlimited pricing requirements."  
- **Enterprise:** No limit

## 15.7 Acceptance Criteria {#15.7-acceptance-criteria}

### 15.7.1 TCO Use Case & Pricing Requirements

- [ ] TCO Use Cases distinct from capability use cases  
- [ ] Pricing requirements have type "Pricing", weight 0, not scored  
- [ ] All 6 pricing structures supported: flat, tiered, one\_time, percentage\_of\_license, estimate\_range, discount  
- [ ] Vendor can respond to pricing requirements; response stored as dollar value or range

### 15.7.2 Projection Parameters

- [ ] Projection years range 1–10 (default 3\)  
- [ ] Seat count configurable, applies to all vendors  
- [ ] Seat growth rate 0.0–0.5 (default 0.0), no year-over-year cost escalation beyond growth  
- [ ] Seat growth compounds: year\_N\_seats \= initial\_seats × (1 \+ growth\_rate)^(N-1)  
- [ ] Currency configurable (workspace default)

### 15.7.3 TCO Calculation

- [ ] Year N cost \= SUM(annual cost per pricing requirement)  
- [ ] Multi-year TCO \= SUM(year costs)  
- [ ] Cost per seat calculated annually and cumulatively  
- [ ] Year-by-year table and cost breakdown visible per vendor

### 15.7.4 Ranking & Blending

- [ ] Vendors ranked by total TCO ascending (lowest cost \= rank 1\)  
- [ ] TCO percentile \= (N − rank) / (N − 1\)  
- [ ] TCO feeds Blended Score via tco\_percentile × tco\_value\_weight  
- [ ] If tco\_value\_weight \= 0, TCO informational only  
- [ ] Blended score recalculated on TCO configuration change

### 15.7.5 Plan Limits

- [ ] Free: not available  
- [ ] Business: max 20 pricing requirements  
- [ ] Enterprise: unlimited pricing requirements  
- [ ] Over-limit: error tooltip on create button (Business)

---

# 16\. Organizational Intelligence {#16.-organizational-intelligence}

## 16.1 Overview {#16.1-overview}

Organizational Intelligence synthesizes vendor performance data across all workspaces in an organization, identifying patterns, discrepancies, predictive insights, and efficiency metrics. Intelligence is available Phase 10+ and accessible only to Org Owner and Org Admin.

## 16.2 Intelligence Data Sources {#16.2-intelligence-data-sources}

### 16.2.1 Cache Types

Four types of cached intelligence data persist indefinitely in a read-only cache:

**Vendor Performance**

- **Source:** Final scores from all completed workspaces  
- **Metrics:** Average score, score trend (improving/declining), volatility (std dev)  
- **Retention:** All workspaces (organization-wide)  
- **Freshness:** Updated post-Phase 12

**Efficiency Metrics**

- **Source:** Workspace timelines, team velocity  
- **Metrics:** Avg phase duration, SLA compliance %, review velocity (scores per day), decision latency  
- **Retention:** All workspaces  
- **Freshness:** Updated post-Phase 12

**Discrepancy Analysis**

- **Source:** Identical requirements evaluated across 2+ workspaces  
- **Metrics:** Score variance threshold (≥0.3 difference on ≥3 overlapping requirements), root-cause analysis  
- **Retention:** All workspaces within same organization only (no cross-org)  
- **Freshness:** Updated post-Phase 12

**Predictive Suggestions**

- **Source:** Historical vendor performance, team preferences, market data  
- **Metrics:** Likely top candidates, flag potential mismatches, suggest exclusions based on prior patterns  
- **Freshness:** Updated weekly via batch job

### 16.2.2 Briefing Document

- **Purpose:** Synthesized summary of all 4 cache types, rendered as prose \+ charts  
- **TTL:** 30 days. After 30 days, briefing is archived (marked read-only).  
- **Regeneration:** User can regenerate briefing at any time using current cache data. New briefing has fresh 30-day TTL.  
- **Underlying cache:** Persists indefinitely; regenerating does not lose data.

## 16.3 Vendor Performance Briefing {#16.3-vendor-performance-briefing}

### 16.3.1 Performance Summary

- **Vendor name \+ org-wide average score:** e.g., "Acme Corp: 87% average score across 12 evaluations"  
- **Score trend:** "↑ Improving (avg \+3.2% per evaluation over last 6 months)" or "→ Stable (±2%)" or "↓ Declining"  
- **Volatility:** "Low variance (σ=2.1%)" or "High variance (σ=8.4%)"  
- **Recommendation:** Based on performance, suggest use case fit

### 16.3.2 Use Case Specialization

- **For each frequent use case (appears in ≥3 workspaces):**  
  - Average score on that use case  
  - Performance vs. org average  
  - Example: "Security: 94% (6.8% above org average). Recommended for security-first evaluations."

### 16.3.3 Scoring Behavior

- **Evaluator consensus:** "Highly consistent (σ=1.2% across reviewers)" or "Divergent (σ=6.5%)"  
- **Override rate:** If override rate \>15%, flag: "This vendor has a higher-than-average override rate (18% vs org avg 12%). Consider requesting re-evaluation."

## 16.4 Efficiency Metrics Briefing {#16.4-efficiency-metrics-briefing}

### 16.4.1 Organization-Wide Metrics

- **Avg phase duration:** Per-phase average (e.g., "Phase 10 Scoring: avg 5.2 days")  
- **Deviation:** "↑ 2 days above Sourcera Method recommendation"  
- **SLA compliance:** "88% of requirements reviewed within SLA"  
- **Trend:** Over last 6 months, improving/declining

### 16.4.2 Team Velocity

- **Scoring velocity:** "Avg 12.4 requirements/day per reviewer"  
- **Variance:** "Reviewer A: 15.2/day, Reviewer B: 9.6/day"  
- **Recommendation:** "Reviewer B trending slower. Consider load balancing or training."

### 16.4.3 Decision Velocity

- **Phase 11 duration:** "Avg 3.8 days to complete Phase 11 (Decision)"  
- **Bottleneck:** "Disagreement resolution takes avg 2.1 days. Consider assigning more Use Case Leads."

## 16.5 Discrepancy Analysis Briefing {#16.5-discrepancy-analysis-briefing}

### 16.5.1 Discrepancy Detection

- **Definition:** Same requirement evaluated by different teams in different workspaces, same vendor  
- **Threshold:** Score difference ≥0.3 (30 percentage points) on ≥3 overlapping requirements  
- **Comparison scope:** Within same organization only (no cross-org)  
- **Example:** "Vendor A scored 92% on 'SSO Integration' in Workspace X and 64% in Workspace Y. Discrepancy flagged for review."

### 16.5.2 Discrepancy Insight Card

- **Trigger:** Briefing detects discrepancy meeting threshold  
- **Display:**  
  - Vendor name  
  - Requirement(s) with conflicting scores  
  - Workspace(s) and scoring teams  
  - Score difference and percentage  
  - "Investigate" button (opens detail modal)  
- **Root cause analysis:** Card suggests potential causes:  
  - "Different evaluation criteria applied"  
  - "Different vendor representatives responded"  
  - "Requirement scope varied between workspaces"  
  - "One evaluation may be outdated"

### 16.5.3 Discrepancy Investigation Modal

- **Detail view:** Show full requirement text from both workspaces  
- **Score timeline:** When each score was assigned  
- **Reviewers:** Who scored in each workspace  
- **Guidance:** "Recommend contacting reviewers to align scoring standards or clarify requirement interpretation."  
- **Action:** "Mark Resolved" (dismisses insight) or "Escalate to Org Admin" (creates action item)

## 16.6 Predictive Suggestions {#16.6-predictive-suggestions}

### 16.6.1 Candidate Ranking

- **Input:** Current workspace vendors, requirements, team structure  
- **Output:** Predicted top candidates based on:  
  - Historical performance on similar use cases (org-wide)  
  - Team preference patterns (org-wide)  
  - Pricing expectations vs. budget (if TCO data available)  
- **Display:** "Based on your team's history, we predict Acme Corp, CloudSoft, and DataSys will rank highest."

### 16.6.2 Mismatch Flags

- **Vendor-use case mismatch:** "Vendor B has low historical performance on 'Compliance' evaluations. Consider requiring additional evidence."  
- **Team mismatch:** "Reviewer A historically scores this vendor lower than org average. Consider independent review."  
- **Market signal:** "Vendor recently expanded in your region. High likelihood of competitive pricing."

### 16.6.3 Exclusion Suggestions

- **Vendor conflict of interest:** "Vendor C is already contracted. Suggest excluding from this evaluation to avoid bias."  
- **Historical disqualifiers:** "Vendor D failed to meet SLA in prior evaluations. Recommend excluding or requiring SLA guarantees."

## 16.7 Access Control & Permissions {#16.7-access-control-&-permissions}

### 16.7.1 Role-Based Access

- **Org Owner:** Full access to all intelligence briefings, cache data, discrepancy investigations  
- **Org Admin:** Full access to all intelligence briefings, cache data, discrepancy investigations  
- **Workspace Owner:** No access to Intelligence section; cannot see org-wide briefings  
- **Workspace-level scoring visibility:** Only within own workspace; not aggregated org-wide

### 16.7.2 Data Isolation

- **No cross-org data:** Org A's intelligence never includes data from Org B  
- **Discrepancy detection:** Only within same org, comparing same vendor across workspaces

## 16.8 Briefing Lifecycle {#16.8-briefing-lifecycle}

### 16.8.1 Briefing Generation

- **Trigger:** User opens Intelligence \> \[Vendor\] or clicks "Generate Briefing"  
- **Latency:** \<5 seconds (data from cache, not recomputed)  
- **Output:** Prose \+ interactive charts  
- **TTL:** 30 days from generation

### 16.8.2 Briefing Expiration & Regeneration

- **After 30 days:** Briefing marked archived (read-only, gray background)  
- **User action:** "Generate New Briefing" button appears  
- **Regeneration:** Fetches current cache data, creates new briefing document with fresh TTL  
- **Underlying data:** Original cache persists; regeneration does not lose data

### 16.8.3 Briefing Export

- **Formats:** PDF (styled prose \+ charts), JSON (raw data export)  
- **PDF content:** 1-2 pages, printable, includes timestamp  
- **JSON export:** Cache data in structured format for external analysis

## 16.9 Plan Limits {#16.9-plan-limits}

### 16.9.1 Intelligence Availability

| Plan | Vendor History | Efficiency Metrics | Discrepancy Analysis | Predictive Suggestions |
| :---- | :---- | :---- | :---- | :---- |
| Free | No | No | No | No |
| Business | Yes | Yes | No | No |
| Enterprise | Yes | Yes | Yes | Yes |

## 16.10 Acceptance Criteria {#16.10-acceptance-criteria}

### 16.10.1 Cache & Data Retention

- [ ] 4 cache types (vendor\_performance, efficiency\_metrics, discrepancy\_analysis, predictive\_suggestions) maintained indefinitely  
- [ ] Briefing document has 30-day TTL; after expiry, marked archived  
- [ ] User can regenerate briefing at any time using current cache  
- [ ] Regeneration does not alter underlying cache

### 16.10.2 Vendor Performance Briefing

- [ ] Displays org-wide average score, trend (improving/stable/declining), volatility  
- [ ] Shows use-case specialization for frequent use cases (≥3 workspaces)  
- [ ] Displays evaluator consensus (scoring variance)  
- [ ] Flags high override rates (\>15%)

### 16.10.3 Efficiency Metrics Briefing

- [ ] Shows org-wide avg phase duration vs Sourcera Method baseline  
- [ ] Displays SLA compliance % and 6-month trend  
- [ ] Shows team velocity (requirements/day per reviewer) with variance  
- [ ] Flags bottlenecks (e.g., slow decision velocity)

### 16.10.4 Discrepancy Analysis

- [ ] Detects score variance ≥0.3 on ≥3 overlapping requirements, same vendor, within org  
- [ ] Discrepancy Insight Cards display in briefing with vendor, requirement, workspace, score diff  
- [ ] Root-cause analysis suggests potential reasons  
- [ ] Investigation modal shows full requirement text, score timeline, reviewers  
- [ ] "Mark Resolved" and "Escalate to Org Admin" actions available

### 16.10.5 Predictive Suggestions

- [ ] Predicts top candidates based on historical performance, team preference, pricing  
- [ ] Flags vendor-use-case mismatches  
- [ ] Flags team-scoring mismatches  
- [ ] Suggests exclusions based on prior conflicts or disqualifiers

### 16.10.6 Access Control

- [ ] Org Owner and Org Admin: full access  
- [ ] Workspace Owner: no access to org-wide briefings  
- [ ] No cross-org data leakage

### 16.10.7 Plan Limits

- [ ] Free: Intelligence not available  
- [ ] Business: Vendor History \+ Efficiency Metrics only  
- [ ] Enterprise: Full suite (all 4 cache types)

---

# 17\. Workspace Analytics {#17.-workspace-analytics}

## 17.1 Overview {#17.1-overview}

Workspace Analytics provides real-time and historical dashboards of sourcing evaluation progress, team performance, and quality metrics. Analytics are phase-aware: some metrics are hidden before their phase becomes active.

## 17.2 Phase-Aware Metric Availability {#17.2-phase-aware-metric-availability}

### 17.2.1 Metric Visibility Rules

| Metric | Availability | Pre-Phase Behavior |
| :---- | :---- | :---- |
| Scoring Progress | Phase 10+ | Hidden; empty state: "Scoring analytics will appear when scoring begins in Phase 10." |
| Response Rate | Phase 6+ | Hidden; empty state: "Response rate analytics will appear when vendors begin responding in Phase 6." |
| Phase Duration | Phase 1+ | Visible (shows time in current phase) |
| Score Distribution | Phase 10+ | Hidden; empty state: "Score distribution will appear after scoring begins." |
| Weight Coverage | Phase 1+ | Visible (shows % of requirements with weight \> 0\) |
| SLA Compliance | Phase 1+ | Visible (shows % requirements within SLA) |
| Team Velocity | Phase 1+ | Visible (shows team member activity summary) |

### 17.2.2 Empty State Messaging

- **Hidden metric card:** Light gray background, padlock icon, message text (14px, light gray)  
- **Message format:** "\[Metric name\] will appear when \[trigger condition\]."  
- **On hover:** Tooltip with fuller explanation (e.g., "Scoring analytics require Phase 10 entry. Phase 10 begins when all vendor responses are collected.")

## 17.3 Core Analytics Metrics {#17.3-core-analytics-metrics}

### 17.3.1 Scoring Progress (Phase 10+)

- **Metric:** Percentage of requirement-vendor pairs with at least one grade assigned  
- **Formula:** `(pairs_graded / pairs_total) × 100%`  
- **Display:**  
  - Progress bar (0–100%)  
  - Number summary: "127 of 180 pairs graded (70.6%)"  
  - Breakdown by use case (nested bars, stacked)  
- **Granularity:** Drillable by use case, team member  
- **Real-time:** Updates as grades are submitted (Convex subscriptions)  
- **Threshold:** Can set target completion % (e.g., "Target: 85%"); flag if below target (yellow/red alert)

### 17.3.2 Response Rate (Phase 6+)

- **Metric:** Percentage of requirements with ≥1 vendor response submitted  
- **Formula:** `(requirements_with_response / requirements_total) × 100%`  
- **Display:**  
  - Progress bar (0–100%)  
  - Number summary: "85 of 100 requirements with responses (85%)"  
  - Breakdown by vendor (nested bars, horizontal)  
  - Missing vendor breakdown (vendors not yet responded)  
- **Threshold:** Can set target % (e.g., "Target: 90%"); flag if below  
- **Real-time:** Updates as responses are submitted

### 17.3.3 Phase Duration

- **Metric:** Time elapsed in current phase \+ historical phase duration  
- **Display:**  
  - Timeline showing all phases (1–12) completed and current  
  - Current phase: remaining days (based on Sourcera Method recommended duration)  
  - Historical phases: actual duration vs. recommended  
  - Example: "Phase 10 (Scoring): Day 4 of 5 recommended"  
- **Early/late indicator:** Green (on track), yellow (trending late), red (past recommended end date)  
- **Comparison:** Show org-wide average for same phase

### 17.3.4 Score Distribution

- **Metric:** Distribution of grades (FM, PM, DNM, EX) across all scored pairs  
- **Display:**  
  - Histogram: X-axis \= grade type, Y-axis \= count  
  - Percentage breakdown: e.g., "FM: 45%, PM: 35%, DNM: 15%, EX: 5%"  
  - Color-coded bars (green for FM, yellow for PM, red for DNM, gray for EX)  
  - Drillable: Click bar to see requirements with that grade  
- **Aggregation:** By use case, team member, requirement

### 17.3.5 Weight Coverage

- **Metric:** Percentage of requirements with weight \> 0 (i.e., not purely informational)  
- **Formula:** `(requirements_weight_gt_0 / requirements_total) × 100%`  
- **Display:**  
  - Number: "92 of 100 requirements have weight \> 0 (92%)"  
  - Breakdown: Show 8 informational requirements flagged  
- **Purpose:** Helps identify requirements that might not contribute to decision

### 17.3.6 SLA Compliance

- **Metric:** Percentage of requirements reviewed within SLA (Phase 10+) or responded to within SLA (Phase 6+)  
- **Formula:**  
    
  SLA\_compliance \= (requirements\_within\_SLA / requirements\_total) × 100%  
    
  where requirement is "within SLA" if:  
    
    \- Phase 6+: vendor response submitted ≤ SLA deadline  
    
    \- Phase 10+: requirement graded ≤ SLA deadline  
    
- **Display:**  
  - Progress bar (0–100%), threshold at 95% (green), 80–94% (yellow), \<80% (red)  
  - Breakdown by use case, vendor (for Phase 6+), team (for Phase 10+)  
  - List of overdue requirements (sorted by days overdue, max 10 shown)  
- **Drill-down:** Click overdue requirement → detail view with time remaining

### 17.3.7 Team Velocity

- **Metric:** Activity and throughput per team member  
- **Display (per team member):**  
  - Requirement count graded (Phase 10+): "Alice: 47 graded"  
  - Grades per day: "Alice: 11.75/day (Phase 10 started 4 days ago)"  
  - Response review count (Phase 6+): "Bob: 35 reviewed"  
  - Last activity: "2 hours ago", "Alice reviewed Requirement 47"  
- **Aggregation:** Table or card view, sortable by count, graded per day, or last activity  
- **Color indicator:**  
  - Green: \>average velocity  
  - Yellow: average velocity  
  - Red: \<average velocity  
- **Comparison:** Show org-wide average velocity for reference

## 17.4 Filtering & Aggregation {#17.4-filtering-&-aggregation}

### 17.4.1 Filter Bar

Above all metrics, display filter controls (chip-based):

- **Use Case:** Multi-select dropdown  
- **Team:** Multi-select dropdown  
- **Vendor:** Multi-select dropdown (Phase 6+ only)  
- **Time Range:** Dropdown or date picker (Last 7 days, 30 days, custom range)  
- **Clear Filters:** "Clear All" button

### 17.4.2 Filter Application

- **Metrics updated reactively:** All metrics refresh when filters change  
- **Latency:** \<1 second  
- **Persistence:** Filters persist for current session only (not across browser reload)

### 17.4.3 Aggregation Examples

- **"Filter to Security use case"** → all metrics recalculate showing only Security requirements  
- **"Filter to Team A, Phase 6+"** → show response rate and velocity for Team A only  
- **"Filter to Vendor X, Phase 10+"** → show Vendor X's score distribution and SLA compliance

## 17.5 Export & Reporting {#17.5-export-&-reporting}

### 17.5.1 Export Options

- **CSV export:** Full data table with all metrics, filters applied  
- **PDF export:** Dashboard snapshot (styled, page layout optimized for printing)  
- **Schedule periodic export:** (Enterprise plan) Set up weekly/monthly email with dashboard snapshot

### 17.5.2 Export Content

- **CSV:** Headers (Metric, Value, Use Case, Team, Vendor, Timestamp), rows per metric \+ dimension combination  
- **PDF:** Title page (workspace name, export date), metrics as charts \+ tables (4–6 per page), footer with org info  
- **Email:** Subject line includes workspace name and date range, body includes PDF as attachment \+ summary stats

## 17.6 Drill-Down & Detail Views {#17.6-drill-down-&-detail-views}

### 17.6.1 Metric Drill-Down

- **Click any metric card** → open modal or side panel with detailed breakdown  
- **Example (Scoring Progress):**  
  - Left panel: List of use cases with % graded per use case  
  - Right panel: Team member breakdown (who has graded how many)  
  - Table: All requirement-vendor pairs, filtered to show graded/ungraded status  
- **Navigation:** Back button, breadcrumb trail

### 17.6.2 Linked Detail Views

- **Scoring Progress → Detail:** Lists ungraded pairs; click pair to open scoring UI (Section 13\)  
- **Response Rate → Detail:** Lists requirements without vendor response; click to view response summary (Section 8.3)  
- **SLA Compliance → Detail:** Lists overdue items; click to view requirement detail or contact vendor

## 17.7 Real-Time Updates {#17.7-real-time-updates}

### 17.7.1 Live Metrics

- **Scoring Progress, Response Rate, SLA Compliance:** Real-time via Convex subscriptions  
- **Update frequency:** Every grade/response submitted triggers metric recalculation  
- **Visual indicator:** Small pulse icon next to metric value when updating  
- **Cached calculations:** Complex metrics (e.g., Team Velocity) cached; refreshed on 5-minute interval

### 17.7.2 Refresh & Manual Update

- **Auto-refresh:** Metrics refresh every 30 seconds (throttled to reduce API calls)  
- **Manual refresh:** "Refresh Now" button in top-right, updates all metrics immediately  
- **Last updated:** Timestamp shown (e.g., "Last updated 2 minutes ago")

## 17.8 Acceptance Criteria {#17.8-acceptance-criteria}

### 17.8.1 Phase Awareness

- [ ] Scoring Progress hidden before Phase 10; empty state message shown  
- [ ] Response Rate hidden before Phase 6; empty state message shown  
- [ ] All other metrics visible from Phase 1  
- [ ] Hidden metrics show padlock icon and descriptive message

### 17.8.2 Scoring Progress Metric

- [ ] Formula: (pairs\_graded / pairs\_total) × 100%  
- [ ] Displays progress bar \+ summary: "X of Y pairs graded"  
- [ ] Breakdown by use case visible  
- [ ] Drillable by team member  
- [ ] Real-time updates as grades submitted  
- [ ] Threshold target configurable; yellow/red alert if below

### 17.8.3 Response Rate Metric

- [ ] Formula: (requirements\_with\_response / requirements\_total) × 100%  
- [ ] Displays progress bar \+ summary  
- [ ] Breakdown by vendor (horizontal bars)  
- [ ] Missing vendors highlighted  
- [ ] Real-time updates as responses submitted

### 17.8.4 Phase Duration Metric

- [ ] Timeline shows all 12 phases with completion status  
- [ ] Current phase shows days remaining (based on Sourcera Method)  
- [ ] Green/yellow/red indicator (on-track/trending late/past deadline)  
- [ ] Historical phases show actual vs. recommended duration  
- [ ] Org average comparison available

### 17.8.5 Other Metrics (Score Distribution, Weight Coverage, SLA Compliance, Team Velocity)

- [ ] All formulas and displays per Section 17.3.4–17.3.7 implemented  
- [ ] Drillable to detail views  
- [ ] Color-coded indicators (green/yellow/red)  
- [ ] Breakdown by use case, team, vendor as applicable

### 17.8.6 Filtering & Aggregation

- [ ] Filter bar with Use Case, Team, Vendor, Time Range  
- [ ] Metrics update reactively when filters applied  
- [ ] Latency \<1 second  
- [ ] Filters persist for current session

### 17.8.7 Export

- [ ] CSV export with all metrics \+ dimensions  
- [ ] PDF export (styled, print-optimized)  
- [ ] Scheduled export (Enterprise): weekly/monthly email with snapshot

### 17.8.8 Real-Time Updates

- [ ] Live metrics (Scoring, Response Rate, SLA) update via subscriptions  
- [ ] Manual "Refresh Now" button available  
- [ ] Last updated timestamp shown  
- [ ] Auto-refresh every 30 seconds (throttled)

---

# 18\. Q\&A Threads {#18.-q&a-threads}

## 18.1 Overview {#18.1-overview}

Q\&A Threads enable asynchronous vendor-buyer communication on specific requirements. Vendors can ask clarification questions, buyers can provide guidance, and all communication is archived and searchable. Threads are phase-gated and visibility-controlled.

## 18.2 Thread Lifecycle & Phase Gating {#18.2-thread-lifecycle-&-phase-gating}

### 18.2.1 Phase Availability

| Phase | Vendor Action | Buyer Action | Thread Status |
| :---- | :---- | :---- | :---- |
| 1–5 | No threads | No threads | Not available |
| 6–7 | Create & reply | Create & reply | Editable (both sides) |
| 8 | No new threads; read existing | Read only | Threads read-only for vendor |
| 9–12 | Read only | Read only | All read-only |

### 18.2.2 Thread Creation Rules

- **Trigger (Phase 6+):** Vendor clicks requirement → "Ask Question" button; or Buyer clicks requirement → "Start Q\&A" button  
- **Initial post:** Vendor or buyer posts question/guidance  
- **Auto-subscribe:** Creator and recipient(s) auto-subscribed to thread notifications  
- **Status:** Thread marked "OPEN" (Phase 6–7) or "CLOSED" (Phase 8+)

### 18.2.3 Vendor Q\&A Question Limit

- **Limit:** Max 50 questions per vendor per workspace (all plans)  
- **Enforcement:** At 50 questions, vendor cannot create new thread. UI shows error: "You have reached the 50-question limit. Please request additional Q\&A slots from the Workspace Owner."  
- **Override:** Workspace Owner can grant additional slots (up to 10 more) via Workspace Settings  
- **Requests:** Vendor can submit formal request (modal with justification); Workspace Owner approves/denies

## 18.3 Thread Structure & Visibility {#18.3-thread-structure-&-visibility}

### 18.3.1 Thread Object Schema

{

  "id": "uuid",

  "workspace\_id": "uuid",

  "requirement\_id": "uuid",

  "vendor\_id": "uuid (creating vendor, if vendor-initiated)",

  "created\_by": "user\_id",

  "created\_at": "ISO 8601",

  "updated\_at": "ISO 8601",

  "status": "OPEN | CLOSED",

  "visibility": "PUBLIC | PRIVATE",

  "title": "string (≤100 chars, auto-generated or user-provided)",

  "posts": \[

    {

      "id": "uuid",

      "user\_id": "uuid",

      "user\_role": "Vendor | Buyer",

      "content": "string (Markdown)",

      "created\_at": "ISO 8601",

      "edited\_at": "ISO 8601 (if edited)",

      "attachments": \[

        {

          "id": "uuid",

          "filename": "string",

          "url": "string",

          "mime\_type": "string"

        }

      \]

    }

  \],

  "subscribed\_users": \["user\_id"\]

}

### 18.3.2 Visibility Control

- **PUBLIC:** All vendors and buyer team see the thread and all posts  
- **PRIVATE:** Only the asking vendor, the Workspace Owner, and Buyer team leads see the thread  
- **Default:** Buyer chooses per-thread on creation:  
  - Vendor question → Buyer selects Public or Private when responding  
  - Buyer question → Buyer selects Public (visible to all vendors) or Private (only asking vendor sees)  
- **Toggle:** Buyer can change visibility at any time (even after Phase 7), but cannot make a Public thread Private (only Public or remain Public)  
- **Rationale:** Public threads help all vendors benefit; Private ensures vendor confidentiality

### 18.3.3 Author Masking (Optional)

- **For Public threads:** Buyer can optionally mask vendor name when posting (shows "Anonymous Vendor" instead of vendor name)  
- **Use case:** Hide vendor identity if question reveals competitive info  
- **Opt-in:** Buyer checks box "Hide vendor identity" when posting

## 18.4 Agent Q\&A Suggestion (Buyer-Side) {#18.4-agent-q&a-suggestion-(buyer-side)}

### 18.4.1 AI-Powered Question Drafting

- **Trigger:** Buyer clicks "Suggest Q\&A" or "AI Draft" when viewing a requirement with no vendor questions yet  
- **Model:** Claude Sonnet (balanced speed & quality)  
- **Input:**  
  - Requirement text  
  - Use Case brief  
  - Existing Q\&A threads in same workspace (public \+ buyer's private threads only)  
  - KB entries (if available) tagged with matching categories  
  - **Excluded data:** Cross-workspace data, Intelligence data, other org data  
- **Output:** Draft question (single post, ≤300 chars) as guidance to help vendors understand the requirement  
- **Presentation:** Modal with draft text, "Accept", "Edit", "Dismiss" buttons  
- **If accepted:** Draft posted as Public thread (Buyer authored, no cost to vendor question count)

### 18.4.2 Agent Limitations

- **No private vendor context:** Agent does not have access to vendor confidentiality info; all suggestions are generic  
- **No cross-workspace learning:** Agent limited to current workspace threads only  
- **No Intelligence data:** Agent cannot use org-wide performance data to personalize suggestions

## 18.5 Post Interactions & Moderation {#18.5-post-interactions-&-moderation}

### 18.5.1 Post Editing & Deletion

- **Edit:** Author can edit own post within 15 minutes of creation; edited timestamp shown  
- **Delete:** Author can delete own post within 15 minutes; "Deleted by author" placeholder shown  
- **Admin override:** Workspace Owner can edit/delete any post (flags as "Moderated by \[admin\]")  
- **After 15 min:** Post locked; only delete available (becomes placeholder)

### 18.5.2 Post Attachments

- **Supported formats:** PDF, DOCX, XLSX, PNG, JPG (file size \<10MB each)  
- **Upload:** Click "Attach File" button in post composer  
- **Virus scan:** All uploads scanned via VirusTotal API; if malware detected, upload rejected with error toast  
- **Linked in markdown:** `[filename.pdf](attachment-id)`  
- **Retention:** Attachments retained as long as thread exists

### 18.5.3 Mention & Notifications

- **@Mention syntax:** Type `@username` in post to notify user  
- **Mentions populate from:** Buyer team members (if @-mentioning) or Vendor list (if @-mentioning vendors in Public thread)  
- **Notification:** @-mentioned users receive email \+ in-app notification with thread link  
- **Digest:** All notifications batched into daily digest email

## 18.6 Thread Search & Index {#18.6-thread-search-&-index}

### 18.6.1 Full-Text Search

- **Available via:** Workspace Dashboard \> Search, or dedicated Search page  
- **Index:** All post content (Markdown text, not attachments)  
- **Query:** Free-text, Boolean operators (AND, OR, NOT), phrase search (quoted strings)  
- **Results:** Ranked by relevance (BM25), organized by thread  
- **Filters:** Requirement, vendor, date range, visibility (if user has permission)  
- **Result snippet:** 2-line context showing search term highlighted in yellow

### 18.6.2 Thread Listing & Filtering

- **View:** List of all threads user has access to (public \+ user's private)  
- **Sort:** By created\_at, updated\_at, vendor, requirement, or status  
- **Filter:** Use Case, Vendor, Status (OPEN/CLOSED), Visibility (if admin)  
- **Bulk actions:** Mark all as read, export threads to CSV

## 18.7 Plan Limits & Features {#18.7-plan-limits-&-features}

### 18.7.1 Q\&A Limits

| Plan | Questions/Vendor/Workspace | Additional Slots | Agent Suggestion |
| :---- | :---- | :---- | :---- |
| Free | Not available | — | — |
| Business | 50 | 0 (none) | Yes |
| Enterprise | 50 | Up to 10 additional | Yes |

### 18.7.2 Additional Slots Request Workflow

1. **Vendor initiates:** At 50 questions, "Request Additional Slots" button appears  
2. **Modal:** Vendor enters justification (required, ≤200 chars)  
3. **Submission:** Request sent to Workspace Owner via email \+ in-app task  
4. **Approval:** Workspace Owner reviews in Workspace Settings \> Q\&A Requests  
   - Options: Approve (+N slots, 1–10), Deny (with comment), or Extend deadline  
5. **Notification:** Vendor notified of approval/denial  
6. **Tracking:** All requests logged with timestamp, justification, approver, outcome

## 18.8 Acceptance Criteria {#18.8-acceptance-criteria}

### 18.8.1 Phase Gating

- [ ] Threads not creatable Phases 1–5  
- [ ] Threads creatable and editable Phases 6–7  
- [ ] Phase 8: no new threads, existing threads read-only for vendor  
- [ ] Phases 9–12: all threads read-only  
- [ ] Attempted violations show error toast

### 18.8.2 Thread Structure

- [ ] Thread object includes: id, workspace\_id, requirement\_id, vendor\_id, created\_by, created\_at, status, visibility, title, posts\[\], subscribed\_users\[\]  
- [ ] Each post includes: id, user\_id, user\_role, content, created\_at, edited\_at, attachments\[\]  
- [ ] Attachments stored and linked via markdown

### 18.8.3 Visibility Control

- [ ] PUBLIC threads visible to all vendors and buyer team  
- [ ] PRIVATE threads visible to asking vendor, Workspace Owner, buyer team leads  
- [ ] Buyer selects visibility when responding to vendor question  
- [ ] Buyer can toggle visibility (only to more Public, never to Private)  
- [ ] Author masking optional (shows "Anonymous Vendor" in Public threads)

### 18.8.4 Q\&A Limit Enforcement

- [ ] Vendor can create max 50 questions per workspace (all plans)  
- [ ] At 50, create button disabled; error message shown  
- [ ] Additional slots (Enterprise): Vendor requests, Workspace Owner approves (up to \+10)  
- [ ] Request workflow includes justification, approval/denial, notification

### 18.8.5 Agent Q\&A Suggestion

- [ ] "Suggest Q\&A" button appears when vendor has no questions yet  
- [ ] Agent (Sonnet) drafts question based on: requirement, use case, same-workspace threads, KB entries  
- [ ] Agent does NOT use cross-workspace data or Intelligence data  
- [ ] Draft presented in modal; user accepts/edits/dismisses  
- [ ] Accepted draft posted as Public thread (no cost to vendor count)

### 18.8.6 Post Interactions

- [ ] Author can edit post within 15 min; timestamp shown  
- [ ] Author can delete post within 15 min; placeholder shown  
- [ ] Workspace Owner can edit/delete any post (flagged as moderated)  
- [ ] Attachments supported (PDF, DOCX, XLSX, PNG, JPG, \<10MB); virus scanned  
- [ ] @-Mention triggers notification to mentioned user  
- [ ] Daily digest email for all notifications

### 18.8.7 Search & Listing

- [ ] Full-text search available (Boolean operators, phrase search)  
- [ ] Results ranked by relevance; snippet shows context  
- [ ] Thread listing with sort (created\_at, updated\_at, vendor, requirement, status)  
- [ ] Filtering by Use Case, Vendor, Status, Visibility  
- [ ] Bulk export to CSV

---

# 19\. Template Library {#19.-template-library}

## 19.1 Overview {#19.1-overview}

Template Library provides pre-built workspace templates (Use Cases \+ Requirements) curated by Sourcera and custom templates created by organizations. Templates accelerate sourcing evaluation setup by reusing proven structures.

## 19.2 Sourcera-Provided Templates {#19.2-sourcera-provided-templates}

### 19.2.1 Template Seeding at Organization Creation

- **Trigger:** New Organization created  
- **Action:** Sourcera seeds organization with default template registry:  
  - "SaaS Security & Compliance" (ISO 27001, SOC 2 aligned)  
  - "Cloud Infrastructure" (AWS/Azure/GCP requirements)  
  - "Data Privacy" (GDPR, CCPA, state privacy laws)  
  - "Finance & Billing" (pricing, contract terms, SLAs)  
  - "Customer Support" (SLA, uptime, response time)  
  - "Integration & APIs" (REST, GraphQL, webhook support)  
- **Updates:** When Sourcera updates a template (e.g., new use case, new requirement), orgs see "Template Update Available" badge on card

### 19.2.2 Template Versioning

- **Versioning:** Each template has a version number (v1.0, v1.1, v2.0, etc.)  
- **Changelog:** Displayed when user hovers "Update Available" badge  
- **Applying update:** Creates a new template version in the org; does NOT modify existing workspaces built from prior template version  
- **Example scenario:**  
  1. Org creates Workspace A from "SaaS Security & Compliance v1.0"  
  2. Sourcera updates template to v1.1 (adds new requirement)  
  3. Org sees "Template Update Available" badge  
  4. Org applies update → creates "SaaS Security & Compliance v1.1" (separate template)  
  5. Workspace A remains on v1.0 (unchanged)  
  6. New workspaces can be created from v1.1

### 19.2.3 Template Registry & Management

- **Registry:** Maintained by Sourcera team, sourced from compliance frameworks, market research, customer feedback  
- **Updates:** Released quarterly; Sourcera notifies all orgs of new templates and updates  
- **Feedback:** Organizations can suggest updates via "Suggest Improvement" link on template card

## 19.3 Custom Template Creation {#19.3-custom-template-creation}

### 19.3.1 Creating Custom Template from Scratch

- **Trigger:** User navigates to Templates \> Create New Template  
- **Workflow:**  
  1. Standard workspace creation flow (Section 10\)  
  2. Create empty workspace (no initial use cases)  
  3. Add Use Cases \+ Requirements manually  
  4. Configure TCO settings (optional)  
  5. Assign team members to use cases (optional, for default team structure)  
  6. Save workspace  
  7. In workspace settings, click "Save as Template"  
- **Template metadata:**  
  - Template name (≤100 chars)  
  - Description (≤300 chars, Markdown supported)  
  - Category (Security, Compliance, Operations, Custom)  
  - Icon (emoji selector, default 📋)  
  - Color (hex picker, default \#007AFF)

### 19.3.2 Template Scope (What's Captured)

- **Included:** Use Cases (name, description, weight), Requirements (title, description, type, category, weight), Team assignments (which team member is use case lead), TCO configuration  
- **Excluded:** Vendor data, vendor responses, scores, scenarios, Q\&A threads, amendments

### 19.3.3 Custom Template Visibility & Sharing

- **Scope:** Organization-level (visible to all team members in org, not shared across orgs)  
- **Permissions:**  
  - **Create:** Workspace Owner, Org Admin  
  - **Edit/Delete:** Creator, Org Admin only  
  - **View:** All org members (read-only)  
- **Sharing across orgs:** Not supported in v6.0 (future feature)

## 19.4 Template Library UI {#19.4-template-library-ui}

### 19.4.1 Template Catalog View

- **Layout:** Grid or list view (user preference, persisted)  
- **Cards per template:**  
  - Thumbnail (icon \+ color)  
  - Template name (bold, 16px)  
  - Description (14px, 2-line truncation)  
  - Source badge (Sourcera or Org name)  
  - Version number (small, gray, bottom-right)  
  - "Update Available" badge (if applicable, orange)  
- **Sorting:** By creation date, name, category  
- **Filtering:** By source (Sourcera / Custom), category (Security, Compliance, etc.)  
- **Search:** Free-text search on template name \+ description

### 19.4.2 Template Detail Modal

- **Trigger:** Click template card  
- **Layout:**  
  - Header: Template name, source, version, icon  
  - Description (full text, Markdown rendered)  
  - Use Cases list (counts: X use cases, Y total requirements)  
  - TCO configuration summary (if present)  
  - Team template (if defined)  
  - Actions (bottom):  
    - "Create Workspace from This Template" (primary button)  
    - "Preview" (view full use case & requirement list)  
    - "Suggest Improvement" (Sourcera templates only)  
    - (Admin only) "Edit", "Delete"

### 19.4.3 Template Update Flow

- **Badge trigger:** Sourcera updates template in registry  
- **Badge appearance:** Orange "Update Available" badge on template card \+ modal header  
- **Changelog modal (on hover/click):**  
  - "What's New in Version X.X"  
  - Bullet list of additions/changes  
  - Example: "+ New requirement: Disaster Recovery RTO", "\~ Updated Security Use Case description"  
- **Apply Update action:**  
  - Confirmation modal: "This will create a new version of this template. Existing workspaces will not be affected."  
  - Creates new template version in org with updated use cases/requirements  
  - User can choose to create new workspace from v2.0, or keep using v1.0 in existing workspaces

### 19.4.4 Preview & Drill-Down

- **Preview button** → Read-only modal showing:  
  - All use cases (collapsed/expandable)  
  - All requirements per use case  
  - TCO configuration (if present)  
  - No edit capability; "Create Workspace" button links to creation flow

## 19.5 Template-to-Workspace Flow {#19.5-template-to-workspace-flow}

### 19.5.1 Workspace Creation from Template

- **Trigger:** "Create Workspace from This Template" in template detail modal  
- **Flow:** (Same as Section 10.2, but pre-populated)  
  1. Workspace name (required, user input)  
  2. Workspace description (optional)  
  3. Team setup (if template defines team leads, pre-selected; user can modify)  
  4. Summary (review use cases \+ requirements from template)  
  5. Confirm & Create → Workspace initialized with template data, Phase 1 begins  
- **Result:** New workspace with all template use cases & requirements copied; empty vendor list (user invites vendors separately)

### 19.5.2 Amendment Integration

- **On workspace creation from template:** All requirements from template are in ACTIVE state (no Amendment Protocol)  
- **Rationale:** Template requirements are pre-vetted by creator; no need for review

## 19.6 Plan Limits {#19.6-plan-limits}

### 19.6.1 Template Storage

| Plan | Custom Templates | Sourcera Templates |
| :---- | :---- | :---- |
| Free | Not available | Access to Sourcera templates (read-only) |
| Business | Unlimited | All Sourcera templates |
| Enterprise | Unlimited | All Sourcera templates \+ early access to new templates |

## 19.7 Acceptance Criteria {#19.7-acceptance-criteria}

### 19.7.1 Sourcera Templates

- [ ] Seeded at org creation from Sourcera registry (6+ default templates)  
- [ ] Version number displayed per template  
- [ ] "Update Available" badge appears when Sourcera updates template  
- [ ] Applying update creates new template version (does not modify existing workspaces)  
- [ ] Changelog modal shows additions/changes in new version  
- [ ] Organizations notified quarterly of new templates & updates

### 19.7.2 Custom Template Creation

- [ ] User creates empty workspace, adds use cases & requirements manually  
- [ ] "Save as Template" option in workspace settings  
- [ ] Template metadata: name, description, category, icon, color  
- [ ] Captured data: Use Cases, Requirements, TCO config, team assignments  
- [ ] Excluded data: Vendor data, responses, scores, scenarios, Q\&A threads

### 19.7.3 Template Library UI

- [ ] Grid/list view toggle (persisted)  
- [ ] Card displays: icon, name, description, source, version  
- [ ] Sorting: creation date, name, category  
- [ ] Filtering: by source (Sourcera/Custom), category  
- [ ] Search: free-text on name \+ description  
- [ ] Detail modal shows full description, use case list, TCO config, team template

### 19.7.4 Template Preview & Drill-Down

- [ ] Preview modal shows all use cases & requirements (read-only)  
- [ ] Expandable use cases to show requirements  
- [ ] "Create Workspace" button links to creation flow

### 19.7.5 Workspace Creation from Template

- [ ] Pre-populates use cases, requirements, TCO config  
- [ ] User enters workspace name, description, team assignments  
- [ ] Summary shown before confirm  
- [ ] Template requirements in ACTIVE state (no Amendment Protocol)

### 19.7.6 Permissions & Sharing

- [ ] Custom templates: Org-scoped (visible to all org members)  
- [ ] Create/Edit/Delete: Creator, Org Admin  
- [ ] View: All org members (read-only)

---

# 20\. Inbox & Pulse {#20.-inbox-&-pulse}

## 20.1 Overview {#20.1-overview}

Inbox is a unified notification center for all workspace activity. Pulse is a weekly digest of sourcing health via the Pulse Health Score and AI-generated insights delivered via email and in-app.

## 20.2 Inbox Structure {#20.2-inbox-structure}

### 20.2.1 Unified Feed

- **Location:** Dashboard \> Inbox tab (also accessible via global bell icon in top bar)  
- **Content types (priority-ordered):**  
  1. **Phase transitions** (e.g., "Phase 7 started: Vendor Participation")  
  2. **SLA alerts** (e.g., "5 requirements due tomorrow")  
  3. **Q\&A mention** (e.g., "@You was mentioned in 'SSO Integration'")  
  4. **Amendment notifications** (e.g., "3 requirements pending review")  
  5. **Disagreement escalations** (e.g., "Disagreement on 'Security' — Use Case Lead review needed")  
  6. **Workspace invites** (e.g., "You've been invited to workspace 'Cloud RFx'")  
  7. **Team assignments** (e.g., "You've been assigned as Security use case lead")  
  8. **Scoring activity** (e.g., "Alice completed Security scoring")  
  9. **Response activity** (e.g., "Acme Corp submitted responses")  
  10. **General updates** (e.g., "Workspace created, Phase 1 started")

### 20.2.2 Notification Item Schema

{

  "id": "uuid",

  "user\_id": "uuid",

  "workspace\_id": "uuid",

  "type": "string (PHASE\_TRANSITION | SLA\_ALERT | QA\_MENTION | ...)",

  "priority": "integer (1=high, 2=medium, 3=low)",

  "title": "string (≤100 chars)",

  "description": "string (≤200 chars)",

  "action\_url": "string (internal link to relevant resource)",

  "action\_label": "string (e.g., 'Review SLA', 'View Thread', 'Grade Requirement')",

  "created\_at": "ISO 8601",

  "read": "boolean",

  "dismissed": "boolean",

  "expires\_at": "ISO 8601 (optional, auto-dismiss after)"

}

### 20.2.3 Inbox Interactions

- **Mark as read:** Click notification or "Mark as read" action (single icon)  
- **Dismiss:** "X" button dismisses notification (removed from inbox, logged as dismissed)  
- **Click notification:** Opens action\_url in same tab or modal  
- **Mark all as read:** "Mark All as Read" button (top of feed)  
- **Filter:** Dropdown to show all, unread, or by type (PHASE\_TRANSITION, SLA\_ALERT, etc.)  
- **Sorting:** By priority (auto), then by created\_at (newest first)  
- **Pagination:** "Load More" button at bottom, lazy-load 20 at a time

### 20.2.4 Badge Count & Indicators

- **Unread count:** Red badge on bell icon (top bar) showing unread notification count  
- **Unread visual:** Unread items in feed have left blue bar \+ bold text  
- **Read visual:** Read items have normal opacity, gray text  
- **Dismissed visual:** Dismissed items removed from view; can be restored via filter "Show Dismissed" (admin view)

### 20.2.5 Notification Expiry

- **Auto-expiry:** Some notifications (e.g., SLA alerts) auto-dismiss after their relevance window passes  
  - SLA alert: Expires 24h after SLA deadline  
  - Phase transition: Expires 7 days after phase change  
  - Scoring activity: Expires 3 days after activity  
  - Q\&A mention: Expires when thread is closed  
- **Expired notifications:** Removed from inbox; can view archived (past 30 days)

## 20.3 Pulse Health Score {#20.3-pulse-health-score}

### 20.3.1 Health Score Calculation

- **Formula:**  
    
  Health Score \= weighted average of 4 signals:  
    
    (SLA\_compliance\_pct × 0.3) \+  
    
    (Scoring\_progress\_pct × 0.3) \+  
    
    (Response\_rate\_pct × 0.2) \+  
    
    (Phase\_velocity\_ratio × 0.2)  
    
  where:  
    
    SLA\_compliance\_pct \= (requirements within SLA / total requirements) × 100%  
    
    Scoring\_progress\_pct \= (requirement-vendor pairs graded / total pairs) × 100% (Phase 10+ only)  
    
    Response\_rate\_pct \= (requirements with vendor response / total requirements) × 100% (Phase 6+ only)  
    
    Phase\_velocity\_ratio \= (actual\_days\_in\_current\_phase / sourcera\_method\_recommended\_days) × 100%

### 20.3.2 Health Score Phases

- **Before Phase 6:** Health Score based on SLA\_compliance (50%) \+ Phase\_velocity (50%)  
- **Phase 6–9:** Health Score based on SLA\_compliance (40%), Response\_rate (40%), Phase\_velocity (20%)  
- **Phase 10–11:** Health Score based on all 4 signals per formula above  
- **Phase 12+:** Health Score locked (immutable, final score recorded)

### 20.3.3 Health Score Output & Thresholds

- **Range:** 0–100 (displayed as percentage with color indicator)  
- **Green (80–100):** Healthy, on track  
- **Yellow (50–79):** At-risk, warning  
- **Red (0–49):** Critical, urgent action needed  
- **Breakdown display:** Show contribution of each signal (e.g., "SLA: 95%, Response: 72%, Scoring: 58%, Velocity: 110%" → blended Health Score 80%)

### 20.3.4 Health Score Trend

- **Daily recording:** Health Score calculated daily at 9am UTC  
- **Trend visualization:** 7-day line chart showing historical scores \+ current  
- **Color trend:** Green line (healthy trajectory), yellow (neutral), red (declining)  
- **Actionable insights:** "Health score declining. Focus on SLA compliance (currently 62% vs target 95%)."

## 20.4 Pulse Digest Email {#20.4-pulse-digest-email}

### 20.4.1 Weekly Digest Schedule

- **Frequency:** Every Monday morning at 9am workspace owner's local timezone (configurable to Wednesday or Friday)  
- **Recipient:** Workspace Owner, plus any team members opted in (Notification Settings)  
- **Delivery:** Via Loops.so email service  
- **Content:** HTML email \+ plain text fallback

### 20.4.2 Email Content Structure

Subject: \[Workspace Name\] Weekly Pulse — Health Score: 78% (Yellow)

\---- Header \----

Workspace: \[Workspace Name\]

Week: \[Date Range\]

Current Phase: \[Phase N\] (\[Phase Name\])

Health Score: \[Score\]% \[Color\] | \[Summary: e.g., "At-risk: Response rate low"\]

\---- Section 1: Health Overview \----

Your sourcing evaluation is progressing at medium pace.

Health Score Breakdown:

  • SLA Compliance: 95% ✓ (on target)

  • Response Rate: 72% ⚠ (below 85% target)

  • Scoring Progress: \[if Phase 10+\] X% (Y pairs graded)

  • Phase Velocity: 110% (trending 1 day late)

\---- Section 2: AI Summary (Agent-Generated) \----

\[\~300 tokens, Sonnet-generated summary of key trends \+ recommendations\]

Example:

"Responses are coming in slower than expected. Only 6 of 8 vendors have submitted responses to the RFI. 

Consider sending a reminder to CloudSoft and DataSys. SLA deadlines are approaching for the 'Compliance' 

use case—prioritize scoring those requirements this week to stay on track. Team velocity is strong; 

Alice and Bob have graded 40+ requirements each."

\---- Section 3: Action Items \----

Ranked by priority:

  1\. \[SLA alert\] 5 requirements due Friday. \[Action: Review Requirement\]

  2\. \[Disagreement\] 2 scoring disagreements await resolution. \[Action: Resolve\]

  3\. \[Amendment\] 1 policy ingestion pending review. \[Action: Review Amendment\]

\---- Section 4: Key Metrics \----

Table:

  Metric | Current | Target | Status

  \-------|---------|--------|--------

  SLA Compliance | 95% | 95% | ✓

  Response Rate | 72% | 85% | ⚠

  Scoring Progress | 45% | 70% | ⚠ (Phase 10+)

  Avg Phase Duration | 4d | 5d | ✓

\---- Footer \----

View full analytics: \[Link to Workspace \> Analytics\]

Update notification preferences: \[Link to Notification Settings\]

Workspace: \[Workspace Name\] | Org: \[Org Name\]

### 20.4.3 Agent-Generated Summary (Sonnet)

- **Model:** Claude Sonnet  
- **Input:** Current Health Score, all 4 signals, recent activities (new responses, new scores, SLA alerts, phase changes from past week)  
- **Output:** \~300 tokens, conversational summary highlighting:  
  - What's trending well (e.g., high SLA compliance, strong team velocity)  
  - What needs attention (e.g., low response rate, scoring disagreements)  
  - Top recommendation (e.g., "Send reminder to slow vendors", "Prioritize scoring X use case")  
- **Tone:** Professional, actionable, specific (mentions vendors/use cases by name)

## 20.5 In-App Pulse Widget {#20.5-in-app-pulse-widget}

### 20.5.1 Dashboard Pulse Card

- **Location:** Dashboard main panel (above or below Inbox)  
- **Display:**  
  - Health Score (large, color-coded: green/yellow/red)  
  - Trend sparkline (7-day history)  
  - Breakdown bars (SLA, Response, Scoring, Velocity, each weighted)  
  - "View Details" link (opens Pulse full view)  
  - "Last updated: \[timestamp\]"  
- **Real-time updates:** Pulse card updates daily (calculated at 9am UTC) or on-demand when user clicks "Refresh"

### 20.5.2 Full Pulse View

- **Route:** `/workspace/:workspace_id/pulse`  
- **Layout:**  
  - Left panel: Health Score summary (large), 7-day trend chart, breakdown breakdown  
  - Right panel:  
    - "This Week's Summary" (Agent-generated, \~300 tokens)  
    - "Action Items" (ranked by priority, max 5 shown)  
    - "Key Metrics" (table from email)  
  - Bottom: "View Weekly Digests Archive" (past 12 weeks)

### 20.5.3 Digest Archive

- **Accessible via:** "View Weekly Digests Archive" link on Pulse page or in email footer  
- **Display:** List of past 12 weekly digests (most recent first)  
- **Per digest:**  
  - Date range  
  - Health Score (on that date)  
  - Summary snippet (first 100 chars)  
  - "View" link (opens full digest as read-only)  
- **Export:** Export past 12 weeks as CSV (health score history \+ weekly summaries)

## 20.6 Notification Preferences & Settings {#20.6-notification-preferences-&-settings}

### 20.6.1 Notification Settings

- **Location:** Workspace Settings \> Notifications or User Settings \> Notifications  
- **Controls:**  
  - **Inbox:** Enable/disable all notifications (toggle)  
  - **Email digest:** Enable/disable weekly email, select day (Monday/Wednesday/Friday)  
  - **Per-notification-type:** Toggles for each type (Phase Transition, SLA Alert, Q\&A Mention, etc.)  
  - **Quiet hours:** Set time range (e.g., 6pm–9am) when notifications not sent (batched for next delivery)  
  - **Do Not Disturb:** Global pause all notifications for 24h (extends on click)

### 20.6.2 Notification Channels

- **In-app:** Always (if enabled globally)  
- **Email:** Only if "Email Notifications" enabled in settings  
- **SMS (Enterprise only):** Critical alerts only (Phase transitions, high-priority SLA); requires opt-in \+ phone verification  
- **Slack (future):** Integration planned for v7.0

## 20.7 Acceptance Criteria {#20.7-acceptance-criteria}

### 20.7.1 Inbox Feed

- [ ] Unified feed displays all notification types (Phase transitions, SLA alerts, Q\&A mentions, amendments, etc.)  
- [ ] Notifications priority-ordered (1=high, 2=medium, 3=low)  
- [ ] Unread badge shown on bell icon (count)  
- [ ] Mark as read / Dismiss actions available per notification  
- [ ] "Mark All as Read" button functional  
- [ ] Filter by type (All, Unread, PHASE\_TRANSITION, SLA\_ALERT, etc.)  
- [ ] Lazy-load pagination (20 per load)  
- [ ] Auto-expiry for relevant notifications (SLA alerts, phase transitions, Q\&A mentions, scoring activity)

### 20.7.2 Health Score Calculation

- [ ] Formula: 0.3×SLA \+ 0.3×Scoring \+ 0.2×Response \+ 0.2×Velocity (Phase 10+)  
- [ ] Before Phase 6: 0.5×SLA \+ 0.5×Velocity  
- [ ] Phase 6–9: 0.4×SLA \+ 0.4×Response \+ 0.2×Velocity  
- [ ] Output: 0–100, color-coded (green 80–100, yellow 50–79, red 0–49)  
- [ ] Breakdown chart shows contribution of each signal  
- [ ] 7-day trend chart visualized with historical scores  
- [ ] Daily calculation at 9am UTC  
- [ ] Health Score locked at Phase 12 entry

### 20.7.3 Pulse Digest Email

- [ ] Weekly digest sent Monday 9am (configurable day \+ time) recipient's timezone  
- [ ] Subject includes workspace name \+ current health score \+ color  
- [ ] Content sections: Health Overview, AI Summary, Action Items, Key Metrics  
- [ ] AI summary: \~300 tokens, Sonnet-generated, specific \+ actionable  
- [ ] Action items: ranked by priority, max 5, include links  
- [ ] Metrics table: current, target, status  
- [ ] Footer: links to workspace analytics \+ notification settings  
- [ ] HTML \+ plain text versions

### 20.7.4 In-App Pulse Widget

- [ ] Dashboard Pulse card shows: Health Score, 7-day trend, breakdown bars  
- [ ] "View Details" link opens full Pulse view  
- [ ] Full Pulse view: Health Score summary, trend chart, This Week's Summary (AI), Action Items, Key Metrics  
- [ ] Digest Archive: past 12 weeks viewable, exportable as CSV  
- [ ] Last updated timestamp shown

### 20.7.5 Notification Settings

- [ ] Enable/disable all notifications (global toggle)  
- [ ] Weekly digest: enable/disable, select day (Mon/Wed/Fri)  
- [ ] Per-type toggles (Phase Transition, SLA Alert, Q\&A Mention, Amendment, Disagreement, Workspace Invite, Team Assignment, Scoring Activity, Response Activity)  
- [ ] Quiet hours: time range when notifications batched  
- [ ] Do Not Disturb: global pause for 24h (extendable)  
- [ ] Settings persist per user \+ workspace

---

---

# 21\. The Sourcera Agent {#21.-the-sourcera-agent}

## 21.1 Purpose {#21.1-purpose}

The Sourcera Agent is an AI-driven infrastructure layer woven into every stage of the product. It operates autonomously based on pipeline phase and user-configured rules, within strict data boundaries. The Buyer Console Agent cannot access Seller Console data, and vice versa. All Agent outputs are labeled `[AI-Generated]` with confidence scores. The Agent never replaces human judgment—it augments and accelerates it.

## 21.2 Architecture {#21.2-architecture}

**Multi-model approach:**

| Model | Use Cases | Cost Profile |
| :---- | :---- | :---- |
| **Claude Opus** | Complex document parsing (Policy Ingestion), deep reasoning tasks (scenario analysis) | $15–30 per framework. Used sparingly, one-time tasks |
| **Claude Sonnet** | Narrative generation, insight cards, risk analysis, Pre-Scoring, briefings, TCO analysis | \~$0.15–0.30 per call. Used frequently |
| **Claude Haiku** | High-frequency tasks: semantic matching, KB suggestions, deduplication, label tagging, staleness detection | \~$0.02–0.05 per call. Used at scale |

**Data boundaries:** Console isolation enforced at the Agent invocation layer — the LLM context window never receives cross-console data.

## 21.3 Guardrails & Hallucination Protection {#21.3-guardrails-&-hallucination-protection}

**Confidence thresholds:** Agent suggestions include a confidence score (0.0–1.0). Results below the configured threshold per capability are suppressed.

| Capability | Default Threshold |
| :---- | :---- |
| KB suggestions | 70% |
| Policy deduplication | 90% |
| Evidence parsing | 60% |
| Pre-Scoring | 65% |
| Disagreement Insight Cards | 50% |

Users may adjust thresholds per capability in Settings → Agent.

**Output labeling:** All Agent-generated content displays `[AI-Generated]` label with confidence score inline:

- Pre-Scores: "\[AI-Generated\] 82% confidence — FM(1.0)"  
- Suggestions: "\[AI-Generated\] 75% confidence — KB Entry \#4521"  
- Narratives: "\[AI-Generated\] Agent generated this summary. Edit to verify accuracy before sharing."

**User feedback loop:** Every Agent output includes "Was this helpful?" (thumbs up/down). Feedback is recorded per org and used for model recalibration. Users can report hallucinations via "This is wrong" link that opens a support form.

**Prohibited hallucinations:** Agent outputs are filtered against:

- Factually incorrect pre-scores (validated via override tracking)  
- Vendor names or data not from source documents  
- Scoring recommendations (Agent generates context, not a specific grade)

Failed or risky outputs gracefully degrade — the feature works without Agent suggestion.

## 21.4 Agent Capability Catalog & Outcome Pricing {#21.4-agent-capability-catalog-&-outcome-pricing}

All capabilities are priced on an outcome basis (see §34.3 and §34.11). Every operation resolves `accepted` (bills at `value_price`) or `rejected` (bills at `cost_price`). Plan availability governs *access* to a capability; spending draws from the Org AI budget (§34.10) regardless of plan. Value prices shown are illustrative — live rates are published at `api.sourcera.com/v1/pricing` and kept in sync with `KB_Engineering_Spec.md §13.2`.

### 21.4.1 Buyer-Console Capabilities

| # | Capability | Model | Trigger | Phase | Plan Access | Accepted (value) | Rejected (cost) |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| 1 | **Policy Document Parsing** | Opus | User uploads compliance framework | 1–5 | All (budget-metered) | $25.00 | $3.50 |
| 2 | **Policy Deduplication** | Haiku | Post-parsing | 1–5 | All | $0.04 | $0.005 |
| 3 | **Policy Traceability Mapping** | Sonnet | Pre-requirement creation | 1–5 | All | $0.30 | $0.04 |
| 4 | **Triage Auto-Mapping** | Haiku | Requirement created/assigned | 1+ | All | $0.02 | $0.003 |
| 5 | **Requirement Splitting** | Sonnet | User triggers via slash command | 1 | All | $0.40 | $0.05 |
| 6 | **Vendor Invite Suggestion** | Sonnet | Phase 3 vendor curation | 3 | Growth+ | $0.60 | $0.08 |
| 7 | **Evidence Parsing** | Sonnet | Vendor uploads evidence file | 6+ | All | $0.35 | $0.05 |
| 8 | **Pre-Scoring** | Sonnet | Phase 10 entry | 10 | All | $0.50 | $0.06 |
| 9 | **Disagreement Insight Card** | Sonnet | Score divergence > 0.3 | 10 | All | $0.80 | $0.10 |
| 10 | **Demo Focus Brief** | Sonnet | Phase 11 entry | 11 | All | $1.20 | $0.15 |
| 11 | **"What Would Flip" Analysis** | Sonnet | On-demand in Simulation Mode | 10–12 | All | $1.00 | $0.13 |
| 12 | **TCO Analysis Narrative** | Sonnet | Selection Report with TCO | 12 | All | $1.20 | $0.15 |
| 13 | **Sensitivity Narrative** | Sonnet | Selection Report with sensitivity | 12 | Growth+ | $1.20 | $0.15 |
| 14 | **Organizational Intelligence Briefing** | Sonnet | On-demand or scheduled | Any | Starter+ | $2.00 | $0.26 |
| 15 | **Deep Comparison** | Opus | User triggers in Phase 10–12 | 10–12 | All | $12.00 | $1.60 |
| 16 | **Stakeholder Summary** | Sonnet | Phase 8+ shareable artifact | 8+ | All | $1.20 | $0.15 |
| 17 | **Vendor Summary** | Haiku | Vendor record created/refreshed | 3+ | All | $0.08 | $0.010 |
| 18 | **Requirement Extraction** | Sonnet | Document ingest → requirement draft | 1–3 | All | $0.40 | $0.05 |
| 19 | **Pulse Digest (Weekly)** | Sonnet | Weekly schedule | Any | All | $0.50 | $0.07 |
| 20 | **Comment Thread Summary** | Haiku | Thread exceeds 15 messages | Any | All | $0.02 | $0.003 |
| 21 | **SLA Escalation** | N/A (rule-based) | SLA timer breach | Any | All | — (not AI-billed) | — |

### 21.4.2 Seller-Console Capabilities

| # | Capability | Model | Trigger | Plan Access | Accepted (value) | Rejected (cost) |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| S1 | **KB Bootstrap** | Opus | Seller signup (1 lifetime free) / re-bootstrap on paid tiers | All (1 lifetime free) | $200.00 | $26.00 |
| S2 | **First-Pass RFP Draft** | Sonnet | Bid accepted or requirements import | All (budget-metered) | $0.15 | $0.02 |
| S3 | **KB-to-Response Suggestion** | Haiku | Vendor opens response form | All | $0.03 | $0.004 |
| S4 | **Q&A Answer Suggestion** | Sonnet | Vendor posts question | All | $0.50 | $0.07 |
| S5 | **KB-to-Capability Suggestion** | Haiku | Seller creates capability declaration | All | $0.80 per 100-entry batch | $0.10 |
| S6 | **KB Staleness Classifier** | Haiku | Scheduled daily | All | $0.02 | $0.003 |
| S7 | **Firecrawl Crawl + Dedupe** | Sonnet | Firecrawl source crawl | Starter+ | $0.04 per page | $0.005 |
| S8 | **Ghost-RFP Ingestion** | Opus | Seller uploads historical RFP (1st free) | All | $25.00 | $3.30 |
| S9 | **Seller Page Enrichment** | Opus | Seller triggers profile enrichment | Starter+ | $8.00 | $1.10 |
| S10 | **Capability Declaration Suggest** | Sonnet | KB clustering signals missing declaration | All | $0.30 | $0.04 |
| S11 | **Match Score (numeric)** | Sonnet | Seller views Marketplace listing on Growth+ | Growth+ | $0.40 per opportunity | $0.05 |
| S12 | **Bid Task Assignment Suggest** | Haiku | Bid workspace task creation | All | $0.01 | $0.002 |
| S13 | **Document Attach Suggest** | Haiku | Response draft cites compliance requirement | All | $0.02 | $0.003 |

### 21.4.3 Platform-Owned Capabilities (Not Customer-Billed)

Capabilities tagged `sourcera_owned` run on Sourcera's internal Platform Marketing cost center and never bill to a customer Org. These include M9 Category Page FAQ generation, M10 How-to-Evaluate guide drafting, M11 Comparison Page generation, M12 Market Intelligence Report generation, and M13 Heat Map analytics. See §27.6 and anti-spam controls (§3.5 of Master Summary).

### 21.4.4 Free-Plan Access Rules

Free plan (Buyer or Seller) has access to every capability marked "All" above, bounded only by the $5/month AI budget. Free plans cannot enable wallet overage (hard-cap at $5). Capabilities marked with a tier gate (e.g., Growth+) are disabled on lower tiers regardless of budget — they require a plan upgrade.

### 21.4.5 Outcome Signals

Outcome-signal contracts per capability are defined in §34.11.1 and the Outcome Resolver registry. The registry is versioned alongside the Capability Catalog; updating a signal contract requires a minor-version bump and 30-day customer notice for annual contracts.

## 21.5 Agent AI Budgets (Value-Dollars) {#21.5-agent-ai-budgets-(value-dollars)}

AI budgets are denominated in **value-dollars**, not tokens. Value-dollars are stable month over month — if Anthropic pricing moves, the multiplier (`value = cost × 10`, `cost = cost × 1.05`) holds and `cost_base` is re-derived nightly (see §34.11.3).

| Console | Plan | Monthly Included Budget | Wallet Overage | Visibility |
| :---- | :---- | :---- | :---- | :---- |
| Buyer | Free | $5 | Disabled (hard cap) | Settings → AI Usage (single number) |
| Buyer | Business Starter | $50 | Opt-in, off by default | Settings → AI Usage (per-capability) |
| Buyer | Business Growth | $300 | Opt-in, off by default | Settings → AI Usage (per-capability + trend) |
| Buyer | Business Scale | $800 | Opt-in, 5% preferred rate | Settings → AI Usage (per-capability + trend + forecast) |
| Buyer | Enterprise | Committed | Volume-discounted | Real-time metering + forecast + API |
| Seller | Free | $5 | Disabled (hard cap) | Settings → AI Usage (single number) |
| Seller | Seller Starter | $30 | Opt-in, off by default | Settings → AI Usage (per-capability) |
| Seller | Seller Growth | $200 | Opt-in, off by default | Settings → AI Usage (per-capability + trend) |
| Seller | Seller Scale | $600 | Opt-in, 5% preferred rate | Settings → AI Usage (per-capability + trend + forecast) |
| Seller | Seller Enterprise | Committed | Volume-discounted | Real-time metering + forecast + API |

**Budget exhaustion behavior:**
- **Wallet overage disabled:** Agent calls blocked with `ai_budget_exceeded` error, contextual upgrade CTA surfaced.
- **Wallet overage enabled, cap not hit:** Calls proceed, debited from `overage_balance` at outcome-accounted rates.
- **Wallet overage enabled, cap hit:** Calls blocked; notification sent to Billing Admin and Org Owner; soft cap at 80% emits early warning.

**Pooled across consoles.** An Org that holds Buyer Growth + Seller Starter has $330 of unified AI budget spendable by any capability in either console. See §34.10.3.

**Visibility surface.** Settings → AI Usage shows:
- Value-dollars used this month (accepted + rejected split)
- Percentage of included budget consumed
- Breakdown by capability, model, and accept/reject rate
- Wallet balance and overage usage (if enabled)
- Committed spend status (Enterprise)
- Forecast trend vs prior 3 months

## 21.6 Agent Failure Handling {#21.6-agent-failure-handling}

| Failure Type | Behavior | User Impact |
| :---- | :---- | :---- |
| Model error / timeout | Retry once with exponential backoff (1s, then 2s). If retry fails, graceful degradation | Feature works without Agent output. Toast: "\[Feature Name\] suggestion unavailable. You can proceed manually." |
| Token budget exceeded | Reject call with `agent_budget_exceeded` | User prompted to upgrade or wait for budget reset (monthly, UTC midnight) |
| Context window exceeded | Truncate input to fit window (with priority: most recent requirements first). Return partial results with warning | Toast: "Large request — Agent processed first 500 requirements. Remaining items skipped." |
| Prompt injection detected | Reject call and log security event | Toast: "Request blocked for security. Contact support if you believe this is an error." |

**Graceful degradation examples:**

- If Pre-Scoring fails, Scoring phase opens with empty suggested grades. Evaluators proceed with manual scoring.  
- If Evidence Parsing fails, vendor can still submit the file; it appears in responses without Agent summary.  
- If KB suggestion fails, Bid Workspace shows response form without suggestions.  
- If Policy Ingestion fails, user is prompted to retry or contact support.

**Cost:** Failed calls that are retried consume tokens only on the successful attempt. Failed calls that degrade gracefully consume tokens for the failed attempt.

## 21.7 Agent Bias & Limitations {#21.7-agent-bias-&-limitations}

1. **Semantic matching** (Haiku) works well for exact-domain matches but may fail on novel jargon or industry-specific terminology. Confidence \< threshold is filtered out.  
2. **Policy parsing** (Opus) works reliably for NIST CSF, ISO 27001, SOC 2\. Non-standard or non-English documents produce lower quality. Scanned PDFs and image-only documents are rejected.  
3. **Narratives** (Sonnet) are generated from structured data and may lack nuanced domain expertise. All narratives are labeled `[AI-Generated]` and should be reviewed by domain experts before final use.  
4. **Pre-Scoring** assumes vendor response quality and clarity. Ambiguous or vague responses may receive lower confidence scores. The Agent never recommends a specific grade—it provides context via Insight Cards, not direction.  
5. **Evidence parsing** relies on document metadata and OCR quality. Handwritten notes, images, or non-standard file formats are not supported.

## 21.8 Custom Agent Instructions {#21.8-custom-agent-instructions}

**Purpose:** Allow Team Owners to define domain-specific rules that apply globally across all active Workspaces within their team.

**Example instructions:**

- "Flag any vendor response mentioning 'OpenAI' as High Risk — InfoSec concern."  
- "Auto-tag Requirements with 'GDPR' if the description contains 'data residency' or 'EU user data'."  
- "Boost KB suggestion confidence by \+10% for entries reviewed in the past 30 days."

**Storage & Security:**

- Instructions stored per Team in `team.agent_instructions` (array, max 50 instructions)  
- Each instruction is sandboxed against prompt injection via strict parameter filtering  
- All instruction changes are versioned in the audit trail with user attribution and timestamp  
- Instructions are applied within 60 seconds of save via a Convex scheduled function

**Constraints:**

- Max 5,000 characters per instruction  
- No access to cross-console data  
- Cannot modify RBAC or phase transitions  
- Cannot delete or modify vendor data

**User Interface:** Section 8 (Organization & Admin) covers the settings page. Instructions are edited in Team Settings → Agent Rules.

## 21.9 Acceptance Criteria {#21.9-acceptance-criteria}

- All Agent calls complete within specified timeouts (30–60s for Sonnet, 10–20s for Haiku, 3–10 min for Opus).  
- Agent failures gracefully degrade without blocking user workflows.  
- Monthly token consumption is accurately metered and displayed.  
- Console isolation is enforced — no cross-console data in Agent context windows.  
- All Agent outputs labeled `[AI-Generated]` with confidence score.  
- Confidence threshold filtering removes results below configured threshold per org.  
- Custom Agent Instructions applied within 60 seconds of save.  
- User feedback loop captures helpfulness votes and hallucination reports.

---

# 22\. Seller Console — Knowledge Base {#22.-seller-console-—-knowledge-base}

## 22.1 Purpose {#22.1-purpose}

The Knowledge Base is the seller's strategic asset — an AI-indexed library that grows smarter with every evaluation. It serves two functions: (1) a private response library used by sellers to build faster, more consistent answers across bids, and (2) a source of capability evidence that sellers can publish to their Seller Profile to increase discoverability.

## 22.2 Ingestion Channels {#22.2-ingestion-channels}

1. **Manual authoring:** Seller creates KB entries directly via KB Editor.  
2. **Bid response import:** After a Workspace closes (Phase 13), responses are offered to the seller KB with bulk save or auto-save on withdrawal (per user preference).  
3. **Automated web crawling (Firecrawl):** Sellers configure crawl sources (help centers, API docs, trust centers) with crawl depth, frequency, and content scope.

All entries go through a review-and-approval workflow before becoming `active`.

## 22.3 KB Entry Lifecycle {#22.3-kb-entry-lifecycle}

**Status transitions:**

| Status | Trigger | Description |
| :---- | :---- | :---- |
| `draft` | Entry created or crawled | Not yet reviewed. Not suggested to vendors. |
| `under_review` | Seller initiates review | Seller actively reviewing before publication. |
| `active` | Seller publishes | Published and eligible for KB suggestions. |
| `review_due` | Entry past review cadence | Flagged for re-verification but still suggested at reduced confidence. |
| `review_overdue` | Entry 2× past review cadence | Flagged prominently in KB Health Dashboard. Confidence deprioritized. |
| `flagged_stale` | Entry 3× past review cadence OR manually flagged | Removed from suggestions entirely. Marked red in Health Dashboard. |
| `archived` | Seller manually archives | Retained for history but never suggested. Searchable via "include archived." |

**Review cadence:** Configurable per entry, default 90 days. Sellers set cadence based on source documentation change frequency. ISO certificates may be 365 days; product FAQs may be 30 days.

**Last used timestamp:** Every KB entry tracks `last_used_at` (timestamp of most recent bid where entry was suggested to vendor, or manually used by seller). Used in staleness calculation and analytics.

## 22.4 KB Health Model {#22.4-kb-health-model}

Every KB entry carries a `confidence_modifier` (Float, 0.0–1.0) that decays based on age and review status.

**Decay formula:**

confidence\_modifier \= base\_confidence × 

  (1 \- (days\_since\_review / (review\_cadence\_days × 2)))

  × usage\_boost

where `usage_boost = 1.0 + (0.1 × recent_usage_count)` (max 1.5, boosts frequently-used entries).

Clamped to minimum 0.1. Entries at 0.1 are effectively deprioritized in Agent suggestions.

**Agent behavior on staleness:**

- Stale entries (`flagged_stale`) are completely deprioritized in suggestions.  
- Entries with low win rates (frequently dismissed by buyers across bids) or repeated cross-bid dismissals are automatically deprioritized via a \-20% modifier.  
- Entries aged \>365 days without review receive warning message: "This entry hasn't been reviewed in \[N\] days. Consider updating before using."

## 22.5 Firecrawl Integration {#22.5-firecrawl-integration}

Sellers configure Firecrawl sources (up to plan limits) with:

- Root URL  
- Crawl depth (1–5 levels)  
- Frequency (daily, weekly, monthly)  
- Content scope description (what to include/exclude)  
- Auto-approval threshold (percentage similarity above which newly crawled content auto-publishes; default 0, meaning all crawls are draft)

Crawled pages are:

1. Chunked into KB-entry-sized segments (≤2000 chars per chunk).  
2. Deduplicated against existing KB entries using semantic similarity (Haiku, ≥85% match \= likely duplicate).  
3. Queued as `draft` status for human review.  
4. On re-crawl, the Agent detects changes in previously crawled pages and flags affected KB entries for re-verification with a "Source content changed" label.

**Plan limits:**

| Plan | Crawl Sources | Max Pages Per Crawl | Re-crawl Frequency |
| :---- | :---- | :---- | :---- |
| Free | 1 | 100 | Weekly |
| Business | 5 | 1,000 | Daily |
| Enterprise | 25 | 10,000 | Hourly |

## 22.6 Document Library {#22.6-document-library}

A centralized repository for compliance and corporate documents that apply across many bids.

**Document fields:**

- `title` (string, ≤100 chars)  
- `category` (enum: SOC2, ISO, HIPAA, GDPR, Penetration Test, Insurance, Whitepaper, Other)  
- `expiration_date` (timestamp, optional)  
- `version` (string, e.g., "2.1")  
- `file_url` (reference to Convex Storage)  
- `last_updated` (timestamp)

**Behavior:**

- Documents carry expiration dates and version chains. When a new version is uploaded, all active bids referencing the old version are flagged for update with a notification to the Bid Owner.  
- The Agent can auto-attach eligible documents to matching responses (configurable per Bid Workspace).  
- Expired documents render with a red "Expired" badge and are excluded from auto-attach unless seller explicitly overrides.

**Plan limits:**

| Plan | Documents |
| :---- | :---- |
| Free | 50 |
| Business | 500 |
| Enterprise | 5,000 |

## 22.7 Acceptance Criteria {#22.7-acceptance-criteria}

- KB search (via Convex RAG) returns results within 200ms.  
- Firecrawl re-crawl detects content changes with ≥95% accuracy.  
- KB Health Dashboard groups all entries by status (`active`, `review_due`, `review_overdue`, `flagged_stale`, `archived`).  
- Confidence decay is applied correctly via a daily scheduled Convex function.  
- Document expiration warnings surface in Bid Workspace before submission.  
- "Last used" timestamp is updated every time an entry is suggested or manually used.

---

# 23\. Seller Console — Bid Workspace & Response Management {#23.-seller-console-—-bid-workspace-&-response-management}

## 23.1 Bid Workspace Overview {#23.1-bid-workspace-overview}

A Bid Workspace is created in the vendor's Seller Console for each buyer evaluation they participate in. It mirrors the buyer's evaluation structure (Use Cases → Requirements) but presents a vendor-specific response interface. The Bid Workspace is read-only for all requirements and Use Cases — the vendor cannot edit them. The vendor can only respond to Requirements via the Response form.

**Bid Workspace fields:**

| Field | Type | Notes |
| :---- | :---- | :---- |
| `bid_workspace_id` | UUID | Same as `workspace_id` with `console = seller` |
| `buyer_workspace_id` | UUID | FK to buyer's Workspace |
| `bid_owner_id` | UUID | FK User. Single owner. Required. |
| `status` | Enum | `invited`, `nda_pending`, `nda_signed`, `active`, `submitted`, `disqualified`, `withdrawn`, `canceled` |
| `submission_deadline` | Timestamp | Buyer-set deadline for vendor response submission. Read-only. |
| `phase` | Integer (1–13) | Mirrors buyer workspace phase. Determines visibility of requirements. |

## 23.2 Response Lock & Concurrency Control {#23.2-response-lock-&-concurrency-control}

**Problem:** Two users editing the same response simultaneously causes merge conflicts.

**Solution:** Advisory lock at response level.

**Lock behavior:**

- When Vendor User A opens a response form for edit, a lock is acquired: `response.lock = { user_id: A, acquired_at: T, expires_at: T + 600s }`.  
- If Vendor User B tries to open the same response for edit, they see: "Currently being edited by \[User A\]. Changes are read-only. Try again in 10 minutes or force unlock."  
- The lock auto-releases after 10 minutes (600 seconds).  
- At T \+ 540s (9 minutes), User A sees a warning toast: "Your edit lock expires in 60 seconds. Save or your changes will be unlocked."  
- User A can extend the lock by clicking "Keep Editing" (adds 300 seconds).  
- User A can force-release by clicking "Done" button.  
- Force-unlock by User B requires confirmation: "Are you sure you want to unlock \[User A\]'s edit session? Their unsaved work will be lost."

**Lock implementation:** Advisory lock enforced at Convex mutation level via atomic compare-and-swap on `response.lock` field. No database-level locks.

**First-write-wins semantics:** If both users hit save simultaneously, the first to commit wins. The second sees: "This response was updated by another user. Your changes are shown below. \[Accept their changes\] \[Discard and keep mine\] \[Merge manually\]."

## 23.3 Response Submission {#23.3-response-submission}

For each requirement, the vendor submits a response matching the requirement's `response_type`:

- **Boolean:** Yes/No toggle. Auto-submitted upon selection.  
- **Qualitative:** Rich text (Markdown, 0–50,000 chars). Agent suggests from KB. Pre-filled via "Use This" on KB entry.  
- **Evidence:** File upload (up to 10 files, 50MB each) \+ optional text description (0–5,000 chars). Agent cross-references against requirement and surfaces summary with page citations. Evidence is locked in Phase 9+ per response.  
- **Informational:** Free text (0–50,000 chars). Not scored.  
- **Pricing:** Structured form matching the requirement's `pricing_config`. See Section 14.4.

**Response lifecycle:** `pending` → `draft` → `ready_for_review` → `submitted` → (optionally `needs_reverification` if buyer amends) → `locked` (Phase 9+).

**Bulk submit behavior (Gap 23.2):**

- Vendor clicks "Submit All" to submit all `draft` and `ready_for_review` responses at once.  
- Server validates all responses in a transaction.  
- If all valid: all submit successfully, status \= `submitted`, Bid Workspace status \= `submitted`.  
- If any invalid: partial success — N responses submitted successfully, M responses fail with error details listed: "4 responses submitted. 2 responses failed: \[Requirement Title\] — Response must include at least one file. \[Other Requirement Title\] — File exceeds size limit."  
- Failed responses remain in `draft` status and can be re-submitted.  
- User sees: "4 of 6 responses submitted successfully. \[2 errors\] \[Retry Failed\]"

## 23.4 Vendor Voluntary Withdrawal {#23.4-vendor-voluntary-withdrawal}

**Trigger:** Vendor clicks "Withdraw from Evaluation" in Bid Workspace settings.

**Workflow:**

1. Confirmation modal: "Are you sure you want to withdraw? Your responses will be saved but marked as withdrawn. This cannot be undone."  
2. Option to provide withdrawal reason (optional): "What prompted this withdrawal?" (text field, max 500 chars).  
3. On confirm: Bid Workspace status → `withdrawn`. Vendor notification email sent to Bid Owner.  
4. Buyer notification: Workspace Owner sees "Vendor \[Name\] has withdrawn from this evaluation." in Activity feed.  
5. Withdrawn vendor's responses remain in the system (`status = submitted` or `draft` at withdrawal time) but are excluded from Scoring phase (marked as "Not Participating" in scoring matrix).  
6. Withdrawal is permanent and irreversible within the same Workspace. If buyer wants to re-engage the vendor, a new Workspace must be created.

**Data retention:** All withdrawn responses are archived but retained for audit trail. Seller can export withdrawn responses to KB if desired.

## 23.5 Acceptance Criteria {#23.5-acceptance-criteria}

- Bid Workspace syncs buyer requirements within 5 seconds of Phase 6 entry.  
- Response form renders correct input type based on `response_type`.  
- KB suggestions appear within 2 seconds of opening a response form.  
- Response submission updates buyer-side view within 5 seconds.  
- Lock contention shows "Currently being edited by X" message.  
- Bulk submit shows partial success (N submitted, M failed with error list).  
- Withdrawal confirmation modal prevents accidental withdrawal.  
- Withdrawn vendor excluded from Scoring phase.

---

# 24\. Seller Console — Q\&A, NDA, Inbox & Pulse {#24.-seller-console-—-q&a,-nda,-inbox-&-pulse}

## 24.1 Seller Q\&A {#24.1-seller-q&a}

Vendors participate in Q\&A threads during Phase 7 (Q\&A Open). Behavior mirrors the buyer Q\&A from Section 17, but from the vendor perspective.

**Vendor-side behavior:**

- Vendor can view all buyer-posted questions.  
- Vendor can post responses/clarifications.  
- Vendor cannot post questions to themselves.  
- Q\&A threads are read-only once Phase 8 begins (Q\&A Closed).

## 24.2 NDA Module & Execution {#24.2-nda-module-&-execution}

During Phase 4, vendors see only the NDA module. NDA acceptance is tracked per-vendor.

**NDA flow:**

1. Buyer uploads NDA document (PDF or DOCX) to the Workspace.  
2. Vendor receives notification: "NDA available for review. Please review and accept to proceed."  
3. Vendor reviews NDA and clicks "Accept" or "Request Changes."

**On accept:**

- Checkbox: "I have reviewed and accept the NDA."  
- Timestamp recorded: `nda_accepted_at` (UTC).  
- NDA version recorded: `nda_version_id` (FK to version).  
- Target Account status → `nda_signed`.  
- Bid Workspace status → `nda_signed` (Phase 5 can now be entered).  
- Buyer notification: "Vendor \[Name\] has signed the NDA."

**On "Request Changes":**

- Buyer is notified: "Vendor \[Name\] requested changes to the NDA."  
- Manual negotiation expected outside Sourcera.  
- NDA remains in `pending` status until accepted or escalated.

**Multiple NDA versions (Gap 24.2):**

- Buyer can upload revised NDA at any phase.  
- New version stored with `version_number` (auto-increment) and `created_at`.  
- Old versions persist in the system but are marked `superseded = true`.  
- Vendor who previously signed receives notification: "Updated NDA available for signature. Remaining vendors require updated NDA acceptance before proceeding."  
- Vendor must re-sign updated NDA to proceed. Re-signing overwrites `nda_signed_at` and `nda_version_id`.  
- If vendor refuses updated NDA, buyer can choose to disqualify or create an exception.

**NDA signature method (Gap 24.1):**

- For v6.0, NDA signing is a checkbox acknowledgment (not third-party e-signature service like DocuSign).  
- Stored as `nda_signed: boolean` and `nda_signed_at: timestamp`.  
- Legal enforceability depends on the clause language in the NDA itself and applicable jurisdiction law.  
- E-signature integration (e.g., DocuSign) is Phase 2 roadmap post-v6.0.

## 24.3 Seller Inbox {#24.3-seller-inbox}

Unified feed of action items for the seller:

- New buyer requirements mapped to seller's teams (requirements posted to Bid Workspace).  
- Amendment re-verification requests (buyer changed a requirement after Phase 6, vendor must re-verify response).  
- Q\&A responses from buyers.  
- KB entries flagged for review (staleness, source content changes).  
- Document Library expiration warnings (documents expiring within 30 days).  
- NDA signature requests (Phase 4).  
- Phase transitions (workspace advances to next phase).

Inbox is sorted by priority (action required \> updates \> info) and date (newest first). Each item is clickable and navigates to the relevant section.

## 24.4 Seller Pulse {#24.4-seller-pulse}

Health dashboard for Bid Workspace Owners:

- **Response progress:** % of requirements with submitted responses (e.g., "45/100 requirements submitted, 45%").  
- **Pending re-verification count:** Requirements with amendments pending vendor re-verification.  
- **Upcoming deadlines:** Q\&A close date, submission deadline, phase transitions.  
- **KB health status:** Count of entries needing review (stale, review\_due, flagged\_stale).  
- **Phase progress:** Current phase, phases completed, phases remaining.  
- **Team status:** For multi-team orgs, response count by team (e.g., "InfoSec: 12/15, Legal: 8/8, Operations: 3/10").

Seller Pulse is the inverse of Buyer Pulse — it shows seller bottlenecks instead of buyer bottlenecks.

## 24.5 Seller Analytics {#24.5-seller-analytics}

Per-Bid-Workspace metrics accessible via Analytics tab:

- **Response completion rate:** % of requirements with submitted responses over time (trend chart).  
- **Average response time:** Median hours from requirement posted (Phase 6 entry) to response submitted.  
- **KB utilization rate:** % of responses using KB-suggested content vs. written from scratch.  
- **Amendment re-verification time:** Median hours from amendment posted to vendor re-verification complete.  
- **Team breakdown:** Response completion by team.

## 24.6 Acceptance Criteria {#24.6-acceptance-criteria}

- NDA accept flow stores boolean \+ timestamp correctly.  
- NDA version updates require vendor re-signature.  
- Inbox surfaces all action items within 2 seconds of trigger event.  
- Seller Pulse updates in real-time as responses are submitted.  
- Analytics reflect accurate completion rates and timelines.

---

# 25\. Cross-Console Mechanics {#25.-cross-console-mechanics}

## 25.1 Data Flow via Console Bridge {#25.1-data-flow-via-console-bridge}

When data crosses the console boundary (buyer → seller or seller → buyer), it passes through a **console bridge** — a Convex mutation that enforces isolation rules and is versioned in the audit trail.

**Buyer → Seller data (Phase 6+):**

- Requirement titles, descriptions, response types, weights, Use Case structure (all read-only in Bid Workspace).  
- Q\&A responses from buyer team.  
- Amendment diffs (what changed, when, by whom).  
- Phase status changes.  
- NDA documents (Phase 4+).

**Seller → Buyer data:**

- Vendor responses (text, files, pricing).  
- Q\&A questions from vendor.  
- EOI submissions.  
- Withdrawal notification.

**Never crosses the bridge:**

- Buyer internal comments, scores, scoring rubrics, selection report drafts, scenarios, intelligence data.  
- Seller KB entries, Document Library contents, internal discussions, Custom Agent Instructions, Capability Declaration drafts (published declarations visible in Marketplace via separate mechanism, not bridge).

## 25.2 Sync Behavior & Retry {#25.2-sync-behavior-&-retry}

- Individual saves sync within 5 seconds.  
- Sync failures retry with exponential backoff (1s, 2s, 4s, max 30s, then abort).  
- A daily reconciliation job (runs at 2am UTC) detects and resolves stale bridge entries across all workspaces:  
  - Finds buyer-side changes that failed to sync to Bid Workspace.  
  - Finds seller-side responses that failed to sync to buyer Workspace.  
  - Re-attempts sync with fresh data.  
  - If still failing, creates a Sourcera support ticket and notifies Workspace Owner and Bid Owner.

**User notification on persistent failure:** If sync remains failed after 24 hours, both buyer and seller receive email: "Synchronization error between workspaces. \[Vendor Name\]'s updates may not be visible. Contact support." with support link.

## 25.3 Disqualification (Gap 25.2) {#25.3-disqualification-(gap-25.2)}

**Trigger:** Workspace Owner selects "Disqualify" on a Target Account in Vendor Curation section.

**Behavior:**

1. Rationale required (min 10 chars). Stored in audit event, not shared with vendor.  
2. Target Account status → `disqualified`.  
3. Bid Workspace status → `disqualified`.  
4. Vendor notification: "Your participation in '{Workspace Title}' has ended. Thank you for your interest." No rationale disclosed.  
5. All vendor responses → `locked`. Vendor cannot edit or add responses.  
6. Q\&A threads from this vendor → orphaned (vendor can read, not reply).  
7. Vendor excluded from Scoring phase (marked "Disqualified" in scoring matrix with red badge).

**Disqualification is permanent within a Workspace.** To re-evaluate the same vendor for the same opportunity, the Workspace Owner must create a new Workspace. Prior disqualification surfaces in Organization Intelligence as part of vendor history.

## 25.4 Acceptance Criteria {#25.4-acceptance-criteria}

- Cross-console sync latency \< 5 seconds for normal operations.  
- No buyer-internal data crosses bridge (enforced by unit tests on bridge mutations).  
- Disqualification cascade (status update, lock, notification, exclusion) completes within 10 seconds.  
- Amendment diff is correctly computed and displayed in seller's Bid Workspace.  
- Daily reconciliation job detects and re-syncs failed entries with \>95% accuracy.  
- Persistent sync failures trigger support ticket creation within 24 hours.

---

# 26\. Seller Profiles, Verification & Capability Declarations {#26.-seller-profiles,-verification-&-capability-declarations}

## 26.1 Seller Profile {#26.1-seller-profile}

Each selling Organization maintains a Seller Profile, visible in the Marketplace when `marketplace_opted_in = true`.

**Profile fields:**

- Organization name  
- Organization logo (max 2MB, PNG/JPG)  
- Company description (0–1000 chars, Markdown)  
- Website URL  
- Location / HQ region  
- Founded year  
- Number of employees (range: 1-10, 11-50, 51-200, 201-1000, 1000+)  
- Industries served (multi-select from controlled vocabulary)  
- Certification badges (SOC2, ISO 27001, HIPAA, etc.)  
- Verification tier (Basic, Verified, Certified)  
- Public contact email

## 26.2 Verification Tiers {#26.2-verification-tiers}

| Tier | Criteria | Badge Display | Approval Workflow |
| :---- | :---- | :---- | :---- |
| **Basic** | Email verified \+ account created | Gray checkmark icon | Automatic upon signup |
| **Verified** | Email verified \+ legal entity confirmed via business registration lookup (OpenCorporates or similar) | Blue "Verified" badge \+ checkmark | Semi-automatic, \<1 hour processing |
| **Certified** | All Verified criteria \+ manual review by Sourcera team (compliance docs reviewed) | Gold "Certified" badge \+ checkmark | Manual review, \~5–10 business days |

Buyers can filter Marketplace by verification tier. Certified vendors have higher visibility in match scoring.

## 26.3 Capability Declarations {#26.3-capability-declarations}

Sellers declare capabilities across four categories: Security & Compliance, Integration & Technical, Operational Maturity, Company Profile.

**Declaration schema:**

- Capability name (string, ≤100 chars, e.g., "SOC2 Type II")  
- Category (enum: Security & Compliance, Integration & Technical, Operational Maturity, Company Profile)  
- Declaration text (0–3000 chars, Markdown)  
- Evidence files (max 10 files, 50MB each)  
- Verification status (enum: `pending`, `evidence_provided`, `verified`)  
- Published (boolean, controls visibility in Marketplace)

**Verification (Gap 26.1):**

- When seller uploads evidence (e.g., SOC2 report PDF), evidence is stored and status auto-advances to `evidence_provided`.  
- Badge displays as "Evidence Provided" (accurate, transparent).  
- Manual moderation (e.g., Sourcera staff verifying the evidence is legitimate) is deferred to Phase 2 roadmap and not implemented in v6.0.

## 26.4 KB-to-Capability Auto-Suggestion {#26.4-kb-to-capability-auto-suggestion}

When a seller is editing Capability Declarations, the Agent (Haiku) suggests capabilities from the seller's KB entries.

**Trigger:** Seller opens Capability Declarations editor. Agent scans KB entries for structured content (e.g., "SOC2 certification" in title or body). For each detected capability, Agent displays:

- Suggested capability name  
- Associated KB entry title  
- Confidence score (0-100%)  
- "Create From KB" button

**Behavior:** Clicking "Create From KB" pre-fills the Capability Declaration form with:

- Capability name from KB title or Agent-extracted term  
- Declaration text from KB entry (first 500 chars)  
- Flag to link evidence files from KB entry (if any)

Seller can edit before publishing.

## 26.5 UX Implementation {#26.5-ux-implementation}

- **Inline Edit:** Capability names and declaration text editable in place (double-click to edit).  
- **Drag-and-Drop:** Evidence files uploaded via drag-and-drop or file picker.  
- **Progressive Disclosure:** Collapsed card shows name \+ badge \+ category. Expanded shows full declaration \+ evidence list.  
- **Batch Actions:** Multi-select capabilities for bulk publish to Marketplace or bulk archive.  
- **Mobile:** Single-column card grid. Native file picker (no drag-and-drop on touch).  
- **Keyboard Shortcuts:** `Cmd+N` to create new capability. `Cmd+Shift+P` to publish all.

## 26.6 Acceptance Criteria {#26.6-acceptance-criteria}

- Seller can declare 5–10 capabilities in \<30 minutes.  
- Evidence files are securely stored in Convex Storage with access logs.  
- Capability badges render correctly in Marketplace listings.  
- "Evidence Provided" badge text is accurate and not misleading (does not claim "Verified" without manual review).  
- KB-to-Capability suggestions appear within 3 seconds of editor load.

---

# 27\. Vendor Discovery & RFP Marketplace {#27.-vendor-discovery-&-rfp-marketplace}

## 27.1 Purpose {#27.1-purpose}

The Marketplace is a curated directory where buyers discover vendors and vendors discover evaluation opportunities. It is physically separate from both the Buyer and Seller Consoles — a neutral domain with its own access control rules.

## 27.2 Availability {#27.2-availability}

| Plan | Buyer Access | Seller Access |
| :---- | :---- | :---- |
| Free | Browse only (no filters) | Profile \+ Capability Declarations visible |
| Business | Search \+ capability filtering. 3 active listings, 10 EOIs/month | Profile \+ Capability Declarations visible |
| Enterprise | Full search \+ capability filtering \+ match scoring. Unlimited listings/EOIs | Profile \+ Capability Declarations visible |

## 27.3 Marketplace Search & Filtering {#27.3-marketplace-search-&-filtering}

**Filters:**

- Vendor name (text search, fuzzy match)  
- Industry (multi-select from controlled vocabulary)  
- Location / region (multi-select)  
- Certification (multi-select: SOC2, ISO 27001, HIPAA, GDPR, etc.)  
- **Capability:** Filter by declared capabilities (e.g., "SAML SSO", "Kubernetes Support"). Shows vendor count per capability.  
- Verification tier (checkbox: Basic, Verified, Certified)

**Listing display:**

- Vendor logo (48x48px)  
- Vendor name (bold, 16px)  
- Company description (2 lines, truncated)  
- Key certifications (badges)  
- Capability tags (max 5 visible, expandable)  
- Verification tier badge  
- "View Profile" button

**Sort order:** Relevance (default), Verification Tier (Certified first), Recently Active, Alphabetical.

## 27.4 Marketplace Match Score {#27.4-marketplace-match-score}

When a buyer creates a new Workspace and uploads requirements, the Marketplace dynamically calculates and displays a "Capabilities Match" score for each vendor profile.

**Formula (Gap 27.3):**

Match Score \= (number of vendor declared capabilities matching buyer requirement keywords)

              / (total buyer requirements with response\_type \!= informational)

              × 100%

This measures **vendor coverage of buyer needs** — what percentage of the buyer's scored requirements are addressed by the vendor's declared capabilities.

**Matching algorithm:**

1. For each buyer requirement (excluding `informational`), extract keywords from title and description.  
2. For each vendor's published capabilities, check if capability name or declaration text contains any keyword.  
3. If match found with confidence ≥60%, count as matched.  
4. Calculate match score as (matched count) / (total scored requirements) × 100%.

**Transparency:**

- Match score displayed as percentage or categorical (e.g., "92% match", "Strong match").  
- Hovering on score shows "Matched \[N\] of \[M\] requirements: \[Capability List\]" tooltip.  
- Match score is computed real-time when workspace is created and cached for 24 hours.

**Plan availability:**

- Free/Business: No match score displayed (vendors listed without scoring).  
- Enterprise: Match score displayed prominently, vendors ranked by score (highest first).

## 27.5 Expression of Interest (EOI) {#27.5-expression-of-interest-(eoi)}

Buyers can send an EOI to Marketplace vendors to invite participation.

**EOI content:**

- Buyer's workspace title (public summary, not full requirement matrix)  
- Buyer's evaluation summary (1–500 chars, Markdown)  
- Capability checklist: Buyer selects which vendor capabilities are critical (multi-select from vendor's declared capabilities)  
- Timeline: Expected submission deadline, expected decision date  
- Evaluation scope: Number of requirements, number of evaluation weeks  
- Contact person: Buyer rep name \+ email

**Vendor EOI response:**

- Accept: Vendor enters evaluation pipeline. Bid Workspace is created. Vendor status → `active`.  
- Decline: Vendor notifies buyer. EOI status → `declined`. Vendor not added to evaluation.  
- Request More Info: Vendor asks clarifying questions. Buyer notified. EOI in `awaiting_info` status until buyer responds.

**EOI post-listing-close behavior (Gap 27.1):**

- When Marketplace Listing is closed (workspace advances past Phase 3 Vendor Curation), pending EOIs are auto-rejected.  
- Vendor receives notification: "The evaluation '\[Workspace Name\]' is no longer accepting new vendors. Thank you for your interest."  
- EOI status → `rejected` (with reason \= "Listing closed").  
- No manual buyer action required.

## 27.6 Marketplace Tags & Controlled Vocabulary (Gap 27.2) {#27.6-marketplace-tags-&-controlled-vocabulary-(gap-27.2)}

All Marketplace tags (industries, certifications, capabilities) are controlled vocabulary maintained by Sourcera.

**Tag categories:**

- **Industries:** Enterprise Software, Fintech, HealthTech, SaaS, Manufacturing, etc. (40+ pre-defined)  
- **Certifications:** SOC2 Type II, ISO 27001, HIPAA, GDPR, PCI-DSS, FedRAMP, etc. (20+ pre-defined)  
- **Capabilities:** Dynamic, proposed by sellers, moderated by Sourcera. Examples: "SAML SSO", "Kubernetes Support", "Multi-tenancy", "API-First", etc.

**Seller tag proposal workflow:**

1. Seller clicks "Propose new tag" in Capability Declarations editor.  
2. Seller enters tag name (≤50 chars) and category (Security & Compliance, Integration & Technical, Operational Maturity, Company Profile).  
3. Tag submission routed to `tag_moderation_queue` (Sourcera admin dashboard).  
4. Sourcera team reviews tag for duplicates, clarity, generalizability.  
5. If approved: tag added to controlled vocabulary, made available to all sellers, linked to proposing seller.  
6. If rejected: seller notified with reason (e.g., "Too specific to your product. Try 'API Management' instead.").

Tags approved within 2–5 business days. Sellers can use tags as soon as approved.

## 27.7 Acceptance Criteria {#27.7-acceptance-criteria}

- Marketplace search returns results within 500ms.  
- Capability filtering correctly includes vendors with matching declarations.  
- Match Score is computed correctly per the formula.  
- EOI delivery confirmed within 30 seconds.  
- Pending EOIs auto-rejected when listing closes.  
- Marketplace tags are consistent vocabulary (no duplicates like "Cloud Security" vs. "cloud-security").  
- Seller tag proposals moderated within 5 business days.

---

# 28\. The Markdown Editor {#28.-the-markdown-editor}

## 28.1 Core Functionality {#28.1-core-functionality}

The Markdown Editor is used for all rich-text fields: requirement descriptions, response text, comments, Use Case briefs, Capability Declarations.

**Input:** CommonMark markdown. Maximum field length varies by entity (see Section 3.2).

**Output:** Server-side sanitized HTML. Allowlist: `b`, `em`, `u`, `code`, `pre`, `h1-h6`, `blockquote`, `ul`, `ol`, `li`, `a`, `hr`, `table`.

**Security constraints (Gap 28.1):**

- No iframes, no embedded scripts, no external images.  
- Content Security Policy enforced: `script-src 'none'`, `frame-src 'none'`, `img-src 'self'`.  
- HTML sanitized via DOMPurify with strict config.  
- Malicious content attempts logged and reported to security team.

**Live preview:** Optional toggle. Updates on keystroke, no debounce. Preview pane positioned to the right of editor (side-by-side).

**Code blocks:** Language identifier for syntax highlighting (js, python, yaml, sql, json, etc.). Unsupported languages rendered as plain code.

**Links:** Auto-detected and linkified. Relative links resolve to workspace resources (e.g., `[Requirement](SRC-123)` links to requirement). External links open in new tab with `rel="noopener noreferrer"`.

## 28.2 Keyboard Shortcuts (Editor Context) {#28.2-keyboard-shortcuts-(editor-context)}

| Shortcut | Action |
| :---- | :---- |
| `Cmd+B` | Bold (**text**) |
| `Cmd+I` | Italic (*text*) |
| `Cmd+K` | Insert link. Opens link dialog, does NOT trigger Command Palette when editor has focus. |
| `Tab` | Indent (4 spaces) in code blocks; no-op in prose |
| `Shift+Tab` | Outdent |
| `Cmd+Enter` | Save and close editor |
| `Escape` | Cancel and revert to last saved state |
| `Cmd+/` | Toggle line comment (prepend `//` ) |
| `Cmd+Shift+L` | Insert Markdown table template |

## 28.3 Acceptance Criteria {#28.3-acceptance-criteria}

- Plain text is valid (no required markdown syntax).  
- Malformed syntax is rendered literally (no submission block).  
- Editor keyboard shortcuts do not fire when editor is unfocused.  
- No external images, iframes, or scripts execute.  
- CSP headers prevent inline script injection.

---

# 29\. Notifications & Delivery Channels {#29.-notifications-&-delivery-channels}

## 29.1 Notification Event Catalog {#29.1-notification-event-catalog}

### Standard Events

| Event | Trigger | Recipients | Default Delivery |
| :---- | :---- | :---- | :---- |
| `response_received` | Vendor submits response | Workspace evaluators | In-app \+ immediate email |
| `response_ready_for_evaluation` | Response clears Phase 10 gate | Workspace evaluators | In-app \+ immediate email |
| `comment_mention` | @mention in comment | Mentioned user | In-app \+ immediate email |
| `comment_reply` | Reply in threaded comment | Thread participants | In-app \+ immediate email |
| `grade_exception` | Requirement flagged for exception | Workspace admins | In-app \+ daily digest |
| `vendor_invitation` | Invitation sent to vendor | Vendor email | Immediate email only |
| `eoi_submitted` | EOI submitted | Vendor | Immediate email |
| `phase_advanced` | Workspace advances to next phase | All workspace members | In-app \+ email |
| `sla_breach` | SLA timer expires | Tiered (Section 7.5) | In-app \+ immediate email |

### Additional Events

| Event | Trigger | Recipients | Default Delivery |
| :---- | :---- | :---- | :---- |
| `insight_card_generated` | Score divergence detected | All reviewers for requirement | In-app \+ optional email |
| `policy_ingestion_complete` | Policy processing finishes | Initiator \+ workspace admins | In-app \+ daily digest |
| `scenario_saved` | User saves scenario | Saving user only | In-app only |
| `intelligence_brief_available` | Intelligence briefing generated | Users with Intelligence access | In-app \+ configurable email |
| `amendment_published` | Requirement amended post-release | All vendors in evaluation \+ workspace members | In-app \+ immediate email |
| `reverification_required` | Vendor response needs re-verification | Bid Owner | In-app \+ immediate email |
| `reverification_deadline` | Re-verification deadline approaching | Bid Owner | Email at T-3 and T-1 days |
| `nda_signature_requested` | NDA document uploaded for signature | Bid Owner | In-app \+ immediate email |
| `capability_declaration_evidence_needed` | Buyer requests evidence for capability | Seller team | In-app \+ email |
| `kb_entry_stale` | KB entry flagged stale | KB owner \+ Seller team lead | In-app \+ daily digest |
| `document_library_expired` | Document in library expires | Seller team \+ Bid Owner | In-app \+ email at T-30 days |
| `sync_failure_persistent` | Cross-console sync fails for 24 hours | Workspace Owner \+ Bid Owner | Email only |

## 29.2 Delivery Channels {#29.2-delivery-channels}

**In-App Notifications:**

- Toast in bottom-right corner (max 5-second duration, dismissible).  
- Max 3 visible toasts stacked. Older queue below.  
- Each includes action link: "View \[entity\]" or "Dismiss."  
- Unread count badge on bell icon in top bar.

**Email notifications (via Loops.so):**

- Immediate for high-priority events (vendor invitations, SLA breaches, phase advances).  
- Daily digest for medium-priority events (policy ingestion complete, grade exceptions).  
- Weekly digest for low-priority events (capability evidence needed, scenario saved).  
- SPF/DKIM/DMARC aligned. From: `noreply@sourcera.io`.  
- Unsubscribe link in footer (links to preferences, not permanent opt-out).

**Slack notifications (v6.0+):**

- Requires Slack workspace connection via OAuth. Org Owner can enable in Settings.  
- High-priority events sent to configurable Slack channel (default: \#sourcera-alerts).  
- Includes deep link to item in Sourcera.

## 29.3 User Preferences (Gap 29.2) {#29.3-user-preferences-(gap-29.2)}

**Granularity:**

- Per-event-type: Immediate, Daily, Weekly, Never.  
- Per-channel: In-App (toggle), Email (toggle), Slack (toggle).  
- Per-workspace: Notifications mutable per-workspace (e.g., mute workspace "Q4 Budget Review" but receive notifications for "CRM Evaluation").  
- Quiet hours: Start/end time \+ timezone. No notifications during quiet hours (all channels).  
- Do Not Disturb (DND) mode: Opt-in toggle disables all notifications temporarily (1 hour, 4 hours, 8 hours, custom).  
- Entity mute: Mute notifications from specific requirement, vendor, or thread for 24 hours ("I've already seen this, don't remind me").

**Location:** Settings → Notifications → Preferences.

**Defaults for new users:**

- High-priority events (vendor invitation, phase advance): Immediate email \+ in-app.  
- Medium-priority (comment reply, insight card): In-app only (email opt-in).  
- Low-priority (scenario saved): In-app only.  
- Quiet hours: 6pm–9am in user's timezone.

## 29.4 Slack Integration (Gap 29.1) {#29.4-slack-integration-(gap-29.1)}

**Failure handling:**

1. Slack webhook POST fails → Retry immediately (1s).  
2. Retry fails → Wait 2 minutes, retry again.  
3. Second retry fails → Wait 5 minutes, retry once more.  
4. Third retry fails → Fallback: send as email instead. User notified: "Your Slack notification failed to send. We've emailed you instead. Check your Slack connection in Settings."  
5. User receives email: "Your Slack workspace connection may be disconnected. \[Reconnect Slack\]"

**Disconnection detection:**

- When webhook returns 401 (Unauthorized) or 404 (Not Found), Slack connection marked as stale.  
- Next notification triggers: "Slack connection issue detected. \[Re-connect Slack\] or \[Switch to Email Only\]"  
- User can re-authenticate in Settings → Integrations → Slack.

## 29.5 Webhook Notifications {#29.5-webhook-notifications}

Webhook events are delivered to registered endpoint URLs for Enterprise customers and integrations.

**Payload format:** JSON. HTTP POST. HMAC-SHA256 signed with org webhook secret.

**Standard payload metadata:** `event_type`, `timestamp` (UTC), `workspace_id`, `organization_id`, `delivery_id`.

**Webhook events:** All events from Section 29.1 are available as webhook subscriptions. Payload schema matches entity definitions in Section 3.2.

**Retry:** Up to 5 attempts over 24 hours with exponential backoff (1s, 2s, 4s, 8s, 16s). See Appendix F for webhook retry policy.

## 29.6 Acceptance Criteria {#29.6-acceptance-criteria}

- Notifications delivered within 30 seconds of triggering event.  
- Email not sent if user already read the in-app notification for the same event.  
- Preference changes take effect immediately.  
- Webhook signatures are verified by all integration SDKs.  
- Slack integration fallback to email on failure.  
- Quiet hours prevent notifications outside specified window.

---

# 30\. Search & Command Palette {#30.-search-&-command-palette}

## 30.1 Architecture {#30.1-architecture}

**Invocation:** `Cmd+K` (macOS) / `Ctrl+K` (Windows/Linux). Global — available in all views.

**Dismiss:** `Escape`.

**Search:** Fuzzy-search input (200ms debounce, no minimum character requirement). Case-insensitive. Handles partial matches and typos (Levenshtein distance ≤2).

**Results:** Grouped by category: Navigation, Actions, Search, Filters. Each shows keyboard shortcut if available.

**MRU (Most Recently Used):** Last 10 executed commands shown at top before filtering.

## 30.2 Command Registry {#30.2-command-registry}

### Navigation Commands (All Consoles)

| Command | Route | Context |
| :---- | :---- | :---- |
| `go [workspace name]` | `/workspace/[id]` | Global (Buyer Console) |
| `go requirements` / `matrix` | `/workspace/[id]/matrix` | Workspace, Phase 1+ |
| `go responses` | `/workspace/[id]/responses` | Workspace, Phase 6+ |
| `go scoring` | `/workspace/[id]/scoring` | Workspace, Phase 10+ |
| `go selection` | `/workspace/[id]/selection` | Workspace, Phase 12+ |
| `go vendor [name]` | `/workspace/[id]/vendor/[id]` | Workspace, any phase |
| `go intelligence` | `/org/intelligence` | Buyer Console, Phase 10+ |
| `go tco` | `/workspace/[id]/tco` | Workspace (if TCO Use Case exists) |
| `go marketplace` | `/marketplace` | Global |
| `go bid [workspace]` | `/bid/[id]` | Seller Console |
| `go kb` | `/seller/kb` | Seller Console |
| `go capabilities` | `/seller/capabilities` | Seller Console |

### Action Commands

| Command | Action | Context |
| :---- | :---- | :---- |
| `create requirement` | New requirement in current Use Case | Workspace, Phase 1 |
| `create use case` | New Use Case in workspace | Workspace, Phase 1 |
| `create workspace` | New workspace | Global (Buyer Console) |
| `invite [email]` | Invite user to workspace | Workspace |
| `ingest` | Open Policy Ingestion upload | Workspace, Phase 1–5 |
| `ingest [framework]` | Open Policy Ingestion with framework hint | Workspace, Phase 1–5 |
| `publish [scenario]` | Publish saved scenario to report | Phase 11–12 |

### Scoring Commands (Buyer Console)

| Command | Action | Context |
| :---- | :---- | :---- |
| `score [vendor name]` | Navigate to vendor's scoring view | Phase 10 |
| `unscored` | Filter to unscored pairs (requirement × vendor) | Phase 10 |
| `disagreements` | Filter to divergent scores (divergence \> 0.3) | Phase 10 |
| `clear scores` | Clear all scores (confirmation required) | Phase 10 |

### Scenario Commands

| Command | Action | Context |
| :---- | :---- | :---- |
| `simulate` | Enter Simulation Mode (overlay mode for scenarios) | Phase 10+ |
| `scenario: [name]` | Load saved scenario | Phase 10+ |
| `compare scenarios` | Open comparison view | Phase 10+ |
| `new scenario` | Create new scenario | Phase 10+ |

### Seller Commands (Seller Console)

| Command | Action | Context |
| :---- | :---- | :---- |
| `respond [requirement]` | Jump to requirement in Bid Workspace | Seller Console, Phase 6+ |
| `capabilities` | Open Capability Declarations editor | Seller Console |
| `kb edit [entry]` | Open KB entry for edit | Seller Console |
| `filter: [capability]` | Add capability filter in Marketplace | Marketplace |
| `vendor history: [name]` | Search vendor's historical evaluations | Buyer Console Intelligence |

### Utility Commands

| Command | Action |
| :---- | :---- |
| `settings` | Open settings (workspace or org, context-dependent) |
| `help` or `?` | Keyboard shortcut reference |
| `sign out` | Sign out (confirmation required) |
| `feedback` | Open feedback form |

## 30.3 Entity Search {#30.3-entity-search}

| Search Type | Syntax | Result |
| :---- | :---- | :---- |
| Requirement by title | `req: [title]` or `[title]` (in matrix context) | Navigate to requirement detail |
| Vendor by name | `vendor: [name]` or `[name]` (in responses context) | Navigate to vendor profile |
| Use Case by name | `use case: [name]` | Navigate to Use Case |
| Requirement by ID | `SRC-123` | Navigate directly to requirement |
| Workspace by name | `workspace: [name]` or shorthand `[name]` | Navigate to workspace |

## 30.4 Full-Text Search {#30.4-full-text-search}

`Cmd+Shift+K` / `Ctrl+Shift+K` opens dedicated full-text search modal. Searches:

**Buyer Console:**

- Requirement titles, descriptions, comments  
- Response text and evidence file metadata  
- Use Case briefs  
- Comment threads  
- Score rationales

**Seller Console:**

- KB entry titles, descriptions, body text  
- Response text, Q\&A threads  
- Capability Declaration titles and text  
- Document Library document names

**Marketplace:**

- Vendor names, company descriptions  
- Capability Declaration names and text  
- Industry tags

**Results:** Capped at 50 per search. Sortable by: recency, relevance, entity type.

**Index scope (Gap 30.1):** KB entries are indexed separately in the Seller Console only. Buyer Console search does NOT include KB entries (console isolation enforced). Vendor responses that cite KB entries are visible in Buyer responses search, but the KB entries themselves are not directly searchable by buyers.

## 30.5 Context-Aware Filtering {#30.5-context-aware-filtering}

Commands are context-filtered based on:

- Active console (Buyer vs. Seller)  
- Current pipeline phase (Phase 10+ only for scoring commands)  
- User role (Org Owner sees admin commands, Reviewer does not)  
- Available features (e.g., `go tco` hidden if no TCO Use Case exists)  
- Workspace state (commands disabled in Phase 13 Closed unless read-only)

## 30.6 Keyboard Accessibility {#30.6-keyboard-accessibility}

- **Tab navigation:** Tab moves focus through result items. Shift+Tab moves backward.  
- **Enter:** Select highlighted result.  
- **Arrow keys:** Up/down navigate results.  
- **Escape:** Close palette, return focus to previous element.  
- **ARIA labels:** Palette labeled "Command Palette" with `role="dialog"`. Results list labeled "Commands" with `role="listbox"`.

## 30.7 Acceptance Criteria {#30.7-acceptance-criteria}

- Command Palette opens in \<50ms.  
- Fuzzy search handles partial matches and typos (Levenshtein ≤2).  
- Context-aware filtering prevents navigation to unavailable views (e.g., `go scoring` disabled in Phase \<10).  
- Full-text search returns results within 200ms.  
- KB entries not searchable from Buyer Console search (console isolation enforced).  
- MRU shows last 10 executed commands.  
- Keyboard navigation (Tab, Arrow, Enter) works correctly.

---

---

# 31\. Integrations & Webhooks {#31.-integrations-&-webhooks}

## 31.1 Webhook Event Types & Idempotency {#31.1-webhook-event-types-&-idempotency}

All events from Section 29.1 are available as webhook subscriptions. Each webhook delivery includes a unique `event_id` that persists across retries. Webhook consumers **must** implement idempotency by deduplicating based on `event_id`. Duplicate deliveries (same `event_id`) must produce no additional side effects.

**Event ID Format:** `evt_{timestamp}_{random}` (e.g., `evt_1712761200_abc123`). Immutable per event.

## 31.2 Webhook Payload Structure {#31.2-webhook-payload-structure}

{

  "event\_id": "evt\_1712761200\_abc123",

  "event\_type": "response\_received",

  "delivery\_id": "del\_xyz789",

  "timestamp": "2026-04-10T14:30:00Z",

  "organization\_id": "org\_abc",

  "workspace\_id": "ws\_def",

  "data": { ... }

}

Signed with HMAC-SHA256 using org webhook secret. Signature included in `X-Sourcera-Signature` header.

## 31.3 Integration Phase Export Mapping {#31.3-integration-phase-export-mapping}

At Phase 13 (Closed), Workspace Owners may export winning vendor action items and requirements to integrated tools. Export mappings:

| Sourcera Entity | Target System | Mapping |
| :---- | :---- | :---- |
| Use Case | Jira Epic / Linear Project | title, description, labels |
| Requirement | Jira Issue / Linear Issue | title, description, priority (via weight), custom fields (status, response\_type) |
| Winning Vendor Response | Issue Description / Comment | vendor\_name, response\_text, confidence\_score |
| TCO Data | Spreadsheet Link | projected\_cost, cost\_per\_point, cost\_rank |

**Scope:** Only requirements marked "won" and the selected vendor's responses are exported. Internal scores, comments, and non-winning vendors are excluded.

**Supported Integrations:**

- Jira Cloud  
- Linear  
- Asana  
- Azure DevOps

Setup via Settings → Integrations → Configure Export Mapping.

## 31.4 Partner Integrations {#31.4-partner-integrations}

- **Salesforce:** Bidirectional vendor account sync. New vendors from Marketplace EOIs auto-create Salesforce Accounts.  
- **Slack / Microsoft Teams:** Channel-scoped notifications per workspace. Admin sets channel and notification types.  
- **Zapier / Make:** No native integration; use Webhook API (Section 32\) for custom automation.

Setup: Settings → Integrations → Partner Tools. Self-service configuration with OAuth flows.

## 31.5 Webhook Configuration & Limits {#31.5-webhook-configuration-&-limits}

| Plan | Webhook Endpoints | Retry Attempts | Payload Size Limit |
| :---- | :---- | :---- | :---- |
| Free | 1 | 5 | 256 KB |
| Business | 5 | 5 | 256 KB |
| Enterprise | 25 | 5 | 256 KB |

## 31.6 Webhook Consumer Requirements {#31.6-webhook-consumer-requirements}

**Success Criteria:** HTTP 2xx response within 10 seconds.

**Failure Handling:** Any other response (3xx, 4xx, 5xx, timeout) triggers retry per Appendix F schedule.

**Idempotency Contract:** Consumer must handle duplicate `event_id` values gracefully (log warning, return success without re-processing).

**HMAC Verification:** Consumer must verify signature before processing:

signature \= HMAC-SHA256(webhook\_secret, raw\_request\_body)

X-Sourcera-Signature \= "sha256=" \+ hex(signature)

**Dead Letter Queue:** After 5 failed deliveries, webhook marked `failed`. Admin receives email notification. Failed webhooks available for manual retry from Settings → Integrations → Failed Webhooks (30-day retention).

## 31.7 Acceptance Criteria {#31.7-acceptance-criteria}

- Every webhook delivery includes unique, immutable `event_id`.  
- Webhook retry schedule follows Appendix F exactly.  
- Signature verification required; unsigned payloads rejected.  
- Failed webhook notifications sent within 1 hour of final failure.  
- Webhook payload size enforced at API gateway level (256 KB hard limit).  
- Duplicate deliveries (same `event_id`) do not cause duplicate mutations in consumer system (idempotency requirement documented).

---

# 32\. The Sourcera API {#32.-the-sourcera-api}

## 32.1 Overview {#32.1-overview}

REST API. Current version: `v1`. Base URL: `https://api.sourcera.io/v1`.

All responses are JSON. All timestamps are ISO 8601 UTC.

## 32.2 Authentication & Rate Limit Headers {#32.2-authentication-&-rate-limit-headers}

Authorization: `Bearer srck_{org_prefix}_{token_string}`

Token permissions: Fine-grained scopes (e.g., `read:requirements`, `write:responses`, `read:scores`).

**Rate limit headers returned on all responses:**

X-RateLimit-Limit: 5000

X-RateLimit-Remaining: 4999

X-RateLimit-Reset: 1712765400

X-RateLimit-RetryAfter: 60

**Definitions:**

- `X-RateLimit-Limit`: Burst limit (requests per hour)  
- `X-RateLimit-Remaining`: Requests remaining in current hour  
- `X-RateLimit-Reset`: Unix timestamp when limit resets  
- `X-RateLimit-RetryAfter`: Seconds to wait before retry (429 responses only)

## 32.3 Pagination Model {#32.3-pagination-model}

All list endpoints use cursor-based pagination (not offset).

**Request:**

GET /v1/workspaces?cursor=abc123\&limit=50

**Response:**

{

  "data": \[ ... \],

  "pagination": {

    "has\_more": false,

    "next\_cursor": "def456",

    "limit": 50

  }

}

**Cursor Behavior:** Opaque token. Encode the next set of results. Safe for clients to store and share. Cursors invalidate after 24 hours; clients must restart pagination if cursor expires.

**Default & Max Page Size:** Default 50, max 250\.

## 32.4 Rate Limit Enforcement {#32.4-rate-limit-enforcement}

**Per-Organization Burst Limits (all plans):**

- Soft limit: 5,000 requests/hour. Warning response with `X-RateLimit-Remaining=0`, request succeeds.  
- Hard limit: 10,000 requests/hour. 429 Too Many Requests response.  
- Burst: 100 requests/minute (cannot exceed).

**Per-Plan Monthly Quotas:**

| Plan | Monthly API Calls | Monthly Policy Ingestion API Calls |
| :---- | :---- | :---- |
| Free | 1,000 | Included (Free tier cannot call Policy Ingestion API) |
| Business | 10,000 | 3,000 (quota for policy ingestion calls) |
| Enterprise | Unlimited | Unlimited |

Both limits enforced simultaneously. 429 returned when either burst or monthly quota exceeded.

**Per-User Concurrency:** Max 10 concurrent requests per user. 11th request queued. Queue timeout: 60 seconds.

**Rate Limit Enforcement Scope:** Per-organization (not per-API-key, not per-user). All API keys under the same organization share the same quota.

## 32.5 Endpoints {#32.5-endpoints}

### Workspaces

GET    /v1/workspaces

POST   /v1/workspaces

GET    /v1/workspaces/{workspace\_id}

PATCH  /v1/workspaces/{workspace\_id}

DELETE /v1/workspaces/{workspace\_id}

POST   /v1/workspaces/{workspace\_id}/advance

### Requirements

GET    /v1/workspaces/{workspace\_id}/requirements

POST   /v1/workspaces/{workspace\_id}/requirements

GET    /v1/workspaces/{workspace\_id}/requirements/{requirement\_id}

PATCH  /v1/workspaces/{workspace\_id}/requirements/{requirement\_id}

DELETE /v1/workspaces/{workspace\_id}/requirements/{requirement\_id}

### Responses

GET    /v1/workspaces/{workspace\_id}/responses

POST   /v1/workspaces/{workspace\_id}/responses

GET    /v1/workspaces/{workspace\_id}/responses/{response\_id}

PATCH  /v1/workspaces/{workspace\_id}/responses/{response\_id}

### Scores

GET    /v1/workspaces/{workspace\_id}/scores

POST   /v1/workspaces/{workspace\_id}/scores

GET    /v1/workspaces/{workspace\_id}/scores/{score\_id}

PATCH  /v1/workspaces/{workspace\_id}/scores/{score\_id}

### Vendors / Target Accounts

GET    /v1/workspaces/{workspace\_id}/vendors

POST   /v1/workspaces/{workspace\_id}/vendors

GET    /v1/workspaces/{workspace\_id}/vendors/{target\_account\_id}

PATCH  /v1/workspaces/{workspace\_id}/vendors/{target\_account\_id}

### Scenarios

GET    /v1/workspaces/{workspace\_id}/scenarios

POST   /v1/workspaces/{workspace\_id}/scenarios

GET    /v1/workspaces/{workspace\_id}/scenarios/{scenario\_id}

PATCH  /v1/workspaces/{workspace\_id}/scenarios/{scenario\_id}

DELETE /v1/workspaces/{workspace\_id}/scenarios/{scenario\_id}

### Selection Reports

GET    /v1/workspaces/{workspace\_id}/reports

POST   /v1/workspaces/{workspace\_id}/reports

GET    /v1/workspaces/{workspace\_id}/reports/{report\_id}

### Traceability Matrices

GET    /v1/workspaces/{workspace\_id}/traceability-matrices

GET    /v1/workspaces/{workspace\_id}/traceability-matrices/{matrix\_id}

### Intelligence

GET    /v1/intelligence/cache

GET    /v1/intelligence/briefings

GET    /v1/intelligence/briefings/{briefing\_id}

### Capability Declarations

GET    /v1/vendors/{vendor\_org\_id}/capabilities

POST   /v1/vendors/{vendor\_org\_id}/capabilities

PATCH  /v1/vendors/{vendor\_org\_id}/capabilities/{capability\_id}

DELETE /v1/vendors/{vendor\_org\_id}/capabilities/{capability\_id}

### Internal Comments

GET    /v1/workspaces/{workspace\_id}/comments

POST   /v1/workspaces/{workspace\_id}/comments

PATCH  /v1/workspaces/{workspace\_id}/comments/{comment\_id}

DELETE /v1/workspaces/{workspace\_id}/comments/{comment\_id}

### Audit Events

GET    /v1/audit-events

GET    /v1/audit-events/{event\_id}

### Users & Organization

GET    /v1/users/me

GET    /v1/organizations/me

GET    /v1/organizations/me/members

## 32.6 Error Handling {#32.6-error-handling}

All errors return standard schema:

{

  "error": {

    "code": "gate\_validation\_failed",

    "message": "Cannot advance to Phase 2: 3 requirements are still in draft status.",

    "details": {

      "failing\_rules": \["all\_requirements\_active"\],

      "blocking\_requirement\_ids": \["req\_abc", "req\_def"\]

    },

    "request\_id": "req\_789xyz"

  }

}

Complete error code catalog in Appendix I.

## 32.7 Acceptance Criteria {#32.7-acceptance-criteria}

- All endpoints documented with curl examples in API reference.  
- Pagination cursor-based, consistent across all list endpoints.  
- Rate limit headers present on every response.  
- 429 returned when limits exceeded; includes `X-RateLimit-RetryAfter`.  
- API test coverage ≥ 95%.  
- Rate limits enforced per Appendix I error codes.

---

# 33\. Enterprise Security & Compliance {#33.-enterprise-security-&-compliance}

## 33.1 Data Security {#33.1-data-security}

- **At Rest:** AES-256 encryption. Managed by Convex platform (AWS KMS backing).  
- **In Transit:** TLS 1.3 for all API endpoints and WebSocket subscriptions.  
- **Key Management:** Convex-managed. Customer-managed encryption keys on Phase 2 roadmap.  
- **Field-Level PII Encryption:** Enterprise Phase 2 roadmap.

## 33.2 Multi-Factor Authentication (MFA) {#33.2-multi-factor-authentication-(mfa)}

MFA availability is plan-tier dependent. Supported methods: TOTP and WebAuthn only (no SMS).

| Plan | Availability | Enforcement |
| :---- | :---- | :---- |
| Free | Not available | N/A |
| Business | Optional, user-controlled enrollment | Organization Admin cannot require MFA |
| Enterprise | Optional enrollment; Org Admin can require for all users | Org Admin may enforce MFA requirement |

**Free Tier Restriction:** Schema field exists but enrollment endpoint returns HTTP 403 with error code `plan_upgrade_required`.

**Enterprise Enforcement:** When `mfa_enforcement_required` flag is true, users without MFA are prompted to enroll on next login and cannot access Sourcera until enrolled.

## 33.3 Access Control {#33.3-access-control}

See Section 4 for full RBAC model.

- Workspace isolation: Workspaces are data silos. No cross-workspace data leakage.  
- Console isolation: Enforced at database query level.  
- Audit logging: All mutations logged (Section 5.6).

## 33.4 Data Subject Access Request (DSAR) {#33.4-data-subject-access-request-(dsar)}

**GDPR Compliance:** 30-day response window.

**DSAR Response Includes:**

- User account profile (name, email, organization memberships, roles)  
- All audit log entries authored by or attributed to the user  
- All comments, mentions, and discussions authored by the user  
- All scores submitted by the user  
- Requirement text and Use Case descriptions authored by the user  
- KB entries authored by the user (Seller Console)

**Export Format:** JSON with human-readable folder structure. All PII preserved (GDPR compliance).

**Anonymization Option:** Enterprise customers may request anonymized export (user identifiers redacted, but all relationships preserved). Supports audit trail preservation.

## 33.5 Compliance Frameworks {#33.5-compliance-frameworks}

| Framework | Status | Availability |
| :---- | :---- | :---- |
| **SOC 2 Type II** | Targeted within 12 months of launch | Audit report available to Enterprise under NDA |
| **ISO 27001** | Planned | Enterprise |
| **HIPAA** | BAA available | Enterprise (healthcare customers) |
| **GDPR** | DPA available | All plans. Sourcera is Data Processor |

## 33.6 Security Controls {#33.6-security-controls}

- **Login throttling:** Exponential backoff after 5 failed attempts (WorkOS-managed).  
- **API token rotation:** Recommended 90 days. Enforced for Enterprise (token expires after 90 days).  
- **IP allowlisting:** Enterprise only. Configured per Organization in Settings → Security.  
- **OWASP Top 10:** Strict Markdown sanitization (no raw HTML, no external images, no script execution), CSP headers, tenant-scoped queries, rate-limited auth.  
- **SBOM:** Available to Enterprise on request.

## 33.7 Incident Response {#33.7-incident-response}

- Security incidents reported to affected customers within 24 hours.  
- Breach notification per GDPR Article 33, CCPA, state laws.  
- Postmortem: RCA within 48 hours.

## 33.8 Security Observability {#33.8-security-observability}

- Datadog for infrastructure security monitoring.  
- Sentry for application error tracking.  
- OpenTelemetry for distributed tracing.  
- **SIEM Integration:** Enterprise customers can configure log forwarding to their SIEM (Splunk, Sumo Logic, etc.) via Datadog log export. Configuration in Settings → Integrations → Security.

## 33.9 Acceptance Criteria {#33.9-acceptance-criteria}

- All API endpoints enforce authentication.  
- Workspace data never shared across organizations.  
- Audit logs retained per plan tier (Section 5.6).  
- Annual penetration testing by independent security firm.  
- DSAR responses generated within 30 days.  
- MFA enforcement checked on every login for Enterprise orgs with flag enabled.

---

# 34\. Plan Tiers, Billing & Entitlements {#34.-plan-tiers,-billing-&-entitlements}

## 34.1 Plan Tier Definitions (Authoritative) {#34.1-plan-tier-definitions-(authoritative)}

This is the single authoritative plan tier table. All other sections reference these tables. Pricing is split across two parallel tracks — Buyer and Seller — that share one AI budget mechanic at the Organization level (see §34.11). Full narrative context lives in `Sourcera_Buyer_Pricing_Strategy.md` and `Sourcera_Seller_Pricing_Strategy.md`.

### 34.1.1 Buyer Plan Tiers

| Feature | Free | Business Starter | Business Growth | Business Scale | Enterprise |
| :---- | :---- | :---- | :---- | :---- | :---- |
| **Core Evaluation Pipeline** | Phases 1–13 | Phases 1–13 | Phases 1–13 | Phases 1–13 | Phases 1–13 |
| **Seats** | Unlimited | Unlimited | Unlimited | Unlimited | Unlimited |
| **AI Budget (value-dollars/month)** | $5 | $50 | $300 | $800 | Committed |
| **Active Evaluations (concurrent)** | 1 | 5 | 20 | Unlimited | Unlimited |
| **Vendors tracked** | 25 | 250 | 2,500 | Unlimited | Unlimited |
| **Use Cases per Workspace** | 3 | 50 | Unlimited | Unlimited | Unlimited |
| **Requirements per Workspace** | 200 | 2,000 | 10,000 | Unlimited | Unlimited |
| **Collaborative Scoring** | Yes | Yes | Yes | Yes | Yes |
| **Policy Ingestion** | Budget-metered, Opus-gated | Budget-metered | Budget-metered | Budget-metered | Committed |
| **Scenario Modeling** | Budget-metered | Budget-metered | Budget-metered | Budget-metered | Committed |
| **TCO Modeling** | Included | Included | Included | Included | Included |
| **Organizational Intelligence** | — | Vendor History | Full | Full | Full + Suggestions |
| **Marketplace Buyer Access** | Browse only | Search + capability filter | Full + match scoring | Full + match scoring | Full + batch match API |
| **API Add-On** | — | $99/mo | $99/mo | $99/mo | Included |
| **API Keys** | 1 | 5 | 25 | 50 | 100 |
| **Webhook Endpoints** | 1 | 5 | 25 | 50 | 100 |
| **Custom Integrations** | — | — | — | — | Scoped per contract |
| **Vendor Pro Trial Seats (M17)** | — | — | — | 5/mo | 15/mo |
| **KB Entries** | 50 | 1,000 | 10,000 | Unlimited | Unlimited |
| **KB Document Library** | 50 docs | 500 docs | 5,000 docs | Unlimited | Unlimited |
| **Audit Logs** | 30 days | 1 year | 1 year | 3 years | 7 years |
| **MFA** | Not available | Optional | Optional | Optional | Optional with enforcement |
| **SAML SSO** | — | — | — | — | Yes |
| **SCIM Provisioning** | — | — | — | — | Yes |
| **IP Restrictions / Residency** | — | — | — | — | Yes |
| **Custom Branding** | — | — | — | — | Yes |
| **Export Formats** | CSV, PDF | CSV, PDF, Excel | CSV, PDF, Excel | CSV, PDF, Excel | CSV, PDF, Excel + custom |
| **Vendor File Retention** | 12 months | 12 months | 12 months | 24 months | 36 months |
| **SLA** | None | 99.5% uptime | 99.5% uptime | 99.5% uptime | 99.9% uptime + 4-hour response |
| **Support** | Community | Email (24h) | Email + chat | Priority | Priority + dedicated CSM |
| **Storage** | 1 GB | 25 GB | 250 GB | 2 TB | Custom |
| **Default User Role** | Member (fixed) | Configurable | Configurable | Configurable | Configurable |

### 34.1.2 Seller Plan Tiers

| Feature | Free | Seller Starter | Seller Growth | Seller Scale | Seller Enterprise |
| :---- | :---- | :---- | :---- | :---- | :---- |
| **Bid Workspace Access** | Full | Full | Full | Full | Full |
| **Seats** | Unlimited | Unlimited | Unlimited | Unlimited | Unlimited |
| **AI Budget (value-dollars/month)** | $5 | $30 | $200 | $600 | Committed |
| **Invited Bids (concurrent)** | 1 | 3 | 15 | Unlimited | Unlimited |
| **Proactive Marketplace EOIs** | 0 | 10/month | Unlimited | Unlimited | Unlimited |
| **KB Entries** | 50 | 1,000 | 10,000 | Unlimited | Unlimited |
| **Firecrawl Sources** | 0 | 2 (weekly) | 10 (daily) | Unlimited (real-time) | Unlimited |
| **KB Bootstrap** | 1 lifetime | 1/year | 3/year | Unlimited | Unlimited |
| **First-Pass RFP Generator** | Budget-metered | Budget-metered | Budget-metered | Budget-metered | Committed |
| **SellerSoftware Entities** | 1 | 5 | 25 | Unlimited | Unlimited |
| **Capability Declarations** | 3 | 25 | 250 | Unlimited | Unlimited |
| **Verification Tier Cap** | Basic | Verified | Certified | Certified | Certified |
| **Published Seller Profile** | Yes | Yes | Yes | Yes | Yes |
| **Seller Page Enrichment (Opus)** | — | 1/year | 3/year | 12/year | Unlimited |
| **Match Scoring (numeric)** | Labels only | Labels only | Included | Included | Included |
| **Seller Signals** | — | Monthly digest | Weekly digest | Weekly + real-time | Real-time + API |
| **CRM Sync** | — | — | Included | Included | Included |
| **Promoted Placements** | — | — | — | 1/month | 3/month |
| **SAML SSO / SCIM** | — | — | — | — | Yes |
| **IP Restrictions / Residency** | — | — | — | — | Yes |
| **API Access** | — | — | — | Read-only | Full |
| **Audit Logs** | 30 days | 1 year | 1 year | 3 years | 7 years |
| **SLA** | None | 99.5% uptime | 99.5% uptime | 99.5% uptime | 99.9% uptime + 4-hour response |
| **Support** | Community | Email (24h) | Email + chat | Priority | Priority + dedicated CSM |

## 34.2 Pricing {#34.2-pricing}

### 34.2.1 Buyer Pricing

| Plan | Annual (per month) | Monthly (per month) |
| :---- | :---- | :---- |
| Free | $0 | $0 |
| Business Starter | $299 | $349 |
| Business Growth | $799 | $949 |
| Business Scale | $1,999 | $2,399 |
| Enterprise | Custom, $3,000/month floor | — |

### 34.2.2 Seller Pricing

| Plan | Annual (per month) | Monthly (per month) |
| :---- | :---- | :---- |
| Free | $0 | $0 |
| Seller Starter | $149 | $179 |
| Seller Growth | $499 | $599 |
| Seller Scale | $1,499 | $1,799 |
| Seller Enterprise | Custom, $3,000/month floor | — |

### 34.2.3 Universal Commercial Rules

- **14-day free trial** of Business Starter for buyers; Seller Free has no trial because it *is* the on-ramp.
- **Per-organization billing.** Unlimited seats on every paid tier. Seat count is never a billing dimension.
- **Vendor response to an invited evaluation is always free.** Published Seller Profile is free from day one.
- **Buyer Scale and Enterprise include Vendor Pro Trial Seats (M17) — see §34.13.**
- **Enterprise contracts (both sides) are annual.** $12,000/year minimum committed AI value spend. Volume discounts on overage: 10% at $25K, 15% at $50K, 20% at $100K, 25% at $250K+ committed.

## 34.3 Outcome-Based AI Operation Pricing (Overage Rate Card) {#34.3-outcome-based-ai-operation-pricing-(overage-rate-card)}

All AI Operations are priced on an outcome basis. Each operation resolves as `accepted` or `rejected` per the Outcome Resolver (§34.11). Accepted operations bill at `value_price = cost_base × 10`; rejected operations bill at `cost_price = cost_base × 1.05`. Rate card is cost-adaptive — `cost_base` is recalculated nightly from actual Anthropic billing + Convex compute. Customers see stable value-dollars. The full per-capability rate card is published at `api.sourcera.com/v1/pricing` and kept in sync with `KB_Engineering_Spec.md §13.2` `ai_operation_pricing` table.

**Summary rate card (illustrative — live rates in public pricing API):**

| Capability | Model | Accepted (value) | Rejected (cost) | Unit |
| :---- | :---- | :---- | :---- | :---- |
| Pre-Scoring | Sonnet | $0.50 | $0.06 | 1 requirement |
| Requirement Extraction | Sonnet | $0.40 | $0.05 | 1 requirement |
| KB Suggestion | Haiku | $0.03 | $0.004 | 1 suggestion |
| Policy Parsing | Opus | $25.00 | $3.50 | 1 document |
| Deep Comparison | Opus | $12.00 | $1.60 | 1 comparison |
| First-Pass RFP Draft | Sonnet | $0.15 | $0.02 | 1 requirement |
| KB Bootstrap | Opus | $200.00 | $26.00 | 1 bootstrap |
| Ghost-RFP Ingestion | Opus | $25.00 | $3.30 | 1 RFP |
| Seller Page Enrichment | Opus | $8.00 | $1.10 | 1 page |
| Match Score (numeric) | Sonnet | $0.40 | $0.05 | 1 opportunity |
| (full 30+ capability catalog in public API and §21.4) | | | | |

**How pricing surfaces to customers:**
- **Included budget.** Each plan includes a monthly AI budget in value-dollars (§34.1). Operations draw from the budget at outcome-accounted rates. Customer sees a single number ("AI budget used this month") — per-op rates are not shown.
- **Wallet overage.** Optional, off by default. When enabled, operations beyond the included budget draw from the wallet at the same outcome-accounted rates. Per-op rate card surfaces here — see §34.10.
- **Committed spend (Enterprise).** Operations draw from committed annual value-dollars; volume discount applied at tier thresholds above.

## 34.4 No Per-Unit Metering on Structural Resources {#34.4-no-per-unit-metering-on-structural-resources}

Storage, workspaces, requirements, use cases, vendors, KB entries, teams, seats, and other structural resources are **never priced per unit**. They are tier ceilings only (§34.1). This is a deliberate pricing decision — per-unit metering on structural resources discourages the usage Sourcera needs.

## 34.5 Plan Upgrade / Downgrade {#34.5-plan-upgrade-/-downgrade}

**Upgrade:** Effective immediately. Prorated charges for remainder of billing cycle. KB, in-flight bids/evaluations, Capability Declarations, Firecrawl source configs, and all user state carry forward without re-setup. Upgrade CTAs must explicitly state carry-over ("Your N KB entries and M in-flight evaluations carry over automatically.").

**Downgrade:** Effective at next billing cycle. If current usage exceeds new plan limits, customer is warned 14 days before downgrade with specific overages listed and must confirm understanding. KB entries are never deleted on downgrade; they are preserved in read-only state per §34.6.

## 34.6 Downgrade Excess Data Handling {#34.6-downgrade-excess-data-handling}

If downgrade results in overages, customer enters a **90-day read-only preservation** state.

**Customer actions (90-day window):**
- Select which entities to keep (within new limits)
- Archive selected entities to free quota (soft-deleted, recoverable within the 90-day grace)
- Export full data at any time in all supported formats

**After 90 days:**
- If the customer has not resolved overages, oldest entities auto-archived (by creation date, oldest first)
- Archived entities remain in system for an additional 90 days; then permanent purge
- Customer notified of each auto-archival action

**Entities subject to downgrade enforcement:** Workspaces (active), Bid Workspaces (active), Requirements per Workspace, KB Entries, API Keys, Webhook Endpoints, Firecrawl sources, Storage (GB), Capability Declarations, SellerSoftware entities.

**Never subject to downgrade enforcement:** Seats (always unlimited), published Seller Profile (always preserved), audit log entries, billing history.

## 34.7 Billing Seat Count {#34.7-billing-seat-count}

Seats are **never a billing dimension** in the v2 model. Every paid tier includes unlimited seats. This section is retained only to document that:

- Deprovisioned users (via SCIM) remain in audit trail with ownership reassigned.
- Deleted users trigger complete data purge, including owned entities.
- Seat count is surfaced in admin dashboards for governance purposes but has no price effect.

## 34.8 Entitlement Enforcement {#34.8-entitlement-enforcement}

Feature gating is checked on every API call and UI action. Entitlement check is O(1) — plan tier and AI wallet balance are included in session metadata.

```
const wallet = await ctx.db.walletState(orgId); // cached, session-metadata level
const entitlement = PLAN_ENTITLEMENTS[org.buyer_plan_tier]; // buyer console
const sellerEntitlement = PLAN_ENTITLEMENTS[org.seller_plan_tier]; // seller console

if (!entitlement.canCreateEvaluation && activeEvalCount >= entitlement.maxActive) {
  throw new ConvexError({ code: "evaluation_limit_exceeded", upgrade_cta: "business_starter" });
}

if (!wallet.canAfford(estimatedCost) && !wallet.overageEnabled) {
  throw new ConvexError({ code: "ai_budget_exceeded", upgrade_cta: walletUpgradePath(org) });
}
```

Entitlements are evaluated independently per console. Cross-console plan state does not leak (Dual-Console Firewall applies to entitlement checks as to data).

## 34.9 Onboarding and Trial Carry-Over {#34.9-onboarding-and-trial-carry-over}

- **Buyer free trial:** 14-day Business Starter trial on signup. No credit card required. Trial auto-downgrades to Buyer Free on day 15 if not converted; all data preserved per §34.6.
- **Seller onboarding:** No trial. Seller Free is the on-ramp (see §35.2). Vendor Pro Trial Seats (M17, §34.13) provide a separate 30-day Seller Starter grant issued by the inviting buyer.

## 34.10 AI Wallet Service {#34.10-ai-wallet-service}

The AI Wallet is an Organization-scoped service that holds three counters and enforces spend caps for AI Operations.

### 34.10.1 Wallet Counters

| Counter | Purpose |
| :---- | :---- |
| `included_budget_remaining` | Plan-included value-dollars remaining in the current billing period |
| `overage_balance` | Wallet funds deposited by the customer, drawn only after included budget is exhausted |
| `committed_remaining` | Enterprise-only: annual committed value-dollars remaining in the contract year |

All counters denominated in **value-dollars**, not tokens. The Outcome Resolver writes operations against the appropriate counter in priority order: `included_budget_remaining` first, then `overage_balance`, then `committed_remaining` (Enterprise).

### 34.10.2 Wallet Configuration

- **Wallet overage is off by default** on every plan. An admin with the `billing_admin` role must explicitly enable it and set a monthly cap.
- **Caps:** daily, weekly, and monthly caps supported independently. Hard caps block operations; soft caps (80%) email the Billing Admin and Org Owner.
- **Auto-topup:** available but never enabled by default. Configured with a minimum-balance trigger and a topup amount.
- **Spend notifications:** fire at 50%, 80%, 100% of included budget and independently at 80% and 100% of any enabled cap.

### 34.10.3 Pooled Budget Across Consoles

Wallet balances are **Organization-scoped** and pooled across Buyer and Seller consoles. An Org that holds Buyer Growth ($300 budget) and Seller Starter ($30 budget) has $330 of unified AI budget spendable by any capability in either console. This is a deliberate design to reward cross-side Org activation.

### 34.10.4 Stripe Metering

Wallet events are reported to Stripe daily (granularity: per-calendar-day). Stripe meter events: `sourcera_ai_value_accepted`, `sourcera_ai_value_rejected`, `sourcera_ai_wallet_topup`. Metered charges appear on the next invoice. Pro Trial Seat grants are tracked with `sourcera_pro_trial_grant` and `sourcera_pro_trial_conversion` events (zero-cost but audited).

### 34.10.5 Downgrade Behavior

Downgrading removes `included_budget_remaining` on the next billing cycle. `overage_balance` funds already deposited remain available until consumed or refunded on request. Outstanding committed spend (Enterprise) is either rolled over, refunded, or forfeited per contract terms.

## 34.11 Outcome Resolver {#34.11-outcome-resolver}

The Outcome Resolver is the service that classifies every AI Operation as `accepted` or `rejected` and writes the corresponding value-dollar amount to the Wallet. Each capability in the Agent Capability Catalog (§21.4) has a specific outcome signal contract:

- **Signal source.** User click (accept/reject/edit), state retention (draft retained in submitted artifact ≥ threshold), downstream use (cited in another evaluation, attached to response), or composite (weighted combination).
- **Window.** Time window within which the signal must be observed. Common windows: 24h, 7d, 14d, 30d, 90d.
- **Timeout default.** `rejected`. This biases Sourcera toward cost protection when signal is ambiguous or missing.

### 34.11.1 Outcome Contract Registry

The complete outcome-signal contract per capability lives in a versioned registry alongside the Agent Capability Catalog. Key examples:

| Capability | Accepted signal | Window |
| :---- | :---- | :---- |
| Pre-Scoring | User confirms or edits ≤20% of suggested score | 7d |
| Requirement Extraction | Requirement retained in final spec | 14d |
| KB Suggestion | User clicks "use" or content appears in artifact | 7d |
| Policy Parsing | Parsed policy retained and used in ≥1 evaluation | 30d |
| Deep Comparison | Exported, shared, or linked from artifact | 14d |
| First-Pass RFP Draft | ≥50% of draft retained in submitted bid | 14d or on submission |
| KB Bootstrap | ≥60% of proposed entries approved | 30d |
| Ghost-RFP Ingestion | Resulting KB entries cited in a future bid | 90d |
| Seller Page Enrichment | Seller publishes generated content | 14d |
| Capability Declaration Suggest | Declaration published | 7d |
| Match Score (numeric) | EOI submitted after viewing score | 14d |
| Bid Task Assignment Suggest | Task assigned as suggested | 24h |

### 34.11.2 Contest Window

Customers may contest an outcome resolution within 14 days of the operation via the Billing Admin dashboard. Contested operations enter review by Sourcera Ops. Approved contests are refunded to `included_budget_remaining` or `overage_balance` at the value differential (accepted minus rejected price). Denied contests stand.

### 34.11.3 Cost-Base Recalculation

A nightly job recalculates `cost_base` for each capability from the prior 24h of Anthropic + Convex billing events. Drift alerts fire on >10% change. `value_price` and `cost_price` are re-derived from the multiplier (`cost_base × 10` and `× 1.05` respectively) and published to the public rate card at `api.sourcera.com/v1/pricing`. Rate-card changes are announced 30 days in advance; annual contract customers are grandfathered.

## 34.12 Cross-Side Billing Rules {#34.12-cross-side-billing-rules}

An Organization may hold any combination of Buyer and Seller plans.

1. **Plans activate per console, not per Org.** Valid combinations include (Buyer Growth + Seller Starter), (Buyer Free + Seller Scale), (Buyer Enterprise + Seller Free), etc.
2. **AI budgets are pooled at the Org level.** Total usable budget = sum of included-budget-remaining across both consoles + overage_balance + (committed_remaining if Enterprise). Any capability in either console can draw from the pool.
3. **Wallet overage is Org-scoped.** One wallet, one cap, one auto-topup config. Billing Admin role operates at the Org level.
4. **Dual-Console Firewall is unchanged.** Billing data is shared across consoles within an Org; business data is not. Console-scoped entities (Workspaces, Bid Workspaces, evaluations, KB entries, etc.) never cross the firewall regardless of billing state.
5. **Enterprise collapses into one contract.** If both consoles are on Enterprise, the Org signs one combined contract with one committed annual spend at the higher floor ($3,000/month). Dedicated CSM coverage is unified; the CSM works both sides of the Org.
6. **Billing Admin role.** The `billing_admin` org-level role is the only role permitted to change wallet config, enable/disable overage, initiate topups, change plan tier on either side, or accept a Vendor Pro Trial Seat grant. Audit log entries record every billing-state mutation with user attribution.

## 34.13 Buyer-Funded Pro Trial Seat (M17) {#34.13-buyer-funded-pro-trial-seat}

### 34.13.1 Purpose

When a buyer on Scale or Enterprise invites a vendor, the invite may optionally grant the vendor a 30-day Seller Starter trial. The cost of the subscription tier is absorbed into the buyer's plan (no cash transfer). AI usage during the trial is metered to the vendor's Org AI budget, not the buyer's. The mechanic lifts seller-side conversion rate at the forced-signup moment (the highest-converting PLG moment in the product) while improving response quality on the buyer's highest-stakes evaluations.

### 34.13.2 Allocation

| Buyer Plan | Pro Trial Seats per month |
| :---- | :---- |
| Buyer Free / Starter / Growth | — |
| Buyer Scale | 5 |
| Buyer Enterprise | 15 |

Unused seats do not carry over month to month. Seats replenish on the buyer's billing anniversary.

### 34.13.3 Grant Mechanics

1. Buyer Admin or Workspace Owner (per RBAC §5.3) clicks "Invite with Pro Trial" when authoring a vendor invite.
2. On magic-link signup, the invited vendor's Org is provisioned with Seller Starter entitlements (plan_tier = `seller_starter`, trial_source = buyer Org ID, trial_expires_at = +30 days).
3. Seller Starter AI budget ($30 value-dollars) is credited to the vendor's Wallet `included_budget_remaining` for the trial period.
4. All Seller Starter features are enabled immediately (KB capacity, Firecrawl sources, EOI quota, verification eligibility, etc.).
5. An audit log entry `pro_trial_seat_granted` records the grant on both the buyer's and vendor's Orgs.

### 34.13.4 Trial Completion

On day 31, one of the following occurs:
- **Convert.** Vendor converts to Seller Starter (or higher) with payment method on file. Plan persists, no data loss, included budget resets on new billing cycle.
- **Auto-downgrade.** Vendor takes no action. Plan downgrades to Seller Free. Entities exceeding Free-tier caps (KB >50 entries, Capability Declarations >3, etc.) enter 90-day read-only preservation per §34.6.
- **Explicit decline.** Vendor explicitly declines during the trial. Same behavior as auto-downgrade.

### 34.13.5 Restrictions

- A vendor Org cannot receive more than one Pro Trial Seat grant per buyer Org per 365 days.
- A vendor Org already on a paid Seller plan cannot receive a Pro Trial Seat grant (no downgrade or double-funding).
- The Billing Admin role on the vendor side may reject a Pro Trial Seat grant; rejection is audited.
- Anti-spam framework (§3.5 in Master Summary) applies — Ops Console may restrict a buyer's Pro Trial Seat usage on abuse signal.

### 34.13.6 Metering and Reporting

- Stripe meter event: `sourcera_pro_trial_grant` at grant time, `sourcera_pro_trial_conversion` on day-31 conversion, `sourcera_pro_trial_expired` on auto-downgrade.
- Internal conversion rate dashboard tracks: Pro Trial grants issued, conversions by day 31, AI budget utilization during trial, comparison vs cold-start Free→Starter conversion rate.

## 34.14 Acceptance Criteria {#34.14-acceptance-criteria}

- Entitlements checked on every gated feature access; plan tier lookup is O(1).
- Billing calculations accurate to the value-dollar.
- Downgrade warnings list all specific overages with clear actions and carry-over guarantees.
- Deprovisioned users do not affect plan pricing (seats are unlimited on every paid tier).
- Wallet events reported to Stripe daily.
- Outcome Resolver classifies every AI Operation within its capability window; timeout defaults to `rejected`.
- Cost-base recalculation runs nightly; drift alerts fire on >10% change.
- Rate-card changes announced 30 days in advance; annual contracts grandfathered.
- Cross-console plan assignments are independent; AI budget pools at Org level; Dual-Console Firewall remains intact for business data.
- Vendor Pro Trial Seat grants are auditable end-to-end, subject to anti-spam controls, and auto-downgrade on day 31 with 90-day data preservation.

---

# 35\. User Onboarding Experience {#35.-user-onboarding-experience}

## 35.1 Buyer Onboarding Flow {#35.1-buyer-onboarding-flow}

### Step 1: Sign Up

Email \+ password (or SSO for Enterprise). Auto-creates Organization and first Workspace.

### Step 2: Organization Setup

Organization name, logo (optional). Plan selection (Free or start Business trial).

### Step 3: Team Setup

Invite team members by email (bulk paste or single). Assign workspace roles: Workspace Admin, Use Case Lead, Reviewer. Skip option available.

### Step 4: First Use Case

Prompt: "What are you evaluating?" Pre-configured options: "Custom SaaS Evaluation", "Security-First Evaluation", "Compliance Evaluation" (links to Template Gallery). Or "Start from scratch."

### Step 5: First Requirement

"Create your first requirement" with guided field completion (title, description, response type, weight). Inline help for each field. Or "Import from policy document" (links to Policy Ingestion).

### Step 6: Optional — TCO Setup

If applicable: "Do you want to compare vendor costs?" Links to TCO Use Case creation.

### Step 7: Dashboard Tour

Highlight tour: Sidebar navigation, Command Palette (`Cmd+K`), Keyboard shortcuts, Pulse dashboard. Tour is dismissible and can be replayed from Settings → Help.

## 35.2 Seller Onboarding Flow {#35.2-seller-onboarding-flow}

The Seller Onboarding Flow exploits the single highest-converting moment in Sourcera's GTM: the forced vendor signup triggered by an incoming buyer invite. The vendor arrives at peak pain (incoming RFP, deadline, blank response, no chosen tool) with an immediate business reason to engage. The onboarding is engineered to collapse the new-vendor cold-start wall from ~2 days (status quo: manual triage, KB hunt, draft from scratch) to under 60 minutes end-to-end.

Narrative context and conversion rationale live in `Sourcera_Seller_Pricing_Strategy.md §14–§17`. This section is the implementation spec.

### 35.2.1 Seven-Stage Flow

| Stage | Duration | State | Product Surface |
| :---- | :---- | :---- | :---- |
| 1 | Magic-link arrival | 0–30s | Buyer invite email, magic-link |
| 2 | Signup + synchronous bootstrap | 30s–3m | Progress storytelling screen |
| 3 | Ready-workspace landing | 3–5m | Bid Workspace with drafts staged |
| 4 | Review and submit | 5–60m | Inline drafts + KB-gap detector |
| 5 | Post-submit stake reveal | Day 0 | Stake-reveal screen |
| 6 | Outcome debrief | Day 3–30 | Win/loss debrief surface |
| 7 | Upgrade touch | Day 1–90 | Contextual upgrade CTAs |

### 35.2.2 Step 1 — Magic-Link Arrival

Vendor receives email: *"You've been invited to participate in '{Workspace Name}' evaluation."* Magic-link opens Sourcera. No credit card prompt. No company profile form gate. Domain + invite identity is sufficient.

**Pre-arrival preparation (hidden from vendor):**
- Domain enrichment against public records (company name, industry, HQ region)
- Marketplace Tagger assigns probable category tags based on domain + buyer-side evaluation context
- Bootstrap queue is pre-warmed; crawl URLs resolved and rate-limited against Firecrawl

The bootstrap starts within the SSO redirect latency window — before the vendor sees a workspace.

### 35.2.3 Step 2 — Signup + Synchronous Bootstrap

Three operations run in parallel while the vendor watches a progress storytelling screen:

1. **Domain Bootstrap** (Capability S1, Opus, lifetime-free on Free). Crawls homepage, help center, docs, trust center. 30–90 seconds.
2. **KB Propose.** 40–200 draft KB entries staged with confidence scores and provenance URLs.
3. **First-Pass Draft** (Capability S2, Sonnet). Drafts responses for every requirement in the buyer's evaluation, citing newly bootstrapped KB entries.

**Progress storytelling screen.** Narrates true status lines:
- *"Scanning yourcompany.com..."* (0–15s)
- *"Found your security documentation..."* (15–30s)
- *"Drafting responses for {Buyer Company}'s 82 requirements..."* (30–90s)
- *"Your bid is ready to review."*

Status lines must reflect real operations — never fabricate steps.

**Account linking (for existing users):** If invitee already has a Sourcera account in a different Organization, present choice:
- *"Join the new organization with your existing account"* → Account linked to new org. Console switcher in sidebar shows all memberships.
- *"Create a new account with different email"* → Separate account created.

**Published Seller Profile** is auto-created on first signup (Basic verification tier, domain-verified). Profile appears in the public Marketplace immediately — no publication gate.

### 35.2.4 Step 3 — Ready-Workspace Landing

Vendor lands on the Bid Workspace with this headline:

> *Your bid for {Buyer Company} is ready. **47** of **82** requirements have AI drafts. **31** cite evidence from your website. Review time: **~35 min**.*

Three clear next steps surfaced inline (not in a modal):
- Review drafts
- Add or edit KB
- Invite teammates

No pricing page. No demo walkthrough. No "try Pro free for 14 days" modal. The hero moment is the pitch.

### 35.2.5 Step 4 — Review and Submit

**Inline citations.** Every First-Pass draft shows its KB citation in the response row: *"from: yourcompany.com/trust/soc2"* with hover expansion to the exact quoted sentence.

**Accept / Edit / Reject per requirement.** Three buttons. Every click is an outcome signal written to the Outcome Resolver (§34.11) for Capability S2.

**Live budget counter.** Top of workspace shows *"AI budget used: $X.XX of $5.00 · N drafts accepted, M rejected."* — visible to the user, sized so a complete first bid end-to-end fits within the $5 Free budget.

**KB-gap detector.** Rejected-response empty state is not a dead end:
> *"No KB content answered this. Write your answer below and we'll save it as a KB entry."*
> `[inline text field with 1-click save]`

One-click creates a KB entry from the vendor's inline answer. Every rejection grows the KB.

**"AI got this right" confirmation.** Accepting a draft with no edits records the strongest acceptance signal and surfaces a confirmation chip (*"added to your KB as verified response"*).

**NDA Review.** If the evaluation requires an NDA (Marketplace §27, NDA Record §4.5.3), the NDA module is surfaced as a blocking step before final submission. NDA review does not delay the hero moment — drafts are still prepared and reviewable during NDA negotiation.

### 35.2.6 Step 5 — Post-Submit Stake Reveal

On submission, the closing screen reads:

> *You just built a reusable KB of **N** verified entries in **Y** minutes.*
> *Your next bid will reuse them automatically.*
> *Sourcera tracked **$X.XX** of value pricing for the AI work on this bid (covered by your Free plan).*

This is a **stake-reveal screen**, not an upgrade CTA. It reminds the vendor what they have built, what it is worth, and how it compounds. Upgrade conversations come later at natural ceilings (Step 7).

### 35.2.7 Step 6 — Outcome Debrief

Triggered by buyer-side bid close event. Agent generates a debrief surface for the vendor:

**Win debrief:**
> *You won. **N** KB entries cited on winning responses. Those entries are now higher-weighted in your KB — Sourcera learned what answers close deals for you. Keep your KB alive — upgrade to Starter to unlock weekly crawls of your site and auto-staleness checks.*

**Loss debrief (with buyer's published reasoning where available):**
> *You lost this one. Gap analysis identified **N** requirements where your KB had no strong answer. Those gaps are flagged in your KB. Upgrade to Starter to let Sourcera crawl your product docs weekly and fill gaps automatically.*

### 35.2.8 Step 7 — Upgrade Touch

Three planned conversion moments, each with a distinct buying reason:

| # | Trigger | Buying reason | CTA |
| :---- | :---- | :---- | :---- |
| 1 | Second concurrent invited bid | Urgency — "my deal is at risk" | *"Starter unlocks 3 concurrent bids and shares your KB across all of them."* |
| 2 | First proactive EOI attempt | Ambition — "I want to find more deals" | *"Outbound EOIs start at Starter. Your first 10/month are included."* |
| 3 | KB approaches 50-entry cap | Investment — "don't lose what I've built" | *"Your KB is about to hit the Free ceiling. Starter raises it to 1,000 entries."* |

Every upgrade CTA must carry over KB, in-flight bids, Capability Declarations, and Firecrawl configs without re-setup (§34.5). CTAs state the carry-over explicitly.

### 35.2.9 Buyer-Funded Pro Trial Seat Acceptance

If the invite was issued with a Pro Trial Seat (§34.13), Step 2 provisions Seller Starter entitlements instead of Seller Free. The Billing Admin role on the vendor's Org receives a notification and may reject the grant; rejection is audited. On day 31, the vendor is prompted to convert, explicitly decline, or auto-downgrade to Seller Free (all data preserved per §34.6).

### 35.2.10 Activation Metric

**"Minutes from magic-link click to first submitted requirement response"** — target p50 < 20 minutes, p90 < 60 minutes. This is a top-level product metric and must be surfaced in the founder dashboard and Ops Console.

### 35.2.11 Onboarding Anti-Patterns (Explicitly Banned)

The onboarding surface must not:
- Ask for a credit card at any point before the first upgrade intent click
- Require the vendor to describe their company or industry before bootstrap runs
- Gate any feature behind a "try Pro free for 14 days" modal on first login
- Show a pricing page until the vendor has submitted their first bid
- Use dark patterns on upgrade CTAs (roach motels, hard-to-find downgrade, fake urgency)
- Present upgrade offers during active bid work — only at natural completion points or ceiling events

These bans exist because the supply-side flywheel depends on vendor trust. Any onboarding friction that reads as sales-ey kills that trust.

### 35.2.12 Required Platform Capabilities

Shipped as dependencies for the Seller Onboarding Flow to go live:

1. Magic-link SSO orchestrator that starts bootstrap inside the SSO redirect latency
2. Progress storytelling UI that renders bootstrap and first-pass status honestly
3. Inline-citation UI on every First-Pass draft response row
4. Budget counter persistent at top of Bid Workspace on Free and Starter
5. KB-gap detector in rejected-response empty states with 1-click KB-entry creation
6. Stake-reveal screen on first bid submission
7. Outcome debrief surface triggered by buyer-side bid close
8. Contextual upgrade CTAs that carry over KB, bids, and in-flight state
9. Pro Trial Seat plumbing (pool allocation, 30-day trial state, auto-downgrade on day 31)
10. Free-ceiling-approaching notifications (40/48 KB entries, 80% budget utilization, first EOI attempt)

## 35.3 Skipped Steps Recoverability {#35.3-skipped-steps-recoverability}

A persistent "Setup Checklist" widget appears in the sidebar during onboarding. Steps completed are checked off. Uncompleted steps remain visible.

**Behavior:**

- Checklist remains until all steps completed or explicitly dismissed  
- Dismissed checklist can be re-opened from Settings → Onboarding → Resume Setup  
- Clicking a step in checklist navigates to that onboarding screen  
- Checklist can be dismissed per-step (click X on individual step) or entirely (Dismiss All)

**Dismissal State:**

- Individual step dismissals: per-step flag stored in onboarding state  
- Full dismissal: `setup_checklist_dismissed` flag set on org record, but steps remain recoverable via Settings

## 35.4 Acceptance Criteria {#35.4-acceptance-criteria}

- Buyer onboarding complete in < 10 minutes.
- **Seller onboarding — time from magic-link click to first submitted requirement response p50 < 20 minutes, p90 < 60 minutes.**
- Seller Profile published publicly in the Marketplace by end of Step 2 (signup + bootstrap).
- KB Bootstrap completes within 90 seconds on p90 for domains under 500 pages.
- First-Pass Draft Generator produces drafts for ≥40% of requirements on p50 for invited bids with ≥40 requirements.
- All tooltips dismissible with single click or `Escape`.
- Onboarding never shows a pricing page before first bid submission.
- Onboarding never prompts for credit card before first upgrade intent click.
- Multi-org users can join additional organizations without account conflict.
- Setup Checklist persists until completed or dismissed, and is recoverable from Settings.
- Pro Trial Seat grants provision Seller Starter entitlements at signup; auto-downgrade on day 31 preserves all data for 90 days per §34.6.
- Activation metric (magic-link → first submitted response) surfaced in founder dashboard and Ops Console in real time.

---

# 36\. Settings {#36.-settings}

## 36.1 User Settings {#36.1-user-settings}

| Setting Page | Fields | Access |
| :---- | :---- | :---- |
| **Profile** | Name, email, avatar (upload), timezone (dropdown) | All users (self-edit) |
| **Notifications** | Per-event frequency (Immediate, Daily, Weekly, Never) and channel (In-App, Email) for all event types in Appendix C | All users (self-edit) |
| **Security** | MFA status, enrolled methods, recovery codes. SSO status (read-only, set by Org Admin). Org Admin can enforce MFA (Enterprise only) | All users. MFA edit if plan supports. |
| **API Tokens** | Generate, revoke, view scopes, copy to clipboard, expiration date | All users |
| **Keyboard Shortcuts** | View reference (read-only). Custom mapping Phase 2 | All users |
| **Data & Privacy** | Export data (CSV/JSON), download GDPR export, delete account, view data retention policy | All users |
| **Session Management** | Active sessions (IP, device, last activity), revoke session | All users |

## 36.2 Organization Settings {#36.2-organization-settings}

| Setting Page | Fields | Access | Behavior |
| :---- | :---- | :---- | :---- |
| **General** | Organization name, logo, website, industry, default currency, timezone | Org Owner, Org Admin | Changes apply to all users |
| **Plan & Billing** | Current plan, billing cycle, next renewal date, payment method, invoice history, plan upgrade/downgrade | Org Owner only | Plan changes effective immediately (upgrade) or next cycle (downgrade) |
| **Members** | List all members, invite new, remove, change role (Org Owner/Admin/Member/Guest), export member list | Org Owner, Org Admin | Member removals are effective immediately |
| **Security & SSO** | SSO status, IdP configuration (SAML metadata, connection name), MFA enforcement flag, IP allow list | Org Owner, Org Admin | SSO configuration triggers WorkOS sync |
| **SCIM Provisioning** | SCIM endpoint URL, bearer token, sync status, last sync timestamp | Org Owner, Org Admin (Enterprise only) | Changes trigger re-sync |
| **Integrations** | Webhook endpoint management, Slack/Teams channels, Salesforce sync status, data export mapping | Workspace Owner, Org Admin | Webhook changes effective immediately |
| **API Keys** | Organization-level API keys (different from user API keys), quota limits, scope assignment | Org Admin (view), Org Owner (create/revoke) | Key revocation immediate |
| **Audit Logs** | Query all audit events (Enterprise: 7 years, Business: 1 year, Free: 30 days), export as CSV | Org Owner, Org Admin | Real-time logs, searchable by user/entity/action |
| **Data Residency** | Current region selection, data location confirmation (Enterprise only) | Org Owner (display only, change requires support ticket) | Read-only in UI; changes require Enterprise support engagement |

## 36.3 Workspace Settings {#36.3-workspace-settings}

| Setting | Description | Access |
| :---- | :---- | :---- |
| **Name & Description** | Workspace metadata | Workspace Owner, Admin |
| **Scoring Mode** | Independent or Collaborative (Section 12.1). Cannot change after Phase 10 entry. | Workspace Owner |
| **PM Value** | Partially Meets numerical value (0.1-0.9, default 0.6). Configurable until Phase 1 lock. | Workspace Owner |
| **TCO Configuration** | Projection years (1-10, default 3), seat count (baseline), growth rate (% per year, default 0%), cost adjustment factor | Workspace Owner (if TCO Use Case exists) |
| **Phase Management** | View current phase, advance (if eligible), view gate validation status | Workspace Owner |
| **Member Management** | Add/remove members, assign workspace roles (Workspace Owner, Admin, Use Case Lead, Reviewer) | Workspace Owner, Admin |
| **Integrations** | Webhook setup, Slack/Teams channels per workspace, export mapping (Phase 13 only) | Workspace Owner, Admin |
| **Export** | CSV, PDF, Excel, JSON (per plan tier). Export entire workspace or filtered subset. | Workspace Owner, Admin |
| **Archival** | Archive workspace (soft delete, 30-day recovery). Cannot archive if Phase \< 13\. | Workspace Owner |
| **Deletion** | Delete workspace (requires Workspace Owner \+ Org Admin approval, 3-day confirmation window). Permanent purge after 30 days. | Workspace Owner \+ Org Admin |

## 36.4 Acceptance Criteria {#36.4-acceptance-criteria}

- Every user setting has clear labels, help text, and example values.  
- Organization settings permission matrix enforced on every mutation.  
- Workspace settings respect phase locks (e.g., cannot change Scoring Mode after Phase 10).  
- Data exports complete within 5 seconds for \<10K requirements.  
- Settings page load time \< 1s.  
- All settings changes logged to audit trail (Section 5.6).

---

# 37\. Accessibility & Internationalization {#37.-accessibility-&-internationalization}

## 37.1 Accessibility (WCAG 2.1 AA) {#37.1-accessibility-(wcag-2.1-aa)}

- **Color Contrast:** ≥ 4.5:1 (normal text), ≥ 3:1 (large text). Color is not sole information conveyor.  
- **Keyboard Navigation:** All interactive elements reachable via keyboard. Focus indicators ≥ 3:1 contrast, ≥ 3px border. No keyboard traps.  
- **Screen Reader:** ARIA labels and roles on interactive elements. Landmark regions (`<main>`, `<nav>`, `<aside>`). Form labels associated via `<label for>`. Status messages announced via `aria-live`.  
- **Motor:** Touch targets ≥ 48x48px. Keyboard alternatives for drag-and-drop (e.g., "Use arrow keys to reorder").

## 37.2 Internationalization (i18n) {#37.2-internationalization-(i18n)}

**v6.0 is English-only at launch.** The codebase is i18n-ready:

- All UI strings externalized via `next-intl` library.  
- No hardcoded strings in components.  
- Locale-aware formatting is supported:  
  - Dates: Per browser locale (en-US: MM/DD/YYYY, en-GB: DD/MM/YYYY, etc.)  
  - Numbers: Thousands separator and decimal per locale.  
  - Currency: Configurable per Organization (default USD).  
  - Timezone: User-configurable (default browser timezone).

**Phase 2 Roadmap:** Spanish, French, German, Japanese UI translations. User-generated content (requirements, responses) remains in original language.

## 37.3 Right-to-Left (RTL) Support {#37.3-right-to-left-(rtl)-support}

**v6.0: Deferred to Phase 2\.**

**CSS Architecture Prepared:** All layouts use CSS Logical Properties (`inline-start`, `inline-end`, `block-start`, `block-end`) instead of directional properties (`left`, `right`). Flexbox and Grid with logical flow directions. This enables RTL retrofitting without component rewrites.

## 37.4 Testing {#37.4-testing}

- Automated accessibility audits (Axe DevTools) on every UI change (CI/CD gated).  
- Annual third-party WCAG 2.1 AA audit (external firm).  
- Screen reader testing (NVDA, JAWS) on critical workflows.

## 37.5 Acceptance Criteria {#37.5-acceptance-criteria}

- Zero Axe violations on all pages.  
- All interactive elements keyboard-accessible.  
- Focus indicators visible on every interactive element.  
- ARIA labels present on custom components.  
- Logical properties used throughout CSS (no hardcoded `left`/`right`).

---

# 38\. Responsive Design & Platform Support {#38.-responsive-design-&-platform-support}

## 38.1 Breakpoints {#38.1-breakpoints}

| Breakpoint | Width | Layout |
| :---- | :---- | :---- |
| Mobile | \< 640px | Single-column. Sidebar collapsed to hamburger menu. Bottom navigation bar. |
| Tablet | 640-1024px | Two-column (sidebar \+ main). Touch targets ≥ 48px. Top navigation. |
| Desktop | \> 1024px | Three-column (sidebar \+ main \+ detail pane). Keyboard shortcuts enabled. Sidebar pinned. |

## 38.2 Browser Support {#38.2-browser-support}

**Desktop:** Chrome, Firefox, Safari, Edge (latest 2 versions each). Minimum 1024x768px. **Mobile:** iOS Safari, Chrome Android (latest 2 versions). Samsung Internet (latest). Minimum 375x667px. **Unsupported:** Internet Explorer (all versions).

## 38.3 JavaScript Requirement {#38.3-javascript-requirement}

Sourcera requires JavaScript. The platform is built on Convex (real-time reactive subscriptions) which requires the Convex SDK (JavaScript). There is no server-side rendering fallback for JavaScript-disabled browsers. If JavaScript is disabled, the app displays a static banner: "Sourcera requires JavaScript to function. Please enable JavaScript in your browser settings."

## 38.4 Mobile Feature Parity {#38.4-mobile-feature-parity}

Mobile experience is read \+ limited write. Full workflows (scoring, complex editing) require desktop.

**Mobile Read Access:**

- View requirements, responses, scores, comments  
- View workspace status and phase  
- View Pulse health metrics  
- View Intelligence briefings (read-only)

**Mobile Limited Write Access:**

- Comment on requirements (threaded comments)  
- Submit boolean responses (Seller Console)  
- View and acknowledge notifications

**Mobile Not Supported:**

- Collaborative scoring (requires Tablet+ due to multi-pane layout)  
- Policy Ingestion (file upload, complex extraction review)  
- TCO configuration (complex parameterization)  
- Scenario modeling (matrix-intensive)  
- Command Palette (replaced by Search Bar on mobile)  
- Full requirement editing (Markdown editor requires larger viewport)

**Mobile Search Bar:** On mobile, `Cmd+K` is not available. Instead, top navigation includes "Search" icon (magnifying glass) that opens mobile search. Searches: requirements, vendors, use cases, comments.

## 38.5 Acceptance Criteria {#38.5-acceptance-criteria}

- Mobile experience displays correctly on 375px width.  
- Touch targets ≥ 48px on mobile.  
- Read workflows fully functional on mobile.  
- Limited write workflows (comments, boolean responses) fully functional on mobile.  
- Mobile search bar responsive and discoverable.  
- Tablet layout properly reflows when rotated (landscape ↔ portrait).

---

# 39\. Object Size Constraints {#39.-object-size-constraints}

This is the single authoritative table for all entity field limits. All other sections reference this table.

| Entity | Field | Limit | Notes |
| :---- | :---- | :---- | :---- |
| Requirement | title | 500 chars | Markdown |
| Requirement | description | 10,000 chars | Markdown |
| Requirement | weight | Integer 0-20 | — |
| Response | answer\_text / answer\_informational | 50,000 chars | Markdown |
| Response | answer\_evidence (per file) | 50 MB | Single file limit |
| Response | answer\_evidence (total per response) | 10 files | Total files per response |
| Internal Comment | body | 5,000 chars | Markdown |
| Internal Comment | attachments | 10 files, 50MB each | 500 MB total per comment |
| Vendor Score | notes | 2,000 chars | Markdown |
| Use Case | name | 200 chars | Plain text |
| Use Case | description | 5,000 chars | Markdown |
| Workspace | name | 200 chars | Plain text |
| Workspace | description | 5,000 chars | Markdown |
| Scenario | name | 200 chars | Plain text |
| Scenario | summary | 1,000 chars | Markdown |
| Capability Declaration | declaration | 3,000 chars | Markdown |
| Capability Evidence | file | 50MB, max 10 files/capability | 500 MB total per capability |
| Pricing Config | notes | 2,000 chars | Markdown |
| Team | description | 500 chars | Plain text |
| Team | agent\_instructions | 2,000 chars | Markdown |
| KB Entry | body | 50,000 chars | Markdown |
| KB Entry | source\_url | 2,000 chars | HTTP(S) URL |
| Selection Report | narrative | 100,000 chars | Markdown |
| Traceability Matrix | notes | 2,000 chars | Markdown per row |

---

# 40\. Data Export & Import {#40.-data-export-&-import}

## 40.1 Export Formats {#40.1-export-formats}

| Format | Contents | Availability |
| :---- | :---- | :---- |
| **CSV** | Requirements, responses, scoring matrix, plan tier breakdown | All plans |
| **PDF** | Selection Report (executive summary \+ full scorecard) | All plans |
| **Excel** | Multi-sheet workbook (Requirements, Vendors, Scores, Comments, Traceability Matrix if applicable). Includes formulas for score aggregation | Business+ |
| **JSON** | Complete workspace snapshot (all entities, relationships, audit metadata) | Business+ (read-only API), Enterprise (full) |

### Additional Export Types

- **Traceability Matrix:** Standalone CSV/Excel of requirement ↔ framework control mappings (Policy Ingestion only).  
- **Scenario Export:** Scenario name, parameters, summary, and optional score snapshot. JSON or Excel.  
- **Intelligence Briefing:** JSON (raw) or PDF (formatted). Via Settings → Data & Privacy or API.  
- **Audit Export:** All audit events for a workspace (CSV/JSON). Enterprise only.

## 40.2 Data Retention & Deletion {#40.2-data-retention-&-deletion}

| Condition | Retention |
| :---- | :---- |
| Deleted workspace (soft delete) | 30 days, then permanent purge |
| User data (responses, comments, audit) | Life of workspace |
| Canceled subscription | 90 days, then purge |
| GDPR deletion request | 30 days to process (Section 33.4) |
| Deprovisioned user (SCIM) | Owned entities reassigned within 24 hours. User record retained but marked `deprovisioned`. |

## 40.3 Data Import {#40.3-data-import}

Enterprise customers receive assisted data import from existing procurement tools. Supported source formats: CSV, Excel, JSON.

**Process:**

1. Customer provides source data export.  
2. Import consultant maps source schema to Sourcera schema.  
3. Test import run. Customer reviews mappings and reconciles conflicts.  
4. Production import. Verification run. Audit log generated.

Typically 2-4 weeks. Sourcera does not modify source data; mapping is customer responsibility.

## 40.4 Import Round-Trip Fidelity {#40.4-import-round-trip-fidelity}

**Tested Guarantee:** A workspace exported to JSON and re-imported produces equivalent entities. Equivalence defined as:

- All requirement fields match exactly.  
- All vendor/target account mappings preserved.  
- All response text preserved (formatting may normalize).  
- Audit trail fields retained (timestamps, user IDs).  
- Internal relationships (Use Case ↔ Requirement, Requirement ↔ Response) preserved.

**Lost in Round-Trip:**

- Real-time presence indicators (last login, active sessions).  
- Transient Agent task states (in-progress Pre-Scoring operations).  
- WebSocket subscription state.

**Acceptance Criteria:**

- Round-trip test suite (sample workspaces exported → re-imported → validated).  
- Passes as part of regular QA for each release.  
- JSON import format documented for Enterprise customers.

## 40.5 Acceptance Criteria {#40.5-acceptance-criteria}

- All export formats complete within 30 seconds for workspaces with ≤ 10,000 requirements.  
- JSON export includes complete audit metadata.  
- Traceability Matrix export includes framework control mapping.  
- Import process preserves all entity relationships and timestamps.  
- Round-trip fidelity tested quarterly.

---

# 41\. Email Deliverability & Compliance {#41.-email-deliverability-&-compliance}

## 41.1 Email Provider {#41.1-email-provider}

All email sent via **Loops.so** — transactional, lifecycle, and marketing.

## 41.2 Complete Email Type Catalog {#41.2-complete-email-type-catalog}

| Email Type | Template | Subject Line | Sender | Category | Trigger |
| :---- | :---- | :---- | :---- | :---- | :---- |
| **Vendor Invitation** | vendor\_invited.hbs | You've been invited to evaluate \[Workspace Name\] | [noreply@sourcera.io](mailto:noreply@sourcera.io) | Transactional | Phase 4 entry. Target Account created. |
| **NDA Request** | nda\_request.hbs | Please review and sign the NDA for \[Workspace Name\] | [noreply@sourcera.io](mailto:noreply@sourcera.io) | Transactional | NDA link shared with vendor. |
| **NDA Signed Confirmation** | nda\_signed.hbs | NDA signed for \[Workspace Name\] | [noreply@sourcera.io](mailto:noreply@sourcera.io) | Transactional | Vendor signs NDA. |
| **Response Submitted** | response\_submitted.hbs | Response submitted for requirement: \[Requirement Title\] | [noreply@sourcera.io](mailto:noreply@sourcera.io) | Transactional | Vendor submits response. Sent to buyer team. |
| **Q\&A Question Received** | qa\_question\_received.hbs | New clarifying question: \[Question Title\] | [noreply@sourcera.io](mailto:noreply@sourcera.io) | Transactional | Vendor asks question in Phase 7\. Sent to buyer. |
| **Q\&A Answer Posted** | qa\_answer\_posted.hbs | Answer to your question: \[Question Title\] | [noreply@sourcera.io](mailto:noreply@sourcera.io) | Transactional | Buyer answers vendor question. Sent to vendor. |
| **Phase Advancement** | phase\_advanced.hbs | Evaluation advanced to Phase \[N\]: \[Phase Name\] | [noreply@sourcera.io](mailto:noreply@sourcera.io) | Transactional | Workspace Owner advances phase. Sent to all workspace members. |
| **Scoring Started** | scoring\_started.hbs | Scoring phase active. Requirements ready for evaluation | [noreply@sourcera.io](mailto:noreply@sourcera.io) | Transactional | Phase 10 entry. Sent to reviewers. |
| **SLA Pre-Breach Warning** | sla\_prewarning.hbs | ⚠️ \[Requirement Title\] due in 24 hours | [noreply@sourcera.io](mailto:noreply@sourcera.io) | Transactional | SLA timer triggers (24h before breach). Sent to requirement owner. |
| **SLA Breach Alert** | sla\_breach.hbs | 🔴 SLA breached: \[Requirement Title\] | [noreply@sourcera.io](mailto:noreply@sourcera.io) | Transactional | SLA timer expires. Sent to workspace owner \+ executive sponsor. |
| **Comment Mention** | comment\_mention.hbs | @\[Your Name\] mentioned you in a comment | [noreply@sourcera.io](mailto:noreply@sourcera.io) | Transactional | User is @-mentioned in comment. |
| **Vendor Disqualified** | vendor\_disqualified.hbs | You have been disqualified from \[Workspace Name\] | [noreply@sourcera.io](mailto:noreply@sourcera.io) | Transactional | Workspace Owner disqualifies vendor. Sent to vendor. |
| **Selection Report Ready** | report\_ready.hbs | Selection Report for \[Workspace Name\] is ready | [noreply@sourcera.io](mailto:noreply@sourcera.io) | Transactional | Phase 12 entry. Report generated. Sent to workspace owner. |
| **Plan Downgrade Warning** | plan\_downgrade\_warning.hbs | Your plan will downgrade on \[Date\] | [noreply@sourcera.io](mailto:noreply@sourcera.io) | Transactional | Downgrade scheduled. Sent 14 days before. |
| **Trial Expiring** | trial\_expiring.hbs | Your Business trial expires in 3 days | [noreply@sourcera.io](mailto:noreply@sourcera.io) | Lifecycle | Trial ending. Sent 3 days before expiration. |
| **Marketplace EOI Received** | eoi\_received.hbs | New EOI for your listing: \[Listing Name\] | [noreply@sourcera.io](mailto:noreply@sourcera.io) | Transactional | Buyer expresses interest in marketplace listing. Sent to seller. |
| **Workspace Invitation** | workspace\_invitation.hbs | You've been invited to join \[Workspace Name\] workspace | [noreply@sourcera.io](mailto:noreply@sourcera.io) | Transactional | Workspace Owner invites team member. |
| **GDPR Data Request** | gdpr\_request.hbs | Data subject access request received | [noreply@sourcera.io](mailto:noreply@sourcera.io) | Transactional | DSAR submitted. Confirmation sent to requester. |
| **GDPR Data Export Ready** | gdpr\_export\_ready.hbs | Your data export is ready for download | [noreply@sourcera.io](mailto:noreply@sourcera.io) | Transactional | DSAR response ready (within 30 days). |
| **Feature Announcement** | feature\_announcement.hbs | New feature: \[Feature Name\] | [marketing@sourcera.io](mailto:marketing@sourcera.io) | Marketing | New feature released. Sent to opted-in users. Unsubscribe in footer. |
| **Webinar Invitation** | webinar\_invitation.hbs | Join us: \[Webinar Title\] on \[Date\] | [marketing@sourcera.io](mailto:marketing@sourcera.io) | Marketing | Webinar scheduled. Sent to opted-in users. |
| **Weekly Digest** | weekly\_digest.hbs | Your Sourcera Pulse digest | [noreply@sourcera.io](mailto:noreply@sourcera.io) | Lifecycle | Weekly. Configurable frequency. Includes workspace status, SLAs, scores. |

## 41.3 Email Compliance {#41.3-email-compliance}

- **CAN-SPAM:** Unsubscribe link \+ physical address (sourcera.io footer) in all emails.  
- **GDPR:** Transactional emails not subject to marketing consent. Marketing requires explicit opt-in. Transactional email address (`noreply@sourcera.io`) not used for marketing.  
- **CASL:** Same as GDPR (implied consent for transactional, explicit for marketing).  
- **Bounce Rate Target:** \< 2%.  
- **Complaint Rate Target:** \< 0.5%.  
- **Deliverability Monitoring:** Sent emails \> 100/day. Spam trap monitoring. List hygiene (bounce management, complaint handling).

## 41.4 Opt-Out Classification {#41.4-opt-out-classification}

| Email Type | Opt-Out Classification | Enforcement |
| :---- | :---- | :---- |
| Vendor Invitation, NDA, Q\&A, Response notifications, Phase advancement, SLA alerts, Comment mentions, Selection Report, Disqualification, EOI received, Workspace invitation, GDPR notifications | **Transactional (No opt-out)** | Sent regardless of preference. Cannot unsubscribe. |
| Trial expiring, plan downgrade warning | **Transactional-Critical** | Sent regardless of preference for account/billing changes. |
| Weekly Digest, feature announcements, webinar invitations | **Marketing/Lifecycle (Opt-in)** | Require explicit opt-in. Unsubscribe link in footer. User preference honored. |

## 41.5 Acceptance Criteria {#41.5-acceptance-criteria}

- All email templates have preview URL for QA review.  
- All transactional emails delivered within 60 seconds of trigger.  
- All marketing emails respect user opt-out preference.  
- Weekly digest emails include unsubscribe link in header and footer.  
- Bounce and complaint rates monitored weekly via Loops.so dashboard.  
- No transactional emails sent from marketing sender address.

---

# 42\. Observability, Reliability & Disaster Recovery {#42.-observability,-reliability-&-disaster-recovery}

## 42.1 SLA Commitments {#42.1-sla-commitments}

| Plan | Uptime SLA | Response Time SLA | Severity |
| :---- | :---- | :---- | :---- |
| Free | None (best effort) | N/A | N/A |
| Business | 99.5% (22 min downtime/month max) | 24-hour response | SEV-3 only |
| Enterprise | 99.9% (43 sec downtime/month max) | 1-hour response | All severities |

**SLA Measurement:** Uptime measured via synthetic monitoring (Datadog endpoint checks) every 60 seconds from 3+ geographies. Latency measured per-endpoint (p95 \< 500ms, p99 \< 1s).

## 42.2 Monitoring & Alerting {#42.2-monitoring-&-alerting}

**Key Metrics:**

- API latency (p50, p95, p99)  
- Error rate (4xx, 5xx)  
- Database query latency  
- Convex Storage latency  
- Agent API latency and cost  
- Webhook delivery success rate

**Alerting Rules:**

| Condition | Severity | Action | Escalation |
| :---- | :---- | :---- | :---- |
| Error rate \> 1% | Warning | Alert to \#incident Slack channel | Page on-call if persists 5 min |
| API latency p95 \> 2s | Warning | Alert to \#incident Slack channel | Page on-call if persists 5 min |
| API latency p95 \> 5s | Critical | Page on-call immediately | 5-min response SLA |
| Database unavailable | Critical | Page on-call immediately | 5-min response SLA |
| Webhook delivery \< 95% | Warning | Alert to \#incident Slack channel | Manual escalation if persists 30 min |

## 42.3 Incident Response {#42.3-incident-response}

**Severity Definitions:**

| Severity | Impact | Response Time | Update Frequency |
| :---- | :---- | :---- | :---- |
| **SEV-1 (Critical)** | Service completely unavailable or data loss | \< 15 minutes | Every 30 minutes |
| **SEV-2 (Major)** | Service degraded or partial outage | \< 1 hour | Every 60 minutes |
| **SEV-3 (Minor)** | Service fully functional, cosmetic issues | \< 4 hours | Daily |

**Process:**

1. Incident detected (alert or customer report).  
2. On-call paged. Severity assigned.  
3. War room opened (Slack \+ Zoom).  
4. Customer notified (Statuspage.io status update) for SEV-1/2.  
5. Mitigation actions executed.  
6. All-clear declared.  
7. Postmortem scheduled within 24 hours.  
8. RCA completed within 48 hours.

**Postmortem Artifacts:**

- Root cause analysis  
- Contributing factors  
- Preventive actions (code changes, process changes, monitoring improvements)  
- Action items (assign, estimate, track)  
- Published internally to team

## 42.4 Disaster Recovery Targets {#42.4-disaster-recovery-targets}

| Metric | Target |
| :---- | :---- |
| **RTO (Recovery Time Objective)** | 1 hour |
| **RPO (Recovery Point Objective)** | 1 hour |

**Backups:**

- **Database:** Convex-managed snapshots hourly (aligned with 1-hour RPO) and daily (30-day retention).  
- **Object Storage (Files):** Geo-redundant (S3 replication, multi-region).  
- **Test Restore:** Quarterly restore tests. Restore to staging environment. Verify data integrity.

**Failover:** Convex provides transparent multi-region failover. Sourcera application code is stateless. No manual intervention needed. Automatic DNS failover (sub-60 second TTL).

## 42.5 On-Call Rotation {#42.5-on-call-rotation}

- 24/7 on-call coverage (Business & Enterprise).  
- Primary \+ secondary on-call.  
- Rotation weekly.  
- Incident history tracked in Pagerduty (paid plan).  
- Page timeout escalation: 10 minutes → escalate to secondary.

## 42.6 Observability Stack {#42.6-observability-stack}

| Component | Purpose | Tool |
| :---- | :---- | :---- |
| **Logging** | Structured logs (JSON) for all API requests, errors, state changes | Pino (application) → Datadog |
| **Metrics** | System and application metrics (latency, throughput, errors) | Datadog Agent |
| **Tracing** | Distributed request tracing (API → DB → Agent) | OpenTelemetry → Datadog |
| **Error Tracking** | Application errors and exceptions | Sentry |
| **Alerting** | Alert routing, escalation, notification | Datadog \+ PagerDuty |
| **Status Communication** | Public incident status | Statuspage.io |
| **Dashboards** | Real-time health visualization | Datadog dashboards |

**On-Call Runbooks:** Stored in Notion. Linked from Datadog alerts. Cover: common SEV-1/2 scenarios, diagnostic steps, mitigation playbooks, rollback procedures.

## 42.7 Acceptance Criteria {#42.7-acceptance-criteria}

- Uptime SLA met per month (tracked via Datadog dashboard).  
- All SEV-1 incidents have RCA posted within 48 hours.  
- Postmortem action items tracked and closed within 30 days.  
- Alert false positive rate \< 5% per month.  
- Restore test passes quarterly (data integrity verified).  
- On-call team trained on all runbooks (quarterly review).

---

# 43\. Internal Operations & Admin Tooling {#43.-internal-operations-&-admin-tooling}

## 43.1 Admin Dashboard {#43.1-admin-dashboard}

**Organization Management:**

- View all organizations, users per org, current plan, billing status  
- Search by org name, domain, email  
- Pause/unpause subscriptions (for billing holds or violations)  
- View usage (workspaces, members, API calls, agent tokens)  
- GDPR data export initiation (DSAR response generation)

**Workspace Management:**

- View workspaces per org, current phase, member count, requirement count  
- Search workspaces by name  
- Reset workspace (clear all data, return to Phase 1). Requires confirmation.  
- Archive/delete workspace. Requires confirmation \+ org admin approval.  
- Bulk export (multiple workspaces to JSON).

**User Management:**

- View all users, org memberships, roles, last login  
- Reset password (email reset link to user)  
- View/revoke API tokens (list all tokens, show creation date, expiration date)  
- View user audit log (all actions by this user across all orgs)  
- Suspend/deactivate user (login blocked, but data retained)  
- Trigger SCIM deprovisioning sync

**Billing Management:**

- View subscriptions (plan, status, renewal date, invoice history)  
- View invoices (paid, pending, overdue)  
- Manually apply discounts (percentage or fixed dollar amount)  
- Manually adjust plan (override plan tier for specific org, set expiration date)  
- Trial management (create, extend, convert to paid)  
- Refund management (initiate refund, provide reason)  
- Stripe integration (view disputes, manage payment methods)

**Marketplace Moderation:**

- View all marketplace listings (active, pending review, flagged)  
- Approve/reject listings (provide feedback)  
- View listings flagged for abuse (spam, fraud, harmful content)  
- Hide listings pending review (user notified)  
- View appeal history (user can appeal rejection)  
- Send enforcement message to seller (account warning, listing removal)  
- Ban seller from marketplace (permanent, requires escalation approval)

**Agent Debugging:**

- View Agent call history (organization, date, task type, cost, latency, status)  
- Search by workspace or requirement  
- View Agent prompt and response (full context)  
- Retry Agent task (useful for transient failures)  
- View Agent token usage (per org, per month)

## 43.2 Admin Dashboard Access Control {#43.2-admin-dashboard-access-control}

Only Sourcera internal staff (marked `is_staff: true` on user record) can access admin dashboard. Access requires:

- Sourcera user account  
- `org_id: null` (not member of any customer org)  
- `is_staff: true` flag (set by Sourcera ops team manually)

## 43.3 Support Tools {#43.3-support-tools}

- **Zendesk Integration:** Tickets linked to customer organizations (auto-populated via email domain). Ticket history searchable in admin dashboard.  
- **Customer Impersonation:** "Assume user session" button (Enterprise support only). Assumes the user's session context, can see what user sees. Fully audit logged (timestamp, admin name, duration, actions taken).  
- **Workspace Export:** One-click export for troubleshooting. Downloads complete JSON snapshot.  
- **Datadog Dashboard:** Real-time platform health, error rates, latency distribution. Linked from admin dashboard.  
- **Sentry Dashboard:** Application error tracking. Linked from admin dashboard.  
- **PostHog Events:** User behavior analysis. Linked from admin dashboard.

## 43.4 Audit Logging for Admin Actions {#43.4-audit-logging-for-admin-actions}

All admin actions logged to a dedicated `admin_audit_log` table:

- Action (reset password, apply discount, assume session, etc.)  
- Admin user  
- Target organization / user  
- Timestamp  
- Details (discount amount, plan override tier, etc.)  
- IP address

Admin audit logs retained forever and not subject to plan tier retention limits.

## 43.5 Acceptance Criteria {#43.5-acceptance-criteria}

- Admin dashboard loads in \< 2 seconds.  
- All admin actions require confirmation (double-click pattern).  
- Customer impersonation fully audit logged.  
- Admin actions never affect production customer data (dry-run option available for batch operations).  
- Admin can quickly find orgs/users (search ≤ 500ms).  
- Marketplace abuse report SLA: reviewed within 24 hours, action taken or appeal process initiated.

---

# 44\. Performance Requirements {#44.-performance-requirements}

## 44.1 Performance Targets {#44.1-performance-targets}

| Metric | Target |
| :---- | :---- |
| First Contentful Paint | \< 1s |
| Time to Interactive (TTI) | \< 2s |
| API Response Latency (p95, excluding Agent) | \< 500ms |
| API Response Latency (p99, excluding Agent) | \< 1s |
| Real-time Subscription Latency (collaborative scoring) | \< 200ms |
| Search Index Latency (Command Palette fuzzy search) | \< 200ms |
| PDF Export (100 requirements) | \< 5s |
| Workspace Load (1,000 requirements, matrix view) | \< 2s |
| **Agent Pre-Score per Requirement** | 10-30s (Sonnet) |
| **Agent Pre-Score per Workspace** | budget \= count × 15s (e.g., 100 requirements ≈ 25 minutes) |
| **Selection Report Generation** | \< 5 minutes (Opus, includes narrative \+ optional appendices) |

## 44.2 Agent Performance Budgets {#44.2-agent-performance-budgets}

**Pre-Score Per-Requirement Latency:**

- Haiku: 5-10s  
- Sonnet: 10-30s  
- Opus: 30-60s (used for reasoning-heavy requirements only)

**Full Workspace Pre-Score:**

- Budget: `requirement_count × 15 seconds` (average case)  
- Example: 100 requirements → max 25 minutes  
- Parallelization: Process up to 10 requirements concurrently → effective duration ≈ 2.5 minutes for 100 reqs

**Cost Estimates (per requirement, list price):**

- Haiku: $0.02-0.05 (input tokens: 500-1000, output tokens: 100-200)  
- Sonnet: $0.05-0.15 (input tokens: 1000-1500, output tokens: 200-400)  
- Opus: $0.15-0.40 (input tokens: 1500-2000, output tokens: 300-500)

**Monthly Agent Token Budget:**

- Free: 50K tokens/month (≈ 500-1000 requirements pre-scored)  
- Business: 500K tokens/month (≈ 5000-10000 requirements pre-scored)  
- Enterprise: 5M tokens/month (unlimited)

## 44.3 Optimization Strategies {#44.3-optimization-strategies}

- **Code Splitting:** Routes lazily loaded. Command Palette and advanced features code-split.  
- **Database Indexing:** Requirements indexed by workspace\_id \+ status. Vendors by organization\_id. Scores by (workspace\_id, vendor\_id, requirement\_id) composite.  
- **Caching:** Workspace metadata (10-min TTL). Vendor profiles (1-hour TTL). Scoring rubrics (permanent, versioned).  
- **Compression:** GZIP for API responses and static assets.  
- **CDN:** Vercel's global edge network for static assets.  
- **Real-time Optimizations:** Convex subscriptions use delta updates (send only changed fields, not full entities).

## 44.4 Load Testing {#44.4-load-testing}

- **Monthly:** 500 concurrent users. Target p95 \< 1s.  
- **Quarterly:** 5× spike tests (2,500 concurrent users). Target p95 \< 3s (degraded but functional).  
- **Quarterly:** 24-hour endurance test (steady 100 concurrent users). Monitor for memory leaks, connection exhaustion.

## 44.5 Acceptance Criteria {#44.5-acceptance-criteria}

- Production p95 latency consistently \< 500ms (excluding Agent calls).  
- Production p99 latency consistently \< 1s (excluding Agent calls).  
- No single API call times out (server-side timeout: 30s).  
- Real-time collaborative features sync \< 200ms (measured via WebSocket delta timing).  
- Agent calls stay within budget (95% within allotted time, 5% timeout with graceful degradation).

---

# 45\. Privacy & Abuse Prevention {#45.-privacy-&-abuse-prevention}

## 45.1 Data Privacy {#45.1-data-privacy}

- **Data Ownership:** All customer data owned by the Organization. Sourcera is Data Processor.  
- **Model Training:** No customer data used for model training. Claude calls do not train models.  
- **Analytics:** Aggregated anonymized metrics sent to PostHog for product analytics (feature adoption, user behavior). No PII in analytics events.  
- **Error Logs:** May include non-sensitive metadata (user ID, feature name, error code) but never requirement text, response data, or customer-specific scores.  
- **Data Processor Agreement (DPA):** Available for all plans. Sourcera signs DPA for GDPR compliance.  
- **Subprocessor List:** Published at sourcera.io/compliance/subprocessors. Updated quarterly.

## 45.2 Abuse Prevention {#45.2-abuse-prevention}

- **Rate Limiting:** Section 32.4. Per-org, per-API-key, per-user concurrency.  
- **Login Throttling:** Exponential backoff after 5 failed attempts (WorkOS-managed). Account locked for 15 minutes.  
- **API Token Rotation:** Recommended 90 days. Enforced for Enterprise (token expires after 90 days).  
- **Response Validation:** No executable scripts in responses. Sandboxed rendering. Strict Markdown sanitization (no raw HTML, no external images, no script execution).  
- **Marketplace Abuse Reporting:** Buyer can report vendor listing as spam, fraud, or harmful. Report → admin queue → 24-hour SLA → listing hidden pending review → seller notified → appeal process (seller can provide rebuttal within 7 days).

## 45.3 Marketplace Abuse Escalation {#45.3-marketplace-abuse-escalation}

**Abuse Report Workflow:**

1. **Report Filed:** Buyer clicks "Report Listing" on marketplace. Describes issue (spam, fraud, harmful, competitor sabotage, etc.). Listing ID and timestamp recorded.  
     
2. **Admin Queue:** Report added to admin queue in admin dashboard. Queue status: `pending_review`.  
     
3. **24-Hour SLA:** Admin reviews report within 24 hours. Assessment: confirmed or dismissed.  
     
4. **If Confirmed:** Listing status changed to `flagged_for_review`. Listing hidden from marketplace (public browse still works if direct link, but not discoverable). Seller notified by email: "Your listing \[name\] is under review. \[reason\]. You may appeal within 7 days."  
     
5. **Seller Appeal:** Seller can appeal via link in email. Provides rebuttal. Admin re-reviews (additional 24-hour SLA). Decision: upheld or overturned.  
     
6. **If Overturned:** Listing un-hidden. Seller notified: "Your appeal was accepted. Listing restored."  
     
7. **If Upheld:** Listing remains hidden. Seller notified: "Your appeal was denied. Listing remains under review."  
     
8. **Persistent Violations:** Repeated reports on same seller or violations of usage policy → escalation to Sourcera management → potential seller ban from marketplace (permanent, irreversible).

## 45.4 Acceptance Criteria {#45.4-acceptance-criteria}

- All customer data retention policies documented and enforced.  
- DPA available on request (all plans) and signed for Enterprise.  
- Marketplace abuse reports processed within 24 hours.  
- Rate limits enforced per Section 32.4.  
- No customer data included in error logs or analytics.

---

# 46\. Test Strategy & QA Framework {#46.-test-strategy-&-qa-framework}

## 46.1 Test Pyramid {#46.1-test-pyramid}

| Level | Coverage | Tools |
| :---- | :---- | :---- |
| **Unit** | ≥ 80% | Vitest |
| **Integration** | ≥ 60% | Vitest \+ Convex test harness |
| **E2E** | ≥ 40% (critical paths) | Playwright |

## 46.2 Advanced Feature Test Cases {#46.2-advanced-feature-test-cases}

### Collaborative Scoring (Section 12\)

- \[E2E\] Two reviewers score same requirement-vendor pair. Grades sync in real-time (\< 500ms).  
- \[E2E\] "Score Independently" toggle hides teammate grades for unbiased scoring.  
- \[Integration\] Insight Card generated on divergence \> 0.3.  
- \[Unit\] `scored_collaboratively` flag set correctly.  
- \[Unit\] Grade aggregation (average) correct for 3+ reviewers.

### Policy Ingestion (Section 11\)

- \[E2E\] Upload NIST 800-53 PDF → framework detected → controls extracted → review UI → accept/reject → triage queue.  
- \[E2E\] Non-standard document → generic extraction → no control mapping.  
- \[Unit\] Deduplication identifies ≥ 90% true duplicates (semantic match).  
- \[E2E\] Traceability Matrix generated and exportable (CSV/Excel).  
- \[E2E\] Policy requirements tagged with framework source control and version.

### TCO Modeling (Section 14\)

- \[E2E\] Create TCO Use Case → add pricing requirements (6 types) → vendors submit → 3-year TCO calculated.  
- \[Unit\] TCO formula handles all 6 pricing structures correctly (flat, tiered, one-time, percentage, range, discount).  
- \[E2E\] TCO data exported to Excel with formulas (references, calculations).  
- \[E2E\] Scenario modeling affects TCO calculations (weight adjustment does not affect TCO scores).

### Scenario Modeling (Section 13\)

- \[E2E\] Enter Simulation Mode → override weights → save scenario → load scenario → compare baseline.  
- \[Integration\] Score recalculation under scenario parameters is correct (vendor rankings may shift).  
- \[E2E\] Reset clears overrides.  
- \[E2E\] Multiple scenarios compared side-by-side.

### Organizational Intelligence (Section 24\)

- \[E2E\] Navigate to Intelligence → vendor history loads → efficiency metrics display → discrepancies flagged.  
- \[Integration\] Briefing generated (Sonnet, \~500 tokens).  
- \[Unit\] Cross-evaluation performance metrics calculated correctly (average score, completion time, approval rate).

### Capability Declarations (Section 25\)

- \[E2E\] Declare capability → upload evidence → badge appears → indexed in Marketplace.  
- \[E2E\] Buyer searches by capability → matching vendors appear.  
- \[E2E\] Capability filter on marketplace (Business+) works.

### Command Palette (Section 19\)

- \[E2E\] `Cmd+K` → "disagree" → disagreement filter applied.  
- \[E2E\] `Cmd+K` → "simulate" → Simulation Mode enters.  
- \[Unit\] Context-aware filtering (e.g., `go tco` hidden when no TCO Use Case).  
- \[E2E\] Fuzzy search results correct (relevance ranking).

### Real-Time Collaboration (Convex OT)

- \[E2E\] User A edits requirement description. User B sees changes in real-time (\< 200ms).  
- \[E2E\] Concurrent edits (A and B edit same field simultaneously) → conflict resolution correct.  
- \[Integration\] Presence indicators show active users (cursor \+ avatar).

### API

- \[Integration\] All API endpoints functional (CRUD operations).  
- \[Unit\] Rate limits enforced (10,001st request → 429).  
- \[Unit\] Pagination cursor-based, consistent across list endpoints.  
- \[Unit\] Error codes return correct HTTP status (Appendix I).  
- \[E2E\] Webhook delivery and retry (test with mock consumer endpoint).

### Mobile Responsiveness

- \[E2E\] Mobile viewport (375px) displays without horizontal scroll.  
- \[E2E\] Touch targets ≥ 48px on mobile.  
- \[E2E\] Read workflows fully functional on mobile (view requirements, responses, comments).  
- \[E2E\] Limited write workflows (comments, boolean responses) fully functional on mobile.

## 46.3 QA Process {#46.3-qa-process}

**Pre-Release:**

- All tests pass (unit, integration, E2E).  
- Axe DevTools accessibility audit passes (zero violations).  
- Manual regression on critical paths (Phases 1-13 progression, scoring, API).  
- Load test (500 concurrent users, p95 \< 1s).  
- Datadog dashboard green (error rate \< 1%, latency p95 \< 500ms).

**Release:**

- Feature flag rollout to 10% (canary) via PostHog.  
- Monitor 24 hours (error rate, latency, user feedback).  
- If stable, 100% rollout.  
- Post-release monitoring 48 hours.

## 46.4 Feature Flag System {#46.4-feature-flag-system}

Advanced features are individually flaggable via **PostHog Feature Flags**.

| Flag | Feature | Default |
| :---- | :---- | :---- |
| `collaborative_scoring` | Real-time collaborative scoring | Off (enable for Business+) |
| `policy_ingestion` | Policy Ingestion | Off (enable for Business+) |
| `scenario_modeling` | Scenario Modeling | Off (enable for Business+) |
| `tco_modeling` | TCO Modeling | Off (enable for Business+) |
| `organizational_intelligence` | Organizational Intelligence | Off (enable for Business+) |
| `capability_declarations` | Capability Declarations | On (all sellers) |
| `marketplace_capability_filter` | Marketplace capability filtering | Off (enable for Business+) |
| `ai_vendor_research` | AI Vendor Research (Perplexity) | Off (enable for Enterprise) |

Feature flags evaluated in combination with plan tier entitlements. A feature must pass both the flag check and the entitlement check to be accessible.

## 46.5 Acceptance Criteria {#46.5-acceptance-criteria}

- All sections with features have explicit acceptance criteria (already met in Sections 1-30; Sections 31-47 maintain parity).  
- E2E test coverage ≥ 40% of critical user flows.  
- Unit test coverage ≥ 80% of business logic.  
- Pre-release QA sign-off required before deployment.  
- All bugs fixed before 100% rollout.

---

# 47\. Governance & Future Roadmap {#47.-governance-&-future-roadmap}

## 47.1 Specification Versioning {#47.1-specification-versioning}

This specification is versioned using semantic versioning: Major.Minor.Patch.

- **Major:** Breaking API changes, fundamental architecture shifts.  
- **Minor:** New features, non-breaking schema changes, behavioral enhancements.  
- **Patch:** Bug fixes, clarifications, documentation updates.

Current version: **6.0.0** (released 2026-04-11).

## 47.2 Change Management Process {#47.2-change-management-process}

**Minor/Patch Changes:**

1. Change proposed (feature request, bug report, clarification).  
2. Reviewed by Product and Engineering leads.  
3. Specification section(s) updated. Version incremented (Minor or Patch).  
4. Changelog generated (Section 1.4 will maintain a change log of all versions).  
5. Deployed to staging. QA validates.  
6. Rolled out to production via feature flag (canary → 100%).

**Major Changes:**

1. Change proposed (RFC document).  
2. All-hands review. Feedback collected.  
3. Specification rewritten (new major version).  
4. Deprecated features marked with sunset date (minimum 6 months notice).  
5. Migration guide published.  
6. Old version kept in read-only archive.

## 47.3 Known Limitations & Future Work (Phase 2+) {#47.3-known-limitations-&-future-work-(phase-2+)}

| Item | Current | Phase 2 Target |
| :---- | :---- | :---- |
| RTL Support | CSS-ready; UI deferred | Full RTL (Arabic, Hebrew) |
| i18n Languages | English only | Spanish, French, German, Japanese |
| Customer-Managed Encryption Keys | — | Available for Enterprise |
| Field-Level PII Encryption | — | Automatic for sensitive fields |
| Custom Scoring Rubrics | Fixed rubrics per response type | Custom rubrics per requirement |
| Requirement Hierarchies | Flat (no dependencies) | Dependency trees (with blockers) |
| Custom Pipeline Phases | Fixed 13 phases | Customizable phase structure (Enterprise) |
| Two-Sided Marketplace Ratings | Not supported (by design) | Alternative: objective performance metrics |
| Agent Fine-Tuning | Public Claude models only | Custom fine-tuned models (Enterprise, Phase 3\) |
| Video Demos | Not supported | Native video upload \+ AI summarization |
| Mobile Full Parity | Read \+ limited write | Full write (scoring, editing) |

## 47.4 Data Residency & Compliance Expansion {#47.4-data-residency-&-compliance-expansion}

**Current:**

- Data residency region selectable (data\_residency\_region on Organization).  
- GDPR DPA signed.  
- SOC 2 Type II targeted.

**Phase 2:**

- ISO 27001 certification.  
- HIPAA BAA available.  
- CCPA compliance certified.  
- Data sovereignty for APAC (Singapore data center).

## 47.5 Acceptance Criteria {#47.5-acceptance-criteria}

- Specification version tracked in Git (semantic versioning).  
- All breaking changes communicated 6+ months in advance.  
- Changelog maintained for each version.  
- Feature flags allow incremental rollout of new features.  
- Deprecated features have minimum 6-month sunset period.

---

---

# APPENDICES {#appendices}

---

## Appendix A: Requirement Status State Machine {#appendix-a:-requirement-status-state-machine}

**State Diagram:**

draft ──→ active ──→ finalized ──→ archived

  ↑                      │

  └──────────────────────┘  (via Revert Rule, Phases 2-5 only)

amendments:

finalized ──→ active (amended) ──→ finalized (re-amended)

(Phases 6-9 only, via Amendment Protocol)

**Complete State Transitions:**

| From | To | Trigger | Conditions | Notes |
| :---- | :---- | :---- | :---- | :---- |
| draft | active | Requirement Owner marks complete | All required fields populated (title, description, weight, response\_type) | Auto-transitions on field completion. Reversible. |
| active | finalized | Phase 1 → Phase 2 advancement | Part of phase gate validation. All requirements must be active or finalized. | Irreversible unless Revert applied. |
| finalized | draft | Revert Rule (Section 9.4) | Phases 2-5 only. Workspace Owner/Admin action. | Triggered when requirement needs editing before vendor release. |
| finalized | active (amended) | Amendment Protocol (Section 9.5) | Phases 6-9 only. Workspace Owner action. | Version increments. Vendor's existing response marked `needs_reverification`. |
| active (amended) | finalized | Re-verification approved | Vendor re-submits updated response. Buyer accepts. | Version increments. New version becomes current. |
| (any) | archived | Workspace reaches Phase 13 | Automatic. All requirements in workspace archived. | Soft delete. Recoverable for 30 days. |
| archived | (none) | Workspace purge after 30 days | Automatic, permanent purge. | No recovery after purge. |

---

## Appendix B: Keyboard Shortcut Reference {#appendix-b:-keyboard-shortcut-reference}

### Global Shortcuts

| Shortcut | Action | Context |
| :---- | :---- | :---- |
| `Cmd+K` / `Ctrl+K` | Command Palette | Any page |
| `Cmd+Shift+K` / `Ctrl+Shift+K` | Full-text search | Any page |
| `Cmd+/` / `Ctrl+/` | Keyboard reference | Any page |
| `Escape` | Close palette / modal / side peek | Any open overlay |
| `?` | Show keyboard shortcuts | Any page |

### Matrix & Navigation (Phases 1-9, 11-13)

| Shortcut | Action | Context |
| :---- | :---- | :---- |
| `J` | Next row (requirement or vendor) | Requirement matrix or vendor list |
| `K` | Previous row | Requirement matrix or vendor list |
| `Enter` | Open Side Peek detail panel | Requirement or vendor selected |
| `Shift+Click` | Range select (multi-row) | Requirement matrix or vendor list |
| `Cmd+A` / `Ctrl+A` | Select all rows | Requirement matrix or vendor list |
| `Escape` | Deselect all rows | Requirement matrix or vendor list |
| `L` | Open inline editor for selected cell | Requirement matrix (edit title, description, weight) |
| `D` | Delete selected row(s) (with confirmation) | Requirement matrix or vendor list |

### Scoring (Phase 10\)

| Shortcut | Action | Context |
| :---- | :---- | :---- |
| `1` | Fully Meets (FM, 100%) | Scoring card (qualitative/evidence requirement) |
| `2` | Partially Meets (PM, configurable) | Scoring card |
| `3` | Does Not Meet (DNM, 0%) | Scoring card |
| `4` | Exception (EX, excluded) | Scoring card |
| `J` / `K` | Navigate requirement-vendor pairs | Scoring grid |
| `N` | Next unscored pair | Scoring grid |
| `C` | Open discussion thread on selected pair | Scoring card |
| `Escape` | Close discussion thread | Discussion overlay |
| `Tab` | Next input field within card | Scoring card |
| `Shift+Tab` | Previous input field within card | Scoring card |

### Simulation Mode (Phase 10+)

| Shortcut | Action | Context |
| :---- | :---- | :---- |
| `S` | Enter/exit Simulation Mode | Scoring phase |
| `Cmd+S` / `Ctrl+S` | Save current scenario | Simulation Mode active |
| `R` | Reset to baseline (clear overrides) | Simulation Mode active |
| `Cmd+1` through `Cmd+5` | Load scenario 1-5 | Simulation Mode active |
| `=` | Increase weight of selected use case (+1) | Simulation Mode active, Use Case row selected |
| `-` | Decrease weight of selected use case (-1) | Simulation Mode active, Use Case row selected |

### Markdown Editor

| Shortcut | Action | Context |
| :---- | :---- | :---- |
| `Cmd+B` / `Ctrl+B` | Bold (**text**) | Markdown editor |
| `Cmd+I` / `Ctrl+I` | Italic (*text*) | Markdown editor |
| `Cmd+K` / `Ctrl+K` | Insert link | Markdown editor (does NOT trigger Command Palette) |
| `Cmd+Shift+1` / `Ctrl+Shift+1` | Insert H1 heading | Markdown editor |
| `Cmd+Shift+2` / `Ctrl+Shift+2` | Insert H2 heading | Markdown editor |
| `Tab` | Indent list/code block | Markdown editor (list or code context) |
| `Shift+Tab` | Outdent list/code block | Markdown editor |
| `Cmd+Enter` / `Ctrl+Enter` | Save and close editor | Markdown editor |
| `Escape` | Cancel and revert edits | Markdown editor |

### Policy Ingestion (Section 11\)

| Shortcut | Action | Context |
| :---- | :---- | :---- |
| `U` | Review next unreviewed requirement | Policy ingestion review UI |
| `Y` | Accept requirement (mark reviewed) | Policy ingestion review UI, requirement selected |
| `N` | Reject requirement (mark reviewed, will not import) | Policy ingestion review UI, requirement selected |
| `G` | Go to policy PDF (open in side panel) | Policy ingestion review UI |

### TCO Configuration (Section 14\)

| Shortcut | Action | Context |
| :---- | :---- | :---- |
| `T` | Enter TCO configuration mode | Workspace settings |
| `+` | Add pricing requirement | TCO configuration |
| `-` | Remove selected pricing requirement | TCO configuration |
| `D` | Duplicate selected pricing requirement | TCO configuration |

### Intelligence (Section 24\)

| Shortcut | Action | Context |
| :---- | :---- | :---- |
| `B` | Download/view briefing | Intelligence dashboard |
| `H` | View vendor history chart | Intelligence dashboard, vendor selected |

### Q\&A (Phase 7-8)

| Shortcut | Action | Context |
| :---- | :---- | :---- |
| `Q` | Open Q\&A panel | Any phase |
| `+` | Add new question (buyer or vendor) | Q\&A panel |
| `Escape` | Close Q\&A panel | Q\&A panel open |

### Mobile (Touch Devices)

Mobile does not support Command Palette via `Cmd+K`. Instead:

- **Search Bar:** Top navigation includes search icon (magnifying glass).  
- **Navigation:** Bottom navigation bar (Phases, Requirements, Vendors, Scoring, Intelligence).  
- **Keyboard shortcuts:** Limited to essential navigation only (J/K for list traversal, Escape to close modals).

---

## Appendix C: Notification Event Catalog {#appendix-c:-notification-event-catalog}

**Complete event list. All support per-event frequency settings (Immediate, Daily, Weekly, Never) and per-channel toggles (In-App, Email).**

### Transactional Events (No Opt-Out)

| Event | Trigger | Recipient | In-App | Email | Frequency |
| :---- | :---- | :---- | :---- | :---- | :---- |
| `vendor_invited` | Target Account created, invitation sent | Vendor | Yes | Yes | Immediate |
| `nda_request` | NDA link shared with vendor | Vendor | Yes | Yes | Immediate |
| `nda_signed` | Vendor signs NDA | Buyer (Workspace Owner) | Yes | Yes | Immediate |
| `response_submitted` | Vendor submits response | Buyer (Requirement Owner, Use Case Lead) | Yes | Yes | Immediate |
| `response_recalled` | Vendor recalls (withdraws) submitted response | Buyer | Yes | Yes | Immediate |
| `qa_question_received` | Vendor asks clarifying question | Buyer (Requirement Owner) | Yes | Yes | Immediate |
| `qa_question_answered` | Buyer answers vendor question | Vendor | Yes | Yes | Immediate |
| `qa_closed` | Q\&A phase ends, summary generated | All workspace members | Yes | Yes | Immediate |
| `phase_advanced` | Workspace phase advanced | All workspace members | Yes | Yes | Immediate |
| `scoring_started` | Phase 10 entry, scoring unlocked | Reviewers (team members with Reviewer role) | Yes | Yes | Immediate |
| `sla_prewarning` | SLA timer expires in 24 hours | Requirement Owner | Yes | Yes | Immediate |
| `sla_breach` | SLA timer expires | Workspace Owner, Executive Sponsor | Yes | Yes | Immediate |
| `comment_mention` | User @-mentioned in comment | Mentioned user | Yes | Yes | Immediate |
| `vendor_disqualified` | Vendor marked as disqualified | Vendor | Yes | Yes | Immediate |
| `selection_report_ready` | Phase 12, report generated | Workspace Owner | Yes | Yes | Immediate |
| `workspace_invitation` | Team member invited to workspace | Invitee | Yes | Yes | Immediate |
| `amendment_required` | Requirement amended, vendor re-response needed | Vendor | Yes | Yes | Immediate |
| `amendment_accepted` | Vendor re-submits amended response, accepted | Vendor | Yes | Yes | Immediate |
| `gdpr_request_received` | DSAR submitted | User | Yes | Yes | Immediate |
| `gdpr_export_ready` | DSAR response ready for download | User | Yes | Yes | Immediate |
| `capability_declared` | Seller declares new capability | Seller admin | Yes | Yes | Immediate |
| `eoi_received` | Buyer expresses interest in marketplace listing | Seller (Org Owner) | Yes | Yes | Immediate |
| `marketplace_listing_approved` | Marketplace listing approved by admin | Seller | Yes | Yes | Immediate |
| `marketplace_listing_flagged` | Listing flagged for abuse, hidden pending review | Seller | Yes | Yes | Immediate |
| `marketplace_appeal_resolved` | Abuse appeal reviewed (upheld or overturned) | Seller | Yes | Yes | Immediate |

### Lifecycle Events (Opt-In)

| Event | Trigger | Recipient | In-App | Email | Frequency |
| :---- | :---- | :---- | :---- | :---- | :---- |
| `trial_expiring` | Business trial expiring in 3 days | Org Owner | Yes | Yes | 3 days before expiration |
| `plan_downgrade_warning` | Plan downgrade scheduled, current usage exceeds new limits | Org Owner | Yes | Yes | 14 days before downgrade |
| `plan_downgrade_complete` | Plan downgrade effective | Org Owner | No | Yes | At downgrade time |
| `weekly_digest` | Weekly Pulse summary | Workspace Owner, Executive Sponsor | Yes | Yes | Weekly (configurable day/time) |

### Marketing Events (Opt-In)

| Event | Trigger | Recipient | In-App | Email | Frequency |
| :---- | :---- | :---- | :---- | :---- | :---- |
| `feature_announcement` | New feature released | All opted-in users | Yes | Yes | Per release |
| `webinar_invitation` | Webinar scheduled | All opted-in users | Yes | Yes | Per webinar |
| `product_update` | Product update published | All opted-in users | Yes | Yes | Monthly |

---

## Appendix D: Response Status State Machine {#appendix-d:-response-status-state-machine}

**State Diagram:**

pending ──→ draft ──→ submitted ──→ locked

                         │              ↑

                         └→ needs\_reverification ──→ submitted (re-verified) ──→ locked

**Complete State Transitions:**

| From | To | Trigger | Conditions | Notes |
| :---- | :---- | :---- | :---- | :---- |
| pending | draft | Vendor opens response form | Response form accessed; no data required | Initial state when requirement released to vendor. |
| draft | submitted | Vendor clicks "Submit" | All required fields populated per response type | Buyer notified. Response locked from further vendor edits (until amendment). |
| submitted | locked | Phase 9 entry (Submissions Closed) | Automatic on phase advancement | Vendor cannot edit response. |
| submitted | needs\_reverification | Requirement amended (Amendment Protocol, Phases 6-9) | Buyer amends requirement via Amendment Protocol | Vendor notified. Response status changes. Existing submission moved to archive. New empty response created (`pending`). |
| needs\_reverification | draft | Vendor re-opens response to amend | Vendor clicks "Edit" on amended requirement | Vendor must re-verify against amended requirement. |
| draft (amended) | submitted (amended) | Vendor re-submits amended response | All required fields populated per amended response type | New version created. Buyer notified. |
| submitted (amended) | locked | Phase 9 entry | Automatic | Vendor cannot edit. |

**Acceptance Criteria:**

- All response status transitions logged to audit trail.  
- Vendor cannot submit incomplete responses (validation prevents Submit button click).  
- Amendment-triggered re-verification clearly communicated to vendor (banner in response form).

---

## Appendix E: Workspace & Bid Workspace Status State Machine {#appendix-e:-workspace-&-bid-workspace-status-state-machine}

### Workspace Status (Buyer Console)

**State Diagram:**

active ──→ archived

active ──→ canceled

| Transition | Trigger | Conditions | Notes |
| :---- | :---- | :---- | :---- |
| active → archived | Manual archive OR Phase 13 entry | Workspace Owner can archive; automatic at Phase 13 | Soft delete. Recoverable for 30 days. |
| active → canceled | Workspace Owner cancels | Requires confirmation. Cannot undo. | Terminal state. Data purged after 30 days. |
| archived → (none) | N/A | Archived workspace cannot transition. | Recovery available within 30 days (manual un-archive). After 30 days, permanent purge. |

### Bid Workspace Status (Seller Console)

**State Diagram:**

draft ──→ active ──→ submitted ──→ closed

| Transition | Trigger | Conditions | Notes |
| :---- | :---- | :---- | :---- |
| draft | NDA accepted by vendor | Vendor accepts NDA in Phase 4 | Bid Workspace auto-created. Initial status `draft`. |
| draft → active | Phase 5 entry (Bid Acceptance) | Buyer marks vendor as accepted | Bid Workspace unlocks. Vendor can view all requirements and begin responding. |
| active → submitted | Phase 9 entry (Submissions Closed) | Automatic phase advancement | Vendor console hard-locked. No further edits. |
| submitted → closed | Phase 13 entry (Closed) | Automatic phase advancement | Bid Workspace archived. Read-only access. Responses available for KB import. |

### Target Account Status (Vendor Curation)

**State Diagram:**

invited ──→ nda\_pending ──→ active ──→ closed

                   │

                   └───────→ withdrawn

                   

active ──────────→ disqualified

| Transition | Trigger | Conditions | Notes |
| :---- | :---- | :---- | :---- |
| invited | Phase 3 entry (Vendor Curation) | Target Account created | NDA not yet sent. Vendor not yet invited. |
| invited → nda\_pending | NDA link sent to vendor | Buyer sends NDA | Waiting for vendor signature. |
| nda\_pending → active | Vendor signs NDA, Phase 5 entry | Phase 5 (Bid Acceptance) required for activation | Bid Workspace unlocked. Vendor can respond. |
| nda\_pending → withdrawn | Buyer retracts NDA (before vendor signs) | Buyer withdraws vendor from evaluation | Vendor notified. Bid Workspace not created. |
| active → disqualified | Buyer marks vendor as disqualified | Any phase after Phase 5 | Vendor notified. Bid Workspace marked read-only. Responses archived. |
| active → closed | Phase 13 entry (Closed) | Automatic | Target Account archived. |

**Acceptance Criteria:**

- All status transitions logged with timestamp and user attribution.  
- Status changes trigger appropriate email notifications.  
- Phase locks prevent invalid transitions (e.g., cannot mark as active before NDA).

---

## Appendix F: Webhook Retry & Recovery {#appendix-f:-webhook-retry-&-recovery}

**Retry Schedule:** 5 attempts over 24 hours.

| Attempt | Delay from Previous | Cumulative | Condition |
| :---- | :---- | :---- | :---- |
| 1 | Immediate | 0 min | Initial delivery |
| 2 | 1 minute | 1 min | If attempt 1 fails |
| 3 | 15 minutes | 16 min | If attempt 2 fails |
| 4 | 1 hour | 76 min | If attempt 3 fails |
| 5 | 6 hours | 436 min (7.3 hrs) | If attempt 4 fails |

After 5 failures, the webhook is marked `failed`. Org Admin is notified via email. Failed webhooks available for manual retry from Settings → Integrations → Failed Webhooks (30-day retention).

**Success Criteria:** HTTP 2xx response within 10 seconds. Any other response (3xx, 4xx, 5xx, timeout) triggers next retry.

**Idempotency:** Each delivery includes unique `event_id`. Consumer must deduplicate. Same `event_id` delivered multiple times must produce idempotent result.

**Payload Signing:**

signature \= HMAC-SHA256(webhook\_secret, raw\_request\_body)

Header: X-Sourcera-Signature \= "sha256=" \+ hex(signature)

Consumer must verify signature before processing.

**Dead Letter Queue (DLQ):** Permanently failed deliveries (after 5 retries) stored in DLQ. Org can query DLQ via Settings → Integrations → Failed Webhooks. DLQ entries retained 30 days, then purged.

**Webhook Consumer Contract:**

- Accept HTTP POST request (JSON body).  
- Verify HMAC-SHA256 signature.  
- Deduplicate by `event_id`.  
- Process idempotently.  
- Return 2xx within 10 seconds.  
- If processing fails (internal error), return 5xx (will trigger retry).  
- If payload invalid (malformed), return 4xx (will NOT retry).

---

## Appendix G: PostHog Event Taxonomy {#appendix-g:-posthog-event-taxonomy}

### Standard Events

| Event | Trigger | Key Properties |
| :---- | :---- | :---- |
| `requirement_created` | Requirement created | `workspace_id`, `use_case_id`, `response_type`, `weight` |
| `requirement_updated` | Requirement text/weight changed | `workspace_id`, `requirement_id`, `field_changed` |
| `requirement_deleted` | Requirement deleted | `workspace_id`, `requirement_id` |
| `requirement_status_changed` | Status changes (draft→active, active→finalized, etc.) | `workspace_id`, `requirement_id`, `old_status`, `new_status` |
| `vendor_added` | Target Account created | `workspace_id`, `vendor_org_id`, `vendor_name` |
| `vendor_removed` | Target Account deleted | `workspace_id`, `vendor_org_id` |
| `vendor_status_changed` | Vendor status transition | `workspace_id`, `vendor_org_id`, `old_status`, `new_status` |
| `response_submitted` | Vendor submits response | `workspace_id`, `vendor_org_id`, `requirement_id`, `response_type` |
| `response_recalled` | Vendor recalls response | `workspace_id`, `vendor_org_id`, `requirement_id` |
| `score_submitted` | Reviewer scores requirement-vendor pair | `workspace_id`, `vendor_org_id`, `requirement_id`, `grade`, `scored_by_user_id` |
| `score_changed` | Reviewer changes existing score | `workspace_id`, `vendor_org_id`, `requirement_id`, `old_grade`, `new_grade` |
| `comment_added` | Comment posted on requirement | `workspace_id`, `requirement_id`, `comment_length`, `attachment_count` |
| `comment_mention` | User @-mentioned in comment | `workspace_id`, `requirement_id`, `mentioned_user_id` |
| `workspace_created` | Workspace created | `workspace_id`, `workspace_name`, `use_case_count` |
| `workspace_archived` | Workspace archived | `workspace_id`, `reason` (phase\_13 or manual) |
| `workspace_canceled` | Workspace canceled | `workspace_id`, `reason` |
| `phase_advanced` | Workspace phase advanced | `workspace_id`, `old_phase`, `new_phase` |

### Advanced Feature Events

| Event | Trigger | Key Properties |
| :---- | :---- | :---- |
| `collaborative_score_viewed` | Reviewer opens scoring with live teammate grades | `vendor_id`, `requirement_id`, `teammate_count`, `has_insight_card` |
| `insight_card_expanded` | User expands Insight Card | `vendor_id`, `requirement_id`, `divergence_amount` |
| `insight_card_acted_on` | User changes grade after viewing Insight Card | `old_grade`, `new_grade`, `card_reason` |
| `policy_ingestion_started` | User initiates policy ingestion | `document_count`, `total_pages`, `framework_type_detected` |
| `policy_ingestion_completed` | Policy ingestion processing finishes | `generated_requirement_count`, `duration_seconds`, `deduplication_matches` |
| `policy_ingestion_accepted` | User reviews and accepts requirements | `requirement_count_accepted`, `requirement_count_rejected` |
| `policy_ingestion_failed` | Policy ingestion processing fails | `error_code`, `error_message` |
| `scenario_created` | New scenario saved | `workspace_id`, `parameter_count`, `override_types` |
| `scenario_saved` | Scenario changes saved | `workspace_id`, `scenario_id`, `changes_from_baseline` |
| `scenario_compared` | Comparison view opened | `workspace_id`, `scenario_count`, `time_spent_seconds` |
| `scenario_deleted` | Scenario deleted | `workspace_id`, `scenario_id` |
| `simulation_mode_entered` | User enters Simulation Mode | `workspace_id`, `vendor_count`, `requirement_count` |
| `simulation_mode_exited` | User exits Simulation Mode | `workspace_id`, `changes_made` |
| `intelligence_viewed` | Intelligence dashboard opened | `workspace_id`, `vendor_count`, `metric_types_viewed` |
| `intelligence_briefing_generated` | Briefing generation completes | `workspace_id`, `model`, `token_count`, `duration_seconds` |
| `intelligence_briefing_downloaded` | Briefing exported | `workspace_id`, `format` (json or pdf) |
| `tco_use_case_created` | TCO Use Case created | `workspace_id` |
| `tco_requirement_added` | Pricing requirement added to TCO Use Case | `workspace_id`, `pricing_structure` |
| `tco_calculation_run` | TCO formula evaluated (Phase 10+) | `workspace_id`, `vendor_count`, `pricing_requirement_count`, `projection_years` |
| `tco_export_generated` | TCO data exported to Excel | `workspace_id`, `vendor_count` |
| `capability_declared` | Seller declares capability | `seller_org_id`, `category`, `evidence_file_count` |
| `capability_filter_used` | Buyer uses capability filter on marketplace | `capability_count`, `results_count`, `filter_time_ms` |
| `command_palette_used` | Command Palette opened | `query`, `command_selected`, `time_to_select_ms`, `context` |
| `keyboard_shortcut_used` | Keyboard shortcut triggered | `shortcut_key`, `context`, `workspace_id` |
| `marketplace_listing_created` | Seller creates marketplace listing | `seller_org_id`, `listing_status` |
| `marketplace_listing_viewed` | Buyer views marketplace listing | `seller_org_id`, `listing_id`, `time_spent_seconds` |
| `marketplace_eoi_submitted` | Buyer submits EOI | `listing_id`, `seller_org_id` |
| `marketplace_eoi_accepted` | Seller accepts EOI | `eoi_id`, `buyer_org_id` |
| `nda_signed` | Vendor signs NDA | `workspace_id`, `vendor_org_id` |
| `amendment_applied` | Requirement amended (Amendment Protocol) | `workspace_id`, `requirement_id`, `vendor_affected_count` |
| `selection_report_generated` | Selection Report generated (Phase 12\) | `workspace_id`, `vendor_count`, `appendix_types_included` |
| `traceability_matrix_generated` | Traceability Matrix generated (policy ingestion) | `workspace_id`, `framework_type`, `control_count` |

---

## Appendix H: Stripe Billing Model {#appendix-h:-stripe-billing-model}

### Subscription Products

| Product | Price | Billing | Renewal |
| :---- | :---- | :---- | :---- |
| `sourcera-free` | $0/month | Tracking only (no payment method) | N/A |
| `sourcera-business` | $499/month (annual) or $599/month (monthly) | Recurring, auto-renew | Monthly or yearly |
| `sourcera-enterprise` | Custom | Annual contract | Annually |

### Metered SKUs

| SKU ID | Trigger | Pricing | Billing Granularity |
| :---- | :---- | :---- | :---- |
| `sourcera_api_calls` | API call count | Free: $0.01/100 (beyond 1K). Business: $0.005/100 (beyond 10K). Enterprise: unlimited | Daily meter event |
| `sourcera_policy_ingestions` | Policy Ingestion count | Business: $25/ingestion (beyond 3/mo). Enterprise: unlimited | Per ingestion |
| `sourcera_agent_tokens` | Agent token usage | Business: $0.01/1000 tokens (beyond 500K/mo). Enterprise: included in contract | Daily meter event (1000-token units) |
| `sourcera_storage_overage` | Storage beyond plan limit (GB) | All plans: $0.10/GB/month | Daily meter event (1 GB units) |

### Billing Mechanics

- **Monthly Invoices:** Generated on subscription anniversary date.  
- **Line Items:** Subscription amount \+ metered overages \+ prorated changes.  
- **Auto-Charging:** Stripe auto-charges default payment method.  
- **Failed Charges:** 3 retries over 15 days. After final failure, subscription paused (access revoked until payment successful).  
- **Tax:** Stripe Billing handles Sales Tax/VAT/GST automatically (requires tax ID configuration).  
- **Meter Reporting:** Metered charges reported to Stripe daily. Events aggregated by date and SKU.  
- **Invoice Visibility:** Customer views invoices in Settings → Billing → Invoice History.

### Free-to-Paid Upgrade

- Free → Business: Immediate upgrade. Customer enters trial or paid subscription. Billing cycle starts on upgrade date (prorated for remainder of month if mid-cycle).  
- Business renewal: On anniversary date, Stripe charges subscription amount \+ metered overages from previous month.

### Plan Downgrade

- Business → Free: Effective at next renewal date. If current usage exceeds Free limits, customer enters "read-only overage" state and must resolve within 30 days (Section 34.6).  
- Metered charges stop on downgrade date.

**Acceptance Criteria:**

- Stripe webhooks synced (invoice.paid, customer.subscription.updated, etc.).  
- Metered charges reported daily, appear on next invoice.  
- Billing calculations audit trail (can trace any charge to source).  
- Failed payment retry logic honored (3 attempts over 15 days).

---

## Appendix I: API Error Code Catalog {#appendix-i:-api-error-code-catalog}

### Standard HTTP Errors

| Code | HTTP | Meaning | Example |
| :---- | :---- | :---- | :---- |
| `unauthorized` | 401 | Missing or invalid API token | `Authorization: Bearer invalid_token` |
| `forbidden` | 403 | Sufficient authentication but insufficient permissions | User lacks write permission on resource |
| `not_found` | 404 | Resource does not exist or no access | Workspace ID does not exist |
| `bad_request` | 400 | Invalid request body | Missing required field in POST body |
| `rate_limit_exceeded` | 429 | Rate limit exceeded (burst or monthly quota) | Per-hour limit exceeded |
| `internal_server_error` | 500 | Unexpected server error | Unhandled exception in server code |
| `service_unavailable` | 503 | Maintenance or outage | Database offline |

### Entity-Specific Errors

| Code | HTTP | Meaning |
| :---- | :---- | :---- |
| `invalid_workspace_id` | 404 | Workspace not found or no access |
| `invalid_requirement_id` | 404 | Requirement not found |
| `invalid_vendor_id` | 404 | Vendor not found |
| `invalid_scenario_id` | 404 | Scenario not found or deleted |
| `invalid_capability_id` | 404 | Capability not found or deleted |
| `invalid_report_id` | 404 | Selection Report not found or expired |
| `invalid_matrix_id` | 404 | Traceability Matrix not found |
| `invalid_briefing_id` | 404 | Intelligence Briefing not found or expired (30-day retention) |
| `invalid_policy_ingestion_id` | 404 | Policy ingestion job not found |
| `invalid_comment_id` | 404 | Comment not found |
| `invalid_use_case_id` | 404 | Use Case not found |

### Limit & Entitlement Errors

| Code | HTTP | Meaning |
| :---- | :---- | :---- |
| `feature_not_available_on_plan` | 403 | Feature not available on current plan tier |
| `scenario_limit_exceeded` | 403 | Max scenarios reached for plan |
| `policy_ingestion_limit_exceeded` | 403 | Monthly ingestion limit reached |
| `workspace_limit_exceeded` | 403 | Max workspaces reached for plan |
| `member_limit_exceeded` | 403 | Max members reached for plan |
| `storage_limit_exceeded` | 403 | Storage quota exceeded |
| `agent_budget_exceeded` | 403 | Monthly Agent token budget exceeded |
| `api_calls_exceeded` | 429 | Monthly API call quota exceeded |
| `webhook_limit_exceeded` | 403 | Max webhook endpoints reached for plan |
| `api_key_limit_exceeded` | 403 | Max API keys reached for plan |

### Phase & Workflow Errors

| Code | HTTP | Meaning |
| :---- | :---- | :---- |
| `phase_lock_violation` | 403 | Attempted mutation on phase-locked entity (e.g., editing requirement after Phase 1\) |
| `gate_validation_failed` | 422 | Phase advancement blocked by failing gate rules |
| `console_isolation_violation` | 403 | Attempted cross-console data access (e.g., Buyer Console accessing Seller data) |
| `invalid_phase_transition` | 422 | Attempted phase transition not allowed (e.g., skip Phase 2\) |
| `incomplete_requirement` | 422 | Requirement missing required fields (cannot advance phase) |
| `incomplete_response` | 422 | Vendor response missing required fields (cannot submit) |
| `vendor_nda_not_signed` | 403 | Cannot unlock Bid Workspace; vendor NDA not signed |
| `workspace_cancelled` | 403 | Cannot perform action on cancelled workspace |
| `workspace_archived` | 403 | Cannot perform action on archived workspace (read-only) |

### Agent Errors

| Code | HTTP | Meaning |
| :---- | :---- | :---- |
| `agent_error` | 500 | Upstream LLM error. Retry recommended. |
| `agent_timeout` | 504 | Agent call timed out (\> 30s). Retry recommended. |
| `agent_budget_exceeded` | 403 | Organization monthly token budget exceeded. Request denied. |
| `agent_disabled` | 403 | Agent features disabled for this organization (plan downgrade pending). |

### Webhook Errors

| Code | HTTP | Meaning |
| :---- | :---- | :---- |
| `webhook_signature_invalid` | 403 | HMAC-SHA256 signature verification failed |
| `webhook_payload_too_large` | 413 | Webhook payload exceeds 256 KB limit |
| `webhook_delivery_failed` | 500 | Webhook delivery failed after retries (stored in DLQ) |

### Validation Errors

| Code | HTTP | Meaning |
| :---- | :---- | :---- |
| `invalid_field_length` | 400 | Field exceeds max length (see Appendix O) |
| `invalid_weight` | 400 | Weight outside 0-20 range |
| `invalid_pm_value` | 400 | PM value outside 0.1-0.9 range |
| `invalid_response_type` | 400 | Response type not in controlled vocabulary |
| `duplicate_requirement` | 409 | Requirement with identical title/description already exists (conflict) |
| `invalid_markdown` | 400 | Markdown syntax error or unsafe content (e.g., script tags) |

### Error Response Schema

{

  "error": {

    "code": "gate\_validation\_failed",

    "message": "Cannot advance to Phase 2: 3 requirements are still in draft status.",

    "details": {

      "failing\_rules": \["all\_requirements\_active"\],

      "blocking\_requirement\_ids": \["req\_abc", "req\_def", "req\_ghi"\],

      "invalid\_fields": \["title", "weight"\]

    },

    "request\_id": "req\_789xyz"

  }

}

**All error responses include `request_id` for support escalation.**

---

## Appendix J: Controlled Vocabulary Registry {#appendix-j:-controlled-vocabulary-registry}

**All enum values used throughout the specification are canonically defined here. Section 3 schema definitions must reference these values exactly.**

### Response Types

`boolean`, `qualitative`, `evidence`, `informational`, `pricing`

### Rubric Grade Categories

| Grade | Code | Value | Default PM (if PM mode) | Description |
| :---- | :---- | :---- | :---- | :---- |
| Fully Meets | FM | 1.0 | 100% | Vendor response meets requirement fully, out of box |
| Partially Meets | PM | 0.6 (configurable per workspace, default) | Configurable (0.1-0.9) | Vendor response meets requirement partially; requires customization or integration |
| Does Not Meet | DNM | 0.0 | 0% | Vendor response does not meet requirement |
| Exception | EX | Excluded | — | Requirement scored as exception (excluded from vendor comparison, flagged in report) |

### Global Organization Roles

`org_owner`, `org_admin`, `member`, `guest`

### Workspace Roles

`workspace_owner`, `workspace_admin`, `use_case_lead`, `reviewer`, `guest`

### Team Roles

`team_owner`, `team_lead`, `team_member`

### Pipeline Phases (Canonical 13\)

| Phase \# | Phase Name | Canonical String |
| :---- | :---- | :---- |
| 1 | Drafting Requirements | `phase_1_drafting_requirements` |
| 2 | Internal Approval | `phase_2_internal_approval` |
| 3 | Vendor Curation | `phase_3_vendor_curation` |
| 4 | NDA Execution | `phase_4_nda_execution` |
| 5 | Bid Acceptance | `phase_5_bid_acceptance` |
| 6 | RFP Live | `phase_6_rfp_live` |
| 7 | Q\&A Open | `phase_7_qa_open` |
| 8 | Q\&A Closed | `phase_8_qa_closed` |
| 9 | Submissions Closed | `phase_9_submissions_closed` |
| 10 | Scoring | `phase_10_scoring` |
| 11 | Demos | `phase_11_demos` |
| 12 | Final Selection | `phase_12_final_selection` |
| 13 | Closed | `phase_13_closed` |

### Notification Frequencies

`immediate`, `daily`, `weekly`, `never`

### Notification Channels

`in_app`, `email`

### Capability Categories

`security_compliance`, `integration_technical`, `operational_maturity`, `company_profile`

### Seller Verification Tiers

`basic`, `verified`, `certified`

**Criteria:**

- `basic`: Email domain verified, profile 50% complete  
- `verified`: Domain verified, profile 100% complete, 1+ capability declared  
- `certified`: Verified \+ passed compliance documentation review (SOC 2, ISO, etc., configured by Sourcera)

### Pricing Structures

`flat`, `tiered`, `one_time`, `percentage_of_license`, `estimate_range`, `discount`

### Requirement Statuses

`draft`, `active`, `finalized`, `archived`

### Response Statuses

`pending`, `draft`, `submitted`, `needs_reverification`, `locked`

### Target Account Statuses (Vendor Curation)

`invited`, `nda_pending`, `active`, `disqualified`, `withdrawn`

### Workspace Statuses

`active`, `archived`, `canceled`

### Bid Workspace Statuses

`draft`, `active`, `submitted`, `closed`

### Plan Tiers

`free`, `business`, `enterprise`

### Scoring Modes

`independent`, `collaborative`

### MFA Enforcement Levels

`off`, `optional`, `required`

### API Token Scopes

`read:requirements`, `write:requirements`, `read:responses`, `write:responses`, `read:scores`, `write:scores`, `read:workspaces`, `admin:integrations`

### Audit Event Action Types

`created`, `updated`, `deleted`, `archived`, `submitted`, `approved`, `rejected`, `advanced_phase`, `reverted`, `amended`, `signed`, `exported`

### Marketplace Listing Statuses

`draft`, `active`, `flagged_for_review`, `hidden`, `declined`, `delisted`

### Marketplace EOI Statuses

`pending`, `accepted`, `rejected`, `withdrawn`

### NDA Statuses

`draft`, `sent`, `signed`, `expired`, `revoked`

### Scoring Modes (Workspace-Level Configuration)

`independent` — Reviewers score without visibility to teammate grades. Grades aggregated after all reviewers submit.

`collaborative` — Reviewers score with real-time visibility to teammate grades. Divergences trigger Insight Cards.

### Intelligence Brief Models

`haiku`, `sonnet`, `opus`

---

**End of Sourcera Master Specification v6.0.0**  
