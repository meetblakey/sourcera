import { createHash } from "node:crypto";

import { canonicalLinearRelationKey } from "./linear-live.js";
import type {
  LinearAuthorityAllocation,
  LinearAuthorityManifest,
} from "./linear-authority-manifest.js";
import {
  LinearAuthorityRetryableTransportError,
  type LinearAuthorityEntityKind,
  type LinearAuthorityJson,
  type LinearAuthorityNativeSelector,
  type LinearAuthorityRemoteEntity,
  type LinearAuthorityRemoteRelation,
  type LinearAuthorityWriteTransport,
} from "./linear-authority-publisher.js";

const ENDPOINT = "https://api.linear.app/graphql";
const MAX_BATCH = 100;
const MAX_ISSUE_CREATE_BATCH = 50;
const MAX_ALIAS_BATCH = 25;
const NESTED_READ_LIMIT = 250;
const DEFAULT_TIMEOUT_MS = 30_000;
const DEFAULT_MAX_RESPONSE_BYTES = 32 * 1024 * 1024;

type JsonRecord = Record<string, unknown>;

interface GraphQlError {
  extensions?: { code?: unknown };
}

interface GraphQlEnvelope<T> {
  data?: T;
  errors?: GraphQlError[];
}

interface Connection<T> {
  nodes: T[];
  pageInfo: { hasNextPage: boolean; endCursor: string | null };
}

interface TailConnection<T> {
  nodes: T[];
  pageInfo: { hasPreviousPage: boolean; startCursor: string | null };
}

interface IssueNode {
  id: string;
  identifier: string;
  title: string;
  description: string | null;
  archivedAt: string | null;
  trashed: boolean | null;
  estimate: number | null;
  priority: number;
  dueDate: string | null;
  team: { id: string };
  state: { id: string };
  project: { id: string } | null;
  cycle: { id: string } | null;
  projectMilestone: { id: string } | null;
  parent: { id: string } | null;
  assignee: { id: string } | null;
  labelIds: string[];
  releases: Connection<{ id: string }>;
}

interface DocumentNode {
  id: string;
  title: string;
  content: string | null;
  archivedAt: string | null;
  trashed: boolean | null;
  initiative: { id: string } | null;
  project: { id: string } | null;
  team: { id: string } | null;
  issue: { id: string } | null;
  release: { id: string } | null;
  cycle: { id: string } | null;
}

interface RelationNode {
  id: string;
  type: string;
  archivedAt: string | null;
  issue: { id: string; identifier: string };
  relatedIssue: { id: string; identifier: string };
}

const ISSUE_FIELDS = `
  id
  identifier
  title
  description
  archivedAt
  trashed
  estimate
  priority
  dueDate
  team { id }
  state { id }
  project { id }
  cycle { id }
  projectMilestone { id }
  parent { id }
  assignee { id }
  labelIds
  releases(first: ${NESTED_READ_LIMIT}, includeArchived: true) {
    nodes { id }
    pageInfo { hasNextPage endCursor }
  }
`;

const DOCUMENT_FIELDS = `
  id
  title
  content
  archivedAt
  trashed
  initiative { id }
  project { id }
  team { id }
  issue { id }
  release { id }
  cycle { id }
`;

const RELATION_FIELDS = `
  id
  type
  archivedAt
  issue { id identifier }
  relatedIssue { id identifier }
`;

function fail(message: string): never {
  throw new Error(`Linear authority HTTP transport: ${message}`);
}

const sha256 = (value: string): string => createHash("sha256").update(value).digest("hex");

function canonicalJson(value: unknown): string {
  if (value === null || typeof value !== "object") {
    const encoded = JSON.stringify(value);
    if (encoded === undefined) fail("authority projection contains undefined");
    return encoded;
  }
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  const row = value as JsonRecord;
  return `{${Object.keys(row).sort().map((key) => `${JSON.stringify(key)}:${canonicalJson(row[key])}`).join(",")}}`;
}

function object(value: unknown, label: string): JsonRecord {
  if (value === null || typeof value !== "object" || Array.isArray(value)) fail(`${label} is invalid`);
  return value as JsonRecord;
}

function nonEmptyString(value: unknown, label: string): string {
  if (typeof value !== "string" || value.length === 0) fail(`${label} is invalid`);
  return value;
}

function uuidish(value: unknown, label: string): string {
  return nonEmptyString(value, label).toLowerCase();
}

function nullableString(value: unknown, label: string): string | null {
  if (value === null) return null;
  if (typeof value !== "string") fail(`${label} is invalid`);
  return value;
}

function numberValue(value: unknown, label: string): number {
  if (typeof value !== "number" || !Number.isFinite(value)) fail(`${label} is invalid`);
  return value;
}

function booleanValue(value: unknown, label: string): boolean {
  if (typeof value !== "boolean") fail(`${label} is invalid`);
  return value;
}

function nullableNestedId(value: unknown, label: string): string | null {
  return value === null ? null : uuidish(object(value, label).id, `${label} UUID`);
}

function stringArray(value: unknown, label: string): string[] {
  if (!Array.isArray(value) || value.some((row) => typeof row !== "string" || row.length === 0)) fail(`${label} is invalid`);
  const rows = value as string[];
  if (new Set(rows).size !== rows.length) fail(`${label} contains duplicates`);
  return rows;
}

function terminalConnection<T>(value: unknown, label: string): Connection<T> {
  const row = object(value, label);
  if (!Array.isArray(row.nodes)) fail(`${label} nodes are invalid`);
  const pageInfo = object(row.pageInfo, `${label} page info`);
  if (pageInfo.hasNextPage !== false || (pageInfo.endCursor !== null && typeof pageInfo.endCursor !== "string")) fail(`${label} exceeds the bounded read limit`);
  return { nodes: row.nodes as T[], pageInfo: { hasNextPage: false, endCursor: pageInfo.endCursor as string | null } };
}

function boundedTailConnection<T>(value: unknown, label: string, plannedCardinality: number): TailConnection<T> {
  const row = object(value, label);
  if (
    !Number.isInteger(plannedCardinality)
    || plannedCardinality < 1
    || plannedCardinality > MAX_BATCH
    || !Array.isArray(row.nodes)
    || row.nodes.length > plannedCardinality
  ) fail(`${label} exceeds its planned cardinality`);
  const pageInfo = object(row.pageInfo, `${label} page info`);
  if (
    typeof pageInfo.hasPreviousPage !== "boolean"
    || (pageInfo.startCursor !== null && typeof pageInfo.startCursor !== "string")
  ) {
    fail(`${label} page info is invalid`);
  }
  return {
    nodes: row.nodes as T[],
    pageInfo: {
      hasPreviousPage: pageInfo.hasPreviousPage,
      startCursor: pageInfo.startCursor as string | null,
    },
  };
}

