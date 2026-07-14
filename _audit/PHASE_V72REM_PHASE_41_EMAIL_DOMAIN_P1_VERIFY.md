# Phase 41 Email Domain P1 Verify

**Date:** 2026-06-22
**Scope:** D-41-001, D-41-002, D-41-003, D-41-004, D-41-005, D-41-006, D-41-007, D-41-008, D-41-012, D-41-014
**Result:** PASS for target P1 closure; spec-lint blocking gates pass.

## 1. Inputs Reviewed

- `Sourcera_Master_Spec.md` §4 entity conventions, §5.11, §6.8.4.3 / §6.8.4.7 / §6.8.5, §22 Seller KB moderation context, §27.8 Marketplace Abuse, §27.10 Vendor Opt-Out Global Registry, §32.4.5, §34.1 buyer/seller plan tables, §39, §40.2, §41, §42.3.1, §45, §48.4.1, §48.4.2, §48.4.8, Appendix C, Appendix G, Appendix I, Appendix J, Appendix K, Appendix M.
- `_audit/DEFECT_LEDGER.md` D-41-001 through D-41-022, with this pass limited to the open P1 target rows.
- `_audit/V711_BACKLOG_INDEX.md`, `_audit/REMEDIATION_BACKLOG.md`, `_integration/AUTHORED_EXTENSIONS_LEDGER.md`, and `_integration/RECONCILIATION.md`.

## 2. Backups

| File | Backup | md5 |
|---|---|---|
| `Sourcera_Master_Spec.md` | `legacy-import:_versions/Sourcera_Master_Spec_pre-phase-41-email-domain-p1-2026-06-22.md` | `cf6d7c3991591e20b7c36974df8bccc9` |
| `_audit/DEFECT_LEDGER.md` | `legacy-import:_versions/DEFECT_LEDGER_pre-phase-41-email-domain-p1-2026-06-22.md` | `d8c3cf4b567ea6cadb6f3d758be56975` |
| `_audit/V711_BACKLOG_INDEX.md` | `legacy-import:_versions/V711_BACKLOG_INDEX_pre-phase-41-email-domain-p1-2026-06-22.md` | `7b77ab1983d9ceef9d255513b104763a` |
| `_audit/REMEDIATION_BACKLOG.md` | `legacy-import:_versions/REMEDIATION_BACKLOG_pre-phase-41-email-domain-p1-2026-06-22.md` | `e40a0105dd3f7846a9be231707e64cc4` |
| `_integration/RECONCILIATION.md` | `legacy-import:_versions/RECONCILIATION_pre-phase-41-email-domain-p1-2026-06-22.md` | `e73f1e9064000078e72a58fd1ecbff1d` |
| `_integration/AUTHORED_EXTENSIONS_LEDGER.md` | `legacy-import:_versions/AUTHORED_EXTENSIONS_LEDGER_pre-phase-41-email-domain-p1-2026-06-22.md` | `dcf9c3d26172a4e2f3ee58a642f83246` |

## 3. Classification

| Defect | Classification | Disposition |
|---|---|---|
| D-41-001 | True issue | Remediated. §41.3.1 now gives the reader an SPF / DKIM / DMARC posture entry point and routes the runtime source of truth to §48.4.2; §M.5.45 adds `email_spf_dkim_dmarc_citations_resolve`. |
| D-41-002 | True issue | Remediated. §41.4.2 now defines the per-domain warmup curve, enforcement source, green-state promotion, and `email_warmup_curve_exceeded` failure mode. |
| D-41-003 | True issue | Remediated. §4.9.3 / §4.9.4 and §41.4.4 now define email events, suppression entries, bounce / complaint thresholds, provider telemetry handling, and threshold actions. |
| D-41-004 | True issue | Remediated. §41.3.2 / §41.4.5 and §6.8.4.8 now resolve transactional-vs-opt-out behavior, RFC 8058, postal-address configuration, preference handling, and suppression-list erasure preservation. |
| D-41-005 | True issue | Remediated. §41.1 now carries the Loops.so provider contract for auth/key rotation, template sync, inbound telemetry, suppression sync, audience segregation, data residency, and outage behavior. |
| D-41-006 | True issue | Remediated. Outbound email volume is now single-sourced through §34.1 and §39, reflected in §5.11, and consumed by §41 / §48.4.1. |
| D-41-007 | True issue | Remediated. §4.9 adds EmailTemplate, EmailSend, EmailEvent, SuppressionListEntry, and UnsubscribePreference with field tables, scope isolation, indexes, retention, and DSAR bindings. |
| D-41-008 | True issue | Remediated. §41.5 now has numbered, measurable, scope-bound acceptance criteria tied to provider events, suppression, warmup, template coverage, privacy, and telemetry. |
| D-41-012 | True issue | Remediated. §40.2, §6.8.4.3, §6.8.4.8, §6.8.5, and §41.4.3 now cover email-domain retention, DSAR, suppression preservation, and residency/provider exceptions. |
| D-41-014 | True issue | Remediated. §41.2 now treats Appendix C as the exhaustive event source and §M.5.45 adds `email_type_catalog_coverage`. |

