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

## Release order

1. Stage all three Production applications through the immutable release controller, without assigning domains:

   ```bash
   npm run vercel:stage:production -- \
     --receipt-out /secure/evidence/vercel-stage.json
   ```

2. Preserve the controller receipt. It records all three deployment IDs after provider readback verifies each Git SHA, environment snapshot, project, predecessor, and health payload against the approval.
3. From the same approved checkout, run the Convex controller exactly once:

   ```bash
   npm run convex:deploy:production -- \
     --known-good-receipt /secure/evidence/convex-known-good.json \
     --receipt-out /secure/evidence/convex-candidate.json
   ```

   Before any deploy, the controller creates a clean detached known-good checkout, installs locked dependencies without credentials, and runs the protected zero-customer-data canary. It requires the exact known-good runtime SHA, pinned deployment, and sample thresholds. It does not deploy or stamp this baseline checkout.

   Only after that live baseline passes does the controller create and install a clean detached candidate, stamp its controlled release identity, deploy it, and run the candidate canary. Buyer and Seller never mutate the backend.
4. If candidate deploy returns an error or the candidate canary fails, the mutation is treated as unsafe. The command removes the candidate checkout, creates a clean detached checkout at `SOURCERA_KNOWN_GOOD_SHA`, redeploys it, and reruns the protected canary. A proved rollback emits `convex_production_rollback_receipt` with `candidate_failed_rolled_back` and `promotionAllowed: false`, then exits nonzero. Do not promote.
5. Re-read the staged Vercel deployment IDs immediately before promotion. Reject stale SHA, project, environment, or approval receipts.
6. Promote Marketplace, Buyer, then Seller:

   ```bash
   vercel promote <marketplace-deployment-url>
   vercel promote <buyer-deployment-url>
   vercel promote <seller-deployment-url>
   ```

7. Check `/api/health`, runtime logs, and the R0 smoke on every production domain. Retain the provider IDs, target, SHA, predecessor, approval, canary, health, timestamps, and approver.

Convex code becomes active before app promotion. Every backend change must remain compatible with the currently live clients until all three promotions and the cleanup release complete.

## Rollback

1. Stop promotion at the first failed check.
2. Roll back any promoted app to its recorded predecessor: `vercel rollback <deployment-url>`.
3. Preserve the controller's rollback receipt. It binds the historical receipt hash, live-proved rollback anchor, exact target, candidate failure, rollback SHA, and passing rollback canary without converting the candidate to success.
4. If automatic rollback reports `rollback_failed`, stop and open a production incident. The candidate command is not a rollback-only command and must not be rerun as one. Keep promotion blocked until an approved recovery change redeploys the recorded known-good SHA and produces a passing protected canary.
5. If the controller receives a termination signal after mutation starts, it writes an `interrupted_after_mutation` recovery-required receipt. Stop promotion and recover through the incident path; a signal handler cannot safely assert that rollback completed.
6. Use backup restore only for an approved data-recovery event. Code rollback must not reverse an incompatible data migration.

## Provider references

- [Convex deploy order](https://docs.convex.dev/cli/reference/deploy)
- [Convex deploy-key permissions](https://docs.convex.dev/team-management/role-actions)
- [Convex safe production changes](https://docs.convex.dev/production/overview)
- [Vercel staged production deployments](https://vercel.com/docs/cli/deploying-from-cli)
- [Vercel promotion and rollback](https://vercel.com/docs/instant-rollback)
