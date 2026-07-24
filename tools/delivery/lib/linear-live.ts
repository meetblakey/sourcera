import { descriptionFingerprint } from "./fingerprint.js";
import {
  assertLinearProjectScope,
  type LinearProjectScope,
} from "./linear-project-scope.js";
import {
  assertLinearProgramScope,
  linearPlanningSourceFingerprints,
  linearPlanningSectionHeadings,
  type LinearProgramFingerprint,
  type LinearProgramScope,
} from "./linear-program-scope.js";
import { sourceSectionReferences } from "./source-checksums.js";

const ENDPOINT = "https://api.linear.app/graphql";
const ISSUE_PAGE_LIMIT = 10;
const PIPELINE_PAGE_LIMIT = 10;
const PROJECT_PAGE_LIMIT = 10;
const INITIATIVE_PAGE_LIMIT = 10;
const CYCLE_PAGE_LIMIT = 50;
const NESTED_CONNECTION_LIMIT = 100;

const ISSUE_QUERY = `
  query DeliveryIssues($after: String) {
    issues(first: ${ISSUE_PAGE_LIMIT}, after: $after, includeArchived: true) {
      nodes {
        id
        identifier
        title
        description
        updatedAt
        estimate
        priority
        dueDate
        archivedAt
        state { id name type }
        labels(first: ${NESTED_CONNECTION_LIMIT}) {
          nodes { name }
          pageInfo { hasNextPage }
        }
        assignee { id name }
        team { id key }
        cycle { id number name }
        project { id name }
        projectMilestone { id name }
        parent { id identifier }
        releases(first: ${NESTED_CONNECTION_LIMIT}) {
          nodes { id version }
          pageInfo { hasNextPage }
        }
        relations(first: ${NESTED_CONNECTION_LIMIT}) {
          nodes { type issue { identifier } relatedIssue { identifier } }
          pageInfo { hasNextPage }
        }
        inverseRelations(first: ${NESTED_CONNECTION_LIMIT}) {
          nodes { type issue { identifier } relatedIssue { identifier } }
          pageInfo { hasNextPage }
        }
      }
      pageInfo { hasNextPage endCursor }
    }
  }
`;

const PIPELINE_QUERY = `
  query DeliveryPipelines($after: String) {
    releasePipelines(first: ${PIPELINE_PAGE_LIMIT}, after: $after, includeArchived: true) {
      nodes {
        id
        name
        updatedAt
        archivedAt
        type
        isProduction
        teams(first: ${NESTED_CONNECTION_LIMIT}) {
          nodes { id key }
          pageInfo { hasNextPage }
        }
        stages(first: ${NESTED_CONNECTION_LIMIT}) {
          nodes { id name type archivedAt position frozen }
          pageInfo { hasNextPage }
        }
      }
      pageInfo { hasNextPage endCursor }
    }
  }
`;

const RELEASE_QUERY = `
  query DeliveryReleases($after: String) {
    releases(first: 50, after: $after, includeArchived: true) {
      nodes {
        id
        name
        description
        version
        commitSha
        startDate
        targetDate
        updatedAt
        archivedAt
        pipeline { id }
        stage { id type }
      }
      pageInfo { hasNextPage endCursor }
    }
  }
`;

const PROJECT_QUERY = `
  query DeliveryProjects($after: String) {
    projects(first: ${PROJECT_PAGE_LIMIT}, after: $after, includeArchived: true) {
      nodes {
        id
        name
        content
        updatedAt
        archivedAt
        status { id name type }
        priority
        lead { id name }
        startDate
        startDateResolution
        targetDate
        targetDateResolution
        initiatives(first: ${NESTED_CONNECTION_LIMIT}) {
          nodes { id name }
          pageInfo { hasNextPage }
        }
      }
      pageInfo { hasNextPage endCursor }
    }
  }
`;

const INITIATIVE_QUERY = `
  query DeliveryInitiatives($after: String) {
    initiatives(first: ${INITIATIVE_PAGE_LIMIT}, after: $after, includeArchived: true) {
      nodes {
        id
        name
        updatedAt
        archivedAt
        owner { id name }
        status
        priority
        health
        healthUpdatedAt
        targetDate
        targetDateResolution
        parentInitiative { id name }
      }
      pageInfo { hasNextPage endCursor }
    }
  }
`;

const DOCUMENT_QUERY = `
  query DeliveryDocuments($after: String) {
    documents(first: 50, after: $after, includeArchived: true) {
      nodes {
        id
        title
        content
        updatedAt
        archivedAt
        initiative { id name }
        project { id name }
        team { id key }
        issue { id identifier }
      }
      pageInfo { hasNextPage endCursor }
    }
  }
`;

