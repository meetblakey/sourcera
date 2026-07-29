import { descriptionFingerprint } from "./fingerprint.js";

const ENDPOINT = "https://api.linear.app/graphql";
const DEFAULT_TIMEOUT_MS = 30_000;
const DEFAULT_MAX_HTTP_ATTEMPTS = 1_000;
const DEFAULT_MAX_RESPONSE_BYTES = 4 * 1024 * 1024;
const MAX_LABEL_IDS = 100;
const CONNECTION_PAGE_SIZE = 100;
const LABEL_USE_PAGE_SIZE = 50;
const MAX_CONNECTION_PAGES = 20;
const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
const HEX_COLOR = /^#[0-9a-f]{6}$/i;

type JsonRecord = Record<string, unknown>;

interface GraphQlEnvelope<T> {
  data?: T | null;
  errors?: unknown;
}

export interface LinearRequirementLabelState {
  id: string;
  name: string;
  color: string;
  description: string | null;
  archivedAt: string | null;
  retiredAt: string | null;
  inheritedFromId: string | null;
  isGroup: boolean;
  parentId: string | null;
  parentName: string | null;
  teamId: string | null;
  teamKey: string | null;
}

export interface LinearRequirementIssueState {
  id: string;
  identifier: string;
  title: string;
  descriptionSha256: string;
  archivedAt: string | null;
  trashed: boolean | null;
  updatedAt: string;
  teamId: string;
  teamKey: string;
  stateId: string;
  projectId: string | null;
  estimate: number | null;
  priority: number;
  dueDate: string | null;
  cycleId: string | null;
  milestoneId: string | null;
  releaseIds: string[];
  parentIssueUuid: string | null;
  assigneeId: string | null;
  labelIds: string[];
  relationIds: string[];
}

export interface LinearRequirementLabelCreateInput {
  id: string;
  name: string;
  color: string;
  description: string | null;
  teamId: string;
  isGroup: false;
  parentId: null;
}

export interface LinearRequirementLabelTransport {
  readLabel(id: string): Promise<LinearRequirementLabelState | null>;
  readIssue(id: string): Promise<LinearRequirementIssueState>;
  listIssueIdsByLabel(id: string): Promise<string[]>;
  renameLabel(id: string, name: string): Promise<LinearRequirementLabelState>;
  createLabel(input: LinearRequirementLabelCreateInput): Promise<LinearRequirementLabelState>;
  replaceIssueLabels(id: string, labelIds: readonly string[]): Promise<LinearRequirementIssueState>;
  retireLabel(id: string): Promise<LinearRequirementLabelState>;
  restoreLabel(id: string): Promise<LinearRequirementLabelState>;
}

export interface LinearRequirementLabelHttpTransportOptions {
  credential: string;
  fetcher?: typeof fetch;
  timeoutMs?: number;
  maxHttpAttempts?: number;
  maxResponseBytes?: number;
}

class LinearRequirementLabelHttpTransportError extends Error {}

function fail(message: string): never {
  throw new LinearRequirementLabelHttpTransportError(`Linear Requirement label HTTP transport: ${message}`);
}

function record(value: unknown, label: string): JsonRecord {
  if (value === null || typeof value !== "object" || Array.isArray(value)) fail(`${label} is invalid`);
  return value as JsonRecord;
}

function stringValue(value: unknown, label: string): string {
  if (typeof value !== "string" || value.length === 0) fail(`${label} is invalid`);
  return value;
}

function nullableString(value: unknown, label: string): string | null {
  if (value === null) return null;
  return stringValue(value, label);
}

function finiteNumber(value: unknown, label: string): number {
  if (typeof value !== "number" || !Number.isFinite(value)) fail(`${label} is invalid`);
  return value;
}

function nullableFiniteNumber(value: unknown, label: string): number | null {
  if (value === null) return null;
  return finiteNumber(value, label);
}

function canonicalUuid(value: unknown, label: string): string {
  const id = stringValue(value, label);
  if (!UUID_V4.test(id) || id !== id.toLowerCase()) fail(`${label} is invalid`);
  return id;
}

