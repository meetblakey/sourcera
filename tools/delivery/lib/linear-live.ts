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
import {
  linearProjectDocumentDecisionFindings,
  linearProjectDocumentCaptureSelection,
  linearProjectDocumentFingerprint,
} from "./linear-project-documents.js";
import { sourceSectionReferences } from "./source-checksums.js";

const ENDPOINT = "https://api.linear.app/graphql";
const ISSUE_PAGE_LIMIT = 10;
const PIPELINE_PAGE_LIMIT = 10;
const PROJECT_PAGE_LIMIT = 5;
const PROJECT_ASSIGNMENT_PAGE_LIMIT = 10;
const PROJECT_CATALOG_PAGE_LIMIT = 5;
const INITIATIVE_PAGE_LIMIT = 10;
const CYCLE_PAGE_LIMIT = 50;
const CATALOG_PAGE_LIMIT = 50;
const NESTED_CONNECTION_LIMIT = 100;
const NESTED_RELATION_PAGE_LIMIT = 20;
const NESTED_RELATION_TOTAL_REQUEST_LIMIT = 1_000;
const NESTED_LABEL_PAGE_LIMIT = 20;
const NESTED_LABEL_TOTAL_REQUEST_LIMIT = 1_000;
const NESTED_PROJECT_TEAM_PAGE_LIMIT = 20;
const NESTED_PROJECT_TEAM_TOTAL_REQUEST_LIMIT = 1_000;
const NESTED_PROJECT_INITIATIVE_PAGE_LIMIT = 20;
const NESTED_PROJECT_INITIATIVE_TOTAL_REQUEST_LIMIT = 1_000;
const LINEAR_REQUEST_TIMEOUT_MS = 30_000;
const LINEAR_RESPONSE_BYTE_LIMIT = 32 * 1024 * 1024;

const ISSUE_QUERY = `
  query DeliveryIssues($after: String) {
    issues(first: ${ISSUE_PAGE_LIMIT}, after: $after, includeArchived: true) {
      nodes {
        id
        identifier
        title
        url
        description
        updatedAt
        estimate
        priority
        dueDate
        archivedAt
        state { id name type }
        labels(first: ${NESTED_CONNECTION_LIMIT}, includeArchived: true) {
          nodes { id name parent { id name } }
          pageInfo { hasNextPage endCursor }
        }
        assignee { id name }
        team { id key }
        cycle { id number name }
        project { id name }
        projectMilestone { id name }
        parent { id identifier }
        releases(first: ${NESTED_CONNECTION_LIMIT}, includeArchived: true) {
          nodes { id version }
          pageInfo { hasNextPage endCursor }
        }
        relations(first: ${NESTED_CONNECTION_LIMIT}, includeArchived: true) {
          nodes { id type archivedAt issue { id identifier } relatedIssue { id identifier } }
          pageInfo { hasNextPage endCursor }
        }
        inverseRelations(first: ${NESTED_CONNECTION_LIMIT}, includeArchived: true) {
          nodes { id type archivedAt issue { id identifier } relatedIssue { id identifier } }
          pageInfo { hasNextPage endCursor }
        }
      }
      pageInfo { hasNextPage endCursor }
    }
  }
`;

const ISSUE_RELATIONS_QUERY = `
  query DeliveryIssueRelations($id: String!, $after: String!) {
    issue(id: $id) {
      relations(first: ${NESTED_CONNECTION_LIMIT}, after: $after, includeArchived: true) {
        nodes { id type archivedAt issue { id identifier } relatedIssue { id identifier } }
        pageInfo { hasNextPage endCursor }
      }
    }
  }
`;

const ISSUE_LABEL_ASSIGNMENTS_QUERY = `
  query DeliveryIssueLabelAssignments($id: String!, $after: String!) {
    issue(id: $id) {
      labels(first: ${NESTED_CONNECTION_LIMIT}, after: $after, includeArchived: true) {
        nodes { id name parent { id name } }
        pageInfo { hasNextPage endCursor }
      }
    }
  }
`;

const ISSUE_INVERSE_RELATIONS_QUERY = `
  query DeliveryIssueInverseRelations($id: String!, $after: String!) {
    issue(id: $id) {
      inverseRelations(first: ${NESTED_CONNECTION_LIMIT}, after: $after, includeArchived: true) {
        nodes { id type archivedAt issue { id identifier } relatedIssue { id identifier } }
        pageInfo { hasNextPage endCursor }
      }
    }
  }
`;

const ISSUE_LABEL_CATALOG_QUERY = `
  query DeliveryIssueLabels($after: String) {
    issueLabels(
      first: ${CATALOG_PAGE_LIMIT}
      after: $after
      includeArchived: true
    ) {
      nodes {
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
      }
      pageInfo { hasNextPage endCursor }
    }
  }
`;

const TEAM_CATALOG_QUERY = `
  query DeliveryTeams($after: String) {
    teams(
      first: ${CATALOG_PAGE_LIMIT}
      after: $after
      includeArchived: true
    ) {
      nodes { id key name archivedAt }
      pageInfo { hasNextPage endCursor }
    }
  }
`;

const WORKFLOW_STATE_CATALOG_QUERY = `
  query DeliveryWorkflowStates($after: String) {
    workflowStates(
      first: ${CATALOG_PAGE_LIMIT}
      after: $after
      includeArchived: true
    ) {
      nodes {
        id
        name
        type
        color
        position
        archivedAt
        team { id key }
      }
      pageInfo { hasNextPage endCursor }
    }
  }
`;

const USER_CATALOG_QUERY = `
  query DeliveryUsers($after: String) {
    users(
      first: ${CATALOG_PAGE_LIMIT}
      after: $after
      includeArchived: true
      includeDisabled: true
    ) {
      nodes {
        id
        name
        displayName
        active
        app
        guest
        archivedAt
      }
      pageInfo { hasNextPage endCursor }
    }
  }
`;

const ORGANIZATION_QUERY = `
  query DeliveryOrganization {
    organization {
      id
      name
      urlKey
      archivedAt
    }
  }
`;

const PROJECT_CATALOG_QUERY = `
  query DeliveryProjectCatalog($after: String) {
    projects(
      first: ${PROJECT_CATALOG_PAGE_LIMIT}
      after: $after
      includeArchived: true
    ) {
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
        teams(first: ${PROJECT_ASSIGNMENT_PAGE_LIMIT}, includeArchived: true) {
          nodes { id key }
          pageInfo { hasNextPage endCursor }
        }
        initiatives(first: ${PROJECT_ASSIGNMENT_PAGE_LIMIT}, includeArchived: true) {
          nodes { id name }
          pageInfo { hasNextPage endCursor }
        }
      }
      pageInfo { hasNextPage endCursor }
    }
  }
`;

const PROJECT_INITIATIVE_ASSIGNMENTS_QUERY = `
  query DeliveryProjectInitiativeAssignments($id: String!, $after: String!) {
    project(id: $id) {
      initiatives(first: ${PROJECT_ASSIGNMENT_PAGE_LIMIT}, after: $after, includeArchived: true) {
        nodes { id name }
        pageInfo { hasNextPage endCursor }
      }
    }
  }
`;

