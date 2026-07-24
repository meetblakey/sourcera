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
  replacementId?: string;
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
  schemaVersion: 2;
  releaseAuthority: "linear_native";
  allowedReleaseIds: ReleaseId[];
  exactlyOneReleasePerMappedIssue: true;
  dependencyOrder: "prerequisite_not_later";
}

export type R0CheckpointId =
  | "R0-C1"
  | "R0-C2"
  | "R0-C3"
  | "R0-C4"
  | "R0-C5"
  | "R0-C6"
  | "R0-C7"
  | "R0-C8";

export interface SemanticRoadmapPhase {
  phase: number;
  stage: string;
  requirementId: string;
  sourceSection: string;
}

export interface SemanticRoadmapRequirement {
  requirementId: string;
  sourceSection: string;
}

export interface SemanticRoadmapEdge {
  prerequisiteId: string;
  prerequisiteSection: string;
  dependentId: string;
  dependentSection: string;
}

export interface OptionalRoadmapPath extends SemanticRoadmapRequirement {
  release: Exclude<ReleaseId, "R0">;
}

export interface CheckpointRequirements {
  success: string[];
  failureRecovery: string[];
  rollout: string[];
  rollback: string[];
  telemetry: string[];
  customerProof: string[];
  operationalProof: string[];
}

export type CheckpointProofType =
  | "customer"
  | "operational"
  | "preview"
  | "runtime"
  | "rollback"
  | "approval";

export interface CheckpointReceiptRequirement {
  path: string;
  proofType: CheckpointProofType;
}

export interface CheckpointEvidenceContext {
  root: string;
}

export interface R0Checkpoint {
  id: R0CheckpointId;
  sequence: number;
  name: string;
  dependsOn: R0CheckpointId[];
  scope: string[];
  status: "planned" | "active" | "complete";
  evidenceCommit: string | null;
  requirements: CheckpointRequirements;
  requiredReceipts: CheckpointReceiptRequirement[];
}

export interface SemanticRoadmapContract {
  schemaVersion: 1;
  release: "R0";
  source: {
    sourceDoc: string;
    sourceVersion: string;
    featureIntroductionVersion: string;
    sections: string[];
  };
  journey: {
    mandatoryPhases: SemanticRoadmapPhase[];
    requiredSupport: SemanticRoadmapRequirement[];
    requiredEdges: SemanticRoadmapEdge[];
    terminalArtifact: SemanticRoadmapRequirement;
    optionalLaterPaths: OptionalRoadmapPath[];
  };
  checkpoints: R0Checkpoint[];
}

export interface LinearIssueSnapshot {
  id: string;
  parentId: string | null;
  sourceId: string | null;
  sourceFamilyId?: string | null;
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
  checkpointId?: R0CheckpointId;
}
