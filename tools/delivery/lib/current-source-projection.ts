export type ProjectionKind = "current" | "history_only" | "mixed" | "unresolved";

export type ProjectionDiagnosticCode =
  | "history_removed"
  | "source_pointer_removed"
  | "unresolved_essential"
  | "dangling_fragment"
  | "table_shape_changed";

export interface SourceAnchor {
  document: "master" | "ux" | "current";
  line: number;
  raw: string;
  section: string;
  terms: string[];
}

export interface ProjectionDiagnostic {
  code: ProjectionDiagnosticCode;
  evidence: string;
}

export interface ProjectionResult {
  anchors: SourceAnchor[];
  diagnostics: ProjectionDiagnostic[];
  kind: ProjectionKind;
  text: string;
}

export interface ProtectedMarkdown {
  spans: string[];
  text: string;
}

const PROTECTED_START = "\uE000";
const PROTECTED_END = "\uE001";
const PROTECTED_TOKEN = /\uE000(\d+)\uE001/g;

export const SOURCE_ANCHOR = /(?:(?<doc>Master Spec|UX(?: Design)?)\s+)?(?<section>§\s*(?:M\.)?\d+(?:\.[0-9A-Z]+)*|Appendix\s+[A-M](?:\.\d+)*|Section\s+\d+(?:\.\d+)*)/gi;

export const HISTORY_ONLY_SENTENCE = /^\s*(?:(?:In|During|From|By)\s+(?:v\d+(?:\.\d+)*(?:-REM)?|the\s+(?:prior|previous)\s+(?:pass|inventory)|Phase\s+\d+(?:\.\d+)*\s+(?:remediation|program|brief|deliverable))\b|(?:This|The)\s+(?:row|section|wording|contract)\s+(?:was|is)\s+(?:authored|added|promoted|retired|superseded)\b|(?:The\s+)?(?:MS(?:\s+§?\s*\d+(?:\.\d+)*)?\s+)?baseline\s+and\s+AE\s+requirements\s+fall\s+across\s+\w+\s+delivery\s+phases\b|(?:Prior to this subsection|Promoted from prose-distributed mentions|Pre-remediation rule)\b)/i;

export const HISTORY_PREFIX = /^\s*(?:(?:Resolved:\s*)?(?:(?:v\d+(?:\.\d+)*(?:-REM)?(?:\s+Phase\s+[A-Z0-9.]+(?:\s+(?:remediation|closure|pass|program))?)?|D-[A-Z0-9.-]+\s+remediation|audit-remediation pass|Phase\s+\d+(?:\.\d+)*\s+(?:remediation|program|brief|deliverable))\s*[,;:—-]\s*))+/i;

export const CURRENT_COMPATIBILITY_CONTEXT = /\b(?:state|status|enum|row|field|value|alias|event|migration|read|write|reject|route|request|response|transition|settle|restore)\b[^.\n]{0,120}\b(?:legacy|historical|pre-cutover|retired|canceled)\b|\b(?:legacy|pre-cutover|retired|canceled)\b[^.\n]{0,120}\b(?:state|status|enum|row|field|value|alias|event|migration|read|write|reject|route|request|response|transition|settle|restore)\b/i;

export const UNRESOLVED_ESSENTIAL = /\b(?:(?:the|its)\s+(?:exact\s+)?named|an?\s+applicable|the\s+relevant)\s+(?:implementation|test|proof|runtime|handler|route|control|authority|role|path|artifact|anatomy|matrix|schema|event|state|transition|field|value|threshold|result|response|receipt|rejection|scope|channel|lifecycle|viewport)s?\b|\bexact rejection named by the behavior rule\b|\bpublic caller allowed by the named route\b|\bis the bounded behavior being delivered\b/i;

export function hasUnresolvedContractPlaceholder(value: string): boolean {
  return UNRESOLVED_ESSENTIAL.test(value);
}

