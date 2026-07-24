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
    /tools\/delivery\/linear-fingerprint-overlay\.ts --snapshot delivery\/linear-snapshot\.json --fingerprint \/tmp\/linear-fingerprint\.json --receipt \/tmp\/linear-capture-receipt\.json --linear-project-scope delivery\/linear-project-scope\.json --out \/tmp\/linear-snapshot-candidate\.json/,
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
  const uploadIndex = manualCapture.indexOf(uploadArtifact);
  assert.ok(overlayIndex >= 0);
  assert.ok(validationIndex > overlayIndex);
  assert.ok(uploadIndex > validationIndex);
  const uploadBlocks = workflow
    .split(/^      - /m)
    .slice(1)
    .map((block) => `      - ${block}`)
    .filter((block) => block.includes(`uses: ${uploadArtifact}`));
  assert.equal(uploadBlocks.length, 2);
  const allowed = new Set([
    "/tmp/linear-fingerprint.json",
    "/tmp/linear-capture-receipt.json",
    "/tmp/linear-ticket-integrity.json",
    "/tmp/linear-snapshot-candidate.json",
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
  assert.match(uploadBlocks[0], /\/tmp\/linear-snapshot-candidate\.json/);
});
