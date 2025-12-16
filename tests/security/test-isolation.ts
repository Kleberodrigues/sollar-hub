/**
 * Teste de Isolamento Multi-Tenant
 *
 * Valida que organizações diferentes não conseguem acessar dados umas das outras
 */

import { loadEnv } from './load-env';
import {
  createAdminClient,
  createTestOrganization,
  createTestUser,
  signInTestUser,
  cleanupTestUsers,
  cleanupTestOrganizations,
  TestUser,
  TestOrganization
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

async function testOrganizationIsolation(): Promise<TestResult[]> {
  const results: TestResult[] = [];
  const adminClient = createAdminClient();

  // Arrays para cleanup
  const userIds: string[] = [];
  const organizationIds: string[] = [];

  let org1: TestOrganization | null = null;
  let org2: TestOrganization | null = null;
  let user1: TestUser | null = null;
  let user2: TestUser | null = null;

  console.log('🔐 Teste de Isolamento Multi-Tenant\n');
  console.log('='.repeat(60) + '\n');

  try {
    // ========================================================================
    // SETUP: Criar duas organizações e dois usuários
    // ========================================================================
    console.log('📝 Setup: Criando organizações e usuários de teste...\n');

    // Organização 1
    org1 = await createTestOrganization(adminClient, 'Org A Security Test');
    organizationIds.push(org1.id);
    console.log(`✅ Organização A criada: ${org1.name} (${org1.id})`);

    // Organização 2
    org2 = await createTestOrganization(adminClient, 'Org B Security Test');
    organizationIds.push(org2.id);
    console.log(`✅ Organização B criada: ${org2.name} (${org2.id})`);

    // Usuário 1 (Org A - Admin)
    user1 = await createTestUser(adminClient, org1.id, 'admin', 'org-a-admin');
    userIds.push(user1.id);
    console.log(`✅ Usuário 1 criado: ${user1.email} (Org A)`);

    // Usuário 2 (Org B - Admin)
    user2 = await createTestUser(adminClient, org2.id, 'admin', 'org-b-admin');
    userIds.push(user2.id);
    console.log(`✅ Usuário 2 criado: ${user2.email} (Org B)`);

    results.push({
      test: 'Setup - Criar organizações e usuários',
      passed: true,
      message: '✅ 2 organizações e 2 usuários criados com sucesso'
    });

    // ========================================================================
    // TESTE 1: User1 só vê sua própria organização
    // ========================================================================
    console.log('\n🔍 Teste 1: Isolamento de Organizations (User1)\n');

    const client1 = await signInTestUser(user1.email, user1.password);

    const { data: orgs1, error: orgsError1 } = await client1
      .from('organizations')
      .select('*');

    if (orgsError1) {
      results.push({
        test: 'User1 - SELECT organizations',
        passed: false,
        message: `❌ Erro: ${orgsError1.message}`
      });
    } else {
      const seesOnlyOwnOrg = orgs1.length === 1 && orgs1[0].id === org1.id;
      results.push({
        test: 'User1 - Isolamento de organizations',
        passed: seesOnlyOwnOrg,
        message: seesOnlyOwnOrg
          ? `✅ User1 vê apenas sua organização (${orgs1.length} org)`
          : `❌ FALHA - User1 vê ${orgs1.length} organizações: ${orgs1.map(o => o.id).join(', ')}`
      });
    }

    // ========================================================================
    // TESTE 2: User2 só vê sua própria organização
    // ========================================================================
    console.log('🔍 Teste 2: Isolamento de Organizations (User2)\n');

    const client2 = await signInTestUser(user2.email, user2.password);

    const { data: orgs2, error: orgsError2 } = await client2
      .from('organizations')
      .select('*');

    if (orgsError2) {
      results.push({
        test: 'User2 - SELECT organizations',
        passed: false,
        message: `❌ Erro: ${orgsError2.message}`
      });
    } else {
      const seesOnlyOwnOrg = orgs2.length === 1 && orgs2[0].id === org2.id;
      results.push({
        test: 'User2 - Isolamento de organizations',
        passed: seesOnlyOwnOrg,
        message: seesOnlyOwnOrg
          ? `✅ User2 vê apenas sua organização (${orgs2.length} org)`
          : `❌ FALHA - User2 vê ${orgs2.length} organizações: ${orgs2.map(o => o.id).join(', ')}`
      });
    }

    // ========================================================================
    // TESTE 3: User1 não vê perfis do User2
    // ========================================================================
    console.log('🔍 Teste 3: Isolamento de User Profiles\n');

    const { data: profiles1, error: profilesError1 } = await client1
      .from('user_profiles')
      .select('*');

    if (profilesError1) {
      results.push({
        test: 'User1 - SELECT user_profiles',
        passed: false,
        message: `❌ Erro: ${profilesError1.message}`
      });
    } else {
      const hasUser2Profile = profiles1.some(p => p.id === user2?.id);
      results.push({
        test: 'User1 - Não vê profiles de outras orgs',
        passed: !hasUser2Profile,
        message: hasUser2Profile
          ? `❌ FALHA CRÍTICA - User1 consegue ver profile do User2!`
          : `✅ User1 não vê profiles de outras orgs (${profiles1.length} profiles da própria org)`
      });
    }

    // ========================================================================
    // TESTE 4: User1 não pode inserir departamento na Org2
    // ========================================================================
    console.log('🔍 Teste 4: Proteção contra INSERT cross-org\n');

    const { error: insertError } = await client1
      .from('departments')
      .insert({
        name: 'Hack Department',
        organization_id: org2.id
      });

    results.push({
      test: 'Proteção contra INSERT cross-org',
      passed: insertError !== null,
      message: insertError
        ? `✅ RLS bloqueou INSERT - ${insertError.code}: ${insertError.message}`
        : `❌ FALHA CRÍTICA - User1 conseguiu inserir departamento na Org2!`
    });

    // ========================================================================
    // TESTE 5: User1 não pode atualizar Org2
    // ========================================================================
    console.log('🔍 Teste 5: Proteção contra UPDATE cross-org\n');

    const { data: updateData, error: updateError } = await client1
      .from('organizations')
      .update({ name: 'Hacked Org' })
      .eq('id', org2.id)
      .select();

    // RLS pode bloquear de 2 formas:
    // 1. Retornar error (policy violation)
    // 2. Retornar sucesso mas 0 rows affected (silent block)
    const updateBlocked = updateError !== null || !updateData || updateData.length === 0;

    results.push({
      test: 'Proteção contra UPDATE cross-org',
      passed: updateBlocked,
      message: updateError
        ? `✅ RLS bloqueou UPDATE - ${updateError.code}: ${updateError.message}`
        : updateBlocked
        ? `✅ RLS bloqueou UPDATE - 0 rows affected (silent block)`
        : `❌ FALHA CRÍTICA - User1 conseguiu atualizar Org2!`
    });

    // ========================================================================
    // TESTE 6: User1 não pode deletar Org2
    // ========================================================================
    console.log('🔍 Teste 6: Proteção contra DELETE cross-org\n');

    const { data: deleteData, error: deleteError } = await client1
      .from('organizations')
      .delete()
      .eq('id', org2.id)
      .select();

    // RLS pode bloquear de 2 formas:
    // 1. Retornar error (policy violation)
    // 2. Retornar sucesso mas 0 rows affected (silent block)
    const deleteBlocked = deleteError !== null || !deleteData || deleteData.length === 0;

    results.push({
      test: 'Proteção contra DELETE cross-org',
      passed: deleteBlocked,
      message: deleteError
        ? `✅ RLS bloqueou DELETE - ${deleteError.code}: ${deleteError.message}`
        : deleteBlocked
        ? `✅ RLS bloqueou DELETE - 0 rows affected (silent block)`
        : `❌ FALHA CRÍTICA - User1 conseguiu deletar Org2!`
    });

    // ========================================================================
    // TESTE 7: User2 não vê questionários da Org1
    // ========================================================================
    console.log('🔍 Teste 7: Isolamento de Questionnaires\n');

    // Criar questionário na Org1
    const { data: questionnaire1, error: q1Error } = await adminClient
      .from('questionnaires')
      .insert({
        title: 'Questionário Org1',
        organization_id: org1.id,
        created_by: user1.id
      })
      .select()
      .single();

    if (q1Error) {
      results.push({
        test: 'User2 - Não vê questionnaires de outras orgs',
        passed: false,
        message: `❌ Erro ao criar questionário teste: ${q1Error.message}`
      });
    } else {
      // User2 tenta ver questionários
      const { data: questionnaires2, error: q2Error } = await client2
        .from('questionnaires')
        .select('*');

      if (q2Error) {
        results.push({
          test: 'User2 - Não vê questionnaires de outras orgs',
          passed: false,
          message: `❌ Erro ao ler questionnaires: ${q2Error.message}`
        });
      } else {
        const hasOrg1Questionnaire = questionnaires2.some(q => q.id === questionnaire1.id);
        results.push({
          test: 'User2 - Não vê questionnaires de outras orgs',
          passed: !hasOrg1Questionnaire,
          message: hasOrg1Questionnaire
            ? `❌ FALHA CRÍTICA - User2 consegue ver questionário da Org1!`
            : `✅ User2 não vê questionários da Org1`
        });
      }
    }

    // Cleanup de clientes
    await client1.auth.signOut();
    await client2.auth.signOut();

  } catch (error: any) {
    results.push({
      test: 'Execução de Testes',
      passed: false,
      message: `❌ Erro inesperado: ${error.message}`
    });
  } finally {
    // ========================================================================
    // CLEANUP: Remover dados de teste
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
  console.log('\n🚀 Iniciando Testes de Segurança - Isolamento Multi-Tenant\n');

  const results = await testOrganizationIsolation();

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

export { testOrganizationIsolation };
