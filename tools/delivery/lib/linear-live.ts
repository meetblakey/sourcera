import { createHash } from "node:crypto";

const ENDPOINT = "https://api.linear.app/graphql";

const ISSUE_QUERY = `
  query DeliveryIssues($after: String) {
    issues(first: 50, after: $after, includeArchived: true) {
      nodes {
        id
        identifier
        title
        description
        updatedAt
        estimate
        state { name type }
        labels(first: 20) { nodes { name } }
        assignee { name }
        team { key }
        project { name }
        projectMilestone { name }
        parent { identifier }
        releases(first: 10) { nodes { id version } }
        relations(first: 20) {
          nodes { type issue { identifier } relatedIssue { identifier } }
        }
        inverseRelations(first: 20) {
          nodes { type issue { identifier } relatedIssue { identifier } }
        }
      }
      pageInfo { hasNextPage endCursor }
    }
  }
`;

const PIPELINE_QUERY = `
  query DeliveryPipelines($after: String) {
    releasePipelines(first: 50, after: $after, includeArchived: true) {
      nodes {
        id
        name
        updatedAt
        type
        isProduction
        teams(first: 20) { nodes { key } }
        stages(first: 20) { nodes { id name type } }
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
        version
        updatedAt
        pipeline { id }
        stage { id type }
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

interface IssueNode {
  id: string;
  identifier: string;
  title: string;
  description: string | null;
  updatedAt: string;
  estimate: number | null;
  state: { name: string; type: string };
  labels: { nodes: Array<{ name: string }> };
  assignee: { name: string } | null;
  team: { key: string };
  project: { name: string } | null;
  projectMilestone: { name: string } | null;
  parent: { identifier: string } | null;
  releases: { nodes: Array<{ id: string; version: string | null }> };
  relations: { nodes: RelationNode[] };
  inverseRelations: { nodes: RelationNode[] };
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
  type: string;
  isProduction: boolean;
  teams: { nodes: Array<{ key: string }> };
  stages: { nodes: Array<{ id: string; name: string; type: string }> };
}

interface ReleaseNode {
  id: string;
  name: string;
  version: string | null;
  updatedAt: string;
  pipeline: { id: string };
  stage: { id: string; type: string };
}

export interface LinearFingerprint {
  issues: Array<{
    uuid: string;
    identifier: string;
    title: string;
    descriptionHash: string;
    updatedAt: string;
    estimate: number | null;
    state: string;
    stateType: string;
    labels: string[];
    assignee: string | null;
    team: string;
    project: string | null;
    milestone: string | null;
    parent: string | null;
    releases: string[];
    relations: string[];
  }>;
  releasePipelines: Array<{
    id: string;
    name: string;
    updatedAt: string;
    type: string;
    isProduction: boolean;
    teams: string[];
    stages: Array<{ id: string; name: string; type: string }>;
  }>;
  releases: Array<{
    id: string;
    name: string;
    version: string | null;
    updatedAt: string;
    pipeline: string;
    stage: string;
    stageType: string;
  }>;
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
    throw new Error(`Linear HTTP ${response.status}`);
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
    const data: Record<string, Connection<T>> = await request<
      Record<string, Connection<T>>
    >(
      fetcher,
      token,
      query,
      after,
    );
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

function hash(value: string | null): string {
  return createHash("sha256").update(value ?? "").digest("hex");
}

function relationKey(relation: RelationNode): string {
  return `${relation.type}:${relation.issue.identifier}:${relation.relatedIssue.identifier}`;
}

export async function fetchLinearFingerprint(
  fetcher: typeof fetch,
  token: string,
): Promise<LinearFingerprint> {
  if (!token) throw new Error("LINEAR_API_KEY is required");
  const [issueNodes, pipelineNodes, releaseNodes] = await Promise.all([
    paginate<IssueNode>(fetcher, token, ISSUE_QUERY, "issues"),
    paginate<PipelineNode>(
      fetcher,
      token,
      PIPELINE_QUERY,
      "releasePipelines",
    ),
    paginate<ReleaseNode>(fetcher, token, RELEASE_QUERY, "releases"),
  ]);
  return {
    issues: issueNodes
      .map((issue) => ({
        uuid: issue.id,
        identifier: issue.identifier,
        title: issue.title,
        descriptionHash: hash(issue.description),
        updatedAt: issue.updatedAt,
        estimate: issue.estimate,
        state: issue.state.name,
        stateType: issue.state.type,
        labels: issue.labels.nodes.map((label) => label.name).sort(),
        assignee: issue.assignee?.name ?? null,
        team: issue.team.key,
        project: issue.project?.name ?? null,
        milestone: issue.projectMilestone?.name ?? null,
        parent: issue.parent?.identifier ?? null,
        releases: issue.releases.nodes
          .map((release) => release.version ?? release.id)
          .sort(),
        relations: [
          ...issue.relations.nodes,
          ...issue.inverseRelations.nodes,
        ]
          .map(relationKey)
          .filter((value, index, values) => values.indexOf(value) === index)
          .sort(),
      }))
      .sort((left, right) => left.identifier.localeCompare(right.identifier)),
    releasePipelines: pipelineNodes
      .map((pipeline) => ({
        id: pipeline.id,
        name: pipeline.name,
        updatedAt: pipeline.updatedAt,
        type: pipeline.type,
        isProduction: pipeline.isProduction,
        teams: pipeline.teams.nodes.map((team) => team.key).sort(),
        stages: pipeline.stages.nodes
          .map((stage) => ({ ...stage }))
          .sort((left, right) => left.id.localeCompare(right.id)),
      }))
      .sort((left, right) => left.id.localeCompare(right.id)),
    releases: releaseNodes
      .map((release) => ({
        id: release.id,
        name: release.name,
        version: release.version,
        updatedAt: release.updatedAt,
        pipeline: release.pipeline.id,
        stage: release.stage.id,
        stageType: release.stage.type,
      }))
      .sort((left, right) => left.id.localeCompare(right.id)),
  };
}

export function fingerprintDiff(
  expected: LinearFingerprint,
  actual: LinearFingerprint,
): string[] {
  const findings: string[] = [];
  for (const key of [
    "issues",
    "releasePipelines",
    "releases",
  ] as const) {
    if (JSON.stringify(expected[key]) !== JSON.stringify(actual[key])) {
      findings.push(`${key} differ from the committed Linear snapshot`);
    }
  }
  return findings;
}
