# Convex and Vercel production release

Owner: Blake Rowley

Scope: production foundation; no release may bypass delivery or runtime gates.

## Bind the provider once

Record the live Convex production deployment name and exact public URL in `config/production-targets.json`. Commit and review that nonsecret pin before configuring credentials. Production remains blocked while either value is null.

The pin and production deploy key must name the same deployment. Changing credentials cannot redirect the release.

## Credentials and configuration

Vercel Production receives no Convex production key. Set only:

- `SOURCERA_ENV=production`
- `SOURCERA_DOMAIN` equal to the project: `marketplace`, `buyer`, or `seller`
- `SOURCERA_RELEASE_APPROVED_SHA` equal to the approved full Git SHA

The repo pin supplies `NEXT_PUBLIC_CONVEX_URL`. `CONVEX_DEPLOY_KEY`, `SOURCERA_CONVEX_CANARY_SECRET`, `CONVEX_PREVIEW_NAME`, and `CONVEX_DEPLOYMENT` are forbidden in Vercel Production.

The central Vercel staging environment requires `VERCEL_TOKEN`. The controller gives it only to Vercel commands, uses a fresh private home, and never forwards it to Git or an application build.

GitHub approval verification requires `SOURCERA_RELEASE_GITHUB_TOKEN`, scoped only to this repository with Administration read plus Actions, Checks, Contents, and Deployments read. It is passed only to the protected GitHub-proof job. `GITHUB_TOKEN` remains limited to artifact download.

The checked-in workflows keep credentials in separate jobs. Ordinary release uses no provider or GitHub credential. The first-baseline workflow may receive only `VERCEL_TOKEN`. Bootstrap GitHub proof and Convex canary run in separate jobs, and the canary job receives no Vercel or deploy credential. The dormant combined mutation controller is not an executable release path.

`DEC-PROD-004` requires future live Convex and Vercel mutation to use separate receipt-bound jobs under the durable coordinator. No job or parent process may hold both write credentials. Cancellation, expiry, compensation, and final receipt persistence must be proved before that path is enabled.

The central release environment requires:

- `CONVEX_DEPLOY_KEY`: production key with `deployment:deploy` only
- `SOURCERA_CONVEX_CANARY_SECRET`: at least 32 random characters, also set in the pinned Convex deployment
- `SOURCERA_ENV=production`
- `SOURCERA_COMMIT_SHA` and `SOURCERA_RELEASE_APPROVED_SHA`: the checked-out candidate SHA
- `SOURCERA_KNOWN_GOOD_SHA`: the last proved backend SHA

The canary secret authorizes only the dedicated HMAC-protected probe functions. Rotate it separately from the deploy key. Never print either value in a receipt.

Pass the last passing historical deployment receipt and a new receipt path outside the repository:

```bash
npm run convex:deploy:production -- \
  --known-good-receipt /secure/evidence/convex-known-good.json \
  --receipt-out /secure/evidence/convex-candidate.json
```

The historical receipt supplies evidence and its immutable hash. It is not rollback authority. The controller must live-prove its SHA against the exact pinned deployment before any candidate mutation. That SHA must be a different ancestor of the candidate.

The output path is mandatory. It must be new, distinct, and outside the repository; repository-controlled paths and symlink escapes are rejected. Receipts are written atomically with private permissions and never overwritten.

The controller starts every release with a fresh private home and configuration directory. It forwards only required system variables. The deploy checkout receives only the deploy key; canary checkouts receive only the canary secret.

## Preconditions

1. Prove the candidate in CI and a commit-bound Convex Preview.
2. Pass the delivery verifier and both live release scanners.
3. Use expand-and-contract schema changes only. Create a recoverable backup before data-changing work.
4. Record the last healthy Vercel deployment for each app and the last proved Convex SHA.
5. Use a clean checkout whose `git rev-parse HEAD` equals the approval SHA.
6. Protect the `sourcera-production-release` GitHub environment with Blake as its sole reviewer, protected branches only, self-review allowed, and admin bypass disabled.

## Convex anchor bootstrap and recovery

### First Vercel production baseline

The ordinary release controller requires a healthy predecessor for Marketplace, Buyer, and Seller. It never creates the first Vercel production baseline. Use only the separate protected `Vercel production baseline` workflow after the exact Convex production target and every production domain are repo-pinned and live provider readback matches those pins.

The baseline workflow stages Marketplace, Buyer, and Seller as production-target deployments without traffic. It must prove all three exact Git SHAs, projects, environment keys, Convex URL, READY/STAGED states, and deployment health before persisting one immutable stage receipt. A second protected job revalidates that exact receipt and the three candidates before activating Marketplace, Buyer, then Seller.

