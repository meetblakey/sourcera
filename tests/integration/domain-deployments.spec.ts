import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { access, readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

import type { SourceraDomain } from "../../packages/domain/src/index";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
);
const execFileAsync = promisify(execFile);

async function readJson(relativePath: string) {
  return JSON.parse(
    await readFile(path.join(repositoryRoot, relativePath), "utf8"),
  ) as Record<string, unknown>;
}

test("the repository declares the three application workspaces", async () => {
  const packageJson = await readJson("package.json");

  assert.deepEqual(packageJson.workspaces, ["apps/*", "packages/*"]);
  assert.equal(packageJson.name, "@sourcera/marketplace");
  assert.equal(
    (packageJson.scripts as Record<string, string>)["validate:boundaries"],
    "tsx scripts/validate-domain-boundaries.ts",
  );
});

test("buyer and seller are independent Next.js applications", async () => {
  for (const domain of ["buyer", "seller"] as const) {
    const packageJson = await readJson(`apps/${domain}/package.json`);
    const scripts = packageJson.scripts as Record<string, string>;

    assert.equal(packageJson.name, `@sourcera/${domain}`);
    assert.equal(scripts.build, "next build");
    assert.equal(
      scripts["validate:deploy"],
      `tsx ../../scripts/validate-deploy-env.ts --domain ${domain}`,
    );

    await access(path.join(repositoryRoot, `apps/${domain}/app/page.tsx`));
    await access(
      path.join(repositoryRoot, `apps/${domain}/app/api/health/route.ts`),
    );
    await access(path.join(repositoryRoot, `apps/${domain}/next.config.ts`));
  }
});

test("cross-domain contracts have one shared package", async () => {
  const packageJson = await readJson("packages/domain/package.json");

  assert.equal(packageJson.name, "@sourcera/domain");
  await access(path.join(repositoryRoot, "packages/domain/src/index.ts"));
});

test("each health route returns its own domain receipt", async () => {
  const previous = {
    commitSha: process.env.SOURCERA_COMMIT_SHA,
    domain: process.env.SOURCERA_DOMAIN,
    environment: process.env.SOURCERA_ENV,
  };

  try {
    process.env.SOURCERA_COMMIT_SHA =
      "0123456789abcdef0123456789abcdef01234567";
    process.env.SOURCERA_ENV = "test";

    for (const domain of ["buyer", "seller"] as SourceraDomain[]) {
      process.env.SOURCERA_DOMAIN = domain;
      const route = await import(
        `../../apps/${domain}/app/api/health/route.ts?domain=${domain}`
      );
      const response = await route.GET();
      const body = (await response.json()) as Record<string, string>;

      assert.equal(response.headers.get("cache-control"), "no-store");
      assert.equal(body.domain, domain);
      assert.equal(body.commitSha, process.env.SOURCERA_COMMIT_SHA);
    }
  } finally {
    restoreEnvironment("SOURCERA_COMMIT_SHA", previous.commitSha);
    restoreEnvironment("SOURCERA_DOMAIN", previous.domain);
    restoreEnvironment("SOURCERA_ENV", previous.environment);
  }
});

test("deploy validation rejects a console/domain mismatch", async () => {
  await assert.rejects(
    execFileAsync(
      path.join(repositoryRoot, "node_modules/.bin/tsx"),
      ["scripts/validate-deploy-env.ts", "--domain", "buyer"],
      {
        cwd: repositoryRoot,
        env: {
          ...process.env,
          SOURCERA_COMMIT_SHA:
            "0123456789abcdef0123456789abcdef01234567",
          SOURCERA_DOMAIN: "seller",
          SOURCERA_ENV: "staging",
        },
      },
    ),
    /expected buyer, received seller/,
  );
});

test("CI validates every deployment identity", async () => {
  const workflow = await readFile(
    path.join(repositoryRoot, ".github/workflows/app-ci.yml"),
    "utf8",
  );
  const environmentExample = await readFile(
    path.join(repositoryRoot, ".env.example"),
    "utf8",
  );

  for (const domain of ["marketplace", "buyer", "seller"] as const) {
    assert.match(workflow, new RegExp(`SOURCERA_DOMAIN: ${domain}`));
  }
  assert.match(
    workflow,
    /npm run validate:deploy --workspace @sourcera\/buyer/,
  );
  assert.match(
    workflow,
    /npm run validate:deploy --workspace @sourcera\/seller/,
  );
  assert.match(environmentExample, /^SOURCERA_DOMAIN=$/m);
});

function restoreEnvironment(key: string, value: string | undefined) {
  if (value === undefined) {
    delete process.env[key];
    return;
  }
  process.env[key] = value;
}
