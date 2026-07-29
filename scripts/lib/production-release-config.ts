export type ProductionReleaseConfig = {
  github: {
    authorityWorkflowLineage: [
      {
        authorityKind: "normal";
        path: ".github/workflows/production-release.yml";
        workflowSha256: string;
      },
    ];
    workflow: ".github/workflows/production-release.yml";
  };
  productionControl: {
    mode: "blocked";
    sourceProvenance: {
      decisionId: string;
      decisionLedgerSha256: string;
      masterSpecSha256: string;
    };
  };
  schemaVersion: 2;
};

export function readProductionReleaseConfig(
  value: unknown,
): ProductionReleaseConfig {
  const config = value as Partial<ProductionReleaseConfig>;
  const github = config.github;
  const lineage = github?.authorityWorkflowLineage;
  const entry = lineage?.[0];
  const productionControl = config.productionControl;
  const sourceProvenance = productionControl?.sourceProvenance;
  if (
    config.schemaVersion !== 2 ||
    productionControl?.mode !== "blocked" ||
    !sourceProvenance ||
    !/^DEC-PROD-\d{3}$/.test(sourceProvenance.decisionId) ||
    !/^[a-f0-9]{64}$/.test(sourceProvenance.decisionLedgerSha256) ||
    !/^[a-f0-9]{64}$/.test(sourceProvenance.masterSpecSha256) ||
    Object.keys(productionControl).sort().join("\0") !==
      ["mode", "sourceProvenance"].sort().join("\0") ||
    github?.workflow !== ".github/workflows/production-release.yml" ||
    lineage?.length !== 1 ||
    entry?.authorityKind !== "normal" ||
    entry.path !== github.workflow ||
    !/^[a-f0-9]{64}$/.test(entry.workflowSha256)
  ) {
    throw new Error("Production release config is not the active fail-closed contract");
  }
  return config as ProductionReleaseConfig;
}
