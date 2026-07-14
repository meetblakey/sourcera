# Three-domain system

Status: accepted for R0 foundation

Decision: `DEC-ARCH-001`

Source: `Sourcera_Master_Spec.md` v7.1.0a §§1.1, 1.5 and Appendix M

Delivery issue: PLA-217

## Topology

| Domain | Application | Vercel project | Local port |
| --- | --- | --- | --- |
| Marketplace | repository root | `sourcera` | 3000 |
| Buyer | `apps/buyer` | `sourcera-buyer` | 3001 |
| Seller | `apps/seller` | `sourcera-seller` | 3002 |

Each application has its own build, deploy check, health route, and protected preview. A console cannot import another console.

## Approved sharing

`packages/domain` is the only current cross-domain package. It owns deployment identity and health receipt contracts. It must not contain console UI, data access, or authorization decisions.

Shared code is added only when all three are true:

1. Two or more domains need the same stable contract.
2. The contract does not weaken console isolation.
3. Boundary tests and a named reviewer approve it.

## Build and deploy

`npm run build:all` builds Marketplace, Buyer, and Seller independently. `npm run validate:boundaries` rejects cross-console imports. Each `validate:deploy` command requires a valid environment, commit SHA, and exact domain before deployment.

Every `/api/health` response returns only:

- status
- service
- domain
- environment
- commit SHA
- checked timestamp

The route sends `Cache-Control: no-store` and emits `domain_deployment_health_result` without user data or secrets.

## Rollout and rollback

R0 uses protected previews with no customer traffic. Verify the three health receipts before promotion. If one console fails, redeploy its immediately prior verified preview, then confirm all three receipts. Do not roll back an unaffected console.

## Next boundary

PLA-218 adds the Buyer/Seller data-isolation model. These shells provide deployment separation only; they do not claim data or authorization isolation yet.
