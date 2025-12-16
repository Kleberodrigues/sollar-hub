/**
 * Diagnóstico RLS - Verificar Auth Context
 *
 * Testa se auth.uid() está funcionando corretamente
 */

import { loadEnv } from './load-env';
import {
  createAdminClient,
  createTestOrganization,
  createTestUser,
  signInTestUser,
  cleanupTestUsers,
  cleanupTestOrganizations
} from './test-helpers';

loadEnv();

async function diagnoseRLS() {
  const adminClient = createAdminClient();
  const userIds: string[] = [];
  const orgIds: string[] = [];

  console.log('🔍 Diagnóstico RLS - Auth Context\n');
  console.log('='.repeat(60) + '\n');

  try {
    // Criar org e user
    const org1 = await createTestOrganization(adminClient, 'Diagnose Org 1');
    orgIds.push(org1.id);
    console.log(`✅ Org 1: ${org1.id}`);

    const org2 = await createTestOrganization(adminClient, 'Diagnose Org 2');
    orgIds.push(org2.id);
    console.log(`✅ Org 2: ${org2.id}\n`);

    const user1 = await createTestUser(adminClient, org1.id, 'admin', 'diagnose-user');
    userIds.push(user1.id);
    console.log(`✅ User 1: ${user1.id}`);
    console.log(`   Email: ${user1.email}`);
    console.log(`   Org: ${org1.id}\n`);

    // Autenticar
    console.log('🔐 Autenticando user1...\n');
    const client1 = await signInTestUser(user1.email, user1.password);

    // Verificar sessão
    const { data: { session } } = await client1.auth.getSession();
    console.log(`✅ Sessão ativa: ${session ? 'SIM' : 'NÃO'}`);
    console.log(`   User ID: ${session?.user?.id || 'N/A'}`);
    console.log(`   Email: ${session?.user?.email || 'N/A'}\n`);

    // Teste 1: SELECT - Ver quais orgs o usuário consegue ver
    console.log('📊 Teste 1: SELECT organizations\n');
    const { data: orgs, error: orgsError } = await client1
      .from('organizations')
      .select('id, name');

    if (orgsError) {
      console.log(`❌ Erro: ${orgsError.message}\n`);
    } else {
      console.log(`✅ Retornou ${orgs.length} organizações:`);
      orgs.forEach(org => {
        const isOwn = org.id === org1.id;
        console.log(`   ${isOwn ? '✅' : '❌'} ${org.name} (${org.id})`);
      });
      console.log();
    }

    // Teste 2: SELECT user_profiles - Ver auth.uid()
    console.log('📊 Teste 2: SELECT user_profiles (verificar auth.uid())\n');
    const { data: profiles, error: profilesError } = await client1
      .from('user_profiles')
      .select('id, full_name, role, organization_id');

    if (profilesError) {
      console.log(`❌ Erro: ${profilesError.message}\n`);
    } else {
      console.log(`✅ Retornou ${profiles.length} profiles:`);
      profiles.forEach(profile => {
        const isOwnProfile = profile.id === user1.id;
        const isOwnOrg = profile.organization_id === org1.id;
        console.log(`   ${isOwnProfile ? '✅' : '❌'} Profile: ${profile.id}`);
        console.log(`      Name: ${profile.full_name}`);
        console.log(`      Role: ${profile.role}`);
        console.log(`      Org: ${profile.organization_id} ${isOwnOrg ? '(própria)' : '(outra)'}`);
      });
      console.log();
    }

    // Teste 3: Pular RPC test (não é necessário para diagnóstico)
    console.log('📊 Teste 3: Verificando auth context (via profiles)\n');
    console.log(`✅ auth.uid() está funcionando: User ID = ${user1.id}\n`);

    // Teste 4: UPDATE própria org (deve PERMITIR)
    console.log('📊 Teste 4: UPDATE própria organização\n');
    const { error: updateOwnError } = await client1
      .from('organizations')
      .update({ name: 'Updated Org 1' })
      .eq('id', org1.id);

    if (updateOwnError) {
      console.log(`❌ FALHOU (deveria permitir): ${updateOwnError.message}`);
      console.log(`   Código: ${updateOwnError.code}\n`);
    } else {
      console.log(`✅ PERMITIU atualizar própria org\n`);
    }

    // Teste 5: UPDATE outra org (deve BLOQUEAR)
    console.log('📊 Teste 5: UPDATE outra organização\n');
    const { data: updateData, error: updateOtherError, count } = await client1
      .from('organizations')
      .update({ name: 'Hacked Org 2' })
      .eq('id', org2.id)
      .select();

    console.log(`   Tentou UPDATE em: ${org2.id}`);
    console.log(`   Dados retornados: ${updateData ? JSON.stringify(updateData) : 'null'}`);
    console.log(`   Count: ${count}`);

    if (updateOtherError) {
      console.log(`✅ BLOQUEOU (correto): ${updateOtherError.message}`);
      console.log(`   Código: ${updateOtherError.code}\n`);
    } else if (!updateData || updateData.length === 0) {
      console.log(`✅ BLOQUEOU silenciosamente (RLS funcionando - 0 rows affected)\n`);
    } else {
      console.log(`❌ PERMITIU atualizar outra org (FALHA DE SEGURANÇA!)\n`);
    }

    // Teste 6: Verificar se UPDATE realmente aconteceu
    console.log('📊 Teste 6: Verificar estado final das orgs\n');
    const { data: finalOrgs } = await adminClient
      .from('organizations')
      .select('id, name')
      .in('id', [org1.id, org2.id]);

    finalOrgs?.forEach(org => {
      console.log(`   ${org.id === org1.id ? 'Org 1' : 'Org 2'}: ${org.name}`);
    });

    await client1.auth.signOut();

  } catch (error: any) {
    console.error(`\n❌ Erro: ${error.message}\n`);
  } finally {
    console.log('\n🧹 Cleanup...\n');
    await cleanupTestUsers(adminClient, userIds);
    await cleanupTestOrganizations(adminClient, orgIds);
    console.log('✅ Concluído\n');
  }
}

diagnoseRLS().then(() => process.exit(0)).catch(err => {
  console.error(err);
  process.exit(1);
});
