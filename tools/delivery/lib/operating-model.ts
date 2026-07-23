import type { LinearFingerprint } from "./linear-live.js";
import type {
  Finding,
  LinearIssueSnapshot,
  ReleaseId,
} from "./model.js";

export interface OperatingModel {
  schemaVersion: 1;
  activeRelease: ReleaseId;
  lanes: Array<{
    id: string;
    owner: string;
    wipLimit: number;
  }>;
  readyQueue: {
    minimum: number;
    maximum: number;
  };
  wipDecisionId: string;
  reviewerPolicy: {
    interimDecisionId: string;
    interimReviewer: string;
  };
  independentReview: {
    checks: string[];
    humanApprover: string;
    approvalGate: string;
    capacityValidationTrigger: string;
  };
  priorityPolicy: {
    urgent: 1;
    decisionId: string;
  };
}

export interface OperatingDecision {
  id: string;
  status: string;
}

function isValidOperatingModel(model: OperatingModel): boolean {
  if (
    model?.schemaVersion !== 1 ||
    !/^R[0-5]$/.test(model.activeRelease ?? "") ||
    !Array.isArray(model.lanes) ||
    model.lanes.length === 0 ||
    !model.readyQueue ||
    !Number.isInteger(model.readyQueue.minimum) ||
    !Number.isInteger(model.readyQueue.maximum) ||
    model.readyQueue.minimum < 1 ||
    model.readyQueue.maximum < model.readyQueue.minimum ||
    !model.wipDecisionId?.trim() ||
    !model.reviewerPolicy?.interimDecisionId?.trim() ||
    !model.reviewerPolicy.interimReviewer?.trim() ||
    !model.independentReview ||
    !Array.isArray(model.independentReview.checks) ||
    model.independentReview.checks.length === 0 ||
    new Set(model.independentReview.checks).size !==
      model.independentReview.checks.length ||
    model.independentReview.checks.some((check) => !check.trim()) ||
    !model.independentReview.humanApprover?.trim() ||
    !model.independentReview.approvalGate?.trim() ||
    !model.independentReview.capacityValidationTrigger?.trim() ||
    model.priorityPolicy?.urgent !== 1 ||
    !model.priorityPolicy.decisionId?.trim()
  ) {
    return false;
  }
  const laneOwners = new Set(model.lanes.map((lane) => lane.owner));
  return (
    new Set(model.lanes.map((lane) => lane.id)).size === model.lanes.length &&
    model.lanes.every(
      (lane) =>
        lane.id.trim().length > 0 &&
        lane.owner.trim().length > 0 &&
        Number.isInteger(lane.wipLimit) &&
        lane.wipLimit > 0,
    ) && laneOwners.has(model.independentReview.humanApprover)
  );
}