function exactKeys(value: JsonRecord, keys: readonly string[]): boolean {
  return Object.keys(value).sort().join("\0") === [...keys].sort().join("\0");
}

function sameStrings(left: readonly string[], right: readonly string[]): boolean {
  return JSON.stringify([...left].sort()) === JSON.stringify([...right].sort());
}

const LABEL_FIELDS = `
  id
  name
  color
  description
  archivedAt
  retiredAt
  inheritedFrom { id }
  isGroup
  parent { id name }
  team { id key }
`;

const PAGE_INFO_FIELDS = "pageInfo { hasNextPage endCursor }";

const ISSUE_FIELDS = `
  id
  identifier
  title
  description
  archivedAt
  trashed
  updatedAt
  team { id key }
  state { id }
  project { id }
  estimate
  priority
  dueDate
  cycle { id }
  projectMilestone { id }
  releases(first: ${CONNECTION_PAGE_SIZE}, includeArchived: true) {
    nodes { id }
    ${PAGE_INFO_FIELDS}
  }
  parent { id }
  assignee { id }
  labelIds
  labels(first: ${CONNECTION_PAGE_SIZE}, includeArchived: true) {
    nodes { id }
    ${PAGE_INFO_FIELDS}
  }
  relations(first: ${CONNECTION_PAGE_SIZE}, includeArchived: true) {
    nodes { id }
    ${PAGE_INFO_FIELDS}
  }
  inverseRelations(first: ${CONNECTION_PAGE_SIZE}, includeArchived: true) {
    nodes { id }
    ${PAGE_INFO_FIELDS}
  }
`;

type IssueConnectionField = "labels" | "releases" | "relations" | "inverseRelations";

interface ConnectionPage {
  ids: string[];
  hasNextPage: boolean;
  endCursor: string | null;
}

export class LinearRequirementLabelHttpTransport implements LinearRequirementLabelTransport {
  private readonly credential: string;
  private readonly fetcher: typeof fetch;
  private readonly timeoutMs: number;
  private readonly maxHttpAttempts: number;
  private readonly maxResponseBytes: number;
  private httpAttempts = 0;
  private active = false;

  constructor(options: LinearRequirementLabelHttpTransportOptions) {
    if (typeof options.credential !== "string" || options.credential.length === 0 || options.credential.length > 4_096) {
      fail("credential is invalid");
    }
    this.credential = options.credential;
    this.fetcher = options.fetcher ?? fetch;
    this.timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
    this.maxHttpAttempts = options.maxHttpAttempts ?? DEFAULT_MAX_HTTP_ATTEMPTS;
    this.maxResponseBytes = options.maxResponseBytes ?? DEFAULT_MAX_RESPONSE_BYTES;
    if (!Number.isInteger(this.timeoutMs) || this.timeoutMs < 1 || this.timeoutMs > 120_000) {
      fail("timeout is outside its safe bound");
    }
    if (!Number.isInteger(this.maxHttpAttempts) || this.maxHttpAttempts < 1 || this.maxHttpAttempts > 10_000) {
      fail("HTTP attempt limit is outside its safe bound");
    }
    if (!Number.isInteger(this.maxResponseBytes) || this.maxResponseBytes < 1 || this.maxResponseBytes > 64 * 1024 * 1024) {
      fail("response byte limit is outside its safe bound");
    }
  }

