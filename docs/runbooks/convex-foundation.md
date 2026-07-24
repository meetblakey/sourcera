# Convex Preview foundation

Owner: Blake Rowley
Issue: PLA-282
Scope: Preview only; no production traffic or customer data.

## Required configuration

- Convex project: `sourcera`
- GitHub secret: `CONVEX_PREVIEW_DEPLOY_KEY`
- GitHub variable: `CONVEX_EXPECTED_PROJECT` as `team-slug/project-slug`
- Vercel Preview variable on Marketplace, Buyer, and Seller: `CONVEX_DEPLOY_KEY`
- Vercel Preview variable on all three projects: `CONVEX_EXPECTED_PROJECT`
- GitHub and Vercel Preview name: `sourcera-pr-<pull-request-number>-<commit-sha>`
- Before a pull request exists, Vercel uses the normalized branch plus the commit SHA.
- Public client variable: `NEXT_PUBLIC_CONVEX_URL`

The deploy key must start with `preview:`. `CONVEX_DEPLOYMENT` is forbidden in this path because it can select a default production deployment.

## Normal rollout

1. Open or update the pull request.
2. Application CI validates the Preview key and target.
3. CI runs `npx convex deploy --preview-name ...` and builds all three applications with the generated Preview URL.
4. CI rejects changed generated files.
5. CI runs `npm run convex:probe` and retains the receipt artifact.
6. Confirm p95 is at most 500 ms and p99 is at most 1 second.

Each Vercel project also runs Convex's `deploy --cmd` flow. Convex supplies the matching commit-bound Preview URL to that application build; no copied URL is stored in Vercel. Older builds cannot overwrite a newer commit's Preview.

The probe stores only a commit SHA, environment name, timestamp, sample number, and one-way nonce hash. It deletes each record after observation.

## Failure

Stop before deploy when the key, Preview name, commit, environment, generated client, or URL is missing or invalid. Never print the key or probe payload.

## Rollback and restore

1. Check out the immediately prior verified commit.
2. Deploy it to the candidate commit's exact Preview name with the same Preview deploy key.
3. Run the probe and retain its receipt.
4. Return to the latest verified commit.
5. Deploy it to that same Preview name and rerun the probe.

Never use a production key, production target, customer traffic, or customer data for this procedure.
