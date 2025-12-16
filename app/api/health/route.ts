/**
 * Health Check Endpoint
 * Used by monitoring services and load balancers
 */

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface HealthStatus {
  status: "healthy" | "degraded" | "unhealthy";
  timestamp: string;
  version: string;
  services: {
    database: "up" | "down" | "unknown";
    stripe: "configured" | "not_configured";
    n8n: "configured" | "not_configured";
  };
  uptime: number;
}

const startTime = Date.now();

export async function GET() {
  const health: HealthStatus = {
    status: "healthy",
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || "1.0.0",
    services: {
      database: "unknown",
      stripe: process.env.STRIPE_SECRET_KEY ? "configured" : "not_configured",
      n8n: process.env.N8N_WEBHOOK_URL ? "configured" : "not_configured",
    },
    uptime: Math.floor((Date.now() - startTime) / 1000),
  };

  // Check database connection
  try {
    const supabase = await createClient();
    const { error } = await supabase.from("organizations").select("id").limit(1);

    if (error) {
      health.services.database = "down";
      health.status = "degraded";
    } else {
      health.services.database = "up";
    }
  } catch {
    health.services.database = "down";
    health.status = "unhealthy";
  }

  // Determine overall status
  if (health.services.database === "down") {
    health.status = "unhealthy";
  }

  const statusCode = health.status === "healthy" ? 200 :
                     health.status === "degraded" ? 200 : 503;

  return NextResponse.json(health, { status: statusCode });
}