Vercel activation is per project, so the first baseline cannot be atomic and has no predecessor to restore. If activation stops or a readback fails, stop new mutations, classify every application as `candidate_live_healthy`, `staged_not_live`, `unexpected`, `unhealthy`, or `readback_failed`, and emit `recovery_required`. Resume only from the same stage receipt and only when each live target is either the exact candidate or the original absent/failed state and every remaining candidate is healthy. In GitHub, open the original run and choose **Re-run jobs → Re-run failed jobs**. With GitHub CLI, run `gh run rerun RUN_ID --failed`, then `gh run watch RUN_ID`. Do not use **Re-run all jobs** or `gh run rerun RUN_ID` without `--failed`; that would rerun successful prerequisite jobs instead of preserving their immutable artifacts. See [GitHub's failed-job re-run procedure](https://docs.github.com/en/actions/how-tos/manage-workflow-runs/re-run-workflows-and-jobs). Never describe this path as rollback. Strict rollback starts only after this baseline is complete, or earlier if a separate healthy maintenance predecessor is deliberately provisioned for every project.

An attempt 2+ activation receipt is recovery evidence only and remains non-promotable for Convex bootstrap until exact later-attempt protected-environment approval evidence is added to the activation artifact and provenance validator. The validation trigger is a reviewed receipt schema that binds that approval to the same run, attempt, SHA, stage receipt, and artifact digest. Until then, keep bootstrap blocked; do not relabel or copy the retry artifact.

The baseline remains blocked while any domain, Convex target, protected environment, credential, required check, delivery proof, or live scanner is missing. Current live Vercel state does not satisfy those prerequisites.

The first controlled Convex release remains blocked until the repo pins all three production domains, the Convex target, and a live known-good Convex SHA. `Convex anchor bootstrap recovery` does not create Vercel deployments or domains. It accepts only the exact nonexpired successful activation artifact from `Vercel production baseline`: pin the baseline SHA, run ID, attempt, exact artifact name and GitHub digest, plus the SHA-256 of the downloaded stage-receipt bytes. GitHub proof reads `/actions/runs/{runId}/attempts/{runAttempt}`, so a later rerun cannot replace the selected attempt, and validates the exact passed activation and canonical stage receipts. A boolean or live-state assertion is not evidence. Do not invent a historical receipt or use a candidate deployment as its own rollback anchor.

The already-live SHA must contain the stamped `foundation:observeProductionProbe` query and the same canary secret. The bootstrap calls that query 20 times with fresh HMAC-bound nonces that were never recorded. A successful `null` response proves the expected build SHA and deployment passed validation before the lookup. The bootstrap never calls `recordProductionProbe`, `clearProductionProbe`, or `convex deploy`. If the query, stamp, target, secret, or exact SHA is missing, there is no read-only fallback; stop.

Only the protected production controller may create the strict current-run approval receipt and invoke:

```bash
npm run convex:bootstrap:production -- \
  --approval-receipt "$RUNNER_TEMP/github-production-approval.json" \
  --receipt-out "$RUNNER_TEMP/convex-production-genesis.json"
```

Run it from a clean checkout whose `HEAD` is the exact approved candidate and whose recorded live SHA is a distinct ancestor. The bootstrap child receives only `SOURCERA_CONVEX_CANARY_SECRET`, the two SHAs, and the current GitHub run identity. Deploy, Vercel, GitHub, admin, local deployment, and unrelated credentials are forbidden. Both receipt paths remain outside the checkout; output is atomic, private, and non-overwriting.

The resulting `convex_production_genesis_receipt` is non-promotable and binds the known-good SHA, exact candidate, pinned target, current run and attempt, approval-receipt hash, clean checkout, and observe-only proof. It is accepted only inside that same approved run. The first successful controlled Convex release emits the normal deployment receipt; every later release uses that normal historical receipt, never genesis.

For the first controlled Convex release after the Vercel baseline exists, dispatch the separate protected `Convex anchor bootstrap recovery` workflow with the exact live known-good SHA, `initial_genesis` or `expired_anchor`, reviewed narrative context, and immutable Vercel baseline activation pins. The narrative reason never authorizes the route. The proof inventories current workflow runs and exact attempts, plus repository-wide retained authority artifacts and their attempt/job histories, so a renamed or copied workflow cannot disappear from retained evidence. Each retained normal, Convex-anchor, or Vercel-baseline authority must also expose its exact workflow file at the run SHA; the file bytes must match an approved kind, path, and SHA-256 entry in `config/production-release.json`. A rename is accepted only after that retained lineage entry is reviewed and checked in. `initial_genesis` requires no retained authority artifact. `expired_anchor` requires the newest retained authority artifact to be expired and rejects every retained nonexpired replacement. A bootstrap authority from an intentionally blocked overall run counts only when its exact `convex-anchor` job passed. The route proof hash and its `github_retained_artifacts` limitation are bound into the handoff, controller binding, approval source hash, and blocked/final receipts.

This is not permanent first-ever or single-use proof. GitHub artifact retention can erase history. `DEC-PROD-005` therefore keeps every derived authority non-promotable until a non-expiring protected sentinel records the first issuance and a durable lease/finalizer enforces single use.

While `DEC-PROD-002` remains blocked, bootstrap has one canary-only Convex job and no deploy or Vercel credential. It emits a non-promotable `production-anchor-authority-<known-good-sha>-<run-id>-<attempt>` artifact, then an immutable blocked receipt, and the workflow fails closed. The ordinary workflow is also non-promotable: after its preflight it emits and uploads an immutable no-provider, no-authority receipt, performs no historical download, and deliberately fails. No job or Node process receives both Convex and Vercel write credentials. Enabling release mutation requires separate receipt-bound Convex and Vercel jobs plus the pinned isolated-candidate coordinator, lease, expiry compensation, and single-use finalizer.

## Release order

The canonical ordinary entry point will be the serialized manual `Production release` workflow after `DEC-PROD-002` is resolved. It currently uploads a no-authority receipt and fails without downloading historical authority. Initial Convex anchor proof after the Vercel baseline exists, and expired-anchor proof, use only `Convex anchor bootstrap recovery`; they do not authorize promotion. Both validate live scanners, delivery integrity, exact remote `main`, branch protection, required checks, environment approval, collaborator identity, and artifact provenance. The commands below describe future receipt-bound phases; running one alone never authorizes promotion.

1. Stage all three Production applications through the immutable release controller, without assigning domains:

   ```bash
   npm run vercel:stage:production -- \
     --receipt-out /secure/evidence/vercel-stage.json
   ```

2. Preserve the controller receipt. It records all three deployment IDs after provider readback verifies each Git SHA, environment snapshot, project, predecessor, and health payload against the approval.
3. Keep `proofCollection.mode` blocked until the protected release-control project, distinct isolated Convex target, authenticated collectors, expiry compensation, and single-use finalizer are pinned. The production stage receipt is not proof that the Vercel candidates use isolated Convex.
4. Through the durable coordinator, create separate staging proof deployments. Validate `isolated_production_proof_environment`; every proof deployment must bind its backend environment to the isolated Convex deployment and must not reuse the production-target deployment IDs.
5. Collect and validate the real invited-human customer proof and operational proof against that isolated binding. Then validate `durable_production_proof_collection` against the exact environment, customer, and operational receipt hashes. Any missing or invalid proof stops before live Convex mutation.
6. Only after the durable proof bundle passes, run the live Convex controller exactly once:

   ```bash
   npm run convex:deploy:production -- \
     --known-good-receipt /secure/evidence/convex-known-good.json \
     --receipt-out /secure/evidence/convex-candidate.json
   ```

   Before any deploy, the controller creates a clean detached known-good checkout, installs locked dependencies without credentials, and runs the protected zero-customer-data canary. It requires the exact known-good runtime SHA, pinned deployment, and sample thresholds. It does not deploy or stamp this baseline checkout.

   Only after that live baseline passes does the controller create and install a clean detached candidate, stamp its controlled release identity, deploy it, and run the candidate canary. Buyer and Seller never mutate the backend.
7. If candidate deploy returns an error or the candidate canary fails, the mutation is treated as unsafe. The command removes the candidate checkout, creates a clean detached checkout at `SOURCERA_KNOWN_GOOD_SHA`, redeploys it, and reruns the protected canary. A proved rollback emits `convex_production_rollback_receipt` with `candidate_failed_rolled_back` and `promotionAllowed: false`, then exits nonzero. Do not promote.
8. Re-read the production-target Vercel deployment IDs immediately before promotion. Reject stale SHA, project, environment, or approval receipts.
9. Promote Marketplace, Buyer, then Seller:

   ```bash
   vercel promote <marketplace-deployment-url>
   vercel promote <buyer-deployment-url>
   vercel promote <seller-deployment-url>
   ```

10. Check `/api/health`, runtime logs, and the R0 smoke on every production domain. Retain the provider IDs, target, SHA, predecessor, approval, canary, health, timestamps, and approver.

After the durable coordinator exists, the workflow must upload the final production receipt and paired Convex receipt in `production-release-<sha>-<run-id>-<attempt>`. The release receipt file is `production-release-<run-id>-<attempt>.json`. A later normal release must pin that exact run, attempt, artifact name, GitHub digest, and approved workflow bytes at the run SHA; a latest-run lookup or attempt-free filename is invalid. The current blocked workflows emit only authority-proof and blocked receipts; neither permits promotion. A later normal release may accept only a complete passed attempt-bound release receipt and its paired passing Convex deployment receipt for the exact anchor SHA. Rolled-back, failed, recovery-required, Convex rollback, bootstrap, and blocked receipts are never forward release anchors.

Release artifacts retain the maximum 90-day operational window. Before the current anchor expires, ship another normally approved release. If the Convex anchor expires first, promotion remains blocked: supply the still-nonexpired immutable Vercel production baseline activation artifact and use the separately reviewed Convex anchor recovery route to live-prove the currently deployed Convex SHA and create a new immutable anchor. If that artifact expired, recreate evidence through an approved recovery design; never copy it into a newer run or relax provenance checks.

Convex code becomes active before app promotion. Every backend change must remain compatible with the currently live clients until all three promotions and the cleanup release complete.

## Rollback

1. Stop promotion at the first failed check.
2. Roll back any promoted app to its recorded predecessor: `vercel rollback <deployment-url>`.
3. Preserve the controller's rollback receipt. It binds the historical receipt hash, live-proved rollback anchor, exact target, candidate failure, rollback SHA, and passing rollback canary without converting the candidate to success.
4. After any candidate Convex mutation that must be reversed, the controller delegates restoration to the rollback-only command below. If it fails, stop and open a production incident. Keep promotion blocked until an approved recovery change redeploys the recorded known-good SHA and produces a passing protected canary.
5. If the controller receives a termination signal after traffic mutation starts, it re-reads provider state, rolls candidate traffic back in Seller → Buyer → Marketplace order, and proves every predecessor domain healthy. It writes a rollback receipt only when provider readback proves recovery; otherwise it writes `recovery_required` and the release stops.
6. Use backup restore only for an approved data-recovery event. Code rollback must not reverse an incompatible data migration.

### Convex forced rollback

This is the controller's standard Convex rollback owner after live candidate mutation, including deployment, canary, or application-promotion failures. Isolated proof validation happens earlier and cannot trigger a live rollback. The controller binds the exact candidate, known-good SHA, pinned target, known-good receipt bytes, and receipt SHA-256:

```bash
npm run convex:rollback:production -- \
  --known-good-receipt /secure/evidence/convex-known-good.json \
  --known-good-receipt-sha256 "$APPROVED_RECEIPT_SHA256" \
  --receipt-out /secure/evidence/convex-forced-rollback.json
```

Run it from a clean checkout at `SOURCERA_COMMIT_SHA`, with a distinct ancestor in `SOURCERA_KNOWN_GOOD_SHA`. Supply the production deploy key and canary secret. The approved digest must come from the protected evidence manifest, not from hashing the supplied file during the incident.

The command accepts a normal passing deployment receipt, or the exact current-run genesis receipt described below, at the known-good SHA and pinned target. It creates a clean detached known-good worktree, installs without credentials, deploys with only the deploy key, and probes with only the canary secret. A signal before provider mutation stops the command. Once deploy begins, signals are recorded but cannot cancel deploy or proof; the process waits for the protected canary and atomic external receipt. The receipt is non-promotable and never overwrites existing evidence. Missing proof or any mismatch leaves rollback failed.

For the first protected release, the known-good input is the current-run genesis receipt. Add `--approval-receipt /secure/evidence/github-production-approval.json`. The command hashes those exact approval bytes and requires the same repository, run, attempt, candidate SHA, approval hash, target, and known-good SHA recorded by genesis. Genesis requires this external approval receipt; a normal deployment receipt forbids it. All input and output paths must be distinct and outside the checkout. A passing genesis-based rollback receipt retains the approval-receipt hash.

## Provider references

- [Convex deploy order](https://docs.convex.dev/cli/reference/deploy)
- [Convex deploy-key permissions](https://docs.convex.dev/team-management/role-actions)
- [Convex safe production changes](https://docs.convex.dev/production/overview)
- [Vercel staged production deployments](https://vercel.com/docs/cli/deploying-from-cli)
- [Vercel promotion and rollback](https://vercel.com/docs/instant-rollback)
