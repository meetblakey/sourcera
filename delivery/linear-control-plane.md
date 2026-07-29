# Linear delivery control plane

Linear is the sole planning source. Its native initiatives, projects, milestones, releases, hierarchy, status, assignee, estimate, and relations define the current plan.

`Sourcera_Master_Spec.md` is the product source. The canonical Linear planning document carries the current full Master and UX SHA-256 fingerprints. Each executable Linear issue carries its source ID, ordered document set, exact single section or registered slice count, binding digest, and content checksum. `delivery/ticket-source-checksums.json` owns the ordered slices; multi-slice issue prose does not repeat every heading. Source IDs identify Master requirements; they are not Linear issue references.

Each governed project has one native Linear PRD or engineering/readiness brief. It binds the current Master Spec checksum and sections, defines the durable product or readiness contract, and omits native planning fields. Approved R0 supplements may narrow the release-wide journey, pilot targets, and production runbook. An unresolved choice has one native Decision issue in its owning project with exact native blocking edges to affected work. Completed Decisions retain those native history edges, leave unresolved-document sections, and no longer block execution.

## Generated state

- `delivery/linear-snapshot.json` is generated from a complete live readback. Never hand edit it.
- Release assignments, hierarchy, issue inventory, and dependency edges are derived from live Linear fields and native relations.
- `reports/delivery/` is generated. Never hand edit it.

## Repository policy

- `delivery/linear-program-scope.json` pins the approved outcome initiatives, the team-level planning document, each project's single initiative membership, every canonical project document, and approved R0 supplements. The Master Spec remains source authority and is never represented as an initiative.
- The capture receipt binds planning and project-document body hashes, required headings, native attachment IDs, exact Master Spec bindings, and full project and milestone description hashes.
- Project documents cannot copy issue IDs, Linear URLs, workflow fields, releases, initiatives, milestones, leads, assignments, estimates, dates, priority, or relations. Native Decision mentions are the only issue references permitted and must resolve to the exact open owning issue and its native blocking targets. Completed Decision identity, labels, body, lifecycle, and native history remain attested without an unresolved document reference.
- `delivery/linear-project-scope.json` pins the governed project set.
- `delivery/linear-source-policy.json` contains only coordination-parent identities and reviewed ambiguity, supersession, clearing, or split exceptions. It is not a second plan.
- `delivery/linear-normalization-source-map.json` is historical normalization and audit input only. Its enforced marker grants no product, planning, or publication authority; it cannot satisfy promotion or override current Master Spec provenance or live Linear fields.
- `delivery/dispositions.json`, `delivery/feature-dependencies.json`, and release policy files hold product invariants. They do not override live planning fields.

If repository planning data and live Linear both claim authority for the same field, validation fails.

## Promotion

1. Capture live Linear with its run receipt.
2. Build the candidate and candidate receipt outside the repository.
3. Validate current Source provenance, program scope, native relations, and candidate semantics.
4. Promote only the receipt-bound candidate from canonical `main` CI.
5. Download that same run and attempt's immutable handoff in the dependent publication job.
6. Reject a stale capture, changed checkout, mismatched receipt, release definition, or artifact digest.
7. Regenerate `delivery/release-plan.json` and every `reports/delivery/` file from the handoff plus the same stamp and exact-status inputs.
8. Publish the review package as an immutable artifact. Apply its repository-shaped files on a review branch, then use the normal pull request and required checks. Never push the snapshot directly to `main`.

The delivery-mirror publication job above has no Linear secret and no repository write permission. Its artifact digest comes only from the preceding pinned upload step in the same GitHub run. `tools/delivery/prepare-linear-publication.ts` also binds the exact handoff, candidate receipt, capture receipt, runtime scans, releases, generated release plan, and reports into `attestation/linear-publication-receipt.json`.

## Authority cutover

The separate Linear authority publication workflow is manual, main-only, and single-flight. It has three guarded modes:

1. `baseline` performs a fresh read-only capture and emits only the safe Requirement identity registry plus exact native label-contract candidate. Review and commit both before publication.
2. `dry-run` recompiles the complete authority package from the committed source set, committed baseline, and a fresh live capture. It validates every native identity, field, label, hierarchy edge, relation, source binding, and operation without obtaining a write credential.
3. `apply` requires the operator to provide the exact dry-run plan root. It revalidates adopted targets immediately before each update, records a durable redacted journal, performs a fresh post-write capture, recompiles, reapplies, and succeeds only when the stable readback applies zero changes. Its full post-write Requirement identity registry must then be reviewed and committed before cutover is complete.

Raw issue descriptions, document bodies, native captures, allocation files, and publication packages remain inside the job and are deleted on every outcome. Only safe summaries, the baseline registry, plan roots, and redacted journals may leave the job.

`delivery/linear-authority-requirement-bootstrap-map.json` pins the audited REQ-1..REQ-61 identity bridge to the validated offline artifact. Baseline derivation uses that map for those rows, requires exact desired native state for REQ-62 onward, and rejects dirty governed inputs. The baseline pass also emits the exact ten-label and four-group contract for `delivery/linear-program-scope.json`; later passes require the committed UUIDs, names, colors, descriptions, scopes, and parents to match fresh native capture.

The first `baseline` run emits a receipt-bound, mutation-disabled label-bootstrap candidate when any approved label is missing. Review that artifact, create only its exact `risk`, `delivery-risk`, and `financial-risk` workspace labels through native Linear label creation, and read them back before rerunning `baseline`. A partial creation is recovered only by a fresh capture and a smaller candidate. The completed run emits the initialized 10-label and four-group contract plus the 186-Requirement identity registry; both must be reviewed and committed before `dry-run` is available.

Descriptions never emulate labels, parents, projects, milestones, releases, or relations. Issue references use native Linear relations unless the text itself is required product context; every retained narrative mention must resolve to the intended issue and remain semantically valid.

Run `tools/delivery/source-provenance-blocks.ts` to generate the exact registered provenance blocks. Run `tools/delivery/reconcile-linear-source-provenance.ts` to prepare or apply checksum updates. It derives active owners from the live capture and fails closed when the requirement ID, document set, single section or bundle count, binding digest, or checksum drifts. Apply mode requires guarded pre-write readback, direct post-write readback, a full post-capture, and rollback on any mismatch.

Archived or canceled issues cannot receive active source ownership. Coordination parents cannot become executable.
