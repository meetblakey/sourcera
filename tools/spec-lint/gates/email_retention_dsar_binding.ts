/**
 * Gate: `email_retention_dsar_binding`
 *
 * Assertion: Email-domain entities resolve to §40.2 retention rows and to the
 * §6.8.4.3 / §6.8.4.8 / §6.8.5 DSAR treatment.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import type { Finding, GateContext, SpecDoc, SpecLintGate } from "../lib/types.js";
import { m5RuntimeActiveFindings, push, requireTokens, sectionText } from "./email_domain_gate_helpers.js";

const EMAIL_ENTITIES = [
  { anchor: "4.9.1-emailtemplate", name: "EmailTemplate", sec: "§4.9.1" },
  { anchor: "4.9.2-emailsend", name: "EmailSend", sec: "§4.9.2" },
  { anchor: "4.9.3-emailevent", name: "EmailEvent", sec: "§4.9.3" },
  { anchor: "4.9.4-suppressionlistentry", name: "SuppressionListEntry", sec: "§4.9.4" },
  { anchor: "4.9.5-unsubscribepreference", name: "UnsubscribePreference", sec: "§4.9.5" },
] as const;

function retentionDsarFindings(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  const retention = sectionText(doc, "40.2-data-retention-and-deletion");
  const registry = sectionText(doc, "6.8.4.3-cascade-class-coverage-registry");
  const emailDsar = sectionText(doc, "6.8.4.8-email-domain-dsar-and-suppression-preservation");
  const retained = sectionText(doc, "6.8.5-audit-integrity-exemption");

  if (!retention) push(findings, doc, 0, "40.2-data-retention-and-deletion", "§40.2 retention section is missing.");
  if (!registry) push(findings, doc, 0, "6.8.4.3-cascade-class-coverage-registry", "§6.8.4.3 DSAR registry section is missing.");
  if (!emailDsar) push(findings, doc, 0, "6.8.4.8-email-domain-dsar-and-suppression-preservation", "§6.8.4.8 email DSAR section is missing.");
  if (!retained) push(findings, doc, 0, "6.8.5-audit-integrity-exemption", "§6.8.5 retained-row section is missing.");

  for (const entity of EMAIL_ENTITIES) {
    requireTokens(findings, doc, entity.anchor, entity.name, [`Retention follows §40.2 ${entity.name}`, "§6.8"]);
    if (retention && !retention.text.includes(`| ${entity.name} (`)) {
      push(findings, doc, retention.startLine, entity.name, `§40.2 is missing retention row for ${entity.name}.`);
    }
    if (registry && !registry.text.includes(`| ${entity.sec} | ${entity.name} |`)) {
      push(findings, doc, registry.startLine, entity.name, `§6.8.4.3 is missing DSAR registry row for ${entity.name}.`);
    }
    if (emailDsar && !emailDsar.text.includes(`| ${entity.name} |`)) {
      push(findings, doc, emailDsar.startLine, entity.name, `§6.8.4.8 is missing cascade-rule row for ${entity.name}.`);
    }
  }

  if (retained) {
    for (const token of ["| 16 | Email suppression, unsubscribe, complaint, hard-bounce, and legal/abuse suppression rows (§4.9.4 / §4.9.5)", "Hashed subject value, reason code, source, and timestamps retained"]) {
      if (!retained.text.includes(token)) {
        push(findings, doc, retained.startLine, token, "§6.8.5 row 16 is missing required email suppression retained-row token.");
      }
    }
  }
  if (emailDsar) {
    for (const token of ["pending EmailSend rows", "email_send_canceled_dsar", "row 16", "email suppression and unsubscribe records"]) {
      if (!emailDsar.text.includes(token)) {
        push(findings, doc, emailDsar.startLine, token, "§6.8.4.8 is missing required email DSAR token.");
      }
    }
  }
  return findings;
}

export const gate: SpecLintGate = {
  id: "email_retention_dsar_binding",
  sourcePhase: "v7.2.0-REM Phase 41",
  rowClass: "spec_tree_lint",
  executionContext: "pr_lint",
  overridePath: "not_permitted_gdpr_art_17",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    return [...retentionDsarFindings(ctx.masterSpec), ...m5RuntimeActiveFindings(ctx.masterSpec, "email_retention_dsar_binding")];
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
