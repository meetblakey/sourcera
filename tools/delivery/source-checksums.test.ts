import { strict as assert } from "node:assert";
import { createHash } from "node:crypto";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import {
  buildSourceChecksumCandidate,
  createLinearSourceChecksumResolutionCache,
  registeredLinearSourceProvenance,
  resolveLinearSourceChecksum,
  resolveRegisteredSourceChecksum,
  resolveSourceRequirementChecksum,
  sourceSectionReferences,
  verifySourceChecksumContract,
  type SourceChecksumContract,
} from "./lib/source-checksums.js";
import { linearSourceProvenance } from "./lib/linear-live.js";
import { parseFeatureInventory } from "./lib/sources.js";

const sha256 = (value: string) =>
  createHash("sha256").update(value, "utf8").digest("hex");

const bundleSha256 = (
  slices: Array<[string, string, string, string]>,
) =>
  sha256(
    JSON.stringify(["sourcera-ordered-source-bundle-v1", slices]),
  );

test("verifies an exact heading-bounded source slice", () => {
  const root = mkdtempSync(join(tmpdir(), "sourcera-source-checksum-"));
  try {
    const source = [
      "# Header",
      "## Start",
      "required behavior",
      "",
      "## End",
      "unrelated behavior",
      "",
    ].join("\n");
    writeFileSync(join(root, "source.md"), source);
    const exactSlice = "## Start\nrequired behavior\n\n";
    const contract: SourceChecksumContract = {
      schemaVersion: 1,
      sources: [
        {
          endHeading: "## End",
          sha256: sha256(exactSlice),
          sourceDoc: "source.md",
          sourceId: "F-001",
          startHeading: "## Start",
        },
      ],
    };

    assert.deepEqual(verifySourceChecksumContract(contract, root), []);
  } finally {
    rmSync(root, { force: true, recursive: true });
  }
});

test("fails closed on changed bytes, missing anchors, duplicate IDs, and escapes", () => {
  const root = mkdtempSync(join(tmpdir(), "sourcera-source-checksum-"));
  try {
    writeFileSync(join(root, "source.md"), "## Start\nchanged\n## End\n");
    const row = {
      endHeading: "## End",
      sha256: "a".repeat(64),
      sourceDoc: "source.md",
      sourceId: "F-001",
      startHeading: "## Start",
    };
    const findings = verifySourceChecksumContract(
      {
        schemaVersion: 1,
        sources: [
          row,
          { ...row },
          { ...row, sourceDoc: "../outside.md", sourceId: "F-002" },
          { ...row, startHeading: "## Missing", sourceId: "F-003" },
        ],
      },
      root,
    );

    assert.deepEqual(
      new Set(findings.map((finding) => finding.code)),
      new Set([
        "source_checksum_duplicate",
        "source_checksum_mismatch",
        "source_checksum_path_escape",
        "source_checksum_start_missing",
      ]),
    );
  } finally {
    rmSync(root, { force: true, recursive: true });
  }
});

test("schema v2 preserves legacy rows and verifies an ordered source bundle", () => {
  const root = mkdtempSync(join(tmpdir(), "sourcera-source-checksum-"));
  try {
    const first = "## First\nalpha\n\n";
    const second = "## Second\nbeta\n\n";
    writeFileSync(
      join(root, "source.md"),
      `${first}## First End\n${second}## Second End\n`,
    );
    const slices = [
      {
        sourceDoc: "source.md",
        startHeading: "## First",
        endHeading: "## First End",
      },
      {
        sourceDoc: "source.md",
        startHeading: "## Second",
        endHeading: "## Second End",
      },
    ];
    const contract: SourceChecksumContract = {
      schemaVersion: 2,
      sources: [
        {
          sourceId: "F-001",
          sourceDoc: "source.md",
          startHeading: "## First",
          endHeading: "## First End",
          sha256: sha256(first),
        },
        {
          sourceId: "F-007.A",
          slices,
          sha256: bundleSha256([
            ["source.md", "## First", "## First End", sha256(first)],
            ["source.md", "## Second", "## Second End", sha256(second)],
          ]),
        },
      ],
    };

    assert.deepEqual(verifySourceChecksumContract(contract, root), []);

    const reversed: SourceChecksumContract = {
      schemaVersion: 2,
      sources: [
        {
          sourceId: "F-007.A",
          slices: [...slices].reverse(),
          sha256: contract.sources[1].sha256,
        },
      ],
    };
    assert.deepEqual(
      verifySourceChecksumContract(reversed, root).map(
        (finding) => finding.code,
      ),
      ["source_checksum_mismatch"],
    );
  } finally {
    rmSync(root, { force: true, recursive: true });
  }
});