const PROJECT_TEAM_ASSIGNMENTS_QUERY = `
  query DeliveryProjectTeamAssignments($id: String!, $after: String!) {
    project(id: $id) {
      teams(first: ${PROJECT_ASSIGNMENT_PAGE_LIMIT}, after: $after, includeArchived: true) {
        nodes { id key }
        pageInfo { hasNextPage endCursor }
      }
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
        teams(first: ${NESTED_CONNECTION_LIMIT}, includeArchived: true) {
          nodes { id key }
          pageInfo { hasNextPage }
        }
        stages(first: ${NESTED_CONNECTION_LIMIT}, includeArchived: true) {
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
        startedAt
        targetDate
        completedAt
        updatedAt
        archivedAt
        pipeline { id }
        stage { id name type }
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
        initiatives(first: ${PROJECT_ASSIGNMENT_PAGE_LIMIT}, includeArchived: true) {
          nodes { id name }
          pageInfo { hasNextPage endCursor }
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
        content
        description
        updatedAt
        archivedAt
        owner { id name }
        status
        priority
        health
        healthUpdatedAt
        startedAt
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
        release { id name version }
        cycle { id number name }
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
  pageInfo: PageInfo;
}

interface MutableConnectionCoverage {
  terminal: boolean;
  pages: number;
  rows: number;
  finalCursor: string | null;
  attempts: number;
}

interface MutableNestedConnectionCoverage {
  pages: number;
  attempts: number;
}

interface IssueNode {
  id: string;
  identifier: string;
  title: string;
  url: string;
  description: string | null;
  updatedAt: string;
  estimate: number | null;
  priority: number;
  dueDate: string | null;
  archivedAt: string | null;
  state: { id: string; name: string; type: string };
  labels: NestedConnection<{
    id: string;
    name: string;
    parent: { id: string; name: string } | null;
  }>;
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
  id: string;
  type: string;
  archivedAt?: string | null;
  issue: { id?: string; identifier: string };
  relatedIssue: { id?: string; identifier: string };
}

interface IssueLabelCatalogNode {
  id: string;
  name: string;
  color: string;
  description: string | null;
  archivedAt: string | null;
  retiredAt: string | null;
  inheritedFrom: { id: string } | null;
  isGroup: boolean;
  parent: { id: string; name: string } | null;
  team: { id: string; key: string } | null;
}

interface TeamCatalogNode {
  id: string;
  key: string;
  name: string;
  archivedAt: string | null;
}

interface WorkflowStateCatalogNode {
  id: string;
  name: string;
  type: string;
  color: string;
  position: number;
  archivedAt: string | null;
  team: { id: string; key: string };
}

interface UserCatalogNode {
  id: string;
  name: string;
  displayName: string;
  active: boolean;
  app: boolean;
  guest: boolean;
  archivedAt: string | null;
}

interface OrganizationNode {
  id: string;
  name: string;
  urlKey: string;
  archivedAt: string | null;
}

interface ProjectCatalogNode {
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
  teams: NestedConnection<{ id: string; key: string }>;
  initiatives: NestedConnection<{ id: string; name: string }>;
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
  startedAt: string | null;
  targetDate: string | null;
  completedAt: string | null;
  updatedAt: string;
  archivedAt: string | null;
  pipeline: { id: string };
  stage: { id: string; name: string; type: string };
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
  initiatives: NestedConnection<{ id: string; name: string }>;
}

interface InitiativeNode {
  id: string;
  name: string;
  content: string | null;
  description: string | null;
  updatedAt: string;
  archivedAt: string | null;
  owner: { id: string; name: string } | null;
  status: string;
  priority: number;
  health: string | null;
  healthUpdatedAt: string | null;
  startedAt: string | null;
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
  release: { id: string; name: string; version: string | null } | null;
  cycle: { id: string; number: number; name: string | null } | null;
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

export interface LinearNativeIdentityCapture {
  schemaVersion: 1;
  workspace: {
    id: string;
    name: string;
    urlKey: string;
    archivedAt: string | null;
  };
  issues: Array<{
    issueUuid: string;
    identifier: string;
    title: string;
    archivedAt: string | null;
    descriptionSha256: string;
    teamId: string;
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
  }>;
  labels: Array<{
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
  }>;
  relations: Array<{
    relationId: string;
    canonicalKey: string;
    type: string;
    archivedAt: string | null;
    issueId: string;
    issueIdentifier: string;
    relatedIssueId: string;
    relatedIssueIdentifier: string;
  }>;
  teams: Array<{
    id: string;
    key: string;
    name: string;
    archivedAt: string | null;
  }>;
  workflowStates: Array<{
    id: string;
    name: string;
    type: string;
    color: string;
    position: number;
    archivedAt: string | null;
    teamId: string;
    teamKey: string;
  }>;
  users: Array<{
    id: string;
    name: string;
    displayName: string;
    active: boolean;
    app: boolean;
    guest: boolean;
    archivedAt: string | null;
  }>;
  initiatives: Array<{
    id: string;
    name: string;
    contentSha256: string;
    descriptionSha256: string;
    updatedAt: string;
    archivedAt: string | null;
    ownerId: string | null;
    status: string;
    priority: number;
    health: string | null;
    healthUpdatedAt: string | null;
    startedAt: string | null;
    targetDate: string | null;
    targetDateResolution: string | null;
    parentInitiativeId: string | null;
  }>;
  projects: Array<{
    id: string;
    name: string;
    contentSha256: string;
    updatedAt: string;
    archivedAt: string | null;
    statusId: string;
    status: string;
    statusType: string;
    priority: number;
    leadId: string | null;
    startDate: string | null;
    startDateResolution: string | null;
    targetDate: string | null;
    targetDateResolution: string | null;
    teamIds: string[];
    initiativeIds: string[];
  }>;
  releasePipelines: Array<{
    id: string;
    name: string;
    updatedAt: string;
    archivedAt: string | null;
    type: string;
    isProduction: boolean;
    teamIds: string[];
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
    descriptionSha256: string;
    version: string | null;
    commitSha: string | null;
    startDate: string | null;
    startedAt: string | null;
    targetDate: string | null;
    completedAt: string | null;
    updatedAt: string;
    archivedAt: string | null;
    pipelineId: string;
    stageId: string;
    stageName: string;
    stageType: string;
  }>;
  projectMilestones: Array<{
    id: string;
    name: string;
    descriptionSha256: string;
    projectId: string;
    updatedAt: string;
    archivedAt: string | null;
    targetDate: string | null;
    status: string;
  }>;
  cycles: Array<{
    id: string;
    number: number;
    name: string | null;
    descriptionSha256: string;
    updatedAt: string;
    archivedAt: string | null;
    startsAt: string;
    endsAt: string;
    completedAt: string | null;
    teamId: string;
    teamKey: string;
    inheritedFromId: string | null;
  }>;
  documents: Array<{
    id: string;
    title: string;
    contentSha256: string;
    updatedAt: string;
    archivedAt: string | null;
    initiativeId: string | null;
    projectId: string | null;
    teamId: string | null;
    issueId: string | null;
    releaseId: string | null;
    cycleId: string | null;
  }>;
  rawDocumentIds: string[];
  coverage: {
    complete: true;
    totals: {
      issues: number;
      labels: number;
      labelAssignments: number;
      relations: number;
      teams: number;
      workflowStates: number;
      users: number;
      initiatives: number;
      projects: number;
      releasePipelines: number;
      releases: number;
      projectMilestones: number;
      cycles: number;
      documents: number;
    };
    topLevel: {
      issues: LinearConnectionCoverage;
      labels: LinearConnectionCoverage;
      teams: LinearConnectionCoverage;
      workflowStates: LinearConnectionCoverage;
      users: LinearConnectionCoverage;
      initiatives: LinearConnectionCoverage;
      projects: LinearConnectionCoverage;
      releasePipelines: LinearConnectionCoverage;
      releases: LinearConnectionCoverage;
      projectMilestones: LinearConnectionCoverage;
      cycles: LinearConnectionCoverage;
      documents: LinearConnectionCoverage;
    };
    perIssue: Array<{
      issueUuid: string;
      identifier: string;
      labels: LinearNestedConnectionCoverage;
      relations: LinearNestedConnectionCoverage;
      inverseRelations: LinearNestedConnectionCoverage;
    }>;
    perProject: Array<{
      projectId: string;
      teams: LinearNestedConnectionCoverage;
      initiatives: LinearNestedConnectionCoverage;
    }>;
  };
}

export interface LinearRawDocumentCapture {
  schemaVersion: 1;
  documents: Array<
    LinearNativeIdentityCapture["documents"][number] & {
      content: string | null;
    }
  >;
}

export interface LinearCaptureOptions {
  nativeIdentity?: boolean;
}

export interface LinearConnectionCoverage {
  terminal: true;
  pages: number;
  rows: number;
  finalCursor: string | null;
  attempts: number;
}

export interface LinearNestedConnectionCoverage {
  terminal: true;
  pages: number;
  rows: number;
  finalCursor: string | null;
  attempts: number;
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
const ISO_UTC = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

function isCanonicalUtcTimestamp(value: unknown): value is string {
  return typeof value === "string" &&
    ISO_UTC.test(value) &&
    !Number.isNaN(Date.parse(value)) &&
    new Date(value).toISOString() === value;
}

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
  if (scope.schemaVersion === 3) {
    const decisionFindings = linearProjectDocumentDecisionFindings(
      fingerprint.program.projectDocuments ?? [],
      fingerprint.program.decisionIssues ?? [],
      fingerprint.issues,
      scope.projectDocumentDecisionContract,
      [
        ...scope.canonicalProjectDocuments,
        ...scope.supplementaryDocuments,
      ].map((document) => document.id),
    );
    if (decisionFindings.length) {
      throw new Error(decisionFindings[0].message);
    }
  }
}

export function linearSourceProvenance(
  description: string | null,
): NonNullable<LinearFingerprint["issues"][number]["sourceProvenance"]> {
  const maximumSectionLength = 32 * 1024;
  const body = description ?? "";
  const heading = /(?:^|\n)## Source provenance[^\S\r\n]*(?:\r?\n|$)/i.exec(body);
  const sectionStart = heading ? (heading.index ?? 0) + heading[0].length : -1;
  const nextHeading = sectionStart >= 0 ? body.indexOf("\n## ", sectionStart) : -1;
  const sectionEnd = nextHeading >= 0 ? nextHeading : body.length;
  const section = sectionStart >= 0 && sectionEnd - sectionStart <= maximumSectionLength
    ? body.slice(sectionStart, sectionEnd)
    : "";
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
  beforeAttempt?: () => void,
): Promise<T> {
  return requestWithVariables<T>(
    fetcher,
    token,
    query,
    { after },
    beforeAttempt,
  );
}

async function requestWithVariables<T>(
  fetcher: typeof fetch,
  token: string,
  query: string,
  variables: Record<string, unknown>,
  beforeAttempt?: () => void,
): Promise<T> {
  const maximumAttempts = 3;
  for (let attempt = 1; attempt <= maximumAttempts; attempt += 1) {
    beforeAttempt?.();
    let response: Response;
    const controller = new AbortController();
    const timeout = setTimeout(
      () => controller.abort(),
      LINEAR_REQUEST_TIMEOUT_MS,
    );
    try {
      response = await fetcher(ENDPOINT, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: token,
        },
        body: JSON.stringify({ query, variables }),
        signal: controller.signal,
      });
    } catch (error) {
      clearTimeout(timeout);
      if (attempt === maximumAttempts) throw error;
      await new Promise((resolveDelay) => setTimeout(resolveDelay, attempt * 250));
      continue;
    }
    let payload: {
      data?: T;
      errors?: Array<{ message: string }>;
    };
    try {
      const declaredLength = response.headers.get("content-length");
      if (
        declaredLength !== null &&
        Number.isFinite(Number(declaredLength)) &&
        Number(declaredLength) > LINEAR_RESPONSE_BYTE_LIMIT
      ) {
        throw new Error("Linear response exceeds the bounded byte limit");
      }
      if (!response.body) {
        throw new Error("Linear returned an empty response body");
      }
      const reader = response.body.getReader();
      const chunks: Uint8Array[] = [];
      let byteLength = 0;
      while (true) {
        const chunk = await reader.read();
        if (chunk.done) break;
        byteLength += chunk.value.byteLength;
        if (byteLength > LINEAR_RESPONSE_BYTE_LIMIT) {
          await reader.cancel();
          throw new Error("Linear response exceeds the bounded byte limit");
        }
        chunks.push(chunk.value);
      }
      const bytes = new Uint8Array(byteLength);
      let offset = 0;
      for (const chunk of chunks) {
        bytes.set(chunk, offset);
        offset += chunk.byteLength;
      }
      payload = JSON.parse(new TextDecoder().decode(bytes)) as typeof payload;
      clearTimeout(timeout);
    } catch (error) {
      clearTimeout(timeout);
      if (
        error instanceof Error &&
        error.message === "Linear response exceeds the bounded byte limit"
      ) {
        throw error;
      }
      if (attempt === maximumAttempts) {
        throw new Error("Linear returned invalid JSON after bounded retries");
      }
      await new Promise((resolveDelay) => setTimeout(resolveDelay, attempt * 250));
      continue;
    }
    if (!response.ok) {
      const details = payload.errors?.map((error) => error.message).join("; ");
      if (
        attempt < maximumAttempts &&
        (response.status === 429 || response.status >= 500)
      ) {
        await new Promise((resolveDelay) => setTimeout(resolveDelay, attempt * 250));
        continue;
      }
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
  throw new Error("Linear request exhausted bounded retries");
}

async function paginate<T>(
  fetcher: typeof fetch,
  token: string,
  query: string,
  key: string,
  coverage?: MutableConnectionCoverage,
): Promise<T[]> {
  const maximumPages = 1_000;
  const rows: T[] = [];
  const seenCursors = new Set<string>();
  let pageCount = 0;
  let after: string | null = null;
  do {
    pageCount += 1;
    if (pageCount > maximumPages) {
      throw new Error(`Linear ${key} pagination exceeded ${maximumPages} pages`);
    }
    if (after !== null) {
      if (seenCursors.has(after)) {
        throw new Error(`Linear ${key} pagination cursor repeated`);
      }
      seenCursors.add(after);
    }
    let data: Record<string, Connection<T>>;
    try {
      data = await request<Record<string, Connection<T>>>(
        fetcher,
        token,
        query,
        after,
        () => {
          if (coverage) coverage.attempts += 1;
        },
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
    if (coverage) {
      coverage.pages += 1;
      coverage.rows += connection.nodes.length;
      coverage.finalCursor = connection.pageInfo.endCursor;
      coverage.terminal = !connection.pageInfo.hasNextPage;
    }
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

async function completeIssueLabelConnections(
  fetcher: typeof fetch,
  token: string,
  issues: IssueNode[],
  coverage?: Map<string, MutableNestedConnectionCoverage>,
): Promise<void> {
  let totalRequests = 0;
  for (const issue of issues) {
    const seenCursors = new Set<string>();
    while (issue.labels.pageInfo.hasNextPage) {
      const cursor = issue.labels.pageInfo.endCursor;
      if (!cursor || seenCursors.has(cursor)) {
        throw new Error(
          `Linear issue ${issue.identifier} labels connection is truncated because pagination did not advance`,
        );
      }
      if (seenCursors.size >= NESTED_LABEL_PAGE_LIMIT) {
        throw new Error(
          `Linear issue ${issue.identifier} labels exceeded its nested page limit`,
        );
      }
      seenCursors.add(cursor);
      const issueCoverage = coverage?.get(issue.id);
      const data = await requestWithVariables<{
        issue: Pick<IssueNode, "labels"> | null;
      }>(
        fetcher,
        token,
        ISSUE_LABEL_ASSIGNMENTS_QUERY,
        { id: issue.id, after: cursor },
        () => {
          if (totalRequests >= NESTED_LABEL_TOTAL_REQUEST_LIMIT) {
            throw new Error(
              "Linear nested label pagination exceeded its total request limit",
            );
          }
          totalRequests += 1;
          if (issueCoverage) issueCoverage.attempts += 1;
        },
      );
      const page = data.issue?.labels;
      if (!page) {
        throw new Error(
          `Linear issue ${issue.identifier} labels pagination response is missing`,
        );
      }
      issue.labels.nodes.push(...page.nodes);
      issue.labels.pageInfo = page.pageInfo;
      if (issueCoverage) issueCoverage.pages += 1;
    }
  }
}

async function completeProjectTeamConnections(
  fetcher: typeof fetch,
  token: string,
  projects: ProjectCatalogNode[],
  coverage?: Map<string, MutableNestedConnectionCoverage>,
): Promise<void> {
  let totalRequests = 0;
  for (const project of projects) {
    const seenCursors = new Set<string>();
    while (project.teams.pageInfo.hasNextPage) {
      const cursor = project.teams.pageInfo.endCursor;
      if (!cursor || seenCursors.has(cursor)) {
        throw new Error(
          `Linear project ${project.id} teams connection is truncated because pagination did not advance`,
        );
      }
      if (seenCursors.size >= NESTED_PROJECT_TEAM_PAGE_LIMIT) {
        throw new Error(
          `Linear project ${project.id} teams exceeded its nested page limit`,
        );
      }
      seenCursors.add(cursor);
      const projectCoverage = coverage?.get(project.id);
      const data = await requestWithVariables<{
        project: Pick<ProjectCatalogNode, "teams"> | null;
      }>(
        fetcher,
        token,
        PROJECT_TEAM_ASSIGNMENTS_QUERY,
        { id: project.id, after: cursor },
        () => {
          if (totalRequests >= NESTED_PROJECT_TEAM_TOTAL_REQUEST_LIMIT) {
            throw new Error(
              "Linear nested project team pagination exceeded its total request limit",
            );
          }
          totalRequests += 1;
          if (projectCoverage) projectCoverage.attempts += 1;
        },
      );
      const page = data.project?.teams;
      if (!page) {
        throw new Error(
          `Linear project ${project.id} teams pagination response is missing`,
        );
      }
      project.teams.nodes.push(...page.nodes);
      project.teams.pageInfo = page.pageInfo;
      if (projectCoverage) projectCoverage.pages += 1;
    }
  }
}

async function completeProjectInitiativeConnections(
  fetcher: typeof fetch,
  token: string,
  projects: Array<{
    id: string;
    initiatives: NestedConnection<{ id: string; name: string }>;
  }>,
  coverage?: Map<string, MutableNestedConnectionCoverage>,
): Promise<void> {
  let totalRequests = 0;
  for (const project of projects) {
    const seenCursors = new Set<string>();
    while (project.initiatives.pageInfo.hasNextPage) {
      const cursor = project.initiatives.pageInfo.endCursor;
      if (!cursor || seenCursors.has(cursor)) {
        throw new Error(
          `Linear project ${project.id} initiatives connection is truncated because pagination did not advance`,
        );
      }
      if (seenCursors.size >= NESTED_PROJECT_INITIATIVE_PAGE_LIMIT) {
        throw new Error(
          `Linear project ${project.id} initiatives exceeded its nested page limit`,
        );
      }
      seenCursors.add(cursor);
      const projectCoverage = coverage?.get(project.id);
      const data = await requestWithVariables<{
        project: Pick<ProjectCatalogNode, "initiatives"> | null;
      }>(
        fetcher,
        token,
        PROJECT_INITIATIVE_ASSIGNMENTS_QUERY,
        { id: project.id, after: cursor },
        () => {
          if (totalRequests >= NESTED_PROJECT_INITIATIVE_TOTAL_REQUEST_LIMIT) {
            throw new Error(
              "Linear nested project initiative pagination exceeded its total request limit",
            );
          }
          totalRequests += 1;
          if (projectCoverage) projectCoverage.attempts += 1;
        },
      );
      const page = data.project?.initiatives;
      if (!page) {
        throw new Error(
          `Linear project ${project.id} initiatives pagination response is missing`,
        );
      }
      project.initiatives.nodes.push(...page.nodes);
      project.initiatives.pageInfo = page.pageInfo;
      if (projectCoverage) projectCoverage.pages += 1;
    }
  }
}

async function completeIssueRelationConnections(
  fetcher: typeof fetch,
  token: string,
  issues: IssueNode[],
  coverage?: Map<
    string,
    {
      relations: MutableNestedConnectionCoverage;
      inverseRelations: MutableNestedConnectionCoverage;
    }
  >,
): Promise<void> {
  let totalRequests = 0;
  for (const issue of issues) {
    for (const field of ["relations", "inverseRelations"] as const) {
      const query = field === "relations" ? ISSUE_RELATIONS_QUERY : ISSUE_INVERSE_RELATIONS_QUERY;
      const seenCursors = new Set<string>();
      while (issue[field].pageInfo.hasNextPage) {
        const cursor = issue[field].pageInfo.endCursor;
        if (!cursor || seenCursors.has(cursor)) throw new Error(`Linear issue ${issue.identifier} ${field} connection is truncated because pagination did not advance`);
        if (seenCursors.size >= NESTED_RELATION_PAGE_LIMIT) throw new Error(`Linear issue ${issue.identifier} ${field} exceeded its nested relation page limit`);
        seenCursors.add(cursor);
        const issueCoverage = coverage?.get(issue.id)?.[field];
        const data = await requestWithVariables<{ issue: Pick<IssueNode, typeof field> | null }>(fetcher, token, query, { id: issue.id, after: cursor }, () => {
          if (totalRequests >= NESTED_RELATION_TOTAL_REQUEST_LIMIT) throw new Error("Linear nested relation pagination exceeded its total request limit");
          totalRequests += 1;
          if (issueCoverage) issueCoverage.attempts += 1;
        });
        const page = data.issue?.[field];
        if (!page) throw new Error(`Linear issue ${issue.identifier} ${field} pagination response is missing`);
        issue[field].nodes.push(...page.nodes);
        issue[field].pageInfo = page.pageInfo;
        if (issueCoverage) issueCoverage.pages += 1;
      }
    }
  }
}

function canonicalRelationsByIssue(
  issues: IssueNode[],
): Map<string, Set<string>> {
  const relationsByIssue = new Map(
    issues.map((issue) => [issue.identifier, new Set<string>()]),
  );
  const keyByRelationId = new Map<string, string>();
  const relationIdByKey = new Map<string, string>();
  for (const issue of issues) {
    for (const relation of [
      ...issue.relations.nodes,
      ...issue.inverseRelations.nodes,
    ]) {
      if (!relation.id) throw new Error("Linear relation UUID is missing");
      const key = relationKey(relation);
      const priorKey = keyByRelationId.get(relation.id);
      if (priorKey && priorKey !== key) throw new Error(`Linear relation UUID ${relation.id} maps to multiple canonical keys`);
      const priorId = relationIdByKey.get(key);
      if (priorId && priorId !== relation.id) throw new Error(`Linear distinct relation UUIDs map to canonical key ${key}`);
      keyByRelationId.set(relation.id, key);
      relationIdByKey.set(key, relation.id);
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

function finalConnectionCoverage(
  coverage: MutableConnectionCoverage,
  label: string,
): LinearConnectionCoverage {
  if (!coverage.terminal || coverage.pages < 1 || coverage.attempts < coverage.pages) {
    throw new Error(`Linear ${label} catalog coverage is incomplete`);
  }
  return {
    terminal: true,
    pages: coverage.pages,
    rows: coverage.rows,
    finalCursor: coverage.finalCursor,
    attempts: coverage.attempts,
  };
}

function finalNestedConnectionCoverage<T>(
  connection: NestedConnection<T>,
  coverage: MutableNestedConnectionCoverage,
  label: string,
): LinearNestedConnectionCoverage {
  if (
    connection.pageInfo.hasNextPage ||
    coverage.pages < 1 ||
    coverage.attempts < coverage.pages
  ) {
    throw new Error(`Linear ${label} coverage is incomplete`);
  }
  return {
    terminal: true,
    pages: coverage.pages,
    rows: connection.nodes.length,
    finalCursor: connection.pageInfo.endCursor,
    attempts: coverage.attempts,
  };
}

function assertUniqueCatalog<T>(
  rows: T[],
  idOf: (row: T) => string,
  identityOf: (row: T) => string,
  label: string,
): void {
  const identityById = new Map<string, string>();
  const idByIdentity = new Map<string, string>();
  for (const row of rows) {
    const id = idOf(row);
    const identity = identityOf(row);
    if (!id || !identity) {
      throw new Error(`Linear ${label} catalog contains an empty identity`);
    }
    const priorIdentity = identityById.get(id);
    if (priorIdentity !== undefined && priorIdentity !== identity) {
      throw new Error(`Linear ${label} UUID ${id} maps to multiple identities`);
    }
    const priorId = idByIdentity.get(identity);
    if (priorId !== undefined && priorId !== id) {
      throw new Error(
        `Linear ${label} identity ${identity} maps to multiple UUIDs`,
      );
    }
    if (priorIdentity !== undefined || priorId !== undefined) {
      throw new Error(`Linear ${label} catalog contains a duplicate row`);
    }
    identityById.set(id, identity);
    idByIdentity.set(identity, id);
  }
}

function nativeRelationCatalog(
  issues: IssueNode[],
): LinearNativeIdentityCapture["relations"] {
  const issueIdByIdentifier = new Map(
    issues.map((issue) => [issue.identifier, issue.id]),
  );
  const relationById = new Map<
    string,
    LinearNativeIdentityCapture["relations"][number]
  >();
  const relationIdByKey = new Map<string, string>();
  const rawEndpointsById = new Map<
    string,
    { issueId: string; relatedIssueId: string }
  >();
  const occurrencesById = new Map<
    string,
    Array<{ holderId: string; field: "relations" | "inverseRelations" }>
  >();
  for (const holder of issues) {
    for (const field of ["relations", "inverseRelations"] as const) {
      for (const relation of holder[field].nodes) {
        const key = relationKey(relation);
        if (!relation.id) throw new Error("Linear relation UUID is missing");
        const occurrences = occurrencesById.get(relation.id) ?? [];
        occurrences.push({ holderId: holder.id, field });
        occurrencesById.set(relation.id, occurrences);
        const priorId = relationIdByKey.get(key);
        if (priorId !== undefined && priorId !== relation.id) {
          throw new Error(
            `Linear distinct relation UUIDs map to canonical key ${key}`,
          );
        }
        const expectedIssueId = issueIdByIdentifier.get(
          relation.issue.identifier,
        );
        const expectedRelatedIssueId = issueIdByIdentifier.get(
          relation.relatedIssue.identifier,
        );
        if (
          !expectedIssueId ||
          !expectedRelatedIssueId ||
          relation.issue.id !== expectedIssueId ||
          relation.relatedIssue.id !== expectedRelatedIssueId
        ) {
          throw new Error(
            `Linear relation ${relation.id} endpoint UUIDs do not match captured issue identities`,
          );
        }
        const rawEndpoints = {
          issueId: expectedIssueId,
          relatedIssueId: expectedRelatedIssueId,
        };
        const priorRawEndpoints = rawEndpointsById.get(relation.id);
        if (
          priorRawEndpoints &&
          JSON.stringify(priorRawEndpoints) !== JSON.stringify(rawEndpoints)
        ) {
          throw new Error(
            `Linear relation UUID ${relation.id} maps to multiple endpoint identities`,
          );
        }
        rawEndpointsById.set(relation.id, rawEndpoints);
        const [type, issueIdentifier, relatedIssueIdentifier, ...extra] =
          key.split(":");
        if (
          extra.length ||
          !type ||
          !issueIdentifier ||
          !relatedIssueIdentifier
        ) {
          throw new Error(
            `Linear relation ${relation.id} canonical key is invalid`,
          );
        }
        const row = {
          relationId: relation.id,
          canonicalKey: key,
          type,
          archivedAt: relation.archivedAt ?? null,
          issueId: issueIdByIdentifier.get(issueIdentifier)!,
          issueIdentifier,
          relatedIssueId: issueIdByIdentifier.get(relatedIssueIdentifier)!,
          relatedIssueIdentifier,
        };
        if (!row.issueId || !row.relatedIssueId) {
          throw new Error(
            `Linear relation ${relation.id} canonical endpoints are missing`,
          );
        }
        const prior = relationById.get(relation.id);
        if (prior && JSON.stringify(prior) !== JSON.stringify(row)) {
          throw new Error(
            `Linear relation UUID ${relation.id} maps to multiple canonical identities`,
          );
        }
        relationById.set(relation.id, row);
        relationIdByKey.set(key, relation.id);
      }
    }
  }
  for (const [relationId, endpoints] of rawEndpointsById) {
    const occurrences = occurrencesById.get(relationId) ?? [];
    const forward = occurrences.filter(
      (occurrence) =>
        occurrence.field === "relations" &&
        occurrence.holderId === endpoints.issueId,
    );
    const inverse = occurrences.filter(
      (occurrence) =>
        occurrence.field === "inverseRelations" &&
        occurrence.holderId === endpoints.relatedIssueId,
    );
    if (
      occurrences.length !== 2 ||
      forward.length !== 1 ||
      inverse.length !== 1
    ) {
      throw new Error(
        `Linear relation ${relationId} does not have exactly one forward/inverse mirror pair`,
      );
    }
  }
  return [...relationById.values()].sort((left, right) =>
    left.relationId.localeCompare(right.relationId)
  );
}

function assertNativeCoverageRow(
  value: LinearConnectionCoverage | LinearNestedConnectionCoverage,
  expectedRows: number | null,
  label: string,
  maximumPages = 1_000,
): void {
  if (
    !value ||
    value.terminal !== true ||
    !Number.isInteger(value.pages) ||
    value.pages < 1 ||
    value.pages > maximumPages ||
    !Number.isInteger(value.rows) ||
    value.rows < 0 ||
    (expectedRows !== null && value.rows !== expectedRows) ||
    !Number.isInteger(value.attempts) ||
    value.attempts < value.pages ||
    value.attempts > value.pages * 3 ||
    (value.finalCursor !== null && typeof value.finalCursor !== "string")
  ) {
    throw new Error(`Linear native ${label} coverage is invalid`);
  }
}

function assertExactStringSet(
  actual: string[],
  expected: Iterable<string>,
  label: string,
): void {
  const expectedValues = [...expected].sort();
  if (
    actual.some((value) => typeof value !== "string" || !value.trim()) ||
    new Set(actual).size !== actual.length ||
    JSON.stringify([...actual].sort()) !== JSON.stringify(expectedValues)
  ) {
    throw new Error(`Linear native ${label} assignments are invalid`);
  }
}

function assertAcyclicNativeParents(
  parentById: Map<string, string | null>,
  label: string,
): void {
  for (const start of parentById.keys()) {
    const seen = new Set<string>();
    let current: string | null = start;
    while (current !== null) {
      if (seen.has(current)) {
        throw new Error(`Linear native ${label} parent graph contains a cycle`);
      }
      seen.add(current);
      current = parentById.get(current) ?? null;
    }
  }
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isNullableNonEmptyString(value: unknown): value is string | null {
  return value === null || isNonEmptyString(value);
}

function isLinearPriority(value: unknown): value is number {
  return Number.isInteger(value) && Number(value) >= 0 && Number(value) <= 4;
}

export function assertLinearNativeIdentityCapture(
  identity: LinearNativeIdentityCapture,
): void {
  if (!identity || identity.schemaVersion !== 1) {
    throw new Error("Linear native identity schema version is invalid");
  }
  if (
    !identity.workspace ||
    !identity.workspace.id?.trim() ||
    !identity.workspace.name?.trim() ||
    !identity.workspace.urlKey?.trim() ||
    (identity.workspace.archivedAt !== null &&
      typeof identity.workspace.archivedAt !== "string")
  ) {
    throw new Error("Linear workspace identity is missing or invalid");
  }
  const catalogs = [
    ["issues", identity.issues],
    ["labels", identity.labels],
    ["relations", identity.relations],
    ["teams", identity.teams],
    ["workflowStates", identity.workflowStates],
    ["users", identity.users],
    ["initiatives", identity.initiatives],
    ["projects", identity.projects],
    ["releasePipelines", identity.releasePipelines],
    ["releases", identity.releases],
    ["projectMilestones", identity.projectMilestones],
    ["cycles", identity.cycles],
    ["documents", identity.documents],
  ] as const;
  for (const [name, rows] of catalogs) {
    if (!Array.isArray(rows)) {
      throw new Error(`Linear native ${name} catalog is missing`);
    }
  }
  assertUniqueCatalog(
    identity.issues,
    (issue) => issue.issueUuid,
    (issue) => issue.identifier,
    "native issue",
  );
  assertUniqueCatalog(
    identity.labels,
    (label) => label.id,
    (label) =>
      `${label.teamId ?? "workspace"}:${label.parentId ?? ""}:${label.name}`,
    "native label",
  );
  assertUniqueCatalog(
    identity.relations,
    (relation) => relation.relationId,
    (relation) => relation.canonicalKey,
    "native relation",
  );
  assertUniqueCatalog(
    identity.teams,
    (team) => team.id,
    (team) => team.key,
    "native team",
  );
  assertUniqueCatalog(
    identity.workflowStates,
    (state) => state.id,
    (state) => `${state.teamId}:${state.name}`,
    "native workflow state",
  );
  assertUniqueCatalog(
    identity.users,
    (user) => user.id,
    (user) => user.id,
    "native user",
  );
  assertUniqueCatalog(
    identity.initiatives,
    (initiative) => initiative.id,
    (initiative) => `${initiative.id}:${initiative.name}`,
    "native initiative",
  );
  assertUniqueCatalog(
    identity.projects,
    (project) => project.id,
    (project) => `${project.id}:${project.name}`,
    "native project",
  );
  assertUniqueCatalog(
    identity.releasePipelines,
    (pipeline) => pipeline.id,
    (pipeline) => `${pipeline.id}:${pipeline.name}`,
    "native release pipeline",
  );
  assertUniqueCatalog(
    identity.releases,
    (release) => release.id,
    (release) => `${release.pipelineId}:${release.version ?? release.name}`,
    "native release",
  );
  assertUniqueCatalog(
    identity.projectMilestones,
    (milestone) => milestone.id,
    (milestone) => `${milestone.projectId}:${milestone.name}`,
    "native project milestone",
  );
  assertUniqueCatalog(
    identity.cycles,
    (cycle) => cycle.id,
    (cycle) => `${cycle.teamId}:${cycle.number}`,
    "native cycle",
  );
  assertUniqueCatalog(
    identity.documents,
    (document) => document.id,
    (document) => `${document.id}:${document.title}`,
    "native document",
  );

  const issueById = new Map(
    identity.issues.map((issue) => [issue.issueUuid, issue]),
  );
  const labelById = new Map(identity.labels.map((label) => [label.id, label]));
  const teamById = new Map(identity.teams.map((team) => [team.id, team]));
  const stateById = new Map(
    identity.workflowStates.map((state) => [state.id, state]),
  );
  const userIds = new Set(identity.users.map((user) => user.id));
  const initiativeIds = new Set(
    identity.initiatives.map((initiative) => initiative.id),
  );
  const projectIds = new Set(identity.projects.map((project) => project.id));
  const pipelineById = new Map(
    identity.releasePipelines.map((pipeline) => [pipeline.id, pipeline]),
  );
  const releaseById = new Map(
    identity.releases.map((release) => [release.id, release]),
  );
  const milestoneById = new Map(
    identity.projectMilestones.map((milestone) => [milestone.id, milestone]),
  );
  const cycleById = new Map(
    identity.cycles.map((cycle) => [cycle.id, cycle]),
  );

  for (const label of identity.labels) {
    if (
      !label.name?.trim() ||
      !/^#[0-9a-f]{6}$/i.test(label.color) ||
      (label.description !== null && typeof label.description !== "string") ||
      !Object.prototype.hasOwnProperty.call(label, "retiredAt") ||
      !isNullableNonEmptyString(label.retiredAt) ||
      typeof label.isGroup !== "boolean" ||
      (label.teamId === null) !== (label.teamKey === null) ||
      (label.teamId !== null &&
        teamById.get(label.teamId)?.key !== label.teamKey) ||
      (label.parentId === null) !== (label.parentName === null) ||
      (label.parentId !== null &&
        (labelById.get(label.parentId)?.name !== label.parentName ||
          labelById.get(label.parentId)?.isGroup !== true)) ||
      (label.isGroup && label.parentId !== null) ||
      (label.inheritedFromId !== null &&
        !labelById.has(label.inheritedFromId))
    ) {
      throw new Error(`Linear native label ${label.id} has invalid references`);
    }
  }
  assertAcyclicNativeParents(
    new Map(identity.labels.map((label) => [label.id, label.parentId])),
    "label",
  );
  for (const state of identity.workflowStates) {
    if (
      !state.name?.trim() ||
      !state.type?.trim() ||
      !state.color?.trim() ||
      !Number.isFinite(state.position) ||
      teamById.get(state.teamId)?.key !== state.teamKey
    ) {
      throw new Error(
        `Linear native workflow state ${state.id} has invalid references`,
      );
    }
  }
  for (const initiative of identity.initiatives) {
    if (
      !initiative.name?.trim() ||
      !SHA256.test(initiative.contentSha256 ?? "") ||
      !SHA256.test(initiative.descriptionSha256 ?? "") ||
      !isNonEmptyString(initiative.updatedAt) ||
      !isNullableNonEmptyString(initiative.archivedAt) ||
      !initiative.status?.trim() ||
      !isLinearPriority(initiative.priority) ||
      !isNullableNonEmptyString(initiative.health) ||
      !isNullableNonEmptyString(initiative.healthUpdatedAt) ||
      !isNullableNonEmptyString(initiative.startedAt) ||
      !isNullableNonEmptyString(initiative.targetDate) ||
      !isNullableNonEmptyString(initiative.targetDateResolution) ||
      (initiative.ownerId !== null && !userIds.has(initiative.ownerId)) ||
      (initiative.parentInitiativeId !== null &&
        !initiativeIds.has(initiative.parentInitiativeId))
    ) {
      throw new Error(
        `Linear native initiative ${initiative.id} has invalid references`,
      );
    }
  }
  assertAcyclicNativeParents(
    new Map(
      identity.initiatives.map((initiative) => [
        initiative.id,
        initiative.parentInitiativeId,
      ]),
    ),
    "initiative",
  );
  for (const project of identity.projects) {
    if (
      !project.name?.trim() ||
      !SHA256.test(project.contentSha256 ?? "") ||
      !isNonEmptyString(project.updatedAt) ||
      !isNullableNonEmptyString(project.archivedAt) ||
      !isNonEmptyString(project.statusId) ||
      !isNonEmptyString(project.status) ||
      !isNonEmptyString(project.statusType) ||
      !isLinearPriority(project.priority) ||
      (project.leadId !== null && !userIds.has(project.leadId)) ||
      !isNullableNonEmptyString(project.startDate) ||
      !isNullableNonEmptyString(project.startDateResolution) ||
      !isNullableNonEmptyString(project.targetDate) ||
      !isNullableNonEmptyString(project.targetDateResolution)
    ) {
      throw new Error(`Linear native project ${project.id} has invalid metadata`);
    }
    assertExactStringSet(
      project.teamIds,
      project.teamIds.filter((id) => teamById.has(id)),
      `project ${project.id} team`,
    );
    if (project.teamIds.some((id) => !teamById.has(id))) {
      throw new Error(`Linear native project ${project.id} has invalid teams`);
    }
    assertExactStringSet(
      project.initiativeIds,
      project.initiativeIds.filter((id) => initiativeIds.has(id)),
      `project ${project.id} initiative`,
    );
    if (project.initiativeIds.some((id) => !initiativeIds.has(id))) {
      throw new Error(
        `Linear native project ${project.id} has invalid initiatives`,
      );
    }
  }
  for (const pipeline of identity.releasePipelines) {
    if (
      !isNonEmptyString(pipeline.name) ||
      !isNonEmptyString(pipeline.updatedAt) ||
      !isNullableNonEmptyString(pipeline.archivedAt) ||
      !isNonEmptyString(pipeline.type) ||
      typeof pipeline.isProduction !== "boolean" ||
      !Array.isArray(pipeline.stages)
    ) {
      throw new Error(
        `Linear native release pipeline ${pipeline.id} has invalid metadata`,
      );
    }
    assertExactStringSet(
      pipeline.teamIds,
      pipeline.teamIds.filter((id) => teamById.has(id)),
      `release pipeline ${pipeline.id} team`,
    );
    if (pipeline.teamIds.some((id) => !teamById.has(id))) {
      throw new Error(
        `Linear native release pipeline ${pipeline.id} has invalid teams`,
      );
    }
    assertUniqueCatalog(
      pipeline.stages,
      (stage) => stage.id,
      (stage) => stage.id,
      `native release pipeline ${pipeline.id} stage`,
    );
    for (const stage of pipeline.stages) {
      if (
        !isNonEmptyString(stage.name) ||
        !isNonEmptyString(stage.type) ||
        !isNullableNonEmptyString(stage.archivedAt) ||
        !Number.isFinite(stage.position) ||
        typeof stage.frozen !== "boolean"
      ) {
        throw new Error(
          `Linear native release stage ${stage.id} has invalid metadata`,
        );
      }
    }
  }
  for (const release of identity.releases) {
    const pipeline = pipelineById.get(release.pipelineId);
    const stage = pipeline?.stages.find(
      (candidate) => candidate.id === release.stageId,
    );
    if (
      !isNonEmptyString(release.name) ||
      !SHA256.test(release.descriptionSha256 ?? "") ||
      !isNullableNonEmptyString(release.version) ||
      !isNullableNonEmptyString(release.commitSha) ||
      !isNullableNonEmptyString(release.startDate) ||
      !isNullableNonEmptyString(release.startedAt) ||
      !isNullableNonEmptyString(release.targetDate) ||
      !isNullableNonEmptyString(release.completedAt) ||
      !isNonEmptyString(release.updatedAt) ||
      !isNullableNonEmptyString(release.archivedAt) ||
      !pipeline ||
      !stage ||
      stage.name !== release.stageName ||
      stage.type !== release.stageType
    ) {
      throw new Error(
        `Linear native release ${release.id} has invalid metadata or references`,
      );
    }
  }
  for (const milestone of identity.projectMilestones) {
    if (
      !isNonEmptyString(milestone.name) ||
      !SHA256.test(milestone.descriptionSha256 ?? "") ||
      !projectIds.has(milestone.projectId) ||
      !isNonEmptyString(milestone.updatedAt) ||
      !isNullableNonEmptyString(milestone.archivedAt) ||
      !isNullableNonEmptyString(milestone.targetDate) ||
      !isNonEmptyString(milestone.status)
    ) {
      throw new Error(
        `Linear native project milestone ${milestone.id} has invalid metadata or references`,
      );
    }
  }
  for (const cycle of identity.cycles) {
    if (
      !Number.isInteger(cycle.number) ||
      cycle.number < 0 ||
      !isNullableNonEmptyString(cycle.name) ||
      !SHA256.test(cycle.descriptionSha256 ?? "") ||
      !isNonEmptyString(cycle.updatedAt) ||
      !isNullableNonEmptyString(cycle.archivedAt) ||
      !isNonEmptyString(cycle.startsAt) ||
      !isNonEmptyString(cycle.endsAt) ||
      !isNullableNonEmptyString(cycle.completedAt) ||
      teamById.get(cycle.teamId)?.key !== cycle.teamKey ||
      (cycle.inheritedFromId !== null &&
        !cycleById.has(cycle.inheritedFromId))
    ) {
      throw new Error(
        `Linear native cycle ${cycle.id} has invalid metadata or references`,
      );
    }
  }
  assertAcyclicNativeParents(
    new Map(
      identity.cycles.map((cycle) => [cycle.id, cycle.inheritedFromId]),
    ),
    "cycle inheritance",
  );

  const expectedRelationsByIssue = new Map(
    identity.issues.map((issue) => [issue.issueUuid, new Set<string>()]),
  );
  for (const relation of identity.relations) {
    const issue = issueById.get(relation.issueId);
    const relatedIssue = issueById.get(relation.relatedIssueId);
    if (
      !issue ||
      !relatedIssue ||
      issue.identifier !== relation.issueIdentifier ||
      relatedIssue.identifier !== relation.relatedIssueIdentifier ||
      relation.issueId === relation.relatedIssueId ||
      canonicalLinearRelationKey(
          relation.type,
          relation.issueIdentifier,
          relation.relatedIssueIdentifier,
        ) !== relation.canonicalKey
    ) {
      throw new Error(
        `Linear native relation ${relation.relationId} has invalid endpoints`,
      );
    }
    expectedRelationsByIssue.get(relation.issueId)!.add(relation.relationId);
    expectedRelationsByIssue
      .get(relation.relatedIssueId)!
      .add(relation.relationId);
  }
  for (const issue of identity.issues) {
    const state = stateById.get(issue.stateId);
    if (
      !issue.title?.trim() ||
      !/^[a-f0-9]{64}$/.test(issue.descriptionSha256) ||
      !teamById.has(issue.teamId) ||
      !state ||
      state.teamId !== issue.teamId ||
      (issue.projectId !== null && !projectIds.has(issue.projectId)) ||
      (issue.estimate !== null &&
        (!Number.isFinite(issue.estimate) || issue.estimate < 0)) ||
      (issue.dueDate !== null && typeof issue.dueDate !== "string") ||
      (issue.cycleId !== null &&
        cycleById.get(issue.cycleId)?.teamId !== issue.teamId) ||
      (issue.milestoneId !== null &&
        milestoneById.get(issue.milestoneId)?.projectId !== issue.projectId) ||
      (issue.parentIssueUuid !== null &&
        !issueById.has(issue.parentIssueUuid)) ||
      (issue.assigneeId !== null && !userIds.has(issue.assigneeId)) ||
      !Number.isInteger(issue.priority)
    ) {
      throw new Error(
        `Linear native issue ${issue.identifier} has invalid references`,
      );
    }
    assertExactStringSet(
      issue.labelIds,
      issue.labelIds.filter((id) => labelById.has(id)),
      `issue ${issue.identifier} label`,
    );
    if (issue.labelIds.some((id) => !labelById.has(id))) {
      throw new Error(
        `Linear native issue ${issue.identifier} has invalid labels`,
      );
    }
    if (issue.labelIds.some((id) => labelById.get(id)?.isGroup === true)) {
      throw new Error(
        `Linear native issue ${issue.identifier} assigns a label group`,
      );
    }
    assertExactStringSet(
      issue.releaseIds,
      issue.releaseIds,
      `issue ${issue.identifier} release`,
    );
    if (
      issue.releaseIds.some((id) => {
        const release = releaseById.get(id);
        const pipeline = release
          ? pipelineById.get(release.pipelineId)
          : undefined;
        return !pipeline?.teamIds.includes(issue.teamId);
      })
    ) {
      throw new Error(
        `Linear native issue ${issue.identifier} has invalid releases`,
      );
    }
    assertExactStringSet(
      issue.relationIds,
      expectedRelationsByIssue.get(issue.issueUuid) ?? [],
      `issue ${issue.identifier} relation`,
    );
  }
  assertAcyclicNativeParents(
    new Map(
      identity.issues.map((issue) => [
        issue.issueUuid,
        issue.parentIssueUuid,
      ]),
    ),
    "issue",
  );
  for (const document of identity.documents) {
    const parentIds = [
      document.initiativeId,
      document.projectId,
      document.teamId,
      document.issueId,
      document.releaseId,
      document.cycleId,
    ].filter((id) => id !== null);
    if (
      typeof document.title !== "string" ||
      !/^[a-f0-9]{64}$/.test(document.contentSha256) ||
      !document.updatedAt?.trim() ||
      parentIds.length !== 1 ||
      (document.initiativeId !== null &&
        !initiativeIds.has(document.initiativeId)) ||
      (document.projectId !== null && !projectIds.has(document.projectId)) ||
      (document.teamId !== null && !teamById.has(document.teamId)) ||
      (document.issueId !== null && !issueById.has(document.issueId)) ||
      (document.releaseId !== null && !releaseById.has(document.releaseId)) ||
      (document.cycleId !== null && !cycleById.has(document.cycleId))
    ) {
      throw new Error(
        `Linear native document ${document.id} has invalid references`,
      );
    }
  }
  if (!Array.isArray(identity.rawDocumentIds)) {
    throw new Error("Linear native raw document allowlist is missing");
  }
  assertExactStringSet(
    identity.rawDocumentIds,
    identity.rawDocumentIds.filter((id) =>
      identity.documents.some((document) => document.id === id)
    ),
    "raw document",
  );

  const coverage = identity.coverage;
  if (!coverage || coverage.complete !== true) {
    throw new Error("Linear native coverage is incomplete");
  }
  const totals = {
    issues: identity.issues.length,
    labels: identity.labels.length,
    labelAssignments: identity.issues.reduce(
      (sum, issue) => sum + issue.labelIds.length,
      0,
    ),
    relations: identity.relations.length,
    teams: identity.teams.length,
    workflowStates: identity.workflowStates.length,
    users: identity.users.length,
    initiatives: identity.initiatives.length,
    projects: identity.projects.length,
    releasePipelines: identity.releasePipelines.length,
    releases: identity.releases.length,
    projectMilestones: identity.projectMilestones.length,
    cycles: identity.cycles.length,
    documents: identity.documents.length,
  };
  if (
    !coverage.totals ||
    JSON.stringify(Object.keys(coverage.totals).sort()) !==
      JSON.stringify(Object.keys(totals).sort()) ||
    Object.entries(totals).some(
      ([name, expected]) =>
        coverage.totals[name as keyof typeof coverage.totals] !== expected,
    )
  ) {
    throw new Error("Linear native coverage totals are invalid");
  }
  const topLevelRows = {
    issues: totals.issues,
    labels: totals.labels,
    teams: totals.teams,
    workflowStates: totals.workflowStates,
    users: totals.users,
    initiatives: totals.initiatives,
    projects: totals.projects,
    releasePipelines: totals.releasePipelines,
    releases: totals.releases,
    projectMilestones: totals.projectMilestones,
    cycles: totals.cycles,
    documents: totals.documents,
  };
  if (
    !coverage.topLevel ||
    JSON.stringify(Object.keys(coverage.topLevel).sort()) !==
      JSON.stringify(Object.keys(topLevelRows).sort())
  ) {
    throw new Error("Linear native top-level coverage catalog is invalid");
  }
  for (const [name, rows] of Object.entries(topLevelRows)) {
    assertNativeCoverageRow(
      coverage.topLevel[name as keyof typeof coverage.topLevel],
      rows,
      `${name} catalog`,
    );
  }
  if (!Array.isArray(coverage.perIssue)) {
    throw new Error("Linear native per-issue coverage is missing");
  }
  assertUniqueCatalog(
    coverage.perIssue,
    (row) => row.issueUuid,
    (row) => row.identifier,
    "native per-issue coverage",
  );
  if (coverage.perIssue.length !== identity.issues.length) {
    throw new Error("Linear native per-issue coverage is incomplete");
  }
  const perIssueById = new Map(
    coverage.perIssue.map((row) => [row.issueUuid, row]),
  );
  for (const issue of identity.issues) {
    const row = perIssueById.get(issue.issueUuid);
    if (!row || row.identifier !== issue.identifier) {
      throw new Error(
        `Linear native issue ${issue.identifier} coverage identity is invalid`,
      );
    }
    assertNativeCoverageRow(
      row.labels,
      issue.labelIds.length,
      `issue ${issue.identifier} labels`,
      NESTED_LABEL_PAGE_LIMIT + 1,
    );
    assertNativeCoverageRow(
      row.relations,
      null,
      `issue ${issue.identifier} relations`,
      NESTED_RELATION_PAGE_LIMIT + 1,
    );
    assertNativeCoverageRow(
      row.inverseRelations,
      null,
      `issue ${issue.identifier} inverse relations`,
      NESTED_RELATION_PAGE_LIMIT + 1,
    );
    if (
      row.relations.rows + row.inverseRelations.rows !==
        issue.relationIds.length
    ) {
      throw new Error(
        `Linear native issue ${issue.identifier} relation coverage is invalid`,
      );
    }
  }
  if (
    coverage.perIssue.reduce(
      (total, row) => total + row.relations.rows,
      0,
    ) !== identity.relations.length ||
    coverage.perIssue.reduce(
      (total, row) => total + row.inverseRelations.rows,
      0,
    ) !== identity.relations.length
  ) {
    throw new Error(
      "Linear native relation connection coverage totals are invalid",
    );
  }
  if (!Array.isArray(coverage.perProject)) {
    throw new Error("Linear native per-project coverage is missing");
  }
  assertUniqueCatalog(
    coverage.perProject,
    (row) => row.projectId,
    (row) => row.projectId,
    "native per-project coverage",
  );
  if (coverage.perProject.length !== identity.projects.length) {
    throw new Error("Linear native per-project coverage is incomplete");
  }
  const perProjectById = new Map(
    coverage.perProject.map((row) => [row.projectId, row]),
  );
  for (const project of identity.projects) {
    const row = perProjectById.get(project.id);
    if (!row) {
      throw new Error(
        `Linear native project ${project.id} coverage identity is invalid`,
      );
    }
    assertNativeCoverageRow(
      row.teams,
      project.teamIds.length,
      `project ${project.id} teams`,
      NESTED_PROJECT_TEAM_PAGE_LIMIT + 1,
    );
    assertNativeCoverageRow(
      row.initiatives,
      project.initiativeIds.length,
      `project ${project.id} initiatives`,
      NESTED_PROJECT_INITIATIVE_PAGE_LIMIT + 1,
    );
  }
}

export function assertLinearNativeIdentityMatchesFingerprint(
  fingerprint: LinearFingerprint,
  identity: LinearNativeIdentityCapture,
): void {
  assertLinearNativeIdentityCapture(identity);
  if (!Array.isArray(fingerprint.issues)) {
    throw new Error("Linear fingerprint issue catalog is missing");
  }
  assertUniqueCatalog(
    fingerprint.issues,
    (issue) => issue.linearId ?? "",
    (issue) => issue.identifier,
    "fingerprint issue",
  );
  assertUniqueCatalog(
    fingerprint.projects,
    (project) => project.id,
    (project) => `${project.id}:${project.name}`,
    "fingerprint project",
  );
  assertUniqueCatalog(
    fingerprint.releasePipelines,
    (pipeline) => pipeline.id,
    (pipeline) => `${pipeline.id}:${pipeline.name}`,
    "fingerprint release pipeline",
  );
  assertUniqueCatalog(
    fingerprint.projectMilestones,
    (milestone) => milestone.id,
    (milestone) => `${milestone.projectId}:${milestone.name}`,
    "fingerprint milestone",
  );
  assertUniqueCatalog(
    fingerprint.cycles,
    (cycle) => cycle.id,
    (cycle) => `${cycle.teamId}:${cycle.number}`,
    "fingerprint cycle",
  );
  assertUniqueCatalog(
    fingerprint.releases,
    (release) => release.id,
    (release) => `${release.id}:${release.name}`,
    "fingerprint release",
  );
  const nativeByIdentifier = new Map(
    identity.issues.map((issue) => [issue.identifier, issue]),
  );
  const nativeIssueById = new Map(
    identity.issues.map((issue) => [issue.issueUuid, issue]),
  );
  const teamById = new Map(identity.teams.map((team) => [team.id, team]));
  const stateById = new Map(
    identity.workflowStates.map((state) => [state.id, state]),
  );
  const userById = new Map(identity.users.map((user) => [user.id, user]));
  const projectById = new Map(
    identity.projects.map((project) => [project.id, project]),
  );
  const pipelineById = new Map(
    identity.releasePipelines.map((pipeline) => [pipeline.id, pipeline]),
  );
  const cycleById = new Map(
    identity.cycles.map((cycle) => [cycle.id, cycle]),
  );
  const releaseById = new Map(
    identity.releases.map((release) => [release.id, release]),
  );
  const milestoneById = new Map(
    identity.projectMilestones.map((milestone) => [milestone.id, milestone]),
  );
  const labelNameById = new Map(
    identity.labels.map((label) => [label.id, label.name]),
  );
  const relationKeyById = new Map(
    identity.relations.map((relation) => [
      relation.relationId,
      relation.canonicalKey,
    ]),
  );
  if (
    fingerprint.releasePipelines.length !== identity.releasePipelines.length ||
    fingerprint.releases.length !== identity.releases.length ||
    fingerprint.cycles.length !== identity.cycles.length
  ) {
    throw new Error(
      "Linear native release or cycle catalogs do not cover the accepted fingerprint",
    );
  }
  if (
    nativeByIdentifier.size !== identity.issues.length ||
    fingerprint.issues.length !== identity.issues.length
  ) {
    throw new Error(
      "Linear native issue catalog does not cover the accepted fingerprint",
    );
  }
  for (const issue of fingerprint.issues) {
    const native = nativeByIdentifier.get(issue.identifier);
    const labelNames = native?.labelIds.map((id) => labelNameById.get(id));
    const relationKeys = native?.relationIds.map((id) =>
      relationKeyById.get(id)
    );
    if (
      !native ||
      !issue.linearId ||
      native.issueUuid !== issue.linearId ||
      native.title !== issue.title ||
      native.archivedAt !== issue.archivedAt ||
      native.descriptionSha256 !== issue.descriptionFingerprint ||
      native.teamId !== issue.teamId ||
      teamById.get(native.teamId)?.key !== issue.team ||
      native.stateId !== issue.stateId ||
      stateById.get(native.stateId)?.name !== issue.state ||
      stateById.get(native.stateId)?.type !== issue.stateType ||
      native.projectId !== issue.projectId ||
      (native.projectId === null
        ? issue.project !== null
        : projectById.get(native.projectId)?.name !== issue.project) ||
      native.estimate !== issue.estimate ||
      native.priority !== issue.priority ||
      native.dueDate !== issue.dueDate ||
      native.cycleId !== issue.cycleId ||
      native.milestoneId !== issue.milestoneId ||
      native.parentIssueUuid !== issue.parentLinearId ||
      (native.parentIssueUuid === null
        ? issue.parent !== null
        : nativeIssueById.get(native.parentIssueUuid)?.identifier !==
          issue.parent) ||
      native.assigneeId !== issue.assigneeId ||
      (native.assigneeId === null
        ? issue.assignee !== null
        : userById.get(native.assigneeId)?.name !== issue.assignee) ||
      labelNames?.some((name) => name === undefined) ||
      JSON.stringify(labelNames?.sort()) !== JSON.stringify(issue.labels) ||
      relationKeys?.some((key) => key === undefined) ||
      JSON.stringify(relationKeys?.sort()) !== JSON.stringify(issue.relations) ||
      JSON.stringify(
          native.releaseIds
            .map((id) => {
              const release = releaseById.get(id);
              return release?.version ?? release?.id;
            })
            .sort(),
        ) !== JSON.stringify(issue.releases) ||
      native.releaseIds.some(
        (id) => !releaseById.has(id),
      ) ||
      (native.cycleId !== null &&
        (cycleById.get(native.cycleId)?.teamId !== native.teamId ||
          cycleById.get(native.cycleId)?.number !== issue.cycleNumber ||
          cycleById.get(native.cycleId)?.name !== issue.cycle)) ||
      (native.cycleId === null &&
        (issue.cycleNumber !== null || issue.cycle !== null)) ||
      (native.milestoneId !== null &&
        (milestoneById.get(native.milestoneId)?.projectId !== native.projectId ||
          milestoneById.get(native.milestoneId)?.name !== issue.milestone)) ||
      (native.milestoneId === null && issue.milestone !== null)
    ) {
      throw new Error(
        `Linear native identity for ${issue.identifier} does not match the accepted fingerprint`,
      );
    }
  }
  for (const project of fingerprint.projects) {
    const native = projectById.get(project.id);
    if (
      !native ||
      native.name !== project.name ||
      native.contentSha256 !== project.descriptionFingerprint ||
      native.updatedAt !== project.updatedAt ||
      native.archivedAt !== project.archivedAt ||
      native.statusId !== project.statusId ||
      native.status !== project.status ||
      native.statusType !== project.statusType ||
      native.priority !== project.priority ||
      native.leadId !== project.leadId ||
      native.startDate !== project.startDate ||
      native.startDateResolution !== project.startDateResolution ||
      native.targetDate !== project.targetDate ||
      native.targetDateResolution !== project.targetDateResolution
    ) {
      throw new Error(
        `Linear native project ${project.id} does not match the accepted fingerprint`,
      );
    }
  }
  for (const pipeline of fingerprint.releasePipelines) {
    const native = pipelineById.get(pipeline.id);
    if (
      !native ||
      native.name !== pipeline.name ||
      native.updatedAt !== pipeline.updatedAt ||
      native.archivedAt !== pipeline.archivedAt ||
      native.type !== pipeline.type ||
      native.isProduction !== pipeline.isProduction ||
      JSON.stringify(native.teamIds) !==
        JSON.stringify(pipeline.teams.map((team) => team.id).sort()) ||
      JSON.stringify(native.stages) !== JSON.stringify(pipeline.stages)
    ) {
      throw new Error(
        `Linear native release pipeline ${pipeline.id} does not match the accepted fingerprint`,
      );
    }
  }
  for (const release of fingerprint.releases) {
    const native = releaseById.get(release.id);
    if (
      !native ||
      native.name !== release.name ||
      native.descriptionSha256 !== release.descriptionFingerprint ||
      native.version !== release.version ||
      native.commitSha !== release.commitSha ||
      native.startDate !== release.startDate ||
      native.targetDate !== release.targetDate ||
      native.updatedAt !== release.updatedAt ||
      native.archivedAt !== release.archivedAt ||
      native.pipelineId !== release.pipeline ||
      native.stageId !== release.stage ||
      native.stageType !== release.stageType
    ) {
      throw new Error(
        `Linear native release ${release.id} does not match the accepted fingerprint`,
      );
    }
  }
  for (const milestone of fingerprint.projectMilestones) {
    const native = milestoneById.get(milestone.id);
    if (
      !native ||
      native.name !== milestone.name ||
      native.descriptionSha256 !== milestone.descriptionFingerprint ||
      native.projectId !== milestone.projectId ||
      native.updatedAt !== milestone.updatedAt ||
      native.archivedAt !== milestone.archivedAt ||
      native.targetDate !== milestone.targetDate ||
      native.status !== milestone.status
    ) {
      throw new Error(
        `Linear native project milestone ${milestone.id} does not match the accepted fingerprint`,
      );
    }
  }
  for (const cycle of fingerprint.cycles) {
    const native = cycleById.get(cycle.id);
    if (
      !native ||
      native.number !== cycle.number ||
      native.name !== cycle.name ||
      native.descriptionSha256 !== cycle.descriptionFingerprint ||
      native.updatedAt !== cycle.updatedAt ||
      native.archivedAt !== cycle.archivedAt ||
      native.startsAt !== cycle.startsAt ||
      native.endsAt !== cycle.endsAt ||
      native.completedAt !== cycle.completedAt ||
      native.teamId !== cycle.teamId ||
      native.teamKey !== cycle.team ||
      native.inheritedFromId !== cycle.inheritedFromId
    ) {
      throw new Error(
        `Linear native cycle ${cycle.id} does not match the accepted fingerprint`,
      );
    }
  }
  for (const document of identity.documents) {
    if (
      (document.releaseId !== null && !releaseById.has(document.releaseId)) ||
      (document.cycleId !== null && !cycleById.has(document.cycleId))
    ) {
      throw new Error(
        `Linear native document ${document.id} has an invalid release or cycle parent`,
      );
    }
  }
  if (fingerprint.program) {
    assertUniqueCatalog(
      fingerprint.program.initiatives,
      (initiative) => initiative.id,
      (initiative) => `${initiative.id}:${initiative.name}`,
      "fingerprint initiative",
    );
    assertUniqueCatalog(
      fingerprint.program.documents,
      (document) => document.id,
      (document) => `${document.id}:${document.title}`,
      "fingerprint document",
    );
    const activeNativeInitiatives = identity.initiatives
      .filter((initiative) => initiative.archivedAt === null)
      .sort((left, right) => left.id.localeCompare(right.id));
    const programInitiatives = fingerprint.program.initiatives
      .slice()
      .sort((left, right) => left.id.localeCompare(right.id));
    if (
      activeNativeInitiatives.length !== programInitiatives.length ||
      activeNativeInitiatives.some((native, index) => {
        const program = programInitiatives[index];
        return native.id !== program?.id ||
          native.name !== program.name ||
          native.updatedAt !== program.updatedAt ||
          native.archivedAt !== program.archivedAt ||
          native.ownerId !== program.ownerId ||
          native.status !== program.status ||
          native.priority !== program.priority ||
          native.health !== program.health ||
          native.healthUpdatedAt !== program.healthUpdatedAt ||
          native.targetDate !== program.targetDate ||
          native.targetDateResolution !== program.targetDateResolution ||
          native.parentInitiativeId !== program.parentInitiativeId;
      })
    ) {
      throw new Error(
        "Linear active native initiatives do not match the accepted program fingerprint",
      );
    }
    const nativeDocumentById = new Map(
      identity.documents.map((document) => [document.id, document]),
    );
    for (const document of fingerprint.program.documents) {
      const native = nativeDocumentById.get(document.id);
      if (
        !native ||
        native.title !== document.title ||
        native.contentSha256 !== document.contentFingerprint ||
        native.updatedAt !== document.updatedAt ||
        native.archivedAt !== document.archivedAt ||
        native.initiativeId !== document.initiativeId ||
        native.projectId !== document.projectId ||
        native.teamId !== document.teamId ||
        native.issueId !== document.issueId ||
        native.releaseId !== null ||
        native.cycleId !== null
      ) {
        throw new Error(
          `Linear native document ${document.id} does not match the accepted program fingerprint`,
        );
      }
    }
    assertUniqueCatalog(
      fingerprint.program.projectDocuments ?? [],
      (document) => document.id,
      (document) => `${document.id}:${document.title}`,
      "fingerprint project document",
    );
    for (const document of fingerprint.program.projectDocuments ?? []) {
      const native = nativeDocumentById.get(document.id);
      if (
        !native ||
        native.title !== document.title ||
        native.contentSha256 !== document.contentFingerprint ||
        native.updatedAt !== document.updatedAt ||
        native.archivedAt !== document.archivedAt ||
        native.initiativeId !== document.initiativeId ||
        native.projectId !== document.projectId ||
        native.teamId !== document.teamId ||
        native.issueId !== document.issueId ||
        native.releaseId !== null ||
        native.cycleId !== null ||
        (document.projectId !== null &&
          projectById.get(document.projectId)?.name !== document.projectName)
      ) {
        throw new Error(
          `Linear native project document ${document.id} does not match the accepted program fingerprint`,
        );
      }
    }
  }
}

export function assertLinearRawDocumentsMatchNativeIdentity(
  identity: LinearNativeIdentityCapture,
  raw: LinearRawDocumentCapture,
): void {
  const metadataById = new Map(
    identity.documents.map((document) => [document.id, document]),
  );
  const expectedRawIds = new Set(identity.rawDocumentIds);
  if (
    raw.schemaVersion !== 1 ||
    metadataById.size !== identity.documents.length ||
    expectedRawIds.size !== identity.rawDocumentIds.length ||
    raw.documents.length !== expectedRawIds.size
  ) {
    throw new Error(
      "Linear raw document artifact does not cover native document identities",
    );
  }
  const rawIds = new Set<string>();
  for (const document of raw.documents) {
    if (rawIds.has(document.id)) {
      throw new Error(`Linear raw document artifact duplicates ${document.id}`);
    }
    rawIds.add(document.id);
    const { content, ...metadata } = document;
    if (
      !expectedRawIds.has(document.id) ||
      metadata.contentSha256 !== descriptionFingerprint(content) ||
      JSON.stringify(metadataById.get(document.id)) !== JSON.stringify(metadata)
    ) {
      throw new Error(
        `Linear raw document ${document.id} does not match its native identity`,
      );
    }
  }
  if (
    rawIds.size !== expectedRawIds.size ||
    [...expectedRawIds].some((id) => !rawIds.has(id))
  ) {
    throw new Error(
      "Linear raw document artifact does not have the exact native document ID set",
    );
  }
}

interface NativeCaptureCoverageState {
  topLevel: {
    issues: MutableConnectionCoverage;
    labels: MutableConnectionCoverage;
    teams: MutableConnectionCoverage;
    workflowStates: MutableConnectionCoverage;
    users: MutableConnectionCoverage;
    initiatives: MutableConnectionCoverage;
    projects: MutableConnectionCoverage;
    releasePipelines: MutableConnectionCoverage;
    releases: MutableConnectionCoverage;
    projectMilestones: MutableConnectionCoverage;
    cycles: MutableConnectionCoverage;
    documents: MutableConnectionCoverage;
  };
  perIssue: Map<
    string,
    {
      labels: MutableNestedConnectionCoverage;
      relations: MutableNestedConnectionCoverage;
      inverseRelations: MutableNestedConnectionCoverage;
    }
  >;
  perProject: Map<
    string,
    {
      teams: MutableNestedConnectionCoverage;
      initiatives: MutableNestedConnectionCoverage;
    }
  >;
}

function buildNativeCaptureArtifacts(
  organization: OrganizationNode,
  issueNodes: IssueNode[],
  labelNodes: IssueLabelCatalogNode[],
  teamNodes: TeamCatalogNode[],
  workflowStateNodes: WorkflowStateCatalogNode[],
  userNodes: UserCatalogNode[],
  initiativeNodes: InitiativeNode[],
  projectNodes: ProjectCatalogNode[],
  pipelineNodes: PipelineNode[],
  releaseNodes: ReleaseNode[],
  projectMilestoneNodes: ProjectMilestoneNode[],
  cycleNodes: CycleNode[],
  documentNodes: DocumentNode[],
  fingerprint: LinearFingerprint,
  coverageState: NativeCaptureCoverageState,
  rawDocumentIds: ReadonlySet<string>,
): {
  nativeIdentity: LinearNativeIdentityCapture;
  documents: LinearRawDocumentCapture;
} {
  assertUniqueCatalog(
    issueNodes,
    (issue) => issue.id,
    (issue) => issue.identifier,
    "issue",
  );
  assertUniqueCatalog(
    labelNodes,
    (label) => label.id,
    (label) =>
      `${label.team?.id ?? "workspace"}:${label.parent?.id ?? ""}:${label.name}`,
    "label",
  );
  assertUniqueCatalog(
    teamNodes,
    (team) => team.id,
    (team) => team.key,
    "team",
  );
  assertUniqueCatalog(
    workflowStateNodes,
    (state) => state.id,
    (state) => `${state.team.id}:${state.name}`,
    "workflow state",
  );
  assertUniqueCatalog(
    userNodes,
    (user) => user.id,
    (user) => user.id,
    "user",
  );
  assertUniqueCatalog(
    initiativeNodes,
    (initiative) => initiative.id,
    (initiative) => `${initiative.id}:${initiative.name}`,
    "initiative",
  );
  assertUniqueCatalog(
    projectNodes,
    (project) => project.id,
    (project) => `${project.id}:${project.name}`,
    "project",
  );
  assertUniqueCatalog(
    pipelineNodes,
    (pipeline) => pipeline.id,
    (pipeline) => `${pipeline.id}:${pipeline.name}`,
    "release pipeline",
  );
  assertUniqueCatalog(
    releaseNodes,
    (release) => release.id,
    (release) => `${release.pipeline.id}:${release.version ?? release.name}`,
    "release",
  );
  assertUniqueCatalog(
    projectMilestoneNodes,
    (milestone) => milestone.id,
    (milestone) => `${milestone.project.id}:${milestone.name}`,
    "project milestone",
  );
  assertUniqueCatalog(
    cycleNodes,
    (cycle) => cycle.id,
    (cycle) => `${cycle.team.id}:${cycle.number}`,
    "cycle",
  );
  assertUniqueCatalog(
    documentNodes,
    (document) => document.id,
    (document) => `${document.id}:${document.title}`,
    "document",
  );

  const teamById = new Map(teamNodes.map((team) => [team.id, team]));
  const labelById = new Map(labelNodes.map((label) => [label.id, label]));
  const stateById = new Map(
    workflowStateNodes.map((state) => [state.id, state]),
  );
  const userById = new Map(userNodes.map((user) => [user.id, user]));
  const initiativeById = new Map(
    initiativeNodes.map((initiative) => [initiative.id, initiative]),
  );
  const projectById = new Map(
    projectNodes.map((project) => [project.id, project]),
  );
  const issueById = new Map(issueNodes.map((issue) => [issue.id, issue]));
  const pipelineById = new Map(
    pipelineNodes.map((pipeline) => [pipeline.id, pipeline]),
  );
  const releaseById = new Map(
    releaseNodes.map((release) => [release.id, release]),
  );
  const milestoneById = new Map(
    projectMilestoneNodes.map((milestone) => [milestone.id, milestone]),
  );
  const cycleById = new Map(cycleNodes.map((cycle) => [cycle.id, cycle]));
  for (const label of labelNodes) {
    if (
      !/^#[0-9a-f]{6}$/i.test(label.color) ||
      (label.description !== null && typeof label.description !== "string") ||
      (label.team &&
        (teamById.get(label.team.id)?.key !== label.team.key)) ||
      (label.parent &&
        (labelById.get(label.parent.id)?.name !== label.parent.name ||
          labelById.get(label.parent.id)?.isGroup !== true)) ||
      (label.isGroup && label.parent !== null) ||
      (label.inheritedFrom && !labelById.has(label.inheritedFrom.id))
    ) {
      throw new Error(`Linear label ${label.id} has orphaned native identity`);
    }
  }
  for (const state of workflowStateNodes) {
    if (teamById.get(state.team.id)?.key !== state.team.key) {
      throw new Error(
        `Linear workflow state ${state.id} has orphaned team identity`,
      );
    }
  }
  for (const initiative of initiativeNodes) {
    if (
      (initiative.owner &&
        userById.get(initiative.owner.id)?.name !== initiative.owner.name) ||
      (initiative.parentInitiative &&
        initiativeById.get(initiative.parentInitiative.id)?.name !==
          initiative.parentInitiative.name)
    ) {
      throw new Error(
        `Linear initiative ${initiative.id} has orphaned native identity`,
      );
    }
  }
  for (const project of projectNodes) {
    if (
      project.lead &&
      userById.get(project.lead.id)?.name !== project.lead.name
    ) {
      throw new Error(
        `Linear project ${project.id} has invalid lead identity`,
      );
    }
    const seenTeamIds = new Set<string>();
    for (const team of project.teams.nodes) {
      if (
        seenTeamIds.has(team.id) ||
        teamById.get(team.id)?.key !== team.key
      ) {
        throw new Error(
          `Linear project ${project.id} has invalid team identity`,
        );
      }
      seenTeamIds.add(team.id);
    }
    const seenInitiativeIds = new Set<string>();
    for (const initiative of project.initiatives.nodes) {
      if (
        seenInitiativeIds.has(initiative.id) ||
        initiativeById.get(initiative.id)?.name !== initiative.name
      ) {
        throw new Error(
          `Linear project ${project.id} has invalid initiative identity`,
        );
      }
      seenInitiativeIds.add(initiative.id);
    }
  }
  for (const pipeline of pipelineNodes) {
    const teamIds = pipeline.teams.nodes.map((team) => team.id);
    const stageIds = pipeline.stages.nodes.map((stage) => stage.id);
    if (
      new Set(teamIds).size !== teamIds.length ||
      pipeline.teams.nodes.some(
        (team) => teamById.get(team.id)?.key !== team.key,
      ) ||
      new Set(stageIds).size !== stageIds.length
    ) {
      throw new Error(
        `Linear release pipeline ${pipeline.id} has invalid native identity`,
      );
    }
  }
  for (const release of releaseNodes) {
    const pipeline = pipelineById.get(release.pipeline.id);
    const stage = pipeline?.stages.nodes.find(
      (candidate) => candidate.id === release.stage.id,
    );
    if (
      !pipeline ||
      !stage ||
      stage.name !== release.stage.name ||
      stage.type !== release.stage.type
    ) {
      throw new Error(
        `Linear release ${release.id} has invalid pipeline or stage identity`,
      );
    }
  }
  for (const milestone of projectMilestoneNodes) {
    if (
      projectById.get(milestone.project.id)?.name !== milestone.project.name
    ) {
      throw new Error(
        `Linear project milestone ${milestone.id} has invalid project identity`,
      );
    }
  }
  for (const cycle of cycleNodes) {
    if (
      teamById.get(cycle.team.id)?.key !== cycle.team.key ||
      (cycle.inheritedFrom && !cycleById.has(cycle.inheritedFrom.id))
    ) {
      throw new Error(`Linear cycle ${cycle.id} has invalid native identity`);
    }
  }

  const relations = nativeRelationCatalog(issueNodes);
  const issues = issueNodes
    .map((issue) => {
      if (
        teamById.get(issue.team.id)?.key !== issue.team.key ||
        stateById.get(issue.state.id)?.team.id !== issue.team.id ||
        stateById.get(issue.state.id)?.name !== issue.state.name ||
        stateById.get(issue.state.id)?.type !== issue.state.type ||
        (issue.assignee &&
          userById.get(issue.assignee.id)?.name !== issue.assignee.name) ||
        (issue.project &&
          projectById.get(issue.project.id)?.name !== issue.project.name) ||
        (issue.cycle &&
          (cycleById.get(issue.cycle.id)?.team.id !== issue.team.id ||
            cycleById.get(issue.cycle.id)?.number !== issue.cycle.number ||
            cycleById.get(issue.cycle.id)?.name !== issue.cycle.name)) ||
        (issue.projectMilestone &&
          (milestoneById.get(issue.projectMilestone.id)?.project.id !==
              issue.project?.id ||
            milestoneById.get(issue.projectMilestone.id)?.name !==
              issue.projectMilestone.name)) ||
        (issue.parent &&
          issueById.get(issue.parent.id)?.identifier !== issue.parent.identifier)
      ) {
        throw new Error(
          `Linear issue ${issue.identifier} has orphaned team or workflow state identity`,
        );
      }
      const labelIds = issue.labels.nodes.map((label) => label.id).sort();
      if (
        new Set(labelIds).size !== labelIds.length ||
        issue.labels.nodes.some(
          (label) =>
            labelById.get(label.id)?.name !== label.name ||
            labelById.get(label.id)?.isGroup === true,
        )
      ) {
        throw new Error(
          `Linear issue ${issue.identifier} has invalid label assignments`,
        );
      }
      const relationIds = [
        ...new Set(
          [...issue.relations.nodes, ...issue.inverseRelations.nodes].map(
            (relation) => relation.id,
          ),
        ),
      ].sort();
      if (
        relationIds.some(
          (relationId) =>
            !relations.some((relation) => relation.relationId === relationId),
        )
      ) {
        throw new Error(
          `Linear issue ${issue.identifier} has invalid relation assignments`,
        );
      }
      const releaseIds = issue.releases.nodes.map((release) => release.id);
      if (
        new Set(releaseIds).size !== releaseIds.length ||
        issue.releases.nodes.some((assignment) => {
          const release = releaseById.get(assignment.id);
          const pipeline = release
            ? pipelineById.get(release.pipeline.id)
            : undefined;
          return !release ||
            release.version !== assignment.version ||
            !pipeline?.teams.nodes.some((team) => team.id === issue.team.id);
        })
      ) {
        throw new Error(
          `Linear issue ${issue.identifier} has invalid release assignments`,
        );
      }
      return {
        issueUuid: issue.id,
        identifier: issue.identifier,
        title: issue.title,
        archivedAt: issue.archivedAt,
        descriptionSha256: descriptionFingerprint(issue.description),
        teamId: issue.team.id,
        stateId: issue.state.id,
        projectId: issue.project?.id ?? null,
        estimate: issue.estimate,
        priority: issue.priority,
        dueDate: issue.dueDate,
        cycleId: issue.cycle?.id ?? null,
        milestoneId: issue.projectMilestone?.id ?? null,
        releaseIds: releaseIds.sort(),
        parentIssueUuid: issue.parent?.id ?? null,
        assigneeId: issue.assignee?.id ?? null,
        labelIds,
        relationIds,
      };
    })
    .sort((left, right) => left.identifier.localeCompare(right.identifier));
  const labels = labelNodes
    .map((label) => ({
      id: label.id,
      name: label.name,
      color: label.color,
      description: label.description,
      archivedAt: label.archivedAt,
      retiredAt: label.retiredAt,
      inheritedFromId: label.inheritedFrom?.id ?? null,
      isGroup: label.isGroup,
      parentId: label.parent?.id ?? null,
      parentName: label.parent?.name ?? null,
      teamId: label.team?.id ?? null,
      teamKey: label.team?.key ?? null,
    }))
    .sort((left, right) => left.id.localeCompare(right.id));
  const teams = teamNodes
    .map((team) => ({ ...team }))
    .sort((left, right) => left.id.localeCompare(right.id));
  const workflowStates = workflowStateNodes
    .map((state) => ({
      id: state.id,
      name: state.name,
      type: state.type,
      color: state.color,
      position: state.position,
      archivedAt: state.archivedAt,
      teamId: state.team.id,
      teamKey: state.team.key,
    }))
    .sort((left, right) => left.id.localeCompare(right.id));
  const users = userNodes
    .map((user) => ({ ...user }))
    .sort((left, right) => left.id.localeCompare(right.id));
  const initiatives = initiativeNodes
    .map((initiative) => ({
      id: initiative.id,
      name: initiative.name,
      contentSha256: descriptionFingerprint(initiative.content),
      descriptionSha256: descriptionFingerprint(initiative.description),
      updatedAt: initiative.updatedAt,
      archivedAt: initiative.archivedAt,
      ownerId: initiative.owner?.id ?? null,
      status: initiative.status,
      priority: initiative.priority,
      health: initiative.health,
      healthUpdatedAt: initiative.healthUpdatedAt,
      startedAt: initiative.startedAt,
      targetDate: initiative.targetDate,
      targetDateResolution: initiative.targetDateResolution,
      parentInitiativeId: initiative.parentInitiative?.id ?? null,
    }))
    .sort((left, right) => left.id.localeCompare(right.id));
  const projects = projectNodes
    .map((project) => ({
      id: project.id,
      name: project.name,
      contentSha256: descriptionFingerprint(project.content),
      updatedAt: project.updatedAt,
      archivedAt: project.archivedAt,
      statusId: project.status.id,
      status: project.status.name,
      statusType: project.status.type,
      priority: project.priority,
      leadId: project.lead?.id ?? null,
      startDate: project.startDate,
      startDateResolution: project.startDateResolution,
      targetDate: project.targetDate,
      targetDateResolution: project.targetDateResolution,
      teamIds: project.teams.nodes.map((team) => team.id).sort(),
      initiativeIds: project.initiatives.nodes
        .map((initiative) => initiative.id)
        .sort(),
    }))
    .sort((left, right) => left.id.localeCompare(right.id));
  const releasePipelines = pipelineNodes
    .map((pipeline) => ({
      id: pipeline.id,
      name: pipeline.name,
      updatedAt: pipeline.updatedAt,
      archivedAt: pipeline.archivedAt,
      type: pipeline.type,
      isProduction: pipeline.isProduction,
      teamIds: pipeline.teams.nodes.map((team) => team.id).sort(),
      stages: pipeline.stages.nodes
        .map((stage) => ({ ...stage }))
        .sort((left, right) => left.id.localeCompare(right.id)),
    }))
    .sort((left, right) => left.id.localeCompare(right.id));
  const releases = releaseNodes
    .map((release) => ({
      id: release.id,
      name: release.name,
      descriptionSha256: descriptionFingerprint(release.description),
      version: release.version,
      commitSha: release.commitSha,
      startDate: release.startDate,
      startedAt: release.startedAt,
      targetDate: release.targetDate,
      completedAt: release.completedAt,
      updatedAt: release.updatedAt,
      archivedAt: release.archivedAt,
      pipelineId: release.pipeline.id,
      stageId: release.stage.id,
      stageName: release.stage.name,
      stageType: release.stage.type,
    }))
    .sort((left, right) => left.id.localeCompare(right.id));
  const projectMilestones = projectMilestoneNodes
    .map((milestone) => ({
      id: milestone.id,
      name: milestone.name,
      descriptionSha256: descriptionFingerprint(milestone.description),
      projectId: milestone.project.id,
      updatedAt: milestone.updatedAt,
      archivedAt: milestone.archivedAt,
      targetDate: milestone.targetDate,
      status: milestone.status,
    }))
    .sort((left, right) => left.id.localeCompare(right.id));
  const cycles = cycleNodes
    .map((cycle) => ({
      id: cycle.id,
      number: cycle.number,
      name: cycle.name,
      descriptionSha256: descriptionFingerprint(cycle.description),
      updatedAt: cycle.updatedAt,
      archivedAt: cycle.archivedAt,
      startsAt: cycle.startsAt,
      endsAt: cycle.endsAt,
      completedAt: cycle.completedAt,
      teamId: cycle.team.id,
      teamKey: cycle.team.key,
      inheritedFromId: cycle.inheritedFrom?.id ?? null,
    }))
    .sort((left, right) => left.id.localeCompare(right.id));
  for (const document of documentNodes) {
    const parentCount = [
      document.initiative,
      document.project,
      document.team,
      document.issue,
      document.release,
      document.cycle,
    ].filter((parent) => parent !== null).length;
    if (
      parentCount !== 1 ||
      (document.initiative &&
        initiativeById.get(document.initiative.id)?.name !==
          document.initiative.name) ||
      (document.project &&
        projectById.get(document.project.id)?.name !== document.project.name) ||
      (document.team &&
        teamById.get(document.team.id)?.key !== document.team.key) ||
      (document.issue &&
        issueById.get(document.issue.id)?.identifier !==
          document.issue.identifier) ||
      (document.release &&
        (releaseById.get(document.release.id)?.name !== document.release.name ||
          releaseById.get(document.release.id)?.version !==
            document.release.version)) ||
      (document.cycle &&
        (cycleById.get(document.cycle.id)?.number !== document.cycle.number ||
          cycleById.get(document.cycle.id)?.name !== document.cycle.name))
    ) {
      throw new Error(
        `Linear document ${document.id} has orphaned native attachment identity`,
      );
    }
  }
  const documents = documentNodes
    .map((document) => ({
      id: document.id,
      title: document.title,
      content: document.content ?? null,
      contentSha256: descriptionFingerprint(document.content),
      updatedAt: document.updatedAt,
      archivedAt: document.archivedAt,
      initiativeId: document.initiative?.id ?? null,
      projectId: document.project?.id ?? null,
      teamId: document.team?.id ?? null,
      issueId: document.issue?.id ?? null,
      releaseId: document.release?.id ?? null,
      cycleId: document.cycle?.id ?? null,
    }))
    .sort((left, right) => left.id.localeCompare(right.id));
  const documentIds = new Set(documents.map((document) => document.id));
  if ([...rawDocumentIds].some((id) => !documentIds.has(id))) {
    throw new Error(
      "Linear raw document allowlist is not covered by the document catalog",
    );
  }

  const topLevel = {
    issues: finalConnectionCoverage(coverageState.topLevel.issues, "issue"),
    labels: finalConnectionCoverage(coverageState.topLevel.labels, "label"),
    teams: finalConnectionCoverage(coverageState.topLevel.teams, "team"),
    workflowStates: finalConnectionCoverage(
      coverageState.topLevel.workflowStates,
      "workflow state",
    ),
    users: finalConnectionCoverage(coverageState.topLevel.users, "user"),
    initiatives: finalConnectionCoverage(
      coverageState.topLevel.initiatives,
      "initiative",
    ),
    projects: finalConnectionCoverage(
      coverageState.topLevel.projects,
      "project",
    ),
    releasePipelines: finalConnectionCoverage(
      coverageState.topLevel.releasePipelines,
      "release pipeline",
    ),
    releases: finalConnectionCoverage(
      coverageState.topLevel.releases,
      "release",
    ),
    projectMilestones: finalConnectionCoverage(
      coverageState.topLevel.projectMilestones,
      "project milestone",
    ),
    cycles: finalConnectionCoverage(
      coverageState.topLevel.cycles,
      "cycle",
    ),
    documents: finalConnectionCoverage(
      coverageState.topLevel.documents,
      "document",
    ),
  };
  if (
    topLevel.issues.rows !== issueNodes.length ||
    topLevel.labels.rows !== labelNodes.length ||
    topLevel.teams.rows !== teamNodes.length ||
    topLevel.workflowStates.rows !== workflowStateNodes.length ||
    topLevel.users.rows !== userNodes.length ||
    topLevel.initiatives.rows !== initiativeNodes.length ||
    topLevel.projects.rows !== projectNodes.length ||
    topLevel.releasePipelines.rows !== pipelineNodes.length ||
    topLevel.releases.rows !== releaseNodes.length ||
    topLevel.projectMilestones.rows !== projectMilestoneNodes.length ||
    topLevel.cycles.rows !== cycleNodes.length ||
    topLevel.documents.rows !== documentNodes.length
  ) {
    throw new Error("Linear native catalog coverage totals are inconsistent");
  }
  const perIssue = issueNodes
    .map((issue) => {
      const state = coverageState.perIssue.get(issue.id);
      if (!state) {
        throw new Error(
          `Linear issue ${issue.identifier} lacks nested coverage`,
        );
      }
      return {
        issueUuid: issue.id,
        identifier: issue.identifier,
        labels: finalNestedConnectionCoverage(
          issue.labels,
          state.labels,
          `issue ${issue.identifier} labels`,
        ),
        relations: finalNestedConnectionCoverage(
          issue.relations,
          state.relations,
          `issue ${issue.identifier} relations`,
        ),
        inverseRelations: finalNestedConnectionCoverage(
          issue.inverseRelations,
          state.inverseRelations,
          `issue ${issue.identifier} inverse relations`,
        ),
      };
    })
    .sort((left, right) => left.identifier.localeCompare(right.identifier));
  const perProject = projectNodes
    .map((project) => {
      const state = coverageState.perProject.get(project.id);
      if (!state) {
        throw new Error(`Linear project ${project.id} lacks nested coverage`);
      }
      return {
        projectId: project.id,
        teams: finalNestedConnectionCoverage(
          project.teams,
          state.teams,
          `project ${project.id} teams`,
        ),
        initiatives: finalNestedConnectionCoverage(
          project.initiatives,
          state.initiatives,
          `project ${project.id} initiatives`,
        ),
      };
    })
    .sort((left, right) => left.projectId.localeCompare(right.projectId));
  const nativeIdentity: LinearNativeIdentityCapture = {
    schemaVersion: 1,
    workspace: { ...organization },
    issues,
    labels,
    relations,
    teams,
    workflowStates,
    users,
    initiatives,
    projects,
    releasePipelines,
    releases,
    projectMilestones,
    cycles,
    documents: documents.map(({ content: _content, ...document }) => document),
    rawDocumentIds: [...rawDocumentIds].sort(),
    coverage: {
      complete: true,
      totals: {
        issues: issues.length,
        labels: labels.length,
        labelAssignments: issues.reduce(
          (total, issue) => total + issue.labelIds.length,
          0,
        ),
        relations: relations.length,
        teams: teams.length,
        workflowStates: workflowStates.length,
        users: users.length,
        initiatives: initiatives.length,
        projects: projects.length,
        releasePipelines: releasePipelines.length,
        releases: releases.length,
        projectMilestones: projectMilestones.length,
        cycles: cycles.length,
        documents: documents.length,
      },
      topLevel,
      perIssue,
      perProject,
    },
  };
  assertLinearNativeIdentityMatchesFingerprint(fingerprint, nativeIdentity);
  return {
    nativeIdentity,
    documents: {
      schemaVersion: 1,
      documents: documents.filter((document) => rawDocumentIds.has(document.id)),
    },
  };
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
  nativeIdentity?: LinearNativeIdentityCapture;
  documents?: LinearRawDocumentCapture;
}

export async function fetchLinearCapture(
  fetcher: typeof fetch,
  token: string,
  scope?: LinearFingerprintScope,
  programScope?: LinearProgramScope,
  options: LinearCaptureOptions = {},
): Promise<LinearCapture> {
  if (!token) throw new Error("LINEAR_API_KEY is required");
  const enhanced = options.nativeIdentity === true;
  const newCoverage = (): MutableConnectionCoverage => ({
    terminal: false,
    pages: 0,
    rows: 0,
    finalCursor: null,
    attempts: 0,
  });
  const coverageState: NativeCaptureCoverageState | null = enhanced
    ? {
        topLevel: {
          issues: newCoverage(),
          labels: newCoverage(),
          teams: newCoverage(),
          workflowStates: newCoverage(),
          users: newCoverage(),
          initiatives: newCoverage(),
          projects: newCoverage(),
          releasePipelines: newCoverage(),
          releases: newCoverage(),
          projectMilestones: newCoverage(),
          cycles: newCoverage(),
          documents: newCoverage(),
        },
        perIssue: new Map(),
        perProject: new Map(),
      }
    : null;
  const [
    organization,
    issueNodes,
    pipelineNodes,
    releaseNodes,
    projectNodes,
    projectMilestoneNodes,
    cycleNodes,
    initiativeNodes,
    documentNodes,
    labelNodes,
    teamNodes,
    workflowStateNodes,
    userNodes,
    projectCatalogNodes,
  ] = await Promise.all([
    enhanced
      ? requestWithVariables<{ organization: OrganizationNode }>(
          fetcher,
          token,
          ORGANIZATION_QUERY,
          {},
        ).then((data) => data.organization)
      : Promise.resolve(null),
    paginate<IssueNode>(
      fetcher,
      token,
      ISSUE_QUERY,
      "issues",
      coverageState?.topLevel.issues,
    ),
    paginate<PipelineNode>(
      fetcher,
      token,
      PIPELINE_QUERY,
      "releasePipelines",
      coverageState?.topLevel.releasePipelines,
    ),
    paginate<ReleaseNode>(
      fetcher,
      token,
      RELEASE_QUERY,
      "releases",
      coverageState?.topLevel.releases,
    ),
    paginate<ProjectNode>(fetcher, token, PROJECT_QUERY, "projects"),
    paginate<ProjectMilestoneNode>(
      fetcher,
      token,
      PROJECT_MILESTONE_QUERY,
      "projectMilestones",
      coverageState?.topLevel.projectMilestones,
    ),
    paginate<CycleNode>(
      fetcher,
      token,
      CYCLE_QUERY,
      "cycles",
      coverageState?.topLevel.cycles,
    ),
    programScope || enhanced
      ? paginate<InitiativeNode>(
          fetcher,
          token,
          INITIATIVE_QUERY,
          "initiatives",
          coverageState?.topLevel.initiatives,
        )
      : Promise.resolve([]),
    programScope || enhanced
      ? paginate<DocumentNode>(
          fetcher,
          token,
          DOCUMENT_QUERY,
          "documents",
          coverageState?.topLevel.documents,
        )
      : Promise.resolve([]),
    enhanced
      ? paginate<IssueLabelCatalogNode>(
          fetcher,
          token,
          ISSUE_LABEL_CATALOG_QUERY,
          "issueLabels",
          coverageState!.topLevel.labels,
        )
      : Promise.resolve([]),
    enhanced
      ? paginate<TeamCatalogNode>(
          fetcher,
          token,
          TEAM_CATALOG_QUERY,
          "teams",
          coverageState!.topLevel.teams,
        )
      : Promise.resolve([]),
    enhanced
      ? paginate<WorkflowStateCatalogNode>(
          fetcher,
          token,
          WORKFLOW_STATE_CATALOG_QUERY,
          "workflowStates",
          coverageState!.topLevel.workflowStates,
        )
      : Promise.resolve([]),
    enhanced
      ? paginate<UserCatalogNode>(
          fetcher,
          token,
          USER_CATALOG_QUERY,
          "users",
          coverageState!.topLevel.users,
        )
      : Promise.resolve([]),
    enhanced
      ? paginate<ProjectCatalogNode>(
          fetcher,
          token,
          PROJECT_CATALOG_QUERY,
          "projects",
          coverageState!.topLevel.projects,
        )
      : Promise.resolve([]),
  ]);
  await completeProjectInitiativeConnections(fetcher, token, projectNodes);
  if (coverageState) {
    for (const issue of issueNodes) {
      coverageState.perIssue.set(issue.id, {
        labels: { pages: 1, attempts: 1 },
        relations: { pages: 1, attempts: 1 },
        inverseRelations: { pages: 1, attempts: 1 },
      });
    }
    for (const project of projectCatalogNodes) {
      coverageState.perProject.set(project.id, {
        teams: { pages: 1, attempts: 1 },
        initiatives: { pages: 1, attempts: 1 },
      });
    }
    await completeIssueLabelConnections(
      fetcher,
      token,
      issueNodes,
      new Map(
        [...coverageState.perIssue].map(([id, value]) => [id, value.labels]),
      ),
    );
    await completeProjectTeamConnections(
      fetcher,
      token,
      projectCatalogNodes,
      new Map(
        [...coverageState.perProject].map(([id, value]) => [id, value.teams]),
      ),
    );
    await completeProjectInitiativeConnections(
      fetcher,
      token,
      projectCatalogNodes,
      new Map(
        [...coverageState.perProject].map(([id, value]) => [
          id,
          value.initiatives,
        ]),
      ),
    );
  }
  await completeIssueRelationConnections(
    fetcher,
    token,
    issueNodes,
    coverageState
      ? new Map(
          [...coverageState.perIssue].map(([id, value]) => [
            id,
            {
              relations: value.relations,
              inverseRelations: value.inverseRelations,
            },
          ]),
        )
      : undefined,
  );
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
  const governedProjectIds = new Set(
    programScope?.projectInitiatives.map((project) => project.projectId) ?? [],
  );
  const expectedProjectDocumentIds = new Set(
    programScope?.schemaVersion === 3
      ? [
          ...programScope.canonicalProjectDocuments,
          ...programScope.supplementaryDocuments,
        ].map((document) => document.id)
      : [],
  );
  const expectedDecisionIdentifiers = new Set(
    programScope?.schemaVersion === 3
      ? programScope.projectDocumentDecisionContract.trackedDecisions.map(
          (decision) => decision.decisionIdentifier,
        )
      : [],
  );
  const projectDocumentSelection = programScope?.schemaVersion === 3
    ? linearProjectDocumentCaptureSelection(
      documentNodes,
      expectedProjectDocumentIds,
      governedProjectIds,
      programScope.canonicalProjectDocuments,
      programScope.supplementaryDocuments,
    )
    : { governed: [], conflicts: [] };
  const program = programScope
    ? {
        initiatives: initiativeNodes
          .filter((initiative) => initiative.archivedAt === null)
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
        ...(programScope.schemaVersion === 3
          ? {
              projectDocuments: projectDocumentSelection.governed
                .map((document) =>
                  linearProjectDocumentFingerprint(
                    { ...document, content: document.content ?? null },
                    descriptionFingerprint,
                    linearPlanningSectionHeadings,
                  )
                )
                .sort((left, right) => left.id.localeCompare(right.id)),
              projectDocumentConflicts: projectDocumentSelection.conflicts
                .sort((left, right) => left.id.localeCompare(right.id)),
              decisionIssues: issueNodes
                .filter((issue) => expectedDecisionIdentifiers.has(issue.identifier))
                .map((issue) => ({
                  identifier: issue.identifier,
                  title: issue.title,
                  url: issue.url,
                  descriptionFingerprint: descriptionFingerprint(issue.description),
                  sectionHeadings: linearPlanningSectionHeadings(issue.description),
                  archivedAt: issue.archivedAt,
                  stateType: issue.state.type,
                  labels: issue.labels.nodes
                    .map((label) => ({
                      id: label.id,
                      name: label.name,
                      groupId: label.parent?.id ?? "",
                      groupName: label.parent?.name ?? "",
                    }))
                    .sort((left, right) => left.id.localeCompare(right.id)),
                  projectId: issue.project?.id ?? null,
                  relations: [...(relationsByIssue.get(issue.identifier) ?? [])]
                    .sort(),
                }))
                .sort((left, right) =>
                  left.identifier.localeCompare(right.identifier)
                ),
            }
          : {}),
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
  if (programScope) {
    assertLinearPlanningContractFingerprints(programScope, fingerprint);
  }
  const rawDocumentIds = new Set(
    programScope
      ? [
          programScope.planningDocument.id,
          ...(programScope.schemaVersion === 3
            ? [
                ...programScope.canonicalProjectDocuments,
                ...programScope.supplementaryDocuments,
              ].map((document) => document.id)
            : []),
        ]
      : documentNodes.map((document) => document.id),
  );
  const enhancedArtifacts = coverageState
    ? buildNativeCaptureArtifacts(
        organization!,
        issueNodes,
        labelNodes,
        teamNodes,
        workflowStateNodes,
        userNodes,
        initiativeNodes,
        projectCatalogNodes,
        pipelineNodes,
        releaseNodes,
        projectMilestoneNodes,
        cycleNodes,
        documentNodes,
        fingerprint,
        coverageState,
        rawDocumentIds,
      )
    : null;
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
    ...(enhancedArtifacts ?? {}),
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
  if (JSON.stringify(first.nativeIdentity) !== JSON.stringify(second.nativeIdentity)) {
    throw new Error(
      "Linear native identity changed between bounded consistency reads; no capture was accepted",
    );
  }
  if (JSON.stringify(first.documents) !== JSON.stringify(second.documents)) {
    throw new Error(
      "Linear raw documents changed between bounded consistency reads; no capture was accepted",
    );
  }
  return second;
}

export async function fetchConsistentLinearCapture(
  fetcher: typeof fetch,
  token: string,
  scope?: LinearFingerprintScope,
  programScope?: LinearProgramScope,
  options: LinearCaptureOptions = {},
): Promise<LinearCapture> {
  return confirmLinearCaptureConsistency(() =>
    fetchLinearCapture(fetcher, token, scope, programScope, options)
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
            ...(fingerprint.program.projectDocuments
              ? {
                  projectDocuments: [...fingerprint.program.projectDocuments]
                    .map((document) => ({
                      ...document,
                      masterSpecSections: [...document.masterSpecSections].sort(),
                      unresolvedDecisionReferences: [
                        ...document.unresolvedDecisionReferences,
                      ].sort((left, right) =>
                        left.identifier.localeCompare(right.identifier)
                      ),
                      contentPolicyFindings: [
                        ...document.contentPolicyFindings,
                      ].sort(),
                    }))
                    .sort((left, right) => left.id.localeCompare(right.id)),
                }
              : {}),
            ...(fingerprint.program.projectDocumentConflicts
              ? {
                  projectDocumentConflicts: [
                    ...fingerprint.program.projectDocumentConflicts,
                  ].sort((left, right) => left.id.localeCompare(right.id)),
                }
              : {}),
            ...(fingerprint.program.decisionIssues
              ? {
                  decisionIssues: [...fingerprint.program.decisionIssues]
                    .map((issue) => ({
                      ...issue,
                      sectionHeadings: [...issue.sectionHeadings],
                      labels: [...issue.labels].sort((left, right) =>
                        left.id.localeCompare(right.id)
                      ),
                      relations: [...issue.relations].sort(),
                    }))
                    .sort((left, right) =>
                      left.identifier.localeCompare(right.identifier)
                    ),
                }
              : {}),
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

function committedIssueFingerprint(
  issues: LinearFingerprint["issues"],
): Array<Omit<LinearFingerprint["issues"][number], "updatedAt">> {
  return issues.map((row) => {
    if (!isCanonicalUtcTimestamp(row.updatedAt)) {
      throw new Error(
        `Linear issue ${row.identifier || "unknown"} updatedAt is invalid`,
      );
    }
    const { updatedAt: _updatedAt, ...issue } = row;
    return issue;
  });
}

export function committedLinearDriftDiff(
  expected: LinearFingerprint,
  actual: LinearFingerprint,
): string[] {
  const findings: string[] = [];
  const canonicalExpected = canonicalLinearFingerprint(expected);
  const canonicalActual = canonicalLinearFingerprint(actual);
  if (
    JSON.stringify(committedIssueFingerprint(canonicalExpected.issues)) !==
      JSON.stringify(committedIssueFingerprint(canonicalActual.issues))
  ) {
    findings.push("issues differ from the committed Linear snapshot");
  }
  for (const key of [
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
