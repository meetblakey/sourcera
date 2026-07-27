import { strict as assert } from "node:assert";
import { createHash } from "node:crypto";
import test from "node:test";

import {
  combinedLinearAuthorityJournalRaw,
  normalizedLinearAuthorityJournalPrefix,
  writeAllLinearAuthorityJournalBytes,
} from "./lib/linear-authority-journal.js";

const sha256 = (value: string): string => createHash("sha256").update(value).digest("hex");

test("resume output remains a standalone combined journal across the crash window", () => {
  const prior = JSON.stringify({ sequence: 1, status: "started" });
  const appended = `${JSON.stringify({ sequence: 2, status: "already_applied" })}\n`;
  const combined = combinedLinearAuthorityJournalRaw(prior, appended);
  assert.equal(combined, `${prior}\n${appended}`);
  assert.equal(normalizedLinearAuthorityJournalPrefix(`${prior}\n`), `${prior}\n`);
  assert.notEqual(sha256(combined), sha256(appended));
  assert.equal(combined.split("\n").filter(Boolean).length, 2);
});

test("journal byte writer survives forced partial UTF-8 writes and rejects zero progress", () => {
  const value = `${JSON.stringify({ sequence: 1, status: "started", marker: "safe-✓" })}\n`;
  const chunks: Buffer[] = [];
  const bytes = writeAllLinearAuthorityJournalBytes(value, (buffer, offset, length) => {
    const written = Math.min(3, length);
    chunks.push(Buffer.from(buffer.subarray(offset, offset + written)));
    return written;
  });
  assert.equal(bytes, Buffer.byteLength(value, "utf8"));
  assert.equal(Buffer.concat(chunks).toString("utf8"), value);
  assert.throws(() => writeAllLinearAuthorityJournalBytes(value, () => 0), /did not make bounded progress/);
});
