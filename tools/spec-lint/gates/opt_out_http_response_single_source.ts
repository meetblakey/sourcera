import { isEntrypoint, runGateCli } from "../lib/gate.js";
import {
  buildSellerPublicPagesGate,
  optOutHttpResponseSingleSourceFindings,
} from "./seller_public_pages_gate_helpers.js";

export const gate = buildSellerPublicPagesGate(
  "opt_out_http_response_single_source",
  "spec_tree_lint",
  optOutHttpResponseSingleSourceFindings,
);

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
