# Production proof contracts

These validators only accept evidence. They do not create evidence or infer readiness.

## Controller wiring order

1. `config/production-release.json` remains `proofCollection.mode: blocked` until the isolated Convex target, protected coordinator project, and collectors are reviewed and pinned. Blocked mode stops the ordinary/combined production release controller before provider mutation. `DEC-PROD-003` makes the separate Vercel baseline an explicit exception: it may establish the first predecessor set through its protected forward-only workflow, but its receipts remain non-promotable release evidence.
2. Stage the three production-target Vercel candidates without traffic. They are not human-proof deployments and must never be paired with the isolated Convex target.
3. Before any live Convex mutation, classify the exact known-good-to-candidate diff. Any non-generated Convex source change requires production backup proof plus a completed isolated restore test.
4. Accept a separate `isolated_production_proof_environment` receipt from the durable coordinator. `readIsolatedProductionProofEnvironment` derives the proof binding only after every Marketplace, Buyer, and Seller proof deployment cryptographically binds its backend environment to the distinct isolated Convex candidate target.
5. Run the real invited-human journey and operational collectors against that isolated binding. Validate their raw receipts with `readR0CustomerJourneyProof` and `readR0OperationalProof`.
6. Accept `durable_production_proof_collection` only when it binds the exact environment, customer, and operational receipt bytes, authenticated handoff, expiry compensation, and single-use finalizer. Missing, extra, synthetic, stale, mismatched, or ambiguous evidence stops the release while the proved production Convex SHA remains live.
7. Only after all isolated proof bytes validate may the controller deploy the candidate to live Convex. Recheck the production-target Vercel candidates, then promote Marketplace, Buyer, and Seller.

The checked-in workflows remain non-promotable. Bootstrap may run only the read-only Convex canary lane and then emits a blocked receipt. Ordinary release emits and uploads an immutable no-provider, no-authority receipt before deliberate failure; it does not attempt an unreachable historical download. Resolving `DEC-PROD-002` requires separate receipt-bound Convex and Vercel jobs; no parent process or job may hold both write credentials. The coordinator must bind every handoff digest, hold the single-use lease, expire safely, and finalize or compensate before either lane can continue. Repository-wide GitHub artifact inventory is only retained evidence. Any retained normal, Convex-anchor, or Vercel-baseline authority is accepted only when its workflow bytes at the run SHA match an approved kind, path, and SHA-256 lineage entry in `config/production-release.json`. `DEC-PROD-005` requires a non-expiring protected sentinel before the system may claim first-ever issuance or permanent single use.

Proof failure occurs before live Convex mutation and requires no rollback. Failures after the live deploy use the existing reviewed rollback/recovery path. Never treat a validator failure as permission to restore customer data; restore is a separately approved recovery action.
