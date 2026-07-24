# R0 application foundation

## Install and verify

```bash
npm ci
SOURCERA_ENV=staging SOURCERA_COMMIT_SHA=$(git rev-parse HEAD) npm run validate:deploy
npm run verify
```

The deploy check prints metadata only. Never put secrets in these fields.

## Stage

```bash
commit_sha=$(git rev-parse HEAD)
vercel deploy --yes \
  --build-env SOURCERA_ENV=staging \
  --build-env SOURCERA_COMMIT_SHA="$commit_sha" \
  --env SOURCERA_ENV=staging \
  --env SOURCERA_COMMIT_SHA="$commit_sha"
```

Open `/api/health`. The returned commit must equal `commit_sha`.

## Roll back

1. Find the last healthy preview deployment with `vercel list`.
2. Run `vercel redeploy <deployment-id> --target preview`.
3. Open `/api/health` on the restored preview deployment.
4. Record the deployment URL, commit, result, and time in the evidence receipt.

Do not send customer traffic until health and rollback checks pass.

## Production

`Production release` is normal-only and currently uploads an immutable no-provider, no-authority receipt before deliberate failure under `DEC-PROD-002`; it does not download historical authority. The separate `Vercel production baseline` workflow may create the first predecessor set only after every target and domain is pinned; partial activation is recovery-required, not rollback. `Convex anchor bootstrap recovery` requires the immutable baseline artifact and exact attempt-specific provenance. Its route is machine-proved as `initial_genesis` or `expired_anchor` from GitHub-retained repository-wide artifacts plus exact attempt/job history; narrative reason or a boolean cannot authorize it. Retention is not permanent history, so `DEC-PROD-005` also requires a non-expiring sentinel before any authority can promote. Follow [Convex and Vercel production release](./convex-production.md). Never promote a Preview-bound artifact or combine Convex and Vercel write credentials in one job. Production stays blocked until the isolated target, sentinel, durable coordinator lease/finalizer, live gates, approval, and attempt-bound authority all pass.
