import { strict as assert } from "node:assert";
import { readFileSync } from "node:fs";
import test from "node:test";

const workflow = readFileSync(
  ".github/workflows/linear-requirement-label-replacement.yml",
  "utf8",
);
const authorityWorkflow = readFileSync(".github/workflows/linear-authority-publication.yml", "utf8");

function namedStep(name: string): string {
  const start = workflow.indexOf(`      - name: ${name}\n`);
  assert.ok(start >= 0, `${name} step is missing`);
  const end = workflow.indexOf("\n      - name:", start + 1);
  return workflow.slice(start, end < 0 ? workflow.length : end);
}

test("Requirement-label replacement is manual, main-only, read-only to GitHub, and single-flight", () => {
  assert.match(workflow, /^on:\n  workflow_dispatch:/m);
  assert.doesNotMatch(workflow, /^  (?:push|pull_request|schedule):/m);
  assert.match(workflow, /permissions:\n  actions: read\n  contents: read/);
  assert.doesNotMatch(workflow, /(?:actions|contents): write/);
  assert.match(workflow, /github\.event_name == 'workflow_dispatch'/);
  assert.match(workflow, /github\.repository == 'meetblakey\/sourcera'/);
  assert.match(workflow, /github\.ref == 'refs\/heads\/main'/);
  assert.match(workflow, /environment: linear-authority-migration/);
  assert.match(workflow, /group: linear-authority-writes-main/);
  assert.match(authorityWorkflow, /group: linear-authority-writes-main/);
  assert.match(workflow, /cancel-in-progress: false/);
  assert.match(workflow, /timeout-minutes: 120/);
});

test("workflow exposes exactly one guarded phase per dispatch", () => {
  const optionBlock = workflow.match(/options:\n((?:          - .+\n){7})/)?.[1];
  assert.equal(
    optionBlock,
    ["plan", "rename", "create", "replace", "verify", "retire", "finalize"]
      .map((mode) => `          - ${mode}\n`)
      .join(""),
  );
  assert.doesNotMatch(workflow, /apply-all|apply_all|all-phases|all_phases/);
  assert.match(workflow, /--phase "\$MODE"/);
  assert.match(workflow, /direction:[\s\S]*?options:\n          - forward\n          - compensation/);
  assert.match(workflow, /--compensate/);
});

test("workflow verifies an exact clean checkout and all repository gates", () => {
  assert.match(workflow, /persist-credentials: false/);
  assert.match(workflow, /ref: \$\{\{ github\.sha \}\}/);
  assert.match(workflow, /test "\$\(git rev-parse HEAD\)" = "\$GITHUB_SHA"/);
  assert.match(workflow, /node --import .* --test tools\/delivery\/\*\.test\.ts/);
  assert.match(workflow, /tsc --project tools\/delivery\/tsconfig\.json/);
  assert.match(workflow, /npm --prefix tools\/spec-lint run typecheck/);
  assert.match(workflow, /npm --prefix tools\/spec-lint run all/);
  assert.match(workflow, /no_legacy_drift\.ts/);
  assert.match(workflow, /appendix_j_lineage\.ts/);
  assert.match(workflow, /git ls-files --others --exclude-standard/);
});

test("plan allocates UUIDv4 and builds from a stable two-pass capture", () => {
  assert.match(workflow, /Capture fresh accepted Linear state/);
  assert.match(workflow, /--accepted-fingerprint \/tmp\/linear-requirement-label-replacement\/raw\/accepted-fingerprint\.json/);
  assert.match(workflow, /--native-identity-out \/tmp\/linear-requirement-label-replacement\/raw\/native-identity\.json/);
  assert.match(workflow, /--documents-out \/tmp\/linear-requirement-label-replacement\/raw\/documents\.json/);
  assert.match(workflow, /--capture-receipt \/tmp\/linear-requirement-label-replacement\/raw\/capture-receipt\.json/);
  assert.match(workflow, /randomUUID/);
  assert.match(workflow, /build-linear-requirement-label-replacement\.ts/);
  assert.match(workflow, /--new-label-id "\$new_label_id"/);
  assert.match(workflow, /--repository-root "\$GITHUB_WORKSPACE"/);
  assert.match(workflow, /linear-requirement-label-replacement-candidate\.json/);
});

