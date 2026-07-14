# Research_MPP.md — The Sourcera Decision Layer

**Status:** Strategic exploration brief. Authored 2026-04-29. Author: senior product/strategy/engineering partner. Authored extensions throughout this document are flagged inline as **Authored Extension — requires human sign-off (AE-MPP-NN)** and would be ratified through `_integration/AUTHORED_EXTENSIONS_LEDGER.md` if the program is greenlit.

**Companion artifacts on greenlight:** `_integration/RECONCILIATION.md` reconciliation block, draft Phase 14.21+ phase prompts, `Linear_Execution_Blueprint.md` v2.1 program addition, AE ledger entries.

---

## Recommendation

**Build it. As a scoped, time-boxed pilot — not a separate product.** The Sourcera Decision Layer is a new external **surface** rendered against the existing Buyer-Method engine (§10), the Capability Declaration / Match-Score engine (§26 / §27.4), and the Seller Knowledge Base / Managed Agents engine (§22) — exposed as an MCP server plus a typed REST surface that an agentic code harness can call as a tool to convert "I need a [database / auth / payments / observability / vector store] for this project" into a *policy-aware, evaluation-backed, optionally-transactable* recommendation. The wedge is real and closes within 12–18 months as Anthropic, OpenAI, Smithery, and the hyperscaler agent surfaces converge on registry-plus-recommendation. The defensibility is **not** "we built an MCP server" — that's commodity in 90 days — but rather Sourcera's structural ability to (a) carry the buyer org's procurement policy into a sub-second tool call, (b) cite real evaluation evidence pulled from real seller KBs through the existing Managed-Agent harness, and (c) credibly refuse pay-for-placement in a category where every adjacent competitor (Smithery, AGNTCY, Stripe Apps, Vercel marketplace, AWS Marketplace agent surface) is structurally captured by either the platform owner's vertical lock-in or by a placement-auction model. What is on the line: 90 engineer-days, 25 founder-led discovery interviews, the integrity covenant of Sourcera's ranking ("we don't take rank money"), and the option value of being the procurement substrate inside every code-generation harness in 2027 — versus the risk of building a thin MCP wrapper around §27.4 that Anthropic disintermediates with a native procurement skill three months after our beta. **Kill condition is sharp and pre-committed (§10 of this document):** no kill conditions met = ship private alpha; any one of three quantitative tripwires breached during the 12-week pilot = stop and re-deploy capacity.

---

## 1. Two-Mode Market Segmentation

The strategic question hinges on whether the human-driven enterprise procurement buyer (the existing Sourcera core) and the code-time agentic buyer (the new question) are the same product, two products, or one product with two surfaces. The answer is **one product with two surfaces, both rendered against the same engines.** The distinction is segmentation along audience-and-trigger axes — not engine-and-data-model axes — and it preserves exactly the surface/engine separation doctrine that Master Spec §3.13 (Principle 9 — Surface Simplicity, Engine Complexity), §44.6 (Solo-Tier Surface Treatment), and Appendix M (Surface/Engine Mapping Registry) make canonical for the v7.1.0 corpus. Treating these as separate products would force Sourcera to maintain two evaluation rubrics, two vendor-fact graphs, two marketplace KB surfaces, two pricing planes, and two compliance postures — a scope catastrophe with no defensibility upside, because the value to the agent harness owner is *exactly* that the same evaluation evidence that an enterprise procurement team relied on yesterday underwrites the agent's decision today.

| Dimension | Mode A — Human Enterprise Procurement (existing) | Mode B — Code-Time Agentic Decision (new surface) |
| :--- | :--- | :--- |
| Primary user | Buyer Maya / VP Procurement / RevOps lead / IT director | Code-generation harness (Claude Code, Cursor, Devin, Replit Agent, Cline, Codex, Aider, Continue) acting on behalf of a developer who is acting on behalf of an org |
| Trigger | "We need to evaluate vendors for {category}" (§10 Phase 1) | `tool_use` call: `sourcera.decision.recommend({category, requirements, constraints, policy_pack_ref})` |
| Latency budget | Days–weeks (§2.5 Evaluation Timeline Benchmarks: Phase 4 vendor discovery 5–14 days, full eval 21–90 days) | P95 ≤ 800 ms cached / ≤ 4 s uncached for `decision.recommend` (Authored Extension — AE-MPP-01) |
| Decision granularity | Multi-vendor evaluation pipeline yielding a Selection Report with grades, weights, scenarios, and a defended recommendation (§10–§14) | Top-N ranked decision with rationale tokens, citations, confidence, and policy-gate outcomes — collapsed to a single accept/reject by the agent runtime |
| Audience for the rationale | Stakeholder cohort (§2.6.1 — Exec Sponsor, Eval Lead, Functional Lead, Technical Evaluator, SME); rationale must defend the choice in front of finance and legal | Two audiences — the agent itself (machine-parseable rationale tokens) and a downstream developer / Ops auditor reviewing the decision log |
| Who pays | Buyer Org via subscription + AI consumption (§34.1.1, §34.3) | Buyer Org via subscription + per-decision AIOperation consumption + (Tier 3 only) take-rate on transacted decisions; sellers never pay for placement (§7 Integrity Covenant of this doc) |
| Audit posture | Selection Report + Defense View (§13.11) + Audit Receipt (Enterprise) | Per-decision signed receipt (HMAC-SHA256, model_version_id, feature_vector_hash) — same primitive as the §27.4.6 Enterprise Match-Score audit receipt, generalized to decisions |
| Evidence source | Buyer Workspace requirements + Seller KB retrieval (§22.8) + Marketplace Match Score (§27.4) | Same Seller KB retrieval + same Match Score + the calling org's policy pack |
| Identity model | WorkOS-backed user session in a Buyer Console workspace (§6) | Sourcera-issued org-scoped agent API key + per-call scope token attesting to the calling agent's identity (Authored Extension — AE-MPP-02) |
| Console | Buyer Console (§7.2 firewall) | New surface: **Decision Layer** — a third externally-addressable surface bound to the same Buyer Org's data-residency, plan-tier, and Console firewall rules. It is *not* a third console (no Seller-side equivalent; no human UI as primary surface). It is a typed-API rendering of the Buyer-Method engine + Marketplace Discovery engine, exactly analogous to how the §44.6 Solo surface is a compressed surface rendering of the Buyer-Method engine for Maya |
| Determinism contract | None required (human-in-the-loop) | Required. Same input + same model version + same feature-registry version → same output (per the §27.4 model-versioning contract, generalized) |
| Failure mode for ranking integrity | A bad recommendation produces a bad evaluation; recoverable | A bad recommendation produces a real account, real API key, and (Tier 3) real money moved on autopilot — non-recoverable |

**The engine identity.** What makes this one product is that the underlying answer flows from the same data: (a) the Capability Declaration overlap between the buyer's expressed requirements and a seller's published capabilities, computed identically to `capability_declaration_overlap_ratio` in §27.4.3; (b) the seller's `verification_tier_ordinal`, `kb_freshness_score`, `historical_response_quality_score`, `region_match_score`, `residency_compatible_flag`, and the rest of the v7.0.0 18-feature Match Score registry; (c) the ranking model's published version + offline-eval guardrails + fairness audit suite; (d) the buyer org's `data_residency_region` (§40.4) and `vendor_opt_out_record` constraints (§4.4.8); (e) the existing Free Allowance, Wallet, Committed Spend, and Outcome Resolver (§34.10–§34.11) for billing. **The Decision Layer adds one new feature axis to the Match Score registry: the calling org's policy pack — preferred-vendor list, existing-contract flags, residency overrides, banned-vendor list, budget-cap-per-category, security-review status — which is structurally identical to the existing `vendor_opt_out_record` and `certification_match_score` features (§27.4.3) except that it is org-authored rather than legal-authored.**

**Who pays the bill in each mode and why.** In Mode A the buyer org pays; this is the existing §34.1.1 economic contract and is the single largest per-org revenue line. In Mode B the buyer org pays again — the agent harness does not pay, and crucially, *the seller does not pay for placement*. This is the integrity hinge of the entire bet. The agent harness owner receives the API for free at Tier 1 (§3 of this doc); they pay only if they distribute Sourcera as a paid tool inside their own product (revenue share with Anthropic Skills / Cursor / etc., negotiated separately). The seller pays *plan tier* dollars for their KB, their Capability Declarations, their Marketplace placement — exactly as today (§34.1.2) — but they pay nothing extra to be eligible for Decision Layer ranking. The Decision Layer does not mint new pay-for-placement revenue; it monetizes the buyer's *agent-time* exactly as Sourcera today monetizes the buyer's *human-evaluation-time* (§34.3 outcome-based AIOperation consumption).

**The "why same engine" defensibility argument.** Three reasons, in declining order:

1. **The data moat is the eval data.** Every successful evaluation in Mode A produces signal: an `EOIAcceptanceRecord`, a `MarketplaceMatchScoreSnapshot` with feedback, a Selection Report with vendor grades, a `BidWorkspace.status=won` outcome. That signal trains the §27.4.5 ranking model. Mode B at scale produces an order-of-magnitude more decisions per unit time than Mode A — a Decision Layer that handles 10K decisions/day across 100 design-partner orgs is ~3M decisions/year, against Sourcera's plausible Mode-A ceiling of ~10K finalized evaluations/year by 2028. **Mode B is the data flywheel for Mode A's ranking quality.**
2. **The compliance scaffolding is built.** §6.8 DSAR, §40.2 retention, §7.2 dual-console firewall, §27.4.5 residency-locked model versioning per `us`/`eu`/`apac`, §22.8.3 vault-issued JWTs that bind tool-calls to a specific seller_org_id and bid_workspace_id — every one of these primitives exists today and is reused for Mode B. A standalone Decision Layer would have to rebuild all of them; Sourcera reuses them.
3. **The integrity covenant is enforceable.** Sourcera publishes its ranking algorithm (§27.4.3 18-feature registry), prohibits inline weight magnitude exposure (§27.4.6 — adversarial-gaming surface protection), exposes feature-value provenance to enterprise plans (§27.4.6, §27.4.12), and runs a fairness audit suite with k-anonymity floors and drift detection (§27.4.11). A new entrant building a Decision Layer from scratch would have to invent all of this, then survive 24 months of regulatory scrutiny on procurement-kickback law, before sellers and buyers would trust it. Sourcera inherits 18 months of integrity engineering.

The strategic answer is therefore: **same product, one new surface, no new engine.** The brief authored below treats the Decision Layer as a new Master Spec section (§52, authored extension) rendered through new surface entries in Appendix M.1 and bound to the existing engines via the existing Capability Registry, Wallet, Outcome Resolver, and Match-Score model.

---

## 2. Decision Layer Surface

This section is authored at Master-Spec fidelity. New entities, enums, endpoints, webhook events, and AIOperation kinds are tabled below; every authored extension is flagged. Where the Decision Layer reuses an existing primitive (Match-Score model versioning, Outcome Resolver, vault-JWT auth pattern, §31 webhook standard), the reuse is cited rather than restated.

### 2.1 Surface Composition

The Decision Layer is exposed in three concrete shapes, each backed by the same underlying engine call. An MCP-based agent harness reads via the MCP server; a code-runtime SDK reads via the typed REST endpoints; a third-party orchestrator reads via the Public API endpoints. All three shapes terminate at the same Decision Engine — a new orchestrator that composes Capability Declaration retrieval, Match-Score computation, KB-grounded evidence retrieval, and policy-pack enforcement into one transaction.

| Shape | Endpoint set | Audience | Identity model | Notes |
| :--- | :--- | :--- | :--- | :--- |
| **MCP Server** (`sourcera_decision`) | `decision.recommend`, `decision.justify`, `decision.alternatives`, `decision.policy_check`, `decision.transact_intent`, `decision.replay`, `policy_pack.read` | Agent harness via MCP toolset | Vault-issued per-session JWT bound to `(buyer_org_id, agent_caller_id, policy_pack_id)`, expiring ≤ 1h, rotated per session, exactly the §22.8.3 pattern generalized | Hosted at `mcp.sourcera.com/decision/v1`, HTTPS streamable, dual-region (US/EU) |
| **Typed REST API** | `POST /v1/decisions`, `GET /v1/decisions/{decision_id}`, `POST /v1/decisions/{decision_id}/justify`, `POST /v1/decisions/{decision_id}/transact`, `GET /v1/decisions/{decision_id}/replay`, `GET /v1/policy-packs/{policy_pack_id}`, `POST /v1/policy-packs`, `PATCH /v1/policy-packs/{id}` | SDK in agent runtimes, custom orchestrators, batch decision pipelines | `Authorization: Bearer srck_{org_prefix}_{token_string}` per §32.2; new scope set `decisions:*`, `policy_packs:*` | Lives under `api.sourcera.io/v1` per §32.1; new endpoint family registered in §32.5 |
| **Public Decision Browser** (consumer-grade web) | Read-only HTML/JSON at `decisions.sourcera.com/{decision_id}` (signed, optional public-share) | Humans reviewing an agent decision; auditor pulling a decision log | Anonymous when the decision was published shareable; org-scoped bearer otherwise | Optional surface, gated by an `is_publicly_shareable` flag on the decision (default false). Mirrors the Selection Report public-share pattern (§32.7 Audit Receipt verifier) |

### 2.2 Decision Engine — Computation Pipeline

Pipeline executes in this order. All steps run inside a single AIOperation envelope (`decision.recommend`, registered below) for billing, audit, and replay symmetry.

1. **Resolve calling identity.** Validate vault JWT (MCP) or bearer (REST). Resolve `(buyer_org_id, console=buyer, plan_tier, data_residency_region, agent_caller_id)`. Reject cross-residency queries per §27.4.5 residency-scope rule. Reject if Decision Layer is not in `plan_tier`'s feature-access matrix (§5.11; new row, see §4 of this doc).
2. **Resolve policy pack.** If `policy_pack_ref` provided, load `PolicyPack` (new entity; §4.1 below). If absent, load the Org's default policy pack. Policy pack defines: preferred-vendor list, banned-vendor list, residency overrides, budget cap per category, required certifications, existing-contract flags, security-review-required flag, free-tier-only flag (for OSS templates).
3. **Resolve category.** Map request `category` to Marketplace Category (§4.4.7) via taxonomy node lookup; reject if not found, with hint payload listing the closest 3 controlled-vocabulary nodes.
4. **Build candidate set.** Pull all `SellerSoftware` rows whose primary or secondary `marketplace_category_id` matches; apply hard gates (residency, opt-out, abuse suppression) per §27.4.4; intersect with the policy pack's preferred-vendor list if `preferred_only=true` is set; remove banned vendors. This step reuses the §27.4 candidate-set logic.
5. **Compute Match Scores.** For every `(decision_request, seller_software_id)` pair, invoke the Match Score engine via `match_score_numeric` capability (§21.4.2, §27.4) extended with one new feature axis: `policy_pack_alignment_score` (Authored Extension — AE-MPP-03; registered as feature row in §27.4.3 in §4 of this doc). Pass the policy pack as an input feature vector; output is the same scaled score with the policy-pack contribution exposed in provenance.
6. **Compose evidence bundle per top-K.** For the top K (default 3, max 10, plan-gated) candidates by score, retrieve up to 5 KB entries each via the existing `kb_retrieve` MCP tool (§22.8.4.1), namespace-scoped to that seller's `software` namespace, filtered for the requested capability category, with the `cite_verify` step (§22.8.4.7) gating the citation set. **This is the move that makes Sourcera's ranking interpretable: each decision returns ranked vendors with cite-verified evidence pulled from the seller's own KB.** Competitor registries return ranked names with no evidence; Sourcera returns ranked names with structurally-citable, post-edit-revalidated evidence.
7. **Generate rationale tokens.** Invoke a new Managed Agent definition `agent_sourcera_decision_recommender_v1` (§22.10.x; AE-MPP-04). The agent's tool allowlist is `kb_retrieve`, `kb_get_entry`, `cite_verify`, `match_score_inspect` (new; AE-MPP-05). The agent's output is the rationale-token set: a per-vendor structured rationale citing KB entry IDs and Match Score features, formatted for both human reading and machine parsing (JSON envelope around an XML rationale body, mirroring §22.10.2 First-Pass Responder output format).
8. **Bind decision to policy gates.** Run the policy pack's gate set: residency hard gate, banned-vendor hard gate, certification-required gate, budget-cap gate (computes the implied first-year cost from the candidate's `pricing_snapshot` if available; rejects if over policy cap), preferred-only gate. Each gate is observable in the response provenance.
9. **Mint decision artifact.** Write a new `Decision` entity (§4.1 below) with the full feature vectors, the rationale token bundle, the policy gate outcomes, the audit-receipt hash, and the AIOperation linkage. Set retention per §40.2 (new retention class `decision_30d_default_buyer_org`, AE-MPP-06).
10. **Settle billing.** Write a `decision.recommend` AIOperation row through the Outcome Resolver (§34.11). Default `OutcomeContract`: 7-day acceptance window; `accepted` if the agent harness submits a `decision.transact_intent` referencing this decision OR the buyer's `vendor_provisioned_event` is observed via webhook within 7 days; `rejected` otherwise. New AIOperation kinds and pricing are tabled in §2.7 of this doc.
11. **Emit webhook.** Fire `decision.recommended` (new; §31 catalog, §4 of this doc) to the buyer Org's subscriptions.

### 2.3 MCP Tool Contract — `decision.recommend`