test("schema v2 fails closed on changed, empty, mixed, missing, and reversed bundle slices", () => {
  const root = mkdtempSync(join(tmpdir(), "sourcera-source-checksum-"));
  try {
    writeFileSync(
      join(root, "source.md"),
      "## Start\nchanged\n## End\n## Reverse End\n## Reverse Start\n",
    );
    const base = {
      sha256: "a".repeat(64),
      sourceId: "F-007.A",
    };
    const findings = verifySourceChecksumContract(
      {
        schemaVersion: 2,
        sources: [
          { ...base, sourceId: "F-007.A", slices: [] },
          {
            ...base,
            sourceId: "F-007.B",
            sourceDoc: "source.md",
            startHeading: "## Start",
            endHeading: "## End",
            slices: [
              {
                sourceDoc: "source.md",
                startHeading: "## Start",
                endHeading: "## End",
              },
            ],
          } as never,
          {
            ...base,
            sourceId: "F-007.C",
            slices: [
              {
                sourceDoc: "source.md",
                startHeading: "## Missing",
                endHeading: "## End",
              },
            ],
          },
          {
            ...base,
            sourceId: "F-007.D",
            slices: [
              {
                sourceDoc: "source.md",
                startHeading: "## Reverse Start",
                endHeading: "## Reverse End",
              },
            ],
          },
          {
            ...base,
            sourceId: "F-007.E",
            slices: [
              {
                sourceDoc: "../outside.md",
                startHeading: "## Start",
                endHeading: "## End",
              },
            ],
          },
        ],
      },
      root,
    );

    assert.deepEqual(
      new Set(findings.map((finding) => finding.code)),
      new Set([
        "source_checksum_contract_invalid",
        "source_checksum_start_missing",
        "source_checksum_anchor_order",
        "source_checksum_path_escape",
      ]),
    );
    assert.match(
      findings.find((finding) => finding.sourceId === "F-007.C")?.message ?? "",
      /slice 1/,
    );
  } finally {
    rmSync(root, { force: true, recursive: true });
  }
});

test("schema v3 verifies one exact Markdown section without later-section drift", () => {
  const root = mkdtempSync(join(tmpdir(), "sourcera-source-checksum-"));
  try {
    const section = [
      "### M.5.121 Exact gate",
      "",
      "required behavior",
      "",
    ].join("\n");
    writeFileSync(
      join(root, "source.md"),
      `# Header\n${section}### M.5.122 Unrelated gate\nunrelated behavior\n`,
    );
    const contract: SourceChecksumContract = {
      schemaVersion: 3,
      sources: [{
        sourceId: "RG:exact_gate",
        sourceDoc: "source.md",
        sectionHeading: "### M.5.121 Exact gate",
        sha256: sha256(section),
      }],
    };
    assert.deepEqual(verifySourceChecksumContract(contract, root), []);
    writeFileSync(
      join(root, "source.md"),
      `# Header\n${section}### M.5.122 Unrelated gate\nchanged later behavior\n`,
    );
    assert.deepEqual(verifySourceChecksumContract(contract, root), []);
    const candidate = buildSourceChecksumCandidate(
      {
        ...contract,
        sources: [{ ...contract.sources[0], sha256: "0".repeat(64) }],
      },
      root,
    );
    assert.deepEqual(candidate.findings, []);
    assert.equal(candidate.contract.sources[0].sha256, sha256(section));
  } finally {
    rmSync(root, { force: true, recursive: true });
  }
});

test("canonical repaired Linear sources match their committed byte hashes", () => {
  const contract = JSON.parse(
    readFileSync("delivery/ticket-source-checksums.json", "utf8"),
  ) as SourceChecksumContract;
  assert.deepEqual(verifySourceChecksumContract(contract, process.cwd()), []);
});

