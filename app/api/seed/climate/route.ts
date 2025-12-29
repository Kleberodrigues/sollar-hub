import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const CLIMA_QUESTIONNAIRE_ID = "b2222222-2222-2222-2222-222222222222";

// GET handler for easy testing via browser/WebFetch
export async function GET(request: Request) {
  const url = new URL(request.url);
  const secret = url.searchParams.get("secret");
  const count = parseInt(url.searchParams.get("count") || "30");

  if (secret !== "psicomapa-seed-2025") {
    return NextResponse.json(
      { error: "Unauthorized. Use ?secret=psicomapa-seed-2025" },
      { status: 401 }
    );
  }

  // Redirect to internal POST processing
  return seedClimateData(count);
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
async function seedClimateData(count: number) {
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
    let { data: questionnaire } = await supabase
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
    const { data: orgs } = await supabase
      .from("organizations")
      .select("id, name")
      .limit(1);

    let organizationId: string;
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

    // 4. Criar avaliação
    logs.push("📊 Criando avaliação de clima para este mês...");
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const monthNames = [
      "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
      "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
    ];

    let assessmentId: string;

    const { data: assessment, error: assessmentError } = await supabase
      .from("assessments")
      .insert({
        title: `Pesquisa de Clima - ${monthNames[now.getMonth()]} ${now.getFullYear()}`,
        questionnaire_id: CLIMA_QUESTIONNAIRE_ID,
        organization_id: organizationId,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        status: "active",
      })
      .select()
      .single();

    if (assessmentError) {
      logs.push(`⚠️ Avaliação pode já existir, buscando...`);

      const { data: existingAssessment } = await supabase
        .from("assessments")
        .select("id, title")
        .eq("questionnaire_id", CLIMA_QUESTIONNAIRE_ID)
        .eq("organization_id", organizationId)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (existingAssessment) {
        assessmentId = existingAssessment.id;
        logs.push(`✅ Usando avaliação existente: ${existingAssessment.title}`);
      } else {
        return NextResponse.json(
          { error: "Não foi possível criar ou encontrar avaliação", logs },
          { status: 500 }
        );
      }
    } else {
      assessmentId = assessment.id;
      logs.push(`✅ Avaliação criada: ${assessment.title}`);
    }

    // 5. Gerar respostas
    logs.push(`📤 Gerando ${count} respostas...`);

    const responses: {
      assessment_id: string;
      answers: Record<string, string | number>;
      is_anonymous: boolean;
      completed_at: string;
    }[] = [];

    for (let i = 0; i < count; i++) {
      const answers: Record<string, string | number> = {};

      for (const q of questions || []) {
        if (q.order_index === 1) {
          answers[q.id] = weightedRandom(Q1_OPTIONS, [5, 10, 25, 40, 20]);
        } else if (q.order_index >= 2 && q.order_index <= 8) {
          answers[q.id] = weightedRandom(LIKERT_OPTIONS, [5, 10, 30, 35, 20]);
        } else if (q.order_index === 9) {
          answers[q.id] = generateNPSScore();
        } else if (q.order_index === 10) {
          if (Math.random() < 0.7) {
            answers[q.id] =
              Q10_COMMENTS[Math.floor(Math.random() * Q10_COMMENTS.length)];
          }
        }
      }

      responses.push({
        assessment_id: assessmentId,
        answers,
        is_anonymous: true,
        completed_at: new Date().toISOString(),
      });
    }

    logs.push("   Salvando respostas no banco de dados...");

    const batchSize = 10;
    let insertedCount = 0;

    for (let i = 0; i < responses.length; i += batchSize) {
      const batch = responses.slice(i, i + batchSize);
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
    const { count = 30, secret } = await request.json();

    if (secret !== "psicomapa-seed-2025") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return seedClimateData(count);
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}