  private label(value: unknown): LinearRequirementLabelState {
    const row = record(value, "label readback");
    if (!exactKeys(row, [
      "id",
      "name",
      "color",
      "description",
      "archivedAt",
      "retiredAt",
      "inheritedFrom",
      "isGroup",
      "parent",
      "team",
    ])) fail("label readback is invalid");
    const parent = row.parent === null ? null : record(row.parent, "label parent readback");
    const team = row.team === null ? null : record(row.team, "label team readback");
    const inheritedFrom = row.inheritedFrom === null ? null : record(row.inheritedFrom, "label inherited source readback");
    if ((parent !== null && !exactKeys(parent, ["id", "name"])) ||
      (team !== null && !exactKeys(team, ["id", "key"])) ||
      (inheritedFrom !== null && !exactKeys(inheritedFrom, ["id"]))) {
      fail("label readback is invalid");
    }
    if (typeof row.isGroup !== "boolean") fail("label group readback is invalid");
    if (row.description !== null && typeof row.description !== "string") fail("label description readback is invalid");
    return {
      id: canonicalUuid(row.id, "label readback UUID"),
      name: stringValue(row.name, "label name readback"),
      color: stringValue(row.color, "label color readback"),
      description: row.description as string | null,
      archivedAt: nullableString(row.archivedAt, "label archived state readback"),
      retiredAt: nullableString(row.retiredAt, "label retired state readback"),
      inheritedFromId: inheritedFrom === null ? null : canonicalUuid(inheritedFrom.id, "label inherited source readback UUID"),
      isGroup: row.isGroup,
      parentId: parent === null ? null : canonicalUuid(parent.id, "label parent readback UUID"),
      parentName: parent === null ? null : stringValue(parent.name, "label parent name readback"),
      teamId: team === null ? null : canonicalUuid(team.id, "label team readback UUID"),
      teamKey: team === null ? null : stringValue(team.key, "label team key readback"),
    };
  }

  private connectionPage(value: unknown, label: string, maxNodes: number): ConnectionPage {
    const connection = record(value, `${label} connection`);
    if (!exactKeys(connection, ["nodes", "pageInfo"]) ||
      !Array.isArray(connection.nodes) || connection.nodes.length > maxNodes) {
      fail(`${label} connection is invalid`);
    }
    const pageInfo = record(connection.pageInfo, `${label} page info`);
    if (!exactKeys(pageInfo, ["hasNextPage", "endCursor"]) || typeof pageInfo.hasNextPage !== "boolean") {
      fail(`${label} connection is invalid`);
    }
    const endCursor = nullableString(pageInfo.endCursor, `${label} end cursor`);
    if (pageInfo.hasNextPage && endCursor === null) fail(`${label} connection is invalid`);
    const ids = connection.nodes.map((value) => {
      const node = record(value, `${label} node`);
      if (!exactKeys(node, ["id"])) fail(`${label} connection is invalid`);
      return canonicalUuid(node.id, `${label} UUID`);
    });
    if (new Set(ids).size !== ids.length) fail(`${label} connection is invalid`);
    return { ids, hasNextPage: pageInfo.hasNextPage, endCursor };
  }

  private exactNestedId(value: unknown, label: string): string | null {
    if (value === null) return null;
    const node = record(value, label);
    if (!exactKeys(node, ["id"])) fail(`${label} is invalid`);
    return canonicalUuid(node.id, `${label} UUID`);
  }

  private async completeIssueConnection(
    issueId: string,
    field: IssueConnectionField,
    initial: ConnectionPage,
  ): Promise<string[]> {
    const ids = new Set(initial.ids);
    const seenCursors = new Set<string>();
    let page = initial;
    let pages = 1;
    const names: Record<IssueConnectionField, string> = {
      labels: "LinearRequirementIssueLabelsPage",
      releases: "LinearRequirementIssueReleasesPage",
      relations: "LinearRequirementIssueRelationsPage",
      inverseRelations: "LinearRequirementIssueInverseRelationsPage",
    };
    while (page.hasNextPage) {
      if (pages >= MAX_CONNECTION_PAGES || page.endCursor === null || seenCursors.has(page.endCursor)) {
        fail(`issue ${field} connection is invalid`);
      }
      const after = page.endCursor;
      seenCursors.add(after);
      const query = `
        query ${names[field]}($id: String!, $after: String!) {
          issue(id: $id) {
            id
            ${field}(first: ${CONNECTION_PAGE_SIZE}, after: $after, includeArchived: true) {
              nodes { id }
              ${PAGE_INFO_FIELDS}
            }
          }
        }
      `;
      const data = await this.request<{ issue: unknown }>(query, { id: issueId, after });
      const dataRow = record(data, `issue ${field} page data`);
      if (!exactKeys(dataRow, ["issue"])) fail(`issue ${field} connection is invalid`);
      const issue = record(dataRow.issue, `issue ${field} page readback`);
      if (!exactKeys(issue, ["id", field]) || canonicalUuid(issue.id, `issue ${field} page UUID`) !== issueId) {
        fail(`issue ${field} connection is invalid`);
      }
      page = this.connectionPage(issue[field], `issue ${field}`, CONNECTION_PAGE_SIZE);
      for (const id of page.ids) {
        if (ids.has(id)) fail(`issue ${field} connection is invalid`);
        ids.add(id);
      }
      pages += 1;
    }
    return [...ids].sort();
  }

