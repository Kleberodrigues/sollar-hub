/**
 * n8n Participants API
 *
 * Endpoints for n8n to manage assessment participants:
 * - GET: Fetch pending participants for email dispatch
 * - PATCH: Update participant status after email is sent
 */

import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifySignature } from "@/lib/events";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// ============================================
// GET - Fetch pending participants
// ============================================

/**
 * Get pending participants for email dispatch
 *
 * Query params:
 * - assessment_id: Filter by specific assessment
 * - organization_id: Filter by organization
 * - status: Filter by status (default: pending)
 * - limit: Max results (default: 100)
 */
export async function GET(request: NextRequest) {
  try {
    // Verify API key or signature
    const apiKey = request.headers.get("x-api-key");
    const signature = request.headers.get("x-webhook-signature");
    const expectedApiKey = process.env.N8N_API_KEY;

    const isProduction = process.env.NODE_ENV === "production" || process.env.VERCEL_ENV === "production";

    // In production, require authentication
    if (isProduction) {
      if (!apiKey && !signature) {
        return NextResponse.json(
          { error: "Authentication required" },
          { status: 401 }
        );
      }

      if (apiKey && apiKey !== expectedApiKey) {
        return NextResponse.json(
          { error: "Invalid API key" },
          { status: 401 }
        );
      }
    }

    const { searchParams } = new URL(request.url);
    const assessmentId = searchParams.get("assessment_id");
    const organizationId = searchParams.get("organization_id");
    const status = searchParams.get("status") || "pending";
    const limit = parseInt(searchParams.get("limit") || "100", 10);

    const supabase = createAdminClient();

    // Build query
    let query = supabase
      .from("assessment_participants")
      .select(`
        id,
        assessment_id,
        organization_id,
        email,
        name,
        department,
        role,
        status,
        sent_at,
        responded_at,
        created_at
      `)
      .eq("status", status)
      .order("created_at", { ascending: true })
      .limit(limit);

    if (assessmentId) {
      query = query.eq("assessment_id", assessmentId);
    }

    if (organizationId) {
      query = query.eq("organization_id", organizationId);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: participants, error } = await (query as any);

    if (error) {
      console.error("[n8n Participants API] Query error:", error);
      return NextResponse.json(
        { error: "Failed to fetch participants" },
        { status: 500 }
      );
    }

    // If we have participants, also fetch assessment info
    let assessmentInfo = null;
    if (participants && participants.length > 0 && assessmentId) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: assessment } = await (supabase
        .from("assessments")
        .select("id, title, status")
        .eq("id", assessmentId)
        .single() as any);

      if (assessment) {
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://app.sollarsaude.com.br";
        assessmentInfo = {
          id: assessment.id,
          title: assessment.title,
          status: assessment.status,
          public_url: `${baseUrl}/assessments/${assessment.id}/respond`,
        };
      }
    }

    return NextResponse.json({
      success: true,
      count: participants?.length || 0,
      assessment: assessmentInfo,
      participants: participants || [],
    });

  } catch (error) {
    console.error("[n8n Participants API] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// ============================================
// PATCH - Update participant status
// ============================================

/**
 * Update participant status after email action
 *
 * Body:
 * - participant_id: ID of participant to update
 * - status: New status (sent, responded, bounced, opted_out)
 * - bulk: Array of { participant_id, status } for bulk updates
 */
export async function PATCH(request: NextRequest) {
  try {
    // Verify authentication
    const apiKey = request.headers.get("x-api-key");
    const signature = request.headers.get("x-webhook-signature");
    const expectedApiKey = process.env.N8N_API_KEY;

    const isProduction = process.env.NODE_ENV === "production" || process.env.VERCEL_ENV === "production";

    if (isProduction) {
      if (!apiKey && !signature) {
        return NextResponse.json(
          { error: "Authentication required" },
          { status: 401 }
        );
      }

      if (apiKey && apiKey !== expectedApiKey) {
        return NextResponse.json(
          { error: "Invalid API key" },
          { status: 401 }
        );
      }

      // Verify signature if provided
      if (signature) {
        const body = await request.clone().text();
        if (!verifySignature(body, signature)) {
          return NextResponse.json(
            { error: "Invalid signature" },
            { status: 401 }
          );
        }
      }
    }

    const body = await request.json();
    const supabase = createAdminClient();

    // Handle bulk updates
    if (body.bulk && Array.isArray(body.bulk)) {
      const results = [];

      for (const item of body.bulk) {
        const updateData: Record<string, unknown> = {
          status: item.status,
        };

        if (item.status === "sent") {
          updateData.sent_at = new Date().toISOString();
        } else if (item.status === "responded") {
          updateData.responded_at = new Date().toISOString();
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase as any)
          .from("assessment_participants")
          .update(updateData)
          .eq("id", item.participant_id);

        results.push({
          participant_id: item.participant_id,
          success: !error,
          error: error?.message,
        });
      }

      return NextResponse.json({
        success: true,
        updated: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length,
        results,
      });
    }

    // Handle single update
    const { participant_id, status } = body;

    if (!participant_id || !status) {
      return NextResponse.json(
        { error: "participant_id and status are required" },
        { status: 400 }
      );
    }

    const validStatuses = ["pending", "sent", "responded", "bounced", "opted_out"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${validStatuses.join(", ")}` },
        { status: 400 }
      );
    }

    const updateData: Record<string, unknown> = { status };

    if (status === "sent") {
      updateData.sent_at = new Date().toISOString();
    } else if (status === "responded") {
      updateData.responded_at = new Date().toISOString();
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from("assessment_participants")
      .update(updateData)
      .eq("id", participant_id)
      .select()
      .single();

    if (error) {
      console.error("[n8n Participants API] Update error:", error);
      return NextResponse.json(
        { error: "Failed to update participant" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      participant: data,
    });

  } catch (error) {
    console.error("[n8n Participants API] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// ============================================
// POST - Trigger email send for participants
// ============================================

/**
 * Request email dispatch for specific participants
 * This can be called manually to re-send emails
 *
 * Body:
 * - assessment_id: Assessment ID
 * - participant_ids: Array of participant IDs (optional, sends to all pending if not provided)
 */
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const apiKey = request.headers.get("x-api-key");
    const expectedApiKey = process.env.N8N_API_KEY;

    const isProduction = process.env.NODE_ENV === "production" || process.env.VERCEL_ENV === "production";

    if (isProduction && apiKey !== expectedApiKey) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { assessment_id, participant_ids } = body;

    if (!assessment_id) {
      return NextResponse.json(
        { error: "assessment_id is required" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Build query for participants
    let query = supabase
      .from("assessment_participants")
      .select("*")
      .eq("assessment_id", assessment_id);

    if (participant_ids && participant_ids.length > 0) {
      query = query.in("id", participant_ids);
    } else {
      query = query.eq("status", "pending");
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: participants, error } = await (query as any);

    if (error) {
      return NextResponse.json(
        { error: "Failed to fetch participants" },
        { status: 500 }
      );
    }

    if (!participants || participants.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No participants to send emails to",
        count: 0,
      });
    }

    // Get assessment info
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: assessment } = await (supabase
      .from("assessments")
      .select("id, title, organization_id")
      .eq("id", assessment_id)
      .single() as any);

    if (!assessment) {
      return NextResponse.json(
        { error: "Assessment not found" },
        { status: 404 }
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://app.sollarsaude.com.br";

    // Dispatch event for n8n
    const { dispatchEvent } = await import("@/lib/events/dispatcher");

    await dispatchEvent({
      organizationId: assessment.organization_id,
      eventType: "participants.email_requested",
      data: {
        assessment_id: assessment.id,
        assessment_title: assessment.title,
        organization_id: assessment.organization_id,
        participant_ids: participants.map((p: { id: string }) => p.id),
        public_url: `${baseUrl}/assessments/${assessment.id}/respond`,
        requested_by: {
          id: "system",
          name: "API Request",
          email: "api@sollarsaude.com.br",
        },
      },
      metadata: {
        source: "n8n_api",
      },
    });

    return NextResponse.json({
      success: true,
      message: `Email dispatch requested for ${participants.length} participants`,
      count: participants.length,
      participants: participants.map((p: { id: string; email: string; name: string }) => ({
        id: p.id,
        email: p.email,
        name: p.name,
      })),
    });

  } catch (error) {
    console.error("[n8n Participants API] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
