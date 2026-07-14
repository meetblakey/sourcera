# Spec-Lint Observability (monitors-as-code)

Version-controlled declarative configuration for the `spec-lint` Datadog +
PagerDuty surface. Authored in the **v7.2.0-REM M02.3 Runtime-Wiring pass
(2026-06-15)**. These files are the source-of-truth for the spec-lint alerting
surface; they are **not** auto-applied — the Ops Terraform pipeline applies them
under the existing Datadog / PagerDuty org credentials.

| File | Spec authority | What it declares |
|---|---|---|
| `datadog_monitors.tf` | §M.4.5 ¶4, §M.4.6.3, §42.6 | `appendix_m_gate_nightly_digest_failed` (SEV-2), `m02_3_runtime_active_gate_failed_on_main` (SEV-3), `spec_lint_gate_failure_rate_spike` (advisory) |
| `pagerduty_rotation.tf` | §M.4.6.2, §M.4.6.3 | `spec-ops-oncall-rotation` weekly schedule, `spec-ops` escalation policy + service, Datadog→PagerDuty integration |

## Mapping to the §M.4.5 emit path

`lib/emit.ts` writes a Datadog log to `service:spec-lint` for every gate run
(`status=info` pass / `warn` override / `error` fail) with `ddtags`
`gate:<id>,outcome:<o>,pr:<n>`. The monitors above query that log stream. The
PostHog event (`spec_lint.<gate_id>_run`) and the Convex `AuditEvent` row are
emitted from the same path but are not alerting surfaces — they feed product
analytics and the 7-year audit trail respectively.

## Apply (Ops pipeline only)

```bash
cd tools/spec-lint/observability
terraform init
terraform plan  -var="datadog_api_key=$DD_API" -var="datadog_app_key=$DD_APP" -var="pagerduty_token=$PD_TOKEN"
terraform apply -var="datadog_api_key=$DD_API" -var="datadog_app_key=$DD_APP" -var="pagerduty_token=$PD_TOKEN"
```

Replace the `spec_ops_members` placeholder PagerDuty user IDs with real
directory IDs before the first apply.
