import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://btaqtllwqfzxkrcmaskh.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ0YXF0bGx3cWZ6eGtyY21hc2toIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM0MTIzMjIsImV4cCI6MjA3ODk4ODMyMn0.jCwaw15gtJphwDxeCMOUycSiE8G8aV4qRlH-wceBDpg';

async function checkRole() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  // Login
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'admin@sollar.com.br',
    password: 'AdminPassword123!'
  });

  if (authError) {
    console.error('Auth error:', authError.message);
    return;
  }

  console.log('✅ Autenticado como:', authData.user.email);
  console.log('   User ID:', authData.user.id);

  // Get profile
  const { data: profile, error: profileError } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', authData.user.id)
    .single();

  if (profileError) {
    console.error('Profile error:', profileError.message);
    return;
  }

  console.log('\n📋 Profile:');
  console.log('   Role:', profile.role);
  console.log('   Role type:', typeof profile.role);
  console.log('   Role bytes:', [...profile.role].map(c => c.charCodeAt(0)));
  console.log('   Full name:', profile.full_name);
  console.log('   Organization ID:', profile.organization_id);

  // Check role matching
  const roles = ["admin", "manager", "Responsável", "responsavel"];
  console.log('\n🔍 Role Check:');
  for (const r of roles) {
    console.log(`   "${r}" === "${profile.role}": ${r === profile.role}`);
  }

  console.log('\n   includes() result:', roles.includes(profile.role));

  await supabase.auth.signOut();
}

checkRole().catch(console.error);
