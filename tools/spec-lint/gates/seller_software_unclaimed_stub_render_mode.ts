import { isEntrypoint, runGateCli } from "../lib/gate.js";
import {
  buildSellerPublicPagesGate,
  sellerSoftwareUnclaimedStubRenderModeFindings,
} from "./seller_public_pages_gate_helpers.js";

export const gate = buildSellerPublicPagesGate(
  "seller_software_unclaimed_stub_render_mode",
  "spec_tree_lint",
  sellerSoftwareUnclaimedStubRenderModeFindings,
);

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
