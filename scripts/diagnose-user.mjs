/**
 * Diagnose and fix user profile issues
 * Usage: node scripts/diagnose-user.mjs <email>
 *        node scripts/diagnose-user.mjs <email> --fix
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://btaqtllwqfzxkrcmaskh.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ0YXF0bGx3cWZ6eGtyY21hc2toIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzQxMjMyMiwiZXhwIjoyMDc4OTg4MzIyfQ.dnSQD02qDyQueIuqIdsmXjSQ9X35J5WwRwbT613g250';

const supabase = createClient(supabaseUrl, supabaseKey);

const email = process.argv[2];
const fixMode = process.argv.includes('--fix');

if (!email) {
  console.log('Usage: node scripts/diagnose-user.mjs <email> [--fix]');
  process.exit(1);
}

async function diagnoseUser() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`🔍 DIAGNÓSTICO DE USUÁRIO: ${email}`);
  console.log('═══════════════════════════════════════════════════════════\n');

  // 1. Find user in auth.users
  console.log('📋 1. Buscando usuário no auth.users...');
  const { data: authUsers } = await supabase.auth.admin.listUsers();
  const authUser = authUsers?.users?.find(u => u.email === email);

  if (!authUser) {
    console.log('   ❌ Usuário NÃO encontrado em auth.users');
    return;
  }

  console.log('   ✅ Usuário encontrado:');
  console.log(`      ID: ${authUser.id}`);
  console.log(`      Email: ${authUser.email}`);
  console.log(`      Criado em: ${authUser.created_at}`);
  console.log(`      Metadata: ${JSON.stringify(authUser.user_metadata)}`);

  // 2. Check user profile
  console.log('\n📋 2. Verificando perfil em user_profiles...');
  const { data: profile, error: profileError } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', authUser.id)
    .single();

  if (profileError) {
    console.log(`   ❌ Perfil NÃO encontrado: ${profileError.message}`);

    if (fixMode) {
      console.log('   🔧 Criando perfil...');
      const { error: createError } = await supabase
        .from('user_profiles')
        .insert({
          id: authUser.id,
          full_name: authUser.user_metadata?.full_name || email,
          role: 'membro'
        });

      if (createError) {
        console.log(`   ❌ Erro ao criar perfil: ${createError.message}`);
      } else {
        console.log('   ✅ Perfil criado com role "membro"');
      }
    }
    return;
  }

  console.log('   ✅ Perfil encontrado:');
  console.log(`      Full Name: ${profile.full_name}`);
  console.log(`      Role: ${profile.role}`);
  console.log(`      Organization ID: ${profile.organization_id || 'NENHUMA'}`);
  console.log(`      Is Super Admin: ${profile.is_super_admin}`);
  console.log(`      Criado em: ${profile.created_at}`);

  // Check organization
  if (profile.organization_id) {
    const { data: org } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', profile.organization_id)
      .single();

    if (org) {
      console.log(`\n📋 3. Organização vinculada:`);
      console.log(`      Nome: ${org.name}`);
      console.log(`      Industry: ${org.industry || 'N/A'}`);
      console.log(`      Size: ${org.size || 'N/A'}`);
    }

    // Check subscription
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('organization_id', profile.organization_id)
      .single();

    if (subscription) {
      console.log(`\n📋 4. Assinatura:`);
      console.log(`      Plano: ${subscription.plan}`);
      console.log(`      Status: ${subscription.status}`);
    } else {
      console.log(`\n📋 4. ⚠️ NENHUMA assinatura encontrada para a organização`);
    }
  } else {
    console.log('\n   ⚠️ PROBLEMA: Usuário SEM organização vinculada');
    console.log('   Este usuário não pode acessar a página de Usuários porque não tem organização.');

    // Check billing_customer to find potential organization
    const { data: billingCustomer } = await supabase
      .from('billing_customers')
      .select('*')
      .eq('email', email)
      .single();

    if (billingCustomer) {
      console.log(`\n   💡 Encontrado billing_customer com org_id: ${billingCustomer.organization_id}`);

      if (fixMode) {
        console.log('   🔧 Vinculando organização ao perfil...');
        const { error: updateError } = await supabase
          .from('user_profiles')
          .update({
            organization_id: billingCustomer.organization_id,
            role: 'responsavel_empresa'
          })
          .eq('id', authUser.id);

        if (updateError) {
          console.log(`   ❌ Erro ao atualizar: ${updateError.message}`);
        } else {
          console.log('   ✅ Perfil atualizado com organização e role responsavel_empresa');
        }
      } else {
        console.log('   Execute com --fix para vincular automaticamente');
      }
    } else {
      console.log('\n   ⚠️ Nenhum billing_customer encontrado para este email');
      console.log('   Este usuário pode não ter finalizado o pagamento.');
    }
  }

  // Diagnosis summary
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('📊 RESUMO DO DIAGNÓSTICO');
  console.log('═══════════════════════════════════════════════════════════');

  const issues = [];

  if (!profile.organization_id) {
    issues.push('❌ Sem organização vinculada');
  }

  if (profile.role !== 'responsavel_empresa' && !profile.is_super_admin) {
    issues.push(`⚠️ Role é "${profile.role}" (deveria ser "responsavel_empresa" para acessar página de Usuários)`);
  }

  if (!profile.full_name || profile.full_name === email) {
    issues.push('⚠️ Nome completo não definido');
  }

  if (issues.length === 0) {
    console.log('✅ Usuário está corretamente configurado');
    console.log('   Se ainda houver problemas, pode ser necessário:');
    console.log('   1. Limpar cache do navegador');
    console.log('   2. Fazer logout e login novamente');
    console.log('   3. Verificar se o deploy está atualizado');
  } else {
    console.log('Problemas encontrados:');
    issues.forEach(i => console.log(`   ${i}`));

    if (!fixMode) {
      console.log('\n💡 Execute com --fix para tentar corrigir automaticamente');
    }
  }

  console.log('═══════════════════════════════════════════════════════════\n');
}

diagnoseUser().catch(console.error);