export const DANGLING_PROJECTION = /\b(?:lives?|registered|sourced|defined|governed|introduced|required)\s+(?:in|by|from|at|under)\s*[.;](?:\s|$)|\bcompletion means\s*\/|\bper the the\b|\bhigher-authority boundaries:\.0a\b|(?:^|[^`])\b[a-z][a-z0-9_]*\\[a-z][a-z0-9_]*\b|\/(?:sellers|software):slug\b|(?:^|[^,]),,{1,}|\bSource binding\.\s*\*,/i;

const MARKDOWN_ESCAPED_LITERAL = /\\([_=>])/g;
const HISTORY_SECTION = /^(?:history|legacy resolution|authoring intent|source history|planning history|remediation history)$/i;
const PURE_CONTROL_PLANE = /(?:^|\b)(?:_integration\/(?:RECONCILIATION|Integration_Prompts|PHASE)|legacy-import(?::\S+)?|authored-extension ledger|authored extensions?|stop-condition disposition|Linear publication|old Linear duplicates?|description sha-?256|pre-edit backup|retired-sources)\b/i;
const HISTORY_NARRATIVE = /\b(?:created during source repair|retained wording|retained from (?:the )?(?:prior|previous)|source-history|historical baseline|historical carry-over|historical citations?|terminal phase history|pre-remediation|pre-repair|promoted from prose-distributed mentions|prior to this subsection|landed under integration program|source-authority migration only)\b/i;
const SOURCE_POINTER_VERB = /\b(?:lives?|is|are|remains?|registered|cataloged|defined|sourced|governed|introduced|required|authoritative|owned)\s+(?:in|by|from|at|under)\s+(?:(?:the\s+)?(?:Master Spec|UX(?: Design)?)(?:\s+)?|§|Appendix|Section)/i;
const PURE_SOURCE_POINTER = /^\s*(?:Source authority(?:\s+for)?\s*:?\s*)?(?:(?!\b(?:must|shall|reject|deny|return|persist|render|emit|write|record|compute|allow|prevent|require)\b).){0,500}(?:\b(?:lives?|is authoritative|are authoritative|is registered|are registered|is cataloged|are cataloged|is defined|are defined|is governed|are governed|is owned|are owned)\s+(?:in|by|under)\s+)(?:(?:the\s+)?(?:Master Spec|UX(?: Design)?)(?:\s+)?|§|Appendix|Section)[^.\n]*(?:[.!?]|$)\s*$/i;
const LEADING_SOURCE_CITATION = /^\s*(?:according to|per|as specified by|defined in|governed by|authoritative in|referenced? in|see)\s+(?:the\s+)?(?:(?:Master Spec|UX(?: Design)?)(?:\s+)?|§|Appendix|Section)[^,;:—-]*\s*[,;:—-]\s*/i;
const TRAILING_SOURCE_CITATION = /\s*[,;]?\s*\b(?:according to|per|as specified by|defined (?:in|by)|governed by|authoritative in|referenced? in|see)\s+(?:the\s+)?(?:(?:Master Spec|UX(?: Design)?)(?:\s+)?|§|Appendix|Section)(?:[^.!?\n]|\.(?=\d))*(?=[.!?]|$)/gi;
const SOURCE_AUTHORITY_LABEL = /^\s*(?:[-*+]\s+)?(?:\*\*)?(?:Source authority(?:\s+for)?|Higher-authority boundaries)(?:\*\*)?\s*:\s*(?=[^\n]*[A-Za-z]{3})[^\n]+$/i;
const SOURCE_BINDING_LINE = /^\s*(?:[-*+]\s+)?(?:\*\*)?Source binding(?:\*\*)?\s*[:.]\s*(?=[^\n]*[A-Za-z]{3})[^\n]+$/i;
const SOURCE_POINTER_LIST = /^\s*(?:The\s+)?[^.\n]{0,180}\b(?:rules?|contract|authority|behavior|source)\s+remain(?:s)?\s+(?:(?:§\s*(?:M\.)?\d+(?:\.[0-9A-Z]+)*|Appendix\s+[A-M](?:\.\d+)*)(?:\s*(?:[,/&]|and)\s*)*)+[.!]?\s*$/i;
const SOURCE_CONSUMER_POINTER = /^\s*This subsection is the canonical\b[^.\n]{0,240}\bcontract consumed by\b/i;
const CROSS_REFERENCE_LINE = /^\s*(?:\*\*)?(?:Cross-references?|References?)(?:\*\*)?\s*[:.]/i;
const DELIVERY_CONTROL_HISTORY = /^\s*(?:Validation trigger\s*:\s*(?=[^\n]*(?:source checksum|path-ownership|ticket-integrity|Linear readback))|Authority basis\s*[—-]\s*(?=[^\n]*(?:parent closes|source hashes?|protected-CI readback|Linear readback|independent-review records?))|It must contain\b(?=[^\n]*(?:source hashes?|protected-CI readback|Linear readback))|Until they pass,\s*this issue remains?\s+(?:Backlog|unready))/i;
const NON_EXECUTABLE_REFERENCE_SENTENCE = /^\s*(?:This is an outcome parent\.?|Reversal basis\s*[—-]\s*\uE000\d+\uE001\.?|The [A-Za-z0-9 /&'-]+ policy summary:\.)\s*$/i;
const PURE_EXPANDED_REFERENCE_TOKEN = /^\s*`Deterministic Platform Reference-Data Orchestration-[^`]+`\s*\.?\s*$/i;
const BARE_MARKDOWN_MARKER = /^\s*(?:[-*+]|\d+[.)]|>)(?:\s+\[[ xX]\])?\s*$/;
const CURRENT_RULE_ACTION = /\b(?:must|shall|may|can|allow(?:s|ed)?|deny|denies|denied|reject(?:s|ed)?|return(?:s|ed)?|persist(?:s|ed)?|render(?:s|ed)?|emit(?:s|ted)?|write(?:s|ten)?|record(?:s|ed)?|register(?:s|ed)?|compute(?:s|d)?|prevent(?:s|ed)?|require(?:s|d)?|leave(?:s|ft)?|keep(?:s|t)?|move(?:s|d)?|transition(?:s|ed)?|preserve(?:s|d)?|create(?:s|d)?|update(?:s|d)?|delete(?:s|d)?|restore(?:s|d)?|read(?:s)?|execute(?:s|d)?)\b/i;
const EXPANDED_REFERENCE_PREFIX = /^\s*(?:according to|per|as specified by|defined in|governed by|referenced? in|see|refer to|cross-reference)\s+/i;
const EXPANDED_TITLE_HINT = /\b(?:API|Matrix|Protocol|Rule|Rules|Registry|Workflow|Entity|Entities|Report|State Machine|Phase(?:\s+\d+)?|Behavior|Lifecycle|Framework|Surface|Console|Bridge|Authority|Policy|Policies|Model|Pipeline|Record)\b/i;

const PROTECTED_SPAN = /```[\s\S]*?```|`[^`\n]*`|https?:\/\/[^\s)]+|\/(?:[A-Za-z0-9._~{}\[\]-]+\/)*(?::[A-Za-z][A-Za-z0-9_]*)(?:\/[A-Za-z0-9._~{}\[\]:-]+)*/g;

function unique<T>(values: T[]): T[] {
  return [...new Set(values)];
}

function normalizedTerms(value: string): string[] {
  const code = [...value.matchAll(/`([A-Za-z][A-Za-z0-9_.:-]{2,})`/g)].map((match) => match[1]);
  const words = value
    .replace(SOURCE_ANCHOR, " ")
    .replace(/[`*_#|()[\]{}]/g, " ")
    .toLowerCase()
    .match(/[a-z][a-z0-9_]{3,}/g) ?? [];
  const stop = new Set([
    "according", "appendix", "authoritative", "defined", "design", "governed", "master",
    "section", "source", "specified", "where", "with", "from", "this", "that", "these",
  ]);
  return unique([...code, ...words.filter((word) => !stop.has(word))]).slice(0, 16);
}

