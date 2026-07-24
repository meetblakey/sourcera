# Sourcera Linear Execution Plan

This stable path is retained as a pointer. The former blueprint is obsolete and must not be used to create or restore Linear work.

## Current plan

- Product and engineering authority: `Sourcera_Master_Spec.md`.
- UX authority where the Master Spec is silent: `UX_Design_of_Sourcera.md`.
- Delivery policy and verification inputs: `delivery/`; they do not form a second plan.
- Generated delivery reports: `reports/delivery/`; never hand edit them.
- Linear plan: the six native outcome initiatives, projects, milestones, releases, native relations, and canonical planning document. The Master Spec is source authority, not an initiative.

## Linear rules

- Every issue contains its complete executable contract.
- Teams, projects, milestones, releases, parents, labels, estimates, assignees, blockers, and related work use native Linear fields and relations.
- Titles and descriptions do not repeat Linear identifiers, source-family identifiers, or native planning metadata.
- Canceled, archived, duplicate, and trashed records are not part of the plan and must not retain active requirement ownership.
- Repository delivery artifacts verify live Linear; they never override live planning state.

Validate current delivery truth with `tools/delivery/verify.ts` and the live release scanners defined in `AGENTS.md`.
