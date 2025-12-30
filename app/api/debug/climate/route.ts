import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const CLIMA_QUESTIONNAIRE_ID = "b2222222-2222-2222-2222-222222222222";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const secret = url.searchParams.get("secret");
  const orgName = url.searchParams.get("org");

  if (secret !== "psicomapa-seed-2025") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // Get all organizations
  const { data: orgs } = await supabase
    .from("organizations")
    .select("id, name");

  // Find specific org if requested
  let targetOrg = null;
  if (orgName) {
    targetOrg = orgs?.find(o => o.name.toLowerCase().includes(orgName.toLowerCase()));
  }

  // Get all climate assessments
  const { data: allAssessments } = await supabase
    .from("assessments")
    .select("id, title, organization_id, questionnaire_id, start_date")
    .eq("questionnaire_id", CLIMA_QUESTIONNAIRE_ID);

  // Get responses count per assessment
  const assessmentDetails = [];
  for (const a of allAssessments || []) {
    const { count } = await supabase
      .from("responses")
      .select("*", { count: "exact", head: true })
      .eq("assessment_id", a.id);

    const orgInfo = orgs?.find(o => o.id === a.organization_id);
    assessmentDetails.push({
      title: a.title,
      organization: orgInfo?.name || "Unknown",
      organizationId: a.organization_id,
      responses: count || 0,
      startDate: a.start_date
    });
  }

  // Group by organization
  const byOrg: Record<string, { assessments: number; responses: number }> = {};
  for (const a of assessmentDetails) {
    if (!byOrg[a.organization]) {
      byOrg[a.organization] = { assessments: 0, responses: 0 };
    }
    byOrg[a.organization].assessments++;
    byOrg[a.organization].responses += a.responses;
  }

  return NextResponse.json({
    totalOrganizations: orgs?.length || 0,
    totalAssessments: allAssessments?.length || 0,
    totalResponses: assessmentDetails.reduce((a, b) => a + b.responses, 0),
    targetOrg: targetOrg ? {
      id: targetOrg.id,
      name: targetOrg.name,
      assessments: byOrg[targetOrg.name]?.assessments || 0,
      responses: byOrg[targetOrg.name]?.responses || 0
    } : null,
    byOrganization: byOrg,
    recentAssessments: assessmentDetails.slice(0, 10)
  });
}
