import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://btaqtllwqfzxkrcmaskh.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ0YXF0bGx3cWZ6eGtyY21hc2toIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM0MTIzMjIsImV4cCI6MjA3ODk4ODMyMn0.jCwaw15gtJphwDxeCMOUycSiE8G8aV4qRlH-wceBDpg';

async function testInsert() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  // Login
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'admin@sollar.com.br',
    password: 'AdminPassword123!'
  });

  if (authError) {
    console.error('❌ Auth error:', authError.message);
    return;
  }

  console.log('✅ Logado como:', authData.user.email);

  // Get profile
  const { data: profile, error: profileError } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', authData.user.id)
    .single();

  if (profileError) {
    console.error('❌ Profile error:', profileError.message);
    return;
  }

  console.log('📋 Profile:');
  console.log('   Role:', profile.role);
  console.log('   Org ID:', profile.organization_id);

  // Test insert
  console.log('\n📝 Tentando inserir assessment...');

  const payload = {
    title: 'Teste de Clima - Script ' + new Date().toISOString(),
    questionnaire_id: 'b2222222-2222-2222-2222-222222222222', // Pesquisa de Clima
    department_id: null,
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // +30 days
    status: 'active',
    organization_id: profile.organization_id,
  };

  console.log('   Payload:', JSON.stringify(payload, null, 2));

  const { data: insertData, error: insertError } = await supabase
    .from('assessments')
    .insert(payload)
    .select()
    .single();

  if (insertError) {
    console.error('❌ Insert error:', insertError.message);
    console.error('   Code:', insertError.code);
    console.error('   Details:', insertError.details);
    console.error('   Hint:', insertError.hint);
  } else {
    console.log('✅ Assessment criado!');
    console.log('   ID:', insertData.id);
    console.log('   Title:', insertData.title);
  }

  await supabase.auth.signOut();
}

testInsert().catch(console.error);