function retryDelayMs(headers: Headers, nowMs: number): number {
  const retryAfter = headers.get("retry-after");
  if (retryAfter) {
    const seconds = Number(retryAfter);
    if (Number.isFinite(seconds) && seconds >= 0) return Math.ceil(seconds * 1_000);
    const date = Date.parse(retryAfter);
    if (!Number.isNaN(date)) return Math.max(0, date - nowMs);
  }
  for (const name of [
    "x-ratelimit-requests-reset",
    "x-ratelimit-reset",
    "x-rate-limit-reset",
    "ratelimit-reset",
  ]) {
    const raw = headers.get(name);
    if (!raw) continue;
    const numeric = Number(raw);
    if (Number.isFinite(numeric) && numeric >= 0) {
      const epochMs = numeric > 10_000_000_000 ? numeric : numeric * 1_000;
      return Math.max(0, Math.ceil(epochMs - nowMs));
    }
    const date = Date.parse(raw);
    if (!Number.isNaN(date)) return Math.max(0, date - nowMs);
  }
  return 0;
}

function retryableGraphQl(errors: readonly GraphQlError[]): boolean {
  const retryableCodes = new Set([
    "INTERNAL_SERVER_ERROR",
    "RATE_LIMITED",
    "RATELIMITED",
    "SERVICE_UNAVAILABLE",
    "TIMEOUT",
  ]);
  return errors.some((error) => typeof error.extensions?.code === "string" && retryableCodes.has(error.extensions.code));
}

function inputPayload(value: { [key: string]: LinearAuthorityJson }, label: string): JsonRecord {
  return object(value, label);
}

function exactKeys(value: JsonRecord, keys: readonly string[], label: string): void {
  if (Object.keys(value).sort().join("\0") !== [...keys].sort().join("\0")) fail(`${label} contract is invalid`);
}

function safeArchivedAt(archivedAt: unknown, trashed: unknown): string | null {
  if (archivedAt !== null && typeof archivedAt !== "string") fail("entity archived state is invalid");
  if (trashed !== null && typeof trashed !== "boolean") fail("entity trash state is invalid");
  return archivedAt as string | null ?? (trashed === true ? "trashed" : null);
}

interface NativeResolvers {
  byPlanKey: Map<string, string>;
  planKeyById: Map<string, string>;
  allocationByPlanKey: Map<string, string>;
  allocationPlanKeyById: Map<string, string>;
}

function buildResolvers(
  manifest: LinearAuthorityManifest & { schemaVersion: 2 },
  allocation: LinearAuthorityAllocation,
): NativeResolvers {
  const byPlanKey = new Map<string, string>();
  const planKeyById = new Map<string, string>();
  for (const rows of [
    manifest.nativeCatalog.teams,
    manifest.nativeCatalog.users,
    manifest.nativeCatalog.initiatives,
    manifest.nativeCatalog.projects,
    manifest.nativeCatalog.cycles,
    manifest.nativeCatalog.milestones,
    manifest.nativeCatalog.releases,
    manifest.nativeCatalog.states,
    manifest.nativeCatalog.labels,
  ]) {
    for (const row of rows) {
      if (byPlanKey.has(row.planKey)) fail(`native selector ${row.planKey} is duplicated`);
      const id = row.id.toLowerCase();
      const prior = planKeyById.get(id);
      if (prior && prior !== row.planKey) fail(`native UUID ${id} has competing plan keys`);
      byPlanKey.set(row.planKey, id);
      planKeyById.set(id, row.planKey);
    }
  }
  const allocationByPlanKey = new Map<string, string>();
  const allocationPlanKeyById = new Map<string, string>();
  for (const row of allocation.allocations) {
    const id = row.uuid.toLowerCase();
    if (allocationByPlanKey.has(row.planKey) || allocationPlanKeyById.has(id)) fail("allocation resolver is duplicated");
    allocationByPlanKey.set(row.planKey, id);
    allocationPlanKeyById.set(id, row.planKey);
  }
  return { byPlanKey, planKeyById, allocationByPlanKey, allocationPlanKeyById };
}

export interface LinearAuthorityHttpTransportOptions {
  manifest: LinearAuthorityManifest & { schemaVersion: 2 };
  allocation: LinearAuthorityAllocation;
  fetcher?: typeof fetch;
  now?: () => number;
  timeoutMs?: number;
  maxResponseBytes?: number;
}

export class LinearAuthorityHttpTransport implements LinearAuthorityWriteTransport {
  private readonly fetcher: typeof fetch;
  private readonly now: () => number;
  private readonly timeoutMs: number;
  private readonly maxResponseBytes: number;
  private readonly resolvers: NativeResolvers;

  constructor(options: LinearAuthorityHttpTransportOptions) {
    if (options.manifest.schemaVersion !== 2 || options.allocation.schemaVersion !== 1) fail("validated v2/v1 authority inputs are required");
    this.fetcher = options.fetcher ?? fetch;
    this.now = options.now ?? Date.now;
    this.timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
    this.maxResponseBytes = options.maxResponseBytes ?? DEFAULT_MAX_RESPONSE_BYTES;
    if (!Number.isInteger(this.timeoutMs) || this.timeoutMs < 1 || this.timeoutMs > 120_000) fail("timeout is outside its safe bound");
    if (!Number.isInteger(this.maxResponseBytes) || this.maxResponseBytes < 1 || this.maxResponseBytes > 64 * 1024 * 1024) fail("response byte limit is outside its safe bound");
    this.resolvers = buildResolvers(options.manifest, options.allocation);
  }

  private resolve(planKey: unknown, nullable = false): string | null {
    if (planKey === null && nullable) return null;
    const key = nonEmptyString(planKey, "native plan key");
    const id = this.resolvers.byPlanKey.get(key) ?? this.resolvers.allocationByPlanKey.get(key);
    if (!id) fail(`native plan key ${key} is unresolved`);
    return id;
  }

