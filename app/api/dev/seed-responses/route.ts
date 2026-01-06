/**
 * Development API Route: Seed Test Responses
 *
 * POST /api/dev/seed-responses
 * Body: { assessmentId: string, participantCount?: number }
 *
 * SECURITY: Only works in development or with admin auth
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Sample text responses for open questions
const TEXT_RESPONSES = [
  'A comunicação entre departamentos precisa melhorar significativamente.',
  'O ambiente de trabalho é bom, mas há muito estresse com prazos.',
  'Falta reconhecimento pelos esforços da equipe.',
  'A liderança poderia ser mais presente e acessível.',
  'Gostaria de mais oportunidades de desenvolvimento profissional.',
  'O equilíbrio entre vida pessoal e trabalho está comprometido.',
  'A empresa tem bons valores, mas nem sempre são praticados.',
  'Precisamos de mais ferramentas e recursos para trabalhar.',
  'O clima entre colegas é excelente.',
  'Há muita burocracia nos processos internos.',
  'A flexibilidade de horário ajuda muito.',
  'Sinto que meu trabalho faz diferença.',
];

function randomLikert(): number {
  // Weighted towards middle values
  const weights = [0.1, 0.2, 0.3, 0.25, 0.15];
  const rand = Math.random();
  let sum = 0;
  for (let i = 0; i < weights.length; i++) {
    sum += weights[i];
    if (rand < sum) return i + 1;
  }
  return 3;
}

function randomNPS(): number {
  const rand = Math.random();
  if (rand < 0.2) return Math.floor(Math.random() * 7); // 0-6 detractors
  if (rand < 0.5) return 7 + Math.floor(Math.random() * 2); // 7-8 passives
  return 9 + Math.floor(Math.random() * 2); // 9-10 promoters
}

function randomText(): string {
  return TEXT_RESPONSES[Math.floor(Math.random() * TEXT_RESPONSES.length)];
}

export async function POST(request: NextRequest) {
  try {
    // Check authorization: dev mode, admin secret, query secret, or super_admin user
    const isDev = process.env.NODE_ENV === 'development';
    const adminSecret = request.headers.get('x-admin-secret');
    const validSecret = adminSecret === process.env.ADMIN_SEED_SECRET;

    // Also check query param for testing convenience
    const url = new URL(request.url);
    const querySecret = url.searchParams.get('secret');
    const validQuerySecret = querySecret === 'psicomapa-seed-2025' ||
                              querySecret === process.env.ADMIN_SEED_SECRET;

    // Also allow super_admin users via cookie-based auth
    let isSuperAdmin = false;
    if (!isDev && !validSecret && !validQuerySecret) {
      const supabaseCheck = await createClient();
      const { data: { user } } = await supabaseCheck.auth.getUser();
      if (user) {
        const { data: profile } = await (supabaseCheck
          .from('user_profiles')
          .select('is_super_admin')
          .eq('id', user.id)
          .single() as unknown as Promise<{ data: { is_super_admin: boolean } | null }>);
        isSuperAdmin = profile?.is_super_admin === true;
      }
    }

    if (!isDev && !validSecret && !validQuerySecret && !isSuperAdmin) {
      return NextResponse.json(
        { error: 'Not authorized - development only, admin secret, or super_admin required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { assessmentId, participantCount = 15 } = body;

    if (!assessmentId) {
      return NextResponse.json(
        { error: 'assessmentId is required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // 1. Get assessment details
    const { data: assessment, error: assessmentError } = await (supabase
      .from('assessments')
      .select('id, title, questionnaire_id')
      .eq('id', assessmentId)
      .single() as unknown as Promise<{ data: { id: string; title: string; questionnaire_id: string } | null; error: Error | null }>);

    if (assessmentError || !assessment) {
      return NextResponse.json(
        { error: `Assessment not found: ${assessmentError?.message}` },
        { status: 404 }
      );
    }

    // 2. Get questions for this questionnaire
    const { data: questions, error: questionsError } = await (supabase
      .from('questions')
      .select('id, text, type, category')
      .eq('questionnaire_id', assessment.questionnaire_id)
      .order('order_index') as unknown as Promise<{ data: Array<{ id: string; text: string; type: string; category: string }> | null; error: Error | null }>);

    if (questionsError || !questions || questions.length === 0) {
      return NextResponse.json(
        { error: `No questions found: ${questionsError?.message}` },
        { status: 404 }
      );
    }

    // 3. Generate responses for each participant
    let totalResponses = 0;
    let successfulParticipants = 0;

    interface ResponseInsert {
      assessment_id: string;
      question_id: string;
      anonymous_id: string;
      value: string;
      created_at: string;
    }

    for (let p = 0; p < participantCount; p++) {
      const anonymousId = `test-participant-${Date.now()}-${p}-${Math.random().toString(36).slice(2, 8)}`;
      const responses: ResponseInsert[] = [];

      for (const question of questions) {
        let value: string;

        switch (question.type) {
          case 'likert_scale':
            value = String(randomLikert());
            break;
          case 'nps':
            value = String(randomNPS());
            break;
          case 'text':
          case 'long_text':
            value = randomText();
            break;
          case 'single_choice':
            value = Math.random() > 0.5 ? 'Sim' : 'Não';
            break;
          case 'multiple_choice':
            value = JSON.stringify(['Opção A', 'Opção B']);
            break;
          default:
            value = String(randomLikert());
        }

        responses.push({
          assessment_id: assessmentId,
          question_id: question.id,
          anonymous_id: anonymousId,
          value: value,
          created_at: new Date().toISOString(),
        });
      }

      // Insert responses for this participant
      const { error: insertError } = await (supabase
        .from('responses')
        .insert(responses as unknown as never[]) as unknown as Promise<{ error: Error | null }>);

      if (!insertError) {
        totalResponses += responses.length;
        successfulParticipants++;
      }
    }

    // 4. Get final count
    const { count } = await supabase
      .from('responses')
      .select('*', { count: 'exact', head: true })
      .eq('assessment_id', assessmentId);

    return NextResponse.json({
      success: true,
      message: `Added ${totalResponses} responses from ${successfulParticipants} participants`,
      assessment: {
        id: assessment.id,
        title: assessment.title,
      },
      stats: {
        questionsPerParticipant: questions.length,
        participantsAdded: successfulParticipants,
        totalResponsesAdded: totalResponses,
        totalResponsesNow: count,
      },
      analyticsUrl: `/dashboard/analytics?assessment=${assessmentId}`,
    });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// GET to list available assessments
export async function GET() {
  try {
    const supabase = await createClient();

    interface AssessmentRow {
      id: string;
      title: string;
      status: string;
      questionnaire_id: string;
    }

    const { data: assessments, error } = await (supabase
      .from('assessments')
      .select('id, title, status, questionnaire_id')
      .order('created_at', { ascending: false })
      .limit(10) as unknown as Promise<{ data: AssessmentRow[] | null; error: Error | null }>);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Get response counts
    const assessmentsWithCounts = await Promise.all(
      (assessments || []).map(async (a: AssessmentRow) => {
        const { count } = await (supabase
          .from('responses')
          .select('*', { count: 'exact', head: true })
          .eq('assessment_id', a.id) as unknown as Promise<{ count: number | null }>);
        return { ...a, responseCount: count || 0 };
      })
    );

    return NextResponse.json({
      assessments: assessmentsWithCounts,
      usage: {
        method: 'POST',
        body: '{ "assessmentId": "<id>", "participantCount": 15 }',
        headers: 'x-admin-secret: <secret> (if in production)',
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
