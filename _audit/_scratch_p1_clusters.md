# P1 Cluster Inventory (open defects only)

## Pre-flight counts
Total open P1 defects: 808
Total phases: 72
Total clusters: 372

## Per-phase clusters

### Phase AS
| Cluster ID | Count | Sample IDs | Class | Sections | Summary | Recommendation | Owner | Pack | Effort | Linear ID |
|---|---:|---|---|---|---|---|---|---|---|---|
| BL-P1-PHAS-NUM | 1 | D-AS-001 | numerical_singleton | §48.8.6 | 1 P1 numerical_singleton defects in Phase AS | Move number to one §34/§39/§44 home; inline references cite the table. | — | — | S | PROD-001 |
| BL-P1-PHAS-PLAN | 1 | D-AS-012 | plan_gating | §48.8.6 | 1 P1 plan_gating defects in Phase AS | Add §5.11 / §34.1 / §39 rows; never duplicate inline; cite the table. | — | — | S | PROD-002 |

### Phase 1
| Cluster ID | Count | Sample IDs | Class | Sections | Summary | Recommendation | Owner | Pack | Effort | Linear ID |
|---|---:|---|---|---|---|---|---|---|---|---|
| BL-P1-PH1-DOC | 1 | D-1V2-001 | documentation_gap | §2 | 1 P1 documentation_gap defects in Phase 1 | Author missing spec content; cite authoritative source-of-truth. | audit-program | — | S | DOC-001 |
| BL-P1-PH1-NUM | 3 | D-AS-002, D-AS-004, D-AS-005 | numerical_singleton | §7, §13, §14 | 3 P1 numerical_singleton defects in Phase 1 | Move number to one §34/§39/§44 home; inline references cite the table. | pricing | — | S | PROD-003 |

