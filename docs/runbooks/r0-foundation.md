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

Use Master Spec §46.3.1, the current native Linear Decision, and [Convex and Vercel production release](./convex-production.md). This file does not duplicate production status or approval state.