  private reverse(id: string | null, nullable = false): string | null {
    if (id === null && nullable) return null;
    if (id === null) return "unresolved:null";
    return this.resolvers.planKeyById.get(id.toLowerCase()) ??
      this.resolvers.allocationPlanKeyById.get(id.toLowerCase()) ??
      `unresolved:${id.toLowerCase()}`;
  }

  private orderedProjection(actualIds: string[], desired: unknown): string[] {
    const actual = actualIds.map((id) => this.reverse(id)!).sort();
    if (!Array.isArray(desired) || desired.some((row) => typeof row !== "string")) return actual;
    const desiredRows = desired as string[];
    return JSON.stringify([...desiredRows].sort()) === JSON.stringify(actual) ? [...desiredRows] : actual;
  }

  private fullIssueMutationInput(payloadValue: { [key: string]: LinearAuthorityJson }): {
    payload: JsonRecord;
    input: JsonRecord;
  } {
    const payload = inputPayload(payloadValue, "issue payload");
    exactKeys(payload, [
      "title", "description", "teamPlanKey", "projectPlanKey", "statePlanKey", "priority", "estimate",
      "dueDate", "cyclePlanKey", "milestonePlanKey", "releasePlanKeys", "labelPlanKeys", "parentPlanKey", "assigneePlanKey",
    ], "issue payload");
    const input: JsonRecord = {
      title: payload.title,
      description: payload.description,
      teamId: this.resolve(payload.teamPlanKey),
      projectId: this.resolve(payload.projectPlanKey),
      stateId: this.resolve(payload.statePlanKey),
      priority: payload.priority,
      estimate: payload.estimate,
      dueDate: payload.dueDate,
      cycleId: this.resolve(payload.cyclePlanKey, true),
      projectMilestoneId: this.resolve(payload.milestonePlanKey, true),
      labelIds: stringArray(payload.labelPlanKeys, "issue label plan keys").map((row) => this.resolve(row)),
      parentId: this.resolve(payload.parentPlanKey, true),
      assigneeId: this.resolve(payload.assigneePlanKey, true),
    };
    return { payload, input };
  }

  private issueCreateInput(payloadValue: { [key: string]: LinearAuthorityJson }, createId: string): JsonRecord {
    const { payload, input } = this.fullIssueMutationInput(payloadValue);
    input.releaseIds = stringArray(payload.releasePlanKeys, "issue release plan keys").map((row) => this.resolve(row));
    input.id = createId;
    return input;
  }

  private issueUpdateInput(payloadValue: { [key: string]: LinearAuthorityJson }): JsonRecord {
    const payload = inputPayload(payloadValue, "issue update payload");
    if (Object.keys(payload).length === 1 && typeof payload.description === "string") return { description: payload.description };
    const full = this.fullIssueMutationInput(payloadValue);
    if (stringArray(full.payload.releasePlanKeys, "issue release plan keys").length !== 0) {
      fail("issue release updates are unsupported");
    }
    return full.input;
  }

  private documentMutationInput(payloadValue: { [key: string]: LinearAuthorityJson }, createId?: string): JsonRecord {
    const payload = inputPayload(payloadValue, "document payload");
    exactKeys(payload, ["title", "content", "attachmentKind", "attachmentPlanKey"], "document payload");
    const attachmentKind = nonEmptyString(payload.attachmentKind, "document attachment kind");
    const fieldByKind = new Map([
      ["initiative", "initiativeId"],
      ["project", "projectId"],
      ["team", "teamId"],
      ["issue", "issueId"],
      ["release", "releaseId"],
      ["cycle", "cycleId"],
    ]);
    const selectedField = fieldByKind.get(attachmentKind);
    if (!selectedField) fail("document attachment kind is unsupported");
    const input: JsonRecord = {
      title: payload.title,
      content: payload.content,
      initiativeId: null,
      projectId: null,
      teamId: null,
      issueId: null,
      releaseId: null,
      cycleId: null,
    };
    input[selectedField] = this.resolve(payload.attachmentPlanKey);
    if (createId) input.id = createId;
    return input;
  }

  private relation(remote: unknown): LinearAuthorityRemoteRelation {
    const row = object(remote, "relation");
    const issue = object(row.issue, "relation issue");
    const related = object(row.relatedIssue, "relation related issue");
    const type = nonEmptyString(row.type, "relation type");
    const canonicalKey = canonicalLinearRelationKey(
      type,
      nonEmptyString(issue.identifier, "relation issue identifier"),
      nonEmptyString(related.identifier, "relation related identifier"),
    );
    if (row.archivedAt !== null && typeof row.archivedAt !== "string") fail("relation archived state is invalid");
    return { uuid: uuidish(row.id, "relation UUID"), canonicalKey, archivedAt: row.archivedAt as string | null };
  }

