import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { randomUUID } from "crypto";

const CLIMA_QUESTIONNAIRE_ID = "b2222222-2222-2222-2222-222222222222";

// GET handler for easy testing via browser/WebFetch
export async function GET(request: Request) {
  const url = new URL(request.url);
  const secret = url.searchParams.get("secret");
  const count = parseInt(url.searchParams.get("count") || "30");
  const orgId = url.searchParams.get("orgId") || undefined;
  const all = url.searchParams.get("all") === "true";

  if (secret !== "psicomapa-seed-2025") {
    return NextResponse.json(
      { error: "Unauthorized. Use ?secret=psicomapa-seed-2025" },
      { status: 401 }
    );
  }

  if (all) {
    return seedAllOrganizations(count);
  }

  return seedClimateData(count, orgId);
}

// Seed data for ALL organizations
async function seedAllOrganizations(count: number) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  if (!supabaseUrl || !supabaseServiceKey) {
    return NextResponse.json(
      { error: "Missing Supabase configuration" },
      { status: 500 }
    );
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // Buscar todas as organizações
  const { data: orgs, error: orgsError } = await supabase
    .from("organizations")
    .select("id, name");

  if (orgsError || !orgs || orgs.length === 0) {
    return NextResponse.json(
      { error: "Nenhuma organização encontrada", details: orgsError?.message },
      { status: 404 }
    );
  }

  const results: { org: string; success: boolean; responsesInserted?: number; error?: string }[] = [];

  for (const org of orgs) {
    try {
      const response = await seedClimateData(count, org.id);
      const data = await response.json();

      results.push({
        org: org.name,
        success: data.success || false,
        responsesInserted: data.summary?.responsesInserted,
        error: data.error
      });
    } catch (err) {
      results.push({
        org: org.name,
        success: false,
        error: String(err)
      });
    }
  }

  const totalSuccess = results.filter(r => r.success).length;
  const totalResponses = results.reduce((acc, r) => acc + (r.responsesInserted || 0), 0);

  return NextResponse.json({
    success: true,
    message: `Dados criados para ${totalSuccess}/${orgs.length} organizações`,
    totalResponses,
    results
  });
}

// Opções de resposta
const Q1_OPTIONS = ["Muito mal", "Mal", "Mais ou menos", "Bem", "Muito bem"];
const LIKERT_OPTIONS = ["Nunca", "Raramente", "Às vezes", "Quase sempre", "Sempre"];
const Q10_COMMENTS = [
  "Excesso de trabalho está me sobrecarregando muito.",
  "Falta de reconhecimento por parte da liderança.",
  "A equipe é muito colaborativa e o ambiente é ótimo.",
  "Precisamos de mais flexibilidade nos horários.",
  "O crescimento profissional aqui é excelente.",
  "A comunicação entre os times precisa melhorar.",
  "Estresse constante com prazos apertados.",
  "Os benefícios são muito bons, estou satisfeito.",
  "A liderança poderia ser mais presente.",
  "Ambiente de trabalho muito agradável.",
  "Sobrecarga de tarefas está afetando minha saúde.",
  "Reconhecimento pelo trabalho realizado é muito bom.",
  "Pressão excessiva para entregar resultados.",
  "Equipe unida e colaborativa.",
  "Salário abaixo do mercado.",
];

function weightedRandom<T>(options: T[], weights: number[]): T {
  const totalWeight = weights.reduce((a, b) => a + b, 0);
  let random = Math.random() * totalWeight;

  for (let i = 0; i < options.length; i++) {
    random -= weights[i];
    if (random <= 0) return options[i];
  }
  return options[options.length - 1];
}

function generateNPSScore(): number {
  const weights = [2, 2, 3, 4, 5, 8, 12, 18, 22, 15, 9];
  return weightedRandom([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10], weights);
}