export function operatingModelFindings(
  model: OperatingModel,
  issues: LinearIssueSnapshot[],
  fingerprint: LinearFingerprint,
  decisions: OperatingDecision[],
): Finding[] {
  const findings: Finding[] = [];
  const add = (code: string, message: string, issueId?: string) => {
    findings.push({ code, message, ...(issueId ? { issueId } : {}) });
  };
  if (!isValidOperatingModel(model)) {
    add(
      "operating_model_invalid",
      "Operating model must define valid unique lanes, WIP, queue, release, and decisions",
    );
    return findings;
  }
  if (!fingerprint || !Array.isArray(fingerprint.issues)) {
    add(
      "operating_model_linear_fingerprint_missing",
      "Operating model requires a complete live Linear issue fingerprint",
    );
    return findings;
  }
  const decisionIsActive = (id: string) =>
    decisions.some((decision) => decision.id === id && decision.status === "active");
  const ready = issues.filter((issue) => issue.labels.includes("codex-ready"));
  const liveById = new Map(
    fingerprint.issues.map((candidate) => [
      candidate.identifier,
      candidate,
    ]),
  );
  const trackedIds = new Set(issues.map((issue) => issue.id));
  if (
    fingerprint.issues.some(
      (candidate) =>
        trackedIds.has(candidate.identifier) &&
        (!Number.isInteger(candidate.priority) ||
          candidate.priority < 0 ||
          candidate.priority > 4),
    )
  ) {
    add(
      "operating_model_priority_missing",
      "Tracked Linear work has a missing or invalid live priority fingerprint",
    );
  }
  const started = fingerprint.issues.filter(
    (candidate) =>
      trackedIds.has(candidate.identifier) && candidate.stateType === "started",
  );
  const totalWipLimit = model.lanes.reduce(
    (total, lane) => total + lane.wipLimit,
    0,
  );

  if (ready.length < model.readyQueue.minimum) {
    add(
      "ready_queue_under_minimum",
      `Ready queue has ${ready.length}; minimum is ${model.readyQueue.minimum}`,
    );
  }
  if (ready.length > model.readyQueue.maximum) {
    add(
      "ready_queue_over_maximum",
      `Ready queue has ${ready.length}; maximum is ${model.readyQueue.maximum}`,
    );
  }
  if (started.length > totalWipLimit) {
    add(
      "wip_limit_exceeded",
      `Started work has ${started.length} issues; WIP limit is ${totalWipLimit}`,
    );
  }
  for (const live of started) {
    if (!live.labels.includes("codex-ready")) {
      add(
        "started_issue_not_ready",
        `${live.identifier} is started without codex-ready`,
        live.identifier,
      );
    }
  }
  if (!decisionIsActive(model.wipDecisionId)) {
    add(
      "wip_decision_inactive",
      `${model.wipDecisionId} must be active`,
    );
  }
  if (!decisionIsActive(model.priorityPolicy.decisionId)) {
    add(
      "priority_decision_inactive",
      `${model.priorityPolicy.decisionId} must be active`,
    );
  }

  const issueByDependency = new Map<string, LinearIssueSnapshot>();
  for (const candidate of issues) {
    issueByDependency.set(candidate.id, candidate);
    if (candidate.sourceId) issueByDependency.set(candidate.sourceId, candidate);
  }
  const laneOwners = new Set(model.lanes.map((lane) => lane.owner));
  const readyIds = new Set(ready.map((candidate) => candidate.id));
  const directQueueBlockers = new Set<string>();
  for (const readyId of readyIds) {
    const liveReady = liveById.get(readyId);
    for (const relation of liveReady?.relations ?? []) {
      const [type, prerequisite, dependent] = relation.split(":");
      if (type === "blocks" && dependent === readyId) {
        directQueueBlockers.add(prerequisite);
      }
    }
  }
  const issueById = new Map(issues.map((candidate) => [candidate.id, candidate]));
  for (const live of fingerprint.issues) {
    if (!trackedIds.has(live.identifier) || live.priority !== 1) continue;
    const planned = issueById.get(live.identifier);
    const activeQueueWork =
      planned?.release === model.activeRelease &&
      !["completed", "canceled"].includes(live.stateType) &&
      (readyIds.has(live.identifier) || directQueueBlockers.has(live.identifier));
    if (!activeQueueWork) {
      add(
        "urgent_priority_outside_active_queue",
        `${live.identifier} is Urgent outside active queue work or its direct blocker`,
        live.identifier,
      );
    }
  }
  const interimReviewInUse = ready.some(
    (candidate) =>
      candidate.reviewer === model.reviewerPolicy.interimReviewer ||
      candidate.reviewer === candidate.owner,
  );
  if (
    interimReviewInUse &&
    !decisionIsActive(model.reviewerPolicy.interimDecisionId)
  ) {
    add(
      "interim_review_decision_inactive",
      `${model.reviewerPolicy.interimDecisionId} must be active while interim review is used`,
    );
  }

  for (const candidate of ready) {
    const live = liveById.get(candidate.id);
    if (!live) {
      add(
        "ready_live_issue_missing",
        `${candidate.id} is missing from the live Linear fingerprint`,
        candidate.id,
      );
      continue;
    }
    if (!laneOwners.has(candidate.owner ?? "")) {
      add(
        "ready_owner_outside_lane",
        `${candidate.id} owner is not assigned to an implementation lane`,
        candidate.id,
      );
    }
    if (!live.labels.includes("codex-ready")) {
      add(
        "ready_label_drift",
        `${candidate.id} is ready in the repository but not in Linear`,
        candidate.id,
      );
    }
    if (
      live.releases.length !== 1 ||
      live.releases[0] !== model.activeRelease ||
      candidate.release !== model.activeRelease
    ) {
      add(
        "ready_release_drift",
        `${candidate.id} is outside active release ${model.activeRelease}`,
        candidate.id,
      );
    }
    if (!["backlog", "unstarted", "started"].includes(live.stateType)) {
      add(
        "ready_state_invalid",
        `${candidate.id} is ready in terminal state ${live.stateType}`,
        candidate.id,
      );
    }
    if (live.assignee !== candidate.owner) {
      add(
        "ready_owner_drift",
        `${candidate.id} live owner differs from readiness metadata`,
        candidate.id,
      );
    }
    if (live.estimate !== candidate.estimate) {
      add(
        "ready_estimate_drift",
        `${candidate.id} live estimate differs from readiness metadata`,
        candidate.id,
      );
    }
    if (live.milestone !== candidate.milestone) {
      add(
        "ready_milestone_drift",
        `${candidate.id} live milestone differs from readiness metadata`,
        candidate.id,
      );
    }
    for (const dependencyId of candidate.dependencies) {
      const dependency = issueByDependency.get(dependencyId);
      const liveDependency = dependency
        ? liveById.get(dependency.id)
        : undefined;
      if (!dependency || !liveDependency) {
        add(
          "ready_dependency_unresolved",
          `${candidate.id} dependency ${dependencyId} is not fully captured`,
          candidate.id,
        );
      } else if (liveDependency.stateType !== "completed") {
        add(
          "ready_dependency_incomplete",
          `${candidate.id} dependency ${dependencyId} is not complete`,
          candidate.id,
        );
      }
    }
  }

  return findings;
}