  private async issue(value: unknown, expectedId: string): Promise<LinearRequirementIssueState> {
    const row = record(value, "issue readback");
    if (!exactKeys(row, [
      "id",
      "identifier",
      "title",
      "description",
      "archivedAt",
      "trashed",
      "updatedAt",
      "team",
      "state",
      "project",
      "estimate",
      "priority",
      "dueDate",
      "cycle",
      "projectMilestone",
      "releases",
      "parent",
      "assignee",
      "labelIds",
      "labels",
      "relations",
      "inverseRelations",
    ])) fail("issue readback is invalid");
    const id = canonicalUuid(row.id, "issue readback UUID");
    if (id !== expectedId) fail("issue readback ID is invalid");
    const team = record(row.team, "issue team readback");
    const state = record(row.state, "issue state readback");
    if (!exactKeys(team, ["id", "key"]) || !exactKeys(state, ["id"])) fail("issue readback is invalid");
    if (row.trashed !== null && typeof row.trashed !== "boolean") fail("issue trash state readback is invalid");
    if (row.description !== null && typeof row.description !== "string") fail("issue description readback is invalid");
    if (!Array.isArray(row.labelIds) || row.labelIds.length > MAX_LABEL_IDS) fail("issue label readback is invalid");
    const scalarLabelIds = row.labelIds.map((labelId) => canonicalUuid(labelId, "issue label readback UUID"));
    if (new Set(scalarLabelIds).size !== scalarLabelIds.length) fail("issue label readback is invalid");
    const labelIds = await this.completeIssueConnection(
      id,
      "labels",
      this.connectionPage(row.labels, "issue labels", CONNECTION_PAGE_SIZE),
    );
    const releaseIds = await this.completeIssueConnection(
      id,
      "releases",
      this.connectionPage(row.releases, "issue releases", CONNECTION_PAGE_SIZE),
    );
    const relations = await this.completeIssueConnection(
      id,
      "relations",
      this.connectionPage(row.relations, "issue relations", CONNECTION_PAGE_SIZE),
    );
    const inverseRelations = await this.completeIssueConnection(
      id,
      "inverseRelations",
      this.connectionPage(row.inverseRelations, "issue inverseRelations", CONNECTION_PAGE_SIZE),
    );
    if (!sameStrings(labelIds, scalarLabelIds)) fail("issue label readback is invalid");
    return {
      id,
      identifier: stringValue(row.identifier, "issue identifier readback"),
      title: stringValue(row.title, "issue title readback"),
      descriptionSha256: descriptionFingerprint(row.description as string | null),
      archivedAt: nullableString(row.archivedAt, "issue archived state readback"),
      trashed: row.trashed as boolean | null,
      updatedAt: stringValue(row.updatedAt, "issue updated state readback"),
      teamId: canonicalUuid(team.id, "issue team readback UUID"),
      teamKey: stringValue(team.key, "issue team key readback"),
      stateId: canonicalUuid(state.id, "issue state readback UUID"),
      projectId: this.exactNestedId(row.project, "issue project readback"),
      estimate: nullableFiniteNumber(row.estimate, "issue estimate readback"),
      priority: finiteNumber(row.priority, "issue priority readback"),
      dueDate: nullableString(row.dueDate, "issue due date readback"),
      cycleId: this.exactNestedId(row.cycle, "issue cycle readback"),
      milestoneId: this.exactNestedId(row.projectMilestone, "issue milestone readback"),
      releaseIds,
      parentIssueUuid: this.exactNestedId(row.parent, "issue parent readback"),
      assigneeId: this.exactNestedId(row.assignee, "issue assignee readback"),
      labelIds,
      relationIds: [...new Set([...relations, ...inverseRelations])].sort(),
    };
  }