// Shared seed function for both GET and POST
async function seedClimateData(count: number, targetOrgId?: string) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: "Missing Supabase configuration" },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const logs: string[] = [];
    logs.push("🌡️ Iniciando geração de respostas de Pesquisa de Clima...");

    // 1. Verificar/criar questionário
    logs.push("📋 Verificando questionário de clima...");
    const { data: questionnaire } = await supabase
      .from("questionnaires")
      .select("id, title")
      .eq("id", CLIMA_QUESTIONNAIRE_ID)
      .single();

    if (!questionnaire) {
      logs.push("   Criando questionário...");
      const { error: createQError } = await supabase.from("questionnaires").insert({
        id: CLIMA_QUESTIONNAIRE_ID,
        title: "Pesquisa de Clima Organizacional",
        description:
          "Questionário para avaliar o clima organizacional e bem-estar dos colaboradores",
        category: "climate",
        is_template: true,
        is_active: true,
      });

      if (createQError) {
        return NextResponse.json(
          { error: `Erro ao criar questionário: ${createQError.message}`, logs },
          { status: 500 }
        );
      }
      logs.push("✅ Questionário criado!");
    } else {
      logs.push(`✅ Questionário encontrado: ${questionnaire.title}`);
    }

    // 2. Buscar/criar perguntas
    logs.push("📝 Buscando perguntas...");
    let { data: questions } = await supabase
      .from("questions")
      .select("id, text, type, order_index")
      .eq("questionnaire_id", CLIMA_QUESTIONNAIRE_ID)
      .order("order_index");

    if (!questions || questions.length === 0) {
      logs.push("   Criando perguntas padrão...");

      const defaultQuestions = [
        {
          order_index: 1,
          text: "Como você está se sentindo no trabalho este mês?",
          type: "multiple_choice",
          options: Q1_OPTIONS,
        },
        {
          order_index: 2,
          text: "Você se sente respeitado(a) pelos seus colegas de trabalho?",
          type: "likert",
          options: LIKERT_OPTIONS,
        },
        {
          order_index: 3,
          text: "Sua liderança oferece suporte quando você precisa?",
          type: "likert",
          options: LIKERT_OPTIONS,
        },
        {
          order_index: 4,
          text: "Você consegue equilibrar sua vida pessoal e profissional?",
          type: "likert",
          options: LIKERT_OPTIONS,
        },
        {
          order_index: 5,
          text: "Você se sente motivado(a) para realizar suas tarefas?",
          type: "likert",
          options: LIKERT_OPTIONS,
        },
        {
          order_index: 6,
          text: "A comunicação na empresa é clara e eficiente?",
          type: "likert",
          options: LIKERT_OPTIONS,
        },
        {
          order_index: 7,
          text: "Você tem as ferramentas necessárias para fazer seu trabalho?",
          type: "likert",
          options: LIKERT_OPTIONS,
        },
        {
          order_index: 8,
          text: "Você se sente valorizado(a) pelo seu trabalho?",
          type: "likert",
          options: LIKERT_OPTIONS,
        },
        {
          order_index: 9,
          text: "De 0 a 10, quão satisfeito(a) você está trabalhando aqui?",
          type: "nps",
          options: null,
        },
        {
          order_index: 10,
          text: "O que mais influencia sua nota? (opcional)",
          type: "text",
          options: null,
        },
      ];

      const questionsToInsert = defaultQuestions.map((q) => ({
        questionnaire_id: CLIMA_QUESTIONNAIRE_ID,
        text: q.text,
        type: q.type,
        order_index: q.order_index,
        options: q.options,
        is_required: q.order_index !== 10,
      }));

      const { data: insertedQuestions, error: insertError } = await supabase
        .from("questions")
        .insert(questionsToInsert)
        .select();

      if (insertError) {
        return NextResponse.json(
          { error: `Erro ao criar perguntas: ${insertError.message}`, logs },
          { status: 500 }
        );
      }

      questions = insertedQuestions;
      logs.push(`✅ ${questions?.length || 0} perguntas criadas!`);
    } else {
      logs.push(`✅ ${questions.length} perguntas encontradas`);
    }

    // 3. Buscar organização
    logs.push("🏢 Verificando organização...");
    let organizationId: string;

    if (targetOrgId) {
      // Use provided organization ID
      const { data: org } = await supabase
        .from("organizations")
        .select("id, name")
        .eq("id", targetOrgId)
        .single();

      if (org) {
        organizationId = org.id;
        logs.push(`✅ Usando organização especificada: ${org.name}`);
      } else {
        return NextResponse.json(
          { error: "Organização não encontrada", logs },
          { status: 404 }
        );
      }
    } else {
      // Fallback to first organization
      const { data: orgs } = await supabase
        .from("organizations")
        .select("id, name")
        .limit(1);

      if (!orgs || orgs.length === 0) {
        logs.push("   Criando organização de teste...");
        const { data: newOrg, error: orgError } = await supabase
          .from("organizations")
          .insert({ name: "Empresa Teste", slug: "empresa-teste" })
          .select()
          .single();

        if (orgError || !newOrg) {
          return NextResponse.json(
            { error: `Erro ao criar organização: ${orgError?.message}`, logs },
            { status: 500 }
          );
        }
        organizationId = newOrg.id;
        logs.push(`✅ Organização criada: ${newOrg.name}`);
      } else {
        organizationId = orgs[0].id;
        logs.push(`✅ Usando organização: ${orgs[0].name}`);
      }
    }

    // 4. Criar ou buscar avaliação do mês atual
    logs.push("📊 Buscando/criando avaliação de clima para este mês...");

    // Use Brazil timezone to calculate month correctly
    const nowUTC = new Date();
    const brazilFormatter = new Intl.DateTimeFormat('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
    });
    const brazilParts = brazilFormatter.formatToParts(nowUTC);
    const brazilYear = parseInt(brazilParts.find(p => p.type === 'year')?.value || '2025');
    const brazilMonth = parseInt(brazilParts.find(p => p.type === 'month')?.value || '12') - 1; // 0-indexed

    const startDate = new Date(Date.UTC(brazilYear, brazilMonth, 1));
    const endDate = new Date(Date.UTC(brazilYear, brazilMonth + 1, 0, 23, 59, 59));

    const monthNames = [
      "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
      "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
    ];

    let assessmentId: string;
    const assessmentTitle = `Pesquisa de Clima - ${monthNames[brazilMonth]} ${brazilYear}`;

    logs.push(`   Mês calculado (Brasil): ${monthNames[brazilMonth]} ${brazilYear}`);

    // Primeiro, buscar se já existe avaliação para este mês
    const { data: existingAssessment } = await supabase
      .from("assessments")
      .select("id, title")
      .eq("questionnaire_id", CLIMA_QUESTIONNAIRE_ID)
      .eq("organization_id", organizationId)
      .gte("start_date", startDate.toISOString())
      .lte("start_date", endDate.toISOString())
      .limit(1)
      .single();

    if (existingAssessment) {
      assessmentId = existingAssessment.id;
      logs.push(`✅ Usando avaliação existente: ${existingAssessment.title}`);
    } else {
      // Criar nova avaliação para este mês
      const { data: newAssessment, error: assessmentError } = await supabase
        .from("assessments")
        .insert({
          title: assessmentTitle,
          questionnaire_id: CLIMA_QUESTIONNAIRE_ID,
          organization_id: organizationId,
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
          status: "active",
        })
        .select()
        .single();

      if (assessmentError || !newAssessment) {
        logs.push(`❌ Erro ao criar avaliação: ${assessmentError?.message}`);
        return NextResponse.json(
          { error: `Erro ao criar avaliação: ${assessmentError?.message}`, logs },
          { status: 500 }
        );
      }
      assessmentId = newAssessment.id;
      logs.push(`✅ Avaliação criada: ${newAssessment.title}`);
    }

    // 5. Gerar respostas (uma linha por pergunta por respondente)
    logs.push(`📤 Gerando ${count} respondentes...`);

    const allResponses: {
      assessment_id: string;
      question_id: string;
      response_text: string;
      value: number | null;
      anonymous_id: string;
    }[] = [];

    for (let i = 0; i < count; i++) {
      // Gerar UUID único para este respondente
      const anonymousId = randomUUID();

      for (const q of questions || []) {
        let responseText = "";
        let value: number | null = null;

        if (q.order_index === 1) {
          // Q1 - Sentimento
          responseText = weightedRandom(Q1_OPTIONS, [5, 10, 25, 40, 20]);
        } else if (q.order_index >= 2 && q.order_index <= 8) {
          // Q2-Q8 - Likert
          responseText = weightedRandom(LIKERT_OPTIONS, [5, 10, 30, 35, 20]);
        } else if (q.order_index === 9) {
          // Q9 - NPS (0-10)
          value = generateNPSScore();
          responseText = String(value);
        } else if (q.order_index === 10) {
          // Q10 - Comentário (70% respondem)
          if (Math.random() < 0.7) {
            responseText = Q10_COMMENTS[Math.floor(Math.random() * Q10_COMMENTS.length)];
          } else {
            continue; // Pular se não responder
          }
        }

        allResponses.push({
          assessment_id: assessmentId,
          question_id: q.id,
          response_text: responseText,
          value,
          anonymous_id: anonymousId,
        });
      }
    }

    logs.push(`   Total de respostas a inserir: ${allResponses.length}`);
    logs.push("   Salvando respostas no banco de dados...");

    const batchSize = 50;
    let insertedCount = 0;

    for (let i = 0; i < allResponses.length; i += batchSize) {
      const batch = allResponses.slice(i, i + batchSize);
      const { error } = await supabase.from("responses").insert(batch);

      if (error) {
        logs.push(`❌ Erro ao inserir lote: ${error.message}`);
      } else {
        insertedCount += batch.length;
      }
    }

    logs.push(`✅ ${insertedCount} respostas inseridas com sucesso!`);
    logs.push("🎉 Processo concluído!");

    return NextResponse.json({
      success: true,
      logs,
      summary: {
        questionsCount: questions?.length || 0,
        responsesInserted: insertedCount,
        assessmentId,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: `Erro inesperado: ${error}` },
      { status: 500 }
    );
  }
}

// POST handler
export async function POST(request: Request) {
  try {
    const { count = 30, secret, organizationId } = await request.json();

    if (secret !== "psicomapa-seed-2025") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return seedClimateData(count, organizationId);
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}