export function protectMarkdownSpans(value: string): ProtectedMarkdown {
  const spans: string[] = [];
  const text = value.replace(PROTECTED_SPAN, (span) => {
    const index = spans.push(span) - 1;
    return `${PROTECTED_START}${index}${PROTECTED_END}`;
  });
  return { spans, text };
}

export function restoreMarkdownSpans(value: string, spans: string[]): string {
  return value.replace(PROTECTED_TOKEN, (_full, rawIndex: string) => spans[Number(rawIndex)] ?? _full);
}

export function harvestSourceAnchors(raw: string): SourceAnchor[] {
  const anchors: SourceAnchor[] = [];
  const seen = new Set<string>();
  for (const [lineIndex, line] of raw.split(/\r?\n/).entries()) {
    for (const match of line.matchAll(SOURCE_ANCHOR)) {
      const groups = match.groups ?? {};
      const rawDocument = groups.doc ?? "";
      const section = (groups.section ?? match[0]).replace(/\s+/g, " ").trim();
      const document = /^UX/i.test(rawDocument)
        ? "ux"
        : /^Master Spec/i.test(rawDocument) || /^Appendix/i.test(section)
        ? "master"
        : "current";
      const key = `${document}:${section.toLowerCase()}:${lineIndex}`;
      if (seen.has(key)) continue;
      seen.add(key);
      anchors.push({
        document,
        line: lineIndex + 1,
        raw: match[0],
        section,
        terms: normalizedTerms(line),
      });
    }
  }
  return anchors;
}

function historyPrefix(value: string): { changed: boolean; text: string } {
  const text = value
    .replace(HISTORY_PREFIX, "")
    .replace(/^\s*(?:Resolved:\s*)?(?:V\d+(?:\.\d+)*\s+(?:closure|pass|program)|R\d+\s+(?:closure|pack|pilot|proof|row|history))\s*[:;—-]\s*/i, "")
    .replace(/^\s*(?:Pre-remediation rule|Pre-repair rule|Prior wording|Previous wording)\s*[:;—-]\s*/i, "");
  return { changed: text !== value, text };
}