The full tool surface. Naming preserves the `<verb>.<noun>` convention used by Stripe's MCP and Anthropic's MCP-builder examples.

```json
{
  "name": "decision.recommend",
  "description": "Return a ranked list of vendor software options matching the requested category and constraints, backed by Sourcera's evaluation evidence and your organization's procurement policy. Output is deterministic for fixed (request, model_version, feature_registry_version, policy_pack_version).",
  "input_schema": {
    "type": "object",
    "required": ["category", "requirements"],
    "properties": {
      "category": {
        "type": "string",
        "description": "Sourcera Marketplace Category slug (e.g., 'database-relational', 'authentication-b2b', 'payments-card-processing'). See decision.alternatives if the slug is unknown.",
        "minLength": 2, "maxLength": 100
      },
      "requirements": {
        "type": "object",
        "description": "Free-form structured requirements; mirrors the Sourcera Method's Requirement entity (§10.3). The decision engine treats this as the buyer's expressed need.",
        "properties": {
          "summary": {"type": "string", "maxLength": 1000},
          "must_have_capabilities": {"type": "array", "items": {"type": "string"}, "maxItems": 50},
          "nice_to_have_capabilities": {"type": "array", "items": {"type": "string"}, "maxItems": 50},
          "scale_profile": {
            "type": "object",
            "properties": {
              "expected_qps": {"type": "number"},
              "expected_storage_gb": {"type": "number"},
              "expected_users": {"type": "number"}
            }
          },
          "language_stack": {"type": "array", "items": {"type": "string"}, "maxItems": 20},
          "deployment_target": {"type": "string", "enum": ["serverless", "kubernetes", "vm", "managed-saas", "self-hosted", "hybrid", "unknown"]},
          "compliance_requirements": {
            "type": "array",
            "items": {"type": "string", "enum": ["soc2", "iso27001", "hipaa", "gdpr", "pci", "fedramp", "none"]}
          },
          "data_residency_required": {"type": "string", "enum": ["us", "eu", "apac", "global", "any"]}
        }
      },
      "constraints": {
        "type": "object",
        "properties": {
          "budget_cap_usd_first_year": {"type": "number", "minimum": 0},
          "budget_cap_priority": {"type": "string", "enum": ["soft_advisory", "hard_gate"], "default": "soft_advisory"},
          "preferred_only": {"type": "boolean", "default": false},
          "exclude_seller_org_ids": {"type": "array", "items": {"type": "string"}, "maxItems": 100},
          "min_verification_tier": {"type": "string", "enum": ["basic", "verified", "certified"], "default": "basic"},
          "max_switching_cost_score": {"type": "number", "minimum": 0, "maximum": 1.0, "default": 1.0}
        }
      },
      "policy_pack_ref": {
        "type": "string",
        "description": "Optional PolicyPack ID (e.g., 'pkpk_01ABC...'). When omitted, the Org's default policy pack governs.",
        "maxLength": 100
      },
      "top_k": {"type": "integer", "minimum": 1, "maximum": 10, "default": 3},
      "include_evidence": {"type": "boolean", "default": true},
      "evidence_kb_entries_per_vendor": {"type": "integer", "minimum": 0, "maximum": 5, "default": 3},
      "include_alternatives_below_threshold": {"type": "boolean", "default": false},
      "idempotency_key": {"type": "string", "maxLength": 100, "description": "Per §32.6.2 idempotency convention. Replays within 60s return the same decision_id."}
    }
  },
  "output_schema": {
    "type": "object",
    "required": ["decision_id", "model_version_id", "feature_registry_version", "policy_pack_version", "rankings"],
    "properties": {
      "decision_id": {"type": "string", "description": "ULID-encoded; persists for retention window."},
      "model_version_id": {"type": "string"},
      "feature_registry_version": {"type": "string"},
      "policy_pack_version": {"type": "string"},
      "decision_engine_version": {"type": "string"},
      "computed_at": {"type": "string", "format": "date-time"},
      "buyer_org_id": {"type": "string"},
      "agent_caller_id": {"type": "string"},
      "category_resolved": {"type": "string"},
      "rankings": {
        "type": "array",
        "items": {
          "type": "object",
          "required": ["seller_org_id", "seller_software_id", "score", "qualitative_label", "rationale", "policy_outcomes", "audit_receipt"],
          "properties": {
            "rank": {"type": "integer"},
            "seller_org_id": {"type": "string"},
            "seller_software_id": {"type": "string"},
            "name_canonical": {"type": "string"},
            "score": {"type": "integer", "minimum": 0, "maximum": 100},
            "qualitative_label": {"type": "string", "enum": ["strong_match", "moderate_match", "weak_match", "insufficient_signal"]},
            "confidence": {"type": "number", "minimum": 0.0, "maximum": 1.0},
            "rationale": {
              "type": "object",
              "properties": {
                "summary": {"type": "string", "maxLength": 1000},
                "supporting_features": {
                  "type": "array",
                  "items": {
                    "type": "object",
                    "properties": {
                      "feature_id": {"type": "string"},
                      "value": {"type": "number"},
                      "contribution_direction": {"type": "string", "enum": ["+", "-", "neutral"]},
                      "contribution_magnitude_bucket": {"type": "string", "enum": ["high", "medium", "low"]}
                    }
                  }
                },
                "kb_evidence": {
                  "type": "array",
                  "items": {
                    "type": "object",
                    "properties": {
                      "kb_entry_id": {"type": "string"},
                      "title": {"type": "string"},
                      "excerpt": {"type": "string", "maxLength": 800},
                      "cite_verified": {"type": "boolean"},
                      "last_reviewed_at": {"type": "string", "format": "date-time"}
                    }
                  }
                }
              }
            },
            "policy_outcomes": {
              "type": "object",
              "description": "Per-gate outcomes from the policy pack run.",
              "properties": {
                "residency_gate": {"type": "string", "enum": ["pass", "fail", "n/a"]},
                "banned_vendor_gate": {"type": "string", "enum": ["pass", "fail", "n/a"]},
                "certification_gate": {"type": "string", "enum": ["pass", "fail", "n/a"]},
                "budget_cap_gate": {"type": "string", "enum": ["pass", "fail_soft", "fail_hard", "n/a"]},
                "preferred_vendor_gate": {"type": "string", "enum": ["pass", "fail", "n/a"]}
              }
            },
            "pricing_snapshot": {
              "type": "object",
              "properties": {
                "first_year_cost_usd_estimate": {"type": "number"},
                "pricing_signal_freshness_days": {"type": "integer"},
                "pricing_source": {"type": "string", "enum": ["seller_published", "ghost_bid_inferred", "third_party_observed", "none"]}
              }
            },
            "switching_cost_estimate": {
              "type": "object",
              "properties": {
                "score": {"type": "number", "minimum": 0.0, "maximum": 1.0},
                "factors": {"type": "array", "items": {"type": "string"}}
              }
            },
            "integration_friction_estimate": {
              "type": "object",
              "properties": {
                "score": {"type": "number", "minimum": 0.0, "maximum": 1.0},
                "language_stack_match": {"type": "boolean"},
                "deployment_target_match": {"type": "boolean"}
              }
            },
            "license_posture": {
              "type": "object",
              "properties": {
                "kind": {"type": "string", "enum": ["proprietary_saas", "oss_apache_2", "oss_mit", "oss_agpl", "oss_bsd", "source_available", "dual_licensed", "unknown"]},
                "self_hostable": {"type": "boolean"}
              }
            },
            "verification_tier": {"type": "string", "enum": ["basic", "verified", "certified"]},
            "kb_freshness_score": {"type": "number", "minimum": 0.0, "maximum": 1.0},
            "audit_receipt": {
              "type": "object",
              "properties": {
                "snapshot_id": {"type": "string"},
                "feature_vector_hash": {"type": "string"},
                "signature": {"type": "string", "description": "HMAC-SHA256(decision_id || rank_position || score || model_version_id || feature_vector_hash)"}
              }
            }
          }
        }
      },
      "filtered_out": {
        "type": "array",
        "description": "Candidates removed by hard gates; surfaced for transparency.",
        "items": {
          "type": "object",
          "properties": {
            "seller_org_id": {"type": "string"},
            "seller_software_id": {"type": "string"},
            "filter_reason": {"type": "string", "enum": ["residency_incompatible", "vendor_opt_out", "abuse_suppression", "banned_by_policy_pack", "below_min_verification_tier", "outside_preferred_list", "below_min_match_score", "exclude_seller_org_ids"]}
          }
        }
      },
      "decision_metadata": {
        "type": "object",
        "properties": {
          "compute_latency_ms": {"type": "integer"},
          "candidates_evaluated_count": {"type": "integer"},
          "evidence_retrieval_ms": {"type": "integer"},
          "policy_pack_version_used": {"type": "string"},
          "freshness_warnings": {"type": "array", "items": {"type": "string"}},
          "ai_operation_id": {"type": "string"},
          "expires_at": {"type": "string", "format": "date-time", "description": "Decision artifact retention horizon per policy"}
        }
      }
    }
  }
}
```

Concrete request/response example (single round trip; production-shaped):

```json
// Request
{
  "category": "database-relational-postgres-managed",
  "requirements": {
    "summary": "Production Postgres for a B2B SaaS analytics product; multi-tenant; expecting 50K MAU at 12 months",
    "must_have_capabilities": ["point_in_time_recovery", "read_replicas", "row_level_security", "logical_replication"],
    "nice_to_have_capabilities": ["serverless_scaling", "branching", "vector_extensions"],
    "scale_profile": {"expected_qps": 5000, "expected_storage_gb": 200, "expected_users": 50000},
    "language_stack": ["typescript", "node_20", "next_15"],
    "deployment_target": "serverless",
    "compliance_requirements": ["soc2"],
    "data_residency_required": "us"
  },
  "constraints": {
    "budget_cap_usd_first_year": 50000,
    "budget_cap_priority": "soft_advisory",
    "min_verification_tier": "verified"
  },
  "policy_pack_ref": "pkpk_01HK3MX...",
  "top_k": 3,
  "include_evidence": true,
  "evidence_kb_entries_per_vendor": 3,
  "idempotency_key": "agent-cursor-acme-c4d2-2026-04-29-001"
}

// Response (abridged; rationale.kb_evidence shown for rank 1 only)
{
  "decision_id": "dcsn_01HK4PM2QJTX5C8VFZ4N7Y0KAE",
  "model_version_id": "mmsmv_01HK1ABCXYZ",
  "feature_registry_version": "v7.3.0",
  "policy_pack_version": "v12",
  "decision_engine_version": "v1.0.0",
  "computed_at": "2026-04-29T15:22:11.402Z",
  "buyer_org_id": "org_01ACME...",
  "agent_caller_id": "agnt_cursor_session_c4d2",
  "category_resolved": "database-relational-postgres-managed",
  "rankings": [
    {
      "rank": 1,
      "seller_org_id": "org_01SUPABASE...",
      "seller_software_id": "swsw_01SUPA_PG...",
      "name_canonical": "Supabase Postgres",
      "score": 84,
      "qualitative_label": "strong_match",
      "confidence": 0.91,
      "rationale": {
        "summary": "Strong match on serverless deployment target, native PITR + read replicas + RLS, SOC2 verified, US residency available, integration-friction low for Next.js stack. Budget envelope feasible at projected scale.",
        "supporting_features": [
          {"feature_id": "capability_declaration_overlap_ratio", "value": 0.92, "contribution_direction": "+", "contribution_magnitude_bucket": "high"},
          {"feature_id": "verification_tier_ordinal", "value": 2, "contribution_direction": "+", "contribution_magnitude_bucket": "medium"},
          {"feature_id": "kb_freshness_score", "value": 0.87, "contribution_direction": "+", "contribution_magnitude_bucket": "medium"},
          {"feature_id": "policy_pack_alignment_score", "value": 1.0, "contribution_direction": "+", "contribution_magnitude_bucket": "high"},
          {"feature_id": "integration_friction_estimate", "value": 0.18, "contribution_direction": "+", "contribution_magnitude_bucket": "medium"}
        ],
        "kb_evidence": [
          {"kb_entry_id": "kbe_01HJ9X...", "title": "Supabase PITR — recovery semantics", "excerpt": "Point-in-time recovery is enabled by default on Pro and above; restore granularity is 2 minutes; retention configurable up to 14 days.", "cite_verified": true, "last_reviewed_at": "2026-03-21T00:00:00Z"},
          {"kb_entry_id": "kbe_01HJ9Y...", "title": "Supabase RLS — multi-tenant pattern", "excerpt": "Row-Level Security is the recommended multi-tenant isolation strategy on Supabase Postgres; policies are evaluated server-side using the JWT claim `tenant_id`.", "cite_verified": true, "last_reviewed_at": "2026-04-02T00:00:00Z"},
          {"kb_entry_id": "kbe_01HJ9Z...", "title": "Supabase SOC2 Type II Report (2025)", "excerpt": "SOC 2 Type II audit completed Q4 2025; report available under NDA via support@supabase.com.", "cite_verified": true, "last_reviewed_at": "2026-04-15T00:00:00Z"}
        ]
      },
      "policy_outcomes": {
        "residency_gate": "pass",
        "banned_vendor_gate": "pass",
        "certification_gate": "pass",
        "budget_cap_gate": "pass",
        "preferred_vendor_gate": "n/a"
      },
      "pricing_snapshot": {
        "first_year_cost_usd_estimate": 14400,
        "pricing_signal_freshness_days": 11,
        "pricing_source": "seller_published"
      },
      "switching_cost_estimate": {"score": 0.32, "factors": ["pgvector_compat", "wire_protocol_postgres"]},
      "integration_friction_estimate": {"score": 0.18, "language_stack_match": true, "deployment_target_match": true},
      "license_posture": {"kind": "proprietary_saas", "self_hostable": true},
      "verification_tier": "verified",
      "kb_freshness_score": 0.87,
      "audit_receipt": {
        "snapshot_id": "mmss_01HK4PM2...",
        "feature_vector_hash": "sha256:7c1f...e8a2",
        "signature": "hmac-sha256:b3a2...d91c"
      }
    },
    {"rank": 2, "name_canonical": "Neon", "score": 79, "qualitative_label": "moderate_match", "...": "..."},
    {"rank": 3, "name_canonical": "AWS RDS Postgres", "score": 71, "qualitative_label": "moderate_match", "...": "..."}
  ],
  "filtered_out": [
    {"seller_org_id": "org_01PLANETSCALE...", "seller_software_id": "swsw_01PSV...", "filter_reason": "below_min_verification_tier"}
  ],
  "decision_metadata": {
    "compute_latency_ms": 612,
    "candidates_evaluated_count": 11,
    "evidence_retrieval_ms": 287,
    "policy_pack_version_used": "v12",
    "freshness_warnings": [],
    "ai_operation_id": "aiop_01HK4PM2RR8...",
    "expires_at": "2026-05-29T15:22:11Z"
  }
}
```

### 2.4 Tool Contract — `decision.justify`

Re-derives the rationale token bundle for an existing decision against potentially-updated KB state, without changing the Match Score (which is frozen at decision time per the §27.4.7 caching rules generalized). Used by code-review surfaces ("explain this rec") and by Ops auditors. AIOperation kind: `decision.justify` (priced as a Sonnet-tier inline operation; §2.7 below).

### 2.5 Tool Contract — `decision.alternatives`

Returns alternate decisions one would have gotten under varied parameters: relaxed policy pack, raised budget, alternative residency, alternate verification tier. Used in two contexts: (a) when an agent is asked "what else?" by a developer, and (b) when the rank-1 decision fails a downstream provisioning step and the agent needs to fall back. Same engine call, different parameter sweep. Free under Tier 1 plan when the underlying decision was already metered.

### 2.6 Tool Contract — `decision.policy_check`

Synchronous validation that a candidate (vendor + product) passes the calling org's policy pack — no Match-Score computation, no KB retrieval, no evidence bundle. Used by code-review tooling that wants to validate a hand-typed `import` line before merge. Cheap (Haiku-tier; §2.7 below). Does *not* mint a `Decision` artifact — returns a `PolicyCheck` artifact only, which is non-billable for accept/reject and decays after 24h.

### 2.7 New AIOperation Kinds and Pricing Posture

All new kinds register as `CapabilityRegistryEntry` rows per §4.8.2; pricing follows the §34.3.1 deterministic formula (`value_price_cents = MAX(min_value_price_cents, cost_base_cents × 10)`; `cost_price_cents = MAX(min_cost_price_cents, cost_base_cents × 1.05)`). Floor values authored below; cost-base is recomputed nightly per §34.3.3.