### Phase 1.1
| Cluster ID | Count | Sample IDs | Class | Sections | Summary | Recommendation | Owner | Pack | Effort | Linear ID |
|---|---:|---|---|---|---|---|---|---|---|---|
| BL-P1-PH11-DM | 11 | D-1.1-001, D-1.1-002, D-1.1-003, D-1.1-004, D-1.1-005 … +6 more | data_model | §4.2.3, §4.2, §4.2.4, §4.2.1, §4.2.2 | 11 P1 data_model defects in Phase 1.1 | Author missing entity field tables / retention / scope-isolation per §4 conventions. | engineering | M02.3 | L | PROD-004 |
| BL-P1-PH11-ENUM | 4 | D-1.1-007, D-1.1-008, D-1.1-014, D-1.1-015 | enum | §4.2.1, `plan_tier_kind` enum (Appendi, §6.6.3 | 4 P1 enum defects in Phase 1.1 | Register missing enum values in Appendix J and cite source location. | engineering | M02.3 | M | PROD-005 |

### Phase 1.2
| Cluster ID | Count | Sample IDs | Class | Sections | Summary | Recommendation | Owner | Pack | Effort | Linear ID |
|---|---:|---|---|---|---|---|---|---|---|---|
| BL-P1-PH12-ACC | 1 | D-1.2-006 | acceptance_criteria | §4.3.1 | 1 P1 acceptance_criteria defects in Phase 1.2 | Author numbered, testable, observable AC blocks per §13.10 style. | engineering + qa | — | S | PROD-006 |
| BL-P1-PH12-DM | 7 | D-1.2-001, D-1.2-002, D-1.2-003, D-1.2-005, D-1.2-007 … +2 more | data_model | §13.11.7, §4.3.1, §4.3.2, §4.3.4, §13.2 | 7 P1 data_model defects in Phase 1.2 | Author missing entity field tables / retention / scope-isolation per §4 conventions. | engineering | M02.3 | M | PROD-007 |
| BL-P1-PH12-FW | 1 | D-1.2-004 | firewall_leakage | §4.3.2 | 1 P1 firewall_leakage defects in Phase 1.2 | Add console firewall guard with redaction-verification-hash invariant. | engineering | — | S | PROD-008 |

### Phase 2.2
| Cluster ID | Count | Sample IDs | Class | Sections | Summary | Recommendation | Owner | Pack | Effort | Linear ID |
|---|---:|---|---|---|---|---|---|---|---|---|
| BL-P1-PH22-DM | 4 | D-2.2-043, D-2.2-044, D-2.2-045, D-2.2-059 | data_model | §4.4.20, §4.4.19, §22.18.3.3 | 4 P1 data_model defects in Phase 2.2 | Author missing entity field tables / retention / scope-isolation per §4 conventions. | engineering | M02.3 | M | PROD-009 |
| BL-P1-PH22-ENUM | 24 | D-2.2-001, D-2.2-002, D-2.2-003, D-2.2-004, D-2.2-005 … +19 more | enum | §4.4.8, §27.10.2.1, §4.7.1, §4.4.9, §4.4.4 +18 more | 24 P1 enum defects in Phase 2.2 | Register missing enum values in Appendix J and cite source location. | engineering | M02.3 | L | PROD-010 |
| BL-P1-PH22-FW | 6 | D-2.2-035, D-2.2-036, D-2.2-037, D-2.2-038, D-2.2-041 … +1 more | firewall_leakage | §4.4.2, §4.4.3, §4.4.5, §4.4.6, §4.7.1 +1 more | 6 P1 firewall_leakage defects in Phase 2.2 | Add console firewall guard with redaction-verification-hash invariant. | engineering | — | M | PROD-011 |
| BL-P1-PH22-NUM | 5 | D-2.2-025, D-2.2-027, D-2.2-029, D-2.2-030, D-2.2-031 | numerical_singleton | §4.4.12, §4.4.19, §4.4.21, §4.4.22, §4.4.17 | 5 P1 numerical_singleton defects in Phase 2.2 | Move number to one §34/§39/§44 home; inline references cite the table. | engineering | — | M | PROD-012 |
| BL-P1-PH22-WH | 2 | D-2.2-046, D-2.2-047 | webhook | §4.4.19, §4.4.21 | 2 P1 webhook defects in Phase 2.2 | Author webhook per §31: HMAC, idempotency, backoff, DLQ, Appendix C+G registration. | engineering | M02.3 | S | PROD-013 |

### Phase 1.5
| Cluster ID | Count | Sample IDs | Class | Sections | Summary | Recommendation | Owner | Pack | Effort | Linear ID |
|---|---:|---|---|---|---|---|---|---|---|---|
| BL-P1-PH15-DM | 1 | D-1.5-008 | data_model | §6.7.2 | 1 P1 data_model defects in Phase 1.5 | Author missing entity field tables / retention / scope-isolation per §4 conventions. | engineering | M02.3 | S | PROD-014 |
| BL-P1-PH15-DOC | 1 | D-1.5-010 | documentation_gap | §6.7.1 | 1 P1 documentation_gap defects in Phase 1.5 | Author missing spec content; cite authoritative source-of-truth. | engineering | — | S | DOC-002 |
| BL-P1-PH15-ENUM | 2 | D-1.5-006, D-1.5-007 | enum | §22.20.7, §50.5.1 | 2 P1 enum defects in Phase 1.5 | Register missing enum values in Appendix J and cite source location. | engineering | M02.3 | S | PROD-015 |
| BL-P1-PH15-RET | 1 | D-1.5-009 | retention | §40.2 | 1 P1 retention defects in Phase 1.5 | Add §40.2 retention row per data class with TTL, anonymization, DSAR cascade. | engineering | — | S | PROD-016 |

### Phase 1.6
| Cluster ID | Count | Sample IDs | Class | Sections | Summary | Recommendation | Owner | Pack | Effort | Linear ID |
|---|---:|---|---|---|---|---|---|---|---|---|
| BL-P1-PH16-DSAR | 1 | D-1.6-004 | dsar | §4.7.2 | 1 P1 dsar defects in Phase 1.6 | Author §6.8 DSAR cascade row with subject-rights coverage and erasure handling. | engineering + legal | — | S | PROD-017 |
| BL-P1-PH16-EC | 1 | D-1.6-002 | error_code | §4.7.1 | 1 P1 error_code defects in Phase 1.6 | Add Appendix I row with HTTP status, retry semantics, user-facing copy. | engineering | M02.3 | S | PROD-018 |
| BL-P1-PH16-WH | 1 | D-1.6-003 | webhook | §4.7.1 | 1 P1 webhook defects in Phase 1.6 | Author webhook per §31: HMAC, idempotency, backoff, DLQ, Appendix C+G registration. | engineering | M02.3 | S | PROD-019 |

### Phase 1.7
| Cluster ID | Count | Sample IDs | Class | Sections | Summary | Recommendation | Owner | Pack | Effort | Linear ID |
|---|---:|---|---|---|---|---|---|---|---|---|
| BL-P1-PH17-WH | 4 | D-1.7-002, D-1.7-003, D-1.7-004, D-1.7-005 | webhook | §4.8.5, §34.14.5, §31.8.6 | 4 P1 webhook defects in Phase 1.7 | Author webhook per §31: HMAC, idempotency, backoff, DLQ, Appendix C+G registration. | engineering | M02.3 | M | PROD-020 |

### Phase 1.4
| Cluster ID | Count | Sample IDs | Class | Sections | Summary | Recommendation | Owner | Pack | Effort | Linear ID |
|---|---:|---|---|---|---|---|---|---|---|---|
| BL-P1-PH14-DM | 3 | D-1.4-003, D-1.4-005, D-1.4-007 | data_model | §4.5.1, §4.5.2, §4.5.3 | 3 P1 data_model defects in Phase 1.4 | Author missing entity field tables / retention / scope-isolation per §4 conventions. | engineering | M02.3 | S | PROD-021 |
| BL-P1-PH14-DSAR | 1 | D-1.4-009 | dsar | §4.5.3 | 1 P1 dsar defects in Phase 1.4 | Author §6.8 DSAR cascade row with subject-rights coverage and erasure handling. | engineering + legal | — | S | PROD-022 |
| BL-P1-PH14-ENUM | 2 | D-1.4-004, D-1.4-006 | enum | §4.5.1, §4.5.2 | 2 P1 enum defects in Phase 1.4 | Register missing enum values in Appendix J and cite source location. | engineering | M02.3 | S | PROD-023 |
| BL-P1-PH14-NUM | 2 | D-1.4-011, D-1.4-012 | numerical_singleton | §4.5.1, §4.5.2 | 2 P1 numerical_singleton defects in Phase 1.4 | Move number to one §34/§39/§44 home; inline references cite the table. | engineering | — | S | PROD-024 |
| BL-P1-PH14-RET | 1 | D-1.4-010 | retention | §4.5.3 | 1 P1 retention defects in Phase 1.4 | Add §40.2 retention row per data class with TTL, anonymization, DSAR cascade. | engineering + legal | — | S | PROD-025 |
| BL-P1-PH14-SM | 1 | D-1.4-008 | state_machine | §4.5.3 | 1 P1 state_machine defects in Phase 1.4 | Replace prose with From/To/Trigger/Conditions table; cover concurrency / re-drive. | engineering | — | S | PROD-026 |

### Phase 3.1
| Cluster ID | Count | Sample IDs | Class | Sections | Summary | Recommendation | Owner | Pack | Effort | Linear ID |
|---|---:|---|---|---|---|---|---|---|---|---|
| BL-P1-PH31-DRIFT | 1 | D-3.1-005 | consistency_drift | §5.2 | 1 P1 consistency_drift defects in Phase 3.1 | Normalize cross-doc/cross-section terminology; cite single authoritative home. | engineering | — | S | DOC-003 |
| BL-P1-PH31-GLOSS | 3 | D-3.1-008, D-3.1-016, D-3.1-020 | glossary | §5.3, §5.5, §5.6 | 3 P1 glossary defects in Phase 3.1 | Author missing Appendix K glossary entries with section cross-refs. | engineering | — | S | DOC-004 |
| BL-P1-PH31-RBAC | 13 | D-3.1-001, D-3.1-003, D-3.1-004, D-3.1-006, D-3.1-007 … +8 more | rbac | §5.1, §5.2, §5.3, §5.5, §5.6 +2 more | 13 P1 rbac defects in Phase 3.1 | Add missing §5.11 Feature Access Matrix rows per role × action × column. | engineering | — | L | PROD-027 |

### Phase 3.2
| Cluster ID | Count | Sample IDs | Class | Sections | Summary | Recommendation | Owner | Pack | Effort | Linear ID |
|---|---:|---|---|---|---|---|---|---|---|---|
| BL-P1-PH32-PLAN | 20 | D-3.2-001, D-3.2-002, D-3.2-003, D-3.2-007, D-3.2-008 … +15 more | plan_gating | §5.11, §50.11 | 20 P1 plan_gating defects in Phase 3.2 | Add §5.11 / §34.1 / §39 rows; never duplicate inline; cite the table. | engineering | — | L | PROD-028 |
| BL-P1-PH32-RBAC | 3 | D-3.2-004, D-3.2-005, D-3.2-006 | rbac | §5.11 | 3 P1 rbac defects in Phase 3.2 | Add missing §5.11 Feature Access Matrix rows per role × action × column. | engineering | — | S | PROD-029 |

### Phase 3.3
| Cluster ID | Count | Sample IDs | Class | Sections | Summary | Recommendation | Owner | Pack | Effort | Linear ID |
|---|---:|---|---|---|---|---|---|---|---|---|
| BL-P1-PH33-DRIFT | 2 | D-3.3-009, D-3.3-023 | consistency_drift | §6.2.2, §6.4 | 2 P1 consistency_drift defects in Phase 3.3 | Normalize cross-doc/cross-section terminology; cite single authoritative home. | engineering | — | S | DOC-005 |
| BL-P1-PH33-DM | 1 | D-3.3-007 | data_model | §6.2.2 | 1 P1 data_model defects in Phase 3.3 | Author missing entity field tables / retention / scope-isolation per §4 conventions. | engineering | M02.3 | S | PROD-030 |
| BL-P1-PH33-DOC | 9 | D-3.3-001, D-3.3-002, D-3.3-010, D-3.3-016, D-3.3-017 … +4 more | documentation_gap | §6.1, §6.2, §6.3, §6.4, §6.5 | 9 P1 documentation_gap defects in Phase 3.3 | Author missing spec content; cite authoritative source-of-truth. | engineering + security | — | M | DOC-006 |
| BL-P1-PH33-ENUM | 2 | D-3.3-008, D-3.3-032 | enum | §6.2.2, §6.6.3 | 2 P1 enum defects in Phase 3.3 | Register missing enum values in Appendix J and cite source location. | engineering | M02.3 | S | PROD-031 |
| BL-P1-PH33-EC | 1 | D-3.3-022 | error_code | §6.4.1 | 1 P1 error_code defects in Phase 3.3 | Add Appendix I row with HTTP status, retry semantics, user-facing copy. | engineering | M02.3 | S | PROD-032 |
| BL-P1-PH33-FW | 2 | D-3.3-029, D-3.3-035 | firewall_leakage | §6.5, §6.6.3 | 2 P1 firewall_leakage defects in Phase 3.3 | Add console firewall guard with redaction-verification-hash invariant. | engineering + security | — | S | PROD-033 |
| BL-P1-PH33-NUM | 3 | D-3.3-006, D-3.3-015, D-3.3-033 | numerical_singleton | §6.2.4, §6.3.1, §6.6.1 | 3 P1 numerical_singleton defects in Phase 3.3 | Move number to one §34/§39/§44 home; inline references cite the table. | engineering | — | S | PROD-034 |
| BL-P1-PH33-PLAN | 2 | D-3.3-028, D-3.3-034 | plan_gating | §6.4, §6.6.4 | 2 P1 plan_gating defects in Phase 3.3 | Add §5.11 / §34.1 / §39 rows; never duplicate inline; cite the table. | engineering + security | — | S | PROD-035 |
| BL-P1-PH33-SM | 3 | D-3.3-011, D-3.3-018, D-3.3-024 | state_machine | §6.2, §6.3, §6.4 | 3 P1 state_machine defects in Phase 3.3 | Replace prose with From/To/Trigger/Conditions table; cover concurrency / re-drive. | engineering | — | S | PROD-036 |
| BL-P1-PH33-SE | 1 | D-3.3-003 | surface_engine_mapping | §6 | 1 P1 surface_engine_mapping defects in Phase 3.3 | Author Appendix M row with companion-doc anchor, tier visibility, override. | engineering + design | — | S | PROD-037 |
| BL-P1-PH33-WH | 1 | D-3.3-012 | webhook | §6.2 | 1 P1 webhook defects in Phase 3.3 | Author webhook per §31: HMAC, idempotency, backoff, DLQ, Appendix C+G registration. | engineering + security | M02.3 | S | PROD-038 |

### Phase 3.4
| Cluster ID | Count | Sample IDs | Class | Sections | Summary | Recommendation | Owner | Pack | Effort | Linear ID |
|---|---:|---|---|---|---|---|---|---|---|---|
| BL-P1-PH34-DRIFT | 1 | D-3.4-005 | consistency_drift | §6.7.4 | 1 P1 consistency_drift defects in Phase 3.4 | Normalize cross-doc/cross-section terminology; cite single authoritative home. | engineering + design | — | S | DOC-007 |
| BL-P1-PH34-NOTIF | 1 | D-3.4-004 | notification | §51.1 | 1 P1 notification defects in Phase 3.4 | Register notification in Appendix C with channel × role × plan-gating matrix. | engineering + security | M02.3 | S | PROD-039 |
| BL-P1-PH34-NUM | 1 | D-3.4-006 | numerical_singleton | §36.2 | 1 P1 numerical_singleton defects in Phase 3.4 | Move number to one §34/§39/§44 home; inline references cite the table. | — | — | S | PROD-040 |

### Phase 3.5
| Cluster ID | Count | Sample IDs | Class | Sections | Summary | Recommendation | Owner | Pack | Effort | Linear ID |
|---|---:|---|---|---|---|---|---|---|---|---|
| BL-P1-PH35-API | 1 | D-3.5-020 | api | §6.8 | 1 P1 api defects in Phase 3.5 | Author endpoint spec per §32: method/path/auth/rate-limit/cursor/schema/errors/idempotency. | engineering + security | M02.3 | S | PROD-041 |
| BL-P1-PH35-DRIFT | 2 | D-3.5-008, D-3.5-038 | consistency_drift | §6.8.1, §40.2 | 2 P1 consistency_drift defects in Phase 3.5 | Normalize cross-doc/cross-section terminology; cite single authoritative home. | legal + engineering | — | S | DOC-008 |
| BL-P1-PH35-DM | 2 | D-3.5-016, D-3.5-018 | data_model | §6.8.4.1, §6.8.6 | 2 P1 data_model defects in Phase 3.5 | Author missing entity field tables / retention / scope-isolation per §4 conventions. | engineering | M02.3 | S | PROD-042 |
| BL-P1-PH35-DSAR | 8 | D-3.5-007, D-3.5-010, D-3.5-012, D-3.5-013, D-3.5-019 … +3 more | dsar | §6.8.1, §33.4, §22.3.1, §33.5, §6.8.4 +2 more | 8 P1 dsar defects in Phase 3.5 | Author §6.8 DSAR cascade row with subject-rights coverage and erasure handling. | engineering + legal | M11.3 | M | PROD-043 |
| BL-P1-PH35-ENUM | 1 | D-3.5-015 | enum | §6.8.4 | 1 P1 enum defects in Phase 3.5 | Register missing enum values in Appendix J and cite source location. | engineering | M02.3 | S | PROD-044 |
| BL-P1-PH35-NOTIF | 1 | D-3.5-017 | notification | §6.8.4 | 1 P1 notification defects in Phase 3.5 | Register notification in Appendix C with channel × role × plan-gating matrix. | engineering + analytics | M02.3 | S | PROD-045 |
| BL-P1-PH35-NUM | 1 | D-3.5-009 | numerical_singleton | §33.4 | 1 P1 numerical_singleton defects in Phase 3.5 | Move number to one §34/§39/§44 home; inline references cite the table. | — | — | S | PROD-046 |
| BL-P1-PH35-RET | 2 | D-3.5-011, D-3.5-022 | retention | §6.8.5 | 2 P1 retention defects in Phase 3.5 | Add §40.2 retention row per data class with TTL, anonymization, DSAR cascade. | — | — | S | PROD-047 |

### Phase 4.2
| Cluster ID | Count | Sample IDs | Class | Sections | Summary | Recommendation | Owner | Pack | Effort | Linear ID |
|---|---:|---|---|---|---|---|---|---|---|---|
| BL-P1-PH42-ACC | 3 | D-4.2-012, D-4.2-013, D-4.2-024 | acceptance_criteria | §10.6, §10.2, §10.5 | 3 P1 acceptance_criteria defects in Phase 4.2 | Author numbered, testable, observable AC blocks per §13.10 style. | engineering + design | — | S | PROD-048 |
| BL-P1-PH42-API | 5 | D-4.2-002, D-4.2-003, D-4.2-011, D-4.2-018, D-4.2-023 | api | §10.16.1, §10.16, §10.16.2 | 5 P1 api defects in Phase 4.2 | Author endpoint spec per §32: method/path/auth/rate-limit/cursor/schema/errors/idempotency. | engineering | M02.3 | M | PROD-049 |
| BL-P1-PH42-DM | 1 | D-4.2-020 | data_model | §10.13.5 | 1 P1 data_model defects in Phase 4.2 | Author missing entity field tables / retention / scope-isolation per §4 conventions. | engineering | M02.3 | S | PROD-050 |
| BL-P1-PH42-ENUM | 2 | D-4.2-007, D-4.2-015 | enum | §10.2, §10.14.1 | 2 P1 enum defects in Phase 4.2 | Register missing enum values in Appendix J and cite source location. | engineering | M02.3 | S | PROD-051 |
| BL-P1-PH42-EC | 3 | D-4.2-004, D-4.2-005, D-4.2-006 | error_code | §10.10, §2.8, §10.1.1 | 3 P1 error_code defects in Phase 4.2 | Add Appendix I row with HTTP status, retry semantics, user-facing copy. | engineering | M02.3 | S | PROD-052 |
| BL-P1-PH42-NOTIF | 2 | D-4.2-016, D-4.2-022 | notification | §10.14.5, §10.14.3 | 2 P1 notification defects in Phase 4.2 | Register notification in Appendix C with channel × role × plan-gating matrix. | engineering | M02.3 | S | PROD-053 |
| BL-P1-PH42-NUM | 1 | D-4.2-010 | numerical_singleton | §10.13 | 1 P1 numerical_singleton defects in Phase 4.2 | Move number to one §34/§39/§44 home; inline references cite the table. | engineering | — | S | PROD-054 |
| BL-P1-PH42-PLAN | 2 | D-4.2-014, D-4.2-019 | plan_gating | §10 | 2 P1 plan_gating defects in Phase 4.2 | Add §5.11 / §34.1 / §39 rows; never duplicate inline; cite the table. | engineering + pricing | — | S | PROD-055 |
| BL-P1-PH42-SM | 3 | D-4.2-008, D-4.2-009, D-4.2-021 | state_machine | §10, §10.13, §10.12 | 3 P1 state_machine defects in Phase 4.2 | Replace prose with From/To/Trigger/Conditions table; cover concurrency / re-drive. | engineering | — | S | PROD-056 |
| BL-P1-PH42-WH | 1 | D-4.2-017 | webhook | §10.14.2 | 1 P1 webhook defects in Phase 4.2 | Author webhook per §31: HMAC, idempotency, backoff, DLQ, Appendix C+G registration. | engineering | M02.3 | S | PROD-057 |

### Phase 34.PXC
| Cluster ID | Count | Sample IDs | Class | Sections | Summary | Recommendation | Owner | Pack | Effort | Linear ID |
|---|---:|---|---|---|---|---|---|---|---|---|
| BL-P1-PH34PXC-CI | 1 | D-PXC-014 | ci_gate | §34.17.4 | 1 P1 ci_gate defects in Phase 34.PXC | Promote gate from spec_binding_pending to runtime_active under M02.3 / release. | engineering | release-orchestration | S | PROD-058 |
| BL-P1-PH34PXC-DOC | 2 | D-PXC-001, D-PXC-013 | documentation_gap | §34.1, §34.17.1 | 2 P1 documentation_gap defects in Phase 34.PXC | Author missing spec content; cite authoritative source-of-truth. | engineering | — | S | DOC-009 |
| BL-P1-PH34PXC-NUM | 3 | D-PXC-003, D-PXC-004, D-PXC-010 | numerical_singleton | §34.14.1, §34.16.2 | 3 P1 numerical_singleton defects in Phase 34.PXC | Move number to one §34/§39/§44 home; inline references cite the table. | pricing | — | S | PROD-059 |
| BL-P1-PH34PXC-PLAN | 4 | D-PXC-005, D-PXC-009, D-PXC-011, D-PXC-015 | plan_gating | §34.14.1, §34.16.1, §34.16.2, §34.18.5 | 4 P1 plan_gating defects in Phase 34.PXC | Add §5.11 / §34.1 / §39 rows; never duplicate inline; cite the table. | pricing | — | M | PROD-060 |

### Phase 45
| Cluster ID | Count | Sample IDs | Class | Sections | Summary | Recommendation | Owner | Pack | Effort | Linear ID |
|---|---:|---|---|---|---|---|---|---|---|---|
| BL-P1-PH45-ACC | 1 | D-45-001 | acceptance_criteria | §45.4 | 1 P1 acceptance_criteria defects in Phase 45 | Author numbered, testable, observable AC blocks per §13.10 style. | engineering | — | S | PROD-061 |
| BL-P1-PH45-DOC | 4 | D-45-004, D-45-005, D-45-008, D-45-010 | documentation_gap | §45.3, §45.1, §45.2, §22 | 4 P1 documentation_gap defects in Phase 45 | Author missing spec content; cite authoritative source-of-truth. | engineering | M11.3 | M | DOC-010 |
| BL-P1-PH45-NUM | 1 | D-45-002 | numerical_singleton | §45.4 | 1 P1 numerical_singleton defects in Phase 45 | Move number to one §34/§39/§44 home; inline references cite the table. | engineering | — | S | PROD-062 |
| BL-P1-PH45-RBAC | 1 | D-45-009 | rbac | §32.4 | 1 P1 rbac defects in Phase 45 | Add missing §5.11 Feature Access Matrix rows per role × action × column. | — | — | S | PROD-063 |
| BL-P1-PH45-SM | 1 | D-45-003 | state_machine | §45.3 | 1 P1 state_machine defects in Phase 45 | Replace prose with From/To/Trigger/Conditions table; cover concurrency / re-drive. | engineering | — | S | PROD-064 |

### Phase 41
| Cluster ID | Count | Sample IDs | Class | Sections | Summary | Recommendation | Owner | Pack | Effort | Linear ID |
|---|---:|---|---|---|---|---|---|---|---|---|
| BL-P1-PH41-ACC | 1 | D-41-008 | acceptance_criteria | §41.5 | 1 P1 acceptance_criteria defects in Phase 41 | Author numbered, testable, observable AC blocks per §13.10 style. | engineering | — | S | PROD-065 |
| BL-P1-PH41-DRIFT | 1 | D-41-004 | consistency_drift | §41.3 | 1 P1 consistency_drift defects in Phase 41 | Normalize cross-doc/cross-section terminology; cite single authoritative home. | engineering + legal | — | S | DOC-011 |
| BL-P1-PH41-DM | 1 | D-41-007 | data_model | §41 | 1 P1 data_model defects in Phase 41 | Author missing entity field tables / retention / scope-isolation per §4 conventions. | — | M02.3 | S | PROD-066 |
| BL-P1-PH41-DOC | 4 | D-41-001, D-41-002, D-41-003, D-41-005 | documentation_gap | §41.3, §41, §41.1 | 4 P1 documentation_gap defects in Phase 41 | Author missing spec content; cite authoritative source-of-truth. | engineering | — | M | DOC-012 |
| BL-P1-PH41-NOTIF | 1 | D-41-014 | notification | §41.2 | 1 P1 notification defects in Phase 41 | Register notification in Appendix C with channel × role × plan-gating matrix. | engineering | M02.3 | S | PROD-067 |
| BL-P1-PH41-PLAN | 1 | D-41-006 | plan_gating | §41 | 1 P1 plan_gating defects in Phase 41 | Add §5.11 / §34.1 / §39 rows; never duplicate inline; cite the table. | — | — | S | PROD-068 |
| BL-P1-PH41-RET | 1 | D-41-012 | retention | §40.2 | 1 P1 retention defects in Phase 41 | Add §40.2 retention row per data class with TTL, anonymization, DSAR cascade. | engineering + legal + ops | — | S | PROD-069 |

### Phase 3UX
| Cluster ID | Count | Sample IDs | Class | Sections | Summary | Recommendation | Owner | Pack | Effort | Linear ID |
|---|---:|---|---|---|---|---|---|---|---|---|
| BL-P1-PH3UX-DM | 1 | D-3UX-010 | data_model | §3.11.1 | 1 P1 data_model defects in Phase 3UX | Author missing entity field tables / retention / scope-isolation per §4 conventions. | Constraints | M02.3 | S | PROD-070 |
| BL-P1-PH3UX-ENUM | 1 | D-3UX-022 | enum | §4.3.14 | 1 P1 enum defects in Phase 3UX | Register missing enum values in Appendix J and cite source location. | — | M02.3 | S | PROD-071 |

### Phase 3 (Audit, Second Pass)
| Cluster ID | Count | Sample IDs | Class | Sections | Summary | Recommendation | Owner | Pack | Effort | Linear ID |
|---|---:|---|---|---|---|---|---|---|---|---|
| BL-P1-PH3-ACC | 1 | D-3UX-028 | acceptance_criteria | §3.14 | 1 P1 acceptance_criteria defects in Phase 3 (Audit, Second Pass) | Author numbered, testable, observable AC blocks per §13.10 style. | engineering + design | M24.3 | S | PROD-072 |
| BL-P1-PH3-DM | 1 | D-3UX-021 | data_model | §3.8.1 | 1 P1 data_model defects in Phase 3 (Audit, Second Pass) | Author missing entity field tables / retention / scope-isolation per §4 conventions. | engineering | M02.3 | S | PROD-073 |

### Phase 11
| Cluster ID | Count | Sample IDs | Class | Sections | Summary | Recommendation | Owner | Pack | Effort | Linear ID |
|---|---:|---|---|---|---|---|---|---|---|---|
| BL-P1-PH11-SE | 3 | D-11.1-001, D-11.1-002, D-11.1-003 | surface_engine_mapping | §50, §51, §25.2.3 | 3 P1 surface_engine_mapping defects in Phase 11 | Author Appendix M row with companion-doc anchor, tier visibility, override. | engineering | — | S | PROD-074 |

### Phase 11.1
| Cluster ID | Count | Sample IDs | Class | Sections | Summary | Recommendation | Owner | Pack | Effort | Linear ID |
|---|---:|---|---|---|---|---|---|---|---|---|
| BL-P1-PH111-SE | 1 | D-11.1-004 | surface_engine_mapping | §8.3.1 | 1 P1 surface_engine_mapping defects in Phase 11.1 | Author Appendix M row with companion-doc anchor, tier visibility, override. | — | — | S | PROD-075 |

### Phase 48
| Cluster ID | Count | Sample IDs | Class | Sections | Summary | Recommendation | Owner | Pack | Effort | Linear ID |
|---|---:|---|---|---|---|---|---|---|---|---|
| BL-P1-PH48-GROW | 3 | D-48-001, D-48-002, D-48-003 | growth_mechanic_gap | §48.5, §48.5.4 | 3 P1 growth_mechanic_gap defects in Phase 48 | Author §48 growth-mechanic loop row with conversion gate and amplifier. | analytics + product | — | S | DOC-013 |
| BL-P1-PH48-NUM | 1 | D-48-004 | numerical_singleton | §48.7.1 | 1 P1 numerical_singleton defects in Phase 48 | Move number to one §34/§39/§44 home; inline references cite the table. | — | — | S | PROD-076 |

### Phase CONS
| Cluster ID | Count | Sample IDs | Class | Sections | Summary | Recommendation | Owner | Pack | Effort | Linear ID |
|---|---:|---|---|---|---|---|---|---|---|---|
| BL-P1-PHCONS-DOC | 1 | D-CONS-006 | documentation_gap | DEFECT_LEDGER.md — 78 duplicat | 1 P1 documentation_gap defects in Phase CONS | Author missing spec content; cite authoritative source-of-truth. | audit + engineering | — | S | DOC-014 |

### Phase 2 — §2 (The Sourcera Method) End-to-End Audit
| Cluster ID | Count | Sample IDs | Class | Sections | Summary | Recommendation | Owner | Pack | Effort | Linear ID |
|---|---:|---|---|---|---|---|---|---|---|---|
| BL-P1-PH2-ACC | 4 | D-2-005, D-2-042, D-12-007, D-12-010 | acceptance_criteria | §2.3.1, §2.1, §12.4.2, §12.7.2 | 4 P1 acceptance_criteria defects in Phase 2 — §2 (The Sourcera Method) End-to-End Audit | Author numbered, testable, observable AC blocks per §13.10 style. | engineering | — | M | PROD-077 |
| BL-P1-PH2-API | 2 | D-2-028, D-12-003 | api | §10.16.1, §12 | 2 P1 api defects in Phase 2 — §2 (The Sourcera Method) End-to-End Audit | Author endpoint spec per §32: method/path/auth/rate-limit/cursor/schema/errors/idempotency. | engineering | M02.3 | S | PROD-078 |
| BL-P1-PH2-CONC | 1 | D-2-037 | concurrency | §2.8.5 | 1 P1 concurrency defects in Phase 2 — §2 (The Sourcera Method) End-to-End Audit | Author concurrency contract: serialization, last-write-wins or merge semantics. | engineering | — | S | PROD-079 |
| BL-P1-PH2-DRIFT | 2 | D-2-014, D-2-015 | consistency_drift | §2.5.1 | 2 P1 consistency_drift defects in Phase 2 — §2 (The Sourcera Method) End-to-End Audit | Normalize cross-doc/cross-section terminology; cite single authoritative home. | product | — | S | DOC-015 |
| BL-P1-PH2-DM | 3 | D-2-024, D-12-001, D-12-009 | data_model | §2.7, §12.4, §12.5.1 | 3 P1 data_model defects in Phase 2 — §2 (The Sourcera Method) End-to-End Audit | Author missing entity field tables / retention / scope-isolation per §4 conventions. | engineering | M02.3 | S | PROD-080 |
| BL-P1-PH2-EDGE | 1 | D-2-033 | edge_case_silence | §2.8.1 | 1 P1 edge_case_silence defects in Phase 2 — §2 (The Sourcera Method) End-to-End Audit | Specify behavior across all §12 Edge-Case Discipline axes. | engineering | — | S | PROD-081 |
| BL-P1-PH2-ENT | 1 | D-12-018 | entitlement | §12.8.2 | 1 P1 entitlement defects in Phase 2 — §2 (The Sourcera Method) End-to-End Audit | Add §34.8 entitlement matrix row with plan × capability × enforcement-mode. | pricing + engineering | — | S | PROD-082 |
| BL-P1-PH2-ENUM | 1 | D-12-006 | enum | §12.3.2 | 1 P1 enum defects in Phase 2 — §2 (The Sourcera Method) End-to-End Audit | Register missing enum values in Appendix J and cite source location. | engineering | M02.3 | S | PROD-083 |
| BL-P1-PH2-FW | 1 | D-12-022 | firewall_leakage | §12 | 1 P1 firewall_leakage defects in Phase 2 — §2 (The Sourcera Method) End-to-End Audit | Add console firewall guard with redaction-verification-hash invariant. | engineering + security | — | S | PROD-084 |
| BL-P1-PH2-MOB | 1 | D-2-036 | mobile_divergence | §2.8 | 1 P1 mobile_divergence defects in Phase 2 — §2 (The Sourcera Method) End-to-End Audit | Author §38 mobile parity row: touch targets, layout, degraded states. | engineering | M24.3 | S | PROD-085 |
| BL-P1-PH2-NUM | 4 | D-2-001, D-2-009, D-2-013, D-12-005 | numerical_singleton | §2.1, §2.4.1, §2.5.1, §12.4.1 | 4 P1 numerical_singleton defects in Phase 2 — §2 (The Sourcera Method) End-to-End Audit | Move number to one §34/§39/§44 home; inline references cite the table. | product | — | M | PROD-086 |
| BL-P1-PH2-PLAN | 2 | D-2-004, D-12-011 | plan_gating | §2.2.3, §12.8.1 | 2 P1 plan_gating defects in Phase 2 — §2 (The Sourcera Method) End-to-End Audit | Add §5.11 / §34.1 / §39 rows; never duplicate inline; cite the table. | engineering | — | S | PROD-087 |
| BL-P1-PH2-RET | 1 | D-12-013 | retention | §12.2 | 1 P1 retention defects in Phase 2 — §2 (The Sourcera Method) End-to-End Audit | Add §40.2 retention row per data class with TTL, anonymization, DSAR cascade. | security + legal + engineering | — | S | PROD-088 |
| BL-P1-PH2-SM | 2 | D-2-002, D-12-002 | state_machine | §2.2.1, §12 | 2 P1 state_machine defects in Phase 2 — §2 (The Sourcera Method) End-to-End Audit | Replace prose with From/To/Trigger/Conditions table; cover concurrency / re-drive. | engineering | — | S | PROD-089 |
| BL-P1-PH2-SE | 1 | D-12-012 | surface_engine_mapping | §12 | 1 P1 surface_engine_mapping defects in Phase 2 — §2 (The Sourcera Method) End-to-End Audit | Author Appendix M row with companion-doc anchor, tier visibility, override. | engineering + design | — | S | PROD-090 |
| BL-P1-PH2-WH | 1 | D-12-004 | webhook | §12 | 1 P1 webhook defects in Phase 2 — §2 (The Sourcera Method) End-to-End Audit | Author webhook per §31: HMAC, idempotency, backoff, DLQ, Appendix C+G registration. | engineering | M02.3 | S | PROD-091 |

### Phase 4 — Prompt 4.4 — §13 Scoring & Grading End-to-End Audit
| Cluster ID | Count | Sample IDs | Class | Sections | Summary | Recommendation | Owner | Pack | Effort | Linear ID |
|---|---:|---|---|---|---|---|---|---|---|---|
| BL-P1-PH4P44-ACC | 2 | D-4.4-010, D-4.4-013 | acceptance_criteria | §13.12, §13.5.2 | 2 P1 acceptance_criteria defects in Phase 4 — Prompt 4.4 — §13 Scoring & Grading End-to-End Audit | Author numbered, testable, observable AC blocks per §13.10 style. | engineering + design + product | — | S | PROD-092 |
| BL-P1-PH4P44-API | 2 | D-4.4-006, D-4.4-007 | api | §13.11.8 | 2 P1 api defects in Phase 4 — Prompt 4.4 — §13 Scoring & Grading End-to-End Audit | Author endpoint spec per §32: method/path/auth/rate-limit/cursor/schema/errors/idempotency. | engineering | M02.3 | S | PROD-093 |
| BL-P1-PH4P44-DM | 1 | D-4.4-003 | data_model | §13.5.1 | 1 P1 data_model defects in Phase 4 — Prompt 4.4 — §13 Scoring & Grading End-to-End Audit | Author missing entity field tables / retention / scope-isolation per §4 conventions. | engineering | M02.3 | S | PROD-094 |
| BL-P1-PH4P44-NUM | 6 | D-4.4-001, D-4.4-002, D-4.4-004, D-4.4-005, D-4.4-011 … +1 more | numerical_singleton | §13.11.7, §13.4.2, §13.6.2, §13.11.5 | 6 P1 numerical_singleton defects in Phase 4 — Prompt 4.4 — §13 Scoring & Grading End-to-End Audit | Move number to one §34/§39/§44 home; inline references cite the table. | engineering | — | M | PROD-095 |
| BL-P1-PH4P44-PLAN | 1 | D-4.4-009 | plan_gating | §13.11.13 | 1 P1 plan_gating defects in Phase 4 — Prompt 4.4 — §13 Scoring & Grading End-to-End Audit | Add §5.11 / §34.1 / §39 rows; never duplicate inline; cite the table. | engineering + QA | — | S | PROD-096 |
| BL-P1-PH4P44-SM | 1 | D-4.4-008 | state_machine | §13.11.9 | 1 P1 state_machine defects in Phase 4 — Prompt 4.4 — §13 Scoring & Grading End-to-End Audit | Replace prose with From/To/Trigger/Conditions table; cover concurrency / re-drive. | engineering | — | S | PROD-097 |
| BL-P1-PH4P44-WH | 1 | D-4.4-014 | webhook | §13.11.10 | 1 P1 webhook defects in Phase 4 — Prompt 4.4 — §13 Scoring & Grading End-to-End Audit | Author webhook per §31: HMAC, idempotency, backoff, DLQ, Appendix C+G registration. | pending | M02.3 | S | PROD-098 |

### Phase 4.5 — §14 Scenario Modeling Walk
| Cluster ID | Count | Sample IDs | Class | Sections | Summary | Recommendation | Owner | Pack | Effort | Linear ID |
|---|---:|---|---|---|---|---|---|---|---|---|
| BL-P1-PH45-API | 1 | D-4.5-006 | api | §14 | 1 P1 api defects in Phase 4.5 — §14 Scenario Modeling Walk | Author endpoint spec per §32: method/path/auth/rate-limit/cursor/schema/errors/idempotency. | engineering | M02.3 | S | PROD-099 |
| BL-P1-PH45-DM | 1 | D-4.5-002 | data_model | §14.2.1 | 1 P1 data_model defects in Phase 4.5 — §14 Scenario Modeling Walk | Author missing entity field tables / retention / scope-isolation per §4 conventions. | engineering | M02.3 | S | PROD-100 |
| BL-P1-PH45-ENT | 1 | D-4.5-011 | entitlement | §14 | 1 P1 entitlement defects in Phase 4.5 — §14 Scenario Modeling Walk | Add §34.8 entitlement matrix row with plan × capability × enforcement-mode. | engineering + pricing | — | S | PROD-101 |
| BL-P1-PH45-PLAN | 3 | D-4.5-003, D-4.5-004, D-4.5-005 | plan_gating | §14.9.5, §14.8.1 | 3 P1 plan_gating defects in Phase 4.5 — §14 Scenario Modeling Walk | Add §5.11 / §34.1 / §39 rows; never duplicate inline; cite the table. | engineering + pricing | — | S | PROD-102 |
| BL-P1-PH45-SM | 1 | D-4.5-009 | state_machine | §14.6 | 1 P1 state_machine defects in Phase 4.5 — §14 Scenario Modeling Walk | Replace prose with From/To/Trigger/Conditions table; cover concurrency / re-drive. | engineering | — | S | PROD-103 |
| BL-P1-PH45-SE | 1 | D-4.5-015 | surface_engine_mapping | §14 | 1 P1 surface_engine_mapping defects in Phase 4.5 — §14 Scenario Modeling Walk | Author Appendix M row with companion-doc anchor, tier visibility, override. | engineering + design | — | S | PROD-104 |
| BL-P1-PH45-WH | 1 | D-4.5-007 | webhook | §14 | 1 P1 webhook defects in Phase 4.5 — §14 Scenario Modeling Walk | Author webhook per §31: HMAC, idempotency, backoff, DLQ, Appendix C+G registration. | engineering | M02.3 | S | PROD-105 |

### Phase 4 — Prompt 4.6 — §15 TCO Modeling End-to-End Audit
| Cluster ID | Count | Sample IDs | Class | Sections | Summary | Recommendation | Owner | Pack | Effort | Linear ID |
|---|---:|---|---|---|---|---|---|---|---|---|
| BL-P1-PH4P46-ACC | 3 | D-4.6-009, D-4.6-014, D-4.7-004 | acceptance_criteria | §15.4.2, §15.2.3, §16.3 | 3 P1 acceptance_criteria defects in Phase 4 — Prompt 4.6 — §15 TCO Modeling End-to-End Audit | Author numbered, testable, observable AC blocks per §13.10 style. | engineering | — | S | PROD-106 |
| BL-P1-PH4P46-API | 2 | D-4.6-007, D-4.7-013 | api | §15, §32.5 | 2 P1 api defects in Phase 4 — Prompt 4.6 — §15 TCO Modeling End-to-End Audit | Author endpoint spec per §32: method/path/auth/rate-limit/cursor/schema/errors/idempotency. | engineering | M02.3 | S | PROD-107 |
| BL-P1-PH4P46-DM | 6 | D-4.6-001, D-4.6-002, D-4.6-003, D-4.7-001, D-4.7-002 … +1 more | data_model | §15.3.1, §15.2.2, §15.5.1, §4.3.7, §16.2.2 | 6 P1 data_model defects in Phase 4 — Prompt 4.6 — §15 TCO Modeling End-to-End Audit | Author missing entity field tables / retention / scope-isolation per §4 conventions. | engineering | M02.3 | M | PROD-108 |
| BL-P1-PH4P46-DSAR | 2 | D-4.7-010, D-4.7-011 | dsar | §6.8.4, §16.2.2 | 2 P1 dsar defects in Phase 4 — Prompt 4.6 — §15 TCO Modeling End-to-End Audit | Author §6.8 DSAR cascade row with subject-rights coverage and erasure handling. | engineering + security + legal | — | S | PROD-109 |
| BL-P1-PH4P46-ENUM | 3 | D-4.6-012, D-4.6-013, D-4.7-014 | enum | §15.5.2, §15.2.3, §4.3.7 | 3 P1 enum defects in Phase 4 — Prompt 4.6 — §15 TCO Modeling End-to-End Audit | Register missing enum values in Appendix J and cite source location. | engineering | M02.3 | S | PROD-110 |
| BL-P1-PH4P46-FW | 1 | D-4.6-011 | firewall_leakage | §15 | 1 P1 firewall_leakage defects in Phase 4 — Prompt 4.6 — §15 TCO Modeling End-to-End Audit | Add console firewall guard with redaction-verification-hash invariant. | — | — | S | PROD-111 |
| BL-P1-PH4P46-NUM | 2 | D-4.6-005, D-4.6-006 | numerical_singleton | §15.6.1, §15.2.2 | 2 P1 numerical_singleton defects in Phase 4 — Prompt 4.6 — §15 TCO Modeling End-to-End Audit | Move number to one §34/§39/§44 home; inline references cite the table. | engineering + pricing | — | S | PROD-112 |
| BL-P1-PH4P46-PLAN | 3 | D-4.6-004, D-4.7-005, D-4.7-006 | plan_gating | §15.7.5, §16, §16.9.1 | 3 P1 plan_gating defects in Phase 4 — Prompt 4.6 — §15 TCO Modeling End-to-End Audit | Add §5.11 / §34.1 / §39 rows; never duplicate inline; cite the table. | engineering + pricing | — | S | PROD-113 |
| BL-P1-PH4P46-RES | 1 | D-4.7-008 | residency | §16 | 1 P1 residency defects in Phase 4 — Prompt 4.6 — §15 TCO Modeling End-to-End Audit | Add §1.6 / §40 / §42 residency clause for US/EU/custom region behavior. | engineering + security + legal | — | S | PROD-114 |
| BL-P1-PH4P46-RET | 2 | D-4.6-010, D-4.7-012 | retention | §15, §40.2 | 2 P1 retention defects in Phase 4 — Prompt 4.6 — §15 TCO Modeling End-to-End Audit | Add §40.2 retention row per data class with TTL, anonymization, DSAR cascade. | engineering + security + legal | — | S | PROD-115 |
| BL-P1-PH4P46-WH | 1 | D-4.6-008 | webhook | §15 | 1 P1 webhook defects in Phase 4 — Prompt 4.6 — §15 TCO Modeling End-to-End Audit | Author webhook per §31: HMAC, idempotency, backoff, DLQ, Appendix C+G registration. | engineering + analytics | M02.3 | S | PROD-116 |

### Phase S17 — §17 Workspace Analytics End-to-End Audit
| Cluster ID | Count | Sample IDs | Class | Sections | Summary | Recommendation | Owner | Pack | Effort | Linear ID |
|---|---:|---|---|---|---|---|---|---|---|---|
| BL-P1-PHS17-API | 1 | D-S17-002 | api | §17.5 | 1 P1 api defects in Phase S17 — §17 Workspace Analytics End-to-End Audit | Author endpoint spec per §32: method/path/auth/rate-limit/cursor/schema/errors/idempotency. | engineering | M02.3 | S | PROD-117 |
| BL-P1-PHS17-DM | 2 | D-S17-005, D-S17-012 | data_model | §17, §17.7.1 | 2 P1 data_model defects in Phase S17 — §17 Workspace Analytics End-to-End Audit | Author missing entity field tables / retention / scope-isolation per §4 conventions. | engineering | M02.3 | S | PROD-118 |
| BL-P1-PHS17-INSTR | 1 | D-S17-004 | instrumentation_gap | §17 | 1 P1 instrumentation_gap defects in Phase S17 — §17 Workspace Analytics End-to-End Audit | Author Appendix G PostHog + Datadog metric + AuditEvent triad. | analytics | — | S | PROD-119 |
| BL-P1-PHS17-NUM | 2 | D-S17-010, D-S17-024 | numerical_singleton | §17.3.3, §17.3.6 | 2 P1 numerical_singleton defects in Phase S17 — §17 Workspace Analytics End-to-End Audit | Move number to one §34/§39/§44 home; inline references cite the table. | engineering | — | S | PROD-120 |
| BL-P1-PHS17-PERF | 1 | D-S17-006 | performance_budget | §17 | 1 P1 performance_budget defects in Phase S17 — §17 Workspace Analytics End-to-End Audit | Author §44 performance budget row with p95/p99 SLO and degradation behavior. | engineering | M24.3 | S | PROD-121 |
| BL-P1-PHS17-PLAN | 2 | D-S17-001, D-S17-016 | plan_gating | §17.5.1 | 2 P1 plan_gating defects in Phase S17 — §17 Workspace Analytics End-to-End Audit | Add §5.11 / §34.1 / §39 rows; never duplicate inline; cite the table. | engineering | — | S | PROD-122 |
| BL-P1-PHS17-RBAC | 1 | D-S17-019 | rbac | §5.11 | 1 P1 rbac defects in Phase S17 — §17 Workspace Analytics End-to-End Audit | Add missing §5.11 Feature Access Matrix rows per role × action × column. | engineering | — | S | PROD-123 |
| BL-P1-PHS17-RET | 1 | D-S17-015 | retention | §17 | 1 P1 retention defects in Phase S17 — §17 Workspace Analytics End-to-End Audit | Add §40.2 retention row per data class with TTL, anonymization, DSAR cascade. | engineering | — | S | PROD-124 |
| BL-P1-PHS17-SE | 1 | D-S17-009b | surface_engine_mapping | Appendix M line 47845 | 1 P1 surface_engine_mapping defects in Phase S17 — §17 Workspace Analytics End-to-End Audit | Author Appendix M row with companion-doc anchor, tier visibility, override. | engineering | — | S | PROD-125 |
| BL-P1-PHS17-WH | 1 | D-S17-003 | webhook | §17.5 | 1 P1 webhook defects in Phase S17 — §17 Workspace Analytics End-to-End Audit | Author webhook per §31: HMAC, idempotency, backoff, DLQ, Appendix C+G registration. | engineering | M02.3 | S | PROD-126 |

### Phase 4 — Prompt 4.9 — §18 Q&A Threads End-to-End Audit
| Cluster ID | Count | Sample IDs | Class | Sections | Summary | Recommendation | Owner | Pack | Effort | Linear ID |
|---|---:|---|---|---|---|---|---|---|---|---|
| BL-P1-PH4P49-API | 1 | D-4.9-008 | api | §32 | 1 P1 api defects in Phase 4 — Prompt 4.9 — §18 Q&A Threads End-to-End Audit | Author endpoint spec per §32: method/path/auth/rate-limit/cursor/schema/errors/idempotency. | engineering | M02.3 | S | PROD-127 |
| BL-P1-PH4P49-DM | 2 | D-4.9-001, D-4.9-002 | data_model | §18.3.1 | 2 P1 data_model defects in Phase 4 — Prompt 4.9 — §18 Q&A Threads End-to-End Audit | Author missing entity field tables / retention / scope-isolation per §4 conventions. | engineering | M02.3 | S | PROD-128 |
| BL-P1-PH4P49-DSAR | 1 | D-4.9-007 | dsar | §18 | 1 P1 dsar defects in Phase 4 — Prompt 4.9 — §18 Q&A Threads End-to-End Audit | Author §6.8 DSAR cascade row with subject-rights coverage and erasure handling. | engineering + security | — | S | PROD-129 |
| BL-P1-PH4P49-ENUM | 1 | D-4.9-012 | enum | §18.3.1 | 1 P1 enum defects in Phase 4 — Prompt 4.9 — §18 Q&A Threads End-to-End Audit | Register missing enum values in Appendix J and cite source location. | engineering | M02.3 | S | PROD-130 |
| BL-P1-PH4P49-EC | 1 | D-4.9-009 | error_code | §18 | 1 P1 error_code defects in Phase 4 — Prompt 4.9 — §18 Q&A Threads End-to-End Audit | Add Appendix I row with HTTP status, retry semantics, user-facing copy. | engineering | M02.3 | S | PROD-131 |
| BL-P1-PH4P49-FW | 1 | D-4.9-003 | firewall_leakage | §18.3.2 | 1 P1 firewall_leakage defects in Phase 4 — Prompt 4.9 — §18 Q&A Threads End-to-End Audit | Add console firewall guard with redaction-verification-hash invariant. | engineering + security | — | S | PROD-132 |
| BL-P1-PH4P49-NOTIF | 1 | D-4.9-005 | notification | §18.5.3 | 1 P1 notification defects in Phase 4 — Prompt 4.9 — §18 Q&A Threads End-to-End Audit | Register notification in Appendix C with channel × role × plan-gating matrix. | engineering + ops | M02.3 | S | PROD-133 |
| BL-P1-PH4P49-NUM | 1 | D-4.9-010 | numerical_singleton | §18.7.1 | 1 P1 numerical_singleton defects in Phase 4 — Prompt 4.9 — §18 Q&A Threads End-to-End Audit | Move number to one §34/§39/§44 home; inline references cite the table. | engineering + pricing | — | S | PROD-134 |
| BL-P1-PH4P49-RES | 1 | D-4.9-013 | residency | §18 | 1 P1 residency defects in Phase 4 — Prompt 4.9 — §18 Q&A Threads End-to-End Audit | Add §1.6 / §40 / §42 residency clause for US/EU/custom region behavior. | engineering + security | — | S | PROD-135 |
| BL-P1-PH4P49-RET | 1 | D-4.9-006 | retention | §18.5.2 | 1 P1 retention defects in Phase 4 — Prompt 4.9 — §18 Q&A Threads End-to-End Audit | Add §40.2 retention row per data class with TTL, anonymization, DSAR cascade. | — | — | S | PROD-136 |
| BL-P1-PH4P49-SM | 1 | D-4.9-015 | state_machine | §18.2 | 1 P1 state_machine defects in Phase 4 — Prompt 4.9 — §18 Q&A Threads End-to-End Audit | Replace prose with From/To/Trigger/Conditions table; cover concurrency / re-drive. | — | — | S | PROD-137 |
| BL-P1-PH4P49-SE | 1 | D-4.9-014 | surface_engine_mapping | §18 | 1 P1 surface_engine_mapping defects in Phase 4 — Prompt 4.9 — §18 Q&A Threads End-to-End Audit | Author Appendix M row with companion-doc anchor, tier visibility, override. | engineering + security | — | S | PROD-138 |
| BL-P1-PH4P49-WH | 1 | D-4.9-004 | webhook | §18.5.3 | 1 P1 webhook defects in Phase 4 — Prompt 4.9 — §18 Q&A Threads End-to-End Audit | Author webhook per §31: HMAC, idempotency, backoff, DLQ, Appendix C+G registration. | engineering + analytics | M02.3 | S | PROD-139 |

### Phase 4 — Prompt 4.10 — §19 Template Library End-to-End Audit
| Cluster ID | Count | Sample IDs | Class | Sections | Summary | Recommendation | Owner | Pack | Effort | Linear ID |
|---|---:|---|---|---|---|---|---|---|---|---|
| BL-P1-PH4P410-API | 2 | D-4.10-006, D-4.10-016 | api | §19, §19.4.3 | 2 P1 api defects in Phase 4 — Prompt 4.10 — §19 Template Library End-to-End Audit | Author endpoint spec per §32: method/path/auth/rate-limit/cursor/schema/errors/idempotency. | engineering | M02.3 | S | PROD-140 |
| BL-P1-PH4P410-DM | 1 | D-4.10-001 | data_model | §19 | 1 P1 data_model defects in Phase 4 — Prompt 4.10 — §19 Template Library End-to-End Audit | Author missing entity field tables / retention / scope-isolation per §4 conventions. | engineering | M02.3 | S | PROD-141 |
| BL-P1-PH4P410-ENUM | 1 | D-4.10-011 | enum | §19.3.1 | 1 P1 enum defects in Phase 4 — Prompt 4.10 — §19 Template Library End-to-End Audit | Register missing enum values in Appendix J and cite source location. | engineering | M02.3 | S | PROD-142 |
| BL-P1-PH4P410-NUM | 1 | D-4.10-005 | numerical_singleton | §19.6.1 | 1 P1 numerical_singleton defects in Phase 4 — Prompt 4.10 — §19 Template Library End-to-End Audit | Move number to one §34/§39/§44 home; inline references cite the table. | pricing | — | S | PROD-143 |
| BL-P1-PH4P410-OBS | 1 | D-4.10-008 | observability | §19 | 1 P1 observability defects in Phase 4 — Prompt 4.10 — §19 Template Library End-to-End Audit | Author §42 observability row: metric, log, trace, PagerDuty routing. | engineering, analytics | — | S | PROD-144 |
| BL-P1-PH4P410-PLAN | 3 | D-4.10-003, D-4.10-004, D-4.10-015 | plan_gating | §19.6.1, §19.5.1 | 3 P1 plan_gating defects in Phase 4 — Prompt 4.10 — §19 Template Library End-to-End Audit | Add §5.11 / §34.1 / §39 rows; never duplicate inline; cite the table. | pricing, product | — | S | PROD-145 |
| BL-P1-PH4P410-RBAC | 1 | D-4.10-002 | rbac | §19.3.3 | 1 P1 rbac defects in Phase 4 — Prompt 4.10 — §19 Template Library End-to-End Audit | Add missing §5.11 Feature Access Matrix rows per role × action × column. | engineering, design | — | S | PROD-146 |
| BL-P1-PH4P410-RET | 1 | D-4.10-013 | retention | §19 | 1 P1 retention defects in Phase 4 — Prompt 4.10 — §19 Template Library End-to-End Audit | Add §40.2 retention row per data class with TTL, anonymization, DSAR cascade. | engineering, security, legal | — | S | PROD-147 |
| BL-P1-PH4P410-WH | 1 | D-4.10-007 | webhook | §19 | 1 P1 webhook defects in Phase 4 — Prompt 4.10 — §19 Template Library End-to-End Audit | Author webhook per §31: HMAC, idempotency, backoff, DLQ, Appendix C+G registration. | engineering, analytics | M02.3 | S | PROD-148 |

### Phase 4 — Prompt 4.11 — §20 Inbox & Pulse End-to-End Audit
| Cluster ID | Count | Sample IDs | Class | Sections | Summary | Recommendation | Owner | Pack | Effort | Linear ID |
|---|---:|---|---|---|---|---|---|---|---|---|
| BL-P1-PH4P411-API | 1 | D-4.11-011 | api | §20 | 1 P1 api defects in Phase 4 — Prompt 4.11 — §20 Inbox & Pulse End-to-End Audit | Author endpoint spec per §32: method/path/auth/rate-limit/cursor/schema/errors/idempotency. | engineering | M02.3 | S | PROD-149 |
| BL-P1-PH4P411-DM | 5 | D-4.11-001, D-4.11-003, D-4.11-004, D-4.11-005, D-4.11-007 | data_model | §20.2.2, §20.3.1, §2.8.4 | 5 P1 data_model defects in Phase 4 — Prompt 4.11 — §20 Inbox & Pulse End-to-End Audit | Author missing entity field tables / retention / scope-isolation per §4 conventions. | engineering | M02.3 | M | PROD-150 |
| BL-P1-PH4P411-ENUM | 1 | D-4.11-012 | enum | §20.2.1 | 1 P1 enum defects in Phase 4 — Prompt 4.11 — §20 Inbox & Pulse End-to-End Audit | Register missing enum values in Appendix J and cite source location. | engineering | M02.3 | S | PROD-151 |
| BL-P1-PH4P411-FW | 1 | D-4.11-014 | firewall_leakage | §20 | 1 P1 firewall_leakage defects in Phase 4 — Prompt 4.11 — §20 Inbox & Pulse End-to-End Audit | Add console firewall guard with redaction-verification-hash invariant. | engineering, security | — | S | PROD-152 |
| BL-P1-PH4P411-MOB | 1 | D-4.11-010 | mobile_divergence | §20 | 1 P1 mobile_divergence defects in Phase 4 — Prompt 4.11 — §20 Inbox & Pulse End-to-End Audit | Author §38 mobile parity row: touch targets, layout, degraded states. | design, engineering | M24.3 | S | PROD-153 |
| BL-P1-PH4P411-NOTIF | 1 | D-4.11-008 | notification | §20.4 | 1 P1 notification defects in Phase 4 — Prompt 4.11 — §20 Inbox & Pulse End-to-End Audit | Register notification in Appendix C with channel × role × plan-gating matrix. | engineering, design | M02.3 | S | PROD-154 |
| BL-P1-PH4P411-NUM | 1 | D-4.11-016 | numerical_singleton | §20.4.2 | 1 P1 numerical_singleton defects in Phase 4 — Prompt 4.11 — §20 Inbox & Pulse End-to-End Audit | Move number to one §34/§39/§44 home; inline references cite the table. | engineering, design | — | S | PROD-155 |
| BL-P1-PH4P411-PLAN | 3 | D-4.11-009, D-4.11-013, D-4.11-015 | plan_gating | §20, §20.6.2 | 3 P1 plan_gating defects in Phase 4 — Prompt 4.11 — §20 Inbox & Pulse End-to-End Audit | Add §5.11 / §34.1 / §39 rows; never duplicate inline; cite the table. | engineering, design | — | S | PROD-156 |
| BL-P1-PH4P411-SE | 1 | D-4.11-002 | surface_engine_mapping | §20.2 | 1 P1 surface_engine_mapping defects in Phase 4 — Prompt 4.11 — §20 Inbox & Pulse End-to-End Audit | Author Appendix M row with companion-doc anchor, tier visibility, override. | engineering, design | — | S | PROD-157 |
| BL-P1-PH4P411-WH | 1 | D-4.11-006 | webhook | §2.8.4 | 1 P1 webhook defects in Phase 4 — Prompt 4.11 — §20 Inbox & Pulse End-to-End Audit | Author webhook per §31: HMAC, idempotency, backoff, DLQ, Appendix C+G registration. | engineering, analytics | M02.3 | S | PROD-158 |

### Phase 4 — Prompt 4.12 — §21 The Sourcera Agent End-to-End Audit
| Cluster ID | Count | Sample IDs | Class | Sections | Summary | Recommendation | Owner | Pack | Effort | Linear ID |
|---|---:|---|---|---|---|---|---|---|---|---|
| BL-P1-PH4P412-API | 1 | D-4.12-025 | api | §32 | 1 P1 api defects in Phase 4 — Prompt 4.12 — §21 The Sourcera Agent End-to-End Audit | Author endpoint spec per §32: method/path/auth/rate-limit/cursor/schema/errors/idempotency. | engineering | M02.3 | S | PROD-159 |
| BL-P1-PH4P412-DRIFT | 6 | D-4.12-004, D-4.12-005, D-4.12-006, D-4.12-007, D-4.12-008 … +1 more | consistency_drift | §21.4.1.A, §21.4.1, §21.4.2, §34.14.1.b, §21.4.4 | 6 P1 consistency_drift defects in Phase 4 — Prompt 4.12 — §21 The Sourcera Agent End-to-End Audit | Normalize cross-doc/cross-section terminology; cite single authoritative home. | engineering, pricing | — | M | DOC-016 |
| BL-P1-PH4P412-DM | 2 | D-4.12-001, D-4.12-018 | data_model | §4.8.2, §21.8 | 2 P1 data_model defects in Phase 4 — Prompt 4.12 — §21 The Sourcera Agent End-to-End Audit | Author missing entity field tables / retention / scope-isolation per §4 conventions. | engineering | M02.3 | S | PROD-160 |
| BL-P1-PH4P412-DSAR | 2 | D-4.12-029, D-4.12-035 | dsar | §21.3, §21 | 2 P1 dsar defects in Phase 4 — Prompt 4.12 — §21 The Sourcera Agent End-to-End Audit | Author §6.8 DSAR cascade row with subject-rights coverage and erasure handling. | engineering, security, legal | — | S | PROD-161 |
| BL-P1-PH4P412-NUM | 1 | D-4.12-019 | numerical_singleton | §21.8 | 1 P1 numerical_singleton defects in Phase 4 — Prompt 4.12 — §21 The Sourcera Agent End-to-End Audit | Move number to one §34/§39/§44 home; inline references cite the table. | engineering | — | S | PROD-162 |
| BL-P1-PH4P412-PLAN | 1 | D-4.12-013 | plan_gating | §21.4.4 | 1 P1 plan_gating defects in Phase 4 — Prompt 4.12 — §21 The Sourcera Agent End-to-End Audit | Add §5.11 / §34.1 / §39 rows; never duplicate inline; cite the table. | engineering, pricing | — | S | PROD-163 |

### Phase 4 — Prompt V4 — Phase 4 Verification
| Cluster ID | Count | Sample IDs | Class | Sections | Summary | Recommendation | Owner | Pack | Effort | Linear ID |
|---|---:|---|---|---|---|---|---|---|---|---|
| BL-P1-PH4PV4-ACC | 1 | D-4V-004 | acceptance_criteria | §10.13 | 1 P1 acceptance_criteria defects in Phase 4 — Prompt V4 — Phase 4 Verification | Author numbered, testable, observable AC blocks per §13.10 style. | engineering + pricing + ops | — | S | PROD-164 |
| BL-P1-PH4PV4-DOC | 2 | D-4V-001, D-4V-002 | documentation_gap | §12, `_audit/PHASE17_FINDINGS.md` ( | 2 P1 documentation_gap defects in Phase 4 — Prompt V4 — Phase 4 Verification | Author missing spec content; cite authoritative source-of-truth. | engineering | — | S | DOC-017 |

### Phase 34.19 — Plan Upgrade / Downgrade & Seller Carry-Over
| Cluster ID | Count | Sample IDs | Class | Sections | Summary | Recommendation | Owner | Pack | Effort | Linear ID |
|---|---:|---|---|---|---|---|---|---|---|---|
| BL-P1-PH3419-DRIFT | 3 | D-34.19-005, D-34.19-007, D-33-008 | consistency_drift | §34.19.1, §34.5.1, §33.7 | 3 P1 consistency_drift defects in Phase 34.19 — Plan Upgrade / Downgrade & Seller Carry-Over | Normalize cross-doc/cross-section terminology; cite single authoritative home. | engineering | — | S | DOC-018 |
| BL-P1-PH3419-DM | 5 | D-34.19-001, D-34.19-002, D-34.19-003, D-34.19-004, D-34.19-008 | data_model | §22.3.1, §22.18.3.4, §34.19.2, §22.18.3.5, §34.19.1 | 5 P1 data_model defects in Phase 34.19 — Plan Upgrade / Downgrade & Seller Carry-Over | Author missing entity field tables / retention / scope-isolation per §4 conventions. | engineering | M02.3 | M | PROD-165 |
| BL-P1-PH3419-DOC | 2 | D-33-004, D-33-007 | documentation_gap | §33, §33.1 | 2 P1 documentation_gap defects in Phase 34.19 — Plan Upgrade / Downgrade & Seller Carry-Over | Author missing spec content; cite authoritative source-of-truth. | security + legal | — | S | DOC-019 |
| BL-P1-PH3419-NUM | 1 | D-33-009 | numerical_singleton | §33.9 | 1 P1 numerical_singleton defects in Phase 34.19 — Plan Upgrade / Downgrade & Seller Carry-Over | Move number to one §34/§39/§44 home; inline references cite the table. | engineering | — | S | PROD-166 |
| BL-P1-PH3419-PLAN | 3 | D-34.19-009, D-34.19-010, D-33-011 | plan_gating | §34.19.1, §34.19.3, §33.4 | 3 P1 plan_gating defects in Phase 34.19 — Plan Upgrade / Downgrade & Seller Carry-Over | Add §5.11 / §34.1 / §39 rows; never duplicate inline; cite the table. | engineering + pricing | — | S | PROD-167 |
| BL-P1-PH3419-SM | 2 | D-34.19-006, D-34.19-018 | state_machine | §34.19.6 | 2 P1 state_machine defects in Phase 34.19 — Plan Upgrade / Downgrade & Seller Carry-Over | Replace prose with From/To/Trigger/Conditions table; cover concurrency / re-drive. | engineering + legal | — | S | PROD-168 |

### Phase 5 — Prompt 5.1 — §9 Seller Teams & Triage End-to-End Audit
| Cluster ID | Count | Sample IDs | Class | Sections | Summary | Recommendation | Owner | Pack | Effort | Linear ID |
|---|---:|---|---|---|---|---|---|---|---|---|
| BL-P1-PH5P51-API | 2 | D-5.1-012, D-5.1-013 | api | §9.4.3.2, §9 | 2 P1 api defects in Phase 5 — Prompt 5.1 — §9 Seller Teams & Triage End-to-End Audit | Author endpoint spec per §32: method/path/auth/rate-limit/cursor/schema/errors/idempotency. | engineering | M02.3 | S | PROD-169 |
| BL-P1-PH5P51-DM | 3 | D-5.1-001, D-5.1-002, D-5.1-003 | data_model | §9.1.1, §9.3.1, §9.3.2 | 3 P1 data_model defects in Phase 5 — Prompt 5.1 — §9 Seller Teams & Triage End-to-End Audit | Author missing entity field tables / retention / scope-isolation per §4 conventions. | engineering | M02.3 | S | PROD-170 |
| BL-P1-PH5P51-DSAR | 1 | D-5.1-023 | dsar | §9.4.3.2 | 1 P1 dsar defects in Phase 5 — Prompt 5.1 — §9 Seller Teams & Triage End-to-End Audit | Author §6.8 DSAR cascade row with subject-rights coverage and erasure handling. | engineering + legal | — | S | PROD-171 |
| BL-P1-PH5P51-ENUM | 4 | D-5.1-004, D-5.1-005, D-5.1-006, D-5.1-007 | enum | §9.3.1, §9.1.1, §9.1.3.1, §9.2.4.1 | 4 P1 enum defects in Phase 5 — Prompt 5.1 — §9 Seller Teams & Triage End-to-End Audit | Register missing enum values in Appendix J and cite source location. | engineering | M02.3 | M | PROD-172 |
| BL-P1-PH5P51-EC | 2 | D-5.1-008, D-5.1-009 | error_code | §9, §9.4.3.1 | 2 P1 error_code defects in Phase 5 — Prompt 5.1 — §9 Seller Teams & Triage End-to-End Audit | Add Appendix I row with HTTP status, retry semantics, user-facing copy. | engineering | M02.3 | S | PROD-173 |
| BL-P1-PH5P51-NUM | 4 | D-5.1-017, D-5.1-018, D-5.1-019, D-5.1-020 | numerical_singleton | §9.3.3.3, §9.2.4.2, §9.2.4.1, §9.4.3.2 | 4 P1 numerical_singleton defects in Phase 5 — Prompt 5.1 — §9 Seller Teams & Triage End-to-End Audit | Move number to one §34/§39/§44 home; inline references cite the table. | engineering | — | M | PROD-174 |
| BL-P1-PH5P51-PLAN | 1 | D-5.1-024 | plan_gating | §9.4.3.1 | 1 P1 plan_gating defects in Phase 5 — Prompt 5.1 — §9 Seller Teams & Triage End-to-End Audit | Add §5.11 / §34.1 / §39 rows; never duplicate inline; cite the table. | engineering + pricing | — | S | PROD-175 |
| BL-P1-PH5P51-PH | 2 | D-5.1-015, D-5.1-016 | posthog_event | §9.3.3.4, §9.4.1 | 2 P1 posthog_event defects in Phase 5 — Prompt 5.1 — §9 Seller Teams & Triage End-to-End Audit | Register PostHog event in Appendix G with property schema and console scoping. | analytics | M02.3 | S | PROD-176 |
| BL-P1-PH5P51-RET | 1 | D-5.1-022 | retention | §9 | 1 P1 retention defects in Phase 5 — Prompt 5.1 — §9 Seller Teams & Triage End-to-End Audit | Add §40.2 retention row per data class with TTL, anonymization, DSAR cascade. | engineering + legal | — | S | PROD-177 |
| BL-P1-PH5P51-SM | 2 | D-5.1-010, D-5.1-011 | state_machine | §9.3.3.1, §9.2.3 | 2 P1 state_machine defects in Phase 5 — Prompt 5.1 — §9 Seller Teams & Triage End-to-End Audit | Replace prose with From/To/Trigger/Conditions table; cover concurrency / re-drive. | engineering | — | S | PROD-178 |
| BL-P1-PH5P51-SE | 1 | D-5.1-021 | surface_engine_mapping | §9 | 1 P1 surface_engine_mapping defects in Phase 5 — Prompt 5.1 — §9 Seller Teams & Triage End-to-End Audit | Author Appendix M row with companion-doc anchor, tier visibility, override. | engineering + design | — | S | PROD-179 |
| BL-P1-PH5P51-WH | 1 | D-5.1-014 | webhook | §9.2 | 1 P1 webhook defects in Phase 5 — Prompt 5.1 — §9 Seller Teams & Triage End-to-End Audit | Author webhook per §31: HMAC, idempotency, backoff, DLQ, Appendix C+G registration. | engineering | M02.3 | S | PROD-180 |

### Phase 5 — Prompt 5.2 — §22.1–§22.8 KB & MCP Server Cross-Reference Audit
| Cluster ID | Count | Sample IDs | Class | Sections | Summary | Recommendation | Owner | Pack | Effort | Linear ID |
|---|---:|---|---|---|---|---|---|---|---|---|
| BL-P1-PH5P52-API | 1 | D-5.2-004 | api | §22.8.4.1 | 1 P1 api defects in Phase 5 — Prompt 5.2 — §22.1–§22.8 KB & MCP Server Cross-Reference Audit | Author endpoint spec per §32: method/path/auth/rate-limit/cursor/schema/errors/idempotency. | engineering | M02.3 | S | PROD-181 |
| BL-P1-PH5P52-DRIFT | 1 | D-5.2-001 | consistency_drift | §22.2.1 | 1 P1 consistency_drift defects in Phase 5 — Prompt 5.2 — §22.1–§22.8 KB & MCP Server Cross-Reference Audit | Normalize cross-doc/cross-section terminology; cite single authoritative home. | engineering | M11.3 | S | DOC-020 |
| BL-P1-PH5P52-DM | 2 | D-5.2-003, D-5.2-005 | data_model | §22.3.1, §22.8.3.1 | 2 P1 data_model defects in Phase 5 — Prompt 5.2 — §22.1–§22.8 KB & MCP Server Cross-Reference Audit | Author missing entity field tables / retention / scope-isolation per §4 conventions. | engineering | M02.3 | S | PROD-182 |
| BL-P1-PH5P52-DOC | 1 | D-5.2-002 | documentation_gap | §22.4.1 | 1 P1 documentation_gap defects in Phase 5 — Prompt 5.2 — §22.1–§22.8 KB & MCP Server Cross-Reference Audit | Author missing spec content; cite authoritative source-of-truth. | engineering | M11.3 | S | DOC-021 |
| BL-P1-PH5P52-NOTIF | 1 | D-5.2-017 | notification | §22.4.2 | 1 P1 notification defects in Phase 5 — Prompt 5.2 — §22.1–§22.8 KB & MCP Server Cross-Reference Audit | Register notification in Appendix C with channel × role × plan-gating matrix. | engineering | M02.3 | S | PROD-183 |
| BL-P1-PH5P52-OBS | 1 | D-5.2-021 | observability | §22.8.5 | 1 P1 observability defects in Phase 5 — Prompt 5.2 — §22.1–§22.8 KB & MCP Server Cross-Reference Audit | Author §42 observability row: metric, log, trace, PagerDuty routing. | engineering, security | M11.3 | S | PROD-184 |
| BL-P1-PH5P52-WH | 1 | D-5.2-009 | webhook | §22.8.6 | 1 P1 webhook defects in Phase 5 — Prompt 5.2 — §22.1–§22.8 KB & MCP Server Cross-Reference Audit | Author webhook per §31: HMAC, idempotency, backoff, DLQ, Appendix C+G registration. | engineering | M02.3 | S | PROD-185 |

### Phase 5 — Prompt 5.3 — §22.9–§22.20 KB Retrieval / Skills / Lifecycle / Maya Cross-Reference Audit
| Cluster ID | Count | Sample IDs | Class | Sections | Summary | Recommendation | Owner | Pack | Effort | Linear ID |
|---|---:|---|---|---|---|---|---|---|---|---|
| BL-P1-PH5P53-DRIFT | 1 | D-5.3-001 | consistency_drift | §22.9.3 | 1 P1 consistency_drift defects in Phase 5 — Prompt 5.3 — §22.9–§22.20 KB Retrieval / Skills / Lifecycle / Maya Cross-Reference Audit | Normalize cross-doc/cross-section terminology; cite single authoritative home. | engineering | M11.3 | S | DOC-022 |
| BL-P1-PH5P53-DM | 7 | D-5.3-002, D-5.3-003, D-5.3-004, D-5.3-005, D-5.3-006 … +2 more | data_model | §22.18.3.1, §22.5.1, §22.18.2.1, §22.18.3.4, §22.18.3.5 +2 more | 7 P1 data_model defects in Phase 5 — Prompt 5.3 — §22.9–§22.20 KB Retrieval / Skills / Lifecycle / Maya Cross-Reference Audit | Author missing entity field tables / retention / scope-isolation per §4 conventions. | engineering | M02.3 | M | PROD-186 |
| BL-P1-PH5P53-SM | 1 | D-5.3-012 | state_machine | §22.20.2 | 1 P1 state_machine defects in Phase 5 — Prompt 5.3 — §22.9–§22.20 KB Retrieval / Skills / Lifecycle / Maya Cross-Reference Audit | Replace prose with From/To/Trigger/Conditions table; cover concurrency / re-drive. | engineering | M11.3 | S | PROD-187 |

### Phase 23 — §23 Seller Console: Bid Workspace & Response Management Walk
| Cluster ID | Count | Sample IDs | Class | Sections | Summary | Recommendation | Owner | Pack | Effort | Linear ID |
|---|---:|---|---|---|---|---|---|---|---|---|
| BL-P1-PH23-ACC | 2 | D-23-006, D-23-016 | acceptance_criteria | §23.4, §23.5 | 2 P1 acceptance_criteria defects in Phase 23 — §23 Seller Console: Bid Workspace & Response Management Walk | Author numbered, testable, observable AC blocks per §13.10 style. | engineering | — | S | PROD-188 |
| BL-P1-PH23-API | 2 | D-23-003, D-23-010 | api | §23.4, §23.2 | 2 P1 api defects in Phase 23 — §23 Seller Console: Bid Workspace & Response Management Walk | Author endpoint spec per §32: method/path/auth/rate-limit/cursor/schema/errors/idempotency. | engineering | M02.3 | S | PROD-189 |
| BL-P1-PH23-DRIFT | 1 | D-23-001 | consistency_drift | §23.1 | 1 P1 consistency_drift defects in Phase 23 — §23 Seller Console: Bid Workspace & Response Management Walk | Normalize cross-doc/cross-section terminology; cite single authoritative home. | engineering | — | S | DOC-023 |
| BL-P1-PH23-DM | 4 | D-23-005, D-23-007, D-23-008, D-23-009 | data_model | §23.4, §23.1, §23.2 | 4 P1 data_model defects in Phase 23 — §23 Seller Console: Bid Workspace & Response Management Walk | Author missing entity field tables / retention / scope-isolation per §4 conventions. | engineering | M02.3 | M | PROD-190 |
| BL-P1-PH23-ENT | 1 | D-23-019 | entitlement | §23.3 | 1 P1 entitlement defects in Phase 23 — §23 Seller Console: Bid Workspace & Response Management Walk | Add §34.8 entitlement matrix row with plan × capability × enforcement-mode. | engineering | — | S | PROD-191 |
| BL-P1-PH23-EC | 1 | D-23-011 | error_code | §23.2 | 1 P1 error_code defects in Phase 23 — §23 Seller Console: Bid Workspace & Response Management Walk | Add Appendix I row with HTTP status, retry semantics, user-facing copy. | engineering | M02.3 | S | PROD-192 |
| BL-P1-PH23-PLAN | 1 | D-23-021 | plan_gating | §23 | 1 P1 plan_gating defects in Phase 23 — §23 Seller Console: Bid Workspace & Response Management Walk | Add §5.11 / §34.1 / §39 rows; never duplicate inline; cite the table. | pricing | — | S | PROD-193 |
| BL-P1-PH23-RBAC | 1 | D-23-013 | rbac | §23.2 | 1 P1 rbac defects in Phase 23 — §23 Seller Console: Bid Workspace & Response Management Walk | Add missing §5.11 Feature Access Matrix rows per role × action × column. | engineering | — | S | PROD-194 |
| BL-P1-PH23-SM | 1 | D-23-002 | state_machine | §23.4 | 1 P1 state_machine defects in Phase 23 — §23 Seller Console: Bid Workspace & Response Management Walk | Replace prose with From/To/Trigger/Conditions table; cover concurrency / re-drive. | engineering | — | S | PROD-195 |
| BL-P1-PH23-WH | 2 | D-23-004, D-23-020 | webhook | §23.4, §23 | 2 P1 webhook defects in Phase 23 — §23 Seller Console: Bid Workspace & Response Management Walk | Author webhook per §31: HMAC, idempotency, backoff, DLQ, Appendix C+G registration. | engineering | M02.3 | S | PROD-196 |

### Phase 24 — §24 Seller Console: Q&A, NDA, Inbox & Pulse Walk
| Cluster ID | Count | Sample IDs | Class | Sections | Summary | Recommendation | Owner | Pack | Effort | Linear ID |
|---|---:|---|---|---|---|---|---|---|---|---|
| BL-P1-PH24-ACC | 2 | D-24-010, D-24-022 | acceptance_criteria | §24.4, §24.5 | 2 P1 acceptance_criteria defects in Phase 24 — §24 Seller Console: Q&A, NDA, Inbox & Pulse Walk | Author numbered, testable, observable AC blocks per §13.10 style. | engineering | — | S | PROD-197 |
| BL-P1-PH24-API | 2 | D-24-006, D-24-019 | api | §24.3, §24.2 | 2 P1 api defects in Phase 24 — §24 Seller Console: Q&A, NDA, Inbox & Pulse Walk | Author endpoint spec per §32: method/path/auth/rate-limit/cursor/schema/errors/idempotency. | engineering | M02.3 | S | PROD-198 |
| BL-P1-PH24-DRIFT | 2 | D-24-011, D-24-017 | consistency_drift | §24.6, §24.2 | 2 P1 consistency_drift defects in Phase 24 — §24 Seller Console: Q&A, NDA, Inbox & Pulse Walk | Normalize cross-doc/cross-section terminology; cite single authoritative home. | engineering | — | S | DOC-024 |
| BL-P1-PH24-DM | 5 | D-24-005, D-24-012, D-24-015, D-24-016, D-24-018 | data_model | §24.3, §24.4, §24.2, §4.5.3 | 5 P1 data_model defects in Phase 24 — §24 Seller Console: Q&A, NDA, Inbox & Pulse Walk | Author missing entity field tables / retention / scope-isolation per §4 conventions. | engineering | M02.3 | M | PROD-199 |
| BL-P1-PH24-DSAR | 1 | D-24-028 | dsar | §4.5.3 | 1 P1 dsar defects in Phase 24 — §24 Seller Console: Q&A, NDA, Inbox & Pulse Walk | Author §6.8 DSAR cascade row with subject-rights coverage and erasure handling. | security | — | S | PROD-200 |
| BL-P1-PH24-NOTIF | 1 | D-24-008 | notification | §24.3 | 1 P1 notification defects in Phase 24 — §24 Seller Console: Q&A, NDA, Inbox & Pulse Walk | Register notification in Appendix C with channel × role × plan-gating matrix. | engineering | M02.3 | S | PROD-201 |
| BL-P1-PH24-SM | 1 | D-24-002 | state_machine | §24.1 | 1 P1 state_machine defects in Phase 24 — §24 Seller Console: Q&A, NDA, Inbox & Pulse Walk | Replace prose with From/To/Trigger/Conditions table; cover concurrency / re-drive. | engineering | — | S | PROD-202 |
| BL-P1-PH24-SE | 1 | D-24-014 | surface_engine_mapping | §24.4 | 1 P1 surface_engine_mapping defects in Phase 24 — §24 Seller Console: Q&A, NDA, Inbox & Pulse Walk | Author Appendix M row with companion-doc anchor, tier visibility, override. | engineering | — | S | PROD-203 |

### Phase 5 — Prompt 5.6 — §26 Seller Profiles, Verification & Capability Declarations Walk
| Cluster ID | Count | Sample IDs | Class | Sections | Summary | Recommendation | Owner | Pack | Effort | Linear ID |
|---|---:|---|---|---|---|---|---|---|---|---|
| BL-P1-PH5P56-DRIFT | 3 | D-5.6-002, D-5.6-008, D-5.6-009 | consistency_drift | §26.2, §4.5.6, §26.8.1 | 3 P1 consistency_drift defects in Phase 5 — Prompt 5.6 — §26 Seller Profiles, Verification & Capability Declarations Walk | Normalize cross-doc/cross-section terminology; cite single authoritative home. | engineering | M21.3 | S | DOC-025 |
| BL-P1-PH5P56-DM | 4 | D-5.6-003, D-5.6-004, D-5.6-006, D-5.6-007 | data_model | §26.1, §26.3, §26.8.7 | 4 P1 data_model defects in Phase 5 — Prompt 5.6 — §26 Seller Profiles, Verification & Capability Declarations Walk | Author missing entity field tables / retention / scope-isolation per §4 conventions. | engineering | M02.3 | M | PROD-204 |
| BL-P1-PH5P56-ENUM | 1 | D-5.6-005 | enum | §4.4.10 | 1 P1 enum defects in Phase 5 — Prompt 5.6 — §26 Seller Profiles, Verification & Capability Declarations Walk | Register missing enum values in Appendix J and cite source location. | engineering | M02.3 | S | PROD-205 |

### Phase 5 — Prompt 5.7 — §49 Seller Onboarding Implementation-Level Seven-Stage Flow Walk
| Cluster ID | Count | Sample IDs | Class | Sections | Summary | Recommendation | Owner | Pack | Effort | Linear ID |
|---|---:|---|---|---|---|---|---|---|---|---|
| BL-P1-PH5P57-ACC | 2 | D-5.7-010, D-5.7-024 | acceptance_criteria | §49.1.6, §49.1.3 | 2 P1 acceptance_criteria defects in Phase 5 — Prompt 5.7 — §49 Seller Onboarding Implementation-Level Seven-Stage Flow Walk | Author numbered, testable, observable AC blocks per §13.10 style. | engineering | — | S | PROD-206 |
| BL-P1-PH5P57-DRIFT | 2 | D-5.7-002, D-5.7-003 | consistency_drift | §49.1.1, §4.4.22 | 2 P1 consistency_drift defects in Phase 5 — Prompt 5.7 — §49 Seller Onboarding Implementation-Level Seven-Stage Flow Walk | Normalize cross-doc/cross-section terminology; cite single authoritative home. | engineering | — | S | DOC-026 |
| BL-P1-PH5P57-DM | 2 | D-5.7-004, D-5.7-005 | data_model | §49.1.7, §49.1.5 | 2 P1 data_model defects in Phase 5 — Prompt 5.7 — §49 Seller Onboarding Implementation-Level Seven-Stage Flow Walk | Author missing entity field tables / retention / scope-isolation per §4 conventions. | engineering | M02.3 | S | PROD-207 |
| BL-P1-PH5P57-ENUM | 2 | D-5.7-001, D-5.7-007 | enum | §49.1.5, §49.1.1 | 2 P1 enum defects in Phase 5 — Prompt 5.7 — §49 Seller Onboarding Implementation-Level Seven-Stage Flow Walk | Register missing enum values in Appendix J and cite source location. | engineering | M02.3 | S | PROD-208 |
| BL-P1-PH5P57-GROW | 1 | D-5.7-011 | growth_mechanic_gap | §49.1.7 | 1 P1 growth_mechanic_gap defects in Phase 5 — Prompt 5.7 — §49 Seller Onboarding Implementation-Level Seven-Stage Flow Walk | Author §48 growth-mechanic loop row with conversion gate and amplifier. | engineering + analytics + design | — | S | DOC-027 |
| BL-P1-PH5P57-NOTIF | 1 | D-5.7-008 | notification | §49 | 1 P1 notification defects in Phase 5 — Prompt 5.7 — §49 Seller Onboarding Implementation-Level Seven-Stage Flow Walk | Register notification in Appendix C with channel × role × plan-gating matrix. | engineering + design + analytics | M02.3 | S | PROD-209 |
| BL-P1-PH5P57-OBS | 3 | D-5.7-009, D-5.7-015, D-5.7-016 | observability | §49.1.10, §49, §49.1.7 | 3 P1 observability defects in Phase 5 — Prompt 5.7 — §49 Seller Onboarding Implementation-Level Seven-Stage Flow Walk | Author §42 observability row: metric, log, trace, PagerDuty routing. | engineering + ops | — | S | PROD-210 |
| BL-P1-PH5P57-PLAN | 1 | D-5.7-006 | plan_gating | §49 | 1 P1 plan_gating defects in Phase 5 — Prompt 5.7 — §49 Seller Onboarding Implementation-Level Seven-Stage Flow Walk | Add §5.11 / §34.1 / §39 rows; never duplicate inline; cite the table. | pricing + engineering + design | — | S | PROD-211 |

### Phase 5 — Prompt V5 — Phase 5 Verification
| Cluster ID | Count | Sample IDs | Class | Sections | Summary | Recommendation | Owner | Pack | Effort | Linear ID |
|---|---:|---|---|---|---|---|---|---|---|---|
| BL-P1-PH5PV5-ACC | 1 | D-5V-003 | acceptance_criteria | §48.8.10 | 1 P1 acceptance_criteria defects in Phase 5 — Prompt V5 — Phase 5 Verification | Author numbered, testable, observable AC blocks per §13.10 style. | engineering + analytics | — | S | PROD-212 |
| BL-P1-PH5PV5-CONC | 1 | D-5V-004 | concurrency | §22.10.3 | 1 P1 concurrency defects in Phase 5 — Prompt V5 — Phase 5 Verification | Author concurrency contract: serialization, last-write-wins or merge semantics. | engineering | M11.3 | S | PROD-213 |
| BL-P1-PH5PV5-DOC | 2 | D-5V-001, D-5V-002 | documentation_gap | `_audit/` directory state vs ` | 2 P1 documentation_gap defects in Phase 5 — Prompt V5 — Phase 5 Verification | Author missing spec content; cite authoritative source-of-truth. | — | — | S | DOC-028 |

### Phase 5 — Prompt 5.4 — §23 Bid Workspace & Response Management Walk
| Cluster ID | Count | Sample IDs | Class | Sections | Summary | Recommendation | Owner | Pack | Effort | Linear ID |
|---|---:|---|---|---|---|---|---|---|---|---|
| BL-P1-PH5P54-ACC | 1 | D-5.4-019 | acceptance_criteria | §23.5 | 1 P1 acceptance_criteria defects in Phase 5 — Prompt 5.4 — §23 Bid Workspace & Response Management Walk | Author numbered, testable, observable AC blocks per §13.10 style. | — | — | S | PROD-214 |
| BL-P1-PH5P54-API | 2 | D-5.4-008, D-5.4-013 | api | §23.2, §23.3 | 2 P1 api defects in Phase 5 — Prompt 5.4 — §23 Bid Workspace & Response Management Walk | Author endpoint spec per §32: method/path/auth/rate-limit/cursor/schema/errors/idempotency. | — | M02.3 | S | PROD-215 |
| BL-P1-PH5P54-AUDIT | 1 | D-5.4-018 | audit_event | §23.4 | 1 P1 audit_event defects in Phase 5 — Prompt 5.4 — §23 Bid Workspace & Response Management Walk | Register audit-event action type in Appendix J; cite §6.7 AuditEvent contract. | — | — | S | PROD-216 |
| BL-P1-PH5P54-DRIFT | 1 | D-5.4-003 | consistency_drift | §23.1 | 1 P1 consistency_drift defects in Phase 5 — Prompt 5.4 — §23 Bid Workspace & Response Management Walk | Normalize cross-doc/cross-section terminology; cite single authoritative home. | — | — | S | DOC-029 |
| BL-P1-PH5P54-DM | 3 | D-5.4-001, D-5.4-005, D-5.4-009 | data_model | §23.1, §23.2, §23.3 | 3 P1 data_model defects in Phase 5 — Prompt 5.4 — §23 Bid Workspace & Response Management Walk | Author missing entity field tables / retention / scope-isolation per §4 conventions. | — | M02.3 | S | PROD-217 |
| BL-P1-PH5P54-DSAR | 1 | D-5.4-023 | dsar | §23 | 1 P1 dsar defects in Phase 5 — Prompt 5.4 — §23 Bid Workspace & Response Management Walk | Author §6.8 DSAR cascade row with subject-rights coverage and erasure handling. | — | — | S | PROD-218 |
| BL-P1-PH5P54-ENUM | 2 | D-5.4-002, D-5.4-011 | enum | §23.1, §23.3 | 2 P1 enum defects in Phase 5 — Prompt 5.4 — §23 Bid Workspace & Response Management Walk | Register missing enum values in Appendix J and cite source location. | — | M02.3 | S | PROD-219 |
| BL-P1-PH5P54-EC | 1 | D-5.4-014 | error_code | §23.3 | 1 P1 error_code defects in Phase 5 — Prompt 5.4 — §23 Bid Workspace & Response Management Walk | Add Appendix I row with HTTP status, retry semantics, user-facing copy. | — | M02.3 | S | PROD-220 |
| BL-P1-PH5P54-FW | 2 | D-5.4-004, D-5.4-025 | firewall_leakage | §23 | 2 P1 firewall_leakage defects in Phase 5 — Prompt 5.4 — §23 Bid Workspace & Response Management Walk | Add console firewall guard with redaction-verification-hash invariant. | — | — | S | PROD-221 |
| BL-P1-PH5P54-NUM | 3 | D-5.4-006, D-5.4-012, D-5.4-016 | numerical_singleton | §23.2, §23.3, §23.4 | 3 P1 numerical_singleton defects in Phase 5 — Prompt 5.4 — §23 Bid Workspace & Response Management Walk | Move number to one §34/§39/§44 home; inline references cite the table. | — | — | S | PROD-222 |
| BL-P1-PH5P54-PLAN | 2 | D-5.4-020, D-5.4-021 | plan_gating | §23 | 2 P1 plan_gating defects in Phase 5 — Prompt 5.4 — §23 Bid Workspace & Response Management Walk | Add §5.11 / §34.1 / §39 rows; never duplicate inline; cite the table. | — | — | S | PROD-223 |
| BL-P1-PH5P54-RES | 1 | D-5.4-024 | residency | §23 | 1 P1 residency defects in Phase 5 — Prompt 5.4 — §23 Bid Workspace & Response Management Walk | Add §1.6 / §40 / §42 residency clause for US/EU/custom region behavior. | — | — | S | PROD-224 |
| BL-P1-PH5P54-RET | 1 | D-5.4-022 | retention | §23 | 1 P1 retention defects in Phase 5 — Prompt 5.4 — §23 Bid Workspace & Response Management Walk | Add §40.2 retention row per data class with TTL, anonymization, DSAR cascade. | — | — | S | PROD-225 |
| BL-P1-PH5P54-SM | 2 | D-5.4-007, D-5.4-010 | state_machine | §23.2, §23.3 | 2 P1 state_machine defects in Phase 5 — Prompt 5.4 — §23 Bid Workspace & Response Management Walk | Replace prose with From/To/Trigger/Conditions table; cover concurrency / re-drive. | — | — | S | PROD-226 |
| BL-P1-PH5P54-WH | 1 | D-5.4-015 | webhook | §23.4 | 1 P1 webhook defects in Phase 5 — Prompt 5.4 — §23 Bid Workspace & Response Management Walk | Author webhook per §31: HMAC, idempotency, backoff, DLQ, Appendix C+G registration. | — | M02.3 | S | PROD-227 |

### Phase 5 — Prompt 5.5 — §24 Q&A, NDA, Inbox, Pulse Walk
| Cluster ID | Count | Sample IDs | Class | Sections | Summary | Recommendation | Owner | Pack | Effort | Linear ID |
|---|---:|---|---|---|---|---|---|---|---|---|
| BL-P1-PH5P55-ACC | 2 | D-5.5-015, D-5.5-021 | acceptance_criteria | §24.3, §24.6 | 2 P1 acceptance_criteria defects in Phase 5 — Prompt 5.5 — §24 Q&A, NDA, Inbox, Pulse Walk | Author numbered, testable, observable AC blocks per §13.10 style. | — | — | S | PROD-228 |
| BL-P1-PH5P55-API | 2 | D-5.5-008, D-5.5-019 | api | §24.2, §24.5 | 2 P1 api defects in Phase 5 — Prompt 5.5 — §24 Q&A, NDA, Inbox, Pulse Walk | Author endpoint spec per §32: method/path/auth/rate-limit/cursor/schema/errors/idempotency. | — | M02.3 | S | PROD-229 |
| BL-P1-PH5P55-AUDIT | 1 | D-5.5-010 | audit_event | §24.2 | 1 P1 audit_event defects in Phase 5 — Prompt 5.5 — §24 Q&A, NDA, Inbox, Pulse Walk | Register audit-event action type in Appendix J; cite §6.7 AuditEvent contract. | — | — | S | PROD-230 |
| BL-P1-PH5P55-DRIFT | 1 | D-5.5-007 | consistency_drift | §24.2 | 1 P1 consistency_drift defects in Phase 5 — Prompt 5.5 — §24 Q&A, NDA, Inbox, Pulse Walk | Normalize cross-doc/cross-section terminology; cite single authoritative home. | — | — | S | DOC-030 |
| BL-P1-PH5P55-DM | 5 | D-5.5-002, D-5.5-005, D-5.5-013, D-5.5-016, D-5.5-017 | data_model | §24.1, §24.2, §24.3, §24.4 | 5 P1 data_model defects in Phase 5 — Prompt 5.5 — §24 Q&A, NDA, Inbox, Pulse Walk | Author missing entity field tables / retention / scope-isolation per §4 conventions. | — | M02.3 | M | PROD-231 |
| BL-P1-PH5P55-DOC | 1 | D-5.5-012 | documentation_gap | §24.2 | 1 P1 documentation_gap defects in Phase 5 — Prompt 5.5 — §24 Q&A, NDA, Inbox, Pulse Walk | Author missing spec content; cite authoritative source-of-truth. | — | — | S | DOC-031 |
| BL-P1-PH5P55-DSAR | 1 | D-5.5-023 | dsar | §24 | 1 P1 dsar defects in Phase 5 — Prompt 5.5 — §24 Q&A, NDA, Inbox, Pulse Walk | Author §6.8 DSAR cascade row with subject-rights coverage and erasure handling. | — | — | S | PROD-232 |
| BL-P1-PH5P55-ENUM | 1 | D-5.5-014 | enum | §24.3 | 1 P1 enum defects in Phase 5 — Prompt 5.5 — §24 Q&A, NDA, Inbox, Pulse Walk | Register missing enum values in Appendix J and cite source location. | — | M02.3 | S | PROD-233 |
| BL-P1-PH5P55-FW | 3 | D-5.5-001, D-5.5-003, D-5.5-025 | firewall_leakage | §24.1, §24 | 3 P1 firewall_leakage defects in Phase 5 — Prompt 5.5 — §24 Q&A, NDA, Inbox, Pulse Walk | Add console firewall guard with redaction-verification-hash invariant. | — | — | S | PROD-234 |
| BL-P1-PH5P55-PLAN | 2 | D-5.5-018, D-5.5-020 | plan_gating | §24.4, §24.5 | 2 P1 plan_gating defects in Phase 5 — Prompt 5.5 — §24 Q&A, NDA, Inbox, Pulse Walk | Add §5.11 / §34.1 / §39 rows; never duplicate inline; cite the table. | — | — | S | PROD-235 |
| BL-P1-PH5P55-RES | 1 | D-5.5-024 | residency | §24 | 1 P1 residency defects in Phase 5 — Prompt 5.5 — §24 Q&A, NDA, Inbox, Pulse Walk | Add §1.6 / §40 / §42 residency clause for US/EU/custom region behavior. | — | — | S | PROD-236 |
| BL-P1-PH5P55-RET | 1 | D-5.5-022 | retention | §24 | 1 P1 retention defects in Phase 5 — Prompt 5.5 — §24 Q&A, NDA, Inbox, Pulse Walk | Add §40.2 retention row per data class with TTL, anonymization, DSAR cascade. | — | — | S | PROD-237 |
| BL-P1-PH5P55-SM | 1 | D-5.5-006 | state_machine | §24.2 | 1 P1 state_machine defects in Phase 5 — Prompt 5.5 — §24 Q&A, NDA, Inbox, Pulse Walk | Replace prose with From/To/Trigger/Conditions table; cover concurrency / re-drive. | — | — | S | PROD-238 |
| BL-P1-PH5P55-WH | 1 | D-5.5-009 | webhook | §24.2 | 1 P1 webhook defects in Phase 5 — Prompt 5.5 — §24 Q&A, NDA, Inbox, Pulse Walk | Author webhook per §31: HMAC, idempotency, backoff, DLQ, Appendix C+G registration. | — | M02.3 | S | PROD-239 |

### Phase 6 — Prompt 6.1 — Cross-Console Mechanics (§25 + §4.7) End-to-End Audit
| Cluster ID | Count | Sample IDs | Class | Sections | Summary | Recommendation | Owner | Pack | Effort | Linear ID |
|---|---:|---|---|---|---|---|---|---|---|---|
| BL-P1-PH6P61-DM | 1 | D-6.2-006 | data_model | §27.4.3 | 1 P1 data_model defects in Phase 6 — Prompt 6.1 — Cross-Console Mechanics (§25 + §4.7) End-to-End Audit | Author missing entity field tables / retention / scope-isolation per §4 conventions. | engineering | M02.3 | S | PROD-240 |
| BL-P1-PH6P61-ENUM | 4 | D-6.1-002, D-6.1-003, D-6.1-004, D-6.2-005 | enum | §4.7.1, §4.7.2, §27.4.11 | 4 P1 enum defects in Phase 6 — Prompt 6.1 — Cross-Console Mechanics (§25 + §4.7) End-to-End Audit | Register missing enum values in Appendix J and cite source location. | engineering | M02.3 | M | PROD-241 |
| BL-P1-PH6P61-EC | 3 | D-6.1-009, D-6.1-010, D-6.1-011 | error_code | §25.3.10a, §4.7.2, §4.7.1 | 3 P1 error_code defects in Phase 6 — Prompt 6.1 — Cross-Console Mechanics (§25 + §4.7) End-to-End Audit | Add Appendix I row with HTTP status, retry semantics, user-facing copy. | engineering | M02.3 | S | PROD-242 |
| BL-P1-PH6P61-NOTIF | 1 | D-6.2-003 | notification | §27.4.9 | 1 P1 notification defects in Phase 6 — Prompt 6.1 — Cross-Console Mechanics (§25 + §4.7) End-to-End Audit | Register notification in Appendix C with channel × role × plan-gating matrix. | engineering | M02.3 | S | PROD-243 |
| BL-P1-PH6P61-PH | 1 | D-6.2-004 | posthog_event | Appendix G | 1 P1 posthog_event defects in Phase 6 — Prompt 6.1 — Cross-Console Mechanics (§25 + §4.7) End-to-End Audit | Register PostHog event in Appendix G with property schema and console scoping. | engineering | M02.3 | S | PROD-244 |
| BL-P1-PH6P61-SE | 1 | D-6.2-009 | surface_engine_mapping | Appendix M (lines 47961–end) | 1 P1 surface_engine_mapping defects in Phase 6 — Prompt 6.1 — Cross-Console Mechanics (§25 + §4.7) End-to-End Audit | Author Appendix M row with companion-doc anchor, tier visibility, override. | engineering | — | S | PROD-245 |
| BL-P1-PH6P61-WH | 5 | D-6.1-005, D-6.1-006, D-6.1-007, D-6.1-008, D-6.1-012 | webhook | §25.3.10b, §4.7.1, §25.5.7 | 5 P1 webhook defects in Phase 6 — Prompt 6.1 — Cross-Console Mechanics (§25 + §4.7) End-to-End Audit | Author webhook per §31: HMAC, idempotency, backoff, DLQ, Appendix C+G registration. | engineering | M02.3 | M | PROD-246 |

### Phase PT — §34.1 Plan-Tier Walk
| Cluster ID | Count | Sample IDs | Class | Sections | Summary | Recommendation | Owner | Pack | Effort | Linear ID |
|---|---:|---|---|---|---|---|---|---|---|---|
| BL-P1-PHPT-NUM | 2 | D-PT-001, D-PT-002 | numerical_singleton | §34.2.5, §34.1.2 | 2 P1 numerical_singleton defects in Phase PT — §34.1 Plan-Tier Walk | Move number to one §34/§39/§44 home; inline references cite the table. | engineering + pricing | — | S | PROD-247 |

### Phase CONS — §34.3 / §34.10 / §34.11 AI Consumption / Wallet / Outcome Resolver Walk
| Cluster ID | Count | Sample IDs | Class | Sections | Summary | Recommendation | Owner | Pack | Effort | Linear ID |
|---|---:|---|---|---|---|---|---|---|---|---|
| BL-P1-PHCONS-ACC | 1 | D-CONS-008 | acceptance_criteria | §4.8.1 | 1 P1 acceptance_criteria defects in Phase CONS — §34.3 / §34.10 / §34.11 AI Consumption / Wallet / Outcome Resolver Walk | Author numbered, testable, observable AC blocks per §13.10 style. | engineering | — | S | PROD-248 |
| BL-P1-PHCONS-API | 1 | D-CONS-011 | api | §34.3.2 | 1 P1 api defects in Phase CONS — §34.3 / §34.10 / §34.11 AI Consumption / Wallet / Outcome Resolver Walk | Author endpoint spec per §32: method/path/auth/rate-limit/cursor/schema/errors/idempotency. | engineering | M02.3 | S | PROD-249 |
| BL-P1-PHCONS-DM | 4 | D-CONS-003, D-CONS-009, D-CONS-010, D-CONS-013 | data_model | §34.3.1, §4.8.7, §34.10.3, §34.10.2 | 4 P1 data_model defects in Phase CONS — §34.3 / §34.10 / §34.11 AI Consumption / Wallet / Outcome Resolver Walk | Author missing entity field tables / retention / scope-isolation per §4 conventions. | engineering | M02.3 | M | PROD-250 |
| BL-P1-PHCONS-ENUM | 1 | D-CONS-006 | enum | §31.8 | 1 P1 enum defects in Phase CONS — §34.3 / §34.10 / §34.11 AI Consumption / Wallet / Outcome Resolver Walk | Register missing enum values in Appendix J and cite source location. | engineering | M02.3 | S | PROD-251 |
| BL-P1-PHCONS-NUM | 2 | D-CONS-004, D-CONS-005 | numerical_singleton | §34.3.3 | 2 P1 numerical_singleton defects in Phase CONS — §34.3 / §34.10 / §34.11 AI Consumption / Wallet / Outcome Resolver Walk | Move number to one §34/§39/§44 home; inline references cite the table. | engineering | — | S | PROD-252 |
| BL-P1-PHCONS-WH | 2 | D-CONS-007, D-CONS-012 | webhook | §34.3.1, §34.11.2 | 2 P1 webhook defects in Phase CONS — §34.3 / §34.10 / §34.11 AI Consumption / Wallet / Outcome Resolver Walk | Author webhook per §31: HMAC, idempotency, backoff, DLQ, Appendix C+G registration. | engineering | M02.3 | S | PROD-253 |

### Phase EM — §34.8 Entitlement Matrix Walk
| Cluster ID | Count | Sample IDs | Class | Sections | Summary | Recommendation | Owner | Pack | Effort | Linear ID |
|---|---:|---|---|---|---|---|---|---|---|---|
| BL-P1-PHEM-ACC | 3 | D-EM-010, D-EM-011, D-EM-020 | acceptance_criteria | §34.8.5 | 3 P1 acceptance_criteria defects in Phase EM — §34.8 Entitlement Matrix Walk | Author numbered, testable, observable AC blocks per §13.10 style. | engineering + UX | — | S | PROD-254 |
| BL-P1-PHEM-DRIFT | 1 | D-EM-013 | consistency_drift | §34.8.5 | 1 P1 consistency_drift defects in Phase EM — §34.8 Entitlement Matrix Walk | Normalize cross-doc/cross-section terminology; cite single authoritative home. | engineering + ops + pricing | — | S | DOC-032 |
| BL-P1-PHEM-DOC | 1 | D-EM-014 | documentation_gap | §34.8.3 | 1 P1 documentation_gap defects in Phase EM — §34.8 Entitlement Matrix Walk | Author missing spec content; cite authoritative source-of-truth. | engineering | — | S | DOC-033 |
| BL-P1-PHEM-ENT | 4 | D-EM-006, D-EM-007, D-EM-009, D-EM-018 | entitlement | §34.8.5 | 4 P1 entitlement defects in Phase EM — §34.8 Entitlement Matrix Walk | Add §34.8 entitlement matrix row with plan × capability × enforcement-mode. | engineering | — | M | PROD-255 |
| BL-P1-PHEM-ENUM | 1 | D-EM-005 | enum | §34.8.1 | 1 P1 enum defects in Phase EM — §34.8 Entitlement Matrix Walk | Register missing enum values in Appendix J and cite source location. | engineering + ops | M02.3 | S | PROD-256 |

### Phase MD — §34.16 Marketplace Discovery Pricing (Non-AI Layer) Walk
| Cluster ID | Count | Sample IDs | Class | Sections | Summary | Recommendation | Owner | Pack | Effort | Linear ID |
|---|---:|---|---|---|---|---|---|---|---|---|
| BL-P1-PHMD-API | 1 | D-MD-004 | api | §34.16.5 | 1 P1 api defects in Phase MD — §34.16 Marketplace Discovery Pricing (Non-AI Layer) Walk | Author endpoint spec per §32: method/path/auth/rate-limit/cursor/schema/errors/idempotency. | engineering + ops | M02.3 | S | PROD-257 |
| BL-P1-PHMD-DOC | 1 | D-MD-007 | documentation_gap | §34.16.4 | 1 P1 documentation_gap defects in Phase MD — §34.16 Marketplace Discovery Pricing (Non-AI Layer) Walk | Author missing spec content; cite authoritative source-of-truth. | engineering + ops | — | S | DOC-034 |
| BL-P1-PHMD-FW | 1 | D-MD-005 | firewall_leakage | §34.16.7 | 1 P1 firewall_leakage defects in Phase MD — §34.16 Marketplace Discovery Pricing (Non-AI Layer) Walk | Add console firewall guard with redaction-verification-hash invariant. | security + engineering | — | S | PROD-258 |
| BL-P1-PHMD-NUM | 2 | D-MD-002, D-MD-006 | numerical_singleton | §34.16.1, §34.16.5 | 2 P1 numerical_singleton defects in Phase MD — §34.16 Marketplace Discovery Pricing (Non-AI Layer) Walk | Move number to one §34/§39/§44 home; inline references cite the table. | engineering + pricing | — | S | PROD-259 |
| BL-P1-PHMD-PLAN | 2 | D-MD-001, D-MD-003 | plan_gating | §34.16, §34.16.1 | 2 P1 plan_gating defects in Phase MD — §34.16 Marketplace Discovery Pricing (Non-AI Layer) Walk | Add §5.11 / §34.1 / §39 rows; never duplicate inline; cite the table. | engineering | — | S | PROD-260 |

### Phase 8 — Prompt 8.1 — §32 API Endpoint Coverage & Conventions
| Cluster ID | Count | Sample IDs | Class | Sections | Summary | Recommendation | Owner | Pack | Effort | Linear ID |
|---|---:|---|---|---|---|---|---|---|---|---|
| BL-P1-PH8P81-API | 13 | D-V8.1-002, D-V8.1-003, D-V8.1-004, D-V8.1-005, D-V8.1-006 … +8 more | api | §4.8.4, §32.5, §30210, §4.5.2, §32.8.0 +4 more | 13 P1 api defects in Phase 8 — Prompt 8.1 — §32 API Endpoint Coverage & Conventions | Author endpoint spec per §32: method/path/auth/rate-limit/cursor/schema/errors/idempotency. | engineering | M02.3 | L | PROD-261 |
| BL-P1-PH8P81-DRIFT | 2 | D-V8.1-009, D-V8.1-010 | consistency_drift | §32.1, §22.18.7 | 2 P1 consistency_drift defects in Phase 8 — Prompt 8.1 — §32 API Endpoint Coverage & Conventions | Normalize cross-doc/cross-section terminology; cite single authoritative home. | engineering | M11.3 | S | DOC-035 |
| BL-P1-PH8P81-DM | 1 | D-V8.1-026 | data_model | §32.5 | 1 P1 data_model defects in Phase 8 — Prompt 8.1 — §32 API Endpoint Coverage & Conventions | Author missing entity field tables / retention / scope-isolation per §4 conventions. | engineering | M02.3 | S | PROD-262 |
| BL-P1-PH8P81-DOC | 2 | D-V8.1-001, D-V8.1-011 | documentation_gap | §32.5, §32.4 | 2 P1 documentation_gap defects in Phase 8 — Prompt 8.1 — §32 API Endpoint Coverage & Conventions | Author missing spec content; cite authoritative source-of-truth. | engineering | — | S | DOC-036 |
| BL-P1-PH8P81-ENUM | 4 | D-V8.1-012, D-V8.1-013, D-8.2-007, D-8.2-011 | enum | §47155, §27.10.6, §19085, §31.9.6 | 4 P1 enum defects in Phase 8 — Prompt 8.1 — §32 API Endpoint Coverage & Conventions | Register missing enum values in Appendix J and cite source location. | engineering | M02.3 | M | PROD-263 |
| BL-P1-PH8P81-EC | 2 | D-V8.1-016, D-V8.1-020 | error_code | §32.8, §32.9.1 | 2 P1 error_code defects in Phase 8 — Prompt 8.1 — §32 API Endpoint Coverage & Conventions | Add Appendix I row with HTTP status, retry semantics, user-facing copy. | engineering | M02.3 | S | PROD-264 |
| BL-P1-PH8P81-NUM | 2 | D-8.2-004, D-8.2-005 | numerical_singleton | §31.1, §29.5 | 2 P1 numerical_singleton defects in Phase 8 — Prompt 8.1 — §32 API Endpoint Coverage & Conventions | Move number to one §34/§39/§44 home; inline references cite the table. | engineering | — | S | PROD-265 |
| BL-P1-PH8P81-SM | 1 | D-V8.1-022 | state_machine | §32.8.13 | 1 P1 state_machine defects in Phase 8 — Prompt 8.1 — §32 API Endpoint Coverage & Conventions | Replace prose with From/To/Trigger/Conditions table; cover concurrency / re-drive. | engineering | — | S | PROD-266 |
| BL-P1-PH8P81-WH | 13 | D-V8.1-021, D-8.2-001, D-8.2-002, D-8.2-003, D-8.2-006 … +8 more | webhook | §32.8.23, §31.2, §31.6, §31.9.10, §31 +3 more | 13 P1 webhook defects in Phase 8 — Prompt 8.1 — §32 API Endpoint Coverage & Conventions | Author webhook per §31: HMAC, idempotency, backoff, DLQ, Appendix C+G registration. | engineering | M02.3 | L | PROD-267 |

### Phase 8 — Prompt 8.3 — Appendix C Notification Event Catalog
| Cluster ID | Count | Sample IDs | Class | Sections | Summary | Recommendation | Owner | Pack | Effort | Linear ID |
|---|---:|---|---|---|---|---|---|---|---|---|
| BL-P1-PH8P83-DRIFT | 2 | D-V8.3-001, D-V8.3-006 | consistency_drift | §31.9.10, §29.1 | 2 P1 consistency_drift defects in Phase 8 — Prompt 8.3 — Appendix C Notification Event Catalog | Normalize cross-doc/cross-section terminology; cite single authoritative home. | engineering | — | S | DOC-037 |
| BL-P1-PH8P83-DSAR | 1 | D-V8.3-026 | dsar | §29.7 | 1 P1 dsar defects in Phase 8 — Prompt 8.3 — Appendix C Notification Event Catalog | Author §6.8 DSAR cascade row with subject-rights coverage and erasure handling. | security + engineering | — | S | PROD-268 |
| BL-P1-PH8P83-NOTIF | 10 | D-V8.3-002, D-V8.3-003, D-V8.3-004, D-V8.3-005, D-V8.3-007 … +5 more | notification | Appendix C CRM-Sync-Domain (li, §44.6.5, §35457, §50.15.9, §31.8 +5 more | 10 P1 notification defects in Phase 8 — Prompt 8.3 — Appendix C Notification Event Catalog | Register notification in Appendix C with channel × role × plan-gating matrix. | engineering | M02.3 | M | PROD-269 |
| BL-P1-PH8P83-RET | 1 | D-V8.3-013 | retention | §40.2 | 1 P1 retention defects in Phase 8 — Prompt 8.3 — Appendix C Notification Event Catalog | Add §40.2 retention row per data class with TTL, anonymization, DSAR cascade. | engineering + ops | — | S | PROD-270 |

### Phase 9 — Prompt 9.1 — Appendix G PostHog Event Taxonomy End-to-End Walk
| Cluster ID | Count | Sample IDs | Class | Sections | Summary | Recommendation | Owner | Pack | Effort | Linear ID |
|---|---:|---|---|---|---|---|---|---|---|---|
| BL-P1-PH9P91-DRIFT | 1 | D-9.1-016 | consistency_drift | §48 | 1 P1 consistency_drift defects in Phase 9 — Prompt 9.1 — Appendix G PostHog Event Taxonomy End-to-End Walk | Normalize cross-doc/cross-section terminology; cite single authoritative home. | engineering | — | S | DOC-038 |
| BL-P1-PH9P91-ENUM | 1 | D-9.1-008 | enum | §49.1 | 1 P1 enum defects in Phase 9 — Prompt 9.1 — Appendix G PostHog Event Taxonomy End-to-End Walk | Register missing enum values in Appendix J and cite source location. | analytics | M02.3 | S | PROD-271 |
| BL-P1-PH9P91-INSTR | 6 | D-9.1-001, D-9.1-004, D-9.1-005, D-9.1-006, D-9.1-010 … +1 more | instrumentation_gap | §13.11.13, Appendix C Phase 3V events (li, §34.16.7, §31.8, §13.12 +1 more | 6 P1 instrumentation_gap defects in Phase 9 — Prompt 9.1 — Appendix G PostHog Event Taxonomy End-to-End Walk | Author Appendix G PostHog + Datadog metric + AuditEvent triad. | engineering | — | M | PROD-272 |
| BL-P1-PH9P91-NAMING | 1 | D-9.1-007 | naming convention | §48.3.5 | 1 P1 naming convention defects in Phase 9 — Prompt 9.1 — Appendix G PostHog Event Taxonomy End-to-End Walk | Author missing spec per Master Spec conventions; cite single authoritative home. | engineering | — | S | PROD-273 |
| BL-P1-PH9P91-RET | 1 | D-9.1-019 | retention | Appendix G preamble line 42416 | 1 P1 retention defects in Phase 9 — Prompt 9.1 — Appendix G PostHog Event Taxonomy End-to-End Walk | Add §40.2 retention row per data class with TTL, anonymization, DSAR cascade. | engineering | — | S | PROD-274 |

### Phase 9 — Prompt 9.1 — Retention Per Data Class (§40.2) End-to-End Walk
| Cluster ID | Count | Sample IDs | Class | Sections | Summary | Recommendation | Owner | Pack | Effort | Linear ID |
|---|---:|---|---|---|---|---|---|---|---|---|
| BL-P1-PH9P91-RET | 5 | D-9.1R-006, D-9.1R-011, D-9.1R-012, D-9.1R-013, D-9.1R-017 | retention | §40.2 | 5 P1 retention defects in Phase 9 — Prompt 9.1 — Retention Per Data Class (§40.2) End-to-End Walk | Add §40.2 retention row per data class with TTL, anonymization, DSAR cascade. | engineering | — | M | PROD-275 |

### Phase 9 — Prompt 9.2 — DSAR / Right-to-Erasure Cross-Cascade Integrity Walk (§6.8)
| Cluster ID | Count | Sample IDs | Class | Sections | Summary | Recommendation | Owner | Pack | Effort | Linear ID |
|---|---:|---|---|---|---|---|---|---|---|---|
| BL-P1-PH9P92-DSAR | 1 | D-9.2-010 | dsar | §6.8.6 | 1 P1 dsar defects in Phase 9 — Prompt 9.2 — DSAR / Right-to-Erasure Cross-Cascade Integrity Walk (§6.8) | Author §6.8 DSAR cascade row with subject-rights coverage and erasure handling. | legal | — | S | PROD-276 |
| BL-P1-PH9P92-NUM | 1 | D-9.2-008 | numerical_singleton | §4.4.12 | 1 P1 numerical_singleton defects in Phase 9 — Prompt 9.2 — DSAR / Right-to-Erasure Cross-Cascade Integrity Walk (§6.8) | Move number to one §34/§39/§44 home; inline references cite the table. | engineering | — | S | PROD-277 |
| BL-P1-PH9P92-RES | 1 | D-9.2-003 | residency | §6.8.4.2 | 1 P1 residency defects in Phase 9 — Prompt 9.2 — DSAR / Right-to-Erasure Cross-Cascade Integrity Walk (§6.8) | Add §1.6 / §40 / §42 residency clause for US/EU/custom region behavior. | engineering | — | S | PROD-278 |

### Phase 9 — Prompt 9.3 — Data Residency Walk (§1.6 + §6.8 + §40 + §42)
| Cluster ID | Count | Sample IDs | Class | Sections | Summary | Recommendation | Owner | Pack | Effort | Linear ID |
|---|---:|---|---|---|---|---|---|---|---|---|
| BL-P1-PH9P93-DRIFT | 3 | D-RES-003, D-RES-006, D-RES-015 | consistency_drift | §1.6, §47.4, §4.8.1 | 3 P1 consistency_drift defects in Phase 9 — Prompt 9.3 — Data Residency Walk (§1.6 + §6.8 + §40 + §42) | Normalize cross-doc/cross-section terminology; cite single authoritative home. | engineering | — | S | DOC-039 |
| BL-P1-PH9P93-DOC | 1 | D-RES-005 | documentation_gap | §40.4 | 1 P1 documentation_gap defects in Phase 9 — Prompt 9.3 — Data Residency Walk (§1.6 + §6.8 + §40 + §42) | Author missing spec content; cite authoritative source-of-truth. | engineering | — | S | DOC-040 |
| BL-P1-PH9P93-NUM | 1 | D-RES-008 | numerical_singleton | §4.1.1 | 1 P1 numerical_singleton defects in Phase 9 — Prompt 9.3 — Data Residency Walk (§1.6 + §6.8 + §40 + §42) | Move number to one §34/§39/§44 home; inline references cite the table. | engineering | — | S | PROD-279 |
| BL-P1-PH9P93-RES | 3 | D-RES-007, D-RES-009, D-RES-010 | residency | §1.6, §6.7, §6.8.1 | 3 P1 residency defects in Phase 9 — Prompt 9.3 — Data Residency Walk (§1.6 + §6.8 + §40 + §42) | Add §1.6 / §40 / §42 residency clause for US/EU/custom region behavior. | engineering + ops + legal | — | S | PROD-280 |

### Phase SS — UI Surface State Coverage Audit
| Cluster ID | Count | Sample IDs | Class | Sections | Summary | Recommendation | Owner | Pack | Effort | Linear ID |
|---|---:|---|---|---|---|---|---|---|---|---|
| BL-P1-PHSS-ACC | 39 | D-SS-001, D-SS-002, D-SS-003, D-SS-004, D-SS-005 … +34 more | acceptance_criteria | §24.3, §24.4, §24.5, §20.1, §20.5 +34 more | 39 P1 acceptance_criteria defects in Phase SS — UI Surface State Coverage Audit | Author numbered, testable, observable AC blocks per §13.10 style. | engineering | M11.3 | XL | PROD-281 |
| BL-P1-PHSS-SM | 2 | D-SS-007, D-SS-008 | state_machine | §8.3.1, §8.3.2 | 2 P1 state_machine defects in Phase SS — UI Surface State Coverage Audit | Replace prose with From/To/Trigger/Conditions table; cover concurrency / re-drive. | engineering | — | S | PROD-282 |

### Phase 37 — §37 Accessibility & Internationalization End-to-End Audit
| Cluster ID | Count | Sample IDs | Class | Sections | Summary | Recommendation | Owner | Pack | Effort | Linear ID |
|---|---:|---|---|---|---|---|---|---|---|---|
| BL-P1-PH37-ACC | 1 | D-37-004 | acceptance_criteria | §37.5 | 1 P1 acceptance_criteria defects in Phase 37 — §37 Accessibility & Internationalization End-to-End Audit | Author numbered, testable, observable AC blocks per §13.10 style. | engineering + design | M24.3 | S | PROD-283 |
| BL-P1-PH37-A11Y | 5 | D-37-001, D-37-006, D-37-007, D-37-008, D-37-009 | accessibility | §37.1, §37.4, §37 | 5 P1 accessibility defects in Phase 37 — §37 Accessibility & Internationalization End-to-End Audit | Add §37 WCAG 2.1 AA criterion (contrast, keyboard, ARIA, focus, screen-reader). | design + engineering | M24.3 | M | PROD-284 |
| BL-P1-PH37-DRIFT | 1 | D-37-002 | consistency_drift | §37.3 | 1 P1 consistency_drift defects in Phase 37 — §37 Accessibility & Internationalization End-to-End Audit | Normalize cross-doc/cross-section terminology; cite single authoritative home. | engineering | M24.3 | S | DOC-041 |
| BL-P1-PH37-DOC | 1 | D-37-003 | documentation_gap | §37.4 | 1 P1 documentation_gap defects in Phase 37 — §37 Accessibility & Internationalization End-to-End Audit | Author missing spec content; cite authoritative source-of-truth. | engineering + design | M24.3 | S | DOC-042 |
| BL-P1-PH37-SE | 1 | D-37-005 | surface_engine_mapping | Appendix M.1 (line 48982 onwar | 1 P1 surface_engine_mapping defects in Phase 37 — §37 Accessibility & Internationalization End-to-End Audit | Author Appendix M row with companion-doc anchor, tier visibility, override. | engineering | — | S | PROD-285 |

### Phase 38 — §38 Responsive Design & Platform Support End-to-End Audit
| Cluster ID | Count | Sample IDs | Class | Sections | Summary | Recommendation | Owner | Pack | Effort | Linear ID |
|---|---:|---|---|---|---|---|---|---|---|---|
| BL-P1-PH38-A11Y | 1 | D-38-008 | accessibility | §38.6.2 | 1 P1 accessibility defects in Phase 38 — §38 Responsive Design & Platform Support End-to-End Audit | Add §37 WCAG 2.1 AA criterion (contrast, keyboard, ARIA, focus, screen-reader). | engineering + design | M24.3 | S | PROD-286 |
| BL-P1-PH38-CI | 2 | D-38-005, D-38-006 | ci_gate | §38.6.5, §38.7.4 | 2 P1 ci_gate defects in Phase 38 — §38 Responsive Design & Platform Support End-to-End Audit | Promote gate from spec_binding_pending to runtime_active under M02.3 / release. | engineering | release-orchestration | S | PROD-287 |
| BL-P1-PH38-ENUM | 1 | D-38-001 | enum | §38.6.1 | 1 P1 enum defects in Phase 38 — §38 Responsive Design & Platform Support End-to-End Audit | Register missing enum values in Appendix J and cite source location. | engineering | M02.3 | S | PROD-288 |
| BL-P1-PH38-EC | 1 | D-38-003 | error_code | §38.7.5 | 1 P1 error_code defects in Phase 38 — §38 Responsive Design & Platform Support End-to-End Audit | Add Appendix I row with HTTP status, retry semantics, user-facing copy. | engineering | M02.3 | S | PROD-289 |
| BL-P1-PH38-FW | 1 | D-38-020 | firewall_leakage | §38.6.3 | 1 P1 firewall_leakage defects in Phase 38 — §38 Responsive Design & Platform Support End-to-End Audit | Add console firewall guard with redaction-verification-hash invariant. | engineering + security | M24.3 | S | PROD-290 |
| BL-P1-PH38-PERF | 1 | D-38-009 | performance_budget | §38 | 1 P1 performance_budget defects in Phase 38 — §38 Responsive Design & Platform Support End-to-End Audit | Author §44 performance budget row with p95/p99 SLO and degradation behavior. | engineering | M24.3 | S | PROD-291 |
| BL-P1-PH38-PH | 1 | D-38-002 | posthog_event | §38.6 | 1 P1 posthog_event defects in Phase 38 — §38 Responsive Design & Platform Support End-to-End Audit | Register PostHog event in Appendix G with property schema and console scoping. | engineering + analytics | M02.3 | S | PROD-292 |
| BL-P1-PH38-SE | 1 | D-38-004 | surface_engine_mapping | §38 | 1 P1 surface_engine_mapping defects in Phase 38 — §38 Responsive Design & Platform Support End-to-End Audit | Author Appendix M row with companion-doc anchor, tier visibility, override. | engineering | M24.3 | S | PROD-293 |

### Phase 44 — §44 Performance Requirements & Solo-Tier Surface Treatment End-to-End Audit
| Cluster ID | Count | Sample IDs | Class | Sections | Summary | Recommendation | Owner | Pack | Effort | Linear ID |
|---|---:|---|---|---|---|---|---|---|---|---|
| BL-P1-PH44-CI | 1 | D-44-003 | ci_gate | §44 | 1 P1 ci_gate defects in Phase 44 — §44 Performance Requirements & Solo-Tier Surface Treatment End-to-End Audit | Promote gate from spec_binding_pending to runtime_active under M02.3 / release. | engineering | release-orchestration | S | PROD-294 |
| BL-P1-PH44-ENT | 1 | D-44-008 | entitlement | §44.6.3 | 1 P1 entitlement defects in Phase 44 — §44 Performance Requirements & Solo-Tier Surface Treatment End-to-End Audit | Add §34.8 entitlement matrix row with plan × capability × enforcement-mode. | pricing + engineering | M24.3 | S | PROD-295 |
| BL-P1-PH44-NUM | 1 | D-44-005 | numerical_singleton | §44.2 | 1 P1 numerical_singleton defects in Phase 44 — §44 Performance Requirements & Solo-Tier Surface Treatment End-to-End Audit | Move number to one §34/§39/§44 home; inline references cite the table. | engineering | M24.3 | S | PROD-296 |
| BL-P1-PH44-PERF | 1 | D-44-001 | performance_budget | §44.1 | 1 P1 performance_budget defects in Phase 44 — §44 Performance Requirements & Solo-Tier Surface Treatment End-to-End Audit | Author §44 performance budget row with p95/p99 SLO and degradation behavior. | engineering | M24.3 | S | PROD-297 |
| BL-P1-PH44-SE | 1 | D-44-006 | surface_engine_mapping | §44.6.1 | 1 P1 surface_engine_mapping defects in Phase 44 — §44 Performance Requirements & Solo-Tier Surface Treatment End-to-End Audit | Author Appendix M row with companion-doc anchor, tier visibility, override. | engineering | M24.3 | S | PROD-298 |

### Phase 11.4 — Surface/Engine Cross-Reference Audit
| Cluster ID | Count | Sample IDs | Class | Sections | Summary | Recommendation | Owner | Pack | Effort | Linear ID |
|---|---:|---|---|---|---|---|---|---|---|---|
| BL-P1-PH114-SE | 1 | D-11.4-001 | surface_engine_mapping | §1.. | 1 P1 surface_engine_mapping defects in Phase 11.4 — Surface/Engine Cross-Reference Audit | Author Appendix M row with companion-doc anchor, tier visibility, override. | engineering | — | S | PROD-299 |

### Phase V11 — Adversarial Verification of Phase 11
| Cluster ID | Count | Sample IDs | Class | Sections | Summary | Recommendation | Owner | Pack | Effort | Linear ID |
|---|---:|---|---|---|---|---|---|---|---|---|
| BL-P1-PHV11-CI | 2 | D-11V-003, D-11V-005 | ci_gate | §M.5 | 2 P1 ci_gate defects in Phase V11 — Adversarial Verification of Phase 11 | Promote gate from spec_binding_pending to runtime_active under M02.3 / release. | engineering + security | release-orchestration | S | PROD-300 |

### Phase 48.3 — §48 Network Effects Walk
| Cluster ID | Count | Sample IDs | Class | Sections | Summary | Recommendation | Owner | Pack | Effort | Linear ID |
|---|---:|---|---|---|---|---|---|---|---|---|
| BL-P1-PH483-NET | 2 | D-48.3-001, D-48.3-002 | network_effect_gap | §48.3 | 2 P1 network_effect_gap defects in Phase 48.3 — §48 Network Effects Walk | Author §48 network-effect loop row with measurement and feedback path. | analytics + product | — | S | DOC-043 |

### Phase 51 — §51 Product Usage Analytics & PLG Instrumentation Walk
| Cluster ID | Count | Sample IDs | Class | Sections | Summary | Recommendation | Owner | Pack | Effort | Linear ID |
|---|---:|---|---|---|---|---|---|---|---|---|
| BL-P1-PH51-API | 1 | D-51-008 | api | §51.3.5 | 1 P1 api defects in Phase 51 — §51 Product Usage Analytics & PLG Instrumentation Walk | Author endpoint spec per §32: method/path/auth/rate-limit/cursor/schema/errors/idempotency. | engineering | M02.3 | S | PROD-301 |
| BL-P1-PH51-ENUM | 1 | D-51-009 | enum | §51.2.5 | 1 P1 enum defects in Phase 51 — §51 Product Usage Analytics & PLG Instrumentation Walk | Register missing enum values in Appendix J and cite source location. | engineering | M02.3 | S | PROD-302 |
| BL-P1-PH51-INSTR | 5 | D-51-001, D-51-002, D-51-003, D-51-011, D-51-012 | instrumentation_gap | §51, §51.1.5 | 5 P1 instrumentation_gap defects in Phase 51 — §51 Product Usage Analytics & PLG Instrumentation Walk | Author Appendix G PostHog + Datadog metric + AuditEvent triad. | analytics + product | — | M | PROD-303 |
| BL-P1-PH51-PLAN | 4 | D-51-004, D-51-005, D-51-006, D-51-007 | plan_gating | §51.3.6 | 4 P1 plan_gating defects in Phase 51 — §51 Product Usage Analytics & PLG Instrumentation Walk | Add §5.11 / §34.1 / §39 rows; never duplicate inline; cite the table. | pricing + engineering | — | M | PROD-304 |
| BL-P1-PH51-PH | 1 | D-51-013 | posthog_event | §51.5.3 | 1 P1 posthog_event defects in Phase 51 — §51 Product Usage Analytics & PLG Instrumentation Walk | Register PostHog event in Appendix G with property schema and console scoping. | engineering + analytics | M02.3 | S | PROD-305 |
| BL-P1-PH51-RET | 1 | D-51-010 | retention | §40.2 | 1 P1 retention defects in Phase 51 — §51 Product Usage Analytics & PLG Instrumentation Walk | Add §40.2 retention row per data class with TTL, anonymization, DSAR cascade. | engineering + legal | — | S | PROD-306 |

### Phase HM — Hero Moment Walk (Buyer-side + Seller-side)
| Cluster ID | Count | Sample IDs | Class | Sections | Summary | Recommendation | Owner | Pack | Effort | Linear ID |
|---|---:|---|---|---|---|---|---|---|---|---|
| BL-P1-PHHM-ACC | 3 | D-HM-001, D-HM-006, D-HM-009 | acceptance_criteria | §4.4.22, §48.8.10 | 3 P1 acceptance_criteria defects in Phase HM — Hero Moment Walk (Buyer-side + Seller-side) | Author numbered, testable, observable AC blocks per §13.10 style. | engineering | — | S | PROD-307 |
| BL-P1-PHHM-GROW | 1 | D-HM-002 | growth_mechanic_gap | §35.1 | 1 P1 growth_mechanic_gap defects in Phase HM — Hero Moment Walk (Buyer-side + Seller-side) | Author §48 growth-mechanic loop row with conversion gate and amplifier. | analytics + engineering | — | S | DOC-044 |
| BL-P1-PHHM-PH | 2 | D-HM-003, D-HM-004 | posthog_event | §48.8.3 | 2 P1 posthog_event defects in Phase HM — Hero Moment Walk (Buyer-side + Seller-side) | Register PostHog event in Appendix G with property schema and console scoping. | engineering | M02.3 | S | PROD-308 |

### Phase 13V — Adversarial Verification of Phase 13 (§48 + §51 PLG, Growth, Analytics)
| Cluster ID | Count | Sample IDs | Class | Sections | Summary | Recommendation | Owner | Pack | Effort | Linear ID |
|---|---:|---|---|---|---|---|---|---|---|---|
| BL-P1-PH13V-ACC | 2 | D-13V-004, D-13V-023 | acceptance_criteria | §48.7.3, §48.8.4 | 2 P1 acceptance_criteria defects in Phase 13V — Adversarial Verification of Phase 13 (§48 + §51 PLG, Growth, Analytics) | Author numbered, testable, observable AC blocks per §13.10 style. | engineering | — | S | PROD-309 |
| BL-P1-PH13V-DOC | 2 | D-13V-001, D-13V-002 | documentation_gap | §48.2.1, §48.4 | 2 P1 documentation_gap defects in Phase 13V — Adversarial Verification of Phase 13 (§48 + §51 PLG, Growth, Analytics) | Author missing spec content; cite authoritative source-of-truth. | engineering + analytics | — | S | DOC-045 |
| BL-P1-PH13V-INSTR | 2 | D-13V-008, D-13V-022 | instrumentation_gap | §48.7.3, §48.8.9 | 2 P1 instrumentation_gap defects in Phase 13V — Adversarial Verification of Phase 13 (§48 + §51 PLG, Growth, Analytics) | Author Appendix G PostHog + Datadog metric + AuditEvent triad. | engineering + analytics | — | S | PROD-310 |

### Phase 14.1 — Master Spec ↔ Buyer Pricing Strategy v3 Cross-Doc Consistency Walk
| Cluster ID | Count | Sample IDs | Class | Sections | Summary | Recommendation | Owner | Pack | Effort | Linear ID |
|---|---:|---|---|---|---|---|---|---|---|---|
| BL-P1-PH141-DRIFT | 4 | D-14.1-001, D-14.1-002, D-14.1-003, D-14.1-010 | consistency_drift | §34.18.6, §34.9, §34.5, §34.17 | 4 P1 consistency_drift defects in Phase 14.1 — Master Spec ↔ Buyer Pricing Strategy v3 Cross-Doc Consistency Walk | Normalize cross-doc/cross-section terminology; cite single authoritative home. | pricing | — | M | DOC-046 |

### Phase 14.2 — Master Spec ↔ Seller Pricing Strategy v3 Cross-Doc Consistency Walk
| Cluster ID | Count | Sample IDs | Class | Sections | Summary | Recommendation | Owner | Pack | Effort | Linear ID |
|---|---:|---|---|---|---|---|---|---|---|---|
| BL-P1-PH142-DRIFT | 5 | D-14.2-001, D-14.2-002, D-14.2-003, D-14.2-004, D-14.2-005 | consistency_drift | §34.18.6, §34.9, §34.5, §34.17, §48.1.7 | 5 P1 consistency_drift defects in Phase 14.2 — Master Spec ↔ Seller Pricing Strategy v3 Cross-Doc Consistency Walk | Normalize cross-doc/cross-section terminology; cite single authoritative home. | engineering | — | M | DOC-047 |

### Phase KB18 — KB Engineering Spec §0–§18 vs Master Spec §22 Exhaustive Cross-Check
| Cluster ID | Count | Sample IDs | Class | Sections | Summary | Recommendation | Owner | Pack | Effort | Linear ID |
|---|---:|---|---|---|---|---|---|---|---|---|
| BL-P1-PHKB18-ENUM | 1 | D-KB18-001 | enum | §22.8.4.7 | 1 P1 enum defects in Phase KB18 — KB Engineering Spec §0–§18 vs Master Spec §22 Exhaustive Cross-Check | Register missing enum values in Appendix J and cite source location. | engineering | M02.3 | S | PROD-311 |
| BL-P1-PHKB18-NUM | 2 | D-KB18-003, D-KB18-004 | numerical_singleton | §22.8.4.1 | 2 P1 numerical_singleton defects in Phase KB18 — KB Engineering Spec §0–§18 vs Master Spec §22 Exhaustive Cross-Check | Move number to one §34/§39/§44 home; inline references cite the table. | engineering | M11.3 | S | PROD-312 |

### Phase AE — Authored Extensions Ledger Audit
| Cluster ID | Count | Sample IDs | Class | Sections | Summary | Recommendation | Owner | Pack | Effort | Linear ID |
|---|---:|---|---|---|---|---|---|---|---|---|
| BL-P1-PHAE-AE | 4 | D-AE-006, D-AE-011, D-AE-013, D-AE-015 | authored_extension | AE-12.1-DEF-01 through AE-12.1, §16, `_integration/AUTHORED_EXTENSI, AE-V11-04 (line 503) | 4 P1 authored_extension defects in Phase AE — Authored Extensions Ledger Audit | Ratify AE in _integration/AUTHORED_EXTENSIONS_LEDGER.md with owner sign-off. | engineering | — | M | PROD-313 |
| BL-P1-PHAE-DOC | 3 | D-AE-001, D-AE-002, D-AE-004 | documentation_gap | `_integration/AUTHORED_EXTENSI | 3 P1 documentation_gap defects in Phase AE — Authored Extensions Ledger Audit | Author missing spec content; cite authoritative source-of-truth. | engineering | — | S | DOC-048 |

### Phase DEC — Decisions Ledger ↔ Master Spec Reconciliation
| Cluster ID | Count | Sample IDs | Class | Sections | Summary | Recommendation | Owner | Pack | Effort | Linear ID |
|---|---:|---|---|---|---|---|---|---|---|---|
| BL-P1-PHDEC-ACC | 1 | D-DEC-007 | acceptance_criteria | §4.3.17 | 1 P1 acceptance_criteria defects in Phase DEC — Decisions Ledger ↔ Master Spec Reconciliation | Author numbered, testable, observable AC blocks per §13.10 style. | sales-ops | — | S | PROD-314 |
| BL-P1-PHDEC-DM | 2 | D-DEC-002, D-DEC-003 | data_model | §4.3.11, §4.8.1 | 2 P1 data_model defects in Phase DEC — Decisions Ledger ↔ Master Spec Reconciliation | Author missing entity field tables / retention / scope-isolation per §4 conventions. | engineering | M02.3 | S | PROD-315 |
| BL-P1-PHDEC-DATAMO | 1 | D-DEC-001 | data_model (V14R: scope expanded to also cover AIWallet `*_value_dollars` Integer-cents naming-vs-storage drift; documentation surface remediated; substantive Convex rename remains E-1 ratification scope) | §4.3.16 | 1 P1 data_model (V14R: scope expanded to also cover AIWallet `*_value_dollars` Integer-cents naming-vs-storage drift; documentation surface… | Author missing spec per Master Spec conventions; cite single authoritative home. | engineering | — | S | PROD-316 |
| BL-P1-PHDEC-FW | 1 | D-DEC-004 | firewall_leakage | §22.9.6 | 1 P1 firewall_leakage defects in Phase DEC — Decisions Ledger ↔ Master Spec Reconciliation | Add console firewall guard with redaction-verification-hash invariant. | engineering + console-bridge-owner | M11.3 | S | PROD-317 |
| BL-P1-PHDEC-NUM | 1 | D-DEC-005 | numerical_singleton | §34.10.3 | 1 P1 numerical_singleton defects in Phase DEC — Decisions Ledger ↔ Master Spec Reconciliation | Move number to one §34/§39/§44 home; inline references cite the table. | sales-ops + founder | — | S | PROD-318 |
| BL-P1-PHDEC-NUMERI | 1 | D-DEC-008 | numerical_singleton (V14R: scope expanded to cover §27 PATCH | §4.8.3 | 1 P1 numerical_singleton (V14R: scope expanded to cover §27 PATCH defects in Phase DEC — Decisions Ledger ↔ Master Spec Reconciliation | Author missing spec per Master Spec conventions; cite single authoritative home. | engineering + finance | — | S | PROD-319 |

### Phase V711 — v7.1.1 Readiness Audit
| Cluster ID | Count | Sample IDs | Class | Sections | Summary | Recommendation | Owner | Pack | Effort | Linear ID |
|---|---:|---|---|---|---|---|---|---|---|---|
| BL-P1-PHV711-ACC | 2 | D-V711-001, D-V711-006 | acceptance_criteria | `_integration/RECONCILIATION.m, `_audit/REMEDIATION_BACKLOG.md | 2 P1 acceptance_criteria defects in Phase V711 — v7.1.1 Readiness Audit | Author numbered, testable, observable AC blocks per §13.10 style. | engineering | — | S | PROD-320 |
| BL-P1-PHV711-CI | 2 | D-V711-007, D-V711-009 | ci_gate | §M.5, §2.8.7 | 2 P1 ci_gate defects in Phase V711 — v7.1.1 Readiness Audit | Promote gate from spec_binding_pending to runtime_active under M02.3 / release. | engineering | release-orchestration | S | PROD-321 |
| BL-P1-PHV711-DRIFT | 2 | D-V711-008, D-V711-013 | consistency_drift | §6, `_integration/RECONCILIATION.m | 2 P1 consistency_drift defects in Phase V711 — v7.1.1 Readiness Audit | Normalize cross-doc/cross-section terminology; cite single authoritative home. | engineering + founder | — | S | DOC-049 |
| BL-P1-PHV711-DOC | 1 | D-V711-003 | documentation_gap | §M.5 | 1 P1 documentation_gap defects in Phase V711 — v7.1.1 Readiness Audit | Author missing spec content; cite authoritative source-of-truth. | engineering + documentation | release-orchestration | S | DOC-050 |
| BL-P1-PHV711-NUM | 1 | D-V711-002 | numerical_singleton | §6 | 1 P1 numerical_singleton defects in Phase V711 — v7.1.1 Readiness Audit | Move number to one §34/§39/§44 home; inline references cite the table. | engineering | — | S | PROD-322 |

## Top-25 clusters by size
| Rank | Cluster ID | Phase | Class | Count | Linear ID |
|---:|---|---|---|---:|---|
| 1 | BL-P1-PHSS-ACC | Phase SS — UI Surface State Coverage Audit | acceptance_criteria | 39 | PROD-281 |
| 2 | BL-P1-PH22-ENUM | Phase 2.2 | enum | 24 | PROD-010 |
| 3 | BL-P1-PH32-PLAN | Phase 3.2 | plan_gating | 20 | PROD-028 |
| 4 | BL-P1-PH31-RBAC | Phase 3.1 | rbac | 13 | PROD-027 |
| 5 | BL-P1-PH8P81-API | Phase 8 — Prompt 8.1 — §32 API Endpoint Coverage & Conventions | api | 13 | PROD-261 |
| 6 | BL-P1-PH8P81-WH | Phase 8 — Prompt 8.1 — §32 API Endpoint Coverage & Conventions | webhook | 13 | PROD-267 |
| 7 | BL-P1-PH11-DM | Phase 1.1 | data_model | 11 | PROD-004 |
| 8 | BL-P1-PH8P83-NOTIF | Phase 8 — Prompt 8.3 — Appendix C Notification Event Catalog | notification | 10 | PROD-269 |
| 9 | BL-P1-PH33-DOC | Phase 3.3 | documentation_gap | 9 | DOC-006 |
| 10 | BL-P1-PH35-DSAR | Phase 3.5 | dsar | 8 | PROD-043 |
| 11 | BL-P1-PH12-DM | Phase 1.2 | data_model | 7 | PROD-007 |
| 12 | BL-P1-PH5P53-DM | Phase 5 — Prompt 5.3 — §22.9–§22.20 KB Retrieval / Skills / Lifecycle / Maya Cross-Reference Audit | data_model | 7 | PROD-186 |
| 13 | BL-P1-PH22-FW | Phase 2.2 | firewall_leakage | 6 | PROD-011 |
| 14 | BL-P1-PH4P412-DRIFT | Phase 4 — Prompt 4.12 — §21 The Sourcera Agent End-to-End Audit | consistency_drift | 6 | DOC-016 |
| 15 | BL-P1-PH4P44-NUM | Phase 4 — Prompt 4.4 — §13 Scoring & Grading End-to-End Audit | numerical_singleton | 6 | PROD-095 |
| 16 | BL-P1-PH4P46-DM | Phase 4 — Prompt 4.6 — §15 TCO Modeling End-to-End Audit | data_model | 6 | PROD-108 |
| 17 | BL-P1-PH9P91-INSTR | Phase 9 — Prompt 9.1 — Appendix G PostHog Event Taxonomy End-to-End Walk | instrumentation_gap | 6 | PROD-272 |
| 18 | BL-P1-PH142-DRIFT | Phase 14.2 — Master Spec ↔ Seller Pricing Strategy v3 Cross-Doc Consistency Walk | consistency_drift | 5 | DOC-047 |
| 19 | BL-P1-PH22-NUM | Phase 2.2 | numerical_singleton | 5 | PROD-012 |
| 20 | BL-P1-PH24-DM | Phase 24 — §24 Seller Console: Q&A, NDA, Inbox & Pulse Walk | data_model | 5 | PROD-199 |
| 21 | BL-P1-PH3419-DM | Phase 34.19 — Plan Upgrade / Downgrade & Seller Carry-Over | data_model | 5 | PROD-165 |
| 22 | BL-P1-PH37-A11Y | Phase 37 — §37 Accessibility & Internationalization End-to-End Audit | accessibility | 5 | PROD-284 |
| 23 | BL-P1-PH4P411-DM | Phase 4 — Prompt 4.11 — §20 Inbox & Pulse End-to-End Audit | data_model | 5 | PROD-150 |
| 24 | BL-P1-PH42-API | Phase 4.2 | api | 5 | PROD-049 |
| 25 | BL-P1-PH5P55-DM | Phase 5 — Prompt 5.5 — §24 Q&A, NDA, Inbox, Pulse Walk | data_model | 5 | PROD-231 |

## Cross-phase programs (clusters spanning ≥3 phases with same class)
| Program | Class | Phases | Total defects | Approach | Owner |
|---|---|---|---:|---|---|
| data_model-program | data_model | Phase 1.1, Phase 1.2, Phase 2.2, Phase 1.5, Phase 1.4, Phase 3.3 +28 more | 104 | Author missing entity field tables / retention / scope-isolation per §4 conventions. | engineering |
| acceptance_criteria-program | acceptance_criteria | Phase 1.2, Phase 4.2, Phase 45, Phase 41, Phase 3 (Audit, Second Pass), Phase 2 — §2 (The Sourcera Method) End-to-End Audit +17 more | 79 | Author numbered, testable, observable AC blocks per §13.10 style. | engineering |
| enum-program | enum | Phase 1.1, Phase 2.2, Phase 1.5, Phase 1.4, Phase 3.3, Phase 3.5 +20 more | 69 | Register missing enum values in Appendix J and cite source location. | engineering |
| plan_gating-program | plan_gating | Phase AS, Phase 3.2, Phase 3.3, Phase 4.2, Phase 34.PXC, Phase 41 +16 more | 64 | Add §5.11 / §34.1 / §39 rows; never duplicate inline; cite the table. | engineering |
| numerical_singleton-program | numerical_singleton | Phase AS, Phase 1, Phase 2.2, Phase 1.4, Phase 3.3, Phase 3.4 +26 more | 63 | Move number to one §34/§39/§44 home; inline references cite the table. | engineering |
| consistency_drift-program | consistency_drift | Phase 3.1, Phase 3.3, Phase 3.4, Phase 3.5, Phase 41, Phase 2 — §2 (The Sourcera Method) End-to-End Audit +19 more | 51 | Normalize cross-doc/cross-section terminology; cite single authoritative home. | engineering |
| api-program | api | Phase 3.5, Phase 4.2, Phase 2 — §2 (The Sourcera Method) End-to-End Audit, Phase 4 — Prompt 4.4 — §13 Scoring & Grading End-to-End Audit, Phase 4.5 — §14 Scenario Modeling Walk, Phase 4 — Prompt 4.6 — §15 TCO Modeling End-to-End Audit +15 more | 46 | Author endpoint spec per §32: method/path/auth/rate-limit/cursor/schema/errors/idempotency. | engineering |
| webhook-program | webhook | Phase 2.2, Phase 1.6, Phase 1.7, Phase 3.3, Phase 4.2, Phase 2 — §2 (The Sourcera Method) End-to-End Audit +15 more | 43 | Author webhook per §31: HMAC, idempotency, backoff, DLQ, Appendix C+G registration. | engineering |
| documentation_gap-program | documentation_gap | Phase 1, Phase 1.5, Phase 3.3, Phase 34.PXC, Phase 45, Phase 41 +14 more | 42 | Author missing spec content; cite authoritative source-of-truth. | engineering |
| state_machine-program | state_machine | Phase 1.4, Phase 3.3, Phase 4.2, Phase 45, Phase 2 — §2 (The Sourcera Method) End-to-End Audit, Phase 4 — Prompt 4.4 — §13 Scoring & Grading End-to-End Audit +11 more | 26 | Replace prose with From/To/Trigger/Conditions table; cover concurrency / re-drive. | engineering |
| retention-program | retention | Phase 1.5, Phase 1.4, Phase 3.5, Phase 41, Phase 2 — §2 (The Sourcera Method) End-to-End Audit, Phase 4 — Prompt 4.6 — §15 TCO Modeling End-to-End Audit +10 more | 22 | Add §40.2 retention row per data class with TTL, anonymization, DSAR cascade. | engineering |
| firewall_leakage-program | firewall_leakage | Phase 1.2, Phase 2.2, Phase 3.3, Phase 2 — §2 (The Sourcera Method) End-to-End Audit, Phase 4 — Prompt 4.6 — §15 TCO Modeling End-to-End Audit, Phase 4 — Prompt 4.9 — §18 Q&A Threads End-to-End Audit +6 more | 21 | Add console firewall guard with redaction-verification-hash invariant. | engineering |
| dsar-program | dsar | Phase 1.6, Phase 1.4, Phase 3.5, Phase 4 — Prompt 4.6 — §15 TCO Modeling End-to-End Audit, Phase 4 — Prompt 4.9 — §18 Q&A Threads End-to-End Audit, Phase 4 — Prompt 4.12 — §21 The Sourcera Agent End-to-End Audit +6 more | 21 | Author §6.8 DSAR cascade row with subject-rights coverage and erasure handling. | engineering + legal |
| notification-program | notification | Phase 3.4, Phase 3.5, Phase 4.2, Phase 41, Phase 4 — Prompt 4.9 — §18 Q&A Threads End-to-End Audit, Phase 4 — Prompt 4.11 — §20 Inbox & Pulse End-to-End Audit +5 more | 21 | Register notification in Appendix C with channel × role × plan-gating matrix. | engineering |
| rbac-program | rbac | Phase 3.1, Phase 3.2, Phase 45, Phase S17 — §17 Workspace Analytics End-to-End Audit, Phase 4 — Prompt 4.10 — §19 Template Library End-to-End Audit, Phase 23 — §23 Seller Console: Bid Workspace & Response Management Walk | 20 | Add missing §5.11 Feature Access Matrix rows per role × action × column. | engineering |
| surface_engine_mapping-program | surface_engine_mapping | Phase 3.3, Phase 11, Phase 11.1, Phase 2 — §2 (The Sourcera Method) End-to-End Audit, Phase 4.5 — §14 Scenario Modeling Walk, Phase S17 — §17 Workspace Analytics End-to-End Audit +9 more | 17 | Author Appendix M row with companion-doc anchor, tier visibility, override. | engineering |
| error_code-program | error_code | Phase 1.6, Phase 3.3, Phase 4.2, Phase 4 — Prompt 4.9 — §18 Q&A Threads End-to-End Audit, Phase 5 — Prompt 5.1 — §9 Seller Teams & Triage End-to-End Audit, Phase 23 — §23 Seller Console: Bid Workspace & Response Management Walk +4 more | 16 | Add Appendix I row with HTTP status, retry semantics, user-facing copy. | engineering |
| instrumentation_gap-program | instrumentation_gap | Phase S17 — §17 Workspace Analytics End-to-End Audit, Phase 9 — Prompt 9.1 — Appendix G PostHog Event Taxonomy End-to-End Walk, Phase 51 — §51 Product Usage Analytics & PLG Instrumentation Walk, Phase 13V — Adversarial Verification of Phase 13 (§48 + §51 PLG, Growth, Analytics) | 14 | Author Appendix G PostHog + Datadog metric + AuditEvent triad. | engineering |
| ci_gate-program | ci_gate | Phase 34.PXC, Phase 38 — §38 Responsive Design & Platform Support End-to-End Audit, Phase 44 — §44 Performance Requirements & Solo-Tier Surface Treatment End-to-End Audit, Phase V11 — Adversarial Verification of Phase 11, Phase V711 — v7.1.1 Readiness Audit | 8 | Promote gate from spec_binding_pending to runtime_active under M02.3 / release. | engineering |
| entitlement-program | entitlement | Phase 2 — §2 (The Sourcera Method) End-to-End Audit, Phase 4.5 — §14 Scenario Modeling Walk, Phase 23 — §23 Seller Console: Bid Workspace & Response Management Walk, Phase EM — §34.8 Entitlement Matrix Walk, Phase 44 — §44 Performance Requirements & Solo-Tier Surface Treatment End-to-End Audit | 8 | Add §34.8 entitlement matrix row with plan × capability × enforcement-mode. | engineering |
| residency-program | residency | Phase 4 — Prompt 4.6 — §15 TCO Modeling End-to-End Audit, Phase 4 — Prompt 4.9 — §18 Q&A Threads End-to-End Audit, Phase 5 — Prompt 5.4 — §23 Bid Workspace & Response Management Walk, Phase 5 — Prompt 5.5 — §24 Q&A, NDA, Inbox, Pulse Walk, Phase 9 — Prompt 9.2 — DSAR / Right-to-Erasure Cross-Cascade Integrity Walk (§6.8), Phase 9 — Prompt 9.3 — Data Residency Walk (§1.6 + §6.8 + §40 + §42) | 8 | Add §1.6 / §40 / §42 residency clause for US/EU/custom region behavior. | engineering + ops + legal |
| posthog_event-program | posthog_event | Phase 5 — Prompt 5.1 — §9 Seller Teams & Triage End-to-End Audit, Phase 6 — Prompt 6.1 — Cross-Console Mechanics (§25 + §4.7) End-to-End Audit, Phase 38 — §38 Responsive Design & Platform Support End-to-End Audit, Phase 51 — §51 Product Usage Analytics & PLG Instrumentation Walk, Phase HM — Hero Moment Walk (Buyer-side + Seller-side) | 7 | Register PostHog event in Appendix G with property schema and console scoping. | engineering |
| growth_mechanic_gap-program | growth_mechanic_gap | Phase 48, Phase 5 — Prompt 5.7 — §49 Seller Onboarding Implementation-Level Seven-Stage Flow Walk, Phase HM — Hero Moment Walk (Buyer-side + Seller-side) | 5 | Author §48 growth-mechanic loop row with conversion gate and amplifier. | analytics + product |
| observability-program | observability | Phase 4 — Prompt 4.10 — §19 Template Library End-to-End Audit, Phase 5 — Prompt 5.2 — §22.1–§22.8 KB & MCP Server Cross-Reference Audit, Phase 5 — Prompt 5.7 — §49 Seller Onboarding Implementation-Level Seven-Stage Flow Walk | 5 | Author §42 observability row: metric, log, trace, PagerDuty routing. | engineering + ops |
| performance_budget-program | performance_budget | Phase S17 — §17 Workspace Analytics End-to-End Audit, Phase 38 — §38 Responsive Design & Platform Support End-to-End Audit, Phase 44 — §44 Performance Requirements & Solo-Tier Surface Treatment End-to-End Audit | 3 | Author §44 performance budget row with p95/p99 SLO and degradation behavior. | engineering |
