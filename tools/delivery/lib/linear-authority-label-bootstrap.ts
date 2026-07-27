import { createHash } from "node:crypto";

import type { LinearNativeIdentityCapture } from "./linear-live.js";
import {
  buildLinearAuthorityIssueLabelContract,
  type LinearProgramScopeV3,
} from "./linear-program-scope.js";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const SHA256 = /^[a-f0-9]{64}$/;

const LABELS = [
  { name: "Requirement", id: "5b058b32-9655-442e-bcdb-a5ca0479c311", parentName: null, teamKey: "REQ", color: "#5E6AD2", description: "Canonical binding product or engineering requirement." },
  { name: "decision", id: "df2bcb0f-2fca-41cb-a45c-37770a01aac2", parentName: "Type", teamKey: null, color: "#7C3AED", description: "A product or delivery choice that must be resolved before dependent work can proceed." },
  { name: "human-only", id: "b29617b2-d787-4feb-b351-386df3286e87", parentName: "Agent", teamKey: null, color: "#155E75", description: null },
  { name: "platform", id: "70aedffb-e40d-4688-b723-99a3d4002565", parentName: "Domain", teamKey: null, color: "#1E3A8A", description: null },
  { name: "marketplace", id: "4dafcf74-e922-48aa-9dab-19f80516e2ee", parentName: "Domain", teamKey: null, color: "#1E40AF", description: null },
  { name: "risk", id: null, parentName: "Type", teamKey: null, color: "#E5484D", description: "Canonical delivery risk." },
  { name: "delivery-risk", id: null, parentName: "Risk", teamKey: null, color: "#D97706", description: "Delivery, governance, readiness, or operational execution risk." },
  { name: "financial-risk", id: null, parentName: "Risk", teamKey: null, color: "#A16207", description: "Billing, metering, pricing, or financial integrity risk." },
  { name: "security-risk", id: "d90fa0c4-4743-47fd-b3a5-61a5d1627747", parentName: "Risk", teamKey: null, color: "#B91C1C", description: "Security-sensitive implementation or proof work." },
  { name: "compliance-risk", id: "dc0cd580-50d1-4b03-bcbb-3cf23d43e331", parentName: "Risk", teamKey: null, color: "#991B1B", description: "Compliance-sensitive implementation or proof work." },
] as const;

type NativeLabel = LinearNativeIdentityCapture["labels"][number];

export interface LinearAuthorityLabelBootstrapCandidate {
  schemaVersion: 1;
  kind: "linear-authority-label-bootstrap-candidate";
  sourceCommit: string;
  workspaceId: string;
  nativeIdentitySha256: string;
  captureReceiptSha256: string;
  groups: Array<{
    id: string;
    name: "Type" | "Agent" | "Domain" | "Risk";
    color: string;
    description: string | null;
  }>;
  labels: Array<{
    id: string | null;
    name: string;
    parentId: string | null;
    parentName: string | null;
    teamId: string | null;
    teamKey: string | null;
    color: string;
    description: string | null;
    create: boolean;
  }>;
  createLabels: Array<{
    name: "risk" | "delivery-risk" | "financial-risk";
    parentId: string;
    parentName: "Type" | "Risk";
    color: string;
    description: string;
  }>;
  mutationAuthorized: false;
  root: string;
}

function fail(message: string): never {
  throw new Error(`Linear authority label bootstrap: ${message}`);
}

function canonicalJson(value: unknown): string {
  if (value === null || typeof value !== "object") {
    const encoded = JSON.stringify(value);
    if (encoded === undefined) fail("candidate contains undefined");
    return encoded;
  }
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  const row = value as Record<string, unknown>;
  return `{${Object.keys(row).sort().map((key) => `${JSON.stringify(key)}:${canonicalJson(row[key])}`).join(",")}}`;
}