const PROJECT_MILESTONE_QUERY = `
  query DeliveryProjectMilestones($after: String) {
    projectMilestones(first: 50, after: $after, includeArchived: true) {
      nodes {
        id
        name
        description
        updatedAt
        archivedAt
        targetDate
        status
        project { id name }
      }
      pageInfo { hasNextPage endCursor }
    }
  }
`;

const CYCLE_QUERY = `
  query DeliveryCycles($after: String) {
    cycles(first: ${CYCLE_PAGE_LIMIT}, after: $after, includeArchived: true) {
      nodes {
        id
        number
        name
        description
        updatedAt
        archivedAt
        startsAt
        endsAt
        completedAt
        team { id key }
        inheritedFrom { id }
      }
      pageInfo { hasNextPage endCursor }
    }
  }
`;

interface PageInfo {
  hasNextPage: boolean;
  endCursor: string | null;
}

interface Connection<T> {
  nodes: T[];
  pageInfo: PageInfo;
}

interface NestedConnection<T> {
  nodes: T[];
  pageInfo: Pick<PageInfo, "hasNextPage">;
}

interface IssueNode {
  id: string;
  identifier: string;
  title: string;
  description: string | null;
  updatedAt: string;
  estimate: number | null;
  priority: number;
  dueDate: string | null;
  archivedAt: string | null;
  state: { id: string; name: string; type: string };
  labels: NestedConnection<{ name: string }>;
  assignee: { id: string; name: string } | null;
  team: { id: string; key: string };
  cycle: { id: string; number: number; name: string | null } | null;
  project: { id: string; name: string } | null;
  projectMilestone: { id: string; name: string } | null;
  parent: { id: string; identifier: string } | null;
  releases: NestedConnection<{ id: string; version: string | null }>;
  relations: NestedConnection<RelationNode>;
  inverseRelations: NestedConnection<RelationNode>;
}

interface RelationNode {
  type: string;
  issue: { identifier: string };
  relatedIssue: { identifier: string };
}

interface PipelineNode {
  id: string;
  name: string;
  updatedAt: string;
  archivedAt: string | null;
  type: string;
  isProduction: boolean;
  teams: NestedConnection<{ id: string; key: string }>;
  stages: NestedConnection<{
    id: string;
    name: string;
    type: string;
    archivedAt: string | null;
    position: number;
    frozen: boolean;
  }>;
}

interface ReleaseNode {
  id: string;
  name: string;
  description: string | null;
  version: string | null;
  commitSha: string | null;
  startDate: string | null;
  targetDate: string | null;
  updatedAt: string;
  archivedAt: string | null;
  pipeline: { id: string };
  stage: { id: string; type: string };
}

interface ProjectNode {
  id: string;
  name: string;
  content: string | null;
  updatedAt: string;
  archivedAt: string | null;
  status: { id: string; name: string; type: string };
  priority: number;
  lead: { id: string; name: string } | null;
  startDate: string | null;
  startDateResolution: string | null;
  targetDate: string | null;
  targetDateResolution: string | null;
  initiatives?: NestedConnection<{ id: string; name: string }>;
}

interface InitiativeNode {
  id: string;
  name: string;
  updatedAt: string;
  archivedAt: string | null;
  owner: { id: string; name: string } | null;
  status: string;
  priority: number;
  health: string | null;
  healthUpdatedAt: string | null;
  targetDate: string | null;
  targetDateResolution: string | null;
  parentInitiative: { id: string; name: string } | null;
}

interface DocumentNode {
  id: string;
  title: string;
  content?: string | null;
  updatedAt: string;
  archivedAt: string | null;
  initiative: { id: string; name: string } | null;
  project: { id: string; name: string } | null;
  team: { id: string; key: string } | null;
  issue: { id: string; identifier: string } | null;
}

interface ProjectMilestoneNode {
  id: string;
  name: string;
  description: string | null;
  updatedAt: string;
  archivedAt: string | null;
  targetDate: string | null;
  status: string;
  project: { id: string; name: string };
}

interface CycleNode {
  id: string;
  number: number;
  name: string | null;
  description: string | null;
  updatedAt: string;
  archivedAt: string | null;
  startsAt: string;
  endsAt: string;
  completedAt: string | null;
  team: { id: string; key: string };
  inheritedFrom: { id: string } | null;
}

