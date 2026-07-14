# Email SPF DKIM DMARC Pass Fixture

## 41.1 Email Provider and Loops.so Integration Contract {#41.1-email-provider-and-loopsso-integration-contract}

| Control | Operational home | §41 binding |
| :---- | :---- | :---- |
| SPF / DKIM / DMARC reputation | §48.4.2 | §41.3.1 is the email-domain compliance landing section for inbound citations. |

### 41.3.1 SPF, DKIM, and DMARC Posture {#41.3.1-spf-dkim-and-dmarc-posture}

§48.4.2 is the operational home for DMARC/SPF reputation enforcement. SPF validation is required. DKIM signing is required. DMARC alignment scan is required. Inbound citations that say "SPF/DKIM/DMARC per §41" resolve to this subsection §41.3.1.

### 48.4.2 DMARC/SPF Reputation {#48.4.2-dmarc-spf-reputation}

§41.3 Email Compliance binds this control. Nightly DMARC alignment scan, SPF record validation, DKIM signing, and email_dkim_signing_failed are required.

| `email_spf_dkim_dmarc_citations_resolve` | spec_tree_lint | **`runtime_active`** (promoted 2026-07-07; detector `tools/spec-lint/gates/email_spf_dkim_dmarc_citations_resolve.ts`; verified PASS on live Master Spec and pass/fail fixtures) | pr_lint | assertion | M02.3 |