function historyControlFree(value: string): { changed: boolean; text: string } {
  let text = value
    .replace(/^\s*(?:AC|Acceptance\s+criterion)\s*#?\d+(?:\s*[/,&]\s*#?\d+)*\s*[:;—-]\s*/i, "")
    .replace(/^\s*(?:This\s+is\s+)?an?\s+outcome\s+parent(?:\s+created\s+during\s+source\s+repair)?\s*[:;—-]\s*/i, "")
    .replace(/^\s*(?:The\s+)?(?:row\s+)?remains?\s+Backlog(?:\s+and\s+unready)?\s*[:;—-]\s*/i, "");

  const clauses = text.split(/\s*;\s*/);
  if (clauses.length > 1) {
    const kept = clauses.filter((clause) => {
      const controlPlaneHistory =
        HISTORY_NARRATIVE.test(clause) ||
        /\btracked as\s+\uE000\d+\uE001/i.test(clause) ||
        /\b(?:prior|previous|historical|retired)\s+(?:source\s+)?checksum\b/i.test(clause) ||
        /\b(?:planning|source-history|remediation)\s+(?:evidence|record|prose|wording)\b/i.test(clause) ||
        /\b(?:outcome parent|Backlog and unready)\b/i.test(clause);
      return !controlPlaneHistory || CURRENT_RULE_ACTION.test(clause);
    });
    if (kept.length !== clauses.length) {
      const terminal = /[.!?]\s*$/.exec(text)?.[0] ?? "";
      text = kept.join("; ").trim();
      if (text && terminal && !/[.!?]\s*$/.test(text)) text += terminal;
    }
  }

  return { changed: text !== value, text: text.trim() };
}

function titleCaseTokenCount(value: string): number {
  return value.match(/\b(?:[A-Z][A-Za-z0-9&'-]*|API|UX|AI)\b/g)?.length ?? 0;
}

function looksLikeExpandedIssueTitle(value: string): boolean {
  const clean = value.replace(/[.!?]+\s*$/, "").trim();
  return EXPANDED_TITLE_HINT.test(clean) && (titleCaseTokenCount(clean) >= 2 || /\([^)]{2,}\)/.test(clean));
}

function expandedSourceFree(value: string): { changed: boolean; pointerOnly: boolean; text: string } {
  const prefix = EXPANDED_REFERENCE_PREFIX.exec(value);
  if (prefix) {
    const remainder = value.slice(prefix[0].length);
    let depth = 0;
    for (let index = 0; index < remainder.length; index += 1) {
      const character = remainder[index];
      if (character === "(") depth += 1;
      else if (character === ")") depth = Math.max(0, depth - 1);
      if (depth !== 0 || !/[,;:—]/.test(character)) continue;
      const reference = remainder.slice(0, index).trim();
      const rule = remainder.slice(index + 1).trim();
      if (looksLikeExpandedIssueTitle(reference) && CURRENT_RULE_ACTION.test(rule)) {
        return { changed: true, pointerOnly: false, text: rule };
      }
    }
    if (looksLikeExpandedIssueTitle(remainder) && !CURRENT_RULE_ACTION.test(remainder)) {
      return { changed: true, pointerOnly: true, text: "" };
    }
  }

  const predicate = /\b(?:must\s+follow|follows?|is\s+governed\s+by|are\s+governed\s+by|is\s+defined\s+in|are\s+defined\s+in)\s+(.+?)[.!?]?\s*$/i.exec(value);
  if (predicate && looksLikeExpandedIssueTitle(predicate[1])) {
    const withoutPredicate = value.slice(0, predicate.index).trim();
    if (!CURRENT_RULE_ACTION.test(withoutPredicate)) {
      return { changed: true, pointerOnly: true, text: "" };
    }
  }
  return { changed: false, pointerOnly: false, text: value };
}

function currentOnlyInlineRewrites(value: string): string {
  return value
    .replace(
      /\bthe\s+Master(?:\s+Spec)?\s*,\s*Appendix\s+J\s*,\s*or\s+(?:the\s+)?observability\s+registry\s+defines?\b/gi,
      (match) => /^[A-Z]/.test(match)
        ? "The canonical observability registry defines"
        : "the canonical observability registry defines",
    )
    .replace(/\bthe named receipt\b/gi, "the same-commit proof receipt")
    .replace(/\bBL-[A-Z0-9][A-Z0-9._-]*(?:\/[A-Z0-9][A-Z0-9._-]*)*(?:\s+closure)?\.?/gi, "")
    .replace(/\bper this prompt\b\s*[,;:]?/gi, "")
    .replace(/\bRequired missing artifacts\s*:/gi, "Required artifacts:")
    .replace(
      /^\s*The\s+(?:[^()\n]|\([^()\n]*\))*?\bacceptance criterion\s*#?\d+\s+enforces this at the schema layer\s*\(([^()]*)\)\.?\s*$/i,
      (_match, rule: string) => `At the schema layer, ${rule.replace(/^one wallet row per\b/i, "one wallet row is stored per")}.`,
    )
    .replace(
      /^\s*Deliver\s+[^:\n]+\s+by enforcing this exact runtime condition:\s*[^\n]*?\bMUST agree that\s+([a-z])/i,
      (_match, first: string) => first.toUpperCase(),
    )
    .replace(
      /^\s*\*\*Exact assertion\.\*\*\s*(?=[^\n]*(?:acceptance rule|failure mode|Workflow step)[^\n]*\bMUST agree that\b)[^\n]*?\bMUST agree that\s+([a-z])/i,
      (_match, first: string) => first.toUpperCase(),
    )
    .replace(
      /\bwhen this exact assertion holds:\s*(?=[^\n]*(?:acceptance rule|failure mode|Workflow step)[^\n]*\bMUST agree that\b)[^\n]*?\bMUST agree that\s+/i,
      "when ",
    )
    .replace(/;\s*verified by\s+(?=[^.\n]{1,360}\bacceptance criterion\s*#?\d+\b)[^.\n]*?\bacceptance criterion\s*#?\d+(?:\s*\(Phase\s+[^)]+\))?/gi, "")
    .replace(
      /^\s*(?:Release basis\s*[—-]\s*)?(?:[^—\n]|\([^()\n]*\)){1,360}?\bFailure Mode\s*#?\d+\s*[—-]\s*([a-z])/i,
      (_match, first: string) => first.toUpperCase(),
    )
    .replace(/\s+as defined in\s+(?=[^\n]{1,500}\bacceptance criterion\s*#?\d+\b)[^\n]*?\bacceptance criterion\s*#?\d+(?:\s*\(Phase\s+[^)]+\))?/gi, "")
    .replace(
      /^\s*Per\s+(?=[^\n]{1,500}\b(?:acceptance criterion|failure mode|AC)\s*#?\d+\b)[^\n]*?\b(?:acceptance criterion|failure mode|AC)\s*#?\d+(?:\s*\([^)]*\))?\s*[,;:—-]\s*/i,
      "",
    )
    .replace(
      /^\s*Per\s+(?=[^\n]{1,500}\b(?:acceptance criterion|failure mode|AC)\s*#?\d+\b)[^\n]*?\b(?:acceptance criterion|failure mode|AC)\s*#?\d+\s*[.!]?\s*$/i,
      "",
    )
    .replace(/^\s*Failure Modes Addressed\s+Failure Mode\s*#?\d+\s*[—:-]\s*/i, "")
    .replace(
      /\(\s*((?:[^()\n]|\([^()\n]*\)){1,160}?)\s+(?:from|per)\s+(?=(?:[^()\n]|\([^()\n]*\)){1,360}\b(?:acceptance criterion|failure mode|AC)\s*#?\d+\b)(?:[^()\n]|\([^()\n]*\))*?\b(?:acceptance criterion|failure mode|AC)\s*#?\d+\s*\)/gi,
      "($1)",
    )
    .replace(
      /\s*\((?=(?:[^()\n]|\([^()\n]*\))*\b(?:acceptance criterion|failure mode|AC)\s*#?\d+\b)(?:[^()\n]|\([^()\n]*\))*\)/gi,
      "",
    )
    .replace(
      /\s+per\s+(?=[^.;\n]{1,360}\b(?:acceptance criterion|failure mode|AC)\s*#?\d+\b)[^.;\n]*?\b(?:acceptance criterion|failure mode|AC)\s*#?\d+(?:\s*\([^)]*\))?/gi,
      "",
    )
    .replace(/\s*\.\s*Per\s+(?=[^\n]{1,500}\b(?:acceptance criterion|failure mode|AC)\s*#?\d+\b)[^\n]*?\b(?:acceptance criterion|failure mode|AC)\s*#?\d+\s*\.?\s*$/i, ".")
    .replace(/\s*\(MS Baseline\s*[—-]\s*\d+\s+Rows\)/gi, "")
    .replace(/\b(?:MS|UX) Baseline\s*[—-]\s*/gi, "")
    .replace(
      /\s*\(Initial Registry Seed\s*\(v\d+(?:\.\d+)*\s*(?:→|->|to)\s*v\d+(?:\.\d+)*\)\s*(?:row\s*)?#?\d+(?:\s*\+\s*(?:[^()\n]|\([^()\n]*\))*)?\)/gi,
      "",
    )
    .replace(/\bInitial Registry Seed\s*\(v\d+(?:\.\d+)*\s*(?:→|->|to)\s*v\d+(?:\.\d+)*\)\s*(?:row\s*)?#?\d+\s*/gi, "")
    .replace(/\(\s*v\d+(?:\.\d+)*\s*(?:→|->|to)\s*v\d+(?:\.\d+)*\s*\)/gi, "")
    .replace(/\(\s*V\d+(?:\.\d+)*(?:\s*[—-]\s*)?\)/gi, "")
    .replace(/\s*\((?:Phase\s+)?V\d+(?:\.\d+)*(?:-REM)?[^()]*(?:remediation|rewrite|closure|add|amendment|baseline|pass|program|closes?\s+D-[A-Z0-9.-]+)[^()]*\)/gi, "")
    .replace(/\s*\((?:closes?|closed)\s+D-[A-Z0-9.-]+\)/gi, "")
    .replace(/\b(?:Phase\s+)?V\d+(?:\.\d+)*(?:-REM)?\s+(?:add|amendment|remediation|rewrite|closure|pass|program|baseline)\s*[:—-]?\s*/gi, "")
    .replace(/\b(?:frozen\s+)?(?:MS\s+)?baseline\s*[—-]?\s*/gi, "")
    .replace(/\bAuthored Extensions?\s*(?:Beyond\s+[^:;,.]+)?\s*(?:\(approved\s+\d{4}-\d{2}-\d{2}\))?\s*[:—-]?\s*/gi, "")
    .replace(/\b(?:closed|approved|authored)\s+\d{4}-\d{2}-\d{2}\b/gi, "")
    .replace(/\bInitial Registry Seed\s*(?:row\s*)?#?\d+\s*/gi, "")
    .replace(/\s*\(Controlled Vocabulary Registry extension\s*[—-]\s*registered in this prompt\)/gi, "")
    .replace(/(\S+)\s+is\s+\*\*Authored-Extension permitted\*\*\s*[—-]\s*new event kinds\b/gi, "$1 accepts new event kinds only when they")
    .replace(/\s+plus an Authored-Extension ledger row\b/gi, "")
    .replace(/\bregistered in this prompt\b/gi, "registered")
    .replace(/\b(?:Acceptance Criteria(?:\s*\([^)]*\))?|ACs?)\s*#?\d+(?:\s*[/,&]\s*#?\d+)*\b/gi, "the stated acceptance rules")
    .replace(/\s*\((?:Cross-refs?\s+)?[^()]*(?:\bAC\s*#?\d+|\bPhase\s+\d+(?:\.\d+)*\s+(?:closure|remediation))[^()]*\)/gi, "")
    .replace(/\s*\bper terminal Phase\s+\d+(?:\.\d+)*\s+completion\b/gi, "")
    .replace(/\bretired in this pass\b/gi, "removed")
    .replace(/\bretired in V\d+(?:\.\d+)*\b/gi, "removed")
    .replace(/\bsource-authority migration only,?\s+with no behavior change\b/gi, "")
    .replace(/^\s*Later-release rows remain registered\/inactive without entering R0 proof\.?\s*$/i, "Rows not enabled for the current release remain registered, inactive, and excluded from proof.")
    .replace(/^\s*R\d+-only\s+/i, "The later-release ")
    .replace(/\b(?:this\s+)?R0 proof\b/gi, "current-release proof")
    .replace(/\b(Global Inbox toggle,[^.\n]+?\bpreference inheritance)\s+are governed by User Preferences\s*\(Gap\s+29\.2\)/gi, "Saved preference settings control the $1")
    .replace(/\bThe UX's finite-seat display and 's stale\b/gi, "The finite-seat display and stale")
    .replace(/\bSilent downgrade to desktop-only is prohibited\b/gi, "Silent desktop-only downgrade is prohibited")
    .replace(/\bOutcome Resolver\s+Outcome Resolver\b/g, "Outcome Resolver")
    .replace(/^\s*Completion means\s*\/\s*/i, "")
    .replace(/\s*\*?\(Phase\s+\d+(?:\.\d+)*\s+V\d+(?:\.\d+)*\)\*?/gi, "")
    .replace(/\s+and active Linear owner\b/gi, "")
    .replace(/\s*[—-]\s*\.\s*$/, ".")
    .replace(/\bbefore mutation before mutation\b/gi, "before mutation")
    .replace(/\s+([,;:)]|\.(?!\.))/g, "$1")
    .replace(/\(\s*\)/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function sourceFree(value: string): { changed: boolean; pointerOnly: boolean; text: string } {
  if (SOURCE_AUTHORITY_LABEL.test(value) || SOURCE_BINDING_LINE.test(value) || SOURCE_POINTER_LIST.test(value) || SOURCE_CONSUMER_POINTER.test(value) || CROSS_REFERENCE_LINE.test(value)) {
    return { changed: true, pointerOnly: true, text: "" };
  }
  if (PURE_SOURCE_POINTER.test(value)) {
    return { changed: true, pointerOnly: true, text: "" };
  }
  const expanded = expandedSourceFree(value);
  if (expanded.pointerOnly) return expanded;
  let text = expanded.text.replace(LEADING_SOURCE_CITATION, "");
  text = text.replace(TRAILING_SOURCE_CITATION, "");
  text = text
    .replace(/\b(?:the\s+)?(?:Master Spec|UX Design(?: of Sourcera)?)(?:\s+§\s*(?:M\.)?\d+(?:\.[0-9A-Z]+)*)?/gi, "")
    .replace(/§\s*(?:M\.)?\d+(?:\.[0-9A-Z]+)*/gi, "")
    .replace(/\bAppendix\s+[A-M](?:\.\d+)*/gi, "")
    .replace(/\bSection\s+\d+(?:\.\d+)*/gi, "")
    .replace(/\b(?:and|or)\s*(?=[.;])/gi, "")
    .replace(/\bin\s+in\b/gi, "in")
    .replace(/(?:,\s*){2,}/g, ", ")
    .replace(/\(\s*(?:[,;/&]\s*)+\)/g, "")
    .replace(/\s+([,;:)]|\.(?!\.))/g, "$1")
    .replace(/\(\s*\)/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();
  if (SOURCE_POINTER_VERB.test(value) && DANGLING_PROJECTION.test(text)) {
    return { changed: true, pointerOnly: true, text: "" };
  }
  return { changed: expanded.changed || text !== value, pointerOnly: false, text };
}

function proseSentences(value: string): string[] {
  const protectedValue = protectMarkdownSpans(value);
  return protectedValue.text
    .split(/(?<=[!?])\s+(?=[A-Za-z0-9`(])|(?<=[^.]\.)\s+(?=[A-Za-z0-9`(])/)
    .map((sentence) => restoreMarkdownSpans(sentence, protectedValue.spans).trim())
    .filter(Boolean);
}

export function classifyCurrentClause(value: string): ProjectionKind {
  if (PURE_EXPANDED_REFERENCE_TOKEN.test(value)) return "history_only";
  const { text: protectedText } = protectMarkdownSpans(value);
  const decoded = protectedText.replace(MARKDOWN_ESCAPED_LITERAL, "$1").trim();
  if (!decoded) return "history_only";
  if (CURRENT_COMPATIBILITY_CONTEXT.test(decoded) && !PURE_CONTROL_PLANE.test(decoded)) return "current";
  if (/\bAuthored-Extension permitted\b/i.test(decoded) && CURRENT_RULE_ACTION.test(decoded)) return "mixed";
  const prefixed = historyPrefix(decoded);
  if (prefixed.changed && prefixed.text.trim()) return "mixed";
  if (
    HISTORY_ONLY_SENTENCE.test(decoded) ||
    PURE_CONTROL_PLANE.test(decoded) ||
    HISTORY_NARRATIVE.test(decoded) && !/\b(?:must|shall|reject|deny|return|persist|render|emit|write|record|compute|allow|prevent|require)\b/i.test(decoded) ||
    PURE_SOURCE_POINTER.test(decoded) ||
    SOURCE_AUTHORITY_LABEL.test(decoded) ||
    SOURCE_BINDING_LINE.test(decoded) ||
    SOURCE_POINTER_LIST.test(decoded) ||
    SOURCE_CONSUMER_POINTER.test(decoded) ||
    CROSS_REFERENCE_LINE.test(decoded) ||
    DELIVERY_CONTROL_HISTORY.test(decoded) ||
    NON_EXECUTABLE_REFERENCE_SENTENCE.test(decoded)
  ) return "history_only";
  return "current";
}

export function projectCurrentFragment(value: string): ProjectionResult {
  if (/^\s*(?:\*\*)?Section-numbering note\b/i.test(value)) {
    return {
      anchors: harvestSourceAnchors(value),
      diagnostics: [{ code: "history_removed", evidence: value.trim() }],
      kind: "history_only",
      text: "",
    };
  }
  const sentences = proseSentences(value);
  if (sentences.length > 1) {
    const projected = sentences.map((sentence) => projectCurrentFragment(sentence));
    const text = projected.map((result) => result.text).filter(Boolean).join(" ");
    const diagnostics = projected.flatMap((result) => result.diagnostics);
    const unresolved = diagnostics.some((diagnostic) =>
      diagnostic.code === "unresolved_essential" || diagnostic.code === "dangling_fragment"
    );
    return {
      anchors: harvestSourceAnchors(value),
      diagnostics,
      kind: unresolved ? "unresolved" : text === value.trim() ? "current" : text ? "mixed" : "history_only",
      text,
    };
  }
  const anchors = harvestSourceAnchors(value);
  const protectedValue = protectMarkdownSpans(value);
  const original = protectedValue.text;
  let text = original.replace(MARKDOWN_ESCAPED_LITERAL, "$1");
  const diagnostics: ProjectionDiagnostic[] = [];

  const controlFree = historyControlFree(text);
  text = controlFree.text;
  if (controlFree.changed) diagnostics.push({ code: "history_removed", evidence: value.trim() });
  const initialKind = classifyCurrentClause(restoreMarkdownSpans(text, protectedValue.spans));

  if (initialKind === "history_only") {
    diagnostics.push({ code: "history_removed", evidence: value.trim() });
    return { anchors, diagnostics, kind: "history_only", text: "" };
  }

  const prefixed = historyPrefix(text);
  text = prefixed.text;
  if (prefixed.changed) diagnostics.push({ code: "history_removed", evidence: value.trim() });

  const rewritten = currentOnlyInlineRewrites(text);
  if (rewritten !== text) diagnostics.push({ code: "history_removed", evidence: value.trim() });
  text = rewritten;

  const withoutSource = sourceFree(text);
  if (withoutSource.changed) {
    diagnostics.push({ code: "source_pointer_removed", evidence: value.trim() });
  }
  text = withoutSource.text;

  text = restoreMarkdownSpans(text, protectedValue.spans)
    .replace(/^\s*[,;:—-]+\s*/, "")
    .replace(/\s+([,;:)]|\.(?!\.))/g, "$1")
    .replace(/\s{2,}/g, " ")
    .trim();

  if (!text) {
    return {
      anchors,
      diagnostics: diagnostics.length > 0
        ? diagnostics
        : [{ code: "history_removed", evidence: value.trim() }],
      kind: withoutSource.pointerOnly ? "history_only" : initialKind,
      text: "",
    };
  }
  if (hasUnresolvedContractPlaceholder(text)) {
    diagnostics.push({ code: "unresolved_essential", evidence: text });
  }
  if (DANGLING_PROJECTION.test(text)) {
    diagnostics.push({ code: "dangling_fragment", evidence: text });
    return { anchors, diagnostics, kind: "unresolved", text: "" };
  }
  const unresolved = diagnostics.some((diagnostic) =>
    diagnostic.code === "unresolved_essential" || diagnostic.code === "dangling_fragment"
  );
  const changed = text !== value.trim();
  return {
    anchors,
    diagnostics,
    kind: unresolved ? "unresolved" : changed ? "mixed" : "current",
    text,
  };
}

function tableCells(line: string): { cells: string[]; leading: boolean; trailing: boolean } {
  const leading = /^\s*\|/.test(line);
  const trailing = /\|\s*$/.test(line);
  const source = line.trim();
  const cells: string[] = [];
  let cell = "";
  for (let index = 0; index < source.length; index += 1) {
    const character = source[index];
    if (character === "|" && source[index - 1] !== "\\") {
      cells.push(cell);
      cell = "";
    } else {
      cell += character;
    }
  }
  cells.push(cell);
  if (leading && cells[0] === "") cells.shift();
  if (trailing && cells.at(-1) === "") cells.pop();
  return { cells, leading, trailing };
}

function renderTableLine(cells: string[], leading: boolean, trailing: boolean): string {
  const body = cells.join(" | ");
  return `${leading ? "| " : ""}${body}${trailing ? " |" : ""}`;
}

export function projectCurrentMarkdown(raw: string): ProjectionResult {
  const anchors = harvestSourceAnchors(raw);
  const diagnostics: ProjectionDiagnostic[] = [];
  const output: string[] = [];
  let inFence = false;
  let removed = false;
  for (const rawLine of raw.split(/\r?\n/)) {
    if (/^\s*```/.test(rawLine)) {
      inFence = !inFence;
      output.push(rawLine);
      continue;
    }
    if (inFence || !rawLine.trim()) {
      output.push(rawLine);
      continue;
    }
    if (BARE_MARKDOWN_MARKER.test(rawLine)) {
      removed = true;
      continue;
    }
    if (/^\s*\|/.test(rawLine)) {
      const parsed = tableCells(rawLine);
      const separator = parsed.cells.every((cell) => /^\s*:?-{2,}:?\s*$/.test(cell));
      if (separator) {
        output.push(rawLine);
        continue;
      }
      const projected = parsed.cells.map((cell) => projectCurrentFragment(cell));
      diagnostics.push(...projected.flatMap((result) => result.diagnostics));
      removed ||= projected.some((result, index) => result.text !== parsed.cells[index].trim());
      output.push(renderTableLine(projected.map((result) => result.text), parsed.leading, parsed.trailing));
      continue;
    }
    const prefix = /^(\s*(?:#{1,6}\s+|[-*+]\s+(?:\[[ xX]\]\s+)?|\d+[.)]\s+|>\s*)?)(.*)$/.exec(rawLine);
    const marker = prefix?.[1] ?? "";
    const body = prefix?.[2] ?? rawLine;
    if (/^#{1,6}\s+$/.test(marker) && HISTORY_SECTION.test(body.trim())) {
      diagnostics.push({ code: "history_removed", evidence: rawLine.trim() });
      removed = true;
      continue;
    }
    const projected = projectCurrentFragment(body);
    diagnostics.push(...projected.diagnostics);
    if (!projected.text) {
      removed = true;
      continue;
    }
    removed ||= projected.text !== body.trim();
    output.push(`${marker}${projected.text}`.trimEnd());
  }
  const text = output.join("\n").replace(/\n{3,}/g, "\n\n").trim();
  const unresolved = diagnostics.some((diagnostic) =>
    diagnostic.code === "unresolved_essential" || diagnostic.code === "dangling_fragment" || diagnostic.code === "table_shape_changed"
  );
  return {
    anchors,
    diagnostics,
    kind: unresolved ? "unresolved" : removed ? "mixed" : "current",
    text,
  };
}

export function assertProjectionIntegrity(result: ProjectionResult): void {
  const blockers = result.diagnostics.filter((diagnostic) =>
    diagnostic.code === "unresolved_essential" ||
    diagnostic.code === "dangling_fragment" ||
    diagnostic.code === "table_shape_changed"
  );
  if (blockers.length > 0) {
    throw new Error(blockers.map((diagnostic) => `${diagnostic.code}: ${diagnostic.evidence}`).join("\n"));
  }
  const second = projectCurrentMarkdown(result.text).text;
  if (second !== result.text) throw new Error("current-source projection is not idempotent");
}