export interface LinearFingerprint {
  issues: Array<{
    linearId: string | null;
    identifier: string;
    title: string;
    descriptionFingerprint: string;
    sourceProvenance?: {
      sourceId: string | null;
      sourceDocument: string | null;
      sourceDocuments: string[];
      section: string | null;
      sectionBundleCount: number | null;
      sourceBinding: string | null;
      sourceChecksum: string | null;
    };
    updatedAt: string;
    estimate: number | null;
    priority: number;
    dueDate: string | null;
    archivedAt: string | null;
    stateId: string;
    state: string;
    stateType: string;
    labels: string[];
    assignee: string | null;
    assigneeId: string | null;
    team: string;
    teamId: string;
    cycleId: string | null;
    cycleNumber: number | null;
    cycle: string | null;
    projectId: string | null;
    project: string | null;
    milestoneId: string | null;
    milestone: string | null;
    parentLinearId: string | null;
    parent: string | null;
    releases: string[];
    relations: string[];
  }>;
  releasePipelines: Array<{
    id: string;
    name: string;
    updatedAt: string;
    archivedAt: string | null;
    type: string;
    isProduction: boolean;
    teams: Array<{ id: string; key: string }>;
    stages: Array<{
      id: string;
      name: string;
      type: string;
      archivedAt: string | null;
      position: number;
      frozen: boolean;
    }>;
  }>;
  releases: Array<{
    id: string;
    name: string;
    descriptionFingerprint: string;
    version: string | null;
    commitSha: string | null;
    startDate: string | null;
    targetDate: string | null;
    updatedAt: string;
    archivedAt: string | null;
    pipeline: string;
    stage: string;
    stageType: string;
  }>;
  projects: Array<{
    id: string;
    name: string;
    descriptionFingerprint: string;
    updatedAt: string;
    archivedAt: string | null;
    statusId: string;
    status: string;
    statusType: string;
    priority: number;
    lead: string | null;
    leadId: string | null;
    startDate: string | null;
    startDateResolution: string | null;
    targetDate: string | null;
    targetDateResolution: string | null;
  }>;
  projectMilestones: Array<{
    id: string;
    name: string;
    descriptionFingerprint: string;
    projectId: string;
    project: string;
    updatedAt: string;
    archivedAt: string | null;
    targetDate: string | null;
    status: string;
  }>;
  cycles: Array<{
    id: string;
    number: number;
    name: string | null;
    descriptionFingerprint: string;
    updatedAt: string;
    archivedAt: string | null;
    startsAt: string;
    endsAt: string;
    completedAt: string | null;
    team: string;
    teamId: string;
    inheritedFromId: string | null;
  }>;
  program?: LinearProgramFingerprint;
}

export type LinearFingerprintScope = LinearProjectScope;

const SHA256 = /^[a-f0-9]{64}$/;

export function assertLinearPlanningDescriptionFingerprints(
  fingerprint: LinearFingerprint,
): void {
  for (const project of fingerprint.projects) {
    if (!SHA256.test(project.descriptionFingerprint ?? "")) {
      throw new Error(
        `Linear project ${project.id} description fingerprint is invalid`,
      );
    }
  }
  for (const milestone of fingerprint.projectMilestones) {
    if (!SHA256.test(milestone.descriptionFingerprint ?? "")) {
      throw new Error(
        `Linear project milestone ${milestone.id} description fingerprint is invalid`,
      );
    }
  }
  for (const release of fingerprint.releases) {
    if (!SHA256.test(release.descriptionFingerprint ?? "")) {
      throw new Error(
        `Linear release ${release.id} description fingerprint is invalid`,
      );
    }
  }
  for (const cycle of fingerprint.cycles) {
    if (!SHA256.test(cycle.descriptionFingerprint ?? "")) {
      throw new Error(
        `Linear cycle ${cycle.id} description fingerprint is invalid`,
      );
    }
  }
}

