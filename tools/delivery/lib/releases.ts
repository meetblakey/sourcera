import type { Finding, ReleaseDefinition } from "./model.js";

export function validateReleases(
  releases: ReleaseDefinition[],
): Finding[] {
  const findings: Finding[] = [];
  const expected = ["R0", "R1", "R2", "R3", "R4", "R5"];
  if (
    releases.length !== expected.length ||
    releases.some(
      (release, index) =>
        release.id !== expected[index] || release.sequence !== index,
    )
  ) {
    findings.push({
      code: "release_order_invalid",
      message: "Releases must be ordered R0 through R5",
    });
  }
  for (const release of releases) {
    if (
      !release.customerHypothesis ||
      !release.operationalHypothesis ||
      !release.pilot ||
      !release.metrics.length ||
      !release.customerGate ||
      !release.operationalGate
    ) {
      findings.push({
        code: "release_validation_incomplete",
        message: `${release.id} lacks hypothesis, pilot, metrics, or proof gate`,
      });
    }
  }
  return findings;
}