function sha256(value: string): string {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

function one<T>(rows: readonly T[], label: string): T {
  if (rows.length !== 1) fail(`${label} must resolve exactly once`);
  return rows[0]!;
}

function activeGroup(label: NativeLabel, name: string): boolean {
  return label.name === name && label.isGroup === true && label.archivedAt === null &&
    label.inheritedFromId === null && label.parentId === null && label.parentName === null &&
    label.teamId === null && label.teamKey === null;
}

export function buildLinearAuthorityLabelBootstrapCandidate(input: {
  native: LinearNativeIdentityCapture;
  programScope: LinearProgramScopeV3;
  sourceCommit: string;
  nativeIdentitySha256: string;
  captureReceiptSha256: string;
}): LinearAuthorityLabelBootstrapCandidate {
  const { native, programScope } = input;
  if (native.schemaVersion !== 1 || native.coverage?.complete !== true || native.workspace.archivedAt !== null) {
    fail("native identity capture is incomplete or archived");
  }
  if (programScope.schemaVersion !== 3 || !programScope.authorityIssueLabelContract ||
    !/^[a-f0-9]{40,64}$/.test(input.sourceCommit) || !SHA256.test(input.nativeIdentitySha256) ||
    !SHA256.test(input.captureReceiptSha256)) {
    fail("source binding is invalid");
  }
  if (programScope.authorityIssueLabelContract.initialized === true) {
    let captured;
    try {
      captured = buildLinearAuthorityIssueLabelContract(native.labels);
    } catch (error) {
      fail(error instanceof Error ? error.message : "initialized label contract capture is invalid");
    }
    const committed = programScope.authorityIssueLabelContract;
    if (committed.root !== captured.root || JSON.stringify(committed.labels) !== JSON.stringify(captured.labels) ||
      JSON.stringify(committed.groups) !== JSON.stringify(captured.groups)) {
      fail("initialized authority label contract differs from fresh native capture");
    }
  }
  const definitions = programScope.projectDocumentDecisionContract.labelDefinitions;
  const expectedProgramIds = new Map(LABELS.filter((row) => row.id !== null &&
    ["decision", "human-only", "platform", "marketplace"].includes(row.name)).map((row) => [row.name, row.id]));
  for (const [name, id] of expectedProgramIds) {
    const definition = one(definitions.filter((row) => row.name === name), `${name} program label definition`);
    if (definition.id !== id) fail(`${name} program label ID has drifted`);
  }
  const groupIds = new Map<string, string>();
  for (const name of ["Type", "Agent", "Domain"] as const) {
    const matching = definitions.filter((row) => row.groupName === name);
    if (matching.length === 0 || new Set(matching.map((row) => row.groupId)).size !== 1) {
      fail(`${name} program label group identity is invalid`);
    }
    groupIds.set(name, matching[0]!.groupId);
  }
  const riskGroup = one(native.labels.filter((row) => activeGroup(row, "Risk")), "Risk label group");
  groupIds.set("Risk", riskGroup.id);
  const groups = (["Type", "Agent", "Domain", "Risk"] as const).map((name) => {
    const id = groupIds.get(name)!;
    const group = one(native.labels.filter((row) => row.id === id && activeGroup(row, name)), `${name} label group`);
    if (!UUID.test(group.id) || typeof group.color !== "string" || group.color.length === 0 ||
      (group.description !== null && typeof group.description !== "string")) {
      fail(`${name} label group metadata is invalid`);
    }
    return { id: group.id, name, color: group.color, description: group.description };
  });
  if (new Set(groups.map((row) => row.id)).size !== groups.length) fail("authority label groups overlap");
  const requirementsTeam = one(native.teams.filter((row) => row.key === "REQ" && row.name === "Requirements" && row.archivedAt === null), "Requirements team");
  const labels = LABELS.map((expected) => {
    const matches = native.labels.filter((row) => row.name === expected.name && row.isGroup === false);
    if (matches.length > 1) fail(`${expected.name} label is duplicated`);
    const label = matches[0];
    if (!label) {
      if (expected.id !== null) fail(`${expected.name} governed label is missing`);
      return {
        id: null,
        name: expected.name,
        parentId: groupIds.get(expected.parentName!)!,
        parentName: expected.parentName,
        teamId: null,
        teamKey: null,
        color: expected.color,
        description: expected.description,
        create: true,
      };
    }
    const parentId = expected.parentName === null ? null : groupIds.get(expected.parentName)!;
    const teamId = expected.teamKey === "REQ" ? requirementsTeam.id : null;
    if (!UUID.test(label.id) || (expected.id !== null && label.id !== expected.id) ||
      label.archivedAt !== null || label.inheritedFromId !== null || label.parentId !== parentId ||
      label.parentName !== expected.parentName || label.teamId !== teamId || label.teamKey !== expected.teamKey ||
      label.color.toLocaleUpperCase("en-US") !== expected.color.toLocaleUpperCase("en-US") ||
      label.description !== expected.description) {
      fail(`${expected.name} label has drifted from its exact native meaning or scope`);
    }
    return {
      id: label.id,
      name: label.name,
      parentId: label.parentId,
      parentName: label.parentName,
      teamId: label.teamId,
      teamKey: label.teamKey,
      color: label.color,
      description: label.description,
      create: false,
    };
  });
  const createLabels = labels.filter((row) => row.create).map((row) => {
    if (!(["risk", "delivery-risk", "financial-risk"] as string[]).includes(row.name) ||
      row.parentId === null || row.parentName === null || row.description === null) {
      return fail("label additions exceed the approved bootstrap set");
    }
    return {
      name: row.name as "risk" | "delivery-risk" | "financial-risk",
      parentId: row.parentId,
      parentName: row.parentName as "Type" | "Risk",
      color: row.color,
      description: row.description,
    };
  });
  const projection = {
    schemaVersion: 1 as const,
    kind: "linear-authority-label-bootstrap-candidate" as const,
    sourceCommit: input.sourceCommit,
    workspaceId: native.workspace.id,
    nativeIdentitySha256: input.nativeIdentitySha256,
    captureReceiptSha256: input.captureReceiptSha256,
    groups,
    labels,
    createLabels,
    mutationAuthorized: false as const,
  };
  return { ...projection, root: sha256(canonicalJson(projection)) };
}

export function canonicalLinearAuthorityLabelBootstrapCandidateJson(
  candidate: LinearAuthorityLabelBootstrapCandidate,
): string {
  return `${JSON.stringify(candidate, null, 2)}\n`;
}
