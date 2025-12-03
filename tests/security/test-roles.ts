/**
 * Teste de Hierarquia de Roles
 *
 * Valida permissões por role: admin > manager > member > viewer
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
    // SETUP: Criar organização e 4 usuários (1 de cada role)
    // ========================================================================
    console.log('📝 Setup: Criando organização e usuários...\n');

    const org = await createTestOrganization(adminClient, 'Role Test Org');
    organizationIds.push(org.id);
    console.log(`✅ Organização: ${org.name} (${org.id})`);

    const dept = await createTestDepartment(adminClient, org.id, 'Test Department');
    departmentIds.push(dept.id);
    console.log(`✅ Departamento: ${dept.name} (${dept.id})\n`);

    // Criar usuários com diferentes roles
    const admin = await createTestUser(adminClient, org.id, 'admin', 'role-admin');
    userIds.push(admin.id);
    console.log(`✅ Admin: ${admin.email}`);

    const manager = await createTestUser(adminClient, org.id, 'manager', 'role-manager');
    userIds.push(manager.id);
    console.log(`✅ Manager: ${manager.email}`);

    const member = await createTestUser(adminClient, org.id, 'member', 'role-member');
    userIds.push(member.id);
    console.log(`✅ Member: ${member.email}`);

    const viewer = await createTestUser(adminClient, org.id, 'viewer', 'role-viewer');
    userIds.push(viewer.id);
    console.log(`✅ Viewer: ${viewer.email}\n`);

    results.push({
      test: 'Setup - Criar org e 4 usuários com diferentes roles',
      passed: true,
      message: '✅ 1 org + 1 dept + 4 usuários criados (admin, manager, member, viewer)'
    });

    // ========================================================================
    // TESTE 1: ADMIN - Pode criar questionário
    // ========================================================================
    console.log('🔍 Teste 1: Admin - Criar questionário\n');

    const adminClient1 = await signInTestUser(admin.email, admin.password);

    const { data: adminQuestionnaire, error: adminQError } = await adminClient1
      .from('questionnaires')
      .insert({
        title: 'Admin Questionnaire',
        organization_id: org.id,
        created_by: admin.id
      })
      .select()
      .single();

    results.push({
      test: 'Admin - CREATE questionnaire',
      passed: adminQError === null && adminQuestionnaire !== null,
      message: adminQError
        ? `❌ Admin falhou ao criar questionário: ${adminQError.message}`
        : `✅ Admin criou questionário com sucesso`
    });

    // ========================================================================
    // TESTE 2: ADMIN - Pode atualizar organização
    // ========================================================================
    console.log('🔍 Teste 2: Admin - Atualizar organização\n');

    const { data: adminUpdateOrg, error: adminUpdateError } = await adminClient1
      .from('organizations')
      .update({ name: 'Updated by Admin' })
      .eq('id', org.id)
      .select();

    const adminCanUpdate = !adminUpdateError && adminUpdateOrg && adminUpdateOrg.length > 0;

    results.push({
      test: 'Admin - UPDATE organization',
      passed: adminCanUpdate,
      message: adminCanUpdate
        ? `✅ Admin atualizou organização`
        : `❌ Admin não conseguiu atualizar: ${adminUpdateError?.message || '0 rows'}`
    });

    // ========================================================================
    // TESTE 3: MANAGER - Pode criar questionário
    // ========================================================================
    console.log('🔍 Teste 3: Manager - Criar questionário\n');

    const managerClient = await signInTestUser(manager.email, manager.password);

    const { data: managerQuestionnaire, error: managerQError } = await managerClient
      .from('questionnaires')
      .insert({
        title: 'Manager Questionnaire',
        organization_id: org.id,
        created_by: manager.id
      })
      .select()
      .single();

    results.push({
      test: 'Manager - CREATE questionnaire',
      passed: managerQError === null && managerQuestionnaire !== null,
      message: managerQError
        ? `❌ Manager falhou ao criar questionário: ${managerQError.message}`
        : `✅ Manager criou questionário com sucesso`
    });

    // ========================================================================
    // TESTE 4: MANAGER - NÃO pode atualizar organização
    // ========================================================================
    console.log('🔍 Teste 4: Manager - Atualizar organização (deve BLOQUEAR)\n');

    const { data: managerUpdateOrg, error: managerUpdateError } = await managerClient
      .from('organizations')
      .update({ name: 'Updated by Manager' })
      .eq('id', org.id)
      .select();

    const managerBlocked = managerUpdateError !== null || !managerUpdateOrg || managerUpdateOrg.length === 0;

    results.push({
      test: 'Manager - UPDATE organization (bloqueado)',
      passed: managerBlocked,
      message: managerBlocked
        ? `✅ Manager bloqueado (correto - apenas admin pode)`
        : `❌ Manager conseguiu atualizar org (FALHA - deveria bloquear)`
    });

    // ========================================================================
    // TESTE 5: MEMBER - Pode ler questionários
    // ========================================================================
    console.log('🔍 Teste 5: Member - Ler questionários\n');

    const memberClient = await signInTestUser(member.email, member.password);

    const { data: memberQuestionnaires, error: memberReadError } = await memberClient
      .from('questionnaires')
      .select('*');

    results.push({
      test: 'Member - SELECT questionnaires',
      passed: memberReadError === null && memberQuestionnaires !== null,
      message: memberReadError
        ? `❌ Member falhou ao ler: ${memberReadError.message}`
        : `✅ Member leu ${memberQuestionnaires.length} questionários`
    });

    // ========================================================================
    // TESTE 6: MEMBER - NÃO pode criar questionário
    // ========================================================================
    console.log('🔍 Teste 6: Member - Criar questionário (deve BLOQUEAR)\n');

    const { data: memberQuestionnaire, error: memberCreateError } = await memberClient
      .from('questionnaires')
      .insert({
        title: 'Member Questionnaire',
        organization_id: org.id,
        created_by: member.id
      })
      .select()
      .single();

    const memberBlocked = memberCreateError !== null || memberQuestionnaire === null;

    results.push({
      test: 'Member - CREATE questionnaire (bloqueado)',
      passed: memberBlocked,
      message: memberBlocked
        ? `✅ Member bloqueado: ${memberCreateError?.message || 'RLS block'}`
        : `❌ Member criou questionário (FALHA - deveria bloquear)`
    });

    // ========================================================================
    // TESTE 7: VIEWER - Pode ler questionários
    // ========================================================================
    console.log('🔍 Teste 7: Viewer - Ler questionários\n');

    const viewerClient = await signInTestUser(viewer.email, viewer.password);

    const { data: viewerQuestionnaires, error: viewerReadError } = await viewerClient
      .from('questionnaires')
      .select('*');

    results.push({
      test: 'Viewer - SELECT questionnaires',
      passed: viewerReadError === null && viewerQuestionnaires !== null,
      message: viewerReadError
        ? `❌ Viewer falhou ao ler: ${viewerReadError.message}`
        : `✅ Viewer leu ${viewerQuestionnaires.length} questionários`
    });

    // ========================================================================
    // TESTE 8: VIEWER - NÃO pode criar questionário
    // ========================================================================
    console.log('🔍 Teste 8: Viewer - Criar questionário (deve BLOQUEAR)\n');

    const { data: viewerQuestionnaire, error: viewerCreateError } = await viewerClient
      .from('questionnaires')
      .insert({
        title: 'Viewer Questionnaire',
        organization_id: org.id,
        created_by: viewer.id
      })
      .select()
      .single();

    const viewerBlocked = viewerCreateError !== null || viewerQuestionnaire === null;

    results.push({
      test: 'Viewer - CREATE questionnaire (bloqueado)',
      passed: viewerBlocked,
      message: viewerBlocked
        ? `✅ Viewer bloqueado: ${viewerCreateError?.message || 'RLS block'}`
        : `❌ Viewer criou questionário (FALHA - deveria bloquear)`
    });

    // ========================================================================
    // TESTE 9: VIEWER - NÃO pode atualizar questionário
    // ========================================================================
    console.log('🔍 Teste 9: Viewer - Atualizar questionário (deve BLOQUEAR)\n');

    if (adminQuestionnaire) {
      const { data: viewerUpdateQ, error: viewerUpdateError } = await viewerClient
        .from('questionnaires')
        .update({ title: 'Updated by Viewer' })
        .eq('id', adminQuestionnaire.id)
        .select();

      const viewerUpdateBlocked = viewerUpdateError !== null || !viewerUpdateQ || viewerUpdateQ.length === 0;

      results.push({
        test: 'Viewer - UPDATE questionnaire (bloqueado)',
        passed: viewerUpdateBlocked,
        message: viewerUpdateBlocked
          ? `✅ Viewer bloqueado ao atualizar`
          : `❌ Viewer conseguiu atualizar (FALHA)`
      });
    }

    // Cleanup
    await adminClient1.auth.signOut();
    await managerClient.auth.signOut();
    await memberClient.auth.signOut();
    await viewerClient.auth.signOut();

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

    await cleanupTestDepartments(adminClient, departmentIds);
    await cleanupTestUsers(adminClient, userIds);
    await cleanupTestOrganizations(adminClient, organizationIds);

    console.log('✅ Cleanup concluído\n');
  }

  return results;
}

// Executar testes
async function runTests() {
  console.log('\n🚀 Iniciando Testes de Segurança - Hierarquia de Roles\n');

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

  // Retornar código de saída
  process.exit(passed === total ? 0 : 1);
}

// Executar apenas se for chamado diretamente
if (require.main === module) {
  runTests();
}

export { testRoleHierarchy };
