### 4.3.16 Buyer Referral (Org-Scoped, Buyer-Only)

**Console Field Convention Exception.** Buyer Referral intentionally has no `console` field: it is a buyer-originated, Org-scoped financial-attribution record, not a dual-console entity. Seller-console and referee-Org direct resource lookups return HTTP 404; it is not a Seller, Marketplace, or Console Bridge projection.

### 4.3.17 Buyer-Funded Pro Trial Seat Grant (Org-Scoped, Buyer-Originated, Seller-Redeemed)

**Console Field Convention Exception.** Pro Trial Seat Grant intentionally has no `console` or `console_origination` field: one grant is authorized from two existing request contexts, the Buyer issuer and Seller redeemer. A fixed stored console would misrepresent that dual-sided record. It is never a Console Bridge or Marketplace row; a third-party Org or unauthorised projection returns HTTP 404.

## Appendix M.5

| `org_scoped_console_exception_contract` | spec_tree_lint | **`runtime_active`** (detector `tools/spec-lint/gates/org_scoped_console_exception_contract.ts`; verified PASS on live Master Spec and pass/fail fixtures) |