test("derives deterministic Feature Inventory sections outside the special registry", () => {
  const contract = JSON.parse(
    readFileSync("delivery/ticket-source-checksums.json", "utf8"),
  ) as SourceChecksumContract;
  const inventory = parseFeatureInventory(
    readFileSync("_audit/FEATURE_INVENTORY.md", "utf8"),
  );
  const expected = new Map([
    ["F-010", "877234173313bc6bf9db1ee8a18161ee6ac5ab2f5523ac45148f29286f13013d"],
    ["F-396", "2dd1c6dbe253910ce887573b489939bbf765f546b61dcc08988e06dfa91c62f9"],
    ["F-600", "8c96c3a8dd5bab987fa85a689f0409d976741806e1384b0498a3bdfbcca79dab"],
    ["F-605", "0916192af3272bdc97e228f38e4dec0c277ce7c26771b127cedefd17577f7f34"],
  ]);
  for (const [sourceId, checksum] of expected) {
    const requirement = inventory.find((row) => row.requirementId === sourceId);
    assert.ok(requirement, sourceId);
    const resolved = resolveSourceRequirementChecksum(
      requirement,
      contract,
      process.cwd(),
    );
    assert.equal(resolved.selector, "feature_inventory_section");
    assert.equal(resolved.sha256, checksum);
    assert.equal(resolved.slices.length, 1);
    assert.ok(resolved.slices[0].endHeading);
  }
});

test("parses ordered multi-section bindings and expands shorthand ranges", () => {
  assert.deepEqual(
    sourceSectionReferences(
      "§1.5 Deployment, §7.5 Reactivity, §7.5.3 SLO, and §44.1 Targets",
    ),
    ["§1.5", "§7.5", "§7.5.3", "§44.1"],
  );
  assert.deepEqual(
    sourceSectionReferences("§42.2.1–.5 and §42.6.0.A–.4"),
    ["§42.2.1–§42.2.5", "§42.6.0.A–§42.6.4"],
  );
  assert.throws(
    () => sourceSectionReferences("§7.5 and §7.5"),
    /duplicate references/,
  );
});

test("derives the ready-leaf multi-section checksum manifest", () => {
  const contract = JSON.parse(
    readFileSync("delivery/ticket-source-checksums.json", "utf8"),
  ) as SourceChecksumContract;
  const inventory = parseFeatureInventory(
    readFileSync("_audit/FEATURE_INVENTORY.md", "utf8"),
  );
  const expected = [
    [
      "F-005",
      "§1.5, §7.5, §7.5.3, §44.1",
      "17ff8fd3fc32375a8502c9b93dbdea500065e2ea1b1a5d6a5f1e96170a1d69d0",
      4,
    ],
    [
      "F-600",
      "§42.2.1–§42.2.5",
      "2f2b3093045ceb1625d1bfd2127f0888e9502b43c40eee9129fbcc6ac99c7f82",
      1,
    ],
    [
      "F-605",
      "§42.6.0.A–§42.6.4",
      "78626167570f16e92e3ffe78f09a7edc8ba8b1b246aae4ba977fa36651436af6",
      1,
    ],
    [
      "F-010",
      "§22.3.3, §22.6",
      "8caa9ab7f8cd3dde5ddb390933d34f623ece8f8097d3bfaa58afbd8148294612",
      2,
    ],
    [
      "F-396",
      "§4.7.1, §25.1",
      "8c6c30a2b0a0a209d76cb3559d367d917dc5d8630ef46188a198947c995a8900",
      2,
    ],
  ] as const;
  for (const [sourceId, binding, checksum, sliceCount] of expected) {
    const requirement = inventory.find((row) => row.requirementId === sourceId);
    assert.ok(requirement, sourceId);
    const resolved = resolveSourceRequirementChecksum(
      requirement,
      contract,
      process.cwd(),
      binding,
    );
    assert.equal(resolved.section, binding);
    assert.equal(resolved.sha256, checksum);
    assert.equal(resolved.slices.length, sliceCount);
  }
});