  private issueEntity(remote: unknown, desired: JsonRecord): LinearAuthorityRemoteEntity {
    const row = object(remote, "issue");
    const releases = terminalConnection<{ id: string }>(row.releases, "issue releases");
    const team = object(row.team, "issue team");
    const state = object(row.state, "issue state");
    const project = row.project === null ? null : object(row.project, "issue project");
    const cycle = row.cycle === null ? null : object(row.cycle, "issue cycle");
    const milestone = row.projectMilestone === null ? null : object(row.projectMilestone, "issue milestone");
    const parent = row.parent === null ? null : object(row.parent, "issue parent");
    const assignee = row.assignee === null ? null : object(row.assignee, "issue assignee");
    const labelIds = stringArray(row.labelIds, "issue label IDs").map((id) => id.toLowerCase());
    const releaseIds = releases.nodes.map((node) => uuidish(object(node, "issue release").id, "issue release UUID"));
    const title = nonEmptyString(row.title, "issue title");
    if (row.description !== null && typeof row.description !== "string") fail("issue description is invalid");
    if (typeof row.priority !== "number" || (row.estimate !== null && typeof row.estimate !== "number") || (row.dueDate !== null && typeof row.dueDate !== "string")) {
      fail("issue scalar state is invalid");
    }
    const authorityPayload = Object.keys(desired).length === 1 && Object.hasOwn(desired, "description")
      ? { description: row.description ?? "" }
      : {
        title,
        description: row.description ?? "",
        teamPlanKey: this.reverse(uuidish(team.id, "issue team UUID")),
        projectPlanKey: this.reverse(project === null ? null : uuidish(project.id, "issue project UUID")),
        statePlanKey: this.reverse(uuidish(state.id, "issue state UUID")),
        priority: row.priority,
        estimate: row.estimate,
        dueDate: row.dueDate,
        cyclePlanKey: this.reverse(cycle === null ? null : uuidish(cycle.id, "issue cycle UUID"), true),
        milestonePlanKey: this.reverse(milestone === null ? null : uuidish(milestone.id, "issue milestone UUID"), true),
        releasePlanKeys: this.orderedProjection(releaseIds, desired.releasePlanKeys),
        labelPlanKeys: this.orderedProjection(labelIds, desired.labelPlanKeys),
        parentPlanKey: this.reverse(parent === null ? null : uuidish(parent.id, "issue parent UUID"), true),
        assigneePlanKey: this.reverse(assignee === null ? null : uuidish(assignee.id, "issue assignee UUID"), true),
      };
    const native = {
      teamId: uuidish(team.id, "issue team UUID"),
      stateId: uuidish(state.id, "issue state UUID"),
      projectId: project === null ? null : uuidish(project.id, "issue project UUID"),
      estimate: row.estimate,
      priority: row.priority,
      dueDate: row.dueDate,
      cycleId: cycle === null ? null : uuidish(cycle.id, "issue cycle UUID"),
      milestoneId: milestone === null ? null : uuidish(milestone.id, "issue milestone UUID"),
      releaseIds: [...releaseIds].sort(),
      parentIssueUuid: parent === null ? null : uuidish(parent.id, "issue parent UUID"),
      assigneeId: assignee === null ? null : uuidish(assignee.id, "issue assignee UUID"),
      labelIds: [...labelIds].sort(),
    };
    return {
      uuid: uuidish(row.id, "issue UUID"),
      entityKind: "issue",
      identifier: nonEmptyString(row.identifier, "issue identifier"),
      archivedAt: safeArchivedAt(row.archivedAt, row.trashed),
      state: {
        titleSha256: sha256(title),
        bodySha256: sha256((row.description as string | null) ?? ""),
        nativeSha256: sha256(JSON.stringify(native)),
        authorityPayloadSha256: sha256(canonicalJson(authorityPayload)),
      },
    };
  }

  private documentEntity(remote: unknown, desired: JsonRecord): LinearAuthorityRemoteEntity {
    const row = object(remote, "document");
    const attachments = ["initiative", "project", "team", "issue", "release", "cycle"] as const;
    const attached = attachments.flatMap((kind) => {
      const value = row[kind];
      return value === null ? [] : [{ kind, id: uuidish(object(value, `document ${kind}`).id, `document ${kind} UUID`) }];
    });
    if (attached.length > 1) fail("document has multiple native attachments");
    const desiredKind = nonEmptyString(desired.attachmentKind, "desired document attachment kind");
    const actualAttachment = attached[0];
    const authorityPayload = {
      title: nonEmptyString(row.title, "document title"),
      content: row.content ?? "",
      attachmentKind: actualAttachment?.kind ?? desiredKind,
      attachmentPlanKey: actualAttachment ? this.reverse(actualAttachment.id) : "unresolved:null",
    };
    if (row.content !== null && typeof row.content !== "string") fail("document content is invalid");
    const topology = {
      initiativeId: attached.find((value) => value.kind === "initiative")?.id ?? null,
      projectId: attached.find((value) => value.kind === "project")?.id ?? null,
      teamId: attached.find((value) => value.kind === "team")?.id ?? null,
      issueId: attached.find((value) => value.kind === "issue")?.id ?? null,
      releaseId: attached.find((value) => value.kind === "release")?.id ?? null,
      cycleId: attached.find((value) => value.kind === "cycle")?.id ?? null,
    };
    return {
      uuid: uuidish(row.id, "document UUID"),
      entityKind: "document",
      identifier: null,
      archivedAt: safeArchivedAt(row.archivedAt, row.trashed),
      state: {
        titleSha256: sha256(authorityPayload.title),
        bodySha256: sha256((row.content as string | null) ?? ""),
        nativeSha256: sha256(JSON.stringify(topology)),
        authorityPayloadSha256: sha256(canonicalJson(authorityPayload)),
      },
    };
  }

  private entity(remote: unknown, kind: LinearAuthorityEntityKind, desired: JsonRecord): LinearAuthorityRemoteEntity {
    return kind === "issue" ? this.issueEntity(remote, desired) : this.documentEntity(remote, desired);
  }

  private async boundedResponseText(response: Response): Promise<string> {
    if (!response.body) return "";
    const reader = response.body.getReader();
    const chunks: Buffer[] = [];
    let bytes = 0;
    try {
      while (true) {
        const row = await reader.read();
        if (row.done) break;
        const chunk = Buffer.from(row.value);
        bytes += chunk.byteLength;
        if (bytes > this.maxResponseBytes) {
          await reader.cancel();
          fail("response exceeds its byte limit");
        }
        chunks.push(chunk);
      }
    } finally {
      reader.releaseLock();
    }
    return Buffer.concat(chunks, bytes).toString("utf8");
  }

