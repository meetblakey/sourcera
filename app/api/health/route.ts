import {
  createHealthFailurePayload,
  createHealthPayload,
} from "@/lib/deployment-health";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    const payload = createHealthPayload(
      process.env,
      new Date(),
      "marketplace",
    );

    logger.info(
      {
        assertion: "domain-health",
        event: "domain_deployment_health_result",
        result: "passed",
        ...payload,
      },
      "deployment health check",
    );

    return Response.json(payload, {
      headers: {
        "cache-control": "no-store",
      },
      status: 200,
    });
  } catch (error) {
    logger.error(
      createHealthFailurePayload(process.env, "marketplace"),
      "deployment health check failed",
    );
    throw error;
  }
}