  private async boundedResponseText(response: Response): Promise<string> {
    try {
      const contentLength = response.headers.get("content-length");
      if (contentLength !== null) {
        const bytes = Number(contentLength);
        if (Number.isFinite(bytes) && bytes > this.maxResponseBytes) fail("response exceeds its byte limit");
      }
      if (!response.body) return "";
      const reader = response.body.getReader();
      const chunks: Uint8Array[] = [];
      let bytes = 0;
      try {
        while (true) {
          const chunk = await reader.read();
          if (chunk.done) break;
          bytes += chunk.value.byteLength;
          if (bytes > this.maxResponseBytes) {
            try {
              await reader.cancel();
            } catch {
              // The fixed transport error below is authoritative and redacted.
            }
            fail("response exceeds its byte limit");
          }
          chunks.push(chunk.value);
        }
      } finally {
        reader.releaseLock();
      }
      const merged = new Uint8Array(bytes);
      let offset = 0;
      for (const chunk of chunks) {
        merged.set(chunk, offset);
        offset += chunk.byteLength;
      }
      return new TextDecoder().decode(merged);
    } catch (error) {
      if (error instanceof LinearRequirementLabelHttpTransportError) throw error;
      fail("response read failed");
    }
  }

  private async request<T>(query: string, variables: JsonRecord): Promise<T> {
    if (this.active) fail("concurrent calls are forbidden");
    if (this.httpAttempts >= this.maxHttpAttempts) fail("HTTP attempt limit was reached");
    this.active = true;
    this.httpAttempts += 1;
    const controller = new AbortController();
    let timeout: ReturnType<typeof setTimeout> | undefined;
    const work = async (): Promise<T> => {
      let response: Response;
      try {
        response = await this.fetcher(ENDPOINT, {
          method: "POST",
          headers: { authorization: this.credential, "content-type": "application/json" },
          body: JSON.stringify({ query, variables }),
          signal: controller.signal,
        });
      } catch {
        fail("request failed");
      }
      const raw = await this.boundedResponseText(response);
      let envelope: GraphQlEnvelope<T>;
      try {
        envelope = JSON.parse(raw) as GraphQlEnvelope<T>;
      } catch {
        fail("response is not valid JSON");
      }
      const hasErrors = envelope.errors !== undefined &&
        (!Array.isArray(envelope.errors) || envelope.errors.length > 0);
      if (!response.ok || hasErrors ||
        envelope.data === undefined || envelope.data === null) {
        fail("request was rejected");
      }
      return envelope.data;
    };
    const deadline = new Promise<never>((_resolve, reject) => {
      timeout = setTimeout(() => {
        controller.abort();
        reject(new LinearRequirementLabelHttpTransportError("Linear Requirement label HTTP transport: request timed out"));
      }, this.timeoutMs);
    });
    try {
      return await Promise.race([work(), deadline]);
    } finally {
      if (timeout !== undefined) clearTimeout(timeout);
      this.active = false;
    }
  }

  private exactLabel(value: unknown, expectedId: string): LinearRequirementLabelState {
    const label = this.label(value);
    if (label.id !== expectedId) fail("label readback ID is invalid");
    return label;
  }

  private async exactIssue(value: unknown, expectedId: string): Promise<LinearRequirementIssueState> {
    return this.issue(value, expectedId);
  }

