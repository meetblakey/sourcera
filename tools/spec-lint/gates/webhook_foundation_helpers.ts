import { findSectionByTitle } from "../lib/spec_loader.js";
import type { Finding, SpecDoc } from "../lib/types.js";

export function sectionTextByTitle(doc: SpecDoc, title: string): { text: string; line: number; anchor?: string } {
  const section = findSectionByTitle(doc, title);
  if (!section) return { text: "", line: 0 };
  return {
    text: doc.lines.slice(section.startLine, section.endLine + 1).join("\n"),
    line: section.startLine,
    anchor: section.heading.anchor,
  };
}

export function includesToken(text: string, token: string): boolean {
  return text.includes(token) || text.includes(token.replace(/_/g, "\\_"));
}

export function requireSectionTokens(
  doc: SpecDoc,
  title: string,
  tokens: string[],
  messagePrefix: string,
): Finding[] {
  const section = sectionTextByTitle(doc, title);
  if (!section.text) {
    return [{
      file: doc.path,
      line: 0,
      anchor: title,
      message: `${title} section is missing.`,
    }];
  }

  const findings: Finding[] = [];
  for (const token of tokens) {
    if (!includesToken(section.text, token)) {
      findings.push({
        file: doc.path,
        line: section.line,
        anchor: section.anchor,
        matched_text: token,
        message: `${messagePrefix}: missing ${token}.`,
      });
    }
  }
  return findings;
}

export function requireDocumentTokens(
  doc: SpecDoc,
  tokens: string[],
  messagePrefix: string,
): Finding[] {
  const findings: Finding[] = [];
  for (const token of tokens) {
    if (!includesToken(doc.text, token)) {
      findings.push({
        file: doc.path,
        line: 0,
        matched_text: token,
        message: `${messagePrefix}: missing ${token}.`,
      });
    }
  }
  return findings;
}
