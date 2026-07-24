export const F007_JOURNEY_TARGET = {
  journeyId: "F-007",
  targetSetId: "r2_f007_billing_journey_v1",
  targetSetVersion: 1,
  sourceVersion: "F-007.E@v1",
  sourceChecksum:
    "64032a450d85aa65ac4cc1ab973da9a41a8e973e23b5d44223f3be6145b112d0",
  windows: [
    {
      key: "cohort",
      duration: 14,
      unit: "calendar_days",
      startsAt: "first_valid_activation",
    },
    {
      key: "normal_action",
      duration: 600,
      unit: "active_seconds",
      startsAt: "intentional_plan_billing_open",
    },
    {
      key: "recovery_drill",
      duration: 300,
      unit: "active_seconds",
      startsAt: "pilot_recovery_drill_start",
    },
  ],
  sampleRules: [
    {
      key: "valid_starts",
      basis: "valid_started_runs",
      minimumRuns: 5,
      minimumDistinctOrganizations: 3,
    },
    {
      key: "valid_completions",
      basis: "valid_completed_runs",
      minimumRuns: 4,
      minimumDistinctOrganizations: 3,
    },
  ],
  safetyCohort: {
    runs: 1,
    participants: 1,
    distinctOrganizations: 1,
    satisfiesReleaseGate: false,
  },
  approval: {
    state: "pending",
    reference: "DEC-VALIDATION-F007-001",
    approvedAt: null,
    accountableOwnerKeyRef: "decision:DEC-OWNER-001",
    independentReviewerKeyRef: "check:codex-independent-review",
    authorMayApprove: false,
    pilotOperatorMayApprove: false,
    maximumAgeDays: 90,
    maximumReleaseCandidates: 1,
  },
  proofGates: {
    requireAll: true,
    customer: [
      "r2_f007_activation",
      "r2_f007_completion",
      "r2_f007_time_to_value",
      "r2_f007_abandonment",
      "r2_f007_trust",
    ],
    operational: ["r2_f007_reliability", "r2_f007_support"],
  },
  metrics: [
    {
      metric: "activation",
      key: "r2_f007_activation",
      proof: "customer",
      sampleRule: "valid_starts",
      windows: ["normal_action"],
      thresholds: [
        { statistic: "rate", operator: ">=", value: 0.9, unit: "ratio" },
      ],
    },
    {
      metric: "completion",
      key: "r2_f007_completion",
      proof: "customer",
      sampleRule: "valid_starts",
      windows: ["normal_action", "recovery_drill"],
      thresholds: [
        { statistic: "rate", operator: ">=", value: 0.8, unit: "ratio" },
      ],
    },
    {
      metric: "timeToValue",
      key: "r2_f007_time_to_value",
      proof: "customer",
      sampleRule: "valid_completions",
      windows: ["normal_action"],
      thresholds: [
        { statistic: "median", operator: "<=", value: 180, unit: "seconds" },
        { statistic: "p90", operator: "<=", value: 300, unit: "seconds" },
      ],
    },
    {
      metric: "abandonment",
      key: "r2_f007_abandonment",
      proof: "customer",
      sampleRule: "valid_starts",
      windows: ["normal_action"],
      thresholds: [
        { statistic: "rate", operator: "<=", value: 0.1, unit: "ratio" },
      ],
    },
    {
      metric: "trust",
      key: "r2_f007_trust",
      proof: "customer",
      sampleRule: "valid_completions",
      windows: ["cohort"],
      thresholds: [
        { statistic: "rate", operator: ">=", value: 0.8, unit: "ratio" },
      ],
    },
    {
      metric: "reliability",
      key: "r2_f007_reliability",
      proof: "operational",
      sampleRule: "valid_starts",
      windows: ["normal_action", "recovery_drill"],
      thresholds: [
        { statistic: "rate", operator: "=", value: 1, unit: "ratio" },
        {
          statistic: "forbidden_access_count",
          operator: "=",
          value: 0,
          unit: "count",
        },
        {
          statistic: "financial_mutation_count",
          operator: "=",
          value: 0,
          unit: "count",
        },
        {
          statistic: "manual_data_repair_count",
          operator: "=",
          value: 0,
          unit: "count",
        },
      ],
    },
    {
      metric: "support",
      key: "r2_f007_support",
      proof: "operational",
      sampleRule: "valid_completions",
      windows: ["normal_action", "recovery_drill"],
      thresholds: [
        {
          statistic: "zero_unplanned_intervention_rate",
          operator: ">=",
          value: 0.8,
          unit: "ratio",
        },
        {
          statistic: "median_active_support",
          operator: "<=",
          value: 120,
          unit: "seconds",
        },
        {
          statistic: "data_repair_intervention_count",
          operator: "=",
          value: 0,
          unit: "count",
        },
      ],
    },
  ],
} as const;

export function completeValidationPlanFixture(releaseNames: string[]) {
  return {
    schemaVersion: 2,
    releaseValidation: releaseNames.map((_, sequence) => ({
      release: `R${sequence}`,
      activation: "Activation is measured.",
      completion: "Completion is measured.",
      timeToValue: "Time to value is measured.",
      abandonment: "Abandonment is measured.",
      trust: "Trust is measured.",
      reliability: "Reliability is measured.",
      support: "Support is measured.",
      journeyTargets: [],
    })),
    customerProof: [],
    operationalProof: [],
    forecastProof: [],
    executionEvidence: {
      tests: [],
      deploy: [],
      rollback: [],
      runtime: [],
    },
  };
}

export function validationPlanWithF007Target(releaseNames: string[]) {
  const plan = completeValidationPlanFixture(releaseNames);
  const r2 = plan.releaseValidation.find((row) => row.release === "R2");
  if (!r2) throw new Error("R2 fixture is missing");
  const target = JSON.parse(JSON.stringify(F007_JOURNEY_TARGET));
  target.approval.state = "approved";
  target.approval.approvedAt = "2026-07-17T00:00:00.000Z";
  r2.journeyTargets.push(target as never);
  return plan;
}