| Capability ID | Console (new value) | Model Tier | Indicative `value_price` (Accepted) | Indicative `cost_price` (Rejected) | Unit | OutcomeContract Window | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `decision.recommend` | `decision_layer` (new console enum value; AE-MPP-07) | Sonnet (default), Opus (high-stakes opt-in via `decision_high_stakes` flag) | $0.50 per decision | $0.06 | 1 decision (1 ranked top-K bundle) | 7d (Accept signal: `decision.transact_intent` referencing this decision_id OR `vendor_provisioned_event` webhook OR explicit acceptance via `POST /v1/decisions/{id}/accept`) | The headline new SKU. Free-allowance: 50/Org/month for Tier-1 access + 10 lifetime per-Org for free-allowance signup parity (§4.8.7) |
| `decision.justify` | `decision_layer` | Sonnet | $0.05 | $0.007 | 1 justification | 24h | Always-accept-if-completed (no acceptance signal needed; the buyer asked for it, the buyer got it) |
| `decision.alternatives` | `decision_layer` | Haiku (parameter sweep) | $0.04 per alt-set | $0.006 | 1 alternates set (up to 5 parameter sweeps) | 24h | Bundled free if invoked within 24h of the parent decision |
| `decision.policy_check` | `decision_layer` | Haiku | $0.02 | $0.003 | 1 policy-pack run | 24h | Cheap; encourages aggressive use in pre-merge tooling |
| `decision.replay` | `decision_layer` | (no model — deterministic re-render) | $0 | $0 | 1 replay | n/a | Engine-only; not an AI op |
| `decision.transact` (Tier 3 only) | `decision_layer` | Sonnet (intent confirmation) + downstream payment-rail call | $2.00 per transaction event + 1.5% take-rate (capped at $50; AE-MPP-08) | $0.20 | 1 transacted decision | 30d (acceptance: signed payment receipt; rejection: refund/cancel within window) | The take-rate funds Tier-3 payment integration cost + reverses through to the seller via revenue-share contract; never a placement fee |
| `policy_pack.parse` | `decision_layer` | Opus | $5.00 per policy pack ingested | $0.65 | 1 policy pack (≤ 50 KB authored doc) | 30d | Used when an Org uploads a free-text policy doc (security review report, preferred-vendor list) and asks Sourcera to compile it into a `PolicyPack` row |

The `decision_layer` console enum value is a new value (alongside `buyer`, `seller`, `cross-console`) registered in Appendix J `console`. AIOperations on this console **bill against the Buyer Org's AIWallet** (§4.8.3) — Decision Layer is an extension of the Buyer side commercially. The Seller is never billed for being ranked; the Seller benefits from being ranked exactly as they benefit from being surfaced in the existing Marketplace (free baseline plus paid Verified/Certified tiers; existing §27.10 pricing structure).

### 2.8 Determinism, Replay, and Freshness Contract

The Decision Layer makes a determinism guarantee that the existing Marketplace surface does not have to make. The contract:

> For a fixed `(decision_id, model_version_id, feature_registry_version, policy_pack_version, decision_engine_version)`, a `GET /v1/decisions/{decision_id}/replay` MUST return a byte-identical `rankings` array and audit-receipt set. The original `computed_at` is preserved; the replay timestamp is in `replay_metadata.replayed_at`.

This is testable: QA gate `decision_replay_byte_identical` (AE-MPP-09) asserts on every PR touching the Decision Engine. The replay does not re-invoke any AIOperation; it materializes from the persisted `Decision` row. Replays are billed at `$0` per the table above.

**Freshness warnings.** A decision response carries `freshness_warnings` populated when any of the following are true at compute time: (a) the rank-1 vendor's `kb_freshness_score < 0.6` (KB has not been reviewed inside its cadence and is approaching staleness); (b) the rank-1 vendor's most recent Capability Declaration update is > 180 days old; (c) the rank-1 vendor's pricing signal is > 30 days old and the policy pack carries a `budget_cap_gate`; (d) the model version is in `cold_start` mode (per §27.4.4 — Legacy Baseline v1 fallback); (e) a residency-mismatch hard-gate fired for the rank-1 candidate (this is treated as a system-side hint, not an error — the rank-1 returned is the highest-scoring residency-compatible candidate). The agent harness is expected to surface these warnings to the developer.

### 2.9 Idempotency, Caching, Rate Limits

Idempotency keys follow §32.6.2: keys are unique per `(buyer_org_id, agent_caller_id, idempotency_key)`. Replays within 60 s of an identical key return the same `decision_id`. Caching is keyed on the canonicalized `(category, requirements_hash, constraints_hash, policy_pack_version, model_version_id, feature_registry_version)` tuple; default TTL is 60 s for `decision.recommend` (encourages real-time resolution but allows the agent to retry on transient failures), 24 h for `decision.policy_check`. Rate limits add a new class to §32.4: `decision_layer_recommend` at 100/min per Org (default; raised on Enterprise per contract); `decision_layer_policy_check` at 600/min per Org.

### 2.10 Endpoint Family — Typed REST

```
POST   /v1/decisions
GET    /v1/decisions/{decision_id}
POST   /v1/decisions/{decision_id}/accept
POST   /v1/decisions/{decision_id}/justify
POST   /v1/decisions/{decision_id}/alternatives
POST   /v1/decisions/{decision_id}/transact            (Tier 3 only)
GET    /v1/decisions/{decision_id}/replay
GET    /v1/decisions/{decision_id}/audit-receipt       (Enterprise only — same primitive as §27.4.12)
GET    /v1/decisions                                   (list; cursor-paginated per §32.3)

POST   /v1/policy-packs
GET    /v1/policy-packs
GET    /v1/policy-packs/{policy_pack_id}
PATCH  /v1/policy-packs/{policy_pack_id}
DELETE /v1/policy-packs/{policy_pack_id}
POST   /v1/policy-packs/{policy_pack_id}/parse-document  (uploads free-text → structured policy via policy_pack.parse capability)

GET    /v1/agent-callers                                 (Org's registered agent identities)
POST   /v1/agent-callers
PATCH  /v1/agent-callers/{agent_caller_id}
DELETE /v1/agent-callers/{agent_caller_id}
POST   /v1/agent-callers/{agent_caller_id}/rotate-token
```

All endpoints follow §32 patterns for auth, pagination, error envelope, idempotency. New error codes are catalogued in §4.6 of this doc and registered in Appendix I. The `/v1/decisions` endpoint family is the canonical home for the Decision Layer; the MCP server is a thin transport layer above it.

### 2.11 Webhook Events (New)

