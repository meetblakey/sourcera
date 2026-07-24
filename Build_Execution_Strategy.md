# Sourcera Build Execution Strategy

This stable path is retained as a pointer. The former milestone-pack strategy is obsolete.

## Current execution model

- Linear is the active plan and execution queue.
- Each issue is self-contained and can be executed without reopening the Master Spec.
- Native Linear fields and relations own planning structure and dependency state.
- Repository delivery policy and verification inputs live in `delivery/`; they do not form a parallel plan.
- Generated verification output lives in `reports/delivery/`; never hand edit it.
- The six native Linear outcome initiatives, projects, milestones, releases, native relations, and canonical planning document are the only execution plan. The Master Spec is source authority, not a duplicate initiative.

Implementation follows the issue contract, repository instructions, and current code. Delivery readiness comes only from the verifier and live release scanners defined in `AGENTS.md`.