export function assertLinearPlanningContractFingerprints(
  scope: LinearProgramScope,
  fingerprint: LinearFingerprint,
): void {
  if (!fingerprint.program) {
    throw new Error("Linear fingerprint lacks canonical program topology");
  }
  assertLinearProgramScope(scope, fingerprint.program);
  assertLinearPlanningDescriptionFingerprints(fingerprint);

  const expectedProjects = new Map(
    scope.projectDescriptionFingerprints.map((project) => [
      project.projectId,
      project.descriptionFingerprint,
    ]),
  );
  if (
    fingerprint.projects.length !== expectedProjects.size ||
    fingerprint.projects.some(
      (project) =>
        expectedProjects.get(project.id) !== project.descriptionFingerprint,
    )
  ) {
    throw new Error(
      "Linear project descriptions differ from the approved fingerprints",
    );
  }

  const expectedMilestones = new Map(
    scope.projectDescriptionFingerprints.flatMap((project) =>
      project.milestones.map((milestone) => [
        milestone.milestoneId,
        {
          projectId: project.projectId,
          descriptionFingerprint: milestone.descriptionFingerprint,
        },
      ] as const)
    ),
  );
  if (
    fingerprint.projectMilestones.length !== expectedMilestones.size ||
    fingerprint.projectMilestones.some((milestone) => {
      const expected = expectedMilestones.get(milestone.id);
      return !expected ||
        expected.projectId !== milestone.projectId ||
        expected.descriptionFingerprint !== milestone.descriptionFingerprint;
    })
  ) {
    throw new Error(
      "Linear project milestone descriptions differ from the approved fingerprints",
    );
  }
}