  private async request<T>(query: string, variables: JsonRecord, credential: string): Promise<T> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);
    try {
      let response: Response;
      try {
        response = await this.fetcher(ENDPOINT, {
          method: "POST",
          headers: { authorization: credential, "content-type": "application/json" },
          body: JSON.stringify({ query, variables }),
          signal: controller.signal,
        });
      } catch {
        throw new LinearAuthorityRetryableTransportError();
      }
      let raw: string;
      try {
        raw = await this.boundedResponseText(response);
      } catch (error) {
        if (error instanceof LinearAuthorityRetryableTransportError ||
          (error instanceof Error && error.message === "Linear authority HTTP transport: response exceeds its byte limit")) throw error;
        throw new LinearAuthorityRetryableTransportError(retryDelayMs(response.headers, this.now()));
      }
      let envelope: GraphQlEnvelope<T>;
      try {
        envelope = JSON.parse(raw) as GraphQlEnvelope<T>;
      } catch {
        if (response.status === 429 || response.status >= 500) {
          throw new LinearAuthorityRetryableTransportError(retryDelayMs(response.headers, this.now()));
        }
        fail("response is not valid JSON");
      }
      const errors = Array.isArray(envelope.errors) ? envelope.errors : [];
      const retryable = response.status === 408 || response.status === 429 || response.status >= 500 || retryableGraphQl(errors);
      if (retryable) throw new LinearAuthorityRetryableTransportError(retryDelayMs(response.headers, this.now()));
      if (!response.ok || errors.length > 0 || envelope.data === undefined || envelope.data === null) fail("request was rejected");
      return envelope.data;
    } finally {
      clearTimeout(timeout);
    }
  }

  private selectorSelection(selector: LinearAuthorityNativeSelector, index: number): string {
    const id = `$selectorId${index}`;
    if (selector.kind === "team") return `selector${index}: team(id: ${id}) { id key name archivedAt }`;
    if (selector.kind === "user") return `selector${index}: user(id: ${id}) { id name active archivedAt }`;
    if (selector.kind === "initiative") return `selector${index}: initiative(id: ${id}) {
      id name content description updatedAt archivedAt owner { id } status priority health healthUpdatedAt
      startedAt targetDate targetDateResolution parentInitiative { id }
    }`;
    if (selector.kind === "project") {
      const teamIds = selector.identity.teamIds;
      const initiativeIds = selector.identity.initiativeIds;
      if (!Array.isArray(teamIds) || !Array.isArray(initiativeIds) || teamIds.length >= NESTED_READ_LIMIT || initiativeIds.length >= NESTED_READ_LIMIT) {
        fail("project selector topology exceeds its safe bound");
      }
      return `selector${index}: project(id: ${id}) {
        id name content updatedAt archivedAt status { id name type } priority lead { id }
        startDate startDateResolution targetDate targetDateResolution
        teams(first: ${Math.max(1, teamIds.length + 1)}, includeArchived: true) {
          nodes { id } pageInfo { hasNextPage endCursor }
        }
        initiatives(first: ${Math.max(1, initiativeIds.length + 1)}, includeArchived: true) {
          nodes { id } pageInfo { hasNextPage endCursor }
        }
      }`;
    }
    if (selector.kind === "release_pipeline") {
      const teamIds = selector.identity.teamIds;
      const stages = selector.identity.stages;
      if (!Array.isArray(teamIds) || !Array.isArray(stages) || teamIds.length >= NESTED_READ_LIMIT || stages.length >= NESTED_READ_LIMIT) {
        fail("release pipeline selector topology exceeds its safe bound");
      }
      return `selector${index}: releasePipeline(id: ${id}) {
        id name updatedAt archivedAt type isProduction
        teams(first: ${Math.max(1, teamIds.length + 1)}, includeArchived: true) {
          nodes { id } pageInfo { hasNextPage endCursor }
        }
        stages(first: ${Math.max(1, stages.length + 1)}, includeArchived: true) {
          nodes { id name type archivedAt position frozen } pageInfo { hasNextPage endCursor }
        }
      }`;
    }
    if (selector.kind === "cycle") return `selector${index}: cycle(id: ${id}) {
      id number name description updatedAt archivedAt startsAt endsAt completedAt team { id key } inheritedFrom { id }
    }`;
    if (selector.kind === "milestone") return `selector${index}: projectMilestone(id: ${id}) {
      id name description updatedAt archivedAt targetDate status project { id }
    }`;
    if (selector.kind === "release") return `selector${index}: release(id: ${id}) {
      id name description version commitSha startDate startedAt targetDate completedAt updatedAt archivedAt
      pipeline { id } stage { id name type }
    }`;
    if (selector.kind === "state") return `selector${index}: workflowState(id: ${id}) {
      id name type archivedAt team { id key }
    }`;
    if (selector.kind === "label" || selector.kind === "label_parent") return `selector${index}: issueLabel(id: ${id}) {
      id name color description archivedAt inheritedFrom { id } isGroup parent { id name } team { id key }
    }`;
    fail("native selector kind is unsupported");
  }

  private selectorIdentity(selector: LinearAuthorityNativeSelector, remote: unknown): LinearAuthorityNativeSelector {
    const row = object(remote, `native ${selector.kind} selector`);
    const id = uuidish(row.id, `native ${selector.kind} selector UUID`);
    if (id !== selector.id.toLowerCase()) fail("native selector returned an unexpected UUID");
    let identity: { [key: string]: LinearAuthorityJson };
    if (selector.kind === "team") {
      identity = {
        key: nonEmptyString(row.key, "native team key"),
        name: nonEmptyString(row.name, "native team name"),
        archivedAt: nullableString(row.archivedAt, "native team archivedAt"),
      };
    } else if (selector.kind === "user") {
      identity = {
        name: nonEmptyString(row.name, "native user name"),
        active: booleanValue(row.active, "native user active"),
        archivedAt: nullableString(row.archivedAt, "native user archivedAt"),
      };
    } else if (selector.kind === "initiative") {
      identity = {
        name: nonEmptyString(row.name, "native initiative name"),
        contentSha256: sha256(nullableString(row.content, "native initiative content") ?? ""),
        descriptionSha256: sha256(nullableString(row.description, "native initiative description") ?? ""),
        updatedAt: nonEmptyString(row.updatedAt, "native initiative updatedAt"),
        archivedAt: nullableString(row.archivedAt, "native initiative archivedAt"),
        ownerId: nullableNestedId(row.owner, "native initiative owner"),
        status: nonEmptyString(row.status, "native initiative status"),
        priority: numberValue(row.priority, "native initiative priority"),
        health: nullableString(row.health, "native initiative health"),
        healthUpdatedAt: nullableString(row.healthUpdatedAt, "native initiative healthUpdatedAt"),
        startedAt: nullableString(row.startedAt, "native initiative startedAt"),
        targetDate: nullableString(row.targetDate, "native initiative targetDate"),
        targetDateResolution: nullableString(row.targetDateResolution, "native initiative targetDateResolution"),
        parentInitiativeId: nullableNestedId(row.parentInitiative, "native initiative parent"),
      };
    } else if (selector.kind === "project") {
      const status = object(row.status, "native project status");
      const teams = terminalConnection<{ id: string }>(row.teams, "native project teams");
      const initiatives = terminalConnection<{ id: string }>(row.initiatives, "native project initiatives");
      identity = {
        name: nonEmptyString(row.name, "native project name"),
        contentSha256: sha256(nullableString(row.content, "native project content") ?? ""),
        updatedAt: nonEmptyString(row.updatedAt, "native project updatedAt"),
        archivedAt: nullableString(row.archivedAt, "native project archivedAt"),
        statusId: uuidish(status.id, "native project status UUID"),
        status: nonEmptyString(status.name, "native project status name"),
        statusType: nonEmptyString(status.type, "native project status type"),
        priority: numberValue(row.priority, "native project priority"),
        leadId: nullableNestedId(row.lead, "native project lead"),
        startDate: nullableString(row.startDate, "native project startDate"),
        startDateResolution: nullableString(row.startDateResolution, "native project startDateResolution"),
        targetDate: nullableString(row.targetDate, "native project targetDate"),
        targetDateResolution: nullableString(row.targetDateResolution, "native project targetDateResolution"),
        teamIds: teams.nodes.map((team) => uuidish(object(team, "native project team").id, "native project team UUID")).sort(),
        initiativeIds: initiatives.nodes.map((initiative) => uuidish(object(initiative, "native project initiative").id, "native project initiative UUID")).sort(),
      };
    } else if (selector.kind === "release_pipeline") {
      const teams = terminalConnection<{ id: string }>(row.teams, "native release pipeline teams");
      const stages = terminalConnection<JsonRecord>(row.stages, "native release pipeline stages");
      identity = {
        name: nonEmptyString(row.name, "native release pipeline name"),
        updatedAt: nonEmptyString(row.updatedAt, "native release pipeline updatedAt"),
        archivedAt: nullableString(row.archivedAt, "native release pipeline archivedAt"),
        type: nonEmptyString(row.type, "native release pipeline type"),
        isProduction: booleanValue(row.isProduction, "native release pipeline production flag"),
        teamIds: teams.nodes.map((team) => uuidish(object(team, "native release pipeline team").id, "native release pipeline team UUID")).sort(),
        stages: stages.nodes.map((stageValue) => {
          const stage = object(stageValue, "native release stage");
          return {
            id: uuidish(stage.id, "native release stage UUID"),
            name: nonEmptyString(stage.name, "native release stage name"),
            type: nonEmptyString(stage.type, "native release stage type"),
            position: numberValue(stage.position, "native release stage position"),
            frozen: booleanValue(stage.frozen, "native release stage frozen flag"),
            archivedAt: nullableString(stage.archivedAt, "native release stage archivedAt"),
          };
        }).sort((left, right) => left.id.localeCompare(right.id)),
      };
    } else if (selector.kind === "cycle") {
      const team = object(row.team, "native cycle team");
      identity = {
        number: numberValue(row.number, "native cycle number"),
        name: nullableString(row.name, "native cycle name"),
        descriptionSha256: sha256(nullableString(row.description, "native cycle description") ?? ""),
        updatedAt: nonEmptyString(row.updatedAt, "native cycle updatedAt"),
        archivedAt: nullableString(row.archivedAt, "native cycle archivedAt"),
        startsAt: nonEmptyString(row.startsAt, "native cycle startsAt"),
        endsAt: nonEmptyString(row.endsAt, "native cycle endsAt"),
        completedAt: nullableString(row.completedAt, "native cycle completedAt"),
        teamId: uuidish(team.id, "native cycle team UUID"),
        teamKey: nonEmptyString(team.key, "native cycle team key"),
        inheritedFromId: nullableNestedId(row.inheritedFrom, "native cycle inherited source"),
      };
    } else if (selector.kind === "milestone") {
      identity = {
        name: nonEmptyString(row.name, "native milestone name"),
        descriptionSha256: sha256(nullableString(row.description, "native milestone description") ?? ""),
        updatedAt: nonEmptyString(row.updatedAt, "native milestone updatedAt"),
        archivedAt: nullableString(row.archivedAt, "native milestone archivedAt"),
        targetDate: nullableString(row.targetDate, "native milestone targetDate"),
        status: nonEmptyString(row.status, "native milestone status"),
        projectId: uuidish(object(row.project, "native milestone project").id, "native milestone project UUID"),
      };
    } else if (selector.kind === "release") {
      const stage = object(row.stage, "native release stage");
      identity = {
        name: nonEmptyString(row.name, "native release name"),
        descriptionSha256: sha256(nullableString(row.description, "native release description") ?? ""),
        version: nullableString(row.version, "native release version"),
        commitSha: nullableString(row.commitSha, "native release commitSha"),
        startDate: nullableString(row.startDate, "native release startDate"),
        startedAt: nullableString(row.startedAt, "native release startedAt"),
        targetDate: nullableString(row.targetDate, "native release targetDate"),
        completedAt: nullableString(row.completedAt, "native release completedAt"),
        updatedAt: nonEmptyString(row.updatedAt, "native release updatedAt"),
        archivedAt: nullableString(row.archivedAt, "native release archivedAt"),
        pipelineId: uuidish(object(row.pipeline, "native release pipeline").id, "native release pipeline UUID"),
        stageId: uuidish(stage.id, "native release stage UUID"),
        stageName: nonEmptyString(stage.name, "native release stage name"),
        stageType: nonEmptyString(stage.type, "native release stage type"),
      };
    } else if (selector.kind === "state") {
      const team = object(row.team, "native workflow state team");
      identity = {
        name: nonEmptyString(row.name, "native workflow state name"),
        type: nonEmptyString(row.type, "native workflow state type"),
        archivedAt: nullableString(row.archivedAt, "native workflow state archivedAt"),
        teamId: uuidish(team.id, "native workflow state team UUID"),
        teamKey: nonEmptyString(team.key, "native workflow state team key"),
      };
    } else {
      const parent = row.parent === null ? null : object(row.parent, "native label parent");
      const team = row.team === null ? null : object(row.team, "native label team");
      const common = {
        name: nonEmptyString(row.name, "native label name"),
        archivedAt: nullableString(row.archivedAt, "native label archivedAt"),
        inheritedFromId: nullableNestedId(row.inheritedFrom, "native inherited label"),
        isGroup: booleanValue(row.isGroup, "native label group flag"),
        teamId: team === null ? null : uuidish(team.id, "native label team UUID"),
        teamKey: team === null ? null : nonEmptyString(team.key, "native label team key"),
      };
      const labelIdentity = {
        ...common,
        color: nonEmptyString(row.color, "native label color"),
        description: nullableString(row.description, "native label description"),
        parentId: parent === null ? null : uuidish(parent.id, "native label parent UUID"),
        parentName: parent === null ? null : nonEmptyString(parent.name, "native label parent name"),
      };
      identity = labelIdentity;
    }
    return { kind: selector.kind, planKey: selector.planKey, id, identity };
  }

  async readNativeSelectors(input: Parameters<LinearAuthorityWriteTransport["readNativeSelectors"]>[0]): Promise<LinearAuthorityNativeSelector[]> {
    if (input.selectors.length < 1 || input.selectors.length > NESTED_READ_LIMIT) fail("native selector batch is outside its safe bound");
    const seen = new Set<string>();
    for (const selector of input.selectors) {
      const key = `${selector.kind}:${uuidish(selector.id, "native selector UUID")}`;
      if (seen.has(key)) fail("native selector batch duplicates an identity");
      seen.add(key);
    }
    const declarations = input.selectors.map((_, index) => `$selectorId${index}: String!`);
    const selections = input.selectors.map((selector, index) => this.selectorSelection(selector, index));
    const variables = Object.fromEntries(input.selectors.map((selector, index) => [`selectorId${index}`, selector.id]));
    const query = `query LinearAuthorityNativeSelectors(${declarations.join(", ")}) { ${selections.join("\n")} }`;
    const data = await this.request<Record<string, unknown>>(query, variables, input.credential);
    return input.selectors.map((selector, index) => this.selectorIdentity(selector, data[`selector${index}`]));
  }

  async listRelationsPage(input: Parameters<LinearAuthorityWriteTransport["listRelationsPage"]>[0]) {
    if (!Number.isInteger(input.first) || input.first < 1 || input.first > NESTED_READ_LIMIT) fail("relation page size is outside its safe bound");
    const query = `
      query LinearAuthorityRelations($after: String, $first: Int!, $includeArchived: Boolean!) {
        issueRelations(after: $after, first: $first, includeArchived: $includeArchived) {
          nodes { ${RELATION_FIELDS} }
          pageInfo { hasNextPage endCursor }
        }
      }
    `;
    const data = await this.request<{ issueRelations: Connection<RelationNode> }>(query, {
      after: input.after,
      first: input.first,
      includeArchived: input.includeArchived,
    }, input.credential);
    const connection = object(data.issueRelations, "relation connection");
    if (!Array.isArray(connection.nodes)) fail("relation connection nodes are invalid");
    const pageInfo = object(connection.pageInfo, "relation page info");
    if (typeof pageInfo.hasNextPage !== "boolean" || (pageInfo.endCursor !== null && typeof pageInfo.endCursor !== "string")) fail("relation page info is invalid");
    return {
      rows: connection.nodes.map((row) => this.relation(row)),
      pageInfo: { hasNextPage: pageInfo.hasNextPage, endCursor: pageInfo.endCursor as string | null },
    };
  }

  async readEntities(input: Parameters<LinearAuthorityWriteTransport["readEntities"]>[0]): Promise<LinearAuthorityRemoteEntity[]> {
    if (input.requests.length < 1 || input.requests.length > MAX_BATCH) fail("entity read batch is outside its safe bound");
    const issueIds = input.requests.filter((row) => row.entityKind === "issue").map((row) => row.id);
    const documentIds = input.requests.filter((row) => row.entityKind === "document").map((row) => row.id);
    const selections: string[] = [];
    const variables: JsonRecord = {};
    const declarations: string[] = [];
    if (issueIds.length > 0) {
      declarations.push("$issueIds: [ID!]!");
      variables.issueIds = issueIds;
      selections.push(`issues(first: ${issueIds.length}, includeArchived: true, filter: { id: { in: $issueIds } }) { nodes { ${ISSUE_FIELDS} } pageInfo { hasNextPage endCursor } }`);
    }
    if (documentIds.length > 0) {
      declarations.push("$documentIds: [ID!]!");
      variables.documentIds = documentIds;
      selections.push(`documents(first: ${documentIds.length}, includeArchived: true, filter: { id: { in: $documentIds } }) { nodes { ${DOCUMENT_FIELDS} } pageInfo { hasNextPage endCursor } }`);
    }
    const query = `query LinearAuthorityEntityRead(${declarations.join(", ")}) { ${selections.join("\n")} }`;
    const data = await this.request<{ issues?: Connection<IssueNode>; documents?: Connection<DocumentNode> }>(query, variables, input.credential);
    const desiredById = new Map(input.requests.map((request) => [request.id.toLowerCase(), request]));
    const rows: LinearAuthorityRemoteEntity[] = [];
    if (data.issues) {
      const connection = terminalConnection<IssueNode>(data.issues, "issue read connection");
      for (const row of connection.nodes) {
        const request = desiredById.get(uuidish(object(row, "issue read row").id, "issue read UUID"));
        if (!request || request.entityKind !== "issue") fail("issue read returned an unexpected UUID");
        rows.push(this.issueEntity(row, request.payload));
      }
    }
    if (data.documents) {
      const connection = terminalConnection<DocumentNode>(data.documents, "document read connection");
      for (const row of connection.nodes) {
        const request = desiredById.get(uuidish(object(row, "document read row").id, "document read UUID"));
        if (!request || request.entityKind !== "document") fail("document read returned an unexpected UUID");
        rows.push(this.documentEntity(row, request.payload));
      }
    }
    if (new Set(rows.map((row) => row.uuid)).size !== rows.length) fail("entity read returned duplicate UUIDs");
    return rows;
  }

  async issueBatchCreate(input: Parameters<LinearAuthorityWriteTransport["issueBatchCreate"]>[0]): Promise<LinearAuthorityRemoteEntity[]> {
    if (input.issues.length < 1 || input.issues.length > MAX_ISSUE_CREATE_BATCH) fail("issue create batch is outside its safe bound");
    const query = `
      mutation LinearAuthorityIssueBatchCreate($input: IssueBatchCreateInput!) {
        issueBatchCreate(input: $input) {
          success
          issues { ${ISSUE_FIELDS} }
        }
      }
    `;
    const data = await this.request<{ issueBatchCreate: { success: boolean; issues: IssueNode[] } }>(query, {
      input: { issues: input.issues.map((row) => this.issueCreateInput(row.payload, row.id)) },
    }, input.credential);
    const payload = object(data.issueBatchCreate, "issue batch payload");
    if (payload.success !== true || !Array.isArray(payload.issues)) fail("issue batch mutation failed");
    const desired = new Map(input.issues.map((row) => [row.id.toLowerCase(), row.payload]));
    return payload.issues.map((row) => {
      const id = uuidish(object(row, "created issue").id, "created issue UUID");
      const projection = desired.get(id);
      if (!projection) fail("issue batch returned an unexpected UUID");
      return this.issueEntity(row, projection);
    });
  }

  async mutateEntitiesAliased(input: Parameters<LinearAuthorityWriteTransport["mutateEntitiesAliased"]>[0]): Promise<LinearAuthorityRemoteEntity[]> {
    if (input.mutations.length < 1 || input.mutations.length > MAX_ALIAS_BATCH) fail("entity mutation batch is outside its safe bound");
    const declarations: string[] = [];
    const selections: string[] = [];
    const variables: JsonRecord = {};
    input.mutations.forEach((row, index) => {
      if (row.action === "create_document") {
        declarations.push(`$input${index}: DocumentCreateInput!`);
        variables[`input${index}`] = this.documentMutationInput(row.payload, row.id);
        selections.push(`op${index}: documentCreate(input: $input${index}) { success document { ${DOCUMENT_FIELDS} } }`);
      } else if (row.action === "update_issue") {
        declarations.push(`$id${index}: String!`);
        declarations.push(`$input${index}: IssueUpdateInput!`);
        variables[`id${index}`] = row.id;
        variables[`input${index}`] = this.issueUpdateInput(row.payload);
        selections.push(`op${index}: issueUpdate(id: $id${index}, input: $input${index}) { success issue { ${ISSUE_FIELDS} } }`);
      } else {
        declarations.push(`$id${index}: String!`);
        declarations.push(`$input${index}: DocumentUpdateInput!`);
        variables[`id${index}`] = row.id;
        variables[`input${index}`] = this.documentMutationInput(row.payload);
        selections.push(`op${index}: documentUpdate(id: $id${index}, input: $input${index}) { success document { ${DOCUMENT_FIELDS} } }`);
      }
    });
    const query = `mutation LinearAuthorityEntityMutations(${declarations.join(", ")}) { ${selections.join("\n")} }`;
    const data = await this.request<Record<string, unknown>>(query, variables, input.credential);
    return input.mutations.map((row, index) => {
      const payload = object(data[`op${index}`], `entity mutation ${index}`);
      if (payload.success !== true) fail(`entity mutation ${index} failed`);
      return this.entity(row.entityKind === "issue" ? payload.issue : payload.document, row.entityKind, row.payload);
    });
  }

  async readRelations(input: Parameters<LinearAuthorityWriteTransport["readRelations"]>[0]): Promise<LinearAuthorityRemoteRelation[]> {
    if (input.requests.length < 1 || input.requests.length > MAX_BATCH) fail("relation read batch is outside its safe bound");
    const expectedIds = new Set<string>();
    const sourceGroups: Array<{ sourceUuid: string; plannedCardinality: number }> = [];
    const sourceIndexes = new Map<string, number>();
    for (const request of input.requests) {
      const id = uuidish(request.id, "relation read UUID");
      if (expectedIds.has(id)) fail("relation read batch duplicates a UUID");
      expectedIds.add(id);
      const sourceUuid = uuidish(request.sourceUuid, "relation read source UUID");
      uuidish(request.targetUuid, "relation read target UUID");
      const sourceIndex = sourceIndexes.get(sourceUuid);
      if (sourceIndex === undefined) {
        sourceIndexes.set(sourceUuid, sourceGroups.length);
        sourceGroups.push({ sourceUuid, plannedCardinality: 1 });
      } else {
        sourceGroups[sourceIndex]!.plannedCardinality += 1;
      }
    }
    const requestedNodes = sourceGroups.reduce((sum, row) => sum + row.plannedCardinality, 0);
    if (requestedNodes !== input.requests.length || requestedNodes > MAX_BATCH) fail("relation read query exceeds its safe bound");
    const declarations = sourceGroups.map((_, index) => `$id${index}: String!`);
    const selections = sourceGroups.map((group, index) => `
      issue${index}: issue(id: $id${index}) {
        relations(last: ${group.plannedCardinality}, orderBy: createdAt, includeArchived: true) {
          nodes { ${RELATION_FIELDS} }
          pageInfo { hasPreviousPage startCursor }
        }
      }
    `);
    const variables = Object.fromEntries(sourceGroups.map((group, index) => [`id${index}`, group.sourceUuid]));
    const query = `query LinearAuthorityRelationRead(${declarations.join(", ")}) { ${selections.join("\n")} }`;
    const data = await this.request<Record<string, unknown>>(query, variables, input.credential);
    const found = new Map<string, LinearAuthorityRemoteRelation>();
    sourceGroups.forEach((group, index) => {
      const issue = object(data[`issue${index}`], `relation read issue ${index}`);
      const connection = boundedTailConnection<RelationNode>(
        issue.relations,
        `relation read issue ${index} relations`,
        group.plannedCardinality,
      );
      for (const node of connection.nodes) {
        const relation = this.relation(node);
        if (!expectedIds.has(relation.uuid)) continue;
        const prior = found.get(relation.uuid);
        if (prior && canonicalJson(prior) !== canonicalJson(relation)) fail("relation read returned inconsistent duplicate state");
        found.set(relation.uuid, relation);
      }
    });
    return input.requests.flatMap((request) => {
      const row = found.get(request.id.toLowerCase());
      return row ? [row] : [];
    });
  }

  async createRelationsAliased(input: Parameters<LinearAuthorityWriteTransport["createRelationsAliased"]>[0]): Promise<LinearAuthorityRemoteRelation[]> {
    if (input.relations.length < 1 || input.relations.length > MAX_ALIAS_BATCH) fail("relation mutation batch is outside its safe bound");
    const declarations = input.relations.map((_, index) => `$input${index}: IssueRelationCreateInput!`);
    const selections = input.relations.map((_, index) => `op${index}: issueRelationCreate(input: $input${index}) { success issueRelation { ${RELATION_FIELDS} } }`);
    const variables = Object.fromEntries(input.relations.map((row, index) => [`input${index}`, {
      id: row.id,
      type: row.type,
      issueId: row.sourceUuid,
      relatedIssueId: row.targetUuid,
    }]));
    const query = `mutation LinearAuthorityRelationCreate(${declarations.join(", ")}) { ${selections.join("\n")} }`;
    const data = await this.request<Record<string, unknown>>(query, variables, input.credential);
    return input.relations.map((_, index) => {
      const payload = object(data[`op${index}`], `relation mutation ${index}`);
      if (payload.success !== true) fail(`relation mutation ${index} failed`);
      return this.relation(payload.issueRelation);
    });
  }
}