test("binds a registered live source to its exact ordered bundle", () => {
  const contract = JSON.parse(
    readFileSync("delivery/ticket-source-checksums.json", "utf8"),
  ) as SourceChecksumContract;
  const requirement = parseFeatureInventory(
    readFileSync("_audit/FEATURE_INVENTORY.md", "utf8"),
  ).find((row) => row.requirementId === "F-005");
  assert.ok(requirement);
  const registered = resolveRegisteredSourceChecksum("F-005", contract);
  assert.equal(registered.sectionBundleCount, 4);
  assert.equal(
    registered.sha256,
    "17ff8fd3fc32375a8502c9b93dbdea500065e2ea1b1a5d6a5f1e96170a1d69d0",
  );
  const provenance = {
    sourceDocument: null,
    sourceDocuments: ["Sourcera_Master_Spec.md"],
    section: null,
    sectionBundleCount: 4,
    sourceBinding: registered.sourceBindingSha256,
    sourceChecksum: registered.sha256,
  };
  assert.equal(
    resolveLinearSourceChecksum(
      requirement,
      provenance,
      contract,
      process.cwd(),
    ).sha256,
    registered.sha256,
  );
  assert.throws(
    () =>
      resolveLinearSourceChecksum(
        requirement,
        { ...provenance, sectionBundleCount: 3 },
        contract,
        process.cwd(),
      ),
    /registered source bundle/,
  );
  assert.throws(
    () =>
      resolveLinearSourceChecksum(
        requirement,
        { ...provenance, sourceBinding: "0".repeat(64) },
        contract,
        process.cwd(),
      ),
    /registered source bundle/,
  );
});

test("emits deterministic multi-document provenance blocks", () => {
  const contract = JSON.parse(
    readFileSync("delivery/ticket-source-checksums.json", "utf8"),
  ) as SourceChecksumContract;
  const provenance = registeredLinearSourceProvenance(
    resolveRegisteredSourceChecksum("F-139", contract),
  );
  assert.deepEqual(provenance.sourceDocuments, [
    "Sourcera_Master_Spec.md",
    "UX_Design_of_Sourcera.md",
  ]);
  assert.equal(provenance.sourceSectionBundleCount, 30);
  assert.match(provenance.markdown, /Source section bundle: 30 registered slices/);
  assert.match(provenance.markdown, /Canonical source binding: sha256:[a-f0-9]{64}/);
});

test("round-trips a registered named heading through Linear provenance", () => {
  const contract = JSON.parse(
    readFileSync("delivery/ticket-source-checksums.json", "utf8"),
  ) as SourceChecksumContract;
  const requirement = parseFeatureInventory(
    readFileSync("_audit/FEATURE_INVENTORY.md", "utf8"),
  ).find((row) => row.requirementId === "F-865");
  assert.ok(requirement);
  const registered = resolveRegisteredSourceChecksum("F-865", contract);
  const emitted = registeredLinearSourceProvenance(registered);
  const parsed = linearSourceProvenance(emitted.markdown);

  assert.equal(parsed.section, "### Button Component");
  assert.equal(
    resolveLinearSourceChecksum(
      requirement,
      parsed,
      contract,
      process.cwd(),
    ).sha256,
    registered.sha256,
  );
});

test("hashes every ordered section in a multi-section issue binding", () => {
  const root = mkdtempSync(join(tmpdir(), "sourcera-source-checksum-"));
  try {
    const first = "## 1.1 First\nfirst behavior\n";
    const second = "## 2.1 Second\nsecond behavior\n";
    writeFileSync(join(root, "source.md"), `${first}${second}## 3.1 End\n`);
    const requirement = {
      requirementId: "F-001",
      outcome: "Test",
      sourceDoc: "source.md",
      sourceVersion: "test",
      section: "§1.1",
      dependencies: [],
      disposition: "executable" as const,
    };
    const resolved = resolveSourceRequirementChecksum(
      requirement,
      { schemaVersion: 3, sources: [] },
      root,
      "§1.1 + §2.1",
    );
    assert.equal(resolved.section, "§1.1, §2.1");
    assert.equal(resolved.slices.length, 2);
    assert.equal(
      resolved.sha256,
      bundleSha256([
        ["source.md", "## 1.1 First", "## 2.1 Second", sha256(first)],
        ["source.md", "## 2.1 Second", "## 3.1 End", sha256(second)],
      ]),
    );
    writeFileSync(
      join(root, "source.md"),
      `${first}## 2.1 Second\nchanged behavior\n## 3.1 End\n`,
    );
    assert.notEqual(
      resolveSourceRequirementChecksum(
        requirement,
        { schemaVersion: 3, sources: [] },
        root,
        "§1.1 + §2.1",
      ).sha256,
      resolved.sha256,
    );
  } finally {
    rmSync(root, { force: true, recursive: true });
  }
});