  async readLabel(idValue: string): Promise<LinearRequirementLabelState | null> {
    const id = canonicalUuid(idValue, "label UUID");
    const query = `
      query LinearRequirementLabelRead($id: ID!) {
        issueLabels(first: 2, includeArchived: true, filter: { id: { eq: $id } }) {
          nodes { ${LABEL_FIELDS} }
          ${PAGE_INFO_FIELDS}
        }
      }
    `;
    const data = record(await this.request<unknown>(query, { id }), "label connection data");
    if (!exactKeys(data, ["issueLabels"])) fail("label connection is invalid");
    const connection = record(data.issueLabels, "label connection");
    if (!exactKeys(connection, ["nodes", "pageInfo"]) || !Array.isArray(connection.nodes) || connection.nodes.length > 1) {
      fail("label connection is invalid");
    }
    const pageInfo = record(connection.pageInfo, "label connection page info");
    if (!exactKeys(pageInfo, ["hasNextPage", "endCursor"]) || pageInfo.hasNextPage !== false ||
      (pageInfo.endCursor !== null && typeof pageInfo.endCursor !== "string")) {
      fail("label connection is invalid");
    }
    if (connection.nodes.length === 0) return null;
    return this.exactLabel(connection.nodes[0], id);
  }

  async readIssue(idValue: string): Promise<LinearRequirementIssueState> {
    const id = canonicalUuid(idValue, "issue UUID");
    const query = `
      query LinearRequirementIssueRead($id: String!) {
        issue(id: $id) { ${ISSUE_FIELDS} }
      }
    `;
    const data = record(await this.request<unknown>(query, { id }), "issue data");
    if (!exactKeys(data, ["issue"])) fail("issue readback is invalid");
    return this.exactIssue(data.issue, id);
  }

  async listIssueIdsByLabel(idValue: string): Promise<string[]> {
    const labelId = canonicalUuid(idValue, "label UUID");
    const query = `
      query LinearRequirementIssueIdsByLabel($labelId: ID!, $after: String) {
        issues(
          filter: { labels: { some: { id: { eq: $labelId } } } }
          includeArchived: true
          first: ${LABEL_USE_PAGE_SIZE}
          after: $after
        ) {
          nodes { id }
          ${PAGE_INFO_FIELDS}
        }
      }
    `;
    const ids = new Set<string>();
    const seenCursors = new Set<string>();
    let after: string | null = null;
    for (let pageNumber = 0; pageNumber < MAX_CONNECTION_PAGES; pageNumber += 1) {
      const data = record(await this.request<unknown>(query, { labelId, after }), "issue label use data");
      if (!exactKeys(data, ["issues"])) fail("issue label use connection is invalid");
      const page = this.connectionPage(data.issues, "issue label use", LABEL_USE_PAGE_SIZE);
      for (const issueId of page.ids) {
        if (ids.has(issueId)) fail("issue label use connection is invalid");
        ids.add(issueId);
      }
      if (!page.hasNextPage) return [...ids].sort();
      if (page.endCursor === null || seenCursors.has(page.endCursor)) fail("issue label use connection is invalid");
      after = page.endCursor;
      seenCursors.add(after);
    }
    fail("issue label use connection exceeded its page limit");
  }

  async renameLabel(idValue: string, nameValue: string): Promise<LinearRequirementLabelState> {
    const id = canonicalUuid(idValue, "label UUID");
    if (typeof nameValue !== "string" || nameValue.length === 0 || nameValue.length > 255) fail("label name is invalid");
    const query = `
      mutation LinearRequirementLabelRename($id: String!, $input: IssueLabelUpdateInput!) {
        issueLabelUpdate(id: $id, input: $input) { success issueLabel { ${LABEL_FIELDS} } }
      }
    `;
    const data = await this.request<{ issueLabelUpdate: unknown }>(query, { id, input: { name: nameValue } });
    const payload = record(data.issueLabelUpdate, "label rename payload");
    if (payload.success !== true) fail("label rename failed");
    const label = this.exactLabel(payload.issueLabel, id);
    if (label.name !== nameValue) fail("label rename readback is invalid");
    return label;
  }

