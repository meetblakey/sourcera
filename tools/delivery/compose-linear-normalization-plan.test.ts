import { strict as assert } from "node:assert";
import { createHash } from "node:crypto";
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";

function fixture() {
  const root = mkdtempSync(join(tmpdir(), "sourcera-linear-compose-"));
  mkdirSync(join(root, "plans"));
  const paths = {
    append: join(root, "plans", "append.json"),
    base: join(root, "plans", "base.json"),
    out: join(root, "composed.json"),
    overlay: join(root, "plans", "overlay.json"),
    publication: join(root, "publication.json"),
  };
  writeFileSync(paths.base, JSON.stringify({
    updates: [
      {
        issueId: "BUY-2",
        classification: "feature",
        before: { descriptionSha256: "b".repeat(64) },
        after: { title: "Base two", description: "Base two description" },
      },
      {
        issueId: "PLA-10",
        classification: "runtime_gate",
        before: { title: "Prior ten", descriptionSha256: "a".repeat(64) },
        after: { title: "Base ten", description: "Base ten description" },
      },
    ],
  }));
  writeFileSync(paths.overlay, JSON.stringify({
    updates: [
      {
        lookupId: "PLA-10",
        title: "Overlay ten",
        description: "Overlay ten description",
        fieldsToWrite: ["title", "description"],
        preserveNativeFieldsAndRelations: true,
      },
      {
        lookupId: "SEL-3",
        updatePayload: { title: "Overlay three", description: "Overlay three description" },
        fieldsToWrite: ["title", "description"],
        preserveNativeFieldsAndRelations: true,
      },
    ],
  }));
  writeFileSync(paths.append, JSON.stringify({
    updates: [{ issueId: "INT-1", after: { title: "Append one", description: "Append one description" } }],
  }));
  return paths;
}

function run(paths: ReturnType<typeof fixture>, extras: string[] = [], expected = "4") {
  return spawnSync(
    process.execPath,
    [
      "--import", "./tools/spec-lint/node_modules/tsx/dist/loader.mjs",
      "tools/delivery/compose-linear-normalization-plan.ts",
      "--base", paths.base,
      "--overlay", paths.overlay,
      "--append", paths.append,
      "--out", paths.out,
      "--publication-out", paths.publication,
      "--expected-updates", expected,
      ...extras,
    ],
    { cwd: process.cwd(), encoding: "utf8" },
  );
}

test("composes overlays and disjoint appends into stable publication payloads", () => {
  const paths = fixture();
  const result = run(paths);
  assert.equal(result.status, 0, result.stderr);
  const plan = JSON.parse(readFileSync(paths.out, "utf8"));
  const publication = JSON.parse(readFileSync(paths.publication, "utf8"));
  assert.deepEqual(plan.updates.map((row: { issueId: string }) => row.issueId), ["PLA-10", "BUY-2", "SEL-3", "INT-1"]);
  assert.equal(plan.updates[0].title, "Overlay ten");
  assert.equal(plan.updates[0].before, undefined);
  assert.deepEqual(plan.updates[1].before, { descriptionSha256: "b".repeat(64) });
  assert.deepEqual(plan.summary, {
    baseUpdateCount: 2,
    overlaidBaseCount: 1,
    addedOverlayCount: 1,
    appendedCount: 1,
    finalUpdateCount: 4,
    updatesSha256: plan.summary.updatesSha256,
  });
  assert.match(plan.summary.updatesSha256, /^[a-f0-9]{64}$/);
  assert.deepEqual(publication.fieldsToWrite, ["title", "description"]);
  assert.equal(publication.preserveNativeFieldsAndRelations, true);
  assert.deepEqual(Object.keys(publication.updates[0]).sort(), [
    "description",
    "descriptionSha256",
    "issueId",
    "title",
    "titleSha256",
  ]);
  assert.equal(
    publication.updates[0].descriptionSha256,
    createHash("sha256").update("Overlay ten description").digest("hex"),
  );
  assert.equal(publication.updates.some((row: Record<string, unknown>) => "before" in row), false);
});

test("rejects malformed prior description hashes", () => {
  const paths = fixture();
  const base = JSON.parse(readFileSync(paths.base, "utf8"));
  base.updates[0].before = { descriptionSha256: "not-a-sha" };
  writeFileSync(paths.base, JSON.stringify(base));
  const result = run(paths);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /invalid prior description SHA-256/);
});

