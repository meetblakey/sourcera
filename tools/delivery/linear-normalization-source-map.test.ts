import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { test } from "node:test";
import {
  assertHistoricalNormalizationSourceMap,
  type HistoricalNormalizationSourceMapMarker,
} from "./lib/linear-normalization-source-map.js";

interface SourceOverride {
  sourceDoc: string;
  section: string;
  outcome?: string;
  anchors?: string[];
}

interface SourceMap extends HistoricalNormalizationSourceMapMarker {
  sources: Record<string, SourceOverride>;
  oversizedOrCrossCutting: string[];
  extractionPolicy: Record<string, string>;
}

const contract = JSON.parse(
  readFileSync("delivery/linear-normalization-source-map.json", "utf8"),
) as SourceMap;

function matchingHeadings(source: string, section: string): string[] {
  const target = /^§\s*((?:M\.)?\d+(?:\.[0-9A-Z]+)*)$/i.exec(section)?.[1] ??
    /^Appendix\s+([A-M](?:\.\d+(?:\.\d+)*)?)$/i.exec(section)?.[1];
  assert.ok(target, `unsupported section ${section}`);
  const escaped = target.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = /^Appendix\s+/i.test(section)
    ? new RegExp(`^(?:appendix\\s+)?${escaped}(?:\\s|:|—|$)`, "i")
    : new RegExp(`^(?:section\\s+)?${escaped}(?:\\.\\s|\\s|:|—|$)`, "i");
  return source.split(/\r?\n/).filter((line) => {
    const heading = /^#{1,6}\s+(.+?)\s*$/.exec(line)?.[1]
      .replace(/\\\./g, ".")
      .replace(/\{#[^}]+\}\s*$/, "")
      .trim();
    return Boolean(heading && pattern.test(heading));
  });
}

test("source map is explicitly historical and non-authoritative", () => {
  assert.doesNotThrow(() => assertHistoricalNormalizationSourceMap(contract));
  assert.equal(contract.authority.productAuthority, false);
  assert.equal(contract.authority.planningAuthority, false);
  assert.equal(contract.authority.publicationAuthority, false);
});

test("source-map authority drift fails closed", () => {
  assert.throws(
    () => assertHistoricalNormalizationSourceMap({
      ...contract,
      authority: { ...contract.authority, planningAuthority: true },
    }),
    /historical, non-authoritative normalization-only use/,
  );
});

test("historical source map retains every required migration mapping", () => {
  assert.ok(Object.keys(contract.sources).length >= 115);
  for (const required of [
    "BUY-366", "BUY-370", "BUY-397", "INT-48", "PLA-285", "PLA-286",
    "PLA-819", "PLA-823", "PLA-825", "SEL-72", "SEL-137", "SEL-184",
  ]) {
    assert.ok(contract.sources[required], `${required} required mapping is missing`);
  }
  for (const excluded of ["BUY-340", "PLA-940", "PLA-958"]) {
    assert.equal(contract.sources[excluded], undefined);
  }
});

test("every historical source override resolves to one canonical heading", () => {
  for (const [issueId, mapping] of Object.entries(contract.sources)) {
    assert.match(issueId, /^(?:BUY|PLA|SEL|INT)-\d+$/);
    assert.match(mapping.sourceDoc, /^(?:Sourcera_Master_Spec|UX_Design_of_Sourcera)\.md$/);
    assert.ok(existsSync(mapping.sourceDoc), `${issueId} source is missing`);
    const source = readFileSync(mapping.sourceDoc, "utf8");
    assert.deepEqual(
      matchingHeadings(source, mapping.section).length,
      1,
      `${issueId} ${mapping.section} must resolve exactly once`,
    );
    if (mapping.outcome) {
      assert.doesNotMatch(mapping.outcome, /\b(?:BUY|PLA|SEL|INT)-\d+\b/);
      assert.doesNotMatch(mapping.outcome, /(?:read|reopen|consult|refer to|see)\s+(?:the\s+)?(?:source|spec)/i);
    }
    if (mapping.anchors) {
      assert.ok(mapping.anchors.length > 0, `${issueId} anchors are empty`);
      assert.equal(new Set(mapping.anchors).size, mapping.anchors.length, `${issueId} anchors repeat`);
      for (const anchor of mapping.anchors) assert.ok(anchor.trim(), `${issueId} has a blank anchor`);
    }
  }
});

test("cross-cutting flags are unique mapped identifiers", () => {
  assert.equal(new Set(contract.oversizedOrCrossCutting).size, contract.oversizedOrCrossCutting.length);
  for (const issueId of contract.oversizedOrCrossCutting) {
    assert.ok(contract.sources[issueId], `${issueId} flag lacks a source mapping`);
  }
});

test("extraction policy forbids source deferral and clipped facts", () => {
  assert.match(contract.extractionPolicy.primary, /mapped owning section/i);
  assert.match(contract.extractionPolicy.crossReferences, /only a referenced symbol/i);
  assert.match(contract.extractionPolicy.blockBoundaries, /Never cut/i);
  assert.match(contract.extractionPolicy.sourceDeferrals, /carrying the exact referenced fact/i);
});
