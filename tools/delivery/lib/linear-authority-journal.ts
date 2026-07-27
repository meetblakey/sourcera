export function normalizedLinearAuthorityJournalPrefix(raw: string | undefined): string {
  if (!raw) return "";
  return raw.endsWith("\n") ? raw : `${raw}\n`;
}

export function combinedLinearAuthorityJournalRaw(
  resumeRaw: string | undefined,
  appendedRaw: string,
): string {
  return `${normalizedLinearAuthorityJournalPrefix(resumeRaw)}${appendedRaw}`;
}

export function writeAllLinearAuthorityJournalBytes(
  value: string,
  writer: (buffer: Buffer, offset: number, length: number) => number,
): number {
  const buffer = Buffer.from(value, "utf8");
  let offset = 0;
  while (offset < buffer.byteLength) {
    const written = writer(buffer, offset, buffer.byteLength - offset);
    if (!Number.isInteger(written) || written < 1 || written > buffer.byteLength - offset) {
      throw new Error("Linear authority journal write did not make bounded progress");
    }
    offset += written;
  }
  return offset;
}
