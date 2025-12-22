/**
 * Teste de Hierarquia de Roles
 *
 * Valida permissoes por role: admin (super) > responsavel_empresa > membro
 */

import { loadEnv } from './load-env';
import {
  createAdminClient,
  createTestOrganization,
  createTestUser,
  createTestDepartment,
  signInTestUser,
  cleanupTestUsers,
  cleanupTestOrganizations,
  cleanupTestDepartments,
  TestUser
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

async function testRoleHierarchy(): Promise<TestResult[]> {
  const results: TestResult[] = [];
  const adminClient = createAdminClient();

  const userIds: string[] = [];
  const organizationIds: string[] = [];
  const departmentIds: string[] = [];

  console.log('👥 Teste de Hierarquia de Roles\n');
  console.log('='.repeat(60) + '\n');

  try {
    // ========================================================================
    // SETUP: Criar organizacao e 2 usuarios (responsavel_empresa + membro)
    // ========================================================================
    console.log('📝 Setup: Criando organizacao e usuarios...\n');

    const org = await createTestOrganization(adminClient, 'Role Test Org');
    organizationIds.push(org.id);
    console.log(`✅ Organizacao: ${org.name} (${org.id})`);

    const dept = await createTestDepartment(adminClient, org.id, 'Test Department');
    departmentIds.push(dept.id);
    console.log(`✅ Departamento: ${dept.name} (${dept.id})\n`);

    // Criar usuarios com diferentes roles
    const responsavel = await createTestUser(adminClient, org.id, 'responsavel_empresa', 'role-responsavel');
    userIds.push(responsavel.id);
    console.log(`✅ Responsavel: ${responsavel.email}`);

    const membro = await createTestUser(adminClient, org.id, 'membro', 'role-membro');
    userIds.push(membro.id);
    console.log(`✅ Membro: ${membro.email}\n`);

    results.push({
      test: 'Setup - Criar org e 2 usuarios com diferentes roles',
      passed: true,
      message: '✅ 1 org + 1 dept + 2 usuarios criados (responsavel_empresa, membro)'
    });

    // ========================================================================
    // TESTE 1: RESPONSAVEL_EMPRESA - Pode criar questionario
    // ========================================================================
    console.log('🔍 Teste 1: Responsavel - Criar questionario\n');

    const responsavelClient = await signInTestUser(responsavel.email, responsavel.password);

    const { data: responsavelQuestionnaire, error: responsavelQError } = await responsavelClient
      .from('questionnaires')
      .insert({
        title: 'Responsavel Questionnaire',
        organization_id: org.id,
        created_by: responsavel.id
      })
      .select()
      .single();

    results.push({
      test: 'Responsavel - CREATE questionnaire',
      passed: responsavelQError === null && responsavelQuestionnaire !== null,
      message: responsavelQError
        ? `❌ Responsavel falhou ao criar questionario: ${responsavelQError.message}`
        : `✅ Responsavel criou questionario com sucesso`
    });

    // ========================================================================
    // TESTE 2: RESPONSAVEL_EMPRESA - Pode atualizar organizacao
    // ========================================================================
    console.log('🔍 Teste 2: Responsavel - Atualizar organizacao\n');

    const { data: responsavelUpdateOrg, error: responsavelUpdateError } = await responsavelClient
      .from('organizations')
      .update({ name: 'Updated by Responsavel' })
      .eq('id', org.id)
      .select();

    const responsavelCanUpdate = !responsavelUpdateError && responsavelUpdateOrg && responsavelUpdateOrg.length > 0;

    results.push({
      test: 'Responsavel - UPDATE organization',
      passed: responsavelCanUpdate,
      message: responsavelCanUpdate
        ? `✅ Responsavel atualizou organizacao`
        : `❌ Responsavel nao conseguiu atualizar: ${responsavelUpdateError?.message || '0 rows'}`
    });

    // ========================================================================
    // TESTE 3: MEMBRO - Pode ler questionarios
    // ========================================================================
    console.log('🔍 Teste 3: Membro - Ler questionarios\n');

    const membroClient = await signInTestUser(membro.email, membro.password);

    const { data: membroQuestionnaires, error: membroReadError } = await membroClient
      .from('questionnaires')
      .select('*');

    results.push({
      test: 'Membro - SELECT questionnaires',
      passed: membroReadError === null && membroQuestionnaires !== null,
      message: membroReadError
        ? `❌ Membro falhou ao ler: ${membroReadError.message}`
        : `✅ Membro leu ${membroQuestionnaires.length} questionarios`
    });

    // ========================================================================
    // TESTE 4: MEMBRO - NAO pode criar questionario
    // ========================================================================
    console.log('🔍 Teste 4: Membro - Criar questionario (deve BLOQUEAR)\n');

    const { data: membroQuestionnaire, error: membroCreateError } = await membroClient
      .from('questionnaires')
      .insert({
        title: 'Membro Questionnaire',
        organization_id: org.id,
        created_by: membro.id
      })
      .select()
      .single();

    const membroBlocked = membroCreateError !== null || membroQuestionnaire === null;

    results.push({
      test: 'Membro - CREATE questionnaire (bloqueado)',
      passed: membroBlocked,
      message: membroBlocked
        ? `✅ Membro bloqueado: ${membroCreateError?.message || 'RLS block'}`
        : `❌ Membro criou questionario (FALHA - deveria bloquear)`
    });

    // ========================================================================
    // TESTE 5: MEMBRO - NAO pode atualizar organizacao
    // ========================================================================
    console.log('🔍 Teste 5: Membro - Atualizar organizacao (deve BLOQUEAR)\n');

    const { data: membroUpdateOrg, error: membroUpdateError } = await membroClient
      .from('organizations')
      .update({ name: 'Updated by Membro' })
      .eq('id', org.id)
      .select();

    const membroUpdateBlocked = membroUpdateError !== null || !membroUpdateOrg || membroUpdateOrg.length === 0;

    results.push({
      test: 'Membro - UPDATE organization (bloqueado)',
      passed: membroUpdateBlocked,
      message: membroUpdateBlocked
        ? `✅ Membro bloqueado ao atualizar org`
        : `❌ Membro conseguiu atualizar org (FALHA - deveria bloquear)`
    });

    // ========================================================================
    // TESTE 6: MEMBRO - NAO pode atualizar questionario
    // ========================================================================
    console.log('🔍 Teste 6: Membro - Atualizar questionario (deve BLOQUEAR)\n');

    if (responsavelQuestionnaire) {
      const { data: membroUpdateQ, error: membroUpdateQError } = await membroClient
        .from('questionnaires')
        .update({ title: 'Updated by Membro' })
        .eq('id', responsavelQuestionnaire.id)
        .select();

      const membroQUpdateBlocked = membroUpdateQError !== null || !membroUpdateQ || membroUpdateQ.length === 0;

      results.push({
        test: 'Membro - UPDATE questionnaire (bloqueado)',
        passed: membroQUpdateBlocked,
        message: membroQUpdateBlocked
          ? `✅ Membro bloqueado ao atualizar questionario`
          : `❌ Membro conseguiu atualizar (FALHA)`
      });
    }

    // Cleanup
    await responsavelClient.auth.signOut();
    await membroClient.auth.signOut();

  } catch (error: any) {
    results.push({
      test: 'Execucao de Testes',
      passed: false,
      message: `❌ Erro inesperado: ${error.message}`
    });
  } finally {
    // ========================================================================
    // CLEANUP
    // ========================================================================
    console.log('\n🧹 Cleanup: Removendo dados de teste...\n');

    await cleanupTestDepartments(adminClient, departmentIds);
    await cleanupTestUsers(adminClient, userIds);
    await cleanupTestOrganizations(adminClient, organizationIds);

    console.log('✅ Cleanup concluido\n');
  }

  return results;
}

// Executar testes
async function runTests() {
  console.log('\n🚀 Iniciando Testes de Seguranca - Hierarquia de Roles\n');

  const results = await testRoleHierarchy();

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

  // Retornar codigo de saida
  process.exit(passed === total ? 0 : 1);
}

// Executar apenas se for chamado diretamente
if (require.main === module) {
  runTests();
}

export { testRoleHierarchy };