No target row was stale, duplicate, or blocked by a missing product decision.

## 4. Spec Changes

- Added §4.9 Email-Domain Entities and registered supporting retention, DSAR, residency, object-size, enum, glossary, error-code, event-taxonomy, and §M.5 guardrail rows.
- Rewrote §41 as a buildable email-domain contract: Loops.so integration, Appendix-C-backed template coverage, localization, cross-console field carry, deliverability, compliance, rate/warmup gates, bounce/complaint handling, preferences, and acceptance criteria.
- Replaced §48.4.1's inline email-volume cap with citations to §34.1 / §39 and rebound §48.4.8 to canonical SuppressionListEntry.
- Added AE-V72REM-PH41-EMAIL-DOMAIN-01 because this pass authors concrete email-domain product behavior beyond the prior corpus.

## 5. Verification Commands

```bash
npx tsx tools/spec-lint/run-all.ts --spec Sourcera_Master_Spec.md --ux UX_Design_of_Sourcera.md --ae-ledger _integration/AUTHORED_EXTENSIONS_LEDGER.md --no-emit
```

**Result:** exit code 0 for blocking gates.

Blocking gates all passed. Advisory findings remain and are not introduced by this pass:

- `solo_tier_numeric_single_source`
- `retention_singleton_section_40_2_canonical`
- `section_anchor_slug_no_colon`

Target-row status check:

```bash
ruby -e 'ids=%w[D-41-001 D-41-002 D-41-003 D-41-004 D-41-005 D-41-006 D-41-007 D-41-008 D-41-012 D-41-014]; bad=[]; File.foreach("_audit/DEFECT_LEDGER.md") { |l| id=ids.find { |x| l.start_with?("| #{x} |") }; bad << l if id && l.include?("| open |") }; puts bad.empty? ? "target_rows_open=0" : bad.join'
# target_rows_open=0
```

Open P1 ledger count after this pass:

```bash
ruby -e 'rows=[]; ids=[]; File.foreach("_audit/DEFECT_LEDGER.md") { |l| next unless l =~ /^\| (D-[^|]+) \| P1 \| [^|]+ \|.*\| open \|/; ids << $1; rows << l }; counts=Hash.new(0); ids.each { |id| counts[id]+=1 }; dupes=counts.select { |_,v| v>1 }; puts "open_p1_rows=#{rows.length}"; puts "open_p1_unique_ids=#{ids.uniq.length}"; puts "duplicate_open_p1_ids=#{dupes.keys.join(",")}"'
# open_p1_rows=240
# open_p1_unique_ids=239
# duplicate_open_p1_ids=D-CONS-006
```

## 6. Ledger / Tracking Updates

- `_audit/DEFECT_LEDGER.md`: D-41-001 through D-41-008, D-41-012, and D-41-014 now carry `remediated 2026-06-22`.
- `_audit/V711_BACKLOG_INDEX.md`: count posture moved from 250 / 249 to 240 / 239 and current delta note added.
- `_audit/REMEDIATION_BACKLOG.md`: current delta note added and last-updated line moved to this pass.
- `_integration/RECONCILIATION.md`: Phase 41 Email Domain P1 pass appended.
- `_integration/AUTHORED_EXTENSIONS_LEDGER.md`: AE-V72REM-PH41-EMAIL-DOMAIN-01 appended as pending ratification.

## 7. Residuals

Adjacent lower-severity or separate-scope Phase 41 rows remain open unless independently remediated or status-synced: D-41-009, D-41-010, D-41-011, D-41-013, and D-41-015 through D-41-022.
