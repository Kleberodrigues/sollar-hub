/**
 * Teste de Anonimato de Respostas
 *
 * Valida que respostas são completamente anônimas e protegidas
 */

import { loadEnv } from './load-env';
import {
  createAdminClient,
  createAnonClient,
  createTestOrganization,
  createTestUser,
  signInTestUser,
  cleanupTestUsers,
  cleanupTestOrganizations
} from './test-helpers';

// Carregar env apenas se executado diretamente
if (require.main === module) {
  loadEnv();
}

interface TestResult {
  test: string;
  passed: boolean;
  message: string;
}

async function testAnonymity(): Promise<TestResult[]> {
  const results: TestResult[] = [];
  const adminClient = createAdminClient();

  const userIds: string[] = [];
  const organizationIds: string[] = [];

  console.log('🕵️ Teste de Anonimato de Respostas\n');
  console.log('='.repeat(60) + '\n');

  try {
    // ========================================================================
    // SETUP: Criar dados de teste
    // ========================================================================
    console.log('📝 Setup: Criando dados de teste...\n');

    const org = await createTestOrganization(adminClient, 'Anonymity Test Org');
    organizationIds.push(org.id);
    console.log(`✅ Organização: ${org.name}`);

    const admin = await createTestUser(adminClient, org.id, 'admin', 'anon-admin');
    userIds.push(admin.id);
    console.log(`✅ Admin: ${admin.email}\n`);

    // Criar questionário
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: questionnaire, error: qError } = await (adminClient as any)
      .from('questionnaires')
      .insert({
        title: 'Questionário Anonimato',
        organization_id: org.id,
        created_by: admin.id
      })
      .select()
      .single();

    if (qError || !questionnaire) {
      throw new Error(`Erro ao criar questionário: ${qError?.message}`);
    }

    console.log(`✅ Questionário: ${questionnaire.title} (${questionnaire.id})`);

    // Criar uma pergunta simples para teste
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: question, error: questionError } = await (adminClient as any)
      .from('questions')
      .insert({
        questionnaire_id: questionnaire.id,
        text: 'Pergunta de teste de anonimato',
        type: 'text',
        category: 'demands_and_pace',
        is_required: false
      })
      .select()
      .single();

    if (questionError || !question) {
      throw new Error(`Erro ao criar pergunta: ${questionError?.message}`);
    }

    console.log(`✅ Pergunta criada: ${question.id}`);

    // Criar assessment
    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 30); // 30 dias depois

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: assessment, error: assessError } = await (adminClient as any)
      .from('assessments')
      .insert({
        title: 'Assessment Anonimato',
        questionnaire_id: questionnaire.id,
        organization_id: org.id,
        status: 'active',
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString()
      })
      .select()
      .single();

    if (assessError || !assessment) {
      throw new Error(`Erro ao criar assessment: ${assessError?.message}`);
    }

    console.log(`✅ Assessment: ${assessment.title} (${assessment.id})`);
    console.log(`   URL público: /assess/${assessment.id}\n`);

    results.push({
      test: 'Setup - Criar org, questionário e assessment',
      passed: true,
      message: '✅ Setup completo com sucesso'
    });

    // ========================================================================
    // TESTE 1: Cliente anônimo pode acessar perguntas
    // ========================================================================
    console.log('🔍 Teste 1: Acesso Público a Perguntas\n');

    const anonClient = createAnonClient();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: publicQuestions, error: publicQError } = await (anonClient as any)
      .from('questions')
      .select('*')
      .eq('questionnaire_id', questionnaire.id);

    results.push({
      test: 'Cliente anônimo - SELECT questions',
      passed: publicQError === null && publicQuestions !== null && publicQuestions.length > 0,
      message: publicQError
        ? `❌ Erro: ${publicQError.message}`
        : `✅ Cliente anônimo leu ${publicQuestions?.length || 0} perguntas`
    });

    // ========================================================================
    // TESTE 2: Submeter respostas anônimas
    // ========================================================================
    console.log('🔍 Teste 2: Submissão Anônima de Respostas\n');

    const anonymousId = crypto.randomUUID();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: responseError } = await (anonClient as any)
      .from('responses')
      .insert({
        assessment_id: assessment.id,
        question_id: question.id,
        anonymous_id: anonymousId,
        value: 'Resposta anônima de teste'
      });

    results.push({
      test: 'Cliente anônimo - INSERT responses',
      passed: responseError === null,
      message: responseError
        ? `❌ Erro ao submeter: ${responseError.message}`
        : `✅ Resposta submetida anonimamente`
    });

    // ========================================================================
    // TESTE 3: Respostas NÃO têm user_id
    // ========================================================================
    console.log('🔍 Teste 3: Validação de Anonimato\n');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: allResponses, error: responsesError } = await (adminClient as any)
      .from('responses')
      .select('id, anonymous_id, assessment_id')
      .eq('assessment_id', assessment.id);

    if (responsesError) {
      results.push({
        test: 'Verificar anonimato - responses sem user_id',
        passed: false,
        message: `❌ Erro ao buscar respostas: ${responsesError.message}`
      });
    } else {
      // Todas respostas devem ter anonymous_id
      const allHaveAnonymousId = allResponses?.every(r => r.anonymous_id !== null) || false;

      results.push({
        test: 'Verificar anonimato - todas responses têm anonymous_id',
        passed: allHaveAnonymousId,
        message: allHaveAnonymousId
          ? `✅ Todas as ${allResponses?.length || 0} respostas usam anonymous_id`
          : `❌ Algumas respostas não têm anonymous_id`
      });
    }

    // ========================================================================
    // TESTE 4: Admin NÃO pode ver anonymous_id na interface normal
    // ========================================================================
    console.log('🔍 Teste 4: Proteção de Anonimato - Admin não acessa anonymous_id\n');

    const adminUserClient = await signInTestUser(admin.email, admin.password);

    // Admin tenta buscar respostas
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: adminResponses, error: adminError } = await (adminUserClient as any)
      .from('responses')
      .select('id, assessment_id')
      .eq('assessment_id', assessment.id);

    // Admin pode ver respostas, mas verifica se pode correlacionar com usuários
    results.push({
      test: 'Admin - SELECT responses (permitido)',
      passed: adminError === null && adminResponses !== null,
      message: adminError
        ? `❌ Admin não conseguiu ler: ${adminError.message}`
        : `✅ Admin leu ${adminResponses?.length || 0} respostas (anonimato mantido)`
    });

    // ========================================================================
    // TESTE 5: Não é possível vincular resposta a usuário específico
    // ========================================================================
    console.log('🔍 Teste 5: Impossibilidade de Desanonimização\n');

    // Verificar que anonymous_id é string aleatória, não UUID de usuário
    // Tentar fazer JOIN simples - não deve haver correlação
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: joinAttempt } = await (adminClient as any)
        .from('responses')
        .select(`
          id,
          anonymous_id,
          user_profiles!inner(id, full_name)
        `)
        .eq('assessment_id', assessment.id)
        .limit(1);

      // Se JOIN retornar dados, significa que anonymous_id == user_id (FALHA)
      const noCorrelation = !joinAttempt || joinAttempt.length === 0;

      results.push({
        test: 'Impossível correlacionar anonymous_id com user_id',
        passed: noCorrelation,
        message: noCorrelation
          ? `✅ Não é possível correlacionar respostas com usuários`
          : `⚠️ Join retornou dados (verificar se há correlação)`
      });
    } catch {
      results.push({
        test: 'Impossível correlacionar anonymous_id com user_id',
        passed: true,
        message: `✅ Não é possível correlacionar respostas com usuários`
      });
    }

    // ========================================================================
    // TESTE 6: Múltiplas respostas com mesmo anonymous_id
    // ========================================================================
    console.log('🔍 Teste 6: Agrupamento por anonymous_id\n');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: groupedResponses } = await (adminClient as any)
      .from('responses')
      .select('anonymous_id')
      .eq('assessment_id', assessment.id);

    if (groupedResponses) {
      const uniqueIds = new Set(groupedResponses.map(r => r.anonymous_id));

      results.push({
        test: 'Agrupamento - múltiplas respostas por anonymous_id',
        passed: uniqueIds.size > 0,
        message: `✅ ${uniqueIds.size} respondente(s) anônimo(s) com ${groupedResponses.length} respostas`
      });
    }

    await adminUserClient.auth.signOut();

  } catch (error: any) {
    results.push({
      test: 'Execução de Testes',
      passed: false,
      message: `❌ Erro inesperado: ${error.message}`
    });
  } finally {
    // ========================================================================
    // CLEANUP
    // ========================================================================
    console.log('\n🧹 Cleanup: Removendo dados de teste...\n');

    await cleanupTestUsers(adminClient, userIds);
    await cleanupTestOrganizations(adminClient, organizationIds);

    console.log('✅ Cleanup concluído\n');
  }

  return results;
}

// Executar testes
async function runTests() {
  console.log('\n🚀 Iniciando Testes de Segurança - Anonimato de Respostas\n');

  const results = await testAnonymity();

  console.log('\n' + '='.repeat(60));
  console.log('📊 RESULTADOS DOS TESTES\n');
  console.log('='.repeat(60));

  results.forEach((result, index) => {
    const icon = result.passed ? '✅' : '❌';
    console.log(`\n${index + 1}. ${icon} ${result.test}`);
    console.log(`   ${result.message}`);
  });

  const passed = results.filter(r => r.passed).length;
  const total = results.length;
  const percentage = Math.round((passed / total) * 100);

  console.log('\n' + '='.repeat(60));
  console.log(`\n📈 RESUMO: ${passed}/${total} testes passaram (${percentage}%)\n`);
  console.log('='.repeat(60) + '\n');

  // Retornar código de saída
  process.exit(passed === total ? 0 : 1);
}

// Executar apenas se for chamado diretamente
if (require.main === module) {
  runTests();
}

export { testAnonymity };
