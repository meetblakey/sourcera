import { createHealthPayload } from "@sourcera/domain";
import { NextResponse } from "next/server";

import { logger } from "../../../lib/logger";

export const dynamic = "force-dynamic";

export async function GET() {
  const payload = createHealthPayload(process.env, new Date(), "buyer");

  logger.info(
    {
      assertion: "domain-health",
      event: "domain_deployment_health_result",
      result: "passed",
      ...payload,
    },
    "deployment health check",
  );

  return NextResponse.json(payload, {
    headers: { "Cache-Control": "no-store" },
  });
}
