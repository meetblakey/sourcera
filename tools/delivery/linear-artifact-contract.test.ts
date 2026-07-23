import { strict as assert } from "node:assert";
import { readFileSync } from "node:fs";
import test from "node:test";

const workflow = readFileSync(
  ".github/workflows/delivery-integrity.yml",
  "utf8",
);
const uploadArtifact =
  "actions/upload-artifact@043fb46d1a93c77aae656e7c1c64a875d1fc6a0a";

test("keeps raw Linear descriptions runner-local and uploads only proof artifacts", () => {
  assert.match(
    workflow,
    /--descriptions-out \/tmp\/linear-ticket-descriptions\.json/,
  );
  assert.match(
    workflow,
    /name: Remove raw Linear descriptions\s+run: rm -f \/tmp\/linear-ticket-descriptions\.json/,
  );
  assert.match(
    workflow,
    /tools\/delivery\/linear-fingerprint-overlay\.ts --snapshot delivery\/linear-snapshot\.json --fingerprint \/tmp\/linear-fingerprint\.json --receipt \/tmp\/linear-capture-receipt\.json --linear-project-scope delivery\/linear-project-scope\.json --dispositions delivery\/dispositions\.json --stamp \/tmp\/linear-runtime-stamp\.json --runtime-dependencies delivery\/runtime-gate-dependencies\.json --releases delivery\/releases\.json --out \/tmp\/linear-snapshot-candidate\.json --candidate-receipt-out \/tmp\/linear-candidate-receipt\.json/,
  );
  assert.match(
    workflow,
    /tools\/delivery\/validate-linear-candidate\.ts --candidate \/tmp\/linear-snapshot-candidate\.json --releases delivery\/releases\.json/,
  );
  const manualCapture = workflow.slice(
    workflow.indexOf("  linear-capture:"),
    workflow.indexOf("  linear-drift:"),
  );
  const overlayIndex = manualCapture.indexOf(
    "tools/delivery/linear-fingerprint-overlay.ts",
  );
  const validationIndex = manualCapture.indexOf(
    "tools/delivery/validate-linear-candidate.ts",
  );
  const promotionIndex = manualCapture.indexOf(
    "tools/delivery/promote-linear-candidate.ts",
  );
  const handoffIndex = manualCapture.indexOf(
    "install -m 0600 delivery/linear-snapshot.json /tmp/linear-snapshot-handoff.json",
  );
  const uploadIndex = manualCapture.indexOf(uploadArtifact);
  assert.ok(overlayIndex >= 0);
  assert.ok(validationIndex > overlayIndex);
  assert.ok(promotionIndex > validationIndex);
  assert.ok(handoffIndex > promotionIndex);
  assert.ok(uploadIndex > handoffIndex);
  for (const required of [
    "--snapshot delivery/linear-snapshot.json",
    "--candidate /tmp/linear-snapshot-candidate.json",
    "--fingerprint /tmp/linear-fingerprint.json",
    "--capture-receipt /tmp/linear-capture-receipt.json",
    "--candidate-receipt /tmp/linear-candidate-receipt.json",
    "--linear-project-scope delivery/linear-project-scope.json",
    "--linear-program-scope delivery/linear-program-scope.json",
    "--source-policy delivery/linear-source-policy.json",
    "--inventory _audit/FEATURE_INVENTORY.md",
    "--source-checksums delivery/ticket-source-checksums.json",
    "--dispositions delivery/dispositions.json",
    "--stamp /tmp/linear-runtime-stamp.json",
    "--runtime-dependencies delivery/runtime-gate-dependencies.json",
    "--releases delivery/releases.json",
  ]) {
    assert.match(
      manualCapture.slice(promotionIndex, uploadIndex),
      new RegExp(required.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")),
    );
  }
  assert.match(workflow, /^permissions:\s+contents: read$/m);
  assert.doesNotMatch(manualCapture, /git (?:add|commit|push)|contents: write/);
  for (const required of [
    "name: Linear snapshot validation-only handoff",
    "name: Validate guarded promotion in ephemeral checkout",
    "name: Stage exact attested snapshot handoff",
    "cmp -s delivery/linear-snapshot.json /tmp/linear-snapshot-candidate.json",
    "linear-snapshot-validation-handoff-${{ github.sha }}-${{ github.run_id }}-${{ github.run_attempt }}",
    "overwrite: false",
    "retention-days: 90",
  ]) {
    assert.match(
      manualCapture,
      new RegExp(required.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")),
    );
  }
  const uploadBlocks = workflow
    .split(/^      - /m)
    .slice(1)
    .map((block) => `      - ${block}`)
    .filter((block) => block.includes(`uses: ${uploadArtifact}`));
  assert.equal(uploadBlocks.length, 3);
  const allowed = new Set([
    "/tmp/linear-fingerprint.json",
    "/tmp/linear-capture-receipt.json",
    "/tmp/linear-runtime-stamp.json",
    "/tmp/linear-exact-status.json",
    "/tmp/linear-ticket-integrity.json",
    "/tmp/linear-snapshot-handoff.json",
    "/tmp/linear-candidate-receipt.json",
    "/tmp/linear-publication",
  ]);
  for (const block of uploadBlocks) {
    assert.doesNotMatch(block, /linear-ticket-descriptions\.json/);
    assert.doesNotMatch(block, /\/tmp\/\*/);
    const uploadedPaths = [...block.matchAll(/^\s{12}(\/tmp\/\S+)$/gm)].map(
      (match) => match[1],
    );
    assert.ok(uploadedPaths.length);
    for (const path of uploadedPaths) assert.ok(allowed.has(path), path);
  }
  assert.match(uploadBlocks[0], /\/tmp\/linear-snapshot-handoff\.json/);
  assert.match(uploadBlocks[0], /\/tmp\/linear-candidate-receipt\.json/);
  assert.match(uploadBlocks[0], /\/tmp\/linear-runtime-stamp\.json/);
  assert.match(uploadBlocks[0], /\/tmp\/linear-exact-status\.json/);
  assert.doesNotMatch(uploadBlocks[0], /\/tmp\/linear-snapshot-candidate\.json/);
});

test("publishes a receipt-bound review package from the downloaded handoff", () => {
  const publication = workflow.slice(
    workflow.indexOf("  linear-publication:"),
    workflow.indexOf("  linear-drift:"),
  );
  for (const required of [
    "needs: linear-capture",
    "actions/download-artifact@",
    "linear-snapshot-validation-handoff-${{ github.sha }}-${{ github.run_id }}-${{ github.run_attempt }}",
    "tools/delivery/prepare-linear-publication.ts",
    "--exact /tmp/linear-handoff/linear-exact-status.json",
    "LINEAR_HANDOFF_ARTIFACT_DIGEST: ${{ needs.linear-capture.outputs.artifact-digest }}",
    "linear-reviewable-publication-${{ github.sha }}-${{ github.run_id }}-${{ github.run_attempt }}",
    "/tmp/linear-publication",
  ]) {
    assert.match(
      publication,
      new RegExp(required.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")),
    );
  }
  assert.doesNotMatch(publication, /LINEAR_API_KEY|git (?:add|commit|push)|gh pr/);
});
