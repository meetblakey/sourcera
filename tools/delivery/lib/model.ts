export type ReleaseId = "R0" | "R1" | "R2" | "R3" | "R4" | "R5";

export type Disposition =
  | "executable"
  | "proof_only"
  | "narrative_context"
  | "superseded"
  | "retired_source";

export interface SourceRequirement {
  requirementId: string;
  outcome: string;
  sourceDoc: string;
  sourceVersion: string;
  section: string;
  dependencies: string[];
  disposition: Disposition;
}

export interface ReleaseDefinition {
  id: ReleaseId;
  name: string;
  sequence: number;
  customerHypothesis: string;
  operationalHypothesis: string;
  pilot: string;
  metrics: string[];
  customerGate: string;
  operationalGate: string;
}

export interface ReleaseAssignment {
  requirementId: string;
  release: ReleaseId;
  rationale: string;
}

export interface ReleasePolicy {
  schemaVersion: 1;
  r0Roots: string[];
  baselineAssignments: ReleaseAssignment[];
}

export interface LinearIssueSnapshot {
  id: string;
  parentId: string | null;
  sourceId: string | null;
  title: string;
  kind: "executable" | "parent" | "decision" | "proof_only";
  labels: string[];
  release: ReleaseId | null;
  milestone: string | null;
  dependencies: string[];
  owner: string | null;
  reviewer: string | null;
  estimate: number | null;
  paths: string[];
  tests: {
    success: string | null;
    failure: string | null;
    recovery: string | null;
  };
  rollout: string | null;
  rollback: string | null;
  telemetry: string | null;
  proof: string | null;
  sourceVersion: string | null;
  sourceSection: string | null;
  outcome: string | null;
}

export interface ManifestRow extends SourceRequirement {
  release: ReleaseId | null;
  issueId: string | null;
}

export interface Finding {
  code: string;
  message: string;
  requirementId?: string;
  issueId?: string;
}