test("reuses one parsed source document across Linear requirements and section bindings", () => {
  const root = mkdtempSync(join(tmpdir(), "sourcera-source-checksum-"));
  try {
    const source = [
      "## 1.1 Shared",
      "required behavior",
      "## 1.2 Other",
      "other behavior",
      "## 1.3 End",
      "unrelated",
      "",
    ].join("\n");
    writeFileSync(join(root, "source.md"), source);
    let reads = 0;
    const cache = createLinearSourceChecksumResolutionCache((sourcePath) => {
      reads += 1;
      return readFileSync(sourcePath, "utf8");
    });
    const provenance = {
      sourceDocument: "source.md",
      sourceDocuments: ["source.md"],
      section: "§1.1",
      sectionBundleCount: null,
      sourceBinding: null,
      sourceChecksum: null,
    };
    const requirement = (requirementId: string) => ({
      requirementId,
      outcome: "Shared source",
      sourceDoc: "source.md",
      sourceVersion: "test",
      section: "§1.1",
      dependencies: [],
      disposition: "executable" as const,
    });
    const options = { allowChecksumDrift: true, resolutionCache: cache };

    const first = resolveLinearSourceChecksum(
      requirement("F-001"),
      provenance,
      { schemaVersion: 3, sources: [] },
      root,
      options,
    );
    const second = resolveLinearSourceChecksum(
      requirement("F-002"),
      provenance,
      { schemaVersion: 3, sources: [] },
      root,
      options,
    );
    const third = resolveLinearSourceChecksum(
      { ...requirement("F-003"), section: "§1.2" },
      { ...provenance, section: "§1.2" },
      { schemaVersion: 3, sources: [] },
      root,
      options,
    );

    assert.equal(reads, 1);
    assert.equal(first.sourceId, "F-001");
    assert.equal(second.sourceId, "F-002");
    assert.equal(third.sourceId, "F-003");
    assert.equal(first.sha256, second.sha256);
    assert.notEqual(first.sha256, third.sha256);
  } finally {
    rmSync(root, { force: true, recursive: true });
  }
});

test("writes a checksum candidate without mutating the canonical contract", () => {
  const root = mkdtempSync(join(tmpdir(), "sourcera-source-checksum-"));
  try {
    const source = "## Start\ncurrent\n## End\n";
    writeFileSync(join(root, "source.md"), source);
    const contract: SourceChecksumContract = {
      schemaVersion: 1,
      sources: [{
        sourceId: "F-001",
        sourceDoc: "source.md",
        startHeading: "## Start",
        endHeading: "## End",
        sha256: "0".repeat(64),
      }],
    };
    const result = buildSourceChecksumCandidate(contract, root);
    assert.deepEqual(result.findings, []);
    assert.equal(contract.sources[0].sha256, "0".repeat(64));
    assert.equal(
      result.contract.sources[0].sha256,
      sha256("## Start\ncurrent\n"),
    );

    const contractPath = join(root, "contract.json");
    const candidatePath = join(root, "candidate.json");
    writeFileSync(contractPath, JSON.stringify(contract));
    const run = spawnSync(
      process.execPath,
      [
        "--import",
        join(process.cwd(), "tools/spec-lint/node_modules/tsx/dist/loader.mjs"),
        join(process.cwd(), "tools/delivery/source-checksums.ts"),
        "--contract",
        contractPath,
        "--candidate-out",
        candidatePath,
      ],
      { cwd: root, encoding: "utf8" },
    );
    assert.equal(run.status, 0, run.stderr);
    assert.equal(
      (JSON.parse(readFileSync(candidatePath, "utf8")) as SourceChecksumContract)
        .sources[0].sha256,
      sha256("## Start\ncurrent\n"),
    );
    assert.equal(
      (JSON.parse(readFileSync(contractPath, "utf8")) as SourceChecksumContract)
        .sources[0].sha256,
      "0".repeat(64),
    );
  } finally {
    rmSync(root, { force: true, recursive: true });
  }
});
