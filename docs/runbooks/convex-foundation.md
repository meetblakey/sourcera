# Convex Preview foundation

Owner: Blake Rowley
Issue: PLA-282
Scope: Preview only; no production traffic or customer data.

## Required configuration

- Convex project: `sourcera`
- GitHub secret: `CONVEX_PREVIEW_DEPLOY_KEY`
- GitHub variable: `CONVEX_EXPECTED_PROJECT` as `team-slug/project-slug`
- Protected GitHub environment: `convex-preview`, with a required reviewer
- Protected GitHub environment secret: `SOURCERA_CONVEX_PREVIEW_PROBE_SEED`
- Vercel Preview variable on Marketplace, Buyer, and Seller: `CONVEX_DEPLOY_KEY`
- Vercel Preview variable on all three projects: `CONVEX_EXPECTED_PROJECT`
- Vercel Preview secret on all three projects: the same `SOURCERA_CONVEX_PREVIEW_PROBE_SEED` value as GitHub
- GitHub and Vercel Preview name: the normalized head ref plus the exact 40-character lowercase head SHA: `<normalized-head-ref-prefix>-<exact-head-sha>`
- Only the normalized head-ref prefix may be shortened to keep the full name within 63 characters. The SHA is never shortened.
- Public client variable: `NEXT_PUBLIC_CONVEX_URL`

The deploy key must start with `preview:`. `CONVEX_DEPLOYMENT` is forbidden in this path because it can select a default production deployment.

## Normal rollout

1. Open or update the pull request.
2. Application CI verifies the exact head SHA and GitHub's current merge result independently.
3. Approve the protected `convex-preview` environment after reviewing the exact head diff.
4. CI validates the Preview key and target, derives the commit-bound probe token, and stamps only its SHA-256 digest and a maximum 15-minute expiry with the SHA, environment, and commit-bound Preview name.
5. CI runs `npx convex deploy --preview-name ...` and builds all three applications with the generated Preview URL.
6. CI rechecks HEAD, the exact generated-file set, schema and client digests, and confirms that only the controlled identity stamp changed.
7. CI runs `npm run convex:probe` with the local commit-bound token, deletes the local token, and writes the canonical evidence independently of probe success.
8. Confirm 20 attempts were observed and cleared, p95 is at most 500 ms, and p99 is at most 1 second.

Each Vercel project also runs Convex's `deploy --cmd` flow. Convex supplies the matching commit-bound Preview URL to that application build; no copied URL is stored in Vercel. Older builds cannot overwrite a newer commit's Preview.

The capability-gated probe mutations store only a commit SHA, environment name, timestamp, sample number, and one-way nonce hash. The token is derived from the protected probe seed plus the exact commit and Preview name; it never enters source or evidence, and only its digest is deployed. The deployed capability expires within 15 minutes and every authorized rebuild stamps a new expiry. GitHub and Vercel therefore share the commit-bound token identity without mutable runtime secret state. Each record is deleted after observation. The server readback must match the stamped SHA, environment, Preview name, actual Convex deployment name, and deployment URL.

## Failure

Stop before deploy when the key, Preview name, commit, environment, generated client, or URL is missing or invalid. A probe failure still produces one sanitized receipt with attempted, observed, and cleared counts. Never print the deploy key, commit-bound probe token, or probe payload.

## Rollback and restore

1. Keep the candidate head ref, then check out the immediately prior verified commit.
2. Derive the prior verified commit's own commit-bound Preview name from that normalized head ref and the prior commit's exact SHA.
3. Deploy the prior commit to that name with the same Preview deploy key.
4. Run the probe and retain its receipt.
5. Return to the latest verified commit. If restoring it, deploy it to its own commit-bound Preview name and rerun the probe.

Never deploy the prior commit to the candidate commit's Preview name.

Never use a production key, production target, customer traffic, or customer data for this procedure.
