###############################################################################
# Sourcera Spec-Lint — Datadog monitors-as-code
#
# Authority anchor: Sourcera_Master_Spec.md §M.4.5 ¶4 (Datadog log destination,
# service tag `spec-lint`), §M.4.6.3 (failed-job alarming →
# `monitor:appendix_m_gate_nightly_digest_failed` SEV-2), §42.6 (Ops
# observability / alerting), §M.5.6 (runtime composition).
#
# Landed in the v7.2.0-REM M02.3 Runtime-Wiring pass (2026-06-15) as
# version-controlled configuration. This file is NOT auto-applied; it is the
# declarative source-of-truth for the spec-lint Datadog surface. Apply via the
# Ops Terraform pipeline (`terraform apply` against the Datadog provider) under
# the existing Datadog org credentials. The monitors page the spec-ops on-call
# (see pagerduty_rotation.tf).
###############################################################################

terraform {
  required_providers {
    datadog = {
      source  = "DataDog/datadog"
      version = "~> 3.39"
    }
  }
}

variable "datadog_api_key" {
  type      = string
  sensitive = true
}

variable "datadog_app_key" {
  type      = string
  sensitive = true
}

variable "spec_ops_pagerduty_handle" {
  type        = string
  description = "PagerDuty notification handle for the spec-ops rotation (see pagerduty_rotation.tf)."
  default     = "@pagerduty-spec-ops-oncall-rotation"
}

provider "datadog" {
  api_key = var.datadog_api_key
  app_key = var.datadog_app_key
}

# --- §M.4.6.3 — Nightly digest failed-job alarm (SEV-2) -----------------------
# Fires when the §M.4.6 Convex cron `appendix_m_gate_nightly_digest` fails
# (Convex error, Slack 5xx + Loops 5xx, or Datadog pipeline degraded) — within
# 15 minutes of the cron-tick failure per §M.4.6.3.
resource "datadog_monitor" "appendix_m_gate_nightly_digest_failed" {
  name    = "appendix_m_gate_nightly_digest_failed"
  type    = "log alert"
  message = <<-EOT
    {{#is_alert}}SEV-2: the Appendix M nightly override digest cron failed.
    The §M.4.6 digest did not post to #spec-ops and the Loops.so fallback also
    failed. Investigate `convex/crons/appendix_m_gate_nightly_digest.ts`.
    Runbook: runbooks.sourcera.com/ci-gates/appendix_m_gate_nightly_digest_failed
    ${var.spec_ops_pagerduty_handle}{{/is_alert}}
  EOT

  query = "logs(\"service:spec-lint source:spec-lint status:error @job:appendix_m_gate_nightly_digest\").index(\"*\").rollup(\"count\").last(\"15m\") >= 1"

  monitor_thresholds {
    critical = 1
  }

  notify_no_data    = true
  no_data_timeframe = 1500 # minutes (~25h): the cron is daily; absence ≈ failure
  renotify_interval = 60
  priority          = 2
  tags              = ["service:spec-lint", "team:spec-ops", "sev:2", "source:appendix_m_gate"]
}

# --- §M.4.5 ¶4 / §42.6 — runtime_active gate-failure spike on main ------------
# Fires when any M02.3 `runtime_active` spec-tree-lint gate reports a failure
# on the main branch (i.e., a merged commit broke a catalog invariant the gate
# enforces). SEV-3 page.
resource "datadog_monitor" "m02_3_runtime_active_gate_failed_on_main" {
  name    = "m02_3_runtime_active_gate_failed_on_main"
  type    = "log alert"
  message = <<-EOT
    {{#is_alert}}SEV-3: a v7.2.0-REM M02.3 runtime_active spec-lint gate failed
    on `main`. A merged commit violated a §M.5.4 catalog invariant
    ({{log.attributes.gate_id}}). Inspect the gate run-log and revert/patch.
    Runbook: runbooks.sourcera.com/ci-gates/{{log.attributes.gate_id}}
    ${var.spec_ops_pagerduty_handle}{{/is_alert}}
  EOT

  # Matches the lib/emit.ts Datadog payload: ddtags carry gate:<id>,outcome:<o>;
  # branch is implied by the push-to-main workflow trigger.
  query = "logs(\"service:spec-lint status:error @branch:main\").index(\"*\").rollup(\"count\").last(\"30m\") >= 1"

  monitor_thresholds {
    critical = 1
  }

  renotify_interval = 120
  priority          = 3
  tags = [
    "service:spec-lint",
    "team:spec-ops",
    "sev:3",
    "pack:m02_3",
    "runtime_status:runtime_active",
  ]
}

# --- §42.6 — gate-failure-rate spike (advisory, no page) ----------------------
# Surfaces an unusual spike in spec-lint gate failures across all PRs (e.g., a
# detector regression or a broad spec edit). Notifies the #spec-ops Slack only.
resource "datadog_monitor" "spec_lint_gate_failure_rate_spike" {
  name    = "spec_lint_gate_failure_rate_spike"
  type    = "log alert"
  message = <<-EOT
    {{#is_warning}}Spec-lint gate failures are elevated in the last hour
    (>= 20 failing runs). Likely a broad Master Spec edit in flight or a
    detector regression. No page; review #spec-ops.{{/is_warning}}
    @slack-spec-ops
  EOT

  query = "logs(\"service:spec-lint status:error\").index(\"*\").rollup(\"count\").last(\"1h\") >= 20"

  monitor_thresholds {
    warning  = 20
    critical = 100
  }

  priority = 4
  tags     = ["service:spec-lint", "team:spec-ops", "sev:4"]
}