export function linearSourceProvenance(
  description: string | null,
): NonNullable<LinearFingerprint["issues"][number]["sourceProvenance"]> {
  const section = /(?:^|\n)## Source provenance\s*\n([\s\S]*?)(?=\n## |$)/i.exec(
    description ?? "",
  )?.[1] ?? "";
  const singularDocumentLine = section.match(
    /(?:^|\n)[-*]?\s*(?:canonical\s+)?source document\s*:\s*([^\n]+)/i,
  )?.[1] ?? section.match(
    /(?:^|\n)[-*]?\s*canonical authority\s*:\s*([^\n]+)/i,
  )?.[1] ?? null;
  const pluralDocumentLine = section.match(
    /(?:^|\n)[-*]?\s*(?:canonical\s+)?source documents\s*:\s*([^\n]+)/i,
  )?.[1] ?? null;
  const documentsFrom = (value: string | null): string[] =>
    value
      ? [...value.matchAll(/`([^`\n]+\.(?:md|json|csv|jsonl))`/gi)]
          .map((match) => match[1])
      : [];
  const singularDocuments = documentsFrom(singularDocumentLine);
  const pluralDocuments = documentsFrom(pluralDocumentLine);
  const sourceDocument = singularDocuments.length === 1
    ? singularDocuments[0]
    : null;
  const sourceDocuments = pluralDocuments.length
    ? pluralDocuments
    : singularDocuments;
  const sourceId = section.match(
    /(?:canonical (?:requirement|source)|source id)\s*:\s*`?((?:F-(?:AE-|BC-)?\d+(?:\.[A-Z])?)|(?:RG:[a-z0-9_]+))`?/i,
  )?.[1] ?? null;
  const sectionBundleCount = Number(
    section.match(
      /source section bundle\s*:\s*(\d+)\s+registered slices?/i,
    )?.[1] ?? "",
  ) || null;
  const sourceSectionLine = section.match(
    /(?:^|\n)[-*]?\s*(?:canonical\s+)?source section\s*:\s*([^\n]+)/i,
  )?.[1]?.trim() ?? null;
  const sourceSections = sectionBundleCount === null
    ? sourceSectionReferences(sourceSectionLine ?? section)
    : [];
  const sourceSection = sourceSections.length
    ? sourceSections.join(", ")
    : sourceSectionLine
    ? /^`([^`\n]+)`\.?$/.exec(sourceSectionLine)?.[1] ?? sourceSectionLine
    : null;
  const sourceBinding = section.match(
    /canonical source binding\s*:\s*(?:sha256:)?([a-f0-9]{64})/i,
  )?.[1]?.toLowerCase() ?? null;
  const sourceChecksum = section.match(
    /(?:canonical\s+)?source checksum\s*:\s*(?:`?sha256:)?([a-f0-9]{64})/i,
  )?.[1]?.toLowerCase() ?? null;
  return {
    sourceId,
    sourceDocument,
    sourceDocuments,
    section: sourceSection,
    sectionBundleCount,
    sourceBinding,
    sourceChecksum,
  };
}

function scopedProjectInventory(
  projects: ProjectNode[],
  milestones: ProjectMilestoneNode[],
  scope?: LinearFingerprintScope,
): { projects: ProjectNode[]; milestones: ProjectMilestoneNode[] } {
  if (!scope) return { projects, milestones };
  const trackedIds = new Set(assertLinearProjectScope(scope, scope.projects));
  for (const projectId of [...trackedIds].sort()) {
    const count = projects.filter((project) => project.id === projectId).length;
    if (count === 0) {
      throw new Error(`Tracked Linear project ${projectId} is missing`);
    }
    if (count > 1) {
      throw new Error(`Tracked Linear project ${projectId} is duplicated`);
    }
  }
  const scopedProjects = projects.filter((project) => trackedIds.has(project.id));
  assertLinearProjectScope(scope, scopedProjects);
  const projectNameById = new Map(
    scopedProjects.map((project) => [project.id, project.name]),
  );
  const scopedMilestones = milestones.filter((milestone) =>
    trackedIds.has(milestone.project.id)
  );
  if (
    new Set(scopedMilestones.map((milestone) => milestone.id)).size !==
      scopedMilestones.length ||
    new Set(
        scopedMilestones.map((milestone) =>
          `${milestone.project.id}:${milestone.name}`
        ),
      ).size !== scopedMilestones.length ||
    scopedMilestones.some(
      (milestone) =>
        projectNameById.get(milestone.project.id) !== milestone.project.name,
    )
  ) {
    throw new Error("Tracked Linear project milestone inventory is inconsistent or duplicated");
  }
  return { projects: scopedProjects, milestones: scopedMilestones };
}

async function request<T>(
  fetcher: typeof fetch,
  token: string,
  query: string,
  after: string | null,
): Promise<T> {
  const response = await fetcher(ENDPOINT, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: token,
    },
    body: JSON.stringify({ query, variables: { after } }),
  });
  const payload = (await response.json()) as {
    data?: T;
    errors?: Array<{ message: string }>;
  };
  if (!response.ok) {
    const details = payload.errors?.map((error) => error.message).join("; ");
    throw new Error(
      `Linear HTTP ${response.status}${details ? `: ${details}` : ""}`,
    );
  }
  if (payload.errors?.length) {
    throw new Error(
      `Linear GraphQL: ${payload.errors.map((error) => error.message).join("; ")}`,
    );
  }
  if (!payload.data) throw new Error("Linear GraphQL returned no data");
  return payload.data;
}

async function paginate<T>(
  fetcher: typeof fetch,
  token: string,
  query: string,
  key: string,
): Promise<T[]> {
  const rows: T[] = [];
  let after: string | null = null;
  do {
    let data: Record<string, Connection<T>>;
    try {
      data = await request<Record<string, Connection<T>>>(
        fetcher,
        token,
        query,
        after,
      );
    } catch (error) {
      throw new Error(
        `Linear ${key} page failed: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
    const connection: Connection<T> | undefined = data[key];
    if (!connection) throw new Error(`Linear response missing ${key}`);
    rows.push(...connection.nodes);
    after = connection.pageInfo.hasNextPage
      ? connection.pageInfo.endCursor
      : null;
    if (connection.pageInfo.hasNextPage && !after) {
      throw new Error(`Linear ${key} pagination cursor missing`);
    }
  } while (after);
  return rows;
}

export function canonicalLinearRelationKey(
  type: string,
  left: string,
  right: string,
): string {
  if (!left.trim() || !right.trim()) {
    throw new Error("Linear relation endpoints are required");
  }
  if (type === "blocks") return `blocks:${left}:${right}`;
  if (type === "blockedBy") return `blocks:${right}:${left}`;
  if (type === "related" || type === "relatedTo") {
    const [first, second] = [left, right].sort();
    return `related:${first}:${second}`;
  }
  if (type === "similar") {
    const [first, second] = [left, right].sort();
    return `similar:${first}:${second}`;
  }
  if (type === "duplicate" || type === "duplicateOf") {
    return `duplicate:${left}:${right}`;
  }
  throw new Error(`Unsupported Linear relation type ${type}`);
}

function relationKey(relation: RelationNode): string {
  return canonicalLinearRelationKey(
    relation.type,
    relation.issue.identifier,
    relation.relatedIssue.identifier,
  );
}

function assertIssueConnectionsComplete(issue: IssueNode): void {
  for (const field of [
    "labels",
    "releases",
    "relations",
    "inverseRelations",
  ] as const) {
    if (issue[field].pageInfo?.hasNextPage !== false) {
      throw new Error(
        `Linear issue ${issue.identifier} ${field} connection is truncated`,
      );
    }
  }
}

function canonicalRelationsByIssue(
  issues: IssueNode[],
): Map<string, Set<string>> {
  const relationsByIssue = new Map(
    issues.map((issue) => [issue.identifier, new Set<string>()]),
  );
  for (const issue of issues) {
    for (const relation of [
      ...issue.relations.nodes,
      ...issue.inverseRelations.nodes,
    ]) {
      const key = relationKey(relation);
      for (const endpoint of [
        relation.issue.identifier,
        relation.relatedIssue.identifier,
      ]) {
        const endpointRelations = relationsByIssue.get(endpoint);
        if (!endpointRelations) {
          throw new Error(
            `Linear relation endpoint ${endpoint} was not captured`,
          );
        }
        endpointRelations.add(key);
      }
    }
  }
  return relationsByIssue;
}

function assertPipelineConnectionsComplete(pipeline: PipelineNode): void {
  for (const field of ["teams", "stages"] as const) {
    const pageInfo = pipeline[field].pageInfo;
    if (!pageInfo) {
      throw new Error(
        `Linear release pipeline ${pipeline.id} ${field} connection is missing pageInfo`,
      );
    }
    if (pageInfo.hasNextPage) {
      throw new Error(
        `Linear release pipeline ${pipeline.id} ${field} connection is truncated`,
      );
    }
  }
}

export interface LinearCapture {
  fingerprint: LinearFingerprint;
  issueDescriptions: Array<{
    id: string;
    title: string;
    description: string | null;
    updatedAt: string;
    labels: string[];
  }>;
}

export async function fetchLinearCapture(
  fetcher: typeof fetch,
  token: string,
  scope?: LinearFingerprintScope,
  programScope?: LinearProgramScope,
): Promise<LinearCapture> {
  if (!token) throw new Error("LINEAR_API_KEY is required");
  const [
    issueNodes,
    pipelineNodes,
    releaseNodes,
    projectNodes,
    projectMilestoneNodes,
    cycleNodes,
    initiativeNodes,
    documentNodes,
  ] = await Promise.all([
    paginate<IssueNode>(fetcher, token, ISSUE_QUERY, "issues"),
    paginate<PipelineNode>(
      fetcher,
      token,
      PIPELINE_QUERY,
      "releasePipelines",
    ),
    paginate<ReleaseNode>(fetcher, token, RELEASE_QUERY, "releases"),
    paginate<ProjectNode>(fetcher, token, PROJECT_QUERY, "projects"),
    paginate<ProjectMilestoneNode>(
      fetcher,
      token,
      PROJECT_MILESTONE_QUERY,
      "projectMilestones",
    ),
    paginate<CycleNode>(fetcher, token, CYCLE_QUERY, "cycles"),
    programScope
      ? paginate<InitiativeNode>(fetcher, token, INITIATIVE_QUERY, "initiatives")
      : Promise.resolve([]),
    programScope
      ? paginate<DocumentNode>(fetcher, token, DOCUMENT_QUERY, "documents")
      : Promise.resolve([]),
  ]);
  for (const issue of issueNodes) assertIssueConnectionsComplete(issue);
  const relationsByIssue = canonicalRelationsByIssue(issueNodes);
  for (const pipeline of pipelineNodes) {
    assertPipelineConnectionsComplete(pipeline);
  }
  for (const project of projectNodes) {
    if (project.initiatives?.pageInfo?.hasNextPage) {
      throw new Error(`Linear project ${project.id} initiatives connection is truncated`);
    }
  }
  const scopedInventory = scopedProjectInventory(
    projectNodes,
    projectMilestoneNodes,
    scope,
  );
  const program = programScope
    ? {
        initiatives: initiativeNodes
          .filter((initiative) =>
            [
              programScope.parentInitiative.id,
              ...programScope.outcomeInitiatives.map((row) => row.id),
            ].includes(initiative.id),
          )
          .map((initiative) => ({
            id: initiative.id,
            name: initiative.name,
            updatedAt: initiative.updatedAt,
            archivedAt: initiative.archivedAt,
            owner: initiative.owner?.name ?? null,
            ownerId: initiative.owner?.id ?? null,
            status: initiative.status,
            priority: initiative.priority,
            health: initiative.health,
            healthUpdatedAt: initiative.healthUpdatedAt,
            targetDate: initiative.targetDate,
            targetDateResolution: initiative.targetDateResolution,
            parentInitiativeId: initiative.parentInitiative?.id ?? null,
            parentInitiative: initiative.parentInitiative?.name ?? null,
          }))
          .sort((left, right) => left.id.localeCompare(right.id)),
        documents: documentNodes
          .filter((document) => document.id === programScope.planningDocument.id)
          .map((document) => ({
            id: document.id,
            title: document.title,
            updatedAt: document.updatedAt,
            archivedAt: document.archivedAt,
            initiativeId: document.initiative?.id ?? null,
            projectId: document.project?.id ?? null,
            teamId: document.team?.id ?? null,
            issueId: document.issue?.id ?? null,
            contentFingerprint: descriptionFingerprint(document.content),
            sectionHeadings: linearPlanningSectionHeadings(document.content),
            sourceFingerprints: linearPlanningSourceFingerprints(
              document.content,
            ),
          })),
        projectInitiatives: scopedInventory.projects
          .map((project) => ({
            projectId: project.id,
            initiativeIds: (project.initiatives?.nodes ?? [])
              .map((initiative) => initiative.id)
              .sort(),
          }))
          .sort((left, right) => left.projectId.localeCompare(right.projectId)),
      }
    : undefined;
  if (programScope && program) assertLinearProgramScope(programScope, program);
  const fingerprint: LinearFingerprint = {
    issues: issueNodes
      .map((issue) => ({
        linearId: issue.id,
        identifier: issue.identifier,
        title: issue.title,
        descriptionFingerprint: descriptionFingerprint(issue.description),
        sourceProvenance: linearSourceProvenance(issue.description),
        updatedAt: issue.updatedAt,
        estimate: issue.estimate,
        priority: issue.priority,
        dueDate: issue.dueDate,
        archivedAt: issue.archivedAt,
        stateId: issue.state.id,
        state: issue.state.name,
        stateType: issue.state.type,
        labels: issue.labels.nodes.map((label) => label.name).sort(),
        assignee: issue.assignee?.name ?? null,
        assigneeId: issue.assignee?.id ?? null,
        team: issue.team.key,
        teamId: issue.team.id,
        cycleId: issue.cycle?.id ?? null,
        cycleNumber: issue.cycle?.number ?? null,
        cycle: issue.cycle?.name ?? null,
        projectId: issue.project?.id ?? null,
        project: issue.project?.name ?? null,
        milestoneId: issue.projectMilestone?.id ?? null,
        milestone: issue.projectMilestone?.name ?? null,
        parentLinearId: issue.parent?.id ?? null,
        parent: issue.parent?.identifier ?? null,
        releases: issue.releases.nodes
          .map((release) => release.version ?? release.id)
          .sort(),
        relations: [...(relationsByIssue.get(issue.identifier) ?? [])].sort(),
      }))
      .sort((left, right) => left.identifier.localeCompare(right.identifier)),
    releasePipelines: pipelineNodes
      .map((pipeline) => ({
        id: pipeline.id,
        name: pipeline.name,
        updatedAt: pipeline.updatedAt,
        archivedAt: pipeline.archivedAt,
        type: pipeline.type,
        isProduction: pipeline.isProduction,
        teams: pipeline.teams.nodes
          .map((team) => ({ id: team.id, key: team.key }))
          .sort((left, right) => left.id.localeCompare(right.id)),
        stages: pipeline.stages.nodes
          .map((stage) => ({ ...stage }))
          .sort((left, right) => left.id.localeCompare(right.id)),
      }))
      .sort((left, right) => left.id.localeCompare(right.id)),
    releases: releaseNodes
      .map((release) => ({
        id: release.id,
        name: release.name,
        descriptionFingerprint: descriptionFingerprint(release.description),
        version: release.version,
        commitSha: release.commitSha,
        startDate: release.startDate,
        targetDate: release.targetDate,
        updatedAt: release.updatedAt,
        archivedAt: release.archivedAt,
        pipeline: release.pipeline.id,
        stage: release.stage.id,
        stageType: release.stage.type,
      }))
      .sort((left, right) => left.id.localeCompare(right.id)),
    projects: scopedInventory.projects
      .map((project) => ({
        id: project.id,
        name: project.name,
        descriptionFingerprint: descriptionFingerprint(project.content),
        updatedAt: project.updatedAt,
        archivedAt: project.archivedAt,
        statusId: project.status.id,
        status: project.status.name,
        statusType: project.status.type,
        priority: project.priority,
        lead: project.lead?.name ?? null,
        leadId: project.lead?.id ?? null,
        startDate: project.startDate,
        startDateResolution: project.startDateResolution,
        targetDate: project.targetDate,
        targetDateResolution: project.targetDateResolution,
      }))
      .sort((left, right) => left.id.localeCompare(right.id)),
    projectMilestones: scopedInventory.milestones
      .map((milestone) => ({
        id: milestone.id,
        name: milestone.name,
        descriptionFingerprint: descriptionFingerprint(milestone.description),
        projectId: milestone.project.id,
        project: milestone.project.name,
        updatedAt: milestone.updatedAt,
        archivedAt: milestone.archivedAt,
        targetDate: milestone.targetDate,
        status: milestone.status,
      }))
      .sort((left, right) => left.id.localeCompare(right.id)),
    cycles: cycleNodes
      .map((cycle) => ({
        id: cycle.id,
        number: cycle.number,
        name: cycle.name,
        descriptionFingerprint: descriptionFingerprint(cycle.description),
        updatedAt: cycle.updatedAt,
        archivedAt: cycle.archivedAt,
        startsAt: cycle.startsAt,
        endsAt: cycle.endsAt,
        completedAt: cycle.completedAt,
        team: cycle.team.key,
        teamId: cycle.team.id,
        inheritedFromId: cycle.inheritedFrom?.id ?? null,
      }))
      .sort((left, right) => left.id.localeCompare(right.id)),
    ...(program ? { program } : {}),
  };
  return {
    fingerprint,
    issueDescriptions: issueNodes
      .map((issue) => ({
        id: issue.identifier,
        title: issue.title,
        description: issue.description,
        updatedAt: issue.updatedAt,
        labels: issue.labels.nodes.map((label) => label.name).sort(),
      }))
      .sort((left, right) => left.id.localeCompare(right.id)),
  };
}

export async function confirmLinearCaptureConsistency(
  capture: () => Promise<LinearCapture>,
): Promise<LinearCapture> {
  let first: LinearCapture;
  try {
    first = await capture();
  } catch (error) {
    throw new Error(
      `Linear bounded consistency capture first read failed: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
  let second: LinearCapture;
  try {
    second = await capture();
  } catch (error) {
    throw new Error(
      `Linear bounded consistency capture second read failed: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
  const differences = fingerprintDiff(first.fingerprint, second.fingerprint)
    .map((difference) =>
      difference.replace(
        "differ from the committed Linear snapshot",
        "changed between bounded consistency reads",
      )
    );
  if (differences.length) {
    throw new Error(
      `Linear changed during bounded two-pass capture; no capture was accepted:\n${differences.join("\n")}`,
    );
  }
  return second;
}

export async function fetchConsistentLinearCapture(
  fetcher: typeof fetch,
  token: string,
  scope?: LinearFingerprintScope,
  programScope?: LinearProgramScope,
): Promise<LinearCapture> {
  return confirmLinearCaptureConsistency(() =>
    fetchLinearCapture(fetcher, token, scope, programScope)
  );
}

export async function fetchLinearFingerprint(
  fetcher: typeof fetch,
  token: string,
  scope?: LinearFingerprintScope,
  programScope?: LinearProgramScope,
): Promise<LinearFingerprint> {
  return (await fetchLinearCapture(fetcher, token, scope, programScope)).fingerprint;
}

export function canonicalLinearFingerprint(
  fingerprint: LinearFingerprint,
): LinearFingerprint {
  return {
    ...fingerprint,
    projectMilestones: fingerprint.projectMilestones.map(
      ({
        id,
        name,
        descriptionFingerprint,
        projectId,
        project,
        updatedAt,
        archivedAt,
        targetDate,
        status,
      }) => ({
        id,
        name,
        descriptionFingerprint,
        projectId,
        project,
        updatedAt,
        archivedAt,
        targetDate,
        status,
      }),
    ).sort((left, right) => left.id.localeCompare(right.id)),
    cycles: [...fingerprint.cycles].sort((left, right) =>
      left.id.localeCompare(right.id)
    ),
    ...(fingerprint.program
      ? {
          program: {
            initiatives: [...fingerprint.program.initiatives].sort((left, right) =>
              left.id.localeCompare(right.id)
            ),
            documents: [...fingerprint.program.documents].sort((left, right) =>
              left.id.localeCompare(right.id)
            ),
            projectInitiatives: [...fingerprint.program.projectInitiatives]
              .map((project) => ({
                ...project,
                initiativeIds: [...project.initiativeIds].sort(),
              }))
              .sort((left, right) => left.projectId.localeCompare(right.projectId)),
          },
        }
      : {}),
  };
}

export function fingerprintDiff(
  expected: LinearFingerprint,
  actual: LinearFingerprint,
): string[] {
  const findings: string[] = [];
  const canonicalExpected = canonicalLinearFingerprint(expected);
  const canonicalActual = canonicalLinearFingerprint(actual);
  for (const key of [
    "issues",
    "releasePipelines",
    "releases",
    "projects",
    "projectMilestones",
    "cycles",
    "program",
  ] as const) {
    if (
      JSON.stringify(canonicalExpected[key]) !==
        JSON.stringify(canonicalActual[key])
    ) {
      findings.push(`${key} differ from the committed Linear snapshot`);
    }
  }
  return findings;
}
