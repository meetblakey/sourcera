###############################################################################
# Sourcera Spec-Lint — PagerDuty on-call rotation (monitors-as-code)
#
# Authority anchor: Sourcera_Master_Spec.md §M.4.6.2 (reviewer rotation —
# PagerDuty schedule `spec-ops-oncall-rotation`, weekly cadence, primary +
# secondary, 2-business-day triage SLA, missed-SLA SEV-3 escalation),
# §M.4.6.3 (failed-job SEV-2 escalation target).
#
# Landed in the v7.2.0-REM M02.3 Runtime-Wiring pass (2026-06-15). NOT
# auto-applied — declarative source-of-truth for the spec-ops rotation. The
# Datadog monitors in datadog_monitors.tf page this rotation. Member user ids
# are placeholders resolved at apply time from the Ops PagerDuty directory.
###############################################################################

terraform {
  required_providers {
    pagerduty = {
      source  = "PagerDuty/pagerduty"
      version = "~> 3.15"
    }
  }
}

variable "pagerduty_token" {
  type      = string
  sensitive = true
}

variable "spec_ops_members" {
  type        = list(string)
  description = "Ordered PagerDuty user IDs in the spec-ops rotation (>= 2 for primary+secondary). Resolved at apply time."
  # Placeholders; replace with real PagerDuty user IDs at apply time.
  default = ["PUSER_SPECOPS_1", "PUSER_SPECOPS_2"]
}

provider "pagerduty" {
  token = var.pagerduty_token
}

# --- §M.4.6.2 — weekly rotation schedule --------------------------------------
resource "pagerduty_schedule" "spec_ops_oncall_rotation" {
  name      = "spec-ops-oncall-rotation"
  time_zone = "America/New_York"

  layer {
    name                         = "spec-ops weekly primary"
    start                        = "2026-06-15T13:00:00-04:00"
    rotation_virtual_start       = "2026-06-15T13:00:00-04:00"
    rotation_turn_length_seconds = 604800 # 1 week per §M.4.6.2 cadence

    dynamic "users" {
      for_each = var.spec_ops_members
      content {
        # ordered membership = rotation order
      }
    }
    users = var.spec_ops_members
  }
}

# --- §M.4.6.2 / §M.4.6.3 — escalation policy ----------------------------------
# Tier 1: primary on-call (immediate). Tier 2: secondary after 30 min unack
# (the missed-SLA SEV-3 path per §M.4.6.2). The nightly-digest SEV-2 monitor
# (§M.4.6.3) targets this same policy.
resource "pagerduty_escalation_policy" "spec_ops" {
  name      = "spec-ops"
  num_loops = 2

  rule {
    escalation_delay_in_minutes = 30
    target {
      type = "schedule_reference"
      id   = pagerduty_schedule.spec_ops_oncall_rotation.id
    }
  }

  rule {
    escalation_delay_in_minutes = 30
    target {
      type = "schedule_reference"
      id   = pagerduty_schedule.spec_ops_oncall_rotation.id
    }
  }
}

resource "pagerduty_service" "spec_ops" {
  name                    = "spec-ops"
  description             = "Sourcera Master Spec CI gate cluster (§M.4 / §M.5). Paged by the spec-lint Datadog monitors."
  escalation_policy       = pagerduty_escalation_policy.spec_ops.id
  alert_creation          = "create_alerts_and_incidents"
  auto_resolve_timeout    = null
  acknowledgement_timeout = 1800 # 30 min — re-escalate per §M.4.6.2 SLA path
}

# Datadog → PagerDuty integration on the spec-ops service so the
# datadog_monitors.tf `@pagerduty-spec-ops-oncall-rotation` handle resolves.
resource "pagerduty_service_integration" "spec_ops_datadog" {
  name    = "Datadog (spec-lint)"
  service = pagerduty_service.spec_ops.id
  vendor  = data.pagerduty_vendor.datadog.id
}

data "pagerduty_vendor" "datadog" {
  name = "Datadog"
}

output "spec_ops_oncall_rotation_id" {
  value = pagerduty_schedule.spec_ops_oncall_rotation.id
}
