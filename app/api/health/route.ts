import { createHealthPayload } from "@/lib/deployment-health";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const payload = createHealthPayload(process.env);

  logger.info(
    {
      event: "deployment_health_check_result",
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
}
