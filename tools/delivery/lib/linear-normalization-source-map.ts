export const HISTORICAL_NORMALIZATION_SOURCE_MAP_MARKER = {
  schemaVersion: 1,
  kind: "linear_normalization_historical_input",
  authority: {
    status: "historical_non_authoritative",
    authoritativePlanningSurface: "live_linear",
    productAuthority: false,
    planningAuthority: false,
    publicationAuthority: false,
    permittedUse: "normalization_migration_and_audit_only",
  },
} as const;

export interface HistoricalNormalizationSourceMapMarker {
  schemaVersion: 1;
  kind: "linear_normalization_historical_input";
  authority: {
    status: "historical_non_authoritative";
    authoritativePlanningSurface: "live_linear";
    productAuthority: false;
    planningAuthority: false;
    publicationAuthority: false;
    permittedUse: "normalization_migration_and_audit_only";
  };
}

function record(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;
}

export function assertHistoricalNormalizationSourceMap(
  value: unknown,
  label = "normalization source map",
): asserts value is HistoricalNormalizationSourceMapMarker & Record<string, unknown> {
  const sourceMap = record(value);
  const authority = record(sourceMap?.authority);
  const expected = HISTORICAL_NORMALIZATION_SOURCE_MAP_MARKER;
  if (
    sourceMap?.schemaVersion !== expected.schemaVersion ||
    sourceMap.kind !== expected.kind ||
    authority?.status !== expected.authority.status ||
    authority.authoritativePlanningSurface !== expected.authority.authoritativePlanningSurface ||
    authority.productAuthority !== expected.authority.productAuthority ||
    authority.planningAuthority !== expected.authority.planningAuthority ||
    authority.publicationAuthority !== expected.authority.publicationAuthority ||
    authority.permittedUse !== expected.authority.permittedUse
  ) {
    throw new Error(
      `${label} must declare historical, non-authoritative normalization-only use`,
    );
  }
}
