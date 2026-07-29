import { strict as assert } from "node:assert";
import { readFileSync } from "node:fs";
import test from "node:test";

const workflow = readFileSync(
  ".github/workflows/linear-authority-publication.yml",
  "utf8",
);

test("authority workflow is manual, main-only, bounded, and single-flight", () => {
  assert.match(workflow, /^on:\n  workflow_dispatch:/m);
  assert.doesNotMatch(workflow, /^  (?:push|pull_request|schedule):/m);
  assert.match(workflow, /github\.repository == 'meetblakey\/sourcera'/);
  assert.match(workflow, /github\.ref == 'refs\/heads\/main'/);
  assert.match(workflow, /environment: linear-authority-migration/);
  assert.match(workflow, /group: linear-authority-writes-main/);
  assert.match(workflow, /cancel-in-progress: false/);
  assert.match(workflow, /timeout-minutes: 120/);
  assert.match(workflow, /permissions:\n  actions: read\n  contents: read/);
  assert.doesNotMatch(workflow, /contents: write/);
  assert.match(workflow, /Re-verify exact main checkout after gates/);
  assert.match(workflow, /persist-credentials: false/);
  assert.match(workflow, /test "\$GITHUB_REF" = "refs\/heads\/main"/);
  assert.match(workflow, /git ls-files --others --exclude-standard/);
});

test("authority workflow exposes only the guarded baseline, dry-run, and apply modes", () => {
  const optionBlock = workflow.match(/options:\n((?:          - .+\n){3})/)?.[1];
  assert.equal(
    optionBlock,
    "          - baseline\n          - dry-run\n          - apply\n",
  );
  assert.match(workflow, /Apply requires the exact compiled dry-run plan root/);
  assert.match(workflow, /EXPECTED_PLAN_ROOT/);
  assert.match(workflow, /--pre-cutover-tag pre-linear-authority-2026-07-27/);
});

test("authority workflow captures and validates before obtaining a write credential", () => {
  assert.match(workflow, /--accepted-fingerprint \/tmp\/linear-authority\/raw\/accepted-fingerprint\.json/);
  assert.match(workflow, /--capture-receipt \/tmp\/linear-authority\/raw\/capture-receipt\.json/);
  assert.match(workflow, /env -u LINEAR_API_KEY[\s\S]*--package-dir \/tmp\/linear-authority\/package/);
  assert.match(workflow, /jq -e '\.mode == "dry-run" and \.status == "validated_dry_run"'/);
  assert.equal((workflow.match(/\n\s+--apply \\\n/g) ?? []).length, 2);
  assert.match(workflow, /--program-scope-out \/tmp\/linear-authority\/safe\/linear-program-scope-candidate\.json/);
  assert.match(workflow, /build-linear-authority-label-bootstrap\.ts/);
  assert.match(workflow, /linear-authority-label-bootstrap-candidate\.json/);
  assert.match(workflow, /status: "label_bootstrap_required"/);
  assert.match(workflow, /Review the uploaded mutation-disabled candidate/);
  assert.match(workflow, /exit 2/);
  assert.match(workflow, /\.readyForBaseline == true and \.createLabels == \[\]/);
  assert.match(workflow, /\.requirements == 186/);
  assert.match(workflow, /\.labelContractRoot \| test\("\^\[a-f0-9\]\{64\}\$"\)/);
  assert.match(workflow, /Verify pinned Requirement migration finalize artifact metadata/);
  assert.match(workflow, /expected_migration_artifact_digest/);
  assert.match(workflow, /expected_migration_candidate_root/);
  assert.match(workflow, /expected_migration_finalize_receipt_root/);
  assert.match(workflow, /--migration-candidate \/tmp\/linear-authority\/migration\/linear-requirement-label-replacement-candidate\.json/);
  assert.match(workflow, /--migration-finalize-receipt \/tmp\/linear-authority\/migration\/phase-receipt\.json/);
});

test("authority workflow proves a fresh stable readback with zero applied writes", () => {
  assert.match(workflow, /Capture stable post-apply Linear state/);
  assert.match(workflow, /--out \/tmp\/linear-authority\/raw\/post-accepted-fingerprint\.json/);
  assert.match(workflow, /test "\$post_desired_root" = "\$\(cat \/tmp\/linear-authority\/safe\/desired-authority-root\.txt\)"/);
  assert.match(workflow, /'\.operations \| length == 0'/);
  assert.match(workflow, /\.applied == 0/);
  assert.match(workflow, /--max-http-attempts 1000/);
  assert.match(workflow, /linear-authority-requirement-baseline-post-apply\.json/);
  assert.match(workflow, /--capture-receipt \/tmp\/linear-authority\/raw\/post-capture-receipt\.json/);
  assert.match(workflow, /\.requirements == 926/);
  assert.match(workflow, /cmp --silent delivery\/linear-program-scope\.json \/tmp\/linear-authority\/safe\/linear-program-scope-post-apply\.json/);
  assert.match(workflow, /Capture final stable Linear state/);
  assert.match(workflow, /--out \/tmp\/linear-authority\/raw\/final-accepted-fingerprint\.json/);
  assert.match(workflow, /linear-authority-requirement-baseline-final\.json/);
  assert.match(workflow, /cmp --silent \/tmp\/linear-authority\/safe\/linear-authority-requirement-baseline-post-apply\.json \/tmp\/linear-authority\/safe\/linear-authority-requirement-baseline-final\.json/);
  assert.match(workflow, /cmp --silent \/tmp\/linear-authority\/safe\/linear-program-scope-post-apply\.json \/tmp\/linear-authority\/safe\/linear-program-scope-final\.json/);
  assert.match(workflow, /final_desired_root/);
  assert.match(workflow, /final-package\/operations\.json/);
  assert.match(workflow, /\.operationCount == 0/);
  assert.equal(
    (workflow.match(/--bootstrap-map delivery\/linear-authority-requirement-bootstrap-map\.json/g) ?? []).length,
    3,
  );
  assert.equal(
    (workflow.match(/--program-scope-out \/tmp\/linear-authority\/safe\/linear-program-scope-/g) ?? []).length,
    3,
  );
});

test("authority workflow never uploads raw capture or package material", () => {
  assert.match(workflow, /rm -rf \/tmp\/linear-authority\/raw/);
  assert.match(workflow, /rm -rf \/tmp\/linear-authority\/package/);
  assert.match(workflow, /rm -rf \/tmp\/linear-authority\/post-package/);
  assert.match(workflow, /rm -rf \/tmp\/linear-authority\/final-package/);
  const artifactPaths = [...workflow.matchAll(/^\s+path: (.+)$/gm)].map(
    (match) => match[1],
  );
  assert.deepEqual(artifactPaths, ["/tmp/linear-authority/safe/"]);
  assert.doesNotMatch(workflow, /path: .*\/(?:raw|package|post-package)(?:\/|$)/);
});