| Event | Trigger | Core payload | Retry curve |
| :--- | :--- | :--- | :--- |
| `decision.recommended` | `Decision` row written | `event_id`, `decision_id`, `buyer_org_id`, `agent_caller_id`, `category_resolved`, `top_seller_software_id`, `top_score`, `model_version_id`, `policy_pack_version` | §31 standard |
| `decision.accepted` | `decision.transact_intent` OR `vendor_provisioned_event` OR explicit `POST /accept` | `event_id`, `decision_id`, `accept_reason`, `accept_signal_at`, `chosen_seller_software_id` | §31 standard |
| `decision.overridden` | Agent harness or developer chose a non-top-K vendor (signal: explicit override via `POST /accept` with `override=true` and `chosen_seller_software_id` not in `rankings[].seller_software_id`) | `event_id`, `decision_id`, `chosen_seller_software_id`, `override_reason_code`, `override_reason_freeform` | §31 standard |
| `decision.transacted` | Tier 3 Stripe Agentic / x402 / Visa Intelligent Commerce settlement webhook received | `event_id`, `decision_id`, `transaction_id`, `transaction_amount_cents`, `payment_protocol`, `chosen_seller_software_id` | §31 standard |
| `decision.regression_detected` | Buyer files Decision Feedback (`decision_too_high`, `wrong_seller`, `decision_failed_provisioning`) | `event_id`, `decision_id`, `feedback_kind`, `freeform_note`, `applied_ml_review_status` | §31 standard |
| `decision.replay_drift_detected` | Replay output diverges from original (engine bug — should never fire; if it does, it's a P0 incident) | `event_id`, `decision_id`, `original_signature`, `replay_signature`, `divergence_kind` | §31 standard, plus pages on-call |
| `policy_pack.published` | `PolicyPack.status: draft → published` | `event_id`, `policy_pack_id`, `policy_pack_version`, `org_id`, `published_at` | §31 standard |
| `policy_pack.deprecated` | `PolicyPack.status: published → deprecated` | `event_id`, `policy_pack_id`, `policy_pack_version`, `org_id`, `successor_policy_pack_id` | §31 standard |
| `decision.engine.cold_start_engaged` | A residency scope's model falls back to Legacy Baseline (per §27.4.4 generalized) | `event_id`, `residency_scope`, `engaged_at`, `expected_recovery_at` (best-effort) | §31 standard, Ops-only audience |

All payloads ≤ 256 KB; HMAC-SHA256 signed; idempotent via `event_id`; DLQ after 5 failures per §31.

### 2.12 PolicyPack — The Decision Layer's Authoritative Org-Context Primitive

The `PolicyPack` is the entity that lets a Decision Layer query produce a *policy-aware* answer. It is org-authored, versioned, and bound to the Buyer Org. Field table:

| Field | Type | Constraints | Notes |
| :--- | :--- | :--- | :--- |
| `id` | UUID (ULID) | PK | Cited as `policy_pack_id` in MCP/REST I/O |
| `org_id` | UUID FK → Org | Required | Buyer Org owner |
| `console` | Enum | Always `decision_layer` | New console value (AE-MPP-07) |
| `name` | String | ≤ 200 chars | "Default", "Engineering Org Policy", "Frontend Stack Policy" |
| `version` | Integer | Monotonic per `(org_id, name)` | Bumped on every published edit |
| `version_label` | String | ≤ 50 chars; nullable | Optional human label ("Q2 2026 update") |
| `is_default` | Boolean | Default false; exactly one row per Org has this true | The default for unspecified `policy_pack_ref` |
| `status` | Enum `policy_pack_status` (Appendix J — new): `draft`, `published`, `deprecated`, `archived` | State machine in Appendix L |
| `preferred_vendor_seller_org_ids` | Array[UUID] | ≤ 100 entries | Whitelist of preferred-vendor Seller Orgs |
| `preferred_vendor_seller_software_ids` | Array[UUID] | ≤ 200 entries | Whitelist of preferred-vendor SellerSoftware |
| `banned_vendor_seller_org_ids` | Array[UUID] | ≤ 200 entries | Hard-deny list |
| `banned_vendor_seller_software_ids` | Array[UUID] | ≤ 500 entries | Hard-deny list (product-level) |
| `existing_contract_seller_software_ids` | Array[Object] | Each: `{seller_software_id, contract_end_date, switching_cost_modifier}` | Used in switching-cost computation |
| `category_budget_caps_first_year_usd` | Map[Marketplace Category slug → integer cents] | ≤ 200 entries | Drives `budget_cap_gate` |
| `required_certifications` | Map[Marketplace Category slug → Array[`compliance_framework`]] | ≤ 200 entries | Drives `certification_gate` per category |
| `residency_overrides` | Map[Marketplace Category slug → `data_residency_region`] | ≤ 200 entries | Per-category override of Org default |
| `min_verification_tier` | Map[Marketplace Category slug → `seller_verification_tier`] | ≤ 200 entries | Per-category floor |
| `security_review_required_categories` | Array[Marketplace Category slug] | ≤ 50 entries | Decision Engine flags rank-1 with `security_review_required=true` |
| `oss_only_categories` | Array[Marketplace Category slug] | ≤ 100 entries | Restricts ranking to `license_posture.kind ∈ oss_*` |
| `policy_doc_attachments` | Array[UUID FK → KBDocument] | ≤ 20 entries | Original source documents the policy pack derives from (e.g., security-review SOC2 report); used by `policy_pack.parse` lineage |
| `parse_lineage_kind` | Enum (`hand_authored`, `parsed_from_doc`, `imported_from_partner_pack`) | Default `hand_authored` | Tracks provenance |
| `created_at` / `updated_at` / `created_by` / `updated_by` / `published_at` / `deprecated_at` / `deleted_at` | Standard | | |

**Scope.** Org-scoped, `console=decision_layer`. **Indexes.** `(org_id, status)`, `(org_id, is_default)`, `(status, deprecated_at)`. **Retention.** Lives for life of Org; deprecated rows retained 24 months for replay support; deleted_at hard-deletes after 30 days per §40.2 (new retention class `policy_pack_default`, AE-MPP-10). **DSAR.** A user-initiated DSAR on a member who authored or last-edited a policy pack anonymizes `created_by`/`updated_by` while preserving the row; the policy pack is org-property, not user-property. **Residency.** Region-pinned via `org.data_residency_region`.

### 2.13 Decision Entity — The Audit Substrate

| Field | Type | Constraints | Notes |
| :--- | :--- | :--- | :--- |
| `id` | UUID (ULID) | PK | Cited as `decision_id` |
| `org_id` | UUID FK | Required | Buyer Org |
| `console` | Enum | `decision_layer` | |
| `agent_caller_id` | UUID FK → AgentCaller (new entity below) | Required | The calling agent identity |
| `category_resolved` | String | Marketplace Category slug | Post-taxonomy-resolution |
| `requirements_payload` | JSONB | ≤ 32 KB | Frozen at write time |
| `constraints_payload` | JSONB | ≤ 16 KB | Frozen at write time |
| `policy_pack_id` | UUID FK | Required | |
| `policy_pack_version` | Integer | Required; denormalized for replay | |
| `model_version_id` | UUID FK → MarketplaceMatchScoreModelVersion | Required | Per §27.4.5 |
| `feature_registry_version` | String | Required; denormalized | |
| `decision_engine_version` | String | Required | E.g., `v1.0.0` |
| `rankings` | JSONB | ≤ 256 KB | Full output payload (cite `decision_id` and `rankings[].audit_receipt.signature` are the canonical references; stored body for replay) |
| `filtered_out_payload` | JSONB | ≤ 64 KB | |
| `compute_latency_ms` | Integer | | |
| `ai_operation_id` | UUID FK → AIOperation | Required | The §4.8.1 ledger entry |
| `accepted_at` | Timestamp | Nullable | Set when `decision.accepted` event fires |
| `accept_signal_kind` | Enum (`transact_intent`, `vendor_provisioned`, `explicit_accept`, `override`) | Nullable | |
| `chosen_seller_software_id` | UUID FK | Nullable; set on accept | |
| `is_publicly_shareable` | Boolean | Default false | If true, accessible via `decisions.sourcera.com/{decision_id}` without auth |
| `audit_receipt_payload` | JSONB | | HMAC-SHA256 signature + feature_vector_hash bundle |
| `expires_at` | Timestamp | Required | retention horizon (default 60 days) |
| `created_at` / `updated_at` / `created_by` (synthetic agent user) / `deleted_at` | Standard | | |

**Scope.** Org-scoped (Buyer side), `console=decision_layer`. **Indexes.** `(org_id, created_at DESC)`, `(agent_caller_id, created_at DESC)`, `(model_version_id, created_at)`, `(category_resolved, created_at)`. **Retention.** 60 days hot for buyer Org access; 7 years cold for audit (Enterprise tier signed-receipt model — same as §27.4.12 audit pattern); per §40.2 new retention class `decision_60d_default_buyer_org`. **DSAR.** On Org DSAR, full purge (financial-record exception does not apply; decisions are operational records, not financial records — the AIOperation row is the financial record and stays per §40.2). On agent-caller DSAR (per §6.8 agent-identity DSAR — AE-MPP-11), `agent_caller_id` is anonymized while the Decision row is preserved for ranking-quality continuity.

### 2.14 AgentCaller Entity — Identity for Code-Time Agents

The `AgentCaller` is the per-agent-identity row that lets a Buyer Org issue, scope, rotate, and revoke credentials for the specific agent harness sessions making Decision Layer calls. It is org-authored and parallel to API tokens but with broader semantics.

| Field | Type | Constraints | Notes |
| :--- | :--- | :--- | :--- |
| `id` | UUID (ULID) | PK | Cited as `agent_caller_id` |
| `org_id` | UUID FK | Required | |
| `console` | Enum | `decision_layer` | |
| `display_name` | String | ≤ 100 chars | "Cursor — frontend team", "Claude Code — internal CI", "Devin — staging only" |
| `harness_kind` | Enum `agent_harness_kind` (Appendix J — new): `claude_code`, `cursor`, `devin`, `replit_agent`, `cline`, `aider`, `continue`, `codex`, `windsurf`, `bolt`, `unknown_mcp_client`, `custom_orchestrator` | Required | Drives behavior heuristics + UA-validation; not security-critical |
| `agent_harness_user_agent_pattern` | String (regex) | ≤ 200 chars; nullable | Optional UA validation for additional scoping |
| `default_policy_pack_id` | UUID FK | Required | Falls back if call omits `policy_pack_ref` |
| `allowed_categories` | Array[Marketplace Category slug] | Nullable; null = all | Optional category-allowlist |
| `disallowed_categories` | Array[Marketplace Category slug] | ≤ 50 entries | Optional category-denylist |
| `tier` | Enum `decision_layer_tier` (Appendix J — new): `t1_recommend_only`, `t2_assisted_provision`, `t3_agentic_transact` | Default `t1_recommend_only` | Per §3 of this doc — drives whether `decision.transact*` endpoints are reachable |
| `monthly_decision_budget` | Integer | Default = plan-tier ceiling | Per-caller spend cap to limit blast radius if a token leaks |
| `monthly_decisions_consumed` | Integer | Counter; resets at billing cycle | |
| `is_revoked` | Boolean | Default false | |
| `last_used_at` | Timestamp | Nullable | |
| `created_at` / `updated_at` / `created_by` / `deleted_at` | Standard | | |
| `secret_hash` | String | Bcrypt of the issued bearer | The bearer is `srck_dl_{org_prefix}_{agent_caller_prefix}_{token}`; never re-displayed after issuance |

**Scope.** Org-scoped, `console=decision_layer`. **Indexes.** `(org_id, is_revoked, last_used_at DESC)`, `(secret_hash)`. **Retention.** Revoked rows retained 90 days then hard-deleted. **DSAR.** AgentCaller is Org-property; not user-property; survives user DSAR. **Audit.** Every `agent_caller.created` / `agent_caller.rotated` / `agent_caller.revoked` lands in §40 audit log.

### 2.15 New Console Enum Value

The Decision Layer adds `decision_layer` to Appendix J `console` enum, making the canonical value set: `buyer`, `seller`, `cross-console`, `decision_layer` (AE-MPP-07). Note the architectural distinction: `decision_layer` is **a child of the Buyer console** for firewall purposes — Decision Layer reads can read Seller-side KB content (because Marketplace Match Scoring already does, and the Decision Layer reuses that surface), but Decision Layer reads cannot leak the Buyer's own AIOperations or workspaces to Sellers. Conceptually this is identical to the §27 Marketplace, which is also "Buyer-Side, with Seller-side data exposure subject to seller-controlled visibility."

---

## 3. Provisioning + Payments Path — Three-Tier Table

The Decision Layer monetizes through three escalating tiers. Tier 1 is the wedge; Tier 3 is the optionality and the long-term defensibility lever; Tier 2 is the bridge.

| Aspect | **Tier 1 — Recommendation Only** | **Tier 2 — Assisted Provisioning** | **Tier 3 — Agentic Transaction** |
| :--- | :--- | :--- | :--- |
| What the agent gets | Ranked top-N with rationale, evidence, and policy outcomes | Tier 1 + a partner-onboarding deep-link, an OAuth handshake URL, or a signup-API token | Tier 1 + Tier 2 + the agent initiates the actual purchase on the buyer org's credentials, gated by policy and reversible per the payment-protocol's refund window |
| What does NOT happen | No accounts created, no API keys vended, no money moves | Sourcera does not move money. Sourcera surfaces the partner's onboarding URL with an Org-bound state token; the buyer org's developer (or admin) completes provisioning at the partner | Sourcera initiates payment via Stripe Agentic / Coinbase x402 / Visa Intelligent Commerce / Mastercard Agent Pay / Google AP2 — whichever the partner supports — under the buyer org's pre-authorized credentials. Sourcera takes a 1.5% take-rate (capped at $50; AE-MPP-08); the buyer pays the remaining 98.5%; the seller receives 100% minus the standard payment-rail fee, less the take-rate split per §3.4 below |
| Payment protocol | n/a | n/a (Sourcera is the discovery surface, not the payment surface) | Stripe Agentic Checkout (default — Sourcera's Stripe relationship is already in place per §34.10 wallet posting), Coinbase x402 (HTTP-402-native, ideal for OSS / consumption tools), Visa Intelligent Commerce / Mastercard Agent Pay (card-network-native; longer integration), Google AP2 (Web-Pay-style; deferred to Year-2 if relevant) |
| Trust boundary | Seller is read-only; Buyer is read-only; Sourcera reads both | Seller exposes a partner-onboarding endpoint; Buyer's developer authorizes via existing partner-side OAuth | Seller exposes a buyer-org-pre-authenticated checkout endpoint; Buyer's `org_owner` or `billing_admin` (§5.2) has pre-approved a per-category transaction cap in the policy pack |
| Org-policy gates | Policy pack as input feature (§2.12) — preferred-only, banned, residency, budget, certifications | Same plus partner-onboarding-URL allowlist (so a `org_admin` can approve specific provisioning surfaces — e.g., "OK to onboard with Vercel," "Not OK to onboard with HashiCorp until contract signed") | Same plus per-category transaction-cap pre-authorization. The cap MUST be set explicitly by an `org_owner` or `billing_admin` per category; default is $0 (no agentic transactions allowed). A transaction over the cap requires synchronous human approval via §29 Notifications |
| Audit trail event | `decision.recommended` | `decision.recommended` + `decision.provisioning_attempted` (new event; AE-MPP-12) | `decision.recommended` + `decision.transact_intent` + `decision.transacted` |
| Liability model | Sourcera is responsible for the integrity of the recommendation; not for the seller's underlying service | Sourcera is responsible for the recommendation + the validity of the partner-onboarding URL + the existence of the partner-onboarding-URL allowlist gate | Sourcera is responsible for the recommendation, the partner-onboarding URL, the integrity of the policy gate, and the irrevocability/reversibility semantics of the payment rail. Sourcera is **not** responsible for the underlying service quality post-purchase. Per the integrity covenant (§7), Sourcera is **not** liable for adverse decisions arising from sellers paying for placement, because Sourcera does not allow sellers to pay for placement |
| Reversibility | n/a (no transaction) | Buyer cancels at the partner | Refund window per the payment protocol's terms (Stripe: standard 60-day chargeback window; x402: synchronous protocol-level refund; Visa ICC: card-network 90-day dispute window). Sourcera surfaces the reversibility window in the `decision.transact_intent` and audits the dispute path |
| Sourcera consumption-billing implication | One `decision.recommend` AIOperation @ $0.50 value per accepted decision | Same plus zero (Tier 2 is a Tier-1 charge plus a free deep-link generation) | Same plus one `decision.transact` AIOperation @ $2.00 + 1.5% take-rate (capped at $50 per transaction) |
| Plan-tier gating | All Buyer paid plans (Solo / Starter / Growth / Scale / Enterprise); Buyer Free gets 50 free decisions/month | Buyer Growth+ | Buyer Scale + Enterprise. Per the integrity covenant — Tier 3 is restricted to plan tiers with mature `billing_admin` controls and committed-spend posture, because the blast radius of an agentic transaction is the size of the policy-pack budget |
| Default OFF posture | Tier 1 default ON for all paid plans + 50 free/mo on Free | Tier 2 default OFF until `org_admin` enables per-category | Tier 3 default OFF; requires explicit per-category cap configuration by `billing_admin`; categories with `security_review_required=true` are disallowed for Tier-3 even if the cap is set |
| Failure-modes addressed | Standard §32 errors + new error codes in §4.6 below | Partner-onboarding URL stale, partner refuses the org-bound state token, partner-onboarding-URL allowlist rejects | Transaction declined, payment-rail outage, partner refuses the agentic-checkout flow, policy gate trips synchronously, race condition (two concurrent `decision.transact` for the same `decision_id`) — all enumerated in §4.6 |

### 3.1 Tier-1 Specifics

Tier 1 is the wedge. Make it ridiculously good and ridiculously cheap. It is Sourcera's distribution. Every paid plan gets Tier 1; Free gets 50 decisions/month. The OSS template integration (§8 below) makes Tier 1 viral.

### 3.2 Tier-2 Specifics — Partner-Onboarding Handshake

Tier-2 onboarding generates a per-decision, org-bound deep-link to the partner's onboarding flow. The link carries a Sourcera-issued JWT in the query string (or a Sourcera-issued state token under the partner's existing OAuth flow), enabling the partner to (a) attribute the new account to Sourcera, (b) bind the new account to the buyer Org for audit, (c) optionally pre-fill the buyer Org's name + region. Partners receive a "Sourcera-Onboarded" badge on their seller profile (Authored Extension — AE-MPP-13). This is **not** a paid placement — it is a free attribution mechanism that flows from Tier-1 ranking. Critically: the *act* of partner-onboarding does not affect ranking. Sellers who accept Sourcera-onboarded accounts and sellers who don't are ranked identically.

### 3.3 Tier-3 Specifics — Agentic Transaction Path

Tier 3 is the most ambitious surface, and the most integrity-sensitive. The contract:

1. **Pre-authorization, not auto-authorization.** A buyer Org does not pre-authorize the Decision Layer to spend. They pre-authorize per-category transaction caps in the policy pack. A category without a cap defaults to $0 — no agentic transaction possible.
2. **Sync vs. async settlement.** Stripe Agentic and x402 settle synchronously (within ~3s); Visa ICC and Mastercard Agent Pay settle within ~30s. Sourcera's `decision.transact` endpoint blocks for ≤ 30 s; longer-running settlements complete async via webhook and the response carries `transaction_id` with `settlement_pending=true`.
3. **Idempotency.** `decision.transact` is keyed on `(decision_id, transact_attempt_seq)`; a retried transaction within the same attempt-seq returns the same `transaction_id`. The buyer's payment rail is responsible for cross-system idempotency (Stripe Agentic provides this natively).
4. **The take-rate is split as follows (illustrative; finalized at partner contract):** of 1.5% on a transaction, Sourcera retains 1.0% for platform operating cost; 0.5% flows to the seller as a Sourcera-attribution credit applied to the seller's next monthly subscription invoice (so the seller is, effectively, *paid back* a fraction of the take-rate for accepting the agentic-onboarding flow). This makes the take-rate a *positive-sum* mechanism: the seller's net cost is lower than direct partner acquisition (typical CAC > the full take-rate); the buyer's net cost is unchanged versus direct purchase (the partner absorbs the take-rate by treating it as a marketing channel, not an additional fee on the buyer); Sourcera funds the operational layer.
5. **Dispute path.** Tier-3 disputes route through the buyer's payment rail's standard mechanism (Stripe chargebacks, card-network disputes). Sourcera does not adjudicate; Sourcera surfaces the chargeback path and records the outcome on the `Decision` row's `decision.transacted` event.

### 3.4 Tier-Activation State Machine

| From | To | Trigger | Actor | Notes |
| :--- | :--- | :--- | :--- | :--- |
| (init) | `t1_recommend_only` | Buyer Org first creates an `AgentCaller` | Buyer Org | Free for 50 decisions/month + paid above |
| `t1` | `t2_assisted_provision` | `org_admin` enables Tier-2 + (optionally) populates partner-onboarding-URL allowlist | `org_admin` | Buyer Growth+ only |
| `t2` | `t3_agentic_transact` | `org_owner` OR `billing_admin` enables Tier-3 + populates per-category transaction caps | `org_owner` or `billing_admin` | Buyer Scale + Enterprise only; categories with `security_review_required=true` disallowed |
| any | `revoked` | `org_owner` revokes the AgentCaller OR fraud detection | `org_owner` or system | All in-flight decisions complete; new requests rejected |
| `t3` | `t2` | Downgrade by Org policy | `org_owner` or `billing_admin` | Per-category caps cleared |
| `t2` | `t1` | Downgrade by Org policy | `org_admin` | Allowlist cleared |

---

## 4. Master Spec Deltas — Section by Section

This block is the buildable scope of the Decision Layer authored at Master-Spec fidelity. Every cross-reference is concrete; every new entity has the required field-table treatment; every new enum is registered in Appendix J; every new endpoint follows §32 patterns; every new webhook follows §31; every plan-gate flows through §5.11 and §34.

### 4.1 New Section §52 — The Sourcera Decision Layer

A new top-level section. Cross-references existing sections without restating them. Authored at the same fidelity as §22 (Seller Console — Knowledge Base) and §27 (Marketplace).

```
# 52. The Sourcera Decision Layer {#52.-the-sourcera-decision-layer}

## 52.1 Purpose & Scope                  -- one-product, two-surface thesis (§1 of this doc)
## 52.2 Architectural Overview           -- Decision Engine pipeline (§2.2 of this doc)
## 52.3 PolicyPack Entity                -- §2.12 of this doc
## 52.4 Decision Entity                  -- §2.13 of this doc
## 52.5 AgentCaller Entity               -- §2.14 of this doc
## 52.6 The MCP Server (sourcera_decision)
## 52.7 Decision Engine Versioning + Determinism Contract  -- §2.8
## 52.8 Tier-1 Recommendation Surface    -- §3.1
## 52.9 Tier-2 Assisted Provisioning Surface
## 52.10 Tier-3 Agentic Transaction Surface
## 52.11 Failure Modes (counterfactual pass)
## 52.12 Acceptance Criteria
```

**Authoring intent.** §52 is the canonical home for the Decision Layer. It is structurally analogous to §22 (Seller KB) — its job is to bind a new external surface to existing engines.

### 4.2 §22 — Managed Agents Extension

A new agent definition: `agent_sourcera_decision_recommender_v1` (§22.10.x; AE-MPP-04). Field table follows the §22.10.1 conventions:

| Field | Value |
| :--- | :--- |
| `id` | `agent_sourcera_decision_recommender_v1` |
| `purpose` | Generates structured rationale tokens for Decision Layer recommendations by retrieving evidence from the candidate seller's KB and citing the Match-Score feature contributions. Output is the rationale-token bundle returned in `decision.recommend` |
| `model` | `claude-sonnet-4-6` (default); `claude-opus-4-6` for `decision_high_stakes` flag opt-in |
| `tool allowlist` | (a) `agent_toolset_20260401` — `read`, `grep`, `glob` enabled; everything else disabled. (b) `mcp_toolset` `sourcera_kb` — `kb_retrieve`, `kb_get_entry`, `cite_verify`. (c) `mcp_toolset` `sourcera_decision_internal` — `match_score_inspect` (new internal tool; AE-MPP-05). (d) Custom tools — `emit_structured_rationale` (new; AE-MPP-14). |
| `skills` | `skill_sourcera_decision_rationale` (latest), `skill_sourcera_compliance_citations` (existing), `skill_sourcera_confidence_thresholds` (existing). |
| `environment` | `env_sourcera_decision_runner_v1` (new; AE-MPP-15) |
| `version` | Sourcera `v1`; Anthropic version pinned in `POINTERS.json` |
| `update workflow ref` | §22.10.7 (existing) |
| Capability cross-link | §21.4.2 `decision_recommend` (new capability registry row) |
| OutcomeContract cross-link | §34.11.1 `decision_recommend` (new signal; AE-MPP-16) |

**Hygiene rule.** This agent reuses the §22.10.2 First-Pass Responder's RAG-only inviolable rules (every claim cited; `cite_verify` mandatory; no fabrication; firewall enforcement). The agent's job is the rationale, not the score — Match Score computation is engine-side.

### 4.3 §27 Marketplace — Match Score Feature Registry Extension

A new feature axis is added to the §27.4.3 Match Score Feature Registry: `policy_pack_alignment_score` (AE-MPP-03).

| `feature_id` | Name | Type | Source Entity | Freshness Requirement | Weight Mode | Null Handling |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `policy_pack_alignment_score` | PolicyPack Alignment Score | continuous (0.0–1.0) | Decision Layer caller's PolicyPack ↔ candidate's Capability Declaration + Verification Tier + License Posture + Pricing Snapshot | Live (recomputed per Decision invocation) | learned | Null only when no PolicyPack is supplied (Marketplace surface — non-Decision-Layer); imputed at neutral 0.5 + `null_sentinel_flag=true`; feature importance dampened 30% on non-Decision-Layer surface |

The same hard gates apply — `residency_compatible_flag` and `vendor_opt_out_effective_flag`; the policy-pack's `banned_vendor_seller_org_ids` becomes a **third hard gate** (`policy_pack_banned_flag`; AE-MPP-17), short-circuiting score to 0 when triggered.

### 4.4 §32 — New Endpoint Family

§32.5 receives a new endpoint family `### Decisions` and `### PolicyPacks` per §2.10 of this doc. Per-endpoint detail (request/response/error/idempotency) authored under a new §32.10 sub-section `Decision Layer Endpoint Detail`. Rate-limit class `decision_layer_recommend` (100/min/Org) and `decision_layer_policy_check` (600/min/Org) added to §32.4.

### 4.5 §31 / Appendix C — New Webhook Events

The 8 new events from §2.11 of this doc are registered under Appendix C → Decision-Layer-Domain Events. Their PostHog event-taxonomy counterparts land in Appendix G.

### 4.6 Appendix I — New Error Codes

| Code | HTTP | Semantics |
| :--- | :--- | :--- |
| `decision_category_not_found` | 404 | Requested category slug unknown; payload includes top-3 closest controlled-vocabulary suggestions |
| `decision_no_eligible_candidates` | 404 | All candidates filtered by hard gates (residency, opt-out, abuse-suppression, policy-pack banned) — no rankings to return |
| `decision_policy_pack_unauthorized` | 403 | Caller cannot use the requested policy pack (org-mismatch) |
| `decision_policy_pack_not_published` | 422 | Policy pack referenced is in `draft` or `deprecated` state |
| `decision_residency_mismatch` | 403 | Calling agent's policy pack residency requirement does not match Org's `data_residency_region` |
| `decision_tier_required` | 403 | Endpoint requires Tier 2 or Tier 3 access; AgentCaller is at lower tier |
| `decision_transact_category_cap_zero` | 403 | Category has no per-category transaction cap pre-authorized; Tier-3 transaction blocked |
| `decision_transact_category_cap_exceeded` | 403 | Transaction amount exceeds the category cap; synchronous human approval required |
| `decision_transact_security_review_required` | 403 | Category is in `security_review_required_categories` and Tier-3 is disallowed for it |
| `decision_idempotency_key_replay` | 200 (with original payload) | Replay within 60s; same `decision_id` returned |
| `decision_replay_drift` | 500 | Replay output diverges from original — engine bug, P0 |
| `policy_pack_size_exceeded` | 422 | Policy pack exceeds the §39 Object Size limits (50 categories × 5 lookup fields × 5 array entries per field max) |
| `decision_freshness_warning_blocked` | 422 | Caller passed `freshness_warning_blocks=true` and a freshness warning fired; decision not minted |
| `decision_top_k_out_of_range` | 422 | `top_k` outside [1, 10] |
| `decision_evidence_kb_entries_per_vendor_out_of_range` | 422 | `evidence_kb_entries_per_vendor` outside [0, 5] |

### 4.7 §34 / §5.11 — Plan-Gating

A new feature axis is added to the §5.11 Feature Access Matrix: **Decision Layer Access**. Tier mapping:

| Plan Tier | Decision Layer Access |
| :--- | :--- |
| `buyer_free` | Tier 1, 50 decisions/month free, no overage; rate-limit class `decision_layer_recommend_free` (10/min/Org) |
| `buyer_solo` | Tier 1, included in engine-absorbed envelope (§44.6); silent throttling per §44.6.4 |
| `business_starter` | Tier 1; wallet-charged at $0.50/decision per §34.3.4 |
| `business_growth` | Tier 1 + Tier 2; wallet-charged |
| `business_scale` | Tier 1 + Tier 2 + Tier 3 (with required policy-pack cap configuration); wallet-charged + 1.5% take-rate on Tier-3 |
| `buyer_enterprise` | Tier 1 + Tier 2 + Tier 3; committed-spend; signed audit receipts; SLA |

The Seller side is unchanged. Sellers don't pay for Decision Layer access. The Decision Layer's existence does not change Seller plan tiers, except that — per §27.4 generalization — only `verified` and above sellers are eligible for Tier-1 ranking by default (basic-tier sellers are filtered out under the `min_verification_tier=verified` default). This is a default, not a hard gate; an Org's policy pack can lower `min_verification_tier=basic` per category.

### 4.8 §44 — Performance Targets

§44.1 receives new rows:

| Metric | Target |
| :--- | :--- |
| **Decision Layer `decision.recommend` (P95, cached + uncached blended)** | < 800ms |
| **Decision Layer `decision.recommend` (P99, cached + uncached blended)** | < 4s |
| **Decision Layer `decision.recommend` (P95, uncached only)** | < 1.5s |
| **Decision Layer `decision.recommend` (P99, uncached only)** | < 6s |
| **Decision Layer `decision.policy_check` (P95)** | < 200ms |
| **Decision Layer `decision.replay` (P95)** | < 100ms |
| **Decision Layer `decision.transact` (P95, settlement excluded)** | < 1.5s |

These are P95 budgets for the response from the API; the agent harness layer adds its own MCP / SDK overhead that Sourcera does not control. The 800ms blended target is aggressive but achievable: cache hit (60s TTL) is ~50ms; cache miss is ~1500ms (KB retrieval ~300ms + Match-Score compute ~200ms + agent rationale ~600ms + persistence ~100ms + serialization ~300ms).

### 4.9 §39 — Object Size Constraints

Add rows for: `Decision.requirements_payload ≤ 32KB`, `Decision.constraints_payload ≤ 16KB`, `Decision.rankings ≤ 256KB`, `PolicyPack ≤ 64KB total payload`, `policy_pack.parse input doc ≤ 50KB markdown / 10MB raw PDF (handled by §22.7 Document Library)`.

### 4.10 §6.8 / §40.2 — Retention and DSAR

Two new retention classes:

| Retention class | Default | Notes |
| :--- | :--- | :--- |
| `decision_60d_default_buyer_org` | 60 days hot, 7 years cold (signed receipt for Enterprise audit; AE-MPP-18) | Decision rows |
| `policy_pack_active` | Life of org for active; 24 months retained for deprecated for replay | PolicyPack rows |

DSAR: Org DSAR purges all Decision rows and active PolicyPacks; per-user DSAR anonymizes `created_by` / `updated_by` while preserving the audit substrate. The new agent-identity DSAR (AE-MPP-11) anonymizes AgentCaller + Decision `agent_caller_id` references on agent-identity revocation request.

### 4.11 Appendix J / K — New Enums and Glossary Entries

Appendix J additions (new):
- `console`: add value `decision_layer` (AE-MPP-07)
- `decision_layer_tier`: `t1_recommend_only`, `t2_assisted_provision`, `t3_agentic_transact`, `revoked`
- `agent_harness_kind`: `claude_code`, `cursor`, `devin`, `replit_agent`, `cline`, `aider`, `continue`, `codex`, `windsurf`, `bolt`, `unknown_mcp_client`, `custom_orchestrator`
- `decision_outcome`: `pending`, `accepted`, `auto_accepted`, `rejected`, `overridden`, `regression_detected`
- `decision_filter_reason`: `residency_incompatible`, `vendor_opt_out`, `abuse_suppression`, `banned_by_policy_pack`, `below_min_verification_tier`, `outside_preferred_list`, `below_min_match_score`, `exclude_seller_org_ids`
- `decision_accept_signal_kind`: `transact_intent`, `vendor_provisioned`, `explicit_accept`, `override`
- `decision_override_reason_code`: `chosen_vendor_not_in_top_k`, `chosen_vendor_filtered_out`, `prior_relationship_preferred`, `cost_constraint`, `team_familiarity`, `unknown`
- `policy_pack_status`: `draft`, `published`, `deprecated`, `archived`
- `payment_protocol`: `stripe_agentic_checkout`, `coinbase_x402`, `visa_intelligent_commerce`, `mastercard_agent_pay`, `google_ap2`
- `decision_freshness_warning_kind`: `kb_freshness_low`, `capability_declaration_stale`, `pricing_signal_stale`, `model_in_cold_start`, `residency_hard_gate_fired`

Appendix K (Glossary) additions:
- **Decision Layer** — the typed-API and MCP-server surface that lets agentic code harnesses query Sourcera for vendor recommendations, evidence, and (Tier 3) initiate purchases on behalf of a buyer Org. The Decision Layer is a surface, not an engine; it renders against the Buyer Method engine, the Match Score engine, and the Seller KB engine.
- **AgentCaller** — the per-agent-identity row that lets a Buyer Org issue, scope, rotate, and revoke credentials for the agent harness sessions making Decision Layer calls. Parallel to API tokens, with broader semantics (tier, monthly budget, harness kind).
- **PolicyPack** — the org-authored, versioned configuration that binds a Decision Layer call to a Buyer Org's procurement policy. Defines preferred-vendor list, banned-vendor list, residency overrides, budget caps, required certifications, and per-category controls.
- **Decision** — the immutable, replayable artifact that captures a single Decision Layer recommendation. Persists for 60 days hot + 7 years cold (Enterprise). Carries the full feature vector, the rationale token bundle, the policy gate outcomes, the audit receipt, and the AIOperation linkage.
- **Tier-1 / Tier-2 / Tier-3 Decision Layer Access** — the three escalating surfaces at which a buyer Org can engage the Decision Layer: recommendation only, assisted provisioning, agentic transaction.
- **Rationale Token** — a structured, machine-parseable explanation of why a vendor was ranked at a given position. Composed of a summary, a list of supporting Match-Score features with contribution direction and magnitude buckets, and a list of cite-verified KB excerpts.

### 4.12 Appendix M — Surface/Engine Mapping Registry

Twelve new rows under a new section header **Decision Layer (§52)**:

```
| Engine concept | Spec home | Surface metaphor | Hidden from tier(s) | Notes |
| :--- | :--- | :--- | :--- | :--- |
| **Decision Layer (§52)** | | | | |
| `decision_layer` console enum value | §52.1 | No surface — internal routing concept. The MCP server is at `mcp.sourcera.com/decision/v1`; the REST family is at `/v1/decisions`; user-facing references say "Decision Layer" or "Sourcera for Agents" | All (architectural) | New console enum value alongside `buyer`, `seller`, `cross-console` |
| `Decision` entity | §52.4 | Code-time agent surface: machine-only. Human surface (optional): "Why was this chosen?" panel inside Cursor, Claude Code, etc. — rendering the rationale tokens | All Buyer paid plans + Free (50/mo) | Reuses the Match-Score audit-receipt primitive (§27.4.12) |
| `PolicyPack` entity | §52.3 | Buyer Console: "Procurement Policy" tab in Org Settings; one default + N named packs; UI is a guided form, not raw JSON. CLI for power users (`sourcera policy-pack apply ./pkg.toml`) | Free / Solo: 1 pack max; Starter: 3 packs; Growth: 10; Scale: 50; Ent: unlimited | Free-text upload via `policy_pack.parse` (Opus-tier capability) |
| `AgentCaller` entity | §52.5 | Buyer Console: "Agent Access" tab in Org Settings; issue/rotate/revoke tokens; per-caller monthly budget; per-caller tier | All Buyer paid plans (1 caller on Free; 5 on Starter; 25 on Growth; 100 on Scale; unlimited on Ent) | Bearer naming convention `srck_dl_{org_prefix}_{agent_caller_prefix}_{token}` |
| Decision Engine pipeline (§52.2) | §52.2 | No surface — the outcome surfaces in the rationale tokens | All (architectural) | Reuses §27.4 candidate-set logic + §22.8 KB retrieval + §34.11 Outcome Resolver |
| `decision.recommend` AIOperation | §52.6, §34.3.4 | Wallet line item (Starter+); silent on Solo per §44.6 surface treatment; inline counter on Growth+ ("X / 1500 decisions used this month") | Hidden from Solo per §44.6.1 | New capability registry row; pricing per §34.3.1 |
| Tier 1 / Tier 2 / Tier 3 access | §52.8–§52.10 | Buyer Console: Toggle group inside an AgentCaller's settings. Tier 3 has a per-category cap-amount picker | Tier 2: Growth+; Tier 3: Scale+ | Default Tier 3 OFF; categories with `security_review_required` disallowed for Tier 3 |
| Rationale Token Bundle | §52.4 (Decision.rankings.rationale) | Machine-only surface for the agent. Human surface (optional): "Why?" panel in the agent harness UI — rendering the cite-verified KB excerpts and the Match-Score feature contributions | All paid; `kb_evidence` excerpts hidden on Free per §27.4.6 generalization | The KB excerpt content respects §22.8 firewall — only the candidate seller's published KB content is exposed |
| Decision Replay | §52.7 | "Replay this decision" CTA in Buyer Console + the Decision Browser (`decisions.sourcera.com/{decision_id}` for shared decisions) | All paid | Free of charge per §2.7; engine-only replay |
| `decision.transact` payment-protocol routing | §52.10 | Buyer Console: "Agentic Transactions" history; per-protocol breakdown | Tier 3 only (Scale+) | Stripe Agentic / x402 / Visa ICC / Mastercard Agent Pay / Google AP2 |
| `policy_pack.parse` capability | §52.3 | "Upload a security review / preferred-vendor doc — we'll compile it into a policy pack" inline | Growth+ | Opus-tier; $5 per parse; 30-day OutcomeContract window |
| Decision Freshness Warning | §52.7 | Tooltip on the rationale token bundle: "KB last reviewed 6 months ago" / "Pricing signal 45 days old" | All | Engine-side detection per §52.7; never blocks unless caller passes `freshness_warning_blocks=true` |
```

Plus 4 new CI gates registered to §M.5 Phase 14.x CI Gate Catalog (now amended to "Phase 14.x and Decision Layer CI Gate Catalog"):
- `decision_layer_no_pay_for_placement` — asserts no surface allows a seller to pay for ranking position; CI-gates rendering paths and Match-Score model-version registry
- `decision_replay_byte_identical` — asserts replay output equals original output for fixed `(decision_id, model_version_id, feature_registry_version, policy_pack_version, decision_engine_version)`
- `decision_layer_console_firewall` — asserts no Decision Layer surface leaks Buyer Org private data to Sellers (parallel to §7.2 dual-console firewall)
- `decision_layer_policy_pack_residency_consistency` — asserts the Decision Engine routes Decisions to the residency-scoped model version corresponding to the Buyer Org's `data_residency_region`

---

## 5. Pricing & Economics

### 5.1 Buyer-Side Metering

Decision Layer monetization on the buyer side is unambiguously **outcome-based AI consumption**, not a separate seat or API SKU. This preserves the §34 pricing doctrine (no per-unit metering on structural resources; AI value-dollars are the single metered axis). The `decision.recommend` capability's $0.50 accepted price is in line with the existing `pre_scoring` ($0.50 per requirement; §34.3.4) — a reasonable parallel because pre-scoring is the existing closest-analog Buyer-side AI capability.

| Plan Tier | Free Allowance | Per-decision (overage) | Take-rate on Tier-3 transactions | Notes |
| :--- | :--- | :--- | :--- | :--- |
| Buyer Free | 50/month | n/a (hard cap at Free's $5 wallet cap) | n/a (Tier 3 not available) | The free 50/mo is the wedge; designed for OSS-template inclusion |
| Buyer Solo ($49–59/mo) | Engine-absorbed (§44.6) | n/a | n/a | Decision Layer included in the engine-absorbed envelope; throttling per §44.6.4 |
| Business Starter ($299/mo) | Per the standard 10-op signup allowance + plan-included $50 wallet | $0.50/decision via wallet | n/a (Tier 3 not available) | $50 wallet ≈ 100 decisions/mo at $0.50; sufficient for most Starter teams |
| Business Growth ($799/mo) | Same | $0.50/decision | n/a (Tier 3 not available) | $300 wallet ≈ 600 decisions/mo |
| Business Scale ($1,999/mo) | Same | $0.50/decision; preferred 5%-off rate | 1.5% (capped at $50 per transaction) | $800 wallet ≈ 1,600 decisions/mo; Tier 3 access |
| Buyer Enterprise (custom; ≥ $36K/yr) | Committed | Volume-discounted per §34.2.4 | 1.5% (negotiable; capped at $50) | Signed audit receipts; SLA |

### 5.2 The Standalone "Agent API Add-On" Question

A reasonable alternative is to unbundle Decision Layer into a standalone "Agent API" SKU that buyers without the Sourcera evaluation product can buy. **My recommendation is to NOT unbundle at v1.** Reasons:

1. **The bundle is the moat.** The reason a buyer trusts the Decision Layer's recommendation is the same reason they trust a Sourcera evaluation: the Match Score model + the audit posture + the eval data substrate. Unbundling severs the trust chain and turns the product into a thin MCP wrapper.
2. **Free-tier-as-distribution serves the same purpose.** A buyer can sign up for Buyer Free, never use the evaluation pipeline, and get 50 free decisions/month. They get the Decision Layer with the bundle attached at zero conversion friction. If they need more than 50, they upgrade to Starter — which is where the buyer-pricing-strategy v3 wedge already lives.
3. **Unbundling creates an integrity attack surface.** A standalone Agent API SKU invites the question "do you also offer a paid-for-placement API?" — a question Sourcera's bundle posture answers structurally (no, sellers buy KB and Verified-tier listing, neither of which surfaces inside a Decision Layer ranking).

If after 12 months the data shows that >40% of Decision Layer adoption comes from Orgs that never run a buyer evaluation, revisit the unbundle question.

### 5.3 Seller-Side Economics

**Sourcera does not charge sellers for ranking position. Period.** This is the integrity covenant (§7) and the differentiation lever versus Smithery, AGNTCY, AWS Marketplace agent surface, and every existing developer-tools-marketplace placement-auction model. Sellers monetize the Decision Layer through:

| Mechanism | Description | Revenue source for Sourcera | Is this pay-for-placement? |
| :--- | :--- | :--- | :--- |
| **Verified Listing tier** ($499 Seller Growth) | Required to be eligible for default Decision Layer ranking (`min_verification_tier=verified` is default) | Existing Seller Growth subscription | **No.** Verification tier is a quality-signal feature, identical in semantics to the existing `verification_tier_ordinal` Match-Score feature (§27.4.3). The default `min_verification_tier=verified` is policy-pack-overridable; an Org's policy pack can set `min_verification_tier=basic` per category to expand the candidate set |
| **Premium Verification (Certified)** ($1,499 Seller Scale) | Higher Match-Score signal under `verification_tier_ordinal` (3 vs. 2); marginal ranking lift | Existing Seller Scale subscription | **No.** Same logic — Certified is a verifiable quality signal (audited capability declarations, audited KB freshness, signed compliance docs in the Document Library), not a paid boost |
| **Tier-3 transaction take-rate (1.5%)** | Sourcera retains 1.0%, the seller receives 0.5% as a Sourcera-attribution credit on next month's invoice | Tier-3 transaction volume on the Buyer side | **No.** The take-rate is on transactions Sourcera actively brokered, not on ranking position. A seller refusing to support agentic transactions still ranks the same as one that does |
| **Capability Declaration breadth** | More published, well-cited Capability Declarations → higher `capability_declaration_overlap_ratio` Match-Score feature → better default ranking | Existing Seller plan tier (KB entry ceiling tied to plan tier) | **No.** This is the seller investing in their own data — equivalent to a developer writing better docs, not buying ad space. The §27.4 `kb_to_capability_linkage_ratio` feature explicitly *rewards* sellers for backing declarations with KB evidence |
| **KB Document Library / Compliance Doc freshness** | Higher `kb_freshness_score` Match-Score feature → better default ranking | Existing Seller Growth+ subscription (KB document ceiling) | **No.** Investing in fresh evidence is investing in trust |
| **Marketplace Promoted Listings** (existing, §4.4.19) | NOT visible in Decision Layer rankings (AE-MPP-19; new `decision_layer_excludes_promoted_placements` invariant) | Existing Seller Scale promoted-listings revenue | **N/A — explicitly excluded.** Promoted Listings remain a Marketplace-surface-only mechanism. The Decision Layer is a paid-placement-free zone |

The asymmetry is the point. Marketplace allows Promoted Listings (auction-priced, transparent, badged as "Boosted") because that's a human-facing surface where humans can pattern-match the boost. The Decision Layer is a machine-facing surface where pattern-matching is impossible — therefore promoted placements would be undetectable bias and are categorically excluded.

### 5.4 Marketplace Economics — the take-rate in context

Tier-3 transactions are 1.5% take-rate, capped at $50 per transaction. At illustrative scales:

| Scenario | Decisions / month | Tier-3 transactions | Avg transaction size | Sourcera Tier-3 revenue |
| :--- | :--- | :--- | :--- | :--- |
| Conservative pilot (Year 1) | 50K | 5K (10% conversion) | $1,200/yr → ~$100/mo | $7.50 / transaction → $37,500/mo |
| Moderate Year 2 | 500K | 75K (15% conversion) | $1,200/yr | ~$525,000/mo |
| Bullish Year 3 | 5M | 1M (20% conversion) | $1,500/yr | ~$7M/mo (capped at $50/txn → likely $5M effective) |

The cap matters. A monthly $1,500 transaction earns Sourcera 1.5% × $1,500 = $22.50 (uncapped); a $5,000/mo enterprise commit earns Sourcera $50 (capped). The cap protects the seller-take economics on enterprise deals — agents transacting on enterprise pricing don't pay Sourcera "more for nothing." This is structural alignment with the integrity covenant: transaction volume scales the take, but enterprise deals don't pay an outsized cut.

### 5.5 Per-Capability Pricing Posture and Margin Floor

All Decision Layer AIOperations follow §34.3.1 (`value_price = MAX(min_value, cost_base × 10)`) and the §34.3.3 88% blended-margin floor. New capability cost-bases are seeded at the values in §2.7 of this doc and recomputed nightly per §34.3.3. The §44.6 Solo-Tier engine-absorbed envelope absorbs Decision Layer consumption identically to other capabilities; throttling on `low_priority_background` does NOT apply to `decision.recommend` (it's `active_workflow`).

### 5.6 Free-Tier OSS-Template Mechanics

The Decision Layer's distribution loop is the OSS template. A `sourcera.toml` file in a project's root specifies the Org and policy-pack-ref:

```toml
# sourcera.toml
[org]
id = "org_01EXAMPLE..."
agent_caller_id = "agnt_default_for_oss_use"

[policy_pack]
default_id = "pkpk_oss_friendly"
```

OSS templates including `sourcera.toml` get Tier-1 access at no cost to the contributor, with the Sourcera template Org as the billed party (Sourcera-as-a-cost-center). Templates ship with `policy_pack_ref` defaulting to a community-maintained "OSS-friendly" pack that prefers Apache-2/MIT/BSD-licensed candidates and explicitly excludes proprietary-only options unless the user opts in. This is a marketing cost (`platform_marketing` cost center per §34.3.5), not a customer-billed line.

---

## 6. Integrity & Trust Architecture

This section is the existential bet. The Decision Layer either is *the most trusted procurement substrate for agents* or it is dead in 18 months. Trust is not branding; it is enforced by mechanism. Six mechanisms make the integrity covenant credible and four make it auditable.

### 6.1 Mechanism 1 — No Pay-For-Placement, Period

The structural prohibition. Sellers cannot pay for ranking position in the Decision Layer. This is encoded in:

- **Master Spec invariant** §52 acceptance criteria #1 (AE-MPP-20): "A seller's monetary contribution to Sourcera (subscription, premium tier, transaction take-rate, marketplace promoted listing) MUST NOT influence the Match Score computation in any Decision Layer surface. The §27.4.3 feature registry's `weight_mode` for any monetary-incentive feature MUST be null. Promoted Listings (§4.4.19) MUST NOT surface in Decision Layer rankings (CI gate `decision_layer_excludes_promoted_placements`)."
- **CI gate** `decision_layer_no_pay_for_placement` — runs on every PR touching Decision Layer rendering paths, the §27.4.3 feature registry, the §27.4.4 hard-gate set, the Match-Score model-version registry, and the §4.4.19 PromotedListing rendering paths. The gate explicitly asserts that no monetary-feature-id appears in the Match-Score feature registry's `weight_mode != null` set, and that PromotedListing renders DOM-snapshot returns zero results inside any Decision Layer endpoint or MCP tool response.
- **Public scoring rubric** — the §27.4.3 feature registry is published quarterly (per §27.4.5 retraining cadence) and is publicly inspectable at `https://sourcera.com/transparency/decision-rubric`. Each feature's `source_entity`, `freshness_requirement`, and `null_handling` is human-readable. Weight magnitudes are NOT published per §27.4.6 — exposing weights creates an adversarial-gaming surface.
- **Annual third-party procurement-integrity audit** — Sourcera commissions an annual independent audit (target firms: a procurement-law-specialist firm — Davis Wright Tremaine or Wilson Sonsini class — plus a technical-fairness audit firm like SocArXiv contributors or an academic group) on the §27.4.3 feature-registry, the §27.4.4 hard-gate set, the §27.4.11 fairness audit suite, and the Decision Layer's surface integrity. Public report. Year-1 audit is scheduled at the 12-month mark of public launch.
- **Open scoring-rubric change-log** — every change to the §27.4.3 feature registry, the §27.4.4 hard-gate set, or the Match-Score model version (§27.4.5) writes a public change-log entry with the diff, the reviewer signatures, and the rationale.

### 6.2 Mechanism 2 — Cited Evidence, Not Claimed Capability

Every Decision Layer ranking carries up to 5 cite-verified KB excerpts per top-K vendor. The excerpts are pulled from the seller's own published KB and validated through the existing `cite_verify` MCP tool (§22.8.4.7) in real time at the time of the recommendation. A seller cannot claim a capability they don't have — because the rationale token requires KB evidence for the capability, and the KB evidence is the seller's own writing, audited for freshness via the §22.5 KB Health Model.

This is what differentiates Sourcera from Smithery. Smithery returns: "use Supabase." Sourcera returns: "use Supabase — here are 3 cite-verified KB excerpts from Supabase's published documentation showing native PITR, RLS, and SOC2 Type II posture; the most recent excerpt was reviewed 23 days ago."

### 6.3 Mechanism 3 — Determinism and Replay

A decision is an immutable artifact. A `decision.replay` returns byte-identical output. A buyer auditing a 6-month-old agent decision can prove what the decision was at the time. This is the legal-defense substrate against procurement-policy disputes and the evidentiary substrate for the third-party audit.

### 6.4 Mechanism 4 — Hard Gates Are Public and Inviolable

The §27.4.4 hard-gate model — `residency_compatible_flag=0` and `vendor_opt_out_effective_flag=1` short-circuit the score to 0 — is generalized to a third gate in the Decision Layer: `policy_pack_banned_flag=1` (AE-MPP-17). Hard gates are NOT learned weights; they cannot be tuned away by any model retraining. They are encoded directly in the Decision Engine pipeline (§52.2 step 8) and asserted in CI.

### 6.5 Mechanism 5 — Console Firewall Extends to the Decision Layer

The §7.2 dual-console firewall is extended: a Buyer Org's Decision queries cannot leak the Buyer's private workspace data to a Seller, and a Seller cannot read a Buyer's policy pack or Decision history. The Decision Layer's `console=decision_layer` enum value enforces this scoping at the database layer, exactly the same pattern as `console=buyer` and `console=seller` enforce today. CI gate `decision_layer_console_firewall` asserts on every PR.

### 6.6 Mechanism 6 — Adversarial Gaming Surface Is Minimized

The §27.4.6 weight-magnitude-non-exposure rule is generalized to the Decision Layer: rationale tokens expose the *direction* of feature contribution and the *magnitude bucket* (high/medium/low), but never the underlying weight or the exact contribution magnitude. This prevents a seller from optimizing for a single feature in isolation; the seller has to optimize the underlying capability quality, not a metadata field.

### 6.7 The Buyer-Console Firewall Extension Question

The Decision Layer reads Seller-Console KB content (read-only) the same way Marketplace Match Scoring does (per §22.8.5 — buyer-console-driven retrievals against seller KB are vault-JWT-scoped, namespace-scoped, and read-only). The Decision Layer does NOT cross the firewall the other direction — Sellers cannot read Buyer Decisions. This is the same firewall posture as the Marketplace (§27.2). No change to the dual-console firewall is required.

### 6.8 Marketplace-Domain Leakage

The Decision Layer surface is at `decisions.sourcera.com` (the public Decision Browser, only for shareable decisions) and `mcp.sourcera.com/decision/v1` (the MCP server). Neither leaks Buyer or Seller marketplace-domain content beyond what the Marketplace already exposes. The Decision Browser is a post-decision render with the same "what's on the public Marketplace + the cite-verified KB excerpts the buyer's policy-pack consented to" exposure model.

### 6.9 The "Procurement Kickback" Legal Risk

The Decision Layer earns money from buyers via subscription + AI consumption. Sellers do not pay for placement. The Tier-3 take-rate is paid by the buyer's payment rail (Stripe Agentic / x402 / etc.), passed through Sourcera, with 0.5% rebated to the seller as Sourcera-attribution credit. This is not a kickback; it is a transaction-brokerage take, structurally identical to Stripe's own card-network take-rate or a marketplace-as-platform's transaction fee. The legal risk is non-zero (procurement-kickback law is jurisdiction-varied, especially for federal/state-funded buyers), and the mitigation is:

1. **Public, plain-English disclosure** — the Decision Layer's terms of service explicitly disclose the Tier-3 take-rate and the 0.5% seller rebate in plain English; the rationale token's `pricing_snapshot.first_year_cost_usd_estimate` is the all-in cost, not the cost minus take-rate.
2. **Buyer-controlled gating** — Tier 3 is opt-in, per-category cap-required, requires `org_owner` or `billing_admin` configuration. A buyer that doesn't opt in never transacts agentically.
3. **Federal-and-state-funded-buyer disclaimer** — the policy pack carries a flag `is_federal_or_state_funded` (AE-MPP-21); when set, Tier-3 is disallowed system-wide and a banner surfaces at policy-pack creation.
4. **External legal review at year-1 third-party audit** — the procurement-law audit firm (per §6.1 above) reviews the Tier-3 take-rate structure annually and publishes a finding.

### 6.10 The "Sponsored / Boosted" Question — Why No Sponsored Slots

A common pattern in adjacent product categories (Smithery, AWS Marketplace, npm) is to allow paid promoted slots clearly labeled "Sponsored." Sourcera explicitly rejects this for the Decision Layer because sponsored slots in agent-facing surfaces are *undetectable bias* — the agent harness doesn't pattern-match the badge. A human can recognize "Sponsored: Use this CRM" as advertising; a code-generation harness cannot. Sponsored slots in the Decision Layer would create an incentive structure that defeats the integrity covenant — sellers buy slots, agents pick the boosted answer, buyers get systematically biased recommendations they cannot detect, the integrity audit catches it 18 months later, the trust collapse is irreversible. Therefore: no sponsored slots, anywhere, ever, in the Decision Layer.

---

## 7. Competitive Landscape & Timing Window

The credible competitor set divides into five categories. The wedge is real but closes within 12–18 months. The closing is driven by Anthropic and OpenAI shipping native registry-plus-recommendation surfaces inside their own agent SDKs.

| Category | Specific competitors | What they do | What they DON'T do | Why Sourcera wins (or could lose) |
| :--- | :--- | :--- | :--- | :--- |
| **MCP-tool registries** | Smithery, Cline marketplace, Continue's tool registry, AGNTCY (Cisco/Outshift), AWS Marketplace agent surface (preview), GitHub MCP registry (rumored Q3-2026) | Catalog of available MCP tools/agents; agents discover what tools EXIST | Recommend WHICH tool to use given org policy, evaluation evidence, and procurement constraints | Sourcera positions as the *decision layer above the registry*. A registry says "Supabase, Neon, AWS RDS exist"; Sourcera says "for your org's policy + this requirement, choose Supabase, here's why, here's the evidence." Lose path: a registry adds policy-aware ranking + evidence (technically hard, but Smithery is well-funded) |
| **Vertical platform pickers** | Cursor's prebuilt-integration picker, Vercel's framework-and-integration picker, Stripe Apps / Stripe Connectors, Replit's template marketplace, Bolt's stack picker, GitHub Marketplace integrations | Picker UX inside their own platform; recommend integrations relevant to their platform's user | Cross-platform; org-policy aware; evidence-backed; not vendor-locked to the platform's own ecosystem | Sourcera is the cross-platform layer. A buyer using Cursor + Vercel + Replit gets the same Decision Layer in all three. Lose path: the platform picker becomes the default and the developer never invokes Sourcera |
| **Native registries from Anthropic / OpenAI** | Anthropic Skills (existing); rumored "Claude Skills Marketplace" (Q3-Q4 2026); OpenAI Apps / GPTs (existing); rumored "OpenAI Tool Registry" (deprecation of Plugins, possibly Q3 2026) | Native discoverability inside the model's own SDK; potential native recommendation feature in the agent SDK | Cross-vendor; org-policy aware; evidence-backed; commercially neutral (Anthropic and OpenAI both have incentives to promote partner tools they have business relationships with) | **The existential threat.** If Anthropic ships a native procurement skill inside Claude Skills with policy-aware recommendation, Sourcera's wedge collapses to "the policy-overlay layer above Anthropic's registry" — a much smaller business. Mitigation: ship before Anthropic does; integrate as a Claude Skill so Sourcera is *the* recommendation skill the moment the marketplace lights up; build the buyer-side data moat that Anthropic doesn't have (Anthropic doesn't run buyer evaluations, doesn't have Capability Declarations, doesn't have Match-Score model versioning). Kill condition: Anthropic ships a native, free, evidence-backed, policy-aware decision skill before Sourcera's beta; Sourcera reorients to the policy-overlay layer or kills the program |
| **Package-manager-native suggestions** | npm "search by usage", pip "pip search", brew "brew install --suggested", DevContainer feature-suggestion, Homebrew Tap suggestions | Index-based search at install time; sometimes weighted by stars / install count | Org-policy aware; evidence-backed; commercially-vendor-aware (none of these distinguish "Supabase" from "Postgres-via-AWS-RDS" semantically) | Sourcera is the *commercial-vendor-aware* decision layer above the package-manager. A `pip install postgres-driver` needs a package manager; a `decide which Postgres SaaS to use` needs Sourcera. Lose path: package managers add commercial-vendor metadata and policy gating (not currently on their roadmap, but possible) |
| **Procurement / spend-management tools** | Vendr, Tropic, Vendr Catalog, Productboard category overlays, Drata's Vendor Trust Center | Existing human-driven procurement substrate; rich vendor data; SOC2 / DPA / pricing visibility | Code-time agent-callable surface; sub-second decision; deterministic replay; OSS-template integration | Vendr/Tropic could ship an agent-callable surface, but their data substrate is human-curated procurement deals, not Capability Declarations + KB evidence + Match Score model. They'd have to build the Match Score primitive from scratch. Lose path: Vendr or Tropic acquires an MCP-shop and ships fast |

### 7.1 The Window

**12–18 months.** The gating events that close it:

1. **Q3 2026** — Anthropic Claude Skills Marketplace likely public; if it ships with native procurement-skill capability, Sourcera's wedge narrows immediately.
2. **Q4 2026** — Smithery's "MCP Pro" tier (rumored) may include "verified" tool ranking with vendor-signal data. If Smithery beats Sourcera to verification-tier-aware ranking, Sourcera loses the "evaluation-backed" wedge.
3. **H1 2027** — AWS Marketplace agent surface graduates from preview. AWS's distribution is enormous; if their agent surface includes policy-aware ranking, Sourcera is disintermediated for AWS-customer Buyers.
4. **H2 2027** — major code-gen harnesses (Cursor, Devin, Replit) likely ship native cross-vendor pickers; if their picker is good enough at the OSS-template level, Sourcera's distribution path through the harnesses narrows.

**The right launch posture:** private alpha by Q3 2026; public beta by Q4 2026; public GA by Q1 2027. Beat Anthropic's marketplace launch, beat Smithery's verification tier, beat AWS Marketplace's GA. Three of the four gating events should land within Sourcera's launch window.

### 7.2 Where Is the Still-Open Wedge?

Three open wedges, ranked by durability:

1. **The Buyer Org Policy Pack.** No competitor has a credible substrate for binding a buyer org's procurement policy (preferred-vendor, banned, residency, budget) into a sub-second tool call. AWS could ship policy-aware ranking *for AWS-services-only*; Vendr has the policy data but no agent surface; Smithery has the agent surface but no policy data; Anthropic has neither today. **Most defensible.**
2. **Cite-verified KB evidence.** Sourcera owns the Seller KB substrate; competitors do not. The cite-verified evidence makes recommendations interpretable in a way registries fundamentally cannot match. **Defensible, but copyable** — Smithery or AWS could build a parallel KB substrate over 12–18 months.
3. **Determinism + replay.** The audit-substrate primitive is buildable but expensive; competitors won't prioritize it until they've been challenged in a procurement-law deposition (which won't happen until the category is mature). Defensible **for Sourcera's audit-conscious enterprise buyer segment**, less so for the OSS-template / Free-tier segment.

---

## 8. GTM + Adoption Mechanics

The Decision Layer's distribution is the agent harness. The Decision Layer adopts via three concentric loops, each more committed than the last.

### 8.1 Loop 1 — Free Tier in OSS Templates (highest reach, lowest commit)

Every popular OSS template (Next.js + Supabase, Remix + Postgres, Astro, Vite + a stack) ships with a `sourcera.toml` file that registers the project to Sourcera's community-pool Org with a community-maintained "OSS-friendly" policy pack. The first 50 Decision Layer calls per project per month are free; charged to Sourcera's `platform_marketing` cost center.

**Adoption mechanic:** a developer running `create-next-app` or `npm create vite` includes the `sourcera.toml` automatically. When they later run their agent harness on the project (Cursor, Claude Code), the harness reads `sourcera.toml` and starts calling Sourcera. Zero commit; zero account; immediate value.

**Distribution dependencies:**
- OSS template maintainer goodwill — partnerships with Vercel (Next.js), Remix Run, Astro, Vite, Bolt template ecosystem
- Cline / Smithery integration — Sourcera's MCP server is listed as a one-click install in Cline's marketplace
- Anthropic Skills integration — Sourcera is published as `skill_sourcera_decision_recommend` in the Claude Skills Marketplace (assumes Anthropic's marketplace launches; if they don't, fall back to the MCP server)

**Concentration risk:** if Vercel or Anthropic deprecate the integration unilaterally, distribution collapses. Mitigation: be in 8+ harnesses simultaneously by GA; never rely on a single distribution channel for >40% of free-tier traffic.

### 8.2 Loop 2 — Buyer Org Adoption from a Free-Tier Project (moderate reach, moderate commit)

A developer using free-tier Decision Layer in an OSS project hits the 50-decision/month cap, sees a "create a Buyer Org" CTA, signs up for Buyer Free (no card, 14-day Business Starter trial), runs ~50 decisions in the trial, converts to Buyer Solo or Business Starter at trial end. This is the existing PLG-loop architecture (§48), with the Decision Layer slotted in as the trigger.

**Quantitative target:** 8% trial-to-paid conversion in Year 1 (consistent with Sourcera's existing PLG funnel benchmarks from `GTM/GTM_PLG_ARCHITECTURE.md`).

### 8.3 Loop 3 — Enterprise Adoption Through the Existing Buyer-Eval Funnel (moderate reach, highest commit)

A Buyer Org running a Sourcera enterprise eval discovers the Decision Layer as a value-add — "you're already using Sourcera for procurement; now extend it to your dev teams' code-time decisions." Cross-sell within the existing customer base. Sales-led; expansion-revenue motion.

**Quantitative target:** 30% of Buyer Scale + Enterprise customers add Tier-2 access in Year 1; 10% of those add Tier-3 access in Year 2.

### 8.4 Distribution Partnerships — Concrete Asks

| Partner | Ask | Sourcera offers | Risk if rejected |
| :--- | :--- | :--- | :--- |
| Anthropic | Publish Sourcera-Decision-Layer as a featured skill in Claude Skills; co-marketing on the launch | Anthropic gets the procurement substrate inside their SDK at zero engineering cost; Anthropic is positioned as the harness with the best procurement integration | Sourcera ships as a generic MCP server; loses preferential surface; mitigation: be the same skill listed in OpenAI Apps too |
| Cursor | Ship Sourcera as a default-on Cursor extension | Cursor users get cite-verified vendor recommendations inline | Sourcera ships as a manual extension install; reach narrows; mitigation: Cline and Continue integration as parallel paths |
| Vercel | `sourcera.toml` on every Next.js + Supabase template; co-marketing | Vercel users get policy-aware ranking; Vercel's templates feel smarter than competitors' | Sourcera ships as an opt-in template; reach narrows |
| Cline / Smithery | Featured listing in the Cline / Smithery MCP marketplaces | Cline / Smithery users get the policy-aware ranking layer they don't have natively | Sourcera ranks as a long-tail listing; reach narrows |
| Stripe | Stripe Agentic Checkout as the default Tier-3 payment protocol; co-marketing on the agent-payments launch | Stripe gets the Decision Layer as a high-value Stripe Agentic adopter; Sourcera gets best-in-class settlement + idempotency + dispute path | Sourcera ships with x402 / Visa ICC instead; engineering cost increases; mitigation: partner with Coinbase x402 instead — the OSS / consumption-tools wedge prefers x402 anyway |
| Linear / Notion / GitHub | Embed `decision.recommend` results inside engineering issues / docs / READMEs | Buyers get policy-aware vendor decisions inside the artifacts they already maintain | Manual integrations only; no first-party embeds; mitigation: a small CLI (`sourcera decide` ) that emits markdown |

### 8.5 Content Engine

GTM content for the Decision Layer leverages existing `GTM/GTM_CONTENT_ENGINE.md` channels:
- "How Sourcera Decides — open-rubric blog series" (publishes the §27.4.3 feature registry quarterly with explanation)
- "Cited evidence, not vibes — comparing agent recommendations" (case studies showing what Sourcera surfaces vs. Smithery, Cursor, etc.)
- "Procurement integrity in the agent era — third-party audit annual report" (the year-1 audit publication)
- "OSS-friendly policy pack as a template" (publishes the community pack)

---

## 9. Engineering Scope & 90-Day Plan

Scope is sharp: build a typed-API + MCP server above the existing Match Score, KB-retrieval, and Outcome-Resolver primitives. Do not build a new ranking model. Do not build a new KB. Do not build a new pricing engine. Reuse, render, ship.

### 9.1 Milestone Shape (per `Build_Execution_Strategy.md` §11)

| Sprint | Duration | Deliverable | Critical-path Master Spec sections |
| :--- | :--- | :--- | :--- |
| **Sprint 0 (1 week)** | Pre-build | RECONCILIATION block, Phase 14.21+ phase prompts, AE ledger entries, mid-engineering review | n/a |
| **Sprint 1 (3 weeks)** | Decision Engine v0 | `Decision`, `PolicyPack`, `AgentCaller` entities; `decision.recommend` REST endpoint; MCP server with `decision.recommend`, `decision.policy_check`; agent definition `agent_sourcera_decision_recommender_v1`; Match-Score `policy_pack_alignment_score` feature; basic policy-pack gates (residency, banned, preferred); single-region (US) only; concierge MVP behind a feature flag | §52, §22.10, §27.4.3, §32.10, §4.8.2 |
| **Sprint 2 (4 weeks)** | Beta Capability Suite | Tier 2 (assisted provisioning); `decision.justify`, `decision.alternatives`, `decision.replay`; `policy_pack.parse` Opus capability; Decision Browser (`decisions.sourcera.com`); Webhook events; full audit-receipt primitive; basic fairness audit suite extension; partner-onboarding URL allowlist; first 5 design partner agents onboarded | §52, §31, §27.4.11, §29 |
| **Sprint 3 (3 weeks)** | Production Hardening | EU residency-scoped model version + Decision Engine path; Stripe Agentic Checkout integration (Tier 3); x402 integration (Tier 3 alt); Tier-3 per-category cap configuration; integrity-covenant CI gates (`decision_layer_no_pay_for_placement`, `decision_replay_byte_identical`, `decision_layer_console_firewall`); 90-day fairness drift detection; SLA dashboard; full plan-tier gating in §5.11; production load test | §52, §27.4.5, §44.6, §M.4 |
| **Sprint 4 (1 week)** | Public Beta GA | Public launch; Anthropic Claude Skills + Cline + Smithery + Vercel template + Stripe Agentic co-marketing; Decision Browser public availability for shareable decisions; AE ledger ratification; v7.2.0 stamp | n/a |

**Total elapsed: 12 weeks. Total engineering effort: ~10–14 FTE-months.**

### 9.2 FTE-Months by Discipline

| Discipline | FTE-months | Critical activities |
| :--- | :--- | :--- |
| Backend (Convex + Postgres + Edge) | 4.5 | Decision Engine pipeline, REST endpoints, MCP server, vault-JWT scope token issuance, replay endpoint, Match-Score feature extension, PolicyPack entity + state machine, AgentCaller entity + token issuance |
| Frontend / Buyer Console | 1.5 | "Agent Access" tab in Org Settings, "Procurement Policy" tab, "Agentic Transactions" history, Decision Browser, shared-decision public surface |
| ML / Applied ML | 1.5 | Match-Score `policy_pack_alignment_score` feature engineering, `agent_sourcera_decision_recommender_v1` agent prompt + skill authoring, fairness audit suite extension to Decision Layer surface |
| DevRel / Integration | 1.5 | Cline / Smithery / Anthropic Skills / Cursor extension; OSS template seeding; CLI; SDK published in 4 languages (TS / Python / Go / Rust) |
| Security / Compliance | 0.75 | Tier-3 procurement-kickback legal review, vault-JWT audit, integrity-covenant CI gate authoring, third-party audit framework |
| QA | 0.75 | Replay byte-identical CI, fairness-audit-suite generalization tests, plan-tier-gating tests, end-to-end Tier-1/2/3 acceptance tests |
| Product / PM | 1.5 | This brief, design-partner shepherding, the §10 validation plan execution, the AE ratification queue, the Linear blueprint |

### 9.3 Critical-Path Risks

- **Match-Score model retraining cycle (§27.4.5):** the new `policy_pack_alignment_score` feature requires either (a) a quarterly full refit (Q3-26) or (b) the cold-start fallback (Legacy Baseline). Until ~10K labeled `accept` events accumulate from Decision Layer (likely 6–9 months post-launch), ranking quality is ~legacy baseline + the new feature on top. Plan accordingly: don't oversell ranking accuracy in private alpha.
- **Vault-JWT auth complexity:** the §22.8.3 vault pattern is well-engineered for KB MCP; extending it to per-call agent-caller scope tokens with policy-pack binding is non-trivial. Plan 1.5 FTE-months for security on this alone.
- **Stripe Agentic Checkout integration:** Stripe Agentic is in beta as of Q1 2026; integration risk is non-zero. Mitigation: partner directly with the Stripe Agentic team for early-access support.
- **Third-party audit timeline:** the year-1 audit needs to be commissioned at sprint 0 to deliver by month 12 of public launch.

### 9.4 Private Alpha vs. Public Beta Gates

- **Private alpha (post-Sprint 1, ~week 4):** 5 design-partner Buyer Orgs; 3 agent-harness partners (one of Cursor / Cline / Claude Code); Tier-1 only; concierge support; manual override path
- **Public beta (post-Sprint 3, ~week 11):** open registration; Tier-1 + Tier-2 generally available; Tier-3 design-partner-only; SLA dashboard live; integrity-covenant CI gates active
- **GA (Sprint 4):** all three tiers available per plan-gating; v7.2.0 stamp; full distribution partnerships announced

---

## 10. Validation Plan & Quantitative Go/No-Go Thresholds

The pilot is sized to invalidate the thesis cheaply. 25+ customer interviews; 3 technical spikes; 8-week concierge MVP; pre-committed thresholds. **The kill condition is sharp because the strategic option value is high — false positives are catastrophic.**

### 10.1 Customer Discovery — 25 Interviews, Pre-Sprint-1

| Archetype | Target count | Signals to validate | Disqualifier |
| :--- | :--- | :--- | :--- |
| Buyer Org CTO/VPE at Series-B–C SaaS, 50–500 engs | 8 | Has a procurement policy that engineers ignore at code-time; willing to pay for cite-verified agent-time decisions; has a budget cap they'd encode in a policy pack | "We don't have a procurement policy for engineering tools" → kill |
| Buyer Org Head of Procurement at mid-market enterprise, 500–2,500 engs | 6 | Has formal procurement policy; engineering teams currently bypass it; would pay for an audit substrate showing how agentic decisions were made | "Our engineering teams will never let procurement gate their tools" → de-prioritize segment |
| Seller Org founder / CTO at DevTools vendor, $5M–$50M ARR | 5 | Willing to maintain a Sourcera KB if it gets them ranked above competitors on agent-callable surfaces; would NOT participate in pay-for-placement; comfortable with cite-verified evidence model | "We need to pay for placement to win in agent-callable surfaces" → kill (this is the integrity covenant red line — if sellers won't accept the model, the moat is hypothetical) |
| Agent harness owner (Anthropic / Cursor / Cline / Replit / Vercel) | 5 | Willing to integrate Sourcera as a featured skill; not building a competing native procurement skill in the next 12 months; comfortable with the take-rate split | "We're building this natively in 6 months" → likely kill (or pivot to integrate-with-them path) |
| Procurement-as-code / spend-management adjacent (Vendr, Tropic, Drata) | 1 | Validate that they're not on a 12-month roadmap to ship the same wedge; understand their seller-data substrate | "We're shipping this next quarter" → defer to a partnership conversation |

**Discovery quantitative thresholds (post-25 interviews):**
- **GO if all true:** ≥ 5 Buyer-Org CTOs commit to design-partner status with a stated annual commit ≥ $10K (4× over Buyer Free); ≥ 5 Sellers commit to maintaining KBs for Decision Layer eligibility without seeking placement payment; ≥ 2 agent harness partners commit to a featured skill or extension; no harness partner is < 6 months from shipping a competing native primitive
- **NO-GO if any true:** Sellers refuse the no-pay-for-placement covenant (n=2+); agent harnesses signal native primitives shipping in < 6 months (n=2+); Buyer CTOs show < 30% conversion intent

### 10.2 Technical Spikes (Pre-Sprint-1, 2 Weeks Parallel to Discovery)

| Spike | Goal | Pass threshold |
| :--- | :--- | :--- |
| MCP tool-use latency end-to-end | Measure round-trip latency from agent harness → Sourcera MCP server → KB retrieval → Match-Score compute → response | P95 < 800ms blended; P99 < 4s blended |
| Decision Engine determinism | Run `decision.recommend` 1,000 times against a fixed `(category, requirements, policy_pack_version, model_version)` corpus; assert byte-identical output | ≥ 99.5% byte-identical (allow ≤ 0.5% for stochastic ordering ties resolved deterministically) |
| Stripe Agentic Checkout / x402 prototype | Wire end-to-end Tier-3 transaction against a sandbox Stripe Agentic / x402 endpoint; measure settlement latency; validate idempotency | Stripe Agentic settlement P95 < 3s; x402 P95 < 1s; idempotency holds across retry |
| Org-context auth handshake | Implement vault-JWT scope-token issuance bound to `(buyer_org_id, agent_caller_id, policy_pack_id)`; rotate per session; expire ≤ 1h | All tokens validate on the MCP server within the issuance window; rotation does not break in-flight sessions |

### 10.3 Concierge MVP (8 Weeks; Overlaps Sprints 1–2)

A Sourcera-staffed Decision Layer behind a tool-call facade. The MCP server returns canned responses (or human-curated rankings for the first 100 decisions); every override is logged. Goal: validate that the rationale-token format is what agent harnesses actually want to consume, that the policy-pack abstraction is sufficient to capture real procurement policy, and that buyer Orgs trust the recommendations enough to set Tier-1 access default-on for their teams.

**Concierge MVP quantitative thresholds (week 8):**

- **GO to Sprint 3 / production hardening if all true:** ≥ 3 design partners have made ≥ 100 Decision Layer calls each; ≥ 80% of decisions are accepted (per the `decision.accepted` event); ≥ 70% of accepted decisions match the rank-1 candidate (override rate ≤ 30%); ≥ 5 design-partner buyer Orgs have authored at least one custom PolicyPack
- **NO-GO if any true:** override rate > 50%; design partners are systematically not creating PolicyPacks (suggests the policy abstraction is wrong); rationale-token format is being ignored by agent harnesses (suggests the format is too verbose / too sparse)

### 10.4 Public Beta Quantitative Thresholds (Week 11)

- **GO to GA if all true:** Decision Engine determinism CI gate green for 14 consecutive days; integrity-covenant CI gates all green; SLA targets (§4.8 of this doc) achieved for 7 consecutive days; ≥ 50 Buyer Orgs registered (across Free + paid); ≥ 5 paid Buyer Orgs converted from Free; ≥ 2 distribution partnerships shipped (Anthropic Claude Skills, Cursor, Cline, Smithery, Vercel — at least 2 of these)
- **NO-GO if any true:** any integrity-covenant CI gate broken in production; SLA missed > 30% of days; conversion rate from Free to paid < 5%; major distribution partner pulls out

### 10.5 Year-1 Quantitative Thresholds for Continuing Investment

- **CONTINUE if all true:** annualized Decision Layer revenue ≥ $5M (combination of buyer-side AI consumption + Tier-3 take-rate); 12-month buyer logo retention ≥ 90%; integrity audit (annual) finds zero violations of the no-pay-for-placement covenant; net new Decision Layer-seeded buyer accounts ≥ 30% of total new buyer Org signups
- **REASSESS if any true:** Decision Layer revenue < $2M annualized; integrity audit finds a violation; Anthropic / OpenAI ship a native procurement skill that captures > 50% of code-time agent decisions outside Sourcera

---

## 11. Six+ Failure Modes with Mitigations or Kill Conditions

### 11.1 Failure Mode A — Anthropic or OpenAI Ship a Native Registry-Plus-Recommendation Skill

**Specifically:** Anthropic ships a "Claude Procurement Skill" or "Claude Tools Marketplace" inside Claude Skills with native recommendation, in Q3 or Q4 2026, with first-party distribution to every Claude Code user.

**Why this is the most likely failure mode:** Anthropic has the engineering capacity, the distribution, the incentive (more partner-tool monetization), and arguably the moral high ground (curated, "safe" tool surface). They have the ear of every developer who matters.

**Mitigation:**
1. **Be the procurement skill *inside* their marketplace.** Don't compete with Anthropic; integrate. Sourcera ships as the featured Skill the moment the marketplace lights up. Anthropic gets a turn-key procurement integration; Sourcera gets distribution. (Cite: Sourcera already integrates Skills technically per §22.12.)
2. **Lean into the buyer-policy-pack moat.** Anthropic will not build an org-policy substrate at v1; Sourcera's policy pack is the differentiating wedge. Keep PolicyPack development at sprint priority above all else.
3. **Carry the integrity story.** Anthropic's incentive structure is partner-sponsorship-friendly; Sourcera's covenant is structurally pay-for-placement-free. Make this the public narrative.

**Kill condition:** Anthropic ships a native skill with policy-aware ranking AND first-party Acme-Corp-policy ingestion AND no-pay-for-placement covenant before Sourcera's GA. Probability: low (Anthropic doesn't currently have the buyer-policy substrate; building it is a 12-month project), but non-zero. If it materializes, Sourcera reorients to the policy-overlay layer above the Anthropic skill — a smaller business but still defensible.

### 11.2 Failure Mode B — Sellers Refuse to Maintain Sourcera KBs Because They Distrust Ranking Integrity

**Specifically:** sellers see their competitors getting ranked above them and assume placement payment is in play; they refuse to invest in Sourcera KB; the cite-verified evidence wedge collapses for lack of evidence.

**Why this is plausible:** sellers in adjacent categories (DevTools) have been burned by every prior "marketplace" that was actually a placement auction (Heroku Add-Ons; AWS Marketplace; GitHub Marketplace). The default seller stance toward a new ranking layer is suspicious. Without seller buy-in, the KB substrate is thin and the rationale-token wedge collapses.

**Mitigation:**
1. **Public scoring rubric** (§6.1) — every seller can inspect every Match-Score feature.
2. **Annual third-party integrity audit** (§6.1) — published findings on the no-pay-for-placement covenant.
3. **Verified Listing tier** (§5.3) — sellers pay for verification (a quality signal), not placement; the price is identical to today's Marketplace and is bundled with KB document storage and Capability Declaration ceiling, not with ranking position.
4. **Onboard 5–10 anchor sellers as design partners** with explicit no-payment-for-placement contracts; publish their participation; use their endorsements in seller-side marketing.

**Kill condition:** in the §10.1 customer-discovery interview cohort, ≥ 2 of 5 Sellers refuse the no-pay-for-placement covenant or refuse to maintain a KB for Decision Layer eligibility. If this materializes the substrate is hypothetical.

### 11.3 Failure Mode C — Agents Ignore Sourcera and Stick With Training Priors

**Specifically:** agents (Claude Code, Cursor, Devin) call Sourcera as a tool, get a ranked top-3, and ignore the ranking because their training prior says "use Postgres" — they pick the answer they would have picked anyway, and Sourcera is dead weight in the tool stack.

**Why this is plausible:** agent training data heavily over-represents the most-documented vendors (Stripe, Supabase, Vercel, Auth0) because they have the most public docs. The training prior is sticky; the cite-verified evidence Sourcera surfaces is one signal among many.

**Mitigation:**
1. **Optimize for the override case.** If the agent's training prior is "use Stripe" and Sourcera says "use Adyen" because the buyer's policy pack has an existing Adyen contract, the rationale token must be persuasive enough to override the prior. This is an authoring problem (prompt engineering on `agent_sourcera_decision_recommender_v1`), solvable.
2. **Surface accept-rate telemetry.** Decision Engine telemetry (§2.11 webhooks) lets Sourcera measure override rate; if it's > 50%, the rationale token is too weak.
3. **Distribution-partner co-marketing.** Anthropic / Cursor / Cline can position the Sourcera tool as "the right tool to use *first*" — the harness primer instructs the agent to consult Sourcera before defaulting.
4. **Replay-and-justify auditability.** Even if the agent overrides 30% of the time, the audit substrate makes it possible for Ops to review why; the value proposition for Buyer Orgs is the audit, not just the ranking.

**Kill condition:** in the concierge MVP override-rate telemetry, override rate > 50% across 100+ decisions per design partner. Suggests the rationale token is not persuasive and the buyer's policy is not being honored.

### 11.4 Failure Mode D — Smithery / GitHub / Vercel Wins the MCP Registry Layer First

**Specifically:** Smithery becomes the *de facto* MCP registry for code-time agent harnesses, ships verified-tool ranking with vendor signals, and Sourcera is relegated to a long-tail listing.

**Why this is plausible:** Smithery is well-funded, focused, and has 6–12 months of head start.

**Mitigation:**
1. **Don't compete with the registry; be the recommender on top.** Smithery says "these MCP servers exist"; Sourcera says "for your use case + policy, choose this one." Different layers.
2. **Be in Smithery's registry too.** Sourcera's MCP server is published on Smithery's marketplace and Cline's marketplace and Anthropic's Skills, simultaneously, on day one of beta.
3. **Build the policy substrate Smithery doesn't have.** Smithery is unlikely to build a buyer-org policy pack (their substrate is tool metadata, not buyer policy).

**Kill condition:** Smithery ships policy-aware ranking with buyer-policy-substrate equivalence within 6 months. Probability: low. If it materializes, Sourcera competes on the buyer-org-evaluation-data-substrate moat (Sourcera has the eval data; Smithery does not); if Smithery acquires that, Sourcera reorients to the audit-substrate-only layer.

### 11.5 Failure Mode E — Regulators Classify Decision Layer Recommendations as Kickbacks Under Procurement Law

**Specifically:** a federal-funded buyer (state university, government contractor, healthcare provider) uses the Decision Layer; the Tier-3 take-rate split with the seller is challenged as a kickback under §952 of the federal Anti-Kickback Statute or state-equivalent procurement law; Sourcera is forced to pull Tier 3 from the federal-buyer segment.

**Why this is plausible:** procurement-kickback law is jurisdiction-specific and untested for agentic-commerce contexts; legal risk is non-zero.

**Mitigation:**
1. **Federal-and-state-funded-buyer disclaimer** (§6.9) — the policy pack carries `is_federal_or_state_funded`; when set, Tier 3 is disallowed system-wide.
2. **Plain-English disclosure of take-rate** in the rationale token's `pricing_snapshot.first_year_cost_usd_estimate`.
3. **Annual procurement-law audit** by an independent firm (§6.1).
4. **Tier 1 unchanged.** Even if Tier 3 is disallowed for federal buyers, Tier 1 (recommendation only, no transaction) is unaffected.

**Kill condition:** an annual procurement-law audit finds that the Tier-3 take-rate structure is non-compliant with federal kickback law for any buyer segment. Probability: medium-low. Mitigation: the disclaimer + the auditor + the legal review pre-launch should catch this.

### 11.6 Failure Mode F — Determinism Requirement Is Incompatible with Monetized Ranking Optimization

**Specifically:** Sourcera needs the ranking model to evolve (model retraining; new features; cold-start fallbacks) but the determinism contract requires `(decision_id, model_version_id)` → byte-identical replay. The model retraining cycle creates a tension: the new model is better, but the old replays are stale, and the audit substrate must continue working.

**Why this is plausible:** the §27.4.5 model-versioning contract handles this for Marketplace, but the Decision Layer's audit-receipt surface is more legally consequential. A retired model version must remain queryable for replay, but the resource cost is non-trivial.

**Mitigation:**
1. **Snapshot-based replay** — the `Decision.rankings` payload is the source of truth for replay, not the model. The model is invoked once at decision time; replay reads from the persisted snapshot. This is exactly the §27.4.7 cache + snapshot pattern.
2. **Version-pinning honored for audit** — Enterprise audit receipts pin the `(decision_id, model_version_id, feature_registry_version, policy_pack_version, decision_engine_version)` tuple; the persisted snapshot is the authoritative record. Model retirement (§27.4.8) does not break audit receipts; it deprecates new computation against retired versions.
3. **Per-customer pinning** — Enterprise customers can pin a model version for compliance reasons; new decisions under the pin use the pinned version.
4. **Cold-storage of model versions** — every model version is retained for 7 years (§27.4.8); a 7-year-old replay is queryable.

**Kill condition:** none. This is an engineering challenge, not an existential question. The pattern is well-established in §27.4. Plan capacity accordingly (cold-storage cost is the only economic variable).

### 11.7 Failure Mode G — Anthropic API or Stripe Agentic Outage Cascades into Decision Layer Downtime

**Specifically:** an Anthropic API outage prevents `agent_sourcera_decision_recommender_v1` from producing rationale tokens; an outage prevents Tier-3 transactions; Decision Layer SLA breaks.

**Mitigation:** §22.10 Managed Agent outage protocol (already in place); fallback to a degraded-rationale mode that returns Match Score + KB excerpts without the agent rationale; Stripe Agentic outage triggers the same behavior as a Stripe outage today (manual settlement queue).

### 11.8 Failure Mode H — A Single Distribution Partner Pulls Out

**Specifically:** Cursor adds a competing native picker and asks Sourcera to remove its extension; or Vercel deprecates the `sourcera.toml` template integration.

**Mitigation:** be in 8+ harnesses simultaneously by GA (per §8.1); never rely on a single channel for > 40% of free-tier traffic; keep the SDK / MCP server cross-platform.

---

## 12. Open Questions That Block a Final Commit

These are the questions that, as of authoring, the corpus does not answer; they require either (a) a customer-discovery answer, (b) a partner conversation, or (c) a founder + GTM decision. Numbered for traceability into the AE ledger and the Phase prompts.

1. **Org-context auth specific implementation.** Sourcera-issued vault-JWT scope token (proposed in this doc, AE-MPP-02) vs. OAuth-on-behalf-of (more standard but more complex) vs. dynamic client registration (most flexible but requires partner-side cooperation). The vault-JWT pattern is preferred per §22.8.3 reuse but partner-harness adoption may force OAuth-OBO. **Validation question:** in the §10.1 agent-harness-owner interviews, ask "what auth pattern do you support?" If 3+ require OAuth-OBO, switch.

2. **Tier-3 payment protocol primary partner.** Stripe Agentic (best engineering reuse; existing Stripe relationship) vs. Coinbase x402 (better OSS / consumption-tools wedge; native HTTP-402; faster to integrate) vs. supporting both at v1. **Validation question:** in customer-discovery interviews, ask "what payment rail do you use today for vendor purchases?" Stripe will dominate enterprise; x402 may dominate OSS / individual developer. Recommend supporting both; finalize order at week 3 based on partner interest.

3. **Determinism guarantee SLO.** ≥ 99.5% byte-identical (proposed) vs. 100% (stricter; harder to achieve given stochastic ordering ties) vs. ≥ 99.9% (compromise). **Validation question:** does any design partner require 100%? If yes, build the deterministic-tiebreak path (UUID-ordered as the deterministic last-resort sort key); if no, 99.5% is sufficient.

4. **Free tier limit.** 50 decisions/month (proposed) vs. 25 (more conservative; protects Sourcera margin) vs. 100 (more generous; better wedge). **Validation question:** in the §10.1 interviews, ask "how many decision-layer calls would your team make in a month at peak?" If < 100/team is typical, 50 is sufficient.

5. **OSS template policy pack format.** TOML (proposed; closest to Cargo / Hatch / Pyproject conventions) vs. JSON (more universal) vs. YAML (most-readable; least standard). **Validation question:** in OSS template maintainer conversations, what format do they prefer? Recommend TOML; fall back to YAML if maintainers push back.

6. **Marketplace placement model integration.** Confirm with §27.4 owners: are existing PromotedListings and FeaturedPlacements explicitly excluded from the Decision Layer (proposed in §5.3 + AE-MPP-19), or do we surface them with a mandatory "boosted" badge? **Recommend exclusion.** A boosted badge in a machine-facing surface is unprovable bias.

7. **Anthropic Skills integration: native or plugin?** A native Claude Skill (deeper integration; requires Anthropic-side cooperation) vs. an MCP server in the registry (universal; less differentiated). **Validation question:** in the Anthropic-partnership conversation, what's their roadmap and what's their preferred integration pattern? If they're shipping a procurement skill themselves, position as "the recommendation skill they ship by default."

8. **International data residency for Decision Layer telemetry.** EU residency at v1 (more cost; better compliance posture for European buyers) vs. US-only at v1 with EU at GA (faster to ship; risks losing EU design partners). **Recommend US-only at v1; EU at Sprint 3.** The §27.4.5 residency-scoped model-version pattern handles this.

9. **Buyer-policy-pack ingestion: opus-tier $5/parse vs. structured form authoring.** Both proposed (§2.7 `policy_pack.parse` + §2.12 entity field tables). **Validation question:** in CTO interviews, do they prefer to upload a doc and have Sourcera parse it (high-friction-tolerant, low-fidelity-tolerant) or fill in a structured form (high-fidelity-tolerant, lower-friction)? If form, deprioritize `policy_pack.parse`.

10. **Confidence threshold for rank-1 returns.** Proposed: a `qualitative_label_floor` per §27.4.6 (cohort-thin → `insufficient_signal`) is generalized to the Decision Layer. Specifically: if a Marketplace Category has < 5 verified-or-above sellers, the Decision Layer returns `insufficient_signal` instead of a top-K. **Validation question:** in concierge-MVP telemetry, what fraction of categories trigger this? If > 30%, the Decision Layer is too narrow and we need to expand category coverage.

11. **Override-reason capture mechanics.** Proposed `decision_override_reason_code` enum has 6 values (§4.11). **Validation question:** are these the 6 most common reasons for override? Concierge MVP captures override reasons free-form; tighten the enum at GA based on what we see.

12. **Tier-3 take-rate sensitivity.** Proposed 1.5% capped at $50, with 0.5% rebate to seller. **Validation question:** in the seller-discovery interviews, do sellers accept 1.0% net take? In the buyer-discovery interviews, does 1.5% feel like a tax? Run sensitivity analysis: what's the elasticity if we move to 1.0% / 2.0%? Recommend committing only at the GA boundary.

13. **First-year-cost estimation methodology.** The `pricing_snapshot.first_year_cost_usd_estimate` is consequential — it drives the budget-cap gate. **Validation question:** how is this computed for sellers without published pricing? Concierge MVP uses ghost-bid-inferred + third-party-observed signals; production needs a deterministic, auditable methodology. AE-MPP-22 — flag for follow-on authoring.

14. **Decision sharing semantics — public Decision Browser.** Proposed `is_publicly_shareable` flag with default false (§2.13). **Validation question:** in customer-discovery interviews, do buyer Orgs want this surface? Risk of leaking competitive intelligence (Acme Corp shares "we chose Supabase over Neon for these reasons" publicly) is real. Default false is conservative; could be `is_org_shareable` (org-internal only) with `is_publicly_shareable` opt-in.

15. **Buyer-Solo Decision Layer access.** Proposed: included in the engine-absorbed envelope with throttling per §44.6. **Validation question:** does Buyer Solo, at $49/mo, generate enough volume to warrant Decision Layer in the envelope, or should it be Tier-1-only-with-no-overage? Recommend in-envelope-with-throttling per the §44.6 doctrine; revisit at year-1 economic review.

16. **Cross-pollination with the existing §10 Sourcera Method engine.** Could a Buyer use the Decision Layer to generate a Selection-Report-equivalent for their human team? E.g., a `decision.bundle_for_human_eval` capability that takes the rationale tokens from a Tier-1 call and renders a §13 Selection Report draft. **Speculative; not in v1 scope; flag for v7.3.0+ research.**

17. **AgentCaller scoping by repo / project.** Proposed: per-Org AgentCaller. Should AgentCallers be scopeable to a repo / project / monorepo path so a CI-pipeline-only token can't make decisions in the staging-only project? **Reasonable extension; defer to GA scope.**

18. **Tier-3 reversibility window — what if the seller has already provisioned?** A Tier-3 transaction completes; the buyer runs the recommendation; the seller has provisioned a database; the buyer's `org_owner` requests a refund 5 days later. The payment rail's chargeback mechanism handles the money; the seller has done real provisioning work. **Recommend:** Sourcera surfaces the chargeback path; the seller's recourse is the payment rail's standard dispute procedure; Sourcera does NOT adjudicate. Document this clearly in Tier-3 onboarding terms.

19. **Free tier abuse — what stops a developer from creating 100 Buyer Free Orgs to get 5,000 free decisions?** **Mitigation:** existing §6 anti-abuse mechanics (WorkOS-based domain verification, IP-rate-limit, MFA on Free) handle this. Decision Layer telemetry (§29 PostHog) flags unusual creation patterns. **Document but don't engineer specifically.**

20. **The $0.50/decision price point — is it too high or too low?** Comparable: Stripe's `pricing_snapshot` at ~$0.30 per pricing-page lookup; Anthropic's Sonnet token cost per long-context call is ~$0.10–0.30 (and Sourcera's `cost_base × 10` formula yields ~$0.30 + KB retrieval cost, so $0.50 lands close to the floor). **Recommend $0.50 at v1; let nightly cost-base recalc adjust if margin floor slips.**

---

## Closing Note

This brief is opinionated and complete. Open questions in §12 are the ones the corpus and partner conversations must answer; everything else is buildable as authored. On greenlight, the next-step deliverables are: (a) the `_integration/RECONCILIATION.md` block authoring the Decision Layer integration; (b) the Phase 14.21 / 14.22 / 14.23 phase prompts (Sprint 1 / Sprint 2 / Sprint 3 respectively); (c) the `Linear_Execution_Blueprint.md` v2.1 program addition; (d) the AE ledger entries (AE-MPP-01 through AE-MPP-22); (e) the recruitment plan for the 25 customer-discovery interviews; (f) the partnership-conversation roster (Anthropic, Cursor, Cline, Smithery, Vercel, Stripe). Sprint 0 budget: 1 week, founder + 1 PM + 1 staff engineer + 1 senior backend. Time to first private-alpha decision: 12 weeks from Sprint 1 kickoff.