test("finalize compares a second complete stable native capture", () => {
  assert.match(workflow, /Capture second stable final Linear state/);
  assert.match(workflow, /--out \/tmp\/linear-requirement-label-replacement\/raw\/second-accepted-fingerprint\.json/);
  assert.match(workflow, /--accepted-fingerprint \/tmp\/linear-requirement-label-replacement\/raw\/second-accepted-fingerprint\.json/);
  assert.match(workflow, /--native-identity-out \/tmp\/linear-requirement-label-replacement\/raw\/second-native-identity\.json/);
  assert.match(workflow, /--documents-out \/tmp\/linear-requirement-label-replacement\/raw\/second-documents\.json/);
  assert.match(workflow, /--receipt-out \/tmp\/linear-requirement-label-replacement\/raw\/second-capture-receipt\.json/);
  assert.match(workflow, /--second-native-identity \/tmp\/linear-requirement-label-replacement\/raw\/second-native-identity\.json/);
  assert.match(workflow, /--second-capture-receipt \/tmp\/linear-requirement-label-replacement\/raw\/second-capture-receipt\.json/);
});

test("every later phase pins candidate and predecessor artifacts before use", () => {
  assert.match(workflow, /inputs\.candidate_run_id/);
  assert.match(workflow, /inputs\.expected_candidate_artifact_digest/);
  assert.match(workflow, /inputs\.expected_candidate_root/);
  assert.match(workflow, /actions\/runs\/\$\{CANDIDATE_RUN_ID\}\/artifacts/);
  assert.match(workflow, /candidate artifact digest mismatch/);
  assert.match(workflow, /candidate_root="\$\(jq -er '\.root/);
  assert.match(workflow, /test "\$candidate_root" = "\$EXPECTED_CANDIDATE_ROOT"/);
  assert.match(workflow, /inputs\.prior_receipt_run_id/);
  assert.match(workflow, /inputs\.expected_prior_receipt_artifact_digest/);
  assert.match(workflow, /inputs\.expected_previous_receipt_root/);
  assert.match(workflow, /--previous-receipt \/tmp\/linear-requirement-label-replacement\/prior\/phase-receipt\.json/);
  assert.equal((workflow.match(/--previous-journal \/tmp\/linear-requirement-label-replacement\/prior\/phase-journal\.jsonl/g) ?? []).length, 2);
  assert.match(workflow, /--expected-previous-receipt-root "\$EXPECTED_PREVIOUS_RECEIPT_ROOT"/);
});

test("every mutation phase supports a digest-pinned journal and durable receipt resume", () => {
  assert.match(workflow, /inputs\.resume_journal_run_id/);
  assert.match(workflow, /inputs\.expected_resume_journal_artifact_digest/);
  assert.match(workflow, /--resume-journal \/tmp\/linear-requirement-label-replacement\/resume\/phase-journal\.jsonl/);
  assert.match(workflow, /--expected-resume-journal-sha256 "\$EXPECTED_RESUME_JOURNAL_SHA256"/);
  assert.match(workflow, /--resume-receipts \/tmp\/linear-requirement-label-replacement\/resume\/phase-core-receipts\.jsonl/);
  assert.match(workflow, /--expected-resume-receipts-sha256 "\$EXPECTED_RESUME_RECEIPTS_SHA256"/);
  assert.equal((workflow.match(/--chunk-receipts-out \/tmp\/linear-requirement-label-replacement\/safe\/phase-core-receipts\.jsonl/g) ?? []).length, 2);
  assert.match(workflow, /sha256sum "\$journal"/);
  assert.match(workflow, /sha256sum "\$receipts"/);
});

test("only mutation phases receive the write credential and apply flag", () => {
  assert.match(workflow, /if: contains\(fromJSON\('\["rename","create","replace","retire"\]'\), inputs\.mode\)/);
  assert.match(workflow, /LINEAR_API_KEY: \$\{\{ secrets\.LINEAR_API_KEY \}\}/);
  assert.match(workflow, /--apply/);
  assert.match(workflow, /if: contains\(fromJSON\('\["verify","finalize"\]'\), inputs\.mode\)/);
  assert.match(workflow, /env -u LINEAR_API_KEY/);
  assert.equal(
    (workflow.match(/LINEAR_API_KEY: \$\{\{ secrets\.LINEAR_API_KEY \}\}/g) ?? [])
      .length,
    3,
  );
});

test("raw captures are removed before the only safe artifact upload", () => {
  const removal = workflow.indexOf("Remove raw migration material");
  const upload = workflow.indexOf("Upload safe migration evidence");
  assert.ok(removal >= 0 && upload > removal);
  assert.match(workflow, /rm -rf \/tmp\/linear-requirement-label-replacement\/raw/);
  assert.match(workflow, /rm -rf \/tmp\/linear-requirement-label-replacement\/candidate/);
  assert.match(workflow, /rm -rf \/tmp\/linear-requirement-label-replacement\/prior/);
  assert.match(workflow, /rm -rf \/tmp\/linear-requirement-label-replacement\/resume/);
  const uploadBlock = workflow.slice(upload);
  const artifactPaths = [...uploadBlock.matchAll(/^\s+path: (.+)$/gm)].map(
    (match) => match[1],
  );
  assert.deepEqual(artifactPaths, ["/tmp/linear-requirement-label-replacement/safe/"]);
  assert.doesNotMatch(uploadBlock, /path: .*\/(?:raw|candidate|prior|resume)(?:\/|$)/);
});

test("every executable phase always uploads a redacted failure category", () => {
  assert.equal(
    (workflow.match(/--failure-summary-out \/tmp\/linear-requirement-label-replacement\/safe\/failure-summary\.json/g) ?? []).length,
    2,
  );
  assert.match(workflow, /if: always\(\)[\s\S]*path: \/tmp\/linear-requirement-label-replacement\/safe\//);
  assert.match(workflow, /name: Persist redacted workflow failure summary/);
  assert.match(workflow, /if: failure\(\)/);
  assert.match(workflow, /test -e .*failure-summary\.json/);
  for (const step of ["capture_first", "capture_second", "build_candidate", "validate_candidate", "apply_phase", "verify_phase"]) {
    assert.match(workflow, new RegExp(`steps\\.${step}\\.outcome`));
  }
});

test("later phases accept same-HEAD candidates or one exact diagnostic control transition", () => {
  for (const input of [
    "control_transition_source", "control_transition_head",
    "control_transition_before_root", "control_transition_after_root",
  ]) {
    assert.match(workflow, new RegExp(`inputs\\.${input}`));
  }
  assert.equal((workflow.match(/--control-transition-source "\$CONTROL_TRANSITION_SOURCE"/g) ?? []).length, 2);
  assert.equal((workflow.match(/--control-transition-candidate-root "\$EXPECTED_CANDIDATE_ROOT"/g) ?? []).length, 2);
  assert.equal((workflow.match(/--control-transition-head "\$CONTROL_TRANSITION_HEAD"/g) ?? []).length, 2);
  assert.equal((workflow.match(/--control-transition-before-root "\$CONTROL_TRANSITION_BEFORE_ROOT"/g) ?? []).length, 2);
  assert.equal((workflow.match(/--control-transition-after-root "\$CONTROL_TRANSITION_AFTER_ROOT"/g) ?? []).length, 2);
  assert.match(workflow, /transition_value_count" -eq 0 \|\| "\$transition_value_count" -eq 4/);
  assert.match(workflow, /control transition inputs must be empty or one exact set/);
  assert.equal((workflow.match(/if \[\[ -n "\$CONTROL_TRANSITION_SOURCE" \]\]; then/g) ?? []).length, 2);

  for (const name of ["Apply exactly one mutation phase", "Verify exactly one credential-free phase"]) {
    const block = namedStep(name);
    const env = block.slice(block.indexOf("        env:\n"), block.indexOf("        run: |\n"));
    for (const variable of [
      "CONTROL_TRANSITION_SOURCE", "CONTROL_TRANSITION_HEAD",
      "CONTROL_TRANSITION_BEFORE_ROOT", "CONTROL_TRANSITION_AFTER_ROOT",
    ]) {
      assert.match(env, new RegExp(`^          ${variable}: \\$\\{\\{ inputs\\.`, "m"));
      assert.match(block, new RegExp(`\\$${variable}`));
    }
  }
  assert.doesNotMatch(namedStep("Verify pinned resume artifact metadata"), /CONTROL_TRANSITION_/);
});