test("rejects append collisions", () => {
  const paths = fixture();
  writeFileSync(paths.append, JSON.stringify({
    updates: [{ issueId: "BUY-2", after: { title: "Collision", description: "Collision description" } }],
  }));
  const result = run(paths);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /Append input collides with BUY-2/);
});

test("rejects duplicate overlay IDs across overlay inputs", () => {
  const paths = fixture();
  const secondOverlay = join(tmpdir(), `second-overlay-${Date.now()}.json`);
  writeFileSync(secondOverlay, JSON.stringify({
    updates: [{ lookupId: "PLA-10", title: "Again", description: "Again description" }],
  }));
  const result = run(paths, ["--overlay", secondOverlay]);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /Overlay inputs duplicate PLA-10/);
});

test("rejects special packs that declare native fields for publication", () => {
  const paths = fixture();
  writeFileSync(paths.overlay, JSON.stringify({
    updates: [{
      lookupId: "PLA-10",
      title: "Unsafe",
      description: "Unsafe description",
      fieldsToWrite: ["title", "description", "project"],
    }],
  }));
  const result = run(paths);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /declares fields other than title and description/);
});

test("rejects a wrong expected final count", () => {
  const paths = fixture();
  const result = run(paths, [], "99");
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /Expected 99 updates, composed 4/);
});

test("rejects manual acceptance-criteria references and dangling source fragments", () => {
  const paths = fixture();
  writeFileSync(paths.overlay, JSON.stringify({
    updates: [{
      lookupId: "PLA-10",
      title: "Unsafe source prose",
      description: "The timeout follows AC #7 and the remaining values live in.",
      fieldsToWrite: ["title", "description"],
      preserveNativeFieldsAndRelations: true,
    }],
  }));
  const result = run(paths);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /manual acceptance-criteria reference/);
});

test("rejects manual title prefixes", () => {
  const paths = fixture();
  writeFileSync(paths.overlay, JSON.stringify({
    updates: [{
      lookupId: "PLA-10",
      title: "[F-003.C] Unsafe title",
      description: "Complete exact behavior without a manual source reference.",
      fieldsToWrite: ["title", "description"],
      preserveNativeFieldsAndRelations: true,
    }],
  }));
  const result = run(paths);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /retains a manual title prefix/);
});

test("rejects an executable overlay over a native coordination parent", () => {
  const paths = fixture();
  writeFileSync(paths.base, JSON.stringify({
    updates: [{
      issueId: "PLA-972",
      classification: "delivery_parent",
      after: {
        title: "Stripe Customer Genesis at Organization Creation",
        description: "This is a non-executable coordination parent whose native child contracts own implementation.",
      },
    }],
  }));
  writeFileSync(paths.overlay, JSON.stringify({
    updates: [{
      lookupId: "PLA-972",
      title: "Author the five-key Stripe Customer metadata contract",
      description: "Approve and implement the five-key provider metadata object.",
      fieldsToWrite: ["title", "description"],
      preserveNativeFieldsAndRelations: true,
    }],
  }));
  writeFileSync(paths.append, JSON.stringify({
    updates: [
      { issueId: "BUY-2", after: { title: "Append two", description: "Append two description" } },
      { issueId: "SEL-3", after: { title: "Append three", description: "Append three description" } },
      { issueId: "INT-1", after: { title: "Append one", description: "Append one description" } },
    ],
  }));

  const result = run(paths);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /cannot replace coordination parent PLA-972 with an executable contract/);
});

test("rejects retired role titles and obsolete roadmap framing", () => {
  for (const [title, expected] of [
    ["Enforce every §44.1 budget", /manual source section reference/],
    ["Evaluation Lead Role", /retired or stale title/],
    ["Pipeline Phase Mapping Correction", /retired or stale title/],
    ["Known Limitations & Phase 2 Roadmap", /obsolete roadmap framing/],
  ] as const) {
    const paths = fixture();
    writeFileSync(paths.overlay, JSON.stringify({
      updates: [{
        lookupId: "PLA-10",
        title,
        description: "Complete exact current behavior without legacy planning prose.",
        fieldsToWrite: ["title", "description"],
        preserveNativeFieldsAndRelations: true,
      }],
    }));
    const result = run(paths);
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, expected);
  }
});