  async createLabel(inputValue: LinearRequirementLabelCreateInput): Promise<LinearRequirementLabelState> {
    const input = record(inputValue, "label create input");
    if (!exactKeys(input, ["id", "name", "color", "description", "teamId", "isGroup", "parentId"]) ||
      typeof input.name !== "string" || input.name.length === 0 || input.name.length > 255 ||
      typeof input.color !== "string" || !HEX_COLOR.test(input.color) ||
      (input.description !== null && typeof input.description !== "string") || input.isGroup !== false || input.parentId !== null) {
      fail("label create input is invalid");
    }
    let id: string;
    let teamId: string;
    try {
      id = canonicalUuid(input.id, "label create UUID");
      teamId = canonicalUuid(input.teamId, "label create team UUID");
    } catch {
      fail("label create input is invalid");
    }
    const exactInput: LinearRequirementLabelCreateInput = {
      id,
      name: input.name,
      color: input.color,
      description: input.description as string | null,
      teamId,
      isGroup: false,
      parentId: null,
    };
    const query = `
      mutation LinearRequirementLabelCreate($input: IssueLabelCreateInput!) {
        issueLabelCreate(input: $input) { success issueLabel { ${LABEL_FIELDS} } }
      }
    `;
    const data = await this.request<{ issueLabelCreate: unknown }>(query, { input: exactInput });
    const payload = record(data.issueLabelCreate, "label create payload");
    if (payload.success !== true) fail("label create failed");
    const label = this.exactLabel(payload.issueLabel, id);
    if (label.name !== exactInput.name || label.color.toLowerCase() !== exactInput.color.toLowerCase() ||
      label.description !== exactInput.description || label.teamId !== teamId || label.teamKey === null ||
      label.isGroup !== false || label.parentId !== null || label.inheritedFromId !== null ||
      label.archivedAt !== null || label.retiredAt !== null) {
      fail("label create readback is invalid");
    }
    return label;
  }

  async replaceIssueLabels(idValue: string, labelIdValues: readonly string[]): Promise<LinearRequirementIssueState> {
    const id = canonicalUuid(idValue, "issue UUID");
    if (!Array.isArray(labelIdValues) || labelIdValues.length < 1 || labelIdValues.length > MAX_LABEL_IDS) {
      fail("issue label IDs are invalid");
    }
    let labelIds: string[];
    try {
      labelIds = labelIdValues.map((labelId) => canonicalUuid(labelId, "issue label UUID"));
    } catch {
      fail("issue label IDs are invalid");
    }
    if (new Set(labelIds).size !== labelIds.length) fail("issue label IDs are invalid");
    const query = `
      mutation LinearRequirementIssueLabelReplace($id: String!, $input: IssueUpdateInput!) {
        issueUpdate(id: $id, input: $input) { success issue { ${ISSUE_FIELDS} } }
      }
    `;
    const data = await this.request<{ issueUpdate: unknown }>(query, { id, input: { labelIds } });
    const payload = record(data.issueUpdate, "issue update payload");
    if (payload.success !== true) fail("issue label replacement failed");
    const issue = await this.exactIssue(payload.issue, id);
    if (!sameStrings(issue.labelIds, labelIds)) fail("issue label replacement readback is invalid");
    return issue;
  }

  async retireLabel(idValue: string): Promise<LinearRequirementLabelState> {
    const id = canonicalUuid(idValue, "label UUID");
    const query = `
      mutation LinearRequirementLabelRetire($id: String!) {
        issueLabelRetire(id: $id) { success issueLabel { ${LABEL_FIELDS} } }
      }
    `;
    const data = await this.request<{ issueLabelRetire: unknown }>(query, { id });
    const payload = record(data.issueLabelRetire, "label retire payload");
    if (payload.success !== true) fail("label retire failed");
    const label = this.exactLabel(payload.issueLabel, id);
    if (label.retiredAt === null) fail("label retire readback is invalid");
    return label;
  }

  async restoreLabel(idValue: string): Promise<LinearRequirementLabelState> {
    const id = canonicalUuid(idValue, "label UUID");
    const query = `
      mutation LinearRequirementLabelRestore($id: String!) {
        issueLabelRestore(id: $id) { success issueLabel { ${LABEL_FIELDS} } }
      }
    `;
    const data = await this.request<{ issueLabelRestore: unknown }>(query, { id });
    const payload = record(data.issueLabelRestore, "label restore payload");
    if (payload.success !== true) fail("label restore failed");
    const label = this.exactLabel(payload.issueLabel, id);
    if (label.retiredAt !== null || label.archivedAt !== null) fail("label restore readback is invalid");
    return label;
  }
}
